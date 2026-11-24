import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Command the crisp high-register locutions that elevate C2 French essays, legal briefs and formal debates. Structure reasoning and emphasis (à plus forte raison, force est de constater, loin s’en faut, qui plus est), introduce subtle concessions (au demeurant, bon gré mal gré, quoi qu’il en soit, en tout état de cause) and close arguments with elegance (sans tambour ni trompette, en dernier ressort, faire fi de).',
    'Maîtrisez les locutions soutenues et tournures rhétoriques qui signent le niveau C2 dans l’essai, le plaidoyer et le débat public. Structurez raisonnement et emphase (à plus forte raison, force est de constater, loin s’en faut, qui plus est), nuancez vos concessions (au demeurant, bon gré mal gré, quoi qu’il en soit, en tout état de cause) et concluez avec autorité (sans tambour ni trompette, en dernier ressort, faire fi de).',
  ),
  outcomes: [
    b('Connect C2 arguments with crisp logical locutions (à plus forte raison, qui plus est, loin s’en faut)', 'Articuler le raisonnement soutenu avec précision et sobriété'),
    b('Avoid classic orthography and syntax traps (quoi qu’il en soit, force est de, bon gré mal gré)', 'Éviter les fautes d’orthographe et de syntaxe sur quoi qu’il en soit, force est de ou bon gré mal gré'),
    b('Deliver incisive verdicts using high-register formulas (faire fi de, autant dire que, sans tambour ni trompette)', 'Formuler des jugements incisifs et nuancés à l’oral comme à l’écrit'),
  ],
};

const C = 'exp-formal-rhetoric-locutions';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['reasoning-and-emphasis-locutions', 'raisonnement-et-emphase-c2'],
    b('Reasoning, evidence & rhetorical emphasis', 'Raisonnement, constat et emphase rhétorique'),
    b('Weight arguments cleanly from strong concession to blunt denial with C2 logical locutions.', 'Hiérarchiser les arguments, marquer l’évidence et rejeter une thèse sans lourdeur.'),
    [
      b('Deploy à plus forte raison and qui plus est cleanly in formal prose', 'Employer à plus forte raison et qui plus est sans ajout parasite'),
      b('Use force est de constater and à vrai dire to frame objective findings', 'Introduire un constat nuancé avec force est de constater et à vrai dire'),
      b('Place loin s’en faut at clause end or as an incisive stand-alone verdict', 'Placer loin s’en faut en clôture de phrase ou en réplique incisive'),
    ],
    13,
    [
      card(
        b('High-precision connectors for reasoning and emphasis', 'Connecteurs d’argumentation et d’insistance'),
        b(
          'In polished essays and DALF C2 synthesis, five short locutions replace entire clumsy clauses: **force est de constater** (we must acknowledge that…), **à vrai dire** (truth be told, strictly speaking), **qui plus est** (what is more—elevating an argument), **à plus forte raison** (all the more so), and **loin s’en faut** (far from it!).\nObservation & honesty: **force est de constater · à vrai dire**.\nEscalation & refutation: **qui plus est · à plus forte raison · loin s’en faut**.',
          'Dans l’essai soutenu comme au débat C2, cinq locutions concises remplacent de lourdes subordonnées : **force est de constater** (il faut bien reconnaître que…), **à vrai dire** (à parler franchement, à tout prendre), **qui plus est** (bien davantage, de surcroît), **à plus forte raison** (d’autant plus que) et **loin s’en faut** (il s’en faut de beaucoup).\nConstat et franchise : **force est de constater · à vrai dire**.\nRenchérissement et réfutation : **qui plus est · à plus forte raison · loin s’en faut**.',
        ),
        {
          table: {
            head: [b('Locution', 'Locution'), b('Meaning', 'Sens'), b('Syntax rule', 'Règle de syntaxe')],
            rows: [
              ['à plus forte raison', b('even more so, all the more reason', 'd’autant plus, à bien plus forte raison'), b('never add article la (*à la plus forte)', 'sans article (*à la plus forte)')],
              ['force est de constater', b('one cannot help observing that…', 'on est obligé de reconnaître que…'), b('no article on force; + que + indicative', 'pas d’article devant force ; + indicatif')],
              ['loin s’en faut', b('far from it! (not by a long shot)', 'il s’en faut de beaucoup'), b('closes a clause or stands alone', 'en fin de phrase ou en réponse autonome')],
              ['à vrai dire', b('to tell the truth, strictly speaking', 'pour parler net, à dire vrai'), b('usually initial or parenthetical', 'en tête de phrase ou en incise')],
              ['qui plus est', b('moreover, what is more', 'de plus, et même davantage'), b('archaic neuter qui (never *ce qui plus est)', 'qui neutre figé (jamais *ce qui plus est)')],
            ],
          },
          ex: [
            ['La réforme était déjà difficile en temps calme ; à plus forte raison en période d’inflation.', 'The reform was already difficult in calm times; all the more so during inflation.'],
            ['Force est de constater que les délais initiaux n’ont pas été tenus, loin s’en faut.', 'One has to admit that the initial deadlines were not met—far from it.'],
            ['Le texte manque de rigueur et, qui plus est, contredit ses propres annexes.', 'The text lacks rigour and, what is more, contradicts its own appendices.'],
          ],
        },
      ),
      tip(
        b('Keep « force est de… » article-free and « qui plus est » without « ce »', '« Force est de… » sans article et « qui plus est » sans « ce »'),
        b(
          'Two frequent C1/C2 slips to eliminate: never say *ce qui plus est*—the classical relative **qui plus est** keeps archaic neuter *qui* bare (*C’est faux et, qui plus est, dangereux*). Likewise, **force est de constater** (or *reconnaître / admettre*) takes **no article** (*Force est de…*, never *La force est de…*), and **loin s’en faut** sits after a statement rather than taking *que* (for *que + subjunctive*, use *tant s’en faut que…*).',
          'Deux écueils à éviter : ne dites jamais *ce qui plus est* — la locution figée **qui plus est** garde le pronom neutre classique sans *ce*. De même, **force est de constater** (ou *reconnaître / admettre*) s’emploie **sans article** (jamais *la force est de…*), et **loin s’en faut** conclut un énoncé sans introduire de subordonnée en *que* (réservée à *tant s’en faut que* + subjonctif).',
        ),
      ),
      flash(
        b('Reasoning & emphasis', 'Raisonnement et emphase'),
        [
          ['à plus forte raison', b('all the more so, even more', 'd’autant plus, a fortiori')],
          ['force est de constater', b('one must acknowledge that', 'on est contraint d’observer que')],
          ['loin s’en faut', b('far from it, not by a long shot', 'il s’en faut de beaucoup')],
          ['à vrai dire', b('truth be told, strictly speaking', 'pour parler franchement')],
          ['qui plus est', b('what is more, moreover', 'de surcroît, élément aggravant ou décisif')],
        ],
      ),
      mc(
        P.best,
        [
          'Ce dispositif s’avère coûteux et, qui plus est, juridiquement fragile.',
          'Ce dispositif s’avère coûteux et, ce qui plus est, juridiquement fragile.',
          'Ce dispositif s’avère coûteux et, à plus forte raison, juridiquement loin s’en faut.',
          'La force est de constater ce dispositif coûteux et qui plus est.',
        ],
        {
          fr: 'Quelle phrase emploie un connecteur d’ajout soutenu sans faute de syntaxe ?',
          explain: b('Qui plus est never takes ce before qui; force est de constater never takes la.', 'Qui plus est ne prend jamais ce devant qui, et force est de constater ne prend pas d’article.'),
        },
      ),
      mc(
        P.complete,
        [
          'à plus forte raison',
          'loin s’en faut',
          'à vrai dire',
          'force est de constater',
        ],
        {
          fr: 'Déjà complexe pour des spécialistes chevronnés, cette notice reste obscure, ___ pour un lecteur novice.',
          explain: b('Escalating from an already difficult case to an even clearer one calls for à plus forte raison.', 'Passer d’un cas déjà difficile à un cas encore plus évident appelle à plus forte raison.'),
        },
      ),
      pairs(
        P.match,
        [
          ['à plus forte raison', b('all the more so, even more', 'd’autant plus, a fortiori')],
          ['force est de constater', b('one must acknowledge that', 'on est contraint d’observer que')],
          ['loin s’en faut', b('far from it, not by a long shot', 'il s’en faut de beaucoup')],
          ['à vrai dire', b('truth be told, strictly speaking', 'pour parler franchement')],
          ['qui plus est', b('what is more, moreover', 'de surcroît, élément aggravant ou décisif')],
        ],
      ),
      gap(
        P.complete,
        '___, ce bilan n’a pas encore convaincu l’auditoire, ___, et ___ qu’il reste de sérieuses lacunes méthodologiques.',
        ['À vrai dire', 'loin s’en faut', 'force est de constater'],
        {
          choices: [
            ['À vrai dire', 'Qui plus est', 'À plus forte raison'],
            ['loin s’en faut', 'force est de constater', 'à vrai dire'],
            ['force est de constater', 'loin s’en faut', 'qui plus est'],
          ],
          explain: b('À vrai dire opens frankly; loin s’en faut reinforces the negative; force est de constater introduces the factual clause.', 'À vrai dire nuance d’emblée ; loin s’en faut appuie la négation ; force est de constater introduit le constat.'),
        },
      ),
      hear(
        'Le rapport annuel affirme que la fracture territoriale s’est résorbée ; pourtant, les chiffres de fréquentation prouvent que l’équilibre n’est pas atteint, loin s’en faut.',
        b('What does the speaker conclude about territorial balance?', 'Que conclut le locuteur sur l’équilibre territorial ?'),
        [
          b('It is nowhere near achieved despite the report’s claim.', 'Il est très loin d’être atteint malgré les affirmations du rapport.'),
          b('It has nearly been solved except in a couple of towns.', 'Il est presque résolu sauf dans deux communes isolées.'),
          b('The figures confirm every claim made by the annual report.', 'Les chiffres confirment entièrement les conclusions du rapport.'),
        ],
        {
          voice: 'm',
          explain: b('Loin s’en faut emphatically denies that a threshold has been met.', 'Loin s’en faut marque un net démenti : on est très loin du compte.'),
        },
      ),
      dict(
        'Force est de constater que ce projet manque de souffle et, qui plus est, de moyens.',
        {
          voice: 'f',
          hint: b('Notice no article before Force, and no ce before qui plus est.', 'Aucun article devant Force, et aucun ce devant qui plus est.'),
        },
      ),
      say(
        'À vrai dire, la mesure n’est guère populaire, loin s’en faut, à plus forte raison dans les zones rurales.',
        'Truth be told, the measure is scarcely popular—far from it—all the more so in rural areas.',
      ),
    ],
    [
      b('Force est de constater (no article) = one has to admit; à vrai dire = truth be told.', 'Force est de constater (sans article) = on doit reconnaître ; à vrai dire = à dire vrai.'),
      b('Qui plus est (never *ce qui plus est) = what is more; à plus forte raison = all the more so.', 'Qui plus est (jamais *ce qui plus est) = de surcroît ; à plus forte raison = d’autant plus.'),
      b('Loin s’en faut closes a statement or answers bluntly: “far from it”.', 'Loin s’en faut ferme un énoncé ou répond sèchement : « il s’en faut de beaucoup ».'),
    ],
    [
      ['à plus forte raison', b('all the more so, even more', 'd’autant plus, a fortiori')],
      ['force est de constater', b('one must acknowledge that', 'on est contraint d’observer que')],
      ['loin s’en faut', b('far from it, not by a long shot', 'il s’en faut de beaucoup')],
      ['à vrai dire', b('truth be told, strictly speaking', 'pour parler franchement')],
      ['qui plus est', b('what is more, moreover', 'de surcroît, élément aggravant ou décisif')],
    ],
  ),

  lesson(
    C,
    2,
    ['nuance-and-concession-locutions', 'nuance-et-concession-c2'],
    b('Nuance, concession & weighing alternatives', 'Nuance, concession et bilan pondéré'),
    b('Balance praise and reservation, accept inevitability and spell high-level concessive locutions cleanly.', 'Dosage subtil entre réserve et reconnaissance, fatalité assumée et orthographe C2 irréprochable.'),
    [
      b('Distinguish au demeurant from à tout prendre in balanced critiques', 'Distinguer au demeurant et à tout prendre dans l’appréciation critique'),
      b('Spell quoi qu’il en soit (two words) and bon gré mal gré without slips', 'Écrire quoi qu’il en soit (en deux mots) et bon gré mal gré sans faute'),
      b('Use en tout état de cause accurately in formal argument and synthesis', 'Employer en tout état de cause à bon escient dans une synthèse'),
    ],
    13,
    [
      card(
        b('The art of measured C2 concession', 'L’art de la concession mesurée au niveau C2'),
        b(
          'C2 style shines in nuance: **au demeurant** adds a redeeming or balancing observation (*besides, for that matter*), **à tout prendre** weighs the whole balance (*all things considered*), **bon gré mal gré** acknowledges reluctant acceptance (*willingly or unwillingly*), **quoi qu’il en soit** pivots beyond earlier detail (*be that as it may*), and **en tout état de cause** establishes a baseline certainty (*in any event, whatever happens*).\nBalancing & judgment: **au demeurant · à tout prendre**.\nInevitable pivot: **bon gré mal gré · quoi qu’il en soit · en tout état de cause**.',
          'L’élégance du C2 tient dans le dosage : **au demeurant** apporte une remarque complémentaire qui équilibre le jugement (« du reste, par ailleurs »), **à tout prendre** dresse un bilan global (« tout bien pesé »), **bon gré mal gré** constate une acceptation contrainte, **quoi qu’il en soit** tranche après un doute et **en tout état de cause** pose une certitude indépendante des aléas.\nÉquilibre et bilan : **au demeurant · à tout prendre**.\nPivot et nécessité : **bon gré mal gré · quoi qu’il en soit · en tout état de cause**.',
        ),
        {
          table: {
            head: [b('Locution', 'Locution'), b('Meaning', 'Sens'), b('Key nuance / spelling', 'Nuance et graphie')],
            rows: [
              ['au demeurant', b('for that matter, besides, on the whole', 'du reste, par ailleurs (souvent mélioratif ou nuancé)'), b('never means “meanwhile”!', 'ne signifie jamais « pendant ce temps » !')],
              ['bon gré mal gré', b('willy-nilly, whether one likes it or not', 'de bonne grâce ou sous la contrainte'), b('no hyphen, no ou; ≠ de gré à gré', 'sans trait d’union ni ou ; ≠ de gré à gré')],
              ['quoi qu’il en soit', b('be that as it may, however that may be', 'quelle que soit la situation évoquée'), b('ALWAYS two words: quoi qu’ + il en soit', 'TOUJOURS en deux mots : quoi qu’il en soit')],
              ['à tout prendre', b('all things considered, on balance', 'tout bien pesé, en somme'), b('weighs imperfect alternatives', 'compare des options imparfaites')],
              ['en tout état de cause', b('in any event, regardless', 'de toute manière, quelles que soient les suites'), b('legal/formal certainty, always singular état', 'rigueur juridique, état toujours au singulier')],
            ],
          },
          ex: [
            ['La réforme demeure imparfaite ; à tout prendre, elle vaut mieux que l’immobilisme.', 'The reform remains imperfect; all things considered, it is better than standing still.'],
            ['C’est un adversaire coriace, au demeurant d’une loyauté exemplaire.', 'He is a tough opponent, yet for all that remarkably fair and loyal.'],
            ['Bon gré mal gré, les opérateurs devront publier ces données d’ici janvier.', 'Willy-nilly, operators will have to publish those figures by January.'],
          ],
        },
      ),
      trap(
        b('« Quoi qu’il en soit » (2 words!) & « bon gré mal gré » vs « de gré à gré »', '« Quoi qu’il en soit » en deux mots et « bon gré mal gré »'),
        b(
          'One of the costliest DALF C2 orthography mistakes is writing *quoiqu’il en soit* as one word! Here **quoi que** means *whatever* (= *quelle que soit la chose*), so it is **ALWAYS two words: quoi qu’il en soit**. Second trap: **bon gré mal gré** (*willingly or unwillingly*) has nothing to do with **de gré à gré** (*by private mutual agreement*, e.g. *un contrat de gré à gré*).',
          'Faute redoutée au DALF C2 : écrire *quoiqu’il en soit* en un seul mot ! Ici, **quoi que** signifie « quelle que soit la chose » et s’écrit **TOUJOURS en deux mots : quoi qu’il en soit**. Autre piège : **bon gré mal gré** (« de force ou de gré ») ne doit pas être confondu avec **de gré à gré** (« par accord direct entre les parties »).',
        ),
      ),
      flash(
        b('Nuance & concession', 'Nuance et concession'),
        [
          ['au demeurant', b('moreover, for that matter, all in all', 'du reste, par ailleurs, au fond')],
          ['bon gré mal gré', b('willingly or unwillingly, willy-nilly', 'qu’on le veuille ou non')],
          ['quoi qu’il en soit', b('be that as it may, in any case', 'quelle que soit la réalité de ce point')],
          ['à tout prendre', b('all things considered, on balance', 'tout bien pesé, en dernière analyse')],
          ['en tout état de cause', b('in any event, in any case', 'quelles que soient les circonstances')],
        ],
      ),
      mc(
        P.spelling,
        [
          'Quoi qu’il en soit, bon gré mal gré, nous devons trancher avant vendredi.',
          'Quoiqu’il en soit, bon-gré mal-gré, nous devons trancher avant vendredi.',
          'Quoi qu’il en soit, bon gré ou mal gré, nous devons trancher avant vendredi.',
          'Quoiqu’il en soit, bon gré mal gré, nous devons trancher avant vendredi.',
        ],
        {
          explain: b('Quoi qu’il en soit is always two words (quoi qu’ + il); bon gré mal gré has no hyphens and no ou.', 'Quoi qu’il en soit s’écrit toujours en deux mots ; bon gré mal gré ne prend ni trait d’union ni ou.'),
        },
      ),
      mc(
        P.meaning,
        [
          b('Aside from his stern manner, he is actually remarkably generous.', 'Malgré sa sévérité apparente, il se révèle par ailleurs très généreux.'),
          b('During the meeting, he suddenly stepped out of the room.', 'Pendant la séance, il a brusquement quitté la salle.'),
          b('From now on, he refuses to cooperate with anyone.', 'Désormais, il refuse toute collaboration avec l’équipe.'),
          b('By mutual private agreement, both sides avoided litigation.', 'Par accord amiable direct, les deux camps ont évité le procès.'),
        ],
        {
          fr: 'Ce critique est exigeant, au demeurant fort bienveillant avec les jeunes interprètes.',
          explain: b('Au demeurant introduces an additional balancing trait (“besides, for all that, in truth”).', 'Au demeurant ajoute une nuance complémentaire qui tempère le propos précédent.'),
        },
      ),
      sort(
        b('Weighing a judgement, or asserting inevitability / baseline certainty?', 'Nuancer un jugement, ou poser une nécessité / certitude ?'),
        [b('Weighing & balancing nuance', 'Dosage critique et bilan'), b('Inevitable or unconditional pivot', 'Contrainte ou certitude de fond')],
        [
          ['au demeurant', 0],
          ['bon gré mal gré', 1],
          ['à tout prendre', 0],
          ['en tout état de cause', 1],
          ['peser les mérites d’un compromis imparfait', 0],
          ['quoi qu’il en soit', 1],
        ],
        { explain: b('Au demeurant and à tout prendre nuance assessment; bon gré mal gré, quoi qu’il en soit and en tout état de cause move forward regardless.', 'Au demeurant et à tout prendre modulent l’appréciation ; les trois autres posent un cadre incontournable.') },
      ),
      gap(
        P.complete,
        '___ qu’il en soit, il faudra accepter ce calendrier bon ___ mal ___ : à tout ___, c’est la voie la plus sûre.',
        ['Quoi', 'gré', 'gré', 'prendre'],
        {
          tr: 'Be that as it may, we will have to accept this schedule willy-nilly: all things considered, it is the safest path.',
          hint: b('Opening word (not attached to qu’!), repeated noun gré, and infinitive prendre.', 'Premier mot séparé de qu’ !, nom répété gré, puis infinitif prendre.'),
          explain: b('Quoi qu’il en soit (two words), bon gré mal gré, à tout prendre.', 'Quoi qu’il en soit (en deux mots), bon gré mal gré, à tout prendre.'),
        },
      ),
      ord(
        P.order,
        'Au demeurant, cette hypothèse reste recevable en tout état de cause.',
        {
          tr: 'Besides, this hypothesis remains admissible in any event.',
          extra: ['demeure', 'états'],
          explain: b('Au demeurant opens the balancing remark; en tout état de cause keeps état singular.', 'Au demeurant ouvre la nuance ; en tout état de cause garde état au singulier.'),
        },
      ),
      hear(
        'Le rapport comporte trois approximations chiffrées, au demeurant sans incidence sur la conclusion ; à tout prendre, ses recommandations méritent d’être suivies.',
        b('What is the speaker’s overall verdict on the report?', 'Quel est le verdict global de la locutrice sur le rapport ?'),
        [
          b('Despite minor flaws that do not alter its core findings, it is worth following on balance.', 'Malgré quelques imprécisions sans gravité, l’ensemble mérite d’être suivi.'),
          b('The three numerical errors invalidate the entire conclusion completely.', 'Les trois erreurs chiffrées rendent toute la conclusion inutilisable.'),
          b('No recommendation can be evaluated until next year’s audit.', 'Aucune recommandation ne peut être jugée avant l’audit de l’an prochain.'),
        ],
        {
          voice: 'f2',
          explain: b('Au demeurant minimises the side flaw, and à tout prendre endorses the overall balance.', 'Au demeurant atténue la portée des erreurs et à tout prendre valide le bilan global.'),
        },
      ),
      say(
        'Quoi qu’il en soit, en tout état de cause, il faudra s’y plier bon gré mal gré.',
        'Be that as it may, in any case, we will have to comply willingly or unwillingly.',
      ),
    ],
    [
      b('Quoi qu’il en soit is ALWAYS two words (quoi qu’ + il en soit), never *quoiqu’il en soit.', 'Quoi qu’il en soit s’écrit TOUJOURS en deux mots (jamais *quoiqu’il en soit).'),
      b('Au demeurant = moreover/for that matter; à tout prendre = all things considered.', 'Au demeurant = du reste/par ailleurs ; à tout prendre = tout bien pesé.'),
      b('Bon gré mal gré = willy-nilly (≠ de gré à gré); en tout état de cause = in any event.', 'Bon gré mal gré = de gré ou de force (≠ de gré à gré) ; en tout état de cause = de toute façon.'),
    ],
    [
      ['au demeurant', b('moreover, for that matter, all in all', 'du reste, par ailleurs, au fond')],
      ['bon gré mal gré', b('willingly or unwillingly, willy-nilly', 'qu’on le veuille ou non')],
      ['quoi qu’il en soit', b('be that as it may, in any case', 'quelle que soit la réalité de ce point')],
      ['à tout prendre', b('all things considered, on balance', 'tout bien pesé, en dernière analyse')],
      ['en tout état de cause', b('in any event, in any case', 'quelles que soient les circonstances')],
    ],
  ),

  lesson(
    C,
    3,
    ['elegance-and-finality-locutions', 'elegance-et-fermete-c2'],
    b('Elegance, discretion & decisive closure', 'Élégance, discrétion et formule finale'),
    b('Conclude with authority, signal quiet exits, scorn convention and draw sharp logical equivalence.', 'Conclure avec fermeté, décrire un retrait discret, braver les usages et résumer d’un trait net.'),
    [
      b('Use sans tambour ni trompette and faire fi de without spelling slips', 'Employer sans tambour ni trompette et faire fi de avec une orthographe exacte'),
      b('Distinguish en dernier ressort from de toute évidence (singular!)', 'Distinguer en dernier ressort et de toute évidence (toujours au singulier)'),
      b('Summarise bluntly with autant dire que in formal debate and writing', 'Condenser un bilan d’un trait incisif grâce à autant dire que'),
    ],
    13,
    [
      card(
        b('Incisive closures and aristocratic restraint', 'Formules décisives et sobriété stylistique'),
        b(
          'Five C2 locutions deliver clear judgment without raising the voice: **sans tambour ni trompette** (slipping away or launching quietly without fanfare), **en dernier ressort** (in the final instance / as a last resort), **de toute évidence** (evidently, unmistakably), **autant dire que** (which amounts to saying / practically speaking), and **faire fi de** (to brush aside / scorn rules or caution).\nQuietness & finality: **sans tambour ni trompette · en dernier ressort**.\nClarity, equivalence & defiance: **de toute évidence · autant dire que · faire fi de**.',
          'Cinq locutions C2 frappent juste sans hausser le ton : **sans tambour ni trompette** (discrètement, sans tapage publicitaire), **en dernier ressort** (en ultime instance ou en ultime solution), **de toute évidence** (manifestement, sans doute possible), **autant dire que** (cela revient pratiquement à dire que) et **faire fi de** (mépriser, négliger délibérément).\nDiscrétion et recours ultime : **sans tambour ni trompette · en dernier ressort**.\nÉvidence, équivalence et dédain : **de toute évidence · autant dire que · faire fi de**.',
        ),
        {
          table: {
            head: [b('Locution', 'Locution'), b('Meaning', 'Sens'), b('Origin / grammar check', 'Origine et point grammatical')],
            rows: [
              ['sans tambour ni trompette', b('quietly, without fanfare or publicity', 'discrètement, sans bruit ni annonce'), b('military silent retreat; singular nouns after ni', 'retraite sans fanfare ; singulier après ni')],
              ['en dernier ressort', b('as a last resort / in the final court', 'en ultime recours ou en dernière instance'), b('always en (not *au); appellate courts', 'toujours en (pas *au) ; justice souveraine')],
              ['de toute évidence', b('obviously, clearly', 'manifestement, à n’en pas douter'), b('always singular: toute évidence (never -es)', 'toujours singulier : toute évidence')],
              ['autant dire que', b('practically speaking, which means in effect', 'cela revient pratiquement à dire que'), b('no c’est before autant dire que', 'pas de c’est devant autant dire que')],
              ['faire fi de', b('to scorn, disregard, pay no heed to', 'mépriser, écarter avec dédain'), b('archaic fi (never *fit!); + noun / inf.', 'mot figé fi (jamais *fit !) ; + nom / inf.')],
            ],
          },
          ex: [
            ['Le texte a été retiré de l’ordre du jour sans tambour ni trompette.', 'The bill was pulled from the agenda quietly without any fanfare.'],
            ['De toute évidence, faire fi des avis scientifiques revient à naviguer à l’aveugle.', 'Clearly, disregarding scientific advice amounts to flying blind.'],
            ['Le conseil refuse tout arbitrage : autant dire que nous devrons trancher en dernier ressort.', 'The board refuses any mediation: practically speaking, we will have to decide in the final instance.'],
          ],
        },
      ),
      culture(
        b('From appellate courts to quiet retreats: living history in syntax', 'Des cours souveraines aux retraites discrètes'),
        b(
          '**En dernier ressort** comes from judicial French: a court *statuant en dernier ressort* hands down a ruling with no higher appeal left—hence both “ultimately responsible” and “as a last resort”. **Sans tambour ni trompette** recalls armies slipping out of camp in silence without military drums or trumpets. And **faire fi de** preserves the Old French exclamation of disgust **fi !** (*Fie!* / *Fi donc !*)—remember **fi** has **no -t**!',
          '**En dernier ressort** vient du droit : un tribunal statuant *en dernier ressort* rend une décision sans appel possible — d’où le double sens « en ultime instance » et « comme ultime recours ». **Sans tambour ni trompette** évoque une troupe décampant en silence, sans sonnerie militaire. Quant à **faire fi de**, il fige l’ancienne interjection **fi !** (jamais de *-t* !).',
        ),
      ),
      mc(
        P.best,
        [
          'De toute évidence, le nouveau directeur entend faire fi des usages établis.',
          'De toutes évidences, le nouveau directeur entend faire fit des usages établis.',
          'De toute évidence, le nouveau directeur entend faire fi aux usages établis.',
          'Au dernier ressort, le nouveau directeur entend faire fi des usages établis.',
        ],
        {
          fr: 'Quelle phrase respecte exactement la grammaire et l’orthographe C2 ?',
          explain: b('De toute évidence is always singular; faire fi de takes fi (no -t) and preposition de (des = de + les).', 'De toute évidence reste au singulier ; faire fi de s’écrit sans -t et se construit avec de.'),
        },
      ),
      pairs(
        P.match,
        [
          ['sans tambour ni trompette', b('quietly, without fanfare', 'discrètement, sans tapage')],
          ['en dernier ressort', b('as a last resort / in the final instance', 'en ultime recours ou autorité finale')],
          ['de toute évidence', b('clearly, unmistakably', 'manifestement, sans le moindre doute')],
          ['autant dire que', b('practically speaking, tantamount to saying', 'cela revient presque à affirmer que')],
          ['faire fi de', b('to scorn, brush aside, disregard', 'négliger délibérément, mépriser')],
        ],
      ),
      hear(
        'Alors que le lancement précédent avait donné lieu à une campagne tapageuse, le ministère a publié cette nouvelle directive sans tambour ni trompette, un vendredi soir d’août.',
        b('How was the new directive released?', 'Comment la nouvelle directive a-t-elle été publiée ?'),
        [
          b('Very discreetly, avoiding media attention deliberately.', 'Très discrètement, sans aucune publicité ni tapage médiatique.'),
          b('With a grand military parade and brass orchestra.', 'Avec une cérémonie officielle grandiose et fanfare.'),
          b('Only after months of noisy public rallies.', 'À l’issue de plusieurs mois de rassemblements bruyants.'),
        ],
        {
          voice: 'm2',
          explain: b('Sans tambour ni trompette means slipping something out quietly with zero fanfare.', 'Sans tambour ni trompette signifie agir dans la plus grande discrétion, sans bruit.'),
        },
      ),
      dlg(
        b('Reviewing a quiet policy shift', 'Analyse d’un revirement discret'),
        b('Solène and Thibault examine how an institution dropped a flagship project without press coverage.', 'Solène et Thibault analysent l’abandon silencieux d’un grand projet public.'),
        [['Solène', 'f2'], ['Thibault', 'm']],
        [
          [0, 'Tu as vu le bulletin officiel ? L’agence a annulé la ligne de nuit sans tambour ni trompette.', 'Did you see the official gazette? The agency cancelled the night rail line without any fanfare.'],
          [1, {
            options: [
              'Oui, de toute évidence, la direction espérait faire fi des engagements pris devant les élus locaux.',
              'Oui, autant dire que de toutes évidences ils ont joué du tambour.',
              'Oui, ils ont fait fit au rapport en dernier ressort de gré à gré.',
            ],
            explain: b('De toute évidence (singular) + faire fi de + noun expresses blatant disregard.', 'De toute évidence (au singulier) suivi de faire fi de traduit un mépris manifeste.'),
          }],
          [0, 'Le rapport budgétaire précise même que la ligne n’est plus financée au-delà de décembre.', 'The budget report even states the line has no funding beyond December.'],
          [1, {
            options: [
              'Autant dire que le dossier est déjà enterré, à moins que le ministre ne tranche en dernier ressort.',
              'Force est de constater qu’autant dire les trompettes sont revenues.',
              'Quoiqu’il en soit, bon gré mal gré sans tambour ni trompette est impossible.',
            ],
            explain: b('Autant dire que draws the blunt implication; en dernier ressort marks final ministerial authority.', 'Autant dire que tire la conclusion nette ; en dernier ressort désigne l’arbitrage suprême.'),
          }],
          [0, 'Les collectivités préparent d’ailleurs un recours collectif dès lundi matin.', 'Local authorities are already preparing a joint appeal for Monday morning.'],
          [1, 'Au demeurant, elles ont des arguments solides : cette affaire ne s’éteindra pas si vite.', 'For that matter, they have solid arguments: this affair won’t fade away so quietly.'],
        ],
      ),
      dict(
        'De toute évidence, faire fi des avertissements reviendrait à agir en dernier ressort.',
        {
          voice: 'f',
          hint: b('Keep toute évidence singular and spell fi with two letters (no -t).', 'Toute évidence au singulier, et fi en deux lettres sans -t.'),
        },
      ),
      write(
        b('C2 formal editorial or brief', 'Éditorial ou note de synthèse C2'),
        b('In 100–160 words, write a formal commentary evaluating a flawed public policy, corporate restructure or academic reform. Integrate at least four high-register locutions from this course smoothly and accurately.', 'En 100 à 160 mots, rédigez un commentaire soutenu évaluant une réforme publique, universitaire ou industrielle contestée. Intégrez avec précision au moins quatre locutions rhétoriques de ce cours.'),
        100,
        160,
        [
          b('At least four rhetorical locutions spelled and positioned accurately', 'Au moins quatre locutions soutenues exactes en orthographe et syntaxe'),
          b('Clear progression: observation, concession, escalation and crisp verdict', 'Progression nette : constat, nuance, renchérissement et conclusion'),
          b('Authentic C2 analytical voice without redundant connectors', 'Style analytique C2 sobre et maîtrisé'),
        ],
        'À vrai dire, cette réforme universitaire n’a pas tenu ses promesses initiales, loin s’en faut. Force est de constater que la charge administrative des départements a doublé et, qui plus est, au détriment du temps consacré à la recherche. Le ministère défend, au demeurant, la création d’un guichet unique utile sur le principe ; mais, à tout prendre, faire fi des avertissements formulés par les doyens relevait d’une précipitation évidente. Quoi qu’il en soit, les universités doivent désormais appliquer ce cadre bon gré mal gré. Autant dire que seule une clause d’évaluation indépendante permettra, en dernier ressort, de corriger le tir sans tambour ni trompette.',
        {
          phrases: ['À vrai dire…', 'Force est de constater…', 'au demeurant', 'Quoi qu’il en soit', 'Autant dire que…'],
          modelNote: b('Notice how each locution serves a precise rhetorical move rather than ornamenting for its own sake.', 'Remarquez que chaque locution assure une fonction argumentative précise sans surcharge rhétorique.'),
        },
      ),
    ],
    [
      b('Sans tambour ni trompette = quietly without fanfare; en dernier ressort = in the final instance / last resort.', 'Sans tambour ni trompette = discrètement sans tapage ; en dernier ressort = en ultime instance / ultime recours.'),
      b('De toute évidence is always singular; faire fi de takes fi (no -t!) + de.', 'De toute évidence reste au singulier ; faire fi de s’écrit sans -t et appelle de.'),
      b('Autant dire que introduces a crisp, blunt equivalence (“practically speaking”).', 'Autant dire que résume d’un trait incisif (« cela revient pratiquement à dire que »).'),
    ],
    [
      ['sans tambour ni trompette', b('quietly, without fanfare', 'discrètement, sans tapage')],
      ['en dernier ressort', b('as a last resort / in the final instance', 'en ultime recours ou autorité finale')],
      ['de toute évidence', b('clearly, unmistakably', 'manifestement, sans le moindre doute')],
      ['autant dire que', b('practically speaking, tantamount to saying', 'cela revient presque à affirmer que')],
      ['faire fi de', b('to scorn, brush aside, disregard', 'négliger délibérément, mépriser')],
    ],
  ),
];

export default lessons;
