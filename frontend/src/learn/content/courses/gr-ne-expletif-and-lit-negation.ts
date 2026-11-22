import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Master two hallmarks of C2 French: the non-negative stylistic “ne explétif” after fear, comparison, and avant que, plus single-word literary negation without pas after pouvoir, oser, cesser, and savoir.',
    'Maîtriser deux traits emblématiques du niveau C2 : le ne explétif (sans valeur négative) après crainte, comparaison et avant que, ainsi que le ne seul littéraire avec oser, cesser, pouvoir et savoir.',
  ),
  outcomes: [
    b('Distinguish stylistic ne explétif from true negation in clauses of fear, avoidance, comparison, and before/unless.', 'Distinguer le ne explétif de la véritable négation après craindre, éviter, comparaison, avant que et à moins que.'),
    b('Read and produce literary single-ne negation (Je n’ose croire, Elle ne cesse d’interroger, Je ne saurais dire).', 'Comprendre et employer avec justesse le ne seul après oser, cesser, pouvoir et savoir.'),
    b('Avoid double-negative contradictions when combining sans, nier que, or ne… pas.', 'Éviter les contresens sur la négation dans les phrases complexes après nier que, douter que ou sans que.'),
  ],
};

const lessons: Lesson[] = [
  lesson(
    'gr-ne-expletif-and-lit-negation',
    1,
    ['ne-expletif-fear-and-prevention', 'ne-expletif-crainte-et-empechement'],
    b('Ne Explétif After Verbs of Fear & Prevention', 'Le ne explétif après crainte, précaution et empêchement'),
    b('Understand why French inserts a positive stylistic “ne” after craindre, redouter, éviter, and prendre garde.', 'Comprendre l’emploi stylistique du ne explétif (non négatif) après craindre, redouter, éviter et prendre garde.'),
    [
      b('Separate Je crains qu’il ne vienne (= I fear he IS coming) from Je crains qu’il ne vienne pas (= I fear he is NOT coming).', 'Distinguer Je crains qu’il ne vienne (crainte qu’il vienne) de Je crains qu’il ne vienne pas (crainte de son absence).'),
      b('Drop ne explétif cleanly when the main verb itself is negated or interrogative.', 'Supprimer le ne explétif lorsque le verbe principal de crainte est lui-même négatif.'),
    ],
    13,
    [
      card(
        b('One small “ne” that reverses nothing', 'Un « ne » purement stylistique qui ne nie rien'),
        b(
          'In **Je crains qu’il ne pleuve**, the speaker does **not** think it will stay dry — quite the opposite: they fear it **will** rain! Because fear or avoidance already implies wanting the event *not* to happen, formal French mirrors that latent wish with an optional **ne explétif** (never accompanied by *pas*). Put **ne… pas** if you fear the event fails to occur (**Je crains qu’il ne réussisse pas**).\nVerbs of fear: **craindre que, avoir peur que, redouter que, appréhender que**.\nVerbs of caution: **éviter que, empêcher que, prendre garde que, de peur que**.\nWhen dropped: **Je ne crains pas qu’il parte** (main clause negated → no *ne* needed).',
          'Dans **Je crains qu’il ne pleuve**, le locuteur ne nie rien : il redoute justement qu’il **pleuve** ! Parce que la crainte exprime le souhait implicite que l’événement n’arrive pas, la langue soutenue ajoute un **ne explétif** (sans jamais ajouter *pas*). Pour nier réellement la subordonnée, on rétablit **ne… pas** (**Je crains qu’il ne comprenne pas**).\nVerbes de crainte : **craindre que, avoir peur que, redouter que, appréhender que**.\nPrécaution et empêchement : **éviter que, empêcher que, prendre garde que, de peur que**.\nSans ne explétif : **Je ne crains pas qu’il parte** (verbe principal déjà négatif).',
        ),
        {
          table: {
            head: [b('Sentence', 'Phrase'), b('Meaning', 'Sens exact'), b('Polarity', 'Valeur de ne')],
            rows: [
              ['Je crains qu’il ne vienne.', b('I fear he WILL come.', 'Je crains qu’il vienne.'), b('expletive (affirmative)', 'explétif (positif)')],
              ['Je crains qu’il ne vienne pas.', b('I fear he will NOT come.', 'Je crains son absence.'), b('true negation', 'négation réelle')],
              ['Je ne crains pas qu’il vienne.', b('I do not fear his coming.', 'Je ne crains pas sa venue.'), b('no expletive when negated', 'pas d’explétif si principal nié')],
            ],
          },
          ex: [
            ['Nous redoutons que cette clause ne fragilise l’accord final.', 'We fear that this clause may weaken the final agreement.'],
            ['Faites vite, de peur qu’il ne ferme le portail avant votre arrivée.', 'Hurry, lest he close the gate before you arrive.'],
            ['Empêchons que ce précédent ne devienne la norme.', 'Let us prevent this precedent from becoming the norm.'],
          ],
        },
      ),
      trap(
        b('Never confuse ne explétif with omitted pas', 'Ne jamais lire un ne explétif comme une négation'),
        b(
          'Compare *Je crains qu’il ne réussisse* (“I’m afraid he’ll succeed” — expletive *ne*, usually spoken by a rival!) vs. *Je crains qu’il ne réussisse pas* (“I’m afraid he’ll fail”). Always look for *pas/point/jamais* after the subjunctive verb.',
          'Comparez *Je crains qu’il ne gagne* (« je redoute sa victoire », souhait inverse) et *Je crains qu’il ne gagne pas* (« je redoute sa défaite »). Vérifiez toujours la présence ou l’absence de *pas*.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('Je crains que le dossier ne soit incomplet.', 'Je redoute que le dossier soit effectivement incomplet.'),
          b('Je pense que le dossier est sûrement complet.', 'Je crains que le dossier soit trop complet.'),
          b('Je ne crois pas que le dossier soit incomplet.', 'Je ne crois pas du tout qu’il manque quoi que ce soit.'),
        ],
        { fr: 'Je crains que le dossier ne soit incomplet.', explain: b('Ne alone after craindre que is expletive, confirming the fear of incompleteness.', 'Après craindre que, ne employé sans pas est explétif et confirme la crainte.') },
      ),
      gap(
        b('Supply expletive ne or real negation (ne… pas) according to the cue.', 'Complétez avec le ne explétif ou la vraie négation selon le sens.'),
        'Le directeur appréhende que le délai ___ suffise ___ à terminer l’audit, mais nous devons éviter qu’un incident ___ survienne.',
        ['ne', 'pas', 'ne'],
        {
          choices: [['ne', 'n’'], ['pas', 'plus', 'rien'], ['ne', 'pas']],
          explain: b('First clause fears insufficiency (true negation ne… pas); second seeks to prevent an incident (expletive ne alone).', 'Le premier verbe redoute un manque (négation ne… pas) ; le second veut éviter la survenue d’un incident (ne explétif seul).'),
        },
      ),
      hear(
        'Prenez garde qu’on ne déforme vos propos lors de l’audition.',
        P.listen,
        [
          b('Watch out lest they distort your remarks.', 'Faites attention afin qu’on évite de déformer vos propos.'),
          b('Make sure they refrain from commenting on your remarks.', 'Veillez à ce qu’on ne parle jamais de vos propos.'),
          b('The speaker denies your remarks were distorted.', 'Le locuteur affirme que personne n’a déformé vos propos.'),
        ],
      ),
      dict('Je redoute que ce retard ne compromette la signature finale.'),
    ],
    [
      b('After craindre, redouter, éviter, empêcher, de peur que (+ subjunctive), ne alone is expletive (positive).', 'Après craindre, redouter, éviter, empêcher et de peur que, le ne seul au subjonctif est explétif.'),
      b('Drop the expletive ne when the main verb of fearing is negated.', 'On n’emploie pas de ne explétif quand le verbe principal est lui-même négatif.'),
    ],
    [
      ['le ne explétif', 'expletive ne (non-negative stylistic ne)'],
      ['de peur que… ne', 'for fear that, lest'],
      ['prendre garde que… ne', 'to take care lest'],
    ],
  ),

  lesson(
    'gr-ne-expletif-and-lit-negation',
    2,
    ['ne-expletif-comparison-doubt-and-time', 'ne-expletif-comparaison-doute-et-temps'],
    b('Ne Explétif in Comparisons, Doubt & avant que', 'Ne explétif dans la comparaison, le doute et avant que'),
    b('Recognise and deploy expletive ne after autre que, plus… que, avant que, à moins que, and negated nier/douter.', 'Repérer et employer le ne explétif après les comparatifs d’inégalité, avant que, à moins que et ne pas douter.'),
    [
      b('Master comparative expletive ne (plus complexe qu’on ne le pense, autrement que vous ne l’imaginez).', 'Maîtriser le ne explétif dans les comparatives d’inégalité (plus sage qu’on ne croit).'),
      b('Apply polarity sensitivity after ne pas douter / ne pas nier (expletive ne) vs. affirmative douter (no ne).', 'Distinguer l’emploi du ne explétif après douter/nier à la forme négative ou interrogative.'),
    ],
    13,
    [
      card(
        b('Where formal prose quietly slips in ne explétif', 'Les autres foyers du ne explétif'),
        b(
          'Outside fear verbs, three elevated structures trigger **ne explétif**:\n1) **Inequality comparisons** (**Il est plus habile qu’on ne l’imagine**, **La réponse est autre que vous ne croyez**) — note the verb stays **indicative** here!\n2) **Conjunctions before/unless** (**avant que… ne**, **à moins que… ne**, **sans que** occasionally in older prose).\n3) **Negated or questioned doubt/denial** (**Je ne doute pas qu’il ne vienne**, **Nul ne nie que ce choix ne comporte des risques**) — whereas affirmative *Je doute que…* omits *ne*.\nInequality (indicative): **plus tôt que je ne pensais, autre que tu ne l’espérais**.\nSubjunctive conjunctions: **avant qu’il ne soit tard, à moins qu’elle ne refuse**.\nNegated doubt (subjunctive): **il ne fait aucun doute qu’il ne soit prêt, je ne nie pas qu’elle n’ait raison**.',
          'Hors des verbes de crainte, trois contextes appellent un **ne explétif** soutenu :\n1) **La comparaison d’inégalité** (**Il réagit plus vite qu’on ne le croit**, **Le cas est autre que vous ne l’imaginez**), suivie de l’**indicatif**.\n2) **Avant que** et **à moins que** (+ subjonctif : **avant qu’il ne parte**, **à moins qu’un obstacle ne surgisse**).\n3) **Douter, nier, contester** employés **à la forme négative ou interrogative** (**Je ne doute pas qu’il ne réussisse**), alors que la forme affirmative n’en prend pas.\nComparatives à l’indicatif : **plus complexe qu’il ne paraît, autre que je ne pensais**.\nConjonctions au subjonctif : **avant qu’il ne gèle, à moins qu’elle ne décline**.\nDoute/négation niés : **personne ne doute qu’il ne s’agisse, je ne conteste pas qu’il n’ait agi**.',
        ),
        {
          ex: [
            ['La situation évolue bien plus rapidement que nous ne l’avions anticipé.', 'The situation is evolving far more rapidly than we had anticipated.'],
            ['Intervenons sans délai avant que ce malentendu ne s’envenime.', 'Let us step in without delay before this misunderstanding worsens.'],
            ['À moins qu’un revirement ne se produise, le texte sera adopté ce soir.', 'Unless a reversal occurs, the bill will be passed tonight.'],
          ],
        },
      ),
      pairs(
        P.match,
        [
          ['plus grave qu’on ne le dit', b('inequality comparison → indicative + expletive ne', 'comparative d’inégalité (indicatif)')],
          ['avant qu’il ne disparaisse', b('time anteriority → subjunctive + expletive ne', 'antériorité (subjonctif)')],
          ['à moins qu’elle ne renonce', b('negative condition → subjunctive + expletive ne', 'restriction conditionnelle (subjonctif)')],
          ['je ne doute pas qu’il n’accepte', b('negated verb of doubt → subjunctive + optional ne', 'verbe de doute nié (subjonctif)')],
        ],
      ),
      mc(
        P.best,
        [
          b('L’affaire est autrement plus délicate que vous ne l’imaginez.', 'L’affaire est autrement plus délicate que vous ne l’imaginez.'),
          b('L’affaire est autant délicate que vous ne l’imaginez.', 'L’affaire est autant délicate que vous ne l’imaginez.'),
          b('L’affaire est aussi délicate que vous ne l’imaginez.', 'L’affaire est aussi délicate que vous ne l’imaginez.'),
        ],
        { explain: b('Equality comparisons (aussi… que, autant… que) never take expletive ne — only inequality comparisons (plus, moins, autre, autrement) do!', 'L’explétif n’apparaît jamais dans une comparaison d’égalité (aussi… que) ; il exige une inégalité (plus, moins, autre).') },
      ),
      gap(
        b('Insert the right verb mood and expletive ne where required.', 'Complétez en conjuguant au bon mode avec ou sans ne explétif.'),
        'Réglez cet écart avant que la presse ___ (s’emparer, subjonctif + ne explétif) ; la réforme coûtera d’ailleurs moins cher qu’on ___ (penser, indicatif + le).',
        ['ne s’en empare', 'ne le pense'],
        {
          hint: b('First blank: ne + en + s’ → ne s’en empare! Wait: s’emparer de → s’en empare.', 'Première lacune : s’emparer de donne ne s’en empare au subjonctif ; seconde : ne le pense à l’indicatif.'),
        },
      ),
      ord(
        P.order,
        'Ce chantier aura exigé davantage d’efforts que nous ne l’avions prévu.',
        {
          tr: 'This project will have demanded more effort than we had foreseen.',
          extra: ['pas', 'prévus'],
        },
      ),
    ],
    [
      b('Inequality comparisons take expletive ne with the indicative; avant que / à moins que take it with the subjunctive.', 'La comparaison d’inégalité prend un ne explétif à l’indicatif ; avant que et à moins que le prennent au subjonctif.'),
      b('Equality comparisons (aussi… que, autant… que) never take expletive ne.', 'Jamais de ne explétif après aussi… que ou autant… que.'),
    ],
    [
      ['autrement que… ne', 'differently from how…'],
      ['à moins que… ne', 'unless'],
      ['je ne doute pas qu’il ne…', 'I do not doubt that he…'],
    ],
  ),

  lesson(
    'gr-ne-expletif-and-lit-negation',
    3,
    ['literary-single-ne-verbs', 'ne-seul-litteraire-oser-cesser-savoir'],
    b('Single-Word Literary Negation (ne Alone)', 'La négation littéraire par ne seul (oser, cesser, pouvoir, savoir)'),
    b('Master the four classical verbs that drop pas cleanly in elevated prose and fixed C2 idioms.', 'Maîtriser le ne seul véritablement négatif avec oser, cesser, pouvoir, savoir et les tours figés C2.'),
    [
      b('Recognise genuine negation using ne alone (Je n’ose espérer, Il ne cesse de pleuvoir, Je ne sais quel).', 'Identifier le ne seul véritablement négatif devant oser, cesser, pouvoir et savoir.'),
      b('Contrast Je ne sais (uncertainty) vs. Je ne saurais + inf. (“I could not possibly”) vs. Que n’est-il… !', 'Maîtriser Je ne saurais, Il n’est rien qui et les exclamations oratoires en Que ne….'),
    ],
    13,
    [
      card(
        b('Real negation without pas: when ne carries all the force', 'Une vraie négation sans pas'),
        b(
          'Unlike *ne explétif* (which is non-negative), the **single-word ne** with four core verbs — **pouvoir, oser, cesser, savoir** — expresses a **genuine, full negation** without needing *pas*! It also thrives in conditional **Je ne saurais + inf.** (= I could not / cannot bring myself to), **si ce n’est** (= except), **n’importe** / **qu’à cela ne tienne**, and **Il n’est + noun + qui ne (+ subjonctif)**.\nFour core verbs: **je n’ose croire, il ne cesse d’insister, je ne puis / peux tolérer, je ne saurais accepter**.\nInterrogative rhetoric: **Qui ne voit que… ?, Que n’a-t-il agi plus tôt !**.\nIndefinite literary idioms: **je ne sais quel motif, à Dieu ne plaise, peu s’en faut que**.',
          'À l’inverse du *ne explétif*, le **ne employé seul** devant quatre verbes privilégiés (**pouvoir, oser, cesser, savoir**) exprime une **négation pleine et entière** sans recours à *pas*. On le retrouve aussi dans **Je ne saurais + infinitif** (conditionnel d’atténuation = « je ne puis »), **si ce n’est**, et la tournure **Il n’est… qui ne (+ subjonctif)**.\nQuatre verbes piliers : **je n’ose espérer, elle ne cesse d’alerter, nul ne peut ignorer, je ne saurais valider**.\nInterrogations oratoires : **Qui ne comprendrait ?, Que n’avez-vous prévenu !**.\nTournures figées : **je ne sais quelle raison, qu’à cela ne tienne, il n’est règle qui ne connaisse**.',
        ),
        {
          ex: [
            ['Je ne saurais souscrire à une interprétation aussi restrictive des textes.', 'I could not possibly subscribe to such a restrictive reading of the texts.'],
            ['L’orateur n’a cessé de rappeler l’urgence d’un tel compromis.', 'The speaker never stopped recalling the urgency of such a compromise.'],
            ['Nul n’oserait prétendre que cette réforme ait résolu toutes les tensions.', 'No one would dare claim that this reform solved all tensions.'],
          ],
        },
      ),
      sort(
        P.sort,
        [b('Expletive ne (stylistic, no negation)', 'Ne explétif (non négatif)'), b('Single ne (genuine negation)', 'Ne seul (vraie négation littéraire)')],
        [
          ['Je crains qu’il ne soit trop tard.', 0],
          ['Je ne saurais accepter pareille clause.', 1],
          ['Avant que la nuit ne tombe, rentrons.', 0],
          ['Elle n’ose avouer son erreur.', 1],
          ['Il écrit mieux qu’il ne parle.', 0],
          ['Qui ne voit l’ampleur du problème ?', 1],
        ],
      ),
      mc(
        P.meaning,
        [
          b('Je ne saurais vous dire combien ce geste compte.', 'Je ne peux vraiment pas vous dire (atténuation soutenue) combien ce geste compte.'),
          b('Je ne savais autrefois pas comment le dire.', 'Autrefois, j’ignorais la réponse.'),
          b('Je saurai sûrement demain vous le dire.', 'Je connaîtrai sûrement la réponse demain.'),
        ],
        { fr: 'Je ne saurais vous dire combien ce geste compte.', explain: b('Je ne saurais + inf. is a polite/formal modal meaning “I cannot / could not”.', 'Je ne saurais + infinitif fonctionne comme un équivalent soutenu et poli de « je ne peux pas ». ') },
      ),
      dlg(
        b('Interpreting C2 literary editorial prose', 'Analyser un éditorial de style soutenu'),
        b('A literature tutor and an advanced learner unpack single-word ne sentences from an essay.', 'Un professeur de lettres et un étudiant C2 commentent deux passages d’éditorial.'),
        [['Professeure', 'f2'], ['Loïc', 'm']],
        [
          [0, 'Dans « Il n’est guère de réforme qui ne suscite de craintes, si ce n’est celles que personne ne remarque », combien y a-t-il de vraies négations ?', 'In “Il n’est guère de réforme qui ne suscite de craintes, si ce n’est celles que personne ne remarque”, how many real negations are there?'],
          [1, {
            options: [
              'Trois vraies négations (« n’est guère », « qui ne suscite », « personne ne remarque ») et « si ce n’est » qui signifie « excepté ».',
              'Seulement une, car tout le reste est du ne explétif.',
              'Aucune, le texte affirme qu’aucune crainte n’existe.',
            ],
            explain: b('In Il n’est X qui ne + subj., both clauses negate (double negative = “every reform stirs concern”), and si ce n’est means “except”.', 'Il n’est X qui ne… vaut une double négation universelle (« toute réforme suscite… »), et si ce n’est signifie « sauf ».'),
          }],
          [0, 'Et si l’auteur avait écrit « Je n’ose y croire » dans le paragraphe suivant ?', 'And if the author wrote “Je n’ose y croire” in the next paragraph?'],
          [1, {
            options: [
              'C’est bien une négation réelle sans « pas » grâce au verbe oser.',
              'C’est un ne explétif, donc il y croit tout à fait.',
              'C’est une faute grammaticale moderne interdite en français.',
            ],
          }],
        ],
      ),
      gap(
        b('Complete with the exact C2 single-ne wording.', 'Complétez ces tournures littéraires sans pas.'),
        'Je ___ (pouvoir, soutenu) tolérer pareille négligence ; ___ (oser, présent) lui demander des comptes avant que la rumeur ___ (se répandre, subjonctif) davantage !',
        [['ne puis', 'ne saurais'], ['n’ose'], 'ne se répande'],
        {
          explain: b('First two blanks show real single-ne negation (ne puis / n’ose); third blank shows expletive ne after avant que.', 'Les deux premiers verbes emploient la vraie négation sans pas ; le dernier porte un ne explétif après avant que.'),
        },
      ),
      dict('Je ne saurais accepter avant que ce texte ne soit relu.'),
    ],
    [
      b('Single ne with oser, cesser, pouvoir, and savoir expresses true negation without pas in C2 prose.', 'Avec oser, cesser, pouvoir et savoir, le ne seul exprime une véritable négation en style soutenu.'),
      b('Always distinguish positive expletive ne (craindre, avant que, plus… que) from real negative single ne.', 'Toujours distinguer ne explétif (sans valeur négative) et ne seul véritablement négatif.'),
    ],
    [
      ['je ne saurais (+ inf.)', 'I could not possibly…'],
      ['je n’ose croire', 'I dare not believe'],
      ['il ne cesse de (+ inf.)', 'it keeps on / never stops'],
      ['si ce n’est', 'except / if not'],
    ],
  ),
];

export default lessons;
