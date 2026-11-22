import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, pairs, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At C2 level, advanced spelling meets history and etymology. French academic, literary and scientific vocabulary preserves Greek roots (ph, th, ch [k], rh, y as in chrysanthème, rythme, asphyxie), unexpected double consonants or single consonants (dilemme, occurrence, imbécile, apercevoir), false Latin spellings (poids, legs), and rare foreign plurals. This C2 course sharpens your eye for etymological patterns so even the hardest learned words become predictable.',
    'Au niveau C2, l’orthographe rejoint l’histoire des mots et l’étymologie. Le lexique savant, littéraire et scientifique conserve des racines grecques (ph, th, ch [k], rh, y dans chrysanthème, rythme, asphyxie), des consonnes simples ou doubles inattendues (dilemme, occurrence, imbécile, apercevoir), des graphies héritées (poids, legs) et des pluriels savants. Ce cours C2 vous donne les clés étymologiques des mots les plus exigeants.',
  ),
  outcomes: [
    b('Decode and spell Greek roots with ph, th, ch, rh and y', 'Décoder et écrire les racines grecques en ph, th, ch, rh et y'),
    b('Avoid double-consonant traps in learned words (dilemme, occurrence, imbécile, apercevoir)', 'Éviter les pièges de consonnes doubles (dilemme, occurrence, imbécile, apercevoir)'),
    b('Spell rare words and false etymologies (poids, legs, puits, hémorragie, abscisse)', 'Écrire les mots rares et graphies particulières (poids, legs, puits, hémorragie, abscisse)'),
    b('Form French and scholarly plurals (scénarios, quiproquos, maximums, post-scriptum)', 'Former les pluriels des emprunts savants (scénarios, quiproquos, maximums, post-scriptum)'),
  ],
};

const C = 'sp-archaic-learned-words';
export default [
  lesson(C, 1, ['greek-roots-ph-th-ch-y', 'racines-grecques-ph-th-ch-y'],
    b('Greek roots: ph, th, ch, rh and y', 'Racines grecques : ph, th, ch, rh et y'),
    b('Master the classic Greek consonant clusters and y-spellings in learned French.', 'Maîtriser les groupes consonantiques grecs et les mots savants avec y.'),
    [b('Spell Greek ph, th, ch [k] and y compounds', 'Écrire les composés grecs en ph, th, ch [k] et y'), b('Spot where rh belongs (rhumatisme, rhétorique) vs where it does not (rythme)', 'Savoir où placer rh (rhumatisme, rhétorique) et où l’éviter (rythme)'), b('Use Greek roots to unlock unfamiliar learned words', 'Déduire l’orthographe grâce aux racines grecques')],
    13,
    [
      card(b('Greek markers in French spelling', 'Les marques du grec en français'), b('Words borrowed from Ancient Greek preserve four visual markers: **ph** [f] (*philosophie, cacophonie, asphyxie*), **th** [t] (*sympathie, synthèse, hypothèse, labyrinthe*), **ch** [k] (*chronologie, anachronisme, chaos, chrysanthème*), **y** (*mythologie, acronyme, rythme, analyse*), and **rh** (*rhumatisme, rhétorique, rhinocéros, hémorragie* — note **rr** + **h** inside *hémorragie*!).', 'Les mots issus du grec ancien gardent quatre repères : **ph** [f] (*philosophie, cacophonie, asphyxie*), **th** [t] (*sympathie, synthèse, hypothèse, labyrinthe*), **ch** [k] (*chronologie, anachronisme, chrysanthème*), **y** (*mythologie, acronyme, rythme*) et **rh** (*rhumatisme, rhétorique, rhinocéros, hémorragie* — notez **rr** + **h** dans *hémorragie* !).'), {
        ex: [['Un chrysanthème fleurit en automne malgré le rhumatisme.', 'A chrysanthemum blooms in autumn despite rheumatism.'], ['L’anachronisme rompt le rythme de cette synthèse.', 'The anachronism breaks the rhythm of this synthesis.']],
      }),
      trap(b('« Rythme » has NO h after r!', '« Rythme » n’a PAS de h après r !'), b('One of the most frequent C2 slips is writing « rhythme » as in English. In French, **rythme** begins simply with **ry-** and puts the **h** after **t**: **r-y-t-h-m-e**! Compare **rythme** (no *rh*) with **rhétorique** and **rhumatisme** (*rh*). Likewise, write **sympathie** (**m** before **p** + **y** + **th**) and **asphyxie** (**ph** + **y**).', 'Piège classique dû à l’anglais : en français, **rythme** s’écrit sans **h** après le **r** (**r-y-t-h-m-e**), à la différence de **rhétorique** et **rhumatisme**. Retenez aussi **sympathie** (*m* devant *p* + *y* + *th*) et **chrysanthème** (*ch + y + th*).')),
      pairs(P.match, [['chrono- (chronologie)', b('time', 'temps')], ['ortho- (orthographe)', b('right, straight', 'droit, correct')], ['sym- / syn- (synthèse)', b('together, with', 'avec, ensemble')], ['anth- (chrysanthème)', b('flower', 'fleur')]]),
      mc(P.spelling, ['Ce chrysanthème symbolise le rythme d’une hypothèse originale.', 'Ce crysanthème symbolise le rhythme d’une hipothèse originale.', 'Ce chrysanthème symbolise le rhythme d’une hypothèse originale.', 'Ce chysanthème symbolise le rythme d’une hypothèse originale.']),
      mc(P.spelling, ['La rhétorique évite la cacophonie et l’anachronisme dans le labyrinthe des idées.', 'La rétorique évite la cacophonie et l’anakronisme dans le labirinthe des idées.', 'La rhétorique évite la cacofonie et l’anachronisme dans le labyrinthe des idées.', 'La rhétorique évite la caccophonie et l’anachronisme dans le labyrinthe des idées.']),
      gap(P.complete, 'Par ___, elle a rédigé une ___ sur la ___ et le ___ poétique.', ['sympathie', 'synthèse', 'chronologie', 'rythme'], { choices: [['sympathie', 'synpathie', 'simpathie'], ['synthèse', 'sinthèse', 'syntèse'], ['chronologie', 'cronologie', 'chronollogie'], ['rythme', 'rhythme', 'rithme']], strict: true }),
      dict('Ce chrysanthème résiste au rythme des saisons et illustre votre hypothèse.', { voice: 'f', strict: true }),
    ],
    [
      b('Greek markers: ph [f], th [t], ch [k] (chrysanthème, chronologie), y (acronyme, labyrinthe), rh (rhétorique).', 'Marques grecques : ph [f], th [t], ch [k] (chrysanthème), y (acronyme, labyrinthe), rh (rhétorique).'),
      b('French writes rythme (NOT rhythme) and hémorragie (h + double r + h).', 'En français : rythme (sans h après r) et hémorragie (h + rr + h).'),
      b('Watch m before p in sympathie and chrysanthème (-an- + th).', 'Attention à sympathie (m devant p) et chrysanthème (an + th).'),
    ],
    [['un chrysanthème', b('a chrysanthemum', 'fleur d’automne')], ['une hypothèse', b('a hypothesis', 'supposition à vérifier')], ['un anachronisme', b('an anachronism', 'erreur de chronologie')]],
  ),
  lesson(C, 2, ['double-consonants-and-learned-traps', 'consonnes-doubles-et-pieges-savants'],
    b('Double consonants & learned traps', 'Consonnes doubles et pièges savants'),
    b('Lock in high-level consonant spellings: dilemme, occurrence, imbécile, apercevoir, succinct.', 'Fixer les consonnes simples ou doubles des mots savants : dilemme, occurrence, imbécile, apercevoir.'),
    [b('Spell dilemme (mm) vs indemne (mn)', 'Écrire dilemme (mm) contre indemne (mn)'), b('Master double vs single consonants (occurrence, concurrence, imbécile, parallèle)', 'Maîtriser consonnes simples et doubles (occurrence, concurrence, imbécile, parallèle)'), b('Know ap- single-p verbs (apercevoir, apaiser, aplanir)', 'Connaître les verbes en ap- simple (apercevoir, apaiser, aplanir)')],
    13,
    [
      card(b('Single or double consonant? Classic C2 traps', 'Consonne simple ou double ? Les pièges du C2'), b('Many educated speakers stumble on these pairs: **un dilemme** (**mm**, NEVER « dilemne »!) vs **indemne** (**mn**); **une occurrence** (**cc** + **rr**), **la récurrence** (**rr**) vs **la concurrence** (one **r**!); **parallèle** (**ll** then single **l**); **solliciter** (**ll**, single **t**); **belliqueux** (**ll**); **succinct** (**cc** + **ct**); **imbécile** (single **l**); **apercevoir, apaiser, aplanir, aplatir** (single **p**, unlike *apporter, applaudir*).', 'Même des locuteurs cultivés hésitent sur ces mots : **un dilemme** (**mm**, jamais « dilemne » !) contre **indemne** (**mn**) ; **occurrence** (**cc + rr**), **récurrence** (**rr**) contre **concurrence** (un seul **r**) ; **parallèle** (**ll** puis **l**) ; **solliciter** (**ll**, un **t**) ; **belliqueux** (**ll**) ; **succinct** (**cc + ct**) ; **imbécile** (un **l**) ; **apercevoir, apaiser, aplanir, aplatir** (un **p**, contre *apporter, applaudir*).'), {
        ex: [['En l’occurrence, ce dilemme appelle un résumé succinct.', 'As it happens, this dilemma calls for a concise summary.'], ['Il s’est aperçu que la résonance acoustique restait parallèle.', 'He noticed that the acoustic resonance remained parallel.']],
      }),
      trap(b('« Résonance » vs « raisonner »; « acronyme » vs « anonymat »', '« Résonance » / « raisonner » ; « acronyme » / « anonymat »'), b('**La résonance** and **la consonance** take a **single n** (*sonore*), whereas **raisonner** (*to reason*) takes **nn**. **Un acronyme** and **l’anonymat** take **single n** (*nomen*/*onoma*), whereas **innocent, innombrable, irréprochable** double the prefix consonant (**in- + nom → innombrable**).', '**La résonance** et **la consonance** prennent **un seul n**, alors que **raisonner** en prend **deux**. **Un acronyme** et **l’anonymat** prennent **un seul n**, tandis que **innocent, innombrable, irréprochable** doublent la consonne.')),
      sort(b('Double or single consonant at the trap spot?', 'Consonne double ou simple au point piège ?'), [b('double (mm / rr / ll / cc)', 'double (mm / rr / ll / cc)'), b('single (p / r / n / l)', 'simple (p / r / n / l)')], [['dile…e (dilemme)', 0], ['a…ercevoir (apercevoir)', 1], ['occu…ence (occurrence)', 0], ['concu…ence (concurrence)', 1], ['so…iciter (solliciter)', 0], ['réso…ance (résonance)', 1]]),
      mc(P.spelling, ['En l’occurrence, ce dilemme succinct laisse les témoins indemnes.', 'En l’occurence, ce dilemne succint laisse les témoins indennes.', 'En l’occurrence, ce dilemne succinct laisse les témoins indemnes.', 'En l’occurence, ce dilemme succint laisse les témoins indennes.']),
      mc(P.spelling, ['Il faut solliciter l’anonymat plutôt que d’aplatir cette consonance parallèle.', 'Il faut soliciter l’annonymat plutôt que d’applatir cette consonnance paralèlle.', 'Il faut solliciter l’annonymat plutôt que d’aplatir cette consonnance parallèle.', 'Il faut soliciter l’anonymat plutôt que d’applatir cette consonance paralèlle.']),
      gap(P.complete, 'En l’___, sans ___, il a résolu ce ___ de façon ___ (f.).', ['occurrence', 'concurrence', 'dilemme', 'succincte'], { choices: [['occurrence', 'occurence', 'ocurrence'], ['concurrence', 'concurence', 'concurrance'], ['dilemme', 'dilemne', 'dilème'], ['succincte', 'sucincte', 'succinte']], strict: true }),
      dict('En l’occurrence, cet acronyme résume un dilemme succinct et irréprochable.', { voice: 'm', strict: true }),
    ],
    [
      b('dilemme (mm) ≠ indemne (mn); succinct (cc + ct); belliqueux (ll); imbécile (single l).', 'dilemme (mm) ≠ indemne (mn) ; succinct (cc + ct) ; belliqueux (ll) ; imbécile (un l).'),
      b('occurrence (cc + rr) and récurrence (rr) vs concurrence (single r).', 'occurrence (cc + rr) et récurrence (rr) contre concurrence (un seul r).'),
      b('apercevoir, apaiser, aplanir, aplatir (single p); résonance, consonance, anonymat (single n).', 'apercevoir, apaiser, aplanir, aplatir (un p) ; résonance, consonance, anonymat (un n).'),
    ],
    [['en l’occurrence', b('as it happens, in this instance', 'dans le cas présent')], ['succinct, succincte', b('concise, terse', 'bref et précis')], ['indemne', b('unharmed, unscathed', 'sans blessure ni dommage')]],
  ),
  lesson(C, 3, ['rare-words-etymology-and-plurals', 'mots-rares-etymologie-et-pluriels'],
    b('Rare words, false etymologies & Latin plurals', 'Mots rares, étymologies et pluriels savants'),
    b('Spell deceptive singulars (poids, legs, puits, remords), literary terms and foreign plurals.', 'Écrire les singuliers pièges (poids, legs, puits, remords), mots rares et pluriels savants.'),
    [b('Keep final silent letters in poids, legs, puits, remords', 'Garder les lettres finales de poids, legs, puits, remords'), b('Spell rare literary/technical nouns (onomatopée, abscisse, anacoluthe)', 'Écrire les termes rares (onomatopée, abscisse, anacoluthe)'), b('Pluralise Latin and Italian loanwords properly in French', 'Accorder les emprunts latins et italiens en français')],
    13,
    [
      card(b('Deceptive endings and scholarly plurals', 'Finales trompeuses et pluriels savants'), b('Several singular French nouns always keep a silent **-s** (and sometimes a ghost consonant!): **le poids** (*weight*, false link to Latin *pondus*), **un pois** (*pea*), **la poix** (*pitch*); **un legs** (*bequest*, silent *g*!); **un puits** (*well*); **un remords** (*remorse*); **un cours** (*course*). Literary gems: **une onomatopée** (-ée!), **une abscisse** (*bs + sc*), **un acrostiche**. Foreign plurals: regular French **-s** for **des scénarios, des quiproquos, des maximums, des référendums** (Latin **maxima** is rarer), while **des post-scriptum, des ex-voto, des nota bene** stay **invariable**.', 'Plusieurs noms singuliers gardent un **-s** final (et parfois une consonne muette) : **le poids** (*d* étymologique trompeur), **un pois**, **la poix**, **un legs** (*g* muet), **un puits**, **un remords**. Termes rares : **une onomatopée** (*-ée*), **une abscisse** (*bs + sc*), **un acrostiche**. Pluriels savants : **des scénarios, des quiproquos, des maximums, des référendums**, alors que **des post-scriptum, des ex-voto** restent **invariables**.'), {
        ex: [['Ce legs précieux pèse d’un grand poids sans aucun remords.', 'This precious bequest carries great weight without any remorse.'], ['Les deux scénarios contiennent des quiproquos et deux post-scriptum.', 'Both scenarios contain misunderstandings and two postscripts.']],
      }),
      tip(b('Watch « nénuphar / nénufar » and 1990 options', '« Nénuphar / nénufar » et variantes admises'), b('Traditional spelling writes **nénuphar** (*ph*), while the 1990 reform prefers **nénufar** (*f*, closer to Arabic/Persian origin) — both are accepted! Likewise **maximums** (standard French) vs **maxima** (Latin). Pick one norm and stay consistent throughout your text.', 'On écrit traditionnellement **nénuphar** (*ph*), mais l’orthographe rectifiée de 1990 recommande **nénufar** (*f*) — les deux sont admis ! De même pour **des maximums** (français) ou **des maxima** (latin).')),
      pairs(P.match, [['le poids', b('weight (silent -ds)', 'masse, lourdeur')], ['un legs', b('a legacy, bequest (silent -gs)', 'don par testament')], ['un puits', b('a well (always -ts)', 'trou profond pour l’eau')], ['un quiproquo', b('a misunderstanding (plural -s)', 'méprise')]]),
      mc(P.spelling, ['Les scénarios de ces quiproquos incluent des post-scriptum sans remords.', 'Les scénarii de ces quiproquos incluent des post-scriptums sans remord.', 'Les scénarios de ces quiproquos incluent des post-scriptums sans remord.', 'Les scénarii de ces quiproquo incluent des post-scriptum sans remords.']),
      mc(P.spelling, ['Sur l’axe des abscisses, le chercheur trace sans hémorragie de données un puits de potentiel.', 'Sur l’axe des abcisses, le chercheur trace sans émorragie de données un puit de potentiel.', 'Sur l’axe des abscisses, le chercheur trace sans hémorragie de données un puit de potentiel.', 'Sur l’axe des abcisses, le chercheur trace sans hémorragie de données un puits de potentiel.']),
      gap(P.complete, 'Sans aucun ___, il a transmis ce ___ de grand ___ malgré les ___ des deux ___.', ['remords', 'legs', 'poids', 'quiproquos', 'scénarios'], { choices: [['remords', 'remord', 'remorts'], ['legs', 'leg', 'lègue'], ['poids', 'pois', 'poix'], ['quiproquos', 'quiproquo', 'quiproquaux'], ['scénarios', 'scénarii', 'scénario']], strict: true }),
      dict('Ce legs d’un grand poids évoquait des scénarios remplis de quiproquos sans remords.', { voice: 'f', strict: true }),
      write(b('Write a C2 lexical showcase.', 'Rédigez un paragraphe savant C2.'), b('Write a short literary or critical paragraph (50–90 words) using at least five C2 words from this course (e.g. chrysanthème, rythme, dilemme, occurrence, succinct, poids, legs, scénarios, quiproquos).', 'Rédigez un bref paragraphe littéraire ou critique (50–90 mots) employant au moins cinq mots savants de ce cours (chrysanthème, rythme, dilemme, occurrence, succinct, poids, legs, scénarios, quiproquos).'), 50, 90, [
        b('At least five C2 learned or rare words spelled accurately', 'Au moins cinq mots savants C2 écrits sans faute'),
        b('Consistent punctuation and typography', 'Ponctuation et typographie soignées'),
        b('Coherent C2 style and register', 'Style et registre C2 cohérents'),
      ], 'En l’occurrence, le vieux critique se trouvait face à un dilemme succinct mais décisif. Devait-il publier les deux scénarios inédits retrouvés dans ce legs littéraire, malgré leurs quiproquos et le rythme parfois heurté de leurs onomatopées ? Après mûre réflexion, il en mesura tout le poids historique et accepta l’entreprise sans remords, persuadé qu’un tel anonymat ne pouvait durer.'),
    ],
    [
      b('Singulars keeping silent -s: le poids, un legs, un puits, un remords, un pois.', 'Singuliers gardant un -s muet : le poids, un legs, un puits, un remords, un pois.'),
      b('Watch abscisse (bs + sc), onomatopée (-ée), hémorragie (h + rr + h).', 'Attention à abscisse (bs + sc), onomatopée (-ée), hémorragie (h + rr + h).'),
      b('Frenchified plurals: des scénarios, des quiproquos, des maximums; invariable: des post-scriptum, des ex-voto.', 'Pluriels francisés : des scénarios, des quiproquos, des maximums ; invariables : des post-scriptum, des ex-voto.'),
    ],
    [['un legs', b('a bequest, legacy', 'don laissé par testament')], ['un quiproquo', b('a comedic misunderstanding', 'confusion entre personnes ou choses')], ['une abscisse', b('an x-coordinate (abscissa)', 'coordonnée horizontale')]],
  ),
];
