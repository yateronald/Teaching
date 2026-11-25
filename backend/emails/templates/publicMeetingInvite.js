const { baseHtml, detailCard, ctaButton, infoStrip, escapeHtml, formatRecipientTime, getSupportEmail, BRAND } = require('./base');

/**
 * Email sent to demo prospects and external meeting invitees containing
 * the direct public meeting link (/meeting/:code#pwd=...), Meeting ID, and Passcode.
 * Intentionally avoids exposing any administrator's personal name.
 */
function buildPublicMeetingInviteTemplate({
    recipientName,
    title,
    description,
    scheduledStart,
    scheduledEnd,
    recipientTimezone,
    meetingUrl,
    meetingCode,
    passcode,
    requireApproval = true,
    isDemo = false,
    notes,
    supportEmail,
}) {
    const firstName = String(recipientName || '').trim().split(/\s+/)[0] || 'there';
    const tz = recipientTimezone || 'UTC';
    const support = supportEmail || getSupportEmail();
    const cleanTitle = title || (isDemo ? 'French Demo Session' : 'Live Meeting');

    const startStr = scheduledStart ? formatRecipientTime(scheduledStart, tz) : null;

    let durationStr = null;
    if (scheduledStart && scheduledEnd) {
        const mins = Math.round((new Date(scheduledEnd).getTime() - new Date(scheduledStart).getTime()) / 60000);
        if (Number.isFinite(mins) && mins > 0) {
            durationStr = mins >= 60
                ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}`
                : `${mins} minutes`;
        }
    }

    const subject = isDemo
        ? 'Your French demo session is confirmed'
        : `Session invitation: ${cleanTitle}`;
    const preheader = startStr
        ? `${startStr}. Join link, Meeting ID, and passcode inside.`
        : `Join details for ${cleanTitle}.`;

    const portalBase = (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '');
    const entryUrl = `${portalBase}/meeting`;

    const sessionRows = [
        { label: 'Session', value: escapeHtml(cleanTitle) },
        { label: `Date & time (${tz})`, value: startStr ? escapeHtml(startStr) : null },
        { label: 'Duration', value: durationStr ? escapeHtml(durationStr) : null },
        {
            label: 'Meeting ID',
            value: meetingCode
                ? `<span style="font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 14.5px; letter-spacing: 0.6px; color: ${BRAND.text};">${escapeHtml(meetingCode)}</span>`
                : null,
        },
        {
            label: 'Passcode',
            value: passcode
                ? `<span style="font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 14.5px; letter-spacing: 1.4px; color: ${BRAND.text};">${escapeHtml(passcode)}</span>`
                : null,
        },
    ];

    const accessNotice = requireApproval
        ? (isDemo
            ? 'When you open the link at your scheduled time, you will wait briefly in the lobby until an instructor lets you in.'
            : 'When you open the link, you will wait briefly in the lobby until your host admits you.')
        : 'Anyone with the session link or the Meeting ID and passcode can join as soon as the session begins.';

    const extraNotes = notes || description;
    const notesBlock = extraNotes
        ? infoStrip({
            tone: 'muted',
            text: `<strong>Note:</strong> ${escapeHtml(extraNotes)}`,
        })
        : '';

    const bodyHtml = `
      <p style="margin: 0 0 14px; font-size: 15px; color: ${BRAND.text}; line-height: 1.55;">
        Hello ${escapeHtml(firstName)},
      </p>
      <p style="margin: 0 0 22px; font-size: 14.5px; color: ${BRAND.textBody}; line-height: 1.65;">
        ${isDemo
            ? 'Your French demo session is scheduled. An instructor will meet you in the classroom at the time below.'
            : 'You have been invited to a live session on Learn French with Natives. Use the link or credentials below when it is time to join.'}
      </p>

      ${detailCard({ title: 'Session details', rows: sessionRows })}

      ${meetingUrl ? ctaButton({ label: 'Join session', href: escapeHtml(meetingUrl) }) : ''}

      ${infoStrip({ tone: 'info', text: accessNotice })}

      ${notesBlock}

      <p style="margin: 0 0 10px; font-size: 12.5px; color: ${BRAND.textMuted}; line-height: 1.6;">
        Prefer entering your Meeting ID manually? Visit <a href="${escapeHtml(entryUrl)}" style="color: ${BRAND.primary}; text-decoration: none; font-weight: 600;">${escapeHtml(entryUrl)}</a>. If the room has not opened yet, keep the page open and you will enter once it starts.
      </p>
      <p style="margin: 0; font-size: 12.5px; color: ${BRAND.textMuted}; line-height: 1.6;">
        Need to reschedule? Contact <a href="mailto:${escapeHtml(support)}" style="color: ${BRAND.primary}; text-decoration: none; font-weight: 600;">${escapeHtml(support)}</a>.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: isDemo ? 'DEMO SESSION CONFIRMED' : 'LIVE SESSION',
        title: isDemo ? 'Your French demo session is confirmed' : cleanTitle,
        bodyHtml,
    });

    const textLines = [
        `Hello ${firstName},`,
        '',
        isDemo
            ? 'Your French demo session is scheduled. An instructor will meet you in the classroom at the time below.'
            : `You have been invited to: ${cleanTitle}`,
        '',
        `Session: ${cleanTitle}`,
        startStr ? `Date & time (${tz}): ${startStr}` : null,
        durationStr ? `Duration: ${durationStr}` : null,
        meetingUrl ? `Join link: ${meetingUrl}` : null,
        meetingCode ? `Meeting ID: ${meetingCode}` : null,
        passcode ? `Passcode: ${passcode}` : null,
        `Entry page: ${entryUrl}`,
        extraNotes ? `Note: ${extraNotes}` : null,
        '',
        accessNotice,
        `Need to reschedule? Email ${support}.`,
    ].filter(Boolean);

    return { subject, html, text: textLines.join('\n') };
}

module.exports = { buildPublicMeetingInviteTemplate };
