export interface Attendance {
  id: number;
  sessionId: number;
  studentId: number;
  status: string;
  checkInTime: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
