const { baseHtml, infoStrip, ctaButton, escapeHtml } = require('./base');

/**
 * Confirmation email after a successful password change.
 *
 * @param {{ username?: string }} args
 */
function buildPasswordResetSuccessTemplate({ username } = {}) {
    const safeName = username || 'there';
    const loginUrl = `${(process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '')}/login`;

    const subject = 'Your password was changed';
    const preheader = 'Your password has been updated successfully.';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeName)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        This is a confirmation that your password was changed successfully. You can now sign in with your new password.
      </p>

      ${ctaButton({ label: 'Sign in', href: loginUrl })}

      ${infoStrip({
          tone: 'warn',
          text: "If this wasn't you, contact support immediately.",
      })}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        Tip: use a strong, unique password and avoid reusing it across sites.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'SECURITY',
        title: 'Your password was changed',
        bodyHtml,
    });

    const text = [
        `Hi ${safeName},`,
        '',
        'This is a confirmation that your password was changed successfully. You can now sign in with your new password.',
        '',
        `Sign in: ${loginUrl}`,
        '',
        "If this wasn't you, contact support immediately.",
    ].join('\n');

    return { subject, html, text };
}

module.exports = { buildPasswordResetSuccessTemplate };
