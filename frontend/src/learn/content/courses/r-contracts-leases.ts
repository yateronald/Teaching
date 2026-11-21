import type { CourseAbout, Doc } from '../../types';
import { b, card, doc, gap, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A lease, an employment contract, the terms of a phone plan: legal and contractual documents use precise, formal wording where every word counts (le locataire s’engage à, sauf mention contraire, résiliation). This course teaches you to read them clause by clause, to identify obligations, rights, deadlines and penalties, and to spot the conditions hidden in the fine print, so you know what you sign. It is a language course, not legal advice.',
    'Un bail, un contrat de travail, les conditions d’un forfait téléphonique : les documents juridiques et contractuels emploient une formulation précise et soutenue où chaque mot compte (le locataire s’engage à, sauf mention contraire, résiliation). Ce cours vous apprend à les lire clause par clause, à repérer obligations, droits, délais et pénalités, et à débusquer les conditions cachées dans les petits caractères, pour savoir ce que vous signez. C’est un cours de langue, pas un conseil juridique.',
  ),
  outcomes: [
    b('Understand the vocabulary of leases and contracts', 'Comprendre le vocabulaire des baux et des contrats'),
    b('Identify obligations, rights and deadlines', 'Repérer obligations, droits et délais'),
    b('Understand termination and penalty clauses', 'Comprendre les clauses de résiliation et de pénalité'),
    b('Ask precise questions before signing', 'Poser des questions précises avant de signer'),
  ],
};

const LEASE: Doc = { look: 'page', title: b('Lease extract', 'Extrait de bail'), text: 'Article 4 – Durée : le présent bail est conclu pour une durée de douze mois, du 1er juillet 2027 au 30 juin 2028.\n\nArticle 5 – Loyer : le loyer mensuel est fixé à 1 450 $, payable le premier jour de chaque mois.\n\nArticle 8 – Obligations du locataire : le locataire s’engage à entretenir le logement et à ne pas le sous-louer sans l’accord écrit du locateur.\n\nArticle 11 – Animaux : les animaux sont interdits, sauf mention contraire au présent bail.' };
const JOB: Doc = { look: 'page', title: b('Employment contract extract', 'Extrait de contrat de travail'), text: 'Période d’essai : l’employé est soumis à une période d’essai de trois mois, au cours de laquelle chacune des parties peut mettre fin au contrat sans préavis.\n\nHoraire : 37,5 heures par semaine. Les heures supplémentaires sont rémunérées à taux majoré de 50 %, sous réserve de l’approbation préalable du superviseur.\n\nConfidentialité : l’employé s’engage à ne divulguer aucune information confidentielle, y compris après la fin de son emploi.' };
const PLAN: Doc = { look: 'page', title: b('Phone plan terms', 'Conditions d’un forfait'), text: 'Forfait Liberté – 35 $ / mois*\n\n*Prix promotionnel valable les 12 premiers mois ; 55 $ / mois par la suite. Engagement de 24 mois. En cas de résiliation avant la fin de l’engagement, des frais équivalant à 50 % des mensualités restantes s’appliquent. Données illimitées : vitesse réduite au-delà de 20 Go par mois.' };

const C = 'r-contracts-leases';
export default [
  lesson(C, 1, ['reading-a-lease', 'lire-un-bail'],
    b('Reading a lease', 'Lire un bail'),
    b('Understand the key clauses of a lease and the vocabulary of renting.', 'Comprendre les clauses clés d’un bail et le vocabulaire de la location.'),
    [b('Understand locataire, locateur, bail', 'Comprendre locataire, locateur, bail'), b('Find duration and rent', 'Trouver la durée et le loyer'), b('Understand s’engage à, sauf mention contraire', 'Comprendre s’engage à, sauf mention contraire')],
    13,
    [
      card(b('Contract French', 'Le français des contrats'), b('**le locataire** (tenant) / **le locateur** or **propriétaire** (landlord); **s’engager à** (to undertake to); **sauf mention contraire** (unless otherwise stated); **le présent bail** (this lease); **sous-louer** (to sublet); **l’accord écrit** (written consent).', '**le locataire** / **le locateur** ou **propriétaire** ; **s’engager à** ; **sauf mention contraire** ; **le présent bail** ; **sous-louer** ; **l’accord écrit**.')),
      doc(LEASE, b('When must the rent be paid?', 'Quand le loyer doit-il être payé ?'), [b('On the first day of each month', 'Le premier jour de chaque mois'), b('At the end of each month', 'À la fin de chaque mois'), b('Every 12 months', 'Tous les 12 mois'), b('On 30 June', 'Le 30 juin')]),
      doc(LEASE, b('Can the tenant sublet the apartment?', 'Le locataire peut-il sous-louer le logement ?'), [b('Only with the landlord’s written consent', 'Seulement avec l’accord écrit du locateur'), b('Yes, freely', 'Oui, librement'), b('Never', 'Jamais'), b('Only after 12 months', 'Seulement après 12 mois')]),
      doc(LEASE, b('Are pets allowed?', 'Les animaux sont-ils permis ?'), [b('No, unless the lease states otherwise', 'Non, sauf mention contraire dans le bail'), b('Yes, always', 'Oui, toujours'), b('Only cats', 'Seulement les chats'), b('Only for 12 months', 'Seulement pendant 12 mois')]),
      pairs(P.match, [['le bail', b('the lease', 'contrat de location')], ['le locataire', b('the tenant', 'personne qui loue')], ['le locateur', b('the landlord', 'propriétaire qui loue')], ['sous-louer', b('to sublet', 'louer à un tiers')]]),
      gap(P.complete, 'Le locataire s’___ à entretenir le logement. Les animaux sont interdits, sauf ___ contraire.', ['engage', 'mention']),
      say('Est-ce que les animaux sont permis dans le logement ?', 'Are pets allowed in the apartment?'),
    ],
    [
      b('locataire (tenant) ≠ locateur / propriétaire (landlord).', 'locataire ≠ locateur / propriétaire.'),
      b('s’engager à = to undertake to (an obligation).', 's’engager à = prendre l’obligation de.'),
      b('sauf mention contraire = unless otherwise stated.', 'sauf mention contraire = sauf indication différente.'),
    ],
    [['entretenir', b('to maintain', 'garder en bon état')], ['mensuel', b('monthly', 'chaque mois')], ['conclu', b('entered into (a contract)', 'signé, établi')]],
  ),
  lesson(C, 2, ['employment-contract', 'contrat-de-travail'],
    b('An employment contract', 'Un contrat de travail'),
    b('Understand probation, working hours, overtime and confidentiality clauses.', 'Comprendre les clauses de période d’essai, d’horaire, d’heures supplémentaires et de confidentialité.'),
    [b('Understand période d’essai, préavis', 'Comprendre période d’essai, préavis'), b('Understand sous réserve de, y compris', 'Comprendre sous réserve de, y compris'), b('Find the conditions of a right', 'Trouver les conditions d’un droit')],
    13,
    [
      tip(b('Watch the conditions', 'Attention aux conditions'), b('A right is often limited by a condition: **sous réserve de** (subject to), **à condition que**, **sauf si**, **dans la limite de**. Read the end of the sentence carefully.', 'Un droit est souvent limité par une condition : **sous réserve de**, **à condition que**, **sauf si**, **dans la limite de**. Lisez attentivement la fin de la phrase.')),
      doc(JOB, b('During the probation period, what can happen?', 'Pendant la période d’essai, que peut-il se passer ?'), [b('Either side can end the contract without notice.', 'Chaque partie peut mettre fin au contrat sans préavis.'), b('The employee cannot leave.', 'L’employé ne peut pas partir.'), b('The salary is doubled.', 'Le salaire est doublé.'), b('The employee works part-time.', 'L’employé travaille à temps partiel.')]),
      doc(JOB, b('When is overtime paid at +50%?', 'Quand les heures supplémentaires sont-elles payées à +50 % ?'), [b('Only if the supervisor approved them beforehand', 'Seulement si le superviseur les a approuvées au préalable'), b('Always', 'Toujours'), b('Never', 'Jamais'), b('After three months', 'Après trois mois')]),
      doc(JOB, b('How long does the confidentiality obligation last?', 'Combien de temps dure l’obligation de confidentialité ?'), [b('Even after the job ends', 'Même après la fin de l’emploi'), b('Three months', 'Trois mois'), b('Only during working hours', 'Seulement pendant les heures de travail'), b('Until the end of the probation period', 'Jusqu’à la fin de la période d’essai')]),
      pairs(P.match, [['la période d’essai', b('the probation period', 'premiers mois d’évaluation')], ['le préavis', b('notice (before leaving)', 'délai d’avertissement')], ['sous réserve de', b('subject to', 'à condition de')], ['divulguer', b('to disclose', 'révéler')]]),
      sort(b('Right or obligation of the employee?', 'Droit ou obligation de l’employé ?'), [b('right', 'droit'), b('obligation', 'obligation')], [['être payé +50 % (avec accord)', 0], ['ne rien divulguer', 1], ['mettre fin au contrat pendant l’essai', 0], ['travailler 37,5 h', 1]]),
      gap(P.complete, 'Les heures supplémentaires sont payées, ___ réserve de l’approbation ___ du superviseur.', ['sous', 'préalable']),
    ],
    [
      b('période d’essai = probation; préavis = notice.', 'période d’essai ; préavis = délai d’avertissement.'),
      b('sous réserve de = subject to; y compris = including.', 'sous réserve de = à condition de ; y compris = même.'),
      b('mettre fin au contrat = to terminate the contract.', 'mettre fin au contrat = rompre le contrat.'),
    ],
    [['les heures supplémentaires', b('overtime', 'heures en plus de l’horaire')], ['majoré', b('increased', 'augmenté')], ['la confidentialité', b('confidentiality', 'secret professionnel')]],
  ),
  lesson(C, 3, ['the-fine-print', 'les-petits-caracteres'],
    b('The fine print: terms and conditions', 'Les petits caractères : conditions générales'),
    b('Spot hidden conditions, commitments and termination fees.', 'Repérer conditions cachées, engagements et frais de résiliation.'),
    [b('Read the asterisk', 'Lire l’astérisque'), b('Understand engagement and résiliation', 'Comprendre engagement et résiliation'), b('Calculate the real cost', 'Calculer le coût réel')],
    13,
    [
      card(b('Read the asterisk', 'Lisez l’astérisque'), b('An attractive price often has an **asterisk (*)**: the conditions are below, in small print. Key words: **prix promotionnel, par la suite, engagement de X mois, résiliation, frais, illimité… au-delà de**.', 'Un prix attractif porte souvent un **astérisque (*)** : les conditions sont en dessous, en petits caractères. Mots clés : **prix promotionnel, par la suite, engagement de X mois, résiliation, frais, illimité… au-delà de**.')),
      doc(PLAN, b('How much will you pay in the second year?', 'Combien paierez-vous la deuxième année ?'), [b('55 $ per month', '55 $ par mois'), b('35 $ per month', '35 $ par mois'), b('Nothing', 'Rien'), b('50 $ per month', '50 $ par mois')]),
      doc(PLAN, b('What happens if you cancel after 10 months?', 'Que se passe-t-il si vous résiliez après 10 mois ?'), [b('You pay fees equal to half of the remaining months', 'Vous payez des frais égaux à la moitié des mois restants'), b('Nothing', 'Rien'), b('You pay all 24 months', 'Vous payez les 24 mois'), b('You get a refund', 'Vous êtes remboursé')]),
      doc(PLAN, b('Is the data really unlimited?', 'Les données sont-elles vraiment illimitées ?'), [b('Yes, but the speed drops after 20 GB', 'Oui, mais la vitesse baisse après 20 Go'), b('Yes, at full speed', 'Oui, à pleine vitesse'), b('No, it stops at 20 GB', 'Non, cela s’arrête à 20 Go'), b('Only the first month', 'Seulement le premier mois')]),
      pairs(P.match, [['la résiliation', b('cancellation, termination', 'fin anticipée d’un contrat')], ['un engagement', b('a commitment (contract term)', 'durée minimale')], ['par la suite', b('afterwards', 'ensuite')], ['les mensualités', b('the monthly payments', 'paiements mensuels')]]),
      mc(P.best, ['Quel sera le prix après la période promotionnelle, et quels sont les frais de résiliation ?', 'C’est gratuit ?', 'Je signe tout de suite.', 'Pourquoi 35 ?'], { fr: 'La bonne question à poser avant de signer :' }),
      say('Avant de signer, j’aimerais connaître les frais de résiliation.', 'Before signing, I’d like to know the cancellation fees.'),
    ],
    [
      b('Read the asterisk: prix promotionnel, par la suite.', 'Lisez l’astérisque : prix promotionnel, par la suite.'),
      b('engagement = minimum term; résiliation = cancellation; frais = fees.', 'engagement = durée minimale ; résiliation = fin anticipée ; frais.'),
      b('« illimité… au-delà de » often hides a limit.', '« illimité… au-delà de » cache souvent une limite.'),
    ],
    [['un forfait', b('a plan, a package', 'offre à prix fixe')], ['illimité', b('unlimited', 'sans limite')], ['s’appliquer', b('to apply', 'être en vigueur')]],
  ),
];
