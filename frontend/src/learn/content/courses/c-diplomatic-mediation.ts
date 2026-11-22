import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'When two colleagues, partners or teams reach an impasse, how you reframe tension in French determines whether positions harden or open up. This C1 course trains the language of diplomatic mediation: translating heated accusations into neutral underlying needs, bridging opposing priorities through shared goals, and crafting face-saving, measurable exits such as trial phases and review clauses (clauses de revoyure).',
    'Lorsque deux collègues, partenaires ou équipes se retrouvent dans l’impasse, la manière de reformuler la tension en français décide du blocage ou de la sortie de crise. Ce cours C1 entraîne les outils de la médiation diplomatique : traduire des reproches vifs en besoins neutres, rapprocher des priorités opposées autour d’un socle commun et formuler des issues honorables avec phase pilote et clause de revoyure.',
  ),
  outcomes: [
    b('Reframe emotional complaints into neutral needs', 'Reformuler des reproches vifs en besoins neutres'),
    b('Bridge opposing views around shared goals', 'Rapprocher des positions opposées sur un socle commun'),
    b('Propose face-saving exits and trial clauses', 'Proposer une sortie honorable et une clause de revoyure'),
    b('Draft structured diplomatic mediation proposals', 'Rédiger une proposition de médiation équilibrée'),
  ],
};

const C = 'c-diplomatic-mediation';
export default [
  lesson(C, 1, ['neutral-reframing-and-empathy', 'reformuler-sans-prendre-parti'],
    b('Neutral reframing without taking sides', 'Reformuler sans prendre parti'),
    b('Defuse heated remarks by translating accusations into neutral underlying interests.', 'Désamorcer des propos vifs en traduisant les reproches en besoins neutres.'),
    [b('Distinguish inflammatory language from neutral reframing', 'Distinguer propos inflammatoires et reformulation neutre'), b('Name concerns without assigning blame', 'Nommer une préoccupation sans accuser'), b('Validate both sides before moving forward', 'Valider chaque point de vue sans trancher')],
    13,
    [
      card(b('From blame to needs', 'Des reproches aux besoins'), b('Replace loaded accusations with neutral needs: **Si je comprends bien, votre priorité porte sur… · Ce qui vous préoccupe avant tout, c’est… · Pour traduire votre attente en termes concrets… · J’entends le besoin de clarté de part et d’autre.**', 'Remplacez les accusations par des besoins neutres : **Si je comprends bien, votre priorité porte sur… · Ce qui vous préoccupe avant tout, c’est… · Pour traduire votre attente en termes concrets… · J’entends le besoin de clarté de part et d’autre.**'), {
        ex: [['Vous attachez tous deux de l’importance à la fiabilité du calendrier.', 'You both attach importance to a reliable schedule.'], ['Votre principale réserve concerne donc la répartition de la charge.', 'Your main reservation thus concerns workload distribution.']],
      }),
      sort(b('Escalates tension or neutral reframing?', 'Envenime le débat ou reformule avec tact ?'), [b('escalates tension', 'envenime le débat'), b('neutral reframing', 'reformulation neutre')], [['Vous bloquez tout par mauvaise foi.', 0], ['Si je vous suis bien, vous craignez un manque de visibilité sur les délais.', 1], ['C’est absurde de refuser un tel compromis.', 0], ['Votre principale réserve concerne donc l’équilibre de la charge de travail.', 1], ['Il faut arrêter de faire perdre du temps à l’équipe.', 0], ['Chacun cherche avant tout à sécuriser la qualité du rendu final.', 1]]),
      mc(P.best, ['Si je traduis votre ressenti, vous avez besoin d’un cadre stable et d’être consulté en amont des décisions.', 'Votre collègue a effectivement très mauvais caractère.', 'Arrêtez d’exagérer, personne ne change les règles.', 'Vous avez tort de vous énerver autant pour un détail.'], { fr: 'Un collaborateur lance : « Il ne m’écoute jamais et change les règles au dernier moment ! »' }),
      hear('Avant que chacun ne campe sur ses positions, j’aimerais vérifier que j’ai bien saisi vos deux priorités : d’un côté, la maîtrise des coûts ; de l’autre, le respect des délais de livraison.', b('What is the mediator doing first?', 'Que fait d’abord la médiatrice ?'), [b('verifying both sides’ core priorities neutrally', 'vérifier de façon neutre les priorités des deux parties'), b('choosing cost control over delivery deadlines', 'choisir la maîtrise des coûts avant les délais'), b('ending the meeting because positions are fixed', 'clore la réunion faute d’accord'), b('criticising both teams for poor planning', 'critiquer la planification des deux équipes')], { voice: 'f' }),
      pairs(P.match, [['les besoins sous-jacents', b('underlying needs', 'attentes réelles derrière les mots')], ['camper sur ses positions', b('to dig one’s heels in', 'refuser tout compromis')], ['prendre parti', b('to take sides', 'soutenir un camp contre l’autre')], ['en amont', b('upstream, beforehand', 'avant la décision finale')]]),
      say('Si je vous comprends bien, votre préoccupation centrale porte sur la prévisibilité du calendrier.', 'If I understand you correctly, your central concern relates to schedule predictability.'),
    ],
    [
      b('Translate accusations into underlying needs without taking sides.', 'Traduire les reproches en besoins sous-jacents sans prendre parti.'),
      b('Si je résume votre priorité… · Votre principale réserve porte sur…', 'Si je résume votre priorité… · Votre principale réserve porte sur…'),
      b('Verify comprehension before proposing solutions.', 'Vérifier la compréhension avant de proposer une issue.'),
    ],
    [['sous-jacent', b('underlying', 'caché sous la surface')], ['camper sur', b('to dig in on (positions)', 'rester figé sur')], ['en amont', b('upstream / early on', 'au début du processus')]],
  ),
  lesson(C, 2, ['bridging-opposing-positions', 'rapprocher-les-points-de-vue'],
    b('Bridging opposing positions', 'Rapprocher les points de vue'),
    b('Isolate facts from interpretations and establish common ground between two sides.', 'Distinguer faits et interprétations et bâtir un socle commun entre deux camps.'),
    [b('Use concessive frames to link priorities', 'Relier deux priorités par la concession'), b('Separate verifiable facts from assumptions', 'Séparer faits vérifiables et interprétations'), b('Build momentum around a shared goal', 'Créer une dynamique autour d’un but commun')],
    13,
    [
      card(b('Finding the shared core', 'Identifier le socle commun'), b('Bridge two demands: **Tout en reconnaissant l’urgence de…, il convient également d’intégrer… · Au-delà de votre désaccord sur la méthode, vous partagez le même objectif. · Ce qui nous réunit ici, c’est la volonté de… · Distinguons d’abord les faits vérifiables des interprétations.**', 'Relier deux exigences : **Tout en reconnaissant l’urgence de…, il convient également d’intégrer… · Au-delà de votre désaccord sur la méthode, vous partagez le même objectif. · Ce qui nous réunit ici, c’est la volonté de… · Distinguons d’abord les faits vérifiables des interprétations.**'), {
        ex: [['Tout en comprenant votre prudence, explorons une troisième voie.', 'While understanding your caution, let’s explore a third way.'], ['Comment concilier rapidité d’exécution et conformité juridique ?', 'How can we reconcile speed of execution with legal compliance?']],
      }),
      dlg(b('Bridging speed and compliance', 'Concilier rapidité et conformité'), undefined, [['Claire (Médiatrice)', 'f'], ['Vous (Responsable)', 'm']], [
        [0, 'Les ventes exigent un lancement dès mardi, alors que le service juridique réclame dix jours d’audit.', 'Sales is demanding a launch on Tuesday, whereas Legal requires a ten-day audit.'],
        [1, { options: ['Tout en reconnaissant l’urgence commerciale, il nous faut garantir la conformité du contrat : peut-on scinder le lancement ?', 'Le juridique bloque toujours tout, lançons mardi sans eux.', 'Annulons le lancement pendant six mois.'] }],
        [0, 'Scinder comment ? Pourriez-vous préciser cette piste ?', 'Split it how? Could you clarify that option?'],
        [1, { options: ['On pourrait ouvrir les préinscriptions mardi sur un texte validé aujourd’hui, et finaliser les clauses complexes d’ici vendredi.', 'Chacun fait comme il veut de son côté.', 'Aucune idée, c’est à vous de décider.'] }],
      ]),
      mc(P.best, ['Tout en reconnaissant l’urgence commerciale, il nous faut également garantir la conformité du dossier : comment concilier les deux ?', 'Vous exagérez tous les deux vos contraintes.', 'Le juridique a forcément raison contre le commerce.', 'Oublions les règles pour aller plus vite.'], { fr: 'Vous animez une réunion tendue entre deux directions aux priorités opposées :' }),
      gap(P.complete, 'Au-delà de ce ___ sur les moyens, je constate que vous poursuivez un ___ commun.', ['désaccord', 'objectif'], { choices: [['désaccord', 'compromis', 'contrat'], ['objectif', 'problème', 'obstacle']] }),
      ord(P.order, 'Tout en comprenant votre réserve, j’aimerais explorer une troisième voie.', { tr: 'While understanding your reservation, I’d like to explore a third option.', extra: ['refus'] }),
      say('Au-delà de cette divergence sur la méthode, vous partagez manifestement le même objectif de qualité.', 'Beyond this divergence on method, you clearly share the same goal of quality.'),
    ],
    [
      b('Tout en reconnaissant…, il convient aussi de…', 'Tout en reconnaissant…, il convient aussi de…'),
      b('Au-delà de votre divergence sur…, vous partagez…', 'Au-delà de votre divergence sur…, vous partagez…'),
      b('Concilier deux impératifs ouvre une troisième voie.', 'Concilier deux impératifs ouvre une troisième voie.'),
    ],
    [['concilier', b('to reconcile', 'accorder deux exigences opposées')], ['scinder', b('to split in two', 'diviser en deux étapes')], ['une divergence', b('a divergence, disagreement', 'écart de point de vue')]],
  ),
  lesson(C, 3, ['proposing-win-win-exits', 'proposer-une-issue-gagnant-gagnant'],
    b('Proposing win-win exits', 'Proposer une issue gagnant-gagnant'),
    b('Offer face-saving compromises, trial runs and review clauses to seal agreements.', 'Formuler compromis honorables, phases pilotes et clauses de revoyure pour conclure.'),
    [b('Propose a face-saving trial period', 'Proposer une phase pilote honorable'), b('Use conditions and review clauses', 'Employer une clause de revoyure chiffrée'), b('Write a balanced C1 mediation note', 'Rédiger une proposition de médiation C1')],
    13,
    [
      card(b('Honourable exits', 'Les sorties par le haut'), b('To help both sides **sauver la face** (save face) and **sortir par le haut**: **Plutôt que de figer une règle définitive, je propose une phase pilote de six semaines. · Assortissons cet essai d’une clause de revoyure chiffrée. · À quelles conditions cette piste deviendrait-elle acceptable pour vous ?**', 'Pour aider chacun à **sauver la face** et **sortir par le haut** : **Plutôt que de figer une règle définitive, je propose une phase pilote de six semaines. · Assortissons cet essai d’une clause de revoyure chiffrée. · À quelles conditions cette piste deviendrait-elle acceptable pour vous ?**'), {
        ex: [['Une clause de revoyure rassure chacun sur la réversibilité de l’accord.', 'A review clause reassures both sides that the agreement can be adjusted.'], ['Cette solution mutuellement acceptable préserve les priorités essentielles.', 'This mutually acceptable solution preserves core priorities.']],
      }),
      doc({ look: 'letter', title: b('Mediation summary note', 'Relevé de médiation'), text: 'NOTE DE SYNTHÈSE — MÉDIATION INTER-ÉQUIPES\n1. Constat partagé : la charge actuelle nuit à la qualité.\n2. Scénario retenu : expérimentation sur six semaines d’un point hebdomadaire commun.\n3. Clause de revoyure : bilan chiffré le 15 novembre pour ajuster ou pérenniser le dispositif.' }, b('What mechanism protects both sides if the compromise needs adjustment?', 'Quel mécanisme protège les deux équipes si le compromis doit être ajusté ?'), [b('a data-based review clause on 15 November', 'une clause de revoyure chiffrée le 15 novembre'), b('an immediate permanent reorganisation', 'une réorganisation définitive immédiate'), b('cancelling weekly meetings altogether', 'la suppression de tout point hebdomadaire'), b('a fine for missed targets', 'une sanction en cas d’objectif manqué')]),
      mc(P.best, ['Plutôt que de trancher définitivement aujourd’hui, je vous propose une phase pilote de deux mois assortie d’un bilan objectif.', 'Je décide tout seul ce qui est juste pour vous.', 'C’est à prendre ou à laisser dès ce soir.', 'Puisque personne ne cède, nous annulons le projet.'], { fr: 'Aucun camp ne veut reculer sur un changement d’organisation :' }),
      write(b('Diplomatic mediation proposal', 'Proposition de médiation diplomatique'), b('Write a C1 mediation message (95–135 words) addressing two sides deadlocked over remote vs on-site days: validate both needs neutrally, name their shared goal, propose a 2-month pilot with a clause de revoyure and invite conditional agreement.', 'Rédigez un message de médiation C1 (95–135 mots) pour débloquer un désaccord sur le télétravail et la présence sur site : reformulez les deux besoins sans parti pris, rappelez l’objectif commun, proposez une phase pilote de deux mois avec clause de revoyure et invitez à l’accord.'), 95, 135, [
        b('Neutral validation of both sides’ priorities', 'Reformulation neutre des deux priorités'),
        b('Shared objective explicitly named', 'Objectif commun clairement formulé'),
        b('Concrete pilot phase with clause de revoyure', 'Phase pilote concrète avec clause de revoyure'),
        b('Open, inviting closing question', 'Question finale ouvrant le dialogue'),
      ], 'Je comprends parfaitement vos deux préoccupations : d’un côté, l’équipe souhaite préserver une souplesse d’organisation favorable à la concentration ; de l’autre, la direction craint que la distance ne fragilise la cohésion des nouveaux arrivants. Au-delà de ce désaccord sur le nombre de jours sur site, vous partagez manifestement le même objectif : garantir à la fois l’efficacité collective et l’intégration durable de chacun. Plutôt que de figer dès aujourd’hui une règle rigide, je vous propose une phase pilote de deux mois avec deux journées communes fixes par semaine, assortie d’une clause de revoyure chiffrée fin juin. À quelles conditions ce compromis vous paraîtrait-il acceptable pour démarrer dès lundi ?', { phrases: ['d’un côté… de l’autre…', 'Au-delà de ce désaccord…', 'assortie d’une clause de revoyure', 'À quelles conditions… ?'] }),
      pairs(P.match, [['sauver la face', b('to save face', 'préserver sa dignité')], ['une clause de revoyure', b('a review / revisit clause', 'rendez-vous prévu pour ajuster')], ['pérenniser', b('to make permanent', 'rendre durable')], ['sortir par le haut', b('to find an honourable exit', 'résoudre dignement')]]),
      say('Plutôt que d’imposer une solution rigide, je vous propose un essai de six semaines avec une clause de revoyure.', 'Rather than imposing a rigid solution, I suggest a six-week trial with a review clause.'),
    ],
    [
      b('sauver la face · sortir par le haut = honourable, face-saving exit.', 'sauver la face · sortir par le haut = issue honorable.'),
      b('phase pilote + clause de revoyure chiffrée reduce fear of permanent loss.', 'phase pilote + clause de revoyure réduisent la crainte de céder.'),
      b('À quelles conditions cette piste deviendrait-elle acceptable ?', 'À quelles conditions cette piste deviendrait-elle acceptable ?'),
    ],
    [['une clause de revoyure', b('a scheduled review clause', 'réexamen prévu à une date fixe')], ['pérenniser', b('to make lasting / permanent', 'rendre stable dans le temps')], ['assorti de', b('accompanied by (a condition)', 'lié à une clause ou mesure')]],
  ),
];
