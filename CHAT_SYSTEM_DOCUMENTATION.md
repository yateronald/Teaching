# Real-Time Chat System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Role-Based Permissions](#role-based-permissions)
5. [Setup & Installation](#setup--installation)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [WebSocket Events](#websocket-events)
9. [Frontend Components](#frontend-components)
10. [Usage Guide](#usage-guide)
11. [Testing](#testing)
12. [Security Considerations](#security-considerations)
13. [Troubleshooting](#troubleshooting)

---

## Overview

A comprehensive real-time chat system integrated into the French Teaching Application, featuring direct messaging and group chats with role-based access control, real-time updates via WebSockets, read receipts, typing indicators, and file attachments.

### Key Technologies
- **Backend**: Node.js, Express.js, Socket.io, PostgreSQL
- **Frontend**: React, TypeScript, Ant Design, Socket.io-client
- **Database**: PostgreSQL with optimized indexing

---

## Features

### Core Features
✅ **Real-time Messaging** - Instant message delivery using WebSocket technology  
✅ **Direct Conversations** - One-on-one chats between permitted users  
✅ **Group Chats** - Multi-user conversations (Admin/Teacher only can create)  
✅ **Read Receipts** - Track message status (sent/delivered/read)  
✅ **Typing Indicators** - See when others are composing messages  
✅ **User Status Tracking** - Online/offline status with last seen  
✅ **File Attachments** - Share images, documents, and other files (up to 50MB)  
✅ **Message Search** - Full-text search within conversations  
✅ **Notification System** - In-app notifications for new messages  
✅ **Message Reactions** - Emoji reactions to messages  
✅ **Message Editing** - Edit sent messages  
✅ **Message Deletion** - Delete sent messages  
✅ **Unread Count** - Badge showing total unread messages  

### Security Features
✅ **JWT Authentication** - Secure WebSocket connections  
✅ **Role-Based Access Control** - Strict permission enforcement  
✅ **Message Encryption Support** - Infrastructure for encrypted messages  
✅ **User Blocking** - Privacy controls for users  

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   ChatUI     │  │ ChatContext  │  │ Socket.io    │     │
│  │  Components  │◄─┤   Provider   │◄─┤   Client     │     │
│  └──────────────┘  └──────────────┘  └──────┬───────┘     │
└────────────────────────────────────────────┼────────────────┘
                                             │
                                   WebSocket │ Connection
                                             │
┌────────────────────────────────────────────┼────────────────┐
│                    Backend (Node.js)       │                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───▼──────────┐     │
│  │ Chat Routes  │  │ ChatService  │  │ Socket.io    │     │
│  │  (REST API)  │──┤   Business   │  │   Server     │     │
│  └──────────────┘  │    Logic     │  └──────────────┘     │
│                     └──────┬───────┘                        │
│                            │                                │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │            PostgreSQL Database                       │  │
│  │  • conversations        • message_read_receipts     │  │
│  │  • conversation_participants • user_status          │  │
│  │  • messages            • chat_notifications         │  │
│  │  • message_attachments • message_reactions          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

```
frontend/src/
├── contexts/
│   └── ChatContext.tsx          # Global chat state & WebSocket management
├── components/Chat/
│   ├── Chat.tsx                 # Main chat container
│   ├── ConversationList.tsx     # Sidebar with conversation list
│   ├── ChatWindow.tsx           # Message display & input
│   ├── CreateConversationModal.tsx  # New chat creation
│   └── Chat.css                 # Styling

backend/
├── services/
│   ├── chatService.js           # Business logic & permissions
│   └── chatSocketService.js     # WebSocket event handlers
├── routes/
│   └── chat.js                  # REST API endpoints
├── database/
│   └── chat-schema.sql          # Database schema & functions
```

---

## Role-Based Permissions

### Admin
- ✅ Can message anyone (teachers and students)
- ✅ Can create group chats with any users
- ✅ Can view all conversations
- ✅ Full access to all chat features

### Teacher
- ✅ Can message their assigned students
- ✅ Can message admins
- ✅ Can create group chats with their assigned students
- ✅ Can add/remove students from their groups
- ❌ Cannot message students not assigned to them
- ❌ Cannot message other teachers

### Student
- ✅ Can message their assigned teacher(s)
- ✅ Can message admins
- ✅ Can participate in group chats they're added to
- ❌ Cannot create group chats
- ❌ Cannot message other students directly
- ❌ Cannot message teachers not assigned to them

### Permission Enforcement
Permissions are enforced at multiple levels:
1. **API Level** - REST endpoints validate permissions
2. **WebSocket Level** - Real-time events check permissions
3. **UI Level** - Interface adapts based on role
4. **Database Level** - Helper functions validate access

---

## Setup & Installation

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 13
- Existing application setup

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install socket.io
```

2. **Apply Database Schema**
```bash
# The schema is automatically applied on server startup
# Or manually run:
psql -U your_user -d your_database -f database/chat-schema.sql
```

3. **Environment Variables** (already configured)
```env
# Existing variables in .env
PORT=5000
JWT_SECRET=your_secret_key
DATABASE_URL=your_postgresql_connection_string
```

4. **Start Server**
```bash
npm start
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install socket.io-client
```

2. **Environment Variables** (already configured)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

3. **Start Development Server**
```bash
npm run dev
```

---

## Database Schema

### Main Tables

#### `conversations`
Stores all chat conversations (direct and group)
```sql
- id: SERIAL PRIMARY KEY
- type: 'direct' | 'group'
- name: VARCHAR(255) - Group name (NULL for direct)
- description: TEXT
- created_by: INTEGER (user_id)
- created_at, updated_at, last_message_at
- is_archived: BOOLEAN
```

#### `conversation_participants`
Many-to-many relationship between users and conversations
```sql
- id: SERIAL PRIMARY KEY
- conversation_id: INTEGER
- user_id: INTEGER
- role: 'admin' | 'member'
- joined_at, left_at
- is_muted, is_pinned: BOOLEAN
- unread_count: INTEGER
- last_read_at: TIMESTAMP
```

#### `messages`
Stores all chat messages
```sql
- id: SERIAL PRIMARY KEY
- conversation_id: INTEGER
- sender_id: INTEGER
- message_type: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system'
- content: TEXT
- is_encrypted, is_edited, is_deleted: BOOLEAN
- reply_to_message_id: INTEGER
- created_at, edited_at, deleted_at
- metadata: JSONB
```

#### `message_read_receipts`
Tracks message delivery and read status
```sql
- id: SERIAL PRIMARY KEY
- message_id: INTEGER
- user_id: INTEGER
- status: 'sent' | 'delivered' | 'read'
- delivered_at, read_at
```

#### `user_status`
Tracks user online/offline status and typing
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER UNIQUE
- status: 'online' | 'away' | 'busy' | 'offline'
- last_seen_at: TIMESTAMP
- is_typing_in_conversation_id: INTEGER
- typing_started_at: TIMESTAMP
- socket_id: VARCHAR(255)
```

### Helper Functions
- `get_direct_conversation(user1_id, user2_id)` - Find existing direct chat
- `can_user_access_conversation(user_id, conversation_id)` - Check access
- `mark_messages_as_read(user_id, conversation_id)` - Update read status
- `get_total_unread_count(user_id)` - Calculate total unread messages

---

## API Endpoints

### Base URL: `/api/chat`

#### GET `/conversations`
Get all user conversations
```javascript
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, conversations: [...] }
```

#### GET `/conversations/:conversationId`
Get conversation details
```javascript
Response: { success: true, conversation: {...} }
```

#### POST `/conversations/direct`
Create/get direct conversation
```javascript
Body: { userId: number }
Response: { success: true, conversationId: number }
```

#### POST `/conversations/group`
Create group conversation (Admin/Teacher only)
```javascript
Body: { 
  name: string, 
  description: string, 
  participantIds: number[] 
}
Response: { success: true, conversationId: number }
```

#### GET `/conversations/:conversationId/messages`
Get messages with pagination
```javascript
Query: { limit: 50, offset: 0 }
Response: { success: true, messages: [...] }
```

#### POST `/conversations/:conversationId/upload`
Upload file attachment
```javascript
FormData: { file: File }
Response: { success: true, message: {...}, file: {...} }
```

#### PUT `/conversations/:conversationId/read`
Mark messages as read
```javascript
Response: { success: true }
```

#### GET `/conversations/:conversationId/search`
Search messages
```javascript
Query: { q: string, limit: 20 }
Response: { success: true, messages: [...] }
```

#### GET `/unread-count`
Get total unread count
```javascript
Response: { success: true, unreadCount: number }
```

#### GET `/contacts`
Get list of users the authenticated user can message
```javascript
Response: { success: true, contacts: [...] }
```

---

## WebSocket Events

### Client → Server

#### `chat:send_message`
Send a new message
```javascript
socket.emit('chat:send_message', {
  conversationId: number,
  content: string,
  messageType: 'text' | 'file' | ...,
  replyToMessageId?: number
}, (response) => {
  // { success: boolean, message?: {...}, error?: string }
});
```

#### `chat:typing`
Send typing indicator
```javascript
socket.emit('chat:typing', {
  conversationId: number,
  isTyping: boolean
});
```

#### `chat:mark_as_read`
Mark messages as read
```javascript
socket.emit('chat:mark_as_read', {
  conversationId: number
}, (response) => {
  // { success: boolean }
});
```

#### `chat:delete_message`
Delete a message
```javascript
socket.emit('chat:delete_message', {
  messageId: number
}, (response) => {
  // { success: boolean }
});
```

#### `chat:edit_message`
Edit a message
```javascript
socket.emit('chat:edit_message', {
  messageId: number,
  content: string
}, (response) => {
  // { success: boolean }
});
```

#### `chat:add_reaction` / `chat:remove_reaction`
Add/remove emoji reaction
```javascript
socket.emit('chat:add_reaction', {
  messageId: number,
  emoji: string
}, (response) => {
  // { success: boolean }
});
```

### Server → Client

#### `chat:new_message`
Receive new message
```javascript
socket.on('chat:new_message', (message) => {
  // Handle new message
});
```

#### `chat:user_typing`
User typing in conversation
```javascript
socket.on('chat:user_typing', ({ conversationId, userId, isTyping }) => {
  // Update typing indicators
});
```

#### `chat:messages_read`
Messages marked as read
```javascript
socket.on('chat:messages_read', ({ conversationId, userId, readAt }) => {
  // Update read receipts
});
```

#### `chat:user_status_changed`
User online/offline status changed
```javascript
socket.on('chat:user_status_changed', ({ userId, status, lastSeenAt }) => {
  // Update user status
});
```

#### `chat:message_deleted` / `chat:message_edited`
Message deleted or edited
```javascript
socket.on('chat:message_deleted', ({ messageId, conversationId }) => {
  // Remove message from UI
});
```

#### `chat:reaction_added` / `chat:reaction_removed`
Reaction added/removed
```javascript
socket.on('chat:reaction_added', ({ messageId, userId, emoji }) => {
  // Update message reactions
});
```

---

## Frontend Components

### ChatContext
Global context providing:
- Socket connection management
- Conversation list
- Current conversation state
- Functions for all chat operations

### Chat Component
Main container with:
- Connection status indicator
- Conversation list sidebar
- Chat window area
- Create conversation modal

### ConversationList
Features:
- Search conversations
- Show online status
- Unread count badges
- Last message preview
- Conversation creation button

### ChatWindow
Features:
- Message display with timestamps
- Typing indicators
- Message input with file upload
- Online status indicator
- Message reactions
- Reply, edit, delete options

### CreateConversationModal
Two tabs:
- Direct Message: Select user from contacts
- Group Chat: Name, description, member selection (Admin/Teacher)

---

## Usage Guide

### For Students

1. **Start a Chat**
   - Click "Chat" in sidebar
   - Click "+" button
   - Select your teacher or admin from the list
   - Start messaging

2. **Send Messages**
   - Type in the message box
   - Press Enter or click Send
   - Attach files using the paperclip icon

3. **View Messages**
   - Unread messages show in bold
   - Checkmarks show read status
   - Online/offline status visible for direct chats

### For Teachers

1. **Message Students**
   - Access only your assigned students
   - Create direct conversations or groups

2. **Create Group Chats**
   - Click "+" → Group Chat tab
   - Enter group name and description
   - Select students from your batches
   - Click "Create Group"

3. **Manage Groups**
   - Add or remove students (own students only)
   - All group members can see messages

### For Admins

1. **Full Access**
   - Message anyone in the system
   - Create groups with any combination of users
   - View all conversations
   - Manage user permissions

2. **Creating Groups**
   - Similar to teachers but no restrictions
   - Can add anyone to groups

---

## Testing

### Manual Testing Checklist

#### Authentication & Permissions
- [ ] Student can only see their teacher and admin in contacts
- [ ] Teacher can only see their assigned students and admin
- [ ] Admin can see all users
- [ ] Unauthorized users cannot access restricted conversations

#### Direct Messaging
- [ ] Create new direct conversation
- [ ] Send text messages
- [ ] Receive messages in real-time
- [ ] Typing indicators work
- [ ] Read receipts update correctly
- [ ] Online/offline status displays

#### Group Chats
- [ ] Admin can create group with anyone
- [ ] Teacher can create group with their students
- [ ] Student cannot create groups
- [ ] All members receive group messages
- [ ] Group participant list shows correctly

#### File Attachments
- [ ] Upload images (jpg, png, gif)
- [ ] Upload documents (pdf, doc, xls)
- [ ] Upload videos (mp4)
- [ ] File size limit enforced (50MB)
- [ ] Multiple file types work

#### Message Features
- [ ] Edit own messages
- [ ] Delete own messages
- [ ] Reply to messages
- [ ] React with emojis
- [ ] Search messages in conversation

#### Notifications
- [ ] Unread count updates
- [ ] Badge shows on Chat menu item
- [ ] Notifications for offline users
- [ ] Mark as read clears notification

---

## Security Considerations

### Authentication
- All WebSocket connections require valid JWT token
- Token verified on connection and for each event
- Expired tokens automatically disconnect

### Authorization
- Role-based access control at all levels
- Permission checks before every database operation
- UI hides unauthorized features

### Data Protection
- Messages stored securely in PostgreSQL
- Support for encrypted message content
- File uploads validated for type and size
- SQL injection prevention with parameterized queries

### Privacy
- Users can only see conversations they're part of
- Blocked users feature available
- Message deletion removes content permanently

---

## Troubleshooting

### WebSocket Connection Issues

**Problem**: Chat shows "Connecting..." indefinitely

**Solutions**:
1. Check if backend server is running on correct port
2. Verify CORS settings include frontend URL
3. Check browser console for connection errors
4. Ensure JWT token is valid

```javascript
// Check connection status in browser console
const socket = io(SOCKET_URL, { auth: { token } });
socket.on('connect', () => console.log('Connected'));
socket.on('connect_error', (err) => console.error('Error:', err));
```

### Messages Not Sending

**Problem**: Messages appear stuck or not delivered

**Solutions**:
1. Check network connectivity
2. Verify user has permission to message recipient
3. Check browser console for errors
4. Refresh the page to reconnect WebSocket

### File Upload Failures

**Problem**: Files fail to upload

**Solutions**:
1. Check file size (max 50MB)
2. Verify file type is allowed
3. Check server disk space
4. Review server logs for upload errors

### Database Performance Issues

**Problem**: Slow message loading

**Solutions**:
1. Check database indexes are properly created
2. Review query performance with EXPLAIN
3. Consider pagination limits for large conversations
4. Clean up old messages if needed

### Permission Errors

**Problem**: "You do not have access to this conversation"

**Solutions**:
1. Verify user role and permissions
2. Check if user is still active
3. Verify conversation participants are correct
4. Review backend logs for permission checks

---

## Additional Notes

### Performance Optimization
- Messages are paginated (50 per page)
- Typing indicators debounced (2 seconds)
- Connection pooling for database
- Indexed queries for fast lookups

### Scalability
- WebSocket connections can be load balanced
- Database can be scaled horizontally
- File storage can be moved to S3/CDN
- Read replicas for message history

### Future Enhancements
- Voice/video calls
- Message encryption at rest
- Advanced search with filters
- Message pinning
- Conversation archiving
- Push notifications (mobile)
- Emoji picker integration
- GIF support
- Message threading
- @mentions with notifications

---

## Support & Maintenance

### Monitoring
- WebSocket connection count
- Message delivery rate
- Error rates and types
- Database query performance
- File storage usage

### Backup
- Regular database backups
- File attachment backups
- Configuration backups

### Updates
- Keep Socket.io updated
- Monitor security advisories
- Test updates in staging first

---

## Contact

For technical support or questions about the chat system:
- Check application logs: `backend/logs/`
- Review this documentation
- Contact system administrator

---

**Version**: 1.0.0  
**Last Updated**: November 2, 2025  
**Author**: Kilo Code