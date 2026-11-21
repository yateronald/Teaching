import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Before you can read a novel, you need to read the street: shop signs, opening hours, warnings in the metro, labels on food and medicine. This first reading course trains you on the short, practical texts you meet every day in a French-speaking city, with the key words (ouvert, fermé, interdit, sortie, poussez), the abbreviations and the reading strategy that lets you find the information in a few seconds.',
    'Avant de lire un roman, il faut savoir lire la rue : enseignes, heures d’ouverture, avertissements dans le métro, étiquettes d’aliments et de médicaments. Ce premier cours de lecture vous entraîne sur les textes courts et pratiques du quotidien d’une ville francophone, avec les mots clés (ouvert, fermé, interdit, sortie, poussez), les abréviations et la stratégie de lecture qui permet de trouver l’information en quelques secondes.',
  ),
  outcomes: [
    b('Understand opening hours and shop signs', 'Comprendre les heures d’ouverture et les enseignes'),
    b('Understand warnings and prohibitions', 'Comprendre les avertissements et les interdictions'),
    b('Read food and medicine labels', 'Lire les étiquettes d’aliments et de médicaments'),
    b('Scan a text for one piece of information', 'Repérer rapidement une information précise'),
  ],
};

const HOURS: Doc = { look: 'notice', title: b('On a pharmacy door', 'Sur la porte d’une pharmacie'), text: 'PHARMACIE DU PARC\n\nLundi – vendredi | 8 h 30 – 20 h\nSamedi | 9 h – 17 h\nDimanche | fermé\n\nEn cas d’urgence : pharmacie de garde, 12, rue Saint-Denis' };
const METRO: Doc = { look: 'notice', title: b('In the metro', 'Dans le métro'), text: 'ATTENTION\n\nNe pas s’appuyer sur les portes.\nInterdit de fumer et de vapoter.\nLes vélos sont interdits de 7 h à 9 h et de 16 h à 18 h.\n\nSortie → rue Berri' };
const DOORS: Doc = { look: 'label', title: b('Small signs', 'Petites affichettes'), text: 'POUSSEZ\nTIREZ\nSORTIE DE SECOURS\nACCÈS RÉSERVÉ AU PERSONNEL\nTOILETTES →\nHORS SERVICE' };
const FOOD: Doc = { look: 'label', title: b('A yoghurt label', 'L’étiquette d’un yaourt'), text: 'Yaourt nature au lait entier\n4 × 125 g\n\nIngrédients : lait entier, ferments lactiques.\nÀ conserver au frais (entre 0 et 4 °C).\nÀ consommer de préférence avant le : 12/03\nContient : lait.' };
const MEDICINE: Doc = { look: 'label', title: b('On a medicine box', 'Sur une boîte de médicament'), text: 'Comprimés contre la douleur – 500 mg\n\nAdultes : 1 à 2 comprimés toutes les 6 heures.\nNe pas dépasser 8 comprimés par jour.\nNe pas donner aux enfants de moins de 12 ans.\nTenir hors de la portée des enfants.' };
const SHOP: Doc = { look: 'notice', title: b('Shop window', 'Vitrine'), text: 'SOLDES\n\n–30 % sur toute la collection d’hiver\nDu 2 au 15 janvier\n\nPaiement par carte accepté\nLes articles soldés ne sont ni repris ni échangés.' };

const C = 'r-signs-labels';
export default [
  lesson(C, 1, ['opening-hours-and-shop-signs', 'horaires-et-enseignes'],
    b('Opening hours and shop signs', 'Horaires et enseignes'),
    b('Read opening hours and the signs on doors and shop windows.', 'Lire les horaires et les affichettes des portes et des vitrines.'),
    [b('Read days and opening times', 'Lire les jours et les heures d’ouverture'), b('Understand ouvert, fermé, soldes', 'Comprendre ouvert, fermé, soldes'), b('Find one piece of information fast', 'Trouver vite une information')],
    13,
    [
      tip(b('Scan, do not read everything', 'Balayez, ne lisez pas tout'), b('For a sign or a timetable, first read the **question**, then **scan** the text for the key word (a day, a time, a price). You do not need to understand every word.', 'Pour une affiche ou un horaire, lisez d’abord la **question**, puis **balayez** le texte à la recherche du mot clé (un jour, une heure, un prix). Inutile de comprendre chaque mot.')),
      card(b('Times in writing', 'L’heure à l’écrit'), b('French uses the 24-hour clock with **h**: **8 h 30** = 8:30 a.m., **20 h** = 8 p.m. **Lundi – vendredi** = Monday to Friday. **Fermé** = closed, **ouvert** = open.', 'Le français écrit l’heure sur 24 heures avec **h** : **8 h 30**, **20 h**. **Lundi – vendredi** = du lundi au vendredi. **Fermé** / **ouvert**.'), {
        ex: [['Ouvert du lundi au samedi.', 'Open Monday to Saturday.'], ['Fermé le dimanche.', 'Closed on Sundays.']],
      }),
      doc(HOURS, b('Can you buy medicine at this pharmacy on Sunday?', 'Peut-on acheter des médicaments dans cette pharmacie le dimanche ?'), [b('No, it is closed; go to the on-duty pharmacy.', 'Non, elle est fermée ; il faut aller à la pharmacie de garde.'), b('Yes, from 9 a.m. to 5 p.m.', 'Oui, de 9 h à 17 h.'), b('Yes, until 8 p.m.', 'Oui, jusqu’à 20 h.'), b('Only in the morning.', 'Seulement le matin.')]),
      doc(HOURS, b('What time does it close on Wednesday?', 'À quelle heure ferme-t-elle le mercredi ?'), ['20 h', '17 h', '8 h 30', '12 h']),
      doc(SHOP, b('What is true?', 'Qu’est-ce qui est vrai ?'), [b('Sale items cannot be returned.', 'Les articles soldés ne sont pas repris.'), b('Everything is 50% off.', 'Tout est à –50 %.'), b('The sale lasts all winter.', 'Les soldes durent tout l’hiver.'), b('Only cash is accepted.', 'Seul l’argent comptant est accepté.')]),
      pairs(P.match, [['les soldes', b('the sales', 'prix réduits')], ['la pharmacie de garde', b('the on-duty pharmacy', 'pharmacie ouverte en dehors des heures')], ['repris ou échangé', b('refunded or exchanged', 'rendu ou remplacé')], ['en cas d’urgence', b('in an emergency', 'si c’est urgent')]]),
      gap(P.complete, 'La bibliothèque est ___ le lundi, mais elle est ___ du mardi au samedi.', ['fermée', 'ouverte'], { choices: [['fermée', 'ouverte'], ['ouverte', 'fermée']] }),
      say('Excusez-moi, vous êtes ouverts le dimanche ?', 'Excuse me, are you open on Sundays?'),
    ],
    [
      b('Read the question first, then scan for the key word.', 'Lisez d’abord la question, puis cherchez le mot clé.'),
      b('24-hour clock: 8 h 30, 20 h.', 'Heure sur 24 heures : 8 h 30, 20 h.'),
      b('ouvert / fermé, soldes, pharmacie de garde.', 'ouvert / fermé, soldes, pharmacie de garde.'),
    ],
    [['ouvert', b('open', 'accessible')], ['fermé', b('closed', 'pas accessible')], ['une vitrine', b('a shop window', 'devanture de magasin')]],
  ),
  lesson(C, 2, ['warnings-and-prohibitions', 'avertissements-et-interdictions'],
    b('Warnings and prohibitions', 'Avertissements et interdictions'),
    b('Understand what is forbidden, compulsory or reserved in public places.', 'Comprendre ce qui est interdit, obligatoire ou réservé dans les lieux publics.'),
    [b('Understand interdit, défense de, ne pas', 'Comprendre interdit, défense de, ne pas'), b('Read door and safety signs', 'Lire les panneaux de porte et de sécurité'), b('Follow instructions in transport', 'Suivre les consignes dans les transports')],
    13,
    [
      card(b('Rules in the infinitive', 'Les règles à l’infinitif'), b('Signs often use the **infinitive**: **Ne pas fumer. Ne pas s’appuyer sur les portes.** Or a noun: **Interdit de…, Défense de…, Accès réservé…, Sortie de secours.**', 'Les panneaux emploient souvent l’**infinitif** : **Ne pas fumer. Ne pas s’appuyer sur les portes.** Ou un nom : **Interdit de…, Défense de…, Accès réservé…, Sortie de secours.**'), {
        ex: [['Interdit de stationner.', 'No parking.'], ['Défense d’entrer.', 'No entry.'], ['Ne pas déranger.', 'Do not disturb.']],
      }),
      doc(METRO, b('When can you take your bike in the metro?', 'Quand peut-on prendre son vélo dans le métro ?'), [b('At 11 a.m.', 'À 11 h.'), b('At 8 a.m.', 'À 8 h.'), b('At 5 p.m.', 'À 17 h.'), b('Never.', 'Jamais.')]),
      doc(METRO, b('Which is forbidden?', 'Qu’est-ce qui est interdit ?'), [b('Vaping', 'Vapoter'), b('Going out to rue Berri', 'Sortir rue Berri'), b('Taking the metro at 9 p.m.', 'Prendre le métro à 21 h'), b('Standing on the platform', 'Attendre sur le quai')]),
      doc(DOORS, b('You must open the door towards you. Which sign do you see?', 'Il faut ouvrir la porte vers soi. Quel panneau voyez-vous ?'), ['TIREZ', 'POUSSEZ', 'HORS SERVICE', 'SORTIE DE SECOURS']),
      sort(b('Forbidden or allowed / information?', 'Interdit ou information ?'), [b('prohibition', 'interdiction'), b('information', 'information')], [['Défense de fumer', 0], ['Sortie →', 1], ['Ne pas toucher', 0], ['Toilettes au sous-sol', 1], ['Interdit aux chiens', 0], ['Ascenseur hors service', 1]]),
      pairs(P.match, [['hors service', b('out of order', 'en panne')], ['sortie de secours', b('emergency exit', 'sortie en cas de danger')], ['accès réservé', b('restricted access', 'entrée limitée')], ['s’appuyer', b('to lean', 'se reposer contre')]]),
      mc(P.meaning, [b('Do not disturb.', 'Laissez-moi tranquille.'), b('Do not clean.', 'Ne pas nettoyer.'), b('Please come in.', 'Entrez, s’il vous plaît.'), b('Room available.', 'Chambre libre.')], { fr: 'NE PAS DÉRANGER' }),
      dict('Il est interdit de fumer dans le métro.', { voice: 'm' }),
    ],
    [
      b('Infinitive rules: Ne pas fumer, Ne pas déranger.', 'Règles à l’infinitif : Ne pas fumer, Ne pas déranger.'),
      b('Interdit de…, Défense de…, Accès réservé…', 'Interdit de…, Défense de…, Accès réservé…'),
      b('Poussez = push; Tirez = pull; Hors service = out of order.', 'Poussez / Tirez ; Hors service = en panne.'),
    ],
    [['poussez', b('push', 'appuyer pour ouvrir')], ['tirez', b('pull', 'ramener vers soi')], ['vapoter', b('to vape', 'fumer une cigarette électronique')]],
  ),
  lesson(C, 3, ['food-and-medicine-labels', 'etiquettes-aliments-medicaments'],
    b('Food and medicine labels', 'Étiquettes d’aliments et de médicaments'),
    b('Find ingredients, dates, storage and dosage on labels.', 'Trouver ingrédients, dates, conservation et posologie sur les étiquettes.'),
    [b('Read an expiry date', 'Lire une date de consommation'), b('Find allergens and storage advice', 'Trouver les allergènes et les conseils de conservation'), b('Understand a dosage', 'Comprendre une posologie')],
    13,
    [
      card(b('Key label words', 'Les mots clés des étiquettes'), b('**À consommer de préférence avant le** (best before), **à consommer jusqu’au** (use by), **à conserver au frais** (keep refrigerated), **contient** (contains), **sans gluten**, **ne pas dépasser** (do not exceed), **tenir hors de la portée des enfants**.', '**À consommer de préférence avant le**, **à consommer jusqu’au**, **à conserver au frais**, **contient**, **sans gluten**, **ne pas dépasser**, **tenir hors de la portée des enfants**.')),
      doc(FOOD, b('Where should you keep this yoghurt?', 'Où faut-il garder ce yaourt ?'), [b('In the fridge', 'Au réfrigérateur'), b('In the freezer', 'Au congélateur'), b('In a cupboard', 'Dans un placard'), b('Anywhere', 'N’importe où')]),
      doc(FOOD, b('Who should avoid this product?', 'Qui doit éviter ce produit ?'), [b('People allergic to milk', 'Les personnes allergiques au lait'), b('People allergic to nuts', 'Les personnes allergiques aux noix'), b('Children', 'Les enfants'), b('Nobody', 'Personne')]),
      doc(MEDICINE, b('What is the maximum per day?', 'Quel est le maximum par jour ?'), [b('8 tablets', '8 comprimés'), b('2 tablets', '2 comprimés'), b('6 tablets', '6 comprimés'), b('12 tablets', '12 comprimés')]),
      doc(MEDICINE, b('Can you give it to a 10-year-old child?', 'Peut-on le donner à un enfant de 10 ans ?'), [b('No', 'Non'), b('Yes, one tablet', 'Oui, un comprimé'), b('Yes, every 6 hours', 'Oui, toutes les 6 heures'), b('Yes, with food', 'Oui, en mangeant')]),
      pairs(P.match, [['à conserver au frais', b('keep refrigerated', 'garder au froid')], ['sans gluten', b('gluten-free', 'ne contient pas de gluten')], ['un comprimé', b('a tablet', 'petite pastille de médicament')], ['ne pas dépasser', b('do not exceed', 'ne pas prendre plus')]]),
      gap(P.complete, 'À consommer de ___ avant le 12 mars. À conserver au ___.', ['préférence', 'frais']),
      say('Est-ce que ce produit contient du lait ?', 'Does this product contain milk?'),
    ],
    [
      b('Best before: à consommer de préférence avant le; use by: à consommer jusqu’au.', 'À consommer de préférence avant le… / à consommer jusqu’au…'),
      b('Storage: à conserver au frais / au sec.', 'Conservation : à conserver au frais / au sec.'),
      b('Medicine: ne pas dépasser, tenir hors de la portée des enfants.', 'Médicament : ne pas dépasser, tenir hors de la portée des enfants.'),
    ],
    [['les ingrédients', b('the ingredients', 'ce qui compose le produit')], ['la posologie', b('the dosage', 'dose à prendre')], ['allergique', b('allergic', 'qui réagit mal à')]],
  ),
];
