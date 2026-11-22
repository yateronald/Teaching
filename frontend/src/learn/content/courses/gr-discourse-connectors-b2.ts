import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Cohesion separates a list of ideas from a convincing B2 essay. Structure paragraphs with tout d’abord, en outre and par ailleurs; express cause and consequence with en raison de, faute de, si bien que and dès lors; nuance arguments with certes… mais, cela dit, toutefois and quoi qu’il en soit; and conclude crisply with en somme, tout compte fait and il ressort de cela que.',
    'La cohérence du discours distingue une simple liste d’idées d’un véritable essai B2. Structurez vos paragraphes avec tout d’abord, en outre et par ailleurs ; articulez cause et conséquence avec en raison de, faute de, si bien que et dès lors ; nuancez avec certes… mais, cela dit, toutefois et quoi qu’il en soit ; et concluez avec en somme, tout compte fait et il ressort de cela que.',
  ),
  outcomes: [
    b('Order arguments cleanly and distinguish par ailleurs from en outre and quant à', 'Organiser une argumentation et distinguer par ailleurs, en outre et quant à'),
    b('Link cause and consequence with en raison de, faute de, si bien que and dès lors', 'Articuler cause et conséquence avec en raison de, faute de, si bien que et dès lors'),
    b('Introduce concession and balance using certes… mais, cela dit, toutefois and quoi qu’il en soit', 'Nuancer un propos grâce à certes… mais, cela dit, toutefois et quoi qu’il en soit'),
    b('Synthesize a DELF B2 essay with en somme, tout compte fait and il ressort de cela que', 'Synthétiser un essai B2 avec en somme, tout compte fait et il ressort de cela que'),
  ],
};

const C = 'gr-discourse-connectors-b2';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['structuring-and-adding', 'structurer-et-ajouter'],
    b('Structuring and adding: tout d’abord, en outre, par ailleurs', 'Structurer et ajouter : tout d’abord, en outre, par ailleurs'),
    b('Open paragraphs clearly, balance two sides, and add arguments without repeating et or de plus.', 'Ouvrir les paragraphes avec netteté, équilibrer deux aspects et ajouter un argument sans répéter et ou de plus.'),
    [
      b('Sequence points with tout d’abord, en premier lieu and enfin', 'Ordonner les arguments avec tout d’abord, en premier lieu et enfin'),
      b('Distinguish en outre / de surcroît (reinforcing) from par ailleurs (new angle)', 'Distinguer en outre / de surcroît (renforcement) de par ailleurs (autre aspect)'),
      b('Use d’une part… d’autre part and quant à without syntax slips', 'Employer d’une part… d’autre part et quant à sans faute de syntaxe'),
    ],
    13,
    [
      card(
        b('Organizing and layering arguments', 'Organiser et hiérarchiser les arguments'),
        b(
          'In a B2 essay, connectors tell the reader how each idea fits the overall plan. **Tout d’abord** and **en premier lieu** open the first point. **En outre** and **de surcroît** add a stronger argument in the **same direction** (“furthermore / moreover”). **Par ailleurs** shifts smoothly to a **related side point** (“besides / on another note”). **Quant à** (“as for”) introduces a new topic right before a comma—never write *quant à ce qui concerne*.\n\nOpening: **tout d’abord, en premier lieu, pour commencer**.\nReinforcing same line: **en outre, de surcroît, qui plus est**.\nAdding another angle: **par ailleurs · quant à · d’une part… d’autre part**.',
          'Dans un essai B2, les connecteurs indiquent la place exacte de chaque idée. **Tout d’abord** et **en premier lieu** ouvrent le premier point. **En outre** et **de surcroît** ajoutent un argument plus fort dans le **même sens**. **Par ailleurs** aborde un **autre aspect connexe**. **Quant à** (« pour ce qui est de ») introduit un thème suivi d’une virgule — évitez le pléonasme *quant à ce qui concerne*.\n\nOuverture : **tout d’abord, en premier lieu, pour commencer**.\nRenforcement : **en outre, de surcroît, qui plus est**.\nNouvel angle : **par ailleurs · quant à · d’une part… d’autre part**.',
        ),
        {
          table: {
            head: [b('Connector', 'Connecteur'), b('Role', 'Fonction'), b('Example', 'Exemple')],
            rows: [
              ['tout d’abord / en premier lieu', b('first point', 'premier argument'), 'Tout d’abord, ce choix réduit les coûts.'],
              ['en outre / de surcroît', b('adds weight in same direction', 'ajoute un argument décisif'), 'En outre, il limite les émissions.'],
              ['par ailleurs', b('introduces another angle', 'aborde un autre aspect'), 'Par ailleurs, la formation reste accessible.'],
              ['quant à + nom', b('shifts focus to a topic', 'met en avant un nouveau thème'), 'Quant aux délais, ils restent tenables.'],
            ],
          },
          ex: [
            ['En premier lieu, le télétravail diminue le temps passé dans les transports.', 'First of all, remote work reduces time spent commuting.'],
            ['Cette mesure est efficace ; de surcroît, elle ne coûte presque rien à la commune.', 'This measure is effective; moreover, it costs the municipality almost nothing.'],
            ['Quant au secteur associatif, il bénéficie directement de cette réforme.', 'As for the nonprofit sector, it benefits directly from this reform.'],
          ],
        },
      ),
      trap(
        b('Quant à (with a t) vs. quand', 'Quant à (avec un t) et non quand à'),
        b(
          'Always spell **quant à** with a **-t** (and contract with *le/les*: **quant au, quant aux**). Never confuse it with *quand* (“when”)! Also remember that **d’une part** always waits for **d’autre part** in the following sentence or clause—never leave *d’une part* stranded alone.\n\nCorrect contractions: **quant au budget, quant à l’avenir, quant aux salariés**.\nPaired balance: **d’une part…, d’autre part…**.',
          'Écrivez toujours **quant à** avec un **-t** (contracté en **quant au, quant aux**), jamais *quand à* ! Pensez aussi à toujours fermer **d’une part** par **d’autre part** dans la suite du paragraphe.\n\nContractions correctes : **quant au budget, quant à l’avenir, quant aux salariés**.\nSymétrie attendue : **d’une part…, d’autre part…**.',
        ),
      ),
      mc(
        P.spelling,
        ['Quant aux résultats', 'Quand aux résultats', 'Quant à les résultats', 'Quants aux résultats'],
        {
          fr: '___ du second trimestre, ils dépassent nos prévisions.',
          explain: b('“As for” is spelled quant à and contracts with les into quant aux.', '« Pour ce qui est de » s’écrit quant à et se contracte en quant aux devant les.'),
        },
      ),
      mc(
        P.best,
        [
          'de surcroît',
          'tout d’abord',
          'd’une part',
          'en premier lieu',
        ],
        {
          fr: 'Ce logiciel est gratuit ; ___, il protège intégralement les données personnelles.',
          explain: b('De surcroît (or en outre) reinforces an existing positive argument with an extra advantage.', 'De surcroît (ou en outre) ajoute un avantage décisif dans la même direction.'),
        },
      ),
      gap(
        P.completeText,
        '___ (Tout d’abord / En outre), le logement étudiant manque dans les grandes villes. ___ (D’une part / Par ailleurs), les aides existantes ne suivent pas toujours les loyers. ___ (Quant au / Quand au) transport régional, il demeure un atout majeur.',
        [['Tout d’abord'], ['Par ailleurs'], ['Quant au']],
        {
          choices: [
            ['Tout d’abord', 'En outre', 'Enfin'],
            ['Par ailleurs', 'D’une part', 'Tout d’abord'],
            ['Quant au', 'Quand au', 'Quant à'],
          ],
        },
      ),
      ord(
        P.order,
        'En outre, cette solution reste simple à déployer partout.',
        { tr: 'Furthermore, this solution remains easy to roll out everywhere.' },
      ),
      pairs(
        P.match,
        [
          ['en premier lieu', b('firstly', 'en tout premier point')],
          ['en outre', b('furthermore', 'de plus, en ajoutant cela')],
          ['par ailleurs', b('besides / on another note', 'sur un autre plan connexe')],
          ['quant à', b('as for / regarding', 'pour ce qui concerne')],
        ],
      ),
      dict('D’une part, la réforme simplifie les démarches ; d’autre part, elle réduit les délais.'),
      say('Par ailleurs, nous devons garantir l’accès numérique dans les zones rurales.', 'Besides, we must guarantee digital access in rural areas.'),
    ],
    [
      b('Use tout d’abord and en premier lieu to open; en outre and de surcroît to reinforce; par ailleurs to introduce another angle.', 'Employez tout d’abord et en premier lieu pour ouvrir ; en outre et de surcroît pour renforcer ; par ailleurs pour un nouvel aspect.'),
      b('Spell quant à with a -t and contract it with le/les (quant au, quant aux).', 'Écrivez quant à avec un -t et contractez-le en quant au / quant aux.'),
      b('Always pair d’une part with d’autre part.', 'Associez toujours d’une part à d’autre part.'),
    ],
    [
      ['de surcroît', b('moreover, on top of that', 'qui plus est, par-dessus tout')],
      ['par ailleurs', b('besides, on another note', 'd’un autre côté, en plus')],
      ['quant à', b('as for, regarding', 'pour ce qui est de')],
      ['en premier lieu', b('in the first place', 'premièrement')],
    ],
  ),

  lesson(
    C,
    2,
    ['cause-and-consequence', 'cause-et-consequence'],
    b('Cause and consequence: faute de, si bien que, dès lors', 'Cause et conséquence : faute de, si bien que, dès lors'),
    b('Connect reasons and outcomes with exact semantic shading—noun phrases, clauses and logical pivots.', 'Relier causes et effets avec nuance grâce aux locutions nominales, conjonctions et adverbes logiques.'),
    [
      b('Distinguish en raison de, grâce à, à cause de and faute de + noun', 'Distinguer en raison de, grâce à, à cause de et faute de + nom'),
      b('Use puisque and étant donné que to anchor accepted causes', 'Employer puisque et étant donné que pour des causes admises'),
      b('Express result cleanly with si bien que, dès lors and par conséquent', 'Exprimer la conséquence avec si bien que, dès lors et par conséquent'),
    ],
    13,
    [
      card(
        b('Prepositions of cause vs. result pivots', 'Prépositions de cause et pivots de conséquence'),
        b(
          'At B2, vary your causal expressions beyond *parce que*. Use **en raison de + noun** for a neutral, formal cause; **faute de + noun/infinitive** when something is missing (“for lack of”); **étant donné que** or **puisque** when the cause is known to the reader. To pivot to the result, use **si bien que** (“with the result that”, followed by the indicative), **dès lors** (“from that point on / consequently”), or **par conséquent**.\n\nPrepositions of cause: **en raison de, faute de, grâce à**.\nCausal clauses: **étant donné que, puisque, du fait que**.\nResult pivots: **si bien que, dès lors, par conséquent**.',
          'Au niveau B2, dépassez *parce que*. Employez **en raison de + nom** pour une cause neutre et formelle ; **faute de + nom/infinitif** pour un manque ; **étant donné que** ou **puisque** pour une cause déjà connue. Pour introduire l’effet, utilisez **si bien que** (+ indicatif), **dès lors** (« à partir de là / par suite ») ou **par conséquent**.\n\nPrépositions de cause : **en raison de, faute de, grâce à**.\nSubordonnées causales : **étant donné que, puisque, du fait que**.\nConséquence : **si bien que, dès lors, par conséquent**.',
        ),
        {
          table: {
            head: [b('Connector', 'Connecteur'), b('Structure', 'Construction'), b('Value', 'Valeur')],
            rows: [
              ['en raison de', '+ nom', b('neutral / formal cause', 'cause neutre (soutenu)')],
              ['faute de', '+ nom / infinitif', b('cause by lack of', 'manque empêchant l’action')],
              ['étant donné que', '+ indicatif', b('given that (known fact)', 'cause évidente ou posée')],
              ['si bien que', '+ indicatif', b('so that / with the result that', 'conséquence directe')],
              ['dès lors / par conséquent', b('adverb / clause pivot', 'adverbe de liaison'), b('therefore, from then on', 'donc, par suite logique')],
            ],
          },
          ex: [
            ['Le colloque a été reporté en raison d’un mouvement social.', 'The conference was postponed due to a strike.'],
            ['Faute de financements suffisants, le laboratoire a réduit l’étude.', 'For lack of sufficient funding, the laboratory scaled back the study.'],
            ['La demande a doublé en un mois, si bien que les stocks sont épuisés.', 'Demand doubled in one month, with the result that stocks are exhausted.'],
          ],
        },
      ),
      trap(
        b('Si bien que (result) vs. afin que (purpose)', 'Si bien que (conséquence) et afin que (but)'),
        b(
          'Do not confuse **si bien que** (real consequence → **indicative**) with **afin que / pour que** (intended goal → **subjunctive**). Also note **faute de** never takes an article before an unmodified singular/plural noun (*faute de temps*, *faute de preuves*, NOT *faute du temps*).\n\nResult (+ indicative): **si bien qu’il a accepté, de sorte qu’elle réussit**.\nPurpose (+ subjunctive): **afin qu’il accepte · pour qu’elle réussisse**.',
          'Ne confondez pas **si bien que** (conséquence réelle → **indicatif**) avec **afin que / pour que** (but visé → **subjonctif**). De plus, **faute de** s’emploie sans article devant un nom non qualifié (*faute de temps*, *faute de moyens*, jamais *faute du temps*).\n\nConséquence (+ indicatif) : **si bien qu’il a accepté, de sorte qu’elle réussit**.\nBut (+ subjonctif) : **afin qu’il accepte · pour qu’elle réussisse**.',
        ),
      ),
      mc(
        P.best,
        [
          'Faute de',
          'Grâce à',
          'Si bien que',
          'Par conséquent',
        ],
        {
          fr: '___ candidats qualifiés, le poste est resté vacant six mois.',
          explain: b('Faute de + bare noun expresses the lack that caused the negative outcome.', 'Faute de + nom sans article exprime le manque à l’origine du résultat négatif.'),
        },
      ),
      mc(
        P.form,
        ['a dû', 'doive', 'devrait', 'ait dû'],
        {
          fr: 'Les tarifs ont fortement augmenté, si bien que la mairie ___ revoir son budget.',
          explain: b('Si bien que states an actual result, so it governs the indicative (a dû), not the subjunctive.', 'Si bien que introduit un fait réel (conséquence) et appelle l’indicatif (a dû).'),
        },
      ),
      gap(
        P.complete,
        '___ (Étant donné que / En raison de) la ligne est en travaux, le trafic est dévié. ___ (Dès lors / Faute de), il convient d’anticiper vos trajets.',
        [['Étant donné que'], ['Dès lors']],
        {
          choices: [
            ['Étant donné que', 'En raison de', 'Faute de'],
            ['Dès lors', 'Faute de', 'Puisque'],
          ],
        },
      ),
      sort(
        b('Cause or consequence?', 'Cause ou conséquence ?'),
        [
          b('Cause', 'Cause'),
          b('Consequence', 'Conséquence'),
        ],
        [
          ['en raison de', 0],
          ['si bien que', 1],
          ['faute de', 0],
          ['par conséquent', 1],
          ['étant donné que', 0],
          ['dès lors', 1],
        ],
      ),
      ord(
        P.order,
        'Dès lors, une réforme en profondeur apparaît indispensable.',
        { tr: 'Consequently, a thorough reform appears indispensable.' },
      ),
      dict('En raison de travaux urgents, la route est fermée, si bien que chacun prend la déviation.'),
      say('Faute de consensus rapide, la décision a été renvoyée au mois prochain.', 'For lack of a quick consensus, the decision was pushed back to next month.'),
    ],
    [
      b('Use en raison de + noun for neutral formal cause, and faute de + bare noun/infinitive for a lack.', 'Employez en raison de + nom pour une cause neutre et faute de + nom sans article / infinitif pour un manque.'),
      b('si bien que introduces a real result and always takes the indicative (unlike afin que + subjunctive).', 'si bien que introduit un résultat effectif et prend l’indicatif (contrairement à afin que + subjonctif).'),
      b('dès lors and par conséquent link a consequence smoothly at the start of a sentence.', 'dès lors et par conséquent introduisent une conséquence en tête de phrase.'),
    ],
    [
      ['faute de', b('for lack of, owing to a lack of', 'par manque de')],
      ['si bien que', b('so that, with the result that', 'à tel point que (+ indicatif)')],
      ['dès lors', b('from then on, consequently', 'à partir de là, par conséquent')],
      ['étant donné que', b('given that, considering that', 'vu que, comme')],
    ],
  ),

  lesson(
    C,
    3,
    ['nuance-and-concession', 'nuance-et-concession'],
    b('Nuance and concession: certes… mais, cela dit, toutefois', 'Nuance et concession : certes… mais, cela dit, toutefois'),
    b('Acknowledge counterarguments gracefully before pivoting to your main thesis.', 'Reconnaître une objection avec souplesse avant de recentrer votre démonstration.'),
    [
      b('Structure two-step concessions with certes… mais / cependant', 'Construire une concession en deux temps avec certes… mais / cependant'),
      b('Use cela dit, toutefois, néanmoins and quoi qu’il en soit for refined pivots', 'Employer cela dit, toutefois, néanmoins et quoi qu’il en soit pour nuancer'),
      b('Distinguish malgré + noun from bien que + subjunctive and en revanche', 'Distinguer malgré + nom de bien que + subjonctif et en revanche'),
    ],
    13,
    [
      card(
        b('Conceding before you pivot', 'Concéder avant de nuancer'),
        b(
          'Strong B2 essays rarely reject an opposing idea bluntly; they **concede** its valid kernel with **certes** (“admittedly”) and then pivot with **mais**, **cependant**, **toutefois**, or **néanmoins** (“however / nevertheless”). **Cela dit** (“that being said”) pivots colloquially yet cleanly; **quoi qu’il en soit** (“be that as it may / whatever the case”) closes a digression to return to the core point.\n\nConcede + pivot: **certes… mais, certes… toutefois, il est vrai que… néanmoins**.\nTransitional pivots: **cela dit, toutefois, en revanche**.\nResetting the debate: **quoi qu’il en soit · malgré tout · bien que (+ subj.)**.',
          'Un bon essai B2 rejette rarement une objection en bloc : il **concède** sa part de vérité avec **certes** puis nuance avec **mais**, **cependant**, **toutefois** ou **néanmoins**. **Cela dit** assure une transition souple et naturelle ; **quoi qu’il en soit** clôt une remarque pour revenir à l’essentiel.\n\nConcéder puis nuancer : **certes… mais, certes… toutefois, il est vrai que… néanmoins**.\nPivots d’opposition : **cela dit, toutefois, en revanche**.\nRecentrer le propos : **quoi qu’il en soit · malgré tout · bien que (+ subj.)**.',
        ),
        {
          table: {
            head: [b('Connector', 'Connecteur'), b('Function', 'Fonction'), b('Syntax note', 'Remarque syntaxique')],
            rows: [
              ['certes… mais / toutefois', b('concession + pivot', 'concession puis nuance'), b('paired across two clauses', 'fonctionne par paire')],
              ['cela dit', b('“that said”', '« malgré ce constat »'), b('never *ceci étant dit* overuse', 'plus léger que ceci dit')],
              ['en revanche', b('“on the other hand”', '« à l’inverse, par contraste »'), b('contrasts a positive/neutral point', 'remplace *par contre* à l’écrit')],
              ['quoi qu’il en soit', b('“be that as it may”', '« dans tous les cas »'), b('two words: quoi qu’ + il en soit', 'en deux mots : quoi qu’')],
              ['malgré vs. bien que', b('“despite” vs. “although”', '« malgré » vs « bien que »'), b('malgré + noun; bien que + subj.', 'malgré + nom ; bien que + subj.')],
            ],
          },
          ex: [
            ['Certes, le dispositif demande un investissement initial, mais il devient rentable dès la deuxième année.', 'Admittedly, the system requires an initial investment, yet it becomes profitable in the second year.'],
            ['L’étude porte sur un échantillon modeste ; toutefois, ses tendances restent éclairantes.', 'The study covers a modest sample; however, its trends remain illuminating.'],
            ['Quoi qu’il en soit, la transition énergétique impose des choix rapides.', 'Be that as it may, the energy transition demands swift choices.'],
          ],
        },
      ),
      trap(
        b('Avoid malgré que and *par contre* in formal B2 essays', 'Évitez malgré que et par contre à l’écrit B2'),
        b(
          'Two classic exam traps: (1) never use *malgré que*—use **malgré + noun** (*malgré les difficultés*) or **bien que + subjunctive** (*bien que ce soit difficile*). (2) In formal essays, replace *par contre* with **en revanche** (balanced contrast) or **cependant / toutefois** (restrictive nuance). Also watch the spelling: **quoi qu’il en soit** (2 words: “whatever may be of it”), never *quoiqu’il en soit*.\n\nWrite in exams: **en revanche, bien que + subjonctif, quoi qu’il en soit**.\nAvoid in formal prose: **malgré que · par contre · quoiqu’il en soit**.',
          'Deux pièges classiques en examen : (1) bannissez *malgré que* — employez **malgré + nom** (*malgré les obstacles*) ou **bien que + subjonctif** (*bien que cela soit difficile*). (2) À l’écrit soutenu, remplacez *par contre* par **en revanche** ou **toutefois / cependant**. Attention aussi à l’orthographe : **quoi qu’il en soit** en deux mots.\n\nÀ privilégier : **en revanche, bien que + subjonctif, quoi qu’il en soit**.\nÀ éviter à l’écrit : **malgré que · par contre · quoiqu’il en soit**.',
        ),
      ),
      mc(
        P.best,
        [
          'en revanche',
          'malgré que',
          'par conséquent',
          'de surcroît',
        ],
        {
          fr: 'Les ventes en boutique reculent ; ___, le commerce en ligne progresse nettement.',
          explain: b('En revanche expresses a balanced contrast (“on the other hand”) in formal French.', 'En revanche marque une opposition équilibrée en français soutenu.'),
        },
      ),
      mc(
        P.spelling,
        ['Quoi qu’il en soit', 'Quoiqu’il en soit', 'Quoi qu’il soit', 'Quoique il en soit'],
        {
          fr: '___, nous devons déposer ce dossier avant la fin du mois.',
          explain: b('Always write quoi qu’il en soit in two separate words (quoi + qu’).', 'Écrivez toujours quoi qu’il en soit en deux mots (quoi + qu’).'),
        },
      ),
      gap(
        P.complete,
        '___ (Certes / Quoi qu’il en soit), la procédure semble longue ; ___ (toutefois / en outre), elle protège efficacement les usagers. ___ (Bien que / Malgré) les délais soient serrés, l’accord tiendra.',
        [['Certes'], ['toutefois', 'cependant', 'néanmoins'], ['Bien que']],
        {
          choices: [
            ['Certes', 'Quoi qu’il en soit', 'Malgré'],
            ['toutefois', 'en outre', 'dès lors'],
            ['Bien que', 'Malgré', 'En raison de'],
          ],
        },
      ),
      hear(
        'Cela dit, rien n’empêche de tester cette approche dès l’automne.',
        b('What function does « Cela dit » play here?', 'Quel rôle joue « Cela dit » ici ?'),
        [
          b('It acknowledges a prior reserve and pivots toward a constructive proposal.', 'Il tient compte d’une réserve précédente et opère une transition.'),
          b('It introduces the first point of an outline.', 'Il ouvre le tout premier point d’un exposé.'),
          b('It states a strict condition using the conditional.', 'Il pose une condition stricte au conditionnel.'),
        ],
      ),
      ord(
        P.order,
        'Bien que le coût reste élevé, l’investissement demeure rentable.',
        { tr: 'Although the cost remains high, the investment remains profitable.' },
      ),
      dict('Certes, les résultats varient selon les régions ; toutefois, la tendance générale progresse.'),
      say('Quoi qu’il en soit, cette réforme répond à une attente réelle des citoyens.', 'Be that as it may, this reform answers a real expectation among citizens.'),
    ],
    [
      b('Pair certes with mais, cependant, toutefois, or néanmoins to concede a point before qualifying it.', 'Associez certes à mais, cependant, toutefois ou néanmoins pour concéder avant de nuancer.'),
      b('Use malgré + noun and bien que + subjunctive (avoiding malgré que), and prefer en revanche to par contre.', 'Employez malgré + nom et bien que + subjonctif (sans malgré que), et préférez en revanche à par contre.'),
      b('Spell the fixed idiom quoi qu’il en soit in two words (quoi + qu’).', 'Écrivez quoi qu’il en soit en deux mots (quoi + qu’).'),
    ],
    [
      ['certes… mais', b('admittedly… yet', 'il est vrai que… cependant')],
      ['cela dit', b('that being said', 'malgré cela, ceci posé')],
      ['toutefois', b('however, nevertheless', 'cependant, néanmoins')],
      ['quoi qu’il en soit', b('be that as it may', 'dans tous les cas')],
    ],
  ),

  lesson(
    C,
    4,
    ['synthesizing-and-concluding', 'synthetiser-et-conclure'],
    b('Summing up: en somme, tout compte fait, il ressort de cela que', 'Conclure : en somme, tout compte fait, il ressort de cela que'),
    b('Close a B2 essay decisively by weighing evidence and drawing clear conclusions.', 'Conclure un essai B2 avec force en pesant les arguments et en tirant un bilan clair.'),
    [
      b('Use en somme, tout compte fait and en définitive to weigh an argument', 'Employer en somme, tout compte fait et en définitive pour dresser un bilan'),
      b('Introduce analytical takeaways with il ressort de cela que and force est de constater que', 'Introduire une synthèse analytique avec il ressort de cela que et force est de constater que'),
      b('Analyze and write a complete, cohesive B2 argumentative paragraph', 'Analyser puis rédiger un paragraphe argumentatif B2 cohérent'),
    ],
    13,
    [
      card(
        b('Closing the argument with authority', 'Conclure une démonstration avec autorité'),
        b(
          'Avoid ending a B2 essay with *en conclusion* every time. **En somme** summarizes the core message (“in short / all in all”). **Tout compte fait** and **en définitive** weigh the pros and cons to deliver a final verdict (“all things considered / ultimately”). For an analytical synthesis, **il ressort de cela que** (“it emerges from this that”) and **force est de constater que** (“one must acknowledge that”) take the **indicative**.\n\nSummarizing: **en somme, en résumé, pour ainsi dire**.\nWeighing pros & cons: **tout compte fait, en définitive, au bout du compte**.\nAnalytical verdict (+ indicative): **il ressort de cela que · force est de constater que**.',
          'Évitez de conclure toujours par *en conclusion*. **En somme** résume l’essentiel (« en résumé »). **Tout compte fait** et **en définitive** pèsent le pour et le contre pour trancher (« tout bien pesé / finalement »). Pour une synthèse analytique, **il ressort de cela que** et **force est de constater que** sont suivis de l’**indicatif**.\n\nSynthétiser : **en somme, en résumé, pour ainsi dire**.\nTrancher après examen : **tout compte fait, en définitive, au bout du compte**.\nBilan analytique (+ indicatif) : **il ressort de cela que · force est de constater que**.',
        ),
        {
          table: {
            head: [b('Closing phrase', 'Formule de bilan'), b('Tone / nuance', 'Nuance'), b('Mood after que', 'Mode après que')],
            rows: [
              ['en somme', b('concise summary (“all in all”)', 'résumé synthétique'), b('—', '—')],
              ['tout compte fait', b('after weighing pros & cons', 'après avoir pesé le pour et le contre'), b('—', '—')],
              ['en définitive', b('final verdict (“ultimately”)', 'jugement final'), b('—', '—')],
              ['il ressort de cela que', b('“it follows / emerges from this that”', 'bilan logique d’une analyse'), b('indicative', 'indicatif')],
              ['force est de constater que', b('“one has to acknowledge that”', 'constat incontournable'), b('indicative', 'indicatif')],
            ],
          },
          ex: [
            ['En somme, la gratuité des transports profite autant à l’écologie qu’au pouvoir d’achat.', 'All in all, free public transit benefits ecology as much as purchasing power.'],
            ['Tout compte fait, les avantages de cette réforme l’emportent sur ses contraintes.', 'All things considered, the advantages of this reform outweigh its drawbacks.'],
            ['Il ressort de cela que l’investissement dans la prévention réduit les coûts à long terme.', 'It emerges from this that investing in prevention lowers long-term costs.'],
          ],
        },
      ),
      doc(
        {
          look: 'article',
          title: b('Editorial excerpt: urban greening', 'Extrait éditorial : végétaliser les centres-villes'),
          text: 'Tout d’abord, la plantation d’arbres en centre-ville réduit sensiblement la chaleur estivale. En outre, ces espaces verts favorisent la biodiversité et améliorent la qualité de l’air. Certes, l’entretien de ces aménagements représente un coût municipal important. Toutefois, faute d’action rapide, les épisodes de canicule rendront certains quartiers invivables. Il ressort de cela que végétaliser nos rues constitue un investissement d’avenir, et non une dépense superflue.',
        },
        b('According to this passage, what is the exact role of « Toutefois »?', 'D’après cet extrait, quel est le rôle précis de « Toutefois » ?'),
        [
          b('It pivots from a conceded cost to an urgent counterargument.', 'Il répond à l’objection du coût en rappelant l’urgence d’agir.'),
          b('It introduces the final conclusion of the article.', 'Il introduit la conclusion finale de l’article.'),
          b('It adds a second positive point in the exact same direction.', 'Il ajoute un second avantage dans exactement le même sens.'),
        ],
        {
          explain: b('After Certes concedes the maintenance cost, Toutefois pivots back to show why inaction would be worse.', 'Après Certes (qui concède le coût), Toutefois rétablit la thèse en montrant le risque d’inaction.'),
        },
      ),
      mc(
        P.form,
        ['qu’une formation continue s’impose', 'qu’une formation continue s’imposait pas', 'que une formation continue s’impose', 'qu’une formation continue s’imposerait jamais'],
        {
          fr: 'Il ressort de cette enquête ___.',
          explain: b('Il ressort de… que states an established analytical finding and takes the indicative (s’impose).', 'Il ressort de… que présente un constat établi et demande l’indicatif (s’impose).'),
        },
      ),
      gap(
        P.completeText,
        '___ (En somme / Faute de), ce projet concilie ambition et réalisme. ___ (Tout compte fait / À moins de), malgré les réserves initiales, ___ (il ressort de cela que / en premier lieu) la coopération entre les services a porté ses fruits.',
        [['En somme'], ['Tout compte fait'], ['il ressort de cela que']],
        {
          choices: [
            ['En somme', 'Faute de', 'Par ailleurs'],
            ['Tout compte fait', 'À moins de', 'Tout d’abord'],
            ['il ressort de cela que', 'en premier lieu', 'certes'],
          ],
        },
      ),
      dlg(
        b('Preparing an oral exam conclusion', 'Préparer la conclusion d’un oral B2'),
        b('Claire helps Mehdi polish the closing of his DELF B2 presentation.', 'Claire aide Mehdi à peaufiner la conclusion de son exposé DELF B2.'),
        [['Claire', 'f'], ['Mehdi', 'm']],
        [
          [0, 'Ton développement est clair, mais ta fin arrive un peu brusquement.', 'Your body section is clear, but your ending arrives a bit abruptly.'],
          [1, { options: ['Je pourrais donc résumer avec « En somme » puis ouvrir sur l’avenir ?', 'Je pourrais donc résumer avec « Tout d’abord » puis ouvrir sur l’avenir ?', 'Je pourrais donc résumer avec « En outre » puis ouvrir sur l’avenir ?'] }],
          [0, 'Oui, et si tu veux montrer que ton bilan s’appuie sur les chiffres cités avant, essaie une tournure analytique.', 'Yes, and if you want to show your verdict rests on the figures cited earlier, try an analytical turn.'],
          [1, { options: ['Par exemple : « Il ressort de cela que la mixité des usages reste la clé » ?', 'Par exemple : « Faute de cela que la mixité des usages reste la clé » ?', 'Par exemple : « Quant à cela que la mixité des usages reste la clé » ?'] }],
        ],
      ),
      pairs(
        P.match,
        [
          ['en somme', b('in short, all in all', 'en résumé, pour aller à l’essentiel')],
          ['tout compte fait', b('all things considered', 'tout bien pesé, après bilan')],
          ['en définitive', b('ultimately, in the final analysis', 'au bout du compte, finalement')],
          ['force est de constater que', b('one must recognize that', 'on est bien obligé de reconnaître que')],
        ],
      ),
      ord(
        P.order,
        'Tout compte fait, cette solution concilie efficacité et sobriété.',
        { tr: 'All things considered, this solution reconciles efficiency and restraint.' },
      ),
      say('Il ressort de cela que la concertation reste indispensable dès le lancement.', 'It follows from this that consultation remains essential right from the launch.'),
      write(
        b('Write a structured B2 argumentative paragraph', 'Rédiger un paragraphe argumentatif B2 structuré'),
        b(
          'In 55 to 85 words, argue for or against remote work two days a week. Connect your points smoothly with at least four different connectors: one structuring/adding (tout d’abord / en outre / par ailleurs), one cause or consequence (en raison de / dès lors / si bien que), one concession (certes… mais / toutefois / cela dit), and one conclusion (en somme / tout compte fait / il ressort de cela que).',
          'En 55 à 85 mots, défendez ou nuancez le télétravail deux jours par semaine. Enchaînez vos idées avec au moins quatre connecteurs variés : structuration/ajout (tout d’abord / en outre / par ailleurs), cause ou conséquence (en raison de / dès lors / si bien que), concession (certes… mais / toutefois / cela dit) et bilan (en somme / tout compte fait / il ressort de cela que).',
        ),
        55,
        85,
        [
          b('One opening/adding connector (tout d’abord, en outre, par ailleurs)', 'Un connecteur d’ouverture ou d’ajout'),
          b('One cause/consequence connector (en raison de, si bien que, dès lors)', 'Un connecteur de cause ou de conséquence'),
          b('One concession + one synthesis/conclusion connector', 'Une concession et une formule de conclusion'),
        ],
        'Tout d’abord, deux jours de télétravail réduisent la fatigue liée aux trajets, si bien que la concentration s’améliore nettement. Par ailleurs, cette souplesse facilite l’équilibre entre vie professionnelle et vie familiale. Certes, le maintien de la cohésion d’équipe exige une organisation rigoureuse ; toutefois, des réunions hebdomadaires en présentiel répondent à ce besoin. En somme, un modèle hybride bien encadré profite à chacun.',
        {
          phrases: ['Tout d’abord', 'si bien que', 'Par ailleurs', 'Certes', 'toutefois', 'En somme'],
        },
      ),
    ],
    [
      b('Use en somme to summarize, tout compte fait and en définitive to weigh pros and cons, and il ressort de cela que (+ indicative) for analytical takeaways.', 'Employez en somme pour résumer, tout compte fait et en définitive pour trancher après bilan, et il ressort de cela que (+ indicatif) pour une conclusion analytique.'),
      b('Check the logical role of every connector: adding in the same direction (en outre) differs from shifting topic (par ailleurs) or conceding (certes… toutefois).', 'Vérifiez le rôle logique de chaque connecteur : ajouter (en outre), élargir (par ailleurs) et concéder (certes… toutefois).'),
    ],
    [
      ['en somme', b('in short, all in all', 'en résumé')],
      ['tout compte fait', b('all things considered', 'tout bien pesé')],
      ['en définitive', b('ultimately, in the end', 'au bout du compte')],
      ['il ressort de cela que', b('it emerges from this that', 'il découle de cette analyse que')],
    ],
  ),
];

export default lessons;
