const { baseHtml } = require('./base');

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr) {
  let t;
  if (timeStr && timeStr.includes('T')) {
    t = new Date(timeStr);
  } else {
    t = new Date(`2000-01-01T${timeStr}`);
  }
  if (isNaN(t.getTime())) return timeStr;
  return t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function buildClassScheduleNotificationTemplate({
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
}) {
  const subject = `New Class Scheduled: ${className} — Learn French with Natives`;

  const formattedDate = formatDate(date);
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  // Location section
  let locationIcon, locationLabel, locationDetail;
  if (locationMode === 'online') {
    locationIcon = '💻';
    locationLabel = 'Online Class';
    locationDetail = '<span style="font-size: 13px; color: #6B7280;">Meeting link will be shared before the class</span>';
  } else {
    locationIcon = '📍';
    locationLabel = 'In-Person';
    locationDetail = location
      ? `<span style="font-size: 13px; color: #6B7280;">${location}</span>`
      : '<span style="font-size: 13px; color: #6B7280;">Venue details will be confirmed</span>';
  }

  // French level badge colors
  const levelColors = {
    'A1': { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
    'A2': { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
    'B1': { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
    'B2': { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },
    'C1': { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE' },
    'C2': { bg: '#FDF4FF', text: '#86198F', border: '#F5D0FE' },
  };
  const lc = levelColors[frenchLevel] || { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };

  const bodyHtml = `
    <!-- Hero Icon -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 28px;">
      <tr>
        <td align="center">
          <table cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td style="background: linear-gradient(135deg, #DBEAFE, #C7D2FE); border-radius: 50%; width: 72px; height: 72px; text-align: center; vertical-align: middle;">
                <span style="font-size: 32px; line-height: 72px;">📚</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top: 16px;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #1E3A8A; letter-spacing: -0.3px;">New Class Scheduled!</h2>
          <p style="margin: 6px 0 0; font-size: 14px; color: #9CA3AF; font-weight: 400;">Get ready for your next French lesson</p>
        </td>
      </tr>
    </table>

    <!-- Greeting -->
    <p style="margin: 0 0 20px; font-size: 15px; color: #374151; line-height: 1.6;">
      Hello <strong style="color: #111827;">${studentName || 'there'}</strong>,
    </p>

    <p style="margin: 0 0 28px; font-size: 15px; color: #6B7280; line-height: 1.7;">
      Great news! Your teacher <strong style="color: #374151;">${teacherName}</strong> has scheduled a new class for your batch <strong style="color: #374151;">${batchName}</strong>. Here are all the details:
    </p>

    <!-- Class Details Card -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 24px;">
      <tr>
        <td style="background: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
          <!-- Card header -->
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td style="background: linear-gradient(135deg, #1E3A8A, #3B82F6); padding: 14px 20px;">
                <span style="color: #F9FAFB; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">📋 Class Details</span>
              </td>
            </tr>
          </table>

          <!-- Card body -->
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="padding: 0 20px;">
            <!-- Class Name -->
            <tr>
              <td style="padding: 16px 0 12px; border-bottom: 1px solid #F3F4F6;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                      <span style="font-size: 16px;">📖</span>
                    </td>
                    <td>
                      <span style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Class Name</span>
                      <span style="font-size: 15px; color: #111827; font-weight: 600;">${className}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- French Level -->
            ${frenchLevel ? `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #F3F4F6;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                      <span style="font-size: 16px;">🎯</span>
                    </td>
                    <td>
                      <span style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">French Level</span>
                      <span style="font-size: 13px; font-weight: 700; color: ${lc.text}; background: ${lc.bg}; border: 1px solid ${lc.border}; padding: 3px 12px; border-radius: 20px; display: inline-block;">${frenchLevel}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ` : ''}
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
                      <span style="font-size: 15px; color: #111827; font-weight: 600;">${formattedDate}</span>
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
                      <span style="font-size: 15px; color: #111827; font-weight: 600;">${formattedStartTime} – ${formattedEndTime}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Teacher -->
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #F3F4F6;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                      <span style="font-size: 16px;">👩‍🏫</span>
                    </td>
                    <td>
                      <span style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Teacher</span>
                      <span style="font-size: 15px; color: #111827; font-weight: 600;">${teacherName}</span>
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
                      <br>${locationDetail}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${description ? `
    <!-- Description Card -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 24px;">
      <tr>
        <td style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 16px 20px;">
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td style="width: 32px; vertical-align: top; padding-top: 1px;">
                <span style="font-size: 18px;">📝</span>
              </td>
              <td>
                <span style="font-size: 12px; color: #92400E; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; display: block; margin-bottom: 4px;">What to Expect</span>
                <span style="font-size: 14px; color: #78350F; line-height: 1.6;">${description}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- Reminder Info -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 28px;">
      <tr>
        <td style="background: linear-gradient(135deg, #EDE9FE, #DDD6FE); border-radius: 10px; padding: 20px;">
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td align="center">
                <span style="font-size: 22px; display: block; margin-bottom: 8px;">⏰</span>
                <span style="font-size: 15px; font-weight: 700; color: #5B21B6; display: block; margin-bottom: 6px;">You'll Get a Reminder</span>
                <span style="font-size: 14px; color: #6D28D9; line-height: 1.6;">We'll send you a reminder 5 minutes before the class starts so you never miss a session. Just make sure to prepare your materials in advance!</span>
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
            Questions about this class? Reach out to your teacher or our support team.
          </p>
          <a href="mailto:${process.env.EMAIL_FROM || 'support@learnfrenchwithnatives.com'}"
             style="background: #4F46E5; color: #ffffff; text-decoration: none; padding: 10px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            Contact Support
          </a>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-top: 28px;">
      <tr>
        <td style="border-top: 1px solid #E5E7EB; padding-top: 16px;">
          <p style="margin: 0; font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5;">
            We're excited to see you in class! Prepare your materials and get ready to learn French with natives. 🇫🇷
          </p>
        </td>
      </tr>
    </table>
  `;

  const html = baseHtml({
    subject,
    headerTitle: 'New Class Scheduled',
    bodyHtml,
    logoCid
  });

  const text = `NEW CLASS SCHEDULED

Hello ${studentName || 'there'},

Great news! Your teacher ${teacherName} has scheduled a new class for your batch ${batchName}.

Class Details:
• Class Name: ${className}
${frenchLevel ? '• French Level: ' + frenchLevel : ''}
• Date: ${formattedDate}
• Time: ${formattedStartTime} – ${formattedEndTime}
• Teacher: ${teacherName}
• Location: ${locationMode === 'online' ? 'Online (Meeting link will be shared before the class)' : (location || 'Physical location')}
${description ? '\nDescription: ' + description : ''}

You'll receive a reminder 5 minutes before the class starts.

Questions? Contact your teacher or reach out to us at ${process.env.EMAIL_FROM || 'support@learnfrenchwithnatives.com'}

© ${new Date().getFullYear()} Learn French with Natives. All rights reserved.`;

  return { subject, html, text };
}

module.exports = { buildClassScheduleNotificationTemplate };