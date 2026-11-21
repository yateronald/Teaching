import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Do you have a pet? Do you like walking in the forest? This beginner course gives you the words for animals (pets, farm animals, wild animals), for nature (the park, the forest, the mountains, the sea) and the simple structures to talk about them: j’ai un chien, il y a des arbres, j’aime me promener au bord du lac. Lots of pictures, audio and short dialogues.',
    'Vous avez un animal de compagnie ? Vous aimez marcher en forêt ? Ce cours pour débutants vous donne les mots des animaux (de compagnie, de la ferme, sauvages), de la nature (le parc, la forêt, la montagne, la mer) et les structures simples pour en parler : j’ai un chien, il y a des arbres, j’aime me promener au bord du lac. Beaucoup d’audio et de courts dialogues.',
  ),
  outcomes: [
    b('Name common animals', 'Nommer les animaux courants'),
    b('Talk about your pet', 'Parler de son animal de compagnie'),
    b('Describe a place in nature', 'Décrire un lieu dans la nature'),
    b('Say what you like doing outdoors', 'Dire ce qu’on aime faire dehors'),
  ],
};

const C = 'b-animals-nature';
export default [
  lesson(C, 1, ['pets', 'les-animaux-de-compagnie'],
    b('Pets', 'Les animaux de compagnie'),
    b('Name pets and say what they are like.', 'Nommer les animaux de compagnie et les décrire.'),
    [b('Name pets', 'Nommer les animaux de compagnie'), b('Say « j’ai un… / je n’ai pas de… »', 'Dire « j’ai un… / je n’ai pas de… »'), b('Describe your pet', 'Décrire son animal')],
    13,
    [
      card(b('Pets', 'Les animaux de compagnie'), b('**un chien, un chat, un lapin, un poisson rouge, un oiseau, un hamster, une tortue**. **J’ai un chat. Il s’appelle Minou. Il est noir et très gentil.** Negative: **Je n’ai pas d’animal.** (pas de / pas d’)', '**un chien, un chat, un lapin, un poisson rouge, un oiseau, un hamster, une tortue**. **J’ai un chat. Il s’appelle Minou. Il est noir et très gentil.** Négation : **Je n’ai pas d’animal.** (pas de / pas d’)'), {
        ex: [['J’ai un chien. Il s’appelle Rex.', 'I have a dog. His name is Rex.'], ['Je n’ai pas d’animal.', 'I don’t have a pet.']],
      }),
      flash(b('Pets', 'Les animaux de compagnie'), [['un chien', b('a dog', 'il aboie')], ['un chat', b('a cat', 'il miaule')], ['un lapin', b('a rabbit', 'longues oreilles')], ['un poisson rouge', b('a goldfish', 'il nage')], ['un oiseau', b('a bird', 'il chante')], ['une tortue', b('a tortoise, a turtle', 'elle est lente')]]),
      hear('J’ai un petit chien blanc. Il s’appelle Biscuit et il adore jouer au parc.', b('What is the dog like?', 'Comment est le chien ?'), [b('small and white', 'petit et blanc'), b('big and black', 'grand et noir'), b('small and brown', 'petit et marron'), b('old and tired', 'vieux et fatigué')]),
      mc(P.choose, ['Je n’ai pas d’animal.', 'Je n’ai pas un animal.', 'Je n’ai pas animal.', 'Je ne pas d’animal.'], { fr: 'Vous n’avez pas d’animal :' }),
      ord(P.order, 'Mon chat s’appelle Minou et il est très gentil.', { tr: 'My cat is called Minou and he is very nice.' }),
      say('J’ai un chat noir. Il s’appelle Minou. Et toi, tu as un animal ?', 'I have a black cat. His name is Minou. And you, do you have a pet?'),
    ],
    [
      b('un chien, un chat, un lapin, un oiseau, un poisson rouge.', 'un chien, un chat, un lapin, un oiseau, un poisson rouge.'),
      b('J’ai un… / Je n’ai pas de (d’)…', 'J’ai un… / Je n’ai pas de (d’)…'),
      b('Il s’appelle… Il est + adjective.', 'Il s’appelle… Il est + adjectif.'),
    ],
    [['un animal de compagnie', b('a pet', 'animal de la maison')], ['gentil', b('nice, kind', 'agréable')], ['adorer', b('to love', 'aimer beaucoup')]],
  ),
  lesson(C, 2, ['farm-and-wild-animals', 'animaux-de-la-ferme-et-sauvages'],
    b('Farm and wild animals', 'Les animaux de la ferme et sauvages'),
    b('Name farm and wild animals, with their articles and plurals.', 'Nommer les animaux de la ferme et sauvages, avec leurs articles et leurs pluriels.'),
    [b('Name farm animals', 'Nommer les animaux de la ferme'), b('Name wild animals', 'Nommer les animaux sauvages'), b('Learn irregular plurals', 'Apprendre les pluriels irréguliers')],
    13,
    [
      card(b('At the farm and in the wild', 'À la ferme et dans la nature'), b('Farm: **une vache, un cheval, un cochon, un mouton, une poule, un canard**. Wild: **un ours, un loup, un renard, un cerf, un écureuil**; in Québec: **un orignal** (moose), **un castor** (beaver), **un raton laveur**. Plurals: **un cheval → des chevaux, un animal → des animaux, un oiseau → des oiseaux**.', 'Ferme : **une vache, un cheval, un cochon, un mouton, une poule, un canard**. Sauvages : **un ours, un loup, un renard, un cerf, un écureuil** ; au Québec : **un orignal**, **un castor**, **un raton laveur**. Pluriels : **un cheval → des chevaux, un animal → des animaux, un oiseau → des oiseaux**.')),
      sort(b('Farm or wild?', 'Ferme ou sauvage ?'), [b('farm', 'ferme'), b('wild', 'sauvage')], [['une vache', 0], ['un loup', 1], ['une poule', 0], ['un ours', 1], ['un mouton', 0], ['un renard', 1]]),
      pairs(P.match, [['un cheval', 'des chevaux'], ['un animal', 'des animaux'], ['un oiseau', 'des oiseaux'], ['un canard', 'des canards']], true),
      gap(P.complete, 'À la ferme, il y a des vaches, des ___ (cheval) et des ___ (poule).', ['chevaux', 'poules']),
      hear('Dans la forêt, nous avons vu un écureuil, deux cerfs et même un orignal !', b('Which big animal did they see?', 'Quel grand animal ont-ils vu ?'), [b('a moose', 'un orignal'), b('a bear', 'un ours'), b('a wolf', 'un loup'), b('a horse', 'un cheval')], { voice: 'm' }),
      say('À la ferme, il y a des vaches, des chevaux et des poules.', 'On the farm there are cows, horses and hens.'),
    ],
    [
      b('Farm: vache, cheval, cochon, mouton, poule.', 'Ferme : vache, cheval, cochon, mouton, poule.'),
      b('Wild: ours, loup, renard, cerf, écureuil (Québec: orignal, castor).', 'Sauvages : ours, loup, renard, cerf, écureuil (Québec : orignal, castor).'),
      b('-al → -aux; -eau → -eaux; oiseau → oiseaux.', '-al → -aux ; -eau → -eaux ; oiseau → oiseaux.'),
    ],
    [['une ferme', b('a farm', 'lieu des animaux et des champs')], ['sauvage', b('wild', 'qui vit libre')], ['un écureuil', b('a squirrel', 'petit animal des arbres')]],
  ),
  lesson(C, 3, ['in-nature', 'dans-la-nature'],
    b('In nature', 'Dans la nature'),
    b('Describe the park, the forest, the mountains and the sea, and say what you like doing.', 'Décrire le parc, la forêt, la montagne et la mer, et dire ce qu’on aime y faire.'),
    [b('Name natural places', 'Nommer les lieux naturels'), b('Use il y a', 'Utiliser il y a'), b('Say what you like doing outdoors', 'Dire ce qu’on aime faire dehors')],
    13,
    [
      card(b('Nature', 'La nature'), b('**le parc, la forêt, la montagne, la mer, la plage, le lac, la rivière, la campagne**. **Il y a des arbres, des fleurs, un lac.** Activities: **se promener, faire une randonnée, faire du vélo, nager, pique-niquer, observer les oiseaux**. **J’aime me promener en forêt. · Le dimanche, je fais du vélo au bord du lac.**', '**le parc, la forêt, la montagne, la mer, la plage, le lac, la rivière, la campagne**. **Il y a des arbres, des fleurs, un lac.** Activités : **se promener, faire une randonnée, faire du vélo, nager, pique-niquer, observer les oiseaux**. **J’aime me promener en forêt. · Le dimanche, je fais du vélo au bord du lac.**')),
      culture(b('Nature in Québec and France', 'La nature au Québec et en France'), b('In **Québec**, people love **le chalet** by a lake, **la randonnée**, and in winter **la raquette** (snowshoeing). In **France**, Sunday walks **en forêt** and summer holidays **à la mer** or **à la montagne** are classics. National parks exist in both.', 'Au **Québec**, on adore **le chalet** au bord d’un lac, **la randonnée** et, l’hiver, **la raquette**. En **France**, la promenade du dimanche **en forêt** et les vacances **à la mer** ou **à la montagne** sont des classiques. Les deux ont des parcs nationaux.'), { variant: 'culture' }),
      sort(b('Place or activity?', 'Lieu ou activité ?'), [b('place', 'lieu'), b('activity', 'activité')], [['la forêt', 0], ['se promener', 1], ['le lac', 0], ['pique-niquer', 1], ['la plage', 0], ['faire une randonnée', 1]]),
      dlg(b('Sunday plans', 'Le dimanche'), undefined, [['Léa', 'f'], ['Vous', 'm']], [
        [0, 'Qu’est-ce que tu aimes faire le dimanche ?', 'What do you like to do on Sundays?'],
        [1, { options: ['J’aime me promener en forêt avec mon chien.', 'J’aime forêt.', 'Je promener le dimanche.'] }],
        [0, 'Moi aussi ! Il y a une belle forêt près de chez moi, avec un lac.', 'Me too! There’s a beautiful forest near my place, with a lake.'],
        [1, { options: ['Super ! On pourrait pique-niquer au bord du lac dimanche ?', 'D’accord. Au revoir.', 'Un lac, c’est de l’eau.'] }],
      ]),
      dict('Près de chez moi, il y a un parc avec un petit lac et beaucoup d’arbres.', { hint: b('Listen for il y a and the nature words.', 'Écoutez il y a et les mots de la nature.') }),
      write(b('Your favourite place', 'Votre lieu préféré'), b('Describe your favourite place in nature (20–40 words): where it is, what there is, what you do there.', 'Décrivez votre lieu préféré dans la nature (20–40 mots) : où il est, ce qu’il y a, ce que vous y faites.'), 20, 40, [
        b('il y a + nature words', 'il y a + mots de la nature'),
        b('One or two activities', 'Une ou deux activités'),
      ], 'Mon lieu préféré, c’est un petit lac à la campagne. Il y a des arbres, des fleurs et des canards. Le dimanche, je fais du vélo autour du lac et je pique-nique avec mes amis.'),
    ],
    [
      b('le parc, la forêt, la montagne, la mer, le lac, la campagne.', 'le parc, la forêt, la montagne, la mer, le lac, la campagne.'),
      b('Il y a des arbres, des fleurs…', 'Il y a des arbres, des fleurs…'),
      b('J’aime + infinitive: me promener, faire du vélo, nager.', 'J’aime + infinitif : me promener, faire du vélo, nager.'),
    ],
    [['une randonnée', b('a hike', 'longue marche')], ['au bord du lac', b('by the lake', 'près de l’eau')], ['pique-niquer', b('to have a picnic', 'manger dehors')]],
  ),
];
