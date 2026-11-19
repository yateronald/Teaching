// B2 · Numbers in the news: percentages, millions and billions, proportions, rises and falls.
import { ear, ex, fill, pick, situation } from '../authoring';

const HEARD: [string, string] = ['Qu’avez-vous entendu ?', 'What did you hear?'];
const ETUDE = 'Selon une enquête publiée ce matin, quarante-deux pour cent des salariés télétravaillent au moins un jour par semaine, contre vingt-cinq pour cent il y a cinq ans. Un salarié sur dix télétravaille même tous les jours.';
const ETUDE_SHOW = 'Selon une enquête publiée ce matin, {quarante-deux pour cent} des salariés télétravaillent au moins un jour par semaine, contre {vingt-cinq pour cent} il y a cinq ans. {Un salarié sur dix} télétravaille même tous les jours.';

export default ear('les-chiffres-de-l-actualite', {
  rule: [
    ['Les chiffres de l’actualité : pourcentages, millions, proportions', 'Numbers in the news: percentages, millions, proportions'],
    [
      'À la radio, les chiffres vont vite. Repérez les **pourcentages** (__vingt-cinq pour cent__), les **grands nombres** (__deux millions trois cent mille__ = 2 300 000 ; __un milliard__ = 1 000 000 000), les **proportions** (__un tiers__, __la moitié__, __trois quarts__, __un Français sur cinq__) et le **sens** de l’évolution (__une hausse de__, __une baisse de__, __a doublé__, __a été divisé par deux__).\n\nLa méthode : notez le chiffre **et** ce qu’il mesure. Un chiffre sans son sujet ne sert à rien.',
      'On the radio, numbers go fast. Spot **percentages** (__vingt-cinq pour cent__), **big numbers** (__deux millions trois cent mille__ = 2,300,000; __un milliard__ = one billion), **proportions** (__un tiers__, __la moitié__, __trois quarts__, __un Français sur cinq__) and the **direction** of change (__une hausse de__, __une baisse de__, __a doublé__, __a été divisé par deux__).\n\nThe method: note the number **and** what it measures. A number without its subject is useless.',
    ],
  ],
  goal: ['Comprendre les chiffres d’une information à vitesse naturelle.', 'Understand the numbers in a news item at natural speed.'],
  examples: [
    ex('Vingt-cinq pour cent.', '{vingt-cinq pour cent} = 25 %', ['Pour cent = %.', 'Pour cent = per cent.']),
    ex('Deux millions trois cent mille habitants.', '{deux millions trois cent mille} = 2 300 000', ['Millions d’abord, puis milliers.', 'Millions first, then thousands.']),
    ex('Un Français sur cinq.', '{un sur cinq} = 20 %', ['« Un sur cinq » : une proportion, pas un nombre.', '« Un sur cinq »: a proportion, not a count.']),
  ],
  items: [
    pick('Le chômage a baissé de deux pour cent.', ['−2 %', '+2 %', '−12 %'], 0, 'Le chômage {a baissé} de {deux pour cent}.', [
      '« A baissé » : une baisse, donc −2 %.', '« A baissé »: a fall, so −2%.',
    ], HEARD),
    pick('La ville compte un million deux cent mille habitants.', ['1 200 000', '1 000 200', '200 000'], 0, 'La ville compte {un million deux cent mille} habitants.', [
      'Un million + deux cent mille = 1 200 000.', 'One million + two hundred thousand = 1,200,000.',
    ], HEARD),
    pick('Un tiers des étudiants travaillent pendant leurs études.', ['environ 33 %', '25 %', '50 %'], 0, '{Un tiers} des étudiants travaillent pendant leurs études.', [
      'Un tiers = 1/3, environ 33 %. Un quart = 25 %, la moitié = 50 %.', 'Un tiers = 1/3, about 33%. Un quart = 25%, la moitié = 50%.',
    ], HEARD),
    pick('Les prix ont doublé en dix ans.', ['Ils sont deux fois plus élevés.', 'Ils ont baissé de moitié.', 'Ils ont augmenté de dix pour cent.'], 0, 'Les prix {ont doublé} en dix ans.', [
      'Doubler = multiplier par deux. « Dix ans », c’est la durée, pas le chiffre de la hausse.', 'Doubler = multiply by two. « Dix ans » is the period, not the size of the rise.',
    ], ['Que veut dire la phrase ?', 'What does the sentence mean?']),
    pick('Trois Français sur quatre partent en vacances.', ['75 %', '34 %', '25 %'], 0, '{Trois Français sur quatre} partent en vacances.', [
      'Trois sur quatre = 3/4 = 75 %.', 'Three in four = 3/4 = 75%.',
    ], HEARD),
    fill('Le taux de participation est de soixante-huit pour cent.', 'Le taux de participation est de ___ %.', ['68', 'soixante-huit'], 'Le taux de participation est de {soixante-huit pour cent}.', [
      'Soixante-huit = 60 + 8 = 68 %.', 'Soixante-huit = 60 + 8 = 68%.',
    ]),
    fill('Le projet coûtera quatre milliards d’euros.', 'Le projet coûtera ___ milliards d’euros.', ['4', 'quatre'], 'Le projet coûtera {quatre milliards} d’euros.', [
      'Quatre milliards = 4 000 000 000. Un milliard = mille millions.', 'Quatre milliards = 4 billion. Un milliard = a thousand million.',
    ]),
    fill('La moitié des habitants ont voté.', 'La ___ des habitants ont voté.', 'moitié', 'La {moitié} des habitants ont voté.', [
      'La moitié = 50 %.', 'La moitié = half, 50%.',
    ]),
    situation(ETUDE, 'Quelle part des salariés télétravaillent aujourd’hui au moins un jour par semaine ?', ['42 %', '25 %', '10 %'], 0, ETUDE_SHOW, [
      '42 % aujourd’hui ; 25 %, c’était il y a cinq ans (« contre… il y a cinq ans »).', '42% today; 25% was five years ago (« contre… il y a cinq ans »).',
    ]),
    situation(ETUDE, 'Combien télétravaillent tous les jours ?', ['Un sur dix', 'Un sur quatre', 'Quarante-deux pour cent'], 0, ETUDE_SHOW, [
      '« Un salarié sur dix télétravaille même tous les jours » : 10 %.', '« Un salarié sur dix… tous les jours »: 10%.',
    ]),
  ],
  takeaway: [
    'Notez le chiffre et ce qu’il mesure. Pour cent = %, un tiers ≈ 33 %, un sur cinq = 20 %, un milliard = mille millions. Hausse, baisse, a doublé : écoutez le sens.',
    'Note the number and what it measures. Pour cent = %, un tiers ≈ 33%, un sur cinq = 20%, un milliard = a billion. Hausse, baisse, a doublé: listen for the direction.',
  ],
});
