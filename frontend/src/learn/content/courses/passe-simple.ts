import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Il ouvrit la porte et vit la lettre. The passé simple is the tense of novels, tales, biographies and history books: you rarely speak it, but you must read it with ease from B2 upwards. This course teaches you to recognise its three families of endings, the frequent irregular forms (il fut, il eut, il fit, il vint, il dit), the third-person forms used in the press, and the literary tenses that come with it (passé antérieur, imperfect subjunctive).',
    'Il ouvrit la porte et vit la lettre. Le passé simple est le temps des romans, des contes, des biographies et des livres d’histoire : on le parle rarement, mais il faut le lire avec aisance dès le B2. Ce cours vous apprend à reconnaître ses trois familles de terminaisons, les formes irrégulières fréquentes (il fut, il eut, il fit, il vint, il dit), les formes de troisième personne employées dans la presse, et les temps littéraires qui l’accompagnent (passé antérieur, subjonctif imparfait).',
  ),
  outcomes: [
    b('Recognise the three endings of the passé simple', 'Reconnaître les trois séries de terminaisons du passé simple'),
    b('Identify the frequent irregular forms', 'Identifier les formes irrégulières fréquentes'),
    b('Read a literary or historical text fluently', 'Lire un texte littéraire ou historique avec aisance'),
    b('Recognise the passé antérieur and the imperfect subjunctive', 'Reconnaître le passé antérieur et le subjonctif imparfait'),
  ],
};

const C = 'passe-simple';
export default [
  lesson(C, 1, ['recognising-the-passe-simple', 'reconnaitre-le-passe-simple'],
    b('Recognising the passé simple', 'Reconnaître le passé simple'),
    b('Identify the -a, -it and -ut endings and convert them to the passé composé.', 'Identifier les terminaisons en -a, -it et -ut et les convertir au passé composé.'),
    [b('Recognise -er verbs: il parla, ils parlèrent', 'Reconnaître les verbes en -er : il parla, ils parlèrent'), b('Recognise -it and -ut forms', 'Reconnaître les formes en -it et en -ut'), b('Translate to the passé composé', 'Transposer au passé composé')],
    13,
    [
      card(b('Three families', 'Trois familles'), b('**-er verbs**: il parl**a**, ils parl**èrent**. **-ir / -re verbs**: il fin**it**, il prend → il pr**it**, ils pr**irent**. **-oir and some others**: il v**oulut**, il c**ourut**, ils c**urent**. Most texts use **il / elle / ils / elles**.', '**Verbes en -er** : il parl**a**, ils parl**èrent**. **-ir / -re** : il fin**it**, il pr**it**, ils pr**irent**. **-oir et quelques autres** : il v**oulut**, il c**ourut**, ils c**urent**. La plupart des textes emploient **il / elle / ils / elles**.'), {
        table: { head: [b('infinitive', 'infinitif'), 'il / elle', 'ils / elles', b('passé composé', 'passé composé')], rows: [['entrer', 'entra', 'entrèrent', 'est entré'], ['finir', 'finit', 'finirent', 'a fini'], ['prendre', 'prit', 'prirent', 'a pris'], ['vouloir', 'voulut', 'voulurent', 'a voulu']] },
      }),
      trap(b('Il finit: present or passé simple?', 'Il finit : présent ou passé simple ?'), b('For many -ir verbs, **il finit** is both present and passé simple. The context and the other verbs of the text decide.', 'Pour de nombreux verbes en -ir, **il finit** est à la fois présent et passé simple. Le contexte et les autres verbes du texte tranchent.')),
      pairs(b('Match each passé simple with its infinitive.', 'Associez chaque passé simple à son infinitif.'), [['il marcha', 'marcher'], ['elle répondit', 'répondre'], ['ils crurent', 'croire'], ['elles partirent', 'partir']], true),
      mc(P.meaning, [b('they arrived', 'ils sont arrivés'), b('they will arrive', 'ils arriveront'), b('they were arriving', 'ils arrivaient'), b('they would arrive', 'ils arriveraient')], { fr: 'Ils arrivèrent à l’aube.' }),
      sort(b('Which family?', 'Quelle famille ?'), [b('-a / -èrent', '-a / -èrent'), b('-it / -irent', '-it / -irent'), b('-ut / -urent', '-ut / -urent')], [['il chanta', 0], ['il sortit', 1], ['il connut', 2], ['ils tombèrent', 0], ['ils dormirent', 1], ['ils lurent', 2]]),
      gap(P.complete, 'Elle ___ (entrer), ___ (regarder) autour d’elle et ___ (sourire).', ['entra', 'regarda', 'sourit']),
      dict('Le vieil homme se leva lentement et marcha vers la fenêtre.', { voice: 'm' }),
    ],
    [
      b('-er: il parla, ils parlèrent; -ir/-re: il finit, il prit; -oir: il voulut.', '-er : il parla, ils parlèrent ; -ir/-re : il finit, il prit ; -oir : il voulut.'),
      b('Mostly third person in texts.', 'Surtout à la troisième personne dans les textes.'),
      b('Same meaning as the passé composé, written narrative style.', 'Même sens que le passé composé, style écrit du récit.'),
    ],
    [['l’aube', b('dawn', 'lever du jour')], ['sourire', b('to smile', 'faire un sourire')], ['se lever', b('to get up', 'se mettre debout')]],
  ),
  lesson(C, 2, ['irregular-forms', 'formes-irregulieres'],
    b('Fut, eut, fit, vint, dit: the irregular forms', 'Fut, eut, fit, vint, dit : les formes irrégulières'),
    b('Recognise the most frequent irregular verbs in texts.', 'Reconnaître les verbes irréguliers les plus fréquents dans les textes.'),
    [b('Recognise être, avoir, faire, venir, voir', 'Reconnaître être, avoir, faire, venir, voir'), b('Avoid confusing il fut and il fit', 'Ne pas confondre il fut et il fit'), b('Read a short biography', 'Lire une courte biographie')],
    13,
    [
      card(b('The frequent irregulars', 'Les irréguliers fréquents'), b('**être → il fut, ils furent**; **avoir → il eut, ils eurent**; **faire → il fit, ils firent**; **venir → il vint, ils vinrent**; **voir → il vit, ils virent**; **dire → il dit**; **mettre → il mit**; **naître → il naquit**; **mourir → il mourut**.', '**être → il fut, ils furent** ; **avoir → il eut, ils eurent** ; **faire → il fit, ils firent** ; **venir → il vint, ils vinrent** ; **voir → il vit, ils virent** ; **dire → il dit** ; **mettre → il mit** ; **naître → il naquit** ; **mourir → il mourut**.')),
      pairs(b('Match each form with its infinitive.', 'Associez chaque forme à son infinitif.'), [['il fut', 'être'], ['il fit', 'faire'], ['il eut', 'avoir'], ['il vint', 'venir'], ['elle naquit', 'naître']], true),
      mc(P.meaning, [b('He was elected president.', 'Il a été élu président.'), b('He made a president.', 'Il a fait un président.'), b('He will be elected.', 'Il sera élu.'), b('He had a president.', 'Il a eu un président.')], { fr: 'En 1968, il fut élu président.' }),
      mc(P.meaning, [b('She was born', 'elle est née'), b('she swam', 'elle a nagé'), b('she knew', 'elle a su'), b('she pleased', 'elle a plu')], { fr: 'elle naquit' }),
      doc({ title: b('Biography', 'Biographie'), text: 'Gabrielle Roy naquit en 1909 à Saint-Boniface, au Manitoba. Elle fut d’abord institutrice, puis partit pour l’Europe où elle devint journaliste. En 1945, elle publia Bonheur d’occasion, qui fit d’elle une romancière célèbre et lui valut le prix Femina.' }, P.read, [b('Her first famous novel was published in 1945.', 'Son premier roman célèbre a paru en 1945.'), b('She was born in Montréal.', 'Elle est née à Montréal.'), b('She was a journalist before being a teacher.', 'Elle a été journaliste avant d’être institutrice.'), b('She never left Canada.', 'Elle n’a jamais quitté le Canada.')]),
      gap(P.complete, 'Le roi ___ (avoir) trois fils. Un jour, un étranger ___ (venir) au château.', ['eut', 'vint']),
      dict('Il fut surpris quand il vit la lettre sur la table.', { voice: 'f' }),
    ],
    [
      b('être → fut, avoir → eut, faire → fit, venir → vint, voir → vit.', 'être → fut, avoir → eut, faire → fit, venir → vint, voir → vit.'),
      b('naître → naquit, mourir → mourut, mettre → mit, dire → dit.', 'naître → naquit, mourir → mourut, mettre → mit, dire → dit.'),
      b('il fut (être) ≠ il fit (faire).', 'il fut (être) ≠ il fit (faire).'),
    ],
    [['une institutrice', b('a primary-school teacher', 'enseignante du primaire')], ['valoir', b('to earn (an award)', 'faire obtenir')], ['un romancier, une romancière', b('a novelist', 'auteur de romans')]],
  ),
  lesson(C, 3, ['narrative-and-literary-tenses', 'recit-et-temps-litteraires'],
    b('The narrative system and literary tenses', 'Le système du récit et les temps littéraires'),
    b('Read how the passé simple works with the imparfait, the passé antérieur and the imperfect subjunctive.', 'Lire comment le passé simple s’articule avec l’imparfait, le passé antérieur et le subjonctif imparfait.'),
    [b('Distinguish foreground and background', 'Distinguer premier plan et arrière-plan'), b('Recognise the passé antérieur', 'Reconnaître le passé antérieur'), b('Recognise the imperfect subjunctive', 'Reconnaître le subjonctif imparfait')],
    13,
    [
      card(b('Foreground and background', 'Premier plan et arrière-plan'), b('In a narrative, the **passé simple** gives the successive events, the **imparfait** the background: **Il pleuvait (background). Soudain, quelqu’un frappa (event).** The **passé antérieur** (il eut fini, elle fut partie) marks an event just before another, after **quand, dès que, après que**.', 'Dans un récit, le **passé simple** donne les événements successifs, l’**imparfait** le décor : **Il pleuvait. Soudain, quelqu’un frappa.** Le **passé antérieur** (il eut fini, elle fut partie) marque un événement juste avant un autre, après **quand, dès que, après que**.'), {
        ex: [['Dès qu’il eut fini son repas, il sortit.', 'As soon as he had finished his meal, he went out.'], ['La nuit tombait quand ils arrivèrent au village.', 'Night was falling when they reached the village.']],
      }),
      tip(b('The imperfect subjunctive', 'Le subjonctif imparfait'), b('In classic literature, after a past verb: **Il fallait qu’il partît. Bien qu’elle fût malade…** Today we write **qu’il parte, qu’elle soit**. Just learn to recognise **-ât, -ît, -ût** and **fût / eût**.', 'Dans la littérature classique, après un verbe au passé : **Il fallait qu’il partît. Bien qu’elle fût malade…** Aujourd’hui on écrit **qu’il parte, qu’elle soit**. Apprenez simplement à reconnaître **-ât, -ît, -ût** et **fût / eût**.')),
      sort(b('Background or event?', 'Décor ou événement ?'), [b('background (imparfait)', 'décor (imparfait)'), b('event (passé simple)', 'événement (passé simple)')], [['Le vent soufflait.', 0], ['La porte s’ouvrit.', 1], ['Les enfants dormaient.', 0], ['Un cri retentit.', 1], ['Il faisait nuit.', 0], ['Elle se leva.', 1]]),
      mc(P.meaning, [b('As soon as she had read the letter, she cried.', 'Dès qu’elle a eu lu la lettre, elle a pleuré.'), b('She will read the letter and cry.', 'Elle lira la lettre et pleurera.'), b('She was reading while crying.', 'Elle lisait en pleurant.'), b('She would have read the letter.', 'Elle aurait lu la lettre.')], { fr: 'Dès qu’elle eut lu la lettre, elle pleura.' }),
      mc(P.meaning, [b('Although he was tired… (classic style)', 'Bien qu’il soit fatigué… (style classique)'), b('He will be tired…', 'Il sera fatigué…'), b('He was tired, so…', 'Il était fatigué, donc…'), b('If he had been tired…', 'S’il avait été fatigué…')], { fr: 'Bien qu’il fût fatigué, il continua sa route.' }),
      doc({ title: b('Tale', 'Conte'), text: 'Il était une fois un meunier qui vivait au bord d’une rivière. Un matin d’hiver, il entendit frapper à sa porte. Il ouvrit et découvrit un petit garçon qui tremblait de froid. Le meunier le fit entrer, et dès qu’il l’eut réchauffé, il lui demanda d’où il venait.' }, P.read, [b('The miller warmed the boy before asking where he came from.', 'Le meunier a réchauffé l’enfant avant de lui demander d’où il venait.'), b('The boy lived with the miller.', 'Le garçon vivait avec le meunier.'), b('It happened on a summer evening.', 'Cela s’est passé un soir d’été.'), b('The miller refused to open the door.', 'Le meunier a refusé d’ouvrir.')]),
      dict('Il était une fois une jeune fille qui vivait seule dans la forêt.', { voice: 'f' }),
    ],
    [
      b('Passé simple = events; imparfait = background.', 'Passé simple = événements ; imparfait = décor.'),
      b('Passé antérieur (il eut fini) after dès que, quand, après que.', 'Passé antérieur (il eut fini) après dès que, quand, après que.'),
      b('Imperfect subjunctive (qu’il fût, qu’il partît): recognise only.', 'Subjonctif imparfait (qu’il fût, qu’il partît) : à reconnaître seulement.'),
    ],
    [['un meunier', b('a miller', 'homme qui fait la farine')], ['retentir', b('to ring out', 'résonner')], ['réchauffer', b('to warm up', 'rendre chaud')]],
  ),
];
