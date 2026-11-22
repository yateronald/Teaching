import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At C1 level, opening a sentence with peut-être, ainsi, aussi, encore or à peine triggers elegant stylistic inversion—and changes meaning! Learn why initial aussi means “therefore”, master complex noun inversion (Peut-être Marie viendra-t-elle), handle à peine… que and toujours est-il, and balance formal inversion against neutral peut-être que.',
    'Au niveau C1, placer peut-être, ainsi, aussi, encore ou à peine en tête de phrase déclenche une inversion élégante — et modifie parfois le sens ! Comprenez pourquoi aussi en tête signifie « par conséquent », maîtrisez l’inversion complexe (Peut-être Marie viendra-t-elle), maniez à peine… que et toujours est-il, et dosez le registre face à peut-être que.',
  ),
  outcomes: [
    b('Recognize and use adverbs that trigger stylistic inversion (peut-être, ainsi, aussi, encore, du moins, à peine)', 'Identifier et employer les adverbes déclenchant l’inversion (peut-être, ainsi, aussi, encore, du moins, à peine)'),
    b('Distinguish simple pronoun inversion from complex noun inversion (Marie viendra-t-elle)', 'Distinguer l’inversion simple du pronom de l’inversion complexe du nom (Marie viendra-t-elle)'),
    b('Control register cleanly between formal inversion and neutral peut-être que / sans doute que', 'Maîtriser le choix de registre entre l’inversion soutenue et peut-être que / sans doute que'),
  ],
};

const C = 'gr-inversion-after-adverbs';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['adverbs-triggering-inversion', 'adverbes-declenchant-linversion'],
    b('Adverbs that trigger inversion: peut-être, ainsi, aussi', 'Adverbes déclenchant l’inversion : peut-être, ainsi, aussi'),
    b('Discover which sentence-initial adverbs invert the subject—and why initial aussi means “therefore”.', 'Découvrir quels adverbes en tête de phrase inversent le sujet — et pourquoi aussi signifie alors « par conséquent ».'),
    [
      b('Use inversion after peut-être, sans doute, du moins and tout au plus', 'Pratiquer l’inversion après peut-être, sans doute, du moins et tout au plus'),
      b('Distinguish sentence-initial aussi (“therefore” + inversion) from additive aussi (“also”)', 'Distinguer aussi de conséquence (« c’est pourquoi » + inversion) de aussi d’addition (« également »)'),
      b('Use encore, en vain, ainsi and fixed toujours est-il que accurately', 'Employer encore, en vain, ainsi et la tournure figée toujours est-il que'),
    ],
    13,
    [
      card(
        b('C1 sentence-initial adverbs and inversion', 'Adverbes en tête de phrase et inversion C1'),
        b(
          'When certain linking or modal adverbs stand at the **very start of a sentence**, formal French inverts the verb and subject pronoun: **Peut-être viendra-t-il**, **Ainsi s’explique ce choix**, **En vain avons-nous tenté de le joindre**. Two forms carry major C1 semantic shifts: sentence-initial **aussi + inversion** means **“therefore / consequently”** (NOT “also”), and **encore + inversion** means **“even then / and even then, provided”** (*Encore faut-il qu’il accepte*).\n\nModal / hedge: **peut-être, sans doute, tout au plus**.\nLogical link: **aussi (= donc), ainsi, encore, du moins**.\nFixed inversion idiom: **toujours est-il que · toujours faut-il · en vain**.',
          'Placés en **tête de phrase**, certains adverbes entraînent l’inversion du sujet en français soutenu : **Peut-être viendra-t-il**, **Ainsi s’explique ce choix**, **En vain avons-nous tenté de le joindre**. Deux d’entre eux changent nettement de sens : en tête de phrase, **aussi + inversion** signifie **« par conséquent / c’est pourquoi »** (et NON « également »), et **encore + inversion** signifie **« encore faut-il / du moins faut-il »**.\n\nModalisation : **peut-être, sans doute, tout au plus**.\nLogique / nuance : **aussi (= donc), ainsi, encore, du moins**.\nLocutions figées : **toujours est-il que · toujours faut-il · en vain**.',
        ),
        {
          table: {
            head: [b('Initial adverb', 'Adverbe initial'), b('Meaning at start', 'Sens en tête de phrase'), b('Example', 'Exemple')],
            rows: [
              ['peut-être / sans doute', b('perhaps / probably', 'peut-être / probablement'), 'Peut-être a-t-il oublié l’heure.'],
              ['aussi (+ inversion)', b('therefore, consequently', 'c’est pourquoi, dès lors'), 'Aussi avons-nous reporté la séance.'],
              ['ainsi', b('thus, in this way', 'de cette manière, ainsi'), 'Ainsi s’achève notre enquête.'],
              ['du moins / tout au plus', b('at least / at most', 'tout du moins / au maximum'), 'Tout au plus peut-on espérer un sursis.'],
              ['encore (+ inversion)', b('even then / still must', 'et encore faut-il que'), 'Encore faut-il qu’il signe le texte.'],
              ['toujours est-il que', b('the fact remains that', 'il reste vrai que'), 'Toujours est-il qu’il a refusé.'],
            ],
          },
          ex: [
            ['Le délai était trop court ; aussi avons-nous sollicité une prolongation.', 'The deadline was too short; consequently, we requested an extension.'],
            ['En vain ont-ils cherché une faille dans le raisonnement juridique.', 'In vain did they look for a flaw in the legal reasoning.'],
            ['Toujours est-il que la réforme a profondément modifié nos habitudes.', 'The fact remains that the reform has profoundly altered our habits.'],
          ],
        },
      ),
      trap(
        b('Aussi without inversion vs. aussi with inversion', 'Aussi sans inversion contre aussi avec inversion'),
        b(
          'In **mid-sentence** (*Il parle aussi italien*), **aussi** means “also”. At the **very start of a sentence or after a semicolon**, **aussi** + inversion means **“therefore”** (*Aussi a-t-il choisi de démissionner*). Never put a comma directly after initial consequence *aussi*—invert straight into the verb! By contrast, **toujours est-il que** already performs its inversion inside *est-il*; keep normal Subject + Verb order after *que*.\n\nConsequence (inverted): **Aussi devons-nous agir · Aussi a-t-elle accepté**.\nFixed idiom (normal order): **Toujours est-il qu’elle a accepté**.',
          'En **milieu de phrase** (*Il parle aussi italien*), **aussi** signifie « également ». En **tête de phrase ou après un point-virgule**, **aussi** + inversion signifie **« c’est pourquoi »** (*Aussi a-t-il choisi de démissionner*). Ne mettez pas de virgule juste après ce *aussi* de conséquence ! Quant à **toujours est-il que**, l’inversion est déjà dans *est-il* : la suite après *que* garde l’ordre normal.\n\nConséquence (inversé) : **Aussi devons-nous agir · Aussi a-t-elle accepté**.\nLocution figée (ordre normal) : **Toujours est-il qu’elle a accepté**.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('Therefore, we had to revise the entire schedule.', 'Par conséquent, nous avons dû revoir tout le calendrier.'),
          b('In addition, we revised the schedule as well.', 'Également, nous avons aussi revu le calendrier.'),
          b('Even though we revised the schedule, it failed.', 'Bien que nous ayons revu le calendrier, cela a échoué.'),
        ],
        {
          fr: 'Les financements ont été réduits ; aussi avons-nous dû revoir tout le calendrier.',
          explain: b('Sentence-initial or semicolon-initial aussi + inversion means “therefore / consequently”.', 'Placé après un point-virgule ou en tête de phrase avec inversion, aussi signifie « par conséquent ».'),
        },
      ),
      mc(
        P.form,
        ['est-il qu’il n’a jamais répondu', 'est-il n’a-t-il jamais répondu', 'toujours qu’il n’a jamais répondu', 'il est toujours qu’il n’a répondu'],
        {
          fr: 'Je comprends ses hésitations ; toujours ___.',
          explain: b('Toujours est-il que carries its own inversion (est-il), followed by normal Subject + Verb order.', 'Dans toujours est-il que, l’inversion figure déjà dans est-il ; la subordonnée suit l’ordre normal.'),
        },
      ),
      gap(
        P.complete,
        '___ (Peut-être / Peut-être que) aura-t-il une réponse demain. La preuve manquait ; ___ (aussi / en vain) avons-nous suspendu l’analyse. ___ (Encore / Tout au plus) faut-il vérifier la date exacte.',
        [['Peut-être'], ['aussi'], ['Encore']],
        {
          choices: [
            ['Peut-être', 'Peut-être que', 'Sans doute que'],
            ['aussi', 'en vain', 'toujours est-il'],
            ['Encore', 'Tout au plus', 'Aussi'],
          ],
        },
      ),
      hear(
        'En vain avons-nous attendu des éclaircissements de la direction.',
        b('Which meaning and register do you hear?', 'Quel sens et quel registre entendez-vous ?'),
        [
          b('Formal C1 style: “In vain did we wait for clarification from management.”', 'Registre soutenu C1 : « C’est inutilement que nous avons attendu des éclaircissements. »'),
          b('Informal everyday style: “Maybe management is coming later.”', 'Registre familier : « Peut-être que la direction viendra plus tard. »'),
          b('Hypothetical conditional: “What if we waited for clarification?”', 'Hypothèse : « Et si nous attendions des éclaircissements ? »'),
        ],
      ),
      ord(
        P.order,
        'Sans doute préfère-t-elle relire le contrat avant de signer.',
        { tr: 'Doubtless she prefers to reread the contract before signing.' },
      ),
      pairs(
        P.match,
        [
          ['aussi (+ inversion)', b('therefore, consequently', 'c’est pourquoi, par conséquent')],
          ['encore faut-il que', b('still, one must at least', 'il faut toutefois veiller à ce que')],
          ['tout au plus', b('at most', 'au maximum, tout au mieux')],
          ['toujours est-il que', b('be that as it may, the fact remains', 'il reste en tout cas établi que')],
        ],
      ),
      dict('Le vent redoublait de violence ; aussi avons-nous décidé de reporter la traversée.'),
      say('Du moins aurons-nous essayé d’ouvrir le dialogue sans idée préconçue.', 'At least we will have tried to open dialogue without preconceived ideas.'),
    ],
    [
      b('Initial adverbs like peut-être, sans doute, ainsi, aussi, encore, du moins, tout au plus and en vain trigger inversion in formal C1 French.', 'En tête de phrase soutenue, peut-être, sans doute, ainsi, aussi, encore, du moins, tout au plus et en vain déclenchent l’inversion.'),
      b('Initial aussi + inversion means “therefore / consequently”, never “also”.', 'En tête de phrase avec inversion, aussi signifie « par conséquent » et non « également ».'),
      b('toujours est-il que keeps normal word order after que because inversion is already built into est-il.', 'toujours est-il que garde l’ordre normal après que car l’inversion est déjà contenue dans est-il.'),
    ],
    [
      ['aussi (+ inversion)', b('therefore, accordingly', 'par conséquent, c’est pourquoi')],
      ['toujours est-il que', b('still, the fact remains that', 'quoi qu’il en soit, il demeure que')],
      ['tout au plus', b('at most', 'au grand maximum')],
      ['en vain', b('in vain, fruitlessly', 'inutilement, sans résultat')],
    ],
  ),

  lesson(
    C,
    2,
    ['simple-vs-complex-inversion', 'inversion-simple-et-inversion-complexe'],
    b('Simple vs. complex inversion: Peut-être Marie viendra-t-elle', 'Inversion simple et complexe : Peut-être Marie viendra-t-elle'),
    b('Handle noun subjects with complex inversion, euphonic -t-, compound tenses, and à peine… que.', 'Maîtriser l’inversion complexe avec sujet nominal, le -t- euphonique, les temps composés et à peine… que.'),
    [
      b('Use simple pronoun inversion (viendra-t-elle) and euphonic -t- (a-t-il)', 'Maîtriser l’inversion simple du pronom et le -t- euphonique (a-t-il, pense-t-elle)'),
      b('Form complex inversion with full noun subjects (Peut-être Marie viendra-t-elle)', 'Construire l’inversion complexe avec un sujet nominal (Peut-être Marie viendra-t-elle)'),
      b('Master à peine… que and encore faut-il que (+ subjunctive)', 'Manier à peine… que et encore faut-il que (+ subjonctif)'),
    ],
    13,
    [
      card(
        b('Simple pronoun vs. complex noun inversion', 'Inversion simple contre inversion complexe'),
        b(
          'When the subject is a **pronoun** (*il, elle, on, nous, vous, ils, elles*), place it right after the conjugated verb (or auxiliary in compound tenses) with a hyphen: **Peut-être a-t-il raison**, **À peine était-il parti que…** (adding **-t-** after a verb ending in a vowel before *il/elle/on*). When the subject is a **full noun** (*Marie, ce rapport*), you CANNOT simply say *Peut-être viendra Marie*—instead use **complex inversion**: keep the **noun before the verb** and add a **matching pronoun after the verb**: **Peut-être Marie viendra-t-elle**.\n\nSimple (pronoun): **a-t-il compris, viendra-t-elle, avons-nous pensé**.\nComplex (noun): **Peut-être Luc viendra-t-il · À peine la pluie eut-elle cessé**.\nAfter ainsi/aussi (no object): **Ainsi s’achève l’exposé · Ainsi naquit cette idée**.',
          'Quand le sujet est un **pronom**, il se place avec un trait d’union juste après le verbe conjugué (ou l’auxiliaire) : **Peut-être a-t-il raison**, **À peine était-il parti que…** (avec **-t-** si le verbe finit par une voyelle devant *il/elle/on*). Quand le sujet est un **nom** (*Marie, ce rapport*), l’inversion complexe garde le **nom devant le verbe** et le reprend par un **pronom après le verbe** : **Peut-être Marie viendra-t-elle**.\n\nSimple (pronom) : **a-t-il compris, viendra-t-elle, avons-nous pensé**.\nComplexe (nom) : **Peut-être Luc viendra-t-il · À peine la pluie eut-elle cessé**.\nAprès ainsi/aussi sans COD : **Ainsi s’achève l’exposé · Ainsi naquit cette idée**.',
        ),
        {
          table: {
            head: [b('Subject type', 'Nature du sujet'), b('Pattern', 'Schéma'), b('Example', 'Exemple')],
            rows: [
              [b('Personal pronoun (simple)', 'Pronom personnel (simple)'), 'Adv + V + -pronoun', 'Peut-être reviendra-t-il demain.'],
              [b('Compound tense + pronoun', 'Temps composé + pronom'), 'Adv + Aux + -pronoun + PP', 'À peine avait-elle ouvert la porte que…'],
              [b('Full noun (complex)', 'Nom propre ou commun (complexe)'), 'Adv + Noun + V + -pronoun', 'Peut-être le directeur acceptera-t-il.'],
              [b('Compound tense + noun', 'Temps composé + nom'), 'Adv + Noun + Aux + -pronoun + PP', 'À peine le débat a-t-il commencé que…'],
            ],
          },
          ex: [
            ['Peut-être ce malentendu dissimule-t-il un désaccord plus profond.', 'Perhaps this misunderstanding conceals a deeper disagreement.'],
            ['À peine la séance avait-elle commencé que le président a demandé une pause.', 'Hardly had the session begun when the chair asked for a break.'],
            ['Encore faut-il que tous les signataires respectent leurs engagements.', 'Even so, all signatories still need to honor their commitments.'],
          ],
        },
      ),
      trap(
        b('Watch two C1 traps: je with inversion & à peine… que', 'Deux pièges C1 : le pronom je et à peine… que'),
        b(
          '1. Standard inversion with **je** is very rare except with a handful of short forms (**puis-je, suis-je, ai-je, dois-je, sais-je**). Avoid awkward inventions like *peut-être mangé-je*—use *peut-être que je mange* or *sans doute suis-je*.\n2. In **À peine… que**, the conjunction connecting the second event is ALWAYS **que** (never *quand* or *lorsque*!): *À peine était-il arrivé **que** le téléphone sonna*. And in compound tenses, invert ONLY the **auxiliary**, never the past participle!\n\nCorrect: **À peine eut-il fini qu’il sortit · Sans doute ai-je oublié**.\nWrong: **À peine fini a-t-il quand… · Peut-être viendra Marie**.',
          '1. L’inversion avec **je** ne s’emploie guère qu’avec quelques formes courtes (**puis-je, suis-je, ai-je, dois-je, sais-je**). Ailleurs, préférez *peut-être que je…*.\n2. Dans **À peine… que**, la conjonction est TOUJOURS **que** (jamais *quand* ni *lorsque*) : *À peine était-il arrivé **que** le téléphone sonna*. Aux temps composés, seul l’**auxiliaire** précède le pronom sujet.\n\nCorrect : **À peine eut-il fini qu’il sortit · Sans doute ai-je oublié**.\nÀ éviter : **À peine fini a-t-il quand… · Peut-être viendra Marie**.',
        ),
      ),
      mc(
        P.best,
        [
          'Peut-être ma collègue proposera-t-elle une autre piste.',
          'Peut-être proposera ma collègue une autre piste.',
          'Peut-être ma collègue proposera-elle une autre piste.',
          'Peut-être proposera-t-elle ma collègue une autre piste.',
        ],
        {
          fr: 'Which sentence correctly applies complex inversion with the noun subject « ma collègue »?',
          explain: b('Keep ma collègue before proposera, add -t- before elle (vowel ending), and drop no piece: Peut-être ma collègue proposera-t-elle.', 'Gardez ma collègue avant proposera, ajoutez -t- devant elle : Peut-être ma collègue proposera-t-elle.'),
        },
      ),
      mc(
        P.form,
        ['les résultats ont-ils été publiés que', 'ont été les résultats publiés quand', 'les résultats ont été publiés lorsque', 'a-t-il les résultats publiés que'],
        {
          fr: 'À peine ___ les commentaires ont afflué.',
          explain: b('In a compound tense with a noun subject, invert Noun + Auxiliary + -pronoun + past participle, followed by que.', 'Avec un nom sujet au temps composé : Nom + Auxiliaire + -pronom + participe, puis que.'),
        },
      ),
      gap(
        P.complete,
        'Peut-être cette décision ___ (semble / semble-t-elle) sévère, mais elle était nécessaire. À peine ___ (avait-il / il avait) posé son sac ___ (que / quand) l’alarme a retenti.',
        [['semble-t-elle'], ['avait-il'], ['que']],
        {
          choices: [
            ['semble-t-elle', 'semble-elle', 't-elle semble'],
            ['avait-il', 'il avait', 'avait-t-il'],
            ['que', 'quand', 'lorsque'],
          ],
        },
      ),
      sort(
        b('Simple inversion or complex inversion?', 'Inversion simple ou inversion complexe ?'),
        [
          b('Simple inversion (pronoun only)', 'Inversion simple (pronom seul)'),
          b('Complex inversion (noun + pronoun)', 'Inversion complexe (nom + pronom)'),
        ],
        [
          ['Peut-être viendra-t-il.', 0],
          ['Peut-être Paul viendra-t-il.', 1],
          ['À peine la cloche eut-elle sonné…', 1],
          ['À peine eut-elle sonné…', 0],
          ['Sans doute les prix baisseront-ils.', 1],
          ['Aussi devons-nous patienter.', 0],
        ],
      ),
      ord(
        P.order,
        'Peut-être cette réforme permettra-t-elle d’accélérer les démarches.',
        { tr: 'Perhaps this reform will make it possible to speed up procedures.' },
      ),
      dict('À peine le train était-il entré en gare que les voyageurs se sont levés.'),
      say('Encore faut-il que ce compromis obtienne l’aval de l’assemblée.', 'Even so, this compromise still needs to obtain the assembly’s approval.'),
    ],
    [
      b('Simple inversion places a pronoun after the conjugated verb or auxiliary, adding -t- after a vowel before il/elle/on (a-t-il, semble-t-elle).', 'L’inversion simple place le pronom après le verbe ou l’auxiliaire, avec -t- après voyelle devant il/elle/on.'),
      b('Complex inversion keeps a noun subject before the verb and echoes it with a pronoun after the verb (Peut-être Marie viendra-t-elle).', 'L’inversion complexe laisse le nom sujet devant le verbe et le reprend par un pronom après le verbe.'),
      b('À peine… que always pairs with que (never quand), inverting the auxiliary in compound tenses.', 'À peine… que se construit toujours avec que (jamais quand) et n’inverse que l’auxiliaire.'),
    ],
    [
      ['dissimuler', b('to conceal, hide', 'cacher sous une apparence')],
      ['à peine… que', b('hardly… when', 'tout juste… que')],
      ['l’aval (m.)', b('endorsement, official approval', 'l’accord officiel, l’approbation')],
      ['retentir', b('to ring out, sound', 'résonner fortement')],
    ],
  ),

  lesson(
    C,
    3,
    ['register-and-c1-essay-style', 'registres-et-style-soutenu-c1'],
    b('Register control: peut-être vs. peut-être que in C1 prose', 'Registres et style C1 : peut-être ou peut-être que'),
    b('Balance literary inversion, neutral que-clauses, and natural rhythm in essays and speeches.', 'Doser l’inversion soutenue, le tour neutre avec que et le rythme naturel dans un essai ou un discours C1.'),
    [
      b('Compare peut-être + inversion (C1 formal) with peut-être que + normal order (neutral/spoken)', 'Comparer peut-être + inversion (soutenu) et peut-être que + ordre normal (courant)'),
      b('Know when simple noun inversion works (Ainsi s’acheva la réunion) vs. when complex inversion is required', 'Savoir quand l’inversion simple du nom est permise (Ainsi s’acheva la réunion)'),
      b('Critique a C1 editorial passage and write a polished essay paragraph', 'Analyser un texte C1 puis rédiger un paragraphe argumentatif maîtrisé'),
    ],
    13,
    [
      card(
        b('Matching inversion to register and sentence shape', 'Adapter l’inversion au registre et à la phrase'),
        b(
          'In everyday spoken French, people avoid inversion after adverbs by inserting **que** and keeping normal word order: *Peut-être **qu’il** viendra*, *Sans doute **qu’elle** a oublié*. Note carefully: **peut-être que** is neutral/spoken, whereas in C1 essays and formal journalism **peut-être + inversion** (*Peut-être viendra-t-il*) is clearly preferred—and **sans doute que** is considered overly colloquial for formal writing (use **sans doute + inversion** or **il est probable que**). Also note that after **ainsi** or **aussi** with an intransitive or reflexive verb, literary French often places a noun directly after the verb: **Ainsi s’explique cette crise**.\n\nSpoken / neutral: **peut-être qu’il sait · peut-être que cela suffit**.\nFormal C1: **peut-être sait-il · sans doute cela suffit-il**.\nLiterary noun after verb: **Ainsi s’achève l’étude · Ainsi disparut ce métier**.',
          'À l’oral courant, on évite l’inversion en ajoutant **que** : *Peut-être **qu’il** viendra*, *Sans doute **qu’elle** a oublié*. Mais à l’écrit C1, **peut-être + inversion** (*Peut-être viendra-t-il*) est nettement privilégié, et *sans doute que* reste trop familier pour un essai (préférez **sans doute + inversion**). Par ailleurs, après **ainsi** avec un verbe sans COD ou pronominal, le nom peut suivre directement le verbe : **Ainsi s’explique cette crise**.\n\nOral / neutre : **peut-être qu’il sait · peut-être que cela suffit**.\nÉcrit soutenu C1 : **peut-être sait-il · sans doute cela suffit-il**.\nNom inversé (littéraire) : **Ainsi s’achève l’étude · Ainsi disparut ce métier**.',
        ),
        {
          table: {
            head: [b('Spoken / neutral', 'Oral / courant'), b('Formal C1', 'Écrit soutenu C1'), b('Note', 'Remarque')],
            rows: [
              ['Peut-être qu’il a raison.', 'Peut-être a-t-il raison.', b('both grammatical; register differs', 'les deux sont corrects ; registre distinct')],
              ['Sans doute qu’ils hésitent.', 'Sans doute hésitent-ils.', b('avoid sans doute que in formal writing', 'évitez sans doute que à l’écrit')],
              ['Alors, on a changé de plan.', 'Aussi avons-nous changé de plan.', b('aussi + inversion = therefore', 'aussi + inversion = par conséquent')],
              ['Ce phénomène s’explique ainsi.', 'Ainsi s’explique ce phénomène.', b('inverted noun natural with short intransitive verb', 'nom inversé fluide sans COD')],
            ],
          },
          ex: [
            ['Peut-être convient-il de nuancer ce diagnostic initial.', 'Perhaps it is fitting to qualify this initial diagnosis.'],
            ['Ainsi s’éclaire l’apparente contradiction entre ces deux chiffres.', 'Thus is illuminated the apparent contradiction between these two figures.'],
            ['Peut-être que tu préfères en reparler demain matin au calme ?', 'Perhaps you’d rather talk about it again tomorrow morning when it’s quiet?'],
          ],
        },
      ),
      doc(
        {
          look: 'article',
          title: b('Opinion column — Urban heritage', 'Tribune — Patrimoine urbain'),
          text: 'Pendant des décennies, la rénovation des centres historiques a privilégié les voitures au détriment des piétons. Aussi les rues commerçantes se sont-elles peu à peu vidées le soir venu. Peut-être certains élus ont-ils craint une baisse de fréquentation en piétonnisant ces axes. Toujours est-il que les villes ayant franchi le pas affichent aujourd’hui une vitalité commerciale retrouvée.',
        },
        b('How is « Aussi » used in the second sentence of this column?', 'Quelle est la valeur de « Aussi » dans la deuxième phrase de cette tribune ?'),
        [
          b('Logical consequence (“consequently / as a result”), marked by complex inversion.', 'Une conséquence logique (« par conséquent »), marquée par l’inversion complexe.'),
          b('An additive point (“also”), parallel to en outre.', 'Une simple addition (« également »), synonyme de en outre.'),
          b('A temporal marker meaning “at the same time”.', 'Un marqueur de simultanéité signifiant « au même moment ».'),
        ],
        {
          explain: b('Initial Aussi + complex inversion (les rues… se sont-elles vidées) expresses “consequently”.', 'Aussi en tête avec inversion complexe (les rues… se sont-elles vidées) signifie « par conséquent ».'),
        },
      ),
      mc(
        P.best,
        [
          'Sans doute cette approche demande-t-elle davantage de temps.',
          'Sans doute que cette approche demande davantage de temps.',
          'Sans doute demande cette approche davantage de temps.',
          'Sans doute cette approche elle demande davantage de temps.',
        ],
        {
          fr: 'Choose the best C1 formal sentence for an academic essay:',
          explain: b('Formal essays avoid sans doute que and use complex inversion (cette approche demande-t-elle).', 'L’essai soutenu évite sans doute que et emploie l’inversion complexe (cette approche demande-t-elle).'),
        },
      ),
      gap(
        P.completeText,
        '___ (Ainsi / Peut-être que) s’explique le succès de ce format court. ___ (Peut-être / Toujours) les lecteurs apprécient-ils cette concision ; ___ (encore / en vain) faut-il préserver la rigueur de l’analyse.',
        [['Ainsi'], ['Peut-être'], ['encore']],
        {
          choices: [
            ['Ainsi', 'Peut-être que', 'Sans doute que'],
            ['Peut-être', 'Toujours', 'Peut-être que'],
            ['encore', 'en vain', 'du moins'],
          ],
        },
      ),
      dlg(
        b('Polishing a C1 conference speech', 'Peaufiner un discours C1'),
        b('Valérie and Olivier adjust the register of an opening address.', 'Valérie et Olivier ajustent le registre d’un discours d’ouverture.'),
        [['Valérie', 'f'], ['Olivier', 'm']],
        [
          [0, 'Dans ton brouillon, tu as écrit « Sans doute que le public attend des chiffres précis ». Cela sonne très oral.', 'In your draft, you wrote “Sans doute que le public attend des chiffres précis.” That sounds very colloquial.'],
          [1, { options: ['C’est vrai : je devrais plutôt dire « Sans doute le public attend-il des chiffres précis ».', 'C’est vrai : je devrais plutôt dire « Sans doute attend le public des chiffres précis ».', 'C’est vrai : je devrais plutôt dire « Peut-être que le public attend-il des chiffres précis ».'] }],
          [0, 'Beaucoup mieux ! Et pour enchaîner sur la cause de notre réforme juste après ?', 'Much better! And to transition to the reason for our reform right after?'],
          [1, { options: ['Je peux ouvrir la phrase suivante par « Aussi avons-nous rassemblé toutes les études récentes ».', 'Je peux ouvrir la phrase suivante par « Aussi nous avons rassemblé toutes les études récentes ».', 'Je peux ouvrir la phrase suivante par « Aussi, que nous avons rassemblé toutes les études récentes ».'] }],
        ],
      ),
      sort(
        b('Formal C1 written style or neutral spoken style?', 'Écrit soutenu C1 ou oral neutre ?'),
        [
          b('Formal C1 written style', 'Écrit soutenu C1'),
          b('Neutral / colloquial spoken style', 'Oral neutre ou courant'),
        ],
        [
          ['Peut-être viendra-t-il.', 0],
          ['Peut-être qu’il viendra.', 1],
          ['Sans doute a-t-elle hésité.', 0],
          ['Sans doute qu’elle a hésité.', 1],
          ['Aussi avons-nous refusé.', 0],
          ['Donc on a refusé.', 1],
        ],
      ),
      ord(
        P.order,
        'Ainsi s’achève cette présentation des enjeux économiques actuels.',
        { tr: 'Thus concludes this presentation of current economic challenges.' },
      ),
      say('Peut-être ces deux approches se complètent-elles plus qu’elles ne s’opposent.', 'Perhaps these two approaches complement each other more than they clash.'),
      write(
        b('Write a C1 analytical paragraph with stylistic inversion', 'Rédiger un paragraphe analytique C1 avec inversion'),
        b(
          'In 55 to 85 words, reflect on how digital reading habits are changing attention spans or public libraries. Include at least one complex noun inversion (after peut-être or aussi), one simple inversion (after aussi, encore or à peine), and one fixed idiom (toujours est-il que or ainsi s’explique).',
          'En 55 à 85 mots, analysez l’évolution des habitudes de lecture ou le rôle des bibliothèques aujourd’hui. Intégrez au moins une inversion complexe avec sujet nominal (après peut-être ou aussi), une inversion simple (après aussi, encore ou à peine) et une tournure comme toujours est-il que ou ainsi s’explique.',
        ),
        55,
        85,
        [
          b('One complex inversion with a noun subject (Noun + verb + -pronoun)', 'Une inversion complexe avec nom sujet'),
          b('One simple inversion after initial aussi (= therefore), encore or à peine', 'Une inversion simple après aussi, encore ou à peine'),
          b('One C1 idiom (toujours est-il que or ainsi + inversion)', 'Une tournure C1 (toujours est-il que ou ainsi + inversion)'),
        ],
        'Les usages numériques ont profondément transformé notre rapport au temps long. Peut-être certains lecteurs privilégient-ils désormais les formats brefs au détriment des essais approfondis. Aussi les bibliothèques municipales ont-elles dû réinventer leur accueil pour rester des lieux de concentration. Toujours est-il que la demande d’espaces calmes ne cesse de croître ; encore faut-il préserver ces ressources gratuites pour tous les publics.',
        {
          phrases: ['Peut-être certains lecteurs privilégient-ils', 'Aussi les bibliothèques… ont-elles', 'Toujours est-il que', 'encore faut-il'],
        },
      ),
    ],
    [
      b('Formal C1 writing prefers peut-être / sans doute + inversion over peut-être que / sans doute que (avoid sans doute que in essays).', 'L’écrit C1 privilégie peut-être / sans doute + inversion (évitez sans doute que dans un essai).'),
      b('Never mix que and inversion together (*peut-être qu’il viendra-t-il* is impossible).', 'Ne cumulez jamais que et l’inversion (*peut-être qu’il viendra-t-il* est fautif).'),
      b('Short intransitive or reflexive clauses after ainsi often invert a noun directly (Ainsi s’achève le débat).', 'Après ainsi et un verbe court sans COD, l’inversion directe du nom reste fréquente et élégante (Ainsi s’achève le débat).'),
    ],
    [
      ['au détriment de', b('to the detriment of', 'aux dépens de')],
      ['franchir le pas', b('to take the plunge', 'se décider enfin à agir')],
      ['s’éclairer', b('to become clear, be illuminated', 'devenir compréhensible')],
      ['l’enjeu (m.)', b('the stake, key issue', 'ce qui est en jeu, l’importance')],
    ],
  ),
];

export default lessons;
