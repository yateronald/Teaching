import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'On the bus, in a café, at the next table: overheard conversations are the real test of listening, because you join in the middle, without context, at full speed. This course trains you on original short exchanges between friends, family and strangers to infer the situation, the relationship between speakers and their feelings from tone and words.',
    'Dans l’autobus, au café, à la table d’à côté : les conversations saisies au vol sont le vrai test de l’écoute, car on arrive au milieu, sans contexte, à pleine vitesse. Ce cours vous entraîne sur de courts échanges originaux entre amis, en famille et entre inconnus pour déduire la situation, la relation entre les personnes et leurs sentiments à partir du ton et des mots.',
  ),
  outcomes: [
    b('Infer the situation from a few lines', 'Déduire la situation à partir de quelques répliques'),
    b('Identify the relationship between speakers', 'Identifier la relation entre les interlocuteurs'),
    b('Recognise feelings and tone', 'Reconnaître sentiments et ton'),
    b('Understand tu / vous and register', 'Comprendre tu / vous et le registre'),
  ],
};

const C = 'l-overheard';
export default [
  lesson(C, 1, ['where-are-they', 'ou-sont-ils'],
    b('Where are they?', 'Où sont-ils ?'),
    b('Infer the place and the situation from vocabulary clues.', 'Déduire le lieu et la situation à partir des indices du vocabulaire.'),
    [b('Use vocabulary clues', 'Utiliser les indices de vocabulaire'), b('Infer the place', 'Déduire le lieu'), b('Infer the situation', 'Déduire la situation')],
    13,
    [
      tip(b('Look for clue words', 'Cherchez les mots indices'), b('You join in the middle: listen for **clue words** that reveal the place (l’addition, le quai, la caisse, la salle d’attente) and the situation (en retard, perdu, cassé).', 'Vous arrivez au milieu : écoutez les **mots indices** qui révèlent le lieu (l’addition, le quai, la caisse, la salle d’attente) et la situation (en retard, perdu, cassé).')),
      hear('— Tu prends quoi, toi ? — Je sais pas… la tartare, peut-être. Et on partage une bouteille de rouge ?', b('Where are they?', 'Où sont-ils ?'), [b('In a restaurant', 'Au restaurant'), b('At a supermarket', 'Au supermarché'), b('At home', 'À la maison'), b('At work', 'Au travail')]),
      hear('— Il est encore en retard, ce train… — Ouais, avec la neige, ça m’étonne pas. On va rater notre correspondance.', b('What is the situation?', 'Quelle est la situation ?'), [b('They are waiting for a late train.', 'Ils attendent un train en retard.'), b('They missed a plane.', 'Ils ont raté un avion.'), b('They are skiing.', 'Ils font du ski.'), b('They are driving.', 'Ils conduisent.')]),
      hear('— Madame Leblanc ? C’est à vous. — Ah, enfin ! Ça fait une heure que j’attends.', b('Where are they probably?', 'Où sont-ils probablement ?'), [b('In a waiting room', 'Dans une salle d’attente'), b('At a party', 'À une fête'), b('In a classroom', 'Dans une salle de classe'), b('In a car', 'Dans une voiture')]),
      sort(b('Which place does the clue suggest?', 'Quel lieu l’indice suggère-t-il ?'), [b('restaurant', 'restaurant'), b('station', 'gare'), b('doctor’s', 'cabinet médical')], [['l’addition', 0], ['le quai', 1], ['l’ordonnance', 2], ['le menu du jour', 0], ['la correspondance', 1], ['la salle d’attente', 2]], { listen: true }),
      pairs(P.match, [['partager', b('to share', 'diviser entre plusieurs')], ['ça m’étonne pas', b('I’m not surprised', 'c’était prévisible')], ['c’est à vous', b('it’s your turn', 'votre tour')], ['enfin !', b('at last!', 'finalement')]]),
      dict('Ça fait une heure que j’attends dans la salle d’attente.', { voice: 'f' }),
    ],
    [
      b('Clue words reveal the place and the situation.', 'Les mots indices révèlent le lieu et la situation.'),
      b('ça fait + duration + que = for (duration).', 'ça fait + durée + que = depuis.'),
      b('c’est à vous = it’s your turn.', 'c’est à vous = c’est votre tour.'),
    ],
    [['rater', b('to miss', 'manquer')], ['une correspondance', b('a connection', 'changement de train')], ['ouais', b('yeah (informal)', 'oui, familier')]],
  ),
  lesson(C, 2, ['who-are-they', 'qui-sont-ils'],
    b('Who are they to each other?', 'Quelle relation entre eux ?'),
    b('Identify the relationship from tu / vous, names and tone.', 'Identifier la relation grâce à tu / vous, aux noms et au ton.'),
    [b('Use tu / vous as a clue', 'Utiliser tu / vous comme indice'), b('Recognise family and work relationships', 'Reconnaître relations familiales et professionnelles'), b('Recognise strangers', 'Reconnaître des inconnus')],
    13,
    [
      card(b('Relationship clues', 'Les indices de relation'), b('**tu** = friends, family, colleagues (often in Québec); **vous** = strangers, hierarchy, clients. Names: **maman, chéri, mon grand** (family), **Monsieur, Madame** (formal), **Docteur**. Topics also help: homework (parent/child), a report (colleagues).', '**tu** = amis, famille, collègues (souvent au Québec) ; **vous** = inconnus, hiérarchie, clients. Appellations : **maman, chéri, mon grand** (famille), **Monsieur, Madame** (formel), **Docteur**. Les sujets aident aussi : devoirs (parent/enfant), rapport (collègues).')),
      hear('— Maman, je peux aller chez Léo après l’école ? — Oui, mais tu rentres pour le souper, d’accord ?', b('Who are they?', 'Qui sont-ils ?'), [b('A child and his mother', 'Un enfant et sa mère'), b('Two colleagues', 'Deux collègues'), b('A teacher and a pupil', 'Un enseignant et un élève'), b('Two strangers', 'Deux inconnus')]),
      hear('— Excusez-moi, monsieur, cette place est libre ? — Oui, oui, allez-y, je vous en prie.', b('Who are they?', 'Qui sont-ils ?'), [b('Two strangers', 'Deux inconnus'), b('Old friends', 'De vieux amis'), b('A couple', 'Un couple'), b('Brother and sister', 'Frère et sœur')]),
      hear('— T’as fini ton bout du rapport ? La patronne le veut pour midi. — Presque, je t’envoie ça dans vingt minutes.', b('Who are they?', 'Qui sont-ils ?'), [b('Two colleagues', 'Deux collègues'), b('A boss and an employee', 'Une patronne et un employé'), b('Parent and child', 'Parent et enfant'), b('A client and a seller', 'Un client et un vendeur')]),
      sort(b('Tu or vous?', 'Tu ou vous ?'), [b('tu: close relationship', 'tu : relation proche'), b('vous: distance / respect', 'vous : distance / respect')], [['T’as fini ?', 0], ['Excusez-moi, monsieur', 1], ['Tu rentres pour le souper ?', 0], ['Je vous en prie', 1]]),
      pairs(P.match, [['le souper', b('dinner (Québec)', 'repas du soir')], ['la patronne', b('the boss (woman)', 'la responsable')], ['un bout', b('a part, a bit', 'une partie')], ['allez-y', b('go ahead', 'faites-le')]]),
      dict('Tu rentres pour le souper, d’accord ?', { voice: 'f' }),
    ],
    [
      b('tu = closeness; vous = distance or respect.', 'tu = proximité ; vous = distance ou respect.'),
      b('Names and topics reveal the relationship.', 'Appellations et sujets révèlent la relation.'),
      b('t’as = tu as (spoken).', 't’as = tu as (oral).'),
    ],
    [['libre', b('free, available', 'non occupé')], ['presque', b('almost', 'pas tout à fait')], ['je vous en prie', b('please, go ahead / you’re welcome', 'formule polie')]],
  ),
  lesson(C, 3, ['how-do-they-feel', 'que-ressentent-ils'],
    b('How do they feel?', 'Que ressentent-ils ?'),
    b('Recognise feelings and tone: annoyance, joy, surprise, irony.', 'Reconnaître sentiments et ton : agacement, joie, surprise, ironie.'),
    [b('Recognise annoyance and joy', 'Reconnaître l’agacement et la joie'), b('Recognise surprise', 'Reconnaître la surprise'), b('Recognise irony', 'Reconnaître l’ironie')],
    13,
    [
      card(b('Feeling expressions', 'Expressions de sentiments'), b('Annoyance: **J’en ai marre !, Ça m’énerve !** Joy: **Trop bien !, Génial !** Surprise: **Sans blague ?, C’est pas vrai !** Relief: **Ouf !** Irony: **Super… (= not great)**, said with a flat tone.', 'Agacement : **J’en ai marre !, Ça m’énerve !** Joie : **Trop bien !, Génial !** Surprise : **Sans blague ?, C’est pas vrai !** Soulagement : **Ouf !** Ironie : **Super… (= pas génial)**, dit sur un ton plat.')),
      hear('— J’en ai vraiment marre de ce voisin. Encore de la musique à deux heures du matin !', b('How does she feel?', 'Que ressent-elle ?'), [b('Annoyed', 'Agacée'), b('Happy', 'Contente'), b('Surprised', 'Surprise'), b('Relieved', 'Soulagée')]),
      hear('— J’ai eu le poste ! — Sans blague ? C’est génial, félicitations !', b('How does the friend react?', 'Comment réagit l’amie ?'), [b('Surprised and happy', 'Surprise et ravie'), b('Angry', 'En colère'), b('Sad', 'Triste'), b('Indifferent', 'Indifférente')]),
      hear('— Il pleut, le bus est en retard et j’ai oublié mon parapluie. Super journée…', b('What is the tone of « Super journée »?', 'Quel est le ton de « Super journée » ?'), [b('Ironic: the day is bad', 'Ironique : la journée est mauvaise'), b('Enthusiastic', 'Enthousiaste'), b('Sincere', 'Sincère'), b('Surprised', 'Surpris')]),
      dlg(b('Good news', 'Une bonne nouvelle'), undefined, [['Amira', 'f'], ['Vous', 'm']], [
        [0, 'Devine quoi ! On a trouvé un appartement, et il est super lumineux !', 'Guess what! We found an apartment, and it’s really bright!'],
        [1, { options: ['C’est pas vrai ! Trop bien, félicitations !', 'J’en ai marre.', 'Super… encore un appartement.'] }],
        [0, 'Et en plus, le loyer est raisonnable. Ouf !', 'And the rent is reasonable too. Phew!'],
        [1, { options: ['Génial ! On fête ça quand ?', 'Ça m’énerve.', 'Sans blague, quel dommage.'] }],
      ]),
      pairs(P.match, [['J’en ai marre !', b('I’m fed up!', 'agacement')], ['Sans blague ?', b('No kidding?', 'surprise')], ['Ouf !', b('Phew!', 'soulagement')], ['Ça m’énerve !', b('It annoys me!', 'irritation')]]),
    ],
    [
      b('Annoyance: J’en ai marre, Ça m’énerve. Joy: Génial, Trop bien.', 'Agacement : J’en ai marre, Ça m’énerve. Joie : Génial, Trop bien.'),
      b('Surprise: Sans blague ?, C’est pas vrai !', 'Surprise : Sans blague ?, C’est pas vrai !'),
      b('Irony: positive words, flat or negative context.', 'Ironie : mots positifs, contexte négatif ou ton plat.'),
    ],
    [['félicitations', b('congratulations', 'bravo')], ['lumineux', b('bright', 'plein de lumière')], ['deviner', b('to guess', 'trouver sans savoir')]],
  ),
];
