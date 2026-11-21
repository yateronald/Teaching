import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A memo from HR, a safety procedure, the minutes of a team meeting, a job posting: workplace documents are concise, structured and full of specific vocabulary. This course trains you to find what concerns you, what you must do and by when, to follow a procedure, to read meeting minutes (décisions, actions, responsables) and to understand a job posting before you apply.',
    'Une note de service des RH, une procédure de sécurité, le compte rendu d’une réunion d’équipe, une offre d’emploi : les documents professionnels sont concis, structurés et riches en vocabulaire spécifique. Ce cours vous entraîne à trouver ce qui vous concerne, ce que vous devez faire et pour quand, à suivre une procédure, à lire un compte rendu (décisions, actions, responsables) et à comprendre une offre d’emploi avant de postuler.',
  ),
  outcomes: [
    b('Understand a memo and its instructions', 'Comprendre une note de service et ses consignes'),
    b('Follow a work procedure', 'Suivre une procédure de travail'),
    b('Read meeting minutes', 'Lire un compte rendu de réunion'),
    b('Understand a job posting', 'Comprendre une offre d’emploi'),
  ],
};

const MEMO: Doc = { look: 'email', title: b('HR memo', 'Note de service'), text: 'De : Service des ressources humaines\nÀ : Tout le personnel\nObjet : Nouvelle politique de télétravail\n\nÀ compter du 1er septembre, les employés pourront travailler à distance deux jours par semaine, avec l’accord de leur gestionnaire. Les journées de télétravail devront être inscrites dans le calendrier partagé au plus tard le vendredi précédent. Une présence au bureau reste obligatoire le mardi, jour de la réunion d’équipe.' };
const PROC: Doc = { look: 'page', title: b('Procedure', 'Procédure'), text: 'PROCÉDURE EN CAS D’INCENDIE\n\n1. Déclenchez l’alarme la plus proche.\n2. Quittez immédiatement les lieux par l’escalier de secours. N’utilisez pas l’ascenseur.\n3. Fermez les portes derrière vous sans les verrouiller.\n4. Rendez-vous au point de rassemblement (stationnement nord).\n5. Ne retournez pas dans le bâtiment avant l’autorisation des pompiers.\n\nResponsable d’étage : Mme Diallo, poste 214' };
const MINUTES: Doc = { look: 'page', title: b('Meeting minutes', 'Compte rendu de réunion'), text: 'Compte rendu – Réunion d’équipe du 12 mars\nPrésents : A. Martin, K. Benali, S. Roy | Absente excusée : L. Chen\n\n1. Lancement du nouveau site : reporté au 15 avril (retard du fournisseur).\n2. Budget formation : approuvé (3 000 $).\nActions :\n– K. Benali contactera le fournisseur d’ici vendredi.\n– S. Roy préparera le calendrier des formations.\nProchaine réunion : 26 mars, 10 h.' };
const JOB: Doc = { look: 'ad', title: b('Job posting', 'Offre d’emploi'), text: 'Préposé(e) au service à la clientèle – Temps plein\n\nVos tâches : répondre aux appels et aux courriels des clients, traiter les commandes, résoudre les plaintes.\nProfil recherché : diplôme d’études secondaires, un an d’expérience en service à la clientèle, bilinguisme (français et anglais) exigé.\nAtouts : connaissance du logiciel Salesforce.\nConditions : 22 $ / heure, horaire de jour, quatre semaines de vacances.\nPour postuler : envoyez votre CV et une lettre de motivation avant le 30 avril.' };

const C = 'r-workplace-docs';
export default [
  lesson(C, 1, ['memos-and-procedures', 'notes-de-service-et-procedures'],
    b('Memos and procedures', 'Notes de service et procédures'),
    b('Find what changes, what you must do and in which order.', 'Repérer ce qui change, ce que vous devez faire et dans quel ordre.'),
    [b('Read the header of a memo', 'Lire l’en-tête d’une note'), b('Find obligations and deadlines', 'Repérer obligations et délais'), b('Follow a safety procedure', 'Suivre une procédure de sécurité')],
    13,
    [
      card(b('The header tells you a lot', 'L’en-tête en dit long'), b('**De** (from), **À** (to), **Objet** (subject): you know who writes, to whom and why before reading. Then look for **à compter du, au plus tard, obligatoire, devront**.', '**De**, **À**, **Objet** : vous savez qui écrit, à qui et pourquoi avant de lire. Cherchez ensuite **à compter du, au plus tard, obligatoire, devront**.')),
      doc(MEMO, b('How many days of remote work are allowed?', 'Combien de jours de télétravail sont permis ?'), [b('Two per week, with the manager’s approval', 'Deux par semaine, avec l’accord du gestionnaire'), b('Five per week', 'Cinq par semaine'), b('One per month', 'Un par mois'), b('As many as you want', 'Autant qu’on veut')]),
      doc(MEMO, b('Which day must everyone be at the office?', 'Quel jour tout le monde doit-il être au bureau ?'), [b('Tuesday', 'Le mardi'), b('Friday', 'Le vendredi'), b('Monday', 'Le lundi'), b('No day', 'Aucun jour')]),
      doc(PROC, b('In case of fire, what must you not do?', 'En cas d’incendie, que ne faut-il pas faire ?'), [b('Use the lift', 'Prendre l’ascenseur'), b('Close the doors', 'Fermer les portes'), b('Go to the north car park', 'Aller au stationnement nord'), b('Trigger the alarm', 'Déclencher l’alarme')]),
      doc(PROC, b('When can you go back into the building?', 'Quand peut-on retourner dans le bâtiment ?'), [b('When the firefighters allow it', 'Quand les pompiers l’autorisent'), b('After ten minutes', 'Après dix minutes'), b('When the alarm stops', 'Quand l’alarme s’arrête'), b('Immediately', 'Immédiatement')]),
      pairs(P.match, [['le personnel', b('the staff', 'les employés')], ['le gestionnaire', b('the manager', 'le responsable')], ['au plus tard', b('at the latest', 'dernier délai')], ['le point de rassemblement', b('the assembly point', 'lieu de regroupement')]]),
      dict('Les journées de télétravail devront être inscrites au plus tard le vendredi.', { voice: 'm' }),
    ],
    [
      b('Header: De, À, Objet.', 'En-tête : De, À, Objet.'),
      b('Obligation and deadline: devront, obligatoire, au plus tard, à compter du.', 'Obligation et délai : devront, obligatoire, au plus tard, à compter du.'),
      b('Procedures: numbered infinitives or imperatives.', 'Procédures : étapes numérotées à l’impératif ou à l’infinitif.'),
    ],
    [['le télétravail', b('remote work', 'travail à distance')], ['déclencher', b('to trigger', 'mettre en marche')], ['verrouiller', b('to lock', 'fermer à clé')]],
  ),
  lesson(C, 2, ['meeting-minutes', 'comptes-rendus'],
    b('Meeting minutes', 'Les comptes rendus de réunion'),
    b('Find decisions, actions and responsibilities in minutes.', 'Repérer décisions, actions et responsabilités dans un compte rendu.'),
    [b('Find who was present', 'Trouver qui était présent'), b('Distinguish decision and action', 'Distinguer décision et action'), b('Find who does what and when', 'Trouver qui fait quoi et pour quand')],
    13,
    [
      tip(b('Decision ≠ action', 'Décision ≠ action'), b('A **decision** is what was agreed (approuvé, reporté, refusé). An **action** is a task for someone, with a deadline (**X contactera… d’ici vendredi**). Minutes use the **future** for actions.', 'Une **décision** est ce qui a été convenu (approuvé, reporté, refusé). Une **action** est une tâche confiée à quelqu’un, avec un délai (**X contactera… d’ici vendredi**). Les comptes rendus emploient le **futur** pour les actions.')),
      doc(MINUTES, b('Why was the website launch postponed?', 'Pourquoi le lancement du site est-il reporté ?'), [b('Because of a supplier delay', 'À cause du retard d’un fournisseur'), b('Because of the budget', 'À cause du budget'), b('Because L. Chen was absent', 'Parce que L. Chen était absente'), b('Because of training', 'À cause de la formation')]),
      doc(MINUTES, b('What must K. Benali do?', 'Que doit faire K. Benali ?'), [b('Contact the supplier by Friday', 'Contacter le fournisseur d’ici vendredi'), b('Prepare the training calendar', 'Préparer le calendrier des formations'), b('Approve the budget', 'Approuver le budget'), b('Launch the website', 'Lancer le site')]),
      doc(MINUTES, b('Who was absent?', 'Qui était absent ?'), [b('L. Chen', 'L. Chen'), b('S. Roy', 'S. Roy'), b('A. Martin', 'A. Martin'), b('Nobody', 'Personne')]),
      sort(b('Decision or action?', 'Décision ou action ?'), [b('decision', 'décision'), b('action', 'action')], [['Budget formation : approuvé', 0], ['K. Benali contactera le fournisseur', 1], ['Lancement reporté au 15 avril', 0], ['S. Roy préparera le calendrier', 1]]),
      pairs(P.match, [['reporté', b('postponed', 'remis à plus tard')], ['approuvé', b('approved', 'accepté')], ['absent excusé', b('absent with apologies', 'absent prévenu')], ['un fournisseur', b('a supplier', 'entreprise qui livre')]]),
      gap(P.complete, 'Le lancement est ___ au 15 avril et le budget est ___.', ['reporté', 'approuvé']),
    ],
    [
      b('Minutes: présents, absents, points, décisions, actions, prochaine réunion.', 'Compte rendu : présents, absents, points, décisions, actions, prochaine réunion.'),
      b('Decisions: approuvé, reporté, refusé. Actions: future + deadline.', 'Décisions : approuvé, reporté, refusé. Actions : futur + délai.'),
      b('d’ici vendredi = by Friday.', 'd’ici vendredi = au plus tard vendredi.'),
    ],
    [['le lancement', b('the launch', 'mise en service')], ['la formation', b('training', 'apprentissage professionnel')], ['le compte rendu', b('the minutes, report', 'résumé d’une réunion')]],
  ),
  lesson(C, 3, ['job-postings', 'offres-d-emploi'],
    b('Job postings', 'Les offres d’emploi'),
    b('Distinguish the tasks, the requirements, the assets and the conditions.', 'Distinguer les tâches, les exigences, les atouts et les conditions.'),
    [b('Find the tasks and the requirements', 'Repérer les tâches et les exigences'), b('Distinguish exigé and atout', 'Distinguer exigé et atout'), b('Check how to apply', 'Vérifier comment postuler')],
    13,
    [
      card(b('Required or a plus?', 'Exigé ou atout ?'), b('**exigé, requis, obligatoire** = you must have it. **un atout, souhaité, idéalement** = a plus, not essential. **Profil recherché** = desired profile, **tâches / responsabilités**, **conditions** (salary, hours), **pour postuler** = how to apply.', '**exigé, requis, obligatoire** = indispensable. **un atout, souhaité, idéalement** = un plus. **Profil recherché**, **tâches / responsabilités**, **conditions** (salaire, horaire), **pour postuler**.')),
      doc(JOB, b('Which requirement is essential?', 'Quelle exigence est indispensable ?'), [b('Being bilingual French–English', 'Être bilingue français–anglais'), b('Knowing Salesforce', 'Connaître Salesforce'), b('A university degree', 'Un diplôme universitaire'), b('Five years of experience', 'Cinq ans d’expérience')]),
      doc(JOB, b('What is a plus but not required?', 'Qu’est-ce qui est un plus, sans être exigé ?'), [b('Knowing Salesforce', 'Connaître Salesforce'), b('Being bilingual', 'Être bilingue'), b('One year of experience', 'Un an d’expérience'), b('A high-school diploma', 'Un diplôme d’études secondaires')]),
      doc(JOB, b('How do you apply?', 'Comment postuler ?'), [b('Send a CV and a cover letter before 30 April', 'Envoyer un CV et une lettre de motivation avant le 30 avril'), b('Call the company', 'Appeler l’entreprise'), b('Come in person on 30 April', 'Venir en personne le 30 avril'), b('Fill in an online test', 'Faire un test en ligne')]),
      sort(b('Required or a plus?', 'Exigé ou atout ?'), [b('required', 'exigé'), b('a plus', 'atout')], [['bilinguisme exigé', 0], ['connaissance de Salesforce : un atout', 1], ['permis de conduire requis', 0], ['expérience en vente souhaitée', 1], ['diplôme obligatoire', 0], ['idéalement, un deuxième langue', 1]]),
      pairs(P.match, [['postuler', b('to apply', 'poser sa candidature')], ['une lettre de motivation', b('a cover letter', 'lettre de candidature')], ['un atout', b('an asset, a plus', 'avantage')], ['temps plein', b('full-time', 'horaire complet')]]),
      mc(P.meaning, [b('a customer service representative', 'une personne chargée du service à la clientèle'), b('a sales manager', 'un directeur des ventes'), b('a delivery driver', 'un livreur'), b('a cashier only', 'seulement un caissier')], { fr: 'Préposé(e) au service à la clientèle' }),
    ],
    [
      b('exigé / requis = essential; atout / souhaité = a plus.', 'exigé / requis = indispensable ; atout / souhaité = un plus.'),
      b('Sections: tâches, profil recherché, conditions, pour postuler.', 'Rubriques : tâches, profil recherché, conditions, pour postuler.'),
      b('postuler = to apply; une lettre de motivation = a cover letter.', 'postuler = poser sa candidature ; lettre de motivation.'),
    ],
    [['un préposé', b('an attendant, representative (Québec)', 'employé chargé d’un service')], ['traiter', b('to process, to handle', 's’occuper de')], ['une plainte', b('a complaint', 'réclamation')]],
  ),
];
