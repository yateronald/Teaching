const { baseHtml, detailCard, infoStrip, ctaButton, escapeHtml, formatRecipientTime } = require('./base');

/**
 * Email sent to students when a teacher creates a live meeting (virtual classroom).
 *
 * @param {{
 *   studentName: string,
 *   meetingTitle: string,
 *   teacherName?: string,
 *   batchName?: string,
 *   scheduledStart?: string|Date|null,
 *   scheduledEnd?: string|Date|null,
 *   description?: string,
 *   joinUrl?: string,
 *   recipientTimezone?: string,
 * }} args
 */
function buildMeetingScheduledTemplate({
    studentName,
    meetingTitle,
    teacherName,
    batchName,
    scheduledStart,
    scheduledEnd,
    description,
    joinUrl,
    recipientTimezone,
}) {
    const safeStudent = studentName || 'there';
    const safeMeeting = meetingTitle || 'Live class';
    const tz = recipientTimezone || 'UTC';
    const subject = `Live class scheduled: ${safeMeeting}`;

    const preheader = teacherName
        ? `${teacherName} just scheduled a live class for ${batchName || 'your batch'}.`
        : 'A live class has been scheduled for you.';

    const dateOnlyOpts = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: undefined, minute: undefined, hour12: undefined,
    };
    const timeOnlyOpts = {
        weekday: undefined, year: undefined, month: undefined, day: undefined,
        hour: 'numeric', minute: '2-digit', hour12: true,
    };

    const dateStr = formatRecipientTime(scheduledStart, tz, dateOnlyOpts);
    const startStr = formatRecipientTime(scheduledStart, tz, timeOnlyOpts);
    const endStr = formatRecipientTime(scheduledEnd, tz, timeOnlyOpts);
    const timeRange = startStr && endStr ? `${startStr} – ${endStr}` : (startStr || null);

    const detailRows = [
        { label: 'Class', value: escapeHtml(safeMeeting) },
        { label: 'Batch', value: batchName ? escapeHtml(batchName) : null },
        { label: 'Teacher', value: teacherName ? escapeHtml(teacherName) : null },
        { label: `Date (${tz})`, value: dateStr ? escapeHtml(dateStr) : null },
        { label: `Time (${tz})`, value: timeRange ? escapeHtml(timeRange) : null },
        { label: 'Format', value: 'Online — Live virtual classroom' },
    ];

    const intro = teacherName && batchName
        ? `Your teacher <strong style="color:#0f172a;">${escapeHtml(teacherName)}</strong> has scheduled a live class for <strong style="color:#0f172a;">${escapeHtml(batchName)}</strong>.`
        : teacherName
            ? `Your teacher <strong style="color:#0f172a;">${escapeHtml(teacherName)}</strong> has scheduled a live class.`
            : 'A live class has been added to your schedule.';

    const bodyHtml = `
      <p style="margin: 0 0 14px; font-size: 15px; color: #0f172a;">
        Hi <strong>${escapeHtml(safeStudent)}</strong>,
      </p>
      <p style="margin: 0 0 22px; font-size: 14.5px; color: #475569; line-height: 1.65;">
        ${intro} You can join from your dashboard when it goes live.
      </p>

      ${detailCard({ title: 'Live class details', rows: detailRows })}

      ${description ? `
        <div style="margin: 0 0 22px;">
          <div style="font-size: 11px; font-weight: 700; color: #4338ca; letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 6px;">What to expect</div>
          <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.65;">${escapeHtml(description)}</p>
        </div>
      ` : ''}

      ${joinUrl ? ctaButton({ label: 'Open in dashboard', href: joinUrl }) : ''}

      ${infoStrip({
          tone: 'muted',
          text: `You'll be notified again right before the class starts. Make sure your camera and microphone are working in advance.`,
      })}
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'LIVE CLASS',
        title: 'A live class has been scheduled',
        bodyHtml,
    });

    const text = [
        `Hi ${safeStudent},`,
        '',
        intro.replace(/<[^>]+>/g, ''),
        '',
        'LIVE CLASS DETAILS',
        ...detailRows.filter(r => r.value).map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
        '',
        description ? `What to expect:\n${description}` : '',
        '',
        joinUrl ? `Open in dashboard: ${joinUrl}` : '',
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildMeetingScheduledTemplate };
