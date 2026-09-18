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

module.exports = { CEFR_BANDS, NCLC_BANDS, MILESTONES, officialScore, cefrFor, nclcFor, nextMilestone, clamp20 };
