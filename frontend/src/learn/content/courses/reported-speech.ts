import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Elle m’a dit qu’elle viendrait. Il m’a demandé si j’étais libre. Reporting someone’s words is a daily need at work, in emails and in conversations. This course teaches the reporting verbs, the changes of pronouns and time words (demain → le lendemain), indirect questions (si, ce que, ce qui) and orders (de + infinitive), then the sequence of tenses when the reporting verb is in the past.',
    'Elle m’a dit qu’elle viendrait. Il m’a demandé si j’étais libre. Rapporter les paroles de quelqu’un est un besoin quotidien au travail, dans les courriels et en conversation. Ce cours présente les verbes introducteurs, les changements de pronoms et d’indicateurs de temps (demain → le lendemain), les questions indirectes (si, ce que, ce qui) et les ordres (de + infinitif), puis la concordance des temps quand le verbe introducteur est au passé.',
  ),
  outcomes: [
    b('Report statements with dire que, expliquer que', 'Rapporter des affirmations avec dire que, expliquer que'),
    b('Report questions with si, ce que, ce qui, où, quand', 'Rapporter des questions avec si, ce que, ce qui, où, quand'),
    b('Report orders with de + infinitive', 'Rapporter des ordres avec de + infinitif'),
    b('Apply the sequence of tenses', 'Appliquer la concordance des temps'),
  ],
};

const C = 'reported-speech';
export default [
  lesson(C, 1, ['reporting-statements', 'rapporter-une-affirmation'],
    b('Reporting what someone says', 'Rapporter ce que quelqu’un dit'),
    b('Use dire que and other reporting verbs, and change the pronouns.', 'Employer dire que et d’autres verbes introducteurs, et changer les pronoms.'),
    [b('Use que after the reporting verb', 'Employer que après le verbe introducteur'), b('Change the pronouns and possessives', 'Changer les pronoms et les possessifs'), b('Vary the reporting verbs', 'Varier les verbes introducteurs')],
    13,
    [
      card(b('Direct → indirect', 'Direct → indirect'), b('**Il dit : « Je suis fatigué. »** → **Il dit qu’il est fatigué.** Add **que** (never omitted, unlike English “that”), and adapt the persons: je → il / elle, mon → son, nous → ils.', '**Il dit : « Je suis fatigué. »** → **Il dit qu’il est fatigué.** Ajoutez **que** (jamais omis, contrairement à l’anglais « that »), et adaptez les personnes : je → il / elle, mon → son, nous → ils.'), {
        ex: [['Elle dit qu’elle aime son travail.', 'She says (that) she likes her job.'], ['Ils disent qu’ils arrivent dans dix minutes.', 'They say they’ll arrive in ten minutes.']],
      }),
      tip(b('Beyond dire', 'Au-delà de dire'), b('Vary the verbs to be precise: **expliquer, annoncer, affirmer, répondre, confirmer, promettre, reconnaître (admit), prétendre (claim)** + que.', 'Variez les verbes pour être précis : **expliquer, annoncer, affirmer, répondre, confirmer, promettre, reconnaître, prétendre** + que.')),
      mc(P.best, ['Paul dit qu’il est malade.', 'Paul dit il est malade.', 'Paul dit que je suis malade.', 'Paul dit qu’il est malade que.'], { fr: 'Paul : « Je suis malade. »' }),
      mc(P.best, ['Elle explique que sa voiture est en panne.', 'Elle explique que ma voiture est en panne.', 'Elle explique sa voiture est en panne.', 'Elle explique que sa voiture que est en panne.'], { fr: 'Elle : « Ma voiture est en panne. »' }),
      pairs(P.match, [['reconnaître que', b('to admit that', 'admettre')], ['prétendre que', b('to claim that', 'affirmer sans preuve')], ['promettre que', b('to promise that', 's’engager')], ['annoncer que', b('to announce that', 'faire savoir officiellement')]]),
      gap(P.complete, 'Le directeur annonce ___ ___ réunion est reportée.', ['que', 'la']),
      ord(P.order, 'Elle me répond qu’elle ne peut pas venir.', { tr: 'She replies that she can’t come.' }),
      say('Mon collègue dit qu’il est en retard et qu’il arrive dans un quart d’heure.', 'My colleague says he’s late and will arrive in a quarter of an hour.'),
    ],
    [
      b('Reported statement: verb + que + sentence (que is never omitted).', 'Affirmation rapportée : verbe + que + phrase (que n’est jamais omis).'),
      b('Adapt persons: je → il, mon → son, nous → ils.', 'Adaptez les personnes : je → il, mon → son, nous → ils.'),
      b('Precise verbs: expliquer, affirmer, reconnaître, prétendre, promettre.', 'Verbes précis : expliquer, affirmer, reconnaître, prétendre, promettre.'),
    ],
    [['être en panne', b('to be broken down', 'ne plus fonctionner')], ['reporter', b('to postpone', 'remettre à plus tard')], ['prétendre', b('to claim', 'affirmer')]],
  ),
  lesson(C, 2, ['questions-and-orders', 'questions-et-ordres'],
    b('Reporting questions and orders', 'Rapporter une question et un ordre'),
    b('Use si, ce que, ce qui and question words, and de + infinitive for orders.', 'Employer si, ce que, ce qui et les mots interrogatifs, et de + infinitif pour les ordres.'),
    [b('Report yes / no questions with si', 'Rapporter une question fermée avec si'), b('Use ce que / ce qui', 'Employer ce que / ce qui'), b('Report orders with de + infinitive', 'Rapporter un ordre avec de + infinitif')],
    13,
    [
      card(b('Indirect questions', 'Les questions indirectes'), b('Yes / no → **si**: **Tu viens ?** → **Il demande si tu viens.** Qu’est-ce que → **ce que**; qu’est-ce qui → **ce qui**: **Qu’est-ce que tu fais ?** → **Il demande ce que tu fais.** Où, quand, comment, pourquoi stay. **No inversion, no question mark.**', 'Question fermée → **si** : **Tu viens ?** → **Il demande si tu viens.** Qu’est-ce que → **ce que** ; qu’est-ce qui → **ce qui** : **Qu’est-ce que tu fais ?** → **Il demande ce que tu fais.** Où, quand, comment, pourquoi restent. **Pas d’inversion, pas de point d’interrogation.**'), {
        ex: [['Je me demande s’il va pleuvoir.', 'I wonder if it’s going to rain.'], ['Dis-moi ce qui ne va pas.', 'Tell me what’s wrong.'], ['Elle veut savoir où tu habites.', 'She wants to know where you live.']],
      }),
      card(b('Orders: de + infinitive', 'Les ordres : de + infinitif'), b('**« Fermez la porte ! »** → **Il nous demande de fermer la porte.** Negative: **Il m’a dit de ne pas attendre.**', '**« Fermez la porte ! »** → **Il nous demande de fermer la porte.** Négatif : **Il m’a dit de ne pas attendre.**')),
      mc(P.best, ['Elle me demande si je parle anglais.', 'Elle me demande est-ce que je parle anglais.', 'Elle me demande parlez-vous anglais.', 'Elle me demande que je parle anglais ?']),
      mc(P.best, ['Il veut savoir ce que tu veux.', 'Il veut savoir qu’est-ce que tu veux.', 'Il veut savoir ce qui tu veux.', 'Il veut savoir que veux-tu.']),
      mc(P.best, ['Le médecin me dit de rester au lit.', 'Le médecin me dit que reste au lit.', 'Le médecin me dit rester au lit.', 'Le médecin me dit de reste au lit.'], { fr: '« Restez au lit ! »' }),
      sort(b('Which word introduces the question?', 'Quel mot introduit la question ?'), ['si', 'ce que', 'ce qui'], [['Tu es libre ?', 0], ['Qu’est-ce que tu manges ?', 1], ['Qu’est-ce qui se passe ?', 2], ['Vous avez fini ?', 0], ['Qu’est-ce qu’il dit ?', 1], ['Qu’est-ce qui t’intéresse ?', 2]]),
      gap(P.complete, 'La cliente demande ___ le magasin ferme et ___ elle peut payer par carte.', ['quand', 'si'], { choices: [['quand', 'si', 'ce que'], ['si', 'ce que', 'ce qui']] }),
      dlg(b('Passing on a message', 'Transmettre un message'), b('You relay a call to your manager.', 'Vous transmettez un appel à votre responsable.'), [['Responsable', 'f'], ['Vous', 'm']], [
        [0, 'Qui a appelé ?', 'Who called?'],
        [1, { options: ['M. Roy. Il demande si vous avez reçu son devis.', 'M. Roy. Il demande est-ce que vous avez reçu son devis ?', 'M. Roy. Il demande avez-vous reçu son devis.'] }],
        [0, 'Et qu’est-ce qu’il veut d’autre ?', 'And what else does he want?'],
        [1, { options: ['Il vous demande de le rappeler avant cinq heures.', 'Il vous demande que rappeler avant cinq heures.', 'Il vous demande rappelez-le.'] }],
      ]),
    ],
    [
      b('Yes / no question → si (s’il, s’ils).', 'Question fermée → si (s’il, s’ils).'),
      b('qu’est-ce que → ce que; qu’est-ce qui → ce qui; no inversion.', 'qu’est-ce que → ce que ; qu’est-ce qui → ce qui ; pas d’inversion.'),
      b('Order → demander / dire de + infinitive.', 'Ordre → demander / dire de + infinitif.'),
    ],
    [['un devis', b('a quote, an estimate', 'prix proposé à l’avance')], ['se demander', b('to wonder', 's’interroger')], ['transmettre', b('to pass on', 'faire passer')]],
  ),
  lesson(C, 3, ['sequence-of-tenses', 'concordance-des-temps'],
    b('Il a dit qu’il viendrait: the sequence of tenses', 'Il a dit qu’il viendrait : la concordance des temps'),
    b('Shift the tenses and time words when the reporting verb is in the past.', 'Décaler les temps et les indicateurs de temps quand le verbe introducteur est au passé.'),
    [b('Shift present → imparfait, passé composé → plus-que-parfait, futur → conditionnel', 'Décaler présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel'), b('Change the time markers', 'Changer les indicateurs de temps'), b('Report a past conversation', 'Rapporter une conversation passée')],
    13,
    [
      card(b('Past reporting verb: shift the tenses', 'Verbe introducteur au passé : décaler'), b('After **il a dit, elle a expliqué, il m’a demandé**: present → **imparfait**, passé composé → **plus-que-parfait**, future → **conditionnel**.', 'Après **il a dit, elle a expliqué, il m’a demandé** : présent → **imparfait**, passé composé → **plus-que-parfait**, futur → **conditionnel**.'), {
        table: { head: [b('direct speech', 'discours direct'), b('reported (past)', 'rapporté (passé)')], rows: [['« Je suis prêt. »', 'Il a dit qu’il était prêt.'], ['« J’ai fini. »', 'Il a dit qu’il avait fini.'], ['« Je viendrai. »', 'Il a dit qu’il viendrait.'], ['« Je vais partir. »', 'Il a dit qu’il allait partir.']] },
      }),
      tip(b('Time markers move too', 'Les indicateurs de temps changent aussi'), b('**aujourd’hui → ce jour-là**, **hier → la veille**, **demain → le lendemain**, **la semaine prochaine → la semaine suivante**, **ici → là**.', '**aujourd’hui → ce jour-là**, **hier → la veille**, **demain → le lendemain**, **la semaine prochaine → la semaine suivante**, **ici → là**.')),
      mc(P.best, ['Elle a dit qu’elle partirait le lendemain.', 'Elle a dit qu’elle partira demain.', 'Elle a dit qu’elle partait demain hier.', 'Elle a dit qu’elle était partie demain.'], { fr: 'Elle (il y a un mois) : « Je partirai demain. »' }),
      mc(P.best, ['Il m’a demandé si j’avais vu le film.', 'Il m’a demandé si j’ai vu le film.', 'Il m’a demandé si je verrai le film.', 'Il m’a demandé avais-tu vu le film.'], { fr: '« Tu as vu le film ? »' }),
      sort(b('Which tense after « il a dit que » ?', 'Quel temps après « il a dit que » ?'), [b('imparfait', 'imparfait'), b('plus-que-parfait', 'plus-que-parfait'), b('conditionnel', 'conditionnel')], [['« Je travaille. »', 0], ['« J’ai travaillé. »', 1], ['« Je travaillerai. »', 2], ['« Il fait beau. »', 0], ['« Il a plu. »', 1], ['« Il pleuvra. »', 2]]),
      gap(P.complete, 'Le technicien m’a promis qu’il ___ (venir) le lendemain et qu’il ___ (apporter) la pièce.', ['viendrait', 'apporterait']),
      ord(P.order, 'Elle m’a expliqué qu’elle avait manqué son train.', { tr: 'She explained to me that she had missed her train.' }),
      dict('Il m’a dit qu’il était malade et qu’il ne viendrait pas le lendemain.', { voice: 'f' }),
      say('Mon propriétaire m’a dit qu’il réparerait le chauffage la semaine suivante.', 'My landlord told me he would fix the heating the following week.'),
    ],
    [
      b('After a past verb: present → imparfait, passé composé → plus-que-parfait, futur → conditionnel.', 'Après un verbe au passé : présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel.'),
      b('aller + infinitive → allait + infinitive.', 'aller + infinitif → allait + infinitif.'),
      b('demain → le lendemain, hier → la veille, aujourd’hui → ce jour-là.', 'demain → le lendemain, hier → la veille, aujourd’hui → ce jour-là.'),
    ],
    [['la veille', b('the day before', 'le jour précédent')], ['le lendemain', b('the next day', 'le jour suivant')], ['le chauffage', b('the heating', 'système pour chauffer')]],
  ),
];
