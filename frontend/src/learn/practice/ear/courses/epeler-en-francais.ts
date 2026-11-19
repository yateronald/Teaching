// B1 · Spelling in French: letter names (G = gé, J = ji), accents, and e-mail addresses.
// The recordings read the letter names as words (« gé, i, erre »), so the voice says exactly what a person would.
import { ear, ex, fill, pick, situation } from '../authoring';

const NAME: [string, string] = ['Qu’avez-vous noté ?', 'What did you write down?'];
const NADIA = 'Bonjour, je m’appelle Nadia Benali. Benali, ça s’écrit bé, e, enne, a, elle, i. Mon adresse, c’est nadia point benali arobase exemple point fr.';
const NADIA_SHOW = 'Benali : {bé, e, enne, a, elle, i} = B-E-N-A-L-I · nadia {point} benali {arobase} exemple {point} fr = nadia.benali@exemple.fr';

export default ear('epeler-en-francais', {
  rule: [
    ['Épeler en français : lettres, accents et adresses', 'Spelling in French: letters, accents and addresses'],
    [
      'Pour noter un nom ou une adresse, il faut reconnaître **le nom des lettres**. Attention à __G__ [ʒe] et __J__ [ʒi], inversés par rapport à l’anglais, à __E__ [ə] et __I__ [i], à __U__ [y], à __W__ (« double vé ») et __Y__ (« i grec »).\n\nLes accents se disent : __e accent aigu__ (é), __e accent grave__ (è). Dans une adresse e-mail : __arobase__ (@), __point__ (.), __tiret__ (-), __tiret du bas__ (_). Et l’on dit souvent « deux enne » pour NN.',
      'To note a name or an address, you need **the names of the letters**. Watch __G__ [ʒe] and __J__ [ʒi], the reverse of English, __E__ [ə] and __I__ [i], __U__ [y], __W__ (« double vé ») and __Y__ (« i grec »).\n\nAccents are said aloud: __e accent aigu__ (é), __e accent grave__ (è). In an e-mail address: __arobase__ (@), __point__ (.), __tiret__ (-), __tiret du bas__ (_). And people often say « deux enne » for NN.',
    ],
  ],
  goal: ['Noter un nom, une adresse e-mail ou un code épelés au téléphone.', 'Note a name, an e-mail address or a code spelled over the phone.'],
  examples: [
    ex('Ça s’écrit : gé, i, erre, a, erre, dé.', '{gé}, {i}, erre, a, erre, dé = G-I-R-A-R-D', ['« Gé » = G, « i » = I.', '« Gé » = G, « i » = I.']),
    ex('Avec un e accent aigu.', '{e accent aigu} = é', ['L’accent se dit après la lettre.', 'The accent is said after the letter.']),
    ex('Marie point Dubois arobase exemple point fr.', 'marie {point} dubois {arobase} exemple {point} fr = marie.dubois@exemple.fr', ['Point = . ; arobase = @.', 'Point = . ; arobase = @.']),
  ],
  items: [
    pick('Mon nom, c’est Joly : ji, o, elle, i grec.', ['JOLY', 'GOLY', 'JOLI'], 0, '{ji}, o, elle, {i grec} = J-O-L-Y', [
      '« Ji » = J (et « gé » = G). « I grec » = Y, pas I.', '« Ji » = J (and « gé » = G). « I grec » = Y, not I.',
    ], NAME),
    pick('Ça s’écrit : gé, a, u, té, i, e, erre.', ['GAUTIER', 'JAUTIER', 'GOTIER'], 0, '{gé}, a, {u}, té, i, e, erre = G-A-U-T-I-E-R', [
      '« Gé » = G, puis a et u : GAU.', '« Gé » = G, then a and u: GAU.',
    ], NAME),
    pick('Mon adresse, c’est lucas tiret martin arobase exemple point fr.', ['lucas-martin@exemple.fr', 'lucas_martin@exemple.fr', 'lucas.martin@exemple.fr'], 0, 'lucas {tiret} martin arobase exemple point fr', [
      '« Tiret » = - ; « tiret du bas » serait _ et « point » serait .', '« Tiret » = - ; « tiret du bas » would be _ and « point » would be .',
    ], NAME),
    pick('Le code postal, c’est le soixante-neuf, zéro, zéro, trois.', ['69003', '69300', '96003'], 0, '{soixante-neuf}, zéro, zéro, trois = 69003', [
      'Soixante-neuf = 69, puis zéro, zéro, trois : 69003 (Lyon, 3e arrondissement).', 'Soixante-neuf = 69, then zero, zero, three: 69003 (Lyon, 3rd district).',
    ], NAME),
    pick('Ça s’écrit : hache, e accent aigu, elle, e accent grave, enne, e.', ['HÉLÈNE', 'ÉLÈNE', 'HÉLÉNE'], 0, '{hache}, {e accent aigu}, elle, {e accent grave}, enne, e = H-É-L-È-N-E', [
      'Un h au début (« hache »), puis é (aigu) et è (grave) : HÉLÈNE.', 'An h first (« hache »), then é (aigu) and è (grave): HÉLÈNE.',
    ], NAME),
    fill('Ça s’écrit : bé, e, erre, enne, a, erre, dé.', 'B ___ R N A R D', ['e'], 'bé, {e}, erre, enne, a, erre, dé = B-E-R-N-A-R-D', [
      '[ə] : la lettre E. La lettre I se dirait [i].', '[ə]: the letter E. The letter I would be [i].',
    ]),
    fill('Mon adresse : sophie arobase exemple point com.', 'sophie ___ exemple.com', ['@', 'arobase'], 'sophie {arobase} exemple point com', [
      '« Arobase » = @.', '« Arobase » = @.',
    ]),
    fill('Bonnet, avec deux enne : bé, o, enne, enne, e, té.', 'BO___ET', ['nn'], 'bé, o, {enne, enne}, e, té = B-O-N-N-E-T', [
      '« Deux enne » ou « enne, enne » = NN.', '« Deux enne » or « enne, enne » = NN.',
    ]),
    situation(NADIA, 'Comment s’écrit son nom ?', ['BENALI', 'BENALY', 'BENNALI'], 0, NADIA_SHOW, [
      'Bé, e, enne, a, elle, i : un seul N, et I (pas « i grec ») à la fin.', 'Bé, e, enne, a, elle, i: one N, and I (not « i grec ») at the end.',
    ]),
    situation(NADIA, 'Quelle est son adresse e-mail ?', ['nadia.benali@exemple.fr', 'nadia-benali@exemple.fr', 'nadiabenali@exemple.fr'], 0, NADIA_SHOW, [
      '« Point » entre nadia et benali, puis « arobase » : nadia.benali@exemple.fr.', '« Point » between nadia and benali, then « arobase »: nadia.benali@exemple.fr.',
    ]),
  ],
  takeaway: [
    'G = gé, J = ji, E = [ə], I = [i], Y = i grec. É = e accent aigu, È = e accent grave. @ = arobase, . = point, - = tiret.',
    'G = gé, J = ji, E = [ə], I = [i], Y = i grec. É = e accent aigu, È = e accent grave. @ = arobase, . = point, - = tiret.',
  ],
});
