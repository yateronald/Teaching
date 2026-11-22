import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Buying, selling or renting property in France or Québec involves rich vocabulary: bright exposures, condo fees, energy ratings, mortgages, leases and meticulous move-in inspections. A single misunderstood clause in an état des lieux or mortgage sheet can prove costly. This B1 course prepares estate agents, buyers and relocating professionals to describe properties, lead viewings, discuss financing and leases, and write clear follow-up emails.',
    'Acheter, vendre ou louer un bien immobilier en France ou au Québec mobilise un vocabulaire précis : exposition, charges de copropriété, diagnostic énergétique, prêt hypothécaire, bail et état des lieux. Mal comprendre une ligne du contrat ou de la fiche peut coûter cher. Ce cours de niveau B1 entraîne agents, acheteurs et expatriés à décrire un logement, mener une visite, parler financement et rédiger un suivi.',
  ),
  outcomes: [
    b('Describe property features, layout and building fees during a viewing', 'Décrire atouts d’un bien, agencement et charges lors d’une visite'),
    b('Discuss mortgages, deposits, leases and closing costs clearly', 'Expliquer prêt immobilier, dépôt de garantie, bail et frais de notaire'),
    b('Conduct or respond to a move-in/move-out property inspection', 'Gérer un état des lieux d’entrée ou de sortie sans litige'),
    b('Write a professional post-viewing summary email', 'Rédiger un courriel récapitulatif professionnel après visite'),
  ],
};

const C = 'bz-real-estate';
export default [
  lesson(C, 1, ['describing-properties-and-leading-viewings', 'decrire-un-bien-et-visite'],
    b('Describing properties and leading viewings', 'Décrire un bien et mener une visite'),
    b('Highlight layout, exposure and energy performance while answering client questions.', 'Valoriser agencement, luminosité et diagnostic tout en répondant aux questions.'),
    [b('Use property feature terms (exposition, double vitrage, DPE)', 'Employer exposition, double vitrage, charges, DPE'), b('Present strengths honestly during a viewing', 'Présenter les atouts avec justesse en visite'), b('Respond politely to practical concerns', 'Répondre aux questions pratiques des visiteurs')],
    13,
    [
      card(b('Property viewing language', 'Vocabulaire de la visite'), b('**Traversant / lumineux** = dual-aspect / bright · **Exposé plein sud** = south-facing · **Parquet d’origine** = original hardwood floor · **Double vitrage** = double glazing · **Charges de copropriété** = condo/building fees · **DPE (diagnostic énergétique)** = energy rating · **Cave / local à vélos** = cellar / bike room.', '**Traversant / lumineux** · **Exposé plein sud** · **Parquet d’origine** · **Double vitrage** · **Charges de copropriété** · **DPE** (performance énergétique) · **Cave / local à vélos**.')),
      dlg(b('Apartment viewing in Bordeaux', 'Visite d’appartement à Bordeaux'), undefined, [['Agent immobilier', 'm'], ['Cliente', 'f']], [
        [0, 'Voici le séjour : il est exposé plein sud avec du double vitrage sur toute la façade.', 'Here is the living room: it faces due south with double glazing along the front.'],
        [1, { options: ['C’est très lumineux ! Quel est le montant des charges de copropriété ?', 'C’est trop cher !', 'Je veux partir maintenant.'] }],
        [0, 'Elles s’élèvent à 140 € par mois, eau froide et entretien de l’ascenseur compris.', 'They are 140 € per month, including cold water and lift maintenance.'],
        [1, { options: ['Très bien. Et le chauffage, il est individuel ou collectif ?', 'Donnez-moi les clés.', 'Combien coûte l’ascenseur ?'] }],
      ]),
      pairs(P.match, [['exposé plein sud', b('south-facing', 'orienté vers le soleil du midi')], ['le double vitrage', b('double glazing', 'fenêtre isolante à deux vitres')], ['les charges de copropriété', b('building service charges', 'frais communs de l’immeuble')], ['traversant', b('dual-aspect (windows on two sides)', 'ouvert sur deux façades')]]),
      mc(P.best, ['L’appartement est traversant, calme côté cour et classé C au diagnostic énergétique.', 'L’appartement a quatre murs et une porte.', 'C’est joli, achetez vite.', 'Il y a du soleil parfois.'], { fr: 'Un acheteur vous demande les points forts du bien :' }),
      gap(P.complete, 'Le séjour est très lumineux grâce au ___ vitrage et à son exposition plein ___.', ['double', 'sud']),
      say('Le séjour est traversant et exposé plein sud, avec du double vitrage et une cave au sous-sol.', 'The living room is dual-aspect and south-facing, with double glazing and a cellar in the basement.'),
    ],
    [
      b('Highlight orientation (plein sud), insulation (double vitrage) and energy class (DPE).', 'Mettez en avant orientation, isolation (double vitrage) et DPE.'),
      b('Always clarify what charges de copropriété include (water, lift, heating).', 'Précisez toujours ce que couvrent les charges (eau, ascenseur, chauffage).'),
      b('Traversant = windows on opposite sides, letting light and air through.', 'Traversant = ouvert sur deux côtés opposés (lumière et aération).'),
    ],
    [['la copropriété', b('co-owned building / condo', 'immeuble à plusieurs propriétaires')], ['traversant', b('dual-aspect', 'qui donne sur deux côtés')], ['une cave', b('a basement storage cellar', 'pièce de rangement au sous-sol')]],
  ),
  lesson(C, 2, ['leases-deposits-and-mortgages', 'baux-et-financement'],
    b('Leases, mortgages and closing costs', 'Baux, financement et frais d’achat'),
    b('Navigate rental leases, deposits, mortgage terms and notary fees.', 'Comprendre bail de location, dépôt de garantie, prêt et frais de notaire.'),
    [b('Separate rental vocabulary from buying terms', 'Distinguer location et achat immobilier'), b('Read a buyer’s financing summary sheet', 'Lire une fiche de financement immobilier'), b('Understand compromis de vente and frais de notaire', 'Comprendre compromis de vente et frais de notaire')],
    13,
    [
      card(b('Renting vs buying in French', 'Louer ou acheter'), b('Renting: **le bail** (lease), **le dépôt de garantie** (security deposit), **le garant** (guarantor), **le préavis** (notice period). Buying: **l’apport personnel** (down payment), **le prêt immobilier / hypothèque** (mortgage), **le taux d’intérêt** (interest rate), **le compromis de vente** (preliminary sales contract), **les frais de notaire**.', 'Location : **le bail**, **le dépôt de garantie**, **le garant**, **le préavis**. Achat : **l’apport personnel**, **le prêt immobilier / hypothèque**, **le taux d’intérêt**, **le compromis de vente**, **les frais de notaire**.')),
      doc({ look: 'page', title: b('Financing summary', 'Simulation de financement'), text: 'Acquisition : Appartement 280 000 €\nApport personnel : 40 000 € · Emprunt : 240 000 € sur 20 ans\nTaux fixe : 3,4 % · Mensualité estimée : 1 380 € (hors assurance)\nFrais de notaire estimés : 21 500 €\n\nCondition suspensive d’obtention de prêt : 45 jours après la signature du compromis.' }, b('What protects the buyer if the bank refuses the mortgage?', 'Qu’est-ce qui protège l’acheteur si la banque refuse le prêt ?'), [b('The suspensive financing clause valid for 45 days', 'La condition suspensive de prêt valable 45 jours'), b('Paying the notary fees immediately', 'Payer tout de suite les frais de notaire'), b('Reducing the down payment to zero', 'Supprimer l’apport personnel'), b('Changing the fixed rate to 20 years', 'Passer au taux fixe sur 20 ans')]),
      hear('Pour le dossier de location, merci de nous transmettre vos trois derniers bulletins de salaire, votre avis d’imposition et la pièce d’identité de votre garant avant vendredi.', b('Which document is NOT asked for in the voicemail?', 'Quel document N’est PAS demandé dans ce message ?'), [b('A bank mortgage offer', 'Une offre de prêt bancaire'), b('Three recent pay slips', 'Trois bulletins de salaire'), b('A tax notice', 'Un avis d’imposition'), b('The guarantor’s ID card', 'La pièce d’identité du garant')], { voice: 'f' }),
      sort(b('Renting or buying?', 'Location ou achat ?'), [b('renting (location)', 'location'), b('buying (achat)', 'achat')], [['le dépôt de garantie', 0], ['le compromis de vente', 1], ['le préavis de départ', 0], ['les frais de notaire', 1], ['l’apport personnel', 1], ['la quittance de loyer', 0]]),
      pairs(P.match, [['l’apport personnel', b('down payment / equity', 'somme déjà disponible')], ['le taux d’intérêt', b('interest rate', 'pourcentage du prêt')], ['le compromis de vente', b('preliminary sales agreement', 'avant-contrat d’achat')], ['le préavis', b('notice period to leave', 'délai avant de quitter')]]),
      gap(P.complete, 'La signature du ___ de vente lance un délai de 45 jours pour obtenir votre ___ immobilier.', ['compromis', 'prêt']),
    ],
    [
      b('Condition suspensive = protective clause cancelling purchase if loan fails.', 'Condition suspensive = clause protégeant l’acheteur si le prêt est refusé.'),
      b('Apport = cash down payment; emprunt = borrowed amount; mensualité = monthly repayment.', 'Apport = somme personnelle ; emprunt = crédit ; mensualité = paiement mensuel.'),
      b('In France, a notary handles the deed and taxes (frais de notaire).', 'En France, le notaire enregistre la vente et perçoit droits et frais.'),
    ],
    [['une mensualité', b('a monthly loan payment', 'somme remboursée chaque mois')], ['un garant', b('a rental guarantor', 'personne qui garantit le paiement')], ['le notaire', b('the notary / conveyancer', 'officier public qui rédige l’acte')]],
  ),
  lesson(C, 3, ['inspections-and-property-emails', 'etat-des-lieux-et-suivi'],
    b('Inspections and post-viewing emails', 'État des lieux et courriel de suivi'),
    b('Record property condition accurately and write a polished follow-up email.', 'Rédiger un état des lieux précis et envoyer un suivi clair après une visite.'),
    [b('Distinguish normal wear from tenant damage', 'Distinguer usure normale et dégradation'), b('Describe small defects neutrally in French', 'Décrire un défaut avec objectivité'), b('Write a professional post-viewing follow-up email', 'Rédiger un courriel de suivi après visite')],
    13,
    [
      card(b('Property inspection (état des lieux)', 'L’état des lieux'), b('**L’état des lieux d’entrée / de sortie** compares the flat when moving in and out. Describe objectively: **en bon état**, **trace d’usure normale** (normal wear), **légère fissure** (hairline crack), **robinet qui fuit** (dripping tap), **peinture écaillée** (peeling paint), **remise en état à la charge du propriétaire**.', '**État des lieux d’entrée / de sortie** : **en bon état**, **usure normale**, **légère fissure**, **robinet qui fuit**, **peinture écaillée**, **travaux à la charge du propriétaire**.')),
      mc(P.best, ['Le mur du couloir présente une usure normale d’usage, et le robinet de la cuisine fuit légèrement.', 'Les murs sont horribles et tout est cassé.', 'Tout est parfait, rien à noter (même si le robinet fuit).', 'Vous devez payer une nouvelle cuisine.'], { fr: 'Lors d’un état des lieux objectif, vous notez :' }),
      pairs(P.match, [['l’usure normale', b('normal wear and tear', 'vieillissement normal')], ['un robinet qui fuit', b('a leaking tap', 'robinet qui goutte')], ['une fissure', b('a crack', 'fente dans un mur')], ['à la charge du bailleur', b('paid by the landlord', 'aux frais du propriétaire')]]),
      write(b('Post-viewing follow-up email', 'Courriel de suivi après visite'), b('Write a follow-up email (55–90 words) after showing an apartment to a prospective tenant: thank them for visiting rue Pasteur, highlight two features (bright living room, balcony), state the monthly rent (980 € CC) and available date (1 June), and list the documents needed to apply.', 'Rédigez un courriel de suivi (55–90 mots) après une visite : remerciez pour la visite rue Pasteur, rappelez deux atouts (séjour lumineux, balcon), indiquez loyer (980 € CC) et disponibilité (1er juin), et listez les pièces du dossier.'), 55, 90, [
        b('Warm thanks and street reference', 'Remerciements et adresse du bien'),
        b('Two key features + rent and availability date', 'Deux atouts, loyer CC et date d’entrée'),
        b('Required documents and next step', 'Liste des pièces et suite proposée'),
      ], 'Bonjour Madame Martin,\n\nJe vous remercie pour votre visite de l’appartement rue Pasteur ce matin. Comme vu ensemble, ce deux-pièces offre un séjour lumineux exposé sud et un agréable balcon sur cour.\n\nLe loyer est de 980 € charges comprises, avec une disponibilité au 1er juin. Si vous souhaitez déposer votre candidature, merci de me transmettre votre pièce d’identité, votre contrat de travail et vos trois derniers bulletins de salaire.\n\nBien cordialement,\nClaire Bernard'),
      gap(P.complete, 'Nous avons comparé l’état des lieux de ___ avec celui d’___ avant de rendre le dépôt.', ['sortie', 'entrée']),
      say('Tout est noté sur l’état des lieux d’entrée : les murs sont propres, seul le robinet fuit légèrement.', 'Everything is noted on the move-in inspection: the walls are clean, only the tap leaks slightly.'),
    ],
    [
      b('Compare move-in (entrée) and move-out (sortie) inspections line by line.', 'Comparez l’état des lieux d’entrée et de sortie point par point.'),
      b('Usure normale (normal ageing) cannot be deducted from the deposit.', 'L’usure normale ne doit pas être retenue sur le dépôt de garantie.'),
      b('Post-viewing emails recap key terms (rent CC, date) + application documents.', 'Le suivi après visite rappelle loyer, date et pièces du dossier.'),
    ],
    [['l’état des lieux', b('property condition inspection', 'inventaire d’entrée ou de sortie')], ['le bailleur', b('the landlord', 'propriétaire qui loue')], ['l’usure', b('wear and tear', 'dégradation due au temps')]],
  ),
];
