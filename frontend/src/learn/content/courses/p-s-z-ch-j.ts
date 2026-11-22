import type { CourseAbout } from '../../types';
import { b, card, dict, gap, hear, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Un poisson (a fish) or un poison (a poison)? Chez (at) or je (I)? Confusing voiceless and voiced fricatives—or mixing up hissing s/z and hushing ch/j—changes everyday French words immediately. This A1 course trains your tongue position, voicing contrast and spelling clues so you hear and produce [s], [z], [ʃ] and [ʒ] cleanly.',
    'Un poisson ou un poison ? Chez ou je ? Confondre consonnes sourdes et sonores — ou mélanger sifflantes s/z et chuintantes ch/j — change immédiatement le sens des mots. Ce cours de niveau A1 entraîne la position de la langue, la vibration des cordes vocales et les repères orthographiques pour entendre et prononcer [s], [z], [ʃ] et [ʒ] avec netteté.',
  ),
  outcomes: [
    b('Distinguish voiceless [s] (poisson) from voiced [z] (poison)', 'Distinguer [s] sourd (poisson) et [z] sonore (poison)'),
    b('Produce pure French [ʃ] (ch) and [ʒ] (j/g) without English t/d', 'Produire [ʃ] et [ʒ] purs sans attaque en t ou d'),
    b('Read spelling rules: single s vs ss, ç, and g before e/i/y', 'Lire correctement s entre voyelles, ss, ç et g devant e/i/y'),
    b('Chain all four fricatives smoothly in everyday phrases', 'Enchaîner les quatre fricatives avec aisance en phrase'),
  ],
};

const C = 'p-s-z-ch-j';
export default [
  lesson(C, 1, ['voiceless-s-and-voiced-z', 's-sourd-et-z-sonore'],
    b('Hissing: [s] vs [z] (poisson vs poison)', 'Sifflantes : [s] contre [z] (poisson / poison)'),
    b('Keep tongue tip behind teeth and turn vocal cords on or off for [s] and [z].', 'Placer la langue derrière les dents et activer ou non la voix pour [s] et [z].'),
    [b('Feel the throat vibration difference ([s] vs [z])', 'Sentir la vibration de la gorge ([s] vs [z])'), b('Distinguish single s ([z]) from double ss ([s])', 'Distinguer s entre voyelles ([z]) et ss ([s])'), b('Hear minimal pairs like poisson / poison', 'Entendre des paires comme poisson / poison')],
    13,
    [
      card(b('Hissing sounds: [s] and [z]', 'Les sifflantes : [s] et [z]'), b('Place your tongue tip behind your lower teeth and smile slightly. For **[s]** (**poisson, tasse, garçon**), blow pure air (no throat buzz). For **[z]** (**poison, maison, zéro**), keep the exact same mouth and turn your voice on.', 'Placez la pointe de la langue derrière les dents du bas. Pour **[s]** (**poisson, tasse, garçon**), soufflez sans faire vibrer la gorge. Pour **[z]** (**poison, maison, zéro**), gardez la même bouche et faites vibrer la voix.'), {
        ex: [['le poisson / le poison', '[s] vs [z]'], ['le dessert / le désert', '[s] vs [z]'], ['un coussin / un cousin', '[s] vs [z]']],
      }),
      trap(b('One s between two vowels = [z]!', 'Un seul s entre deux voyelles = [z] !'), b('Between two vowels, **single s** almost always sounds **[z]**: **maison, cuisine, rose, poison**. To keep **[s]**, French writes **ss** (**poisson, dessert, coussin**), **c** before **e/i/y** (**merci**), or **ç** (**français**).', 'Entre deux voyelles, un **s seul** se dit **[z]** : **maison, cuisine, rose, poison**. Pour garder **[s]**, le français écrit **ss** (**poisson, dessert, coussin**), **c** devant **e/i/y** (**merci**), ou **ç** (**français**).')),
      hear('J’ai commandé du poisson frais avec une sauce citron.', b('Listen. Which [s]/[z] words do you hear?', 'Écoutez. Quel mot clé entendez-vous ?'), [b('poisson [s]: fish', 'poisson [s] : poisson de mer'), b('poison [z]: poison', 'poison [z] : substance toxique'), b('cousin [z]: cousin', 'cousin [z] : membre de la famille'), b('désert [z]: desert', 'désert [z] : région sèche')], { voice: 'f' }),
      hear('Ce dessert au chocolat est délicieux.', b('Listen. Does the middle sound like [s] or [z]?', 'Écoutez. Au milieu de « dessert », entend-on [s] ou [z] ?'), [b('[s]: dessert (double ss)', '[s] : dessert (double ss)'), b('[z]: désert (single s)', '[z] : désert (un seul s)'), b('[ʃ]: as in chat', '[ʃ] : comme dans chat'), b('[ʒ]: as in je', '[ʒ] : comme dans je')], { voice: 'm' }),
      sort(b('Sort by sound: [s] or [z]?', 'Classez par son : [s] ou [z] ?'), [b('[s] (no throat buzz)', '[s] (sourd)'), b('[z] (voiced buzz)', '[z] (sonore)')], [['le poisson', 0], ['le poison', 1], ['le dessert', 0], ['le désert', 1], ['un coussin', 0], ['un cousin', 1]], { listen: true }),
      pairs(b('Match the minimal pairs ([s] ↔ [z]).', 'Associez chaque paire minimale ([s] ↔ [z]).'), [['le poisson', 'le poison'], ['le dessert', 'le désert'], ['un coussin', 'un cousin'], ['la casse', 'la case']], true),
      say('Mon cousin pose un coussin sur la chaise de la cuisine, puis sert le poisson.', 'My cousin puts a cushion on the kitchen chair, then serves the fish.', { tip: b('Voice [z] in cousin and cuisine; blow clean [s] in coussin and poisson.', 'Faites vibrer [z] dans cousin et cuisine ; soufflez un [s] net dans coussin et poisson.') }),
    ],
    [
      b('[s] is unvoiced; [z] vibrates in the throat.', '[s] est sourd ; [z] fait vibrer la gorge.'),
      b('Between vowels: single s → [z] (poison); double ss → [s] (poisson).', 'Entre voyelles : un s → [z] (poison) ; deux s → [s] (poisson).'),
      b('c + e/i/y and ç also produce crisp [s].', 'c + e/i/y et ç donnent aussi un [s] net.'),
    ],
    [['le poisson', b('fish', 'animal aquatique')], ['le poison', b('poison', 'substance toxique')], ['un coussin', b('a cushion', 'petit oreiller')]],
  ),
  lesson(C, 2, ['hushing-ch-and-j', 'chuintantes-ch-et-j'],
    b('Hushing: [ʃ] vs [ʒ] (chez vs je)', 'Chuintantes : [ʃ] contre [ʒ] (chez / je)'),
    b('Round your lips for French ch and j—without adding an English t or d start.', 'Arrondir les lèvres pour ch et j français, sans attaque en t ou d.'),
    [b('Produce pure [ʃ] (ch) with rounded lips', 'Produire un [ʃ] pur lèvres arrondies'), b('Produce pure voiced [ʒ] (j, ge/gi)', 'Produire un [ʒ] pur et sonore (j, ge/gi)'), b('Know when g sounds [ʒ] vs [ɡ]', 'Savoir quand g se lit [ʒ] ou [ɡ]')],
    13,
    [
      card(b('Hushing sounds: [ʃ] and [ʒ]', 'Les chuintantes : [ʃ] et [ʒ]'), b('Push your lips forward into a soft circle. **[ʃ]** (**chat, chez, douche**) is a pure « sh » sound—never « tch ». **[ʒ]** (**je, jardin, rouge**) adds vocal-cord buzz—never « dj ». Spelling: **[ʒ]** = **j**, **g** before **e/i/y** (**girafe, plage**), or **ge** before **a/o** (**mangeons**).', 'Avancez les lèvres en petit rond. **[ʃ]** (**chat, chez, douche**) est un « ch » pur — jamais « tch ». **[ʒ]** (**je, jardin, rouge**) ajoute la voix — jamais « dj ». Graphies : **[ʒ]** = **j**, **g** devant **e/i/y** (**girafe, plage**), ou **ge** devant **a/o** (**mangeons**).'), {
        ex: [['chez Charles, le chat cherche', '[ʃ]'], ['je joue dans le jardin rouge', '[ʒ]']],
      }),
      tip(b('No t or d at the start!', 'Pas de t ni de d au départ !'), b('Hold **[ʃ]** and **[ʒ]** smoothly like wind: « shhhh » and « zhhhh ». If you hear a hard tap at the start (like English *chair* or *jam*), relax the tongue tip slightly away from the teeth.', 'Tenez **[ʃ]** et **[ʒ]** en continu : « chhhh » et « jjjj ». Si vous sentez un coup sec au début (comme *chair* ou *jam* en anglais), reculez légèrement la pointe de la langue.')),
      hear('Je cherche mon chat dans le jardin.', b('Listen. How many [ʃ] and [ʒ] sounds do you hear?', 'Écoutez. Quel son ouvre « cherche » et « jardin » ?'), [b('cherche starts with [ʃ], jardin starts with [ʒ]', 'cherche commence par [ʃ], jardin par [ʒ]'), b('Both start with [s]', 'Les deux commencent par [s]'), b('cherche starts with [ʒ], jardin with [ʃ]', 'cherche commence par [ʒ], jardin par [ʃ]'), b('Both start with [z]', 'Les deux commencent par [z]')], { voice: 'f2' }),
      sort(b('Which hushing sound: [ʃ] or [ʒ]?', 'Quel son chuintant : [ʃ] ou [ʒ] ?'), [b('[ʃ] (ch, unvoiced)', '[ʃ] (ch, sourd)'), b('[ʒ] (j / g+e,i, voiced)', '[ʒ] (j / g+e,i, sonore)')], [['le chat', 0], ['le jardin', 1], ['la douche', 0], ['la jupe', 1], ['le choix', 0], ['la girafe', 1]], { listen: true }),
      mc(P.choose, [b('In « manger » and « girafe » (g before e or i)', 'Dans « manger » et « girafe » (g devant e ou i)'), b('In « gare » and « goûter » (g before a or o)', 'Dans « gare » et « goûter » (g devant a ou o)'), b('In « gris » and « grand » (g before r)', 'Dans « gris » et « grand » (g devant r)'), b('Only when g is doubled as gg', 'Uniquement quand g est doublé')], { fr: 'Quand la lettre « g » se prononce-t-elle [ʒ] ?' }),
      dict('Je mange du fromage blanc chez Charles.', { voice: 'm2' }),
      say('Jean cherche sa chemise jaune dans la chambre rouge.', 'Jean looks for his yellow shirt in the red bedroom.', { tip: b('Protrude your lips cleanly for every [ʃ] and [ʒ].', 'Avancez bien les lèvres sur chaque [ʃ] et [ʒ].') }),
    ],
    [
      b('Push lips forward for [ʃ] and [ʒ], with no t/d tap.', 'Avancez les lèvres pour [ʃ] et [ʒ], sans attaque t/d.'),
      b('[ʃ] is spelled ch (chat, chez); [ʒ] is j or g before e/i/y.', '[ʃ] = ch ; [ʒ] = j ou g devant e/i/y.'),
      b('ge keeps [ʒ] before a or o (mangeons, orangeade).', 'ge garde le son [ʒ] devant a ou o (mangeons).'),
    ],
    [['la douche', b('the shower', 'jet d’eau pour se laver')], ['la girafe', b('the giraffe', 'animal au long cou')], ['la chemise', b('the shirt', 'vêtement à boutons')]],
  ),
  lesson(C, 3, ['mixing-s-z-ch-j-smoothly', 'enchainer-s-z-ch-j'],
    b('Distinguishing [s]/[ʃ] and [z]/[ʒ] in phrases', 'Enchaîner [s]/[ʃ] et [z]/[ʒ] sans confondre'),
    b('Switch cleanly between flat-lipped s/z and rounded-lip ch/j inside real sentences.', 'Alterner sans hésiter entre lèvres étirées (s/z) et arrondies (ch/j).'),
    [b('Separate [s] from [ʃ] (sous / chou, c’est / chez)', 'Séparer [s] et [ʃ] (sous / chou, c’est / chez)'), b('Separate [z] from [ʒ] (douze / joue, case / cage)', 'Séparer [z] et [ʒ] (case / cage)'), b('Master tricky French fricative sentences', 'Maîtriser des phrases rapides à fricatives')],
    13,
    [
      card(b('The lip switch: spread vs rounded', 'Alterner lèvres étirées et arrondies'), b('Mixing **s/z** and **ch/j** happens when your lips stay frozen. For **[s]/[z]**, pull corners slightly back (**c’est, sous, douze**). For **[ʃ]/[ʒ]**, round lips forward (**chez, chou, joue**). Switch deliberately between **je** [ʒə] and **ce** [sə], **case** [kaz] and **cage** [kaʒ].', 'On confond **s/z** et **ch/j** quand les lèvres restent immobiles. Pour **[s]/[z]**, tirez légèrement les coins vers l’arrière (**c’est, sous, douze**). Pour **[ʃ]/[ʒ]**, avancez les lèvres en rond (**chez, chou, joue**).'), {
        ex: [['Je suis chez Serge.', '[ʒ] [s] [ʃ] [s] [ʒ]'], ['Les chaussettes sèches', '[ʃ] [s] [s] [ʃ]']],
      }),
      hear('Il a acheté six choux et sept sachets de sucre.', b('Listen. Which words start with [ʃ]?', 'Écoutez. Quel mot commence par [ʃ] ?'), [b('choux: cabbage', 'choux : légume'), b('six: six', 'six : nombre'), b('sept: seven', 'sept : nombre'), b('sucre: sugar', 'sucre : aliment doux')], { voice: 'm' }),
      hear('Ce soir, je range ma valise jaune chez Julie.', b('Listen. What sound begins « valise » vs « jaune »?', 'Écoutez. Quels sons terminent « valise » et ouvrent « jaune » ?'), [b('valise ends in [z], jaune starts with [ʒ]', 'valise finit par [z], jaune commence par [ʒ]'), b('Both use [s]', 'Les deux utilisent [s]'), b('Both use [ʃ]', 'Les deux utilisent [ʃ]'), b('valise ends in [ʒ], jaune starts with [z]', 'valise finit par [ʒ], jaune commence par [z]')], { voice: 'f' }),
      sort(b('Flat lips ([s]/[z]) or rounded lips ([ʃ]/[ʒ])?', 'Lèvres étirées ([s]/[z]) ou arrondies ([ʃ]/[ʒ]) ?'), [b('[s] or [z]', '[s] ou [z]'), b('[ʃ] or [ʒ]', '[ʃ] ou [ʒ]')], [['la soupe', 0], ['le chou', 1], ['la maison', 0], ['la joue', 1], ['la valise', 0], ['la cage', 1]], { listen: true }),
      gap(P.complete, 'Un poi___on rouge nage dan___ le joli bocal.', ['ss', 's']),
      dict('Je suis chez Julie avec six choux rouges et douze cerises.', { voice: 'f2' }),
      say('Je suis chez Serge : je choisis six choux, douze cerises et du poisson.', 'I am at Serge’s place: I choose six cabbages, twelve cherries and fish.', { tip: b('Move your lips visibly between [s]/[z] and [ʃ]/[ʒ].', 'Alternez visiblement la forme des lèvres entre [s]/[z] et [ʃ]/[ʒ].') }),
    ],
    [
      b('[s]/[z]: lips slightly spread; [ʃ]/[ʒ]: lips pushed forward.', '[s]/[z] : lèvres étirées ; [ʃ]/[ʒ] : lèvres projetées en rond.'),
      b('Contrast pairs: c’est / chez, sous / chou, case / cage.', 'Paires utiles : c’est / chez, sous / chou, case / cage.'),
      b('Slow lip switches first, then full conversational speed.', 'Commencez lentement sur les lèvres avant d’accélérer.'),
    ],
    [['un chou', b('a cabbage', 'légume à feuilles')], ['une valise', b('a suitcase', 'bagage de voyage')], ['une cerise', b('a cherry', 'petit fruit rouge')]],
  ),
];
