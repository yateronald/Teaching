import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Tu ne devineras jamais ce qui m’est arrivé ! A good anecdote is one of the best ways to connect with people. This course teaches you the structure of a spoken story (setting, trigger, events, punchline), the time markers that create suspense (soudain, tout à coup, au moment où), the mix of passé composé and imparfait, and the phrases listeners use to react and encourage you.',
    'Tu ne devineras jamais ce qui m’est arrivé ! Une bonne anecdote est l’un des meilleurs moyens de créer des liens. Ce cours présente la structure d’une histoire racontée (cadre, élément déclencheur, péripéties, chute), les marqueurs qui créent le suspense (soudain, tout à coup, au moment où), l’alternance passé composé et imparfait, et les formules qu’utilisent les auditeurs pour réagir et vous encourager.',
  ),
  outcomes: [
    b('Open a story and set the scene', 'Ouvrir une histoire et planter le décor'),
    b('Build suspense with time markers', 'Créer du suspense avec les marqueurs de temps'),
    b('Finish with a punchline or a lesson', 'Finir par une chute ou une morale'),
    b('React as a listener', 'Réagir en tant qu’auditeur'),
  ],
};

const C = 'c-storytelling';
export default [
  lesson(C, 1, ['setting-the-scene', 'planter-le-decor'],
    b('Opening and setting the scene', 'Ouvrir et planter le décor'),
    b('Catch your listener’s attention and describe the situation in the imparfait.', 'Capter l’attention et décrire la situation à l’imparfait.'),
    [b('Open with a hook', 'Ouvrir avec une accroche'), b('Set the scene in the imparfait', 'Planter le décor à l’imparfait'), b('Say when and where', 'Dire quand et où')],
    13,
    [
      card(b('The hook', 'L’accroche'), b('**Tu ne devineras jamais ce qui m’est arrivé !** · **Il faut que je te raconte un truc incroyable.** · **Tu sais ce qui m’est arrivé hier ?** Then the scene, in the **imparfait**: **C’était samedi soir, il pleuvait, j’attendais le bus…**', '**Tu ne devineras jamais ce qui m’est arrivé !** · **Il faut que je te raconte un truc incroyable.** · **Tu sais ce qui m’est arrivé hier ?** Puis le décor, à l’**imparfait** : **C’était samedi soir, il pleuvait, j’attendais le bus…**'), {
        ex: [['Il faut que je te raconte un truc incroyable.', 'I have to tell you something incredible.'], ['C’était l’été dernier, on était en vacances en Bretagne…', 'It was last summer, we were on holiday in Brittany…']],
      }),
      mc(P.best, ['Tu ne devineras jamais ce qui m’est arrivé ce matin !', 'Ce matin, rien.', 'J’ai une question pour toi.', 'Bon, au revoir.'], { fr: 'Vous voulez capter l’attention de votre ami avant de raconter :' }),
      gap(P.completeText, 'C’___ un mardi matin. Il ___ très froid et je ___ en retard pour le travail.', ['était', 'faisait', 'étais']),
      sort(b('Scene (imparfait) or event (passé composé)?', 'Décor (imparfait) ou événement (passé composé) ?'), [b('scene', 'décor'), b('event', 'événement')], [['il faisait nuit', 0], ['quelqu’un a frappé', 1], ['j’étais seule', 0], ['la lumière s’est éteinte', 1], ['tout était calme', 0], ['j’ai crié', 1]]),
      ord(P.order, 'Il faut que je te raconte un truc incroyable !', { tr: 'I have to tell you something incredible!' }),
      pairs(P.match, [['deviner', b('to guess', 'trouver sans savoir')], ['un truc', b('a thing (informal)', 'une chose')], ['il faisait nuit', b('it was dark', 'pas de soleil')], ['planter le décor', b('to set the scene', 'décrire le cadre')]]),
      say('Tu ne devineras jamais ce qui m’est arrivé ! C’était hier soir, il pleuvait, et j’attendais le bus…', 'You’ll never guess what happened to me! It was last night, it was raining, and I was waiting for the bus…'),
    ],
    [
      b('Hook: Tu ne devineras jamais ce qui m’est arrivé !', 'Accroche : Tu ne devineras jamais ce qui m’est arrivé !'),
      b('Scene: imparfait (c’était, il faisait, j’attendais).', 'Décor : imparfait (c’était, il faisait, j’attendais).'),
      b('Say when and where early.', 'Dites tôt quand et où.'),
    ],
    [['arriver (à qqn)', b('to happen (to someone)', 'se produire')], ['une anecdote', b('an anecdote', 'petite histoire vraie')], ['frapper', b('to knock', 'taper à la porte')]],
  ),
  lesson(C, 2, ['building-suspense', 'creer-le-suspense'],
    b('Building suspense', 'Créer le suspense'),
    b('Use time markers and the present of narration to make your story lively.', 'Utiliser les marqueurs de temps et le présent de narration pour rendre l’histoire vivante.'),
    [b('Use soudain, tout à coup, au moment où', 'Utiliser soudain, tout à coup, au moment où'), b('Sequence the events', 'Enchaîner les événements'), b('Try the narrative present', 'Essayer le présent de narration')],
    13,
    [
      card(b('Suspense markers', 'Les marqueurs de suspense'), b('**Soudain / tout à coup**, **au moment où je sortais**, **à ce moment-là**, **et là…**, **du coup**, **finalement**. Many speakers switch to the **present** for the key moment: **Et là, je vois un homme qui court vers moi !**', '**Soudain / tout à coup**, **au moment où je sortais**, **à ce moment-là**, **et là…**, **du coup**, **finalement**. Beaucoup passent au **présent** pour le moment clé : **Et là, je vois un homme qui court vers moi !**')),
      gap(P.completeText, 'J’allais fermer la porte. ___ , le téléphone a sonné. Au ___ où je répondais, la lumière s’est éteinte.', [['Soudain', 'Tout à coup'], 'moment']),
      mc(P.best, ['Et là, je vois mon chat sur le toit du voisin !', 'Et là, je voyais mon chat sur le toit demain.', 'Et là, je verrai mon chat hier.', 'Et là, voir chat toit.'], { fr: 'Le moment clé de l’histoire, au présent de narration :' }),
      hear('Je marchais tranquillement dans la rue. Tout à coup, une femme m’a appelé par mon prénom. C’était ma professeure de primaire, que je n’avais pas vue depuis vingt ans !', b('Who called the speaker?', 'Qui a appelé le narrateur ?'), [b('his former primary-school teacher', 'son ancienne professeure de primaire'), b('his mother', 'sa mère'), b('a stranger who was lost', 'une inconnue perdue'), b('a colleague from work', 'une collègue de travail')], { voice: 'm' }),
      ord(P.order, 'Au moment où je sortais, il a commencé à pleuvoir.', { tr: 'Just as I was going out, it started raining.' }),
      pairs(P.match, [['tout à coup', b('all of a sudden', 'soudain')], ['au moment où', b('just as', 'à l’instant où')], ['et là…', b('and then… (suspense)', 'moment clé')], ['du coup', b('so, as a result', 'par conséquent (oral)')]]),
      say('Au moment où j’ouvrais la porte, tout à coup, j’ai entendu un bruit énorme !', 'Just as I was opening the door, all of a sudden, I heard a huge noise!'),
    ],
    [
      b('Soudain, tout à coup, au moment où, et là…', 'Soudain, tout à coup, au moment où, et là…'),
      b('Au moment où + imparfait, + passé composé.', 'Au moment où + imparfait, + passé composé.'),
      b('The present makes the key moment vivid.', 'Le présent rend le moment clé vivant.'),
    ],
    [['sonner', b('to ring', 'faire un bruit (téléphone)')], ['s’éteindre', b('to go out (light)', 'cesser d’éclairer')], ['la primaire', b('primary school', 'école des enfants')]],
  ),
  lesson(C, 3, ['ending-and-reacting', 'la-chute-et-les-reactions'],
    b('The ending, and reacting as a listener', 'La chute, et réagir en auditeur'),
    b('Finish with a punchline or a lesson, and encourage a storyteller.', 'Finir par une chute ou une morale, et encourager celui qui raconte.'),
    [b('End with a punchline', 'Finir par une chute'), b('Draw a conclusion', 'Tirer une conclusion'), b('React as a listener', 'Réagir en tant qu’auditeur')],
    13,
    [
      card(b('The ending', 'La chute'), b('**Finalement, …** · **Au bout du compte, …** · **Et tu sais quoi ? C’était…** · **Bref, je ne suis pas près de recommencer !** · **Moralité : toujours vérifier l’heure du train !**', '**Finalement, …** · **Au bout du compte, …** · **Et tu sais quoi ? C’était…** · **Bref, je ne suis pas près de recommencer !** · **Moralité : toujours vérifier l’heure du train !**')),
      card(b('Listener reactions', 'Les réactions de l’auditeur'), b('Encourage: **Non ?! Sérieux ? Et alors ? Et après ? Raconte !** End: **Quelle histoire ! C’est dingue ! J’aurais eu trop peur ! Ça n’arrive qu’à toi !**', 'Encourager : **Non ?! Sérieux ? Et alors ? Et après ? Raconte !** À la fin : **Quelle histoire ! C’est dingue ! J’aurais eu trop peur ! Ça n’arrive qu’à toi !**')),
      mc(P.best, ['Non ?! Et alors, qu’est-ce qu’il a fait ?', 'D’accord. Bon.', 'Je m’en fiche.', 'Ça ne m’intéresse pas.'], { fr: '— Et là, le chauffeur a arrêté le bus au milieu de la route…' }),
      mc(P.best, ['Bref, moralité : toujours garder une clé chez la voisine !', 'Bref, c’est tout, voilà, voilà, rien.', 'Je ne sais pas comment finir.', 'Fin.'], { fr: 'Vous concluez l’histoire de la porte fermée à clé :' }),
      dlg(b('A story at lunch', 'Une histoire au dîner'), undefined, [['Théo', 'm'], ['Vous', 'f']], [
        [0, 'Hier, je suis resté coincé dans l’ascenseur pendant une heure.', 'Yesterday I was stuck in the lift for an hour.'],
        [1, { options: ['Non ?! Sérieux ? Et alors, raconte !', 'Ah. Tu veux du pain ?', 'Moi aussi, une fois.'] }],
        [0, 'Et là, le technicien arrive… et il reste coincé avec moi !', 'And then the technician arrives… and gets stuck with me!'],
        [1, { options: ['C’est dingue ! Ça n’arrive qu’à toi !', 'Normal.', 'Et donc ?'] }],
        [0, 'Bref, maintenant, je prends l’escalier !', 'Anyway, now I take the stairs!'],
      ]),
      pairs(P.match, [['Moralité :', b('The moral is:', 'la leçon de l’histoire')], ['Bref,', b('Anyway, in short,', 'pour résumer')], ['C’est dingue !', b('That’s crazy!', 'c’est incroyable')], ['coincé', b('stuck', 'bloqué')]]),
      say('Bref, au bout du compte, on a bien rigolé. Mais je ne suis pas près de recommencer !', 'Anyway, in the end we had a good laugh. But I won’t be doing that again any time soon!'),
    ],
    [
      b('End: Finalement… Bref… Moralité : …', 'Conclure : Finalement… Bref… Moralité : …'),
      b('Encourage: Non ?! Sérieux ? Et alors ? Raconte !', 'Encourager : Non ?! Sérieux ? Et alors ? Raconte !'),
      b('React: Quelle histoire ! C’est dingue !', 'Réagir : Quelle histoire ! C’est dingue !'),
    ],
    [['un ascenseur', b('a lift, an elevator', 'pour monter les étages')], ['rigoler', b('to laugh (informal)', 'rire')], ['ne pas être près de', b('not about to (do again)', 'ne pas recommencer bientôt')]],
  ),
];
