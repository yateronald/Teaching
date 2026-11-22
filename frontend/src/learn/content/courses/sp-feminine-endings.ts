import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Adding -e to make a French noun or adjective feminine is only the beginning. What happens to endings like -er, -f, -x, -c, -eur or -et? Some shift their consonant (actif → active, heureux → heureuse), -eur splits three ways (-euse, -trice, -eure), and -et splits between double t (-ette) and grave accent (-ète: complète, discrète, inquiète). This A2 course organises every feminine pattern into clear rules.',
    'Ajouter simplement un -e pour former le féminin d’un nom ou d’un adjectif ne suffit pas toujours. Que deviennent -er, -f, -x, -c, -eur ou -et ? Certains changent la consonne finale (actif → active, heureux → heureuse), -eur se divise en trois (-euse, -trice, -eure), et -et hésite entre double t (-ette) et accent grave (-ète : complète, discrète, inquiète). Ce cours A2 classe chaque modèle avec méthode.',
  ),
  outcomes: [
    b('Spell regular shifts: -er → -ère, -f → -ve, -x → -se, -c → -que / -che', 'Écrire les féminins en -ère, -ve, -se, -que et -che'),
    b('Choose accurately between -euse, -trice and -eure for -eur words', 'Choisir entre -euse, -trice et -eure pour les mots en -eur'),
    b('Know when final consonants double (-enne, -onne, -elle, -ette)', 'Savoir quand doubler la consonne finale (-enne, -onne, -elle, -ette)'),
    b('Master the -et → -ète exceptions (complète, discrète, inquiète, secrète)', 'Maîtriser les exceptions en -ète (complète, discrète, inquiète, secrète)'),
  ],
};

const C = 'sp-feminine-endings';
export default [
  lesson(C, 1, ['feminine-er-f-x-c', 'feminin-en-er-f-x-c'],
    b('Feminine of -er, -f, -x & -c', 'Féminin des mots en -er, -f, -x et -c'),
    b('Form feminine nouns and adjectives ending in -ère, -ve, -se, -ce, -que and -che.', 'Former les féminins en -ère, -ve, -se, -ce, -que et -che.'),
    [b('Turn -er into -ère with a grave accent', 'Passer de -er à -ère avec accent grave'), b('Turn -f into -ve and -x into -se (or -ce/-sse)', 'Passer de -f à -ve et de -x à -se (ou -ce/-sse)'), b('Spell -c feminines: blanche, sèche, publique', 'Écrire les féminins en -c : blanche, sèche, publique')],
    13,
    [
      card(b('Four predictable transformations', 'Quatre transformations régulières'), b('1. **-er → -ère** (always grave **è**!): **boulanger → boulangère, infirmier → infirmière, léger → légère, premier → première**. 2. **-f → -ve**: **actif → active, neuf → neuve, sportif → sportive, bref → brève**. 3. **-x → -se**: **heureux → heureuse, sérieux → sérieuse** (exceptions: **doux → douce, faux → fausse, roux → rousse**). 4. **-c → -che** or **-que**: **blanc → blanche, franc → franche, sec → sèche**; **public → publique, turc → turque**.', '1. **-er → -ère** (toujours **è** !) : **boulangère, infirmière, légère, première**. 2. **-f → -ve** : **active, neuve, sportive, brève**. 3. **-x → -se** : **heureuse, sérieuse** (exceptions : **doux → douce, faux → fausse, roux → rousse**). 4. **-c → -che** ou **-que** : **blanche, franche, sèche** ; **publique, turque**.'), {
        ex: [['Ma voisine est infirmière et très sportive.', 'My neighbour is a nurse and very athletic.'], ['Elle porte une robe blanche toute neuve.', 'She’s wearing a brand-new white dress.'], ['La bibliothèque publique offre une ambiance douce.', 'The public library has a gentle atmosphere.']],
      }),
      pairs(P.match, [['infirmier', 'infirmière'], ['neuf', 'neuve'], ['doux', 'douce'], ['public', 'publique']], true),
      sort(b('Which feminine ending?', 'Quelle terminaison au féminin ?'), ['-ère / -ve', '-se / -ce / -sse', '-che / -que'], [['lég… (léger)', 0], ['act… (actif)', 0], ['heur… (heureux)', 1], ['fau… (faux)', 1], ['blan… (blanc)', 2], ['tur… (turc)', 2]]),
      mc(P.spelling, ['Une réponse brève, franche et très sérieuse.', 'Une réponse bréve, francke et très sérieuxe.', 'Une réponse brave, franque et très sérieuse.', 'Une réponse brève, franche et très sérieux.']),
      mc(P.spelling, ['Cette épicerie est tenue par une boulangère heureuse.', 'Cette épicerie est tenue par une boulangére heureuse.', 'Cette épicerie est tenue par une boulangère heureusse.', 'Cette épicerie est tenue par une boulangere heureuse.']),
      gap(P.complete, 'La maison ___ (neuf) a une porte ___ (blanc), une cuisine ___ (léger) et une voix ___ (doux).', ['neuve', 'blanche', 'légère', 'douce'], { strict: true }),
      dict('La première sportive est très active, mais sa réponse reste brève et douce.', { voice: 'f', strict: true }),
    ],
    [
      b('-er → -ère (always è: boulangère, légère, première).', '-er → -ère (toujours è : boulangère, légère, première).'),
      b('-f → -ve (active, neuve, brève); -x → -se (except douce, fausse, rousse).', '-f → -ve (active, neuve, brève) ; -x → -se (sauf douce, fausse, rousse).'),
      b('-c → -che (blanche, franche, sèche) or -que (publique, turque, grecque).', '-c → -che (blanche, franche, sèche) ou -que (publique, turque, grecque).'),
    ],
    [['bref, brève', b('brief, short', 'court')], ['franc, franche', b('frank, candid', 'sincère, direct')], ['neuf, neuve', b('brand-new', 'qui vient d’être fabriqué')]],
  ),
  lesson(C, 2, ['feminine-in-eur', 'feminin-en-eur'],
    b('Words in -eur: -euse, -trice or -eure?', 'Les mots en -eur : -euse, -trice ou -eure ?'),
    b('Distinguish the three feminine patterns for nouns and adjectives ending in -eur.', 'Distinguer les trois féminins des noms et adjectifs en -eur.'),
    [b('Use the -ant test for -euse', 'Appliquer le test en -ant pour -euse'), b('Form -trice for -teur nouns without a -ant stem', 'Former -trice pour les noms en -teur sans participe en -ant'), b('Add simple -e for meilleur and -érieur adjectives', 'Ajouter un simple -e à meilleur et aux adjectifs en -érieur')],
    13,
    [
      card(b('Three endings for -eur', 'Trois féminins pour -eur'), b('1. **-euse** when the word comes from a **French verb** whose participle in **-ant** matches: *chanter → chantant* → **chanteuse**, *vendre → vendant* → **vendeuse**, *servir → servant* → **serveuse**, *travailler → travaillant* → **travailleuse**. 2. **-trice** for **-teur** words with no *-ant* match: **acteur → actrice, directeur → directrice, lecteur → lectrice, traducteur → traductrice, conducteur → conductrice**. 3. **-eure** (just add **-e**) for **meilleur, majeur, mineur** and adjectives in **-érieur**: **meilleure, supérieure, extérieure**.', '1. **-euse** quand un participe en **-ant** existe : *chantant* → **chanteuse**, *vendant* → **vendeuse**, *servant* → **serveuse**, *travaillant* → **travailleuse**. 2. **-trice** pour les mots en **-teur** sans forme en *-ant* : **actrice, directrice, lectrice, traductrice, conductrice**. 3. **-eure** pour **meilleur, majeur, mineur** et les adjectifs en **-érieur** : **meilleure, supérieure, extérieure**.'), {
        ex: [['La directrice est aussi une excellente traductrice.', 'The director is also an excellent translator.'], ['Cette vendeuse est très travailleuse.', 'This shop assistant is very hard-working.'], ['C’est la meilleure idée, sans doute supérieure à l’autre.', 'It’s the best idea, no doubt superior to the other.']],
      }),
      tip(b('Two famous -euse exceptions in -teur', 'Deux exceptions en -teuse à retenir'), b('*Chanter → chantant* gives **chanteuse**, and *mentir → mentant* gives **menteuse**! Notice why the **-ant** test works even for *-teur*: *achetant → acheteuse*, *portant → porteuse*, whereas *direct-* has no « directant » → **directrice**.', '*Chanter → chantant* donne **chanteuse**, *acheter → achetant* donne **acheteuse** ; en revanche, il n’y a pas de « directant » → **directrice** !')),
      sort(b('Feminine in -euse, -trice or -eure?', 'Féminin en -euse, -trice ou -eure ?'), ['-euse', '-trice', '-eure'], [['vendeur', 0], ['directeur', 1], ['meilleur', 2], ['chanteur', 0], ['traducteur', 1], ['supérieur', 2]]),
      mc(P.spelling, ['La conductrice a donné la meilleure explication.', 'La conducteuse a donné la meilleur explication.', 'La conductrice a donné la meilleur explication.', 'La conducteuse a donné la meilleure explication.']),
      mc(P.spelling, ['Cette lectrice est une grande admiratrice et une danseuse douée.', 'Cette lecteuse est une grande admirateuse et une dansatrice douée.', 'Cette lectrice est une grande admirateuse et une danseuse douée.', 'Cette lecteuse est une grande admiratrice et une danseuse douée.']),
      gap(P.complete, 'La ___ (serveur) et l’___ (acteur) cherchent une ___ (meilleur) place à l’___ (extérieur, f.).', ['serveuse', 'actrice', 'meilleure', 'extérieure'], { strict: true }),
      dict('La directrice félicite la vendeuse et la traductrice pour leur meilleure note.', { voice: 'm', strict: true }),
      say('Notre nouvelle directrice était autrefois chanteuse et traductrice de romans.', 'Our new director used to be a singer and a translator of novels.'),
    ],
    [
      b('-eur with a matching -ant verb stem → -euse (vendeuse, chanteuse, travailleuse).', '-eur rattaché à un verbe en -ant → -euse (vendeuse, chanteuse, travailleuse).'),
      b('-teur without a matching -ant stem → -trice (actrice, directrice, traductrice).', '-teur sans participe en -ant → -trice (actrice, directrice, traductrice).'),
      b('meilleur, majeur, mineur and -érieur adjectives simply add -e: meilleure, supérieure.', 'meilleur, majeur, mineur et les mots en -érieur prennent -e : meilleure, supérieure.'),
    ],
    [['une traductrice', b('a translator (f.)', 'femme qui traduit')], ['une lectrice', b('a reader (f.)', 'femme qui lit')], ['supérieur, supérieure', b('higher, superior', 'au-dessus')]],
  ),
  lesson(C, 3, ['double-consonants-vs-grave-accent', 'consonne-double-ou-accent-grave'],
    b('Double consonants vs -ète: muette or complète?', 'Consonne double ou -ète : muette ou complète ?'),
    b('Know when to double the final consonant and master the eight -et → -ète exceptions.', 'Savoir quand doubler la consonne finale et maîtriser les exceptions en -ète.'),
    [b('Double the consonant in -enne, -onne, -elle, -eille, -ette', 'Doubler la consonne dans -enne, -onne, -elle, -eille, -ette'), b('Spell the -ète exceptions without double t', 'Écrire les exceptions en -ète sans double t'), b('Use belle, nouvelle, vieille, folle, molle', 'Employer belle, nouvelle, vieille, folle, molle')],
    13,
    [
      card(b('Double consonant vs grave accent', 'Consonne double ou accent grave'), b('Many adjectives and nouns double the consonant before **-e**: **-en → -enne** (*italienne, ancienne*), **-on → -onne** (*bonne, mignonne*), **-el → -elle** (*naturelle, officielle*), **-eil → -eille** (*pareille*), **-et → -ette** (*muette, nette, coquette, violette*). Also **beau → belle, nouveau → nouvelle, vieux → vieille, fou → folle**. By contrast, eight common **-et** words take **è** and a **single t**: **complète, incomplète, concrète, discrète, indiscrète, inquiète, secrète, désuète**.', 'Beaucoup de mots doublent la consonne devant **-e** : **-enne** (*ancienne*), **-onne** (*bonne*), **-elle** (*naturelle*), **-eille** (*pareille*), **-ette** (*muette, nette, violette*), ainsi que **belle, nouvelle, vieille, folle**. En revanche, huit mots en **-et** prennent **è** et **un seul t** : **complète, incomplète, concrète, discrète, indiscrète, inquiète, secrète, désuète**.'), {
        ex: [['La liste officielle est enfin complète.', 'The official list is finally complete.'], ['Une personne discrète garde une réponse secrète.', 'A discreet person keeps a secret answer.'], ['Elle porte une nouvelle robe violette.', 'She is wearing a new purple dress.']],
      }),
      trap(b('Never write « complettes » or « inquiètes » with two t’s!', 'Jamais « complette » ni « inquiette » !'), b('Remember: a **single** consonant follows **è** (**complète, discrète, inquiète, secrète, concrète**), while **two** consonants never allow an accent (**muette, nette, violette**)!', 'Règle visuelle infaillible : **è** = **un seul t** (**complète, discrète, inquiète, secrète, concrète**) ; **deux t** = **jamais d’accent** (**muette, nette, violette**) !')),
      sort(b('Feminine in -ette or -ète?', 'Féminin en -ette ou en -ète ?'), ['-ette (double t)', '-ète (accent grave)'], [['muet', 0], ['complet', 1], ['violet', 0], ['discret', 1], ['net', 0], ['inquiet', 1]]),
      mc(P.spelling, ['Une explication nette, complète et concrète.', 'Une explication nète, complette et concrette.', 'Une explication nette, complette et concrète.', 'Une explication nète, complète et concrette.']),
      mc(P.spelling, ['Cette musicienne italienne reste discrète malgré son ancienne gloire.', 'Cette musicienne italiène reste discrette malgré son anciène gloire.', 'Cette musicienne italienne reste discrette malgré son ancienne gloire.', 'Cette musicienne italiène reste discrète malgré son anciène gloire.']),
      gap(P.complete, 'La ___ (nouveau) voisine est ___ (inquiet) car sa fiche est ___ (incomplet), mais sa voix reste ___ (bon).', ['nouvelle', 'inquiète', 'incomplète', 'bonne'], { strict: true }),
      dict('La vieille dame discrète garde une boîte violette et secrète.', { voice: 'f', strict: true }),
    ],
    [
      b('Double consonant before -e: -enne, -onne, -elle, -eille, -ette (muette, nette, violette).', 'Consonne double devant -e : -enne, -onne, -elle, -eille, -ette (muette, nette, violette).'),
      b('Single t with è: complète, incomplète, concrète, discrète, indiscrète, inquiète, secrète.', 'Un seul t avec è : complète, incomplète, concrète, discrète, indiscrète, inquiète, secrète.'),
      b('No accent before double consonants: never combine è with tt.', 'Jamais d’accent devant consonne double : jamais è devant tt.'),
    ],
    [['discret, discrète', b('discreet, quiet', 'qui sait se taire, peu voyant')], ['inquiet, inquiète', b('worried, anxious', 'qui a de l’inquiétude')], ['concret, concrète', b('concrete, tangible', 'réel, précis')]],
  ),
];
