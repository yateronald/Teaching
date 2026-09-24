/* ══════════════════════════════════════════
   QUIZ WORKSPACE MODEL — shared by the quiz list, builder, preview and results.
   Everything that turns API rows into screen state (and back) lives here, so the
   components only render.
══════════════════════════════════════════ */
import { GRADE_BANDS, PASS_MARK, bandFor, gradeFromPercent } from '../../utils/grading';
import { isoToWall, wallToIso } from '../../utils/zonedTime';

export { PASS_MARK, gradeFromPercent };

export type QuestionType = 'mcq_single' | 'mcq_multiple' | 'yes_no';
export type LiveState = 'draft' | 'scheduled' | 'live' | 'ended';

export const TYPE_META: Record<QuestionType, { label: string; short: string; hint: string }> = {
    mcq_single: { label: 'Single choice', short: 'Single', hint: 'Mark the one correct answer.' },
    mcq_multiple: { label: 'Multiple choice', short: 'Multiple', hint: 'Mark every correct answer. Wrong picks cost points, so partial knowledge earns partial credit.' },
    yes_no: { label: 'Yes / No', short: 'Yes / No', hint: 'Students answer Yes or No.' },
};

export const STATE_META: Record<LiveState, { label: string }> = {
    draft: { label: 'Draft' },
    scheduled: { label: 'Scheduled' },
    live: { label: 'Live' },
    ended: { label: 'Ended' },
};

const num = (v: unknown): number | null => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
let seq = 0;
export const uid = (prefix = 'k') => `${prefix}_${Date.now().toString(36)}_${(seq++).toString(36)}`;

/* ─────────────── Formatting ─────────────── */
export const fmtNumber = (v: number | null | undefined) => {
    if (v === null || v === undefined || !Number.isFinite(v)) return '—';
    return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(1)));
};
export const fmtPct = (v: number | null | undefined) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : `${Math.round(v)}%`);
export const fmtMinutes = (m: number | null | undefined) => {
    if (m === null || m === undefined || !Number.isFinite(m)) return '—';
    if (m < 1) return '< 1 min';
    if (m < 60) return `${Math.round(m)} min`;
    const h = Math.floor(m / 60);
    const rest = Math.round(m % 60);
    return rest ? `${h} h ${rest} min` : `${h} h`;
};
/** "3d 4h", "5h 12m", "18m", "< 1m" */
export const fmtSpan = (seconds: number) => {
    const s = Math.max(0, Math.round(seconds));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d >= 1) return h ? `${d}d ${h}h` : `${d}d`;
    if (h >= 1) return m ? `${h}h ${m}m` : `${h}h`;
    return m >= 1 ? `${m}m` : '< 1m';
};
export const toneOfScore = (p: number | null | undefined) => {
    if (p === null || p === undefined || !Number.isFinite(p)) return 'is-none';
    if (p >= 70) return 'is-good';
    if (p >= PASS_MARK) return 'is-warn';
    return 'is-bad';
};
export const initials = (name: string) => {
    const parts = (name || '?').trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ─────────────── Time zones ───────────────
   The schedule picker works in wall-clock strings ("2026-09-16T14:30") that mean
   "this time in the teacher's profile zone" — the same zone every other screen shows. */
export { wallToIso, isoToWall };
export const makeWhen = (tz: string) => {
    const withYear = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    const sameYear = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    const dayOnly = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' });
    const year = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric' });
    const now = new Date();
    const parse = (iso?: string | null) => { if (!iso) return null; const d = new Date(iso); return Number.isNaN(d.getTime()) ? null : d; };
    return {
        /** "Sep 16, 2:30 PM" (year added when it isn't this year) */
        at: (iso?: string | null) => { const d = parse(iso); if (!d) return '—'; return (year.format(d) === year.format(now) ? sameYear : withYear).format(d); },
        day: (iso?: string | null) => { const d = parse(iso); return d ? dayOnly.format(d) : '—'; },
    };
};

/* ─────────────── Quiz list ─────────────── */
export interface QuizRow {
    id: number;
    title: string;
    description: string | null;
    status: 'draft' | 'published';
    start_date: string | null;
    end_date: string | null;
    duration_minutes: number;
    total_marks: number | null;
    created_at: string;
    updated_at: string | null;
    schedule_state: 'inactive' | 'scheduled' | 'active' | 'ended';
    seconds_until_start: number | null;
    seconds_until_end: number | null;
    batches: string[];
    total_questions: number;
    submitted_students: number;
    total_students: number;
    in_progress_students: number;
    avg_score: number | null;
    /** Over (deadline passed once published, or already answered): no more editing. */
    locked: boolean;
}

export const normalizeQuizRow = (q: any): QuizRow => ({
    id: Number(q.id),
    title: q.title || 'Untitled quiz',
    description: q.description ?? null,
    status: q.status === 'published' ? 'published' : 'draft',
    start_date: q.start_date ?? null,
    end_date: q.end_date ?? null,
    duration_minutes: num(q.duration_minutes) ?? 0,
    total_marks: num(q.total_marks),
    created_at: q.created_at,
    updated_at: q.updated_at ?? null,
    schedule_state: q.schedule_state || 'inactive',
    seconds_until_start: num(q.seconds_until_start),
    seconds_until_end: num(q.seconds_until_end),
    batches: String(q.batch_names || '').split(',').map((s: string) => s.trim()).filter(Boolean).sort((a: string, b: string) => a.localeCompare(b)),
    total_questions: num(q.total_questions) ?? 0,
    submitted_students: num(q.submitted_students) ?? 0,
    total_students: num(q.total_students) ?? 0,
    in_progress_students: num(q.in_progress_students) ?? 0,
    avg_score: num(q.avg_score),
    locked: q.is_locked === true || q.is_locked === 't',
});

/** An ended quiz cannot be edited: its questions are what the students were graded on. */
export const isEditLocked = (q: QuizRow, state: LiveState): boolean => q.locked || state === 'ended';

/** State right now, from the server's clock offsets plus the seconds elapsed since they were fetched. */
export const liveStateOf = (q: QuizRow, elapsedSec: number): { state: LiveState; startsIn: number | null; endsIn: number | null } => {
    if (q.status !== 'published') return { state: 'draft', startsIn: null, endsIn: null };
    const startsIn = q.seconds_until_start === null ? null : q.seconds_until_start - elapsedSec;
    const endsIn = q.seconds_until_end === null ? null : q.seconds_until_end - elapsedSec;
    if (q.schedule_state === 'ended' || (endsIn !== null && endsIn <= 0)) return { state: 'ended', startsIn: null, endsIn: 0 };
    if (startsIn !== null && startsIn > 0) return { state: 'scheduled', startsIn, endsIn };
    return { state: 'live', startsIn: null, endsIn };
};

/* ─────────────── Builder ─────────────── */
export interface DraftOption { key: string; id?: number; text: string; correct: boolean }
export interface DraftQuestion {
    key: string;
    id?: number;
    text: string;
    type: QuestionType;
    points: number;
    options: DraftOption[];
    answer: 'yes' | 'no' | null;
    explanation: string;
}
export interface DraftClip {
    key: string;
    id?: number;
    transcript: string;
    voiceName: string;
    sourceType: 'tts' | 'upload';
    kdriveFileId?: string;
    fileName?: string;
    durationSeconds?: number;
    maxPlays: number;
}
export type Block =
    | { kind: 'question'; key: string; question: DraftQuestion }
    | { kind: 'listening'; key: string; clip: DraftClip; questions: DraftQuestion[] };

export interface DraftQuiz {
    title: string;
    description: string;
    instructions: string;
    batchIds: number[];
    duration: number;
    /** Wall-clock strings in the teacher's zone, or null for "available as soon as it's published". */
    start: string | null;
    end: string | null;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    blocks: Block[];
}

export const emptyOption = (): DraftOption => ({ key: uid('o'), text: '', correct: false });
export const newQuestion = (type: QuestionType = 'mcq_single', points = 1): DraftQuestion => ({
    key: uid('q'),
    text: '',
    type,
    points,
    options: type === 'yes_no' ? [] : [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
    answer: null,
    explanation: '',
});
export const emptyDraft = (): DraftQuiz => ({
    title: '', description: '', instructions: '', batchIds: [], duration: 30,
    start: null, end: null, shuffleQuestions: false, shuffleOptions: false, blocks: [],
});

/** Changing the type keeps what still makes sense: text, points, and the options for MCQ ↔ MCQ. */
export const retype = (q: DraftQuestion, type: QuestionType): DraftQuestion => {
    if (q.type === type) return q;
    if (type === 'yes_no') return { ...q, type, answer: q.answer };
    let options = q.options.length ? q.options : [emptyOption(), emptyOption(), emptyOption(), emptyOption()];
    if (type === 'mcq_single') {
        let seen = false;
        options = options.map(o => { const keep = o.correct && !seen; if (o.correct) seen = true; return { ...o, correct: keep }; });
    }
    return { ...q, type, options };
};

export const questionFromApi = (raw: any): DraftQuestion => {
    const rawType = String(raw.question_type || 'mcq_single');
    const type: QuestionType = rawType === 'yes_no' || rawType === 'boolean' ? 'yes_no' : rawType === 'mcq_multiple' ? 'mcq_multiple' : 'mcq_single';
    const ca = raw.correct_answer;
    const answer = type === 'yes_no' ? (ca === 'yes' || ca === 'true' ? 'yes' : ca === 'no' || ca === 'false' ? 'no' : null) : null;
    return {
        key: uid('q'),
        id: num(raw.id) ?? undefined,
        text: raw.question_text || '',
        type,
        points: num(raw.marks ?? raw.points) ?? 1,
        options: type === 'yes_no' ? [] : (Array.isArray(raw.options) ? raw.options : []).map((o: any) => ({
            key: uid('o'),
            id: num(o.id) ?? undefined,
            text: o.option_text || '',
            correct: o.is_correct === true || o.is_correct === 1 || o.is_correct === 't',
        })),
        answer,
        explanation: raw.explanation || '',
    };
};

/** Generated questions (AI) arrive in the API's question shape without ids. */
export const questionFromGenerated = (raw: any): DraftQuestion => {
    const q = questionFromApi({ ...raw, id: undefined, options: (raw.options || []).map((o: any) => ({ ...o, id: undefined })) });
    return { ...q, id: undefined };
};

export const clipFromApi = (c: any): DraftClip => ({
    key: uid('c'),
    id: num(c.id) ?? undefined,
    transcript: c.transcript || '',
    voiceName: c.voice_name || 'Kore',
    sourceType: c.source_type === 'upload' ? 'upload' : 'tts',
    kdriveFileId: c.kdrive_file_id ? String(c.kdrive_file_id) : undefined,
    fileName: c.file_name || undefined,
    durationSeconds: num(c.duration_seconds) ?? undefined,
    maxPlays: num(c.max_plays) ?? 0,
});

/** Listening questions are grouped under their clip, at the position of the clip's first question. */
export const draftFromApi = (q: any, tz: string): DraftQuiz => {
    const clips = new Map<number, DraftClip>((q.audio_clips || []).map((c: any) => [Number(c.id), clipFromApi(c)]));
    const groups = new Map<number, Extract<Block, { kind: 'listening' }>>();
    const blocks: Block[] = [];
    [...(q.questions || [])]
        .sort((a: any, b: any) => (num(a.question_order) ?? 0) - (num(b.question_order) ?? 0))
        .forEach((raw: any) => {
            const question = questionFromApi(raw);
            const clipId = num(raw.audio_clip_id);
            if (clipId && clips.has(clipId)) {
                let group = groups.get(clipId);
                if (!group) {
                    group = { kind: 'listening', key: uid('b'), clip: clips.get(clipId)!, questions: [] };
                    groups.set(clipId, group);
                    blocks.push(group);
                }
                group.questions.push(question);
            } else {
                blocks.push({ kind: 'question', key: question.key, question });
            }
        });
    // A clip whose questions were all removed still exists; show it so the teacher can finish or delete it.
    clips.forEach((clip, id) => { if (!groups.has(id)) blocks.push({ kind: 'listening', key: uid('b'), clip, questions: [] }); });

    return {
        title: q.title || '',
        description: q.description || '',
        instructions: q.instructions || '',
        batchIds: (Array.isArray(q.batches) ? q.batches.map((b: any) => Number(b.id)) : Array.isArray(q.batch_ids) ? q.batch_ids.map(Number) : []).filter(Boolean),
        duration: num(q.duration_minutes) ?? 30,
        start: isoToWall(q.start_date, tz),
        end: isoToWall(q.end_date, tz),
        shuffleQuestions: !!q.randomize_questions,
        shuffleOptions: !!q.randomize_options,
        blocks,
    };
};

/** A copy starts as a fresh draft: no ids anywhere, no schedule, same content and audio files. */
export const duplicateDraft = (d: DraftQuiz): DraftQuiz => {
    const strip = (q: DraftQuestion): DraftQuestion => ({ ...q, key: uid('q'), id: undefined, options: q.options.map(o => ({ ...o, key: uid('o'), id: undefined })) });
    return {
        ...d,
        title: d.title ? `${d.title} (copy)` : '',
        start: null,
        end: null,
        blocks: d.blocks.map(b => b.kind === 'question'
            ? (() => { const question = strip(b.question); return { kind: 'question' as const, key: question.key, question }; })()
            : { kind: 'listening' as const, key: uid('b'), clip: { ...b.clip, key: uid('c'), id: undefined }, questions: b.questions.map(strip) }),
    };
};

export const allQuestions = (blocks: Block[]) => blocks.flatMap(b => (b.kind === 'question' ? [b.question] : b.questions));
export const totalPoints = (blocks: Block[]) => allQuestions(blocks).reduce((s, q) => s + (Number(q.points) || 0), 0);

const questionPayload = (q: DraftQuestion) => ({
    id: q.id,
    question_text: q.text.trim(),
    question_type: q.type,
    marks: Number(q.points) || 0,
    correct_answer: q.type === 'yes_no' ? q.answer : null,
    explanation: q.explanation.trim(),
    options: q.type === 'yes_no' ? [] : q.options
        .filter(o => o.text.trim())
        .map(o => ({ id: o.id, option_text: o.text.trim(), is_correct: o.correct })),
});

export const toPayload = (d: DraftQuiz, tz: string, status: 'draft' | 'published') => {
    const questions: any[] = [];
    const audio_clips: any[] = [];
    d.blocks.forEach(b => {
        if (b.kind === 'question') { questions.push(questionPayload(b.question)); return; }
        audio_clips.push({
            id: b.clip.id, tempId: b.clip.key, transcript: b.clip.transcript, voiceName: b.clip.voiceName, sourceType: b.clip.sourceType,
            kdriveFileId: b.clip.kdriveFileId, fileName: b.clip.fileName, durationSeconds: b.clip.durationSeconds, maxPlays: b.clip.maxPlays,
        });
        b.questions.forEach(q => questions.push({ ...questionPayload(q), audio_clip_temp_id: b.clip.key }));
    });
    const payload: Record<string, unknown> = {
        title: d.title.trim(),
        description: d.description.trim(),
        instructions: d.instructions.trim(),
        batch_ids: d.batchIds,
        duration_minutes: d.duration,
        randomize_questions: d.shuffleQuestions,
        randomize_options: d.shuffleOptions,
        status,
        total_marks: questions.reduce((s, q) => s + q.marks, 0),
        questions,
        audio_clips,
    };
    // The API validates dates when the keys are present, so an unscheduled quiz simply omits them.
    const start = d.start ? wallToIso(d.start, tz) : null;
    const end = d.end ? wallToIso(d.end, tz) : null;
    if (start) payload.start_date = start;
    if (end) payload.end_date = end;
    return payload;
};

/* ─────────────── Validation ─────────────── */
export type IssueArea = 'title' | 'batches' | 'questions' | 'schedule' | 'duration' | 'question' | 'listening';
export interface Issue { area: IssueArea; message: string; target?: string }

export const questionIssues = (q: DraftQuestion): string[] => {
    const out: string[] = [];
    if (!q.text.trim()) out.push('Write the question.');
    if (!(Number(q.points) > 0)) out.push('Give it at least 0.5 points.');
    if (q.type === 'yes_no') {
        if (!q.answer) out.push('Choose whether the correct answer is Yes or No.');
        return out;
    }
    const filled = q.options.filter(o => o.text.trim());
    const correct = filled.filter(o => o.correct).length;
    if (filled.length < 2) out.push('Add at least two answer options.');
    if (q.options.some(o => o.correct && !o.text.trim())) out.push('An option marked correct is empty.');
    if (q.type === 'mcq_single' && filled.length >= 2 && correct !== 1) out.push(correct === 0 ? 'Mark the correct answer.' : 'Single choice allows only one correct answer.');
    if (q.type === 'mcq_multiple' && filled.length >= 2 && correct === 0) out.push('Mark at least one correct answer.');
    const texts = filled.map(o => o.text.trim().toLowerCase());
    if (new Set(texts).size !== texts.length) out.push('Two options have the same text.');
    return out;
};

export const validateDraft = (d: DraftQuiz, { publishing, isNew, now = Date.now(), tz }: { publishing: boolean; isNew: boolean; now?: number; tz: string }): Issue[] => {
    const issues: Issue[] = [];
    if (!d.title.trim()) issues.push({ area: 'title', message: 'Give the quiz a title.', target: 'qz-field-title' });
    if (!d.batchIds.length) issues.push({ area: 'batches', message: 'Choose at least one batch.', target: 'qz-field-batches' });
    if (!(d.duration >= 1 && d.duration <= 600)) issues.push({ area: 'duration', message: 'Set a time limit between 1 and 600 minutes.', target: 'qz-field-duration' });
    if (!allQuestions(d.blocks).length) issues.push({ area: 'questions', message: 'Add at least one question.', target: 'qz-questions' });

    let n = 0;
    d.blocks.forEach(b => {
        if (b.kind === 'listening') {
            if (!b.clip.kdriveFileId) issues.push({ area: 'listening', message: 'A listening section has no audio yet.', target: `qz-b-${b.key}` });
            if (!b.questions.length) issues.push({ area: 'listening', message: 'A listening section has no questions.', target: `qz-b-${b.key}` });
        }
        (b.kind === 'question' ? [b.question] : b.questions).forEach(q => {
            n += 1;
            const problems = questionIssues(q);
            if (problems.length) issues.push({ area: 'question', message: `Question ${n}: ${problems[0]}`, target: `qz-q-${q.key}` });
        });
    });

    if (d.start || d.end) {
        const s = d.start ? Date.parse(wallToIso(d.start, tz) || '') : NaN;
        const e = d.end ? Date.parse(wallToIso(d.end, tz) || '') : NaN;
        if (Number.isNaN(s) || Number.isNaN(e)) issues.push({ area: 'schedule', message: 'Set both when the quiz opens and when it closes.', target: 'qz-field-schedule' });
        else if (e <= s) issues.push({ area: 'schedule', message: 'The quiz must close after it opens.', target: 'qz-field-schedule' });
        // The API refuses a closing time in the past for new quizzes and for anything published.
        else if ((publishing || isNew) && e < now) issues.push({ area: 'schedule', message: 'The closing time is already in the past.', target: 'qz-field-schedule' });
        else if (e - s < d.duration * 60_000) issues.push({ area: 'schedule', message: 'The window is shorter than the time limit — late starters would be cut off.', target: 'qz-field-schedule' });
    }
    return issues;
};

/* ─────────────── Results ─────────────── */
export type SubmissionStatus = 'not_started' | 'in_progress' | 'submitted' | 'auto_submitted' | 'graded';
export const FINISHED: SubmissionStatus[] = ['submitted', 'auto_submitted', 'graded'];
export const isFinished = (s: string) => (FINISHED as string[]).includes(s);

export interface ResultRow {
    studentId: number;
    name: string;
    email: string;
    batches: string[];
    submissionId: number | null;
    status: SubmissionStatus;
    score: number | null;
    maxScore: number | null;
    percentage: number | null;
    startedAt: string | null;
    submittedAt: string | null;
    minutes: number | null;
}

/** /results groups students by batch; a student in two assigned batches appears once here. */
export const resultRowsFromApi = (data: any): ResultRow[] => {
    const byStudent = new Map<number, ResultRow>();
    (data?.batch_results || []).forEach((b: any) => (b.students || []).forEach((s: any) => {
        const id = Number(s.id);
        const existing = byStudent.get(id);
        if (existing) {
            if (b.batch_name && !existing.batches.includes(b.batch_name)) existing.batches.push(b.batch_name);
            return;
        }
        const status = (['not_started', 'in_progress', 'submitted', 'auto_submitted', 'graded'].includes(s.status) ? s.status : 'not_started') as SubmissionStatus;
        byStudent.set(id, {
            studentId: id,
            name: String(s.name || '').trim() || s.email || 'Student',
            email: s.email || '',
            batches: b.batch_name ? [b.batch_name] : [],
            submissionId: num(s.submission_id),
            status,
            score: num(s.score),
            maxScore: num(s.max_score),
            percentage: isFinished(status) ? num(s.percentage) : null,
            startedAt: s.started_at ?? null,
            submittedAt: s.submitted_at ?? null,
            minutes: num(s.time_taken_minutes),
        });
    }));
    return [...byStudent.values()];
};

const median = (values: number[]) => {
    if (!values.length) return null;
    const s = [...values].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export const summarize = (rows: ResultRow[]) => {
    const finished = rows.filter(r => isFinished(r.status));
    const scored = finished.filter(r => r.percentage !== null) as (ResultRow & { percentage: number })[];
    const pcts = scored.map(r => r.percentage);
    const passed = pcts.filter(p => p >= PASS_MARK).length;
    return {
        assigned: rows.length,
        finished: finished.length,
        inProgress: rows.filter(r => r.status === 'in_progress').length,
        notStarted: rows.filter(r => r.status === 'not_started').length,
        completion: rows.length ? (finished.length / rows.length) * 100 : 0,
        average: pcts.length ? pcts.reduce((a, p) => a + p, 0) / pcts.length : null,
        median: median(pcts),
        best: pcts.length ? Math.max(...pcts) : null,
        lowest: pcts.length ? Math.min(...pcts) : null,
        passRate: pcts.length ? (passed / pcts.length) * 100 : null,
        passed,
        medianMinutes: median(finished.map(r => r.minutes).filter((m): m is number => m !== null)),
        bands: GRADE_BANDS.map(b => ({ ...b, count: pcts.filter(p => bandFor(p).label === b.label).length })),
        scored,
    };
};

export const csvOf = (rows: ResultRow[], tz: string) => {
    const when = makeWhen(tz);
    const cell = (v: unknown) => {
        const s = v === null || v === undefined ? '' : String(v);
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const statusLabel: Record<SubmissionStatus, string> = { not_started: 'Not started', in_progress: 'In progress', submitted: 'Submitted', auto_submitted: 'Auto-submitted', graded: 'Submitted' };
    const head = ['Student', 'Email', 'Batches', 'Status', 'Score', 'Out of', 'Percent', 'Grade', 'Minutes', 'Submitted'];
    const body = rows.map(r => [
        r.name, r.email, r.batches.join('; '), statusLabel[r.status],
        r.percentage === null ? '' : fmtNumber(r.score), r.percentage === null ? '' : fmtNumber(r.maxScore),
        r.percentage === null ? '' : Math.round(r.percentage), r.percentage === null ? '' : gradeFromPercent(r.percentage),
        r.minutes ?? '', r.submittedAt ? when.at(r.submittedAt) : '',
    ]);
    return [head, ...body].map(line => line.map(cell).join(',')).join('\r\n');
};
