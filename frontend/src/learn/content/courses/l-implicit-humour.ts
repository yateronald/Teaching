import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Tu as vu l’heure ? is not a question about the time. Ce n’est pas mal means it is good. At C1, real understanding means hearing what is implied: indirect requests, understatement, irony, wordplay and humour. This course trains your ear on original exchanges where the meaning is between the lines.',
    'Tu as vu l’heure ? n’est pas une question sur l’heure. Ce n’est pas mal veut dire que c’est bien. Au niveau C1, comprendre vraiment, c’est entendre ce qui est sous-entendu : demandes indirectes, litote, ironie, jeux de mots et humour. Ce cours entraîne votre oreille sur des échanges originaux où le sens se lit entre les lignes.',
  ),
  outcomes: [
    b('Understand indirect requests and reproaches', 'Comprendre demandes et reproches indirects'),
    b('Understand understatement (litote)', 'Comprendre la litote'),
    b('Recognise irony and sarcasm', 'Reconnaître ironie et sarcasme'),
    b('Understand wordplay and humour', 'Comprendre jeux de mots et humour'),
  ],
};

const C = 'l-implicit-humour';
export default [
  lesson(C, 1, ['indirect-meaning', 'le-sens-indirect'],
    b('Indirect requests and reproaches', 'Demandes et reproches indirects'),
    b('Hear the real intention behind a polite or neutral sentence.', 'Entendre l’intention réelle derrière une phrase polie ou neutre.'),
    [b('Recognise indirect requests', 'Reconnaître les demandes indirectes'), b('Recognise indirect reproaches', 'Reconnaître les reproches indirects'), b('Respond appropriately', 'Répondre de façon appropriée')],
    13,
    [
      card(b('Saying without saying', 'Dire sans dire'), b('**Il fait froid ici, non ?** = close the window, please. **Tu as vu l’heure ?** = you are late / it is late. **Ce serait bien si quelqu’un sortait les poubelles…** = take out the bins. The context and the tone reveal the intention.', '**Il fait froid ici, non ?** = fermez la fenêtre. **Tu as vu l’heure ?** = tu es en retard / il est tard. **Ce serait bien si quelqu’un sortait les poubelles…** = sors les poubelles. Le contexte et le ton révèlent l’intention.')),
      hear('Dis donc, tu as vu l’heure ? Le film a commencé il y a vingt minutes.', b('What does she really mean?', 'Que veut-elle vraiment dire ?'), [b('You are late (reproach)', 'Tu es en retard (reproche)'), b('She wants to know the time', 'Elle veut savoir l’heure'), b('She likes the film', 'Elle aime le film'), b('She is tired', 'Elle est fatiguée')]),
      hear('Ce serait sympa si quelqu’un pensait à acheter du pain, pour une fois…', b('What is the real message?', 'Quel est le vrai message ?'), [b('Someone (you) should buy bread for once', 'Quelqu’un (toi) devrait acheter du pain, pour une fois'), b('Bread is too expensive', 'Le pain coûte trop cher'), b('She bought bread', 'Elle a acheté du pain'), b('She doesn’t like bread', 'Elle n’aime pas le pain')]),
      hear('Ah, tu as fini le rapport ? Tiens, je pensais qu’il était pour hier.', b('What is implied?', 'Qu’est-ce qui est sous-entendu ?'), [b('The report is late (ironic reproach)', 'Le rapport est en retard (reproche ironique)'), b('He is pleased it is early', 'Il est content qu’il soit en avance'), b('He forgot the deadline', 'Il a oublié l’échéance'), b('He wants another report', 'Il veut un autre rapport')]),
      sort(b('Literal or implied meaning?', 'Sens littéral ou sous-entendu ?'), [b('literal question', 'question littérale'), b('implied request / reproach', 'demande / reproche sous-entendu')], [['Quelle heure est-il, s’il vous plaît ?', 0], ['Tu as vu l’heure ?', 1], ['Où est la gare ?', 0], ['Il fait froid ici, non ?', 1]], { listen: true }),
      pairs(P.match, [['Tu as vu l’heure ?', b('It’s late! / You’re late!', 'reproche')], ['Il fait froid ici, non ?', b('Close the window, please.', 'demande indirecte')], ['pour une fois', b('for once', 'exceptionnellement')], ['Dis donc…', b('Hey… / Well now…', 'interpellation')]]),
      dict('Ce serait sympa si quelqu’un pensait à acheter du pain, pour une fois.', { voice: 'f' }),
    ],
    [
      b('Indirect request: Il fait froid ici, non ? = Close the window.', 'Demande indirecte : Il fait froid ici, non ? = Fermez la fenêtre.'),
      b('Indirect reproach: Tu as vu l’heure ? pour une fois…', 'Reproche indirect : Tu as vu l’heure ? pour une fois…'),
      b('Context + tone = real intention.', 'Contexte + ton = intention réelle.'),
    ],
    [['un reproche', b('a reproach', 'critique')], ['sous-entendu', b('implied', 'suggéré sans être dit')], ['sympa', b('nice (informal)', 'agréable')]],
  ),
  lesson(C, 2, ['understatement-and-irony', 'litote-et-ironie'],
    b('Understatement and irony', 'Litote et ironie'),
    b('Understand when French says less to mean more, or the opposite of what it means.', 'Comprendre quand le français dit moins pour dire plus, ou le contraire de ce qu’il pense.'),
    [b('Understand the litote', 'Comprendre la litote'), b('Recognise irony', 'Reconnaître l’ironie'), b('Distinguish irony and sarcasm', 'Distinguer ironie et sarcasme')],
    13,
    [
      card(b('Litote and irony', 'Litote et ironie'), b('**Litote**: say less to mean more: **Ce n’est pas mal** (it’s good), **Il n’est pas bête** (he’s clever), **Je ne déteste pas** (I like it). **Irony**: say the opposite: **Bravo, quelle organisation !** (it’s a mess). **Sarcasm** is irony meant to hurt.', '**Litote** : dire moins pour dire plus : **Ce n’est pas mal** (c’est bien), **Il n’est pas bête** (il est intelligent), **Je ne déteste pas** (j’aime). **Ironie** : dire le contraire : **Bravo, quelle organisation !** (c’est le désordre). Le **sarcasme** est une ironie blessante.')),
      hear('Franchement, ton gâteau, il est pas mal du tout. Tu m’en redonnes un morceau ?', b('What does he think of the cake?', 'Que pense-t-il du gâteau ?'), [b('He likes it a lot (litote)', 'Il l’aime beaucoup (litote)'), b('It is average', 'Il est moyen'), b('He doesn’t like it', 'Il ne l’aime pas'), b('He is not hungry', 'Il n’a pas faim')]),
      hear('Super, encore une réunion qui aurait pu être un courriel. J’adore.', b('What is the tone?', 'Quel est le ton ?'), [b('Ironic: he is annoyed by the useless meeting', 'Ironique : la réunion inutile l’agace'), b('Enthusiastic', 'Enthousiaste'), b('Sincere', 'Sincère'), b('Sad', 'Triste')]),
      hear('Elle n’est pas bête, cette idée. On pourrait l’essayer dès lundi.', b('What does she think of the idea?', 'Que pense-t-elle de l’idée ?'), [b('It is a good idea', 'C’est une bonne idée'), b('It is stupid', 'C’est une idée bête'), b('She has no opinion', 'Elle n’a pas d’avis'), b('It is risky', 'C’est risqué')]),
      sort(b('Litote or irony?', 'Litote ou ironie ?'), [b('litote (says less)', 'litote (dit moins)'), b('irony (says the opposite)', 'ironie (dit le contraire)')], [['Ce n’est pas mal.', 0], ['Bravo, quelle organisation !', 1], ['Il n’est pas bête.', 0], ['Génial, il pleut encore.', 1], ['Je ne déteste pas.', 0], ['Quelle belle journée… (sous l’orage)', 1]]),
      pairs(P.match, [['Ce n’est pas mal.', b('It’s good. (litote)', 'c’est bien')], ['Il n’est pas bête.', b('He’s clever. (litote)', 'il est intelligent')], ['Bravo ! (ironique)', b('What a mess! (irony)', 'critique déguisée')], ['le sarcasme', b('sarcasm', 'ironie mordante')]]),
      dict('Elle n’est pas bête, cette idée. On pourrait l’essayer lundi.', { voice: 'm' }),
    ],
    [
      b('Litote: ce n’est pas mal = it’s good; il n’est pas bête = he’s clever.', 'Litote : ce n’est pas mal = c’est bien ; il n’est pas bête = il est intelligent.'),
      b('Irony: positive words for a negative situation.', 'Ironie : mots positifs pour une situation négative.'),
      b('Sarcasm = hurtful irony.', 'Sarcasme = ironie blessante.'),
    ],
    [['franchement', b('honestly', 'sincèrement')], ['un morceau', b('a piece', 'une part')], ['essayer', b('to try', 'tenter')]],
  ),
  lesson(C, 3, ['wordplay-and-humour', 'jeux-de-mots-et-humour'],
    b('Wordplay and humour', 'Jeux de mots et humour'),
    b('Understand puns, double meanings and comic exaggeration.', 'Comprendre calembours, doubles sens et exagération comique.'),
    [b('Understand a pun', 'Comprendre un calembour'), b('Understand a double meaning', 'Comprendre un double sens'), b('Recognise comic exaggeration', 'Reconnaître l’exagération comique')],
    13,
    [
      tip(b('How French jokes work', 'Comment fonctionnent les blagues'), b('Many French jokes rely on **homophones** (words that sound the same: **verre / vert / ver / vers**), **double meanings** (**avoir la pêche** = to be full of energy / to have a peach) and **exaggeration** (**j’ai attendu cent ans**).', 'Beaucoup de blagues françaises reposent sur les **homophones** (**verre / vert / ver / vers**), les **doubles sens** (**avoir la pêche** = être en forme / avoir un fruit) et l’**exagération** (**j’ai attendu cent ans**).')),
      hear('Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon, ils tombent dans le bateau !', b('Why is it funny?', 'Pourquoi est-ce drôle ?'), [b('An absurd but logical answer', 'Une réponse absurde mais logique'), b('A homophone', 'Un homophone'), b('An insult', 'Une insulte'), b('It isn’t a joke', 'Ce n’est pas une blague')]),
      hear('Ce matin, j’ai la pêche ! Normal, j’en ai mangé trois au déjeuner.', b('What is the play on words?', 'Quel est le jeu de mots ?'), [b('« avoir la pêche »: full of energy / ate peaches', '« avoir la pêche » : être en forme / avoir mangé des pêches'), b('A rhyme', 'Une rime'), b('An exaggeration about time', 'Une exagération sur le temps'), b('Irony about breakfast', 'De l’ironie sur le déjeuner')]),
      hear('Le service était tellement lent que j’ai fêté mon anniversaire entre l’entrée et le plat.', b('What is the comic device?', 'Quel est le procédé comique ?'), [b('Exaggeration: the service was very slow', 'L’exagération : le service était très lent'), b('A pun', 'Un calembour'), b('Litote', 'Une litote'), b('A real birthday party', 'Une vraie fête d’anniversaire')]),
      pairs(P.match, [['avoir la pêche', b('to be full of energy', 'être en forme')], ['un calembour', b('a pun', 'jeu sur les sons')], ['un plongeur', b('a diver', 'personne qui plonge')], ['l’exagération', b('exaggeration', 'amplification')]]),
      sort(b('Double meaning or exaggeration?', 'Double sens ou exagération ?'), [b('double meaning', 'double sens'), b('exaggeration', 'exagération')], [['avoir la pêche', 0], ['j’ai attendu cent ans', 1], ['tomber dans les pommes', 0], ['il y avait un million de personnes', 1]]),
      dict('Ce matin, j’ai la pêche : j’en ai mangé trois au déjeuner !', { voice: 'f' }),
    ],
    [
      b('Jokes rely on homophones, double meanings and exaggeration.', 'Les blagues reposent sur homophones, doubles sens et exagération.'),
      b('avoir la pêche = to be full of energy.', 'avoir la pêche = être plein d’énergie.'),
      b('Absurd logic is a classic of French humour.', 'La logique absurde est un classique de l’humour français.'),
    ],
    [['plonger', b('to dive', 'sauter dans l’eau')], ['fêter', b('to celebrate', 'célébrer')], ['tomber dans les pommes', b('to faint', 's’évanouir')]],
  ),
];
