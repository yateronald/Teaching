import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At C1 level, impersonal constructions let you argue with objectivity, authority, and precision. Master the subjunctive-versus-indicative matrix (il convient que, il importe que vs. il s’avère que, il appert que, il s’ensuit que), wield fixed C1 expressions like il va sans dire que and il n’en demeure pas moins que, and transform heavy clauses into crisp nominalizations.',
    'Au niveau C1, les tournures impersonnelles confèrent à l’argumentation objectivité, autorité et précision. Maîtrisez l’opposition entre subjonctif et indicatif (il convient que, il importe que contre il s’avère que, il appert que, il s’ensuit que), employez des locutions figées comme il va sans dire que ou il n’en demeure pas moins que, et passez avec aisance à la nominalisation.',
  ),
  outcomes: [
    b('Select the right mood across C1 impersonal verbs (il convient que, il importe que, il s’avère que, il appert que, il s’ensuit que)', 'Choisir sans hésiter le bon mode après les verbes impersonnels C1 (subjonctif vs indicatif)'),
    b('Wield high-register fixed expressions: il va sans dire que, il n’en demeure pas moins que, il y a lieu de', 'Manier les tournures figées C1 : il va sans dire que, il n’en demeure pas moins que, il y a lieu de'),
    b('Streamline impersonal que-clauses into infinitives or dense C1 nominalizations', 'Condenser les propositions impersonnelles en infinitifs ou en groupes nominaux C1'),
  ],
};

const C = 'gr-impersonal-formal-c1';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['impersonal-mood-matrix', 'matrice-des-modes-impersonnels'],
    b('The C1 impersonal mood matrix: subjunctive vs. indicative', 'La matrice des modes impersonnels : subjonctif ou indicatif'),
    b('Separate expressions of necessity, rarity and possibility from expressions of established truth and consequence.', 'Séparer les verbes d’exigence, de fréquence ou d’éventualité de ceux de constat établi et de conséquence.'),
    [
      b('Use the subjunctive after il convient que, il importe que, il suffit que and il arrive que', 'Employer le subjonctif après il convient que, il importe que, il suffit que et il arrive que'),
      b('Use the indicative after il s’avère que, il appert que, il s’ensuit que and il est manifeste que', 'Employer l’indicatif après il s’avère que, il appert que, il s’ensuit que et il est manifeste que'),
      b('Track mood shifts when certainty turns negative or interrogative', 'Gérer les bascules de mode à la forme négative ou interrogative'),
    ],
    13,
    [
      card(
        b('Necessity & judgment vs. proven fact', 'Exigence et appréciation contre fait avéré'),
        b(
          'At C1, impersonal structures fall cleanly into two groups. Expressions of **necessity, importance, rarity, or mere possibility** govern the **subjonctif**: **il convient que** (“it is fitting that”), **il importe que** (“it matters that”), **il suffit que**, **il arrive que** (“it happens that”), **il se peut que**. Expressions of **verification, obvious truth, or logical consequence** govern the **indicatif**: **il s’avère que** (“it turns out that”), **il appert que** (legal/formal: “it is apparent from records that”), **il s’ensuit que** (“it follows that”), **il est manifeste que**.\n\nSubjunctive triggers: **il convient que, il importe que, il arrive que**.\nIndicative triggers: **il s’avère que, il appert que, il s’ensuit que**.\nPolarity shift: **il est probable que (+ ind.) · il est peu probable que (+ subj.)**.',
          'Au niveau C1, les tournures impersonnelles se répartissent en deux pôles nets. L’**exigence, la nécessité, la fréquence incertaine ou la possibilité** appellent le **subjonctif** : **il convient que**, **il importe que**, **il suffit que**, **il arrive que**, **il se peut que**. Le **constat vérifié, l’évidence ou la conséquence logique** appellent l’**indicatif** : **il s’avère que**, **il appert que** (juridique/soutenu : « il ressort clairement des pièces que »), **il s’ensuit que**, **il est manifeste que**.\n\nSubjonctif : **il convient que, il importe que, il arrive que**.\nIndicatif : **il s’avère que, il appert que, il s’ensuit que**.\nBascule de polarité : **il est probable que (+ ind.) · il est peu probable que (+ subj.)**.',
        ),
        {
          table: {
            head: [b('Impersonal expression', 'Tournure impersonnelle'), b('Mood', 'Mode'), b('Meaning', 'Sens')],
            rows: [
              ['il convient que / il importe que', b('subjunctive', 'subjonctif'), b('it is fitting / important that', 'il est opportun / essentiel que')],
              ['il arrive que', b('subjunctive', 'subjonctif'), b('it occasionally happens that', 'il se produit parfois que')],
              ['il s’avère que', b('indicative', 'indicatif'), b('it turns out to be true that', 'il se révèle exact que')],
              ['il appert que (très soutenu)', b('indicative', 'indicatif'), b('it clearly appears (from evidence) that', 'il apparaît avec évidence que')],
              ['il s’ensuit que', b('indicative', 'indicatif'), b('it follows logically that', 'il résulte logiquement que')],
            ],
          },
          ex: [
            ['Il importe que chaque citoyen comprenne les enjeux de cette consultation.', 'It is important that every citizen understand what is at stake in this consultation.'],
            ['Après vérification, il s’avère que les données initiales étaient exactes.', 'Upon verification, it turns out that the initial data were accurate.'],
            ['Il appert des pièces du dossier que la procédure a été respectée.', 'It is apparent from the case file documents that procedure was followed.'],
          ],
        },
      ),
      trap(
        b('Il arrive que and il est peu probable que take the subjunctive', 'Attention à il arrive que et il est peu probable que'),
        b(
          'Even though *it happens* sounds factual in English, **il arrive que** expresses an irregular, uncertain occurrence and always governs the **subjunctive** in standard French (*Il arrive qu’on **soit** surpris*). Likewise, **il est probable / évident / certain que** takes the **indicative** when affirmative, yet flips to the **subjunctive** when negated, restricted by *peu*, or questioned with inversion (*Il est peu probable qu’il **vienne***, *Est-il certain qu’elle **ait** accepté ?*).\n\nAlways subjunctive: **il arrive qu’il pleuve, il se peut qu’elle sache**.\nFlips to subjunctive: **il est peu probable qu’il vienne · il n’est pas certain qu’elle soit prête**.',
          'Bien que *il arrive que* décrive une réalité ponctuelle, il marque une éventualité aléatoire et demande toujours le **subjonctif** en français soigné (*Il arrive qu’on **soit** surpris*). De même, **il est probable / évident / certain que** prend l’**indicatif** à l’affirmatif, mais bascule au **subjonctif** à la forme négative, interrogative inversée ou avec *peu* (*Il est peu probable qu’il **vienne***).\n\nToujours subjonctif : **il arrive qu’il pleuve, il se peut qu’elle sache**.\nBascule au subjonctif : **il est peu probable qu’il vienne · il n’est pas certain qu’elle soit prête**.',
        ),
      ),
      mc(
        P.form,
        ['soit', 'est', 'sera', 'serait'],
        {
          fr: 'Dans ce domaine complexe, il arrive souvent qu’une règle ___ mal interprétée.',
          explain: b('Il arrive que always governs the subjunctive (soit), even with souvent.', 'Il arrive que régit toujours le subjonctif (soit), même accompagné de souvent.'),
        },
      ),
      mc(
        P.form,
        ['a été modifiée', 'ait été modifiée', 'soit modifiée', 'fût modifiée'],
        {
          fr: 'Tout bien vérifié, il s’avère que la clause ___ dès la première version.',
          explain: b('Il s’avère que states a verified fact and takes the indicative (a été modifiée).', 'Il s’avère que constate un fait vérifié et appelle l’indicatif (a été modifiée).'),
        },
      ),
      gap(
        P.complete,
        'Il convient que le comité ___ (prendre) une décision cette semaine. Il s’ensuit que nos partenaires ___ (devoir — présent) adapter leur calendrier. Il est d’ailleurs peu probable qu’un report ___ (être) accordé.',
        [['prenne'], ['doivent'], ['soit']],
      ),
      hear(
        'Il importe que vous fassiez preuve de discernement tout au long de l’audit.',
        b('Which mood follows « Il importe que »?', 'Quel mode suit « Il importe que » ?'),
        [
          b('The subjunctive (fassiez)', 'Le subjonctif (fassiez)'),
          b('The indicative imperfect (faisiez)', 'L’imparfait de l’indicatif (faisiez)'),
          b('The future indicative (ferez)', 'Le futur de l’indicatif (ferez)'),
        ],
      ),
      sort(
        b('Subjunctive or indicative after que?', 'Subjonctif ou indicatif après que ?'),
        [
          b('Subjunctive', 'Subjonctif'),
          b('Indicative', 'Indicatif'),
        ],
        [
          ['il convient que', 0],
          ['il s’avère que', 1],
          ['il arrive que', 0],
          ['il s’ensuit que', 1],
          ['il importe que', 0],
          ['il appert que', 1],
        ],
      ),
      ord(
        P.order,
        'Il s’ensuit que cette mesure reste insuffisante à court terme.',
        { tr: 'It follows that this measure remains insufficient in the short term.' },
      ),
      dict('Il convient que nous examinions ce rapport avant qu’il ne soit rendu public.'),
      say('Il s’avère que les prévisions budgétaires avaient sous-estimé le coût réel.', 'It turns out that the budget forecasts had underestimated the actual cost.'),
    ],
    [
      b('il convient que, il importe que, il suffit que, il arrive que and il se peut que govern the subjunctive.', 'il convient que, il importe que, il suffit que, il arrive que et il se peut que appellent le subjonctif.'),
      b('il s’avère que, il appert que, il s’ensuit que and il est manifeste que express verified facts or logic and take the indicative.', 'il s’avère que, il appert que, il s’ensuit que et il est manifeste que expriment des faits établis et prennent l’indicatif.'),
      b('Certainty expressions flip from indicative to subjunctive when negated, questioned, or restricted by peu (il est peu probable qu’il vienne).', 'Les expressions de certitude basculent vers le subjonctif à la négation, à l’interrogation ou avec peu.'),
    ],
    [
      ['il s’avère que', b('it turns out that (+ indicative)', 'il se révèle exact que (+ indicatif)')],
      ['il appert que', b('it is apparent / evident that (legal)', 'il ressort des pièces que')],
      ['il s’ensuit que', b('it follows that (+ indicative)', 'il en découle que (+ indicatif)')],
      ['il convient que', b('it is fitting / advisable that (+ subj.)', 'il est approprié que (+ subjonctif)')],
    ],
  ),

  lesson(
    C,
    2,
    ['fixed-c1-impersonal-turns', 'tournures-impersonnelles-figees-c1'],
    b('Fixed C1 impersonal turns: il va sans dire, il n’en demeure pas moins', 'Tournures figées C1 : il va sans dire, il n’en demeure pas moins'),
    b('Use high-impact C1 fixed phrases with exact mood, preposition, and word order.', 'Maîtriser les locutions figées C1 avec exactitude de mode, de préposition et d’ordre des mots.'),
    [
      b('Use il va sans dire que and il n’en demeure pas moins que (+ indicative)', 'Employer il va sans dire que et il n’en demeure pas moins que (+ indicatif)'),
      b('Use il y a lieu de, il fait bon and il est question de cleanly', 'Employer il y a lieu de, il fait bon et il est question de sans erreur'),
      b('Distinguish il s’agit de + noun/infinitive from il s’agit de savoir si', 'Distinguer il s’agit de + nom/infinitif de il s’agit de savoir si'),
    ],
    13,
    [
      card(
        b('High-register C1 impersonal idioms', 'Tournures impersonnelles idiomatiques C1'),
        b(
          'C1 essays and formal debates rely on fixed impersonal turns that carry strong rhetorical weight:\n- **Il va sans dire que (+ indicative)**: “It goes without saying that…”\n- **Il n’en demeure pas moins que / Il n’en reste pas moins vrai que (+ indicative)**: “Nevertheless / It remains nonetheless true that…”\n- **Il y a lieu de (+ infinitive)**: “There is good reason to / It is appropriate to…”\n- **Il s’agit de (+ noun/infinitive)** or **Il s’agit de savoir si (+ indicative)**: “The question is whether…” (NEVER write *il s’agit que*!).\n\nIndicative idioms: **il va sans dire que, il n’en demeure pas moins que, il n’est que trop vrai que**.\nInfinitive idioms: **il y a lieu de, il fait bon, il est grand temps de**.\nPrepositional / indirect question: **il est question de · il s’agit de savoir si**.',
          'Les essais C1 et débats formels utilisent des tournures impersonnelles figées à forte valeur rhétorique :\n- **Il va sans dire que (+ indicatif)** : « cela va de soi que… »\n- **Il n’en demeure pas moins que / Il n’en reste pas moins vrai que (+ indicatif)** : « toutefois, cela n’empêche pas que… »\n- **Il y a lieu de (+ infinitif)** : « il convient / il est justifié de… »\n- **Il s’agit de (+ nom/infinitif)** ou **Il s’agit de savoir si (+ indicatif)** — JAMAIS *il s’agit que* !\n\nSuivies de l’indicatif : **il va sans dire que, il n’en demeure pas moins que, il n’est que trop vrai que**.\nSuivies de l’infinitif : **il y a lieu de, il fait bon, il est grand temps de**.\nQuestion indirecte / nom : **il est question de · il s’agit de savoir si**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Locution'), b('Grammar', 'Construction'), b('English equivalent', 'Équivalent')],
            rows: [
              ['il va sans dire que', '+ indicatif', b('it goes without saying that', 'cela va de soi que')],
              ['il n’en demeure pas moins que', '+ indicatif', b('nevertheless, the fact remains that', 'malgré cela, il reste vrai que')],
              ['il y a lieu de', '+ infinitif (no subj.)', b('there is reason / need to', 'il convient / il y a raison de')],
              ['il fait bon', '+ infinitif (sans prép.)', b('it is pleasant to', 'il est agréable de')],
              ['il s’agit de savoir si', '+ indicatif', b('it is a question of whether', 'la question est de savoir si')],
            ],
          },
          ex: [
            ['Il va sans dire que la sécurité des données demeure notre priorité absolue.', 'It goes without saying that data security remains our top priority.'],
            ['Certes, le coût a augmenté ; il n’en demeure pas moins que le bilan reste positif.', 'Admittedly, the cost rose; it remains nonetheless true that the overall balance is positive.'],
            ['Dans ces conditions, il y a lieu de réviser l’ensemble du protocole.', 'Under these conditions, there is good reason to revise the entire protocol.'],
          ],
        },
      ),
      trap(
        b('Two forbidden forms: *il s’agit que* and *il fait bon de*', 'Deux formes interdites : *il s’agit que* et *il fait bon de*'),
        b(
          '1. **Il s’agit de** NEVER takes a *que*-clause directly (*Il s’agit qu’on fasse* ❌). Use **il s’agit de + infinitive** (*Il s’agit de comprendre*), **il s’agit de + noun** (*Il s’agit d’un choix*), or **il s’agit de savoir si / comment / pourquoi**.\n2. **Il fait bon** takes a **bare infinitive** with NO *de* or *à*: *Il fait bon **vivre** ici* (NOT *il fait bon de vivre*!). And in **il n’en demeure pas moins que**, never drop **en** (*il ne demeure pas moins* is incomplete!).\n\nCorrect: **il fait bon vivre, il s’agit d’agir, il n’en demeure pas moins que**.\nWrong: **il fait bon de vivre · il s’agit qu’on agisse · il ne demeure pas moins que**.',
          '1. **Il s’agit de** n’est JAMAIS suivi directement de *que* (*Il s’agit qu’on agisse* ❌). Employez **il s’agit de + infinitif**, **il s’agit de + nom**, ou **il s’agit de savoir si / comment**.\n2. **Il fait bon** prend l’infinitif **sans préposition** : *Il fait bon **vivre** ici* (et non *de vivre* !). Et dans **il n’en demeure pas moins que**, n’oubliez jamais le pronom **en**.\n\nCorrect : **il fait bon vivre, il s’agit d’agir, il n’en demeure pas moins que**.\nFautif : **il fait bon de vivre · il s’agit qu’on agisse · il ne demeure pas moins que**.',
        ),
      ),
      mc(
        P.best,
        [
          'Il n’en demeure pas moins que l’écart se creuse.',
          'Il ne demeure pas moins que l’écart se creuse.',
          'Il n’en demeure pas moins que l’écart se creuse pas.',
          'Il en demeure moins que l’écart se creuse.',
        ],
        {
          fr: 'Which idiom correctly means “Nevertheless, the fact remains that the gap is widening”?',
          explain: b('Keep every element of the fixed idiom: il n’en demeure pas moins que + indicative.', 'Respectez la locution complète : il n’en demeure pas moins que + indicatif.'),
        },
      ),
      mc(
        P.form,
        ['marcher', 'de marcher', 'à marcher', 'marchant'],
        {
          fr: 'Dans ce quartier entièrement piéton, il fait bon ___ le soir.',
          explain: b('Il fait bon is followed directly by a bare infinitive without de or à (il fait bon marcher).', 'Il fait bon se construit directement avec l’infinitif sans préposition (il fait bon marcher).'),
        },
      ),
      gap(
        P.completeText,
        'Il va sans ___ (dire / parler) que cette transition prendra du temps. Il y a ___ (lieu / besoin) d’accompagner les équipes, car il s’agit avant tout de ___ (savoir / que) si le modèle est viable à long terme.',
        [['dire'], ['lieu'], ['savoir']],
        {
          choices: [
            ['dire', 'parler', 'mot'],
            ['lieu', 'besoin', 'place'],
            ['savoir', 'que', 'dire'],
          ],
        },
      ),
      pairs(
        P.match,
        [
          ['il va sans dire que', b('it goes without saying that', 'cela va de soi, bien entendu')],
          ['il n’en demeure pas moins que', b('the fact remains nonetheless that', 'cela n’empêche pas que')],
          ['il y a lieu de', b('there is reason to, one ought to', 'il est justifié et opportun de')],
          ['il s’agit de savoir si', b('the question is whether', 'l’enjeu est de déterminer si')],
        ],
      ),
      ord(
        P.order,
        'Il n’en demeure pas moins que cette piste mérite un examen sérieux.',
        { tr: 'Nevertheless, the fact remains that this avenue deserves serious examination.' },
      ),
      dict('Il va sans dire qu’il y a lieu de vérifier chaque chiffre avant publication.'),
      say('Il s’agit désormais de savoir si cet engagement sera tenu dans la durée.', 'The question now is whether this commitment will be kept over the long term.'),
    ],
    [
      b('il va sans dire que and il n’en demeure pas moins que keep the pronoun/negation intact and govern the indicative.', 'il va sans dire que et il n’en demeure pas moins que gardent leur forme figée et régissent l’indicatif.'),
      b('il y a lieu de takes an infinitive (“there is reason to”); il fait bon takes a bare infinitive without de.', 'il y a lieu de prend l’infinitif ; il fait bon prend l’infinitif nu sans préposition.'),
      b('Never follow il s’agit de with que; use a noun, an infinitive, or savoir si / comment.', 'Ne faites jamais suivre il s’agit de par que : employez un nom, un infinitif ou savoir si / comment.'),
    ],
    [
      ['il va sans dire que', b('it goes without saying that', 'cela va de soi que')],
      ['il n’en demeure pas moins', b('nevertheless, all the same', 'toutefois, il reste vrai')],
      ['il y a lieu de', b('there is good reason to', 'il convient de')],
      ['se creuser (écart)', b('to widen (a gap)', 's’agrandir, s’accentuer')],
    ],
  ),

  lesson(
    C,
    3,
    ['nominalization-and-c1-synthesis', 'nominalisation-et-synthese-c1'],
    b('Nominal alternatives and C1 essay style', 'Alternatives nominales et style d’essai C1'),
    b('Replace repetitive il… que clauses with compact infinitives, nominalizations, and high-impact C1 syntax.', 'Remplacer les répétitions en il… que par des infinitifs, des nominalisations et un style C1 dense.'),
    [
      b('Condense il convient que + subjunctive into il convient de + infinitive or a subject noun', 'Condenser il convient que + subjonctif en il convient de + infinitif ou sujet nominal'),
      b('Transform impersonal verb clauses into crisp C1 nominalizations (l’insuffisance des délais est avérée)', 'Transformer des propositions impersonnelles en nominalisations C1 (l’insuffisance est avérée)'),
      b('Analyze a C1 policy text and write a high-register argumentative paragraph', 'Analyser une note politique C1 puis rédiger un paragraphe argumentatif soutenu'),
    ],
    13,
    [
      card(
        b('From heavy que-clauses to C1 conciseness', 'De la subordonnée lourde à la concision C1'),
        b(
          'Excessive *il est important que*, *il faut que*, *il s’avère que* can weigh down a C1 essay. French academic and administrative prose prefers three cleaner moves: (1) drop *que + subject* for a general **de + infinitive** (**il convient d’agir**, **il importe de préserver**); (2) convert the verb or adjective into a **noun** as subject (**une révision s’impose** instead of *il faut réviser*); (3) condense *il s’avère que X est Y* into **le caractère Y de X est avéré** or **l’insuffisance de X se confirme**.\n\nInfinitive compression: **il convient d’agir, il importe de clarifier, il suffit d’observer**.\nNominal subject + s’imposer: **une révision s’impose, la prudence s’impose, le dialogue s’impose**.\nAdjective / participle shift: **l’efficacité est avérée · la réforme demeure indispensable**.',
          'Trop de *il est important que*, *il faut que* ou *il s’avère que* alourdissent un essai C1. Le style universitaire et administratif préfère trois procédés plus denses : (1) remplacer *que + sujet* par **de + infinitif** (**il convient d’agir**, **il importe de préserver**) ; (2) transformer le verbe en **nom sujet** (**une révision s’impose** au lieu de *il faut réviser*) ; (3) condenser *il s’avère que X est insuffisant* en **l’insuffisance de X est avérée**.\n\nCompression infinitive : **il convient d’agir, il importe de clarifier, il suffit d’observer**.\nNom sujet + s’imposer : **une révision s’impose, la prudence s’impose, le dialogue s’impose**.\nNominalisation C1 : **l’efficacité est avérée · la réforme demeure indispensable**.',
        ),
        {
          table: {
            head: [b('Clausal (wordier)', 'Tournure verbale'), b('Concise C1 alternative', 'Alternative C1 concise')],
            rows: [
              ['Il convient que nous agissions vite.', 'Il convient d’agir vite. / Une action rapide s’impose.'],
              ['Il y a lieu qu’on révise ce décret.', 'Il y a lieu de réviser ce décret. / La révision du décret s’impose.'],
              ['Il s’avère que ces délais sont insuffisants.', 'L’insuffisance de ces délais est avérée.'],
              ['Il importe que l’on protège les archives.', 'La protection des archives revêt une importance majeure.'],
            ],
          },
          ex: [
            ['Face à l’urgence écologique, une réorganisation des transports s’impose.', 'Faced with the ecological emergency, a reorganization of transport is called for.'],
            ['L’efficacité de ce dépistage précoce est désormais pleinement avérée.', 'The effectiveness of this early screening is now fully established.'],
            ['Il importe de concilier l’innovation technique avec la protection de la vie privée.', 'It is important to reconcile technical innovation with privacy protection.'],
          ],
        },
      ),
      doc(
        {
          look: 'article',
          title: b('Policy brief — Higher education', 'Note de synthèse — Enseignement supérieur'),
          text: 'À la suite de l’audit annuel, il appert que le taux d’abandon en première année reste préoccupant dans plusieurs filières. Il va sans dire que l’ouverture sociale de l’université doit être préservée ; il n’en demeure pas moins qu’un accompagnement méthodologique renforcé s’impose dès le premier semestre. En somme, il y a lieu de réorienter une part des crédits vers le tutorat personnalisé.',
        },
        b('Which statement best reflects the tone and structure of this C1 policy brief?', 'Quelle analyse décrit le mieux le ton et la structure de cette note C1 ?'),
        [
          b('It establishes a verified finding (il appert que), upholds a core principle (il va sans dire que), and pivots to a nominalized necessity (s’impose).', 'Elle établit un constat (il appert que), pose un principe admis (il va sans dire que), puis pivote vers une nécessité nominalisée (s’impose).'),
          b('It rejects university access altogether using negative subjunctives.', 'Elle rejette l’accès à l’université au moyen de subjonctifs négatifs.'),
          b('It relies exclusively on unconfirmed journalistic rumors.', 'Elle repose uniquement sur des rumeurs journalistiques non vérifiées.'),
        ],
        {
          explain: b('The passage moves systematically from verified evidence (il appert que + ind.) through concession (il va sans dire / il n’en demeure pas moins) to an action step (s’impose / il y a lieu de).', 'Le texte progresse du constat vérifié (il appert que + ind.) vers la recommandation (s’impose / il y a lieu de) via deux tournures concessives.'),
        },
      ),
      mc(
        P.best,
        [
          'L’urgence d’une refonte fiscale s’impose désormais.',
          'Il s’impose que nous refondions la fiscalité.',
          'Il convient que nous faisons une refonte fiscale.',
          'Il y a lieu que la fiscalité soit refondre.',
        ],
        {
          fr: 'Choose the most concise, idiomatic C1 nominalization for « Il faut désormais refondre la fiscalité »:',
          explain: b('Noun phrase + s’imposer (L’urgence d’une refonte… s’impose) delivers compact C1 style without an awkward que-clause.', 'Le groupe nominal suivi de s’imposer (L’urgence d’une refonte… s’impose) offre une concision typiquement C1.'),
        },
      ),
      gap(
        P.completeText,
        'Il convient ___ (d’évaluer / qu’évaluer) objectivement ces résultats. L’___ (efficacité / efficace) de la méthode étant désormais ___ (avérée / avéré), une généralisation progressive ___ (s’impose / s’imposent).',
        [['d’évaluer'], ['efficacité'], ['avérée'], ['s’impose']],
        {
          choices: [
            ['d’évaluer', 'qu’évaluer', 'à évaluer'],
            ['efficacité', 'efficace', 'efficacement'],
            ['avérée', 'avéré', 'avérés'],
            ['s’impose', 's’imposent', 'impose'],
          ],
        },
      ),
      dlg(
        b('Editing an academic abstract', 'Corriger un résumé universitaire'),
        b('Claire and Nicolas tighten a C1 research abstract.', 'Claire et Nicolas resserrent un résumé de recherche C1.'),
        [['Claire', 'f'], ['Nicolas', 'm']],
        [
          [0, 'Dans ton résumé, tu répètes trois fois « il faut que nous analysions ». On pourrait densifier cela.', 'In your abstract, you repeat “il faut que nous analysions” three times. We could tighten that.'],
          [1, { options: ['Je peux remplacer le premier par « il importe d’analyser » et le second par « une analyse comparative s’impose » ?', 'Je peux remplacer le premier par « il s’agit qu’on analyse » et le second par « il fait bon d’analyser » ?', 'Je peux remplacer le premier par « il appert que nous analysions » ?'] }],
          [0, 'Parfait ! Et comment introduire le constat final issu de tes données ?', 'Perfect! And how can you introduce the final finding drawn from your data?'],
          [1, { options: ['Avec « Il ressort de ces résultats que la corrélation est avérée » ou « Il s’ensuit que le modèle est valide ».', 'Avec « Il s’avère que le modèle soit valide » ou « Il appert que le modèle soit valide ».', 'Avec « Il n’en demeure moins que le modèle soit valide ».'] }],
        ],
      ),
      sort(
        b('Finite impersonal clause or nominal / infinitive compression?', 'Tournure verbale ou compression nominale / infinitive ?'),
        [
          b('Finite impersonal clause (+ que)', 'Subordonnée impersonnelle (+ que)'),
          b('Nominalization or infinitive compression', 'Nominalisation ou infinitif concis'),
        ],
        [
          ['Il convient que chacun s’implique.', 0],
          ['Une implication générale s’impose.', 1],
          ['Il s’avère que le coût est excessif.', 0],
          ['Le caractère excessif du coût est avéré.', 1],
          ['Il importe de préserver ces archives.', 1],
          ['Il n’en demeure pas moins que le délai expire.', 0],
        ],
      ),
      ord(
        P.order,
        'Face à ces constats, une refonte du dispositif s’impose.',
        { tr: 'Faced with these findings, an overhaul of the system is needed.' },
      ),
      say('L’insuffisance des moyens actuels étant avérée, il convient d’agir sans délai.', 'Since the inadequacy of current resources is established, it is fitting to act without delay.'),
      write(
        b('Draft a C1 policy recommendation paragraph', 'Rédiger un paragraphe de synthèse C1'),
        b(
          'In 55 to 85 words, evaluate an urban, educational, or environmental issue and propose a reform. Use one C1 impersonal mood verb (il convient que + subj. or il s’avère que / il s’ensuit que + ind.), one fixed C1 idiom (il va sans dire que or il n’en demeure pas moins que), and one nominalization with s’imposer or être avéré(e).',
          'En 55 à 85 mots, analysez un enjeu urbain, éducatif ou écologique et proposez une réforme. Employez une tournure impersonnelle C1 (il convient que + subj. ou il s’avère que / il s’ensuit que + ind.), une locution figée (il va sans dire que ou il n’en demeure pas moins que) et une nominalisation avec s’imposer ou être avéré(e).',
        ),
        55,
        85,
        [
          b('One impersonal mood expression with accurate subjunctive or indicative', 'Une tournure impersonnelle au bon mode (subjonctif ou indicatif)'),
          b('One fixed C1 idiom (il va sans dire que or il n’en demeure pas moins que)', 'Une locution figée C1 (il va sans dire que ou il n’en demeure pas moins que)'),
          b('One nominalization (s’imposer / être avéré / il y a lieu de)', 'Une nominalisation (s’imposer / être avéré / il y a lieu de)'),
        ],
        'À la suite de l’enquête municipale, il s’avère que près d’un tiers des logements anciens souffrent d’une mauvaise isolation thermique. Il va sans dire que la transition énergétique exige un soutien financier ciblé pour les ménages modestes. Il n’en demeure pas moins que l’accélération des rénovations s’impose dès cette année. Il convient donc que les collectivités simplifient rapidement l’accès aux aides publiques.',
        {
          phrases: ['il s’avère que', 'Il va sans dire que', 'Il n’en demeure pas moins que', 's’impose', 'Il convient donc que'],
        },
      ),
    ],
    [
      b('Replace repetitive impersonal que-clauses with de + infinitive (il convient d’agir) or a nominal subject + s’imposer (une réforme s’impose).', 'Remplacez les subordonnées impersonnelles répétitives par de + infinitif (il convient d’agir) ou un nom sujet + s’imposer.'),
      b('Convert adjective clauses with il s’avère que into crisp noun phrases (l’insuffisance des délais est avérée).', 'Transformez les constats en il s’avère que en tournures nominales denses (l’insuffisance des délais est avérée).'),
    ],
    [
      ['avéré(e)', b('proven, established, confirmed', 'établi comme vrai, confirmé')],
      ['une refonte', b('an overhaul, complete redesign', 'une réorganisation en profondeur')],
      ['s’imposer', b('to be essential / called for', 'devenir indispensable')],
      ['revêtir une importance', b('to assume / take on importance', 'présenter une grande importance')],
    ],
  ),
];

export default lessons;
