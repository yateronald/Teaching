/**
 * Single grading scale for every student-facing results view
 * (My Results, Marksheet, printed report) so a score always maps to the
 * same letter and colour everywhere.
 */

export const PASS_MARK = 50;

export type Tone = 'good' | 'fair' | 'weak' | 'fail';

export const gradeFromPercent = (p: number): string => {
    if (p >= 95) return 'A+';
    if (p >= 90) return 'A';
    if (p >= 85) return 'A-';
    if (p >= 80) return 'B+';
    if (p >= 75) return 'B';
    if (p >= 70) return 'B-';
    if (p >= 65) return 'C+';
    if (p >= 60) return 'C';
    if (p >= 55) return 'D+';
    if (p >= 50) return 'D';
    return 'F';
};

export const toneFor = (p: number): Tone => (p >= 70 ? 'good' : p >= 60 ? 'fair' : p >= PASS_MARK ? 'weak' : 'fail');

/** Letter bands, highest first. `min` is inclusive. */
export const GRADE_BANDS: { label: 'A' | 'B' | 'C' | 'D' | 'F'; range: string; min: number; tone: Tone }[] = [
    { label: 'A', range: '85–100', min: 85, tone: 'good' },
    { label: 'B', range: '70–84', min: 70, tone: 'good' },
    { label: 'C', range: '60–69', min: 60, tone: 'fair' },
    { label: 'D', range: '50–59', min: 50, tone: 'weak' },
    { label: 'F', range: '0–49', min: 0, tone: 'fail' },
];

export const bandFor = (p: number) => GRADE_BANDS.find(b => p >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
