import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'You lost your bag, you need a tool whose name you don’t know, you are looking for a gift: you need to describe an object. This beginner course teaches shapes (rond, carré), sizes (grand, petit, long), materials (en bois, en métal, en plastique), colours and uses (ça sert à…, c’est un truc pour…). A survival skill when you don’t know the exact word!',
    'Vous avez perdu votre sac, vous cherchez un outil dont vous ignorez le nom, vous voulez un cadeau : il faut décrire un objet. Ce cours pour débutants enseigne les formes (rond, carré), les tailles (grand, petit, long), les matières (en bois, en métal, en plastique), les couleurs et l’usage (ça sert à…, c’est un truc pour…). Une compétence de survie quand on ne connaît pas le mot exact !',
  ),
  outcomes: [
    b('Describe shape and size', 'Décrire la forme et la taille'),
    b('Say what an object is made of', 'Dire en quoi est fait un objet'),
    b('Explain what an object is for', 'Expliquer à quoi sert un objet'),
    b('Describe a lost object', 'Décrire un objet perdu'),
  ],
};

const C = 'b-describing-objects';
export default [
  lesson(C, 1, ['shape-and-size', 'forme-et-taille'],
    b('Shape and size', 'Forme et taille'),
    b('Describe the shape and size of an object.', 'Décrire la forme et la taille d’un objet.'),
    [b('Name shapes', 'Nommer les formes'), b('Describe size', 'Décrire la taille'), b('Agree the adjectives', 'Accorder les adjectifs')],
    13,
    [
      card(b('Shape and size', 'Forme et taille'), b('Shape: **rond(e), carré(e), rectangulaire, triangulaire, ovale, pointu(e), plat(e)**. Size: **grand(e), petit(e), long(ue), court(e), large, étroit(e), lourd(e), léger(ère)**. **C’est une petite boîte carrée. · C’est un objet long et plat.**', 'Forme : **rond(e), carré(e), rectangulaire, triangulaire, ovale, pointu(e), plat(e)**. Taille : **grand(e), petit(e), long(ue), court(e), large, étroit(e), lourd(e), léger(ère)**. **C’est une petite boîte carrée. · C’est un objet long et plat.**')),
      pairs(P.match, [['rond', b('round', 'comme un cercle')], ['carré', b('square', 'quatre côtés égaux')], ['lourd', b('heavy', 'pèse beaucoup')], ['léger', b('light', 'pèse peu')]]),
      sort(b('Shape or size/weight?', 'Forme ou taille/poids ?'), [b('shape', 'forme'), b('size / weight', 'taille / poids')], [['rond', 0], ['long', 1], ['carré', 0], ['lourd', 1], ['pointu', 0], ['étroit', 1]]),
      mc(P.form, ['une table ronde et légère', 'une table rond et léger', 'une table ronde et léger', 'un table ronde et légère']),
      gap(P.complete, 'C’est une ___ (petit) boîte ___ (carré) et très ___ (léger).', ['petite', 'carrée', 'légère']),
      say('C’est une petite boîte ronde, assez légère.', 'It’s a small round box, quite light.'),
    ],
    [
      b('Shapes: rond, carré, rectangulaire, pointu, plat.', 'Formes : rond, carré, rectangulaire, pointu, plat.'),
      b('Size/weight: grand, petit, long, court, lourd, léger.', 'Taille/poids : grand, petit, long, court, lourd, léger.'),
      b('Agree with the noun: une boîte ronde, légère.', 'Accordez avec le nom : une boîte ronde, légère.'),
    ],
    [['une boîte', b('a box', 'contenant')], ['plat', b('flat', 'sans relief')], ['étroit', b('narrow', 'pas large')]],
  ),
  lesson(C, 2, ['material-and-use', 'matiere-et-usage'],
    b('Material and use', 'Matière et usage'),
    b('Say what an object is made of and what it is used for.', 'Dire en quoi est fait un objet et à quoi il sert.'),
    [b('Say the material with en', 'Dire la matière avec en'), b('Explain the use: ça sert à…', 'Expliquer l’usage : ça sert à…'), b('Describe an object without its name', 'Décrire un objet sans son nom')],
    13,
    [
      card(b('Material and use', 'Matière et usage'), b('Material: **en bois, en métal, en plastique, en verre, en cuir, en tissu, en papier, en laine**. **C’est un sac en cuir.** Use: **Ça sert à ouvrir les bouteilles. · C’est un truc pour couper le pain. · On l’utilise pour…** Don’t know the word? **C’est un objet en métal, assez petit, qui sert à…**', 'Matière : **en bois, en métal, en plastique, en verre, en cuir, en tissu, en papier, en laine**. **C’est un sac en cuir.** Usage : **Ça sert à ouvrir les bouteilles. · C’est un truc pour couper le pain. · On l’utilise pour…** Vous ignorez le mot ? **C’est un objet en métal, assez petit, qui sert à…**')),
      mc(P.choose, [b('a corkscrew (tire-bouchon)', 'un tire-bouchon'), b('a fork', 'une fourchette'), b('a key', 'une clé'), b('a pan', 'une poêle')], { fr: '« C’est un petit objet en métal, ça sert à ouvrir les bouteilles de vin. »' }),
      sort(b('Which material?', 'Quelle matière ?'), [b('en bois', 'en bois'), b('en verre', 'en verre'), b('en tissu', 'en tissu')], [['une table de cuisine', 0], ['une bouteille', 1], ['un rideau', 2], ['une chaise de jardin', 0], ['un vase', 1], ['un t-shirt', 2]]),
      dlg(b('In a hardware shop', 'Dans une quincaillerie'), undefined, [['Vendeur', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour, je peux vous aider ?', 'Hello, can I help you?'],
        [1, { options: ['Oui, je cherche un truc en métal, assez long, qui sert à accrocher les tableaux au mur.', 'Oui, un truc.', 'Je cherche, je ne sais pas.'] }],
        [0, 'Ah, un crochet ! Ou des clous, peut-être ?', 'Ah, a hook! Or nails, maybe?'],
        [1, { options: ['Oui, un crochet, c’est ça ! Merci beaucoup.', 'Non, rien.', 'Pourquoi ?'] }],
      ]),
      gap(P.complete, 'C’est un sac ___ cuir. Ça ___ à transporter un ordinateur.', ['en', 'sert']),
      say('Je cherche un objet en plastique, assez petit, qui sert à fermer les sacs.', 'I’m looking for a small plastic object used to close bags.'),
    ],
    [
      b('Material: en bois, en métal, en plastique, en verre, en cuir.', 'Matière : en bois, en métal, en plastique, en verre, en cuir.'),
      b('Use: Ça sert à + infinitive · C’est un truc pour…', 'Usage : Ça sert à + infinitif · C’est un truc pour…'),
      b('Unknown word? Describe: matière + taille + usage.', 'Mot inconnu ? Décrivez : matière + taille + usage.'),
    ],
    [['un truc', b('a thing (informal)', 'une chose')], ['accrocher', b('to hang', 'suspendre')], ['une quincaillerie', b('a hardware shop', 'magasin d’outils')]],
  ),
  lesson(C, 3, ['a-lost-object', 'un-objet-perdu'],
    b('Describing a lost object', 'Décrire un objet perdu'),
    b('Report a lost object and describe it precisely at the lost-and-found office.', 'Signaler un objet perdu et le décrire précisément au bureau des objets trouvés.'),
    [b('Say what you lost, where and when', 'Dire ce qu’on a perdu, où et quand'), b('Describe the object precisely', 'Décrire l’objet précisément'), b('Leave your contact details', 'Laisser ses coordonnées')],
    13,
    [
      card(b('Lost and found', 'Objets trouvés'), b('**J’ai perdu mon sac hier soir, dans le bus 24.** Describe: **C’est un sac à dos noir, en tissu, assez grand, avec une poche rouge devant. À l’intérieur, il y a un ordinateur et des clés.** Ask: **Est-ce que quelqu’un l’a rapporté ? · Vous pouvez m’appeler si vous le retrouvez ?**', '**J’ai perdu mon sac hier soir, dans le bus 24.** Décrire : **C’est un sac à dos noir, en tissu, assez grand, avec une poche rouge devant. À l’intérieur, il y a un ordinateur et des clés.** Demander : **Est-ce que quelqu’un l’a rapporté ? · Vous pouvez m’appeler si vous le retrouvez ?**')),
      hear('Bonjour, j’ai perdu mon parapluie ce matin, dans le métro. Il est long, bleu marine, avec un manche en bois.', b('Describe the umbrella.', 'Décrivez le parapluie.'), [b('long, navy blue, wooden handle', 'long, bleu marine, manche en bois'), b('short, red, metal handle', 'court, rouge, manche en métal'), b('small, black, plastic', 'petit, noir, en plastique'), b('long, green, leather handle', 'long, vert, manche en cuir')], { voice: 'f' }),
      dlg(b('At the lost-and-found office', 'Au bureau des objets trouvés'), undefined, [['Agent', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour, qu’est-ce que vous avez perdu ?', 'Hello, what did you lose?'],
        [1, { options: ['Mon portefeuille, hier après-midi, dans le tramway.', 'Un truc.', 'Je perdu hier.'] }],
        [0, 'Vous pouvez le décrire ?', 'Can you describe it?'],
        [1, { options: ['Il est petit, en cuir marron, et il y a ma carte d’identité à l’intérieur.', 'Il est normal.', 'Je ne sais pas.'] }],
        [0, 'Je vérifie… Oui, nous l’avons ! Vous avez une pièce d’identité ?', 'Let me check… Yes, we have it! Do you have ID?'],
      ]),
      ord(P.order, 'C’est un sac à dos noir avec une poche rouge.', { tr: 'It’s a black backpack with a red pocket.' }),
      dict('J’ai perdu mon portefeuille en cuir marron dans le bus.', {}),
      write(b('Lost object form', 'Déclaration de perte'), b('Write a short description (25–45 words) of an object you lost: what, where, when, shape, size, colour, material, what is inside.', 'Écrivez une courte description (25–45 mots) d’un objet perdu : quoi, où, quand, forme, taille, couleur, matière, contenu.'), 25, 45, [
        b('What, where, when', 'Quoi, où, quand'),
        b('Shape, size, colour, material', 'Forme, taille, couleur, matière'),
      ], 'J’ai perdu mon sac à dos lundi matin, dans le métro, ligne 2. C’est un sac assez grand, en tissu gris, avec une poche bleue devant. À l’intérieur, il y a un ordinateur et un cahier.'),
    ],
    [
      b('J’ai perdu… (où ? quand ?)', 'J’ai perdu… (où ? quand ?)'),
      b('Describe: taille, forme, couleur, matière, contenu.', 'Décrire : taille, forme, couleur, matière, contenu.'),
      b('Vous pouvez m’appeler si vous le retrouvez ?', 'Vous pouvez m’appeler si vous le retrouvez ?'),
    ],
    [['un portefeuille', b('a wallet', 'pour l’argent et les cartes')], ['un manche', b('a handle', 'partie qu’on tient')], ['une poche', b('a pocket', 'petite ouverture d’un sac')]],
  ),
];
