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

const SibApiV3Sdk = require('sib-api-v3-sdk');

// Brevo API configuration
const createEmailTransport = () => {
    // Use the Brevo API key - can be set via environment variable or use the provided one
    const apiKey = process.env.BREVO_API_KEY ;
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'French Learning Platform';
    
    // Log environment status
    console.log('🔧 Brevo Email Configuration Status:');
    console.log(`  - BREVO_API_KEY: ${apiKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`  - FROM_EMAIL: ${fromEmail}`);
    console.log(`  - FROM_NAME: ${fromName}`);
    console.log(`  - Environment: ${process.env.NODE_ENV || 'production'}`);

    if (!apiKey) {
        console.error('❌ CRITICAL: Brevo API key is missing!');
        console.error('Please set BREVO_API_KEY environment variable.');
        
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Brevo API key (BREVO_API_KEY) is required in production');
        }
        
        // Development fallback - return a mock transport
        console.warn('Using mock transport for development (emails will NOT be sent)');
        return {
            sendMail: async (mailOptions) => {
                console.log('📧 Mock email send:', {
                    to: mailOptions.to,
                    subject: mailOptions.subject,
                    from: mailOptions.from
                });
                return {
                    messageId: `mock-${Date.now()}@brevo.com`,
                    response: 'Mock email sent successfully'
                };
            },
            verify: async () => true
        };
    }

    // Configure Brevo API client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = apiKey;

    // Create API instances
    const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const accountApi = new SibApiV3Sdk.AccountApi();

    console.log('📧 Configuring Brevo API transport');

    // Create a nodemailer-compatible interface
    const brevoTransport = {
        // Verify connection by testing API
        verify: async () => {
            try {
                const accountInfo = await accountApi.getAccount();
                console.log('✅ Brevo API connection verified');
                console.log(`  Account: ${accountInfo.email}`);
                console.log(`  Plan: ${accountInfo.plan[0].type}`);
                console.log(`  Email credits: ${accountInfo.plan[0].credits}`);
                return true;
            } catch (error) {
                console.error('❌ Brevo API verification failed:', error.message);
                throw error;
            }
        },

        // Send email using Brevo API
        sendMail: async (mailOptions) => {
            try {
                const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

                // Set email content
                sendSmtpEmail.subject = mailOptions.subject;
                
                // Handle both HTML and text content
                if (mailOptions.html) {
                    sendSmtpEmail.htmlContent = mailOptions.html;
                }
                if (mailOptions.text) {
                    sendSmtpEmail.textContent = mailOptions.text;
                }
                
                // If only HTML is provided, create a text version
                if (mailOptions.html && !mailOptions.text) {
                    // Simple HTML to text conversion
                    sendSmtpEmail.textContent = mailOptions.html
                        .replace(/<[^>]*>/g, '') // Remove HTML tags
                        .replace(/\s+/g, ' ') // Normalize whitespace
                        .trim();
                }

                // Set sender
                let senderEmail, senderName;
                
                if (typeof mailOptions.from === 'object' && mailOptions.from.email) {
                    // Handle object format: { name: 'Name', email: 'email@domain.com' }
                    senderEmail = mailOptions.from.email;
                    senderName = mailOptions.from.name || fromName;
                } else {
                    // Handle string format or fallback to default
                    const fromString = mailOptions.from || fromEmail;
                    senderName = fromName;
                    
                    // Extract email from "Name <email>" format if needed
                    if (typeof fromString === 'string' && fromString.includes('<')) {
                        const emailMatch = fromString.match(/<(.+)>/);
                        senderEmail = emailMatch ? emailMatch[1] : fromString;
                    } else {
                        senderEmail = fromString;
                    }
                }
                
                sendSmtpEmail.sender = {
                    name: senderName,
                    email: senderEmail
                };

                // Set recipients
                const recipients = [];
                const toAddresses = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
                
                for (const to of toAddresses) {
                    if (typeof to === 'string') {
                        // Handle "Name <email>" format
                        const match = to.match(/^(.+?)\s*<(.+)>$/);
                        if (match) {
                            recipients.push({
                                name: match[1].trim(),
                                email: match[2].trim()
                            });
                        } else {
                            recipients.push({
                                email: to.trim()
                            });
                        }
                    } else if (to.email) {
                        recipients.push(to);
                    }
                }
                
                sendSmtpEmail.to = recipients;

                // Set reply-to if provided
                if (mailOptions.replyTo) {
                    const replyToEmail = typeof mailOptions.replyTo === 'string' 
                        ? mailOptions.replyTo 
                        : mailOptions.replyTo.email;
                    const replyToName = typeof mailOptions.replyTo === 'object' 
                        ? mailOptions.replyTo.name 
                        : fromName;
                    
                    sendSmtpEmail.replyTo = {
                        email: replyToEmail,
                        name: replyToName
                    };
                }

                // Handle CC and BCC if provided
                if (mailOptions.cc) {
                    const ccAddresses = Array.isArray(mailOptions.cc) ? mailOptions.cc : [mailOptions.cc];
                    sendSmtpEmail.cc = ccAddresses.map(cc => 
                        typeof cc === 'string' ? { email: cc } : cc
                    );
                }

                if (mailOptions.bcc) {
                    const bccAddresses = Array.isArray(mailOptions.bcc) ? mailOptions.bcc : [mailOptions.bcc];
                    sendSmtpEmail.bcc = bccAddresses.map(bcc => 
                        typeof bcc === 'string' ? { email: bcc } : bcc
                    );
                }

                // Handle attachments - Convert to Brevo format
                if (mailOptions.attachments && mailOptions.attachments.length > 0) {
                    const fs = require('fs');
                    const brevoAttachments = [];
                    
                    for (const attachment of mailOptions.attachments) {
                        try {
                            if (attachment.path && fs.existsSync(attachment.path)) {
                                // Read file and convert to base64
                                const fileContent = fs.readFileSync(attachment.path);
                                const base64Content = fileContent.toString('base64');
                                
                                brevoAttachments.push({
                                    name: attachment.filename || attachment.name || 'attachment',
                                    content: base64Content
                                });
                                
                                console.log(`📎 Attachment processed: ${attachment.filename || attachment.name}`);
                            } else if (attachment.content) {
                                // Handle pre-encoded content
                                brevoAttachments.push({
                                    name: attachment.filename || attachment.name || 'attachment',
                                    content: attachment.content
                                });
                            } else {
                                console.warn(`⚠️ Skipping invalid attachment: ${JSON.stringify(attachment)}`);
                            }
                        } catch (attachmentError) {
                            console.error(`❌ Failed to process attachment: ${attachmentError.message}`);
                            // Continue with other attachments
                        }
                    }
                    
                    if (brevoAttachments.length > 0) {
                        sendSmtpEmail.attachment = brevoAttachments;
                        console.log(`📎 ${brevoAttachments.length} attachment(s) added to email`);
                    }
                }

                // Send the email
                const result = await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
                
                return {
                    messageId: result.messageId,
                    response: `Email sent successfully via Brevo API`,
                    messageUuid: result.messageUuid
                };

            } catch (error) {
                console.error('❌ Brevo email send failed:', error.message);
                if (error.response && error.response.body) {
                    console.error('Error details:', JSON.stringify(error.response.body, null, 2));
                }
                throw error;
            }
        }
    };

    return brevoTransport;
};

// Enhanced send function with retry logic (compatible with existing code)
const sendEmail = async (transporter, mailOptions, retries = 3) => {
    const attempt = async (attemptNumber) => {
        try {
            console.log(`📧 Attempt ${attemptNumber}: Sending email via Brevo`);
            console.log(`  To: ${Array.isArray(mailOptions.to) ? mailOptions.to.join(', ') : mailOptions.to}`);
            console.log(`  Subject: ${mailOptions.subject}`);
            
            const info = await transporter.sendMail(mailOptions);
            
            console.log('✅ Email sent successfully via Brevo');
            console.log(`  Message ID: ${info.messageId}`);
            if (info.response) {
                console.log(`  Response: ${info.response}`);
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
                code: error.code || error.status,
                attempts: attemptNumber 
            };
        }
    };
    
    return attempt(1);
};

// Helper function to test email configuration
const testEmailConfiguration = async () => {
    console.log('🧪 Testing Brevo email configuration...');
    
    try {
        const transporter = createEmailTransport();
        
        // Try to verify the connection
        const verified = await transporter.verify();
        
        if (verified) {
            console.log('✅ Brevo email configuration test passed!');
            return true;
        }
    } catch (error) {
        console.error('❌ Brevo email configuration test failed:', error.message);
        return false;
    }
};

// Export functions
module.exports = {
    createEmailTransport,
    sendEmail,
    testEmailConfiguration
};