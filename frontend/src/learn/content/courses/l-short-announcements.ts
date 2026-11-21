import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Attention, departure, platform change, the shop closes in ten minutes, the school is closed tomorrow: public announcements are short, fast and often noisy. This course trains you to catch the one piece of information that matters (a platform, a time, an instruction) in station, airport, shop and school announcements, with the vocabulary that keeps coming back.',
    'Votre attention, départ, changement de quai, le magasin ferme dans dix minutes, l’école est fermée demain : les annonces publiques sont courtes, rapides et souvent bruyantes. Ce cours vous entraîne à saisir l’information qui compte (un quai, une heure, une consigne) dans les annonces de gare, d’aéroport, de magasin et d’école, avec le vocabulaire qui revient sans cesse.',
  ),
  outcomes: [
    b('Understand station and airport announcements', 'Comprendre les annonces de gare et d’aéroport'),
    b('Understand shop and public-place announcements', 'Comprendre les annonces de magasin et de lieux publics'),
    b('Catch the key information in one listening', 'Saisir l’information clé en une écoute'),
    b('Know the recurring vocabulary', 'Connaître le vocabulaire récurrent'),
  ],
};

const C = 'l-short-announcements';
export default [
  lesson(C, 1, ['station-announcements', 'annonces-en-gare'],
    b('Station and airport announcements', 'Annonces en gare et à l’aéroport'),
    b('Catch platforms, gates, delays and destinations.', 'Saisir les quais, les portes, les retards et les destinations.'),
    [b('Hear a platform or a gate number', 'Entendre un numéro de quai ou de porte'), b('Understand a delay or a cancellation', 'Comprendre un retard ou une annulation'), b('Know the key vocabulary', 'Connaître le vocabulaire clé')],
    13,
    [
      card(b('Announcement vocabulary', 'Le vocabulaire des annonces'), b('**à destination de** (to), **en provenance de** (from), **le quai / la voie** (platform), **la porte** (gate), **un retard de… minutes** (a delay), **supprimé / annulé** (cancelled), **l’embarquement** (boarding).', '**à destination de**, **en provenance de**, **le quai / la voie**, **la porte**, **un retard de… minutes**, **supprimé / annulé**, **l’embarquement**.')),
      tip(b('Prepare your question', 'Préparez votre question'), b('Before listening, know **what you need**: your destination, your train number. Then listen only for that.', 'Avant d’écouter, sachez **ce que vous cherchez** : votre destination, votre numéro de train. Puis n’écoutez que cela.')),
      hear('Le train à destination de Québec partira de la voie trois.', b('From which platform does the Québec train leave?', 'De quelle voie part le train pour Québec ?'), ['3', '13', '2', '6']),
      hear('Le vol AC 870 à destination de Paris est retardé de quarante minutes.', b('What happens to the Paris flight?', 'Que se passe-t-il pour le vol de Paris ?'), [b('It is 40 minutes late.', 'Il a 40 minutes de retard.'), b('It is cancelled.', 'Il est annulé.'), b('It leaves from gate 40.', 'Il part de la porte 40.'), b('It is on time.', 'Il est à l’heure.')]),
      hear('Embarquement immédiat, porte douze, pour les passagers du vol à destination de Toronto.', b('Where must Toronto passengers go?', 'Où doivent aller les passagers pour Toronto ?'), [b('Gate 12, now', 'Porte 12, maintenant'), b('Gate 2, later', 'Porte 2, plus tard'), b('Platform 12', 'Quai 12'), b('Baggage claim', 'Récupération des bagages')]),
      hear('En raison d’un incident technique, le train de dix-sept heures dix est supprimé.', b('What happened to the 17:10 train?', 'Qu’est-il arrivé au train de 17 h 10 ?'), [b('It is cancelled.', 'Il est supprimé.'), b('It is late.', 'Il est en retard.'), b('It leaves earlier.', 'Il part plus tôt.'), b('It changes platform.', 'Il change de voie.')]),
      pairs(P.match, [['à destination de', b('to, bound for', 'vers')], ['en provenance de', b('from', 'qui vient de')], ['supprimé', b('cancelled', 'annulé')], ['l’embarquement', b('boarding', 'montée à bord')]]),
      dict('Le train à destination de Montréal partira de la voie deux.', { voice: 'f' }),
    ],
    [
      b('à destination de (to) ≠ en provenance de (from).', 'à destination de ≠ en provenance de.'),
      b('voie / quai = platform; porte = gate.', 'voie / quai ; porte.'),
      b('retardé, supprimé, embarquement immédiat.', 'retardé, supprimé, embarquement immédiat.'),
    ],
    [['un passager', b('a passenger', 'personne qui voyage')], ['un incident technique', b('a technical problem', 'panne')], ['une voie', b('a track, platform', 'quai')]],
  ),
  lesson(C, 2, ['shop-and-public-places', 'magasins-et-lieux-publics'],
    b('Shops and public places', 'Magasins et lieux publics'),
    b('Understand closing times, promotions and instructions in public places.', 'Comprendre les heures de fermeture, les promotions et les consignes dans les lieux publics.'),
    [b('Understand closing announcements', 'Comprendre les annonces de fermeture'), b('Understand a promotion', 'Comprendre une promotion'), b('Understand an instruction', 'Comprendre une consigne')],
    13,
    [
      card(b('Typical phrases', 'Formules typiques'), b('**Chers clients** (dear customers), **notre magasin fermera ses portes dans…**, **profitez de…** (take advantage of), **au rayon…** (in the … section), **veuillez vous diriger vers…** (please go to…).', '**Chers clients**, **notre magasin fermera ses portes dans…**, **profitez de…**, **au rayon…**, **veuillez vous diriger vers…**.')),
      hear('Chers clients, notre magasin fermera ses portes dans quinze minutes. Merci de vous diriger vers les caisses.', b('What must customers do?', 'Que doivent faire les clients ?'), [b('Go to the checkouts: the shop closes in 15 minutes.', 'Aller aux caisses : le magasin ferme dans 15 minutes.'), b('Leave immediately.', 'Partir immédiatement.'), b('Come back in 15 minutes.', 'Revenir dans 15 minutes.'), b('Go to the bakery.', 'Aller à la boulangerie.')]),
      hear('Profitez aujourd’hui de deux pour un sur tous les jus de fruits, au rayon des boissons.', b('What is the offer?', 'Quelle est l’offre ?'), [b('Two fruit juices for the price of one', 'Deux jus de fruits pour le prix d’un'), b('Free water', 'De l’eau gratuite'), b('20% off drinks', '20 % de rabais sur les boissons'), b('Juice tomorrow', 'Du jus demain')]),
      hear('La piscine sera fermée samedi pour l’entretien annuel. Les cours reprendront lundi.', b('When does the pool reopen for classes?', 'Quand la piscine rouvre-t-elle pour les cours ?'), [b('On Monday', 'Lundi'), b('On Saturday', 'Samedi'), b('Next year', 'L’an prochain'), b('Tomorrow', 'Demain')]),
      hear('Le propriétaire du véhicule gris stationné devant la sortie est prié de le déplacer.', b('What is asked?', 'Que demande-t-on ?'), [b('The owner of the grey car must move it.', 'Le propriétaire de la voiture grise doit la déplacer.'), b('Everyone must leave.', 'Tout le monde doit sortir.'), b('The exit is closed.', 'La sortie est fermée.'), b('Parking is free.', 'Le stationnement est gratuit.')]),
      pairs(P.match, [['les caisses', b('the checkouts', 'endroit où l’on paie')], ['le rayon', b('the section, aisle', 'partie du magasin')], ['l’entretien', b('maintenance', 'réparations régulières')], ['être prié de', b('to be requested to', 'devoir poliment')]]),
      dict('Notre magasin fermera ses portes dans dix minutes.', { voice: 'm' }),
    ],
    [
      b('Chers clients, … fermera ses portes dans… minutes.', 'Chers clients, … fermera ses portes dans… minutes.'),
      b('Profitez de… = special offer; au rayon… = in the section.', 'Profitez de… = promotion ; au rayon… = dans la section.'),
      b('est prié de = is requested to.', 'est prié de = doit, poliment.'),
    ],
    [['profiter de', b('to take advantage of', 'bénéficier de')], ['reprendre', b('to resume', 'recommencer')], ['déplacer', b('to move', 'changer de place')]],
  ),
  lesson(C, 3, ['school-and-city-messages', 'messages-ecole-et-ville'],
    b('School and city messages', 'Messages de l’école et de la ville'),
    b('Understand recorded messages from schools, clinics and city services.', 'Comprendre les messages enregistrés des écoles, cliniques et services municipaux.'),
    [b('Understand a school closure message', 'Comprendre un message de fermeture d’école'), b('Understand a recorded menu', 'Comprendre un menu vocal'), b('Find the instruction to follow', 'Repérer la consigne à suivre')],
    13,
    [
      card(b('Recorded menus', 'Les menus vocaux'), b('Phone menus: **pour…, faites le 1** (for…, press 1), **restez en ligne** (stay on the line), **tous nos agents sont occupés** (all our agents are busy), **votre appel est important pour nous**.', 'Menus téléphoniques : **pour…, faites le 1**, **restez en ligne**, **tous nos agents sont occupés**, **votre appel est important pour nous**.')),
      hear('En raison de la tempête, toutes les écoles du centre de services scolaire seront fermées demain.', b('What is the message?', 'Quel est le message ?'), [b('Schools are closed tomorrow because of the storm.', 'Les écoles sont fermées demain à cause de la tempête.'), b('Schools open late tomorrow.', 'Les écoles ouvrent en retard demain.'), b('There is a storm today only.', 'Il y a une tempête aujourd’hui seulement.'), b('Buses are free.', 'Les autobus sont gratuits.')]),
      hear('Pour prendre un rendez-vous, faites le un. Pour annuler un rendez-vous, faites le deux.', b('You want to cancel. Which key?', 'Vous voulez annuler. Quelle touche ?'), ['2', '1', '3', '0']),
      hear('Tous nos agents sont occupés. Votre temps d’attente est estimé à huit minutes.', b('How long will you wait?', 'Combien de temps allez-vous attendre ?'), [b('About 8 minutes', 'Environ 8 minutes'), b('18 minutes', '18 minutes'), b('No waiting', 'Pas d’attente'), b('8 hours', '8 heures')]),
      hear('La collecte des ordures est reportée au jeudi en raison du jour férié.', b('When will rubbish be collected?', 'Quand les ordures seront-elles ramassées ?'), [b('On Thursday', 'Jeudi'), b('Today', 'Aujourd’hui'), b('Next week', 'La semaine prochaine'), b('On the holiday', 'Le jour férié')]),
      pairs(P.match, [['faites le 1', b('press 1', 'appuyez sur 1')], ['restez en ligne', b('stay on the line', 'ne raccrochez pas')], ['le temps d’attente', b('the waiting time', 'durée avant de répondre')], ['un jour férié', b('a public holiday', 'jour de fête légale')]]),
      dict('Pour parler à un agent, restez en ligne.', { voice: 'f' }),
    ],
    [
      b('Phone menus: faites le 1, restez en ligne, nos agents sont occupés.', 'Menus vocaux : faites le 1, restez en ligne, nos agents sont occupés.'),
      b('Closures: en raison de… seront fermées.', 'Fermetures : en raison de… seront fermées.'),
      b('reporté au… = postponed to…', 'reporté au… = remis au…'),
    ],
    [['un agent', b('an agent, representative', 'employé qui répond')], ['les ordures', b('rubbish, garbage', 'déchets')], ['annuler', b('to cancel', 'supprimer')]],
  ),
];
