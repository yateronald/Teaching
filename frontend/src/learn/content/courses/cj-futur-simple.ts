import type { CourseAbout } from '../../types';
import { b, card, conj, dict, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je partirai, nous verrons, il faudra. The future tense is built on the infinitive, so most verbs are easy, and about fifteen frequent verbs have a stem to learn by heart. This course trains the regular forms, the irregular stems, the two rules that surprise English speakers (quand + future, si + present), and the future in predictions, promises and plans.',
    'Je partirai, nous verrons, il faudra. Le futur simple se construit sur l’infinitif : la plupart des verbes sont donc faciles, et une quinzaine de verbes fréquents ont un radical à apprendre par cœur. Ce cours entraîne les formes régulières, les radicaux irréguliers, les deux règles qui surprennent les anglophones (quand + futur, si + présent), et le futur dans les prévisions, les promesses et les projets.',
  ),
  outcomes: [
    b('Form the future of regular verbs', 'Former le futur des verbes réguliers'),
    b('Know the irregular stems by heart', 'Connaître les radicaux irréguliers par cœur'),
    b('Use quand + future and si + present', 'Employer quand + futur et si + présent'),
    b('Make predictions, promises and plans', 'Faire des prévisions, des promesses et des projets'),
  ],
};

const C = 'cj-futur-simple';
const FUT = b('futur simple', 'futur simple');
const WRITTEN = b('Choose the right form (written French).', 'Choisissez la bonne forme (français écrit).');

export default [
  lesson(C, 1, ['regular-future', 'futur-regulier'],
    b('The infinitive + six endings', 'L’infinitif + six terminaisons'),
    b('Parler → je parlerai, finir → je finirai, prendre → je prendrai.', 'Parler → je parlerai, finir → je finirai, prendre → je prendrai.'),
    [b('Build the future on the infinitive', 'Construire le futur sur l’infinitif'), b('Drop the e of -re verbs', 'Supprimer le e des verbes en -re'), b('Keep the spelling changes of -er verbs', 'Garder les particularités des verbes en -er')],
    13,
    [
      card(b('Built on the infinitive', 'Construit sur l’infinitif'), b('Take the **infinitive** and add endings that look like avoir. Endings: **-ai, -as, -a, -ons, -ez, -ont**. For -re verbs, drop the final e: **prendre → je prendrai**, **vendre → je vendrai**.', 'Prenez l’**infinitif** et ajoutez des terminaisons qui ressemblent à avoir. Terminaisons : **-ai, -as, -a, -ons, -ez, -ont**. Pour les verbes en -re, supprimez le e final : **prendre → je prendrai**, **vendre → je vendrai**.'), {
        table: {
          head: ['', 'parler', 'finir', 'prendre'],
          rows: [['je', 'parlerai', 'finirai', 'prendrai'], ['tu', 'parleras', 'finiras', 'prendras'], ['il / elle', 'parlera', 'finira', 'prendra'], ['nous', 'parlerons', 'finirons', 'prendrons'], ['vous', 'parlerez', 'finirez', 'prendrez'], ['ils / elles', 'parleront', 'finiront', 'prendront']],
        },
        ex: [['Nous partirons à huit heures.', 'We will leave at eight.'], ['Le magasin ouvrira à dix heures.', 'The shop will open at ten.'], ['Tu comprendras plus tard.', 'You will understand later.']],
      }),
      trap(b('The -er spelling changes stay', 'Les particularités des verbes en -er restent'), b('The changes you know from the present stay in the future, at every person: **acheter → j’achèterai, appeler → j’appellerai, jeter → je jetterai, payer → je paierai**. **Envoyer** is irregular (next lesson).', 'Les changements vus au présent restent au futur, à toutes les personnes : **acheter → j’achèterai, appeler → j’appellerai, jeter → je jetterai, payer → je paierai**. **Envoyer** est irrégulier (leçon suivante).')),
      conj('travailler', FUT, [['je', 'travaillerai'], ['tu', 'travailleras'], ['il / elle', 'travaillera'], ['nous', 'travaillerons'], ['vous', 'travaillerez'], ['ils / elles', 'travailleront']], { given: [0] }),
      conj('attendre', FUT, [['j’', 'attendrai'], ['tu', 'attendras'], ['il / elle', 'attendra'], ['nous', 'attendrons'], ['vous', 'attendrez'], ['ils / elles', 'attendront']], { given: [0] }),
      mc(P.form, ['prendrons', 'prenderons', 'prendons', 'prendrerons'], { fr: 'Nous ___ le train de six heures.' }),
      mc(P.spelling, ['achèterai', 'acheterai', 'achetrai', 'achèterais'], { fr: 'Demain, j’___ un cadeau pour Lina.' }),
      gap(P.complete, 'Le cours ___ (commencer) à neuf heures. Les invités ___ (arriver) vers vingt heures et nous ___ (dîner) dans le jardin.', [['commencera'], ['arriveront'], ['dînerons']]),
      sort(b('Which person?', 'Quelle personne ?'), [b('-rai: je', '-rai : je'), b('-ra: il, elle, on', '-ra : il, elle, on'), b('-ront: ils, elles', '-ront : ils, elles')], [['finirai', 0], ['partira', 1], ['vendront', 2], ['dormirai', 0], ['mangera', 1], ['liront', 2]]),
      hear('Nous parlerons de ce sujet demain.', b('Which tense do you hear?', 'Quel temps entendez-vous ?'), [b('Future: you hear « -rons »', 'Futur : on entend « -rons »'), b('Present', 'Présent'), b('Imparfait', 'Imparfait')]),
      dict('Demain matin, nous partirons tôt et nous arriverons à Québec avant midi.'),
      say('Je te répondrai ce soir, promis.', 'I’ll answer you tonight, I promise.'),
    ],
    [
      b('Future = infinitive + -ai, -as, -a, -ons, -ez, -ont.', 'Futur = infinitif + -ai, -as, -a, -ons, -ez, -ont.'),
      b('-re verbs drop the final e: prendre → prendrai.', 'Les verbes en -re perdent le e final : prendre → prendrai.'),
      b('-er changes stay: j’achèterai, j’appellerai, je paierai.', 'Les particularités restent : j’achèterai, j’appellerai, je paierai.'),
    ],
    [['ouvrir', b('to open', 'commencer à accueillir le public')], ['un invité', b('a guest', 'une personne invitée')], ['promis', b('promised, I promise', 'c’est une promesse')]],
  ),

  lesson(C, 2, ['irregular-stems', 'radicaux-irreguliers'],
    b('The irregular stems', 'Les radicaux irréguliers'),
    b('Je serai, j’aurai, j’irai, je ferai, je viendrai, je verrai, je pourrai…', 'Je serai, j’aurai, j’irai, je ferai, je viendrai, je verrai, je pourrai…'),
    [b('Learn the irregular stems', 'Apprendre les radicaux irréguliers'), b('Pronounce the double r', 'Prononcer le double r'), b('Use il faudra and il pleuvra', 'Employer il faudra et il pleuvra')],
    13,
    [
      card(b('New stem, same endings', 'Nouveau radical, mêmes terminaisons'), b('About fifteen verbs change their stem, but the endings never change. The most frequent: **être → ser-, avoir → aur-, aller → ir-, faire → fer-, venir → viendr-, voir → verr-**. Then: **pouvoir → pourr-, vouloir → voudr-, devoir → devr-, savoir → saur-, envoyer → enverr-, recevoir → recevr-**. Impersonal verbs: **il faut → il faudra, il pleut → il pleuvra**.', 'Une quinzaine de verbes changent de radical, mais les terminaisons ne changent jamais. Les plus fréquents : **être → ser-, avoir → aur-, aller → ir-, faire → fer-, venir → viendr-, voir → verr-**. Ensuite : **pouvoir → pourr-, vouloir → voudr-, devoir → devr-, savoir → saur-, envoyer → enverr-, recevoir → recevr-**. Verbes impersonnels : **il faut → il faudra, il pleut → il pleuvra**.'), {
        table: {
          head: ['', 'être', 'avoir', 'aller', 'faire'],
          rows: [['je / j’', 'serai', 'aurai', 'irai', 'ferai'], ['tu', 'seras', 'auras', 'iras', 'feras'], ['il / elle', 'sera', 'aura', 'ira', 'fera'], ['nous', 'serons', 'aurons', 'irons', 'ferons'], ['vous', 'serez', 'aurez', 'irez', 'ferez'], ['ils / elles', 'seront', 'auront', 'iront', 'feront']],
        },
      }),
      trap(b('Say both r', 'Prononcez les deux r'), b('Some stems have a double r: **je pourrai, je verrai, j’enverrai, je courrai, je mourrai**. Pronounce both: « pour-rai ». It is how you tell **je pourrai** (future) from **je pourrais** (conditional, B1) in careful speech.', 'Certains radicaux ont un double r : **je pourrai, je verrai, j’enverrai, je courrai, je mourrai**. Prononcez les deux : « pour-rai ». Dans un discours soigné, cela aide à distinguer **je pourrai** (futur) de **je pourrais** (conditionnel, B1).')),
      conj('venir', FUT, [['je', 'viendrai'], ['tu', 'viendras'], ['il / elle', 'viendra'], ['nous', 'viendrons'], ['vous', 'viendrez'], ['ils / elles', 'viendront']], { given: [0] }),
      conj('pouvoir', FUT, [['je', 'pourrai'], ['tu', 'pourras'], ['il / elle', 'pourra'], ['nous', 'pourrons'], ['vous', 'pourrez'], ['ils / elles', 'pourront']], { given: [0] }),
      mc(P.form, ['ferons', 'fairons', 'fairerons', 'ferrons'], { fr: 'Ce week-end, nous ___ une grande fête.' }),
      mc(P.form, ['faudra', 'faura', 'fallera', 'faudrera'], { fr: 'Il ___ partir avant la nuit.' }),
      mc(P.form, ['saurez', 'savrez', 'saverez', 'saurerez'], { fr: 'Vous ___ bientôt les résultats.' }),
      pairs(b('Match each infinitive with its future.', 'Associez chaque infinitif à son futur.'), [['être', 'je serai'], ['avoir', 'j’aurai'], ['aller', 'j’irai'], ['voir', 'je verrai'], ['vouloir', 'je voudrai'], ['devoir', 'je devrai']], true),
      gap(P.complete, 'Demain, il ___ (pleuvoir). Nous ___ (être) à la maison et les enfants ___ (vouloir) jouer aux cartes.', [['pleuvra'], ['serons'], ['voudront']]),
      dict('Nous verrons bien : il faudra être patients.'),
      say('J’irai te voir l’année prochaine, je te le promets.', 'I’ll come and see you next year, I promise.'),
    ],
    [
      b('être → ser-, avoir → aur-, aller → ir-, faire → fer-.', 'être → ser-, avoir → aur-, aller → ir-, faire → fer-.'),
      b('venir → viendr-, voir → verr-, pouvoir → pourr-, vouloir → voudr-, devoir → devr-, savoir → saur-.', 'venir → viendr-, voir → verr-, pouvoir → pourr-, vouloir → voudr-, devoir → devr-, savoir → saur-.'),
      b('il faudra, il pleuvra; double r in pourrai, verrai, enverrai.', 'il faudra, il pleuvra ; double r dans pourrai, verrai, enverrai.'),
    ],
    [['les résultats', b('the results', 'ce que l’on obtient à la fin')], ['patient', b('patient', 'qui sait attendre')], ['promettre', b('to promise', 's’engager à faire')]],
  ),

  lesson(C, 3, ['quand-and-si', 'quand-et-si'],
    b('Quand + future, si + present', 'Quand + futur, si + présent'),
    b('Quand tu arriveras, appelle-moi. Si tu viens, nous irons au parc.', 'Quand tu arriveras, appelle-moi. Si tu viens, nous irons au parc.'),
    [b('Use the future after quand, lorsque, dès que', 'Employer le futur après quand, lorsque, dès que'), b('Never use the future after si', 'Ne jamais employer le futur après si'), b('Build sentences with two clauses', 'Construire des phrases à deux propositions')],
    13,
    [
      card(b('Two rules that surprise English speakers', 'Deux règles qui surprennent les anglophones'), b('After **quand, lorsque, dès que, aussitôt que**, written French uses the **future** when the action is in the future: **Quand tu arriveras, appelle-moi.** (When you arrive, call me.) After **si** (if), never the future: **si + present**, then the future: **Si tu viens, nous irons au parc.**', 'Après **quand, lorsque, dès que, aussitôt que**, le français écrit emploie le **futur** quand l’action est future : **Quand tu arriveras, appelle-moi.** Après **si**, jamais de futur : **si + présent**, puis le futur : **Si tu viens, nous irons au parc.**'), {
        ex: [['Quand je serai à la retraite, je voyagerai.', 'When I retire, I will travel.'], ['Dès que j’aurai des nouvelles, je te préviendrai.', 'As soon as I have news, I’ll let you know.'], ['S’il fait beau demain, on ira à la plage.', 'If the weather is nice tomorrow, we’ll go to the beach.']],
      }),
      trap(b('Si j’aurai does not exist', 'Si j’aurai n’existe pas'), b('After si, the future is always a mistake: **Si j’ai le temps, je viendrai**, never « si j’aurai le temps ». In casual speech you will hear **Quand tu arrives, appelle-moi**, but in writing and exams, use **quand + futur**.', 'Après si, le futur est toujours une erreur : **Si j’ai le temps, je viendrai**, jamais « si j’aurai le temps ». À l’oral familier, on entend **Quand tu arrives, appelle-moi**, mais à l’écrit et aux examens, employez **quand + futur**.')),
      mc(WRITTEN, ['arriveras', 'arrives', 'arriverais', 'arrivé'], { fr: 'Quand tu ___ à la gare, envoie-moi un message.' }),
      mc(P.form, ['as', 'auras', 'aurais', 'avais'], { fr: 'Si tu ___ le temps, passe me voir.' }),
      mc(WRITTEN, ['recevrons', 'recevons', 'recevions', 'reçevrons'], { fr: 'Dès que nous ___ votre dossier, nous vous contacterons.' }),
      gap(P.complete, 'Quand nous ___ (avoir) une maison, nous ___ (acheter) un chien. Si tu ___ (venir) samedi, tu ___ (voir) les photos.', [['aurons'], ['achèterons'], ['viens'], ['verras']]),
      sort(b('Future or present?', 'Futur ou présent ?'), [b('quand / dès que + future', 'quand / dès que + futur'), b('si + present', 'si + présent')], [['quand tu seras prêt', 0], ['si tu es prêt', 1], ['dès qu’il fera beau', 0], ['s’il fait beau', 1], ['lorsque vous viendrez', 0], ['si vous venez', 1]]),
      ord(P.order, 'Je t’appellerai dès que je serai à l’hôtel.', { tr: 'I’ll call you as soon as I’m at the hotel.' }),
      hear('Si tu veux, on ira au cinéma ce soir.', b('What is the person doing?', 'Que fait la personne ?'), [b('Suggesting a plan for tonight, if you want', 'Proposer un projet pour ce soir, si vous voulez'), b('Talking about last night', 'Parler d’hier soir'), b('Refusing to go out', 'Refuser de sortir')]),
      dict('Dès que le soleil se lèvera, nous partirons en randonnée.'),
      say('Si j’ai le temps ce soir, je t’enverrai les documents.', 'If I have time tonight, I’ll send you the documents.'),
    ],
    [
      b('quand, lorsque, dès que + future when the action is future.', 'quand, lorsque, dès que + futur quand l’action est future.'),
      b('si + present → future: Si tu viens, nous irons…', 'si + présent → futur : Si tu viens, nous irons…'),
      b('Never si + future.', 'Jamais si + futur.'),
    ],
    [['à la retraite', b('retired', 'qui ne travaille plus à cause de l’âge')], ['dès que', b('as soon as', 'aussitôt que')], ['prévenir', b('to let (someone) know', 'informer')]],
  ),

  lesson(C, 4, ['predictions-promises-review', 'previsions-promesses-bilan'],
    b('Predictions, promises and plans', 'Prévisions, promesses et projets'),
    b('A weather forecast, a travel programme, and your life in ten years.', 'Une météo, un programme de voyage, et votre vie dans dix ans.'),
    [b('Read a forecast and a programme', 'Lire une météo et un programme'), b('Make promises', 'Faire des promesses'), b('Write about your future', 'Écrire sur son avenir')],
    13,
    [
      card(b('What the future tense is for', 'À quoi sert le futur simple'), b('It makes predictions (**Il fera beau demain.**), promises (**Je t’aiderai.**), polite instructions (**Vous prendrez un comprimé matin et soir.**) and formal plans (**La réunion aura lieu le 5 mai.**). For close, certain plans in conversation, the near future is more common: **je vais partir**.', 'Il sert aux prévisions (**Il fera beau demain.**), aux promesses (**Je t’aiderai.**), aux consignes polies (**Vous prendrez un comprimé matin et soir.**) et aux projets officiels (**La réunion aura lieu le 5 mai.**). Pour un projet proche et sûr, à l’oral, le futur proche est plus courant : **je vais partir**.'), {
        ex: [['Ne t’inquiète pas, je serai là.', 'Don’t worry, I’ll be there.'], ['La réunion aura lieu à quatorze heures.', 'The meeting will take place at two p.m.']],
      }),
      doc({ title: 'Météo de demain', text: 'Le matin, il fera frais et le ciel sera nuageux sur tout le pays. Il pleuvra sur la côte en fin de matinée. L’après-midi, le soleil reviendra et les températures atteindront vingt-deux degrés. Le vent soufflera fort en soirée.', look: 'article' }, b('What will the weather be like in the afternoon?', 'Quel temps fera-t-il l’après-midi ?'), [b('Sunny, up to 22 degrees', 'Ensoleillé, jusqu’à vingt-deux degrés'), b('Rainy on the coast', 'Pluvieux sur la côte'), b('Cloudy and cool', 'Nuageux et frais'), b('Very windy', 'Très venteux')]),
      gap(P.completeText, 'Le premier jour, vous ___ (visiter) le vieux port. Le deuxième jour, nous ___ (aller) à la montagne et vous ___ (pouvoir) vous baigner dans un lac. Le soir, un guide vous ___ (faire) découvrir la cuisine locale.', [['visiterez'], ['irons'], ['pourrez'], ['fera']]),
      mc(P.best, ['Vous prendrez ce médicament deux fois par jour.', 'Vous prendrez ce médicament deux fois par jour hier.', 'Vous prenderez ce médicament deux fois par jour.', 'Vous prendrez-vous ce médicament deux fois par jour.']),
      hear('Je t’aiderai à déménager, c’est promis.', b('What does the person do?', 'Que fait la personne ?'), [b('Makes a promise', 'Elle fait une promesse'), b('Asks for help', 'Elle demande de l’aide'), b('Tells a memory', 'Elle raconte un souvenir')]),
      write(b('Your life in ten years', 'Votre vie dans dix ans'), b('In 40 to 70 words, imagine your life in ten years: where you will live, what you will do, who you will be with. Use at least five verbs in the future, including two irregular ones.', 'En 40 à 70 mots, imaginez votre vie dans dix ans : où vous habiterez, ce que vous ferez, avec qui vous serez. Employez au moins cinq verbes au futur, dont deux irréguliers.'), 40, 70, [
        b('Five verbs in the future', 'Cinq verbes au futur'),
        b('Two irregular stems (serai, aurai, ferai, irai…)', 'Deux radicaux irréguliers (serai, aurai, ferai, irai…)'),
        b('One sentence with quand or si', 'Une phrase avec quand ou si'),
      ], 'Dans dix ans, j’aurai quarante ans. Je vivrai probablement au Québec avec ma famille et je travaillerai comme infirmière dans un hôpital. Mes enfants iront à l’école en français. Quand nous aurons du temps, nous ferons des randonnées. Je serai plus calme, j’espère, et je parlerai français sans hésiter.'),
      dict('Quand nous serons en vacances, nous ferons enfin le tour du lac à vélo.'),
      say('Ne t’inquiète pas, je serai là à l’heure.', 'Don’t worry, I’ll be there on time.'),
    ],
    [
      b('Predictions, promises, polite instructions and formal plans.', 'Prévisions, promesses, consignes polies et projets officiels.'),
      b('Near future for close, certain plans in conversation.', 'Futur proche pour les projets proches et sûrs à l’oral.'),
      b('quand + future: Quand nous aurons du temps…', 'quand + futur : Quand nous aurons du temps…'),
    ],
    [['nuageux', b('cloudy', 'couvert de nuages')], ['un comprimé', b('a tablet, a pill', 'un médicament à avaler')], ['avoir lieu', b('to take place', 'se dérouler')]],
  ),
];
