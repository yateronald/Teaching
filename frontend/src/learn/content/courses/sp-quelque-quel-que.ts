import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Quelques amis, quels que soient les risques, quelque difficile que ce soit, quoique fatigué, quoi que tu fasses: the words of concession and indefinite quantity are among the trickiest in French spelling, and they appear constantly in formal writing and exams (DELF B2, DALF). This course untangles quelque / quel que, quoique / quoi que and their agreements, with a clear test for each.',
    'Quelques amis, quels que soient les risques, quelque difficile que ce soit, quoique fatigué, quoi que tu fasses : les mots de la concession et de la quantité indéfinie comptent parmi les plus délicats de l’orthographe française, et ils apparaissent sans cesse à l’écrit soutenu et aux examens (DELF B2, DALF). Ce cours démêle quelque / quel que, quoique / quoi que et leurs accords, avec un test clair pour chacun.',
  ),
  outcomes: [
    b('Agree quelque as a determiner', 'Accorder quelque déterminant'),
    b('Keep quelque invariable as an adverb', 'Laisser quelque adverbe invariable'),
    b('Write quel(le)(s) que + être', 'Écrire quel(le)(s) que + être'),
    b('Choose quoique / quoi que', 'Choisir quoique / quoi que'),
  ],
};

const C = 'sp-quelque-quel-que';
export default [
  lesson(C, 1, ['quelque-determiner-and-adverb', 'quelque-determinant-et-adverbe'],
    b('Quelque: determiner or adverb', 'Quelque : déterminant ou adverbe'),
    b('Agree quelque before a noun, keep it invariable before an adjective or a number.', 'Accorder quelque devant un nom, le laisser invariable devant un adjectif ou un nombre.'),
    [b('quelque(s) + noun: agrees', 'quelque(s) + nom : accord'), b('quelque + number = about', 'quelque + nombre = environ'), b('quelque + adjective + que: invariable', 'quelque + adjectif + que : invariable')],
    13,
    [
      card(b('Three uses', 'Trois emplois'), b('**Determiner + noun** → agrees: **quelques amis, quelque temps** (singular = some). **Adverb before a number** = **environ** → invariable: **Il y a quelque cinquante ans.** **Adverb before an adjective + que** = **si** → invariable: **Quelque difficiles que soient ces exercices…** (= si difficiles que…).', '**Déterminant + nom** → accord : **quelques amis, quelque temps** (singulier = un certain). **Adverbe devant un nombre** = **environ** → invariable : **Il y a quelque cinquante ans.** **Adverbe devant un adjectif + que** = **si** → invariable : **Quelque difficiles que soient ces exercices…** (= si difficiles que…).')),
      mc(P.form, ['J’ai invité quelques collègues.', 'J’ai invité quelque collègues.', 'J’ai invité quelques collègue.', 'J’ai invité quels que collègues.']),
      mc(P.form, ['La ville compte quelque deux mille habitants.', 'La ville compte quelques deux mille habitants.', 'La ville compte quelque deux milles habitants.', 'La ville compte quel que deux mille habitants.'], { explain: b('quelque = environ before a number: invariable.', 'quelque = environ devant un nombre : invariable.') }),
      gap(P.complete, 'Il est resté ___ temps à Paris et a visité ___ musées.', ['quelque', 'quelques'], { strict: true }),
      sort(b('quelque or quelques?', 'quelque ou quelques ?'), [b('quelque', 'quelque'), b('quelques', 'quelques')], [['… cent personnes (environ)', 0], ['… jours de repos', 1], ['depuis … temps', 0], ['… idées intéressantes', 1], ['… habiles qu’ils soient', 0], ['les … euros qui me restent', 1]]),
      dict('Il y a quelque vingt ans, quelques amis ont fondé ce petit théâtre.', { strict: true }),
    ],
    [
      b('quelque(s) + noun: agrees (quelques amis, quelque temps).', 'quelque(s) + nom : accord (quelques amis, quelque temps).'),
      b('quelque + number = environ: invariable.', 'quelque + nombre = environ : invariable.'),
      b('quelque + adjective + que = si: invariable.', 'quelque + adjectif + que = si : invariable.'),
    ],
    [['fonder', b('to found', 'créer')], ['habile', b('skilful', 'adroit')], ['environ', b('about, approximately', 'à peu près')]],
  ),
  lesson(C, 2, ['quel-que-soit', 'quel-que-soit'],
    b('Quel(le)(s) que + être', 'Quel(le)(s) que + être'),
    b('Write quel que in two words and agree quel with the subject of être.', 'Écrire quel que en deux mots et accorder quel avec le sujet d’être.'),
    [b('Use quel que before être', 'Employer quel que devant être'), b('Agree quel with the subject', 'Accorder quel avec le sujet'), b('Use the subjunctive', 'Employer le subjonctif')],
    13,
    [
      card(b('quel que + être (subjunctive)', 'quel que + être (subjonctif)'), b('Before **être** (or pouvoir être, devoir être) in the subjunctive, write **quel que** in **two words**, and **quel agrees with the subject** of être: **quel que soit le prix**, **quelle que soit la météo**, **quels que soient les risques**, **quelles que soient vos raisons**.', 'Devant **être** (ou pouvoir être, devoir être) au subjonctif, on écrit **quel que** en **deux mots**, et **quel s’accorde avec le sujet** d’être : **quel que soit le prix**, **quelle que soit la météo**, **quels que soient les risques**, **quelles que soient vos raisons**.')),
      mc(P.form, ['Quelles que soient vos raisons, vous devez prévenir.', 'Quelque soient vos raisons, vous devez prévenir.', 'Quels que soient vos raisons, vous devez prévenir.', 'Quelques soient vos raisons, vous devez prévenir.']),
      gap(P.complete, '___ que soit le temps et ___ que soient les difficultés, nous partirons.', ['Quel', 'quelles'], { strict: true }),
      sort(b('quel, quelle, quels or quelles que soi(en)t…?', 'quel, quelle, quels ou quelles que soi(en)t… ?'), [b('quel / quelle', 'quel / quelle'), b('quels / quelles', 'quels / quelles')], [['… que soit l’heure', 0], ['… que soient les résultats', 1], ['… que soit son âge', 0], ['… que soient ses qualités', 1]]),
      trap(b('Not « quelque soit »', 'Pas « quelque soit »'), b('« Quelque soit » is one of the most frequent mistakes in French. Before **soit / soient**, always write **quel que** in two words.', '« Quelque soit » est l’une des fautes les plus fréquentes en français. Devant **soit / soient**, écrivez toujours **quel que** en deux mots.'), { variant: 'trap' }),
      dict('Quels que soient les obstacles et quelle que soit la distance, nous arriverons.', { strict: true }),
    ],
    [
      b('Before soit / soient: quel que (two words).', 'Devant soit / soient : quel que (deux mots).'),
      b('quel agrees with the subject of être: quelle que soit la météo.', 'quel s’accorde avec le sujet d’être : quelle que soit la météo.'),
      b('Never « quelque soit ».', 'Jamais « quelque soit ».'),
    ],
    [['prévenir', b('to let know, to warn', 'informer à l’avance')], ['un obstacle', b('an obstacle', 'difficulté')], ['la météo', b('the weather (forecast)', 'le temps qu’il fait')]],
  ),
  lesson(C, 3, ['quoique-quoi-que', 'quoique-quoi-que'],
    b('Quoique or quoi que?', 'Quoique ou quoi que ?'),
    b('Distinguish quoique (= bien que) from quoi que (= whatever).', 'Distinguer quoique (= bien que) et quoi que (= quelle que soit la chose que).'),
    [b('quoique = bien que', 'quoique = bien que'), b('quoi que = whatever', 'quoi que = quelle que soit la chose'), b('Both with the subjunctive', 'Les deux avec le subjonctif')],
    13,
    [
      card(b('The bien que test', 'Le test bien que'), b('**quoique** (one word) = **bien que** (although): **Quoiqu’il soit fatigué, il travaille.** → bien qu’il soit fatigué. **quoi que** (two words) = **whatever** (quelle que soit la chose que): **Quoi que tu dises, je t’aime.** · **Quoi qu’il arrive, je serai là.** Both take the **subjunctive**.', '**quoique** (un mot) = **bien que** : **Quoiqu’il soit fatigué, il travaille.** → bien qu’il soit fatigué. **quoi que** (deux mots) = **quelle que soit la chose que** : **Quoi que tu dises, je t’aime.** · **Quoi qu’il arrive, je serai là.** Les deux se construisent avec le **subjonctif**.')),
      sort(b('quoique or quoi que?', 'quoique ou quoi que ?'), [b('quoique (bien que)', 'quoique (bien que)'), b('quoi que (whatever)', 'quoi que (quelle que soit la chose)')], [['… il pleuve, nous sortons.', 0], ['… tu fasses, fais-le bien.', 1], ['… elle soit jeune, elle est sage.', 0], ['… il arrive, appelle-moi.', 1], ['… malade, il est venu.', 0], ['… vous pensiez, c’est vrai.', 1]]),
      mc(P.form, ['Quoi que vous décidiez, nous vous soutiendrons.', 'Quoique vous décidiez, nous vous soutiendrons.', 'Quoi que vous décidez, nous vous soutiendrons.', 'Quoique vous décidez, nous vous soutiendrons.']),
      gap(P.complete, '___ il fasse froid, il sort en t-shirt. ___ on lui dise, il ne change pas.', [['Quoiqu’', 'Quoique'], ['Quoi qu’', 'Quoi que']], { strict: true }),
      dict('Quoique la route soit longue, nous partirons, quoi qu’il arrive.', { strict: true }),
      write(b('Write a formal paragraph.', 'Rédigez un paragraphe soutenu.'), b('Write 3–5 sentences (40–70 words) for a cover letter or an essay using quelque(s), quel(le)(s) que, quoique and quoi que at least once each.', 'Rédigez 3 à 5 phrases (40–70 mots) pour une lettre de motivation ou un essai en employant au moins une fois quelque(s), quel(le)(s) que, quoique et quoi que.'), 40, 70, [
        b('quelque(s) used correctly', 'quelque(s) bien employé'),
        b('quel(le)(s) que soi(en)t', 'quel(le)(s) que soi(en)t'),
        b('quoique and quoi que + subjunctive', 'quoique et quoi que + subjonctif'),
      ], 'Depuis quelques années, je travaille dans l’accueil touristique. Quelles que soient les difficultés, je garde le sourire. Quoique ce poste soit exigeant, il me passionne, et quoi que l’on me demande, je cherche toujours une solution. Je serais heureuse de mettre ces qualités au service de votre équipe.'),
    ],
    [
      b('quoique = bien que (one word).', 'quoique = bien que (un mot).'),
      b('quoi que = whatever (two words).', 'quoi que = quelle que soit la chose que (deux mots).'),
      b('Both + subjunctive.', 'Les deux + subjonctif.'),
    ],
    [['soutenir', b('to support', 'aider, appuyer')], ['sage', b('wise, well-behaved', 'raisonnable')], ['exigeant', b('demanding', 'qui demande beaucoup')]],
  ),
];
