// A1 · Numbers from 70 to 99, prices, times, years and phone numbers read in pairs.
import { ear, ex, fill, pick, situation } from '../authoring';

const LEA = 'Bonjour, c’est Léa. Le dîner est samedi à vingt heures. J’habite au soixante et onze, avenue des Tilleuls, et le code de la porte, c’est le quatre-vingt-dix-neuf, trente-deux.';
const LEA_SHOW = 'Bonjour, c’est Léa. Le dîner est samedi à vingt heures. J’habite au {soixante et onze}, avenue des Tilleuls, et le code de la porte, c’est le {quatre-vingt-dix-neuf}, {trente-deux}.';

export default ear('les-nombres-qui-piegent', {
  rule: [
    ['Soixante-dix, quatre-vingts : compter à la française', 'Soixante-dix, quatre-vingts: counting the French way'],
    [
      'Après 60, le français compte par vingt : 70 = __soixante-dix__ (60 + 10), 80 = __quatre-vingts__ (4 × 20), 90 = __quatre-vingt-dix__ (4 × 20 + 10). Il faut donc écouter **jusqu’au bout** : __soixante-douze__, c’est 72, pas 60 puis 12.\n\nLes numéros de téléphone se disent **par paires** : 06 75… = __zéro six, soixante-quinze__… En Belgique et en Suisse, on dit aussi septante (70) et nonante (90).',
      'After 60, French counts in twenties: 70 = __soixante-dix__ (60 + 10), 80 = __quatre-vingts__ (4 × 20), 90 = __quatre-vingt-dix__ (4 × 20 + 10). So listen **to the very end**: __soixante-douze__ is 72, not 60 then 12.\n\nPhone numbers are read **in pairs**: 06 75… = __zéro six, soixante-quinze__… In Belgium and Switzerland people also say septante (70) and nonante (90).',
    ],
  ],
  goal: ['Comprendre les nombres de 70 à 99 dans un prix, une heure, une année.', 'Understand numbers from 70 to 99 in a price, a time, a year.'],
  examples: [
    ex('Soixante-quinze.', '{soixante}-{quinze} = 60 + 15 = 75', ['De 70 à 79 : soixante + 10 à 19.', 'From 70 to 79: soixante + 10 to 19.']),
    ex('Quatre-vingt-trois.', '{quatre-vingt}-{trois} = 4 × 20 + 3 = 83', ['De 80 à 89 : quatre-vingt + 1 à 9.', 'From 80 to 89: quatre-vingt + 1 to 9.']),
    ex('Quatre-vingt-dix-sept.', '{quatre-vingt}-{dix-sept} = 4 × 20 + 17 = 97', ['De 90 à 99 : quatre-vingt + 10 à 19.', 'From 90 to 99: quatre-vingt + 10 to 19.']),
  ],
  items: [
    pick('Ça fait soixante-seize euros.', ['66 €', '76 €', '86 €'], 1, 'Ça fait {soixante-seize} euros.', [
      'Soixante-seize = 60 + 16 = 76. Le « soixante » du début ne veut pas dire 60 tout seul : attendez la suite.',
      'Soixante-seize = 60 + 16 = 76. The « soixante » at the start does not mean 60 on its own: wait for the rest.',
    ], ['Quel prix avez-vous entendu ?', 'Which price did you hear?']),
    pick('J’habite au quatre-vingt-quatre, rue Victor-Hugo.', ['24', '84', '94'], 1, 'J’habite au {quatre-vingt-quatre}, rue Victor-Hugo.', [
      'Quatre-vingt-quatre = 4 × 20 + 4 = 84. Sans « dix », on reste dans les 80.',
      'Quatre-vingt-quatre = 4 × 20 + 4 = 84. Without « dix », you stay in the 80s.',
    ], ['Quel numéro de rue ?', 'Which street number?']),
    pick('Le train part à seize heures cinquante-sept.', ['16 h 47', '16 h 57', '6 h 57'], 1, 'Le train part à {seize heures cinquante-sept}.', [
      'Seize heures = 16 h, cinquante-sept = 57. Les gares donnent l’heure sur 24 heures.',
      'Seize heures = 4 p.m., cinquante-sept = 57. Stations use the 24-hour clock.',
    ], ['Quelle heure avez-vous entendue ?', 'Which time did you hear?']),
    pick('Elle est née en mille neuf cent quatre-vingt-dix-huit.', ['1988', '1998', '1978'], 1, 'Elle est née en mille neuf cent {quatre-vingt-dix-huit}.', [
      'Quatre-vingt-dix-huit = 4 × 20 + 18 = 98, donc 1998. Pour 1988, on dirait quatre-vingt-huit.',
      'Quatre-vingt-dix-huit = 4 × 20 + 18 = 98, so 1998. 1988 would be quatre-vingt-huit.',
    ], ['Quelle année avez-vous entendue ?', 'Which year did you hear?']),
    pick('Il y a soixante-dix-sept élèves dans l’école.', ['67', '77', '97'], 1, 'Il y a {soixante-dix-sept} élèves dans l’école.', [
      'Soixante-dix-sept = 60 + 17 = 77. Pour 97, le nombre commencerait par « quatre-vingt ».',
      'Soixante-dix-sept = 60 + 17 = 77. 97 would start with « quatre-vingt ».',
    ], ['Combien d’élèves ?', 'How many pupils?']),
    fill('Mon numéro, c’est le zéro six, quarante-deux, soixante-quinze, dix-huit, quatre-vingt-onze.', '06 42 ___ 18 91', ['75', 'soixante-quinze'],
      'zéro six, quarante-deux, {soixante-quinze}, dix-huit, quatre-vingt-onze', [
        'Les numéros se lisent par paires : soixante-quinze = 75. Écrivez-le en chiffres.',
        'Numbers are read in pairs: soixante-quinze = 75. Write it in figures.',
      ]),
    fill('Ça vous fait quatre-vingt-douze euros, s’il vous plaît.', '___ €', ['92', 'quatre-vingt-douze'], 'Ça vous fait {quatre-vingt-douze} euros, s’il vous plaît.', [
      'Quatre-vingt-douze = 4 × 20 + 12 = 92.',
      'Quatre-vingt-douze = 4 × 20 + 12 = 92.',
    ]),
    fill('Rendez-vous au bureau soixante-trois, au troisième étage.', 'Bureau ___', ['63', 'soixante-trois'], 'Rendez-vous au bureau {soixante-trois}, au troisième étage.', [
      'Soixante-trois = 63 : pas de piège ici, on reste dans les 60.',
      'Soixante-trois = 63: no trap here, you stay in the 60s.',
    ]),
    situation(LEA, 'Quel est le code de la porte ?', ['99 32', '71 32', '89 32'], 0, LEA_SHOW, [
      'Quatre-vingt-dix-neuf = 4 × 20 + 19 = 99, puis trente-deux : 99 32. Le 71, c’est le numéro de l’avenue.',
      'Quatre-vingt-dix-neuf = 4 × 20 + 19 = 99, then trente-deux: 99 32. 71 is the house number.',
    ]),
    situation(LEA, 'À quel numéro habite Léa ?', ['61', '71', '81'], 1, LEA_SHOW, [
      'Soixante et onze = 60 + 11 = 71. Comme vingt et un, trente et un : on dit « soixante et onze ».',
      'Soixante et onze = 60 + 11 = 71. Like vingt et un, trente et un: « soixante et onze ».',
    ]),
  ],
  takeaway: [
    'Après 60, écoutez le nombre jusqu’au bout : soixante-dix = 70, quatre-vingts = 80, quatre-vingt-dix = 90. Les numéros de téléphone se disent par paires.',
    'After 60, listen to the number to the end: soixante-dix = 70, quatre-vingts = 80, quatre-vingt-dix = 90. Phone numbers are read in pairs.',
  ],
});
