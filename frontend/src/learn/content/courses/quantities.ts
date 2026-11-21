import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'How much, how many, too much, not enough: quantities are part of every purchase, recipe and complaint. This course teaches the adverbs of quantity (beaucoup de, peu de, assez de, trop de), precise measures (un litre de, une part de), the pronoun en that replaces a quantity (j’en veux deux), and comparisons of quantity (plus de, moins de, autant de).',
    'Combien, trop, pas assez : la quantité est présente dans chaque achat, chaque recette, chaque réclamation. Ce cours présente les adverbes de quantité (beaucoup de, peu de, assez de, trop de), les mesures précises (un litre de, une part de), le pronom en qui remplace une quantité (j’en veux deux) et la comparaison des quantités (plus de, moins de, autant de).',
  ),
  outcomes: [
    b('Use beaucoup de, peu de, assez de, trop de', 'Employer beaucoup de, peu de, assez de, trop de'),
    b('Give precise measures and containers', 'Donner des mesures et des contenants précis'),
    b('Replace a quantity with en', 'Remplacer une quantité par en'),
    b('Compare quantities: plus de, moins de, autant de', 'Comparer des quantités : plus de, moins de, autant de'),
  ],
};

const C = 'quantities';
export default [
  lesson(C, 1, ['a-lot-a-little', 'beaucoup-peu'],
    b('Beaucoup de, peu de, trop de, assez de', 'Beaucoup de, peu de, trop de, assez de'),
    b('Express an approximate quantity with an adverb + de.', 'Exprimer une quantité approximative avec un adverbe + de.'),
    [b('Use the adverbs of quantity + de', 'Employer les adverbes de quantité + de'), b('Distinguish peu de and un peu de', 'Distinguer peu de et un peu de'), b('Complain about too much or not enough', 'Se plaindre du trop ou du pas assez')],
    13,
    [
      card(b('Adverb + de + noun', 'Adverbe + de + nom'), b('**beaucoup de** (a lot of), **trop de** (too much / many), **assez de** (enough), **peu de** (little, few), **un peu de** (a little), **pas mal de** (quite a lot, informal). Always **de** without an article: **beaucoup de gens**, **trop de bruit**.', '**beaucoup de**, **trop de**, **assez de**, **peu de**, **un peu de**, **pas mal de** (familier). Toujours **de** sans article : **beaucoup de gens**, **trop de bruit**.'), {
        ex: [['Il y a beaucoup de monde ici.', 'There are a lot of people here.'], ['On n’a pas assez de chaises.', 'We don’t have enough chairs.'], ['Ajoute un peu de sel.', 'Add a little salt.']],
      }),
      trap(b('Peu de ≠ un peu de', 'Peu de ≠ un peu de'), b('**peu de** is negative (almost none): **J’ai peu de temps.** **un peu de** is positive (some): **J’ai un peu de temps, je peux t’aider.**', '**peu de** est négatif (presque pas) : **J’ai peu de temps.** **un peu de** est positif (une petite quantité) : **J’ai un peu de temps, je peux t’aider.**')),
      mc(P.word, ['de', 'des', 'du', 'les'], { fr: 'Elle a beaucoup ___ amis à Montréal.' }),
      mc(P.meaning, [b('I have hardly any money.', 'Je n’ai presque pas d’argent.'), b('I have a little money, enough.', 'J’ai un peu d’argent, assez.'), b('I have too much money.', 'J’ai trop d’argent.'), b('I have no money at all.', 'Je n’ai pas du tout d’argent.')], { fr: 'J’ai peu d’argent.' }),
      sort(b('Positive or negative idea?', 'Idée positive ou négative ?'), [b('enough / positive', 'suffisant / positif'), b('not enough / too much', 'insuffisant / excessif')], [['un peu de patience', 0], ['peu de patience', 1], ['assez de place', 0], ['trop de bruit', 1], ['pas assez de temps', 1], ['beaucoup d’énergie', 0]]),
      gap(P.complete, 'Dans cette ville, il y a trop ___ voitures et pas assez ___ pistes cyclables.', ['de', 'de']),
      ord(P.order, 'Il y a trop de sucre dans ce gâteau.', { tr: 'There is too much sugar in this cake.' }),
      say('Je travaille beaucoup et j’ai peu de temps libre, mais j’ai un peu de temps ce soir.', 'I work a lot and have little free time, but I have a bit of time tonight.'),
    ],
    [
      b('beaucoup de, trop de, assez de, peu de, un peu de + noun without article.', 'beaucoup de, trop de, assez de, peu de, un peu de + nom sans article.'),
      b('peu de = hardly any; un peu de = a little.', 'peu de = presque pas ; un peu de = une petite quantité.'),
      b('de → d’ before a vowel: beaucoup d’amis.', 'de → d’ devant une voyelle : beaucoup d’amis.'),
    ],
    [['une piste cyclable', b('a cycle lane', 'voie pour les vélos')], ['le bruit', b('noise', 'son désagréable')], ['pas mal de', b('quite a lot of (informal)', 'assez de, familier')]],
  ),
  lesson(C, 2, ['measures-and-the-pronoun-en', 'mesures-et-pronom-en'],
    b('Measures and the pronoun en', 'Les mesures et le pronom en'),
    b('Give precise quantities and replace them with en.', 'Donner des quantités précises et les remplacer par en.'),
    [b('Use containers and measures', 'Employer les contenants et les mesures'), b('Replace de + noun with en', 'Remplacer de + nom par en'), b('Keep the number at the end: j’en prends deux', 'Garder le nombre à la fin : j’en prends deux')],
    13,
    [
      card(b('Precise measures', 'Les mesures précises'), b('**un kilo de, un litre de, 200 grammes de, une bouteille de, une boîte de, un paquet de, une tranche de, une part de, une douzaine de**: always **de** without an article.', '**un kilo de, un litre de, 200 grammes de, une bouteille de, une boîte de, un paquet de, une tranche de, une part de, une douzaine de** : toujours **de** sans article.'), {
        ex: [['Deux litres de lait, s’il vous plaît.', 'Two litres of milk, please.'], ['Une part de tarte aux pommes.', 'A slice of apple pie.']],
      }),
      card(b('En replaces the quantity', 'En remplace la quantité'), b('**en** replaces **de / du / de la / des + noun**. The number or the quantity stays at the end: **Tu as des enfants ? – Oui, j’en ai deux.** **Du café ? – Oui, j’en veux bien un peu.** In the negative: **Je n’en ai pas.**', '**en** remplace **de / du / de la / des + nom**. Le nombre ou la quantité reste à la fin : **Tu as des enfants ? – Oui, j’en ai deux.** **Du café ? – Oui, j’en veux bien un peu.** À la forme négative : **Je n’en ai pas.**'), {
        ex: [['Des pommes ? J’en prends un kilo.', 'Apples? I’ll take a kilo.'], ['Il en a beaucoup.', 'He has a lot (of them).'], ['Je n’en veux plus, merci.', 'I don’t want any more, thanks.']],
      }),
      mc(P.best, ['Oui, j’en ai trois.', 'Oui, je les ai trois.', 'Oui, j’ai trois en.', 'Oui, j’en ai trois sœurs de.'], { fr: '— Tu as des sœurs ?' }),
      mc(P.best, ['Non, je n’en bois jamais.', 'Non, je ne bois jamais en.', 'Non, je n’en bois jamais de café.', 'Non, je le bois jamais.'], { fr: '— Tu bois du café ?' }),
      pairs(P.match, [['une boîte de', b('a tin / a box of', 'contenant rigide')], ['un pot de', b('a jar / a pot of', 'récipient pour confiture, yaourt')], ['une tranche de', b('a slice of', 'morceau fin')], ['une gousse d’ail', b('a clove of garlic', 'élément d’une tête d’ail')]]),
      gap(P.complete, 'Des œufs ? Il ___ faut six pour la recette, et j’___ ai seulement quatre.', ['en', 'en']),
      dlg(b('At the cheese shop', 'À la fromagerie'), undefined, [['Fromagère', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour ! Je vous sers du comté ?', 'Hello! Can I serve you some Comté?'],
        [1, { options: ['Oui, j’en voudrais 300 grammes, s’il vous plaît.', 'Oui, je le voudrais 300 grammes.', 'Oui, j’en voudrais 300 grammes de comté de.'] }],
        [0, 'Voilà. Et avec ça ?', 'Here you are. Anything else?'],
        [1, { options: ['Une tranche de brie, et c’est tout. Merci !', 'Une tranche du brie, c’est tout.', 'Un tranche de le brie.'] }],
      ]),
      dict('Des tomates ? J’en ai acheté deux kilos au marché.', { voice: 'f' }),
    ],
    [
      b('Measures + de: un kilo de, une bouteille de, une tranche de.', 'Mesures + de : un kilo de, une bouteille de, une tranche de.'),
      b('en replaces de + noun; the number goes at the end (j’en ai deux).', 'en remplace de + nom ; le nombre va à la fin (j’en ai deux).'),
      b('Negative: je n’en ai pas, je n’en veux plus.', 'Négatif : je n’en ai pas, je n’en veux plus.'),
    ],
    [['Et avec ça ?', b('Anything else?', 'formule du commerçant')], ['la fromagerie', b('the cheese shop', 'boutique de fromages')], ['la recette', b('the recipe', 'instructions de cuisine')]],
  ),
  lesson(C, 3, ['comparing-quantities', 'comparer-les-quantites'],
    b('Plus de, moins de, autant de', 'Plus de, moins de, autant de'),
    b('Compare quantities with nouns and verbs.', 'Comparer des quantités avec des noms et des verbes.'),
    [b('Use plus de / moins de / autant de + noun', 'Employer plus de / moins de / autant de + nom'), b('Use plus / moins / autant with a verb', 'Employer plus / moins / autant avec un verbe'), b('Compare two cities or jobs', 'Comparer deux villes ou deux emplois')],
    13,
    [
      card(b('Comparing nouns', 'Comparer des noms'), b('**plus de / moins de / autant de + noun + que**: **Il y a plus d’habitants à Montréal qu’à Québec. J’ai autant de travail que toi.**', '**plus de / moins de / autant de + nom + que** : **Il y a plus d’habitants à Montréal qu’à Québec. J’ai autant de travail que toi.**'), {
        ex: [['Il y a moins de neige cette année.', 'There’s less snow this year.'], ['Elle a autant d’expérience que lui.', 'She has as much experience as him.']],
      }),
      card(b('Comparing actions', 'Comparer des actions'), b('With a verb: **verb + plus / moins / autant (que)**: **Je travaille plus que l’an dernier. Il dort autant que moi.** Careful: **plus** is pronounced [plys] when it means “more” at the end of a sentence.', 'Avec un verbe : **verbe + plus / moins / autant (que)** : **Je travaille plus que l’an dernier. Il dort autant que moi.** Attention : **plus** se prononce [plys] quand il signifie « davantage » en fin de phrase.'), {
        ex: [['Je voyage moins qu’avant.', 'I travel less than before.'], ['On gagne autant, mais on travaille plus.', 'We earn as much, but we work more.']],
      }),
      mc(P.best, ['Il y a plus de touristes en été.', 'Il y a plus des touristes en été.', 'Il y a plus touristes en été.', 'Il y a de plus touristes en été.']),
      mc(P.best, ['Elle lit autant que son frère.', 'Elle lit autant de que son frère.', 'Elle lit aussi que son frère.', 'Elle autant lit que son frère.']),
      sort(b('Noun or verb comparison?', 'Comparaison d’un nom ou d’un verbe ?'), [b('+ de + noun', '+ de + nom'), b('verb + plus / moins / autant', 'verbe + plus / moins / autant')], [['plus de temps', 0], ['je mange moins', 1], ['autant d’argent', 0], ['il parle plus', 1], ['moins de stress', 0], ['on sort autant', 1]]),
      gap(P.complete, 'À Montréal, il y a ___ de métros qu’à Québec, mais ___ de nature.', ['plus', 'moins']),
      ord(P.order, 'Dans mon nouveau travail, j’ai moins de stress.', { tr: 'In my new job, I have less stress.' }),
      say('À la campagne, il y a moins de bruit et plus d’espace, mais il y a moins de transports.', 'In the countryside there’s less noise and more space, but fewer transport options.'),
      dict('Cette année, je travaille moins et j’ai plus de temps pour ma famille.', { voice: 'm' }),
    ],
    [
      b('plus de / moins de / autant de + noun (+ que).', 'plus de / moins de / autant de + nom (+ que).'),
      b('verb + plus / moins / autant (+ que).', 'verbe + plus / moins / autant (+ que).'),
      b('Never « plus des » in a comparison: plus de touristes.', 'Jamais « plus des » dans une comparaison : plus de touristes.'),
    ],
    [['un habitant', b('an inhabitant', 'personne qui habite un lieu')], ['l’espace', b('space', 'la place')], ['gagner', b('to earn; to win', 'recevoir un salaire ; remporter')]],
  ),
];
