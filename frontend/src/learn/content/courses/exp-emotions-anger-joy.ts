import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French speakers rarely say simply “I am happy” or “I am angry”—they leap for joy, bounce back like a wild creature, come off their hinges, or fall from the clouds. This B1 course teaches fifteen vivid idiomatic expressions for joy, resilience, irritation, fury, stage fright, the blues and disbelief, with register clues and natural dialogue practice.',
    'En français, on ne se contente pas de dire « je suis content » ou « je suis en colère » : on est aux anges, on reprend du poil de la bête, on sort de ses gonds ou on tombe des nues. Ce cours B1 vous fait maîtriser quinze expressions imagées pour la joie, l’élan, l’agacement, la colère, le trac, la mélancolie et la stupeur, avec repères de registre et mises en situation naturelles.',
  ),
  outcomes: [
    b('Express intense joy, enthusiasm and renewed energy naturally', 'Exprimer la joie intense, l’enthousiasme et le regain d’énergie'),
    b('Distinguish degrees of anger and colloquial annoyance by register', 'Distinguer les degrés de colère et l’agacement familier selon le registre'),
    b('Describe stage fright, anxiety, sadness and astonishment idiomatically', 'Décrire le trac, l’angoisse, le cafard et la stupeur avec naturel'),
  ],
};

const C = 'exp-emotions-anger-joy';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['joy-and-enthusiasm', 'joie-et-enthousiasme'],
    b('Joy, euphoria & bouncing back', 'Joie, euphorie et regain d’énergie'),
    b('Celebrate good news and describe renewed morale with five classic positive idioms.', 'Annoncer une bonne nouvelle et exprimer un moral au sommet avec cinq expressions positives.'),
    [
      b('Express intense happiness with être aux anges and être sur un nuage', 'Exprimer un grand bonheur avec être aux anges et être sur un nuage'),
      b('Show lively excitement with sauter de joie', 'Manifester son enthousiasme avec sauter de joie'),
      b('Describe recovering energy and high spirits with reprendre du poil de la bête and avoir le moral au beau fixe', 'Exprimer la reprise d’énergie et le bon moral'),
    ],
    13,
    [
      card(
        b('Five idioms for high spirits', 'Cinq expressions pour dire sa joie'),
        b(
          'French captures happiness with light, height and fair weather. Notice that **être aux anges** and **être sur un nuage** describe blissful contentment, **sauter de joie** shows an immediate burst of delight, while **reprendre du poil de la bête** and **avoir le moral au beau fixe** trace recovery and steady optimism.\n\nBliss & excitement: **être aux anges, être sur un nuage, sauter de joie**.\nRecovery & steady morale: **reprendre du poil de la bête, avoir le moral au beau fixe**.',
          'Le français exprime le bonheur par la hauteur, la lumière et le beau temps. **Être aux anges** et **être sur un nuage** traduisent un bonheur radieux, **sauter de joie** une réaction vive, tandis que **reprendre du poil de la bête** et **avoir le moral au beau fixe** décrivent le regain d’énergie et l’optimisme.\n\nBonheur et élan : **être aux anges, être sur un nuage, sauter de joie**.\nRegain et moral : **reprendre du poil de la bête, avoir le moral au beau fixe**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['être aux anges', b('to be with the angels', 'être parmi les anges'), b('to be overjoyed, thrilled', 'être ravi, comblé de bonheur')],
              ['être sur un nuage', b('to be on a cloud', 'flotter sur un nuage'), b('to be on cloud nine, floating with joy', 'vivre un moment de pur bonheur')],
              ['sauter de joie', b('to jump with joy', 'bondir de joie'), b('to leap for joy at good news', 'réagir avec une joie explosive')],
              ['reprendre du poil de la bête', b('to take hair of the beast again', 'reprendre de la vigueur'), b('to bounce back, perk up again', 'retrouver énergie et courage')],
              ['avoir le moral au beau fixe', b('morale set to “fair weather”', 'baromètre au beau temps'), b('to be in consistently great spirits', 'garder un excellent moral')],
            ],
          },
          ex: [
            ['Depuis qu’elle a décroché ce poste à Lyon, Camille est aux anges.', 'Since landing that job in Lyon, Camille has been over the moon.'],
            ['Après une mauvaise grippe, mon grand-père reprend enfin du poil de la bête.', 'After a bad flu, my grandfather is finally bouncing back.'],
            ['Malgré la pluie d’automne, toute l’équipe a le moral au beau fixe.', 'Despite the autumn rain, the whole team is in great spirits.'],
          ],
        },
      ),
      tip(
        b('Two misleading images: poil de la bête & beau fixe', 'Deux images trompeuses : poil de la bête et beau fixe'),
        b(
          'Unlike English “hair of the dog” (which refers to alcohol), **reprendre du poil de la bête** is 100% wholesome in French: it means regaining energy or confidence after illness, fatigue or a setback. And **au beau fixe** comes from old French barometers, where the needle points to “beau fixe” (steady sunny weather).\n\nAlways fixed wording: **reprendre du poil de la bête** (never *les poils*), **au beau fixe** (never *au bon fixe*).',
          'Contrairement à l’expression anglaise voisine, **reprendre du poil de la bête** ne parle jamais d’alcool : en français, cela signifie simplement retrouver son énergie ou son entrain après une fatigue ou une épreuve. Quant à **au beau fixe**, l’image vient du baromètre dont l’aiguille indique un temps durablement ensoleillé.\n\nFormules figées : **reprendre du poil de la bête** (jamais *les poils*), **au beau fixe** (jamais *au bon fixe*).',
        ),
      ),
      flash(b('Joy & resilience', 'Joie et regain d’énergie'), [
        ['être aux anges', b('to be over the moon', 'être extrêmement heureux, ravi')],
        ['être sur un nuage', b('to be on cloud nine', 'flotter dans un bonheur serein')],
        ['sauter de joie', b('to jump for joy', 'exprimer une joie vive et soudaine')],
        ['reprendre du poil de la bête', b('to bounce back, perk up', 'retrouver sa forme et son énergie')],
        ['avoir le moral au beau fixe', b('to be in great spirits', 'avoir un excellent moral durable')],
      ]),
      mc(
        P.best,
        ['est aux anges', 'reprend du poil de la bête', 'a le cafard', 'sort de ses gonds'],
        {
          fr: 'Depuis la naissance de sa petite-fille, mon oncle ___ : il sourit tout le temps.',
          explain: b('Being thrilled by wonderful family news is être aux anges.', 'Un grand bonheur durable correspond à être aux anges.'),
        },
      ),
      mc(
        P.meaning,
        [
          b('She is finally recovering her energy and spirit.', 'Elle retrouve enfin son énergie et son entrain.'),
          b('She decided to adopt a dog.', 'Elle a décidé d’adopter un animal.'),
          b('She is worried about her next exam.', 'Elle s’inquiète pour son prochain examen.'),
          b('She lost her temper with a colleague.', 'Elle s’est mise en colère contre un collègue.'),
        ],
        {
          fr: 'Après deux semaines difficiles au bureau, Claire reprend du poil de la bête.',
          explain: b('Reprendre du poil de la bête means bouncing back after a rough patch.', 'Reprendre du poil de la bête signifie retrouver forme et courage après un moment difficile.'),
        },
      ),
      pairs(P.match, [
        ['être aux anges', b('to be over the moon', 'être comblé de bonheur')],
        ['être sur un nuage', b('to be on cloud nine', 'se sentir transporté par la joie')],
        ['sauter de joie', b('to jump for joy', 'bondir d’enthousiasme')],
        ['reprendre du poil de la bête', b('to perk up / bounce back', 'retrouver forme et dynamisme')],
        ['avoir le moral au beau fixe', b('to be in high spirits', 'avoir un moral solide et joyeux')],
      ]),
      gap(
        P.complete,
        'Quand Lucas a appris qu’il partait étudier à Montréal, il a ___ de joie ! Depuis ce matin, il est vraiment sur un ___ et il a le moral au beau ___.',
        [['sauté'], ['nuage'], ['fixe']],
        {
          choices: [
            ['sauté', 'repris', 'monté'],
            ['nuage', 'cheval', 'poil'],
            ['fixe', 'clair', 'haut'],
          ],
          explain: b('Use sauter de joie (past participle sauté), être sur un nuage, and avoir le moral au beau fixe.', 'On associe sauter de joie, être sur un nuage et avoir le moral au beau fixe.'),
        },
      ),
      hear(
        'Bonne nouvelle : après sa longue convalescence, ma sœur reprend du poil de la bête et elle a de nouveau le moral au beau fixe.',
        b('How is the speaker’s sister doing now?', 'Comment va la sœur de la personne maintenant ?'),
        [
          b('She is recovering her strength and feeling very upbeat.', 'Elle retrouve ses forces et garde un excellent moral.'),
          b('She is still exhausted and discouraged.', 'Elle reste très fatiguée et découragée.'),
          b('She just adopted a puppy.', 'Elle vient d’adopter un chiot.'),
        ],
      ),
      dict('Depuis qu’ils ont reçu les clés de leur maison, ils sont sur un nuage.'),
      say('Quand j’ai lu ton message ce matin, j’ai sauté de joie et j’étais aux anges.', 'When I read your message this morning, I jumped for joy and was over the moon.'),
    ],
    [
      b('être aux anges / sur un nuage = blissful joy; sauter de joie = sudden burst of excitement.', 'être aux anges / sur un nuage = bonheur radieux ; sauter de joie = réaction enthousiaste.'),
      b('reprendre du poil de la bête = recover energy or confidence after a tough moment.', 'reprendre du poil de la bête = retrouver forme et courage après une baisse de régime.'),
      b('avoir le moral au beau fixe = have steady, sunny morale.', 'avoir le moral au beau fixe = garder un excellent moral.'),
    ],
    [
      ['être aux anges', b('to be over the moon', 'être comblé de bonheur')],
      ['être sur un nuage', b('to be on cloud nine', 'vivre un moment de bonheur intense')],
      ['sauter de joie', b('to jump for joy', 'manifester une joie soudaine')],
      ['reprendre du poil de la bête', b('to bounce back, perk up', 'retrouver son énergie')],
      ['avoir le moral au beau fixe', b('to be in great spirits', 'avoir un très bon moral')],
    ],
  ),

  lesson(
    C,
    2,
    ['anger-and-annoyance', 'colere-et-exasperation'],
    b('Anger, outrage & everyday annoyance', 'Colère, indignation et agacement'),
    b('Tell explosive anger apart from informal exasperation and avoid register slips.', 'Distinguer colère explosive et ras-le-bol familier, en maîtrisant chaque niveau de langue.'),
    [
      b('Express sudden anger with sortir de ses gonds and voir rouge', 'Exprimer l’emportement avec sortir de ses gonds et voir rouge'),
      b('Recognize haughty outrage with monter sur ses grands chevaux', 'Reconnaître l’indignation avec monter sur ses grands chevaux'),
      b('Use informal irritation (en avoir ras le bol, casser les pieds à quelqu’un) in the right setting', 'Employer le registre familier à bon escient'),
    ],
    13,
    [
      card(
        b('From mild irritation to fury', 'De l’agacement à la fureur'),
        b(
          'Not every anger idiom fits every room. **Sortir de ses gonds** (to fly off the handle) and **voir rouge** (to see red) describe losing self-control; **monter sur ses grands chevaux** captures someone getting offended and speaking in a grand, indignant tone. In casual speech with friends, **en avoir ras le bol** and **casser les pieds à quelqu’un** express everyday exasperation.\n\nLoss of temper: **sortir de ses gonds, voir rouge, monter sur ses grands chevaux**.\nCasual frustration: **en avoir ras le bol, casser les pieds à quelqu’un**.',
          'Toutes les expressions de colère n’ont pas le même registre. **Sortir de ses gonds** et **voir rouge** décrivent une perte de calme soudaine ; **monter sur ses grands chevaux** évoque quelqu’un qui s’indigne avec hauteur. Entre amis, **en avoir ras le bol** et **casser les pieds à quelqu’un** disent l’exaspération quotidienne.\n\nColère vive : **sortir de ses gonds, voir rouge, monter sur ses grands chevaux**.\nAgacement familier : **en avoir ras le bol, casser les pieds à quelqu’un**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Register', 'Registre'), b('Meaning', 'Sens')],
            rows: [
              ['sortir de ses gonds', b('standard', 'courant'), b('to lose one’s temper completely', 'perdre son sang-froid, exploser')],
              ['voir rouge', b('standard', 'courant'), b('to become furious instantly', 'devenir furieux d’un coup')],
              ['monter sur ses grands chevaux', b('standard', 'courant'), b('to get on one’s high horse', 's’emporter avec indignation')],
              ['en avoir ras le bol', b('colloquial', 'familier'), b('to be totally fed up', 'ne plus supporter une situation')],
              ['casser les pieds à quelqu’un', b('colloquial', 'familier'), b('to get on someone’s nerves', 'importuner, agacer quelqu’un')],
            ],
          },
          ex: [
            ['Quand il a vu le dossier bâclé, le directeur est sorti de ses gonds.', 'When he saw the sloppy file, the director flew off the handle.'],
            ['Inutile de monter sur tes grands chevaux, je posais juste une question !', 'No need to get on your high horse, I was only asking a question!'],
            ['J’en ai ras le bol des retards de train chaque lundi matin.', 'I am completely fed up with train delays every Monday morning.'],
          ],
        },
      ),
      trap(
        b('Mind the register—and the pronoun syntax!', 'Attention au registre et aux pronoms !'),
        b(
          'Avoid saying **en avoir ras le bol** or **casser les pieds** to a client, professor or examiner: keep those for friends and family. Also watch the grammar: **en** stays in front of *avoir* (**J’en ai ras le bol de ce bruit**), and **casser les pieds** takes an indirect object pronoun (**Tu me casses les pieds**, **Il casse les pieds à ses voisins**).\n\nKeep informal: **J’en ai ras le bol · Tu me casses les pieds**.\nPolite alternatives: **J’en ai assez · Cela commence à m’agacer**.',
          'Évitez **en avoir ras le bol** ou **casser les pieds** devant un client, un professeur ou un jury : réservez-les aux proches. Soignez aussi la syntaxe : **en** reste indispensable (**J’en ai ras le bol de ce bruit**) et **à quelqu’un** devient un pronom indirect (**Tu me casses les pieds**, **Il casse les pieds à ses voisins**).\n\nRegistre familier : **J’en ai ras le bol · Tu me casses les pieds**.\nRegistre courant : **J’en ai assez · Cela m’agace vraiment**.',
        ),
      ),
      flash(b('Anger & annoyance', 'Colère et exaspération'), [
        ['sortir de ses gonds', b('to fly off the handle', 'exploser de colère, perdre son calme')],
        ['voir rouge', b('to see red, become furious', 'être aveuglé par la colère')],
        ['monter sur ses grands chevaux', b('to get on one’s high horse', 's’indigner avec vivacité')],
        ['en avoir ras le bol', b('to be fed up (informal)', 'être excédé (familier)')],
        ['casser les pieds à quelqu’un', b('to annoy, pester someone (informal)', 'agacer fortement quelqu’un (familier)')],
      ]),
      mc(
        P.best,
        ['monter sur tes grands chevaux', 'reprendre du poil de la bête', 'sauter de joie', 'être sur un nuage'],
        {
          fr: 'Calme-toi, ce n’était qu’une petite remarque : pas besoin de ___ !',
          explain: b('Monter sur ses grands chevaux means reacting with exaggerated indignation.', 'Monter sur ses grands chevaux signifie s’offenser et hausser le ton pour peu de chose.'),
        },
      ),
      mc(
        P.best,
        ['Je suis vraiment agacé par ces reports répétés.', 'Ce client me casse les pieds avec ses reports.', 'J’en ai ras le bol de votre entreprise !', 'Je sors de mes gonds devant vous.'],
        {
          fr: 'Vous écrivez un courriel professionnel à un fournisseur après trois retards de livraison :',
          explain: b('In a professional email, avoid colloquial idioms like casser les pieds or ras le bol.', 'Dans un courriel professionnel, évitez le familier et choisissez une formulation courante.'),
        },
      ),
      sort(
        b('Sort by tone: explosive anger or ongoing annoyance.', 'Classez selon la nuance : explosion de colère ou agacement / saturation.'),
        [
          b('Sudden anger / outrage', 'Colère vive / emportement'),
          b('Fed up / persistent annoyance', 'Exaspération / agacement répété'),
        ],
        [
          ['sortir de ses gonds', 0],
          ['en avoir ras le bol', 1],
          ['voir rouge', 0],
          ['casser les pieds à quelqu’un', 1],
          ['monter sur ses grands chevaux', 0],
          ['en avoir par-dessus la tête', 1],
        ],
      ),
      gap(
        P.complete,
        'Quand il a découvert la rayure sur sa voiture, Paul a ___ rouge et il est ___ de ses gonds. Moi, j’___ ai ras le bol de ces disputes dans le parking.',
        [['vu'], ['sorti'], ['en']],
        {
          choices: [
            ['vu', 'monté', 'cassé'],
            ['sorti', 'tombé', 'sauté'],
            ['en', 'y', 'le'],
          ],
          explain: b('Note the past participles vu (voir rouge) and sorti (sortir de ses gonds with être), and the pronoun en in en avoir ras le bol.', 'Attention aux participes passés vu et sorti (avec être), et au pronom en dans j’en ai ras le bol.'),
        },
      ),
      ord(
        P.order,
        'Tu me casses les pieds avec cette chanson.',
        {
          tr: 'You are driving me crazy with that song.',
          extra: ['bras', 'vois'],
          explain: b('Indirect pronoun me precedes casses les pieds.', 'Le pronom indirect me précède casses les pieds.'),
        },
      ),
      hear(
        'Arrête de me casser les pieds avec ces détails : j’en ai vraiment ras le bol de refaire le planning trois fois par semaine.',
        b('What is the speaker’s attitude?', 'Quelle est l’attitude de la personne qui parle ?'),
        [
          b('He is thoroughly exasperated with repeated changes.', 'Il est excédé par les changements incessants et le dit franchement.'),
          b('He wants to reschedule the meeting one more time.', 'Il propose de refaire le planning une quatrième fois.'),
          b('He is praising a colleague’s attention to detail.', 'Il félicite son collègue pour son sens du détail.'),
        ],
        { voice: 'm' },
      ),
      say('Pas besoin de monter sur vos grands chevaux : parlons calmement.', 'No need to get on your high horse: let’s talk calmly.'),
    ],
    [
      b('sortir de ses gonds and voir rouge express sudden fury; monter sur ses grands chevaux expresses haughty indignation.', 'sortir de ses gonds et voir rouge expriment la colère soudaine ; monter sur ses grands chevaux l’indignation.'),
      b('en avoir ras le bol and casser les pieds à quelqu’un are colloquial—avoid them in formal contexts.', 'en avoir ras le bol et casser les pieds à quelqu’un sont familiers : à éviter en contexte formel.'),
      b('Always keep en in j’en ai ras le bol and an indirect object (me, lui, à Paul) with casser les pieds.', 'Gardez toujours en dans j’en ai ras le bol et un objet indirect avec casser les pieds.'),
    ],
    [
      ['sortir de ses gonds', b('to fly off the handle', 'perdre complètement son calme')],
      ['voir rouge', b('to see red', 'être furieux tout à coup')],
      ['monter sur ses grands chevaux', b('to get on one’s high horse', 's’emporter avec grandiloquence')],
      ['en avoir ras le bol', b('to be fed up (informal)', 'être exaspéré (familier)')],
      ['casser les pieds à quelqu’un', b('to annoy someone (informal)', 'importuner quelqu’un (familier)')],
    ],
  ),

  lesson(
    C,
    3,
    ['stress-sadness-and-surprise', 'trac-cafard-et-stupeur'],
    b('Stress, sadness & total astonishment', 'Trac, cafard et stupeur'),
    b('Talk about pre-performance nerves, low spirits and jaw-dropping surprises like a native speaker.', 'Parler du trac, de la déprime et de l’étonnement total avec des expressions authentiques.'),
    [
      b('Distinguish avoir le trac from avoir la boule au ventre', 'Distinguer avoir le trac et avoir la boule au ventre'),
      b('Express sadness with avoir le cafard', 'Exprimer la mélancolie avec avoir le cafard'),
      b('React to shocks with tomber des nues and n’en pas revenir', 'Réagir à une surprise avec tomber des nues et n’en pas revenir'),
    ],
    13,
    [
      card(
        b('Nerves, blues & shock', 'Anxiété, mélancolie et surprise'),
        b(
          'Before an exam, speech or stage performance, French uses **avoir le trac**; deeper dread before an awkward conversation is **avoir la boule au ventre**. Feeling gloomy is **avoir le cafard**. Finally, **tomber des nues** (always conjugated with *être*) and **n’en pas revenir** express stunned disbelief.\n\nNerves & gloom: **avoir le trac, avoir la boule au ventre, avoir le cafard**.\nDisbelief: **tomber des nues, n’en pas revenir**.',
          'Avant un examen ou une prise de parole, on dit **avoir le trac** ; une angoisse plus lourde donne **avoir la boule au ventre**. Un coup de déprime passager se dit **avoir le cafard**. Enfin, **tomber des nues** (auxiliaire *être*) et **n’en pas revenir** expriment une stupeur totale.\n\nStress et mélancolie : **avoir le trac, avoir la boule au ventre, avoir le cafard**.\nStupeur : **tomber des nues, n’en pas revenir**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['avoir le trac', b('theatre slang for stage fright', 'peur avant de monter sur scène'), b('to have stage fright, pre-event nerves', 'ressentir la peur avant une épreuve')],
              ['avoir la boule au ventre', b('a knot/ball in the stomach', 'nœud tendu au ventre'), b('to have a knot in one’s stomach', 'éprouver une forte appréhension')],
              ['avoir le cafard', b('to have the cockroach', 'humeur noire'), b('to feel down, have the blues', 'être mélancolique, un peu triste')],
              ['tomber des nues', b('to fall from the clouds', 'tomber du ciel'), b('to be stunned, astounded', 'être pris de court, stupéfait')],
              ['n’en pas revenir', b('not to come back from it', 'ne pas retrouver ses esprits'), b('to not be able to believe it', 'rester stupéfait devant un fait')],
            ],
          },
          ex: [
            ['Même après vingt ans de théâtre, la comédienne a toujours un peu le trac.', 'Even after twenty years in theatre, the actress still gets stage fright.'],
            ['Dimanche soir, quand il pleut, j’ai souvent un petit cafard.', 'On Sunday evenings when it rains, I often feel a bit down.'],
            ['Quand j’ai appris qu’il déménageait à Tokyo, je suis tombée des nues !', 'When I learned he was moving to Tokyo, I was floored!'],
          ],
        },
      ),
      culture(
        b('From backstage curtains to Baudelaire', 'Des coulisses du théâtre à Baudelaire'),
        b(
          'In 19th-century Paris, **avoir le trac** belonged to actors waiting backstage behind velvet curtains—and **avoir le cafard** was popularized by poet Charles Baudelaire to name dark melancholy. Note also the syntax of **n’en pas revenir**: in conversation you almost always hear it conjugated with *ne … pas* (**Je n’en reviens pas !**, **On n’en est pas revenus !**).\n\nEveryday forms: **Je n’en reviens pas ! · Je suis tombé des nues · J’avais la boule au ventre**.',
          'Au XIXe siècle, **avoir le trac** appartenait au vocabulaire des comédiens en coulisses, tandis que **avoir le cafard** a été popularisé par Baudelaire pour désigner une mélancolie sombre. Notez l’usage de **n’en pas revenir** : à l’oral, on l’emploie presque toujours conjugué (**Je n’en reviens pas !**, **On n’en revenait pas !**).\n\nTournures fréquentes : **Je n’en reviens pas ! · Je suis tombé des nues · J’avais la boule au ventre**.',
        ),
      ),
      mc(
        P.best,
        ['n’en reviens pas', 'ai le trac', 'ai le cafard', 'sors de mes gonds'],
        {
          fr: 'Tu as vraiment gagné le premier prix du concours ? Je ___ !',
          explain: b('Je n’en reviens pas! means “I can’t believe it!” when stunned by news.', 'Je n’en reviens pas ! exprime l’incrédulité devant une nouvelle étonnante.'),
        },
      ),
      pairs(P.match, [
        ['avoir le trac', b('to have stage fright', 'angoisser juste avant de passer en public')],
        ['avoir la boule au ventre', b('to have a knot in one’s stomach', 'ressentir une forte anxiété physique')],
        ['avoir le cafard', b('to feel down / have the blues', 'traverser un moment de tristesse')],
        ['tomber des nues', b('to be floored / astounded', 'apprendre quelque chose avec stupeur')],
        ['n’en pas revenir', b('to not get over / believe it', 'rester ébahi face à une surprise')],
      ]),
      hear(
        'Avant d’entrer en scène pour ma première conférence, j’avais tellement le trac que j’avais la boule au ventre. Heureusement, dès la première question du public, je suis tombée des nues en voyant leurs sourires.',
        b('How did the speaker’s feelings change?', 'Comment les émotions de l’oratrice ont-elles évolué ?'),
        [
          b('She was anxious backstage, then pleasantly surprised by the warm audience.', 'Elle était très stressée avant de parler, puis agréablement surprise par l’accueil.'),
          b('She felt sad all evening because nobody came.', 'Elle a eu le cafard toute la soirée faute de public.'),
          b('She walked off stage after losing her temper.', 'Elle a quitté la salle en se mettant en colère.'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Backstage before the premiere', 'Dans les coulisses avant la première'),
        b('Sonia checks on her friend Karim five minutes before his public talk.', 'Sonia retrouve son ami Karim cinq minutes avant sa conférence.'),
        [['Sonia', 'f'], ['Karim', 'm']],
        [
          [0, 'Ça va, Karim ? Tu as l’air tout pâle devant le rideau.', 'Are you okay, Karim? You look quite pale in front of the curtain.'],
          [1, {
            options: [
              'Franchement, j’ai un trac fou et j’ai la boule au ventre depuis ce matin.',
              'Franchement, je suis sur un nuage parce que j’adore attendre.',
              'Franchement, je tombe des nues devant ce café.',
            ],
            explain: b('Before stepping onto stage, Karim naturally feels avoir le trac and la boule au ventre.', 'Avant de monter sur scène, avoir le trac et la boule au ventre sont les émotions attendues.'),
          }],
          [0, 'C’est normal, respire ! Regarde d’ailleurs qui est venu au premier rang : notre ancienne professeure de Lyon !', 'That’s normal, breathe! Look who came to the front row too: our former teacher from Lyon!'],
          [1, {
            options: [
              'Sans blague ? Je n’en reviens pas ! Ça me redonne tout de suite du courage.',
              'Sans blague ? J’en ai ras le bol de cette salle.',
              'Sans blague ? Elle me casse les pieds quand elle sourit.',
            ],
            explain: b('Je n’en reviens pas expresses warm surprise at seeing their former teacher.', 'Je n’en reviens pas exprime une heureuse surprise.'),
          }],
          [0, 'Allez, c’est à toi, tu vas être parfait !', 'Come on, you’re up, you’re going to be great!'],
        ],
      ),
      dict('Quand la réalisatrice a annoncé la tournée mondiale, tout l’orchestre est tombé des nues.'),
      write(
        b('A roller-coaster day', 'Une journée pleine d’émotions'),
        b('Write 45–85 words about a memorable day (an exam, performance, interview or surprise). Describe how you felt before, during and after using at least three idioms from this course (for example avoir le trac, avoir la boule au ventre, tomber des nues, être aux anges or reprendre du poil de la bête).', 'Racontez en 45 à 85 mots une journée marquante (examen, présentation, entretien ou surprise). Décrivez vos émotions avant, pendant et après en utilisant au moins trois expressions de ce cours (par exemple avoir le trac, avoir la boule au ventre, tomber des nues, être aux anges ou reprendre du poil de la bête).'),
        45,
        85,
        [
          b('Clear progression: before, turning point, outcome', 'Progression claire : avant, tournant, dénouement'),
          b('At least three emotional idioms used naturally', 'Au moins trois expressions employées avec justesse'),
          b('Accurate verb tenses and agreement (e.g. tombé des nues)', 'Temps du passé et accords corrects (ex. tombé des nues)'),
        ],
        'Vendredi matin, avant mon entretien à Bordeaux, j’avais le trac et la boule au ventre dans le train. L’attente devant la porte m’a semblé interminable, puis la directrice m’a souri dès les premières questions et j’ai repris du poil de la bête. Deux heures plus tard, quand elle m’a proposé le poste sur-le-champ, je suis tombé des nues. Ce soir-là, j’étais vraiment aux anges !',
        { phrases: ['J’avais le trac…', 'J’ai repris du poil de la bête…', 'Je suis tombé(e) des nues…', 'J’étais aux anges !'] },
      ),
    ],
    [
      b('avoir le trac (stage fright) and avoir la boule au ventre (knot of dread) name physical anxiety.', 'avoir le trac et avoir la boule au ventre décrivent l’anxiété ressentie dans le corps.'),
      b('avoir le cafard means feeling gloomy or down.', 'avoir le cafard signifie avoir un coup de déprime passager.'),
      b('tomber des nues (with être) and n’en pas revenir express stunned disbelief.', 'tomber des nues (avec être) et n’en pas revenir traduisent la stupeur.'),
    ],
    [
      ['avoir le trac', b('to have stage fright', 'avoir peur avant de parler ou jouer en public')],
      ['avoir la boule au ventre', b('to have a knot in one’s stomach', 'ressentir une forte angoisse')],
      ['avoir le cafard', b('to feel down / have the blues', 'être mélancolique, déprimé')],
      ['tomber des nues', b('to be stunned / floored', 'être extrêmement surpris')],
      ['n’en pas revenir', b('to not get over it, be amazed', 'ne pas pouvoir croire quelque chose')],
    ],
  ),
];

export default lessons;
