// /learn/practice/dictation/<slug>/ and /fr/apprendre/pratique/dictee/<slug>/:
// Authentic French Dictation Studio:
//  - ONE coherent narrative French story, ONE continuous studio audio player
//    (Claire · woman or Thomas · man) with speed 0.65x–1.15x, seek bar, and -5 s.
//  - Write directly on the ruled French dictation sheet (or Guided inline blanks)
//    while listening, with Alt+P play/pause & Alt+ArrowLeft rewind shortcuts.
//  - Instant /20 word-by-word orthographic correction, exact text, traps & rules.
import {
  useEffect, useMemo, useRef, useState,
  type ClipboardEvent, type DragEvent, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent,
} from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftOutlined, ArrowRightOutlined, BulbOutlined, CheckOutlined,
  CustomerServiceOutlined, DeleteOutlined, EditOutlined, ReloadOutlined,
  SoundOutlined, UserOutlined,
} from '@ant-design/icons';
import { chime, prefetchRecording, speak, stop } from '../../audio';
import { imageUrl } from '../../categories';
import { LearnShell, LevelChip } from '../../shell';
import { tx, type Lang } from '../../types';
import { trackLearning } from '../../../utils/siteAnalytics';
import { ScoreRing } from '../parts';
import { ListeningPlayer } from '../listening/ListeningPlayer';
import { DICTATIONS, dictationCoursePath, dictationPath } from './catalog';
import { DICT_COPY } from './copy';
import {
  buildHint, countWords, evaluateGuided, evaluateSentence, formatGrade,
  gradeOutOf20, parseGuidedSentence, saveDictationBest, type SentenceEvaluation,
} from './diff';
import type { DictationCourse, DictationMode, DictationVoice } from './types';
import '../practice.css';
import './dictation.css';

const SITE = 'https://www.learnfrenchwithnatives.com';
const ACCENTS = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ô', 'ù', 'û', 'œ', '’', 'É', 'À'];
const RATES = [0.65, 0.75, 0.85, 1, 1.15];

function DiffFlow({ evalResult }: { evalResult: SentenceEvaluation }) {
  return (
    <div className="dx-diff-tokens" lang="fr">
      {evalResult.tokens.map((tok, i) => {
        if (tok.status === 'ok') return <span key={i} className="dx-tok is-ok">{tok.expected}</span>;
        if (tok.status === 'accent') {
          return (
            <span key={i} className="dx-tok is-accent">
              <s>{tok.typed}</s> → <b>{tok.expected}</b>
            </span>
          );
        }
        if (tok.status === 'wrong') {
          return (
            <span key={i} className="dx-tok is-wrong">
              <s>{tok.typed}</s> → <b>{tok.expected}</b>
            </span>
          );
        }
        if (tok.status === 'missing') return <span key={i} className="dx-tok is-missing">+ {tok.expected}</span>;
        return <span key={i} className="dx-tok is-extra">{tok.typed}</span>;
      })}
    </div>
  );
}

export default function DictationCoursePage({ lang, course }: { lang: Lang; course: DictationCourse }) {
  const c = DICT_COPY[lang];
  const nextCourse = useMemo(() => {
    const idx = DICTATIONS.findIndex(d => d.id === course.id);
    return idx >= 0 && idx + 1 < DICTATIONS.length ? DICTATIONS[idx + 1] : undefined;
  }, [course.id]);
  const targetWordCount = useMemo(() => countWords(course.text), [course.text]);
  const guidedParts = useMemo(
    () => parseGuidedSentence(course.text, course.blanks),
    [course.text, course.blanks],
  );
  const totalBlanks = useMemo(
    () => guidedParts.filter(p => p.kind === 'blank').length,
    [guidedParts],
  );

  // Studio controls (single audio, single voice toggle, single mode toggle)
  const [voice, setVoice] = useState<DictationVoice>('f');
  const [mode, setMode] = useState<DictationMode>('full');
  const [rate, setRate] = useState(0.85);
  const [showHint, setShowHint] = useState(false);
  const [pasteBlocked, setPasteBlocked] = useState(false);

  // Writing state
  const [draft, setDraft] = useState('');
  const [guidedValues, setGuidedValues] = useState<string[]>(() => new Array<string>(totalBlanks).fill(''));
  const [focusedBlank, setFocusedBlank] = useState(0);

  // Correction state
  const [checked, setChecked] = useState<{
    overall: SentenceEvaluation;
    grade: number;
    pct: number;
  } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const blankRefs = useRef<(HTMLInputElement | null)[]>([]);
  const startedRef = useRef(false);
  const pasteTimerRef = useRef<number | null>(null);

  // Prefetch both voices so switching Claire <-> Thomas is instantaneous.
  useEffect(() => {
    prefetchRecording(course.text, 'f');
    prefetchRecording(course.text, 'm');
  }, [course.text]);

  useEffect(() => () => {
    stop();
    if (pasteTimerRef.current !== null) window.clearTimeout(pasteTimerRef.current);
  }, []);

  // Reset studio state cleanly when navigating directly to the next dictation.
  useEffect(() => {
    setDraft('');
    setGuidedValues(new Array<string>(totalBlanks).fill(''));
    setFocusedBlank(0);
    setChecked(null);
    setShowHint(false);
  }, [course.id, totalBlanks]);

  // Hands-on-keyboard shortcuts: Alt+P toggles Play/Pause, Alt+ArrowLeft rewinds 5 s.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const a = audioRef.current;
      if (!a) return;
      const k = e.key.toLowerCase();
      if (k === 'p') {
        e.preventDefault();
        if (a.paused) a.play().catch(() => {});
        else a.pause();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        a.currentTime = Math.max(0, a.currentTime - 5);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackLearning({ kind: 'lesson', action: 'start', course: 'practice-dictation', item: course.id, title: 'Dictation', itemTitle: course.title });
  };

  const notifyNoPaste = () => {
    setPasteBlocked(true);
    if (pasteTimerRef.current !== null) window.clearTimeout(pasteTimerRef.current);
    pasteTimerRef.current = window.setTimeout(() => setPasteBlocked(false), 3200);
  };

  const blockClipboard = (e: ClipboardEvent | DragEvent | MouseEvent) => {
    e.preventDefault();
    notifyNoPaste();
  };

  const blockClipboardKey = (e: ReactKeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (((e.ctrlKey || e.metaKey) && (k === 'v' || k === 'c' || k === 'x')) || (e.shiftKey && e.key === 'Insert')) {
      e.preventDefault();
      notifyNoPaste();
    }
  };

  const blockPasteBeforeInput = (e: FormEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const inputType = (e.nativeEvent as InputEvent).inputType;
    if (inputType === 'insertFromPaste' || inputType === 'insertFromDrop' || inputType === 'insertFromPasteAsQuotation') {
      e.preventDefault();
      notifyNoPaste();
    }
  };

  const antiClipboardProps = {
    onPaste: blockClipboard,
    onCopy: blockClipboard,
    onCut: blockClipboard,
    onDrop: blockClipboard,
    onContextMenu: blockClipboard,
    onKeyDown: blockClipboardKey,
    onBeforeInput: blockPasteBeforeInput,
  };

  const changeVoice = (next: DictationVoice) => {
    if (next === voice) return;
    audioRef.current?.pause();
    stop();
    setVoice(next);
  };

  const changeMode = (next: DictationMode) => {
    if (next === mode) return;
    setMode(next);
    setChecked(null);
  };

  const insertAccent = (ch: string) => {
    if (checked) return;
    if (mode === 'full') {
      const el = textareaRef.current;
      if (!el) { setDraft(d => d + ch); return; }
      const start = el.selectionStart ?? draft.length;
      const end = el.selectionEnd ?? draft.length;
      const next = draft.slice(0, start) + ch + draft.slice(end);
      setDraft(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + ch.length, start + ch.length);
      });
    } else {
      const idx = Math.min(focusedBlank, Math.max(0, totalBlanks - 1));
      const el = blankRefs.current[idx];
      const cur = guidedValues[idx] ?? '';
      const start = el?.selectionStart ?? cur.length;
      const end = el?.selectionEnd ?? cur.length;
      const updated = cur.slice(0, start) + ch + cur.slice(end);
      setGuidedValues(arr => arr.map((v, k) => (k === idx ? updated : v)));
      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(start + ch.length, start + ch.length);
      });
    }
  };

  const typedWordCount = useMemo(() => countWords(draft), [draft]);
  const filledBlanksCount = useMemo(
    () => guidedValues.filter(v => v.trim().length > 0).length,
    [guidedValues],
  );
  const canCheck = mode === 'full' ? typedWordCount > 0 : filledBlanksCount > 0;

  const handleCorrect = () => {
    if (!canCheck) return;
    audioRef.current?.pause();
    stop();
    markStarted();

    const overall = mode === 'full'
      ? evaluateSentence(draft, course.text)
      : evaluateGuided(guidedValues, guidedParts);

    const grade = gradeOutOf20(overall.points, overall.totalWords);
    const pct = overall.totalWords > 0 ? Math.round((overall.points / overall.totalWords) * 100) : 0;
    saveDictationBest(course.id, grade, pct, mode);
    trackLearning({ kind: 'lesson', action: 'finish', course: 'practice-dictation', item: course.id, score: pct / 100, passed: pct >= 70, title: 'Dictation', itemTitle: course.title });
    chime(grade >= 16 ? 'done' : grade >= 10 ? 'right' : 'wrong');
    setChecked({ overall, grade, pct });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAll = (opts?: { nextVoice?: DictationVoice; nextMode?: DictationMode }) => {
    audioRef.current?.pause();
    stop();
    if (opts?.nextVoice) setVoice(opts.nextVoice);
    if (opts?.nextMode) setMode(opts.nextMode);
    setDraft('');
    setGuidedValues(new Array<string>(totalBlanks).fill(''));
    setChecked(null);
    setShowHint(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
  };

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: dictationCoursePath(course, 'en'), fr: dictationCoursePath(course, 'fr') }}
      seo={{
        title: c.courseMetaTitle(course.title, course.level),
        description: c.courseMetaDesc(tx(course.subtitle, lang)),
        path: dictationCoursePath(course, lang),
        image: `${SITE}${imageUrl(course.image)}`,
      }}
    >
      {/* ── Compact Sticky Studio Bar ── */}
      <div className="dx-studio-bar">
        <div className="lp-wrap dx-studio-bar-in">
          <div className="dx-studio-left">
            <Link to={dictationPath(lang)} className="dx-back">
              <ArrowLeftOutlined aria-hidden /> {c.back}
            </Link>
            <LevelChip level={course.level} size="sm" />
            <h1 className="dx-studio-h1">{course.title}</h1>
          </div>

          <div className="dx-studio-controls">
            <div className="dx-voice-switch" role="group" aria-label={c.chooseVoice}>
              {(['f', 'm'] as DictationVoice[]).map(v => (
                <button
                  key={v}
                  type="button"
                  className={voice === v ? 'is-on' : ''}
                  aria-pressed={voice === v}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => changeVoice(v)}
                >
                  <UserOutlined aria-hidden /> {c.voiceName[v]}
                </button>
              ))}
            </div>

            <div className="dx-mode-pills" role="group" aria-label={c.chooseMode}>
              {(['full', 'guided'] as DictationMode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  className={mode === m ? 'is-on' : ''}
                  aria-pressed={mode === m}
                  onClick={() => changeMode(m)}
                >
                  {m === 'full' ? <EditOutlined aria-hidden /> : <BulbOutlined aria-hidden />}
                  {c.modeLabel[m]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Focused Single-Column Dictation Desk ── */}
      <div className="dx-desk-stage">
        <div className="lp-wrap dx-desk-wrap">
          <div className="dx-desk-meta">
            <span className="dx-desk-theme">{tx(course.theme, lang)} · {c.words(targetWordCount)} · {course.minutes} min</span>
            <ul className="dx-focus-inline">
              {course.focus.map(f => <li key={tx(f, lang)}>{tx(f, lang)}</li>)}
            </ul>
          </div>

          {/* ── Single Unified Audio Console (One coherent audio, 2 voices, 5 speeds) ── */}
          <section className="dx-console" aria-label={c.audioTrackLabel}>
            <div className="dx-console-flag" aria-hidden><i /><i /><i /></div>
            <div className="dx-console-head">
              <span className="dx-console-k">
                <CustomerServiceOutlined aria-hidden /> {c.audioTrackLabel} · {c.voiceName[voice]}
              </span>
              <div className="dx-speed-pills" role="group" aria-label={c.speedLabel}>
                {RATES.map(r => (
                  <button
                    key={r}
                    type="button"
                    className={rate === r ? 'is-on' : ''}
                    aria-pressed={rate === r}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setRate(r)}
                  >
                    {String(r).replace('.', lang === 'fr' ? ',' : '.')}×
                  </button>
                ))}
              </div>
            </div>
            <ListeningPlayer
              text={course.text}
              voice={voice}
              rate={rate}
              lang={lang}
              audio={audioRef}
              onHeard={markStarted}
            />
          </section>

          {/* ════════ LIVE WRITING PAPER (Immediately Below the Audio) ════════ */}
          {!checked ? (
            <section className="dx-paper" aria-label={c.sheetLabel}>
              <div className="dx-paper-head">
                <span className="dx-paper-title">
                  <EditOutlined aria-hidden /> {c.sheetLabel}
                </span>
                <div className="dx-paper-tools">
                  <span className="dx-word-count">
                    {mode === 'full'
                      ? c.wordProgress(typedWordCount, targetWordCount)
                      : c.blanksProgress(filledBlanksCount, totalBlanks)}
                  </span>
                  {mode === 'full' && (
                    <button
                      type="button"
                      className={`dx-hint-btn${showHint ? ' is-on' : ''}`}
                      aria-pressed={showHint}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => setShowHint(h => !h)}
                    >
                      <BulbOutlined aria-hidden /> {showHint ? c.hintHide : c.hintShow}
                    </button>
                  )}
                </div>
              </div>

              {showHint && mode === 'full' && (
                <div className="dx-hint-box">
                  <small>{c.hintTitle}</small>
                  <code lang="fr">{buildHint(course.text)}</code>
                </div>
              )}

              {mode === 'full' ? (
                <textarea
                  ref={textareaRef}
                  className="dx-sheet-textarea"
                  lang="fr"
                  rows={7}
                  value={draft}
                  onChange={e => { markStarted(); setDraft(e.target.value); }}
                  placeholder={c.sheetPlaceholder}
                  aria-label={c.sheetLabel}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  {...antiClipboardProps}
                />
              ) : (
                <div className="dx-guided-paragraph" lang="fr">
                  {guidedParts.map((part, pi) =>
                    part.kind === 'text' ? (
                      <span key={pi}>{part.value}</span>
                    ) : (
                      <input
                        key={pi}
                        ref={el => { blankRefs.current[part.index] = el; }}
                        type="text"
                        className="dx-blank-input"
                        style={{ width: `${Math.max(7, part.answer.length + 3)}ch` }}
                        value={guidedValues[part.index] ?? ''}
                        onFocus={() => setFocusedBlank(part.index)}
                        onChange={e => {
                          markStarted();
                          const val = e.target.value;
                          setGuidedValues(arr => arr.map((v, k) => (k === part.index ? val : v)));
                        }}
                        aria-label={`${c.sheetLabel} (${part.index + 1})`}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        {...antiClipboardProps}
                      />
                    ),
                  )}
                </div>
              )}

              {pasteBlocked && (
                <p className="dx-paste-notice" role="status" aria-live="polite">
                  {c.noPasteNotice}
                </p>
              )}

              {/* Built-in French Accent Bar + Submit Row */}
              <div className="dx-paper-foot">
                <div className="dx-accents" role="group" aria-label={c.accentsLabel}>
                  {ACCENTS.map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => insertAccent(ch)}
                    >
                      {ch}
                    </button>
                  ))}
                </div>

                <div className="dx-paper-actions">
                  <span className="dx-shortcut-note">{c.shortcutHint}</span>
                  <div className="dx-paper-btns">
                    {canCheck && (
                      <button
                        type="button"
                        className="lp-btn lp-btn-ghost lp-btn-sm"
                        onClick={() => { setDraft(''); setGuidedValues(new Array<string>(totalBlanks).fill('')); }}
                      >
                        <DeleteOutlined /> {c.clearBtn}
                      </button>
                    )}
                    <button
                      type="button"
                      className="lp-btn lp-btn-primary"
                      disabled={!canCheck}
                      onClick={handleCorrect}
                    >
                      <CheckOutlined /> {c.checkAllBtn}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            /* ════════ INSTANT /20 CORRECTION SHEET ════════ */
            <div className="dx-report-stack">
              <section className="dx-score-card" aria-label={c.summaryEyebrow}>
                <ScoreRing value={checked.grade / 20} label={`${formatGrade(checked.grade, lang)}/20`} />
                <div className="dx-score-copy">
                  <p className="lp-eyebrow">{c.summaryEyebrow} · {checked.pct}% · {c.modeLabel[mode]}</p>
                  <h2>{c.verdict(checked.grade)}</h2>

                  <dl className="dx-kpis">
                    <div className="is-ok"><dt>{checked.overall.exactCount}</dt><dd>{c.stats.ok}</dd></div>
                    <div className="is-accent"><dt>{checked.overall.accentCount}</dt><dd>{c.stats.accent}</dd></div>
                    <div className="is-wrong"><dt>{checked.overall.wrongCount}</dt><dd>{c.stats.wrong}</dd></div>
                    <div className="is-missing"><dt>{checked.overall.missingCount}</dt><dd>{c.stats.missing}</dd></div>
                  </dl>

                  <div className="dx-summary-actions">
                    {nextCourse && (
                      <Link to={dictationCoursePath(nextCourse, lang)} className="lp-btn lp-btn-primary lp-btn-sm">
                        {c.nextDictation} <ArrowRightOutlined />
                      </Link>
                    )}
                    <button type="button" className={`lp-btn ${nextCourse ? 'lp-btn-ghost' : 'lp-btn-primary'} lp-btn-sm`} onClick={() => setChecked(null)}>
                      <EditOutlined /> {c.editAgainBtn}
                    </button>
                    <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => resetAll()}>
                      <ReloadOutlined /> {c.retrySame}
                    </button>
                    <button
                      type="button"
                      className="lp-btn lp-btn-ghost lp-btn-sm"
                      onClick={() => resetAll({ nextVoice: voice === 'f' ? 'm' : 'f' })}
                    >
                      <UserOutlined /> {c.retryOtherVoice(voice)}
                    </button>
                    {mode === 'guided' && (
                      <button
                        type="button"
                        className="lp-btn lp-btn-ghost lp-btn-sm"
                        onClick={() => resetAll({ nextMode: 'full' })}
                      >
                        {c.retryFullMode}
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* Full Word-by-Word Annotated Sheet */}
              <section className="dx-paper dx-paper-graded" aria-labelledby="dx-diff-title">
                <div className="dx-paper-head">
                  <h2 id="dx-diff-title" className="dx-paper-title">{c.yourCorrectionTitle}</h2>
                  <ul className="dx-legend">
                    <li><i className="is-ok" />{c.legend.ok}</li>
                    <li><i className="is-accent" />{c.legend.accent}</li>
                    <li><i className="is-wrong" />{c.legend.wrong}</li>
                    <li><i className="is-missing" />{c.legend.missing}</li>
                  </ul>
                </div>
                <div className="dx-graded-flow">
                  <DiffFlow evalResult={checked.overall} />
                </div>
              </section>

              {/* Official Text + Spelling Traps + Rules Split */}
              <div className="dx-summary-grid">
                <section className="dx-transcript-card" aria-labelledby="dx-ref-title">
                  <h2 id="dx-ref-title">{c.referenceTitle}</h2>
                  <p className="dx-transcript-sub">{c.referenceSub}</p>
                  <div className="dx-ref-passage">
                    <p className="dx-ref-fr" lang="fr">{course.text}</p>
                    <p className="dx-ref-en">{course.translation}</p>
                  </div>

                  {course.traps.length > 0 && (
                    <div className="dx-ref-traps">
                      <h3>{c.trapsTitle}</h3>
                      <ul className="dx-tr-traps">
                        {course.traps.map(tr => (
                          <li key={tr.word}><b lang="fr">{tr.word}</b> {tx(tr.note, lang)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                <aside className="dx-rules-card" aria-labelledby="dx-rules-title">
                  <h2 id="dx-rules-title">{c.rulesTitle}</h2>
                  <ul className="dx-rules-list">
                    {course.rules.map(r => (
                      <li key={tx(r.title, lang)}>
                        <strong>{tx(r.title, lang)}</strong>
                        <p>{tx(r.body, lang)}</p>
                        <div className="dx-rule-exs">
                          {r.examples.map(ex => (
                            <button
                              key={ex.fr}
                              type="button"
                              className="dx-rule-ex"
                              title={tx(ex.note, lang)}
                              onClick={() => { audioRef.current?.pause(); speak(ex.fr, { voice }); }}
                            >
                              <SoundOutlined aria-hidden /> <span lang="fr">{ex.fr}</span>
                            </button>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </div>
          )}
        </div>
      </div>
    </LearnShell>
  );
}
