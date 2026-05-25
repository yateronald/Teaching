const { baseHtml, detailCard, infoStrip, escapeHtml, formatRecipientTime } = require('./base');

/**
 * Combine a date input with a time input (or extract a Date from a single
 * ISO string). Returns a Date or null. The fields can be:
 *   - date:  a Date | "YYYY-MM-DD" | full ISO string
 *   - time:  a Date | "HH:mm[:ss]" | full ISO string
 * If `time` already includes a date (full ISO), it is used as-is.
 */
function combineDateAndTime(date, time) {
    if (!date && !time) return null;
    // If time looks like a full ISO timestamp, just use it.
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
        // If full ISO, take just the date portion.
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
    // Normalise to HH:mm:ss
    if (/^\d{1,2}:\d{2}$/.test(timePart)) timePart += ':00';
    const d = new Date(`${datePart}T${timePart}Z`);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Notification sent to a student when a teacher publishes a new class.
 *
 * @param {{
 *   studentName?: string,
 *   className?: string,
 *   teacherName?: string,
 *   batchName?: string,
 *   frenchLevel?: string,
 *   startTime?: string|Date,
 *   endTime?: string|Date,
 *   date?: string|Date,
 *   location?: string,
 *   locationMode?: string,
 *   link?: string,
 *   description?: string,
 *   recipientTimezone?: string,
 * }} args
 */
function buildClassScheduleNotificationTemplate({
    studentName,
    className,
    teacherName,
    batchName,
    frenchLevel,
    startTime,
    endTime,
    date,
    location,
    locationMode,
    link,
    description,
    recipientTimezone,
}) {
    const safeStudent = studentName || 'there';
    const safeClass = className || 'New Class';
    const safeTeacher = teacherName || null;
    const safeBatch = batchName || null;
    const tz = recipientTimezone || 'UTC';

    const subject = `New class scheduled: ${safeClass}`;
    const preheader = safeTeacher
        ? `${safeTeacher} just scheduled "${safeClass}" for your batch.`
        : `A new class has been scheduled for your batch.`;

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

    const formattedDate = startMoment
        ? formatRecipientTime(startMoment, tz, dateOnlyOpts)
        : formatRecipientTime(date, tz, dateOnlyOpts);
    const start = startMoment ? formatRecipientTime(startMoment, tz, timeOnlyOpts) : '';
    const end = endMoment ? formatRecipientTime(endMoment, tz, timeOnlyOpts) : '';
    const timeRange = start && end ? `${start} – ${end}` : (start || end || null);

    let locationValue = null;
    if (locationMode === 'online') {
        locationValue = link
            ? `Online — <a href="${escapeHtml(link)}" style="color:#4338ca; text-decoration:none; font-weight:600;">join link</a>`
            : 'Online (link will be shared before class)';
    } else if (location) {
        locationValue = `In-person — ${escapeHtml(location)}`;
    } else if (locationMode === 'physical') {
        locationValue = 'In-person (venue confirmed soon)';
    }

    const detailRows = [
        { label: 'Class', value: escapeHtml(safeClass) },
        { label: 'Batch', value: safeBatch ? escapeHtml(safeBatch) : null },
        { label: 'Level', value: frenchLevel ? escapeHtml(frenchLevel) : null },
        { label: 'Teacher', value: safeTeacher ? escapeHtml(safeTeacher) : null },
        { label: `Date (${tz})`, value: formattedDate ? escapeHtml(formattedDate) : null },
        { label: `Time (${tz})`, value: timeRange ? escapeHtml(timeRange) : null },
        { label: 'Location', value: locationValue },
    ];

    const intro = safeTeacher && safeBatch
        ? `Your teacher <strong style="color:#0f172a;">${escapeHtml(safeTeacher)}</strong> has scheduled a new class for <strong style="color:#0f172a;">${escapeHtml(safeBatch)}</strong>.`
        : safeTeacher
            ? `Your teacher <strong style="color:#0f172a;">${escapeHtml(safeTeacher)}</strong> has scheduled a new class.`
            : `A new class has been added to your schedule.`;

    const bodyHtml = `
      <p style="margin: 0 0 14px; font-size: 15px; color: #0f172a;">
        Hi <strong>${escapeHtml(safeStudent)}</strong>,
      </p>
      <p style="margin: 0 0 22px; font-size: 14.5px; color: #475569; line-height: 1.65;">
        ${intro} The full details are below.
      </p>

      ${detailCard({ title: 'Class details', rows: detailRows })}

      ${description ? `
        <div style="margin: 0 0 22px;">
          <div style="font-size: 11px; font-weight: 700; color: #4338ca; letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 6px;">What to expect</div>
          <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.65;">${escapeHtml(description)}</p>
        </div>
      ` : ''}

      ${infoStrip({
          tone: 'muted',
          text: `You'll get a reminder 5 minutes before class starts. Make sure your materials are ready.`,
      })}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        Questions about this class? Reach out to your teacher or our support team.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'CLASS SCHEDULE',
        title: 'New class scheduled',
        bodyHtml,
    });

    const text = [
        `Hi ${safeStudent},`,
        '',
        intro.replace(/<[^>]+>/g, ''),
        '',
        'CLASS DETAILS',
        ...detailRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
        '',
        description ? `What to expect:\n${description}` : '',
        '',
        `You'll get a reminder 5 minutes before class starts.`,
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildClassScheduleNotificationTemplate };
