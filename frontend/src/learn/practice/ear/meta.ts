// The ear-training courses, easiest first, and their addresses:
//   /learn/practice/listening/ear-training/<id>/   /fr/apprendre/pratique/ecoute/oreille/<id>/
// The content of each course is a separate download (registry.ts).
import { b, type Lang } from '../../types';
import { listeningPath } from '../listening/catalog';
import type { EarMeta } from './types';
import { ADVANCED } from './meta-advanced';

export const EAR_SLUG: Record<Lang, string> = { en: 'ear-training', fr: 'oreille' };

const COURSES: EarMeta[] = [
  {
    id: 'ils-ont-ou-ils-sont', level: 'A1', title: 'Ils ont ou ils sont ?', sample: 'ils‿ont',
    tag: b('The liaison', 'La liaison'),
    summary: b('Hear the little [z] that tells avoir from être, and singular from plural.', 'Entendez le petit [z] qui distingue avoir d’être, et le singulier du pluriel.'),
    minutes: 6, items: 10,
  },
  {
    id: 'les-nombres-qui-piegent', level: 'A1', title: 'Les nombres qui piègent', sample: '4 × 20 + 17',
    tag: b('Numbers', 'Les nombres'),
    summary: b('Soixante-dix, quatre-vingts, quatre-vingt-dix: catch prices, times, years and phone numbers.', 'Soixante-dix, quatre-vingts, quatre-vingt-dix : comprenez prix, heures, années et numéros de téléphone.'),
    minutes: 7, items: 10,
  },
  {
    id: 'question-ou-affirmation', level: 'A2', title: 'Question ou affirmation ?', sample: 'Tu viens ↗',
    tag: b('Intonation', 'L’intonation'),
    summary: b('Same words, different melody: tell a question from a statement.', 'Mêmes mots, autre mélodie : distinguez une question d’une affirmation.'),
    minutes: 6, items: 10,
  },
  {
    id: 'un-ou-plusieurs', level: 'A2', title: 'Un ou plusieurs ?', sample: 'le · les',
    tag: b('The spoken plural', 'Le pluriel à l’oral'),
    summary: b('Plural endings are silent: hear le / les, ce / ces and the verbs that change.', 'Les marques du pluriel sont muettes : entendez le / les, ce / ces et les verbes qui changent.'),
    minutes: 6, items: 10,
  },
  {
    id: 'sur-ou-sous', level: 'A2', title: 'Sur ou sous ?', sample: 'sur · sous',
    tag: b('The vowels u and ou', 'Les voyelles u et ou'),
    summary: b('Sur or sous, rue or roue: train your ear to the French [y].', 'Sur ou sous, rue ou roue : habituez votre oreille au [y] français.'),
    minutes: 6, items: 10,
  },
  {
    id: 'vent-vont-vin', level: 'A2', title: 'Vent, vont, vin', sample: 'an · on · in',
    tag: b('Nasal vowels', 'Les voyelles nasales'),
    summary: b('An, on, in: three nasal vowels that change the word.', 'An, on, in : trois voyelles nasales qui changent le mot.'),
    minutes: 6, items: 10,
  },
  {
    id: 'passe-present-ou-futur', level: 'B1', title: 'Passé, présent ou futur ?', sample: 'je fais · j’ai fait',
    tag: b('Tenses by ear', 'Les temps à l’oral'),
    summary: b('Je fais or j’ai fait? Hear the tense in one small sound.', 'Je fais ou j’ai fait ? Entendez le temps dans un seul petit son.'),
    minutes: 7, items: 10,
  },
  {
    id: 'meme-son-autre-sens', level: 'B1', title: 'Même son, autre sens', sample: 'vert · verre · vers',
    tag: b('Homophones', 'Les homophones'),
    summary: b('Vert, verre, vers: when words sound the same, let the sentence decide.', 'Vert, verre, vers : quand les mots sonnent pareil, la phrase décide.'),
    minutes: 7, items: 10,
  },
  {
    id: 'le-francais-qui-se-raccourcit', level: 'B1', title: 'Le français qui se raccourcit', sample: 'j’sais pas',
    tag: b('Everyday speech', 'L’oral de tous les jours'),
    summary: b('J’sais pas, t’es où, y a: understand French as it is really spoken.', 'J’sais pas, t’es où, y a : comprenez le français tel qu’on le parle.'),
    minutes: 7, items: 10,
  },
  {
    id: 'les-petits-mots-de-l-oral', level: 'B2', title: 'Les petits mots de l’oral', sample: 'du coup…',
    tag: b('Discourse markers', 'Les marqueurs de l’oral'),
    summary: b('Du coup, en fait, bref: follow the logic of native speech.', 'Du coup, en fait, bref : suivez la logique d’un locuteur natif.'),
    minutes: 8, items: 10,
  },
  {
    id: 'masculin-ou-feminin', level: 'A1', title: 'Masculin ou féminin ?', sample: 'un · une',
    tag: b('Gender by ear', 'Le genre à l’oral'),
    summary: b('Petit or petite, voisin or voisine: hear whether a man or a woman is meant.', 'Petit ou petite, voisin ou voisine : entendez si l’on parle d’un homme ou d’une femme.'),
    minutes: 6, items: 10,
  },
  {
    id: 'quelle-heure-est-il', level: 'A1', title: 'Quelle heure est-il ?', sample: 'moins le quart',
    tag: b('Telling the time', 'Dire l’heure'),
    summary: b('Et quart, et demie, moins le quart, midi, minuit: understand every way of saying the time.', 'Et quart, et demie, moins le quart, midi, minuit : comprenez toutes les façons de dire l’heure.'),
    minutes: 6, items: 10,
  },
  {
    id: 'poisson-ou-poison', level: 'A2', title: 'Poisson ou poison ?', sample: 'poisson · poison',
    tag: b('The sounds s and z', 'Les sons s et z'),
    summary: b('Dessert or désert, coussin or cousin: one buzz changes the word.', 'Dessert ou désert, coussin ou cousin : une vibration change le mot.'),
    minutes: 6, items: 10,
  },
  {
    id: 'tapez-1', level: 'A2', title: 'Tapez 1 : les messages automatiques', sample: 'Tapez 1',
    tag: b('Phone menus', 'Les serveurs vocaux'),
    summary: b('Tapez 1, la touche dièse, veuillez patienter: get through any French phone menu.', 'Tapez 1, la touche dièse, veuillez patienter : passez n’importe quel serveur vocal.'),
    minutes: 6, items: 10,
  },
  {
    id: 'pain-bain-vin', level: 'A2', title: 'Pain, bain, vin', sample: 'p · b · v',
    tag: b('The sounds p, b and v', 'Les sons p, b et v'),
    summary: b('Je bois or je vois, bague or vague: three consonants not to mix up.', 'Je bois ou je vois, bague ou vague : trois consonnes à ne pas confondre.'),
    minutes: 6, items: 10,
  },
  {
    id: 'ne-que', level: 'B1', title: 'Ne… que : seulement ou pas du tout ?', sample: 'ne… que',
    tag: b('Negation', 'La négation'),
    summary: b('Ne… plus, ne… jamais, ne… rien, and ne… que, which means « only ».', 'Ne… plus, ne… jamais, ne… rien, et ne… que, qui veut dire « seulement ».'),
    minutes: 7, items: 10,
  },
  {
    id: 'les-petits-pronoms', level: 'B1', title: 'Les petits pronoms', sample: 'j’y vais · j’en ai',
    tag: b('Pronouns by ear', 'Les pronoms à l’oral'),
    summary: b('Y, en, le, lui: hear the tiny words stuck to the verb, and what they replace.', 'Y, en, le, lui : entendez les petits mots collés au verbe, et ce qu’ils remplacent.'),
    minutes: 7, items: 10,
  },
  {
    id: 'epeler-en-francais', level: 'B1', title: 'Épeler en français', sample: 'G = gé · J = ji',
    tag: b('Spelling aloud', 'Épeler'),
    summary: b('Letter names, accents, arobase and tiret: note a name or an e-mail address spelled aloud.', 'Nom des lettres, accents, arobase et tiret : notez un nom ou une adresse épelés.'),
    minutes: 7, items: 10,
  },
  {
    id: 'les-chiffres-de-l-actualite', level: 'B2', title: 'Les chiffres de l’actualité', sample: '1 sur 5 = 20 %',
    tag: b('Numbers in the news', 'Les chiffres à la radio'),
    summary: b('Percentages, millions, a third, one in five: keep up with the numbers on the radio.', 'Pourcentages, millions, un tiers, un sur cinq : suivez les chiffres à la radio.'),
    minutes: 8, items: 10,
  },
  {
    id: 'qui-a-dit-quoi', level: 'B2', title: 'Qui a dit quoi ?', sample: 'il m’a dit que…',
    tag: b('Reported speech', 'Le discours rapporté'),
    summary: b('Il m’a dit qu’il viendrait: follow who said what, and what was really promised.', 'Il m’a dit qu’il viendrait : suivez qui a dit quoi, et ce qui a vraiment été promis.'),
    minutes: 8, items: 10,
  },
];

const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
/** Easiest first: the library and the « next course » link follow this order. */
export const EAR: EarMeta[] = [...COURSES, ...ADVANCED].sort((a, b) => ORDER.indexOf(a.level) - ORDER.indexOf(b.level));

export const earById = (id: string) => EAR.find(e => e.id === id);
export const earPath = (e: EarMeta, lang: Lang) => `${listeningPath(lang)}${EAR_SLUG[lang]}/${e.id}/`;
