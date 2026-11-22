import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Loudspeakers in train stations and airport terminals echo, clip words and deliver critical changes in seconds. Missing a platform swap or a boarding gate change can cost you a trip. This course trains your ear on authentic French rail and airport announcements so you pick out train numbers, platforms, delays, gates and connections cleanly.',
    'Dans les gares et les aéroports, les haut-parleurs résonnent, coupent les mots et annoncent des changements décisifs en quelques secondes. Manquer un changement de voie ou de porte peut faire rater un voyage. Ce cours entraîne votre oreille aux annonces ferroviaires et aéroportuaires en français pour repérer numéros, quais, retards, portes et correspondances sans hésiter.',
  ),
  outcomes: [
    b('Catch train numbers, destinations and platforms (voie / quai)', 'Saisir numéros de train, destinations et voies'),
    b('Understand delay reasons, cancellations and compensation rules', 'Comprendre motifs de retard, suppressions et échanges'),
    b('Follow airport check-in, boarding zones and gate changes', 'Suivre enregistrement, zones d’embarquement et changements de porte'),
    b('React quickly to connection and baggage announcements', 'Réagir vite aux annonces de correspondance et de bagages'),
  ],
};

const C = 'l-travel-airports';
export default [
  lesson(C, 1, ['platforms-and-train-departures', 'quais-et-departs-en-gare'],
    b('Station platforms and departures', 'Quais et départs en gare'),
    b('Catch platform numbers, coach placement and boarding calls in rail announcements.', 'Saisir numéros de voie, placement des voitures et appels au départ en gare.'),
    [b('Distinguish voie, quai and voiture', 'Distinguer voie, quai et voiture'), b('Catch train numbers and destinations', 'Repérer numéros de train et destinations'), b('Understand boarding closure alerts', 'Comprendre la fermeture de l’accès au train')],
    13,
    [
      card(b('Station announcement structure', 'Structure d’une annonce en gare'), b('French rail announcements follow a steady order: **train type & number** (**Le TGV 6204**), **destination & stops** (**à destination de Lyon, desservant…**), **departure time**, and **platform** (**partira voie G / quai 4**). Watch out: **la voiture** is your train carriage, while **la voie** is the track!', 'Les annonces en gare suivent un ordre régulier : **type et numéro** (**Le TGV 6204**), **destination et arrêts** (**à destination de Lyon, desservant…**), **heure** et **voie** (**partira voie G / quai 4**). Attention : **la voiture** est le wagon, tandis que **la voie** est le rail !'), {
        ex: [['Le TGV à destination de Bordeaux va partir voie 7.', 'The TGV to Bordeaux will depart from platform 7.'], ['Les voitures 1 à 8 se trouvent en tête de train.', 'Coaches 1 to 8 are at the front of the train.']],
      }),
      tip(b('Tête vs queue de train', 'Tête ou queue de train'), b('**En tête de train** means at the front; **en queue de train** means at the back. Wait in the right zone on the platform before the train arrives.', '**En tête de train** signifie à l’avant ; **en queue de train** signifie à l’arrière. Placez-vous dans la bonne zone sur le quai avant l’arrivée.')),
      hear('Le TGV numéro 6412 à destination de Marseille partira voie 5 à quatorze heures vingt. L’accès au quai sera fermé deux minutes avant le départ.', b('Where does the train to Marseille depart from?', 'D’où part le train pour Marseille ?'), [b('Platform 5, at 14:20', 'Voie 5, à 14 h 20'), b('Platform 14, at 12:20', 'Voie 14, à 12 h 20'), b('Platform 2, at 14:05', 'Voie 2, à 14 h 05'), b('Platform 5, at 16:12', 'Voie 5, à 16 h 12')], { voice: 'f' }),
      hear('Attention, la rame sera inversée aujourd’hui : les voitures 11 à 18 sont situées en queue de train, secteur D.', b('Where should passengers for coach 14 wait?', 'Où doivent attendre les voyageurs de la voiture 14 ?'), [b('At the back of the train, sector D', 'En queue de train, secteur D'), b('At the front of the train, sector A', 'En tête de train, secteur A'), b('In the station hall', 'Dans le hall de la gare'), b('On platform 11', 'Sur le quai 11')], { voice: 'm' }),
      sort(b('Platform location or warning?', 'Placement sur le quai ou avertissement ?'), [b('location / boarding', 'placement / embarquement'), b('warning / rule', 'avertissement / règle')], [['voie 9, secteur B', 0], ['accès fermé deux minutes avant le départ', 1], ['en tête de train', 0], ['compostez votre billet', 1], ['voiture 4 en queue de train', 0], ['attention au bord du quai', 1]], { listen: true }),
      pairs(P.match, [['à destination de', b('bound for, heading to', 'en direction de')], ['desservir', b('to stop at, serve (stations)', 's’arrêter dans une gare')], ['en tête de train', b('at the front of the train', 'à l’avant')], ['la voie', b('the track / platform', 'emplacement du train')]]),
      dict('Le train à destination de Nantes va partir voie trois.', { voice: 'f2' }),
    ],
    [
      b('la voie / le quai = platform; la voiture = train carriage.', 'la voie / le quai ; la voiture = le wagon.'),
      b('en tête = front of the train; en queue = back of the train.', 'en tête = avant ; en queue = arrière.'),
      b('desservir = to call at / stop at intermediate stations.', 'desservir = s’arrêter aux gares suivantes.'),
    ],
    [['la voie', b('track, platform', 'numéro ou lettre du quai')], ['desservir', b('to stop at (a station)', 'marquer l’arrêt à')], ['en queue de train', b('at the rear of the train', 'à l’arrière')]],
  ),
  lesson(C, 2, ['delays-cancellations-changes', 'retards-annulations-et-changements'],
    b('Delays, platform changes and cancellations', 'Retards, changements de voie et annulations'),
    b('Understand unexpected changes: track swaps, delay estimates and cancelled trains.', 'Comprendre les imprévus : changements de voie, retards annoncés et trains supprimés.'),
    [b('Catch sudden platform changes', 'Saisir les changements de voie'), b('Understand delay durations and causes', 'Comprendre durées et causes de retard'), b('Follow cancellation and rebooking instructions', 'Suivre les consignes en cas de suppression')],
    13,
    [
      card(b('When plans change', 'Quand le programme change'), b('Listen for alert openings: **Modification de voie** (platform change), **Suite à un incident technique** (due to a technical issue), **Retard estimé à vingt minutes** (estimated 20-minute delay), **Ce train est supprimé** (this train is cancelled), **Veuillez vous reporter sur…** (please transfer onto…).', 'Repérez les débuts d’alerte : **Modification de voie**, **Suite à un incident technique**, **Retard estimé à vingt minutes**, **Ce train est supprimé**, **Veuillez vous reporter sur…**.'), {
        ex: [['Changement de quai : le train partira finalement voie 12.', 'Platform change: the train will finally leave from track 12.'], ['Le départ est retardé d’environ trente minutes.', 'Departure is delayed by about thirty minutes.']],
      }),
      hear('Attention, modification de dernière minute : le train pour Lille initialement prévu voie 4 partira finalement voie 11.', b('What changed for the Lille train?', 'Qu’est-ce qui a changé pour le train de Lille ?'), [b('Its platform moved from 4 to 11', 'Sa voie est passée de la 4 à la 11'), b('It was cancelled', 'Il a été supprimé'), b('It leaves four minutes earlier', 'Il part quatre minutes plus tôt'), b('It goes to Lyon instead', 'Il va finalement à Lyon')], { voice: 'm2' }),
      hear('Suite à un défaut de signalisation, le train de dix heures quinze accuse un retard estimé à quarante minutes.', b('How late is the 10:15 train?', 'Quel est le retard du train de 10 h 15 ?'), [b('Around 40 minutes', 'Environ 40 minutes'), b('Around 15 minutes', 'Environ 15 minutes'), b('Around 10 minutes', 'Environ 10 minutes'), b('It is on time', 'Il est à l’heure')], { voice: 'f2' }),
      hear('Votre train étant supprimé, vos billets restent valables sur le prochain départ sans frais supplémentaires. Présentez-vous au guichet pour un échange.', b('What can passengers do?', 'Que peuvent faire les voyageurs ?'), [b('Take the next train at no extra cost or exchange at the counter', 'Prendre le prochain train sans frais ou échanger au guichet'), b('Buy a brand-new ticket online only', 'Acheter un nouveau billet en ligne uniquement'), b('Wait until tomorrow morning', 'Attendre demain matin'), b('Claim a hotel voucher at gate 4', 'Demander un bon d’hôtel porte 4')], { voice: 'm' }),
      mc(P.meaning, [b('The train is running 25 minutes late.', 'Le train a 25 minutes de retard.'), b('The train leaves 25 minutes early.', 'Le train part 25 minutes en avance.'), b('The train stops for 25 minutes.', 'Le train s’arrête 25 minutes.'), b('The ticket costs 25 euros.', 'Le billet coûte 25 euros.')], { fr: '« Le train accuse un retard de vingt-cinq minutes. »' }),
      pairs(P.match, [['supprimé', b('cancelled', 'annulé')], ['suite à', b('following, due to', 'à cause de')], ['se reporter sur', b('to transfer onto (another service)', 'prendre un autre train')], ['sans frais', b('at no extra charge', 'gratuitement')]]),
      dict('Suite à un incident technique, le train partira finalement voie onze.', { voice: 'f' }),
    ],
    [
      b('Modification de voie / finalement voie X = last-minute platform swap.', 'Modification de voie / finalement voie X = changement de quai.'),
      b('accuser un retard de… = to be delayed by…', 'accuser un retard de… = avoir un retard de…'),
      b('supprimé = cancelled; se reporter sur = take the replacement train.', 'supprimé = annulé ; se reporter sur = prendre un autre train.'),
    ],
    [['supprimé', b('cancelled (transport)', 'annulé pour un train ou un vol')], ['un guichet', b('a ticket counter', 'comptoir d’accueil')], ['un échange', b('an exchange', 'remplacement d’un billet')]],
  ),
  lesson(C, 3, ['airport-gates-and-connections', 'aeroport-portes-et-correspondances'],
    b('Boarding gates and connections', 'Portes d’embarquement et correspondances'),
    b('Navigate check-in, security, boarding zones and flight connections.', 'Suivre les annonces d’enregistrement, d’embarquement, de correspondance et de bagages.'),
    [b('Follow boarding calls and zones', 'Suivre les appels et zones d’embarquement'), b('Understand connection and gate-change alerts', 'Comprendre correspondances et changements de porte'), b('Catch baggage-claim instructions', 'Saisir les indications de livraison des bagages')],
    13,
    [
      card(b('Airport announcements', 'Annonces à l’aéroport'), b('Key airport terms: **le comptoir d’enregistrement** (check-in desk), **la porte d’embarquement** (boarding gate), **embarquement immédiat** (immediate boarding), **dernier appel** (final call), **en correspondance** (connecting passengers), **le tapis bagages** (baggage carousel).', 'Mots clés à l’aéroport : **le comptoir d’enregistrement**, **la porte d’embarquement**, **embarquement immédiat**, **dernier appel**, **en correspondance**, **le tapis bagages**.'), {
        ex: [['Dernier appel pour les passagers du vol AF 342, porte B18.', 'Final call for flight AF 342 passengers, gate B18.'], ['Vos bagages seront livrés sur le tapis numéro 4.', 'Your bags will arrive on carousel number 4.']],
      }),
      hear('Mesdames et messieurs, l’embarquement du vol à destination de Montréal va commencer porte K14. Les passagers de la zone 1 sont invités à se présenter.', b('Who should go to gate K14 now?', 'Qui doit se présenter porte K14 maintenant ?'), [b('Passengers in boarding zone 1', 'Les passagers de la zone 1'), b('All passengers for Paris', 'Tous les passagers pour Paris'), b('Only passengers with heavy bags', 'Uniquement les bagages lourds'), b('Crew members only', 'Uniquement l’équipage')], { voice: 'f' }),
      hear('Attention : changement de porte pour le vol vers Genève. L’embarquement aura lieu porte F22, au terminal 2.', b('What should passengers for Geneva do?', 'Que doivent faire les passagers pour Genève ?'), [b('Go to gate F22 in terminal 2', 'Aller à la porte F22, terminal 2'), b('Wait at the check-in desk', 'Attendre au comptoir d’enregistrement'), b('Collect their luggage', 'Récupérer leurs bagages'), b('Rebook for tomorrow', 'Reprendre un billet pour demain')], { voice: 'm' }),
      dlg(b('At the transfer desk', 'Au comptoir des correspondances'), b('Your incoming flight arrived late and you ask about your connection.', 'Votre premier vol est arrivé en retard ; vous demandez pour votre correspondance.'), [['Agente', 'f2'], ['Vous', 'm']], [
        [0, 'Bonjour, vous êtes en correspondance pour Toulouse ?', 'Hello, are you connecting to Toulouse?'],
        [1, 'Oui, mon vol de Bruxelles vient d’atterrir avec vingt minutes de retard.', 'Yes, my flight from Brussels just landed twenty minutes late.'],
        [0, { options: ['Ne vous inquiétez pas, l’embarquement est encore ouvert porte A8.', 'Votre valise est déjà à Bruxelles.', 'Il faut atterrir à Toulouse hier.'] }],
        [1, 'Super ! Mes bagages suivent automatiquement ?', 'Great! Does my luggage transfer automatically?'],
        [0, { options: ['Oui, votre valise est enregistrée jusqu’à Toulouse.', 'Non, achetez un autre billet.', 'Attendez sur le tapis quatre.'] }],
      ]),
      sort(b('Before takeoff or after landing?', 'Avant le décollage ou après l’atterrissage ?'), [b('before takeoff', 'avant le décollage'), b('after landing', 'après l’atterrissage')], [['comptoir d’enregistrement', 0], ['tapis bagages numéro trois', 1], ['dernier appel en porte', 0], ['contrôle des passeports à l’arrivée', 1], ['contrôle de sûreté', 0], ['sortie vers les taxis', 1]], { listen: true }),
      pairs(P.match, [['l’embarquement', b('boarding', 'montée dans l’avion')], ['une correspondance', b('a connection / transfer', 'vol ou train suivant')], ['le tapis bagages', b('baggage carousel', 'tapis roulant des valises')], ['le dernier appel', b('the final call', 'ultime annonce avant fermeture')]]),
      dict('Dernier appel pour les passagers en correspondance, porte B12.', { voice: 'm2' }),
    ],
    [
      b('porte d’embarquement = boarding gate; dernier appel = final call.', 'porte d’embarquement ; dernier appel.'),
      b('en correspondance = connecting / transferring passengers.', 'en correspondance = passagers qui changent d’avion ou de train.'),
      b('tapis bagages = baggage claim belt.', 'tapis bagages = tapis roulant à l’arrivée.'),
    ],
    [['l’enregistrement', b('check-in', 'dépôt des bagages et carte d’accès')], ['une correspondance', b('a flight or train connection', 'changement de transport')], ['atterrir', b('to land', 'toucher le sol pour un avion')]],
  ),
];
