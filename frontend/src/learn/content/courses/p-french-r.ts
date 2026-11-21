import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The French R is produced at the back of the mouth, not with the tip of the tongue: a soft friction, close to a gentle gargle. This course teaches you a step-by-step method to find it, then trains it in every position (start, middle, end of word), in the difficult clusters (tr, gr, pr, cr, br) and against the L sound, so you can say Paris, très, quatre and travailler with confidence.',
    'Le R français se prononce au fond de la bouche, pas avec la pointe de la langue : une légère friction, proche d’un gargarisme doux. Ce cours vous propose une méthode pas à pas pour le trouver, puis l’entraîne dans toutes les positions (début, milieu, fin de mot), dans les groupes difficiles (tr, gr, pr, cr, br) et face au son L, pour dire Paris, très, quatre et travailler avec assurance.',
  ),
  outcomes: [
    b('Find the French R step by step', 'Trouver le R français pas à pas'),
    b('Say R at the start, middle and end of words', 'Dire le R en début, milieu et fin de mot'),
    b('Master the tr, gr, pr, cr clusters', 'Maîtriser les groupes tr, gr, pr, cr'),
    b('Distinguish R and L', 'Distinguer R et L'),
  ],
};

const W = b('Listen. Which word do you hear?', 'Écoutez. Quel mot entendez-vous ?');
const C = 'p-french-r';
export default [
  lesson(C, 1, ['finding-the-r', 'trouver-le-r'],
    b('Finding the French R', 'Trouver le R français'),
    b('Locate the R at the back of the mouth with a simple step-by-step method.', 'Localiser le R au fond de la bouche avec une méthode simple, pas à pas.'),
    [b('Find the R from the « k » position', 'Trouver le R à partir de la position du « k »'), b('Keep the tongue tip down', 'Garder la pointe de la langue en bas'), b('Say R at the start of a word', 'Dire le R en début de mot')],
    13,
    [
      card(b('A four-step method', 'Une méthode en quatre étapes'), b('1. Put the **tip of your tongue behind your lower teeth** and keep it there. 2. Say « **k** »: feel where the back of your tongue touches. 3. Now say « **a** » and let air pass at that same place, **without closing**: a soft friction, like a light gargle, comes out. 4. Add voice: **ra, ré, ri, ro, rou**.', '1. Placez **la pointe de la langue derrière les dents du bas** et laissez-la là. 2. Dites « **k** » : sentez où l’arrière de la langue touche. 3. Dites maintenant « **a** » en laissant passer l’air au même endroit, **sans fermer** : une légère friction sort, comme un gargarisme doux. 4. Ajoutez la voix : **ra, ré, ri, ro, rou**.'), {
        ex: [['ra, ré, ri, ro, rou', 'syllables'], ['rouge, rose, Rome, rapide', 'R at the start']],
      }),
      tip(b('Start from « gr »', 'Partez de « gr »'), b('Many learners find R more easily after **g** or **k**: say **gra… gra… gra**, then remove the g little by little: **(g)ra**. The tongue is already in the right place.', 'Beaucoup trouvent le R plus facilement après **g** ou **k** : dites **gra… gra… gra**, puis enlevez le g petit à petit : **(g)ra**. La langue est déjà au bon endroit.')),
      hear('C’est rouge.', b('Listen. Is the R at the start, the middle or the end?', 'Écoutez. Le R est-il au début, au milieu ou à la fin ?'), [b('at the start', 'au début'), b('in the middle', 'au milieu'), b('at the end', 'à la fin'), b('there is no R', 'il n’y a pas de R')]),
      sort(b('Where is the R?', 'Où est le R ?'), [b('start', 'début'), b('middle', 'milieu'), b('end', 'fin')], [['la rue', 0], ['Paris', 1], ['la mer', 2], ['rapide', 0], ['arrêter', 1], ['le soir', 2]], { listen: true }),
      mc(P.choose, [b('Behind the lower teeth', 'Derrière les dents du bas'), b('Touching the top of the mouth', 'Contre le haut de la bouche'), b('Between the teeth', 'Entre les dents'), b('Rolled, vibrating', 'Roulée, en vibration')], { fr: 'Pour le R français, où reste la pointe de la langue ?' }),
      say('Rose a une robe rouge.', 'Rose has a red dress.', { tip: b('Tongue tip down behind the lower teeth for every R.', 'Pointe de la langue en bas, derrière les dents, pour chaque R.') }),
    ],
    [
      b('Tongue tip behind the lower teeth; friction at the back (« k » place).', 'Pointe de la langue derrière les dents du bas ; friction au fond (place du « k »).'),
      b('Not rolled, not English R: a soft gargle.', 'Ni roulé, ni anglais : un léger gargarisme.'),
      b('Trick: start from gra and drop the g.', 'Astuce : partez de gra et enlevez le g.'),
    ],
    [['rouge', b('red', 'couleur')], ['une robe', b('a dress', 'vêtement')], ['rapide', b('fast', 'qui va vite')]],
  ),
  lesson(C, 2, ['r-in-every-position', 'le-r-dans-toutes-les-positions'],
    b('R in every position and in clusters', 'Le R dans toutes les positions et dans les groupes'),
    b('Say the R between vowels, at the end of words and in tr, gr, pr, cr, br.', 'Dire le R entre voyelles, en fin de mot et dans tr, gr, pr, cr, br.'),
    [b('Keep the final R audible', 'Faire entendre le R final'), b('Master consonant + R clusters', 'Maîtriser consonne + R'), b('Avoid adding a vowel', 'Éviter d’ajouter une voyelle')],
    13,
    [
      card(b('Final R and clusters', 'Le R final et les groupes'), b('**Final R** is always pronounced, but softly: **la mer, le soir, la peur, bonjour**. **Clusters**: the R follows the consonant immediately, **without an extra vowel**: **très** (not « teu-rès »), **gros, prix, crème, bras**. After t, the R is often slightly voiceless: **quatre, trois, train**.', 'Le **R final** se prononce toujours, mais doucement : **la mer, le soir, la peur, bonjour**. **Groupes** : le R suit la consonne immédiatement, **sans voyelle ajoutée** : **très** (pas « teu-rès »), **gros, prix, crème, bras**. Après t, le R est souvent légèrement assourdi : **quatre, trois, train**.'), {
        ex: [['très, trois, train', 'tr'], ['gros, grand, gris', 'gr'], ['prix, prendre, crème', 'pr, cr']],
      }),
      hear('C’est très grand.', b('Listen. Which clusters do you hear?', 'Écoutez. Quels groupes entendez-vous ?'), [b('tr and gr', 'tr et gr'), b('pr and cr', 'pr et cr'), b('br and dr', 'br et dr'), b('no cluster', 'aucun groupe')], { voice: 'm' }),
      hear('C’est pour trois.', W, ['trois', 'toi']),
      hear('C’est trop !', W, ['trop', 'top']),
      sort(b('Which cluster?', 'Quel groupe ?'), [b('tr', 'tr'), b('gr', 'gr'), b('pr', 'pr')], [['le train', 0], ['la grève', 1], ['le printemps', 2], ['quatre', 0], ['maigre', 1], ['après', 2]], { listen: true }),
      dict('Trois grands trains partent après quatre heures.', { hint: b('Five R sounds: tr, gr, tr, pr, and the final r of heures.', 'Plusieurs R : tr, gr, tr, pr, et le r final de heures.') }),
      say('Trois grands trains, quatre prix, très tard le soir.', 'Three big trains, four prizes, very late in the evening.'),
    ],
    [
      b('Final R is pronounced softly: mer, soir, bonjour.', 'Le R final se prononce doucement : mer, soir, bonjour.'),
      b('Clusters: no extra vowel (très, gros, prix).', 'Groupes : pas de voyelle ajoutée (très, gros, prix).'),
      b('After t (quatre, trois), the R is lighter.', 'Après t (quatre, trois), le R est plus léger.'),
    ],
    [['la grève', b('the strike', 'arrêt de travail collectif')], ['maigre', b('thin', 'sans graisse')], ['le printemps', b('spring', 'saison')]],
  ),
  lesson(C, 3, ['r-versus-l', 'r-contre-l'],
    b('R versus L, and long words', 'R contre L, et les mots longs'),
    b('Keep R and L clearly apart and say long words with several R.', 'Bien séparer R et L et dire des mots longs avec plusieurs R.'),
    [b('Distinguish R and L', 'Distinguer R et L'), b('Say words with several R', 'Dire des mots avec plusieurs R'), b('Keep fluency', 'Garder la fluidité')],
    13,
    [
      card(b('R and L', 'R et L'), b('**L**: the **tip of the tongue** touches the ridge behind the upper teeth: **la, le, lit, belle**. **R**: the tip stays **down**, the friction is at the **back**: **rat, riz, rêve**. French L is always clear (never the dark English « ll » of « ball »).', '**L** : **la pointe de la langue** touche les alvéoles derrière les dents du haut : **la, le, lit, belle**. **R** : la pointe reste **en bas**, la friction est **au fond** : **rat, riz, rêve**. Le L français est toujours clair (jamais le « ll » sombre de l’anglais « ball »).')),
      hear('Il est dans le riz.', W, ['riz', 'lit']),
      hear('C’est la rue.', W, ['la rue', 'la lune'], { voice: 'm' }),
      hear('Quelle belle robe !', b('Listen. Which order of sounds?', 'Écoutez. Dans quel ordre ?'), [b('L (belle) then R (robe)', 'L (belle) puis R (robe)'), b('R then L', 'R puis L'), b('only R', 'seulement R'), b('only L', 'seulement L')]),
      sort(b('R or L?', 'R ou L ?'), [b('R', 'R'), b('L', 'L')], [['rire', 0], ['lire', 1], ['la roue', 0], ['la loupe', 1], ['brun', 0], ['blond', 1]], { listen: true }),
      pairs(P.match, [['rire', b('to laugh', 'éclater de rire')], ['lire', b('to read', 'lire un livre')], ['la roue', b('the wheel', 'partie d’un vélo')], ['la loupe', b('the magnifying glass', 'pour voir petit')]]),
      say('Raoul lit et rit dans la rue, près de la librairie.', 'Raoul reads and laughs in the street, near the bookshop.', { tip: b('Tip up for L (lit, la, librairie), tip down for R (Raoul, rit, rue, près).', 'Pointe en haut pour L (lit, la, librairie), en bas pour R (Raoul, rit, rue, près).') }),
    ],
    [
      b('L: tongue tip up behind the upper teeth.', 'L : pointe de la langue en haut, derrière les dents.'),
      b('R: tongue tip down, friction at the back.', 'R : pointe en bas, friction au fond.'),
      b('Pairs: rire/lire, riz/lit, roue/loupe, brun/blond.', 'Paires : rire/lire, riz/lit, roue/loupe, brun/blond.'),
    ],
    [['le riz', b('rice', 'céréale')], ['une librairie', b('a bookshop', 'magasin de livres')], ['le rêve', b('the dream', 'ce qu’on voit en dormant')]],
  ),
];
