// Dedicated Brevo Email Service
const SibApiV3Sdk = require('sib-api-v3-sdk');
const fs = require('fs');
const path = require('path');

// Load environment variables
(() => {
  const backendRoot = path.join(__dirname, '..');
  const envPath = fs.existsSync(path.join(backendRoot, '.env'))
    ? path.join(backendRoot, '.env')
    : (fs.existsSync(path.join(backendRoot, '.env.postgres'))
        ? path.join(backendRoot, '.env.postgres')
        : null);
  if (envPath) {
    require('dotenv').config({ path: envPath });
    console.log(`📧 Brevo Service: Loaded environment from ${path.basename(envPath)}`);
  } else {
    require('dotenv').config();
  }
})();

class BrevoEmailService {
    constructor() {
        this.apiKey = process.env.BREVO_API_KEY;
        
        // Parse the EMAIL_FROM to extract email and name properly
        const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com';
        const parsedFrom = BrevoEmailService.parseEmailAddressStatic(emailFrom);
        
        this.fromEmail = parsedFrom.email;
        this.fromName = process.env.EMAIL_FROM_NAME || parsedFrom.name || 'Learn French with Natives';
        
        this.initialized = false;
        this.apiInstance = null;
        
        this.init();
    }
    
    init() {
        try {
            // Validate API key
            if (!this.apiKey) {
                throw new Error('BREVO_API_KEY environment variable is required but not set');
            }
            
            // Configure Brevo API
            const defaultClient = SibApiV3Sdk.ApiClient.instance;
            const apiKeyAuth = defaultClient.authentications['api-key'];
            apiKeyAuth.apiKey = this.apiKey;
            
            this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
            this.initialized = true;
            
            console.log('✅ Brevo Email Service initialized successfully');
            console.log(`📧 Default sender: ${this.fromName} <${this.fromEmail}>`);
            
        } catch (error) {
            console.error('❌ Failed to initialize Brevo Email Service:', error.message);
            this.initialized = false;
        }
    }
    
    async testConnection() {
        if (!this.initialized) {
            throw new Error('Brevo service not initialized');
        }
        
        try {
            const accountApi = new SibApiV3Sdk.AccountApi();
            const account = await accountApi.getAccount();
            console.log('✅ Brevo connection test successful');
            return {
                success: true,
                email: account.email,
                plan: account.plan[0]?.type || 'unknown',
                credits: account.plan[0]?.credits || 0
            };
        } catch (error) {
            console.error('❌ Brevo connection test failed:', error.message);
            throw error;
        }
    }
    
    static parseEmailAddressStatic(emailInput) {
        if (typeof emailInput === 'object' && emailInput.email) {
            return {
                email: emailInput.email,
                name: emailInput.name || emailInput.email.split('@')[0] // Use email prefix as default name
            };
        }
        
        if (typeof emailInput === 'string') {
            // Handle "Name <email>" format
            const match = emailInput.match(/^(.+?)\s*<(.+)>$/);
            if (match) {
                return {
                    email: match[2].trim(),
                    name: match[1].trim()
                };
            }
            
            // Simple email format - use email prefix as default name
            const email = emailInput.trim();
            return {
                email: email,
                name: email.split('@')[0] // Use part before @ as default name
            };
        }
        
        throw new Error('Invalid email format');
    }

    parseEmailAddress(emailInput) {
        return BrevoEmailService.parseEmailAddressStatic(emailInput);
    }
    
    async processAttachments(attachments) {
        if (!attachments || attachments.length === 0) {
            return [];
        }
        
        const brevoAttachments = [];
        
        for (const attachment of attachments) {
            try {
                let content;
                let name = attachment.filename || attachment.name || 'attachment';
                
                if (attachment.path && fs.existsSync(attachment.path)) {
                    // Read file and convert to base64
                    const fileContent = fs.readFileSync(attachment.path);
                    content = fileContent.toString('base64');
                    console.log(`📎 Processed attachment: ${name} (from file)`);
                } else if (attachment.content) {
                    // Use provided content (assume it's already base64 or convert if needed)
                    content = Buffer.isBuffer(attachment.content) 
                        ? attachment.content.toString('base64')
                        : attachment.content;
                    console.log(`📎 Processed attachment: ${name} (from content)`);
                } else {
                    console.warn(`⚠️ Skipping attachment ${name}: no valid path or content`);
                    continue;
                }
                
                brevoAttachments.push({
                    name: name,
                    content: content
                });
                
            } catch (error) {
                console.error(`❌ Failed to process attachment ${attachment.filename || 'unknown'}:`, error.message);
            }
        }
        
        return brevoAttachments;
    }
    
    async sendEmail(mailOptions) {
        if (!this.initialized) {
            throw new Error('Brevo service not initialized');
        }
        
        try {
            console.log(`📧 Brevo: Sending email to ${mailOptions.to}`);
            console.log(`📧 Subject: ${mailOptions.subject}`);
            
            // Parse sender
            const sender = this.parseEmailAddress(mailOptions.from || {
                email: this.fromEmail,
                name: this.fromName
            });
            
            // Parse recipients
            const toAddresses = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
            const recipients = toAddresses.map(to => this.parseEmailAddress(to));
            
            // Process attachments
            const attachments = await this.processAttachments(mailOptions.attachments);
            
            // Create Brevo email object
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            
            // Set sender
            sendSmtpEmail.sender = sender;
            
            // Set recipients
            sendSmtpEmail.to = recipients;
            
            // Set subject
            sendSmtpEmail.subject = mailOptions.subject;
            
            // Set content
            if (mailOptions.html) {
                sendSmtpEmail.htmlContent = mailOptions.html;
            }
            
            if (mailOptions.text) {
                sendSmtpEmail.textContent = mailOptions.text;
            } else if (mailOptions.html) {
                // Create simple text version from HTML
                sendSmtpEmail.textContent = mailOptions.html
                    .replace(/<[^>]*>/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            }
            
            // Set attachments
            if (attachments.length > 0) {
                sendSmtpEmail.attachment = attachments;
                console.log(`📎 ${attachments.length} attachment(s) added`);
            }
            
            // Handle CC
            if (mailOptions.cc) {
                const ccAddresses = Array.isArray(mailOptions.cc) ? mailOptions.cc : [mailOptions.cc];
                sendSmtpEmail.cc = ccAddresses.map(cc => this.parseEmailAddress(cc));
            }
            
            // Handle BCC
            if (mailOptions.bcc) {
                const bccAddresses = Array.isArray(mailOptions.bcc) ? mailOptions.bcc : [mailOptions.bcc];
                sendSmtpEmail.bcc = bccAddresses.map(bcc => this.parseEmailAddress(bcc));
            }
            
            // Handle Reply-To
            if (mailOptions.replyTo) {
                sendSmtpEmail.replyTo = this.parseEmailAddress(mailOptions.replyTo);
            }
            
            // Send email
            const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            
            console.log(`✅ Brevo: Email sent successfully`);
            console.log(`📧 Message ID: ${result.messageId}`);
            
            return {
                messageId: result.messageId,
                success: true
            };
            
        } catch (error) {
            console.error('❌ Brevo email send failed:', error.message);
            
            if (error.response && error.response.body) {
                console.error('Error details:', JSON.stringify(error.response.body, null, 2));
            }
            
            throw new Error(`Brevo email failed: ${error.message}`);
        }
    }
    
    async sendEmailWithRetry(mailOptions, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📧 Attempt ${attempt}: Sending email via Brevo`);
                const result = await this.sendEmail(mailOptions);
                return result;
            } catch (error) {
                lastError = error;
                console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
                
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        console.log(`❌ All ${maxRetries} email send attempts failed`);
        throw lastError;
    }
}

// Create singleton instance
const brevoService = new BrevoEmailService();

module.exports = {
    BrevoEmailService,
    brevoService,
    sendEmail: (mailOptions) => brevoService.sendEmailWithRetry(mailOptions),
    testConnection: () => brevoService.testConnection()
};