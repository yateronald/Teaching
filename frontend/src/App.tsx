import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import LandingPage from './components/Landing/LandingPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import UserManagement from './components/Admin/UserManagement';
import BatchManagement from './components/Admin/BatchManagement';
import AttendanceManagement from './components/Admin/AttendanceManagement';
import DemoRequests from './components/Admin/DemoRequests';
import TeacherBatches from './components/Teacher/TeacherBatches';
import AssignDemo from './components/Teacher/AssignDemo';
import QuizManagement from './components/Teacher/QuizManagement';
import ResourceManagement from './components/Teacher/ResourceManagement';
import ScheduleManagement from './components/Teacher/ScheduleManagement';
import StudentQuizzes from './components/Student/StudentQuizzes';
import StudentResources from './components/Student/StudentResources';
import StudentSchedule from './components/Student/StudentSchedule';
import StudentQuizResults from './components/Student/StudentQuizResults';
import StudentMarksheet from './components/Student/StudentMarksheet';
import Profile from './components/Common/Profile';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';
import BatchInsightsAdmin from './components/Admin/BatchInsightsAdmin';
import AdminTimetable from './components/Admin/AdminTimetable';
import AdminSettings from './components/Admin/AdminSettings';
import { BRAND_CONFIG } from './utils/branding';
import ForcePasswordChange from './components/Auth/ForcePasswordChange';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: BRAND_CONFIG.colors.primary,
          borderRadius: 6,
        },
      }}
    >
      <AntApp>
        <AuthProvider>
            <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
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
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                
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
              </Route>
            </Routes>
            </Router>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;