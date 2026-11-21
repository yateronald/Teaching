import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, pairs, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Thousands of French nouns are built with a small set of endings: -tion, -sion, -ment, -age, -té, -eur, -oir, -oire, -ée. Knowing how to spell these endings, and the gender they usually carry, is one of the most efficient ways to improve both your spelling and your grammar. This course groups the endings by sound and teaches the reliable patterns and the main exceptions (la plage, le lycée, le bonheur).',
    'Des milliers de noms français sont construits avec un petit ensemble de terminaisons : -tion, -sion, -ment, -age, -té, -eur, -oir, -oire, -ée. Savoir écrire ces terminaisons, et connaître le genre qu’elles portent généralement, est l’un des moyens les plus efficaces d’améliorer à la fois l’orthographe et la grammaire. Ce cours regroupe les terminaisons par son et enseigne les régularités fiables et les principales exceptions (la plage, le lycée, le bonheur).',
  ),
  outcomes: [
    b('Spell -tion, -sion, -ssion', 'Écrire -tion, -sion, -ssion'),
    b('Spell -ment, -age, -té, -ée', 'Écrire -ment, -age, -té, -ée'),
    b('Spell -eur, -oir, -oire', 'Écrire -eur, -oir, -oire'),
    b('Guess the gender from the ending', 'Deviner le genre grâce à la terminaison'),
  ],
};

const C = 'sp-word-endings';
export default [
  lesson(C, 1, ['tion-sion-ssion', 'tion-sion-ssion'],
    b('-tion, -sion, -ssion', '-tion, -sion, -ssion'),
    b('Spell the [sjɔ̃] and [zjɔ̃] endings, all feminine.', 'Écrire les terminaisons [sjɔ̃] et [zjɔ̃], toutes féminines.'),
    [b('Use -tion, the most frequent', 'Utiliser -tion, la plus fréquente'), b('Use -sion after l, r and for [zjɔ̃]', 'Utiliser -sion après l, r et pour [zjɔ̃]'), b('Use -ssion from verbs in -tre/-der', 'Utiliser -ssion venant de verbes en -tre/-der')],
    13,
    [
      card(b('Three spellings, one gender', 'Trois graphies, un genre'), b('All are **feminine**. **-tion** (most frequent): **la nation, l’information, la question**. **-sion** after **l, r** or for the sound **[zjɔ̃]**: **la version, l’expulsion, la télévision, la décision**. **-ssion** often comes from verbs in **-ttre, -der, -éder**: **permettre → la permission, discuter → la discussion, posséder → la possession**.', 'Toutes **féminines**. **-tion** (la plus fréquente) : **la nation, l’information, la question**. **-sion** après **l, r** ou pour le son **[zjɔ̃]** : **la version, l’expulsion, la télévision, la décision**. **-ssion** vient souvent de verbes en **-ttre, -der, -éder** : **permettre → la permission, discuter → la discussion, posséder → la possession**.')),
      sort(b('-tion, -sion or -ssion?', '-tion, -sion ou -ssion ?'), [b('-tion', '-tion'), b('-sion', '-sion'), b('-ssion', '-ssion')], [['l’informa…', 0], ['la déci…', 1], ['la permi…', 2], ['la répéti…', 0], ['la télévi…', 1], ['la discu…', 2]]),
      mc(P.spelling, ['une décision', 'une décission', 'une décition', 'une décizion']),
      gap(P.complete, 'J’ai une ques___ sur la répéti___ de la discu___ .', ['tion', 'tion', 'ssion'], { strict: true }),
      dict('La télévision a annoncé une décision importante après une longue discussion.', { strict: true }),
      pairs(P.match, [['permettre', 'la permission'], ['décider', 'la décision'], ['informer', 'l’information'], ['discuter', 'la discussion']], true),
    ],
    [
      b('-tion is the default; all these nouns are feminine.', '-tion par défaut ; tous ces noms sont féminins.'),
      b('-sion after l, r, or for [zjɔ̃] (télévision).', '-sion après l, r, ou pour [zjɔ̃] (télévision).'),
      b('-ssion from -ttre, -der verbs (permission, discussion).', '-ssion des verbes en -ttre, -der (permission, discussion).'),
    ],
    [['une décision', b('a decision', 'choix')], ['une permission', b('a permission', 'autorisation')], ['annoncer', b('to announce', 'faire savoir')]],
  ),
  lesson(C, 2, ['ment-age-te-ee', 'ment-age-te-ee'],
    b('-ment, -age, -té, -ée', '-ment, -age, -té, -ée'),
    b('Spell these endings and remember their usual gender.', 'Écrire ces terminaisons et retenir leur genre habituel.'),
    [b('-ment and -age: usually masculine', '-ment et -age : généralement masculins'), b('-té: feminine, no final e', '-té : féminin, sans e final'), b('-ée: feminine nouns with exceptions', '-ée : noms féminins, avec exceptions')],
    13,
    [
      card(b('Endings and gender', 'Terminaisons et genre'), b('**-ment** (noun) → masculine: **le moment, le gouvernement**. **-age** → masculine: **le fromage, le voyage, le garage** (exceptions: **la plage, la page, l’image, la cage, la nage, la rage**). **-té** → feminine, **no final e**: **la liberté, la société, la beauté** (but **la dictée, la montée** have -ée). **-ée** → feminine: **l’année, la journée, l’idée** (exceptions: **le musée, le lycée, le trophée**).', '**-ment** (nom) → masculin : **le moment, le gouvernement**. **-age** → masculin : **le fromage, le voyage, le garage** (exceptions : **la plage, la page, l’image, la cage, la nage, la rage**). **-té** → féminin, **sans e final** : **la liberté, la société, la beauté** (mais **la dictée, la montée** ont -ée). **-ée** → féminin : **l’année, la journée, l’idée** (exceptions : **le musée, le lycée, le trophée**).')),
      trap(b('-té without e', '-té sans e'), b('Feminine nouns in **-té** or **-tié** have **no final e**: **la liberté, l’amitié, la moitié**. Exceptions: nouns of quantity/content: **la dictée, la montée, la portée, la pâtée, la jetée**.', 'Les noms féminins en **-té** ou **-tié** n’ont **pas de e final** : **la liberté, l’amitié, la moitié**. Exceptions : noms exprimant un contenu ou une action : **la dictée, la montée, la portée, la jetée**.')),
      sort(b('Masculine or feminine?', 'Masculin ou féminin ?'), [b('masculine (le)', 'masculin (le)'), b('feminine (la)', 'féminin (la)')], [['… voyage', 0], ['… plage', 1], ['… musée', 0], ['… société', 1], ['… moment', 0], ['… journée', 1]]),
      mc(P.spelling, ['la liberté', 'la libertée', 'la libertè', 'la libretée']),
      gap(P.complete, 'Cette ann___ , nous avons visité un mus___ et nous avons passé une journée à la plage pour l’amiti___ .', ['ée', 'ée', 'é'], { strict: true }),
      dict('Pendant le voyage, nous avons visité un musée et passé une belle journée à la plage.', { strict: true }),
    ],
    [
      b('-ment, -age → masculine (except la plage, la page, l’image…).', '-ment, -age → masculin (sauf la plage, la page, l’image…).'),
      b('-té / -tié → feminine, no final e (sauf la dictée, la montée…).', '-té / -tié → féminin, sans e final (sauf la dictée, la montée…).'),
      b('-ée → feminine (except le musée, le lycée…).', '-ée → féminin (sauf le musée, le lycée…).'),
    ],
    [['la moitié', b('half', 'une des deux parts')], ['le gouvernement', b('the government', 'les ministres')], ['un lycée', b('a high school', 'école secondaire')]],
  ),
  lesson(C, 3, ['eur-oir-oire', 'eur-oir-oire'],
    b('-eur, -oir, -oire', '-eur, -oir, -oire'),
    b('Spell the endings without adding an e where it doesn’t belong.', 'Écrire ces terminaisons sans ajouter de e inutile.'),
    [b('-eur without e (except 3 words)', '-eur sans e (sauf 3 mots)'), b('-oir masculine, -oire feminine (mostly)', '-oir masculin, -oire féminin (en général)'), b('Learn the masculine -oire words', 'Apprendre les noms masculins en -oire')],
    13,
    [
      card(b('-eur, -oir, -oire', '-eur, -oir, -oire'), b('**-eur**: no final e, even when feminine: **la peur, la fleur, la couleur, le bonheur, l’erreur**. Only 3 exceptions: **le beurre, la demeure, l’heure**. **-oir**: masculine nouns: **le soir, le miroir, le couloir, l’espoir**. **-oire**: mostly feminine: **l’histoire, la mémoire, la victoire**; but masculine: **le laboratoire, le répertoire, le territoire, l’accessoire, le pourboire**.', '**-eur** : pas de e final, même au féminin : **la peur, la fleur, la couleur, le bonheur, l’erreur**. Seulement 3 exceptions : **le beurre, la demeure, l’heure**. **-oir** : noms masculins : **le soir, le miroir, le couloir, l’espoir**. **-oire** : surtout féminins : **l’histoire, la mémoire, la victoire** ; mais masculins : **le laboratoire, le répertoire, le territoire, l’accessoire, le pourboire**.')),
      mc(P.spelling, ['une erreur', 'une erreure', 'une ereur', 'une erreurre']),
      mc(P.spelling, ['le couloir', 'le couloire', 'le coulois', 'le couloar']),
      sort(b('-oir or -oire?', '-oir ou -oire ?'), [b('-oir', '-oir'), b('-oire', '-oire')], [['le mir…', 0], ['l’hist…', 1], ['le dev…', 0], ['la vict…', 1], ['l’esp…', 0], ['le laborat…', 1]]),
      gap(P.complete, 'Ce s___ , j’ai eu peur dans le coul___ sombre, mais j’ai gardé l’esp___ .', ['oir', 'oir', 'oir'], { strict: true }),
      dict('Quelle erreur ! J’ai oublié le beurre et les fleurs pour ce soir.', { strict: true, hint: b('beurre is one of the 3 -eure exceptions.', 'beurre fait partie des 3 exceptions en -eure.') }),
    ],
    [
      b('-eur: no e (la peur, la couleur) except beurre, demeure, heure.', '-eur : pas de e (la peur, la couleur) sauf beurre, demeure, heure.'),
      b('-oir: masculine (le soir, le miroir).', '-oir : masculin (le soir, le miroir).'),
      b('-oire: mostly feminine, but le laboratoire, le territoire, le pourboire.', '-oire : surtout féminin, mais le laboratoire, le territoire, le pourboire.'),
    ],
    [['le couloir', b('the corridor', 'passage intérieur')], ['l’espoir', b('hope', 'attente confiante')], ['un pourboire', b('a tip', 'argent laissé au serveur')]],
  ),
];
