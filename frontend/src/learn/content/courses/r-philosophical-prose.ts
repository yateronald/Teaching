import type { CourseAbout, Doc } from '../../types';
import { b, card, doc, lesson, mc, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Montaigne, Descartes, Pascal, La Rochefoucauld, Voltaire, Rousseau: French thought is also a style, condensed in sentences that everyone still quotes. This course reads famous public-domain lines and short passages, explains their context and their 16th–18th-century French (ne… point, le seul « que »), and trains you to analyse their rhetoric (antithesis, maxim, paradox) and to discuss them in your own words, as in a C2 exam.',
    'Montaigne, Descartes, Pascal, La Rochefoucauld, Voltaire, Rousseau : la pensée française est aussi un style, condensé en phrases que tout le monde cite encore. Ce cours lit des formules et de courts passages célèbres du domaine public, explique leur contexte et leur français des XVIe–XVIIIe siècles (ne… point, le « que » seul), et vous entraîne à analyser leur rhétorique (antithèse, maxime, paradoxe) et à les commenter avec vos propres mots, comme à un examen de niveau C2.',
  ),
  outcomes: [
    b('Read classic French prose of ideas', 'Lire la prose d’idées classique'),
    b('Recognise antithesis, maxim and paradox', 'Reconnaître antithèse, maxime et paradoxe'),
    b('Understand older forms of French', 'Comprendre les tournures du français ancien'),
    b('Comment on a quotation in your own words', 'Commenter une citation avec vos propres mots'),
  ],
};

const PASCAL: Doc = { look: 'page', title: b('Blaise Pascal, Pensées (1670)', 'Blaise Pascal, Pensées (1670)'), text: 'L’homme n’est qu’un roseau, le plus faible de la nature ; mais c’est un roseau pensant.\n\nLe cœur a ses raisons que la raison ne connaît point.', source: b('Public domain', 'Domaine public') };
const MAXIMES: Doc = { look: 'page', title: b('La Rochefoucauld, Maximes (1665)', 'La Rochefoucauld, Maximes (1665)'), text: 'Nous avons tous assez de force pour supporter les maux d’autrui.\n\nL’hypocrisie est un hommage que le vice rend à la vertu.\n\nLe soleil ni la mort ne se peuvent regarder fixement.', source: b('Public domain', 'Domaine public') };
const LUMIERES: Doc = { look: 'page', title: b('Descartes, Voltaire, Rousseau', 'Descartes, Voltaire, Rousseau'), text: 'Le bon sens est la chose du monde la mieux partagée. — Descartes, Discours de la méthode (1637)\n\nIl faut cultiver notre jardin. — Voltaire, Candide (1759)\n\nL’homme est né libre, et partout il est dans les fers. — Rousseau, Du contrat social (1762)', source: b('Public domain', 'Domaine public') };

const C = 'r-philosophical-prose';
export default [
  lesson(C, 1, ['pascal-the-thinking-reed', 'pascal-le-roseau-pensant'],
    b('Pascal: the thinking reed', 'Pascal : le roseau pensant'),
    b('Understand Pascal’s antithesis between human weakness and the greatness of thought.', 'Comprendre l’antithèse pascalienne entre la faiblesse humaine et la grandeur de la pensée.'),
    [b('Recognise an antithesis', 'Reconnaître une antithèse'), b('Understand ne… point', 'Comprendre ne… point'), b('Interpret a play on words', 'Interpréter un jeu de mots')],
    13,
    [
      card(b('Antithesis', 'L’antithèse'), b('An **antithèse** brings two opposite ideas together to make a point: **le plus faible de la nature / un roseau pensant**. Pascal shows that man is fragile physically but great because he **thinks**: he knows he is weak.', 'L’**antithèse** rapproche deux idées opposées pour frapper l’esprit : **le plus faible de la nature / un roseau pensant**. Pascal montre que l’homme est fragile physiquement mais grand parce qu’il **pense** : il sait qu’il est faible.')),
      doc(PASCAL, b('Why is man a « roseau »?', 'Pourquoi l’homme est-il un « roseau » ?'), [b('Because he is physically fragile', 'Parce qu’il est physiquement fragile'), b('Because he lives near water', 'Parce qu’il vit près de l’eau'), b('Because he is tall', 'Parce qu’il est grand'), b('Because he is green', 'Parce qu’il est vert')]),
      doc(PASCAL, b('What makes man great, according to Pascal?', 'Qu’est-ce qui fait la grandeur de l’homme selon Pascal ?'), [b('His ability to think', 'Sa capacité de penser'), b('His strength', 'Sa force'), b('His wealth', 'Sa richesse'), b('Nature', 'La nature')]),
      doc(PASCAL, b('In « Le cœur a ses raisons que la raison ne connaît point », what does the play on « raisons / raison » mean?', 'Dans « Le cœur a ses raisons que la raison ne connaît point », que signifie le jeu sur « raisons / raison » ?'), [b('Feelings have their own logic that the intellect cannot grasp.', 'Les sentiments ont leur propre logique que l’intelligence ne peut saisir.'), b('The heart is always wrong.', 'Le cœur a toujours tort.'), b('Reason knows everything.', 'La raison sait tout.'), b('The heart is a muscle.', 'Le cœur est un muscle.')]),
      tip(b('Older French', 'Le français classique'), b('**ne… point** = ne… pas (stronger, classical). You will also meet **ne… guère** (hardly) and the inversion of pronouns: **ne se peuvent regarder** = ne peuvent se regarder.', '**ne… point** = ne… pas (plus fort, classique). On rencontre aussi **ne… guère** (à peine) et l’antéposition du pronom : **ne se peuvent regarder** = ne peuvent se regarder.')),
      pairs(P.match, [['un roseau', b('a reed', 'plante au bord de l’eau')], ['ne… point', b('not at all (classical)', 'ne… pas')], ['la grandeur', b('greatness', 'noblesse')], ['saisir', b('to grasp', 'comprendre')]]),
      say('L’homme n’est qu’un roseau, le plus faible de la nature ; mais c’est un roseau pensant.', 'Man is but a reed, the weakest in nature; but he is a thinking reed.'),
    ],
    [
      b('Antithesis: two opposed ideas (faible / pensant).', 'Antithèse : deux idées opposées (faible / pensant).'),
      b('Pascal: man is fragile but great because he thinks.', 'Pascal : l’homme est fragile mais grand parce qu’il pense.'),
      b('ne… point = ne… pas (classical).', 'ne… point = ne… pas (classique).'),
    ],
    [['la faiblesse', b('weakness', 'manque de force')], ['pensant', b('thinking', 'qui pense')], ['le cœur', b('the heart', 'siège des sentiments')]],
  ),
  lesson(C, 2, ['the-maxim', 'la-maxime'],
    b('La Rochefoucauld and the art of the maxim', 'La Rochefoucauld et l’art de la maxime'),
    b('Understand the irony and the pessimism hidden in short maxims.', 'Comprendre l’ironie et le pessimisme cachés dans des maximes brèves.'),
    [b('Recognise a maxim', 'Reconnaître une maxime'), b('Decode irony', 'Décoder l’ironie'), b('Understand the moralist’s view of human nature', 'Comprendre le regard du moraliste sur la nature humaine')],
    13,
    [
      card(b('The maxim', 'La maxime'), b('A **maxime** is a short, general sentence about human nature, often **in the present**, with a surprising turn. La Rochefoucauld unmasks **self-love** (l’amour-propre) behind our virtues.', 'Une **maxime** est une phrase brève et générale sur la nature humaine, souvent **au présent**, avec une chute surprenante. La Rochefoucauld démasque l’**amour-propre** derrière nos vertus.')),
      doc(MAXIMES, b('« Nous avons tous assez de force pour supporter les maux d’autrui » is ironic because…', '« Nous avons tous assez de force pour supporter les maux d’autrui » est ironique, car…'), [b('it is easy to bear other people’s suffering, not our own', 'il est facile de supporter les souffrances des autres, pas les siennes'), b('we are all very strong', 'nous sommes tous très forts'), b('we must help others', 'il faut aider les autres'), b('suffering does not exist', 'la souffrance n’existe pas')]),
      doc(MAXIMES, b('Why is hypocrisy « un hommage que le vice rend à la vertu »?', 'Pourquoi l’hypocrisie est-elle « un hommage que le vice rend à la vertu » ?'), [b('Pretending to be virtuous shows that virtue is valued.', 'Faire semblant d’être vertueux montre qu’on reconnaît la valeur de la vertu.'), b('Hypocrites are virtuous.', 'Les hypocrites sont vertueux.'), b('Vice is better than virtue.', 'Le vice vaut mieux que la vertu.'), b('Virtue is a lie.', 'La vertu est un mensonge.')]),
      doc(MAXIMES, b('What do the sun and death have in common in the third maxim?', 'Qu’ont en commun le soleil et la mort dans la troisième maxime ?'), [b('We cannot face either of them directly.', 'On ne peut regarder ni l’un ni l’autre en face.'), b('They are both hot.', 'Ils sont tous deux chauds.'), b('They both disappear at night.', 'Ils disparaissent la nuit.'), b('They are both beautiful.', 'Ils sont tous deux beaux.')]),
      sort(b('Feature of a maxim or not?', 'Caractéristique d’une maxime ou non ?'), [b('typical of a maxim', 'typique de la maxime'), b('not typical', 'non typique')], [['brève', 0], ['au présent de vérité générale', 0], ['un long récit', 1], ['une chute inattendue', 0], ['des dialogues', 1]]),
      pairs(P.match, [['autrui', b('others, other people', 'les autres')], ['les maux', b('ills, sufferings', 'malheurs')], ['un hommage', b('a tribute', 'marque de respect')], ['l’amour-propre', b('self-love, vanity', 'amour de soi')]]),
      mc(P.meaning, [b('cannot be looked at directly', 'ne peuvent pas se regarder en face'), b('do not want to look', 'ne veulent pas regarder'), b('look at each other', 'se regardent l’un l’autre'), b('are always visible', 'sont toujours visibles')], { fr: 'ne se peuvent regarder fixement' }),
    ],
    [
      b('Maxim: short, general, present tense, surprising turn.', 'Maxime : brève, générale, au présent, chute surprenante.'),
      b('La Rochefoucauld unmasks self-love (l’amour-propre).', 'La Rochefoucauld démasque l’amour-propre.'),
      b('autrui = other people; les maux = sufferings.', 'autrui = les autres ; les maux = les souffrances.'),
    ],
    [['un moraliste', b('a moralist', 'observateur des mœurs')], ['démasquer', b('to unmask', 'révéler')], ['la vertu', b('virtue', 'qualité morale')]],
  ),
  lesson(C, 3, ['enlightenment-formulas', 'formules-des-lumieres'],
    b('Formulas of the Enlightenment, and commenting on a quotation', 'Formules des Lumières, et commenter une citation'),
    b('Understand Descartes, Voltaire and Rousseau and write a short commentary.', 'Comprendre Descartes, Voltaire et Rousseau et rédiger un court commentaire.'),
    [b('Interpret a formula in its context', 'Interpréter une formule dans son contexte'), b('Recognise irony and paradox', 'Reconnaître ironie et paradoxe'), b('Write a commentary on a quotation', 'Rédiger le commentaire d’une citation')],
    13,
    [
      doc(LUMIERES, b('Descartes’s sentence is partly ironic because…', 'La phrase de Descartes est en partie ironique, car…'), [b('everyone thinks they have enough good sense, even those who lack it', 'chacun pense avoir assez de bon sens, même ceux qui en manquent'), b('good sense is rare', 'le bon sens est rare'), b('only philosophers have good sense', 'seuls les philosophes ont du bon sens'), b('good sense can be bought', 'le bon sens s’achète')]),
      doc(LUMIERES, b('What does « Il faut cultiver notre jardin » mean at the end of Candide?', 'Que signifie « Il faut cultiver notre jardin » à la fin de Candide ?'), [b('Stop vain speculation and do useful, concrete work.', 'Cesser les spéculations vaines et faire un travail utile et concret.'), b('Become a gardener.', 'Devenir jardinier.'), b('Buy a garden.', 'Acheter un jardin.'), b('Eat more vegetables.', 'Manger plus de légumes.')]),
      doc(LUMIERES, b('Rousseau’s sentence is a paradox because…', 'La phrase de Rousseau est un paradoxe, car…'), [b('humans are free by nature yet chained by society', 'l’homme est libre par nature mais enchaîné par la société'), b('humans are born in chains', 'l’homme naît enchaîné'), b('freedom does not exist', 'la liberté n’existe pas'), b('society is perfect', 'la société est parfaite')]),
      tip(b('Commenting on a quotation', 'Commenter une citation'), b('1. **Situate** it (author, work, century). 2. **Explain** it in your own words. 3. **Analyse** its form (antithesis, irony, image). 4. **Discuss** its relevance today, with an example. Use **ainsi, autrement dit, on peut toutefois objecter que, aujourd’hui encore**.', '1. **Situer** (auteur, œuvre, siècle). 2. **Expliquer** avec vos mots. 3. **Analyser** la forme (antithèse, ironie, image). 4. **Discuter** sa portée aujourd’hui, avec un exemple. Employez **ainsi, autrement dit, on peut toutefois objecter que, aujourd’hui encore**.')),
      write(b('Comment on a quotation.', 'Commentez une citation.'), b('Choose one quotation of this course and write a short commentary: situate it, explain it, analyse its form and discuss its relevance today.', 'Choisissez une citation de ce cours et rédigez un court commentaire : situez-la, expliquez-la, analysez sa forme et discutez sa portée aujourd’hui.'), 90, 150,
        [b('The author and the work', 'L’auteur et l’œuvre'), b('An explanation in your own words', 'Une explication avec vos mots'), b('One stylistic device named', 'Un procédé stylistique nommé'), b('A modern example or objection', 'Un exemple ou une objection d’aujourd’hui')],
        'Dans ses Pensées, Pascal affirme que « l’homme n’est qu’un roseau, le plus faible de la nature ; mais c’est un roseau pensant ». Autrement dit, l’être humain est d’une grande fragilité physique, mais il possède une dignité unique : il sait qu’il est fragile et peut réfléchir sur sa condition. La force de la formule repose sur une antithèse entre la faiblesse du roseau et la grandeur de la pensée, que souligne le « mais ». Aujourd’hui encore, face aux crises climatiques, cette idée garde toute sa portée : notre vulnérabilité ne nous dispense pas de penser et d’agir lucidement.',
        { phrases: ['Dans…, X affirme que…', 'Autrement dit…', 'La force de la formule repose sur…', 'On peut toutefois objecter que…', 'Aujourd’hui encore…'] }),
      pairs(P.match, [['le bon sens', b('common sense', 'jugement raisonnable')], ['les fers', b('chains, shackles', 'chaînes')], ['cultiver', b('to cultivate', 'travailler la terre')], ['les Lumières', b('the Enlightenment', 'mouvement du XVIIIe siècle')]]),
      say('L’homme est né libre, et partout il est dans les fers.', 'Man is born free, and everywhere he is in chains.'),
    ],
    [
      b('Descartes: irony on good sense; Voltaire: act concretely; Rousseau: a paradox on freedom.', 'Descartes : ironie sur le bon sens ; Voltaire : agir concrètement ; Rousseau : paradoxe de la liberté.'),
      b('Commentary: situate, explain, analyse, discuss.', 'Commentaire : situer, expliquer, analyser, discuter.'),
      b('Useful: autrement dit, on peut toutefois objecter que, aujourd’hui encore.', 'Utile : autrement dit, on peut toutefois objecter que, aujourd’hui encore.'),
    ],
    [['la portée', b('the significance, scope', 'importance')], ['un paradoxe', b('a paradox', 'idée contraire à l’opinion commune')], ['vain', b('vain, futile', 'inutile')]],
  ),
];
