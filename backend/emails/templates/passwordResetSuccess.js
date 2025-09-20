function buildPasswordResetSuccessTemplate({ username, logoCid } = {}) {
  const subject = 'Your password has been reset — Learn French with Natives';
  const previewUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  const brandPrimary = '#1E3A8A';
  const brandAccent = '#3B82F6';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    @media (max-width: 600px) { .container { padding: 16px !important; } }
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
              <h1 style="margin:0; color:#fff; font-size:22px; font-weight:700; letter-spacing:0.3px;">Password changed</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="margin:0 0 12px; font-size:16px;">Hello ${username || 'there'},</p>
              <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#374151;">
                This is a confirmation that your password has been changed successfully.
              </p>
              <div style="background:#F3F4F6; border-radius:12px; padding:16px; border:1px solid #E5E7EB;">
                <p style="margin:0; font-size:13px; color:#6B7280;">
                  If this wasn’t you, please secure your account immediately by resetting your password again and contacting support.
                </p>
              </div>

              <div style="text-align:center; margin-top:18px;">
                <a href="${previewUrl}/login" target="_blank" style="display:inline-block; background:${brandAccent}; color:#fff; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:600;">Go to sign in</a>
              </div>

              <hr style="border:none; border-top:1px solid #E5E7EB; margin:24px 0;" />
              <p style="margin:0; font-size:12px; color:#9CA3AF;">
                Tip: Use a strong, unique password and avoid reusing it across sites.
              </p>
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

  const text = `Hello ${username || 'there'},\n\nYour password has been changed successfully. If this wasn’t you, secure your account immediately.\n\nSign in: ${previewUrl}/login`;
  return { subject, html, text };
}

module.exports = { buildPasswordResetSuccessTemplate };