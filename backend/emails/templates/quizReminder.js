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
      .quiz-details { padding: 16px !important; }
      .cta-button { padding: 14px 24px !important; font-size: 16px !important; }
      .urgent-header { font-size: 18px !important; }
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

function formatDateTime(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) { 
    return dateStr; 
  }
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

function buildQuizReminderTemplate({ 
  studentName, 
  quizName, 
  teacherName, 
  batchName, 
  duration, 
  startDate, 
  totalPoints,
  quizUrl,
  logoCid 
}) {
  const brandPrimary = '#0F172A';
  const brandAccent = '#2563EB';
  const urgentColor = '#DC2626'; // Red for urgent reminders
  
  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, ${urgentColor} 0%, #B91C1C 100%); border-radius: 20px; margin-bottom: 16px; animation: pulse 2s infinite;">
        <span style="color: white; font-size: 14px; font-weight: 600;">🚨 Quiz Starting Soon!</span>
      </div>
    </div>

    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
      Hello <strong>${studentName}</strong>,
    </p>

    <div style="background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%); border: 3px solid #F87171; border-radius: 16px; padding: 28px; margin: 28px 0; text-align: center; box-shadow: 0 8px 32px rgba(239, 68, 68, 0.15); animation: pulse 2s infinite;">
      <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, ${urgentColor} 0%, #B91C1C 100%); border-radius: 25px; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);">
        <span style="color: white; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">🚨 URGENT REMINDER</span>
      </div>
      <h2 style="margin: 0 0 12px; color: ${urgentColor}; font-size: 32px; font-weight: 800; line-height: 1.1; text-shadow: 0 2px 4px rgba(0,0,0,0.1);" class="urgent-header">
        ⏰ Quiz starts in 5 minutes!
      </h2>
      <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 16px; margin: 16px 0; border: 2px solid #FCA5A5;">
        <p style="margin: 0; font-size: 22px; color: #7F1D1D; font-weight: 800; letter-spacing: 0.5px;">
          "${quizName}"
        </p>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #FAFBFF 0%, #F0F4FF 100%); border: 2px solid #E1E8FF; border-radius: 16px; padding: 28px; margin: 28px 0; box-shadow: 0 8px 32px rgba(37, 99, 235, 0.08);" class="quiz-details">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 20px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);">
          <span style="color: white; font-size: 15px; font-weight: 700; letter-spacing: 0.5px;">📋 QUICK DETAILS</span>
        </div>
      </div>
      
        <div style="display: grid; gap: 16px; max-width: 450px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%); border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
              <span style="color: white; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">👨‍🏫</span>
            </div>
            <div style="font-weight: 700; color: ${brandPrimary}; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Instructor</div>
            <div style="color: #475569; font-size: 14px; font-weight: 600; line-height: 1.2;">${teacherName}</div>
          </div>

          <div style="background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%); border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
              <span style="color: white; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">📚</span>
            </div>
            <div style="font-weight: 700; color: ${brandPrimary}; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Class</div>
            <div style="color: #475569; font-size: 14px; font-weight: 600; line-height: 1.2;">${batchName}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="background: linear-gradient(135deg, #FFFFFF 0%, #FEF7F0 100%); border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #FED7AA; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">
              <span style="color: white; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">⏱️</span>
            </div>
            <div style="font-weight: 700; color: ${brandPrimary}; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Duration</div>
            <div style="color: #92400E; font-size: 14px; font-weight: 700;">${formatDuration(duration)}</div>
          </div>

          <div style="background: linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%); border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #BBF7D0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">
              <span style="color: white; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">🏆</span>
            </div>
            <div style="font-weight: 700; color: ${brandPrimary}; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Points</div>
            <div style="color: #166534; font-size: 14px; font-weight: 700;">${totalPoints} pts</div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 2px solid #BBF7D0; border-radius: 12px; padding: 18px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
              <span style="color: white; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">📅</span>
            </div>
            <div>
              <div style="font-weight: 700; color: ${brandPrimary}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Starts At</div>
              <div style="color: #166534; font-size: 16px; font-weight: 800;">${formatDateTime(startDate)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    ${quizUrl ? `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${quizUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); transition: all 0.3s ease;" class="cta-button">
        🚀 Start Quiz Now
      </a>
    </div>
    ` : ''}

    <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.5;">
        <strong>📝 Last-minute tips:</strong>
      </p>
      <ul style="margin: 8px 0 0 16px; font-size: 14px; color: #92400E; line-height: 1.5;">
        <li>Ensure you have a stable internet connection</li>
        <li>Close unnecessary browser tabs and applications</li>
        <li>Have your notes and materials ready</li>
        <li>Find a quiet place to take the quiz</li>
      </ul>
    </div>

    <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #374151; text-align: center;">
      <strong>Good luck! You've got this! 💪</strong>
    </p>

    <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #6B7280; text-align: center;">
      Best regards,<br>
      <strong>Learn French with Natives Team</strong>
    </p>
  `;

  const subject = `🚨 REMINDER: ${quizName} starts in 5 minutes!`;
  const headerTitle = 'Quiz Reminder';

  return {
    html: baseHtml({ subject, headerTitle, bodyHtml, logoCid, brandPrimary, brandAccent }),
    text: `QUIZ REMINDER - Starting in 5 minutes!

Hello ${studentName},

Your quiz "${quizName}" starts in 5 minutes!

Quick Details:
- Teacher: ${teacherName}
- Batch: ${batchName}
- Duration: ${formatDuration(duration)}
- Starts at: ${formatDateTime(startDate)}
- Total Points: ${totalPoints} points

${quizUrl ? `Start Quiz: ${quizUrl}` : ''}

Last-minute tips:
- Ensure you have a stable internet connection
- Close unnecessary browser tabs and applications
- Have your notes and materials ready
- Find a quiet place to take the quiz

Good luck! You've got this!

Best regards,
Learn French with Natives Team`,
    subject
  };
}

module.exports = { buildQuizReminderTemplate };