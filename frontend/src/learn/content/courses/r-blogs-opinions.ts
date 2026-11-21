import type { CourseAbout, Doc } from '../../types';
import { b, card, doc, gap, lesson, mc, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Blog posts, forum messages and readers’ letters express opinions in a personal, often lively style. This course trains you to identify the author’s opinion and arguments, the tone (enthusiastic, ironic, critical), the expressions of agreement and disagreement, and to answer a post with your own reasoned opinion.',
    'Billets de blog, messages de forum et courriers des lecteurs expriment des opinions dans un style personnel, souvent vivant. Ce cours vous entraîne à repérer l’opinion de l’auteur et ses arguments, le ton (enthousiaste, ironique, critique), les expressions d’accord et de désaccord, et à répondre à un billet en donnant votre propre opinion argumentée.',
  ),
  outcomes: [
    b('Identify the author’s opinion and arguments', 'Repérer l’opinion de l’auteur et ses arguments'),
    b('Recognise the tone of a text', 'Reconnaître le ton d’un texte'),
    b('Understand agreement and disagreement', 'Comprendre l’accord et le désaccord'),
    b('Write a reasoned reply', 'Rédiger une réponse argumentée'),
  ],
};

const BLOG: Doc = { look: 'page', title: b('Blog post', 'Billet de blog'), text: 'Pourquoi j’ai arrêté d’acheter des vêtements neufs\n\nIl y a un an, j’ai pris une décision : ne plus acheter de vêtements neufs pendant douze mois. Résultat ? J’ai économisé plus de 800 dollars et j’ai découvert les friperies de mon quartier. Bien sûr, ce n’est pas toujours facile : il faut chercher, essayer, parfois revenir les mains vides. Mais je suis convaincue que la mode rapide coûte trop cher à la planète. Et franchement, mes amis ne voient même pas la différence !' };
const FORUM: Doc = { look: 'page', title: b('Forum', 'Forum'), text: 'Sujet : Les devoirs à la maison, utiles ou pas ?\n\nJulien_74 : Pour moi, les devoirs sont indispensables. Sans eux, les enfants oublient tout ce qu’ils ont appris en classe.\n\nSonia.M : Je ne suis pas du tout d’accord. Après sept heures d’école, les enfants ont besoin de jouer et de se reposer. Les devoirs créent surtout des conflits à la maison !\n\nPapa_Québec : Je vous rejoins tous les deux en partie. Un peu de lecture, oui ; deux heures d’exercices, non.' };
const LETTER: Doc = { look: 'letter', title: b('Reader’s letter', 'Courrier des lecteurs'), text: 'Bravo pour la nouvelle piste cyclable de la rue Saint-Laurent ! Enfin, nous pouvons rouler en sécurité. Dommage qu’il ait fallu attendre dix ans et trois accidents graves pour que la Ville se décide. On n’arrête pas le progrès… surtout quand il avance à la vitesse d’un escargot.\n\nJeanne, lectrice de Rosemont' };

const C = 'r-blogs-opinions';
export default [
  lesson(C, 1, ['finding-the-opinion', 'reperer-l-opinion'],
    b('Finding the author’s opinion', 'Repérer l’opinion de l’auteur'),
    b('Identify the thesis, the arguments and the concessions of a blog post.', 'Identifier la thèse, les arguments et les concessions d’un billet de blog.'),
    [b('Find the main opinion', 'Trouver l’opinion principale'), b('List the arguments', 'Relever les arguments'), b('Spot a concession (bien sûr… mais)', 'Repérer une concession (bien sûr… mais)')],
    13,
    [
      card(b('Opinion markers', 'Les marques de l’opinion'), b('Look for **je pense que, je suis convaincu(e) que, à mon avis, selon moi, pour moi**, and for evaluative words (**trop cher, indispensable, franchement**). A concession often starts with **bien sûr, certes, il est vrai que**, followed by **mais**.', 'Cherchez **je pense que, je suis convaincu(e) que, à mon avis, selon moi, pour moi**, et les mots évaluatifs (**trop cher, indispensable, franchement**). Une concession commence souvent par **bien sûr, certes, il est vrai que**, suivi de **mais**.')),
      doc(BLOG, b('What is the author’s main opinion?', 'Quelle est l’opinion principale de l’autrice ?'), [b('Fast fashion is too costly for the planet.', 'La mode rapide coûte trop cher à la planète.'), b('Second-hand clothes are ugly.', 'Les vêtements d’occasion sont laids.'), b('Shopping is a waste of time.', 'Le magasinage est une perte de temps.'), b('Her friends dress badly.', 'Ses amis s’habillent mal.')]),
      doc(BLOG, b('Which difficulty does she admit?', 'Quelle difficulté reconnaît-elle ?'), [b('You have to search, and sometimes leave with nothing.', 'Il faut chercher, et parfois repartir les mains vides.'), b('It costs more money.', 'Cela coûte plus cher.'), b('Her friends criticise her.', 'Ses amis la critiquent.'), b('Thrift shops are far away.', 'Les friperies sont loin.')]),
      doc(BLOG, b('Which is an argument for her choice?', 'Lequel est un argument en faveur de son choix ?'), [b('She saved more than 800 dollars.', 'Elle a économisé plus de 800 dollars.'), b('She bought new clothes.', 'Elle a acheté des vêtements neufs.'), b('She stopped seeing her friends.', 'Elle ne voit plus ses amis.'), b('She works in a thrift shop.', 'Elle travaille dans une friperie.')]),
      pairs(P.match, [['une friperie', b('a thrift shop', 'magasin de vêtements d’occasion')], ['économiser', b('to save (money)', 'mettre de côté')], ['revenir les mains vides', b('to come back empty-handed', 'ne rien rapporter')], ['la mode rapide', b('fast fashion', 'vêtements bon marché, vite renouvelés')]]),
      sort(b('Opinion or fact?', 'Opinion ou fait ?'), [b('opinion', 'opinion'), b('fact', 'fait')], [['La mode rapide coûte trop cher à la planète.', 0], ['J’ai économisé 800 dollars.', 1], ['Franchement, personne ne voit la différence.', 0], ['Il y a un an, j’ai pris une décision.', 1]]),
      say('À mon avis, acheter des vêtements d’occasion est une très bonne idée.', 'In my opinion, buying second-hand clothes is a very good idea.'),
    ],
    [
      b('Opinion: je pense que, à mon avis, je suis convaincu(e) que.', 'Opinion : je pense que, à mon avis, je suis convaincu(e) que.'),
      b('Concession: bien sûr / certes … mais.', 'Concession : bien sûr / certes … mais.'),
      b('Evaluative words reveal the opinion: trop, indispensable, franchement.', 'Les mots évaluatifs révèlent l’opinion : trop, indispensable, franchement.'),
    ],
    [['d’occasion', b('second-hand', 'déjà utilisé')], ['convaincu', b('convinced', 'persuadé')], ['neuf', b('new (never used)', 'jamais utilisé')]],
  ),
  lesson(C, 2, ['agreement-and-disagreement', 'accord-et-desaccord'],
    b('Agreement and disagreement in a forum', 'Accord et désaccord sur un forum'),
    b('Follow a debate and identify each participant’s position.', 'Suivre un débat et identifier la position de chaque participant.'),
    [b('Identify each position', 'Identifier chaque position'), b('Understand nuanced agreement', 'Comprendre l’accord nuancé'), b('Use agreement and disagreement phrases', 'Employer les expressions d’accord et de désaccord')],
    13,
    [
      card(b('Agree, disagree, nuance', 'Accord, désaccord, nuance'), b('**Agree**: Je suis d’accord, Tout à fait, Je partage ton avis. **Disagree**: Je ne suis pas du tout d’accord, Au contraire. **Nuance**: Je te rejoins en partie, Oui, mais…, Ça dépend.', '**Accord** : Je suis d’accord, Tout à fait, Je partage ton avis. **Désaccord** : Je ne suis pas du tout d’accord, Au contraire. **Nuance** : Je te rejoins en partie, Oui, mais…, Ça dépend.')),
      doc(FORUM, b('What is Julien’s position?', 'Quelle est la position de Julien ?'), [b('Homework is essential.', 'Les devoirs sont indispensables.'), b('Homework should be banned.', 'Il faut interdire les devoirs.'), b('It depends on the child.', 'Cela dépend de l’enfant.'), b('Reading is enough.', 'La lecture suffit.')]),
      doc(FORUM, b('What is Sonia’s main argument?', 'Quel est l’argument principal de Sonia ?'), [b('Children need to play and rest after school.', 'Les enfants ont besoin de jouer et de se reposer après l’école.'), b('Children forget everything.', 'Les enfants oublient tout.'), b('Homework is too easy.', 'Les devoirs sont trop faciles.'), b('Parents love homework.', 'Les parents adorent les devoirs.')]),
      doc(FORUM, b('What does Papa_Québec think?', 'Que pense Papa_Québec ?'), [b('A little reading is fine, long exercises are not.', 'Un peu de lecture, oui ; de longs exercices, non.'), b('He totally agrees with Julien.', 'Il est tout à fait d’accord avec Julien.'), b('He totally agrees with Sonia.', 'Il est tout à fait d’accord avec Sonia.'), b('He has no opinion.', 'Il n’a pas d’avis.')]),
      sort(b('Agree, disagree or nuance?', 'Accord, désaccord ou nuance ?'), [b('agree', 'accord'), b('disagree', 'désaccord'), b('nuance', 'nuance')], [['Tout à fait !', 0], ['Je ne suis pas du tout d’accord.', 1], ['Je te rejoins en partie.', 2], ['Je partage ton avis.', 0], ['Au contraire !', 1], ['Oui, mais ça dépend.', 2]]),
      gap(P.complete, 'Je ___ ton avis : les enfants ont besoin de jouer. Mais je te ___ en partie sur la lecture.', ['partage', 'rejoins']),
      say('Je te rejoins en partie : un peu de lecture, oui, mais pas trop d’exercices.', 'I partly agree with you: a bit of reading, yes, but not too many exercises.'),
    ],
    [
      b('Agree: Je suis d’accord, Tout à fait, Je partage ton avis.', 'Accord : Je suis d’accord, Tout à fait, Je partage ton avis.'),
      b('Disagree: Je ne suis pas du tout d’accord, Au contraire.', 'Désaccord : Je ne suis pas du tout d’accord, Au contraire.'),
      b('Nuance: Je te rejoins en partie, Oui, mais…', 'Nuance : Je te rejoins en partie, Oui, mais…'),
    ],
    [['indispensable', b('essential', 'absolument nécessaire')], ['un conflit', b('a conflict', 'une dispute')], ['rejoindre quelqu’un', b('to agree with someone', 'être du même avis')]],
  ),
  lesson(C, 3, ['tone-and-irony', 'ton-et-ironie'],
    b('Tone and irony, and writing a reply', 'Le ton et l’ironie, et rédiger une réponse'),
    b('Recognise enthusiasm, criticism and irony, and reply with your own opinion.', 'Reconnaître l’enthousiasme, la critique et l’ironie, et répondre avec sa propre opinion.'),
    [b('Recognise the tone', 'Reconnaître le ton'), b('Understand irony', 'Comprendre l’ironie'), b('Write a reasoned reply', 'Écrire une réponse argumentée')],
    13,
    [
      tip(b('Irony says the opposite', 'L’ironie dit le contraire'), b('Irony says the opposite of what is meant, often with an exaggeration or a familiar expression: **On n’arrête pas le progrès… à la vitesse d’un escargot** = progress is in fact very slow.', 'L’ironie dit le contraire de ce que l’on pense, souvent avec une exagération ou une expression figée : **On n’arrête pas le progrès… à la vitesse d’un escargot** = le progrès est en réalité très lent.')),
      doc(LETTER, b('What is Jeanne’s overall tone?', 'Quel est le ton général de Jeanne ?'), [b('Happy but critical and ironic about the delay', 'Contente, mais critique et ironique sur le retard'), b('Completely enthusiastic', 'Totalement enthousiaste'), b('Sad and discouraged', 'Triste et découragée'), b('Neutral and informative', 'Neutre et informatif')]),
      doc(LETTER, b('What does she criticise?', 'Que critique-t-elle ?'), [b('The City took too long to act.', 'La Ville a mis trop de temps à agir.'), b('The new bike lane is dangerous.', 'La nouvelle piste est dangereuse.'), b('Cyclists ride too fast.', 'Les cyclistes roulent trop vite.'), b('The street is too narrow.', 'La rue est trop étroite.')]),
      mc(P.meaning, [b('Progress is very slow (irony).', 'Le progrès est très lent (ironie).'), b('Progress is very fast.', 'Le progrès est très rapide.'), b('Snails are dangerous.', 'Les escargots sont dangereux.'), b('Progress must be stopped.', 'Il faut arrêter le progrès.')], { fr: '« On n’arrête pas le progrès… surtout quand il avance à la vitesse d’un escargot. »' }),
      pairs(P.match, [['Bravo pour…', b('Well done for… (praise)', 'félicitations')], ['Dommage que…', b('It’s a pity that… (+ subjunctive)', 'regret')], ['Enfin !', b('At last!', 'soulagement')], ['à la vitesse d’un escargot', b('at a snail’s pace', 'très lentement')]]),
      write(b('Reply to the forum.', 'Répondez sur le forum.'), b('Reply to the forum about homework. Give your opinion, one argument, one concession and a conclusion.', 'Répondez sur le forum consacré aux devoirs. Donnez votre opinion, un argument, une concession et une conclusion.'), 50, 100,
        [b('A clear opinion (à mon avis…)', 'Une opinion claire (à mon avis…)'), b('One argument with an example', 'Un argument avec un exemple'), b('A concession (certes… mais)', 'Une concession (certes… mais)'), b('A short conclusion', 'Une courte conclusion')],
        'À mon avis, les devoirs sont utiles, à condition qu’ils restent courts. Par exemple, lire vingt minutes chaque soir aide vraiment les enfants à progresser. Certes, après une longue journée, ils sont fatigués, mais une petite routine leur apprend aussi l’autonomie. Bref, je suis pour les devoirs, mais avec modération !',
        { phrases: ['À mon avis…', 'Par exemple…', 'Certes… mais…', 'à condition que…', 'Bref…'] }),
      say('Bravo pour cette initiative, mais dommage qu’il ait fallu attendre si longtemps !', 'Well done for this initiative, but what a pity we had to wait so long!'),
    ],
    [
      b('Tone: enthusiastic (Bravo !), critical (Dommage que…), ironic (opposite meaning).', 'Ton : enthousiaste (Bravo !), critique (Dommage que…), ironique (sens contraire).'),
      b('Dommage que + subjunctive.', 'Dommage que + subjonctif.'),
      b('A good reply: opinion, argument + example, concession, conclusion.', 'Bonne réponse : opinion, argument + exemple, concession, conclusion.'),
    ],
    [['un escargot', b('a snail', 'petit animal lent')], ['se décider', b('to make up one’s mind', 'prendre une décision')], ['avec modération', b('in moderation', 'sans excès')]],
  ),
];
