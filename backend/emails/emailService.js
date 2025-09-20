const path = require('path');
const fs = require('fs');
const { createEmailTransport, sendEmail } = require('./transport');
const { buildEmailChangeVerificationTemplate } = require('./templates/emailChangeVerification');
const { buildPasswordResetOTPTemplate } = require('./templates/passwordResetOTP');
const { buildPasswordResetSuccessTemplate } = require('./templates/passwordResetSuccess');
const { buildEmailChangeSuccessOldTemplate, buildEmailChangeSuccessNewTemplate } = require('./templates/emailChangeSuccess');
const { buildBatchAssignmentTeacherTemplate } = require('./templates/batchAssignmentTeacher');
const { buildBatchEnrollmentStudentTemplate } = require('./templates/batchEnrollmentStudent');
const { buildWelcomeTemplate } = require('./templates/welcome');
const { buildAdminPasswordResetTemplate } = require('./templates/adminPasswordReset');

const transporter = createEmailTransport();

function resolveLogoFile() {
    // Prefer frontend/src/assets/Logo.png, fallback to frontend/public/assets/Logo.png
    const candidates = [
        path.join(__dirname, '..', '..', 'frontend', 'src', 'assets', 'Logo.png'),
        path.join(__dirname, '..', '..', 'frontend', 'public', 'assets', 'Logo.png')
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

async function sendEmailChangeVerification({ to, username, oldEmail, newEmail, code }) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildEmailChangeVerificationTemplate({ username, oldEmail, newEmail, code, logoCid });

    const mailOptions = {
        from: `Learn French with Natives <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com'}>`,
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };

    return await sendEmail(transporter, mailOptions);
}

function buildSimpleHtmlWrapper(title, contentHtml) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${title}</title></head><body style="font-family:Arial,Helvetica,sans-serif;background:#f6f7fb;padding:24px;color:#111827;"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08)"><div style="padding:24px;">${contentHtml}</div></div></body></html>`;
}

async function sendEmailChangeNotifications({ oldEmail, newEmail, username }) {
    const from = `Learn French with Natives <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com'}>`;
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';

    // Old email (notice)
    const { subject: oldSubject, html: oldHtml, text: oldText } = buildEmailChangeSuccessOldTemplate({ username, oldEmail, newEmail, logoCid });
    // New email (success)
    const { subject: newSubject, html: newHtml, text: newText } = buildEmailChangeSuccessNewTemplate({ username, newEmail, logoCid });

    const attachments = logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : [];
    const results = [];
    results.push(await sendEmail(transporter, { from, to: oldEmail, subject: oldSubject, html: oldHtml, text: oldText, attachments }));
    results.push(await sendEmail(transporter, { from, to: newEmail, subject: newSubject, html: newHtml, text: newText, attachments }));
    return results;
}

async function sendPasswordResetOTP({ to, username, code }) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildPasswordResetOTPTemplate({ username, code, logoCid });
    const mailOptions = {
        from: `Learn French with Natives <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com'}>`,
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };
    return await sendEmail(transporter, mailOptions);
}

async function sendPasswordResetSuccess({ to, username }) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildPasswordResetSuccessTemplate({ username, logoCid });
    const mailOptions = {
        from: `Learn French with Natives <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com'}>`,
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };
    return await sendEmail(transporter, mailOptions);
}

// New: batch assignment/enrollment emails
async function sendBatchAssignmentToTeacher({ to, teacherName, batchName, frenchLevel, startDate, endDate, schedules }) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildBatchAssignmentTeacherTemplate({ teacherName, batchName, frenchLevel, startDate, endDate, schedules, logoCid, studentCount: arguments[0]?.studentCount });
    const mailOptions = {
        from: `Learn French with Natives <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com'}>`,
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };
    return await sendEmail(transporter, mailOptions);
}

async function sendBatchEnrollmentToStudent({ to, studentName, batchName, frenchLevel, startDate, endDate, schedules }) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildBatchEnrollmentStudentTemplate({ studentName, batchName, frenchLevel, startDate, endDate, schedules, logoCid, studentCount: arguments[0]?.studentCount });
    const mailOptions = {
        from: `Learn French with Natives <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com'}>`,
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };
    return await sendEmail(transporter, mailOptions);
}

// New: Welcome email for newly created users (admin-created)
async function sendWelcomeEmail({ to, username, tempPassword }) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const from = `Learn French with Natives <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com'}>`;
    const appBase = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const loginUrl = `${appBase}/login`;

    const { subject, html, text } = buildWelcomeTemplate({ username, tempPassword, loginUrl, logoCid });

    const mailOptions = {
        from,
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };
    return await sendEmail(transporter, mailOptions);
}

// New: Admin-initiated password reset notification with temp password
async function sendAdminPasswordReset({ to, username, tempPassword }) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const from = `Learn French with Natives <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com'}>`;
    const appBase = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const loginUrl = `${appBase}/login`;

    const { subject, html, text } = buildAdminPasswordResetTemplate({ username, tempPassword, loginUrl, logoCid });

    const mailOptions = {
        from,
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };
    return await sendEmail(transporter, mailOptions);
}

module.exports = {
    sendEmailChangeVerification,
    sendEmailChangeNotifications,
    sendPasswordResetOTP,
    sendPasswordResetSuccess,
    sendBatchAssignmentToTeacher,
    sendBatchEnrollmentToStudent,
    sendWelcomeEmail,
    sendAdminPasswordReset
};