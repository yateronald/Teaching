import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Why do we write des yeux bleus yet des chaussures marron, des fleurs roses yet des rubans bleu clair, and des personnes sourdes-muettes yet des enfants nouveau-nés? French colour and compound adjective agreement follows strict logic: simple colours agree unless they come from nouns (with six famous exceptions like rose and mauve), compound colours never agree at all, and compound adjectives depend on whether their first part is an adjective or an adverb. This B2 course makes every case effortless.',
    'Pourquoi écrit-on des yeux bleus mais des chaussures marron, des fleurs roses mais des rubans bleu clair, et des personnes sourdes-muettes mais des enfants nouveau-nés ? L’accord des couleurs et des adjectifs composés obéit à une logique claire : les couleurs simples s’accordent sauf les noms utilisés comme adjectifs (hors six exceptions comme rose et mauve), les couleurs composées sont toujours invariables, et les adjectifs composés varient selon la nature de leurs composants. Ce cours B2 éclaire chaque règle.',
  ),
  outcomes: [
    b('Separate variable simple colours from invariable noun-colours (orange, marron, crème)', 'Distinguer couleurs simples variables et noms de couleur invariables (orange, marron, crème)'),
    b('Remember the six noun-derived colours that DO agree (rose, mauve, pourpre, écarlate, fauve, incarnat)', 'Retenir les six exceptions qui s’accordent (rose, mauve, pourpre, écarlate, fauve, incarnat)'),
    b('Leave compound colour adjectives invariable (des yeux bleu clair, des robes vert foncé)', 'Laisser invariables les adjectifs de couleur composés (des yeux bleu clair, vert foncé)'),
    b('Agree two-part compound adjectives (sourdes-muettes vs nouveau-nés / fraîchement cueillies)', 'Accorder les adjectifs composés (sourdes-muettes contre nouveau-nés / fraîchement cueillies)'),
  ],
};

const C = 'sp-compound-adjectives';
export default [
  lesson(C, 1, ['simple-colours-and-noun-colours', 'couleurs-simples-et-noms-de-couleur'],
    b('Simple colours & noun-colours (bleus vs marron)', 'Couleurs simples et noms de couleur (bleus ou marron)'),
    b('Know which single-word colours agree and which stay invariable.', 'Savoir quelles couleurs simples s’accordent et lesquelles restent invariables.'),
    [b('Agree standard simple colour adjectives', 'Accorder les adjectifs de couleur simples'), b('Keep noun-derived colours invariable (orange, marron, cerise, crème, kaki)', 'Laisser invariables les noms employés comme couleurs'), b('Agree the six assimilated exceptions (rose, mauve, pourpre, écarlate, fauve, incarnat)', 'Accorder les six exceptions assimilées (rose, mauve, pourpre, écarlate, fauve, incarnat)')],
    13,
    [
      card(b('Adjectives agree; nouns stay invariable', 'Adjectifs variables ; noms invariables'), b('Classic colour adjectives agree in gender and number: **des yeux bleus, des robes vertes, des gants blancs, des jupes noires**. When a **noun** (fruit, flower, stone, food) is used as a colour, it stays **invariable**: **des robes orange, des bottes marron, des yeux noisette, des rideaux crème, des chemises turquoise, des pulls kaki, des gants olive**.', 'Les adjectifs de couleur ordinaires s’accordent : **des yeux bleus, des robes vertes, des gants blancs**. Lorsqu’un **nom** (fruit, fleur, pierre, matière) sert de couleur, il reste **invariable** : **des robes orange, des bottes marron, des yeux noisette, des rideaux crème, des chemises turquoise, des pulls kaki, des gants olive**.'), {
        ex: [['Elle porte des bottes marron et une écharpe orange.', 'She is wearing brown boots and an orange scarf.'], ['Il a acheté des assiettes blanches et des tasses turquoise.', 'He bought white plates and turquoise cups.'], ['J’aime les pivoines roses et les iris mauves.', 'I love pink peonies and mauve irises.']],
      }),
      trap(b('Six noun-colours that DO agree!', 'Six exceptions qui s’accordent !'), b('Six former nouns became true French adjectives and ALWAYS take **-s** (and **-e** where needed): **rose, mauve, pourpre, écarlate, fauve, incarnat**! Write **des fleurs roses, des robes mauves, des joues écarlates, des manteaux pourpres** (and **châtain**: *des cheveux châtains*).', 'Six anciens noms sont devenus de vrais adjectifs et prennent toujours l’accord : **rose, mauve, pourpre, écarlate, fauve, incarnat** ! Écrivez **des fleurs roses, des robes mauves, des joues écarlates** (et **des cheveux châtains**).')),
      sort(b('Agrees in the plural or stays invariable?', 'S’accorde au pluriel ou reste invariable ?'), [b('agrees (-s / -es)', 's’accorde (-s / -es)'), b('invariable', 'invariable')], [['des sacs (marron)', 1], ['des fleurs (rose)', 0], ['des jupes (orange)', 1], ['des lèvres (pourpre)', 0], ['des murs (crème)', 1], ['des chemises (mauve)', 0]]),
      mc(P.spelling, ['Elle préfère les bottes marron, les vestes kaki et les écharpes roses.', 'Elle préfère les bottes marrons, les vestes kakis et les écharpes rose.', 'Elle préfère les bottes marron, les vestes kakis et les écharpes roses.', 'Elle préfère les bottes marrons, les vestes kaki et les écharpes roses.']),
      mc(P.spelling, ['Ses joues écarlates contrastent avec ses yeux noisette.', 'Ses joues écarlate contrastent avec ses yeux noisettes.', 'Ses joues écarlate contrastent avec ses yeux noisette.', 'Ses joues écarlates contrastent avec ses yeux noisettes.']),
      gap(P.complete, 'Dans le salon, il y a des fauteuils ___, des coussins ___ et des tulipes ___ et ___.', ['crème', 'verts', 'mauves', 'orange'], { choices: [['crème', 'crèmes'], ['verts', 'vert'], ['mauves', 'mauve'], ['orange', 'oranges']], strict: true }),
      dict('Elle porte des chaussures marron, une jupe verte et des boucles roses.', { voice: 'f', strict: true }),
    ],
    [
      b('Simple colour adjectives agree: bleus, vertes, noires, blanches.', 'Les adjectifs de couleur simples s’accordent : bleus, vertes, noires, blanches.'),
      b('Nouns used as colours stay invariable: orange, marron, noisette, crème, turquoise, kaki.', 'Les noms employés comme couleurs restent invariables : orange, marron, noisette, crème, turquoise, kaki.'),
      b('Six exceptions agree like full adjectives: rose, mauve, pourpre, écarlate, fauve, incarnat.', 'Six exceptions s’accordent : rose, mauve, pourpre, écarlate, fauve, incarnat.'),
    ],
    [['écarlate', b('scarlet', 'd’un rouge très vif')], ['pourpre', b('crimson, deep purplish-red', 'rouge foncé tirant sur le violet')], ['noisette (yeux)', b('hazel', 'brun clair doré')]],
  ),
  lesson(C, 2, ['compound-colour-adjectives', 'adjectifs-de-couleur-composes'],
    b('Compound colours: bleu clair, gris-bleu', 'Couleurs composées : bleu clair, gris-bleu'),
    b('Keep two-word colours invariable and distinguish single mixed shades from two separate colours.', 'Laisser les couleurs composées invariables et distinguer nuance unique et couleurs séparées.'),
    [b('Keep all compound colours invariable (bleu clair, vert foncé)', 'Laisser invariables toutes les couleurs composées (bleu clair, vert foncé)'), b('Use hyphens between two colours (gris-bleu, bleu-vert)', 'Mettre le trait d’union entre deux couleurs (gris-bleu, bleu-vert)'), b('Contrast des drapeaux bleu et blanc vs des fleurs blanches et rouges', 'Opposer des drapeaux bleu et blanc et des fleurs blanches et rouges')],
    13,
    [
      card(b('Compound colours NEVER agree', 'Les couleurs composées sont TOUJOURS invariables'), b('Whenever a colour needs **two words** — whether adjective + qualifier (**bleu clair, vert foncé, jaune pâle, rouge vif, bleu marine**) or two colours (**gris-bleu, bleu-vert, jaune-orange** — joined by a hyphen!) — **neither word takes -e or -s**: **des yeux bleu clair, des vestes bleu marine, des tissus gris-bleu, des chemises vert pomme**.', 'Dès qu’une couleur comporte **deux mots** — adjectif + précision (**bleu clair, vert foncé, jaune pâle, rouge vif, bleu marine**) ou deux couleurs reliées par un trait d’union (**gris-bleu, bleu-vert**) — **les deux mots restent invariables** : **des yeux bleu clair, des vestes bleu marine, des tissus gris-bleu, des chemises vert pomme**.'), {
        ex: [['Il a les yeux bleu clair et des chemises gris-bleu.', 'He has light-blue eyes and blue-grey shirts.'], ['Ces uniformes bleu marine coûtent cher.', 'These navy-blue uniforms are expensive.'], ['Les murs sont peints en tons vert pastel.', 'The walls are painted in pastel-green tones.']],
      }),
      tip(b('Two colours joined by « et »: mixed vs separate', 'Deux couleurs avec « et » : mélangées ou distinctes'), b('If **each object combines both colours** (*two-tone flags*), stay **invariable**: **des drapeaux bleu, blanc, rouge** or **des pulls bleu et blanc** (each jumper is blue-and-white). If **some objects are one colour and others another** (*some blue, some white*), **both agree**: **des fleurs blanches et rouges** (white flowers and red flowers).', 'Si **chaque objet réunit les deux couleurs**, elles restent **invariables** : **des drapeaux bleu, blanc, rouge** ou **des maillots bleu et blanc**. Si **certains objets sont d’une couleur et d’autres d’une autre**, les deux s’accordent : **des roses blanches et rouges**.')),
      pairs(P.match, [['des yeux bleu clair', b('invariable compound shade', 'couleur composée invariable')], ['des vestes marron', b('invariable noun-colour', 'nom de couleur invariable')], ['des tulipes mauves', b('agrees (exception)', 'exception qui s’accorde')], ['des chaussettes noires', b('agrees (simple colour)', 'couleur simple variable')]]),
      mc(P.spelling, ['Il porte des pulls bleu marine et des pantalons gris-bleu.', 'Il porte des pulls bleus marines et des pantalons gris-bleus.', 'Il porte des pulls bleu marines et des pantalons grises-bleues.', 'Il porte des pulls bleus marine et des pantalons gris-bleu.']),
      mc(P.spelling, ['Ses yeux vert foncé éclairent son visage sous des cheveux châtain clair.', 'Ses yeux verts foncés éclairent son visage sous des cheveux châtains clairs.', 'Ses yeux vert foncés éclairent son visage sous des cheveux châtain clairs.', 'Ses yeux verts foncé éclairent son visage sous des cheveux châtains clair.']),
      gap(P.complete, 'Les élèves portent des blouses ___ et des rubans ___ avec des chaussures ___.', ['bleu ciel', 'jaune vif', 'noires'], { choices: [['bleu ciel', 'bleues ciel', 'bleu ciels'], ['jaune vif', 'jaunes vifs', 'jaune vifs'], ['noires', 'noir', 'noirs']], strict: true }),
      dict('Des drapeaux bleu et blanc flottent au-dessus des toits gris-bleu.', { voice: 'm', strict: true }),
    ],
    [
      b('Compound colour = always invariable (bleu clair, vert foncé, gris-bleu, bleu marine).', 'Couleur composée = toujours invariable (bleu clair, vert foncé, gris-bleu, bleu marine).'),
      b('Two colours joined directly get a hyphen: gris-bleu, bleu-vert.', 'Deux couleurs unies prennent un trait d’union : gris-bleu, bleu-vert.'),
      b('Two-tone items (bleu et blanc) stay invariable; separate-colour groups (roses blanches et rouges) agree.', 'Objets bicolores (bleu et blanc) → invariables ; groupes de couleurs séparées (roses blanches et rouges) → accord.'),
    ],
    [['bleu marine', b('navy blue', 'bleu très foncé')], ['vert pomme', b('apple green', 'vert vif et clair')], ['le gris-bleu', b('blue-grey', 'gris tirant sur le bleu')]],
  ),
  lesson(C, 3, ['compound-adjectives-agreement', 'accord-des-adjectifs-composes'],
    b('Compound adjectives: sourdes-muettes vs nouveau-nés', 'Adjectifs composés : sourdes-muettes ou nouveau-nés'),
    b('Agree adjective + adjective compounds in both parts, and adverb + adjective compounds only in the second.', 'Accorder les deux termes de adjectif + adjectif, et seulement le second après adverbe.'),
    [b('Agree both parts in adjective + adjective (sourdes-muettes, aigres-douces)', 'Accorder les deux éléments de adjectif + adjectif (sourdes-muettes, aigres-douces)'), b('Keep adverb/invariant first parts unchanged (nouveau-nés, fraîchement cueillies)', 'Laisser invariable le premier élément adverbial (nouveau-nés, fraîchement cueillies)'), b('Handle exceptions: nouveaux venus, premiers-nés, avant-coureurs', 'Gérer les exceptions : nouveaux venus, premiers-nés, avant-coureurs')],
    13,
    [
      card(b('Check the nature of the first word', 'Observer la nature du premier mot'), b('1. **Adjective + Adjective**: **both agree**: **des personnes sourdes-muettes, des sauces aigres-douces, des nuits ivres-mortes**. 2. **Adverb / invariable prefix + Adjective or Participle**: **only the second agrees**: **des fleurs fraîchement cueillies, des régions sous-développées, des idées bienvenues, des enfants nouveau-nés** (here *nouveau* = *nouvellement*). Exceptions where *both* agree: **des nouveaux-venus / nouveaux venus, des premiers-nés, des derniers-nés**!', '1. **Adjectif + adjectif** : **les deux s’accordent** : **des personnes sourdes-muettes, des sauces aigres-douces**. 2. **Adverbe / mot invariable + adjectif ou participe** : **seul le second s’accorde** : **des fleurs fraîchement cueillies, des régions sous-développées, des enfants nouveau-nés** (*nouveau* = *nouvellement*). Exceptions à double accord : **des nouveaux venus, des premiers-nés, des derniers-nés** !'), {
        ex: [['Les infirmières veillent sur les bébés nouveau-nés.', 'The nurses watch over the newborn babies.'], ['Ce chef prépare de délicieuses sauces aigres-douces.', 'This chef prepares delicious sweet-and-sour sauces.'], ['Elle nous a offert des fraises fraîchement cueillies.', 'She gave us freshly picked strawberries.']],
      }),
      trap(b('Demi-morts, avant-coureurs, nouveau-nés', 'Demi-morts, avant-coureurs, nouveau-nés'), b('Watch **demi-** and **semi-**: **des survivants à demi morts / demi-morts** (first stays invariable!). Watch **avant-coureur**: *avant* is a preposition, so only *coureur* agrees → **des signes avant-coureurs** (and feminine *avant-courières*). Finally, **court-vêtu** (*short-clad*) keeps *court* invariable: **court-vêtues**.', 'Avec **demi- / semi-**, le premier élément reste invariable : **des voyageurs demi-morts**. Avec la préposition **avant-**, seul le second varie : **des signes avant-coureurs**. De même pour **court-vêtues** (*court* = adverbe).')),
      sort(b('Both parts agree or only the second?', 'Les deux s’accordent ou seulement le second ?'), [b('both parts agree', 'les deux s’accordent'), b('only the 2nd agrees', 'seul le 2e s’accorde')], [['des paroles (aigre-doux)', 0], ['des bébés (nouveau-né)', 1], ['des filles (sourd-muet)', 0], ['des tomates (fraîchement cueilli)', 1], ['des élèves (premier-né)', 0], ['des signes (avant-coureur)', 1]]),
      mc(P.spelling, ['Les nouveaux venus ont admiré les fleurs fraîchement cueillies.', 'Les nouveau venus ont admiré les fleurs fraîchements cueillies.', 'Les nouveaux venu ont admiré les fleurs fraîchement cueillis.', 'Les nouveau venus ont admiré les fleurs fraîchement cueillies.']),
      mc(P.spelling, ['Ces remarques aigres-douces annoncent des signes avant-coureurs.', 'Ces remarques aigre-douces annoncent des signes avants-coureurs.', 'Ces remarques aigres-douces annoncent des signes avants-coureurs.', 'Ces remarques aigre-douce annoncent des signes avant-coureur.']),
      gap(P.complete, 'Les jumeaux ___ (premier-né) et les petites ___ (nouveau-né) dorment dans des draps ___.', ['premiers-nés', 'nouveau-nées', 'bleu pâle'], { choices: [['premiers-nés', 'premier-nés', 'premiers-né'], ['nouveau-nées', 'nouvelles-nées', 'nouveau-né'], ['bleu pâle', 'bleus pâles', 'bleus pâle']], strict: true }),
      dict('Elles ont servi des sauces aigres-douces et des cerises fraîchement cueillies.', { voice: 'm', strict: true }),
      say('Des signes avant-coureurs annoncent souvent des réactions aigres-douces mais sincères.', 'Warning signs often herald bittersweet yet sincere reactions.'),
    ],
    [
      b('Adjective + adjective: both agree (sourdes-muettes, aigres-douces).', 'Adjectif + adjectif : les deux s’accordent (sourdes-muettes, aigres-douces).'),
      b('Adverb / preposition + adjective: only 2nd agrees (nouveau-nés, avant-coureurs, fraîchement cueillies).', 'Adverbe / préposition + adjectif : seul le 2e s’accorde (nouveau-nés, avant-coureurs, fraîchement cueillies).'),
      b('Exceptions with double agreement: premiers-nés, derniers-nés, nouveaux venus.', 'Exceptions à double accord : premiers-nés, derniers-nés, nouveaux venus.'),
    ],
    [['aigre-doux', b('bittersweet, sweet-and-sour', 'entre amer et sucré')], ['avant-coureur', b('warning, heralding', 'qui annonce ce qui va venir')], ['nouveau-né', b('newborn', 'qui vient de naître')]],
  ),
];
