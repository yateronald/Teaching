function baseHtml({ subject, headerTitle, bodyHtml, logoCid, brandPrimary = '#1E3A8A', brandAccent = '#3B82F6' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    @media (max-width: 600px) {
      .container { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin:0; background:#f5f7fb; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(120deg, ${brandPrimary}, ${brandAccent}); padding: 24px 0;">
    <tr>
      <td align="center">
        <table width="600" class="container" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(30,58,138,0.15);">
          <tr>
            <td style="background:linear-gradient(120deg, ${brandPrimary}, ${brandAccent}); padding: 24px; text-align:center;">
              ${logoCid ? `<img src="cid:${logoCid}" alt="Learn French with Natives" height="56" style="display:block; margin: 0 auto 8px;" />` : ''}
              <h1 style="margin:0; color:#fff; font-size:22px; font-weight:700; letter-spacing:0.3px;">${headerTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 24px; background:#F9FAFB; text-align:center; color:#6B7280; font-size:12px;">
              © ${new Date().getFullYear()} Learn French with Natives
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return dateStr; }
}

function computeDurationLabel(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const ms = Math.max(0, endDate - startDate);
  const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  return `${formatDate(start)} → ${formatDate(end)} (${days} day${days > 1 ? 's' : ''})`;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function renderScheduleHtml(schedules = []) {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return `<p style="margin:0; font-size:14px; color:#6B7280;">No timetable has been configured yet.</p>`;
  }
  const items = schedules
    .sort((a,b)=> (a.day_of_week-b.day_of_week) || String(a.start_time).localeCompare(String(b.start_time)))
    .map(s => {
      const day = dayNames[s.day_of_week] || `Day ${s.day_of_week}`;
      const time = `${s.start_time} – ${s.end_time}`;
      const tz = s.timezone ? ` (${s.timezone})` : '';
      const where = s.location_mode === 'online' ? (s.link ? `<a href="${s.link}" target="_blank" style="color:#2563EB; text-decoration:none;">Online link</a>` : 'Online') : (s.location || 'On-site');
      return `<li style=\"margin:8px 0;\"> <strong>${day}</strong>: ${time}${tz} — <span style=\"color:#374151;\">${where}</span></li>`;
    })
    .join('');
  return `<ul style="margin:0; padding-left:18px;">${items}</ul>`;
}

function renderScheduleText(schedules = []) {
  if (!Array.isArray(schedules) || schedules.length === 0) return 'No timetable has been configured yet.';
  return schedules
    .sort((a,b)=> (a.day_of_week-b.day_of_week) || String(a.start_time).localeCompare(String(b.start_time)))
    .map(s => {
      const day = dayNames[s.day_of_week] || `Day ${s.day_of_week}`;
      const time = `${s.start_time} - ${s.end_time}`;
      const tz = s.timezone ? ` (${s.timezone})` : '';
      const where = s.location_mode === 'online' ? (s.link ? `Online link: ${s.link}` : 'Online') : (s.location || 'On-site');
      return `- ${day}: ${time}${tz} — ${where}`;
    }).join('\n');
}

function buildBatchEnrollmentStudentTemplate({ studentName, batchName, frenchLevel, startDate, endDate, schedules, logoCid, studentCount }) {
  const subject = `You are enrolled in: ${batchName} — ${frenchLevel}`;
  const duration = computeDurationLabel(startDate, endDate);
  const bodyHtml = `
    <p style="margin:0 0 12px; font-size:16px;">Bonjour ${studentName || 'Student'},</p>
    <p style="margin:0 0 16px; font-size:15px; color:#374151;">Great news! You have been enrolled in the following batch. Here are your details:</p>

    <div style="background:#F3F4F6; border:1px solid #E5E7EB; border-radius:12px; padding:16px; margin:16px 0;">
      <p style="margin:0 0 6px; font-size:14px; color:#6B7280;">Batch name</p>
      <p style="margin:0 10px 12px; font-weight:600;">${batchName}</p>
      <p style="margin:0 0 6px; font-size:14px; color:#6B7280;">French level</p>
      <p style="margin:0 10px 12px; font-weight:600;">${frenchLevel}</p>
      <p style="margin:0 0 6px; font-size:14px; color:#6B7280;">Duration</p>
      <p style="margin:0 10px 12px; font-weight:600;">${duration}</p>
      <p style=\"margin:0 0 6px; font-size:14px; color:#6B7280;\">Number of students</p>
      <p style=\"margin:0 10px 0; font-weight:600;\">${typeof studentCount === 'number' ? studentCount : '—'}</p>
    </div>

    <h3 style="margin:18px 0 8px; font-size:16px;">Timetable</h3>
    ${renderScheduleHtml(schedules)}

    <p style="margin:18px 0 0; font-size:13px; color:#6B7280;">Please add these times to your calendar. If anything looks wrong, reply to this email.</p>
  `;

  const html = baseHtml({ subject, headerTitle: 'Enrollment Confirmed', bodyHtml, logoCid });
  const text = `Bonjour ${studentName || 'Student'},\n\nYou have been enrolled in a batch.\n\nBatch: ${batchName}\nLevel: ${frenchLevel}\nDuration: ${duration}\nStudents: ${typeof studentCount === 'number' ? studentCount : '-'}\n\nTimetable:\n${renderScheduleText(schedules)}\n\nPlease add these times to your calendar. If anything looks wrong, reply to this email.`;
  return { subject, html, text };
}

module.exports = { buildBatchEnrollmentStudentTemplate };