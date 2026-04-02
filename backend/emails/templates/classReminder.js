const { baseHtml } = require('./base');

function buildClassReminderTemplate({ 
    studentName, 
    className, 
    teacherName, 
    batchName, 
    startTime, 
    endTime, 
    date, 
    location, 
    locationMode, 
    link, 
    logoCid 
}) {
    const subject = `⏰ Class Starting Soon: ${className} in 5 minutes!`;
    
    // Format time nicely
    const formatTime = (timeStr) => {
        const time = new Date(`2000-01-01T${timeStr}`);
        return time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
    };

    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    
    // Quick access instruction for online classes
    const quickAccessButton = locationMode === 'online'
        ? `<div style="text-align: center; margin: 24px 0;">
             <p style="color: #6B7280; font-size: 15px; margin-bottom: 8px;">Please log in to your dashboard to join the class.</p>
           </div>`
        : '';

    // Location display for reminder
    const locationDisplay = locationMode === 'online' 
        ? `<div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 16px; border-radius: 12px; margin: 16px 0; text-align: center;">
             <div style="font-size: 18px; margin-bottom: 8px;">💻</div>
             <strong style="font-size: 16px;">Online Class</strong>
           </div>`
        : `<div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 16px; border-radius: 12px; margin: 16px 0; text-align: center;">
             <div style="font-size: 18px; margin-bottom: 8px;">📍</div>
             <strong style="font-size: 16px;">Physical Location</strong>
             <br><span style="color: #A7F3D0; font-weight: 500;">${location || 'Check your class details'}</span>
           </div>`;

    const bodyHtml = `
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 24px; border-radius: 16px; display: inline-block; animation: pulse 2s infinite;">
                <div style="font-size: 32px; margin-bottom: 8px;">⏰</div>
                <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Class Starting Soon!</h2>
                <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">Only 5 minutes left</p>
            </div>
        </div>

        <p style="margin: 0 0 24px; font-size: 16px; color: #374151; text-align: center;">
            Hello <strong>${studentName || 'there'}</strong>,
        </p>
        
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #6B7280; text-align: center;">
            Your class <strong>${className}</strong> with <strong>${teacherName}</strong> is starting in just <strong style="color: #EF4444;">5 minutes</strong>!
        </p>

        ${quickAccessButton}

        <div style="background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 16px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 20px; color: #1F2937; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center;">
                <span style="margin-right: 8px;">📚</span>
                Quick Class Info
            </h3>
            
            <div style="display: grid; gap: 12px; text-align: center;">
                <div style="padding: 12px; background: white; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 14px; margin-bottom: 4px;">Class</div>
                    <div style="color: #1F2937; font-weight: 600; font-size: 16px;">${className}</div>
                </div>
                
                <div style="padding: 12px; background: white; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 14px; margin-bottom: 4px;">Time</div>
                    <div style="color: #1F2937; font-weight: 600; font-size: 16px;">${formattedStartTime} - ${formattedEndTime}</div>
                </div>
                
                <div style="padding: 12px; background: white; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 14px; margin-bottom: 4px;">Batch</div>
                    <div style="color: #1F2937; font-weight: 600; font-size: 16px;">${batchName}</div>
                </div>
            </div>
        </div>

        ${locationDisplay}

        <div style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <div style="font-size: 20px; margin-bottom: 8px;">📝</div>
            <p style="margin: 0; color: #92400E; font-weight: 600; font-size: 15px;">
                Make sure you have your materials ready and a quiet space for learning!
            </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
                See you in class! Bonne chance! 🇫🇷
            </p>
        </div>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />
        
        <p style="margin: 0; font-size: 12px; color: #9CA3AF; text-align: center;">
            This is an automated reminder. If you have any issues joining the class, contact your teacher immediately.
        </p>
    `;

    const html = baseHtml({ 
        subject, 
        headerTitle: 'Class Reminder', 
        bodyHtml, 
        logoCid 
    });

    const text = `⏰ CLASS STARTING SOON!

Hello ${studentName || 'there'},

Your class "${className}" with ${teacherName} is starting in just 5 minutes!

Quick Details:
- Class: ${className}
- Time: ${formattedStartTime} - ${formattedEndTime}
- Batch: ${batchName}
- Location: ${locationMode === 'online' ? 'Online (Join from your dashboard)' : (location || 'Physical location')}

Make sure you have your materials ready!

See you in class! Bonne chance! 🇫🇷

Learn French with Natives Team`;

    return { subject, html, text };
}

module.exports = { buildClassReminderTemplate };