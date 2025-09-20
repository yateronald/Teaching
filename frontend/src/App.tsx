import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import UserManagement from './components/Admin/UserManagement';
import BatchManagement from './components/Admin/BatchManagement';
import TeacherBatches from './components/Teacher/TeacherBatches';
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
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/force-change-password" element={<ProtectedRoute><ForcePasswordChange /></ProtectedRoute>} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Default redirect based on role */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
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
              <Route path="batches/:batchId/insights" element={
                <ProtectedRoute requiredRole="admin">
                  <BatchInsightsAdmin />
                </ProtectedRoute>
              } />
              <Route path="timetable" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminTimetable />
                </ProtectedRoute>
              } />

              {/* Teacher Routes */}
              <Route path="teacher-dashboard" element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } />
              <Route path="my-batches" element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherBatches />
                </ProtectedRoute>
              } />
              <Route path="quizzes" element={
                <ProtectedRoute requiredRole="teacher">
                  <QuizManagement />
                </ProtectedRoute>
              } />
              <Route path="resources" element={
                <ProtectedRoute requiredRole="teacher">
                  <ResourceManagement />
                </ProtectedRoute>
              } />
              <Route path="schedule" element={
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
              <Route path="my-quizzes" element={
                <ProtectedRoute requiredRole="student">
                  <StudentQuizzes />
                </ProtectedRoute>
              } />
              <Route path="my-results" element={
                <ProtectedRoute requiredRole="student">
                  <StudentQuizResults />
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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
