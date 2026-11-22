import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, gap, lesson, mc, ord, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Architect complex C2 sentences with rhythm and clarity: build rising/falling periodic syntax, contrast themes through dislocated fronting, and balance clauses with parallelism and chiasmus.',
    'Orchestrer la phrase complexe au niveau C2 : bâtir la phrase périodique, maîtriser le détachement thématique et équilibrer le rythme par symétrie, cadence majeure et chiasme.',
  ),
  outcomes: [
    b('Structure long suspended periods (protasis → climax → apodosis) so meaning stays clear without breathlessness.', 'Construire la phrase périodique (protase suspendue puis apodose résolutive) sans jamais perdre le fil syntaxique.'),
    b('Front or detach complements stylistically (Quant à…, De cette rencontre naquit…, Ce dossier, je l’ai relu) for rhetorical punch.', 'Détacher un thème en tête ou à la chute pour mettre en valeur le cœur du propos.'),
    b('Balance rhetorical weight through rising tricolons (cadence majeure), parallel syntax, and chiasmus.', 'Équilibrer le rythme oratoire grâce à la cadence majeure, aux parallélismes et au chiasme.'),
  ],
};

const lessons: Lesson[] = [
  lesson(
    'gr-syntax-period-rhythm',
    1,
    ['periodic-sentence-protasis-apodosis', 'phrase-periodique-protase-et-apodose'],
    b('The Periodic Sentence: Suspension & Resolution', 'La phrase périodique : tension (protase) et résolution (apodose)'),
    b('Build multi-clause French periods cleanly by keeping the structural hinge crystal clear until the main verb.', 'Construire des phrases amples dont la tension monte jusqu’au pivot puis s’achève avec netteté.'),
    [
      b('Manage rising concession/condition clauses (Bien que…, Tandis que…, Si…) before the decisive main clause.', 'Organiser plusieurs subordonnées préparatoires (protase) avant le basculement principal (apodose).'),
      b('Maintain growing segment length (la cadence majeure) so the closing member lands with weight rather than trailing off.', 'Respecter la cadence majeure pour éviter qu’une phrase longue ne s’essouffle en fin de chute.'),
    ],
    13,
    [
      card(
        b('How French classics avoid rambling in long sentences', 'Éviter la phrase interminable par l’architecture'),
        b(
          'A **periodic sentence** is not merely long — it is **engineered**. It opens with rising subordinate clauses (**protasis**: causes, concessions, conditions) that hold meaning suspended until a crisp rhythmic hinge (**il demeure que**, **c’est alors que**, **encore faut-il**), followed by the decisive **apodosis** (main clause). In good French prose, segments gradually grow or land in balanced twos and threes (**cadence majeure**), never dropping a two-syllable anti-climax at the very end.\nProtasis openers: **Si l’on admet que…, Tandis que…, Bien que…**.\nPivotal hinges: **force est pourtant de, il n’en reste pas moins, c’est précisément alors que**.\nRhythmic laws: **cadence majeure (court → moyen → ample), clausule nette**.',
          'Une **phrase périodique** ne se contente pas d’être longue : elle est **architecturée**. La **protase** (subordonnées montantes de concession, de temps ou de cause) suspend l’attente jusqu’à un pivot clair, avant que l’**apodose** ne livre la thèse décisive. L’oreille française préfère la **cadence majeure**, où les membres vont s’élargissant ou s’équilibrant, plutôt qu’une chute minuscule après trois lignes.\nOuvertures de protase : **Si l’on observe que…, Bien que…, À mesure que…**.\nPivots centraux : **il n’en demeure pas moins que, force est alors de, c’est à ce moment précis que**.\nÉquilibre rythmique : **cadence majeure (membres croissants), clausule nette**.',
        ),
        {
          ex: [
            ['Alors même que les indicateurs semblaient se stabiliser, que la demande repartait et que les partenaires retrouvaient confiance, une panne logistique vint rappeler la fragilité de l’ensemble.', 'Just as indicators seemed to stabilise, demand recovered and partners regained confidence, a logistical breakdown served to remind everyone of the whole system’s fragility.'],
            ['Loin de décourager les chercheurs, ces obstacles initiaux n’ont fait qu’aiguiser leur rigueur, renouveler leurs méthodes et élargir leur horizon.', 'Far from discouraging the researchers, those initial obstacles only sharpened their rigour, renewed their methods and broadened their horizon.'],
          ],
        },
      ),
      tip(
        b('Use anaphoric “que” across stacked clauses', 'Le « que » de reprise dans les subordonnées en série'),
        b(
          'In long periodic openings, French does **not** repeat heavy conjunctions (*Quand… et quand… et quand…*); it substitutes crisp **que** with the same mood (indicative after *quand/si*, subjunctive after *bien que/quoique* — wait: after **si** replaced by *et que*, classical French switches to the **subjunctive**: *Si vous venez et qu’il pleuve*!).',
          'Pour éviter de répéter *lorsque* ou *bien que* trois fois, le français emploie le **que** béquille en conservant le mode — sauf pour **si… et que**, qui appelle élégamment le **subjonctif** (*Si le projet avance et qu’un doute subsiste…*).',
        ),
      ),
      mc(
        P.best,
        [
          b('Bien que le délai fût bref, que les ressources manquassent et que la critique grondât, l’équipe remit un travail irréprochable.', 'Bien que le délai fût bref, que les ressources manquassent et que la critique grondât, l’équipe remit un travail irréprochable.'),
          b('Bien que le délai était bref, et bien que les ressources manquaient, la critique gronde, travail remis.', 'Bien que le délai était bref, et bien que les ressources manquaient, la critique gronde, travail remis.'),
          b('L’équipe remit un travail bien que le délai fût court et elle était vite.', 'L’équipe remit un travail bien que le délai fût court et elle était vite.'),
        ],
        { explain: b('Three rising subjunctive clauses using initial Bien que + repeated que build tension toward the clean main clause.', 'Trois subordonnées montantes coordonnées par le que de reprise (au subjonctif) préparent une apodose nette.') },
      ),
      gap(
        b('Complete this C2 period with clean mood and cadence.', 'Complétez cette période C2 en respectant modes et cadence.'),
        'Si vous acceptez cette mission et que l’urgence ___ (l’exiger, subjonctif), vous saurez trancher avec mesure, écouter avec patience et ___ avec fermeté.',
        ['l’exige', ['conclure', 'décider']],
        {
          choices: [['l’exige', 'l’exigeait'], ['conclure', 'oui']],
          explain: b('Si… et que triggers subjunctive l’exige; three balanced infinitives (trancher… écouter… conclure…) complete a rhythmic ternary cadence.', 'Après si… et que, le subjonctif l’exige s’impose ; trois infinitifs symétriques ferment la phrase en cadence ternaire.'),
        },
      ),
      ord(
        P.order,
        'Si l’on observe les faits sans préjugé et qu’on écoute chacun, le consensus redevient possible.',
        {
          tr: 'If one observes the facts without prejudice and listens to everyone, consensus becomes possible again.',
          extra: ['écoutez'],
        },
      ),
    ],
    [
      b('A true periodic sentence rises smoothly through coordinated protasis clauses to a balanced apodosis.', 'La période française suspend l’idée en protase puis tranche nettement à l’apodose.'),
      b('After si + indicative followed by et que, formal French shifts to the subjunctive (Si tu viens et qu’il soit là).', 'Après si… et que…, la prose soignée emploie le subjonctif dans le second membre.'),
    ],
    [
      ['la protase / l’apodose', 'rising suspension / decisive main clause'],
      ['la cadence majeure', 'expanding rhythm across balanced phrases'],
      ['si… et que (+ subjonctif)', 'if… and if (coordinated condition)'],
    ],
  ),

  lesson(
    'gr-syntax-period-rhythm',
    2,
    ['fronting-dislocation-and-emphasis', 'detachement-et-inversion-rhetorique'],
    b('Stylistic Fronting, Segmentation & Literary Inversion', 'Détachement thématique, mise en relief et inversion'),
    b('Separate spoken-style left dislocation from refined C2 fronting (De cette crise naquit…, Ce texte, nul ne l’ignore).', 'Distinguer le détachement familier de la mise en relief élégante (inversion après complément, reprise pronominale soignée).'),
    [
      b('Contrast informal moi, je / ce truc, j’aime pas with refined fronted prepositional inversion (De ce désaccord naquit…).', 'Opposer la dislocation familière à l’inversion élégante après complément antéposé.'),
      b('Place attributive adjectives or adverbs at clause start cleanly (Grande fut notre surprise, Rarement vit-on…).', 'Employer l’antéposition expressive de l’attribut ou du complément circonstanciel (Telle fut, Grande fut…).'),
    ],
    13,
    [
      card(
        b('Moving the spotlight intentionally across the French sentence', 'Déplacer l’éclairage sur la scène syntaxique'),
        b(
          'Neutral French follows Subject–Verb–Object, placing the **newest information** at the end. Fronting a prepositional phrase or predicate attribute reverses the spotlight cleanly in formal prose: **De cette rencontre décisive naquit une alliance durable** (note verb-before-subject!). Similarly, front a predicate adjective with **être** (**Grande fut ma stupeur**, **Vaines s’avérèrent ces promesses**).\nPrepositional fronting + inversion: **De cet échec surgit, À ces mots succéda, Sous ce vernis se cache**.\nPredicate fronting: **Rares sont les témoins, Telle fut la réplique, Immense demeura l’écho**.\nRefined left detachment (essay style): **Quant à cette clause, Ce paradoxe, il convient de l’éclairer**.',
          'L’ordre neutre place l’information nouvelle en fin de phrase. Antéposer un complément de lieu/origine ou un attribut permet d’inverser élégamment le sujet sans aucun artifice : **De cette crise naquit une méthode nouvelle** ; **Rares sont ceux qui…** ; **Grande fut notre surprise**.\nComplément antéposé + inversion : **À ce silence succéda, Dans ces archives dort, Sous l’apparente rigueur perce**.\nAttribut antéposé : **Nombreux sont les écueils, Telle fut sa réponse, Vains restèrent ces appels**.\nDétachement soutenu : **Quant à cette hypothèse, Ce point précis, nul ne le conteste**.',
        ),
        {
          ex: [
            ['De cette confrontation intellectuelle naquirent plusieurs ouvrages majeurs.', 'From this intellectual confrontation arose several major works.'],
            ['Rares sont les chroniqueurs qui résistent à la tentation du raccourci.', 'Rare are the commentators who resist the temptation of shortcuts.'],
            ['Grande fut la déception lorsque le calendrier fut de nouveau repoussé.', 'Great was the disappointment when the schedule was pushed back once again.'],
          ],
        },
      ),
      sort(
        P.sort,
        [b('Formal C2 fronting/inversion', 'Détachement / inversion soutenue C2'), b('Everyday spoken dislocation', 'Dislocation orale spontanée')],
        [
          ['Rares sont les études qui confirment cette tendance.', 0],
          ['Moi, personnellement, ce rapport, je le trouve trop long.', 1],
          ['De cette longue enquête émergent trois enseignements nets.', 0],
          ['Elle, sa méthode, personne n’y comprend rien.', 1],
        ],
      ),
      mc(
        P.best,
        [
          b('Sous une apparence austère se dissimule un humour subtil.', 'Sous une apparence austère se dissimule un humour subtil.'),
          b('Sous une apparence austère, il se dissimule un humour subtil.', 'Sous une apparence austère, il se dissimule un humour subtil.'),
          b('Dissimule sous une apparence austère se un humour subtil.', 'Dissimule sous une apparence austère se un humour subtil.'),
        ],
        { explain: b('With fronted prepositional phrase Sous une apparence austère, unaccusative/pronominal verbs invert cleanly without adding il.', 'Après un complément circonstanciel antéposé, le sujet nominal s’inverse directement après se dissimule.') },
      ),
      gap(
        b('Reorder/inflect the fronted predicate adjective carefully.', 'Accordez et placez justement l’attribut antéposé.'),
        '___ (Vain) se sont révélées ces tentatives tardives ; ___ (tel) est en tout cas l’enseignement majeur de cette archive.',
        ['Vaines', 'tel'],
        {
          explain: b('Vaines agrees feminine plural with ces tentatives; tel agrees masculine singular with l’enseignement.', 'Vaines s’accorde au féminin pluriel avec tentatives ; tel s’accorde avec l’enseignement.'),
        },
      ),
      say('Rares sont les instants où l’histoire hésite aussi visiblement.', 'Rare are the moments when history hesitates so visibly.'),
    ],
    [
      b('Prepositional fronting with motion/existence/pronominal verbs allows clean subject inversion (De ce doute surgit une idée).', 'Un complément initial suivi d’un verbe pronominal ou d’apparition autorise l’inversion directe du sujet.'),
      b('Adjective fronting (Rares sont…, Grande fut…) puts sharp rhetorical emphasis on evaluation.', 'L’antéposition de l’attribut (Rares sont…, Grande fut…) met immédiatement le jugement en relief.'),
    ],
    [
      ['grand(e) fut (+ sujet)', 'great was (+ subject)'],
      ['rares sont ceux qui', 'rare are those who'],
      ['de là naquit…', 'from there arose…'],
    ],
  ),

  lesson(
    'gr-syntax-period-rhythm',
    3,
    ['parallelism-chiasmus-and-c2-polish', 'parallelisme-chiasme-et-style-c2'],
    b('Parallelism, Chiasmus & Oratorical Balance', 'Parallélisme, chiasme et art de la formule C2'),
    b('Harness symmetry (anaphora, isocolon) and mirrored reversal (chiasmus) to craft memorable C2 essay conclusions.', 'Manier parallélismes et chiasmes sans artifice creux pour donner de l’éclat à une conclusion C2.'),
    [
      b('Match grammatical categories cleanly across parallel limbs (noun with noun, infinitive with infinitive).', 'Assurer la symétrie exacte des catégories grammaticales dans les membres parallèles.'),
      b('Distinguish chiasmus (AB–BA inversion) from simple antithesis and deploy both in a 75-word closing statement.', 'Distinguer chiasme (AB / BA) et antithèse parallèle dans un paragraphe conclusif C2.'),
    ],
    13,
    [
      card(
        b('Balance vs. mirror reversal in French rhetoric', 'Symétrie parallèle et renversement en miroir'),
        b(
          'Faulty parallelism breaks rhythm (*Elle aime lire et la peinture* ❌ → *Elle aime la lecture et la peinture* or *lire et peindre* ✅). At C2, crisp **parallelism** mirrors structure (`[Verb + Object] ; [Verb + Object]`), whereas **chiasmus** flips the order (`A + B / B + A`: **Il faut manger pour vivre, et non pas vivre pour manger**; **Juger sans comprendre, ou comprendre sans juger**).\nFaults to fix: **non seulement par goût, mais aussi parce qu’il fallait** ❌ → **par goût autant que par nécessité** ✅.\nParallel structure (AB–AB): **Observer sans préjugé, analyser sans relâche, décider sans fracas**.\nChiasmus (AB–BA): **Ce qui éclaire l’époque assombrit l’individu ; l’éclat des chiffres masque l’ombre des vies**.',
          'Le parallélisme exige des catégories identiques des deux côtés de la conjonction : évitez *Il prône la prudence et d’attendre*, écrivez **la prudence et l’attente**. Le **parallelisme strict** aligne `A+B / A+B`, tandis que le **chiasme** croise `A+B / B+A` pour frapper l’esprit.\nSymétrie à corriger : **moins pour briller que parce qu’il voulait** ❌ → **moins pour briller que pour convaincre** ✅.\nParallélisme AB–AB : **Observer sans crainte, nommer sans détour, agir sans hâte**.\nChiasme AB–BA : **On juge l’œuvre par l’homme et parfois l’homme par son œuvre**.',
        ),
        {
          ex: [
            ['La méthode consiste moins à multiplier les interdits qu’à clarifier les repères.', 'The method lies less in multiplying bans than in clarifying benchmarks.'],
            ['L’audace sans rigueur s’égare ; la rigueur sans audace s’éteint.', 'Boldness without rigour loses its way; rigour without boldness fades out.'],
            ['À la lenteur des institutions répond trop souvent la précipitation des commentaires.', 'Too often the haste of commentary answers the slowness of institutions.'],
          ],
        },
      ),
      pairs(
        P.match,
        [
          ['L’audace sans rigueur ; la rigueur sans audace', b('chiasmus (AB / BA mirrored contrast)', 'chiasme (symétrie croisée AB / BA)')],
          ['Observer, analyser, trancher', b('ternary parallelism (cadence)', 'gradatio / rythme ternaire symétrique')],
          ['moins pour plaire que pour éclairer', b('balanced prepositional infinitive symmetry', 'symétrie exacte pour + infinitif')],
          ['par goût et parce qu’il y était obligé', b('broken grammatical parallelism to repair', 'asymétrie nominale/verbale à corriger')],
        ],
      ),
      mc(
        P.best,
        [
          b('L’enjeu n’est pas d’accumuler les normes, mais de garantir leur lisibilité.', 'L’enjeu n’est pas d’accumuler les normes, mais de garantir leur lisibilité.'),
          b('L’enjeu n’est pas d’accumuler les normes, mais qu’on garantisse leur lisibilité.', 'L’enjeu n’est pas d’accumuler les normes, mais qu’on garantisse leur lisibilité.'),
          b('L’enjeu n’est pas d’accumuler les normes, mais la garantie de leur lisibilité.', 'L’enjeu n’est pas d’accumuler les normes, mais la garantie de leur lisibilité.'),
        ],
        { explain: b('Pair de + infinitive cleanly with de + infinitive (d’accumuler… de garantir…).', 'On aligne symétriquement deux groupes identiques : d’accumuler… mais de garantir….') },
      ),
      write(
        b('Write a 70–95 word C2 conclusion on artificial intelligence in public debate using periodic syntax, fronting, and one chiasmus or ternary parallelism.', 'Rédigez une conclusion C2 (70–95 mots) sur l’intelligence artificielle dans le débat public avec période, antéposition et parallélisme ou chiasme.'),
        b('Showcase rhythmic C2 balance without empty clichés.', 'Soignez le rythme, l’équilibre des membres et la netteté de la formule finale.'),
        70,
        95,
        [
          b('Include one fronted adjective or prepositional inversion', 'Intégrer une antéposition (Rares sont…, De cette…)'),
          b('Use strict grammatical parallelism or a clean chiasmus', 'Construire un parallélisme strict ou un chiasme équilibré'),
          b('Close on an impactful, well-proportioned final clause', 'Terminer par une clausule ample et mémorable'),
        ],
        'Bien que les promesses techniques abondent et que les inquiétudes s’intensifient, la question demeure avant tout politique. De ce vertige naît une exigence simple : éclairer les choix collectifs sans céder ni à la fascination béate ni au rejet aveugle. Car la technique sans discernement s’emballe, tandis que le discernement sans maîtrise technique demeure impuissant. Rares sont les époques où la lucidité aura exigé autant de mesure, autant d’écoute et autant de courage critique.',
        { phrases: ['De ce vertige naît', 'Rares sont les époques', 'ni à… ni à…'] },
      ),
    ],
    [
      b('Never mix grammatical categories (infinitive vs. noun vs. que-clause) across parallel comparisons.', 'Respectez la stricte identité des catégories grammaticales dans les membres coordonnés ou comparés.'),
      b('Chiasmus (AB–BA) and ternary cadence lend natural elegance to C2 conclusions when grounded in substance.', 'Le chiasme et la cadence ternaire donnent toute leur tenue aux conclusions C2.'),
    ],
    [
      ['le chiasme', 'chiasmus (AB–BA mirror reversal)'],
      ['la clausule', 'closing cadence of a period'],
      ['moins pour… que pour…', 'less in order to… than in order to…'],
    ],
  ),
];

export default lessons;
