import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ask clear questions in any everyday situation. Distinguish qui, que/qu’, and quoi, master où, quand, comment, pourquoi, and combien, choose smoothly between intonation, est-ce que, and inversion with quel(le)(s), and put it all together in real A1 dialogues.',
    'Posez des questions claires dans toutes les situations du quotidien. Distinguez qui, que/qu’ et quoi, maîtrisez où, quand, comment, pourquoi et combien, alternez intonation, est-ce que et inversion avec quel(le)(s), et passez à la pratique en dialogue A1.',
  ),
  outcomes: [
    b('Tell qui (who) apart from que and quoi (what)', 'Distinguer qui de que et quoi'),
    b('Use où, quand, comment, pourquoi, and combien accurately', 'Employer où, quand, comment, pourquoi et combien avec justesse'),
    b('Ask questions with intonation, est-ce que, inversion, and quel(le)(s)', 'Poser des questions par intonation, est-ce que, inversion et quel(le)(s)'),
    b('Handle practical A1 Q&A exchanges at stations, shops, and cafés', 'Gérer des échanges questions-réponses A1 en situation réelle'),
  ],
};

const C = 'gr-question-words';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['qui-que-quoi', 'qui-que-quoi'],
    b('Who and what: qui, que, and quoi', 'Qui et quoi : qui, que et quoi'),
    b('Pick the right French word for "who" and "what" depending on whether it refers to a person or a thing and where it sits.', 'Choisissez le bon mot interrogatif selon qu’il désigne une personne ou une chose et selon sa place dans la phrase.'),
    [
      b('Use qui for people (both start and after prepositions)', 'Employer qui pour les personnes (au début ou après préposition)'),
      b('Use qu’est-ce que / que at the start for things', 'Utiliser qu’est-ce que / que au début pour les choses'),
      b('Use quoi after the verb or after a preposition', 'Placer quoi après le verbe ou après une préposition'),
    ],
    13,
    [
      card(
        b('Who (qui) vs. what (que / quoi)', 'Qui vs que / quoi'),
        b(
          'Use **qui** whenever you ask about a **person**, at the start or after a preposition (*Avec qui ?*). For **what**, position decides: **qu’est-ce que** (or formal **que**) opens the sentence before a verb, while **quoi** sits **after the verb** in casual speech or **after any preposition** (*De quoi ?*, *Avec quoi ?*).\nPerson questions: **qui, qui est-ce, avec qui**.\nThing questions: **qu’est-ce que, que + verb, quoi**.',
          'Employez **qui** dès qu’il s’agit d’une **personne**, en début de phrase ou après une préposition (*Avec qui ?*). Pour « what », c’est la place qui décide : **qu’est-ce que** (ou **que** soutenu) ouvre la phrase, tandis que **quoi** se met **après le verbe** à l’oral ou **après une préposition** (*De quoi ?*, *Avec quoi ?*).\nPour une personne : **qui, qui est-ce, avec qui**.\nPour une chose : **qu’est-ce que, que + verbe, quoi**.',
        ),
        {
          table: {
            head: [b('Target', 'Cible'), b('Start of question', 'Début de phrase'), b('After verb / preposition', 'Après verbe / préposition')],
            rows: [
              [b('Person ("who")', 'Personne'), 'Qui travaille ici ?', 'Tu appelles qui ? / Avec qui ?'],
              [b('Thing ("what")', 'Chose'), 'Qu’est-ce que tu bois ?', 'Tu bois quoi ? / Dans quoi ?'],
              [b('Formal thing', 'Chose (soutenu)'), 'Que voulez-vous ?', '—'],
            ],
          },
          ex: [
            ['Qui arrive par le train de midi ?', 'Who is arriving on the noon train?'],
            ['Qu’est-ce que vous cherchez ?', 'What are you looking for?'],
            ['Tu écris avec quoi ?', 'What are you writing with?'],
          ],
        },
      ),
      trap(
        b('Never write *Que tu fais ?* or *Avec que ?*', 'Jamais *Que tu fais ?* ni *Avec que ?*'),
        b(
          '**Que** cannot sit directly before Subject + Verb (*Que tu veux ?* is wrong—add **est-ce que**: **Qu’est-ce que tu veux ?**, or invert: **Que veux-tu ?**, or move **quoi** to the end: **Tu veux quoi ?**). And after *à, de, avec, pour*, always use **quoi**.\nValid "what" questions: **Qu’est-ce que tu lis ?, Tu lis quoi ?, Que lis-tu ?**.',
          '**Que** ne peut pas précéder directement Sujet + Verbe (*Que tu veux ?* est faux : ajoutez **est-ce que** dans **Qu’est-ce que tu veux ?**, inversez dans **Que veux-tu ?**, ou mettez **quoi** à la fin dans **Tu veux quoi ?**). Après *à, de, avec, pour*, employez toujours **quoi**.\nQuestions justes : **Qu’est-ce que tu lis ?, Tu lis quoi ?, Que lis-tu ?**.',
        ),
      ),
      mc(
        P.word,
        ['Qu’est-ce que', 'Qui', 'Quoi', 'Que'],
        {
          fr: '___ vous faites ce dimanche ?',
          explain: b('Before Subject + Verb (vous faites) for an activity/thing, use Qu’est-ce que.', 'Devant Sujet + Verbe (vous faites) pour une action, employez Qu’est-ce que.'),
        },
      ),
      mc(
        P.word,
        ['quoi', 'que', 'qui', 'qu’est-ce'],
        {
          fr: 'Tu penses à ___ ?',
          explain: b('After the preposition à, "what" is always quoi.', 'Après la préposition à, on emploie toujours quoi pour une chose.'),
        },
      ),
      gap(
        P.complete,
        '___ sonne à la porte ? — C’est Paul ! — ___ apporte pour la fête ? — Tu as besoin de ___ pour le repas ?',
        [['Qui'], ['Qu’est-ce qu’il'], ['quoi']],
        {
          choices: [
            ['Qui', 'Quoi', 'Que'],
            ['Qu’est-ce qu’il', 'Que', 'Quoi'],
            ['quoi', 'que', 'qui'],
          ],
        },
      ),
      sort(
        b('Sort each question starter or phrase into Person (qui) or Thing (que / quoi).', 'Classez selon que la question porte sur une personne ou sur une chose.'),
        [b('Person (qui)', 'Personne (qui)'), b('Thing (que / quoi)', 'Chose (que / quoi)')],
        [
          ['Avec qui dînes-tu ?', 0],
          ['Tu achètes quoi ?', 1],
          ['Qui parle anglais ici ?', 0],
          ['Qu’est-ce que tu préfères ?', 1],
          ['Tu parles de quoi ?', 1],
          ['Vous attendez qui ?', 0],
        ],
      ),
      ord(
        P.order,
        'Qu’est-ce que tu prépares pour le dîner ?',
        {
          tr: 'What are you making for dinner?',
          extra: ['quoi'],
        },
      ),
      hear(
        'Vous travaillez avec qui au bureau ?',
        b('What is the speaker asking about?', 'Sur quoi porte la question ?'),
        [
          b('A colleague or person (avec qui)', 'Une personne (avec qui)'),
          b('A tool or computer (avec quoi)', 'Un objet ou outil (avec quoi)'),
          b('A departure time', 'Une heure de départ'),
        ],
      ),
      say('Tu veux boire quoi avant le film ?', 'What do you want to drink before the movie?'),
    ],
    [
      b('qui asks about a person in every position.', 'qui désigne une personne dans toutes les positions.'),
      b('At the start before Subject + Verb, use qu’est-ce que (or formal que + inversion).', 'En début de phrase devant Sujet + Verbe, employez qu’est-ce que (ou que + inversion).'),
      b('Use quoi after the verb or after any preposition (avec quoi, de quoi).', 'Employez quoi après le verbe ou après une préposition (avec quoi, de quoi).'),
    ],
    [
      ['sonner', b('to ring (doorbell/phone)', 'appuyer sur la sonnette')],
      ['avoir besoin de', b('to need', 'avoir nécessité de')],
      ['apporter', b('to bring', 'prendre avec soi pour donner')],
    ],
  ),

  lesson(
    C,
    2,
    ['where-when-how-why-how-much', 'ou-quand-comment-pourquoi-combien'],
    b('Où, quand, comment, pourquoi, combien', 'Où, quand, comment, pourquoi, combien'),
    b('Ask about place, time, manner, reason, and price or quantity using the five core question words.', 'Interrogez sur le lieu, le temps, la manière, la cause et la quantité avec les cinq mots interrogatifs essentiels.'),
    [
      b('Use où, quand, comment, pourquoi, and combien in questions', 'Employer où, quand, comment, pourquoi et combien'),
      b('Add de without an article after combien before a noun', 'Ajouter de sans article après combien devant un nom'),
      b('Pair pourquoi questions with parce que answers', 'Associer pourquoi et parce que'),
    ],
    13,
    [
      card(
        b('The five core question words', 'Les cinq mots interrogatifs clés'),
        b(
          'Learn these five workhorses and what each asks for: **où** (place), **quand** (time), **comment** (how / manner / name), **pourquoi** (reason, answered with *parce que*), and **combien** (cost or quantity). Before a noun, use **combien de / d’** with no *des* or *du*.\nFive question words: **où, quand, comment, pourquoi, combien**.',
          'Maîtrisez ces cinq mots essentiels et ce qu’ils demandent : **où** (lieu), **quand** (temps), **comment** (manière / nom), **pourquoi** (cause, réponse avec *parce que*) et **combien** (prix ou quantité). Devant un nom, utilisez **combien de / d’** sans article.\nCinq mots clés : **où, quand, comment, pourquoi, combien**.',
        ),
        {
          table: {
            head: [b('Word', 'Mot'), b('Asks about', 'Demande'), b('Example', 'Exemple')],
            rows: [
              ['où', b('place', 'le lieu'), 'Où habites-tu ?'],
              ['quand', b('time', 'le moment'), 'Quand pars-tu ?'],
              ['comment', b('manner / state', 'la manière / l’état'), 'Comment allez-vous ?'],
              ['pourquoi', b('reason', 'la raison'), 'Pourquoi ris-tu ?'],
              ['combien (de)', b('price / amount', 'le prix / la quantité'), 'Combien coûte ce billet ?'],
            ],
          },
          ex: [
            ['Où est la sortie du métro, s’il vous plaît ?', 'Where is the subway exit, please?'],
            ['Combien de nuits restez-vous à Marseille ?', 'How many nights are you staying in Marseille?'],
            ['Pourquoi est-ce que le magasin est fermé ?', 'Why is the shop closed?'],
          ],
        },
      ),
      tip(
        b('Accent check: où vs. ou — and combien de', 'Attention à l’accent : où vs ou — et combien de'),
        b(
          '**Où** (with grave accent) means *where*; **ou** (without accent) means *or*. And after **combien**, add **de / d’** directly before a plural noun: **Combien de billets ?**, **Combien d’heures ?**—never *Combien des billets*.\nClean forms: **où vas-tu, thé ou café, combien de jours**.',
          '**Où** (avec accent grave) signifie le lieu ; **ou** (sans accent) signifie le choix. Après **combien**, ajoutez directement **de / d’** devant le nom : **Combien de billets ?**, **Combien d’heures ?**—jamais *Combien des billets*.\nFormes justes : **où vas-tu, thé ou café, combien de jours**.',
        ),
      ),
      mc(
        P.word,
        ['Pourquoi', 'Comment', 'Combien', 'Quand'],
        {
          fr: '___ est-ce que tu prends un manteau ? — Parce qu’il fait froid.',
          explain: b('An answer with parce que always matches the question pourquoi.', 'Une réponse en parce que correspond toujours à la question pourquoi.'),
        },
      ),
      mc(
        P.form,
        ['Combien de', 'Combien des', 'Combien du', 'Comment de'],
        {
          fr: '___ frères et sœurs avez-vous ?',
          explain: b('Before a noun, combien takes bare de (never des).', 'Devant un nom, combien est suivi de de sans article (jamais des).'),
        },
      ),
      pairs(
        b('Match each question word with the reply that answers it.', 'Associez chaque question à la réponse qui lui correspond.'),
        [
          ['Où déjeunes-tu ?', 'Au bistro d’en face.'],
          ['Quand arrives-tu ?', 'Jeudi vers midi.'],
          ['Comment vas-tu à Lyon ?', 'En TGV.'],
          ['Combien coûte l’entrée ?', 'Douze euros.'],
        ],
        true,
      ),
      gap(
        P.complete,
        '___ va le train ? À Bordeaux ? — Oui, et ___ coûte le billet ? — ___ part-il exactement ?',
        [['Où'], ['combien'], ['Quand']],
        {
          choices: [
            ['Où', 'Ou', 'Quand'],
            ['combien', 'comment', 'pourquoi'],
            ['Quand', 'Pourquoi', 'Où'],
          ],
        },
      ),
      ord(
        P.order,
        'Comment est-ce que tu prépares cette soupe ?',
        {
          tr: 'How do you make this soup?',
          extra: ['combien'],
        },
      ),
      dict('Où habitez-vous maintenant et combien de chambres voulez-vous ?'),
      say('Pourquoi est-ce que vous apprenez le français ?', 'Why are you learning French?'),
    ],
    [
      b('Use où (place), quand (time), comment (manner), pourquoi (reason), combien (quantity/price).', 'Employez où (lieu), quand (moment), comment (manière), pourquoi (cause) et combien (quantité/prix).'),
      b('Always use combien de + noun without des/du.', 'Utilisez toujours combien de + nom sans des/du.'),
      b('Keep the accent on où (where) to separate it from ou (or).', 'Gardez l’accent sur où (lieu) pour le distinguer de ou (choix).'),
    ],
    [
      ['la sortie', b('exit', 'l’endroit pour sortir')],
      ['coûter', b('to cost', 'valoir un certain prix')],
      ['la chambre', b('bedroom / hotel room', 'la pièce pour dormir')],
    ],
  ),

  lesson(
    C,
    3,
    ['three-question-forms-and-quel', 'trois-formes-de-questions-et-quel'],
    b('Intonation, est-ce que, inversion, and quel', 'Intonation, est-ce que, inversion et quel'),
    b('Ask any question in three registers—casual intonation, neutral est-ce que, or polite inversion—and make quel agree with nouns.', 'Posez vos questions dans trois registres—intonation, est-ce que, inversion—et accordez quel avec le nom.'),
    [
      b('Switch smoothly between intonation, est-ce que, and inversion', 'Alterner entre intonation, est-ce que et inversion'),
      b('Add -t- in inversion after a vowel (Où va-t-il ?)', 'Ajouter -t- dans l’inversion après une voyelle (Où va-t-il ?)'),
      b('Agree quel / quelle / quels / quelles with the noun', 'Accorder quel / quelle / quels / quelles avec le nom'),
    ],
    13,
    [
      card(
        b('Three ways to ask + quel(le)(s)', 'Trois façons de demander + quel(le)(s)'),
        b(
          'French offers three registers for questions. **Intonation** keeps statement order and raises your voice at the end (*Tu pars quand ?*). **Est-ce que** works politely everywhere (*Quand est-ce que tu pars ?*). **Inversion** swaps pronoun and verb with a hyphen (*Quand pars-tu ?*, adding **-t-** after a vowel: *Où va-t-il ?*). Use **quel / quelle / quels / quelles** before a noun or *être + noun*.\nThree question forms: **intonation, est-ce que, inversion**.\nForms of quel: **quel, quelle, quels, quelles**.',
          'Le français propose trois registres. **L’intonation** garde l’ordre normal en montant la voix à la fin (*Tu pars quand ?*). **Est-ce que** convient partout (*Quand est-ce que tu pars ?*). **L’inversion** inverse pronom et verbe avec un trait d’union (*Quand pars-tu ?*, avec **-t-** après voyelle : *Où va-t-il ?*). Employez **quel / quelle / quels / quelles** devant un nom ou *être + nom*.\nTrois formes : **intonation, est-ce que, inversion**.\nAccords de quel : **quel, quelle, quels, quelles**.',
        ),
        {
          table: {
            head: [b('Register', 'Registre'), b('Yes/No question', 'Question fermée'), b('With question word', 'Avec mot interrogatif')],
            rows: [
              [b('Everyday', 'Oral courant'), 'Vous aimez le thé ?', 'Vous arrivez à quelle heure ?'],
              [b('Neutral', 'Standard'), 'Est-ce que vous aimez le thé ?', 'À quelle heure est-ce que vous arrivez ?'],
              [b('Formal / written', 'Soutenu / écrit'), 'Aimez-vous le thé ?', 'À quelle heure arrivez-vous ?'],
            ],
          },
          ex: [
            ['Quelle est votre date de naissance ?', 'What is your date of birth?'],
            ['Quels jours est-ce que le musée est ouvert ?', 'Which days is the museum open?'],
            ['À quelle heure part-il demain matin ?', 'What time is he leaving tomorrow morning?'],
          ],
        },
      ),
      tip(
        b('Quel vs. qu’est-ce que', 'Quel ou qu’est-ce que ?'),
        b(
          'Never translate “What is your address?” with *qu’est-ce que*: before a noun or *être + noun*, use **quel / quelle** (**Quelle est votre adresse ?**, **Quel numéro appelez-vous ?**).\nUse quel before nouns: **quel train, quelle heure, quels films, quelles langues**.',
          'Ne traduisez jamais « What is your address? » par *qu’est-ce que* : devant un nom ou *être + nom*, employez **quel / quelle** (**Quelle est votre adresse ?**, **Quel numéro appelez-vous ?**).\nQuel devant un nom : **quel train, quelle heure, quels films, quelles langues**.',
        ),
      ),
      mc(
        P.form,
        ['Quelles', 'Quels', 'Quelle', 'Quel'],
        {
          fr: '___ langues parlez-vous dans votre famille ?',
          explain: b('Langue is feminine plural (les langues), so use Quelles.', 'Langue est féminin pluriel (les langues) : il faut Quelles.'),
        },
      ),
      mc(
        b('Choose the correct formal inversion for "Where does she live?".', 'Choisissez l’inversion soutenue correcte pour « Where does she live? ».'),
        ['Où habite-t-elle ?', 'Où habite-elle ?', 'Où t-habite-elle ?', 'Où est-ce habite-elle ?'],
        {
          explain: b('Since habite ends in a vowel (-e) and elle starts with a vowel, insert -t-: habite-t-elle.', 'Comme habite finit par -e et elle commence par e, on ajoute -t- : habite-t-elle.'),
        },
      ),
      gap(
        P.complete,
        '___ train prenez-vous ? — Le train de huit heures. Et à ___ gare arrive-___ ?',
        [['Quel'], ['quelle'], ['t-il']],
        {
          choices: [
            ['Quel', 'Quelle', 'Quels'],
            ['quelle', 'quel', 'quelles'],
            ['t-il', 'il', 't-elle'],
          ],
        },
      ),
      sort(
        b('Sort each question by its grammatical structure.', 'Classez chaque question selon sa construction.'),
        [b('Intonation', 'Intonation'), b('Est-ce que', 'Est-ce que'), b('Inversion', 'Inversion')],
        [
          ['Tu habites où ?', 0],
          ['Est-ce que vous restez ?', 1],
          ['Parlez-vous espagnol ?', 2],
          ['Il arrive quand ?', 0],
          ['Où est-ce qu’elle travaille ?', 1],
          ['À quelle heure dînons-nous ?', 2],
        ],
      ),
      ord(
        P.order,
        'Quelle est l’adresse de votre hôtel ?',
        {
          tr: 'What is the address of your hotel?',
          extra: ['qu’est-ce'],
        },
      ),
      dict('Quels livres est-ce que tu choisis pour les vacances ?'),
      say('À quelle heure ferme la pharmacie le samedi ?', 'What time does the pharmacy close on Saturdays?'),
    ],
    [
      b('All three question structures (intonation, est-ce que, inversion) are grammatical—match them to the situation.', 'Les trois formes (intonation, est-ce que, inversion) sont justes : adaptez-les à la situation.'),
      b('Insert -t- between a verb ending in a vowel and il, elle, or on in inversion.', 'Ajoutez -t- entre un verbe terminé par une voyelle et il, elle ou on dans l’inversion.'),
      b('Agree quel/quelle/quels/quelles with the noun it asks about.', 'Accordez quel/quelle/quels/quelles avec le nom concerné.'),
    ],
    [
      ['la date de naissance', b('date of birth', 'le jour, le mois et l’année où l’on est né')],
      ['le numéro', b('number', 'une suite de chiffres')],
      ['fermer', b('to close', 'contraire d’ouvrir')],
    ],
  ),

  lesson(
    C,
    4,
    ['real-a1-dialogue-qa', 'questions-reponses-en-dialogue'],
    b('Questions and answers in real life', 'Questions et réponses en dialogue'),
    b('Combine question words, prepositions, and natural answers in realistic hotel, station, and café conversations.', 'Combinez mots interrogatifs, prépositions et réponses naturelles dans des dialogues réalistes à l’hôtel, à la gare et au café.'),
    [
      b('Place prepositions before question words (À quelle heure, Pour combien)', 'Placer les prépositions avant les mots interrogatifs (À quelle heure, Pour combien)'),
      b('Understand natural questions heard at desks and cafés', 'Comprendre les questions courantes au guichet et au café'),
      b('Write practical questions for meeting someone or booking a stay', 'Rédiger des questions utiles pour faire connaissance ou réserver'),
    ],
    13,
    [
      card(
        b('Putting prepositions in front', 'Placer la préposition au début'),
        b(
          'In standard French, a preposition (**à, de, avec, pour, en**) stays right **before** the question word rather than stranded at the end (*À quelle heure… ?*, *Pour combien de nuits… ?*, *De quelle ville… ?*).\nCommon openers: **À quelle heure, Pour combien de, Avec qui, De quel pays**.',
          'En français standard, la préposition (**à, de, avec, pour, en**) reste placée **avant** le mot interrogatif et non à la fin (*À quelle heure… ?*, *Pour combien de nuits… ?*, *De quelle ville… ?*).\nDébuts courants : **À quelle heure, Pour combien de, Avec qui, De quel pays**.',
        ),
        {
          table: {
            head: [b('Question', 'Question'), b('Natural reply', 'Réponse naturelle')],
            rows: [
              ['Pour combien de nuits réservez-vous ?', 'Pour trois nuits, s’il vous plaît.'],
              ['À quelle heure est le petit-déjeuner ?', 'De sept heures à dix heures.'],
              ['De quel quai part le train ?', 'Du quai numéro quatre.'],
              ['Qu’est-ce que vous prenez comme boisson ?', 'Un chocolat chaud, merci.'],
            ],
          },
          ex: [
            ['Pour combien de personnes voulez-vous une table ?', 'For how many people would you like a table?'],
            ['De quelle ville venez-vous ?', 'Which city are you from?'],
            ['Avec qui voyagez-vous cette semaine ?', 'Who are you traveling with this week?'],
          ],
        },
      ),
      tip(
        b('Echo the preposition in your answer', 'Reprenez la préposition dans votre réponse'),
        b(
          'Short, natural answers often keep the exact preposition from the question: *À quelle heure ?* → **À midi.** *Pour combien de jours ?* → **Pour quatre jours.** *Avec qui ?* → **Avec ma sœur.**\nPreposition matches: **à → à, pour → pour, de → de/du**.',
          'Les réponses courtes et naturelles reprennent souvent la même préposition que la question : *À quelle heure ?* → **À midi.** *Pour combien de jours ?* → **Pour quatre jours.** *Avec qui ?* → **Avec ma sœur.**\nÉchos naturels : **à → à, pour → pour, de → de/du**.',
        ),
      ),
      hear(
        'De quel quai part le train pour Bordeaux, s’il vous plaît ?',
        b('Which reply answers the question directly?', 'Quelle réponse convient le mieux à la question entendue ?'),
        [
          b('From platform 6, right on your left.', 'Du quai six, juste sur votre gauche.'),
          b('Because the train is late.', 'Parce que le train est en retard.'),
          b('Yes, I prefer taking the train.', 'Oui, je préfère prendre le train.'),
        ],
      ),
      mc(
        b('The answer is: « Pour cinq jours, jusqu’à vendredi. » Choose the matching question.', 'La réponse est : « Pour cinq jours, jusqu’à vendredi. » Choisissez la question.'),
        [
          'Pour combien de jours louez-vous cette voiture ?',
          'Combien de jours pour louez-vous cette voiture ?',
          'Qui louez-vous cette voiture pour jours ?',
          'Qu’est-ce que jours vous louez cette voiture ?',
        ],
      ),
      gap(
        P.complete,
        '___ quelle ville habitez-vous ? — À Toulouse. — Et ___ quoi travaillez-vous ? — Dans une école. — ___ d’heures par semaine ?',
        [['Dans'], ['dans'], ['Combien']],
        {
          choices: [
            ['Dans', 'À', 'Avec'],
            ['dans', 'qui', 'où'],
            ['Combien', 'Comment', 'Pourquoi'],
          ],
        },
      ),
      dlg(
        b('Checking into a hotel', 'Arrivée à l’hôtel'),
        b('Nadia arrives at the reception desk in Bordeaux.', 'Nadia arrive à la réception d’un hôtel à Bordeaux.'),
        [['Réceptionniste', 'm'], ['Nadia', 'f']],
        [
          [0, 'Bonjour Madame ! Vous avez une réservation à quel nom ?', 'Hello madam! What name is the reservation under?'],
          [1, 'Bonjour ! Au nom de Nadia Benali.', 'Hello! Under the name Nadia Benali.'],
          [0, {
            options: [
              'Parfait. Pour combien de nuits restez-vous chez nous ?',
              'Parfait. Comment de nuits restez-vous chez nous ?',
              'Parfait. Pourquoi nuits restez-vous chez nous ?',
            ],
          }],
          [1, 'Pour trois nuits. À quelle heure est le petit-déjeuner ?', 'For three nights. What time is breakfast?'],
          [0, {
            options: [
              'De sept heures à dix heures, dans la salle au premier étage.',
              'Parce que sept heures à dix heures, au premier étage.',
              'Quoi sept heures à dix heures, au premier étage.',
            ],
          }],
        ],
      ),
      dlg(
        b('Meeting a new colleague', 'Rencontre avec un nouveau collègue'),
        b('Lucas and Maya chat over coffee on Maya’s first day.', 'Lucas et Maya discutent autour d’un café le premier jour de Maya.'),
        [['Lucas', 'm'], ['Maya', 'f']],
        [
          [0, 'Bienvenue dans l’équipe ! Tu viens de quelle région ?', 'Welcome to the team! Which region are you from?'],
          [1, 'Merci ! Je viens de Bretagne, près de Rennes.', 'Thanks! I am from Brittany, near Rennes.'],
          [0, {
            options: [
              'Et qu’est-ce que tu prends au café le matin ?',
              'Et que tu prends au café le matin ?',
              'Et qui tu prends au café le matin ?',
            ],
          }],
          [1, 'Un grand café crème. Et toi, tu travailles ici depuis quand ?', 'A large latte. And you, how long have you worked here?'],
        ],
      ),
      ord(
        P.order,
        'Avec qui est-ce que tu pars en vacances cet été ?',
        {
          tr: 'Who are you going on holiday with this summer?',
          extra: ['quoi'],
        },
      ),
      write(
        b('Write 4–5 questions for a new roommate.', 'Rédigez 4 ou 5 questions pour un nouveau colocataire.'),
        b('Write a short message asking a new roommate 4–5 friendly questions using at least three different question words and one form of quel.', 'Écrivez un court message avec 4 ou 5 questions à un nouveau colocataire en utilisant au moins trois mots interrogatifs différents et une forme de quel.'),
        22,
        44,
        [
          b('Use at least 3 different question words (où, quand, combien, pourquoi, qu’est-ce que...)', 'Utiliser au moins 3 mots interrogatifs différents'),
          b('Include quel / quelle / quels / quelles accurately', 'Inclure une forme correcte de quel'),
          b('Separate French question marks with a space', 'Mettre une espace avant chaque point d’interrogation'),
        ],
        'Où est-ce que tu habites maintenant ? À quelle heure pars-tu au travail le matin ? Qu’est-ce que tu fais le week-end ? Combien de langues parles-tu, et pourquoi apprends-tu le français ?',
      ),
    ],
    [
      b('Place prepositions (à, de, pour, avec) before the question word.', 'Placez la préposition (à, de, pour, avec) avant le mot interrogatif.'),
      b('Echo the question’s preposition for short, natural answers.', 'Reprenez la préposition de la question pour répondre naturellement.'),
      b('Vary intonation, est-ce que, and inversion to fit casual or polite settings.', 'Alternez intonation, est-ce que et inversion selon la situation.'),
    ],
    [
      ['le quai', b('train platform', 'le bord où s’arrête le train')],
      ['la réservation', b('booking', 'place ou chambre gardée à l’avance')],
      ['le colocataire', b('roommate', 'personne qui partage un logement')],
    ],
  ),
];

export default lessons;
