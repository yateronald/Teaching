const { baseHtml, detailCard, ctaButton, infoStrip, escapeHtml, formatRecipientTime, BRAND } = require('./base');

/**
 * Email sent to a student when their demo class has been scheduled via external link.
 * Intentionally avoids exposing personal coordinator names.
 */
function buildDemoScheduleStudentTemplate({
    studentName,
    demoDate,
    demoTime,
    meetingLink,
    notes,
    recipientTimezone,
}) {
    const firstName = String(studentName || '').trim().split(/\s+/)[0] || 'there';
    const tz = recipientTimezone || 'UTC';

    const subject = 'Your French demo session is confirmed';
    const preheader = 'Your French demo session details and join link are inside.';

    const moment = demoDate || demoTime || null;
    const whenStr = formatRecipientTime(moment, tz);

    const detailRows = [
        { label: `Date & time (${tz})`, value: whenStr ? escapeHtml(whenStr) : null },
        { label: 'Instructor', value: 'A native French instructor will host your session' },
    ];

    const cta = meetingLink
        ? ctaButton({ label: 'Join demo session', href: escapeHtml(meetingLink) })
        : '';

    const notesBlock = notes
        ? infoStrip({
            tone: 'muted',
            text: `<strong>Note from our team:</strong> ${escapeHtml(notes)}`,
        })
        : '';

    const bodyHtml = `
      <p style="margin: 0 0 14px; font-size: 15px; color: ${BRAND.text}; line-height: 1.55;">
        Hello ${escapeHtml(firstName)},
      </p>
      <p style="margin: 0 0 22px; font-size: 14.5px; color: ${BRAND.textBody}; line-height: 1.65;">
        Your French demo session is confirmed. An instructor will meet you at the time below to assess your current level, walk through how our classes work, and answer your questions.
      </p>

      ${detailCard({ title: 'Session details', rows: detailRows })}

      ${cta}

      ${notesBlock}

      <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.6;">
        We look forward to speaking with you soon.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'DEMO SESSION CONFIRMED',
        title: 'Your demo session is scheduled',
        bodyHtml,
    });

    const textLines = [
        `Hello ${firstName},`,
        '',
        'Your French demo session is confirmed. An instructor will meet you at the time below.',
        '',
        whenStr ? `Date & time (${tz}): ${whenStr}` : null,
        meetingLink ? `Join link: ${meetingLink}` : null,
        notes ? `Note: ${notes}` : null,
    ].filter(Boolean);

    return { subject, html, text: textLines.join('\n') };
}

module.exports = { buildDemoScheduleStudentTemplate };
