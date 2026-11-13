// Les expressions imagées (B1 → B2): idioms taught through their literal
// picture. The learner sees what the words say (a rabbit on a chair), guesses
// what they mean (being stood up), then uses the idiom in context.
import { b, type DialogueStep, type Lesson, type McqStep, type T, type Voice } from '../../types';
import { card } from '../kit';

const guess = (image: string, prompt: T, options: T[], explain: T): McqStep =>
  ({ kind: 'mcq', image, prompt, options, answer: 0, explain });
const ask = (prompt: T, options: T[], o: { fr?: string; explain?: T } = {}): McqStep =>
  ({ kind: 'mcq', prompt, options, answer: 0, ...(o.fr ? { fr: o.fr } : {}), ...(o.explain ? { explain: o.explain } : {}) });
const hear = (voice: Voice, audio: string, prompt: T, options: T[], explain?: T): McqStep =>
  ({ kind: 'mcq', voice, audio, listen: true, prompt, options, answer: 0, ...(explain ? { explain } : {}) });

type Speaker = DialogueStep['speakers'][number];
const CLARA: Speaker = { name: 'Clara', voice: 'f', side: 'l' };
const ME: Speaker = { name: 'Vous', voice: 'm', side: 'r' };

const lessons: Lesson[] = [
  {
    id: 'french-idioms-1',
    slug: { en: 'idioms-of-everyday-life', fr: 'expressions-de-la-vie-quotidienne' },
    title: b('Idioms of everyday life', 'Les expressions de la vie quotidienne'),
    summary: b('Poser un lapin, il pleut des cordes, être dans la lune: see what the words say, guess what they mean, use them.', 'Poser un lapin, il pleut des cordes, être dans la lune : voyez ce que disent les mots, devinez ce qu’ils veulent dire, utilisez-les.'),
    objectives: [b('Understand eight everyday idioms', 'Comprendre huit expressions courantes'), b('Guess an idiom from its picture', 'Deviner une expression à partir de son image'), b('Use them in the right situation', 'Les employer dans la bonne situation')],
    minutes: 13,
    steps: [
      card(b('Why idioms matter', 'Pourquoi les expressions comptent'), b('French people use idioms all the time, in the news, at work and with friends. Translated word for word they make no sense, but most of them hide a **picture**. Look at the picture, think about the situation, and the meaning often appears by itself.', 'Les francophones emploient des expressions imagées sans arrêt, aux nouvelles, au travail et entre amis. Traduites mot à mot, elles n’ont aucun sens, mais la plupart cachent une **image**. Regardez l’image, pensez à la situation, et le sens apparaît souvent tout seul.')),
      guess('idiom-lapin', b('“Poser un lapin” (to put down a rabbit). In this picture, what has happened to her?', '« Poser un lapin ». Sur cette image, que lui est-il arrivé ?'), [b('Someone did not come to their meeting', 'Quelqu’un n’est pas venu à leur rendez-vous'), b('She bought a pet', 'Elle a acheté un animal'), b('She is eating rabbit', 'Elle mange du lapin')], b('“Poser un lapin à quelqu’un” = to stand someone up. *Il m’a posé un lapin hier soir.*', '« Poser un lapin à quelqu’un » = ne pas venir à un rendez-vous. *Il m’a posé un lapin hier soir.*')),
      guess('idiom-cordes', b('“Il pleut des cordes” (it is raining ropes). What is the weather like?', '« Il pleut des cordes ». Quel temps fait-il ?'), [b('It is pouring with rain', 'Il pleut très fort'), b('It is drizzling', 'Il pleut un tout petit peu'), b('It is windy but dry', 'Il y a du vent, mais pas de pluie')], b('The rain falls so hard that it looks like ropes. English says “it’s raining cats and dogs”.', 'La pluie tombe si fort qu’elle ressemble à des cordes. On dit aussi « il pleut à verse ».')),
      guess('idiom-lune', b('“Être dans la lune” (to be in the moon). What is this person like?', '« Être dans la lune ». Comment est cette personne ?'), [b('Daydreaming, not paying attention', 'Distraite, elle rêve'), b('Very intelligent', 'Très intelligente'), b('Travelling a lot', 'Elle voyage beaucoup')], b('*Excuse-moi, j’étais dans la lune : tu peux répéter ?* Same idea: “avoir la tête dans les nuages”.', '*Excuse-moi, j’étais dans la lune : tu peux répéter ?* Même idée : « avoir la tête dans les nuages ».')),
      { kind: 'flashcards', title: b('Five more everyday idioms', 'Cinq autres expressions du quotidien'), cards: [
        { fr: 'tomber dans les pommes', tr: b('to faint', 's’évanouir'), ex: 'Il faisait si chaud qu’elle est tombée dans les pommes.' },
        { fr: 'coûter les yeux de la tête', tr: b('to cost an arm and a leg', 'coûter très cher'), ex: 'Ce téléphone coûte les yeux de la tête.' },
        { fr: 'faire la grasse matinée', tr: b('to sleep in', 'se lever tard'), ex: 'Dimanche, je fais la grasse matinée.' },
        { fr: 'avoir le cafard', tr: b('to feel down', 'être un peu triste'), ex: 'L’hiver, j’ai parfois le cafard.' },
        { fr: 'mettre son grain de sel', tr: b('to put your oar in', 'donner son avis sans qu’on le demande'), ex: 'Il met toujours son grain de sel.' },
      ] },
      { kind: 'match', prompt: b('Match each idiom with its meaning.', 'Associez chaque expression à son sens.'), pairs: [['poser un lapin', b('to stand someone up', 'ne pas venir au rendez-vous')], ['tomber dans les pommes', b('to faint', 's’évanouir')], ['faire la grasse matinée', b('to sleep in', 'se lever tard')], ['coûter les yeux de la tête', b('to be very expensive', 'coûter très cher')], ['avoir le cafard', b('to feel down', 'être un peu triste')]] },
      ask(b('Which idiom completes the sentence?', 'Quelle expression complète la phrase ?'), ['coûte les yeux de la tête', 'pleut des cordes', 'pose un lapin'], { fr: 'Je n’achète pas cette veste : elle ___ .', explain: b('A jacket you do not buy because it is too expensive.', 'Une veste qu’on n’achète pas parce qu’elle est trop chère.') }),
      ask(b('Which idiom completes the sentence?', 'Quelle expression complète la phrase ?'), ['dans la lune', 'dans les pommes', 'dans les nuages de pluie'], { fr: 'Tu ne m’écoutes pas, tu es encore ___ !' }),
      hear('f', 'Je l’ai attendu une heure au café. Il m’a posé un lapin !', b('What happened to Clara?', 'Qu’est-il arrivé à Clara ?'), [b('She waited an hour and he never came', 'Elle a attendu une heure et il n’est jamais venu'), b('He arrived one hour early', 'Il est arrivé une heure en avance'), b('She forgot the meeting', 'Elle a oublié le rendez-vous')]),
      card(b('Idioms are fixed', 'Les expressions sont figées'), b('You cannot change the words of an idiom: *il pleut des cordes*, never *il pleut des ficelles*. But you can conjugate the verb: *il m’a posé un lapin, elle est tombée dans les pommes, j’avais le cafard*.', 'On ne peut pas changer les mots d’une expression : *il pleut des cordes*, jamais *il pleut des ficelles*. Mais on conjugue le verbe : *il m’a posé un lapin, elle est tombée dans les pommes, j’avais le cafard*.'), { variant: 'trap' }),
      { kind: 'speak', prompt: b('Say it with feeling.', 'Dites-le avec conviction.'), text: 'Il pleut des cordes, on reste à la maison !', tr: b('It’s pouring, we’re staying home!', 'Il pleut très fort, on reste à la maison !') },
    ],
    notes: {
      points: [
        b('Poser un lapin = to stand someone up; il pleut des cordes = it is pouring.', 'Poser un lapin = ne pas venir au rendez-vous ; il pleut des cordes = il pleut très fort.'),
        b('Être dans la lune = to daydream; tomber dans les pommes = to faint.', 'Être dans la lune = être distrait ; tomber dans les pommes = s’évanouir.'),
        b('Coûter les yeux de la tête = very expensive; faire la grasse matinée = to sleep in.', 'Coûter les yeux de la tête = très cher ; faire la grasse matinée = se lever tard.'),
        b('The words of an idiom never change; only the verb is conjugated.', 'Les mots d’une expression ne changent pas ; seul le verbe se conjugue.'),
      ],
      vocab: [['poser un lapin', b('to stand someone up', 'ne pas venir au rendez-vous')], ['être dans la lune', b('to daydream', 'être distrait')], ['tomber dans les pommes', b('to faint', 's’évanouir')], ['avoir le cafard', b('to feel down', 'être un peu triste')]],
    },
  },
  {
    id: 'french-idioms-2',
    slug: { en: 'food-and-animal-idioms', fr: 'expressions-avec-la-nourriture-et-les-animaux' },
    title: b('Idioms with food and animals', 'Les expressions avec la nourriture et les animaux'),
    summary: b('Avoir la pêche, ne pas être dans son assiette, raconter des salades: the idioms French people cook up with food and animals.', 'Avoir la pêche, ne pas être dans son assiette, raconter des salades : les expressions que les francophones mijotent avec la nourriture et les animaux.'),
    objectives: [b('Understand ten food and animal idioms', 'Comprendre dix expressions avec la nourriture et les animaux'), b('Tell feelings with idioms', 'Exprimer ses émotions avec des expressions'), b('Recognise them in a conversation', 'Les reconnaître dans une conversation')],
    minutes: 13,
    steps: [
      card(b('A language that loves food', 'Une langue qui aime manger'), b('French cooks with words: you can **have the peach** (be full of energy), **not be in your plate** (feel unwell) or **tell salads** (tell lies). Animals are everywhere too: a **cat in the throat**, hens with **teeth**…', 'Le français cuisine avec les mots : on peut **avoir la pêche** (être en forme), **ne pas être dans son assiette** (ne pas se sentir bien) ou **raconter des salades** (mentir). Les animaux sont partout aussi : un **chat dans la gorge**, des poules avec des **dents**…')),
      guess('idiom-assiette', b('“Ne pas être dans son assiette” (not to be in your plate). How does he feel?', '« Ne pas être dans son assiette ». Comment se sent-il ?'), [b('Not well, a bit ill or low', 'Pas bien, un peu malade ou déprimé'), b('Very hungry', 'Il a très faim'), b('Happy after a good meal', 'Content après un bon repas')], b('*Je ne suis pas dans mon assiette aujourd’hui, je rentre tôt.* The opposite: **avoir la pêche** (to feel great).', '*Je ne suis pas dans mon assiette aujourd’hui, je rentre tôt.* Le contraire : **avoir la pêche** (être en pleine forme).')),
      { kind: 'flashcards', title: b('On the menu', 'Au menu'), cards: [
        { fr: 'avoir la pêche', tr: b('to be full of energy', 'être en pleine forme'), ex: 'Ce matin, j’ai la pêche !' },
        { fr: 'raconter des salades', tr: b('to tell tall stories, lies', 'mentir, inventer'), ex: 'Arrête de me raconter des salades.' },
        { fr: 'c’est la fin des haricots', tr: b('it’s the end, all is lost', 'c’est la catastrophe'), ex: 'Plus de café ? C’est la fin des haricots !' },
        { fr: 'mettre les pieds dans le plat', tr: b('to put your foot in it', 'parler d’un sujet délicat sans tact'), ex: 'Il a mis les pieds dans le plat en parlant de son ex.' },
        { fr: 'tourner au vinaigre', tr: b('to turn sour', 'mal finir'), ex: 'La discussion a tourné au vinaigre.' },
      ] },
      { kind: 'flashcards', title: b('At the zoo', 'Au zoo'), cards: [
        { fr: 'avoir un chat dans la gorge', tr: b('to have a frog in your throat', 'avoir la voix enrouée'), ex: 'Excusez-moi, j’ai un chat dans la gorge.' },
        { fr: 'quand les poules auront des dents', tr: b('when pigs fly', 'jamais'), ex: 'Il rangera sa chambre quand les poules auront des dents.' },
        { fr: 'donner sa langue au chat', tr: b('to give up guessing', 'abandonner, demander la réponse'), ex: 'Je ne trouve pas, je donne ma langue au chat.' },
        { fr: 'avoir une faim de loup', tr: b('to be starving', 'avoir très faim'), ex: 'Après le ski, j’ai une faim de loup.' },
        { fr: 'appeler un chat un chat', tr: b('to call a spade a spade', 'dire les choses franchement'), ex: 'Appelons un chat un chat : c’est un échec.' },
      ] },
      { kind: 'categorize', prompt: b('Good mood or bad situation?', 'Bonne humeur ou mauvaise situation ?'), buckets: [b('Feeling good', 'On va bien'), b('Something is wrong', 'Ça ne va pas')], items: [{ text: 'avoir la pêche', bucket: 0 }, { text: 'avoir une faim de loup', bucket: 0 }, { text: 'ne pas être dans son assiette', bucket: 1 }, { text: 'tourner au vinaigre', bucket: 1 }, { text: 'c’est la fin des haricots', bucket: 1 }] },
      ask(b('Your friend asks you a riddle and you cannot find the answer. What do you say?', 'Un ami vous pose une devinette et vous ne trouvez pas. Que dites-vous ?'), ['Je donne ma langue au chat.', 'J’ai un chat dans la gorge.', 'J’appelle un chat un chat.']),
      ask(b('Which idiom completes the sentence?', 'Quelle expression complète la phrase ?'), ['quand les poules auront des dents', 'quand il pleuvra des cordes', 'quand j’aurai la pêche'], { fr: 'Lui, arriver à l’heure ? Oui, ___ !', explain: b('Ironic: he will never be on time.', 'Ironique : il ne sera jamais à l’heure.') }),
      hear('m', 'Ne me raconte pas de salades : je sais que tu n’étais pas malade hier.', b('What does he mean?', 'Que veut-il dire ?'), [b('Don’t lie to me', 'Ne me mens pas'), b('Don’t cook a salad for me', 'Ne me prépare pas de salade'), b('Don’t tell me you are ill', 'Ne me dis pas que tu es malade')]),
      {
        kind: 'dialogue',
        title: b('A bad morning', 'Une mauvaise matinée'),
        speakers: [CLARA, ME],
        lines: [
          { s: 0, fr: 'Salut… Excuse-moi, j’ai un chat dans la gorge ce matin.', tr: 'Hi… Sorry, I have a frog in my throat this morning.' },
          { s: 1, choose: { options: ['Tu n’as pas l’air dans ton assiette. Ça va ?', 'Tu as la pêche, on dirait !', 'Tu me poses un lapin ?'], answer: 0, explain: b('She is hoarse and tired: she is “not in her plate”.', 'Elle est enrouée et fatiguée : elle n’est pas dans son assiette.') } },
          { s: 0, fr: 'Bof. Et en plus, la réunion d’hier a tourné au vinaigre.', tr: 'Not really. And on top of that, yesterday’s meeting turned sour.' },
          { s: 1, choose: { options: ['Ah bon ? Quelqu’un a mis les pieds dans le plat ?', 'Génial, c’est la fin des haricots !', 'Tu as une faim de loup ?'], answer: 0 } },
          { s: 0, fr: 'Oui, Marc a parlé des licenciements devant tout le monde. Bref, je vais prendre un thé.', tr: 'Yes, Marc talked about the layoffs in front of everyone. Anyway, I’m going to have a tea.' },
        ],
      },
      { kind: 'speak', prompt: b('Say it.', 'Dites-le.'), text: 'Aujourd’hui, j’ai la pêche !', tr: b('Today I feel great!', 'Aujourd’hui, je suis en pleine forme !') },
    ],
    notes: {
      points: [
        b('Avoir la pêche = feel great; ne pas être dans son assiette = not feel well.', 'Avoir la pêche = être en forme ; ne pas être dans son assiette = ne pas se sentir bien.'),
        b('Raconter des salades = to lie; mettre les pieds dans le plat = to put your foot in it.', 'Raconter des salades = mentir ; mettre les pieds dans le plat = manquer de tact.'),
        b('Quand les poules auront des dents = never; donner sa langue au chat = to give up guessing.', 'Quand les poules auront des dents = jamais ; donner sa langue au chat = abandonner.'),
        b('Avoir un chat dans la gorge = to be hoarse; avoir une faim de loup = to be starving.', 'Avoir un chat dans la gorge = être enroué ; avoir une faim de loup = avoir très faim.'),
      ],
      vocab: [['enroué', b('hoarse', 'avec une voix cassée')], ['tourner au vinaigre', b('to turn sour', 'mal finir')], ['une devinette', b('a riddle', 'une petite énigme')], ['les licenciements', b('layoffs', 'quand une entreprise renvoie des employés')]],
    },
  },
  {
    id: 'french-idioms-3',
    slug: { en: 'work-feelings-and-quebec-idioms', fr: 'travail-emotions-et-expressions-du-quebec' },
    title: b('Work, feelings and Québec idioms', 'Travail, émotions et expressions du Québec'),
    summary: b('Avoir du pain sur la planche, en avoir ras le bol, être aux oiseaux: idioms for the office, for strong feelings, and the colourful idioms of Québec.', 'Avoir du pain sur la planche, en avoir ras le bol, être aux oiseaux : des expressions pour le bureau, pour les émotions fortes, et les expressions colorées du Québec.'),
    objectives: [b('Use work idioms', 'Employer des expressions du travail'), b('Express annoyance and surprise', 'Exprimer l’agacement et la surprise'), b('Understand Québec idioms', 'Comprendre des expressions québécoises')],
    minutes: 14,
    steps: [
      guess('idiom-pain', b('“Avoir du pain sur la planche” (to have bread on the board). What is his situation?', '« Avoir du pain sur la planche ». Quelle est sa situation ?'), [b('He has a lot of work to do', 'Il a beaucoup de travail'), b('He works in a bakery', 'Il travaille dans une boulangerie'), b('He has finished his work', 'Il a terminé son travail')], b('Bread waiting on the board = work waiting to be done. *Cette semaine, j’ai du pain sur la planche.*', 'Du pain qui attend sur la planche = du travail qui attend. *Cette semaine, j’ai du pain sur la planche.*')),
      { kind: 'flashcards', title: b('At the office', 'Au bureau'), cards: [
        { fr: 'mettre la main à la pâte', tr: b('to lend a hand, pitch in', 'participer au travail'), ex: 'Le directeur aussi a mis la main à la pâte.' },
        { fr: 'se serrer les coudes', tr: b('to stick together', 's’entraider'), ex: 'Dans les moments difficiles, l’équipe se serre les coudes.' },
        { fr: 'avoir le bras long', tr: b('to have influence, connections', 'avoir de l’influence'), ex: 'Son oncle a le bras long.' },
        { fr: 'travailler d’arrache-pied', tr: b('to work flat out', 'travailler très dur'), ex: 'Ils ont travaillé d’arrache-pied pour finir à temps.' },
      ] },
      { kind: 'flashcards', title: b('Strong feelings', 'Les émotions fortes'), cards: [
        { fr: 'en avoir ras le bol', tr: b('to be fed up', 'ne plus supporter'), ex: 'J’en ai ras le bol de ces bouchons !' },
        { fr: 'casser les pieds à quelqu’un', tr: b('to annoy someone', 'ennuyer quelqu’un'), ex: 'Tu me casses les pieds avec tes questions.' },
        { fr: 'prendre la mouche', tr: b('to take offence quickly', 'se vexer facilement'), ex: 'Il prend la mouche pour un rien.' },
        { fr: 'tomber des nues', tr: b('to be astounded', 'être très surpris'), ex: 'Quand j’ai appris la nouvelle, je suis tombé des nues.' },
      ] },
      { kind: 'match', prompt: b('Match each idiom with its meaning.', 'Associez chaque expression à son sens.'), pairs: [['avoir du pain sur la planche', b('to have a lot of work', 'avoir beaucoup de travail')], ['se serrer les coudes', b('to stick together', 's’entraider')], ['en avoir ras le bol', b('to be fed up', 'ne plus supporter')], ['tomber des nues', b('to be astounded', 'être très surpris')], ['prendre la mouche', b('to take offence', 'se vexer')]] },
      ask(b('Which idiom completes the sentence?', 'Quelle expression complète la phrase ?'), ['se serrer les coudes', 'casser les pieds', 'prendre la mouche'], { fr: 'Le projet est en retard : il faut ___ et finir ensemble.' }),
      hear('f2', 'Trois réunions inutiles aujourd’hui… J’en ai vraiment ras le bol.', b('How does she feel?', 'Comment se sent-elle ?'), [b('Fed up', 'Exaspérée'), b('Surprised', 'Surprise'), b('Happy', 'Contente')]),
      card(b('The idioms of Québec', 'Les expressions du Québec'), b('Québec French has a treasure of idioms, often linked to winter and nature. You will hear them on the radio, at work and in families.', 'Le français du Québec possède un trésor d’expressions, souvent liées à l’hiver et à la nature. Vous les entendrez à la radio, au travail et en famille.'), { variant: 'culture', examples: [
        { fr: 'être aux oiseaux', tr: b('to be over the moon', 'être très heureux') },
        { fr: 'attache ta tuque', tr: b('hold on tight, it’s going to be intense', 'prépare-toi, ça va bouger') },
        { fr: 'lâche pas la patate', tr: b('don’t give up', 'n’abandonne pas') },
        { fr: 'il fait frette', tr: b('it’s freezing cold', 'il fait très froid') },
        { fr: 'tomber en amour', tr: b('to fall in love', 'tomber amoureux') },
      ] }),
      { kind: 'categorize', prompt: b('Encouragement or happiness?', 'Encouragement ou bonheur ?'), buckets: [b('Encouragement', 'Encouragement'), b('Happiness', 'Bonheur')], items: [{ text: 'lâche pas la patate', bucket: 0 }, { text: 'attache ta tuque', bucket: 0 }, { text: 'être aux oiseaux', bucket: 1 }, { text: 'tomber en amour', bucket: 1 }] },
      hear('m2', 'Elle a eu le poste ! Elle est aux oiseaux.', b('How is she?', 'Comment est-elle ?'), [b('Very happy', 'Très heureuse'), b('Worried', 'Inquiète'), b('Busy with birds', 'Occupée avec des oiseaux')], b('“Être aux oiseaux” = to be delighted, a Québec idiom.', '« Être aux oiseaux » = être ravi, expression québécoise.')),
      { kind: 'write', prompt: b('Tell a story with idioms.', 'Racontez une histoire avec des expressions.'), task: b('In 60 to 100 words, tell about a difficult week (at work or at home) and how it ended. Use at least three idioms from this course.', 'En 60 à 100 mots, racontez une semaine difficile (au travail ou à la maison) et comment elle s’est terminée. Utilisez au moins trois expressions de ce cours.'), min: 60, max: 100, checklist: [b('At least three idioms', 'Au moins trois expressions'), b('Verbs in the past', 'Des verbes au passé'), b('A beginning, a problem, an end', 'Un début, un problème, une fin')], phrases: ['Lundi, j’avais du pain sur la planche…', 'Mercredi, j’en avais ras le bol…', 'Heureusement, on s’est serré les coudes…', 'Vendredi, j’étais aux oiseaux !'], model: 'Lundi, j’avais du pain sur la planche : trois rapports à finir avant vendredi. Mardi, mon collègue m’a posé un lapin pour notre réunion, et mercredi, j’en avais ras le bol. Heureusement, toute l’équipe s’est serré les coudes et même la directrice a mis la main à la pâte. Vendredi midi, tout était prêt. Je suis tombé des nues quand elle nous a invités au restaurant. J’étais aux oiseaux !' },
    ],
    notes: {
      points: [
        b('Work: avoir du pain sur la planche, mettre la main à la pâte, se serrer les coudes.', 'Travail : avoir du pain sur la planche, mettre la main à la pâte, se serrer les coudes.'),
        b('Feelings: en avoir ras le bol (fed up), casser les pieds (annoy), tomber des nues (astounded).', 'Émotions : en avoir ras le bol, casser les pieds, tomber des nues.'),
        b('Québec: être aux oiseaux (delighted), lâche pas la patate (don’t give up), il fait frette (freezing).', 'Québec : être aux oiseaux (ravi), lâche pas la patate (n’abandonne pas), il fait frette (très froid).'),
        b('Use two or three idioms in a text: more sounds artificial.', 'Utilisez deux ou trois expressions dans un texte : davantage sonnerait artificiel.'),
      ],
      vocab: [['d’arrache-pied', b('flat out', 'avec beaucoup d’efforts')], ['ras le bol', b('fed up', 'exaspéré')], ['la tuque', b('winter hat (Québec)', 'bonnet d’hiver')], ['frette', b('freezing (Québec)', 'très froid')]],
    },
  },
];

export default lessons;
