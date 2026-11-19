// C2 · Words of degree and nuance: ne… guère, à peine, tant soit peu, pour le moins, ô combien.
import { ear, ex, fill, pick, situation } from '../authoring';

const REUNION = 'La réunion a été pour le moins agitée. On n’a guère avancé, et le directeur était loin d’être satisfait. Il reste à peine une semaine avant l’échéance.';
const REUNION_SHOW = 'La réunion a été {pour le moins} agitée. On n’a {guère} avancé, et le directeur était {loin d’être} satisfait. Il reste {à peine} une semaine avant l’échéance.';

export default ear('ne-guere', {
  rule: [
    ['Mesurer exactement', 'Measuring precisely'],
    [
      'Ces mots dosent une quantité ou une intensité, et changent beaucoup le sens :\n\n__ne… guère__ (très peu, presque pas), __à peine__ (tout juste, presque pas), __tant soit peu__ (même un tout petit peu), __quelque peu__ (un peu, assez), __un tantinet__ (un tout petit peu), __pour le moins__ (et c’est peu dire), __ô combien__ (extrêmement), __loin de__ (pas du tout : il est loin d’être convaincu).\n\n__Pour le moins agitée__ ne veut pas dire « un peu agitée » : c’est même très agité.',
      'These words measure a quantity or an intensity, and change the meaning a lot:\n\n__ne… guère__ (very little, hardly), __à peine__ (barely), __tant soit peu__ (even slightly), __quelque peu__ (somewhat), __un tantinet__ (a tiny bit), __pour le moins__ (to say the least), __ô combien__ (extremely), __loin de__ (not at all: il est loin d’être convaincu).\n\n__Pour le moins agitée__ does not mean « a bit lively »: it was very heated.',
    ],
  ],
  goal: ['Mesurer exactement une quantité ou une intensité.', 'Measure a quantity or intensity precisely.'],
  examples: [
    ex('Il n’en reste guère.', 'Il n’en reste {guère}.', ['= Très peu.', '= Hardly any.']),
    ex('C’était pour le moins surprenant.', 'C’était {pour le moins} surprenant.', ['= Très surprenant, et c’est peu dire.', '= Surprising, to say the least.']),
    ex('Un sujet ô combien délicat.', 'Un sujet {ô combien} délicat.', ['= Extrêmement délicat.', '= Extremely delicate.']),
  ],
  items: [
    pick('Il n’en reste guère.', ['Il en reste beaucoup', 'Il en reste très peu', 'Il n’en reste aucun'], 1, 'Il n’en reste {guère}.', [
      'Ne… guère = très peu, mais pas zéro.', 'Ne… guère = very few, but not none.',
    ], ['Combien en reste-t-il ?', 'How many are left?']),
    pick('Ce discours était pour le moins surprenant.', ['Un peu surprenant seulement', 'Très surprenant, et c’est peu dire'], 1, 'Ce discours était {pour le moins} surprenant.', [
      'Pour le moins = au minimum, et sans doute davantage.', 'To say the least.',
    ], ['Était-il surprenant ?', 'Was it surprising?']),
    pick('Si vous étiez tant soit peu attentif, vous l’auriez vu.', ['Même un tout petit peu attentif', 'Très attentif'], 0, 'Si vous étiez {tant soit peu} attentif, vous l’auriez vu.', [
      'Tant soit peu = si peu que ce soit.', 'Even slightly.',
    ], ['Que reproche-t-on ?', 'What is the reproach?']),
    pick('C’est un sujet ô combien délicat.', ['Pas du tout délicat', 'Extrêmement délicat'], 1, 'C’est un sujet {ô combien} délicat.', [
      'Ô combien = énormément.', 'Ô combien = immensely.',
    ], ['Comment est le sujet ?', 'What is the subject like?']),
    pick('Il est loin d’être convaincu.', ['Il n’est pas du tout convaincu', 'Il est presque convaincu'], 0, 'Il est {loin d’être} convaincu.', [
      'Loin de = pas du tout.', 'Far from it.',
    ], ['Est-il convaincu ?', 'Is he convinced?']),
    fill('Je ne l’ai guère vu cette année.', 'Je ne l’ai ___ vu cette année.', 'guère', 'Je ne l’ai {guère} vu cette année.', [
      'Ne… guère = presque pas.', 'Hardly.',
    ]),
    fill('Elle était quelque peu fatiguée.', 'Elle était ___ peu fatiguée.', 'quelque', 'Elle était {quelque} peu fatiguée.', [
      'Quelque peu = assez, un peu.', 'Somewhat.',
    ]),
    fill('Il y avait à peine dix personnes.', 'Il y avait à ___ dix personnes.', 'peine', 'Il y avait {à peine} dix personnes.', [
      'À peine = tout juste, pas plus.', 'Barely.',
    ]),
    situation(REUNION, 'Comment s’est passée la réunion ?', ['Calme', 'Très productive', 'Très agitée'], 2, REUNION_SHOW, [
      '« Pour le moins agitée » = très agitée.', '« Heated, to say the least ».',
    ]),
    situation(REUNION, 'Le directeur était-il satisfait ?', ['Oui, très', 'Non, pas du tout', 'À moitié'], 1, REUNION_SHOW, [
      '« Loin d’être satisfait » = pas du tout satisfait.', '« Far from satisfied ».',
    ]),
  ],
  takeaway: [
    'Ne… guère, à peine = très peu ; tant soit peu = même un peu ; pour le moins = c’est peu dire ; ô combien = extrêmement ; loin de = pas du tout. Ces petits mots changent la mesure.',
    'Ne… guère, à peine = very little; tant soit peu = even a little; pour le moins = to say the least; ô combien = extremely; loin de = not at all. These little words change the measure.',
  ],
});
