import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In French journalism, reports, and diplomacy, the conditional mood signals caution rather than wishful thinking. Distinguish unconfirmed ongoing events (envisagerait) from reported past events (aurait annoncé), attribute sources accurately (selon…, d’après…, il semblerait que), and soften requests diplomatically with je me permettrais and on gagnerait à.',
    'Dans la presse, les rapports et la diplomatie, le conditionnel exprime la prudence et l’information non confirmée. Distinguez un fait actuel ou futur supposé (envisagerait) d’un fait passé rapporté (aurait annoncé), citez vos sources avec précision (selon…, il semblerait que) et atténuez vos propositions avec je me permettrais ou on gagnerait à.',
  ),
  outcomes: [
    b('Use present and past conditional for unconfirmed news without stating rumors as facts', 'Employer le conditionnel présent et passé journalistique pour une information non confirmée'),
    b('Pair source phrases (selon, d’après, à en croire) and hedging verbs (il semblerait que + subj.)', 'Associer les formules de source (selon, d’après, à en croire) et d’atténuation (il semblerait que + subj.)'),
    b('Soften workplace and diplomatic proposals with je me permettrais and on gagnerait à', 'Formuler des recommandations diplomatiques avec je me permettrais et on gagnerait à'),
  ],
};

const C = 'gr-conditional-journalistic';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['unconfirmed-news-conditional', 'conditionnel-information-non-confirmee'],
    b('Unconfirmed news: présent and passé conditionnel', 'Information non confirmée : conditionnel présent et passé'),
    b('Report alleged plans and unverified past events with journalistic precision.', 'Rapporter des projets supposés et des faits passés non confirmés avec rigueur journalistique.'),
    [
      b('Contrast indicative (verified fact) with journalistic conditional (alleged fact)', 'Opposer l’indicatif (fait vérifié) au conditionnel journalistique (fait allégué)'),
      b('Choose present conditional (envisagerait) vs. past conditional (aurait annoncé)', 'Choisir entre conditionnel présent (envisagerait) et passé (aurait annoncé)'),
      b('Form past conditional with avoir, être and pronominals accurately', 'Former sans faute le conditionnel passé avec avoir, être et les pronominaux'),
    ],
    13,
    [
      card(
        b('Reporting without guaranteeing the fact', 'Rapporter sans affirmer comme certain'),
        b(
          'In French news and official briefings, the **conditionnel** marks information that comes from another source and has **not yet been verified**. Use the **conditionnel présent** for an alleged **present state or future plan** (*Le groupe préparerait une fusion*). Use the **conditionnel passé** (**aurait / serait + past participle**) for an alleged **past event** (*La ministre aurait remis sa lettre hier*). Pronominal verbs always take **être** (*ils se seraient rencontrés*).\n\nPresent / future rumor: **envisagerait, préparerait, compterait**.\nPast rumor (avoir): **aurait annoncé, aurait déclaré, aurait signé**.\nPast rumor (être / pronominal): **serait parti, se serait entretenue, auraient disparu**.',
          'Dans la presse et les notes officielles, le **conditionnel** signale une information issue d’un tiers et **non encore confirmée**. Le **conditionnel présent** porte sur un **fait actuel ou un projet futur supposé** (*Le groupe préparerait une fusion*). Le **conditionnel passé** (**aurait / serait + participe passé**) porte sur un **fait passé rapporté** (*La ministre aurait remis sa lettre hier*). Les pronominaux prennent toujours **être** (*ils se seraient rencontrés*).\n\nProjet ou état supposé : **envisagerait, préparerait, compterait**.\nFait passé rapporté (avoir) : **aurait annoncé, aurait déclaré, aurait signé**.\nFait passé (être / pronominal) : **serait parti, se serait entretenue, auraient disparu**.',
        ),
        {
          table: {
            head: [b('Timeframe', 'Moment du fait'), b('Verified (Indicative)', 'Fait vérifié (Indicatif)'), b('Unconfirmed (Conditional)', 'Non confirmé (Conditionnel)')],
            rows: [
              [b('Present / upcoming', 'Présent / à venir'), 'Le ministre envisage un accord.', 'Le ministre envisagerait un accord.'],
              [b('Past action (avoir)', 'Passé (avoir)'), 'Elle a annoncé son départ.', 'Elle aurait annoncé son départ.'],
              [b('Past movement (être)', 'Passé (être)'), 'Les témoins sont partis tôt.', 'Les témoins seraient partis tôt.'],
              [b('Past pronominal', 'Passé pronominal'), 'Ils se sont entretenus en secret.', 'Ils se seraient entretenus en secret.'],
            ],
          },
          ex: [
            ['La mairie envisagerait de piétonniser trois avenues dès septembre.', 'The city hall is reportedly considering pedestrianizing three avenues starting in September.'],
            ['Le conseil d’administration aurait voté le budget à l’unanimité hier soir.', 'The board allegedly voted on the budget unanimously last night.'],
            ['Les deux dirigeants se seraient entretenus pendant près d’une heure.', 'The two leaders reportedly spoke with each other for nearly an hour.'],
          ],
        },
      ),
      trap(
        b('Hear the difference: futur (-ra), imparfait (-ait), conditionnel (-rait)', 'Distinguer à l’oreille futur, imparfait et conditionnel'),
        b(
          'In news audio, **a décidé** states a verified fact, **aurait décidé** marks a reported claim, and **va décider** states a certainty—while **déciderait** marks an unconfirmed intention. Notice the **-r-** before **-ait** in the present conditional (*il envisagerait* vs imparfait *il envisageait*), and **aurait / serait** in the past conditional.\n\nIndicative (fact): **a signé · envisageait · signera**.\nJournalistic conditional: **aurait signé · envisagerait · se serait réuni**.',
          'Dans un flash info, **a décidé** affirme un fait établi, alors que **aurait décidé** marque une rumeur ou un rapport non confirmé. Notez bien le **-r-** devant **-ait** au conditionnel présent (*il envisagerait* contre l’imparfait *il envisageait*), et **aurait / serait** au conditionnel passé.\n\nIndicatif (fait établi) : **a signé · envisageait · signera**.\nConditionnel journalistique : **aurait signé · envisagerait · se serait réuni**.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('It is reported (not yet confirmed) that the CEO resigned yesterday.', 'Il est rapporté sans confirmation officielle que le directeur a démissionné hier.'),
          b('The CEO will definitely resign next month.', 'Le directeur va certainement démissionner le mois prochain.'),
          b('The CEO regrets that he did not resign.', 'Le directeur regrette de ne pas avoir démissionné.'),
        ],
        {
          fr: 'Le directeur général aurait démissionné hier soir.',
          explain: b('Aurait démissionné is the past journalistic conditional indicating an unverified report about yesterday.', 'Aurait démissionné est un conditionnel passé journalistique signalant une information passée non confirmée.'),
        },
      ),
      mc(
        P.form,
        ['se serait rendue', 's’est rendue', 'se rendrait', 'se serait rendu'],
        {
          fr: 'D’après un témoin, la délégation ___ sur place avant l’aube.',
          explain: b('Before dawn (past) + unconfirmed (d’après un témoin) + feminine singular subject la délégation → se serait rendue.', 'Fait passé non confirmé + pronominal avec sujet féminin singulier (la délégation) → se serait rendue.'),
        },
      ),
      gap(
        P.complete,
        'Selon nos informations, l’entreprise ___ (préparer) un plan de recrutement pour l’an prochain. Les négociations ___ (aboutir) tard dans la nuit.',
        [['préparerait'], ['auraient abouti']],
        { hint: b('Use present conditional for next year’s plan and past conditional (with avoir) for last night’s talks.', 'Conditionnel présent pour le projet de l’an prochain, conditionnel passé avec avoir pour la nuit dernière.') },
      ),
      hear(
        'Le suspect aurait quitté le territoire avant la perquisition.',
        b('How sure is the journalist about this past event?', 'Quel est le degré de certitude du journaliste sur ce fait passé ?'),
        [
          b('Unconfirmed report: the journalist attributes it with the past conditional.', 'Information non confirmée : le journaliste reste prudent grâce au conditionnel passé.'),
          b('Confirmed official fact stated in the passé composé.', 'Fait officiel confirmé au passé composé.'),
          b('Ongoing hypothesis about next week.', 'Hypothèse future pour la semaine prochaine.'),
        ],
      ),
      ord(
        P.order,
        'La commission étudierait actuellement trois scénarios distincts.',
        { tr: 'The committee is reportedly studying three distinct scenarios at present.' },
      ),
      sort(
        b('Verified fact or unconfirmed report?', 'Fait confirmé ou information au conditionnel ?'),
        [
          b('Verified fact (indicative)', 'Fait vérifié (indicatif)'),
          b('Unconfirmed report (conditional)', 'Information prudente (conditionnel)'),
        ],
        [
          ['Le décret est paru ce matin.', 0],
          ['Le décret paraîtrait vendredi.', 1],
          ['Plusieurs vols ont été annulés.', 0],
          ['Trois vols auraient été détournés.', 1],
          ['Les ministres se sont réunis à midi.', 0],
          ['Ils se seraient quittés sans accord.', 1],
        ],
      ),
      dict('La société envisagerait d’ouvrir deux nouveaux laboratoires et aurait déjà acquis le terrain.'),
      say('Selon le quotidien, l’accord aurait été paraphé peu après minuit.', 'According to the daily paper, the agreement was reportedly initialed shortly after midnight.'),
    ],
    [
      b('Journalistic conditional marks unconfirmed information: present conditional for current/future plans, past conditional for past events.', 'Le conditionnel journalistique signale une information non confirmée : présent pour un projet, passé pour un fait antérieur.'),
      b('Remember être and agreement with movement/pronominal verbs (la ministre serait partie, ils se seraient parlé).', 'Pensez à être et aux accords (la ministre serait partie, ils se seraient parlé).'),
      b('Never mix confirmed facts and unconfirmed claims without adjusting the mood.', 'Ne confondez jamais un fait vérifié (indicatif) et une information alléguée (conditionnel).'),
    ],
    [
      ['envisager', b('to consider, contemplate', 'étudier la possibilité de')],
      ['parapher un accord', b('to initial an agreement', 'apposer ses initiales sur un texte')],
      ['s’entretenir avec', b('to speak formally with', 'avoir un entretien avec')],
      ['selon nos informations', b('according to our sources', 'd’après les éléments recueillis')],
    ],
  ),

  lesson(
    C,
    2,
    ['attributing-sources-and-hedging', 'citer-des-sources-et-nuancer'],
    b('Attributing sources and hedging: selon…, il semblerait que', 'Citer des sources et nuancer : selon…, il semblerait que'),
    b('Pair source attributions with exact moods—and know why il semblerait que diverges from il paraît que.', 'Associer les formules de source aux bons modes, en distinguant il semblerait que et il paraît que.'),
    [
      b('Cite sources idiomatically with selon, d’après and à en croire', 'Citer une source avec selon, d’après et à en croire'),
      b('Contrast il semblerait que (+ subjunctive) with il paraît que and il me semble que (+ indicative)', 'Distinguer il semblerait que (+ subjonctif) de il paraît que et il me semble que (+ indicatif)'),
      b('Use tout porte à croire que and laisser entendre que to hedge claims', 'Employer tout porte à croire que et laisser entendre que pour nuancer'),
    ],
    13,
    [
      card(
        b('Citing sources and hedging carefully', 'Citer ses sources avec précision'),
        b(
          'Journalists and analysts anchor conditional claims with source markers: **selon certaines sources**, **d’après nos informations**, **à en croire un témoin** (“to believe / according to”). Notice **selon** and **d’après** are followed by a noun, NEVER *selon moi que* or *d’après que*! To hedge without naming a person, use **il semblerait que** (+ **subjunctive**), **il paraît que** (+ **indicative**), or **tout porte à croire que** (+ **indicative**).\n\nSource prepositions: **selon certaines sources, d’après un proche, à en croire la presse**.\nHedging (+ subjunctive): **il semble que · il semblerait que**.\nHedging (+ indicative): **il paraît que, il me semble que, tout porte à croire que**.',
          'Journalistes et analystes appuient le conditionnel sur des marqueurs de source : **selon certaines sources**, **d’après nos informations**, **à en croire un témoin**. Attention : **selon** et **d’après** introduisent un nom, JAMAIS *selon que* pour citer une personne ni *d’après que* ! Sans nommer de source, nuancez avec **il semblerait que** (+ **subjonctif**), **il paraît que** (+ **indicatif**) ou **tout porte à croire que** (+ **indicatif**).\n\nCiter une source : **selon certaines sources, d’après un proche, à en croire la presse**.\nAtténuation (+ subjonctif) : **il semble que · il semblerait que**.\nAtténuation (+ indicatif) : **il paraît que, il me semble que, tout porte à croire que**.',
        ),
        {
          table: {
            head: [b('Expression', 'Formule'), b('Mood after que', 'Mode après que'), b('Nuance', 'Nuance')],
            rows: [
              ['il semble que / il semblerait que', b('subjunctive', 'subjonctif'), b('uncertainty, outward appearance', 'incertitude, apparence prudente')],
              ['il me semble que', b('indicative', 'indicatif'), b('personal opinion (“I think”)', 'avis personnel probable')],
              ['il paraît que', b('indicative', 'indicatif'), b('rumor / hearsay (“word is”)', 'on-dit, rumeur')],
              ['tout porte à croire que', b('indicative', 'indicatif'), b('evidence points toward', 'les indices convergent vers')],
              ['laisser entendre que', b('indicative', 'indicatif'), b('to imply / hint that', 'suggérer indirectement que')],
            ],
          },
          ex: [
            ['À en croire plusieurs observateurs, l’accord tiendrait encore quelques mois.', 'According to several observers, the agreement might hold for a few more months.'],
            ['Il semblerait que le comité ait déjà sélectionné trois finalistes.', 'It would appear that the committee has already selected three finalists.'],
            ['Tout porte à croire que les travaux s’achèveront dans les délais prévus.', 'Everything suggests that the work will finish within the scheduled timeframe.'],
          ],
        },
      ),
      trap(
        b('Il semblerait que (subj.) vs. il me semble que (ind.)', 'Il semblerait que (subj.) contre il me semble que (ind.)'),
        b(
          'Adding **me** (or *nous, vous, lui*) reverses the mood! **Il semble que / Il semblerait que** (impersonal, uncertain) triggers the **subjunctive** (*Il semblerait qu’il **soit** prêt*). **Il me semble que** (personal impression, closer to *je trouve que*) normally takes the **indicative** (*Il me semble qu’il **est** prêt*). Also never use *d’après que* or *selon que* for attributing a source—stick to **selon + noun**.\n\nSubjunctive: **il semblerait qu’il ait raison, il semble qu’elle parte**.\nIndicative: **il me semble qu’il a raison · il paraît qu’elle part**.',
          'L’ajout de **me** (ou *nous, lui*) change le mode ! **Il semble que / Il semblerait que** (impersonnel, doute) appelle le **subjonctif** (*Il semblerait qu’il **soit** prêt*). **Il me semble que** (avis personnel) appelle normalement l’**indicatif** (*Il me semble qu’il **est** prêt*). Et pour citer quelqu’un, utilisez **selon + nom**, jamais *selon que*.\n\nSubjonctif : **il semblerait qu’il ait raison, il semble qu’elle parte**.\nIndicatif : **il me semble qu’il a raison · il paraît qu’elle part**.',
        ),
      ),
      mc(
        P.form,
        ['soient', 'sont', 'seront', 'étaient'],
        {
          fr: 'Il semblerait que les deux parties ___ parvenues à un compromis.',
          explain: b('Impersonal il semblerait que triggers the subjunctive (soient parvenues).', 'La tournure impersonnelle il semblerait que commande le subjonctif (soient parvenues).'),
        },
      ),
      mc(
        P.form,
        ['a déjà accepté', 'ait déjà accepté', 'accepte déjà', 'soit déjà accepté'],
        {
          fr: 'Il paraît que la chercheuse ___ l’invitation du colloque.',
          explain: b('Il paraît que (hearsay) governs the indicative (a déjà accepté).', 'Il paraît que est toujours suivi de l’indicatif (a déjà accepté).'),
        },
      ),
      gap(
        P.complete,
        '___ (À en croire / Selon que) des sources proches du dossier, la fusion ___ (être) imminente. Il me semble pourtant qu’un obstacle juridique ___ (subsister).',
        [['À en croire'], ['serait'], ['subsiste']],
        {
          choices: [
            ['À en croire', 'Selon que', 'D’après que'],
            ['serait', 'est', 'soit'],
            ['subsiste', 'subsisterait', 'subsistât'],
          ],
        },
      ),
      sort(
        b('Subjunctive or indicative after que?', 'Subjonctif ou indicatif après que ?'),
        [
          b('Subjunctive', 'Subjonctif'),
          b('Indicative', 'Indicatif'),
        ],
        [
          ['il semblerait que', 0],
          ['il paraît que', 1],
          ['il me semble que', 1],
          ['il semble que', 0],
          ['tout porte à croire que', 1],
          ['il se peut que', 0],
        ],
      ),
      ord(
        P.order,
        'Selon certaines sources, le projet aurait été suspendu hier.',
        { tr: 'According to certain sources, the project was reportedly suspended yesterday.' },
      ),
      dict('D’après nos informations, il semblerait que la réunion ait été avancée à demain.'),
      say('Tout porte à croire que cette réforme entrera en vigueur dès janvier.', 'Everything suggests that this reform will take effect as early as January.'),
    ],
    [
      b('Use selon + noun, d’après + noun, and à en croire + noun to cite sources—never d’après que.', 'Employez selon + nom, d’après + nom et à en croire + nom pour citer une source (jamais d’après que).'),
      b('il semble que and il semblerait que govern the subjunctive, whereas il me semble que and il paraît que take the indicative.', 'il semble que et il semblerait que prennent le subjonctif, tandis que il me semble que et il paraît que prennent l’indicatif.'),
      b('Combine source phrases with the journalistic conditional when the claim is unverified.', 'Associez marqueur de source et conditionnel lorsque l’information reste à confirmer.'),
    ],
    [
      ['à en croire', b('according to, if one is to believe', 'si l’on en croit')],
      ['il semblerait que', b('it would seem that (+ subjunctive)', 'il paraîtrait que (+ subjonctif)')],
      ['tout porte à croire que', b('everything suggests that', 'tous les indices montrent que')],
      ['laisser entendre', b('to imply, hint', 'suggérer à mots couverts')],
    ],
  ),

  lesson(
    C,
    3,
    ['diplomatic-softening', 'attenuation-diplomatique'],
    b('Diplomatic softening: Je me permettrais, On gagnerait à…', 'Atténuation diplomatique : Je me permettrais, On gagnerait à…'),
    b('Frame critiques, suggestions and policy recommendations with tactful C1/B2 conditional phrasing.', 'Formuler des remarques, suggestions et recommandations avec tact grâce au conditionnel d’atténuation.'),
    [
      b('Soften requests and critiques with je me permettrais de and je souhaiterais', 'Adoucir une demande ou une remarque avec je me permettrais de et je souhaiterais'),
      b('Propose improvements constructively with on gagnerait à and il conviendrait de', 'Suggérer une amélioration avec on gagnerait à et il conviendrait de'),
      b('Analyze a press brief and write a tactful formal memo', 'Analyser une dépêche puis rédiger une note diplomatique nuancée'),
    ],
    13,
    [
      card(
        b('Polite diplomacy in professional French', 'La diplomatie professionnelle au conditionnel'),
        b(
          'Direct imperatives or flat present statements (*Il faut changer ça*, *Je veux vous dire*) sound abrupt in formal negotiations or academic reviews. Soften proposals with the **conditionnel d’atténuation**: **Je me permettrais de** (“I might venture to”), **On gagnerait à + infinitive** (“One/we would benefit from”), **Il conviendrait de** (“It would be appropriate to”), **Il serait souhaitable que** (+ subjunctive), or a negative question (**Ne faudrait-il pas… ?**).\n\nTactful critique: **je me permettrais de, il me semble qu’on pourrait, ne faudrait-il pas**.\nConstructive advice: **on gagnerait à, il conviendrait de, il importerait de**.\nWishing politely (+ subjunctive): **il serait souhaitable que · il faudrait que**.',
          'Les impératifs directs ou le présent sec (*Il faut changer cela*) paraissent brusques en réunion ou dans un rapport. Adoucissez vos suggestions avec le **conditionnel d’atténuation** : **Je me permettrais de**, **On gagnerait à + infinitif** (« il y aurait avantage à »), **Il conviendrait de**, **Il serait souhaitable que** (+ subjonctif), ou l’interrogation négative (**Ne faudrait-il pas… ?**).\n\nRemarque avec tact : **je me permettrais de, il me semble qu’on pourrait, ne faudrait-il pas**.\nConseil constructif : **on gagnerait à, il conviendrait de, il importerait de**.\nSouhait poli (+ subjonctif) : **il serait souhaitable que · il faudrait que**.',
        ),
        {
          table: {
            head: [b('Blunt', 'Direct / sec'), b('Diplomatic conditional', 'Conditionnel diplomatique')],
            rows: [
              ['Je veux ajouter un point.', 'Je me permettrais d’ajouter une précision.'],
              ['Nous devons simplifier ce texte.', 'On gagnerait à simplifier ce texte.'],
              ['Il faut revoir le calendrier.', 'Il conviendrait de revoir le calendrier.'],
              ['J’espère que vous répondrez vite.', 'Il serait souhaitable que vous répondiez vite.'],
            ],
          },
          ex: [
            ['On gagnerait à clarifier le troisième paragraphe avant la diffusion.', 'We would benefit from clarifying the third paragraph before circulation.'],
            ['Je me permettrais de suggérer une formulation plus nuancée ici.', 'I might venture to suggest a more nuanced phrasing here.'],
            ['Il serait souhaitable que les deux services se concertent en amont.', 'It would be desirable for the two departments to consult each other beforehand.'],
          ],
        },
      ),
      doc(
        {
          look: 'article',
          title: b('Press dispatch — Economic desk', 'Dépêche — Rubrique économique'),
          text: 'Selon plusieurs sources concordantes, le groupe ferroviaire envisagerait de prolonger deux lignes régionales dès l’automne. Les représentants syndicaux auraient déjà reçu une première note technique lundi, même si aucun communiqué officiel n’a encore été publié. À ce stade, il semblerait que le financement régional soit quasiment bouclé, mais les élus locaux gagneraient à préciser rapidement le calendrier des travaux.',
        },
        b('Which detail in this dispatch is presented as an editorial recommendation rather than a reported rumor?', 'Quel élément de cette dépêche est présenté comme une recommandation plutôt qu’une rumeur rapportée ?'),
        [
          b('Local officials would benefit from clarifying the work schedule quickly.', 'Les élus locaux auraient intérêt à préciser vite le calendrier des travaux.'),
          b('The rail group is considering extending two regional lines.', 'Le groupe ferroviaire envisage de prolonger deux lignes régionales.'),
          b('Union representatives received a technical memo on Monday.', 'Les syndicats ont reçu une note technique lundi.'),
        ],
        {
          explain: b('Gagneraient à + infinitive voices the analyst’s diplomatic recommendation (“would benefit from”).', 'Gagneraient à + infinitif exprime une recommandation diplomatique de l’auteur.'),
        },
      ),
      mc(
        P.best,
        [
          'On gagnerait à associer les usagers dès la phase pilote.',
          'On gagnerait associer les usagers dès la phase pilote.',
          'On gagnera de associer les usagers dès la phase pilote.',
          'On gagnerait que les usagers soient associés.',
        ],
        {
          fr: 'Which diplomatic recommendation is grammatically correct?',
          explain: b('The idiom is gagner à + infinitive (“to benefit from doing something”).', 'La locution exacte est gagner à + infinitif (« avoir avantage à faire »).'),
        },
      ),
      gap(
        P.completeText,
        'Je me ___ (permettre) de formuler une réserve sur l’article quatre. Il ___ (convenir) de consulter d’abord le service juridique, et il serait souhaitable que l’ensemble du comité ___ (pouvoir) relire la version finale.',
        [['permettrais'], ['conviendrait'], ['puisse']],
        {
          choices: [
            ['permettrais', 'permets', 'permettais'],
            ['conviendrait', 'convient', 'conviendra'],
            ['puisse', 'peut', 'pourrait'],
          ],
        },
      ),
      dlg(
        b('Editorial meeting at a magazine', 'Comité de rédaction d’un mensuel'),
        b('Lucie and Samir adjust the tone of an investigative article before print.', 'Lucie et Samir ajustent le ton d’un article d’enquête avant l’impression.'),
        [['Lucie', 'f'], ['Samir', 'm']],
        [
          [0, 'Dans ce passage sur le contrat municipal, l’accusation paraît un peu trop directe sans preuve écrite.', 'In this passage on the city contract, the accusation sounds a bit too direct without written proof.'],
          [1, { options: ['Tu as raison : on gagnerait à passer au conditionnel passé et à citer nos sources.', 'Tu as raison : on gagnerait passer au conditionnel passé et citer nos sources.', 'Tu as raison : il semblerait que nous passons à l’indicatif présent.'] }],
          [0, 'Exactement : écrivons que l’élu « aurait demandé » un report.', 'Exactly: let’s write that the official “reportedly requested” a postponement.'],
          [1, { options: ['Et en conclusion, je me permettrais d’ajouter qu’il conviendrait de publier l’audit complet.', 'Et en conclusion, je me permettrais ajouter qu’il conviendra de publier l’audit.', 'Et en conclusion, je permets de dire qu’il faut publier l’audit.'] }],
        ],
      ),
      pairs(
        P.match,
        [
          ['Je me permettrais de…', b('I might venture to…', 'Je prends la liberté, avec tact, de…')],
          ['On gagnerait à…', b('We would benefit from…', 'On aurait tout intérêt à…')],
          ['Il conviendrait de…', b('It would be appropriate to…', 'Il serait opportun et juste de…')],
          ['Il serait souhaitable que…', b('It would be desirable that… (+ subj.)', 'Il serait préférable que… (+ subjonctif)')],
        ],
      ),
      ord(
        P.order,
        'Ne faudrait-il pas préciser les objectifs avant d’ouvrir le débat ?',
        { tr: 'Shouldn’t we clarify the objectives before opening the debate?' },
      ),
      say('Je me permettrais de souligner qu’une phase de test préalable limiterait les risques.', 'I might venture to point out that a preliminary test phase would limit the risks.'),
      write(
        b('Write a brief diplomatic memo or press summary', 'Rédiger une note diplomatique ou une brève nuancée'),
        b(
          'In 50 to 80 words, draft a short internal memo reviewing an unconfirmed partnership rumor and suggesting a careful next step. Include one journalistic conditional (present or past), one source phrase or il semblerait que, and one diplomatic softening expression (on gagnerait à, il conviendrait de, or je me permettrais de).',
          'En 50 à 80 mots, rédigez une courte note interne commentant une rumeur de partenariat non confirmée et proposant une démarche prudente. Intégrez un conditionnel journalistique, une formule de source ou il semblerait que, et une atténuation diplomatique (on gagnerait à, il conviendrait de, ou je me permettrais de).',
        ),
        50,
        80,
        [
          b('One journalistic conditional for the unconfirmed news', 'Un conditionnel journalistique pour l’information non confirmée'),
          b('One source attribution (selon / d’après) or il semblerait que', 'Une mention de source ou il semblerait que (+ subjonctif)'),
          b('One diplomatic recommendation (on gagnerait à / il conviendrait de)', 'Une recommandation diplomatique (on gagnerait à / il conviendrait de)'),
        ],
        'Selon certaines sources proches du dossier, notre concurrent préparerait une offre commune avec un acteur régional. Il semblerait que des discussions avancées aient déjà eu lieu la semaine dernière. Je me permettrais donc de suggérer une réaction mesurée. On gagnerait à vérifier ces informations discrètement avant de modifier notre stratégie commerciale.',
        {
          phrases: ['Selon certaines sources', 'préparerait', 'Il semblerait que', 'Je me permettrais de', 'On gagnerait à'],
        },
      ),
    ],
    [
      b('Use je me permettrais de, on gagnerait à, il conviendrait de and il serait souhaitable que (+ subj.) for tactful persuasion.', 'Employez je me permettrais de, on gagnerait à, il conviendrait de et il serait souhaitable que (+ subjonctif) pour convaincre avec tact.'),
      b('Gagner à takes à + infinitive directly (on gagnerait à attendre).', 'Gagner à est suivi directement de l’infinitif (on gagnerait à attendre).'),
      b('Negative conditional questions (Ne faudrait-il pas… ?) invite agreement smoothly without imposing.', 'L’interrogation négative au conditionnel (Ne faudrait-il pas… ?) invite à l’adhésion avec souplesse.'),
    ],
    [
      ['gagner à (+ inf.)', b('to benefit from, do well to', 'avoir intérêt à')],
      ['il conviendrait de', b('it would be fitting to', 'il serait opportun de')],
      ['se permettre de', b('to take the liberty of', 'oser avec politesse')],
      ['en amont', b('upstream, beforehand', 'en préparation préalable')],
    ],
  ),
];

export default lessons;
