import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Make every French noun and adjective agree cleanly in the plural. Go from the silent -s rule and invariable -s/-x/-z endings to -eau/-eu/-al transformations (-x and -aux) and adjectives—including colour words like marron and orange that never change.',
    'Accordez sans faute les noms et les adjectifs au pluriel. Passez de la règle du -s muet et des mots invariables en -s/-x/-z aux transformations en -eau/-eu/-al (-x et -aux), puis aux adjectifs—sans oublier les couleurs invariables comme marron et orange.',
  ),
  outcomes: [
    b('Form regular plurals and spot nouns ending in -s, -x, -z', 'Former les pluriels réguliers et repérer les noms en -s, -x, -z'),
    b('Transform -eau, -eu, and -al nouns into -x and -aux', 'Transformer les noms en -eau, -eu et -al en -x et -aux'),
    b('Make adjectives agree and leave invariable colours unchanged', 'Accorder les adjectifs et laisser invariables les couleurs comme marron'),
  ],
};

const C = 'gr-plural-nouns-adjectives';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['regular-and-invariable-nouns', 'pluriel-regulier-et-invariables'],
    b('Regular -s and invariable -s, -x, -z nouns', 'Pluriel en -s et noms invariables en -s, -x, -z'),
    b('Most nouns add a silent -s in the plural, while nouns already ending in -s, -x, or -z stay unchanged.', 'La plupart des noms prennent un -s muet au pluriel, tandis que ceux en -s, -x ou -z ne changent pas.'),
    [
      b('Add -s to regular nouns in the plural', 'Ajouter -s aux noms réguliers au pluriel'),
      b('Keep -s, -x, and -z nouns unchanged', 'Garder inchangés les noms déjà terminés par -s, -x ou -z'),
      b('Hear plurality through the article (un/une vs des/les)', 'Entendre le pluriel grâce à l’article (un/une vs des/les)'),
    ],
    13,
    [
      card(
        b('Add -s, or keep -s, -x, -z', 'Ajouter -s ou ne rien ajouter'),
        b(
          'Nine nouns out of ten simply add **-s** in the plural (*un billet → des billets*). That final **-s** is silent, so your ear tells singular from plural by the article (**un / une** vs. **des / les**). Nouns already ending in **-s, -x, -z** never add another letter.\nRegular -s: **des livres, des gares, des amis**.\nUnchanged endings: **des bus, des voix, des nez**.',
          'Neuf noms sur dix ajoutent simplement **-s** au pluriel (*un billet → des billets*). Ce **-s** final est muet : à l’oral, on reconnaît le pluriel grâce à l’article (**un / une** vs **des / les**). Les noms déjà terminés par **-s, -x, -z** ne prennent aucune lettre en plus.\nPluriels en -s : **des livres, des gares, des amis**.\nFins invariables : **des bus, des voix, des nez**.',
        ),
        {
          table: {
            head: [b('Rule', 'Règle'), b('Singular', 'Singulier'), b('Plural', 'Pluriel')],
            rows: [
              [b('Most nouns: + -s', 'Cas général : + -s'), 'une table', 'des tables'],
              [b('Ends in -s: no change', 'Fin en -s : rien'), 'un mois / un repas', 'des mois / des repas'],
              [b('Ends in -x: no change', 'Fin en -x : rien'), 'une noix / une voix', 'des noix / des voix'],
              [b('Ends in -z: no change', 'Fin en -z : rien'), 'un nez / un gaz', 'des nez / des gaz'],
            ],
          },
          ex: [
            ['Nous achetons trois billets pour le musée.', 'We are buying three tickets for the museum.'],
            ['Les bus passent toutes les dix minutes.', 'The buses come every ten minutes.'],
            ['Ce restaurant propose des repas simples.', 'This restaurant serves simple meals.'],
          ],
        },
      ),
      tip(
        b('Your ear hears the article, not the -s', 'L’oreille entend l’article, pas le -s'),
        b(
          'Say **un ami** vs. **des‿amis**, or **le mois** vs. **les mois**. You never pronounce the -s at the end of *amis* or *billets*—the article and the **-z-** liaison before a vowel carry the plural signal.\nPlural cues: **les, des, ces, deux‿amis**.',
          'Comparez **un ami** et **des‿amis**, ou **le mois** et **les mois**. On ne prononce jamais le -s final de *amis* ou *billets* : c’est l’article et la liaison en **-z-** devant voyelle qui signalent le pluriel.\nIndices du pluriel : **les, des, ces, deux‿amis**.',
        ),
      ),
      mc(
        P.spelling,
        ['des pays', 'des payss', 'des payses', 'des payx'],
        {
          fr: 'J’aime visiter ___ différents chaque été.',
          explain: b('Pays already ends in -s, so it stays unchanged in the plural.', 'Pays se termine déjà par -s : il ne change pas au pluriel.'),
        },
      ),
      hear(
        'Les enfants rangent les livres sur la table.',
        b('Are there one or several books?', 'Y a-t-il un seul livre ou plusieurs ?'),
        [
          b('Several books (article les)', 'Plusieurs livres (article les)'),
          b('Only one book', 'Un seul livre'),
          b('No books at all', 'Aucun livre'),
        ],
      ),
      gap(
        P.complete,
        'J’ai attendu deux ___ (bus) pendant trois ___ (mois). Enfin, j’ai trouvé deux ___ (voiture) libres et cinq ___ (chaise).',
        [['bus'], ['mois'], ['voitures'], ['chaises']],
        {
          choices: [
            ['bus', 'buss', 'bux'],
            ['mois', 'moiss', 'moix'],
            ['voitures', 'voiture', 'voiturex'],
            ['chaises', 'chaise', 'chaisex'],
          ],
        },
      ),
      pairs(
        b('Match each singular noun with its correct plural form.', 'Associez chaque nom singulier à sa forme plurielle.'),
        [
          ['une souris', 'des souris'],
          ['un bras', 'des bras'],
          ['un prix', 'des prix'],
          ['une rue', 'des rues'],
        ],
        true,
      ),
      sort(
        b('Does the noun add -s in the plural, or stay unchanged?', 'Le nom prend-il -s au pluriel ou reste-t-il identique ?'),
        [b('Adds -s', 'Prend -s'), b('Stays unchanged', 'Reste identique')],
        [
          ['un vélo', 0],
          ['un gaz', 1],
          ['une clé', 0],
          ['un repas', 1],
          ['une voix', 1],
          ['un cahier', 0],
        ],
      ),
      dict('Mes deux voisins prennent des repas chauds tous les mois.'),
      say('Dans cette ville, les bus circulent tard le soir.', 'In this city, the buses run late in the evening.'),
    ],
    [
      b('Most French nouns add a silent -s in the plural.', 'La majorité des noms français prennent un -s muet au pluriel.'),
      b('Nouns ending in -s, -x, or -z do not change in the plural.', 'Les noms terminés par -s, -x ou -z sont invariables au pluriel.'),
      b('In speech, articles (les, des, mes) and liaisons mark the plural.', 'À l’oral, ce sont les articles (les, des, mes) et les liaisons qui marquent le pluriel.'),
    ],
    [
      ['le repas', b('meal', 'le déjeuner ou le dîner')],
      ['la souris', b('mouse', 'petit animal ou outil d’ordinateur')],
      ['le prix', b('price / prize', 'le montant à payer')],
      ['la voix', b('voice', 'le son quand on parle ou chante')],
    ],
  ),

  lesson(
    C,
    2,
    ['eau-eu-al-plural-nouns', 'pluriels-en-eau-eu-al'],
    b('Nouns ending in -eau, -eu, and -al', 'Les noms en -eau, -eu et -al'),
    b('Swap -s for -x after -eau and -eu, and change -al into -aux—while spotting a few high-frequency exceptions.', 'Remplacez -s par -x après -eau et -eu, et transformez -al en -aux—en repérant les principales exceptions.'),
    [
      b('Add -x to -eau and -eu nouns (des bateaux, des jeux)', 'Ajouter -x aux noms en -eau et -eu'),
      b('Change -al to -aux (un journal → des journaux)', 'Transformer -al en -aux (un journal → des journaux)'),
      b('Spot common exceptions like des festivals and des pneus', 'Repérer des exceptions courantes comme des festivals et des pneus'),
    ],
    13,
    [
      card(
        b('-eau, -eu, and -al plurals', 'Pluriels en -eau, -eu et -al'),
        b(
          'Nouns ending in **-eau** or **-eu** take a silent **-x** instead of -s (*un bateau → des bateaux*, *un jeu → des jeux*). Most nouns ending in **-al** change the ending itself to **-aux** (*un journal → des journaux*), which changes the sound too!\nTake -x: **bateaux, châteaux, cadeaux, jeux**.\nChange to -aux: **journaux, animaux, hôpitaux, chevaux**.',
          'Les noms en **-eau** ou **-eu** prennent un **-x** muet au lieu de -s (*un bateau → des bateaux*, *un jeu → des jeux*). La plupart des noms en **-al** changent de finale pour devenir **-aux** (*un journal → des journaux*), ce qui change aussi la prononciation !\nPrennent -x : **bateaux, châteaux, cadeaux, jeux**.\nDeviennent -aux : **journaux, animaux, hôpitaux, chevaux**.',
        ),
        {
          table: {
            head: [b('Ending', 'Finale'), b('Rule', 'Règle'), b('Singular → Plural', 'Singulier → Pluriel')],
            rows: [
              ['-eau', '+ -x', 'un gâteau → des gâteaux'],
              ['-eu', '+ -x', 'un cheveu → des cheveux'],
              ['-al', '-al → -aux', 'un animal → des animaux'],
              ['-ail (some)', '-ail → -aux', 'un travail → des travaux'],
            ],
          },
          ex: [
            ['Nous visitons deux châteaux dans la vallée.', 'We are visiting two castles in the valley.'],
            ['Il achète des journaux au kiosque chaque matin.', 'He buys newspapers at the kiosk every morning.'],
            ['Les enfants adorent les animaux de la ferme.', 'Children love the farm animals.'],
          ],
        },
      ),
      trap(
        b('Everyday exceptions you will hear', 'Les exceptions du quotidien'),
        b(
          'A handful of common words ignore the -x / -aux rule and take a regular **-s**: **un pneu → des pneus**, **un festival → des festivals**, **un carnaval → des carnavals**, **un bal → des bals**.\nExceptions with -s: **des pneus, des festivals, des bals**.',
          'Quelques mots très courants n’appliquent pas la règle en -x / -aux et prennent un **-s** normal : **un pneu → des pneus**, **un festival → des festivals**, **un carnaval → des carnavals**, **un bal → des bals**.\nExceptions en -s : **des pneus, des festivals, des bals**.',
        ),
      ),
      mc(
        P.spelling,
        ['des journaux', 'des journals', 'des journales', 'des journauxs'],
        {
          fr: 'Dans ce café, on lit ___ étrangers.',
          explain: b('Journal follows the regular -al → -aux plural rule: des journaux.', 'Journal suit la règle -al → -aux : des journaux.'),
        },
      ),
      mc(
        P.spelling,
        ['des festivals', 'des festivaux', 'des festivalx', 'des festivales'],
        {
          fr: 'En juillet, il y a beaucoup de ___ de musique en France.',
          explain: b('Festival is a classic exception to -al → -aux: des festivals.', 'Festival fait exception à la règle en -aux : des festivals.'),
        },
      ),
      gap(
        P.complete,
        'Sur la table, il y a trois ___ (cadeau) et deux ___ (jeu) de société. Dehors, les ___ (oiseau) chantent près des ___ (cheval).',
        [['cadeaux'], ['jeux'], ['oiseaux'], ['chevaux']],
        {
          choices: [
            ['cadeaux', 'cadeaus', 'cadeau'],
            ['jeux', 'jeus', 'jeaux'],
            ['oiseaux', 'oiseaus', 'oiseau'],
            ['chevaux', 'chevals', 'chevaus'],
          ],
        },
      ),
      pairs(
        b('Match each singular noun with its plural.', 'Associez chaque nom singulier à son pluriel.'),
        [
          ['un tableau', 'des tableaux'],
          ['un hôpital', 'des hôpitaux'],
          ['un pneu', 'des pneus'],
          ['un lieu', 'des lieux'],
        ],
        true,
      ),
      sort(
        b('Sort by plural ending: -x, -aux, or exception -s.', 'Classez selon la terminaison du pluriel : -x, -aux ou exception en -s.'),
        ['-x', '-aux', b('exception -s', 'exception en -s')],
        [
          ['chapeau', 0],
          ['animal', 1],
          ['festival', 2],
          ['neveu', 0],
          ['journal', 1],
          ['pneu', 2],
        ],
      ),
      ord(
        P.order,
        'Les ouvriers finissent les travaux devant les hôpitaux.',
        {
          tr: 'The workers are finishing the roadworks in front of the hospitals.',
          extra: ['travails'],
        },
      ),
      dict('Les bateaux arrivent au port avec de beaux tableaux.'),
    ],
    [
      b('-eau and -eu nouns take -x in the plural (des gâteaux, des jeux).', 'Les noms en -eau et -eu prennent -x au pluriel (des gâteaux, des jeux).'),
      b('Most -al nouns change to -aux (des journaux, des animaux).', 'La plupart des noms en -al deviennent -aux (des journaux, des animaux).'),
      b('Watch common exceptions that simply add -s: des pneus, des festivals.', 'Retenez les exceptions courantes en -s : des pneus, des festivals.'),
    ],
    [
      ['le cadeau', b('gift', 'ce qu’on offre pour une fête')],
      ['le pneu', b('tire', 'la roue en caoutchouc d’une voiture ou d’un vélo')],
      ['le tableau', b('painting / board', 'une œuvre peinte ou un panneau')],
      ['les travaux', b('works / renovations', 'pluriel de travail pour un chantier')],
    ],
  ),

  lesson(
    C,
    3,
    ['adjective-plurals-and-invariable-colors', 'pluriel-des-adjectifs-et-couleurs'],
    b('Adjective plurals & invariable colours', 'Pluriel des adjectifs et couleurs invariables'),
    b('Make adjectives match plural nouns in both gender and number—and know which colour words never change.', 'Accordez les adjectifs en genre et en nombre avec les noms pluriels—et repérez les couleurs qui restent invariables.'),
    [
      b('Add -s to masculine and feminine plural adjectives', 'Ajouter -s aux adjectifs masculins et féminins au pluriel'),
      b('Handle -eau, -al, and -s/-x adjectives accurately', 'Maîtriser les adjectifs en -eau, -al et -s/-x au pluriel'),
      b('Keep object-derived colours like marron and orange invariable', 'Laisser invariables les couleurs venues de noms comme marron et orange'),
    ],
    13,
    [
      card(
        b('Adjectives in the plural', 'Les adjectifs au pluriel'),
        b(
          'Adjectives agree in **gender and number**. Most add **-s** (*grands / grandes*). Masculine adjectives ending in **-s** or **-x** (*français, heureux*) stay unchanged in the masculine plural (*des amis français*). **-eau** becomes **-eaux** (*nouveaux, beaux*) and **-al** becomes **-aux** (*internationaux*). Finally, colour words named after fruits or objects—like **marron** and **orange**—never change at all!\nInvariable colours: **marron, orange, turquoise, kaki**.\nPlural shifts: **beaux, nouveaux, nationaux, grands**.',
          'Les adjectifs s’accordent en **genre et en nombre**. La plupart prennent **-s** (*grands / grandes*). Les adjectifs masculins terminés par **-s** ou **-x** (*français, heureux*) ne changent pas au masculin pluriel (*des amis français*). **-eau** devient **-eaux** (*nouveaux, beaux*) et **-al** devient **-aux** (*internationaux*). Enfin, les couleurs issues d’un fruit ou d’un objet—comme **marron** et **orange**—ne s’accordent jamais !\nCouleurs invariables : **marron, orange, turquoise, kaki**.\nAccords pluriels : **beaux, nouveaux, nationaux, grands**.',
        ),
        {
          table: {
            head: [b('Type', 'Type'), b('Masc. plural', 'Masc. pluriel'), b('Fem. plural', 'Fém. pluriel')],
            rows: [
              [b('Regular', 'Régulier'), 'des sacs verts', 'des robes vertes'],
              [b('-s / -x ending', 'Fin en -s / -x'), 'des plats français', 'des chansons françaises'],
              [b('-eau / -al', '-eau / -al'), 'de nouveaux hôtels', 'de nouvelles gares'],
              [b('Invariable colour', 'Couleur invariable'), 'des pulls marron', 'des chaussures orange'],
            ],
          },
          ex: [
            ['Elle porte des chaussures marron très confortables.', 'She is wearing very comfortable brown shoes.'],
            ['Nous avons des voisins très sympathiques.', 'We have very friendly neighbors.'],
            ['Ces vieux immeubles ont de beaux balcons.', 'These old buildings have lovely balconies.'],
          ],
        },
      ),
      tip(
        b('Mixed nouns take masculine plural', 'Un groupe mixte prend le masculin pluriel'),
        b(
          'Just like *ils*, if an adjective describes one masculine noun and one feminine noun together, use the **masculine plural**: *un pull et une écharpe **bleus***, *un frère et une sœur **contents***.\nMixed plural examples: **bleus, neufs, blancs, prêts**.',
          'Comme pour *ils*, si un adjectif qualifie un nom masculin et un nom féminin ensemble, on emploie le **masculin pluriel** : *un pull et une écharpe **bleus***, *un frère et une sœur **contents***.\nExemples mixtes : **bleus, neufs, blancs, prêts**.',
        ),
      ),
      mc(
        P.spelling,
        ['des bottes marron', 'des bottes marrons', 'des bottes marrones', 'des bottes marronnes'],
        {
          fr: 'Pour l’automne, je cherche ___.',
          explain: b('Marron comes from the chestnut, so it stays invariable: des bottes marron.', 'Marron vient du fruit : l’adjectif reste toujours invariable (des bottes marron).'),
        },
      ),
      mc(
        P.form,
        ['internationaux', 'internationales', 'internationals', 'international'],
        {
          fr: 'Ce journal publie des articles ___ très précis.',
          explain: b('Article is masculine plural, and international changes -al → -aux (internationaux).', 'Article est masculin pluriel, et international devient internationaux.'),
        },
      ),
      gap(
        P.complete,
        'J’achète deux chemises ___ (blanc), trois cahiers ___ (orange) et de ___ (nouveau) stylos ___ (français).',
        [['blanches'], ['orange'], ['nouveaux'], ['français']],
        {
          choices: [
            ['blanches', 'blancs', 'blanche'],
            ['orange', 'oranges', 'orangees'],
            ['nouveaux', 'nouveau', 'nouvelles'],
            ['français', 'française', 'françaises'],
          ],
        },
      ),
      sort(
        b('Sort each adjective by how it behaves in front of a feminine plural noun (e.g. des vestes ___).', 'Classez chaque adjectif selon son accord devant un nom féminin pluriel (ex. : des vestes ___).'),
        [b('Changes spelling (-es / -s)', 'Change d’orthographe (-es / -s)'), b('Never changes', 'Ne change jamais')],
        [
          ['vert', 0],
          ['marron', 1],
          ['grand', 0],
          ['orange', 1],
          ['français', 0],
          ['turquoise', 1],
        ],
      ),
      ord(
        P.order,
        'Mes deux sœurs portent des manteaux bleus et des écharpes orange.',
        {
          tr: 'My two sisters are wearing blue coats and orange scarves.',
          extra: ['oranges'],
        },
      ),
      dlg(
        b('At the clothing boutique', 'Dans une boutique de vêtements'),
        b('Rémi helps Claire choose outfits for a trip.', 'Rémi aide Claire à choisir des tenues pour un voyage.'),
        [['Claire', 'f'], ['Rémi', 'm']],
        [
          [0, 'Tu préfères les chaussures noires ou les baskets marron ?', 'Do you prefer the black shoes or the brown sneakers?'],
          [1, {
            options: [
              'Les baskets marron ! Elles vont bien avec tes pulls verts.',
              'Les baskets marrons ! Elles vont bien avec tes pulls vert.',
              'Les basket marron ! Ils vont bien avec tes pulls vertes.',
            ],
            explain: b('Marron never takes -s, while vert agrees with masculine plural pulls (verts).', 'Marron reste invariable, tandis que vert s’accorde avec pulls (verts).'),
          }],
          [0, 'Et regarde ces deux beaux manteaux dans la vitrine !', 'And look at those two lovely coats in the window!'],
          [1, {
            options: [
              'Ils sont magnifiques, surtout avec des gants orange.',
              'Elles sont magnifiques, surtout avec des gants oranges.',
              'Ils sont magnifique, surtout avec des gants orange.',
            ],
          }],
        ],
      ),
      dict('Ces étudiants canadiens visitent de nouveaux musées nationaux.'),
      write(
        b('Describe items in a bag or shop.', 'Décrivez des objets dans un sac ou une boutique.'),
        b('Write 3–4 sentences using plural nouns (-s or -aux) and at least 3 plural adjectives—including one invariable colour (marron or orange).', 'Écrivez 3 ou 4 phrases avec des noms au pluriel (-s ou -aux) et au moins 3 adjectifs au pluriel, dont une couleur invariable (marron ou orange).'),
        22,
        44,
        [
          b('Include at least two plural nouns', 'Inclure au moins deux noms au pluriel'),
          b('Make regular or -eau/-al adjectives agree', 'Accorder les adjectifs réguliers ou en -eau/-al'),
          b('Keep marron or orange invariable', 'Laisser marron ou orange invariable'),
        ],
        'Dans mon sac, j’ai deux journaux français, trois stylos bleus et des clés. Je porte aussi de nouvelles chaussures marron et deux chapeaux originaux pour le voyage. Mes lunettes orange sont sur la table.',
      ),
    ],
    [
      b('Adjectives agree in both gender and number: grand → grands / grandes.', 'Les adjectifs s’accordent en genre et en nombre : grand → grands / grandes.'),
      b('Masculine adjectives in -s/-x keep one form (des livres français); -eau/-al take -eaux/-aux.', 'Les adjectifs masculins en -s/-x ne changent pas (des livres français) ; -eau/-al donnent -eaux/-aux.'),
      b('Object-based colours like marron and orange never take -e or -s.', 'Les couleurs comme marron et orange ne prennent jamais ni -e ni -s.'),
    ],
    [
      ['la chaussure', b('shoe', 'ce qu’on porte aux pieds')],
      ['le manteau', b('coat', 'vêtement chaud d’hiver')],
      ['l’écharpe (f.)', b('scarf', 'tissu autour du cou')],
      ['les gants (m.)', b('gloves', 'pour protéger les mains')],
    ],
  ),
];

export default lessons;
