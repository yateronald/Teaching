import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Manquer son train or manquer à quelqu’un? Servir le café, servir à couper or se servir de? Many everyday French verbs change their entire meaning—and even flip subject and object—depending on the preposition that follows. This course guides you through the highest-value meaning-shifting verbs (manquer, servir, tenir, jouer, croire) with clear structures and realistic B1 contexts.',
    'Manquer son train ou manquer à quelqu’un ? Servir le café, servir à couper ou se servir de ? Beaucoup de verbes courants changent complètement de sens — et inversent parfois sujet et objet — selon la préposition qui suit. Ce cours passe en revue les verbes à constructions multiples les plus utiles (manquer, servir, tenir, jouer, croire) avec des repères clairs et des contextes réalistes de niveau B1.',
  ),
  outcomes: [
    b('Use manquer, manquer de and manquer à (Tu me manques!) without mixing up subject and object', 'Employer manquer, manquer de et manquer à sans inverser sujet et objet'),
    b('Distinguish servir, servir à, servir de and se servir de accurately', 'Distinguer avec précision servir, servir à, servir de et se servir de'),
    b('Express attachment and resemblance with tenir à and tenir de', 'Exprimer l’attachement et la ressemblance avec tenir à et tenir de'),
    b('Select the right construction with jouer (à / de) and croire (direct / à / en)', 'Choisir la bonne construction avec jouer (à / de) et croire (direct / à / en)'),
  ],
};

const C = 'gr-verb-meaning-shifts';

const lessons: Lesson[] = [
  lesson(C, 1, ['manquer-de-vs-manquer-a', 'manquer-de-ou-manquer-a'],
    b('Manquer, manquer de, manquer à', 'Manquer, manquer de, manquer à'),
    b('One verb, three distinct constructions—including how French says “I miss you” backwards from English.', 'Un seul verbe, trois constructions bien distinctes — dont la tournure inversée pour exprimer l’absence affective.'),
    [
      b('Use direct manquer for missed trains and opportunities', 'Employer manquer (direct) pour un train ou une occasion ratée'),
      b('Use manquer de for lacking something or almost doing something', 'Employer manquer de pour un manque ou une action évitée de justesse'),
      b('Master the inverted pattern of manquer à (Tu me manques)', 'Maîtriser la construction inversée de manquer à (Tu me manques)'),
    ],
    13,
    [
      card(b('Three constructions of manquer', 'Les trois constructions de manquer'), b('Watch what immediately follows **manquer**: no preposition, **de**, or **à**. With **de**, something is lacking (or nearly happened). With **à**, the missing person or thing becomes the grammatical **subject**!\nDirect object: **manquer un train, manquer le début, manquer une occasion**.\nPreposition de: **manquer de temps, manquer de courage, manquer de tomber**.', 'Observez ce qui suit immédiatement **manquer** : aucun mot, **de**, ou **à**. Avec **de**, quelque chose fait défaut (ou a failli arriver). Avec **à**, l’être ou le lieu qui vous manque devient le **sujet** de la phrase !\nObjet direct : **manquer un train, manquer le début, manquer une occasion**.\nPréposition de : **manquer de temps, manquer de courage, manquer de tomber**.'), {
        table: {
          head: [b('Pattern', 'Construction'), b('Meaning', 'Sens'), b('Example', 'Exemple')],
          rows: [
            ['manquer + COD', b('to miss (fail to catch)', 'rater, arriver trop tard pour'), 'J’ai manqué mon train de cinq minutes.'],
            ['manquer de + nom', b('to lack / be short of', 'ne pas avoir assez de'), 'Ce texte manque de clarté.'],
            ['manquer de + inf.', b('to almost do something', 'faillir faire quelque chose'), 'J’ai manqué de glisser sur le verglas.'],
            ['X manque à Y', b('Y misses X', 'Y ressent l’absence de X'), 'Mes amis de Lyon me manquent beaucoup.'],
          ],
        },
        ex: [
          ['Nous manquons de bénévoles pour le festival.', 'We are short of volunteers for the festival.'],
          ['Sa famille lui manque depuis son déménagement.', 'She misses her family since her move.'],
        ],
      }),
      trap(b('Who misses whom? Flip the order!', 'Qui manque à qui ? Inversez l’ordre !'), b('Never translate “I miss you” word for word! In **Tu me manques**, **tu** (the person missed) is the subject, and **me** (the person feeling the absence) is the indirect object (**à moi**). Look closely at plural endings too.\nInverted pronouns: **tu me manques, je te manque, vous nous manquez, ils lui manquent**.', 'Ne traduisez jamais « I miss you » mot à mot ! Dans **Tu me manques**, **tu** (la personne absente) est le sujet, et **me** (la personne qui ressent le manque) est l’objet indirect (**à moi**). Attention à l’accord du verbe au pluriel.\nPronoms inversés : **tu me manques, je te manque, vous nous manquez, ils lui manquent**.'), {
        ex: [
          ['Les vacances d’été nous manquent déjà.', 'We already miss summer holidays.'],
          ['Est-ce que je te manque quand je voyage ?', 'Do you miss me when I travel?'],
        ],
      }),
      mc(P.meaning, [
        b('Paul misses his sister.', 'Sa sœur manque à Paul : il ressent son absence.'),
        b('Paul is lacking money.', 'Paul n’a pas assez d’argent.'),
        b('Paul missed the last bus.', 'Paul a raté le dernier bus.'),
      ], { fr: 'Sa sœur manque beaucoup à Paul.', explain: b('Sa sœur is the subject (the person missed); à Paul is who misses her.', 'Sa sœur est le sujet (absente) ; à Paul désigne celui qui ressent l’absence.') }),
      hear('Ce projet est intéressant, mais il manque vraiment de moyens financiers.', P.meaning, [
        b('The project does not have enough funding.', 'Le projet n’a pas assez de budget.'),
        b('The project missed its deadline.', 'Le projet a raté sa date limite.'),
        b('Everyone misses this project.', 'Tout le monde regrette la disparition du projet.'),
      ]),
      sort(b('Sort each sentence by construction.', 'Classez chaque phrase selon sa construction.'), [
        b('Missed (manquer + COD)', 'Rater (manquer + COD)'),
        b('Lack (manquer de)', 'Avoir trop peu (manquer de)'),
        b('Emotional miss (manquer à)', 'Absence affective (manquer à)'),
      ], [
        ['Tu me manques énormément.', 2],
        ['Il a manqué la correspondance.', 0],
        ['Nous manquons de sommeil.', 1],
        ['La mer manque à Clara.', 2],
        ['Cette sauce manque de sel.', 1],
        ['Elle a manqué son rendez-vous.', 0],
      ]),
      gap(P.complete, 'Depuis que tu habites à Nantes, tu ___ (manquer à — nous). En plus, l’appartement ___ (manquer de) lumière en hiver.', [['nous manques'], ['manque de']], {
        choices: [
          ['nous manques', 'nous manquons', 'te manquons'],
          ['manque de', 'manque à', 'manque'],
        ],
      }),
      pairs(P.match, [
        ['manquer de temps', b('to be short on time', 'ne pas avoir assez de temps')],
        ['manquer un examen', b('to miss an exam', 'ne pas pouvoir passer un examen')],
        ['manquer à sa promesse', b('to break one’s promise', 'ne pas tenir sa parole')],
        ['Tu leur manques.', b('They miss you.', 'Ils ressentent ton absence.')],
      ]),
      ord(P.order, 'Mes anciens collègues me manquent beaucoup depuis janvier.', {
        tr: b('I have missed my former colleagues a lot since January.', 'Je ressens beaucoup l’absence de mes anciens collègues depuis janvier.'),
        extra: ['manquons', 'de'],
      }),
      dlg(b('Video call from Montreal', 'Appel vidéo depuis Montréal'), b('Chloé calls her brother Julien back home in Toulouse.', 'Chloé appelle son frère Julien resté à Toulouse.'), [['Chloé', 'f'], ['Julien', 'm']], [
        [0, 'Salut Julien ! Désolée, j’ai manqué ton appel tout à l’heure.', 'Hi Julien! Sorry, I missed your call earlier.'],
        [1, { options: ['Pas grave ! Tu nous manques à tous ici, surtout le dimanche.', 'Pas grave ! Nous te manquons à tous ici.', 'Pas grave ! Tu manques de nous ici.'], explain: b('We miss you = Tu nous manques (you = subject, nous = indirect object).', '« We miss you » se dit Tu nous manques.') }],
        [0, 'Vous me manquez aussi, mais je ne manque pas d’occupations ici !', 'I miss you all too, though I’m not short of things to do here!'],
      ]),
      dict('Il manque encore d’expérience, mais il ne manque jamais une occasion d’apprendre.'),
      say('Mes grands-parents me manquent quand je passe les fêtes loin de chez eux.', 'I miss my grandparents when I spend the holidays far from home.'),
    ],
    [
      b('manquer + noun = to miss an event/train; manquer de + noun = to lack.', 'manquer + nom = rater un événement ou un train ; manquer de + nom = ne pas avoir assez de.'),
      b('manquer à flips subject and object: Tu me manques = I miss you.', 'manquer à inverse sujet et objet : Tu me manques = je ressens ton absence.'),
      b('manquer de + infinitive = to nearly/almost do something.', 'manquer de + infinitif = faillir faire quelque chose.'),
    ],
    [
      ['manquer de', b('to lack / run short of', 'ne pas disposer assez de')],
      ['manquer à quelqu’un', b('to be missed by someone', 'faire sentir son absence à quelqu’un')],
      ['manquer une occasion', b('to miss an opportunity', 'laisser passer une chance')],
      ['manquer à sa parole', b('to break one’s word', 'ne pas respecter sa promesse')],
    ],
  ),

  lesson(C, 2, ['servir-et-tenir', 'servir-et-tenir'],
    b('Servir & tenir: small prepositions, big shifts', 'Servir et tenir : petites prépositions, grands écarts de sens'),
    b('Discover the four faces of servir (servir, servir à, servir de, se servir de) and the key shifts of tenir.', 'Découvrez les quatre visages de servir et les principaux emplois de tenir à et tenir de.'),
    [
      b('Contrast servir, servir à, servir de and se servir de', 'Opposer servir, servir à, servir de et se servir de'),
      b('Distinguish tenir à (value/insist) from tenir de (take after)', 'Distinguer tenir à (être attaché à) et tenir de (ressembler à)'),
      b('Recognize zero articles after servir de', 'Repérer l’absence d’article après servir de'),
    ],
    13,
    [
      card(b('Four ways to use servir', 'Quatre emplois de servir'), b('Notice whether **servir** is direct, followed by **à** (function), **de** (role without an article!), or pronominal **se servir de** (tool/resource used).\nFunction and role: **servir le repas, servir à + infinitif, servir de + nom**.\nUsing a tool: **se servir de, utiliser, employer**.', 'Observez si **servir** est direct, suivi de **à** (utilité), de **de** (rôle sans article !) ou pronominal **se servir de** (instrument utilisé).\nUtilité et rôle : **servir le repas, servir à + infinitif, servir de + nom**.\nEmploi d’un outil : **se servir de, utiliser, employer**.'), {
        table: {
          head: [b('Form', 'Construction'), b('Meaning', 'Sens'), b('Example', 'Exemple')],
          rows: [
            ['servir + COD', b('to serve (food/clients)', 'apporter un plat, accueillir'), 'Le serveur sert le dessert.'],
            ['servir à + inf./nom', b('to be used for (purpose)', 'avoir pour utilité'), 'Ce bouton sert à régler le volume.'],
            ['servir de + nom (sans art.)', b('to act / serve as', 'jouer le rôle de'), 'Ce carton nous sert de table.'],
            ['se servir de + nom', b('to use (a tool)', 'utiliser un objet ou un outil'), 'Je me sers d’un dictionnaire papier.'],
          ],
        },
        ex: [
          ['À quoi sert cette petite clé sur le bureau ?', 'What is this small key on the desk used for?'],
          ['L’ancienne grange sert d’atelier de peinture.', 'The old barn serves as a painting studio.'],
          ['Elle se sert rarement de sa voiture en ville.', 'She rarely uses her car in town.'],
        ],
      }),
      card(b('Tenir à vs tenir de', 'Tenir à ou tenir de ?'), b('**Tenir** means “to hold”, yet **tenir à** expresses strong attachment or insistence, whereas **tenir de** means taking after a parent or relative (**ressembler**). Notice **s’en tenir à** too: to stick strictly to a plan or facts.\nAttachment and persistence: **tenir à, s’en tenir à, tenir compte de**.\nFamily resemblance: **tenir de sa mère, tenir de son grand-père**.', '**Tenir** signifie « garder en main », mais **tenir à** exprime l’attachement ou l’insistance, tandis que **tenir de** signifie avoir hérité un trait d’un proche. Notez aussi **s’en tenir à** : se limiter à ce qui est prévu.\nAttachement et persistance : **tenir à, s’en tenir à, tenir compte de**.\nRessemblance familiale : **tenir de sa mère, tenir de son grand-père**.'), {
        ex: [
          ['Je tiens beaucoup à cette bague : elle vient de ma grand-mère.', 'I care deeply about this ring: it came from my grandmother.'],
          ['Il tient à vérifier lui-même chaque facture.', 'He insists on checking every invoice himself.'],
          ['Ma fille tient de son père pour son calme.', 'My daughter takes after her father in her calmness.'],
        ],
      }),
      mc(P.word, ['sert de', 'sert à', 'se sert de', 'sert'], { fr: 'Pendant les travaux, le salon ___ chambre d’amis.', explain: b('No article after servir de: the living room serves AS a guest room.', 'Pas d’article après servir de : le salon joue le rôle de chambre d’amis.') }),
      mc(P.word, ['tiens à', 'tiens de', 'tient', 'm’en tiens'], { fr: 'Je ___ vous remercier chaleureusement pour votre accueil.', explain: b('Tenir à + infinitive = to insist on / care deeply about doing something.', 'Tenir à + infinitif = vouloir absolument faire quelque chose.') }),
      sort(b('Match each sentence to its meaning.', 'Associez chaque phrase à son sens.'), [
        b('Purpose / Use (servir à / se servir de)', 'Usage / Moyen (servir à / se servir de)'),
        b('Role / Resemblance (servir de / tenir de)', 'Rôle / Ressemblance (servir de / tenir de)'),
        b('Attachment / Priority (tenir à)', 'Attachement / Priorité (tenir à)'),
      ], [
        ['Il se sert d’un logiciel libre.', 0],
        ['Ce banc sert d’abri quand il pleut.', 1],
        ['Elle tient à sa liberté.', 2],
        ['À quoi sert ce câble ?', 0],
        ['Tu tiens de ton oncle.', 1],
        ['Nous tenons à rester neutres.', 2],
      ]),
      gap(P.complete, 'Tu te ___ de cette lampe ? Oui, elle me ___ à lire le soir, et cette caisse en bois me ___ de table de chevet.', [['sers'], ['sert'], ['sert']], {
        hint: b('Conjugate se servir and servir in the present tense.', 'Conjuguez se servir et servir au présent.'),
      }),
      pairs(P.match, [
        ['servir à ouvrir', b('to be used for opening', 'avoir pour fonction d’ouvrir')],
        ['servir de guide', b('to act as a guide', 'jouer le rôle de guide')],
        ['se servir d’une pince', b('to use pliers', 'utiliser une pince')],
        ['tenir de sa mère', b('to take after one’s mother', 'ressembler à sa mère')],
      ]),
      doc({
        look: 'notice',
        title: b('Equipment loan note', 'Note de prêt de matériel'),
        text: 'Atelier numérique — Salle 2\n\nMerci de vous servir uniquement du matériel rangé dans l’armoire bleue.\nLe grand écran sert uniquement aux présentations collectives ; les tablettes servent de support de prise de notes.\nL’équipe tient à retrouver la salle rangée avant 18 h.',
      }, b('In this notice, what is the role of the tablets?', 'Dans cette note, quel est le rôle des tablettes ?'), [
        b('They act as note-taking pads.', 'Elles servent de support pour prendre des notes.'),
        b('They are strictly forbidden.', 'Elles sont strictement interdites.'),
        b('They belong to the blue cabinet only.', 'Elles servent uniquement aux présentations.'),
      ]),
      ord(P.order, 'Je tiens vraiment à finir ce livre ce soir.', {
        tr: b('I really want to finish this book tonight.', 'Je veux absolument terminer ce livre ce soir.'),
        extra: ['de', 'sers'],
      }),
      dict('Ce vieux carnet lui sert de journal, et il se sert toujours du même stylo.'),
      say('Mon frère tient de notre père : il aime se servir de vieux outils.', 'My brother takes after our father: he likes using old tools.'),
    ],
    [
      b('servir à = purpose (for doing); servir de + bare noun = act as; se servir de = use.', 'servir à = utilité ; servir de + nom sans article = jouer le rôle de ; se servir de = utiliser.'),
      b('tenir à + noun/infinitive = care deeply about or insist on.', 'tenir à + nom/infinitif = être attaché à ou vouloir absolument.'),
      b('tenir de + person = take after a relative.', 'tenir de + personne = tenir un trait d’un proche.'),
    ],
    [
      ['servir à', b('to be used for', 'avoir pour fonction de')],
      ['servir de', b('to act / serve as', 'tenir lieu de, jouer le rôle de')],
      ['se servir de', b('to use (a tool/resource)', 'utiliser')],
      ['tenir à', b('to care about / insist on', 'être attaché à / vouloir absolument')],
      ['tenir de', b('to take after (someone)', 'ressembler à un membre de sa famille')],
    ],
  ),

  lesson(C, 3, ['jouer-et-croire', 'jouer-et-croire'],
    b('Jouer à / de & croire / croire à / croire en', 'Jouer à / de et croire / croire à / croire en'),
    b('Master sports vs instruments with jouer, and distinguish trusting a fact, believing in existence, and having faith in someone.', 'Distinguez sports et instruments avec jouer, et séparez fait cru, existence et confiance profonde avec croire.'),
    [
      b('Choose between jouer à and jouer de', 'Choisir entre jouer à et jouer de'),
      b('Tell croire, croire à and croire en apart', 'Distinguer croire, croire à et croire en'),
      b('Review meaning shifts across prepositional verbs in context', 'Réutiliser les verbes à préposition variable en contexte'),
    ],
    13,
    [
      card(b('Jouer à (games) vs jouer de (music)', 'Jouer à (jeux) ou jouer de (musique) ?'), b('With sports and games, **jouer** uses **à** (**au, à la, à l’, aux**). With musical instruments, it uses **de** (**du, de la, de l’, des**) — even in the negative (**Elle ne joue pas de piano** or **du piano**).\nGames and sports: **jouer au foot, jouer aux échecs, jouer aux cartes**.\nMusical instruments: **jouer du violon, jouer de la flûte, jouer de l’accordéon**.', 'Avec les sports et les jeux, **jouer** prend **à** (**au, à la, à l’, aux**). Avec les instruments de musique, il prend **de** (**du, de la, de l’, des**). Notez qu’avec le pronom **en**, on dit **en jouer** pour un instrument, mais **y jouer** pour un jeu !\nJeux et sports : **jouer au foot, jouer aux échecs, jouer aux cartes**.\nInstruments de musique : **jouer du violon, jouer de la flûte, jouer de l’accordéon**.'), {
        ex: [
          ['Le samedi matin, ils jouent au badminton ensemble.', 'On Saturday mornings, they play badminton together.'],
          ['Ma nièce joue de la contrebasse depuis trois ans.', 'My niece has been playing the double bass for three years.'],
        ],
      }),
      card(b('Croire, croire à, croire en', 'Croire, croire à, croire en'), b('**Croire** changes depth depending on its preposition:\n- **croire + quelqu’un / un fait**: think someone is telling the truth.\n- **croire à + chose**: believe something exists or works.\n- **croire en + personne / valeur**: have deep faith or confidence in.\nDirect truth: **croire un témoin, croire une promesse**.\nExistence or value: **croire aux fantômes, croire en soi, croire en l’avenir**.', '**Croire** change de profondeur selon la préposition :\n- **croire + personne / fait** : estimer que la parole ou le fait est vrai.\n- **croire à + chose** : tenir quelque chose pour réel ou efficace.\n- **croire en + personne / valeur** : avoir une confiance profonde en.\nVérité directe : **croire un témoin, croire une promesse**.\nExistence ou confiance : **croire aux fantômes, croire en soi, croire en l’avenir**.'), {
        table: {
          head: [b('Pattern', 'Construction'), b('Meaning', 'Nuance'), b('Example', 'Exemple')],
          rows: [
            ['croire + COD', b('believe a person/story', 'juger vrai, faire foi à'), 'Je te crois sur parole.'],
            ['croire à + nom', b('believe in existence/effect', 'croire que cela existe/marche'), 'Il ne croit pas à cette excuse.'],
            ['croire en + nom', b('have faith/trust in', 'avoir confiance en'), 'Elle croit en ses propres capacités.'],
          ],
        },
        ex: [
          ['Beaucoup de lecteurs croient encore au hasard.', 'Many readers still believe in chance.'],
          ['L’entraîneur croit vraiment en son équipe.', 'The coach truly believes in his team.'],
        ],
      }),
      trap(b('Pronoun check: y vs en', 'Vérification des pronoms : y ou en ?'), b('Because **jouer à** and **croire à** use **à**, their pronoun is **y** (**Les échecs ? J’y joue.** / **La chance ? Je n’y crois pas.**). Because **jouer de** uses **de**, its pronoun is **en** (**Le violon ? Elle en joue très bien.**).\nPronoun y: **jouer au tennis → y jouer, croire à un projet → y croire**.\nPronoun en: **jouer du piano → en jouer, manquer de temps → en manquer**.', 'Puisque **jouer à** et **croire à** prennent **à**, leur pronom est **y** (**Les échecs ? J’y joue.** / **La chance ? Je n’y crois pas.**). Puisque **jouer de** prend **de**, son pronom est **en** (**Le violon ? Elle en joue très bien.**).\nPronom y : **jouer au tennis → y jouer, croire à un projet → y croire**.\nPronom en : **jouer du piano → en jouer, manquer de temps → en manquer**.')),
      mc(P.form, ['de la guitare', 'à la guitare', 'en guitare', 'la guitare'], { fr: 'Le soir sur la terrasse, Léo joue souvent ___.' }),
      hear('Je crois ce que tu dis, mais je ne crois pas vraiment à la réussite de ce plan.', P.meaning, [
        b('The speaker trusts your honesty, yet doubts the plan will work.', 'On croit à ta sincérité, mais on doute que le plan réussisse.'),
        b('The speaker thinks you are lying.', 'On pense que tu mens.'),
        b('The speaker fully supports the plan.', 'On a une confiance totale dans le plan.'),
      ]),
      sort(b('Sort by preposition: à, de, or en / direct.', 'Classez par préposition : à, de, ou en / direct.'), [
        b('à (games, existence)', 'à (jeux, existence)'),
        b('de (instruments)', 'de (instruments)'),
        b('en / direct (trust, faith)', 'en / direct (confiance, vérité)'),
      ], [
        ['jouer ___ cartes', 0],
        ['jouer ___ violoncelle', 1],
        ['croire ___ ses amis (faith)', 2],
        ['croire ___ miracle', 0],
        ['jouer ___ batterie', 1],
        ['croire ___ histoire (fact)', 2],
      ]),
      gap(P.complete, 'Son équipe joue ___ rugby le samedi, et son frère joue ___ saxophone dans un groupe. Tous les deux croient ___ la force du travail collectif.', [['au'], ['du'], ['en']], {
        choices: [
          ['au', 'du', 'en'],
          ['du', 'au', 'à'],
          ['en', 'de', 'sur'],
        ],
      }),
      pairs(P.match, [
        ['jouer au ping-pong', b('to play table tennis', 'pratiquer le tennis de table')],
        ['jouer de l’orgue', b('to play the organ', 'faire de la musique avec un orgue')],
        ['croire quelqu’un', b('to believe someone’s word', 'estimer que quelqu’un dit vrai')],
        ['croire en quelqu’un', b('to believe in someone', 'avoir confiance dans le potentiel d’une personne')],
      ]),
      dlg(b('Before the audition', 'Avant l’audition'), b('Thomas reassures Lina before her conservatory audition.', 'Thomas rassure Lina avant son audition au conservatoire.'), [['Lina', 'f2'], ['Thomas', 'm2']], [
        [0, 'J’ai peur de manquer de souffle pendant le morceau de flûte.', 'I’m afraid of running out of breath during the flute piece.'],
        [1, { options: ['Tu joues de la flûte depuis dix ans, je crois en toi !', 'Tu joues à la flûte depuis dix ans, je crois à toi !', 'Tu tiens de toi !'], explain: b('Instruments take de (jouer de la flûte) and trusting someone’s ability takes croire en.', 'Les instruments prennent de (jouer de la flûte) et la confiance en une personne prend croire en.') }],
        [0, 'Merci, ton soutien compte beaucoup pour moi.', 'Thanks, your support means a lot to me.'],
      ]),
      dict('Elle joue du hautbois avec passion et croit en l’avenir de l’orchestre.'),
      write(
        b('Write a short profile of a friend or colleague.', 'Rédigez le court portrait d’un ami ou collègue.'),
        b('Describe someone using at least three meaning-shift constructions from this course (manquer à/de, se servir de, tenir à/de, jouer à/de, croire en).', 'Décrivez une personne en utilisant au moins trois constructions vues dans ce cours (manquer à/de, se servir de, tenir à/de, jouer à/de, croire en).'),
        25, 55,
        [
          b('Include a sport or instrument with jouer', 'Inclure un sport ou un instrument avec jouer'),
          b('Include manquer, servir or tenir with its right preposition', 'Inclure manquer, servir ou tenir avec la bonne préposition'),
          b('Use croire, croire à or croire en accurately', 'Employer croire, croire à ou croire en avec justesse'),
        ],
        'Mon amie Sarah tient beaucoup à son indépendance. Elle joue du violon le week-end et joue parfois au tennis avec moi. Au travail, elle se sert de tableaux très simples, mais elle ne manque jamais d’idées. Je crois vraiment en son talent.',
        { phrases: ['tenir à…', 'jouer de…', 'jouer à…', 'se servir de…', 'croire en…'] },
      ),
    ],
    [
      b('jouer à + sport/game (pronoun y) vs jouer de + instrument (pronoun en).', 'jouer à + sport/jeu (pronom y) contre jouer de + instrument (pronom en).'),
      b('croire quelqu’un = accept as true; croire à = believe exists/works; croire en = have trust/faith in.', 'croire quelqu’un = croire ses paroles ; croire à = croire à l’existence/efficacité ; croire en = avoir confiance en.'),
      b('Prepositions reshape French verbs completely—learn the full verb + preposition chunk.', 'Les prépositions transforment le sens du verbe : retenez toujours le bloc verbe + préposition.'),
    ],
    [
      ['jouer à', b('to play (a game or sport)', 'pratiquer un jeu ou un sport')],
      ['jouer de', b('to play (an instrument)', 'jouer d’un instrument de musique')],
      ['croire à', b('to believe in (existence/idea)', 'tenir pour réel ou valable')],
      ['croire en', b('to have faith / trust in', 'avoir confiance en quelqu’un ou une valeur')],
    ],
  ),
];

export default lessons;
