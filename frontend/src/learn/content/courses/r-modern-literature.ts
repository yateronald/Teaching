import type { CourseAbout, Doc } from '../../types';
import { b, card, doc, gap, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'How does a novelist make us see a place, hear a voice, feel a silence? This course offers three original contemporary passages written for B2 readers (a first-person memory, a dialogue full of what is left unsaid, a descriptive opening) and trains you to analyse the narrator’s point of view, the role of dialogue and implicit meaning, and the effects of style: images, rhythm and word choice.',
    'Comment un romancier nous fait-il voir un lieu, entendre une voix, sentir un silence ? Ce cours propose trois passages contemporains originaux écrits pour des lecteurs de niveau B2 (un souvenir à la première personne, un dialogue riche en non-dits, une ouverture descriptive) et vous entraîne à analyser le point de vue du narrateur, le rôle du dialogue et de l’implicite, et les effets du style : images, rythme et choix des mots.',
  ),
  outcomes: [
    b('Identify the narrator and the point of view', 'Identifier le narrateur et le point de vue'),
    b('Understand what is left unsaid in a dialogue', 'Comprendre les non-dits d’un dialogue'),
    b('Analyse images and comparisons', 'Analyser les images et les comparaisons'),
    b('Describe the atmosphere of a passage', 'Décrire l’atmosphère d’un passage'),
  ],
};

const T1: Doc = { look: 'page', title: b('Extract 1: a memory', 'Extrait 1 : un souvenir'), text: 'Je n’ai jamais su pourquoi ma grand-mère gardait ce vieux moulin à café sur le rebord de la fenêtre. Il ne servait plus depuis longtemps ; la manivelle grinçait, le tiroir ne fermait plus. Pourtant, chaque matin, elle l’essuyait avec le coin de son tablier, comme on caresse la tête d’un enfant. Ce n’est qu’à sa mort, en vidant la maison, que j’ai trouvé la photo glissée sous le tiroir : un homme jeune, en uniforme, qui souriait.' };
const T2: Doc = { look: 'page', title: b('Extract 2: a dialogue', 'Extrait 2 : un dialogue'), text: '— Tu as eu des nouvelles de ton frère ?\n— Non.\nMaman a reposé sa tasse un peu trop fort. Le café a débordé sur la nappe blanche, et elle n’a même pas pris la peine de l’essuyer.\n— Il a peut-être perdu son téléphone, ai-je dit.\n— Peut-être.\nDehors, la pluie s’est mise à tomber. Personne n’a fermé la fenêtre.' };
const T3: Doc = { look: 'page', title: b('Extract 3: an opening', 'Extrait 3 : une ouverture'), text: 'Le village dormait encore sous une couche de brume, épaisse comme de la laine. Seul le clocher dépassait, pointé vers un ciel couleur d’étain. Dans la rue principale, les volets restaient clos ; un chien traversa sans se presser, puis disparut derrière la fontaine. C’est ce matin-là, à six heures dix, que l’autobus de Montréal déposa une inconnue devant l’épicerie fermée.' };

const C = 'r-modern-literature';
export default [
  lesson(C, 1, ['narrator-and-point-of-view', 'narrateur-et-point-de-vue'],
    b('The narrator and the point of view', 'Le narrateur et le point de vue'),
    b('Identify who tells the story and what the narrator knows or discovers.', 'Identifier qui raconte et ce que le narrateur sait ou découvre.'),
    [b('Recognise a first-person narrator', 'Reconnaître un narrateur à la première personne'), b('Understand a revelation at the end', 'Comprendre une révélation finale'), b('Interpret a comparison', 'Interpréter une comparaison')],
    13,
    [
      card(b('Who is speaking?', 'Qui parle ?'), b('A **first-person narrator** (je) tells his or her own story and only knows what he or she saw or understood. A **third-person narrator** (il / elle) can be outside the story, sometimes knowing everyone’s thoughts. Ask: **who sees? who knows? when?**', 'Un **narrateur à la première personne** (je) raconte sa propre histoire et ne sait que ce qu’il a vu ou compris. Un **narrateur à la troisième personne** (il / elle) peut être extérieur, parfois omniscient. Demandez-vous : **qui voit ? qui sait ? quand ?**')),
      doc(T1, b('Who is the narrator?', 'Qui est le narrateur ?'), [b('The grandmother’s grandchild, remembering', 'Le petit-enfant de la grand-mère, qui se souvient'), b('The grandmother', 'La grand-mère'), b('The young man in uniform', 'Le jeune homme en uniforme'), b('An outside narrator who knows everything', 'Un narrateur extérieur qui sait tout')]),
      doc(T1, b('What does the comparison « comme on caresse la tête d’un enfant » suggest?', 'Que suggère la comparaison « comme on caresse la tête d’un enfant » ?'), [b('Tenderness: the object has great emotional value.', 'La tendresse : l’objet a une grande valeur affective.'), b('That she had many children', 'Qu’elle avait beaucoup d’enfants'), b('That the grinder was dirty', 'Que le moulin était sale'), b('That she was angry', 'Qu’elle était en colère')]),
      doc(T1, b('What do we understand at the end?', 'Que comprend-on à la fin ?'), [b('The grinder was linked to a man she loved.', 'Le moulin était lié à un homme qu’elle aimait.'), b('The grinder was valuable.', 'Le moulin avait une grande valeur marchande.'), b('The narrator wanted to sell the house.', 'Le narrateur voulait vendre la maison.'), b('The grandmother hated coffee.', 'La grand-mère détestait le café.')]),
      pairs(P.match, [['grincer', b('to creak, to squeak', 'faire un bruit aigu')], ['la manivelle', b('the crank, handle', 'poignée qu’on tourne')], ['le tablier', b('the apron', 'vêtement de cuisine')], ['le rebord', b('the ledge, sill', 'bord saillant')]]),
      gap(P.complete, 'Le narrateur ne comprend le secret qu’à la ___ de sa grand-mère, en découvrant une ___ sous le tiroir.', ['mort', 'photo']),
    ],
    [
      b('First-person narrator: limited knowledge, personal tone.', 'Narrateur à la 1re personne : savoir limité, ton personnel.'),
      b('Comparison (comme…) reveals a feeling.', 'La comparaison (comme…) révèle un sentiment.'),
      b('A final revelation changes the meaning of what came before.', 'Une révélation finale change le sens de ce qui précède.'),
    ],
    [['un moulin à café', b('a coffee grinder', 'appareil pour moudre le café')], ['essuyer', b('to wipe', 'nettoyer avec un linge')], ['glissé', b('slipped (in)', 'introduit discrètement')]],
  ),
  lesson(C, 2, ['dialogue-and-the-unsaid', 'dialogue-et-non-dits'],
    b('Dialogue and the unsaid', 'Le dialogue et les non-dits'),
    b('Read between the lines: gestures and silences that reveal emotions.', 'Lire entre les lignes : gestes et silences qui révèlent les émotions.'),
    [b('Interpret short answers', 'Interpréter les réponses brèves'), b('Interpret gestures', 'Interpréter les gestes'), b('Understand the symbolic role of the setting', 'Comprendre le rôle symbolique du décor')],
    13,
    [
      tip(b('What is not said', 'Ce qui n’est pas dit'), b('In modern fiction, emotions are often **not named**. Look at **short replies** (— Non. — Peut-être.), **gestures** (reposer sa tasse trop fort) and **details of the setting** (la pluie, la fenêtre ouverte).', 'Dans la fiction moderne, les émotions sont souvent **non nommées**. Observez les **répliques brèves** (— Non. — Peut-être.), les **gestes** (reposer sa tasse trop fort) et les **détails du décor** (la pluie, la fenêtre ouverte).')),
      doc(T2, b('What does the mother feel?', 'Que ressent la mère ?'), [b('Worry and tension she does not express in words', 'De l’inquiétude et une tension qu’elle n’exprime pas en mots'), b('Joy', 'De la joie'), b('Indifference', 'De l’indifférence'), b('Hunger', 'De la faim')]),
      doc(T2, b('Which detail shows her emotion best?', 'Quel détail montre le mieux son émotion ?'), [b('She does not wipe the spilt coffee.', 'Elle n’essuie pas le café renversé.'), b('She drinks coffee.', 'Elle boit du café.'), b('The tablecloth is white.', 'La nappe est blanche.'), b('She answers « Non ».', 'Elle répond « Non ».')]),
      doc(T2, b('What does « Peut-être. » suggest?', 'Que suggère « Peut-être. » ?'), [b('She does not believe this explanation.', 'Elle ne croit pas à cette explication.'), b('She is sure the phone is lost.', 'Elle est sûre que le téléphone est perdu.'), b('She wants to change the subject to the weather.', 'Elle veut parler de la météo.'), b('She is happy.', 'Elle est contente.')]),
      sort(b('Said or shown?', 'Dit ou montré ?'), [b('said explicitly', 'dit explicitement'), b('shown implicitly', 'montré implicitement')], [['« Non. »', 0], ['la tasse reposée trop fort', 1], ['« Il a peut-être perdu son téléphone »', 0], ['personne ne ferme la fenêtre', 1]]),
      pairs(P.match, [['déborder', b('to overflow, to spill', 'dépasser les bords')], ['la nappe', b('the tablecloth', 'tissu sur la table')], ['prendre la peine de', b('to bother to', 'faire l’effort de')], ['un non-dit', b('something left unsaid', 'ce qu’on ne dit pas')]]),
      mc(P.meaning, [b('The family is stuck in worry; nobody reacts.', 'La famille est figée dans l’inquiétude ; personne ne réagit.'), b('It is a nice summer day.', 'C’est une belle journée d’été.'), b('Someone will go out.', 'Quelqu’un va sortir.'), b('The window is broken.', 'La fenêtre est cassée.')], { fr: 'Dehors, la pluie s’est mise à tomber. Personne n’a fermé la fenêtre.' }),
    ],
    [
      b('Short replies and gestures reveal emotions.', 'Les répliques brèves et les gestes révèlent les émotions.'),
      b('The setting can echo feelings (rain, open window).', 'Le décor peut faire écho aux sentiments (pluie, fenêtre ouverte).'),
      b('un non-dit = something meaningful left unsaid.', 'un non-dit = ce qui est signifiant sans être dit.'),
    ],
    [['reposer', b('to put back down', 'poser de nouveau')], ['une tasse', b('a cup', 'récipient pour boire')], ['se mettre à', b('to start to', 'commencer à')]],
  ),
  lesson(C, 3, ['description-and-style', 'description-et-style'],
    b('An opening: description and style', 'Une ouverture : description et style'),
    b('Analyse images, rhythm and the way an opening creates expectation.', 'Analyser les images, le rythme et la façon dont une ouverture crée l’attente.'),
    [b('Recognise metaphors and comparisons', 'Reconnaître métaphores et comparaisons'), b('Describe the atmosphere', 'Décrire l’atmosphère'), b('Understand the role of the last sentence', 'Comprendre le rôle de la dernière phrase')],
    13,
    [
      card(b('Images and atmosphere', 'Images et atmosphère'), b('A **comparaison** uses comme / tel / pareil à (épaisse comme de la laine). A **métaphore** compares without a tool (le village dormait). Together with colours, sounds and rhythm, they create an **atmosphère**: calm, mysterious, threatening…', 'La **comparaison** emploie comme / tel / pareil à (épaisse comme de la laine). La **métaphore** compare sans outil (le village dormait). Avec les couleurs, les sons et le rythme, elles créent une **atmosphère** : calme, mystérieuse, menaçante…')),
      doc(T3, b('What is the atmosphere of the opening?', 'Quelle est l’atmosphère de l’ouverture ?'), [b('Calm, grey and a little mysterious', 'Calme, grise et un peu mystérieuse'), b('Noisy and festive', 'Bruyante et festive'), b('Hot and sunny', 'Chaude et ensoleillée'), b('Violent and dangerous', 'Violente et dangereuse')]),
      doc(T3, b('« Le village dormait encore » is…', '« Le village dormait encore » est…'), [b('a metaphor (personification)', 'une métaphore (personnification)'), b('a comparison with comme', 'une comparaison avec comme'), b('a quote', 'une citation'), b('a dialogue', 'un dialogue')]),
      doc(T3, b('What is the role of the last sentence?', 'Quel est le rôle de la dernière phrase ?'), [b('It introduces an event and a mystery: the arrival of a stranger.', 'Elle introduit un événement et un mystère : l’arrivée d’une inconnue.'), b('It ends the story.', 'Elle termine l’histoire.'), b('It describes the weather.', 'Elle décrit la météo.'), b('It gives the narrator’s opinion.', 'Elle donne l’opinion du narrateur.')]),
      sort(b('Comparison or metaphor?', 'Comparaison ou métaphore ?'), [b('comparison (comme…)', 'comparaison (comme…)'), b('metaphor', 'métaphore')], [['une brume épaisse comme de la laine', 0], ['le village dormait', 1], ['un ciel couleur d’étain', 1], ['comme on caresse la tête d’un enfant', 0]]),
      pairs(P.match, [['la brume', b('mist', 'brouillard léger')], ['le clocher', b('the bell tower', 'tour de l’église')], ['l’étain', b('pewter, tin', 'métal gris')], ['clos', b('closed', 'fermé')]]),
      gap(P.complete, 'La brume est comparée à de la ___ ; le ciel a la couleur de l’___.', ['laine', 'étain']),
    ],
    [
      b('Comparison: comme, tel, pareil à. Metaphor: without a tool.', 'Comparaison : comme, tel, pareil à. Métaphore : sans outil.'),
      b('Personification: an object acts like a person (le village dormait).', 'Personnification : une chose agit comme une personne (le village dormait).'),
      b('An opening sets the atmosphere, then introduces an event.', 'Une ouverture installe l’atmosphère, puis introduit un événement.'),
    ],
    [['un volet', b('a shutter', 'panneau devant la fenêtre')], ['une inconnue', b('a stranger (woman)', 'femme qu’on ne connaît pas')], ['se presser', b('to hurry', 'aller vite')]],
  ),
];
