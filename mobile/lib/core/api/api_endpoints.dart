/// Centralized API endpoint registry matching the Express backend.
class ApiEndpoints {
  ApiEndpoints._();

  // Production API: https://api.learnfrenchwithnatives.com/api
  static const String baseUrl = 'https://api.learnfrenchwithnatives.com/api';
  static const String webBaseUrl = 'https://api.learnfrenchwithnatives.com/api';
  static const String socketUrl = 'https://api.learnfrenchwithnatives.com';
  static const String webSocketUrl = 'https://api.learnfrenchwithnatives.com';
  static const String liveKitUrl = 'wss://livekit.learnfrenchwithnatives.com';

  // ── Auth ──
  static const String login = '/auth/login';
  static const String me = '/auth/me';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh-token';
  static const String changePassword = '/auth/change-password';

  // ── Batches ──
  static const String batches = '/batches';
  static String teacherBatches(int teacherId) => '/batches/teacher/$teacherId';
  static String batchDetails(int batchId) => '/batches/$batchId';
  static String batchInsights(int batchId) => '/batches/$batchId/insights';

  // ── Quizzes & Builder ──
  static const String quizzes = '/quizzes';
  static String teacherQuizzes(int teacherId) => '/quizzes/teacher/$teacherId';
  static String quizDetails(int quizId) => '/quizzes/$quizId';
  static String updateQuizStatus(int quizId) => '/quizzes/$quizId/status';
  static String quizResults(int quizId) => '/quizzes/$quizId/results';
  static const String aiGenerateQuiz = '/quizzes/ai-generate';
  static const String generateAudio = '/quizzes/audio/generate';
  static const String uploadAudio = '/quizzes/audio/upload';
  static String audioPreview(String fileId) => '/quizzes/audio/preview/$fileId';

  // ── Resources ──
  static const String resources = '/resources';
  static String resourceById(int id) => '/resources/$id';
  static String resourceDownload(int id) => '/resources/$id/download';
  static String resourcePreview(int id) => '/resources/$id/preview';

  // ── Schedules & Attendance ──
  static const String schedules = '/schedules';
  static String scheduleById(int id) => '/schedules/$id';
  static const String attendanceSessions = '/attendance/sessions';
  static String startSession(int id) => '/attendance/sessions/$id/start';
  static String endSession(int id) => '/attendance/sessions/$id/end';

  // ── Live Meetings ──
  static const String meetings = '/meetings';
  static String meetingById(int id) => '/meetings/$id';
  static String joinMeeting(int id) => '/meetings/$id/join';
  static String meetingToken(int id) => '/meetings/$id/token';
  static const String joinByCode = '/meetings/join-by-code';

  // ── Demo Inquiries ──
  static const String myDemos = '/demo-requests/my-demos';
  static String demoById(int id) => '/demo-requests/$id';

  // ── Users & Students ──
  static String teacherStudents(int teacherId) => '/users/students/teacher/$teacherId';
  static const String userProfile = '/users/profile';
  static const String uploadAvatar = '/users/avatar';
}
