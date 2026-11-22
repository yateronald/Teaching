import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Warehouses, dispatch desks and transport hubs run on exact numbers, clear safety instructions and fast handover checks. One misread packing slip or unnoted damaged parcel can delay an entire shipment. This A2–B1 course equips you to check orders and stock inventories, follow warehouse safety rules, sign delivery notes with reservations when needed, and write concise tracking or discrepancy notices in French.',
    'Entrepôts, quais d’expédition et plateformes de livraison fonctionnent avec des chiffres exacts, des consignes de sécurité strictes et des contrôles rapides à la réception. Un bordereau mal lu ou un colis abîmé non signalé peut bloquer toute une tournée. Ce cours A2–B1 vous prépare à vérifier commandes et stocks, respecter les règles de sécurité, émettre des réserves et signaler un écart de livraison.',
  ),
  outcomes: [
    b('Check order slips, stock counts and out-of-stock alerts', 'Vérifier bons de commande, inventaires et ruptures de stock'),
    b('Understand warehouse PPE and loading-bay safety rules', 'Comprendre équipements de sécurité (EPI) et règles de quai'),
    b('Sign delivery handovers and note damaged or missing parcels', 'Signer un bordereau et noter réserves pour colis abîmés ou manquants'),
    b('Explain tracking status and report a delivery discrepancy in writing', 'Suivre un acheminement et rédiger un signalement d’écart'),
  ],
};

const C = 'bz-logistics';
export default [
  lesson(C, 1, ['orders-and-warehouse-inventory', 'commandes-et-inventaire'],
    b('Orders, parcels and warehouse stock', 'Commandes, colis et inventaire'),
    b('Read packing lists, locate items by aisle and flag out-of-stock references.', 'Lire un bon de préparation, repérer les allées et signaler les ruptures.'),
    [b('Read references, quantities and stock status', 'Lire références, quantités et état du stock'), b('Understand rupture de stock and réapprovisionnement', 'Comprendre rupture de stock et réapprovisionnement'), b('Handle an order-picking audio instruction', 'Suivre une consigne orale de préparation')],
    13,
    [
      card(b('Warehouse and stock terms', 'Vocabulaire de l’entrepôt'), b('**Le bon de commande / de préparation** = purchase / picking slip · **Le colis / le carton / la palette** = parcel / box / pallet · **Le code-barres** = barcode · **L’allée / le rayon** = aisle / rack · **En rupture de stock** = out of stock · **Le réapprovisionnement** = restocking.', '**Le bon de préparation** · **Le colis / le carton / la palette** · **Le code-barres** · **L’allée / le rayon** · **En rupture de stock** · **Le réapprovisionnement**.')),
      doc({ look: 'receipt', title: b('Picking slip', 'Bon de préparation #408'), text: 'Client : Librairie Centrale · Expédition prévue : 14 h\n\nAllée B2 | Ramettes A4 (Réf. 102) : 12 cartons — OK\nAllée C4 | Encre noire (Réf. 318) : 4 unités — RUPTURE (réappro. jeudi)\nAllée D1 | Étiquettes (Réf. 509) : 6 lots — OK\n\nTotal prêt : 2 palettes filmées · Poids : 310 kg' }, b('Which item cannot be shipped at 2 p.m. today?', 'Quel article ne peut pas partir aujourd’hui à 14 h ?'), [b('Black ink (Ref. 318), out of stock until Thursday', 'L’encre noire (Réf. 318), en rupture jusqu’à jeudi'), b('A4 paper reams (Ref. 102)', 'Les ramettes A4 (Réf. 102)'), b('Shipping labels (Ref. 509)', 'Les étiquettes (Réf. 509)'), b('Both wrapped pallets', 'Les deux palettes filmées')]),
      hear('Attention équipe B : la palette pour Lyon part à quinze heures sur le quai numéro quatre. Il manque deux cartons d’étiquettes dans l’allée D, merci de les scanner avant le chargement.', b('What is missing before loading at bay 4?', 'Que manque-t-il avant le chargement au quai 4 ?'), [b('Two boxes of labels from aisle D', 'Deux cartons d’étiquettes de l’allée D'), b('The whole pallet for Lyon', 'Toute la palette pour Lyon'), b('Four pallets of black ink', 'Quatre palettes d’encre noire'), b('The shipping barcodes', 'Les codes-barres d’expédition')], { voice: 'm' }),
      pairs(P.match, [['le bon de préparation', b('picking slip', 'liste des articles à préparer')], ['en rupture de stock', b('out of stock', 'plus d’unités disponibles')], ['le réapprovisionnement', b('restocking', 'nouvelle arrivée de stock')], ['la palette', b('wooden shipping pallet', 'support pour transporter plusieurs cartons')]]),
      gap(P.complete, 'La référence 318 est en ___ de stock ; le ___ est prévu jeudi matin.', ['rupture', 'réapprovisionnement']),
      say('Il manque deux cartons sur cette palette, la référence est en rupture de stock jusqu’à jeudi.', 'Two boxes are missing on this pallet; the reference is out of stock until Thursday.'),
    ],
    [
      b('Rupture de stock = out of stock; réapprovisionnement = restocking.', 'Rupture de stock = épuisé ; réapprovisionnement = retour en stock.'),
      b('Check aisle (allée), reference (réf.) and quantity before sealing a pallet.', 'Vérifiez allée, référence et quantité avant de filmer une palette.'),
      b('Quai de chargement = loading bay.', 'Quai de chargement = zone où l’on charge les camions.'),
    ],
    [['une allée', b('an aisle', 'couloir entre les rayonnages')], ['un colis', b('a parcel, package', 'paquet emballé')], ['le chargement', b('loading', 'action de charger un camion')]],
  ),
  lesson(C, 2, ['safety-rules-and-handovers', 'securite-et-livraison'],
    b('Warehouse safety and delivery handovers', 'Sécurité en entrepôt et réception'),
    b('Follow PPE rules and inspect parcels before signing a delivery slip.', 'Respecter les règles de sécurité et contrôler un colis avant de signer.'),
    [b('Recognise compulsory protective gear (EPI)', 'Reconnaître les équipements de protection (EPI)'), b('Check parcels and note reservations on delivery slips', 'Contrôler un colis et écrire des réserves'), b('Handle a handover exchange with a driver', 'Gérer une remise de livraison avec un chauffeur')],
    13,
    [
      card(b('Safety gear and delivery checks', 'Sécurité et contrôle à la réception'), b('Safety: **le gilet haute visibilité** (hi-vis vest), **les chaussures de sécurité** (steel-toe boots), **le chariot élévateur** (forklift), **dégager les issues de secours**. Handover: **le bordereau de livraison** (delivery note), **signer sous réserve de vérification** (subject to inspection), **un colis endommagé / ouvert**.', 'Sécurité : **gilet haute visibilité**, **chaussures de sécurité**, **chariot élévateur**, **dégager les issues de secours**. Livraison : **bordereau de livraison**, **sous réserve de vérification**, **colis endommagé**.')),
      doc({ look: 'notice', title: b('Warehouse safety rules', 'Consignes de sécurité — Entrepôt'), text: 'ZONE LOGISTIQUE — ACCÈS RÉGLEMENTÉ\n\n• Port du gilet jaune et des chaussures de sécurité obligatoire dans toutes les allées.\n• Vitesse maximale des chariots élévateurs : 10 km/h.\n• Ne jamais stocker de palettes devant les extincteurs ni les issues de secours.\n• Tout colis abîmé doit être signalé sur le bordereau avant le départ du chauffeur.' }, b('What must you do if a parcel arrives crushed or torn?', 'Que faut-il faire si un colis arrive écrasé ou déchiré ?'), [b('Note the damage on the delivery slip before the driver leaves', 'Signaler le dommage sur le bordereau avant le départ du chauffeur'), b('Drive the forklift faster to move it', 'Déplacer vite la palette au chariot élévateur'), b('Put it in front of the emergency exit', 'Le poser devant l’issue de secours'), b('Wait a week before checking inside', 'Attendre une semaine avant de vérifier')]),
      dlg(b('At the receiving dock', 'Au quai de réception'), undefined, [['Chauffeur', 'm'], ['Vous (réception)', 'f']], [
        [0, 'Bonjour ! J’ai quatre palettes pour votre entrepôt. Vous signez ici, s’il vous plaît ?', 'Hello! I have four pallets for your warehouse. Can you sign here, please?'],
        [1, { options: ['Attendez une seconde, je vérifie d’abord. Ce carton en haut à gauche est ouvert et abîmé.', 'Oui, je signe tout de suite sans regarder.', 'Non, partez tout de suite.'] }],
        [0, 'Ah oui, il a pris un coup pendant le trajet. Que faites-vous ?', 'Ah yes, it took a knock on the way. What are you doing?'],
        [1, { options: ['Je note « colis ouvert et endommagé » sur le bordereau avec la date, puis je signe.', 'Je jette le carton à la poubelle.', 'Ce n’est pas grave, oublions ça.'] }],
      ]),
      sort(b('Safety rule or handover step?', 'Consigne de sécurité ou contrôle livraison ?'), [b('safety rule', 'règle de sécurité'), b('delivery handover', 'contrôle livraison')], [['porter des chaussures de sécurité', 0], ['vérifier le nombre de colis', 1], ['laisser l’issue de secours libre', 0], ['émettre des réserves précises', 1], ['respecter la limitation à 10 km/h', 0]]),
      ord(P.order, 'Je signe sous réserve de contrôle du contenu.', { tr: 'I am signing subject to checking the contents.', extra: ['toujours'] }),
      say('Ce colis est ouvert sur le côté, je vais noter des réserves précises sur le bordereau.', 'This parcel is open on the side; I am going to note specific reservations on the delivery slip.'),
    ],
    [
      b('Wear hi-vis vest and safety shoes; keep exits clear.', 'Gilet et chaussures de sécurité obligatoires ; issues dégagées.'),
      b('Inspect before signing—never sign blindly if a box is damaged.', 'Vérifiez avant de signer ; ne signez jamais sans regarder un colis abîmé.'),
      b('Write exact reservations (« colis ouvert », « 1 manquant ») on the bordereau.', 'Notez des réserves précises sur le bordereau avant le départ du chauffeur.'),
    ],
    [['le bordereau', b('the delivery slip', 'document signé à la livraison')], ['endommagé', b('damaged', 'abîmé')], ['une réserve', b('a written reservation / note of defect', 'mention écrite d’un défaut')]],
  ),
  lesson(C, 3, ['tracking-delays-and-claims', 'suivi-retards-et-reclamations'],
    b('Tracking updates, delays and discrepancy emails', 'Suivi, retards et signalement d’écart'),
    b('Decode shipment tracking notices and report missing or delayed goods clearly.', 'Comprendre un suivi d’expédition et signaler un retard ou un colis manquant.'),
    [b('Read tracking statuses (en transit, bloqué, retard)', 'Lire les statuts de suivi d’expédition'), b('Explain missing quantities or delivery delays', 'Expliquer quantités manquantes ou retards'), b('Write a crisp discrepancy notice to a supplier', 'Rédiger un courriel clair de signalement d’écart')],
    13,
    [
      card(b('Tracking and claim phrases', 'Suivi et réclamations logistiques'), b('**Numéro de suivi** = tracking number · **En cours d’acheminement / en transit** = in transit · **Bloqué en douane** = held at customs · **Créneau de livraison** = delivery window · **Écart de livraison** = delivery discrepancy (**il manque X unités**, **nous avons bien émis des réserves**).', '**Numéro de suivi** · **En cours d’acheminement** · **Bloqué en douane** · **Créneau de livraison** · **Écart de livraison** (**il manque X unités**, **réserves notées sur le bordereau**).')),
      mc(P.best, ['Votre commande est en cours d’acheminement ; la livraison aura lieu demain entre 9 h et 12 h.', 'Votre colis n’existe plus.', 'Achetez-en un autre.', 'C’est la faute du client.'], { fr: 'Un client demande où est son colis parti hier :' }),
      pairs(P.match, [['en cours d’acheminement', b('in transit, on the way', 'en route vers le client')], ['bloqué en douane', b('held at customs', 'retenu à la frontière')], ['un créneau de livraison', b('a delivery time slot', 'plage horaire prévue')], ['un écart de quantité', b('a quantity discrepancy', 'différence entre prévu et reçu')]]),
      gap(P.complete, 'Selon notre bon de livraison, il ___ trois cartons ; merci de vérifier le ___ de suivi.', ['manque', 'numéro']),
      write(b('Delivery discrepancy email', 'Courriel d’écart de livraison'), b('Write a concise email (50–80 words) to a carrier/supplier: give the order number (#842), state that 8 boxes arrived instead of 10 and 1 was crushed, mention that you noted it on the delivery slip, and ask for a replacement date.', 'Rédigez un courriel clair (50–80 mots) à un fournisseur : indiquez le numéro de commande (#842), précisez que 8 cartons sont arrivés sur 10 et qu’un carton est écrasé, mentionnez les réserves notées sur le bordereau, et demandez une date de remplacement.'), 50, 80, [
        b('Order number and clear issue', 'Numéro de commande et problème précis'),
        b('Mention of written reservations on the slip', 'Mention des réserves sur le bordereau'),
        b('Request for next action / date', 'Demande de date d’expédition / remplacement'),
      ], 'Bonjour,\n\nNous venons de recevoir la commande #842, mais nous constatons un écart : seuls 8 cartons sur 10 ont été livrés et un colis est arrivé écrasé. Nous avons bien noté ces réserves précises sur le bordereau du chauffeur avec photos à l’appui.\n\nPourriez-vous nous indiquer quand les cartons manquants et le remplacement seront expédiés ?\n\nCordialement,\nMarc Leroy'),
      dict('La palette a pris du retard en douane, le nouveau créneau est prévu vendredi matin.', { voice: 'f' }),
    ],
    [
      b('En cours d’acheminement = in transit; créneau = delivery slot.', 'En cours d’acheminement = en transit ; créneau = plage horaire.'),
      b('In discrepancy emails: order number + exact count + slip reservations + requested date.', 'Dans un signalement : n° de commande + écart exact + réserves + date souhaitée.'),
      b('Photos à l’appui = with supporting photos.', 'Photos à l’appui = preuves photo jointes.'),
    ],
    [['l’acheminement', b('shipping, transit routing', 'transport jusqu’au destinataire')], ['un écart', b('a discrepancy, gap', 'différence constatée')], ['expédier', b('to ship, dispatch', 'envoyer une marchandise')]],
  ),
];
