const { baseHtml, detailCard, infoStrip, escapeHtml } = require('./base');

const SUBJECT = 'Your email address has been updated';
const TITLE = 'Your email address has been updated';

function buildDetailRows(oldEmail, newEmail) {
    return [
        { label: 'Previous email', value: oldEmail ? escapeHtml(oldEmail) : null },
        { label: 'New email', value: newEmail ? escapeHtml(newEmail) : null },
    ];
}

/**
 * Confirmation email sent to the OLD email address after a successful change.
 * Includes a security strip prompting the user to contact support if unauthorized.
 *
 * @param {{ username?: string, oldEmail?: string, newEmail?: string }} args
 */
function buildEmailChangeSuccessOldTemplate({ username, oldEmail, newEmail }) {
    const safeName = username || 'there';
    const preheader = 'Your account email has been updated successfully.';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeName)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        This is a confirmation that the email address on your account has been changed.
      </p>

      ${detailCard({ rows: buildDetailRows(oldEmail, newEmail) })}

      ${infoStrip({
          tone: 'warn',
          text: 'If you did not authorize this change, contact support immediately.',
      })}
    `;

    const html = baseHtml({
        subject: SUBJECT,
        preheader,
        eyebrow: 'SECURITY',
        title: TITLE,
        bodyHtml,
    });

    const text = [
        `Hi ${safeName},`,
        '',
        'This is a confirmation that the email address on your account has been changed.',
        '',
        oldEmail ? `Previous email: ${oldEmail}` : '',
        newEmail ? `New email: ${newEmail}` : '',
        '',
        'If you did not authorize this change, contact support immediately.',
    ].filter(Boolean).join('\n');

    return { subject: SUBJECT, html, text };
}

/**
 * Confirmation email sent to the NEW email address after a successful change.
 *
 * @param {{ username?: string, oldEmail?: string, newEmail?: string }} args
 */
function buildEmailChangeSuccessNewTemplate({ username, oldEmail, newEmail }) {
    const safeName = username || 'there';
    const preheader = 'You can now sign in with your new email address.';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeName)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        Your account email has been updated successfully. You can now sign in with your new email address.
      </p>

      ${detailCard({ rows: buildDetailRows(oldEmail, newEmail) })}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        If you didn't request this change, contact support immediately.
      </p>
    `;

    const html = baseHtml({
        subject: SUBJECT,
        preheader,
        eyebrow: 'SECURITY',
        title: TITLE,
        bodyHtml,
    });

    const text = [
        `Hi ${safeName},`,
        '',
        'Your account email has been updated successfully. You can now sign in with your new email address.',
        '',
        oldEmail ? `Previous email: ${oldEmail}` : '',
        newEmail ? `New email: ${newEmail}` : '',
        '',
        "If you didn't request this change, contact support immediately.",
    ].filter(Boolean).join('\n');

    return { subject: SUBJECT, html, text };
}

module.exports = {
    buildEmailChangeSuccessOldTemplate,
    buildEmailChangeSuccessNewTemplate,
};
