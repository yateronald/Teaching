const nodemailer = require('nodemailer');

const createEmailTransport = () => {
  const user = process.env.EMAIL_USER; // e.g. no-reply@yourdomain.com
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn(
      'Email credentials missing (EMAIL_USER/EMAIL_PASS). Using JSON transport (no emails sent).'
    );
    return nodemailer.createTransport({ jsonTransport: true });
  }

  const host = process.env.EMAIL_HOST || 'smtp.hostinger.com';

  // Prefer 587 (STARTTLS). Use 465 only if you must.
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = port === 465; // true for 465, false for 587

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    // conservative timeouts (Render can be slower on cold starts)
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
    // DO NOT add custom tls ciphers/protocols; let Node/Nodemailer negotiate
    // requireTLS helps ensure STARTTLS is used on 587
    requireTLS: !secure && true,
    pool: false,
    maxConnections: 1,
    maxMessages: 1,
    logger: process.env.NODE_ENV === 'development',
    debug: process.env.NODE_ENV === 'development',
  });

  // Avoid verify() in production – it often times out on PaaS networks
  if (process.env.EMAIL_VERIFY === 'true') {
    transporter.verify().then(
      () => console.log('✅ SMTP ready'),
      (err) => console.warn('SMTP verify failed (continuing):', err.message)
    );
  }

  return transporter;
};

const sendEmail = async (transporter, mailOptions) => {
  try {
    // Make sure "from" matches the authenticated mailbox or an allowed alias
    if (!mailOptions.from) mailOptions.from = process.env.EMAIL_USER;

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (err) {
    console.error('❌ Email sending failed:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { createEmailTransport, sendEmail };
