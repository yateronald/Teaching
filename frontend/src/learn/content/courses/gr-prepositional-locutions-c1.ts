import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Deploy formal French prepositional locutions accurately at C1: à l’instar de, faute de, au prix de, aux dépens de, au gré de, en dépit de, quitte à, and sous réserve de.',
    'Manier avec justesse les locutions prépositives abstraites du niveau C1 : à l’instar de, faute de, au prix de, aux dépens de, au gré de, en dépit de, quitte à et sous réserve de.',
  ),
  outcomes: [
    b('Select precise formal prepositions replacing clumsy whole-clause explanations.', 'Remplacer des subordonnées lourdes par des locutions prépositives concises et justes.'),
    b('Distinguish look-alikes cleanly: au prix de vs. aux dépens de, en dépit de vs. faute de, à l’instar de vs. contrairement à.', 'Distinguer les locutions proches : au prix de contre aux dépens de, faute de contre grâce à, à l’instar de.'),
    b('Avoid prepositional pleonasms and use quitte à + infinitive with exact subject control.', 'Éviter les pléonasmes prépositifs et employer quitte à + infinitif avec un sujet identique.'),
  ],
};

const lessons: Lesson[] = [
  lesson(
    'gr-prepositional-locutions-c1',
    1,
    ['analogy-lack-and-cost', 'analogie-manque-et-effort-c1'],
    b('Analogy, Lack & Sacrifice: à l’instar de, faute de, au prix de', 'Analogie, manque et prix à payer : à l’instar de, faute de, au prix de'),
    b('Replace wordy clauses with crisp prepositional phrases signalling comparison, absence, or high cost.', 'Condenser comparaison, manque et sacrifice grâce aux locutions prépositives abstraites.'),
    [
      b('Use à l’instar de (strictly “just like”, never “contrary to”!) and quant à + noun.', 'Employer à l’instar de uniquement au sens de « comme, à l’exemple de » et maîtriser quant à.'),
      b('Contrast faute de (missing needed resource) vs. à défaut de (fallback substitute) vs. au prix de (hard effort).', 'Opposer faute de (absence), à défaut de (solution de repli) et au prix de (sacrifice consenti).'),
    ],
    13,
    [
      card(
        b('High-precision locutions in essays and editorials', 'Des locutions denses pour l’essai et l’article'),
        b(
          '**À l’instar de** means strictly **like / following the example of** — never use it to mean “unlike”! Notice that **faute de** and **à défaut de** drop the article before an abstract noun (**faute de temps**, **à défaut de preuve**).\nComparison & topic: **à l’instar de, à l’image de, quant à, par rapport à**.\nAbsence & fallback: **faute de, à défaut de, par manque de, en l’absence de**.\nCost & sacrifice: **au prix de, aux dépens de, au détriment de**.',
          '**À l’instar de** signifie uniquement **comme, à l’exemple de** : ne l’employez jamais pour marquer une opposition ! Notez l’absence d’article après **faute de** et **à défaut de** devant un nom abstrait (**faute de moyens**, **à défaut d’accord**).\nComparaison et thème : **à l’instar de, à l’image de, quant à, au regard de**.\nManque et repli : **faute de, à défaut de, par manque de, en l’absence de**.\nCoût et sacrifice : **au prix de, aux dépens de, au détriment de**.',
        ),
        {
          table: {
            head: [b('Locution', 'Locution'), b('Exact meaning', 'Sens exact'), b('Typical noun / construction', 'Construction type')],
            rows: [
              ['à l’instar de', b('just like, following the example of', 'tout comme, à l’exemple de'), 'à l’instar de ses voisins'],
              ['faute de (+ Ø noun)', b('for lack of (causing failure/inaction)', 'par manque de (ce qui empêche)'), 'faute de preuves / faute de mieux'],
              ['à défaut de', b('in default of (substituting)', 'à la place de (solution de repli)'), 'à défaut d’un consensus'],
              ['aux dépens de', b('at the expense of (harming X)', 'au préjudice de'), 'aux dépens de la qualité'],
            ],
          },
          ex: [
            ['À l’instar de Montréal, plusieurs métropoles revoient leurs plans de mobilité.', 'Like Montreal, several metropolises are revising their mobility plans.'],
            ['Faute de financements pérennes, l’observatoire a dû suspendre ses relevés.', 'For lack of lasting funding, the observatory had to suspend its surveys.'],
            ['La rapidité d’exécution ne doit pas se faire aux dépens de la rigueur.', 'Speed of execution must not come at the expense of rigour.'],
          ],
        },
      ),
      trap(
        b('False-friend warning on à l’instar de', 'Piège fréquent sur à l’instar de'),
        b(
          'Even native speakers occasionally confuse *à l’instar de* (“like”) with *à l’encontre de* (“against / contrary to”). Exam graders penalise this mix-up immediately.',
          'On confond parfois à tort *à l’instar de* (« comme ») avec *à l’encontre de* (« contre ») ou *à l’inverse de*. Aux épreuves C1, l’erreur est vite sanctionnée.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('Faute de consensus, la séance a été reportée.', 'Parce qu’il manquait un accord, la séance a été reportée.'),
          b('Pour punir le désaccord, on a annulé la séance.', 'La séance a été annulée à cause d’une faute professionnelle.'),
          b('En dépit du consensus unanime, la séance a été reportée.', 'Malgré l’accord unanime, la séance a été reportée.'),
        ],
        { fr: 'Faute de consensus, la séance a été reportée.', explain: b('Faute de means “owing to the lack of”, never “due to someone’s mistake”.', 'Faute de signifie « par manque de », et non « à cause d’une faute morale ».') },
      ),
      gap(
        b('Choose the exact locution for each sentence.', 'Choisissez la locution prépositive exacte.'),
        '___ d’un bilan définitif, nous travaillons sur les chiffres provisoires ; cette méthode a toutefois été adoptée ___ de longues négociations.',
        ['À défaut', 'au prix'],
        {
          choices: [['À défaut', 'À l’instar', 'Aux dépens'], ['au prix', 'faute', 'quant']],
          explain: b('À défaut d’un bilan = falling back when the ideal thing is absent; au prix de = achieved after great effort.', 'À défaut de marque le recours de repli ; au prix de souligne l’effort consenti.'),
        },
      ),
      hear(
        'Elle a conquis ce marché au prix d’efforts soutenus, jamais aux dépens de son équipe.',
        P.listen,
        [
          b('Through hard work, never harming her team.', 'Par de grands efforts personnels, sans nuire à son équipe.'),
          b('By cutting staff salaries to boost profit.', 'En sacrifiant son équipe pour gagner de l’argent.'),
          b('For lack of effort from her team.', 'Par manque de soutien de son équipe.'),
        ],
      ),
      sort(
        P.sort,
        [b('Similarity or topic', 'Analogie ou thème'), b('Cost or negative trade-off', 'Coût ou préjudice'), b('Missing resource', 'Manque ou repli')],
        [
          ['à l’instar de', 0],
          ['au prix de', 1],
          ['faute de', 2],
          ['quant à', 0],
          ['aux dépens de', 1],
          ['à défaut de', 2],
        ],
      ),
      dict('À l’instar de ses pairs, il a agi faute de temps.'),
    ],
    [
      b('À l’instar de always signals similarity (“like”); à l’encontre de signals opposition.', 'À l’instar de exprime exclusivement la ressemblance (« comme ») ; à l’encontre de marque l’opposition.'),
      b('Drop the article after faute de + abstract noun; distinguish au prix de (effort) from aux dépens de (harm).', 'On omet l’article après faute de + nom abstrait ; on distingue au prix de (effort) et aux dépens de (détriment).'),
    ],
    [
      ['à l’instar de', 'just like, in the manner of'],
      ['faute de (+ Ø)', 'for lack of'],
      ['à défaut de', 'failing, in the absence of (fallback)'],
      ['aux dépens de', 'at the expense of'],
    ],
  ),

  lesson(
    'gr-prepositional-locutions-c1',
    2,
    ['condition-risk-and-margin-locutions', 'condition-risque-et-concession-c1'],
    b('Condition, Risk & Concession: quitte à, sous réserve de, en dépit de', 'Condition, risque et réserve : quitte à, sous réserve de, en dépit de'),
    b('Express calculated risk, legal conditions, and shifting forces with quitte à, sous réserve de, and au gré de.', 'Exprimer le risque assumé, la condition restrictive et l’aléa avec quitte à, sous réserve de et au gré de.'),
    [
      b('Control subject coreference in quitte à + infinitive (“even if it means…”).', 'Respecter la coréférence du sujet dans quitte à + infinitif.'),
      b('Deploy sous réserve de, au gré de, and en dépit de without prepositional clutter.', 'Manier sous réserve de, au gré de et en dépit de sans maladresse.'),
    ],
    13,
    [
      card(
        b('Calculated concessions and conditions in C1 style', 'Risque assumé, réserve et mouvement en C1'),
        b(
          '**Quitte à + infinitive** introduces an unwanted side effect accepted willingly by the **same subject** (**Il dit ce qu’il pense, quitte à déplaire**). **Sous réserve de** introduces a strict precondition (**sous réserve d’acceptation**), while **au gré de** evokes drifting along with external currents or whims (**au gré des saisons / de ses humeurs**).\nCalculated risk: **quitte à + infinitif, au risque de + infinitif, fût-ce au prix de**.\nLegal condition: **sous réserve de, moyennant, à condition de**.\nDrifting / adapting: **au gré de, au fil de, à mesure que**.',
          '**Quitte à + infinitif** introduit une conséquence fâcheuse acceptée délibérément par le **sujet principal** (**Il tranche vite, quitte à froisser certains collègues**). **Sous réserve de** pose une condition préalable (**sous réserve de validation**), tandis qu’**au gré de** évoque un mouvement soumis aux circonstances ou aux humeurs (**au gré des vents**, **au gré des réformes**).\nRisque accepté : **quitte à + infinitif, au risque de + infinitif, dût-il + infinitif**.\nCondition juridique : **sous réserve de, moyennant, à l’issue de**.\nFluctuation : **au gré de, au fil de, au fur et à mesure de**.',
        ),
        {
          ex: [
            ['Nous maintiendrons cette exigence, quitte à rallonger les délais de deux semaines.', 'We will maintain this requirement, even if it means extending the deadline by two weeks.'],
            ['L’aide est accordée sous réserve de la remise du bilan comptable.', 'The grant is awarded subject to submission of the financial statement.'],
            ['Les prix fluctuent au gré des récoltes et des tensions logistiques.', 'Prices fluctuate at the mercy of harvests and logistical tensions.'],
          ],
        },
      ),
      pairs(
        P.match,
        [
          ['quitte à + infinitif', b('even at the risk of willingly accepting X', 'quitte à accepter une conséquence négative')],
          ['sous réserve de + nom', b('subject to a prior requirement', 'à condition que X soit satisfait')],
          ['au gré des circonstances', b('as circumstances shift / unpredictably', 'selon les variations aléatoires')],
          ['en dépit de tout bon sens', b('despite all common sense', 'malgré toute logique élémentaire')],
        ],
      ),
      mc(
        P.best,
        [
          b('Elle défend l’indépendance du journal, quitte à perdre certains annonceurs.', 'Elle défend l’indépendance du journal, quitte à perdre certains annonceurs.'),
          b('Elle défend l’indépendance du journal, quitte de perdre certains annonceurs.', 'Elle défend l’indépendance du journal, quitte de perdre certains annonceurs.'),
          b('Elle défend l’indépendance du journal, quitte à ce que perdre des annonceurs.', 'Elle défend l’indépendance du journal, quitte à ce que perdre des annonceurs.'),
        ],
        { explain: b('Always quitte à + infinitive (never quitte de).', 'La construction figée est toujours quitte à + infinitif.') },
      ),
      gap(
        b('Complete with the right formal locution.', 'Complétez avec la locution exacte.'),
        'Votre candidature est retenue ___ vérification du diplôme ; ne modifiez pas votre cap ___ modes passagères.',
        ['sous réserve de', 'au gré des'],
        {
          choices: [['sous réserve de', 'quitte à', 'faute de'], ['au gré des', 'en dépit', 'à l’instar des']],
          explain: b('sous réserve de = conditional upon; au gré des (de + les = des) = at the whim of passing trends.', 'sous réserve de pose une condition ; au gré des (contraction de de + les) signifie « selon les caprices de ».'),
        },
      ),
      ord(
        P.order,
        'En dépit des critiques initiales, il a poursuivi sa réforme quitte à diviser son camp.',
        {
          tr: 'Despite initial criticism, he pursued his reform even at the risk of dividing his camp.',
          extra: ['que', 'malgré'],
        },
      ),
      say('Sous réserve de votre accord écrit, le dossier partira dès demain.', 'Subject to your written agreement, the file will go out first thing tomorrow.'),
    ],
    [
      b('Quitte à + infinitive accepts a possible downside deliberately and shares the main clause subject.', 'Quitte à + infinitif accepte d’avance une conséquence indésirable avec le même sujet.'),
      b('Use sous réserve de for formal conditions and au gré de for fluctuating external currents.', 'Sous réserve de exprime une condition formelle, tandis qu’au gré de traduit une variation subie.'),
    ],
    [
      ['quitte à + inf.', 'even if it means'],
      ['sous réserve de', 'subject to'],
      ['au gré de', 'at the mercy of / according to shifts in'],
      ['en dépit de', 'in spite of (elevated)'],
    ],
  ),

  lesson(
    'gr-prepositional-locutions-c1',
    3,
    ['relation-and-means-locutions', 'rapport-moyen-et-precision-c1'],
    b('Means, Scope & Reference: à l’appui de, eu égard à, moyennant', 'Appui, portée et mesure : à l’appui de, eu égard à, moyennant'),
    b('Upgrade bureaucratic or essay transitions with eu égard à, au regard de, moyennant, and à l’encontre de.', 'Maîtriser eu égard à, au regard de, moyennant, à l’appui de et à l’encontre de dans l’écrit C1.'),
    [
      b('Distinguish au regard de (when measured against) vs. eu égard à (taking into account) vs. à l’égard de (toward someone).', 'Distinguer au regard de, eu égard à et à l’égard de sans jamais les confondre.'),
      b('Integrate moyennant, à l’appui de, and à la faveur de into crisp administrative/academic prose.', 'Intégrer moyennant, à l’appui de et à la faveur de dans un texte soutenu.'),
    ],
    13,
    [
      card(
        b('Three look-alikes with regard, plus means and backing', 'Trois cousins autour d’égard/regard, plus moyen et appui'),
        b(
          'Students frequently mix up **à l’égard de** (attitude toward a person: *respectueux à l’égard des aînés*), **eu égard à** (taking into account constraints: *eu égard à son âge*), and **au regard de** (when weighed against a benchmark: *modeste au regard des besoins*). Notice **eu égard** never varies!\nÉgard family: **à l’égard de, eu égard à, au regard de**.\nMeans & backing: **moyennant (+ noun), à l’appui de, à la faveur de, grâce à**.\nOpposition: **à l’encontre de, contrairement à**.',
          'On confond souvent **à l’égard de** (attitude envers quelqu’un), **eu égard à** (compte tenu de : *eu égard aux circonstances*, toujours invariable) et **au regard de** (par comparaison avec : *insuffisant au regard des enjeux*).\nFamille égard/regard : **à l’égard de, eu égard à, au regard de**.\nMoyen et appui : **moyennant (+ nom), à l’appui de, à la faveur de, par le biais de**.\nOpposition : **à l’encontre de, contrairement à**.',
        ),
        {
          ex: [
            ['Ce résultat paraît remarquable au regard des moyens engagés.', 'This outcome seems remarkable in light of the resources committed.'],
            ['Eu égard à l’urgence sanitaire, la commission a siégé sans délai.', 'Given the health urgency, the commission convened without delay.'],
            ['Elle a fourni trois expertises indépendantes à l’appui de sa requête.', 'She provided three independent expert reports in support of her request.'],
          ],
        },
      ),
      mc(
        P.best,
        [
          b('L’arrêté va à l’encontre des recommandations scientifiques.', 'L’arrêté va à l’encontre des recommandations scientifiques.'),
          b('L’arrêté va à l’instar des recommandations scientifiques.', 'L’arrêté va à l’instar des recommandations scientifiques.'),
          b('L’arrêté va à l’égard des recommandations scientifiques.', 'L’arrêté va à l’égard des recommandations scientifiques.'),
        ],
        { explain: b('“Go against / run counter to” = aller à l’encontre de.', '« S’opposer à / contredire » se dit aller à l’encontre de.') },
      ),
      gap(
        b('Choose the exact locution among à l’égard de, eu égard à, and au regard de.', 'Distinguez à l’égard de, eu égard à et au regard de.'),
        'Il fait preuve d’une grande courtoisie ___ ses adversaires, mais reste lucide : ___ la situation critique, les progrès demeurent modestes ___ objectifs fixés.',
        ['à l’égard de', 'eu égard à', 'au regard des'],
        {
          choices: [['à l’égard de', 'eu égard à', 'au regard de'], ['eu égard à', 'à l’égard de', 'au regard de'], ['au regard des', 'à l’égard des', 'eu égard aux']],
          explain: b('Attitude toward people = à l’égard de; taking context into account = eu égard à; benchmark comparison = au regard de.', 'Attitude envers des personnes : à l’égard de ; compte tenu du contexte : eu égard à ; comparaison avec des objectifs : au regard de.'),
        },
      ),
      dlg(
        b('Editing a legal-policy report', 'Réviser un mémoire de politique publique'),
        b('An editor sharpens imprecise prepositions before submitting to a ministry.', 'Un directeur de publication affine trois locutions prépositives avant remise.'),
        [['Claire', 'f2'], ['Thomas', 'm2']],
        [
          [0, 'Dans la synthèse, tu écris « avec de nombreux exemples qui appuient cette thèse ». Plus concis ?', 'In the summary you wrote “avec de nombreux exemples qui appuient cette thèse”. More concise?'],
          [1, {
            options: [
              'On peut dire « de nombreux exemples à l’appui de cette thèse » ou « moyennant une étude rigoureuse » selon l’idée.',
              'Remplace simplement par « à l’instar de cette thèse ».',
              'Écris « eu égard de cette thèse » avec de.',
            ],
            explain: b('À l’appui de + noun concisely means “in support of”, and eu égard takes à (never de).', 'À l’appui de signifie « pour étayer », tandis qu’eu égard se construit avec à.'),
          }],
          [0, 'Et si l’accord intervient parce que la crise économique a tout bouleversé ?', 'And if an event takes place thanks to / under cover of a favourable shift or crisis?'],
          [1, {
            options: [
              'Utilise « à la faveur d’un changement de contexte » quand les circonstances l’ont facilité.',
              'Utilise toujours « aux dépens du contexte ».',
              'Mets « à l’encontre du contexte » dans ce sens positif.',
            ],
            explain: b('À la faveur de introduces circumstances that made something possible.', 'À la faveur de introduit un contexte propice qui rend une action possible.'),
          }],
        ],
      ),
      ord(
        P.order,
        'Ce bilan reste fragile au regard des défis climatiques actuels.',
        {
          tr: 'This record remains fragile in view of current climate challenges.',
          extra: ['eu', 'égard'],
        },
      ),
      dict('Eu égard aux délais, elle a transmis le dossier à l’appui de sa demande.'),
    ],
    [
      b('Distinguish à l’égard de (toward people), eu égard à (taking into account), and au regard de (compared against).', 'Ne confondez pas à l’égard de (envers quelqu’un), eu égard à (compte tenu de) et au regard de (par rapport à).'),
      b('À l’appui de (“in support of”) and moyennant (“in exchange for / by means of”) streamline complex clauses.', 'À l’appui de et moyennant permettent de resserrer des phrases trop analytiques.'),
    ],
    [
      ['eu égard à', 'taking into account (invariable)'],
      ['au regard de', 'compared against, in light of'],
      ['à l’égard de', 'toward (someone)'],
      ['à l’appui de', 'in support of'],
      ['à la faveur de', 'taking advantage of / facilitated by'],
    ],
  ),
];

export default lessons;
