import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Bien qu’il pleuve, malgré la pluie, il pleut pourtant: expressing concession and opposition is the key to a nuanced argument at B2, in exams (DELF, TCF, TEF) and at work. This course sorts the connectors by grammar (conjunction + subjunctive, preposition + noun, adverb), contrasts opposition (alors que, tandis que) and concession (bien que, même si), and practises them in a short argumentative text.',
    'Bien qu’il pleuve, malgré la pluie, il pleut pourtant : exprimer la concession et l’opposition est la clé d’une argumentation nuancée au niveau B2, aux examens (DELF, TCF, TEF) comme au travail. Ce cours classe les connecteurs selon leur construction (conjonction + subjonctif, préposition + nom, adverbe), distingue l’opposition (alors que, tandis que) de la concession (bien que, même si), et les met en pratique dans un court texte argumentatif.',
  ),
  outcomes: [
    b('Use bien que and quoique + subjunctive', 'Employer bien que et quoique + subjonctif'),
    b('Use malgré and en dépit de + noun', 'Employer malgré et en dépit de + nom'),
    b('Use pourtant, cependant, néanmoins, toutefois', 'Employer pourtant, cependant, néanmoins, toutefois'),
    b('Distinguish opposition and concession in an argument', 'Distinguer opposition et concession dans une argumentation'),
  ],
};

const C = 'concession';
export default [
  lesson(C, 1, ['opposition-alors-que', 'opposition-alors-que'],
    b('Opposition: alors que, tandis que, au contraire', 'L’opposition : alors que, tandis que, au contraire'),
    b('Contrast two facts with alors que, tandis que, par contre and en revanche.', 'Opposer deux faits avec alors que, tandis que, par contre et en revanche.'),
    [b('Contrast two facts', 'Opposer deux faits'), b('Use en revanche in formal style', 'Employer en revanche à l’écrit soutenu'), b('Compare two options', 'Comparer deux options')],
    13,
    [
      card(b('Two facts face to face', 'Deux faits face à face'), b('**Opposition** simply puts two facts side by side: **alors que / tandis que** + indicative, **par contre** (spoken) / **en revanche** (formal), **au contraire**. **Paul adore la ville, alors que sa femme préfère la campagne.**', 'L’**opposition** met simplement deux faits côte à côte : **alors que / tandis que** + indicatif, **par contre** (oral) / **en revanche** (soutenu), **au contraire**. **Paul adore la ville, alors que sa femme préfère la campagne.**'), {
        ex: [['Le loyer est cher, en revanche le quartier est très sûr.', 'The rent is high; on the other hand the area is very safe.'], ['Il parle beaucoup tandis que son frère est très discret.', 'He talks a lot whereas his brother is very quiet.']],
      }),
      mc(P.word, ['alors que', 'bien que', 'malgré', 'pourtant'], { fr: 'Je travaille de jour ___ mon conjoint travaille de nuit.' }),
      mc(P.best, ['Le salaire est modeste ; en revanche, les horaires sont souples.', 'Le salaire est modeste ; en revanche de, les horaires sont souples.', 'Le salaire est modeste ; malgré, les horaires sont souples.', 'Le salaire est modeste ; bien que les horaires soient souples.'], { fr: 'Dans un rapport :' }),
      sort(b('Spoken or formal?', 'Oral ou soutenu ?'), [b('spoken', 'oral'), b('formal', 'soutenu')], [['par contre', 0], ['en revanche', 1], ['mais bon', 0], ['néanmoins', 1], ['quand même', 0], ['toutefois', 1]]),
      gap(P.complete, 'Ma sœur est très organisée, ___ moi, je suis plutôt désordonné.', [['alors que', 'tandis que']]),
      ord(P.order, 'En ville, tout est proche, alors qu’à la campagne il faut une voiture.', { tr: 'In town everything is close by, whereas in the countryside you need a car.' }),
      say('J’aime beaucoup mon travail ; par contre, le trajet est vraiment long.', 'I really like my job; on the other hand, the commute is really long.'),
    ],
    [
      b('Opposition: alors que / tandis que + indicative.', 'Opposition : alors que / tandis que + indicatif.'),
      b('par contre (spoken) / en revanche (formal).', 'par contre (oral) / en revanche (soutenu).'),
      b('Opposition = two facts side by side, no surprise.', 'Opposition = deux faits mis côte à côte, sans surprise.'),
    ],
    [['souple', b('flexible', 'adaptable')], ['désordonné', b('untidy, disorganised', 'qui manque d’ordre')], ['discret', b('quiet, reserved', 'réservé')]],
  ),
  lesson(C, 2, ['concession-bien-que-malgre', 'concession-bien-que-malgre'],
    b('Concession: bien que, malgré, même si', 'La concession : bien que, malgré, même si'),
    b('Express an unexpected result with the right construction after each connector.', 'Exprimer un résultat inattendu avec la bonne construction après chaque connecteur.'),
    [b('Use bien que + subjunctive', 'Employer bien que + subjonctif'), b('Use malgré + noun', 'Employer malgré + nom'), b('Use même si + indicative', 'Employer même si + indicatif')],
    13,
    [
      card(b('Three constructions', 'Trois constructions'), b('**Concession** = a fact that should prevent the other, but does not. **bien que / quoique + subjunctive**: Bien qu’il soit malade, il travaille. **malgré / en dépit de + noun**: Malgré sa maladie, il travaille. **même si + indicative**: Même s’il est malade, il travaille.', 'La **concession** = un fait qui devrait empêcher l’autre, mais ne l’empêche pas. **bien que / quoique + subjonctif** : Bien qu’il soit malade, il travaille. **malgré / en dépit de + nom** : Malgré sa maladie, il travaille. **même si + indicatif** : Même s’il est malade, il travaille.'), {
        table: { head: [b('connector', 'connecteur'), b('followed by', 'suivi de'), b('example', 'exemple')], rows: [['bien que, quoique', b('subjunctive', 'subjonctif'), 'bien qu’il fasse froid'], ['malgré, en dépit de', b('noun', 'nom'), 'malgré le froid'], ['même si', b('indicative', 'indicatif'), 'même s’il fait froid']] },
      }),
      trap(b('Never « malgré que » in careful French', 'Pas de « malgré que » à l’écrit soigné'), b('« Malgré que » + subjunctive is common in speech but criticised in writing. In an exam, use **bien que** + subjunctive or **malgré** + noun.', '« Malgré que » + subjonctif est courant à l’oral mais critiqué à l’écrit. À l’examen, employez **bien que** + subjonctif ou **malgré** + nom.')),
      mc(P.form, ['soit', 'est', 'sera', 'serait'], { fr: 'Bien que le projet ___ ambitieux, nous le réaliserons.' }),
      mc(P.word, ['Malgré', 'Bien que', 'Même si', 'Quoique'], { fr: '___ la neige, les trains circulent normalement.' }),
      mc(P.form, ['a', 'ait', 'aura', 'eût'], { fr: 'Même s’il ___ peu d’expérience, il apprend vite.' }),
      gap(P.complete, '___ ses efforts, il n’a pas obtenu le poste, ___ son CV soit excellent.', ['Malgré', 'bien que'], { choices: [['Malgré', 'Bien que'], ['bien que', 'malgré']] }),
      doc({ title: b('Press release', 'Communiqué'), text: 'Malgré une hausse de 12 % du prix des matières premières, l’entreprise a maintenu ses tarifs. Bien que la conjoncture reste difficile, la direction prévoit d’embaucher vingt personnes cette année.' }, P.read, [b('Prices stayed the same despite higher costs.', 'Les prix sont restés stables malgré la hausse des coûts.'), b('Prices went up by 12%.', 'Les prix ont augmenté de 12 %.'), b('The company will lay off twenty people.', 'L’entreprise va licencier vingt personnes.'), b('The economic situation is excellent.', 'La conjoncture est excellente.')]),
      dict('Bien qu’il fasse très froid, les enfants jouent dehors.', { voice: 'm' }),
    ],
    [
      b('bien que / quoique + subjunctive.', 'bien que / quoique + subjonctif.'),
      b('malgré / en dépit de + noun.', 'malgré / en dépit de + nom.'),
      b('même si + indicative (never subjunctive).', 'même si + indicatif (jamais de subjonctif).'),
    ],
    [['la conjoncture', b('the economic situation', 'la situation économique')], ['embaucher', b('to hire', 'recruter')], ['les matières premières', b('raw materials', 'ressources de base')]],
  ),
  lesson(C, 3, ['adverbs-and-argument', 'adverbes-et-argumentation'],
    b('Pourtant, cependant, néanmoins: nuancing an argument', 'Pourtant, cependant, néanmoins : nuancer un argument'),
    b('Use concessive adverbs and the structure « certes… mais » in a short argument.', 'Employer les adverbes de concession et la structure « certes… mais » dans une courte argumentation.'),
    [b('Use pourtant, cependant, néanmoins, toutefois', 'Employer pourtant, cependant, néanmoins, toutefois'), b('Concede then counter with certes… mais', 'Concéder puis contredire avec certes… mais'), b('Write a nuanced paragraph', 'Rédiger un paragraphe nuancé')],
    13,
    [
      card(b('Concessive adverbs', 'Les adverbes de concession'), b('They start a new clause, after a full stop or a semicolon: **pourtant, cependant, néanmoins, toutefois, quand même** (spoken). **Il a beaucoup révisé ; pourtant, il a échoué.**', 'Ils ouvrent une nouvelle proposition, après un point ou un point-virgule : **pourtant, cependant, néanmoins, toutefois, quand même** (oral). **Il a beaucoup révisé ; pourtant, il a échoué.**'), {
        ex: [['Le film est long ; il est néanmoins passionnant.', 'The film is long; it is nevertheless gripping.'], ['C’est cher, mais je l’achète quand même.', 'It’s expensive, but I’m buying it anyway.']],
      }),
      tip(b('Certes… mais: the exam structure', 'Certes… mais : la structure d’examen'), b('Concede a point, then put forward yours: **Certes, le télétravail isole. Mais il fait gagner un temps précieux.** Also: **Il est vrai que… ; cependant…**, **On peut admettre que… ; toutefois…**', 'Concédez un point, puis avancez le vôtre : **Certes, le télétravail isole. Mais il fait gagner un temps précieux.** Aussi : **Il est vrai que… ; cependant…**, **On peut admettre que… ; toutefois…**')),
      mc(P.best, ['Certes, la voiture est pratique, mais elle pollue.', 'Certes, la voiture est pratique, donc elle pollue.', 'Certes que la voiture est pratique, elle pollue.', 'Malgré certes la voiture, elle pollue.']),
      mc(P.word, ['néanmoins', 'donc', 'parce que', 'ainsi'], { fr: 'La réunion a été longue ; elle a ___ permis de trouver une solution.' }),
      pairs(P.match, [['certes', b('admittedly', 'il est vrai')], ['pourtant', b('and yet', 'malgré cela')], ['néanmoins', b('nevertheless', 'toutefois')], ['quand même', b('anyway, all the same', 'malgré tout (oral)')]]),
      gap(P.complete, 'Il est vrai que la ville est chère ; ___, on y trouve plus d’emplois.', [['cependant', 'toutefois', 'néanmoins', 'pourtant']]),
      write(b('Write a nuanced paragraph.', 'Rédigez un paragraphe nuancé.'), b('Is it better to live in the city or in the countryside? Give one advantage of the side you do not choose, then defend your opinion. Use at least three connectors of concession or opposition.', 'Vaut-il mieux vivre en ville ou à la campagne ? Concédez un avantage au choix que vous ne retenez pas, puis défendez votre opinion. Employez au moins trois connecteurs de concession ou d’opposition.'), 60, 120,
        [b('One concession (certes, il est vrai que…)', 'Une concession (certes, il est vrai que…)'), b('A connector + subjunctive (bien que)', 'Un connecteur + subjonctif (bien que)'), b('malgré + noun', 'malgré + nom'), b('A clear final opinion', 'Une opinion finale claire')],
        'Certes, la campagne offre le calme et un air plus pur. Pourtant, je préfère vivre en ville. Bien que les loyers y soient plus élevés, tout est accessible à pied ou en transport en commun, alors qu’à la campagne la voiture est indispensable. De plus, malgré le bruit, la ville propose une vie culturelle riche et davantage d’emplois. Pour moi, ces avantages l’emportent largement sur les inconvénients.',
        { phrases: ['Certes, …', 'Il est vrai que…', 'Bien que + subjonctif', 'Malgré + nom', 'Pourtant, …', 'En revanche, …'] }),
      say('Certes, ce projet coûte cher ; néanmoins, il est indispensable pour l’avenir.', 'Admittedly this project is expensive; nevertheless, it is essential for the future.'),
    ],
    [
      b('pourtant, cependant, néanmoins, toutefois start a new clause.', 'pourtant, cependant, néanmoins, toutefois ouvrent une nouvelle proposition.'),
      b('Certes… mais / Il est vrai que… ; cependant…', 'Certes… mais / Il est vrai que… ; cependant…'),
      b('quand même = spoken “anyway”.', 'quand même = « malgré tout », à l’oral.'),
    ],
    [['l’emporter sur', b('to outweigh', 'être plus important que')], ['un inconvénient', b('a drawback', 'un désavantage')], ['échouer', b('to fail', 'ne pas réussir')]],
  ),
];
