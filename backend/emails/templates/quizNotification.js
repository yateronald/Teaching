const { baseHtml, detailCard, ctaButton, escapeHtml } = require('./base');

function safeFormatDateTime(input) {
    if (!input) return null;
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    return d.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function formatDuration(minutes) {
    if (minutes === null || minutes === undefined || minutes === '') return null;
    const n = Number(minutes);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n < 60) return `${n} minute${n !== 1 ? 's' : ''}`;
    const hours = Math.floor(n / 60);
    const mins = n % 60;
    if (mins === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
}

/**
 * New quiz notification sent to a student.
 *
 * @param {{
 *   studentName?: string,
 *   quizName?: string,
 *   teacherName?: string,
 *   batchName?: string,
 *   duration?: number,
 *   startDate?: string|Date,
 *   endDate?: string|Date,
 *   totalPoints?: number,
 * }} args
 */
function buildQuizNotificationTemplate({
    studentName,
    quizName,
    teacherName,
    batchName,
    duration,
    startDate,
    endDate,
    totalPoints,
}) {
    const safeStudent = studentName || 'there';
    const safeQuiz = quizName || 'New quiz';

    const subject = `Quiz published: ${safeQuiz}`;
    const preheader = teacherName
        ? `${teacherName} just published "${safeQuiz}".`
        : `A new quiz has been published.`;

    const durationLabel = formatDuration(duration);
    const startStr = safeFormatDateTime(startDate);
    const endStr = safeFormatDateTime(endDate);

    const detailRows = [
        { label: 'Quiz', value: escapeHtml(safeQuiz) },
        { label: 'Batch', value: batchName ? escapeHtml(batchName) : null },
        { label: 'Teacher', value: teacherName ? escapeHtml(teacherName) : null },
        { label: 'Available from', value: startStr ? escapeHtml(startStr) : null },
        { label: 'Closes on', value: endStr ? escapeHtml(endStr) : null },
        { label: 'Duration', value: durationLabel ? escapeHtml(durationLabel) : null },
        { label: 'Total points', value: (totalPoints || totalPoints === 0) ? escapeHtml(String(totalPoints)) : null },
    ];

    const quizUrl = `${(process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '')}/app/quizzes`;

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeStudent)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        ${teacherName
            ? `Your teacher <strong style="color:#0f172a;">${escapeHtml(teacherName)}</strong> just published a new quiz.`
            : 'A new quiz is available for you to attempt.'} The full details are below.
      </p>

      ${detailCard({ title: 'Quiz details', rows: detailRows })}

      ${ctaButton({ label: 'Open quiz', href: quizUrl })}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        Make sure you have a stable connection and a quiet place before you start.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'QUIZ',
        title: 'A new quiz is available',
        bodyHtml,
    });

    const text = [
        `Hi ${safeStudent},`,
        '',
        teacherName
            ? `Your teacher ${teacherName} just published a new quiz.`
            : 'A new quiz is available for you to attempt.',
        '',
        'QUIZ DETAILS',
        ...detailRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
        '',
        `Open quiz: ${quizUrl}`,
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildQuizNotificationTemplate };
