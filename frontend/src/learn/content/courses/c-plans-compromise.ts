import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Organising a trip with friends, a family dinner or a team event means suggesting, comparing, negotiating and finally deciding together. This course teaches you the language of group planning: making proposals (et si on… ?), expressing preferences (je préférerais que…), objecting gently, offering a compromise and confirming who does what.',
    'Organiser un voyage entre amis, un repas de famille ou un événement d’équipe, c’est proposer, comparer, négocier et finalement décider ensemble. Ce cours vous apprend la langue de l’organisation à plusieurs : faire des propositions (et si on… ?), exprimer des préférences (je préférerais que…), objecter avec douceur, proposer un compromis et confirmer qui fait quoi.',
  ),
  outcomes: [
    b('Make and compare proposals', 'Faire et comparer des propositions'),
    b('Express preferences with the conditional', 'Exprimer ses préférences au conditionnel'),
    b('Negotiate and find a compromise', 'Négocier et trouver un compromis'),
    b('Confirm the plan and the tasks', 'Confirmer le plan et les tâches'),
  ],
};

const C = 'c-plans-compromise';
export default [
  lesson(C, 1, ['making-proposals', 'faire-des-propositions'],
    b('Making proposals', 'Faire des propositions'),
    b('Suggest ideas and compare options in a group.', 'Suggérer des idées et comparer des options en groupe.'),
    [b('Suggest with et si on… ?', 'Suggérer avec et si on… ?'), b('Compare two options', 'Comparer deux options'), b('Ask for the others’ opinion', 'Demander l’avis des autres')],
    13,
    [
      card(b('Proposing', 'Proposer'), b('**Et si on allait à la campagne ?** (si + imparfait) · **On pourrait louer un chalet.** · **Je propose qu’on parte vendredi soir.** (subjonctif) · **Ça vous dirait de… ?** Compare: **C’est moins cher, mais c’est plus loin.** · **L’avantage, c’est que… ; l’inconvénient, c’est que…**', '**Et si on allait à la campagne ?** (si + imparfait) · **On pourrait louer un chalet.** · **Je propose qu’on parte vendredi soir.** (subjonctif) · **Ça vous dirait de… ?** Comparer : **C’est moins cher, mais c’est plus loin.** · **L’avantage, c’est que… ; l’inconvénient, c’est que…**'), {
        ex: [['Et si on louait un chalet pour le long week-end ?', 'What if we rented a cottage for the long weekend?'], ['L’avantage, c’est que c’est près ; l’inconvénient, c’est que c’est cher.', 'The advantage is that it’s close; the downside is that it’s expensive.']],
      }),
      mc(P.form, ['Et si on partait samedi matin ?', 'Et si on part samedi matin hier ?', 'Et si on partira samedi matin ?', 'Et si on partirait samedi matin ?']),
      gap(P.complete, 'Je propose qu’on ___ le train : l’avantage, c’___ qu’on peut se reposer.', ['prenne', 'est']),
      mc(P.best, ['L’avantage du camping, c’est le prix ; l’inconvénient, c’est la pluie possible.', 'Le camping, c’est nul.', 'Camping, prix, pluie.', 'On fait du camping, point final.'], { fr: 'Vous comparez camping et hôtel :' }),
      ord(P.order, 'On pourrait louer un chalet au bord du lac.', { tr: 'We could rent a cottage by the lake.' }),
      pairs(P.match, [['Et si on… ?', b('What if we…?', 'proposition')], ['l’avantage', b('the advantage', 'le point positif')], ['l’inconvénient', b('the drawback', 'le point négatif')], ['louer', b('to rent', 'payer pour utiliser')]]),
      say('Et si on louait un chalet ? L’avantage, c’est qu’on serait tous ensemble.', 'What if we rented a cottage? The advantage is that we’d all be together.'),
    ],
    [
      b('Et si on + imparfait ? On pourrait… Je propose que + subjonctif.', 'Et si on + imparfait ? On pourrait… Je propose que + subjonctif.'),
      b('L’avantage, c’est que… L’inconvénient, c’est que…', 'L’avantage, c’est que… L’inconvénient, c’est que…'),
      b('Ask: Ça vous dirait ? Qu’est-ce que vous en pensez ?', 'Demandez : Ça vous dirait ? Qu’est-ce que vous en pensez ?'),
    ],
    [['un long week-end', b('a long weekend', 'week-end de trois jours')], ['au bord du lac', b('by the lake', 'près de l’eau')], ['la campagne', b('the countryside', 'hors de la ville')]],
  ),
  lesson(C, 2, ['preferences-and-objections', 'preferences-et-objections'],
    b('Preferences and objections', 'Préférences et objections'),
    b('Say what you would prefer and object without blocking the group.', 'Dire ce que vous préféreriez et objecter sans bloquer le groupe.'),
    [b('Express a preference', 'Exprimer une préférence'), b('Object gently', 'Objecter avec douceur'), b('Explain a constraint', 'Expliquer une contrainte')],
    13,
    [
      card(b('Preferences', 'Les préférences'), b('**Je préférerais partir plus tôt.** · **Je préférerais qu’on reste en ville.** (subjonctif) · **Moi, ça m’est égal.** · **Peu importe.** Objections: **Le seul problème, c’est que…** · **Ça me pose un petit souci : je travaille le samedi.** · **Je ne suis pas très chaud(e) pour…** (informal)', '**Je préférerais partir plus tôt.** · **Je préférerais qu’on reste en ville.** (subjonctif) · **Moi, ça m’est égal.** · **Peu importe.** Objections : **Le seul problème, c’est que…** · **Ça me pose un petit souci : je travaille le samedi.** · **Je ne suis pas très chaud(e) pour…** (familier)')),
      mc(P.best, ['Le seul problème, c’est que je travaille samedi matin. On pourrait partir à midi ?', 'Non, impossible, je refuse.', 'Partez sans moi.', 'Samedi, c’est nul.'], { fr: '— On part samedi à 7 h, d’accord ?' }),
      sort(b('Preference, indifference or objection?', 'Préférence, indifférence ou objection ?'), [b('preference', 'préférence'), b('indifference', 'indifférence'), b('objection', 'objection')], [['Je préférerais la mer.', 0], ['Ça m’est égal.', 1], ['Ça me pose un petit souci.', 2], ['J’aimerais mieux le train.', 0], ['Peu importe.', 1], ['Je ne suis pas très chaud pour ça.', 2]]),
      gap(P.complete, 'Je ___ qu’on parte dimanche, parce que samedi j’ai un mariage.', [['préférerais', 'préfère', 'aimerais mieux']]),
      dlg(b('Planning a birthday', 'Organiser un anniversaire'), undefined, [['Clara', 'f'], ['Vous', 'm']], [
        [0, 'Pour l’anniversaire de Sam, je pensais à un restaurant chic.', 'For Sam’s birthday, I was thinking of a fancy restaurant.'],
        [1, { options: ['Bonne idée, mais le seul problème, c’est le budget. Je préférerais quelque chose de plus simple.', 'Non, c’est nul.', 'Ça m’est égal, fais ce que tu veux, je ne viens pas.'] }],
        [0, 'Tu proposes quoi, alors ?', 'What do you suggest, then?'],
        [1, { options: ['Et si on faisait un pique-nique au parc, avec un gâteau ?', 'Rien.', 'Un restaurant chic.'] }],
      ]),
      pairs(P.match, [['Ça m’est égal.', b('I don’t mind.', 'pas de préférence')], ['un souci', b('a problem, a concern', 'petit problème')], ['ne pas être chaud pour', b('not keen on (informal)', 'pas très motivé')], ['peu importe', b('it doesn’t matter', 'aucune importance')]]),
      say('Moi, je préférerais qu’on reste en ville. Le seul problème, c’est le prix des hôtels.', 'I’d rather we stayed in town. The only problem is the price of hotels.'),
    ],
    [
      b('Je préférerais + infinitif / que + subjonctif.', 'Je préférerais + infinitif / que + subjonctif.'),
      b('Indifference: Ça m’est égal. Peu importe.', 'Indifférence : Ça m’est égal. Peu importe.'),
      b('Object gently: Le seul problème, c’est que… Ça me pose un petit souci.', 'Objecter doucement : Le seul problème, c’est que… Ça me pose un petit souci.'),
    ],
    [['un budget', b('a budget', 'argent prévu')], ['chic', b('fancy, smart', 'élégant')], ['un mariage', b('a wedding', 'cérémonie d’union')]],
  ),
  lesson(C, 3, ['compromise-and-decision', 'compromis-et-decision'],
    b('Compromise and decision', 'Compromis et décision'),
    b('Offer a compromise, decide together and share the tasks.', 'Proposer un compromis, décider ensemble et répartir les tâches.'),
    [b('Offer a compromise', 'Proposer un compromis'), b('Close the decision', 'Arrêter la décision'), b('Share the tasks', 'Répartir les tâches')],
    13,
    [
      card(b('Compromise and decision', 'Compromis et décision'), b('Compromise: **On pourrait couper la poire en deux.** · **Et si on faisait un peu des deux ?** · **D’accord pour… à condition que…** (subjonctif). Decide: **Bon, c’est décidé !** · **On part là-dessus ?** · **Ça marche pour tout le monde ?** Tasks: **Qui s’occupe de… ? Je me charge de…**', 'Compromis : **On pourrait couper la poire en deux.** · **Et si on faisait un peu des deux ?** · **D’accord pour… à condition que…** (subjonctif). Décider : **Bon, c’est décidé !** · **On part là-dessus ?** · **Ça marche pour tout le monde ?** Tâches : **Qui s’occupe de… ? Je me charge de…**')),
      mc(P.best, ['Et si on faisait un peu des deux : deux jours à la mer et deux jours en montagne ?', 'Je gagne, on va à la mer.', 'Personne ne part.', 'Tirons au sort, sinon je pars.'], { fr: 'La moitié du groupe veut la mer, l’autre la montagne :' }),
      gap(P.complete, 'D’accord pour le camping, à condition qu’on ___ une grande tente.', ['ait']),
      mc(P.best, ['Je me charge des courses, et toi, tu t’occupes de la voiture ?', 'Vous faites tout, moi je dors.', 'Personne ne fait rien.', 'Qui ? Quoi ? Où ?'], { fr: 'Vous répartissez les tâches :' }),
      dlg(b('The final decision', 'La décision finale'), undefined, [['Sofia', 'f'], ['Vous', 'm'], ['Malik', 'm']], [
        [0, 'Bon, on a deux options : le chalet à 400 euros ou l’auberge à 250.', 'Right, we have two options: the cottage at 400 euros or the inn at 250.'],
        [2, 'Le chalet est plus beau, mais c’est cher.', 'The cottage is nicer, but it’s expensive.'],
        [1, { options: ['On pourrait prendre le chalet, à condition de faire les repas nous-mêmes pour économiser.', 'Je ne viens pas.', 'Les deux sont nuls.'] }],
        [0, 'Bonne idée ! Ça marche pour tout le monde ?', 'Good idea! Does that work for everyone?'],
        [2, 'Pour moi, c’est parfait.', 'For me it’s perfect.'],
        [1, { options: ['Alors, c’est décidé ! Je me charge de réserver, et vous vous occupez des courses ?', 'Ah non, finalement, l’auberge.', 'On verra l’année prochaine.'] }],
      ]),
      pairs(P.match, [['couper la poire en deux', b('to meet halfway', 'faire un compromis')], ['à condition que', b('provided that', 'si et seulement si')], ['se charger de', b('to take care of', 's’occuper de')], ['économiser', b('to save money', 'dépenser moins')]]),
      say('Alors, c’est décidé ! Je me charge de la réservation, et toi, tu t’occupes des courses ?', 'So, it’s decided! I’ll take care of the booking, and you handle the shopping?'),
    ],
    [
      b('Compromise: Et si on faisait un peu des deux ? On coupe la poire en deux.', 'Compromis : Et si on faisait un peu des deux ? On coupe la poire en deux.'),
      b('À condition que + subjonctif.', 'À condition que + subjonctif.'),
      b('Decide and share: C’est décidé ! Je me charge de… Tu t’occupes de… ?', 'Décider et répartir : C’est décidé ! Je me charge de… Tu t’occupes de… ?'),
    ],
    [['une auberge', b('an inn', 'petit hôtel simple')], ['les courses', b('the shopping (groceries)', 'achats de nourriture')], ['tirer au sort', b('to draw lots', 'laisser le hasard choisir')]],
  ),
];
