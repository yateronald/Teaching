const { baseHtml, detailCard, infoStrip, ctaButton, escapeHtml } = require('./base');

/**
 * Email sent when an administrator resets a user's password.
 *
 * @param {{
 *   username: string,
 *   tempPassword: string,
 *   loginUrl: string,
 * }} args
 */
function buildAdminPasswordResetTemplate({ username, tempPassword, loginUrl }) {
    const safeName = username || 'there';
    const safeLoginUrl = loginUrl || (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com') + '/login';

    const subject = 'Your password was reset by an admin';
    const preheader = 'An administrator has issued you a temporary password. Sign in to set a new one.';

    const passwordBox = tempPassword
        ? `
          <div style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #4338ca; letter-spacing: 0.6px; text-transform: uppercase;">Temporary password</div>
          <div style="font-family: 'SFMono-Regular', Menlo, Consolas, monospace; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; font-size:16px; font-weight:700; color:#0f172a; letter-spacing:1px; margin-bottom: 22px; word-break: break-all;">
            ${escapeHtml(tempPassword)}
          </div>`
        : '';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeName)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        An administrator has reset your password. Use the temporary password below to sign in. You will be asked to choose a new password right away.
      </p>

      ${passwordBox}

      ${ctaButton({ label: 'Sign in to set a new password', href: safeLoginUrl })}

      ${infoStrip({
          tone: 'warn',
          text: "If you didn't expect this change, contact support immediately so we can secure your account.",
      })}
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'SECURITY',
        title: 'Your password was reset by an admin',
        bodyHtml,
    });

    const text = [
        `Hi ${safeName},`,
        '',
        'An administrator has reset your password. Use the temporary password below to sign in. You will be asked to choose a new password right away.',
        '',
        tempPassword ? `Temporary password: ${tempPassword}` : '',
        '',
        `Sign in: ${safeLoginUrl}`,
        '',
        "If you didn't expect this change, contact support immediately so we can secure your account.",
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildAdminPasswordResetTemplate };
