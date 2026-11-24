import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Navigate French-speaking workplaces at B2 level with idiomatic precision: describe momentum and resilience, reset expectations clearly, raise timely warnings, and steer tough negotiations toward consensus using authentic office and leadership idioms.',
    'Évoluez dans les milieux professionnels francophones au niveau B2 avec justesse : décrivez l’élan et la résilience d’une équipe, recadrez avec clarté, lancez une alerte au bon moment et menez vos négociations vers un terrain d’entente grâce aux expressions authentiques du bureau et du leadership.',
  ),
  outcomes: [
    b('Express strong performance, initiative and resilience in meetings and reports', 'Exprimer performance, prise d’initiative et mobilisation en réunion ou en rapport'),
    b('Use clarity and warning idioms diplomatically without sounding abrasive', 'Employer les expressions de mise au point et d’alerte avec tact professionnel'),
    b('Negotiate resets, consensus and dual wins naturally in B2 business French', 'Négocier compromis, nouveaux départs et accords durables en français professionnel'),
  ],
};

const C = 'exp-business-workplace-idioms';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['performance-and-momentum', 'performance-et-elan'],
    b('Performance, Momentum & Leadership', 'Performance, élan et prise de responsabilités'),
    b('Describe thriving teams, seizing initiative, staying ahead of competitors and working tirelessly under pressure.', 'Décrire réussite, élan favorable, prise de direction, avance stratégique et mobilisation sur le terrain.'),
    [
      b('Use five core workplace momentum idioms naturally', 'Employer cinq expressions clés de performance et d’élan au travail'),
      b('Distinguish seizing advantage from tireless readiness', 'Distinguer succès compétitif et vigilance constante'),
      b('Recognise business idioms in spoken briefings', 'Comprendre ces expressions dans un point d’activité oral'),
    ],
    13,
    [
      card(
        b('Wind at your back, hands on the reins', 'Vent en poupe et prise des rênes'),
        b(
          'French business speech draws heavily on sailing, riding and siege imagery to describe a team’s trajectory without dry clichés.\nSuccess & edge: **tirer son épingle du jeu, avoir le vent en poupe, garder une longueur d’avance**.\nLeadership & grit: **prendre les rênes, être sur la brèche**.',
          'Le français des affaires puise dans les images nautiques, équestres et militaires pour décrire la trajectoire d’une équipe avec relief.\nSuccès et avance : **tirer son épingle du jeu, avoir le vent en poupe, garder une longueur d’avance**.\nDirection et mobilisation : **prendre les rênes, être sur la brèche**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Image', 'Image'), b('Meaning', 'Sens')],
            rows: [
              ['tirer son épingle du jeu', b('pulling one’s pin in a game', 'jeu d’adresse ancien'), b('to come out ahead / do well in tough odds', 'réussir habilement dans un contexte difficile')],
              ['avoir le vent en poupe', b('tail wind in sails', 'vent favorable à l’arrière'), b('to have wind in one’s sails / thrive', 'connaître un succès croissant')],
              ['prendre les rênes', b('taking the reins', 'tenir les rênes'), b('to take the helm / take charge', 'prendre la direction d’un projet')],
              ['garder une longueur d’avance', b('staying a length ahead', 'course hippique'), b('to stay one step ahead', 'conserver de l’avance sur ses rivaux')],
              ['être sur la brèche', b('manning the breach', 'défense d’une muraille'), b('to be on constant duty / in the trenches', 'rester mobilisé et actif sans relâche')],
            ],
          },
          ex: [
            ['Malgré la hausse des coûts, notre PME a su tirer son épingle du jeu.', 'Despite rising costs, our SME managed to come out ahead.'],
            ['Le secteur des énergies propres a le vent en poupe depuis trois ans.', 'The clean-energy sector has had the wind in its sails for three years.'],
            ['Nos équipes d’astreinte sont sur la brèche depuis l’aube pour rétablir le serveur.', 'Our on-call teams have been working flat out since dawn to restore the server.'],
          ],
        },
      ),
      tip(
        b('Spelling & grammar watch: rênes vs brèche', 'Orthographe : rênes et brèche'),
        b(
          'Careful with homophones! You take **les rênes** (the leather reins, plural with **ê**, never *la reine* = the queen or *le renne* = reindeer). Likewise, **être sur la brèche** uses *la brèche* (an opening/breach in a wall) and takes no plural.',
          'Attention aux homophones ! On prend **les rênes** (au pluriel avec **ê**, jamais *reine* ni *renne*). De même, **être sur la brèche** s’écrit toujours au singulier avec un accent grave sur *è*.',
        ),
      ),
      flash(
        b('Five performance & momentum idioms', 'Cinq expressions d’élan et de performance'),
        [
          ['tirer son épingle du jeu', b('to come out on top / do well despite difficulty', 's’en sortir habilement, réussir malgré la concurrence')],
          ['avoir le vent en poupe', b('to have momentum / be thriving', 'avoir du succès, être porté par une dynamique positive')],
          ['prendre les rênes', b('to take the reins / take charge', 'prendre la direction d’une équipe ou d’un projet')],
          ['garder une longueur d’avance', b('to stay one step ahead', 'conserver son avantage sur les concurrents')],
          ['être sur la brèche', b('to be in the trenches / continuously on duty', 'être constamment mobilisé et actif')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('The regional branch managed to succeed despite a tight market.', 'La filiale régionale a su réussir malgré un marché difficile.'),
          b('The regional branch closed down three offices last quarter.', 'La filiale régionale a fermé trois bureaux au trimestre dernier.'),
          b('The managers played board games during the retreat.', 'Les responsables ont joué à des jeux de société en séminaire.'),
          b('Staff refused to join the competitive project.', 'Les équipes ont refusé de participer au projet.'),
        ],
        {
          fr: '« Dans un marché saturé, notre filiale régionale a pourtant tiré son épingle du jeu. »',
          explain: b('Tirer son épingle du jeu means managing skillfully to succeed or emerge ahead in a tricky situation.', 'Tirer son épingle du jeu signifie s’en sortir avec succès dans un contexte exigeant.'),
        },
      ),
      mc(
        P.best,
        [
          'Depuis son arrivée, Clara a pris les rênes du département et garde une longueur d’avance sur nos concurrents.',
          'Depuis son arrivée, Clara a tiré son épingle dans le vent et pris les brèches.',
          'Depuis son arrivée, Clara est sur la poupe et prend l’avance.',
          'Depuis son arrivée, Clara a gardé les rênes sur l’épingle.',
        ],
        {
          fr: 'Vous saluez la nouvelle directrice lors d’un bilan trimestriel :',
          explain: b('Prendre les rênes (take charge) pairs naturally with garder une longueur d’avance (stay ahead).', 'Prendre les rênes (diriger) et garder une longueur d’avance (devancer la concurrence) s’enchaînent avec précision.'),
        },
      ),
      pairs(
        P.match,
        [
          ['tirer son épingle du jeu', b('to come out well despite odds', 'réussir dans une situation difficile')],
          ['avoir le vent en poupe', b('to be thriving / have momentum', 'connaître un franc succès')],
          ['prendre les rênes', b('to take the helm / lead', 'prendre la direction')],
          ['garder une longueur d’avance', b('to stay ahead of rivals', 'devancer la concurrence')],
          ['être sur la brèche', b('to be continuously on duty / active', 'rester mobilisé sans relâche')],
        ],
      ),
      gap(
        P.complete,
        'Grâce à cette innovation, notre jeune entreprise ___ et parvient à ___ face aux grands groupes.',
        [['a le vent en poupe'], ['garder une longueur d’avance']],
        {
          choices: [
            ['a le vent en poupe', 'est sur la brèche', 'tire la sonnette'],
            ['garder une longueur d’avance', 'prendre les rênes', 'tirer son épingle'],
          ],
          explain: b('Innovation gives momentum (avoir le vent en poupe) and keeps the startup ahead (garder une longueur d’avance).', 'L’innovation donne de l’élan (avoir le vent en poupe) et permet de garder une longueur d’avance.'),
        },
      ),
      hear(
        'Depuis que Karim a pris les rênes de la logistique, l’équipe reste sur la brèche pendant les pics d’activité et parvient toujours à tirer son épingle du jeu.',
        b('What does the briefing say about the logistics team?', 'Que dit ce point sur l’équipe logistique ?'),
        [
          b('Under Karim’s leadership, they stay constantly engaged and perform well during peak demand.', 'Sous la direction de Karim, l’équipe reste mobilisée et s’en sort brillamment aux périodes de pointe.'),
          b('Karim stepped down before the busy season started.', 'Karim a quitté ses fonctions avant la haute saison.'),
          b('The logistics department lost market share this quarter.', 'Le service logistique a perdu du terrain ce trimestre.'),
          b('They postponed deliveries until competition eased.', 'Ils ont reporté les livraisons en attendant moins de concurrence.'),
        ],
      ),
      dict('En prenant les rênes tôt, elle a su garder une longueur d’avance et tirer son épingle du jeu.', {
        hint: b('Watch rênes with circumflex accent ê and plural -s.', 'Attention à rênes avec l’accent circonflexe ê et le -s final.'),
      }),
      say(
        'Notre équipe est sur la brèche depuis janvier, et notre produit a vraiment le vent en poupe.',
        'Our team has been flat out since January, and our product truly has the wind in its sails.',
      ),
    ],
    [
      b('tirer son épingle du jeu = succeed despite difficulty; avoir le vent en poupe = thrive.', 'tirer son épingle du jeu = réussir malgré les obstacles ; avoir le vent en poupe = avoir le succès avec soi.'),
      b('prendre les rênes (with ê) = take the helm; garder une longueur d’avance = stay ahead.', 'prendre les rênes = prendre la direction ; garder une longueur d’avance = devancer.'),
      b('être sur la brèche = stay tirelessly mobilized on the front line.', 'être sur la brèche = rester mobilisé et actif en continu.'),
    ],
    [
      ['tirer son épingle du jeu', b('to come out ahead despite tough odds', 'réussir habilement dans un contexte difficile')],
      ['avoir le vent en poupe', b('to have the wind in one’s sails', 'être porté par le succès')],
      ['prendre les rênes', b('to take the reins / take charge', 'prendre la direction d’un projet ou d’une équipe')],
      ['garder une longueur d’avance', b('to stay one step ahead', 'conserver son avantage sur la concurrence')],
      ['être sur la brèche', b('to be continuously on duty / active', 'rester mobilisé sans relâche')],
    ],
  ),

  lesson(
    C,
    2,
    ['clarity-and-standards', 'clarte-et-exigence'],
    b('Clarity, Transparency & Raising Alarms', 'Mise au point, franchise et alerte'),
    b('Set firm standards, reset discipline, speak transparently, defend your team and raise timely warnings in the workplace.', 'Rétablir les règles, parler franc jeu, défendre ses positions et alerter à temps dans un cadre professionnel.'),
    [
      b('Distinguish forceful correction from transparent negotiation', 'Distinguer recadrage ferme et transparence constructive'),
      b('Use monter au créneau and tirer la sonnette d’alarme appropriately', 'Employer monter au créneau et tirer la sonnette d’alarme à bon escient'),
      b('Avoid overly blunt phrasing with external clients or partners', 'Éviter les formulations trop abruptes face à un client ou partenaire'),
    ],
    13,
    [
      card(
        b('Resetting standards & speaking openly', 'Rétablir l’ordre et jouer franc jeu'),
        b(
          'When deadlines slip or rumours spread in an office, leaders choose between **firm resets**, **open transparency**, **active defence**, and **urgent warnings**.\nFirm reset: **mettre les points sur les i, remettre les pendules à l’heure**.\nAction & candour: **monter au créneau, jouer cartes sur table, tirer la sonnette d’alarme**.',
          'Quand les délais glissent ou que les malentendus s’installent, les responsables choisissent entre **recadrage ferme**, **transparence**, **défense active** et **alerte urgente**.\nMise au point : **mettre les points sur les i, remettre les pendules à l’heure**.\nCourage et franchise : **monter au créneau, jouer cartes sur table, tirer la sonnette d’alarme**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Use when…', 'Contexte d’emploi'), b('Meaning', 'Sens')],
            rows: [
              ['mettre les points sur les i', b('clarifying expectations sharply', 'fixer des limites nettes'), b('to set the record straight', 'expliquer sans détour ce qu’on attend')],
              ['remettre les pendules à l’heure', b('correcting drift or false claims', 'corriger un laisser-aller'), b('to put things back in order / set straight', 'rétablir la vérité ou la discipline')],
              ['monter au créneau', b('defending a team or cause publicly', 'défendre publiquement'), b('to step up to the plate / speak out', 'intervenir avec fermeté pour défendre')],
              ['jouer cartes sur table', b('negotiating honestly', 'négocier sans rien cacher'), b('to put all cards on the table', 'agir avec totale transparence')],
              ['tirer la sonnette d’alarme', b('flagging a serious risk early', 'prévenir d’un danger imminent'), b('to sound the alarm', 'alerter d’urgence avant une crise')],
            ],
          },
          ex: [
            ['Face aux retards répétés, le responsable a dû remettre les pendules à l’heure.', 'Faced with repeated delays, the manager had to set things straight.'],
            ['La syndicaliste est montée au créneau pour défendre le maintien des postes.', 'The union rep stepped up strongly to defend keeping the jobs.'],
            ['Avant de signer, jouons cartes sur table sur les coûts cachés du projet.', 'Before signing, let’s put all cards on the table about the project’s hidden costs.'],
          ],
        },
      ),
      trap(
        b('Firmness inside vs. diplomacy with clients', 'Fermeté en interne vs tact avec les clients'),
        b(
          '**Mettre les points sur les i** and **remettre les pendules à l’heure** convey authority and irritation—appropriate with a drifting supplier or internally after repeated slips, **not** as your opening line to a new client! With clients or boards, **jouer cartes sur table** (transparent honesty) and **tirer la sonnette d’alarme** (preventive warning) preserve trust while staying firm.',
          '**Mettre les points sur les i** et **remettre les pendules à l’heure** expriment autorité et agacement : ils conviennent après des dérives répétées en interne, **jamais** pour accueillir un nouveau client ! Face à un client ou un conseil, préférez **jouer cartes sur table** (franchise loyale) ou **tirer la sonnette d’alarme** (prévention responsable).',
        ),
      ),
      flash(
        b('Five workplace clarity & warning idioms', 'Cinq expressions de mise au point et d’alerte'),
        [
          ['mettre les points sur les i', b('to spell things out firmly', 'préciser ses exigences sans ambiguïté')],
          ['remettre les pendules à l’heure', b('to set the record straight / restore order', 'rétablir la vérité ou la discipline')],
          ['monter au créneau', b('to speak out boldly / step up to defend', 'prendre fermement la défense d’une cause')],
          ['jouer cartes sur table', b('to put all cards on the table / be candid', 'parler avec une totale transparence')],
          ['tirer la sonnette d’alarme', b('to sound the alarm / warn urgently', 'signaler un danger grave sans attendre')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('She spoke transparently about the real constraints without hiding any risk.', 'Elle a exposé les vraies contraintes avec franchise sans rien dissimuler.'),
          b('She invited colleagues to play cards during the lunch break.', 'Elle a invité ses collègues à jouer aux cartes à midi.'),
          b('She concealed the budget figures until the next meeting.', 'Elle a caché les chiffres du budget jusqu’à la prochaine réunion.'),
          b('She postponed the partnership talks indefinitely.', 'Elle a reporté les discussions de partenariat sans date.'),
        ],
        {
          fr: '« Dès l’ouverture de la négociation, la directrice a préféré jouer cartes sur table. »',
          explain: b('Jouer cartes sur table means laying out facts, motives and limits openly.', 'Jouer cartes sur table signifie aborder une discussion en toute transparence.'),
        },
      ),
      mc(
        P.best,
        [
          'Les ingénieurs ont tiré la sonnette d’alarme sur la faille serveur trois mois avant le lancement.',
          'Les ingénieurs ont remis les pendules sur la faille serveur pour s’amuser.',
          'Les ingénieurs ont mis les points sur le créneau pour cacher la faille.',
          'Les ingénieurs ont tiré leur épingle d’alarme sur le lancement.',
        ],
        {
          fr: 'Vous voulez indiquer que l’équipe technique a signalé un risque majeur à temps :',
          explain: b('Tirer la sonnette d’alarme means sounding an urgent warning to prevent failure.', 'Tirer la sonnette d’alarme signifie alerter à temps face à un danger imminent.'),
        },
      ),
      sort(
        b('Sort each expression by its main role in a meeting.', 'Classez chaque expression selon son rôle en réunion.'),
        [b('Clarify or speak openly', 'Clarifier ou parler franc jeu'), b('Defend firmly or warn urgently', 'Défendre fermement ou alerter')],
        [
          ['jouer cartes sur table', 0],
          ['monter au créneau', 1],
          ['mettre les points sur les i', 0],
          ['tirer la sonnette d’alarme', 1],
          ['remettre les pendules à l’heure', 0],
          ['être sur la brèche', 1],
        ],
      ),
      gap(
        P.complete,
        'Lors du comité de crise, le responsable qualité a tiré la ___ d’alarme avant de jouer cartes sur ___ devant la direction.',
        ['sonnette', 'table'],
        {
          tr: 'During the crisis committee, the quality lead sounded the alarm before putting all cards on the table in front of management.',
          hint: b('Two single nouns: tirer la ___ d’alarme / jouer cartes sur ___.', 'Deux noms simples : tirer la ___ d’alarme / jouer cartes sur ___.'),
        },
      ),
      ord(
        P.order,
        'Il a fallu remettre les pendules à l’heure dès le début de la réunion.',
        {
          tr: 'We had to set the record straight right from the start of the meeting.',
          extra: ['cartes', 'alarme'],
          explain: b('Il a fallu + infinitive remettre les pendules à l’heure + time phrase.', 'Il a fallu suivi de l’infinitif remettre les pendules à l’heure.'),
        },
      ),
      hear(
        'Quand le conseil a voulu réduire le budget de recherche, les trois responsables scientifiques sont montés au créneau pour défendre leurs laboratoires, tout en jouant cartes sur table sur les coûts réels.',
        b('How did the research leads respond to the proposed budget cut?', 'Comment les responsables scientifiques ont-ils réagi à la coupe budgétaire ?'),
        [
          b('They spoke up forcefully to defend their labs while being candid about real costs.', 'Ils ont défendu fermement leurs laboratoires tout en présentant les coûts en toute transparence.'),
          b('They quietly accepted the cut without raising any objection.', 'Ils ont accepté la réduction sans émettre d’objection.'),
          b('They delayed the budget report until the end of the year.', 'Ils ont repoussé le rapport budgétaire en fin d’année.'),
          b('They accused management of hiding previous clock schedules.', 'Ils ont accusé la direction de cacher les horaires.'),
        ],
        { voice: 'f2' },
      ),
      say(
        'Avant d’engager les budgets, jouons cartes sur table et remettons les pendules à l’heure.',
        'Before committing the budgets, let’s put our cards on the table and set the record straight.',
      ),
    ],
    [
      b('mettre les points sur les i / remettre les pendules à l’heure = firm clarification or reset.', 'mettre les points sur les i / remettre les pendules à l’heure = recadrage ferme.'),
      b('jouer cartes sur table = speak transparently; monter au créneau = step up to defend.', 'jouer cartes sur table = être transparent ; monter au créneau = défendre fermement.'),
      b('tirer la sonnette d’alarme = sound an urgent preventive warning.', 'tirer la sonnette d’alarme = lancer une alerte face à un risque sérieux.'),
    ],
    [
      ['mettre les points sur les i', b('to set things straight firmly', 'clarifier ses exigences sans ambiguïté')],
      ['remettre les pendules à l’heure', b('to put things straight / restore order', 'rétablir la vérité ou les règles')],
      ['monter au créneau', b('to step up and speak out firmly', 'prendre fermement la défense d’une cause')],
      ['jouer cartes sur table', b('to put all cards on the table', 'parler avec une totale transparence')],
      ['tirer la sonnette d’alarme', b('to sound the alarm', 'alerter d’urgence avant une crise')],
    ],
  ),

  lesson(
    C,
    3,
    ['resets-and-consensus', 'repartir-et-trouver-un-accord'],
    b('Fresh Starts, Consensus & Winning Solutions', 'Table rase, compromis et solutions gagnantes'),
    b('Steer negotiations from deadlock to common ground, test ideas cautiously, achieve dual wins and wrap up a deal.', 'Sortir d’une impasse vers un terrain d’entente, tester une piste, faire coup double et conclure un accord.'),
    [
      b('Use five negotiation and problem-solving idioms naturally', 'Employer cinq expressions de négociation et de relance'),
      b('Navigate a realistic contract dialogue using workplace idioms', 'Réussir un dialogue de négociation professionnelle avec les bonnes tournures'),
      b('Write a B2 recap email or memo integrating business idioms smoothly', 'Rédiger un compte rendu B2 intégrant naturellement les expressions du cours'),
    ],
    13,
    [
      card(
        b('Resetting, testing & sealing agreement', 'Repartir à zéro, tester et conclure'),
        b(
          'Strong negotiators know how to wipe away past friction (**faire table rase**), test an idea gently before committing (**lancer un ballon d’essai**), and close on a shared win.\nReset & testing: **faire table rase, lancer un ballon d’essai**.\nConsensus & progress: **trouver un terrain d’entente, faire d’une pierre deux coups, tenir le bon bout**.',
          'Les bons négociateurs savent effacer les blocages passés (**faire table rase**), sonder les réactions avant de s’engager (**lancer un ballon d’essai**) et conclure sur un gain partagé.\nRelance et sondage : **faire table rase, lancer un ballon d’essai**.\nAccord et efficacité : **trouver un terrain d’entente, faire d’une pierre deux coups, tenir le bon bout**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Stage', 'Moment'), b('Meaning', 'Sens')],
            rows: [
              ['faire table rase', b('Fresh start', 'Nouveau départ'), b('to start with a clean slate', 'effacer le passé pour repartir à neuf')],
              ['trouver un terrain d’entente', b('Negotiation', 'Négociation'), b('to find common ground', 'parvenir à un accord acceptable pour tous')],
              ['lancer un ballon d’essai', b('Testing reactions', 'Sondage'), b('to float a trial balloon', 'tester une proposition pour voir les réactions')],
              ['faire d’une pierre deux coups', b('Efficiency', 'Efficacité'), b('to kill two birds with one stone', 'obtenir deux résultats par une seule action')],
              ['tenir le bon bout', b('Breakthrough', 'Percée'), b('to be on the right track / close to success', 'être en bonne voie pour réussir')],
            ],
          },
          ex: [
            ['Faisons table rase des tensions passées et repartons sur de nouvelles bases.', 'Let’s wipe the slate clean on past tensions and start on a fresh footing.'],
            ['En proposant la semaine pilote, la direction a surtout lancé un ballon d’essai.', 'By proposing the pilot week, management mainly floated a trial balloon.'],
            ['Avec cette signature de principe, on sent enfin qu’on tient le bon bout.', 'With this agreement in principle, we finally feel we’re getting close to success.'],
          ],
        },
      ),
      culture(
        b('Strategic tact in French negotiations', 'Le tact stratégique dans la négociation française'),
        b(
          'In French business culture, direct confrontation is often balanced by **trouver un terrain d’entente** (finding honourable common ground) and **lancer un ballon d’essai** (testing an idea informally in pre-meetings so nobody loses face publicly). Pair **faire table rase** with concrete next steps—without action points, a "clean slate" sounds vague.',
          'Dans la culture professionnelle francophone, la franchise s’équilibre souvent par la recherche d’un **terrain d’entente** et par un **ballon d’essai** discret en amont pour préserver la face de chacun. Associez toujours **faire table rase** à des engagements concrets.',
        ),
      ),
      mc(
        P.best,
        [
          'En regroupant les deux déplacements à Lyon mardi, on fait d’une pierre deux coups : on forme l’équipe et on signe le contrat.',
          'En regroupant les deux déplacements à Lyon mardi, on tire la sonnette d’alarme sur le train.',
          'En regroupant les deux déplacements à Lyon mardi, on fait table rase des clients.',
          'En regroupant les deux déplacements à Lyon mardi, on lance un ballon d’essai dans le Rhône.',
        ],
        {
          fr: 'Vous combinez deux visites professionnelles dans la même ville pour gagner du temps et du budget :',
          explain: b('Faire d’une pierre deux coups means achieving two goals through a single action.', 'Faire d’une pierre deux coups signifie atteindre deux objectifs avec une seule démarche.'),
        },
      ),
      pairs(
        P.match,
        [
          ['faire table rase', b('to wipe the slate clean', 'repartir sur des bases nouvelles')],
          ['trouver un terrain d’entente', b('to find common ground', 'parvenir à un accord mutuel')],
          ['lancer un ballon d’essai', b('to float a trial balloon / test reactions', 'proposer une piste pour observer les réactions')],
          ['faire d’une pierre deux coups', b('to achieve two goals at once', 'atteindre deux objectifs d’une seule action')],
          ['tenir le bon bout', b('to be on the home stretch / right track', 'être proche de la réussite')],
        ],
      ),
      hear(
        'Le syndicat et la direction bloquaient depuis deux semaines sur le télétravail, mais quand on a lancé un ballon d’essai sur trois jours hybrides par mois au choix, les deux camps ont trouvé un terrain d’entente.',
        b('What broke the negotiation deadlock?', 'Qu’est-ce qui a permis de débloquer la négociation ?'),
        [
          b('Floating a flexible hybrid-day trial proposal led both sides to common ground.', 'Tester une piste souple de jours hybrides a mené les deux camps à un accord.'),
          b('Management wiped out all remote-work rights completely.', 'La direction a supprimé tout droit au télétravail.'),
          b('The union walked out for two more weeks without replying.', 'Le syndicat a suspendu les discussions deux semaines de plus.'),
          b('Both sides agreed to meet twice in the same city to save travel.', 'Les deux camps ont regroupé deux déplacements dans la même ville.'),
        ],
        { voice: 'm2' },
      ),
      dlg(
        b('Resetting a stalled supplier partnership', 'Relancer un partenariat bloqué'),
        b('Inès and Thomas review a strained supplier contract and decide how to close the deal.', 'Inès et Thomas font le point sur un contrat fournisseur tendu et préparent l’accord final.'),
        [['Inès', 'f'], ['Thomas', 'm']],
        [
          [0, 'Les échanges du mois dernier ont été tendus, mais ce fournisseur reste le plus fiable techniquement.', 'Last month’s talks were tense, yet this supplier remains technically the most reliable.'],
          [1, {
            options: [
              'Alors faisons table rase des reproches passés et cherchons plutôt un terrain d’entente sur les délais.',
              'Alors mettons les points sur les ballons et tirons la sonnette sur les prix.',
              'Alors jouons avec le feu et annulons la livraison demain.',
            ],
            explain: b('Faire table rase + trouver un terrain d’entente shifts the talk constructively from past blame to mutual agreement.', 'Faire table rase et chercher un terrain d’entente réorientent la négociation vers un accord constructif.'),
          }],
          [0, 'Bonne approche. Je lui ai déjà glissé une piste d’échéancier en deux tranches hier pour voir sa réaction.', 'Good approach. I already floated a two-stage schedule idea to him yesterday to gauge his reaction.'],
          [1, {
            options: [
              'Malin d’avoir lancé ce ballon d’essai ! S’il accepte aussi l’audit annuel en même temps, on fait d’une pierre deux coups.',
              'Dommage, tu as jeté de l’huile sur le feu en le prévenant.',
              'C’est inutile, personne ne tient le créneau dans cette affaire.',
            ],
          }],
          [0, 'Il vient justement de valider le principe par écrit : franchement, cette fois, on tient le bon bout !', 'He just confirmed the principle in writing: honestly, this time we’re on the right track!'],
        ],
      ),
      dict('En trouvant un terrain d’entente, nous faisons table rase du passé et tenons le bon bout.', {
        voice: 'f2',
        hint: b('Watch plural verb forms with nous: faisons and tenons.', 'Vérifiez les terminaisons avec nous : faisons et tenons.'),
      }),
      write(
        b('Post-negotiation recap email', 'Courriel de bilan après négociation'),
        b('Write 60–110 words for a manager summarising how a tricky workplace negotiation moved from tension to agreement: mention the initial deadlock, one clarifying step or warning, and the final compromise using at least three idioms from this course.', 'Rédigez 60 à 110 mots adressés à un responsable pour résumer comment une négociation tendue a abouti à un accord : mentionnez le blocage initial, une mise au point ou alerte, puis le compromis final avec au moins trois expressions du cours.'),
        60,
        110,
        [
          b('Professional email tone appropriate for a B2 workplace', 'Ton professionnel adapté à un contexte de travail B2'),
          b('At least three idioms from this course used smoothly', 'Au moins trois expressions du cours intégrées avec naturel'),
          b('Clear arc from deadlock to agreement', 'Progression claire du blocage jusqu’à l’accord'),
        ],
        'Bonjour Sophie, suite à notre réunion de ce matin, nous avons d’abord dû remettre les pendules à l’heure sur les retards de livraison avec notre partenaire. En jouant cartes sur table sur nos contraintes budgétaires, chacun a compris l’urgence. Nous avons ensuite lancé un ballon d’essai autour d’un calendrier en deux étapes, ce qui a permis de faire table rase des tensions et de trouver un terrain d’entente solide. L’équipe reste sur la brèche pour la mise en route dès lundi : nous tenons enfin le bon bout.',
        {
          phrases: ['remettre les pendules à l’heure', 'jouer cartes sur table', 'faire table rase', 'trouver un terrain d’entente'],
        },
      ),
    ],
    [
      b('faire table rase = wipe the slate clean; trouver un terrain d’entente = find common ground.', 'faire table rase = repartir à zéro ; trouver un terrain d’entente = parvenir à un accord.'),
      b('lancer un ballon d’essai = float a trial balloon to test reactions.', 'lancer un ballon d’essai = tester une proposition avant de s’engager.'),
      b('faire d’une pierre deux coups = achieve two goals at once; tenir le bon bout = be close to success.', 'faire d’une pierre deux coups = réussir deux objectifs ensemble ; tenir le bon bout = être en bonne voie.'),
    ],
    [
      ['faire table rase', b('to start with a clean slate', 'effacer le passé pour repartir à neuf')],
      ['trouver un terrain d’entente', b('to find common ground', 'parvenir à un accord acceptable pour tous')],
      ['lancer un ballon d’essai', b('to float a trial balloon', 'tester une idée pour observer les réactions')],
      ['faire d’une pierre deux coups', b('to kill two birds with one stone', 'atteindre deux objectifs par une seule action')],
      ['tenir le bon bout', b('to be on the right track / nearly there', 'être en bonne voie pour réussir')],
    ],
  ),
];

export default lessons;
