// The practice space (/learn/practice/, /fr/apprendre/pratique/): its five
// skills, the list of reading texts and their addresses. Small on purpose:
// the texts themselves are separate downloads (registry.ts).
//   /learn/practice/reading/                /fr/apprendre/pratique/lecture/
//   /learn/practice/reading/<text>/         /fr/apprendre/pratique/lecture/<text>/
import { LEARN_BASE } from '../categories';
import { b, type Lang, type T } from '../types';
import type { SkillId, TextMeta } from './types';

export const PRACTICE_SLUG: Record<Lang, string> = { en: 'practice', fr: 'pratique' };

export interface SkillMeta {
  id: SkillId;
  slug: Record<Lang, string>;
  name: T;
  /** Open to learners; the others are announced as coming soon. */
  ready: boolean;
}

export const SKILLS: SkillMeta[] = [
  { id: 'reading', slug: { en: 'reading', fr: 'lecture' }, name: b('Reading', 'Lecture'), ready: true },
  { id: 'listening', slug: { en: 'listening', fr: 'ecoute' }, name: b('Listening', 'Écoute'), ready: false },
  { id: 'dictation', slug: { en: 'dictation', fr: 'dictee' }, name: b('Dictation', 'Dictée'), ready: false },
  { id: 'grammar', slug: { en: 'grammar', fr: 'grammaire' }, name: b('Grammar', 'Grammaire'), ready: false },
  { id: 'vocabulary', slug: { en: 'vocabulary', fr: 'vocabulaire' }, name: b('Vocabulary', 'Vocabulaire'), ready: false },
];

export const skillById = (id: SkillId) => SKILLS.find(s => s.id === id)!;

/** The reading texts, easiest first. */
export const TEXTS: TextMeta[] = [
  {
    id: 'je-m-appelle-lucas',
    slug: 'je-m-appelle-lucas',
    title: 'Je m’appelle Lucas',
    subtitle: b('Lucas introduces himself: his age, his country, his job and his new life in Montréal.', 'Lucas se présente : son âge, son pays, son métier et sa nouvelle vie à Montréal.'),
    level: 'A1',
    genre: 'portrait',
    theme: b('Introducing yourself', 'Se présenter'),
    focus: b('Avoir or être?', 'Avoir ou être ?'),
    image: 'text-lucas',
    words: 132,
    questions: 5,
    starter: true,
  },
  {
    id: 'la-journee-de-nadia',
    slug: 'la-journee-de-nadia',
    title: 'La journée de Nadia',
    subtitle: b('Nadia is a baker in Lyon: her day starts at four in the morning. Follow it hour by hour.', 'Nadia est boulangère à Lyon : sa journée commence à quatre heures du matin. Suivez-la heure par heure.'),
    level: 'A1',
    genre: 'story',
    theme: b('Daily routine and time', 'La routine et l’heure'),
    focus: b('Reflexive verbs', 'Les verbes pronominaux'),
    image: 'text-nadia',
    words: 150,
    questions: 5,
    starter: true,
  },
  {
    id: 'voici-ma-famille',
    slug: 'voici-ma-famille',
    title: 'Voici ma famille',
    subtitle: b('Aïcha shows a family photo: her husband, her two children and her mother, visiting from Senegal.', 'Aïcha montre une photo de famille : son mari, ses deux enfants et sa mère, venue du Sénégal.'),
    level: 'A1',
    genre: 'portrait',
    theme: b('Family', 'La famille'),
    focus: b('Possessive adjectives', 'Les adjectifs possessifs'),
    image: 'text-family',
    words: 138,
    questions: 5,
    starter: true,
  },
  {
    id: 'le-samedi-de-marc',
    slug: 'le-samedi-de-marc',
    title: 'Le samedi de Marc',
    subtitle: b('A student’s favourite day in Bordeaux: cycling, football with friends, cooking and music.', 'Le jour préféré d’un étudiant à Bordeaux : vélo, football entre amis, cuisine et musique.'),
    level: 'A1',
    genre: 'story',
    theme: b('Leisure', 'Les loisirs'),
    focus: b('Faire du, jouer au, jouer du', 'Faire du, jouer au, jouer du'),
    image: 'text-marc',
    words: 122,
    questions: 5,
  },
  {
    id: 'un-billet-pour-quebec',
    slug: 'un-billet-pour-quebec',
    title: 'Un billet pour Québec',
    subtitle: b('At the train station: Daniel buys a return ticket, asks the times, the price and the platform.', 'À la gare : Daniel achète un aller-retour et demande les horaires, le prix et le quai.'),
    level: 'A1',
    genre: 'dialogue',
    theme: b('Travelling by train', 'Voyager en train'),
    focus: b('Asking questions', 'Poser une question'),
    image: 'text-station',
    words: 124,
    questions: 6,
  },
  {
    id: 'sophie-fait-ses-courses',
    slug: 'sophie-fait-ses-courses',
    title: 'Sophie fait ses courses',
    subtitle: b('A conversation at a market stall: asking for prices and quantities, then paying.', 'Une conversation devant un étal du marché : demander les prix et les quantités, puis payer.'),
    level: 'A2',
    genre: 'dialogue',
    theme: b('Shopping at the market', 'Faire ses courses au marché'),
    focus: b('Quantities and “de”', 'Les quantités et « de »'),
    image: 'text-sophie',
    words: 145,
    questions: 6,
    starter: true,
  },
  {
    id: 'mon-nouvel-appartement',
    slug: 'mon-nouvel-appartement',
    title: 'Mon nouvel appartement',
    subtitle: b('Inès writes to her friend Paul: the move, her new apartment, the neighbourhood and an invitation.', 'Inès écrit à son ami Paul : le déménagement, son nouvel appartement, le quartier et une invitation.'),
    level: 'A2',
    genre: 'email',
    theme: b('Housing', 'Le logement'),
    focus: b('Passé composé: avoir or être', 'Passé composé : avoir ou être'),
    image: 'text-ines',
    words: 157,
    questions: 6,
  },
  {
    id: 'quand-j-etais-enfant',
    slug: 'quand-j-etais-enfant',
    title: 'Quand j’étais enfant',
    subtitle: b('Childhood summers at the grandparents’ house in Brittany: the beach, the crêpes and the attic on rainy days.', 'Les étés d’enfance chez les grands-parents, en Bretagne : la plage, les crêpes et le grenier les jours de pluie.'),
    level: 'A2',
    genre: 'story',
    theme: b('Memories', 'Les souvenirs'),
    focus: b('The imparfait', 'L’imparfait'),
    image: 'text-childhood',
    words: 143,
    questions: 6,
  },
  {
    id: 'un-mot-pour-les-voisins',
    slug: 'un-mot-pour-les-voisins',
    title: 'Un mot pour les voisins',
    subtitle: b('New tenants warn their neighbours about noisy work, then invite them to get to know each other.', 'De nouveaux locataires préviennent leurs voisins de travaux bruyants, puis les invitent à faire connaissance.'),
    level: 'A2',
    genre: 'notice',
    theme: b('Neighbours and housing', 'Voisins et logement'),
    focus: b('The near future', 'Le futur proche'),
    image: 'text-neighbours',
    words: 116,
    questions: 6,
  },
  {
    id: 'chez-le-medecin',
    slug: 'chez-le-medecin',
    title: 'Chez le médecin',
    subtitle: b('A sore throat, a fever and a prescription: a consultation, line by line.', 'Mal à la gorge, de la fièvre et une ordonnance : une consultation, réplique par réplique.'),
    level: 'A2',
    genre: 'dialogue',
    theme: b('Health', 'La santé'),
    focus: b('Avoir mal à, depuis', 'Avoir mal à, depuis'),
    image: 'text-doctor',
    words: 126,
    questions: 6,
  },
  {
    id: 'les-bibliotheques-bien-plus-que-des-livres',
    slug: 'les-bibliotheques-bien-plus-que-des-livres',
    title: 'Les bibliothèques, bien plus que des livres',
    subtitle: b('A short article: how public libraries became free meeting places, especially for newcomers.', 'Un court article : comment les bibliothèques publiques sont devenues des lieux de rencontre gratuits, surtout pour les nouveaux arrivants.'),
    level: 'B1',
    genre: 'article',
    theme: b('Culture and society', 'Culture et société'),
    focus: b('Logical connectors', 'Les connecteurs logiques'),
    image: 'text-library',
    words: 269,
    questions: 6,
  },
  {
    id: 'le-teletravail-liberte-ou-isolement',
    slug: 'le-teletravail-liberte-ou-isolement',
    title: 'Le télétravail : liberté ou isolement ?',
    subtitle: b('Working from home: time saved and better focus, but loneliness and blurred evenings. An article that weighs both sides.', 'Travailler à la maison : du temps gagné et plus de concentration, mais aussi la solitude et des soirées sans fin. Un article qui pèse le pour et le contre.'),
    level: 'B1',
    genre: 'article',
    theme: b('Work', 'Le travail'),
    focus: b('Expressing contrast', 'Exprimer l’opposition'),
    image: 'text-telework',
    words: 181,
    questions: 6,
  },
  {
    id: 'une-demande-d-informations',
    slug: 'une-demande-d-informations',
    title: 'Une demande d’informations',
    subtitle: b('Amadou writes to a language school about evening classes: a model of a formal email.', 'Amadou écrit à une école de langues au sujet des cours du soir : un modèle de courriel formel.'),
    level: 'B1',
    genre: 'email',
    theme: b('Formal writing', 'Écrire de façon formelle'),
    focus: b('The polite conditional', 'Le conditionnel de politesse'),
    image: 'text-request',
    words: 115,
    questions: 6,
  },
  {
    id: 'le-jour-ou-lea-a-rate-son-avion',
    slug: 'le-jour-ou-lea-a-rate-son-avion',
    title: 'Le jour où Léa a raté son avion',
    subtitle: b('A snowstorm, a taxi stuck in traffic and a closed boarding gate, just before Christmas.', 'Une tempête de neige, un taxi bloqué dans les bouchons et un embarquement terminé, juste avant Noël.'),
    level: 'B1',
    genre: 'story',
    theme: b('Travel', 'Les voyages'),
    focus: b('Passé composé or imparfait', 'Passé composé ou imparfait'),
    image: 'text-plane',
    words: 156,
    questions: 6,
  },
  {
    id: 'faut-il-interdire-le-telephone-a-l-ecole',
    slug: 'faut-il-interdire-le-telephone-a-l-ecole',
    title: 'Faut-il interdire le téléphone à l’école ?',
    subtitle: b('Ban it, use it, or teach how to use it? A nuanced article on phones in the classroom.', 'L’interdire, s’en servir ou apprendre à bien l’utiliser ? Un article nuancé sur le téléphone en classe.'),
    level: 'B2',
    genre: 'article',
    theme: b('Education', 'L’éducation'),
    focus: b('The subjunctive', 'Le subjonctif'),
    image: 'text-phones',
    words: 225,
    questions: 6,
  },
];

export const textById = (id: string) => TEXTS.find(t => t.id === id);

/** Points of a text: two per question. */
export const POINTS_PER_QUESTION = 2;
export const textPoints = (t: TextMeta) => t.questions * POINTS_PER_QUESTION;
/** About 120 words a minute for a learner reading closely, plus the questions. */
export const textMinutes = (t: TextMeta) => Math.max(4, Math.round(t.words / 120 + t.questions * 0.7));

export const practicePath = (lang: Lang) => `${LEARN_BASE[lang]}${PRACTICE_SLUG[lang]}/`;
export const skillPath = (skill: SkillMeta, lang: Lang) => `${practicePath(lang)}${skill.slug[lang]}/`;
export const readingPath = (lang: Lang) => skillPath(skillById('reading'), lang);
export const textPath = (t: TextMeta, lang: Lang) => `${readingPath(lang)}${t.slug}/`;
