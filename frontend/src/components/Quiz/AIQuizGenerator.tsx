import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Input, InputNumber, Modal, Segmented, Skeleton } from 'antd';
import {
    ArrowLeftOutlined, CheckOutlined, CloseOutlined, ExclamationCircleOutlined, InfoCircleOutlined, LoadingOutlined, ReloadOutlined,
    SafetyCertificateOutlined, ThunderboltOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { TYPE_META, fmtNumber, plural, questionFromGenerated, questionIssues } from './quizModel';
import type { DraftQuestion, QuestionType } from './quizModel';
import '../Teacher/Teacher.css';
import './Quiz.css';

/* ══════════════════════════════════════════
   AI QUESTION GENERATOR — brief → generate → review → add.
   Left: the brief. Right: a live blueprint of what will be generated.
   Nothing reaches the quiz until the teacher has seen it.
══════════════════════════════════════════ */

interface Props {
    open: boolean;
    onClose: () => void;
    onAdd: (questions: DraftQuestion[], meta: { title?: string; description?: string }) => void;
    defaultPoints?: number;
}

type Mix = 'balanced' | 'single' | 'custom';
type Step = 'setup' | 'generating' | 'review';
type Difficulty = 'accessible' | 'balanced' | 'demanding';
type Language = 'fr' | 'en';
type Scoring = 'weighted' | 'equal';
type Split = { single: number; multiple: number; yesNo: number };

const PROMPT_MAX = 900;
const COUNT_CHIPS = [5, 10, 15, 20];
const LETTERS = 'ABCDEFGHIJ';

const LEVELS: { value: string | null; name: string; hint: string }[] = [
    { value: null, name: 'Any', hint: 'Mixed' },
    { value: 'A1', name: 'A1', hint: 'Beginner' },
    { value: 'A2', name: 'A2', hint: 'Elementary' },
    { value: 'B1', name: 'B1', hint: 'Intermediate' },
    { value: 'B2', name: 'B2', hint: 'Upper-int.' },
    { value: 'C1', name: 'C1', hint: 'Advanced' },
    { value: 'C2', name: 'C2', hint: 'Proficient' },
];
const LEVEL_WORD: Record<string, string> = { A1: 'beginner', A2: 'elementary', B1: 'intermediate', B2: 'upper-intermediate', C1: 'advanced', C2: 'proficient' };

const DIFFICULTY: Record<Difficulty, { label: string; prompt: string }> = {
    accessible: { label: 'Accessible', prompt: 'Overall difficulty: lean towards accessible questions — common vocabulary, clear contexts, one idea per question.' },
    balanced: { label: 'Balanced', prompt: '' },
    demanding: { label: 'Demanding', prompt: 'Overall difficulty: lean towards demanding questions — subtle distinctions, exceptions, less common forms and very plausible distractors.' },
};

const STARTERS = [
    { kind: 'Grammar', title: 'Passé composé: être or avoir', prompt: 'The passé composé with être and avoir, including agreement of the past participle' },
    { kind: 'Grammar', title: 'Subjunctive after doubt and wishes', prompt: 'The subjunctive after expressions of doubt, wish and necessity' },
    { kind: 'Grammar', title: 'Negation beyond ne…pas', prompt: 'Negation: ne…pas, ne…jamais, ne…rien, ne…personne and ne…plus' },
    { kind: 'Vocabulary', title: 'Food and restaurants', prompt: 'Vocabulary for food, cooking and ordering at a restaurant' },
    { kind: 'Vocabulary', title: 'Work and the office', prompt: 'Workplace vocabulary: jobs, meetings, emails and schedules' },
    { kind: 'Reading', title: 'Short text on city life', prompt: 'Reading comprehension: each question quotes a short passage about city life and asks about it' },
];

const TYPES: { key: keyof Split; type: QuestionType; tone: string; hint: string }[] = [
    { key: 'single', type: 'mcq_single', tone: 'is-single', hint: 'One correct answer' },
    { key: 'multiple', type: 'mcq_multiple', tone: 'is-multiple', hint: 'Several correct answers' },
    { key: 'yesNo', type: 'yes_no', tone: 'is-yesno', hint: 'Quick checks' },
];

const splitCounts = (count: number, mix: Mix, custom: Split): Split => {
    if (mix === 'custom') return custom;
    if (mix === 'single') return { single: count, multiple: 0, yesNo: 0 };
    const single = Math.max(1, Math.round(count * 0.5));
    const multiple = Math.min(count - single, Math.round(count * 0.3));
    return { single, multiple, yesNo: Math.max(0, count - single - multiple) };
};
const clamp = (v: unknown, min: number, max: number, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

const AIQuizGenerator: React.FC<Props> = ({ open, onClose, onAdd, defaultPoints = 1 }) => {
    const { apiCall } = useAuth();
    const [step, setStep] = useState<Step>('setup');

    const [prompt, setPrompt] = useState('');
    const [level, setLevel] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState<Difficulty>('balanced');
    const [language, setLanguage] = useState<Language>('fr');
    const [count, setCount] = useState(10);
    const [mix, setMix] = useState<Mix>('balanced');
    const [custom, setCustom] = useState<Split>({ single: 5, multiple: 3, yesNo: 2 });
    const [scoring, setScoring] = useState<Scoring>('weighted');
    const [points, setPoints] = useState(Math.max(1, Math.round(10 * defaultPoints)));
    const [pointsTouched, setPointsTouched] = useState(false);
    const [perQuestion, setPerQuestion] = useState(defaultPoints);

    const [error, setError] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [generated, setGenerated] = useState<DraftQuestion[]>([]);
    const [meta, setMeta] = useState<{ title?: string; description?: string }>({});
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const abortRef = useRef<AbortController | null>(null);

    const split = splitCounts(count, mix, custom);
    const total = split.single + split.multiple + split.yesNo;
    const totalPoints = scoring === 'weighted' ? points : total * perQuestion;
    const promptText = prompt.trim();

    const blockReason = promptText.length < 8
        ? 'Describe what the questions should test to continue.'
        : total < 1 ? 'Add at least one question to the mix.'
            : total > 50 ? 'Generate at most 50 questions at a time.'
                : scoring === 'weighted' && (points < 1 || points > 500) ? 'Total points must be between 1 and 500.'
                    : null;
    const canGenerate = blockReason === null;

    useEffect(() => { if (!pointsTouched) setPoints(Math.max(1, Math.round(total * defaultPoints))); }, [total, defaultPoints, pointsTouched]);
    useEffect(() => () => abortRef.current?.abort(), []);
    useEffect(() => {
        if (step !== 'generating') return;
        setElapsed(0);
        const started = Date.now();
        const id = window.setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);
        return () => window.clearInterval(id);
    }, [step]);

    /** The teacher's brief plus the settings, as plain sentences inside the service's instruction block. */
    const composedPrompt = () => [
        promptText.slice(0, PROMPT_MAX),
        level ? `Target CEFR level: ${level} (${LEVEL_WORD[level]}).` : '',
        DIFFICULTY[difficulty].prompt,
        language === 'fr'
            ? 'Write the questions and the answer options in French.'
            : 'Write the question instructions in English; keep the French being tested (words, sentences, forms) in French.',
    ].filter(Boolean).join('\n');

    const generate = async () => {
        if (!canGenerate) return;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setError(null);
        setStep('generating');
        try {
            const res = await apiCall('/quizzes/ai-generate', {
                method: 'POST',
                signal: controller.signal,
                body: JSON.stringify({
                    totalQuestions: total,
                    singleChoiceCount: split.single,
                    multipleChoiceCount: split.multiple,
                    yesNoCount: split.yesNo,
                    // The API wants a whole number; with equal scoring the points are set per question afterwards.
                    totalPoints: Math.min(500, Math.max(1, Math.round(totalPoints))),
                    userPrompt: composedPrompt(),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'The questions could not be generated.');
            let questions: DraftQuestion[] = (Array.isArray(data?.questions) ? data.questions : []).map(questionFromGenerated);
            if (!questions.length) throw new Error('The AI returned no usable questions. Try a more specific description.');
            if (scoring === 'equal') questions = questions.map(q => ({ ...q, points: perQuestion }));
            setGenerated(questions);
            // Questions with problems start unticked so they can't slip in unnoticed.
            setSelected(new Set(questions.filter(q => !questionIssues(q).length).map(q => q.key)));
            setMeta({ title: data?.title, description: data?.description });
            setStep('review');
        } catch (e: any) {
            if (e?.name === 'AbortError') { setStep('setup'); return; }
            setError(e?.message || 'The questions could not be generated.');
            setStep(generated.length ? 'review' : 'setup');
        }
    };

    const cancel = () => { abortRef.current?.abort(); setStep(generated.length ? 'review' : 'setup'); };
    const close = () => { abortRef.current?.abort(); onClose(); };

    const chosen = useMemo(() => generated.filter(q => selected.has(q.key)), [generated, selected]);
    const chosenPoints = chosen.reduce((s, q) => s + (Number(q.points) || 0), 0);
    const toggle = (key: string) => setSelected(s => { const next = new Set(s); if (next.has(key)) next.delete(key); else next.add(key); return next; });

    const setTypeCount = (key: keyof Split, value: unknown) => {
        setCustom({ ...split, [key]: clamp(value, 0, 30, 0) });
        setMix('custom');
    };
    const studentMinutes = [Math.max(1, Math.round(total * 0.8)), Math.max(2, Math.round(total * 1.5))];
    const levelInfo = LEVELS.find(l => l.value === level) ?? LEVELS[0];

    return (
        <Modal open={open} onCancel={close} footer={null} closable={false} title={null} width="min(1000px, calc(100vw - 24px))"
            wrapClassName="tc-modal qz-modal" styles={{ body: { padding: 0 } }} maskClosable={step !== 'generating'} destroyOnHidden centered>
            <div className="qz-mod qz-ai">
                <header className="qz-mod-head">
                    <span className="qz-mod-ic is-ai"><ThunderboltOutlined /></span>
                    <div>
                        <h2>Generate questions with AI</h2>
                        <p>{step === 'review' ? 'Check each question and its answer key, then add the ones you want.' : 'Write a short brief. You review every question before it is added to the quiz.'}</p>
                    </div>
                    <ol className="qz-ai-steps" aria-label="Progress">
                        <li className={step === 'review' ? 'is-done' : 'is-on'}><span>{step === 'review' ? <CheckOutlined /> : 1}</span>Brief</li>
                        <li className={step === 'review' ? 'is-on' : ''}><span>2</span>Review</li>
                    </ol>
                    <Button type="text" icon={<CloseOutlined />} onClick={close} aria-label="Close" />
                </header>

                {/* ═════════ Brief ═════════ */}
                {step === 'setup' && (
                    <div className="qz-mod-body qz-ai-setup">
                        <div className="qz-ai-form">
                            <section className="qz-ai-sec">
                                <div className="qz-label-row">
                                    <label htmlFor="qz-ai-prompt">What should the questions test?</label>
                                    <span id="qz-ai-prompt-count" className={`qz-count${prompt.length > PROMPT_MAX * 0.9 ? ' is-near' : ''}`}>{prompt.length} / {PROMPT_MAX}</span>
                                </div>
                                <div className="qz-composer">
                                    <Input.TextArea id="qz-ai-prompt" aria-describedby="qz-ai-prompt-count" variant="borderless" autoFocus
                                        autoSize={{ minRows: 3, maxRows: 8 }} maxLength={PROMPT_MAX} value={prompt}
                                        placeholder="E.g. The passé composé of pronominal verbs, using sentences about a daily routine"
                                        onChange={e => setPrompt(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); generate(); } }} />
                                    <div className="qz-composer-foot">Name the grammar point, theme or skill — the more specific the brief, the better the questions.</div>
                                </div>
                                <div className="qz-starters">
                                    <span className="qz-starters-label">Or start from</span>
                                    <div className="qz-starters-list">
                                        {STARTERS.map(s => (
                                            <button key={s.title} type="button" className={`qz-starter${prompt === s.prompt ? ' is-on' : ''}`} onClick={() => setPrompt(s.prompt)}>
                                                <em>{s.kind}</em>{s.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="qz-ai-sec">
                                <span className="qz-ai-label" id="qz-ai-level">Level <em>CEFR</em></span>
                                <div className="qz-levels" role="radiogroup" aria-labelledby="qz-ai-level">
                                    {LEVELS.map(l => (
                                        <button key={l.name} type="button" role="radio" aria-checked={level === l.value}
                                            className={`qz-level${level === l.value ? ' is-on' : ''}`} onClick={() => setLevel(l.value)}>
                                            <strong>{l.name}</strong><em>{l.hint}</em>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <div className="qz-ai-pair">
                                <section className="qz-ai-sec">
                                    <span className="qz-ai-label">Difficulty</span>
                                    <Segmented<Difficulty> block value={difficulty} onChange={setDifficulty}
                                        options={(Object.keys(DIFFICULTY) as Difficulty[]).map(d => ({ value: d, label: DIFFICULTY[d].label }))} />
                                </section>
                                <section className="qz-ai-sec">
                                    <span className="qz-ai-label">Questions written in</span>
                                    <Segmented<Language> block value={language} onChange={setLanguage}
                                        options={[{ value: 'fr', label: 'French' }, { value: 'en', label: 'English' }]} />
                                </section>
                            </div>

                            <section className="qz-ai-sec">
                                <div className="qz-ai-head">
                                    <span className="qz-ai-label">Questions</span>
                                    <Segmented<Mix> size="small" value={mix} onChange={v => { if (v === 'custom') setCustom(split); setMix(v); }}
                                        options={[{ value: 'balanced', label: 'Balanced mix' }, { value: 'single', label: 'Single choice' }, { value: 'custom', label: 'Custom' }]} />
                                </div>
                                <div className="qz-ai-count">
                                    <InputNumber min={1} max={30} value={mix === 'custom' ? total : count} disabled={mix === 'custom'} aria-label="Number of questions"
                                        onChange={v => setCount(clamp(v, 1, 30, 1))} />
                                    <span className="qz-chips">
                                        {COUNT_CHIPS.map(n => (
                                            <button key={n} type="button" className={`qz-chip is-btn${mix !== 'custom' && count === n ? ' is-on' : ''}`}
                                                onClick={() => { setCount(n); if (mix === 'custom') setMix('balanced'); }}>{n}</button>
                                        ))}
                                    </span>
                                    {mix === 'custom' && <span className="qz-hint">Total comes from the counts below.</span>}
                                </div>
                                <div className="qz-types">
                                    {TYPES.map(t => (
                                        <label key={t.key} className={`qz-type ${t.tone}${split[t.key] ? '' : ' is-zero'}`}>
                                            <i className="qz-type-swatch" aria-hidden />
                                            <span className="qz-type-text"><strong>{TYPE_META[t.type].label}</strong><em>{t.hint}</em></span>
                                            <InputNumber size="small" min={0} max={30} value={split[t.key]} onChange={v => setTypeCount(t.key, v)} aria-label={`${TYPE_META[t.type].label} questions`} />
                                        </label>
                                    ))}
                                </div>
                            </section>

                            <section className="qz-ai-sec">
                                <div className="qz-ai-head">
                                    <span className="qz-ai-label">Scoring</span>
                                    <Segmented<Scoring> size="small" value={scoring} onChange={setScoring}
                                        options={[{ value: 'weighted', label: 'Weighted by difficulty' }, { value: 'equal', label: 'Equal points' }]} />
                                </div>
                                {scoring === 'weighted' ? (
                                    <div className="qz-ai-score">
                                        <InputNumber min={1} max={500} value={points} addonAfter="pts in total" aria-label="Total points"
                                            onChange={v => { setPointsTouched(true); setPoints(clamp(v, 1, 500, 1)); }} />
                                        <span className="qz-hint">Harder questions get a bigger share — about {fmtNumber(points / Math.max(1, total))} per question on average.</span>
                                    </div>
                                ) : (
                                    <div className="qz-ai-score">
                                        <InputNumber min={0.5} max={20} step={0.5} value={perQuestion} addonAfter="pts each" aria-label="Points per question"
                                            onChange={v => setPerQuestion(clamp(v, 0.5, 20, 1))} />
                                        <span className="qz-hint">{fmtNumber(total * perQuestion)} points in total.</span>
                                    </div>
                                )}
                            </section>

                            {error && <div className="tc-alert" role="alert"><WarningOutlined /><span>{error}</span></div>}
                        </div>

                        {/* Live blueprint */}
                        <aside className="qz-ai-blueprint" aria-label="What will be generated">
                            <span className="qz-eyebrow">Blueprint</span>
                            <p className={`qz-bp-topic${promptText ? '' : ' is-empty'}`}>{promptText || 'Your brief will appear here.'}</p>
                            <div className="qz-bp-stats">
                                <div><strong>{total}</strong><span>{total === 1 ? 'question' : 'questions'}</span></div>
                                <div><strong>{fmtNumber(totalPoints)}</strong><span>points</span></div>
                                <div><strong>{levelInfo.name}</strong><span>{level ? levelInfo.hint.toLowerCase() : 'level'}</span></div>
                            </div>
                            <div className="qz-bp-bar" aria-hidden>
                                {TYPES.map(t => split[t.key] > 0 && <i key={t.key} className={t.tone} style={{ flexGrow: split[t.key] }} />)}
                            </div>
                            <ul className="qz-bp-legend">
                                {TYPES.map(t => (
                                    <li key={t.key} className={`${t.tone}${split[t.key] ? '' : ' is-zero'}`}><i aria-hidden />{TYPE_META[t.type].label}<b>{split[t.key]}</b></li>
                                ))}
                            </ul>
                            <dl className="qz-bp-facts">
                                <div><dt>Difficulty</dt><dd>{DIFFICULTY[difficulty].label}</dd></div>
                                <div><dt>Language</dt><dd>{language === 'fr' ? 'French' : 'English instructions'}</dd></div>
                                <div><dt>Scoring</dt><dd>{scoring === 'weighted' ? 'By difficulty' : `${fmtNumber(perQuestion)} pt${perQuestion === 1 ? '' : 's'} each`}</dd></div>
                                <div><dt>Student time</dt><dd>≈ {studentMinutes[0]}–{studentMinutes[1]} min</dd></div>
                            </dl>
                            <p className="qz-bp-note"><SafetyCertificateOutlined /> Nothing is added until you have reviewed each question and its answer.</p>
                        </aside>
                    </div>
                )}

                {/* ═════════ Generating ═════════ */}
                {step === 'generating' && (
                    <div className="qz-mod-body qz-ai-wait" aria-live="polite">
                        <div className="qz-ai-wait-card">
                            <span className="qz-ai-spinner"><LoadingOutlined /></span>
                            <div>
                                <strong>Writing {plural(total, 'question')}…</strong>
                                <em>{elapsed} s elapsed · this usually takes 10 to 30 seconds</em>
                            </div>
                        </div>
                        <p className="qz-ai-wait-brief">“{promptText}” · {level ? `${level} level` : 'any level'} · {fmtNumber(totalPoints)} pts</p>
                        {[0, 1, 2].map(i => <div key={i} className="qz-ai-ghost"><Skeleton active title={{ width: '70%' }} paragraph={{ rows: 3, width: ['40%', '55%', '35%'] }} /></div>)}
                    </div>
                )}

                {/* ═════════ Review ═════════ */}
                {step === 'review' && (
                    <div className="qz-mod-body qz-ai-review">
                        {error && <div className="tc-alert" role="alert"><WarningOutlined /><span>{error}</span></div>}
                        <div className="qz-ai-review-head">
                            <Checkbox checked={selected.size === generated.length} indeterminate={selected.size > 0 && selected.size < generated.length}
                                onChange={e => setSelected(e.target.checked ? new Set(generated.map(q => q.key)) : new Set())}>
                                {selected.size} of {generated.length} selected
                            </Checkbox>
                            {meta.title && <span className="qz-hint">Suggested title: <b>{meta.title}</b> — used if your quiz has none yet.</span>}
                        </div>
                        <ol className="qz-ai-list">
                            {generated.map((q, i) => {
                                const problems = questionIssues(q);
                                const on = selected.has(q.key);
                                return (
                                    <li key={q.key} className={`qz-ai-item${on ? ' is-on' : ''}${problems.length ? ' is-flagged' : ''}`}>
                                        <Checkbox checked={on} onChange={() => toggle(q.key)} aria-label={`Include question ${i + 1}`} />
                                        <div className="qz-ai-item-main">
                                            <div className="qz-q-head is-plain">
                                                <span className="qz-q-num">{i + 1}</span>
                                                <span className="qz-q-type">{TYPE_META[q.type].short}</span>
                                                <span className="qz-q-pts">{fmtNumber(q.points)} pts</span>
                                            </div>
                                            <p className="qz-q-text">{q.text}</p>
                                            {q.type === 'yes_no' ? (
                                                <div className="qz-yn is-view">
                                                    {(['yes', 'no'] as const).map(v => <span key={v} className={`qz-yn-opt${q.answer === v ? ' is-correct' : ''}`}>{q.answer === v && <CheckOutlined />}{v === 'yes' ? 'Yes' : 'No'}</span>)}
                                                </div>
                                            ) : (
                                                <ul className="qz-opts is-view">
                                                    {q.options.map((o, j) => (
                                                        <li key={o.key} className={o.correct ? 'is-correct' : undefined}>
                                                            <span className="qz-opt-letter">{o.correct ? <CheckOutlined /> : LETTERS[j]}</span><span>{o.text}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {q.explanation && <p className="qz-q-explain"><InfoCircleOutlined /> {q.explanation}</p>}
                                            {problems.length > 0 && <p className="qz-q-issue"><ExclamationCircleOutlined /> {problems.join(' ')} You can fix it after adding.</p>}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                )}

                <footer className="qz-mod-foot">
                    {step === 'setup' && (
                        <>
                            <span className={`qz-mod-foot-hint${canGenerate ? '' : ' is-blocked'}`}>
                                {canGenerate ? <><kbd>Ctrl</kbd> + <kbd>Enter</kbd> to generate</> : blockReason}
                            </span>
                            <Button onClick={close}>Cancel</Button>
                            <Button type="primary" icon={<ThunderboltOutlined />} disabled={!canGenerate} onClick={generate}>Generate {plural(total, 'question')}</Button>
                        </>
                    )}
                    {step === 'generating' && <Button onClick={cancel}>Cancel</Button>}
                    {step === 'review' && (
                        <>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => setStep('setup')}>Edit brief</Button>
                            <Button icon={<ReloadOutlined />} onClick={generate}>Regenerate</Button>
                            <span className="qz-mod-foot-note">{plural(chosen.length, 'question')} · {fmtNumber(chosenPoints)} pts</span>
                            <Button type="primary" icon={<CheckOutlined />} disabled={!chosen.length} onClick={() => onAdd(chosen, meta)}>Add to quiz</Button>
                        </>
                    )}
                </footer>
            </div>
        </Modal>
    );
};

export default AIQuizGenerator;
