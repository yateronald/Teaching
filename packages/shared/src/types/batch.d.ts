export interface Batch {
    id: number;
    name: string;
    teacherId: number;
    frenchLevel: string;
    startDate: Date;
    endDate: Date;
    locationMode: string;
    timezone: string;
    location: string | null;
    meetingLink: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface BatchStudent {
    id: number;
    batchId: number;
    studentId: number;
    enrolledAt: Date;
}
export interface BatchTimetable {
    id: number;
    batchId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
    locationMode: string;
    location: string | null;
    link: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=batch.d.ts.map