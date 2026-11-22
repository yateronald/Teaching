import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Signal epistemic stance cleanly at C1: distinguish certainty, plausibility, concession, reserve, and critical distance through syntax, adverbs, and modal verbs without relying on repetitive “je pense que”.',
    'Marquer certitude, vraisemblance, réserve et distance critique au niveau C1 par la syntaxe, les adverbes modaux et les verbes d’opinion sans abuser de « je pense que ».',
  ),
  outcomes: [
    b('Rank epistemic certainty cleanly across adverbs (assurément, vraisemblablement, prétendument) and impersonal verbs.', 'Graduer le degré de certitude grâce aux adverbes (assurément, vraisemblablement, prétendument) et aux verbes impersonnels.'),
    b('Signal critical distance, cited bias, and ironic reserve without sounding blunt or informal.', 'Marquer la distance critique, le soupçon ou la réserve sans lourdeur ni familiarité.'),
    b('Structure balanced C1 stance statements uniting concession (certes / force est de constater) and refutation.', 'Construire une prise de position C1 nuancée articulant constat reconnu et critique argumentée.'),
  ],
};

const lessons: Lesson[] = [
  lesson(
    'gr-modalisation-epistemic',
    1,
    ['epistemic-adverbs-and-probability', 'adverbes-modaux-et-probabilite-c1'],
    b('Graduating Certainty: Modal Adverbs & Epistemic Verbs', 'Graduer la certitude : adverbes modaux et verbes épistémiques'),
    b('Move from near-certainty to guarded plausibility using precise French modalisation markers.', 'Passer de la quasi-certitude à l’hypothèse prudente grâce aux outils lexicaux et syntaxiques du C1.'),
    [
      b('Position modal adverbs cleanly (à coup sûr, vraisemblablement, manifestement, prétendument).', 'Placer justement les adverbes épistémiques selon le degré d’adhésion du locuteur.'),
      b('Contrast croire, présumer, soupçonner, and sembler with appropriate indicative vs. subjunctive control.', 'Opposer croire, présumer, soupçonner et sembler avec le bon mode verbal.'),
    ],
    13,
    [
      card(
        b('How French grades truth claims without clichés', 'Graduer l’adhésion sans lourdeur'),
        b(
          'At C1, strong speakers rarely write *Je suis 100 % sûr que* or *Peut-être que*. Instead, sentence-level adverbs (**manifestement, assurément, vraisemblablement, apparemment**) and distancing adjectives (**soi-disant, prétendu, allégué**) convey exactly how strongly the writer endorses a claim.\nHigh certainty: **indubitablement, manifestement, à l’évidence, force est d’admettre**.\nReasonable likelihood: **vraisemblablement, selon toute apparence, tout porte à croire que**.\nDistance or doubt: **prétendument, soi-disant, pour le moins contestable, à en croire**.',
          'Au niveau C1, on évite d’écrire sans cesse *Je suis certain que* ou *Peut-être que*. Des adverbes de phrase (**manifestement, assurément, vraisemblablement, apparemment**) et des marqueurs de mise à distance (**prétendu, allégué, à en croire**) indiquent avec finesse le degré d’adhésion.\nQuasi-certitude : **indubitablement, manifestement, à l’évidence, force est d’admettre**.\nForte plausibilité : **vraisemblablement, selon toute apparence, tout porte à croire que**.\nMise à distance : **prétendument, soi-disant, pour le moins contestable, à en croire**.',
        ),
        {
          table: {
            head: [b('Degree of commitment', 'Degré d’adhésion'), b('Modal markers', 'Marqueurs'), b('Syntactic note', 'Remarque syntaxique')],
            rows: [
              [b('Strong endorsement', 'Adhésion forte'), 'manifestement, à n’en pas douter', b('can open a sentence cleanly', 'souvent en tête ou après verbe')],
              [b('Plausible inference', 'Inférence plausible'), 'vraisemblablement, tout porte à croire que', b('+ indicative', '+ indicatif')],
              [b('Guarded reserve', 'Réserve prudente'), 'apparemment, semble-t-il, à première vue', b('parenthetical semble-t-il keeps indicative', 'incise semble-t-il à l’indicatif')],
              [b('Sceptical distance', 'Distance critique'), 'prétendument, soi-disant, à en croire', b('soi-disant stays invariable!', 'soi-disant est toujours invariable !')],
            ],
          },
          ex: [
            ['Tout porte à croire que cette réforme modifiera les équilibres budgétaires.', 'Everything suggests that this reform will alter budgetary balances.'],
            ['L’étude s’appuie sur de soi-disant experts dont la méthode reste opaque.', 'The study relies on self-styled experts whose method remains opaque.'],
            ['Cette baisse n’est, semble-t-il, que le reflet d’un effet saisonnier.', 'This drop is, it seems, merely the reflection of a seasonal effect.'],
          ],
        },
      ),
      trap(
        b('Soi-disant is strictly invariable', 'Soi-disant est toujours invariable'),
        b(
          'Because *soi* means “oneself” (literally “calling oneself”), **soi-disant** never takes *-e* or *-s* (**de soi-disant spécialistes**). Even better, in reference to inanimate things or ideas, prefer **prétendu(e)(s)** or **supposé(e)(s)**, since objects cannot call themselves anything!',
          'Étymologiquement (« qui se dit tel »), **soi-disant** reste toujours invariable (**de soi-disant miracles**). Pour des choses abstraites, préférez **prétendu(e)(s)** ou **supposé(e)(s)**, plus rigoureux.',
        ),
      ),
      mc(
        P.best,
        [
          b('Ces prétendues garanties n’ont convaincu aucun juriste.', 'Ces prétendues garanties n’ont convaincu aucun juriste.'),
          b('Ces soi-disantes garanties n’ont convaincu aucun juriste.', 'Ces soi-disantes garanties n’ont convaincu aucun juriste.'),
          b('Ces prétendument garanties n’ont convaincu aucun juriste.', 'Ces prétendument garanties n’ont convaincu aucun juriste.'),
        ],
        { explain: b('Prétendu agrees like an adjective (prétendues garanties); soi-disant never takes -es and applies poorly to inanimate nouns.', 'Prétendu s’accorde (prétendues garanties) et convient mieux à un nom abstrait que soi-disant.') },
      ),
      gap(
        b('Select the most accurate epistemic marker for each stance.', 'Choisissez le marqueur de modalisation adapté.'),
        '___ cet article, la hausse s’expliquerait par un défaut de maintenance ; cette hypothèse paraît ___ crédible que les relevés confirment la panne.',
        ['À en croire', 'd’autant plus'],
        {
          choices: [['À en croire', 'Indubitablement', 'Force est'], ['d’autant plus', 'soi-disant', 'prétendument']],
          explain: b('À en croire distances the speaker from a cited source; d’autant plus… que reinforces justification.', 'À en croire attribue l’affirmation à la source citée ; d’autant plus… que en renforce la portée.'),
        },
      ),
      sort(
        P.sort,
        [b('Endorses / affirms strongly', 'Valide ou renforce'), b('Creates sceptical distance', 'Met à distance / nuance')],
        [
          ['à n’en pas douter', 0],
          ['à en croire', 1],
          ['manifestement', 0],
          ['prétendument', 1],
          ['incontestablement', 0],
          ['pour le moins contestable', 1],
        ],
      ),
      dict('Tout porte à croire que cette hypothèse demeure vraisemblable.'),
    ],
    [
      b('Use parenthetical semble-t-il / selon toute apparence to temper assertions in the indicative.', 'L’incise semble-t-il ou selon toute apparence nuance un constat à l’indicatif.'),
      b('Never inflect soi-disant; use prétendu(e)(s) before inanimate nouns for cleaner style.', 'Soi-disant reste invariable ; devant un nom de chose, préférez prétendu(e)(s).'),
    ],
    [
      ['tout porte à croire que', 'everything leads one to believe that'],
      ['à en croire (+ nom)', 'if X is to be believed'],
      ['soi-disant (invariable)', 'so-called, self-styled'],
      ['pour le moins', 'to say the least'],
    ],
  ),

  lesson(
    'gr-modalisation-epistemic',
    2,
    ['rhetorical-concession-and-irony', 'concession-et-distance-critique-c1'],
    b('Critical Distance, Litotes & Concession', 'Distance critique, litote et concession élégante'),
    b('Concede valid points strategically before dismantling weak assumptions with certes, force est de, and understatement.', 'Concéder ce qui est juste avant de nuancer ou réfuter avec force est de constater, certes et la litote.'),
    [
      b('Build balanced concession–refutation pairs (il est vrai que / encore faut-il, loin s’en faut, force est de reconnaître).', 'Articuler concession et critique avec encore faut-il, loin s’en faut et force est de reconnaître.'),
      b('Read and craft measured understatement (non sans raison, pour le moins discutable, n’être pas sans ignorer).', 'Manier la litote soutenue (non sans raison, pour le moins fragile) sans obscurité.'),
    ],
    13,
    [
      card(
        b('Persuasive nuance in French academic argument', 'La nuance comme force persuasive'),
        b(
          'In French analytical culture (synthèse, essai argumenté, DALF C1), nuance outperforms brute exaggeration. Acknowledge a limit with **force est de constater que** or **certes**, then pivot sharply using **encore faut-il + infinitive**, **il n’en reste pas moins que**, or **loin s’en faut**.\nAcknowledging a fact: **force est de constater, il convient d’admettre, nul ne disconvient de**.\nPivoting / raising doubt: **encore faut-il que, il n’en demeure pas moins que, tant s’en faut**.\nMeasured understatement: **pour le moins ambigu, non sans paradoxe, d’une portée relative**.',
          'Dans l’essai argumenté français, la mesure l’emporte sur l’emphase. On reconnaît un fait avec **force est de constater que** ou **certes**, puis on déplace le débat avec **encore faut-il + infinitif**, **il n’en demeure pas moins que** ou **loin s’en faut**.\nReconnaître un fait : **force est de constater, il convient d’admettre, nul ne conteste**.\nRecadrer le débat : **encore faut-il que, il n’en demeure pas moins que, tant s’en faut**.\nLitote critique : **pour le moins ambigu, non sans paradoxe, d’une portée toute relative**.',
        ),
        {
          ex: [
            ['La mesure paraît séduisante sur le papier ; encore faut-il en vérifier la faisabilité.', 'The measure looks appealing on paper; yet its feasibility still needs checking.'],
            ['L’expérience n’a pas réglé tous les conflits, tant s’en faut.', 'The experiment has not settled all conflicts, far from it.'],
            ['On aurait tort de sous-estimer l’ampleur de ce revirement.', 'One would be wrong to underestimate the scale of this reversal.'],
          ],
        },
      ),
      hear(
        'Le dispositif affiche des ambitions louables ; encore faut-il qu’il dispose des moyens promis.',
        P.listen,
        [
          b('The goal is praiseworthy, provided the promised funding actually arrives.', 'L’ambition est saluée, mais l’orateur doute que les moyens soient réunis.'),
          b('The speaker rejects the entire programme from start to finish.', 'L’orateur rejette totalement le principe même du dispositif.'),
          b('Funding has already exceeded original targets.', 'Les moyens promis ont déjà été doublés.'),
        ],
      ),
      pairs(
        P.match,
        [
          ['loin s’en faut / tant s’en faut', b('far from it (strong denial of degree)', 'il s’en faut de beaucoup')],
          ['encore faut-il (+ inf. / que)', b('and yet one must still ensure that…', 'il reste toutefois nécessaire de…')],
          ['force est de constater', b('one cannot help acknowledging that', 'on est bien obligé d’admettre')],
          ['non sans paradoxe', b('ironically / not without paradox', 'de façon quelque peu paradoxale')],
        ],
      ),
      mc(
        P.best,
        [
          b('Certes le projet séduit, encore faut-il en financer la maintenance.', 'Certes le projet séduit, encore faut-il en financer la maintenance.'),
          b('Certes le projet séduit, loin s’en faut en financer la maintenance.', 'Certes le projet séduit, loin s’en faut en financer la maintenance.'),
          b('Force est de constater que, il n’en reste pas moins le projet.', 'Force est de constater que, il n’en reste pas moins le projet.'),
        ],
        { explain: b('Encore faut-il + infinitive introduces the crucial missing condition after a concession.', 'Encore faut-il + infinitif introduit la condition indispensable après une concession.') },
      ),
      gap(
        b('Insert the right modalisation connector.', 'Complétez avec l’outil de distance ou de recadrage juste.'),
        'Ce bilan ne saurait suffire à rassurer le public, ___ ; ___ souligner qu’une concertation préalable s’impose.',
        ['loin s’en faut', 'il convient toutefois de'],
        {
          choices: [['loin s’en faut', 'force est de', 'certes'], ['il convient toutefois de', 'prétendument', 'soi-disant']],
          explain: b('Loin s’en faut closes a negative claim emphatically (“far from it”); il convient toutefois de steers politely toward a recommendation.', 'Loin s’en faut renforce la restriction en fin de phrase ; il convient toutefois de introduit la préconisation.'),
        },
      ),
      ord(
        P.order,
        'Ce constat paraît pour le moins fragile au regard des données disponibles.',
        {
          tr: 'This finding appears fragile to say the least in light of available data.',
          extra: ['beaucoup'],
        },
      ),
    ],
    [
      b('Pair certes / force est de constater with encore faut-il or il n’en demeure pas moins que for crisp C1 pivots.', 'L’articulation certes / force est de constater + encore faut-il structure l’argumentation avec élégance.'),
      b('Place loin s’en faut / tant s’en faut at clause end to negate exaggerated claims cleanly.', 'Loin s’en faut ou tant s’en faut en fin de phrase récuse efficacement une exagération.'),
    ],
    [
      ['encore faut-il (+ inf.)', 'and yet one still has to…'],
      ['loin s’en faut', 'far from it'],
      ['force est de constater', 'one is bound to acknowledge'],
      ['on aurait tort de', 'one would be mistaken to'],
    ],
  ),

  lesson(
    'gr-modalisation-epistemic',
    3,
    ['stance-verbs-and-c1-editorial-writing', 'verbes-attitude-et-redaction-c1'],
    b('Editorial Stance, Attribution & Synthesis Writing', 'Verbes introducteurs, attribution et écriture critique C1'),
    b('Vary reporting verbs (affirmer vs. soutenir vs. prétendre) to frame sources accurately in a short critique.', 'Distinguer affirmer, soutenir, suggérer et prétendre pour cadrer une source et rédiger une critique C1.'),
    [
      b('Select neutral, favourable, or critical reporting verbs when quoting studies or opponents.', 'Choisir le verbe introducteur adapté (démontrer, soutenir, suggérer, prétendre) selon le recul voulu.'),
      b('Write a measured 65–95 word C1 critical comment combining concession, modal adverbs, and distance.', 'Rédiger un paragraphe critique C1 de 65 à 95 mots alliant concession, adverbes et réserve.'),
    ],
    13,
    [
      card(
        b('Every reporting verb carries a stance', 'Chaque verbe introducteur oriente le lecteur'),
        b(
          'C1 writers never repeat *dit que* five times. **Démontrer** or **établir** endorses a claim as proven; **estimer**, **souligner**, or **relever** remains balanced; **soutenir** hints the speaker had to defend a debatable claim; and **prétendre** or **affirmer sans preuve** overtly signals scepticism.\nProven / endorsed: **établir, démontrer, confirmer, attester**.\nBalanced / analytical: **estimer, relever, observer, suggérer**.\nDebatable / distanced: **soutenir, avancer, prétendre, laisser entendre**.',
          'Au niveau C1, on ne répète jamais *il dit que*. **Établir** ou **démontrer** valide le propos comme avéré ; **estimer**, **relever** ou **observer** restent mesurés ; **soutenir** suggère une thèse discutable ; **prétendre** marque une nette mise en doute.\nValidé : **établir, démontrer, confirmer, attester**.\nAnalytique : **estimer, relever, observer, suggérer**.\nÀ distance : **soutenir, avancer, prétendre, alléguer**.',
        ),
        {
          ex: [
            ['Les rapporteurs relèvent toutefois que l’échantillon reste limité.', 'The rapporteurs note, however, that the sample remains limited.'],
            ['L’auteur soutient que cette hausse demeure transitoire, ce qui prête à discussion.', 'The author argues that this increase remains temporary, which is open to debate.'],
            ['Rien n’atteste que ces deux phénomènes soient liés causalement.', 'Nothing attests that these two phenomena are causally linked.'],
          ],
        },
      ),
      mc(
        P.best,
        [
          b('L’économiste soutient une hypothèse audacieuse que les faits nuancent pourtant.', 'L’économiste soutient une hypothèse audacieuse que les faits nuancent pourtant.'),
          b('L’économiste démontre une hypothèse fausse que personne ne croit.', 'L’économiste démontre une hypothèse fausse que personne ne croit.'),
          b('L’économiste prétend indiscutablement une vérité déjà avérée par tous.', 'L’économiste prétend indiscutablement une vérité déjà avérée par tous.'),
        ],
        { explain: b('You cannot démontrer something false or prétendre an accepted truth; soutenir fits a contested hypothesis.', 'On ne démontre pas une erreur et on ne prétend pas une évidence reconnue : soutenir convient à une hypothèse débattue.') },
      ),
      gap(
        b('Choose reporting verbs that fit the critical stance.', 'Choisissez le verbe introducteur cohérent avec la distance exprimée.'),
        'Plusieurs rapports ___ l’efficacité technique du procédé, mais certains industriels ___ qu’il reste trop coûteux, sans produire de chiffrage ___ à l’appui.',
        ['attestent', 'avancent', 'crédible'],
        {
          choices: [['attestent', 'prétendent', 'soupçonnent'], ['avancent', 'démontrent', 'prouvent'], ['crédible', 'douteux', 'soi-disant']],
          explain: b('attestent endorses proven technical efficacy; avancent flags an unverified claim by lobbyists.', 'attestent valide l’efficacité prouvée ; avancent présente l’argument adverse sans l’endosser.'),
        },
      ),
      dlg(
        b('Reviewing an op-ed draft', 'Relire une tribune d’opinion'),
        b('A senior editor helps a contributor replace blunt criticism with sharp C1 modalisation.', 'Une rédactrice en chef aide un chroniqueur à nuancer une critique trop abrupte.'),
        [['Hélène', 'f'], ['Samir', 'm']],
        [
          [0, 'Tu écris « ce ministre ment et son plan est absurde ». En C1, cela décrédibilise plutôt ta critique.', 'You wrote “this minister is lying and his plan is absurd”. At C1, that undermines your critique.'],
          [1, {
            options: [
              'Comment garder la fermeté sans perdre la crédibilité analytique ?',
              'Je remplace juste « absurde » par « pas bien ».',
              'Je supprime toute critique et je dis qu’il a entièrement raison.',
            ],
          }],
          [0, 'Pose d’abord une concession courte avec « certes », puis écris qu’il « avance sans véritable preuve » et que sa mesure reste « pour le moins contestable ».', 'Start with a brief concession with “certes”, then write that he “advances without real proof” and that his measure remains “to say the least questionable”.'],
          [1, {
            options: [
              'C’est bien plus percutant justement parce que le ton reste maîtrisé et précis.',
              'D’accord, j’ajoute aussi cinq points d’exclamation à la fin.',
              'Parfait, je vais mettre « je pense personnellement que » devant chaque phrase.',
            ],
            explain: b('Calm understatement and targeted modal markers carry far stronger authority in French prose than exclamation marks or emotional adjectives.', 'La litote maîtrisée et les verbes de distance donnent bien plus d’autorité que l’emphase.'),
          }],
        ],
      ),
      write(
        b('Write a 65–90 word C1 evaluative comment on remote-work mandates in an editorial column.', 'Rédigez un bref commentaire critique C1 (65–90 mots) sur le retour imposé au bureau dans une chronique.'),
        b('Acknowledge one point via certes / force est de constater, pivot via encore faut-il / toutefois, and include one epistemic adverb or distance marker.', 'Intégrez une concession, un recadrage (encore faut-il / toutefois) et un adverbe ou marqueur de distance.'),
        65,
        90,
        [
          b('Concede a genuine advantage briefly before pivoting', 'Concéder brièvement un point positif avant de nuancer'),
          b('Use at least two modalisation tools (e.g. manifestement, prétendre, encore faut-il, loin s’en faut)', 'Employer au moins deux outils de modalisation'),
          b('Maintain calm, authoritative C1 analytical phrasing', 'Conserver un ton analytique et maîtrisé de niveau C1'),
        ],
        'Force est de constater que la présence régulière au bureau facilite parfois les échanges informels entre équipes. Certains dirigeants soutiennent d’ailleurs qu’elle renforcerait mécaniquement la productivité globale, ce que les enquêtes indépendantes sont loin de confirmer, tant s’en faut. Encore faut-il que l’organisation offre aux salariés de véritables espaces calmes pour se concentrer. Sans cette garantie préalable, l’obligation uniforme apparaît pour le moins contre-productive et manifestement déconnectée des réalités quotidiennes.',
        { phrases: ['Force est de constater', 'tant s’en faut', 'Encore faut-il', 'pour le moins'] },
      ),
    ],
    [
      b('Select reporting verbs deliberately: établir (proven), relever (neutral), soutenir (debatable), prétendre (doubted).', 'Choisissez le verbe selon l’adhésion : établir (avéré), relever (neutre), soutenir (discutable), prétendre (douteux).'),
      b('Measured understatement and balanced concession always outperform emotional exaggeration in C1 prose.', 'La nuance et l’articulation concession-objection confèrent toute leur force aux essais C1.'),
    ],
    [
      ['relever que', 'to note / point out'],
      ['soutenir que', 'to argue (debatable)'],
      ['prétendre que', 'to claim (with scepticism)'],
      ['attester', 'to attest / confirm'],
    ],
  ),
];

export default lessons;
