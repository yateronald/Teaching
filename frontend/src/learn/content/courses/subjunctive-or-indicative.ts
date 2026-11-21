import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je pense qu’il vient, mais je ne pense pas qu’il vienne. Je suis sûr qu’elle a raison, mais je doute qu’elle ait raison. Choosing between the subjunctive and the indicative is one of the clearest signs of a B2 level. This course gives you the logic behind the choice (certainty vs. doubt, fact vs. feeling or will), the verbs and conjunctions that trigger each mood, the special case of opinion verbs in the negative, and the superlative + subjunctive.',
    'Je pense qu’il vient, mais je ne pense pas qu’il vienne. Je suis sûr qu’elle a raison, mais je doute qu’elle ait raison. Choisir entre subjonctif et indicatif est l’un des signes les plus nets d’un niveau B2. Ce cours donne la logique du choix (certitude ou doute, fait ou sentiment et volonté), les verbes et conjonctions qui déclenchent chaque mode, le cas des verbes d’opinion à la forme négative, et le superlatif + subjonctif.',
  ),
  outcomes: [
    b('Use the indicative for certainty and facts', 'Employer l’indicatif pour la certitude et les faits'),
    b('Use the subjunctive for doubt, feeling and will', 'Employer le subjonctif pour le doute, le sentiment et la volonté'),
    b('Handle penser / croire in the negative and in questions', 'Maîtriser penser / croire à la forme négative et interrogative'),
    b('Choose the mood after conjunctions', 'Choisir le mode après les conjonctions'),
  ],
};

const C = 'subjunctive-or-indicative';
export default [
  lesson(C, 1, ['certainty-or-doubt', 'certitude-ou-doute'],
    b('Certainty or doubt?', 'Certitude ou doute ?'),
    b('Indicative for what you consider real, subjunctive for what is uncertain, wanted or felt.', 'Indicatif pour ce que l’on considère comme réel, subjonctif pour l’incertain, le voulu ou le ressenti.'),
    [b('Sort verbs by meaning', 'Classer les verbes selon leur sens'), b('Use the indicative after certainty', 'Employer l’indicatif après la certitude'), b('Use the subjunctive after doubt', 'Employer le subjonctif après le doute')],
    13,
    [
      card(b('The logic', 'La logique'), b('**Indicative** = a fact presented as real: **je sais, je suis sûr, il est certain, il est évident, il me semble que** + indicative. **Subjunctive** = not presented as a fact: **je veux, je souhaite, je doute, il est possible, il faut, je regrette, je suis content que** + subjunctive.', '**Indicatif** = un fait présenté comme réel : **je sais, je suis sûr, il est certain, il est évident, il me semble que** + indicatif. **Subjonctif** = ce qui n’est pas présenté comme un fait : **je veux, je souhaite, je doute, il est possible, il faut, je regrette, je suis content que** + subjonctif.'), {
        ex: [['Je suis sûr qu’il viendra.', 'I’m sure he’ll come.'], ['Je doute qu’il vienne.', 'I doubt he’ll come.'], ['Il est évident qu’elle a raison.', 'It’s obvious she’s right.'], ['Il est possible qu’elle ait raison.', 'She may be right.']],
      }),
      trap(b('Probable vs possible', 'Probable ou possible'), b('**Il est probable que** + indicative (seen as likely real). **Il est possible que** + subjunctive. And **espérer que** takes the **indicative**: **J’espère que tu vas bien.**', '**Il est probable que** + indicatif. **Il est possible que** + subjonctif. Et **espérer que** prend l’**indicatif** : **J’espère que tu vas bien.**')),
      sort(b('Indicative or subjunctive?', 'Indicatif ou subjonctif ?'), [b('+ indicative', '+ indicatif'), b('+ subjunctive', '+ subjonctif')], [['je sais que', 0], ['je doute que', 1], ['il est probable que', 0], ['il est possible que', 1], ['j’espère que', 0], ['je souhaite que', 1], ['il me semble que', 0], ['il semble que', 1]]),
      mc(P.form, ['vas', 'ailles', 'iras', 'allais'], { fr: 'J’espère que tu ___ mieux.' }),
      mc(P.form, ['puisse', 'peut', 'pourra', 'pourrait'], { fr: 'Il est possible que le vol ___ partir à l’heure.' }),
      mc(P.form, ['fera', 'fasse', 'faisait', 'fasses'], { fr: 'Il est probable qu’il ___ beau demain.' }),
      gap(P.complete, 'Je suis certain qu’elle ___ (avoir) le poste, mais je doute qu’elle l’___ (accepter).', ['aura', 'accepte']),
      say('J’espère que tu vas bien et je souhaite que tu viennes nous voir bientôt.', 'I hope you’re well and I hope you come to see us soon.'),
    ],
    [
      b('Certainty / fact → indicative (je sais, je suis sûr, il est évident que).', 'Certitude / fait → indicatif (je sais, je suis sûr, il est évident que).'),
      b('Will, doubt, feeling, possibility → subjunctive.', 'Volonté, doute, sentiment, possibilité → subjonctif.'),
      b('espérer que + indicative; il est probable que + indicative.', 'espérer que + indicatif ; il est probable que + indicatif.'),
    ],
    [['douter', b('to doubt', 'ne pas être sûr')], ['souhaiter', b('to wish', 'désirer')], ['évident', b('obvious', 'clair')]],
  ),
  lesson(C, 2, ['opinion-verbs', 'verbes-d-opinion'],
    b('Je pense que… / je ne pense pas que…', 'Je pense que… / je ne pense pas que…'),
    b('Opinion verbs take the indicative when affirmative, often the subjunctive when negative or inverted.', 'Les verbes d’opinion prennent l’indicatif à l’affirmative, souvent le subjonctif à la forme négative ou interrogative avec inversion.'),
    [b('Use penser, croire, trouver + indicative', 'Employer penser, croire, trouver + indicatif'), b('Switch to the subjunctive in the negative', 'Passer au subjonctif à la forme négative'), b('Give a nuanced opinion', 'Donner une opinion nuancée')],
    13,
    [
      card(b('Affirmative vs negative', 'Affirmatif ou négatif'), b('**Je pense / je crois / je trouve / il me semble que** + indicative: the speaker presents it as true. In the **negative** or an **inverted question**, doubt appears: **Je ne pense pas qu’il soit là. Croyez-vous qu’il ait raison ?**', '**Je pense / je crois / je trouve / il me semble que** + indicatif : le locuteur le présente comme vrai. À la **forme négative** ou à l’**interrogation avec inversion**, le doute apparaît : **Je ne pense pas qu’il soit là. Croyez-vous qu’il ait raison ?**'), {
        ex: [['Je crois qu’il a raison.', 'I think he’s right.'], ['Je ne crois pas qu’il ait raison.', 'I don’t think he’s right.'], ['Pensez-vous que ce soit possible ?', 'Do you think it’s possible?']],
      }),
      mc(P.form, ['est', 'soit', 'sera', 'soient'], { fr: 'Je trouve que ce film ___ trop long.' }),
      mc(P.form, ['soit', 'est', 'sera', 'était'], { fr: 'Je ne pense pas que ce ___ une bonne idée.' }),
      mc(P.form, ['puissions', 'pouvons', 'pourrons', 'pouvions'], { fr: 'Croyez-vous que nous ___ finir à temps ?' }),
      pairs(P.match, [['Je suis convaincu que…', b('I’m convinced that… (+ indicative)', 'certitude forte')], ['Je ne suis pas sûr que…', b('I’m not sure that… (+ subjunctive)', 'incertitude')], ['Il me semble que…', b('It seems to me that… (+ indicative)', 'opinion modérée')], ['Ça m’étonnerait que…', b('I’d be surprised if… (+ subjunctive)', 'doute')]]),
      gap(P.complete, 'Je pense que le projet ___ (être) utile, mais je ne crois pas qu’il ___ (être) rentable.', ['est', 'soit']),
      dlg(b('A team discussion', 'Une discussion d’équipe'), undefined, [['Manon', 'f'], ['Vous', 'm']], [
        [0, 'Tu crois qu’on peut lancer le site en mars ?', 'Do you think we can launch the website in March?'],
        [1, { options: ['Honnêtement, ça m’étonnerait qu’on soit prêts en mars.', 'Honnêtement, ça m’étonnerait qu’on est prêts en mars.', 'Honnêtement, je pense qu’on soit prêts en mars.'] }],
        [0, 'Tu penses qu’il faut plus de développeurs ?', 'Do you think we need more developers?'],
        [1, { options: ['Oui, je pense qu’il nous faut au moins une personne de plus.', 'Oui, je pense qu’il nous faille une personne de plus.', 'Oui, je ne pense pas qu’il nous faut personne.'] }],
      ]),
      dict('Je ne suis pas sûr qu’il puisse venir, mais je pense qu’il essaiera.', { voice: 'f' }),
    ],
    [
      b('Affirmative opinion: je pense / crois / trouve que + indicative.', 'Opinion affirmative : je pense / crois / trouve que + indicatif.'),
      b('Negative or inverted question: often subjunctive (je ne pense pas que ce soit…).', 'Négation ou inversion : souvent subjonctif (je ne pense pas que ce soit…).'),
      b('Ça m’étonnerait que + subjunctive = I doubt it.', 'Ça m’étonnerait que + subjonctif = j’en doute.'),
    ],
    [['rentable', b('profitable', 'qui rapporte de l’argent')], ['lancer', b('to launch', 'mettre en route')], ['convaincu', b('convinced', 'persuadé')]],
  ),
  lesson(C, 3, ['conjunctions-and-superlatives', 'conjonctions-et-superlatifs'],
    b('Conjunctions and superlatives', 'Les conjonctions et le superlatif'),
    b('Choose the mood after conjunctions and after a superlative.', 'Choisir le mode après les conjonctions et après un superlatif.'),
    [b('Sort conjunctions by mood', 'Classer les conjonctions selon le mode'), b('Use avant que but après que + indicative', 'Employer avant que mais après que + indicatif'), b('Use le seul / le meilleur qui + subjunctive', 'Employer le seul / le meilleur qui + subjonctif')],
    13,
    [
      card(b('Conjunctions', 'Les conjonctions'), b('**Subjunctive**: pour que, afin que, avant que, jusqu’à ce que, bien que, à condition que, sans que, à moins que. **Indicative**: parce que, pendant que, après que, dès que, alors que, si bien que. The famous pair: **avant qu’il parte** but **après qu’il est parti**.', '**Subjonctif** : pour que, afin que, avant que, jusqu’à ce que, bien que, à condition que, sans que, à moins que. **Indicatif** : parce que, pendant que, après que, dès que, alors que, si bien que. La paire célèbre : **avant qu’il parte** mais **après qu’il est parti**.'), {
        ex: [['Je t’explique pour que tu comprennes.', 'I’m explaining so that you understand.'], ['On attend jusqu’à ce qu’il arrive.', 'We’re waiting until he arrives.'], ['Après qu’il est parti, on a rangé.', 'After he left, we tidied up.']],
      }),
      tip(b('Superlative + subjunctive', 'Superlatif + subjonctif'), b('After **le seul, l’unique, le premier, le dernier, le meilleur, le plus…**, the subjunctive adds subjectivity: **C’est le meilleur film que j’aie vu.** The indicative states a fact: **C’est le premier qui est arrivé.**', 'Après **le seul, l’unique, le premier, le dernier, le meilleur, le plus…**, le subjonctif ajoute une nuance subjective : **C’est le meilleur film que j’aie vu.** L’indicatif énonce un fait : **C’est le premier qui est arrivé.**')),
      sort(b('Which mood after the conjunction?', 'Quel mode après la conjonction ?'), [b('+ subjunctive', '+ subjonctif'), b('+ indicative', '+ indicatif')], [['pour que', 0], ['parce que', 1], ['avant que', 0], ['après que', 1], ['à condition que', 0], ['pendant que', 1], ['sans que', 0], ['dès que', 1]]),
      mc(P.form, ['sois', 'es', 'seras', 'étais'], { fr: 'Je partirai avant que tu ne ___ réveillé.' }),
      mc(P.form, ['aura fini', 'ait fini', 'finisse', 'avait finie'], { fr: 'Nous sortirons après qu’il ___ son travail.', explain: b('Après que + indicative (here futur antérieur).', 'Après que + indicatif (ici futur antérieur).') }),
      mc(P.form, ['connaisse', 'connais', 'connaîtrai', 'connaissais'], { fr: 'C’est la personne la plus généreuse que je ___.' }),
      gap(P.complete, 'Je te prête ma voiture à condition que tu ___ (faire) le plein et que tu me la ___ (rendre) demain.', ['fasses', 'rendes']),
      say('Je reste ici jusqu’à ce que tout le monde soit parti.', 'I’m staying here until everyone has left.'),
    ],
    [
      b('Subjunctive: pour que, avant que, jusqu’à ce que, bien que, à condition que, sans que.', 'Subjonctif : pour que, avant que, jusqu’à ce que, bien que, à condition que, sans que.'),
      b('Indicative: parce que, pendant que, après que, dès que, alors que.', 'Indicatif : parce que, pendant que, après que, dès que, alors que.'),
      b('Superlative / le seul + subjunctive for a subjective judgment.', 'Superlatif / le seul + subjonctif pour un jugement subjectif.'),
    ],
    [['faire le plein', b('to fill up the tank', 'remplir le réservoir')], ['généreux', b('generous', 'qui donne volontiers')], ['ranger', b('to tidy up', 'mettre en ordre')]],
  ),
];
