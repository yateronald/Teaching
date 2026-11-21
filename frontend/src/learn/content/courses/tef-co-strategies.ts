import type { CourseAbout } from '../../types';
import { b, exam, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The TEF listening test includes a large number of questions in about 40 minutes, from short everyday messages to radio programmes and interviews, often linked to pictures or short texts in the first sections. This course trains the TEF-specific listening strategies: associating a recording with a picture or a situation, catching key information in public announcements and messages, and following longer radio documents to identify opinions and details.',
    'L’épreuve de compréhension orale du TEF comporte un grand nombre de questions en environ 40 minutes, des courts messages du quotidien aux émissions de radio et interviews, souvent liés à des images ou de courts textes dans les premières sections. Ce cours entraîne les stratégies d’écoute propres au TEF : associer un enregistrement à une image ou une situation, saisir l’information clé dans les annonces publiques et les messages, et suivre les documents radiophoniques plus longs pour repérer opinions et détails.',
  ),
  outcomes: [
    b('Identify a situation from a short recording', 'Identifier une situation à partir d’un court enregistrement'),
    b('Catch key information in messages', 'Saisir l’information clé dans les messages'),
    b('Follow radio documents', 'Suivre des documents radiophoniques'),
    b('Identify opinions and details', 'Repérer opinions et détails'),
  ],
};

const C = 'tef-co-strategies';
export default [
  lesson(C, 1, ['situations-and-pictures', 'situations-et-images'],
    b('Identifying situations', 'Identifier les situations'),
    b('Recognise where, who and what from a short recording.', 'Reconnaître où, qui et quoi à partir d’un court enregistrement.'),
    [b('Know the TEF listening format', 'Connaître le format de la compréhension orale du TEF'), b('Identify the place and speakers', 'Identifier le lieu et les interlocuteurs'), b('Use sound clues', 'Utiliser les indices sonores')],
    13,
    [
      exam(b('TEF listening', 'Compréhension orale du TEF'), b('About **40 minutes**, many **multiple-choice questions**, from **A1 to C2**. Early sections often ask you to link a **short recording** to a **picture** or a **situation**; later ones use **announcements, phone messages, radio programmes and interviews**. Recordings are often heard **once**. Check the current format on the official TEF website.', 'Environ **40 minutes**, de nombreuses **questions à choix multiple**, du **A1 au C2**. Les premières sections demandent souvent d’associer un **court enregistrement** à une **image** ou une **situation** ; les suivantes utilisent **annonces, messages téléphoniques, émissions de radio et interviews**. Les enregistrements sont souvent entendus **une seule fois**. Vérifiez le format en vigueur sur le site officiel du TEF.')),
      hear('Vous prendrez bien un dessert ? Nous avons une tarte aux pommes maison et une mousse au chocolat.', b('Where are we?', 'Où sommes-nous ?'), [b('in a restaurant', 'au restaurant'), b('in a pharmacy', 'à la pharmacie'), b('at a train station', 'à la gare'), b('at the bank', 'à la banque')], { voice: 'm' }),
      hear('Prenez ce sirop trois fois par jour, après les repas. Si la toux continue après une semaine, revenez me voir.', b('Who is speaking?', 'Qui parle ?'), [b('a doctor or pharmacist', 'un médecin ou un pharmacien'), b('a waiter', 'un serveur'), b('a teacher', 'un enseignant'), b('a bus driver', 'un chauffeur de bus')], { voice: 'f' }),
      hear('Prochain arrêt : Berri-UQAM. Correspondance avec les lignes verte, jaune et orange.', b('Where is the listener?', 'Où se trouve l’auditeur ?'), [b('in the metro', 'dans le métro'), b('in a plane', 'dans un avion'), b('in a shop', 'dans un magasin'), b('at home', 'à la maison')], { voice: 'f' }),
      sort(b('Which place?', 'Quel lieu ?'), [b('shop / restaurant', 'magasin / restaurant'), b('health', 'santé'), b('transport', 'transports')], [['Vous payez par carte ?', 0], ['Où avez-vous mal ?', 1], ['Le vol 870 est retardé.', 2], ['Vous désirez autre chose ?', 0], ['Je vous prescris des antibiotiques.', 1], ['Correspondance pour la ligne 2.', 2]]),
    ],
    [
      b('About 40 min, many questions, A1 → C2, often one listening.', 'Environ 40 min, beaucoup de questions, A1 → C2, souvent une écoute.'),
      b('Key words reveal the place and the speaker.', 'Les mots clés révèlent le lieu et l’interlocuteur.'),
      b('Check the official format before the exam.', 'Vérifiez le format officiel avant l’examen.'),
    ],
    [['un sirop', b('a syrup (medicine)', 'médicament liquide')], ['la toux', b('a cough', 'fait de tousser')], ['une correspondance', b('a connection (transport)', 'changement de ligne')]],
  ),
  lesson(C, 2, ['messages-and-announcements', 'messages-et-annonces'],
    b('Messages and announcements', 'Messages et annonces'),
    b('Catch times, places, changes and instructions in messages and announcements.', 'Saisir heures, lieux, changements et consignes dans les messages et annonces.'),
    [b('Catch changes and instructions', 'Saisir changements et consignes'), b('Catch numbers and times', 'Saisir nombres et heures'), b('Avoid repeated-word traps', 'Éviter les pièges de mots répétés')],
    13,
    [
      hear('Bonjour madame Lavoie, ici le garage Lefebvre. Votre voiture est prête, mais nous fermons exceptionnellement à seize heures aujourd’hui. Si vous ne pouvez pas passer avant, vous pourrez la récupérer demain dès huit heures.', b('What is the problem?', 'Quel est le problème ?'), [b('the garage closes early today, at 4 p.m.', 'le garage ferme tôt aujourd’hui, à 16 h'), b('the car is not ready', 'la voiture n’est pas prête'), b('the garage is closed tomorrow', 'le garage est fermé demain'), b('the repair is expensive', 'la réparation est chère')], { voice: 'm' }),
      hear('Attention, en raison de travaux, l’autobus 55 ne s’arrêtera pas à l’arrêt Saint-Laurent jusqu’au 15 octobre. Veuillez utiliser l’arrêt temporaire situé cent mètres plus loin, devant la pharmacie.', b('Where must passengers wait?', 'Où les passagers doivent-ils attendre ?'), [b('at a temporary stop in front of the pharmacy', 'à un arrêt temporaire devant la pharmacie'), b('at the Saint-Laurent stop', 'à l’arrêt Saint-Laurent'), b('at the metro', 'au métro'), b('anywhere', 'n’importe où')], { voice: 'f' }),
      hear('Salut c’est Max ! Finalement, la fête n’est pas samedi mais dimanche midi, chez mes parents. Apporte ton maillot, il y a une piscine !', b('What has changed?', 'Qu’est-ce qui a changé ?'), [b('the day and time: Sunday at noon', 'le jour et l’heure : dimanche midi'), b('the place only', 'seulement le lieu'), b('the party is cancelled', 'la fête est annulée'), b('nothing', 'rien')], { voice: 'm' }),
      tip(b('Changes are often tested', 'Les changements sont souvent testés'), b('Messages often contain **a change** (finalement, exceptionnellement, au lieu de, ne… pas… mais…). The question is very often about **the new information**, not the old one.', 'Les messages contiennent souvent **un changement** (finalement, exceptionnellement, au lieu de, ne… pas… mais…). La question porte très souvent sur **la nouvelle information**, pas sur l’ancienne.')),
      pairs(P.match, [['exceptionnellement', b('exceptionally', 'de façon inhabituelle')], ['au lieu de', b('instead of', 'à la place de')], ['finalement', b('in the end, after all', 'en fin de compte')], ['temporaire', b('temporary', 'pour un temps')]]),
    ],
    [
      b('Listen for changes: finalement, exceptionnellement, au lieu de.', 'Écoutez les changements : finalement, exceptionnellement, au lieu de.'),
      b('The question usually targets the new information.', 'La question vise généralement la nouvelle information.'),
      b('Note times and places immediately.', 'Notez heures et lieux immédiatement.'),
    ],
    [['récupérer', b('to pick up, collect', 'reprendre')], ['un maillot', b('a swimsuit', 'pour nager')], ['un arrêt', b('a stop', 'où le bus s’arrête')]],
  ),
  lesson(C, 3, ['radio-documents', 'documents-radiophoniques'],
    b('Radio documents and interviews', 'Documents radiophoniques et interviews'),
    b('Follow longer documents and identify the speaker’s opinion and key details.', 'Suivre des documents plus longs et repérer l’opinion et les détails clés.'),
    [b('Follow a radio report', 'Suivre un reportage radio'), b('Identify an opinion', 'Repérer une opinion'), b('Identify a key detail', 'Repérer un détail clé')],
    13,
    [
      hear('Dans notre émission ce matin, nous recevons une apicultrice de Charlevoix. Elle a installé des ruches sur les toits de plusieurs hôtels de la région. « Au début, les clients avaient peur des abeilles. Aujourd’hui, ils réclament notre miel au petit-déjeuner ! » explique-t-elle.', b('How have hotel guests’ attitudes changed?', 'Comment l’attitude des clients a-t-elle changé ?'), [b('From fear of bees to asking for the honey', 'De la peur des abeilles à la demande de miel'), b('They complain more and more', 'Ils se plaignent de plus en plus'), b('They never noticed the hives', 'Ils n’ont jamais remarqué les ruches'), b('They want the hives removed', 'Ils veulent qu’on enlève les ruches')], { voice: 'f' }),
      hear('Moi, je ne suis pas contre la hausse du prix des permis de stationnement. Mais il faudrait que l’argent serve vraiment à améliorer les transports en commun, et pour l’instant, rien ne le garantit.', b('What is the speaker’s position?', 'Quelle est la position du locuteur ?'), [b('not against it, on condition that the money improves public transport', 'pas contre, à condition que l’argent améliore les transports'), b('totally against the rise', 'totalement contre la hausse'), b('enthusiastic without conditions', 'enthousiaste sans condition'), b('indifferent', 'indifférent')], { voice: 'm' }),
      sort(b('Opinion or fact?', 'Opinion ou fait ?'), [b('opinion', 'opinion'), b('fact', 'fait')], [['Je ne suis pas contre…', 0], ['Elle a installé des ruches sur trois hôtels.', 1], ['Il faudrait que…', 0], ['Le prix passera à 120 dollars.', 1], ['Pour moi, c’est une erreur.', 0], ['Le projet a commencé en 2021.', 1]]),
      pairs(P.match, [['une apicultrice', b('a beekeeper (woman)', 'qui élève des abeilles')], ['une ruche', b('a beehive', 'maison des abeilles')], ['réclamer', b('to ask for, demand', 'demander')], ['une hausse', b('a rise', 'augmentation')]]),
    ],
    [
      b('Radio: identify the guest, the topic, the change, the opinion.', 'Radio : repérez l’invité, le thème, le changement, l’opinion.'),
      b('Conditions (il faudrait que…) nuance opinions.', 'Les conditions (il faudrait que…) nuancent les opinions.'),
      b('Distinguish facts and opinions.', 'Distinguez faits et opinions.'),
    ],
    [['une émission', b('a programme (radio, TV)', 'programme diffusé')], ['garantir', b('to guarantee', 'assurer')], ['un permis de stationnement', b('a parking permit', 'autorisation de se garer')]],
  ),
];
