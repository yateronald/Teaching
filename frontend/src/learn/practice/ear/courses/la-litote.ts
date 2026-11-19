// C2 · Litotes: saying less to mean more (ce n’est pas mal, ce n’est pas rien).
import { ear, ex, fill, pick, situation } from '../authoring';

const RESTO = 'Alors, ce nouveau restaurant ? Disons que ce n’est pas désagréable, et que le chef ne manque pas de talent. Je n’y irais pas tous les jours, mais ce n’est pas rien de trouver ça dans le quartier.';
const RESTO_SHOW = 'Alors, ce nouveau restaurant ? Disons que {ce n’est pas désagréable}, et que le chef {ne manque pas de talent}. Je n’y irais pas tous les jours, mais {ce n’est pas rien} de trouver ça dans le quartier.';

export default ear('la-litote', {
  rule: [
    ['Dire moins pour dire plus', 'Saying less to mean more'],
    [
      'La litote atténue l’expression pour laisser entendre davantage, souvent par une négation : __ce n’est pas mal__ (c’est bien), __il n’est pas bête__ (il est intelligent), __ce n’est pas rien__ (c’est considérable), __je ne suis pas peu fier__ (je suis très fier), __ce ne fut pas une mince affaire__ (ce fut très difficile).\n\nL’exemple le plus célèbre vient du Cid de Corneille : __Va, je ne te hais point__, qui veut dire « je t’aime ». La litote est typique d’une certaine retenue française : il faut entendre le compliment, ou l’émotion, derrière la modestie de la formule.',
      'Litotes understate in order to suggest more, often with a negative: __ce n’est pas mal__ (it is good), __il n’est pas bête__ (he is clever), __ce n’est pas rien__ (it is a big deal), __je ne suis pas peu fier__ (I am very proud), __ce ne fut pas une mince affaire__ (it was very hard).\n\nThe most famous example comes from Corneille’s Le Cid: __Va, je ne te hais point__, meaning « I love you ». Litotes are typical of a certain French reserve: hear the compliment, or the feeling, behind the modest wording.',
    ],
  ],
  goal: ['Comprendre le sens fort caché derrière une litote.', 'Understand the strong meaning behind an understatement.'],
  examples: [
    ex('Ce n’est pas mal du tout.', 'Ce n’est {pas mal} du tout.', ['= C’est très bien.', '= It is very good.']),
    ex('Ce n’est pas rien.', 'Ce n’est {pas rien}.', ['= C’est important, considérable.', '= It is no small thing.']),
    ex('Va, je ne te hais point.', 'Va, je ne te {hais point}.', ['Le Cid : = je t’aime.', 'Le Cid: = I love you.']),
  ],
  items: [
    pick('Ton gâteau ? Il n’est pas mauvais du tout.', ['Il est mauvais', 'Il est plutôt bon'], 1, 'Ton gâteau ? Il n’est {pas mauvais} du tout.', [
      'Pas mauvais du tout = bon, voire très bon.', 'Not bad at all = good, even very good.',
    ], ['Que pense-t-il du gâteau ?', 'What does he think of the cake?']),
    pick('Élever trois enfants seule, ce n’est pas rien.', ['C’est facile', 'C’est très difficile, admirable'], 1, 'Élever trois enfants seule, {ce n’est pas rien}.', [
      'Ce n’est pas rien = c’est beaucoup.', 'It is no small thing.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    pick('Il n’est pas bête, ce garçon.', ['Il est intelligent', 'Il est un peu bête'], 0, 'Il {n’est pas bête}, ce garçon.', [
      'Pas bête = intelligent, astucieux.', 'Not stupid = clever.',
    ], ['Que pense-t-on du garçon ?', 'What is thought of the boy?']),
    pick('Je ne suis pas peu fier de ce résultat.', ['Il n’est pas fier', 'Il est très fier'], 1, 'Je ne suis {pas peu fier} de ce résultat.', [
      'Pas peu fier = très fier.', 'Not a little proud = very proud.',
    ], ['Est-il fier ?', 'Is he proud?']),
    pick('Ce ne fut pas une mince affaire.', ['Ce fut très compliqué', 'Ce fut très simple'], 0, 'Ce ne fut {pas une mince affaire}.', [
      'Pas une mince affaire = une chose difficile.', 'No easy matter.',
    ], ['Comment cela s’est-il passé ?', 'How did it go?']),
    fill('Ce n’est pas mal du tout.', 'Ce n’est pas ___ du tout.', 'mal', 'Ce n’est pas {mal} du tout.', [
      'Pas mal du tout = très bien.', 'Very good.',
    ]),
    fill('Pour une première fois, ce n’est pas rien.', 'Pour une première fois, ce n’est pas ___.', 'rien', 'Pour une première fois, ce n’est pas {rien}.', [
      'Ce n’est pas rien = c’est remarquable.', 'It is quite something.',
    ]),
    fill('Va, je ne te hais point.', 'Va, je ne te hais ___.', 'point', 'Va, je ne te hais {point}.', [
      'Point = pas, en langue classique. La litote dit « je t’aime ».', 'Point = pas, in classical French. The litotes means « I love you ».',
    ]),
    situation(RESTO, 'Que pense-t-il du restaurant ?', ['Il l’a détesté', 'Il l’a trouvé bon, avec retenue', 'Il veut y aller chaque jour'], 1, RESTO_SHOW, [
      '« Pas désagréable », « pas rien » : un avis positif, dit avec retenue.', 'A positive opinion, put with restraint.',
    ]),
    situation(RESTO, 'Que dit-il du chef ?', ['Il manque de talent', 'Il a du talent', 'Il est absent'], 1, RESTO_SHOW, [
      '« Il ne manque pas de talent » = il a du talent.', '« He does not lack talent » = he is talented.',
    ]),
  ],
  takeaway: [
    'Pas mal, pas bête, pas rien, pas peu fier, pas une mince affaire : la négation adoucit la forme, mais renforce le sens. Entendez le compliment derrière la retenue.',
    'Pas mal, pas bête, pas rien, pas peu fier, pas une mince affaire: the negative softens the form but strengthens the meaning. Hear the compliment behind the restraint.',
  ],
});
