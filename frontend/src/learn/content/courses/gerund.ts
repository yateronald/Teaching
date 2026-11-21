import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'En marchant, en travaillant, en lisant: the gerund (en + -ant) is a compact way to say that two actions happen at the same time, how something is done, or under what condition. This course shows how to form it from the nous form of the present, its three irregular verbs, its three meanings (simultaneity, manner, condition) and the rule of the shared subject that avoids ambiguity.',
    'En marchant, en travaillant, en lisant : le gérondif (en + -ant) permet de dire en peu de mots que deux actions sont simultanées, comment une chose se fait ou à quelle condition. Ce cours montre comment le former à partir de la forme nous du présent, ses trois verbes irréguliers, ses trois sens (simultanéité, manière, condition) et la règle du sujet commun qui évite les ambiguïtés.',
  ),
  outcomes: [
    b('Form the gerund from the nous form', 'Former le gérondif à partir de la forme nous'),
    b('Express simultaneity, manner and condition', 'Exprimer la simultanéité, la manière et la condition'),
    b('Keep the same subject for both verbs', 'Garder le même sujet pour les deux verbes'),
    b('Use tout en for contrast', 'Employer tout en pour l’opposition'),
  ],
};

const C = 'gerund';
export default [
  lesson(C, 1, ['forming-the-gerund', 'former-le-gerondif'],
    b('Forming the gerund', 'Former le gérondif'),
    b('Take the nous form of the present, drop -ons, add -ant, put en before.', 'Prendre la forme nous du présent, enlever -ons, ajouter -ant, et placer en devant.'),
    [b('Form regular gerunds', 'Former les gérondifs réguliers'), b('Learn the three irregulars', 'Retenir les trois irréguliers'), b('Express two simultaneous actions', 'Exprimer deux actions simultanées')],
    13,
    [
      card(b('Nous form → -ant', 'Forme nous → -ant'), b('**nous parlons → parl- → en parlant**, **nous finissons → en finissant**, **nous prenons → en prenant**, **nous faisons → en faisant**. Three irregulars: **être → en étant, avoir → en ayant, savoir → en sachant**.', '**nous parlons → parl- → en parlant**, **nous finissons → en finissant**, **nous prenons → en prenant**, **nous faisons → en faisant**. Trois irréguliers : **être → en étant, avoir → en ayant, savoir → en sachant**.'), {
        ex: [['Il chante en cuisinant.', 'He sings while cooking.'], ['Ne téléphone pas en conduisant !', 'Don’t phone while driving!'], ['Elle écoute des podcasts en courant.', 'She listens to podcasts while running.']],
      }),
      pairs(b('Match each verb with its gerund.', 'Associez chaque verbe à son gérondif.'), [['lire', 'en lisant'], ['voir', 'en voyant'], ['choisir', 'en choisissant'], ['avoir', 'en ayant']], true),
      mc(P.form, ['en mangeant', 'en mangant', 'en manjant', 'en mangeons'], { fr: 'Ne parle pas ___ !', explain: b('nous mangeons → en mangeant (keep the e).', 'nous mangeons → en mangeant (on garde le e).') }),
      mc(P.form, ['en étant', 'en étant été', 'en ayant', 'en soyant'], { fr: 'On apprend beaucoup ___ curieux.' }),
      mc(P.form, ['en commençant', 'en commencant', 'en commençant à', 'en commenssant'], { fr: 'Il s’est fait mal ___ le match.' }),
      gap(P.complete, 'J’ai rencontré ma voisine ___ ___ (sortir) du métro.', ['en', 'sortant']),
      ord(P.order, 'Je prends mon café en lisant les nouvelles.', { tr: 'I have my coffee while reading the news.' }),
      say('Le matin, j’écoute la radio en préparant le petit-déjeuner.', 'In the morning, I listen to the radio while making breakfast.'),
    ],
    [
      b('Gerund = en + nous stem + -ant (en parlant, en finissant).', 'Gérondif = en + radical de nous + -ant (en parlant, en finissant).'),
      b('Irregulars: en étant, en ayant, en sachant.', 'Irréguliers : en étant, en ayant, en sachant.'),
      b('Keep the spelling: en mangeant, en commençant.', 'Gardez l’orthographe : en mangeant, en commençant.'),
    ],
    [['se faire mal', b('to hurt oneself', 'se blesser')], ['curieux', b('curious', 'qui veut savoir')], ['les nouvelles', b('the news', 'l’actualité')]],
  ),
  lesson(C, 2, ['manner-and-condition', 'maniere-et-condition'],
    b('How and under what condition', 'Comment et à quelle condition'),
    b('Use the gerund to say how something is done and under what condition.', 'Employer le gérondif pour dire comment une chose se fait et à quelle condition.'),
    [b('Express manner (how?)', 'Exprimer la manière (comment ?)'), b('Express condition (if…)', 'Exprimer la condition (si…)'), b('Give practical advice', 'Donner des conseils pratiques')],
    13,
    [
      card(b('Three meanings', 'Trois sens'), b('**Time** (while): **Il siffle en travaillant.** **Manner** (by …-ing): **Il a appris le français en regardant des séries.** **Condition** (if): **En partant maintenant, tu arriveras à l’heure.** (= si tu pars maintenant)', '**Temps** : **Il siffle en travaillant.** **Manière** : **Il a appris le français en regardant des séries.** **Condition** : **En partant maintenant, tu arriveras à l’heure.** (= si tu pars maintenant)'), {
        ex: [['On économise en prenant le vélo.', 'You save money by cycling.'], ['En cherchant bien, tu trouveras.', 'If you look carefully, you’ll find it.']],
      }),
      sort(b('Time, manner or condition?', 'Temps, manière ou condition ?'), [b('time (while)', 'temps'), b('manner (how)', 'manière'), b('condition (if)', 'condition')], [['Il chante en se douchant.', 0], ['Elle a maigri en marchant tous les jours.', 1], ['En réservant tôt, vous payez moins.', 2], ['Je l’ai vu en sortant.', 0], ['On progresse en pratiquant.', 1], ['En travaillant plus, tu réussiras.', 2]]),
      mc(P.meaning, [b('If you take the highway, you will save time.', 'Si vous prenez l’autoroute, vous gagnerez du temps.'), b('While taking the highway, you lost time.', 'Pendant l’autoroute, vous avez perdu du temps.'), b('You took the highway to save money.', 'Vous avez pris l’autoroute pour économiser.'), b('The highway is closed.', 'L’autoroute est fermée.')], { fr: 'En prenant l’autoroute, vous gagnerez vingt minutes.' }),
      mc(P.best, ['J’ai trouvé ce travail en lisant les petites annonces.', 'J’ai trouvé ce travail pour lisant les annonces.', 'J’ai trouvé ce travail en lis les annonces.', 'J’ai trouvé ce travail lisant en les annonces.'], { fr: 'Comment as-tu trouvé ce travail ?' }),
      gap(P.complete, 'Vous pouvez économiser de l’énergie ___ ___ (éteindre) la lumière.', ['en', 'éteignant']),
      pairs(P.match, [['en faisant attention', b('by being careful', 'avec prudence')], ['en attendant', b('in the meantime', 'pendant ce temps')], ['en passant', b('by the way; in passing', 'au passage')], ['en rentrant', b('on the way home', 'au retour')]]),
      dlg(b('Learning tips', 'Conseils d’apprentissage'), undefined, [['Lina', 'f'], ['Vous', 'm']], [
        [0, 'Comment tu as fait pour progresser si vite en français ?', 'How did you improve so fast in French?'],
        [1, { options: ['En regardant des séries québécoises et en parlant avec mes collègues.', 'Pour regarder des séries et pour parlant.', 'En regarde des séries et en parle.'] }],
        [0, 'Et la grammaire ?', 'What about grammar?'],
        [1, { options: ['Je la révise en faisant dix minutes d’exercices par jour.', 'Je la révise en fais dix minutes.', 'Je la révise faisant en dix minutes.'] }],
      ]),
      dict('En réservant aujourd’hui, vous profitez de dix pour cent de réduction.', { voice: 'f' }),
    ],
    [
      b('Time: Il siffle en travaillant. Manner: en regardant des séries. Condition: En partant maintenant…', 'Temps : en travaillant. Manière : en regardant des séries. Condition : En partant maintenant…'),
      b('en attendant = in the meantime; en passant = by the way.', 'en attendant = pendant ce temps ; en passant = au passage.'),
      b('A gerund answers “how?” or “when?”.', 'Le gérondif répond à « comment ? » ou « quand ? ».'),
    ],
    [['économiser', b('to save (money, energy)', 'dépenser moins')], ['éteindre', b('to switch off', 'arrêter un appareil')], ['les petites annonces', b('the classified ads', 'offres publiées')]],
  ),
  lesson(C, 3, ['same-subject-and-tout-en', 'meme-sujet-et-tout-en'],
    b('The same subject, and tout en', 'Le même sujet, et tout en'),
    b('Avoid ambiguity with a shared subject, and use tout en for contrast.', 'Éviter l’ambiguïté grâce au sujet commun, et employer tout en pour l’opposition.'),
    [b('Keep the same subject for both verbs', 'Garder le même sujet pour les deux verbes'), b('Use tout en for simultaneity or contrast', 'Employer tout en pour la simultanéité ou l’opposition'), b('Rewrite with quand, si or pendant que', 'Reformuler avec quand, si ou pendant que')],
    13,
    [
      trap(b('One subject for two verbs', 'Un seul sujet pour les deux verbes'), b('The gerund has the **same subject** as the main verb. « En arrivant à l’hôtel, la réceptionniste m’a accueilli » means the receptionist was arriving! Say: **En arrivant à l’hôtel, j’ai été accueilli par la réceptionniste** or **Quand je suis arrivé…**', 'Le gérondif a le **même sujet** que le verbe principal. « En arrivant à l’hôtel, la réceptionniste m’a accueilli » signifie que la réceptionniste arrivait ! Dites : **En arrivant à l’hôtel, j’ai été accueilli par la réceptionniste** ou **Quand je suis arrivé…**')),
      card(b('Tout en: at the same time, or although', 'Tout en : en même temps, ou bien que'), b('**tout en** + gerund insists on simultaneity, or marks a contrast: **Il travaille tout en étudiant. Tout en étant d’accord, je pense qu’il faut attendre.** (= although I agree)', '**tout en** + gérondif insiste sur la simultanéité, ou marque une opposition : **Il travaille tout en étudiant. Tout en étant d’accord, je pense qu’il faut attendre.** (= bien que je sois d’accord)'), {
        ex: [['Elle sourit tout en refusant.', 'She smiles while refusing.'], ['Tout en comprenant ta colère, je ne suis pas d’accord.', 'While I understand your anger, I don’t agree.']],
      }),
      mc(P.best, ['En sortant du bureau, j’ai croisé mon ancien patron.', 'En sortant du bureau, mon ancien patron m’a croisé.', 'En sortant du bureau, la pluie a commencé.', 'En sortant du bureau, il pleuvait sur moi.'], { explain: b('The subject of the gerund must be the subject of the sentence (je).', 'Le sujet du gérondif doit être celui de la phrase (je).') }),
      mc(P.meaning, [b('Although he earns a good salary, he complains.', 'Bien qu’il gagne bien sa vie, il se plaint.'), b('He complains because he earns a lot.', 'Il se plaint parce qu’il gagne beaucoup.'), b('He earns money by complaining.', 'Il gagne de l’argent en se plaignant.'), b('He will complain if he earns a lot.', 'Il se plaindra s’il gagne beaucoup.')], { fr: 'Tout en gagnant bien sa vie, il se plaint sans arrêt.' }),
      sort(b('Rewrite: which conjunction?', 'Reformulez : quelle conjonction ?'), ['quand', 'si', b('bien que', 'bien que')], [['En arrivant, j’ai vu le problème.', 0], ['En partant tôt, tu éviteras les bouchons.', 1], ['Tout en étant fatigué, il a continué.', 2], ['En ouvrant la porte, elle a crié.', 0], ['En lisant chaque soir, tu progresseras.', 1], ['Tout en l’aimant, elle est partie.', 2]]),
      gap(P.complete, '___ en ___ (être) très occupée, elle trouve toujours du temps pour sa famille.', ['Tout', 'étant']),
      ord(P.order, 'Il écoute tout en prenant des notes.', { tr: 'He listens while taking notes.' }),
      say('Tout en respectant votre avis, je propose une autre solution.', 'While respecting your opinion, I suggest another solution.'),
    ],
    [
      b('Gerund and main verb share the same subject.', 'Le gérondif et le verbe principal ont le même sujet.'),
      b('tout en = while at the same time, or although (contrast).', 'tout en = en même temps, ou bien que (opposition).'),
      b('Rewrite with quand (time), si (condition), bien que (contrast).', 'Reformulation : quand (temps), si (condition), bien que (opposition).'),
    ],
    [['croiser', b('to run into', 'rencontrer par hasard')], ['se plaindre', b('to complain', 'exprimer son mécontentement')], ['les bouchons', b('traffic jams', 'embouteillages')]],
  ),
];
