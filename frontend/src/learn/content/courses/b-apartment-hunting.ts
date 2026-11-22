import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Looking for a flat in France, Québec, Belgium or Switzerland means decoding listings quickly and asking the right questions during a viewing. This A2 course covers reading rental ads (T2 vs 3 ½, charges comprises, floor and lift), asking landlords about heating, double glazing and exposure, and understanding leases, deposits and the rental file (dossier de location).',
    'Chercher un logement en France, au Québec, en Belgique ou en Suisse demande de décoder vite les annonces et de poser les bonnes questions lors de la visite. Ce cours A2 couvre la lecture d’annonces (T2 ou 3 ½, charges comprises, étage et ascenseur), les questions au propriétaire sur le chauffage, le double vitrage et l’exposition, ainsi que le bail, le dépôt de garantie et le dossier de location.',
  ),
  outcomes: [
    b('Decode rental ads and abbreviations', 'Décoder les annonces immobilières et leurs abréviations'),
    b('Ask targeted questions during a viewing', 'Poser les bonnes questions pendant une visite'),
    b('Understand rent, charges and deposits', 'Comprendre loyer, charges et dépôt de garantie'),
    b('Write a polite message to book a viewing', 'Écrire un message poli pour demander une visite'),
  ],
};

const C = 'b-apartment-hunting';
export default [
  lesson(C, 1, ['reading-housing-listings', 'lire-les-annonces'],
    b('Reading rental listings', 'Lire les annonces immobilières'),
    b('Understand room counts, surface area, charges and building details in ads.', 'Comprendre nombre de pièces, surface, charges et informations sur l’immeuble.'),
    [b('Decode T2, 3 ½ and CC', 'Décoder T2, 3 ½ et CC'), b('Read an apartment ad', 'Lire une annonce de location'), b('Check rent, charges and floor', 'Vérifier loyer, charges et étage')],
    13,
    [
      card(b('Inside a rental ad', 'Dans une annonce'), b('Types: **un studio, un T2 / deux-pièces** (living room + 1 bedroom), **meublé / non meublé**. Money: **loyer charges comprises (CC)** vs **hors charges (HC)**, **dépôt de garantie**. Features: **lumineux, calme, au 4e étage avec ascenseur, balcon, proche du métro**.', 'Types : **un studio, un T2 / deux-pièces** (salon + 1 chambre), **meublé / non meublé**. Prix : **loyer charges comprises (CC)** ou **hors charges (HC)**, **dépôt de garantie**. Atouts : **lumineux, calme, au 4e étage avec ascenseur, balcon, proche du métro**.'), {
        ex: [['C’est un deux-pièces lumineux de quarante-cinq mètres carrés.', 'It’s a bright one-bedroom flat of forty-five square metres.'], ['Le loyer est de huit cents euros charges comprises.', 'The rent is eight hundred euros including charges.']],
      }),
      culture(b('T2 in France vs 3 ½ in Québec', 'T2 en France ou 3 ½ au Québec'), b('In **France**, a **T2** (or **F2**) counts living room + bedrooms (2 rooms, bathroom and kitchen extra). In **Québec**, a **3 ½** counts kitchen + living room + bedroom (3) plus the bathroom (**½**)! Both mean a one-bedroom flat.', 'En **France**, un **T2** (ou **F2**) compte salon + chambre (2 pièces, hors cuisine et salle de bains). Au **Québec**, un **3 ½** compte cuisine + salon + chambre (3) plus la salle de bains (**½**) ! Les deux désignent un logement d’une chambre.'), { variant: 'culture' }),
      doc({ look: 'ad', title: b('Rental listing — Lyon', 'Annonce immobilière — Lyon'), text: 'À LOUER — Quartier Monplaisir\nT2 lumineux de 46 m², non meublé\n4e étage avec ascenseur, balcon côté cour\nCuisine équipée, salle de bains avec douche\nLoyer : 820 € / mois + 70 € de charges (eau et chauffage compris)\nDisponible le 1er juin — Dépôt de garantie : 820 €\nMétro à 3 minutes à pied.' }, b('What is the total monthly rent including charges?', 'Quel est le total mensuel avec les charges ?'), [b('890 €', '890 €'), b('820 €', '820 €'), b('750 €', '750 €'), b('960 €', '960 €')]),
      pairs(P.match, [['charges comprises', b('utilities / service charges included', 'eau ou entretien inclus')], ['non meublé', b('unfurnished', 'sans meubles')], ['un studio', b('a studio flat', 'une seule pièce principale')], ['côté cour', b('courtyard-facing (quiet)', 'donnant sur l’arrière')]]),
      mc(P.best, ['Un T2 lumineux au quatrième étage avec ascenseur et balcon.', 'Un studio sombre au rez-de-chaussée sur rue.', 'Un T2 sans ascenseur au sixième étage.', 'Un local commercial non meublé.'], { fr: 'Vous cherchez une chambre séparée, du soleil, un balcon et pas d’escaliers :' }),
      gap(P.complete, 'L’appartement fait quarante-cinq mètres carrés et se trouve au troisième ___ avec ___.', ['étage', 'ascenseur'], { choices: [['étage', 'balcon', 'loyer'], ['ascenseur', 'studio', 'métro']] }),
      say('Bonjour, je vous appelle au sujet de l’annonce pour le deux-pièces. Il est toujours disponible ?', 'Hello, I’m calling about the ad for the one-bedroom flat. Is it still available?'),
    ],
    [
      b('T2 (France) = 3 ½ (Québec) = 1 bedroom + living room.', 'T2 (France) = 3 ½ (Québec) = salon + 1 chambre.'),
      b('CC = charges comprises · HC = hors charges.', 'CC = charges comprises · HC = hors charges.'),
      b('meublé / non meublé · avec ascenseur · côté cour.', 'meublé / non meublé · avec ascenseur · côté cour.'),
    ],
    [['le loyer', b('the rent', 'somme payée chaque mois')], ['les charges (f)', b('service / utility charges', 'frais d’immeuble, eau')], ['lumineux', b('bright, sunny', 'qui reçoit beaucoup de lumière')]],
  ),
  lesson(C, 2, ['visiting-an-apartment', 'visiter-un-appartement'],
    b('Visiting an apartment', 'Visiter un appartement'),
    b('Ask about noise, light, double glazing, heating and building amenities.', 'Interroger sur le bruit, la lumière, le double vitrage, le chauffage et l’immeuble.'),
    [b('Ask if rooms face street or courtyard', 'Demander l’orientation des pièces'), b('Check heating and insulation', 'Vérifier chauffage et isolation'), b('Sort questions about flat vs building', 'Distinguer questions sur le logement et l’immeuble')],
    13,
    [
      card(b('Smart viewing questions', 'Questions utiles en visite'), b('**La chambre donne sur la rue ou sur la cour ? · Les fenêtres ont du double vitrage ? · Le chauffage est individuel ou collectif ? · Quel est le montant moyen des factures d’électricité ? · Il y a une cave ou un local à vélos ?**', '**La chambre donne sur la rue ou sur la cour ? · Les fenêtres ont du double vitrage ? · Le chauffage est individuel ou collectif ? · Quel est le montant moyen des factures d’électricité ? · Il y a une cave ou un local à vélos ?**'), {
        ex: [['Est-ce que le quartier est calme le soir ?', 'Is the neighbourhood quiet in the evening?'], ['Les fenêtres sont en double vitrage.', 'The windows are double-glazed.']],
      }),
      dlg(b('Viewing with the landlord', 'Visite avec le propriétaire'), undefined, [['Propriétaire', 'm'], ['Vous', 'f']], [
        [0, 'Voici la pièce principale, exposée plein sud. Vous avez des questions ?', 'Here is the main room, facing due south. Do you have any questions?'],
        [1, { options: ['Elle est très claire ! Et la chambre donne sur la rue ou sur la cour ?', 'C’est un jardin ?', 'La rue est bruyante non ?'] }],
        [0, 'Sur la cour intérieure, donc c’est très calme. Il y a aussi du double vitrage partout.', 'Onto the inner courtyard, so it’s very quiet. There’s also double glazing everywhere.'],
        [1, { options: ['Parfait. Est-ce que le chauffage est individuel ou collectif ?', 'Il fait froid en hiver ?', 'Les fenêtres s’ouvrent ?'] }],
      ]),
      hear('La chambre donne sur une petite cour calme et toutes les fenêtres ont du double vitrage. Par contre, l’appartement est au cinquième étage sans ascenseur.', b('What is the main drawback?', 'Quel est le principal défaut ?'), [b('fifth floor with no lift', 'cinquième étage sans ascenseur'), b('a very noisy street', 'une rue très bruyante'), b('single-glazed windows', 'des fenêtres en simple vitrage'), b('no bedroom window', 'aucune fenêtre dans la chambre')], { voice: 'f' }),
      sort(b('About the flat or the building?', 'Le logement ou l’immeuble ?'), [b('inside the flat', 'le logement'), b('building / area', 'l’immeuble et le quartier')], [['Le chauffage est individuel ?', 0], ['Il y a un local à vélos ?', 1], ['Les fenêtres ont du double vitrage ?', 0], ['Le quartier est calme le soir ?', 1], ['La cuisine est équipée ?', 0], ['L’immeuble a un interphone ?', 1]]),
      ord(P.order, 'Est-ce que la chambre donne sur la cour intérieure ?', { tr: 'Does the bedroom look out onto the inner courtyard?', extra: ['rue'] }),
      say('L’appartement est très lumineux. Le chauffage est électrique ou au gaz ?', 'The flat is very bright. Is the heating electric or gas?'),
    ],
    [
      b('donner sur la rue / sur la cour intérieure.', 'donner sur la rue / sur la cour intérieure.'),
      b('le double vitrage · le chauffage individuel / collectif.', 'le double vitrage · le chauffage individuel / collectif.'),
      b('local à vélos, cave, interphone.', 'local à vélos, cave, interphone.'),
    ],
    [['le double vitrage', b('double glazing', 'vitre double isolante')], ['individuel', b('individual (for one flat)', 'propre à chaque logement')], ['une cave', b('a cellar / storage unit', 'pièce au sous-sol')]],
  ),
  lesson(C, 3, ['discussing-rent-and-lease', 'parler-loyer-et-bail'],
    b('Rent, lease & application', 'Loyer, bail et dossier'),
    b('Understand lease terms, prepare your rental file and write a viewing request.', 'Comprendre le bail, préparer son dossier de location et écrire pour demander une visite.'),
    [b('Understand bail, caution and état des lieux', 'Comprendre bail, caution et état des lieux'), b('Ask which documents are required', 'Demander les pièces du dossier'), b('Write a convincing viewing message', 'Écrire un message convaincant pour visiter')],
    13,
    [
      card(b('Signing the lease', 'Signer le bail'), b('Key documents: **le bail** (lease), **le dépôt de garantie / la caution** (security deposit), **un garant** (guarantor), **le dossier de location** (ID, pay slips, employment contract), **l’état des lieux** (move-in inventory), **l’assurance habitation**.', 'Documents clés : **le bail**, **le dépôt de garantie / la caution**, **un garant**, **le dossier de location** (pièce d’identité, fiches de paie, contrat de travail), **l’état des lieux**, **l’assurance habitation**.'), {
        ex: [['Quels documents faut-il pour le dossier de location ?', 'Which documents are needed for the rental file?'], ['On fait l’état des lieux le jour de la remise des clés.', 'We do the inventory on the day the keys are handed over.']],
      }),
      pairs(P.match, [['le bail', b('the lease', 'contrat de location')], ['le dépôt de garantie', b('security deposit', 'somme versée à l’entrée')], ['l’état des lieux', b('move-in inventory', 'constat de l’état du logement')], ['le préavis', b('notice period', 'délai avant de partir')]]),
      mc(P.best, ['Quels documents faut-il préparer pour le dossier de location ?', 'Donnez-moi les clés maintenant.', 'Je n’ai pas de papiers, c’est bon ?', 'Le bail c’est combien ?'], { fr: 'Vous êtes intéressé par le logement et voulez déposer votre candidature :' }),
      dict('Le bail est de trois ans et le dépôt de garantie correspond à un mois de loyer hors charges.', { voice: 'm' }),
      write(b('Message to the landlord', 'Message au propriétaire'), b('Write a polite message (35–60 words) replying to an apartment ad: briefly introduce your job/situation, say why you like the flat, ask one question about heating or charges, and request a viewing.', 'Écrivez un message poli (35–60 mots) pour répondre à une annonce : présentez brièvement votre situation, dites pourquoi le logement vous plaît, posez une question sur le chauffage ou les charges, et demandez une visite.'), 35, 60, [
        b('Brief introduction of your situation', 'Brève présentation de votre situation'),
        b('Interest in the flat', 'Intérêt pour le logement'),
        b('One practical question + viewing request', 'Une question pratique + demande de visite'),
      ], 'Bonjour madame, je m’appelle Clara Martin et je travaille comme graphiste en CDI. Votre annonce pour le deux-pièces lumineux rue Pasteur m’intéresse beaucoup. Le chauffage est-il individuel ou collectif, et les charges incluent-elles l’eau ? J’ai déjà un dossier complet. Serait-il possible de le visiter cette semaine ? Merci beaucoup.', { phrases: ['Votre annonce pour…', 'J’ai un dossier complet.', 'Serait-il possible de visiter… ?'] }),
      say('J’ai préparé mon dossier complet. Quand pourrions-nous faire l’état des lieux et signer le bail ?', 'I’ve prepared my full file. When could we do the inventory and sign the lease?'),
    ],
    [
      b('le bail (lease) · le dépôt de garantie (deposit) · le garant.', 'le bail · le dépôt de garantie · le garant.'),
      b('l’état des lieux d’entrée / de sortie.', 'l’état des lieux d’entrée / de sortie.'),
      b('Préparer son dossier complet accélère la réponse.', 'Préparer son dossier complet accélère la réponse.'),
    ],
    [['le bail', b('the lease', 'contrat entre propriétaire et locataire')], ['un garant', b('a guarantor', 'personne qui se porte caution')], ['l’état des lieux', b('property condition report', 'description écrite du logement')]],
  ),
];
