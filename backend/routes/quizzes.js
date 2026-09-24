const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, teacherOrAdmin, authenticated } = require('../middleware/auth');
const { sendQuizNotification } = require('../emails/emailService');
const { getAIQuizService } = require('../services/aiQuizService');
const { getTTSService, VOICE_OPTIONS } = require('../services/ttsService');
const multer = require('multer');
const path = require('path');
const os = require('os');

// Multer config for audio uploads (temp storage)
const audioUpload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.webm'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only audio files (mp3, wav, ogg, m4a, webm) are allowed'));
    }
});

const router = express.Router();

/**
 * A quiz is locked once it is over: its deadline passed while it was
 * published, or students already submitted to it. Its questions and marks
 * are what those students were graded on, so it can no longer be edited (or
 * moved back to drafts to get around that). Duplicating it is the way to reuse it.
 */
const QUIZ_LOCKED_SQL = `(q.end_date IS NOT NULL AND q.end_date <= NOW() AND (
        q.status = 'published'
        OR EXISTS (SELECT 1 FROM quiz_submissions qs WHERE qs.quiz_id = q.id
                   AND qs.status IN ('submitted', 'auto_submitted', 'graded'))))`;
const QUIZ_LOCKED_MESSAGE = 'This quiz has ended, so it can no longer be edited. Duplicate it to reuse its questions.';
const isQuizLocked = async (db, quizId) => !!(await db.get(
    `SELECT 1 AS locked FROM quizzes q WHERE q.id = $1 AND ${QUIZ_LOCKED_SQL}`, [quizId]));

// Fisher-Yates shuffle — produces an unbiased random permutation
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Helper function to check if quiz is accessible to student
const isQuizAccessible = async (db, quizId, studentId) => {
    const quiz = await db.get(`
        SELECT q.*, qb.batch_id
        FROM quizzes q
        JOIN quiz_batches qb ON q.id = qb.quiz_id
        JOIN batch_students bs ON qb.batch_id = bs.batch_id
        WHERE q.id = ? AND bs.student_id = ? AND q.status = 'published'
    `, [quizId, studentId]);

    if (!quiz) return { accessible: false, reason: 'Quiz not found or not published' };

    const now = new Date();

    // Check start date
    if (quiz.start_date && new Date(quiz.start_date) > now) {
        return { accessible: false, reason: 'Quiz has not started yet', quiz };
    }

    // Check end date
    if (quiz.end_date && new Date(quiz.end_date) < now) {
        return { accessible: false, reason: 'Quiz has ended', quiz };
    }

    return { accessible: true, quiz };
};

// Helper function to calculate quiz results
const calculateQuizResults = async (db, submissionId) => {
    // Ensure we compute max score from ALL questions in the quiz, not only answered ones
    const submission = await db.get(
        'SELECT id, quiz_id FROM quiz_submissions WHERE id = ?',
        [submissionId]
    );
    if (!submission) {
        return { totalScore: 0, maxScore: 0, percentage: 0 };
    }

    // Total marks across all questions in this quiz
    const maxScoreRow = await db.get(
        'SELECT COALESCE(SUM(marks), 0) AS max_score FROM questions WHERE quiz_id = ?',
        [submission.quiz_id]
    );
    const maxScore = Number(maxScoreRow?.max_score) || 0;

    // Grade only the answers that exist; unanswered implicitly earn 0
    const answers = await db.all(`
        SELECT sa.*, q.marks, q.question_type, q.correct_answer
        FROM student_answers sa
        JOIN questions q ON sa.question_id = q.id
        WHERE sa.submission_id = ?
    `, [submissionId]);

    let totalScore = 0;

    for (const answer of answers) {
        let isCorrect = false;
        let marksAwarded = 0;
        const marks = Number(answer.marks) || 0;

        if (answer.question_type === 'yes_no') {
            isCorrect = answer.answer_text === answer.correct_answer;
            marksAwarded = isCorrect ? marks : 0;
        } else if (answer.question_type === 'mcq_single' || answer.question_type === 'mcq_multiple') {
            let selectedOptions = [];
            try { selectedOptions = JSON.parse(answer.selected_options || '[]') || []; } catch { }

            const correctOptions = await db.all(
                'SELECT id FROM question_options WHERE question_id = ? AND is_correct = TRUE',
                [answer.question_id]
            );
            const correctIds = correctOptions.map(opt => opt.id);

            if (answer.question_type === 'mcq_single') {
                isCorrect = selectedOptions.length === 1 && correctIds.includes(selectedOptions[0]);
                marksAwarded = isCorrect ? marks : 0;
            } else {
                // Multiple-answer MCQ grading with proportional scoring and penalty for wrong picks
                const totalCorrect = correctIds.length || 1; // avoid divide-by-zero
                const correctSelected = selectedOptions.filter(id => correctIds.includes(id)).length; // S
                const incorrectSelected = selectedOptions.filter(id => !correctIds.includes(id)).length; // W

                const positive = (correctSelected / totalCorrect) * marks; // (S/C) * marks
                const negative = (incorrectSelected / totalCorrect) * marks; // (W/C) * marks
                const rawScore = positive - negative;

                // Clamp to [0, full marks]
                marksAwarded = Math.max(0, Math.min(marks, rawScore));
                isCorrect = correctSelected === totalCorrect && incorrectSelected === 0;
            }
        }

        // Full correctness always means the question's full current value.
        if (isCorrect) marksAwarded = marks;

        await db.run(
            'UPDATE student_answers SET marks_awarded = ?, is_correct = ? WHERE id = ?',
            [marksAwarded, isCorrect, answer.id]
        );

        totalScore += marksAwarded;
    }

    const percentageRaw = maxScore > 0 ? (Number(totalScore) / Number(maxScore)) * 100 : 0;
    const percentage = Math.min(100, Math.max(0, Number.isFinite(percentageRaw) ? Number(percentageRaw.toFixed(2)) : 0));

    await db.run(
        "UPDATE quiz_submissions SET total_score = ?, max_score = ?, percentage = ?, status = 'graded' WHERE id = ?",
        [Number(totalScore) || 0, Number(maxScore) || 0, percentage, submissionId]
    );

    return { totalScore, maxScore, percentage };
};

// Background evaluator to flush and auto-submit expired submissions
const autoSubmitExpiredSubmissions = async (db) => {
    try {
        const inProgress = await db.all(`
            SELECT qs.id, qs.started_at, qs.auto_saved_data, q.duration_minutes, q.end_date, q.id as quiz_id
            FROM quiz_submissions qs
            JOIN quizzes q ON qs.quiz_id = q.id
            WHERE qs.status = 'in_progress'
        `);

        if (inProgress.length === 0) return;

        const nowMs = Date.now();
        for (const sub of inProgress) {
            const startMs = new Date(sub.started_at).getTime();
            const nominalEndMs = startMs + (Number(sub.duration_minutes || 0) * 60 * 1000);
            const hardEndMs = sub.end_date ? Math.min(nominalEndMs, new Date(sub.end_date).getTime()) : nominalEndMs;
            
            // Allow 5 seconds grace period
            if (nowMs >= hardEndMs + 5000) {
                let answers = [];
                try { answers = sub.auto_saved_data ? JSON.parse(sub.auto_saved_data) : []; } catch { answers = []; }

                const validQuestions = await db.all('SELECT id FROM questions WHERE quiz_id = ?', [sub.quiz_id]);
                const validQuestionIds = new Set(validQuestions.map(q => q.id));
                const validAnswers = answers.filter(answer => answer.question_id && validQuestionIds.has(answer.question_id));

                for (const answer of validAnswers) {
                    await db.run(`
                        INSERT INTO student_answers (submission_id, question_id, answer_text, selected_options)
                        VALUES (?, ?, ?, ?)
                        ON CONFLICT (submission_id, question_id)
                        DO UPDATE SET
                          answer_text = EXCLUDED.answer_text,
                          selected_options = EXCLUDED.selected_options,
                          updated_at = CURRENT_TIMESTAMP
                    `, [
                        sub.id,
                        answer.question_id,
                        answer.answer_text || null,
                        answer.selected_options ? JSON.stringify(answer.selected_options) : null
                    ]);
                }

                const timeTakenMin = Math.max(0, Math.floor((hardEndMs - startMs) / (1000 * 60)));

                await db.run(
                    "UPDATE quiz_submissions SET status = 'auto_submitted', submitted_at = CURRENT_TIMESTAMP, time_taken_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [timeTakenMin, sub.id]
                );

                await calculateQuizResults(db, sub.id);
            }
        }
    } catch (err) {
        console.error('Background auto-submit error:', err);
    }
};

// ════════════════════════════════════════════════════════════════════
// Quiz content writer — shared by create and update.
// Rows that carry a known id are UPDATED IN PLACE. They used to be deleted and re-inserted on
// every save, but student_answers.question_id is ON DELETE CASCADE: re-creating a question
// silently erased every answer students had given to it. Each step is a single statement, so a
// 25-question quiz saves in about a dozen round trips instead of ~125.
// ════════════════════════════════════════════════════════════════════
// A published grade is still a finished submission. Keeping it in the same set is
// important when a teacher changes a question's points or answer key after grading:
// the stored per-answer score must be recomputed along with the question's new value.
const FINISHED_STATUSES = ['submitted', 'auto_submitted', 'graded', 'published'];
const isMcqType = (type) => type === 'mcq' || type === 'mcq_single' || type === 'mcq_multiple';
const groupRows = (rows, key) => {
    const map = new Map();
    for (const row of rows) {
        const k = Number(row[key]);
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(row);
    }
    return map;
};

async function syncQuizContent(db, quizId, questions, audioClips, { fresh = false } = {}) {
    const knownQuestionIds = new Set();
    const optionOwner = new Map();
    const knownClipIds = new Set();
    if (!fresh) {
        (await db.all('SELECT id FROM questions WHERE quiz_id = $1', [quizId])).forEach(r => knownQuestionIds.add(Number(r.id)));
        if (knownQuestionIds.size) {
            (await db.all('SELECT id, question_id FROM question_options WHERE question_id = ANY($1::int[])', [[...knownQuestionIds]]))
                .forEach(o => optionOwner.set(Number(o.id), Number(o.question_id)));
        }
        (await db.all('SELECT id FROM quiz_audio_clips WHERE quiz_id = $1', [quizId])).forEach(r => knownClipIds.add(Number(r.id)));
    }

    // ── Audio clips: a quiz has a handful at most, one statement each ──
    const clipIdFor = {};
    let liveClipIds = knownClipIds;
    if (Array.isArray(audioClips)) {
        liveClipIds = new Set();
        for (let a = 0; a < audioClips.length; a++) {
            const clip = audioClips[a] || {};
            const values = [
                clip.transcript || '', clip.voiceName || 'Kore', clip.sourceType || 'tts', clip.kdriveFileId || null,
                clip.fileName || null, clip.durationSeconds || null, a + 1, clip.maxPlays || 0,
            ];
            const dbId = Number(clip.id);
            let clipId;
            if (dbId && knownClipIds.has(dbId) && !liveClipIds.has(dbId)) {
                await db.run(
                    `UPDATE quiz_audio_clips
                     SET transcript = $1, voice_name = $2, source_type = $3, kdrive_file_id = $4,
                         file_name = $5, duration_seconds = $6, audio_order = $7, max_plays = $8
                     WHERE id = $9`,
                    [...values, dbId]
                );
                clipId = dbId;
            } else {
                const created = await db.run(
                    `INSERT INTO quiz_audio_clips (transcript, voice_name, source_type, kdrive_file_id, file_name, duration_seconds, audio_order, max_plays, quiz_id)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
                    [...values, quizId]
                );
                clipId = Number(created.rows[0].id);
            }
            liveClipIds.add(clipId);
            if (clip.tempId) clipIdFor[clip.tempId] = clipId;
            clipIdFor[`idx_${a}`] = clipId;
        }
        const stale = [...knownClipIds].filter(x => !liveClipIds.has(x));
        if (stale.length) await db.run('DELETE FROM quiz_audio_clips WHERE id = ANY($1::int[])', [stale]);
    }
    const clipOf = (q) => {
        if (q.audio_clip_temp_id && clipIdFor[q.audio_clip_temp_id]) return clipIdFor[q.audio_clip_temp_id];
        if (q.audio_clip_index !== undefined && q.audio_clip_index !== null && clipIdFor[`idx_${q.audio_clip_index}`]) {
            return clipIdFor[`idx_${q.audio_clip_index}`];
        }
        const direct = Number(q.audio_clip_id);
        return direct && liveClipIds.has(direct) ? direct : null;
    };

    // ── Questions ──
    const kept = [];
    const added = [];
    const claimed = new Set();
    questions.forEach((q, i) => {
        const row = {
            id: null,
            order: i + 1,
            text: String(q.question_text),
            type: q.question_type,
            marks: Number(q.marks) || 0,
            correct: typeof q.correct_answer === 'string' ? q.correct_answer : null,
            explanation: typeof q.explanation === 'string' && q.explanation.trim() ? q.explanation : null,
            setExplanation: Object.prototype.hasOwnProperty.call(q, 'explanation'),
            clip: clipOf(q),
            options: isMcqType(q.question_type) && Array.isArray(q.options) ? q.options : [],
        };
        const qid = Number(q.id);
        if (qid && knownQuestionIds.has(qid) && !claimed.has(qid)) {
            claimed.add(qid);
            row.id = qid;
            kept.push(row);
        } else {
            added.push(row);
        }
    });

    // Questions the teacher removed go, and their answers with them — that part is intended.
    if (!fresh) {
        await db.run('DELETE FROM questions WHERE quiz_id = $1 AND id <> ALL($2::int[])', [quizId, [...claimed]]);
    }
    if (kept.length) {
        await db.run(
            `UPDATE questions AS q SET
                 question_text = v.question_text, question_type = v.question_type, question_order = v.question_order,
                 marks = v.marks, correct_answer = v.correct_answer, audio_clip_id = v.audio_clip_id,
                 explanation = CASE WHEN v.set_explanation THEN v.explanation ELSE q.explanation END
             FROM unnest($1::int[], $2::text[], $3::text[], $4::int[], $5::numeric[], $6::text[], $7::text[], $8::boolean[], $9::int[])
                  AS v(id, question_text, question_type, question_order, marks, correct_answer, explanation, set_explanation, audio_clip_id)
             WHERE q.id = v.id AND q.quiz_id = $10::int`,
            [
                kept.map(r => r.id), kept.map(r => r.text), kept.map(r => r.type), kept.map(r => r.order), kept.map(r => r.marks),
                kept.map(r => r.correct), kept.map(r => r.explanation), kept.map(r => r.setExplanation), kept.map(r => r.clip), quizId,
            ]
        );
    }
    if (added.length) {
        const created = await db.run(
            `INSERT INTO questions (quiz_id, question_text, question_type, question_order, marks, correct_answer, explanation, audio_clip_id)
             SELECT $1::int, v.question_text, v.question_type, v.question_order, v.marks, v.correct_answer, v.explanation, v.audio_clip_id
             FROM unnest($2::text[], $3::text[], $4::int[], $5::numeric[], $6::text[], $7::text[], $8::int[])
                  AS v(question_text, question_type, question_order, marks, correct_answer, explanation, audio_clip_id)
             RETURNING id, question_order`,
            [
                quizId, added.map(r => r.text), added.map(r => r.type), added.map(r => r.order), added.map(r => r.marks),
                added.map(r => r.correct), added.map(r => r.explanation), added.map(r => r.clip),
            ]
        );
        const idByOrder = new Map(created.rows.map(r => [Number(r.question_order), Number(r.id)]));
        added.forEach(r => { r.id = idByOrder.get(r.order); });
    }

    // ── Options: stale ones out first, then update the kept ones, then add the new ones ──
    const every = [...kept, ...added];
    const keepOptionIds = [];
    const upd = { id: [], text: [], order: [], correct: [] };
    const ins = { question: [], text: [], order: [], correct: [] };
    for (const row of every) {
        const used = new Set();
        row.options.forEach((opt, j) => {
            const text = String(opt?.option_text ?? '');
            const correct = !!opt?.is_correct;
            const oid = Number(opt?.id);
            if (oid && optionOwner.get(oid) === row.id && !used.has(oid)) {
                used.add(oid);
                keepOptionIds.push(oid);
                upd.id.push(oid); upd.text.push(text); upd.order.push(j + 1); upd.correct.push(correct);
            } else {
                ins.question.push(row.id); ins.text.push(text); ins.order.push(j + 1); ins.correct.push(correct);
            }
        });
    }
    if (!fresh && every.length) {
        await db.run(
            'DELETE FROM question_options WHERE question_id = ANY($1::int[]) AND id <> ALL($2::int[])',
            [every.map(r => r.id), keepOptionIds]
        );
    }
    if (upd.id.length) {
        await db.run(
            `UPDATE question_options AS o SET option_text = v.option_text, option_order = v.option_order, is_correct = v.is_correct
             FROM unnest($1::int[], $2::text[], $3::int[], $4::boolean[]) AS v(id, option_text, option_order, is_correct)
             WHERE o.id = v.id`,
            [upd.id, upd.text, upd.order, upd.correct]
        );
    }
    if (ins.question.length) {
        await db.run(
            `INSERT INTO question_options (question_id, option_text, option_order, is_correct)
             SELECT * FROM unnest($1::int[], $2::text[], $3::int[], $4::boolean[])`,
            [ins.question, ins.text, ins.order, ins.correct]
        );
    }
}

// What decides a score: question types, points, the yes/no key and which options are correct.
async function loadGradingState(db, quizId) {
    const questions = await db.all('SELECT id, question_type, marks, correct_answer FROM questions WHERE quiz_id = $1', [quizId]);
    const options = questions.length
        ? await db.all('SELECT id, question_id, is_correct FROM question_options WHERE question_id = ANY($1::int[])', [questions.map(q => q.id)])
        : [];
    return { questions, options };
}

function gradingSignature({ questions, options }) {
    const all = groupRows(options, 'question_id');
    const ids = (rows, onlyCorrect) => (rows || [])
        .filter(o => !onlyCorrect || o.is_correct)
        .map(o => Number(o.id)).sort((a, b) => a - b).join(',');
    return questions
        .map(q => `${q.id}|${q.question_type}|${Number(q.marks)}|${q.correct_answer ?? ''}|${ids(all.get(Number(q.id)), true)}|${ids(all.get(Number(q.id)), false)}`)
        .sort()
        .join(';');
}

// Re-scores every finished submission after the answer key or the points changed.
// Same rules as calculateQuizResults, in a fixed number of round trips whatever the class size.
async function regradeQuiz(db, quizId, state) {
    const { questions, options } = state || await loadGradingState(db, quizId);
    const submissions = await db.all(
        'SELECT id FROM quiz_submissions WHERE quiz_id = $1 AND status = ANY($2::text[])',
        [quizId, FINISHED_STATUSES]
    );
    if (!submissions.length) return 0;

    const maxScore = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    const questionById = new Map(questions.map(q => [Number(q.id), q]));
    const correctIdsBy = new Map();
    for (const o of options) {
        if (!o.is_correct) continue;
        const k = Number(o.question_id);
        if (!correctIdsBy.has(k)) correctIdsBy.set(k, []);
        correctIdsBy.get(k).push(Number(o.id));
    }

    const answers = await db.all(
        `SELECT sa.id, sa.submission_id, sa.question_id, sa.answer_text, sa.selected_options
         FROM student_answers sa
         JOIN quiz_submissions qs ON qs.id = sa.submission_id
         WHERE qs.quiz_id = $1 AND qs.status = ANY($2::text[])`,
        [quizId, FINISHED_STATUSES]
    );

    const totals = new Map(submissions.map(s => [Number(s.id), 0]));
    const graded = { id: [], marks: [], correct: [] };
    for (const answer of answers) {
        const q = questionById.get(Number(answer.question_id));
        if (!q) continue;
        const marks = Number(q.marks) || 0;
        let isCorrect = false;
        let awarded = 0;
        if (q.question_type === 'yes_no') {
            isCorrect = answer.answer_text === q.correct_answer;
            awarded = isCorrect ? marks : 0;
        } else if (q.question_type === 'mcq_single' || q.question_type === 'mcq_multiple') {
            let selected = [];
            try { selected = JSON.parse(answer.selected_options || '[]') || []; } catch { selected = []; }
            if (!Array.isArray(selected)) selected = [];
            const correctIds = correctIdsBy.get(Number(q.id)) || [];
            if (q.question_type === 'mcq_single') {
                isCorrect = selected.length === 1 && correctIds.includes(selected[0]);
                awarded = isCorrect ? marks : 0;
            } else {
                const totalCorrect = correctIds.length || 1;
                const right = selected.filter(x => correctIds.includes(x)).length;
                const wrong = selected.filter(x => !correctIds.includes(x)).length;
                awarded = Math.max(0, Math.min(marks, (right / totalCorrect) * marks - (wrong / totalCorrect) * marks));
                isCorrect = right === totalCorrect && wrong === 0;
            }
        }
        // A fully correct objective answer must never retain a partial/stale award.
        // This also protects old submissions whose question value changed later.
        if (isCorrect) awarded = marks;
        graded.id.push(Number(answer.id));
        graded.marks.push(awarded);
        graded.correct.push(isCorrect);
        const sid = Number(answer.submission_id);
        totals.set(sid, (totals.get(sid) || 0) + awarded);
    }

    if (graded.id.length) {
        await db.run(
            `UPDATE student_answers AS sa SET marks_awarded = v.marks_awarded, is_correct = v.is_correct
             FROM unnest($1::int[], $2::numeric[], $3::boolean[]) AS v(id, marks_awarded, is_correct)
             WHERE sa.id = v.id`,
            [graded.id, graded.marks, graded.correct]
        );
    }
    const subIds = [...totals.keys()];
    const percentages = subIds.map(sid => {
        const raw = maxScore > 0 ? (totals.get(sid) / maxScore) * 100 : 0;
        return Math.min(100, Math.max(0, Number.isFinite(raw) ? Number(raw.toFixed(2)) : 0));
    });
    await db.run(
        `UPDATE quiz_submissions AS qs
         SET total_score = v.total_score, max_score = $4::numeric, percentage = v.percentage, updated_at = CURRENT_TIMESTAMP
         FROM unnest($1::int[], $2::numeric[], $3::numeric[]) AS v(id, total_score, percentage)
         WHERE qs.id = v.id`,
        [subIds, subIds.map(sid => totals.get(sid)), percentages, maxScore]
    );
    return subIds.length;
}

// Older submissions can contain a score calculated before a question's point value
// was edited (for example is_correct=true, marks_awarded=1.5 while q.marks=2). Detect
// that impossible state and repair every finished submission for the quiz so totals,
// percentages, analytics, and the detailed result all stay in agreement.
async function repairQuizScoresIfStale(db, quizId) {
    const stale = await db.get(
        `SELECT EXISTS (
             SELECT 1
             FROM quiz_submissions qs
             JOIN student_answers sa ON sa.submission_id = qs.id
             JOIN questions q ON q.id = sa.question_id
             WHERE qs.quiz_id = $1
               AND qs.status = ANY($2::text[])
               AND sa.is_correct = TRUE
               AND ABS(COALESCE(sa.marks_awarded, 0) - COALESCE(q.marks, 0)) > 0.000001
         ) OR EXISTS (
             SELECT 1
             FROM quiz_submissions qs
             WHERE qs.quiz_id = $1
               AND qs.status = ANY($2::text[])
               AND ABS(
                   COALESCE(qs.max_score, 0) -
                   COALESCE((SELECT SUM(q.marks) FROM questions q WHERE q.quiz_id = qs.quiz_id), 0)
               ) > 0.000001
         ) OR EXISTS (
             SELECT 1
             FROM quiz_submissions qs
             WHERE qs.quiz_id = $1
               AND qs.status = ANY($2::text[])
               AND ABS(
                   COALESCE(qs.total_score, 0) -
                   COALESCE((SELECT SUM(sa.marks_awarded) FROM student_answers sa WHERE sa.submission_id = qs.id), 0)
               ) > 0.000001
         ) AS needs_regrade`,
        [quizId, FINISHED_STATUSES]
    );

    if (!stale?.needs_regrade) return 0;
    return regradeQuiz(db, quizId);
}

// Makes a published quiz reachable — one 'not_started' submission per student, in one statement —
// and, when the quiz has just become published, announces it once (in-app + email). Emails leave
// after the HTTP response: awaiting one SMTP round trip per student kept the teacher on a spinner.
async function announceQuiz(db, quizId, senderId, { notify }) {
    // One row per student: someone enrolled in two of the assigned batches used to get two emails.
    const students = await db.all(
        `SELECT DISTINCT ON (bs.student_id) bs.student_id, s.email, s.first_name, s.timezone, b.name AS batch_name
         FROM quiz_batches qb
         JOIN batch_students bs ON bs.batch_id = qb.batch_id
         JOIN users s ON s.id = bs.student_id
         JOIN batches b ON b.id = qb.batch_id
         WHERE qb.quiz_id = $1
         ORDER BY bs.student_id, b.name`,
        [quizId]
    );
    if (!students.length) return 0;

    await db.run(
        `INSERT INTO quiz_submissions (quiz_id, student_id, status, max_score)
         SELECT $1::int, sid, 'not_started', (SELECT COALESCE(SUM(marks), 0) FROM questions WHERE quiz_id = $1::int)
         FROM unnest($2::int[]) AS sid
         ON CONFLICT (quiz_id, student_id) DO NOTHING`,
        [quizId, students.map(s => s.student_id)]
    );
    if (!notify) return 0;

    const quiz = await db.get(
        `SELECT q.title, q.duration_minutes, q.start_date, q.end_date, q.total_marks,
                u.first_name AS teacher_first_name, u.last_name AS teacher_last_name
         FROM quizzes q LEFT JOIN users u ON u.id = q.teacher_id
         WHERE q.id = $1`,
        [quizId]
    );

    try {
        const { createBulkNotifications } = require('../services/notificationService');
        await createBulkNotifications(db, students.map(s => s.student_id), {
            type: 'quiz_published',
            title: 'New quiz available',
            message: `${quiz.title} — your teacher just published a new quiz.`,
            link: `/app/my-quizzes?quiz=${quizId}`,
            entity_type: 'quiz',
            entity_id: parseInt(quizId, 10),
            sender_id: senderId,
        });
    } catch (notifErr) {
        console.warn('[notifications] quiz_published failed:', notifErr.message);
    }

    const teacherName = `${quiz.teacher_first_name || ''} ${quiz.teacher_last_name || ''}`.trim() || 'Your Teacher';
    setImmediate(async () => {
        for (const student of students) {
            if (!student.email) continue;
            try {
                await sendQuizNotification({
                    to: student.email,
                    studentName: student.first_name || 'Student',
                    quizName: quiz.title,
                    teacherName,
                    batchName: student.batch_name,
                    duration: quiz.duration_minutes || 0,
                    startDate: quiz.start_date,
                    endDate: quiz.end_date,
                    totalPoints: quiz.total_marks || 0,
                    recipientTimezone: student.timezone || 'UTC',
                });
                console.log(`✅ Quiz notification sent to ${student.email}`);
            } catch (emailError) {
                console.error(`❌ Failed to send quiz notification to ${student.email}:`, emailError.message);
            }
        }
    });
    return students.length;
}

// Get all quizzes (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Fire-and-forget: auto-submit expired submissions without blocking the response
        autoSubmitExpiredSubmissions(req.db).catch(err => console.error('Background auto-submit error:', err));
        
        // For students, use an optimized query that fetches submission status in one go (no N+1)
        if (req.user.role === 'student') {
            const quizzes = await req.db.all(`
                SELECT 
                    q.id, q.title, q.description, q.status, q.start_date, q.end_date, 
                    q.duration_minutes, q.total_marks, q.created_at, q.updated_at,
                    u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                    (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as total_questions,
                    string_agg(DISTINCT b.name, ',') as batch_names,
                    qs.status as sub_status, qs.started_at as sub_started_at, qs.submitted_at as sub_submitted_at,
                    qs.total_score as sub_total_score, qs.max_score as sub_max_score, qs.percentage as sub_percentage
                FROM quizzes q
                LEFT JOIN users u ON q.teacher_id = u.id
                JOIN quiz_batches qb ON q.id = qb.quiz_id
                JOIN batch_students bs ON qb.batch_id = bs.batch_id
                LEFT JOIN batches b ON qb.batch_id = b.id
                LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id AND qs.student_id = ?
                WHERE bs.student_id = ? AND q.status = 'published'
                GROUP BY q.id, q.title, q.description, q.status, q.start_date, q.end_date, 
                         q.duration_minutes, q.total_marks, q.created_at, q.updated_at,
                         u.first_name, u.last_name,
                         qs.status, qs.started_at, qs.submitted_at, qs.total_score, qs.max_score, qs.percentage
                ORDER BY q.created_at DESC
            `, [req.user.id, req.user.id]);

            const now = new Date();
            for (let quiz of quizzes) {
                // Map submission fields inline (no extra query)
                const rawStatus = quiz.sub_status || 'not_started';
                quiz.submission_status = ['submitted', 'auto_submitted', 'graded'].includes(rawStatus) ? 'completed' : rawStatus;
                quiz.submission = quiz.sub_status ? {
                    status: quiz.sub_status, started_at: quiz.sub_started_at, submitted_at: quiz.sub_submitted_at,
                    total_score: quiz.sub_total_score, max_score: quiz.sub_max_score, percentage: quiz.sub_percentage
                } : null;

                quiz.can_start = !quiz.start_date || new Date(quiz.start_date) <= now;
                quiz.has_ended = !!(quiz.end_date && new Date(quiz.end_date) < now);
                quiz.can_view_results = !quiz.end_date || new Date(quiz.end_date) <= now;
                if (!quiz.can_view_results && quiz.submission) {
                    quiz.submission.percentage = null;
                    quiz.submission.total_score = null;
                    quiz.submission.max_score = null;
                }

                // Coerce numeric fields
                quiz.total_questions = quiz.total_questions != null ? Number(quiz.total_questions) : 0;
                if (quiz.duration_minutes != null) quiz.duration_minutes = Number(quiz.duration_minutes);
                if (quiz.total_marks != null) quiz.total_marks = Number(quiz.total_marks);

                // Clean up temp fields
                delete quiz.sub_status; delete quiz.sub_started_at; delete quiz.sub_submitted_at;
                delete quiz.sub_total_score; delete quiz.sub_max_score; delete quiz.sub_percentage;
            }

            return res.json(quizzes);
        }

        // Teacher/Admin path. Each aggregate is computed on its own before joining: the old single
        // join multiplied batches × students × submissions for every quiz, and counted submissions
        // from students no longer in the batches (so "5 / 3" was possible).
        const sql = `
            WITH scope AS (
                SELECT id FROM quizzes WHERE ($1::int IS NULL OR teacher_id = $1::int)
            ),
            question_totals AS (
                SELECT quiz_id, COUNT(*) AS total_questions
                FROM questions WHERE quiz_id IN (SELECT id FROM scope)
                GROUP BY quiz_id
            ),
            assigned AS (
                SELECT qb.quiz_id,
                       COUNT(DISTINCT qb.batch_id) AS batch_count,
                       string_agg(DISTINCT b.name, ',') AS batch_names,
                       string_agg(DISTINCT b.french_level, ',') AS french_levels
                FROM quiz_batches qb JOIN batches b ON b.id = qb.batch_id
                WHERE qb.quiz_id IN (SELECT id FROM scope)
                GROUP BY qb.quiz_id
            ),
            roster AS (
                SELECT DISTINCT qb.quiz_id, bs.student_id
                FROM quiz_batches qb JOIN batch_students bs ON bs.batch_id = qb.batch_id
                WHERE qb.quiz_id IN (SELECT id FROM scope)
            ),
            outcomes AS (
                SELECT r.quiz_id,
                       COUNT(*) AS total_students,
                       COUNT(qs.id) FILTER (WHERE qs.status IN ('submitted','auto_submitted','graded')) AS submitted_students,
                       COUNT(qs.id) FILTER (WHERE qs.status = 'in_progress') AS in_progress_students,
                       ROUND(AVG(qs.percentage) FILTER (WHERE qs.status IN ('submitted','auto_submitted','graded') AND qs.percentage IS NOT NULL), 1) AS avg_score
                FROM roster r
                LEFT JOIN quiz_submissions qs ON qs.quiz_id = r.quiz_id AND qs.student_id = r.student_id
                GROUP BY r.quiz_id
            )
            SELECT
                q.id, q.title, q.description, q.status, q.start_date, q.end_date,
                q.duration_minutes, q.total_marks, q.created_at, q.updated_at,
                u.first_name AS teacher_first_name, u.last_name AS teacher_last_name,
                -- Server-authoritative scheduling state, computed against PG NOW() so it
                -- doesn't depend on the viewer's browser clock.
                CASE
                    WHEN q.status != 'published' THEN 'inactive'
                    WHEN q.start_date IS NOT NULL AND q.start_date > NOW() THEN 'scheduled'
                    WHEN q.end_date   IS NOT NULL AND q.end_date   <= NOW() THEN 'ended'
                    ELSE 'active'
                END AS schedule_state,
                CASE WHEN q.end_date IS NULL THEN NULL
                     ELSE GREATEST(0, EXTRACT(EPOCH FROM (q.end_date - NOW())))::bigint END AS seconds_until_end,
                CASE WHEN q.start_date IS NULL THEN NULL
                     ELSE GREATEST(0, EXTRACT(EPOCH FROM (q.start_date - NOW())))::bigint END AS seconds_until_start,
                COALESCE(a.batch_count, 0) AS batch_count,
                COALESCE(o.submitted_students, 0) AS submitted_students,
                COALESCE(o.total_students, 0) AS total_students,
                COALESCE(o.in_progress_students, 0) AS in_progress_students,
                COALESCE(t.total_questions, 0) AS total_questions,
                a.batch_names, a.french_levels, o.avg_score,
                ${QUIZ_LOCKED_SQL} AS is_locked
            FROM quizzes q
            JOIN scope s ON s.id = q.id
            LEFT JOIN users u ON u.id = q.teacher_id
            LEFT JOIN question_totals t ON t.quiz_id = q.id
            LEFT JOIN assigned a ON a.quiz_id = q.id
            LEFT JOIN outcomes o ON o.quiz_id = q.id
            ORDER BY q.created_at DESC
        `;

        const quizzes = await req.db.all(sql, [req.user.role === 'teacher' ? req.user.id : null]);

        // Coerce numeric fields for Postgres compatibility so frontend tables show correct counts
        for (let quiz of quizzes) {
            quiz.batch_count = quiz.batch_count != null ? Number(quiz.batch_count) : 0;
            quiz.submitted_students = quiz.submitted_students != null ? Number(quiz.submitted_students) : 0;
            quiz.total_students = quiz.total_students != null ? Number(quiz.total_students) : 0;
            quiz.total_questions = quiz.total_questions != null ? Number(quiz.total_questions) : 0;
            if (quiz.duration_minutes != null) quiz.duration_minutes = Number(quiz.duration_minutes);
            if (quiz.total_marks != null) quiz.total_marks = Number(quiz.total_marks);
            if (quiz.avg_score != null) quiz.avg_score = Number(quiz.avg_score);
            if (quiz.seconds_until_end != null) quiz.seconds_until_end = Number(quiz.seconds_until_end);
        }

        res.json(quizzes);
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// Get quiz by ID with questions
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Get quiz details
        const quiz = await req.db.get(`
            SELECT 
                q.id, q.title, q.description, q.instructions, q.status, q.created_at, q.updated_at,
                q.start_date, q.end_date, q.duration_minutes, q.total_marks, q.randomize_questions, q.randomize_options, q.auto_submit,
                u.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM quizzes q
            LEFT JOIN users u ON q.teacher_id = u.id
            WHERE q.id = ?
        `, [id]);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Check access permissions
        if (req.user.role === 'teacher' && quiz.teacher_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (req.user.role === 'student') {
            // Check if student has access to this quiz
            const hasAccess = await req.db.get(`
                SELECT 1 FROM quiz_batches qb
                JOIN batch_students bs ON qb.batch_id = bs.batch_id
                WHERE qb.quiz_id = ? AND bs.student_id = ? AND EXISTS (
                    SELECT 1 FROM quizzes WHERE id = ? AND status = 'published'
                )
            `, [id, req.user.id, id]);

            if (!hasAccess) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        // Get questions with options
        const questions = await req.db.all(`
            SELECT 
                q.id, q.question_text, q.question_type, q.question_order, q.marks, q.correct_answer, q.explanation, q.audio_clip_id
            FROM questions q
            WHERE q.quiz_id = ?
            ORDER BY q.question_order
        `, [id]);

        // Options for every MCQ question in one query (it used to be one query per question).
        const mcqIds = questions.filter(q => isMcqType(q.question_type)).map(q => q.id);
        const optionsByQuestion = groupRows(mcqIds.length
            ? await req.db.all(
                `SELECT id, question_id, option_text, is_correct, option_order
                 FROM question_options
                 WHERE question_id = ANY($1::int[])
                 ORDER BY question_id, option_order`,
                [mcqIds])
            : [], 'question_id');
        for (const question of questions) {
            if (isMcqType(question.question_type)) {
                question.options = (optionsByQuestion.get(Number(question.id)) || [])
                    .map(o => ({ id: o.id, option_text: o.option_text, is_correct: o.is_correct, option_order: o.option_order }));
            }
        }

        // Apply randomization for students
        let finalQuestions = questions;
        if (req.user.role === 'student') {
            // Randomize question order if enabled
            if (quiz.randomize_questions) {
                finalQuestions = shuffleArray([...questions]);
            }
            // Randomize MCQ options if enabled
            if (quiz.randomize_options) {
                for (let question of finalQuestions) {
                    if (question.options && question.options.length > 0) {
                        question.options = shuffleArray([...question.options]);
                    }
                }
            }
            // Strip is_correct from options so students can't see answers
            for (let question of finalQuestions) {
                if (question.options) {
                    question.options = question.options.map(opt => ({
                        id: opt.id,
                        option_text: opt.option_text,
                        option_order: opt.option_order
                    }));
                }
                // Don't send correct_answer (or the explanation that gives it away) to students
                delete question.correct_answer;
                delete question.explanation;
            }
        }

        // Get assigned batches
        const batches = await req.db.all(`
            SELECT 
                b.id, b.name, b.french_level,
                qb.assigned_at
            FROM quiz_batches qb
            JOIN batches b ON qb.batch_id = b.id
            WHERE qb.quiz_id = ?
        `, [id]);

        // Get audio clips for this quiz
        const audioClips = await req.db.all(`
            SELECT id, transcript, voice_name, source_type, kdrive_file_id,
                   file_name, duration_seconds, audio_order, max_plays,
                   (kdrive_file_id IS NOT NULL) as has_audio
            FROM quiz_audio_clips
            WHERE quiz_id = ?
            ORDER BY audio_order
        `, [id]);

        // For students, hide transcript (they should listen, not read)
        const safeAudioClips = req.user.role === 'student'
            ? audioClips.map(c => ({
                id: c.id,
                duration_seconds: c.duration_seconds,
                audio_order: c.audio_order,
                max_plays: c.max_plays,
                has_audio: !!c.kdrive_file_id
            }))
            : audioClips;

        res.json({
            ...quiz,
            questions: finalQuestions,
            batches,
            audio_clips: safeAudioClips
        });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
});

// ============================================================
// AI Quiz Generation (Teachers only)
// ============================================================
router.post('/ai-generate', [
    authenticateToken,
    teacherOrAdmin,
    body('totalQuestions').isInt({ min: 1, max: 50 }),
    body('singleChoiceCount').isInt({ min: 0 }),
    body('multipleChoiceCount').isInt({ min: 0 }),
    body('yesNoCount').isInt({ min: 0 }),
    body('totalPoints').isInt({ min: 1, max: 500 }),
    body('userPrompt').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const aiService = getAIQuizService();
        if (!aiService.isConfigured) {
            return res.status(503).json({ error: 'AI quiz generation is not configured. Ask your administrator to set the GEMINI_API_KEY.' });
        }

        const { totalQuestions, singleChoiceCount, multipleChoiceCount, yesNoCount, totalPoints, userPrompt } = req.body;

        // Validate that counts add up
        const sum = singleChoiceCount + multipleChoiceCount + yesNoCount;
        if (sum !== totalQuestions) {
            return res.status(400).json({
                error: `Question type counts (${singleChoiceCount} + ${multipleChoiceCount} + ${yesNoCount} = ${sum}) must equal total questions (${totalQuestions})`
            });
        }

        const result = await aiService.generateQuiz({
            totalQuestions, singleChoiceCount, multipleChoiceCount, yesNoCount, totalPoints,
            userPrompt: userPrompt || ''
        });

        res.json({
            message: 'Quiz generated successfully',
            ...result
        });

    } catch (error) {
        console.error('AI quiz generation error:', error);
        const status = Number(error.status) || 500;
        const retryable = error.retryable === true || [429, 500, 502, 503, 504].includes(status);
        res.status(status).json({
            error: retryable
                ? 'The AI service is temporarily busy. Please try again in a moment.'
                : (error.message || 'Failed to generate quiz with AI'),
            retryable
        });
    }
});

// ==========================================
// AUDIO / TTS ROUTES
// ==========================================

// Get available voices for TTS
router.get('/audio/voices', authenticateToken, teacherOrAdmin, (req, res) => {
    res.json({ voices: VOICE_OPTIONS });
});

// Generate TTS audio from transcript
router.post('/audio/generate', [
    authenticateToken,
    teacherOrAdmin,
    body('transcript').isLength({ min: 1, max: 5000 }).trim(),
    body('voiceName').optional().isString(),
    body('quizTitle').optional().isString(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const tts = getTTSService();
        if (!tts.isConfigured) {
            return res.status(503).json({ error: 'TTS service is not configured. Set GEMINI_API_KEY.' });
        }

        const { transcript, voiceName, quizTitle } = req.body;

        const result = await tts.generateAndUpload(
            transcript,
            voiceName || 'Kore',
            req.user.id,
            quizTitle || 'quiz',
            { returnBase64: true }
        );

        res.json({
            message: 'Audio generated successfully',
            audio: {
                kdriveFileId: result.kdriveFileId,
                fileName: result.fileName,
                durationSeconds: result.durationSeconds,
                transcript,
                voiceName: voiceName || 'Kore',
                sourceType: 'tts',
                wavBase64: result.wavBase64 || null  // inline audio data for instant preview
            }
        });
    } catch (error) {
        console.error('TTS generation error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate audio' });
    }
});

// Upload audio file (teacher uploads their own)
router.post('/audio/upload', authenticateToken, teacherOrAdmin, audioUpload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const tts = getTTSService();
        const result = await tts.uploadAudioFile(
            req.file.path,
            req.file.originalname,
            req.user.id
        );

        // Clean up temp file
        const fs = require('fs');
        try { fs.unlinkSync(req.file.path); } catch {}

        res.json({
            message: 'Audio uploaded successfully',
            audio: {
                kdriveFileId: result.kdriveFileId,
                fileName: result.fileName,
                sourceType: 'upload'
            }
        });
    } catch (error) {
        console.error('Audio upload error:', error);
        // Clean up temp file on error
        if (req.file) {
            const fs = require('fs');
            try { fs.unlinkSync(req.file.path); } catch {}
        }
        res.status(500).json({ error: error.message || 'Failed to upload audio' });
    }
});

// Stream audio file to client (for both teacher preview and student playback)
router.get('/audio/:clipId/stream', authenticateToken, async (req, res) => {
    try {
        const { clipId } = req.params;

        // Get the audio clip record
        const clip = await req.db.get(
            'SELECT * FROM quiz_audio_clips WHERE id = ?',
            [clipId]
        );

        if (!clip) {
            return res.status(404).json({ error: 'Audio clip not found' });
        }

        if (!clip.kdrive_file_id) {
            return res.status(404).json({ error: 'Audio file not available' });
        }

        // For students, verify they have access to the quiz
        if (req.user.role === 'student') {
            const hasAccess = await req.db.get(`
                SELECT 1 FROM quiz_batches qb
                JOIN batch_students bs ON qb.batch_id = bs.batch_id
                WHERE qb.quiz_id = ? AND bs.student_id = ?
            `, [clip.quiz_id, req.user.id]);

            if (!hasAccess) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const tts = getTTSService();
        if (req.user.role === 'student') {
            const base64Data = await tts.getAudioAsBase64(clip.kdrive_file_id);
            res.json({ 
                audioData: base64Data, 
                contentType: 'audio/wav' 
            });
        } else {
            await tts.streamAudio(clip.kdrive_file_id, res, req.headers);
        }

    } catch (error) {
        console.error('Audio stream error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to stream audio' });
        }
    }
});

// Stream audio by kDrive file ID (for teacher preview before saving)
router.get('/audio/preview/:kdriveFileId', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { kdriveFileId } = req.params;
        if (!kdriveFileId) {
            return res.status(400).json({ error: 'kDrive file ID required' });
        }
        const tts = getTTSService();
        await tts.streamAudio(kdriveFileId, res, req.headers);
    } catch (error) {
        console.error('Audio preview error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to stream audio preview' });
        }
    }
});

// Create new quiz (Teachers only)
router.post('/', [
    authenticateToken,
    teacherOrAdmin,
    body('title').isLength({ min: 1 }).trim(),
    body('description').optional().trim(),
    body('instructions').optional().trim(),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('duration_minutes').optional().isInt({ min: 1 }),
    body('randomize_questions').optional().isBoolean(),
    body('randomize_options').optional().isBoolean(),
    body('auto_submit').optional().isBoolean(),
    body('total_marks').optional().isNumeric(),
    body('questions').isArray({ min: 1 }),
    body('batch_ids').isArray({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const {
            title, description, instructions, start_date, end_date, duration_minutes,
            randomize_questions, randomize_options, auto_submit, total_marks, questions, batch_ids
        } = req.body;
        const teacher_id = req.user.role === 'admin' ? req.body.teacher_id : req.user.id;

        // ── TIMEZONE DIAGNOSTIC LOG ──
        // If a teacher reports "I picked 4 AM but it saved as 2 AM" check this
        // log to see EXACTLY what arrived from the browser. The values here are
        // the absolute UTC moments — if they don't match what the teacher
        // intended, the issue is in the picker (browser timezone) NOT the
        // server. The server stores them verbatim.
        try {
            console.log('[quiz/create] timezone trace:', {
                user_id: req.user.id,
                user_timezone: req.user.timezone || null,
                start_date_received: start_date,
                end_date_received: end_date,
                server_now_utc: new Date().toISOString(),
                server_tz_env: process.env.TZ || '(unset)',
            });
        } catch {}

        // Validate date logic
        if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        // Reject quizzes whose end_date is already in the past — the most
        // common cause of "I just created it but it shows Ended" is a wrong
        // browser clock or a teacher who picked a past time by mistake.
        // We give them an explicit error instead of silently storing it.
        if (end_date) {
            const endMs = new Date(end_date).getTime();
            const nowMs = Date.now();
            if (endMs < nowMs - 60_000) {  // 60s grace for clock drift
                return res.status(400).json({
                    error: 'End date is in the past. ' +
                        'Pick a future end time. ' +
                        `(Server time is ${new Date(nowMs).toISOString()}, end_date received was ${end_date}.)`,
                });
            }
        }

        // Validate questions and calculate total marks
        let calculatedTotalMarks = 0;
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            if (!question.question_text || !question.question_type || question.marks === undefined) {
                return res.status(400).json({
                    error: `Question ${i + 1}: Missing required fields (question_text, question_type, marks)`
                });
            }

            if (!['mcq_single', 'mcq_multiple', 'yes_no'].includes(question.question_type)) {
                return res.status(400).json({
                    error: `Question ${i + 1}: Invalid question type. Must be mcq_single, mcq_multiple, or yes_no`
                });
            }

            if (question.question_type.startsWith('mcq') && (!question.options || question.options.length < 2)) {
                return res.status(400).json({
                    error: `Question ${i + 1}: MCQ must have at least 2 options`
                });
            }

            if (question.question_type.startsWith('mcq')) {
                const correctOptions = question.options.filter(opt => opt.is_correct);
                if (correctOptions.length === 0) {
                    return res.status(400).json({
                        error: `Question ${i + 1}: At least one option must be marked as correct`
                    });
                }

                if (question.question_type === 'mcq_single' && correctOptions.length > 1) {
                    return res.status(400).json({
                        error: `Question ${i + 1}: Single choice MCQ can have only one correct answer`
                    });
                }
            }

            if (question.question_type === 'yes_no' && !question.correct_answer) {
                return res.status(400).json({
                    error: `Question ${i + 1}: Yes/No question must have a correct answer specified`
                });
            }

            calculatedTotalMarks += Number(question.marks);
        }

        // Use provided total_marks or calculated total
        const finalTotalMarks = total_marks ? Number(total_marks) : calculatedTotalMarks;

        // Validate batch access
        let batchCheckSql = 'SELECT id FROM batches WHERE id IN (' + batch_ids.map(() => '?').join(',') + ')';
        let batchParams = [...batch_ids];

        if (req.user.role === 'teacher') {
            batchCheckSql += ' AND teacher_id = ?';
            batchParams.push(req.user.id);
        }

        const validBatches = await req.db.all(batchCheckSql, batchParams);
        if (validBatches.length !== batch_ids.length) {
            return res.status(400).json({ error: 'Invalid batch IDs or access denied' });
        }

        // Create quiz
        const quizResult = await req.db.run(`
            INSERT INTO quizzes (
                title, description, instructions, teacher_id, status, start_date, end_date, 
                duration_minutes, total_marks, randomize_questions, randomize_options, auto_submit
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
        `, [
            title, description || null, instructions || null, teacher_id, 'draft',
            start_date || null, end_date || null, duration_minutes || null, finalTotalMarks,
            randomize_questions || false, randomize_options || false, auto_submit !== false
        ]);

        const quizId = quizResult.rows[0].id;

        // ── TIMEZONE DIAGNOSTIC LOG (post-insert) ──
        try {
            const stored = await req.db.get(
                `SELECT id, start_date::text AS start_text, end_date::text AS end_text,
                        EXTRACT(EPOCH FROM (end_date - NOW()))::bigint AS seconds_until_end,
                        (end_date <= NOW()) AS expired_on_create
                 FROM quizzes WHERE id = ?`,
                [quizId]
            );
            console.log('[quiz/create] stored row:', stored);
            if (stored?.expired_on_create) {
                console.warn('[quiz/create] ⚠ Quiz was created already-expired according to PG NOW(). ' +
                    'This means the browser sent an end_date that is in the past relative to UTC. ' +
                    'Check that the user\'s browser clock and timezone match reality.');
            }
        } catch (logErr) { /* ignore */ }

        // Clips, questions and options in a fixed number of statements. If anything fails the
        // half-made quiz is removed (its rows cascade) instead of lingering as an empty draft.
        try {
            await syncQuizContent(req.db, quizId, questions, req.body.audio_clips || [], { fresh: true });
            await req.db.run(
                'INSERT INTO quiz_batches (quiz_id, batch_id) SELECT $1::int, unnest($2::int[]) ON CONFLICT (quiz_id, batch_id) DO NOTHING',
                [quizId, batch_ids.map(Number)]
            );
        } catch (contentError) {
            await req.db.run('DELETE FROM quizzes WHERE id = $1', [quizId]).catch(() => {});
            throw contentError;
        }

        // Get created quiz
        const newQuiz = await req.db.get(`
            SELECT 
                q.id, q.title, q.description, q.status, q.created_at,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM quizzes q
            LEFT JOIN users u ON q.teacher_id = u.id
            WHERE q.id = ?
        `, [quizId]);

        res.status(201).json({
            message: 'Quiz created successfully',
            quiz: newQuiz
        });

    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
});

// Update an existing quiz
router.put('/:id', [
    authenticateToken,
    teacherOrAdmin
], async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            instructions,
            start_date,
            end_date,
            duration_minutes,
            total_marks,
            randomize_questions,
            randomize_options,
            auto_submit,
            status,
            batch_ids,
            questions
        } = req.body;

        // Basic validations
        if (!title || !Array.isArray(batch_ids) || batch_ids.length === 0) {
            return res.status(400).json({ error: 'Title and batch_ids are required' });
        }
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'At least one question is required' });
        }

        // Check quiz exists and access
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }
        if (await isQuizLocked(req.db, id)) {
            return res.status(409).json({ error: QUIZ_LOCKED_MESSAGE, code: 'QUIZ_ENDED' });
        }

        // Validate date logic
        if (start_date && end_date) {
            const start = new Date(start_date);
            const end = new Date(end_date);
            if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
                return res.status(400).json({ error: 'Invalid start/end date' });
            }
        }

        // Reject updates that push end_date into the past — same guard as
        // create. Skip the check if the user is just unpublishing (status
        // change to draft) or if the quiz is already 'graded'/closed.
        if (end_date && status !== 'draft') {
            const endMs = new Date(end_date).getTime();
            const nowMs = Date.now();
            if (endMs < nowMs - 60_000) {
                return res.status(400).json({
                    error: 'End date is in the past. Pick a future end time. ' +
                        `(Server time is ${new Date(nowMs).toISOString()}, end_date received was ${end_date}.)`,
                });
            }
        }

        // ── TIMEZONE DIAGNOSTIC LOG ──
        try {
            console.log('[quiz/update] timezone trace:', {
                quiz_id: id,
                user_id: req.user.id,
                user_timezone: req.user.timezone || null,
                start_date_received: start_date,
                end_date_received: end_date,
                server_now_utc: new Date().toISOString(),
                server_tz_env: process.env.TZ || '(unset)',
            });
        } catch {}

        // Validate batches belong to teacher (or admin)
        let batchCheckSql = 'SELECT id FROM batches WHERE id IN (' + batch_ids.map(() => '?').join(',') + ')';
        const batchParams = [...batch_ids];
        if (req.user.role === 'teacher') {
            batchCheckSql += ' AND teacher_id = ?';
            batchParams.push(req.user.id);
        }
        const validBatches = await req.db.all(batchCheckSql, batchParams);
        if (validBatches.length !== batch_ids.length) {
            return res.status(400).json({ error: 'Invalid batch IDs or access denied' });
        }

        // Validate questions content
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question_text || !q.question_type) {
                return res.status(400).json({ error: `Question ${i + 1}: question_text and question_type are required` });
            }
            const marksNum = Number(q.marks);
            if (Number.isNaN(marksNum) || marksNum < 0) {
                return res.status(400).json({ error: `Question ${i + 1}: invalid marks` });
            }
            if (q.question_type.startsWith('mcq')) {
                if (!Array.isArray(q.options) || q.options.length < 2) {
                    return res.status(400).json({ error: `Question ${i + 1}: MCQ requires at least 2 options` });
                }
                const correctCount = q.options.filter((o) => o.is_correct).length;
                if (q.question_type === 'mcq_single' && correctCount !== 1) {
                    return res.status(400).json({ error: `Question ${i + 1}: single-choice MCQ must have exactly 1 correct option` });
                }
                if (q.question_type === 'mcq_multiple' && correctCount < 1) {
                    return res.status(400).json({ error: `Question ${i + 1}: multiple-choice MCQ must have at least 1 correct option` });
                }
            } else if (q.question_type === 'yes_no') {
                if (q.correct_answer !== 'yes' && q.correct_answer !== 'no') {
                    return res.status(400).json({ error: `Question ${i + 1}: yes_no must have correct_answer 'yes' or 'no'` });
                }
            }
        }

        // Compute final total marks if not provided
        let finalTotalMarks = null;
        if (total_marks !== undefined && total_marks !== null && !Number.isNaN(Number(total_marks))) {
            finalTotalMarks = Number(total_marks);
        } else {
            const sum = questions.reduce((acc, q) => acc + Number(q.marks || 0), 0);
            finalTotalMarks = sum;
        }

        // Scores only need recomputing when the answer key or the points actually change.
        const previous = await req.db.get(
            `SELECT status, EXISTS (
                 SELECT 1 FROM quiz_submissions WHERE quiz_id = $1 AND status = ANY($2::text[])
             ) AS has_finished
             FROM quizzes WHERE id = $1`,
            [id, FINISHED_STATUSES]
        );
        const gradingBefore = previous?.has_finished ? await loadGradingState(req.db, id) : null;
        const nextStatus = status === 'published' ? 'published' : 'draft';

        // Transaction
        await req.db.run('BEGIN');

        await req.db.run(`
            UPDATE quizzes
            SET
                title = ?, description = ?, instructions = ?,
                status = ?, start_date = ?, end_date = ?, duration_minutes = ?,
                total_marks = ?, randomize_questions = ?, randomize_options = ?, auto_submit = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            title,
            description || null,
            instructions || null,
            nextStatus,
            start_date || null,
            end_date || null,
            duration_minutes || null,
            finalTotalMarks,
            !!randomize_questions,
            !!randomize_options,
            auto_submit !== false,
            id
        ]);

        // Keep the batch rows that stay (and their assigned_at); only add and remove the difference.
        const batchIdList = batch_ids.map(Number);
        await req.db.run('DELETE FROM quiz_batches WHERE quiz_id = $1 AND batch_id <> ALL($2::int[])', [id, batchIdList]);
        await req.db.run(
            'INSERT INTO quiz_batches (quiz_id, batch_id) SELECT $1::int, unnest($2::int[]) ON CONFLICT (quiz_id, batch_id) DO NOTHING',
            [id, batchIdList]
        );

        // Questions, options and audio clips are updated in place — see syncQuizContent.
        await syncQuizContent(req.db, id, questions, req.body.audio_clips);

        await req.db.run('COMMIT');

        // The quiz is saved; nothing below may turn the response into an error.
        let regraded = 0;
        if (gradingBefore) {
            try {
                const gradingAfter = await loadGradingState(req.db, id);
                if (gradingSignature(gradingAfter) !== gradingSignature(gradingBefore)) {
                    regraded = await regradeQuiz(req.db, id, gradingAfter);
                }
            } catch (regradeError) {
                console.error('[quiz/update] regrade failed:', regradeError.message);
            }
        }
        let notified = 0;
        if (nextStatus === 'published') {
            try {
                notified = await announceQuiz(req.db, id, req.user.id, { notify: previous?.status !== 'published' });
            } catch (announceError) {
                console.error('[quiz/update] announce failed:', announceError.message);
            }
        }

        const updatedQuiz = await req.db.get(`
            SELECT
                q.id, q.title, q.description, q.status, q.total_marks, q.updated_at,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM quizzes q
            LEFT JOIN users u ON q.teacher_id = u.id
            WHERE q.id = ?
        `, [id]);

        return res.json({ message: 'Quiz updated successfully', quiz: updatedQuiz, regraded, notified });

    } catch (error) {
        try { await req.db.run('ROLLBACK'); } catch { }
        console.error('Update quiz error:', error);
        return res.status(500).json({ error: 'Failed to update quiz' });
    }
});

// Start a quiz (Students only)
router.post('/:id/start', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can start quizzes' });
        }

        // Check if quiz is accessible
        const accessCheck = await isQuizAccessible(req.db, id, req.user.id);
        if (!accessCheck.accessible) {
            return res.status(400).json({ error: accessCheck.reason });
        }

        // Check if submission already exists
        const existingSubmission = await req.db.get(`
            SELECT * FROM quiz_submissions 
            WHERE quiz_id = ? AND student_id = ?
        `, [id, req.user.id]);

        if (existingSubmission) {
            if (existingSubmission.status === 'submitted' || existingSubmission.status === 'auto_submitted') {
                return res.status(400).json({ error: 'Quiz already submitted' });
            }
            if (existingSubmission.status === 'in_progress') {
                return res.json({
                    message: 'Quiz already in progress',
                    submission: existingSubmission
                });
            }
        }

        // Create or update submission
        const now = new Date().toISOString();
        let submissionId;

        if (existingSubmission) {
            await req.db.run(`
                UPDATE quiz_submissions 
                SET status = 'in_progress', started_at = ?, updated_at = ?
                WHERE id = ?
            `, [now, now, existingSubmission.id]);
            submissionId = existingSubmission.id;
        } else {
            const result = await req.db.run(`
                INSERT INTO quiz_submissions (quiz_id, student_id, status, started_at)
                VALUES (?, ?, 'in_progress', ?) RETURNING id
            `, [id, req.user.id, now]);
            submissionId = result.rows[0].id;
        }

        // Get quiz details for response
        const quiz = await req.db.get(`
            SELECT id, title, duration_minutes, total_marks, instructions
            FROM quizzes WHERE id = ?
        `, [id]);

        res.json({
            message: 'Quiz started successfully',
            submission_id: submissionId,
            started_at: now,
            quiz: quiz
        });

    } catch (error) {
        console.error('Start quiz error:', error);
        res.status(500).json({ error: 'Failed to start quiz' });
    }
});

// Auto-save quiz progress
router.post('/:id/auto-save', [
    authenticateToken,
    body('answers').isArray()
], async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can save quiz progress' });
        }

        // Get submission
        const submission = await req.db.get(`
            SELECT * FROM quiz_submissions
            WHERE quiz_id = ? AND student_id = ? AND status = 'in_progress'
        `, [id, req.user.id]);

        if (!submission) {
            return res.status(400).json({ error: 'No active quiz session found' });
        }

        // Get all valid question IDs for this quiz
        const validQuestions = await req.db.all(
            'SELECT id FROM questions WHERE quiz_id = ?',
            [id]
        );
        const validQuestionIds = new Set(validQuestions.map(q => q.id));

        // Filter answers to only include valid question IDs
        const validAnswers = answers.filter(answer =>
            answer.question_id && validQuestionIds.has(answer.question_id)
        );

        // Save progress with only valid answers
        await req.db.run(`
            UPDATE quiz_submissions
            SET auto_saved_data = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [JSON.stringify(validAnswers), submission.id]);

        res.json({ message: 'Progress saved successfully' });

    } catch (error) {
        console.error('Auto-save error:', error);
        res.status(500).json({ error: 'Failed to save progress' });
    }
});

// Submit quiz with automated grading
router.post('/:id/submit', [
    authenticateToken,
    body('answers').isArray()
], async (req, res) => {
    try {
        const { id } = req.params;
        const { answers, is_auto_submit } = req.body;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can submit quizzes' });
        }

        // Get submission
        const submission = await req.db.get(`
            SELECT * FROM quiz_submissions
            WHERE quiz_id = ? AND student_id = ?
        `, [id, req.user.id]);

        if (!submission) {
            return res.status(400).json({ error: 'No quiz session found' });
        }

        if (submission.status === 'submitted' || submission.status === 'auto_submitted') {
            return res.status(400).json({ error: 'Quiz already submitted' });
        }

        // Get all valid question IDs for this quiz
        const validQuestions = await req.db.all(
            'SELECT id FROM questions WHERE quiz_id = ?',
            [id]
        );
        const validQuestionIds = new Set(validQuestions.map(q => q.id));

        // Filter answers to only include valid question IDs
        const validAnswers = answers.filter(answer =>
            answer.question_id && validQuestionIds.has(answer.question_id)
        );

        // Calculate time taken
        const startTime = new Date(submission.started_at);
        const endTime = new Date();
        const timeTaken = Math.round((endTime - startTime) / (1000 * 60)); // minutes

        // Save only valid answers
        for (const answer of validAnswers) {
            await req.db.run(`
                INSERT INTO student_answers (submission_id, question_id, answer_text, selected_options)
                VALUES (?, ?, ?, ?)
                ON CONFLICT (submission_id, question_id)
                DO UPDATE SET
                  answer_text = EXCLUDED.answer_text,
                  selected_options = EXCLUDED.selected_options,
                  updated_at = CURRENT_TIMESTAMP
            `, [
                submission.id,
                answer.question_id,
                answer.answer_text || null,
                answer.selected_options ? JSON.stringify(answer.selected_options) : null
            ]);
        }

        // Update submission status
        const status = is_auto_submit ? 'auto_submitted' : 'submitted';
        await req.db.run(`
            UPDATE quiz_submissions 
            SET status = ?, submitted_at = CURRENT_TIMESTAMP, time_taken_minutes = ?
            WHERE id = ?
        `, [status, timeTaken, submission.id]);

        // Calculate results automatically
        const results = await calculateQuizResults(req.db, submission.id);

        res.json({
            message: 'Quiz submitted successfully',
            results: results,
            time_taken_minutes: timeTaken
        });

    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// Get server-synced quiz session status (students)
router.get('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can access quiz status' });
        }

        // Validate accessibility
        const accessCheck = await isQuizAccessible(req.db, id, req.user.id);
        if (!accessCheck.quiz) {
            return res.status(404).json({ error: 'Quiz not found or not accessible' });
        }

        const quiz = accessCheck.quiz;
        const now = new Date();

        // Fetch student's submission if any
        const submission = await req.db.get(
            'SELECT * FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?',
            [id, req.user.id]
        );

        if (!submission || submission.status === 'not_started') {
            return res.json({
                status: 'not_started',
                can_start: !!accessCheck.accessible,
                reason: accessCheck.reason || null,
                duration_minutes: quiz.duration_minutes,
                now_utc: now.toISOString(),
                time_left_seconds: null
            });
        }

        if (['submitted', 'auto_submitted', 'graded', 'published'].includes(submission.status)) {
            return res.json({
                status: submission.status,
                now_utc: now.toISOString(),
                started_at: submission.started_at,
                submitted_at: submission.submitted_at,
                time_left_seconds: 0,
                duration_minutes: quiz.duration_minutes
            });
        }

        // In progress
        const startMs = new Date(submission.started_at).getTime();
        const nominalEndMs = startMs + (Number(quiz.duration_minutes || 0) * 60 * 1000);
        const hardEndMs = quiz.end_date ? Math.min(nominalEndMs, new Date(quiz.end_date).getTime()) : nominalEndMs;
        const nowMs = now.getTime();
        const remainingSeconds = Math.max(0, Math.floor((hardEndMs - nowMs) / 1000));

        if (remainingSeconds <= 0) {
            let answers = [];
            try { answers = submission.auto_saved_data ? JSON.parse(submission.auto_saved_data) : []; } catch { answers = []; }

            // Get all valid question IDs for this quiz
            const validQuestions = await req.db.all(
                'SELECT id FROM questions WHERE quiz_id = ?',
                [id]
            );
            const validQuestionIds = new Set(validQuestions.map(q => q.id));

            // Filter answers to only include valid question IDs
            const validAnswers = answers.filter(answer =>
                answer.question_id && validQuestionIds.has(answer.question_id)
            );

            for (const answer of validAnswers) {
                await req.db.run(`
                    INSERT INTO student_answers (submission_id, question_id, answer_text, selected_options)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT (submission_id, question_id)
                    DO UPDATE SET
                      answer_text = EXCLUDED.answer_text,
                      selected_options = EXCLUDED.selected_options,
                      updated_at = CURRENT_TIMESTAMP
                `, [
                    submission.id,
                    answer.question_id,
                    answer.answer_text || null,
                    answer.selected_options ? JSON.stringify(answer.selected_options) : null
                ]);
            }

            const timeTakenMin = Math.max(0, Math.round((hardEndMs - startMs) / (1000 * 60)));

            await req.db.run(
                "UPDATE quiz_submissions SET status = 'auto_submitted', submitted_at = CURRENT_TIMESTAMP, time_taken_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [timeTakenMin, submission.id]
            );

            const results = await calculateQuizResults(req.db, submission.id);

            return res.json({
                message: 'Time expired, quiz auto-submitted',
                status: 'auto_submitted',
                now_utc: new Date().toISOString(),
                submitted_at: new Date().toISOString(),
                time_left_seconds: 0,
                time_taken_minutes: timeTakenMin,
                results
            });
        }

        // Parse saved answers from auto_saved_data to allow client to restore state on resume
        let savedAnswers = [];
        try {
            savedAnswers = submission.auto_saved_data ? JSON.parse(submission.auto_saved_data) : [];
        } catch {
            savedAnswers = [];
        }

        return res.json({
            status: 'in_progress',
            now_utc: now.toISOString(),
            started_at: submission.started_at,
            ends_at: new Date(hardEndMs).toISOString(),
            time_left_seconds: remainingSeconds,
            duration_minutes: quiz.duration_minutes,
            answers: savedAnswers
        });

    } catch (error) {
        console.error('Status endpoint error:', error);
        res.status(500).json({ error: 'Failed to get quiz status' });
    }
});

// Update quiz status (publish/unpublish)
router.patch('/:id/status', [
    authenticateToken,
    teacherOrAdmin,
    body('status').isIn(['draft', 'published'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { id } = req.params;
        const { status } = req.body;

        const quiz = await req.db.get(
            `SELECT id, status FROM quizzes WHERE id = $1 AND ($2 = 'admin' OR teacher_id = $3)`,
            [id, req.user.role, req.user.id]
        );
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }
        if (status === 'draft' && quiz.status === 'published' && await isQuizLocked(req.db, id)) {
            return res.status(409).json({
                error: 'This quiz has ended. It stays closed so its results remain as the students took it.',
                code: 'QUIZ_ENDED',
            });
        }

        const changed = quiz.status !== status;
        if (changed) {
            await req.db.run('UPDATE quizzes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
        }

        // Publishing an already published quiz only makes sure every student can open it. The
        // announcement goes out once — it used to be re-sent to the whole class on every save.
        let notified = 0;
        if (status === 'published') {
            notified = await announceQuiz(req.db, id, req.user.id, { notify: changed });
        }

        res.json({ message: changed ? `Quiz ${status} successfully` : `Quiz is already ${status}`, changed, notified });

    } catch (error) {
        console.error('Update quiz status error:', error);
        res.status(500).json({ error: 'Failed to update quiz status' });
    }
});

// Get all quiz results for a student
router.get('/student/results', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can access this endpoint' });
        }

        // Get all quiz results for the student
        const results = await req.db.all(`
            SELECT 
                qs.id,
                qs.quiz_id,
                q.title as quiz_title,
                q.description as quiz_description,
                b.id as batch_id,
                b.name as batch_name,
                q.end_date as end_date,
                COALESCE(qs.total_score, 0)::NUMERIC AS score,
                COALESCE(qs.max_score, 0)::NUMERIC AS max_score,
                CASE 
                    WHEN COALESCE(qs.max_score, 0) > 0 THEN 
                        ROUND((COALESCE(qs.total_score, 0)::NUMERIC * 100.0 / COALESCE(qs.max_score, 1)::NUMERIC), 2)::NUMERIC
                    ELSE 0::NUMERIC 
                END as percentage,
                COALESCE(qs.time_taken_minutes, 0) * 60 as time_taken,
                qs.submitted_at,
                qs.status,
                (
                    SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id
                ) as total_questions,
                NULL AS teacher_feedback,
                (
                    SELECT COUNT(*) 
                    FROM student_answers sa 
                    WHERE sa.submission_id = qs.id AND sa.is_correct = true
                ) as correct_answers,
                u.first_name as teacher_first_name,
                u.last_name as teacher_last_name
            FROM quiz_submissions qs
            JOIN quizzes q ON qs.quiz_id = q.id
            LEFT JOIN users u ON q.teacher_id = u.id
            JOIN quiz_batches qb ON q.id = qb.quiz_id
            JOIN batches b ON qb.batch_id = b.id
            JOIN batch_students bs ON b.id = bs.batch_id
            WHERE qs.student_id = ? 
                AND bs.student_id = ?
                AND (qs.status = 'submitted' OR qs.status = 'auto_submitted' OR qs.status = 'graded')
                AND q.status = 'published'
            ORDER BY qs.submitted_at DESC
        `, [req.user.id, req.user.id]);

        // Map results: lock visibility until quiz end_date has passed
        const now = new Date();
        const mapped = results.map(r => {
            const locked = r.end_date && new Date(r.end_date) > now;
            if (locked) {
                return { ...r, results_locked: true, percentage: null, score: null, max_score: null, correct_answers: null };
            }
            return { ...r, results_locked: false };
        });

        res.json({
            results: mapped
        });

    } catch (error) {
        console.error('Get student results error:', error);
        res.status(500).json({ error: 'Failed to get student results' });
    }
});

// Get quiz results for teachers (batch performance)
router.get('/:id/results', [
    authenticateToken,
    teacherOrAdmin
], async (req, res) => {
    try {
        const { id } = req.params;
        const { batch_id } = req.query;

        // Check if quiz exists and belongs to teacher
        const quiz = await req.db.get(`
            SELECT q.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM quizzes q
            JOIN users u ON q.teacher_id = u.id
            WHERE q.id = $1 AND (q.teacher_id = $2 OR $3 = 'admin')
        `, [id, req.user.id, req.user.role]);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }

        await repairQuizScoresIfStale(req.db, id);

        // Get batch information
        let batchFilter = '';
        let batchParams = [id];

        if (batch_id) {
            batchFilter = 'AND qb.batch_id = $2';
            batchParams.push(batch_id);
        }

        // Get all students in assigned batches
        const studentsQuery = `
            SELECT DISTINCT 
                u.id, u.first_name, u.last_name, u.email,
                b.id as batch_id, b.name as batch_name,
                qs.id as submission_id, qs.status, qs.total_score, qs.max_score, qs.percentage,
                qs.started_at, qs.submitted_at, qs.time_taken_minutes
            FROM users u
            JOIN batch_students bs ON u.id = bs.student_id
            JOIN batches b ON bs.batch_id = b.id
            JOIN quiz_batches qb ON b.id = qb.batch_id
            LEFT JOIN quiz_submissions qs ON qb.quiz_id = qs.quiz_id AND u.id = qs.student_id
            WHERE qb.quiz_id = $1 ${batchFilter}
            AND u.role = 'student'
            ORDER BY b.name, u.first_name, u.last_name
        `;

        const students = await req.db.all(studentsQuery, batchParams);

        // Group by batch
        const batchResults = {};

        for (const student of students) {
            if (!batchResults[student.batch_id]) {
                batchResults[student.batch_id] = {
                    batch_id: student.batch_id,
                    batch_name: student.batch_name,
                    total_students: 0,
                    submitted_count: 0,
                    not_submitted_count: 0,
                    average_score: 0,
                    students: []
                };
            }

            const batch = batchResults[student.batch_id];
            batch.total_students++;

            if (FINISHED_STATUSES.includes(student.status)) {
                batch.submitted_count++;
            } else {
                batch.not_submitted_count++;
            }

            batch.students.push({
                id: student.id,
                name: `${student.first_name} ${student.last_name}`,
                email: student.email,
                submission_id: student.submission_id,
                status: student.status || 'not_started',
                score: student.total_score,
                max_score: student.max_score,
                percentage: student.percentage,
                started_at: student.started_at,
                submitted_at: student.submitted_at,
                time_taken_minutes: student.time_taken_minutes
            });
        }

        // Calculate average scores for each batch
        Object.values(batchResults).forEach(batch => {
            const submittedStudents = batch.students.filter(s => s.percentage !== null);
            if (submittedStudents.length > 0) {
                const totalScore = submittedStudents.reduce((sum, s) => sum + (s.percentage || 0), 0);
                batch.average_score = Math.round(totalScore / submittedStudents.length);
            }
        });

        res.json({
            quiz: quiz,
            batch_results: Object.values(batchResults)
        });

    } catch (error) {
        console.error('Get quiz results error:', error);
        res.status(500).json({ error: 'Failed to get quiz results' });
    }
});

// Per-question statistics for the teacher's results view: how many finished students got each
// question right, average points, and how often each option was picked (distractor analysis).
router.get('/:id/analysis', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await req.db.get(
            `SELECT q.id,
                    (SELECT COUNT(*) FROM quiz_submissions qs WHERE qs.quiz_id = q.id AND qs.status = ANY($4::text[])) AS finished
             FROM quizzes q
             WHERE q.id = $1 AND ($2 = 'admin' OR q.teacher_id = $3)`,
            [id, req.user.role, req.user.id, FINISHED_STATUSES]
        );
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }
        await repairQuizScoresIfStale(req.db, id);
        const finished = Number(quiz.finished) || 0;

        const questions = await req.db.all(
            `SELECT id, question_text, question_type, question_order, marks, correct_answer, audio_clip_id
             FROM questions WHERE quiz_id = $1 ORDER BY question_order`,
            [id]
        );
        const questionIds = questions.map(q => q.id);
        const optionsBy = groupRows(questionIds.length
            ? await req.db.all(
                `SELECT id, question_id, option_text, option_order, is_correct
                 FROM question_options WHERE question_id = ANY($1::int[])
                 ORDER BY question_id, option_order`,
                [questionIds])
            : [], 'question_id');
        const answersBy = groupRows(finished
            ? await req.db.all(
                `SELECT sa.question_id, sa.answer_text, sa.selected_options, sa.marks_awarded, sa.is_correct
                 FROM student_answers sa
                 JOIN quiz_submissions qs ON qs.id = sa.submission_id
                 WHERE qs.quiz_id = $1 AND qs.status = ANY($2::text[])`,
                [id, FINISHED_STATUSES])
            : [], 'question_id');

        const result = questions.map(q => {
            const marks = Number(q.marks) || 0;
            const answers = answersBy.get(Number(q.id)) || [];
            const picks = new Map();
            let yes = 0;
            let no = 0;
            let answered = 0;
            let correct = 0;
            let partial = 0;
            let points = 0;
            for (const a of answers) {
                let selected = [];
                if (a.selected_options) {
                    try { selected = JSON.parse(a.selected_options) || []; } catch { selected = []; }
                    if (!Array.isArray(selected)) selected = [];
                }
                const gaveAnswer = q.question_type === 'yes_no' ? !!a.answer_text : selected.length > 0;
                if (!gaveAnswer) continue;
                answered++;
                if (q.question_type === 'yes_no') {
                    if (a.answer_text === 'yes') yes++;
                    else if (a.answer_text === 'no') no++;
                } else {
                    selected.forEach(optionId => picks.set(Number(optionId), (picks.get(Number(optionId)) || 0) + 1));
                }
                const awarded = Number(a.marks_awarded) || 0;
                points += awarded;
                if (a.is_correct) correct++;
                else if (awarded > 0 && awarded < marks) partial++;
            }
            return {
                id: q.id,
                order: q.question_order,
                question_text: q.question_text,
                question_type: q.question_type,
                marks,
                audio_clip_id: q.audio_clip_id,
                correct_answer: q.correct_answer,
                answered,
                correct,
                partial,
                // Averages are over every finished student: a blank answer earns 0 points.
                avg_points: finished ? Number((points / finished).toFixed(2)) : null,
                correct_rate: finished ? Number(((correct / finished) * 100).toFixed(1)) : null,
                yes_no: q.question_type === 'yes_no' ? { yes, no } : null,
                options: (optionsBy.get(Number(q.id)) || []).map(o => ({
                    id: o.id,
                    option_text: o.option_text,
                    is_correct: !!o.is_correct,
                    picks: picks.get(Number(o.id)) || 0,
                })),
            };
        });

        res.json({ finished, questions: result });
    } catch (error) {
        console.error('Quiz analysis error:', error);
        res.status(500).json({ error: 'Failed to analyse quiz answers' });
    }
});

// Delete quiz
router.delete('/:id', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if quiz exists and user has access
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }

        // Begin transaction for atomic deletion
        await req.db.run('BEGIN TRANSACTION');

        try {
            // Step 1: Delete student answers (depends on submission_id and question_id)
            await req.db.run(`
                DELETE FROM student_answers 
                WHERE submission_id IN (
                    SELECT id FROM quiz_submissions WHERE quiz_id = ?
                )
            `, [id]);

            // Step 2: Delete quiz submissions (depends on quiz_id)
            await req.db.run('DELETE FROM quiz_submissions WHERE quiz_id = ?', [id]);

            // Step 3: Delete question options (depends on question_id)
            await req.db.run(`
                DELETE FROM question_options 
                WHERE question_id IN (
                    SELECT id FROM questions WHERE quiz_id = ?
                )
            `, [id]);

            // Step 4: Delete questions (depends on quiz_id)
            await req.db.run('DELETE FROM questions WHERE quiz_id = ?', [id]);

            // Step 5: Delete quiz batch assignments (depends on quiz_id)
            await req.db.run('DELETE FROM quiz_batches WHERE quiz_id = ?', [id]);

            // Step 6: Finally delete the quiz itself
            await req.db.run('DELETE FROM quizzes WHERE id = ?', [id]);

            // Commit transaction
            await req.db.run('COMMIT');

            res.json({ message: 'Quiz and all related data deleted successfully' });
        } catch (deleteError) {
            // Rollback transaction on error
            await req.db.run('ROLLBACK');
            throw deleteError;
        }
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({ error: 'Failed to delete quiz and related data' });
    }
});

// Submit quiz answers (Students only)
router.post('/:id/submit', [
    authenticateToken,
    authenticated,
    body('answers').isArray({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { id } = req.params;
        const { answers } = req.body;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can submit quiz answers' });
        }

        // Check if student has access to this quiz
        const hasAccess = await req.db.get(`
            SELECT qs.id as submission_id, qs.status
            FROM quiz_submissions qs
            WHERE qs.quiz_id = ? AND qs.student_id = ?
        `, [id, req.user.id]);

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied or quiz not assigned' });
        }

        if (hasAccess.status !== 'assigned') {
            return res.status(400).json({ error: 'Quiz already submitted or graded' });
        }

        const submissionId = hasAccess.submission_id;

        // Save answers
        for (const answer of answers) {
            const { question_id, answer_text, selected_options } = answer;

            await req.db.run(`
                INSERT INTO student_answers (submission_id, question_id, answer_text, selected_options)
                VALUES (?, ?, ?, ?)
                ON CONFLICT (submission_id, question_id)
                DO UPDATE SET 
                  answer_text = EXCLUDED.answer_text,
                  selected_options = EXCLUDED.selected_options,
                  updated_at = CURRENT_TIMESTAMP
            `, [
                submissionId,
                question_id,
                answer_text || null,
                selected_options ? JSON.stringify(selected_options) : null
            ]);
        }

        // Update submission status
        await req.db.run(
            'UPDATE quiz_submissions SET status = ?, submitted_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['submitted', submissionId]
        );

        res.json({ message: 'Quiz submitted successfully' });

    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// Get quiz submissions for grading (Teachers only)
router.get('/:id/submissions', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user has access to this quiz
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }

        await repairQuizScoresIfStale(req.db, id);

        const submissions = await req.db.all(`
            SELECT 
                qs.id, qs.status, qs.submitted_at, qs.graded_at, qs.published_at,
                qs.total_score, qs.max_score, qs.teacher_comments,
                u.id as student_id, u.first_name, u.last_name, u.email
            FROM quiz_submissions qs
            JOIN users u ON qs.student_id = u.id
            WHERE qs.quiz_id = ?
            ORDER BY qs.submitted_at DESC, u.first_name, u.last_name
        `, [id]);

        res.json(submissions);
    } catch (error) {
        console.error('Get quiz submissions error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz submissions' });
    }
});

// Get specific submission for grading
router.get('/:id/submissions/:submissionId', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id, submissionId } = req.params;

        // Check access
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }

        await repairQuizScoresIfStale(req.db, id);

        // Get submission details
        const submission = await req.db.get(`
            SELECT 
                qs.*, u.first_name, u.last_name, u.email
            FROM quiz_submissions qs
            JOIN users u ON qs.student_id = u.id
            WHERE qs.id = ? AND qs.quiz_id = ?
        `, [submissionId, id]);

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        // Get questions with student answers
        const questions = await req.db.all(`
            SELECT 
                q.id, q.question_text, q.question_type, q.marks, q.correct_answer, q.audio_clip_id,
                sa.answer_text, sa.selected_options, sa.marks_awarded as score,
                sa.is_correct
            FROM questions q
            LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.submission_id = ?
            WHERE q.quiz_id = ?
            ORDER BY q.question_order
        `, [submissionId, id]);

        // Options for every MCQ question in one query (it used to be one query per question).
        const mcqIds = questions.filter(q => isMcqType(q.question_type)).map(q => q.id);
        const optionsByQuestion = groupRows(mcqIds.length
            ? await req.db.all(
                `SELECT id, question_id, option_text, option_order, is_correct
                 FROM question_options
                 WHERE question_id = ANY($1::int[])
                 ORDER BY question_id, option_order`,
                [mcqIds])
            : [], 'question_id');
        for (const question of questions) {
            // Coerce numeric types immediately
            if (question.audio_clip_id != null) question.audio_clip_id = Number(question.audio_clip_id);
            if (question.marks != null) question.marks = Number(question.marks);
            if (question.score != null) question.score = Number(question.score);

            if (isMcqType(question.question_type)) {
                question.options = (optionsByQuestion.get(Number(question.id)) || [])
                    .map(o => ({ id: o.id, option_text: o.option_text, option_order: o.option_order, is_correct: o.is_correct }));
                if (question.selected_options) {
                    try {
                        question.selected_options = JSON.parse(question.selected_options);
                    } catch (e) {
                        question.selected_options = [];
                    }
                }
            }
        }

        // Get audio clips for this quiz
        const audioClips = await req.db.all(`
            SELECT id, transcript, voice_name, source_type, kdrive_file_id,
                   file_name, duration_seconds, audio_order, max_plays,
                   (kdrive_file_id IS NOT NULL) as has_audio
            FROM quiz_audio_clips
            WHERE quiz_id = ?
            ORDER BY audio_order
        `, [id]);

        // Coerce PostgreSQL types
        for (const clip of audioClips) {
            clip.has_audio = !!clip.has_audio;
            if (clip.audio_order != null) clip.audio_order = Number(clip.audio_order);
            if (clip.max_plays != null) clip.max_plays = Number(clip.max_plays);
            if (clip.duration_seconds != null) clip.duration_seconds = Number(clip.duration_seconds);
        }

        res.json({
            ...submission,
            questions,
            audio_clips: audioClips
        });
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
});

// Grade submission (Teachers only)
router.post('/:id/submissions/:submissionId/grade', [
    authenticateToken,
    teacherOrAdmin,
    body('grades').isArray({ min: 1 }),
    body('teacher_comments').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { id, submissionId } = req.params;
        const { grades, teacher_comments } = req.body;

        // Check access
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }

        // Update individual question scores
        let totalScore = 0;
        for (const grade of grades) {
            const { question_id, score, teacher_feedback } = grade;

            await req.db.run(`
                UPDATE student_answers 
                SET score = ?, teacher_feedback = ?, updated_at = CURRENT_TIMESTAMP
                WHERE submission_id = ? AND question_id = ?
            `, [score || 0, teacher_feedback || null, submissionId, question_id]);

            totalScore += (score || 0);
        }

        // Update submission with total score and status
        await req.db.run(`
            UPDATE quiz_submissions 
            SET total_score = ?, teacher_comments = ?, status = 'graded', 
                graded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [totalScore, teacher_comments || null, submissionId]);

        res.json({ message: 'Submission graded successfully' });

    } catch (error) {
        console.error('Grade submission error:', error);
        res.status(500).json({ error: 'Failed to grade submission' });
    }
});

// Publish grades (Teachers only)
router.post('/:id/submissions/:submissionId/publish', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id, submissionId } = req.params;

        // Check access
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }

        // Update submission status to published
        const result = await req.db.run(`
            UPDATE quiz_submissions 
            SET status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND status = 'graded'
        `, [submissionId]);

        if (result.changes === 0) {
            return res.status(400).json({ error: 'Submission not found or not graded yet' });
        }

        // Fire in-app notification to the student (non-blocking)
        try {
            const { notifyUsers } = require('../services/notificationService');
            const sub = await req.db.get(
                `SELECT qs.id, qs.student_id, qs.quiz_id, q.title
                 FROM quiz_submissions qs
                 JOIN quizzes q ON qs.quiz_id = q.id
                 WHERE qs.id = ?`,
                [submissionId]
            );
            if (sub) {
                await notifyUsers(req.db, [sub.student_id], {
                    type: 'grade_published',
                    title: `Your grade is ready: ${sub.title}`,
                    body: 'Your teacher has published the grade for your quiz.',
                    link_path: `/app/my-results?focus=${sub.id}`,
                    entity_type: 'quiz_submission',
                    entity_id: sub.id,
                    actor_user_id: req.user.id,
                });
            }
        } catch (notifyErr) {
            console.error('Notification failed (grade_published):', notifyErr.message);
        }

        res.json({ message: 'Grades published successfully' });

    } catch (error) {
        console.error('Publish grades error:', error);
        res.status(500).json({ error: 'Failed to publish grades' });
    }
});

// Get student's quiz results
router.get('/:id/result', authenticateToken, authenticated, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can view quiz results' });
        }

        let result = await req.db.get(`
            SELECT 
                qs.id, qs.status, qs.submitted_at, qs.published_at,
                qs.total_score, qs.max_score, qs.teacher_comments,
                q.title as quiz_title
            FROM quiz_submissions qs
            JOIN quizzes q ON qs.quiz_id = q.id
            WHERE qs.quiz_id = ? AND qs.student_id = ?
        `, [id, req.user.id]);

        if (!result) {
            return res.status(404).json({ error: 'Quiz result not found' });
        }

        if (result.status !== 'published') {
            return res.status(400).json({ error: 'Results not yet published' });
        }

        const repaired = await repairQuizScoresIfStale(req.db, id);
        if (repaired) {
            result = await req.db.get(`
                SELECT
                    qs.id, qs.status, qs.submitted_at, qs.published_at,
                    qs.total_score, qs.max_score, qs.teacher_comments,
                    q.title as quiz_title
                FROM quiz_submissions qs
                JOIN quizzes q ON qs.quiz_id = q.id
                WHERE qs.quiz_id = ? AND qs.student_id = ?
            `, [id, req.user.id]);
        }

        // Get question-wise results
        const questions = await req.db.all(`
            SELECT 
                q.id, q.question_text, q.question_type, q.marks,
                sa.marks_awarded as score, sa.teacher_feedback
            FROM questions q
            LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.submission_id = ?
            WHERE q.quiz_id = ?
            ORDER BY q.question_order
        `, [result.id, id]);

        res.json({
            ...result,
            questions
        });

    } catch (error) {
        console.error('Get quiz result error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz result' });
    }
});

// Student dashboard - get all quizzes for student's batches
router.get('/student/dashboard', authenticateToken, async (req, res) => {
    try {
        await autoSubmitExpiredSubmissions(req.db);
        
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can access this endpoint' });
        }

        // Get student's batches with optional quizzes (include batches even if no quizzes)
        const batchesWithQuizzes = await req.db.all(`
            SELECT DISTINCT
                b.id as batch_id, b.name as batch_name, b.description,
                q.id as quiz_id, q.title, q.description as quiz_description,
                q.start_date, q.end_date, q.duration_minutes, q.total_marks,
                q.status as quiz_status,
                qs.id as submission_id, qs.status as submission_status,
                qs.score, qs.submitted_at, qs.time_taken_minutes
            FROM batches b
            JOIN batch_students bs ON b.id = bs.batch_id
            LEFT JOIN quiz_batches qb ON b.id = qb.batch_id
            LEFT JOIN quizzes q ON qb.quiz_id = q.id AND q.status = 'published'
            LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id AND qs.student_id = ?
            WHERE bs.student_id = ?
            ORDER BY b.name, q.created_at DESC
        `, [req.user.id, req.user.id]);

        // Group by batch
        const batches = {};

        for (const row of batchesWithQuizzes) {
            if (!batches[row.batch_id]) {
                batches[row.batch_id] = {
                    id: row.batch_id,
                    name: row.batch_name,
                    description: row.description,
                    quizzes: []
                };
            }

            if (row.quiz_id) {
                const now = new Date();
                const startDate = row.start_date ? new Date(row.start_date) : null;
                const endDate = row.end_date ? new Date(row.end_date) : null;

                let accessibility = {
                    accessible: true,
                    reason: null
                };

                if (startDate && now < startDate) {
                    accessibility = {
                        accessible: false,
                        reason: 'Quiz has not started yet'
                    };
                } else if (endDate && now > endDate) {
                    accessibility = {
                        accessible: false,
                        reason: 'Quiz has ended'
                    };
                }

                batches[row.batch_id].quizzes.push({
                    id: row.quiz_id,
                    title: row.title,
                    description: row.quiz_description,
                    start_date: row.start_date,
                    end_date: row.end_date,
                    duration_minutes: row.duration_minutes,
                    total_marks: row.total_marks,
                    submission_status: row.submission_status || 'not_started',
                    score: row.score,
                    percentage: row.score && row.total_marks ?
                        Math.round((row.score / row.total_marks) * 100) : null,
                    submitted_at: row.submitted_at,
                    time_taken_minutes: row.time_taken_minutes,
                    accessibility: accessibility
                });
            }
        }

        res.json({
            batches: Object.values(batches)
        });

    } catch (error) {
        console.error('Student dashboard error:', error);
        res.status(500).json({ error: 'Failed to get student dashboard' });
    }
});

// Student quiz results
router.get('/:id/student-results', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can access this endpoint' });
        }

        // Get quiz details
        const quiz = await req.db.get(`
            SELECT q.id, q.title, q.description, q.total_marks, q.duration_minutes, q.end_date as end_date
            FROM quizzes q
            JOIN quiz_batches qb ON q.id = qb.quiz_id
            JOIN batch_students bs ON qb.batch_id = bs.batch_id
            WHERE q.id = ? AND bs.student_id = ? AND q.status = 'published'
        `, [id, req.user.id]);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }

        // Gate results until the quiz end_date has passed
        const now = new Date();
        if (quiz.end_date && new Date(quiz.end_date) > now) {
            return res.status(403).json({ error: 'Results are locked until the quiz end date' });
        }

        // Get student's submission
        const submission = await req.db.get(`
            SELECT * FROM quiz_submissions
            WHERE quiz_id = ? AND student_id = ?
        `, [id, req.user.id]);

        if (!submission || !FINISHED_STATUSES.includes(submission.status)) {
            return res.status(400).json({ error: 'Quiz not submitted yet' });
        }

        const repaired = await repairQuizScoresIfStale(req.db, id);
        if (repaired) {
            Object.assign(submission, await req.db.get(
                'SELECT * FROM quiz_submissions WHERE id = ?',
                [submission.id]
            ));
        }

        // Get detailed results
        const results = await req.db.all(`
            SELECT 
                q.id, q.question_text, q.question_type, q.marks, q.correct_answer, q.audio_clip_id,
                sa.answer_text, sa.selected_options, sa.is_correct,
                sa.marks_awarded as score, NULL as teacher_feedback
            FROM questions q
            LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.submission_id = ?
            WHERE q.quiz_id = ?
            ORDER BY q.question_order
        `, [submission.id, id]);

        // Get options for MCQ questions and compute derived fields
        for (let question of results) {
            if (question.question_type && (question.question_type === 'mcq_single' || question.question_type === 'mcq_multiple')) {
                const options = await req.db.all(`
                    SELECT id, option_text, is_correct
                    FROM question_options
                    WHERE question_id = ?
                    ORDER BY id
                `, [question.id]);
                question.options = options;
                let selectedIds = [];
                if (question.selected_options) {
                    try { selectedIds = JSON.parse(question.selected_options) || []; } catch (e) { selectedIds = []; }
                }
                const selectedTexts = options.filter(o => selectedIds.includes(o.id)).map(o => o.option_text);
                const correctTexts = options.filter(o => o.is_correct).map(o => o.option_text);
                question.student_answer = selectedTexts.join(', ');
                question.correct_answer = correctTexts.join(', ');
            } else if (question.question_type === 'yes_no') {
                question.student_answer = question.answer_text || null;
            }
            question.points = question.marks;
            // Coerce numeric fields
            if (question.audio_clip_id != null) question.audio_clip_id = Number(question.audio_clip_id);
            if (question.marks != null) question.marks = Number(question.marks);
            if (question.score != null) question.score = Number(question.score);
            if (question.points != null) question.points = Number(question.points);
        }

        const computedPercentage = (submission.max_score && submission.max_score > 0)
            ? Math.round((Number(submission.total_score || 0) / Number(submission.max_score)) * 100)
            : 0;

        // Get audio clips for this quiz (safe version for students)
        const audioClips = await req.db.all(`
            SELECT id, duration_seconds, audio_order, max_plays,
                   (kdrive_file_id IS NOT NULL) as has_audio
            FROM quiz_audio_clips
            WHERE quiz_id = ?
            ORDER BY audio_order
        `, [id]);

        // Coerce PostgreSQL types
        for (const clip of audioClips) {
            clip.has_audio = !!clip.has_audio;
            if (clip.audio_order != null) clip.audio_order = Number(clip.audio_order);
            if (clip.max_plays != null) clip.max_plays = Number(clip.max_plays);
            if (clip.duration_seconds != null) clip.duration_seconds = Number(clip.duration_seconds);
        }

        res.json({
            quiz: quiz,
            submission: {
                id: submission.id,
                status: submission.status,
                score: submission.total_score || 0,
                max_score: submission.max_score || 0,
                percentage: computedPercentage,
                submitted_at: submission.submitted_at,
                time_taken: (submission.time_taken_minutes || 0) * 60,
                teacher_feedback: submission.teacher_comments || null
            },
            questions: results,
            audio_clips: audioClips
        });

    } catch (error) {
        console.error('Student results error:', error);
        res.status(500).json({ error: 'Failed to get student results' });
    }
});



// Get quizzes for a specific teacher
router.get('/teacher/:teacherId', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        await autoSubmitExpiredSubmissions(req.db);
        
        const { teacherId } = req.params;

        // Check if user can access this teacher's quizzes
        if (req.user.role === 'teacher' && parseInt(teacherId) !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const quizzes = await req.db.all(`
            SELECT 
                q.id, q.title, q.description, q.status, q.start_date, q.end_date,
                q.duration_minutes, q.total_marks, q.created_at, q.updated_at,
                COUNT(DISTINCT qb.batch_id) as batch_count,
                COUNT(DISTINCT CASE WHEN qs.status IN ('submitted','auto_submitted','graded') THEN qs.id END) as submissions_count,
                (
                    SELECT COUNT(*) 
                    FROM questions 
                    WHERE quiz_id = q.id
                ) as total_questions,
                CASE 
                    WHEN q.status = 'published' AND (q.start_date IS NULL OR q.start_date <= NOW())
                     AND (q.end_date IS NULL OR q.end_date >= NOW()) THEN 1
                    ELSE 0
                END as is_active
            FROM quizzes q
            LEFT JOIN quiz_batches qb ON q.id = qb.quiz_id
            LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id
            WHERE q.teacher_id = ?
            GROUP BY q.id, q.title, q.description, q.status, q.start_date, q.end_date, q.duration_minutes, q.total_marks, q.created_at, q.updated_at
            ORDER BY q.created_at DESC
        `, [teacherId]);

        // Batch names for every quiz in one query (was one query per quiz)
        const quizIds = quizzes.map(q => q.id);
        const nameRows = quizIds.length ? await req.db.all(`
            SELECT qb.quiz_id, string_agg(b.name, ', ' ORDER BY b.name) AS batch_name
            FROM quiz_batches qb
            JOIN batches b ON b.id = qb.batch_id
            WHERE qb.quiz_id = ANY($1::int[])
            GROUP BY qb.quiz_id
        `, [quizIds]) : [];
        const batchNameOf = new Map(nameRows.map(r => [Number(r.quiz_id), r.batch_name]));

        // Coerce numeric/boolean types for each quiz
        for (let quiz of quizzes) {
            quiz.batch_name = batchNameOf.get(Number(quiz.id)) || '';

            // Coerce numeric fields that Postgres may return as strings
            quiz.batch_count = quiz.batch_count != null ? Number(quiz.batch_count) : 0;
            quiz.submissions_count = quiz.submissions_count != null ? Number(quiz.submissions_count) : 0;
            quiz.total_questions = quiz.total_questions != null ? Number(quiz.total_questions) : 0;
            if (quiz.duration_minutes != null) quiz.duration_minutes = Number(quiz.duration_minutes);
            if (quiz.total_marks != null) quiz.total_marks = Number(quiz.total_marks);
            // Convert is_active 1/0 -> boolean
            quiz.is_active = !!Number(quiz.is_active);
        }

        res.json({ data: quizzes });
    } catch (error) {
        console.error('Get teacher quizzes error:', error);
        res.status(500).json({ error: 'Failed to fetch teacher quizzes' });
    }
});

module.exports = router;
