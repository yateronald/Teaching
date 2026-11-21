import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Alors, ce week-end ? Every Monday morning, at the coffee machine or in class, the same conversation starts. This course trains you to tell what you did in a few lively sentences (passé composé and a touch of imparfait), to ask questions back, and to react naturally to other people’s weekends: the small talk that builds real relationships.',
    'Alors, ce week-end ? Chaque lundi matin, à la machine à café ou en classe, la même conversation commence. Ce cours vous entraîne à raconter ce que vous avez fait en quelques phrases vivantes (passé composé et une touche d’imparfait), à renvoyer des questions, et à réagir naturellement au week-end des autres : la petite conversation qui crée de vraies relations.',
  ),
  outcomes: [
    b('Tell what you did in the passé composé', 'Raconter ce que vous avez fait au passé composé'),
    b('Add a description with the imparfait', 'Ajouter une description à l’imparfait'),
    b('Ask about someone’s weekend', 'Interroger quelqu’un sur son week-end'),
    b('React with interest and empathy', 'Réagir avec intérêt et empathie'),
  ],
};

const C = 'c-weekend-talk';
export default [
  lesson(C, 1, ['what-did-you-do', 'qu-est-ce-que-tu-as-fait'],
    b('What did you do?', 'Qu’est-ce que tu as fait ?'),
    b('Tell your weekend in three or four short sentences in the passé composé.', 'Raconter son week-end en trois ou quatre phrases courtes au passé composé.'),
    [b('Use common weekend verbs', 'Utiliser les verbes courants du week-end'), b('Choose avoir or être', 'Choisir avoir ou être'), b('Link with d’abord, ensuite, après', 'Enchaîner avec d’abord, ensuite, après')],
    13,
    [
      card(b('Telling your weekend', 'Raconter son week-end'), b('**J’ai vu** un film, **j’ai fait** du vélo, **j’ai mangé** chez des amis, **je suis allé(e)** au marché, **je suis resté(e)** à la maison. Link: **d’abord**, **ensuite**, **après**, **finalement**.', '**J’ai vu** un film, **j’ai fait** du vélo, **j’ai mangé** chez des amis, **je suis allé(e)** au marché, **je suis resté(e)** à la maison. Enchaînez : **d’abord**, **ensuite**, **après**, **finalement**.'), {
        ex: [['Samedi, je suis allée au marché, ensuite j’ai fait un gâteau.', 'On Saturday I went to the market, then I baked a cake.'], ['Dimanche, je suis resté à la maison et j’ai regardé une série.', 'On Sunday I stayed home and watched a series.']],
      }),
      sort(b('Avoir or être?', 'Avoir ou être ?'), [b('avoir', 'avoir'), b('être', 'être')], [['… fait une randonnée', 0], ['… allé au cinéma', 1], ['… vu mes parents', 0], ['… resté chez moi', 1], ['… dormi tard', 0], ['… sorti avec des amis', 1]]),
      gap(P.complete, 'Samedi, je ___ allé au marché, puis j’___ fait une longue promenade.', ['suis', 'ai']),
      ord(P.order, 'Dimanche, on est allés voir mes grands-parents.', { tr: 'On Sunday we went to see my grandparents.' }),
      mc(P.choose, ['Je suis restée à la maison.', 'J’ai restée à la maison.', 'Je suis resté à la maison hier les.', 'Je reste à la maison hier.'], { fr: 'Une femme raconte son dimanche tranquille :' }),
      pairs(P.match, [['faire la grasse matinée', b('to sleep in', 'dormir tard le matin')], ['une randonnée', b('a hike', 'longue marche en nature')], ['un brunch', b('a brunch', 'repas du dimanche matin')], ['bricoler', b('to do DIY', 'faire des petits travaux')]]),
      say('Samedi, j’ai fait la grasse matinée, ensuite je suis allé au marché avec ma sœur.', 'On Saturday I slept in, then I went to the market with my sister.'),
    ],
    [
      b('Most verbs: avoir (j’ai vu, j’ai fait, j’ai mangé).', 'La plupart des verbes : avoir (j’ai vu, j’ai fait, j’ai mangé).'),
      b('Movement and staying: être (je suis allé(e), resté(e), sorti(e)).', 'Mouvement et rester : être (je suis allé(e), resté(e), sorti(e)).'),
      b('Link: d’abord, ensuite, après, finalement.', 'Enchaînez : d’abord, ensuite, après, finalement.'),
    ],
    [['la grasse matinée', b('a lie-in', 'dormir tard')], ['bricoler', b('to do DIY', 'petits travaux')], ['les grands-parents', b('grandparents', 'parents des parents')]],
  ),
  lesson(C, 2, ['how-was-it', 'c-etait-comment'],
    b('How was it? Adding details', 'C’était comment ? Ajouter des détails'),
    b('Add atmosphere with the imparfait: weather, people, feelings.', 'Ajouter l’ambiance avec l’imparfait : météo, gens, sentiments.'),
    [b('Say how it was: c’était…', 'Dire comment c’était : c’était…'), b('Describe weather and atmosphere', 'Décrire la météo et l’ambiance'), b('Mix passé composé and imparfait', 'Mélanger passé composé et imparfait')],
    13,
    [
      card(b('C’était génial !', 'C’était génial !'), b('Events → passé composé: **on est allés à la plage**. Description → imparfait: **il faisait beau, il y avait du monde, c’était génial**. Useful: **c’était super / sympa / tranquille / bof / épuisant**.', 'Événements → passé composé : **on est allés à la plage**. Description → imparfait : **il faisait beau, il y avait du monde, c’était génial**. Utile : **c’était super / sympa / tranquille / bof / épuisant**.')),
      gap(P.complete, 'On est allés à la plage. Il ___ beau et il y ___ beaucoup de monde. C’___ génial !', ['faisait', 'avait', 'était']),
      sort(b('Event or description?', 'Événement ou description ?'), [b('event (passé composé)', 'événement (passé composé)'), b('description (imparfait)', 'description (imparfait)')], [['on a pique-niqué', 0], ['il faisait chaud', 1], ['on a rencontré Paul', 0], ['c’était tranquille', 1], ['j’ai perdu mes clés', 0], ['il y avait du vent', 1]]),
      mc(P.best, ['Bof, il pleuvait tout le temps, alors on est restés à l’intérieur.', 'Bof, il a plu tout le temps hier demain.', 'Bof, je pleuvais.', 'Bof, c’est été la pluie.'], { fr: '— Et ton week-end au chalet, c’était comment ?' }),
      dlg(b('Monday at the coffee machine', 'Lundi à la machine à café'), undefined, [['Nora', 'f'], ['Vous', 'm']], [
        [0, 'Salut ! Alors, ce week-end ?', 'Hi! So, how was the weekend?'],
        [1, { options: ['Super ! On est allés faire une randonnée. Il faisait un temps magnifique.', 'Super ! On allait une randonnée.', 'Week-end. Randonnée.'] }],
        [0, 'Ah, chanceux ! Vous êtes allés où ?', 'Oh, lucky you! Where did you go?'],
        [1, { options: ['Dans les Laurentides. C’était magnifique, les arbres étaient tout rouges. Et toi ?', 'Je ne sais pas.', 'Oui.'] }],
        [0, 'Moi, c’était plus tranquille : j’ai fait le ménage et j’ai lu.', 'Mine was quieter: I cleaned and read.'],
      ]),
      pairs(P.match, [['C’était sympa.', b('It was nice.', 'agréable')], ['Bof.', b('Meh.', 'pas terrible')], ['épuisant', b('exhausting', 'très fatigant')], ['il y avait du monde', b('it was crowded', 'beaucoup de gens')]]),
      say('C’était génial ! Il faisait beau et il y avait plein de monde au marché.', 'It was great! The weather was nice and the market was full of people.'),
    ],
    [
      b('Events: passé composé. Descriptions: imparfait.', 'Événements : passé composé. Descriptions : imparfait.'),
      b('Il faisait beau, il y avait du monde, c’était super.', 'Il faisait beau, il y avait du monde, c’était super.'),
      b('Bof = so-so, not great.', 'Bof = moyen, pas terrible.'),
    ],
    [['un chalet', b('a cottage (Québec), a chalet', 'maison de campagne')], ['le ménage', b('housework, cleaning', 'nettoyer la maison')], ['chanceux', b('lucky', 'qui a de la chance')]],
  ),
  lesson(C, 3, ['asking-and-reacting', 'demander-et-reagir'],
    b('Asking back and reacting', 'Questionner et réagir'),
    b('Ask follow-up questions and react with the right emotion.', 'Poser des questions de relance et réagir avec la bonne émotion.'),
    [b('Ask follow-up questions', 'Poser des questions de relance'), b('React to good news', 'Réagir à une bonne nouvelle'), b('React to bad news', 'Réagir à une mauvaise nouvelle')],
    13,
    [
      card(b('Reacting', 'Réagir'), b('Good news: **Génial ! Tant mieux ! Ça a l’air super !** Bad news: **Oh non ! Mince ! Ça n’a pas dû être facile. Pauvre toi !** Follow-ups: **C’était où ? Avec qui ? Tu as aimé ? Tu y retournerais ?**', 'Bonne nouvelle : **Génial ! Tant mieux ! Ça a l’air super !** Mauvaise nouvelle : **Oh non ! Mince ! Ça n’a pas dû être facile. Pauvre toi !** Relances : **C’était où ? Avec qui ? Tu as aimé ? Tu y retournerais ?**')),
      sort(b('Which reaction?', 'Quelle réaction ?'), [b('good news', 'bonne nouvelle'), b('bad news', 'mauvaise nouvelle')], [['Ça a l’air super !', 0], ['Oh non, mince !', 1], ['Tant mieux !', 0], ['Pauvre toi !', 1], ['Génial !', 0], ['Ça n’a pas dû être facile.', 1]]),
      mc(P.best, ['Oh non, mince ! Et tu vas mieux maintenant ?', 'Génial !', 'Tant mieux !', 'Ah, ça a l’air super.'], { fr: '— J’ai été malade tout le week-end.' }),
      mc(P.best, ['Ça a l’air génial ! C’était quel groupe ?', 'Pauvre toi !', 'Oh non !', 'Ça n’a pas dû être facile.'], { fr: '— Samedi, je suis allée à un concert en plein air.' }),
      dlg(b('Your colleague’s weekend', 'Le week-end d’un collègue'), undefined, [['Hugo', 'm'], ['Vous', 'f']], [
        [0, 'J’ai enfin fini de repeindre mon salon !', 'I finally finished painting my living room!'],
        [1, { options: ['Bravo ! Tu as choisi quelle couleur ?', 'Oh non, pauvre toi !', 'Et alors ?'] }],
        [0, 'Vert clair. Mais dimanche, ma voiture est tombée en panne.', 'Light green. But on Sunday my car broke down.'],
        [1, { options: ['Oh non, mince ! Ça n’a pas dû être facile. Elle est au garage ?', 'Génial !', 'Tant mieux !'] }],
      ]),
      ord(P.order, 'Tu y retournerais avec ta famille ?', { tr: 'Would you go back there with your family?' }),
      say('Ça a l’air génial ! Et c’était où exactement ?', 'That sounds great! And where was it exactly?'),
    ],
    [
      b('Good news: Génial ! Tant mieux ! Ça a l’air super !', 'Bonne nouvelle : Génial ! Tant mieux ! Ça a l’air super !'),
      b('Bad news: Oh non ! Mince ! Pauvre toi !', 'Mauvaise nouvelle : Oh non ! Mince ! Pauvre toi !'),
      b('Follow up: C’était où ? Avec qui ? Tu as aimé ?', 'Relancez : C’était où ? Avec qui ? Tu as aimé ?'),
    ],
    [['mince !', b('darn!', 'exclamation de déception')], ['repeindre', b('to repaint', 'peindre à nouveau')], ['tomber en panne', b('to break down', 'ne plus fonctionner')]],
  ),
];
