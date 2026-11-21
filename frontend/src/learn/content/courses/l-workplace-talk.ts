import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In a meeting, things go fast: someone proposes, another objects, a decision is taken, tasks are shared out, deadlines fixed. This course trains your ear on original workplace exchanges (team meetings, quick briefings, calls with clients) to catch decisions, tasks, deadlines and the polite formulas that soften disagreement at work.',
    'En réunion, tout va vite : l’un propose, l’autre objecte, une décision est prise, les tâches sont réparties, les échéances fixées. Ce cours entraîne votre oreille à des échanges professionnels originaux (réunions d’équipe, points rapides, appels avec des clients) pour saisir décisions, tâches, échéances et les formules polies qui adoucissent le désaccord au travail.',
  ),
  outcomes: [
    b('Catch decisions and who does what', 'Saisir les décisions et qui fait quoi'),
    b('Catch deadlines and priorities', 'Saisir échéances et priorités'),
    b('Understand polite disagreement at work', 'Comprendre le désaccord poli au travail'),
    b('Follow a call with a client', 'Suivre un appel avec un client'),
  ],
};

const C = 'l-workplace-talk';
export default [
  lesson(C, 1, ['decisions-and-tasks', 'decisions-et-taches'],
    b('Decisions and tasks', 'Décisions et tâches'),
    b('Catch the decision and who will do what.', 'Saisir la décision et qui fera quoi.'),
    [b('Recognise a decision', 'Reconnaître une décision'), b('Catch task assignments', 'Saisir la répartition des tâches'), b('Understand je m’en occupe, tu t’en charges', 'Comprendre je m’en occupe, tu t’en charges')],
    13,
    [
      card(b('Meeting language', 'La langue des réunions'), b('Decision: **on part sur…, c’est décidé, on valide**. Tasks: **je m’en occupe, tu t’en charges ?, Karim prend ça**. Deadline: **pour vendredi, d’ici la fin du mois, au plus tard lundi**.', 'Décision : **on part sur…, c’est décidé, on valide**. Tâches : **je m’en occupe, tu t’en charges ?, Karim prend ça**. Échéance : **pour vendredi, d’ici la fin du mois, au plus tard lundi**.')),
      hear('Bon, on valide la deuxième option : on lance la campagne en avril, pas en mars.', b('What was decided?', 'Qu’est-ce qui a été décidé ?'), [b('To launch the campaign in April', 'Lancer la campagne en avril'), b('To launch in March', 'Lancer en mars'), b('To cancel the campaign', 'Annuler la campagne'), b('To vote next week', 'Voter la semaine prochaine')]),
      hear('Sophie, tu t’occupes du budget ? Et Karim, tu prépares la présentation pour jeudi.', b('What must Karim do?', 'Que doit faire Karim ?'), [b('Prepare the presentation for Thursday', 'Préparer la présentation pour jeudi'), b('Handle the budget', 'S’occuper du budget'), b('Call the client', 'Appeler le client'), b('Nothing', 'Rien')]),
      hear('Le rapport, je m’en occupe. Vous l’aurez au plus tard lundi matin.', b('When will the report be ready?', 'Quand le rapport sera-t-il prêt ?'), [b('Monday morning at the latest', 'Lundi matin au plus tard'), b('This evening', 'Ce soir'), b('Next month', 'Le mois prochain'), b('It is ready', 'Il est prêt')]),
      sort(b('Decision, task or deadline?', 'Décision, tâche ou échéance ?'), [b('decision', 'décision'), b('task', 'tâche'), b('deadline', 'échéance')], [['On valide l’option deux.', 0], ['Je m’en occupe.', 1], ['Pour vendredi.', 2], ['C’est décidé.', 0], ['Tu t’en charges ?', 1], ['D’ici la fin du mois.', 2]]),
      pairs(P.match, [['je m’en occupe', b('I’ll take care of it', 'je me charge de cela')], ['on valide', b('we approve it', 'on accepte')], ['au plus tard', b('at the latest', 'dernier délai')], ['une campagne', b('a campaign', 'action de communication')]]),
      dict('Sophie s’occupe du budget et Karim prépare la présentation.', { voice: 'f' }),
    ],
    [
      b('Decision: on valide, on part sur, c’est décidé.', 'Décision : on valide, on part sur, c’est décidé.'),
      b('Task: je m’en occupe, tu t’en charges, X prend ça.', 'Tâche : je m’en occupe, tu t’en charges, X prend ça.'),
      b('Deadline: pour jeudi, au plus tard lundi, d’ici la fin du mois.', 'Échéance : pour jeudi, au plus tard lundi, d’ici la fin du mois.'),
    ],
    [['le budget', b('the budget', 'prévision financière')], ['lancer', b('to launch', 'démarrer')], ['une option', b('an option', 'possibilité')]],
  ),
  lesson(C, 2, ['polite-disagreement', 'desaccord-poli'],
    b('Polite disagreement at work', 'Le désaccord poli au travail'),
    b('Understand objections softened by politeness.', 'Comprendre les objections adoucies par la politesse.'),
    [b('Recognise softened objections', 'Reconnaître les objections adoucies'), b('Understand a counter-proposal', 'Comprendre une contre-proposition'), b('Understand a compromise', 'Comprendre un compromis')],
    13,
    [
      card(b('Softening', 'Adoucir'), b('At work, disagreement is rarely direct: **Je comprends, mais…**, **Je me demande si…**, **Ce ne serait pas plus simple de… ?**, **Je ne suis pas sûr que ce soit la meilleure solution**, **Et si on…?**', 'Au travail, le désaccord est rarement direct : **Je comprends, mais…**, **Je me demande si…**, **Ce ne serait pas plus simple de… ?**, **Je ne suis pas sûr que ce soit la meilleure solution**, **Et si on… ?**')),
      hear('Je comprends l’idée, mais je me demande si on a vraiment le temps de tout faire avant mars.', b('What is the speaker’s position?', 'Quelle est la position de l’intervenant ?'), [b('Doubtful about the timing', 'Il doute du calendrier'), b('Fully in favour', 'Totalement favorable'), b('Angry', 'En colère'), b('Indifferent', 'Indifférent')]),
      hear('Ce ne serait pas plus simple de commencer par un test avec un seul client ?', b('What does she propose?', 'Que propose-t-elle ?'), [b('Starting with a test with one client', 'Commencer par un test avec un seul client'), b('Stopping the project', 'Arrêter le projet'), b('Hiring someone', 'Embaucher quelqu’un'), b('Doing everything at once', 'Tout faire en même temps')]),
      hear('D’accord, alors on fait un compromis : un test en mars, et le lancement complet en mai.', b('What is the compromise?', 'Quel est le compromis ?'), [b('A test in March, full launch in May', 'Un test en mars, le lancement complet en mai'), b('Everything in March', 'Tout en mars'), b('Nothing until May', 'Rien avant mai'), b('A test in May', 'Un test en mai')]),
      dlg(b('A team meeting', 'Une réunion d’équipe'), undefined, [['Directrice', 'f'], ['Vous', 'm']], [
        [0, 'Je propose qu’on livre le projet en deux semaines.', 'I suggest we deliver the project in two weeks.'],
        [1, { options: ['Je comprends, mais je ne suis pas sûr que deux semaines suffisent. Et si on visait trois semaines ?', 'Non. C’est impossible. Point.', 'Deux semaines ? N’importe quoi !'] }],
        [0, 'Trois semaines… D’accord, si on a une version test la semaine prochaine.', 'Three weeks… OK, if we have a test version next week.'],
        [1, { options: ['Ça me semble raisonnable. Je m’en occupe.', 'Je ne veux pas.', 'Peut-être l’année prochaine.'] }],
      ]),
      pairs(P.match, [['Je me demande si…', b('I wonder if…', 'doute poli')], ['Et si on… ?', b('What if we…?', 'suggestion')], ['un compromis', b('a compromise', 'accord intermédiaire')], ['Ça me semble raisonnable.', b('That seems reasonable.', 'accord')]]),
    ],
    [
      b('Softened disagreement: Je comprends, mais…, Je me demande si…', 'Désaccord adouci : Je comprends, mais…, Je me demande si…'),
      b('Counter-proposal: Ce ne serait pas plus simple de… ? Et si on… ?', 'Contre-proposition : Ce ne serait pas plus simple de… ? Et si on… ?'),
      b('Compromise: on fait un compromis, ça me semble raisonnable.', 'Compromis : on fait un compromis, ça me semble raisonnable.'),
    ],
    [['livrer', b('to deliver', 'remettre')], ['suffire', b('to be enough', 'être assez')], ['viser', b('to aim for', 'avoir pour objectif')]],
  ),
  lesson(C, 3, ['calls-with-clients', 'appels-avec-des-clients'],
    b('Calls with clients', 'Les appels avec des clients'),
    b('Follow a professional call: request, problem, solution, follow-up.', 'Suivre un appel professionnel : demande, problème, solution, suivi.'),
    [b('Understand the client’s request', 'Comprendre la demande du client'), b('Understand the solution offered', 'Comprendre la solution proposée'), b('Understand the follow-up', 'Comprendre le suivi')],
    13,
    [
      tip(b('The structure of a call', 'La structure d’un appel'), b('**Présentation** (Bonjour, X de la société Y) → **demande / problème** → **solution** → **suivi** (Je vous envoie un courriel de confirmation, Je vous rappelle demain).', '**Présentation** (Bonjour, X de la société Y) → **demande / problème** → **solution** → **suivi** (Je vous envoie un courriel de confirmation, Je vous rappelle demain).')),
      hear('Bonjour, Julie Morin de la société Bati-Pro. J’appelle parce que nous n’avons toujours pas reçu notre commande de la semaine dernière.', b('What is the problem?', 'Quel est le problème ?'), [b('Last week’s order has not arrived.', 'La commande de la semaine dernière n’est pas arrivée.'), b('The invoice is wrong.', 'La facture est erronée.'), b('She wants to cancel.', 'Elle veut annuler.'), b('The product is broken.', 'Le produit est cassé.')]),
      hear('Je suis vraiment désolé. Je vérifie… Votre colis est bloqué à l’entrepôt. Je vous le fais livrer en express demain matin, sans frais.', b('What solution is offered?', 'Quelle solution est proposée ?'), [b('Free express delivery tomorrow morning', 'Une livraison express gratuite demain matin'), b('A refund', 'Un remboursement'), b('A new order next month', 'Une nouvelle commande le mois prochain'), b('Nothing', 'Rien')]),
      hear('Je vous envoie un courriel de confirmation avec le numéro de suivi. N’hésitez pas à me rappeler si besoin.', b('What will the employee send?', 'Qu’enverra l’employé ?'), [b('A confirmation email with a tracking number', 'Un courriel de confirmation avec un numéro de suivi'), b('A gift', 'Un cadeau'), b('A new invoice', 'Une nouvelle facture'), b('A catalogue', 'Un catalogue')]),
      pairs(P.match, [['l’entrepôt', b('the warehouse', 'lieu de stockage')], ['sans frais', b('free of charge', 'gratuitement')], ['le numéro de suivi', b('the tracking number', 'référence de livraison')], ['si besoin', b('if needed', 'au besoin')]]),
      sort(b('Request, solution or follow-up?', 'Demande, solution ou suivi ?'), [b('request / problem', 'demande / problème'), b('solution', 'solution'), b('follow-up', 'suivi')], [['Nous n’avons pas reçu la commande.', 0], ['Je vous la fais livrer demain.', 1], ['Je vous envoie une confirmation.', 2], ['La facture est erronée.', 0], ['Je corrige la facture.', 1], ['Je vous rappelle jeudi.', 2]]),
      dict('Je vous envoie un courriel de confirmation avec le numéro de suivi.', { voice: 'm' }),
    ],
    [
      b('Call: introduction → request → solution → follow-up.', 'Appel : présentation → demande → solution → suivi.'),
      b('Apology: Je suis vraiment désolé(e).', 'Excuse : Je suis vraiment désolé(e).'),
      b('Follow-up: Je vous envoie…, Je vous rappelle…, N’hésitez pas à…', 'Suivi : Je vous envoie…, Je vous rappelle…, N’hésitez pas à…'),
    ],
    [['une commande', b('an order', 'achat passé')], ['bloqué', b('stuck', 'immobilisé')], ['erroné', b('incorrect', 'faux')]],
  ),
];
