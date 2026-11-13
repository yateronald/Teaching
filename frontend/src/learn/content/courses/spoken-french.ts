// Le vrai français parlé (B1): what natives really say. The sounds that
// disappear (ne, je suis, tu as), the little words of conversation (ben, du
// coup, genre), questions without inversion, and familiar vocabulary, with the
// register in which each one belongs.
import { b, type DialogueStep, type Lesson, type McqStep, type T, type Voice } from '../../types';
import { card } from '../kit';

const hear = (voice: Voice, audio: string, prompt: T, options: T[], explain?: T): McqStep =>
  ({ kind: 'mcq', voice, audio, listen: true, prompt, options, answer: 0, ...(explain ? { explain } : {}) });

type Speaker = DialogueStep['speakers'][number];
const ZOE: Speaker = { name: 'Zoé', voice: 'f', side: 'l' };
const HUGO: Speaker = { name: 'Hugo', voice: 'm', side: 'l' };
const ME_F: Speaker = { name: 'Vous', voice: 'f2', side: 'r' };

const lessons: Lesson[] = [
  {
    id: 'spoken-french-1',
    slug: { en: 'the-sounds-that-disappear', fr: 'les-sons-qui-disparaissent' },
    title: b('The sounds that disappear', 'Les sons qui disparaissent'),
    summary: b('Why “je ne sais pas” becomes “j’sais pas”: the ne that vanishes, the short forms of je suis, tu as, il y a, and how to understand them.', 'Pourquoi « je ne sais pas » devient « j’sais pas » : le ne qui disparaît, les formes courtes de je suis, tu as, il y a, et comment les comprendre.'),
    objectives: [b('Understand negation without ne', 'Comprendre la négation sans ne'), b('Recognise t’as, t’es, y a, j’suis', 'Reconnaître t’as, t’es, y a, j’suis'), b('Know when to write the full form', 'Savoir quand écrire la forme complète')],
    minutes: 13,
    steps: [
      card(b('The book says one thing, the street says another', 'Le livre dit une chose, la rue en dit une autre'), b('You have learned **Je ne sais pas.** In real conversation, almost everybody says **J’sais pas.** This is not slang or bad French: it is how spoken French works, for teachers and ministers too. The good news: once you know the five or six patterns, fast French becomes much easier to follow.', 'Vous avez appris **Je ne sais pas.** Dans la vraie conversation, presque tout le monde dit **J’sais pas.** Ce n’est ni de l’argot ni du mauvais français : c’est le fonctionnement du français parlé, chez les professeurs et les ministres aussi. La bonne nouvelle : une fois les cinq ou six mécanismes connus, le français rapide devient beaucoup plus facile à suivre.')),
      card(b('Pattern 1: the ne disappears', 'Mécanisme 1 : le ne disparaît'), b('In speech, the negation keeps only **pas** (or jamais, rien, plus). The meaning stays negative.', 'À l’oral, la négation ne garde que **pas** (ou jamais, rien, plus). Le sens reste négatif.'), { examples: [
        { fr: 'C’est pas grave.', tr: b('It does not matter. (written: Ce n’est pas grave.)', 'À l’écrit : Ce n’est pas grave.') },
        { fr: 'J’ai jamais vu ça.', tr: b('I have never seen that. (written: Je n’ai jamais vu ça.)', 'À l’écrit : Je n’ai jamais vu ça.') },
        { fr: 'Il veut plus venir.', tr: b('He does not want to come anymore.', 'À l’écrit : Il ne veut plus venir.') },
      ] }),
      hear('m', 'C’est pas grave, on se voit demain.', b('What does the man mean?', 'Que veut dire l’homme ?'), [b('It does not matter, see you tomorrow', 'Ce n’est pas grave, on se voit demain'), b('It is serious, come tomorrow', 'C’est grave, viens demain'), b('He cannot see you tomorrow', 'Il ne peut pas te voir demain')], b('No “ne”, but “pas” is there: the sentence is negative.', 'Pas de « ne », mais « pas » est là : la phrase est négative.')),
      card(b('Pattern 2: the short forms', 'Mécanisme 2 : les formes courtes'), b('Some very common groups shrink. You hear them every minute.', 'Certains groupes très fréquents rétrécissent. Vous les entendez à chaque minute.'), { table: { head: [b('Written', 'Écrit'), b('Spoken', 'Oral')], rows: [['tu es, tu as', 't’es, t’as'], ['il y a, il n’y a pas', 'y a, y a pas'], ['je suis, je sais', 'j’suis, j’sais'], ['je ne sais pas', 'j’sais pas'], ['qu’est-ce que tu fais ?', 'tu fais quoi ?']] } }),
      { kind: 'flashcards', title: b('Hear it, understand it', 'Entendre, comprendre'), cards: [
        { fr: 'T’es où ?', tr: b('Where are you? (Tu es où ?)', 'Où es-tu ?') },
        { fr: 'T’as vu ?', tr: b('Did you see? (Tu as vu ?)', 'As-tu vu ?') },
        { fr: 'Y a pas de problème.', tr: b('No problem. (Il n’y a pas de problème.)', 'Il n’y a pas de problème.') },
        { fr: 'J’sais pas.', tr: b('I don’t know. (Je ne sais pas.)', 'Je ne sais pas.') },
        { fr: 'J’suis crevé.', tr: b('I’m exhausted. (Je suis très fatigué.)', 'Je suis très fatigué.') },
        { fr: 'Tu fais quoi ce soir ?', tr: b('What are you doing tonight?', 'Qu’est-ce que tu fais ce soir ?') },
      ] },
      hear('f', 'T’es où ? Y a personne devant le cinéma.', b('What does Zoé say?', 'Que dit Zoé ?'), [b('Where are you? There is nobody in front of the cinema', 'Tu es où ? Il n’y a personne devant le cinéma'), b('You are late, the film has started', 'Tu es en retard, le film a commencé'), b('There are a lot of people at the cinema', 'Il y a beaucoup de monde au cinéma')], b('“T’es où” = tu es où; “y a personne” = il n’y a personne.', '« T’es où » = tu es où ; « y a personne » = il n’y a personne.')),
      hear('m', 'J’sais pas, moi, j’ai jamais mangé là.', b('What does Hugo say?', 'Que dit Hugo ?'), [b('He does not know: he has never eaten there', 'Il ne sait pas : il n’a jamais mangé là'), b('He knows the place well', 'Il connaît bien l’endroit'), b('He does not want to eat', 'Il ne veut pas manger')]),
      { kind: 'match', frBoth: true, prompt: b('Match what you hear with the written form.', 'Associez ce que vous entendez à la forme écrite.'), pairs: [['T’as faim ?', 'Tu as faim ?'], ['Y a du monde.', 'Il y a du monde.'], ['C’est pas vrai !', 'Ce n’est pas vrai !'], ['J’suis prête.', 'Je suis prête.'], ['On y va ?', 'Nous y allons ?']] },
      card(b('“On” instead of “nous”', '« On » à la place de « nous »'), b('In speech, **on** has almost replaced **nous**: *On y va ? On mange où ? On s’appelle demain.* The verb stays in the third person singular (*on va*, not *on allons*).', 'À l’oral, **on** a presque remplacé **nous** : *On y va ? On mange où ? On s’appelle demain.* Le verbe reste à la troisième personne du singulier (*on va*, pas *on allons*).'), { variant: 'tip' }),
      { kind: 'fill', prompt: b('Write the full, written form.', 'Écrivez la forme écrite complète.'), text: 'J’sais pas → Je ___ sais pas. Y a pas de pain → Il ___ a pas de pain.', answers: [['ne'], ['n’y', "n'y"]], hint: b('Put back the missing ne.', 'Remettez le ne qui manque.') },
      { kind: 'speak', prompt: b('Say it the natural way.', 'Dites-le de façon naturelle.'), text: 'T’inquiète, c’est pas grave.', tr: b('Don’t worry, it doesn’t matter.', 'Ne t’inquiète pas, ce n’est pas grave.'), tip: b('Do not pronounce a ne that is not there: let the sentence flow.', 'Ne prononcez pas de ne qui n’est pas là : laissez la phrase couler.') },
    ],
    notes: {
      points: [
        b('In speech, the negation often keeps only “pas”: c’est pas grave.', 'À l’oral, la négation ne garde souvent que « pas » : c’est pas grave.'),
        b('Short forms: t’es, t’as, y a, j’suis, j’sais. Write the full forms.', 'Formes courtes : t’es, t’as, y a, j’suis, j’sais. À l’écrit, gardez les formes complètes.'),
        b('“On” replaces “nous” in conversation, with a singular verb: on va.', '« On » remplace « nous » dans la conversation, avec un verbe au singulier : on va.'),
        b('Understanding these forms is essential; using them is a choice of register.', 'Comprendre ces formes est indispensable ; les utiliser est un choix de registre.'),
      ],
      vocab: [['crevé', b('exhausted (informal)', 'très fatigué (familier)')], ['t’inquiète', b('don’t worry (informal)', 'ne t’inquiète pas')], ['y a du monde', b('it’s busy', 'il y a beaucoup de gens')], ['personne', b('nobody', 'aucune personne')]],
    },
  },
  {
    id: 'spoken-french-2',
    slug: { en: 'ben-du-coup-genre', fr: 'ben-du-coup-genre' },
    title: b('“Ben”, “du coup”, “genre”: the little words', '« Ben », « du coup », « genre » : les petits mots'),
    summary: b('The words that fill every conversation, what each one does, and the questions natives actually ask.', 'Les mots qui remplissent chaque conversation, le rôle de chacun, et les questions que posent vraiment les natifs.'),
    objectives: [b('Understand the role of filler words', 'Comprendre le rôle des mots de remplissage'), b('Ask questions with intonation', 'Poser des questions avec l’intonation'), b('Sound more natural without overdoing it', 'Paraître plus naturel sans en faire trop')],
    minutes: 13,
    steps: [
      card(b('Little words, real jobs', 'Petits mots, vrais rôles'), b('Filler words are not empty: each one has a job. **Ben / bah** = well (before an answer). **Euh** = I am thinking. **Du coup** = so, as a result. **En fait** = actually. **Genre** = like, sort of. **Quoi** at the end = that’s it, you know. **Hein ?** = right? / what? **Bref** = anyway, to cut it short.', 'Les mots de remplissage ne sont pas vides : chacun a un rôle. **Ben / bah** = avant une réponse. **Euh** = je réfléchis. **Du coup** = donc, par conséquent. **En fait** = en réalité. **Genre** = comme, une sorte de. **Quoi** en fin de phrase = voilà, tu vois. **Hein ?** = n’est-ce pas ? / pardon ? **Bref** = pour résumer.')),
      { kind: 'match', prompt: b('Match each little word with its job.', 'Associez chaque petit mot à son rôle.'), pairs: [['du coup', b('so, as a result', 'donc, par conséquent')], ['en fait', b('actually', 'en réalité')], ['bref', b('anyway, in short', 'pour résumer')], ['ben', b('well…', 'avant une réponse')], ['genre', b('like, sort of', 'environ, une sorte de')]] },
      hear('f', 'Le train était annulé. Du coup, j’ai pris le bus.', b('Why did she take the bus?', 'Pourquoi a-t-elle pris le bus ?'), [b('Because the train was cancelled', 'Parce que le train était annulé'), b('Because she likes the bus', 'Parce qu’elle aime le bus'), b('Because the bus is faster', 'Parce que le bus est plus rapide')], b('“Du coup” introduces the consequence: train cancelled → bus.', '« Du coup » introduit la conséquence : train annulé → bus.')),
      hear('m', 'En fait, c’est pas mon frère, c’est mon cousin.', b('What does Hugo correct?', 'Que corrige Hugo ?'), [b('The person is his cousin, not his brother', 'La personne est son cousin, pas son frère'), b('His brother is not there', 'Son frère n’est pas là'), b('He has no cousin', 'Il n’a pas de cousin')], b('“En fait” often corrects what someone believed.', '« En fait » corrige souvent ce que quelqu’un croyait.')),
      hear('f', 'Il est arrivé, genre, à minuit, avec dix amis. Bref, on n’a pas dormi.', b('What happened?', 'Que s’est-il passé ?'), [b('He came around midnight with friends, and they did not sleep', 'Il est arrivé vers minuit avec des amis, et ils n’ont pas dormi'), b('He came alone at ten', 'Il est arrivé seul à dix heures'), b('They slept very well', 'Ils ont très bien dormi')], b('“Genre, à minuit” = around midnight. “Bref” sums up.', '« Genre, à minuit » = vers minuit. « Bref » résume.')),
      card(b('Questions: just raise your voice', 'Les questions : il suffit de monter la voix'), b('Books teach **Où vas-tu ?** and **Est-ce que tu viens ?** In conversation, the most common question is a statement with rising intonation, and the question word often goes **at the end**: *Tu viens ? Tu vas où ? C’est quoi ? Il arrive quand ? On mange où ?*', 'Les livres enseignent **Où vas-tu ?** et **Est-ce que tu viens ?** Dans la conversation, la question la plus fréquente est une phrase affirmative avec une intonation montante, et le mot interrogatif se place souvent **à la fin** : *Tu viens ? Tu vas où ? C’est quoi ? Il arrive quand ? On mange où ?*'), { examples: [{ fr: 'Tu vas où ?', tr: b('Where are you going?', 'Où vas-tu ?') }, { fr: 'Il arrive quand ?', tr: b('When is he arriving?', 'Quand arrive-t-il ?') }, { fr: 'C’est combien ?', tr: b('How much is it?', 'Combien est-ce ?') }] }),
      { kind: 'categorize', prompt: b('Spoken question or formal question?', 'Question orale ou question soutenue ?'), buckets: [b('Spoken', 'Orale'), b('Formal', 'Soutenue')], items: [{ text: 'Tu viens ?', bucket: 0 }, { text: 'C’est quoi ?', bucket: 0 }, { text: 'On mange où ?', bucket: 0 }, { text: 'Où allez-vous ?', bucket: 1 }, { text: 'Qu’est-ce que c’est ?', bucket: 1 }, { text: 'Puis-je entrer ?', bucket: 1 }] },
      { kind: 'order', prompt: b('Build the spoken question.', 'Construisez la question orale.'), words: ['Tu', 'rentres', 'à', 'quelle', 'heure', 'ce', 'soir ?'], tr: 'What time are you coming home tonight?' },
      {
        kind: 'dialogue',
        title: b('Saturday plans', 'Les plans du samedi'),
        speakers: [ZOE, ME_F],
        lines: [
          { s: 0, fr: 'Salut ! Tu fais quoi samedi ?', tr: 'Hi! What are you doing on Saturday?' },
          { s: 1, choose: { options: ['Ben, rien de spécial. Pourquoi ?', 'Je vous remercie de votre aimable question.', 'Samedi est le sixième jour de la semaine.'], answer: 0, explain: b('Between friends, “ben” + a short answer sounds natural. The other answers are far too formal or strange.', 'Entre amis, « ben » + une réponse courte sonne naturel. Les autres réponses sont bien trop formelles ou bizarres.') } },
          { s: 0, fr: 'Y a un concert au parc. C’est gratuit, du coup j’me suis dit que…', tr: 'There’s a concert in the park. It’s free, so I thought…' },
          { s: 1, choose: { options: ['Ah ouais, carrément ! Ça commence à quelle heure ?', 'Je ne sais pas si cela est possible.', 'Le parc, c’est quoi ?'], answer: 0, explain: b('“Carrément” = totally, absolutely (yes!).', '« Carrément » = absolument (oui !).') } },
          { s: 0, fr: 'Vers vingt heures. On se retrouve devant l’entrée, genre, à moins le quart ?', tr: 'Around eight. Shall we meet at the entrance, like, at quarter to?' },
          { s: 1, fr: 'Parfait. Bon, j’te laisse, à samedi !', tr: 'Perfect. OK, I’ll let you go, see you Saturday!' },
        ],
      },
      card(b('Do not overdo it', 'N’en faites pas trop'), b('A learner who puts *genre* and *du coup* in every sentence sounds strange. Understand all of them; use **one or two** naturally (ben, du coup, en fait are safe everywhere). Avoid them in a job interview or a formal email.', 'Un apprenant qui met *genre* et *du coup* dans chaque phrase paraît bizarre. Comprenez-les tous ; utilisez-en **un ou deux** naturellement (ben, du coup, en fait passent partout). Évitez-les en entretien d’embauche ou dans un courriel formel.'), { variant: 'trap' }),
      { kind: 'speak', prompt: b('Ask the question the spoken way.', 'Posez la question à l’oral.'), text: 'On se retrouve où, du coup ?', tr: b('So where do we meet?', 'Alors, où nous retrouvons-nous ?') },
    ],
    notes: {
      points: [
        b('Du coup = so; en fait = actually; bref = in short; genre = like; ben = well.', 'Du coup = donc ; en fait = en réalité ; bref = pour résumer ; genre = environ, comme ; ben = avant une réponse.'),
        b('Spoken questions: statement + rising voice, question word at the end (Tu vas où ?).', 'Questions orales : phrase affirmative + voix qui monte, mot interrogatif à la fin (Tu vas où ?).'),
        b('Understand all filler words; use only a few, and never in formal situations.', 'Comprenez tous les mots de remplissage ; utilisez-en peu, et jamais en situation formelle.'),
      ],
      vocab: [['carrément', b('totally, absolutely', 'complètement, oui sans hésiter')], ['du coup', b('so, as a result', 'donc')], ['bref', b('anyway, in short', 'pour résumer')], ['à moins le quart', b('at quarter to', 'quinze minutes avant l’heure')]],
    },
  },
  {
    id: 'spoken-french-3',
    slug: { en: 'familiar-words-and-registers', fr: 'mots-familiers-et-registres' },
    title: b('Familiar words and registers', 'Mots familiers et registres'),
    summary: b('Boulot, bouffer, un pote, relou: the familiar words you hear every day, a little verlan, and when you can use them.', 'Boulot, bouffer, un pote, relou : les mots familiers entendus tous les jours, un peu de verlan, et quand les utiliser.'),
    objectives: [b('Understand 25 familiar words', 'Comprendre 25 mots familiers'), b('Recognise verlan', 'Reconnaître le verlan'), b('Choose the right register', 'Choisir le bon registre')],
    minutes: 13,
    steps: [
      card(b('Three registers', 'Trois registres'), b('French has three main registers. **Soutenu** (formal, written): *un emploi, se restaurer*. **Courant** (standard, everywhere): *un travail, manger*. **Familier** (with friends and family): *le boulot, bouffer*. The same person changes register all day long.', 'Le français a trois grands registres. **Soutenu** (formel, écrit) : *un emploi, se restaurer*. **Courant** (standard, partout) : *un travail, manger*. **Familier** (entre amis, en famille) : *le boulot, bouffer*. La même personne change de registre toute la journée.')),
      { kind: 'flashcards', title: b('Familiar words of every day', 'Les mots familiers de tous les jours'), cards: [
        { fr: 'le boulot', tr: b('work, job', 'le travail'), ex: 'J’ai trop de boulot cette semaine.' },
        { fr: 'bosser', tr: b('to work', 'travailler'), ex: 'Elle bosse dans un café.' },
        { fr: 'bouffer', tr: b('to eat', 'manger'), ex: 'On va bouffer une pizza ?' },
        { fr: 'un pote', tr: b('a mate, a friend', 'un ami'), ex: 'C’est un pote de l’université.' },
        { fr: 'un truc', tr: b('a thing', 'une chose'), ex: 'Passe-moi le truc, là.' },
        { fr: 'le fric', tr: b('money (cash)', 'l’argent'), ex: 'J’ai plus de fric.' },
        { fr: 'une bagnole', tr: b('a car', 'une voiture'), ex: 'Sa bagnole est en panne.' },
        { fr: 'la flemme', tr: b('laziness, can’t be bothered', 'le manque d’envie'), ex: 'J’ai la flemme de sortir.' },
      ] },
      { kind: 'match', frBoth: true, prompt: b('Match the familiar word with the standard word.', 'Associez le mot familier au mot courant.'), pairs: [['un mec', 'un homme'], ['la bouffe', 'la nourriture'], ['les fringues', 'les vêtements'], ['se marrer', 'rire'], ['galérer', 'avoir des difficultés']] },
      hear('m', 'J’ai la flemme de bosser aujourd’hui, j’suis crevé.', b('How does Hugo feel?', 'Comment se sent Hugo ?'), [b('Tired, with no desire to work', 'Fatigué, sans envie de travailler'), b('Happy to go to work', 'Content d’aller travailler'), b('Ill, he is going to the doctor', 'Malade, il va chez le médecin')]),
      card(b('Verlan: words said backwards', 'Le verlan : les mots à l’envers'), b('**Verlan** turns syllables around: *l’envers* → *verlan*. A few words are now used by everyone, especially young people: **ouf** (fou = crazy), **relou** (lourd = annoying), **chelou** (louche = weird), **meuf** (femme = woman, girlfriend), **vénère** (énervé = angry). Understand them; use them only with friends.', 'Le **verlan** inverse les syllabes : *l’envers* → *verlan*. Quelques mots sont désormais utilisés par tous, surtout les jeunes : **ouf** (fou), **relou** (lourd = pénible), **chelou** (louche = bizarre), **meuf** (femme, copine), **vénère** (énervé). Comprenez-les ; utilisez-les seulement entre amis.'), { variant: 'culture' }),
      hear('f', 'Ce film était ouf ! Par contre, le mec derrière moi était trop relou.', b('What did Zoé think?', 'Qu’a pensé Zoé ?'), [b('The film was amazing, but the man behind her was annoying', 'Le film était génial, mais l’homme derrière elle était pénible'), b('The film was boring and the man was nice', 'Le film était ennuyeux et l’homme sympathique'), b('She did not see the film', 'Elle n’a pas vu le film')], b('“Ouf” (fou) here = incredible; “trop” = very; “relou” (lourd) = annoying.', '« Ouf » (fou) ici = incroyable ; « trop » = très ; « relou » (lourd) = pénible.')),
      { kind: 'categorize', prompt: b('Where can you say it?', 'Où pouvez-vous le dire ?'), buckets: [b('With friends', 'Entre amis'), b('Anywhere, even at work', 'Partout, même au travail')], items: [{ text: 'J’ai la flemme.', bucket: 0 }, { text: 'C’est relou.', bucket: 0 }, { text: 'On va bouffer ?', bucket: 0 }, { text: 'Je suis fatigué.', bucket: 1 }, { text: 'C’est pénible.', bucket: 1 }, { text: 'On va manger ?', bucket: 1 }] },
      card(b('And in Québec?', 'Et au Québec ?'), b('Québec has its own familiar words: **un char** (a car), **jaser** (to chat), **c’est le fun** (it is fun), **mon chum / ma blonde** (my boyfriend / my girlfriend), **pantoute** (not at all), **tiguidou** (perfect). The course *Québec French* teaches many more.', 'Le Québec a ses propres mots familiers : **un char** (une voiture), **jaser** (bavarder), **c’est le fun** (c’est amusant), **mon chum / ma blonde** (mon copain / ma copine), **pantoute** (pas du tout), **tiguidou** (parfait). Le cours *Le français du Québec* en présente beaucoup d’autres.'), { variant: 'culture' }),
      { kind: 'fill', prompt: b('Rewrite the message for your manager: choose the standard words.', 'Réécrivez le message pour votre gestionnaire : choisissez les mots courants.'), text: 'Je serai en retard : ma ___ est en panne et je dois trouver un autre moyen d’aller au ___.', answers: [['voiture'], ['travail']], choices: [['voiture', 'bagnole'], ['travail', 'boulot']], explain: b('With your manager, use the standard register: voiture, travail.', 'Avec votre gestionnaire, utilisez le registre courant : voiture, travail.') },
      {
        kind: 'dialogue',
        title: b('Monday morning at the coffee machine', 'Lundi matin, à la machine à café'),
        speakers: [HUGO, ME_F],
        lines: [
          { s: 0, fr: 'Salut ! Ça va ? T’as fait quoi ce week-end ?', tr: 'Hi! How are you? What did you do at the weekend?' },
          { s: 1, choose: { options: ['Pas grand-chose, j’avais la flemme de sortir. Et toi ?', 'Je me suis restauré dans un établissement.', 'Le week-end, c’est samedi et dimanche.'], answer: 0 } },
          { s: 0, fr: 'Moi, j’ai aidé un pote à déménager. On a galéré, il habite au cinquième sans ascenseur !', tr: 'I helped a mate move house. It was a nightmare, he lives on the fifth floor with no lift!' },
          { s: 1, choose: { options: ['Oh non, c’est relou ! T’es pas trop crevé ?', 'Félicitations pour cette belle réussite.', 'Je ne comprends pas ce que vous dites.'], answer: 0, explain: b('With a colleague you know well, a familiar reply is fine. With your manager, you would say “Ce n’est pas trop dur ?”.', 'Avec un collègue proche, une réponse familière passe très bien. Avec votre gestionnaire, vous diriez « Ce n’est pas trop dur ? ».') } },
          { s: 0, fr: 'Si, grave. Bon, au boulot !', tr: 'Yes, totally. OK, back to work!' },
        ],
      },
    ],
    notes: {
      points: [
        b('Three registers: soutenu (formal), courant (standard), familier (friends).', 'Trois registres : soutenu, courant, familier.'),
        b('Frequent familiar words: boulot, bosser, bouffer, pote, truc, fric, bagnole, la flemme.', 'Mots familiers fréquents : boulot, bosser, bouffer, pote, truc, fric, bagnole, la flemme.'),
        b('Verlan turns words around: ouf (fou), relou (lourd), chelou (louche), vénère (énervé).', 'Le verlan inverse les mots : ouf (fou), relou (lourd), chelou (louche), vénère (énervé).'),
        b('Use the standard register at work and in writing; understand the familiar one everywhere.', 'Utilisez le registre courant au travail et à l’écrit ; comprenez le familier partout.'),
      ],
      vocab: [['galérer', b('to struggle', 'avoir beaucoup de difficultés')], ['grave (adv.)', b('totally (informal)', 'très, complètement (familier)')], ['les fringues', b('clothes (informal)', 'les vêtements')], ['se marrer', b('to laugh (informal)', 'rire')], ['déménager', b('to move house', 'changer de logement')]],
    },
  },
];

export default lessons;
