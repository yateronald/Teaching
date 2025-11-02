const { baseHtml } = require('./base');

function buildDemoScheduleTeacherTemplate({ 
    teacherName, 
    studentName,
    studentEmail,
    studentLevel,
    studentGoals,
    studentExpectations,
    demoDate, 
    demoTime, 
    meetingLink, 
    notes,
    logoCid 
}) {
    const subject = `New Demo Class Assignment: ${studentName} - Learn French with Natives`;
    
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
            <div style="font-size: 48px; margin-bottom: 16px;">👨‍🏫</div>
            <h2 style="margin: 0; color: #1E3A8A; font-size: 24px; font-weight: 700;">
                Bonjour ${teacherName}!
            </h2>
            <p style="margin: 8px 0 0; color: #6B7280; font-size: 16px;">
                You have been assigned a new demo class
            </p>
        </div>

        <div style="background: linear-gradient(135deg, #7C3AED, #5B21B6); color: white; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
            <div style="font-size: 20px; margin-bottom: 8px;">📅</div>
            <h3 style="margin: 0 0 16px; font-size: 20px; font-weight: 600;">Demo Class Assignment</h3>
            
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
                    <strong style="font-size: 16px;">👤 Student:</strong>
                    <div style="font-size: 18px; margin-top: 4px;">${studentName}</div>
                    ${studentEmail ? `<div style="font-size: 14px; margin-top: 4px; opacity: 0.9;">${studentEmail}</div>` : ''}
                </div>
            </div>

            <div style="margin-top: 20px;">
                <a href="${meetingLink}" 
                   style="display: inline-block; background: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                    🎥 Join Demo Class
                </a>
            </div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <h4 style="margin: 0 0 16px; color: #1E3A8A; font-size: 18px; display: flex; align-items: center;">
                <span style="margin-right: 8px;">👤</span>
                Student Information
            </h4>
            
            <div style="display: grid; gap: 12px;">
                ${studentLevel ? `
                <div style="display: flex; align-items: center;">
                    <strong style="color: #374151; width: 140px; font-size: 14px;">📊 Current Level:</strong>
                    <span style="color: #6B7280; font-size: 14px;">${studentLevel}</span>
                </div>
                ` : ''}
                
                ${studentGoals ? `
                <div>
                    <strong style="color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">🎯 Learning Goals:</strong>
                    <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.5; padding-left: 20px;">${studentGoals}</p>
                </div>
                ` : ''}
                
                ${studentExpectations ? `
                <div>
                    <strong style="color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">💭 Expectations:</strong>
                    <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.5; padding-left: 20px;">${studentExpectations}</p>
                </div>
                ` : ''}
            </div>
        </div>

        ${notes ? `
        <div style="background: #F0F9FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="margin: 0 0 8px; color: #1E3A8A; font-size: 16px;">📝 Admin Notes:</h4>
            <p style="margin: 0; color: #374151; line-height: 1.6;">${notes}</p>
        </div>
        ` : ''}

        <div style="background: #ECFDF5; border: 1px solid #10B981; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <h4 style="margin: 0 0 12px; color: #065F46; font-size: 16px; display: flex; align-items: center;">
                <span style="margin-right: 8px;">💡</span>
                Demo Class Guidelines
            </h4>
            <ul style="margin: 0; padding-left: 20px; color: #047857; line-height: 1.6;">
                <li>Assess the student's current French level through conversation</li>
                <li>Introduce our teaching methodology and approach</li>
                <li>Provide personalized learning recommendations</li>
                <li>Answer any questions about our courses and programs</li>
                <li>Create a welcoming and encouraging environment</li>
            </ul>
        </div>

        <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; color: #92400E; font-size: 14px; display: flex; align-items: center;">
                <span style="margin-right: 8px;">⏰</span>
                <strong>Reminder:</strong> Please join the meeting 5 minutes early to ensure everything is set up properly.
            </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
                Thank you for helping us welcome new students to our French learning community!
            </p>
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
                If you have any questions or need to reschedule, please contact us at 
                <a href="mailto:support@learnfrenchwithnatives.com" style="color: #3B82F6; text-decoration: none;">
                    support@learnfrenchwithnatives.com
                </a>
            </p>
        </div>

        <div style="text-align: center; padding: 20px; background: #F9FAFB; border-radius: 8px; margin-top: 32px;">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
                Bonne chance! (Good luck!)
            </p>
            <p style="margin: 8px 0 0; color: #1E3A8A; font-weight: 600;">
                The Learn French with Natives Team
            </p>
        </div>
    `;

    const html = baseHtml({
        subject,
        headerTitle: 'Demo Class Assignment',
        bodyHtml,
        logoCid,
        brandPrimary: '#7C3AED',
        brandAccent: '#5B21B6'
    });

    const text = `
Bonjour ${teacherName}!

You have been assigned a new demo class:

📅 Date: ${formattedDate}
⏰ Time: ${formattedTime}
👤 Student: ${studentName}${studentEmail ? ` (${studentEmail})` : ''}

🎥 Meeting Link: ${meetingLink}

Student Information:
${studentLevel ? `📊 Current Level: ${studentLevel}` : ''}
${studentGoals ? `🎯 Learning Goals: ${studentGoals}` : ''}
${studentExpectations ? `💭 Expectations: ${studentExpectations}` : ''}

${notes ? `📝 Admin Notes: ${notes}` : ''}

Demo Class Guidelines:
- Assess the student's current French level through conversation
- Introduce our teaching methodology and approach
- Provide personalized learning recommendations
- Answer any questions about our courses and programs
- Create a welcoming and encouraging environment

⏰ Reminder: Please join the meeting 5 minutes early to ensure everything is set up properly.

Thank you for helping us welcome new students to our French learning community!

If you have any questions or need to reschedule, please contact us at support@learnfrenchwithnatives.com

Bonne chance! (Good luck!)
The Learn French with Natives Team
    `.trim();

    return { subject, html, text };
}

module.exports = { buildDemoScheduleTeacherTemplate };