const { baseHtml } = require('./base');

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr) {
  // Handle both HH:mm and full ISO datetime strings
  let t;
  if (timeStr && timeStr.includes('T')) {
    t = new Date(timeStr);
  } else {
    t = new Date(`2000-01-01T${timeStr}`);
  }
  if (isNaN(t.getTime())) return timeStr;
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
  const subject = `Class Cancelled: ${meetingTitle} — Learn French with Natives`;

  const formattedDate = formatDate(originalDate);
  const formattedStart = formatTime(originalStartTime);
  const formattedEnd = formatTime(originalEndTime);

  // Build location row
  let locationIcon, locationLabel, locationValue;
  if (locationMode === 'online') {
    locationIcon = '💻';
    locationLabel = 'Online';
    locationValue = 'Link to be shared';
  } else {
    locationIcon = '📍';
    locationLabel = 'In Person';
    locationValue = location || 'Location to be confirmed';
  }

  const bodyHtml = `
    <!-- Cancellation Icon -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 28px;">
      <tr>
        <td align="center">
          <table cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td style="background: #FEF2F2; border-radius: 50%; width: 72px; height: 72px; text-align: center; vertical-align: middle;">
                <span style="font-size: 32px; line-height: 72px;">✕</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top: 16px;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #DC2626; letter-spacing: -0.3px;">Class Cancelled</h2>
          <p style="margin: 6px 0 0; font-size: 14px; color: #9CA3AF; font-weight: 400;">This session will no longer take place</p>
        </td>
      </tr>
    </table>

    <!-- Greeting -->
    <p style="margin: 0 0 20px; font-size: 15px; color: #374151; line-height: 1.6;">
      Dear <strong style="color: #111827;">${studentName || 'Student'}</strong>,
    </p>

    <p style="margin: 0 0 28px; font-size: 15px; color: #6B7280; line-height: 1.7;">
      We would like to inform you that the following class has been cancelled by your teacher <strong style="color: #374151;">${teacherName}</strong>. We sincerely apologize for any inconvenience.
    </p>

    <!-- Cancelled Class Details Card -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 24px;">
      <tr>
        <td style="background: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
          <!-- Card header -->
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td style="background: linear-gradient(135deg, #1F2937, #374151); padding: 14px 20px;">
                <span style="color: #F9FAFB; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">📋 Cancelled Class Details</span>
              </td>
            </tr>
          </table>

          <!-- Card body -->
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="padding: 0 20px;">
            <!-- Title -->
            <tr>
              <td style="padding: 16px 0 12px; border-bottom: 1px solid #F3F4F6;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                      <span style="font-size: 16px;">📖</span>
                    </td>
                    <td>
                      <span style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Class</span>
                      <span style="font-size: 15px; color: #111827; font-weight: 600;">${meetingTitle}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Batch -->
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #F3F4F6;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                      <span style="font-size: 16px;">👥</span>
                    </td>
                    <td>
                      <span style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Batch</span>
                      <span style="font-size: 15px; color: #111827; font-weight: 600;">${batchName}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Date -->
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #F3F4F6;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                      <span style="font-size: 16px;">📅</span>
                    </td>
                    <td>
                      <span style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Date</span>
                      <span style="font-size: 15px; color: #111827; font-weight: 600; text-decoration: line-through; color: #DC2626;">${formattedDate}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Time -->
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #F3F4F6;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                      <span style="font-size: 16px;">🕐</span>
                    </td>
                    <td>
                      <span style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Time</span>
                      <span style="font-size: 15px; color: #111827; font-weight: 600; text-decoration: line-through; color: #DC2626;">${formattedStart} – ${formattedEnd}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Location -->
            <tr>
              <td style="padding: 12px 0 16px;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                      <span style="font-size: 16px;">${locationIcon}</span>
                    </td>
                    <td>
                      <span style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Location</span>
                      <span style="font-size: 15px; color: #111827; font-weight: 600;">${locationLabel}</span>
                      ${locationMode === 'online' && link ? `<br><span style="font-size: 13px; color: #6B7280;">${locationValue}</span>` : (locationMode !== 'online' && location ? `<br><span style="font-size: 13px; color: #6B7280;">${location}</span>` : '')}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${reason ? `
    <!-- Reason Banner -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 24px;">
      <tr>
        <td style="background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 10px; padding: 16px 20px;">
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td style="width: 32px; vertical-align: top; padding-top: 1px;">
                <span style="font-size: 18px;">💬</span>
              </td>
              <td>
                <span style="font-size: 12px; color: #C2410C; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; display: block; margin-bottom: 4px;">Reason for Cancellation</span>
                <span style="font-size: 14px; color: #7C2D12; line-height: 1.5;">${reason}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- What's Next Section -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 28px;">
      <tr>
        <td style="background: linear-gradient(135deg, #EEF2FF, #E0E7FF); border-radius: 10px; padding: 20px;">
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td align="center">
                <span style="font-size: 22px; display: block; margin-bottom: 8px;">🔄</span>
                <span style="font-size: 15px; font-weight: 700; color: #312E81; display: block; margin-bottom: 6px;">What Happens Next?</span>
                <span style="font-size: 14px; color: #4338CA; line-height: 1.6;">If this class is rescheduled, you will receive a new notification with the updated details. No action is required from your end right now.</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Support -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
      <tr>
        <td align="center" style="padding-top: 8px;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #9CA3AF; line-height: 1.5;">
            Questions? Reach out to your teacher or contact our support team.
          </p>
          <a href="mailto:${process.env.EMAIL_FROM || 'support@learnfrenchwithnatives.com'}" 
             style="background: #4F46E5; color: #ffffff; text-decoration: none; padding: 10px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            Contact Support
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = baseHtml({ subject, headerTitle: 'Class Cancellation Notice', bodyHtml, logoCid });

  const text = `CLASS CANCELLED

Dear ${studentName || 'Student'},

We would like to inform you that the following class has been cancelled by your teacher ${teacherName}. We sincerely apologize for any inconvenience.

Cancelled Class Details:
• Class: ${meetingTitle}
• Batch: ${batchName}
• Date: ${formattedDate}
• Time: ${formattedStart} – ${formattedEnd}
• Location: ${locationMode === 'online' ? 'Online' : (location || 'Physical location')}
${reason ? '\nReason: ' + reason : ''}

What Happens Next?
If this class is rescheduled, you will receive a new notification with the updated details. No action is required from your end right now.

Questions? Contact your teacher or reach out to us at ${process.env.EMAIL_FROM || 'support@learnfrenchwithnatives.com'}

© ${new Date().getFullYear()} Learn French with Natives. All rights reserved.`;

  return { subject, html, text };
}

module.exports = { buildMeetingCancellationTemplate };