import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Three original short stories written for B1 readers: a lost wallet in the Montréal metro, a first winter in Québec City, and a strange letter found in a second-hand book. Each lesson trains a reading strategy (guessing words from context, following the chronology, understanding the characters’ feelings) and the past tenses of storytelling.',
    'Trois nouvelles originales écrites pour des lecteurs de niveau B1 : un portefeuille perdu dans le métro de Montréal, un premier hiver à Québec, et une étrange lettre trouvée dans un livre d’occasion. Chaque leçon travaille une stratégie de lecture (deviner les mots grâce au contexte, suivre la chronologie, comprendre les sentiments des personnages) et les temps du récit au passé.',
  ),
  outcomes: [
    b('Guess unknown words from context', 'Deviner les mots inconnus grâce au contexte'),
    b('Follow the chronology of a story', 'Suivre la chronologie d’un récit'),
    b('Understand characters’ feelings and motives', 'Comprendre les sentiments et les motivations des personnages'),
    b('Retell a story in a few sentences', 'Résumer une histoire en quelques phrases'),
  ],
};

const S1: Doc = { look: 'page', title: b('Story 1: The wallet', 'Nouvelle 1 : Le portefeuille'), text: 'Ce matin-là, Samir était en retard. Il a sauté dans le métro à la station Berri-UQAM et s’est assis près de la porte. C’est là qu’il l’a vu : un portefeuille en cuir brun, abandonné sur le siège d’en face.\n\nIl l’a ouvert avec hésitation. À l’intérieur, il y avait une carte d’identité, deux billets de vingt dollars et une vieille photo d’une petite fille qui riait. « Antoine Girard », lisait-il sur la carte. L’adresse se trouvait dans Rosemont, à deux stations de son travail.\n\nSamir a hésité. Il allait déjà arriver en retard. Mais en regardant la photo, il a pensé à sa propre fille. Le soir même, il a sonné chez M. Girard, un vieil homme aux yeux fatigués qui, en voyant le portefeuille, a fondu en larmes. « Cette photo, c’est tout ce qu’il me reste de ma petite-fille », a-t-il murmuré.' };
const S2: Doc = { look: 'page', title: b('Story 2: First winter', 'Nouvelle 2 : Premier hiver'), text: 'Quand Luisa est arrivée de Bogotá en octobre, ses collègues l’ont prévenue : « Attends de voir janvier. » Elle avait souri poliment, persuadée qu’ils exagéraient.\n\nLe premier vrai froid est tombé un mardi. Moins vingt-huit, ressenti moins trente-cinq. En sortant de l’autobus, elle a senti ses cils geler. Elle portait un manteau trop léger, des bottes de ville et aucun bonnet. En dix minutes de marche, ses oreilles lui faisaient si mal qu’elle a dû entrer dans un dépanneur pour se réchauffer.\n\nLe caissier, un homme d’une soixantaine d’années, l’a regardée en souriant. « Première année ? » Elle a hoché la tête. Il lui a tendu un café et une adresse griffonnée sur un bout de papier : « Le meilleur magasin de manteaux de la ville. Dites que vous venez de la part de Gilles. »' };
const S3: Doc = { look: 'page', title: b('Story 3: The letter', 'Nouvelle 3 : La lettre'), text: 'Claire achetait souvent des livres d’occasion chez un bouquiniste du Vieux-Québec. Un samedi, en feuilletant un roman des années cinquante, elle a trouvé une enveloppe jaunie, jamais ouverte, adressée à une certaine Madeleine Pelletier.\n\nElle a d’abord pensé la jeter. Puis la curiosité l’a emporté. Pendant des semaines, elle a cherché dans les archives, les annuaires, les avis de décès. Elle avait presque abandonné quand une vieille dame du quartier Saint-Roch a répondu à son annonce : Madeleine était sa mère.\n\nLes deux femmes ont ouvert la lettre ensemble. Elle venait d’un jeune soldat parti en 1952, qui promettait de revenir l’épouser. Il n’était jamais revenu. « Maman a attendu toute sa vie une lettre qu’elle n’a jamais reçue », a dit la vieille dame en serrant la main de Claire.' };

const C = 'r-short-stories';
export default [
  lesson(C, 1, ['guessing-words-from-context', 'deviner-les-mots'],
    b('The wallet: guessing words from context', 'Le portefeuille : deviner les mots grâce au contexte'),
    b('Read a short story and guess unknown words from the context.', 'Lire une nouvelle et deviner les mots inconnus grâce au contexte.'),
    [b('Use the context to guess a word', 'Utiliser le contexte pour deviner un mot'), b('Understand the main events', 'Comprendre les événements principaux'), b('Understand the end of the story', 'Comprendre la fin de l’histoire')],
    13,
    [
      tip(b('Do not stop at every word', 'Ne vous arrêtez pas à chaque mot'), b('When you meet an unknown word, read the **whole sentence** and the next one: the situation often explains it. **Il a fondu en larmes** after an emotional moment = he burst into tears.', 'Devant un mot inconnu, lisez **toute la phrase** et la suivante : la situation l’explique souvent. **Il a fondu en larmes** après un moment d’émotion = il s’est mis à pleurer.')),
      doc(S1, b('Where does Samir find the wallet?', 'Où Samir trouve-t-il le portefeuille ?'), [b('On a seat in the metro', 'Sur un siège du métro'), b('In the street', 'Dans la rue'), b('At work', 'Au travail'), b('In front of a house', 'Devant une maison')]),
      doc(S1, b('Why does Samir decide to return it?', 'Pourquoi Samir décide-t-il de le rapporter ?'), [b('The photo makes him think of his own daughter.', 'La photo lui fait penser à sa propre fille.'), b('He wants a reward.', 'Il veut une récompense.'), b('He knows Antoine Girard.', 'Il connaît Antoine Girard.'), b('The police ask him to.', 'La police le lui demande.')]),
      doc(S1, b('Why is the photo so important for M. Girard?', 'Pourquoi la photo est-elle si importante pour M. Girard ?'), [b('It is all he has left of his granddaughter.', 'C’est tout ce qu’il lui reste de sa petite-fille.'), b('It is very old and valuable.', 'Elle est très ancienne et précieuse.'), b('It shows his house.', 'Elle montre sa maison.'), b('It belongs to Samir.', 'Elle appartient à Samir.')]),
      mc(P.meaning, [b('he burst into tears', 'il s’est mis à pleurer'), b('he melted', 'il a fondu'), b('he laughed', 'il a ri'), b('he got angry', 'il s’est fâché')], { fr: 'il a fondu en larmes' }),
      pairs(P.match, [['abandonné', b('left behind', 'laissé seul')], ['avec hésitation', b('hesitantly', 'sans être sûr')], ['murmurer', b('to whisper', 'parler très bas')], ['la petite-fille', b('the granddaughter', 'la fille de son enfant')]]),
      dict('Le soir même, il a sonné chez le vieil homme.', { voice: 'm' }),
    ],
    [
      b('Guess words from the sentence and the situation.', 'Devinez les mots grâce à la phrase et à la situation.'),
      b('Past story: passé composé (events) + imparfait (description).', 'Récit au passé : passé composé (événements) + imparfait (description).'),
      b('fondre en larmes = to burst into tears.', 'fondre en larmes = se mettre à pleurer.'),
    ],
    [['le cuir', b('leather', 'peau d’animal travaillée')], ['un siège', b('a seat', 'place assise')], ['sonner', b('to ring (a doorbell)', 'appuyer sur la sonnette')]],
  ),
  lesson(C, 2, ['following-the-chronology', 'suivre-la-chronologie'],
    b('First winter: following the chronology', 'Premier hiver : suivre la chronologie'),
    b('Order the events of a story and understand time markers.', 'Ordonner les événements d’un récit et comprendre les indicateurs de temps.'),
    [b('Follow time markers', 'Suivre les indicateurs de temps'), b('Order the events', 'Remettre les événements dans l’ordre'), b('Understand the plus-que-parfait in a story', 'Comprendre le plus-que-parfait dans un récit')],
    13,
    [
      card(b('Time markers in stories', 'Les indicateurs de temps du récit'), b('**Quand…, le premier…, en sortant de…, en dix minutes, ce matin-là, le soir même, pendant des semaines, puis, enfin**. The **plus-que-parfait** (elle avait souri) goes back to an earlier moment.', '**Quand…, le premier…, en sortant de…, en dix minutes, ce matin-là, le soir même, pendant des semaines, puis, enfin**. Le **plus-que-parfait** (elle avait souri) renvoie à un moment antérieur.')),
      doc(S2, b('What did Luisa think in October?', 'Que pensait Luisa en octobre ?'), [b('That her colleagues were exaggerating', 'Que ses collègues exagéraient'), b('That winter would be terrible', 'Que l’hiver serait terrible'), b('That she needed a new coat', 'Qu’il lui fallait un nouveau manteau'), b('That she would go back to Bogotá', 'Qu’elle rentrerait à Bogotá')]),
      doc(S2, b('Why does she go into the dépanneur?', 'Pourquoi entre-t-elle dans le dépanneur ?'), [b('To warm up because her ears hurt', 'Pour se réchauffer, car elle a mal aux oreilles'), b('To buy a coat', 'Pour acheter un manteau'), b('To meet Gilles', 'Pour rencontrer Gilles'), b('To take the bus', 'Pour prendre l’autobus')]),
      doc(S2, b('What does the cashier give her?', 'Que lui donne le caissier ?'), [b('A coffee and the address of a coat shop', 'Un café et l’adresse d’un magasin de manteaux'), b('A hat', 'Un bonnet'), b('Money', 'De l’argent'), b('A bus ticket', 'Un billet d’autobus')]),
      sort(b('Before or after the first cold day?', 'Avant ou après le premier jour de grand froid ?'), [b('before', 'avant'), b('after', 'après')], [['Elle arrive de Bogotá.', 0], ['Ses cils gèlent.', 1], ['Ses collègues la préviennent.', 0], ['Elle entre dans un dépanneur.', 1], ['Elle sourit poliment.', 0], ['Gilles lui donne une adresse.', 1]]),
      pairs(P.match, [['un dépanneur', b('a convenience store (Québec)', 'petite épicerie de quartier')], ['le ressenti', b('the wind chill, “feels like”', 'température ressentie')], ['hocher la tête', b('to nod', 'faire oui de la tête')], ['de la part de', b('on behalf of, sent by', 'envoyé par')]]),
      say('En sortant de l’autobus, elle a senti ses cils geler.', 'Getting off the bus, she felt her eyelashes freeze.'),
    ],
    [
      b('Follow markers: quand, le premier, en sortant, le soir même, puis.', 'Suivez les indicateurs : quand, le premier, en sortant, le soir même, puis.'),
      b('Plus-que-parfait = an earlier past (elle avait souri).', 'Plus-que-parfait = antériorité (elle avait souri).'),
      b('Québec: un dépanneur = a convenience store.', 'Au Québec : un dépanneur = une petite épicerie.'),
    ],
    [['geler', b('to freeze', 'devenir glacé')], ['un bonnet', b('a woolly hat', 'chapeau d’hiver')], ['griffonner', b('to scribble', 'écrire vite et mal')]],
  ),
  lesson(C, 3, ['characters-and-feelings', 'personnages-et-sentiments'],
    b('The letter: characters and feelings', 'La lettre : personnages et sentiments'),
    b('Understand the motives and feelings of characters, and summarise a story.', 'Comprendre les motivations et les sentiments des personnages, et résumer une histoire.'),
    [b('Infer feelings from actions', 'Déduire les sentiments à partir des actions'), b('Understand the twist', 'Comprendre le dénouement'), b('Summarise a story', 'Résumer une histoire')],
    13,
    [
      tip(b('Feelings are shown, not said', 'Les sentiments sont montrés, pas dits'), b('Authors rarely write « elle était triste ». They show it through **actions and details**: **en serrant la main de Claire**, **la curiosité l’a emporté**, **elle avait presque abandonné**.', 'Les auteurs écrivent rarement « elle était triste ». Ils le montrent par des **actions et des détails** : **en serrant la main de Claire**, **la curiosité l’a emporté**, **elle avait presque abandonné**.')),
      doc(S3, b('Why does Claire search for Madeleine?', 'Pourquoi Claire cherche-t-elle Madeleine ?'), [b('Out of curiosity', 'Par curiosité'), b('Because she is her mother', 'Parce que c’est sa mère'), b('For money', 'Pour de l’argent'), b('Because the bookseller asks her', 'Parce que le bouquiniste le lui demande')]),
      doc(S3, b('Who answers Claire’s ad?', 'Qui répond à l’annonce de Claire ?'), [b('Madeleine’s daughter', 'La fille de Madeleine'), b('Madeleine herself', 'Madeleine elle-même'), b('The soldier', 'Le soldat'), b('The bookseller', 'Le bouquiniste')]),
      doc(S3, b('What is sad about the letter?', 'Qu’est-ce qui est triste dans cette lettre ?'), [b('Madeleine waited all her life for a letter she never received.', 'Madeleine a attendu toute sa vie une lettre qu’elle n’a jamais reçue.'), b('The soldier never wrote.', 'Le soldat n’a jamais écrit.'), b('Claire lost the letter.', 'Claire a perdu la lettre.'), b('The letter was empty.', 'La lettre était vide.')]),
      mc(P.meaning, [b('her curiosity won', 'sa curiosité a été la plus forte'), b('she took her curiosity away', 'elle a emporté sa curiosité'), b('she lost her curiosity', 'elle a perdu sa curiosité'), b('she was not curious', 'elle n’était pas curieuse')], { fr: 'la curiosité l’a emporté' }),
      pairs(P.match, [['un bouquiniste', b('a second-hand bookseller', 'vendeur de vieux livres')], ['feuilleter', b('to leaf through', 'tourner les pages')], ['jauni', b('yellowed', 'devenu jaune avec le temps')], ['un avis de décès', b('a death notice', 'annonce d’un décès')]]),
      gap(P.completeText, 'Claire a ___ une vieille lettre dans un livre. Après des semaines de recherches, elle a ___ la fille de Madeleine. Ensemble, elles ont ___ la lettre.', ['trouvé', 'retrouvé', 'ouvert']),
      say('Claire a trouvé une vieille lettre et, après des semaines de recherches, elle a retrouvé la fille de Madeleine.', 'Claire found an old letter and, after weeks of searching, she found Madeleine’s daughter.'),
    ],
    [
      b('Feelings are shown through actions and details.', 'Les sentiments sont montrés par les actions et les détails.'),
      b('l’emporter = to win, to prevail.', 'l’emporter = être le plus fort.'),
      b('Summary: who, what problem, what search, what ending.', 'Résumé : qui, quel problème, quelle recherche, quelle fin.'),
    ],
    [['une enveloppe', b('an envelope', 'pochette pour lettre')], ['les archives', b('the archives', 'documents anciens conservés')], ['épouser', b('to marry', 'se marier avec')]],
  ),
];
