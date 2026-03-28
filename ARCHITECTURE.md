# French Teaching Platform - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [System Components](#system-components)
5. [Database Architecture](#database-architecture)
6. [API Architecture](#api-architecture)
7. [Real-Time Communication](#real-time-communication)
8. [Security Architecture](#security-architecture)
9. [File Storage](#file-storage)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

The French Teaching Platform is a full-stack web application designed to manage French language education. It provides comprehensive tools for administrators, teachers, and students to manage classes, quizzes, resources, schedules, attendance, and real-time communication.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React SPA (TypeScript)                                   │  │
│  │  - Ant Design UI Components                               │  │
│  │  - React Router (Client-side routing)                     │  │
│  │  - Context API (State Management)                         │  │
│  │  - Socket.io Client (Real-time)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Node.js + Express.js Server                              │  │
│  │  - RESTful API Endpoints                                  │  │
│  │  - JWT Authentication Middleware                          │  │
│  │  - Socket.io Server (WebSocket)                           │  │
│  │  - Business Logic Services                                │  │
│  │  - File Upload Handler (Multer)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ SQL
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (Aiven Cloud)                        │  │
│  │  - 25+ Tables with Relationships                          │  │
│  │  - Indexes for Performance                                │  │
│  │  - Stored Functions                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘


---

## Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI Framework |
| TypeScript | 5.8.3 | Type Safety |
| Ant Design | 5.27.3 | UI Component Library |
| React Router | 7.9.1 | Client-side Routing |
| Socket.io Client | 4.8.1 | Real-time Communication |
| Axios | 1.12.2 | HTTP Client |
| Vite | 7.1.2 | Build Tool & Dev Server |
| Chart.js | 4.5.0 | Data Visualization |
| FullCalendar | 6.1.19 | Calendar/Schedule UI |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥18.0.0 | Runtime Environment |
| Express.js | 5.1.0 | Web Framework |
| PostgreSQL | 8.16.3 (pg) | Database |
| Socket.io | 4.8.1 | WebSocket Server |
| JWT | 9.0.2 | Authentication |
| Bcrypt.js | 3.0.2 | Password Hashing |
| Multer | 2.0.2 | File Upload |
| Nodemailer | 7.0.9 | Email Service |
| Node-cron | 4.2.1 | Scheduled Jobs |

### Database
- **Primary**: PostgreSQL (Aiven Cloud)
- **SSL/TLS**: Enabled with certificate authentication
- **Connection Pooling**: Supported
- **Backup**: Aiven managed backups

---

## Architecture Patterns

### 1. **Three-Tier Architecture**
```
Presentation Tier (React Frontend)
        ↓
Application Tier (Express Backend)
        ↓
Data Tier (PostgreSQL Database)
```

### 2. **MVC Pattern (Backend)**
- **Models**: Database schemas and queries
- **Views**: JSON responses
- **Controllers**: Route handlers in `/routes`

### 3. **Service Layer Pattern**
Business logic separated into service classes:
- `ChatService`: Chat operations and permissions
- `AttendanceService`: Attendance tracking
- `QuizReminderScheduler`: Automated quiz reminders
- `ReminderService`: Class reminders

### 4. **Repository Pattern**
Database access abstracted through:
- `PostgreSQLDatabase` class
- Helper methods: `run()`, `get()`, `all()`
- Parameter normalization for SQL injection prevention

### 5. **Context API Pattern (Frontend)**
Global state management:
- `AuthContext`: User authentication state
- `ChatContext`: Chat state and WebSocket connection

---

## System Components

### Frontend Components Structure

```
frontend/src/
├── components/
│   ├── Admin/              # Admin-specific components
│   │   ├── AdminDashboard.tsx
│   │   ├── UserManagement.tsx
│   │   ├── BatchManagement.tsx
│   │   ├── AttendanceManagement.tsx
│   │   ├── AdminTimetable.tsx
│   │   ├── AdminSettings.tsx
│   │   └── DemoRequests.tsx
│   │
│   ├── Teacher/            # Teacher-specific components
│   │   ├── TeacherDashboard.tsx
│   │   ├── TeacherBatches.tsx
│   │   ├── QuizManagement.tsx
│   │   ├── ResourceManagement.tsx
│   │   ├── ScheduleManagement.tsx
│   │   └── AssignDemo.tsx
│   │
│   ├── Student/            # Student-specific components
│   │   ├── StudentDashboard.tsx
│   │   ├── StudentQuizzes.tsx
│   │   ├── StudentResources.tsx
│   │   ├── StudentSchedule.tsx
│   │   ├── StudentQuizResults.tsx
│   │   └── StudentMarksheet.tsx
│   │
│   ├── Chat/               # Real-time chat system
│   │   ├── Chat.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ConversationList.tsx
│   │   ├── MessageItem.tsx
│   │   ├── CreateConversationModal.tsx
│   │   ├── GroupProfile.tsx
│   │   └── ImageViewer.tsx
│   │
│   ├── Quiz/               # Quiz components
│   │   ├── QuizBuilder.tsx
│   │   ├── QuizTaking.tsx
│   │   ├── QuizResults.tsx
│   │   └── QuizInsights.tsx
│   │
│   ├── Auth/               # Authentication
│   │   ├── Login.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ForcePasswordChange.tsx
│   │   ├── PasswordResetModal.tsx
│   │   └── AccountDisabledModal.tsx
│   │
│   ├── Common/             # Shared components
│   │   ├── Profile.tsx
│   │   └── ChangeEmailModal.tsx
│   │
│   ├── Landing/            # Public pages
│   │   ├── LandingPage.tsx
│   │   └── DemoRequestModal.tsx
│   │
│   └── Layout/             # Layout wrapper
│       └── Layout.tsx
│
├── contexts/               # Global state
│   ├── AuthContext.tsx
│   └── ChatContext.tsx
│
├── hooks/                  # Custom hooks
│   └── useResponsive.ts
│
└── utils/                  # Utilities
    ├── assets.ts
    ├── branding.ts
    └── dateUtils.ts
```


### Backend Components Structure

```
backend/
├── server.js               # Application entry point
│
├── routes/                 # API endpoints
│   ├── auth.js            # Authentication (login, profile, password)
│   ├── users.js           # User management
│   ├── batches.js         # Batch/class management
│   ├── quizzes.js         # Quiz CRUD operations
│   ├── resources.js       # Learning resources
│   ├── schedules.js       # Class schedules
│   ├── attendance.js      # Attendance tracking
│   ├── chat.js            # Chat API endpoints
│   ├── emailChange.js     # Email change verification
│   ├── passwordReset.js   # Password reset flow
│   ├── adminSettings.js   # Admin configuration
│   └── demoRequests.js    # Demo request handling
│
├── services/              # Business logic
│   ├── chatService.js            # Chat operations & permissions
│   ├── chatSocketService.js      # WebSocket event handlers
│   ├── attendanceService.js      # Attendance logic
│   ├── quizReminderScheduler.js  # Quiz reminders
│   └── reminderService.js        # Class reminders
│
├── middleware/            # Express middleware
│   └── auth.js           # JWT verification, role checks
│
├── database/              # Database layer
│   ├── init-postgres.js          # PostgreSQL connection
│   ├── postgres-schema.sql       # Main schema
│   ├── chat-schema.sql           # Chat tables
│   ├── attendance-schema.sql     # Attendance tables
│   └── migrations/               # Schema migrations
│
├── uploads/               # File storage
│   ├── resources/        # Learning materials
│   └── chat/             # Chat attachments
│
└── cert/                  # SSL certificates
    └── ca.pem            # Aiven CA certificate
```

---

## Database Architecture

### Entity Relationship Overview

```
┌─────────────┐
│    users    │──────┐
└─────────────┘      │
       │             │
       │ creates     │ teaches
       │             │
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│   quizzes   │  │   batches   │
└─────────────┘  └─────────────┘
       │             │
       │             │ has
       │             │
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│  questions  │  │batch_students│
└─────────────┘  └─────────────┘
       │             │
       │             │
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│quiz_submiss.│  │ schedules   │
└─────────────┘  └─────────────┘
       │             │
       │             │
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│student_answ.│  │class_sessions│
└─────────────┘  └─────────────┘
                     │
                     │
                     ▼
                ┌─────────────┐
                │ attendance  │
                └─────────────┘
```

### Core Database Tables (25+ tables)

#### **User Management**
- `users` - User accounts (admin, teacher, student)
- `email_change_requests` - Email change verification
- `password_reset_requests` - Password reset tokens

#### **Batch Management**
- `batches` - Classes/groups
- `batch_students` - Student enrollment
- `batch_timetables` - Recurring schedules
- `user_batches` - User-batch relationships

#### **Quiz System**
- `quizzes` - Quiz definitions
- `questions` - Quiz questions
- `question_options` - MCQ options
- `quiz_batches` - Quiz assignments
- `quiz_submissions` - Student submissions
- `student_answers` - Individual answers
- `quiz_reminders_sent` - Reminder tracking

#### **Resources & Schedules**
- `resources` - Learning materials
- `schedules` - Class schedules
- `class_schedules` - Schedule details

#### **Attendance System**
- `class_sessions` - Individual class sessions
- `attendance` - Attendance records

#### **Chat System (9 tables)**
- `conversations` - Chat conversations
- `conversation_participants` - Membership
- `messages` - Chat messages
- `message_attachments` - File attachments
- `message_read_receipts` - Read status
- `message_reactions` - Emoji reactions
- `user_status` - Online/typing status
- `chat_notifications` - Notifications
- `blocked_users` - User blocking

#### **Demo Requests**
- `demo_requests` - Prospective student inquiries

#### **System**
- `migrations` - Schema version tracking

### Database Functions

PostgreSQL stored functions for complex operations:

```sql
-- Check if user can access conversation
get_direct_conversation(user1_id, user2_id)

-- Find existing direct conversation
can_user_access_conversation(user_id, conversation_id)

-- Mark messages as read
mark_messages_as_read(user_id, conversation_id)

-- Get total unread count
get_total_unread_count(user_id)
```

### Indexing Strategy

Performance-optimized indexes on:
- Foreign keys (all relationships)
- Frequently queried columns (status, dates, roles)
- Composite indexes (batch_id + student_id, quiz_id + status)
- Unique constraints (email, username, quiz submissions)

---

## API Architecture

### RESTful API Design

Base URL: `/api`

#### Authentication Endpoints
```
POST   /api/auth/login              # User login
GET    /api/auth/verify             # Verify JWT token
GET    /api/auth/profile            # Get user profile
PUT    /api/auth/profile            # Update profile
PUT    /api/auth/change-password    # Change password
```

#### User Management (Admin)
```
GET    /api/users                   # List all users
POST   /api/users                   # Create user
PUT    /api/users/:id               # Update user
DELETE /api/users/:id               # Delete user
GET    /api/users/:id/batches       # Get user's batches
```

#### Batch Management
```
GET    /api/batches                 # List batches
POST   /api/batches                 # Create batch
PUT    /api/batches/:id             # Update batch
DELETE /api/batches/:id             # Delete batch
GET    /api/batches/:id/students    # Get batch students
POST   /api/batches/:id/students    # Add student to batch
DELETE /api/batches/:id/students/:studentId  # Remove student
GET    /api/batches/:id/insights    # Batch analytics
```

#### Quiz Management
```
GET    /api/quizzes                 # List quizzes
POST   /api/quizzes                 # Create quiz
GET    /api/quizzes/:id             # Get quiz details
PUT    /api/quizzes/:id             # Update quiz
DELETE /api/quizzes/:id             # Delete quiz
POST   /api/quizzes/:id/publish     # Publish quiz
GET    /api/quizzes/:id/submissions # Get submissions
POST   /api/quizzes/:id/submit      # Submit quiz
GET    /api/quizzes/:id/results     # Get results
```

#### Resource Management
```
GET    /api/resources               # List resources
POST   /api/resources               # Upload resource
GET    /api/resources/:id           # Get resource
DELETE /api/resources/:id           # Delete resource
```

#### Schedule Management
```
GET    /api/schedules               # List schedules
POST   /api/schedules               # Create schedule
PUT    /api/schedules/:id           # Update schedule
DELETE /api/schedules/:id           # Delete schedule
```

#### Attendance Management
```
GET    /api/attendance              # List attendance records
POST   /api/attendance/sessions     # Create session
POST   /api/attendance/check-in     # Student check-in
GET    /api/attendance/sessions/:id # Get session details
PUT    /api/attendance/sessions/:id/end  # End session
GET    /api/attendance/analytics    # Attendance analytics
```

#### Chat Endpoints
```
GET    /api/chat/conversations      # List conversations
POST   /api/chat/conversations/direct    # Create direct chat
POST   /api/chat/conversations/group     # Create group chat
GET    /api/chat/conversations/:id       # Get conversation
GET    /api/chat/conversations/:id/messages  # Get messages
POST   /api/chat/conversations/:id/upload   # Upload file
PUT    /api/chat/conversations/:id/read    # Mark as read
GET    /api/chat/conversations/:id/search  # Search messages
GET    /api/chat/contacts           # Get contacts list
GET    /api/chat/unread-count       # Get unread count
POST   /api/chat/messages/:id/reactions   # Add reaction
PUT    /api/chat/messages/:id       # Edit message
DELETE /api/chat/messages/:id       # Delete message
```


### API Response Format

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [ ... ]
}
```

### Authentication Flow

```
1. User submits credentials
   ↓
2. Server validates credentials
   ↓
3. Check account status (active, locked)
   ↓
4. Verify password with bcrypt
   ↓
5. Generate JWT token (24h expiry)
   ↓
6. Return token + user data
   ↓
7. Client stores token in localStorage
   ↓
8. Client includes token in Authorization header
   ↓
9. Server validates token on each request
```

### Middleware Chain

```
Request → CORS → Body Parser → Auth Middleware → Route Handler → Response
                                      ↓
                              JWT Verification
                                      ↓
                              Role Authorization
```

---

## Real-Time Communication

### WebSocket Architecture (Socket.io)

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Socket.io Client                                   │    │
│  │  - Auto-reconnection                                │    │
│  │  - Event listeners                                  │    │
│  │  - Room subscriptions                               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                         ↕ WebSocket (WSS)
┌─────────────────────────────────────────────────────────────┐
│                    Server (Node.js)                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Socket.io Server                                   │    │
│  │  - Connection management                            │    │
│  │  - Room management                                  │    │
│  │  - Event broadcasting                               │    │
│  │  - JWT authentication                               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Chat WebSocket Events

#### Client → Server Events
```javascript
// Send message
socket.emit('chat:send_message', {
  conversationId: number,
  content: string,
  messageType: 'text' | 'image' | 'file',
  replyToMessageId?: number
}, callback)

// Typing indicator
socket.emit('chat:typing', {
  conversationId: number,
  isTyping: boolean
})

// Mark as read
socket.emit('chat:mark_as_read', {
  conversationId: number
}, callback)

// Edit message
socket.emit('chat:edit_message', {
  messageId: number,
  content: string
}, callback)

// Delete message
socket.emit('chat:delete_message', {
  messageId: number
}, callback)

// Add reaction
socket.emit('chat:add_reaction', {
  messageId: number,
  emoji: string
}, callback)
```

#### Server → Client Events
```javascript
// New message received
socket.on('chat:new_message', (message) => { ... })

// User typing
socket.on('chat:user_typing', ({ conversationId, userId, isTyping }) => { ... })

// Messages read
socket.on('chat:messages_read', ({ conversationId, userId, readAt }) => { ... })

// User status changed
socket.on('chat:user_status_changed', ({ userId, status, lastSeenAt }) => { ... })

// Message edited
socket.on('chat:message_edited', ({ messageId, content, editedAt }) => { ... })

// Message deleted
socket.on('chat:message_deleted', ({ messageId, conversationId }) => { ... })

// Reaction added/removed
socket.on('chat:reaction_added', ({ messageId, userId, emoji }) => { ... })
socket.on('chat:reaction_removed', ({ messageId, userId, emoji }) => { ... })
```

### Room Management

```javascript
// User joins conversation room
socket.join(`conversation:${conversationId}`)

// Broadcast to conversation
io.to(`conversation:${conversationId}`).emit('chat:new_message', message)

// User leaves conversation
socket.leave(`conversation:${conversationId}`)
```

### Connection Lifecycle

```
1. Client connects with JWT token
   ↓
2. Server authenticates token
   ↓
3. Store socket ID in user_status table
   ↓
4. Update user status to 'online'
   ↓
5. Join user-specific room
   ↓
6. Broadcast online status to contacts
   ↓
7. Handle events during connection
   ↓
8. On disconnect: Update status to 'offline'
   ↓
9. Broadcast offline status
```

---

## Security Architecture

### Authentication & Authorization

#### JWT Token Structure
```json
{
  "userId": 123,
  "role": "teacher",
  "iat": 1234567890,
  "exp": 1234654290
}
```

#### Role-Based Access Control (RBAC)

```
┌──────────────────────────────────────────────────────┐
│                    Admin Role                         │
│  - Full system access                                 │
│  - User management                                    │
│  - Batch management                                   │
│  - View all data                                      │
│  - System settings                                    │
│  - Can message anyone                                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                   Teacher Role                        │
│  - Manage assigned batches                            │
│  - Create quizzes & resources                         │
│  - View assigned students                             │
│  - Track student progress                             │
│  - Can message assigned students + admin              │
│  - Can create group chats with students               │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                   Student Role                        │
│  - View assigned batches                              │
│  - Take quizzes                                       │
│  - Access resources                                   │
│  - View schedules                                     │
│  - Can message assigned teachers + admin              │
│  - Cannot create group chats                          │
│  - Cannot message other students                      │
└──────────────────────────────────────────────────────┘
```

### Security Measures

#### 1. Password Security
- **Hashing**: Bcrypt with salt rounds
- **Policy**: Minimum 6 characters
- **Expiration**: 90 days (configurable)
- **Force Change**: On first login
- **History**: Prevent reuse (future enhancement)

#### 2. Account Protection
- **Failed Login Tracking**: Max 5 attempts
- **Account Lockout**: 30 minutes after max attempts
- **Account Disable**: Admin can disable accounts
- **Session Management**: JWT with 24h expiry

#### 3. Input Validation
- **Express Validator**: All inputs validated
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **File Upload Validation**: Type and size checks

#### 4. API Security
- **CORS**: Configured allowed origins
- **Rate Limiting**: Express rate limiter
- **Helmet**: Security headers
- **HTTPS**: SSL/TLS encryption

#### 5. Database Security
- **SSL/TLS**: Encrypted connections
- **Certificate Authentication**: Aiven CA cert
- **Connection Pooling**: Secure connection reuse
- **Prepared Statements**: SQL injection prevention

#### 6. Chat Security
- **Permission Checks**: Multi-level enforcement
  - API level
  - WebSocket level
  - Database level
  - UI level
- **Message Validation**: Content sanitization
- **File Upload**: Image-only restriction (50MB limit)
- **User Blocking**: Privacy controls

### Data Privacy

#### Personal Data Handling
- Email addresses stored securely
- Passwords never stored in plain text
- User data access restricted by role
- Audit trails for sensitive operations

#### GDPR Considerations
- User data deletion capability
- Data export functionality (future)
- Consent management (future)
- Privacy policy compliance

---

## File Storage

### Upload Directory Structure

```
backend/uploads/
├── resources/              # Learning materials
│   ├── [timestamp]-[filename].pdf
│   ├── [timestamp]-[filename].docx
│   └── [timestamp]-[filename].pptx
│
└── chat/                   # Chat attachments
    ├── [timestamp]-[filename].jpg
    ├── [timestamp]-[filename].png
    └── [timestamp]-[filename].gif
```

### File Upload Flow

```
1. Client selects file
   ↓
2. FormData created with file
   ↓
3. POST to upload endpoint
   ↓
4. Multer middleware processes upload
   ↓
5. File validation (type, size)
   ↓
6. Save to disk with unique name
   ↓
7. Create database record
   ↓
8. Return file metadata
   ↓
9. Client displays uploaded file
```

### File Serving

```
Static file serving via Express:
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

Access URL: http://domain.com/uploads/chat/file-123456.jpg
```

### Storage Limits
- **Max File Size**: 50MB
- **Allowed Types (Resources)**: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
- **Allowed Types (Chat)**: JPG, JPEG, PNG, GIF, WEBP
- **Storage Location**: Local filesystem (can be migrated to S3/CDN)


---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet (HTTPS/WSS)                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    CDN / Load Balancer                       │
│              (Cloudflare / AWS CloudFront)                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
┌──────────────────────┐                 ┌──────────────────────┐
│   Frontend (Vite)    │                 │  Backend (Node.js)   │
│   Static Hosting     │                 │   Render / Heroku    │
│   - Vercel           │                 │   - Express Server   │
│   - Netlify          │                 │   - Socket.io        │
│   - AWS S3           │                 │   - Port 5000        │
└──────────────────────┘                 └──────────────────────┘
                                                    ↓
                                         ┌──────────────────────┐
                                         │  PostgreSQL (Aiven)  │
                                         │  - Cloud Database    │
                                         │  - SSL/TLS           │
                                         │  - Auto Backups      │
                                         └──────────────────────┘
```

### Environment Configuration

#### Frontend (.env)
```bash
VITE_API_BASE_URL=https://api.domain.com/api
```

#### Backend (.env)
```bash
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://domain.com

# Database (Aiven PostgreSQL)
DB_HOST=pg-xxxxx.aivencloud.com
DB_PORT=25952
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=xxxxx
DB_SSL=true

# Authentication
JWT_SECRET=your_super_secure_secret
JWT_EXPIRES_IN=24h

# Email (Hostinger SMTP)
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=support@domain.com
EMAIL_PASS=xxxxx
EMAIL_FROM="App Name <support@domain.com>"

# Brevo API (Alternative email service)
BREVO_API_KEY=xxxxx

# File Upload
MAX_FILE_SIZE=50mb
UPLOAD_PATH=./uploads
```

### Deployment Steps

#### Frontend Deployment (Vite Build)
```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Output directory: dist/
# 4. Deploy dist/ to static hosting
```

#### Backend Deployment (Render)
```bash
# 1. Push to Git repository
git push origin main

# 2. Render auto-deploys from Git

# Build Command: npm install
# Start Command: npm start

# 3. Set environment variables in Render dashboard
```

### Database Migration

```bash
# 1. Connect to PostgreSQL
psql -h pg-xxxxx.aivencloud.com -p 25952 -U avnadmin -d defaultdb

# 2. Run schema
\i backend/database/postgres-schema.sql

# 3. Run chat schema
\i backend/database/chat-schema.sql

# 4. Run attendance schema
\i backend/database/attendance-schema.sql

# 5. Verify tables
\dt
```

### SSL/TLS Configuration

#### Aiven PostgreSQL SSL
```javascript
// backend/database/init-postgres.js
const certPath = path.join(__dirname, '..', 'cert', 'ca.pem');
const ca = fs.readFileSync(certPath, 'utf8');

config.ssl = {
  rejectUnauthorized: true,
  ca: ca
};
```

#### HTTPS (Frontend)
- Automatic via hosting provider (Vercel, Netlify)
- Or configure with Let's Encrypt

#### WSS (WebSocket Secure)
- Automatic when server uses HTTPS
- Socket.io upgrades to WSS automatically

### Monitoring & Logging

#### Application Logs
```javascript
// Console logging
console.log('✅ Server started');
console.error('❌ Error:', error);

// Future: Winston or Pino for structured logging
```

#### Database Monitoring
- Aiven dashboard provides:
  - Connection metrics
  - Query performance
  - Storage usage
  - Backup status

#### Error Tracking
- Future: Sentry integration
- Future: Application Performance Monitoring (APM)

### Backup Strategy

#### Database Backups
- **Aiven Automatic Backups**: Daily
- **Retention**: 7-30 days (configurable)
- **Point-in-Time Recovery**: Available

#### File Backups
- **Uploads Directory**: Manual backup recommended
- **Future**: S3 with versioning

#### Code Repository
- **Git**: Version control
- **GitHub/GitLab**: Remote repository
- **Branches**: main, development, feature branches

---

## Performance Optimization

### Frontend Optimization

#### 1. Code Splitting
```javascript
// React.lazy for route-based splitting
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
```

#### 2. Asset Optimization
- **Vite**: Automatic code splitting
- **Tree Shaking**: Remove unused code
- **Minification**: Production builds
- **Compression**: Gzip/Brotli

#### 3. Caching Strategy
```javascript
// Service Worker (future)
// Cache static assets
// Cache API responses with stale-while-revalidate
```

### Backend Optimization

#### 1. Database Query Optimization
```sql
-- Indexes on frequently queried columns
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_quiz_submissions_status ON quiz_submissions(status);

-- Composite indexes for complex queries
CREATE INDEX idx_batch_students_batch_student 
ON batch_students(batch_id, student_id);
```

#### 2. Connection Pooling
```javascript
// PostgreSQL connection pool
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### 3. Caching (Future Enhancement)
- Redis for session storage
- Cache frequently accessed data
- Invalidate on updates

#### 4. Pagination
```javascript
// Limit results for large datasets
GET /api/quizzes?limit=50&offset=0
GET /api/chat/conversations/:id/messages?limit=50&offset=0
```

### WebSocket Optimization

#### 1. Room-Based Broadcasting
```javascript
// Only send to relevant users
io.to(`conversation:${conversationId}`).emit('chat:new_message', message);
```

#### 2. Event Throttling
```javascript
// Typing indicator debounced to 2 seconds
const debouncedTyping = debounce(() => {
  socket.emit('chat:typing', { conversationId, isTyping: false });
}, 2000);
```

#### 3. Connection Management
- Auto-reconnection with exponential backoff
- Heartbeat to detect dead connections
- Clean up on disconnect

---

## Scalability Considerations

### Horizontal Scaling

#### Application Servers
```
Load Balancer
    ↓
┌─────────┬─────────┬─────────┐
│ Node 1  │ Node 2  │ Node 3  │
└─────────┴─────────┴─────────┘
```

#### WebSocket Scaling
```javascript
// Use Redis adapter for Socket.io
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### Database Scaling

#### Read Replicas
```
Primary (Write)
    ↓
┌─────────┬─────────┬─────────┐
│ Replica │ Replica │ Replica │
│ (Read)  │ (Read)  │ (Read)  │
└─────────┴─────────┴─────────┘
```

#### Partitioning Strategy (Future)
- Partition by batch_id
- Partition by date (for historical data)
- Archive old quiz submissions

### Caching Strategy (Future)

```
┌──────────────────────────────────────┐
│           Application                 │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│        Redis Cache Layer              │
│  - User sessions                      │
│  - Frequently accessed data           │
│  - Real-time counters                 │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│      PostgreSQL Database              │
└──────────────────────────────────────┘
```

### CDN Integration (Future)

```
User Request
    ↓
CDN (Static Assets)
    ↓ (Cache Miss)
Origin Server
```

---

## Development Workflow

### Local Development Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd Teaching

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with local database credentials

# 4. Initialize database
node database/init-postgres.js

# 5. Start backend server
npm start
# Server runs on http://localhost:5000

# 6. Install frontend dependencies
cd ../frontend
npm install

# 7. Configure frontend environment
cp .env.example .env
# Edit .env with API URL

# 8. Start frontend dev server
npm run dev
# Frontend runs on http://localhost:5173
```

### Development Tools

- **Backend**: Nodemon for auto-restart
- **Frontend**: Vite HMR (Hot Module Replacement)
- **Database**: pgAdmin or DBeaver for PostgreSQL
- **API Testing**: Postman or Thunder Client
- **WebSocket Testing**: Socket.io client or Postman

### Git Workflow

```
main (production)
  ↓
development (staging)
  ↓
feature/feature-name (feature branches)
```

### Code Quality

#### Linting
```bash
# Frontend
npm run lint

# Backend (future)
npm run lint
```

#### Type Checking
```bash
# Frontend TypeScript
npm run type-check
```

---

## Future Enhancements

### Planned Features

1. **Video Conferencing Integration**
   - Zoom/Google Meet API integration
   - In-app video calls

2. **Advanced Analytics**
   - Student performance trends
   - Batch comparison reports
   - Predictive analytics

3. **Mobile Application**
   - React Native app
   - Push notifications
   - Offline mode

4. **AI Integration**
   - Automated grading for text answers
   - Chatbot for student queries
   - Personalized learning paths

5. **Enhanced Chat Features**
   - Voice messages
   - Video messages
   - Message threading
   - @mentions with notifications

6. **Gamification**
   - Badges and achievements
   - Leaderboards
   - Progress tracking

7. **Payment Integration**
   - Stripe/PayPal integration
   - Subscription management
   - Invoice generation

8. **Multi-language Support**
   - i18n implementation
   - French/English toggle
   - RTL support

### Technical Improvements

1. **Microservices Architecture**
   - Separate services for chat, quizzes, etc.
   - API Gateway

2. **GraphQL API**
   - Alternative to REST
   - Efficient data fetching

3. **Event-Driven Architecture**
   - Message queue (RabbitMQ/Kafka)
   - Async processing

4. **Advanced Caching**
   - Redis implementation
   - Cache invalidation strategies

5. **Comprehensive Testing**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Cypress/Playwright)

6. **CI/CD Pipeline**
   - GitHub Actions
   - Automated testing
   - Automated deployment

7. **Monitoring & Observability**
   - Sentry for error tracking
   - DataDog/New Relic for APM
   - ELK stack for logging

---

## Conclusion

The French Teaching Platform is built with a modern, scalable architecture that prioritizes:

- **Security**: Multi-layer authentication and authorization
- **Performance**: Optimized queries and real-time communication
- **Maintainability**: Clean code structure and separation of concerns
- **Scalability**: Designed to handle growth in users and data
- **User Experience**: Responsive UI with real-time updates

The architecture supports the current feature set while providing a solid foundation for future enhancements and scaling requirements.

---

**Document Version**: 1.0  
**Last Updated**: November 9, 2025  
**Maintained By**: Development Team
