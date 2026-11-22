import type { CourseAbout } from '../../types';
import { b, card, dict, gap, hear, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Why do we say l’hôtel and les‿hommes, yet le hibou and les | héros? In French, neither type of h is ever breathed out—there is no English [h] sound at all—but one acts like a vowel and the other acts like an invisible wall. This A2 course teaches you how h muet and h aspiré govern elision and liaison in speech.',
    'Pourquoi dit-on l’hôtel et les‿hommes, mais le hibou et les | héros ? En français, aucun h ne se souffle — le son [h] anglais n’existe pas — mais l’un ouvre la porte comme une voyelle tandis que l’autre dresse un mur invisible. Ce cours A2 vous apprend à distinguer h muet et h aspiré pour réussir élisions et liaisons à l’oral.',
  ),
  outcomes: [
    b('Remember that both h muet and h aspiré are silent in French', 'Retenir que h muet et h aspiré sont tous deux muets'),
    b('Elide and link before h muet words (l’hôtel, les‿hommes)', 'Élider et lier devant un h muet (l’hôtel, les‿hommes)'),
    b('Keep le/la and block liaison before h aspiré (le héros, les | haricots)', 'Garder le/la et bloquer la liaison devant un h aspiré'),
    b('Master high-frequency h aspiré words like dehors, haut, hasard, huit', 'Maîtriser les mots fréquents à h aspiré comme dehors, haut, hasard, huit'),
  ],
};

const C = 'p-h-muet-aspire';
export default [
  lesson(C, 1, ['silent-h-elision-and-liaison', 'le-h-muet-elision-et-liaison'],
    b('H muet: elide and link as if the h weren’t there', 'Le h muet : élider et lier comme s’il n’était pas là'),
    b('Treat h muet words exactly like words beginning with a vowel.', 'Traiter les mots à h muet exactement comme des mots commençant par une voyelle.'),
    [b('Never breathe out an English [h]', 'Ne jamais souffler un [h] anglais'), b('Apply elision with l’, d’, j’ before h muet', 'Appliquer l’élision l’, d’, j’ devant h muet'), b('Make required liaisons (les‿hommes, un‿hôtel)', 'Faire les liaisons obligatoires (les‿hommes, un‿hôtel)')],
    13,
    [
      card(b('H muet = invisible vowel opener', 'H muet = porte ouverte sur la voyelle'), b('In standard French, **neither h is ever pronounced**. Most h-words—especially Latin/Greek ones like **l’hôtel, l’homme, l’heure, l’histoire, l’hôpital, l’hiver, habiter**—have an **h muet**. Treat them as starting with a vowel: **elide** (**l’hôtel, j’habite, d’habitude**) and **link** (**les‿hommes [lezɔm], un‿hôtel [œ̃notɛl], deux‿heures [døzœʁ]**).', 'En français standard, **aucun h ne se prononce jamais**. La majorité des mots en h (**hôtel, homme, heure, histoire, hôpital, hiver, habiter**) ont un **h muet**. On les traite comme une voyelle : **élision** (**l’hôtel, j’habite, d’habitude**) et **liaison** (**les‿hommes [lezɔm], un‿hôtel [œ̃notɛl], deux‿heures [døzœʁ]**).'), {
        ex: [['l’hôtel, j’habite à l’hôpital', 'elision l’, j’'], ['les hommes, deux heures, en hiver', 'liaison [z], [n]']],
      }),
      tip(b('Watch out for English [h]!', 'Attention au [h] anglais !'), b('Don’t breathe out air on *hôtel*, *hôpital* or *heure*. Start straight on the vowel: *l’hôtel* sounds like **lotel**; *les hommes* sounds like **lézom**.', 'Ne soufflez pas d’air sur *hôtel*, *hôpital* ou *heure*. Attaquez tout de suite la voyelle : *l’hôtel* sonne **lotel** ; *les hommes* sonne **lézom**.')),
      hear('Les hommes arrivent à l’hôtel dans deux heures.', b('Listen. How many liaisons do you hear before h-words?', 'Écoutez. Combien de liaisons entendez-vous devant les mots en h ?'), [b('Two: les‿hommes [z] and deux‿heures [z]', 'Deux : les‿hommes [z] et deux‿heures [z]'), b('None, all three h’s block liaison', 'Aucune, les trois h bloquent la liaison'), b('One, only after deux', 'Une seule, après deux'), b('Three, including after à', 'Trois, y compris après à')], { voice: 'f' }),
      sort(b('Singular elision or plural liaison?', 'Élision au singulier ou liaison au pluriel ?'), [b('elision (l’)', 'élision (l’)'), b('liaison ([z] / [n])', 'liaison ([z] / [n])')], [['l’hôtel', 0], ['les hôtels', 1], ['l’histoire', 0], ['les histoires', 1], ['l’heure', 0], ['deux heures', 1]], { listen: true }),
      gap(P.complete, '___ habite dans ___ hôtel calme ___ hiver.', ['J’', 'un', 'en'], { choices: [['J’', 'Je'], ['un', 'une'], ['en', 'à']] }),
      dict('Les hommes habitent à l’hôtel pendant deux heures.', { voice: 'm' }),
      say('En hiver, j’habite près de l’hôpital, à deux heures de l’hôtel.', 'In winter, I live near the hospital, two hours from the hotel.', { tip: b('Smooth linking everywhere: en‿hiver, j’habite, l’hôpital, deux‿heures, l’hôtel.', 'Enchaînez partout sans pause ni souffle : en‿hiver, j’habite, l’hôpital, deux‿heures, l’hôtel.') }),
    ],
    [
      b('Both h types are silent in French—no English [h] puff.', 'Les deux h sont muets en français — aucun souffle [h].'),
      b('h muet acts like a vowel: elide (l’hôtel) and link (les‿hommes).', 'Le h muet agit comme une voyelle : élision et liaison.'),
      b('Common h muet words: homme, heure, hôtel, hôpital, hiver, histoire.', 'Mots courants à h muet : homme, heure, hôtel, hôpital, hiver, histoire.'),
    ],
    [['d’habitude', b('usually', 'en général, ordinairement')], ['l’hiver', b('winter', 'saison froide')], ['l’histoire', b('history / story', 'récit du passé')]],
  ),
  lesson(C, 2, ['aspirated-h-blocks-linking', 'le-h-aspire-bloque-la-liaison'],
    b('H aspiré: keep le/la and block liaison', 'Le h aspiré : garder le/la et bloquer la liaison'),
    b('Keep the vowel gap before h aspiré so les héros never sounds like les zéros.', 'Maintenir la coupure devant h aspiré pour que les héros ne devienne pas les zéros.'),
    [b('Block elision before h aspiré (le héros, la honte)', 'Bloquer l’élision devant h aspiré (le héros, la honte)'), b('Block liaison before h aspiré (les | héros, en | haut)', 'Bloquer la liaison devant h aspiré (les | héros, en | haut)'), b('Distinguish pairs like les‿auteurs vs les | hauteurs', 'Distinguer les paires comme les‿auteurs et les | hauteurs')],
    13,
    [
      card(b('H aspiré = invisible consonant wall', 'H aspiré = mur invisible'), b('An **h aspiré** is **still silent** in modern French (do not breathe [h]!), yet historically it behaves like a consonant wall. So: **1. No elision**: **le héros, le hibou, la honte, le hasard, la haie, le haut**. **2. No liaison**: **les | héros [le eʁo]**, **des | haricots [de aʁiko]**, **en | haut [ɑ̃ o]**, **un | hibou [œ̃ ibu]**.', 'Le **h aspiré** reste **muet** en français moderne (pas de souffle [h] !), mais il agit comme un mur consonantique. Donc : **1. Pas d’élision** : **le héros, le hibou, la honte, le hasard, la haie, le haut**. **2. Pas de liaison** : **les | héros [le eʁo]**, **des | haricots [de aʁiko]**, **en | haut [ɑ̃ o]**, **un | hibou [œ̃ ibu]**.'), {
        ex: [['le héros / les héros', 'no l’, no [z]'], ['le hibou / un hibou', 'no l’, no [n]'], ['en haut / des haricots', 'no [n], no [z]']],
      }),
      trap(b('Les héros vs les zéros, l’héroïne vs le héros', 'Les héros ou les zéros, l’héroïne ou le héros'), b('Link **les‿héros** by mistake and you say **les zéros** (the zeros)! Watch one famous quirk: **le héros** (no elision) is *h aspiré*, while **l’héroïne** (with *l’*) is *h muet*!', 'Si vous faites la liaison dans **les héros**, on entend **les zéros** ! Et notez une curiosité célèbre : **le héros** a un h aspiré, mais **l’héroïne** a un h muet !')),
      hear('Les héros mangent des haricots verts en haut de la colline.', b('Listen. How are « les héros », « des haricots » and « en haut » linked?', 'Écoutez. Comment dit-on « les héros », « des haricots » et « en haut » ?'), [b('Without any liaison before héros, haricots or haut', 'Sans aucune liaison devant héros, haricots et haut'), b('With [z] liaisons in les‿héros and des‿haricots', 'Avec liaison [z] dans les‿héros et des‿haricots'), b('With [n] liaison in en‿haut', 'Avec liaison [n] dans en‿haut'), b('With an English [h] puff on each word', 'Avec un souffle [h] anglais sur chaque mot')], { voice: 'm' }),
      sort(b('H muet (elides/links) or H aspiré (blocks)?', 'H muet (élision/liaison) ou H aspiré (blocage) ?'), [b('h muet (l’, liaison)', 'h muet (l’, liaison)'), b('h aspiré (le/la, no liaison)', 'h aspiré (le/la, sans liaison)')], [['l’hôtel', 0], ['le hibou', 1], ['l’homme', 0], ['le héros', 1], ['l’hôpital', 0], ['le hasard', 1]], { listen: true }),
      mc(P.choose, [b('« les | auteurs » links with [z]; « les | hauteurs » has NO liaison', '« les‿auteurs » fait la liaison [z] ; « les hauteurs » ne fait pas de liaison'), b('Both expressions make a [z] liaison', 'Les deux expressions font la liaison en [z]'), b('Neither expression makes a liaison', 'Aucune des deux ne fait la liaison'), b('« les hauteurs » links with [z], while « les auteurs » does not', '« les hauteurs » fait la liaison [z], pas « les auteurs »')], { fr: 'Quelle différence orale existe entre « les auteurs » et « les hauteurs » ?' }),
      dict('Le héros regarde le hibou en haut de la haie.', { voice: 'f2' }),
      say('Les héros et l’héroïne observent un hibou en haut, par hasard.', 'The heroes and the heroine watch an owl up high, by chance.', { tip: b('No [z] in les héros, no [n] in un hibou or en haut; clean elision in l’héroïne.', 'Pas de [z] dans les héros, pas de [n] dans un hibou ni en haut ; élision nette dans l’héroïne.') }),
    ],
    [
      b('h aspiré blocks elision (le héros) and liaison (les | héros).', 'Le h aspiré bloque élision (le héros) et liaison (les | héros).'),
      b('Never link les héros, des haricots, en haut, un hibou.', 'Ne liez jamais les héros, des haricots, en haut, un hibou.'),
      b('Quirk: le héros (aspiré) vs l’héroïne (muet).', 'Curiosité : le héros (aspiré) contre l’héroïne (muet).'),
    ],
    [['le héros', b('the hero', 'personnage courageux')], ['le hibou', b('the owl', 'oiseau nocturne')], ['le hasard', b('chance, coincidence', 'événement imprévu')]],
  ),
  lesson(C, 3, ['everyday-h-words-in-sentences', 'maitriser-les-mots-en-h-en-phrase'],
    b('Essential h aspiré words and tricky pairs', 'Mots courants à h aspiré et paires pièges'),
    b('Lock in everyday h aspiré words like dehors, hâte, huit, hockey and handicap.', 'Maîtriser les mots fréquents à h aspiré : dehors, hâte, huit, hockey et handicap.'),
    [b('Memorise daily h aspiré words (dehors, huit, hâte, hockey)', 'Retenir les mots courants à h aspiré (dehors, huit, hâte, hockey)'), b('Avoid liaison before huit and onze', 'Éviter la liaison devant huit et onze'), b('Hear and produce mixed h muet / h aspiré sentences', 'Entendre et dire des phrases mêlant h muet et h aspiré')],
    13,
    [
      card(b('Everyday h aspiré checklist', 'Les h aspiré du quotidien'), b('Keep these common words **unlinked**: **le huit** (and **les | huit livres** — never *les‿z‿huit*!), **le hockey**, **le handicap**, **la hâte** (**en toute | hâte**), **la hausse** (**en | hausse**), **la Hollande** (**en | Hollande**), **dehors**, **le hors-d’œuvre**. Remember: in **dehors** and **en haut**, the **e** of *de* is kept or separated cleanly!', 'Gardez ces mots **sans liaison ni élision** : **le huit** (et **les | huit livres**), **le hockey**, **le handicap**, **la hâte**, **la hausse**, **la Hollande**, **dehors**, **le hors-d’œuvre**.'), {
        ex: [['le huit mai, les huit joueurs', 'no elision, no liaison'], ['en hausse, en Hollande, dehors', 'no [n] liaison'], ['les hommes / les héros', 'contrast muet vs aspiré']],
      }),
      hear('Les huit joueurs de hockey partent en Hollande le huit avril.', b('Listen. Where is a liaison forbidden in this sentence?', 'Écoutez. Où la liaison est-elle interdite ?'), [b('After les (huit) and after en (Hollande)', 'Après les (huit) et après en (Hollande)'), b('Only between joueurs and de', 'Uniquement entre joueurs et de'), b('Nowhere: all h words take a liaison here', 'Nulle part : tous les h font la liaison ici'), b('Before avril only', 'Devant avril uniquement')], { voice: 'm2' }),
      hear('Les prix sont en hausse depuis l’hiver dernier.', b('Listen. Compare « en hausse » and « l’hiver »:', 'Écoutez. Comparez « en hausse » et « l’hiver » :'), [b('en hausse has no liaison; l’hiver uses elision', 'en hausse ne fait pas de liaison ; l’hiver fait l’élision'), b('Both use liaison', 'Les deux font la liaison'), b('en hausse links with [n]; l’hiver blocks elision', 'en hausse lie en [n] ; l’hiver bloque l’élision'), b('Neither uses elision or liaison', 'Aucun ne fait d’élision ni de liaison')], { voice: 'f' }),
      pairs(b('Match each h muet phrase with its contrasting h aspiré pair.', 'Associez chaque groupe à h muet avec la paire à h aspiré correspondante.'), [['les hommes', 'les héros'], ['en hiver', 'en haut'], ['les auteurs', 'les hauteurs'], ['l’héroïne', 'le héros']], true),
      gap(P.complete, '___ hôtel ouvre ___ huit heures ; ___ hibou chante ___ haut.', ['L’', 'à', 'le', 'en'], { choices: [['L’', 'Le'], ['à', 'en'], ['le', 'l’'], ['en', 'à']] }),
      dict('Les huit enfants jouent dehors en toute hâte.', { voice: 'f2' }),
      say('Le huit janvier, les huit amis partent en Hollande voir un match de hockey.', 'On January 8th, the eight friends leave for Holland to watch a hockey match.', { tip: b('Separate les | huit and en | Hollande cleanly without [z] or [n].', 'Coupez nettement les | huit et en | Hollande sans [z] ni [n].') }),
    ],
    [
      b('huit blocks both elision (le huit) and liaison (les | huit).', 'huit bloque l’élision (le huit) et la liaison (les | huit).'),
      b('High-frequency h aspiré: haut, hausse, hâte, hockey, Hollande, hors.', 'Mots courants à h aspiré : haut, hausse, hâte, hockey, Hollande, hors.'),
      b('Contrast pairs lock it in: en‿hiver vs en | haut.', 'Les paires fixent le réflexe : en‿hiver contre en | haut.'),
    ],
    [['la hausse', b('the rise, increase', 'augmentation')], ['en toute hâte', b('in all haste', 'très vite, précipitamment')], ['dehors', b('outside', 'à l’extérieur')]],
  ),
];
