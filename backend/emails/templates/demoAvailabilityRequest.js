const {
    baseHtml,
    detailCard,
    slotListCard,
    formatSlotHuman,
    infoStrip,
    ctaButton,
    escapeHtml,
    formatRecipientTime,
    getSupportEmail,
    BRAND,
} = require('./base');

/**
 * Email sent when inviting a demo requester to choose from proposed availability options
 * (or suggest another time) via a single-use link.
 * Intentionally avoids exposing any administrator's personal name.
 */
function buildDemoAvailabilityRequestTemplate({
    recipientName,
    proposedSlots,
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
    const firstName = String(recipientName || '').trim().split(/\s+/)[0] || 'there';
    const tz = proposedTimezone || 'UTC';
    const support = supportEmail || getSupportEmail();

    const slots = Array.isArray(proposedSlots) && proposedSlots.length > 0 ? proposedSlots : null;

    const subject = 'Choose a time for your French demo session';
    const preheader = 'Select an available time option so an instructor can confirm your French demo session.';

    const dateRange = proposedStartDate && proposedEndDate
        ? (proposedStartDate === proposedEndDate
            ? proposedStartDate
            : `${proposedStartDate} to ${proposedEndDate}`)
        : null;

    const timeRange = proposedTimeStart && proposedTimeEnd
        ? `${proposedTimeStart} - ${proposedTimeEnd} (${tz})`
        : null;

    const expiresText = expiresAt ? formatRecipientTime(expiresAt, tz) : null;

    const scheduleSection = slots
        ? slotListCard({
            title: 'Available time options',
            subtitle: `Shown in ${tz}. Times convert to your local timezone on the selection page.`,
            slots,
        })
        : detailCard({
            title: 'Suggested window',
            rows: [
                { label: 'Dates', value: dateRange ? escapeHtml(dateRange) : null },
                { label: 'Hours', value: timeRange ? escapeHtml(timeRange) : null },
            ],
        });

    const noteBlock = adminNote
        ? infoStrip({
            tone: 'muted',
            text: `<strong>Note from our team:</strong> ${escapeHtml(adminNote)}`,
        })
        : '';

    const bodyHtml = `
      <p style="margin: 0 0 14px; font-size: 15px; color: ${BRAND.text}; line-height: 1.55;">
        Hello ${escapeHtml(firstName)},
      </p>
      <p style="margin: 0 0 22px; font-size: 14.5px; color: ${BRAND.textBody}; line-height: 1.65;">
        Thank you for requesting a live French demo class with us. Please choose one or more times below that fit your schedule. Once you submit, an instructor will contact you with your confirmed meeting link.
      </p>

      ${scheduleSection}

      ${noteBlock}

      ${ctaButton({ label: 'Select my preferred time', href: escapeHtml(availabilityUrl) })}

      <p style="margin: 0 0 12px; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.6;">
        If none of these options match your schedule, you can suggest a different date and time directly on the next page.
      </p>
      <p style="margin: 0 0 14px; font-size: 12.5px; color: ${BRAND.textMuted}; line-height: 1.6;">
        This link can be submitted once${expiresText ? ` (valid until ${escapeHtml(expiresText)})` : ''}. If you need to make changes afterwards, reply to this email or contact <a href="mailto:${escapeHtml(support)}" style="color: ${BRAND.primary}; text-decoration: none; font-weight: 600;">${escapeHtml(support)}</a>.
      </p>
      <p style="margin: 0; font-size: 12px; color: ${BRAND.textLight}; line-height: 1.55; word-break: break-all;">
        Direct link: <a href="${escapeHtml(availabilityUrl)}" style="color: ${BRAND.primary};">${escapeHtml(availabilityUrl)}</a>
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'DEMO SESSION',
        title: 'Choose your demo session time',
        bodyHtml,
    });

    const slotTextLines = slots
        ? [
            `Available time options (${tz}):`,
            ...slots.map((s) => {
                const { dateLabel, timeLabel } = formatSlotHuman(s);
                return `- ${dateLabel}, ${timeLabel}`;
            }),
        ]
        : [
            dateRange ? `Suggested dates: ${dateRange}` : null,
            timeRange ? `Suggested hours: ${timeRange}` : null,
        ].filter(Boolean);

    const textLines = [
        `Hello ${firstName},`,
        '',
        'Thank you for requesting a live French demo class with us. Please choose one or more times below so an instructor can contact you with your confirmed meeting link.',
        '',
        ...slotTextLines,
        adminNote ? '' : null,
        adminNote ? `Note from our team: ${adminNote}` : null,
        '',
        `Select your preferred time: ${availabilityUrl}`,
        '',
        'If none of these options match your schedule, you can suggest another time directly on the page.',
        `This is a one-time link. Need to change something afterwards? Email ${support}.`,
    ].filter(line => line !== null);

    return { subject, html, text: textLines.join('\n') };
}

module.exports = { buildDemoAvailabilityRequestTemplate };
