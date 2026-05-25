const { baseHtml, detailCard, infoStrip, ctaButton, escapeHtml, formatRecipientTime } = require('./base');

/**
 * Email sent to a teacher when a demo class has been assigned to them.
 *
 * @param {{
 *   teacherName?: string,
 *   studentName?: string,
 *   studentEmail?: string,
 *   studentLevel?: string,
 *   studentGoals?: string,
 *   studentExpectations?: string,
 *   demoDate?: string|Date,
 *   demoTime?: string|Date,
 *   meetingLink?: string,
 *   notes?: string,
 *   recipientTimezone?: string,
 * }} args
 */
function buildDemoScheduleTeacherTemplate({
    teacherName,
    studentName,
    studentEmail,
    studentLevel,
    studentGoals,
    studentExpectations,
    demoDate,
    demoTime,
    meetingLink,
    notes,
    recipientTimezone,
}) {
    const safeTeacher = teacherName || 'there';
    const safeStudent = studentName || 'a new student';
    const tz = recipientTimezone || 'UTC';

    const subject = `Demo class assigned: ${safeStudent}`;
    const preheader = `You'll run a demo class with ${safeStudent}.`;

    // demoDate is expected to be a full ISO timestamp (with time). demoTime is
    // accepted as a fallback for older callers.
    const moment = demoDate || demoTime || null;
    const whenStr = formatRecipientTime(moment, tz);

    const studentRows = [
        { label: 'Name', value: escapeHtml(safeStudent) },
        { label: 'Email', value: studentEmail ? escapeHtml(studentEmail) : null },
        { label: 'Level', value: studentLevel ? escapeHtml(studentLevel) : null },
    ];

    const scheduleRows = [
        { label: `Date & time (${tz})`, value: whenStr ? escapeHtml(whenStr) : null },
    ];

    const goalsStrip = studentGoals
        ? infoStrip({ tone: 'info', text: '<strong>Goals:</strong> ' + escapeHtml(studentGoals) })
        : '';
    const expectationsStrip = studentExpectations
        ? infoStrip({ tone: 'info', text: '<strong>Expectations:</strong> ' + escapeHtml(studentExpectations) })
        : '';

    const notesCard = notes
        ? detailCard({ title: 'Admin notes', rows: [{ label: 'Note', value: escapeHtml(notes) }] })
        : '';

    const cta = meetingLink ? ctaButton({ label: 'Join demo', href: meetingLink }) : '';

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">Hi <strong>${escapeHtml(safeTeacher)}</strong>,</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">
        A demo class has been assigned to you. Use this session to assess the student's level, share our approach, and help them feel welcome.
      </p>

      ${detailCard({ title: 'Student', rows: studentRows })}
      ${detailCard({ title: 'Schedule', rows: scheduleRows })}

      ${goalsStrip}
      ${expectationsStrip}

      ${notesCard}

      ${cta}

      <p style="margin: 18px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        Try to join 5 minutes early so you can sort out audio and video before the student arrives.
      </p>
    `;

    const html = baseHtml({
        subject,
        preheader,
        eyebrow: 'DEMO CLASS',
        title: 'A demo class has been assigned to you',
        bodyHtml,
    });

    const textLines = [
        `Hi ${safeTeacher},`,
        '',
        "A demo class has been assigned to you. Use this session to assess the student's level, share our approach, and help them feel welcome.",
        '',
        'STUDENT',
        ...studentRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
        '',
        'SCHEDULE',
        ...scheduleRows
            .filter(r => r.value)
            .map(r => `${r.label}: ${String(r.value).replace(/<[^>]+>/g, '')}`),
    ];
    if (studentGoals) textLines.push('', `Goals: ${studentGoals}`);
    if (studentExpectations) textLines.push('', `Expectations: ${studentExpectations}`);
    if (notes) textLines.push('', `Admin notes: ${notes}`);
    if (meetingLink) textLines.push('', `Join demo: ${meetingLink}`);
    const text = textLines.filter(Boolean).join('\n');

    return { subject, html, text };
}

module.exports = { buildDemoScheduleTeacherTemplate };
