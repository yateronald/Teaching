const { baseHtml } = require('./base');

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
    const subject = `New Class Scheduled: ${className} - Learn French with Natives`;
    
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
    
    const formatTime = (timeStr) => {
        const time = new Date(`2000-01-01T${timeStr}`);
        return time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
    };

    const formattedDate = formatDate(date);
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    
    // Location display
    const locationDisplay = locationMode === 'online' 
        ? `<div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 16px; border-radius: 12px; margin: 16px 0;">
             <div style="display: flex; align-items: center; margin-bottom: 8px;">
               <span style="font-size: 18px; margin-right: 8px;">💻</span>
               <strong style="font-size: 16px;">Online Class</strong>
             </div>
             ${link ? `<a href="${link}" target="_blank" style="color: #BFDBFE; text-decoration: underline; font-weight: 500;">Join Meeting Link</a>` : '<span style="color: #BFDBFE;">Meeting link will be provided closer to class time</span>'}
           </div>`
        : `<div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 16px; border-radius: 12px; margin: 16px 0;">
             <div style="display: flex; align-items: center; margin-bottom: 8px;">
               <span style="font-size: 18px; margin-right: 8px;">📍</span>
               <strong style="font-size: 16px;">Physical Location</strong>
             </div>
             <span style="color: #A7F3D0; font-weight: 500;">${location || 'Location to be confirmed'}</span>
           </div>`;

    const bodyHtml = `
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 24px; border-radius: 16px; display: inline-block;">
                <div style="font-size: 24px; margin-bottom: 8px;">📚</div>
                <h2 style="margin: 0; font-size: 20px; font-weight: 700;">New Class Scheduled!</h2>
            </div>
        </div>

        <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">
            Hello <strong>${studentName || 'there'}</strong>,
        </p>
        
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #6B7280;">
            Great news! Your teacher <strong>${teacherName}</strong> has scheduled a new class for your batch <strong>${batchName}</strong>. Here are all the details:
        </p>

        <div style="background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 16px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 20px; color: #1F2937; font-size: 18px; font-weight: 700; display: flex; align-items: center;">
                <span style="margin-right: 8px;">📖</span>
                Class Details
            </h3>
            
            <div style="display: grid; gap: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                    <span style="color: #6B7280; font-weight: 500;">Class Name:</span>
                    <span style="color: #1F2937; font-weight: 600;">${className}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                    <span style="color: #6B7280; font-weight: 500;">French Level:</span>
                    <span style="background: #EEF2FF; color: #3730A3; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 14px;">${frenchLevel || 'Not specified'}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                    <span style="color: #6B7280; font-weight: 500;">Date:</span>
                    <span style="color: #1F2937; font-weight: 600;">${formattedDate}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                    <span style="color: #6B7280; font-weight: 500;">Time:</span>
                    <span style="color: #1F2937; font-weight: 600;">${formattedStartTime} - ${formattedEndTime}</span>
                </div>
            </div>
        </div>

        ${locationDisplay}

        ${description ? `
        <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="margin: 0 0 8px; color: #92400E; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Class Description</h4>
            <p style="margin: 0; color: #78350F; line-height: 1.5;">${description}</p>
        </div>
        ` : ''}

        <div style="background: linear-gradient(135deg, #EDE9FE, #DDD6FE); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <div style="font-size: 20px; margin-bottom: 8px;">⏰</div>
            <p style="margin: 0; color: #5B21B6; font-weight: 600; font-size: 15px;">
                Don't forget! You'll receive a reminder 5 minutes before the class starts.
            </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <p style="margin: 0 0 16px; color: #6B7280; font-size: 14px;">
                Questions about this class? Contact your teacher or our support team.
            </p>
            <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                <a href="mailto:${process.env.EMAIL_FROM || 'support@learnfrenchwithnatives.com'}" 
                   style="background: #6366F1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">
                    Contact Support
                </a>
            </div>
        </div>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />
        
        <p style="margin: 0; font-size: 12px; color: #9CA3AF; text-align: center;">
            We're excited to see you in class! Prepare your materials and get ready to learn French with natives.
        </p>
    `;

    const html = baseHtml({ 
        subject, 
        headerTitle: 'Class Scheduled', 
        bodyHtml, 
        logoCid 
    });

    const text = `Hello ${studentName || 'there'},

Great news! Your teacher ${teacherName} has scheduled a new class for your batch ${batchName}.

Class Details:
- Class Name: ${className}
- French Level: ${frenchLevel || 'Not specified'}
- Date: ${formattedDate}
- Time: ${formattedStartTime} - ${formattedEndTime}
- Location: ${locationMode === 'online' ? (link ? `Online - ${link}` : 'Online (link to be provided)') : (location || 'Physical location to be confirmed')}

${description ? `Description: ${description}` : ''}

You'll receive a reminder 5 minutes before the class starts.

Questions? Contact us at ${process.env.EMAIL_FROM || 'support@learnfrenchwithnatives.com'}

See you in class!
Learn French with Natives Team`;

    return { subject, html, text };
}

module.exports = { buildClassScheduleNotificationTemplate };