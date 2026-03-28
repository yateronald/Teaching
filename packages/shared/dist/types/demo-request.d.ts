import { DemoRequestStatus } from './enums';
export interface DemoRequest {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
    country: string;
    hasPreviousExperience: string;
    currentLevel: string;
    previousStudyMethod: string | null;
    interestedLevel: string;
    learningGoals: string;
    expectations: string | null;
    expectedStartTime: string;
    preferredSchedule: string;
    timezone: string | null;
    status: DemoRequestStatus;
    notes: string | null;
    assignedTeacherId: number | null;
    assignedTenantId: number | null;
    meetingLink: string | null;
    scheduledAt: Date | null;
    contactedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=demo-request.d.ts.map