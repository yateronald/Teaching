import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Weave long C1 paragraphs smoothly without clumsy repetition: use celui-ci / celui-là, ce dernier, tel / un tel, and nominal + demonstrative encapsulation.',
    'Éviter les répétitions lourdes dans un texte C1 grâce aux reprises précises : celui-ci / celui-là, ce dernier, tel / un tel et les encapsulations démonstratives.',
  ),
  outcomes: [
    b('Refer clearly to antecedents with celui-ci / celui-là, ce dernier, and lequel without ambiguity.', 'Reprendre clairement des antécédents distincts grâce à celui-ci / celui-là, ce dernier et lequel.'),
    b('Distinguish cataphoric previews from backward-pointing anaphora in academic and journalistic writing.', 'Distinguer l’annonce cataphorique de la reprise anaphorique dans la prose soutenue.'),
    b('Condense whole preceding claims into crisp encapsulating noun phrases (un tel constat, cette hypothèse).', 'Condenser un argument précédent dans une reprise nominale précise (un tel constat, cette hypothèse).'),
  ],
};

const lessons: Lesson[] = [
  lesson(
    'gr-anaphora-cohesion',
    1,
    ['celui-ci-ce-dernier-anaphora', 'celui-ci-ce-dernier-et-reprises'],
    b('Demonstrative & Ranking Pronouns: celui-ci, ce dernier', 'Reprises pronominales : celui-ci, celui-là, ce dernier'),
    b('Track two nearby referents accurately without repeating nouns or creating vague il/elle confusion.', 'Distinguer deux référents proches avec élégance sans répétition ni ambiguïté sur il/elle.'),
    [
      b('Contrast celui-ci (the latter / closer) vs. celui-là (the former / earlier).', 'Opposer celui-ci (le plus proche) à celui-là (le plus éloigné).'),
      b('Agree ce dernier / cette dernière / ces derniers properly instead of defaulting to ils.', 'Accorder ce dernier / cette dernière / ces dernières au lieu de multiplier les pronoms ils.'),
    ],
    13,
    [
      card(
        b('Pointing clearly back to two antecedents', 'Désigner sans ambiguïté entre deux antécédents'),
        b(
          'In dense prose, repeating **il** when two masculine nouns stand nearby muddies your argument. **Celui-ci** refers back to the **closer** (most recently named) referent, while **celui-là** recalls the **first** (more distant) one. **Ce dernier / cette dernière / ces derniers** unambiguously targets the final noun mentioned.\nDemonstrative forms: **celui-ci, celle-ci, ceux-ci, celles-ci**.\nDistant contrast: **celui-là, celle-là, ceux-là, celles-là**.\nFinal referent: **ce dernier, cette dernière, ces derniers, ces dernières**.',
          'Dans une phrase longue, enchaîner deux **il** obscurcit le propos. **Celui-ci** reprend l’élément le plus proche dans la phrase, tandis que **celui-là** remonte au premier cité. **Ce dernier / cette dernière** vise sans équivoque le dernier nom mentionné.\nÉlément le plus proche : **celui-ci, celle-ci, ceux-ci, celles-ci**.\nÉlément plus éloigné : **celui-là, celle-là, ceux-là, celles-là**.\nDernier référent cité : **ce dernier, cette dernière, ces derniers, ces dernières**.',
        ),
        {
          table: {
            head: [b('Form', 'Forme'), b('Target referent', 'Référent visé'), b('C1 register note', 'Note stylistique')],
            rows: [
              ['celui-ci / celle-ci', b('nearest preceding noun', 'dernier nom cité'), b('avoids ambiguous il/elle', 'évite il/elle ambigu')],
              ['celui-là / celle-là', b('earlier noun in contrast', 'premier nom opposé'), b('typically paired with celui-ci', 'souvent en miroir avec celui-ci')],
              ['ce dernier / cette dernière', b('the latter (explicit)', 'le dernier élément cité'), b('preferred in reports & essays', 'prisé dans rapports et essais')],
            ],
          },
          ex: [
            ['Le sénat a transmis le texte à l’assemblée ; celle-ci l’examinera lundi.', 'The Senate sent the bill to the Assembly; the latter will examine it on Monday.'],
            ['L’auteur oppose l’urgence à la prudence : celle-ci protège ce que celle-là précipite.', 'The author contrasts urgency with prudence: the latter protects what the former rushes.'],
            ['Nous avons interrogé le directeur et son adjoint ; ce dernier a confirmé le calendrier.', 'We interviewed the director and his deputy; the latter confirmed the schedule.'],
          ],
        },
      ),
      trap(
        b('Don’t overuse ce dernier twice in the same paragraph', 'Ne pas abuser de ce dernier dans un même paragraphe'),
        b(
          'Good French style alternates pronouns with lexical encapsulation (**ce responsable**, **cette instance**) rather than chaining *ce dernier* in consecutive sentences.',
          'Le bon style alterne la reprise pronominale avec une périphrase nominale (**cette institution**, **ce spécialiste**) plutôt que de répéter *ce dernier* d’une phrase à l’autre.',
        ),
      ),
      mc(
        P.best,
        [
          b('L’entreprise hésite entre la qualité et la rapidité ; celle-ci réduit les délais tandis que celle-là fidélise les clients.', 'L’entreprise hésite entre la qualité et la rapidité ; celle-ci réduit les délais tandis que celle-là fidélise les clients.'),
          b('L’entreprise hésite entre la qualité et la rapidité ; celui-ci réduit les délais tandis que celui-là fidélise les clients.', 'L’entreprise hésite entre la qualité et la rapidité ; celui-ci réduit les délais tandis que celui-là fidélise les clients.'),
          b('L’entreprise hésite entre la qualité et la rapidité ; celle-là réduit les délais tandis que celle-ci fidélise les clients.', 'L’entreprise hésite entre la qualité et la rapidité ; celle-là réduit les délais tandis que celle-ci fidélise les clients.'),
        ],
        { explain: b('Both nouns are feminine: la rapidité (closer) maps to celle-ci (reduces delays), while la qualité (earlier) maps to celle-là (builds customer loyalty).', 'Les deux noms étant féminins, celle-ci reprend le plus proche (la rapidité, qui réduit les délais) et celle-là le premier (la qualité, qui fidélise).') },
      ),
      gap(
        b('Fill in the exact agreeing demonstrative or ce dernier.', 'Complétez avec le pronom de reprise accordé.'),
        'Le rapport compare deux stratégies d’investissement : l’audace et la réserve ; ___ rassure les actionnaires, tandis que ___ ouvre de nouveaux marchés.',
        ['celle-ci', 'celle-là'],
        {
          choices: [['celle-ci', 'celui-ci', 'celle-là'], ['celle-là', 'celle-ci', 'ce dernier']],
          explain: b('La réserve (closer feminine noun) → celle-ci ; l’audace (first feminine noun) → celle-là.', 'La réserve (plus proche) correspond à celle-ci, et l’audace (plus éloignée) à celle-là.'),
        },
      ),
      hear(
        'Le chercheur a confié l’archive au conservateur, et ce dernier l’a numérisée.',
        P.listen,
        [
          b('The archivist/curator digitised the archive.', 'C’est le conservateur qui a numérisé l’archive.'),
          b('The researcher digitised the archive himself.', 'Le chercheur a lui-même numérisé l’archive.'),
          b('Ce dernier refers to l’archive.', 'Ce dernier reprend l’archive.'),
        ],
      ),
      ord(
        P.order,
        'J’ai contacté les deux fondatrices, mais ces dernières souhaitent différer l’annonce.',
        {
          tr: 'I contacted the two founders, but the latter wish to postpone the announcement.',
          extra: ['cette', 'celui-ci'],
        },
      ),
      dict('La réforme répond aux syndicats ; ceux-ci demandent toutefois des garanties.', {
        hint: b('Watch plural ceux-ci agreeing with les syndicats.', 'Attention au pluriel masculin ceux-ci reprenant les syndicats.'),
      }),
    ],
    [
      b('Use celui-ci for the closer antecedent and celui-là for the earlier one when both share gender/number.', 'On oppose celui-ci (plus proche) à celui-là (plus éloigné) lorsque le genre coïncide.'),
      b('Ce dernier / cette dernière agrees in gender and number with the final referent.', 'Ce dernier s’accorde en genre et en nombre avec le dernier référent nommé.'),
    ],
    [
      ['celui-ci / celle-ci', 'the latter (closer)'],
      ['celui-là / celle-là', 'the former (earlier)'],
      ['ce dernier / ces dernières', 'the latter (agreeing)'],
    ],
  ),

  lesson(
    'gr-anaphora-cohesion',
    2,
    ['tel-pareil-nominal-encapsulation', 'tel-pareil-et-encapsulation'],
    b('Tel, Un tel & Lexical Encapsulation', 'Tel, un tel et les reprises nominales englobantes'),
    b('Summarise entire preceding paragraphs in two or three crisp words using tel, pareil, and abstract shell nouns.', 'Résumer tout un développement précédent grâce à tel, pareil et aux noms encapsulants.'),
    [
      b('Position and agree tel cleanly before vs. after a noun.', 'Placer et accorder justement tel devant ou après le nom.'),
      b('Replace heavy "Cela montre que…" openings with nominal encapsulation (Une telle démarche, Ce constat).', 'Remplacer les débuts lourds en « Cela prouve que » par une reprise nominale ciblée.'),
    ],
    13,
    [
      card(
        b('Shell nouns and tel as textual glue', 'Les noms encapsulants et tel comme liants textuels'),
        b(
          'C1 prose avoids repeating *cela* or *ce fait*. Instead, encapsulate the whole previous sentence in a **shell noun** (**ce constat, cette dérive, un tel revirement, pareille rigueur**) that subtly frames your judgement. Remember: **un tel / une telle** precedes a countable noun, whereas bare **tel + singular/plural** or **de tels + plural** marks high formal register (**De tels arguments demeurent rares**).\nNeutral summary nouns: **ce constat, cette analyse, cette démarche, cette évolution**.\nStance-carrying nouns: **une telle impasse, ce paradoxe, pareille inertie, cette avancée**.\nTel structures: **un tel constat, de tels propos, telle est la règle**.',
          'La prose C1 évite d’enchaîner *cela*. Elle condense plutôt l’idée précédente dans un **nom encapsulant** (**ce constat, cette dérive, un tel revirement, pareille exigence**) qui oriente discrètement l’argument. Notez : **un tel / une telle** au singulier devient **de tels / de telles** au pluriel.\nNoms neutres : **ce constat, cette analyse, cette démarche, cette évolution**.\nNoms appréciatifs : **une telle impasse, ce paradoxe, pareille inertie, cette avancée**.\nEmplois de tel : **un tel constat, de tels propos, telle est la règle**.',
        ),
        {
          ex: [
            ['Un tel consensus surprend dans un secteur aussi fragmenté.', 'Such a consensus is surprising in such a fragmented sector.'],
            ['De telles négligences compromettent la crédibilité de l’audit.', 'Such instances of carelessness undermine the audit’s credibility.'],
            ['Telle est du moins la conclusion qui s’impose à la lecture du rapport.', 'Such, at least, is the conclusion that emerges on reading the report.'],
          ],
        },
      ),
      pairs(
        P.match,
        [
          ['Ce revirement tardif', b('highlights a sharp change of stance', 'souligne un changement brusque de position')],
          ['Une telle impasse', b('frames a blocked situation negatively', 'présente une situation bloquée sans issue')],
          ['Cette avancée décisive', b('evaluates a measure positively', 'valorise une décision jugée positive')],
          ['Pareille hypothèse', b('literary equivalent of une telle hypothèse', 'équivalent soutenu de une telle hypothèse')],
        ],
      ),
      mc(
        P.form,
        [
          b('De telles initiatives méritent un soutien durable.', 'De telles initiatives méritent un soutien durable.'),
          b('Des telles initiatives méritent un soutien durable.', 'Des telles initiatives méritent un soutien durable.'),
          b('Telles des initiatives méritent un soutien durable.', 'Telles des initiatives méritent un soutien durable.'),
        ],
        { explain: b('Before plural tel, the indefinite article des always reduces to de (de telles initiatives).', 'Devant l’adjectif tel au pluriel, l’article des devient obligatoirement de : de telles initiatives.') },
      ),
      gap(
        b('Complete with the right form of tel or a shell noun phrase.', 'Complétez avec la forme exacte de tel ou de reprise.'),
        'Le texte multiplie les contradictions internes. ___ incohérences affaiblissent l’ensemble, car ___ est la logique de toute démonstration rigoureuse.',
        ['De telles', 'telle'],
        {
          choices: [['De telles', 'Des telles', 'Une telle'], ['telle', 'tel', 'telles']],
          explain: b('Plural feminine incohérences → De telles ; predicate matching la logique → telle.', 'Incohérences est féminin pluriel (De telles), et telle s’accorde avec le sujet la logique.'),
        },
      ),
      sort(
        P.sort,
        [b('Evaluates positively', 'Nuance favorable'), b('Signals crisis or tension', 'Nuance critique / tension')],
        [
          ['Une telle percée', 0],
          ['Une dérive aussi préoccupante', 1],
          ['Ce compromis fécond', 0],
          ['Ce blocage persistant', 1],
          ['Pareille lucidité', 0],
          ['Un tel immobilisme', 1],
        ],
      ),
      say('De telles concessions témoignent d’une réelle volonté d’apaisement.', 'Such concessions bear witness to a genuine desire for conciliation.'),
    ],
    [
      b('Plural un tel becomes de tels / de telles (never des tels).', 'Au pluriel, un tel / une telle devient de tels / de telles (jamais des tels).'),
      b('Nominal encapsulation replaces empty cela with a noun that signals both logic and author stance.', 'L’encapsulation nominale remplace cela par un nom qui oriente l’interprétation du lecteur.'),
    ],
    [
      ['un tel constat', 'such an observation'],
      ['de telles mesures', 'such measures'],
      ['pareille audace', 'such boldness (literary)'],
    ],
  ),

  lesson(
    'gr-anaphora-cohesion',
    3,
    ['cataphora-lequel-and-paragraph-flow', 'cataphore-lequel-et-progression-c1'],
    b('Cataphora, lequel & Paragraph Progression', 'Cataphore, relatif lequel et progression thématique'),
    b('Preview upcoming clauses cleanly and use lequel as a formal determiner or relative to unify long sentences.', 'Annoncer une idée à venir (cataphore) et manier lequel pour souder les phrases complexes.'),
    [
      b('Use cataphoric le fait suivant, voici ce que, and c’est… que to create suspense and focus.', 'Employer des annonces cataphoriques claires pour structurer l’entrée d’un paragraphe.'),
      b('Use relatif lequel (= et ce…) only when precision outweighs heaviness.', 'Recourir au relatif lequel ou ce qui lorsqu’il lève une ambiguïté réelle.'),
    ],
    13,
    [
      card(
        b('Looking forward as well as backward', 'Annoncer l’idée suivante autant que reprendre la précédente'),
        b(
          'Whereas **anaphora** looks back, **cataphora** announces an explanation that follows a colon or **que** (**Ce qui frappe d’emblée, le voici : …**, **Je n’ignore rien du paradoxe suivant : …**). In administrative and legal French, **lequel / laquelle / lesquels** can also act as an adjective pronoun repeating a distant noun (**un délai de trois mois, lequel délai court à compter de…**), though in essays **ce qui / ce dont** or **le fait que** keeps prose lighter.\nCataphoric openers: **ce point mérite précision, voici ce qu’il faut retenir, la question demeure entière**.\nRelative clarifying links: **lequel, sans lequel, faute de quoi, ce à quoi**.',
          'Alors que l’**anaphore** renvoie en amont, la **cataphore** annonce ce qui suit après deux-points ou **que** (**Un élément frappe d’emblée : …**, **Retenons d’abord ceci : …**). Dans les textes juridiques, **lequel** s’emploie même comme déterminant de reprise (**un délai de dix jours, lequel délai…**), mais l’essai C1 lui préfère souvent **faute de quoi**, **ce qui** ou **ce à quoi**.\nAnnonces cataphoriques : **un point clé demeure, retenons d’abord ceci, le paradoxe tient en un mot**.\nRelatifs charnières : **lequel, sans lequel, faute de quoi, ce à quoi**.',
        ),
        {
          ex: [
            ['Retenons d’abord ceci : aucune transition énergétique ne réussit sans adhésion locale.', 'Let us note this first: no energy transition succeeds without local buy-in.'],
            ['Le comité doit publier son avis vendredi, faute de quoi la procédure sera suspendue.', 'The committee must publish its opinion on Friday, failing which the procedure will be suspended.'],
            ['Elle défend une thèse audacieuse, à laquelle ses pairs souscrivent désormais.', 'She defends a bold thesis, to which her peers now subscribe.'],
          ],
        },
      ),
      mc(
        P.best,
        [
          b('L’audit révèle une faille majeure, à laquelle il convient de remédier sans délai.', 'L’audit révèle une faille majeure, à laquelle il convient de remédier sans délai.'),
          b('L’audit révèle une faille majeure, auquel il convient de remédier sans délai.', 'L’audit révèle une faille majeure, auquel il convient de remédier sans délai.'),
          b('L’audit révèle une faille majeure, dont il convient de remédier sans délai.', 'L’audit révèle une faille majeure, dont il convient de remédier sans délai.'),
        ],
        { explain: b('Remédier takes à, and faille is feminine singular → à laquelle.', 'On remédie à une faille (féminin singulier) → à laquelle.') },
      ),
      gap(
        b('Link each clause with the right cohesive marker.', 'Reliez les propositions avec le terme cohésif exact.'),
        'Il convient de rappeler ___ : l’investissement public demeure indispensable, ___ aucune filière industrielle ne pourrait se moderniser.',
        ['ceci', 'faute de quoi'],
        {
          choices: [['ceci', 'cela', 'celui'], ['faute de quoi', 'duquel', 'lequel']],
          explain: b('ceci previews what follows a colon; faute de quoi expresses “failing which”.', 'ceci annonce la proposition qui suit les deux-points ; faute de quoi signifie « à défaut de quoi ».'),
        },
      ),
      dlg(
        b('Tightening a policy brief', 'Affiner une note de synthèse'),
        b('Two policy analysts improve cohesion in a draft executive summary.', 'Deux analystes améliorent la cohésion d’une note de direction.'),
        [['Nadia', 'f'], ['Marc', 'm2']],
        [
          [0, 'Dans ce passage, je répète « ce projet » trois fois et « cela » deux fois. Comment alléger ?', 'In this passage I repeat “ce projet” three times and “cela” twice. How can we lighten it?'],
          [1, {
            options: [
              'Remplace le premier « ce projet » par « celui-ci », puis utilise une reprise nominale comme « cette initiative ».',
              'Garde « il » partout même s’il y a « le budget » juste avant.',
              'Ajoute « lequel projet » à chaque début de phrase.',
            ],
            explain: b('Alternating a demonstrative pronoun (celui-ci) with a concise shell noun (cette initiative) eliminates repetition without legal heaviness.', 'Alterner celui-ci puis une reprise nominale (cette initiative) évite lourdeur et ambiguïté.'),
          }],
          [0, 'Et devant les deux-points qui annoncent l’exemple chiffré ?', 'And before the colon introducing the statistical example?'],
          [1, {
            options: [
              'Annonce-le par « ceci » ou « le constat suivant » plutôt que par « cela ».',
              'Mets toujours « celui-là » juste avant deux-points.',
              'Il faut supprimer les deux-points en français C1.',
            ],
            explain: b('Ceci points forward (cataphora) cleanly before an upcoming explanation or colon.', 'Ceci annonce naturellement ce qui suit (emploi cataphorique).'),
          }],
        ],
      ),
      ord(
        P.order,
        'Cette hypothèse repose sur deux études récentes auxquelles le rapport renvoie.',
        {
          tr: 'This hypothesis relies on two recent studies to which the report refers.',
          extra: ['dont', 'lesquels'],
        },
      ),
      dict('Retenons d’abord ceci : toute méthode exige de la constance.'),
    ],
    [
      b('Use ceci to announce upcoming material (cataphora) and cela/ce constat to refer back.', 'On utilise ceci pour annoncer la suite (cataphore) et cela ou un nom encapsulant pour reprendre ce qui précède.'),
      b('Faute de quoi cleanly replaces heavier clause links when stating the consequence of inaction.', 'Faute de quoi exprime avec concision la conséquence d’un manquement.'),
    ],
    [
      ['ceci (cataphorique)', 'this (pointing forward)'],
      ['faute de quoi', 'failing which'],
      ['à laquelle / auxquelles', 'to which (f.sg. / f.pl.)'],
    ],
  ),
];

export default lessons;
