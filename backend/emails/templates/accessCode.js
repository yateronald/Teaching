const { baseHtml } = require('./base');

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
    const subject = `🔑 Access Code for ${classTitle} - Join Now!`;
    
    // Format time nicely
    const formatTime = (timeStr) => {
        const time = new Date(`2000-01-01T${timeStr}`);
        return time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
    };

    // Format date nicely
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Format expiry time
    const formatExpiryTime = (expiryStr) => {
        const expiry = new Date(expiryStr);
        return expiry.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
    };

    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    const formattedDate = formatDate(sessionDate);
    const formattedExpiryTime = formatExpiryTime(expiresAt);

    // Join button if link is provided
    const joinButton = joinLink 
        ? `<div style="text-align: center; margin: 24px 0;">
             <a href="${joinLink}" target="_blank" 
                style="background: linear-gradient(135deg, #10B981, #059669); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 18px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
                🚀 Join Class Directly
             </a>
           </div>`
        : '';

    const bodyHtml = `
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 24px; border-radius: 16px; display: inline-block;">
                <div style="font-size: 32px; margin-bottom: 8px;">🔑</div>
                <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Your Access Code is Ready!</h2>
                <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">Class session has started</p>
            </div>
        </div>

        <p style="margin: 0 0 24px; font-size: 16px; color: #374151; text-align: center;">
            Hello <strong>${studentName || 'there'}</strong>,
        </p>
        
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #6B7280; text-align: center;">
            Your class <strong>${classTitle}</strong> with <strong>${teacherName}</strong> has started! Use the access code below to join the session.
        </p>

        <div style="text-align: center; margin: 32px 0;">
            <div style="background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 24px; border-radius: 16px; display: inline-block; box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);">
                <div style="font-size: 14px; margin-bottom: 8px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Access Code</div>
                <div class="code" style="font-size: 36px; font-weight: 900; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    ${accessCode}
                </div>
                <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
                    Expires at ${formattedExpiryTime}
                </div>
            </div>
        </div>

        ${joinButton}

        <div style="background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 16px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 20px; color: #1F2937; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center;">
                <span style="margin-right: 8px;">📚</span>
                Class Details
            </h3>
            
            <div style="display: grid; gap: 12px; text-align: center;">
                <div style="padding: 12px; background: white; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 14px; margin-bottom: 4px;">Class</div>
                    <div style="color: #1F2937; font-weight: 600; font-size: 16px;">${classTitle}</div>
                </div>
                
                <div style="padding: 12px; background: white; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 14px; margin-bottom: 4px;">Date</div>
                    <div style="color: #1F2937; font-weight: 600; font-size: 16px;">${formattedDate}</div>
                </div>
                
                <div style="padding: 12px; background: white; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 14px; margin-bottom: 4px;">Time</div>
                    <div style="color: #1F2937; font-weight: 600; font-size: 16px;">${formattedStartTime} - ${formattedEndTime}</div>
                </div>
                
                <div style="padding: 12px; background: white; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 14px; margin-bottom: 4px;">Batch</div>
                    <div style="color: #1F2937; font-weight: 600; font-size: 16px;">${batchName}</div>
                </div>
                
                <div style="padding: 12px; background: white; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 14px; margin-bottom: 4px;">Teacher</div>
                    <div style="color: #1F2937; font-weight: 600; font-size: 16px;">${teacherName}</div>
                </div>
            </div>
        </div>

        <div style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <div style="font-size: 20px; margin-bottom: 8px;">⚡</div>
            <h4 style="margin: 0 0 8px; color: #92400E; font-size: 16px; font-weight: 700;">Quick Instructions</h4>
            <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.5;">
                1. Go to your student dashboard<br>
                2. Find your class and click "Join Class"<br>
                3. Enter the access code above<br>
                4. You'll be marked as present!
            </p>
        </div>

        <div style="background: #FEE2E2; border-left: 4px solid #EF4444; padding: 16px; margin: 24px 0; border-radius: 8px;">
            <p style="margin: 0; color: #991B1B; font-size: 14px; font-weight: 600;">
                ⏰ <strong>Important:</strong> This access code expires at <strong>${formattedExpiryTime}</strong>. 
                Make sure to join before it expires!
            </p>
        </div>

        <p style="margin: 24px 0 0; font-size: 14px; color: #6B7280; text-align: center; line-height: 1.5;">
            If you have any issues joining the class, please contact your teacher or support team immediately.
        </p>
    `;

    const text = `
Access Code for ${classTitle}

Hello ${studentName || 'there'},

Your class "${classTitle}" with ${teacherName} has started!

ACCESS CODE: ${accessCode}
Expires at: ${formattedExpiryTime}

Class Details:
- Date: ${formattedDate}
- Time: ${formattedStartTime} - ${formattedEndTime}
- Batch: ${batchName}
- Teacher: ${teacherName}

Instructions:
1. Go to your student dashboard
2. Find your class and click "Join Class"
3. Enter the access code: ${accessCode}
4. You'll be marked as present!

Important: This access code expires at ${formattedExpiryTime}. Make sure to join before it expires!

If you have any issues, please contact your teacher or support team.

© ${new Date().getFullYear()} Learn French with Natives. All rights reserved.
    `;

    return {
        subject,
        html: baseHtml({ 
            subject, 
            headerTitle: 'Class Access Code', 
            bodyHtml, 
            logoCid 
        }),
        text: text.trim()
    };
}

module.exports = { buildAccessCodeTemplate };