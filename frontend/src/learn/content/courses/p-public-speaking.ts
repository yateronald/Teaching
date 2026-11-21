import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, mc, ord, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A good presentation in French depends as much on your voice as on your slides. Speaking too fast, with no pauses and a flat melody, makes even perfect French hard to follow. This course trains the vocal tools of presentation: a calm pace, strategic pauses, volume and articulation, emphasis on key words, and the oral signposts (premièrement, j’en viens maintenant à…, pour conclure) that guide your audience.',
    'Une bonne présentation en français dépend autant de votre voix que de vos diapositives. Parler trop vite, sans pauses et d’une voix monotone rend difficile à suivre même un français parfait. Ce cours entraîne les outils vocaux de la présentation : un débit posé, des pauses stratégiques, le volume et l’articulation, l’insistance sur les mots clés, et les balises orales (premièrement, j’en viens maintenant à…, pour conclure) qui guident votre public.',
  ),
  outcomes: [
    b('Control your pace and pauses', 'Maîtriser son débit et ses pauses'),
    b('Articulate clearly and project your voice', 'Articuler clairement et porter la voix'),
    b('Stress the key words', 'Mettre en valeur les mots clés'),
    b('Guide your audience with oral signposts', 'Guider le public par des balises orales'),
  ],
};

const C = 'p-public-speaking';
export default [
  lesson(C, 1, ['pace-and-pauses', 'debit-et-pauses'],
    b('Pace and pauses', 'Le débit et les pauses'),
    b('Slow down, breathe between groups and use silence on purpose.', 'Ralentir, respirer entre les groupes et utiliser le silence volontairement.'),
    [b('Find a calm pace', 'Trouver un débit posé'), b('Breathe between groups', 'Respirer entre les groupes'), b('Use a strategic pause', 'Utiliser une pause stratégique')],
    13,
    [
      card(b('Pace and silence', 'Débit et silence'), b('In conversation, French speakers say about **5–6 syllables per second**; in a presentation, aim for **4**. Breathe at **group boundaries** (commas, ends of ideas). A **two-second pause** before a key figure or after a question makes the audience listen: **Le résultat… (pause) … quarante pour cent.**', 'En conversation, on prononce environ **5 à 6 syllabes par seconde** ; en présentation, visez **4**. Respirez aux **frontières de groupe** (virgules, fins d’idées). Une **pause de deux secondes** avant un chiffre clé ou après une question capte l’attention : **Le résultat… (pause) … quarante pour cent.**')),
      tip(b('Fillers', 'Les mots de remplissage'), b('Replace **euh…, ben…, du coup…** by a **silent pause**. Silence feels long to you but natural to the audience, and it makes you look confident.', 'Remplacez **euh…, ben…, du coup…** par une **pause silencieuse**. Le silence vous paraît long, mais il semble naturel au public, et il vous donne de l’assurance.')),
      mc(P.best, ['Cette année, | nos ventes ont augmenté de… | quarante pour cent.', 'Cette année nos ventes ont augmenté de quarante pour cent euh voilà.', 'Cette | année nos | ventes ont | augmenté.', 'Euh, du coup, cette année, ben, les ventes, euh…'], { fr: 'Quelle version utilise le mieux les pauses ?' }),
      hear('Pourquoi ce projet est-il important ? … Parce qu’il touche chacun d’entre nous.', b('Listen. What technique is used?', 'Écoutez. Quelle technique est employée ?'), [b('a question followed by a pause', 'une question suivie d’une pause'), b('a list of figures', 'une liste de chiffres'), b('very fast speech', 'un débit très rapide'), b('fillers (euh, ben)', 'des mots de remplissage (euh, ben)')], { voice: 'm' }),
      sort(b('Helps or hurts the presentation?', 'Aide ou nuit à la présentation ?'), [b('helps', 'aide'), b('hurts', 'nuit')], [['une pause avant un chiffre clé', 0], ['« euh » toutes les cinq secondes', 1], ['respirer à la fin d’une idée', 0], ['accélérer à la fin', 1], ['un débit d’environ quatre syllabes par seconde', 0], ['parler sans jamais s’arrêter', 1]]),
      say('Cette année, nos ventes ont augmenté de… quarante pour cent.', 'This year our sales went up by… forty per cent.', { tip: b('Pause before « quarante pour cent ».', 'Faites une pause avant « quarante pour cent ».') }),
    ],
    [
      b('Aim for about 4 syllables per second.', 'Visez environ 4 syllabes par seconde.'),
      b('Breathe at the end of groups and ideas.', 'Respirez en fin de groupe et d’idée.'),
      b('Replace euh / du coup with a silent pause.', 'Remplacez euh / du coup par une pause silencieuse.'),
    ],
    [['les ventes', b('sales', 'ce qu’on vend')], ['augmenter', b('to increase', 'monter')], ['l’assurance', b('confidence', 'confiance en soi')]],
  ),
  lesson(C, 2, ['articulation-and-emphasis', 'articulation-et-mise-en-valeur'],
    b('Articulation and emphasis', 'Articulation et mise en valeur'),
    b('Articulate the consonants, project your voice and highlight the key words.', 'Articuler les consonnes, porter la voix et mettre en valeur les mots clés.'),
    [b('Articulate clearly', 'Articuler clairement'), b('Project without shouting', 'Porter la voix sans crier'), b('Stress the key words', 'Mettre en valeur les mots clés')],
    13,
    [
      card(b('Clear and strong', 'Clair et fort'), b('**Articulation**: open your mouth more than in conversation; make every consonant clear, especially at the end of groups. **Projection**: speak from the belly, aim your voice at the back of the room. **Emphasis**: slow down and stress the **key word**: **Ce n’est pas une option, c’est une NÉ-cessité.**', '**Articulation** : ouvrez la bouche plus qu’en conversation ; faites entendre chaque consonne, surtout en fin de groupe. **Projection** : parlez avec le ventre, visez le fond de la salle. **Mise en valeur** : ralentissez et accentuez le **mot clé** : **Ce n’est pas une option, c’est une NÉ-cessité.**')),
      card(b('Warm-up: tongue twisters', 'Échauffement : les virelangues'), b('Actors warm up with **virelangues**: **Les chaussettes de l’archiduchesse sont-elles sèches ? Archi-sèches !** · **Un chasseur sachant chasser doit savoir chasser sans son chien.** Say them slowly, then faster, keeping every sound clear.', 'Les comédiens s’échauffent avec des **virelangues** : **Les chaussettes de l’archiduchesse sont-elles sèches ? Archi-sèches !** · **Un chasseur sachant chasser doit savoir chasser sans son chien.** Dites-les lentement, puis plus vite, en gardant chaque son clair.'), { variant: 'tip' }),
      say('Les chaussettes de l’archiduchesse sont-elles sèches ? Archi-sèches !', 'Are the archduchess’s socks dry? Extra-dry!', { tip: b('Slowly first: s and ch must stay distinct.', 'Lentement d’abord : s et ch doivent rester distincts.') }),
      say('Un chasseur sachant chasser doit savoir chasser sans son chien.', 'A hunter who knows how to hunt must know how to hunt without his dog.'),
      mc(P.choose, [b('nécessité: it carries the contrast', 'nécessité : il porte le contraste'), b('pas', 'pas'), b('une', 'une'), b('c’est', 'c’est')], { fr: 'Quel mot mettre en valeur dans « Ce n’est pas une option, c’est une nécessité » ?' }),
      dict('Ce n’est pas une option, c’est une nécessité absolue.', { hint: b('Listen for the emphasis on nécessité.', 'Écoutez l’insistance sur nécessité.') }),
    ],
    [
      b('Articulate more than in conversation; open your mouth.', 'Articulez plus qu’en conversation ; ouvrez la bouche.'),
      b('Project from the belly towards the back of the room.', 'Portez la voix du ventre vers le fond de la salle.'),
      b('Slow down and stress the key word.', 'Ralentissez et accentuez le mot clé.'),
    ],
    [['un virelangue', b('a tongue twister', 'phrase difficile à dire')], ['un chasseur', b('a hunter', 'qui chasse')], ['sec, sèche', b('dry', 'sans eau')]],
  ),
  lesson(C, 3, ['oral-signposts', 'les-balises-orales'],
    b('Oral signposts', 'Les balises orales'),
    b('Announce your plan, mark transitions and signal your conclusion.', 'Annoncer son plan, marquer les transitions et signaler la conclusion.'),
    [b('Announce the plan', 'Annoncer le plan'), b('Mark transitions', 'Marquer les transitions'), b('Signal the conclusion', 'Signaler la conclusion')],
    13,
    [
      card(b('Guiding the audience', 'Guider le public'), b('An audience cannot reread: tell them where you are. **Plan**: **Je vais aborder trois points : d’abord…, ensuite…, enfin…** **Transition**: **J’en viens maintenant à mon deuxième point.** · **Passons à…** **Conclusion**: **Pour conclure, …** · **Si je ne devais retenir qu’une chose, ce serait…** · **Je vous remercie de votre attention. Avez-vous des questions ?**', 'Un public ne peut pas relire : dites-lui où vous en êtes. **Plan** : **Je vais aborder trois points : d’abord…, ensuite…, enfin…** **Transition** : **J’en viens maintenant à mon deuxième point.** · **Passons à…** **Conclusion** : **Pour conclure, …** · **Si je ne devais retenir qu’une chose, ce serait…** · **Je vous remercie de votre attention. Avez-vous des questions ?**')),
      sort(b('Plan, transition or conclusion?', 'Plan, transition ou conclusion ?'), [b('plan', 'plan'), b('transition', 'transition'), b('conclusion', 'conclusion')], [['Je vais aborder trois points.', 0], ['J’en viens maintenant à…', 1], ['Pour conclure, …', 2], ['Dans un premier temps, nous verrons…', 0], ['Passons à la question du budget.', 1], ['Si je ne devais retenir qu’une chose…', 2]]),
      ord(P.order, 'J’en viens maintenant à mon deuxième point.', { tr: 'I now come to my second point.' }),
      hear('Je vais aborder trois points : d’abord le contexte, ensuite les résultats, et enfin nos propositions.', b('Listen. What is the second point?', 'Écoutez. Quel est le deuxième point ?'), [b('the results', 'les résultats'), b('the context', 'le contexte'), b('the proposals', 'les propositions'), b('the budget', 'le budget')], { voice: 'f' }),
      write(b('Write your introduction.', 'Rédigez votre introduction.'), b('Write the first 30 seconds (50–80 words) of a presentation about a project you know: greet, announce your topic and your three-point plan.', 'Rédigez les 30 premières secondes (50–80 mots) d’une présentation sur un projet que vous connaissez : saluez, annoncez le sujet et votre plan en trois points.'), 50, 80, [
        b('A greeting', 'Une salutation'),
        b('The topic in one sentence', 'Le sujet en une phrase'),
        b('A three-point plan with d’abord, ensuite, enfin', 'Un plan en trois points avec d’abord, ensuite, enfin'),
      ], 'Bonjour à toutes et à tous, et merci d’être là. Je vais vous présenter notre projet de jardin partagé dans le quartier. Je vais aborder trois points : d’abord, l’origine du projet ; ensuite, les premiers résultats après six mois ; et enfin, ce que nous vous proposons pour l’année prochaine. Je répondrai volontiers à vos questions à la fin.', { phrases: ['Je vais aborder trois points', 'd’abord', 'ensuite', 'enfin'] }),
      say('Pour conclure, si je ne devais retenir qu’une chose, ce serait celle-ci : ensemble, nous pouvons réussir. Je vous remercie de votre attention.', 'To conclude, if I had to remember only one thing, it would be this: together we can succeed. Thank you for your attention.'),
    ],
    [
      b('Announce the plan: Je vais aborder trois points.', 'Annoncez le plan : Je vais aborder trois points.'),
      b('Transitions: J’en viens maintenant à… Passons à…', 'Transitions : J’en viens maintenant à… Passons à…'),
      b('Conclude: Pour conclure… Si je ne devais retenir qu’une chose…', 'Conclure : Pour conclure… Si je ne devais retenir qu’une chose…'),
    ],
    [['aborder', b('to address (a topic)', 'traiter')], ['un jardin partagé', b('a community garden', 'jardin collectif')], ['volontiers', b('gladly', 'avec plaisir')]],
  ),
];
