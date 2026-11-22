import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Master B2 time clauses across anteriority, simultaneity and posteriority. Know when French demands the subjunctive (avant que, en attendant que, jusqu’à ce que), when it requires the indicative and futur antérieur (après que, dès que, aussitôt que), and how to streamline same-subject sentences with avant de and après avoir.',
    'Maîtrisez les subordonnées de temps au niveau B2 : antériorité, simultanéité et postériorité. Sachez quand le français exige le subjonctif (avant que, en attendant que, jusqu’à ce que), quand il impose l’indicatif et le futur antérieur (après que, dès que, aussitôt que), et comment alléger la phrase avec avant de et après avoir.',
  ),
  outcomes: [
    b('Express anteriority accurately with avant que, en attendant que and jusqu’à ce que + subjunctive', 'Exprimer l’antériorité avec avant que, en attendant que et jusqu’à ce que + subjonctif'),
    b('Use tandis que, au moment où and à mesure que for simultaneity and progression', 'Employer tandis que, au moment où et à mesure que pour la simultanéité et la progression'),
    b('Apply the indicative and futur antérieur after après que, dès que and aussitôt que', 'Appliquer l’indicatif et le futur antérieur après après que, dès que et aussitôt que'),
    b('Form concise infinitive reductions with avant de, en attendant de and après avoir / être', 'Former des réductions infinitives concises avec avant de, en attendant de et après avoir / être'),
  ],
};

const C = 'gr-temporal-clauses-b2';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['anteriority-subjunctive', 'anteriorite-et-subjonctif'],
    b('Before an event happens: avant que, jusqu’à ce que', 'Avant qu’un événement n’arrive : avant que, jusqu’à ce que'),
    b('Time conjunctions of anteriority look toward an event that has not yet occurred, so they trigger the subjunctive.', 'Les conjonctions d’antériorité visent un fait qui n’a pas encore eu lieu et déclenchent donc le subjonctif.'),
    [
      b('Use avant que, en attendant que and jusqu’à ce que + subjunctive', 'Employer avant que, en attendant que et jusqu’à ce que + subjonctif'),
      b('Recognize the optional ne explétif after avant que', 'Reconnaître le ne explétif facultatif après avant que'),
      b('Avoid using the future or indicative after anteriority triggers', 'Éviter le futur ou l’indicatif après les conjonctions d’antériorité'),
    ],
    13,
    [
      card(
        b('Anteriority triggers the subjunctive', 'L’antériorité appelle le subjonctif'),
        b(
          'When action A happens **before** action B (**avant que**, **en attendant que**, **jusqu’à ce que**, **d’ici à ce que**), action B is still unrealized from the standpoint of action A. French therefore requires the **subjonctif**—even when referring to a past habit or a future deadline.\n\nSubjunctive time triggers: **avant que, en attendant que, jusqu’à ce que**.\nDeadline variant: **d’ici à ce que · en attendant que**.',
          'Quand l’action A se produit **avant** l’action B (**avant que**, **en attendant que**, **jusqu’à ce que**, **d’ici à ce que**), l’action B n’est pas encore réalisée au moment de A. Le français impose donc le **subjonctif**, même pour un fait passé ou futur.\n\nTemps et subjonctif : **avant que, en attendant que, jusqu’à ce que**.\nÉchéance : **d’ici à ce que · en attendant que**.',
        ),
        {
          table: {
            head: [b('Conjunction', 'Conjonction'), b('Mood', 'Mode'), b('Meaning', 'Sens')],
            rows: [
              ['avant que (+ ne)', b('subjunctive', 'subjonctif'), b('before', 'avant le moment où')],
              ['en attendant que', b('subjunctive', 'subjonctif'), b('until / while waiting for', 'le temps que')],
              ['jusqu’à ce que', b('subjunctive', 'subjonctif'), b('until', 'jusqu’au moment où')],
              ['d’ici à ce que', b('subjunctive', 'subjonctif'), b('between now and when', 'avant que n’arrive le moment où')],
            ],
          },
          ex: [
            ['Relisez le contrat avant que nous le signions.', 'Reread the contract before we sign it.'],
            ['Nous restons au bureau en attendant que la pluie cesse.', 'We are staying at the office until the rain stops.'],
            ['Elle a insisté jusqu’à ce qu’il comprenne son erreur.', 'She insisted until he understood his mistake.'],
          ],
        },
      ),
      trap(
        b('Watch the optional ne explétif after avant que', 'Attention au ne explétif après avant que'),
        b(
          'In careful prose, **avant que** often takes a stylistic **ne explétif**: **avant qu’il ne soit trop tard**. It has NO negative meaning and translates the exact same way as **avant qu’il soit trop tard**. Never use **pas** with it unless you mean “before he fails to…”.\n\nBoth accepted: **avant qu’il parte · avant qu’il ne parte**.\nWait in vain for negation: **avant qu’il ne soit pas prêt**.',
          'Dans un style soigné, **avant que** s’accompagne souvent d’un **ne explétif** : **avant qu’il ne soit trop tard**. Il n’a AUCUNE valeur négative et équivaut à **avant qu’il soit trop tard**. N’ajoutez jamais **pas** sauf négation réelle.\n\nDeux formes admises : **avant qu’il parte · avant qu’il ne parte**.\nNégation réelle rare : **avant qu’il ne soit pas prêt**.',
        ),
      ),
      mc(
        P.form,
        ['soit', 'est', 'sera', 'serait'],
        {
          fr: 'Sauvegardez vos fichiers avant que l’ordinateur ne ___ redémarré.',
          explain: b('Avant que requires the subjunctive (soit), and ne is expletive.', 'Avant que exige le subjonctif (soit), ici avec le ne explétif.'),
        },
      ),
      mc(
        P.form,
        ['revienne', 'revient', 'reviendra', 'revenait'],
        {
          fr: 'Installez-vous dans le salon en attendant que le directeur ___.',
          explain: b('En attendant que always governs the subjunctive (revienne).', 'En attendant que régit toujours le subjonctif (revienne).'),
        },
      ),
      gap(
        P.complete,
        'Ils ont travaillé jusqu’à ce que toute l’équipe ___ (trouver) une solution. Règle cette facture avant que la banque ___ (fermer).',
        [['ait trouvé', 'trouve'], ['ne ferme', 'ferme']],
        { hint: b('Use the subjunctive (present or past subjunctive for completed result).', 'Employez le subjonctif (présent ou passé pour un fait achevé).') },
      ),
      hear(
        'Nous attendrons ici jusqu’à ce que la neige fonde.',
        b('Which mood do you hear after « jusqu’à ce que »?', 'Quel mode entendez-vous après « jusqu’à ce que » ?'),
        [
          b('The subjunctive (fonde)', 'Le subjonctif (fonde)'),
          b('The simple future (fondra)', 'Le futur simple (fondra)'),
          b('The conditional (fondrait)', 'Le conditionnel (fondrait)'),
        ],
      ),
      ord(
        P.order,
        'Agissons vite avant que la situation ne s’aggrave.',
        { tr: 'Let’s act quickly before the situation gets worse.' },
      ),
      pairs(
        P.match,
        [
          ['avant que', b('before (+ subjunctive)', 'antérieurement à (+ subjonctif)')],
          ['en attendant que', b('while waiting for (+ subjunctive)', 'pendant qu’on attend que (+ subjonctif)')],
          ['jusqu’à ce que', b('until (+ subjunctive)', 'jusqu’au terme où (+ subjonctif)')],
          ['d’ici à ce que', b('by the time (+ subjunctive)', 'dans l’intervalle menant à (+ subjonctif)')],
        ],
      ),
      dict('Patientez dans le hall jusqu’à ce que l’on appelle votre numéro.'),
      say('Prévenez-moi avant que votre train n’arrive en gare.', 'Let me know before your train arrives at the station.'),
    ],
    [
      b('avant que, en attendant que, jusqu’à ce que and d’ici à ce que always take the subjunctive.', 'avant que, en attendant que, jusqu’à ce que et d’ici à ce que prennent toujours le subjonctif.'),
      b('avant que may carry an optional ne explétif without negative sense.', 'avant que accepte un ne explétif facultatif sans valeur négative.'),
      b('Even in past narration, French keeps the subjunctive after jusqu’à ce que.', 'Même dans un récit au passé, le français maintient le subjonctif après jusqu’à ce que.'),
    ],
    [
      ['avant que', b('before (+ subjunctive)', 'avant le moment où (+ subjonctif)')],
      ['en attendant que', b('until, while waiting for', 'le temps que (+ subjonctif)')],
      ['jusqu’à ce que', b('until (+ subjunctive)', 'jusqu’au moment où (+ subjonctif)')],
      ['d’ici à ce que', b('by the time that', 'd’ici au moment où')],
    ],
  ),

  lesson(
    C,
    2,
    ['simultaneity-indicative', 'simultaneite-et-indicatif'],
    b('Simultaneity and parallel change: tandis que, à mesure que', 'Simultanéité et progression : tandis que, à mesure que'),
    b('Describe simultaneous actions, exact moments and parallel progression with the indicative.', 'Décrire des actions simultanées, un instant précis ou une évolution parallèle à l’indicatif.'),
    [
      b('Use pendant que, tandis que and alors que with the indicative', 'Employer pendant que, tandis que et alors que à l’indicatif'),
      b('Distinguish temporal simultaneity from opposition in tandis que / alors que', 'Distinguer simultanéité et opposition avec tandis que et alors que'),
      b('Express progressive parallel change with à mesure que and au fur et à mesure que', 'Exprimer une progression parallèle avec à mesure que et au fur et à mesure que'),
    ],
    13,
    [
      card(
        b('Two actions happening together', 'Deux actions simultanées'),
        b(
          'When two actions happen at the same time, French uses the **indicatif** because both facts are real. **Pendant que** focuses purely on overlapping duration; **tandis que** and **alors que** express either simultaneity or contrast (“whereas”); **au moment où** pinpoints an instant; **à mesure que** (or **au fur et à mesure que**) tracks parallel progression.\n\nDuration & overlap: **pendant que, tandis que, alors que**.\nExact moment or repetition: **au moment où, lorsque, chaque fois que**.\nGradual progression: **à mesure que · au fur et à mesure que**.',
          'Quand deux actions se déroulent en même temps, le français emploie l’**indicatif** car les faits sont réels. **Pendant que** insiste sur la durée partagée ; **tandis que** et **alors que** marquent soit la simultanéité soit l’opposition ; **au moment où** isole un instant précis ; **à mesure que** (ou **au fur et à mesure que**) suit une évolution parallèle.\n\nDurée partagée : **pendant que, tandis que, alors que**.\nInstant précis ou répétition : **au moment où, lorsque, chaque fois que**.\nProgression parallèle : **à mesure que · au fur et à mesure que**.',
        ),
        {
          table: {
            head: [b('Conjunction', 'Conjonction'), b('Mood', 'Mode'), b('Specific nuance', 'Nuance précise')],
            rows: [
              ['pendant que', b('indicative', 'indicatif'), b('while (same duration)', 'pendant la même durée')],
              ['tandis que / alors que', b('indicative', 'indicatif'), b('while OR whereas (contrast)', 'simultanéité ou opposition')],
              ['au moment où', b('indicative', 'indicatif'), b('just when / as', 'à l’instant précis où')],
              ['à mesure que / au fur et à mesure que', b('indicative', 'indicatif'), b('as (gradually, in proportion)', 'progressivement en même temps que')],
            ],
          },
          ex: [
            ['Pendant que tu prépares le café, je relis mes notes.', 'While you make the coffee, I am rereading my notes.'],
            ['À mesure que la nuit tombait, la place se vidait.', 'As night fell, the square gradually emptied.'],
            ['Au moment où elle allait sortir, le téléphone a sonné.', 'Just as she was about to go out, the phone rang.'],
          ],
        },
      ),
      tip(
        b('Keep the tenses aligned in à mesure que', 'Harmonisez les temps avec à mesure que'),
        b(
          'In **à mesure que**, both clauses normally share the **same tense** because the two changes advance step by step together: present + present, imparfait + imparfait, or future + future.\n\nParallel tenses: **à mesure qu’il parle / on comprend · à mesure qu’on montait / il faisait froid**.',
          'Avec **à mesure que**, les deux propositions prennent généralement le **même temps** car les deux évolutions avancent au même rythme : présent + présent, imparfait + imparfait, ou futur + futur.\n\nTemps parallèles : **à mesure qu’il parle / on comprend · à mesure qu’on montait / il faisait froid**.',
        ),
      ),
      mc(
        P.best,
        [
          'à mesure que',
          'avant que',
          'jusqu’à ce que',
          'à moins que',
        ],
        {
          fr: '___ les jours rallongent, la température remonte doucement.',
          explain: b('À mesure que expresses progressive parallel evolution with the indicative.', 'À mesure que exprime une progression parallèle avec l’indicatif.'),
        },
      ),
      mc(
        P.choose,
        ['tandis que', 'pendant', 'au moment où', 'dès lors'],
        {
          fr: 'Les exportations progressent rapidement, ___ la demande intérieure stagne.',
          explain: b('Tandis que naturally expresses contrast/simultaneity (“whereas”), unlike pendant which cannot precede a clause without que.', 'Tandis que exprime naturellement l’opposition simultanée (« alors que »), tandis que pendant seul est une préposition.'),
        },
      ),
      gap(
        P.complete,
        'Au moment où le rideau ___ (se lever), la salle s’est tue. Chaque fois qu’ils ___ (venir) à Lyon, ils réservent cette table.',
        [['s’est levé', 'se levait'], ['viennent']],
      ),
      sort(
        b('Subjunctive or indicative?', 'Subjonctif ou indicatif ?'),
        [
          b('Subjunctive', 'Subjonctif'),
          b('Indicative', 'Indicatif'),
        ],
        [
          ['avant que', 0],
          ['tandis que', 1],
          ['jusqu’à ce que', 0],
          ['à mesure que', 1],
          ['en attendant que', 0],
          ['au moment où', 1],
        ],
      ),
      ord(
        P.order,
        'Au fur et à mesure que le projet avance, les doutes disparaissent.',
        { tr: 'As the project progresses, doubts gradually disappear.' },
      ),
      pairs(
        P.match,
        [
          ['tandis que', b('while / whereas', 'en même temps ou par opposition')],
          ['au moment où', b('at the exact moment when', 'à l’instant précis où')],
          ['à mesure que', b('gradually as', 'progressivement, au rythme où')],
          ['pendant que', b('during the time that', 'durant le temps où')],
        ],
      ),
      dict('Tandis que les uns rédigent la synthèse, les autres vérifient les chiffres.'),
      say('Au moment où j’ouvrais la porte, il m’a tendu le dossier.', 'Just as I was opening the door, he handed me the file.'),
    ],
    [
      b('Simultaneity conjunctions (pendant que, tandis que, alors que, au moment où, à mesure que) take the indicative.', 'Les conjonctions de simultanéité (pendant que, tandis que, alors que, au moment où, à mesure que) prennent l’indicatif.'),
      b('à mesure que and au fur et à mesure que pair matching tenses to express proportional progression.', 'à mesure que et au fur et à mesure que associent des temps parallèles pour marquer une progression.'),
      b('tandis que and alors que can signal either simultaneous action or contrast.', 'tandis que et alors que expriment soit la simultanéité, soit l’opposition.'),
    ],
    [
      ['tandis que', b('while, whereas', 'pendant que, alors que')],
      ['à mesure que', b('as (progressively)', 'progressivement à mesure')],
      ['au moment où', b('just when, at the moment when', 'à l’instant précis où')],
      ['au fur et à mesure que', b('gradually as', 'au rythme même où')],
    ],
  ),

  lesson(
    C,
    3,
    ['posteriority-and-futur-anterieur', 'posteriorite-et-futur-anterieur'],
    b('After an event happens: après que, dès que, futur antérieur', 'Après un événement : après que, dès que, futur antérieur'),
    b('Sequence actions cleanly with après que, dès que, aussitôt que and compound tenses.', 'Ordonner deux faits successifs avec après que, dès que, aussitôt que et les temps composés.'),
    [
      b('Apply the indicative after après que, dès que, aussitôt que and une fois que', 'Appliquer l’indicatif après après que, dès que, aussitôt que et une fois que'),
      b('Use the futur antérieur when the main clause is in the future or imperative', 'Employer le futur antérieur quand la principale est au futur ou à l’impératif'),
      b('Avoid the common subjunctive mistake after après que', 'Éviter l’erreur fréquente du subjonctif après après que'),
    ],
    13,
    [
      card(
        b('Posteriority uses the indicative and compound tenses', 'La postériorité emploie l’indicatif et les temps composés'),
        b(
          'With **après que**, **dès que**, **aussitôt que**, **une fois que**, the subordinate action happens **before** the main action: it is already accomplished when the main verb takes place. Therefore, French uses the **indicatif**, typically a **compound tense** matching the timeframe of the main verb.\n\nPosteriority triggers: **après que, dès que, aussitôt que, une fois que**.\nStarting point in time: **depuis que · dès lors que**.',
          'Avec **après que**, **dès que**, **aussitôt que**, **une fois que**, l’action subordonnée est **antérieure** à l’action principale : elle est déjà accomplie quand le verbe principal se produit. Le français emploie donc l’**indicatif**, le plus souvent à un **temps composé** accordé au temps de la principale.\n\nPostériorité : **après que, dès que, aussitôt que, une fois que**.\nPoint de départ : **depuis que · dès lors que**.',
        ),
        {
          table: {
            head: [b('Main clause tense', 'Temps de la principale'), b('Subordinate clause tense', 'Temps après après que / dès que'), b('Example', 'Exemple')],
            rows: [
              [b('Present (habit)', 'Présent (habitude)'), b('passé composé', 'passé composé'), 'Dès qu’il a fini, il sort.'],
              [b('Future / Imperative', 'Futur / Impératif'), b('futur antérieur', 'futur antérieur'), 'Dès qu’il aura fini, il sortira.'],
              [b('Passé composé / Passé simple', 'Passé composé / Passé simple'), b('plus-que-parfait (or p.c.)', 'plus-que-parfait (ou p.c.)'), 'Après qu’il avait fini, il est sorti.'],
            ],
          },
          ex: [
            ['Dès que vous aurez reçu le colis, confirmez-nous la réception.', 'As soon as you receive the parcel, confirm delivery to us.'],
            ['Aussitôt que les résultats ont été publiés, la presse a réagi.', 'As soon as the results were published, the press reacted.'],
            ['Une fois qu’elle aura signé le bail, elle récupérera les clés.', 'Once she signs the lease, she will collect the keys.'],
          ],
        },
      ),
      trap(
        b('Après que takes the indicative, NOT the subjunctive', 'Après que prend l’indicatif, PAS le subjonctif'),
        b(
          'Even native speakers sometimes slip into the subjunctive after **après que** by false analogy with *avant que*. In B2/C1 grammar and exams, **après que** governs the **indicatif** because the action has already occurred: **après qu’il est parti** or **après qu’il sera parti**, NOT *après qu’il soit parti*.\n\nCorrect (indicative): **après qu’il est arrivé, après qu’elle aura parlé**.\nAvoid in exams: **après qu’il soit arrivé · après qu’elle ait parlé**.',
          'Par fausse analogie avec *avant que*, on entend parfois le subjonctif après **après que** à l’oral. À l’écrit et aux examens B2/C1, **après que** demande l’**indicatif** car le fait est accompli : **après qu’il est parti** ou **après qu’il sera parti**, et non *après qu’il soit parti*.\n\nCorrect (indicatif) : **après qu’il est arrivé, après qu’elle aura parlé**.\nÀ éviter en examen : **après qu’il soit arrivé · après qu’elle ait parlé**.',
        ),
      ),
      mc(
        P.form,
        ['a rendu', 'ait rendu', 'rende', 'rendait'],
        {
          fr: 'Après que le jury ___ son verdict, la salle a applaudi.',
          explain: b('Après que governs the indicative (a rendu), not the subjunctive (ait rendu).', 'Après que régit l’indicatif (a rendu), et non le subjonctif (ait rendu).'),
        },
      ),
      mc(
        P.form,
        ['aurons terminé', 'terminons', 'ayons terminé', 'terminerions'],
        {
          fr: 'Dès que nous ___ cette étape, nous passerons à la validation finale.',
          explain: b('With a future main clause (passerons), use the futur antérieur (aurons terminé) to show completion before the next step.', 'Avec un verbe principal au futur (passerons), employez le futur antérieur (aurons terminé) pour marquer l’antériorité.'),
        },
      ),
      gap(
        P.complete,
        'Aussitôt que tu ___ (arriver) à la gare, appelle-moi. Depuis qu’ils ___ (déménager) à Nantes, on les voit moins souvent.',
        [['seras arrivé', 'seras arrivée', 'arriveras'], ['ont déménagé']],
        { hint: b('Use the futur antérieur with être in the first blank, and the passé composé in the second.', 'Employez le futur antérieur avec être dans le premier trou, puis le passé composé.') },
      ),
      hear(
        'Une fois que le comité aura voté, nous publierons le décret.',
        b('Why is « aura voté » in the futur antérieur?', 'Pourquoi « aura voté » est-il au futur antérieur ?'),
        [
          b('Because the vote finishes before publishing the decree', 'Parce que le vote s’achève avant la publication du décret'),
          b('Because une fois que triggers the subjunctive', 'Parce que une fois que impose le subjonctif'),
          b('Because the speaker doubts the vote will happen', 'Parce que le locuteur doute que le vote ait lieu'),
        ],
      ),
      ord(
        P.order,
        'Après qu’il a présenté ses arguments, le débat s’est animé.',
        { tr: 'After he presented his arguments, the debate grew lively.' },
      ),
      sort(
        b('Which tense follows in a future sentence?', 'Quel temps emploie-t-on dans une phrase au futur ?'),
        [
          b('Subjunctive', 'Subjonctif'),
          b('Futur antérieur', 'Futur antérieur'),
        ],
        [
          ['avant qu’elle parte', 0],
          ['dès qu’elle sera partie', 1],
          ['jusqu’à ce qu’il comprenne', 0],
          ['aussitôt qu’il aura compris', 1],
          ['en attendant qu’ils répondent', 0],
          ['après qu’ils auront répondu', 1],
        ],
      ),
      dict('Dès qu’elle aura lu votre courriel, elle vous fixera un rendez-vous.'),
      say('Après que le rapport a été diffusé, plusieurs amendements ont été proposés.', 'After the report was circulated, several amendments were proposed.'),
    ],
    [
      b('après que, dès que, aussitôt que and une fois que take the indicative—never the subjunctive in standard French.', 'après que, dès que, aussitôt que et une fois que prennent l’indicatif, jamais le subjonctif en français standard.'),
      b('When the main clause is future or imperative, posteriority clauses take the futur antérieur (aurai/serai + participe passé).', 'Quand la principale est au futur ou à l’impératif, la subordonnée prend le futur antérieur.'),
      b('French does not use the present tense where a completed future prerequisite is meant (dès qu’il aura fini, not dès qu’il finit).', 'On utilise le futur antérieur pour une action future préalable achevée (dès qu’il aura fini).'),
    ],
    [
      ['dès que', b('as soon as (+ indicative)', 'aussitôt que (+ indicatif)')],
      ['aussitôt que', b('immediately after', 'dès l’instant où')],
      ['après que', b('after (+ indicative)', 'postérieurement à (+ indicatif)')],
      ['une fois que', b('once (+ indicative)', 'dès lors que c’est fait')],
    ],
  ),

  lesson(
    C,
    4,
    ['infinitive-time-reductions', 'reductions-infinitives-temps'],
    b('Infinitive reductions: avant de, après avoir', 'Réductions infinitives : avant de, après avoir'),
    b('Streamline same-subject time clauses with avant de, en attendant de and the past infinitive after après.', 'Alléger les subordonnées temporelles de même sujet avec avant de, en attendant de et l’infinitif passé après après.'),
    [
      b('Use avant de and en attendant de + infinitive when the subject is the same', 'Employer avant de et en attendant de + infinitif à sujet identique'),
      b('Form the infinitif passé (après avoir fait / après être parti) with agreement', 'Former l’infinitif passé (après avoir fait / après être parti) avec accord'),
      b('Choose between clause, infinitive and noun phrase in formal writing', 'Choisir entre subordonnée, infinitif et groupe nominal à l’écrit'),
    ],
    13,
    [
      card(
        b('Same subject: avant de and après + past infinitive', 'Même sujet : avant de et après + infinitif passé'),
        b(
          'Whenever both clauses have the **same subject**, replace the finite clause with an infinitive. Before the main action: **avant de + infinitif**, **en attendant de + infinitif**. After the main action: **après + infinitif passé** (**avoir** or **être** + past participle—never *après de*!). With **être**, the participle agrees with the subject.\n\nBefore: **avant de partir, en attendant de recevoir**.\nAfter (avoir): **après avoir relu, après avoir signé**.\nAfter (être, agrees): **après être arrivée, après s’être reposés**.',
          'Quand les deux propositions ont le **même sujet**, remplacez la subordonnée par un infinitif. Avant l’action principale : **avant de + infinitif**, **en attendant de + infinitif**. Après l’action principale : **après + infinitif passé** (**avoir** ou **être** + participe passé — jamais *après de* !). Avec **être**, le participe s’accorde avec le sujet.\n\nAvant : **avant de partir, en attendant de recevoir**.\nAprès (avoir) : **après avoir relu, après avoir signé**.\nAprès (être, accord) : **après être arrivée, après s’être reposés**.',
        ),
        {
          table: {
            head: [b('Two different subjects', 'Deux sujets différents'), b('Same subject', 'Même sujet')],
            rows: [
              ['avant que + subjonctif', 'avant de + infinitif'],
              ['en attendant que + subjonctif', 'en attendant de + infinitif'],
              ['après que + indicatif', 'après + avoir / être + participe passé'],
              ['dès que + indicatif', 'dès + nom (dès son arrivée)'],
            ],
          },
          ex: [
            ['Relisez attentivement votre copie avant de la rendre.', 'Read your paper carefully before handing it in.'],
            ['Après être restée deux ans à Montréal, Claire est rentrée à Lyon.', 'After staying two years in Montreal, Claire returned to Lyon.'],
            ['En attendant d’obtenir le visa, il suit des cours intensifs.', 'While waiting to obtain the visa, he is taking intensive courses.'],
          ],
        },
      ),
      tip(
        b('Notice the agreement with après être and pronominals', 'Accord avec après être et les verbes pronominaux'),
        b(
          'Because **après + infinitif passé** has no expressed subject inside the infinitive phrase, the past participle with **être** (or pronominal verbs like *se rendre compte*, *s’asseoir*) agrees with the **subject of the main clause**: *Après s’être **entretenues** avec le maire, les élues ont publié un communiqué.*\n\nAgreement check: **après être partie · après s’être excusés · après nous être réunis**.',
          'Comme **après + infinitif passé** n’a pas de sujet exprimé devant l’infinitif, le participe employé avec **être** (ou un verbe pronominal) s’accorde avec le **sujet de la proposition principale** : *Après s’être **entretenues** avec le maire, les élues ont publié un communiqué.*\n\nAccords à surveiller : **après être partie · après s’être excusés · après nous être réunis**.',
        ),
      ),
      mc(
        P.form,
        ['avoir vérifié', 'de vérifier', 'vérifier', 'vérifié'],
        {
          fr: 'Après ___ toutes les sources, la journaliste a publié son enquête.',
          explain: b('Après requires the past infinitive without de: après avoir vérifié.', 'Après exige l’infinitif passé sans de : après avoir vérifié.'),
        },
      ),
      mc(
        P.spelling,
        ['être revenues', 'être revenu', 'avoir revenues', 'revenir'],
        {
          fr: 'Après ___ de leur mission, les chercheuses ont rédigé le bilan.',
          explain: b('Revenir takes être, and the past participle agrees with the feminine plural subject les chercheuses.', 'Revenir se conjugue avec être, et le participe s’accorde avec les chercheuses (féminin pluriel).'),
        },
      ),
      gap(
        P.completeText,
        '___ (Avant de / Avant que) soumettre le dossier, vérifiez les annexes. ___ (En attendant de / En attendant que) la commission se réunisse, préparez les graphiques. ___ (Après / Après que) avoir entendu chaque témoin, la présidente a levé la séance.',
        [['Avant de'], ['En attendant que'], ['Après']],
        {
          choices: [
            ['Avant de', 'Avant que'],
            ['En attendant que', 'En attendant de'],
            ['Après', 'Après que'],
          ],
        },
      ),
      dlg(
        b('Before the product launch', 'Avant le lancement du produit'),
        b('Nadia and Thomas review the final timeline.', 'Nadia et Thomas vérifient le calendrier final.'),
        [['Nadia', 'f'], ['Thomas', 'm']],
        [
          [0, 'On envoie le communiqué maintenant, ou on attend encore ?', 'Do we send the press release now, or wait a bit longer?'],
          [1, { options: ['Attendons d’abord que le service juridique valide le texte, avant de le diffuser.', 'Attendons que le service juridique valide le texte, avant que le diffuser.', 'Attendons avant de que le service juridique valide le texte.'] }],
          [0, 'D’accord. Et après avoir obtenu leur feu vert, qui contacte la presse ?', 'Agreed. And after getting their green light, who contacts the press?'],
          [1, { options: ['Dès que nous aurons reçu leur accord, je lancerai l’envoi groupé.', 'Dès que nous recevons leur accord, je lancerai l’envoi groupé.', 'Après que nous ayons reçu leur accord, je lancerai l’envoi.'] }],
        ],
      ),
      ord(
        P.order,
        'Après s’être concertés longuement, ils ont voté le budget.',
        { tr: 'After conferring at length, they voted on the budget.' },
      ),
      say('Avant de conclure ce contrat, comparons les trois devis.', 'Before concluding this contract, let’s compare the three quotes.'),
      write(
        b('Sequence a project timeline', 'Structurer la chronologie d’un projet'),
        b(
          'In 50 to 80 words, outline the timeline for launching a neighborhood library or cultural project. Include one anteriority clause with avant que or jusqu’à ce que, one posteriority clause with dès que or après que (indicative / futur antérieur), and one past infinitive with après.',
          'En 50 à 80 mots, présentez le calendrier de lancement d’une bibliothèque de quartier ou d’un projet culturel. Intégrez une subordonnée avec avant que ou jusqu’à ce que, une subordonnée avec dès que ou après que (indicatif / futur antérieur), et un infinitif passé après après.',
        ),
        50,
        80,
        [
          b('One clause with avant que or jusqu’à ce que + subjunctive', 'Une proposition avec avant que ou jusqu’à ce que + subjonctif'),
          b('One clause with dès que or après que + indicative / futur antérieur', 'Une proposition avec dès que ou après que + indicatif / futur antérieur'),
          b('One reduction with avant de or après + past infinitive', 'Une réduction avec avant de ou après + infinitif passé'),
        ],
        'Nous aménageons le local jusqu’à ce que les rayonnages soient installés. Avant d’ouvrir les portes au public, l’équipe classera trois mille ouvrages. Dès que le catalogue en ligne aura été testé, nous lancerons les inscriptions. Après avoir accueilli les premiers lecteurs samedi, nous organiserons un débat hebdomadaire pour ajuster les horaires.',
        {
          phrases: ['jusqu’à ce que', 'avant de', 'dès que', 'après avoir'],
        },
      ),
    ],
    [
      b('Use avant de and en attendant de + infinitive when both clauses share the same subject.', 'Employez avant de et en attendant de + infinitif quand le sujet est identique.'),
      b('After après, always use the past infinitive (avoir or être + past participle), never après de.', 'Après après, employez toujours l’infinitif passé (avoir ou être + participe passé), jamais après de.'),
      b('With après être / après s’être, agree the participle with the main clause subject.', 'Avec après être / après s’être, accordez le participe avec le sujet de la principale.'),
    ],
    [
      ['avant de', b('before (+ infinitive)', 'avant le fait de (+ infinitif)')],
      ['en attendant de', b('while waiting to (+ infinitive)', 'en attendant le moment de')],
      ['après avoir', b('after having (+ past participle)', 'une fois l’action accomplie')],
      ['dès son arrivée', b('upon arrival', 'dès qu’il ou elle arrive')],
    ],
  ),
];

export default lessons;
