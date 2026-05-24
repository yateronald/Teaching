const { baseHtml, detailCard, infoStrip, ctaButton, escapeHtml } = require('./base');

/**
 * Welcome email sent when a new account is created.
 *
 * @param {{
 *   username: string,
 *   tempPassword: string,
 *   loginUrl: string,
 * }} args
 */
function buildWelcomeTemplate({ username, tempPassword, loginUrl }) {
    const safeName = username || 'there';
    const safeLoginUrl = loginUrl || (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com') + '/login';

    const subject = 'Welcome to Learn French with Natives';
    const preheader = 'Your account is ready. Sign in with the temporary password inside.';

    const passwordBox = tempPassword
        ? `
          <div style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #4338ca; letter-spacing: 0.6px; text-transform: uppercase;">Temporary password</div>
          <div style="font-family: 'SFMono-Regular', Menlo, Consolas, monospace; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; font-size:16px; font-weight:700; color:#0f172a; letter-spacing:1px; margin-bottom: 22px; word-break: break-all;">
            ${escapeHtml(tempPassword)}
          </div>`
        : '';

    const detailRows = [
        { label: 'Username', value: escapeHtml(safeName) },
    ];

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeName)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        Your account on Learn French with Natives is ready. Use the temporary password below to sign in for the first time.
      </p>

      ${detailCard({ rows: detailRows })}

      ${passwordBox}

      ${ctaButton({ label: 'Sign in', href: safeLoginUrl })}

      ${infoStrip({
          tone: 'warn',
          text: 'For your security, you will be asked to set a new password right after you sign in for the first time.',
      })}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        À très bientôt 🇫🇷
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'ACCOUNT',
        title: 'Welcome to Learn French with Natives',
        bodyHtml,
    });

    const text = [
        `Hi ${safeName},`,
        '',
        'Your account on Learn French with Natives is ready. Use the temporary password below to sign in for the first time.',
        '',
        `Username: ${safeName}`,
        tempPassword ? `Temporary password: ${tempPassword}` : '',
        '',
        `Sign in: ${safeLoginUrl}`,
        '',
        'For your security, you will be asked to set a new password right after you sign in for the first time.',
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildWelcomeTemplate };
