import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, conj, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Express wishes, abilities, obligations, likes, and near-future plans by pairing two verbs cleanly. Conjugate only the first verb (vouloir, pouvoir, devoir, savoir, aimer, aller), keep the second in the infinitive, and place ne … pas around the first verb.',
    'Exprimez vos envies, capacités, obligations, goûts et projets proches avec deux verbes à la suite. Conjuguez seulement le premier verbe (vouloir, pouvoir, devoir, savoir, aimer, aller), gardez le second à l’infinitif, et placez ne … pas autour du premier verbe.',
  ),
  outcomes: [
    b('Combine vouloir, pouvoir, devoir, and savoir directly with an infinitive', 'Enchaîner vouloir, pouvoir, devoir et savoir avec un infinitif'),
    b('Talk about likes and routines with aimer, préférer, and détester + infinitive', 'Parler de ses goûts avec aimer, préférer et détester + infinitif'),
    b('Form the near future (aller + infinitive) and negate two-verb phrases accurately', 'Former le futur proche (aller + infinitif) et maîtriser la négation'),
  ],
};

const C = 'gr-infinitive-constructions';
const PRESENT = b('présent', 'présent');

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['modal-verbs-plus-infinitive', 'vouloir-pouvoir-devoir-savoir-plus-infinitif'],
    b('Vouloir, pouvoir, devoir, savoir + infinitive', 'Vouloir, pouvoir, devoir, savoir + infinitif'),
    b('Conjugate only the first verb and attach any infinitive directly—no à or de needed.', 'Conjuguez seulement le premier verbe et placez l’infinitif juste après, sans à ni de.'),
    [
      b('Keep the second verb in the infinitive (-er, -ir, -re, -oir)', 'Laisser le second verbe à l’infinitif (-er, -ir, -re, -oir)'),
      b('Conjugate vouloir, pouvoir, devoir, and savoir accurately', 'Conjuguer vouloir, pouvoir, devoir et savoir'),
      b('Distinguish pouvoir (possibility/permission) from savoir (learned skill)', 'Distinguer pouvoir (possibilité) de savoir (savoir-faire appris)'),
    ],
    13,
    [
      card(
        b('Verb 1 conjugated + Verb 2 infinitive', 'Verbe 1 conjugué + Verbe 2 à l’infinitif'),
        b(
          'When two verbs share the same subject, conjugate **only the first verb** and leave the second in its **infinitive** dictionary form—with **no preposition** between them (*Je veux partir*, NOT *Je veux de partir*). Use **vouloir** (want), **pouvoir** (can/may), **devoir** (must/have to), and **savoir** (know how to).\nModal verbs: **vouloir, pouvoir, devoir, savoir**.',
          'Quand deux verbes ont le même sujet, conjuguez **uniquement le premier verbe** et laissez le second à **l’infinitif**, sans préposition entre les deux (*Je veux partir*, pas *Je veux de partir*). Employez **vouloir** (envie), **pouvoir** (possibilité), **devoir** (obligation) et **savoir** (compétence).\nVerbes modaux : **vouloir, pouvoir, devoir, savoir**.',
        ),
        {
          table: {
            head: ['', 'vouloir', 'pouvoir', 'devoir', 'savoir'],
            rows: [
              ['je', 'veux', 'peux', 'dois', 'sais'],
              ['tu', 'veux', 'peux', 'dois', 'sais'],
              ['il / elle / on', 'veut', 'peut', 'doit', 'sait'],
              ['nous', 'voulons', 'pouvons', 'devons', 'savons'],
              ['vous', 'voulez', 'pouvez', 'devez', 'savez'],
              ['ils / elles', 'veulent', 'peuvent', 'doivent', 'savent'],
            ],
          },
          ex: [
            ['Je veux réserver une table pour deux personnes.', 'I want to book a table for two people.'],
            ['Vous pouvez ouvrir la fenêtre, s’il vous plaît ?', 'Can you open the window, please?'],
            ['Nous devons finir ce rapport avant midi.', 'We must finish this report before noon.'],
          ],
        },
      ),
      tip(
        b('Pouvoir vs. savoir + infinitive', 'Pouvoir ou savoir + infinitif ?'),
        b(
          'Both translate as “can” in English, so check the idea: use **savoir + infinitive** for a **learned skill** (*Elle sait nager*, *Il sait lire la musique*). Use **pouvoir + infinitive** for **physical possibility or permission** (*Elle peut nager aujourd’hui parce que la piscine est ouverte*).\nSkills with savoir: **nager, conduire, cuisiner, skier**.',
          'Choisissez selon le sens : employez **savoir + infinitif** pour une **compétence apprise** (*Elle sait nager*, *Il sait lire la musique*). Employez **pouvoir + infinitif** pour une **possibilité matérielle ou une permission** (*Elle peut nager aujourd’hui car la piscine est ouverte*).\nSavoir-faire : **nager, conduire, cuisiner, skier**.',
        ),
      ),
      conj('pouvoir', PRESENT, [['je', 'peux'], ['tu', 'peux'], ['il / elle', 'peut'], ['nous', 'pouvons'], ['vous', 'pouvez'], ['ils / elles', 'peuvent']], { given: [0, 3] }),
      mc(
        P.form,
        ['prendre', 'prends', 'prend', 'prenons'],
        {
          fr: 'Désolé, nous devons ___ le prochain train.',
          explain: b('After conjugated devons, the second verb stays in the infinitive: prendre.', 'Après le verbe conjugué devons, le second verbe reste à l’infinitif : prendre.'),
        },
      ),
      mc(
        b('Which verb expresses a learned skill ("My grandmother knows how to knit")?', 'Quel verbe exprime une compétence apprise ?'),
        [
          'Ma grand-mère sait tricoter.',
          'Ma grand-mère peut tricotant.',
          'Ma grand-mère doit tricote.',
          'Ma grand-mère veut de tricoter.',
        ],
      ),
      gap(
        P.complete,
        'Tu ___ (vouloir) ___ (venir) au parc avec moi ? — Oui, mais je ___ (devoir) d’abord ___ (envoyer) un message.',
        [['veux'], ['venir'], ['dois'], ['envoyer']],
        {
          choices: [
            ['veux', 'voulons', 'veut'],
            ['venir', 'viens', 'vient'],
            ['dois', 'devez', 'doivent'],
            ['envoyer', 'envoie', 'envoies'],
          ],
        },
      ),
      ord(
        P.order,
        'Mes amis veulent visiter ce musée samedi.',
        {
          tr: 'My friends want to visit this museum on Saturday.',
          extra: ['visitent'],
        },
      ),
      dict('Tu sais conduire, donc nous pouvons louer une voiture.'),
      say('Je dois partir tôt demain matin pour prendre l’avion.', 'I have to leave early tomorrow morning to catch the plane.'),
    ],
    [
      b('Conjugate only the first verb; keep the second verb in the infinitive with no à or de.', 'Conjuguez seulement le premier verbe ; gardez le second à l’infinitif sans à ni de.'),
      b('savoir + infinitive expresses a learned skill; pouvoir + infinitive expresses possibility or permission.', 'savoir + infinitif exprime une compétence apprise ; pouvoir + infinitif une possibilité ou permission.'),
      b('Watch the stem change on nous/vous vs. ils/elles (pouvons → peuvent, devons → doivent).', 'Attention au changement de radical (pouvons → peuvent, devons → doivent).'),
    ],
    [
      ['réserver', b('to book / reserve', 'garder une place à l’avance')],
      ['le rapport', b('report', 'document de travail écrit')],
      ['conduire', b('to drive', 'piloter une voiture')],
      ['tricoter', b('to knit', 'fabriquer avec de la laine')],
    ],
  ),

  lesson(
    C,
    2,
    ['taste-verbs-plus-infinitive', 'aimer-preferer-detester-plus-infinitif'],
    b('Likes, tastes & necessity + infinitive', 'Aimer, préférer, détester et il faut + infinitif'),
    b('Talk effortlessly about what you love, prefer, hate, or need to do using a direct infinitive.', 'Exprimez facilement ce que vous aimez, préférez, détestez ou devez faire avec un infinitif direct.'),
    [
      b('Follow aimer, adorer, préférer, and détester directly with an infinitive', 'Faire suivre aimer, adorer, préférer et détester d’un infinitif direct'),
      b('Use j’aimerais and je voudrais + infinitive for polite wishes', 'Employer j’aimerais et je voudrais + infinitif pour être poli'),
      b('Express general necessity with il faut + infinitive', 'Exprimer une nécessité générale avec il faut + infinitif'),
    ],
    13,
    [
      card(
        b('Expressing likes, preferences & necessity', 'Goûts, préférences et nécessité'),
        b(
          'Just like modals, verbs of taste (**aimer, adorer, préférer, détester**) link directly to an infinitive with zero preposition (*J’aime cuisiner*, *Elle déteste attendre*). For polite requests, use **je voudrais** or **j’aimerais + infinitive** (*Je voudrais commander*). And for general necessity (“you have to / one must”), use **il faut + infinitive**.\nTaste verbs: **aimer, adorer, préférer, détester**.\nPolite or general: **je voudrais, j’aimerais, il faut**.',
          'Comme les modaux, les verbes de goût (**aimer, adorer, préférer, détester**) se lient directement à l’infinitif sans préposition (*J’aime cuisiner*, *Elle déteste attendre*). Pour demander poliment, employez **je voudrais** ou **j’aimerais + infinitif** (*Je voudrais commander*). Pour une nécessité générale, dites **il faut + infinitif**.\nVerbes de goût : **aimer, adorer, préférer, détester**.\nPolitesse et nécessité : **je voudrais, j’aimerais, il faut**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Example', 'Exemple')],
            rows: [
              ['aimer / adorer + inf.', b('to like / love doing', 'aimer faire'), 'J’adore marcher en forêt.'],
              ['préférer + inf.', b('to prefer doing', 'préférer faire'), 'Nous préférons voyager en train.'],
              ['détester + inf.', b('to hate doing', 'détester faire'), 'Il déteste faire la vaisselle.'],
              ['je voudrais / j’aimerais + inf.', b('I would like to', 'souhait poli'), 'Je voudrais réserver une chambre.'],
              ['il faut + inf.', b('one must / need to', 'nécessité générale'), 'Il faut composter son billet.'],
            ],
          },
          ex: [
            ['Le dimanche, nous aimons prendre le petit-déjeuner sur le balcon.', 'On Sundays, we like having breakfast on the balcony.'],
            ['Tu préfères sortir maintenant ou rester à la maison ?', 'Do you prefer going out now or staying home?'],
            ['Il faut acheter du pain avant la fermeture.', 'We need to buy bread before closing time.'],
          ],
        },
      ),
      trap(
        b('Zero preposition after taste verbs', 'Aucune préposition après les verbes de goût'),
        b(
          'English uses either *to* or *-ing* (*I like to read / reading*). French uses ONLY the direct infinitive—never insert **à** or **de** (*J’aime lire*, NEVER *J’aime de lire* or *J’aime à lire*).\nDirect pairs: **aimer lire, préférer marcher, détester attendre**.',
          'En français, on met uniquement l’infinitif direct : n’ajoutez jamais **à** ni **de** après ces verbes (*J’aime lire*, JAMAIS *J’aime de lire* ni *J’aime à lire*).\nAssociations directes : **aimer lire, préférer marcher, détester attendre**.',
        ),
      ),
      mc(
        P.choose,
        [
          'Mes enfants adorent dessiner et écouter des histoires.',
          'Mes enfants adorent de dessiner et d’écouter des histoires.',
          'Mes enfants adorent dessinent et écoutent des histoires.',
          'Mes enfants adorent à dessiner et à écouter des histoires.',
        ],
        {
          explain: b('After adorer, use direct infinitives (dessiner, écouter) with no preposition.', 'Après adorer, utilisez directement l’infinitif (dessiner, écouter) sans préposition.'),
        },
      ),
      hear(
        'Julie aime faire du vélo le matin, mais elle déteste courir sous la pluie.',
        b('What does Julie dislike doing?', 'Qu’est-ce que Julie n’aime pas faire ?'),
        [
          b('Running in the rain', 'Courir sous la pluie'),
          b('Riding her bike in the morning', 'Faire du vélo le matin'),
          b('Walking when it is sunny', 'Marcher quand il fait beau'),
        ],
      ),
      gap(
        P.complete,
        'Excusez-moi, je ___ (voudrais) ___ (changer) de place. Dans ce train, il ___ (falloir) ___ (valider) son ticket avant de monter.',
        [['voudrais'], ['changer'], ['faut'], ['valider']],
        {
          choices: [
            ['voudrais', 'veux', 'aime'],
            ['changer', 'change', 'de changer'],
            ['faut', 'doit', 'peut'],
            ['valider', 'valide', 'à valider'],
          ],
        },
      ),
      pairs(
        b('Match each verb of taste or necessity with a natural infinitive ending.', 'Associez chaque verbe à une suite à l’infinitif logique.'),
        [
          ['J’adore', 'écouter du jazz le soir.'],
          ['Il déteste', 'attendre sous la pluie.'],
          ['Nous préférons', 'dîner tôt en semaine.'],
          ['Il faut', 'apporter son passeport à l’aéroport.'],
        ],
        true,
      ),
      ord(
        P.order,
        'J’aimerais découvrir cette nouvelle exposition cette semaine.',
        {
          tr: 'I would like to discover this new exhibition this week.',
          extra: ['de'],
        },
      ),
      dict('Nous préférons cuisiner ensemble plutôt que manger au restaurant.'),
      say('Il faut réserver les billets en ligne dès aujourd’hui.', 'We need to book the tickets online starting today.'),
    ],
    [
      b('Use a bare infinitive directly after aimer, adorer, préférer, détester, and il faut.', 'Employez directement l’infinitif après aimer, adorer, préférer, détester et il faut.'),
      b('Never put à or de between taste verbs and an infinitive.', 'N’ajoutez jamais à ou de entre un verbe de goût et un infinitif.'),
      b('Use je voudrais or j’aimerais + infinitive for polite wishes and requests.', 'Utilisez je voudrais ou j’aimerais + infinitif pour formuler un souhait poli.'),
    ],
    [
      ['faire la vaisselle', b('to wash the dishes', 'laver les assiettes et les verres')],
      ['valider un ticket', b('to validate a ticket', 'passer son titre de transport dans la borne')],
      ['la fermeture', b('closing time', 'moment où un lieu ferme')],
      ['l’exposition (f.)', b('exhibition', 'présentation d’œuvres au musée')],
    ],
  ),

  lesson(
    C,
    3,
    ['near-future-and-negation', 'futur-proche-et-negation'],
    b('Near future (aller + infinitive) & negation', 'Futur proche (aller + infinitif) et négation'),
    b('Talk about upcoming plans with aller + infinitive, and place ne … pas cleanly around the first verb.', 'Parlez de vos projets proches avec aller + infinitif et placez ne … pas autour du premier verbe.'),
    [
      b('Form the futur proche with present aller + infinitive', 'Former le futur proche avec aller au présent + infinitif'),
      b('Wrap ne … pas around only the first (conjugated) verb', 'Encadrer uniquement le premier verbe conjugué avec ne … pas'),
      b('Keep reflexive pronouns (me, te, se) right before the infinitive', 'Garder les pronoms réfléchis (me, te, se) juste avant l’infinitif'),
    ],
    13,
    [
      card(
        b('Near future & two-verb negation', 'Futur proche et négation à deux verbes'),
        b(
          'To express an upcoming plan (“going to …”), conjugate **aller** in the present (**je vais, tu vas, il/elle/on va, nous allons, vous allez, ils/elles vont**) and add the **infinitive**. When making ANY two-verb structure negative, **ne … pas** hugs **only the first conjugated verb**—never the infinitive.\nForms of aller: **je vais, tu vas, il va, nous allons, vous allez, ils vont**.\nNegative frame: **ne vais pas, ne veux pas, n’aime pas**.',
          'Pour exprimer un projet proche (« going to … »), conjuguez **aller** au présent (**je vais, tu vas, il/elle/on va, nous allons, vous allez, ils/elles vont**) et ajoutez **l’infinitif**. Pour mettre à la négative TOUTE construction à deux verbes, **ne … pas** encadre **uniquement le premier verbe conjugué**.\nFormes d’aller : **je vais, tu vas, il va, nous allons, vous allez, ils vont**.\nNégation : **ne vais pas, ne veux pas, n’aime pas**.',
        ),
        {
          table: {
            head: [b('Affirmative', 'Affirmatif'), b('Negative', 'Négatif')],
            rows: [
              ['Je vais partir tôt.', 'Je ne vais pas partir tôt.'],
              ['Il veut sortir ce soir.', 'Il ne veut pas sortir ce soir.'],
              ['Nous pouvons payer par carte.', 'Nous ne pouvons pas payer par carte.'],
              ['Elle aime voyager seule.', 'Elle n’aime pas voyager seule.'],
            ],
          },
          ex: [
            ['Ce soir, nous allons préparer des crêpes.', 'Tonight, we are going to make crêpes.'],
            ['Je ne vais pas travailler samedi prochain.', 'I am not going to work next Saturday.'],
            ['Tu ne dois pas oublier ton parapluie.', 'You must not forget your umbrella.'],
          ],
        },
      ),
      trap(
        b('Watch reflexive pronouns before the infinitive', 'Attention au pronom réfléchi devant l’infinitif'),
        b(
          'With reflexive verbs like *se reposer* or *se lever*, the reflexive pronoun matches the **subject** and sits **right before the infinitive**: *Je vais **me** reposer*, *Nous allons **nous** promener*. In the negative, **ne … pas** still frames the first verb: *Je **ne** vais **pas** me lever tôt*.\nReflexive patterns: **je vais me reposer, tu vas te coucher, nous allons nous promener**.',
          'Avec un verbe pronominal comme *se reposer* ou *se lever*, le pronom réfléchi s’accorde avec le **sujet** et reste **juste devant l’infinitif** : *Je vais **me** reposer*, *Nous allons **nous** promener*. À la négative, **ne … pas** encadre toujours le premier verbe : *Je **ne** vais **pas** me lever tôt*.\nModèles réfléchis : **je vais me reposer, tu vas te coucher, nous allons nous promener**.',
        ),
      ),
      mc(
        P.choose,
        [
          'Ils ne vont pas déménager cet hiver.',
          'Ils vont ne pas déménager cet hiver.',
          'Ils ne vont déménager pas cet hiver.',
          'Ils vont déménager ne pas cet hiver.',
        ],
        {
          explain: b('ne … pas wraps only the conjugated verb vont.', 'ne … pas encadre uniquement le verbe conjugué vont.'),
        },
      ),
      mc(
        P.form,
        ['nous reposer', 'se reposer', 'nous reposons', 'me reposer'],
        {
          fr: 'Après cette longue marche, nous allons ___ sur le banc.',
          explain: b('The reflexive pronoun matches nous (nous reposer), and the verb stays infinitive.', 'Le pronom réfléchi s’accorde avec nous (nous reposer), et le verbe reste à l’infinitif.'),
        },
      ),
      gap(
        P.complete,
        'Demain, je ___ (aller) ___ (rendre) visite à mon oncle, mais je ___ veux ___ rentrer trop tard parce que je dois ___ (me lever) à six heures.',
        [['vais'], ['rendre'], ['ne'], ['pas'], ['me lever']],
        {
          choices: [
            ['vais', 'va', 'allons'],
            ['rendre', 'rends', 'à rendre'],
            ['ne', 'n’', 'pas'],
            ['pas', 'ne', 'plus'],
            ['me lever', 'se lever', 'me lève'],
          ],
        },
      ),
      sort(
        b('Sort each sentence by what the first verb expresses.', 'Classez chaque phrase selon le sens du premier verbe.'),
        [b('Near future (aller)', 'Futur proche (aller)'), b('Ability / obligation', 'Possibilité / obligation'), b('Taste / wish', 'Goût / souhait')],
        [
          ['Je vais acheter du pain.', 0],
          ['Tu dois signer ce papier.', 1],
          ['Elle adore peindre.', 2],
          ['Nous n’allons pas sortir.', 0],
          ['Vous pouvez entrer.', 1],
          ['J’aimerais visiter Nice.', 2],
        ],
      ),
      ord(
        P.order,
        'Je ne peux pas venir au dîner demain soir.',
        {
          tr: 'I cannot come to dinner tomorrow evening.',
          extra: ['viens'],
        },
      ),
      dlg(
        b('Making plans for tomorrow', 'Projets pour demain'),
        b('Lina and Théo coordinate their Sunday schedule.', 'Lina et Théo organisent leur dimanche.'),
        [['Lina', 'f'], ['Théo', 'm']],
        [
          [0, 'Qu’est-ce que tu vas faire demain matin ?', 'What are you going to do tomorrow morning?'],
          [1, {
            options: [
              'Je vais me reposer un peu, je ne vais pas mettre de réveil.',
              'Je vais se reposer un peu, je vais ne pas mettre de réveil.',
              'Je vais me repose un peu, je ne vais pas mets de réveil.',
            ],
          }],
          [0, 'Tu veux déjeuner ensemble vers treize heures ?', 'Do you want to have lunch together around 1 p.m.?'],
          [1, {
            options: [
              'Oui, volontiers ! Mais je dois rentrer avant dix-sept heures pour travailler.',
              'Oui, volontiers ! Mais je dois rentre avant dix-sept heures pour travaille.',
              'Oui, volontiers ! Mais je ne dois pas de rentrer avant dix-sept heures.',
            ],
          }],
        ],
      ),
      dict('Nous n’allons pas prendre la voiture : nous préférons marcher.'),
      write(
        b('Write about your plans and preferences.', 'Écrivez vos projets et préférences.'),
        b('Write 3–4 sentences using aller + infinitive (a plan for tomorrow), a taste verb (aimer/détester + infinitive), and a negative two-verb sentence (ne … pas around the first verb).', 'Écrivez 3 ou 4 phrases en utilisant aller + infinitif (un projet pour demain), un verbe de goût + infinitif et une phrase négative à deux verbes.'),
        24,
        44,
        [
          b('Include aller + infinitive for a near-future plan', 'Inclure aller + infinitif pour un projet proche'),
          b('Use aimer, préférer, or détester + infinitive', 'Utiliser aimer, préférer ou détester + infinitif'),
          b('Wrap ne … pas around the first verb in a negative sentence', 'Placer ne … pas autour du premier verbe conjugué'),
        ],
        'Demain, je vais visiter le musée avec ma sœur. J’aime marcher le matin, mais je déteste attendre le bus. Ce soir, je dois finir un livre, donc je ne peux pas sortir tard.',
      ),
    ],
    [
      b('Form the near future with present aller + infinitive (Je vais partir).', 'Formez le futur proche avec aller au présent + infinitif (Je vais partir).'),
      b('In all verb + infinitive chains, ne … pas wraps only the first conjugated verb.', 'Dans toute suite verbe + infinitif, ne … pas encadre uniquement le premier verbe.'),
      b('Reflexive pronouns (me, te, se, nous, vous) match the subject and sit right before the infinitive.', 'Les pronoms réfléchis s’accordent avec le sujet et se placent juste avant l’infinitif.'),
    ],
    [
      ['déménager', b('to move house', 'changer de logement')],
      ['se reposer', b('to rest', 'prendre du repos')],
      ['le réveil', b('alarm clock', 'appareil qui sonne le matin')],
      ['rendre visite à', b('to visit (a person)', 'aller voir quelqu’un')],
    ],
  ),
];

export default lessons;
