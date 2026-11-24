import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Decode everyday spoken French with confidence: express tiredness, frustration, enthusiasm and urgency naturally with friends, understand street idioms in films and podcasts, and master the register boundary so informal phrases never slip into DELF or TCF formal tasks.',
    'Décodez le français parlé du quotidien avec aisance : exprimez fatigue, frustration, enthousiasme et urgence entre amis, comprenez les expressions vivantes des séries ou balados et maîtrisez la frontière des registres pour éviter tout familier dans vos épreuves DELF ou TCF.',
  ),
  outcomes: [
    b('Use high-frequency spoken idioms for mood, energy, haste and setbacks', 'Employer les expressions familières d’humeur, d’énergie, de hâte et d’imprévus'),
    b('Keep informal slang strictly out of DELF, DALF and TCF formal tasks', 'Séparer nettement le registre familier des écrits et oraux formels (DELF/TCF)'),
    b('Respond naturally in lively everyday conversations with friends', 'Réagir avec naturel dans des échanges spontanés entre proches'),
  ],
};

const C = 'exp-colloquial-spoken';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['mood-and-energy', 'humeur-et-energie'],
    b('Mood, Energy & Strong Reactions', 'Humeur, énergie et réactions vives'),
    b('Understand and use five core colloquial expressions for laziness, annoyance, enthusiasm, energy and exhaustion.', 'Comprendre et employer cinq expressions familières clés pour la paresse, la contrariété, l’enthousiasme, la forme et l’épuisement.'),
    [
      b('Express low or high energy informally (avoir la flemme, avoir la patate, être KO)', 'Exprimer manque ou plein d’énergie à l’oral (avoir la flemme, avoir la patate, être KO)'),
      b('React to disappointment or enthusiasm (avoir le seum, kiffer quelque chose)', 'Exprimer déception ou enthousiasme (avoir le seum, kiffer quelque chose)'),
      b('Match spoken idioms to standard French equivalents', 'Relier les expressions familières à leur équivalent courant'),
    ],
    13,
    [
      card(
        b('Mood & energy in spoken French', 'Humeur et énergie en français parlé'),
        b(
          'In casual speech among friends, standard phrases like *je n’ai pas envie* or *je suis fatigué* often give way to vivid, punchy idioms. You will hear them constantly in cafés, voice notes, films and podcasts.\nLow energy or annoyance: **avoir la flemme, avoir le seum, être KO**.\nHigh energy or enthusiasm: **avoir la patate, kiffer quelque chose**.',
          'À l’oral entre amis, des formules neutres comme *je n’ai pas envie* ou *je suis fatigué* laissent souvent place à des expressions vives et imagées, omniprésentes au café, dans les messages vocaux, les séries et les balados.\nBaisse d’énergie ou dépit : **avoir la flemme, avoir le seum, être KO**.\nÉlan ou plaisir : **avoir la patate, kiffer quelque chose**.',
        ),
        {
          table: {
            head: [b('Colloquial idiom', 'Expression familière'), b('Standard French', 'Français courant'), b('Meaning', 'Sens')],
            rows: [
              ['avoir la flemme', 'ne pas avoir envie / être paresseux', b('can’t be bothered / feel lazy', 'manquer de motivation')],
              ['avoir le seum', 'être très déçu / contrarié', b('to be gutted / annoyed', 'éprouver du dépit ou de la rage')],
              ['kiffer quelque chose', 'adorer / beaucoup aimer', b('to really love / dig something', 'apprécier énormément')],
              ['avoir la patate', 'être en pleine forme', b('to feel full of energy', 'avoir beaucoup d’entrain')],
              ['être KO', 'être épuisé / exténué', b('to be completely wiped out', 'n’avoir plus aucune force')],
            ],
          },
          ex: [
            ['Il pleut encore : j’ai trop la flemme de sortir ce soir.', 'It’s raining again: I really can’t be bothered going out tonight.'],
            ['J’ai raté le dernier métro à dix secondes près, j’ai le seum !', 'I missed the last metro by ten seconds, I’m gutted!'],
            ['Après deux cafés et une bonne nuit, j’ai vraiment la patate aujourd’hui.', 'After two coffees and a good night’s sleep, I’m full of energy today.'],
          ],
        },
      ),
      tip(
        b('Pronunciation & origin clues', 'Repères de prononciation et d’origine'),
        b(
          '**Kiffer** (from Arabic *kif*, pleasure) behaves like a regular *-er* verb (*je kiffe, on a kiffé*). **Le seum** (from Arabic *sem*, venom/bitterness) is masculine: *j’ai le seum*. **KO** comes from boxing (*knock-out*) and is pronounced *ka-o*; it stays invariable: *ils sont KO*.',
          '**Kiffer** (emprunté à l’arabe *kif*) se conjugue comme un verbe régulier en *-er* (*je kiffe, on a kiffé*). **Le seum** est masculin : *j’ai le seum*. **KO** (de *knock-out*) se prononce *ka-o* et reste invariable : *elles sont KO*.',
        ),
      ),
      flash(
        b('Five mood & energy idioms', 'Cinq expressions d’humeur et d’énergie'),
        [
          ['avoir la flemme', b('to feel lazy / can’t be bothered', 'manquer de motivation, ne pas avoir envie')],
          ['avoir le seum', b('to be gutted / bitter / annoyed', 'être très déçu ou frustré')],
          ['kiffer quelque chose', b('to really love / enjoy something', 'adorer ou beaucoup apprécier quelque chose')],
          ['avoir la patate', b('to be full of energy', 'être en pleine forme, avoir du tonus')],
          ['être KO', b('to be wiped out / exhausted', 'être complètement épuisé')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('He is bitterly disappointed and frustrated about missing the concert.', 'Il est très déçu et frustré d’avoir raté le concert.'),
          b('He feels completely rested after a long nap.', 'Il se sent très reposé après une longue sieste.'),
          b('He loved every song the band played.', 'Il a adoré chaque chanson du groupe.'),
          b('He is refusing to help with the dishes.', 'Il refuse d’aider à faire la vaisselle.'),
        ],
        {
          fr: '« Le concert était complet au guichet juste devant moi… J’ai trop le seum ! »',
          explain: b('Avoir le seum expresses sharp disappointment, frustration or feeling gutted.', 'Avoir le seum traduit une forte déception ou un sentiment de frustration.'),
        },
      ),
      mc(
        P.best,
        [
          'Après ce déménagement sous la pluie, je suis complètement KO.',
          'Après ce déménagement sous la pluie, j’ai vraiment la patate pour courir un marathon.',
          'Après ce déménagement sous la pluie, je kiffe tellement porter des cartons.',
          'Après ce déménagement sous la pluie, j’ai le seum d’avoir trouvé un canapé.',
        ],
        {
          fr: 'Vous rentrez chez vous après dix heures de travail physique et vous tombez sur le canapé :',
          explain: b('Être KO means to be utterly exhausted after intense effort.', 'Être KO signifie être totalement épuisé après un gros effort.'),
        },
      ),
      pairs(
        P.match,
        [
          ['avoir la flemme', b('can’t be bothered / feel lazy', 'manquer d’envie ou de motivation')],
          ['avoir le seum', b('to be gutted / frustrated', 'être dégoûté ou très contrarié')],
          ['kiffer quelque chose', b('to really love something', 'adorer quelque chose')],
          ['avoir la patate', b('to be bursting with energy', 'avoir beaucoup d’énergie')],
          ['être KO', b('to be knocked out / exhausted', 'être totalement vidé de son énergie')],
        ],
      ),
      gap(
        P.complete,
        'Ce matin j’ai vraiment ___ pour tout finir tôt, mais après trois heures de réunion ___ déjà de cuisiner ce soir.',
        [['la patate'], ['j’ai la flemme']],
        {
          choices: [
            ['la patate', 'le seum', 'KO'],
            ['j’ai la flemme', 'j’ai la patate', 'je kiffe'],
          ],
          explain: b('First high energy (avoir la patate), then zero motivation to cook (avoir la flemme).', 'D’abord plein d’énergie (avoir la patate), puis manque d’envie de cuisiner (avoir la flemme).'),
        },
      ),
      hear(
        'Franchement, j’ai trop kiffé ce festival, même si à la fin de la troisième soirée tout le monde était complètement KO.',
        b('How does the speaker sum up the festival?', 'Comment la personne résume-t-elle le festival ?'),
        [
          b('She loved it, even though everyone ended up exhausted.', 'Elle l’a adoré, même si tout le monde a fini épuisé.'),
          b('She was disappointed because the bands were late.', 'Elle a été déçue car les groupes étaient en retard.'),
          b('She felt too lazy to attend any of the three evenings.', 'Elle a manqué de motivation pour aller aux concerts.'),
          b('She still had plenty of energy on the third night.', 'Elle avait encore énormément d’énergie le troisième soir.'),
        ],
      ),
      dict('J’ai la flemme de cuisiner ce soir, mais j’ai vraiment kiffé ton film.', {
        hint: b('Notice colloquial kiffer conjugated in the passé composé with avoir.', 'Observez le verbe kiffer conjugué au passé composé avec avoir.'),
      }),
      say(
        'Après une bonne nuit, j’ai la patate ce matin, même si hier soir j’étais KO.',
        'After a good night’s sleep, I’m full of energy this morning, even though last night I was wiped out.',
      ),
    ],
    [
      b('avoir la flemme = can’t be bothered; avoir la patate = full of energy.', 'avoir la flemme = ne pas avoir envie ; avoir la patate = être en pleine forme.'),
      b('avoir le seum = gutted/frustrated; être KO = completely exhausted.', 'avoir le seum = être contrarié/déçu ; être KO = être épuisé.'),
      b('kiffer quelque chose = to really love something (informal spoken French).', 'kiffer quelque chose = adorer quelque chose (registre familier).'),
    ],
    [
      ['avoir la flemme', b('to feel lazy / can’t be bothered', 'manquer de motivation, ne pas avoir envie')],
      ['avoir le seum', b('to be gutted / annoyed', 'être très déçu ou frustré')],
      ['kiffer quelque chose', b('to really love something', 'adorer ou beaucoup apprécier quelque chose')],
      ['avoir la patate', b('to be full of energy', 'être en pleine forme, avoir du tonus')],
      ['être KO', b('to be wiped out / exhausted', 'être complètement épuisé')],
    ],
  ),

  lesson(
    C,
    2,
    ['lateness-caution-and-haste', 'retard-prudence-et-hate'],
    b('Lateness, Caution & Haste', 'Retard, prudence et précipitation'),
    b('Talk informally about running late, being careful, hurrying up and giving up—and master strict register boundaries.', 'Parler de retard, de prudence, d’empressement et d’abandon à l’oral, tout en respectant les limites de registre.'),
    [
      b('Use five everyday idioms for time pressure and caution', 'Employer cinq expressions familières de retard, prudence et abandon'),
      b('Keep colloquial expressions out of DELF, DALF and TCF formal tasks', 'Proscrire le registre familier des copies et oraux formels DELF/TCF'),
      b('Pair informal phrases with their standard equivalents', 'Associer chaque tournure familière à son équivalent standard'),
    ],
    13,
    [
      card(
        b('When time presses or plans collapse', 'Sous la pression ou face à l’imprévu'),
        b(
          'Everyday French has crisp idioms for rushing, warning a friend, or calling off a plan. Pair each informal phrase with its standard counterpart so you can switch registers effortlessly.\nHaste & lateness: **être à la bourre, se dépêcher / mettre les gaz**.\nCaution & giving up: **faire gaffe, laisser tomber, tomber à l’eau**.',
          'Le français courant regorge de formules brèves pour presser quelqu’un, avertir un ami ou renoncer à un projet. Associez toujours la tournure familière à son équivalent standard pour changer de registre sans effort.\nRetard et hâte : **être à la bourre, se dépêcher / mettre les gaz**.\nPrudence et abandon : **faire gaffe, laisser tomber, tomber à l’eau**.',
        ),
        {
          table: {
            head: [b('Colloquial idiom', 'Expression familière'), b('Standard French', 'Français standard'), b('Meaning', 'Sens')],
            rows: [
              ['être à la bourre', 'être en retard', b('to be running late', 'arriver après l’heure')],
              ['faire gaffe', 'faire attention / être prudent', b('to watch out / be careful', 'rester vigilant')],
              ['mettre les gaz', 'se dépêcher / accélérer', b('to step on it / hurry up', 'aller plus vite')],
              ['laisser tomber', 'renoncer / abandonner', b('to drop it / give up', 'arrêter un projet ou une dispute')],
              ['tomber à l’eau', 'être annulé / échouer', b('to fall through (a plan)', 'ne pas se réaliser')],
            ],
          },
          ex: [
            ['Mets les gaz, on est déjà à la bourre pour le train de huit heures !', 'Step on it, we’re already running late for the eight o’clock train!'],
            ['Fais gaffe aux marches verglacées devant la porte.', 'Watch out for the icy steps in front of the door.'],
            ['Avec la grève des transports, notre week-end à Lyon est tombé à l’eau.', 'With the transit strike, our weekend in Lyon fell through.'],
          ],
        },
      ),
      trap(
        b('Friends only — NEVER in DELF/TCF formal tasks!', 'Entre amis oui — JAMAIS en DELF/TCF formel !'),
        b(
          'Knowing **être à la bourre, avoir le seum, faire gaffe** or **mettre les gaz** is vital to understand real life and audio recordings. However, **never** write or say them in DELF B2/DALF C1 argumentative essays, formal letters (*lettre au maire*), or TCF formal interviews—examiners penalise register mismatches! In exams, always switch to **être en retard, se dépêcher, faire preuve de prudence, renoncer** or **échouer**.',
          'Connaître **être à la bourre, avoir le seum, faire gaffe** ou **mettre les gaz** est indispensable pour comprendre la vraie conversation et les audios. En revanche, **ne les employez jamais** dans un essai DELF B2/DALF C1, une lettre formelle au maire ou une tâche formelle du TCF : les jurys sanctionnent les fautes de registre ! À l’examen, dites **être en retard, se dépêcher, rester vigilant, renoncer** ou **échouer**.',
        ),
      ),
      flash(
        b('Five lateness, caution & haste idioms', 'Cinq expressions de retard, prudence et abandon'),
        [
          ['être à la bourre', b('to be running late', 'être en retard')],
          ['faire gaffe', b('to watch out / be careful', 'faire attention, prendre garde')],
          ['mettre les gaz', b('to step on it / hurry up', 'se dépêcher, accélérer le rythme')],
          ['laisser tomber', b('to drop it / give up', 'abandonner, ne pas insister')],
          ['tomber à l’eau', b('to fall through (plan)', 'échouer, être annulé')],
        ],
      ),
      mc(
        P.best,
        [
          'Je vous prie de bien vouloir excuser ce léger contretemps ; je m’efforce de vous rejoindre au plus vite.',
          'Désolé, je suis grave à la bourre, je mets les gaz !',
          'Faites gaffe, j’ai la flemme de courir, donc ça tombe à l’eau.',
          'Laisse tomber pour l’heure, j’ai trop le seum.',
        ],
        {
          fr: 'Vous écrivez un courriel formel à un jury d’admission pour prévenir d’un retard de train (TCF/DELF) :',
          explain: b('Formal exam and professional contexts require standard/formal phrasing; never use être à la bourre or mettre les gaz there.', 'Un contexte formel exige un registre courant ou soutenu : bannissez être à la bourre et mettre les gaz.'),
        },
      ),
      mc(
        P.meaning,
        [
          b('Our camping trip was cancelled at the last minute.', 'Notre séjour en camping a été annulé à la dernière minute.'),
          b('Everyone fell into the river during the hike.', 'Tout le monde est tombé dans la rivière pendant la randonnée.'),
          b('They hurried up and arrived ahead of schedule.', 'Ils se sont dépêchés et sont arrivés en avance.'),
          b('They forgot to bring raincoats.', 'Ils ont oublié d’emporter leurs imperméables.'),
        ],
        {
          fr: '« Avec cet orage violent, tout notre programme de camping est tombé à l’eau. »',
          explain: b('Tomber à l’eau means a plan falls through or fails to happen.', 'Tomber à l’eau signifie qu’un projet échoue ou doit être annulé.'),
        },
      ),
      sort(
        b('Sort each sentence by appropriate register.', 'Classez chaque phrase selon le registre adapté.'),
        [b('Texting close friends', 'Message à des amis proches'), b('DELF B2 essay / TCF formal task', 'Essai DELF B2 / tâche formelle TCF')],
        [
          ['Mets les gaz, on est à la bourre !', 0],
          ['Ce projet risque d’échouer faute de financement.', 1],
          ['Laisse tomber, ça ne vaut pas le coup.', 0],
          ['Il convient de faire preuve de prudence.', 1],
          ['Fais gaffe, le trottoir glisse !', 0],
          ['Leur initiative a malheureusement été annulée.', 1],
        ],
      ),
      gap(
        P.complete,
        'Désolé, je suis vraiment à la ___, mais fais ___ dans les escaliers : la marche du bas est mouillée.',
        ['bourre', 'gaffe'],
        {
          tr: 'Sorry, I’m really running late, but watch out on the stairs: the bottom step is wet.',
          hint: b('Two single colloquial nouns: être à la ___ / faire ___.', 'Deux noms familiers d’un mot : être à la ___ / faire ___.'),
        },
      ),
      ord(
        P.order,
        'Avec cette panne de train, notre sortie au bord du lac est tombée à l’eau.',
        {
          tr: 'With this train breakdown, our outing by the lake fell through.',
          extra: ['tombé', 'feu'],
          explain: b('Tomber à l’eau agrees with feminine subject notre sortie (est tombée à l’eau).', 'Le participe tombée s’accorde avec le sujet féminin notre sortie.'),
        },
      ),
      hear(
        'Écoute, laisse tomber cette vieille querelle : on est déjà assez à la bourre pour le concert, alors mets les gaz !',
        b('What does the speaker advise his friend to do?', 'Que conseille le locuteur à son ami ?'),
        [
          b('Forget the argument and hurry up because they are late.', 'Oublier la dispute et se dépêcher car ils sont en retard.'),
          b('Call the concert hall to cancel their tickets.', 'Appeler la salle de concert pour annuler les billets.'),
          b('Slow down and explain the quarrel carefully.', 'Ralentir pour expliquer la dispute en détail.'),
          b('Stay home because the concert fell through.', 'Rester chez soi car le concert est annulé.'),
        ],
        { voice: 'm' },
      ),
      say(
        'Fais gaffe en descendant les marches, et mets les gaz si on ne veut pas rater le bus !',
        'Watch out going down the steps, and step on it if we don’t want to miss the bus!',
      ),
    ],
    [
      b('être à la bourre = running late; mettre les gaz = step on it / hurry up.', 'être à la bourre = être en retard ; mettre les gaz = se dépêcher.'),
      b('faire gaffe = watch out; laisser tomber = drop it; tomber à l’eau = fall through.', 'faire gaffe = faire attention ; laisser tomber = renoncer ; tomber à l’eau = être annulé.'),
      b('Reserve all colloquial idioms for friends and informal speech—never DELF/TCF formal writing.', 'Réservez ces expressions aux échanges familiers, jamais aux productions formelles DELF/TCF.'),
    ],
    [
      ['être à la bourre', b('to be running late', 'être en retard')],
      ['faire gaffe', b('to watch out / be careful', 'faire attention, rester prudent')],
      ['mettre les gaz', b('to step on it / hurry up', 'se dépêcher, accélérer vivement')],
      ['laisser tomber', b('to drop it / give up', 'abandonner, renoncer à quelque chose')],
      ['tomber à l’eau', b('to fall through (a plan)', 'échouer, être annulé')],
    ],
  ),

  lesson(
    C,
    3,
    ['register-control-and-spoken-nuance', 'maitrise-du-registre-et-nuances-orales'],
    b('Register Control & Spoken Nuance', 'Maîtrise du registre et nuances orales'),
    b('Decode modern approval, criticism, overthinking, spilling secrets and astonishment—and transpose cleanly into formal French.', 'Décoder approbation, critique, prise de tête, indiscrétion et stupéfaction, et savoir transposer en registre soutenu.'),
    [
      b('Understand five vivid spoken idioms (c’est carré, ça craint, se prendre la tête, tout balancer, être scotché)', 'Maîtriser cinq expressions orales courantes (c’est carré, ça craint, se prendre la tête, tout balancer, être scotché)'),
      b('Navigate generational slang versus neutral French in dialogue', 'Adapter son ton selon l’interlocuteur dans un dialogue'),
      b('Switch between casual spoken style and formal prose in writing', 'Passer consciemment du style familier à un résumé formel à l’écrit'),
    ],
    13,
    [
      card(
        b('Modern spoken nuance & register shifts', 'Nuances de l’oral contemporain'),
        b(
          'Spoken French keeps evolving. Expressions like **c’est carré** (sorted/spot-on) or **ça craint** (that sucks) appear constantly in peer conversations, while **balancer** or **vendre** (*il a tout balancé / il m’a vendu*) express betraying a secret. Always keep their standard equivalents ready.\nApproval & surprise: **c’est carré, être scotché**.\nFriction & indiscretion: **ça craint, se prendre la tête, tout balancer**.',
          'Le français parlé évolue vite. Des tournures comme **c’est carré** (bien ficelé) ou **ça craint** (c’est gênant/mauvais) rythment les conversations entre pairs, tandis que **balancer** ou **vendre** (*il a tout balancé / il m’a vendu*) expriment l’indiscrétion ou la délation. Gardez toujours l’équivalent courant en tête.\nAccord et stupeur : **c’est carré, être scotché**.\nTension et indiscrétion : **ça craint, se prendre la tête, tout balancer**.',
        ),
        {
          table: {
            head: [b('Colloquial idiom', 'Expression familière'), b('Standard / Formal', 'Courant / Soutenu'), b('Meaning', 'Sens')],
            rows: [
              ['c’est carré', 'c’est clair / bien organisé', b('it’s solid / sorted / spot-on', 'tout est réglé avec précision')],
              ['ça craint', 'c’est regrettable / inquiétant', b('that sucks / that’s bad news', 'c’est pénible ou préoccupant')],
              ['se prendre la tête', 'se compliquer la vie / se disputer', b('to overthink / argue', 's’énerver ou se tracasser')],
              ['tout balancer', 'tout révéler / vendre la mèche', b('to spill everything / snitch', 'trahir un secret, tout dévoiler')],
              ['être scotché', 'être stupéfait / sidéré', b('to be stunned / blown away', 'rester bouche bée de surprise')],
            ],
          },
          ex: [
            ['Tout le dossier est prêt pour demain matin : c’est carré !', 'The whole file is ready for tomorrow morning: it’s sorted!'],
            ['Arrête de te prendre la tête pour ce détail, on règle ça demain.', 'Stop stressing over this detail, we’ll sort it out tomorrow.'],
            ['Quand elle a annoncé sa démission en direct, je suis resté scotché.', 'When she announced her resignation live, I was stunned.'],
          ],
        },
      ),
      culture(
        b('How spoken French ages and travels', 'Comment l’oral évolue selon les générations'),
        b(
          'Every decade adds a layer to informal French: **se prendre la tête** and **ça craint** have been common since the 1980s–90s across France, whereas **c’est carré** and **avoir le seum** became widespread in younger urban speech and social media. Being able to *recognise* both passively while shifting to neutral French in professional or exam settings is true B2 control.',
          'Chaque génération enrichit le français familier : **se prendre la tête** et **ça craint** circulent depuis les années 1980-1990, tandis que **c’est carré** ou **avoir le seum** se sont diffusés plus récemment via les jeunes locuteurs et les réseaux. Savoir les *comprendre* tout en revenant au registre courant à l’écrit montre une vraie maîtrise B2.',
        ),
      ),
      mc(
        P.best,
        [
          'Ne t’inquiète pas, j’ai vérifié tous les billets et les horaires : c’est carré.',
          'Ne t’inquiète pas, j’ai vérifié tous les billets : ça craint totalement.',
          'Ne t’inquiète pas, j’ai tout balancé sur nos horaires.',
          'Ne t’inquiète pas, on va se prendre la tête sur chaque billet.',
        ],
        {
          fr: 'Vous rassurez un ami que l’organisation du voyage est parfaitement réglée :',
          explain: b('C’est carré means everything is well-organised, clean and reliable.', 'C’est carré indique que tout est bien préparé et fiable.'),
        },
      ),
      pairs(
        P.match,
        [
          ['c’est carré', b('it’s sorted / solid', 'c’est bien organisé, fiable')],
          ['ça craint', b('that sucks / is worrying', 'c’est pénible ou inquiétant')],
          ['se prendre la tête', b('to stress / argue / overthink', 'se compliquer la vie ou se disputer')],
          ['tout balancer', b('to spill everything / rat out', 'révéler un secret, dénoncer')],
          ['être scotché', b('to be stunned / amazed', 'être stupéfait, sans voix')],
        ],
      ),
      hear(
        'Personne n’était au courant de la surprise, mais Théo a tout balancé par erreur dans le groupe, donc forcément, on est restés scotchés.',
        b('Why was everyone stunned?', 'Pourquoi tout le monde est-il resté stupéfait ?'),
        [
          b('Théo accidentally revealed the secret in the group chat.', 'Théo a révélé le secret par mégarde dans le groupe.'),
          b('Théo refused to organise anything for the party.', 'Théo a refusé d’organiser la moindre fête.'),
          b('Everyone argued for hours about the venue.', 'Tout le monde s’est disputé des heures pour le lieu.'),
          b('The party went brilliantly without any hiccups.', 'La soirée s’est déroulée sans aucun incident.'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Two colleagues on lunch break', 'Deux collègues à la pause déjeuner'),
        b('Camille and Hugo chat informally outside the office—then prepare a proper reply to their manager.', 'Camille et Hugo discutent librement devant le bureau avant de répondre poliment à leur cheffe.'),
        [['Camille', 'f'], ['Hugo', 'm']],
        [
          [0, 'Tu as vu le mail de la direction ? Ils veulent avancer le lancement à lundi matin !', 'Did you see management’s email? They want to move the launch up to Monday morning!'],
          [1, {
            options: [
              'Sérieux ? Ça craint un peu, on n’a même pas testé la dernière version… Je suis scotché.',
              'Oui, c’est carré, j’ai la flemme de toute façon.',
              'Excellent, j’ai la patate pour tout balancer.',
            ],
            explain: b('Ça craint + être scotché expresses shock and concern naturally between close peers.', 'Ça craint et être scotché traduisent naturellement stupeur et inquiétude entre collègues proches.'),
          }],
          [0, 'Attends, ne te prends pas la tête tout de suite : on a déjà fait le plus dur hier.', 'Wait, don’t stress right away: we already did the hardest part yesterday.'],
          [1, {
            options: [
              'T’as raison. On règle le dernier test cet après-midi pour que tout soit carré, puis j’envoie un mail poli à Sophie.',
              'Non, je vais lui répondre que son idée craint et que je suis KO.',
              'On laisse tomber et on lui écrit qu’on est à la bourre.',
            ],
          }],
          [0, 'Parfait ! Surtout, garde un ton pro dans ton courriel pour ne pas la braquer.', 'Perfect! Above all, keep a professional tone in your email so you don’t put her off.'],
        ],
      ),
      dict('Ne te prends pas la tête : tout est prêt, c’est carré, même si cette annonce craint un peu.', {
        voice: 'm2',
        hint: b('Watch informal negation omission or standard ne … pas: here ne te prends pas la tête.', 'Attention à la forme négative : ne te prends pas la tête.'),
      }),
      write(
        b('Casual message + formal shift', 'Message familier + version formelle'),
        b('Write 60–110 words in two short parts: (1) a casual message to a friend describing a sudden change of plans using 3 colloquial idioms from this course, and (2) a two-sentence formal version addressed to a teacher or supervisor with zero slang.', 'Rédigez 60 à 110 mots en deux volets : (1) un message familier à un ami sur un imprévu avec 3 expressions du cours, puis (2) deux phrases formelles adressées à un professeur ou responsable sans aucun terme familier.'),
        60,
        110,
        [
          b('Three course idioms used naturally in the friend message', 'Trois expressions du cours employées avec naturel entre amis'),
          b('Clear register shift in the second part', 'Changement net de registre dans la seconde partie'),
          b('Zero colloquial expressions in the formal note', 'Aucune expression familière dans la note formelle'),
        ],
        'Salut Nadia ! Tu ne devineras jamais : notre conférence de demain vient de tomber à l’eau à cause d’une grève des transports. J’ai trop le seum parce que tout mon exposé était carré et j’avais vraiment la patate, mais bon, inutile de se prendre la tête ! Version formelle : Madame, en raison des perturbations annoncées sur le réseau ferroviaire, notre intervention prévue demain doit malheureusement être reportée. Je reste à votre entière disposition pour convenir rapidement d’une nouvelle date.',
        {
          phrases: ['J’ai trop le seum…', 'c’est carré', 'inutile de se prendre la tête', 'Je reste disponible pour…'],
        },
      ),
    ],
    [
      b('c’est carré = solid/sorted; ça craint = that sucks; être scotché = stunned.', 'c’est carré = bien réglé ; ça craint = c’est inquiétant/pénible ; être scotché = stupéfait.'),
      b('se prendre la tête = stress/argue; tout balancer / vendre = spill a secret or snitch.', 'se prendre la tête = s’énerver/se compliquer la vie ; tout balancer / vendre = tout révéler.'),
      b('True B2 fluency means switching smoothly from casual idioms to formal DELF/TCF prose.', 'La maîtrise B2 consiste à passer sans faute de l’oral familier au registre formel.'),
    ],
    [
      ['c’est carré', b('it’s solid / sorted / spot-on', 'c’est clair, fiable et bien préparé')],
      ['ça craint', b('that sucks / is dodgy', 'c’est pénible, mauvais ou inquiétant')],
      ['se prendre la tête', b('to overthink / stress out / argue', 'se compliquer la vie ou se disputer')],
      ['tout balancer', b('to spill everything / snitch', 'tout révéler, trahir un secret')],
      ['être scotché', b('to be blown away / stunned', 'être stupéfait, cloué sur place')],
    ],
  ),
];

export default lessons;
