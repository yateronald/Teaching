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
      .code { font-size: 28px !important; letter-spacing: 10px !important; }
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

module.exports = { baseHtml };