import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Convincing your team to adopt a new tool, your landlord to lower the rent, your family to change holiday plans: persuasion is a structured skill. This course teaches you to build an argument (thesis, reasons, examples), to use logical connectors, to anticipate and answer objections, and to finish with a clear call to action, while staying friendly and credible.',
    'Convaincre votre équipe d’adopter un nouvel outil, votre propriétaire de baisser le loyer, votre famille de changer de projet de vacances : la persuasion est une compétence structurée. Ce cours vous apprend à construire un argumentaire (thèse, raisons, exemples), à employer les connecteurs logiques, à anticiper et réfuter les objections, et à conclure par un appel clair à l’action, tout en restant aimable et crédible.',
  ),
  outcomes: [
    b('Structure an argument with connectors', 'Structurer un argumentaire avec des connecteurs'),
    b('Support it with examples and figures', 'L’appuyer sur des exemples et des chiffres'),
    b('Anticipate and answer objections', 'Anticiper et réfuter les objections'),
    b('Close with a call to action', 'Conclure par un appel à l’action'),
  ],
};

const C = 'c-persuade';
export default [
  lesson(C, 1, ['building-an-argument', 'construire-un-argumentaire'],
    b('Building an argument', 'Construire un argumentaire'),
    b('State a clear position and support it with two or three structured reasons.', 'Énoncer une position claire et l’appuyer sur deux ou trois raisons structurées.'),
    [b('State your position', 'Énoncer sa position'), b('Order your reasons', 'Ordonner ses raisons'), b('Give an example', 'Donner un exemple')],
    13,
    [
      card(b('Structure', 'La structure'), b('Position: **Je suis convaincu(e) que…** · **Je défends l’idée que…** Reasons: **D’abord, … Ensuite, … Enfin, …** · **Non seulement…, mais en plus…** Example: **Prenons l’exemple de…** · **Par exemple, …** · **Les chiffres le montrent : …**', 'Position : **Je suis convaincu(e) que…** · **Je défends l’idée que…** Raisons : **D’abord, … Ensuite, … Enfin, …** · **Non seulement…, mais en plus…** Exemple : **Prenons l’exemple de…** · **Par exemple, …** · **Les chiffres le montrent : …**'), {
        ex: [['Non seulement le télétravail fait gagner du temps, mais en plus il réduit le stress.', 'Not only does remote work save time, but it also reduces stress.']],
      }),
      gap(P.completeText, 'Je suis ___ que nous devrions passer à la semaine de quatre jours. D’___ , les équipes seraient moins fatiguées. ___ , nous attirerions plus de candidats.', ['convaincue', 'abord', ['Ensuite', 'Enfin', 'De plus']]),
      mc(P.best, ['Prenons l’exemple de l’équipe de Lyon : depuis le changement, l’absentéisme a baissé de 20 %.', 'Tout le monde sait que c’est mieux.', 'Parce que c’est comme ça.', 'Je l’ai lu quelque part, je crois.'], { fr: 'Vous appuyez votre argument sur un exemple concret :' }),
      ord(P.order, 'Non seulement c’est moins cher, mais en plus c’est plus rapide.', { tr: 'Not only is it cheaper, it’s also faster.' }),
      sort(b('Position, reason or example?', 'Position, raison ou exemple ?'), [b('position', 'position'), b('reason', 'raison'), b('example', 'exemple')], [['Je défends l’idée que…', 0], ['D’abord, cela coûte moins cher.', 1], ['Prenons le cas de Nantes.', 2], ['Je suis convaincu que…', 0], ['De plus, c’est plus écologique.', 1], ['Les chiffres le montrent : +15 %.', 2]]),
      pairs(P.match, [['Je défends l’idée que…', b('I argue that…', 'ma thèse est')], ['Non seulement…, mais en plus…', b('Not only…, but also…', 'addition forte')], ['l’absentéisme', b('absenteeism', 'absences au travail')], ['attirer', b('to attract', 'faire venir')]]),
      say('Je suis convaincue que c’est la bonne solution. D’abord, c’est moins cher. Ensuite, c’est plus simple pour tout le monde.', 'I’m convinced it’s the right solution. First, it’s cheaper. Then, it’s simpler for everyone.'),
    ],
    [
      b('Position: Je suis convaincu(e) que… Je défends l’idée que…', 'Position : Je suis convaincu(e) que… Je défends l’idée que…'),
      b('Reasons: D’abord, ensuite, enfin; non seulement… mais en plus.', 'Raisons : D’abord, ensuite, enfin ; non seulement… mais en plus.'),
      b('Support: Prenons l’exemple de… Les chiffres le montrent.', 'Appui : Prenons l’exemple de… Les chiffres le montrent.'),
    ],
    [['un argumentaire', b('a set of arguments', 'ensemble d’arguments')], ['un candidat', b('a candidate, an applicant', 'personne qui postule')], ['convaincu', b('convinced', 'sûr de son opinion')]],
  ),
  lesson(C, 2, ['answering-objections', 'repondre-aux-objections'],
    b('Answering objections', 'Répondre aux objections'),
    b('Anticipate the counter-arguments, concede a point, then turn it around.', 'Anticiper les contre-arguments, concéder un point, puis le retourner.'),
    [b('Anticipate an objection', 'Anticiper une objection'), b('Concede then refute', 'Concéder puis réfuter'), b('Reassure with facts', 'Rassurer avec des faits')],
    13,
    [
      card(b('Concede, then refute', 'Concéder, puis réfuter'), b('Anticipate: **On pourrait m’objecter que…** · **Vous allez me dire que…** Concede: **Certes, … / Il est vrai que… / Je vous l’accorde, …** Refute: **…mais / pourtant / en réalité, …** · **Justement, c’est pour ça que…**', 'Anticiper : **On pourrait m’objecter que…** · **Vous allez me dire que…** Concéder : **Certes, … / Il est vrai que… / Je vous l’accorde, …** Réfuter : **…mais / pourtant / en réalité, …** · **Justement, c’est pour ça que…**')),
      mc(P.best, ['Je vous l’accorde, l’investissement est important, mais il sera rentabilisé en dix-huit mois.', 'C’est faux, ça ne coûte rien.', 'L’argent, ce n’est pas important.', 'Vous ne comprenez rien aux chiffres.'], { fr: '— Ce nouveau logiciel coûte beaucoup trop cher.' }),
      mc(P.best, ['Justement, c’est pour ça que je propose une formation de deux heures pour tout le monde.', 'Tant pis pour eux.', 'Ils apprendront tout seuls.', 'Vous avez raison, oublions ça.'], { fr: '— Mais les employés ne savent pas utiliser ce logiciel !' }),
      gap(P.complete, '___ , le projet est ambitieux. ___ , il est tout à fait réaliste si nous commençons maintenant.', [['Certes', 'Il est vrai que'], ['Pourtant', 'Mais', 'Cependant']]),
      dlg(b('Convincing the landlord', 'Convaincre le propriétaire'), undefined, [['Propriétaire', 'm'], ['Vous', 'f']], [
        [0, 'Baisser le loyer ? Le marché est très demandé, je peux trouver un autre locataire.', 'Lower the rent? The market is in high demand, I can find another tenant.'],
        [1, { options: ['Certes, mais je paie toujours à temps depuis trois ans, et je prends soin de l’appartement.', 'Vous êtes un mauvais propriétaire.', 'D’accord, je pars demain.'] }],
        [0, 'C’est vrai, vous êtes une très bonne locataire.', 'True, you are a very good tenant.'],
        [1, { options: ['Justement : un changement de locataire vous coûterait des semaines sans loyer et des travaux. Une petite baisse serait gagnante pour nous deux.', 'Donc vous baissez de moitié.', 'Je ne sais pas.'] }],
      ]),
      pairs(P.match, [['Certes', b('Admittedly', 'il est vrai que')], ['Je vous l’accorde.', b('I grant you that.', 'je concède')], ['Justement', b('Precisely, that’s exactly why', 'c’est bien la raison')], ['rentabiliser', b('to recoup, make profitable', 'récupérer l’investissement')]]),
      say('Je vous l’accorde, c’est un investissement. Mais en réalité, il nous fera économiser de l’argent dès l’année prochaine.', 'I grant you, it’s an investment. But in reality it will save us money from next year.'),
    ],
    [
      b('Anticipate: On pourrait m’objecter que… Vous allez me dire que…', 'Anticiper : On pourrait m’objecter que… Vous allez me dire que…'),
      b('Concede: Certes, il est vrai que, je vous l’accorde.', 'Concéder : Certes, il est vrai que, je vous l’accorde.'),
      b('Refute: mais, pourtant, en réalité, justement.', 'Réfuter : mais, pourtant, en réalité, justement.'),
    ],
    [['un locataire', b('a tenant', 'personne qui loue')], ['le loyer', b('the rent', 'prix du logement')], ['un logiciel', b('software', 'programme informatique')]],
  ),
  lesson(C, 3, ['closing-and-call-to-action', 'conclure-et-appeler-a-l-action'],
    b('Closing with a call to action', 'Conclure par un appel à l’action'),
    b('Summarise, appeal to shared interests and ask for a clear decision.', 'Résumer, faire appel aux intérêts communs et demander une décision claire.'),
    [b('Summarise in one sentence', 'Résumer en une phrase'), b('Appeal to shared interests', 'Faire appel aux intérêts communs'), b('Ask for a concrete next step', 'Demander une prochaine étape concrète')],
    13,
    [
      card(b('A strong close', 'Une conclusion forte'), b('Summarise: **En résumé, …** · **Pour toutes ces raisons, …** Shared interest: **C’est dans notre intérêt à tous.** · **Tout le monde y gagne.** Call to action: **Je vous propose de tester pendant un mois.** · **Est-ce qu’on peut se mettre d’accord sur… ?** · **Je compte sur votre soutien.**', 'Résumer : **En résumé, …** · **Pour toutes ces raisons, …** Intérêt commun : **C’est dans notre intérêt à tous.** · **Tout le monde y gagne.** Appel à l’action : **Je vous propose de tester pendant un mois.** · **Est-ce qu’on peut se mettre d’accord sur… ?** · **Je compte sur votre soutien.**')),
      tip(b('A small first step', 'Un petit premier pas'), b('People accept a **trial** more easily than a final decision. **« Je vous propose un essai d’un mois, et on fait le bilan ensemble »** is very hard to refuse.', 'On accepte plus facilement un **essai** qu’une décision définitive. **« Je vous propose un essai d’un mois, et on fait le bilan ensemble »** est très difficile à refuser.')),
      mc(P.best, ['Pour toutes ces raisons, je vous propose un essai d’un mois. On fera le bilan ensemble en juin.', 'Voilà, c’est tout, merci.', 'Faites ce que vous voulez.', 'Si vous refusez, je pars.'], { fr: 'Vous concluez votre présentation à la direction :' }),
      ord(P.order, 'Est-ce qu’on peut se mettre d’accord sur un essai ?', { tr: 'Can we agree on a trial?' }),
      hear('En résumé, cette solution est moins chère, plus rapide et plus écologique. Tout le monde y gagne. Je vous propose donc de la tester dans deux services dès le mois prochain, et je compte sur votre soutien.', b('What does the speaker ask for?', 'Que demande l’orateur ?'), [b('A test in two departments next month', 'Un test dans deux services le mois prochain'), b('An immediate company-wide change', 'Un changement immédiat dans toute l’entreprise'), b('A bigger budget for his team', 'Un plus gros budget pour son équipe'), b('More time to think', 'Plus de temps pour réfléchir')], { voice: 'm' }),
      pairs(P.match, [['En résumé', b('In short', 'pour résumer')], ['Tout le monde y gagne.', b('Everybody wins.', 'gagnant-gagnant')], ['faire le bilan', b('to take stock', 'évaluer les résultats')], ['le soutien', b('support', 'appui')]]),
      say('En résumé, tout le monde y gagne. Je vous propose un essai d’un mois, et je compte sur votre soutien.', 'In short, everybody wins. I suggest a one-month trial, and I’m counting on your support.'),
    ],
    [
      b('Summarise: En résumé… Pour toutes ces raisons…', 'Résumer : En résumé… Pour toutes ces raisons…'),
      b('Shared interest: Tout le monde y gagne.', 'Intérêt commun : Tout le monde y gagne.'),
      b('Ask for a small, concrete step: an essai, a date, a decision.', 'Demandez un petit pas concret : un essai, une date, une décision.'),
    ],
    [['un essai', b('a trial', 'test')], ['la direction', b('management', 'les dirigeants')], ['un service', b('a department', 'partie de l’entreprise')]],
  ),
];
