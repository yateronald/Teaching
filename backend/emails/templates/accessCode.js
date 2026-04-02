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

function formatExpiryTime(expiryStr) {
  const expiry = new Date(expiryStr);
  if (isNaN(expiry.getTime())) return expiryStr;
  return expiry.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function buildAccessCodeTemplate({
  studentName,
  classTitle,
  teacherName,
  batchName,
  accessCode,
  sessionDate,
  startTime,
  endTime,
  expiresAt,
  joinLink,
  logoCid
}) {
  const subject = `🔑 Your Access Code for ${classTitle} — Join Now!`;

  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);
  const formattedDate = formatDate(sessionDate);
  const formattedExpiryTime = formatExpiryTime(expiresAt);

  // Split code into individual characters for stylish display
  const codeChars = accessCode.split('').map(char =>
    `<td style="background: #ffffff; border: 2px solid #E5E7EB; border-radius: 8px; width: 44px; height: 52px; text-align: center; vertical-align: middle; font-size: 24px; font-weight: 800; font-family: 'Courier New', monospace; color: #1F2937; letter-spacing: 0;">${char}</td>`
  ).join('<td style="width: 6px;"></td>');

  const bodyHtml = `
    <!-- Hero Section -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <table cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td style="background: linear-gradient(135deg, #DBEAFE, #C7D2FE); border-radius: 50%; width: 72px; height: 72px; text-align: center; vertical-align: middle;">
                <span style="font-size: 32px; line-height: 72px;">🔑</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top: 16px;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #1E3A8A; letter-spacing: -0.3px;">Your Class Has Started!</h2>
          <p style="margin: 6px 0 0; font-size: 14px; color: #9CA3AF; font-weight: 400;">Use the code below to join and mark your attendance</p>
        </td>
      </tr>
    </table>

    <!-- Greeting -->
    <p style="margin: 0 0 20px; font-size: 15px; color: #374151; line-height: 1.6;">
      Hello <strong style="color: #111827;">${studentName || 'there'}</strong>,
    </p>

    <p style="margin: 0 0 28px; font-size: 15px; color: #6B7280; line-height: 1.7;">
      Your class <strong style="color: #374151;">${classTitle}</strong> with <strong style="color: #374151;">${teacherName}</strong> has just started! Enter the access code below on your student dashboard to join and be marked as present.
    </p>

    <!-- Access Code Card -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 24px;">
      <tr>
        <td style="background: linear-gradient(135deg, #1E3A8A, #3B82F6); border-radius: 16px; padding: 28px 20px; text-align: center;">
          <span style="font-size: 12px; color: #93C5FD; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; display: block; margin-bottom: 16px;">Your Access Code</span>

          <!-- Code Characters -->
          <table cellspacing="0" cellpadding="0" role="presentation" style="margin: 0 auto;">
            <tr>
              ${codeChars}
            </tr>
          </table>

          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-top: 16px;">
            <tr>
              <td align="center">
                <table cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="background: rgba(255,255,255,0.15); border-radius: 20px; padding: 6px 16px;">
                      <span style="font-size: 12px; color: #BFDBFE;">⏱ Expires at <strong style="color: #ffffff;">${formattedExpiryTime}</strong></span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${joinLink ? `
    <!-- Join Button -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <a href="${joinLink}" target="_blank"
             style="background: linear-gradient(135deg, #10B981, #059669); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block;">
            🚀 Join Class Directly
          </a>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- Class Details Card -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 24px;">
      <tr>
        <td style="background: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
          <!-- Card header -->
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td style="background: linear-gradient(135deg, #1F2937, #374151); padding: 14px 20px;">
                <span style="color: #F9FAFB; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">📋 Session Details</span>
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
                      <span style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Class</span>
                      <span style="font-size: 15px; color: #111827; font-weight: 600;">${classTitle}</span>
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
            <!-- Teacher -->
            <tr>
              <td style="padding: 12px 0 16px;">
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
          </table>
        </td>
      </tr>
    </table>

    <!-- How to Join Steps -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 24px;">
      <tr>
        <td style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); border-radius: 10px; padding: 20px;">
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td align="center" style="padding-bottom: 12px;">
                <span style="font-size: 22px; display: block; margin-bottom: 4px;">⚡</span>
                <span style="font-size: 15px; font-weight: 700; color: #92400E;">How to Join</span>
              </td>
            </tr>
          </table>
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td style="padding: 6px 0;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 32px; vertical-align: top;">
                      <span style="background: #F59E0B; color: #ffffff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; border-radius: 50%; display: inline-block; text-align: center; line-height: 22px;">1</span>
                    </td>
                    <td style="font-size: 14px; color: #78350F; line-height: 1.5;">Go to your <strong>student dashboard</strong></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 32px; vertical-align: top;">
                      <span style="background: #F59E0B; color: #ffffff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; border-radius: 50%; display: inline-block; text-align: center; line-height: 22px;">2</span>
                    </td>
                    <td style="font-size: 14px; color: #78350F; line-height: 1.5;">Find your class and click <strong>"Join Class"</strong></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 32px; vertical-align: top;">
                      <span style="background: #F59E0B; color: #ffffff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; border-radius: 50%; display: inline-block; text-align: center; line-height: 22px;">3</span>
                    </td>
                    <td style="font-size: 14px; color: #78350F; line-height: 1.5;">Enter the access code: <strong>${accessCode}</strong></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">
                <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                  <tr>
                    <td style="width: 32px; vertical-align: top;">
                      <span style="background: #10B981; color: #ffffff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; border-radius: 50%; display: inline-block; text-align: center; line-height: 22px;">✓</span>
                    </td>
                    <td style="font-size: 14px; color: #78350F; line-height: 1.5;">You'll be <strong>marked as present!</strong></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Expiry Warning -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 28px;">
      <tr>
        <td style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 14px 20px;">
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td style="width: 28px; vertical-align: middle;">
                <span style="font-size: 16px;">⏰</span>
              </td>
              <td style="font-size: 13px; color: #991B1B; line-height: 1.5;">
                <strong>Important:</strong> This access code expires at <strong>${formattedExpiryTime}</strong>. Make sure to join before it expires!
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Support -->
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
      <tr>
        <td align="center">
          <p style="margin: 0; font-size: 14px; color: #9CA3AF; line-height: 1.5;">
            Having trouble joining? Contact your teacher or our support team immediately.
          </p>
        </td>
      </tr>
    </table>
  `;

  const html = baseHtml({
    subject,
    headerTitle: 'Class Access Code',
    bodyHtml,
    logoCid
  });

  const text = `YOUR ACCESS CODE IS READY

Hello ${studentName || 'there'},

Your class "${classTitle}" with ${teacherName} has started!

ACCESS CODE: ${accessCode}
Expires at: ${formattedExpiryTime}

Session Details:
• Class: ${classTitle}
• Date: ${formattedDate}
• Time: ${formattedStartTime} – ${formattedEndTime}
• Batch: ${batchName}
• Teacher: ${teacherName}

How to Join:
1. Go to your student dashboard
2. Find your class and click "Join Class"
3. Enter the access code: ${accessCode}
4. You'll be marked as present!

Important: This access code expires at ${formattedExpiryTime}. Make sure to join before it expires!

Having trouble? Contact your teacher or our support team.

© ${new Date().getFullYear()} Learn French with Natives. All rights reserved.`;

  return {
    subject,
    html,
    text: text.trim()
  };
}

module.exports = { buildAccessCodeTemplate };