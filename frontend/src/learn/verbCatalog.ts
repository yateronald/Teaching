import { b, type CourseMeta, type Level } from './types';

type VerbRow = readonly [id: string, infinitive: string, meaning: string, level: Level, useEn: string, useFr: string, image: string];

export const VERB_ROWS = [
  ["etre", "être", "to be", "A1", "Identity, states and descriptions", "Identité, états et descriptions", "course-cj-present"],
  ["avoir", "avoir", "to have", "A1", "Possession, age and everyday feelings", "Possession, âge et sensations", "course-cj-passe-compose"],
  ["aller", "aller", "to go", "A1", "Destinations and plans", "Destinations et projets", "course-cj-futur-proche"],
  ["faire", "faire", "to do or make", "A1", "Activities, weather and everyday tasks", "Activités, météo et tâches du quotidien", "course-cj-present"],
  ["parler", "parler", "to speak", "A1", "Languages, people and conversations", "Langues, interlocuteurs et conversations", "course-cj-imperatif"],
  ["aimer", "aimer", "to like or love", "A1", "Preferences, people and activities", "Goûts, personnes et activités", "course-cj-conditionnel"],
  ["finir", "finir", "to finish", "A2", "Tasks, deadlines and finir par", "Tâches, délais et finir par", "course-cj-futur-anterieur"],
  ["prendre", "prendre", "to take", "A2", "Transport, appointments and decisions", "Transports, rendez-vous et décisions", "course-cj-passe-compose"],
  ["venir", "venir", "to come", "A2", "Origins, arrivals and the recent past", "Origines, arrivées et passé récent", "course-cj-passe-recent"],
  ["partir", "partir", "to leave", "A2", "Departures and plans on the move", "Départs et projets de voyage", "course-cj-futur-simple"],
  ["pouvoir", "pouvoir", "can or to be able to", "A2", "Permission, ability and polite requests", "Permission, capacité et demandes polies", "course-cj-conditionnel"],
  ["vouloir", "vouloir", "to want", "A2", "Requests, wishes and intentions", "Demandes, souhaits et intentions", "course-cj-subjonctif"],
  ["devoir", "devoir", "to have to or owe", "B1", "Obligations, advice and deductions", "Obligations, conseils et déductions", "course-cj-conditionnel-passe"],
  ["savoir", "savoir", "to know or know how", "B1", "Facts, learned skills and indirect questions", "Faits, savoir-faire et questions indirectes", "course-cj-bilan"],
  ["dire", "dire", "to say or tell", "B1", "Reporting speech and passing on information", "Discours rapporté et transmission d’informations", "course-cj-pc-imparfait"],
  ["voir", "voir", "to see", "B1", "Observation, meetings and understanding", "Observation, rendez-vous et compréhension", "course-cj-futur-simple"],
  ["lire", "lire", "to read", "B1", "Reading habits, instructions and completed actions", "Habitudes de lecture, consignes et actions accomplies", "course-cj-plus-que-parfait"],
  ["ecrire", "écrire", "to write", "B2", "Messages, formal writing and agreement", "Messages, écrit formel et accords", "course-cj-subjonctif-passe"],
  ["mettre", "mettre", "to put or take (time)", "B2", "Placement, duration and expressions with mettre", "Placement, durée et expressions avec mettre", "course-cj-bilan"],
  ["tenir", "tenir", "to hold or keep", "B2", "Commitments and the meanings of tenir", "Engagements et sens de tenir", "course-cj-passe-simple"],
] as const satisfies readonly VerbRow[];

export type VerbId = (typeof VERB_ROWS)[number][0];

export const VERB_LESSON_MINUTES = [12, 16, 15, 18, 14, 16] as const;
const GUIDED_LENGTH: Partial<Record<Level, number>> = { A1: 1, A2: 2, B1: 3, B2: 5 };
const totalMinutes = (count: number) => VERB_LESSON_MINUTES.slice(0, count).reduce((total, minutes) => total + minutes, 0);

const groupCourse: CourseMeta = {
  id: 'verb-groups',
  category: 'verbs',
  slug: { en: 'verb-groups', fr: 'les-trois-groupes' },
  title: b('The Three French Verb Groups', 'Les trois groupes de verbes'),
  subtitle: b('Identify -er verbs, the finir family and the other irregular patterns.', 'Repérez les verbes en -er, la famille de finir et les modèles irréguliers.'),
  description: b('Find the infinitive and its group, test -ir verbs with nous, and recognise the roles of être and avoir.', 'Repérez l’infinitif et son groupe, testez les verbes en -ir avec nous et reconnaissez le rôle de être et avoir.'),
  outcomes: [b('Recognise the three groups', 'Reconnaître les trois groupes'), b('Distinguish finir from partir', 'Distinguer finir de partir'), b('Identify an auxiliary in a compound tense', 'Repérer un auxiliaire dans un temps composé')],
  level: 'A1',
  levels: ['A1'],
  image: 'cat-conjugation',
  lessonCount: 3,
  minutes: 30,
};

export const VERB_COURSES: CourseMeta[] = [
  groupCourse,
  ...VERB_ROWS.map(([id, infinitive, meaning, level, useEn, useFr, image]): CourseMeta => {
    const count = GUIDED_LENGTH[level] ?? VERB_LESSON_MINUTES.length;
    return {
      id: `verb-${id}`,
      category: 'verbs',
      slug: { en: id, fr: id },
      title: b(`${infinitive} · ${meaning}`, `Le verbe ${infinitive}`),
      subtitle: b(useEn, useFr),
      description: b(
        `Practise ${infinitive} in six lessons, from the present and everyday uses to compound and literary tenses. Focus on ${useEn.charAt(0).toLowerCase() + useEn.slice(1)}.`,
        `Entraînez-vous à employer ${infinitive} en six leçons, du présent aux temps composés et littéraires. ${useFr}.`,
      ),
      outcomes: [
        b(`Use ${infinitive} in everyday sentences`, `Employer ${infinitive} dans des phrases du quotidien`),
        b('Conjugate simple and compound forms', 'Conjuguer aux temps simples et composés'),
        b('Recognise literary forms in context', 'Reconnaître les formes littéraires en contexte'),
      ],
      level,
      levels: [level],
      image,
      lessonCount: VERB_LESSON_MINUTES.length,
      minutes: totalMinutes(VERB_LESSON_MINUTES.length),
      guidedLessons: { count, minutes: totalMinutes(count) },
    };
  }),
];

