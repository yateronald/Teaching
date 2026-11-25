const { baseHtml, detailCard, infoStrip, escapeHtml, getSupportEmail, BRAND } = require('./base');

const EXAM_LABELS = {
    tcf_canada: 'TCF Canada',
    tef_canada: 'TEF Canada',
    tcf_quebec: 'TCF Quebec',
    tefaq: 'TEFAQ',
    tcf_tp: 'TCF Tout public',
    delf: 'DELF',
    dalf: 'DALF',
    other: 'French certification exam',
};

/**
 * Automatic confirmation email sent immediately when a visitor submits
 * a free demo class request or exam preparation request.
 * Intentionally avoids exposing personal administrator names.
 */
function buildDemoRequestReceivedTemplate({
    fullName,
    email,
    phone,
    interest = 'classes',
    currentLevel,
    interestedLevel,
    targetExam,
    preferredSchedule,
    supportEmail,
}) {
    const firstName = String(fullName || '').trim().split(/\s+/)[0] || 'there';
    const isExam = interest === 'exam';
    const support = supportEmail || getSupportEmail();

    const subject = isExam
        ? 'We received your French exam preparation request'
        : 'We received your French demo request';
    const preheader = 'Thank you for reaching out. Our team will contact you shortly by email or WhatsApp.';

    const examLabel = targetExam ? (EXAM_LABELS[targetExam] || targetExam) : null;
    const summaryRows = [
        { label: 'Request type', value: isExam ? 'Exam preparation' : 'Free live French demo class' },
        { label: 'Target exam', value: isExam && examLabel ? escapeHtml(examLabel) : null },
        { label: 'Current level', value: currentLevel ? escapeHtml(currentLevel) : null },
        { label: 'Goal level', value: !isExam && interestedLevel ? escapeHtml(interestedLevel) : null },
        { label: 'Preferred schedule', value: !isExam && preferredSchedule ? escapeHtml(preferredSchedule) : null },
        { label: 'WhatsApp', value: phone ? escapeHtml(phone) : null },
        { label: 'Email', value: email ? escapeHtml(email) : null },
    ];

    const bodyHtml = `
      <p style="margin: 0 0 14px; font-size: 15px; color: ${BRAND.text}; line-height: 1.55;">
        Hello ${escapeHtml(firstName)},
      </p>
      <p style="margin: 0 0 22px; font-size: 14.5px; color: ${BRAND.textBody}; line-height: 1.65;">
        ${isExam
            ? 'Thank you for reaching out to Learn French with Natives. We have received your exam preparation request, and our team will contact you shortly by WhatsApp or email with your next steps.'
            : 'Thank you for reaching out to Learn French with Natives. We have received your demo request, and our team will contact you shortly by WhatsApp or email to share available times and confirm your live session.'}
      </p>

      ${detailCard({ title: 'Request summary', rows: summaryRows })}

      ${infoStrip({
          tone: 'info',
          text: `Please keep an eye on your WhatsApp messages and email inbox (including your spam or promotions folder). If you noticed a typo in your contact details, reply to this email or write to <a href="mailto:${escapeHtml(support)}" style="color: ${BRAND.primary}; font-weight: 600; text-decoration: none;">${escapeHtml(support)}</a>.`,
      })}
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'REQUEST RECEIVED',
        title: 'We have received your request',
        bodyHtml,
    });

    const textLines = [
        `Hello ${firstName},`,
        '',
        isExam
            ? 'Thank you for reaching out to Learn French with Natives. We have received your exam preparation request, and our team will contact you shortly by WhatsApp or email with your next steps.'
            : 'Thank you for reaching out to Learn French with Natives. We have received your demo request, and our team will contact you shortly by WhatsApp or email to share available times and confirm your live session.',
        '',
        'REQUEST SUMMARY',
        ...summaryRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
        '',
        `Please check your WhatsApp messages and email inbox. Need to update anything? Reply to this email or write to ${support}.`,
    ];

    return { subject, html, text: textLines.join('\n') };
}

module.exports = { buildDemoRequestReceivedTemplate };
