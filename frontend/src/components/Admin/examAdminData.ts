/**
 * Shared data for the Exam Preparation admin modals (assign content, AI credits).
 * Students and batches are cached for a few minutes so re-opening a modal is instant;
 * callers can force a refresh.
 */

export type ApiCall = (endpoint: string, options?: RequestInit) => Promise<Response>;

export interface PersonLite { id: number; first_name: string; last_name: string; email: string; }
export interface BatchLite { id: number; name: string; student_count?: number | string; }

export interface ExamAssignmentGroup {
    group_id: string;
    group_name: string;
    assigned_at: string;
    expires_at: string | null;
    is_expired: boolean;
    assigned_by: string | null;
    recipients: { key: string; type: 'student' | 'batch'; name: string }[];
    items: { id: number; content_type: string; content_id: number; content_name: string }[];
}

export type Family = 'ce' | 'co' | 'ee' | 'eo' | 'other';

const CATEGORY_FAMILY: Record<string, Family> = {
    'Compréhension Écrite': 'ce',
    'Compréhension Orale': 'co',
    'Expression Écrite': 'ee',
    'Expression Orale': 'eo',
};
export const familyOfCategory = (name?: string | null): Family => CATEGORY_FAMILY[name || ''] || 'other';
export const familyOfType = (type: string): Family => {
    const p = type.slice(0, 2);
    return p === 'ce' || p === 'co' || p === 'ee' || p === 'eo' ? p : 'other';
};
export const FAMILY_CODE: Record<Family, string> = { ce: 'CE', co: 'CO', ee: 'EE', eo: 'EO', other: 'TCF' };

export const listOf = <T,>(d: unknown, key: string): T[] =>
    (Array.isArray(d) ? d : Array.isArray((d as Record<string, unknown>)?.[key]) ? (d as Record<string, T[]>)[key] : []);

export const personName = (p: { first_name?: string; last_name?: string; email?: string }) =>
    `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email || 'Student';

const TTL = 5 * 60_000;
/** Everyone exam content can be assigned to: students, exam candidates and batches. */
type People = { at: number; students: PersonLite[]; candidates: PersonLite[]; batches: BatchLite[] };
let people: People | null = null;
let peopleReq: Promise<People> | null = null;

export const peekPeople = () => people;

export function loadPeople(apiCall: ApiCall, force = false): Promise<People> {
    if (!force && people && Date.now() - people.at < TTL) return Promise.resolve(people);
    if (peopleReq) return peopleReq;
    peopleReq = (async () => {
        const [s, c, b] = await Promise.all([apiCall('/users?role=student'), apiCall('/users?role=candidate'), apiCall('/batches')]);
        const students = s.ok ? listOf<PersonLite>(await s.json(), 'users') : people?.students || [];
        const candidates = c.ok ? listOf<PersonLite & { is_active?: boolean }>(await c.json(), 'users').filter(p => p.is_active !== false) : people?.candidates || [];
        const batches = b.ok ? listOf<BatchLite>(await b.json(), 'batches') : people?.batches || [];
        students.sort((x, y) => personName(x).localeCompare(personName(y)));
        candidates.sort((x, y) => personName(x).localeCompare(personName(y)));
        batches.sort((x, y) => x.name.localeCompare(y.name));
        people = { at: Date.now(), students, candidates, batches };
        return people;
    })().finally(() => { peopleReq = null; });
    return peopleReq;
}
