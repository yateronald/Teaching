import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Classified ads save space by packing prices, sizes and conditions into short codes: T2, 3 ½, CC, CDI, TBE. Without the code, an attractive apartment or job offer can hide expensive extra charges—or a scam. This A2 course trains you to read housing ads from France and Québec, decode job listings and contracts, and evaluate second-hand offers while spotting classic red flags.',
    'Les petites annonces économisent la place grâce à des abréviations : T2, 3 ½, CC, CDI, TBE. Sans connaître ce code, un appartement ou un emploi attirant peut cacher des frais élevés — voire une arnaque. Ce cours de niveau A2 vous apprend à lire les annonces immobilières de France et du Québec, à décoder les offres d’emploi et à évaluer les annonces d’occasion tout en repérant les signaux d’alerte.',
  ),
  outcomes: [
    b('Decode French and Québec housing abbreviations (T2, 3 ½, CC)', 'Décoder les abréviations immobilières (T2, 3 ½, CC)'),
    b('Read job listings: contract type, hours, salary and benefits', 'Lire une offre d’emploi : contrat, horaires, salaire et avantages'),
    b('Understand condition codes in second-hand ads (TBE, ferme)', 'Comprendre les états et conditions en occasion (TBE, ferme)'),
    b('Spot payment scams and hidden conditions', 'Repérer les arnaques et conditions cachées'),
  ],
};

const APT_FR: Doc = { look: 'ad', title: b('Housing ad — France', 'Annonce logement — France'), text: 'À LOUER — LYON 3e — T2 lumineux 42 m²\n920 € CC (dont 70 € de charges : eau, entretien)\n\n3e étage sans asc. · Cuisine équipée · SDB avec douche\nChauffage individuel électrique · DPE : C\nLibre le 1er mai · Bail 3 ans non meublé\n\nDépôt de garantie : 850 € · Garant exigé.\nPas de colocation.' };
const APT_QC: Doc = { look: 'ad', title: b('Housing ad — Montréal', 'Annonce logement — Montréal'), text: 'BEAU 3 ½ RÉNOVÉ — PLATEAU-MONT-ROYAL\n1 380 $ / mois · Disponible le 1er juillet\n\n1 chambre fermée, grand salon double, balcon arrière\nSemi-meublé (poêle et frigo inclus) · Chauffé, eau chaude incluse\nEntrée laveuse-sécheuse · Chats acceptés\n\nBail de 12 mois · Enquête de crédit demandée.' };
const JOB_AD: Doc = { look: 'ad', title: b('Job offer', 'Offre d’emploi'), text: 'RECHERCHE CONSEILLER(ÈRE) CLIENTÈLE (H/F)\nCDI — Temps plein (35 h / sem.) — Bordeaux\n\nSalaire : 2 350 € brut / mois + prime trimestrielle\nTélétravail hybride (2 jours par semaine)\nAvantages : mutuelle d’entreprise, 50 % transport, tickets-restaurant\n\nProfil : 2 ans d’expérience exigés, aisance au téléphone.\nEnvoyer CV et lettre avant le 20 avril.' };
const BIKE_AD: Doc = { look: 'ad', title: b('Second-hand ad', 'Annonce d’occasion'), text: 'VÉLO DE VILLE URBAIN — TBE (très bon état)\n240 € ferme (prix neuf : 520 €)\n\nCadre M, 7 vitesses, porte-bagages, antivol fourni.\nFacture d’achat disponible.\nRemise en main propre uniquement à Nantes centre.\nPaiement en espèces ou virement instantané sur place.' };
const SCAM_SMS: Doc = { look: 'sms', title: b('Seller reply', 'Réponse d’un annonceur'), text: 'Bonjour, je suis actuellement en mission à l’étranger. Pour visiter l’appartement très demandé (500 € CC à Paris), merci d’envoyer d’abord un coupon de paiement de 500 € pour réserver les clés par transporteur.' };

const C = 'r-classified-ads';
export default [
  lesson(C, 1, ['housing-abbreviations', 'abreviations-logement'],
    b('Housing ads: France and Québec', 'Annonces logement : France et Québec'),
    b('Decode room counts, included charges and lease rules in rental ads.', 'Décoder nombre de pièces, charges comprises et conditions de bail.'),
    [b('Read French T2/CC and Québec 3 ½/chauffé', 'Lire T2/CC en France et 3 ½/chauffé au Québec'), b('Calculate real monthly costs', 'Calculer le coût mensuel réel'), b('Check deposit and tenant conditions', 'Vérifier dépôt de garantie et conditions')],
    13,
    [
      card(b('Room counts and bills', 'Pièces et charges'), b('**France**: **T2 / F2** = 1 bedroom + 1 living room · **CC** = charges comprises (building fees included) · **HC** = hors charges · **asc.** = ascenseur · **SDB** = salle de bains. **Québec**: **3 ½** = 1 bedroom + living room + kitchen + bathroom (½) · **chauffé** = heating included · **semi-meublé** = stove & fridge included.', '**France** : **T2 / F2** (1 chambre + séjour) · **CC** (charges comprises) · **HC** (hors charges) · **asc.** · **SDB**. **Québec** : **3 ½** (1 chambre fermée) · **chauffé** · **semi-meublé** (cuisinière et réfrigérateur inclus).')),
      doc(APT_FR, b('In the Lyon ad, what is NOT included in the 920 €?', 'Dans l’annonce de Lyon, qu’est-ce qui n’est PAS compris dans les 920 € ?'), [b('Electricity for heating', 'L’électricité du chauffage'), b('Water', 'L’eau'), b('Building maintenance', 'L’entretien de l’immeuble'), b('The kitchen appliances', 'La cuisine équipée')]),
      doc(APT_FR, b('Who can rent the Lyon apartment?', 'Qui peut louer l’appartement de Lyon ?'), [b('A person with a guarantor, living alone or as a couple', 'Une personne avec un garant, seule ou en couple'), b('Three students sharing a flat', 'Trois étudiants en colocation'), b('Someone needing a furnished flat', 'Une personne cherchant un logement meublé'), b('Someone with heavy furniture needing a lift', 'Quelqu’un ayant besoin d’un ascenseur')]),
      doc(APT_QC, b('In the Montréal ad, what is included in the 1 380 $?', 'Dans l’annonce de Montréal, qu’est-ce qui est inclus dans 1 380 $ ?'), [b('Heating, hot water, stove and fridge', 'Chauffage, eau chaude, cuisinière et réfrigérateur'), b('All furniture and sofa', 'Tous les meubles et le canapé'), b('A washer and dryer', 'La laveuse et la sécheuse'), b('Parking for a car', 'Une place de stationnement')]),
      pairs(P.match, [['charges comprises', b('bills / service fees included', 'CC')], ['un dépôt de garantie', b('a security deposit', 'somme versée à l’entrée')], ['un garant', b('a guarantor', 'personne qui se porte caution')], ['semi-meublé', b('with stove and fridge', 'avec électroménagers de base')]]),
      gap(P.complete, 'Le loyer est de 920 € ___ comprises, mais sans ___.', ['charges', 'ascenseur']),
    ],
    [
      b('T2 (France) ≈ 3 ½ (Québec): 1 bedroom + living room.', 'T2 (France) ≈ 3 ½ (Québec) : 1 chambre + salon.'),
      b('Check whether heating (chauffage) is individual or included.', 'Vérifiez si le chauffage est individuel ou inclus.'),
      b('CC = charges comprises; garant = guarantor; bail = lease.', 'CC = charges comprises ; garant ; bail.'),
    ],
    [['le loyer', b('the rent', 'prix mensuel du logement')], ['un bail', b('a lease', 'contrat de location')], ['la colocation', b('flat-sharing', 'partager un logement à plusieurs')]],
  ),
  lesson(C, 2, ['job-listings-and-contracts', 'offres-emploi-et-contrats'],
    b('Job listings and contracts', 'Offres d’emploi et contrats'),
    b('Understand contract types, gross vs net pay and workplace benefits.', 'Comprendre types de contrats, salaire brut ou net et avantages.'),
    [b('Distinguish CDI and CDD', 'Distinguer CDI et CDD'), b('Read working hours and remote-work rules', 'Lire durée du travail et télétravail'), b('Recognise brut, mutuelle and prime', 'Reconnaître brut, mutuelle et prime')],
    13,
    [
      card(b('Job ad codes', 'Les codes des offres d’emploi'), b('**CDI** = contrat à durée indéterminée (permanent) · **CDD** = contrat à durée déterminée (fixed-term) · **Temps plein / partiel** = full / part time · **Brut** = gross salary before social taxes (not **net**) · **Mutuelle** = health insurance · **Télétravail hybride** = mix of office and home.', '**CDI** (contrat permanent) · **CDD** (contrat temporaire) · **Temps plein / partiel** · **Brut** (avant cotisations, différent du **net**) · **Mutuelle** (assurance santé) · **Télétravail hybride**.')),
      doc(JOB_AD, b('What kind of contract is offered?', 'Quel type de contrat est proposé ?'), [b('A permanent full-time contract', 'Un contrat permanent à temps plein'), b('A fixed-term summer contract', 'Un contrat saisonnier à durée déterminée'), b('A part-time internship', 'Un stage à temps partiel'), b('100% remote freelance work', 'Du travail indépendant 100 % à distance')]),
      doc(JOB_AD, b('What is true about the 2 350 €?', 'Qu’est-ce qui est vrai à propos des 2 350 € ?'), [b('It is gross monthly pay before deductions.', 'C’est le salaire mensuel brut avant retenues.'), b('It is net take-home pay.', 'C’est le salaire net versé sur le compte.'), b('It already includes the quarterly bonus.', 'Cela inclut déjà la prime trimestrielle.'), b('It is paid every week.', 'C’est payé chaque semaine.')]),
      doc(JOB_AD, b('How many days per week do you work in the Bordeaux office?', 'Combien de jours par semaine travaille-t-on au bureau à Bordeaux ?'), [b('Three days', 'Trois jours'), b('Two days', 'Deux jours'), b('Five days', 'Cinq jours'), b('One day', 'Un jour')]),
      sort(b('Contract/pay or benefit?', 'Contrat/salaire ou avantage ?'), [b('contract / pay', 'contrat / salaire'), b('benefit', 'avantage')], [['CDI à temps plein', 0], ['mutuelle d’entreprise', 1], ['2 350 € brut', 0], ['tickets-restaurant', 1], ['télétravail hybride', 1], ['prime trimestrielle', 0]]),
      mc(P.meaning, [b('two years of experience required', 'deux ans d’expérience obligatoires'), b('no experience needed', 'aucune expérience demandée'), b('two weeks of training', 'deux semaines de formation'), b('two languages spoken', 'deux langues parlées')], { fr: '2 ans d’expérience exigés' }),
      dict('Ce poste en contrat à durée indéterminée propose deux jours de télétravail.', { voice: 'm' }),
    ],
    [
      b('CDI = permanent; CDD = fixed-term.', 'CDI = durée indéterminée ; CDD = durée déterminée.'),
      b('Brut = gross before taxes; net = take-home pay.', 'Brut = avant cotisations ; net = après cotisations.'),
      b('H/F = Homme/Femme (open to all candidates).', 'H/F = Homme/Femme (ouvert à tous).'),
    ],
    [['le télétravail', b('remote work', 'travail à distance')], ['la mutuelle', b('health insurance', 'complémentaire santé')], ['une prime', b('a bonus', 'somme ajoutée au salaire')]],
  ),
  lesson(C, 3, ['second-hand-ads-and-red-flags', 'annonces-occasion-et-pieges'],
    b('Second-hand ads and red flags', 'Occasion et signaux d’alerte'),
    b('Judge product condition, price flexibility and classic online ad scams.', 'Évaluer l’état d’un objet, la négociation et les arnaques classiques.'),
    [b('Read condition and price terms (TBE, ferme)', 'Lire état et prix (TBE, ferme)'), b('Understand handover and payment options', 'Comprendre remise en main propre et paiement'), b('Identify scam warning signs', 'Repérer les signes d’arnaque')],
    13,
    [
      trap(b('Red flags in classified ads', 'Signaux d’alerte dans les annonces'), b('Legitimate ads give clear details, allow **remise en main propre** (in-person handover), and never ask for money before you see an apartment or item. Classic scam signs: **à l’étranger** (abroad), **coupon de paiement**, **envoyer avant visite**, or an unrealistically low price.', 'Les vraies annonces donnent des détails précis, acceptent la **remise en main propre** et ne demandent jamais d’argent avant une visite. Signes d’arnaque : **à l’étranger**, **coupon de paiement**, **payer avant visite** ou prix anormalement bas.')),
      doc(BIKE_AD, b('Can you negotiate the price of the bicycle?', 'Peut-on négocier le prix du vélo ?'), [b('No, the price is firm.', 'Non, le prix est ferme.'), b('Yes, up to 50% off.', 'Oui, jusqu’à moitié prix.'), b('Only if you pay online.', 'Seulement si l’on paie en ligne.'), b('Only with a guarantee.', 'Seulement avec une garantie.')]),
      doc(BIKE_AD, b('How do you get the bicycle?', 'Comment récupère-t-on le vélo ?'), [b('In person in central Nantes', 'En main propre dans le centre de Nantes'), b('By postal parcel', 'Par colis postal'), b('At a shop outside town', 'Dans un magasin hors de la ville'), b('Through a courier with keys', 'Par transporteur')]),
      doc(SCAM_SMS, b('Why is this reply almost certainly a scam?', 'Pourquoi cette réponse est-elle presque sûrement une arnaque ?'), [b('The sender is abroad and asks for a payment voucher before any viewing.', 'L’annonceur est à l’étranger et demande un coupon de paiement avant toute visite.'), b('The apartment is in Paris.', 'L’appartement est à Paris.'), b('The message is polite.', 'Le message est poli.'), b('The rent includes charges.', 'Le loyer est charges comprises.')]),
      sort(b('Safe sign or red flag?', 'Bon signe ou signal d’alerte ?'), [b('reassuring sign', 'bon signe'), b('red flag', 'signal d’alerte')], [['facture d’achat disponible', 0], ['remise en main propre', 0], ['paiement par coupon avant visite', 1], ['vendeur en mission à l’étranger', 1], ['loyer trois fois moins cher que le marché', 1], ['paiement sur place après essai', 0]]),
      pairs(P.match, [['très bon état', b('very good condition', 'TBE')], ['prix ferme', b('non-negotiable price', 'pas négociable')], ['à débattre', b('negotiable', 'discutable')], ['remise en main propre', b('in-person handover', 'donner directement')]]),
      gap(P.complete, 'La facture est ___, et la remise se fait en main ___ sur place.', ['disponible', 'propre']),
    ],
    [
      b('TBE = très bon état; ferme = fixed; à débattre = negotiable.', 'TBE = très bon état ; ferme = fixe ; à débattre = négociable.'),
      b('Never send money or payment codes before visiting.', 'Ne payez jamais avant d’avoir vu le bien ou l’objet.'),
      b('Remise en main propre + facture = safer second-hand trade.', 'Remise en main propre + facture = achat plus sûr.'),
    ],
    [['une facture', b('a receipt, invoice', 'preuve d’achat')], ['en espèces', b('in cash', 'en billets et pièces')], ['une arnaque', b('a scam', 'tromperie financière')]],
  ),
];
