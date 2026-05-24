/**
 * Notification Service
 *
 * Helpers for creating in-app notifications. All trigger callsites should
 * go through this service so a notification failure never blocks the
 * underlying business action (publishing a quiz, uploading a resource, etc.).
 *
 * Schema (see migrations/013_notifications.sql):
 *   user_id, type, title, message, link, entity_type, entity_id, sender_id
 *
 * Type values:
 *   'quiz_published'    — student: new quiz available
 *   'resource_uploaded' — student: teacher uploaded resource
 *   'schedule_created'  — student: batch timetable created/updated
 *   'batch_assigned'    — student: added to a batch
 *   'demo_assigned'     — teacher: admin assigned a demo
 */

/**
 * Create a single notification.
 * @param {Object} db    req.db (PostgreSQL adapter with .run / .get / .all)
 * @param {Object} opts  { user_id, type, title, message, link, entity_type, entity_id, sender_id }
 * @returns {Promise<Object|null>} insert result or null on failure / missing fields
 */
async function createNotification(db, opts) {
    if (!opts || !opts.user_id || !opts.type || !opts.title || !opts.message) {
        console.warn('[notificationService] Missing required fields, skipping:', opts);
        return null;
    }
    try {
        const result = await db.run(
            `INSERT INTO notifications
                (user_id, type, title, message, link, entity_type, entity_id, sender_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [
                Number(opts.user_id),
                String(opts.type).slice(0, 40),
                String(opts.title).slice(0, 255),
                String(opts.message),
                opts.link ? String(opts.link).slice(0, 500) : null,
                opts.entity_type ? String(opts.entity_type).slice(0, 40) : null,
                opts.entity_id != null ? Number(opts.entity_id) : null,
                opts.sender_id != null ? Number(opts.sender_id) : null,
            ]
        );
        return result;
    } catch (err) {
        console.error('[notificationService] Failed to insert notification:', err.message);
        return null;
    }
}

/**
 * Bulk-create the same notification for many users (e.g. all students in a batch).
 * Skips the sender to avoid notifying a teacher about their own action.
 * @returns {Promise<number>} count of inserted notifications
 */
async function createBulkNotifications(db, userIds, opts) {
    if (!Array.isArray(userIds) || userIds.length === 0) return 0;
    const senderId = opts && opts.sender_id != null ? Number(opts.sender_id) : null;
    const uniqueIds = [...new Set(
        userIds
            .map(Number)
            .filter(id => Number.isFinite(id) && id > 0 && id !== senderId)
    )];
    let count = 0;
    for (const uid of uniqueIds) {
        const ok = await createNotification(db, { ...opts, user_id: uid });
        if (ok) count++;
    }
    return count;
}

/**
 * Get distinct student ids from a list of batch ids.
 * Returns deduplicated array of student IDs.
 */
async function getStudentsInBatches(db, batchIds) {
    if (!Array.isArray(batchIds) || batchIds.length === 0) return [];
    const cleanIds = [...new Set(
        batchIds
            .map(Number)
            .filter(id => Number.isFinite(id) && id > 0)
    )];
    if (cleanIds.length === 0) return [];
    const placeholders = cleanIds.map((_, i) => `$${i + 1}`).join(',');
    const rows = await db.all(
        `SELECT DISTINCT student_id FROM batch_students WHERE batch_id IN (${placeholders})`,
        cleanIds
    );
    return rows.map(r => r.student_id);
}

module.exports = {
    createNotification,
    createBulkNotifications,
    getStudentsInBatches,
};
