const { baseHtml, detailCard, ctaButton, escapeHtml, formatRecipientTime } = require('./base');

/**
 * Email sent to a student when their demo class has been scheduled.
 *
 * @param {{
 *   studentName?: string,
 *   teacherName?: string,
 *   teacherEmail?: string,
 *   demoDate?: string|Date,
 *   demoTime?: string|Date,
 *   meetingLink?: string,
 *   notes?: string,
 *   recipientTimezone?: string,
 * }} args
 */
function buildDemoScheduleStudentTemplate({
    studentName,
    teacherName,
    teacherEmail,
    demoDate,
    demoTime,
    meetingLink,
    notes,
    recipientTimezone,
}) {
    const safeStudent = studentName || 'there';
    const tz = recipientTimezone || 'UTC';

    const subject = 'Your demo class is scheduled';
    const preheader = teacherName
        ? `${teacherName} will run your demo class.`
        : 'Your demo class details are inside.';

    // demoDate is expected to be a full ISO timestamp (with time). demoTime is
    // accepted as a fallback for older callers.
    const moment = demoDate || demoTime || null;
    const whenStr = formatRecipientTime(moment, tz);

    const detailRows = [
        { label: 'Teacher', value: teacherName ? escapeHtml(teacherName) : null },
        { label: 'Teacher email', value: teacherEmail ? escapeHtml(teacherEmail) : null },
        { label: `Date & time (${tz})`, value: whenStr ? escapeHtml(whenStr) : null },
    ];

    const cta = meetingLink
        ? ctaButton({ label: 'Join demo', href: meetingLink })
        : '';

    const notesCard = notes
        ? detailCard({ title: "Teacher's note", rows: [{ label: 'Note', value: escapeHtml(notes) }] })
        : '';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeStudent)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        Your French demo class is confirmed. We'll use this session to assess your level, share how we teach, and answer any questions you have.
      </p>

      ${detailCard({ title: 'Demo details', rows: detailRows })}

      ${cta}

      ${notesCard}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        À très bientôt 🇫🇷
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'DEMO CLASS',
        title: 'Your demo class is scheduled',
        bodyHtml,
    });

    const textLines = [
        `Hi ${safeStudent},`,
        '',
        "Your French demo class is confirmed. We'll use this session to assess your level, share how we teach, and answer any questions you have.",
        '',
        'DEMO DETAILS',
        ...detailRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
    ];
    if (meetingLink) textLines.push('', `Join demo: ${meetingLink}`);
    if (notes) textLines.push('', `Teacher's note: ${notes}`);
    const text = textLines.filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildDemoScheduleStudentTemplate };
