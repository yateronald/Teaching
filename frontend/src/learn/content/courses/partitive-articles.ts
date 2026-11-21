import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je bois du café, je mange de la soupe, je n’ai pas de lait: French needs an article where English often has none. This course explains when to use du, de la, de l’ and des, why they all become de after a negation or a quantity, and the difference between j’aime le café (in general) and je prends du café (some). You practise at the market, in the kitchen and at the restaurant.',
    'Je bois du café, je mange de la soupe, je n’ai pas de lait : le français exige un article là où l’anglais n’en met souvent aucun. Ce cours explique quand employer du, de la, de l’ et des, pourquoi ils deviennent tous de après une négation ou une quantité, et la différence entre j’aime le café (en général) et je prends du café (une partie). Vous pratiquez au marché, en cuisine et au restaurant.',
  ),
  outcomes: [
    b('Use du, de la, de l’, des for an unspecified quantity', 'Employer du, de la, de l’, des pour une quantité indéterminée'),
    b('Switch to de after a negation', 'Passer à de après une négation'),
    b('Choose between le / la (in general) and du / de la (some)', 'Choisir entre le / la (en général) et du / de la (une partie)'),
    b('Order food and drinks naturally', 'Commander à manger et à boire naturellement'),
  ],
};

const C = 'partitive-articles';
export default [
  lesson(C, 1, ['du-de-la-des', 'du-de-la-des'],
    b('Du, de la, de l’, des: some', 'Du, de la, de l’, des : une partie'),
    b('Use the partitive for things you cannot count or an unspecified amount.', 'Employer le partitif pour ce qui ne se compte pas ou une quantité non précisée.'),
    [b('Choose du, de la or de l’', 'Choisir du, de la ou de l’'), b('Use des for plural', 'Employer des au pluriel'), b('Talk about your breakfast', 'Parler de son petit-déjeuner')],
    13,
    [
      card(b('An unspecified part', 'Une partie non précisée'), b('For a mass you cannot count (water, bread, courage) use **du** (m.), **de la** (f.), **de l’** (before a vowel). For several countable things, **des**. English often says “some” or nothing: **Je bois du thé** = I drink tea.', 'Pour une masse que l’on ne compte pas (eau, pain, courage), employez **du** (m.), **de la** (f.), **de l’** (devant une voyelle). Pour plusieurs objets comptables, **des**. L’anglais dit souvent « some » ou rien : **Je bois du thé**.'), {
        ex: [['Je voudrais du pain, s’il vous plaît.', 'I’d like some bread, please.'], ['Elle met de la crème dans son café.', 'She puts cream in her coffee.'], ['Tu veux de l’eau ?', 'Do you want some water?'], ['On achète des tomates ?', 'Shall we buy some tomatoes?']],
      }),
      mc(P.word, ['de la', 'du', 'de l’', 'des'], { fr: 'Le matin, je mange ___ confiture.' }),
      mc(P.word, ['du', 'de la', 'des', 'de l’'], { fr: 'Il faut ___ courage pour parler en public.' }),
      mc(P.word, ['de l’', 'du', 'de la', 'des'], { fr: 'Vous mettez ___ huile d’olive ?' }),
      sort(b('Which article?', 'Quel article ?'), ['du', 'de la', 'de l’'], [['fromage', 0], ['salade', 1], ['ail', 2], ['beurre', 0], ['viande', 1], ['eau minérale', 2]]),
      gap(P.complete, 'Au petit-déjeuner, je prends ___ café, ___ pain et ___ fruits.', ['du', 'du', 'des']),
      ord(P.order, 'Je voudrais du jus d’orange, s’il vous plaît.', { tr: 'I’d like some orange juice, please.' }),
      say('Le matin, je bois du café et je mange du pain avec de la confiture.', 'In the morning, I drink coffee and eat bread with jam.'),
      dict('Nous achetons du lait, de la farine et des œufs.', { voice: 'f' }),
    ],
    [
      b('du (m.), de la (f.), de l’ (vowel), des (plural): an unspecified quantity.', 'du (m.), de la (f.), de l’ (voyelle), des (pluriel) : quantité non précisée.'),
      b('English often has no article: I drink tea = je bois du thé.', 'L’anglais n’a souvent pas d’article : je bois du thé.'),
      b('Also for abstract things: du courage, de la patience.', 'Aussi pour l’abstrait : du courage, de la patience.'),
    ],
    [['la confiture', b('jam', 'fruits cuits au sucre')], ['la farine', b('flour', 'poudre pour le pain')], ['l’ail', b('garlic', 'condiment au goût fort')]],
  ),
  lesson(C, 2, ['negation-and-quantities', 'negation-et-quantites'],
    b('Pas de, beaucoup de: when everything becomes de', 'Pas de, beaucoup de : quand tout devient de'),
    b('After a negation or a quantity, the partitive becomes de / d’.', 'Après une négation ou une quantité, le partitif devient de / d’.'),
    [b('Use pas de after a negation', 'Employer pas de après une négation'), b('Use de after expressions of quantity', 'Employer de après une quantité'), b('Avoid the trap of être + negation', 'Éviter le piège de être + négation')],
    13,
    [
      card(b('After a negation: de', 'Après une négation : de'), b('**du, de la, de l’, des, un, une** all become **de / d’** after **ne… pas, ne… plus, ne… jamais**: **Je n’ai pas de voiture. Il n’y a plus de lait. Je ne bois jamais d’alcool.**', '**du, de la, de l’, des, un, une** deviennent **de / d’** après **ne… pas, ne… plus, ne… jamais** : **Je n’ai pas de voiture. Il n’y a plus de lait. Je ne bois jamais d’alcool.**'), {
        ex: [['Il n’y a plus de pain.', 'There’s no more bread.'], ['Je ne mange pas de viande.', 'I don’t eat meat.'], ['Nous n’avons pas d’enfants.', 'We don’t have children.']],
      }),
      trap(b('Except with être', 'Sauf avec être'), b('With **être**, the article stays: **Ce n’est pas du sucre, c’est du sel.** **Ce n’est pas une bonne idée.**', 'Avec **être**, l’article reste : **Ce n’est pas du sucre, c’est du sel.** **Ce n’est pas une bonne idée.**')),
      card(b('After a quantity: de', 'Après une quantité : de'), b('**beaucoup de, peu de, un peu de, assez de, trop de, un kilo de, une bouteille de, un morceau de** + noun without article: **un kilo de pommes**, **beaucoup d’amis**.', '**beaucoup de, peu de, un peu de, assez de, trop de, un kilo de, une bouteille de, un morceau de** + nom sans article : **un kilo de pommes**, **beaucoup d’amis**.'), {
        ex: [['Un kilo de tomates, s’il vous plaît.', 'A kilo of tomatoes, please.'], ['Il y a trop de sel !', 'There’s too much salt!']],
      }),
      mc(P.best, ['Je n’ai pas de voiture.', 'Je n’ai pas du voiture.', 'Je n’ai pas la voiture de.', 'Je n’ai de voiture pas.']),
      mc(P.best, ['Ce n’est pas du café, c’est du thé.', 'Ce n’est pas de café, c’est du thé.', 'Ce n’est pas café, c’est thé.', 'Ce n’est de café pas.']),
      mc(P.word, ['de', 'des', 'du', 'les'], { fr: 'Il y a beaucoup ___ monde au marché ce matin.', explain: b('After a quantity: de / d’.', 'Après une quantité : de / d’.') }),
      gap(P.complete, 'Il n’y a plus ___ lait et il reste très peu ___ beurre.', ['de', 'de']),
      pairs(P.match, [['une bouteille de vin', b('a bottle of wine', 'contenant en verre')], ['une tranche de jambon', b('a slice of ham', 'morceau fin')], ['un paquet de pâtes', b('a packet of pasta', 'emballage')], ['une boîte de thon', b('a tin of tuna', 'conserve')]]),
      dlg(b('At the market', 'Au marché'), undefined, [['Marchand', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour madame, qu’est-ce que je vous sers ?', 'Hello madam, what can I get you?'],
        [1, { options: ['Un kilo de pommes et des fraises, s’il vous plaît.', 'Un kilo des pommes et du fraises.', 'Un kilo du pommes, s’il vous plaît.'] }],
        [0, 'Désolé, je n’ai plus de fraises aujourd’hui.', 'Sorry, I have no more strawberries today.'],
        [1, { options: ['Pas de problème. Alors, une barquette de framboises.', 'Pas du problème. Des framboises.', 'Pas des problème, une barquette des framboises.'] }],
      ]),
      say('Je ne mange pas de viande, mais je mange beaucoup de légumes.', 'I don’t eat meat, but I eat a lot of vegetables.'),
    ],
    [
      b('Negation: pas de / plus de / jamais de (Je n’ai pas de voiture).', 'Négation : pas de / plus de / jamais de (Je n’ai pas de voiture).'),
      b('Except with être: Ce n’est pas du sucre.', 'Sauf avec être : Ce n’est pas du sucre.'),
      b('Quantity + de: beaucoup de, un kilo de, une bouteille de.', 'Quantité + de : beaucoup de, un kilo de, une bouteille de.'),
    ],
    [['une barquette', b('a punnet, a small tray', 'petit emballage pour fruits')], ['une tranche', b('a slice', 'morceau mince')], ['une douzaine', b('a dozen', 'douze')]],
  ),
  lesson(C, 3, ['le-or-du', 'le-ou-du'],
    b('J’aime le café, je bois du café', 'J’aime le café, je bois du café'),
    b('Choose between the definite article (in general) and the partitive (some).', 'Choisir entre l’article défini (en général) et le partitif (une partie).'),
    [b('Use le / la after aimer, adorer, détester, préférer', 'Employer le / la après aimer, adorer, détester, préférer'), b('Use du / de la after manger, boire, acheter, prendre', 'Employer du / de la après manger, boire, acheter, prendre'), b('Order at a restaurant', 'Commander au restaurant')],
    13,
    [
      card(b('In general or some?', 'En général ou une partie ?'), b('Verbs of taste (**aimer, adorer, détester, préférer**) talk about a thing **in general**: **le, la, les**. Verbs of consumption (**manger, boire, prendre, acheter, vouloir**) take a **part**: **du, de la, des**. **J’adore le chocolat, alors j’achète du chocolat.**', 'Les verbes de goût (**aimer, adorer, détester, préférer**) parlent d’une chose **en général** : **le, la, les**. Les verbes de consommation (**manger, boire, prendre, acheter, vouloir**) prennent une **partie** : **du, de la, des**. **J’adore le chocolat, alors j’achète du chocolat.**'), {
        ex: [['Je déteste le poisson.', 'I hate fish.'], ['Ce soir, on mange du poisson.', 'Tonight, we’re eating fish.'], ['Elle préfère les légumes bio.', 'She prefers organic vegetables.']],
      }),
      mc(P.word, ['le', 'du', 'de', 'un'], { fr: 'Mon fils adore ___ fromage.' }),
      mc(P.word, ['du', 'le', 'de', 'au'], { fr: 'Tu veux ___ riz avec ton poulet ?', explain: b('Vouloir + an unspecified part: du.', 'Vouloir + une partie non précisée : du.') }),
      mc(P.word, ['la', 'de la', 'de', 'une'], { fr: 'Je n’aime pas ___ soupe.', explain: b('Aimer speaks in general: la, even in the negative.', 'Aimer parle en général : la, même à la forme négative.') }),
      sort(b('Le / la / les or du / de la / des?', 'Le / la / les ou du / de la / des ?'), [b('in general: le, la, les', 'en général : le, la, les'), b('a part: du, de la, des', 'une partie : du, de la, des')], [['J’aime … chocolat.', 0], ['Je bois … eau.', 1], ['Il déteste … épinards.', 0], ['On achète … pain ?', 1], ['Elle préfère … thé vert.', 0], ['Tu veux … riz ?', 1]]),
      gap(P.complete, 'J’adore ___ cuisine italienne : ce soir, je fais ___ pâtes avec ___ sauce tomate.', ['la', 'des', 'de la']),
      dlg(b('At the restaurant', 'Au restaurant'), undefined, [['Serveur', 'm'], ['Vous', 'f']], [
        [0, 'Vous avez choisi ?', 'Have you chosen?'],
        [1, { options: ['Oui, je vais prendre du saumon avec des légumes.', 'Oui, je vais prendre le saumon de légumes.', 'Oui, je prends de saumon avec de légumes.'] }],
        [0, 'Et comme boisson ?', 'And to drink?'],
        [1, { options: ['De l’eau gazeuse, s’il vous plaît. Je ne bois pas d’alcool.', 'L’eau gazeuse. Je ne bois pas de l’alcool.', 'Du eau gazeuse. Je bois pas alcool.'] }],
      ]),
      say('J’aime beaucoup le poisson, alors je mange du saumon une fois par semaine.', 'I really like fish, so I eat salmon once a week.'),
      dict('Elle n’aime pas le café, elle boit du thé.', { voice: 'm' }),
    ],
    [
      b('aimer, adorer, détester, préférer + le / la / les (in general).', 'aimer, adorer, détester, préférer + le / la / les (en général).'),
      b('manger, boire, prendre, acheter, vouloir + du / de la / des (a part).', 'manger, boire, prendre, acheter, vouloir + du / de la / des (une partie).'),
      b('Je n’aime pas la soupe (general) ≠ Je ne mange pas de soupe (part).', 'Je n’aime pas la soupe (général) ≠ Je ne mange pas de soupe (partie).'),
    ],
    [['bio', b('organic', 'issu de l’agriculture biologique')], ['les épinards', b('spinach', 'légume vert')], ['l’eau gazeuse', b('sparkling water', 'eau avec des bulles')]],
  ),
];
