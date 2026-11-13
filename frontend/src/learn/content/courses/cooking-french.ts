// Cuisiner en français (A2): grammar through recipes. Quantities and the
// partitive with crêpes, the verbs and the imperative with a vegetable soup,
// then tastes, compliments and the classics of Québec cooking.
import { b, type DialogueStep, type Doc, type Lesson, type McqStep, type T, type Voice } from '../../types';
import { card } from '../kit';

const hear = (voice: Voice, audio: string, prompt: T, options: T[], explain?: T): McqStep =>
  ({ kind: 'mcq', voice, audio, listen: true, prompt, options, answer: 0, ...(explain ? { explain } : {}) });
const q = (doc: Doc, prompt: T, options: T[], explain?: T): McqStep =>
  ({ kind: 'mcq', doc, prompt, options, answer: 0, ...(explain ? { explain } : {}) });

type Speaker = DialogueStep['speakers'][number];

const CREPES: Doc = { look: 'menu', title: b('Recipe card', 'Fiche recette'), text: 'Les crêpes de Mamie\n\nPour 12 crêpes | 15 min + 1 h de repos\nFarine | 250 g\nŒufs | 4\nLait | ½ litre\nSucre | 2 cuillères à soupe\nBeurre fondu | 50 g\nSel | 1 pincée' };
const SOUP: Doc = { look: 'page', title: b('Recipe: vegetable soup', 'Recette : soupe aux légumes'), text: 'Épluchez trois carottes et deux pommes de terre, puis coupez-les en petits morceaux. Émincez un oignon.\n\nFaites chauffer un peu d’huile dans une grande casserole et faites revenir l’oignon cinq minutes. Ajoutez les légumes et un litre de bouillon.\n\nSalez, poivrez et laissez cuire à feu doux pendant trente minutes. Mixez, puis servez bien chaud avec du pain.' };

const lessons: Lesson[] = [
  {
    id: 'cooking-french-1',
    slug: { en: 'ingredients-and-quantities', fr: 'ingredients-et-quantites' },
    title: b('Ingredients and quantities: crêpes', 'Ingrédients et quantités : les crêpes'),
    summary: b('Read a recipe card, say quantities (250 g, une pincée, une cuillère à soupe) and master du, de la, des… and de.', 'Lire une fiche recette, dire les quantités (250 g, une pincée, une cuillère à soupe) et maîtriser du, de la, des… et de.'),
    objectives: [b('Name 15 ingredients', 'Nommer 15 ingrédients'), b('Say quantities', 'Dire des quantités'), b('Use du, de la, des and de', 'Utiliser du, de la, des et de')],
    minutes: 12,
    steps: [
      card(b('In the kitchen', 'Dans la cuisine'), b('Cooking is the best French class: you read, you listen, you count and you follow instructions, and at the end you eat. Our first recipe: **les crêpes**, loved in France (on February 2nd, la Chandeleur) and in Québec, with maple syrup.', 'La cuisine est le meilleur cours de français : on lit, on écoute, on compte et on suit des instructions, et à la fin, on mange. Première recette : **les crêpes**, adorées en France (le 2 février, à la Chandeleur) et au Québec, avec du sirop d’érable.'), { image: 'cooking-crepes' }),
      { kind: 'flashcards', title: b('The ingredients', 'Les ingrédients'), cards: [
        { fr: 'la farine', tr: b('flour', 'poudre de blé pour le pain, les gâteaux') },
        { fr: 'les œufs', tr: b('eggs', 'œuf au pluriel : on ne prononce pas le f') },
        { fr: 'le lait', tr: b('milk', 'boisson blanche de la vache') },
        { fr: 'le beurre', tr: b('butter', 'matière grasse du lait') },
        { fr: 'le sucre', tr: b('sugar', 'il rend sucré') },
        { fr: 'le sel', tr: b('salt', 'il rend salé') },
        { fr: 'le sirop d’érable', tr: b('maple syrup', 'le sirop du Québec') },
        { fr: 'la cassonade', tr: b('brown sugar (Québec)', 'sucre brun ; en France, la vergeoise') },
      ] },
      q(CREPES, b('How long do you need in total?', 'Combien de temps faut-il au total ?'), [b('15 minutes, plus 1 hour of resting', '15 minutes, plus 1 heure de repos'), b('15 minutes only', '15 minutes seulement'), b('1 hour and a half of cooking', '1 h 30 de cuisson')], b('“1 h de repos”: the batter rests one hour before cooking.', '« 1 h de repos » : la pâte repose une heure avant la cuisson.')),
      q(CREPES, b('How much milk do you need?', 'Quelle quantité de lait faut-il ?'), [b('Half a litre', 'Un demi-litre'), b('Two litres', 'Deux litres'), b('250 grams', '250 grammes')]),
      card(b('Saying quantities', 'Dire les quantités'), b('After a quantity, use **de** (d’) and never the article: **250 grammes de farine, un litre de lait, une pincée de sel, deux cuillères à soupe de sucre, beaucoup d’œufs, un peu de beurre**.', 'Après une quantité, on emploie **de** (d’) et jamais l’article : **250 grammes de farine, un litre de lait, une pincée de sel, deux cuillères à soupe de sucre, beaucoup d’œufs, un peu de beurre**.'), { examples: [{ fr: 'une pincée de sel', tr: 'a pinch of salt' }, { fr: 'deux cuillères à soupe de sucre', tr: 'two tablespoons of sugar' }, { fr: 'un demi-litre de lait', tr: 'half a litre of milk' }] }),
      card(b('Du, de la, des: an unknown amount', 'Du, de la, des : une quantité inconnue'), b('When you do not say how much, use **du** (masculine), **de la** (feminine), **de l’** (before a vowel), **des** (plural): *Il faut du lait, de la farine, de l’huile et des œufs.* In the negative, they all become **de**: *Il n’y a pas de lait, pas d’œufs.*', 'Quand on ne dit pas combien, on emploie **du** (masculin), **de la** (féminin), **de l’** (devant une voyelle), **des** (pluriel) : *Il faut du lait, de la farine, de l’huile et des œufs.* À la forme négative, tous deviennent **de** : *Il n’y a pas de lait, pas d’œufs.*'), { variant: 'tip' }),
      { kind: 'fill', prompt: b('Complete the shopping list.', 'Complétez la liste de courses.'), text: 'Pour les crêpes, il faut ___ farine, ___ lait, ___ œufs et une pincée ___ sel.', answers: [['de la'], ['du'], ['des'], ['de']], choices: [['de la', 'du'], ['du', 'de la'], ['des', 'de'], ['de', 'du']], explain: b('La farine → de la; le lait → du; les œufs → des; after “une pincée” → de.', 'La farine → de la ; le lait → du ; les œufs → des ; après « une pincée » → de.') },
      { kind: 'fill', prompt: b('Oh no, the fridge is empty! Complete.', 'Oh non, le frigo est vide ! Complétez.'), text: 'Il n’y a plus ___ lait et pas ___ œufs.', answers: [['de'], ['d’', "d'"]], choices: [['de', 'du'], ['d’', 'des']], explain: b('After a negation: de / d’.', 'Après une négation : de / d’.') },
      hear('f', 'Pour douze crêpes, il faut deux cent cinquante grammes de farine et quatre œufs.', b('How much flour for twelve crêpes?', 'Combien de farine pour douze crêpes ?'), ['250 g', '200 g', '450 g']),
      { kind: 'match', prompt: b('Match each quantity.', 'Associez chaque quantité.'), pairs: [['une pincée', b('a pinch', 'très peu, entre deux doigts')], ['une cuillère à soupe', b('a tablespoon', 'une grande cuillère')], ['une cuillère à café', b('a teaspoon', 'une petite cuillère')], ['un demi-litre', b('half a litre', '500 millilitres')], ['une tasse', b('a cup (Québec)', 'environ 250 ml')]] },
      { kind: 'speak', prompt: b('Order at the market.', 'Commandez au marché.'), text: 'Je voudrais un kilo de pommes et un pot de sirop d’érable, s’il vous plaît.', tr: b('I would like a kilo of apples and a jar of maple syrup, please.', 'Je voudrais un kilo de pommes et un pot de sirop d’érable.') },
    ],
    notes: {
      points: [
        b('After a quantity: de / d’ (250 g de farine, un peu de beurre, beaucoup d’œufs).', 'Après une quantité : de / d’ (250 g de farine, un peu de beurre, beaucoup d’œufs).'),
        b('Unknown amount: du, de la, de l’, des (du lait, de la farine, de l’huile, des œufs).', 'Quantité inconnue : du, de la, de l’, des (du lait, de la farine, de l’huile, des œufs).'),
        b('Negative: pas de / pas d’ (pas de lait, pas d’œufs).', 'Négation : pas de / pas d’ (pas de lait, pas d’œufs).'),
        b('Une cuillère à soupe (tablespoon), une cuillère à café (teaspoon), une pincée (pinch).', 'Une cuillère à soupe, une cuillère à café, une pincée.'),
      ],
      vocab: [['la pâte', b('batter, dough', 'le mélange avant la cuisson')], ['fondu', b('melted', 'devenu liquide avec la chaleur')], ['le repos', b('resting time', 'le temps d’attente')], ['la Chandeleur', b('Candlemas, crêpe day (Feb. 2)', 'la fête des crêpes, le 2 février')]],
    },
  },
  {
    id: 'cooking-french-2',
    slug: { en: 'recipe-verbs-and-the-imperative', fr: 'verbes-de-cuisine-et-imperatif' },
    title: b('Recipe verbs and the imperative: a vegetable soup', 'Verbes de cuisine et impératif : une soupe aux légumes'),
    summary: b('Peel, cut, stir, simmer: the verbs of cooking, the imperative of recipes and an audio recipe to follow step by step.', 'Éplucher, couper, mélanger, laisser mijoter : les verbes de la cuisine, l’impératif des recettes et une recette audio à suivre pas à pas.'),
    objectives: [b('Understand 15 cooking verbs', 'Comprendre 15 verbes de cuisine'), b('Use the imperative', 'Utiliser l’impératif'), b('Follow a recipe you hear', 'Suivre une recette à l’oral')],
    minutes: 13,
    steps: [
      { kind: 'flashcards', title: b('The verbs of cooking', 'Les verbes de la cuisine'), cards: [
        { fr: 'éplucher', tr: b('to peel', 'enlever la peau d’un légume'), ex: 'Épluchez les carottes.' },
        { fr: 'couper', tr: b('to cut', 'faire des morceaux avec un couteau'), ex: 'Coupez les pommes de terre.' },
        { fr: 'émincer', tr: b('to slice thinly', 'couper en tranches fines'), ex: 'Émincez l’oignon.' },
        { fr: 'mélanger', tr: b('to mix, stir', 'mettre ensemble et tourner'), ex: 'Mélangez la farine et le sucre.' },
        { fr: 'verser', tr: b('to pour', 'faire couler un liquide'), ex: 'Versez le lait petit à petit.' },
        { fr: 'faire revenir', tr: b('to brown, sauté', 'cuire vite dans un peu de gras'), ex: 'Faites revenir l’oignon.' },
        { fr: 'laisser mijoter', tr: b('to simmer', 'cuire doucement longtemps'), ex: 'Laissez mijoter trente minutes.' },
        { fr: 'mixer', tr: b('to blend', 'passer au mélangeur'), ex: 'Mixez la soupe.' },
      ] },
      card(b('Recipes speak in the imperative', 'Les recettes parlent à l’impératif'), b('A recipe gives orders. Most use the **vous** imperative (**Mélangez, Versez, Faites cuire**), some the infinitive (**Mélanger, Verser**). The imperative is the present without the subject; for **tu**, -er verbs lose their **s**: *tu mélanges → mélange !*', 'Une recette donne des ordres. La plupart emploient l’impératif avec **vous** (**Mélangez, Versez, Faites cuire**), d’autres l’infinitif (**Mélanger, Verser**). L’impératif, c’est le présent sans le sujet ; avec **tu**, les verbes en -er perdent leur **s** : *tu mélanges → mélange !*'), { examples: [{ fr: 'Mélangez la farine et les œufs.', tr: 'Mix the flour and the eggs.' }, { fr: 'Mélange bien !', tr: 'Mix well! (to a friend)' }, { fr: 'Faites chauffer la poêle.', tr: 'Heat the pan.' }] }),
      { kind: 'conjugate', prompt: b('Give the imperative of “mélanger”.', 'Donnez l’impératif de « mélanger ».'), verb: 'mélanger', tense: b('imperative', 'impératif'), forms: [['(tu)', 'mélange'], ['(nous)', 'mélangeons'], ['(vous)', 'mélangez']], given: [2], explain: b('Tu mélange (no s), nous mélangeons (e to keep the soft g), vous mélangez.', 'Tu : mélange (sans s), nous : mélangeons (le e garde le g doux), vous : mélangez.') },
      { kind: 'conjugate', prompt: b('Give the imperative of “faire”.', 'Donnez l’impératif de « faire ».'), verb: 'faire', tense: b('imperative', 'impératif'), forms: [['(tu)', 'fais'], ['(nous)', 'faisons'], ['(vous)', 'faites']], given: [0] },
      q(SOUP, b('What do you do with the onion first?', 'Que faites-vous d’abord avec l’oignon ?'), [b('Slice it, then brown it in oil for five minutes', 'L’émincer, puis le faire revenir cinq minutes dans l’huile'), b('Blend it with the soup', 'Le mixer avec la soupe'), b('Boil it in the stock for thirty minutes', 'Le faire bouillir trente minutes dans le bouillon')]),
      q(SOUP, b('“Laissez cuire à feu doux”: how do you cook the soup?', '« Laissez cuire à feu doux » : comment cuisez-vous la soupe ?'), [b('On low heat, for thirty minutes', 'À feu doux, pendant trente minutes'), b('On high heat, for five minutes', 'À feu vif, pendant cinq minutes'), b('In the oven', 'Au four')], b('À feu doux = low heat; à feu vif = high heat.', 'À feu doux = chaleur faible ; à feu vif = chaleur forte.')),
      hear('m', 'Faites chauffer la poêle, versez une petite louche de pâte et laissez cuire une minute de chaque côté.', b('How long do you cook each side of the crêpe?', 'Combien de temps cuisez-vous chaque côté de la crêpe ?'), [b('One minute', 'Une minute'), b('Five minutes', 'Cinq minutes'), b('Ten seconds', 'Dix secondes')]),
      hear('f2', 'Ne mettez pas tout le lait d’un coup : versez-le petit à petit en mélangeant, sinon il y aura des grumeaux.', b('Why should you pour the milk little by little?', 'Pourquoi verser le lait petit à petit ?'), [b('To avoid lumps', 'Pour éviter les grumeaux'), b('To save milk', 'Pour économiser le lait'), b('Because the milk is hot', 'Parce que le lait est chaud')], b('“Des grumeaux” = lumps in the batter.', '« Des grumeaux » = de petites boules dans la pâte.')),
      { kind: 'categorize', prompt: b('Before or during cooking?', 'Avant ou pendant la cuisson ?'), buckets: [b('Preparation', 'Préparation'), b('Cooking', 'Cuisson')], items: [{ text: 'éplucher', bucket: 0 }, { text: 'couper', bucket: 0 }, { text: 'mélanger', bucket: 0 }, { text: 'faire revenir', bucket: 1 }, { text: 'laisser mijoter', bucket: 1 }, { text: 'faire griller', bucket: 1 }] },
      { kind: 'order', prompt: b('Build the recipe in one sentence.', 'Construisez la recette en une phrase.'), words: ['Épluchez,', 'coupez,', 'faites', 'cuire', 'et', 'servez', 'bien', 'chaud.'], tr: 'Peel, cut, cook and serve hot.' },
      { kind: 'dictation', prompt: b('Write the instruction.', 'Écrivez la consigne.'), text: 'Laissez mijoter pendant trente minutes.', voice: 'm' },
    ],
    notes: {
      points: [
        b('Recipes use the imperative (Mélangez !) or the infinitive (Mélanger).', 'Les recettes utilisent l’impératif (Mélangez !) ou l’infinitif (Mélanger).'),
        b('Imperative = present without subject; -er verbs drop the s with tu: mélange !', 'Impératif = présent sans sujet ; les verbes en -er perdent le s avec tu : mélange !'),
        b('Faire + infinitive: faire cuire, faire chauffer, faire revenir, faire griller.', 'Faire + infinitif : faire cuire, faire chauffer, faire revenir, faire griller.'),
        b('À feu doux (low heat) / à feu vif (high heat); petit à petit (little by little).', 'À feu doux / à feu vif ; petit à petit.'),
      ],
      vocab: [['la casserole', b('saucepan', 'récipient pour cuire sur le feu')], ['la poêle', b('frying pan', 'récipient plat pour les crêpes')], ['le bouillon', b('stock, broth', 'liquide parfumé pour cuire')], ['la louche', b('ladle', 'grande cuillère pour servir')], ['des grumeaux', b('lumps', 'petites boules dans une pâte')]],
    },
  },
  {
    id: 'cooking-french-3',
    slug: { en: 'at-the-table', fr: 'a-table' },
    title: b('At the table: tastes, compliments and Québec classics', 'À table : goûts, compliments et classiques du Québec'),
    summary: b('Describe a taste, compliment the cook, refuse politely, discover tourtière and pouding chômeur, and write your own recipe.', 'Décrire un goût, complimenter le cuisinier, refuser poliment, découvrir la tourtière et le pouding chômeur, et écrire votre propre recette.'),
    objectives: [b('Describe tastes', 'Décrire des goûts'), b('Compliment and refuse politely', 'Complimenter et refuser poliment'), b('Write a short recipe', 'Écrire une courte recette')],
    minutes: 13,
    steps: [
      { kind: 'flashcards', title: b('Tastes', 'Les goûts'), cards: [
        { fr: 'sucré', tr: b('sweet', 'avec du sucre'), ex: 'Ce gâteau est très sucré.' },
        { fr: 'salé', tr: b('salty, savoury', 'avec du sel'), ex: 'La soupe est un peu trop salée.' },
        { fr: 'épicé', tr: b('spicy', 'avec des épices fortes'), ex: 'J’adore la cuisine épicée.' },
        { fr: 'amer', tr: b('bitter', 'comme le café sans sucre'), ex: 'Ce chocolat est amer.' },
        { fr: 'acide', tr: b('sour', 'comme le citron'), ex: 'Le citron est acide.' },
        { fr: 'fade', tr: b('bland', 'sans goût'), ex: 'Ajoute du sel, c’est fade.' },
      ] },
      card(b('Québec classics', 'Les classiques du Québec'), b('A few dishes you will meet at every family party in Québec: **la tourtière** (a meat pie, at Christmas), **le pâté chinois** (beef, corn and mashed potatoes, like a shepherd’s pie), **la poutine** (fries, cheese curds and gravy), **le pouding chômeur** (a cake baked in maple or brown sugar syrup, born during the Great Depression), and in spring, **la cabane à sucre**.', 'Quelques plats que vous rencontrerez à chaque fête de famille au Québec : **la tourtière** (une tarte à la viande, à Noël), **le pâté chinois** (bœuf, maïs et purée), **la poutine** (frites, fromage en grains et sauce brune), **le pouding chômeur** (un gâteau cuit dans un sirop d’érable ou de cassonade, né pendant la Grande Dépression), et au printemps, **la cabane à sucre**.'), { variant: 'culture', image: 'cooking-table' }),
      { kind: 'match', prompt: b('Match each Québec dish with its description.', 'Associez chaque plat québécois à sa description.'), pairs: [['la poutine', b('fries, cheese curds, gravy', 'frites, fromage en grains, sauce')], ['le pâté chinois', b('beef, corn, mashed potatoes', 'bœuf, maïs, purée')], ['la tourtière', b('meat pie', 'tarte à la viande')], ['le pouding chômeur', b('cake in maple syrup', 'gâteau au sirop')]] },
      card(b('At a dinner: what to say', 'Pendant un repas : quoi dire'), b('**Compliments**: *Ça sent bon ! C’est délicieux ! Tu me donneras la recette ?* **Accepting more**: *J’en reprendrais bien un peu.* **Refusing politely**: *Non merci, je n’ai plus faim, c’était excellent.* **Allergies**: *Je suis allergique aux arachides* (Québec) / *aux cacahuètes* (France).', '**Compliments** : *Ça sent bon ! C’est délicieux ! Tu me donneras la recette ?* **Accepter** : *J’en reprendrais bien un peu.* **Refuser poliment** : *Non merci, je n’ai plus faim, c’était excellent.* **Allergies** : *Je suis allergique aux arachides* (Québec) / *aux cacahuètes* (France).'), { variant: 'tip' }),
      {
        kind: 'dialogue',
        title: b('Dinner at Nathalie’s', 'Dîner chez Nathalie'),
        scene: b('Your colleague has invited you for a Québec dinner.', 'Votre collègue vous a invité à un souper québécois.'),
        speakers: [{ name: 'Nathalie', voice: 'f', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }] as Speaker[],
        lines: [
          { s: 0, fr: 'Entre, entre ! J’ai fait une tourtière et un pouding chômeur.', tr: 'Come in, come in! I made a tourtière and a pouding chômeur.' },
          { s: 1, choose: { options: ['Mmm, ça sent bon ! Merci de m’avoir invité.', 'Je n’aime pas la viande, désolé.', 'C’est quoi, une tourtière ? Ça a l’air bizarre.'], answer: 0, explain: b('Start with a compliment and a thank-you.', 'Commencez par un compliment et un remerciement.') } },
          { s: 0, fr: 'Alors, la tourtière, elle est bonne ?', tr: 'So, is the tourtière good?' },
          { s: 1, choose: { options: ['Elle est délicieuse ! Tu me donneras la recette ?', 'Elle est fade, il manque du sel.', 'Bof, ça va.'], answer: 0 } },
          { s: 0, fr: 'Avec plaisir ! Tu en reprends un morceau ?', tr: 'With pleasure! Would you like another piece?' },
          { s: 1, choose: { options: ['Non merci, je n’ai plus faim. Je garde de la place pour le dessert !', 'Non, c’est trop mauvais.', 'Oui, donne-moi tout le plat.'], answer: 0, explain: b('A polite refusal with a smile: you keep room for dessert.', 'Un refus poli avec le sourire : vous gardez de la place pour le dessert.') } },
        ],
      },
      hear('f', 'Attention, c’est chaud ! Et c’est un peu sucré, c’est du sirop d’érable.', b('What does Nathalie warn you about?', 'De quoi Nathalie vous prévient-elle ?'), [b('It is hot and a little sweet', 'C’est chaud et un peu sucré'), b('It is spicy', 'C’est épicé'), b('It is salty and cold', 'C’est salé et froid')]),
      { kind: 'fill', prompt: b('Complete the compliments.', 'Complétez les compliments.'), text: 'Ça ___ bon ! C’est ___ ! J’en ___ bien un peu.', answers: [['sent'], ['délicieux'], ['reprendrais']], choices: [['sent', 'sens'], ['délicieux', 'délicieuse'], ['reprendrais', 'reprends']], explain: b('Ça sent (il form); “c’est” + masculine adjective; the conditional (reprendrais) is polite.', 'Ça sent ; « c’est » + adjectif au masculin ; le conditionnel (reprendrais) est poli.') },
      { kind: 'write', prompt: b('Write your favourite recipe.', 'Écrivez votre recette préférée.'), task: b('In 40 to 70 words, give the ingredients (with quantities) and the steps of a dish from your country. Use the imperative with vous.', 'En 40 à 70 mots, donnez les ingrédients (avec les quantités) et les étapes d’un plat de votre pays. Utilisez l’impératif avec vous.'), min: 40, max: 70, checklist: [b('Ingredients with quantities (de)', 'Ingrédients avec quantités (de)'), b('At least four verbs in the imperative', 'Au moins quatre verbes à l’impératif'), b('Cooking time', 'Temps de cuisson')], phrases: ['Pour quatre personnes, il faut…', 'Coupez…', 'Faites cuire…', 'Servez avec…'], model: 'Le riz au poulet de ma mère. Pour quatre personnes, il faut 300 g de riz, quatre morceaux de poulet, deux oignons, trois tomates et un peu d’huile. Coupez les oignons et les tomates. Faites revenir le poulet dans l’huile, puis ajoutez les légumes. Versez un demi-litre d’eau, ajoutez le riz et laissez cuire vingt minutes à feu doux. Servez bien chaud.' },
    ],
    notes: {
      points: [
        b('Tastes: sucré, salé, épicé, amer, acide, fade.', 'Goûts : sucré, salé, épicé, amer, acide, fade.'),
        b('Compliments: ça sent bon, c’est délicieux, tu me donneras la recette ?', 'Compliments : ça sent bon, c’est délicieux, tu me donneras la recette ?'),
        b('Refuse politely: non merci, je n’ai plus faim, c’était excellent.', 'Refuser poliment : non merci, je n’ai plus faim, c’était excellent.'),
        b('Québec: tourtière, pâté chinois, poutine, pouding chômeur; le souper = dinner.', 'Québec : tourtière, pâté chinois, poutine, pouding chômeur ; le souper = le repas du soir.'),
      ],
      vocab: [['reprendre', b('to have some more', 'se servir une deuxième fois')], ['le souper', b('dinner (Québec)', 'le repas du soir au Québec')], ['les arachides', b('peanuts (Québec)', 'les cacahuètes en France')], ['la cabane à sucre', b('sugar shack', 'lieu où l’on fait le sirop d’érable')]],
    },
  },
];

export default lessons;
