const { baseHtml, detailCard, infoStrip, ctaButton, escapeHtml } = require('./base');

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

/**
 * Reminder email sent shortly before a quiz becomes available.
 *
 * @param {{
 *   studentName?: string,
 *   quizTitle?: string,
 *   dueDate?: string|Date,
 *   quizLink?: string,
 * }} args
 */
function buildQuizReminderTemplate({ studentName, quizTitle, dueDate, quizLink }) {
    const safeStudent = studentName || 'there';
    const safeQuiz = quizTitle || 'Your quiz';
    const dueStr = safeFormatDateTime(dueDate);
    const fallbackUrl = `${(process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '')}/app/quizzes`;
    const targetUrl = quizLink || fallbackUrl;

    const subject = `Quiz starts soon: ${safeQuiz}`;
    const preheader = `Your quiz "${safeQuiz}" is about to begin.`;

    const detailRows = [
        { label: 'Quiz', value: escapeHtml(safeQuiz) },
        { label: 'Due', value: dueStr ? escapeHtml(dueStr) : null },
    ];

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeStudent)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        This is a quick reminder so you don't miss your quiz. Make sure your materials are ready and you have a stable connection.
      </p>

      ${detailCard({ title: 'Quiz details', rows: detailRows })}

      ${infoStrip({ tone: 'warn', text: 'Your quiz becomes available in a few minutes.' })}

      ${ctaButton({ label: 'Open quiz', href: targetUrl })}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        Bonne chance!
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'QUIZ',
        title: 'Your quiz starts soon',
        bodyHtml,
    });

    const text = [
        `Hi ${safeStudent},`,
        '',
        "This is a quick reminder so you don't miss your quiz. Make sure your materials are ready and you have a stable connection.",
        '',
        'QUIZ DETAILS',
        ...detailRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
        '',
        'Your quiz becomes available in a few minutes.',
        '',
        `Open quiz: ${targetUrl}`,
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildQuizReminderTemplate };
