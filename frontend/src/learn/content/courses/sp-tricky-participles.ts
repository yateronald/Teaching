import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'La maison qu’il a fait construire, les années qu’il a vécu or vécues, les trois heures que le film a duré, les efforts que ça m’a coûté: beyond the basic rule, several past participles follow special logic. This B2 course covers fait + infinitive (always invariable), laissé + infinitive, verbs of measure (coûter, valoir, durer, peser), impersonal verbs (il a fallu), and the participle followed by an infinitive.',
    'La maison qu’il a fait construire, les années qu’il a vécu ou vécues, les trois heures que le film a duré, les efforts que ça m’a coûté : au-delà de la règle de base, plusieurs participes passés suivent une logique particulière. Ce cours de niveau B2 couvre fait + infinitif (toujours invariable), laissé + infinitif, les verbes de mesure (coûter, valoir, durer, peser), les verbes impersonnels (il a fallu) et le participe suivi d’un infinitif.',
  ),
  outcomes: [
    b('Keep fait + infinitive invariable', 'Laisser fait + infinitif invariable'),
    b('Handle verbs of measure', 'Gérer les verbes de mesure'),
    b('Keep impersonal participles invariable', 'Laisser invariables les participes impersonnels'),
    b('Decide with a following infinitive', 'Décider devant un infinitif'),
  ],
};

const C = 'sp-tricky-participles';
export default [
  lesson(C, 1, ['fait-and-laisse', 'fait-et-laisse'],
    b('Fait and laissé + infinitive', 'Fait et laissé + infinitif'),
    b('Keep fait + infinitive invariable; laissé + infinitive too (1990 rule).', 'Laisser fait + infinitif invariable ; laissé + infinitif aussi (règle de 1990).'),
    [b('fait + infinitive: invariable', 'fait + infinitif : invariable'), b('laissé + infinitive: invariable (recommended)', 'laissé + infinitif : invariable (recommandé)'), b('Spot the construction', 'Repérer la construction')],
    13,
    [
      card(b('Fait + infinitive', 'Fait + infinitif'), b('**fait** followed by an **infinitive** is **always invariable**: **La maison qu’il a fait construire.** · **Elle s’est fait couper les cheveux.** · **Ils se sont fait avoir.** Since the 1990 rectifications, **laissé + infinitive** is also recommended invariable: **Elle s’est laissé convaincre.**', '**fait** suivi d’un **infinitif** est **toujours invariable** : **La maison qu’il a fait construire.** · **Elle s’est fait couper les cheveux.** · **Ils se sont fait avoir.** Depuis les rectifications de 1990, **laissé + infinitif** est aussi recommandé invariable : **Elle s’est laissé convaincre.**')),
      mc(P.form, ['Elle s’est fait opérer hier.', 'Elle s’est faite opérer hier.', 'Elle s’est faits opérer hier.', 'Elle s’est fait opérée hier.']),
      mc(P.form, ['Les robes qu’elle a fait faire sont superbes.', 'Les robes qu’elle a faites faire sont superbes.', 'Les robes qu’elle a fait faites sont superbes.', 'Les robes qu’elle a faite faire sont superbes.']),
      sort(b('Agreement or invariable?', 'Accord ou invariable ?'), [b('agreement', 'accord'), b('invariable', 'invariable')], [['les gâteaux qu’elle a fait…', 0], ['les gâteaux qu’elle a fait… cuire', 1], ['la lettre qu’il a écrit…', 0], ['la lettre qu’il a fait… écrire', 1], ['Elles se sont fait… mal.', 1], ['Elles se sont maquill…', 0]]),
      gap(P.complete, 'Ma voiture ? Je l’ai ___ réparer. La réparation que j’ai ___ était chère.', ['fait', 'payée'], { strict: true }),
      dict('Elles se sont fait couper les cheveux dans le salon qu’elles avaient choisi.', { strict: true }),
    ],
    [
      b('fait + infinitive: always invariable.', 'fait + infinitif : toujours invariable.'),
      b('laissé + infinitive: invariable recommended since 1990.', 'laissé + infinitif : invariable recommandé depuis 1990.'),
      b('fait alone follows the normal rule (les gâteaux qu’elle a faits).', 'fait seul suit la règle normale (les gâteaux qu’elle a faits).'),
    ],
    [['se faire avoir', b('to be fooled (informal)', 'être trompé')], ['opérer', b('to operate on', 'faire une opération')], ['se maquiller', b('to put on make-up', 'mettre du maquillage')]],
  ),
  lesson(C, 2, ['measure-and-impersonal-verbs', 'verbes-de-mesure-et-impersonnels'],
    b('Verbs of measure and impersonal verbs', 'Verbes de mesure et verbes impersonnels'),
    b('Coûter, valoir, durer, peser, vivre: measure or real object? And il a fallu.', 'Coûter, valoir, durer, peser, vivre : mesure ou vrai COD ? Et il a fallu.'),
    [b('Measure: no agreement', 'Mesure : pas d’accord'), b('Real COD: agreement', 'Vrai COD : accord'), b('Impersonal verbs: invariable', 'Verbes impersonnels : invariables')],
    13,
    [
      card(b('Measure or object?', 'Mesure ou objet ?'), b('With **coûter, valoir, durer, peser, mesurer, courir, vivre, régner**, a **measure** (combien ?) is not a COD → **invariable**: **les 200 euros que ce livre a coûté**, **les trois heures que le film a duré**. When the verb has a **figurative** sense, there is a real COD → agreement: **les efforts que ce travail m’a coûtés** · **les dangers qu’il a courus** · **les années difficiles qu’il a vécues** (accepted both ways). **Impersonal**: **les efforts qu’il a fallu**, **la chaleur qu’il a fait** → invariable.', 'Avec **coûter, valoir, durer, peser, mesurer, courir, vivre, régner**, une **mesure** (combien ?) n’est pas un COD → **invariable** : **les 200 euros que ce livre a coûté**, **les trois heures que le film a duré**. Au **sens figuré**, il y a un vrai COD → accord : **les efforts que ce travail m’a coûtés** · **les dangers qu’il a courus**. **Impersonnels** : **les efforts qu’il a fallu**, **la chaleur qu’il a fait** → invariables.')),
      mc(P.form, ['Les deux heures que la réunion a duré m’ont paru longues.', 'Les deux heures que la réunion a durées m’ont paru longues.', 'Les deux heures que la réunion a durés m’ont paru longues.', 'Les deux heures que la réunion a durée m’ont paru longues.']),
      mc(P.form, ['Quelle chaleur il a fait cet été !', 'Quelle chaleur il a faite cet été !', 'Quelle chaleur il a faites cet été !', 'Quelle chaleur il a fais cet été !']),
      sort(b('Measure (invariable) or real COD (agreement)?', 'Mesure (invariable) ou vrai COD (accord) ?'), [b('measure: invariable', 'mesure : invariable'), b('real COD: agreement', 'vrai COD : accord')], [['les 10 kilos que le sac a pes…', 0], ['les valises que j’ai pes…', 1], ['les 500 euros que ça a coût…', 0], ['les larmes que ça m’a coût…', 1], ['les dix ans qu’il a vécu… ici', 0], ['les aventures qu’il a vécu…', 1]]),
      gap(P.complete, 'Avec toutes les démarches qu’il a ___ (falloir), les trois mois que le dossier a ___ (durer) m’ont semblé interminables.', ['fallu', 'duré'], { strict: true }),
      dict('Les efforts que ce projet m’a coûtés sont immenses, mais les mille euros qu’il a coûté sont raisonnables.', { strict: true }),
    ],
    [
      b('Measure (combien ?): invariable — les heures que ça a duré.', 'Mesure (combien ?) : invariable — les heures que ça a duré.'),
      b('Figurative sense: real COD → agreement — les efforts que ça m’a coûtés.', 'Sens figuré : vrai COD → accord — les efforts que ça m’a coûtés.'),
      b('Impersonal: invariable — il a fallu, il a fait chaud.', 'Impersonnel : invariable — il a fallu, il a fait chaud.'),
    ],
    [['une démarche', b('a procedure, a step', 'formalité')], ['interminable', b('endless', 'qui ne finit pas')], ['peser', b('to weigh', 'avoir un poids')]],
  ),
  lesson(C, 3, ['participle-plus-infinitive', 'participe-suivi-d-un-infinitif'],
    b('Participle + infinitive', 'Le participe suivi d’un infinitif'),
    b('Agree only if the COD placed before performs the action of the infinitive.', 'Accorder seulement si le COD placé avant fait l’action de l’infinitif.'),
    [b('Find who does the action', 'Trouver qui fait l’action'), b('Agree when the COD acts', 'Accorder quand le COD agit'), b('Invariable when the COD undergoes', 'Invariable quand le COD subit')],
    13,
    [
      card(b('Who does the action?', 'Qui fait l’action ?'), b('**La chanteuse que j’ai entendue chanter**: the singer **sings** (she does the action) → agreement. **La chanson que j’ai entendu chanter**: the song **does not sing**, it is sung → invariable. Test: can you say « **la chanteuse chantait** »? Yes → agreement. « **la chanson chantait** »? No → invariable. Also invariable: **dû, pu, voulu** with an implied infinitive: **Il a fait tous les efforts qu’il a pu (faire).**', '**La chanteuse que j’ai entendue chanter** : la chanteuse **chante** (elle fait l’action) → accord. **La chanson que j’ai entendu chanter** : la chanson ne chante pas, elle est chantée → invariable. Test : peut-on dire « **la chanteuse chantait** » ? Oui → accord. « **la chanson chantait** » ? Non → invariable. Invariables aussi : **dû, pu, voulu** avec un infinitif sous-entendu : **Il a fait tous les efforts qu’il a pu (faire).**')),
      mc(P.form, ['Les enfants que j’ai vus jouer étaient heureux.', 'Les enfants que j’ai vu jouer étaient heureux.', 'Les enfants que j’ai vues jouer étaient heureux.', 'Les enfants que j’ai vue jouer étaient heureux.']),
      mc(P.form, ['Les arbres que j’ai vu abattre étaient centenaires.', 'Les arbres que j’ai vus abattre étaient centenaires.', 'Les arbres que j’ai vues abattre étaient centenaires.', 'Les arbres que j’ai vue abattre étaient centenaires.'], { explain: b('The trees do not cut: they are cut → invariable.', 'Les arbres n’abattent pas, ils sont abattus → invariable.') }),
      sort(b('Agreement or invariable?', 'Accord ou invariable ?'), [b('agreement (the COD acts)', 'accord (le COD agit)'), b('invariable (the COD undergoes)', 'invariable (le COD subit)')], [['les musiciens que j’ai entendu… jouer', 0], ['les airs que j’ai entendu… jouer', 1], ['la pianiste que j’ai écouté… jouer', 0], ['la maison que j’ai vu… construire', 1], ['les oiseaux que j’ai regardé… voler', 0], ['les lettres que j’ai dû… écrire', 1]]),
      gap(P.complete, 'La comédienne que j’ai ___ (voir) jouer était excellente, et la pièce que j’ai ___ (voir) jouer aussi.', ['vue', 'vu'], { strict: true }),
      dict('Les élèves que j’ai entendus chanter ont interprété des chansons que j’avais entendu chanter enfant.', { strict: true }),
    ],
    [
      b('COD before + infinitive: agree if the COD does the action.', 'COD avant + infinitif : accord si le COD fait l’action.'),
      b('Test: « la chanteuse chantait » (yes → agree).', 'Test : « la chanteuse chantait » (oui → accord).'),
      b('dû, pu, voulu with an implied infinitive: invariable.', 'dû, pu, voulu avec un infinitif sous-entendu : invariables.'),
    ],
    [['abattre', b('to cut down', 'faire tomber un arbre')], ['centenaire', b('a hundred years old', 'qui a cent ans')], ['interpréter', b('to perform', 'jouer, chanter')]],
  ),
];
