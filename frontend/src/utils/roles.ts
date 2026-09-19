/** Account roles and where each one lands after signing in. */
export type Role = 'admin' | 'teacher' | 'student' | 'candidate';

export const ROLE_HOME: Record<Role, string> = {
    admin: '/app/dashboard',
    teacher: '/app/teacher-dashboard',
    student: '/app/student-dashboard',
    // Exam candidates only prepare for the exam: their own space, nothing else.
    candidate: '/app/exam-home',
};

export const homeFor = (role?: string | null): string =>
    (role && role in ROLE_HOME ? ROLE_HOME[role as Role] : ROLE_HOME.student);

/** Pages every class-based role shares (live classes); exam candidates have none. */
export const CLASS_ROLES: Role[] = ['admin', 'teacher', 'student'];
