// ============================================================
// TCF Canada — official score scales for the productive skills.
//
// Expression orale and Expression écrite are both reported on 20 (whole
// points). France Éducation International maps that score to a CEFR level,
// and IRCC maps it to an NCLC level for immigration. Both tables live here so
// the backend, the reports and the student UI all speak the same numbers.
// ============================================================

// France Éducation International — TCF, épreuves d'expression (score sur 20).
const CEFR_BANDS = [
  { level: 'C2', min: 16, max: 20 },
  { level: 'C1', min: 14, max: 15 },
  { level: 'B2', min: 10, max: 13 },
  { level: 'B1', min: 6, max: 9 },
  { level: 'A2', min: 4, max: 5 },
  { level: 'A1', min: 1, max: 3 },
];

// IRCC — équivalences TCF Canada (expression orale / écrite) → NCLC.
const NCLC_BANDS = [
  { nclc: 10, min: 16, max: 20 },
  { nclc: 9, min: 14, max: 15 },
  { nclc: 8, min: 12, max: 13 },
  { nclc: 7, min: 10, max: 11 },
  { nclc: 6, min: 7, max: 9 },
  { nclc: 5, min: 6, max: 6 },
  { nclc: 4, min: 4, max: 5 },
];

// Thresholds a candidate aiming for Canada actually plans around.
const MILESTONES = [
  { nclc: 4, note: 'Exigence linguistique de la citoyenneté canadienne (oral)' },
  { nclc: 5, note: 'Seuil de plusieurs programmes provinciaux et de la mobilité francophone' },
  { nclc: 7, note: 'Minimum du Programme des travailleurs qualifiés (Entrée express) et des points bonus pour le français' },
  { nclc: 9, note: 'Palier qui maximise les points de langue dans Entrée express' },
];

const clamp20 = (v) => Math.max(0, Math.min(20, Number.isFinite(Number(v)) ? Number(v) : 0));

/** Official scores are whole points; everything shown to the student goes through this. */
const officialScore = (precise) => Math.round(clamp20(precise));

function cefrFor(score20) {
  const s = officialScore(score20);
  if (s <= 0) return null;
  return (CEFR_BANDS.find(b => s >= b.min && s <= b.max) || CEFR_BANDS[CEFR_BANDS.length - 1]).level;
}

function nclcFor(score20) {
  const s = officialScore(score20);
  const band = NCLC_BANDS.find(b => s >= b.min && s <= b.max);
  return band ? band.nclc : null; // below 4/20 is "en dessous de NCLC 4"
}

/** Next NCLC step above the current score, with the points still missing. */
function nextMilestone(score20) {
  const s = officialScore(score20);
  const current = nclcFor(s) || 3;
  const next = [...NCLC_BANDS].reverse().find(b => b.nclc > current);
  if (!next) return null;
  const milestone = MILESTONES.find(m => m.nclc === next.nclc);
  return { nclc: next.nclc, score: next.min, missing: Math.max(0, next.min - s), note: milestone ? milestone.note : null };
}

// ── Comprehension (reading / listening), scored in TCF points out of 699 ──

// France Éducation International — one CEFR level per 100 points from 100.
function cefrForPoints(points) {
  const p = Number(points) || 0;
  if (p >= 600) return 'C2';
  if (p >= 500) return 'C1';
  if (p >= 400) return 'B2';
  if (p >= 300) return 'B1';
  if (p >= 200) return 'A2';
  return 'A1';
}

// IRCC — équivalences TCF Canada, compréhension de l'écrit (ce) et de l'oral (co) → NCLC.
const NCLC_POINT_BANDS = {
  ce: [
    { nclc: 10, min: 549 }, { nclc: 9, min: 524 }, { nclc: 8, min: 499 }, { nclc: 7, min: 453 },
    { nclc: 6, min: 406 }, { nclc: 5, min: 375 }, { nclc: 4, min: 342 },
  ],
  co: [
    { nclc: 10, min: 549 }, { nclc: 9, min: 523 }, { nclc: 8, min: 503 }, { nclc: 7, min: 458 },
    { nclc: 6, min: 398 }, { nclc: 5, min: 369 }, { nclc: 4, min: 331 },
  ],
};

function nclcForPoints(skill, points) {
  const bands = NCLC_POINT_BANDS[skill];
  if (!bands) return null;
  const p = Math.round(Number(points) || 0);
  const band = bands.find(b => p >= b.min);
  return band ? band.nclc : null; // below the NCLC 4 threshold
}

/** Next CEFR and NCLC steps above a comprehension score, with the points still missing. */
function nextPointSteps(skill, points) {
  const p = Math.round(Number(points) || 0);
  // Levels as reported here: A1 below 200, then one level per 100 points up to C2 at 600.
  const cefrNext = p >= 600 ? null : Math.max(200, (Math.floor(p / 100) + 1) * 100);
  const nclcNow = nclcForPoints(skill, p) || 3;
  const nclcNext = [...(NCLC_POINT_BANDS[skill] || [])].reverse().find(b => b.nclc > nclcNow);
  return {
    cefr: cefrNext ? { level: cefrForPoints(cefrNext), points: cefrNext, missing: cefrNext - p } : null,
    nclc: nclcNext ? { nclc: nclcNext.nclc, points: nclcNext.min, missing: nclcNext.min - p } : null,
  };
}

module.exports = {
  CEFR_BANDS, NCLC_BANDS, NCLC_POINT_BANDS, MILESTONES,
  officialScore, cefrFor, nclcFor, nextMilestone, clamp20, cefrForPoints, nclcForPoints, nextPointSteps,
};
