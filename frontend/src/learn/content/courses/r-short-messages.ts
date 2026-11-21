import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Texts from a friend, a note on the fridge, a postcard from holiday, a message from your child’s school: short personal messages are the first real texts you read in French. This course trains you to understand them quickly, including the abbreviations of text messages (bjr, stp, rdv), the greetings and closings, and to write a short answer of your own.',
    'Textos d’un ami, mot sur le frigo, carte postale de vacances, message de l’école : les messages personnels courts sont les premiers vrais textes que l’on lit en français. Ce cours vous entraîne à les comprendre rapidement, y compris les abréviations des textos (bjr, stp, rdv), les formules d’ouverture et de fin, et à rédiger vous-même une réponse courte.',
  ),
  outcomes: [
    b('Understand text messages and their abbreviations', 'Comprendre les textos et leurs abréviations'),
    b('Understand notes and short emails', 'Comprendre des mots et des courriels courts'),
    b('Read a postcard', 'Lire une carte postale'),
    b('Write a short reply', 'Rédiger une réponse courte'),
  ],
};

const SMS1: Doc = { look: 'sms', title: b('Text messages', 'Textos'), text: 'Bjr Léa ! Tu es dispo ce soir ? On va au resto avec Karim et Sofia.\n\nOui avec plaisir ! À quelle heure ?\n\nRdv à 19 h devant le resto, rue Ontario. Tu peux réserver stp ? Je suis au travail.\n\nOK, je m’en occupe. À +' };
const NOTE: Doc = { look: 'page', title: b('A note on the fridge', 'Un mot sur le frigo'), text: 'Lucas,\n\nJe rentre tard ce soir (réunion). Il y a des pâtes dans le frigo, tu peux les réchauffer. N’oublie pas de sortir le chien et de faire tes devoirs !\n\nBisous,\nMaman' };
const SCHOOL: Doc = { look: 'email', title: b('A message from school', 'Un message de l’école'), text: 'Objet : sortie au musée\n\nChers parents,\nVendredi 14 mars, la classe de 3e année visitera le musée des Sciences. Le départ est prévu à 9 h et le retour à 15 h. Merci de donner un lunch froid à votre enfant et de signer l’autorisation avant mercredi.\n\nMme Tremblay, enseignante' };
const POSTCARD: Doc = { look: 'letter', title: b('A postcard', 'Une carte postale'), text: 'Chère Amina,\n\nNous sommes à Tadoussac depuis trois jours. Il fait beau mais un peu frais. Hier, nous avons vu des baleines ! L’hôtel est petit mais très confortable, et on mange super bien. On rentre dimanche.\n\nGros bisous à toute la famille,\nJulie et Marc' };

const C = 'r-short-messages';
export default [
  lesson(C, 1, ['text-messages', 'les-textos'],
    b('Text messages and their abbreviations', 'Les textos et leurs abréviations'),
    b('Read text messages, their abbreviations and their friendly tone.', 'Lire des textos, leurs abréviations et leur ton familier.'),
    [b('Understand common abbreviations', 'Comprendre les abréviations courantes'), b('Find who, where and when', 'Trouver qui, où et quand'), b('Answer a text', 'Répondre à un texto')],
    13,
    [
      card(b('Texting French', 'Le français des textos'), b('Texts use abbreviations: **bjr** (bonjour), **slt** (salut), **stp / svp** (s’il te / vous plaît), **rdv** (rendez-vous), **dispo** (disponible), **resto** (restaurant), **à +** (à plus tard), **mdr** (mort de rire = lol).', 'Les textos emploient des abréviations : **bjr** (bonjour), **slt** (salut), **stp / svp**, **rdv** (rendez-vous), **dispo** (disponible), **resto**, **à +** (à plus tard), **mdr** (mort de rire).')),
      doc(SMS1, b('Where do they meet?', 'Où ont-ils rendez-vous ?'), [b('In front of the restaurant', 'Devant le restaurant'), b('At work', 'Au travail'), b('At Karim’s place', 'Chez Karim'), b('At the metro', 'Au métro')]),
      doc(SMS1, b('What will Léa do?', 'Que va faire Léa ?'), [b('Book the table', 'Réserver la table'), b('Cook dinner', 'Préparer le dîner'), b('Call Sofia', 'Appeler Sofia'), b('Work late', 'Travailler tard')]),
      pairs(b('Match each word with its abbreviation.', 'Associez chaque mot à son abréviation.'), [['rendez-vous', 'rdv'], ['s’il te plaît', 'stp'], ['disponible', 'dispo'], ['à plus tard', 'à +']]),
      mc(P.meaning, [b('Are you free tonight?', 'Est-ce que tu es libre ce soir ?'), b('Are you tired tonight?', 'Tu es fatigué ce soir ?'), b('Are you at the restaurant?', 'Tu es au restaurant ?'), b('Are you working tonight?', 'Tu travailles ce soir ?')], { fr: 'T’es dispo ce soir ?' }),
      gap(P.complete, 'Slt ! On se voit demain ? ___ à 18 h au café ? Réponds-moi ___ !', ['Rdv', 'stp'], { choices: [['Rdv', 'Bjr'], ['stp', 'mdr']] }),
      say('Oui, je suis dispo ! On se donne rendez-vous à quelle heure ?', 'Yes, I’m free! What time shall we meet?'),
    ],
    [
      b('bjr, slt, stp, svp, rdv, dispo, resto, à +, mdr.', 'bjr, slt, stp, svp, rdv, dispo, resto, à +, mdr.'),
      b('Find who, where and when first.', 'Repérez d’abord qui, où et quand.'),
      b('Texts are informal: tu, short sentences.', 'Les textos sont familiers : tu, phrases courtes.'),
    ],
    [['disponible', b('available, free', 'libre')], ['réserver', b('to book', 'retenir une place')], ['s’occuper de', b('to take care of', 'se charger de')]],
  ),
  lesson(C, 2, ['notes-and-school-messages', 'mots-et-messages-de-l-ecole'],
    b('Notes and messages from school', 'Les mots et les messages de l’école'),
    b('Understand a family note and a practical message from school.', 'Comprendre un mot familial et un message pratique de l’école.'),
    [b('Find instructions in a note', 'Trouver les consignes dans un mot'), b('Find dates and things to do', 'Trouver les dates et ce qu’il faut faire'), b('Recognise the greetings and closings', 'Reconnaître les formules d’ouverture et de fin')],
    13,
    [
      tip(b('Look for the action', 'Cherchez l’action'), b('In a practical message, look for the **verbs of action** (merci de…, n’oublie pas de…, il faut…) and the **dates**: they tell you what to do and when.', 'Dans un message pratique, repérez les **verbes d’action** (merci de…, n’oublie pas de…, il faut…) et les **dates** : ils disent quoi faire et quand.')),
      doc(NOTE, b('Why is Lucas’s mother coming home late?', 'Pourquoi la mère de Lucas rentre-t-elle tard ?'), [b('She has a meeting.', 'Elle a une réunion.'), b('She is at the doctor’s.', 'Elle est chez le médecin.'), b('She is shopping.', 'Elle fait les courses.'), b('She is walking the dog.', 'Elle promène le chien.')]),
      doc(NOTE, b('What must Lucas do?', 'Que doit faire Lucas ?'), [b('Walk the dog and do his homework', 'Sortir le chien et faire ses devoirs'), b('Cook pasta for his mother', 'Faire des pâtes pour sa mère'), b('Go to the meeting', 'Aller à la réunion'), b('Buy food', 'Acheter à manger')]),
      doc(SCHOOL, b('What must parents do before Wednesday?', 'Que doivent faire les parents avant mercredi ?'), [b('Sign the permission form', 'Signer l’autorisation'), b('Pay for the museum', 'Payer le musée'), b('Come with the class', 'Accompagner la classe'), b('Buy a lunch at school', 'Acheter un lunch à l’école')]),
      doc(SCHOOL, b('What time do the children come back?', 'À quelle heure les enfants reviennent-ils ?'), ['15 h', '9 h', '12 h', '14 h']),
      sort(b('Opening or closing?', 'Ouverture ou fin ?'), [b('opening', 'ouverture'), b('closing', 'fin')], [['Chers parents,', 0], ['Bisous,', 1], ['Bonjour à tous,', 0], ['Cordialement,', 1], ['Salut Léa !', 0], ['À bientôt !', 1]]),
      pairs(P.match, [['une sortie', b('a (school) outing', 'visite à l’extérieur')], ['une autorisation', b('a permission form', 'accord écrit')], ['un lunch', b('a packed lunch (Québec)', 'repas froid apporté')], ['les devoirs', b('homework', 'travail à faire à la maison')]]),
      dict('Merci de signer l’autorisation avant mercredi.', { voice: 'f' }),
    ],
    [
      b('Look for action verbs: merci de…, n’oublie pas de…', 'Repérez les verbes d’action : merci de…, n’oublie pas de…'),
      b('Openings: Chers parents, Bonjour, Salut. Closings: Cordialement, Bisous, À bientôt.', 'Ouvertures : Chers parents, Bonjour, Salut. Fins : Cordialement, Bisous, À bientôt.'),
      b('In Québec, a lunch = a meal you bring.', 'Au Québec, un lunch = un repas apporté.'),
    ],
    [['réchauffer', b('to heat up', 'rendre chaud')], ['rentrer tard', b('to come home late', 'revenir tard')], ['une enseignante', b('a teacher', 'professeure')]],
  ),
  lesson(C, 3, ['postcards-and-replies', 'cartes-postales-et-reponses'],
    b('Postcards, and writing a reply', 'Cartes postales, et écrire une réponse'),
    b('Read a holiday postcard and write a short personal message.', 'Lire une carte postale de vacances et écrire un court message personnel.'),
    [b('Understand a postcard', 'Comprendre une carte postale'), b('Find the past events and the feelings', 'Repérer les événements passés et les impressions'), b('Write a short postcard', 'Écrire une courte carte postale')],
    13,
    [
      doc(POSTCARD, b('What did Julie and Marc see?', 'Qu’ont vu Julie et Marc ?'), [b('Whales', 'Des baleines'), b('Bears', 'Des ours'), b('A museum', 'Un musée'), b('A storm', 'Une tempête')]),
      doc(POSTCARD, b('How is the weather?', 'Quel temps fait-il ?'), [b('Sunny but a bit cool', 'Beau mais un peu frais'), b('Very hot', 'Très chaud'), b('Rainy', 'Pluvieux'), b('Snowy', 'Neigeux')]),
      doc(POSTCARD, b('What do they think of the hotel?', 'Que pensent-ils de l’hôtel ?'), [b('Small but very comfortable', 'Petit mais très confortable'), b('Big and noisy', 'Grand et bruyant'), b('Expensive and dirty', 'Cher et sale'), b('Far from the sea', 'Loin de la mer')]),
      card(b('Postcard phrases', 'Les formules de la carte postale'), b('**Nous sommes à… depuis… / Il fait beau / Hier, nous avons visité… / On mange bien / On rentre le… / Grosses bises / Je t’embrasse.**', '**Nous sommes à… depuis… / Il fait beau / Hier, nous avons visité… / On mange bien / On rentre le… / Grosses bises / Je t’embrasse.**')),
      gap(P.completeText, 'Chère maman, nous sommes à Québec ___ lundi. Il ___ froid, mais c’est magnifique ! Hier, nous ___ visité le Château Frontenac. Je t’___, Paul', ['depuis', 'fait', 'avons', 'embrasse']),
      write(b('Write a postcard.', 'Écrivez une carte postale.'), b('You are on holiday. Write a postcard to a friend: where you are, the weather, one thing you did yesterday, when you come back.', 'Vous êtes en vacances. Écrivez une carte postale à un ami : où vous êtes, le temps qu’il fait, une chose faite hier, la date de retour.'), 30, 60,
        [b('An opening (Cher / Chère…)', 'Une ouverture (Cher / Chère…)'), b('Where you are and the weather', 'Le lieu et la météo'), b('One past event (hier, nous avons…)', 'Un événement passé (hier, nous avons…)'), b('A closing (Bises, À bientôt)', 'Une formule de fin (Bises, À bientôt)')],
        'Cher Thomas,\nJe suis à Gaspé depuis samedi. Il fait beau et chaud. Hier, j’ai fait une belle randonnée au parc Forillon et j’ai vu des phoques ! Je rentre jeudi.\nÀ bientôt,\nSara',
        { phrases: ['Je suis à… depuis…', 'Il fait beau / froid', 'Hier, j’ai…', 'Je rentre le…', 'Bises', 'À bientôt'] }),
      say('Nous sommes à Tadoussac depuis trois jours et nous avons vu des baleines !', 'We’ve been in Tadoussac for three days and we’ve seen whales!'),
    ],
    [
      b('Postcard: place + since when, weather, what you did, when you return.', 'Carte postale : lieu + depuis quand, météo, ce qu’on a fait, retour.'),
      b('Closings: Grosses bises, Je t’embrasse, À bientôt.', 'Fins : Grosses bises, Je t’embrasse, À bientôt.'),
      b('Past events in the passé composé: nous avons vu.', 'Événements au passé composé : nous avons vu.'),
    ],
    [['une baleine', b('a whale', 'grand mammifère marin')], ['frais', b('cool, chilly', 'un peu froid')], ['une randonnée', b('a hike', 'longue promenade à pied')]],
  ),
];
