function baseHtml({ subject, headerTitle, bodyHtml, logoCid, brandPrimary = '#1E3A8A', brandAccent = '#3B82F6' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    @media (max-width: 600px) {
      .container { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin:0; background:#f5f7fb; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(120deg, ${brandPrimary}, ${brandAccent}); padding: 24px 0;">
    <tr>
      <td align="center">
        <table width="600" class="container" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(30,58,138,0.15);">
          <tr>
            <td style="background:linear-gradient(120deg, ${brandPrimary}, ${brandAccent}); padding: 24px; text-align:center;">
              ${logoCid ? `<img src="cid:${logoCid}" alt="Learn French with Natives" height="56" style="display:block; margin: 0 auto 8px;" />` : ''}
              <h1 style="margin:0; color:#fff; font-size:22px; font-weight:700; letter-spacing:0.3px;">${headerTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 16px; text-align:center; background:#F9FAFB; color:#6B7280; font-size:12px;">
              © ${new Date().getFullYear()} Learn French with Natives. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailChangeSuccessOldTemplate({ username, oldEmail, newEmail, logoCid }) {
  const subject = 'Your email was changed — Learn French with Natives';
  const previewUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  const bodyHtml = `
    <p style="margin:0 0 12px; font-size:16px;">Hello ${username || 'there'},</p>
    <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#374151;">
      This is a confirmation that the email on your account has been changed.
    </p>

    <div style="background:#F3F4F6; border:1px dashed #CBD5E1; border-radius:12px; padding:16px; margin:20px 0;">
      <p style="margin:0 0 6px; font-size:14px; color:#6B7280;">Previous email</p>
      <p style="margin:0 0 12px; font-weight:600;">${oldEmail}</p>
      <p style="margin:0 0 6px; font-size:14px; color:#6B7280;">New email</p>
      <p style="margin:0; font-weight:600;">${newEmail}</p>
    </div>

    <p style="margin:0 0 16px; font-size:14px; color:#374151;">
      If you didn’t make this change, please secure your account immediately.
    </p>

    <div style="text-align:center; margin-top:18px;">
      <a href="${previewUrl}/login" target="_blank" style="display:inline-block; background:#EF4444; color:#fff; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:600;">Secure your account</a>
    </div>

    <hr style="border:none; border-top:1px solid #E5E7EB; margin:24px 0;" />
    <p style="margin:0; font-size:12px; color:#9CA3AF;">
      We recommend updating your password and enabling additional security if available.
    </p>
  `;

  const html = baseHtml({ subject, headerTitle: 'Email Change Notice', bodyHtml, logoCid });
  const text = `Hello ${username || 'there'},\n\nYour account email was changed from ${oldEmail} to ${newEmail}. If this wasn’t you, secure your account: ${previewUrl}/login`;
  return { subject, html, text };
}

function buildEmailChangeSuccessNewTemplate({ username, newEmail, logoCid }) {
  const subject = 'Email change successful — Learn French with Natives';
  const previewUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  const bodyHtml = `
    <p style="margin:0 0 12px; font-size:16px;">Hello ${username || 'there'},</p>
    <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#374151;">
      Your account email has been updated successfully. You can now sign in with <strong>${newEmail}</strong>.
    </p>

    <div style="text-align:center; margin-top:18px;">
      <a href="${previewUrl}/login" target="_blank" style="display:inline-block; background:#3B82F6; color:#fff; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:600;">Sign in</a>
    </div>

    <hr style="border:none; border-top:1px solid #E5E7EB; margin:24px 0;" />
    <p style="margin:0; font-size:12px; color:#9CA3AF;">
      If you didn’t request this change, please contact support immediately.
    </p>
  `;

  const html = baseHtml({ subject, headerTitle: 'Email change successful', bodyHtml, logoCid });
  const text = `Hello ${username || 'there'},\n\nYour account email has been updated successfully. You can now sign in with ${newEmail}. If you didn’t request this change, contact support.`;
  return { subject, html, text };
}

module.exports = {
  buildEmailChangeSuccessOldTemplate,
  buildEmailChangeSuccessNewTemplate
};