import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'colors-clothes-1',
    slug: { en: 'colours', fr: 'les-couleurs' },
    title: b('Colours and how they agree', 'Les couleurs et leur accord'),
    summary: b('Name the colours and make them agree with the noun: un pull vert, une robe verte.', 'Nommer les couleurs et les accorder avec le nom : un pull vert, une robe verte.'),
    objectives: [b('Name twelve colours', 'Nommer douze couleurs'), b('Place the colour after the noun', 'Placer la couleur après le nom'), b('Make colours agree in gender and number', 'Accorder les couleurs en genre et en nombre')],
    minutes: 12,
    steps: [
      { kind: 'flashcards', title: b('Colours', 'Les couleurs'), cards: [{ fr: 'rouge', tr: 'red' }, { fr: 'bleu', tr: 'blue' }, { fr: 'vert', tr: 'green' }, { fr: 'jaune', tr: 'yellow' }, { fr: 'noir', tr: 'black' }, { fr: 'blanc', tr: 'white' }, { fr: 'gris', tr: 'grey' }, { fr: 'rose', tr: 'pink' }, { fr: 'marron', tr: 'brown' }, { fr: 'orange', tr: 'orange' }] },
      card(b('After the noun, and it agrees', 'Après le nom, et elle s’accorde'), b('The colour comes **after** the noun: une voiture **rouge**. It agrees: add **-e** for feminine, **-s** for plural: un pull **vert**, une jupe **verte**, des chaussures **vertes**. **Blanc → blanche**. Colours ending in -e do not change in the feminine: rouge, jaune, rose.', 'La couleur se place **après** le nom : une voiture **rouge**. Elle s’accorde : **-e** au féminin, **-s** au pluriel : un pull **vert**, une jupe **verte**, des chaussures **vertes**. **Blanc → blanche**. Les couleurs en -e ne changent pas au féminin : rouge, jaune, rose.'), {
        examples: [{ fr: 'un pull vert, une robe verte', tr: 'a green jumper, a green dress' }, { fr: 'un chat noir, une voiture noire', tr: 'a black cat, a black car' }, { fr: 'un mur blanc, une maison blanche', tr: 'a white wall, a white house' }],
      }),
      card(b('Two exceptions: orange and marron', 'Deux exceptions : orange et marron'), b('**Orange** and **marron** never change: des chaussures **marron**, une veste **orange**. They come from nouns (the fruit, the chestnut).', '**Orange** et **marron** sont invariables : des chaussures **marron**, une veste **orange**. Ce sont d’anciens noms (le fruit, la châtaigne).'), { variant: 'trap' }),
      pick('A1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['verte', 'vert', 'verts', 'vertes'], { fr: 'J’ai une voiture ___.' }),
      pick('A1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['blanche', 'blanc', 'blance', 'blanches'], { fr: 'Elle porte une chemise ___.' }),
      pick('A1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['marron', 'marrons', 'marronnes', 'marronne'], { fr: 'Il a des chaussures ___.' }),
      { kind: 'fill', prompt: b('Write the colour with the right ending.', 'Écrivez la couleur avec la bonne terminaison.'), text: 'Des fleurs ___ (bleu) et une table ___ (noir).', answers: [['bleues'], ['noire']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Ma couleur préférée, c’est le bleu.', tr: 'My favourite colour is blue.' },
    ],
    notes: {
      points: [
        b('The colour comes after the noun: une voiture rouge.', 'La couleur se place après le nom : une voiture rouge.'),
        b('Agreement: + e (feminine), + s (plural): vert, verte, verts, vertes.', 'Accord : + e (féminin), + s (pluriel) : vert, verte, verts, vertes.'),
        b('Blanc → blanche. Colours in -e (rouge, jaune, rose) do not change in the feminine.', 'Blanc → blanche. Les couleurs en -e (rouge, jaune, rose) ne changent pas au féminin.'),
        b('Orange and marron never change.', 'Orange et marron sont invariables.'),
      ],
      vocab: [['la couleur', b('colour', 'teinte')], ['préféré', b('favourite', 'qu’on aime le plus')], ['clair / foncé', b('light / dark', 'pâle / sombre')], ['la fleur', b('flower', 'plante colorée')]],
    },
  },
  {
    id: 'colors-clothes-2',
    slug: { en: 'clothes', fr: 'les-vetements' },
    title: b('Clothes and what you wear', 'Les vêtements et ce que vous portez'),
    summary: b('Name everyday clothes and say what you wear with porter and mettre.', 'Nommer les vêtements du quotidien et dire ce que vous portez avec porter et mettre.'),
    objectives: [b('Name fifteen clothes and accessories', 'Nommer quinze vêtements et accessoires'), b('Use porter and mettre', 'Employer porter et mettre'), b('Describe an outfit', 'Décrire une tenue')],
    minutes: 13,
    steps: [
      { kind: 'flashcards', title: b('Clothes', 'Les vêtements'), cards: [{ fr: 'un pantalon', tr: 'trousers' }, { fr: 'une chemise', tr: 'a shirt' }, { fr: 'un t-shirt', tr: 'a T-shirt' }, { fr: 'une robe', tr: 'a dress' }, { fr: 'une jupe', tr: 'a skirt' }, { fr: 'un pull', tr: 'a jumper' }, { fr: 'une veste', tr: 'a jacket' }, { fr: 'un manteau', tr: 'a coat' }, { fr: 'des chaussures', tr: 'shoes' }, { fr: 'des bottes', tr: 'boots' }, { fr: 'une tuque', tr: 'a winter hat (Québec)' }, { fr: 'des gants', tr: 'gloves' }] },
      card(b('Porter and mettre', 'Porter et mettre'), b('**Porter** = to wear (a state): Elle **porte** une robe rouge. **Mettre** = to put on (an action): Je **mets** mon manteau, il fait froid. Mettre is irregular: je mets, tu mets, il met, nous mettons, vous mettez, ils mettent.', '**Porter** = avoir sur soi (un état) : Elle **porte** une robe rouge. **Mettre** = enfiler (une action) : Je **mets** mon manteau, il fait froid. Mettre est irrégulier : je mets, tu mets, il met, nous mettons, vous mettez, ils mettent.'), {
        examples: [{ fr: 'Aujourd’hui, je porte un jean et un pull gris.', tr: 'Today I am wearing jeans and a grey jumper.' }, { fr: 'Mets ta tuque, il fait moins dix !', tr: 'Put your hat on, it’s minus ten!' }],
      }),
      { kind: 'categorize', prompt: b('Summer or winter?', 'Été ou hiver ?'), buckets: [b('Summer', 'Été'), b('Winter', 'Hiver')], items: [{ text: 'un short', bucket: 0 }, { text: 'un manteau', bucket: 1 }, { text: 'des sandales', bucket: 0 }, { text: 'des gants', bucket: 1 }, { text: 'un t-shirt', bucket: 0 }, { text: 'une tuque', bucket: 1 }] },
      pick('A1', b('Choose the right verb.', 'Choisissez le bon verbe.'), ['mets', 'porte', 'mettre', 'portes'], { fr: 'Il fait froid : je ___ mon manteau.' }),
      pick('A1', b('Choose the right article.', 'Choisissez le bon article.'), ['une', 'un', 'des', 'le'], { fr: 'Elle porte ___ jupe noire.' }),
      pick('A1', b('What do you wear on your feet?', 'Que portez-vous aux pieds ?'), [b('des chaussures', 'des chaussures'), b('une chemise', 'une chemise'), b('une tuque', 'une tuque'), b('un pull', 'un pull')]),
      { kind: 'order', prompt: b('Build the sentence.', 'Construisez la phrase.'), words: ['Il', 'porte', 'une', 'chemise', 'blanche', 'et', 'un', 'pantalon', 'bleu.'], tr: 'He is wearing a white shirt and blue trousers.' },
      { kind: 'speak', prompt: b('Describe your outfit aloud.', 'Décrivez votre tenue à voix haute.'), text: 'Aujourd’hui, je porte un jean et un pull gris.', tr: 'Today I am wearing jeans and a grey jumper.' },
    ],
    notes: {
      points: [
        b('Porter = to wear (state). Mettre = to put on (action).', 'Porter = avoir sur soi (état). Mettre = enfiler (action).'),
        b('Mettre: je mets, tu mets, il met, nous mettons, vous mettez, ils mettent.', 'Mettre : je mets, tu mets, il met, nous mettons, vous mettez, ils mettent.'),
        b('Learn each item with its article: une chemise, un pantalon (singular in French!).', 'Apprenez chaque vêtement avec son article : une chemise, un pantalon (singulier en français !).'),
        b('Québec: une tuque (winter hat), des bottes d’hiver.', 'Québec : une tuque (bonnet), des bottes d’hiver.'),
      ],
      vocab: [['un jean', b('jeans', 'pantalon en toile')], ['la tenue', b('outfit', 'les vêtements portés')], ['un short', b('shorts', 'pantalon court')], ['des sandales', b('sandals', 'chaussures d’été')]],
    },
  },
  {
    id: 'colors-clothes-3',
    slug: { en: 'buying-clothes', fr: 'acheter-des-vetements' },
    title: b('Buying clothes in a shop', 'Acheter des vêtements en magasin'),
    summary: b('Ask for a size, try something on, ask the price and pay.', 'Demander une taille, essayer un vêtement, demander le prix et payer.'),
    objectives: [b('Ask for a size and a colour', 'Demander une taille et une couleur'), b('Try on and give your opinion', 'Essayer et donner son avis'), b('Ask the price and pay', 'Demander le prix et payer')],
    minutes: 13,
    steps: [
      card(b('In the shop', 'Au magasin'), b('Useful phrases: **Je cherche…** (I’m looking for), **Vous l’avez en 40 / en bleu ?**, **Je peux l’essayer ?**, **Où sont les cabines ?**, **C’est trop grand / petit**, **Ça me va bien**, **Je le prends**.', 'Tournures utiles : **Je cherche…**, **Vous l’avez en 40 / en bleu ?**, **Je peux l’essayer ?**, **Où sont les cabines ?**, **C’est trop grand / petit**, **Ça me va bien**, **Je le prends**.'), {
        examples: [{ fr: 'Bonjour, je cherche une veste pour l’hiver.', tr: 'Hello, I’m looking for a winter jacket.' }, { fr: 'Vous l’avez en taille moyenne ?', tr: 'Do you have it in medium?' }, { fr: 'Je peux l’essayer ?', tr: 'Can I try it on?' }, { fr: 'C’est un peu grand. Vous avez la taille en dessous ?', tr: 'It’s a bit big. Do you have the size below?' }],
      }),
      { kind: 'dialogue', title: b('Buying a jacket', 'Acheter une veste'), scene: b('Choose the client’s best reply.', 'Choisissez la meilleure réponse de la cliente.'), speakers: [{ name: 'Vendeur', voice: 'm', side: 'l' }, { name: 'Cliente', voice: 'f', side: 'r' }], lines: [
        { s: 0, fr: 'Bonjour, je peux vous aider ?', tr: 'Hello, can I help you?' },
        { s: 1, choose: { options: ['Oui, je cherche une veste noire, en taille moyenne.', 'Oui, je cherche.', 'Une veste.'], answer: 0 } },
        { s: 0, fr: 'Voilà. Les cabines sont au fond.', tr: 'Here you are. The fitting rooms are at the back.' },
        { s: 1, fr: 'Elle me va très bien ! Elle coûte combien ?', tr: 'It suits me very well! How much is it?' },
        { s: 0, fr: 'Quatre-vingt-neuf dollars. Elle est en solde aujourd’hui.', tr: 'Eighty-nine dollars. It’s on sale today.' },
        { s: 1, choose: { options: ['Parfait, je la prends. Je peux payer par carte ?', 'D’accord, au revoir.', 'Je prends le vendeur.'], answer: 0 } },
      ] },
      pick('A1', b('The jacket is too small. You say:', 'La veste est trop petite. Vous dites :'), ['Vous avez la taille au-dessus ?', 'Vous avez la taille en dessous ?', 'Elle me va très bien.', 'Je la prends.']),
      pick('A1', b('How do you ask to try something on?', 'Comment demander à essayer un vêtement ?'), ['Je peux l’essayer ?', 'Je peux l’acheter ?', 'Je peux le porter ?', 'Je peux le payer ?']),
      pick('A1', b('“Ça me va bien” means…', '« Ça me va bien » signifie…'), [b('it suits me', 'le vêtement me plaît sur moi'), b('I am going well', 'je vais bien'), b('it is too big', 'c’est trop grand'), b('I am leaving', 'je pars')]),
      { kind: 'fill', prompt: b('Complete the request.', 'Complétez la demande.'), text: 'Bonjour, je ___ un pantalon noir. Vous l’avez ___ 38 ?', answers: [['cherche'], ['en']], choices: [['cherche', 'trouve', 'porte'], ['en', 'à', 'de']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Parfait, je la prends. Je peux payer par carte ?', tr: 'Perfect, I’ll take it. Can I pay by card?' },
    ],
    notes: {
      points: [
        b('Je cherche… / Vous l’avez en 40, en bleu ?', 'Je cherche… / Vous l’avez en 40, en bleu ?'),
        b('Je peux l’essayer ? Où sont les cabines (d’essayage) ?', 'Je peux l’essayer ? Où sont les cabines (d’essayage) ?'),
        b('Ça me va (bien) = it suits me. C’est trop grand / petit.', 'Ça me va (bien). C’est trop grand / petit.'),
        b('Je le / la prends = I’ll take it. Je peux payer par carte ?', 'Je le / la prends. Je peux payer par carte ?'),
      ],
      vocab: [['la taille', b('size (clothes)', 'mesure d’un vêtement')], ['la pointure', b('shoe size', 'taille des chaussures')], ['essayer', b('to try on', 'mettre pour voir')], ['en solde', b('on sale', 'à prix réduit')], ['la cabine', b('fitting room', 'pièce pour essayer')]],
    },
  },
];

export default lessons;
