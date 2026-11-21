import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, gap, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The DELF B1 speaking test lasts about 15 minutes and has three parts: a guided interview, an interaction (role-play) and the expression of a point of view based on a short document (with 10 minutes of preparation for this part). This course trains each part, with model answers, a reliable plan for the point of view, and the connectors and opinion phrases that examiners expect at B1.',
    'L’épreuve orale du DELF B1 dure environ 15 minutes et comprend trois parties : un entretien dirigé, un exercice en interaction (jeu de rôle) et l’expression d’un point de vue à partir d’un court document (avec 10 minutes de préparation pour cette partie). Ce cours entraîne chaque partie avec des réponses modèles, un plan fiable pour le point de vue, et les connecteurs et formules d’opinion attendus au niveau B1.',
  ),
  outcomes: [
    b('Talk about yourself in depth', 'Parler de soi de façon approfondie'),
    b('Handle a problem-solving role-play', 'Gérer un jeu de rôle avec un problème à résoudre'),
    b('Present and defend a point of view', 'Présenter et défendre un point de vue'),
    b('Use B1 connectors and opinion phrases', 'Employer les connecteurs et formules d’opinion du B1'),
  ],
};

const C = 'delf-b1-oral';
export default [
  lesson(C, 1, ['interview-and-interaction', 'entretien-et-interaction'],
    b('The interview and the interaction', 'L’entretien et l’interaction'),
    b('Talk about yourself and handle a role-play with a problem to solve.', 'Parler de soi et gérer un jeu de rôle avec un problème à résoudre.'),
    [b('Go beyond simple answers', 'Aller au-delà des réponses simples'), b('Explain a problem in the role-play', 'Exposer un problème dans le jeu de rôle'), b('Convince or negotiate', 'Convaincre ou négocier')],
    13,
    [
      exam(b('Parts 1 and 2', 'Parties 1 et 2'), b('**Entretien dirigé** (2–3 min, no preparation): your life, interests, projects, past experiences — **justify** your answers. **Exercice en interaction** (3–4 min, no preparation): you draw a situation with a **problem** or a **disagreement**: convince a friend, complain to a neighbour, negotiate with a colleague. The examiner may resist: keep arguing politely.', '**Entretien dirigé** (2 à 3 min, sans préparation) : votre vie, vos centres d’intérêt, vos projets, vos expériences — **justifiez** vos réponses. **Exercice en interaction** (3 à 4 min, sans préparation) : vous tirez une situation avec un **problème** ou un **désaccord** : convaincre un ami, se plaindre à un voisin, négocier avec un collègue. L’examinateur peut résister : continuez à argumenter poliment.')),
      mc(P.best, ['Je travaille dans la logistique depuis cinq ans. J’aime ce métier parce qu’il est très varié, mais j’aimerais évoluer vers un poste de responsable.', 'Je travaille.', 'Logistique.', 'C’est mon travail.'], { fr: '— Parlez-moi de votre travail.' }),
      doc({ look: 'page', title: b('Role card', 'Sujet d’interaction'), text: 'Votre ami(e) veut passer les vacances d’été dans une grande ville. Vous préférez la campagne. Vous essayez de le/la convaincre. L’examinateur joue le rôle de votre ami(e).' }, b('What is your goal?', 'Quel est votre objectif ?'), [b('convince your friend to go to the countryside', 'convaincre votre ami d’aller à la campagne'), b('book a hotel in the city', 'réserver un hôtel en ville'), b('cancel the holidays', 'annuler les vacances'), b('accept the city immediately', 'accepter la ville tout de suite')]),
      dlg(b('Convincing a friend', 'Convaincre un ami'), undefined, [['Examinateur (ami)', 'm'], ['Vous', 'f']], [
        [0, 'Cet été, on va à Barcelone, d’accord ? Il y a plein de choses à faire !', 'This summer we’re going to Barcelona, OK? There’s lots to do!'],
        [1, { options: ['Je comprends, mais en été, les grandes villes sont chaudes et pleines de touristes. Pourquoi pas un gîte à la campagne ?', 'Non, je ne veux pas.', 'D’accord, Barcelone.'] }],
        [0, 'La campagne, c’est ennuyeux, il n’y a rien à faire.', 'The countryside is boring, there’s nothing to do.'],
        [1, { options: ['Au contraire ! On peut faire de la randonnée, du vélo, nager dans un lac… Et c’est beaucoup moins cher.', 'Oui, c’est vrai, tu as raison.', 'Tant pis pour toi.'] }],
        [0, 'Hmm… et si on faisait une semaine de chaque ?', 'Hmm… what if we did a week of each?'],
        [1, { options: ['Bonne idée, c’est un bon compromis !', 'Non, seulement la campagne.', 'Je ne sais pas.'] }],
      ]),
      say('Je comprends ton point de vue, mais je pense que la campagne serait plus reposante et moins chère.', 'I understand your point of view, but I think the countryside would be more relaxing and cheaper.'),
    ],
    [
      b('Interview: justify and develop every answer.', 'Entretien : justifiez et développez chaque réponse.'),
      b('Interaction: explain, argue, react, find a compromise.', 'Interaction : expliquer, argumenter, réagir, trouver un compromis.'),
      b('Je comprends, mais… · Au contraire… · Et si on… ?', 'Je comprends, mais… · Au contraire… · Et si on… ?'),
    ],
    [['un gîte', b('a holiday cottage', 'maison de vacances')], ['évoluer', b('to progress (career)', 'monter en poste')], ['reposant', b('relaxing', 'qui repose')]],
  ),
  lesson(C, 2, ['point-of-view-plan', 'le-plan-du-point-de-vue'],
    b('The point of view: a reliable plan', 'Le point de vue : un plan fiable'),
    b('Identify the topic of a short document and build a 3-part presentation.', 'Dégager le thème d’un court document et construire un exposé en 3 parties.'),
    [b('Find the topic and the question', 'Trouver le thème et la question'), b('Build an introduction, two arguments, a conclusion', 'Construire introduction, deux arguments, conclusion'), b('Use examples from your experience', 'Utiliser des exemples personnels')],
    13,
    [
      exam(b('Part 3: the point of view', 'Partie 3 : l’expression d’un point de vue'), b('You draw **two short documents** (a few lines, often a press headline or text) and choose one. **10 minutes of preparation**, then about **5–7 minutes**: present the **topic**, give **your opinion** with **arguments and examples**, then answer the examiner’s questions.', 'Vous tirez **deux courts documents** (quelques lignes, souvent un titre ou un texte de presse) et en choisissez un. **10 minutes de préparation**, puis environ **5 à 7 minutes** : présentez le **thème**, donnez **votre opinion** avec des **arguments et des exemples**, puis répondez aux questions de l’examinateur.')),
      card(b('The plan', 'Le plan'), b('**Introduction**: Ce document parle de… La question est de savoir si… **Argument 1** + example: D’abord, je pense que… Par exemple, dans mon pays… **Argument 2** + example: Ensuite / De plus, … **Conclusion**: Pour conclure, à mon avis… Et dans votre pays, qu’en pensez-vous ? (optional)', '**Introduction** : Ce document parle de… La question est de savoir si… **Argument 1** + exemple : D’abord, je pense que… Par exemple, dans mon pays… **Argument 2** + exemple : Ensuite / De plus, … **Conclusion** : Pour conclure, à mon avis…')),
      doc({ look: 'article', title: b('Document', 'Document'), text: 'De plus en plus d’entreprises proposent la semaine de quatre jours. Les salariés travaillent un peu plus longtemps chaque jour, mais ils ont trois jours de repos. Certains y voient un progrès, d’autres une source de fatigue.' }, b('Which question should you discuss?', 'Quelle question faut-il traiter ?'), [b('Is the four-day week a good idea?', 'La semaine de quatre jours est-elle une bonne idée ?'), b('How many companies exist?', 'Combien d’entreprises existent ?'), b('What is your job?', 'Quel est votre métier ?'), b('Where do you live?', 'Où habitez-vous ?')]),
      sort(b('Which part of the plan?', 'Quelle partie du plan ?'), [b('introduction', 'introduction'), b('argument', 'argument'), b('conclusion', 'conclusion')], [['Ce document parle de la semaine de quatre jours.', 0], ['D’abord, cela permet de mieux concilier travail et famille.', 1], ['Pour conclure, je suis plutôt favorable à cette idée.', 2], ['La question est de savoir si c’est positif.', 0], ['De plus, les salariés seraient moins stressés.', 1], ['En résumé, c’est une bonne idée, avec quelques limites.', 2]]),
      write(b('Prepare your notes', 'Préparez vos notes'), b('Prepare notes (50–80 words) for the four-day-week document: introduction, two arguments with examples, conclusion.', 'Préparez vos notes (50–80 mots) pour le document sur la semaine de quatre jours : introduction, deux arguments avec exemples, conclusion.'), 50, 80, [
        b('Topic and question', 'Thème et question'),
        b('Two arguments with examples', 'Deux arguments avec exemples'),
        b('Conclusion with your opinion', 'Conclusion avec votre avis'),
      ], 'Intro : le document parle de la semaine de 4 jours. Question : est-ce une bonne idée ? Arg. 1 : plus de temps pour la famille et le sport (ex. : ma sœur a 3 jours de repos et elle est plus heureuse). Arg. 2 : mais journées longues, fatigue (ex. : métiers physiques). Conclusion : plutôt pour, si c’est adapté au métier.'),
      tip(b('Notes, not sentences', 'Des notes, pas des phrases'), b('In 10 minutes, write **key words and the plan**, not a full text. Reading a text aloud is penalised; speaking from notes sounds natural.', 'En 10 minutes, notez **des mots clés et le plan**, pas un texte complet. Lire un texte à voix haute est pénalisé ; parler à partir de notes paraît naturel.')),
    ],
    [
      b('Two documents, choose one; 10 min preparation; 5–7 min.', 'Deux documents, en choisir un ; 10 min de préparation ; 5 à 7 min.'),
      b('Intro (topic + question), 2 arguments + examples, conclusion.', 'Intro (thème + question), 2 arguments + exemples, conclusion.'),
      b('Prepare notes, not a text to read.', 'Préparez des notes, pas un texte à lire.'),
    ],
    [['concilier', b('to balance, reconcile', 'faire aller ensemble')], ['un salarié', b('an employee', 'personne salariée')], ['être favorable à', b('to be in favour of', 'être pour')]],
  ),
  lesson(C, 3, ['defending-your-view', 'defendre-son-point-de-vue'],
    b('Defending your view in the discussion', 'Défendre son point de vue dans la discussion'),
    b('Answer the examiner’s objections and nuance your opinion.', 'Répondre aux objections de l’examinateur et nuancer son opinion.'),
    [b('Use B1 opinion phrases', 'Employer les formules d’opinion B1'), b('Answer an objection', 'Répondre à une objection'), b('Nuance your opinion', 'Nuancer son opinion')],
    13,
    [
      card(b('Opinion and discussion', 'Opinion et discussion'), b('Opinion: **À mon avis… · Je pense que… · Il me semble que… · Je suis pour / contre… · Je ne suis pas d’accord avec l’idée que…** Answer objections: **C’est vrai, mais… · Vous avez raison sur ce point, cependant… · Je comprends, mais dans mon expérience…** Nuance: **Ça dépend… · Dans certains cas… · Plutôt…**', 'Opinion : **À mon avis… · Je pense que… · Il me semble que… · Je suis pour / contre… · Je ne suis pas d’accord avec l’idée que…** Répondre aux objections : **C’est vrai, mais… · Vous avez raison sur ce point, cependant… · Je comprends, mais dans mon expérience…** Nuancer : **Ça dépend… · Dans certains cas… · Plutôt…**')),
      dlg(b('The discussion', 'La discussion'), undefined, [['Examinatrice', 'f'], ['Vous', 'm']], [
        [0, 'Mais avec quatre jours, les journées sont plus longues. Ce n’est pas fatigant ?', 'But with four days, the days are longer. Isn’t it tiring?'],
        [1, { options: ['C’est vrai, ça peut être fatigant, surtout pour les métiers physiques. Mais trois jours de repos permettent de bien récupérer.', 'Non.', 'Je ne sais pas.'] }],
        [0, 'Et pour les entreprises, c’est possible partout ?', 'And for companies, is it possible everywhere?'],
        [1, { options: ['Ça dépend du secteur. Dans un hôpital, c’est plus difficile ; dans un bureau, c’est plus simple.', 'Oui, partout, toujours.', 'Les entreprises, je ne connais pas.'] }],
      ]),
      mc(P.best, ['Vous avez raison sur ce point, cependant je pense que les avantages sont plus importants.', 'Non, vous avez tort.', 'D’accord, j’ai changé d’avis.', 'Je ne veux pas répondre.'], { fr: 'L’examinateur conteste votre argument :' }),
      sort(b('Opinion, concession or nuance?', 'Opinion, concession ou nuance ?'), [b('opinion', 'opinion'), b('concession', 'concession'), b('nuance', 'nuance')], [['À mon avis…', 0], ['C’est vrai, mais…', 1], ['Ça dépend du secteur.', 2], ['Je suis contre…', 0], ['Vous avez raison sur ce point, cependant…', 1], ['Dans certains cas…', 2]]),
      gap(P.complete, 'Je comprends votre point de vue, ___ je pense que c’est une bonne idée. ___ , cela dépend du métier.', [['mais', 'cependant', 'pourtant'], ['Cependant', 'Toutefois', 'Néanmoins', 'Par contre']]),
      say('C’est vrai, mais dans mon expérience, les salariés sont plus motivés quand ils ont plus de temps libre.', 'True, but in my experience employees are more motivated when they have more free time.'),
    ],
    [
      b('Opinion: À mon avis, je pense que, il me semble que.', 'Opinion : À mon avis, je pense que, il me semble que.'),
      b('Concession: C’est vrai, mais… Vous avez raison, cependant…', 'Concession : C’est vrai, mais… Vous avez raison, cependant…'),
      b('Nuance: Ça dépend… Dans certains cas…', 'Nuance : Ça dépend… Dans certains cas…'),
    ],
    [['récupérer', b('to recover', 'reprendre des forces')], ['un secteur', b('a sector', 'domaine d’activité')], ['contester', b('to challenge', 'ne pas être d’accord')]],
  ),
];
