import type { CourseAbout, Doc } from '../../types';
import { b, card, doc, gap, lesson, mc, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Editorials and opinion columns defend a thesis with arguments, examples, concessions and rhetorical effects. At B2, you must follow this reasoning, identify the author’s stance even when it is implicit, and distinguish an argument from an example or a counter-argument. This course trains you on three original columns (the four-day week, screens at school, tourism) and on the plan of an argumentative text.',
    'Les éditoriaux et les chroniques défendent une thèse avec des arguments, des exemples, des concessions et des effets rhétoriques. Au niveau B2, il faut suivre ce raisonnement, cerner la position de l’auteur même lorsqu’elle est implicite, et distinguer un argument d’un exemple ou d’un contre-argument. Ce cours vous entraîne sur trois chroniques originales (la semaine de quatre jours, les écrans à l’école, le tourisme) et sur le plan d’un texte argumentatif.',
  ),
  outcomes: [
    b('Identify the thesis of an opinion text', 'Identifier la thèse d’un texte d’opinion'),
    b('Distinguish arguments, examples and counter-arguments', 'Distinguer arguments, exemples et contre-arguments'),
    b('Recognise rhetorical questions and irony', 'Reconnaître les questions rhétoriques et l’ironie'),
    b('Summarise an argument', 'Résumer une argumentation'),
  ],
};

const E1: Doc = { look: 'article', title: b('Column', 'Chronique'), text: 'La semaine de quatre jours : un luxe, vraiment ?\n\nOn nous répète qu’elle serait un caprice de jeunes travailleurs gâtés. Pourtant, les entreprises qui l’ont adoptée rapportent une productivité stable, voire en hausse, et un absentéisme en net recul. Certes, le modèle ne convient pas à tous les secteurs : un hôpital ne ferme pas le vendredi. Mais refuser d’en discuter au nom de la tradition, c’est oublier que la semaine de cinq jours fut, elle aussi, une conquête jugée irréaliste. Et si le vrai luxe, aujourd’hui, était le temps ?' };
const E2: Doc = { look: 'article', title: b('Editorial', 'Éditorial'), text: 'Écrans à l’école : sortir de la naïveté\n\nPendant dix ans, on a cru que distribuer des tablettes suffirait à moderniser l’école. Les résultats sont décevants : les études montrent que l’usage intensif des écrans en classe nuit à la concentration, en particulier chez les plus jeunes. Faut-il pour autant revenir au tableau noir ? Évidemment pas. Le numérique est un outil précieux, à condition qu’il serve un projet pédagogique au lieu de le remplacer. Former les enseignants coûte moins cher qu’acheter des appareils… et rapporte davantage.' };
const E3: Doc = { look: 'article', title: b('Column', 'Chronique'), text: 'Tourisme : merci, mais pas tous en même temps\n\nChaque été, le Vieux-Québec accueille des foules impressionnantes. Les commerçants se réjouissent, les résidents beaucoup moins : loyers qui grimpent, rues saturées, appartements transformés en locations de courte durée. Personne ne souhaite fermer la ville aux visiteurs. Mais il est temps de mieux répartir les flux, de limiter les locations touristiques et de faire découvrir d’autres quartiers. Car une ville qui n’est plus habitée finit par n’être plus qu’un décor.' };

const C = 'r-editorials';
export default [
  lesson(C, 1, ['thesis-and-arguments', 'these-et-arguments'],
    b('Thesis, arguments and concession', 'Thèse, arguments et concession'),
    b('Identify the thesis, the supporting arguments and the concession in a column.', 'Identifier la thèse, les arguments et la concession d’une chronique.'),
    [b('Find the thesis', 'Trouver la thèse'), b('Find the arguments and examples', 'Repérer les arguments et les exemples'), b('Spot the concession', 'Repérer la concession')],
    13,
    [
      card(b('The building blocks', 'Les briques de l’argumentation'), b('**Thesis**: the position defended. **Argument**: a reason that supports it. **Example**: a fact that illustrates an argument. **Concession**: a point granted to the other side (certes… mais). **Counter-argument**: the opposite view the author refutes.', '**Thèse** : la position défendue. **Argument** : une raison qui la soutient. **Exemple** : un fait qui illustre un argument. **Concession** : un point accordé au camp adverse (certes… mais). **Contre-argument** : l’opinion opposée que l’auteur réfute.')),
      doc(E1, b('What is the author’s thesis?', 'Quelle est la thèse de l’auteur ?'), [b('The four-day week deserves serious discussion.', 'La semaine de quatre jours mérite un vrai débat.'), b('The four-day week is a whim of spoiled workers.', 'La semaine de quatre jours est un caprice de travailleurs gâtés.'), b('Hospitals should close on Fridays.', 'Les hôpitaux devraient fermer le vendredi.'), b('Productivity is falling.', 'La productivité baisse.')]),
      doc(E1, b('Which point is a concession?', 'Quel point est une concession ?'), [b('The model does not suit every sector.', 'Le modèle ne convient pas à tous les secteurs.'), b('Productivity is stable or rising.', 'La productivité est stable, voire en hausse.'), b('Absenteeism is falling.', 'L’absentéisme recule.'), b('The five-day week was a conquest.', 'La semaine de cinq jours fut une conquête.')]),
      doc(E1, b('What is the function of the last sentence?', 'Quelle est la fonction de la dernière phrase ?'), [b('A rhetorical question that sums up the author’s view', 'Une question rhétorique qui résume la position de l’auteur'), b('A real question to readers', 'Une vraie question aux lecteurs'), b('An example', 'Un exemple'), b('A counter-argument', 'Un contre-argument')]),
      sort(b('Argument, example or concession?', 'Argument, exemple ou concession ?'), [b('argument / fact', 'argument / fait'), b('concession', 'concession'), b('counter-argument (refuted)', 'contre-argument (réfuté)')], [['La productivité reste stable.', 0], ['Un hôpital ne ferme pas le vendredi.', 1], ['« un caprice de jeunes travailleurs gâtés »', 2], ['L’absentéisme est en net recul.', 0]]),
      pairs(P.match, [['un caprice', b('a whim', 'envie passagère')], ['voire', b('or even', 'et même')], ['en net recul', b('clearly falling', 'en forte baisse')], ['une conquête', b('a hard-won gain', 'acquis obtenu par la lutte')]]),
      gap(P.complete, 'L’auteur ___ que le modèle ne convient pas à tous, ___ il refuse qu’on écarte le débat.', ['reconnaît', 'mais']),
    ],
    [
      b('Thesis = position; argument = reason; example = illustrating fact.', 'Thèse = position ; argument = raison ; exemple = fait qui illustre.'),
      b('Concession: certes… mais; counter-argument: the view refuted.', 'Concession : certes… mais ; contre-argument : la position réfutée.'),
      b('voire = or even.', 'voire = et même.'),
    ],
    [['la productivité', b('productivity', 'efficacité du travail')], ['l’absentéisme', b('absenteeism', 'absences au travail')], ['gâté', b('spoiled', 'trop favorisé')]],
  ),
  lesson(C, 2, ['nuanced-positions', 'positions-nuancees'],
    b('A nuanced position', 'Une position nuancée'),
    b('Understand a position that rejects two extremes.', 'Comprendre une position qui rejette deux extrêmes.'),
    [b('Identify the two extremes rejected', 'Identifier les deux extrêmes rejetés'), b('Understand à condition que, au lieu de', 'Comprendre à condition que, au lieu de'), b('Summarise the author’s solution', 'Résumer la solution de l’auteur')],
    13,
    [
      tip(b('Neither… nor…', 'Ni… ni…'), b('B2 texts often reject **two extremes** to defend a middle way: *not* the naive enthusiasm, *not* the return to the past, but a **condition** (à condition que, pourvu que, à la seule condition de).', 'Les textes B2 rejettent souvent **deux extrêmes** pour défendre une voie médiane : ni l’enthousiasme naïf, ni le retour en arrière, mais une **condition** (à condition que, pourvu que, à la seule condition de).')),
      doc(E2, b('What belief does the author criticise first?', 'Quelle croyance l’auteur critique-t-il d’abord ?'), [b('That giving out tablets would be enough to modernise school', 'Que distribuer des tablettes suffirait à moderniser l’école'), b('That teachers are useless', 'Que les enseignants sont inutiles'), b('That blackboards are better', 'Que le tableau noir est meilleur'), b('That screens help concentration', 'Que les écrans aident la concentration')]),
      doc(E2, b('Does the author want to go back to the blackboard?', 'L’auteur veut-il revenir au tableau noir ?'), [b('No, digital tools are useful under conditions.', 'Non, le numérique est utile sous conditions.'), b('Yes, absolutely.', 'Oui, absolument.'), b('Only for young children.', 'Seulement pour les jeunes enfants.'), b('He does not say.', 'Il ne le dit pas.')]),
      doc(E2, b('What solution does he propose?', 'Quelle solution propose-t-il ?'), [b('Training teachers', 'Former les enseignants'), b('Buying more devices', 'Acheter plus d’appareils'), b('Banning screens', 'Interdire les écrans'), b('Reducing school hours', 'Réduire les heures de classe')]),
      mc(P.meaning, [b('Digital tools must support teaching, not replace it.', 'Le numérique doit soutenir la pédagogie, pas la remplacer.'), b('Digital tools replace teachers.', 'Le numérique remplace les enseignants.'), b('Teaching projects are useless.', 'Les projets pédagogiques sont inutiles.'), b('Screens must be banned.', 'Il faut interdire les écrans.')], { fr: 'à condition qu’il serve un projet pédagogique au lieu de le remplacer' }),
      pairs(P.match, [['nuire à', b('to harm', 'faire du tort à')], ['pour autant', b('for all that, therefore', 'en conséquence')], ['précieux', b('valuable', 'de grande valeur')], ['rapporter', b('to bring in, to pay off', 'être rentable')]]),
      gap(P.complete, 'L’auteur ne veut ni des tablettes partout, ___ un retour au tableau noir : il défend le numérique ___ condition de former les enseignants.', ['ni', 'à']),
    ],
    [
      b('Nuanced stance: reject two extremes, propose a condition.', 'Position nuancée : rejeter deux extrêmes, proposer une condition.'),
      b('à condition que + subjunctive; au lieu de + infinitive.', 'à condition que + subjonctif ; au lieu de + infinitif.'),
      b('Faut-il pour autant… ? = rhetorical question before a nuance.', 'Faut-il pour autant… ? = question rhétorique avant une nuance.'),
    ],
    [['un outil', b('a tool', 'instrument')], ['la concentration', b('concentration, focus', 'attention soutenue')], ['décevant', b('disappointing', 'qui déçoit')]],
  ),
  lesson(C, 3, ['structure-and-summary', 'structure-et-resume'],
    b('Structure, final punch and summary', 'Structure, chute et résumé'),
    b('Follow the plan of a column and summarise it in two sentences.', 'Suivre le plan d’une chronique et la résumer en deux phrases.'),
    [b('Identify the plan: problem, causes, solutions', 'Repérer le plan : problème, causes, solutions'), b('Understand the final punchline', 'Comprendre la chute finale'), b('Write a two-sentence summary', 'Rédiger un résumé en deux phrases')],
    13,
    [
      doc(E3, b('What problem does the author describe?', 'Quel problème l’auteur décrit-il ?'), [b('Too many tourists at the same time harm residents.', 'Trop de touristes en même temps nuisent aux résidents.'), b('There are not enough tourists.', 'Il n’y a pas assez de touristes.'), b('Shops are closing.', 'Les commerces ferment.'), b('Hotels are too expensive.', 'Les hôtels sont trop chers.')]),
      doc(E3, b('Which solution is NOT proposed?', 'Quelle solution n’est PAS proposée ?'), [b('Closing the city to visitors', 'Fermer la ville aux visiteurs'), b('Spreading tourist flows', 'Mieux répartir les flux'), b('Limiting short-term rentals', 'Limiter les locations de courte durée'), b('Promoting other neighbourhoods', 'Faire découvrir d’autres quartiers')]),
      doc(E3, b('What does the last sentence mean?', 'Que signifie la dernière phrase ?'), [b('A city without residents loses its soul and becomes a set.', 'Une ville sans habitants perd son âme et devient un décor.'), b('Cities need more decorations.', 'Les villes ont besoin de plus de décorations.'), b('Tourists prefer empty cities.', 'Les touristes préfèrent les villes vides.'), b('Residents should leave.', 'Les résidents devraient partir.')]),
      card(b('A two-sentence summary', 'Un résumé en deux phrases'), b('Sentence 1: **the problem and the thesis**. Sentence 2: **the solutions or the main argument**. Use your own words and connectors: **L’auteur estime que… ; il propose donc de…**', 'Phrase 1 : **le problème et la thèse**. Phrase 2 : **les solutions ou l’argument principal**. Employez vos propres mots et des connecteurs : **L’auteur estime que… ; il propose donc de…**')),
      write(b('Summarise the column.', 'Résumez la chronique.'), b('Summarise the column on tourism in two or three sentences, in your own words.', 'Résumez la chronique sur le tourisme en deux ou trois phrases, avec vos propres mots.'), 35, 70,
        [b('The problem and the thesis', 'Le problème et la thèse'), b('At least two solutions', 'Au moins deux solutions'), b('Your own words (no copying)', 'Vos propres mots (pas de copie)'), b('One connector (donc, ainsi, c’est pourquoi)', 'Un connecteur (donc, ainsi, c’est pourquoi)')],
        'L’auteur estime que l’afflux massif de touristes dans le Vieux-Québec, s’il profite aux commerçants, rend la vie difficile aux résidents. Il propose donc de mieux étaler la fréquentation, d’encadrer les locations de courte durée et de valoriser d’autres quartiers, afin que la ville reste un lieu de vie et non un simple décor.',
        { phrases: ['L’auteur estime que…', 'si… , …', 'Il propose donc de…', 'afin que…'] }),
      pairs(P.match, [['une foule', b('a crowd', 'grand nombre de personnes')], ['se réjouir', b('to be delighted', 'être content')], ['saturé', b('overcrowded, saturated', 'trop plein')], ['répartir', b('to spread out', 'distribuer')]]),
    ],
    [
      b('Common plan: observation → problem → solutions → punchline.', 'Plan courant : constat → problème → solutions → chute.'),
      b('The punchline (chute) often sums up the thesis with an image.', 'La chute résume souvent la thèse par une image.'),
      b('Summary: problem + thesis, then solutions, in your own words.', 'Résumé : problème + thèse, puis solutions, avec vos mots.'),
    ],
    [['un flux', b('a flow', 'mouvement de personnes')], ['une location de courte durée', b('a short-term rental', 'logement loué pour quelques jours')], ['un décor', b('a set, a backdrop', 'cadre artificiel')]],
  ),
];
