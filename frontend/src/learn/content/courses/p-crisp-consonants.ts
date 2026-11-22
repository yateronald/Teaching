import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'English p, t and k burst with a heavy puff of air, English dark l pulls the tongue back, and many learners blur b with v. In French, consonants are crisp, dry and precise: p, t and k have zero breath puff, b and v stay sharply separated, and l stays bright at the teeth. This A1 course sharpens your consonants so your accent instantly sounds cleaner.',
    'En anglais, p, t et k explosent avec un souffle d’air, le l final tire la langue en arrière, et beaucoup d’apprenants confondent b et v. En français, les consonnes sont nettes et sèches : p, t et k sont sans aspiration, b et v restent distincts, et l reste clair devant les dents. Ce cours A1 affine vos consonnes pour rendre votre prononciation aussitôt plus juste.',
  ),
  outcomes: [
    b('Drop English aspiration on initial p, t and k', 'Supprimer l’aspiration anglaise sur p, t et k'),
    b('Keep b (both lips) and v (teeth on lip) strictly distinct', 'Séparer nettement b (deux lèvres) et v (dents sur lèvre)'),
    b('Pre-voice French b, d and g cleanly at word starts', 'Faire vibrer b, d et g dès l’attaque du mot'),
    b('Produce a bright, clear French l in every position', 'Produire un l français clair dans toutes les positions'),
  ],
};

const C = 'p-crisp-consonants';
export default [
  lesson(C, 1, ['unaspirated-p-t-k', 'p-t-k-sans-aspiration'],
    b('Drop English aspiration on p, t, k', 'Supprimer l’aspiration sur p, t, k'),
    b('Make French p, t and k crisp and dry, with zero puff of air before vowels.', 'Rendre p, t et k nets et secs, sans souffle d’air avant la voyelle.'),
    [b('Pass the hand/tissue test for unaspirated p, t, k', 'Réussir le test de la main sans souffle sur p, t, k'), b('Anchor t cleanly behind the upper teeth', 'Placer t directement derrière les dents du haut'), b('Hear the difference in everyday words like Paris, table, café', 'Sentir la netteté sur Paris, table, café')],
    13,
    [
      card(b('Dry, unaspirated stops', 'Des consonnes sèches, sans souffle'), b('Hold your palm two centimetres from your mouth and say English *pie, tie, key*: you feel a warm **puff of air**. French **p, t, k** have **no puff**: they sound like the *p, t, k* after *s* in English (*spy, sty, ski*). Also, French **t** touches right behind the **upper teeth**, not further back.', 'Placez votre paume devant la bouche : l’anglais *pie, tie, key* envoie un **souffle d’air**. En français, **p, t, k** sont **sans souffle**, comme après *s* dans *spy, sty, ski*. De plus, le **t** français touche juste derrière les **dents du haut**.'), {
        ex: [['Paris, papa, porte', '[p] without puff'], ['table, tasse, train', '[t] at upper teeth'], ['café, cahier, qui', '[k] crisp and dry']],
      }),
      tip(b('The s-trick for p, t, k', 'L’astuce du s pour p, t, k'), b('Whisper *(s)pa, (s)ta, (s)ka*, then drop the *s* mentally while keeping the exact same tight stop: **pain, tasse, café**. Your hand stays completely dry!', 'Dites tout bas *(s)pa, (s)ta, (s)ka*, puis retirez le *s* en gardant la même tenue ferme : **pain, tasse, café**. Aucun souffle sur la main !')),
      hear('Papa pose trois tasses de café sur la petite table.', b('Listen. Which crisp stop repeats most in « Papa pose… petite »?', 'Écoutez. Quelle consonne nette revient dans « Papa pose… petite » ?'), [b('[p]: crisp and unaspirated', '[p] : net et sans aspiration'), b('[v]: voiced fricative', '[v] : fricative sonore'), b('[b]: voiced bilabial', '[b] : bilabiale sonore'), b('[z]: voiced hissing', '[z] : sifflante sonore')], { voice: 'm' }),
      sort(b('Sort by initial consonant: [p], [t] or [k]?', 'Classez par consonne initiale : [p], [t] ou [k] ?'), [b('[p]', '[p]'), b('[t]', '[t]'), b('[k]', '[k]')], [['le pain', 0], ['la table', 1], ['le café', 2], ['la porte', 0], ['la tasse', 1], ['le cahier', 2]], { listen: true }),
      mc(P.choose, [b('Like p, t, k after s in English (spy, sty, ski): zero breath puff', 'Comme p, t, k après s en anglais (spy, sty, ski) : sans souffle d’air'), b('With an extra burst of breath after the consonant', 'Avec un grand souffle d’air juste après la consonne'), b('With the tongue curled backward', 'Avec la langue roulée vers l’arrière'), b('Only at the end of sentences', 'Uniquement en fin de phrase')], { fr: 'Comment produit-on p, t, k en français ?' }),
      dict('Papa apporte quatre tasses de café sur la table.', { voice: 'f' }),
      say('Papa porte quatre tasses de café tiède près de la porte.', 'Dad carries four cups of lukewarm coffee near the door.', { tip: b('Keep your palm still—zero puff on p, t, k!', 'Main immobile devant la bouche : zéro souffle sur p, t, k !') }),
    ],
    [
      b('French p, t, k are completely dry: zero puff of air.', 'En français, p, t, k sont secs : zéro souffle d’air.'),
      b('Trick: copy the stop from English spy, sty, ski.', 'Astuce : gardez la consonne sèche de spy, sty, ski.'),
      b('French t touches behind the upper teeth (dental).', 'Le t français touche juste derrière les dents du haut.'),
    ],
    [['la tasse', b('the cup, mug', 'récipient à anse')], ['le cahier', b('the notebook', 'carnet de feuilles')], ['tiède', b('lukewarm', 'entre chaud et froid')]],
  ),
  lesson(C, 2, ['b-and-v-contrast', 'contraste-b-et-v'],
    b('Sharpen b vs v: both lips vs teeth on lip', 'Préciser b et v : deux lèvres contre dents sur lèvre'),
    b('Separate bilabial [b] from labiodental [v] in pairs like bain/vin and bois/voix.', 'Séparer nettement [b] bilabial et [v] labiodental dans bain/vin et bois/voix.'),
    [b('Close both lips firmly for [b]', 'Fermer les deux lèvres pour [b]'), b('Place upper teeth on lower lip for continuous [v]', 'Poser les dents du haut sur la lèvre inférieure pour [v]'), b('Distinguish minimal pairs like il boit / il voit', 'Distinguer des paires comme il boit / il voit')],
    13,
    [
      card(b('Two completely different shapes', 'Deux gestes bien distincts'), b('**[b]** (**le bain, boire, bien**): both lips press shut completely, then open cleanly—you cannot hold a [b] for three seconds! **[v]** (**le vin, voir, vous**): upper front teeth rest lightly on the **lower lip**, letting air buzz continuously—you can hold « vvvvv » as long as you have breath.', '**[b]** (**le bain, boire, bien**) : les deux lèvres se ferment complètement puis s’ouvrent — on ne peut pas tenir un [b] ! **[v]** (**le vin, voir, vous**) : les dents du haut effleurent la **lèvre du bas** et laissent passer l’air en continu — on peut tenir « vvvvv ».'), {
        ex: [['le bain / le vin', '[b] vs [v]'], ['le bois / la voix', '[b] vs [v]'], ['il boit / il voit', '[b] vs [v]']],
      }),
      hear('Ce soir, il voit le vieux bateau sur le lac.', b('Listen. Does he say « il boit » or « il voit »?', 'Écoutez. Dit-il « il boit » ou « il voit » ?'), [b('il voit [v]: he sees', 'il voit [v] : il regarde'), b('il boit [b]: he drinks', 'il boit [b] : il consomme une boisson'), b('il va [v]: he goes', 'il va [v] : il se déplace'), b('il bat [b]: he beats', 'il bat [b] : il frappe')], { voice: 'f2' }),
      hear('Paul préfère un verre de bon vin blanc.', b('Listen. Which order of [v] and [b] do you hear in « verre de bon vin blanc »?', 'Écoutez. Quel ordre de [v] et [b] entendez-vous dans « verre de bon vin blanc » ?'), [b('v (verre) · b (bon) · v (vin) · b (blanc)', 'v (verre) · b (bon) · v (vin) · b (blanc)'), b('Only b sounds', 'Uniquement des sons b'), b('Only v sounds', 'Uniquement des sons v'), b('b · v · b · v', 'b · v · b · v')], { voice: 'm2' }),
      sort(b('Sort by initial sound: [b] or [v]?', 'Classez par son initial : [b] ou [v] ?'), [b('[b] (both lips shut)', '[b] (deux lèvres fermées)'), b('[v] (teeth on lower lip)', '[v] (dents sur lèvre)')], [['le bain', 0], ['le vin', 1], ['le bois', 0], ['la voix', 1], ['la balle', 0], ['la valise', 1]], { listen: true }),
      pairs(b('Match each [b] ↔ [v] minimal pair.', 'Associez chaque paire minimale [b] ↔ [v].'), [['le bain', 'le vin'], ['le bois', 'la voix'], ['il boit', 'il voit'], ['le bas', 'il va']], true),
      dict('Voici un beau vélo bleu devant la banque.', { voice: 'm' }),
      say('Valérie boit un bon verre de vin blanc devant le vieux bureau.', 'Valérie drinks a good glass of white wine in front of the old desk.', { tip: b('Press both lips for b (boit, bon, blanc, bureau); bite lower lip lightly for v (Valérie, verre, vin, vieux).', 'Fermez les lèvres sur b ; posez les dents sur la lèvre du bas pour v.') }),
    ],
    [
      b('[b]: brief full lip closure (both lips).', '[b] : fermeture complète et brève des deux lèvres.'),
      b('[v]: upper teeth on lower lip, continuous voiced buzz.', '[v] : dents supérieures sur lèvre inférieure, souffle continu.'),
      b('Practise pairs: bain/vin, bois/voix, boit/voit.', 'Entraînez les paires : bain/vin, bois/voix, boit/voit.'),
    ],
    [['le bois', b('wood, woods', 'matière ou petite forêt')], ['la voix', b('the voice', 'son produit en parlant')], ['la valise', b('the suitcase', 'bagage')]],
  ),
  lesson(C, 3, ['crisp-stops-and-l-r-contrast', 'consonnes-nettes-et-l-r'],
    b('Voiced stops b, d, g and clear l vs r', 'Occlusives sonores b, d, g et l clair vs r'),
    b('Pre-voice b, d, g at the start of words and keep French l bright and clear.', 'Faire vibrer b, d, g dès le début du mot et garder un l toujours clair.'),
    [b('Distinguish voiceless p/t/k from pre-voiced b/d/g', 'Opposer p/t/k sourds et b/d/g sonores dès l’attaque'), b('Produce a bright, clear l even at word ends', 'Produire un l clair même en fin de mot'), b('Keep clear l distinct from back-of-mouth r', 'Séparer nettement l clair et r uvulaire')],
    13,
    [
      card(b('Pre-voiced b, d, g and clear l', 'b, d, g sonores et l clair'), b('Because French **p, t, k** have no air puff, English ears sometimes hear them as *b, d, g*! To keep **b, d, g** clearly distinct (**bon, doux, gare**), start vocal-cord vibration **right before** releasing the lips or tongue. Meanwhile, French **l** is **always bright** (tongue tip behind upper teeth), even at word ends like **mal, ville, ciel**—never swallow the back of the tongue!', 'Comme **p, t, k** n’ont pas de souffle, **b, d, g** (**bon, doux, gare**) doivent vibrer **dès l’attaque**. Quant au **l** français, il est **toujours clair** (pointe derrière les dents du haut), même en finale comme **mal, ville, ciel** !'), {
        ex: [['le pont / le bon', '[p] vs [b]'], ['la toux / la douche', '[t] vs [d]'], ['la balle, le ciel, l’hôtel', 'bright clear [l]']],
      }),
      trap(b('Avoid the English « dark l »', 'Évitez le « l sombre » anglais'), b('In English *bell* or *pool*, the back of the tongue rises and swallows the vowel. In French **belle, foule, ville, cheval**, keep the back of your tongue flat and touch right behind the upper teeth with the tip.', 'Dans l’anglais *bell* ou *pool*, le dos de la langue remonte. En français (**belle, foule, ville, cheval**), gardez l’arrière plat et touchez juste derrière les dents du haut avec la pointe.')),
      hear('Le train s’arrête au bout du quai, près de la gare.', b('Listen. Which words begin with [k] vs [ɡ]?', 'Écoutez. Quel mot commence par [k] et lequel par [ɡ] ?'), [b('quai starts with [k], gare starts with [ɡ]', 'quai commence par [k], gare par [ɡ]'), b('Both start with [k]', 'Les deux commencent par [k]'), b('quai starts with [ɡ], gare starts with [k]', 'quai commence par [ɡ], gare par [k]'), b('Both start with [ɡ]', 'Les deux commencent par [ɡ]')], { voice: 'f' }),
      sort(b('Voiceless (p/t/k) or voiced (b/d/g)?', 'Sourde (p/t/k) ou sonore (b/d/g) ?'), [b('voiceless [p, t, k]', 'sourde [p, t, k]'), b('voiced [b, d, ɡ]', 'sonore [b, d, ɡ]')], [['le pont', 0], ['le bon', 1], ['la toux', 0], ['la douche', 1], ['le quai', 0], ['la gare', 1]], { listen: true }),
      mc(P.choose, [b('Keep the tongue tip behind the upper teeth and the back of the tongue relaxed', 'Garder la pointe derrière les dents du haut et l’arrière de la langue détendu'), b('Pull the back of the tongue up toward the throat', 'Soulever l’arrière de la langue vers le palais mou'), b('Close both lips gently after the vowel', 'Fermer doucement les lèvres après la voyelle'), b('Drop the l completely in final position', 'Supprimer complètement le l en fin de mot')], { fr: 'Comment garder un « l » français bien clair dans « belle » et « ville » ?' }),
      dict('La belle ville garde son calme près de la gare.', { voice: 'm2' }),
      say('La belle balle bleue roule lentement le long du quai de la gare.', 'The pretty blue ball rolls slowly along the station platform.', { tip: b('Clear tip-of-tongue [l] in belle, balle, bleue, lentement, le, long.', 'l clair du bout de la langue dans belle, balle, bleue, lentement, le, long.') }),
    ],
    [
      b('Start voicing b, d, g early to contrast with dry p, t, k.', 'Amorcez la vibration de b, d, g pour les distinguer de p, t, k secs.'),
      b('French l is always bright (tongue tip up, back relaxed).', 'Le l français est toujours clair (pointe en haut, arrière détendu).'),
      b('Contrast pairs: pont/bon, toux/douche, quai/gare, lire/rire.', 'Paires utiles : pont/bon, toux/douche, quai/gare, lire/rire.'),
    ],
    [['le pont', b('the bridge', 'passage au-dessus d’une rivière')], ['le quai', b('the platform / quay', 'bord d’une gare ou d’un fleuve')], ['calme', b('calm, quiet', 'sans agitation')]],
  ),
];
