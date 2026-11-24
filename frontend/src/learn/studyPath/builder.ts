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
import { VERB_COURSES, VERB_ROWS } from '../verbCatalog';
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

/** Total free learning resources across the entire academy (computed). */
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
  /** A second course that practises the module's theme (from the wider catalogue). */
  practiceId?: string;
  /** Further courses of the module, after the practice course. */
  moreIds?: string[];
  /** A conjugation module: courses, ear training and a dictation, no reading step. */
  conjugation?: boolean;
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
      courseId: 'first-steps', dialogueId: 'a-la-boulangerie', practiceId: 'etre-avoir', dictMethod: 'story',
    },
    {
      title: b('Numbers, Time & Spoken Rhythm', 'Nombres, heure & rythme oral'),
      theme: b('Catch numbers and times at native speed, read simple notices and practice accents.', 'Comprendre prix et horaires à vitesse réelle, lire un texte court et maîtriser les accents.'),
      courseId: 'numbers-time', earId: 'les-nombres-qui-piegent', practiceId: 'l-numbers-prices', dictMethod: 'story',
    },
    {
      title: b('Everyday Life, Family & Routine', 'Vie quotidienne, famille & routine'),
      theme: b('Describe your day, follow a workplace dialogue and complete your first reading mission.', 'Raconter sa journée, suivre un dialogue au travail et réussir une mission de lecture.'),
      courseId: 'everyday-life', dialogueId: 'le-premier-jour', preferMission: true, practiceId: 'possessives', dictMethod: 'homophones',
    },
    {
      title: b('Food, Shopping & Articles', 'Courses, repas & articles'),
      theme: b('Master un/une/du/de la, listen to real announcements and drill common homophones.', 'Maîtriser les articles, écouter un document réel et éviter les pièges d’homophones.'),
      courseId: 'food-shopping', preferDoc: true, practiceId: 'partitive-articles', dictMethod: 'conjugation',
    },
    {
      title: b('Health, City & Silent Letters', 'Santé, ville & lettres muettes'),
      theme: b('Handle pharmacy & transit situations and link spoken words to correct spelling.', 'Gérer pharmacie et transports tout en reliant prononciation et orthographe.'),
      courseId: 'body-health', dialogueId: 'a-la-pharmacie', preferMission: true, practiceId: 'prepositions-place', dictMethod: 'story',
    },
    {
      title: b('Survival Conversations & A1 Wrap-Up', 'Conversations clés & bilan A1'),
      theme: b('Combine real-world dialogues, short reading and an authentic timed A1 dictation.', 'Consolider tout votre niveau A1 avec dialogue, lecture et dictée défi.'),
      courseId: 'survival-dialogues', dialogueId: 'un-ticket-de-bus', practiceId: 'c-first-conversations', dictMethod: 'exam',
    },
  ],
  A2: [
    {
      title: b('Travel French & Getting Around', 'Voyager & se repérer'),
      theme: b('Ask directions, check in smoothly and write fluent everyday narratives.', 'Demander son chemin, réserver et écrire un récit fluide du quotidien.'),
      courseId: 'travel-french', dialogueId: 'demander-son-chemin', practiceId: 'countries-cities', dictMethod: 'story',
    },
    {
      title: b('Past Tenses & Stories', 'Temps du passé & récits'),
      theme: b('Tell what happened with passé composé & imparfait and hear spoken intonation clearly.', 'Raconter au passé composé et à l’imparfait tout en affinant son oreille.'),
      courseId: 'past-tenses', earId: 'question-ou-affirmation', practiceId: 'b-yesterday', dictMethod: 'conjugation',
    },
    {
      title: b('Appointments, Health & Services', 'Rendez-vous, santé & services'),
      theme: b('Book appointments by phone, solve a guided reading mission and avoid homophone traps.', 'Prendre rendez-vous par téléphone, résoudre une mission et déjouer les homophones.'),
      courseId: 'appointments-services', dialogueId: 'prendre-rendez-vous-chez-le-medecin', preferMission: true, practiceId: 'time-expressions', dictMethod: 'homophones',
    },
    {
      title: b('Housing, Papers & Daily Life', 'Logement, démarches & vie pratique'),
      theme: b('Navigate landlords and practical French documents with real native audio.', 'Échanger avec un propriétaire et décoder des documents authentiques.'),
      courseId: 'settling-in-canada', dialogueId: 'appeler-le-proprietaire', preferDoc: true, practiceId: 'r-forms-notices', dictMethod: 'story',
    },
    {
      title: b('Natural Small Talk & Nasal Sounds', 'Conversations naturelles & voyelles'),
      theme: b('Keep everyday exchanges flowing and distinguish subtle French sounds with ease.', 'Maintenir une conversation naturelle et distinguer les sons proches.'),
      courseId: 'small-talk', earId: 'vent-vont-vin', preferMission: true, practiceId: 'c-weekend-talk', dictMethod: 'conjugation',
    },
    {
      title: b('Spelling Precision & A2 Milestone', 'Orthographe juste & cap A2'),
      theme: b('Lock in A2 spelling, restaurant conversations and a timed exam-style dictation.', 'Sécuriser l’orthographe A2 avant de franchir le cap vers le niveau B1.'),
      courseId: 'spelling-homophones', dialogueId: 'reserver-au-restaurant', practiceId: 'sp-common-words', dictMethod: 'exam',
    },
  ],
  B1: [
    {
      title: b('Future, Conditional & Spoken Tenses', 'Futur, conditionnel & temps à l’oral'),
      theme: b('Express hypotheses and plans clearly, recognize tenses by ear and write cleanly.', 'Exprimer projets et hypothèses, reconnaître les temps à l’oral et écrire juste.'),
      courseId: 'future-conditional', earId: 'passe-present-ou-futur', practiceId: 'plus-que-parfait', dictMethod: 'story',
    },
    {
      title: b('Real Spoken French & Work Interviews', 'Vrai français parlé & entretien'),
      theme: b('Decode everyday native contractions, follow a job interview and tackle a B1 mission.', 'Comprendre le français parlé réel, réussir un entretien et une mission guidée.'),
      courseId: 'spoken-french', dialogueId: 'l-entretien-d-embauche', preferMission: true, practiceId: 'l-overheard', dictMethod: 'conjugation',
    },
    {
      title: b('Relative Clauses & News Reading', 'Pronoms relatifs & actualité'),
      theme: b('Build fluid connected sentences, follow authentic radio clips and master homophones.', 'Structurer des phrases riches, écouter un document réel et maîtriser les homophones.'),
      courseId: 'relative-pronouns', preferDoc: true, practiceId: 'r-news-articles', dictMethod: 'homophones',
    },
    {
      title: b('Workplace Emails & Administration', 'Courriels pro & démarches'),
      theme: b('Write clear professional messages, understand official calls and practice agreement.', 'Rédiger des courriels pro, gérer la CAF et affiner les accords grammaticaux.'),
      courseId: 'pro-emails', dialogueId: 'un-dossier-a-la-caf', preferMission: true, practiceId: 'r-workplace-docs', dictMethod: 'story',
    },
    {
      title: b('Agreements, Fast Speech & Nuance', 'Accords, oral rapide & nuances'),
      theme: b('Tackle past participle agreements and fast everyday speech without hesitation.', 'Maîtriser les accords clés et suivre le débit rapide des locuteurs natifs.'),
      courseId: 'spelling-agreement', earId: 'le-francais-qui-se-raccourcit', practiceId: 'sp-pp-avoir', dictMethod: 'conjugation',
    },
    {
      title: b('Québec French, Travel & B1 Milestone', 'Français québécois & cap B1'),
      theme: b('Adapt to real Francophone accents and finish B1 with a full exam-mode dictation.', 'S’adapter aux accents francophones et valider le B1 par une dictée chronométrée.'),
      courseId: 'quebec-french', dialogueId: 'un-train-en-retard', preferMission: true, practiceId: 'c-travel-problems', dictMethod: 'exam',
    },
  ],
  B2: [
    {
      title: b('The Subjunctive & Discourse Markers', 'Subjonctif & marqueurs de l’oral'),
      theme: b('Use the subjunctive naturally, follow native connectors and elevate written accuracy.', 'Maîtriser le subjonctif, suivre la logique orale native et affiner sa plume.'),
      courseId: 'subjunctive', earId: 'les-petits-mots-de-l-oral', practiceId: 'subjunctive-or-indicative', dictMethod: 'story',
    },
    {
      title: b('Opinions, Debate & Career Reviews', 'Opinion, débat & bilan annuel'),
      theme: b('Defend nuanced viewpoints, handle an annual review and resolve complex homophones.', 'Défendre un point de vue nuancé, négocier au travail et éviter les homophones pièges.'),
      courseId: 'opinions-debate', dialogueId: 'l-entretien-annuel', preferMission: true, practiceId: 'c-persuade', dictMethod: 'homophones',
    },
    {
      title: b('Job Interviews & Complex Audio', 'Entretiens pro & documents longs'),
      theme: b('Present achievements persuasively, analyze authentic audio reports and drill verbs.', 'Valoriser son parcours, analyser un reportage audio et perfectionner les conjugaisons.'),
      courseId: 'job-interview', preferDoc: true, practiceId: 'l-long-interviews', dictMethod: 'conjugation',
    },
    {
      title: b('French Idioms & Everyday Negotiation', 'Expressions imagées & négociation'),
      theme: b('Use idiomatic expressions naturally, resolve tenant disputes and read with nuance.', 'Employer les expressions courantes, argumenter un litige et lire entre les lignes.'),
      courseId: 'french-idioms', dialogueId: 'le-depot-de-garantie', preferMission: true, practiceId: 'r-contracts-leases', dictMethod: 'story',
    },
    {
      title: b('Classic Stories & Written Precision', 'Récits classiques & précision écrite'),
      theme: b('Read rich French literature, follow complex audio and sharpen advanced orthography.', 'Lire la littérature française, décoder l’audio soutenu et soigner les accords rares.'),
      courseId: 'classic-stories', preferDoc: true, practiceId: 'r-modern-literature', dictMethod: 'homophones',
    },
    {
      title: b('Upper-Intermediate Milestone (B2 / NCLC 7)', 'Cap B2 / NCLC 7 & synthèse'),
      theme: b('Consolidate argumentation, administrative precision and a timed B2 exam dictation.', 'Consolider le niveau B2 (NCLC 7) avec une préparation complète et dictée examen.'),
      courseId: 'delf-b2', dialogueId: 'une-erreur-sur-les-impots', practiceId: 'cause-consequence', dictMethod: 'exam',
    },
  ],
  C1: [
    {
      title: b('Advanced Structures & Listening Nuance', 'Structures avancées & finesse orale'),
      theme: b('Master complex relative clauses and emphatic structures alongside advanced native ear labs.', 'Maîtriser les relatives complexes et la mise en relief, avec des exercices d’écoute native avancés.'),
      courseId: 'complex-relatives', practiceId: 'emphasis', dictMethod: 'story',
    },
    {
      title: b('Autonomous Fluency & Negotiation', 'Autonomie, nuance & négociation'),
      theme: b('Prepare DALF-grade argumentation, negotiate remote work and sharpen homophones.', 'Construire une argumentation niveau DALF, négocier et verrouiller les homophones rares.'),
      courseId: 'dalf-c1', practiceId: 'c-nuance-hedging', dialogueId: 'negocier-le-teletravail', dictMethod: 'homophones',
    },
    {
      title: b('Literary Analysis & Implicit Meaning', 'Lecture littéraire & implicite'),
      theme: b('Read demanding French prose and the passé simple, catch implicit meaning and refine verb agreements.', 'Lire des textes exigeants et le passé simple, percevoir l’implicite et maîtriser les accords complexes.'),
      courseId: 'passe-simple', practiceId: 'r-classic-authors', preferDoc: true, dictMethod: 'conjugation',
    },
    {
      title: b('Public Debate & Structured Writing', 'Débat public & rédaction structurée'),
      theme: b('Weigh competing viewpoints in debates and write cohesive, persuasive C1 French.', 'Peser le pour et le contre à l’oral comme à l’écrit avec rigueur et élégance.'),
      courseId: 'c-formal-debate', practiceId: 'r-essays', dialogueId: 'les-transports-de-demain', dictMethod: 'story',
    },
    {
      title: b('Spontaneous Expression & C1 Synthesis', 'Expression spontanée & synthèse C1'),
      theme: b('Combine high-level speaking, complex audio analysis and a timed C1 exam dictation.', 'Allier aisance orale soutenue, écoute complexe et dictée chronométrée C1.'),
      courseId: 'c-media-speaking', practiceId: 'l-press-review', preferDoc: true, dictMethod: 'exam',
    },
  ],
  C2: [
    {
      title: b('Fast Idiomatic Listening & Subtlety', 'Écoute experte & oral idiomatique'),
      theme: b('Decode rapid native speech, subtle irony and nuanced cultural references effortlessly.', 'Décoder le débit natif rapide, l’ironie fine et les références implicites sans effort.'),
      courseId: 'l-film-dialogue', practiceId: 'l-expert-debates', dictMethod: 'story',
    },
    {
      title: b('Critical Reading & Register Mastery', 'Lecture critique & registres de langue'),
      theme: b('Analyze philosophical prose and poetry, rhetorical framing and rare orthographic distinctions.', 'Analyser prose d’idées et poésie, effets rhétoriques et subtilités orthographiques.'),
      courseId: 'r-philosophical-prose', practiceId: 'r-poetry', dictMethod: 'homophones',
    },
    {
      title: b('High-Style Writing & Complex Verbs', 'Style soutenu & conjugaisons rares'),
      theme: b('Write with editorial precision, subtle syntax and flawless literary agreements.', 'Écrire avec précision éditoriale, maîtrise syntaxique et accords irréprochables.'),
      courseId: 'fine-points-style', practiceId: 'dalf-c2-writing', dictMethod: 'conjugation',
    },
    {
      title: b('Persuasive Rhetoric & Expressive Delivery', 'Rhétorique & expression orale'),
      theme: b('Argue with eloquence across registers and read aloud with expressive control.', 'Argumenter avec éloquence dans tous les registres et lire à voix haute avec expressivité.'),
      courseId: 'c-eloquence', practiceId: 'p-reading-aloud', dictMethod: 'story',
    },
    {
      title: b('Expert Grammar & C2 Orthography', 'Grammaire experte & synthèse C2'),
      theme: b('Complete your C2 mastery with expert spelling, the DALF C2 format and a timed dictation.', 'Parachever votre maîtrise C2 avec l’orthographe experte, le format du DALF C2 et une dictée défi.'),
      courseId: 'sp-dictation-c2', practiceId: 'dalf-c2', dictMethod: 'exam',
    },
  ],
};

/**
 * Conjugation modules of the Complete French goal (the conjugation path, one
 * course per tense), placed right after the first module of each level.
 */
const CONJUGATION_MODULES: Record<Level, ModuleBlueprints[]> = {
  A1: [
    {
      title: b('Conjugation: Present, Near Future & Imperative', 'Conjugaison : présent, futur proche et impératif'),
      theme: b('Conjugate every verb family in the present, talk about plans and give simple instructions.', 'Conjuguer toutes les familles de verbes au présent, parler de ses projets et donner des consignes simples.'),
      courseId: 'cj-present', practiceId: 'cj-futur-proche', moreIds: ['cj-imperatif'], dictMethod: 'conjugation', conjugation: true,
    },
  ],
  A2: [
    {
      title: b('Conjugation: Talking About the Past', 'Conjugaison : parler du passé'),
      theme: b('Master the passé composé, the imparfait and the recent past, with avoir, être and agreement.', 'Maîtriser le passé composé, l’imparfait et le passé récent, avec avoir, être et l’accord.'),
      courseId: 'cj-passe-compose', practiceId: 'cj-imparfait', moreIds: ['cj-passe-recent'], dictMethod: 'conjugation', conjugation: true,
    },
  ],
  B1: [
    {
      title: b('Conjugation: Telling a Story in the Past', 'Conjugaison : raconter au passé'),
      theme: b('Choose between passé composé and imparfait, and go further back with the plus-que-parfait.', 'Choisir entre passé composé et imparfait, et remonter plus loin avec le plus-que-parfait.'),
      courseId: 'cj-pc-imparfait', practiceId: 'cj-plus-que-parfait', dictMethod: 'story', conjugation: true,
    },
    {
      title: b('Conjugation: Future & Conditional', 'Conjugaison : futur et conditionnel'),
      theme: b('Form the future and the present conditional, irregular stems included, and use si correctly.', 'Former le futur et le conditionnel présent, radicaux irréguliers compris, et employer si correctement.'),
      courseId: 'cj-futur-simple', practiceId: 'cj-conditionnel', dictMethod: 'conjugation', conjugation: true,
    },
  ],
  B2: [
    {
      title: b('Conjugation: The Subjunctive', 'Conjugaison : le subjonctif'),
      theme: b('Form the present and past subjunctive and know exactly when to use them.', 'Former le subjonctif présent et passé et savoir exactement quand les employer.'),
      courseId: 'cj-subjonctif', practiceId: 'cj-subjonctif-passe', dictMethod: 'conjugation', conjugation: true,
    },
    {
      title: b('Conjugation: Compound Tenses & Impersonal Forms', 'Conjugaison : temps composés et formes impersonnelles'),
      theme: b('Futur antérieur, past conditional, infinitive, participles and gerund.', 'Futur antérieur, conditionnel passé, infinitif, participes et gérondif.'),
      courseId: 'cj-futur-anterieur', practiceId: 'cj-conditionnel-passe', moreIds: ['cj-modes-impersonnels'], dictMethod: 'conjugation', conjugation: true,
    },
  ],
  C1: [
    {
      title: b('Conjugation: Every Tense & the Literary Past', 'Conjugaison : tous les temps et le passé littéraire'),
      theme: b('Choose the right tense in any text, then read and write the passé simple.', 'Choisir le bon temps dans n’importe quel texte, puis lire et écrire le passé simple.'),
      courseId: 'cj-bilan', practiceId: 'cj-passe-simple', dictMethod: 'exam', conjugation: true,
    },
  ],
  C2: [
    {
      title: b('Conjugation: The Literary Subjunctive', 'Conjugaison : le subjonctif littéraire'),
      theme: b('Recognise the imperfect and pluperfect subjunctive and the set phrases still alive today.', 'Reconnaître le subjonctif imparfait et plus-que-parfait et les tournures figées encore vivantes.'),
      courseId: 'cj-subjonctif-imparfait', dictMethod: 'conjugation', conjugation: true,
    },
  ],
};

/** Grammar Studio modules woven into Complete French by CEFR complexity, right after Verbs. */
const GRAMMAR_MODULES: Record<Level, ModuleBlueprints[]> = {
  A1: [
    {
      title: b('Grammar Lab · Sentence Core & Pronouns', 'Atelier grammaire · Phrase et pronoms'),
      theme: b('Build clean A1 sentences with subject pronouns, word order, plurals and contracted articles.', 'Construire des phrases A1 nettes : pronoms sujets, ordre des mots, pluriels et articles contractés.'),
      courseId: 'gr-sentence-order', practiceId: 'gr-subject-pronouns',
      moreIds: ['gr-plural-nouns-adjectives', 'gr-contracted-articles'],
    },
    {
      title: b('Grammar Lab · Questions, Time & Connections', 'Atelier grammaire · Questions, temps et liens'),
      theme: b('Ask open questions, link A1 clauses, place events in time and chain two verbs cleanly.', 'Poser des questions ouvertes, relier vos idées, situer un moment et enchaîner deux verbes.'),
      courseId: 'gr-question-words', practiceId: 'gr-basic-connectors',
      moreIds: ['gr-prepositions-time-a1', 'gr-infinitive-constructions'],
    },
  ],
  A2: [
    {
      title: b('Grammar Lab · Precision, Negation & Adjectives', 'Atelier grammaire · Nuances, négation et adjectifs'),
      theme: b('Separate savoir/connaître and c’est/il est, place adjectives accurately and go beyond ne… pas.', 'Distinguer savoir/connaître et c’est/il est, placer l’adjectif et élargir la négation.'),
      courseId: 'gr-savoir-connaitre', practiceId: 'gr-cest-il-est-nuances',
      moreIds: ['gr-adjective-position', 'gr-negation-advanced-a2'],
    },
    {
      title: b('Grammar Lab · Verb Prepositions & Pronouns', 'Atelier grammaire · Régimes verbaux et pronoms'),
      theme: b('Pair verbs with à or de, use en and y naturally and sequence two object pronouns without hesitation.', 'Associer verbes à à ou de, employer en/y en contexte et ordonner les doubles pronoms.'),
      courseId: 'gr-prepositions-de-a', practiceId: 'gr-pronom-en-y-depth',
      moreIds: ['gr-direct-indirect-verbs'],
    },
    {
      title: b('Grammar Lab · Time Frames, Impersonals & Causatives', 'Atelier grammaire · Temps, tournures et causatif'),
      theme: b('Contrast quand, pendant que and depuis que, use il faut/il reste and master faire + infinitive.', 'Opposer quand, pendant que et depuis que, manier il faut/il reste et faire + infinitif.'),
      courseId: 'gr-quand-pendant-que', practiceId: 'gr-impersonal-verbs',
      moreIds: ['gr-faire-laisser-causative'],
    },
  ],
  B1: [
    {
      title: b('Grammar Lab · Modals, Comparisons & Passive Alternatives', 'Atelier grammaire · Modaux, comparaisons et voix'),
      theme: b('Distinguish modal meanings, verbs shifting with prepositions, nuanced comparisons and alternatives to passive voice.', 'Maîtriser les nuances des modaux, verbes à régime variable, comparaisons et tournures actives.'),
      courseId: 'gr-devoir-pouvoir-nuances', practiceId: 'gr-verb-meaning-shifts',
      moreIds: ['gr-passive-alternatives', 'gr-comparisons-advanced'],
    },
    {
      title: b('Grammar Lab · Past Infinitive, Adjectives & Zero Articles', 'Atelier grammaire · Infinitif passé et articles'),
      theme: b('Chain actions with après avoir, fix adjective prepositions and drop articles accurately.', 'Exprimer l’antériorité avec après avoir, accorder les prépositions d’adjectifs et omettre l’article.'),
      courseId: 'gr-past-infinitive-apres', practiceId: 'gr-adjectives-prepositions',
      moreIds: ['gr-articles-zero-omission'],
    },
    {
      title: b('Grammar Lab · Hypotheses, Neutral Relatives & Reported Speech', 'Atelier grammaire · Hypothèses, relatifs et discours'),
      theme: b('Control all three si-clause patterns, ce qui/ce que/ce dont and past tense backshifting.', 'Maîtriser les trois systèmes avec si, ce qui/ce que/ce dont et le discours rapporté au passé.'),
      courseId: 'gr-si-clauses-complete', practiceId: 'gr-ce-qui-ce-que-ce-dont',
      moreIds: ['gr-reported-speech-past'],
    },
  ],
  B2: [
    {
      title: b('Grammar Lab · Mood Selection in Relatives & Concession', 'Atelier grammaire · Subjonctif, concession et hypothèse'),
      theme: b('Navigate indicative vs. subjunctive across relatives, superlatives, concession and hypotheses without si.', 'Arbitrer indicatif et subjonctif dans relatives, concession (bien que/malgré) et hypothèses sans si.'),
      courseId: 'gr-subjunctive-relatives-superlatives', practiceId: 'gr-concessive-structures-b2',
      moreIds: ['gr-hypotheses-without-si'],
    },
    {
      title: b('Grammar Lab · Temporal Clauses, Participles & Formal Negation', 'Atelier grammaire · Temporelles, participes et négation'),
      theme: b('Coordinate time clauses, gérondif vs. verbal adjectives and formal B2 negative structures.', 'Maîtriser avant que/après que, participes vs. adjectifs verbaux et négation soutenue.'),
      courseId: 'gr-temporal-clauses-b2', practiceId: 'gr-participle-clauses',
      moreIds: ['gr-negation-formal-b2'],
    },
    {
      title: b('Grammar Lab · Complex Relatives, Essay Links & Hedging', 'Atelier grammaire · Relatifs, connecteurs et nuance'),
      theme: b('Contrast dont vs. duquel, structure B2 essays, hedge claims and refine perception infinitives.', 'Distinguer dont et duquel, articuler une dissertation, nuancer au conditionnel et voir venir.'),
      courseId: 'gr-pronouns-dont-vs-duquel', practiceId: 'gr-discourse-connectors-b2',
      moreIds: ['gr-conditional-journalistic', 'gr-infinitive-clauses-perception'],
    },
  ],
  C1: [
    {
      title: b('Grammar Lab · Inversion, Impersonal Syntax & Agreements', 'Atelier grammaire · Inversion, impersonnel et accords'),
      theme: b('Refine C1 prose with adverbial inversion, formal impersonal clauses and tricky collective agreements.', 'Affiner le style C1 avec l’inversion après adverbes, les tournures impersonnelles et accords délicats.'),
      courseId: 'gr-inversion-after-adverbs', practiceId: 'gr-impersonal-formal-c1',
      moreIds: ['gr-double-agreement-traps'],
    },
    {
      title: b('Grammar Lab · Cohesion, Stance & Compact Syntax', 'Atelier grammaire · Cohésion, modalisation et concision'),
      theme: b('Weave seamless paragraphs with anaphora, abstract prepositions, modalisation and ellipsis.', 'Fluidifier l’essai C1 grâce aux anaphores, locutions prépositives, modalisation et ellipses.'),
      courseId: 'gr-anaphora-cohesion', practiceId: 'gr-prepositional-locutions-c1',
      moreIds: ['gr-modalisation-epistemic', 'gr-ellipsis-apposition'],
    },
  ],
  C2: [
    {
      title: b('Grammar Lab · Literary Negation & Second-Form Conditionals', 'Atelier grammaire · Négation littéraire et 2e forme'),
      theme: b('Distinguish expletive ne, single-word negation and pluperfect subjunctive conditionals.', 'Maîtriser le ne explétif, le ne seul littéraire et le conditionnel passé 2e forme.'),
      courseId: 'gr-ne-expletif-and-lit-negation', practiceId: 'gr-conditional-second-form',
    },
    {
      title: b('Grammar Lab · Cadence, Registers & Verbal Aspect', 'Atelier grammaire · Cadence, registres et aspect'),
      theme: b('Master periodic sentence balance, register transposition and nuanced aspect and voice.', 'Orchestrer phrase périodique, variations de registre et finesses aspectuelles et de diathèse.'),
      courseId: 'gr-syntax-period-rhythm', practiceId: 'gr-register-syntax-shifts',
      moreIds: ['gr-aspect-and-voice-c2'],
    },
  ],
};

/** Expressions & Idioms modules woven into Complete French by CEFR complexity, right after Grammar. */
const EXPRESSIONS_MODULES: Record<Level, ModuleBlueprints[]> = {
  A1: [
    {
      title: b('Expressions Lab · Daily Essentials & Table Talk', 'Atelier expressions · Essentiels et table'),
      theme: b('Use natural A1 formulas with avoir and faire, talk about hunger and thirst, and react smoothly.', 'Employer les tournures clés avec avoir et faire, dire sa faim ou sa soif et réagir avec naturel.'),
      courseId: 'exp-avoir-essentials', practiceId: 'exp-faire-daily',
      moreIds: ['exp-hunger-thirst-table', 'exp-reactions-politeness'],
    },
  ],
  A2: [
    {
      title: b('Expressions Lab · Mornings, Time & Weather', 'Atelier expressions · Matins, temps et météo'),
      theme: b('Describe fatigue and rough mornings, hurry or take your time, and talk about weather with images.', 'Décrire la fatigue et le réveil, gérer la hâte et employer les images de la météo.'),
      courseId: 'exp-fatigue-sleep-morning', practiceId: 'exp-time-waiting-hurry',
      moreIds: ['exp-weather-nature'],
    },
    {
      title: b('Expressions Lab · Body Language & Money', 'Atelier expressions · Corps humain et argent'),
      theme: b('Keep a cool head, lend a hand and talk naturally about spending and tight budgets.', 'Garder la tête froide, donner un coup de main et parler d’argent et de budget avec naturel.'),
      courseId: 'exp-body-head-eyes', practiceId: 'exp-body-hands-feet',
      moreIds: ['exp-money-shopping-value'],
    },
  ],
  B1: [
    {
      title: b('Expressions Lab · Food, Animals & Emotions', 'Atelier expressions · Cuisine, animaux et émotions'),
      theme: b('Taste colourful kitchen and animal idioms and express strong feelings like a native.', 'Découvrir les métaphores gourmandes et animalières et nuancer joie, colère et surprise.'),
      courseId: 'exp-food-cooking-idioms', practiceId: 'exp-animals-wild-farm',
      moreIds: ['exp-emotions-anger-joy'],
    },
    {
      title: b('Expressions Lab · Relationships, Work & Truth', 'Atelier expressions · Relations, travail et parole'),
      theme: b('Talk about friendship, effort and perseverance, and navigate truth, secrets and tact.', 'Parler d’amitié, d’efforts et de réussite, puis de vérité, de secrets et de franchise.'),
      courseId: 'exp-love-friendship-social', practiceId: 'exp-work-effort-success',
      moreIds: ['exp-speaking-truth-secrets'],
    },
  ],
  B2: [
    {
      title: b('Expressions Lab · Colours, Numbers & Street French', 'Atelier expressions · Couleurs, chiffres et oral vif'),
      theme: b('Decode colour nuances, figurative numbers and everyday colloquial French with register control.', 'Décoder nuances de couleurs, chiffres figurés et français familier en gardant le bon registre.'),
      courseId: 'exp-colours-symbolism', practiceId: 'exp-numbers-measures',
      moreIds: ['exp-colloquial-spoken'],
    },
    {
      title: b('Expressions Lab · Conflicts, Francophonie & Office', 'Atelier expressions · Conflits, francophonie et bureau'),
      theme: b('Handle dilemmas, discover Québec and Francophone idioms and shine in workplace negotiation.', 'Gérer les conflits, découvrir le français du Québec et de la francophonie, et négocier au bureau.'),
      courseId: 'exp-conflicts-decisions-risk', practiceId: 'exp-quebec-francophonie',
      moreIds: ['exp-business-workplace-idioms'],
    },
  ],
  C1: [
    {
      title: b('Expressions Lab · Debate, Irony & Proverbs', 'Atelier expressions · Débat, ironie et proverbes'),
      theme: b('Spot doublespeak and irony in press debates, refine judgement idioms and wield French proverbs.', 'Décoder la langue de bois et la litote, affiner son jugement et placer les proverbes à propos.'),
      courseId: 'exp-politics-media-debate', practiceId: 'exp-irony-understatement',
      moreIds: ['exp-mind-judgement-character', 'exp-proverbs-everyday-wisdom'],
    },
  ],
  C2: [
    {
      title: b('Expressions Lab · History, Classics & High Rhetoric (C2)', 'Atelier expressions · Histoire, classiques et rhétorique (C2)'),
      theme: b('Master mythological allusions, La Fontaine and Molière idioms, formal locutions and rare C2 gems.', 'Maîtriser allusions mythologiques, héritage littéraire, locutions soutenues et perles rares C2.'),
      courseId: 'exp-history-mythology', practiceId: 'exp-literary-moliere-lafontaine',
      moreIds: ['exp-formal-rhetoric-locutions', 'exp-rare-vivid-idioms-c2'],
    },
  ],
};

/** The conjugation course of the Diploma goal's grammar module, per level. */
const DIPLOMA_CONJUGATION: Record<Level, string> = {
  A1: 'cj-present', A2: 'cj-passe-compose', B1: 'cj-conditionnel', B2: 'cj-subjonctif', C1: 'cj-bilan', C2: 'cj-subjonctif-imparfait',
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
    const guided = c.guidedLessons;
    const lessonCount = guided?.count ?? c.lessonCount;
    return {
      id: `course-${c.id}`,
      kind: 'course',
      source: { type: 'course', id: c.id, lessonCount },
      title: tx(c.title, this.lang),
      subtitle: tx(c.subtitle, this.lang),
      badge: guided
        ? this.fr ? (lessonCount === 1 ? 'Parcours · Leçon 1' : `Parcours · Leçons 1 à ${lessonCount}`)
          : (lessonCount === 1 ? 'Path · Lesson 1' : `Path · Lessons 1–${lessonCount}`)
        : this.fr ? `Cours · ${lessonCount} leçons` : `Course · ${lessonCount} lessons`,
      level: this.level,
      minutes: guided?.minutes ?? c.minutes,
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
      badge: this.fr ? `Mission · ${m.documentCount ?? m.documents.length} étapes` : `Mission · ${m.documentCount ?? m.documents.length} steps`,
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
  const verbs = VERB_COURSES.filter(course => course.levels.includes(level));
  const verbModules: StudyModule[] = [];
  for (let offset = 0; offset < verbs.length; offset += 4) {
    const group = verbs.slice(offset, offset + 4);
    const intro = group[0].id === 'verb-groups';
    const names = VERB_ROWS.filter(([id]) => group.some(course => course.id === `verb-${id}`)).map(([, infinitive]) => infinitive).join(', ');
    const title = intro ? b('Verb Groups & First Verbs', 'Groupes et premiers verbes')
      : b(`Essential Verbs · ${names}`, `Verbes essentiels · ${names}`);
    const theme = intro
      ? b('Identify the group, then practise the verbs you need for your first conversations.', 'Reconnaissez le groupe, puis entraînez-vous avec les verbes de vos premières conversations.')
      : b('Practise common constructions, then compare the tenses of each verb.', 'Travaillez les constructions courantes, puis comparez les temps de chaque verbe.');
    verbModules.push(makeModule(0, `verbs-${level}-${offset / 4 + 1}`, title, theme, group.map(course => pool.courseStep(course.id)), lang));
  }
  const [first, ...rest] = COMPLETE_MODULES[level];
  const specs = [first, ...CONJUGATION_MODULES[level], ...rest];
  const modules = specs.map((spec, idx) => {
    const learn = spec.courseId
      ? pool.courseStep(spec.courseId) ?? pool.nextCourse()
      : spec.ladderId
        ? pool.courseStep(spec.ladderId) ?? pool.nextCourse()
        : pool.nextCourse();
    const practice = spec.practiceId ? pool.courseStep(spec.practiceId) : null;
    const more = (spec.moreIds ?? []).map(id => pool.courseStep(id));
    const listen = pool.nextListen({
      dialogueId: spec.dialogueId,
      earId: spec.earId,
      preferDoc: spec.preferDoc,
      // Conjugation modules train the ear on verb forms.
      preferEar: spec.conjugation || ((level === 'C1' || level === 'C2') && idx % 2 === 0),
    });
    const read = spec.conjugation ? null : pool.nextRead(Boolean(spec.preferMission));
    const write = pool.dictationStep(spec.dictMethod);
    return makeModule(idx + 1, `complete-${level}-${idx + 1}`, spec.title, spec.theme, [learn, practice, ...more, listen, read, write], lang);
  });
  const afterConjugation = 1 + CONJUGATION_MODULES[level].length;
  const grammarModules = GRAMMAR_MODULES[level].map((spec, idx) => makeModule(
    0,
    `grammar-${level}-${idx + 1}`,
    spec.title,
    spec.theme,
    [
      spec.courseId ? pool.courseStep(spec.courseId) : null,
      spec.practiceId ? pool.courseStep(spec.practiceId) : null,
      ...(spec.moreIds ?? []).map(id => pool.courseStep(id)),
    ],
    lang,
  ));
  const expressionModules = EXPRESSIONS_MODULES[level].map((spec, idx) => makeModule(
    0,
    `expressions-${level}-${idx + 1}`,
    spec.title,
    spec.theme,
    [
      spec.courseId ? pool.courseStep(spec.courseId) : null,
      spec.practiceId ? pool.courseStep(spec.practiceId) : null,
      ...(spec.moreIds ?? []).map(id => pool.courseStep(id)),
    ],
    lang,
  ));
  modules.splice(afterConjugation, 0, ...verbModules, ...grammarModules, ...expressionModules);
  return modules.map((module, index) => ({ ...module, index: index + 1 }));
}

/**
 * TCF / TEF courses added to each exam module, per level: task, strategy and
 * vocabulary courses in modules 1–5, practice tests and score targets in a
 * sixth module (only where such courses exist).
 */
const EXAM_EXTRAS: Partial<Record<Level, string[][]>> = {
  A2: [[], [], ['tcf-ee-task1'], ['tcf-eo-task1'], ['tef-citizenship'], []],
  B1: [['tcf-exam-day'], ['tcf-canada-vocab', 'tef-vocab'], ['tcf-ee-task2'], ['tcf-eo-task2', 'tefaq-quebec'], ['tef-ee-a', 'tef-eo-a'], ['tcf-clb7', 'tef-nclc7', 'tcf-mock-b1', 'tef-mock-b1']],
  B2: [['tcf-co-strategies', 'tef-co-strategies'], ['tcf-ce-strategies', 'tef-ce-strategies'], ['tcf-ee-task3', 'tef-connectors'], ['tcf-eo-task3', 'tef-eo-b'], ['tef-ee-b'], ['tcf-mock-b2', 'tef-mock-b2']],
  C1: [[], [], [], [], [], ['tcf-mock-c1', 'tef-mock-c1']],
};

function buildExamModules(level: Level, lang: Lang, pool: LevelPool): StudyModule[] {
  const extras = EXAM_EXTRAS[level] ?? [];
  /** The module's steps with its extra exam courses placed after the first `at` steps. */
  const withExtras = (i: number, at: number, steps: (StudyStep | null)[]) => {
    const add = (extras[i] ?? []).map(id => pool.courseStep(id));
    return [...steps.slice(0, at), ...add, ...steps.slice(at)];
  };
  const specs: { title: T; theme: T; steps: () => (StudyStep | null)[] }[] = [
    {
      title: b('TCF Listening & Native Ear', 'TCF Compréhension orale & oreille'),
      theme: b('Train exam listening at your level with native ear drills and real audio documents.', 'Entraînez votre écoute type TCF avec exercices d’oreille et documents réels.'),
      steps: () => withExtras(0, 1, [pool.courseStep('tcf-listening'), pool.nextListen({ preferEar: true }), pool.docStep() ?? pool.dialogueStep(), pool.dictationStep('story')]),
    },
    {
      title: b('TCF Reading & Reformulation', 'TCF Compréhension écrite & repérage'),
      theme: b('Speed up scanning, spot paraphrases and reinforce everyday comprehension.', 'Accélérez le repérage, déjouez les reformulations et consolidez vos réflexes.'),
      steps: () => withExtras(1, 1, [pool.courseStep('tcf-reading'), pool.nextRead(false), pool.dialogueStep() ?? pool.earStep(), pool.dictationStep('homophones')]),
    },
    {
      title: b('TCF Writing & Grammar Precision', 'TCF Expression écrite & grammaire'),
      theme: b('Structure clear exam texts while eliminating tense, accent and agreement mistakes.', 'Structurez vos écrits d’examen tout en supprimant les fautes d’accord et de temps.'),
      steps: () => withExtras(2, 1, [pool.courseStep('tcf-writing'), pool.courseStep('tcf-grammar'), pool.dictationStep('conjugation'), pool.dictationStep('exam')]),
    },
    {
      title: b('TCF Speaking & TEF Canada Listening', 'TCF Oral & TEF Canada Écoute'),
      theme: b('Build natural oral fluency and adapt to Canadian & Québec audio formats.', 'Gagnez en aisance orale et habituez-vous aux formats audio du TEF Canada / Québec.'),
      steps: () => withExtras(3, 1, [pool.courseStep('tcf-speaking'), pool.courseStep('tef-listening'), pool.dialogueStep() ?? pool.docStep(), pool.nextRead(true)]),
    },
    {
      title: b('TEF Full Sprint & Timed Exam Drill', 'Sprint complet TEF & défi chronométré'),
      theme: b('Cover TEF reading, writing and speaking side by side with a timed dictation check.', 'Couvrez lecture, écriture et oral du TEF avec une dictée en conditions d’examen.'),
      steps: () => withExtras(4, 3, [pool.courseStep('tef-reading'), pool.courseStep('tef-writing'), pool.courseStep('tef-speaking'), pool.dictationStep('exam')]),
    },
  ];
  const mocks = extras[5] ?? [];
  if (mocks.length) {
    specs.push({
      title: b('Practice Tests & Score Targets', 'Tests blancs & objectifs de score'),
      theme: b('Sit complete timed practice tests, then check what your target score requires.', 'Passez des tests blancs chronométrés, puis vérifiez ce qu’exige votre score cible.'),
      steps: () => [...mocks.map(id => pool.courseStep(id)), pool.dictationStep('exam')],
    });
  }
  return specs.map((s, i) => makeModule(i + 1, `exams-${level}-${i + 1}`, s.title, s.theme, s.steps(), lang));
}

/** DELF/DALF skill courses per level: [listening, reading, writing, speaking]. */
const DIPLOMA_SKILLS: Partial<Record<Level, (string | undefined)[]>> = {
  A2: [undefined, undefined, undefined, 'delf-a2-oral'],
  B1: [undefined, undefined, 'delf-b1-writing', 'delf-b1-oral'],
  B2: ['delf-b2-listening', 'delf-b2-reading', 'delf-b2-writing', 'delf-b2-oral'],
  C1: [undefined, 'dalf-c1-synthesis', 'dalf-c1-essay', 'dalf-c1-oral'],
  C2: [undefined, undefined, 'dalf-c2-writing'],
};

function buildDiplomaModules(level: Level, lang: Lang, pool: LevelPool): StudyModule[] {
  const delfMap: Record<Level, string> = { A1: 'delf-a1', A2: 'delf-a2', B1: 'delf-b1', B2: 'delf-b2', C1: 'dalf-c1', C2: 'dalf-c2' };
  const mainDiplomaCourse = delfMap[level];
  /** The skill course of module i (listening, reading, writing, speaking), when this level has one. */
  const skill = (i: number) => {
    const id = DIPLOMA_SKILLS[level]?.[i];
    return id ? pool.courseStep(id) : null;
  };

  const specs: { title: T; theme: T; steps: () => (StudyStep | null)[] }[] = [
    {
      title: b(`Official ${level} Foundations & Listening`, `Bases diplôme ${level} & compréhension orale`),
      theme: b('Master the expectations of the diploma and sharpen single-pass listening.', 'Maîtrisez les attendus du diplôme et affûtez votre compréhension orale.'),
      steps: () => [
        pool.courseStep(mainDiplomaCourse) ?? pool.nextCourse(['beginner', 'grammar']),
        skill(0),
        pool.docStep() ?? pool.earStep(),
        pool.dialogueStep() ?? pool.earStep(),
        pool.dictationStep('story'),
      ],
    },
    {
      title: b('Written Comprehension & Analysis', 'Compréhension des écrits & analyse'),
      theme: b('Read authentic texts, identify key arguments and spot homophone nuances.', 'Lisez des documents authentiques, repérez l’essentiel et évitez les homophones.'),
      steps: () => [
        skill(1) ?? pool.nextCourse(['reading', 'tcf', 'tef-quebec']),
        pool.nextRead(false),
        pool.nextRead(true),
        pool.dictationStep('homophones'),
      ],
    },
    {
      title: b('Grammar Mastery & Written Production', 'Grammaire clé & production écrite'),
      theme: b('Strengthen level-defining grammar rules, spelling agreements and structured writing.', 'Verrouillez la grammaire exigée au diplôme, les accords et la rédaction structurée.'),
      steps: () => {
        const writing = skill(2);
        const conjugation = pool.courseStep(DIPLOMA_CONJUGATION[level]);
        return [
          writing,
          pool.nextCourse(['grammar', 'tcf']),
          conjugation ?? (writing ? null : pool.nextCourse(['spelling', 'tef-quebec'])),
          pool.dictationStep('conjugation'),
          pool.dictationStep('story'),
        ];
      },
    },
    {
      title: b('Oral Interaction & Spoken Fluency', 'Interaction orale & aisance'),
      theme: b('Practice realistic dialogues, polite questioning, debating and native rhythm.', 'Pratiquez dialogues réalistes, questions nuancées et rythme naturel.'),
      steps: () => [
        skill(3) ?? pool.nextCourse(['conversation', 'pronunciation', 'tcf']),
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
  const specs: { title: T; theme: T; preferMission?: boolean; dictMethod: DictationMethod; cats: string[] }[] = [
    {
      title: b('Everyday Voices & Natural Speed', 'Voix natives & débit naturel'),
      theme: b('Start listening to real French immediately, read along and write cleanly.', 'Plongez dans le vrai français oral, lisez avec audio et écrivez sans hésiter.'),
      dictMethod: 'story',
      cats: ['listening', 'conversation'],
    },
    {
      title: b('Real-World Missions & Homophones', 'Missions réelles & homophones'),
      theme: b('Decode real French conversations, complete a practical mission and master tricky sounds.', 'Décodez des échanges concrets, réussissez une mission et déjouez les homophones.'),
      preferMission: true,
      dictMethod: 'homophones',
      cats: ['conversation', 'expressions', 'beginner', 'reading'],
    },
    {
      title: b('Sharpen Your Ear & Verbs in Action', 'Affûter son oreille & verbes en action'),
      theme: b('Catch silent endings, fast speech and verb agreements in real contexts.', 'Repérez liaisons, oral rapide et accords verbaux en contexte authentique.'),
      dictMethod: 'conjugation',
      cats: ['pronunciation', 'listening'],
    },
    {
      title: b('Stories, Culture & Practical French', 'Récits, culture & français pratique'),
      theme: b('Immerse yourself in longer audio passages, rich texts and authentic storytelling.', 'Immergez-vous dans des audios plus riches, des textes vivants et la dictée récit.'),
      preferMission: true,
      dictMethod: 'story',
      cats: ['expressions', 'reading', 'beginner', 'conversation'],
    },
    {
      title: b('Full 4-Skill Fluency Sprint', 'Sprint aisance 4 compétences'),
      theme: b('Blend real conversation, ear training, reading and a timed exam-style dictation.', 'Enchaînez conversation, oreille, lecture et dictée défi chronométrée.'),
      dictMethod: 'exam',
      cats: ['expressions', 'conversation', 'listening', 'reading', 'pronunciation'],
    },
  ];
  return specs.map((s, i) => {
    const listen1 = i % 2 === 0 ? (pool.dialogueStep() ?? pool.earStep()) : (pool.earStep() ?? pool.dialogueStep());
    const listen2 = pool.docStep() ?? pool.earStep() ?? pool.dialogueStep();
    const read = pool.nextRead(Boolean(s.preferMission));
    const write = pool.dictationStep(s.dictMethod);
    const course = pool.nextCourse([...s.cats, 'conversation', 'listening', 'reading', 'pronunciation', 'beginner']);
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
