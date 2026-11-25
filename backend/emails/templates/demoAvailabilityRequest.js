const { baseHtml, detailCard, ctaButton, infoStrip, escapeHtml, formatRecipientTime, getSupportEmail } = require('./base');

/**
 * Email sent by an admin asking a demo prospect for their availability
 * via a cryptographically signed single-use expiring link.
 */
function buildDemoAvailabilityRequestTemplate({
    recipientName,
    adminName,
    proposedStartDate,
    proposedEndDate,
    proposedTimeStart,
    proposedTimeEnd,
    proposedTimezone,
    adminNote,
    availabilityUrl,
    expiresAt,
    supportEmail,
}) {
    const safeName = recipientName || 'there';
    const tz = proposedTimezone || 'UTC';
    const support = supportEmail || getSupportEmail();

    const subject = 'Share your availability for your French demo class';
    const preheader = adminName
        ? `${adminName} asked for your available times to schedule your French demo.`
        : 'Pick a time window that works best for your free French demo class.';

    const dateRange = proposedStartDate && proposedEndDate
        ? (proposedStartDate === proposedEndDate
            ? proposedStartDate
            : `${proposedStartDate} → ${proposedEndDate}`)
        : null;

    const timeRange = proposedTimeStart && proposedTimeEnd
        ? `${proposedTimeStart} – ${proposedTimeEnd} (${tz})`
        : null;

    const expiresText = expiresAt ? formatRecipientTime(expiresAt, tz) : null;

    const detailRows = [
        { label: 'Coordinator', value: adminName ? escapeHtml(adminName) : null },
        { label: 'Proposed dates', value: dateRange ? escapeHtml(dateRange) : null },
        { label: 'Suggested daily window', value: timeRange ? escapeHtml(timeRange) : null },
        { label: 'Link expires', value: expiresText ? escapeHtml(expiresText) : null },
    ];

    const noteCard = adminNote
        ? detailCard({ title: 'Message from our team', rows: [{ label: 'Note', value: escapeHtml(adminNote) }] })
        : '';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeName)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        Thank you for requesting a live French demo class! Please share the dates and times that suit you best using the button below so we can finalize your meeting and send your join link.
      </p>

      ${detailCard({ title: 'Suggested availability window', rows: detailRows })}

      ${noteCard}

      ${ctaButton({ label: 'Share my availability', href: escapeHtml(availabilityUrl) })}

      ${infoStrip({
          tone: 'warn',
          text: `<strong>One-time link:</strong> For your privacy and scheduling accuracy, this link expires automatically as soon as you submit your availability. If you need to make a change afterwards, please write to <a href="mailto:${escapeHtml(support)}" style="color:#9a3412;font-weight:600;">${escapeHtml(support)}</a>.`,
      })}

      <p style="margin: 12px 0 0; font-size: 12.5px; color: #64748b; line-height: 1.6; word-break: break-all;">
        If the button does not work, open this link in your browser:<br />
        <a href="${escapeHtml(availabilityUrl)}" style="color: #4338ca;">${escapeHtml(availabilityUrl)}</a>
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'DEMO SCHEDULING',
        title: 'Choose your available times',
        bodyHtml,
    });

    const textLines = [
        `Hi ${safeName},`,
        '',
        'Thank you for requesting a live French demo class! Please share your preferred dates and times using the link below:',
        '',
        availabilityUrl,
        '',
        dateRange ? `Proposed dates: ${dateRange}` : null,
        timeRange ? `Suggested window: ${timeRange}` : null,
        adminNote ? `Note: ${adminNote}` : null,
        '',
        `Note: This link is single-use and expires once you submit your availability. To reschedule afterwards, email ${support}.`,
    ].filter(Boolean);

    return { subject, html, text: textLines.join('\n') };
}

module.exports = { buildDemoAvailabilityRequestTemplate };
