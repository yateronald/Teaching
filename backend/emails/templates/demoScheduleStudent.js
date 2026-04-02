const { baseHtml } = require('./base');

function buildDemoScheduleStudentTemplate({ 
    studentName, 
    teacherName, 
    teacherEmail,
    demoDate, 
    demoTime, 
    meetingLink, 
    notes,
    logoCid 
}) {
    const subject = `Your French Demo Class is Scheduled! - Learn French with Natives`;
    
    // Format date and time nicely
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    
    const formatTime = (dateTimeStr) => {
        const dateTime = new Date(dateTimeStr);
        return dateTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true,
            timeZoneName: 'short'
        });
    };

    const formattedDate = formatDate(demoDate);
    const formattedTime = formatTime(demoDate);
    
    const bodyHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
            <h2 style="margin: 0; color: #1E3A8A; font-size: 24px; font-weight: 700;">
                Bonjour ${studentName}!
            </h2>
            <p style="margin: 8px 0 0; color: #6B7280; font-size: 16px;">
                Your French demo class has been scheduled
            </p>
        </div>

        <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
            <div style="font-size: 20px; margin-bottom: 8px;">📅</div>
            <h3 style="margin: 0 0 16px; font-size: 20px; font-weight: 600;">Demo Class Details</h3>
            
            <div style="background: rgba(255, 255, 255, 0.1); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <div style="margin-bottom: 12px;">
                    <strong style="font-size: 16px;">📅 Date:</strong>
                    <div style="font-size: 18px; margin-top: 4px;">${formattedDate}</div>
                </div>
                <div style="margin-bottom: 12px;">
                    <strong style="font-size: 16px;">⏰ Time:</strong>
                    <div style="font-size: 18px; margin-top: 4px;">${formattedTime}</div>
                </div>
                <div>
                    <strong style="font-size: 16px;">👨‍🏫 Your Teacher:</strong>
                    <div style="font-size: 18px; margin-top: 4px;">${teacherName}</div>
                    ${teacherEmail ? `<div style="font-size: 14px; margin-top: 4px; opacity: 0.9;">${teacherEmail}</div>` : ''}
                </div>
            </div>

            <div style="margin-top: 20px;">
                <span style="display: inline-block; color: white; font-weight: 500; font-size: 14px; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 4px;">Meeting link will be shared before class</span>
            </div>
        </div>

        ${notes ? `
        <div style="background: #F0F9FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="margin: 0 0 8px; color: #1E3A8A; font-size: 16px;">📝 Additional Notes:</h4>
            <p style="margin: 0; color: #374151; line-height: 1.6;">${notes}</p>
        </div>
        ` : ''}

        <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <h4 style="margin: 0 0 12px; color: #92400E; font-size: 16px; display: flex; align-items: center;">
                <span style="margin-right: 8px;">💡</span>
                What to Expect in Your Demo Class
            </h4>
            <ul style="margin: 0; padding-left: 20px; color: #78350F; line-height: 1.6;">
                <li>A friendly conversation to assess your current French level</li>
                <li>Introduction to our teaching methodology</li>
                <li>Personalized learning plan recommendations</li>
                <li>Q&A session about our courses and programs</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
                We're excited to meet you and help you on your French learning journey!
            </p>
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
                If you need to reschedule or have any questions, please contact us at 
                <a href="mailto:support@learnfrenchwithnatives.com" style="color: #3B82F6; text-decoration: none;">
                    support@learnfrenchwithnatives.com
                </a>
            </p>
        </div>

        <div style="text-align: center; padding: 20px; background: #F9FAFB; border-radius: 8px; margin-top: 32px;">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
                À bientôt! (See you soon!)
            </p>
            <p style="margin: 8px 0 0; color: #1E3A8A; font-weight: 600;">
                The Learn French with Natives Team
            </p>
        </div>
    `;

    const html = baseHtml({
        subject,
        headerTitle: 'Demo Class Scheduled',
        bodyHtml,
        logoCid
    });

    const text = `
Bonjour ${studentName}!

Your French demo class has been scheduled:

📅 Date: ${formattedDate}
⏰ Time: ${formattedTime}
👨‍🏫 Teacher: ${teacherName}${teacherEmail ? ` (${teacherEmail})` : ''}

🎥 Meeting Link: Meeting link will be shared before class.

${notes ? `📝 Notes: ${notes}` : ''}

What to expect:
- A friendly conversation to assess your current French level
- Introduction to our teaching methodology
- Personalized learning plan recommendations
- Q&A session about our courses and programs

We're excited to meet you and help you on your French learning journey!

If you need to reschedule or have any questions, please contact us at support@learnfrenchwithnatives.com

À bientôt! (See you soon!)
The Learn French with Natives Team
    `.trim();

    return { subject, html, text };
}

module.exports = { buildDemoScheduleStudentTemplate };