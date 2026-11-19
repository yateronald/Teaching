// A2 · The consonants [p], [b] and [v]: je bois / je vois, pain / bain, bague / vague.
import { ear, ex, fill, pick, situation } from '../authoring';

export default ear('pain-bain-vin', {
  rule: [
    ['Pain, bain, vin : les sons [p], [b] et [v]', 'Pain, bain, vin: the sounds [p], [b] and [v]'],
    [
      '**[p]** se fait lèvres fermées, sans vibration de la voix (__pain__, __pas__, __poire__) ; **[b]** se fait lèvres fermées, avec la vibration de la voix (__bain__, __bas__, __boire__) ; **[v]** se fait les dents du haut sur la lèvre du bas (__vin__, __va__, __voir__).\n\nChanger de son change le mot : __je bois__ / __je vois__, __un bol__ / __un vol__, __le pain__ / __le bain__, __une bague__ / __une vague__.',
      '**[p]** is made with closed lips and no voice (__pain__, __pas__, __poire__); **[b]** with closed lips and the voice on (__bain__, __bas__, __boire__); **[v]** with the top teeth on the bottom lip (__vin__, __va__, __voir__).\n\nChanging the sound changes the word: __je bois__ / __je vois__, __un bol__ / __un vol__, __le pain__ / __le bain__, __une bague__ / __une vague__.',
    ],
  ],
  goal: ['Distinguer [p], [b] et [v] dans des phrases courantes.', 'Tell [p], [b] and [v] apart in everyday sentences.'],
  examples: [
    ex('Le pain.', 'le {p}ain [p]', ['Lèvres fermées, pas de vibration.', 'Closed lips, no voice.']),
    ex('Le bain.', 'le {b}ain [b]', ['Lèvres fermées, avec la voix.', 'Closed lips, with the voice.']),
    ex('Le vin.', 'le {v}in [v]', ['Les dents sur la lèvre du bas.', 'Teeth on the bottom lip.']),
  ],
  items: [
    pick('Je bois un café.', ['Je bois un café.', 'Je vois un café.'], 0, 'Je {b}ois un café.', [
      '[bwa] : boire. « Je vois » (voir) se dit [vwa].', '[bwa]: boire (drink). « Je vois » (see) is [vwa].',
    ]),
    pick('Tu veux du pain ?', ['Tu veux du pain ?', 'Tu veux du vin ?'], 0, 'Tu veux du {p}ain ?', [
      '[pɛ̃], lèvres fermées : le pain. « Le vin » commence par [v].', '[pɛ̃], closed lips: bread. « Le vin » starts with [v].',
    ]),
    pick('Je prends un bain.', ['Je prends un bain.', 'Je prends un pain.'], 0, 'Je prends un {b}ain.', [
      '[bɛ̃] avec la voix : un bain. « Un pain » (à la boulangerie) se dit [pɛ̃].', '[bɛ̃] voiced: a bath. « Un pain » (at the bakery) is [pɛ̃].',
    ]),
    pick('C’est un beau vol.', ['C’est un beau vol.', 'C’est un beau bol.'], 0, 'C’est un beau {v}ol.', [
      '[vɔl] : un vol, en avion. « Un bol » se dit [bɔl].', '[vɔl]: a flight. « Un bol » (a bowl) is [bɔl].',
    ]),
    pick('Regarde cette bague !', ['Regarde cette bague !', 'Regarde cette vague !'], 0, 'Regarde cette {b}ague !', [
      '[bag] : une bague, au doigt. « Une vague », à la mer, se dit [vag].', '[bag]: a ring. « Une vague » (a wave) is [vag].',
    ]),
    fill('Elle boit de l’eau.', 'Elle ___ de l’eau.', 'boit', 'Elle {b}oit de l’eau.', [
      '[bwa] : le verbe boire. « Elle voit » se dirait [vwa].', '[bwa]: the verb boire. « Elle voit » would be [vwa].',
    ]),
    fill('Il faut payer à la caisse.', 'Il faut ___ à la caisse.', 'payer', 'Il faut {p}ayer à la caisse.', [
      '[peje] : payer, lèvres fermées, sans vibration.', '[peje]: payer, closed lips, no voice.',
    ]),
    fill('On va à la plage.', 'On ___ à la plage.', 'va', 'On {v}a à la plage.', [
      '[va] : le verbe aller. « Bas » se dirait [ba].', '[va]: the verb aller. « Bas » would be [ba].',
    ]),
    situation('Ce soir, on dîne chez Paul : j’apporte le pain et le vin, et toi, tu prends le dessert ?', 'Qu’apporte la personne qui parle ?', ['Le pain et le vin', 'Le dessert', 'Le vin seulement'], 0,
      'Ce soir, on dîne chez Paul : j’apporte le {p}ain et le {v}in, et toi, tu prends le dessert ?', [
        '« J’apporte le pain [p] et le vin [v] » ; le dessert, c’est pour l’autre personne.', '« J’apporte le pain [p] et le vin [v] »; the dessert is for the other person.',
      ]),
    situation('Je vois très mal sans mes lunettes, alors je bois mon café et je les cherche.', 'Que fait la personne ?', ['Elle boit son café et cherche ses lunettes.', 'Elle voit très bien.', 'Elle achète des lunettes.'], 0,
      'Je {v}ois très mal sans mes lunettes, alors je {b}ois mon café et je les cherche.', [
        '« Je vois » [vwa] puis « je bois » [bwa] : les deux verbes dans la même phrase.', '« Je vois » [vwa] then « je bois » [bwa]: both verbs in one sentence.',
      ]),
  ],
  takeaway: [
    '[p] lèvres fermées sans voix, [b] lèvres fermées avec la voix, [v] dents sur la lèvre. Je bois / je vois, pain / bain, bague / vague.',
    '[p] closed lips, no voice; [b] closed lips, voiced; [v] teeth on lip. Je bois / je vois, pain / bain, bague / vague.',
  ],
});
