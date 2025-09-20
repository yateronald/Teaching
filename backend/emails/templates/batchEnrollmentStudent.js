function baseHtml({ subject, headerTitle, bodyHtml, logoCid, brandPrimary = '#0F172A', brandAccent = '#2563EB' }) {
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
<body style="margin:0; background:#f3f4f6; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 0;">
    <tr>
      <td align="center">
        <table width="600" class="container" cellspacing="0" cellpadding="0" style="background:#ffffff; border:1px solid #E5E7EB; border-radius:14px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding: 20px 24px; text-align:center; background:#ffffff;">
              ${logoCid ? `<img src="cid:${logoCid}" alt="Learn French with Natives" height="56" style="display:block; margin: 0 auto 10px;" />` : ''}
              <h1 style="margin:0; color:${brandPrimary}; font-size:20px; font-weight:700; letter-spacing:0.2px;">${headerTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="height:1px; background:#E5E7EB;"></td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 18px; background:#F9FAFB; text-align:center; color:#6B7280; font-size:12px;">
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
  return `<div style="border-left:3px solid #E5E7EB; padding-left:12px;"><ul style="margin:0; padding-left:18px;">${items}</ul></div>`;
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
    <p style="margin:0 0 18px; font-size:15px; color:#374151;">Great news! You have been enrolled in the following batch. Here are your details:</p>

    <div style="border:1px solid #E5E7EB; border-radius:12px; padding:0; margin:16px 0; background:#ffffff; overflow:hidden;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px; color:#111827;">
        <tr>
          <td style="color:#6B7280; padding:10px 12px; width:40%; background:#F9FAFB;">Batch name</td>
          <td style="font-weight:600; padding:10px 12px;">${batchName}</td>
        </tr>
        <tr>
          <td style="color:#6B7280; padding:10px 12px; background:#F9FAFB;">French level</td>
          <td style="font-weight:600; padding:10px 12px;">${frenchLevel}</td>
        </tr>
        <tr>
          <td style="color:#6B7280; padding:10px 12px; background:#F9FAFB;">Duration</td>
          <td style="font-weight:600; padding:10px 12px;">${duration}</td>
        </tr>
        <tr>
          <td style="color:#6B7280; padding:10px 12px; background:#F9FAFB;">Number of students</td>
          <td style="font-weight:600; padding:10px 12px;">${typeof studentCount === 'number' ? studentCount : '—'}</td>
        </tr>
      </table>
    </div>

    <h3 style="margin:18px 0 8px; font-size:16px; color:#0F172A;">Timetable</h3>
    ${renderScheduleHtml(schedules)}

    <p style="margin:18px 0 0; font-size:13px; color:#6B7280;">Please add these times to your calendar. If anything looks wrong, reply to this email.</p>
  `;

  const html = baseHtml({ subject, headerTitle: 'Enrollment Confirmed', bodyHtml, logoCid });
  const text = `Bonjour ${studentName || 'Student'},\n\nYou have been enrolled in a batch.\n\nBatch: ${batchName}\nLevel: ${frenchLevel}\nDuration: ${duration}\nStudents: ${typeof studentCount === 'number' ? studentCount : '-'}\n\nTimetable:\n${renderScheduleText(schedules)}\n\nPlease add these times to your calendar. If anything looks wrong, reply to this email.`;
  return { subject, html, text };
}

module.exports = { buildBatchEnrollmentStudentTemplate };