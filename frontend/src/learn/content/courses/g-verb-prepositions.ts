import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Why do we say j’espère partir, je commence à comprendre, and je décide de partir? In French, the first verb dictates the preposition before the infinitive — either nothing, à, or de. Guessing creates unnatural mistakes, especially when a verb changes meaning with the preposition (penser à vs penser de, manquer à vs manquer de). This B1 course groups the highest-frequency verbs by structure so you choose the right link automatically.',
    'Pourquoi dit-on j’espère partir, je commence à comprendre et je décide de partir ? En français, le premier verbe commande la préposition devant l’infinitif : rien, à ou de. Deviner au hasard entraîne des erreurs fréquentes, d’autant que certains verbes changent de sens selon la préposition (penser à / penser de, manquer à / manquer de). Ce cours B1 classe les verbes essentiels pour automatiser le bon choix.',
  ),
  outcomes: [
    b('Identify verbs taking a direct infinitive vs à + infinitive', 'Distinguer les verbes à infinitif direct et ceux suivis de à'),
    b('Master high-frequency verbs followed by de + infinitive', 'Maîtriser les verbes courants suivis de de + infinitif'),
    b('Handle adjective + à vs il est + adjective + de', 'Gérer adjectif + à contre il est + adjectif + de'),
    b('Avoid meaning traps (penser à / de, manquer à / de, demander à… de)', 'Éviter les pièges de sens (penser à / de, manquer à / de, demander à… de)'),
  ],
};

const C = 'g-verb-prepositions';
export default [
  lesson(C, 1, ['direct-or-a-infinitive', 'infinitif-direct-ou-avec-a'],
    b('No preposition or à + infinitive?', 'Infinitif direct ou avec à ?'),
    b('Separate verbs taking a bare infinitive from verbs requiring à + infinitive.', 'Séparer les verbes à construction directe des verbes exigeant à + infinitif.'),
    [b('Use direct infinitive after verbs of wish, movement and hope', 'Employer l’infinitif direct après volonté, mouvement et espoir'), b('Use à + infinitive after commencer, réussir, apprendre, hésiter', 'Employer à + infinitif après commencer, réussir, apprendre, hésiter'), b('Replace à + infinitive with the pronoun y', 'Remplacer à + infinitif par le pronom y')],
    13,
    [
      card(b('Direct vs à + infinitive', 'Construction directe ou avec à'), b('**No preposition (Ø)**: **aimer, préférer, détester, vouloir, pouvoir, devoir, savoir, espérer, compter (= intend), aller, venir, sembler, oser**. **With à**: **commencer à, continuer à, apprendre à, réussir à, aider à, hésiter à, chercher à, s’habituer à, tenir à (= insist on), s’amuser à**.', '**Sans préposition (Ø)** : **aimer, préférer, détester, vouloir, pouvoir, devoir, savoir, espérer, compter, aller, venir, sembler, oser**. **Avec à** : **commencer à, continuer à, apprendre à, réussir à, aider à, hésiter à, chercher à, s’habituer à, tenir à, s’amuser à**.'), {
        ex: [['J’espère obtenir ce poste.', 'I hope to get this job.'], ['Il apprend à jouer du violon.', 'He’s learning to play the violin.'], ['Nous tenons à vous remercier.', 'We really want to thank you.']],
      }),
      tip(b('Pronoun replacement: « y » for à', 'Le test du pronom : « y » pour à'), b('If a verb takes **à**, the pronoun replacing the action is **y**: **Tu as réussi à réparer l’imprimante ? — Oui, j’y ai réussi !** Notice **espérer** takes **no preposition**: **J’espère réussir** (never « j’espère de réussir »).', 'Quand un verbe se construit avec **à**, on reprend l’action par **y** : **Tu as réussi à réparer l’imprimante ? — Oui, j’y ai réussi !** Attention à **espérer** : jamais « espérer de », toujours **espérer + infinitif**.')),
      sort(b('Direct infinitive (Ø) or + à?', 'Infinitif direct (Ø) ou + à ?'), [b('direct (Ø)', 'direct (Ø)'), b('+ à', '+ à')], [['espérer', 0], ['réussir', 1], ['compter', 0], ['hésiter', 1], ['préférer', 0], ['s’habituer', 1]]),
      mc(P.form, ['à', 'de', 'pour', 'rien (Ø)'], { fr: 'Ma nièce commence ___ lire toute seule.' }),
      mc(P.best, ['J’espère partir en vacances en juillet.', 'J’espère de partir en vacances en juillet.', 'J’espère à partir en vacances en juillet.', 'J’espère pour partir en vacances en juillet.']),
      gap(P.complete, 'Tu comptes ___ (changer) de travail ? – Je continue ___ (chercher) une offre intéressante.', ['changer', 'à chercher'], { choices: [['changer', 'à changer', 'de changer'], ['à chercher', 'de chercher', 'chercher']] }),
      ord(P.order, 'Elle a réussi à apprendre le français.', { tr: 'She managed to learn French.', extra: ['de'] }),
      say('J’apprends à cuisiner des plats simples et j’espère inviter mes amis bientôt.', 'I’m learning to cook simple dishes and I hope to invite my friends soon.'),
    ],
    [
      b('Direct infinitive (no preposition): espérer, compter, préférer, oser, sembler.', 'Infinitif direct : espérer, compter, préférer, oser, sembler.'),
      b('Verbs + à: commencer à, continuer à, apprendre à, réussir à, hésiter à, tenir à.', 'Verbes + à : commencer à, continuer à, apprendre à, réussir à, hésiter à, tenir à.'),
      b('Replace à + action with y: J’y tiens, j’y ai réussi.', 'On reprend à + action par y : J’y tiens, j’y ai réussi.'),
    ],
    [['tenir à', b('to care deeply about, insist on', 'accorder de l’importance à')], ['compter (+ inf.)', b('to intend to', 'avoir l’intention de')], ['s’habituer à', b('to get used to', 'prendre l’habitude de')]],
  ),
  lesson(C, 2, ['verbs-with-de-infinitive', 'verbes-suivis-de-de'],
    b('Verbs + de + infinitive', 'Les verbes suivis de de + infinitif'),
    b('Master the large family of verbs and expressions taking de before an infinitive.', 'Maîtriser les nombreux verbes et locutions suivis de de devant un infinitif.'),
    [b('Use décider de, oublier de, essayer de, refuser de', 'Employer décider de, oublier de, essayer de, refuser de'), b('Use avoir envie / peur / besoin de', 'Employer avoir envie / peur / besoin de'), b('Apply the il est + adj + de vs c’est + adj + à rule', 'Appliquer il est + adj + de contre c’est + adj + à')],
    13,
    [
      card(b('Verbs + de + infinitive', 'Les verbes suivis de de'), b('Many key verbs take **de**: **décider de, oublier de, essayer de, refuser de, accepter de, choisir de, finir de, arrêter de, éviter de, risquer de, promettre de, venir de** (*just did*). Also **avoir + noun + de**: **avoir envie de, peur de, besoin de, l’intention de, le temps de**.', 'Beaucoup de verbes courants prennent **de** : **décider de, oublier de, essayer de, refuser de, accepter de, choisir de, finir de, arrêter de, éviter de, risquer de, promettre de, venir de**. De même après **avoir + nom** : **avoir envie de, peur de, besoin de, l’intention de, le temps de**.'), {
        ex: [['J’ai oublié de fermer la fenêtre.', 'I forgot to close the window.'], ['Nous avons décidé de déménager.', 'We decided to move house.'], ['Elle vient de terminer son stage.', 'She has just finished her internship.']],
      }),
      trap(b('Il est facile de… vs C’est facile à…', 'Il est facile de… ou C’est facile à…'), b('With an **impersonal il**, use **de**: **Il est facile de comprendre cette règle.** With a **specific noun or c’est referring back to it**, use **à**: **Cette règle est facile à comprendre. C’est facile à faire.**', 'Avec **il** impersonnel, on emploie **de** : **Il est facile de comprendre cette règle.** Avec un **sujet précis** (ou **c’est** qui le reprend), on emploie **à** : **Cette règle est facile à comprendre. C’est facile à faire.**')),
      sort(b('Verb + à or verb + de?', 'Verbe + à ou verbe + de ?'), ['+ à', '+ de'], [['réussir …', 0], ['décider …', 1], ['s’habituer …', 0], ['éviter …', 1], ['hésiter …', 0], ['refuser …', 1]]),
      mc(P.form, ['de', 'à', 'pour', 'en'], { fr: 'N’oublie pas ___ prendre tes clés avant de sortir.' }),
      mc(P.best, ['Il est important de vérifier ses sources.', 'Il est important à vérifier ses sources.', 'C’est important à vérifier ses sources.', 'Il est important vérifier ses sources.']),
      gap(P.complete, 'J’ai envie ___ sortir, mais je dois finir ___ ranger le bureau avant.', ['de', 'de']),
      dlg(b('Weekend plans', 'Projets de week-end'), b('Two friends plan Saturday afternoon.', 'Deux amis organisent leur samedi après-midi.'), [['Léo', 'm'], ['Vous', 'f']], [
        [0, 'Tu as fini de préparer ta valise pour demain ?', 'Have you finished packing your suitcase for tomorrow?'],
        [1, { options: ['Pas encore, j’essaie de retrouver mon chargeur.', 'Pas encore, j’essaie à retrouver mon chargeur.', 'Pas encore, j’essaie retrouver mon chargeur.'] }],
        [0, 'D’accord ! On avait promis de passer voir Clara à midi.', 'Okay! We promised to drop by and see Clara at noon.'],
        [1, { options: ['Oui, je n’ai pas oublié de lui acheter des fleurs.', 'Oui, je n’ai pas oublié à lui acheter des fleurs.', 'Oui, je n’ai pas oublié pour acheter des fleurs.'] }],
      ]),
      dict('Il a refusé de répondre, mais elle a promis de nous rappeler.', { voice: 'f' }),
    ],
    [
      b('Verbs + de: décider de, oublier de, essayer de, refuser de, finir de, arrêter de, éviter de.', 'Verbes + de : décider de, oublier de, essayer de, refuser de, finir de, arrêter de, éviter de.'),
      b('avoir envie / peur / besoin / l’intention de + infinitive.', 'avoir envie / peur / besoin / l’intention de + infinitif.'),
      b('Impersonal Il est facile de faire… vs concrete Ce plat est facile à faire.', 'Impersonnel Il est facile de faire… contre concret Ce plat est facile à faire.'),
    ],
    [['déménager', b('to move house', 'changer de logement')], ['éviter', b('to avoid', 'faire en sorte de ne pas')], ['promettre', b('to promise', 's’engager à faire')]],
  ),
  lesson(C, 3, ['meaning-shifts-and-person-objects', 'changements-de-sens-et-construction'],
    b('Meaning shifts & person objects', 'Changements de sens et compléments'),
    b('Master verbs whose meaning changes with à/de/par, and structures like demander à quelqu’un de faire.', 'Maîtriser les verbes dont le sens varie avec à/de/par, et les tournures avec personne.'),
    [b('Distinguish penser à vs penser de and manquer à vs manquer de', 'Distinguer penser à / penser de et manquer à / manquer de'), b('Contrast commencer / finir à-de vs par', 'Opposer commencer / finir à-de et par'), b('Build demander / conseiller / permettre à qqn de faire', 'Construire demander / conseiller / permettre à qqn de faire')],
    13,
    [
      card(b('Preposition changes meaning', 'Quand la préposition change le sens'), b('**penser à** = *think about / remember*: **Je pense à partir.** **penser de** = *have an opinion on*: **Que penses-tu de ce film ?** **manquer à** = *fail in / be missed by*: **Tu me manques.** **manquer de** = *lack / almost do*: **J’ai manqué de tomber** (= I almost fell). **finir de** = *finish doing*; **finir par** = *end up doing*.', '**penser à** = *avoir en tête* : **Je pense à partir.** **penser de** = *avoir un avis sur* : **Que penses-tu de ce film ?** **manquer à** = *faire défaut à* : **Tu me manques.** **manquer de** = *ne pas avoir assez de / faillir* : **J’ai manqué de tomber.** **finir de** = *achever* ; **finir par** = *aboutir à*.'), {
        ex: [['Nous avons fini de dîner à vingt heures.', 'We finished having dinner at 8 p.m.'], ['Après une heure, nous avons fini par trouver la rue.', 'After an hour, we ended up finding the street.'], ['Qu’est-ce que tu penses de cette idée ?', 'What do you think of this idea?']],
      }),
      tip(b('Asking or advising someone: à qqn de faire', 'Demander ou conseiller : à quelqu’un de faire'), b('Many communication verbs put **à** before the **person** and **de** before the **infinitive**: **demander à Marc de venir**, **conseiller à Léa de patienter**, **dire à Paul d’appeler**, **permettre aux clients de payer en ligne** (so: *lui demander de*, *leur conseiller de*). But **aider quelqu’un à faire** and **empêcher quelqu’un de faire** take a direct person object.', 'Les verbes de parole placent **à** devant la **personne** et **de** devant l’**infinitif** : **demander à Marc de venir**, **conseiller à Léa de patienter**, **permettre aux clients de payer** (donc : *lui demander de*, *leur conseiller de*). Mais **aider quelqu’un à faire** et **empêcher quelqu’un de faire** ont un COD direct.')),
      pairs(P.match, [['penser à ses vacances', b('to think about one’s holidays', 'y songer')], ['penser de ce roman', b('to have an opinion on this novel', 'juger')], ['finir par accepter', b('to end up agreeing', 'accepter finalement')], ['manquer de temps', b('to lack time', 'ne pas avoir assez de temps')]]),
      mc(P.best, ['J’ai conseillé à mon frère de postuler.', 'J’ai conseillé mon frère de postuler.', 'J’ai conseillé à mon frère à postuler.', 'J’ai conseillé mon frère pour postuler.']),
      mc(P.form, ['par', 'de', 'à', 'pour'], { fr: 'Il a hésité longtemps, puis il a fini ___ accepter l’offre.' }),
      gap(P.complete, 'Le médecin a dit ___ Paul ___ se reposer, et sa sœur l’aide ___ faire les courses.', ['à', 'de', 'à']),
      ord(P.order, 'Je lui ai conseillé de prendre ce train.', { tr: 'I advised him/her to take this train.', extra: ['à'] }),
      say('Que penses-tu de ce projet ? On a fini par convaincre le directeur de l’approuver.', 'What do you think of this project? We ended up convincing the director to approve it.'),
    ],
    [
      b('penser à (think about) ≠ penser de (opinion on); finir de (finish) ≠ finir par (end up).', 'penser à (songer) ≠ penser de (avis) ; finir de (achever) ≠ finir par (aboutir).'),
      b('demander / dire / conseiller / permettre + à quelqu’un + de + infinitive.', 'demander / dire / conseiller / permettre + à quelqu’un + de + infinitif.'),
      b('aider quelqu’un à faire; empêcher quelqu’un de faire.', 'aider quelqu’un à faire ; empêcher quelqu’un de faire.'),
    ],
    [['finir par', b('to end up (doing)', 'arriver finalement à')], ['empêcher', b('to prevent', 'rendre impossible')], ['approuver', b('to approve', 'donner son accord')]],
  ),
];
