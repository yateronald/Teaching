// A2 · [s] and [z]: one s between vowels is [z] (poison), ss is [s] (poisson).
import { ear, ex, fill, pick, situation } from '../authoring';

const REPAS = 'Pour le dessert, on a une tarte aux poires. Et ce soir, mon cousin apporte du poisson.';
const REPAS_SHOW = 'Pour le de{ss}ert, on a une tarte aux poires. Et ce soir, mon cou{s}in apporte du poi{ss}on.';

export default ear('poisson-ou-poison', {
  rule: [
    ['Poisson ou poison ? Les sons [s] et [z]', 'Poisson or poison? The sounds [s] and [z]'],
    [
      'Entre deux voyelles, un seul **s** se prononce **[z]** : __poison__, __cousin__, __désert__, __musée__. Deux **ss** se prononcent **[s]** : __poisson__, __coussin__, __dessert__.\n\nÀ l’oral, la différence entre **[s]** (le sifflement du serpent) et **[z]** (le bourdonnement de l’abeille) change complètement le sens : __un poisson__ se mange, __un poison__ tue.',
      'Between two vowels, a single **s** is pronounced **[z]**: __poison__, __cousin__, __désert__, __musée__. A double **ss** is pronounced **[s]**: __poisson__, __coussin__, __dessert__.\n\nIn speech, the difference between **[s]** (a snake’s hiss) and **[z]** (a bee’s buzz) changes the meaning completely: __un poisson__ is a fish, __un poison__ is a poison.',
    ],
  ],
  goal: ['Distinguer [s] et [z] dans des mots du quotidien.', 'Tell [s] from [z] in everyday words.'],
  examples: [
    ex('Un poisson.', 'un poi{ss}on [s]', ['Deux s : [s], sans vibration.', 'Double s: [s], no buzz.']),
    ex('Un poison.', 'un poi{s}on [z]', ['Un s entre deux voyelles : [z], avec vibration.', 'One s between vowels: [z], with a buzz.']),
    ex('Le dessert et le désert.', 'le de{ss}ert [s] · le dé{s}ert [z]', ['Le gâteau et le Sahara : un seul son de différence.', 'The cake and the Sahara: one sound apart.']),
  ],
  items: [
    pick('Ce poisson est délicieux.', ['Ce poisson est délicieux.', 'Ce poison est délicieux.'], 0, 'Ce poi{ss}on est délicieux.', [
      '[pwasɔ̃] avec [s] : le poisson. Heureusement !', '[pwasɔ̃] with [s]: the fish. Luckily!',
    ]),
    pick('Mon cousin arrive demain.', ['Mon coussin arrive demain.', 'Mon cousin arrive demain.'], 1, 'Mon cou{s}in arrive demain.', [
      '[kuzɛ̃] avec [z] : le cousin. « Coussin » (pour s’asseoir) se dit [kusɛ̃].', '[kuzɛ̃] with [z]: the cousin. « Coussin » (a cushion) is [kusɛ̃].',
    ]),
    pick('Ils ont traversé le désert.', ['le désert (le Sahara)', 'le dessert (le gâteau)'], 0, 'Ils ont traversé le dé{s}ert.', [
      '[dezɛʁ] avec [z] : le désert. « Le dessert » se dit [desɛʁ].', '[dezɛʁ] with [z]: the desert. « Le dessert » is [desɛʁ].',
    ], ['Quel mot avez-vous entendu ?', 'Which word did you hear?']),
    pick('Elle a mis le coussin sur le canapé.', ['Elle a mis le coussin sur le canapé.', 'Elle a mis le cousin sur le canapé.'], 0, 'Elle a mis le cou{ss}in sur le canapé.', [
      '[kusɛ̃] avec [s] : le coussin. Le cousin, lui, n’est pas sur le canapé !', '[kusɛ̃] with [s]: the cushion. The cousin is not on the sofa!',
    ]),
    pick('Cochez la case.', ['Cochez la case.', 'Cochez la casse.'], 0, 'Cochez la ca{s}e.', [
      '[kaz] : la case, le petit carré d’un formulaire. « La casse » se dit [kas].', '[kaz]: the box on a form. « La casse » is [kas].',
    ]),
    fill('Je voudrais du poisson, s’il vous plaît.', 'Je voudrais du ___, s’il vous plaît.', 'poisson', 'Je voudrais du poi{ss}on, s’il vous plaît.', [
      '[s] : poisson, avec deux s à l’écrit.', '[s]: poisson, written with ss.',
    ]),
    fill('Il y a douze personnes.', 'Il y a ___ personnes.', ['douze', '12'], 'Il y a dou{z}e personnes.', [
      '[duz] avec [z] : douze. « Douce » (doux au féminin) se dit [dus].', '[duz] with [z]: douze (twelve). « Douce » (soft) is [dus].',
    ]),
    fill('Nous avons visité un musée.', 'Nous avons visité un ___.', 'musée', 'Nous avons visité un mu{s}ée.', [
      'Un seul s entre deux voyelles : [myze].', 'A single s between vowels: [myze].',
    ]),
    situation(REPAS, 'Qu’apporte le cousin ?', ['Du poisson', 'Une tarte aux poires', 'Un coussin'], 0, REPAS_SHOW, [
      '« Mon cousin [z] apporte du poisson [s] » : les deux sons dans la même phrase.', '« Mon cousin [z] apporte du poisson [s] »: both sounds in one sentence.',
    ]),
    situation(REPAS, 'Qu’y a-t-il pour le dessert ?', ['Une tarte aux poires', 'Du poisson', 'Rien'], 0, REPAS_SHOW, [
      '« Pour le dessert [s], on a une tarte aux poires. »', '« Pour le dessert [s], on a une tarte aux poires. »',
    ]),
  ],
  takeaway: [
    'Un s entre deux voyelles = [z] (poison, cousin, désert) ; ss = [s] (poisson, coussin, dessert). Écoutez si le son vibre.',
    'One s between vowels = [z] (poison, cousin, désert); ss = [s] (poisson, coussin, dessert). Listen for the buzz.',
  ],
});
