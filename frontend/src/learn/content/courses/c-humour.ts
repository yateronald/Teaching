import type { CourseAbout } from '../../types';
import { b, card, dlg, hear, lesson, mc, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Humour is the last frontier of a foreign language: understanding a joke, laughing at the right moment, teasing a friend without hurting them. This course explores French conversational humour: irony and understatement (pas mal, ce n’est pas terrible), self-mockery, friendly teasing, wordplay, and the phrases to react, play along or signal that you were only joking.',
    'L’humour est la dernière frontière d’une langue étrangère : comprendre une blague, rire au bon moment, taquiner un ami sans le blesser. Ce cours explore l’humour de la conversation française : ironie et litote (pas mal, ce n’est pas terrible), autodérision, taquinerie amicale, jeux de mots, et les formules pour réagir, entrer dans le jeu ou signaler que vous plaisantiez.',
  ),
  outcomes: [
    b('Recognise irony and understatement', 'Reconnaître l’ironie et la litote'),
    b('Use self-mockery', 'Pratiquer l’autodérision'),
    b('Tease and react to teasing', 'Taquiner et réagir à la taquinerie'),
    b('Signal that you are joking', 'Signaler que vous plaisantez'),
  ],
};

const C = 'c-humour';
export default [
  lesson(C, 1, ['irony-and-understatement', 'ironie-et-litote'],
    b('Irony and understatement', 'L’ironie et la litote'),
    b('Understand when French speakers say less, or the opposite, of what they mean.', 'Comprendre quand les francophones disent moins, ou le contraire, de ce qu’ils pensent.'),
    [b('Decode understatement (litote)', 'Décoder la litote'), b('Recognise irony', 'Reconnaître l’ironie'), b('Read the tone', 'Lire le ton')],
    13,
    [
      card(b('Saying less to mean more', 'Dire moins pour dire plus'), b('Litote: **« Ce n’est pas mal »** = it’s good. **« Il n’est pas bête »** = he’s clever. **« Ce n’est pas terrible »** = it’s rather bad. Irony (the opposite): **« Super, il pleut encore ! »** · **« Bravo, quelle organisation ! »** after a disaster.', 'Litote : **« Ce n’est pas mal »** = c’est bien. **« Il n’est pas bête »** = il est intelligent. **« Ce n’est pas terrible »** = c’est plutôt mauvais. Ironie (le contraire) : **« Super, il pleut encore ! »** · **« Bravo, quelle organisation ! »** après une catastrophe.')),
      mc(P.meaning, [b('The film was rather bad.', 'Le film était plutôt mauvais.'), b('The film was terrifying.', 'Le film faisait très peur.'), b('The film was excellent.', 'Le film était excellent.'), b('The film was too long.', 'Le film était trop long.')], { fr: '« Le film ? Bof, ce n’était pas terrible. »' }),
      mc(P.meaning, [b('He is really happy with the result.', 'Il est vraiment content du résultat.'), b('He hates the dish.', 'Il déteste le plat.'), b('He thinks it is too expensive.', 'Il trouve ça trop cher.'), b('He has not tasted it yet.', 'Il n’a pas encore goûté.')], { fr: 'Après avoir goûté, avec un grand sourire : « Hmm, pas mal du tout, ton gâteau ! »' }),
      hear('Ah ben, bravo ! On a attendu le bus quarante minutes sous la pluie, et il passe devant nous sans s’arrêter. Génial, vraiment, quelle belle journée !', b('How does the speaker really feel?', 'Que ressent vraiment la personne ?'), [b('annoyed (she is being ironic)', 'agacée (elle est ironique)'), b('delighted with her day', 'ravie de sa journée'), b('grateful to the driver', 'reconnaissante envers le chauffeur'), b('indifferent', 'indifférente')], { voice: 'f' }),
      sort(b('Positive or negative meaning?', 'Sens positif ou négatif ?'), [b('really positive', 'vraiment positif'), b('really negative', 'vraiment négatif')], [['Ce n’est pas mal.', 0], ['Ce n’est pas terrible.', 1], ['Il n’est pas bête.', 0], ['Super, encore une panne !', 1], ['Je ne dis pas non.', 0], ['Bravo, quelle organisation ! (après un désastre)', 1]]),
      pairs(P.match, [['une litote', b('an understatement', 'dire moins pour dire plus')], ['pas terrible', b('not great', 'plutôt mauvais')], ['Je ne dis pas non.', b('I won’t say no. (= yes)', 'j’accepte volontiers')], ['pas bête', b('clever, a good idea', 'intelligent')]]),
      say('Pas mal du tout, ton idée. Franchement, je ne dis pas non !', 'Not bad at all, your idea. Honestly, I won’t say no!'),
    ],
    [
      b('Litote: pas mal = good; pas terrible = bad; pas bête = clever.', 'Litote : pas mal = bien ; pas terrible = mauvais ; pas bête = intelligent.'),
      b('Irony: the words say the opposite (Super, il pleut !).', 'Ironie : les mots disent le contraire (Super, il pleut !).'),
      b('Tone and context tell you which.', 'Le ton et le contexte vous le disent.'),
    ],
    [['goûter', b('to taste', 'essayer un aliment')], ['une panne', b('a breakdown', 'arrêt de fonctionnement')], ['franchement', b('honestly', 'sincèrement')]],
  ),
  lesson(C, 2, ['self-mockery-and-teasing', 'autoderision-et-taquinerie'],
    b('Self-mockery and friendly teasing', 'Autodérision et taquinerie'),
    b('Laugh at yourself, tease a friend kindly and react when you are teased.', 'Rire de soi, taquiner gentiment un ami et réagir quand on vous taquine.'),
    [b('Laugh at yourself', 'Rire de soi'), b('Tease without hurting', 'Taquiner sans blesser'), b('Play along', 'Entrer dans le jeu')],
    13,
    [
      card(b('Self-mockery', 'L’autodérision'), b('**Moi et la cuisine, ça fait deux !** · **Je suis nul(le) en orientation, je me perdrais dans mon propre salon.** · **Moi, je suis toujours à l’heure… enfin, à l’heure d’après !** Self-mockery is very appreciated: it shows you don’t take yourself too seriously.', '**Moi et la cuisine, ça fait deux !** · **Je suis nul(le) en orientation, je me perdrais dans mon propre salon.** · **Moi, je suis toujours à l’heure… enfin, à l’heure d’après !** L’autodérision est très appréciée : elle montre qu’on ne se prend pas trop au sérieux.')),
      card(b('Teasing and playing along', 'Taquiner et entrer dans le jeu'), b('Tease: **Alors, champion, encore en retard ?** · **Tu as dormi dans ta voiture ou quoi ?** Play along: **Eh oui, que veux-tu, on ne se refait pas !** · **Touché !** · **Très drôle…** (mock offended)', 'Taquiner : **Alors, champion, encore en retard ?** · **Tu as dormi dans ta voiture ou quoi ?** Entrer dans le jeu : **Eh oui, que veux-tu, on ne se refait pas !** · **Touché !** · **Très drôle…** (faussement vexé)')),
      mc(P.meaning, [b('I’m really bad at cooking.', 'Je suis vraiment nul en cuisine.'), b('I cook for two people.', 'Je cuisine pour deux.'), b('I love cooking.', 'J’adore cuisiner.'), b('I have two kitchens.', 'J’ai deux cuisines.')], { fr: '« Moi et la cuisine, ça fait deux ! »' }),
      mc(P.best, ['Eh oui, que veux-tu, on ne se refait pas ! Mais j’ai apporté les croissants.', 'Ce n’est pas drôle, tu es méchant.', 'Je vais me plaindre aux ressources humaines.', 'Je ne te parle plus.'], { fr: 'Votre collègue vous taquine : « Alors, champion, encore en retard ? »' }),
      trap(b('Teasing has limits', 'La taquinerie a ses limites'), b('Tease about **small habits** (being late, a funny hat), never about **appearance, origin, accent or weight**. With people you don’t know well, prefer self-mockery.', 'Taquinez sur de **petites habitudes** (le retard, un drôle de chapeau), jamais sur **le physique, l’origine, l’accent ou le poids**. Avec des gens que vous connaissez peu, préférez l’autodérision.')),
      pairs(P.match, [['ça fait deux', b('they don’t go together', 'incompatibles')], ['On ne se refait pas.', b('You can’t change who you are.', 'je suis comme ça')], ['Touché !', b('Fair point! (you got me)', 'tu as raison')], ['vexé', b('offended', 'blessé dans son orgueil')]]),
      say('Moi et le bricolage, ça fait deux ! La dernière fois, j’ai monté l’armoire à l’envers.', 'DIY and I don’t mix! Last time I built the wardrobe upside down.'),
    ],
    [
      b('Self-mockery: Moi et…, ça fait deux ! It is well received.', 'Autodérision : Moi et…, ça fait deux ! Elle est bien reçue.'),
      b('Play along: On ne se refait pas ! Touché ! Très drôle…', 'Entrer dans le jeu : On ne se refait pas ! Touché ! Très drôle…'),
      b('Never tease about appearance, origin or accent.', 'Ne taquinez jamais sur le physique, l’origine ou l’accent.'),
    ],
    [['l’orientation', b('sense of direction', 'savoir où on est')], ['une armoire', b('a wardrobe', 'meuble pour les vêtements')], ['à l’envers', b('upside down, inside out', 'dans le mauvais sens')]],
  ),
  lesson(C, 3, ['wordplay-and-just-kidding', 'jeux-de-mots-et-je-plaisante'],
    b('Wordplay, and « I’m just kidding »', 'Les jeux de mots et « je plaisante »'),
    b('Enjoy simple puns, signal a joke and repair a joke that fell flat.', 'Apprécier les jeux de mots simples, signaler une blague et rattraper une blague ratée.'),
    [b('Understand a simple pun', 'Comprendre un jeu de mots simple'), b('Signal that you are joking', 'Signaler que vous plaisantez'), b('Repair a misunderstood joke', 'Rattraper une blague mal comprise')],
    13,
    [
      card(b('Puns', 'Les jeux de mots'), b('French loves puns based on sounds: shop names like a hairdresser called **« Hair du temps »** (= l’air du temps). A classic: **« Quel est le comble pour un électricien ? Ne pas être au courant. »** (courant = electric current / to be aware). React: **Elle est bonne ! Ha, je ne l’avais pas vue venir !** or **Oh là là, elle est nulle !** (groan)', 'Le français adore les jeux de mots sonores : un salon de coiffure appelé **« Hair du temps »** (= l’air du temps). Un classique : **« Quel est le comble pour un électricien ? Ne pas être au courant. »** Réagir : **Elle est bonne ! Ha, je ne l’avais pas vue venir !** ou **Oh là là, elle est nulle !** (grognement amusé)')),
      card(b('Just kidding', 'Je plaisante'), b('**Je plaisante !** · **Je rigole !** · **C’est pour rire !** · **Je te taquine.** If a joke falls flat: **Pardon, c’était maladroit.** · **Je ne voulais pas te vexer, c’était de l’humour.**', '**Je plaisante !** · **Je rigole !** · **C’est pour rire !** · **Je te taquine.** Si une blague tombe à plat : **Pardon, c’était maladroit.** · **Je ne voulais pas te vexer, c’était de l’humour.**')),
      mc(P.meaning, [b('« Au courant » means both « aware » and « connected to the electric current ».', '« Au courant » veut dire à la fois « informé » et « relié au courant électrique ».'), b('Electricians never know the news.', 'Les électriciens ne connaissent jamais les nouvelles.'), b('Electricians work without electricity.', 'Les électriciens travaillent sans électricité.'), b('It is a real job requirement.', 'C’est une vraie exigence du métier.')], { fr: '« Le comble pour un électricien ? Ne pas être au courant. » Pourquoi c’est drôle ?' }),
      mc(P.best, ['Pardon, c’était maladroit. Je ne voulais pas te vexer, je plaisantais.', 'Tu n’as pas d’humour.', 'C’était drôle, pourtant.', 'Bon, tant pis pour toi.'], { fr: 'Votre blague a vexé votre amie :' }),
      dlg(b('A joke at dinner', 'Une blague au dîner'), undefined, [['Bastien', 'm'], ['Vous', 'f']], [
        [0, 'Tu sais pourquoi les plongeurs plongent toujours en arrière ?', 'Do you know why divers always dive backwards?'],
        [1, { options: ['Non, pourquoi ?', 'Je m’en fiche.', 'Parce que c’est la loi.'] }],
        [0, 'Parce que sinon, ils tombent dans le bateau !', 'Because otherwise they’d fall into the boat!'],
        [1, { options: ['Ha ha, elle est nulle… mais elle m’a fait rire !', 'Ce n’est pas logique.', 'Je ne comprends pas, tu peux expliquer en détail ?'] }],
      ]),
      pairs(P.match, [['Je rigole !', b('Just kidding!', 'je plaisante')], ['tomber à plat', b('to fall flat', 'ne faire rire personne')], ['maladroit', b('clumsy, awkward', 'pas habile')], ['le comble', b('the height of (irony)', 'le summum')]]),
      say('Je plaisante, hein ! Je te taquine, c’était pour rire.', 'I’m kidding, OK! I’m teasing you, it was just for fun.'),
    ],
    [
      b('Puns play on sounds and double meanings.', 'Les jeux de mots jouent sur les sons et les doubles sens.'),
      b('Signal: Je plaisante ! Je rigole ! C’est pour rire !', 'Signaler : Je plaisante ! Je rigole ! C’est pour rire !'),
      b('Repair: Pardon, c’était maladroit, je ne voulais pas te vexer.', 'Rattraper : Pardon, c’était maladroit, je ne voulais pas te vexer.'),
    ],
    [['un plongeur', b('a diver', 'personne qui plonge')], ['une blague', b('a joke', 'histoire drôle')], ['plaisanter', b('to joke', 'dire pour rire')]],
  ),
];
