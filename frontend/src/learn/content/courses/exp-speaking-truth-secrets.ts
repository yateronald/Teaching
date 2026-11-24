import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In French conversation, how you tell the truth—or hide it—has its own rich imagery: calling a cat a cat, emptying one’s bag, drowning the fish to dodge a question, sparing both the goat and the cabbage, or selling the fuse to spoil a surprise. This B1 course teaches fifteen idioms for frankness, evasion, silence and keeping secrets.',
    'En français, dire la vérité — ou la contourner — s’exprime par des images savoureuses : appeler un chat un chat, vider son sac, noyer le poisson, ménager la chèvre et le chou ou vendre la mèche. Ce cours B1 vous fait maîtriser quinze expressions clés de la franchise, de l’esquive, du silence et des confidences.',
  ),
  outcomes: [
    b('Speak frankly and set clear boundaries using idiomatic expressions', 'Parler franchement et clarifier une situation sans détour'),
    b('Recognize verbal evasion, diplomatic hedging and selective deafness', 'Repérer l’esquive, la langue de bois et la sourde oreille'),
    b('Talk about keeping secrets, leaking news and uncovering hidden truths', 'Parler de discrétion, d’indiscrétion et de secrets découverts'),
  ],
};

const C = 'exp-speaking-truth-secrets';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['speaking-frankly', 'parler-franchement'],
    b('Speaking frankly & clearing the air', 'Parler franchement et mettre les choses au clair'),
    b('Be direct without losing control: name facts plainly, get things off your chest and clarify rules.', 'Dire ce qu’on pense sans détour, vider son sac et clarifier les règles avec précision.'),
    [
      b('Express outspokenness with ne pas avoir sa langue dans sa poche and appeler un chat un chat', 'Exprimer le franc-parler'),
      b('Describe airing grievances with dire les quatre vérités à quelqu’un and vider son sac', 'Dire ses vérités ou vider son sac'),
      b('Set crystal-clear expectations with mettre les points sur les i', 'Mettre les points sur les i pour clarifier un malentendu'),
    ],
    13,
    [
      card(
        b('Five idioms for blunt honesty', 'Cinq expressions de franc-parler'),
        b(
          'When polite hints stop working, French turns to direct, vivid idioms. Someone outspoken **n’a pas sa langue dans sa poche**. To face facts directly, you **appelez un chat un chat**; to clear up misunderstandings firmly, you **mettez les points sur les i**; and after holding back too long, you **videz son sac** or **dites ses quatre vérités** to someone.\n\nDirectness: **ne pas avoir sa langue dans sa poche, appeler un chat un chat, mettre les points sur les i**.\nConfrontation & release: **dire les quatre vérités à quelqu’un, vider son sac**.',
          'Quand les sous-entendus ne suffisent plus, le français utilise des images nettes. Une personne très directe **n’a pas sa langue dans sa poche**. Pour nommer les faits sans détour, on **appelle un chat un chat** ; pour clarifier fermement, on **met les points sur les i** ; pour tout dire d’un coup, on **vide son sac** ou on **dit ses quatre vérités** à quelqu’un.\n\nFranchise : **ne pas avoir sa langue dans sa poche, appeler un chat un chat, mettre les points sur les i**.\nMise au point : **dire les quatre vérités à quelqu’un, vider son sac**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['ne pas avoir sa langue dans sa poche', b('tongue not kept in pocket', 'avoir la parole facile'), b('to be outspoken, never short of words', 'parler librement sans se retenir')],
              ['dire les quatre vérités à quelqu’un', b('tell someone the four truths', 'dire ses vérités en face'), b('to tell someone a few home truths', 'dire franchement ses torts à quelqu’un')],
              ['appeler un chat un chat', b('to call a cat a cat', 'nommer chaque chose par son nom'), b('to call a spade a spade', 'parler sans détour ni euphémisme')],
              ['vider son sac', b('to empty one’s bag', 'sortir tout ce qu’on retient'), b('to get everything off one’s chest', 'tout avouer ou tout reprocher d’un coup')],
              ['mettre les points sur les i', b('to dot the i’s', 'préciser chaque détail'), b('to spell things out clearly and firmly', 'clarifier fermement les choses')],
            ],
          },
          ex: [
            ['Ma collègue n’a pas sa langue dans sa poche : elle donne toujours son avis dès le début.', 'My colleague is never short of words: she always gives her opinion right from the start.'],
            ['Appelons un chat un chat : ce calendrier n’est pas réaliste.', 'Let’s call a spade a spade: this schedule is not realistic.'],
            ['Après des semaines de tension, il fallait absolument mettre les points sur les i.', 'After weeks of tension, we really had to spell things out clearly.'],
          ],
        },
      ),
      tip(
        b('Grammar watch: i without -s, and quatre vérités', 'Orthographe et nuance : les i sans -s'),
        b(
          'In **mettre les points sur les i**, the letter **i** never takes a plural **-s** in French (*sur les i*, not *les is*). Also note register: **dire les quatre vérités à quelqu’un** (often **ses quatre vérités**) and **vider son sac** imply blunt, sometimes heated confrontation, whereas **appeler un chat un chat** works nicely even in calm debates or press commentary.\n\nKeep invariable: **les points sur les i**.\nPronoun variant: **Je lui ai dit ses quatre vérités**.',
          'Dans **mettre les points sur les i**, la lettre **i** reste toujours invariable (jamais de **-s**). Sur le plan du ton, **dire les quatre vérités à quelqu’un** (souvent **ses quatre vérités**) et **vider son sac** suggèrent une discussion vive où l’on déballe ce que l’on retient, alors qu’**appeler un chat un chat** convient aussi à une analyse posée.\n\nInvariable : **les points sur les i**.\nVariante courante : **Je lui ai dit ses quatre vérités**.',
        ),
      ),
      flash(b('Speaking frankly', 'Parler franchement'), [
        ['ne pas avoir sa langue dans sa poche', b('to be outspoken, speak freely', 'oser tout dire sans timidité')],
        ['dire les quatre vérités à quelqu’un', b('to tell someone home truths', 'dire ses reproches en face')],
        ['appeler un chat un chat', b('to call a spade a spade', 'parler sans détour')],
        ['vider son sac', b('to get everything off one’s chest', 'dire tout ce qu’on avait sur le cœur')],
        ['mettre les points sur les i', b('to make things crystal clear', 'clarifier fermement une règle')],
      ]),
      mc(
        P.best,
        ['mettre les points sur les i', 'noyer le poisson', 'tourner autour du pot', 'vendre la mèche'],
        {
          fr: 'Les horaires ne sont toujours pas respectés : demain matin, le responsable va ___ avec toute l’équipe.',
          explain: b('Mettre les points sur les i means laying down clear, unambiguous expectations.', 'Mettre les points sur les i signifie rappeler fermement les règles sans ambiguïté.'),
        },
      ),
      mc(
        P.meaning,
        [
          b('She speaks her mind boldly and effortlessly.', 'Elle parle avec assurance et ne se gêne pas pour donner son avis.'),
          b('She prefers listening silently during meetings.', 'Elle préfère écouter en silence pendant les réunions.'),
          b('She forgot to bring her notes in her coat pocket.', 'Elle a oublié ses notes dans la poche de son manteau.'),
          b('She avoids answering direct questions.', 'Elle évite de répondre aux questions directes.'),
        ],
        {
          fr: 'Dans les débats publics, Claire n’a jamais sa langue dans sa poche.',
          explain: b('Ne pas avoir sa langue dans sa poche describes someone lively, witty and outspoken.', 'Ne pas avoir sa langue dans sa poche qualifie quelqu’un qui répond du tac au tac sans hésiter.'),
        },
      ),
      pairs(P.match, [
        ['ne pas avoir sa langue dans sa poche', b('to be outspoken', 'avoir le verbe facile et direct')],
        ['dire les quatre vérités à quelqu’un', b('to tell someone home truths', 'dire ses reproches franchement')],
        ['appeler un chat un chat', b('to call a spade a spade', 'nommer les choses sans détour')],
        ['vider son sac', b('to get it all off one’s chest', 'dire tout ce qu’on garde depuis longtemps')],
        ['mettre les points sur les i', b('to make things crystal clear', 'clarifier fermement chaque détail')],
      ]),
      gap(
        P.complete,
        'J’en avais assez des sous-entendus : j’ai préféré appeler un ___ un chat et ___ mon sac, puis j’ai mis les ___ sur les i.',
        [['chat'], ['vider'], ['points']],
        {
          choices: [
            ['chat', 'chien', 'pot'],
            ['vider', 'garder', 'vendre'],
            ['points', 'doigts', 'pieds'],
          ],
          explain: b('Use appeler un chat un chat, vider son sac, and mettre les points sur les i.', 'On retrouve appeler un chat un chat, vider son sac et mettre les points sur les i.'),
        },
      ),
      hear(
        'Julie n’a pas sa langue dans sa poche : hier soir, elle a fini par vider son sac et par dire ses quatre vérités à notre voisin bruyant.',
        b('What did Julie do yesterday evening?', 'Qu’a fait Julie hier soir ?'),
        [
          b('She spoke very bluntly and told the noisy neighbour everything on her mind.', 'Elle a parlé sans détour et reproché franchement le bruit à son voisin.'),
          b('She refused to talk to the neighbour and closed the door.', 'Elle a refusé de parler au voisin et fermé la porte.'),
          b('She asked someone else to write a polite note.', 'Elle a demandé à quelqu’un d’autre d’écrire un mot poli.'),
        ],
      ),
      dict('Appelons un chat un chat : il est temps de mettre les points sur les i.'),
      say('Elle n’a pas sa langue dans sa poche et préfère toujours appeler un chat un chat.', 'She speaks her mind boldly and always prefers to call a spade a spade.'),
    ],
    [
      b('ne pas avoir sa langue dans sa poche = be outspoken; appeler un chat un chat = speak plainly.', 'ne pas avoir sa langue dans sa poche = avoir le verbe facile ; appeler un chat un chat = nommer sans détour.'),
      b('vider son sac and dire les quatre vérités à quelqu’un describe airing pent-up truths.', 'vider son sac et dire les quatre vérités à quelqu’un expriment un franc-parler sans filtre.'),
      b('mettre les points sur les i = spell expectations out firmly (no -s on i).', 'mettre les points sur les i = clarifier fermement (sans -s à i).'),
    ],
    [
      ['ne pas avoir sa langue dans sa poche', b('to be outspoken', 'parler librement et sans timidité')],
      ['dire les quatre vérités à quelqu’un', b('to tell someone home truths', 'dire ses reproches en face')],
      ['appeler un chat un chat', b('to call a spade a spade', 'parler directement sans détour')],
      ['vider son sac', b('to get everything off one’s chest', 'dire tout ce qu’on avait sur le cœur')],
      ['mettre les points sur les i', b('to spell things out clearly', 'clarifier fermement les choses')],
    ],
  ),

  lesson(
    C,
    2,
    ['avoiding-and-hiding', 'esquiver-et-dissimuler'],
    b('Dodging the issue, silence & fence-sitting', 'Esquive, silence et double jeu'),
    b('Spot when someone beats around the bush, muddies the waters, turns a deaf ear or plays both sides.', 'Repérer quand on tourne autour du pot, qu’on noie le poisson, qu’on fait la sourde oreille ou qu’on ménage les deux camps.'),
    [
      b('Contrast beating around the bush (tourner autour du pot) with muddying the waters (noyer le poisson)', 'Distinguer tourner autour du pot et noyer le poisson'),
      b('Tell silent refusal (garder le silence) from selective ignoring (faire la sourde oreille)', 'Distinguer garder le silence et faire la sourde oreille'),
      b('Express trying to please opposing camps with ménager la chèvre et le chou', 'Exprimer le compromis délicat avec ménager la chèvre et le chou'),
    ],
    13,
    [
      card(
        b('How speakers dodge the truth', 'Les façons d’éviter la réponse directe'),
        b(
          'People evade tough questions in very different ways: **tourner autour du pot** means hesitating before reaching the point, while **noyer le poisson** means burying a clear question in endless irrelevant details. One can also **garder le silence**, **faire la sourde oreille** (pretend not to hear), or **ménager la chèvre et le chou** (try to satisfy two opposite sides at once).\n\nVerbal evasion: **tourner autour du pot, noyer le poisson, ménager la chèvre et le chou**.\nRefusal to engage: **garder le silence, faire la sourde oreille**.',
          'On peut éviter un sujet gênant de plusieurs manières : **tourner autour du pot** consiste à hésiter avant d’aller au fait, tandis que **noyer le poisson** noie la question sous un flot de paroles. On peut aussi **garder le silence**, **faire la sourde oreille** ou **ménager la chèvre et le chou**.\n\nEsquive verbale : **tourner autour du pot, noyer le poisson, ménager la chèvre et le chou**.\nRefus d’intervenir : **garder le silence, faire la sourde oreille**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['tourner autour du pot', b('to circle around the pot', 'tourner sans entrer dans le sujet'), b('to beat around the bush', 'hésiter à aborder le vrai sujet')],
              ['noyer le poisson', b('to drown the fish', 'épuiser le poisson en tirant la ligne'), b('to muddy the waters, evade clearly', 'embrouiller la discussion pour esquiver')],
              ['garder le silence', b('to keep silence', 'rester muet'), b('to stay silent, say nothing', 'ne rien révéler, rester muet')],
              ['faire la sourde oreille', b('to put on a deaf ear', 'feindre de ne pas entendre'), b('to turn a deaf ear, ignore requests', 'ignorer volontairement une demande')],
              ['ménager la chèvre et le chou', b('spare both the goat and the cabbage', 'ménager deux intérêts opposés'), b('to try to please both sides', 'contenter deux camps contradictoires')],
            ],
          },
          ex: [
            ['Arrête de tourner autour du pot : dis-moi franchement si le projet est annulé !', 'Stop beating around the bush: tell me frankly if the project is cancelled!'],
            ['Face aux questions des journalistes sur le budget, l’élu a noyé le poisson pendant dix minutes.', 'Faced with journalists’ budget questions, the official muddied the waters for ten minutes.'],
            ['Le médiateur essaie de ménager la chèvre et le chou entre les riverains et les commerçants.', 'The mediator is trying to please both sides between residents and shopkeepers.'],
          ],
        },
      ),
      trap(
        b('Tourner autour du pot vs noyer le poisson', 'Tourner autour du pot ou noyer le poisson ?'),
        b(
          'These two evasion idioms are not identical! **Tourner autour du pot** suggests awkward hesitation—someone is circling the main topic because it is delicate (*Arrête de tourner autour du pot*). **Noyer le poisson** is deliberate confusion—drowning the listener in jargon or side remarks so they forget the original question. Likewise, **faire la sourde oreille** is ignoring a request (*à nos appels*), while **garder le silence** is refusing to speak.\n\nPreposition: **faire la sourde oreille à + nom** (*faire la sourde oreille aux critiques*).',
          'Ne confondez pas ces deux images ! **Tourner autour du pot** traduit une hésitation devant un sujet délicat (*Arrête de tourner autour du pot*). **Noyer le poisson** est une manœuvre volontaire : multiplier les détours pour faire oublier la question posée. De même, **faire la sourde oreille** prend la préposition **à** (*faire la sourde oreille aux demandes*), alors que **garder le silence** signifie se taire.\n\nPréposition : **faire la sourde oreille à + nom**.',
        ),
      ),
      flash(b('Avoiding & hiding', 'Esquive et silence'), [
        ['tourner autour du pot', b('to beat around the bush', 'hésiter à aborder l’essentiel')],
        ['noyer le poisson', b('to muddy the waters, dodge an issue', 'embrouiller un sujet pour esquiver')],
        ['garder le silence', b('to keep quiet, say nothing', 'choisir de ne rien dire')],
        ['faire la sourde oreille', b('to turn a deaf ear', 'ignorer volontairement une demande')],
        ['ménager la chèvre et le chou', b('to please both sides / hedge', 'satisfaire deux camps opposés')],
      ]),
      mc(
        P.best,
        ['noyer le poisson', 'vider son sac', 'appeler un chat un chat', 'mettre les points sur les i'],
        {
          fr: 'Je lui ai demandé combien coûtait la réparation, et il m’a parlé de la météo, de ses fournisseurs et du trafic : il essaie de ___.',
          explain: b('Burying a simple question under irrelevant talk is noyer le poisson.', 'Multiplier les digressions pour esquiver une question précise se dit noyer le poisson.'),
        },
      ),
      mc(
        P.meaning,
        [
          b('She wants to avoid upsetting either of two opposing groups.', 'Elle cherche à contenter deux camps aux intérêts opposés.'),
          b('She is raising farm animals in the countryside.', 'Elle élève des animaux à la campagne.'),
          b('She refuses to speak to anyone at the meeting.', 'Elle refuse d’adresser la parole aux participants.'),
          b('She is speaking boldly without caring whom she offends.', 'Elle parle sans filtre au risque de blesser.'),
        ],
        {
          fr: 'Dans cette négociation tendue, la directrice tente de ménager la chèvre et le chou.',
          explain: b('Ménager la chèvre et le chou comes from the old river-crossing puzzle: keeping two incompatible parties happy.', 'Ménager la chèvre et le chou signifie préserver deux intérêts contradictoires sans froisser personne.'),
        },
      ),
      sort(
        b('Sort each phrase: active evasion/hedging or keeping silent/ignoring.', 'Classez : esquive ou double discours vs silence et refus d’écouter.'),
        [
          b('Circling, muddying or hedging', 'Esquiver ou ménager les camps'),
          b('Silence or ignoring requests', 'Se taire ou faire semblant de ne pas entendre'),
        ],
        [
          ['tourner autour du pot', 0],
          ['garder le silence', 1],
          ['noyer le poisson', 0],
          ['faire la sourde oreille', 1],
          ['ménager la chèvre et le chou', 0],
          ['ne souffler mot', 1],
        ],
      ),
      gap(
        P.complete,
        'Cela fait trois fois que nous écrivons au syndic, mais il fait la ___ oreille et garde le ___. Quand il finit par répondre, il se contente de ___ autour du pot.',
        [['sourde'], ['silence'], ['tourner']],
        {
          choices: [
            ['sourde', 'blanche', 'froide'],
            ['silence', 'secret', 'sac'],
            ['tourner', 'noyer', 'vider'],
          ],
          explain: b('Use faire la sourde oreille, garder le silence, and tourner autour du pot.', 'On associe faire la sourde oreille, garder le silence et tourner autour du pot.'),
        },
      ),
      ord(
        P.order,
        'Ce compromis cherche à ménager la chèvre et le chou.',
        {
          tr: 'This compromise seeks to please both sides.',
          extra: ['poisson', 'pot'],
          explain: b('Ménager always precedes la chèvre et le chou.', 'L’expression complète est ménager la chèvre et le chou.'),
        },
      ),
      hear(
        'Ne tourne pas autour du pot, Samir : dis-moi simplement si tu as oublié d’envoyer le dossier, au lieu de noyer le poisson avec des détails techniques.',
        b('What does the speaker ask Samir to stop doing?', 'Que demande-t-on à Samir d’arrêter ?'),
        [
          b('Hesitating and obscuring the issue instead of giving a straight answer.', 'Hésiter et embrouiller la question au lieu de répondre franchement.'),
          b('Sending the technical file without checking it first.', 'Envoyer le dossier technique sans le relire.'),
          b('Staying completely silent during the phone call.', 'Rester totalement muet pendant l’appel.'),
        ],
        { voice: 'f2' },
      ),
      say('Inutile de faire la sourde oreille ou de tourner autour du pot : répondons franchement.', 'No point turning a deaf ear or beating around the bush: let’s answer frankly.'),
    ],
    [
      b('tourner autour du pot = hesitate to get to the point; noyer le poisson = drown the question in irrelevant talk.', 'tourner autour du pot = hésiter ; noyer le poisson = embrouiller volontairement.'),
      b('garder le silence = stay quiet; faire la sourde oreille à = deliberately ignore.', 'garder le silence = se taire ; faire la sourde oreille à = ignorer volontairement.'),
      b('ménager la chèvre et le chou = try to satisfy two conflicting sides.', 'ménager la chèvre et le chou = tenter de contenter deux camps opposés.'),
    ],
    [
      ['tourner autour du pot', b('to beat around the bush', 'hésiter avant d’aller au fait')],
      ['noyer le poisson', b('to muddy the waters', 'embrouiller pour éviter de répondre')],
      ['garder le silence', b('to keep silent', 'ne rien dire')],
      ['faire la sourde oreille', b('to turn a deaf ear', 'ignorer volontairement une demande')],
      ['ménager la chèvre et le chou', b('to try to please both sides', 'contenter deux intérêts opposés')],
    ],
  ),

  lesson(
    C,
    3,
    ['secrets-and-leaks', 'secrets-et-indiscretions'],
    b('Secrets, leaks & confessions', 'Secrets, fuites et aveux'),
    b('Keep a tight lid on surprises, spot when someone spills the beans and uncover hidden truths.', 'Garder un secret comme une tombe, révéler une surprise par mégarde et découvrir la vérité.'),
    [
      b('Express keeping a secret tightly with motus et bouche cousue and garder un secret comme une tombe', 'Promettre et garder le secret absolu'),
      b('Describe spilling or confessing secrets with vendre la mèche and cracher le morceau', 'Dire qu’on révèle un secret ou qu’on avoue'),
      b('Talk about uncovering hidden facts with découvrir le pot aux roses', 'Exprimer la découverte d’un secret avec découvrir le pot aux roses'),
    ],
    13,
    [
      card(
        b('Keeping secrets—or letting them slip', 'Garder ou trahir un secret'),
        b(
          'Planning a surprise party or protecting confidential news calls for five classic idioms: promise discretion with **motus et bouche cousue** and **garder un secret comme une tombe**. If someone accidentally leaks it, they **vendent la mèche**; if they reluctantly confess under pressure, they **crachent le morceau**; and when the hidden scheme is uncovered, you **découvrez le pot aux roses**.\n\nDiscretion: **motus et bouche cousue, garder un secret comme une tombe**.\nLeaks & discovery: **vendre la mèche, cracher le morceau, découvrir le pot aux roses**.',
          'Pour organiser une fête surprise ou taire une confidence, on promet la discrétion par **motus et bouche cousue** ou en disant qu’on **garde un secret comme une tombe**. Une indiscrétion fait **vendre la mèche**, un aveu forcé fait **cracher le morceau**, et la vérité cachée finit par faire **découvrir le pot aux roses**.\n\nDiscrétion : **motus et bouche cousue, garder un secret comme une tombe**.\nFuites et révélation : **vendre la mèche, cracher le morceau, découvrir le pot aux roses**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['vendre la mèche', b('to sell the fuse', 'trahir un plan préparé'), b('to spill the beans, leak a secret', 'révéler un secret (souvent par erreur)')],
              ['motus et bouche cousue', b('hush and mouth sewn shut', 'silence total, lèvres cousues'), b('mum’s the word, lips are sealed', 'ne rien dire du tout, garder le secret')],
              ['découvrir le pot aux roses', b('to uncover the jar of roses', 'trouver la boîte secrète'), b('to uncover the hidden truth/scheme', 'découvrir un secret bien caché')],
              ['garder un secret comme une tombe', b('silent as a grave', 'muet comme une tombe'), b('to take a secret to the grave', 'être d’une discrétion absolue')],
              ['cracher le morceau', b('to spit out the piece', 'lâcher enfin ce qu’on cache'), b('to spill the beans, confess (informal)', 'finir par avouer la vérité (familier)')],
            ],
          },
          ex: [
            ['Nous organisons un dîner surprise pour sa retraite : motus et bouche cousue !', 'We are organizing a surprise dinner for his retirement: lips sealed!'],
            ['L’auditrice a fini par découvrir le pot aux roses en vérifiant deux factures.', 'The auditor eventually uncovered the whole scheme by checking two invoices.'],
            ['À force de questions, Thomas a craché le morceau : c’est lui qui avait cassé la tasse.', 'After repeated questions, Thomas confessed: he was the one who broke the mug.'],
          ],
        },
      ),
      culture(
        b('Fuses, rose jars and how to pronounce motus!', 'Mèches, pots aux roses et prononciation de motus'),
        b(
          'In **vendre la mèche**, *la mèche* was a gunpowder fuse—revealing where it lay ruined the whole plan! **Découvrir le pot aux roses** comes from small hidden jars of rose-scented powder or letters tucked away inside dressing tables. One pronunciation tip: in **motus et bouche cousue**, always pronounce the final **-s** of *motus* (/mɔtys/)!\n\nSay /mɔtys/: **Motus et bouche cousue !**\nRegister note: **cracher le morceau** is informal; **garder un secret comme une tombe** works everywhere.',
          'Dans **vendre la mèche**, la mèche désignait la corde d’explosif dont la révélation faisait échouer l’opération. **Découvrir le pot aux roses** évoquait autrefois une petite boîte secrète parfumée à la rose où l’on cachait lettres ou fards. Côté prononciation, dans **motus et bouche cousue**, on fait toujours entendre le **-s** final de *motus* !\n\nPrononciation : **Motus (/mɔtys/) et bouche cousue !**\nRegistre : **cracher le morceau** est familier.',
        ),
      ),
      mc(
        P.best,
        ['a vendu la mèche', 'a gardé le silence', 'a tourné la page', 'a fait la sourde oreille'],
        {
          fr: 'Camille devait garder le voyage secret jusqu’à vendredi, mais elle ___ dès lundi devant son frère !',
          explain: b('Accidentally giving away a surprise is vendre la mèche.', 'Révéler un secret ou une surprise avant l’heure se dit vendre la mèche.'),
        },
      ),
      pairs(P.match, [
        ['vendre la mèche', b('to let the cat out of the bag', 'révéler un secret avant l’heure')],
        ['motus et bouche cousue', b('mum’s the word', 'silence absolu sur un secret')],
        ['découvrir le pot aux roses', b('to uncover the hidden truth', 'mettre au jour un secret caché')],
        ['garder un secret comme une tombe', b('to be totally tight-lipped', 'garder une confidence avec discrétion')],
        ['cracher le morceau', b('to spill the beans / confess', 'avouer enfin ce qu’on cachait')],
      ]),
      hear(
        'Personne n’était au courant de son départ, mais quand Léo a vu les cartons dans le garage, il a vite découvert le pot aux roses. Heureusement, il garde un secret comme une tombe.',
        b('Why is the speaker relieved about Léo?', 'Pourquoi la personne est-elle rassurée au sujet de Léo ?'),
        [
          b('Even though Léo figured out the secret, he will never tell anyone.', 'Même s’il a deviné la vérité, Léo est parfaitement discret.'),
          b('Léo immediately spilled the secret to the whole office.', 'Léo a tout de suite répété la nouvelle à tout le bureau.'),
          b('Léo did not notice the moving boxes in the garage.', 'Léo n’a rien remarqué dans le garage.'),
        ],
        { voice: 'm2' },
      ),
      dlg(
        b('Planning a surprise party', 'Préparer une fête surprise'),
        b('Emma whispers with her colleague Lucas in the corridor before Claire’s birthday.', 'Emma parle à voix basse avec son collègue Lucas avant l’anniversaire de Claire.'),
        [['Emma', 'f'], ['Lucas', 'm']],
        [
          [0, 'Lucas, c’est confirmé : on organise la fête surprise pour Claire vendredi à 19 h au bistrot du coin.', 'Lucas, it’s confirmed: we’re organizing Claire’s surprise party on Friday at 7 p.m. at the corner bistro.'],
          [1, {
            options: [
              'Promis, motus et bouche cousue ! Je garde un secret comme une tombe.',
              'Promis, je vais vendre la mèche dès qu’elle arrive !',
              'Promis, je vais cracher le morceau devant tout le service.',
            ],
            explain: b('Motus et bouche cousue and garder un secret comme une tombe promise total discretion.', 'Motus et bouche cousue et garder un secret comme une tombe garantissent le silence.'),
          }],
          [0, 'Attention quand même : hier, elle m’a vue cacher le gâteau dans le réfrigérateur et j’ai eu peur qu’elle ne découvre le pot aux roses.', 'Careful though: yesterday she saw me hiding the cake in the fridge and I worried she’d uncover the secret.'],
          [1, {
            options: [
              'Tant qu’on ne vend pas la mèche avant vendredi soir, elle n’en saura rien !',
              'Alors il faut appeler un chat un chat et tout lui raconter ce midi.',
              'Oui, faisons la sourde oreille quand elle entre dans la salle vendredi.',
            ],
            explain: b('Tant qu’on ne vend pas la mèche warns against leaking the secret.', 'Tant qu’on ne vend pas la mèche signifie tant que personne ne révèle le secret.'),
          }],
          [0, 'Parfait ! Rendez-vous jeudi pour vérifier les invitations.', 'Perfect! Let’s meet Thursday to check the invitations.'],
        ],
      ),
      dict('Motus et bouche cousue : personne ne doit vendre la mèche avant samedi soir.'),
      write(
        b('A secret almost leaked', 'Un secret presque dévoilé'),
        b('Write 45–85 words describing a surprise you helped prepare (a birthday, trip or gift) or a secret someone nearly discovered. Use at least three idioms from this course (for example motus et bouche cousue, garder un secret comme une tombe, vendre la mèche, découvrir le pot aux roses or cracher le morceau).', 'Racontez en 45 à 85 mots une surprise que vous avez préparée (anniversaire, voyage ou cadeau) ou un secret qui a failli être découvert. Employez au moins trois expressions de ce cours (par exemple motus et bouche cousue, garder un secret comme une tombe, vendre la mèche, découvrir le pot aux roses ou cracher le morceau).'),
        45,
        85,
        [
          b('Clear surprise or secret situation', 'Situation claire de surprise ou de secret'),
          b('At least three truth/secret idioms used accurately', 'Au moins trois expressions employées avec justesse'),
          b('Natural narrative flow with past tenses', 'Récit fluide avec des temps du passé maîtrisés'),
        ],
        'Pour les quarante ans de ma sœur, toute la famille avait promis : motus et bouche cousue ! Pendant trois semaines, chacun a gardé le secret comme une tombe. Malheureusement, mon petit cousin a failli vendre la mèche en parlant des billets de train devant elle. Par chance, elle n’a rien entendu et n’a découvert le pot aux roses qu’à l’aéroport !',
        { phrases: ['Motus et bouche cousue !', '… a gardé le secret comme une tombe', '… a failli vendre la mèche', '… a découvert le pot aux roses'] },
      ),
    ],
    [
      b('motus et bouche cousue (pronounce the -s of motus!) and garder un secret comme une tombe promise total discretion.', 'motus et bouche cousue (prononcez le -s de motus !) et garder un secret comme une tombe promettent la discrétion.'),
      b('vendre la mèche = spill a secret prematurely; cracher le morceau = confess reluctantly (informal).', 'vendre la mèche = trahir un secret ; cracher le morceau = finir par avouer (familier).'),
      b('découvrir le pot aux roses = uncover a hidden scheme or truth.', 'découvrir le pot aux roses = mettre au jour un secret caché.'),
    ],
    [
      ['vendre la mèche', b('to spill the beans, leak a secret', 'révéler un secret avant l’heure')],
      ['motus et bouche cousue', b('mum’s the word, lips sealed', 'silence total, ne rien révéler')],
      ['découvrir le pot aux roses', b('to uncover the hidden truth', 'découvrir un secret dissimulé')],
      ['garder un secret comme une tombe', b('to keep a secret tightly', 'être d’une discrétion absolue')],
      ['cracher le morceau', b('to confess, spill the beans (informal)', 'finir par avouer (familier)')],
    ],
  ),
];

export default lessons;
