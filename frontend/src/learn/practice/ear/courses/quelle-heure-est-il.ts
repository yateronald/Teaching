// A1 · Telling the time: et quart, et demie, moins le quart, midi, minuit, and the 24-hour clock.
import { ear, ex, fill, pick, situation } from '../authoring';

const TIME: [string, string] = ['Quelle heure avez-vous entendue ?', 'Which time did you hear?'];
const MEDIA = 'La médiathèque est ouverte le mardi de dix heures à dix-huit heures. Le mercredi, elle ouvre à neuf heures et demie et ferme à midi et quart.';
const MEDIA_SHOW = 'La médiathèque est ouverte le mardi de {dix heures} à {dix-huit heures}. Le mercredi, elle ouvre à {neuf heures et demie} et ferme à {midi et quart}.';

export default ear('quelle-heure-est-il', {
  rule: [
    ['Dire l’heure : et quart, et demie, moins le quart', 'Telling the time: et quart, et demie, moins le quart'],
    [
      'Dans la vie courante, on dit souvent l’heure sur 12 heures, avec des mots : __huit heures et quart__ (8 h 15), __huit heures et demie__ (8 h 30), __neuf heures moins le quart__ (8 h 45), __midi__ (12 h), __minuit__ (0 h).\n\nDans les gares, les aéroports et à la radio, on utilise 24 heures : __vingt heures quarante-cinq__ (20 h 45). Attention : **moins** enlève des minutes à l’heure suivante : __onze heures moins dix__ = 10 h 50.',
      'In everyday life, people often tell the time on a 12-hour clock, with words: __huit heures et quart__ (8:15), __huit heures et demie__ (8:30), __neuf heures moins le quart__ (8:45), __midi__ (noon), __minuit__ (midnight).\n\nStations, airports and the radio use the 24-hour clock: __vingt heures quarante-cinq__ (20:45). Careful: **moins** takes minutes away from the next hour: __onze heures moins dix__ = 10:50.',
    ],
  ],
  goal: ['Comprendre une heure dite avec des mots ou sur 24 heures.', 'Understand a time said in words or on the 24-hour clock.'],
  examples: [
    ex('Il est huit heures et quart.', 'huit heures {et quart} = 8 h 15', ['Et quart : quinze minutes après.', 'Et quart: fifteen minutes past.']),
    ex('Il est neuf heures moins le quart.', 'neuf heures {moins le quart} = 8 h 45', ['Moins le quart : quinze minutes avant neuf heures.', 'Moins le quart: fifteen minutes to nine.']),
    ex('Il est midi et demi.', '{midi} {et demi} = 12 h 30', ['Midi = 12 h. Après midi et minuit, on écrit « demi », sans e.', 'Midi = noon. After midi and minuit, « demi » has no e.']),
  ],
  items: [
    pick('Il est sept heures et demie.', ['7 h 15', '7 h 30', '6 h 30'], 1, 'Il est sept heures {et demie}.', [
      'Et demie = trente minutes : 7 h 30.', 'Et demie = thirty minutes: 7:30.',
    ], TIME),
    pick('Le film commence à neuf heures moins le quart.', ['8 h 45', '9 h 15', '9 h 45'], 0, 'Le film commence à neuf heures {moins le quart}.', [
      'Neuf heures moins quinze minutes : 8 h 45.', 'Nine o’clock minus fifteen minutes: 8:45.',
    ], TIME),
    pick('On se retrouve à minuit.', ['12 h', '0 h', '10 h'], 1, 'On se retrouve à {minuit}.', [
      'Minuit = 0 h, au milieu de la nuit. Midi, c’est 12 h.', 'Minuit = midnight. Midi is noon.',
    ], TIME),
    pick('Le magasin ferme à dix-neuf heures trente.', ['17 h 30', '19 h 30', '9 h 30'], 1, 'Le magasin ferme à {dix-neuf heures trente}.', [
      'Dix-neuf heures = 19 h, sur 24 heures : 7 heures et demie du soir.', 'Dix-neuf heures = 19:00 on the 24-hour clock: half past seven in the evening.',
    ], TIME),
    pick('Il est onze heures moins dix.', ['11 h 10', '10 h 50', '11 h 50'], 1, 'Il est onze heures {moins dix}.', [
      'Onze heures moins dix minutes : 10 h 50.', 'Eleven o’clock minus ten minutes: 10:50.',
    ], TIME),
    fill('Mon cours commence à dix heures et quart.', 'Mon cours commence à 10 h ___.', ['15', 'quinze'], 'Mon cours commence à dix heures {et quart}.', [
      'Et quart = et quinze minutes : 10 h 15.', 'Et quart = and fifteen minutes: 10:15.',
    ]),
    fill('Le train arrive à vingt-deux heures cinq.', 'Le train arrive à ___ h 05.', ['22', 'vingt-deux'], 'Le train arrive à {vingt-deux heures} cinq.', [
      'Vingt-deux heures = 22 h : 10 heures du soir.', 'Vingt-deux heures = 22:00: ten in the evening.',
    ]),
    fill('Le rendez-vous est à quatre heures moins vingt.', 'Le rendez-vous est à 3 h ___.', ['40', 'quarante'], 'Le rendez-vous est à quatre heures {moins vingt}.', [
      'Quatre heures moins vingt minutes = 3 h 40.', 'Four o’clock minus twenty minutes = 3:40.',
    ]),
    situation(MEDIA, 'Le mercredi, à quelle heure ferme la médiathèque ?', ['À 12 h 15', 'À 12 h 30', 'À 18 h'], 0, MEDIA_SHOW, [
      '« Midi et quart » = 12 h 15. Dix-huit heures, c’est le mardi.', '« Midi et quart » = 12:15. Six p.m. is on Tuesday.',
    ]),
    situation(MEDIA, 'Le mercredi, à quelle heure ouvre-t-elle ?', ['À 9 h', 'À 9 h 30', 'À 10 h'], 1, MEDIA_SHOW, [
      '« Neuf heures et demie » = 9 h 30. Dix heures, c’est l’ouverture du mardi.', '« Neuf heures et demie » = 9:30. Ten o’clock is Tuesday’s opening.',
    ]),
  ],
  takeaway: [
    'Et quart = 15, et demie = 30, moins le quart = 15 minutes avant l’heure suivante. Midi = 12 h, minuit = 0 h. Dans les gares, l’heure se dit sur 24 heures.',
    'Et quart = :15, et demie = :30, moins le quart = 15 minutes before the next hour. Midi = noon, minuit = midnight. Stations use the 24-hour clock.',
  ],
});
