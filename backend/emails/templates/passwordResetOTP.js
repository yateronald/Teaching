function buildPasswordResetOTPTemplate({ username, code, logoCid }) {
    const subject = '🔐 Password Reset Code - Learn French with Natives';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Password Reset Code</title>
    </head>
    <body style="font-family: Arial, Helvetica, sans-serif; background: #f6f7fb; padding: 24px; color: #111827; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
                ${logoCid ? `<img src="cid:${logoCid}" alt="Learn French with Natives" style="height: 48px; margin-bottom: 16px;">` : ''}
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Password Reset</h1>
            </div>
            
            <div style="padding: 32px;">
                <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Hello ${username}!</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    We received a request to reset your password. Use the verification code below to proceed with resetting your password:
                </p>
                
                <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
                    <div style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 4px; font-family: 'Courier New', monospace;">${code}</div>
                </div>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                    This code will expire in <strong>10 minutes</strong> for security reasons.
                </p>
                
                <div style="background: #fef3cd; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                        <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
                    </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 32px 0 0 0;">
                    Best regards,<br>
                    <strong>Learn French with Natives Team</strong>
                </p>
            </div>
            
            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
                    This is an automated message. Please do not reply to this email.<br>
                    © 2024 Learn French with Natives. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>`;
    
    const text = `
Password Reset Code - Learn French with Natives

Hello ${username}!

We received a request to reset your password. Use the verification code below to proceed with resetting your password:

Verification Code: ${code}

This code will expire in 10 minutes for security reasons.

Security Notice: If you didn't request this password reset, please ignore this email. Your account remains secure.

Best regards,
Learn French with Natives Team

This is an automated message. Please do not reply to this email.
© 2024 Learn French with Natives. All rights reserved.
    `.trim();
    
    return { subject, html, text };
}

module.exports = { buildPasswordResetOTPTemplate };