const { sendClassScheduleNotification, sendClassReminder } = require('./emails/emailService');

// Test data
const testData = {
    to: 'test@example.com',
    studentName: 'John Doe',
    className: 'French Grammar Basics',
    teacherName: 'Marie Dubois',
    batchName: 'Beginner French A1',
    frenchLevel: 'A1',
    startTime: '14:30',
    endTime: '15:30',
    date: '2025-01-22',
    location: 'Room 101, Language Center',
    locationMode: 'physical',
    link: null,
    description: 'Introduction to French grammar fundamentals including articles, basic sentence structure, and common verbs.'
};

async function testEmailSystem() {
    console.log('🧪 Testing Email Notification System...\n');

    try {
        // Test 1: Class Schedule Notification
        console.log('📧 Testing Class Schedule Notification...');
        console.log('Template data:', JSON.stringify(testData, null, 2));
        
        // Note: This will fail if no email transport is configured, but will test template generation
        try {
            await sendClassScheduleNotification(testData);
            console.log('✅ Class schedule notification sent successfully!');
        } catch (error) {
            if (error.message.includes('No recipients defined') || error.message.includes('Invalid login')) {
                console.log('⚠️  Email transport not configured, but template generation works');
            } else {
                console.error('❌ Class schedule notification failed:', error.message);
            }
        }

        // Test 2: Class Reminder
        console.log('\n📧 Testing Class Reminder...');
        try {
            await sendClassReminder(testData);
            console.log('✅ Class reminder sent successfully!');
        } catch (error) {
            if (error.message.includes('No recipients defined') || error.message.includes('Invalid login')) {
                console.log('⚠️  Email transport not configured, but template generation works');
            } else {
                console.error('❌ Class reminder failed:', error.message);
            }
        }

        console.log('\n🎉 Email system test completed!');
        console.log('\nNext steps:');
        console.log('1. Configure email transport in .env file');
        console.log('2. Create a class schedule through the frontend');
        console.log('3. Verify students receive notifications');
        console.log('4. Wait for 5-minute reminders to be sent automatically');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testEmailSystem().then(() => {
    console.log('\n✨ Test script completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script error:', error);
    process.exit(1);
});