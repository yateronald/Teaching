import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Cats, dogs, rabbits, hens, foxes, and elephants populate everyday French conversation. At B1, mastering animal idioms lets you tell someone they stood you up, jump smoothly back to the main topic, spot evasion, or refuse to blow a minor glitch out of proportion. Learn 15 essential animal expressions through realistic dialogues, nuance traps, and guided practice.',
    'Chats, chiens, lapins, poules, renards et éléphants peuplent les conversations en français. Au niveau B1, ces 15 expressions animalières vous permettent de réagir à un rendez-vous manqué, de recentrer une discussion, de repérer une esquive ou de relativiser un incident. Entraînez-vous avec des dialogues réalistes, des pièges commentés et des productions guidées.',
  ),
  outcomes: [
    b('Use classic cat, dog, and elephant idioms accurately in everyday speech', 'Employer avec justesse les expressions de chats, chiens et éléphants à l’oral'),
    b('Express missed meetings, impossibility, evasion, and cunning with farm and wild animals', 'Exprimer lapins, impossibilité, fuite et ruse avec les animaux de la ferme et des bois'),
    b('Manage priorities, refocus debates, and avoid exaggeration with B1 animal metaphors', 'Gérer les priorités, recentrer un échange et éviter d’exagérer grâce aux images animalières'),
  ],
};

const C = 'exp-animals-wild-farm';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['cats-dogs-and-elephants', 'chats-chiens-et-elephants'],
    b('Cats, dogs & elephant memory', 'Langue au chat, chien et chat, mémoire d’éléphant'),
    b('Give up on riddles, clear your hoarse voice, speak bluntly, describe rivalry, and praise a sharp memory.', 'Abandonner une devinette, parler de voix enrouée, de franchise, de disputes et de mémoire fidèle.'),
    [
      b('Tell apart the three cat expressions: langue au chat, chat dans la gorge, appeler un chat un chat', 'Distinguer les trois expressions avec chat : langue au chat, chat dans la gorge, appeler un chat un chat'),
      b('Describe constant quarrelling with s’entendre comme chien et chat', 'Décrire des disputes continuelles avec s’entendre comme chien et chat'),
      b('Praise remarkable recall with avoir une mémoire d’éléphant', 'Saluer une mémoire exceptionnelle avec avoir une mémoire d’éléphant'),
    ],
    13,
    [
      card(
        b('Same animal, totally different meanings!', 'Même animal, sens tout à fait différents !'),
        b(
          'In French, the word **chat** appears in idioms that have nothing in common—from riddles and sore throats to blunt honesty. Pair them carefully with **chien** and **éléphant**.\n\nVoice & riddles: **avoir un chat dans la gorge, donner sa langue au chat**.\nHonesty, rivalry & recall: **appeler un chat un chat, s’entendre comme chien et chat, avoir une mémoire d’éléphant**.',
          'En français, le mot **chat** entre dans des expressions très différentes — de la devinette à la gorge enrouée ou à la franchise directe. Retenez-les bien avec **chien** et **éléphant**.\n\nVoix et devinette : **avoir un chat dans la gorge, donner sa langue au chat**.\nFranchise, dispute et mémoire : **appeler un chat un chat, s’entendre comme chien et chat, avoir une mémoire d’éléphant**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal picture', 'Image littérale'), b('Meaning', 'Sens réel')],
            rows: [
              ['donner sa langue au chat', b('give one’s tongue to the cat', 'donner sa langue au chat'), b('to give up guessing', 'renoncer à deviner et demander la réponse')],
              ['avoir un chat dans la gorge', b('have a cat in the throat', 'avoir un chat dans la gorge'), b('to have a frog in one’s throat', 'avoir la voix enrouée')],
              ['appeler un chat un chat', b('to call a cat a cat', 'nommer les choses sans détour'), b('to call a spade a spade', 'parler franchement, sans euphémisme')],
              ['s’entendre comme chien et chat', b('get along like dog and cat', 's’entendre comme chien et chat'), b('to fight like cats and dogs', 'se disputer sans cesse')],
              ['avoir une mémoire d’éléphant', b('have an elephant’s memory', 'avoir la mémoire d’un éléphant'), b('to have a memory like an elephant', 'tout retenir dans les moindres détails')],
            ],
          },
          ex: [
            ['Je ne trouve vraiment pas la réponse à ton énigme : je donne ma langue au chat !', 'I really can’t find the answer to your riddle: I give up!'],
            ['Appelons un chat un chat : ce nouveau logiciel nous fait perdre du temps.', 'Let’s call a spade a spade: this new software is wasting our time.'],
            ['Mon grand-père se souvient de chaque date depuis cinquante ans : il a une mémoire d’éléphant.', 'My grandfather remembers every date for the past fifty years: he has a memory like an elephant.'],
          ],
        },
      ),
      tip(
        b('Watch articles and false friends across languages', 'Attention aux articles et aux faux amis entre langues'),
        b(
          'English speakers have a "frog in the throat", while French speakers ALWAYS have **un chat dans la gorge**—never *une grenouille*! Notice also that **s’entendre comme chien et chat** drops the articles (*un/le*) before *chien* and *chat*, and that **s’entendre** here is ironic ("get along badly"). Finally, **donner sa langue au chat** is used ONLY when giving up on a question or riddle—never for quitting a task.',
          'En anglais on a une grenouille dans la gorge, mais en français on a TOUJOURS **un chat dans la gorge** — jamais *une grenouille* ! Remarquez aussi que **s’entendre comme chien et chat** n’a pas d’article devant *chien* ni *chat*. Enfin, **donner sa langue au chat** s’emploie uniquement quand on ne trouve pas la réponse à une question ou une énigme.',
        ),
      ),
      flash(
        b('Five cat, dog and elephant idioms', 'Cinq expressions de chats, chiens et éléphants'),
        [
          ['donner sa langue au chat', b('to give up guessing (a riddle or question)', 'renoncer à deviner')],
          ['avoir un chat dans la gorge', b('to have a frog in one’s throat (hoarse voice)', 'avoir la voix enrouée')],
          ['appeler un chat un chat', b('to call a spade a spade, speak bluntly', 'dire les choses franchement')],
          ['s’entendre comme chien et chat', b('to fight like cats and dogs', 'se disputer constamment')],
          ['avoir une mémoire d’éléphant', b('to have an amazing memory', 'se souvenir de tout avec précision')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('She wants to speak frankly without sugar-coating the issue.', 'Elle veut dire la vérité franchement, sans détour.'),
          b('She loves adopting stray cats from the neighbourhood.', 'Elle aime adopter des chats errants dans le quartier.'),
          b('She refuses to answer any personal questions.', 'Elle refuse de répondre aux questions personnelles.'),
          b('She whispers quietly so nobody can hear her.', 'Elle chuchote pour que personne ne l’entende.'),
        ],
        {
          fr: 'Écoutez, appelons un chat un chat : le délai est impossible à tenir avec deux personnes.',
          explain: b('« Appeler un chat un chat » means calling things by their true name without hiding behind polite phrases.', '« Appeler un chat un chat » signifie parler avec franchise et netteté.'),
        },
      ),
      mc(
        P.complete,
        [
          'donne ma langue au chat',
          'ai un chat dans la gorge',
          'm’entends comme chien et chat',
          'appelle un chat un chat',
        ],
        {
          fr: 'J’ai réfléchi pendant cinq minutes à ta devinette, mais impossible de trouver : je ___ !',
          explain: b('Giving up on guessing a riddle = donner sa langue au chat.', 'Abandonner une devinette = donner sa langue au chat.'),
        },
      ),
      pairs(
        P.match,
        [
          ['donner sa langue au chat', b('to give up guessing (a riddle or question)', 'renoncer à deviner')],
          ['avoir un chat dans la gorge', b('to have a frog in one’s throat (hoarse voice)', 'avoir la voix enrouée')],
          ['appeler un chat un chat', b('to call a spade a spade, speak bluntly', 'dire les choses franchement')],
          ['s’entendre comme chien et chat', b('to fight like cats and dogs', 'se disputer constamment')],
          ['avoir une mémoire d’éléphant', b('to have an amazing memory', 'se souvenir de tout avec précision')],
        ],
      ),
      gap(
        P.complete,
        'Nos deux collègues ___ toute la journée au bureau ! Par contre, dès qu’il s’agit des dossiers de l’an dernier, Léa ___ et retrouve tout en deux secondes.',
        [['s’entendent comme chien et chat'], ['a une mémoire d’éléphant']],
        {
          choices: [
            ['s’entendent comme chien et chat', 'donnent leur langue au chat', 'appellent un chat un chat'],
            ['a une mémoire d’éléphant', 'a un chat dans la gorge', 'met les pieds dans le plat'],
          ],
          explain: b('Arguing constantly = s’entendre comme chien et chat; remembering every past detail = avoir une mémoire d’éléphant.', 'Se disputer sans cesse = s’entendre comme chien et chat ; tout retenir = avoir une mémoire d’éléphant.'),
        },
      ),
      hear(
        'Excusez-moi si ma voix semble un peu rauque ce matin : j’ai un chat dans la gorge depuis mon rhume d’hier.',
        b('Why does the speaker apologize?', 'Pourquoi la personne s’excuse-t-elle ?'),
        [
          b('Her voice is hoarse after catching a cold', 'Sa voix est enrouée à cause d’un rhume'),
          b('Her cat keeps interrupting the meeting', 'Son chat interrompt la réunion'),
          b('She forgot her notes at home yesterday', 'Elle a oublié ses notes chez elle hier'),
        ],
      ),
      dict('Mes deux cousins s’entendent comme chien et chat depuis l’enfance.'),
      say('Je ne trouve pas la réponse : je donne ma langue au chat !', 'I can’t find the answer: I give up!'),
    ],
    [
      b('donner sa langue au chat = give up guessing; avoir un chat dans la gorge = have a hoarse voice.', 'donner sa langue au chat = abandonner une énigme ; avoir un chat dans la gorge = être enroué.'),
      b('appeler un chat un chat = call a spade a spade; s’entendre comme chien et chat = fight constantly.', 'appeler un chat un chat = parler franchement ; s’entendre comme chien et chat = se disputer sans cesse.'),
      b('avoir une mémoire d’éléphant = remember everything in detail.', 'avoir une mémoire d’éléphant = avoir une excellente mémoire.'),
    ],
    [
      ['donner sa langue au chat', b('to give up guessing (a riddle or question)', 'renoncer à deviner')],
      ['avoir un chat dans la gorge', b('to have a frog in one’s throat (hoarse voice)', 'avoir la voix enrouée')],
      ['appeler un chat un chat', b('to call a spade a spade, speak bluntly', 'dire les choses franchement')],
      ['s’entendre comme chien et chat', b('to fight like cats and dogs', 'se disputer constamment')],
      ['avoir une mémoire d’éléphant', b('to have an amazing memory', 'se souvenir de tout avec précision')],
    ],
  ),

  lesson(
    C,
    2,
    ['farm-and-forest', 'ferme-et-foret'],
    b('Rabbits, hens & clever foxes', 'Poser un lapin, coq à l’âne et autruche'),
    b('React when someone stands you up, refuses reality, jumps between topics, or acts sly as a fox.', 'Réagir à un rendez-vous manqué, au déni, aux sauts de sujet et à la ruse.'),
    [
      b('Use poser un lapin (à quelqu’un) accurately with indirect pronouns', 'Employer poser un lapin (à quelqu’un) avec le bon pronom indirect'),
      b('Contrast refusal to face reality (faire l’autruche) with impossible promises (quand les poules auront des dents)', 'Opposer le déni (faire l’autruche) et l’impossible (quand les poules auront des dents)'),
      b('Describe topic-hopping (passer du coq à l’âne) and cleverness (être rusé comme un renard)', 'Décrire les changements de sujet (passer du coq à l’âne) et la ruse (être rusé comme un renard)'),
    ],
    13,
    [
      card(
        b('Five vivid idioms from farm and forest', 'Cinq expressions de la ferme et des bois'),
        b(
          'These five B1 expressions paint lively scenes: standing someone up at a café, promising something for "when hens grow teeth", leaping from rooster to donkey in conversation, hiding your head like an ostrich, and outsmarting everyone like a fox.\n\nDisappointment & denial: **poser un lapin, faire l’autruche, quand les poules auront des dents**.\nSpeech & wit: **passer du coq à l’âne, être rusé comme un renard**.',
          'Ces cinq expressions B1 évoquent des scènes vivantes : un rendez-vous oublié, une promesse impossible, une conversation qui saute d’un sujet à l’autre, un refus de voir la vérité et une ruse maligne.\n\nDéception et déni : **poser un lapin, faire l’autruche, quand les poules auront des dents**.\nPropos et ruse : **passer du coq à l’âne, être rusé comme un renard**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens réel'), b('Example', 'Exemple')],
            rows: [
              ['poser un lapin', b('to stand someone up', 'ne pas venir à un rendez-vous sans prévenir'), 'Il m’a posé un lapin devant le cinéma.'],
              ['quand les poules auront des dents', b('when pigs fly (never!)', 'jamais de la vie'), 'Il rangera son bureau quand les poules auront des dents.'],
              ['passer du coq à l’âne', b('jump from topic to topic', 'changer brusquement de sujet sans lien'), 'Pendant le dîner, elle passe du coq à l’âne.'],
              ['faire l’autruche', b('bury one’s head in the sand', 'refuser de voir une réalité gênante'), 'Ignorer cette facture, c’est faire l’autruche.'],
              ['être rusé comme un renard', b('be as sly as a fox', 'être très malin et astucieux'), 'Cet avocat est rusé comme un renard.'],
            ],
          },
          ex: [
            ['J’ai attendu Marc quarante minutes au café : il m’a posé un lapin !', 'I waited for Marc for forty minutes at the café: he stood me up!'],
            ['Arrêtons de faire l’autruche : les chiffres du trimestre montrent un vrai problème.', 'Let’s stop burying our heads in the sand: this quarter’s numbers show a real issue.'],
            ['Difficile de suivre son discours, il passe sans arrêt du coq à l’âne.', 'His speech is hard to follow—he keeps jumping from one topic to another.'],
          ],
        },
      ),
      trap(
        b('Watch « poser un lapin à quelqu’un » and adjective agreement', 'Attention à « poser un lapin à quelqu’un » et aux accords'),
        b(
          'Who did someone stand up? Use the **indirect object pronoun** (**me, te, lui, nous, vous, leur**) before the verb: **Il m’a posé un lapin** (*He stood me up*), **Elle leur a posé un lapin** (*She stood them up*). Also, in **être rusé comme un renard**, **rusé(e)** agrees with the person—*Elle est rusée comme un renard*—while *un renard* stays masculine.',
          'Avec **poser un lapin**, la personne attendue est un complément indirect (**à quelqu’un**) : dites **Il m’a posé un lapin**, **Elle lui a posé un lapin**. De plus, dans **être rusé(e) comme un renard**, l’adjectif s’accorde avec le sujet (*Elle est rusée comme un renard*), alors que *un renard* ne change pas.',
        ),
      ),
      flash(
        b('Five farm and forest idioms', 'Cinq expressions de la ferme et des bois'),
        [
          ['poser un lapin', b('to stand someone up', 'ne pas venir à un rendez-vous')],
          ['quand les poules auront des dents', b('when pigs fly, never', 'jamais')],
          ['passer du coq à l’âne', b('to jump abruptly from one topic to another', 'changer de sujet sans transition')],
          ['faire l’autruche', b('to bury one’s head in the sand', 'refuser de voir la réalité')],
          ['être rusé comme un renard', b('to be as sly as a fox', 'être très malin et habile')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('He refuses to acknowledge an obvious problem.', 'Il refuse d’affronter un problème pourtant évident.'),
          b('He runs very fast to catch the last train.', 'Il court très vite pour attraper le dernier train.'),
          b('He watches wildlife documentaries every Sunday.', 'Il regarde des documentaires animaliers le dimanche.'),
          b('He talks to everyone about his holiday plans.', 'Il raconte ses projets de vacances à tout le monde.'),
        ],
        {
          fr: 'Au lieu de vérifier son budget, Léo préfère faire l’autruche.',
          explain: b('« Faire l’autruche » means ignoring an unpleasant truth instead of facing it.', '« Faire l’autruche » signifie fermer volontairement les yeux devant un problème.'),
        },
      ),
      mc(
        P.complete,
        [
          'quand les poules auront des dents',
          'comme chien et chat',
          'du coq à l’âne',
          'dans les pommes',
        ],
        {
          fr: 'Lui, arriver avec dix minutes d’avance ? Oui, ___ !',
          explain: b('Saying ironically that something will never happen = quand les poules auront des dents.', 'Dire avec ironie que quelque chose n’arrivera jamais = quand les poules auront des dents.'),
        },
      ),
      sort(
        b('Sort each expression by what it describes.', 'Classez chaque expression selon la situation décrite.'),
        [
          b('Avoiding reality, absence, or impossibility', 'Fuite, absence ou impossibilité'),
          b('How someone speaks or thinks', 'Façon de parler ou d’agir'),
        ],
        [
          ['poser un lapin', 0],
          ['passer du coq à l’âne', 1],
          ['faire l’autruche', 0],
          ['être rusé comme un renard', 1],
          ['quand les poules auront des dents', 0],
          ['appeler un chat un chat', 1],
        ],
      ),
      gap(
        P.complete,
        'Je devais déjeuner avec Karim, mais il m’a ___ un lapin ! En plus, hier en réunion, il passait du ___ à l’âne pour éviter mes questions.',
        [['posé'], ['coq']],
        {
          tr: 'I was supposed to have lunch with Karim, but he stood me up! Plus, yesterday in the meeting, he kept jumping from topic to topic to dodge my questions.',
          hint: b('Past participle of “poser” in the first blank; “rooster” in the second.', 'Participe passé de « poser » dans le premier trou ; le nom masculin pour « rooster » dans le second.'),
        },
      ),
      ord(
        P.order,
        'Mon collègue passe toujours du coq à l’âne.',
        {
          tr: 'My colleague always jumps from one topic to another.',
          extra: ['lapin', 'renard'],
        },
      ),
      hear(
        'Personne n’avait compris comment Claire a négocié un tarif aussi bas, mais elle est rusée comme un renard !',
        b('What does the speaker say about Claire?', 'Que dit la personne au sujet de Claire ?'),
        [
          b('She is very clever and shrewd in negotiation', 'Elle est très maligne et habile en négociation'),
          b('She arrived late and stood the client up', 'Elle est arrivée en retard et a posé un lapin'),
          b('She refused to look at the contract terms', 'Elle a refusé de lire les conditions du contrat'),
        ],
        { voice: 'm' },
      ),
      say('Il m’a encore posé un lapin hier soir devant la gare.', 'He stood me up again last night in front of the station.'),
    ],
    [
      b('poser un lapin à quelqu’un = stand someone up; faire l’autruche = bury your head in the sand.', 'poser un lapin à quelqu’un = manquer un rendez-vous ; faire l’autruche = nier un problème.'),
      b('quand les poules auront des dents = when pigs fly (never).', 'quand les poules auront des dents = jamais.'),
      b('passer du coq à l’âne = jump between unrelated topics; être rusé comme un renard = be sly/clever.', 'passer du coq à l’âne = changer sans cesse de sujet ; être rusé comme un renard = être malin.'),
    ],
    [
      ['poser un lapin', b('to stand someone up', 'ne pas venir à un rendez-vous')],
      ['quand les poules auront des dents', b('when pigs fly, never', 'jamais')],
      ['passer du coq à l’âne', b('to jump abruptly from one topic to another', 'changer de sujet sans transition')],
      ['faire l’autruche', b('to bury one’s head in the sand', 'refuser de voir la réalité')],
      ['être rusé comme un renard', b('to be as sly as a fox', 'être très malin et habile')],
    ],
  ),

  lesson(
    C,
    3,
    ['wild-instincts-and-focus', 'instincts-et-priorites'],
    b('Priorities, evasion & exaggerations', 'Autres chats à fouetter et revenir à ses moutons'),
    b('Set priorities, spot someone muddying the waters, calm exaggeration, return to the point, and describe empty places.', 'Gérer ses priorités, repérer une esquive, relativiser, recentrer un débat et décrire un lieu désert.'),
    [
      b('Express urgent priorities and empty rooms with avoir d’autres chats à fouetter and il n’y a pas un chat', 'Exprimer urgences et lieux vides avec avoir d’autres chats à fouetter et il n’y a pas un chat'),
      b('Call out evasion and overreaction with noyer le poisson and faire d’une mouche un éléphant', 'Dénoncer l’esquive et l’exagération avec noyer le poisson et faire d’une mouche un éléphant'),
      b('Bring a conversation back on track with revenir à ses moutons', 'Recentrer une discussion avec revenir à ses moutons'),
    ],
    13,
    [
      card(
        b('Keeping focus when conversations wander', 'Garder le cap quand le débat s’égare'),
        b(
          'In meetings, debates, and daily chats, these five B1 idioms let you refocus the conversation, spot someone dodging a question, dismiss trivial drama, or describe an empty street.\n\nFocus & priorities: **avoir d’autres chats à fouetter, revenir à ses moutons**.\nEvasion, exaggeration & emptiness: **noyer le poisson, faire d’une mouche un éléphant, il n’y a pas un chat**.',
          'Dans une réunion, un débat ou un échange quotidien, ces cinq expressions B1 permettent de recentrer le propos, repérer une manœuvre dilatoire, relativiser ou décrire un lieu désert.\n\nPriorités et fil rouge : **avoir d’autres chats à fouetter, revenir à ses moutons**.\nEsquive, exagération et vide : **noyer le poisson, faire d’une mouche un éléphant, il n’y a pas un chat**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens réel'), b('Example', 'Exemple')],
            rows: [
              ['avoir d’autres chats à fouetter', b('have bigger fish to fry', 'avoir des tâches bien plus urgentes'), 'J’ai d’autres chats à fouetter aujourd’hui.'],
              ['noyer le poisson', b('to muddy the waters, dodge', 'embrouiller pour éviter une réponse'), 'Il noie le poisson devant les journalistes.'],
              ['faire d’une mouche un éléphant', b('make a mountain out of a molehill', 'exagérer un détail minuscule'), 'Ne fais pas d’une mouche un éléphant !'],
              ['revenir à ses moutons', b('get back to the point', 'reprendre le sujet principal'), 'Bref, revenons à nos moutons !'],
              ['il n’y a pas un chat', b('there isn’t a soul around', 'il n’y a absolument personne'), 'À huit heures, il n’y avait pas un chat dans la rue.'],
            ],
          },
          ex: [
            ['Ne me parle pas de la couleur des chaises : j’ai d’autres chats à fouetter avant le salon !', 'Don’t talk to me about the colour of the chairs: I have bigger fish to fry before the trade fair!'],
            ['Chaque fois qu’on parle du budget, le directeur essaie de noyer le poisson.', 'Every time we mention the budget, the director tries to muddy the waters.'],
            ['Bon, la pause est finie : revenons à nos moutons et terminons ce rapport.', 'Right, break’s over: let’s get back to our subject and finish this report.'],
          ],
        },
      ),
      culture(
        b('From a 15th-century farce to today’s meetings', 'D’une farce médiévale aux réunions d’aujourd’hui'),
        b(
          'Why **revenir à ses moutons**? In the famous 15th-century French comedy *La Farce de Maître Pathelin*, a cloth merchant in court kept drifting onto stolen fabric instead of his missing sheep, until the judge cried out: *« Revenons à nos moutons ! »* Today it is still the politest, liveliest way to bring a wandering meeting back on track—often right after someone **passe du coq à l’âne** or **noie le poisson**.',
          'Pourquoi **revenir à ses moutons** ? Dans la célèbre pièce médiévale *La Farce de Maître Pathelin*, un drapier s’égarait devant le tribunal et le juge l’interrompait : *« Revenons à nos moutons ! »* Aujourd’hui encore, c’est la façon la plus naturelle de recentrer une réunion quand quelqu’un **passe du coq à l’âne** ou **noie le poisson**.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('He is talking around the question to avoid giving a clear answer.', 'Il multiplie les détails flous pour éviter de répondre clairement.'),
          b('He spends his weekend fishing by the river.', 'Il passe son week-end à pêcher au bord de la rivière.'),
          b('He always gives direct, concise answers.', 'Il donne toujours des réponses directes et brèves.'),
          b('He forgot to feed his pets before leaving.', 'Il a oublié de nourrir ses animaux avant de partir.'),
        ],
        {
          fr: 'Quand on lui demande le coût exact des travaux, l’entrepreneur noie le poisson.',
          explain: b('« Noyer le poisson » means muddying the waters to evade a clear answer.', '« Noyer le poisson » signifie embrouiller son interlocuteur pour éluder une question.'),
        },
      ),
      pairs(
        P.match,
        [
          ['avoir d’autres chats à fouetter', b('to have bigger fish to fry', 'avoir des urgences plus importantes')],
          ['noyer le poisson', b('to muddy the waters, evade the point', 'embrouiller pour éviter de répondre')],
          ['faire d’une mouche un éléphant', b('to make a mountain out of a molehill', 'exagérer un petit incident')],
          ['revenir à ses moutons', b('to get back to the subject', 'reprendre le sujet principal')],
          ['il n’y a pas un chat', b('there is not a single soul around', 'il n’y a absolument personne')],
        ],
      ),
      hear(
        'Je suis arrivé au bureau à sept heures ce matin : il n’y avait pas un chat dans les couloirs ni dans le métro.',
        b('What was the office and metro like at seven a.m.?', 'Comment étaient le bureau et le métro à sept heures du matin ?'),
        [
          b('Completely empty, with nobody around', 'Complètement vides, sans personne'),
          b('Full of noisy commuters and pets', 'Remplis de voyageurs pressés'),
          b('Closed for emergency cleaning', 'Fermés pour nettoyage d’urgence'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Steering a committee meeting', 'Recadrer une réunion d’association'),
        b('Sophie and Antoine discuss why the budget meeting went off course.', 'Sophie et Antoine commentent une réunion qui a failli déraper.'),
        [['Sophie', 'f2'], ['Antoine', 'm2']],
        [
          [0, 'Tu as vu comme Paul a essayé de noyer le poisson quand on a parlé des factures en retard ?', 'Did you see how Paul tried to muddy the waters when we brought up the overdue bills?'],
          [1, {
            options: [
              'Oui, et en plus Julie a fait d’une mouche un éléphant à propos de la couleur des affiches !',
              'Oui, Julie a donné sa langue au chat devant les affiches.',
              'C’est normal, il n’y avait pas un chat au téléphone.',
            ],
            explain: b('Blowing a minor poster detail out of proportion = faire d’une mouche un éléphant.', 'Exagérer un détail minuscule = faire d’une mouche un éléphant.'),
          }],
          [0, 'Franchement, avec les inscriptions qui ouvrent lundi, on a d’autres chats à fouetter que la couleur du papier.', 'Honestly, with registration opening Monday, we have bigger fish to fry than paper colour.'],
          [1, {
            options: [
              'Complètement ! C’est pour ça que j’ai dit : « Revenons à nos moutons et votons le calendrier ! »',
              'Tout à fait ! C’est pour ça que j’ai posé un lapin à toute l’équipe.',
              'Oui, j’avais vraiment un chat dans la gorge pendant le vote.',
            ],
            explain: b('Bringing the group back to the main topic = Revenons à nos moutons !', 'Recentrer le débat sur l’essentiel = Revenons à nos moutons !'),
          }],
          [0, 'Heureusement que tu as recadré le débat, sinon on y était encore demain !', 'Good thing you steered the discussion back on track, otherwise we’d still be there tomorrow!'],
        ],
      ),
      dict('Bref, revenons à nos moutons : il n’y a pas un chat dehors.'),
      write(
        b('A lively meeting or surprising day', 'Une réunion animée ou une journée imprévue'),
        b('Write 45 to 85 words about a meeting, a missed appointment, or a lively conversation where someone got sidetracked or overreacted. Use at least three animal idioms from this course.', 'Écrivez 45 à 85 mots sur une réunion, un rendez-vous manqué ou une discussion animée où quelqu’un a changé de sujet ou exagéré. Employez au moins trois expressions de ce cours.'),
        45,
        85,
        [
          b('At least three animal idioms from this course', 'Au moins trois expressions animalières de ce cours'),
          b('Natural B1 connectors and clear flow', 'Connecteurs B1 naturels et récit fluide'),
          b('Accurate pronouns and verb forms', 'Pronoms et conjugaisons exacts'),
        ],
        'Hier matin, quand je suis arrivé en avance dans la salle, il n’y avait pas un chat. Mon associé m’a presque posé un lapin, puis il a essayé de noyer le poisson en parlant de ses vacances. Comme j’avais d’autres chats à fouetter, j’ai souri et dit : « Revenons à nos moutons ! » En dix minutes, tout était réglé.',
        { phrases: ['il n’y avait pas un chat', 'posé un lapin', 'noyer le poisson', 'd’autres chats à fouetter', 'Revenons à nos moutons'] },
      ),
    ],
    [
      b('avoir d’autres chats à fouetter = have bigger fish to fry; il n’y a pas un chat = nobody around.', 'avoir d’autres chats à fouetter = avoir plus urgent ; il n’y a pas un chat = il n’y a personne.'),
      b('noyer le poisson = evade a clear answer; faire d’une mouche un éléphant = exaggerate wildly.', 'noyer le poisson = embrouiller le débat ; faire d’une mouche un éléphant = dramatiser un détail.'),
      b('revenir à ses moutons = return to the main topic (often « Revenons à nos moutons ! »).', 'revenir à ses moutons = reprendre le sujet principal (« Revenons à nos moutons ! »).'),
    ],
    [
      ['avoir d’autres chats à fouetter', b('to have bigger fish to fry', 'avoir des urgences plus importantes')],
      ['noyer le poisson', b('to muddy the waters, evade the point', 'embrouiller pour éviter de répondre')],
      ['faire d’une mouche un éléphant', b('to make a mountain out of a molehill', 'exagérer un petit incident')],
      ['revenir à ses moutons', b('to get back to the subject', 'reprendre le sujet principal')],
      ['il n’y a pas un chat', b('there is not a single soul around', 'il n’y a absolument personne')],
    ],
  ),
];

export default lessons;
