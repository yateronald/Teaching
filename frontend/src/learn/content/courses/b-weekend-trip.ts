import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, doc, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Two free days, a backpack and a change of scene: planning a weekend getaway in French is all about agreeing on the vibe, comparing routes and telling the story afterwards. This A2 course teaches you to brainstorm destinations (sea, mountains, countryside, historic towns), compare train versus car travel, read itinerary options and combine imparfait and passé composé to share your trip memories.',
    'Deux jours libres, un sac et envie de changer d’air : organiser une escapade le week-end en français consiste à choisir l’ambiance, comparer les trajets et raconter son séjour au retour. Ce cours A2 vous apprend à proposer une destination (mer, montagne, campagne, ville), comparer train et voiture, lire des itinéraires et mêler imparfait et passé composé pour partager vos souvenirs.',
  ),
  outcomes: [
    b('Suggest weekend destinations and activities', 'Proposer destinations et activités pour le week-end'),
    b('Compare transport times, prices and comfort', 'Comparer durée, prix et confort des trajets'),
    b('Read itinerary comparisons and options', 'Comparer des options d’itinéraire et d’hébergement'),
    b('Tell weekend memories with imparfait and passé composé', 'Raconter son week-end avec imparfait et passé composé'),
  ],
};

const C = 'b-weekend-trip';
export default [
  lesson(C, 1, ['choosing-a-destination', 'choisir-une-destination'],
    b('Choosing a destination', 'Choisir une destination'),
    b('Suggest seaside, mountain, countryside or city breaks and agree on plans.', 'Proposer mer, montagne, campagne ou ville et se mettre d’accord sur le programme.'),
    [b('Suggest plans with Et si on… ?', 'Proposer avec Et si on… ?'), b('Express what you feel like doing', 'Dire ce dont on a envie'), b('Match activities to destinations', 'Associer activités et destinations')],
    13,
    [
      card(b('Brainstorming a getaway', 'Trouver une idée d’escapade'), b('Settings: **au bord de la mer, à la montagne, à la campagne, dans une ville historique**. Wishes: **J’ai envie de déconnecter / de me reposer / de faire une randonnée / de visiter la vieille ville.** Suggesting: **Et si on partait à… ? · Qu’est-ce qui te ferait plaisir ?**', 'Cadres : **au bord de la mer, à la montagne, à la campagne, dans une ville historique**. Envies : **J’ai envie de déconnecter / de me reposer / de faire une randonnée / de visiter la vieille ville.** Proposer : **Et si on partait à… ? · Qu’est-ce qui te ferait plaisir ?**'), {
        ex: [['Et si on partait deux jours au bord de la mer ?', 'What if we went away for two days by the sea?'], ['J’ai juste envie de marcher et de prendre l’air.', 'I just feel like walking and getting fresh air.']],
      }),
      dlg(b('Planning Saturday and Sunday', 'Organiser samedi et dimanche'), undefined, [['Léo', 'm'], ['Vous', 'f']], [
        [0, 'On a enfin un week-end libre ! Tu as envie d’aller où ?', 'We finally have a free weekend! Where do you feel like going?'],
        [1, { options: ['Et si on partait à Saint-Malo ? J’ai envie de voir la mer et de déconnecter.', 'Je suis mer, merci.', 'Non, jamais vendredi.'] }],
        [0, 'Excellente idée ! On dort à l’hôtel ou en chambre d’hôtes ?', 'Great idea! Shall we stay in a hotel or a B&B?'],
        [1, { options: ['Une petite chambre d’hôtes près du port serait parfaite.', 'Oui, les deux trains.', 'Pas de chambre, seulement un port.'] }],
      ]),
      sort(b('Sea, mountain or city?', 'Mer, montagne ou ville ?'), [b('seaside', 'mer'), b('mountains', 'montagne'), b('city break', 'ville')], [['manger des fruits de mer sur le port', 0], ['monter au sommet et dormir en refuge', 1], ['visiter le musée et flâner dans le centre', 2], ['marcher sur la plage au coucher du soleil', 0], ['suivre un sentier balisé en forêt', 1], ['boire un café sur une place animée', 2]]),
      mc(P.best, ['Et si on partait deux jours à Annecy ? C’est à moins de deux heures en train.', 'Annecy vite !', 'Je vais en vacances seul.', 'Tu pars maintenant sans moi.'], { fr: 'Vous proposez une escapade proche et facile à un ami :' }),
      gap(P.complete, 'Ce week-end, j’ai envie de prendre l’air à la ___ et de faire une belle ___.', ['campagne', 'randonnée'], { choices: [['campagne', 'mer', 'gare'], ['randonnée', 'valise', 'voiture']] }),
      say('Et si on partait au bord de la mer ce week-end ? On pourrait prendre le train tôt samedi matin.', 'What if we went to the seaside this weekend? We could catch the train early Saturday morning.'),
    ],
    [
      b('Et si on partait à… ? = What if we went to…?', 'Et si on partait à… ? = proposer une idée.'),
      b('au bord de la mer / à la montagne / à la campagne.', 'au bord de la mer / à la montagne / à la campagne.'),
      b('avoir envie de déconnecter / prendre l’air.', 'avoir envie de déconnecter / prendre l’air.'),
    ],
    [['une escapade', b('a short getaway', 'court voyage de détente')], ['déconnecter', b('to unplug, switch off', 'oublier travail et écrans')], ['flâner', b('to stroll leisurely', 'se promener sans se presser')]],
  ),
  lesson(C, 2, ['comparing-itineraries', 'comparer-les-itineraires'],
    b('Comparing itineraries', 'Comparer les itinéraires'),
    b('Weigh travel time, tolls, comfort and getting around once you arrive.', 'Comparer durée, péages, confort et déplacements une fois sur place.'),
    [b('Compare with plus / moins… que', 'Comparer avec plus / moins… que'), b('Read an itinerary comparison', 'Lire un comparatif de trajets'), b('Talk about costs and local transport', 'Parler de frais et transport sur place')],
    13,
    [
      card(b('Train or car?', 'En train ou en voiture ?'), b('Compare cleanly: **plus rapide que…, moins cher que…, aussi pratique que…** Discuss trade-offs: **En voiture, on est plus libres, mais il y a les péages et le parking. · En train, le trajet est plus reposant et arrive en centre-ville. · On louera des vélos sur place.**', 'Comparer clairement : **plus rapide que…, moins cher que…, aussi pratique que…** Peser le pour et le contre : **En voiture, on est plus libres, mais il y a les péages et le parking. · En train, le trajet est plus reposant et arrive en centre-ville. · On louera des vélos sur place.**'), {
        ex: [['Le train met deux heures contre quatre heures en voiture.', 'The train takes two hours compared to four hours by car.'], ['La chambre d’hôtes est moins chère et plus calme.', 'The B&B is cheaper and quieter.']],
      }),
      doc({ look: 'notice', title: b('Two ways to Saint-Malo', 'Deux options pour Saint-Malo'), text: 'OPTION A — Train direct\nDurée : 2 h 15 · Prix A/R : 68 € par personne\nArrivée en centre-ville, tout se fait à pied.\n\nOPTION B — Voiture\nDurée : 4 h 10 · Péage + essence : 95 € au total\nPratique pour visiter la côte le dimanche, parking payant (18 €/jour).' }, b('Which option is faster and drops you in the town centre?', 'Quelle option est plus rapide et arrive au centre-ville ?'), [b('Option A (direct train)', 'l’option A (train direct)'), b('Option B (car)', 'l’option B (voiture)'), b('both take the same time', 'les deux durent pareil'), b('neither reaches the centre', 'aucune n’arrive au centre')]),
      hear('En voiture, on met presque quatre heures avec les péages, alors que le train arrive en deux heures juste à côté de la plage. On louera plutôt des vélos sur place.', b('How will they get around once they arrive?', 'Comment se déplaceront-ils une fois sur place ?'), [b('they will rent bikes', 'ils loueront des vélos'), b('they will take a taxi everywhere', 'ils prendront le taxi partout'), b('they will rent a car at the station', 'ils loueront une voiture'), b('they will only walk inside the hotel', 'ils resteront à l’hôtel')], { voice: 'f2' }),
      ord(P.order, 'Le train est plus rapide et beaucoup plus reposant que la voiture.', { tr: 'The train is faster and much more relaxing than the car.', extra: ['cher'] }),
      pairs(P.match, [['un péage', b('a highway toll', 'paiement sur l’autoroute')], ['un hébergement', b('accommodation', 'hôtel, gîte ou chambre')], ['un trajet', b('a journey / trip', 'parcours entre deux lieux')], ['sur place', b('on site / once there', 'à l’endroit où l’on va')]]),
      dict('La chambre d’hôtes est un peu plus chère, mais le petit-déjeuner maison est compris.', { voice: 'm' }),
      say('Le train est moins fatigant que la voiture et coûte à peu près le même prix.', 'The train is less tiring than the car and costs about the same.'),
    ],
    [
      b('plus / moins / aussi + adjectif + que…', 'plus / moins / aussi + adjectif + que…'),
      b('un péage, l’essence, le parking, un trajet.', 'un péage, l’essence, le parking, un trajet.'),
      b('sur place = once there · tout se fait à pied.', 'sur place · tout se fait à pied.'),
    ],
    [['un trajet', b('a trip / journey', 'temps et chemin parcouru')], ['un péage', b('a road toll', 'poste de paiement sur l’autoroute')], ['reposant', b('relaxing, restful', 'qui permet de se reposer')]],
  ),
  lesson(C, 3, ['sharing-travel-memories', 'raconter-son-sejour'],
    b('Sharing travel memories', 'Raconter son séjour'),
    b('Combine imparfait for scenery and weather with passé composé for what you did.', 'Associer imparfait pour le décor et passé composé pour les actions.'),
    [b('Describe weather and places with imparfait', 'Décrire météo et lieux à l’imparfait'), b('Tell completed actions with passé composé', 'Raconter les actions au passé composé'), b('Write a weekend travel postcard or message', 'Écrire un message souvenir de week-end')],
    13,
    [
      card(b('Setting vs events', 'Décor et événements'), b('Use **l’imparfait** for weather, scenery and feelings: **Il faisait beau et doux. · Le village était magnifique. · Nous étions ravis.** Use **le passé composé** for what happened: **Nous sommes partis samedi matin. · Nous avons marché sur les remparts. · On a goûté les spécialités locales.**', 'Utilisez **l’imparfait** pour la météo, le décor et les impressions : **Il faisait beau et doux. · Le village était magnifique. · Nous étions ravis.** Utilisez **le passé composé** pour les actions : **Nous sommes partis samedi matin. · Nous avons marché sur les remparts. · On a goûté les spécialités locales.**'), {
        ex: [['Il faisait soleil, alors nous avons loué des vélos.', 'It was sunny, so we rented bikes.'], ['On en garde un excellent souvenir !', 'We have great memories of it!']],
      }),
      tip(b('Two past tenses, one story', 'Deux temps du passé, un seul récit'), b('Think of **l’imparfait** as the background photograph (**il faisait frais, la vue était superbe**) and **le passé composé** as the action buttons (**on est arrivés, on a visité, on a dîné**).', 'Voyez **l’imparfait** comme le décor de la photo (**il faisait frais, la vue était superbe**) et **le passé composé** comme la suite des actions (**on est arrivés, on a visité, on a dîné**).')),
      mc(P.best, ['Samedi, il faisait soleil, alors nous avons marché le long du lac et dîné au bord de l’eau.', 'Samedi, il a fait été soleil et nous marchions toujours demain.', 'Il faisait marché sur le lac et nous sommes dîné.', 'Samedi, nous avons fait beau le lac.'], { fr: 'Vous racontez votre samedi à un collègue le lundi matin :' }),
      flash(b('Quick revision', 'Révision express'), [['On s’est évadés deux jours.', b('We got away for two days.', 'courte escapade')], ['Le trajet a duré deux heures.', b('The trip lasted two hours.', 'durée passée')], ['Il faisait doux et ensoleillé.', b('It was mild and sunny.', 'météo à l’imparfait')], ['On a découvert un petit restaurant.', b('We discovered a small restaurant.', 'action au passé composé')], ['On en garde un super souvenir !', b('We have great memories of it!', 'bilan positif')]]),
      write(b('Tell your weekend', 'Racontez votre week-end'), b('Write a short message (40–65 words) to a friend about a weekend getaway: say where you went and how you travelled, describe the weather or place (imparfait), and tell two things you did (passé composé).', 'Écrivez un court message (40–65 mots) à un ami sur une escapade : dites où et comment vous êtes parti, décrivez la météo ou le lieu (imparfait), puis racontez deux activités (passé composé).'), 40, 65, [
        b('Destination and transport', 'Destination et transport'),
        b('Weather or scenery in imparfait', 'Météo ou décor à l’imparfait'),
        b('Two activities in passé composé', 'Deux activités au passé composé'),
        b('Closing impression', 'Impression finale'),
      ], 'Salut Léa ! Ce week-end, nous sommes partis à Saint-Malo en train. Le trajet a duré un peu plus de deux heures, c’était très reposant. Samedi, il faisait doux et ensoleillé : nous avons marché sur les remparts et visité le port. Dimanche, nous avons loué des vélos et mangé des crêpes. On en garde un excellent souvenir !', { phrases: ['Ce week-end, nous sommes partis…', 'Il faisait…', 'Nous avons visité…'] }),
      say('Il faisait très beau dimanche, alors on a loué des vélos et on a déjeuné face à la mer.', 'The weather was lovely on Sunday, so we rented bikes and had lunch facing the sea.'),
    ],
    [
      b('imparfait = weather, setting, feelings (il faisait beau, c’était calme).', 'imparfait = météo, décor, impressions (il faisait beau, c’était calme).'),
      b('passé composé = events and activities (on a loué, on est partis).', 'passé composé = événements et activités (on a loué, on est partis).'),
      b('On en garde un excellent souvenir !', 'On en garde un excellent souvenir !'),
    ],
    [['un souvenir', b('a memory / souvenir', 'ce qu’on garde en tête')], ['ensoleillé', b('sunny', 'avec du soleil')], ['doux', b('mild (weather)', 'ni trop chaud ni trop froid')]],
  ),
];
