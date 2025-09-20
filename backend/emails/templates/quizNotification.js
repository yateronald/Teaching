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
      .detail-item { margin-bottom: 16px !important; }
      .quiz-header { font-size: 18px !important; }
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

function buildQuizNotificationTemplate({ 
  studentName, 
  quizName, 
  teacherName, 
  batchName, 
  duration, 
  startDate, 
  endDate, 
  totalPoints,
  logoCid 
}) {
  const brandPrimary = '#0F172A';
  const brandAccent = '#2563EB';
  const quizAccent = '#059669'; // Green for quiz notifications
  
  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, ${quizAccent} 0%, #047857 100%); border-radius: 20px; margin-bottom: 16px;">
        <span style="color: white; font-size: 14px; font-weight: 600;">📝 New Quiz Available</span>
      </div>
    </div>

    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
      Hello <strong>${studentName}</strong>,
    </p>

    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
      Your teacher has scheduled a new quiz for you! Here are all the details you need to know:
    </p>

    <div style="background: linear-gradient(135deg, #FAFBFF 0%, #F0F4FF 100%); border: 2px solid #E1E8FF; border-radius: 16px; padding: 32px; margin: 32px 0; box-shadow: 0 8px 32px rgba(37, 99, 235, 0.08);" class="quiz-details">
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, ${quizAccent} 0%, #047857 100%); border-radius: 25px; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(5, 150, 105, 0.2);">
          <span style="color: white; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">🎯 QUIZ DETAILS</span>
        </div>
        <h2 style="margin: 0; color: ${brandPrimary}; font-size: 28px; font-weight: 800; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.05);" class="quiz-header">
          "${quizName}"
        </h2>
      </div>
      
      <div style="display: grid; gap: 20px; max-width: 500px; margin: 0 auto;">
        <div style="display: flex; align-items: center; padding: 18px; background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #E2E8F0; transition: all 0.3s ease;" class="detail-item">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, ${quizAccent} 0%, #047857 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 18px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
            <span style="color: white; font-size: 20px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">👨‍🏫</span>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 700; color: ${brandPrimary}; font-size: 15px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Instructor</div>
            <div style="color: #475569; font-size: 17px; font-weight: 600;">${teacherName}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; padding: 18px; background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #E2E8F0; transition: all 0.3s ease;" class="detail-item">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, ${brandAccent} 0%, #1D4ED8 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 18px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
            <span style="color: white; font-size: 20px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">📚</span>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 700; color: ${brandPrimary}; font-size: 15px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Class</div>
            <div style="color: #475569; font-size: 17px; font-weight: 600;">${batchName}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="display: flex; align-items: center; padding: 16px; background: linear-gradient(135deg, #FFFFFF 0%, #FEF7F0 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #FED7AA;" class="detail-item">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
              <span style="color: white; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">⏱️</span>
            </div>
            <div>
              <div style="font-weight: 700; color: ${brandPrimary}; font-size: 12px; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.3px;">Duration</div>
              <div style="color: #92400E; font-size: 15px; font-weight: 700;">${formatDuration(duration)}</div>
            </div>
          </div>

          <div style="display: flex; align-items: center; padding: 16px; background: linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #BBF7D0;" class="detail-item">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
              <span style="color: white; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">🏆</span>
            </div>
            <div>
              <div style="font-weight: 700; color: ${brandPrimary}; font-size: 12px; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.3px;">Points</div>
              <div style="color: #166534; font-size: 15px; font-weight: 700;">${totalPoints} pts</div>
            </div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 2px solid #BBF7D0; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              <span style="color: white; font-size: 18px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">📅</span>
            </div>
            <div>
              <div style="font-weight: 700; color: ${brandPrimary}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Available From</div>
              <div style="color: #166534; font-size: 18px; font-weight: 800;">${formatDateTime(startDate)}</div>
            </div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%); border: 2px solid #FCA5A5; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              <span style="color: white; font-size: 18px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">⏰</span>
            </div>
            <div>
              <div style="font-weight: 700; color: ${brandPrimary}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Submission Deadline</div>
              <div style="color: #991B1B; font-size: 18px; font-weight: 800;">${formatDateTime(endDate)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.5;">
        <strong>💡 Reminder:</strong> You'll receive another notification 5 minutes before the quiz becomes available. Make sure to prepare in advance and have a stable internet connection.
      </p>
    </div>

    <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
      Good luck with your quiz! If you have any questions, don't hesitate to reach out to your teacher.
    </p>

    <p style="margin: 16px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
      Best regards,<br>
      <strong>Learn French with Natives Team</strong>
    </p>
  `;

  const subject = `📝 New Quiz: ${quizName} - ${batchName}`;
  const headerTitle = 'Quiz Notification';

  return {
    html: baseHtml({ subject, headerTitle, bodyHtml, logoCid, brandPrimary, brandAccent }),
    text: `New Quiz Notification

Hello ${studentName},

Your teacher has scheduled a new quiz for you!

Quiz Details:
- Quiz Name: ${quizName}
- Teacher: ${teacherName}
- Batch: ${batchName}
- Duration: ${formatDuration(duration)}
- Available From: ${formatDateTime(startDate)}
- Deadline: ${formatDateTime(endDate)}
- Total Points: ${totalPoints} points

You'll receive another notification 5 minutes before the quiz becomes available. Make sure to prepare in advance and have a stable internet connection.

Good luck with your quiz!

Best regards,
Learn French with Natives Team`,
    subject
  };
}

module.exports = { buildQuizNotificationTemplate };