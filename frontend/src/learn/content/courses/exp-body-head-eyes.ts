import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French speakers think, react, and express astonishment straight through the head, eyes, and mouth. This A2 course teaches 15 essential facial idioms—from garder la tête froide and sauter aux yeux to rester bouche bée and avoir un mot sur le bout de la langue—with clear contrast traps, listening drills, dialogues, and guided writing.',
    'Les francophones pensent, réagissent et expriment la surprise avec la tête, les yeux et la bouche. Ce cours A2 vous apprend 15 expressions incontournables du visage — de garder la tête froide et sauter aux yeux jusqu’à rester bouche bée et avoir un mot sur le bout de la langue — avec pièges commentés, écoutes, dialogues et écriture guidée.',
  ),
  outcomes: [
    b('Express calm, panic, stubbornness, and common sense with tête idioms', 'Exprimer le calme, la panique, l’entêtement et le bon sens avec la tête'),
    b('Talk about obvious facts, high prices, and disbelief with yeux idioms', 'Parler d’évidence, de prix élevés et d’étonnement avec les yeux'),
    b('React naturally to speech, memory slips, and tempting ideas with mouth and tongue idioms', 'Réagir avec naturel face à la parole, aux oublis et à l’envie avec la bouche et la langue'),
  ],
};

const C = 'exp-body-head-eyes';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['head-idioms', 'expressions-avec-la-tete'],
    b('Keeping a cool head', 'Garder la tête froide'),
    b('Describe composure, panic, frustration, stubbornness, and maturity with five expressions built around la tête.', 'Exprimer le calme, la panique, l’agacement, l’entêtement et le bon sens avec cinq expressions autour de la tête.'),
    [
      b('Contrast garder la tête froide with perdre la tête', 'Opposer garder la tête froide et perdre la tête'),
      b('Express frustration and stubbornness with en avoir par-dessus la tête and n’en faire qu’à sa tête', 'Exprimer l’exaspération et l’entêtement avec en avoir par-dessus la tête et n’en faire qu’à sa tête'),
      b('Praise someone’s good judgement with avoir la tête sur les épaules', 'Saluer la maturité de quelqu’un avec avoir la tête sur les épaules'),
    ],
    13,
    [
      card(
        b('Five ways to use la tête', 'Cinq façons d’employer la tête'),
        b(
          'In French, **la tête** stands for calm reasoning, patience, and self-control. Notice how opposite attitudes pair up naturally around the same word.\n\nCalm & judgement: **garder la tête froide, avoir la tête sur les épaules**.\nStress & stubbornness: **perdre la tête, en avoir par-dessus la tête, n’en faire qu’à sa tête**.',
          'En français, **la tête** symbolise la raison, la patience et la maîtrise de soi. Remarquez comment les attitudes opposées s’organisent autour du même mot.\n\nCalme et sagesse : **garder la tête froide, avoir la tête sur les épaules**.\nDébordement et entêtement : **perdre la tête, en avoir par-dessus la tête, n’en faire qu’à sa tête**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal picture', 'Image littérale'), b('Meaning', 'Sens réel')],
            rows: [
              ['garder la tête froide', b('to keep a cold head', 'garder la tête froide'), b('to stay calm and level-headed', 'rester calme et lucide')],
              ['perdre la tête', b('to lose one’s head', 'perdre la tête'), b('to lose one’s mind, panic', 'perdre son calme ou la raison')],
              ['en avoir par-dessus la tête', b('to have it over one’s head', 'en avoir au-dessus de la tête'), b('to be totally fed up', 'être excédé, débordé')],
              ['n’en faire qu’à sa tête', b('only do to one’s head', 'n’écouter que sa tête'), b('to do whatever one pleases', 'agir sans écouter les conseils')],
              ['avoir la tête sur les épaules', b('have head on shoulders', 'avoir la tête bien posée'), b('to be sensible, mature', 'être raisonnable et réfléchi')],
            ],
          },
          ex: [
            ['Même pendant les examens, Nadia garde toujours la tête froide.', 'Even during exams, Nadia always keeps a cool head.'],
            ['Mon frère n’en fait qu’à sa tête : il n’écoute jamais nos conseils.', 'My brother does whatever he wants: he never listens to our advice.'],
            ['À vingt ans, Clara a déjà la tête sur les épaules.', 'At twenty, Clara already has her head screwed on right.'],
          ],
        },
      ),
      tip(
        b('Watch the fixed pronoun « en »', 'Attention au pronom figé « en »'),
        b(
          'Two of these idioms carry a permanent **en** that never changes: **j’en ai par-dessus la tête** (*I’ve had it up to here*) and **il n’en fait qu’à sa tête** (*he only listens to himself*). Also remember that **sa tête** changes with the subject: **je n’en fais qu’à ma tête**, **tu n’en fais qu’à ta tête**.',
          'Deux de ces expressions gardent toujours le pronom **en** : **j’en ai par-dessus la tête** et **il n’en fait qu’à sa tête**. Pensez aussi à accorder le possessif avec le sujet : **je n’en fais qu’à ma tête**, **tu n’en fais qu’à ta tête**.',
        ),
      ),
      flash(
        b('Five head idioms', 'Cinq expressions avec la tête'),
        [
          ['garder la tête froide', b('to keep a cool head', 'rester calme et lucide')],
          ['perdre la tête', b('to lose one’s mind, panic', 'perdre la raison ou son calme')],
          ['en avoir par-dessus la tête', b('to be completely fed up', 'en avoir vraiment assez')],
          ['n’en faire qu’à sa tête', b('to ignore advice, go one’s own way', 'n’écouter que soi-même')],
          ['avoir la tête sur les épaules', b('to be sensible and grounded', 'être sérieux et raisonnable')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('She is sensible, mature, and makes sound decisions.', 'Elle est sérieuse, réfléchie et responsable.'),
          b('She has a terrible headache after studying.', 'Elle a très mal à la tête après avoir étudié.'),
          b('She spends too much time worrying about work.', 'Elle s’inquiète sans raison pour son travail.'),
          b('She forgets every promise she makes.', 'Elle oublie toutes ses promesses.'),
        ],
        {
          fr: 'Tu peux compter sur Julie : elle a vraiment la tête sur les épaules.',
          explain: b('« Avoir la tête sur les épaules » means being level-headed and reliable.', '« Avoir la tête sur les épaules » signifie être réfléchi et responsable.'),
        },
      ),
      mc(
        P.complete,
        [
          'n’en fait qu’à sa tête',
          'garde la tête froide',
          'a la tête sur les épaules',
          'met l’eau à la bouche',
        ],
        {
          fr: 'Je lui ai déconseillé de partir sans carte ni batterie, mais il ___ !',
          explain: b('Refusing advice and doing what you want = n’en faire qu’à sa tête.', 'Refuser les conseils pour agir à sa guise = n’en faire qu’à sa tête.'),
        },
      ),
      pairs(
        P.match,
        [
          ['garder la tête froide', b('to keep a cool head', 'rester calme et lucide')],
          ['perdre la tête', b('to lose one’s mind, panic', 'perdre la raison ou son calme')],
          ['en avoir par-dessus la tête', b('to be completely fed up', 'en avoir vraiment assez')],
          ['n’en faire qu’à sa tête', b('to ignore advice, go one’s own way', 'n’écouter que soi-même')],
          ['avoir la tête sur les épaules', b('to be sensible and grounded', 'être sérieux et raisonnable')],
        ],
      ),
      gap(
        P.complete,
        'Trois réunions annulées à la dernière minute : j’___ de cette organisation ! Heureusement, notre cheffe ___ et propose un plan clair.',
        [['en ai par-dessus la tête'], ['garde la tête froide']],
        {
          choices: [
            ['en ai par-dessus la tête', 'en fais qu’à ma tête', 'ai la tête froide'],
            ['garde la tête froide', 'perd la tête', 'n’en fait qu’à sa tête'],
          ],
          explain: b('Being fed up = en avoir par-dessus la tête; staying calm = garder la tête froide.', 'Être excédé = en avoir par-dessus la tête ; rester calme = garder la tête froide.'),
        },
      ),
      hear(
        'Quand le train a été bloqué deux heures sous la neige, certains voyageurs ont perdu la tête, mais le contrôleur est resté très calme.',
        b('How did some passengers react?', 'Comment certains voyageurs ont-ils réagi ?'),
        [
          b('They panicked and lost their cool', 'Ils ont paniqué et perdu leur calme'),
          b('They calmly read their books', 'Ils ont lu tranquillement leur livre'),
          b('They walked back to the station on foot', 'Ils sont rentrés à pied jusqu’à la gare'),
        ],
      ),
      dict('Il faut garder la tête froide quand tout le monde panique.'),
      say('J’en ai par-dessus la tête de ces embouteillages chaque matin !', 'I am completely fed up with these traffic jams every morning!'),
    ],
    [
      b('garder la tête froide = stay calm; perdre la tête = panic or lose control.', 'garder la tête froide = rester lucide ; perdre la tête = s’affoler.'),
      b('en avoir par-dessus la tête = be fed up; n’en faire qu’à sa tête = refuse advice.', 'en avoir par-dessus la tête = être excédé ; n’en faire qu’à sa tête = désobéir par entêtement.'),
      b('avoir la tête sur les épaules = be sensible and reliable.', 'avoir la tête sur les épaules = être mûr et raisonnable.'),
    ],
    [
      ['garder la tête froide', b('to keep a cool head', 'rester calme et lucide')],
      ['perdre la tête', b('to lose one’s mind, panic', 'perdre la raison ou son calme')],
      ['en avoir par-dessus la tête', b('to be completely fed up', 'en avoir vraiment assez')],
      ['n’en faire qu’à sa tête', b('to ignore advice, go one’s own way', 'n’écouter que soi-même')],
      ['avoir la tête sur les épaules', b('to be sensible and grounded', 'être sérieux et raisonnable')],
    ],
  ),

  lesson(
    C,
    2,
    ['eyes-and-sight-idioms', 'expressions-avec-les-yeux'],
    b('Eyes wide open', 'Ouvrir grand les yeux'),
    b('Express obviousness, looking the other way, high prices, amazement, and disbelief using les yeux.', 'Exprimer l’évidence, la tolérance, un prix excessif, la surprise et l’incrédulité avec les yeux.'),
    [
      b('Point out obvious facts with sauter aux yeux', 'Souligner une évidence avec sauter aux yeux'),
      b('Contrast fermer les yeux sur with ouvrir grand les yeux and ne pas croire ses yeux', 'Opposer fermer les yeux sur à ouvrir grand les yeux et ne pas croire ses yeux'),
      b('Talk about outrageous prices with coûter les yeux de la tête', 'Parler d’un prix exorbitant avec coûter les yeux de la tête'),
    ],
    13,
    [
      card(
        b('Five expressions with les yeux', 'Cinq expressions avec les yeux'),
        b(
          'Eyes reveal what we notice right away, what we choose to ignore, what surprises us, and even what hurts our wallet!\n\nObviousness & ignoring: **sauter aux yeux, fermer les yeux sur**.\nPrice & surprise: **coûter les yeux de la tête, ouvrir grand les yeux, ne pas croire ses yeux**.',
          'Les yeux traduisent ce qui saute à la vue, ce qu’on choisit d’ignorer, ce qui étonne et même ce qui pèse sur le budget !\n\nÉvidence et tolérance : **sauter aux yeux, fermer les yeux sur**.\nPrix et stupeur : **coûter les yeux de la tête, ouvrir grand les yeux, ne pas croire ses yeux**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens réel'), b('Example', 'Exemple')],
            rows: [
              ['sauter aux yeux', b('to be glaringly obvious', 'être tout de suite évident'), 'L’erreur saute aux yeux.'],
              ['fermer les yeux sur', b('to turn a blind eye to', 'tolérer sans réagir'), 'Il ferme les yeux sur ce retard.'],
              ['coûter les yeux de la tête', b('to cost an arm and a leg', 'coûter extrêmement cher'), 'Ce vélo coûte les yeux de la tête.'],
              ['ouvrir grand les yeux', b('to open one’s eyes wide', 'regarder avec attention ou stupeur'), 'Les enfants ouvrent grand les yeux.'],
              ['ne pas croire ses yeux', b('not to believe one’s eyes', 'être stupéfait de ce qu’on voit'), 'Je n’en crois pas mes yeux !'],
            ],
          },
          ex: [
            ['La ressemblance entre les deux frères saute vraiment aux yeux.', 'The resemblance between the two brothers is really striking.'],
            ['Cette réparation de voiture m’a coûté les yeux de la tête.', 'That car repair cost me an arm and a leg.'],
            ['Quand elle a vu le gâteau d’anniversaire, elle n’en croyait pas ses yeux.', 'When she saw the birthday cake, she couldn’t believe her eyes.'],
          ],
        },
      ),
      trap(
        b('Two grammar traps: « grand » and « les yeux »', 'Deux pièges : « grand » invariable et « les yeux »'),
        b(
          'In **ouvrir grand les yeux**, the word **grand** acts as an adverb meaning *wide* and NEVER adds an -s: say *ils ouvrent grand les yeux* (not *grands*). Also, English says "cost an arm and a leg", whereas French ALWAYS says **coûter les yeux de la tête**—never *un bras et une jambe*!\n\nInvariable adverb: **ouvrir grand les yeux, ouvrir grand la fenêtre**.\nNatural price idiom: **coûter les yeux de la tête**.',
          'Dans **ouvrir grand les yeux**, **grand** fonctionne comme un adverbe (« largement ») et reste TOUJOURS invariable : dites *ils ouvrent grand les yeux* (jamais *grands*). De plus, le français dit **coûter les yeux de la tête** et jamais *coûter un bras et une jambe* !\n\nAdverbe invariable : **ouvrir grand les yeux, ouvrir grand la fenêtre**.\nPrix élevé : **coûter les yeux de la tête**.',
        ),
      ),
      flash(
        b('Five eye idioms', 'Cinq expressions avec les yeux'),
        [
          ['sauter aux yeux', b('to be glaringly obvious', 'être tout de suite évident')],
          ['fermer les yeux sur', b('to turn a blind eye to', 'faire semblant de ne pas voir')],
          ['coûter les yeux de la tête', b('to cost an arm and a leg', 'coûter très cher')],
          ['ouvrir grand les yeux', b('to open one’s eyes wide', 'regarder avec stupeur ou attention')],
          ['ne pas croire ses yeux', b('not to believe one’s eyes', 'être stupéfait devant ce qu’on voit')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('She pretends not to notice a few late arrivals.', 'Elle choisit d’ignorer quelques arrivées tardives.'),
          b('She sleeps at her desk during the afternoon.', 'Elle s’endort à son bureau l’après-midi.'),
          b('She refuses to open the curtains in the morning.', 'Elle refuse d’ouvrir les rideaux le matin.'),
          b('She punishes every single mistake immediately.', 'Elle sanctionne chaque petite erreur sur-le-champ.'),
        ],
        {
          fr: 'Notre professeure est indulgente : parfois, elle ferme les yeux sur un léger retard.',
          explain: b('« Fermer les yeux sur » means choosing to overlook a fault or rule slip.', '« Fermer les yeux sur » signifie tolérer volontairement une petite faute.'),
        },
      ),
      mc(
        P.form,
        [
          'ouvrent grand les yeux',
          'ouvrent grands les yeux',
          'ouvrent grandes les yeux',
          'ferment grand les yeux',
        ],
        {
          fr: 'Devant les feux d’artifice, les enfants ___ d’admiration.',
          explain: b('Grand stays invariable (no -s) in ouvrir grand les yeux.', 'Grand reste invariable (sans -s) dans ouvrir grand les yeux.'),
        },
      ),
      sort(
        b('Sort each expression by what it expresses.', 'Classez chaque expression selon l’idée exprimée.'),
        [
          b('Surprise or high visibility', 'Surprise ou évidence'),
          b('Ignoring something or high cost', 'Tolérance ou prix élevé'),
        ],
        [
          ['sauter aux yeux', 0],
          ['fermer les yeux sur', 1],
          ['ouvrir grand les yeux', 0],
          ['coûter les yeux de la tête', 1],
          ['ne pas croire ses yeux', 0],
          ['payer une fortune', 1],
        ],
      ),
      gap(
        P.complete,
        'Ce studio près de la gare coûte les ___ de la tête, mais son défaut saute aux ___ : il n’y a presque pas de lumière !',
        [['yeux'], ['yeux']],
        {
          tr: 'This studio near the station costs an arm and a leg, though its flaw is glaringly obvious: there is almost no light!',
          hint: b('Use the plural noun for “eyes” in both blanks.', 'Utilisez le nom pluriel désignant le regard dans les deux trous.'),
        },
      ),
      ord(
        P.order,
        'Le directeur ferme parfois les yeux sur nos pauses café.',
        {
          tr: 'The manager sometimes turns a blind eye to our coffee breaks.',
          extra: ['tête', 'bouche'],
        },
      ),
      hear(
        'Quand j’ai ouvert la facture d’électricité ce mois-ci, je n’en ai pas cru mes yeux : le montant avait doublé !',
        b('Why was the speaker amazed?', 'Pourquoi la personne était-elle stupéfaite ?'),
        [
          b('Because the electricity bill had doubled', 'Parce que la facture d’électricité avait doublé'),
          b('Because the electricity company sent a refund', 'Parce que le fournisseur envoyait un remboursement'),
          b('Because the power was cut off all month', 'Parce que le courant a été coupé tout le mois'),
        ],
        { voice: 'm' },
      ),
      say('Ce manteau est magnifique, mais il coûte les yeux de la tête !', 'This coat is gorgeous, but it costs an arm and a leg!'),
    ],
    [
      b('sauter aux yeux = be glaringly obvious; fermer les yeux sur = turn a blind eye to.', 'sauter aux yeux = être évident ; fermer les yeux sur = tolérer sans réagir.'),
      b('coûter les yeux de la tête = cost an arm and a leg.', 'coûter les yeux de la tête = coûter extrêmement cher.'),
      b('ouvrir grand les yeux (invariable grand!) and ne pas croire ses yeux express wonder or disbelief.', 'ouvrir grand les yeux (grand invariable !) et ne pas croire ses yeux expriment l’étonnement.'),
    ],
    [
      ['sauter aux yeux', b('to be glaringly obvious', 'être tout de suite évident')],
      ['fermer les yeux sur', b('to turn a blind eye to', 'faire semblant de ne pas voir')],
      ['coûter les yeux de la tête', b('to cost an arm and a leg', 'coûter très cher')],
      ['ouvrir grand les yeux', b('to open one’s eyes wide', 'regarder avec stupeur ou attention')],
      ['ne pas croire ses yeux', b('not to believe one’s eyes', 'être stupéfait devant ce qu’on voit')],
    ],
  ),

  lesson(
    C,
    3,
    ['mouth-and-tongue-idioms', 'expressions-bouche-et-langue'],
    b('On the tip of the tongue', 'Sur le bout de la langue'),
    b('Talk about speechlessness, forgetting a word, holding back a remark, talkativeness, and tempting food.', 'Parler de stupeur, d’oubli momentané, de retenue, de bavardage et de gourmandise avec la bouche et la langue.'),
    [
      b('React to speechlessness and memory slips with rester bouche bée and avoir un mot sur le bout de la langue', 'Réagir à la surprise et aux oublis avec rester bouche bée et avoir un mot sur le bout de la langue'),
      b('Contrast holding back (se mordre la langue) with talking non-stop (avoir la langue bien pendue)', 'Opposer se taire (se mordre la langue) et parler beaucoup (avoir la langue bien pendue)'),
      b('Build excitement for food or plans with mettre l’eau à la bouche', 'Donner envie d’un plat ou d’un projet avec mettre l’eau à la bouche'),
    ],
    13,
    [
      card(
        b('Mouth and tongue in conversation', 'La bouche et la langue en conversation'),
        b(
          'These five idioms capture the full rhythm of speaking—from being speechless or forgetting a name to holding your tongue, chatting endlessly, or salivating over dinner.\n\nSpeech & silence: **rester bouche bée, se mordre la langue, avoir la langue bien pendue**.\nMemory & craving: **avoir un mot sur le bout de la langue, mettre l’eau à la bouche**.',
          'Ces cinq expressions suivent tout le rythme de la parole : rester muet de surprise, chercher un mot, se retenir de parler, bavarder sans fin ou saliver d’envie.\n\nParole et silence : **rester bouche bée, se mordre la langue, avoir la langue bien pendue**.\nMémoire et envie : **avoir un mot sur le bout de la langue, mettre l’eau à la bouche**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens réel'), b('Example', 'Exemple')],
            rows: [
              ['rester bouche bée', b('to stand open-mouthed', 'rester muet de surprise'), 'Nous sommes restés bouche bée.'],
              ['avoir un mot sur le bout de la langue', b('have a word on tip of tongue', 'chercher un mot presque retrouvé'), 'J’ai son prénom sur le bout de la langue.'],
              ['se mordre la langue', b('to bite one’s tongue', 'se retenir de parler'), 'Je me suis mordu la langue pour ne rien dire.'],
              ['avoir la langue bien pendue', b('to be very talkative', 'parler beaucoup et avec aisance'), 'Mon voisin a la langue bien pendue.'],
              ['mettre l’eau à la bouche', b('to make one’s mouth water', 'donner très envie'), 'Cette tarte met l’eau à la bouche.'],
            ],
          },
          ex: [
            ['Devant la beauté du château, les visiteurs sont restés bouche bée.', 'Faced with the beauty of the castle, the visitors stood open-mouthed.'],
            ['J’ai failli répondre, puis je me suis mordu la langue à temps.', 'I nearly answered back, then I bit my tongue in time.'],
            ['L’odeur du pain chaud dans la rue met vraiment l’eau à la bouche.', 'The smell of warm bread in the street really makes your mouth water.'],
          ],
        },
      ),
      culture(
        b('What does « bée » mean—and how wide is « l’eau à la bouche »?', 'D’où vient « bée » et quand employer « l’eau à la bouche » ?'),
        b(
          'The word **bée** comes from the old French verb *béer* ("to remain wide open"), which only survives in **bouche bée** (always feminine singular, even for a group: *ils sont restés bouche bée*). And **mettre l’eau à la bouche** isn’t only for bakeries—you can also use it for a film trailer, a holiday brochure, or an exciting weekend plan!',
          'Le mot **bée** vient de l’ancien verbe *béer* (« rester grand ouvert ») et reste figé sans -s, même au pluriel : *ils sont restés bouche bée*. Quant à **mettre l’eau à la bouche**, il s’emploie aussi bien devant une pâtisserie que pour une bande-annonce de film ou un beau programme de vacances !',
        ),
      ),
      mc(
        P.meaning,
        [
          b('She talks a lot and never runs out of things to say.', 'Elle parle beaucoup et avec beaucoup de facilité.'),
          b('She is too shy to speak during group meetings.', 'Elle est trop timide pour parler en réunion.'),
          b('She speaks slowly because she has a sore throat.', 'Elle parle doucement à cause d’un mal de gorge.'),
          b('She never remembers anyone’s first name.', 'Elle ne retient jamais les prénoms.'),
        ],
        {
          fr: 'Avec ma cousine Chloé, on ne s’ennuie jamais : elle a la langue bien pendue !',
          explain: b('« Avoir la langue bien pendue » describes someone who talks easily and abundantly.', '« Avoir la langue bien pendue » qualifie quelqu’un de très bavard et vif.'),
        },
      ),
      pairs(
        P.match,
        [
          ['rester bouche bée', b('to be left speechless in amazement', 'être muet de surprise')],
          ['avoir un mot sur le bout de la langue', b('to have a word on the tip of one’s tongue', 'être tout près de retrouver un mot')],
          ['se mordre la langue', b('to bite one’s tongue, hold back', 'se retenir de dire quelque chose')],
          ['avoir la langue bien pendue', b('to be talkative, glib', 'parler beaucoup et facilement')],
          ['mettre l’eau à la bouche', b('to make one’s mouth water', 'donner très envie')],
        ],
      ),
      hear(
        'Attends, ne me souffle pas le titre du film : je l’ai sur le bout de la langue !',
        b('What is the speaker trying to do?', 'Qu’essaie de faire la personne ?'),
        [
          b('Remember the film’s title on her own', 'Retrouver toute seule le titre du film'),
          b('Order dessert before the main course', 'Commander un dessert avant le plat'),
          b('Keep a secret from her friend', 'Cacher un secret à son amie'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('In front of the new pastry shop', 'Devant la nouvelle pâtisserie'),
        b('Inès and Hugo pass a bakery window and spot a famous chef inside.', 'Inès et Hugo passent devant une vitrine et aperçoivent un grand chef.'),
        [['Inès', 'f2'], ['Hugo', 'm']],
        [
          [0, 'Regarde ces tartes aux framboises et ces croissants tout chauds dans la vitrine !', 'Look at those raspberry tarts and warm croissants in the window!'],
          [1, {
            options: [
              'Miam, cette odeur met vraiment l’eau à la bouche !',
              'Oui, cette vitrine ferme les yeux sur nous !',
              'Ah bon, j’ai la langue bien pendue devant le pain !',
            ],
            explain: b('Delicious food making you eager to eat = mettre l’eau à la bouche.', 'Une vitrine gourmande qui donne envie = mettre l’eau à la bouche.'),
          }],
          [0, 'Chut, regarde : c’est le célèbre chef qui a ouvert la boutique ! Comment il s’appelle déjà ?', 'Shh, look: it’s the famous chef who opened the shop! What’s his name again?'],
          [1, {
            options: [
              'Attends, j’ai son nom sur le bout de la langue… Ah oui, Paul Martin !',
              'Attends, je reste bouche bée… Ah oui, j’en ai par-dessus la tête !',
              'Attends, je me mords la tête… Ah oui, Paul Martin !',
            ],
            explain: b('Almost remembering a name = avoir un mot/nom sur le bout de la langue.', 'Chercher un nom qu’on connaît presque = l’avoir sur le bout de la langue.'),
          }],
          [0, 'Quand je vois le gâteau géant qu’il prépare, je reste vraiment bouche bée !', 'When I see the giant cake he’s making, I’m really left speechless!'],
          [1, 'Moi aussi, et j’ai failli crier de surprise, mais je me suis mordu la langue.', 'Me too, and I nearly gasped out loud, though I bit my tongue.'],
        ],
      ),
      dict('Je me suis mordu la langue pour ne pas gâcher la surprise.'),
      write(
        b('A surprising dinner or concert', 'Un dîner ou un concert surprenant'),
        b('Write 30 to 60 words about a meal, a show, or an unexpected encounter. Include at least two head, eye, or mouth idioms from this course.', 'Écrivez 30 à 60 mots sur un repas, un spectacle ou une rencontre inattendue. Employez au moins deux expressions de ce cours.'),
        30,
        60,
        [
          b('At least two idioms from this course', 'Au moins deux expressions de ce cours'),
          b('Clear past-tense narration', 'Un récit clair au passé'),
          b('Accurate spelling of fixed idioms', 'Orthographe exacte des expressions figées'),
        ],
        'Hier soir, le menu du nouveau bistro mettait vraiment l’eau à la bouche. Quand le serveur a apporté le dessert, nous sommes restés bouche bée : il était immense ! Heureusement, l’addition ne coûtait pas les yeux de la tête.',
        { phrases: ['mettait l’eau à la bouche', 'nous sommes restés bouche bée', 'coûtait les yeux de la tête'] },
      ),
    ],
    [
      b('rester bouche bée = stand amazed; avoir un mot sur le bout de la langue = almost recall a word.', 'rester bouche bée = être stupéfait ; avoir un mot sur le bout de la langue = chercher un mot.'),
      b('se mordre la langue = hold back a remark; avoir la langue bien pendue = be talkative.', 'se mordre la langue = se retenir de parler ; avoir la langue bien pendue = être bavard.'),
      b('mettre l’eau à la bouche = make someone’s mouth water (for food or exciting plans).', 'mettre l’eau à la bouche = donner très envie (plat ou projet).'),
    ],
    [
      ['rester bouche bée', b('to be left speechless in amazement', 'être muet de surprise')],
      ['avoir un mot sur le bout de la langue', b('to have a word on the tip of one’s tongue', 'être tout près de retrouver un mot')],
      ['se mordre la langue', b('to bite one’s tongue, hold back', 'se retenir de dire quelque chose')],
      ['avoir la langue bien pendue', b('to be talkative, glib', 'parler beaucoup et facilement')],
      ['mettre l’eau à la bouche', b('to make one’s mouth water', 'donner très envie')],
    ],
  ),
];

export default lessons;
