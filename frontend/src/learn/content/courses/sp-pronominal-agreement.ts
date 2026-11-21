import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Elles se sont lavées, but elles se sont lavé les mains. Ils se sont parlé, but ils se sont vus. Pronominal verbs use être in compound tenses, yet their participle follows a logic close to avoir. This B2 course gives you a clear method: identify whether se is a direct or indirect object, check what comes after the verb, and know the essentially pronominal verbs (s’enfuir, se souvenir) that always agree.',
    'Elles se sont lavées, mais elles se sont lavé les mains. Ils se sont parlé, mais ils se sont vus. Les verbes pronominaux se conjuguent avec être aux temps composés, et pourtant leur participe suit une logique proche de celle d’avoir. Ce cours de niveau B2 vous donne une méthode claire : identifier si se est COD ou COI, regarder ce qui suit le verbe, et connaître les verbes essentiellement pronominaux (s’enfuir, se souvenir) qui s’accordent toujours.',
  ),
  outcomes: [
    b('Agree essentially pronominal verbs', 'Accorder les verbes essentiellement pronominaux'),
    b('Decide if se is COD or COI', 'Déterminer si se est COD ou COI'),
    b('Handle a COD after the verb', 'Gérer un COD placé après le verbe'),
    b('Know the invariable cases (se parler, se plaire…)', 'Connaître les cas invariables (se parler, se plaire…)'),
  ],
};

const C = 'sp-pronominal-agreement';
export default [
  lesson(C, 1, ['essentially-pronominal-verbs', 'verbes-essentiellement-pronominaux'],
    b('Verbs that are always pronominal', 'Les verbes toujours pronominaux'),
    b('Agree with the subject when the verb only exists in the pronominal form.', 'Accorder avec le sujet quand le verbe n’existe qu’à la forme pronominale.'),
    [b('Recognise essentially pronominal verbs', 'Reconnaître les verbes essentiellement pronominaux'), b('Agree with the subject', 'Accorder avec le sujet'), b('Include se souvenir, s’enfuir, s’évanouir', 'Inclure se souvenir, s’enfuir, s’évanouir')],
    13,
    [
      card(b('Always agree', 'Toujours accorder'), b('Some verbs **only exist** with se: **s’enfuir, se souvenir, s’évanouir, s’absenter, se méfier, s’envoler, se moquer, s’emparer, se repentir**. Their participle **agrees with the subject**: **Elles se sont enfuies.** · **Ils se sont souvenus de tout.** · **Elle s’est évanouie.** Exception: **s’arroger** (rare).', 'Certains verbes **n’existent qu’avec** se : **s’enfuir, se souvenir, s’évanouir, s’absenter, se méfier, s’envoler, se moquer, s’emparer, se repentir**. Leur participe **s’accorde avec le sujet** : **Elles se sont enfuies.** · **Ils se sont souvenus de tout.** · **Elle s’est évanouie.** Exception : **s’arroger** (rare).')),
      mc(P.form, ['Les oiseaux se sont envolés.', 'Les oiseaux se sont envolé.', 'Les oiseaux se sont envolées.', 'Les oiseaux se sont envoler.']),
      mc(P.form, ['Elle s’est souvenue de son enfance.', 'Elle s’est souvenu de son enfance.', 'Elle s’est souvenus de son enfance.', 'Elle s’est souvenir de son enfance.']),
      gap(P.complete, 'Les voleuses se sont ___ (enfuir) et les témoins se sont ___ (méfier) trop tard.', ['enfuies', 'méfiés'], { strict: true }),
      sort(b('Essentially pronominal?', 'Essentiellement pronominal ?'), [b('only exists with se', 'n’existe qu’avec se'), b('also exists without se', 'existe aussi sans se')], [['s’évanouir', 0], ['se laver', 1], ['se souvenir', 0], ['se parler', 1], ['s’enfuir', 0], ['se regarder', 1]]),
      dict('Les enfants se sont moqués du clown, puis ils se sont enfuis en riant.', { strict: true }),
    ],
    [
      b('Essentially pronominal verbs: agree with the subject.', 'Verbes essentiellement pronominaux : accord avec le sujet.'),
      b('s’enfuir, se souvenir, s’évanouir, se méfier, s’envoler, se moquer.', 's’enfuir, se souvenir, s’évanouir, se méfier, s’envoler, se moquer.'),
      b('Test: does the verb exist without se? (enfuir: no).', 'Test : le verbe existe-t-il sans se ? (enfuir : non).'),
    ],
    [['s’évanouir', b('to faint', 'perdre connaissance')], ['se méfier', b('to be wary', 'ne pas faire confiance')], ['un témoin', b('a witness', 'personne qui a vu')]],
  ),
  lesson(C, 2, ['se-cod-or-coi', 'se-cod-ou-coi'],
    b('Is se a direct or indirect object?', 'Se est-il COD ou COI ?'),
    b('Rewrite with avoir to know whether se is COD (agreement) or COI (no agreement).', 'Réécrire avec avoir pour savoir si se est COD (accord) ou COI (pas d’accord).'),
    [b('Rewrite with avoir', 'Réécrire avec avoir'), b('Agree when se is COD', 'Accorder quand se est COD'), b('No agreement when se is COI', 'Pas d’accord quand se est COI')],
    13,
    [
      card(b('The avoir test', 'Le test avec avoir'), b('Rewrite with avoir: **Elles se sont regardées** → elles ont regardé **qui ?** elles-mêmes (**se = COD**, placed before → agreement). **Elles se sont parlé** → elles ont parlé **à qui ?** à elles-mêmes (**se = COI** → no agreement). Invariable because se is COI: **se parler, se téléphoner, se sourire, se plaire, se nuire, se succéder, se ressembler, se mentir, se demander**.', 'Réécrivez avec avoir : **Elles se sont regardées** → elles ont regardé **qui ?** elles-mêmes (**se = COD**, placé avant → accord). **Elles se sont parlé** → elles ont parlé **à qui ?** à elles-mêmes (**se = COI** → pas d’accord). Invariables car se est COI : **se parler, se téléphoner, se sourire, se plaire, se nuire, se succéder, se ressembler, se mentir, se demander**.')),
      sort(b('se = COD (agree) or COI (no agreement)?', 'se = COD (accord) ou COI (pas d’accord) ?'), [b('COD: agreement', 'COD : accord'), b('COI: invariable', 'COI : invariable')], [['elles se sont vu…', 0], ['elles se sont téléphon…', 1], ['ils se sont aim…', 0], ['ils se sont souri…', 1], ['elles se sont rencontr…', 0], ['elles se sont menti…', 1]]),
      mc(P.form, ['Elles se sont écrit pendant des années.', 'Elles se sont écrites pendant des années.', 'Elles se sont écrits pendant des années.', 'Elles se sont écrite pendant des années.']),
      mc(P.form, ['Ils se sont rencontrés à Montréal.', 'Ils se sont rencontré à Montréal.', 'Ils se sont rencontrées à Montréal.', 'Ils se sont rencontrer à Montréal.']),
      gap(P.complete, 'Les deux sœurs se sont ___ (téléphoner), puis elles se sont ___ (voir) au café.', ['téléphoné', 'vues'], { strict: true }),
      dict('Elles se sont rencontrées en 2010, se sont plu tout de suite et se sont souri toute la soirée.', { strict: true, hint: b('rencontrées (COD), plu and souri (COI: invariable).', 'rencontrées (COD), plu et souri (COI : invariables).') }),
    ],
    [
      b('Rewrite with avoir: qui ? → se COD → agree.', 'Réécrivez avec avoir : qui ? → se COD → accord.'),
      b('à qui ? → se COI → no agreement.', 'à qui ? → se COI → pas d’accord.'),
      b('Invariable: se parler, se téléphoner, se sourire, se plaire, se succéder, se mentir.', 'Invariables : se parler, se téléphoner, se sourire, se plaire, se succéder, se mentir.'),
    ],
    [['se succéder', b('to follow one another', 'venir l’un après l’autre')], ['se nuire', b('to harm each other', 'se faire du tort')], ['se plaire', b('to like each other', 's’apprécier')]],
  ),
  lesson(C, 3, ['cod-after-the-verb', 'cod-apres-le-verbe'],
    b('When a COD follows the verb', 'Quand un COD suit le verbe'),
    b('Elle s’est lavé les mains: no agreement when the real COD comes after.', 'Elle s’est lavé les mains : pas d’accord quand le vrai COD suit.'),
    [b('Spot a COD after the verb', 'Repérer un COD après le verbe'), b('Keep the participle invariable', 'Laisser le participe invariable'), b('Agree when that COD moves before', 'Accorder quand ce COD passe avant')],
    13,
    [
      card(b('The real COD', 'Le vrai COD'), b('If a **COD follows** the verb, **se is COI** and the participle stays **invariable**: **Elle s’est lavé les mains.** · **Ils se sont offert des fleurs.** · **Elle s’est cassé la jambe.** If that COD moves **before** (que, les), the participle agrees with it: **Les fleurs qu’ils se sont offertes.** · **Les mains, elle se les est lavées.**', 'Si un **COD suit** le verbe, **se est COI** et le participe reste **invariable** : **Elle s’est lavé les mains.** · **Ils se sont offert des fleurs.** · **Elle s’est cassé la jambe.** Si ce COD passe **avant** (que, les), le participe s’accorde avec lui : **Les fleurs qu’ils se sont offertes.** · **Les mains, elle se les est lavées.**')),
      mc(P.form, ['Elle s’est coupé le doigt.', 'Elle s’est coupée le doigt.', 'Elle s’est coupés le doigt.', 'Elle s’est couper le doigt.']),
      mc(P.form, ['Voici les cadeaux qu’ils se sont offerts.', 'Voici les cadeaux qu’ils se sont offert.', 'Voici les cadeaux qu’ils se sont offertes.', 'Voici les cadeaux qu’ils se sont offrir.']),
      sort(b('Agreement or not?', 'Accord ou pas ?'), [b('agreement', 'accord'), b('invariable', 'invariable')], [['Elle s’est lav… (seule)', 0], ['Elle s’est lav… les cheveux.', 1], ['les lettres qu’elles se sont écrit…', 0], ['Elles se sont écrit… des lettres.', 1], ['Ils se sont bless…', 0], ['Ils se sont bless… le genou.', 1]]),
      gap(P.complete, 'Marie s’est ___ (brosser) les dents, puis elle s’est ___ (coucher).', ['brossé', 'couchée'], { strict: true }),
      dict('Elles se sont acheté des robes ; les robes qu’elles se sont achetées sont superbes.', { strict: true, hint: b('acheté (COD after), achetées (COD before: que = les robes).', 'acheté (COD après), achetées (COD avant : que = les robes).') }),
    ],
    [
      b('COD after the verb → participle invariable (s’est lavé les mains).', 'COD après le verbe → participe invariable (s’est lavé les mains).'),
      b('COD moved before (que, les) → agree with it.', 'COD placé avant (que, les) → accord avec lui.'),
      b('Method: find se\'s function, then the real COD.', 'Méthode : trouvez la fonction de se, puis le vrai COD.'),
    ],
    [['se blesser', b('to get hurt', 'se faire mal')], ['le genou', b('the knee', 'articulation de la jambe')], ['superbe', b('superb', 'magnifique')]],
  ),
];
