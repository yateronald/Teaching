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
}) {
    const safeStudent = studentName || 'there';
    const safeClass = className || 'New Class';
    const safeTeacher = teacherName || null;
    const safeBatch = batchName || null;

    const subject = `New class scheduled: ${safeClass}`;
    const preheader = safeTeacher
        ? `${safeTeacher} just scheduled "${safeClass}" for your batch.`
        : `A new class has been scheduled for your batch.`;

    const formattedDate = safeFormatDate(date);
    const start = safeFormatTime(startTime);
    const end = safeFormatTime(endTime);
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
        { label: 'Date', value: formattedDate ? escapeHtml(formattedDate) : null },
        { label: 'Time', value: timeRange ? escapeHtml(timeRange) : null },
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
