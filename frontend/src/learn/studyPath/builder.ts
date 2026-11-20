// Deterministic Study-Path Builder for all 24 tracks (4 Goals × 6 CEFR Levels).
// Combines real catalog items across Courses, Listening (Dialogues, Ear, Audio Docs),
// Reading (Texts & Missions), Dictations (all 4 methods), and Games into crisp,
// mixed-skill numbered Modules with zero duplicates and zero broken links.
import { COURSES, courseById, coursePath } from '../catalog';
import { GAMES, gamePath } from '../games/meta';
import { AUTOSTART, placementPath } from '../paths';
import { TEXTS, textPath } from '../practice/meta';
import { MISSIONS, missionPath } from '../practice/missions';
import { DIALOGUES, dialoguePath } from '../practice/dialogues/meta';
import { EAR, earPath } from '../practice/ear/meta';
import { LISTENING, exercisePath } from '../practice/listening/catalog';
import { DICTATIONS, dictationCoursePath } from '../practice/dictation/catalog';
import type { DictationCourse, DictationMethod } from '../practice/dictation/types';
import { LEVELS, b, tx, type CourseMeta, type Lang, type Level, type T } from '../types';
import type { StudyGoalId, StudyModule, StudyPlan, StudyStep } from './types';

export interface LevelActivityStats {
  level: Level;
  courses: number;
  ladder: number;
  reading: number;
  listening: number;
  dictations: number;
  total: number;
}

/** Exact free activity counts available at one CEFR level. */
export function levelActivityStats(level: Level): LevelActivityStats {
  const courses = COURSES.filter(c => !c.ladder && c.levels.includes(level)).length;
  const ladder = COURSES.filter(c => c.ladder && c.levels.includes(level)).length;
  const reading = TEXTS.filter(t => t.level === level).length + MISSIONS.filter(m => m.level === level).length;
  const listening =
    DIALOGUES.filter(d => d.level === level).length +
    EAR.filter(e => e.level === level).length +
    LISTENING.filter(l => l.level === level).length;
  const dictations = DICTATIONS.filter(d => d.level === level).length;
  return {
    level,
    courses,
    ladder,
    reading,
    listening,
    dictations,
    total: courses + ladder + reading + listening + dictations,
  };
}

/** Total free learning resources across the entire academy (488). */
export const TOTAL_ACADEMY_ITEMS =
  COURSES.length +
  TEXTS.length +
  MISSIONS.length +
  DIALOGUES.length +
  EAR.length +
  LISTENING.length +
  DICTATIONS.length +
  GAMES.length +
  1; // Adaptive Placement Test

const METHOD_LABEL: Record<DictationMethod, T> = {
  story: b('Classic story', 'Récit guidé'),
  homophones: b('Homophone duel', 'Duel d’homophones'),
  conjugation: b('Verbs & agreement', 'Verbes & accords'),
  exam: b('Timed exam drill', 'Défi examen'),
};

interface ModuleBlueprints {
  title: T;
  theme: T;
  courseId?: string;
  ladderId?: string;
  dialogueId?: string;
  earId?: string;
  preferDoc?: boolean;
  preferMission?: boolean;
  dictMethod?: DictationMethod;
}

/** Curated pedagogical syllabus titles & core courses for Goal 1: Complete French. */
const COMPLETE_MODULES: Record<Level, ModuleBlueprints[]> = {
  A1: [
    {
      title: b('First Greetings & Core Sounds', 'Premiers échanges & sons clés'),
      theme: b('Introduce yourself politely, hear French sounds and write your first short story.', 'Se présenter avec aisance, apprivoiser les sons et réussir sa première dictée.'),
      courseId: 'first-steps', dialogueId: 'a-la-boulangerie', dictMethod: 'story',
    },
    {
      title: b('Numbers, Time & Spoken Rhythm', 'Nombres, heure & rythme oral'),
      theme: b('Catch numbers and times at native speed, read simple notices and practice accents.', 'Comprendre prix et horaires à vitesse réelle, lire un texte court et maîtriser les accents.'),
      courseId: 'numbers-time', earId: 'les-nombres-qui-piegent', dictMethod: 'story',
    },
    {
      title: b('Everyday Life, Family & Routine', 'Vie quotidienne, famille & routine'),
      theme: b('Describe your day, follow a workplace dialogue and complete your first reading mission.', 'Raconter sa journée, suivre un dialogue au travail et réussir une mission de lecture.'),
      courseId: 'everyday-life', dialogueId: 'le-premier-jour', preferMission: true, dictMethod: 'homophones',
    },
    {
      title: b('Food, Shopping & Articles', 'Courses, repas & articles'),
      theme: b('Master un/une/du/de la, listen to real announcements and drill common homophones.', 'Maîtriser les articles, écouter un document réel et éviter les pièges d’homophones.'),
      courseId: 'food-shopping', preferDoc: true, dictMethod: 'conjugation',
    },
    {
      title: b('Health, City & Silent Letters', 'Santé, ville & lettres muettes'),
      theme: b('Handle pharmacy & transit situations and link spoken words to correct spelling.', 'Gérer pharmacie et transports tout en reliant prononciation et orthographe.'),
      courseId: 'body-health', dialogueId: 'a-la-pharmacie', preferMission: true, dictMethod: 'story',
    },
    {
      title: b('Survival Conversations & A1 Wrap-Up', 'Conversations clés & bilan A1'),
      theme: b('Combine real-world dialogues, short reading and an authentic timed A1 dictation.', 'Consolider tout votre niveau A1 avec dialogue, lecture et dictée défi.'),
      courseId: 'survival-dialogues', dialogueId: 'un-ticket-de-bus', dictMethod: 'exam',
    },
  ],
  A2: [
    {
      title: b('Travel French & Getting Around', 'Voyager & se repérer'),
      theme: b('Ask directions, check in smoothly and write fluent everyday narratives.', 'Demander son chemin, réserver et écrire un récit fluide du quotidien.'),
      courseId: 'travel-french', dialogueId: 'demander-son-chemin', dictMethod: 'story',
    },
    {
      title: b('Past Tenses & Stories', 'Temps du passé & récits'),
      theme: b('Tell what happened with passé composé & imparfait and hear spoken intonation clearly.', 'Raconter au passé composé et à l’imparfait tout en affinant son oreille.'),
      courseId: 'past-tenses', earId: 'question-ou-affirmation', dictMethod: 'conjugation',
    },
    {
      title: b('Appointments, Health & Services', 'Rendez-vous, santé & services'),
      theme: b('Book appointments by phone, solve a guided reading mission and avoid homophone traps.', 'Prendre rendez-vous par téléphone, résoudre une mission et déjouer les homophones.'),
      courseId: 'appointments-services', dialogueId: 'prendre-rendez-vous-chez-le-medecin', preferMission: true, dictMethod: 'homophones',
    },
    {
      title: b('Housing, Papers & Daily Life', 'Logement, démarches & vie pratique'),
      theme: b('Navigate landlords and practical French documents with real native audio.', 'Échanger avec un propriétaire et décoder des documents authentiques.'),
      courseId: 'settling-in-canada', dialogueId: 'appeler-le-proprietaire', preferDoc: true, dictMethod: 'story',
    },
    {
      title: b('Natural Small Talk & Nasal Sounds', 'Conversations naturelles & voyelles'),
      theme: b('Keep everyday exchanges flowing and distinguish subtle French sounds with ease.', 'Maintenir une conversation naturelle et distinguer les sons proches.'),
      courseId: 'small-talk', earId: 'vent-vont-vin', preferMission: true, dictMethod: 'conjugation',
    },
    {
      title: b('Spelling Precision & A2 Milestone', 'Orthographe juste & cap A2'),
      theme: b('Lock in A2 spelling, restaurant conversations and a timed exam-style dictation.', 'Sécuriser l’orthographe A2 avant de franchir le cap vers le niveau B1.'),
      courseId: 'spelling-homophones', dialogueId: 'reserver-au-restaurant', dictMethod: 'exam',
    },
  ],
  B1: [
    {
      title: b('Future, Conditional & Spoken Tenses', 'Futur, conditionnel & temps à l’oral'),
      theme: b('Express hypotheses and plans clearly, recognize tenses by ear and write cleanly.', 'Exprimer projets et hypothèses, reconnaître les temps à l’oral et écrire juste.'),
      courseId: 'future-conditional', earId: 'passe-present-ou-futur', dictMethod: 'story',
    },
    {
      title: b('Real Spoken French & Work Interviews', 'Vrai français parlé & entretien'),
      theme: b('Decode everyday native contractions, follow a job interview and tackle a B1 mission.', 'Comprendre le français parlé réel, réussir un entretien et une mission guidée.'),
      courseId: 'spoken-french', dialogueId: 'l-entretien-d-embauche', preferMission: true, dictMethod: 'conjugation',
    },
    {
      title: b('Relative Clauses & News Reading', 'Pronoms relatifs & actualité'),
      theme: b('Build fluid connected sentences, follow authentic radio clips and master homophones.', 'Structurer des phrases riches, écouter un document réel et maîtriser les homophones.'),
      courseId: 'relative-pronouns', preferDoc: true, dictMethod: 'homophones',
    },
    {
      title: b('Workplace Emails & Administration', 'Courriels pro & démarches'),
      theme: b('Write clear professional messages, understand official calls and practice agreement.', 'Rédiger des courriels pro, gérer la CAF et affiner les accords grammaticaux.'),
      courseId: 'pro-emails', dialogueId: 'un-dossier-a-la-caf', preferMission: true, dictMethod: 'story',
    },
    {
      title: b('Agreements, Fast Speech & Nuance', 'Accords, oral rapide & nuances'),
      theme: b('Tackle past participle agreements and fast everyday speech without hesitation.', 'Maîtriser les accords clés et suivre le débit rapide des locuteurs natifs.'),
      courseId: 'spelling-agreement', earId: 'le-francais-qui-se-raccourcit', dictMethod: 'conjugation',
    },
    {
      title: b('Québec French, Travel & B1 Milestone', 'Français québécois & cap B1'),
      theme: b('Adapt to real Francophone accents and finish B1 with a full exam-mode dictation.', 'S’adapter aux accents francophones et valider le B1 par une dictée chronométrée.'),
      courseId: 'quebec-french', dialogueId: 'un-train-en-retard', preferMission: true, dictMethod: 'exam',
    },
  ],
  B2: [
    {
      title: b('The Subjunctive & Discourse Markers', 'Subjonctif & marqueurs de l’oral'),
      theme: b('Use the subjunctive naturally, follow native connectors and elevate written accuracy.', 'Maîtriser le subjonctif, suivre la logique orale native et affiner sa plume.'),
      courseId: 'subjunctive', earId: 'les-petits-mots-de-l-oral', dictMethod: 'story',
    },
    {
      title: b('Opinions, Debate & Career Reviews', 'Opinion, débat & bilan annuel'),
      theme: b('Defend nuanced viewpoints, handle an annual review and resolve complex homophones.', 'Défendre un point de vue nuancé, négocier au travail et éviter les homophones pièges.'),
      courseId: 'opinions-debate', dialogueId: 'l-entretien-annuel', preferMission: true, dictMethod: 'homophones',
    },
    {
      title: b('Job Interviews & Complex Audio', 'Entretiens pro & documents longs'),
      theme: b('Present achievements persuasively, analyze authentic audio reports and drill verbs.', 'Valoriser son parcours, analyser un reportage audio et perfectionner les conjugaisons.'),
      courseId: 'job-interview', preferDoc: true, dictMethod: 'conjugation',
    },
    {
      title: b('French Idioms & Everyday Negotiation', 'Expressions imagées & négociation'),
      theme: b('Use idiomatic expressions naturally, resolve tenant disputes and read with nuance.', 'Employer les expressions courantes, argumenter un litige et lire entre les lignes.'),
      courseId: 'french-idioms', dialogueId: 'le-depot-de-garantie', preferMission: true, dictMethod: 'story',
    },
    {
      title: b('Classic Stories & Written Precision', 'Récits classiques & précision écrite'),
      theme: b('Read rich French literature, follow complex audio and sharpen advanced orthography.', 'Lire la littérature française, décoder l’audio soutenu et soigner les accords rares.'),
      courseId: 'classic-stories', preferDoc: true, dictMethod: 'homophones',
    },
    {
      title: b('Upper-Intermediate Milestone (B2 / NCLC 7)', 'Cap B2 / NCLC 7 & synthèse'),
      theme: b('Consolidate argumentation, administrative precision and a timed B2 exam dictation.', 'Consolider le niveau B2 (NCLC 7) avec une préparation complète et dictée examen.'),
      courseId: 'delf-b2', dialogueId: 'une-erreur-sur-les-impots', dictMethod: 'exam',
    },
  ],
  C1: [
    {
      title: b('Advanced Structures & Listening Nuance', 'Structures avancées & finesse orale'),
      theme: b('Master formal grammar, passive & nominalisation alongside advanced native ear labs.', 'Maîtriser la syntaxe soutenue, la nominalisation et les subtilités de l’écoute native.'),
      ladderId: 'tcf-grammar', dictMethod: 'story',
    },
    {
      title: b('Autonomous Fluency & Negotiation', 'Autonomie, nuance & négociation'),
      theme: b('Prepare DALF-grade argumentation, negotiate remote work and sharpen homophones.', 'Construire une argumentation niveau DALF, négocier et verrouiller les homophones rares.'),
      courseId: 'dalf-c1', dialogueId: 'negocier-le-teletravail', dictMethod: 'homophones',
    },
    {
      title: b('Literary Analysis & Implicit Meaning', 'Lecture littéraire & implicite'),
      theme: b('Read demanding French prose, catch ironic tone by ear and refine verb agreements.', 'Lire des textes exigeants, percevoir l’implicite et maîtriser les accords complexes.'),
      courseId: 'classic-stories', preferDoc: true, dictMethod: 'conjugation',
    },
    {
      title: b('Public Debate & Structured Writing', 'Débat public & rédaction structurée'),
      theme: b('Weigh competing viewpoints in debates and write cohesive, persuasive C1 French.', 'Peser le pour et le contre à l’oral comme à l’écrit avec rigueur et élégance.'),
      ladderId: 'tcf-writing', dialogueId: 'les-transports-de-demain', dictMethod: 'story',
    },
    {
      title: b('Spontaneous Expression & C1 Synthesis', 'Expression spontanée & synthèse C1'),
      theme: b('Combine high-level speaking, complex audio analysis and a timed C1 exam dictation.', 'Allier aisance orale soutenue, écoute complexe et dictée chronométrée C1.'),
      ladderId: 'tcf-speaking', preferDoc: true, dictMethod: 'exam',
    },
  ],
  C2: [
    {
      title: b('Fast Idiomatic Listening & Subtlety', 'Écoute experte & oral idiomatique'),
      theme: b('Decode rapid native speech, subtle irony and nuanced cultural references effortlessly.', 'Décoder le débit natif rapide, l’ironie fine et les références implicites sans effort.'),
      ladderId: 'tcf-listening', dictMethod: 'story',
    },
    {
      title: b('Critical Reading & Register Mastery', 'Lecture critique & registres de langue'),
      theme: b('Analyze press essays, rhetorical framing and rare orthographic distinctions.', 'Analyser essais et tribunes, maîtriser les registres et les subtilités orthographiques.'),
      ladderId: 'tcf-reading', dictMethod: 'homophones',
    },
    {
      title: b('High-Style Writing & Complex Verbs', 'Style soutenu & conjugaisons rares'),
      theme: b('Write with editorial precision, subtle syntax and flawless literary agreements.', 'Écrire avec précision éditoriale, maîtrise syntaxique et accords irréprochables.'),
      ladderId: 'tcf-writing', dictMethod: 'conjugation',
    },
    {
      title: b('Persuasive Rhetoric & Francophone Fluency', 'Rhétorique & maîtrise francophone'),
      theme: b('Argue spontaneously across registers, including fast Québec & international French.', 'Argumenter spontanément dans tous les registres, y compris en français québécois.'),
      ladderId: 'tef-speaking', dictMethod: 'story',
    },
    {
      title: b('Expert Grammar & C2 Orthography', 'Grammaire experte & synthèse C2'),
      theme: b('Complete your C2 mastery with expert grammar, demanding audio and a timed dictation.', 'Parachever votre maîtrise C2 avec grammaire experte, audio avancé et dictée défi.'),
      ladderId: 'tcf-grammar', dictMethod: 'exam',
    },
  ],
};

/** Helper pools per level with deduplication cursors so no item repeats inside a Study Plan. */
class LevelPool {
  private usedCourses = new Set<string>();
  private usedDialogues = new Set<string>();
  private usedEar = new Set<string>();
  private usedDocs = new Set<string>();
  private usedTexts = new Set<string>();
  private usedMissions = new Set<string>();
  private usedDicts = new Set<string>();

  private level: Level;
  private lang: Lang;

  constructor(level: Level, lang: Lang) {
    this.level = level;
    this.lang = lang;
  }

  private get fr() {
    return this.lang === 'fr';
  }

  courseStep(id: string): StudyStep | null {
    const c = courseById(id);
    if (!c) return null;
    const key = c.ladder ? `${c.id}:${this.level}` : c.id;
    if (this.usedCourses.has(key)) return null;
    this.usedCourses.add(key);
    return this.formatCourse(c);
  }

  nextCourse(preferredCategories?: string[], allowLadder = true): StudyStep | null {
    const candidates = COURSES.filter(c => {
      if (!c.levels.includes(this.level)) return false;
      if (!allowLadder && c.ladder) return false;
      const key = c.ladder ? `${c.id}:${this.level}` : c.id;
      return !this.usedCourses.has(key);
    });

    let chosen: CourseMeta | undefined;
    if (preferredCategories?.length) {
      for (const cat of preferredCategories) {
        chosen = candidates.find(c => c.category === cat && !c.ladder) ?? candidates.find(c => c.category === cat);
        if (chosen) break;
      }
    }
    if (!chosen) {
      chosen = candidates.find(c => !c.ladder) ?? candidates[0];
    }
    if (!chosen) return null;
    const key = chosen.ladder ? `${chosen.id}:${this.level}` : chosen.id;
    this.usedCourses.add(key);
    return this.formatCourse(chosen);
  }

  private formatCourse(c: CourseMeta): StudyStep {
    if (c.ladder) {
      return {
        id: `ladder-${c.id}-${this.level}`,
        kind: 'course',
        source: { type: 'ladder', id: c.id, level: this.level },
        title: tx(c.title, this.lang),
        subtitle: tx(c.subtitle, this.lang),
        badge: this.fr ? `Parcours examen · Palier ${this.level}` : `Exam ladder · ${this.level} lesson`,
        level: this.level,
        minutes: Math.max(12, Math.round(c.minutes / c.lessonCount)),
        to: coursePath(c, this.lang),
        autostart: false,
      };
    }
    return {
      id: `course-${c.id}`,
      kind: 'course',
      source: { type: 'course', id: c.id, lessonCount: c.lessonCount },
      title: tx(c.title, this.lang),
      subtitle: tx(c.subtitle, this.lang),
      badge: this.fr ? `Cours · ${c.lessonCount} leçons` : `Course · ${c.lessonCount} lessons`,
      level: this.level,
      minutes: c.minutes,
      to: coursePath(c, this.lang),
      autostart: true,
    };
  }

  dialogueStep(id?: string): StudyStep | null {
    const d = id
      ? DIALOGUES.find(x => x.id === id && !this.usedDialogues.has(x.id))
      : DIALOGUES.find(x => x.level === this.level && !this.usedDialogues.has(x.id));
    if (!d) return null;
    this.usedDialogues.add(d.id);
    return {
      id: `dialogue-${d.id}`,
      kind: 'listen',
      source: { type: 'dialogue', id: d.id },
      title: d.title,
      subtitle: tx(d.summary, this.lang),
      badge: this.fr ? 'Dialogue natif · 2 voix' : 'Native dialogue · 2 voices',
      level: d.level,
      minutes: 6,
      to: dialoguePath(d, this.lang),
    };
  }

  earStep(id?: string): StudyStep | null {
    const e = id
      ? EAR.find(x => x.id === id && !this.usedEar.has(x.id))
      : EAR.find(x => x.level === this.level && !this.usedEar.has(x.id));
    if (!e) return null;
    this.usedEar.add(e.id);
    return {
      id: `ear-${e.id}`,
      kind: 'listen',
      source: { type: 'ear', id: e.id },
      title: e.title,
      subtitle: tx(e.summary, this.lang),
      badge: this.fr ? `Oreille · ${tx(e.tag, this.lang)}` : `Ear lab · ${tx(e.tag, this.lang)}`,
      level: e.level,
      minutes: e.minutes,
      to: earPath(e, this.lang),
    };
  }

  docStep(): StudyStep | null {
    const doc = LISTENING.find(x => x.level === this.level && !this.usedDocs.has(x.id));
    if (!doc) return null;
    this.usedDocs.add(doc.id);
    const qCount = doc.count ?? doc.questions.length;
    return {
      id: `doc-${doc.id}`,
      kind: 'listen',
      source: { type: 'doc', id: doc.id },
      title: doc.title,
      subtitle: tx(doc.summary, this.lang),
      badge: `${tx(doc.format, this.lang)} · ${qCount} Q`,
      level: doc.level,
      minutes: 7,
      to: exercisePath(doc, this.lang),
    };
  }

  /** Pick the best available listening step at this level (respecting preference). */
  nextListen(pref?: { dialogueId?: string; earId?: string; preferDoc?: boolean; preferEar?: boolean }): StudyStep | null {
    if (pref?.dialogueId) {
      const s = this.dialogueStep(pref.dialogueId);
      if (s) return s;
    }
    if (pref?.earId) {
      const s = this.earStep(pref.earId);
      if (s) return s;
    }
    if (pref?.preferDoc) {
      return this.docStep() ?? this.earStep() ?? this.dialogueStep();
    }
    if (pref?.preferEar) {
      return this.earStep() ?? this.docStep() ?? this.dialogueStep();
    }
    return this.dialogueStep() ?? this.earStep() ?? this.docStep();
  }

  textStep(): StudyStep | null {
    const t = TEXTS.find(x => x.level === this.level && !this.usedTexts.has(x.id));
    if (!t) return null;
    this.usedTexts.add(t.id);
    return {
      id: `text-${t.id}`,
      kind: 'read',
      source: { type: 'text', id: t.id },
      title: t.title,
      subtitle: tx(t.subtitle, this.lang),
      badge: this.fr ? `Lecture audio · ${t.words} mots` : `Audio text · ${t.words} words`,
      level: t.level,
      minutes: Math.max(4, Math.round(t.words / 35)),
      to: textPath(t, this.lang),
    };
  }

  missionStep(): StudyStep | null {
    const m = MISSIONS.find(x => x.level === this.level && !this.usedMissions.has(x.id));
    if (!m) return null;
    this.usedMissions.add(m.id);
    return {
      id: `mission-${m.id}`,
      kind: 'read',
      source: { type: 'mission', id: m.id },
      title: tx(m.title, this.lang),
      subtitle: tx(m.summary, this.lang),
      badge: this.fr ? `Mission · ${m.documents.length} étapes` : `Mission · ${m.documents.length} steps`,
      level: m.level,
      minutes: m.minutes,
      to: missionPath(m, this.lang),
    };
  }

  /** Pick a reading step for this level; at C2 (where texts are A1–C1), pair C2 authentic listening doc or C2 reading ladder. */
  nextRead(preferMission = false): StudyStep | null {
    if (preferMission) {
      const m = this.missionStep();
      if (m) return m;
    }
    const t = this.textStep() ?? this.missionStep();
    if (t) return t;
    // C2 has no standalone TextMeta entries: use authentic C2 comprehension documents or C1 advanced text fallback.
    const doc = this.docStep();
    if (doc) return doc;
    const c1Fallback = TEXTS.find(x => x.level === 'C1' && !this.usedTexts.has(x.id));
    if (c1Fallback) {
      this.usedTexts.add(c1Fallback.id);
      return {
        id: `text-${c1Fallback.id}`,
        kind: 'read',
        source: { type: 'text', id: c1Fallback.id },
        title: c1Fallback.title,
        subtitle: tx(c1Fallback.subtitle, this.lang),
        badge: this.fr ? `Lecture C1–C2 · ${c1Fallback.words} mots` : `Advanced text · ${c1Fallback.words} words`,
        level: c1Fallback.level,
        minutes: Math.max(5, Math.round(c1Fallback.words / 35)),
        to: textPath(c1Fallback, this.lang),
      };
    }
    return null;
  }

  dictationStep(preferMethod?: DictationMethod): StudyStep | null {
    const atLevel = DICTATIONS.filter(d => d.level === this.level && !this.usedDicts.has(d.id));
    let chosen: DictationCourse | undefined;
    if (preferMethod) {
      chosen = atLevel.find(d => (d.method ?? 'story') === preferMethod);
    }
    chosen = chosen ?? atLevel[0];
    if (!chosen) return null;
    this.usedDicts.add(chosen.id);
    const method: DictationMethod = chosen.method ?? 'story';
    return {
      id: `dictation-${chosen.id}`,
      kind: 'write',
      source: { type: 'dictation', id: chosen.id },
      title: chosen.title,
      subtitle: tx(chosen.subtitle, this.lang),
      badge: `${this.fr ? 'Dictée' : 'Dictation'} · ${tx(METHOD_LABEL[method], this.lang)}`,
      level: chosen.level,
      minutes: chosen.minutes,
      to: dictationCoursePath(chosen, this.lang),
    };
  }
}

function makeModule(index: number, id: string, title: T, theme: T, steps: (StudyStep | null)[], lang: Lang): StudyModule {
  const clean = steps.filter((s): s is StudyStep => s !== null);
  return {
    index,
    id,
    title: tx(title, lang),
    theme: tx(theme, lang),
    steps: clean,
    minutes: clean.reduce((sum, s) => sum + s.minutes, 0),
  };
}

function buildCompleteModules(level: Level, lang: Lang, pool: LevelPool): StudyModule[] {
  const specs = COMPLETE_MODULES[level];
  return specs.map((spec, idx) => {
    const learn = spec.courseId
      ? pool.courseStep(spec.courseId) ?? pool.nextCourse()
      : spec.ladderId
        ? pool.courseStep(spec.ladderId) ?? pool.nextCourse()
        : pool.nextCourse();
    const listen = pool.nextListen({
      dialogueId: spec.dialogueId,
      earId: spec.earId,
      preferDoc: spec.preferDoc,
      preferEar: level === 'C1' || level === 'C2' ? idx % 2 === 0 : false,
    });
    const read = pool.nextRead(Boolean(spec.preferMission));
    const write = pool.dictationStep(spec.dictMethod);
    return makeModule(idx + 1, `complete-${level}-${idx + 1}`, spec.title, spec.theme, [learn, listen, read, write], lang);
  });
}

function buildExamModules(level: Level, lang: Lang, pool: LevelPool): StudyModule[] {
  const specs: { title: T; theme: T; steps: () => (StudyStep | null)[] }[] = [
    {
      title: b('TCF Listening & Native Ear', 'TCF Compréhension orale & oreille'),
      theme: b('Train exam listening at your level with native ear drills and real audio documents.', 'Entraînez votre écoute type TCF avec exercices d’oreille et documents réels.'),
      steps: () => [pool.courseStep('tcf-listening'), pool.nextListen({ preferEar: true }), pool.docStep() ?? pool.dialogueStep(), pool.dictationStep('story')],
    },
    {
      title: b('TCF Reading & Reformulation', 'TCF Compréhension écrite & repérage'),
      theme: b('Speed up scanning, spot paraphrases and reinforce everyday comprehension.', 'Accélérez le repérage, déjouez les reformulations et consolidez vos réflexes.'),
      steps: () => [pool.courseStep('tcf-reading'), pool.nextRead(false), pool.dialogueStep() ?? pool.earStep(), pool.dictationStep('homophones')],
    },
    {
      title: b('TCF Writing & Grammar Precision', 'TCF Expression écrite & grammaire'),
      theme: b('Structure clear exam texts while eliminating tense, accent and agreement mistakes.', 'Structurez vos écrits d’examen tout en supprimant les fautes d’accord et de temps.'),
      steps: () => [pool.courseStep('tcf-writing'), pool.courseStep('tcf-grammar'), pool.dictationStep('conjugation'), pool.dictationStep('exam')],
    },
    {
      title: b('TCF Speaking & TEF Canada Listening', 'TCF Oral & TEF Canada Écoute'),
      theme: b('Build natural oral fluency and adapt to Canadian & Québec audio formats.', 'Gagnez en aisance orale et habituez-vous aux formats audio du TEF Canada / Québec.'),
      steps: () => [pool.courseStep('tcf-speaking'), pool.courseStep('tef-listening'), pool.dialogueStep() ?? pool.docStep(), pool.nextRead(true)],
    },
    {
      title: b('TEF Full Sprint & Timed Exam Drill', 'Sprint complet TEF & défi chronométré'),
      theme: b('Cover TEF reading, writing and speaking side by side with a timed dictation check.', 'Couvrez lecture, écriture et oral du TEF avec une dictée en conditions d’examen.'),
      steps: () => [pool.courseStep('tef-reading'), pool.courseStep('tef-writing'), pool.courseStep('tef-speaking'), pool.dictationStep('exam')],
    },
  ];
  return specs.map((s, i) => makeModule(i + 1, `exams-${level}-${i + 1}`, s.title, s.theme, s.steps(), lang));
}

function buildDiplomaModules(level: Level, lang: Lang, pool: LevelPool): StudyModule[] {
  const delfMap: Partial<Record<Level, string>> = { A2: 'delf-a2', B1: 'delf-b1', B2: 'delf-b2', C1: 'dalf-c1' };
  const mainDiplomaCourse = delfMap[level];

  const specs: { title: T; theme: T; steps: () => (StudyStep | null)[] }[] = [
    {
      title: b(`Official ${level} Foundations & Listening`, `Bases diplôme ${level} & compréhension orale`),
      theme: b('Master the expectations of the diploma and sharpen single-pass listening.', 'Maîtrisez les attendus du diplôme et affûtez votre compréhension orale.'),
      steps: () => [
        mainDiplomaCourse ? pool.courseStep(mainDiplomaCourse) : pool.nextCourse(['beginner', 'grammar']),
        pool.docStep() ?? pool.earStep(),
        pool.dialogueStep() ?? pool.earStep(),
        pool.dictationStep('story'),
      ],
    },
    {
      title: b('Written Comprehension & Analysis', 'Compréhension des écrits & analyse'),
      theme: b('Read authentic texts, identify key arguments and spot homophone nuances.', 'Lisez des documents authentiques, repérez l’essentiel et évitez les homophones.'),
      steps: () => [
        pool.nextCourse(['reading', 'tcf', 'tef-quebec']),
        pool.nextRead(false),
        pool.nextRead(true),
        pool.dictationStep('homophones'),
      ],
    },
    {
      title: b('Grammar Mastery & Written Production', 'Grammaire clé & production écrite'),
      theme: b('Strengthen level-defining grammar rules, spelling agreements and structured writing.', 'Verrouillez la grammaire exigée au diplôme, les accords et la rédaction structurée.'),
      steps: () => [
        pool.nextCourse(['grammar', 'tcf']),
        pool.nextCourse(['spelling', 'tef-quebec']),
        pool.dictationStep('conjugation'),
        pool.dictationStep('story'),
      ],
    },
    {
      title: b('Oral Interaction & Spoken Fluency', 'Interaction orale & aisance'),
      theme: b('Practice realistic dialogues, polite questioning, debating and native rhythm.', 'Pratiquez dialogues réalistes, questions nuancées et rythme naturel.'),
      steps: () => [
        pool.nextCourse(['conversation', 'pronunciation', 'tcf']),
        pool.dialogueStep() ?? pool.docStep(),
        pool.earStep() ?? pool.docStep(),
        pool.nextRead(false),
      ],
    },
    {
      title: b(`Timed ${level} Diploma Simulation`, `Simulation chronométrée ${level}`),
      theme: b('Put all four exam skills together under realistic timed conditions.', 'Réunissez les quatre compétences dans des conditions proches de l’examen officiel.'),
      steps: () => [
        pool.nextCourse(['business', 'listening', 'tcf', 'tef-quebec']),
        pool.docStep() ?? pool.earStep(),
        pool.dictationStep('exam'),
        pool.dictationStep('conjugation'),
      ],
    },
  ];
  return specs.map((s, i) => makeModule(i + 1, `diploma-${level}-${i + 1}`, s.title, s.theme, s.steps(), lang));
}

function buildFluencyModules(level: Level, lang: Lang, pool: LevelPool): StudyModule[] {
  const specs: { title: T; theme: T; preferMission?: boolean; dictMethod: DictationMethod }[] = [
    {
      title: b('Everyday Voices & Natural Speed', 'Voix natives & débit naturel'),
      theme: b('Start listening to real French immediately, read along and write cleanly.', 'Plongez dans le vrai français oral, lisez avec audio et écrivez sans hésiter.'),
      dictMethod: 'story',
    },
    {
      title: b('Real-World Missions & Homophones', 'Missions réelles & homophones'),
      theme: b('Decode real French conversations, complete a practical mission and master tricky sounds.', 'Décodez des échanges concrets, réussissez une mission et déjouez les homophones.'),
      preferMission: true,
      dictMethod: 'homophones',
    },
    {
      title: b('Sharpen Your Ear & Verbs in Action', 'Affûter son oreille & verbes en action'),
      theme: b('Catch silent endings, fast speech and verb agreements in real contexts.', 'Repérez liaisons, oral rapide et accords verbaux en contexte authentique.'),
      dictMethod: 'conjugation',
    },
    {
      title: b('Stories, Culture & Practical French', 'Récits, culture & français pratique'),
      theme: b('Immerse yourself in longer audio passages, rich texts and authentic storytelling.', 'Immergez-vous dans des audios plus riches, des textes vivants et la dictée récit.'),
      preferMission: true,
      dictMethod: 'story',
    },
    {
      title: b('Full 4-Skill Fluency Sprint', 'Sprint aisance 4 compétences'),
      theme: b('Blend real conversation, ear training, reading and a timed exam-style dictation.', 'Enchaînez conversation, oreille, lecture et dictée défi chronométrée.'),
      dictMethod: 'exam',
    },
  ];
  return specs.map((s, i) => {
    const listen1 = i % 2 === 0 ? (pool.dialogueStep() ?? pool.earStep()) : (pool.earStep() ?? pool.dialogueStep());
    const listen2 = pool.docStep() ?? pool.earStep() ?? pool.dialogueStep();
    const read = pool.nextRead(Boolean(s.preferMission));
    const write = pool.dictationStep(s.dictMethod);
    const course = pool.nextCourse(['conversation', 'listening', 'reading', 'pronunciation', 'beginner']);
    // Prioritize active fluency steps (Listen, Read, Write + 1 practical course)
    return makeModule(i + 1, `fluency-${level}-${i + 1}`, s.title, s.theme, [listen1, read, write, course ?? listen2], lang);
  });
}

function buildCheckpoint(level: Level, lang: Lang, pool: LevelPool): StudyStep {
  const fr = lang === 'fr';
  // Prefer an unused exam-mode dictation at this level for C2 (since placement tops at C1) or placement test for A1–C1.
  if (level === 'C2') {
    const examDict = pool.dictationStep('exam');
    if (examDict) {
      return {
        ...examDict,
        id: `checkpoint-c2-${examDict.id}`,
        kind: 'checkpoint',
        badge: fr ? 'Défi final C2 · Chronométré' : 'C2 Final Challenge · Timed',
      };
    }
  }
  return {
    id: `checkpoint-placement-${level}`,
    kind: 'checkpoint',
    source: { type: 'placement' },
    title: fr ? `Bilan adaptatif CECR (cible ${level})` : `Adaptive CEFR Check (${level} target)`,
    subtitle: fr
      ? 'Évaluez votre écoute, lecture et grammaire en 10 minutes pour confirmer votre niveau.'
      : 'Check your listening, reading and grammar in 10 minutes to verify your level.',
    badge: fr ? 'Test adaptatif · 10 min' : 'Adaptive test · 10 min',
    level,
    minutes: 10,
    to: placementPath(lang),
  };
}

function buildDailyGame(level: Level, lang: Lang): StudyStep {
  const idx = LEVELS.indexOf(level) % GAMES.length;
  const g = GAMES[idx] ?? GAMES[0];
  return {
    id: `daily-game-${g.id}`,
    kind: 'game',
    source: { type: 'game', id: g.id },
    title: tx(g.title, lang),
    subtitle: tx(g.tagline, lang),
    badge: lang === 'fr' ? 'Jeu · 3 min' : 'Game · 3 min',
    level,
    minutes: 3,
    to: gamePath(g, lang),
  };
}

/** Build a complete, structured, deduplicated Study Plan for any Goal × Level pair. */
export function buildStudyPlan(goal: StudyGoalId, level: Level, lang: Lang): StudyPlan {
  const pool = new LevelPool(level, lang);
  let modules: StudyModule[];
  switch (goal) {
    case 'exams':
      modules = buildExamModules(level, lang, pool);
      break;
    case 'diploma':
      modules = buildDiplomaModules(level, lang, pool);
      break;
    case 'fluency':
      modules = buildFluencyModules(level, lang, pool);
      break;
    case 'complete':
    default:
      modules = buildCompleteModules(level, lang, pool);
      break;
  }

  const levelIdx = LEVELS.indexOf(level);
  const nextLevel = levelIdx >= 0 && levelIdx < LEVELS.length - 1 ? LEVELS[levelIdx + 1] : undefined;
  const checkpoint = buildCheckpoint(level, lang, pool);
  const dailyGame = buildDailyGame(level, lang);
  const totalSteps = modules.reduce((n, m) => n + m.steps.length, 0);
  const totalMinutes = modules.reduce((n, m) => n + m.minutes, 0);

  return {
    goal,
    level,
    nextLevel,
    modules,
    checkpoint,
    dailyGame,
    totalSteps,
    totalMinutes,
  };
}

export { AUTOSTART };
