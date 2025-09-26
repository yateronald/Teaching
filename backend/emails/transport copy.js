// Load env with fallback to backend/.env or backend/.env.postgres
const fs = require('fs');
const path = require('path');
(() => {
  const backendRoot = path.join(__dirname, '..');
  const envPath = fs.existsSync(path.join(backendRoot, '.env'))
    ? path.join(backendRoot, '.env')
    : (fs.existsSync(path.join(backendRoot, '.env.postgres'))
        ? path.join(backendRoot, '.env.postgres')
        : null);
  if (envPath) {
    require('dotenv').config({ path: envPath });
    console.log(`Loaded environment from ${path.basename(envPath)}`);
  } else {
    require('dotenv').config();
  }
})();
const nodemailer = require('nodemailer');

// Hostinger SMTP configuration optimized for Render
const createEmailTransport = () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    
    // Log environment status (without exposing credentials)
    console.log('🔧 Email Configuration Status:');
    console.log(`  - EMAIL_USER: ${user ? '✅ Set' : '❌ Missing'}`);
    console.log(`  - EMAIL_PASS: ${pass ? '✅ Set' : '❌ Missing'}`);
    console.log(`  - EMAIL_HOST: ${process.env.EMAIL_HOST || 'smtp.hostinger.com (default)'}`);
    console.log(`  - EMAIL_PORT: ${process.env.EMAIL_PORT || '465 (default)'}`);
    console.log(`  - Environment: ${process.env.NODE_ENV || 'production'}`);

    if (!user || !pass) {
        console.error('❌ CRITICAL: Email credentials are missing!');
        console.error('Please set EMAIL_USER and EMAIL_PASS environment variables in Render dashboard.');
        
        // In production, throw an error instead of using JSON transport
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Email credentials (EMAIL_USER/EMAIL_PASS) are required in production');
        }
        
        // Development fallback
        console.warn('Using JSON transport for development (emails will NOT be sent)');
        return nodemailer.createTransport({
            jsonTransport: true
        });
    }

    // Hostinger SMTP settings
    const host = process.env.EMAIL_HOST || 'smtp.hostinger.com';
    const port = parseInt(process.env.EMAIL_PORT || '465', 10);
    
    // For Hostinger, use these specific settings:
    // Port 465: SSL/TLS (secure: true)
    // Port 587: STARTTLS (secure: false)
    const secure = port === 465;

    console.log(`📧 Configuring transport: ${host}:${port} (secure: ${secure})`);

    const transportConfig = {
        host,
        port,
        secure,
        auth: {
            user,
            pass
        },
        // Optimized settings for Render deployment
        connectionTimeout: 60000, // Increased to 60 seconds for Render
        greetingTimeout: 30000,
        socketTimeout: 60000,
        // Disable connection pooling to avoid issues
        pool: false,
        maxConnections: 1,
        maxMessages: Infinity,
        rateLimit: false,
        // TLS settings for production
        tls: {
            // For production, enable certificate validation
            rejectUnauthorized: process.env.NODE_ENV === 'production' 
                ? process.env.EMAIL_REJECT_UNAUTHORIZED !== 'false' 
                : false,
            // Remove deprecated cipher settings
            minVersion: 'TLSv1.2',
            // Allow self-signed certificates if explicitly configured
            ...(process.env.EMAIL_ALLOW_SELF_SIGNED === 'true' && {
                rejectUnauthorized: false
            })
        },
        // Debug settings
        debug: process.env.EMAIL_DEBUG === 'true',
        logger: process.env.EMAIL_DEBUG === 'true'
    };

    // If using port 587, ensure STARTTLS is properly configured
    if (port === 587) {
        transportConfig.secure = false;
        transportConfig.requireTLS = true;
    }

    const transporter = nodemailer.createTransport(transportConfig);

    // Verify connection with better error handling
    const verifyConnection = async () => {
        try {
            await transporter.verify();
            console.log('✅ Email transport verified and ready');
            return true;
        } catch (error) {
            console.error('❌ Email transport verification failed:', error.message);
            
            // Provide specific guidance based on error
            if (error.message.includes('ECONNREFUSED')) {
                console.error('📍 Connection refused. Check if the SMTP server allows connections from Render\'s IP addresses.');
            } else if (error.message.includes('ETIMEDOUT')) {
                console.error('📍 Connection timeout. The SMTP port might be blocked or the server is unreachable.');
            } else if (error.message.includes('AUTH')) {
                console.error('📍 Authentication failed. Verify your EMAIL_USER and EMAIL_PASS credentials.');
            } else if (error.message.includes('self signed certificate')) {
                console.error('📍 Certificate issue. You may need to set EMAIL_ALLOW_SELF_SIGNED=true');
            }
            
            return false;
        }
    };

    // Run verification asynchronously
    verifyConnection();

    return transporter;
};

// Enhanced send function with retry logic
const sendEmail = async (transporter, mailOptions, retries = 3) => {
    const attempt = async (attemptNumber) => {
        try {
            // Check if using JSON transport
            const isJsonTransport = transporter.transporter?.name === 'JSON' || 
                                   transporter.options?.jsonTransport;
            
            if (isJsonTransport) {
                console.warn('📧 Using JSON transport - email will NOT be sent');
                const info = await transporter.sendMail(mailOptions);
                return { success: true, messageId: info.messageId, jsonOutput: info };
            }

            console.log(`📧 Attempt ${attemptNumber}: Sending email`);
            console.log(`  To: ${Array.isArray(mailOptions.to) ? mailOptions.to.join(', ') : mailOptions.to}`);
            console.log(`  Subject: ${mailOptions.subject}`);
            
            // Add default from address if not provided
            const enrichedMailOptions = {
                ...mailOptions,
                from: mailOptions.from || process.env.EMAIL_FROM || process.env.EMAIL_USER
            };
            
            const info = await transporter.sendMail(enrichedMailOptions);
            
            console.log('✅ Email sent successfully');
            console.log(`  Message ID: ${info.messageId}`);
            if (info.response) {
                console.log(`  Server response: ${info.response}`);
            }
            
            return { 
                success: true, 
                messageId: info.messageId, 
                response: info.response,
                attempt: attemptNumber 
            };
            
        } catch (error) {
            console.error(`❌ Attempt ${attemptNumber} failed:`, error.message);
            
            // If this was not the last attempt, retry
            if (attemptNumber < retries) {
                const delay = attemptNumber * 2000; // Progressive delay
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return attempt(attemptNumber + 1);
            }
            
            // Final failure
            console.error('❌ All email send attempts failed');
            return { 
                success: false, 
                error: error.message,
                code: error.code,
                attempts: attemptNumber 
            };
        }
    };
    
    return attempt(1);
};

// Helper function to test email configuration
const testEmailConfiguration = async () => {
    console.log('🧪 Testing email configuration...');
    
    try {
        const transporter = createEmailTransport();
        
        // Try to verify the connection
        const verified = await transporter.verify();
        
        if (verified) {
            console.log('✅ Email configuration test passed!');
            return true;
        }
    } catch (error) {
        console.error('❌ Email configuration test failed:', error.message);
        return false;
    }
};

// Export functions
module.exports = {
    createEmailTransport,
    sendEmail,
    testEmailConfiguration
};