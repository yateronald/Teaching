import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'From lending a hand to putting your foot in it, everyday French relies on vivid gestures of the hands, arms, back, and feet. This A2 course teaches 15 practical expressions—including donner un coup de main, baisser les bras, and partir du bon pied—with clear usage notes, listening tasks, dialogues, and guided writing.',
    'Du coup de main donné à un voisin aux pieds mis dans le plat, le français courant regorge de gestes imagés avec les mains, les bras, le dos et les pieds. Ce cours A2 présente 15 expressions essentielles — comme donner un coup de main, baisser les bras et partir du bon pied — avec nuances pratiques, écoutes, dialogues et rédaction guidée.',
  ),
  outcomes: [
    b('Offer help, pitch in, and take charge using main idioms', 'Proposer son aide, participer et prendre les rênes avec la main'),
    b('Describe perseverance, influence, frustration, and warm welcomes with bras and dos idioms', 'Exprimer le courage, l’influence, la lassitude et l’accueil avec bras et dos'),
    b('Talk about tact, fresh starts, enjoyment, and recovery with pied idioms', 'Parler de tact, de bon départ, de plaisir et de rebond avec le pied'),
  ],
};

const C = 'exp-body-hands-feet';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['hands-and-help', 'mains-et-entraide'],
    b('Hands, help & taking charge', 'Mains, entraide et initiative'),
    b('Offer help, pitch in together, praise generosity, or refuse responsibility with five expressions using la main.', 'Proposer son aide, participer à l’effort, saluer la générosité ou décliner une responsabilité avec la main.'),
    [
      b('Distinguish donner un coup de main from mettre la main à la pâte', 'Distinguer donner un coup de main et mettre la main à la pâte'),
      b('Describe generosity and initiative with avoir le cœur sur la main and prendre les choses en main', 'Exprimer générosité et initiative avec avoir le cœur sur la main et prendre les choses en main'),
      b('Express washing one’s hands of an issue with se laver les mains de', 'Exprimer le refus de responsabilité avec se laver les mains de'),
    ],
    13,
    [
      card(
        b('Helping, leading, or stepping back', 'Aider, agir ou se dégager'),
        b(
          'In French, **la main** appears when people help out, take responsibility, or walk away from a problem. Notice which idioms use singular **la main** and which use plural **les mains**.\n\nTeamwork & kindness: **donner un coup de main, mettre la main à la pâte, avoir le cœur sur la main**.\nInitiative vs refusal: **prendre les choses en main, se laver les mains de**.',
          'En français, **la main** sert à offrir son aide, prendre l’initiative ou au contraire refuser toute responsabilité. Observez bien quand **main** reste au singulier ou passe au pluriel.\n\nEntraide et générosité : **donner un coup de main, mettre la main à la pâte, avoir le cœur sur la main**.\nInitiative ou retrait : **prendre les choses en main, se laver les mains de**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal picture', 'Image littérale'), b('Meaning', 'Sens réel')],
            rows: [
              ['donner un coup de main', b('to give a blow of the hand', 'donner un coup de main'), b('to lend a hand, help out', 'aider quelqu’un ponctuellement')],
              ['mettre la main à la pâte', b('put hand in the dough', 'mettre la main dans la pâte'), b('to pitch in, get stuck in', 'participer activement au travail')],
              ['avoir le cœur sur la main', b('have heart on the hand', 'avoir le cœur sur la main'), b('to be big-hearted, generous', 'être très généreux et serviable')],
              ['se laver les mains de', b('to wash one’s hands of', 'se laver les mains de'), b('to wash one’s hands of', 'refuser toute responsabilité')],
              ['prendre les choses en main', b('to take things in hand', 'prendre les affaires en main'), b('to take charge, step up', 'organiser et diriger la suite')],
            ],
          },
          ex: [
            ['Tu peux me donner un coup de main pour porter ces cartons ?', 'Can you give me a hand carrying these boxes?'],
            ['Tout le monde a mis la main à la pâte pour préparer le déménagement.', 'Everyone pitched in to get ready for the move.'],
            ['Comme personne ne décidait rien, Claire a pris les choses en main.', 'Since nobody was deciding anything, Claire took charge.'],
          ],
        },
      ),
      tip(
        b('Singular « la main » vs. plural « les mains »', 'Singulier « la main » ou pluriel « les mains » ?'),
        b(
          'Four of these five idioms keep **main** strictly singular: *un coup de main*, *la main à la pâte*, *le cœur sur la main*, and *en main*. Only **se laver les mains de** takes the plural **les mains**, because you wash both hands when stepping away from a problem: *Je m’en lave les mains !*',
          'Quatre de ces cinq expressions gardent **main** au singulier : *un coup de main*, *la main à la pâte*, *le cœur sur la main* et *en main*. Seule **se laver les mains de** prend le pluriel **les mains**, comme lorsqu’on se lave les deux mains pour dégager sa responsabilité : *Je m’en lave les mains !*',
        ),
      ),
      flash(
        b('Five hand idioms', 'Cinq expressions avec la main'),
        [
          ['donner un coup de main', b('to lend a hand', 'aider quelqu’un')],
          ['mettre la main à la pâte', b('to pitch in and help with the work', 'participer activement à la tâche')],
          ['avoir le cœur sur la main', b('to be very generous and kind', 'être très généreux')],
          ['se laver les mains de', b('to wash one’s hands of', 'refuser toute responsabilité')],
          ['prendre les choses en main', b('to take matters in hand, take charge', 'prendre l’initiative et gérer')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('She is deeply generous and always ready to help others.', 'Elle est très généreuse et toujours prête à aider.'),
          b('She gets nervous whenever she speaks in public.', 'Elle a le trac dès qu’elle parle en public.'),
          b('She works in a hospital as a cardiologist.', 'Elle travaille comme médecin dans un hôpital.'),
          b('She refuses to share anything with neighbours.', 'Elle refuse de prêter ses affaires aux voisins.'),
        ],
        {
          fr: 'Madame Moreau prête volontiers sa voiture et garde nos enfants : elle a vraiment le cœur sur la main.',
          explain: b('« Avoir le cœur sur la main » describes warm, spontaneous generosity.', '« Avoir le cœur sur la main » désigne une grande générosité.'),
        },
      ),
      mc(
        P.complete,
        [
          's’est lavé les mains de',
          'a donné un coup de main à',
          'a mis la main à la pâte pour',
          'a eu le cœur sur la main pour',
        ],
        {
          fr: 'Quand le projet a pris du retard, le fournisseur ___ tout le problème et n’a plus répondu.',
          explain: b('Refusing responsibility and walking away = se laver les mains de.', 'Rejeter toute responsabilité face à un problème = se laver les mains de.'),
        },
      ),
      pairs(
        P.match,
        [
          ['donner un coup de main', b('to lend a hand', 'aider quelqu’un')],
          ['mettre la main à la pâte', b('to pitch in and help with the work', 'participer activement à la tâche')],
          ['avoir le cœur sur la main', b('to be very generous and kind', 'être très généreux')],
          ['se laver les mains de', b('to wash one’s hands of', 'refuser toute responsabilité')],
          ['prendre les choses en main', b('to take matters in hand, take charge', 'prendre l’initiative et gérer')],
        ],
      ),
      gap(
        P.complete,
        'Pour réussir cette fête de quartier, chaque voisin a ___ ! Même le directeur a ___ pour installer les tables.',
        [['mis la main à la pâte'], ['donné un coup de main']],
        {
          choices: [
            ['mis la main à la pâte', 'lavé les mains de', 'baissé les bras'],
            ['donné un coup de main', 'tourné le dos', 'pris son pied'],
          ],
          explain: b('Everyone pitched in (mis la main à la pâte) and the director lent a hand (donné un coup de main).', 'Chacun a participé (mis la main à la pâte) et le directeur a aidé (donné un coup de main).'),
        },
      ),
      hear(
        'Personne ne savait par où commencer après l’orage, alors Émilie a pris les choses en main et appelé les secours.',
        b('What did Émilie do?', 'Qu’a fait Émilie ?'),
        [
          b('She took charge and called for help', 'Elle a pris l’initiative et appelé les secours'),
          b('She washed her hands and left the house', 'Elle s’en est lavé les mains et est partie'),
          b('She waited for someone else to arrive', 'Elle a attendu que quelqu’un d’autre arrive'),
        ],
      ),
      dict('Merci beaucoup de m’avoir donné un coup de main ce matin.'),
      say('Quand tout le monde met la main à la pâte, le travail va vite.', 'When everyone pitches in, the work goes quickly.'),
    ],
    [
      b('donner un coup de main = help out; mettre la main à la pâte = pitch in.', 'donner un coup de main = aider ; mettre la main à la pâte = participer activement.'),
      b('avoir le cœur sur la main = be very generous; prendre les choses en main = take charge.', 'avoir le cœur sur la main = être généreux ; prendre les choses en main = gérer.'),
      b('se laver les mains de = wash one’s hands of (plural mains!).', 'se laver les mains de = décliner toute responsabilité (mains au pluriel !).'),
    ],
    [
      ['donner un coup de main', b('to lend a hand', 'aider quelqu’un')],
      ['mettre la main à la pâte', b('to pitch in and help with the work', 'participer activement à la tâche')],
      ['avoir le cœur sur la main', b('to be very generous and kind', 'être très généreux')],
      ['se laver les mains de', b('to wash one’s hands of', 'refuser toute responsabilité')],
      ['prendre les choses en main', b('to take matters in hand, take charge', 'prendre l’initiative et gérer')],
    ],
  ),

  lesson(
    C,
    2,
    ['arms-and-back', 'bras-et-dos'],
    b('Arms, back & perseverance', 'Bras, dos et persévérance'),
    b('Talk about giving up, having connections, being sick of something, turning away, and welcoming warmly.', 'Parler de découragement, d’influence, de ras-le-bol, de rejet et d’accueil chaleureux avec bras et dos.'),
    [
      b('Contrast giving up (baisser les bras) with welcoming warmly (accueillir à bras ouverts)', 'Opposer le découragement (baisser les bras) à l’accueil chaleureux (accueillir à bras ouverts)'),
      b('Describe influence and fed-up feelings with avoir le bras long and en avoir plein le dos', 'Exprimer influence et lassitude avec avoir le bras long et en avoir plein le dos'),
      b('Use tourner le dos à accurately with indirect objects', 'Employer tourner le dos à avec un complément indirect'),
    ],
    13,
    [
      card(
        b('Arms and back in everyday attitudes', 'Bras et dos dans nos réactions'),
        b(
          'Your posture tells a story in French: dropping your arms means giving up, opening them wide shows warmth, turning your back signals rejection, and carrying too much on your back means you are fed up.\n\nPerseverance & warmth: **baisser les bras, accueillir à bras ouverts**.\nInfluence, rejection & frustration: **avoir le bras long, tourner le dos à, en avoir plein le dos**.',
          'La posture raconte une histoire en français : baisser les bras marque l’abandon, les ouvrir exprime la chaleur, tourner le dos signifie rejeter, et en avoir plein le dos veut dire être excédé.\n\nCourage et accueil : **baisser les bras, accueillir à bras ouverts**.\nInfluence, rejet et ras-le-bol : **avoir le bras long, tourner le dos à, en avoir plein le dos**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens réel'), b('Register / Note', 'Registre / Remarque')],
            rows: [
              ['baisser les bras', b('to give up, throw in the towel', 'abandonner par découragement'), b('everyday neutral', 'courant')],
              ['avoir le bras long', b('to have influence / connections', 'avoir de l’influence, des appuis'), b('singular le bras!', 'le bras au singulier !')],
              ['en avoir plein le dos', b('to be sick and tired of it', 'être excédé, ne plus supporter'), b('informal spoken', 'familier à l’oral')],
              ['tourner le dos à', b('to turn one’s back on', 'rejeter ou abandonner'), b('followed by à + person/thing', 'suivi de à + personne/chose')],
              ['accueillir à bras ouverts', b('to welcome with open arms', 'recevoir avec chaleur'), b('no article before bras', 'sans article devant bras')],
            ],
          },
          ex: [
            ['Même si le concours est difficile, il ne faut jamais baisser les bras.', 'Even if the exam is tough, you must never give up.'],
            ['Son oncle a le bras long dans le monde du théâtre.', 'Her uncle has a lot of pull in the theatre world.'],
            ['À notre arrivée à Lyon, nos amis nous ont accueillis à bras ouverts.', 'When we arrived in Lyon, our friends welcomed us with open arms.'],
          ],
        },
      ),
      trap(
        b('Backache vs. being fed up—and singular vs. plural « bras »', 'Mal de dos ou ras-le-bol ? Et singulier ou pluriel pour « bras » ?'),
        b(
          '**En avoir plein le dos** is an informal idiom meaning *to be thoroughly fed up*—it has nothing to do with physical back pain (*avoir mal au dos*). Notice also the number of arms: **avoir le bras long** is ALWAYS singular (**le bras**), whereas **baisser les bras** and **accueillir à bras ouverts** are ALWAYS plural!\n\nFed up (idiom): **J’en ai plein le dos de ce bruit !**\nPhysical pain: **J’ai mal au dos après le déménagement.**',
          '**En avoir plein le dos** est une expression familière qui signifie *être exaspéré* — rien à voir avec une douleur physique (*avoir mal au dos*). Attention aussi au nombre : **avoir le bras long** est TOUJOURS au singulier (**le bras**), alors que **baisser les bras** et **accueillir à bras ouverts** sont TOUJOURS au pluriel !\n\nExaspération : **J’en ai plein le dos de ce bruit !**\nDouleur physique : **J’ai mal au dos après le déménagement.**',
        ),
      ),
      flash(
        b('Five arm and back idioms', 'Cinq expressions avec les bras et le dos'),
        [
          ['baisser les bras', b('to give up, lose heart', 'abandonner par découragement')],
          ['avoir le bras long', b('to have influence, pull', 'avoir du pouvoir et des relations')],
          ['en avoir plein le dos', b('to be sick and tired of it', 'être complètement excédé')],
          ['tourner le dos à', b('to turn one’s back on', 'abandonner ou rejeter')],
          ['accueillir à bras ouverts', b('to welcome with open arms', 'recevoir très chaleureusement')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('He has strong connections and lots of influence.', 'Il a beaucoup d’influence et des relations utiles.'),
          b('He has very long sleeves on his winter coat.', 'Son manteau d’hiver a des manches trop longues.'),
          b('He reaches high shelves easily without a ladder.', 'Il attrape facilement les livres tout en haut.'),
          b('He always volunteers to carry heavy luggage.', 'Il porte toujours les valises les plus lourdes.'),
        ],
        {
          fr: 'Ce journaliste connaît tous les ministres : on dit qu’il a le bras long.',
          explain: b('« Avoir le bras long » means having influential contacts who can open doors.', '« Avoir le bras long » signifie avoir de l’influence et des appuis.'),
        },
      ),
      mc(
        P.complete,
        [
          'ne baisse pas les bras',
          'en a plein le dos',
          'tourne le dos à',
          'a le bras court',
        ],
        {
          fr: 'Malgré deux refus, Sofia continue de postuler chaque semaine : elle ___ !',
          explain: b('Refusing to quit after rejections = ne pas baisser les bras.', 'Continuer malgré les échecs = ne pas baisser les bras.'),
        },
      ),
      sort(
        b('Sort each expression by attitude.', 'Classez chaque expression selon l’attitude exprimée.'),
        [
          b('Warmth, courage, or influence', 'Accueil, courage ou influence'),
          b('Rejection, quitting, or frustration', 'Rejet, abandon ou lassitude'),
        ],
        [
          ['accueillir à bras ouverts', 0],
          ['baisser les bras', 1],
          ['avoir le bras long', 0],
          ['tourner le dos à', 1],
          ['garder courage', 0],
          ['en avoir plein le dos', 1],
        ],
      ),
      gap(
        P.complete,
        'J’ai beau essayer, ce logiciel plante encore : j’en ai plein le ___ ! Mais mes collègues ne me tournent pas le ___ pour autant.',
        [['dos'], ['dos']],
        {
          tr: 'No matter how hard I try, this software keeps crashing: I’m sick and tired of it! Still, my colleagues aren’t turning their backs on me.',
          hint: b('Both idioms use the French word for “back”.', 'Les deux expressions utilisent le même mot désignant le dos.'),
        },
      ),
      ord(
        P.order,
        'Les habitants du village nous ont accueillis à bras ouverts.',
        {
          tr: 'The village residents welcomed us with open arms.',
          extra: ['dos', 'mains'],
        },
      ),
      hear(
        'Depuis que ses horaires ont changé trois fois ce mois-ci, Julien en a vraiment plein le dos et cherche un autre poste.',
        b('How does Julien feel about his schedule?', 'Que ressent Julien face à ses horaires ?'),
        [
          b('He is thoroughly fed up and looking for a new job', 'Il est exaspéré et cherche un autre travail'),
          b('He has back pain from sitting at his desk', 'Il a mal au dos à cause de sa chaise'),
          b('He welcomes the new schedule warmly', 'Il accepte les nouveaux horaires avec joie'),
        ],
        { voice: 'm' },
      ),
      say('Ne baisse pas les bras, tu es presque au bout de tes efforts !', 'Don’t give up, you’re almost at the end of your efforts!'),
    ],
    [
      b('baisser les bras = give up; accueillir à bras ouverts = welcome warmly.', 'baisser les bras = abandonner ; accueillir à bras ouverts = recevoir avec chaleur.'),
      b('avoir le bras long = have pull/influence (singular bras!).', 'avoir le bras long = avoir des relations influentes (bras au singulier !).'),
      b('en avoir plein le dos = be fed up (informal); tourner le dos à = turn one’s back on.', 'en avoir plein le dos = être excédé ; tourner le dos à = abandonner ou rejeter.'),
    ],
    [
      ['baisser les bras', b('to give up, lose heart', 'abandonner par découragement')],
      ['avoir le bras long', b('to have influence, pull', 'avoir du pouvoir et des relations')],
      ['en avoir plein le dos', b('to be sick and tired of it', 'être complètement excédé')],
      ['tourner le dos à', b('to turn one’s back on', 'abandonner ou rejeter')],
      ['accueillir à bras ouverts', b('to welcome with open arms', 'recevoir très chaleureusement')],
    ],
  ),

  lesson(
    C,
    3,
    ['feet-and-walking', 'pieds-et-pas'],
    b('Treading carefully & starting right', 'Marcher sur des œufs et partir du bon pied'),
    b('Express tact, fresh starts, awkward blunders, pure enjoyment, and landing on your feet with pied idioms.', 'Exprimer la prudence, un bon départ, une gaffe, un grand plaisir et la capacité de rebondir.'),
    [
      b('Contrast careful diplomacy (marcher sur des œufs) with social blunders (mettre les pieds dans le plat)', 'Opposer la prudence (marcher sur des œufs) à la gaffe (mettre les pieds dans le plat)'),
      b('Use partir du bon pied and retomber sur ses pieds for starts and recoveries', 'Employer partir du bon pied et retomber sur ses pieds pour les départs et les rebonds'),
      b('Recognise the informal register of prendre son pied', 'Identifier le registre familier de prendre son pied'),
    ],
    13,
    [
      card(
        b('Every step tells a story', 'Chaque pas raconte une situation'),
        b(
          'Feet idioms describe how smoothly—or clumsily!—you move through social situations, new beginnings, hobbies, and setbacks.\n\nCare & blunders: **marcher sur des œufs, mettre les pieds dans le plat**.\nMomentum & joy: **partir du bon pied, retomber sur ses pieds, prendre son pied**.',
          'Les expressions avec le pied décrivent la délicatesse — ou la maladresse ! — dans les échanges, les débuts, les passions et les imprévus.\n\nPrudence et gaffe : **marcher sur des œufs, mettre les pieds dans le plat**.\nÉlan et plaisir : **partir du bon pied, retomber sur ses pieds, prendre son pied**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal picture', 'Image littérale'), b('Meaning', 'Sens réel')],
            rows: [
              ['marcher sur des œufs', b('to walk on eggs', 'marcher sur des œufs'), b('to tread very carefully', 'agir avec une extrême prudence')],
              ['partir du bon pied', b('leave on the right foot', 'démarrer du bon pied'), b('get off on the right foot', 'bien commencer quelque chose')],
              ['mettre les pieds dans le plat', b('put feet in the dish', 'mettre les pieds dans le plat'), b('to put one’s foot in it', 'faire une gaffe, manquer de tact')],
              ['prendre son pied', b('take one’s foot', 'prendre son pied'), b('to have a blast (informal)', 'éprouver un grand plaisir (familier)')],
              ['retomber sur ses pieds', b('land back on one’s feet', 'retomber sur ses pieds'), b('to land on one’s feet', 'se tirer habilement d’un souci')],
            ],
          },
          ex: [
            ['Sur ce sujet sensible, tout le monde marche sur des œufs.', 'On this sensitive topic, everyone is walking on eggshells.'],
            ['J’ai mis les pieds dans le plat en demandant quand elle partait à la retraite !', 'I put my foot in it by asking when she was retiring!'],
            ['Malgré la perte de son contrat, il est vite retombé sur ses pieds.', 'Despite losing his contract, he quickly landed back on his feet.'],
          ],
        },
      ),
      culture(
        b('Watch the register of « prendre son pied »', 'Attention au registre de « prendre son pied »'),
        b(
          '**Prendre son pied** originally came from 18th-century pirates sharing booty measured by the "foot"—and today in casual speech it means *to have a fantastic time* (at a concert, skiing, cooking). Keep it for friends and informal chats; in formal work or exam writing, prefer **se régaler** or **prendre beaucoup de plaisir**!',
          '**Prendre son pied** viendrait du partage du butin mesuré « au pied » — aujourd’hui, à l’oral familier, l’expression veut dire *s’amuser énormément* (à un concert, au ski, en cuisinant). Réservez-la aux amis : dans un contexte formel ou un examen, préférez **prendre beaucoup de plaisir** !',
        ),
      ),
      mc(
        P.meaning,
        [
          b('She accidentally brought up an awkward, tactless topic.', 'Elle a abordé maladroitement un sujet gênant sans s’en rendre compte.'),
          b('She dropped a heavy tray of dishes in the kitchen.', 'Elle a fait tomber un grand plat dans la cuisine.'),
          b('She started dancing barefoot in the living room.', 'Elle s’est mise à danser pieds nus dans le salon.'),
          b('She refused to taste the chef’s main course.', 'Elle a refusé de goûter le plat du chef.'),
        ],
        {
          fr: 'Sans le savoir, Léa a mis les pieds dans le plat devant tous les invités.',
          explain: b('« Mettre les pieds dans le plat » means making a tactless blunder.', '« Mettre les pieds dans le plat » signifie faire une gaffe en société.'),
        },
      ),
      pairs(
        P.match,
        [
          ['marcher sur des œufs', b('to walk on eggshells, tread carefully', 'agir avec beaucoup de prudence')],
          ['partir du bon pied', b('to get off on the right foot', 'commencer dans de bonnes conditions')],
          ['mettre les pieds dans le plat', b('to put one’s foot in it, blunder', 'faire une gaffe par manque de tact')],
          ['prendre son pied', b('to have a blast, enjoy greatly (informal)', 'éprouver un grand plaisir (familier)')],
          ['retomber sur ses pieds', b('to land on one’s feet, bounce back', 'se tirer habilement d’un mauvais pas')],
        ],
      ),
      hear(
        'Le premier jour du stage s’est passé à merveille : toute l’équipe est partie du bon pied !',
        b('How did the internship start?', 'Comment le stage a-t-il commencé ?'),
        [
          b('Everything started very well for the whole team', 'Tout a très bien commencé pour toute l’équipe'),
          b('Someone made a clumsy blunder on day one', 'Quelqu’un a fait une gaffe dès le premier jour'),
          b('They walked slowly because of slippery floors', 'Ils ont marché lentement à cause du sol glissant'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('After a tricky family dinner', 'Après un dîner de famille délicat'),
        b('Manon and Karim talk about last night’s dinner and their weekend plan.', 'Manon et Karim reviennent sur le dîner d’hier et parlent de leur week-end.'),
        [['Manon', 'f2'], ['Karim', 'm2']],
        [
          [0, 'Franchement, pendant tout le repas d’hier, j’avais l’impression de marcher sur des œufs avec ton oncle.', 'Honestly, during the whole meal yesterday, I felt like I was walking on eggshells with your uncle.'],
          [1, {
            options: [
              'C’est vrai qu’il est susceptible, mais tu es bien retombée sur tes pieds quand il a parlé de politique !',
              'C’est vrai, il a mis les œufs dans le plat toute la soirée.',
              'Oui, il a pris son pied en arrivant en retard.',
            ],
            explain: b('Skillfully getting out of an awkward moment = retomber sur ses pieds.', 'Se sortir habilement d’une situation délicate = retomber sur ses pieds.'),
          }],
          [0, 'Ouf, j’avais tellement peur de mettre les pieds dans le plat devant lui.', 'Phew, I was so afraid of putting my foot in it in front of him.'],
          [1, {
            options: [
              'Pas du tout ! Allez, oublions ça : demain au concert de jazz, on va vraiment prendre notre pied !',
              'Pas du tout ! Demain au concert, on va tourner le dos au chanteur !',
              'Dommage ! Demain on va baisser les bras pendant le spectacle.',
            ],
            explain: b('Having an amazing time at a concert = prendre son pied.', 'Prendre un grand plaisir entre amis = prendre son pied.'),
          }],
          [0, 'Tu as raison, ça va nous faire partir du bon pied pour la semaine !', 'You’re right, that’ll help us start the week off on the right foot!'],
        ],
      ),
      dict('Il faut marcher sur des œufs quand on aborde ce sujet délicat.'),
      write(
        b('A blunder or a fresh start', 'Une gaffe ou un nouveau départ'),
        b('Write 30 to 60 words about starting a new activity, handling an awkward moment, or bouncing back from a problem. Use at least two idioms from this course.', 'Écrivez 30 à 60 mots sur le début d’une activité, un moment délicat ou un rebond après un souci. Employez au moins deux expressions de ce cours.'),
        30,
        60,
        [
          b('At least two hand, arm, back, or foot idioms', 'Au moins deux expressions de ce cours'),
          b('Consistent tense and pronouns', 'Temps et pronoms cohérents'),
          b('Natural tone matching the register', 'Ton naturel adapté au registre'),
        ],
        'Le jour de mon arrivée dans ce nouveau club, j’ai voulu partir du bon pied. Malheureusement, j’ai mis les pieds dans le plat en critiquant le choix de la salle ! Un membre sympa m’a donné un coup de main pour changer de sujet, et je suis vite retombé sur mes pieds.',
        { phrases: ['partir du bon pied', 'mis les pieds dans le plat', 'retombé sur mes pieds'] },
      ),
    ],
    [
      b('marcher sur des œufs = tread carefully; mettre les pieds dans le plat = make a blunder.', 'marcher sur des œufs = être très prudent ; mettre les pieds dans le plat = faire une gaffe.'),
      b('partir du bon pied = start off well; retomber sur ses pieds = recover gracefully.', 'partir du bon pied = bien démarrer ; retomber sur ses pieds = rebondir habilement.'),
      b('prendre son pied = have a great time (informal only).', 'prendre son pied = éprouver un grand plaisir (registre familier).'),
    ],
    [
      ['marcher sur des œufs', b('to walk on eggshells, tread carefully', 'agir avec beaucoup de prudence')],
      ['partir du bon pied', b('to get off on the right foot', 'commencer dans de bonnes conditions')],
      ['mettre les pieds dans le plat', b('to put one’s foot in it, blunder', 'faire une gaffe par manque de tact')],
      ['prendre son pied', b('to have a blast, enjoy greatly (informal)', 'éprouver un grand plaisir (familier)')],
      ['retomber sur ses pieds', b('to land on one’s feet, bounce back', 'se tirer habilement d’un mauvais pas')],
    ],
  ),
];

export default lessons;
