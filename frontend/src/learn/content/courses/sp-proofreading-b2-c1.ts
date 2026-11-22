import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Even strong B2 and C1 writers lose marks on essays and DELF/DALF scripts when they proofread from top to bottom looking for “anything wrong” at once. Professional French editors proofread in four focused passes: (1) verbs and true subjects, (2) noun, adjective and participle agreements, (3) homophones and confusable pairs (leur/leurs, quant à/quand, censé/sensé, plutôt/plus tôt), and (4) accents, capitalisation and French typography. This C1 course turns that 4-pass routine into a habit.',
    'Même à un niveau B2 ou C1, on laisse passer des fautes quand on relit un texte de façon globale sans méthode. Les correcteurs professionnels pratiquent une relecture en quatre passes ciblées : (1) verbes et sujets réels, (2) accords des noms, adjectifs et participes, (3) homophones et paronymes (leur/leurs, quant à/quand, censé/sensé, plutôt/plus tôt), et (4) accents, majuscules et typographie française. Ce cours C1 installe cette routine efficace.',
  ),
  outcomes: [
    b('Run Pass 1 & 2 to catch inverted subjects, qui-antecedents and participle slips', 'Mener les passes 1 et 2 pour vérifier sujets inversés, antécédents de qui et participes'),
    b('Run Pass 3 to eliminate homophone errors (leur/leurs, quant à/quand, plutôt/plus tôt)', 'Mener la passe 3 pour éliminer les homophones (leur/leurs, quant à/quand, plutôt/plus tôt)'),
    b('Apply French capitalisation rules for languages, nationalities, days and months', 'Appliquer les majuscules françaises aux langues, nationalités, jours et mois'),
    b('Apply Pass 4 punctuation and spacing rules (« … », spaces before : ; ? !)', 'Appliquer la passe 4 sur les accents et la typographie française'),
  ],
};

const C = 'sp-proofreading-b2-c1';
export default [
  lesson(C, 1, ['passes-1-2-verbs-and-agreements', 'passes-1-2-verbes-et-accords'],
    b('Passes 1 & 2: verbs, subjects and agreements', 'Passes 1 et 2 : verbes, sujets et accords'),
    b('Locate true verb subjects and systematically check noun, adjective and participle agreements.', 'Repérer le vrai sujet des verbes et vérifier méthodiquement chaque accord.'),
    [b('Find distant, inverted or qui subjects (Pass 1)', 'Repérer les sujets éloignés, inversés ou après qui (passe 1)'), b('Verify collective subjects (la plupart, tout le monde)', 'Vérifier les sujets collectifs (la plupart, tout le monde)'), b('Check noun, adjective and past participle agreements (Pass 2)', 'Contrôler accords des noms, adjectifs et participes (passe 2)')],
    13,
    [
      card(b('Pass 1 (Verbs) and Pass 2 (Agreements)', 'Passe 1 (Verbes) et Passe 2 (Accords)'), b('**Pass 1 — Verbs**: match every verb to its **true subject**, ignoring nouns inside prepositional phrases (*L’ensemble des réformes **entraîne**…*), **inverted subjects** (*Dans la cour **poussent** trois chênes*), and **qui** (*C’est vous qui **avez** raison*). Remember **la plupart des gens pensent** (plural), **tout le monde sait** (singular). **Pass 2 — Agreements**: scan left-to-right for **determiners + nouns + adjectives**, and check **avoir/être/pronominal** participles.', '**Passe 1 — Verbes** : reliez chaque verbe à son **vrai sujet**, malgré les écrans (*L’ensemble des mesures **entraîne**…*), les **sujets inversés** (*Dans le parc **poussent** trois chênes*) ou **qui** (*C’est vous qui **avez** raison*). **La plupart des gens pensent** (pluriel) ; **tout le monde sait** (singulier). **Passe 2 — Accords** : vérifiez déterminants, adjectifs et participes.'), {
        table: { head: [b('pass', 'passe'), b('target', 'cible'), b('quick check', 'réflexe')], rows: [['Pass 1', b('verbs & subjects', 'verbes et sujets'), 'C’est moi qui ai… / Sur le quai attendent…'], ['Pass 2', b('agreements', 'accords'), 'Les preuves qu’ils se sont données…']] },
      }),
      doc({ look: 'email', title: b('Spot the hidden errors', 'Repérez les fautes cachées'), text: 'Cher collègue,\nLa majorité des participants ont validé l’horaire, mais c’est nous qui devons envoyé le programme. Les pièces qu’elles m’ont transmis seront publiées lundi. Sur le bureau traîne encore plusieurs dossiers.' }, P.read, [b('Three slips: « envoyé » (→ envoyer), « transmis » (→ transmises), « traîne » (→ traînent).', 'Trois fautes : « envoyé » (→ envoyer), « transmis » (→ transmises), « traîne » (→ traînent).'), b('Only « participants ont » is wrong.', 'Seul « participants ont » est faux.'), b('No errors at all in this email.', 'Aucune faute dans ce courriel.'), b('Only « publiées » should be singular.', 'Seul « publiées » devrait être au singulier.')]),
      mc(P.spelling, ['C’est vous qui avez rédigé les remarques que nous avons lues.', 'C’est vous qui ont rédigé les remarques que nous avons lu.', 'C’est vous qui avez rédigé les remarques que nous avons lu.', 'C’est vous qui avez rédigés les remarques que nous avons lues.']),
      mc(P.spelling, ['Dans cette vallée coulent plusieurs rivières que les pluies ont grossies.', 'Dans cette vallée coule plusieurs rivières que les pluies ont grossi.', 'Dans cette vallée coulent plusieurs rivières que les pluies ont grossi.', 'Dans cette vallée coule plusieurs rivières que les pluies ont grossies.']),
      gap(P.complete, 'C’est moi qui ___ (être) responsable des décisions qu’elles se sont ___ (imposer) ; d’ici demain ___ (arriver, pluriel) les résultats.', ['suis', 'imposées', 'arriveront'], { strict: true }),
      dict('La plupart des chercheuses ont signé les lettres qu’elles avaient rédigées.', { voice: 'f', strict: true }),
    ],
    [
      b('Pass 1: find every verb and trace back to its real subject (watch screens, inversions, qui).', 'Passe 1 : vérifiez chaque verbe avec son vrai sujet (écrans, inversions, qui).'),
      b('c’est moi qui ai, c’est vous qui êtes, la plupart des gens pensent, tout le monde pense.', 'c’est moi qui ai, c’est vous qui êtes, la plupart des gens pensent, tout le monde pense.'),
      b('Pass 2: verify every adjective, determiner and past participle.', 'Passe 2 : contrôlez chaque adjectif, déterminant et participe passé.'),
    ],
    [['un écran (syntaxe)', b('an intervening noun trap', 'nom intercalé entre sujet et verbe')], ['traîner', b('to lie around, drag on', 'rester posé en désordre')], ['imposer', b('to impose', 'obliger à accepter')]],
  ),
  lesson(C, 2, ['pass-3-homophones-and-traps', 'passe-3-homophones-et-pieges'],
    b('Pass 3: homophones & C1 confusables', 'Passe 3 : homophones et pièges lexicaux'),
    b('Eliminate tricky C1 slips: leur/leurs, quant à/quand, censé/sensé, plutôt/plus tôt, davantage.', 'Éliminer les fautes tenaces : leur/leurs, quant à/quand, censé/sensé, plutôt/plus tôt, davantage.'),
    [b('Separate leur (pronoun) from leurs (determiner)', 'Séparer leur (pronom) et leurs (déterminant)'), b('Distinguish quant à / quand, plutôt / plus tôt, davantage', 'Distinguer quant à / quand, plutôt / plus tôt, davantage'), b('Choose between censé / sensé and différend / différent', 'Choisir entre censé / sensé et différend / différent')],
    13,
    [
      card(b('Pass 3 — The homophone radar', 'Passe 3 — Le radar des homophones'), b('Check these five pairs systematically: 1. **leur** before a verb = *to them* (NEVER *-s*!): **Je leur ai parlé** vs **leurs projets**. 2. **quant à** = *as for* (**Quant à moi…**) vs **quand** = *when*. 3. **plutôt** = *rather* vs **plus tôt** = *earlier*. 4. **censé** = *supposed to* (**Il est censé venir**) vs **sensé** = *sensible* (**une remarque sensée**). 5. **davantage** = *more* (always one word, never *d’avantage* unless meaning *benefit*!).', 'Vérifiez ces cinq paires : 1. **leur** devant un verbe = pronom invariable (**Je leur ai parlé**, jamais *-s*) contre **leurs projets**. 2. **quant à** = *en ce qui concerne* contre **quand** = *à quel moment*. 3. **plutôt** = *de préférence* contre **plus tôt** = *avant l’heure*. 4. **censé** = *supposé* contre **sensé** = *plein de bon sens*. 5. **davantage** = *plus* (un seul mot).'), {
        ex: [['Quant à nos partenaires, nous leur avons écrit plus tôt que prévu.', 'As for our partners, we wrote to them earlier than planned.'], ['Ce règlement est censé limiter les différends plutôt que les créer.', 'This rule is supposed to limit disputes rather than create them.']],
      }),
      trap(b('« Différend » vs « différent »; « prêt à » vs « près de »', '« Différend » / « différent » ; « prêt à » / « près de »'), b('**Un différend** (*-d*, noun) = a disagreement/dispute; **différent** (*-t*, adjective) = different. **Prêt à** = *ready to*; **près de** = *near to / almost*. Also **tout à coup** (suddenly) vs **tout d’un coup** (all at once).', '**Un différend** (*-d*, nom) = un désaccord ; **différent** (*-t*, adjectif). **Prêt à** = *disposé à* ; **près de** = *à proximité de / presque*.')),
      sort(b('Correct or homophone error?', 'Correct ou erreur d’homophone ?'), [b('correct', 'correct'), b('error to fix', 'faute à corriger')], [['Je leur ai répondu.', 0], ['Je leurs ai répondu.', 1], ['Quant à moi, j’accepte.', 0], ['Quand à moi, j’accepte.', 1], ['Tu es censé savoir.', 0], ['Tu es sensé savoir.', 1]]),
      mc(P.spelling, ['Il est arrivé plus tôt pour travailler davantage, plutôt que de reporter.', 'Il est arrivé plutôt pour travailler d’avantage, plus tôt que de reporter.', 'Il est arrivé plus tôt pour travailler d’avantage, plutôt que de reporter.', 'Il est arrivé plutôt pour travailler davantage, plus tôt que de reporter.']),
      mc(P.spelling, ['Ce juge sensé a tranché un différend vieux de dix ans.', 'Ce juge censé a tranché un différent vieux de dix ans.', 'Ce juge sensé a tranché un différent vieux de dix ans.', 'Ce juge censé a tranché un différend vieux de dix ans.']),
      gap(P.complete, '___ aux clients, nous ___ avons répondu ___ que prévu afin d’éviter tout ___.', ['Quant', 'leur', 'plus tôt', 'différend'], { choices: [['Quant', 'Quand'], ['leur', 'leurs'], ['plus tôt', 'plutôt'], ['différend', 'différent']], strict: true }),
      dict('Quant à eux, ils sont censés régler ce différend plus tôt que prévu.', { voice: 'm', strict: true }),
    ],
    [
      b('leur + verb = pronoun (never -s); leurs + plural noun = determiner.', 'leur + verbe = pronom invariable (jamais -s) ; leurs + nom pluriel = déterminant.'),
      b('quant à (as for) vs quand (when); plutôt (rather) vs plus tôt (earlier); davantage (more).', 'quant à (en ce qui concerne) contre quand ; plutôt (de préférence) contre plus tôt ; davantage (plus).'),
      b('censé (supposed to) ≠ sensé (sensible); un différend (dispute) ≠ différent (different).', 'censé (supposé) ≠ sensé (raisonnable) ; un différend (conflit) ≠ différent.'),
    ],
    [['un différend', b('a dispute, disagreement', 'désaccord, conflit')], ['censé', b('supposed to', 'supposé faire quelque chose')], ['davantage', b('more', 'plus')]],
  ),
  lesson(C, 3, ['pass-4-accents-and-typography', 'passe-4-accents-et-typographie'],
    b('Pass 4: accents, capitals & typography', 'Passe 4 : accents, majuscules et typographie'),
    b('Apply French rules for accents on capitals, lowercase/uppercase and punctuation spacing.', 'Maîtriser accents sur majuscules, emploi de la majuscule et ponctuation française.'),
    [b('Put accents on capital letters (À, É, Ê, Ç)', 'Accentuer les majuscules (À, É, Ê, Ç)'), b('Know when French uses lowercase (days, months, languages, adjectives)', 'Savoir quand le français met la minuscule (jours, mois, langues, adjectifs)'), b('Apply French spacing around : ; ? ! « … » and edit a full text', 'Appliquer la ponctuation française et corriger un texte complet')],
    13,
    [
      card(b('Pass 4 — Accents, capitals and French spacing', 'Passe 4 — Accents, majuscules et typographie'), b('1. **Accents stay on capitals**: **À Paris, Évidemment, École, Ça va**. 2. **Lowercase** for days, months, languages and nationality **adjectives** (**lundi, janvier, le français, un roman suisse**); **uppercase** ONLY for nationality **nouns** (**les Suisses, un Français**). 3. **Typography**: French puts a space **before** **: ; ? !**, uses **« … »** with inner spaces, and never puts a lone comma between subject and verb.', '1. **Accentuez les majuscules** : **À Paris, Évidemment, École, Ça va**. 2. **Minuscule** aux jours, mois, langues et **adjectifs** de nationalité (**lundi, janvier, le français, un roman suisse**) ; **majuscule** aux **noms** d’habitants (**les Suisses, un Français**). 3. **Typographie** : espace avant **: ; ? !**, guillemets **« … »** avec espaces, jamais de virgule seule entre sujet et verbe.'), {
        ex: [['À Lyon, les Français parlent français dès janvier.', 'In Lyon, French people speak French starting in January.'], ['Il demande : « Où aura lieu la réunion mardi ? »', 'He asks: “Where will the meeting take place on Tuesday?”']],
      }),
      tip(b('The complete 4-pass proofreading routine', 'La routine complète en 4 passes'), b('Before submitting any DELF/DALF essay or professional email, scan **four times** with one focus per pass: **1. Verbs** (subject + tense) → **2. Agreements** (nouns, adjectives, participles) → **3. Homophones** (*leur, quant à, censé, plutôt*) → **4. Accents, capitals & punctuation**.', 'Avant de rendre une copie ou un courriel, relisez **quatre fois** avec un seul objectif par passe : **1. Verbes** → **2. Accords** → **3. Homophones** → **4. Accents, majuscules et ponctuation**.')),
      mc(P.spelling, ['À Montréal, un collègue québécois enseigne le français chaque mercredi d’octobre.', 'A Montréal, un collègue Québécois enseigne le Français chaque Mercredi d’Octobre.', 'À Montréal, un collègue Québécois enseigne le français chaque mercredi d’Octobre.', 'A Montréal, un collègue québécois enseigne le Français chaque mercredi d’octobre.']),
      mc(P.spelling, ['Évidemment, il conclut : « Sommes-nous prêts pour mardi ? »', 'Evidemment, il conclut: « Sommes-nous prêts pour Mardi? »', 'Évidemment, il conclut: « Sommes-nous prêts pour mardi? »', 'Evidemment, il conclut : « Sommes-nous prêts pour mardi ? »']),
      gap(P.complete, '___ Marseille, les ___ (habitant, m. pl.) apprécient la cuisine ___ (adj. f.) dès ___ (mois).', ['À', 'Français', 'provençale', 'avril'], { choices: [['À', 'A'], ['Français', 'français'], ['provençale', 'Provençale'], ['avril', 'Avril']], strict: true }),
      write(b('Proofread and rewrite this paragraph.', 'Relisez et corrigez ce paragraphe.'), b('Find and correct all the errors (verbs, agreements, homophones, capitals, accents, punctuation) in this draft (50–85 words): « A Paris mardi dernier, les étudiants Canadien ont visités le musée. La plupart des oeuvres qu’ils ont admiré étaient magnifique. Quand à leur professeurs, ils leurs ont dit: “Quel chef-d’œuvre!” »', 'Corrigez toutes les fautes (verbes, accords, homophones, majuscules, accents, ponctuation) dans ce brouillon (50–85 mots) : « A Paris mardi dernier, les étudiants Canadien ont visités le musée. La plupart des oeuvres qu’ils ont admiré étaient magnifique. Quand à leur professeurs, ils leurs ont dit: “Quel chef-d’œuvre!” »'), 45, 85, [
        b('À Paris with capital accent + lowercase canadiens', 'À Paris accentué + minuscule à canadiens'),
        b('Participle agreements fixed (visitée/visité, admirées, magnifiques)', 'Accords des participes et adjectifs corrigés (visité, admirées, magnifiques)'),
        b('Homophones fixed (Quant à, leurs professeurs, leur ont dit)', 'Homophones corrigés (Quant à, leurs professeurs, leur ont dit)'),
        b('French ligature œ (œuvres) and spacing with « … »', 'Ligature œ (œuvres) et typographie française (« … »)'),
      ], 'À Paris mardi dernier, les étudiants canadiens ont visité le musée. La plupart des œuvres qu’ils ont admirées étaient magnifiques. Quant à leurs professeurs, ils leur ont dit avec enthousiasme : « Quel chef-d’œuvre ! » Cette visite culturelle restera assurément gravée dans la mémoire de toute la promotion.'),
    ],
    [
      b('Keep accents on capital letters (À, É, Ê, Ç) and ligatures (œuvres, cœur).', 'Accentuez les majuscules (À, É, Ê, Ç) et gardez la ligature œ (œuvres, cœur).'),
      b('Lowercase days, months, languages and nationality adjectives; capitalise nationality nouns.', 'Minuscule aux jours, mois, langues et adjectifs ; majuscule aux noms d’habitants.'),
      b('Always run the 4-pass check: verbs → agreements → homophones → accents & typography.', 'Appliquez les 4 passes : verbes → accords → homophones → accents et typographie.'),
    ],
    [['un chef-d’œuvre', b('a masterpiece', 'œuvre exceptionnelle')], ['la promotion', b('the graduating class / cohort', 'ensemble des étudiants d’une année')], ['assurément', b('assuredly, certainly', 'sans aucun doute')]],
  ),
];
