// C2 · Proverbs, often only half said or twisted.
import { ear, ex, fill, pick, situation } from '../authoring';

const ENTRETIEN = 'Tu crois qu’il va accepter ? Écoute, qui vivra verra. Mais il n’y a pas de fumée sans feu : s’il a demandé à te revoir, c’est qu’il est intéressé.';
const ENTRETIEN_SHOW = 'Tu crois qu’il va accepter ? Écoute, {qui vivra verra}. Mais {il n’y a pas de fumée sans feu} : s’il a demandé à te revoir, c’est qu’il est intéressé.';

export default ear('les-proverbes', {
  rule: [
    ['Les proverbes', 'Proverbs'],
    [
      'Les proverbes résument une sagesse en une phrase. Dans la conversation, on les cite souvent **à moitié**, car tout le monde connaît la suite : __il ne faut pas vendre la peau de l’ours…__ (avant de l’avoir tué : ne pas se réjouir trop tôt). On les **détourne** aussi pour faire sourire.\n\nQuelques classiques : __qui vivra verra__ (on verra avec le temps), __l’habit ne fait pas le moine__ (l’apparence trompe), __qui ne risque rien n’a rien__, __chat échaudé craint l’eau froide__ (après une mauvaise expérience, on se méfie), __il n’y a pas de fumée sans feu__ (une rumeur a souvent une raison), __mieux vaut tard que jamais__.',
      'Proverbs sum up wisdom in one sentence. In conversation they are often quoted **halfway**, since everyone knows the end: __il ne faut pas vendre la peau de l’ours…__ (before killing it: don’t count your chickens). They are also **twisted** for humour.\n\nSome classics: __qui vivra verra__ (time will tell), __l’habit ne fait pas le moine__ (appearances deceive), __qui ne risque rien n’a rien__ (nothing ventured, nothing gained), __chat échaudé craint l’eau froide__ (once bitten, twice shy), __il n’y a pas de fumée sans feu__ (no smoke without fire), __mieux vaut tard que jamais__.',
    ],
  ],
  goal: ['Comprendre un proverbe, même cité à moitié.', 'Understand a proverb, even when half quoted.'],
  examples: [
    ex('Qui vivra verra.', '{Qui vivra verra}.', ['= On verra bien avec le temps.', '= Time will tell.']),
    ex('L’habit ne fait pas le moine.', '{L’habit ne fait pas le moine}.', ['= Il ne faut pas juger sur l’apparence.', '= Don’t judge by appearances.']),
    ex('Il ne faut pas vendre la peau de l’ours avant de l’avoir tué.', 'Il ne faut pas {vendre la peau de l’ours} avant de l’avoir tué.', ['= Ne pas se réjouir trop tôt.', '= Don’t count your chickens.']),
  ],
  items: [
    pick('Qui ne risque rien n’a rien.', ['Il vaut mieux ne rien risquer', 'Il faut oser pour obtenir quelque chose'], 1, '{Qui ne risque rien n’a rien}.', [
      'Sans prendre de risque, on n’obtient rien.', 'Nothing ventured, nothing gained.',
    ], ['Que veut dire ce proverbe ?', 'What does this proverb mean?']),
    pick('L’habit ne fait pas le moine.', ['Il ne faut pas juger sur l’apparence', 'Il faut bien s’habiller'], 0, '{L’habit ne fait pas le moine}.', [
      'L’apparence ne dit pas qui l’on est.', 'Appearances can deceive.',
    ], ['Que veut dire ce proverbe ?', 'What does this proverb mean?']),
    pick('Chat échaudé craint l’eau froide.', ['Les chats n’aiment pas l’eau', 'Après une mauvaise expérience, on se méfie de tout'], 1, '{Chat échaudé craint l’eau froide}.', [
      'Échaudé = brûlé par l’eau chaude : on se méfie ensuite même de l’eau froide.', 'Once bitten, twice shy.',
    ], ['Que veut dire ce proverbe ?', 'What does this proverb mean?']),
    pick('Bon, on a gagné le premier match, mais ne vendons pas la peau de l’ours.', ['Il faut vendre des billets', 'Il ne faut pas se croire déjà vainqueur'], 1, 'Bon, on a gagné le premier match, mais ne vendons pas {la peau de l’ours}.', [
      'Le proverbe est cité à moitié : ne pas se réjouir avant la victoire finale.', 'Half quoted: don’t celebrate before final victory.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    pick('Mieux vaut tard que jamais.', ['Il vaut mieux le faire en retard que pas du tout', 'Il faut toujours être en avance'], 0, '{Mieux vaut tard que jamais}.', [
      'Better late than never.', 'Better late than never.',
    ], ['Que veut dire ce proverbe ?', 'What does this proverb mean?']),
    fill('Petit à petit, l’oiseau fait son nid.', 'Petit à petit, l’oiseau fait son ___.', 'nid', 'Petit à petit, l’oiseau fait son {nid}.', [
      'Avec de la patience, on arrive à ses fins.', 'Slowly but surely.',
    ]),
    fill('Après la pluie, le beau temps.', 'Après la pluie, le beau ___.', 'temps', 'Après la pluie, le beau {temps}.', [
      'Les difficultés finissent par passer.', 'Every cloud has a silver lining.',
    ]),
    fill('Il n’y a pas de fumée sans feu.', 'Il n’y a pas de fumée sans ___.', 'feu', 'Il n’y a pas de fumée sans {feu}.', [
      'Une rumeur repose souvent sur quelque chose de vrai.', 'No smoke without fire.',
    ]),
    situation(ENTRETIEN, 'Que veut dire « qui vivra verra » ?', ['Il faut vivre longtemps', 'On verra bien avec le temps', 'C’est déjà décidé'], 1, ENTRETIEN_SHOW, [
      'On ne peut pas savoir maintenant : l’avenir le dira.', 'Time will tell.',
    ]),
    situation(ENTRETIEN, 'Pourquoi pense-t-il que l’autre est intéressé ?', ['Parce qu’il a signé', 'Parce qu’il a refusé', 'Parce qu’il a demandé à le revoir'], 2, ENTRETIEN_SHOW, [
      '« Il n’y a pas de fumée sans feu » : sa demande est un signe.', 'His request is a sign.',
    ]),
  ],
  takeaway: [
    'Un proverbe cité à moitié reste compris de tous : complétez-le mentalement. Qui vivra verra ; l’habit ne fait pas le moine ; il n’y a pas de fumée sans feu ; chat échaudé craint l’eau froide.',
    'A half-quoted proverb is still understood by all: complete it in your head. Qui vivra verra; l’habit ne fait pas le moine; il n’y a pas de fumée sans feu; chat échaudé craint l’eau froide.',
  ],
});
