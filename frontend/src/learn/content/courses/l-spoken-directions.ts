import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Prenez la deuxième à gauche, puis continuez tout droit jusqu’au feu… When someone gives you directions, you must remember several steps in order, in real time. This course trains you to follow spoken directions in the street, in a building and on public transport, with the key words (tout droit, au coin, en face, au bout), the sequence markers and the tricks to check you understood.',
    'Prenez la deuxième à gauche, puis continuez tout droit jusqu’au feu… Quand on vous indique un chemin, il faut retenir plusieurs étapes dans l’ordre, en temps réel. Ce cours vous entraîne à suivre des indications orales dans la rue, dans un bâtiment et dans les transports, avec les mots clés (tout droit, au coin, en face, au bout), les marqueurs de succession et les astuces pour vérifier que vous avez compris.',
  ),
  outcomes: [
    b('Follow directions in the street', 'Suivre des indications dans la rue'),
    b('Follow directions inside a building', 'Suivre des indications dans un bâtiment'),
    b('Understand transport connections', 'Comprendre les correspondances'),
    b('Check and repeat the itinerary', 'Vérifier et reformuler l’itinéraire'),
  ],
};

const C = 'l-spoken-directions';
export default [
  lesson(C, 1, ['in-the-street', 'dans-la-rue'],
    b('Directions in the street', 'Indications dans la rue'),
    b('Follow a sequence of steps to a place in town.', 'Suivre une succession d’étapes jusqu’à un lieu en ville.'),
    [b('Understand direction words', 'Comprendre les mots de direction'), b('Follow the order of the steps', 'Suivre l’ordre des étapes'), b('Find the final location', 'Trouver le lieu final')],
    13,
    [
      card(b('Key words', 'Les mots clés'), b('**tout droit** (straight on), **à gauche / à droite**, **la première / deuxième rue**, **au feu** (at the lights), **au coin de**, **jusqu’à** (as far as), **traverser**, **c’est en face de / à côté de / au bout de**.', '**tout droit**, **à gauche / à droite**, **la première / deuxième rue**, **au feu**, **au coin de**, **jusqu’à**, **traverser**, **c’est en face de / à côté de / au bout de**.')),
      tip(b('Count the steps', 'Comptez les étapes'), b('Use your fingers: one finger per step (**d’abord, ensuite, puis, après**). Then repeat the whole route.', 'Utilisez vos doigts : un doigt par étape (**d’abord, ensuite, puis, après**). Puis répétez l’itinéraire en entier.')),
      hear('Allez tout droit jusqu’au feu, puis tournez à gauche. La pharmacie est sur votre droite.', b('Where is the pharmacy?', 'Où est la pharmacie ?'), [b('After the lights, left, then on your right', 'Après le feu, à gauche, puis sur votre droite'), b('Straight on, on your left', 'Tout droit, sur votre gauche'), b('Right at the lights', 'À droite au feu'), b('Behind you', 'Derrière vous')]),
      hear('Prenez la deuxième rue à droite. Le musée est au bout de la rue, en face du parc.', b('Where is the museum?', 'Où est le musée ?'), [b('At the end of the second street on the right, opposite the park', 'Au bout de la deuxième rue à droite, en face du parc'), b('In the park', 'Dans le parc'), b('In the first street on the left', 'Dans la première rue à gauche'), b('Next to the park', 'À côté du parc')]),
      hear('Traversez le pont, puis continuez cinq minutes. C’est juste après l’église.', b('What is right after the church?', 'Qu’est-ce qui est juste après l’église ?'), [b('Your destination', 'Votre destination'), b('A bridge', 'Un pont'), b('A park', 'Un parc'), b('The lights', 'Le feu')]),
      sort(b('Direction or location?', 'Direction ou position ?'), [b('direction (go…)', 'direction (aller…)'), b('location (it is…)', 'position (c’est…)')], [['tournez à gauche', 0], ['en face du parc', 1], ['allez tout droit', 0], ['au bout de la rue', 1], ['traversez le pont', 0], ['à côté de la banque', 1]]),
      pairs(P.match, [['tout droit', b('straight on', 'sans tourner')], ['au feu', b('at the traffic lights', 'au signal lumineux')], ['au bout de', b('at the end of', 'tout au fond')], ['jusqu’à', b('as far as, until', 'en allant à')]]),
      dict('Prenez la première à gauche, puis allez tout droit jusqu’au feu.', { voice: 'f' }),
    ],
    [
      b('tout droit, à gauche, à droite, au feu, au coin, au bout, jusqu’à.', 'tout droit, à gauche, à droite, au feu, au coin, au bout, jusqu’à.'),
      b('Sequence: d’abord, ensuite, puis, après.', 'Succession : d’abord, ensuite, puis, après.'),
      b('Count the steps on your fingers.', 'Comptez les étapes sur vos doigts.'),
    ],
    [['une église', b('a church', 'lieu de culte')], ['une destination', b('a destination', 'lieu où l’on va')], ['continuer', b('to keep going', 'poursuivre')]],
  ),
  lesson(C, 2, ['inside-a-building', 'dans-un-batiment'],
    b('Directions inside a building', 'Indications dans un bâtiment'),
    b('Find a room, an office or a service in a hospital, a school or an office building.', 'Trouver une salle, un bureau ou un service dans un hôpital, une école ou un immeuble de bureaux.'),
    [b('Understand floors and lifts', 'Comprendre les étages et les ascenseurs'), b('Understand corridors and doors', 'Comprendre couloirs et portes'), b('Understand room numbers', 'Comprendre les numéros de salle')],
    13,
    [
      card(b('Building words', 'Les mots du bâtiment'), b('**le rez-de-chaussée** (ground floor; Québec: **le premier étage** is often the ground floor!), **au deuxième étage**, **l’ascenseur**, **l’escalier**, **le couloir**, **au fond du couloir**, **la salle 214**, **l’accueil** (reception).', '**le rez-de-chaussée** (au Québec, le **premier étage** est souvent le rez-de-chaussée !), **au deuxième étage**, **l’ascenseur**, **l’escalier**, **le couloir**, **au fond du couloir**, **la salle 214**, **l’accueil**.')),
      hear('La radiologie est au troisième étage. Prenez l’ascenseur, puis c’est la deuxième porte à gauche.', b('Where is radiology?', 'Où est la radiologie ?'), [b('Third floor, second door on the left', 'Troisième étage, deuxième porte à gauche'), b('Second floor, third door', 'Deuxième étage, troisième porte'), b('Ground floor', 'Rez-de-chaussée'), b('Basement', 'Sous-sol')]),
      hear('Votre entrevue est à la salle quatre cent douze. Les ascenseurs sont derrière l’accueil.', b('Which room is the interview in?', 'Dans quelle salle est l’entrevue ?'), ['412', '402', '214', '420']),
      hear('Les toilettes ? Au fond du couloir, juste avant la sortie de secours.', b('Where are the toilets?', 'Où sont les toilettes ?'), [b('At the end of the corridor, before the emergency exit', 'Au fond du couloir, avant la sortie de secours'), b('Next to reception', 'À côté de l’accueil'), b('Upstairs', 'À l’étage'), b('Outside', 'Dehors')]),
      dlg(b('At the hospital', 'À l’hôpital'), undefined, [['Bénévole', 'f'], ['Vous', 'm']], [
        [1, 'Excusez-moi, je cherche le service de pédiatrie.', 'Excuse me, I’m looking for the paediatrics department.'],
        [0, 'C’est au deuxième étage, aile B. Prenez l’ascenseur jaune, puis suivez les flèches vertes.', 'It’s on the second floor, wing B. Take the yellow lift, then follow the green arrows.'],
        [1, { options: ['Deuxième étage, aile B, ascenseur jaune, flèches vertes. Merci !', 'Troisième étage, aile D. Merci !', 'Ascenseur vert, flèches jaunes. Merci !'] }],
      ]),
      pairs(P.match, [['le rez-de-chaussée', b('the ground floor', 'niveau de la rue')], ['une aile', b('a wing (of a building)', 'partie d’un bâtiment')], ['une flèche', b('an arrow', 'signe indiquant la direction')], ['une entrevue', b('an interview (Québec)', 'entretien')]]),
      say('Excusez-moi, la salle quatre cent douze, c’est à quel étage ?', 'Excuse me, which floor is room 412 on?'),
    ],
    [
      b('rez-de-chaussée, étage, ascenseur, escalier, couloir, accueil.', 'rez-de-chaussée, étage, ascenseur, escalier, couloir, accueil.'),
      b('In Québec, the 1er étage is often the ground floor.', 'Au Québec, le 1er étage est souvent le rez-de-chaussée.'),
      b('au fond du couloir = at the end of the corridor.', 'au fond du couloir = tout au bout du couloir.'),
    ],
    [['la pédiatrie', b('paediatrics', 'médecine des enfants')], ['un bénévole', b('a volunteer', 'personne qui aide gratuitement')], ['suivre', b('to follow', 'aller derrière')]],
  ),
  lesson(C, 3, ['transport-connections', 'correspondances'],
    b('Transport connections', 'Les correspondances'),
    b('Understand metro and bus directions with transfers.', 'Comprendre des indications de métro et d’autobus avec correspondances.'),
    [b('Understand lines and directions', 'Comprendre lignes et directions'), b('Understand transfers', 'Comprendre les correspondances'), b('Check your itinerary', 'Vérifier son itinéraire')],
    13,
    [
      card(b('Metro and bus', 'Métro et autobus'), b('**la ligne verte / orange**, **direction Angrignon** (towards), **changer à…** (change at), **la correspondance** (transfer), **descendre à** (get off at), **monter dans** (get on), **c’est à trois stations**.', '**la ligne verte / orange**, **direction Angrignon**, **changer à…**, **la correspondance**, **descendre à**, **monter dans**, **c’est à trois stations**.')),
      hear('Prenez la ligne verte direction Angrignon, changez à Lionel-Groulx et prenez la ligne orange jusqu’à Place-Saint-Henri.', b('Where do you change lines?', 'Où changez-vous de ligne ?'), [b('At Lionel-Groulx', 'À Lionel-Groulx'), b('At Angrignon', 'À Angrignon'), b('At Place-Saint-Henri', 'À Place-Saint-Henri'), b('You don’t change', 'On ne change pas')]),
      hear('Descendez au troisième arrêt, devant la bibliothèque, puis prenez le 24 vers l’ouest.', b('What do you do after getting off?', 'Que faites-vous après être descendu ?'), [b('Take bus 24 westbound', 'Prendre le 24 vers l’ouest'), b('Walk east', 'Marcher vers l’est'), b('Take the metro', 'Prendre le métro'), b('Go into the library', 'Entrer dans la bibliothèque')]),
      hear('C’est direct : trois stations, et la sortie est du côté de la rue Ontario.', b('How many stations?', 'Combien de stations ?'), ['3', '1', '5', '13']),
      tip(b('Repeat the itinerary', 'Répétez l’itinéraire'), b('Check by repeating: **Donc, ligne verte jusqu’à Lionel-Groulx, puis ligne orange, c’est bien ça ?** People will correct you if needed.', 'Vérifiez en répétant : **Donc, ligne verte jusqu’à Lionel-Groulx, puis ligne orange, c’est bien ça ?** On vous corrigera si besoin.')),
      pairs(P.match, [['une correspondance', b('a transfer, a connection', 'changement de ligne')], ['descendre à', b('to get off at', 'quitter le véhicule à')], ['direction…', b('towards…', 'vers le terminus…')], ['c’est direct', b('no change needed', 'sans changement')]]),
      dict('Changez à Berri-UQAM et prenez la ligne jaune.', { voice: 'm' }),
    ],
    [
      b('ligne, direction, changer à, correspondance, descendre à.', 'ligne, direction, changer à, correspondance, descendre à.'),
      b('vers l’ouest / l’est / le nord / le sud.', 'vers l’ouest / l’est / le nord / le sud.'),
      b('Check: Donc, …, c’est bien ça ?', 'Vérifier : Donc, …, c’est bien ça ?'),
    ],
    [['une station', b('a (metro) station', 'arrêt de métro')], ['un arrêt', b('a (bus) stop', 'arrêt d’autobus')], ['la sortie', b('the exit', 'l’issue')]],
  ),
];
