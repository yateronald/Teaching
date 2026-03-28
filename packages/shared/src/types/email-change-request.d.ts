export interface EmailChangeRequest {
    id: number;
    userId: number;
    oldEmail: string;
    newEmail: string;
    code: string;
    attempts: number;
    maxAttempts: number;
    status: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface PasswordResetRequest {
    id: number;
    userId: number;
    email: string;
    code: string;
    attempts: number;
    maxAttempts: number;
    status: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=email-change-request.d.ts.map