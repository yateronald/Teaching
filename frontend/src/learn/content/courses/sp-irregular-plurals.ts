import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Most French nouns and adjectives form their plural simply by adding -s, yet four common endings follow special rules and famous schoolbook exceptions: -al becomes -aux (cheval → chevaux, except bals and festivals); -ou takes -s except for seven words in -oux (bijoux, cailloux, choux, genoux, hiboux, joujoux, poux); -ail usually takes -s except travaux, coraux, vitraux; and -au / -eau / -eu take -x except pneus and bleus. This A2 course locks in every pattern.',
    'La plupart des noms et adjectifs français prennent un simple -s au pluriel, mais quatre terminaisons obéissent à des règles et exceptions célèbres : -al devient -aux (cheval → chevaux, sauf bals, festivals…) ; -ou prend -s sauf sept mots en -oux (bijoux, cailloux, choux, genoux, hiboux, joujoux, poux) ; -ail prend -s sauf travaux, coraux, vitraux ; et -au / -eau / -eu prennent -x sauf pneus et bleus. Ce cours A2 les fixe durablement.',
  ),
  outcomes: [
    b('Form plurals of -al nouns and adjectives (-aux vs -als)', 'Former le pluriel en -al (-aux contre -als)'),
    b('Master the seven -oux exceptions and -ail → -aux words', 'Maîtriser les sept exceptions en -oux et les mots en -ail → -aux'),
    b('Spell -au, -eau, -eu, -œu plurals (-x) and their exceptions (pneus, bleus)', 'Écrire les pluriels en -au, -eau, -eu, -œu (-x) et leurs exceptions (pneus, bleus)'),
    b('Keep nouns ending in -s, -x or -z invariable in the plural', 'Laisser invariables les noms terminés par -s, -x ou -z'),
  ],
};

const C = 'sp-irregular-plurals';
export default [
  lesson(C, 1, ['plurals-in-al', 'pluriel-en-al'],
    b('Plurals in -al: chevaux vs festivals', 'Les pluriels en -al : chevaux ou festivals'),
    b('Turn -al into -aux in nouns and adjectives, and memorise the -als exceptions.', 'Transformer -al en -aux et retenir les exceptions en -als.'),
    [b('Form -aux plurals for nouns and adjectives in -al', 'Former le pluriel en -aux pour noms et adjectifs'), b('Remember the -als exceptions (bal, festival, carnaval, récital, régal)', 'Retenir les exceptions en -als (bal, festival, carnaval, récital, régal)'), b('Agree -al adjectives in the masculine plural', 'Accorder les adjectifs en -al au masculin pluriel')],
    13,
    [
      card(b('Most -al words → -aux', 'La majorité des mots en -al → -aux'), b('Nouns and adjectives ending in **-al** change to **-aux** in the masculine plural: **un cheval → des chevaux**, **un journal → des journaux**, **un hôpital → des hôpitaux**, **un animal → des animaux**, **un canal → des canaux**, **international → internationaux**, **original → originaux**. (Feminine plural is regular: *des idées originales*.)', 'Les noms et adjectifs en **-al** deviennent **-aux** au masculin pluriel : **un cheval → des chevaux**, **un journal → des journaux**, **un hôpital → des hôpitaux**, **un animal → des animaux**, **international → internationaux**, **original → originaux**. (Au féminin pluriel : *des idées originales*.)'), {
        ex: [['Les journaux nationaux parlent de ces festivals.', 'National newspapers talk about these festivals.'], ['Ces animaux vivent près des canaux.', 'These animals live near the canals.'], ['Ils ont trouvé des cadeaux originaux.', 'They found original gifts.']],
      }),
      trap(b('The six -als exceptions', 'Les exceptions en -als'), b('Six common nouns simply add **-s**: **des bals** (*balls/dances*), **des carnavals**, **des festivals**, **des récitals**, **des régals** (*treats*), **des chacals** (*jackals*). A few adjectives do too, like **banals** (*ordinary*) and **fatals**.', 'Six noms fréquents prennent simplement **-s** : **des bals**, **des carnavals**, **des festivals**, **des récitals**, **des régals**, **des chacals**. Quelques adjectifs aussi : **banals**, **fatals**.')),
      sort(b('Plural in -aux or -als?', 'Pluriel en -aux ou en -als ?'), ['-aux', '-als'], [['un journal', 0], ['un festival', 1], ['un hôpital', 0], ['un carnaval', 1], ['un animal', 0], ['un bal', 1]]),
      mc(P.spelling, ['Nous lisons les journaux locaux et les programmes de festivals.', 'Nous lisons les journals locaux et les programmes de festivaux.', 'Nous lisons les journaux locals et les programmes de festivals.', 'Nous lisons les journaux locaux et les programmes de festivaux.']),
      mc(P.spelling, ['Ce sont des résultats normaux mais des récits banals.', 'Ce sont des résultats normals mais des récits banaux.', 'Ce sont des résultats normaux mais des récits banaux.', 'Ce sont des résultats normals mais des récits banals.']),
      gap(P.complete, 'Les ___ (cheval) galopent près des ___ (canal), tandis que les ___ (festival) commencent.', ['chevaux', 'canaux', 'festivals'], { strict: true }),
      dict('Des chevaux blancs courent dans des paysages originaux, loin des hôpitaux.', { voice: 'f', strict: true }),
      say('Cet été, il y a deux grands festivals de musique et plusieurs bals populaires.', 'This summer, there are two big music festivals and several public dances.'),
    ],
    [
      b('Standard -al → -aux for nouns and masculine adjectives: chevaux, journaux, nationaux.', 'Règle générale -al → -aux : chevaux, journaux, nationaux.'),
      b('Feminine plural keeps -ales: des fêtes locales, des routes nationales.', 'Féminin pluriel régulier en -ales : des fêtes locales, des routes nationales.'),
      b('-als exceptions: bals, carnavals, festivals, récitals, régals, chacals, banals, fatals.', 'Exceptions en -als : bals, carnavals, festivals, récitals, régals, chacals, banals, fatals.'),
    ],
    [['un journal', b('a newspaper', 'publication d’actualités')], ['un récital', b('a recital', 'concert d’un soliste')], ['un régal', b('a treat, delight', 'grand plaisir gustatif')]],
  ),
  lesson(C, 2, ['plurals-in-ou-and-ail', 'pluriel-en-ou-et-ail'],
    b('Plurals in -ou and -ail: bijoux & travaux', 'Pluriels en -ou et -ail : bijoux et travaux'),
    b('Apply the regular -s rule and lock in the famous -oux and -aux exception lists.', 'Appliquer la règle générale en -s et mémoriser les exceptions célèbres en -oux et -aux.'),
    [b('Memorise the 7 nouns in -oux', 'Retenir les 7 noms en -oux'), b('Add -s to all other -ou nouns (clous, trous, sous)', 'Ajouter -s aux autres noms en -ou (clous, trous, sous)'), b('Know the -ail → -aux exceptions (travaux, vitraux, coraux)', 'Connaître les exceptions en -ail → -aux (travaux, vitraux, coraux)')],
    13,
    [
      card(b('-ou → -ous, except seven in -oux', '-ou → -ous, sauf sept mots en -oux'), b('Almost all **-ou** nouns take **-s**: **des clous, des trous, des sous, des fous, des cous, des bambous, des verrous**. Only **seven** take **-x**: **bijoux, cailloux, choux, genoux, hiboux, joujoux, poux** (*jewels, pebbles, cabbages, knees, owls, toys, lice*).', 'Presque tous les noms en **-ou** prennent **-s** : **des clous, des trous, des sous, des fous, des cous**. Seuls **sept** prennent **-x** : **bijoux, cailloux, choux, genoux, hiboux, joujoux, poux**.'), {
        ex: [['Elle range ses bijoux et joue avec des cailloux.', 'She puts away her jewels and plays with pebbles.'], ['Il y a des trous dans le mur et des clous par terre.', 'There are holes in the wall and nails on the floor.'], ['Les choux poussent bien dans ce jardin.', 'Cabbages grow well in this garden.']],
      }),
      tip(b('-ail → -ails, except seven in -aux', '-ail → -ails, sauf sept mots en -aux'), b('Most **-ail** nouns add **-s**: **des détails, des rails, des éventails, des chandails, des portails**. Seven shift to **-aux**: **des travaux** (*work*), **des coraux** (*corals*), **des vitraux** (*stained glass*), **des émaux** (*enamels*), **des baux** (*leases*), **des soupiraux** (*basement windows*), **des vantaux** (*door leaves*).', 'La plupart des noms en **-ail** prennent **-s** : **des détails, des rails, des éventails, des portails**. Sept font **-aux** : **travaux, coraux, vitraux, émaux, baux, soupiraux, vantaux**.')),
      sort(b('Does the plural end in -s or -x?', 'Pluriel en -s ou en -x ?'), [b('ends in -s', 'finit par -s'), b('ends in -x', 'finit par -x')], [['un clou', 0], ['un bijou', 1], ['un détail', 0], ['un travail', 1], ['un trou', 0], ['un genou', 1]]),
      mc(P.spelling, ['Les travaux de la cathédrale protègent les anciens vitraux.', 'Les travails de la cathédrale protègent les anciens vitrails.', 'Les travaux de la cathédrale protègent les anciens vitrails.', 'Les travails de la cathédrale protègent les anciens vitraux.']),
      mc(P.spelling, ['Elle a les genoux sales et des cailloux dans ses poches.', 'Elle a les genous sales et des caillous dans ses poches.', 'Elle a les genoux sales et des caillous dans ses poches.', 'Elle a les genous sales et des cailloux dans ses poches.']),
      gap(P.complete, 'Sans regarder les ___ (détail), ils ont fini les ___ (travail) avec des ___ (clou) et des ___ (chou).', ['détails', 'travaux', 'clous', 'choux'], { strict: true }),
      dict('Les hiboux observent les cailloux et les choux près des vieux portails.', { voice: 'm', strict: true }),
    ],
    [
      b('7 -oux: bijoux, cailloux, choux, genoux, hiboux, joujoux, poux; others take -s (clous, trous).', '7 -oux : bijoux, cailloux, choux, genoux, hiboux, joujoux, poux ; les autres prennent -s.'),
      b('-ail → -ails (détails, rails, portails), except travaux, vitraux, coraux, émaux, baux, soupiraux, vantaux.', '-ail → -ails (détails, rails), sauf travaux, vitraux, coraux, émaux, baux, soupiraux, vantaux.'),
      b('Adjectives ending in -ou (mou, fou): mous, fous.', 'Les adjectifs en -ou (mou, fou) prennent -s : mous, fous.'),
    ],
    [['un vitrail', b('a stained-glass window', 'fenêtre en verre coloré')], ['un caillou', b('a pebble, small stone', 'petite pierre')], ['un bail', b('a lease (rental contract)', 'contrat de location')]],
  ),
  lesson(C, 3, ['plurals-in-eu-au-and-invariables', 'pluriel-en-eu-au-et-invariables'],
    b('Plurals in -au, -eau, -eu & invariable nouns', 'Pluriels en -au, -eau, -eu et noms invariables'),
    b('Add -x to -au, -eau and -eu, remember pneus and bleus, and keep -s / -x / -z unchanged.', 'Mettre -x après -au, -eau, -eu, retenir pneus et bleus, et garder -s / -x / -z invariables.'),
    [b('Add -x to -au, -eau, -eu, -œu', 'Ajouter -x après -au, -eau, -eu, -œu'), b('Remember the exceptions: pneus, bleus, landaus', 'Retenir les exceptions : pneus, bleus, landaus'), b('Leave -s, -x, -z nouns unchanged in the plural', 'Laisser invariables les noms en -s, -x, -z')],
    13,
    [
      card(b('-au, -eau, -eu → -x (almost always)', '-au, -eau, -eu → -x (presque toujours)'), b('Nouns and adjectives ending in **-au, -eau, -eu, -œu** take **-x**: **des bateaux, des châteaux, des cadeaux, des noyaux, des cheveux, des feux, des jeux, des vœux, des beaux manteaux, des nouveaux livres**. Exceptions taking **-s**: **des pneus** (*tyres*), **des bleus** (*blue/bruises*), **des landaus** (*prams*), **des émeus** (*emus*), **des sarraus**. Nouns already ending in **-s, -x, -z** never change: **des nez, des prix, des mois, des choix, des bus**.', 'Les mots en **-au, -eau, -eu, -œu** prennent **-x** : **des bateaux, des châteaux, des cadeaux, des cheveux, des feux, des jeux, des vœux, beaux, nouveaux**. Exceptions en **-s** : **des pneus**, **des bleus**, **des landaus**, **des émeus**, **des sarraus**. Les noms finissant déjà par **-s, -x, -z** restent identiques : **des nez, des prix, des mois, des choix, des bus**.'), {
        ex: [['Elle a les yeux bleus et de beaux cheveux.', 'She has blue eyes and lovely hair.'], ['Le garage vend quatre pneus neufs à prix doux.', 'The garage sells four new tyres at low prices.'], ['Voici mes meilleurs vœux pour ces douze mois.', 'Here are my best wishes for these twelve months.']],
      }),
      trap(b('« Des pneus » and « des yeux bleus »', '« Des pneus » et « des yeux bleus »'), b('Two ultra-common traps: **pneu** takes **-s** (**des pneus**), and the adjective **bleu** takes **-s** (**des yeux bleus**, never « yeux bleux »!). Also remember **œil** has an irregular plural: **des yeux**.', 'Deux pièges fréquents : **pneu** prend **-s** (**des pneus**) et **bleu** prend **-s** (**des yeux bleus**, jamais « bleux » !). Et **un œil** fait **des yeux**.')),
      pairs(P.match, [['un travail', 'des travaux'], ['un pneu', 'des pneus'], ['un cheveu', 'des cheveux'], ['un choix', 'des choix']], true),
      mc(P.spelling, ['Il achète de nouveaux pneus et des rideaux bleus.', 'Il achète de nouveau pneus et des rideaus bleux.', 'Il achète de nouveaux pneux et des rideaux bleus.', 'Il achète de nouveaux pneus et des rideaux bleux.']),
      mc(P.spelling, ['Depuis plusieurs mois, les prix des bus restent bas.', 'Depuis plusieurs moiss, les prixs des buss restent bas.', 'Depuis plusieurs mois, les prixs des bus restent bas.', 'Depuis plusieurs moiss, les prix des bus restent bas.']),
      gap(P.complete, 'Les ___ (bateau) portent des ___ (cadeau), et les voitures ont des ___ (pneu) ___ (bleu).', ['bateaux', 'cadeaux', 'pneus', 'bleus'], { strict: true }),
      dict('Mes neveux ont les yeux bleus, les cheveux longs et de beaux jeux.', { voice: 'f', strict: true }),
    ],
    [
      b('-au, -eau, -eu, -œu take -x: bateaux, châteaux, cheveux, jeux, vœux.', '-au, -eau, -eu, -œu prennent -x : bateaux, châteaux, cheveux, jeux, vœux.'),
      b('Exceptions with -s: pneus, bleus, landaus, émeus, sarraus.', 'Exceptions avec -s : pneus, bleus, landaus, émeus, sarraus.'),
      b('Nouns ending in -s, -x, -z never change: des mois, des prix, des nez, des choix.', 'Les noms en -s, -x, -z ne changent jamais : des mois, des prix, des nez, des choix.'),
    ],
    [['un pneu', b('a tyre, tire', 'enveloppe de roue')], ['un vœu', b('a wish, vow', 'souhait')], ['un noyau', b('a fruit stone / core', 'partie dure d’un fruit')]],
  ),
];
