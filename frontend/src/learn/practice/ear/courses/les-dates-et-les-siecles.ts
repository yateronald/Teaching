// C1 · Dates and centuries by ear: le dix-septième siècle = the 1600s, les années quatre-vingt.
import { ear, ex, fill, pick, situation } from '../authoring';

const MAISON = 'Cette maison date du dix-huitième siècle. Elle a été agrandie dans les années trente, puis entièrement rénovée au début des années deux mille.';
const MAISON_SHOW = 'Cette maison date du {dix-huitième siècle}. Elle a été agrandie dans {les années trente}, puis entièrement rénovée au début des {années deux mille}.';

export default ear('les-dates-et-les-siecles', {
  rule: [
    ['Siècles, décennies, années', 'Centuries, decades, years'],
    [
      'Le piège classique : __le dix-septième siècle__ (XVIIᵉ), ce sont **les années 1600**, de 1601 à 1700. Le numéro du siècle a toujours **un de plus** que les deux premiers chiffres de l’année.\n\n__Les années quatre-vingt__ = de 1980 à 1989 (pas 1908). Les années se disent en entier : __mille neuf cent quatre-vingt-neuf__ (on écrit aussi « mil » dans les dates). On entend aussi __l’an deux mille__, __au tournant du siècle__ (le passage d’un siècle à l’autre), __à la fin du dix-neuvième__ (vers 1890).',
      'The classic trap: __le dix-septième siècle__ (17th century) means **the 1600s**, 1601 to 1700. The century number is always **one more** than the first two digits of the year.\n\n__Les années quatre-vingt__ = 1980 to 1989 (not 1908). Years are said in full: __mille neuf cent quatre-vingt-neuf__ (« mil » is also written in dates). You also hear __l’an deux mille__, __au tournant du siècle__ (the turn of the century), __à la fin du dix-neuvième__ (around 1890).',
    ],
  ],
  goal: ['Situer un événement dans le temps à partir d’un siècle, d’une décennie ou d’une année.', 'Place an event in time from a century, a decade or a year.'],
  examples: [
    ex('Au dix-septième siècle.', 'Au {dix-septième siècle}.', ['= Les années 1600.', '= The 1600s.']),
    ex('Dans les années soixante.', 'Dans {les années soixante}.', ['= De 1960 à 1969.', '= The 1960s.']),
    ex('En mille sept cent quatre-vingt-neuf.', 'En {mille sept cent quatre-vingt-neuf}.', ['= 1789.', '= 1789.']),
  ],
  items: [
    pick('Le château a été construit au seizième siècle.', ['Les années 1600', 'Les années 1500', 'Les années 1400'], 1, 'Le château a été construit au {seizième siècle}.', [
      'XVIᵉ siècle = les années 1500.', '16th century = the 1500s.',
    ], ['À quelle période ?', 'In which period?']),
    pick('C’était dans les années quatre-vingt.', ['En 1908', 'Entre 1880 et 1889', 'Entre 1980 et 1989'], 2, 'C’était dans {les années quatre-vingt}.', [
      'Sans précision, les années quatre-vingt = les années 1980.', 'Unspecified, the eighties = the 1980s.',
    ], ['Quand ?', 'When?']),
    pick('La Révolution commence en mille sept cent quatre-vingt-neuf.', ['1789', '1689', '1798'], 0, 'La Révolution commence en {mille sept cent quatre-vingt-neuf}.', [
      'Mille sept cent + quatre-vingt-neuf = 1789.', '1700 + 89 = 1789.',
    ], ['En quelle année ?', 'In which year?']),
    pick('À la fin du dix-neuvième siècle.', ['Vers 1990', 'Vers 1890', 'Vers 1800'], 1, 'À la fin du {dix-neuvième siècle}.', [
      'XIXᵉ siècle = les années 1800 ; la fin = vers 1890.', '19th century = the 1800s; its end = around 1890.',
    ], ['Vers quelle année ?', 'Around which year?']),
    pick('Au tournant du siècle, tout a changé.', ['Au milieu du siècle', 'Au passage d’un siècle à l’autre'], 1, 'Au {tournant du siècle}, tout a changé.', [
      'Le tournant du siècle = le moment où l’on change de siècle.', 'The turn of the century.',
    ], ['Quand ?', 'When?']),
    fill('Il est né en deux mille trois.', 'Il est né en deux mille ___.', ['trois', '3'], 'Il est né en deux mille {trois}.', [
      'Deux mille trois = 2003.', '2003.',
    ]),
    fill('C’était dans les années soixante-dix.', 'C’était dans les années ___.', ['soixante-dix', 'soixante dix', '70'], 'C’était dans les années {soixante-dix}.', [
      'Les années soixante-dix = 1970-1979.', 'The 1970s.',
    ]),
    fill('Au vingtième siècle, la ville a doublé.', 'Au ___ siècle, la ville a doublé.', ['vingtième', 'XXe', '20e'], 'Au {vingtième} siècle, la ville a doublé.', [
      'XXᵉ siècle = les années 1900.', '20th century = the 1900s.',
    ]),
    situation(MAISON, 'De quand date la maison ?', ['Des années 1800', 'Des années 1700', 'De 1918'], 1, MAISON_SHOW, [
      'Dix-huitième siècle = les années 1700.', '18th century = the 1700s.',
    ]),
    situation(MAISON, 'Quand a-t-elle été agrandie ?', ['En 1830', 'Dans les années 2000', 'Dans les années 1930'], 2, MAISON_SHOW, [
      '« Dans les années trente » = 1930-1939.', '« In the thirties » = the 1930s.',
    ]),
  ],
  takeaway: [
    'Siècle = premiers chiffres + 1 : le XVIIᵉ siècle, ce sont les années 1600. Les années quatre-vingt = 1980-1989. Les années se disent en entier : mille sept cent quatre-vingt-neuf.',
    'Century = first digits + 1: the 17th century is the 1600s. Les années quatre-vingt = 1980-1989. Years are said in full: mille sept cent quatre-vingt-neuf.',
  ],
});
