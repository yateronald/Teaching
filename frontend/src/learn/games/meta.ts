// The games of the learning space (/learn/games/, /fr/apprendre/jeux/): what
// lists, addresses and search engines need. Small on purpose: the games
// themselves (words, story, components) are in their own files.
import { LEARN_BASE } from '../categories';
import { b, type Lang, type T } from '../types';

export const GAMES_SLUG: Record<Lang, string> = { en: 'games', fr: 'jeux' };

export type GameId = 'story' | 'gender' | 'numbers' | 'pairs' | 'daily';

export interface GameMeta {
  id: GameId;
  slug: Record<Lang, string>;
  title: T;
  /** Short label on the card. */
  tag: T;
  tagline: T;
  /** A paragraph for the page and search engines. */
  description: T;
  /** How to play, in three steps. */
  how: T[];
  /** What it trains. */
  skills: T[];
  level: string;
  duration: T;
}

export const GAMES: GameMeta[] = [
  {
    id: 'story',
    slug: { en: 'my-first-week-in-montreal', fr: 'ma-premiere-semaine-a-montreal' },
    title: b('My First Week in Montréal', 'Ma première semaine à Montréal'),
    tag: b('Interactive story', 'Histoire interactive'),
    tagline: b('You have just landed. Five episodes, real situations, and your French decides what happens next.', 'Vous venez d’atterrir. Cinq épisodes, des situations réelles, et c’est votre français qui fait avancer l’histoire.'),
    description: b(
      'An interactive story in French for beginners. You play a newcomer during a first week in Montréal: passport control, the taxi, the keys of your apartment, the grocery store, the metro, the bank and your first day at work. In each scene you listen to native voices, choose what to say and build your replies. Three hearts per episode, up to three stars to win.',
      'Une histoire interactive en français pour débutants. Vous jouez une personne qui vient d’arriver à Montréal, pendant sa première semaine : le contrôle des passeports, le taxi, les clés de l’appartement, l’épicerie, le métro, la banque et le premier jour de travail. Dans chaque scène, vous écoutez des voix natives, choisissez quoi dire et construisez vos réponses. Trois cœurs par épisode, jusqu’à trois étoiles à gagner.',
    ),
    how: [
      b('Listen to each character: every line is spoken by a native voice.', 'Écoutez chaque personnage : toutes les répliques sont dites par des voix natives.'),
      b('Choose or build your reply. A wrong answer costs a heart, and you learn why.', 'Choisissez ou construisez votre réponse. Une erreur coûte un cœur, et vous apprenez pourquoi.'),
      b('Finish the episode with hearts left to earn up to three stars and unlock the next one.', 'Terminez l’épisode avec des cœurs pour gagner jusqu’à trois étoiles et débloquer le suivant.'),
    ],
    skills: [b('Listening', 'Compréhension orale'), b('Everyday conversation', 'Conversation du quotidien'), b('Politeness and register', 'Politesse et registre')],
    level: 'A1 → A2',
    duration: b('5 episodes · about 6 min each', '5 épisodes · environ 6 min chacun'),
  },
  {
    id: 'gender',
    slug: { en: 'le-or-la', fr: 'le-ou-la' },
    title: b('Le or La?', 'Le ou la ?'),
    tag: b('60-second challenge', 'Défi de 60 secondes'),
    tagline: b('Masculine or feminine? Sort as many nouns as you can in one minute.', 'Masculin ou féminin ? Classez le plus de noms possible en une minute.'),
    description: b(
      'The gender of French nouns is the first thing that trips up learners. This one-minute game trains your reflexes: a noun appears, you choose le or la, and you hear it with the right article. Chain correct answers to build a combo, then review your mistakes with the endings that give the gender away.',
      'Le genre des noms est la première difficulté du français. Ce jeu d’une minute entraîne vos réflexes : un nom apparaît, vous choisissez le ou la, et vous l’entendez avec le bon article. Enchaînez les bonnes réponses pour faire monter le combo, puis revoyez vos erreurs avec les terminaisons qui révèlent le genre.',
    ),
    how: [
      b('A noun appears: choose LE or LA (or use the ← and → keys).', 'Un nom apparaît : choisissez LE ou LA (ou les touches ← et →).'),
      b('Each right answer in a row increases your combo and your points.', 'Chaque bonne réponse d’affilée augmente votre combo et vos points.'),
      b('After 60 seconds, review your mistakes and beat your best score.', 'Après 60 secondes, revoyez vos erreurs et battez votre record.'),
    ],
    skills: [b('Noun gender', 'Genre des noms'), b('Vocabulary', 'Vocabulaire'), b('Speed', 'Rapidité')],
    level: 'A1 → A2',
    duration: b('1 minute per game', '1 minute par partie'),
  },
  {
    id: 'numbers',
    slug: { en: 'number-bingo', fr: 'loto-des-nombres' },
    title: b('Number Bingo', 'Le loto des nombres'),
    tag: b('Listening game', 'Jeu d’écoute'),
    tagline: b('You hear a number in French: find it on your card before the next one.', 'Vous entendez un nombre en français : trouvez-le sur votre carte avant le suivant.'),
    description: b(
      'French numbers are famously tricky: soixante-dix, quatre-vingts, quatre-vingt-dix-sept. In this bingo, a native voice calls the numbers and you tap them on your card. Three levels, from 0–20 to the full 0–100, with lines to complete for bonus points. The best way to finally understand prices, phone numbers and times.',
      'Les nombres français sont réputés difficiles : soixante-dix, quatre-vingts, quatre-vingt-dix-sept. Dans ce loto, une voix native annonce les nombres et vous les cochez sur votre carte. Trois niveaux, de 0–20 jusqu’à 0–100, avec des lignes à compléter pour gagner des points bonus. Le meilleur moyen de comprendre enfin les prix, les numéros de téléphone et les heures.',
    ),
    how: [
      b('Choose a level: 0–20, 0–69 or 0–100.', 'Choisissez un niveau : 0–20, 0–69 ou 0–100.'),
      b('Listen to the number and tap it on your card. You can replay it.', 'Écoutez le nombre et cochez-le sur votre carte. Vous pouvez le réécouter.'),
      b('Complete lines for bonus points. Three mistakes and the game is over.', 'Complétez des lignes pour des points bonus. Trois erreurs et la partie s’arrête.'),
    ],
    skills: [b('Numbers 0 to 100', 'Nombres de 0 à 100'), b('Listening', 'Compréhension orale')],
    level: 'A1',
    duration: b('2 to 3 minutes per game', '2 à 3 minutes par partie'),
  },
  {
    id: 'pairs',
    slug: { en: 'sound-pairs', fr: 'les-paires-sonores' },
    title: b('Sound Pairs', 'Les paires sonores'),
    tag: b('Memory game', 'Jeu de mémoire'),
    tagline: b('Match each spoken word with its written form. Eight themes of everyday vocabulary.', 'Associez chaque mot entendu à sa forme écrite. Huit thèmes de vocabulaire du quotidien.'),
    description: b(
      'A memory game that links the sound of French to its spelling. Half of the cards speak, the other half show a written word: find the pairs. Eight themes (food, the city, the home, the body, clothes, nature, transport, work) to learn the words you hear every day, with their article.',
      'Un jeu de mémoire qui relie le son du français à son orthographe. La moitié des cartes parlent, l’autre moitié montrent un mot écrit : retrouvez les paires. Huit thèmes (la table, la ville, la maison, le corps, les vêtements, la nature, les transports, le travail) pour apprendre les mots que vous entendez tous les jours, avec leur article.',
    ),
    how: [
      b('Choose a theme, then turn over two cards.', 'Choisissez un thème, puis retournez deux cartes.'),
      b('A sound card and a word card that match stay face up.', 'Une carte son et une carte mot qui correspondent restent visibles.'),
      b('Find the eight pairs in as few moves as possible.', 'Retrouvez les huit paires en un minimum de coups.'),
    ],
    skills: [b('Sound and spelling', 'Son et orthographe'), b('Vocabulary with articles', 'Vocabulaire avec article'), b('Memory', 'Mémoire')],
    level: 'A1',
    duration: b('2 minutes per theme', '2 minutes par thème'),
  },
  {
    id: 'daily',
    slug: { en: 'word-of-the-day', fr: 'le-mot-du-jour' },
    title: b('Word of the Day', 'Le mot du jour'),
    tag: b('A new word every day', 'Un nouveau mot chaque jour'),
    tagline: b('Six tries to find today’s five-letter French word. Come back tomorrow for the next one.', 'Six essais pour trouver le mot français de cinq lettres du jour. Revenez demain pour le suivant.'),
    description: b(
      'A daily word puzzle in French. Guess the five-letter word of the day in six tries: after each guess, the colours tell you which letters are in the right place. When you finish, you discover its meaning, hear it in a sentence and keep your streak going. One word a day is the easiest French habit to keep.',
      'Un jeu de lettres quotidien en français. Trouvez le mot de cinq lettres du jour en six essais : après chaque proposition, les couleurs vous indiquent les lettres bien placées. À la fin, vous découvrez son sens, vous l’entendez dans une phrase et vous prolongez votre série. Un mot par jour : l’habitude de français la plus facile à garder.',
    ),
    how: [
      b('Type a five-letter French word and press Enter (accents are not needed).', 'Tapez un mot français de cinq lettres et validez (les accents ne comptent pas).'),
      b('Blue: right letter, right place. Gold: right letter, wrong place. Grey: not in the word.', 'Bleu : bonne lettre, bonne place. Or : bonne lettre, mauvaise place. Gris : absente du mot.'),
      b('Find the word in six tries, then come back tomorrow to keep your streak.', 'Trouvez le mot en six essais, puis revenez demain pour garder votre série.'),
    ],
    skills: [b('Spelling', 'Orthographe'), b('Vocabulary', 'Vocabulaire'), b('Daily habit', 'Habitude quotidienne')],
    level: 'A1 → B1',
    duration: b('3 minutes a day', '3 minutes par jour'),
  },
];

export const gamesPath = (lang: Lang) => `${LEARN_BASE[lang]}${GAMES_SLUG[lang]}/`;
export const gamePath = (g: GameMeta, lang: Lang) => `${gamesPath(lang)}${g.slug[lang]}/`;
export const gameById = (id: GameId) => GAMES.find(g => g.id === id)!;
