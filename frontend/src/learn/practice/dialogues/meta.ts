// The dialogues, situation by situation (A1 → C1 in each), and their addresses:
//   /learn/practice/listening/dialogues/<id>/   /fr/apprendre/pratique/ecoute/dialogues/<id>/
// The content of each situation is a separate download (registry.ts).
import { b, type Lang, type T } from '../../types';
import { listeningPath } from '../listening/catalog';
import type { DialogueLevel, DialogueMeta, ThemeId } from './types';

export const DIALOGUE_SLUG: Record<Lang, string> = { en: 'dialogues', fr: 'dialogues' };

export const THEMES: { id: ThemeId; name: T }[] = [
  { id: 'sante', name: b('Health', 'Santé') },
  { id: 'logement', name: b('Housing', 'Logement') },
  { id: 'travail', name: b('Work', 'Travail') },
  { id: 'demarches', name: b('Paperwork', 'Démarches') },
  { id: 'banque', name: b('Banking', 'Banque') },
  { id: 'transports', name: b('Getting around', 'Transports') },
  { id: 'achats', name: b('Shops and services', 'Achats et services') },
  { id: 'ecole', name: b('School and family', 'École et famille') },
  { id: 'loisirs', name: b('Leisure', 'Loisirs') },
  { id: 'urgences', name: b('Emergencies', 'Urgences') },
];

type Row = [id: string, level: DialogueLevel, title: string, en: string, fr: string];

const ROWS: Record<ThemeId, Row[]> = {
  sante: [
    ['a-la-pharmacie', 'A1', 'À la pharmacie', 'A headache since this morning: what the pharmacist asks and advises.', 'Mal à la tête depuis ce matin : les questions et les conseils de la pharmacienne.'],
    ['prendre-rendez-vous-chez-le-medecin', 'A2', 'Prendre rendez-vous chez le médecin', 'Book an appointment by phone to renew a prescription: the day, the time and what to bring.', 'Prendre rendez-vous au téléphone pour renouveler une ordonnance : le jour, l’heure et ce qu’il faut apporter.'],
    ['la-consultation', 'B1', 'La consultation', 'A week of coughing: the doctor’s questions, the diagnosis and the prescription.', 'Une semaine de toux : les questions du médecin, le diagnostic et l’ordonnance.'],
    ['la-sortie-de-l-hopital', 'B2', 'La sortie de l’hôpital', 'Going home after knee surgery: injections, nurse visits, physio and warning signs.', 'Rentrer après une opération du genou : piqûres, infirmière, kiné et signes d’alerte.'],
    ['choisir-un-traitement', 'C1', 'Choisir un traitement', 'A slipped disc: a specialist sets out the options so the patient can decide.', 'Une hernie discale : une spécialiste expose les options pour que le patient décide.'],
  ],
  logement: [
    ['visiter-un-appartement', 'A1', 'Visiter un appartement', 'A flat to rent: the floor, the rooms, the rent and the charges.', 'Un appartement à louer : l’étage, les pièces, le loyer et les charges.'],
    ['appeler-le-proprietaire', 'A2', 'Appeler le propriétaire', 'The heating has broken down: a tenant calls her landlord.', 'Le chauffage est en panne : une locataire appelle son propriétaire.'],
    ['l-etat-des-lieux', 'B1', 'L’état des lieux', 'Moving in: the room-by-room inspection, and why every detail counts.', 'L’emménagement : l’état des lieux pièce par pièce, et pourquoi chaque détail compte.'],
    ['le-depot-de-garantie', 'B2', 'Le dépôt de garantie', 'A deposit not returned: normal wear and tear, deadlines and arguments.', 'Un dépôt non rendu : usure normale, délais et arguments.'],
    ['l-assemblee-de-copropriete', 'C1', 'L’assemblée de copropriété', 'Two co-owners weigh up costly insulation work before the vote.', 'Deux copropriétaires pèsent de coûteux travaux d’isolation avant le vote.'],
  ],
  travail: [
    ['le-premier-jour', 'A1', 'Le premier jour', 'A new job: the desk, the lunch break, the canteen and the hours.', 'Un nouvel emploi : le bureau, la pause déjeuner, la cantine et les horaires.'],
    ['un-changement-d-horaire', 'A2', 'Un changement d’horaire', 'A manager asks an employee to work on Saturday morning, with a day off in return.', 'Un responsable demande à une employée de venir le samedi matin, contre un jour de repos.'],
    ['l-entretien-d-embauche', 'B1', 'L’entretien d’embauche', 'A job interview for a hotel receptionist: experience, languages, availability.', 'Un entretien pour un poste de réceptionniste : expérience, langues, disponibilités.'],
    ['l-entretien-annuel', 'B2', 'L’entretien annuel', 'The yearly review: results, career development and training.', 'L’entretien annuel : bilan, évolution de carrière et formation.'],
    ['negocier-le-teletravail', 'C1', 'Négocier le télétravail', 'An employee argues for two days of remote work with a reluctant director.', 'Une salariée défend deux jours de télétravail face à un directeur réservé.'],
  ],
  demarches: [
    ['a-la-mairie', 'A1', 'À la mairie', 'Renewing an identity card: the appointment and the documents.', 'Refaire sa carte d’identité : le rendez-vous et les documents.'],
    ['rendez-vous-a-la-prefecture', 'A2', 'Rendez-vous à la préfecture', 'Renewing a residence permit: the online file, fingerprints, waiting time and the right to work.', 'Renouveler un titre de séjour : le dossier en ligne, les empreintes, le délai et le droit de travailler.'],
    ['un-dossier-a-la-caf', 'B1', 'Un dossier à la CAF', 'Housing benefit with no news: a missing document and what to do.', 'Une aide au logement sans nouvelles : la pièce qui manque et la marche à suivre.'],
    ['une-erreur-sur-les-impots', 'B2', 'Une erreur sur les impôts', 'A tax bill that seems wrong: understanding it and correcting the return.', 'Un avis d’impôt qui semble faux : le comprendre et corriger la déclaration.'],
    ['contester-une-decision', 'C1', 'Contester une décision', 'Challenging an overpayment claim: the appeal, the evidence and the deadlines.', 'Contester un trop-perçu : le recours, les preuves et les délais.'],
  ],
  banque: [
    ['ouvrir-un-compte', 'A1', 'Ouvrir un compte', 'Just arrived in France: the documents needed to open a bank account.', 'Tout juste arrivée en France : les documents pour ouvrir un compte.'],
    ['ma-carte-est-bloquee', 'A2', 'Ma carte est bloquée', 'Payments refused: why the card is blocked and how to unblock it.', 'Des paiements refusés : pourquoi la carte est bloquée et comment la débloquer.'],
    ['une-question-de-credit', 'B1', 'Une question de crédit', 'A car loan: amount, length, monthly payments and total cost.', 'Un crédit auto : montant, durée, mensualités et coût total.'],
    ['un-prelevement-conteste', 'B2', 'Un prélèvement contesté', 'An unknown direct debit after a fake website: blocking it and getting refunded.', 'Un prélèvement inconnu après un faux site : le bloquer et se faire rembourser.'],
    ['conseils-pour-epargner', 'C1', 'Conseils pour épargner', 'Emergency savings or long-term savings: general information, not personal advice.', 'Épargne de précaution ou de long terme : des informations générales, pas un conseil personnalisé.'],
  ],
  transports: [
    ['un-ticket-de-bus', 'A1', 'Un ticket de bus', 'Buy a ticket, know how long it lasts and find the right bus.', 'Acheter un ticket, savoir combien de temps il dure et trouver le bon bus.'],
    ['demander-son-chemin', 'A2', 'Demander son chemin', 'Asking the way to a museum: directions, the tram line and the ticket.', 'Demander le chemin d’un musée : itinéraire, ligne de tram et ticket.'],
    ['un-train-en-retard', 'B1', 'Un train en retard', 'Over two hours late and a missed connection: refund and the next train.', 'Plus de deux heures de retard et une correspondance ratée : remboursement et prochain train.'],
    ['la-voiture-de-location', 'B2', 'La voiture de location', 'A scratch on a rental car: the excess, the proof and the receipt.', 'Une rayure sur une voiture de location : la franchise, la preuve et le reçu.'],
    ['les-transports-de-demain', 'C1', 'Les transports de demain', 'A low-emission zone: fair in substance, unfair in form? Two colleagues debate.', 'Une zone à faibles émissions : juste sur le fond, injuste dans la forme ? Deux collègues débattent.'],
  ],
  achats: [
    ['a-la-boulangerie', 'A1', 'À la boulangerie', 'A baguette, croissants and a slice of tart: ordering and paying.', 'Une baguette, des croissants et une part de tarte : commander et payer.'],
    ['rendre-un-article', 'A2', 'Rendre un article', 'Shoes too small: exchange, credit note or refund?', 'Des chaussures trop petites : échange, avoir ou remboursement ?'],
    ['chez-le-reparateur', 'B1', 'Chez le réparateur', 'A broken phone screen: diagnosis, two prices, guarantee and timing.', 'Un écran de téléphone cassé : diagnostic, deux prix, garantie et délai.'],
    ['reclamation-chez-l-operateur', 'B2', 'Réclamation chez l’opérateur', 'Ten days without internet: compensation, extra costs and a deadline.', 'Dix jours sans internet : dédommagement, frais engagés et ultimatum.'],
    ['negocier-un-devis', 'C1', 'Négocier un devis', 'A kitchen quote over budget: materials, lead time, penalties and deposit.', 'Un devis de cuisine trop cher : matériaux, délais, pénalités et acompte.'],
  ],
  ecole: [
    ['inscrire-son-enfant', 'A1', 'Inscrire son enfant', 'Enrolling a six-year-old: class, documents, hours and the canteen.', 'Inscrire un enfant de six ans : classe, documents, horaires et cantine.'],
    ['rencontre-avec-l-enseignant', 'A2', 'Rencontre avec l’enseignante', 'A tired pupil: sleep, screens, and how to help with numbers at home.', 'Un élève fatigué : sommeil, écrans, et comment l’aider en calcul à la maison.'],
    ['une-place-en-creche', 'B1', 'Une place en crèche', 'Childcare for a baby: the nursery committee, a childminder and the allowances.', 'Faire garder un bébé : la commission de crèche, l’assistante maternelle et les aides.'],
    ['un-probleme-de-harcelement', 'B2', 'Un problème de harcèlement', 'Insulting messages in a class group chat: what the school does, and the 3018.', 'Des messages insultants dans un groupe de classe : ce que fait le collège, et le 3018.'],
    ['choisir-son-orientation', 'C1', 'Choisir son orientation', 'Prépa or BUT? A careers adviser helps a pupil with her Parcoursup choices.', 'Prépa ou BUT ? Un conseiller aide une lycéenne à faire ses vœux Parcoursup.'],
  ],
  loisirs: [
    ['une-invitation', 'A1', 'Une invitation', 'A birthday party: the time, the address and what to bring.', 'Une fête d’anniversaire : l’heure, l’adresse et ce qu’on apporte.'],
    ['reserver-au-restaurant', 'A2', 'Réserver au restaurant', 'Booking a table by phone: day, time, number of people and a vegetarian dish.', 'Réserver une table au téléphone : jour, heure, nombre de personnes et plat végétarien.'],
    ['s-inscrire-au-club', 'B1', 'S’inscrire au club', 'Adult swimming classes: times, price, medical certificate and a free trial.', 'Des cours de natation pour adultes : horaires, prix, certificat médical et cours d’essai.'],
    ['organiser-un-voyage-entre-amis', 'B2', 'Organiser un voyage entre amis', 'A weekend in Brittany: budget, rain plan, the journey and a tight budget.', 'Un week-end en Bretagne : budget, plan B contre la pluie, le trajet et un budget serré.'],
    ['le-club-de-lecture', 'C1', 'Le club de lecture', 'An open ending, an unreliable narrator: two readers debate a novel.', 'Une fin ouverte, une narratrice peu fiable : deux lecteurs débattent d’un roman.'],
  ],
  urgences: [
    ['un-sac-perdu', 'A1', 'Un sac perdu', 'A bag left on the train: describing it and getting it back.', 'Un sac oublié dans le train : le décrire et le récupérer.'],
    ['appeler-un-serrurier', 'A2', 'Appeler un serrurier', 'Locked out: the address, the waiting time and the price.', 'Bloqué dehors : l’adresse, le délai et le prix.'],
    ['une-panne-sur-la-route', 'B1', 'Une panne sur la route', 'A motorway breakdown: safety first, the approved tow truck and what is covered.', 'Une panne sur l’autoroute : la sécurité d’abord, le dépanneur agréé et les garanties.'],
    ['porter-plainte-pour-un-vol', 'B2', 'Porter plainte pour un vol', 'A wallet stolen on the metro: the complaint, the receipt and the replacement cards.', 'Un portefeuille volé dans le métro : la plainte, le récépissé et les cartes à refaire.'],
    ['appeler-le-15', 'C1', 'Appeler le 15', 'A man collapses: the emergency doctor guides chest compressions and the defibrillator.', 'Un homme s’effondre : le médecin du SAMU guide le massage cardiaque et le défibrillateur.'],
  ],
};

/** Situation by situation, A1 → C1 in each. */
export const DIALOGUES: DialogueMeta[] = THEMES.flatMap(t => ROWS[t.id].map(([id, level, title, en, fr]) => ({ id, theme: t.id, level, title, summary: b(en, fr) })));

export const dialogueById = (id: string) => DIALOGUES.find(d => d.id === id);
export const themeOf = (id: ThemeId) => THEMES.find(t => t.id === id)!;
export const dialoguePath = (d: DialogueMeta, lang: Lang) => `${listeningPath(lang)}${DIALOGUE_SLUG[lang]}/${d.id}/`;
/** The picture of a dialogue (scripts/learn-images.json). */
export const dialogueCoverKey = (d: { id: string }) => `dialogue-${d.id}`;
/** The dialogues on the listening library. */
export const dialoguesPath = (lang: Lang) => `${listeningPath(lang)}#dialogues`;
