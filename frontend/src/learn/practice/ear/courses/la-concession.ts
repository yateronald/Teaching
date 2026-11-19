// C1 · Concession: certes… mais, pourtant, n’empêche que, avoir beau, quand bien même.
import { ear, ex, fill, pick, situation } from '../authoring';

const QUARTIER = 'Le nouveau quartier est certes un peu éloigné du centre. N’empêche que les loyers sont raisonnables, et qu’on a beau chercher, on ne trouvera pas mieux pour ce prix.';
const QUARTIER_SHOW = 'Le nouveau quartier est {certes} un peu éloigné du centre. {N’empêche que} les loyers sont raisonnables, et qu’on {a beau} chercher, on ne trouvera pas mieux pour ce prix.';

export default ear('la-concession', {
  rule: [
    ['Les virages d’un argument', 'The turns of an argument'],
    [
      'La concession reconnaît un point pour mieux défendre l’autre. L’idée importante vient **après** le mot de concession :\n\n__certes… mais__ (je l’admets… mais), __pourtant__, __toutefois__, __cependant__ ; à l’oral, __n’empêche que__ (malgré cela) ; __encore que__ (+ subjonctif : avec une réserve) ; __quand bien même__ (+ conditionnel : même si) ; __avoir beau__ (+ infinitif : même en faisant tous ses efforts) : __il a beau travailler, il échoue__.',
      'Concession grants one point to better defend the other. The important idea comes **after** the concession word:\n\n__certes… mais__ (admittedly… but), __pourtant__, __toutefois__, __cependant__; in speech, __n’empêche que__ (even so); __encore que__ (+ subjunctive: with a reservation); __quand bien même__ (+ conditional: even if); __avoir beau__ (+ infinitive: however hard you try): __il a beau travailler, il échoue__.',
    ],
  ],
  goal: ['Suivre une concession et retrouver l’idée qui l’emporte.', 'Follow a concession and find the idea that wins.'],
  examples: [
    ex('Certes, il est cher, mais il est solide.', '{Certes}, il est cher, {mais} il est solide.', ['L’argument fort vient après « mais ».', 'The strong point follows « mais ».']),
    ex('Il pleuvait. N’empêche qu’on s’est bien amusés.', 'Il pleuvait. {N’empêche qu’}on s’est bien amusés.', ['= Malgré cela.', '= Even so.']),
    ex('Il a beau essayer, il n’y arrive pas.', 'Il {a beau} essayer, il n’y arrive pas.', ['= Même s’il essaie beaucoup.', '= However hard he tries.']),
  ],
  items: [
    pick('Certes, l’hôtel était loin, mais la vue était magnifique.', ['Plutôt négatif', 'Plutôt positif'], 1, '{Certes}, l’hôtel était loin, {mais} la vue était magnifique.', [
      'Ce qui suit « mais » l’emporte : la vue.', 'What follows « mais » wins: the view.',
    ], ['Quel est l’avis général ?', 'What is the overall opinion?']),
    pick('Il a beau travailler, il n’a pas de bons résultats.', ['Oui, beaucoup, mais sans succès', 'Non, il est paresseux'], 0, 'Il {a beau} travailler, il n’a pas de bons résultats.', [
      'Avoir beau : malgré ses efforts.', 'Avoir beau: despite his efforts.',
    ], ['Travaille-t-il ?', 'Does he work?']),
    pick('C’est cher. N’empêche que c’est le meilleur.', ['C’est le meilleur parce que c’est cher', 'Malgré le prix, c’est le meilleur'], 1, 'C’est cher. {N’empêche que} c’est le meilleur.', [
      'N’empêche que = malgré cela.', 'N’empêche que = even so.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    pick('Quand bien même il s’excuserait, je ne lui pardonnerais pas.', ['Elle pardonnera s’il s’excuse', 'Même s’il s’excusait, elle ne pardonnerait pas'], 1, '{Quand bien même} il s’excuserait, je ne lui pardonnerais pas.', [
      'Quand bien même = même si, avec le conditionnel.', 'Quand bien même = even if.',
    ], ['Que dit-elle ?', 'What is she saying?']),
    pick('Le projet est intéressant, encore qu’un peu cher.', ['Le prix', 'L’intérêt', 'La durée'], 0, 'Le projet est intéressant, {encore qu’}un peu cher.', [
      'Encore que : une réserve, ici le prix.', 'Encore que: a reservation, here the price.',
    ], ['Quelle réserve fait la personne ?', 'What reservation does the speaker make?']),
    fill('Il est fatigué. Pourtant, il continue.', 'Il est fatigué. ___, il continue.', ['Pourtant', 'pourtant'], 'Il est fatigué. {Pourtant}, il continue.', [
      'Pourtant : un contraste inattendu.', 'Pourtant: an unexpected contrast.',
    ]),
    fill('J’ai beau chercher, je ne trouve pas.', 'J’ai ___ chercher, je ne trouve pas.', 'beau', 'J’ai {beau} chercher, je ne trouve pas.', [
      'Avoir beau + infinitif.', 'Avoir beau + infinitive.',
    ]),
    fill('Certes, c’est difficile, mais c’est possible.', '___, c’est difficile, mais c’est possible.', ['Certes', 'certes'], '{Certes}, c’est difficile, mais c’est possible.', [
      'Certes = je l’admets.', 'Certes = admittedly.',
    ]),
    situation(QUARTIER, 'Quel inconvénient est reconnu ?', ['Les loyers sont chers', 'Le quartier est loin du centre', 'Le quartier est bruyant'], 1, QUARTIER_SHOW, [
      '« Certes un peu éloigné du centre » : la concession.', '« Admittedly a bit far from the centre »: the concession.',
    ]),
    situation(QUARTIER, 'Quelle est la conclusion ?', ['C’est la meilleure option pour ce prix', 'Il faut chercher ailleurs', 'Il faut attendre'], 0, QUARTIER_SHOW, [
      'Après « n’empêche que » et « avoir beau » : on ne trouvera pas mieux.', 'After « n’empêche que » and « avoir beau »: nothing better will be found.',
    ]),
  ],
  takeaway: [
    'Certes… mais, pourtant, n’empêche que, avoir beau, quand bien même : la concession reconnaît un point, puis l’idée qui suit l’emporte. Écoutez ce qui vient après.',
    'Certes… mais, pourtant, n’empêche que, avoir beau, quand bien même: concession grants a point, then the idea that follows wins. Listen to what comes next.',
  ],
});
