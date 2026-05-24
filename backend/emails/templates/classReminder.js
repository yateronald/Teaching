const { baseHtml, detailCard, ctaButton, escapeHtml } = require('./base');

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
}) {
    const safeStudent = studentName || 'there';
    const safeClass = className || 'your class';

    const subject = `Starting soon: ${safeClass}`;
    const preheader = `${safeClass} starts in 5 minutes.`;

    const dateStr = safeFormatDate(date);
    const start = safeFormatTime(startTime);
    const end = safeFormatTime(endTime);
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
        { label: 'Date', value: dateStr ? escapeHtml(dateStr) : null },
        { label: 'Time', value: timeRange ? escapeHtml(timeRange) : null },
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
