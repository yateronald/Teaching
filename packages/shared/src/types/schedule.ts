export interface Schedule {
  id: number;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  batchId: number;
  teacherId: number | null;
  locationMode: string;
  location: string | null;
  link: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassSession {
  id: number;
  scheduleId: number;
  batchId: number;
  teacherId: number;
  sessionDate: Date;
  startTime: Date;
  endTime: Date;
  accessCode: string | null;
  codeGeneratedAt: Date | null;
  codeExpiresAt: Date | null;
  sessionStartedAt: Date | null;
  sessionEndedAt: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
