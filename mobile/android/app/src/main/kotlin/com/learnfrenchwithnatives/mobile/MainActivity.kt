package com.learnfrenchwithnatives.mobile

import android.annotation.TargetApi
import android.app.PendingIntent
import android.app.PictureInPictureParams
import android.app.RemoteAction
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.drawable.Icon
import android.os.Build
import android.os.Bundle
import android.util.Rational
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.lang.ref.WeakReference
import java.util.UUID

/**
 * A FragmentActivity because the fingerprint prompt (local_auth) needs one.
 */
class MainActivity : FlutterFragmentActivity() {
    companion object {
        private const val SERVICE_CHANNEL = "learnfrenchwithnatives/meeting_service"
        private const val PIP_CHANNEL = "learnfrenchwithnatives/pip"
        private const val ACTION_PIP_CONTROL = "com.learnfrenchwithnatives.mobile.action.PIP_CONTROL"
        private const val EXTRA_CONTROL = "control"
        private const val EXTRA_TOKEN = "token"

        /**
         * The app's Flutter engine, owned here rather than by the activity so
         * a class survives Android destroying the activity (closing the
         * picture-in-picture window, swiping the app away). The next activity,
         * opened from the class notification, reattaches to it. It is
         * destroyed when the app is really closed with no class running.
         */
        private var sharedEngine: FlutterEngine? = null

        /** The activity whose handler currently serves the picture-in-picture channel. */
        private var pipOwner: WeakReference<MainActivity>? = null

        /** Proves that a picture-in-picture control broadcast came from this process. */
        private val controlToken = UUID.randomUUID().toString()
    }

    private var pipChannel: MethodChannel? = null
    private var receiverRegistered = false

    // Picture-in-picture state, pushed by Flutter while a class is open.
    private var pipAllowed = false
    private var pipAspect = Rational(16, 9)
    private var pipMicOn = true
    private var pipCamOn = true
    private var pipLabels: Map<*, *> = emptyMap<String, String>()

    private val pipControlReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action != ACTION_PIP_CONTROL) return
            if (intent.getStringExtra(EXTRA_TOKEN) != controlToken) return
            val control = intent.getStringExtra(EXTRA_CONTROL) ?: return
            pipChannel?.invokeMethod("pipAction", control)
        }
    }

    override fun provideFlutterEngine(context: Context): FlutterEngine =
        sharedEngine ?: FlutterEngine(context.applicationContext).also { sharedEngine = it }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val filter = IntentFilter(ACTION_PIP_CONTROL)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(pipControlReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("UnspecifiedRegisterReceiverFlag")
            registerReceiver(pipControlReceiver, filter)
        }
        receiverRegistered = true
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        val messenger = flutterEngine.dartExecutor.binaryMessenger
        configureServiceChannel(MethodChannel(messenger, SERVICE_CHANNEL))

        val channel = MethodChannel(messenger, PIP_CHANNEL)
        pipChannel = channel
        pipOwner = WeakReference(this)
        channel.setMethodCallHandler { call, result ->
            when (call.method) {
                "isSupported" -> result.success(pipSupported())
                "isActive" -> result.success(
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && isInPictureInPictureMode,
                )
                "configure" -> {
                    pipAllowed = call.argument<Boolean>("enabled") == true
                    val width = (call.argument<Int>("aspectWidth") ?: 16).coerceAtLeast(1)
                    val height = (call.argument<Int>("aspectHeight") ?: 9).coerceAtLeast(1)
                    pipAspect = Rational(width, height)
                    pipMicOn = call.argument<Boolean>("micOn") ?: pipMicOn
                    pipCamOn = call.argument<Boolean>("camOn") ?: pipCamOn
                    call.argument<Map<*, *>>("labels")?.let { pipLabels = it }
                    applyPipParams()
                    result.success(null)
                }
                "enter" -> result.success(enterPip())
                "dismiss" -> {
                    // The class ended inside the floating window: close it
                    // rather than leave the app list shrunk in a corner.
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && isInPictureInPictureMode) {
                        moveTaskToBack(false)
                    }
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }
    }

    /** Service, screen-share and notification bridge. Works without an activity. */
    private fun configureServiceChannel(channel: MethodChannel) {
        val appContext = applicationContext
        channel.setMethodCallHandler { call, result ->
            try {
                when (call.method) {
                    "start" -> {
                        val microphone = call.argument<Boolean>("microphone") == true
                        val camera = call.argument<Boolean>("camera") == true
                        val labels = call.argument<Map<*, *>>("labels")
                        val running = MeetingForegroundService.instance
                        if (running != null) {
                            result.success(
                                running.configure(microphone, camera, MeetingForegroundService.Labels.from(labels)),
                            )
                        } else {
                            val intent = Intent(appContext, MeetingForegroundService::class.java).apply {
                                putExtra(MeetingForegroundService.EXTRA_MICROPHONE, microphone)
                                putExtra(MeetingForegroundService.EXTRA_CAMERA, camera)
                                if (labels != null) {
                                    putExtra(MeetingForegroundService.EXTRA_LABELS, HashMap(labels))
                                }
                            }
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                appContext.startForegroundService(intent)
                            } else {
                                appContext.startService(intent)
                            }
                            result.success(true)
                        }
                    }
                    "isRunning" -> result.success(MeetingForegroundService.instance != null)
                    "setProjection" -> {
                        val active = call.argument<Boolean>("active") == true
                        val running = MeetingForegroundService.instance
                        result.success(running?.setProjection(active) ?: !active)
                    }
                    "stop" -> {
                        appContext.stopService(Intent(appContext, MeetingForegroundService::class.java))
                        result.success(null)
                    }
                    else -> result.notImplemented()
                }
            } catch (error: Exception) {
                result.error("meeting_service", error.message, null)
            }
        }
        MeetingForegroundService.onLeaveRequested = {
            channel.invokeMethod(
                "leaveRequested",
                null,
                object : MethodChannel.Result {
                    override fun success(value: Any?) {}

                    override fun error(code: String, message: String?, details: Any?) = stopClassService()

                    override fun notImplemented() = stopClassService()

                    private fun stopClassService() {
                        appContext.stopService(Intent(appContext, MeetingForegroundService::class.java))
                    }
                },
            )
        }
    }

    private fun pipSupported(): Boolean =
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)

    @TargetApi(Build.VERSION_CODES.O)
    private fun pipParams(): PictureInPictureParams {
        val builder = PictureInPictureParams.Builder()
            .setAspectRatio(pipAspect)
            .setActions(pipActions())
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            builder.setAutoEnterEnabled(pipAllowed)
            // Video content: a seamless crossfade resize looks broken here.
            builder.setSeamlessResizeEnabled(false)
        }
        return builder.build()
    }

    @TargetApi(Build.VERSION_CODES.O)
    private fun pipActions(): List<RemoteAction> {
        val mic = pipAction(
            "toggleMic",
            if (pipMicOn) R.drawable.ic_pip_mic_on else R.drawable.ic_pip_mic_off,
            label(if (pipMicOn) "micOff" else "micOn", if (pipMicOn) "Mute" else "Unmute"),
            10,
        )
        val camera = pipAction(
            "toggleCam",
            if (pipCamOn) R.drawable.ic_pip_cam_on else R.drawable.ic_pip_cam_off,
            label(if (pipCamOn) "camOff" else "camOn", if (pipCamOn) "Turn camera off" else "Turn camera on"),
            11,
        )
        val leave = pipAction("leave", R.drawable.ic_pip_leave, label("leave", "Leave"), 12)
        val limit = maxNumPictureInPictureActions
        return when {
            limit >= 3 -> listOf(mic, camera, leave)
            limit == 2 -> listOf(mic, leave)
            limit == 1 -> listOf(mic)
            else -> emptyList()
        }
    }

    private fun label(key: String, fallback: String) =
        (pipLabels[key] as? String)?.takeIf { it.isNotBlank() } ?: fallback

    @TargetApi(Build.VERSION_CODES.O)
    private fun pipAction(control: String, icon: Int, title: String, requestCode: Int): RemoteAction {
        val intent = Intent(ACTION_PIP_CONTROL)
            .setPackage(packageName)
            .putExtra(EXTRA_CONTROL, control)
            .putExtra(EXTRA_TOKEN, controlToken)
        val pending = PendingIntent.getBroadcast(
            this,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return RemoteAction(Icon.createWithResource(this, icon), title, title, pending)
    }

    private fun applyPipParams() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || !pipSupported()) return
        try {
            setPictureInPictureParams(pipParams())
        } catch (_: Exception) {
            // The window may be closing or PiP is disabled for this app.
        }
    }

    private fun enterPip(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || !pipSupported() || isFinishing) return false
        return try {
            enterPictureInPictureMode(pipParams())
        } catch (_: Exception) {
            false
        }
    }

    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        // Android 12+ enters picture-in-picture by itself (auto-enter).
        if (pipAllowed && Build.VERSION.SDK_INT < Build.VERSION_CODES.S) enterPip()
    }

    override fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean, newConfig: Configuration) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
        pipChannel?.invokeMethod("pipChanged", isInPictureInPictureMode)
    }

    override fun onDestroy() {
        if (receiverRegistered) {
            try {
                unregisterReceiver(pipControlReceiver)
            } catch (_: Exception) {
            }
            receiverRegistered = false
        }
        if (pipOwner?.get() === this) {
            pipChannel?.setMethodCallHandler(null)
            pipOwner = null
        }
        pipChannel = null
        super.onDestroy()
        // Closed for good with no class running: release the engine, so the
        // next launch starts fresh, as it always did.
        if (isFinishing && !isChangingConfigurations && MeetingForegroundService.instance == null) {
            sharedEngine?.destroy()
            sharedEngine = null
        }
    }
}
