# Chat System Setup Guide

## ✅ Database Schema Applied Successfully!

All 9 chat tables have been created in your Aiven PostgreSQL database:
- conversations
- conversation_participants  
- messages
- message_attachments
- message_read_receipts
- user_status
- chat_notifications
- blocked_users
- message_reactions

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm start
```

You should see:
```
✅ PostgreSQL database initialized
💬 Chat tables ready
💬 Chat WebSocket service initialized
🚀 Server running on port 5000
💬 Chat WebSocket server ready
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Access the Chat
1. Login to the application
2. Click on the **"Chat"** menu item in the sidebar
3. Click the **"+"** button to start a new conversation
4. Select a user from your contacts and start chatting!

## 📋 Testing Checklist

### Basic Functionality
- [ ] Login as different users (admin, teacher, student)
- [ ] Navigate to Chat tab (should show connection status)
- [ ] Click "+" to create new conversation
- [ ] Send a message and see it appear in real-time
- [ ] Check unread count badge in sidebar

### Role-Based Permissions

#### As Admin:
- [ ] Can see all users in contacts
- [ ] Can create group chats with anyone
- [ ] Can message any user

#### As Teacher:
- [ ] Can only see assigned students + admin in contacts
- [ ] Can create group chats with students
- [ ] Cannot message unassigned students

#### As Student:  
- [ ] Can only see assigned teacher + admin in contacts
- [ ] Cannot create group chats
- [ ] Cannot message other students

### Advanced Features
- [ ] Typing indicator appears when typing
- [ ] Online/offline status shows correctly
- [ ] File upload works (click paperclip icon)
- [ ] Messages show read receipts
- [ ] Search works within conversations

## 🔧 Troubleshooting

### Server Won't Start
**Error**: Chat tables not found

**Solution**: Run the migration again:
```bash
cd backend
node database/run-chat-migration.js
```

### WebSocket Connection Failed
**Check**:
1. Backend server is running on port 5000
2. Frontend VITE_API_BASE_URL is correct
3. No firewall blocking WebSocket connections

**Verify in browser console**:
```javascript
// Should show: Chat socket connected
```

### Permission Errors
**Error**: "You do not have access to this conversation"

**Causes**:
- Trying to message unauthorized users
- User account is inactive
- Database permissions not properly set

**Solution**: Verify role-based permissions are working correctly in the database

### Messages Not Appearing
**Check**:
1. WebSocket connection is established (green "Connected" status)
2. Browser console for JavaScript errors
3. Backend logs for permission errors

## 📊 Database Verification

To verify all tables were created correctly:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%conversation%' 
   OR table_name LIKE '%message%' 
   OR table_name = 'user_status' 
   OR table_name = 'chat_notifications' 
   OR table_name = 'blocked_users'
ORDER BY table_name;
```

Should return 9 tables.

## 🎯 Next Steps

1. **Test with Real Users**: Create test accounts for each role
2. **Verify Permissions**: Ensure students can't message each other
3. **Test Group Chats**: Create groups as admin and teacher
4. **Upload Files**: Test file attachment feature
5. **Check Notifications**: Verify unread count works

## 📞 Support

For detailed documentation, see: [CHAT_SYSTEM_DOCUMENTATION.md](CHAT_SYSTEM_DOCUMENTATION.md)

For technical issues:
- Check backend server logs
- Review browser console
- Verify database connection
- Ensure all npm packages are installed

## ✨ Features Available

- ✅ Real-time messaging
- ✅ Direct conversations
- ✅ Group chats (Admin/Teacher)
- ✅ File attachments (up to 50MB)
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Online/offline status
- ✅ Message search
- ✅ Unread count badges
- ✅ Emoji reactions
- ✅ Message editing/deletion
- ✅ Role-based permissions

**The chat system is now fully operational! 🎉**