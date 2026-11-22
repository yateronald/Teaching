import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French cultural criticism rarely uses blunt praise or harsh insults. Reviewers express admiration through understated formulas (« non sans mérite », « tout en retenue ») and slip sharp reservations into polite concessions (« on regrettera toutefois que », « demeure en deçà de »). This B2 course trains you on cinema, architecture, exhibition and literary criticism so you can read aesthetic judgements and subtle reservations effortlessly.',
    'La critique culturelle francophone évite rarement la nuance : elle loue souvent avec sobriété (« non sans mérite », « tout en retenue ») et glisse ses réserves dans des concessions polies (« on regrettera toutefois que », « demeure en deçà de »). Ce cours de niveau B2 vous entraîne sur des critiques de cinéma, d’architecture, d’exposition et de littérature pour décoder jugements esthétiques et réserves implicites.',
  ),
  outcomes: [
    b('Interpret aesthetic judgements in cinema and theatre reviews', 'Interpréter les jugements esthétiques dans une critique de cinéma'),
    b('Decode implicit praise and polite reservations in exhibition reviews', 'Décoder éloges implicites et réserves polies sur une exposition'),
    b('Distinguish balanced admiration from damning understatement', 'Distinguer admiration nuancée et critique sévère sous forme polie'),
    b('Use precise critical vocabulary for form, rhythm and style', 'Maîtriser le vocabulaire critique de la forme, du rythme et du style'),
  ],
};

const FILM_REVIEW: Doc = { look: 'article', title: b('Cinema review', 'Critique de cinéma'), text: '« Les Jours d’hiver » : une réussite fragile\n\nPar son refus des effets faciles, la réalisatrice signe un portrait d’une rare justesse. Portée par un jeu tout en retenue et des plans-séquences lumineux, la première heure captive sans jamais forcer l’émotion. On regrettera toutefois une dernière partie quelque peu précipitée, où les conflits familiaux se résolvent de façon trop convenue. Une œuvre imparfaite, mais habitée.' };
const ARCH_REVIEW: Doc = { look: 'article', title: b('Architecture & Exhibition', 'Architecture et exposition'), text: 'Le nouveau pavillon du fleuve : entre verre et mémoire\n\nConçu dans un souci d’épure, l’édifice dialogue avec bonheur avec les anciens entrepôts de brique. L’architecte évite l’écueil du geste ostentatoire pour privilégier la lumière naturelle. Seul bémol : le hall d’accueil, vaste mais sonore, nuit à l’écoute des installations sonores du rez-de-chaussée. Quant à la rétrospective inaugurale, elle séduit par la rigueur de son parcours.' };
const BOOK_REVIEW: Doc = { look: 'article', title: b('Literary essay review', 'Critique littéraire'), text: 'Une enquête brillante, mais inégale\n\nNon sans mérite, cet essai sur la mémoire industrielle impressionne par l’ampleur de ses archives et par une langue ciselée. Pour autant, la démonstration demeure parfois en deçà de ses promesses : à force de multiplier les digressions, l’auteur peine à convaincre sur le terrain économique. Un livre stimulant qui laisse néanmoins le lecteur sur sa faim.' };

const C = 'r-cultural-criticism';
export default [
  lesson(C, 1, ['cinema-and-narrative-craft', 'critique-de-cinema'],
    b('Cinema reviews: craft and nuance', 'Critique de cinéma : mise en scène et nuance'),
    b('Separate what a film critic praises from what disappoints.', 'Distinguer ce qu’un critique de cinéma loue de ce qui le déçoit.'),
    [b('Understand film craft terms (plan-séquence, retenue)', 'Comprendre le vocabulaire cinématographique'), b('Decode polite reservations (quelque peu, convenu)', 'Décoder les réserves polies (quelque peu, convenu)'), b('Judge a critic’s overall verdict', 'Évaluer le verdict global d’une critique')],
    13,
    [
      card(b('Praise vs reservation in reviews', 'Éloge et réserve dans la critique'), b('Positive: **une rare justesse** (rare accuracy), **tout en retenue** (restrained, subtle), **habité** (deeply felt). Reservation: **on regrettera toutefois** (one regrets, however), **quelque peu** (somewhat), **convenu** (predictable, cliché), **forcer l’émotion** (overdo emotion).', 'Positif : **une rare justesse**, **tout en retenue**, **habité**. Réserve : **on regrettera toutefois**, **quelque peu** (un peu), **convenu** (prévisible), **forcer l’émotion**.')),
      doc(FILM_REVIEW, b('What does the critic praise in the first hour of the film?', 'Que loue la critique dans la première heure du film ?'), [b('Subtle acting, luminous shots and emotional restraint', 'Le jeu sobre, les plans lumineux et l’émotion maîtrisée'), b('Fast action scenes and loud music', 'Les scènes d’action rapides et la musique forte'), b('A surprising and original ending', 'Une fin originale et inattendue'), b('Special effects', 'Les effets spéciaux')]),
      doc(FILM_REVIEW, b('What is the critic’s reservation about the ending?', 'Quelle réserve la critique formule-t-elle sur la fin ?'), [b('It feels rushed and too predictable.', 'Elle semble précipitée et trop prévisible.'), b('It is too long and silent.', 'Elle est trop longue et silencieuse.'), b('The actors forgot their lines.', 'Les acteurs manquent de naturel.'), b('The lighting is too dark.', 'La lumière est trop sombre.')]),
      doc(FILM_REVIEW, b('How would you sum up the verdict « Une œuvre imparfaite, mais habitée »?', 'Comment résumer le verdict « Une œuvre imparfaite, mais habitée » ?'), [b('Flawed at the end, yet genuinely moving and worthwhile', 'Imparfaite à la fin, mais sincère et marquante'), b('A complete failure not worth seeing', 'Un échec complet sans intérêt'), b('Technically flawless from start to finish', 'Techniquement parfaite du début à la fin'), b('A light comedy about housing', 'Une comédie légère sur le logement')]),
      pairs(P.match, [['tout en retenue', b('restrained, understated', 'sobre et mesuré')], ['convenu', b('predictable, formulaic', 'attendu, sans surprise')], ['quelque peu', b('somewhat, rather', 'un peu')], ['un plan-séquence', b('a long continuous shot', 'plan filmé sans coupure')]]),
      gap(P.complete, 'Le jeu des acteurs est tout en ___, mais le dénouement reste malheureusement trop ___.', ['retenue', 'convenu']),
    ],
    [
      b('Tout en retenue = subtle restraint; convenu = predictable.', 'Tout en retenue = sobriété ; convenu = prévisible.'),
      b('On regrettera toutefois… introduces the main criticism.', 'On regrettera toutefois… introduit la critique principale.'),
      b('Look at the closing sentence: it usually states the final balance.', 'Regardez la phrase finale : elle donne souvent le verdict d’ensemble.'),
    ],
    [['la justesse', b('accuracy, truth of tone', 'exactitude sensible')], ['précipité', b('rushed, hasty', 'trop rapide')], ['habité', b('deeply alive, resonant', 'plein de présence')]],
  ),
  lesson(C, 2, ['architecture-and-exhibitions', 'architecture-et-expositions'],
    b('Architecture and museum exhibitions', 'Architecture et expositions'),
    b('Follow how critics evaluate space, materials, acoustics and curatorial design.', 'Suivre comment un critique évalue espace, matériaux, acoustique et parcours.'),
    [b('Understand architectural terms (épure, ostentatoire)', 'Comprendre épure, ostentatoire, dialogue'), b('Identify a single flaw with « seul bémol »', 'Repérer une réserve précise avec « seul bémol »'), b('Evaluate praise of curatorial rigour', 'Évaluer l’éloge d’une exposition')],
    13,
    [
      tip(b('« Seul bémol » and avoiding pitfalls', '« Seul bémol » et écueils évités'), b('Critics often praise a work by saying what bad trap it **avoided**: **éviter l’écueil de** (avoid the pitfall of), **privilégier l’épure** (favour clean simplicity) rather than **ostentatoire** (showy). **Seul bémol** (from music, flat note) = the only drawback.', 'Les critiques louent souvent une œuvre par le piège qu’elle **évite** : **éviter l’écueil de**, **privilégier l’épure** contre le style **ostentatoire**. **Seul bémol** = la seule fausse note, le seul défaut.')),
      doc(ARCH_REVIEW, b('How does the new pavilion relate to the old brick warehouses?', 'Comment le nouveau pavillon s’accorde-t-il avec les anciens entrepôts ?'), [b('It blends harmoniously with them through clean simplicity.', 'Il dialogue harmonieusement avec eux par son épure.'), b('It hides them behind neon lights.', 'Il les cache derrière un décor voyant.'), b('It copies brick walls identically.', 'Il imite la brique à l’identique.'), b('It demolished the warehouses.', 'Il a remplacé les entrepôts détruits.')]),
      doc(ARCH_REVIEW, b('What is the « seul bémol »?', 'Quel est le « seul bémol » ?'), [b('Echoes in the large lobby disturb the sound artworks.', 'La résonance du hall gêne l’écoute des œuvres sonores.'), b('The building lacks natural light.', 'Le bâtiment manque de lumière naturelle.'), b('The architect chose a showy style.', 'L’architecte a choisi un style ostentatoire.'), b('The exhibition layout is messy.', 'Le parcours de l’exposition est confus.')]),
      doc(ARCH_REVIEW, b('What does the critic think of the inaugural exhibition?', 'Que pense le critique de la rétrospective inaugurale ?'), [b('It convinces through its rigorous layout.', 'Elle séduit par la rigueur de son parcours.'), b('It is overly crowded.', 'Elle est trop chargée.'), b('It ignores local history.', 'Elle néglige l’histoire locale.'), b('It is poorly lit.', 'Elle est mal éclairée.')]),
      sort(b('Praise or criticism?', 'Éloge ou réserve ?'), [b('praise', 'éloge'), b('criticism / flaw', 'réserve / défaut')], [['dialoguer avec bonheur', 0], ['nuit à l’écoute', 1], ['souci d’épure', 0], ['geste ostentatoire', 1], ['rigueur du parcours', 0]]),
      dict('Conçu dans un souci d’épure, l’édifice privilégie la lumière naturelle.', { voice: 'f' }),
    ],
    [
      b('Éviter l’écueil de = avoid the pitfall of.', 'Éviter l’écueil de = ne pas tomber dans le piège de.'),
      b('Seul bémol = the one drawback in an otherwise positive review.', 'Seul bémol = l’unique défaut dans une critique favorable.'),
      b('Épure = clean simplicity; ostentatoire = showy.', 'Épure = sobriété pure ; ostentatoire = trop voyant.'),
    ],
    [['un bémol', b('a drawback, a minor reservation', 'réserve ou fausse note')], ['l’épure', b('clean, stripped-back design', 'simplicité rigoureuse')], ['un écueil', b('a pitfall, a trap', 'obstacle ou erreur à éviter')]],
  ),
  lesson(C, 3, ['literary-essays-and-subtle-reservations', 'essais-et-reserves-subtiles'],
    b('Literary criticism and implicit reservations', 'Critique littéraire et réserves implicites'),
    b('Decode polite concessions and see when a critic is genuinely disappointed.', 'Décoder les concessions polies et voir quand un critique reste déçu.'),
    [b('Read « non sans mérite » and « en deçà de »', 'Comprendre « non sans mérite » et « en deçà de »'), b('Spot contrast markers (pour autant, néanmoins)', 'Repérer les marqueurs d’opposition'), b('Interpret idiomatic verdicts like « sur sa faim »', 'Interpréter des formules comme « laisser sur sa faim »')],
    13,
    [
      card(b('Subtle critical formulas', 'Formules subtiles de critique'), b('**Non sans mérite** = not without merit (a cautious compliment) · **Une langue ciselée** = finely crafted prose · **En deçà de ses promesses** = falls short of its promises · **Peiner à convaincre** = struggle to persuade · **Laisser le lecteur sur sa faim** = leave the reader wanting more / unsatisfied.', '**Non sans mérite** · **Une langue ciselée** · **En deçà de ses promesses** (inférieur à ce qui était promis) · **Peiner à convaincre** · **Laisser le lecteur sur sa faim** (décevoir légèrement).')),
      doc(BOOK_REVIEW, b('Which two qualities of the essay does the critic acknowledge?', 'Quelles deux qualités de l’essai le critique reconnaît-il ?'), [b('Extensive archives and finely crafted writing', 'L’ampleur des archives et l’écriture ciselée'), b('Short chapters and clear economics', 'Des chapitres courts et une économie claire'), b('Original fiction and humour', 'Une fiction originale et de l’humour'), b('Practical advice for investors', 'Des conseils pratiques aux investisseurs')]),
      doc(BOOK_REVIEW, b('Why does the economic argument fail to convince?', 'Pourquoi la démonstration économique peine-t-elle à convaincre ?'), [b('Too many digressions weaken the core thesis.', 'L’auteur multiplie trop les digressions.'), b('The archives are false.', 'Les archives sont fausses.'), b('The style is unreadable.', 'Le style est illisible.'), b('The book is too short.', 'Le livre est trop court.')]),
      doc(BOOK_REVIEW, b('What does « laisse le lecteur sur sa faim » mean?', 'Que signifie « laisse le lecteur sur sa faim » ?'), [b('It feels incomplete and leaves the reader partly unsatisfied.', 'Il semble inachevé et déçoit en partie l’attente.'), b('It is about food history.', 'Il traite de l’histoire de la cuisine.'), b('It makes the reader want a second volume immediately.', 'Il exige une suite immédiate par enthousiasme.'), b('It is impossible to understand.', 'Il est totalement incompréhensible.')]),
      pairs(P.match, [['en deçà de', b('below, falling short of', 'inférieur à')], ['peiner à convaincre', b('to struggle to persuade', 'convaincre difficilement')], ['une langue ciselée', b('finely crafted prose', 'écriture très soignée')], ['pour autant', b('even so, nevertheless', 'cependant')]]),
      mc(P.meaning, [b('The film falls well below what was expected.', 'Le film est bien inférieur aux attentes.'), b('The film exceeds every expectation.', 'Le film dépasse toutes les attentes.'), b('The film is shorter than promised.', 'Le film est plus court que promis.'), b('The film starts early.', 'Le film commence tôt.')], { fr: 'Ce long métrage demeure nettement en deçà des attentes.' }),
      gap(P.complete, 'Son style est ___ , mais l’argumentation peine à ___ sur les points clés.', ['ciselé', 'convaincre']),
    ],
    [
      b('En deçà de = below / short of; au-delà de = beyond.', 'En deçà de = en dessous de ; au-delà de = au-dessus de.'),
      b('Peiner à + infinitive = struggle to… (polite criticism).', 'Peiner à + infinitif = avoir du mal à… (critique polie).'),
      b('Laisser sur sa faim = leave unsatisfied despite promising parts.', 'Laisser sur sa faim = décevoir partiellement malgré de beaux passages.'),
    ],
    [['ciselé', b('chiselled, finely crafted', 'travaillé avec précision')], ['une digression', b('a digression', 'écart hors du sujet principal')], ['inégal', b('uneven', 'de qualité variable')]],
  ),
];
