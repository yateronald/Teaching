const nodemailer = require('nodemailer');

// Hostinger SMTP Configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'support@learnfrenchwithnatives.com',
    pass: 'yate1999Y@'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Beautiful HTML Email Template
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Learn French With Natives</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '🇫🇷';
            font-size: 60px;
            position: absolute;
            top: 20px;
            right: 30px;
            opacity: 0.3;
        }
        
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-message {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .welcome-message h2 {
            color: #667eea;
            font-size: 28px;
            margin-bottom: 15px;
        }
        
        .welcome-message p {
            font-size: 16px;
            color: #666;
            line-height: 1.8;
        }
        
        .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 40px 0;
        }
        
        .feature {
            background: #f8f9ff;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        
        .feature-icon {
            font-size: 40px;
            margin-bottom: 15px;
        }
        
        .feature h3 {
            color: #333;
            font-size: 18px;
            margin-bottom: 10px;
        }
        
        .feature p {
            color: #666;
            font-size: 14px;
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 10px;
            color: white;
        }
        
        .cta-button {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 16px;
            margin-top: 20px;
            transition: transform 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .footer {
            background: #333;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer p {
            margin-bottom: 10px;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
            font-size: 18px;
        }
        
        @media (max-width: 600px) {
            .features {
                grid-template-columns: 1fr;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bienvenue!</h1>
            <p>Welcome to Learn French With Natives</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h2>Bonjour Ronald! 👋</h2>
                <p>We're absolutely thrilled to welcome you to <strong>Learn French With Natives</strong>! 
                You've just taken the first step towards mastering the beautiful French language with 
                authentic native speakers.</p>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🗣️</div>
                    <h3>Native Speakers</h3>
                    <p>Learn from authentic French natives for perfect pronunciation and cultural insights</p>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">📚</div>
                    <h3>Interactive Lessons</h3>
                    <p>Engaging multimedia content designed to make learning French fun and effective</p>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <h3>Personalized Learning</h3>
                    <p>Customized curriculum that adapts to your learning pace and goals</p>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">📈</div>
                    <h3>Progress Tracking</h3>
                    <p>Monitor your improvement with detailed analytics and achievement badges</p>
                </div>
            </div>
            
            <div class="cta-section">
                <h3>Ready to Start Your French Journey?</h3>
                <p>Join thousands of students who are already speaking French with confidence!</p>
                <a href="https://learnfrenchwithnatives.com/login" class="cta-button">
                    Start Learning Now →
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Learn French With Natives</strong></p>
            <p>📧 support@learnfrenchwithnatives.com</p>
            <p>🌐 www.learnfrenchwithnatives.com</p>
            
            <div class="social-links">
                <a href="#">Facebook</a>
                <a href="#">Instagram</a>
                <a href="#">YouTube</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                © 2024 Learn French With Natives. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;

// Plain text version
const textVersion = `
Welcome to Learn French With Natives!

Bonjour Ronald!

We're absolutely thrilled to welcome you to Learn French With Natives! You've just taken the first step towards mastering the beautiful French language with authentic native speakers.

What makes us special:

🗣️ Native Speakers - Learn from authentic French natives for perfect pronunciation and cultural insights
📚 Interactive Lessons - Engaging multimedia content designed to make learning French fun and effective  
🎯 Personalized Learning - Customized curriculum that adapts to your learning pace and goals
📈 Progress Tracking - Monitor your improvement with detailed analytics and achievement badges

Ready to Start Your French Journey?
Join thousands of students who are already speaking French with confidence!

Visit: https://learnfrenchwithnatives.com/login

Contact us:
📧 support@learnfrenchwithnatives.com
🌐 www.learnfrenchwithnatives.com

© 2024 Learn French With Natives. All rights reserved.
`;

async function sendWelcomeEmail() {
  try {
    console.log('🚀 Testing Hostinger email configuration...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    const mailOptions = {
      from: {
        name: 'Learn French With Natives',
        address: 'support@learnfrenchwithnatives.com'
      },
      to: 'yateronald@gmail.com',
      subject: '🇫🇷 Bienvenue! Welcome to Learn French With Natives',
      html: htmlTemplate,
      text: textVersion,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };
    
    console.log('📧 Sending welcome email to yateronald@gmail.com...');
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📋 Email Details:');
    console.log(`   From: ${mailOptions.from.name} <${mailOptions.from.address}>`);
    console.log(`   To: ${mailOptions.to}`);
    console.log(`   Subject: ${mailOptions.subject}`);
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Response: ${result.response}`);
    
    console.log('\n🎨 Email Features:');
    console.log('   ✓ Beautiful gradient header with French flag');
    console.log('   ✓ Personalized welcome message for Ronald');
    console.log('   ✓ Feature highlights with icons');
    console.log('   ✓ Call-to-action button');
    console.log('   ✓ Responsive design for mobile');
    console.log('   ✓ Professional footer with contact info');
    console.log('   ✓ Both HTML and plain text versions');
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check your email credentials.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Please check your internet connection and SMTP settings.');
    } else if (error.code === 'EMESSAGE') {
      console.error('📧 Message error. Please check the email content and recipient address.');
    }
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Run the email test
sendWelcomeEmail()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Welcome email test completed successfully!');
      process.exit(0);
    } else {
      console.log('\n💥 Email test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });