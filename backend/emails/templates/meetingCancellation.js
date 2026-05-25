const { baseHtml, detailCard, infoStrip, escapeHtml, formatRecipientTime } = require('./base');

/**
 * Combine a date input with a time input. See classScheduleNotification for
 * the full contract — same helper duplicated locally.
 */
function combineDateAndTime(date, time) {
    if (!date && !time) return null;
    if (typeof time === 'string' && time.includes('T')) {
        const d = new Date(time);
        return isNaN(d.getTime()) ? null : d;
    }
    if (time instanceof Date && !isNaN(time.getTime())) return time;
    if (!date) return null;
    let datePart;
    if (date instanceof Date) {
        if (isNaN(date.getTime())) return null;
        datePart = date.toISOString().slice(0, 10);
    } else if (typeof date === 'string') {
        datePart = date.includes('T') ? date.slice(0, 10) : date;
    } else {
        return null;
    }
    if (!time) {
        const d = new Date(`${datePart}T00:00:00Z`);
        return isNaN(d.getTime()) ? null : d;
    }
    let timePart = typeof time === 'string' ? time : '';
    if (!timePart) return null;
    if (/^\d{1,2}:\d{2}$/.test(timePart)) timePart += ':00';
    const d = new Date(`${datePart}T${timePart}Z`);
    return isNaN(d.getTime()) ? null : d;
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
 *   recipientTimezone?: string,
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
    recipientTimezone,
}) {
    const safeStudent = studentName || 'there';
    const safeMeeting = meetingTitle || 'Your class';
    const tz = recipientTimezone || 'UTC';

    const subject = `Class cancelled: ${safeMeeting}`;
    const preheader = `${safeMeeting} has been cancelled.`;

    const dateOnlyOpts = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: undefined, minute: undefined, hour12: undefined,
    };
    const timeOnlyOpts = {
        weekday: undefined, year: undefined, month: undefined, day: undefined,
        hour: 'numeric', minute: '2-digit', hour12: true,
    };

    const startMoment = combineDateAndTime(originalDate, originalStartTime);
    const endMoment = combineDateAndTime(originalDate, originalEndTime);

    const dateStr = startMoment
        ? formatRecipientTime(startMoment, tz, dateOnlyOpts)
        : formatRecipientTime(originalDate, tz, dateOnlyOpts);
    const start = startMoment ? formatRecipientTime(startMoment, tz, timeOnlyOpts) : '';
    const end = endMoment ? formatRecipientTime(endMoment, tz, timeOnlyOpts) : '';
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
        { label: `Date (${tz})`, value: dateStr ? escapeHtml(dateStr) : null },
        { label: `Time (${tz})`, value: timeRange ? escapeHtml(timeRange) : null },
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
