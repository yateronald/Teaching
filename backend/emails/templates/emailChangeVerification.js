const { baseHtml, detailCard, infoStrip, escapeHtml } = require('./base');

/**
 * Email-change verification code, sent to the new address.
 *
 * @param {{
 *   username?: string,
 *   oldEmail?: string,
 *   newEmail?: string,
 *   code: string|number,
 * }} args
 */
function buildEmailChangeVerificationTemplate({ username, oldEmail, newEmail, code }) {
    const safeName = username || 'there';
    const safeCode = String(code || '').replace(/\D/g, '').slice(0, 6);

    const subject = 'Confirm your new email address';
    const preheader = 'Enter the 6-digit code in the app to confirm your new email.';

    const detailRows = [
        { label: 'Previous email', value: oldEmail ? escapeHtml(oldEmail) : null },
        { label: 'New email', value: newEmail ? escapeHtml(newEmail) : null },
    ];

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
        We received a request to change the email address on your account. Enter the 6-digit code below in the app to confirm your new email.
      </p>

      ${detailCard({ rows: detailRows })}

      ${codeBox}

      ${infoStrip({ tone: 'warn', text: 'Code expires in 15 minutes.' })}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        If you didn't request this change, contact support immediately.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'SECURITY',
        title: 'Confirm your new email address',
        bodyHtml,
    });

    const text = [
        `Hi ${safeName},`,
        '',
        'We received a request to change the email address on your account. Enter the 6-digit code below in the app to confirm your new email.',
        '',
        oldEmail ? `Previous email: ${oldEmail}` : '',
        newEmail ? `New email: ${newEmail}` : '',
        '',
        safeCode ? `Verification code: ${safeCode}` : '',
        '',
        'Code expires in 15 minutes.',
        "If you didn't request this change, contact support immediately.",
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildEmailChangeVerificationTemplate };
