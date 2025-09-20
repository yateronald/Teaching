function buildWelcomeTemplate({ username, tempPassword, loginUrl, logoCid }) {
    const subject = 'Welcome to Learn French with Natives - Your Account is Ready!';
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Learn French with Natives</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }
        
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            padding: 60px 40px;
            text-align: center;
            color: white;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.2;
        }
        
        .logo {
            height: 120px;
            margin-bottom: 30px;
            filter: brightness(0) invert(1);
            position: relative;
            z-index: 1;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
        }
        
        .header p {
            font-size: 18px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .content {
            padding: 60px 40px;
            text-align: center;
        }
        
        .welcome-section {
            margin-bottom: 40px;
        }
        
        .welcome-section h2 {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .welcome-section p {
            font-size: 18px;
            color: #6b7280;
            line-height: 1.7;
            margin-bottom: 20px;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .credentials-section {
            margin: 50px 0;
        }
        
        .credentials-section h3 {
            font-size: 20px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 20px;
        }
        
        .password-box {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 25px 30px;
            margin: 25px auto;
            max-width: 400px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 24px;
            font-weight: 700;
            color: #1d4ed8;
            letter-spacing: 2px;
            word-break: break-all;
        }
        
        .security-note {
            font-size: 16px;
            color: #f59e0b;
            font-weight: 500;
            margin-top: 20px;
        }
        
        .cta-section {
            margin: 50px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 20px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 18px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
        }
        
        .footer {
            background: #f8fafc;
            padding: 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer h4 {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 15px;
        }
        
        .footer p {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 12px;
            line-height: 1.6;
        }
        
        .footer .contact {
            font-size: 14px;
            color: #9ca3af;
            margin-top: 20px;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 40px 0;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 20px 10px;
            }
            
            .email-container {
                border-radius: 12px;
            }
            
            .header {
                padding: 40px 25px;
            }
            
            .content, .footer {
                padding: 40px 25px;
            }
            
            .logo {
                height: 80px;
            }
            
            .header h1 {
                font-size: 26px;
            }
            
            .welcome-section h2 {
                font-size: 22px;
            }
            
            .password-box {
                font-size: 18px;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-content">
                ${logoCid ? `<img src="cid:${logoCid}" alt="Learn French with Natives" class="logo">` : ''}
                <h1>Welcome to Learn French with Natives!</h1>
                <p>Your French learning journey begins now</p>
            </div>
        </div>
        
        <div class="content">
            <div class="welcome-section">
                <h2>Bonjour ${username}!</h2>
                <p>We're thrilled to have you join our community of French learners. Your account has been created and you're ready to start your personalized French learning experience.</p>
            </div>
            
            <div class="credentials-section">
                <h3>Your Temporary Password</h3>
                <div class="password-box">${tempPassword}</div>
                <div class="security-note">⚠️ Please change this password after your first login</div>
            </div>
            
            <div class="cta-section">
                <a href="${loginUrl}" class="cta-button">Start Learning French →</a>
            </div>
            
            <div class="divider"></div>
        </div>
        
        <div class="footer">
            <h4>Ready to Begin?</h4>
            <p>Log in to access your personalized learning dashboard and start your French journey today.</p>
            <p>If you have any questions, our support team is here to help!</p>
            <div class="contact">
                <p>Learn French with Natives - Welcome Team</p>
                <p>This is an automated welcome message.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    const text = `Welcome to Learn French with Natives!

Bonjour ${username}!

We're thrilled to have you join our community of French learners. Your account has been created and you're ready to start your personalized French learning experience.

Your temporary password: ${tempPassword}

Login here: ${loginUrl}

IMPORTANT: Please change this password after your first login for security.

Ready to begin? Log in to access your personalized learning dashboard and start your French journey today.

If you have any questions, our support team is here to help!

---
Learn French with Natives - Welcome Team
This is an automated welcome message.`;

    return { subject, html, text };
}

module.exports = { buildWelcomeTemplate };