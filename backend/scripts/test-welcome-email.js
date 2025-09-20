const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const TOKEN = "9b8b2e592bcd65340311a4ee693817ae";

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

const sender = {
  address: "hello@demomailtrap.co",
  name: "French Teaching Platform",
};

const recipients = [
  "yateronald@gmail.com",
];

// Beautiful HTML email template for welcome onboarding
const welcomeEmailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to French Teaching Platform</title>
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
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .flag {
            font-size: 32px;
            margin-bottom: 15px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-message {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-message h2 {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 15px;
        }
        
        .welcome-message p {
            color: #666;
            font-size: 16px;
            line-height: 1.8;
        }
        
        .features {
            margin: 30px 0;
        }
        
        .feature {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9ff;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .feature-icon {
            font-size: 24px;
            margin-right: 15px;
            width: 40px;
            text-align: center;
        }
        
        .feature-text {
            flex: 1;
        }
        
        .feature-text h3 {
            color: #2c3e50;
            font-size: 16px;
            margin-bottom: 5px;
        }
        
        .feature-text p {
            color: #666;
            font-size: 14px;
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 12px;
            color: white;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #ffffff;
            color: #f5576c;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            margin-top: 15px;
            transition: transform 0.2s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .footer {
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer p {
            margin-bottom: 10px;
            opacity: 0.8;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            color: white;
            text-decoration: none;
            margin: 0 10px;
            font-size: 18px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .feature {
                flex-direction: column;
                text-align: center;
            }
            
            .feature-icon {
                margin-bottom: 10px;
                margin-right: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="flag">🇫🇷</div>
            <h1>Bienvenue!</h1>
            <p>Welcome to your French learning journey</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h2>Welcome to French Teaching Platform!</h2>
                <p>We're thrilled to have you join our community of French language learners. Get ready to embark on an exciting journey to master the beautiful French language with our comprehensive learning platform.</p>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">📚</div>
                    <div class="feature-text">
                        <h3>Interactive Lessons</h3>
                        <p>Engage with dynamic lessons designed by expert French teachers</p>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-text">
                        <h3>Personalized Quizzes</h3>
                        <p>Test your knowledge with adaptive quizzes tailored to your level</p>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">👥</div>
                    <div class="feature-text">
                        <h3>Live Classes</h3>
                        <p>Join scheduled classes with certified French instructors</p>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">📈</div>
                    <div class="feature-text">
                        <h3>Progress Tracking</h3>
                        <p>Monitor your learning progress with detailed analytics</p>
                    </div>
                </div>
            </div>
            
            <div class="cta-section">
                <h3>Ready to Start Learning?</h3>
                <p>Your French adventure begins now! Log in to access your personalized dashboard and start your first lesson.</p>
                <a href="#" class="cta-button">Start Learning French</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>French Teaching Platform</strong></p>
            <p>Your gateway to mastering French</p>
            <p>Need help? Contact us at support@frenchteaching.com</p>
            
            <div class="social-links">
                <a href="#">📧</a>
                <a href="#">🌐</a>
                <a href="#">📱</a>
            </div>
        </div>
    </div>
</body>
</html>
`;

const welcomeEmailText = `
Welcome to French Teaching Platform!

Bienvenue! 🇫🇷

We're thrilled to have you join our community of French language learners. Get ready to embark on an exciting journey to master the beautiful French language with our comprehensive learning platform.

What you can expect:

📚 Interactive Lessons
Engage with dynamic lessons designed by expert French teachers

🎯 Personalized Quizzes  
Test your knowledge with adaptive quizzes tailored to your level

👥 Live Classes
Join scheduled classes with certified French instructors

📈 Progress Tracking
Monitor your learning progress with detailed analytics

Ready to Start Learning?
Your French adventure begins now! Log in to access your personalized dashboard and start your first lesson.

Need help? Contact us at support@frenchteaching.com

French Teaching Platform - Your gateway to mastering French
`;

console.log("Sending welcome onboarding email with beautiful HTML design...");

transport
  .sendMail({
    from: sender,
    to: recipients,
    subject: "🇫🇷 Bienvenue! Welcome to French Teaching Platform",
    text: welcomeEmailText,
    html: welcomeEmailHTML,
    category: "Welcome Onboarding",
  })
  .then((result) => {
    console.log("✅ Welcome email sent successfully!");
    console.log("Result:", result);
    console.log("📧 Email includes:");
    console.log("- Beautiful gradient header with French flag");
    console.log("- Feature highlights with icons");
    console.log("- Call-to-action button");
    console.log("- Responsive design for mobile");
    console.log("- Professional footer");
  })
  .catch((error) => {
    console.error("❌ Failed to send welcome email:");
    console.error("Error:", error.message);
  });