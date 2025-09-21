function buildWelcomeTemplate({ username, tempPassword, loginUrl, logoCid }) {
    const subject = 'Welcome to Learn French with Natives! 🇫🇷';
    
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            height: 60px;
            margin-bottom: 20px;
            filter: brightness(0) invert(1);
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-message {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-message h2 {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
        }
        
        .welcome-message p {
            font-size: 16px;
            color: #6b7280;
            line-height: 1.7;
        }
        
        .credentials-section {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
        }
        
        .credentials-section h3 {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .password-box {
            background: #ffffff;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 15px 20px;
            margin: 15px 0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            letter-spacing: 1px;
            word-break: break-all;
        }
        
        .security-note {
            font-size: 14px;
            color: #f59e0b;
            font-weight: 500;
            margin-top: 10px;
        }
        
        .cta-section {
            text-align: center;
            margin: 35px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .feature {
            text-align: center;
            padding: 20px 15px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }
        
        .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .feature h4 {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
        }
        
        .feature p {
            font-size: 12px;
            color: #6b7280;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
        }
        
        .footer .contact {
            font-size: 12px;
            color: #9ca3af;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 25px 0;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .header, .content, .footer {
                padding: 25px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .welcome-message h2 {
                font-size: 20px;
            }
            
            .features {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            ${logoCid ? `<img src="cid:${logoCid}" alt="Learn French with Natives" class="logo">` : ''}
            <h1>Bienvenue! Welcome!</h1>
            <p>Your French learning journey starts here</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h2>Hello ${username}! 👋</h2>
                <p>We're thrilled to have you join our community of French language learners. Your account has been successfully created and you're ready to begin your exciting journey to fluency!</p>
            </div>
            
            <div class="credentials-section">
                <h3>🔐 Your Login Credentials</h3>
                <p style="margin-bottom: 15px; color: #6b7280;">Use these credentials to access your account:</p>
                <div class="password-box">${tempPassword}</div>
                <div class="security-note">⚠️ Please change this password after your first login</div>
            </div>
            
            <div class="cta-section">
                <a href="${loginUrl}" class="cta-button">Start Learning French →</a>
            </div>
            
            <div class="divider"></div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <h4>Personalized Learning</h4>
                    <p>Tailored lessons for your level</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">👥</div>
                    <h4>Native Speakers</h4>
                    <p>Learn from authentic French teachers</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <h4>Interactive Platform</h4>
                    <p>Modern tools for effective learning</p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Need help getting started?</strong></p>
            <p>Our support team is here to help you every step of the way.</p>
            <div class="contact">
                <p>Learn French with Natives Team</p>
                <p>If you didn't request this account, please contact us immediately.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    const text = `Welcome to Learn French with Natives!

Hello ${username}!

Your account has been created successfully. Please use the following temporary password to log in:

${tempPassword}

Login here: ${loginUrl}

Important: Please change this password after your first login for security.

If you didn't request this account, please contact support immediately.

---
Learn French with Natives Team`;

    return { subject, html, text };
}

module.exports = { buildWelcomeTemplate };