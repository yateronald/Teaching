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
 * Notification sent when a teacher updates the details of an upcoming class.
 *
 * @param {{
 *   studentName?: string,
 *   meetingTitle?: string,
 *   teacherName?: string,
 *   batchName?: string,
 *   date?: string|Date,
 *   startTime?: string|Date,
 *   endTime?: string|Date,
 *   locationMode?: string,
 *   location?: string,
 *   link?: string,
 *   description?: string,
 *   changes?: string[],
 * }} args
 */
function buildMeetingUpdateTemplate({
    studentName,
    meetingTitle,
    teacherName,
    batchName,
    date,
    startTime,
    endTime,
    locationMode,
    location,
    link,
    description,
    changes,
}) {
    const safeStudent = studentName || 'there';
    const safeMeeting = meetingTitle || 'Your class';

    const subject = `Class updated: ${safeMeeting}`;
    const preheader = `${safeMeeting} has new details. Take a look.`;

    const dateStr = safeFormatDate(date);
    const start = safeFormatTime(startTime);
    const end = safeFormatTime(endTime);
    const timeRange = start && end ? `${start} – ${end}` : (start || end || null);

    let locationValue = null;
    if (locationMode === 'online' && link) {
        locationValue = `Online — <a href="${escapeHtml(link)}" style="color:#4338ca; font-weight:600; text-decoration:none;">join</a>`;
    } else if (locationMode === 'online') {
        locationValue = 'Online (link will be shared before class)';
    } else if (locationMode === 'physical' && location) {
        locationValue = escapeHtml(location);
    } else if (locationMode === 'physical') {
        locationValue = 'In-person (venue confirmed soon)';
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

    const validChanges = Array.isArray(changes)
        ? changes.filter(c => c !== null && c !== undefined && String(c).trim() !== '')
        : [];

    const changesStrip = validChanges.length > 0
        ? infoStrip({
            tone: 'info',
            text: '<strong style="display:block; margin-bottom:6px;">What changed</strong>'
                + '<ul style="margin:0; padding-left:18px;">'
                + validChanges.map(c => `<li style="margin-bottom:4px;">${escapeHtml(c)}</li>`).join('')
                + '</ul>',
        })
        : '';

    const descriptionBlock = description
        ? `
          <div style="margin: 0 0 22px;">
            <div style="font-size: 11px; font-weight: 700; color: #4338ca; letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 6px;">Notes from your teacher</div>
            <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.65;">${escapeHtml(description)}</p>
          </div>
        `
        : '';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeStudent)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        ${teacherName
            ? `Your teacher <strong style="color:#0f172a;">${escapeHtml(teacherName)}</strong> updated the details for this class.`
            : 'The details for this class have been updated.'} The latest information is below.
      </p>

      ${detailCard({ title: 'Updated class details', rows: detailRows })}

      ${changesStrip}

      ${descriptionBlock}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        Reply to this email if anything still looks off.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'CLASS UPDATE',
        title: 'Your class details have changed',
        bodyHtml,
    });

    const textLines = [
        `Hi ${safeStudent},`,
        '',
        teacherName
            ? `Your teacher ${teacherName} updated the details for this class.`
            : 'The details for this class have been updated.',
        '',
        'UPDATED CLASS DETAILS',
        ...detailRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
    ];
    if (validChanges.length > 0) {
        textLines.push('', 'What changed:');
        validChanges.forEach(c => textLines.push(`- ${c}`));
    }
    if (description) {
        textLines.push('', `Notes from your teacher:\n${description}`);
    }
    const text = textLines.filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildMeetingUpdateTemplate };
