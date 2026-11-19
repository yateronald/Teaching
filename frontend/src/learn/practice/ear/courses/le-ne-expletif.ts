// C2 · The expletive ne: avant qu’il ne parte, je crains qu’il ne pleuve (not a negation).
import { ear, ex, fill, pick, situation } from '../authoring';

const RANDO = 'Je vous préviens : à moins que la météo ne s’améliore, la randonnée sera annulée. Je crains d’ailleurs que le sentier ne soit déjà fermé.';
const RANDO_SHOW = 'Je vous préviens : à moins que la météo {ne} s’améliore, la randonnée sera annulée. Je crains d’ailleurs que le sentier {ne} soit déjà fermé.';

export default ear('le-ne-expletif', {
  rule: [
    ['Un « ne » qui ne nie pas', 'A « ne » that does not negate'],
    [
      'Dans la langue soutenue, un __ne__ seul, sans __pas__, apparaît après certaines expressions : __avant que__, __à moins que__, __craindre que__, __avoir peur que__, __éviter que__, et dans les comparaisons (__plus… que je ne pensais__). Ce __ne__ est dit **explétif** : il n’a **aucune valeur négative**.\n\n__Je crains qu’il ne pleuve__ = j’ai peur qu’il pleuve. Pour une vraie négation, il faut __pas__ : __je crains qu’il ne pleuve pas__ = j’ai peur qu’il ne pleuve pas du tout. Tout se joue donc sur la présence de __pas__.',
      'In formal French, a lone __ne__, without __pas__, appears after certain expressions: __avant que__, __à moins que__, __craindre que__, __avoir peur que__, __éviter que__, and in comparisons (__plus… que je ne pensais__). This __ne__ is called **expletive**: it has **no negative meaning**.\n\n__Je crains qu’il ne pleuve__ = I fear it will rain. For a real negative you need __pas__: __je crains qu’il ne pleuve pas__ = I fear it will not rain. Everything hinges on whether __pas__ is there.',
    ],
  ],
  goal: ['Distinguer le « ne » explétif d’une vraie négation.', 'Tell the expletive « ne » from a real negative.'],
  examples: [
    ex('Partons avant qu’il ne pleuve.', 'Partons avant qu’il {ne} pleuve.', ['= Avant qu’il pleuve.', '= Before it rains.']),
    ex('Je crains qu’il ne soit trop tard.', 'Je crains qu’il {ne} soit trop tard.', ['= J’ai peur qu’il soit trop tard.', '= I fear it is too late.']),
    ex('C’est plus difficile que je ne le pensais.', 'C’est plus difficile que je {ne} le pensais.', ['= Que je le pensais.', '= Than I thought.']),
  ],
  items: [
    pick('Je crains qu’il ne pleuve demain.', ['La pluie', 'L’absence de pluie'], 0, 'Je crains qu’il {ne} pleuve demain.', [
      'Sans « pas », le « ne » est explétif : elle craint la pluie.', 'Without « pas », the « ne » is expletive: she fears rain.',
    ], ['Que craint la personne ?', 'What is the speaker afraid of?']),
    pick('Je crains qu’il ne pleuve pas demain.', ['La pluie', 'L’absence de pluie'], 1, 'Je crains qu’il ne pleuve {pas} demain.', [
      'Avec « pas » : une vraie négation. Elle craint qu’il ne pleuve pas.', 'With « pas »: a real negative. She fears it will not rain.',
    ], ['Que craint la personne ?', 'What is the speaker afraid of?']),
    pick('Finissons avant qu’il ne soit trop tard.', ['Oui', 'Non, pas encore'], 1, 'Finissons avant qu’il {ne} soit trop tard.', [
      'Avant qu’il ne soit trop tard = avant que ce soit trop tard.', 'Before it is too late.',
    ], ['Est-il déjà trop tard ?', 'Is it already too late?']),
    pick('C’est plus cher que je ne le pensais.', ['Plus élevé que prévu', 'Moins élevé que prévu'], 0, 'C’est plus cher que je {ne} le pensais.', [
      'Le « ne » de comparaison n’est pas négatif.', 'The comparative « ne » is not negative.',
    ], ['Le prix est-il…', 'Is the price…']),
    pick('À moins qu’il ne change d’avis, il viendra.', ['Non, sauf s’il change d’avis', 'Oui, sauf s’il change d’avis'], 1, 'À moins qu’il {ne} change d’avis, il viendra.', [
      'À moins que = sauf si. Le « ne » est explétif.', 'À moins que = unless.',
    ], ['Viendra-t-il ?', 'Will he come?']),
    fill('Partons avant qu’il ne pleuve.', 'Partons avant qu’il ___ pleuve.', 'ne', 'Partons avant qu’il {ne} pleuve.', [
      'Le « ne » explétif après « avant que ».', 'Expletive « ne » after « avant que ».',
    ]),
    fill('Elle a peur qu’il ne se perde.', 'Elle a peur qu’il ne se ___.', 'perde', 'Elle a peur qu’il ne se {perde}.', [
      'Elle a peur qu’il se perde : subjonctif, et ne explétif.', 'She fears he will get lost.',
    ]),
    fill('Il est plus tard que je ne croyais.', 'Il est plus tard que je ne ___.', 'croyais', 'Il est plus tard que je ne {croyais}.', [
      'Comparaison : « que je ne croyais » = que je croyais.', 'Comparison: « than I thought ».',
    ]),
    situation(RANDO, 'Que se passera-t-il si la météo ne s’améliore pas ?', ['La randonnée aura lieu', 'La randonnée sera raccourcie', 'La randonnée sera annulée'], 2, RANDO_SHOW, [
      '« À moins que la météo ne s’améliore » = sauf si elle s’améliore.', '« Unless the weather improves ».',
    ]),
    situation(RANDO, 'Que craint la personne ?', ['Que le sentier soit déjà fermé', 'Que le sentier ne soit pas fermé', 'Qu’il fasse trop chaud'], 0, RANDO_SHOW, [
      '« Je crains que le sentier ne soit déjà fermé » : ne explétif, elle craint qu’il soit fermé.', 'She fears it is already closed.',
    ]),
  ],
  takeaway: [
    'Après avant que, à moins que, craindre que, et dans les comparaisons, un « ne » sans « pas » n’est pas une négation. Cherchez « pas » : sans lui, la phrase est affirmative.',
    'After avant que, à moins que, craindre que, and in comparisons, a « ne » without « pas » is not a negative. Look for « pas »: without it, the sentence is affirmative.',
  ],
});
