const { baseHtml, infoStrip, escapeHtml } = require('./base');

/**
 * One-time verification code for password reset.
 *
 * @param {{
 *   username: string,
 *   code: string|number,
 * }} args
 */
function buildPasswordResetOTPTemplate({ username, code }) {
    const safeName = username || 'there';
    const safeCode = String(code || '').replace(/\D/g, '').slice(0, 6);

    const subject = 'Verify it\'s you';
    const preheader = 'Use this code to reset your password.';

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

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeName)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        We received a request to reset your password. Enter the 6-digit code below in the app to continue.
      </p>

      ${codeBox}

      ${infoStrip({
          tone: 'warn',
          text: "This code expires in 10 minutes. If you didn't request a password reset, you can safely ignore this email.",
      })}
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'SECURITY',
        title: "Verify it's you",
        bodyHtml,
    });

    const text = [
        `Hi ${safeName},`,
        '',
        'We received a request to reset your password. Enter the 6-digit code below in the app to continue.',
        '',
        safeCode ? `Verification code: ${safeCode}` : '',
        '',
        "This code expires in 10 minutes. If you didn't request a password reset, you can safely ignore this email.",
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildPasswordResetOTPTemplate };
