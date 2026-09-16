import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import dayjs from 'dayjs';
import { GRADE_BANDS, PASS_MARK, gradeFromPercent, toneFor, type Tone } from '../../utils/grading';
import type { MarkRow, Stats } from './StudentMarksheet';
import './MarksheetPrint.css';

/**
 * Printable academic report for ONE batch.
 *
 * This module is lazy-loaded and mounted only when the student prints. It
 * waits for its display font and the logo, then calls `onReady` so the
 * parent opens the print dialog. It renders into <body> through a portal;
 * the print stylesheet hides the rest of the app.
 */

export interface PrintBatch {
    id: number;
    name: string;
    french_level?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    teacher_first_name?: string | null;
    teacher_last_name?: string | null;
}

const LOGO_SRC = '/logo.png';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap';
const DATE = 'MMM D, YYYY';

let fontReady: Promise<unknown> | null = null;

/** Fonts in a hidden element are never fetched, so load them explicitly before printing. */
const loadAssets = () => {
    fontReady ??= new Promise<void>(resolve => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FONT_URL;
        link.onload = () => resolve();
        link.onerror = () => resolve();
        document.head.appendChild(link);
    })
        .then(() => Promise.all([
            document.fonts.load('700 30px "Playfair Display"'),
            document.fonts.load('600 12px "Playfair Display"'),
            document.fonts.load('italic 500 12px "Playfair Display"'),
        ]))
        .catch(() => undefined);

    const logo = new Image();
    logo.src = LOGO_SRC;
    const assets = Promise.all([fontReady, logo.decode().catch(() => undefined)]);
    // Never hold the print dialog hostage to a slow network.
    return Promise.race([assets, new Promise(resolve => setTimeout(resolve, 4000))]);
};

/* Serrated rosette outline shared by the grade seal and the page watermark. */
const SEAL_EDGE = (() => {
    const teeth = 64;
    const pts: string[] = [];
    for (let i = 0; i < teeth * 2; i++) {
        const r = i % 2 ? 94 : 99;
        const a = (Math.PI * i) / teeth;
        pts.push(`${(100 + r * Math.cos(a)).toFixed(2)} ${(100 + r * Math.sin(a)).toFixed(2)}`);
    }
    return `M${pts.join(' L')} Z`;
})();

const Seal: React.FC<{ grade: string | null; caption: string; tone: Tone | null }> = ({ grade, caption, tone }) => (
    <svg className={`msp-seal${tone ? ` msp-tone-${tone}` : ''}`} viewBox="0 0 200 200" aria-hidden="true">
        <defs>
            <path id="msp-seal-arc" d="M 100 100 m -76 0 a 76 76 0 1 1 152 0 a 76 76 0 1 1 -152 0" />
        </defs>
        <path d={SEAL_EDGE} className="msp-seal-edge" />
        <circle cx="100" cy="100" r="88" className="msp-seal-ring" />
        <text className="msp-seal-text">
            <textPath href="#msp-seal-arc" textLength="468" lengthAdjust="spacing">
                LEARN FRENCH WITH NATIVES ★ FINAL GRADE ★
            </textPath>
        </text>
        <circle cx="100" cy="100" r="62" className="msp-seal-disc" />
        <circle cx="100" cy="100" r="57" className="msp-seal-inner" />
        <text x="100" y="113" textAnchor="middle" className="msp-seal-grade">{grade ?? '—'}</text>
        <text x="100" y="138" textAnchor="middle" className="msp-seal-caption">{caption}</text>
    </svg>
);

interface Props {
    student: { name: string; id?: number; createdAt?: string };
    batch: PrintBatch;
    rows: MarkRow[];
    stats: Stats;
    onReady: () => void;
}

const MarksheetPrint: React.FC<Props> = ({ student, batch, rows, stats, onReady }) => {
    useEffect(() => {
        let cancelled = false;
        loadAssets().then(() => { if (!cancelled) requestAnimationFrame(() => onReady()); });
        return () => { cancelled = true; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- runs once per print job

    const n1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
    const n2 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
    const fmtDate = (v: string | null | undefined, f = DATE) => (v ? dayjs(v).format(f) : '—');
    const pct = (v: number) => `${n1.format(v)}%`;

    const ordered = rows.slice().sort((a, b) => dayjs(a.submittedAt || 0).valueOf() - dayjs(b.submittedAt || 0).valueOf());
    // Drop the year from row dates when every assessment falls in the same year.
    const sameYear = new Set(ordered.map(r => (r.submittedAt ? dayjs(r.submittedAt).year() : null))).size <= 1;
    const rowDate = sameYear ? 'MMM D' : DATE;

    const start = batch.start_date ?? ordered[0]?.submittedAt ?? null;
    const end = batch.end_date ?? ordered[ordered.length - 1]?.submittedAt ?? null;
    const period = start || end ? `${fmtDate(start)} – ${fmtDate(end)}` : '—';
    const teacher = [batch.teacher_first_name, batch.teacher_last_name].filter(Boolean).join(' ')
        || ordered.find(r => r.teacher)?.teacher
        || '—';
    const level = batch.french_level || '—';
    const reference = `LFN-${(student.createdAt ? dayjs(student.createdAt) : dayjs()).format('YYYY')}-${String(student.id ?? 0).padStart(4, '0')}`;

    const average = stats.average;
    const finalGrade = average != null ? gradeFromPercent(average) : null;
    const passRate = stats.graded ? Math.round((stats.passed / stats.graded) * 100) : null;

    // Grading scale, lowest band first, as a proportional 0–100 bar.
    const scale = GRADE_BANDS.slice().reverse().map((b, i, arr) => {
        const max = i < arr.length - 1 ? arr[i + 1].min : 100;
        return { ...b, width: max - b.min };
    });
    const markerLeft = average != null ? Math.min(95, Math.max(5, average)) : null;

    const sheet = (
        <div className="msp-root" aria-hidden="true">
            <article className="msp">
                {/* Repeated on every printed page */}
                <div className="msp-edge"><i /><i /><i /></div>
                <svg className="msp-watermark" viewBox="0 0 200 200" aria-hidden="true">
                    <path d={SEAL_EDGE} />
                    <circle cx="100" cy="100" r="80" />
                    <circle cx="100" cy="100" r="60" />
                </svg>

                {/* ── Letterhead ── */}
                <header className="msp-band">
                    <div className="msp-band-logo">
                        <div className="msp-logo"><img src={LOGO_SRC} alt="Learn French with Natives" /></div>
                    </div>
                    <div>
                        <div className="msp-band-name msp-serif">Learn French <span>with Natives</span></div>
                        <div className="msp-band-tag">learnfrenchwithnatives.com</div>
                    </div>
                    <div className="msp-band-right">
                        <div className="msp-band-kicker">Official transcript</div>
                        <div className="msp-band-ref">No. {reference}</div>
                    </div>
                </header>
                <div className="msp-tricolor"><i /><i /><i /></div>

                {/* ── Hero ── */}
                <section className="msp-hero">
                    <div>
                        <div className="msp-kicker">Academic report</div>
                        <h1 className="msp-serif">{student.name || 'Student'}</h1>
                        <p className="msp-hero-sub msp-serif">Results for <strong>{batch.name}</strong>, {period}</p>
                        <div className="msp-hero-rule" />
                    </div>
                    <Seal
                        grade={finalGrade}
                        caption={average != null ? pct(average) : 'No grade yet'}
                        tone={average != null ? toneFor(average) : null}
                    />
                </section>

                {/* ── Details ── */}
                <dl className="msp-info">
                    <div><dt>Student ID</dt><dd>{reference}</dd></div>
                    <div><dt>Batch</dt><dd>{batch.name}</dd></div>
                    <div><dt>Level</dt><dd>{level}</dd></div>
                    <div><dt>Teacher</dt><dd>{teacher}</dd></div>
                    <div><dt>Period</dt><dd className="msp-nowrap">{period}</dd></div>
                </dl>

                {/* ── 01 Performance ── */}
                <div className="msp-sec"><span className="msp-sec-no">01</span><h2 className="msp-serif">Performance at a glance</h2></div>
                <div className="msp-metrics">
                    <div className="msp-metric">
                        <div className="msp-metric-label">Overall average</div>
                        <div className="msp-metric-value msp-serif">{average != null ? pct(average) : '—'}</div>
                        <div className="msp-metric-sub">Weighted by points</div>
                    </div>
                    <div className="msp-metric">
                        <div className="msp-metric-label">Quizzes passed</div>
                        <div className="msp-metric-value msp-serif">{stats.passed} <small>/ {stats.graded}</small></div>
                        <div className="msp-metric-sub">{passRate != null ? `${passRate}% pass rate` : '—'}</div>
                    </div>
                    <div className="msp-metric">
                        <div className="msp-metric-label">Total points</div>
                        <div className="msp-metric-value msp-serif">{n2.format(stats.points)} <small>/ {n2.format(stats.maxPoints)}</small></div>
                        <div className="msp-metric-sub">Earned / available</div>
                    </div>
                </div>

                {/* ── 02 Assessments ── */}
                <div className="msp-sec"><span className="msp-sec-no">02</span><h2 className="msp-serif">Assessment record</h2></div>
                {ordered.length === 0 ? (
                    <p className="msp-empty">No graded assessments for this batch yet.</p>
                ) : (
                    <table className="msp-table">
                        <thead>
                            <tr>
                                <th className="msp-idx">No.</th>
                                <th>Assessment</th>
                                <th className="msp-c">Date</th>
                                <th className="msp-c">Points</th>
                                <th className="msp-r">Score</th>
                                <th className="msp-c">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordered.map((row, i) => (
                                <tr key={row.key}>
                                    <td className="msp-idx msp-serif">{String(i + 1).padStart(2, '0')}</td>
                                    <td className="msp-eval">{row.quizTitle}</td>
                                    <td className="msp-c">{fmtDate(row.submittedAt, rowDate)}</td>
                                    <td className="msp-c">
                                        {row.score != null && row.maxScore != null ? `${n2.format(row.score)} / ${n2.format(row.maxScore)}` : '—'}
                                    </td>
                                    <td className="msp-r">
                                        {row.pct != null ? (
                                            <span className={`msp-score msp-tone-${toneFor(row.pct)}`}>
                                                <span className="msp-score-track"><span style={{ width: `${Math.min(100, Math.max(0, row.pct))}%` }} /></span>
                                                <b>{pct(row.pct)}</b>
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td className="msp-c">
                                        {row.pct != null
                                            ? <span className={`msp-grade msp-serif msp-tone-${toneFor(row.pct)}`}>{gradeFromPercent(row.pct)}</span>
                                            : <span className="msp-grade msp-grade-pending">Pending</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                {/* One cell: a two-cell navy row shows a hairline seam where the cells meet. */}
                                <td colSpan={6}>
                                    <div className="msp-total">
                                        <div>Total <span>{n2.format(stats.points)} / {n2.format(stats.maxPoints)} pts</span></div>
                                        <div>Average <span>{average != null ? `${pct(average)} · ${finalGrade}` : '—'}</span></div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                )}
                {stats.pending > 0 && (
                    <p className="msp-note">
                        {stats.pending} result{stats.pending > 1 ? 's' : ''} awaiting release, not included in the average.
                    </p>
                )}

                {/* ── 03 Grading scale ── */}
                <div className="msp-sec"><span className="msp-sec-no">03</span><h2 className="msp-serif">Grading scale</h2></div>
                <div className="msp-scalebox">
                    {markerLeft != null && (
                        <div className="msp-marker" style={{ left: `${markerLeft}%` }}>{pct(average as number)}</div>
                    )}
                    <div className="msp-scalebar">
                        {scale.map(b => (
                            <div key={b.label} className={`msp-seg msp-tone-${b.tone}`} style={{ flex: b.width }}>
                                <strong className="msp-serif">{b.label}</strong><span>{b.range}%</span>
                            </div>
                        ))}
                    </div>
                    <div className="msp-scale-foot">
                        <span>0%</span>
                        <span style={{ left: `${PASS_MARK}%` }}>Pass mark {PASS_MARK}%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* ── Footer ── */}
                <footer className="msp-foot">
                    <div className="msp-foot-rule"><span className="msp-flag"><i /><i /><i /></span></div>
                    <div className="msp-foot-row">
                        <span>Generated electronically by the Learn French with Natives platform</span>
                        <span>{reference} · {dayjs().format(DATE)}</span>
                    </div>
                </footer>
            </article>
        </div>
    );

    return createPortal(sheet, document.body);
};

export default MarksheetPrint;
