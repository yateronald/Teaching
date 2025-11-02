const path = require('path');
const fs = require('fs');
// Use the new Brevo service instead of transport
const { sendEmail } = require('./brevoService');
const { buildEmailChangeVerificationTemplate } = require('./templates/emailChangeVerification');
const { buildPasswordResetOTPTemplate } = require('./templates/passwordResetOTP');
const { buildPasswordResetSuccessTemplate } = require('./templates/passwordResetSuccess');
const { buildEmailChangeSuccessOldTemplate, buildEmailChangeSuccessNewTemplate } = require('./templates/emailChangeSuccess');
const { buildBatchAssignmentTeacherTemplate } = require('./templates/batchAssignmentTeacher');
const { buildBatchEnrollmentStudentTemplate } = require('./templates/batchEnrollmentStudent');
const { buildWelcomeTemplate } = require('./templates/welcome');
const { buildAdminPasswordResetTemplate } = require('./templates/adminPasswordReset');
const { buildQuizNotificationTemplate } = require('./templates/quizNotification');
const { buildQuizReminderTemplate } = require('./templates/quizReminder');
const { buildClassScheduleNotificationTemplate } = require('./templates/classScheduleNotification');
const { buildClassReminderTemplate } = require('./templates/classReminder');
const { buildMeetingUpdateTemplate } = require('./templates/meetingUpdate');
const { buildMeetingCancellationTemplate } = require('./templates/meetingCancellation');
const { buildDemoScheduleStudentTemplate } = require('./templates/demoScheduleStudent');
const { buildDemoScheduleTeacherTemplate } = require('./templates/demoScheduleTeacher');

// Helper function to create consistent sender email format
function getFromEmail() {
    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com';
    const emailFromName = process.env.EMAIL_FROM_NAME || 'Learn French with Natives';
    
    // If EMAIL_FROM already contains a name in "Name <email>" format, use it as-is
    if (emailFrom.includes('<') && emailFrom.includes('>')) {
        return emailFrom;
    }
    
    // Otherwise, construct the format
    return `${emailFromName} <${emailFrom}>`;
}

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
        from: getFromEmail(),
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };

    return await sendEmail(mailOptions);
}

function buildSimpleHtmlWrapper(title, contentHtml) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${title}</title></head><body style="font-family:Arial,Helvetica,sans-serif;background:#f6f7fb;padding:24px;color:#111827;"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08)"><div style="padding:24px;">${contentHtml}</div></div></body></html>`;
}

async function sendEmailChangeNotifications({ oldEmail, newEmail, username }) {
    const from = getFromEmail();
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';

    // Old email (notice)
    const { subject: oldSubject, html: oldHtml, text: oldText } = buildEmailChangeSuccessOldTemplate({ username, oldEmail, newEmail, logoCid });
    // New email (success)
    const { subject: newSubject, html: newHtml, text: newText } = buildEmailChangeSuccessNewTemplate({ username, newEmail, logoCid });

    const attachments = logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : [];
    const results = [];
    results.push(await sendEmail({ from, to: oldEmail, subject: oldSubject, html: oldHtml, text: oldText, attachments }));
    results.push(await sendEmail({ from, to: newEmail, subject: newSubject, html: newHtml, text: newText, attachments }));
    return results;
}

async function sendPasswordResetOTP({ to, username, code }) {
    const { subject, html, text } = buildPasswordResetOTPTemplate({ username, code });

    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };

    return await sendEmail(mailOptions);
}

async function sendPasswordResetSuccess({ to, username }) {
    const { subject, html, text } = buildPasswordResetSuccessTemplate({ username });

    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };

    return await sendEmail(mailOptions);
}

async function sendBatchAssignmentToTeacher({ to, teacherName, batchName, frenchLevel, startDate, endDate, schedules, studentCount }) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildBatchAssignmentTeacherTemplate({ 
        teacherName, 
        batchName, 
        frenchLevel, 
        startDate, 
        endDate, 
        schedules, 
        logoCid, 
        studentCount 
    });

    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text
    };

    return await sendEmail(mailOptions);
}

async function sendBatchEnrollmentToStudent({ to, studentName, batchName, teacherName, frenchLevel, startDate, endDate, schedules, studentCount }) {
    const logoPath = resolveLogoFile();
    const logoCid = logoPath ? 'logo' : null;
    
    const { subject, html, text } = buildBatchEnrollmentStudentTemplate({ 
        studentName, 
        batchName, 
        frenchLevel,
        startDate, 
        endDate, 
        schedules,
        logoCid,
        studentCount
    });

    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{
            filename: 'logo.png',
            path: logoPath,
            cid: 'logo'
        }] : []
    };

    return await sendEmail(mailOptions);
}

// New: Welcome email for newly created users (admin-created)
async function sendWelcomeEmail({ to, username, tempPassword }) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const from = getFromEmail();
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
    return await sendEmail(mailOptions);
}

// New: Admin-initiated password reset notification with temp password
async function sendAdminPasswordReset({ to, username, tempPassword }) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const from = getFromEmail();
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
    return await sendEmail(mailOptions);
}

// New: Quiz notification email when quiz is published
async function sendQuizNotification({ to, studentName, quizName, teacherName, batchName, duration, startDate, endDate, totalPoints }) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const from = getFromEmail();

    const { subject, html, text } = buildQuizNotificationTemplate({ 
        studentName, 
        quizName, 
        teacherName, 
        batchName, 
        duration, 
        startDate, 
        endDate, 
        totalPoints, 
        logoCid 
    });

    const mailOptions = {
        from,
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };
    return await sendEmail(mailOptions);
}

// New: Quiz reminder email 5 minutes before quiz starts
async function sendQuizReminder({ to, studentName, quizTitle, dueDate, quizLink }) {
    const { subject, html, text } = buildQuizReminderTemplate({ studentName, quizTitle, dueDate, quizLink });

    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text
    };

    return await sendEmail(mailOptions);
}

// New: Class schedule notification to students
async function sendClassScheduleNotification({ 
    to, 
    studentName, 
    className, 
    teacherName, 
    batchName, 
    frenchLevel, 
    startTime, 
    endTime, 
    date, 
    location, 
    locationMode, 
    link, 
    description 
}) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildClassScheduleNotificationTemplate({ 
        studentName, 
        className, 
        teacherName, 
        batchName, 
        frenchLevel, 
        startTime, 
        endTime, 
        date, 
        location, 
        locationMode, 
        link, 
        description, 
        logoCid 
    });

    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };

    return await sendEmail(mailOptions);
}

// New: Class reminder to students (5 minutes before)
async function sendClassReminder({ 
    to, 
    studentName, 
    className, 
    teacherName, 
    batchName, 
    startTime, 
    endTime, 
    date, 
    location, 
    locationMode, 
    link 
}) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildClassReminderTemplate({ 
        studentName, 
        className, 
        teacherName, 
        batchName, 
        startTime, 
        endTime, 
        date, 
        location, 
        locationMode, 
        link, 
        logoCid 
    });

    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };

    return await sendEmail(mailOptions);
}

// New: Meeting update notification
async function sendMeetingUpdate({
    to,
    studentName,
    meetingTitle,
    teacherName,
    batchName,
    date,
    startTime,
    endTime,
    locationMode,
    location,
    link,
    description,
    changes
}) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildMeetingUpdateTemplate({
        studentName,
        meetingTitle,
        teacherName,
        batchName,
        date,
        startTime,
        endTime,
        locationMode,
        location,
        link,
        description,
        changes,
        logoCid
    });

    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };

    return await sendEmail(mailOptions);
}

// New: Meeting cancellation notification
async function sendMeetingCancellation({
    to,
    studentName,
    meetingTitle,
    teacherName,
    batchName,
    originalDate,
    originalStartTime,
    originalEndTime,
    locationMode,
    location,
    link,
    reason
}) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildMeetingCancellationTemplate({
        studentName,
        meetingTitle,
        teacherName,
        batchName,
        originalDate,
        originalStartTime,
        originalEndTime,
        locationMode,
        location,
        link,
        reason,
        logoCid
    });

    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };

    return await sendEmail(mailOptions);
}

// New: Demo scheduling notification to students
async function sendDemoScheduleNotificationToStudent({ 
    to, 
    studentName, 
    teacherName, 
    teacherEmail,
    demoDate, 
    meetingLink, 
    notes 
}) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildDemoScheduleStudentTemplate({ 
        studentName, 
        teacherName, 
        teacherEmail,
        demoDate, 
        demoTime: demoDate, // Using the same date for time formatting
        meetingLink, 
        notes,
        logoCid 
    });

    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };

    return await sendEmail(mailOptions);
}

// New: Demo scheduling notification to teachers
async function sendDemoScheduleNotificationToTeacher({ 
    to, 
    teacherName, 
    studentName,
    studentEmail,
    studentLevel,
    studentGoals,
    studentExpectations,
    demoDate, 
    meetingLink, 
    notes 
}) {
    const logoPath = resolveLogoFile();
    const logoCid = 'brand-logo@lfwn';
    const { subject, html, text } = buildDemoScheduleTeacherTemplate({ 
        teacherName, 
        studentName,
        studentEmail,
        studentLevel,
        studentGoals,
        studentExpectations,
        demoDate, 
        demoTime: demoDate, // Using the same date for time formatting
        meetingLink, 
        notes,
        logoCid 
    });

    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text,
        attachments: logoPath ? [{ filename: 'logo.png', path: logoPath, cid: logoCid }] : []
    };

    return await sendEmail(mailOptions);
}

async function sendAccessCodeEmail({ to, subject, html, text }) {
    const mailOptions = {
        from: getFromEmail(),
        to,
        subject,
        html,
        text
    };

    return await sendEmail(mailOptions);
}

module.exports = {
    sendEmailChangeVerification,
    sendEmailChangeNotifications,
    sendPasswordResetOTP,
    sendPasswordResetSuccess,
    sendBatchAssignmentToTeacher,
    sendBatchEnrollmentToStudent,
    sendWelcomeEmail,
    sendAdminPasswordReset,
    sendQuizNotification,
    sendQuizReminder,
    sendClassScheduleNotification,
    sendClassReminder,
    sendMeetingUpdate,
    sendMeetingCancellation,
    sendDemoScheduleNotificationToStudent,
    sendDemoScheduleNotificationToTeacher,
    sendAccessCodeEmail
};