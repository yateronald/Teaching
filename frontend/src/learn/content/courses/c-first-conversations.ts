import type { CourseAbout } from '../../types';
import { b, card, dlg, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Bonjour, ça va ? Vous habitez ici ? Et vous ? Your first conversations in French follow simple patterns: greet, ask a question, answer, ask back, say goodbye. This course trains you to hold a short, natural exchange in the most common situations (neighbours, colleagues, a party), with the polite reflexes that make French speakers feel at ease.',
    'Bonjour, ça va ? Vous habitez ici ? Et vous ? Vos premières conversations en français suivent des schémas simples : saluer, poser une question, répondre, renvoyer la question, prendre congé. Ce cours vous entraîne à tenir un échange court et naturel dans les situations les plus courantes (voisins, collègues, une fête), avec les réflexes de politesse qui mettent les francophones à l’aise.',
  ),
  outcomes: [
    b('Greet and say goodbye appropriately', 'Saluer et prendre congé de façon appropriée'),
    b('Ask and answer simple personal questions', 'Poser et répondre à des questions personnelles simples'),
    b('Keep an exchange going with Et vous ?', 'Faire durer l’échange avec Et vous ?'),
    b('End a conversation politely', 'Terminer une conversation poliment'),
  ],
};

const C = 'c-first-conversations';
export default [
  lesson(C, 1, ['hello-and-goodbye', 'bonjour-et-au-revoir'],
    b('Hello, how are you, goodbye', 'Bonjour, ça va, au revoir'),
    b('Greet according to the moment and the person, and take your leave.', 'Saluer selon le moment et la personne, et prendre congé.'),
    [b('Choose bonjour, bonsoir, salut', 'Choisir bonjour, bonsoir, salut'), b('Answer « Ça va ? »', 'Répondre à « Ça va ? »'), b('Say goodbye in several ways', 'Dire au revoir de plusieurs façons')],
    13,
    [
      card(b('Greetings', 'Les salutations'), b('**Bonjour** (day), **Bonsoir** (evening), **Salut** (friends). Answer **Ça va ?** with **Ça va bien, merci, et toi / et vous ?** Goodbye: **Au revoir, Bonne journée, Bonne soirée, À bientôt, À demain, Salut !**', '**Bonjour** (journée), **Bonsoir** (soir), **Salut** (amis). Répondez à **Ça va ?** par **Ça va bien, merci, et toi / et vous ?** Au revoir : **Au revoir, Bonne journée, Bonne soirée, À bientôt, À demain, Salut !**'), {
        ex: [['Bonjour madame, comment allez-vous ?', 'Hello madam, how are you?'], ['Salut ! Ça va ?', 'Hi! How’s it going?'], ['Bonne soirée, à demain !', 'Have a good evening, see you tomorrow!']],
      }),
      sort(b('Formal or informal?', 'Formel ou familier ?'), [b('formal (vous)', 'formel (vous)'), b('informal (tu)', 'familier (tu)')], [['Comment allez-vous ?', 0], ['Ça va ?', 1], ['Bonjour madame.', 0], ['Salut !', 1], ['Bonne journée, monsieur.', 0], ['À plus !', 1]]),
      mc(P.best, ['Bonsoir !', 'Bonjour !', 'Bonne nuit !', 'Salut, bonne matinée !'], { fr: 'Il est 20 h, vous entrez au restaurant :' }),
      dlg(b('Meeting a neighbour', 'Croiser un voisin'), undefined, [['Voisin', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour ! Ça va ?', 'Hello! How are you?'],
        [1, { options: ['Très bien, merci, et vous ?', 'Très bien. Au revoir.', 'Bonsoir, ça va pas.'] }],
        [0, 'Ça va, ça va. Bonne journée !', 'Fine, fine. Have a good day!'],
        [1, { options: ['Merci, vous aussi !', 'Merci, bonne nuit !', 'Salut, à hier !'] }],
      ]),
      pairs(P.match, [['Bonne journée !', b('Have a good day!', 'souhait pour la journée')], ['À bientôt !', b('See you soon!', 'à une prochaine fois')], ['Vous aussi !', b('You too!', 'même souhait en retour')], ['Comment allez-vous ?', b('How are you? (formal)', 'question polie')]]),
      say('Bonjour madame, comment allez-vous ? Très bien, merci, et vous ?', 'Hello madam, how are you? Very well, thank you, and you?'),
    ],
    [
      b('Bonjour (day), Bonsoir (evening), Salut (friends).', 'Bonjour (journée), Bonsoir (soir), Salut (amis).'),
      b('Ça va bien, merci, et vous / et toi ?', 'Ça va bien, merci, et vous / et toi ?'),
      b('Bonne journée ! → Merci, vous aussi !', 'Bonne journée ! → Merci, vous aussi !'),
    ],
    [['saluer', b('to greet', 'dire bonjour')], ['prendre congé', b('to take one’s leave', 'partir poliment')], ['un voisin', b('a neighbour', 'personne qui habite à côté')]],
  ),
  lesson(C, 2, ['asking-and-answering', 'poser-et-repondre'],
    b('Asking and answering simple questions', 'Poser et répondre à des questions simples'),
    b('Ask about name, origin, home and work, and answer in full sentences.', 'Demander le nom, l’origine, le lieu de vie et le travail, et répondre en phrases complètes.'),
    [b('Ask four personal questions', 'Poser quatre questions personnelles'), b('Answer with a full sentence', 'Répondre par une phrase complète'), b('Ask back with Et vous ?', 'Renvoyer avec Et vous ?')],
    13,
    [
      card(b('Four key questions', 'Quatre questions clés'), b('**Comment vous appelez-vous ?** **Vous venez d’où ?** **Vous habitez où ?** **Qu’est-ce que vous faites dans la vie ?** Answer, then ask back: **Et vous ?** This simple loop keeps the conversation alive.', '**Comment vous appelez-vous ?** **Vous venez d’où ?** **Vous habitez où ?** **Qu’est-ce que vous faites dans la vie ?** Répondez, puis renvoyez : **Et vous ?** Cette boucle simple fait vivre la conversation.')),
      mc(P.best, ['Je viens du Vietnam. Et vous ?', 'Je viens. Et vous ?', 'Du Vietnam je viens vous ?', 'Vietnam.'], { fr: '— Vous venez d’où ?' }),
      mc(P.best, ['Je suis comptable, dans une banque.', 'Je fais la vie.', 'Je suis dans la vie.', 'Comptable banque fais.'], { fr: '— Qu’est-ce que vous faites dans la vie ?' }),
      ord(P.order, 'Qu’est-ce que vous faites dans la vie ?', { tr: 'What do you do for a living?' }),
      dlg(b('At a party', 'À une fête'), b('You meet someone at a friend’s party.', 'Vous rencontrez quelqu’un à la fête d’un ami.'), [['Lucas', 'm'], ['Vous', 'f']], [
        [0, 'Salut ! Moi, c’est Lucas. Et toi ?', 'Hi! I’m Lucas. And you?'],
        [1, { options: ['Moi, c’est Mei. Enchantée !', 'Moi, c’est. Enchantée.', 'Je suis enchantée Mei toi.'] }],
        [0, 'Enchanté ! Tu connais Julie d’où ?', 'Nice to meet you! How do you know Julie?'],
        [1, { options: ['On travaille ensemble. Et toi ?', 'On travaille. Au revoir.', 'Julie est d’où ?'] }],
        [0, 'Moi, c’est mon ancienne voisine.', 'She’s my former neighbour.'],
      ]),
      pairs(P.match, [['Vous venez d’où ?', b('Where are you from?', 'question sur l’origine')], ['Vous habitez où ?', b('Where do you live?', 'question sur le domicile')], ['Enchanté(e) !', b('Nice to meet you!', 'formule de rencontre')], ['Et toi ?', b('And you?', 'renvoyer la question')]]),
      say('Je m’appelle Omar, je viens du Maroc et j’habite à Montréal. Et vous ?', 'My name is Omar, I’m from Morocco and I live in Montréal. And you?'),
    ],
    [
      b('Comment vous appelez-vous ? Vous venez d’où ? Vous habitez où ?', 'Comment vous appelez-vous ? Vous venez d’où ? Vous habitez où ?'),
      b('Qu’est-ce que vous faites dans la vie ? = What do you do?', 'Qu’est-ce que vous faites dans la vie ? = Quel est votre métier ?'),
      b('Always ask back: Et vous ? / Et toi ?', 'Renvoyez toujours : Et vous ? / Et toi ?'),
    ],
    [['ancien', b('former (before a noun)', 'd’avant')], ['ensemble', b('together', 'l’un avec l’autre')], ['connaître', b('to know (someone)', 'avoir rencontré')]],
  ),
  lesson(C, 3, ['keeping-it-going', 'faire-durer-l-echange'],
    b('Keeping it going and ending politely', 'Faire durer l’échange et conclure poliment'),
    b('Show interest, react and close a conversation without being abrupt.', 'Montrer de l’intérêt, réagir et conclure sans brusquerie.'),
    [b('React with interest', 'Réagir avec intérêt'), b('Ask a follow-up question', 'Poser une question de relance'), b('End a conversation politely', 'Terminer poliment une conversation')],
    13,
    [
      card(b('Reactions and follow-ups', 'Réactions et relances'), b('React: **Ah bon ? C’est vrai ? Super ! C’est intéressant !** Follow up: **Depuis quand ? Ça vous plaît ? C’est comment ?** End: **Bon, je dois y aller. Ça m’a fait plaisir de vous parler. À la prochaine !**', 'Réagir : **Ah bon ? C’est vrai ? Super ! C’est intéressant !** Relancer : **Depuis quand ? Ça vous plaît ? C’est comment ?** Conclure : **Bon, je dois y aller. Ça m’a fait plaisir de vous parler. À la prochaine !**')),
      tip(b('Never just leave', 'Ne partez jamais sans un mot'), b('Ending abruptly can seem rude. Give a short reason and a nice word: **Bon, je dois y aller, j’ai un rendez-vous. Ça m’a fait plaisir !**', 'Partir brusquement peut sembler impoli. Donnez une courte raison et un mot gentil : **Bon, je dois y aller, j’ai un rendez-vous. Ça m’a fait plaisir !**')),
      mc(P.best, ['Ah bon ? Depuis quand ?', 'D’accord. Au revoir.', 'Et alors ?', 'Je m’en fiche.'], { fr: '— J’habite à Québec maintenant.' }),
      mc(P.best, ['Bon, je dois y aller. Ça m’a fait plaisir de vous parler !', 'Je pars.', 'Fini.', 'Bon, je m’ennuie.'], { fr: 'Vous voulez terminer poliment la conversation :' }),
      dlg(b('A new colleague', 'Une nouvelle collègue'), undefined, [['Sara', 'f'], ['Vous', 'm']], [
        [0, 'Je viens de commencer ici, à la comptabilité.', 'I’ve just started here, in accounting.'],
        [1, { options: ['Ah, super ! Et ça vous plaît pour l’instant ?', 'D’accord.', 'Moi aussi. Au revoir.'] }],
        [0, 'Oui, beaucoup ! L’équipe est très sympa.', 'Yes, a lot! The team is very nice.'],
        [1, { options: ['Tant mieux ! Bon, je dois y aller, j’ai une réunion. À plus tard !', 'Ah. Bon. Salut.', 'Moi, je n’aime pas l’équipe.'] }],
      ]),
      pairs(P.match, [['Ah bon ?', b('Really?', 'surprise, intérêt')], ['Ça vous plaît ?', b('Do you like it?', 'question de relance')], ['Tant mieux !', b('Good! / So much the better!', 'réaction positive')], ['À la prochaine !', b('Until next time!', 'au revoir amical')]]),
      say('Ah bon ? C’est intéressant ! Et ça vous plaît ?', 'Really? That’s interesting! And do you like it?'),
    ],
    [
      b('React: Ah bon ? C’est vrai ? Super !', 'Réagir : Ah bon ? C’est vrai ? Super !'),
      b('Follow up: Depuis quand ? Ça vous plaît ? C’est comment ?', 'Relancer : Depuis quand ? Ça vous plaît ? C’est comment ?'),
      b('End: Bon, je dois y aller. Ça m’a fait plaisir !', 'Conclure : Bon, je dois y aller. Ça m’a fait plaisir !'),
    ],
    [['tant mieux', b('so much the better', 'c’est bien')], ['la comptabilité', b('accounting', 'gestion des comptes')], ['pour l’instant', b('so far, for now', 'jusqu’à maintenant')]],
  ),
];
