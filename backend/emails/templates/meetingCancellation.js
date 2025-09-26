const { baseHtml } = require('./base');

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr) {
  const t = new Date(`2000-01-01T${timeStr}`);
  return t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function buildMeetingCancellationTemplate({
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
}) {
  const subject = `Cancellation Notice: ${meetingTitle}`;

  const formattedDate = formatDate(originalDate);
  const formattedStart = formatTime(originalStartTime);
  const formattedEnd = formatTime(originalEndTime);

  const locationText = locationMode === 'online' ? (link ? `Online - ${link}` : 'Online') : (location || 'Physical location');

  const bodyHtml = `
    <div style="text-align:center; margin-bottom:24px;">
      <div style="background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; padding: 20px; border-radius: 14px; display: inline-block;">
        <div style="font-size:22px; margin-bottom:8px;">⚠️</div>
        <h2 style="margin:0; font-size:18px; font-weight:700;">Meeting Cancelled</h2>
      </div>
    </div>

    <p style="margin:0 0 16px; font-size:15px; color:#374151;">Dear ${studentName || 'Student'},</p>

    <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#374151;">
      We regret to inform you that the following meeting has been cancelled by <strong>${teacherName}</strong> for your batch <strong>${batchName}</strong>.
    </p>

    <div style="background:#FEF2F2; border: 1px solid #FECACA; border-radius:12px; padding:16px; margin:16px 0;">
      <h3 style="margin:0 0 12px; color:#991B1B; font-size:16px;">Original Meeting Details</h3>
      <div style="display:grid; gap:12px;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #FEE2E2; padding:8px 0;">
          <span style="color:#7F1D1D;">Title</span>
          <span style="color:#111827; font-weight:600;">${meetingTitle}</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #FEE2E2; padding:8px 0;">
          <span style="color:#7F1D1D;">Date</span>
          <span style="color:#111827; font-weight:600;">${formattedDate}</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #FEE2E2; padding:8px 0;">
          <span style="color:#7F1D1D;">Time</span>
          <span style="color:#111827; font-weight:600;">${formattedStart} - ${formattedEnd}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0;">
          <span style="color:#7F1D1D;">Location</span>
          <span style="color:#111827; font-weight:600;">${locationText}</span>
        </div>
      </div>
    </div>

    ${reason ? `<div style=\"background:#FFFBEB; border-left:4px solid #F59E0B; padding:12px 16px; border-radius:0 8px 8px 0; margin:16px 0; color:#78350F;\"><strong>Reason:</strong> ${reason}</div>` : ''}

    <p style="margin:16px 0 0; font-size:14px; color:#6B7280;">We apologize for any inconvenience caused. If needed, a new meeting invitation will be sent once rescheduled.</p>

    <p style="margin:8px 0 0; font-size:14px; color:#6B7280;">If you have any questions, please contact your teacher or our support team.</p>
  `;

  const html = baseHtml({ subject, headerTitle: 'Meeting Cancelled', bodyHtml, logoCid });

  const text = `Meeting Cancelled\n\nDear ${studentName || 'Student'},\n\nThe following meeting has been cancelled by ${teacherName} for your batch ${batchName}.\n\nOriginal Details:\n- Title: ${meetingTitle}\n- Date: ${formattedDate}\n- Time: ${formattedStart} - ${formattedEnd}\n- Location: ${locationText}\n${reason ? `\nReason: ${reason}\n` : ''}\nWe apologize for any inconvenience. If needed, a new meeting invitation will be sent once rescheduled.`;

  return { subject, html, text };
}

module.exports = { buildMeetingCancellationTemplate };