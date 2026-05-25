const { baseHtml, detailCard, infoStrip, ctaButton, escapeHtml, formatRecipientTime } = require('./base');

/**
 * Render a date in the recipient's timezone (e.g. "Sunday, May 25, 2026").
 * Returns null when input is falsy / unparseable.
 */
function safeFormatDate(input, tz) {
    if (!input) return null;
    return formatRecipientTime(input, tz, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: undefined, minute: undefined, hour12: undefined,
    }) || null;
}

/**
 * Render a time in the recipient's timezone with a `· GMT±N` suffix
 * (e.g. "5:00 PM · GMT-4"). Accepts:
 *   - a Date,
 *   - an ISO string (preferred — UTC),
 *   - or a bare "HH:mm" string (treated as UTC for safety so we never
 *     accidentally shift by the server's local zone).
 */
function safeFormatTime(input, tz) {
    if (!input) return null;
    let when;
    if (input instanceof Date) {
        when = input;
    } else if (typeof input === 'string' && input.includes('T')) {
        when = new Date(input);
    } else if (typeof input === 'string') {
        when = new Date(`2000-01-01T${input.length === 5 ? input + ':00' : input}Z`);
    } else {
        return null;
    }
    if (isNaN(when.getTime())) return String(input);
    return formatRecipientTime(when, tz, {
        weekday: undefined, year: undefined, month: undefined, day: undefined,
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
}

/**
 * Attendance access-code email sent at class start time.
 *
 * @param {{
 *   studentName?: string,
 *   classTitle?: string,
 *   teacherName?: string,
 *   batchName?: string,
 *   accessCode: string,
 *   sessionDate?: string|Date,
 *   startTime?: string|Date,
 *   endTime?: string|Date,
 *   expiresAt?: string|Date,
 *   joinLink?: string,
 *   recipientTimezone?: string,
 * }} args
 */
function buildAccessCodeTemplate({
    studentName,
    classTitle,
    teacherName,
    batchName,
    accessCode,
    sessionDate,
    startTime,
    endTime,
    expiresAt,
    joinLink,
    recipientTimezone,
}) {
    const safeStudent = studentName || 'there';
    const safeClass = classTitle || 'your class';
    const safeCode = String(accessCode || '');
    const tz = recipientTimezone || 'UTC';

    const subject = `Your access code for ${safeClass}`;
    const preheader = safeCode
        ? `Use code ${safeCode} to mark your attendance.`
        : 'Use the access code inside to mark your attendance.';

    const dateStr = safeFormatDate(sessionDate || startTime, tz);
    const start = safeFormatTime(startTime, tz);
    const end = safeFormatTime(endTime, tz);
    const timeRange = start && end ? `${start} – ${end}` : (start || end || null);
    const expiryStr = safeFormatTime(expiresAt, tz);

    const codeBox = safeCode
        ? `
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin: 0 0 22px;">
            <tr>
              <td align="center">
                <div style="font-family: 'SFMono-Regular', Menlo, Consolas, monospace; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:10px; padding:18px 24px; font-size:32px; font-weight:700; color:#0f172a; letter-spacing:8px;">
                  ${escapeHtml(safeCode)}
                </div>
              </td>
            </tr>
          </table>`
        : '';

    const detailRows = [
        { label: 'Class', value: escapeHtml(safeClass) },
        { label: 'Batch', value: batchName ? escapeHtml(batchName) : null },
        { label: 'Teacher', value: teacherName ? escapeHtml(teacherName) : null },
        { label: `Date (${tz})`, value: dateStr ? escapeHtml(dateStr) : null },
        { label: `Time (${tz})`, value: timeRange ? escapeHtml(timeRange) : null },
    ];

    const expiryStrip = expiryStr
        ? infoStrip({ tone: 'warn', text: `This code expires at ${escapeHtml(expiryStr)}. Enter it before then so you're marked present.` })
        : '';

    const cta = joinLink ? ctaButton({ label: 'Join class', href: joinLink }) : '';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeStudent)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        ${teacherName
            ? `Your class with <strong style="color:#0f172a;">${escapeHtml(teacherName)}</strong> has just started.`
            : 'Your class has just started.'} Enter the code below in the dashboard to mark yourself present.
      </p>

      ${codeBox}

      ${detailCard({ title: 'Session details', rows: detailRows })}

      ${expiryStrip}

      ${cta}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        Trouble joining? Reach out to your teacher.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'ATTENDANCE',
        title: 'Your access code',
        bodyHtml,
    });

    const textLines = [
        `Hi ${safeStudent},`,
        '',
        teacherName
            ? `Your class with ${teacherName} has just started.`
            : 'Your class has just started.',
        'Enter the code below in the dashboard to mark yourself present.',
        '',
        safeCode ? `Access code: ${safeCode}` : '',
        '',
        'SESSION DETAILS',
        ...detailRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
    ];
    if (expiryStr) textLines.push('', `This code expires at ${expiryStr}.`);
    if (joinLink) textLines.push('', `Join class: ${joinLink}`);
    const text = textLines.filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildAccessCodeTemplate };
