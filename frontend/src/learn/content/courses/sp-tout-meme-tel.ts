import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Some of French spelling’s sharpest B2 traps involve five tiny words whose agreement changes depending on their exact grammatical role and position: tout (toute petite vs tout étonnée vs tout autre), même (les mêmes idées vs eux-mêmes vs même les enfants), tel (tel que agreeing with what precedes it), demi (une demi-heure vs une heure et demie) and nu (nu-pieds vs pieds nus). This course equips you to handle every single case reliably.',
    'Cinq petits mots concentrent les pièges les plus subtils de l’orthographe de niveau B2 : tout (toute petite ou tout étonnée ou tout autre), même (les mêmes idées, eux-mêmes ou même les enfants), tel (tel que accordé avec ce qui précède), demi (une demi-heure ou une heure et demie) et nu (nu-pieds ou pieds nus). Ce cours vous apprend à trancher sans hésitation selon la place et la nature du mot.',
  ),
  outcomes: [
    b('Apply the phonetic rule for adverbial tout (toute petite vs tout étonnée vs tout honteuse)', 'Appliquer la règle phonétique de tout adverbe (toute petite, tout étonnée, tout honteuse)'),
    b('Distinguish adjectival même (agrees) from adverbial même (invariable)', 'Distinguer même adjectif (variable) de même adverbe (invariable)'),
    b('Agree tel and tel que accurately with the right antecedent', 'Accorder tel et tel que avec le bon terme'),
    b('Master position-based agreement for demi, nu and ci-joint', 'Maîtriser l’accord selon la place pour demi, nu et ci-joint'),
  ],
};

const C = 'sp-tout-meme-tel';
export default [
  lesson(C, 1, ['tout-and-meme-agreement', 'accord-de-tout-et-meme'],
    b('Tout & même: adjective vs adverb', 'Tout et même : adjectif ou adverbe'),
    b('Master the phonetic rule for tout and know when même takes -s.', 'Maîtriser la règle phonétique de tout et savoir quand même prend un -s.'),
    [b('Handle tout before vowel, silent h and aspirated h', 'Gérer tout devant voyelle, h muet et h aspiré'), b('Distinguish tout autre (completely different) from toute autre (any other)', 'Distinguer tout autre (tout à fait autre) de toute autre (n’importe quelle autre)'), b('Know when même agrees (les mêmes, eux-mêmes) or stays invariable', 'Savoir quand même s’accorde ou reste invariable')],
    13,
    [
      card(b('Tout (adverb) and même', 'Tout (adverbe) et même'), b('As an adverb (= *tout à fait*), **tout** stays invariable (**ils sont tout contents, elle est tout étonnée, elle est tout heureuse** — silent *h*!) EXCEPT before a **feminine** adjective starting with a **consonant or aspirated h**: **elle est toute contente, elles sont toutes petites, elles sont toutes honteuses**. **Même** agrees before a noun or pronoun (**les mêmes causes, les dieux mêmes, nous-mêmes**), and stays invariable as an adverb (= *even*): **même les enfants, ils ont même ri**.', 'Adverbe (= *tout à fait*), **tout** est invariable (**ils sont tout contents, elle est tout étonnée, elle est tout heureuse** — *h* muet !) SAUF devant un adjectif **féminin** commençant par une **consonne ou un h aspiré** : **elle est toute contente, elles sont toutes petites, elles sont toutes honteuses**. **Même** s’accorde devant un nom ou après un pronom (**les mêmes causes, nous-mêmes**), et reste invariable adverbe (= *y compris*) : **même les enfants**.'), {
        ex: [['Elles étaient tout émues, mais toutes contentes de nous voir.', 'They were very moved, yet really happy to see us.'], ['Même les meilleurs athlètes font parfois les mêmes erreurs.', 'Even the best athletes sometimes make the same mistakes.'], ['C’est une tout autre histoire.', 'That’s a completely different story.']],
      }),
      trap(b('« Tout autre » vs « toute autre »', '« Tout autre » ou « toute autre »'), b('Before **autre + noun**: if **tout** means *completely* (= *tout à fait autre*), it is invariable (**C’est une tout autre question**). If it means *any* (= *n’importe quelle autre*), it agrees (**Toute autre solution est exclue**).', 'Devant **autre + nom** : s’il signifie *tout à fait*, il est adverbe invariable (**une tout autre question**). S’il signifie *n’importe quelle*, il s’accorde (**toute autre solution**).')),
      sort(b('Tout / même: agrees or invariable?', 'Tout / même : variable ou invariable ?'), [b('agrees (toute / toutes / mêmes)', 'variable (toute / toutes / mêmes)'), b('invariable (tout / même)', 'invariable (tout / même)')], [['elle est … surprise', 0], ['elles sont … étonnées', 1], ['… les experts hésitent', 1], ['les … erreurs reviennent', 0], ['elles sont … honteuses', 0], ['une … autre méthode (tout à fait)', 1]]),
      mc(P.spelling, ['Elles sont tout émues, toutes rouges et tout heureuses.', 'Elles sont toutes émues, tout rouges et toutes heureuses.', 'Elles sont toutes émues, toutes rouges et toutes heureuses.', 'Elles sont tout émues, tout rouges et tout heureuses.']),
      mc(P.spelling, ['Les collègues eux-mêmes ont constaté les mêmes progrès, même le soir.', 'Les collègues eux-même ont constaté les même progrès, mêmes le soir.', 'Les collègues eux-mêmes ont constaté les mêmes progrès, mêmes le soir.', 'Les collègues eux-même ont constaté les mêmes progrès, même le soir.']),
      gap(P.complete, '___ (même) nos voisines étaient ___ (tout) surprises et ___ (tout) heureuses de recevoir les ___ (même) invitations.', ['Même', 'toutes', 'tout', 'mêmes'], { strict: true }),
      dict('Elles étaient tout émues, mais elles ont préparé les mêmes recettes elles-mêmes.', { voice: 'f', strict: true }),
    ],
    [
      b('Adverb tout agrees ONLY before a feminine adjective starting with a consonant or aspirated h (toute petite, toutes honteuses).', 'tout adverbe ne s’accorde que devant un féminin à consonne ou h aspiré (toute petite, toutes honteuses).'),
      b('Before a vowel or silent h: tout étonnée, tout heureuse.', 'Devant voyelle ou h muet : tout étonnée, tout heureuse.'),
      b('même = adjective/pronoun → agrees (les mêmes, eux-mêmes); adverb (“even”) → invariable.', 'même adjectif/pronom → s’accorde (les mêmes, eux-mêmes) ; adverbe (« y compris ») → invariable.'),
    ],
    [['ému, émue', b('moved, touched', 'troublé par une émotion')], ['honteux, honteuse', b('ashamed (aspirated h)', 'qui ressent de la honte')], ['une tout autre affaire', b('a completely different matter', 'tout à fait autre')]],
  ),
  lesson(C, 2, ['tel-and-tel-que', 'accord-de-tel-et-tel-que'],
    b('Tel & tel que: look backward, not forward!', 'Tel et tel que : regarder en arrière'),
    b('Agree tel as a determiner or predicate and master the classic tel que agreement rule.', 'Accorder tel déterminant ou attribut et maîtriser la règle d’accord de tel que.'),
    [b('Agree tel(le)(s) with the noun it introduces', 'Accorder tel(le)(s) avec le nom qu’il introduit'), b('Agree tel que with the noun BEFORE que, not after', 'Accorder tel que avec le nom qui précède, jamais avec ce qui suit'), b('Agree both words in tel quel (telle quelle, tels quels)', 'Accorder les deux mots dans tel quel')],
    13,
    [
      card(b('Two key rules for tel', 'Deux règles nettes pour tel'), b('1. **Tel** agrees with its noun: **un tel courage, une telle énergie, de tels efforts, de telles mesures**. 2. **Tel que** (= *such as*) ALWAYS agrees with the **noun BEFORE it** — NEVER with the examples that follow! Write **Des villes telles que Lyon et Nice** (*telles* = *villes*), **Un fruit tel que la pomme ou la poire** (*tel* = *un fruit*!). 3. **Tel quel** (*as is*) agrees with the noun it describes: **La pièce est restée telle quelle. Les notes sont publiées telles quelles.**', '1. **Tel** s’accorde avec son nom : **un tel courage, une telle énergie, de tels efforts, de telles mesures**. 2. **Tel que** (= *comme*) s’accorde TOUJOURS avec le **nom qui précède**, JAMAIS avec la suite ! Écrivez **Des villes telles que Lyon et Nice** (*villes*), **Un fruit tel que la pomme ou la poire** (*un fruit*). 3. **Tel quel** s’accorde avec le nom auquel il se rapporte : **La pièce reste telle quelle. Les notes sont publiées telles quelles.**'), {
        ex: [['Des pays tels que la France et la Suisse…', 'Countries such as France and Switzerland…'], ['Un écrivain tel que Victor Hugo…', 'A writer such as Victor Hugo…'], ['Nous laissons la maison telle quelle.', 'We’re leaving the house as is.']],
      }),
      trap(b('Never « tel » matching the word after « que »!', 'Ne vous laissez pas piéger par le mot après « que » !'), b('In **Un métal précieux tel que l’argent ou le platine**, **tel** is masculine singular (*un métal*). In **Des sports tels que la natation**, **tels** is masculine plural (*des sports*), even though *la natation* is feminine singular!', 'Dans **Des sports tels que la natation**, on écrit **tels** (masculin pluriel comme *des sports*), même si *la natation* est féminin singulier !')),
      pairs(P.match, [['des fruits tels que la pomme', b('masculine plural (fruits)', 'accord avec fruits')], ['une ville telle que Marseille', b('feminine singular (ville)', 'accord avec ville')], ['un arbre tel que le chêne ou le pin', b('masculine singular (arbre)', 'accord avec arbre')], ['des clauses restées telles quelles', b('feminine plural (clauses)', 'accord double de tel quel')]]),
      mc(P.spelling, ['Des spécialités telles que la bouillabaisse et le cassoulet attirent les visiteurs.', 'Des spécialités tel que la bouillabaisse et le cassoulet attirent les visiteurs.', 'Des spécialités telle que la bouillabaisse et le cassoulet attirent les visiteurs.', 'Des spécialités tels que la bouillabaisse et le cassoulet attirent les visiteurs.']),
      mc(P.spelling, ['De telles réussites méritent les archives conservées telles quelles.', 'De telle réussites méritent les archives conservées tel quelles.', 'De tels réussites méritent les archives conservées telles quelles.', 'De telles réussites méritent les archives conservées tel quel.']),
      gap(P.complete, 'Un légume ___ que la carotte contient ___ vitamines ; ces données restent ___ quelles.', ['tel', 'de telles', 'telles'], { choices: [['tel', 'telle', 'tels'], ['de telles', 'de telle', 'telles'], ['telles', 'tel', 'telle']], strict: true }),
      dict('Une telle qualité se retrouve dans des œuvres telles que la sculpture et la peinture.', { voice: 'm', strict: true }),
    ],
    [
      b('tel / telle / tels / telles agree with the noun they introduce or modify.', 'tel / telle / tels / telles s’accordent avec le nom qu’ils déterminent ou qualifient.'),
      b('tel que agrees with the noun BEFORE it (des sports tels que la natation).', 'tel que s’accorde avec le nom qui précède (des sports tels que la natation).'),
      b('tel quel agrees both words with its noun: telle quelle, tels quels, telles quelles.', 'tel quel accorde ses deux mots : telle quelle, tels quels, telles quelles.'),
    ],
    [['tel quel', b('as is, unchanged', 'sans modification')], ['une donnée', b('a piece of data', 'information chiffrée ou factuelle')], ['attirer', b('to attract', 'faire venir à soi')]],
  ),
  lesson(C, 3, ['demi-nu-and-ci-joint', 'demi-nu-et-ci-joint'],
    b('Demi, nu & ci-joint: position decides', 'Demi, nu et ci-joint : la place décide'),
    b('Apply the before/after rule for demi, nu and ci-joint without mixing up singular and plural.', 'Appliquer la règle avant/après pour demi, nu et ci-joint.'),
    [b('Keep demi- and nu- invariable with a hyphen before a noun', 'Laisser demi- et nu- invariables avec trait d’union devant un nom'), b('Agree demi (gender only!) and nu (gender + number) after a noun', 'Accorder demi (genre seul !) et nu (genre + nombre) après un nom'), b('Handle ci-joint and ci-inclus before vs after the noun', 'Accorder ci-joint et ci-inclus selon leur place')],
    13,
    [
      card(b('Before the noun: invariable. After: agrees!', 'Avant le nom : invariable. Après : accord !'), b('**Before the noun** (with a hyphen): **demi-** and **nu-** are **invariable**: **une demi-heure, des demi-journées, nu-pieds, nu-tête** (also **à demi mort, à mi-chemin, semi-rigide**). **After the noun**: **demi** takes **-e** for feminine, **never -s** (**une heure et demie, trois heures et demie, deux jours et demi**); **nu** agrees fully (**pieds nus, tête nue, à mains nues**). **Ci-joint / ci-inclus**: invariable before a bare noun or at the start (**Ci-joint la facture**), agrees after a noun (**la facture ci-jointe, les pièces ci-incluses**).', '**Devant le nom** (avec trait d’union) : **demi-** et **nu-** sont **invariables** : **une demi-heure, des demi-journées, nu-pieds, nu-tête** (aussi **à demi mort, à mi-chemin, semi-rigide**). **Après le nom** : **demi** prend **-e** au féminin, **jamais de -s** (**une heure et demie, trois heures et demie**) ; **nu** s’accorde en genre et en nombre (**pieds nus, tête nue**). **Ci-joint / ci-inclus** : invariables au début ou devant un nom sans article (**Ci-joint la facture**), variables après le nom (**la facture ci-jointe**).'), {
        table: { head: [b('word', 'mot'), b('before noun', 'avant le nom'), b('after noun', 'après le nom')], rows: [['demi', 'une demi-heure', 'trois heures et demie'], ['nu', 'marcher nu-pieds', 'marcher pieds nus'], ['ci-joint', 'Ci-joint les pièces.', 'les pièces ci-jointes']] },
      }),
      trap(b('Never « trois heures et demies » with -s!', 'Jamais « trois heures et demies » avec -s !'), b('After **et**, **demi** modifies one half (*une demie*), so it NEVER takes **-s**, even after plural hours: **deux heures et demie**, **quatre livres et demi**. Only the noun *un demi / deux demis* takes **-s**.', 'Après **et**, **demi** ne prend **jamais de -s**, seulement **-e** au féminin : **deux heures et demie**, **cinq jours et demi**.')),
      sort(b('Invariable or agrees?', 'Invariable ou accord ?'), [b('invariable (no -e/-s)', 'invariable'), b('agrees', 's’accorde')], [['une …-douzaine (demi)', 0], ['deux heures et … (demi)', 1], ['courir …-pieds (nu)', 0], ['courir pieds … (nu)', 1], ['… la copie (ci-joint)', 0], ['les lettres … (ci-joint)', 1]]),
      mc(P.spelling, ['Nous avons marché pieds nus pendant deux heures et demie.', 'Nous avons marché pieds nu pendant deux heures et demies.', 'Nous avons marché pied nus pendant deux heures et demi.', 'Nous avons marché pieds nus pendant deux heures et demies.']),
      mc(P.spelling, ['Ci-joint copie du contrat, et veuillez signer les feuilles ci-jointes.', 'Ci-jointe copie du contrat, et veuillez signer les feuilles ci-joint.', 'Ci-joints copie du contrat, et veuillez signer les feuilles ci-jointes.', 'Ci-joint copie du contrat, et veuillez signer les feuilles ci-joint.']),
      gap(P.complete, 'En une ___-heure, il a traversé la plage ___-pieds et marché deux heures et ___ sur les galets ___ (nu).', ['demi', 'nu', 'demie', 'nus'], { choices: [['demi', 'demie'], ['nu', 'nus'], ['demie', 'demi', 'demies'], ['nus', 'nu']], strict: true }),
      dict('Ci-joint la liste attendue depuis une heure et demie ; ils travaillent à mains nues.', { voice: 'f', strict: true }),
      say('Nous avons attendu une demi-heure, puis une heure et demie devant les portes.', 'We waited half an hour, then an hour and a half in front of the doors.'),
    ],
    [
      b('Before a noun (+ hyphen): demi- and nu- are invariable (une demi-heure, nu-pieds).', 'Devant un nom (+ trait d’union) : demi- et nu- sont invariables (une demi-heure, nu-pieds).'),
      b('After a noun: demi agrees in gender only (trois heures et demie — never -s); nu agrees fully (pieds nus).', 'Après un nom : demi varie en genre seulement (trois heures et demie) ; nu s’accorde (pieds nus).'),
      b('ci-joint / ci-inclus: invariable before a bare noun or sentence-initial; agrees after a noun.', 'ci-joint / ci-inclus : invariables en tête ou devant un nom sans déterminant ; variables après le nom.'),
    ],
    [['à mi-chemin', b('halfway', 'à moitié route')], ['à mains nues', b('bare-handed', 'sans outil ni gant')], ['ci-inclus', b('enclosed, attached', 'joint au présent envoi')]],
  ),
];
