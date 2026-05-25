const { baseHtml, detailCard, ctaButton, escapeHtml, formatRecipientTime } = require('./base');

/**
 * Combine a date input with a time input (or extract a Date from a single
 * ISO string). Returns a Date or null. The fields can be:
 *   - date:  a Date | "YYYY-MM-DD" | full ISO string
 *   - time:  a Date | "HH:mm[:ss]" | full ISO string
 * If `time` already includes a date (full ISO), it is used as-is.
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
 * 5-minute reminder sent to students before a class begins.
 *
 * @param {{
 *   studentName?: string,
 *   className?: string,
 *   teacherName?: string,
 *   batchName?: string,
 *   startTime?: string|Date,
 *   endTime?: string|Date,
 *   date?: string|Date,
 *   location?: string,
 *   locationMode?: string,
 *   link?: string,
 *   recipientTimezone?: string,
 * }} args
 */
function buildClassReminderTemplate({
    studentName,
    className,
    teacherName,
    batchName,
    startTime,
    endTime,
    date,
    location,
    locationMode,
    link,
    recipientTimezone,
}) {
    const safeStudent = studentName || 'there';
    const safeClass = className || 'your class';
    const tz = recipientTimezone || 'UTC';

    const subject = `Starting soon: ${safeClass}`;
    const preheader = `${safeClass} starts in 5 minutes.`;

    const dateOnlyOpts = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: undefined, minute: undefined, hour12: undefined,
    };
    const timeOnlyOpts = {
        weekday: undefined, year: undefined, month: undefined, day: undefined,
        hour: 'numeric', minute: '2-digit', hour12: true,
    };

    const startMoment = combineDateAndTime(date, startTime);
    const endMoment = combineDateAndTime(date, endTime);

    const dateStr = startMoment
        ? formatRecipientTime(startMoment, tz, dateOnlyOpts)
        : formatRecipientTime(date, tz, dateOnlyOpts);
    const start = startMoment ? formatRecipientTime(startMoment, tz, timeOnlyOpts) : '';
    const end = endMoment ? formatRecipientTime(endMoment, tz, timeOnlyOpts) : '';
    const timeRange = start && end ? `${start} – ${end}` : (start || end || null);

    let locationValue = null;
    if (locationMode === 'online' && link) {
        locationValue = `Online — <a href="${escapeHtml(link)}" style="color:#4338ca; font-weight:600; text-decoration:none;">join</a>`;
    } else if (locationMode === 'physical' && location) {
        locationValue = escapeHtml(location);
    } else if (locationMode === 'physical') {
        locationValue = 'In-person (venue confirmed soon)';
    } else {
        locationValue = 'Online (open dashboard to join)';
    }

    const detailRows = [
        { label: 'Class', value: escapeHtml(safeClass) },
        { label: 'Batch', value: batchName ? escapeHtml(batchName) : null },
        { label: 'Teacher', value: teacherName ? escapeHtml(teacherName) : null },
        { label: `Date (${tz})`, value: dateStr ? escapeHtml(dateStr) : null },
        { label: `Time (${tz})`, value: timeRange ? escapeHtml(timeRange) : null },
        { label: 'Location', value: locationValue },
    ];

    const dashboardUrl = (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '');

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeStudent)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        ${teacherName
            ? `Your class with <strong style="color:#0f172a;">${escapeHtml(teacherName)}</strong> begins in 5 minutes.`
            : 'Your class begins in 5 minutes.'} Get your materials ready and head in when you can.
      </p>

      ${detailCard({ title: 'Class details', rows: detailRows })}

      ${ctaButton({ label: 'Open dashboard', href: dashboardUrl })}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        See you in class.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'CLASS REMINDER',
        title: 'Your class starts in 5 minutes',
        bodyHtml,
    });

    const text = [
        `Hi ${safeStudent},`,
        '',
        teacherName
            ? `Your class with ${teacherName} begins in 5 minutes.`
            : 'Your class begins in 5 minutes.',
        '',
        'CLASS DETAILS',
        ...detailRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
        '',
        `Open dashboard: ${dashboardUrl}`,
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildClassReminderTemplate };
