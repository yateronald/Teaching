/**
 * Compréhension écrite import: reads a folder of series exported by the
 * scraper (one sub-folder per series, each with a tcf_questions.json), cleans
 * every question and lists what needs a human look before anything is sent.
 *
 * Documents are stored as text (with their tables). Files from scraper v2
 * (schema_version 2) also say which images are part of the document: those
 * are imported, icons and illustrations are left out unless the admin keeps
 * them. Older files: a document that only existed as an image comes from OCR
 * and is flagged for checking.
 */
import { ceDocumentPlain } from '../../Common/ceDocumentModel';

export const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Cefr = typeof CEFR[number];
export type Letter = 'A' | 'B' | 'C' | 'D';
export const LETTERS: Letter[] = ['A', 'B', 'C', 'D'];

/** One question as the scraper writes it. Every field may be missing. */
export interface RawQuestion {
  number?: number | string;
  question?: string;
  prompt?: string;
  text?: string;
  page_text?: string;
  image_text?: string;
  question_on_image?: string;
  question_has_image?: string;
  image_paths?: string[];
  image_candidates?: string[];
  level?: string;
  points?: string | number;
  options?: Partial<Record<Letter, string>>;
  correct_letter?: string;
  explanation?: string;
  /** Scraper v2. */
  schema_version?: number;
  document_text?: string;
  document_has_table?: boolean;
  explanations?: string[];
  images?: RawImage[];
  quiz_series?: string;
  quiz_question_count?: string | number;
  quiz_minutes?: string | number;
  quiz_total_points?: string | number;
  quiz_description?: string;
}

/** An image found inside the document by scraper v2. */
export interface RawImage {
  index?: number;
  file?: string;
  role?: 'document' | 'illustration' | 'decorative';
  keep?: boolean;
  reason?: string;
  width?: number;
  height?: number;
  alt?: string;
  ocr_text?: string;
}

export interface ImportImage {
  /** Its number in the document ("[image N]"). */
  index: number;
  fileName: string;
  /** The file picked with the folder, when it is there. */
  file: File | null;
  role: 'document' | 'illustration' | 'decorative';
  keep: boolean;
  reason: string;
  width: number;
  height: number;
}

export type Severity = 'error' | 'warning' | 'info';
export type IssueCode =
  | 'no-document' | 'no-question' | 'question-in-document' | 'question-from-image' | 'ocr-document'
  | 'ocr-noise-removed' | 'image-dropped' | 'no-explanation' | 'bad-option' | 'bad-answer' | 'bad-level' | 'bad-points'
  | 'duplicate-number' | 'count-mismatch' | 'points-mismatch' | 'cut-document'
  | 'image-needed' | 'image-illustration' | 'image-missing' | 'image-too-many' | 'has-table';

export interface Issue { severity: Severity; code: IssueCode; message: string }

export interface ImportQuestion {
  /** Stable id within the import (folder + source number). */
  uid: string;
  /** Number in the source file. */
  number: number;
  passage: string;
  question: string;
  options: Record<Letter, string>;
  answer: Letter | '';
  level: Cefr | '';
  points: number;
  explanation: string;
  include: boolean;
  /** The admin changed it in the preview. */
  edited: boolean;
  /** Where the document came from, for the preview. */
  source: 'page' | 'ocr' | 'question' | 'none';
  /** Images of the document (scraper v2); at most one is imported. */
  images: ImportImage[];
  hasTable: boolean;
  issues: Issue[];
}

export interface ImportSeries {
  key: string;
  folder: string;
  name: string;
  number: number;
  description: string;
  durationMinutes: number;
  expectedQuestions: number | null;
  expectedPoints: number | null;
  questions: ImportQuestion[];
  include: boolean;
  /** Problems with the file itself (unreadable, empty…). */
  fileError: string | null;
  seriesIssues: Issue[];
}

const ISSUE: Record<IssueCode, { severity: Severity; message: string }> = {
  'no-document': { severity: 'error', message: 'No document and no question: nothing to show the learner.' },
  'no-question': { severity: 'warning', message: 'The question sentence is missing: write it before importing.' },
  'question-in-document': { severity: 'warning', message: 'The source put the document in the question field: it was moved to the document. Write the question.' },
  'question-from-image': { severity: 'warning', message: 'The question was read from an image (OCR): check its wording.' },
  'ocr-document': { severity: 'warning', message: 'The document only existed as an image and was read by OCR: check the text.' },
  'ocr-noise-removed': { severity: 'info', message: 'OCR noise from a decorative image was removed from the document.' },
  'image-dropped': { severity: 'info', message: 'The image is not imported: the document is stored as text.' },
  'no-explanation': { severity: 'info', message: 'No explanation for the answer.' },
  'bad-option': { severity: 'error', message: 'One of the four options is empty.' },
  'bad-answer': { severity: 'error', message: 'The correct answer is not A, B, C or D.' },
  'bad-level': { severity: 'error', message: 'The level is not A1 to C2.' },
  'bad-points': { severity: 'error', message: 'The points are not a number.' },
  'duplicate-number': { severity: 'error', message: 'Two questions have this number in the file.' },
  'cut-document': { severity: 'warning', message: 'The document seems cut off mid-sentence: complete it if you have the full text.' },
  'count-mismatch': { severity: 'warning', message: 'The number of questions differs from what the source announces.' },
  'points-mismatch': { severity: 'warning', message: 'The points differ from what the source announces.' },
  'image-needed': { severity: 'info', message: 'The image is part of the document: it is imported with the text.' },
  'image-illustration': { severity: 'warning', message: 'An illustration is left out: keep it if the question needs it.' },
  'image-missing': { severity: 'error', message: 'The image to import is not in the folder (images/): pick the folder again or leave the image out.' },
  'image-too-many': { severity: 'error', message: 'Only one image per question can be imported: keep one.' },
  'has-table': { severity: 'info', message: 'The document has a table: check its layout.' },
};

export const issue = (code: IssueCode): Issue => ({ code, ...ISSUE[code] });

/** Tidy text: Windows line breaks, trailing spaces, runs of blank lines. */
export function tidy(v: unknown): string {
  return String(v ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n').map(l => l.replace(/[ \t\u00a0]+$/g, '').replace(/^[ \t]+/g, '')).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Words a finished French sentence practically never ends on. */
const FUNCTION_WORDS = new Set((
  'le la les l un une des du de d au aux à a et ou mais donc car ni que qu qui dont où sur sous dans en par pour avec ' +
  'sans chez vers entre contre selon sont est était sera ont ai avons avez ce cet cette ces son sa ses leur leurs mon ' +
  'ma mes ton ta tes notre nos votre vos ne pas très si comme'
).split(' '));

/** The document stops on a function word: the source lost its end ("… plusieurs dénouements sont"). */
export const looksCut = (passage: string) => {
  const last = passage.trim().match(/([A-Za-zÀ-ÿ’']+)$/);
  if (!last) return false;
  const word = last[1].toLowerCase().split(/[’']/).pop() || '';
  return FUNCTION_WORDS.has(word);
};

const toNumber = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/** A sentence that asks something, rather than a document. */
const looksLikeQuestion = (s: string) => s.length <= 200 && (/[?？]\s*$/.test(s) || s.length < 90);

/** First integer in a text: "Série 26" → 26, "comprehension-ecrite-test-26" → 26. */
export const numberIn = (s: string): number => {
  const m = String(s).match(/(\d+)(?!.*\d)/);
  return m ? parseInt(m[1], 10) : 0;
};

/** Files of one series folder, by lower-case file name (images/…). */
export type FolderFiles = Map<string, File>;

/** Explanations of the source, without the same one twice. */
const mergeExplanations = (raw: RawQuestion): string => {
  const list = (raw.explanations?.length ? raw.explanations : [raw.explanation]).map(tidy).filter(Boolean);
  const key = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const out: string[] = [];
  for (const t of list) {
    const k = key(t);
    const dup = out.findIndex(o => { const ok = key(o); return ok === k || ok.includes(k) || k.includes(ok); });
    if (dup === -1) out.push(t);
    else if (t.length > out[dup].length) out[dup] = t;
  }
  return out.join('\n\n');
};

/** "C:\…\images\question_003.png" → "question_003.png". */
const baseName = (path: string) => path.split(/[\\/]/).pop() || '';

/** A drop cap is its own block on the page: "**D**" + "epuis un an…" → "Depuis un an…". */
const joinDropCaps = (text: string) => text.replace(/^(?:\*\*)?([A-ZÀ-ÖØ-Þ])(?:\*\*)?\n(?=[a-zà-öø-ÿ])/gm, '$1');

/** File names the source gives to icons and cut-outs placed next to a text. */
const DECORATIVE_NAME = /(?:^|[-_/])(?:icon|icone|picto|flag|drapeau|logo|nobg|emoji|avatar|badge|sticker)(?:[-_.]|$)/i;

/** Checks that depend on the document's images (scraper v2). */
const imageIssues = (images: ImportImage[]): Issue[] => {
  const issues: Issue[] = [];
  const kept = images.filter(i => i.keep);
  if (kept.length > 1) issues.push(issue('image-too-many'));
  if (kept.some(i => !i.file)) issues.push(issue('image-missing'));
  else if (kept.length) issues.push(issue('image-needed'));
  if (images.some(i => i.role === 'illustration' && !i.keep)) issues.push(issue('image-illustration'));
  return issues;
};

/** Cleans one scraped question and lists its problems. */
export function normalizeQuestion(raw: RawQuestion, folderKey: string, index: number, files: FolderFiles = new Map()): ImportQuestion {
  const issues: Issue[] = [];
  const number = toNumber(raw.number) ?? index + 1;
  const v2 = Number(raw.schema_version) >= 2 && typeof raw.document_text === 'string';
  const pageText = tidy(raw.page_text);
  const text = tidy(raw.text);
  const hadImage = raw.question_has_image === 'yes' || (raw.image_paths?.length ?? 0) > 0;
  let question = tidy(raw.question ?? raw.prompt);

  let passage = '';
  let source: ImportQuestion['source'] = 'none';
  if (v2 && tidy(raw.document_text)) {
    // Scraper v2: the document with its tables and image slots.
    passage = joinDropCaps(tidy(raw.document_text));
    source = 'page';
  } else if (pageText) {
    // The page text when there is one (it is what the page showed);
    passage = pageText;
    source = 'page';
    if (text && text !== pageText && text.startsWith(pageText)) issues.push(issue('ocr-noise-removed'));
  } else if (text) {
    // otherwise the extracted text, which for an image-only document is OCR.
    passage = text;
    source = hadImage ? 'ocr' : 'page';
    if (hadImage && !v2) issues.push(issue('ocr-document'));
  }

  // Some sources lost the document and put it in the question field instead.
  if (!passage && question && !looksLikeQuestion(question)) {
    passage = question;
    question = '';
    source = 'question';
    issues.push(issue('question-in-document'));
  }

  const images: ImportImage[] = v2
    ? (raw.images || []).map((img, i) => {
      const fileName = String(img.file || '');
      const file = fileName ? files.get(fileName.toLowerCase()) || null : null;
      const role = img.role === 'document' || img.role === 'illustration' ? img.role : 'decorative';
      return {
        index: Number(img.index) || i + 1,
        fileName,
        file,
        role,
        keep: !!img.keep && role === 'document',
        reason: String(img.reason || ''),
        width: Number(img.width) || 0,
        height: Number(img.height) || 0,
      };
    })
    : [];

  // The document walk found no image but the page scan saved one (older
  // scraper, or a layout it missed): that image becomes image 1. When the only
  // document text is its OCR, the learner sees the image instead of the OCR.
  const legacyPath = (raw.image_paths || []).find(Boolean);
  const legacyFile = legacyPath ? files.get(baseName(legacyPath).toLowerCase()) || null : null;
  if (!images.length && legacyPath && legacyFile) {
    const ocrText = tidy(raw.image_text);
    const imageOnly = source === 'ocr' || (!pageText && !!ocrText && (passage === ocrText || passage === text));
    const decorative = DECORATIVE_NAME.test([...(raw.image_candidates || []), legacyPath].join(' '));
    const role: ImportImage['role'] = imageOnly ? 'document' : decorative ? 'decorative' : 'illustration';
    images.push({
      index: 1,
      fileName: baseName(legacyPath),
      file: legacyFile,
      role,
      keep: imageOnly,
      reason: imageOnly
        ? 'The document only existed as this image: the learner sees the image, not its OCR text.'
        : decorative ? 'Icon or cut-out next to the text.' : 'Picture next to the text: keep it if the question needs it.',
      width: 0,
      height: 0,
    });
    passage = imageOnly ? '[image 1]' : `[image 1]\n${passage}`.trim();
    if (imageOnly) source = 'page';
    for (let k = issues.length - 1; k >= 0; k -= 1) {
      if (issues[k].code === 'ocr-document' || issues[k].code === 'ocr-noise-removed') issues.splice(k, 1);
    }
  }
  const hasImage = images.some(i => i.keep);

  if (!passage.trim() && !question && !hasImage) issues.push(issue('no-document'));
  else if (!question && source !== 'question') issues.push(issue('no-question'));
  const plain = ceDocumentPlain(passage);
  if (plain && looksCut(plain)) issues.push(issue('cut-document'));
  if (raw.question_on_image === 'yes' && question) issues.push(issue('question-from-image'));
  if (!images.length && hadImage && source !== 'ocr') issues.push(issue('image-dropped'));
  issues.push(...imageIssues(images));
  const hasTable = v2 ? !!raw.document_has_table : /^\|.*\|$/m.test(passage);
  if (hasTable) issues.push(issue('has-table'));

  const options = { A: '', B: '', C: '', D: '' } as Record<Letter, string>;
  for (const k of LETTERS) options[k] = tidy(raw.options?.[k]);
  if (LETTERS.some(k => !options[k])) issues.push(issue('bad-option'));

  const letter = String(raw.correct_letter ?? '').trim().toUpperCase();
  const answer = (LETTERS as string[]).includes(letter) ? (letter as Letter) : '';
  if (!answer) issues.push(issue('bad-answer'));

  const lvl = String(raw.level ?? '').trim().toUpperCase();
  const level = (CEFR as readonly string[]).includes(lvl) ? (lvl as Cefr) : '';
  if (!level) issues.push(issue('bad-level'));

  const pts = toNumber(raw.points);
  if (pts === null || pts < 0) issues.push(issue('bad-points'));

  const explanation = mergeExplanations(raw);
  if (!explanation) issues.push(issue('no-explanation'));

  const q: ImportQuestion = {
    uid: `${folderKey}#${number}`,
    number,
    passage,
    question,
    options,
    answer,
    level,
    points: pts ?? 0,
    explanation,
    include: true,
    edited: false,
    source,
    images,
    hasTable,
    issues,
  };
  // A question with nothing to show is left out until someone completes it.
  q.include = !issues.some(i => i.severity === 'error');
  return q;
}

/**
 * Re-checks a question after an edit in the preview. Facts about the source stay
 * (image dropped, OCR noise removed); OCR warnings are answered once someone has
 * read the question and saved it.
 */
export function recheck(q: ImportQuestion): ImportQuestion {
  const issues: Issue[] = q.issues.filter(i => i.code === 'image-dropped' || i.code === 'ocr-noise-removed');
  if (!q.edited) issues.push(...q.issues.filter(i => i.code === 'ocr-document' || i.code === 'question-from-image'));
  const hasImage = q.images.some(i => i.keep);
  if (!q.passage.trim() && !q.question.trim() && !hasImage) issues.push(issue('no-document'));
  else if (!q.question.trim()) issues.push(issue(q.source === 'question' && !q.edited ? 'question-in-document' : 'no-question'));
  const plain = ceDocumentPlain(q.passage);
  if (plain && looksCut(plain)) issues.push(issue('cut-document'));
  issues.push(...imageIssues(q.images));
  if (/^\|.*\|$/m.test(q.passage)) issues.push(issue('has-table'));
  if (LETTERS.some(k => !q.options[k].trim())) issues.push(issue('bad-option'));
  if (!q.answer) issues.push(issue('bad-answer'));
  if (!q.level) issues.push(issue('bad-level'));
  if (!(q.points >= 0)) issues.push(issue('bad-points'));
  if (!q.explanation.trim()) issues.push(issue('no-explanation'));
  return { ...q, hasTable: /^\|.*\|$/m.test(q.passage), issues };
}

/** The image a question imports, if any. */
export const importedImage = (q: ImportQuestion) => q.images.find(i => i.keep && i.file) || null;

/**
 * The document as stored: the slot of the imported image becomes "[image]",
 * the slots of images left out disappear.
 */
export function storedPassage(q: ImportQuestion): string {
  const kept = importedImage(q);
  return q.passage
    .split('\n')
    .flatMap(line => {
      const m = line.trim().match(/^\[image(?:\s+(\d+))?\]$/i);
      if (!m) return [line];
      return kept && Number(m[1] || 1) === kept.index ? ['[image]'] : [];
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Cleans one series file. */
export function normalizeSeries(folder: string, raw: unknown, files: FolderFiles = new Map()): ImportSeries {
  const key = folder;
  const base: ImportSeries = {
    key, folder, name: '', number: numberIn(folder), description: '', durationMinutes: 60,
    expectedQuestions: null, expectedPoints: null, questions: [], include: false, fileError: null, seriesIssues: [],
  };
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ...base, name: fallbackName(folder), fileError: 'tcf_questions.json is empty or is not a list of questions.' };
  }
  const list = raw as RawQuestion[];
  const first = list[0] || {};
  const name = tidy(first.quiz_series) || fallbackName(folder);
  const questions = list.map((q, i) => normalizeQuestion(q, key, i, files)).sort((a, b) => a.number - b.number);

  const seen = new Map<number, number>();
  questions.forEach(q => seen.set(q.number, (seen.get(q.number) || 0) + 1));
  for (const q of questions) {
    if ((seen.get(q.number) || 0) > 1) {
      q.issues.push(issue('duplicate-number'));
      q.include = false;
    }
  }

  const s: ImportSeries = {
    ...base,
    name,
    number: numberIn(name) || numberIn(folder),
    description: tidy(first.quiz_description),
    durationMinutes: Math.max(1, Math.round(toNumber(first.quiz_minutes) ?? 60)),
    expectedQuestions: toNumber(first.quiz_question_count),
    expectedPoints: toNumber(first.quiz_total_points),
    questions,
    include: true,
  };
  return withSeriesIssues(s);
}

const fallbackName = (folder: string) => {
  const n = numberIn(folder);
  return n ? `Série ${n}` : folder;
};

/** Totals of what would be imported. */
export function seriesTotals(s: ImportSeries) {
  const kept = s.questions.filter(q => q.include);
  return {
    questions: kept.length,
    points: kept.reduce((t, q) => t + q.points, 0),
    excluded: s.questions.length - kept.length,
    errors: kept.filter(q => q.issues.some(i => i.severity === 'error')).length,
    warnings: kept.filter(q => q.issues.some(i => i.severity === 'warning')).length,
    noExplanation: kept.filter(q => !q.explanation).length,
  };
}

/** Series-level checks: counts and points against what the source announces. */
export function withSeriesIssues(s: ImportSeries): ImportSeries {
  const t = seriesTotals(s);
  const seriesIssues: Issue[] = [];
  if (s.expectedQuestions !== null && t.questions !== s.expectedQuestions) {
    seriesIssues.push({ ...issue('count-mismatch'), message: `${t.questions} of the ${s.expectedQuestions} questions announced will be imported.` });
  }
  if (s.expectedPoints !== null && Math.round(t.points) !== Math.round(s.expectedPoints)) {
    seriesIssues.push({ ...issue('points-mismatch'), message: `The questions add up to ${t.points} points, the source announces ${s.expectedPoints}.` });
  }
  return { ...s, seriesIssues };
}

/** Whether a question can be sent as it is. */
export const questionBlocked = (q: ImportQuestion) => q.issues.some(i => i.severity === 'error');

/** Whether a series can be sent: it has questions, and none of the kept ones has an error. */
export function seriesBlocked(s: ImportSeries): string | null {
  if (s.fileError) return s.fileError;
  const kept = s.questions.filter(q => q.include);
  if (!kept.length) return 'No question to import.';
  const bad = kept.filter(questionBlocked);
  if (bad.length) return `Question${bad.length > 1 ? 's' : ''} ${bad.map(q => q.number).join(', ')} must be fixed or left out.`;
  return null;
}

/** One series folder of a picked folder: its tcf_questions.json and the files beside it. */
export interface SeriesFolder { folder: string; json: File; files: FolderFiles }

/** The files of a picked folder, grouped by series folder (the folder that holds tcf_questions.json). */
export function groupSeriesFiles(files: File[]): SeriesFolder[] {
  const pathOf = (f: File) => (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;
  const out: SeriesFolder[] = [];
  const kept = files.filter(f => !/_original_(images|audio)_backup/i.test(pathOf(f)));
  for (const f of kept) {
    const parts = pathOf(f).split('/');
    if (parts[parts.length - 1].toLowerCase() !== 'tcf_questions.json') continue;
    const folder = parts.length >= 2 ? parts[parts.length - 2] : 'series';
    const prefix = parts.slice(0, -1).join('/') + '/';
    // Images and other files that live under this series folder (images/…).
    const own: FolderFiles = new Map();
    for (const g of kept) {
      const p = pathOf(g);
      if (g !== f && (prefix === '/' || p.startsWith(prefix))) own.set(p.split('/').pop()!.toLowerCase(), g);
    }
    out.push({ folder, json: f, files: own });
  }
  return out.sort((a, b) => numberIn(a.folder) - numberIn(b.folder) || a.folder.localeCompare(b.folder));
}

/** Reads every series file of a picked folder. */
export async function readSeriesFiles(
  entries: SeriesFolder[],
  onProgress?: (done: number, total: number) => void,
): Promise<ImportSeries[]> {
  const out: ImportSeries[] = [];
  let done = 0;
  for (const e of entries) {
    try {
      out.push(normalizeSeries(e.folder, JSON.parse(await e.json.text()), e.files));
    } catch (err) {
      out.push({
        key: e.folder, folder: e.folder, name: fallbackName(e.folder), number: numberIn(e.folder), description: '',
        durationMinutes: 60, expectedQuestions: null, expectedPoints: null, questions: [], include: false,
        fileError: `tcf_questions.json could not be read: ${(err as Error).message}`, seriesIssues: [],
      });
    }
    onProgress?.(++done, entries.length);
  }
  return out.sort((a, b) => a.number - b.number || a.name.localeCompare(b.name));
}

/**
 * One import request. Questions are renumbered 1..n in their source order; an
 * imported image travels as the file field "image_<order>", so a series with
 * images is sent as multipart form data (see importBody).
 */
export function importPayload(s: ImportSeries, categoryId: number, seriesId: number | null) {
  const kept = s.questions.filter(q => q.include);
  const files: { field: string; file: File }[] = [];
  const questions = kept.map((q, i) => {
    const order = i + 1;
    const image = importedImage(q);
    if (image?.file) files.push({ field: `image_${order}`, file: image.file });
    return {
      question_order: order,
      question_text: q.question,
      passage_text: storedPassage(q),
      explanation: q.explanation,
      option_a: q.options.A, option_b: q.options.B, option_c: q.options.C, option_d: q.options.D,
      correct_answer: q.answer, cefr_level: q.level, points: q.points,
      ...(image?.file ? { image_field: `image_${order}` } : {}),
    };
  });
  return {
    body: {
      category_id: categoryId,
      ...(seriesId ? { series_id: seriesId } : {}),
      series: { name: s.name, description: s.description, duration_minutes: s.durationMinutes },
      questions,
    },
    files,
  };
}

/** The request body: JSON, or multipart with the payload in "payload" when images travel with it. */
export function importBody(payload: ReturnType<typeof importPayload>): BodyInit {
  if (!payload.files.length) return JSON.stringify(payload.body);
  const form = new FormData();
  form.append('payload', JSON.stringify(payload.body));
  for (const f of payload.files) form.append(f.field, f.file, f.file.name);
  return form;
}

/** The body of the plan request: names and answer options, enough to match existing series. */
export function planPayload(series: ImportSeries[], categoryId: number) {
  return {
    category_id: categoryId,
    series: series.filter(s => !s.fileError).map(s => ({
      key: s.key,
      name: s.name,
      questions: s.questions.filter(q => q.include).map(q => ({
        option_a: q.options.A, option_b: q.options.B, option_c: q.options.C, option_d: q.options.D,
      })),
    })),
  };
}

export interface PlanEntry {
  key: string;
  existing: { id: number; name: string; question_count: number; image_count: number; text_count: number; attempt_count: number } | null;
  matched?: number;
  added?: number;
  removed?: number;
}
