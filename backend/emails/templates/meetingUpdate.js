const { baseHtml } = require('./base');

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr) {
  const t = new Date(`2000-01-01T${timeStr}`);
  return t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function buildMeetingUpdateTemplate({
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
  changes = [],
  logoCid
}) {
  const subject = `Update: Meeting Details Changed — ${meetingTitle}`;

  const formattedDate = formatDate(date);
  const formattedStart = formatTime(startTime);
  const formattedEnd = formatTime(endTime);

  const changesSection = Array.isArray(changes) && changes.length > 0
    ? `
      <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px; color: #0C4A6E; font-size: 17px; font-weight: 600;">Summary of Updates</h3>
        <ul style="margin: 0; padding-left: 20px; color: #0C4A6E; line-height: 1.6;">
          ${changes.map(ch => `<li style="margin: 8px 0; font-size: 15px;"><strong>${ch.label}:</strong> <span style="color: #64748B;">${ch.old !== undefined && ch.old !== null ? ch.old : '—'}</span> <span style="color: #0C4A6E; font-weight: 600; margin: 0 8px;">→</span> <strong style="color: #0C4A6E;">${ch.new !== undefined && ch.new !== null ? ch.new : '—'}</strong></li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const locationBlock = locationMode === 'online'
    ? `<div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: #fff; padding: 20px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
         <div style="display: flex; align-items: center; margin-bottom: 12px;"><span style="font-size: 20px; margin-right: 10px;">💻</span><strong style="font-size: 16px;">Online Meeting</strong></div>
         ${link ? `<a href="${link}" target="_blank" style="color: #BFDBFE; text-decoration: underline; font-weight: 600; font-size: 15px;">Join Meeting Link</a>` : '<span style="color: #BFDBFE; font-size: 15px;">Meeting link will be provided prior to the start time</span>'}
       </div>`
    : `<div style="background: linear-gradient(135deg, #10B981, #059669); color: #fff; padding: 20px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
         <div style="display: flex; align-items: center; margin-bottom: 12px;"><span style="font-size: 20px; margin-right: 10px;">📍</span><strong style="font-size: 16px;">Physical Location</strong></div>
         <span style="color: #A7F3D0; font-weight: 500; font-size: 15px;">${location || 'Location to be confirmed'}</span>
       </div>`;

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="background: linear-gradient(135deg, #2563EB, #1E40AF); color: white; padding: 24px; border-radius: 16px; display: inline-block; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
        <div style="font-size: 24px; margin-bottom: 10px;">🔔</div>
        <h2 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Meeting Update</h2>
      </div>
    </div>

    <p style="margin: 0 0 20px; font-size: 16px; color: #374151; line-height: 1.5;">Dear ${studentName || 'Student'},</p>

    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7; color: #374151;">
      We would like to inform you that the meeting details have been updated by <strong style="color: #1F2937;">${teacherName}</strong> for your batch <strong style="color: #1F2937;">${batchName}</strong>. Please review the revised information below.
    </p>

    ${changesSection}

    <div style="background: #F8FAFC; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Updated Meeting Details</h3>
      <div style="display: grid; gap: 16px;">
        <div style="display: flex; align-items: center; border-bottom: 1px solid #F3F4F6; padding: 12px 0;">
          <span style="color: #6B7280; font-size: 15px; font-weight: 500; min-width: 60px; margin-right: 16px;">Title</span>
          <span style="color: #111827; font-weight: 600; font-size: 15px; flex: 1;">${meetingTitle}</span>
        </div>
        <div style="display: flex; align-items: center; border-bottom: 1px solid #F3F4F6; padding: 12px 0;">
          <span style="color: #6B7280; font-size: 15px; font-weight: 500; min-width: 60px; margin-right: 16px;">Date</span>
          <span style="color: #111827; font-weight: 600; font-size: 15px; flex: 1;">${formattedDate}</span>
        </div>
        <div style="display: flex; align-items: center; padding: 12px 0;">
          <span style="color: #6B7280; font-size: 15px; font-weight: 500; min-width: 60px; margin-right: 16px;">Time</span>
          <span style="color: #111827; font-weight: 600; font-size: 15px; flex: 1;">${formattedStart} - ${formattedEnd}</span>
        </div>
      </div>
    </div>

    ${locationBlock}

    ${description ? `<div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; color: #78350F; font-size: 15px; line-height: 1.6;">${description}</div>` : ''}

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
      <p style="margin: 0; font-size: 14px; color: #6B7280; line-height: 1.5;">
        If you have any questions or concerns, please don't hesitate to contact your teacher or our support team. We appreciate your understanding.
      </p>
    </div>
  `;

  const html = baseHtml({ subject, headerTitle: 'Meeting Update', bodyHtml, logoCid });

  const text = `Meeting Update\n\nDear ${studentName || 'Student'},\n\nWe would like to inform you that the meeting details have been updated by ${teacherName} for your batch ${batchName}.\n\nUpdated Meeting Details:\n- Title: ${meetingTitle}\n- Date: ${formattedDate}\n- Time: ${formattedStart} - ${formattedEnd}\n- Location: ${locationMode === 'online' ? (link ? `Online - ${link}` : 'Online (link to follow)') : (location || 'Physical location')}\n${description ? `\nDescription: ${description}\n` : ''}\n${(Array.isArray(changes) && changes.length > 0) ? `\nSummary of updates:\n${changes.map(ch => `- ${ch.label}: ${ch.old ?? '—'} → ${ch.new ?? '—'}`).join('\n')}\n` : ''}\nIf you have any questions or concerns, please don't hesitate to contact your teacher or our support team. We appreciate your understanding.`;

  return { subject, html, text };
}

module.exports = { buildMeetingUpdateTemplate };