import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Where are my keys? Is the pharmacy next to the bank? Prepositions of place let you locate anything: objects at home, buildings in town, people in a photo. This course teaches sur, sous, dans, devant, derrière, entre, à côté de, en face de, près de and loin de, the contractions du and des (à côté du parc), and how to describe a room and give simple directions.',
    'Où sont mes clés ? La pharmacie est-elle à côté de la banque ? Les prépositions de lieu permettent de tout situer : les objets à la maison, les bâtiments en ville, les personnes sur une photo. Ce cours présente sur, sous, dans, devant, derrière, entre, à côté de, en face de, près de et loin de, les contractions du et des (à côté du parc), et la façon de décrire une pièce et de donner des indications simples.',
  ),
  outcomes: [
    b('Use sur, sous, dans, devant, derrière, entre', 'Employer sur, sous, dans, devant, derrière, entre'),
    b('Use à côté de, en face de, près de, loin de with du / des', 'Employer à côté de, en face de, près de, loin de avec du / des'),
    b('Describe a room and find lost objects', 'Décrire une pièce et retrouver des objets'),
    b('Locate places in town', 'Situer des lieux en ville'),
  ],
};

const C = 'prepositions-place';
export default [
  lesson(C, 1, ['on-under-in', 'sur-sous-dans'],
    b('Sur, sous, dans, devant, derrière, entre', 'Sur, sous, dans, devant, derrière, entre'),
    b('Locate objects with the six simple prepositions.', 'Situer des objets avec les six prépositions simples.'),
    [b('Use the simple prepositions', 'Employer les prépositions simples'), b('Ask “Où est… ?”', 'Demander « Où est… ? »'), b('Describe a desk or a room', 'Décrire un bureau ou une pièce')],
    13,
    [
      card(b('Six simple prepositions', 'Six prépositions simples'), b('**sur** (on), **sous** (under), **dans** (in), **devant** (in front of), **derrière** (behind), **entre** (between). They come directly before the noun: **sur la table**, **sous le lit**.', '**sur**, **sous**, **dans**, **devant**, **derrière**, **entre**. Elles se placent directement devant le nom : **sur la table**, **sous le lit**.'), {
        ex: [['Tes clés sont sur la table.', 'Your keys are on the table.'], ['Le chat dort sous le lit.', 'The cat is sleeping under the bed.'], ['La voiture est devant la maison.', 'The car is in front of the house.'], ['La salle de bain est entre les deux chambres.', 'The bathroom is between the two bedrooms.']],
      }),
      trap(b('Sur or sous?', 'Sur ou sous ?'), b('Listen carefully: **sur** [syʁ] has the French u, **sous** [su] has ou. A mistake changes the meaning: **sur le lit** (on the bed) / **sous le lit** (under the bed).', 'Écoutez bien : **sur** [syʁ] avec le u français, **sous** [su] avec ou. Une erreur change le sens : **sur le lit** / **sous le lit**.')),
      mc(P.word, ['dans', 'sur', 'entre', 'devant'], { fr: 'Le lait est ___ le frigo.' }),
      mc(P.word, ['entre', 'dans', 'sous', 'sur'], { fr: 'La banque est ___ la poste et le café.' }),
      hear('Le chat est sous le lit.', b('Where is the cat?', 'Où est le chat ?'), [b('under the bed', 'sous le lit'), b('on the bed', 'sur le lit'), b('in the bed', 'dans le lit'), b('behind the bed', 'derrière le lit')]),
      pairs(b('Match the opposites.', 'Associez les contraires.'), [['sur', 'sous'], ['devant', 'derrière'], ['dedans', 'dehors'], ['près de', 'loin de']], true),
      gap(P.complete, 'Ton sac est ___ la chaise et ton téléphone est ___ ton sac.', ['sous', 'dans'], { choices: [['sous', 'sur', 'entre'], ['dans', 'devant', 'entre']] }),
      ord(P.order, 'Le parking est derrière le supermarché.', { tr: 'The car park is behind the supermarket.' }),
      dict('Mon ordinateur est sur le bureau, entre la lampe et les livres.', { voice: 'm' }),
    ],
    [
      b('sur (on), sous (under), dans (in), devant (in front of), derrière (behind), entre (between).', 'sur, sous, dans, devant, derrière, entre : directement devant le nom.'),
      b('sur [syʁ] ≠ sous [su].', 'sur [syʁ] ≠ sous [su].'),
      b('Ask: Où est… ? Où sont… ?', 'Demander : Où est… ? Où sont… ?'),
    ],
    [['le frigo', b('the fridge', 'réfrigérateur')], ['le bureau', b('the desk; the office', 'table de travail ; lieu de travail')], ['le parking', b('the car park', 'lieu où garer la voiture')]],
  ),
  lesson(C, 2, ['next-to-opposite', 'a-cote-de-en-face-de'],
    b('À côté de, en face de, près de, loin de', 'À côté de, en face de, près de, loin de'),
    b('Use the prepositions with de and their contractions du and des.', 'Employer les prépositions avec de et leurs contractions du et des.'),
    [b('Use prepositions ending in de', 'Employer les prépositions en de'), b('Contract de + le = du, de + les = des', 'Contracter de + le = du, de + les = des'), b('Locate places in town', 'Situer des lieux en ville')],
    13,
    [
      card(b('Prepositions with de', 'Les prépositions avec de'), b('**à côté de** (next to), **en face de** (opposite), **près de** (near), **loin de** (far from), **au bout de** (at the end of), **au coin de** (at the corner of). With le and les, **de** contracts: **de + le = du**, **de + les = des**. With la and l’, no change.', '**à côté de**, **en face de**, **près de**, **loin de**, **au bout de**, **au coin de**. Avec le et les, **de** se contracte : **de + le = du**, **de + les = des**. Avec la et l’, aucun changement.'), {
        table: { head: ['', b('result', 'résultat'), b('example', 'exemple')], rows: [['de + le', 'du', 'à côté du parc'], ['de + la', 'de la', 'en face de la gare'], ['de + l’', 'de l’', 'près de l’école'], ['de + les', 'des', 'loin des magasins']] },
        ex: [['La pharmacie est à côté du cinéma.', 'The pharmacy is next to the cinema.'], ['J’habite en face de la gare.', 'I live opposite the station.'], ['L’hôtel est près des plages.', 'The hotel is near the beaches.']],
      }),
      mc(P.word, ['du', 'de le', 'de la', 'des'], { fr: 'Le café est en face ___ musée.' }),
      mc(P.word, ['des', 'de les', 'du', 'de'], { fr: 'Nous habitons loin ___ commerces.' }),
      mc(P.word, ['de l’', 'du', 'de le', 'des'], { fr: 'La boulangerie est près ___ hôpital.' }),
      pairs(P.match, [['au coin de la rue', b('at the street corner', 'à l’angle de la rue')], ['au bout du couloir', b('at the end of the corridor', 'tout au fond du couloir')], ['en face de', b('opposite', 'vis-à-vis')], ['loin de', b('far from', 'à grande distance de')]]),
      gap(P.complete, 'La poste est à côté ___ banque, en face ___ parc.', ['de la', 'du']),
      ord(P.order, 'Les toilettes sont au bout du couloir, à droite.', { tr: 'The toilets are at the end of the corridor, on the right.' }),
      dlg(b('Asking where something is', 'Demander où se trouve un lieu'), undefined, [['Passante', 'f'], ['Vous', 'm']], [
        [1, 'Excusez-moi, madame, il y a une pharmacie près d’ici ?', 'Excuse me, madam, is there a pharmacy near here?'],
        [0, 'Oui, au coin de la rue, en face du supermarché.', 'Yes, at the corner of the street, opposite the supermarket.'],
        [1, { options: ['En face du supermarché ? Merci beaucoup !', 'En face de le supermarché ? Merci !', 'En face des supermarché ? Merci !'] }],
      ]),
      say('Mon appartement est près du métro, en face d’un grand parc.', 'My flat is near the metro, opposite a big park.'),
    ],
    [
      b('à côté de, en face de, près de, loin de, au coin de, au bout de.', 'à côté de, en face de, près de, loin de, au coin de, au bout de.'),
      b('de + le = du, de + les = des; de la and de l’ do not change.', 'de + le = du, de + les = des ; de la et de l’ ne changent pas.'),
      b('Il y a une pharmacie près d’ici ? = Is there a pharmacy near here?', 'Il y a une pharmacie près d’ici ? : pour demander un lieu proche.'),
    ],
    [['le couloir', b('the corridor', 'passage intérieur')], ['les commerces', b('the shops', 'les magasins')], ['un passant, une passante', b('a passer-by', 'personne dans la rue')]],
  ),
  lesson(C, 3, ['describe-a-room', 'decrire-une-piece'],
    b('Describing a room and a neighbourhood', 'Décrire une pièce et un quartier'),
    b('Combine il y a, the prepositions and the furniture words to describe a place.', 'Combiner il y a, les prépositions et le vocabulaire du mobilier pour décrire un lieu.'),
    [b('Use il y a to list what is there', 'Employer il y a pour énumérer'), b('Describe a room precisely', 'Décrire précisément une pièce'), b('Describe your neighbourhood', 'Décrire son quartier')],
    13,
    [
      card(b('Il y a + preposition', 'Il y a + préposition'), b('Start with **il y a** (there is / there are), then locate: **Dans le salon, il y a un canapé. Devant le canapé, il y a une table basse.** In the negative: **il n’y a pas de** + noun.', 'Commencez par **il y a**, puis situez : **Dans le salon, il y a un canapé. Devant le canapé, il y a une table basse.** À la forme négative : **il n’y a pas de** + nom.'), {
        ex: [['Dans ma chambre, il y a un lit et une armoire.', 'In my bedroom, there is a bed and a wardrobe.'], ['Au-dessus du canapé, il y a un tableau.', 'Above the sofa, there is a painting.'], ['Il n’y a pas de balcon.', 'There is no balcony.']],
      }),
      tip(b('More precise prepositions', 'Des prépositions plus précises'), b('**au-dessus de** (above), **au-dessous de** (below), **au milieu de** (in the middle of), **à gauche de / à droite de** (to the left / right of), **contre** (against), **autour de** (around).', '**au-dessus de**, **au-dessous de**, **au milieu de**, **à gauche de / à droite de**, **contre**, **autour de**.'), {
        ex: [['La table est au milieu de la cuisine.', 'The table is in the middle of the kitchen.'], ['Le lit est contre le mur.', 'The bed is against the wall.']],
      }),
      mc(P.best, ['Il n’y a pas de lave-vaisselle.', 'Il n’y a pas un lave-vaisselle.', 'Il y a pas lave-vaisselle.', 'Il n’a pas de lave-vaisselle.']),
      mc(P.word, ['au-dessus du', 'au-dessus de le', 'sur du', 'dessus du'], { fr: 'Il y a une lampe ___ lit.' }),
      pairs(P.match, [['un canapé', b('a sofa', 'siège long')], ['une armoire', b('a wardrobe', 'meuble pour les vêtements')], ['une étagère', b('a shelf', 'planche pour poser des objets')], ['un tapis', b('a rug', 'textile au sol')]]),
      gap(P.completeText, 'Dans mon salon, il y a un canapé ___ la fenêtre et une télévision ___ face. ___ milieu, il y a un tapis.', ['devant', 'en', 'Au']),
      ord(P.order, 'Il y a une petite école à côté de chez moi.', { tr: 'There is a small school next to my place.' }),
      say('Dans mon quartier, il y a une boulangerie, un parc et une station de métro.', 'In my neighbourhood, there is a bakery, a park and a metro station.'),
      dict('Dans la cuisine, il y a une table au milieu et une étagère contre le mur.', { voice: 'f' }),
    ],
    [
      b('Il y a / il n’y a pas de + noun to list what is there.', 'Il y a / il n’y a pas de + nom pour énumérer.'),
      b('au-dessus de, au-dessous de, au milieu de, à gauche de, à droite de, contre, autour de.', 'au-dessus de, au-dessous de, au milieu de, à gauche de, à droite de, contre, autour de.'),
      b('chez moi = at my place.', 'chez moi = à mon domicile.'),
    ],
    [['le salon', b('the living room', 'pièce de séjour')], ['un lave-vaisselle', b('a dishwasher', 'machine à laver la vaisselle')], ['contre le mur', b('against the wall', 'appuyé au mur')]],
  ),
];

