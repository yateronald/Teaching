import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, pairs, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Master subtle C2 distinctions of verbal aspect, periphrastic semi-auxiliaries (être en train de, aller croissant, ne faire que, venir à), middle/pronominal voice, and complex passive nuances.',
    'Maîtriser les finesses aspectuelles et de diathèse au niveau C2 : aspect borné ou sécant, périphrases aspectuelles (aller croissant, venir à, ne faire que), voix moyenne et nuances du passif.',
  ),
  outcomes: [
    b('Differentiate bounded vs. unbounded aspect across French tenses and lexical verb classes (telic vs. atelic).', 'Distinguer l’aspect accompli, inaccompli, inchoatif et itératif à travers temps et périphrases.'),
    b('Select exact aspectual semi-auxiliaries (venir de vs. venir à, aller + -ant, faillir, ne pas laisser de).', 'Choisir avec précision les périphrases aspectuelles soutenues (venir à, aller croissant, être sur le point de, faillir).'),
    b('Contrast active, analytic passive, stative result passive (être fermé), and middle/intrinsic pronominal voices.', 'Distinguer passif d’action, passif d’état, voix moyenne pronominale et tournures impersonnelles.'),
  ],
};

const lessons: Lesson[] = [
  lesson(
    'gr-aspect-and-voice-c2',
    1,
    ['lexical-and-grammatical-aspect', 'aspect-lexical-et-aspect-grammatical'],
    b('Bounded vs. Ongoing Aspect & Telic Verbs', 'Aspect accompli, inaccompli et verbes bornés'),
    b('See why a verb’s built-in endpoint transforms how passé composé, imparfait, and present behave in French.', 'Comprendre comment le sémantisme borné d’un verbe modifie la lecture de l’imparfait et du passé composé.'),
    [
      b('Contrast atelic activities (marcher, chercher) vs. telic achievements (trouver, éclater, atteindre).', 'Opposer les procès non bornés (marcher, attendre) aux procès bornés (trouver, atteindre, éclater).'),
      b('Understand imparfait d’ouverture / pittoresque and imparfait de conatu (“tried to / nearly did”).', 'Reconnaître l’imparfait pittoresque et l’imparfait de tentative avortée (« était sur le point de »).'),
    ],
    13,
    [
      card(
        b('Tense shows time; aspect shows how an action unfolds inside time', 'Le temps situe ; l’aspect montre le déroulement interne'),
        b(
          'Even within the same past frame, aspect flips meaning. Notice how **Il a su la vérité** (bounded entry into knowing = “he found out”) differs sharply from **Il savait la vérité** (ongoing state = “he knew”). Moreover, pairing a sudden achievement verb (**trouver, mourir, céder**) with the **imparfait** can express an **arrested attempt** (*Sans secours, il périssait* = would have perished) or the cinematic **imparfait d’ouverture / narratif** (*Deux ans plus tard, elle fondait sa propre revue*).\nBounded / inchoative shifts: **il a su (appris), il a connu (rencontré), il eut tôt fait de**.\nOngoing / habitual state: **il savait, il connaissait, il demeurait**.\nLiterary imparfait uses: **imparfait de rupture (narratif), imparfait de tentative, imparfait d’atténuation**.',
          'Deux temps passés ne divergent pas seulement par la date, mais par l’**aspect**. **Il a su la nouvelle** saisit le surgissement précis (« il a appris »), alors qu’**il savait la nouvelle** décrit un état déjà installé. De plus, l’**imparfait** appliqué à un verbe ponctuel produit soit l’**imparfait narratif de rupture** (*Le lendemain, l’équipe signait le traité*), soit un effet de **quasi-réalisation** (*Un pas de plus et il tombait*).\nAspect inchoatif / borné : **il a su (= a appris), il a connu (= a rencontré), elle eut vite compris**.\nÉtat ouvert (sécant) : **il savait, elle connaissait, le calme régnait**.\nImparfaits stylistiques : **imparfait narratif, imparfait d’imminence évitée, imparfait de politesse**.',
        ),
        {
          table: {
            head: [b('Sentence', 'Énoncé'), b('Aspectual reading', 'Valeur aspectuelle')],
            rows: [
              ['À cet instant, il a connu la peur.', b('inchoative moment: first experienced fear', 'entrée soudaine dans l’état')],
              ['Il connaissait déjà bien le dossier.', b('unbounded state already active', 'état installé en cours')],
              ['Un mètre plus loin, la voiture heurtait le mur.', b('imminence narrowly avoided', 'événement évité de justesse')],
              ['Le 14 juillet, elle publiait son manifeste.', b('imparfait narratif (zooming onto a turning point)', 'imparfait de rupture historique')],
            ],
          },
          ex: [
            ['Dès le premier entretien, elle a su qu’elle devait accepter ce poste.', 'From the very first interview, she realised she had to accept that position.'],
            ['Sans l’intervention du médiateur, les pourparlers échouaient dès le lundi.', 'Without the mediator’s intervention, talks would have collapsed on Monday itself.'],
            ['Six mois plus tard, le laboratoire déposait trois brevets internationaux.', 'Six months later, the laboratory filed three international patents.'],
          ],
        },
      ),
      mc(
        P.meaning,
        [
          b('Sans votre freinage rapide, le cycliste tombait devant le portail.', 'Le cycliste a failli tomber ; votre freinage a empêché la chute.'),
          b('Le cycliste est tombé malgré votre freinage.', 'Le cycliste a lourdement chuté devant le portail.'),
          b('Le cycliste tombait tous les matins à cet endroit.', 'Le cycliste avait l’habitude de tomber là chaque matin.'),
        ],
        { fr: 'Sans votre freinage rapide, le cycliste tombait devant le portail.', explain: b('Imparfait after sans + noun/hypothesis expresses an imminent event prevented just in time (conditional-like aspect).', 'L’imparfait hypothétique après sans marque un accident imminent évité de justesse.') },
      ),
      pairs(
        P.match,
        [
          ['Il a eu raison de refuser.', b('bounded verdict on a past decision', 'bilan accompli d’un choix ponctuel')],
          ['Il avait raison depuis le début.', b('continuous state spanning background time', 'état durable en arrière-plan')],
          ['Un instant plus tard, il signait la charte.', b('historic narrative imparfait spotlight', 'imparfait narratif de rupture')],
          ['Je venais simplement vous saluer.', b('attenuation imparfait softening politeness', 'imparfait d’atténuation polie')],
        ],
      ),
      gap(
        b('Select the aspectually accurate verb tense.', 'Choisissez la forme aspectuelle exacte.'),
        'Dès qu’elle a ouvert la lettre, elle ___ (savoir, inchoatif) la décision ; jusque-là, elle ne ___ (connaître, état) rien des délibérations.',
        ['a su', 'connaissait'],
        {
          choices: [['a su', 'savait'], ['connaissait', 'a connu']],
          explain: b('Opening the letter = exact entry point (a su = found out); prior ignorance = continuous background (connaissait).', 'La lecture déclenche le savoir (aspect ponctuel inchoatif : a su) ; l’ignorance antérieure est un état continu (connaissait).'),
        },
      ),
    ],
    [
      b('Passé composé with state verbs (savoir, connaître, avoir) shifts to the moment of entry (“found out / met / got”).', 'Avec les verbes d’état, le passé composé marque souvent l’entrée dans l’état (j’ai su = j’ai appris).'),
      b('Imparfait can convey historic rupture in journalism/biography as well as an imminent result narrowly avoided.', 'L’imparfait peut marquer une date clé (imparfait narratif) ou un événement évité de justesse.'),
    ],
    [
      ['aspect inchoatif', 'inceptive aspect (entry into a state)'],
      ['imparfait de rupture', 'historic/narrative imperfect'],
      ['sans cela, il échouait', 'otherwise it would have failed (imminent)'],
    ],
  ),

  lesson(
    'gr-aspect-and-voice-c2',
    2,
    ['aspectual-periphrases-c2', 'periphrases-aspectuelles-soutenues'],
    b('Aspectual Periphrases: venir à, aller croissant, ne faire que', 'Périphrases aspectuelles : venir à, aller croissant, ne faire que'),
    b('Control high-precision semi-auxiliaries capturing probability, gradual progression, imminence, and repetition.', 'Distinguer les nuances fines des périphrases verbales C2 (aller en s’aggravant, venir à manquer, faillir, ne faire que de).'),
    [
      b('Contrast venir de (+ recent past), venir à (+ chance occurrence), and en venir à (+ gradual culmination).', 'Distinguer venir de, venir à et en venir à sans aucune confusion.'),
      b('Distinguish ne faire que (+ continuous repetition) from ne faire que de (+ just happened) and aller + -ant.', 'Opposer ne faire que, ne faire que de et la progression avec aller + participe présent.'),
    ],
    13,
    [
      card(
        b('Fine lenses on how an event unfolds', 'Des nuances aspectuelles d’une grande finesse'),
        b(
          'Notice three tiny prepositions on **venir** that carry completely different aspects: **venir de** = recent past; **venir à** = happen by chance (very formal conditional/temporal); **en venir à** = end up reaching a point. Meanwhile, **ne faire que + inf.** = do nothing but / keep doing, whereas **ne faire que de + inf.** = have only just done! For slow steady growth, classical and C2 French pairs **aller (+ en) + -ant** (**Les écarts vont croissant** / **vont en s’élargissant**).\nVenir variations: **venir de finir, venir à manquer, en venir à douter**.\nContinuous vs. immediate: **ne faire qu’aggraver, ne faire que de sortir**.\nProgressive / imminent: **aller grandissant, ne pas laisser d’inquiéter, être sur le point de**.',
          'Trois prépositions après **venir** changent radicalement l’aspect : **venir de** (passé récent), **venir à** (se produire fortuitement : *si ce recours venait à manquer*) et **en venir à** (finir par arriver à : *on en vient à oublier*). De même, **ne faire que + infinitif** indique l’exclusivité ou la répétition (« ne cesse de »), tandis que **ne faire que de** marque l’immédiateté extrême (« vient tout juste de »). Enfin, **aller (+ en) + gérondif/participe** peint une gradation continue.\nSérie venir : **il vient d’arriver, si l’eau vient à manquer, il en vint à partir**.\nNe faire que : **cela ne fait qu’empirer, elle ne fait que de rentrer**.\nGradation et litote : **la tension va croissant, ce détail ne laisse pas d’étonner**.',
        ),
        {
          ex: [
            ['Si cette garantie venait à disparaître, tout l’équilibre serait menacé.', 'Should this guarantee happen to disappear, the entire balance would be threatened.'],
            ['Le phénomène va s’amplifiant depuis près d’une décennie.', 'The phenomenon has been growing steadily for nearly a decade.'],
            ['L’ampleur de ces écarts ne laisse pas de surprendre les observateurs.', 'The scale of these gaps never fails to surprise observers.'],
          ],
        },
      ),
      trap(
        b('Never confuse ne pas laisser de + inf. with “not letting someone…”', 'Le faux-ami ne pas laisser de + infinitif'),
        b(
          'In literary/essay French, **ne pas laisser de + infinitif** means **nevertheless / certainly / cannot fail to** (*Ce rapport ne laisse pas d’inquiéter* = “is certainly worrying”, NOT “does not stop worrying”).',
          'En style soutenu, **ne pas laisser de + infinitif** signifie **ne pas manquer de / être bel et bien** (*Cette réserve ne laisse pas de surprendre* = elle étonne incontestablement).',
        ),
      ),
      pairs(
        P.match,
        [
          ['si un témoin venait à parler', b('should a witness happen to speak', 'aspect fortuit éventuel')],
          ['ils en sont venus à rompre', b('they eventually reached the point of breaking off', 'aboutissement graduel')],
          ['elle ne fait que de commencer', b('she has only just begun this very moment', 'passé tout immédiat')],
          ['elle ne fait que recommencer', b('she does nothing but start over repeatedly', 'itération exclusive')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('Cette phrase ambiguë ne laisse pas d’intriguer le lecteur.', 'Cette phrase intrigue bel et bien (incontestablement) le lecteur.'),
          b('Cette phrase empêche complètement le lecteur de s’y intéresser.', 'Cette phrase n’intrigue personne.'),
          b('On interdit au lecteur de poser des questions.', 'Il est interdit de comprendre cette phrase.'),
        ],
        { fr: 'Cette phrase ambiguë ne laisse pas d’intriguer le lecteur.' },
      ),
      gap(
        b('Choose the exact semi-auxiliary preposition.', 'Choisissez la locution aspectuelle exacte.'),
        'Les tensions économiques ___ (aller, présent) grandissant ; si les crédits ___ (venir à) se tarir, les équipes ___ (en venir à) suspendre l’enquête.',
        ['vont', 'venaient à', ['en viendraient à', 'viendraient à']],
        {
          choices: [['vont', 'sont', 'font'], ['venaient à', 'venaient de', 'en venaient'], ['en viendraient à', 'viendraient de', 'iraient']],
        },
      ),
      dict('Si cette ressource venait à manquer, la crise irait grandissant.'),
    ],
    [
      b('Distinguish venir de (just happened), venir à (happen by chance), and en venir à (reach the point of).', 'Distinguez venir de (passé récent), venir à (éventualité) et en venir à (aboutissement).'),
      b('Ne faire que + inf. = exclusively / constantly; ne faire que de + inf. = just this instant.', 'Ne faire que exprime l’habitude exclusive ; ne faire que de l’immédiateté.'),
    ],
    [
      ['venir à (+ inf.)', 'to happen to (formal conditional)'],
      ['aller croissant / grandissant', 'to grow steadily'],
      ['ne pas laisser de (+ inf.)', 'nevertheless to, undeniably to'],
      ['ne faire que de (+ inf.)', 'to have only just'],
    ],
  ),

  lesson(
    'gr-aspect-and-voice-c2',
    3,
    ['voice-diathesis-and-stative-passive', 'diathese-passif-etat-et-voix-moyenne'],
    b('Diathesis: Action Passive vs. Stative Result vs. Middle Voice', 'Diathèse : passif d’action, passif d’état et voix moyenne'),
    b('Distinguish dynamic passives from resulting states (la porte est fermée vs. vient d’être fermée) and master French middle voice.', 'Séparer procès passif, état résultant et voix moyenne pronominale en sémantique verbale.'),
    [
      b('Resolve passive ambiguity on stative être + past participle using par vs. de or explicit aspectual verbs (se trouver, demeurer).', 'Lever l’ambiguïté entre passif d’action et passif d’état avec par/de ou des semi-auxiliaires.'),
      b('Control pronominal middle voice (Ce tissu se froisse vite, Le brouillard se dissipe) vs. reflexive passive.', 'Distinguer le pronominal moyen (procès interne) du pronominal passif.'),
    ],
    13,
    [
      card(
        b('One form, two readings — plus the agent preposition split', 'Une même forme pour deux diathèses, et le choix par / de'),
        b(
          '**La galerie est fermée** is famously ambiguous: is it an **ongoing daily habit** (*Chaque soir, la galerie est fermée à 19 h par le gardien* = action passive) or a **completed state** (*À 20 h, la galerie est déjà fermée* = stative result)? Formal French resolves this with **par** vs. **de**: physical/concrete action selects **par** (*détruit par le feu*), whereas enduring state, emotion, or accompanying frame prefers **de** (**entourée d’arbres**, **estimée de tous**, **suivie de débats**).\nStative result triggers: **déjà fermé, toujours bordé de, demeuré intact**.\nDynamic passive triggers: **vient d’être signé par, fut adopté par, est régulièrement contrôlé par**.\nMiddle voice (intrinsic property): **Ce papier se déchire facilement, Ce vin se boit frais**.',
          '**Le musée est fermé** est ambigu : s’agit-il de l’**action** quotidienne (*fermé chaque soir à 18 h par le gardien*) ou de l’**état résultant** (*actuellement clos*) ? Le choix de la préposition éclaire aussi la diathèse : **par** introduit l’agent actif (*bloqué par la neige*), alors que **de** accompagne l’état moral ou spatial (*aimé de tous, bordé de chênes, précédé d’un silence*).\nPassif d’état : **est clos, reste entouré de, demeure respecté de**.\nPassif d’action : **a été clos par, se voit confié à, vient d’être voté par**.\nVoix moyenne : **cet adjectif s’accorde, cette étoffe se froisse vite, la brume se lève**.',
        ),
        {
          ex: [
            ['La demeure était entourée d’un parc silencieux et respectée de tout le voisinage.', 'The residence was surrounded by a quiet park and respected by the whole neighbourhood.'],
            ['L’accord a été signé par l’ensemble des représentants syndicaux.', 'The agreement was signed by all the union representatives.'],
            ['Un texte aussi dense ne se lit pas d’une traite sans annotation.', 'Such a dense text is not meant to be read straight through without notes.'],
          ],
        },
      ),
      sort(
        P.sort,
        [b('Resulting state (être + state / de)', 'Passif d’état / résultat'), b('Dynamic passive action (agent par)', 'Passif d’action'), b('Middle / intrinsic pronominal voice', 'Voix moyenne ou pronominal passif')],
        [
          ['Le parc est bordé de platanes centenaires.', 0],
          ['Le protocole fut ratifié par le Sénat.', 1],
          ['Ce métal précieux s’oxyde très lentement.', 2],
          ['Elle est universellement estimée de ses pairs.', 0],
          ['Cette nuance s’emploie surtout à l’écrit.', 2],
          ['Les archives sont inventoriées par deux conservateurs.', 1],
        ],
      ),
      mc(
        P.best,
        [
          b('L’exposition fut suivie d’une conférence animée et commentée par la presse.', 'L’exposition fut suivie d’une conférence animée et commentée par la presse.'),
          b('L’exposition fut suivie par une conférence et commentée de la presse.', 'L’exposition fut suivie par une conférence et commentée de la presse.'),
          b('La conférence se voit suivie par tout de suite une presse.', 'La conférence se voit suivie par tout de suite une presse.'),
        ],
        { explain: b('Order/sequence uses suivi de; deliberate critical action by journalists uses commentée par la presse.', 'La succession chronologique prend suivi de ; l’action délibérée des journalistes appelle commentée par.') },
      ),
      gap(
        b('Select par or de to fit each passive nuance.', 'Choisissez par ou de selon le type de passif.'),
        'Le texte était accompagné ___ une longue préface, mais son adoption fut retardée ___ plusieurs amendements de dernière minute.',
        ['d’', 'par'],
        {
          choices: [['d’', 'par'], ['par', 'de']],
          explain: b('Accompagné de expresses stable attachment/frame; retardée par marks active obstruction by amendments.', 'Accompagné de note un complément inhérent ; retardée par désigne l’agent qui bloque.'),
        },
      ),
      hear(
        'Le projet s’est vu attribuer un budget supplémentaire après l’audit.',
        P.listen,
        [
          b('Se voir + infinitive cleanly avoids turning an indirect object into a clitic passive.', 'Se voir + infinitif pallie l’impossibilité de passiver un COI en français.'),
          b('The project actively examined the budget itself.', 'Le projet a lui-même inspecté les comptes.'),
          b('No extra funding was granted.', 'Aucun budget supplémentaire n’a été accordé.'),
        ],
      ),
    ],
    [
      b('Pair par with active concrete/dynamic agents and de with emotional, respectful, or spatial states (estimé de, entouré de).', 'Employez par pour l’agent actif et de pour les verbes de sentiment, d’estime ou d’environnement spatial.'),
      b('Use se voir + infinitive (il s’est vu confier) when English would passivize an indirect recipient.', 'La tournure se voir + infinitif permet de rendre un passif impossible sur un complément indirect (attribuer à).'),
    ],
    [
      ['la diathèse', 'grammatical voice / diathesis'],
      ['estimé de tous', 'respected by everyone (stative de)'],
      ['se voir confier (+ COD)', 'to be entrusted with (passive substitute)'],
    ],
  ),

  lesson(
    'gr-aspect-and-voice-c2',
    4,
    ['c2-aspect-voice-mastery-synthesis', 'synthese-aspect-voix-et-precision-c2'],
    b('Synthesising Aspect, Voice & Subjunctive Timing (C2)', 'Synthèse C2 : temps, aspect, voix et justesse stylistique'),
    b('Harmonise tense sequence, aspectual nuance, and voice choice in one polished C2 analytical passage.', 'Harmoniser aspect verbal, voix et justesse syntaxique dans un texte analytique C2 complet.'),
    [
      b('Resolve sequence-of-tenses and aspect together across indirect passive/impersonal verbs (*Il se vit reprocher d’avoir négligé…*).', 'Combiner voix pronominale indirecte, infinitif passé et concordance des temps dans une phrase dense.'),
      b('Draft a 75–100 word C2 analysis demonstrating aspectual and voice versatility without heaviness.', 'Rédiger un paragraphe C2 de 75 à 100 mots articulant aspect, périphrase et diathèse maîtrisée.'),
    ],
    13,
    [
      card(
        b('Putting aspect, voice, and timing together smoothly', 'Ordonner aspect, diathèse et chronologie sans lourdeur'),
        b(
          'At C2, French avoids stacking clumsy passives (*Un rapport qui avait été demandé a été remis après avoir été relu* ❌). Instead, blend **se voir + infinitive**, **past infinitives**, **aspectual periphrases**, and **active pronominals** so responsibility and sequence shine through effortlessly.\nIndirect recipient passive: **se voir reprocher, se faire refuser, s’entendre répondre**.\nAspectual precision: **venir à disparaître, être en voie de disparition, avoir tôt fait de**.\nClean synthesis chain: **Après s’être vu refuser…, le collectif n’a pas laissé de…**.',
          'Au niveau C2, on évite l’empilement pesant de *qui a été… avait été…*. On croise plutôt **se voir + infinitif**, l’**infinitif passé**, des **périphrases aspectuelles** et la **voix moyenne** afin que chronologie et responsabilité restent limpides.\nPassivation du COI : **se voir confier, s’entendre dire, se faire notifier**.\nPrécision aspectuelle : **aller s’atténuant, être en passe de, n’avoir garde de**.\nEnchaînement fluide : **Après s’être vu accorder un sursis, la direction n’a pas tardé à…**.',
        ),
        {
          ex: [
            ['Après s’être vu refuser deux recours, l’association en est venue à saisir la cour.', 'After having two appeals rejected, the association eventually brought the matter before the court.'],
            ['L’inquiétude ne fait que croître à mesure que les échéances approchent.', 'Concern does nothing but grow as deadlines draw near.'],
            ['De telles négligences finissent toujours par se payer sur la durée.', 'Such lapses always end up extracting a price over time.'],
          ],
        },
      ),
      mc(
        P.best,
        [
          b('L’entreprise s’est vu notifier la décision avant même d’avoir pu déposer son mémoire.', 'L’entreprise s’est vu notifier la décision avant même d’avoir pu déposer son mémoire.'),
          b('L’entreprise s’est vue notifiée la décision avant même d’avoir pu déposer son mémoire.', 'L’entreprise s’est vue notifiée la décision avant même d’avoir pu déposer son mémoire.'),
          b('L’entreprise a été notifiée la décision avant même de pouvoir déposer son mémoire.', 'L’entreprise a été notifiée la décision avant même de pouvoir déposer son mémoire.'),
        ],
        { explain: b('In s’est vu notifier la décision, l’entreprise is the indirect object of notifier (notifier quelque chose À l’entreprise), so vu stays invariable!', 'Dans s’est vu notifier la décision, le COD est la décision ; se reste COI (à l’entreprise), donc vu est strictement invariable !') },
      ),
      gap(
        b('Apply the tricky agreement and voice choices cleanly.', 'Accorder justement les voix pronominales et périphrases C2.'),
        'Elle s’est ___ (voir, accord ?) confier la coordination du projet, puis la crise ___ (aller, imparfait) s’aggravant jusqu’à ce que le conseil ___ (en venir à) trancher.',
        ['vu', 'allait', 'en vienne à'],
        {
          hint: b('Wait: confier quelque chose À quelqu’un → se = COI → vu stays invariable!', 'On confie la coordination À elle : se est COI, donc vu reste invariable !'),
        },
      ),
      dlg(
        b('Final C2 style clinic', 'Atelier final de stylistique C2'),
        b('A senior exam coach reviews two final revisions before a DALF C2 oral/written dossier.', 'Un formateur DALF C2 valide deux ultimes retouches sur un dossier d’examen.'),
        [['Formatrice', 'f'], ['Nolan', 'm']],
        [
          [0, 'Dans « Elle s’est vue confier ce mandat par le conseil », tu as accordé « vue » au féminin. Pourquoi faut-il corriger ?', 'In “Elle s’est vue confier ce mandat par le conseil”, you agreed “vue” in the feminine. Why must we fix that?'],
          [1, {
            options: [
              'Parce que « ce mandat » est le COD de confier : « se » représente « à elle » (COI), donc « vu » reste invariable.',
              'Parce que le verbe voir ne s’accorde jamais au féminin.',
              'Parce qu’il faut écrire « s’est vue confiée » à la place.',
            ],
            explain: b('You entrust X (COD) to someone (COI); since se = COI, the past participle vu never agrees.', 'On confie un mandat (COD) à quelqu’un (COI) : se étant COI, vu demeure invariable.'),
          }],
          [0, 'Parfait ! Et pour alléger « Cette tendance augmente progressivement » sans banalité ?', 'Perfect! And how to elevate “Cette tendance augmente progressivement” without cliché?'],
          [1, {
            options: [
              '« Cette tendance va s’accentuant » ou « ne laisse pas de s’affirmer au fil des mois ».',
              '« Cette tendance vient de commencer de toujours monter ».',
              '« Cette tendance a été augmentée par personne ».',
            ],
          }],
        ],
      ),
      write(
        b('Write a 75–100 word C2 analytical paragraph assessing how public trust erodes when promises are repeatedly delayed.', 'Rédigez un paragraphe analytique C2 (75–100 mots) montrant comment la confiance s’érode lorsque les engagements sont sans cesse différés.'),
        b('Weave together se voir + infinitive, an aspectual periphrasis (aller + -ant, ne faire que, ne pas laisser de), and middle or stative passive voice.', 'Combinez se voir + infinitif, une périphrase aspectuelle (aller + -ant, ne pas laisser de) et une voix moyenne ou un passif d’état.'),
        75,
        100,
        [
          b('Include se voir + infinitive with accurate invariable agreement on vu', 'Intégrer se voir + infinitif sans erreur d’accord sur vu'),
          b('Use at least one aspectual periphrasis (aller s’effritant, venir à, ne pas laisser de)', 'Employer au moins une périphrase aspectuelle soutenue'),
          b('Balance stative or middle voice cleanly (se déliter, demeurer entouré de)', 'Intégrer un passif d’état ou une voix moyenne avec naturel'),
        ],
        'Lorsqu’un programme annoncé de longue date s’est vu reporter à trois reprises, la confiance collective va nécessairement s’effritant. Au départ entourée d’une adhésion sincère, l’initiative ne laisse pourtant pas d’éveiller un scepticisme croissant dès que les actes tardent à suivre. Si la transparence budgétaire venait elle aussi à manquer, les citoyens en viendraient vite à douter de la méthode même. Ce qui se construit lentement par la constance se délite en quelques mois sous l’effet des hésitations répétées.',
        { phrases: ['s’est vu reporter', 'va… s’effritant', 'ne laisse pas de', 'venait… à manquer', 'se délite'] },
      ),
    ],
    [
      b('In se voir + infinitive (Elle s’est vu attribuer…), se is indirect (“to her”), so vu always stays invariable.', 'Dans se voir + infinitif (attribuer à, confier à, refuser à), se est COI : vu reste toujours invariable.'),
      b('Combine aspectual periphrases, middle voice, and impersonal constructions to avoid heavy passive chains.', 'Allier périphrases aspectuelles, voix moyenne et se voir + infinitif évite les cascades de passifs lourds.'),
    ],
    [
      ['elle s’est vu confier', 'she was entrusted with (vu invariable)'],
      ['se déliter', 'to crumble / erode gradually (middle voice)'],
      ['à trois reprises', 'on three occasions'],
    ],
  ),
];

export default lessons;
