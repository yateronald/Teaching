import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A restaurant menu, a bus timetable, a classified ad for an apartment: these documents are dense with information and abbreviations. This course teaches you to read them strategically, find a price, a time or a condition, understand the abbreviations of ads (4 ½, chauff. incl., libre le 1er juillet) and avoid the traps (taxes en sus, sauf le dimanche).',
    'Un menu de restaurant, un horaire d’autobus, une petite annonce de logement : ces documents sont denses en informations et en abréviations. Ce cours vous apprend à les lire de façon stratégique, à trouver un prix, une heure ou une condition, à comprendre les abréviations des annonces (4 ½, chauff. incl., libre le 1er juillet) et à éviter les pièges (taxes en sus, sauf le dimanche).',
  ),
  outcomes: [
    b('Read a menu and find prices', 'Lire un menu et trouver les prix'),
    b('Read a timetable and its exceptions', 'Lire un horaire et ses exceptions'),
    b('Understand classified ads and their abbreviations', 'Comprendre les petites annonces et leurs abréviations'),
    b('Spot conditions and hidden costs', 'Repérer les conditions et les coûts cachés'),
  ],
};

const MENU: Doc = { look: 'menu', title: b('A bistro menu', 'Le menu d’un bistro'), text: 'BISTRO DU COIN – Menu du midi\n\nEntrées\nSoupe du jour | 6 $\nSalade César | 9 $\n\nPlats\nSteak-frites | 24 $\nPoisson du marché, légumes | 22 $\nRisotto aux champignons (végétarien) | 19 $\n\nDessert du jour | 7 $\nTable d’hôte (entrée + plat + café) : prix du plat + 8 $\nTaxes en sus' };
const BUS: Doc = { look: 'notice', title: b('Bus timetable – line 55', 'Horaire d’autobus – ligne 55'), text: 'Direction centre-ville\n\nLundi au vendredi | toutes les 10 min de 6 h à 20 h, puis toutes les 30 min jusqu’à minuit\nSamedi | toutes les 20 min de 7 h à minuit\nDimanche et jours fériés | toutes les 30 min de 8 h à 23 h\n\nArrêt Jean-Talon : correspondance avec le métro' };
const AD1: Doc = { look: 'ad', title: b('Classified ad', 'Petite annonce'), text: 'À LOUER – 4 ½ au 2e étage\nQuartier Rosemont, près du métro\nChauff. et eau chaude incl.\nÉlectroménagers fournis\nNon-fumeur, pas d’animaux\nLibre le 1er juillet – 1 450 $/mois\nContactez Pierre : 514 555-0198' };
const AD2: Doc = { look: 'ad', title: b('Classified ad', 'Petite annonce'), text: 'À VENDRE – Vélo de ville, très bon état\nCadre 54 cm, 7 vitesses, panier inclus\n250 $ (prix ferme)\nÀ récupérer sur place, Plateau-Mont-Royal\nÉcrire par courriel seulement' };

const C = 'r-menus-timetables';
export default [
  lesson(C, 1, ['reading-a-menu', 'lire-un-menu'],
    b('Reading a menu', 'Lire un menu'),
    b('Understand a restaurant menu, its sections and its price conditions.', 'Comprendre un menu de restaurant, ses rubriques et ses conditions de prix.'),
    [b('Recognise entrées, plats, desserts', 'Reconnaître entrées, plats, desserts'), b('Calculate the price of a table d’hôte', 'Calculer le prix d’une table d’hôte'), b('Spot taxes en sus', 'Repérer « taxes en sus »')],
    13,
    [
      card(b('The parts of a menu', 'Les parties d’un menu'), b('**entrée** = starter (not the main course!), **plat (principal)** = main course, **dessert**. **Table d’hôte / formule / menu** = a set meal. **Taxes en sus** = taxes not included. **Végétarien, sans gluten**.', '**entrée** = premier plat, **plat (principal)**, **dessert**. **Table d’hôte / formule / menu** = repas à prix fixe. **Taxes en sus** = taxes non comprises. **Végétarien, sans gluten**.')),
      doc(MENU, b('Which main course is vegetarian?', 'Quel plat est végétarien ?'), [b('The mushroom risotto', 'Le risotto aux champignons'), b('The steak and fries', 'Le steak-frites'), b('The fish of the day', 'Le poisson du marché'), b('The Caesar salad', 'La salade César')]),
      doc(MENU, b('How much is the table d’hôte with the fish (before taxes)?', 'Combien coûte la table d’hôte avec le poisson (avant taxes) ?'), ['30 $', '22 $', '28 $', '37 $']),
      doc(MENU, b('What does « taxes en sus » mean?', 'Que veut dire « taxes en sus » ?'), [b('Taxes are added to the prices.', 'Les taxes s’ajoutent aux prix.'), b('Taxes are included.', 'Les taxes sont comprises.'), b('There are no taxes.', 'Il n’y a pas de taxes.'), b('Taxes are paid by the restaurant.', 'Le restaurant paie les taxes.')]),
      pairs(P.match, [['une entrée', b('a starter', 'premier plat')], ['le plat principal', b('the main course', 'plat principal')], ['l’addition', b('the bill', 'la facture au restaurant')], ['le pourboire', b('the tip', 'argent laissé au serveur')]]),
      gap(P.complete, 'Je vais prendre la soupe en ___ et le risotto comme ___ principal.', ['entrée', 'plat']),
      say('Je vais prendre la table d’hôte, avec la soupe et le poisson, s’il vous plaît.', 'I’ll have the set menu, with the soup and the fish, please.'),
    ],
    [
      b('entrée = starter; plat = main course.', 'entrée = premier plat ; plat = plat principal.'),
      b('Table d’hôte / formule = set meal.', 'Table d’hôte / formule = repas à prix fixe.'),
      b('Taxes en sus = taxes not included; pourboire = tip.', 'Taxes en sus = non comprises ; pourboire = argent pour le service.'),
    ],
    [['le champignon', b('the mushroom', 'végétal comestible')], ['en sus', b('extra, on top', 'en plus')], ['le serveur', b('the waiter', 'personne qui sert')]],
  ),
  lesson(C, 2, ['reading-a-timetable', 'lire-un-horaire'],
    b('Reading a timetable', 'Lire un horaire'),
    b('Read frequencies, days and exceptions in a bus timetable.', 'Lire les fréquences, les jours et les exceptions d’un horaire d’autobus.'),
    [b('Understand toutes les 10 minutes', 'Comprendre toutes les 10 minutes'), b('Read days and public holidays', 'Lire les jours et les jours fériés'), b('Plan a journey', 'Planifier un trajet')],
    13,
    [
      card(b('Timetable words', 'Le vocabulaire des horaires'), b('**toutes les 10 min** (every 10 minutes), **de… à…** (from… to…), **jusqu’à** (until), **jours fériés** (public holidays), **sauf** (except), **correspondance** (connection), **direction** (towards), **arrêt** (stop).', '**toutes les 10 min**, **de… à…**, **jusqu’à**, **jours fériés**, **sauf**, **correspondance**, **direction**, **arrêt**.')),
      doc(BUS, b('On Tuesday at 21 h, how often is there a bus?', 'Le mardi à 21 h, quelle est la fréquence ?'), [b('Every 30 minutes', 'Toutes les 30 minutes'), b('Every 10 minutes', 'Toutes les 10 minutes'), b('Every 20 minutes', 'Toutes les 20 minutes'), b('No bus', 'Pas d’autobus')]),
      doc(BUS, b('When does the first bus leave on Sunday?', 'À quelle heure part le premier autobus le dimanche ?'), ['8 h', '6 h', '7 h', '23 h']),
      doc(BUS, b('Where can you change to the metro?', 'Où peut-on prendre le métro ?'), [b('At the Jean-Talon stop', 'À l’arrêt Jean-Talon'), b('Downtown', 'Au centre-ville'), b('At every stop', 'À chaque arrêt'), b('Nowhere', 'Nulle part')]),
      sort(b('Is there a bus?', 'Y a-t-il un autobus ?'), [b('yes', 'oui'), b('no', 'non')], [['samedi à 23 h 30', 0], ['dimanche à 7 h', 1], ['lundi à 6 h 10', 0], ['dimanche à minuit', 1], ['mercredi à 22 h', 0], ['jour férié à 23 h 30', 1]]),
      pairs(P.match, [['un jour férié', b('a public holiday', 'jour de fête légale')], ['une correspondance', b('a connection', 'changement de ligne')], ['un arrêt', b('a stop', 'lieu où le bus s’arrête')], ['sauf', b('except', 'à l’exception de')]]),
      dict('Le bus passe toutes les dix minutes, sauf le dimanche.', { voice: 'm' }),
    ],
    [
      b('toutes les X min = every X minutes; de… à…, jusqu’à.', 'toutes les X min ; de… à… ; jusqu’à.'),
      b('jours fériés = public holidays; sauf = except.', 'jours fériés ; sauf = à l’exception de.'),
      b('correspondance = connection; direction = towards.', 'correspondance = changement ; direction = vers.'),
    ],
    [['la fréquence', b('the frequency', 'nombre de passages')], ['le centre-ville', b('downtown', 'le centre de la ville')], ['un trajet', b('a journey', 'un parcours')]],
  ),
  lesson(C, 3, ['classified-ads', 'les-petites-annonces'],
    b('Classified ads: renting and buying', 'Petites annonces : louer et acheter'),
    b('Decode the abbreviations of housing and sale ads and spot the conditions.', 'Décoder les abréviations des annonces de logement et de vente, et repérer les conditions.'),
    [b('Understand 4 ½, chauff. incl., libre le…', 'Comprendre 4 ½, chauff. incl., libre le…'), b('Find conditions (non-fumeur, prix ferme)', 'Trouver les conditions (non-fumeur, prix ferme)'), b('Ask a question about an ad', 'Poser une question sur une annonce')],
    13,
    [
      card(b('Ad abbreviations', 'Les abréviations des annonces'), b('In Québec, apartments are counted in rooms: **3 ½** (one bedroom), **4 ½** (two bedrooms); the ½ is the bathroom. **chauff. incl.** (heating included), **électros** (appliances), **libre le 1er juillet** (available on July 1), **prix ferme** (non-negotiable), **à récupérer sur place** (pick-up only).', 'Au Québec, on compte les pièces : **3 ½** (une chambre), **4 ½** (deux chambres) ; le ½ est la salle de bain. **chauff. incl.** (chauffage inclus), **électros** (électroménagers), **libre le 1er juillet**, **prix ferme** (non négociable), **à récupérer sur place**.')),
      doc(AD1, b('How many bedrooms does the apartment have?', 'Combien de chambres l’appartement a-t-il ?'), [b('Two', 'Deux'), b('Four', 'Quatre'), b('One', 'Une'), b('Five', 'Cinq')]),
      doc(AD1, b('What is included in the rent?', 'Qu’est-ce qui est inclus dans le loyer ?'), [b('Heating and hot water', 'Le chauffage et l’eau chaude'), b('Internet', 'Internet'), b('Parking', 'Le stationnement'), b('Electricity', 'L’électricité')]),
      doc(AD1, b('Who cannot rent it?', 'Qui ne peut pas le louer ?'), [b('A person with a cat', 'Une personne avec un chat'), b('A student', 'Un étudiant'), b('A couple', 'Un couple'), b('Someone who works downtown', 'Quelqu’un qui travaille au centre-ville')]),
      doc(AD2, b('Can you negotiate the price of the bike?', 'Peut-on négocier le prix du vélo ?'), [b('No, the price is fixed.', 'Non, le prix est ferme.'), b('Yes, by phone.', 'Oui, par téléphone.'), b('Yes, it is free.', 'Oui, il est gratuit.'), b('Only on Sunday.', 'Seulement le dimanche.')]),
      pairs(P.match, [['à louer', b('for rent', 'disponible en location')], ['à vendre', b('for sale', 'disponible à l’achat')], ['le loyer', b('the rent', 'prix mensuel du logement')], ['en bon état', b('in good condition', 'pas abîmé')]]),
      mc(P.best, ['Bonjour, le 4 ½ est-il encore disponible ? Est-ce que je peux le visiter ?', 'Bonjour, je veux louer gratuit votre 4 ½.', 'Bonjour, vous êtes ferme ?', 'Bonjour, le vélo est chauffé ?'], { fr: 'Vous écrivez à Pierre :' }),
      say('Bonjour, je vous appelle pour l’annonce du 4 ½. Est-il encore disponible ?', 'Hello, I’m calling about the ad for the 4½. Is it still available?'),
    ],
    [
      b('3 ½ = one bedroom, 4 ½ = two bedrooms (Québec).', '3 ½ = une chambre, 4 ½ = deux chambres (Québec).'),
      b('chauff. incl., électros, libre le…, prix ferme, à récupérer sur place.', 'chauff. incl., électros, libre le…, prix ferme, à récupérer sur place.'),
      b('Conditions: non-fumeur, pas d’animaux.', 'Conditions : non-fumeur, pas d’animaux.'),
    ],
    [['le chauffage', b('heating', 'système pour chauffer')], ['les électroménagers', b('household appliances', 'frigo, cuisinière, laveuse…')], ['négocier', b('to negotiate', 'discuter le prix')]],
  ),
];
