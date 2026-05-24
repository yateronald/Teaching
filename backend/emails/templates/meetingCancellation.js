const { baseHtml, detailCard, infoStrip, escapeHtml } = require('./base');

function safeFormatDate(input) {
    if (!input) return null;
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function safeFormatTime(input) {
    if (!input) return null;
    let t;
    if (input instanceof Date) {
        t = input;
    } else if (typeof input === 'string' && input.includes('T')) {
        t = new Date(input);
    } else if (typeof input === 'string') {
        t = new Date(`2000-01-01T${input}`);
    } else {
        return null;
    }
    if (isNaN(t.getTime())) return String(input);
    return t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Notification sent when a teacher cancels a scheduled class.
 *
 * @param {{
 *   studentName?: string,
 *   meetingTitle?: string,
 *   teacherName?: string,
 *   batchName?: string,
 *   originalDate?: string|Date,
 *   originalStartTime?: string|Date,
 *   originalEndTime?: string|Date,
 *   locationMode?: string,
 *   location?: string,
 *   link?: string,
 *   reason?: string,
 * }} args
 */
function buildMeetingCancellationTemplate({
    studentName,
    meetingTitle,
    teacherName,
    batchName,
    originalDate,
    originalStartTime,
    originalEndTime,
    locationMode,
    location,
    link,
    reason,
}) {
    const safeStudent = studentName || 'there';
    const safeMeeting = meetingTitle || 'Your class';

    const subject = `Class cancelled: ${safeMeeting}`;
    const preheader = `${safeMeeting} has been cancelled.`;

    const dateStr = safeFormatDate(originalDate);
    const start = safeFormatTime(originalStartTime);
    const end = safeFormatTime(originalEndTime);
    const timeRange = start && end ? `${start} – ${end}` : (start || end || null);

    let locationValue = null;
    if (locationMode === 'online') {
        locationValue = 'Online';
    } else if (locationMode === 'physical' && location) {
        locationValue = escapeHtml(location);
    } else if (location) {
        locationValue = escapeHtml(location);
    }

    const detailRows = [
        { label: 'Class', value: escapeHtml(safeMeeting) },
        { label: 'Batch', value: batchName ? escapeHtml(batchName) : null },
        { label: 'Teacher', value: teacherName ? escapeHtml(teacherName) : null },
        { label: 'Date', value: dateStr ? escapeHtml(dateStr) : null },
        { label: 'Time', value: timeRange ? escapeHtml(timeRange) : null },
        { label: 'Location', value: locationValue },
    ];

    const reasonStrip = reason
        ? infoStrip({ tone: 'warn', text: 'Reason: ' + escapeHtml(reason) })
        : '';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeStudent)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        ${teacherName
            ? `Your teacher <strong style="color:#0f172a;">${escapeHtml(teacherName)}</strong> has cancelled the following session.`
            : 'The following session has been cancelled.'} Sorry for the inconvenience.
      </p>

      ${detailCard({ title: 'Cancelled session', rows: detailRows })}

      ${reasonStrip}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        Your teacher will share the rescheduled date soon.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'CLASS CANCELLED',
        title: 'A class has been cancelled',
        bodyHtml,
    });

    const text = [
        `Hi ${safeStudent},`,
        '',
        teacherName
            ? `Your teacher ${teacherName} has cancelled the following session.`
            : 'The following session has been cancelled.',
        '',
        'CANCELLED SESSION',
        ...detailRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
        '',
        reason ? `Reason: ${reason}` : '',
        '',
        'Your teacher will share the rescheduled date soon.',
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildMeetingCancellationTemplate };
