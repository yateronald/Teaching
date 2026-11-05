// The eight learning paths of the free courses. Small on purpose: the home page
// imports it for its "Free courses" section without pulling in the courses.
import { b, type CategoryMeta, type Lang } from './types';
import versions from './image-versions.json';

export const LEARN_BASE: Record<Lang, string> = { en: '/learn/', fr: '/fr/apprendre/' };

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'beginner',
    slug: { en: 'beginner-french', fr: 'francais-debutant' },
    name: b('Beginner French', 'Français débutant'),
    tag: b('Start here', 'Commencez ici'),
    tagline: b('Your first words, numbers and everyday situations.', 'Vos premiers mots, les nombres et les situations du quotidien.'),
    description: b(
      'Four short courses to go from zero to your first real conversations: greeting people, introducing yourself, numbers and time, family and home, cafés, transport and hotels. Every lesson makes you listen, speak and build sentences from the first minute.',
      'Quatre cours courts pour passer de zéro à vos premières vraies conversations : saluer, vous présenter, les nombres et l’heure, la famille et la maison, le café, les transports et l’hôtel. Chaque leçon vous fait écouter, parler et construire des phrases dès la première minute.',
    ),
    image: 'cat-beginner',
    topic: 'online',
  },
  {
    id: 'grammar',
    slug: { en: 'french-grammar', fr: 'grammaire-francaise' },
    name: b('French Grammar', 'Grammaire française'),
    tag: b('Build accuracy', 'Gagnez en précision'),
    tagline: b('Articles, tenses and the subjunctive, without the headache.', 'Articles, temps et subjonctif, sans prise de tête.'),
    description: b(
      'The grammar points that matter most, taught the way a teacher would at the board: a clear rule, many examples heard aloud, then exercises that make you use it. From articles and the present tense to the passé composé, the conditional and the subjunctive.',
      'Les points de grammaire qui comptent vraiment, expliqués comme au tableau : une règle claire, beaucoup d’exemples écoutés, puis des exercices qui vous la font utiliser. Des articles et du présent jusqu’au passé composé, au conditionnel et au subjonctif.',
    ),
    image: 'cat-grammar',
    topic: 'online',
  },
  {
    id: 'spelling',
    slug: { en: 'french-spelling', fr: 'orthographe' },
    name: b('Spelling', 'Orthographe'),
    tag: b('Write without mistakes', 'Écrire sans fautes'),
    tagline: b('Accents, homophones and agreement rules.', 'Accents, homophones et règles d’accord.'),
    description: b(
      'French spelling has rules, and the frequent mistakes can be avoided with a few reliable tests. Accents and sound-spellings at A1, homophones (a / à, et / est, son / sont…) at A2, agreement of plurals, feminines and past participles at B1, with dictations recorded by native voices.',
      'L’orthographe française a ses règles, et les fautes fréquentes s’évitent avec quelques tests fiables. Les accents et les sons écrits au A1, les homophones (a / à, et / est, son / sont…) au A2, les accords du pluriel, du féminin et du participe passé au B1, avec des dictées enregistrées par des voix natives.',
    ),
    image: 'cat-spelling',
    topic: 'online',
  },
  {
    id: 'listening',
    slug: { en: 'french-listening', fr: 'comprehension-orale' },
    name: b('Listening', 'Compréhension orale'),
    tag: b('Train your ear', 'Entraînez votre oreille'),
    tagline: b('Real-life audio, level by level, with transcripts.', 'Des audios de la vie réelle, niveau par niveau, avec transcriptions.'),
    description: b(
      'Understanding spoken French is the skill learners find hardest. Train on recordings voiced by native speakers: messages and announcements at A2, radio reports and interviews at B1. Every audio is followed by questions and its transcript.',
      'Comprendre le français parlé est la compétence la plus difficile pour les apprenants. Entraînez-vous sur des enregistrements de voix natives : messages et annonces au A2, chroniques radio et interviews au B1. Chaque audio est suivi de questions et de sa transcription.',
    ),
    image: 'cat-listening',
    topic: 'online',
  },
  {
    id: 'pronunciation',
    slug: { en: 'french-pronunciation', fr: 'prononciation-francaise' },
    name: b('Pronunciation', 'Prononciation'),
    tag: b('Sound natural', 'Parlez naturellement'),
    tagline: b('The sounds, liaisons and melody of spoken French.', 'Les sons, les liaisons et la mélodie du français parlé.'),
    description: b(
      'Train your ear and your voice: the vowels that change meaning (u / ou, é / è), nasal sounds, the French R, silent letters, liaisons and intonation. You listen to native recordings, then speak and the page tells you what it understood.',
      'Entraînez votre oreille et votre voix : les voyelles qui changent le sens (u / ou, é / è), les nasales, le R français, les lettres muettes, les liaisons et l’intonation. Vous écoutez des enregistrements natifs, puis vous parlez et la page vous dit ce qu’elle a compris.',
    ),
    image: 'cat-pronunciation',
    topic: 'online',
  },
  {
    id: 'conversation',
    slug: { en: 'french-conversation', fr: 'conversation-en-francais' },
    name: b('Conversation', 'Conversation'),
    tag: b('Speak with confidence', 'Parlez avec assurance'),
    tagline: b('Small talk, opinions, debates and Québec French.', 'Small talk, opinions, débats et français québécois.'),
    description: b(
      'Real conversations, line by line: you pick your reply in animated dialogues, learn the phrases natives actually use, give your opinion, argue a point and discover the French spoken in Québec.',
      'De vraies conversations, réplique par réplique : vous choisissez votre réponse dans des dialogues animés, apprenez les tournures que les natifs utilisent vraiment, donnez votre avis, défendez une idée et découvrez le français parlé au Québec.',
    ),
    image: 'cat-conversation',
    topic: 'online',
  },
  {
    id: 'tcf',
    slug: { en: 'tcf-canada', fr: 'tcf-canada' },
    name: b('TCF Canada', 'TCF Canada'),
    tag: b('Exam success', 'Réussite à l’examen'),
    tagline: b('Five real courses, one per skill, each from A1 to C2.', 'Cinq vrais cours, un par compétence, chacun du A1 au C2.'),
    description: b(
      'Five levelled courses to prepare the TCF Canada, accepted by IRCC for Express Entry and citizenship: listening, reading, writing, speaking, and grammar and vocabulary. Each course has six levels, from A1 to C2: an adaptive test places you, each level teaches the French of that level with exam-style practice, and 70% unlocks the next one.',
      'Cinq cours par niveaux pour préparer le TCF Canada, reconnu par IRCC pour Entrée express et la citoyenneté : compréhension orale, compréhension écrite, expression écrite, expression orale, grammaire et vocabulaire. Chaque cours compte six niveaux, du A1 au C2 : un test adaptatif vous place, chaque niveau enseigne le français de ce niveau avec des exercices type examen, et 70 % débloque le suivant.',
    ),
    image: 'cat-tcf',
    topic: 'tcf-canada',
  },
  {
    id: 'tef-quebec',
    slug: { en: 'tef-canada-quebec', fr: 'tef-canada-quebec' },
    name: b('TEF Canada & Québec', 'TEF Canada et Québec'),
    tag: b('Immigration exams', 'Examens d’immigration'),
    tagline: b('Five TEF courses, one per skill, each from A1 to C2.', 'Cinq cours TEF, un par compétence, chacun du A1 au C2.'),
    description: b(
      'Five levelled courses for the TEF Canada and the TEFAQ (Québec): listening, reading, writing, speaking, and grammar and vocabulary, built on the documents and tasks of the TEF (voicemails, workplace emails, the news story, the argued letter, getting information and convincing), with Québec French where it belongs. Six levels per course, A1 to C2, with an adaptive test.',
      'Cinq cours par niveaux pour le TEF Canada et le TEFAQ (Québec) : compréhension orale, compréhension écrite, expression écrite, expression orale, grammaire et vocabulaire, construits sur les documents et les tâches du TEF (messages vocaux, courriels professionnels, fait divers, lettre argumentée, obtenir des informations et convaincre), avec le français québécois là où il a sa place. Six niveaux par cours, du A1 au C2, avec un test adaptatif.',
    ),
    image: 'cat-tef',
    topic: 'tef-canada',
  },
  {
    id: 'delf-dalf',
    slug: { en: 'delf-dalf', fr: 'delf-dalf' },
    name: b('DELF & DALF', 'DELF et DALF'),
    tag: b('Diplomas for life', 'Des diplômes à vie'),
    tagline: b('Pass the DELF B1, the DELF B2 and the DALF C1.', 'Réussir le DELF B1, le DELF B2 et le DALF C1.'),
    description: b(
      'The official French diplomas never expire. Learn how each paper is marked, write the essays examiners expect, and build the structured argument that the B2 and C1 levels require.',
      'Les diplômes officiels de français sont valables à vie. Découvrez comment chaque épreuve est notée, rédigez les textes qu’attendent les examinateurs et construisez l’argumentation structurée exigée aux niveaux B2 et C1.',
    ),
    image: 'cat-delf',
    topic: 'delf-dalf',
  },
  {
    id: 'business',
    slug: { en: 'business-french', fr: 'francais-professionnel' },
    name: b('Business French', 'Français professionnel'),
    tag: b('For your career', 'Pour votre carrière'),
    tagline: b('Emails, job interviews and meetings in French.', 'E-mails, entretiens d’embauche et réunions en français.'),
    description: b(
      'French for work in Canada, France or anywhere French is spoken: write professional emails with the right formulas, prepare a job interview and take part in meetings with confidence.',
      'Le français du travail, au Canada, en France ou ailleurs : rédiger des e-mails professionnels avec les bonnes formules, préparer un entretien d’embauche et participer aux réunions avec assurance.',
    ),
    image: 'cat-business',
    topic: 'business',
  },
];

export const categoryById = (id: string) => CATEGORIES.find(c => c.id === id);
export const categoryPath = (c: CategoryMeta, lang: Lang) => `${LEARN_BASE[lang]}${c.slug[lang]}/`;
/** Generated pictures live in /public/learn/img (scripts/learn-media.mjs). */
const VERSIONS = versions as Record<string, string>;
/** Picture URL with a content version (?v=…): the server caches pictures for a year. */
export const imageUrl = (key: string, width: 640 | 1200 = 1200) =>
  `/learn/img/${key}${width === 640 ? '-640' : ''}.webp${VERSIONS[key] ? `?v=${VERSIONS[key]}` : ''}`;
