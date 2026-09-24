import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CLASS_ROLES, homeFor } from './utils/roles';
import LandingPage from './components/Landing/LandingPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';
import { BRAND_CONFIG } from './utils/branding';

// The signed-in app is loaded on demand, so the public pages stay light.
// Sign-in too: its form components are not needed to show the landing page.
const Login = lazy(() => import('./components/Auth/Login'));
const Layout = lazy(() => import('./components/Layout/Layout'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./components/Teacher/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./components/Student/StudentDashboard'));
const UserManagement = lazy(() => import('./components/Admin/UserManagement'));
const BatchManagement = lazy(() => import('./components/Admin/BatchManagement'));
const AttendanceManagement = lazy(() => import('./components/Admin/AttendanceManagement'));
const DemoRequests = lazy(() => import('./components/Admin/DemoRequests'));
const TeacherBatches = lazy(() => import('./components/Teacher/TeacherBatches'));
const AssignDemo = lazy(() => import('./components/Teacher/AssignDemo'));
const QuizManagement = lazy(() => import('./components/Teacher/QuizManagement'));
const ResourceManagement = lazy(() => import('./components/Teacher/ResourceManagement'));
const ScheduleManagement = lazy(() => import('./components/Teacher/ScheduleManagement'));
const TeacherExamPrep = lazy(() => import('./components/Teacher/TeacherExamPrep'));
const StudentQuizzes = lazy(() => import('./components/Student/StudentQuizzes'));
const StudentResources = lazy(() => import('./components/Student/StudentResources'));
const StudentSchedule = lazy(() => import('./components/Student/StudentSchedule'));
const StudentQuizResults = lazy(() => import('./components/Student/StudentQuizResults'));
const StudentMarksheet = lazy(() => import('./components/Student/StudentMarksheet'));
const StudentExamPreparation = lazy(() => import('./components/Student/StudentExamPreparation'));
const Profile = lazy(() => import('./components/Common/Profile'));
const BatchInsightsAdmin = lazy(() => import('./components/Admin/BatchInsightsAdmin'));
const AdminTimetable = lazy(() => import('./components/Admin/AdminTimetable'));
const AdminSettings = lazy(() => import('./components/Admin/AdminSettings'));
const AdminResources = lazy(() => import('./components/Admin/AdminResources'));
const ExamPreparation = lazy(() => import('./components/Admin/ExamPreparation'));
const MeetingList = lazy(() => import('./components/Meeting/MeetingList'));
const MeetingPage = lazy(() => import('./components/Meeting/MeetingRoom'));
const MeetingAttendance = lazy(() => import('./components/Meeting/MeetingAttendance'));
const MeetingJoinLink = lazy(() => import('./components/Meeting/MeetingJoinLink'));
const ForcePasswordChange = lazy(() => import('./components/Auth/ForcePasswordChange'));
const MonitoringPage = lazy(() => import('./components/Admin/Monitoring/MonitoringPage'));
const CandidateDashboard = lazy(() => import('./components/Candidate/CandidateDashboard'));
const CandidateResults = lazy(() => import('./components/Candidate/CandidateResults'));

/** /app → the signed-in user's own home page. */
function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={homeFor(user?.role)} replace />;
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: BRAND_CONFIG.colors.primary,
          borderRadius: 6,
          // Bump the popup base z-index so Select/DatePicker/Dropdown popups
          // ALWAYS render on top of antd Modals (modal default z-index is 1000).
          zIndexPopupBase: 2000,
        },
      }}
      // Mount all popups (Select dropdown, DatePicker, TimePicker, Cascader, etc.)
      // at document.body so they're never trapped inside a parent stacking context
      // (e.g. a Modal body whose 'transform' or 'overflow' creates a new context).
      getPopupContainer={() => document.body}
    >
      <AntApp>
        <AuthProvider>
            <Router>
            <Suspense fallback={<div className="app-route-loading" role="status" aria-label="Loading" />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage lang="en" />} />
              <Route path="/fr" element={<LandingPage lang="fr" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/force-change-password" element={<ProtectedRoute><ForcePasswordChange /></ProtectedRoute>} />

              {/* Convenience redirects for legacy/root-level paths */}
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/teacher-dashboard" element={<Navigate to="/app/teacher-dashboard" replace />} />
              <Route path="/student-dashboard" element={<Navigate to="/app/student-dashboard" replace />} />
              <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
              {/* Admin convenience redirects */}
              <Route path="/batches/:batchId/insights" element={<Navigate to="/app/batches/:batchId/insights" replace />} />

              {/* Student convenience redirects */}
              <Route path="/my-quizzes" element={<Navigate to="/app/my-quizzes" replace />} />
              <Route path="/my-results" element={<Navigate to="/app/my-results" replace />} />
              <Route path="/my-marksheet" element={<Navigate to="/app/my-marksheet" replace />} />
              <Route path="/my-resources" element={<Navigate to="/app/my-resources" replace />} />
              <Route path="/my-schedule" element={<Navigate to="/app/my-schedule" replace />} />
              <Route path="/student-quizzes" element={<Navigate to="/app/student-quizzes" replace />} />
              <Route path="/student-resources" element={<Navigate to="/app/student-resources" replace />} />
              <Route path="/student-schedule" element={<Navigate to="/app/student-schedule" replace />} />

              {/* Teacher convenience redirects */}
              <Route path="/teacher-batches" element={<Navigate to="/app/teacher-batches" replace />} />
              <Route path="/quiz-management" element={<Navigate to="/app/quiz-management" replace />} />
              <Route path="/resources" element={<Navigate to="/app/resources" replace />} />
              <Route path="/schedules" element={<Navigate to="/app/schedules" replace />} />

              {/* Protected Routes */}
              <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                {/* Default redirect based on role */}
                <Route index element={<RoleHome />} />
                
                {/* Common Routes */}
                <Route path="profile" element={<Profile />} />
                
                {/* Admin Routes */}
                <Route path="dashboard" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="users" element={
                  <ProtectedRoute requiredRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                } />
                <Route path="batches" element={
                  <ProtectedRoute requiredRole="admin">
                    <BatchManagement />
                  </ProtectedRoute>
                } />
                <Route path="demo-requests" element={
                  <ProtectedRoute requiredRole="admin">
                    <DemoRequests />
                  </ProtectedRoute>
                } />
                <Route path="timetable" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminTimetable />
                  </ProtectedRoute>
                } />
                <Route path="attendance" element={
                  <ProtectedRoute requiredRole="admin">
                    <AttendanceManagement />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                <Route path="admin-resources" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminResources />
                  </ProtectedRoute>
                } />
                <Route path="exam-preparation" element={
                  <ProtectedRoute requiredRole="admin">
                    <ExamPreparation />
                  </ProtectedRoute>
                } />
                <Route path="batches/:batchId/insights" element={
                  <ProtectedRoute requiredRole="admin">
                    <BatchInsightsAdmin />
                  </ProtectedRoute>
                } />

                {/* Teacher Routes */}
                <Route path="teacher-dashboard" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                } />
                <Route path="teacher-batches" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherBatches />
                  </ProtectedRoute>
                } />
                <Route path="assign-demo" element={
                  <ProtectedRoute requiredRole="teacher">
                    <AssignDemo />
                  </ProtectedRoute>
                } />
                <Route path="quiz-management" element={
                  <ProtectedRoute requiredRole="teacher">
                    <QuizManagement />
                  </ProtectedRoute>
                } />
                <Route path="resources" element={
                  <ProtectedRoute requiredRole="teacher">
                    <ResourceManagement />
                  </ProtectedRoute>
                } />
                <Route path="schedules" element={
                  <ProtectedRoute requiredRole="teacher">
                    <ScheduleManagement />
                  </ProtectedRoute>
                } />
                <Route path="teacher-exam-prep" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherExamPrep />
                  </ProtectedRoute>
                } />

                {/* Student Routes */}
                <Route path="student-dashboard" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="student-quizzes" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentQuizzes />
                  </ProtectedRoute>
                } />
                <Route path="my-quizzes" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentQuizzes />
                  </ProtectedRoute>
                } />
                <Route path="student-resources" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentResources />
                  </ProtectedRoute>
                } />
                <Route path="student-schedule" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentSchedule />
                  </ProtectedRoute>
                } />
                <Route path="student-quiz-results" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentQuizResults />
                  </ProtectedRoute>
                } />
                <Route path="my-results" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentQuizResults />
                  </ProtectedRoute>
                } />
                <Route path="student-marksheet" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentMarksheet />
                  </ProtectedRoute>
                } />
                <Route path="my-marksheet" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentMarksheet />
                  </ProtectedRoute>
                } />
                <Route path="my-resources" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentResources />
                  </ProtectedRoute>
                } />
                <Route path="my-schedule" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentSchedule />
                  </ProtectedRoute>
                } />
                <Route path="my-exams" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentExamPreparation />
                  </ProtectedRoute>
                } />

                {/* Website monitoring (administrators holding the monitoring key) */}
                <Route path="monitoring" element={
                  <ProtectedRoute requiredRole="admin">
                    <MonitoringPage />
                  </ProtectedRoute>
                } />

                {/* Exam candidate routes (exam preparation only) */}
                <Route path="exam-home" element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateDashboard />
                  </ProtectedRoute>
                } />
                <Route path="exam-practice" element={
                  <ProtectedRoute requiredRole="candidate">
                    <StudentExamPreparation />
                  </ProtectedRoute>
                } />
                <Route path="exam-results" element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateResults />
                  </ProtectedRoute>
                } />

                {/* Meeting Routes (every class-based role; exam candidates have no live classes) */}
                <Route path="meetings" element={<ProtectedRoute requiredRole={CLASS_ROLES}><MeetingList /></ProtectedRoute>} />
                <Route path="meeting/:id" element={<ProtectedRoute requiredRole={CLASS_ROLES}><MeetingPage /></ProtectedRoute>} />
                <Route path="meeting-join/:roomName" element={<ProtectedRoute requiredRole={CLASS_ROLES}><MeetingJoinLink /></ProtectedRoute>} />
                <Route path="meeting-attendance" element={<ProtectedRoute requiredRole={CLASS_ROLES}><MeetingAttendance /></ProtectedRoute>} />
              </Route>
            </Routes>
            </Suspense>
            </Router>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;