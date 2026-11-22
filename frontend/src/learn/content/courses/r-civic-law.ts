import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Municipal bylaws, rights charters and public consultation reports affect daily life in every Francophone city—yet their syntax can seem forbidding (« considérant que », « sans préjudice de », « sous réserve de »). At B2, reading civic texts accurately means distinguishing binding rules from exceptions, rights from limits, and majority support from conditional compromises. This course trains you on authentic-style municipal, charter and consultation documents.',
    'Arrêtés municipaux, chartes des droits et bilans de consultations publiques encadrent la vie locale dans tout l’espace francophone, mais leur syntaxe paraît parfois ardue (« considérant que », « sans préjudice de », « sous réserve de »). Au niveau B2, lire ces textes exige de séparer la règle de ses dérogations, le droit de ses limites et l’accord de principe des conditions posées. Ce cours vous entraîne sur ces textes civiques.',
  ),
  outcomes: [
    b('Parse municipal bylaws: grounds, rules, exceptions and penalties', 'Analyser un arrêté municipal : motifs, règles, dérogations et sanctions'),
    b('Identify rights, accessibility duties and appeal paths in charters', 'Identifier droits, obligations d’accessibilité et recours dans une charte'),
    b('Read public consultation summaries and conditional approvals', 'Lire un bilan de consultation publique et les avis sous réserve'),
    b('Master core civic and institutional French vocabulary', 'Maîtriser le vocabulaire civique et institutionnel'),
  ],
};

const BYLAW: Doc = { look: 'notice', title: b('Municipal bylaw', 'Arrêté municipal'), text: 'ARRÊTÉ N° 2026-14 — Tranquillité dans les parcs municipaux\n\nConsidérant la nécessité de préserver le calme des riverains en soirée ;\n\nArticle 1er — L’usage d’appareils sonores amplifiés est interdit dans l’ensemble des parcs communaux entre 21 h et 7 h.\nArticle 2 — Une dérogation exceptionnelle peut être accordée par la mairie pour les manifestations culturelles autorisées, sous réserve d’un dépôt de dossier quinze jours à l’avance.\nArticle 3 — Tout manquement expose le contrevenant à une amende forfaitaire de 68 €.' };
const CHARTER: Doc = { look: 'page', title: b('Civic charter', 'Charte citoyenne'), text: 'CHARTE D’ACCÈS AUX SERVICES PUBLICS\n\n1. Égalité d’accès : Tout usager a droit à un accueil non discriminatoire, sans condition de ressource ni d’origine.\n2. Accessibilité et clarté : La collectivité s’engage à proposer des guichets accessibles aux personnes à mobilité réduite et à rédiger ses courriers en langage clair.\n3. Droit de recours : En cas de désaccord sur une décision administrative, tout citoyen peut saisir gratuitement le médiateur municipal dans un délai de deux mois.' };
const CONSULT: Doc = { look: 'article', title: b('Public consultation report', 'Bilan de consultation'), text: 'CONCERTATION PUBLIQUE — Piétonnisation du centre-ville\n\nÀ l’issue de six semaines d’enquête publique ayant recueilli 1 420 contributions, la commission émet un avis favorable sous réserve de deux aménagements : le maintien d’un créneau de livraison entre 6 h et 9 h 30 pour les commerçants, et le déploiement de navettes électriques gratuites pour les personnes âgées. La phase pilote entrera en vigueur dès le 1er octobre.' };

const C = 'r-civic-law';
export default [
  lesson(C, 1, ['municipal-bylaws-and-scope', 'reglements-municipaux'],
    b('Municipal bylaws: rules and exceptions', 'Arrêtés municipaux : règles et dérogations'),
    b('Separate preamble grounds, binding bans, exceptions and fines in a bylaw.', 'Distinguer motifs, interdictions, dérogations et sanctions dans un arrêté.'),
    [b('Understand Considérant que and Article 1er', 'Comprendre Considérant que et Article 1er'), b('Spot exceptions (dérogation, sous réserve de)', 'Repérer les dérogations et conditions'), b('Identify penalties for non-compliance', 'Identifier les sanctions en cas d’infraction')],
    13,
    [
      card(b('How a French bylaw is built', 'La structure d’un arrêté'), b('1. **Considérant…** = the reason/grounds (preamble, not yet the rule). 2. **Article 1er, 2…** = the binding rules. 3. **Une dérogation** = an official exception (**accordée sous réserve de** = granted subject to). 4. **Tout manquement** = any breach (**amende forfaitaire** = fixed fine).', '1. **Considérant…** = les motifs (préambule). 2. **Article 1er, 2…** = les règles obligatoires. 3. **Une dérogation** = exception officielle (**sous réserve de**). 4. **Tout manquement** = toute infraction (**amende forfaitaire**).')),
      doc(BYLAW, b('When is amplified music banned in municipal parks?', 'Quand les appareils sonores amplifiés sont-ils interdits dans les parcs ?'), [b('Every night from 9 p.m. to 7 a.m.', 'Tous les soirs entre 21 h et 7 h'), b('All day and all night', 'Jour et nuit sans exception'), b('Only during cultural festivals', 'Uniquement pendant les festivals culturels'), b('Within 15 days of a festival', 'Pendant les quinze jours avant une fête')]),
      doc(BYLAW, b('Can a neighbourhood concert ever use amplified sound after 9 p.m.?', 'Un concert de quartier peut-il obtenir du son amplifié après 21 h ?'), [b('Yes, with an official exemption requested 15 days ahead', 'Oui, avec une dérogation demandée 15 jours à l’avance'), b('Yes, if neighbours agree verbally', 'Oui, si les riverains sont d’accord oralement'), b('No, no exemptions exist', 'Non, aucune dérogation n’existe'), b('Yes, by paying 68 € first', 'Oui, en payant 68 € d’avance')]),
      doc(BYLAW, b('Who are « les riverains »?', 'Qui sont « les riverains » ?'), [b('People living near the parks', 'Les habitants vivant à proximité des parcs'), b('Municipal police officers', 'Les agents de la police municipale'), b('Event organisers', 'Les organisateurs d’événements'), b('Tourists visiting town', 'Les touristes de passage')]),
      pairs(P.match, [['une dérogation', b('an official exemption', 'exception autorisée')], ['un manquement', b('a breach, violation', 'non-respect d’une règle')], ['une amende forfaitaire', b('a fixed fine', 'sanction financière fixe')], ['les riverains', b('local residents nearby', 'habitants du voisinage')]]),
      gap(P.complete, 'Une ___ peut être accordée, sous ___ de déposer un dossier quinze jours avant.', ['dérogation', 'réserve']),
    ],
    [
      b('Considérant… states the motive; Articles state the rules.', 'Considérant… donne le motif ; les articles fixent la règle.'),
      b('Dérogation = official exemption; manquement = breach.', 'Dérogation = exception autorisée ; manquement = non-respect.'),
      b('Les riverains = residents living right alongside a street or park.', 'Les riverains = habitants proches d’un lieu.'),
    ],
    [['un arrêté', b('a municipal order, bylaw', 'décision réglementaire locale')], ['le contrevenant', b('the offender', 'personne qui enfreint la règle')], ['préserver', b('to preserve, protect', 'protéger')]],
  ),
  lesson(C, 2, ['rights-charters-and-obligations', 'chartes-des-droits'],
    b('Rights charters and public duties', 'Chartes citoyennes et droits d’accès'),
    b('Read commitments on equality, accessibility and free mediation rights.', 'Lire engagements d’égalité, d’accessibilité et de recours au médiateur.'),
    [b('Distinguish citizen rights from city obligations', 'Distinguer droits des usagers et devoirs de la collectivité'), b('Understand usager, collectivité, saisir', 'Comprendre usager, collectivité, saisir'), b('Locate appeal mechanisms and deadlines', 'Repérer voies de recours et délais')],
    13,
    [
      tip(b('Legal meaning of « saisir »', 'Le sens juridique de « saisir »'), b('In civic texts, **saisir une autorité / le médiateur** does not mean to grab: it means **to formally refer a matter to** an authority or ombudsman! Also note: **un usager** = a public service user · **une collectivité** = local authority · **un guichet** = service counter.', 'Dans les textes civiques, **saisir le médiateur** signifie **faire appel officiellement** à lui ! **Un usager** = utilisateur d’un service public · **Une collectivité** = autorité locale · **Un guichet** = bureau d’accueil.')),
      doc(CHARTER, b('Under Article 1, can access to public reception depend on income?', 'Selon l’article 1, l’accueil dépend-il des revenus de la personne ?'), [b('No, access is equal regardless of income or origin.', 'Non, l’accueil est égal sans condition de ressource ni d’origine.'), b('Yes, low-income residents go first.', 'Oui, selon les revenus.'), b('Only for people with reduced mobility.', 'Seulement pour les personnes à mobilité réduite.'), b('Only if the mediator approves.', 'Seulement après accord du médiateur.')]),
      doc(CHARTER, b('What two commitments does the authority make in Article 2?', 'Quels deux engagements prend la collectivité à l’article 2 ?'), [b('Physical counter accessibility and plain-language letters', 'Des guichets accessibles et des courriers en langage clair'), b('Free parking and extended evening hours', 'Le stationnement gratuit et des horaires nocturnes'), b('Online-only forms and legal jargon', 'Des formulaires uniquement en ligne'), b('Financial aid for every resident', 'Une aide financière pour chaque habitant')]),
      doc(CHARTER, b('What can a citizen do within two months if they disagree with a decision?', 'Que peut faire un citoyen sous deux mois s’il conteste une décision ?'), [b('Refer the case free of charge to the municipal ombudsman', 'Saisir gratuitement le médiateur municipal'), b('Pay a deposit to reopen the counter', 'Payer une caution au guichet'), b('Wait six months before writing', 'Attendre six mois avant d’écrire'), b('Rewrite the charter', 'Modifier la charte lui-même')]),
      sort(b('Citizen right or authority duty?', 'Droit de l’usager ou devoir de la collectivité ?'), [b('citizen right', 'droit de l’usager'), b('authority obligation', 'devoir de la collectivité')], [['recevoir un accueil non discriminatoire', 0], ['proposer des guichets accessibles', 1], ['saisir gratuitement le médiateur', 0], ['rédiger en langage clair', 1]]),
      dict('Tout citoyen peut saisir gratuitement le médiateur dans un délai de deux mois.', { voice: 'm' }),
    ],
    [
      b('Saisir le médiateur = formally bring a case to the ombudsman.', 'Saisir le médiateur = porter un litige devant le médiateur.'),
      b('Un usager = user of a public service; un guichet = service desk.', 'Un usager = bénéficiaire d’un service ; un guichet = point d’accueil.'),
      b('Sans condition de ressource = regardless of income.', 'Sans condition de ressource = quel que soit le revenu.'),
    ],
    [['un usager', b('a public service user', 'personne qui utilise un service public')], ['saisir', b('to refer a case to (authority)', 'porter une affaire devant')], ['un recours', b('an appeal, legal remedy', 'possibilité de contester')]],
  ),
  lesson(C, 3, ['public-consultations-and-amendments', 'consultations-publiques'],
    b('Public consultations and policy trade-offs', 'Consultations publiques et compromis'),
    b('Interpret consultation reports, conditional approval and rollout schedules.', 'Interpréter un bilan de concertation, les avis sous réserve et le calendrier.'),
    [b('Understand avis favorable sous réserve de', 'Comprendre avis favorable sous réserve de'), b('Identify competing local interests', 'Repérer les intérêts en jeu (commerçants, riverains)'), b('Track effective dates and pilot phases', 'Suivre mise en œuvre et phase pilote')],
    13,
    [
      card(b('Consultation vocabulary', 'Vocabulaire de la concertation'), b('**Une concertation / enquête publique** = public consultation · **Émettre un avis favorable sous réserve de** = issue a positive opinion *on condition that*… · **Un aménagement** = adjustment / street design change · **Un créneau** = time slot · **Entrer en vigueur** = take effect.', '**Une concertation / enquête publique** · **Avis favorable sous réserve de** (oui, mais à condition de…) · **Un aménagement** · **Un créneau** (plage horaire) · **Entrer en vigueur** (s’appliquer).')),
      doc(CONSULT, b('How many public submissions were collected?', 'Combien de contributions ont été recueillies ?'), ['1 420', '6', '930', '100']),
      doc(CONSULT, b('Did the commission give an unconditional approval?', 'La commission a-t-elle donné un accord sans condition ?'), [b('No, it approved the project subject to two adjustments.', 'Non, elle donne un avis favorable sous réserve de deux aménagements.'), b('No, it rejected pedestrianisation completely.', 'Non, elle rejette totalement la piétonnisation.'), b('Yes, shops must receive deliveries all day.', 'Oui, les commerçants livrent toute la journée.'), b('It postponed the vote by one year.', 'Elle reporte le projet d’un an.')]),
      doc(CONSULT, b('Who benefits directly from the electric shuttles?', 'À qui bénéficient particulièrement les navettes électriques ?'), [b('Older residents', 'Aux personnes âgées'), b('Delivery drivers after 9:30 a.m.', 'Aux livreurs après 9 h 30'), b('Commuters driving through the centre', 'Aux automobilistes en transit'), b('Shopkeepers at night', 'Aux commerçants la nuit')]),
      pairs(P.match, [['avis favorable sous réserve', b('conditional approval', 'accord avec conditions')], ['entrer en vigueur', b('to come into force', 'commencer à s’appliquer')], ['un créneau horaire', b('a time slot', 'plage horaire')], ['une concertation', b('a public consultation', 'échange avec les citoyens')]]),
      mc(P.meaning, [b('The trial phase starts on 1 October.', 'La période d’essai commence le 1er octobre.'), b('The pilot phase ends on 1 October.', 'La période d’essai se termine le 1er octobre.'), b('The consultation opens on 1 October.', 'La consultation débute le 1er octobre.'), b('The law is cancelled in October.', 'Le règlement est annulé en octobre.')], { fr: 'La phase pilote entrera en vigueur dès le 1er octobre.' }),
      gap(P.complete, 'La commission émet un avis ___ sous ___ d’un créneau de livraison matinal.', ['favorable', 'réserve']),
    ],
    [
      b('Avis favorable sous réserve de = yes, provided these conditions are met.', 'Avis favorable sous réserve de = accord conditionné.'),
      b('Entrer en vigueur = come into force / take effect.', 'Entrer en vigueur = devenir applicable.'),
      b('Spot who wins and what compromises keep balance (deliveries, shuttles).', 'Repérez les compromis entre commerçants, livreurs et résidents.'),
    ],
    [['une enquête publique', b('a public inquiry', 'consultation officielle des habitants')], ['un créneau', b('a time slot', 'intervalle horaire')], ['la piétonnisation', b('pedestrianisation', 'fermeture aux voitures')]],
  ),
];
