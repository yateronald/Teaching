const { baseHtml, detailCard, ctaButton, infoStrip, escapeHtml, formatRecipientTime, getSupportEmail } = require('./base');

/**
 * Email sent to demo prospects and external meeting invitees containing
 * the direct public meeting link (/meeting/:code#pwd=...), Meeting ID, Passcode,
 * and waiting-room / direct-entry instructions.
 */
function buildPublicMeetingInviteTemplate({
    recipientName,
    title,
    description,
    hostName,
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
    const safeName = recipientName || 'there';
    const tz = recipientTimezone || 'UTC';
    const support = supportEmail || getSupportEmail();
    const cleanTitle = title || (isDemo ? 'French Demo Class' : 'Live Meeting');

    const startStr = scheduledStart ? formatRecipientTime(scheduledStart, tz) : null;
    const endStr = scheduledEnd ? formatRecipientTime(scheduledEnd, tz) : null;

    let durationStr = null;
    if (scheduledStart && scheduledEnd) {
        const mins = Math.round((new Date(scheduledEnd).getTime() - new Date(scheduledStart).getTime()) / 60000);
        if (Number.isFinite(mins) && mins > 0) {
            durationStr = mins >= 60
                ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}`
                : `${mins} min`;
        }
    }

    const subject = isDemo
        ? `Your French demo meeting is scheduled — ${cleanTitle}`
        : `Meeting invitation: ${cleanTitle}`;
    const preheader = startStr
        ? `${cleanTitle} on ${startStr}. Meeting link and ID inside.`
        : `You are invited to ${cleanTitle}. Meeting link and ID inside.`;

    const portalBase = (process.env.FRONTEND_URL || 'https://www.learnfrenchwithnatives.com').replace(/\/$/, '');
    const entryUrl = `${portalBase}/meeting`;

    const detailRows = [
        { label: 'Meeting', value: escapeHtml(cleanTitle) },
        { label: 'Host', value: hostName ? escapeHtml(hostName) : null },
        { label: `Start (${tz})`, value: startStr ? escapeHtml(startStr) : null },
        { label: `End (${tz})`, value: endStr ? escapeHtml(endStr) : null },
        { label: 'Duration', value: durationStr ? escapeHtml(durationStr) : null },
    ];

    const accessRows = [
        { label: 'Meeting ID', value: meetingCode ? `<code style="font-family:monospace;font-size:15px;letter-spacing:0.6px;">${escapeHtml(meetingCode)}</code>` : null },
        { label: 'Passcode', value: passcode ? `<code style="font-family:monospace;font-size:15px;letter-spacing:1.2px;">${escapeHtml(passcode)}</code>` : null },
        { label: 'Meeting page', value: `<a href="${escapeHtml(entryUrl)}" style="color:#4338ca;text-decoration:none;">${escapeHtml(entryUrl)}</a>` },
    ];

    const accessNotice = requireApproval
        ? `<strong>Approval required:</strong> Once the host starts the meeting, you will wait briefly in the lobby until ${hostName ? escapeHtml(hostName) : 'the host'} lets you in.`
        : '<strong>Direct entry:</strong> Anyone with this meeting link or the Meeting ID &amp; passcode can join as soon as the host starts the meeting.';

    const extraNotes = notes || description;
    const notesCard = extraNotes
        ? detailCard({ title: 'Notes', rows: [{ label: 'Details', value: escapeHtml(extraNotes) }] })
        : '';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeName)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        ${isDemo
            ? 'Your French demo meeting is confirmed! Use the button or meeting credentials below when it is time to join.'
            : 'You have been invited to an online meeting on Learn French with Natives. Use the button or credentials below to join.'}
      </p>

      ${detailCard({ title: 'Meeting schedule', rows: detailRows })}
      ${detailCard({ title: 'How to join', rows: accessRows })}

      ${meetingUrl ? ctaButton({ label: 'Join meeting', href: escapeHtml(meetingUrl) }) : ''}

      ${infoStrip({ tone: 'info', text: accessNotice })}

      ${notesCard}

      <p style="margin: 12px 0 0; font-size: 12.5px; color: #64748b; line-height: 1.6;">
        If the host has not started the meeting yet when you open the link, keep the page open — you will enter automatically as soon as they start.<br />
        Need to reschedule? Contact <a href="mailto:${escapeHtml(support)}" style="color: #4338ca;">${escapeHtml(support)}</a>.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: isDemo ? 'DEMO MEETING' : 'MEETING INVITATION',
        title: isDemo ? 'Your demo meeting is confirmed' : cleanTitle,
        bodyHtml,
    });

    const textLines = [
        `Hi ${safeName},`,
        '',
        isDemo
            ? 'Your French demo meeting is confirmed.'
            : `You are invited to: ${cleanTitle}`,
        hostName ? `Host: ${hostName}` : null,
        startStr ? `Start (${tz}): ${startStr}` : null,
        endStr ? `End (${tz}): ${endStr}` : null,
        meetingUrl ? `Join link: ${meetingUrl}` : null,
        meetingCode ? `Meeting ID: ${meetingCode}` : null,
        passcode ? `Passcode: ${passcode}` : null,
        `Entry page: ${entryUrl}`,
        extraNotes ? `Notes: ${extraNotes}` : null,
        '',
        requireApproval
            ? 'Note: The host will admit you from the waiting room once the meeting starts.'
            : 'Note: Anyone with the link or Meeting ID & passcode can join once the meeting starts.',
        `Need help? Email ${support}`,
    ].filter(Boolean);

    return { subject, html, text: textLines.join('\n') };
}

module.exports = { buildPublicMeetingInviteTemplate };
