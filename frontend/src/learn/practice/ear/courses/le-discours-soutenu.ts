// C2 · Markers of formal discourse: force est de constater, d’aucuns, nonobstant, au demeurant.
import { ear, ex, fill, pick, situation } from '../authoring';

const BILAN = 'Force est de constater que, nonobstant les efforts consentis, les résultats demeurent insuffisants. D’aucuns y verront un échec ; j’y vois, au demeurant, une invitation à persévérer.';
const BILAN_SHOW = '{Force est de constater} que, {nonobstant} les efforts consentis, les résultats demeurent insuffisants. {D’aucuns} y verront un échec ; j’y vois, {au demeurant}, une invitation à persévérer.';

export default ear('le-discours-soutenu', {
  rule: [
    ['Les marques du discours soutenu', 'The markers of formal speech'],
    [
      'Discours officiels, conférences, plaidoiries et éditoriaux emploient des tournures rares à l’écrit courant et presque absentes de la conversation :\n\n__force est de constater__ (on est obligé de reconnaître), __d’aucuns__ (certains), __nonobstant__ (malgré), __au demeurant__ (d’ailleurs, du reste), __de surcroît__ (en plus), __sans ambages__ (franchement), __à maints égards__ (à bien des égards), __à l’aune de__ (en prenant comme critère), __il sied de__ (il convient de).\n\nIl suffit de les comprendre pour suivre le raisonnement.',
      'Official speeches, lectures, pleas and editorials use phrases rare in everyday writing and almost absent from conversation:\n\n__force est de constater__ (one has to admit), __d’aucuns__ (some people), __nonobstant__ (notwithstanding), __au demeurant__ (besides, moreover), __de surcroît__ (in addition), __sans ambages__ (frankly), __à maints égards__ (in many respects), __à l’aune de__ (measured by), __il sied de__ (it is fitting to).\n\nUnderstanding them is enough to follow the reasoning.',
    ],
  ],
  goal: ['Comprendre les tournures du discours soutenu.', 'Understand the phrases of formal discourse.'],
  examples: [
    ex('Force est de constater que le délai est dépassé.', '{Force est de constater} que le délai est dépassé.', ['= On doit reconnaître que.', '= One has to admit that.']),
    ex('D’aucuns le regrettent.', '{D’aucuns} le regrettent.', ['= Certains le regrettent.', '= Some regret it.']),
    ex('Nonobstant les critiques, le projet continue.', '{Nonobstant} les critiques, le projet continue.', ['= Malgré les critiques.', '= Despite the criticism.']),
  ],
  items: [
    pick('Force est de constater que le projet a échoué.', ['On espère que le projet réussira', 'On doit reconnaître que le projet a échoué'], 1, '{Force est de constater} que le projet a échoué.', [
      'Force est de = on est obligé de.', 'Force est de = one is forced to.',
    ], ['Que dit l’orateur ?', 'What is the speaker saying?']),
    pick('D’aucuns prétendent que la réforme est inutile.', ['Personne', 'Certaines personnes'], 1, '{D’aucuns} prétendent que la réforme est inutile.', [
      'D’aucuns = certains.', 'D’aucuns = some people.',
    ], ['Qui prétend cela ?', 'Who claims this?']),
    pick('Nonobstant les difficultés, le chantier avance.', ['Malgré les difficultés', 'À cause des difficultés'], 0, '{Nonobstant} les difficultés, le chantier avance.', [
      'Nonobstant = malgré.', 'Notwithstanding.',
    ], ['Que signifie « nonobstant » ?', 'What does « nonobstant » mean?']),
    pick('Il a parlé sans ambages.', ['Avec beaucoup de détours', 'Franchement, directement'], 1, 'Il a parlé {sans ambages}.', [
      'Sans ambages = sans détour.', 'Without beating about the bush.',
    ], ['Comment a-t-il parlé ?', 'How did he speak?']),
    pick('Le projet est coûteux et, de surcroît, risqué.', ['En plus', 'Pourtant'], 0, 'Le projet est coûteux et, {de surcroît}, risqué.', [
      'De surcroît = en plus, par-dessus le marché.', 'Moreover.',
    ], ['Que signifie « de surcroît » ?', 'What does « de surcroît » mean?']),
    fill('Au demeurant, la question reste ouverte.', 'Au ___, la question reste ouverte.', 'demeurant', 'Au {demeurant}, la question reste ouverte.', [
      'Au demeurant = d’ailleurs.', 'Besides.',
    ]),
    fill('À maints égards, il a raison.', 'À ___ égards, il a raison.', 'maints', 'À {maints} égards, il a raison.', [
      'Maints = beaucoup de (soutenu).', 'Maints = many (formal).',
    ]),
    fill('On le juge à l’aune de ses résultats.', 'On le juge à l’___ de ses résultats.', 'aune', 'On le juge à l’{aune} de ses résultats.', [
      'À l’aune de = en prenant comme mesure.', 'Measured by.',
    ]),
    situation(BILAN, 'Que constate l’orateur ?', ['Les résultats sont excellents', 'Les résultats restent insuffisants malgré les efforts', 'Il n’y a pas eu d’efforts'], 1, BILAN_SHOW, [
      '« Nonobstant les efforts consentis, les résultats demeurent insuffisants ».', 'Despite the efforts, results remain inadequate.',
    ]),
    situation(BILAN, 'Comment l’orateur interprète-t-il la situation ?', ['Comme un échec définitif', 'Comme une raison d’abandonner', 'Comme une invitation à continuer'], 2, BILAN_SHOW, [
      '« D’aucuns y verront un échec ; j’y vois… une invitation à persévérer ».', 'Some will see failure; he sees a call to persevere.',
    ]),
  ],
  takeaway: [
    'Force est de constater (on doit reconnaître), d’aucuns (certains), nonobstant (malgré), au demeurant (d’ailleurs), de surcroît (en plus), sans ambages (franchement), à maints égards, à l’aune de.',
    'Force est de constater (one must admit), d’aucuns (some), nonobstant (despite), au demeurant (besides), de surcroît (moreover), sans ambages (frankly), à maints égards, à l’aune de.',
  ],
});
