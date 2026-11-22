import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Museums, tourist offices and city festivals hand you leaflets packed with times, prices, floor symbols and booking rules. At A1, you do not need to read every line: you only need to locate the right detail fast. This course trains you to scan tourist brochures and museum guides across France and Québec—opening hours, reduced rates, floor plans and event programmes—so you can plan any visit confidently.',
    'Musées, offices de tourisme et festivals distribuent des dépliants remplis d’horaires, de tarifs, de plans et de règles de réservation. Au niveau A1, inutile de tout lire : il suffit de repérer vite la bonne information. Ce cours vous entraîne sur des brochures touristiques et guides de musées de France et du Québec — horaires, tarifs réduits, plans des étages et programmes — pour préparer chaque visite avec assurance.',
  ),
  outcomes: [
    b('Scan opening days, hours and last-entry rules', 'Repérer jours d’ouverture, horaires et dernière entrée'),
    b('Compare full, reduced and free ticket prices', 'Comparer plein tarif, tarif réduit et gratuité'),
    b('Read a museum floor plan and visitor symbols', 'Lire un plan de musée et les symboles pratiques'),
    b('Spot dates, venues and booking rules in event guides', 'Trouver dates, lieux et réservations dans un programme'),
  ],
};

const MUSEUM_HOURS: Doc = { look: 'notice', title: b('Museum brochure', 'Brochure du musée'), text: 'MUSÉE DES BEAUX-ARTS — LYON\n\nMercredi – lundi | 10 h – 18 h\nVendredi (nocturne) | 10 h – 21 h\nMardi | fermé\n\nDernière entrée 30 min avant la fermeture.\n\nTarif plein | 12 €\nTarif réduit (étudiants, seniors) | 7 €\nMoins de 18 ans | gratuit\nGratuit pour tous le 1er dimanche du mois.' };
const FLOOR_PLAN: Doc = { look: 'notice', title: b('Floor guide', 'Plan des salles'), text: 'MUSÉE DE LA CIVILISATION\n\nSous-sol | Vestiaires gratuits, toilettes, consigne\nRez-de-chaussée | Accueil, billetterie, boutique, café\n1er étage | Expositions permanentes (Histoire locale)\n2e étage | Exposition temporaire « Fleuves »\n\nAscenseur et accès fauteuil roulant à tous les étages.\nPhotos sans flash autorisées. Sacs à dos interdits en salle.' };
const FESTIVAL: Doc = { look: 'article', title: b('City events leaflet', 'Dépliant des sorties'), text: 'PRINTEMPS DE LA VILLE — PROGRAMME\n\n• Visite guidée du Vieux-Port | Samedi 14 h · 8 € · Départ : Office de tourisme (réservation obligatoire)\n• Concert en plein air | Samedi 20 h 30 · Place Royale · Gratuit, sans réservation\n• Atelier famille « Peinture sur verre » | Dimanche 10 h 30 · Musée d’Art · 5 € / enfant (places limitées)\n\nEn cas de pluie, le concert a lieu sous la grande halle.' };

const C = 'r-city-brochures';
export default [
  lesson(C, 1, ['museum-hours-and-tickets', 'horaires-et-tarifs-musees'],
    b('Opening hours and ticket prices', 'Horaires d’ouverture et tarifs'),
    b('Scan days, closing times, reduced fares and free-entry rules in a brochure.', 'Repérer jours, heures de fermeture, tarifs réduits et gratuité dans une brochure.'),
    [b('Spot the closed day and late opening', 'Repérer le jour de fermeture et la nocturne'), b('Distinguish plein tarif, tarif réduit and gratuit', 'Distinguer plein tarif, tarif réduit et gratuit'), b('Read last-entry notes', 'Lire la mention dernière entrée')],
    13,
    [
      tip(b('Do not read word for word', 'Ne lisez pas mot à mot'), b('In a brochure, read the question first, then jump straight to numbers (**10 h – 18 h**, **12 €**) or key words (**fermé**, **gratuit**, **tarif réduit**). Note: many museums in France are **closed on Tuesday** (mardi) or Monday.', 'Dans une brochure, lisez d’abord la question, puis cherchez directement les chiffres (**10 h – 18 h**, **12 €**) ou les mots clés (**fermé**, **gratuit**, **tarif réduit**). En France, beaucoup de musées ferment le **mardi** ou le lundi.')),
      card(b('Ticket words', 'Les mots de la billetterie'), b('**Tarif plein** = full price · **Tarif réduit** = reduced price (students, seniors) · **Gratuit** = free · **Nocturne** = late-evening opening · **Dernière entrée** = last admission.', '**Tarif plein** · **Tarif réduit** (étudiants, seniors) · **Gratuit** · **Nocturne** (ouverture tardive le soir) · **Dernière entrée**.')),
      doc(MUSEUM_HOURS, b('Which day is the museum closed?', 'Quel jour le musée est-il fermé ?'), [b('Tuesday', 'Le mardi'), b('Monday', 'Le lundi'), b('Sunday', 'Le dimanche'), b('Friday', 'Le vendredi')]),
      doc(MUSEUM_HOURS, b('On Friday, when is the latest time you can enter?', 'Le vendredi, jusqu’à quelle heure peut-on entrer ?'), ['20 h 30', '21 h', '17 h 30', '18 h']),
      doc(MUSEUM_HOURS, b('How much does a 15-year-old student pay on Wednesday?', 'Combien paie un élève de 15 ans le mercredi ?'), [b('Nothing, it is free', 'Rien, c’est gratuit'), b('7 euros', '7 euros'), b('12 euros', '12 euros'), b('5 euros', '5 euros')]),
      pairs(P.match, [['le tarif plein', b('full price', 'prix normal')], ['le tarif réduit', b('reduced price', 'prix moins cher')], ['une nocturne', b('late-evening opening', 'ouverture le soir')], ['la billetterie', b('ticket office', 'guichet des billets')]]),
      gap(P.complete, 'Le musée est ___ le mardi, mais il est ouvert en ___ le vendredi jusqu’à 21 h.', ['fermé', 'nocturne'], { choices: [['fermé', 'ouvert'], ['nocturne', 'gratuit']] }),
      dict('Le musée est gratuit pour les moins de dix-huit ans.', { voice: 'f' }),
    ],
    [
      b('Scan numbers and key words: fermé, gratuit, tarif réduit.', 'Cherchez chiffres et mots clés : fermé, gratuit, tarif réduit.'),
      b('Nocturne = late evening opening; dernière entrée = last entry.', 'Nocturne = ouverture le soir ; dernière entrée = heure limite d’accès.'),
      b('Many French museums close on Tuesday (mardi).', 'Beaucoup de musées français ferment le mardi.'),
    ],
    [['la brochure', b('the brochure, leaflet', 'petit document d’information')], ['gratuit', b('free of charge', 'qui ne coûte rien')], ['la fermeture', b('closing time', 'heure où l’on ferme')]],
  ),
  lesson(C, 2, ['floor-plans-and-galleries', 'plans-et-galeries'],
    b('Floor plans and museum rooms', 'Plans des salles et services'),
    b('Find galleries, lockers, lifts and visitor rules on a museum plan.', 'Trouver salles, vestiaires, ascenseurs et règles de visite sur un plan.'),
    [b('Read floor names: sous-sol, rez-de-chaussée, étage', 'Lire les niveaux : sous-sol, rez-de-chaussée, étage'), b('Find cloakrooms, shop and café', 'Trouver vestiaires, boutique et café'), b('Understand photo and bag rules', 'Comprendre les règles pour photos et sacs')],
    13,
    [
      card(b('Floors in French', 'Les niveaux d’un bâtiment'), b('**Le sous-sol** = basement · **Le rez-de-chaussée** = ground floor · **Le 1er étage** = first floor (one flight up) · **L’exposition permanente** = permanent collection · **L’exposition temporaire** = temporary exhibition · **Le vestiaire / la consigne** = cloakroom / lockers.', '**Le sous-sol** · **Le rez-de-chaussée** · **Le 1er étage** · **L’exposition permanente** · **L’exposition temporaire** · **Le vestiaire / la consigne**.')),
      doc(FLOOR_PLAN, b('Where do you buy your ticket?', 'Où achète-t-on son billet ?'), [b('On the ground floor', 'Au rez-de-chaussée'), b('In the basement', 'Au sous-sol'), b('On the 1st floor', 'Au 1er étage'), b('On the 2nd floor', 'Au 2e étage')]),
      doc(FLOOR_PLAN, b('Where is the temporary exhibition « Fleuves »?', 'Où se trouve l’exposition temporaire « Fleuves » ?'), [b('On the 2nd floor', 'Au 2e étage'), b('On the 1st floor', 'Au 1er étage'), b('On the ground floor', 'Au rez-de-chaussée'), b('In the basement', 'Au sous-sol')]),
      doc(FLOOR_PLAN, b('You have a backpack and a camera. What must you do?', 'Vous avez un sac à dos et un appareil photo. Que devez-vous faire ?'), [b('Leave your bag at the cloakroom and take photos without flash.', 'Laisser le sac au vestiaire et photographier sans flash.'), b('Keep your backpack and use the flash.', 'Garder le sac à dos et utiliser le flash.'), b('Leave your camera at the shop.', 'Laisser l’appareil à la boutique.'), b('Use the stairs only.', 'Prendre seulement l’escalier.')]),
      sort(b('Service or exhibition?', 'Service pratique ou exposition ?'), [b('visitor service', 'service pratique'), b('exhibition', 'exposition')], [['les vestiaires', 0], ['la billetterie', 0], ['l’exposition permanente', 1], ['les toilettes', 0], ['l’exposition temporaire', 1], ['la consigne', 0]]),
      mc(P.meaning, [b('wheelchair access', 'accès pour fauteuil roulant'), b('stairs only', 'escaliers uniquement'), b('free bicycle parking', 'garage à vélos gratuit'), b('staff entrance', 'entrée du personnel')], { fr: 'accès fauteuil roulant' }),
      say('Excusez-moi, où se trouvent les vestiaires et l’exposition temporaire ?', 'Excuse me, where are the cloakroom and the temporary exhibition?'),
    ],
    [
      b('Sous-sol (basement), rez-de-chaussée (ground floor), 1er étage (1st floor).', 'Sous-sol, rez-de-chaussée, 1er étage.'),
      b('Permanente = always there; temporaire = for a limited time.', 'Permanente = toute l’année ; temporaire = pour une durée limitée.'),
      b('Vestiaire / consigne = cloakroom / lockers; sans flash = without flash.', 'Vestiaire / consigne = dépôt des sacs ; sans flash = sans lumière.'),
    ],
    [['le vestiaire', b('the cloakroom', 'endroit pour laisser manteaux et sacs')], ['le rez-de-chaussée', b('the ground floor', 'niveau de la rue')], ['interdit', b('forbidden', 'pas autorisé')]],
  ),
  lesson(C, 3, ['festivals-and-highlights', 'festivals-et-temps-forts'],
    b('Event guides and city highlights', 'Programmes culturels et sorties'),
    b('Find times, departure points and booking conditions in a festival leaflet.', 'Trouver horaires, points de départ et conditions de réservation dans un programme.'),
    [b('Distinguish events with or without booking', 'Distinguer avec ou sans réservation'), b('Find departure points and venues', 'Repérer lieu et point de départ'), b('Understand weather backup plans', 'Comprendre les solutions en cas de pluie')],
    13,
    [
      card(b('Reading an event flyer', 'Lire un programme d’événements'), b('Look for four details per event: **date & time**, **price** (gratuit / payant), **place** (lieu / point de départ), and **booking** (**réservation obligatoire** / **sur inscription** / **sans réservation** / **places limitées**).', 'Cherchez quatre détails par activité : **jour et heure**, **prix** (gratuit / payant), **lieu** (point de départ), et **inscription** (**réservation obligatoire** / **sur inscription** / **sans réservation** / **places limitées**).')),
      doc(FESTIVAL, b('Which activity requires booking in advance?', 'Quelle activité demande une réservation obligatoire ?'), [b('The guided tour of the Vieux-Port', 'La visite guidée du Vieux-Port'), b('The outdoor concert', 'Le concert en plein air'), b('None of them', 'Aucune des trois'), b('Visiting the tourist office', 'Visiter l’office de tourisme')]),
      doc(FESTIVAL, b('Where do you meet for the guided tour?', 'Où est le rendez-vous pour la visite guidée ?'), [b('At the tourist office', 'À l’office de tourisme'), b('At Place Royale', 'Place Royale'), b('At the Art Museum', 'Au Musée d’Art'), b('Under the market hall', 'Sous la grande halle')]),
      doc(FESTIVAL, b('What happens if it rains on Saturday evening?', 'Que se passe-t-il s’il pleut samedi soir ?'), [b('The concert moves under the covered hall.', 'Le concert a lieu sous la grande halle.'), b('The concert is cancelled.', 'Le concert est annulé.'), b('The concert starts on Sunday.', 'Le concert a lieu dimanche.'), b('You need to buy a ticket.', 'Il faut acheter un billet.')]),
      pairs(P.match, [['en plein air', b('outdoors', 'dehors')], ['réservation obligatoire', b('booking required', 'il faut réserver avant')], ['places limitées', b('limited spaces', 'peu de places disponibles')], ['en cas de pluie', b('in case of rain', 's’il pleut')]]),
      gap(P.complete, 'Le concert est ___ et ___ réservation, samedi à 20 h 30.', ['gratuit', 'sans']),
      mc(P.best, ['Est-ce qu’il reste des places pour la visite guidée de samedi ?', 'Où est le soleil ?', 'Je veux acheter le musée.', 'Pourquoi vous êtes fermés ?'], { fr: 'À l’office de tourisme, vous demandez :' }),
      dict('La visite guidée part samedi à quatorze heures de l’office de tourisme.', { voice: 'm' }),
    ],
    [
      b('Check: date, price, place, and booking (obligatoire / sans réservation).', 'Vérifiez : date, prix, lieu et réservation (obligatoire / sans réservation).'),
      b('En plein air = outdoors; sous la halle = under the covered hall.', 'En plein air = dehors ; sous la halle = à l’abri.'),
      b('Places limitées = limited spots, book early.', 'Places limitées = réservez tôt.'),
    ],
    [['une visite guidée', b('a guided tour', 'visite avec un guide')], ['un atelier', b('a workshop', 'séance pratique')], ['la réservation', b('the booking', 'action de réserver')]],
  ),
];
