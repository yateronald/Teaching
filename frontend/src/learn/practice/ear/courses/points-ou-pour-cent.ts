// C1 · Figures in debates: points vs per cent, twice as much, half as many, one in three.
import { ear, ex, fill, pick, situation } from '../authoring';

const ETUDE = 'Selon l’étude, la part des jeunes qui lisent chaque jour est passée de trente à vingt pour cent en dix ans. Autrement dit, un tiers des lecteurs quotidiens a disparu.';
const ETUDE_SHOW = 'Selon l’étude, la part des jeunes qui lisent chaque jour est passée {de trente à vingt pour cent} en dix ans. Autrement dit, {un tiers} des lecteurs quotidiens a disparu.';

export default ear('points-ou-pour-cent', {
  rule: [
    ['Points, pour cent, fois plus', 'Points, per cent, times more'],
    [
      'Dans un débat, les chiffres se piègent facilement. Quand un taux passe de 10 % à 12 %, il augmente de **deux points**, mais de **vingt pour cent** par rapport à son niveau de départ. Les deux formules sont vraies, mais elles n’ont pas le même effet.\n\nÀ retenir aussi : __deux fois plus__ (× 2), __deux fois moins__ (÷ 2), __moitié moins__ (÷ 2), __le double__, __le triple__, __un sur trois__ (environ 33 %), __les deux tiers__ (environ 67 %), __les trois quarts__ (75 %).',
      'In a debate, figures are easily twisted. When a rate goes from 10% to 12%, it rises by **two points**, but by **twenty per cent** compared with where it started. Both are true, but they do not sound the same.\n\nAlso remember: __deux fois plus__ (× 2), __deux fois moins__ (÷ 2), __moitié moins__ (÷ 2), __le double__, __le triple__, __un sur trois__ (about 33%), __les deux tiers__ (about 67%), __les trois quarts__ (75%).',
    ],
  ],
  goal: ['Comprendre exactement un chiffre présenté dans un débat.', 'Understand exactly a figure presented in a debate.'],
  examples: [
    ex('Le chômage a baissé d’un point.', 'Le chômage a baissé d’{un point}.', ['Par exemple de 8 % à 7 %.', 'For example from 8% to 7%.']),
    ex('Les prix ont doublé.', 'Les prix ont {doublé}.', ['Multipliés par deux.', 'Multiplied by two.']),
    ex('Un Français sur trois part en vacances l’hiver.', '{Un Français sur trois} part en vacances l’hiver.', ['Environ 33 %.', 'About 33%.']),
  ],
  items: [
    pick('Le taux passe de dix à douze pour cent.', ['De deux points, soit vingt pour cent de hausse', 'De deux pour cent seulement'], 0, 'Le taux passe {de dix à douze pour cent}.', [
      '+2 points ; et 2 sur 10, c’est une hausse de 20 %.', '+2 points; and 2 out of 10 is a 20% rise.',
    ], ['De combien augmente-t-il ?', 'By how much does it rise?']),
    pick('Il gagne deux fois moins que sa sœur.', ['6 000 €', '1 500 €', '1 000 €'], 1, 'Il gagne {deux fois moins} que sa sœur.', [
      'Deux fois moins = la moitié : 3 000 ÷ 2 = 1 500 €.', 'Half: 3,000 ÷ 2 = €1,500.',
    ], ['Si sa sœur gagne 3 000 €, combien gagne-t-il ?', 'If his sister earns €3,000, how much does he earn?']),
    pick('Les ventes ont triplé.', ['Elles ont baissé de trois pour cent', 'Elles ont été multipliées par trois'], 1, 'Les ventes ont {triplé}.', [
      'Tripler = multiplier par trois.', 'Tripler = to treble.',
    ], ['Que s’est-il passé ?', 'What happened?']),
    pick('Un salarié sur quatre travaille le dimanche.', ['25 %', '40 %', '4 %'], 0, '{Un salarié sur quatre} travaille le dimanche.', [
      'Un sur quatre = un quart = 25 %.', 'One in four = a quarter = 25%.',
    ], ['Quelle proportion ?', 'What proportion?']),
    pick('Les deux tiers des habitants ont voté.', ['Environ 20 %', 'Environ 33 %', 'Environ 67 %'], 2, '{Les deux tiers} des habitants ont voté.', [
      'Deux tiers ≈ 67 %.', 'Two thirds ≈ 67%.',
    ], ['Quelle proportion a voté ?', 'What share voted?']),
    fill('Les prix ont doublé en dix ans.', 'Les prix ont ___ en dix ans.', 'doublé', 'Les prix ont {doublé} en dix ans.', [
      'Doubler = × 2.', 'Doubler = × 2.',
    ]),
    fill('Le chômage a baissé d’un point.', 'Le chômage a baissé d’un ___.', 'point', 'Le chômage a baissé d’un {point}.', [
      'Un point de pourcentage.', 'One percentage point.',
    ]),
    fill('Ça coûte moitié moins cher.', 'Ça coûte ___ moins cher.', 'moitié', 'Ça coûte {moitié} moins cher.', [
      'Moitié moins cher = le prix divisé par deux.', 'Half the price.',
    ]),
    situation(ETUDE, 'De combien de points la part a-t-elle baissé ?', ['De trente points', 'De dix points', 'De vingt points'], 1, ETUDE_SHOW, [
      'De 30 % à 20 % : moins dix points.', 'From 30% to 20%: down ten points.',
    ]),
    situation(ETUDE, 'Que signifie « un tiers des lecteurs a disparu » ?', ['Il reste un tiers des lecteurs', 'Trois lecteurs ont arrêté', 'Sur trois lecteurs quotidiens, un a arrêté'], 2, ETUDE_SHOW, [
      'Dix sur trente = un tiers : la même baisse, dite autrement.', 'Ten out of thirty = a third: the same fall, put differently.',
    ]),
  ],
  takeaway: [
    'Points ≠ pour cent : de 10 à 12 %, c’est +2 points mais +20 %. Deux fois moins = la moitié ; un sur trois ≈ 33 % ; les deux tiers ≈ 67 %.',
    'Points ≠ per cent: from 10 to 12% is +2 points but +20%. Deux fois moins = half; one in three ≈ 33%; two thirds ≈ 67%.',
  ],
});
