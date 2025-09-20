require('dotenv').config();
const nodemailer = require('nodemailer');

// Hostinger SMTP configuration with secure handling of credentials
const createEmailTransport = () => {
    const user = process.env.EMAIL_USER; // must be provided via env
    const pass = process.env.EMAIL_PASS; // must be provided via env

    if (!user || !pass) {
        // Fallback to JSON transport in development-like scenarios to avoid leaking credentials
        console.warn('Email credentials are missing (EMAIL_USER/EMAIL_PASS). Using JSON transport (emails will NOT actually be sent).');
        const transporter = nodemailer.createTransport({
            jsonTransport: true
        });
        return transporter;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: (process.env.EMAIL_SECURE || 'true') === 'true', // Use SSL/TLS
        auth: {
            user,
            pass
        },
        // Additional settings for better reliability
        pool: true,
        maxConnections: 100,
        maxMessages: 100,
        rateLimit: 100, // Max ~10 emails per second
        connectionTimeout: 60000, // 60 seconds
        socketTimeout: 60000,
        debug: process.env.NODE_ENV === 'development'
    });

    // Verify connection on creation (best-effort)
    transporter.verify((error, success) => {
        if (error) {
            console.error('Email transport verification failed:', error.message);
        } else {
            console.log('✅ Email transport ready for messages');
        }
    });

    return transporter;
};

// Enhanced send function with error handling and logging
const sendEmail = async (transporter, mailOptions) => {
    try {
        console.log(`📧 Sending email to: ${Array.isArray(mailOptions.to) ? mailOptions.to.length + ' recipient(s)' : mailOptions.to}`);
        console.log(`📧 Subject: ${mailOptions.subject}`);
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email processed by transport');
        if (info && info.messageId) {
            console.log(`📧 Message ID: ${info.messageId}`);
        }
        if (info && info.response) {
            console.log(`📧 Response: ${info.response}`);
        }
        
        return { success: true, messageId: info && info.messageId, response: info && info.response };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    createEmailTransport,
    sendEmail
};