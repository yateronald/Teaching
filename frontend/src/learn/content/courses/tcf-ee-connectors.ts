import type { CourseAbout } from '../../types';
import { b, card, gap, lesson, mc, ord, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Many B1 writers know enough words to express their ideas, yet their TCF essays still read like disconnected bullet points: « et ensuite… mais… et aussi… ». Examiners award B2 scores when sentences flow naturally through varied transitions, smart noun substitutions (anaphora) and balanced links between opposing documents in Task 3. This course trains seamless cohesion across Tasks 1, 2 and 3 without mechanical repetition.',
    'Beaucoup de candidats B1 connaissent assez de mots pour s’exprimer, mais leurs textes du TCF ressemblent à une liste de phrases juxtaposées : « et ensuite… mais… et aussi… ». Les correcteurs attribuent le B2 quand les idées s’enchaînent grâce à des transitions variées, des reprises lexicales soignées et une mise en relation fluide des documents en tâche 3. Ce cours entraîne la cohésion sur les trois tâches sans répétitions.',
  ),
  outcomes: [
    b('Replace choppy « et ensuite » chains in Tasks 1 and 2', 'Remplacer les suites de « et ensuite » dans les tâches 1 et 2'),
    b('Avoid repeating nouns through smart substitution', 'Éviter les répétitions par la reprise lexicale et les pronoms'),
    b('Bridge opposing viewpoints smoothly in Task 3', 'Relier deux avis opposés avec fluidité en tâche 3'),
    b('Write cohesive B2 paragraphs under exam timing', 'Rédiger des paragraphes cohérents de niveau B2'),
  ],
};

const C = 'tcf-ee-connectors';
export default [
  lesson(C, 1, ['natural-transitions-task1-and-2', 'transitions-taches-1-et-2'],
    b('Natural transitions in Tasks 1 and 2', 'Transitions naturelles (tâches 1 et 2)'),
    b('Link emails and personal narratives without repeating « et », « alors » or « ensuite ».', 'Relier courriels et récits sans répéter « et », « alors » ou « ensuite ».'),
    [b('Choose task-appropriate registers for connectors', 'Adapter les connecteurs au registre de la tâche'), b('Sequence Task 2 stories smoothly', 'Rythmer un récit de tâche 2 avec fluidité'), b('Write a cohesive Task 2 scene', 'Rédiger un récit fluide de tâche 2')],
    13,
    [
      card(b('From list to flow', 'Passer de la liste au récit fluide'), b('In **Task 1**, keep links light and natural (**d’ailleurs, par contre, du coup, comme prévu**). In **Task 2**, replace endless « et ensuite » with **dès notre arrivée, aussitôt, pourtant, contre toute attente, au bout du compte**.', 'En **tâche 1**, gardez des liens légers et naturels (**d’ailleurs, par contre, du coup, comme prévu**). En **tâche 2**, remplacez les « et ensuite » répétitifs par **dès notre arrivée, aussitôt, pourtant, contre toute attente, au bout du compte**.')),
      mc(P.best, ['Dès notre arrivée au festival, une pluie battante a commencé. Contre toute attente, les organisateurs ont ouvert une grande halle couverte, si bien que le concert a pu commencer à l’heure.', 'Nous sommes arrivés au festival et il a plu. Et ensuite les organisateurs ont ouvert une salle. Et donc le concert a commencé.', 'On est arrivé. Mais il pleuvait. Alors on a changé. Et voilà.', 'Comme il pleuvait, ensuite on est entré, mais c’était bien.'], { fr: 'Quelle version de tâche 2 enchaîne le mieux les idées ?' }),
      gap(P.completeText, '___ à la gare, nous avons appris que notre train avait une heure de retard. ___ , le chef de gare nous a placés dans le train suivant, ___ nous sommes arrivés juste avant le spectacle.', ['Dès notre arrivée', 'Heureusement', 'si bien que'], { choices: [['Dès notre arrivée', 'En somme', 'À l’inverse'], ['Heureusement', 'En outre', 'Pour conclure'], ['si bien que', 'bien que', 'malgré']] }),
      sort(b('Which task fits best?', 'Quelle tâche convient le mieux ?'), [b('Task 1 (message / email)', 'tâche 1 (message / courriel)'), b('Task 2 (story / blog)', 'tâche 2 (récit / article)'), b('Task 3 (formal argument)', 'tâche 3 (essai argumenté)')], [['À propos, j’allais oublier…', 0], ['Contre toute attente, …', 1], ['Il n’en demeure pas moins que…', 2], ['Du coup, on se retrouve là-bas ?', 0], ['Au bout du compte, la soirée fut réussie.', 1], ['À cet égard, il convient de rappeler…', 2]]),
      ord(P.order, 'Le train était bloqué, tandis que le bus roulait normalement.', { tr: 'The train was stuck, whereas the bus was running normally.' }),
      write(b('Task 2 cohesive scene (90–130 words)', 'Récit fluide de tâche 2 (90–130 mots)'), b('Tell on a blog about a concert or outdoor event saved by an unexpected plan B. Use at least four varied transitions without repeating « ensuite ».', 'Racontez sur un blog un concert ou événement en plein air sauvé par un plan B inattendu. Utilisez au moins quatre transitions variées sans répéter « ensuite ».'), 90, 130, [
        b('At least 4 varied transitions', 'Au moins 4 transitions variées'),
        b('Clear sequence of events and twist', 'Enchaînement clair et rebondissement'),
        b('Personal impression at the end', 'Impression personnelle à la fin'),
      ], 'Un concert sauvé in extremis\n\nSamedi soir, je suis allé écouter un groupe de jazz dans un parc du centre-ville. Dès mon arrivée, de gros nuages gris se sont accumulés, et une averse soudaine a obligé les musiciens à couper le son. Tout le monde pensait que la soirée était gâchée.\n\nContre toute attente, le gérant d’un café voisin a aussitôt proposé d’accueillir le groupe dans sa grande salle. En dix minutes, le public s’est déplacé à l’abri, si bien que le concert a repris dans une ambiance encore plus chaleureuse. Au bout du compte, cette panne météo nous a offert un moment inoubliable, bien plus proche des artistes que prévu.'),
    ],
    [
      b('Match transition register to the task: light for Task 1, vivid for Task 2, analytical for Task 3.', 'Adaptez le registre des liens à la tâche : léger en T1, vivant en T2, analytique en T3.'),
      b('Swap repeated « et ensuite » for dès que, aussitôt, contre toute attente, si bien que.', 'Remplacez « et ensuite » par dès que, aussitôt, contre toute attente, si bien que.'),
      b('Check that every link reflects real cause, time or contrast.', 'Vérifiez que chaque lien exprime une vraie cause, chronologie ou opposition.'),
    ],
    [['contre toute attente', b('against all expectations', 'de façon surprenante')], ['in extremis', b('at the very last moment', 'juste à temps')], ['si bien que', b('so that / with the result that', 'de telle sorte que')]],
  ),
  lesson(C, 2, ['cohesion-without-repetition', 'cohesion-sans-repetition'],
    b('Cohesion without repetition', 'Cohésion sans répétitions'),
    b('Connect sentences with demonstrative labels (ce constat, cette mesure) and relative/object pronouns.', 'Lier ses phrases par des reprises nominales (ce constat, cette mesure) et des pronoms.'),
    [b('Replace repeated nouns with smart umbrella labels', 'Remplacer les répétitions par des noms génériques'), b('Use celui-ci, dont, y and en cleanly', 'Employer celui-ci, dont, y et en sans erreur'), b('Open new paragraphs with backward-looking links', 'Ouvrir les paragraphes en reprenant l’idée précédente')],
    13,
    [
      tip(b('What examiners call cohésion', 'Le secret de la cohésion B2'), b('Repeating « le télétravail » six times caps your score at B1. French B2 style ties sentences backward using **demonstrative labels** (**cette pratique, ce dispositif, ce constat**) and **pronouns** (**celui-ci, dont, y, en**).', 'Répéter « le télétravail » six fois bloque votre note au B1. Le style B2 relie chaque phrase à la précédente grâce aux **reprises nominales** (**cette pratique, ce dispositif, ce constat**) et aux **pronoms** (**celui-ci, dont, y, en**).')),
      mc(P.best, ['Ce constat appelle une réponse rapide des municipalités.', 'Les municipalités doivent faire quelque chose pour le problème des loyers chers.', 'Maintenant je vais parler de la solution aux loyers chers.', 'Deuxièmement, voilà ce que les villes peuvent faire.'], { fr: 'Après un paragraphe sur la hausse des loyers, quelle phrase ouvre le mieux le paragraphe suivant ?' }),
      gap(P.completeText, 'La mairie a lancé une navette gratuite au centre-ville. ___ initiative, ___ les habitants profitaient peu au début, connaît aujourd’hui un succès croissant ; beaucoup ___ ont désormais recours chaque matin.', ['Cette', 'dont', 'y'], { choices: [['Cette', 'Ce', 'Cet'], ['dont', 'que', 'où'], ['y', 'en', 'le']] }),
      pairs(P.match, [['le problème du bruit', 'cette nuisance sonore'], ['la nouvelle loi', 'ce dispositif législatif'], ['les jeunes actifs', 'cette génération'], ['les deux articles', 'ces documents']], true),
      ord(P.order, 'Cette initiative, dont les effets sont visibles, mérite d’être étendue.', { tr: 'This initiative, whose effects are visible, deserves to be extended.' }),
      say('Ce constat appelle une réforme rapide, dont les bénéfices se feront sentir dès l’an prochain.', 'This observation calls for a rapid reform, whose benefits will be felt as early as next year.'),
    ],
    [
      b('Swap repeated nouns for ce constat, cette mesure, ce phénomène, cette pratique.', 'Remplacez les répétitions par ce constat, cette mesure, ce phénomène, cette pratique.'),
      b('Use dont when the verb/noun takes de (profiter de → dont les habitants profitent).', 'Employez dont quand le verbe ou nom se construit avec de (profiter de → dont).'),
      b('Start paragraph 2 by referring smoothly back to paragraph 1.', 'Ouvrez le paragraphe 2 en reprenant l’idée du paragraphe 1.'),
    ],
    [['une reprise', b('anaphoric reference / restatement', 'mot qui reprend un terme précédent')], ['un constat', b('an observation / finding', 'situation observée')], ['avoir recours à', b('to resort to / make use of', 'utiliser une solution')]],
  ),
  lesson(C, 3, ['task-3-comparison-and-synthesis', 'comparaison-et-synthese-tache-3'],
    b('Task 3 comparison and synthesis', 'Comparaison et synthèse en tâche 3'),
    b('Connect Document 1, Document 2 and your nuanced stance into one seamless text.', 'Articuler document 1, document 2 et votre opinion nuancée en un texte uni.'),
    [b('Contrast two documents without copying phrases', 'Opposer deux documents sans recopier'), b('Pivot gracefully from Part 1 to Part 2', 'Passer de la partie 1 à la partie 2 sans rupture'), b('Avoid repeating connectors across 160 words', 'Éviter de réutiliser deux fois le même connecteur')],
    13,
    [
      card(b('Three bridges in Task 3', 'Les trois ponts de la tâche 3'), b('Bridge 1 (**Doc 1 ↔ Doc 2**): **Tandis que le premier… le second… / À l’opposé…** Bridge 2 (**Part 1 → Part 2**): **Face à ce débat, il me semble que… / Ces deux visions appellent une position nuancée.** Bridge 3 (**Concession → Verdict**): **Certes…, il n’en demeure pas moins que…**', 'Pont 1 (**Doc 1 ↔ Doc 2**) : **Tandis que le premier… le second… / À l’opposé…** Pont 2 (**Partie 1 → Partie 2**) : **Face à ce débat, il me semble que… / Ces deux visions appellent une position nuancée.** Pont 3 (**Concession → Verdict**) : **Certes…, il n’en demeure pas moins que…**')),
      mc(P.best, ['Face à ces arguments opposés, je pense qu’une approche équilibrée s’impose.', 'Maintenant je vais donner mon opinion personnelle sur ce sujet.', 'Pour la partie deux, je suis d’accord avec le texte un.', 'Voici ce que moi je pense de tout ça.'], { fr: 'Quelle phrase assure la meilleure transition vers la partie 2 de la tâche 3 ?' }),
      gap(P.completeText, 'Le premier document vante les mérites du bénévolat obligatoire ; ___ , le second y voit une contrainte injuste. ___ , je juge cette obligation contre-productive. ___ elle part d’une bonne intention, ___ que l’engagement perd son sens lorsqu’il est forcé.', ['à l’opposé', 'Pour ma part', 'Certes', 'il n’en demeure pas moins'], { choices: [['à l’opposé', 'de même', 'c’est pourquoi'], ['Pour ma part', 'D’abord', 'En effet'], ['Certes', 'Malgré', 'Puisque'], ['il n’en demeure pas moins', 'car', 'donc']] }),
      sort(b('Function in Task 3', 'Fonction en tâche 3'), [b('compare Docs 1 & 2', 'opposer les docs 1 et 2'), b('bridge to Part 2', 'passer à votre avis'), b('concede & balance', 'concéder et nuancer')], [['Tandis que le premier… le second…', 0], ['Face à ce constat, je partage…', 1], ['Certes…, toutefois…', 2], ['À l’inverse, la seconde source…', 0], ['Ces deux analyses posent la question de…', 1], ['Bien que cette idée soit louable…', 2]]),
      write(b('Task 3 synthesis (125–175 words)', 'Synthèse et avis en tâche 3 (125–175 mots)'), b('Doc 1: « Le service civique obligatoire développe l’esprit citoyen des étudiants. » Doc 2: « Imposer du bénévolat gratuit pèse sur les étudiants qui doivent déjà travailler pour vivre. » Present both views and give yours with zero connector repetition.', 'Doc 1 : « Le service civique obligatoire développe l’esprit citoyen des étudiants. » Doc 2 : « Imposer du bénévolat gratuit pèse sur les étudiants qui doivent déjà travailler pour vivre. » Présentez les deux avis et donnez le vôtre sans répéter vos connecteurs.'), 125, 175, [
        b('Part 1 contrasts both documents neutrally', 'Partie 1 : les deux avis opposés neutrement'),
        b('Smooth transition to Part 2', 'Transition fluide vers la partie 2'),
        b('Varied connectors and noun substitutions', 'Connecteurs variés et reprises nominales'),
      ], 'La question du bénévolat obligatoire à l’université divise. Tandis que le premier texte y voit un moyen précieux de renforcer le sens civique des jeunes, le second dénonce une charge supplémentaire pour ceux qui travaillent déjà afin de financer leurs études.\n\nFace à ce débat, je reste réservé quant au caractère obligatoire d’une telle mesure. D’une part, l’engagement associatif perd de sa valeur lorsqu’il devient une simple formalité administrative imposée à tous. D’autre part, tous les étudiants ne disposent pas du même temps libre : imposer des heures non rémunérées pénaliserait d’abord les plus modestes, qui assument déjà un emploi salarié le soir.\n\nCertes, encourager la solidarité dès l’université est une ambition louable. Il n’en demeure pas moins que la valorisation de l’engagement par des crédits scolaires ou une bourse incitative me paraît bien plus juste que la contrainte.'),
      tip(b('The zero-repeat check', 'Le test zéro répétition'), b('Before finishing Task 3, scan your linking words: **never use « mais », « donc » or « de plus » twice**. Swap the second occurrence for **cependant, toutefois, c’est pourquoi, en outre**.', 'Avant de rendre la tâche 3, relisez vos connecteurs : **n’employez pas deux fois « mais », « donc » ou « de plus »**. Remplacez le second par **cependant, toutefois, c’est pourquoi, en outre**.')),
    ],
    [
      b('Contrast Doc 1 and Doc 2 in one tight, neutral paragraph (about 45 words).', 'Opposez Doc 1 et Doc 2 en un paragraphe dense et neutre (environ 45 mots).'),
      b('Bridge smoothly to Part 2 with Face à ce débat… or Ces deux visions…', 'Ouvrez la partie 2 avec Face à ce débat… ou Ces deux visions…'),
      b('Never repeat the same connector twice in Task 3.', 'N’utilisez jamais deux fois le même connecteur en tâche 3.'),
    ],
    [['louable', b('praiseworthy / commendable', 'digne d’être approuvé')], ['pénaliser', b('to penalise / disadvantage', 'désavantager')], ['incitatif', b('incentivising', 'qui encourage sans forcer')]],
  ),
];
