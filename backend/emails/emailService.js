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
const { buildMeetingScheduledTemplate } = require('./templates/meetingScheduled');
const { buildDemoScheduleStudentTemplate } = require('./templates/demoScheduleStudent');
const { buildDemoScheduleTeacherTemplate } = require('./templates/demoScheduleTeacher');

// ─────────────────────────────────────────────────────────────────────────
// Sender helper
// ─────────────────────────────────────────────────────────────────────────
function getFromEmail() {
    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com';
    const emailFromName = process.env.EMAIL_FROM_NAME || 'Learn French with Natives';
    if (emailFrom.includes('<') && emailFrom.includes('>')) return emailFrom;
    return `${emailFromName} <${emailFrom}>`;
}

const APP_BASE = (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '');

// All new templates render the brand logo via a hosted <img src=…> URL inside
// baseHtml — they do NOT need an inline attachment any more. We just call the
// builder, then post the message. No attachments anywhere.

// ─────────────────────────────────────────────────────────────────────────
// Account & security
// ─────────────────────────────────────────────────────────────────────────
async function sendEmailChangeVerification({ to, username, oldEmail, newEmail, code }) {
    const { subject, html, text } = buildEmailChangeVerificationTemplate({ username, oldEmail, newEmail, code });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

async function sendEmailChangeNotifications({ oldEmail, newEmail, username }) {
    const from = getFromEmail();
    const oldT = buildEmailChangeSuccessOldTemplate({ username, oldEmail, newEmail });
    const newT = buildEmailChangeSuccessNewTemplate({ username, oldEmail, newEmail });
    const results = [];
    results.push(await sendEmail({ from, to: oldEmail, subject: oldT.subject, html: oldT.html, text: oldT.text }));
    results.push(await sendEmail({ from, to: newEmail, subject: newT.subject, html: newT.html, text: newT.text }));
    return results;
}

async function sendPasswordResetOTP({ to, username, code }) {
    const { subject, html, text } = buildPasswordResetOTPTemplate({ username, code });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

async function sendPasswordResetSuccess({ to, username }) {
    const { subject, html, text } = buildPasswordResetSuccessTemplate({ username });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

async function sendWelcomeEmail({ to, username, tempPassword }) {
    const loginUrl = `${APP_BASE}/login`;
    const { subject, html, text } = buildWelcomeTemplate({ username, tempPassword, loginUrl });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

async function sendAdminPasswordReset({ to, username, tempPassword }) {
    const loginUrl = `${APP_BASE}/login`;
    const { subject, html, text } = buildAdminPasswordResetTemplate({ username, tempPassword, loginUrl });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

// ─────────────────────────────────────────────────────────────────────────
// Batches (assignments / enrollments)
// ─────────────────────────────────────────────────────────────────────────
async function sendBatchAssignmentToTeacher({ to, teacherName, batchName, frenchLevel, startDate, endDate, schedules, studentCount }) {
    const { subject, html, text } = buildBatchAssignmentTeacherTemplate({
        teacherName, batchName, frenchLevel, startDate, endDate, schedules, studentCount,
    });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

async function sendBatchEnrollmentToStudent({ to, studentName, batchName, teacherName, frenchLevel, startDate, endDate, schedules, studentCount }) {
    const { subject, html, text } = buildBatchEnrollmentStudentTemplate({
        studentName, batchName, teacherName, frenchLevel, startDate, endDate, schedules, studentCount,
    });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

// ─────────────────────────────────────────────────────────────────────────
// Quizzes
// ─────────────────────────────────────────────────────────────────────────
async function sendQuizNotification({ to, studentName, quizName, teacherName, batchName, duration, startDate, endDate, totalPoints, recipientTimezone }) {
    const { subject, html, text } = buildQuizNotificationTemplate({
        studentName, quizName, teacherName, batchName, duration, startDate, endDate, totalPoints, recipientTimezone,
    });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

async function sendQuizReminder({ to, studentName, quizTitle, dueDate, quizLink, recipientTimezone }) {
    const { subject, html, text } = buildQuizReminderTemplate({ studentName, quizTitle, dueDate, quizLink, recipientTimezone });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

// ─────────────────────────────────────────────────────────────────────────
// Class schedules + reminders (Schedule feature, NOT live meetings)
// ─────────────────────────────────────────────────────────────────────────
async function sendClassScheduleNotification({
    to, studentName, className, teacherName, batchName, frenchLevel,
    startTime, endTime, date, location, locationMode, link, description, recipientTimezone,
}) {
    const { subject, html, text } = buildClassScheduleNotificationTemplate({
        studentName, className, teacherName, batchName, frenchLevel,
        startTime, endTime, date, location, locationMode, link, description, recipientTimezone,
    });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

async function sendClassReminder({
    to, studentName, className, teacherName, batchName,
    startTime, endTime, date, location, locationMode, link, recipientTimezone,
}) {
    const { subject, html, text } = buildClassReminderTemplate({
        studentName, className, teacherName, batchName,
        startTime, endTime, date, location, locationMode, link, recipientTimezone,
    });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

// ─────────────────────────────────────────────────────────────────────────
// Live meetings (virtual classroom)
// ─────────────────────────────────────────────────────────────────────────
async function sendMeetingScheduledNotification({
    to, studentName, meetingTitle, teacherName, batchName,
    scheduledStart, scheduledEnd, description, joinUrl, recipientTimezone,
}) {
    const { subject, html, text } = buildMeetingScheduledTemplate({
        studentName, meetingTitle, teacherName, batchName,
        scheduledStart, scheduledEnd, description, joinUrl, recipientTimezone,
    });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

async function sendMeetingUpdate({
    to, studentName, meetingTitle, teacherName, batchName,
    date, startTime, endTime, locationMode, location, link, description, changes, recipientTimezone,
}) {
    const { subject, html, text } = buildMeetingUpdateTemplate({
        studentName, meetingTitle, teacherName, batchName,
        date, startTime, endTime, locationMode, location, link, description, changes, recipientTimezone,
    });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

async function sendMeetingCancellation({
    to, studentName, meetingTitle, teacherName, batchName,
    originalDate, originalStartTime, originalEndTime, locationMode, location, link, reason, recipientTimezone,
}) {
    const { subject, html, text } = buildMeetingCancellationTemplate({
        studentName, meetingTitle, teacherName, batchName,
        originalDate, originalStartTime, originalEndTime, locationMode, location, link, reason, recipientTimezone,
    });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

// ─────────────────────────────────────────────────────────────────────────
// Demo scheduling
// ─────────────────────────────────────────────────────────────────────────
async function sendDemoScheduleNotificationToStudent({
    to, studentName, teacherName, teacherEmail, demoDate, meetingLink, notes, recipientTimezone,
}) {
    const { subject, html, text } = buildDemoScheduleStudentTemplate({
        studentName, teacherName, teacherEmail,
        demoDate, demoTime: demoDate, meetingLink, notes, recipientTimezone,
    });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

async function sendDemoScheduleNotificationToTeacher({
    to, teacherName, studentName, studentEmail, studentLevel, studentGoals, studentExpectations,
    demoDate, meetingLink, notes, recipientTimezone,
}) {
    const { subject, html, text } = buildDemoScheduleTeacherTemplate({
        teacherName, studentName, studentEmail, studentLevel, studentGoals, studentExpectations,
        demoDate, demoTime: demoDate, meetingLink, notes, recipientTimezone,
    });
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
}

// ─────────────────────────────────────────────────────────────────────────
// Attendance access code (template builds its own subject/html/text)
// ─────────────────────────────────────────────────────────────────────────
async function sendAccessCodeEmail({ to, subject, html, text }) {
    return sendEmail({ from: getFromEmail(), to, subject, html, text });
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
    sendMeetingScheduledNotification,
    sendMeetingUpdate,
    sendMeetingCancellation,
    sendDemoScheduleNotificationToStudent,
    sendDemoScheduleNotificationToTeacher,
    sendAccessCodeEmail,
};
