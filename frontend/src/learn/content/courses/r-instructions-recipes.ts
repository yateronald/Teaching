import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Read a recipe, set up a new appliance, follow the rules of a gym or the steps to renew a card: instructions are written with imperatives, infinitives and clear sequence words. This course trains you to follow them in the right order, to spot quantities, warnings and conditions, and to retell a procedure yourself.',
    'Suivre une recette, installer un appareil, respecter le règlement d’une salle de sport ou les étapes du renouvellement d’une carte : les consignes s’écrivent à l’impératif, à l’infinitif et avec des mots de liaison clairs. Ce cours vous entraîne à les suivre dans le bon ordre, à repérer quantités, avertissements et conditions, et à expliquer vous-même une procédure.',
  ),
  outcomes: [
    b('Follow a recipe step by step', 'Suivre une recette étape par étape'),
    b('Follow the instructions of an appliance', 'Suivre le mode d’emploi d’un appareil'),
    b('Understand rules and conditions', 'Comprendre un règlement et ses conditions'),
    b('Explain a procedure in order', 'Expliquer une procédure dans l’ordre'),
  ],
};

const RECIPE: Doc = { look: 'page', title: b('Recipe: pancakes with maple syrup', 'Recette : crêpes au sirop d’érable'), text: 'Pour 4 personnes – 20 minutes\n\n1. Dans un grand bol, mélangez 250 g de farine, 2 cuillères à soupe de sucre et une pincée de sel.\n2. Ajoutez 3 œufs, puis versez peu à peu 50 cl de lait en fouettant.\n3. Laissez reposer la pâte 30 minutes au réfrigérateur.\n4. Faites chauffer une poêle légèrement beurrée et versez une petite louche de pâte.\n5. Faites cuire une minute de chaque côté. Servez avec du sirop d’érable.' };
const KETTLE: Doc = { look: 'page', title: b('User manual: electric kettle', 'Mode d’emploi : bouilloire électrique'), text: 'Avant la première utilisation, faites bouillir de l’eau deux fois et jetez-la.\n\n1. Remplissez la bouilloire entre les repères MIN et MAX.\n2. Posez-la sur son socle et appuyez sur l’interrupteur.\n3. La bouilloire s’arrête automatiquement quand l’eau bout.\n\nAttention : ne pas plonger la bouilloire dans l’eau. Débrancher avant de la nettoyer.' };
const GYM: Doc = { look: 'notice', title: b('Gym rules', 'Règlement de la salle de sport'), text: 'Bienvenue au Centre sportif !\n\n• Port de chaussures propres obligatoire.\n• Une serviette est exigée sur les appareils.\n• Les casiers doivent être vidés chaque soir.\n• Les enfants de moins de 14 ans doivent être accompagnés d’un adulte.\n• Merci de ranger le matériel après usage.\n\nLa direction se réserve le droit de refuser l’accès en cas de non-respect du règlement.' };

const C = 'r-instructions-recipes';
export default [
  lesson(C, 1, ['following-a-recipe', 'suivre-une-recette'],
    b('Following a recipe', 'Suivre une recette'),
    b('Read quantities, cooking verbs and the order of the steps.', 'Lire les quantités, les verbes de cuisine et l’ordre des étapes.'),
    [b('Understand cooking verbs', 'Comprendre les verbes de cuisine'), b('Read quantities and times', 'Lire les quantités et les durées'), b('Put the steps in order', 'Remettre les étapes dans l’ordre')],
    13,
    [
      card(b('The language of recipes', 'La langue des recettes'), b('Recipes use the **imperative** (vous): **mélangez, ajoutez, versez, faites cuire, laissez reposer, servez**. Quantities: **250 g, 50 cl, une cuillère à soupe, une pincée, une louche**. Sequence: **d’abord, puis, ensuite, enfin**.', 'Les recettes emploient l’**impératif** (vous) : **mélangez, ajoutez, versez, faites cuire, laissez reposer, servez**. Quantités : **250 g, 50 cl, une cuillère à soupe, une pincée, une louche**. Enchaînement : **d’abord, puis, ensuite, enfin**.')),
      doc(RECIPE, b('How long must the batter rest?', 'Combien de temps la pâte doit-elle reposer ?'), [b('30 minutes in the fridge', '30 minutes au réfrigérateur'), b('One minute', 'Une minute'), b('20 minutes', '20 minutes'), b('All night', 'Toute la nuit')]),
      doc(RECIPE, b('When do you add the milk?', 'Quand ajoute-t-on le lait ?'), [b('After the eggs, little by little', 'Après les œufs, peu à peu'), b('At the very end', 'Tout à la fin'), b('Before the flour', 'Avant la farine'), b('With the maple syrup', 'Avec le sirop d’érable')]),
      pairs(P.match, [['mélanger', b('to mix', 'combiner')], ['verser', b('to pour', 'faire couler')], ['fouetter', b('to whisk', 'battre vivement')], ['une pincée', b('a pinch', 'très petite quantité')]]),
      sort(b('First or last?', 'D’abord ou à la fin ?'), [b('at the start', 'au début'), b('at the end', 'à la fin')], [['Mélangez la farine et le sucre.', 0], ['Servez avec du sirop.', 1], ['Ajoutez les œufs.', 0], ['Faites cuire une minute de chaque côté.', 1]]),
      ord(P.order, 'Faites chauffer une poêle légèrement beurrée.', { tr: 'Heat a lightly buttered frying pan.' }),
      say('D’abord, mélangez la farine et le sucre, puis ajoutez les œufs.', 'First, mix the flour and sugar, then add the eggs.'),
    ],
    [
      b('Recipe verbs: mélangez, ajoutez, versez, faites cuire, laissez reposer.', 'Verbes : mélangez, ajoutez, versez, faites cuire, laissez reposer.'),
      b('Quantities: g, cl, une cuillère à soupe, une pincée, une louche.', 'Quantités : g, cl, une cuillère à soupe, une pincée, une louche.'),
      b('Order: d’abord, puis, ensuite, enfin.', 'Ordre : d’abord, puis, ensuite, enfin.'),
    ],
    [['la pâte', b('batter, dough', 'mélange à cuire')], ['une poêle', b('a frying pan', 'ustensile pour cuire')], ['le sirop d’érable', b('maple syrup', 'sirop du Québec')]],
  ),
  lesson(C, 2, ['user-manuals', 'modes-d-emploi'],
    b('User manuals and safety warnings', 'Modes d’emploi et avertissements'),
    b('Follow the steps of a user manual and spot the warnings.', 'Suivre les étapes d’un mode d’emploi et repérer les avertissements.'),
    [b('Follow numbered steps', 'Suivre des étapes numérotées'), b('Understand safety warnings', 'Comprendre les avertissements de sécurité'), b('Read before the first use', 'Lire « avant la première utilisation »')],
    13,
    [
      tip(b('Warnings are in the infinitive', 'Les avertissements sont à l’infinitif'), b('**Attention : ne pas…**, **Débrancher avant de…**, **Ne jamais…**, **Tenir à l’écart de…**. Always read them before the first use.', '**Attention : ne pas…**, **Débrancher avant de…**, **Ne jamais…**, **Tenir à l’écart de…**. Lisez-les toujours avant la première utilisation.')),
      doc(KETTLE, b('What must you do before using the kettle the first time?', 'Que faut-il faire avant la première utilisation ?'), [b('Boil water twice and throw it away', 'Faire bouillir de l’eau deux fois et la jeter'), b('Wash it in the dishwasher', 'La laver au lave-vaisselle'), b('Fill it above MAX', 'La remplir au-dessus de MAX'), b('Put it in the water', 'La plonger dans l’eau')]),
      doc(KETTLE, b('What must you do before cleaning it?', 'Que faut-il faire avant de la nettoyer ?'), [b('Unplug it', 'La débrancher'), b('Fill it', 'La remplir'), b('Switch it on', 'L’allumer'), b('Put it on its base', 'La poser sur son socle')]),
      mc(P.meaning, [b('It switches off by itself.', 'Elle s’éteint toute seule.'), b('You must switch it off.', 'Il faut l’éteindre.'), b('It never stops.', 'Elle ne s’arrête jamais.'), b('It stops when it is empty.', 'Elle s’arrête quand elle est vide.')], { fr: 'La bouilloire s’arrête automatiquement.' }),
      pairs(P.match, [['débrancher', b('to unplug', 'retirer la prise')], ['l’interrupteur', b('the switch', 'bouton marche/arrêt')], ['le socle', b('the base', 'support')], ['bouillir', b('to boil', 'atteindre 100 °C')]]),
      gap(P.complete, 'Remplissez la bouilloire entre les repères MIN et ___, puis appuyez sur l’___.', ['MAX', 'interrupteur']),
      dict('Débranchez l’appareil avant de le nettoyer.', { voice: 'm' }),
    ],
    [
      b('Warnings: Attention, ne pas…, Débrancher avant de…, Ne jamais…', 'Avertissements : Attention, ne pas…, Débrancher avant de…, Ne jamais…'),
      b('Before first use: avant la première utilisation.', 'Avant la première utilisation : à lire en premier.'),
      b('brancher / débrancher, allumer / éteindre.', 'brancher / débrancher, allumer / éteindre.'),
    ],
    [['une bouilloire', b('a kettle', 'appareil pour chauffer l’eau')], ['plonger', b('to immerse', 'mettre dans l’eau')], ['un repère', b('a mark', 'indication')]],
  ),
  lesson(C, 3, ['rules-and-procedures', 'reglements-et-procedures'],
    b('Rules and procedures', 'Règlements et procédures'),
    b('Understand obligations, conditions and consequences in a set of rules.', 'Comprendre les obligations, les conditions et les conséquences d’un règlement.'),
    [b('Understand obligatoire, exigé, doivent', 'Comprendre obligatoire, exigé, doivent'), b('Find conditions and consequences', 'Trouver les conditions et les conséquences'), b('Explain rules to someone', 'Expliquer un règlement à quelqu’un')],
    13,
    [
      card(b('Obligation words', 'Les mots de l’obligation'), b('**obligatoire** (compulsory), **exigé** (required), **doit / doivent** (must), **il est interdit de** (it is forbidden to), **en cas de** (in case of), **se réserve le droit de** (reserves the right to).', '**obligatoire**, **exigé**, **doit / doivent**, **il est interdit de**, **en cas de**, **se réserve le droit de**.')),
      doc(GYM, b('What is required on the machines?', 'Qu’est-ce qui est exigé sur les appareils ?'), [b('A towel', 'Une serviette'), b('A membership card', 'Une carte de membre'), b('Gloves', 'Des gants'), b('A bottle of water', 'Une bouteille d’eau')]),
      doc(GYM, b('A 12-year-old wants to train alone. Can he?', 'Un enfant de 12 ans veut s’entraîner seul. Peut-il ?'), [b('No, he must be with an adult.', 'Non, il doit être accompagné d’un adulte.'), b('Yes, with clean shoes.', 'Oui, avec des chaussures propres.'), b('Yes, in the evening.', 'Oui, le soir.'), b('Yes, without a towel.', 'Oui, sans serviette.')]),
      doc(GYM, b('What happens if you do not follow the rules?', 'Que se passe-t-il si l’on ne respecte pas le règlement ?'), [b('You may be refused entry.', 'L’accès peut vous être refusé.'), b('You pay double.', 'Vous payez le double.'), b('You must clean the gym.', 'Vous devez nettoyer la salle.'), b('Nothing.', 'Rien.')]),
      sort(b('Obligation or prohibition?', 'Obligation ou interdiction ?'), [b('you must', 'il faut'), b('you must not', 'il ne faut pas')], [['Port du casque obligatoire', 0], ['Interdit de courir', 1], ['Serviette exigée', 0], ['Ne pas nourrir les animaux', 1], ['Les casiers doivent être vidés', 0], ['Défense de stationner', 1]]),
      gap(P.complete, 'Dans cette salle, le port de chaussures propres est ___, et les enfants doivent être ___ d’un adulte.', ['obligatoire', 'accompagnés']),
      say('Au centre sportif, il faut une serviette et des chaussures propres.', 'At the sports centre, you need a towel and clean shoes.'),
    ],
    [
      b('obligatoire, exigé, doit / doivent = obligation.', 'obligatoire, exigé, doit / doivent = obligation.'),
      b('interdit de, défense de, ne pas = prohibition.', 'interdit de, défense de, ne pas = interdiction.'),
      b('se réserve le droit de = reserves the right to.', 'se réserve le droit de = peut décider de.'),
    ],
    [['un casier', b('a locker', 'petite armoire fermée')], ['une serviette', b('a towel', 'linge pour s’essuyer')], ['ranger', b('to put away', 'remettre en place')]],
  ),
];
