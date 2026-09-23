package com.learnfrenchwithnatives.mobile

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.graphics.drawable.Icon
import android.os.Build
import android.os.IBinder
import android.util.Log

/**
 * Keeps a live class running while the app is not on screen: screen locked,
 * another app opened, picture-in-picture window closed.
 *
 * It is also the foreground service Android requires for screen sharing. The
 * media-projection type is added to this already-running service once the
 * user accepts the capture prompt. Starting a separate service at that moment
 * does not work on phones: the system app picker has already sent the app to
 * the background, and Android refuses to start foreground services from the
 * background. A service that is already in the foreground may change its types.
 */
class MeetingForegroundService : Service() {
    companion object {
        private const val TAG = "MeetingService"
        private const val CHANNEL_ID = "live_class"
        private const val OLD_CHANNEL_ID = "ongoing_meeting"
        private const val NOTIFICATION_ID = 2401

        const val EXTRA_MICROPHONE = "microphone"
        const val EXTRA_CAMERA = "camera"
        const val EXTRA_LABELS = "labels"
        const val ACTION_LEAVE = "com.learnfrenchwithnatives.mobile.action.LEAVE_CLASS"

        /** The running service. Only read and written on the main thread. */
        var instance: MeetingForegroundService? = null
            private set

        /** Forwards the notification's "Leave" button to the class screen. */
        var onLeaveRequested: (() -> Unit)? = null
    }

    /** Notification texts, supplied by Flutter in the user's language. */
    data class Labels(
        val title: String = "Live class in progress",
        val text: String = "Tap to return to your class",
        val presentingTitle: String = "You are presenting",
        val presentingText: String = "Your screen is shared with the class",
        val leave: String = "Leave",
    ) {
        companion object {
            fun from(values: Map<*, *>?): Labels? {
                if (values == null) return null
                val defaults = Labels()
                fun text(key: String, fallback: String) =
                    (values[key] as? String)?.takeIf { it.isNotBlank() } ?: fallback
                return Labels(
                    title = text("title", defaults.title),
                    text = text("text", defaults.text),
                    presentingTitle = text("presentingTitle", defaults.presentingTitle),
                    presentingText = text("presentingText", defaults.presentingText),
                    leave = text("leave", defaults.leave),
                )
            }
        }
    }

    private var microphone = false
    private var camera = false
    private var projection = false
    private var inForeground = false
    private var labels = Labels()
    private val startedAt = System.currentTimeMillis()

    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_LEAVE) {
            val leave = onLeaveRequested
            if (leave != null) leave() else stopSelf()
            return START_NOT_STICKY
        }
        if (intent != null) {
            microphone = intent.getBooleanExtra(EXTRA_MICROPHONE, microphone)
            camera = intent.getBooleanExtra(EXTRA_CAMERA, camera)
            @Suppress("DEPRECATION")
            Labels.from(intent.getSerializableExtra(EXTRA_LABELS) as? Map<*, *>)?.let { labels = it }
        }
        promote()
        return START_NOT_STICKY
    }

    /** Updates the capabilities of the class. Returns false if Android refused them. */
    fun configure(microphone: Boolean, camera: Boolean, labels: Labels?): Boolean {
        this.microphone = microphone
        this.camera = camera
        if (labels != null) this.labels = labels
        return promote()
    }

    /**
     * Adds or removes the media-projection type. Must be called after the user
     * accepted the capture prompt and before the capture starts.
     */
    fun setProjection(active: Boolean): Boolean {
        projection = active
        val applied = promote()
        if (active && !applied) {
            projection = false
            promote()
        }
        return applied
    }

    private fun promote(): Boolean {
        val notification = buildNotification()
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification)
            inForeground = true
            return true
        }

        val playback = ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
        val capture = if (projection) ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION else 0
        var media = 0
        if (microphone && granted(Manifest.permission.RECORD_AUDIO)) {
            media = media or ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
        }
        if (camera && granted(Manifest.permission.CAMERA)) {
            media = media or ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA
        }

        // Most specific first. A revoked camera or microphone permission must
        // not cost the class its keep-alive or the presenter their share.
        val attempts = listOf(playback or media or capture, playback or capture, playback).distinct()
        for (types in attempts) {
            try {
                startForeground(NOTIFICATION_ID, notification, types)
                inForeground = true
                return !projection || types and ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION != 0
            } catch (error: Exception) {
                Log.w(TAG, "Android refused foreground service types $types", error)
            }
        }
        // startForegroundService() must be followed by startForeground(); a
        // service that never got there has to go before Android kills the app.
        if (!inForeground) stopSelf()
        return false
    }

    private fun granted(permission: String) =
        checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED

    private fun buildNotification(): Notification {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(NotificationManager::class.java)
            if (manager.getNotificationChannel(CHANNEL_ID) == null) {
                // Default importance keeps the class near the top of the shade
                // (a low-importance one is folded under "Silent"); no sound.
                manager.createNotificationChannel(
                    NotificationChannel(CHANNEL_ID, "Live class", NotificationManager.IMPORTANCE_DEFAULT).apply {
                        setSound(null, null)
                        enableVibration(false)
                        setShowBadge(false)
                    },
                )
                manager.deleteNotificationChannel(OLD_CHANNEL_ID)
            }
        }

        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val openPending = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val leavePending = PendingIntent.getService(
            this,
            1,
            Intent(this, MeetingForegroundService::class.java).setAction(ACTION_LEAVE),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        @Suppress("DEPRECATION")
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            Notification.Builder(this).setPriority(Notification.PRIORITY_LOW)
        }
        builder
            .setSmallIcon(R.drawable.ic_stat_live_class)
            .setColor(0xFF10B981.toInt())
            .setContentTitle(if (projection) labels.presentingTitle else labels.title)
            .setContentText(if (projection) labels.presentingText else labels.text)
            .setContentIntent(openPending)
            .setCategory(Notification.CATEGORY_CALL)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(true)
            .setWhen(startedAt)
            .setUsesChronometer(true)
            .addAction(
                Notification.Action.Builder(
                    Icon.createWithResource(this, R.drawable.ic_pip_leave),
                    labels.leave,
                    leavePending,
                ).build(),
            )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            builder.setForegroundServiceBehavior(Notification.FOREGROUND_SERVICE_IMMEDIATE)
        }
        return builder.build()
    }

    override fun onDestroy() {
        if (instance === this) instance = null
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        super.onDestroy()
    }
}
