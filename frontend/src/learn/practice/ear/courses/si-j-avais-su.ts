// C1 · Hypotheses with si: possible, imaginary, or too late.
import { ear, ex, fill, pick, situation } from '../authoring';

const CHOIX = 'Si j’avais écouté mon père, j’aurais fait médecine. Mais je ne regrette rien : si c’était à refaire, je choisirais encore la musique.';
const CHOIX_SHOW = 'Si j’{avais écouté} mon père, j’{aurais fait} médecine. Mais je ne regrette rien : si c’{était} à refaire, je {choisirais} encore la musique.';

export default ear('si-j-avais-su', {
  rule: [
    ['Si : possible, imaginaire ou trop tard ?', 'Si: possible, imaginary or too late?'],
    [
      'Trois hypothèses avec __si__ :\n\n**si + présent → futur** : c’est possible. __Si tu viens, on ira au parc.__\n**si + imparfait → conditionnel** : c’est imaginaire ou peu probable. __Si j’avais le temps, je voyagerais__ (je n’ai pas le temps).\n**si + plus-que-parfait → conditionnel passé** : c’est trop tard, souvent un regret. __Si j’avais su, je serais venu__ (je ne savais pas, je ne suis pas venu).\n\nLe temps qui suit __si__ vous dit si la chose peut encore arriver.',
      'Three hypotheses with __si__:\n\n**si + present → future**: possible. __Si tu viens, on ira au parc.__\n**si + imperfect → conditional**: imaginary or unlikely. __Si j’avais le temps, je voyagerais__ (I don’t have time).\n**si + pluperfect → past conditional**: too late, often a regret. __Si j’avais su, je serais venu__ (I didn’t know, I didn’t come).\n\nThe tense after __si__ tells you whether the thing can still happen.',
    ],
  ],
  goal: ['Comprendre si une hypothèse est possible, imaginaire ou passée.', 'Understand whether a hypothesis is possible, imaginary or past.'],
  examples: [
    ex('Si tu veux, on ira au cinéma.', 'Si tu {veux}, on {ira} au cinéma.', ['Possible.', 'Possible.']),
    ex('Si j’avais le temps, je voyagerais.', 'Si j’{avais} le temps, je {voyagerais}.', ['Imaginaire : je n’ai pas le temps.', 'Imaginary: I don’t have time.']),
    ex('Si j’avais su, je serais venu.', 'Si j’{avais su}, je {serais venu}.', ['Trop tard : je ne savais pas.', 'Too late: I didn’t know.']),
  ],
  items: [
    pick('Si j’avais su, je serais venu.', ['Oui', 'Non'], 1, 'Si j’{avais su}, je {serais venu}.', [
      'Conditionnel passé : il n’est pas venu, parce qu’il ne savait pas.', 'Past conditional: he did not come, because he did not know.',
    ], ['La personne est-elle venue ?', 'Did the person come?']),
    pick('Si tu finis tôt, on ira au marché.', ['Oui, c’est possible', 'Non, c’est trop tard'], 0, 'Si tu {finis} tôt, on {ira} au marché.', [
      'Présent + futur : c’est encore possible.', 'Present + future: still possible.',
    ], ['Est-ce encore possible ?', 'Is it still possible?']),
    pick('Si j’étais riche, j’achèterais une maison.', ['Oui', 'Non, c’est une situation imaginaire'], 1, 'Si j’{étais} riche, j’{achèterais} une maison.', [
      'Imparfait + conditionnel : il n’est pas riche.', 'Imperfect + conditional: he is not rich.',
    ], ['La personne est-elle riche ?', 'Is the person rich?']),
    pick('S’il avait plu, on serait restés.', ['S’il pleut, on restera.', 'S’il avait plu, on serait restés.'], 1, 'S’il {avait plu}, on {serait restés}.', [
      'Plus-que-parfait : il n’a pas plu, ils sont partis.', 'Pluperfect: it did not rain, they left.',
    ]),
    pick('Si vous aviez réservé, vous auriez eu une table.', ['Non', 'Oui'], 0, 'Si vous {aviez réservé}, vous {auriez eu} une table.', [
      'Ils n’ont pas réservé, et n’ont pas eu de table.', 'They did not book, and got no table.',
    ], ['Ont-ils réservé ?', 'Did they book?']),
    fill('Si j’avais le temps, je lirais plus.', 'Si j’avais le temps, je ___ plus.', 'lirais', 'Si j’avais le temps, je {lirais} plus.', [
      'Imparfait → conditionnel : lirais.', 'Imperfect → conditional: lirais.',
    ]),
    fill('Si tu m’avais appelé, je serais venu.', 'Si tu m’avais appelé, je ___ venu.', 'serais', 'Si tu m’avais appelé, je {serais} venu.', [
      'Plus-que-parfait → conditionnel passé : serais venu.', 'Pluperfect → past conditional: serais venu.',
    ]),
    fill('S’il fait beau, on ira à la plage.', 'S’il fait beau, on ___ à la plage.', 'ira', 'S’il fait beau, on {ira} à la plage.', [
      'Présent → futur : ira.', 'Present → future: ira.',
    ]),
    situation(CHOIX, 'A-t-elle fait médecine ?', ['Oui', 'Elle va commencer', 'Non'], 2, CHOIX_SHOW, [
      '« Si j’avais écouté… j’aurais fait médecine » : elle ne l’a pas fait.', '« If I had listened… I would have studied medicine »: she did not.',
    ]),
    situation(CHOIX, 'Que ferait-elle si elle pouvait recommencer ?', ['Elle ferait médecine', 'Elle choisirait encore la musique', 'Elle écouterait son père'], 1, CHOIX_SHOW, [
      '« Si c’était à refaire, je choisirais encore la musique. »', '« If I had to do it again, I would choose music again. »',
    ]),
  ],
  takeaway: [
    'Si + présent : possible. Si + imparfait : imaginaire. Si + plus-que-parfait : trop tard, c’est un regret. Le temps après « si » dit tout.',
    'Si + present: possible. Si + imperfect: imaginary. Si + pluperfect: too late, a regret. The tense after « si » says it all.',
  ],
});
