import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Renting a car, filling up, parking and understanding road signs: this course gives you the practical French of driving in France, Belgium, Switzerland and Québec. You will learn the parts of a car, the conversation at the rental desk, the vocabulary of the petrol station and parking, the most common road signs and how to explain a breakdown. A language course, not a driving lesson: always follow local rules.',
    'Louer une voiture, faire le plein, se garer et comprendre les panneaux : ce cours vous donne le français pratique de la conduite en France, en Belgique, en Suisse et au Québec. Vous apprendrez les parties de la voiture, la conversation à l’agence de location, le vocabulaire de la station-service et du stationnement, les panneaux les plus courants et la façon d’expliquer une panne. Un cours de langue, pas une leçon de conduite : respectez toujours le code local.',
  ),
  outcomes: [
    b('Rent a car', 'Louer une voiture'),
    b('Fill up and park', 'Faire le plein et se garer'),
    b('Understand common road signs', 'Comprendre les panneaux courants'),
    b('Explain a breakdown', 'Expliquer une panne'),
  ],
};

const C = 'b-car-driving';
export default [
  lesson(C, 1, ['renting-a-car', 'louer-une-voiture'],
    b('Renting a car', 'Louer une voiture'),
    b('Rent a car and understand the options at the rental desk.', 'Louer une voiture et comprendre les options à l’agence de location.'),
    [b('Name car parts', 'Nommer les parties de la voiture'), b('Ask for a rental', 'Demander une location'), b('Understand options and insurance', 'Comprendre options et assurance')],
    13,
    [
      card(b('At the rental desk', 'À l’agence de location'), b('Car: **le volant, les freins, les phares, le coffre, le pneu, le réservoir, les essuie-glaces, la boîte automatique / manuelle**. Rental: **Je voudrais louer une petite voiture pour une semaine. · Avec boîte automatique, s’il vous plaît. · L’assurance est comprise ? · Le kilométrage est illimité ? · Je dois rendre la voiture avec le plein ?**', 'Voiture : **le volant, les freins, les phares, le coffre, le pneu, le réservoir, les essuie-glaces, la boîte automatique / manuelle**. Location : **Je voudrais louer une petite voiture pour une semaine. · Avec boîte automatique, s’il vous plaît. · L’assurance est comprise ? · Le kilométrage est illimité ? · Je dois rendre la voiture avec le plein ?**')),
      pairs(P.match, [['le volant', b('the steering wheel', 'pour tourner')], ['le coffre', b('the boot, the trunk', 'pour les bagages')], ['les phares', b('the headlights', 'pour voir la nuit')], ['un pneu', b('a tyre', 'roue en caoutchouc')]]),
      dlg(b('At the agency', 'À l’agence'), undefined, [['Agent', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour, vous avez une réservation ?', 'Hello, do you have a booking?'],
        [1, { options: ['Non, je voudrais louer une petite voiture avec boîte automatique pour cinq jours.', 'Voiture, cinq.', 'Je veux conduire.'] }],
        [0, 'Très bien. Il faut me montrer votre permis de conduire et une carte de crédit.', 'Very good. I need to see your driving licence and a credit card.'],
        [1, { options: ['Voilà. L’assurance est comprise, et le kilométrage est illimité ?', 'Je n’ai pas de permis, c’est grave ?', 'Pourquoi ?'] }],
      ]),
      hear('La voiture doit être rendue avec le réservoir plein, sinon nous facturons le carburant. Le kilométrage est illimité.', b('How must the car be returned?', 'Comment faut-il rendre la voiture ?'), [b('with a full tank', 'avec le plein'), b('washed', 'lavée'), b('before 9 a.m.', 'avant 9 h'), b('with an empty tank', 'avec le réservoir vide')], { voice: 'm' }),
      gap(P.complete, 'Je voudrais ___ une voiture avec boîte ___ , s’il vous plaît.', ['louer', 'automatique']),
      say('Je voudrais louer une petite voiture pour une semaine. L’assurance est comprise ?', 'I’d like to rent a small car for a week. Is insurance included?'),
    ],
    [
      b('volant, freins, phares, coffre, pneu, réservoir.', 'volant, freins, phares, coffre, pneu, réservoir.'),
      b('Je voudrais louer… boîte automatique / manuelle.', 'Je voudrais louer… boîte automatique / manuelle.'),
      b('assurance comprise, kilométrage illimité, rendre avec le plein.', 'assurance comprise, kilométrage illimité, rendre avec le plein.'),
    ],
    [['le permis de conduire', b('the driving licence', 'autorisation de conduire')], ['le carburant', b('fuel', 'essence ou diesel')], ['rendre', b('to return', 'redonner')]],
  ),
  lesson(C, 2, ['fuel-and-parking', 'carburant-et-stationnement'],
    b('Fuel and parking', 'Le carburant et le stationnement'),
    b('Fill up at the petrol station and find where to park.', 'Faire le plein à la station-service et trouver où se garer.'),
    [b('Fill up', 'Faire le plein'), b('Understand parking rules', 'Comprendre les règles de stationnement'), b('Ask where to park', 'Demander où se garer')],
    13,
    [
      card(b('Petrol station and parking', 'Station-service et stationnement'), b('**faire le plein, l’essence (sans plomb 95 / 98), le gazole / le diesel, la pompe, payer à la caisse / à la pompe, une borne de recharge** (electric). Parking: **se garer, une place de parking, le stationnement payant / gratuit, l’horodateur / le parcomètre, un ticket, une amende, la fourrière**. **Où est-ce que je peux me garer ?**', '**faire le plein, l’essence (sans plomb 95 / 98), le gazole / le diesel, la pompe, payer à la caisse / à la pompe, une borne de recharge** (électrique). Stationnement : **se garer, une place de parking, le stationnement payant / gratuit, l’horodateur / le parcomètre, un ticket, une amende, la fourrière**. **Où est-ce que je peux me garer ?**')),
      doc({ look: 'notice', title: b('Parking sign', 'Panneau de stationnement'), text: 'STATIONNEMENT PAYANT\nDu lundi au samedi, de 9 h à 19 h\nDurée maximale : 2 heures\nGratuit le dimanche et les jours fériés\nPaiement à l’horodateur ou par application' }, b('When is parking free?', 'Quand le stationnement est-il gratuit ?'), [b('Sundays and public holidays', 'le dimanche et les jours fériés'), b('every evening after 5 p.m.', 'chaque soir après 17 h'), b('on Saturdays', 'le samedi'), b('never', 'jamais')]),
      sort(b('Petrol station or parking?', 'Station-service ou stationnement ?'), [b('petrol station', 'station-service'), b('parking', 'stationnement')], [['faire le plein', 0], ['l’horodateur', 1], ['la pompe', 0], ['une place', 1], ['le gazole', 0], ['la fourrière', 1]]),
      mc(P.best, ['Excusez-moi, où est-ce que je peux me garer près d’ici ?', 'Parking ?', 'Je me gare où, moi ?', 'Garer voiture.'], { fr: 'Vous cherchez une place :' }),
      culture(b('Québec winter parking', 'Le stationnement l’hiver au Québec'), b('In Québec cities, watch for **déneigement** (snow removal) signs: when the orange lights flash or signs are posted, you must move your car, or it may be towed (**remorqué**).', 'Dans les villes du Québec, attention aux panneaux de **déneigement** : quand les feux orange clignotent ou que des panneaux sont posés, il faut déplacer sa voiture, sinon elle peut être **remorquée**.'), { variant: 'culture' }),
      say('Le plein de sans plomb quatre-vingt-quinze, s’il vous plaît. Je peux payer par carte ?', 'Fill it up with unleaded ninety-five, please. Can I pay by card?'),
    ],
    [
      b('faire le plein, essence, gazole, pompe, borne de recharge.', 'faire le plein, essence, gazole, pompe, borne de recharge.'),
      b('se garer, payant / gratuit, horodateur, amende, fourrière.', 'se garer, payant / gratuit, horodateur, amende, fourrière.'),
      b('Où est-ce que je peux me garer ?', 'Où est-ce que je peux me garer ?'),
    ],
    [['une amende', b('a fine', 'somme à payer')], ['la fourrière', b('the car pound', 'où vont les voitures enlevées')], ['un jour férié', b('a public holiday', 'jour de fête')]],
  ),
  lesson(C, 3, ['road-signs-and-breakdowns', 'panneaux-et-pannes'],
    b('Road signs and breakdowns', 'Les panneaux et les pannes'),
    b('Understand common signs and explain a breakdown or an accident.', 'Comprendre les panneaux courants et expliquer une panne ou un accident.'),
    [b('Understand road signs', 'Comprendre les panneaux'), b('Explain a breakdown', 'Expliquer une panne'), b('Give your location', 'Donner sa position')],
    13,
    [
      card(b('Signs and breakdowns', 'Panneaux et pannes'), b('Signs: **Stop / Arrêt** (Québec), **Cédez le passage, Sens interdit, Sens unique, Interdit de stationner, Travaux, Déviation, Ralentir, Limite de vitesse 50**. Breakdown: **Ma voiture est en panne. · J’ai un pneu crevé. · La batterie est à plat. · Le moteur fait un bruit bizarre.** Location: **Je suis sur l’autoroute A7, direction Lyon, après la sortie 12.**', 'Panneaux : **Stop / Arrêt** (Québec), **Cédez le passage, Sens interdit, Sens unique, Interdit de stationner, Travaux, Déviation, Ralentir, Limite de vitesse 50**. Panne : **Ma voiture est en panne. · J’ai un pneu crevé. · La batterie est à plat. · Le moteur fait un bruit bizarre.** Position : **Je suis sur l’autoroute A7, direction Lyon, après la sortie 12.**')),
      pairs(P.match, [['Sens interdit', b('No entry', 'on ne peut pas entrer')], ['Cédez le passage', b('Give way', 'laissez passer les autres')], ['Déviation', b('Diversion', 'autre chemin')], ['Travaux', b('Roadworks', 'chantier sur la route')]]),
      hear('Bonjour, ma voiture est en panne sur l’autoroute A sept, direction Marseille, juste après la sortie quinze. Je crois que c’est la batterie.', b('Where is the car?', 'Où est la voiture ?'), [b('on the A7, towards Marseille, after exit 15', 'sur l’A7, direction Marseille, après la sortie 15'), b('in Marseille city centre', 'au centre de Marseille'), b('on the A15', 'sur l’A15'), b('at a petrol station', 'dans une station-service')], { voice: 'f' }),
      mc(P.best, ['Bonjour, j’ai un pneu crevé sur la route 117, au kilomètre 42, direction Mont-Tremblant.', 'Aidez-moi, la voiture !', 'Pneu. Route.', 'Je ne sais pas où je suis.'], { fr: 'Vous appelez l’assistance routière :' }),
      dict('Ma voiture est en panne : la batterie est à plat. Je suis après la sortie douze.', {}),
      say('Bonjour, ma voiture est en panne sur l’autoroute, direction Lyon, après la sortie douze.', 'Hello, my car has broken down on the motorway, towards Lyon, after exit twelve.'),
    ],
    [
      b('Signs: Stop/Arrêt, Cédez le passage, Sens interdit, Travaux, Déviation.', 'Panneaux : Stop/Arrêt, Cédez le passage, Sens interdit, Travaux, Déviation.'),
      b('Breakdown: en panne, pneu crevé, batterie à plat.', 'Panne : en panne, pneu crevé, batterie à plat.'),
      b('Location: route / autoroute, direction, sortie, kilomètre.', 'Position : route / autoroute, direction, sortie, kilomètre.'),
    ],
    [['crevé', b('flat (tyre), punctured', 'percé')], ['à plat', b('flat, dead (battery)', 'vide')], ['l’autoroute', b('the motorway', 'grande route rapide')]],
  ),
];
