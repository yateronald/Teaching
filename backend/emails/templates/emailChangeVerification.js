const path = require('path');

// Generates HTML and text content for email-change verification
function buildEmailChangeVerificationTemplate({ username, oldEmail, newEmail, code, logoCid }) {
    const previewUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const brandPrimary = '#1E3A8A';
    const brandAccent = '#3B82F6';

    const subject = 'Confirm your email change — Learn French with Natives';

    const html = `
<!DOCTYPE html>
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
              <img src="cid:${logoCid}" alt="Learn French with Natives" height="56" style="display:block; margin: 0 auto 8px;" />
              <h1 style="margin:0; color:#fff; font-size:22px; font-weight:700; letter-spacing:0.3px;">Email Change Verification</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="margin:0 0 12px; font-size:16px;">Hello ${username || 'there'},</p>
              <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#374151;">
                You requested to change your account email on <strong>Learn French with Natives</strong>.
              </p>
              <div style="background:#F3F4F6; border:1px dashed #CBD5E1; border-radius:12px; padding:16px; margin:20px 0;">
                <p style="margin:0 0 6px; font-size:14px; color:#6B7280;">Current email</p>
                <p style="margin:0 0 12px; font-weight:600;">${oldEmail}</p>
                <p style="margin:0 0 6px; font-size:14px; color:#6B7280;">New email</p>
                <p style="margin:0; font-weight:600;">${newEmail}</p>
              </div>

              <p style="margin:0 0 12px; font-size:15px;">Please verify your new email by entering the 6‑digit code below in the app:</p>
              <div style="text-align:center; margin: 16px 0 6px;">
                <div class="code" style="display:inline-block; font-size:34px; font-weight:800; letter-spacing:12px; background:#111827; color:#fff; padding:14px 18px; border-radius:12px; box-shadow: 0 6px 18px rgba(0,0,0,0.15);">
                  ${String(code).replace(/\D/g,'').slice(0,6)}
                </div>
              </div>
              <p style="margin:0 0 20px; font-size:13px; color:#6B7280; text-align:center;">This code expires in 10 minutes. You have up to 3 attempts.</p>

              <div style="text-align:center; margin-top:18px;">
                <a href="${previewUrl}/profile" target="_blank" style="display:inline-block; background:${brandAccent}; color:#fff; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:600;">Open Profile</a>
              </div>

              <hr style="border:none; border-top:1px solid #E5E7EB; margin:24px 0;" />
              <p style="margin:0; font-size:12px; color:#9CA3AF;">
                If you didn’t request this change, please contact support immediately.
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

    const text = `Hello ${username || 'there'},\n\nYou requested to change your email on Learn French with Natives.\nCurrent email: ${oldEmail}\nNew email: ${newEmail}\n\nYour verification code: ${String(code).replace(/\D/g,'').slice(0,6)} (expires in 10 minutes). You have up to 3 attempts.\n\nOpen your profile: ${previewUrl}/profile\n\nIf you didn’t request this, please contact support immediately.`;

    return { subject, html, text };
}

module.exports = { buildEmailChangeVerificationTemplate };