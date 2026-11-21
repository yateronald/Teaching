import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, P, pairs, say, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Bonjour, moi c’est Karim, je viens d’Algérie et je suis infirmier. When people introduce themselves, they go fast and mix name, origin, job, family and hobbies. This course trains your ear on real-style introductions, at work, at a party, at school, so you can catch and remember the key facts and answer naturally.',
    'Bonjour, moi c’est Karim, je viens d’Algérie et je suis infirmier. Quand les gens se présentent, ils vont vite et mêlent nom, origine, métier, famille et loisirs. Ce cours entraîne votre oreille à des présentations naturelles, au travail, à une fête, à l’école, pour saisir et retenir l’essentiel et répondre naturellement.',
  ),
  outcomes: [
    b('Catch names and origins', 'Saisir noms et origines'),
    b('Catch jobs and family situations', 'Saisir métiers et situations familiales'),
    b('Catch hobbies and preferences', 'Saisir loisirs et préférences'),
    b('Answer an introduction', 'Répondre à une présentation'),
  ],
};

const C = 'l-introductions';
export default [
  lesson(C, 1, ['names-and-origins', 'noms-et-origines'],
    b('Names and origins', 'Noms et origines'),
    b('Catch first names, spelled names and countries of origin.', 'Saisir les prénoms, les noms épelés et les pays d’origine.'),
    [b('Hear « moi, c’est… »', 'Entendre « moi, c’est… »'), b('Hear a spelled name', 'Entendre un nom épelé'), b('Hear countries and cities', 'Entendre pays et villes')],
    13,
    [
      card(b('How people say their name', 'Comment on dit son nom'), b('**Je m’appelle…**, **Moi, c’est…** (informal), **Mon nom, c’est…**. To spell: **Ça s’écrit…**. Origin: **Je viens de…**, **Je suis originaire de…**.', '**Je m’appelle…**, **Moi, c’est…** (familier), **Mon nom, c’est…**. Pour épeler : **Ça s’écrit…**. Origine : **Je viens de…**, **Je suis originaire de…**.')),
      hear('Bonjour, moi c’est Amina, je viens du Sénégal, de Dakar.', b('Where is Amina from?', 'D’où vient Amina ?'), [b('Dakar, Senegal', 'Dakar, au Sénégal'), b('Algiers, Algeria', 'Alger, en Algérie'), b('Paris, France', 'Paris, en France'), b('Montréal', 'Montréal')]),
      hear('Je m’appelle Thibault. Ça s’écrit T, H, I, B, A, U, L, T.', b('How is his name spelled?', 'Comment s’écrit son prénom ?'), ['Thibault', 'Tibault', 'Thibaut', 'Thibeault']),
      hear('Bonsoir, je suis Marco, je suis italien, mais j’habite à Laval depuis cinq ans.', b('What is true about Marco?', 'Qu’est-ce qui est vrai pour Marco ?'), [b('He is Italian and has lived in Laval for 5 years.', 'Il est italien et habite à Laval depuis 5 ans.'), b('He is from Laval.', 'Il vient de Laval.'), b('He arrived 5 days ago.', 'Il est arrivé il y a 5 jours.'), b('He lives in Italy.', 'Il habite en Italie.')]),
      tip(b('Note immediately', 'Notez tout de suite'), b('Names disappear fast. Write the **first letters** while you listen, then complete. If needed, ask: **Pardon, vous pouvez épeler ?**', 'Les noms s’effacent vite. Notez les **premières lettres** pendant l’écoute, puis complétez. Au besoin, demandez : **Pardon, vous pouvez épeler ?**')),
      pairs(P.match, [['Moi, c’est…', b('I’m… (informal)', 'je m’appelle (familier)')], ['Ça s’écrit…', b('It’s spelled…', 'l’orthographe est…')], ['Je suis originaire de…', b('I’m from…', 'je viens de…')], ['Vous pouvez épeler ?', b('Can you spell it?', 'dites les lettres')]]),
      say('Bonjour, moi c’est Sofia, je viens du Mexique et j’habite à Québec.', 'Hello, I’m Sofia, I’m from Mexico and I live in Québec City.'),
    ],
    [
      b('Je m’appelle… / Moi, c’est… / Ça s’écrit…', 'Je m’appelle… / Moi, c’est… / Ça s’écrit…'),
      b('Je viens de… / Je suis originaire de…', 'Je viens de… / Je suis originaire de…'),
      b('Ask: Vous pouvez épeler ?', 'Demander : Vous pouvez épeler ?'),
    ],
    [['épeler', b('to spell', 'dire les lettres')], ['habiter', b('to live', 'résider')], ['originaire', b('native, originally from', 'qui vient de')]],
  ),
  lesson(C, 2, ['jobs-and-families', 'metiers-et-familles'],
    b('Jobs and families', 'Métiers et familles'),
    b('Catch professions, workplaces and family situations.', 'Saisir professions, lieux de travail et situations familiales.'),
    [b('Hear jobs and workplaces', 'Entendre métiers et lieux de travail'), b('Hear family situations', 'Entendre les situations familiales'), b('Distinguish similar jobs', 'Distinguer des métiers proches')],
    13,
    [
      card(b('Jobs and family', 'Métier et famille'), b('**Je suis + job** (no article): je suis infirmier. **Je travaille dans / chez / à…**: dans un hôpital, chez Bombardier, à la Ville. Family: **Je suis marié(e), célibataire, en couple, divorcé(e), J’ai deux enfants.**', '**Je suis + métier** (sans article) : je suis infirmier. **Je travaille dans / chez / à…** : dans un hôpital, chez Bombardier, à la Ville. Famille : **Je suis marié(e), célibataire, en couple, divorcé(e), J’ai deux enfants.**')),
      hear('Je suis infirmière à l’hôpital Sainte-Justine, je travaille surtout de nuit.', b('What is her job?', 'Quel est son métier ?'), [b('A nurse, mostly at night', 'Infirmière, surtout de nuit'), b('A doctor, during the day', 'Médecin, le jour'), b('A teacher', 'Enseignante'), b('A cleaner at night', 'Agente d’entretien de nuit')]),
      hear('Moi, je suis comptable, je travaille dans une petite entreprise à Longueuil.', b('Where does he work?', 'Où travaille-t-il ?'), [b('In a small company in Longueuil', 'Dans une petite entreprise à Longueuil'), b('In a bank in Montréal', 'Dans une banque à Montréal'), b('At home', 'À la maison'), b('In a school', 'Dans une école')]),
      hear('Je suis mariée, j’ai deux garçons de huit et douze ans.', b('What is her family situation?', 'Quelle est sa situation familiale ?'), [b('Married, two boys aged 8 and 12', 'Mariée, deux garçons de 8 et 12 ans'), b('Single, no children', 'Célibataire, sans enfant'), b('Married, two girls', 'Mariée, deux filles'), b('Divorced, one son', 'Divorcée, un fils')]),
      hear('Je suis en couple, pas d’enfants pour l’instant, mais on a un chat !', b('What does he have?', 'Qu’a-t-il ?'), [b('A partner and a cat', 'Un conjoint et un chat'), b('Two children', 'Deux enfants'), b('A dog', 'Un chien'), b('Nobody', 'Personne')]),
      pairs(P.match, [['célibataire', b('single', 'pas en couple')], ['comptable', b('accountant', 'métier des chiffres')], ['de nuit', b('at night (shift)', 'horaire nocturne')], ['pour l’instant', b('for now', 'en ce moment')]]),
      dict('Je suis professeur de mathématiques et j’ai trois enfants.', { voice: 'm' }),
    ],
    [
      b('Je suis + job without article: je suis comptable.', 'Je suis + métier sans article : je suis comptable.'),
      b('Je travaille dans / chez / à…', 'Je travaille dans / chez / à…'),
      b('marié(e), célibataire, en couple, divorcé(e).', 'marié(e), célibataire, en couple, divorcé(e).'),
    ],
    [['une entreprise', b('a company', 'société')], ['un conjoint', b('a partner, spouse', 'compagnon')], ['travailler de nuit', b('to work nights', 'avoir un horaire de nuit')]],
  ),
  lesson(C, 3, ['hobbies-and-answering', 'loisirs-et-reponses'],
    b('Hobbies, and answering an introduction', 'Loisirs, et répondre à une présentation'),
    b('Catch hobbies and preferences, and respond with your own introduction.', 'Saisir loisirs et préférences, et répondre par sa propre présentation.'),
    [b('Hear likes and dislikes', 'Entendre les goûts'), b('Follow a full introduction', 'Suivre une présentation complète'), b('Answer naturally', 'Répondre naturellement')],
    13,
    [
      hear('Le week-end, j’adore faire de la randonnée, mais je déteste le ski.', b('What does she love?', 'Qu’adore-t-elle ?'), [b('Hiking', 'La randonnée'), b('Skiing', 'Le ski'), b('Swimming', 'La natation'), b('Cooking', 'La cuisine')]),
      hear('Je joue de la guitare dans un petit groupe, on fait des concerts dans les bars.', b('What is his hobby?', 'Quel est son loisir ?'), [b('Playing guitar in a band', 'Jouer de la guitare dans un groupe'), b('Going to bars', 'Aller dans les bars'), b('Singing alone', 'Chanter seul'), b('Selling guitars', 'Vendre des guitares')]),
      tip(b('Answer and ask back', 'Répondez et renvoyez la question'), b('After an introduction, answer briefly and **ask back**: **Enchanté(e) ! Moi, c’est… Et vous, vous faites quoi dans la vie ?**', 'Après une présentation, répondez brièvement et **renvoyez la question** : **Enchanté(e) ! Moi, c’est… Et vous, vous faites quoi dans la vie ?**')),
      dlg(b('At a welcome party', 'À une fête d’accueil'), undefined, [['Karim', 'm'], ['Vous', 'f']], [
        [0, 'Salut ! Moi, c’est Karim. Je viens d’Algérie, je suis infirmier et je fais beaucoup de vélo.', 'Hi! I’m Karim. I’m from Algeria, I’m a nurse and I cycle a lot.'],
        [1, { options: ['Enchantée, Karim ! Moi, c’est Léa. Je suis enseignante. Et le vélo, tu en fais où ?', 'Enchantée. Je suis Algérie.', 'Moi, c’est vélo. Et toi ?'] }],
        [0, 'Surtout sur la piste du canal de Lachine. Et toi, tu as des loisirs ?', 'Mostly on the Lachine Canal path. And you, do you have hobbies?'],
        [1, { options: ['J’adore la danse et la cuisine. On pourrait faire du vélo ensemble un jour !', 'Oui, j’ai des loisirs du canal.', 'Je suis loisirs.'] }],
      ]),
      hear('Bonjour à tous, je m’appelle Paul, je suis ingénieur, je suis père de deux filles et j’adore la photographie.', b('Which information is NOT in his introduction?', 'Quelle information n’est PAS dans sa présentation ?'), [b('His country of origin', 'Son pays d’origine'), b('His job', 'Son métier'), b('His family', 'Sa famille'), b('His hobby', 'Son loisir')]),
      pairs(P.match, [['Enchanté(e) !', b('Nice to meet you!', 'formule de rencontre')], ['Tu fais quoi dans la vie ?', b('What do you do (for a living)?', 'question sur le métier')], ['jouer de la guitare', b('to play the guitar', 'faire de la musique')], ['faire de la randonnée', b('to go hiking', 'marcher en nature')]]),
      say('Enchanté ! Moi, c’est David. Je suis informaticien et j’adore le hockey. Et toi ?', 'Nice to meet you! I’m David. I work in IT and I love hockey. And you?'),
    ],
    [
      b('Likes: j’adore, j’aime bien, je déteste + noun or infinitive.', 'Goûts : j’adore, j’aime bien, je déteste + nom ou infinitif.'),
      b('jouer de + instrument; faire de + sport / activity.', 'jouer de + instrument ; faire de + sport / activité.'),
      b('Answer and ask back: Enchanté(e) ! Et toi / vous ?', 'Répondre et renvoyer : Enchanté(e) ! Et toi / vous ?'),
    ],
    [['un loisir', b('a hobby', 'activité de temps libre')], ['un groupe', b('a band; a group', 'formation musicale')], ['la photographie', b('photography', 'art de la photo')]],
  ),
];
