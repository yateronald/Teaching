import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, hear, lesson, mc, ord, P, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je suis content que tu sois venu. Bien qu’il ait beaucoup travaillé… The past subjunctive is used in the same places as the present subjunctive, but for an action that is already done. It is built like every compound tense, with avoir or être in the subjunctive. This course trains the forms, the choice between present and past subjunctive, and real messages of congratulations, thanks and sympathy.',
    'Je suis content que tu sois venu. Bien qu’il ait beaucoup travaillé… Le subjonctif passé s’emploie aux mêmes endroits que le subjonctif présent, mais pour une action déjà accomplie. Il se construit comme tous les temps composés, avec avoir ou être au subjonctif. Ce cours entraîne les formes, le choix entre subjonctif présent et passé, et de vrais messages de félicitations, de remerciement et de soutien.',
  ),
  outcomes: [
    b('Form the past subjunctive', 'Former le subjonctif passé'),
    b('Choose between present and past subjunctive', 'Choisir entre subjonctif présent et passé'),
    b('Use it after feelings, doubt and conjunctions', 'L’employer après les sentiments, le doute et les conjonctions'),
    b('Write congratulations and sympathy messages', 'Écrire des messages de félicitations et de soutien'),
  ],
};

const C = 'cj-subjonctif-passe';
const SP = b('subjonctif passé', 'subjonctif passé');

export default [
  lesson(C, 1, ['forming-the-past-subjunctive', 'former-le-subjonctif-passe'],
    b('Avoir or être in the subjunctive + participle', 'Avoir ou être au subjonctif + participe'),
    b('Que j’aie fini, qu’elle soit partie, que nous nous soyons trompés.', 'Que j’aie fini, qu’elle soit partie, que nous nous soyons trompés.'),
    [b('Recall avoir and être in the subjunctive', 'Revoir avoir et être au subjonctif'), b('Form the past subjunctive', 'Former le subjonctif passé'), b('Agree the participle as usual', 'Accorder le participe comme d’habitude')],
    13,
    [
      card(b('A compound subjunctive', 'Un subjonctif composé'), b('Put the auxiliary in the **present subjunctive** and add the past participle, with the usual auxiliary and agreements. Avoir: **que j’aie fini, que tu aies compris, qu’il ait vu**. Être: **que je sois venu, qu’elle soit partie, qu’ils se soient levés**.', 'Mettez l’auxiliaire au **subjonctif présent** et ajoutez le participe passé, avec l’auxiliaire et les accords habituels. Avoir : **que j’aie fini, que tu aies compris, qu’il ait vu**. Être : **que je sois venu, qu’elle soit partie, qu’ils se soient levés**.'), {
        table: {
          head: ['', 'finir', 'partir'],
          rows: [['que je / j’', 'aie fini', 'sois parti'], ['que tu', 'aies fini', 'sois parti'], ['qu’il', 'ait fini', 'soit parti'], ['qu’elle', 'ait fini', 'soit partie'], ['que nous', 'ayons fini', 'soyons partis'], ['que vous', 'ayez fini', 'soyez partis'], ['qu’ils', 'aient fini', 'soient partis'], ['qu’elles', 'aient fini', 'soient parties']],
        },
      }),
      trap(b('Aie, aies, ait: three spellings, one sound', 'Aie, aies, ait : trois orthographes, un son'), b('**que j’aie, que tu aies, qu’il ait, qu’ils aient** all sound like « è ». The spelling follows the person: **que j’aie compris** (never « que j’ai compris » after a subjunctive trigger).', '**que j’aie, que tu aies, qu’il ait, qu’ils aient** se prononcent tous « è ». L’orthographe suit la personne : **que j’aie compris** (jamais « que j’ai compris » après un déclencheur du subjonctif).')),
      conj('comprendre', SP, [['que j’', 'aie compris'], ['que tu', 'aies compris'], ['qu’il / elle', 'ait compris'], ['que nous', 'ayons compris'], ['que vous', 'ayez compris'], ['qu’ils / elles', 'aient compris']], { given: [0] }),
      conj('arriver', SP, [['qu’il', 'soit arrivé'], ['qu’elle', 'soit arrivée'], ['que nous (Léo et moi)', 'soyons arrivés'], ['que vous (Lou et Ana)', 'soyez arrivées'], ['qu’ils', 'soient arrivés'], ['qu’elles', 'soient arrivées']], { given: [0] }),
      mc(P.form, ['aies oublié', 'as oublié', 'aie oublié', 'ait oublié'], { fr: 'Je suis triste que tu ___ notre rendez-vous.' }),
      mc(P.spelling, ['soient parties', 'aient parti', 'soient partis', 'soit parties'], { fr: 'Je suis triste que mes cousines ___ si vite.' }),
      gap(P.complete, 'Je ne pense pas qu’il ___ (lire) mon message. Je suis ravie que vous ___ (venir).', [['ait lu'], ['soyez venu', 'soyez venus', 'soyez venue', 'soyez venues']]),
      hear('Je suis contente que tu aies réussi.', b('When did the success happen?', 'Quand la réussite a-t-elle eu lieu ?'), [b('It already happened', 'Elle a déjà eu lieu'), b('It will happen', 'Elle aura lieu'), b('It is happening now', 'Elle a lieu maintenant')]),
      dict('Bien qu’ils aient beaucoup travaillé, ils n’ont pas fini à temps.'),
      say('Je suis heureux que vous ayez pu venir.', 'I’m happy you were able to come.'),
    ],
    [
      b('Past subjunctive = avoir / être in the subjunctive + participle.', 'Subjonctif passé = avoir / être au subjonctif + participe.'),
      b('que j’aie, que tu aies, qu’il ait, qu’ils aient: one sound.', 'que j’aie, que tu aies, qu’il ait, qu’ils aient : un seul son.'),
      b('Same auxiliary and agreements as the passé composé.', 'Même auxiliaire et mêmes accords qu’au passé composé.'),
    ],
    [['un anniversaire', b('a birthday', 'le jour de naissance fêté')], ['réussir', b('to succeed, to pass', 'obtenir un bon résultat')], ['à temps', b('in time', 'pas trop tard')]],
  ),

  lesson(C, 2, ['present-or-past-subjunctive', 'subjonctif-present-ou-passe'],
    b('Present or past subjunctive?', 'Subjonctif présent ou passé ?'),
    b('Je suis content que tu viennes / que tu sois venu: now or later, or already done.', 'Je suis content que tu viennes / que tu sois venu : maintenant ou plus tard, ou déjà fait.'),
    [b('Choose the subjunctive by time', 'Choisir le subjonctif selon le moment'), b('Use the past subjunctive after bien que and avant que', 'Employer le subjonctif passé après bien que et avant que'), b('Use it with a future deadline', 'L’employer avec une échéance future')],
    13,
    [
      card(b('Already done, or not yet?', 'Déjà fait, ou pas encore ?'), b('The **present subjunctive** is for an action at the same time or later: **Je suis content que tu viennes** (now or soon). The **past subjunctive** is for an action already done, before the main verb: **Je suis content que tu sois venu.** It also works with a future deadline: **Il faut que vous ayez fini avant lundi.**', 'Le **subjonctif présent** concerne une action simultanée ou postérieure : **Je suis content que tu viennes** (maintenant ou bientôt). Le **subjonctif passé** concerne une action déjà accomplie, antérieure au verbe principal : **Je suis content que tu sois venu.** Il marche aussi avec une échéance future : **Il faut que vous ayez fini avant lundi.**'), {
        ex: [['Je doute qu’il ait compris la consigne.', 'I doubt he understood the instructions.'], ['Il faut que le dossier soit envoyé avant vendredi.', 'The file must be sent before Friday.'], ['Il faut que tout le monde ait voté avant midi.', 'Everyone must have voted by noon.']],
      }),
      sort(b('Present or past subjunctive?', 'Subjonctif présent ou passé ?'), [b('same time or later: present', 'simultané ou postérieur : présent'), b('already done: past', 'déjà accompli : passé')], [['Je suis ravi que tu viennes ce soir.', 0], ['Je suis ravi que tu sois venu hier.', 1], ['Il faut que tu partes maintenant.', 0], ['Bien qu’il ait plu toute la nuit, la route est sèche.', 1], ['J’attendrai que tu sois prêt.', 0], ['Je regrette que vous n’ayez pas pu venir.', 1]]),
      tip(b('After bien que: often the past', 'Après bien que : souvent le passé'), b('With **bien que** and **quoique**, the past subjunctive is common when the concession is in the past: **Bien qu’elle ait révisé, elle a raté l’examen.** With **avant que**, the present is the rule: **Partons avant qu’il fasse nuit.**', 'Avec **bien que** et **quoique**, le subjonctif passé est fréquent quand la concession est passée : **Bien qu’elle ait révisé, elle a raté l’examen.** Avec **avant que**, le présent est la règle : **Partons avant qu’il fasse nuit.**')),
      mc(P.form, ['ait plu', 'pleuve', 'a plu', 'avait plu'], { fr: 'Bien qu’il ___ toute la nuit, le match a eu lieu.' }),
      mc(P.form, ['ayez rendu', 'rendez', 'avez rendu', 'rendiez'], { fr: 'Il faut que vous ___ vos devoirs avant la fin de la semaine.' }),
      mc(P.form, ['sois', 'aies été', 'es', 'seras'], { fr: 'Je ne partirai pas avant que tu ___ là.' }),
      gap(P.complete, 'Je suis déçu que tu ne m’___ (pas appeler) hier. Il est possible qu’elle ___ (se tromper) de salle.', [['aies pas appelé'], ['se soit trompée']]),
      ord(P.order, 'Je regrette que nous ne nous soyons pas vus plus souvent.', { tr: 'I regret that we didn’t see each other more often.' }),
      dict('Il faut que toutes les inscriptions aient été reçues avant le premier mars.'),
      say('Je ne crois pas qu’ils aient reçu notre invitation.', 'I don’t think they received our invitation.'),
    ],
    [
      b('Present subjunctive: same time or later.', 'Subjonctif présent : simultanéité ou postériorité.'),
      b('Past subjunctive: already done before the main verb or a deadline.', 'Subjonctif passé : déjà accompli avant le verbe principal ou une échéance.'),
      b('bien que + past subjunctive for a past concession.', 'bien que + subjonctif passé pour une concession passée.'),
    ],
    [['une consigne', b('an instruction', 'ce qu’il faut faire')], ['voter', b('to vote', 'donner sa voix')], ['une inscription', b('a registration', 'le fait de s’inscrire')]],
  ),

  lesson(C, 3, ['messages-and-review', 'messages-et-bilan'],
    b('Messages of congratulations, thanks and sympathy', 'Messages de félicitations, de remerciement et de soutien'),
    b('Nous sommes ravis que vous ayez réussi. Je suis désolée que tu aies été malade.', 'Nous sommes ravis que vous ayez réussi. Je suis désolée que tu aies été malade.'),
    [b('Congratulate someone in writing', 'Féliciter quelqu’un par écrit'), b('Express sympathy', 'Exprimer son soutien'), b('Thank someone for something done', 'Remercier pour quelque chose de fait')],
    13,
    [
      card(b('Feelings about what happened', 'Des sentiments sur ce qui s’est passé'), b('Messages of feelings often react to something already done, so they use the past subjunctive. Congratulations: **Nous sommes ravis que vous ayez obtenu ce poste.** Thanks: **Je suis touchée que tu sois venu.** Sympathy: **Je suis désolé que tu aies été malade.**', 'Les messages de sentiments réagissent souvent à quelque chose de déjà fait : ils emploient donc le subjonctif passé. Félicitations : **Nous sommes ravis que vous ayez obtenu ce poste.** Remerciements : **Je suis touchée que tu sois venu.** Soutien : **Je suis désolé que tu aies été malade.**')),
      mc(P.best, ['Toutes nos félicitations ! Nous sommes si heureux que vous ayez réussi votre concours.', 'Toutes nos félicitations ! Nous sommes si heureux que vous avez réussi votre concours.', 'Toutes nos félicitations ! Nous sommes si heureux que vous réussirez votre concours.', 'Toutes nos félicitations ! Nous sommes si heureux que vous ayez réussir votre concours.']),
      mc(P.form, ['aies pensé', 'as pensé', 'penses', 'avais pensé'], { fr: 'Merci pour ton message : je suis touchée que tu ___ à moi.' }),
      gap(P.completeText, 'Chère Sarah, je suis vraiment désolée que tu ___ (devoir) annuler ton voyage. Je suis contente que ton opération ___ (bien se passer). Il faut que tu te ___ (reposer) maintenant.', [['aies dû'], ['se soit bien passée'], ['reposes']]),
      hear('Je suis désolé que vous ayez attendu si longtemps.', b('What is the speaker doing?', 'Que fait la personne ?'), [b('Apologising for a long wait', 'Elle s’excuse pour une longue attente'), b('Asking you to wait', 'Elle vous demande d’attendre'), b('Thanking you for coming', 'Elle vous remercie d’être venu')]),
      dlg(b('Good news', 'Une bonne nouvelle'), b('Chloé calls her friend Adam.', 'Chloé appelle son ami Adam.'), [['Chloé', 'f'], ['Adam', 'm']], [
        [0, 'Adam, j’ai été prise pour le poste à Montréal !', 'Adam, I got the job in Montreal!'],
        [1, { options: ['C’est génial ! Je suis tellement content que tu aies été choisie.', 'C’est génial ! Je suis tellement content que tu as été choisie.', 'C’est génial ! Je suis tellement content que tu seras choisie.'] }],
        [0, 'Merci ! Et je suis contente que tu m’aies aidée à préparer l’entretien.', 'Thanks! And I’m glad you helped me prepare for the interview.'],
        [1, { options: ['Avec plaisir. Il faut qu’on fête ça avant que tu partes !', 'Avec plaisir. Il faut qu’on fête ça avant que tu partiras !', 'Avec plaisir. Il faut qu’on fête ça avant que tu pars !'] }],
      ]),
      write(b('A message to a friend', 'Un message à un ami'), b('A friend has just passed an important exam after a difficult year. In 40 to 70 words, congratulate them and mention what they went through. Use the past subjunctive at least three times.', 'Un ami vient de réussir un examen important après une année difficile. En 40 à 70 mots, félicitez-le et évoquez ce qu’il a traversé. Employez le subjonctif passé au moins trois fois.'), 40, 70, [
        b('Three verbs in the past subjunctive', 'Trois verbes au subjonctif passé'),
        b('One expression of feeling (ravi, fier, touché…)', 'Une expression de sentiment (ravi, fier, touché…)'),
        b('One wish for the future (il faut que…)', 'Un souhait pour l’avenir (il faut que…)'),
      ], 'Cher Paul, quelle bonne nouvelle ! Je suis tellement fier que tu aies réussi ton examen. Je sais que l’année a été difficile et je suis désolé que tu aies dû travailler la nuit. Je suis heureux que tu n’aies jamais abandonné. Maintenant, il faut que tu te reposes et que tu fêtes ça !'),
      say('Nous sommes ravis que vous ayez accepté notre invitation.', 'We’re delighted you accepted our invitation.'),
    ],
    [
      b('Feelings about something done → past subjunctive.', 'Sentiments sur une chose faite → subjonctif passé.'),
      b('ravi, fier, touché, désolé, déçu + que + past subjunctive.', 'ravi, fier, touché, désolé, déçu + que + subjonctif passé.'),
      b('Wishes for later → present subjunctive (il faut que tu te reposes).', 'Souhaits pour plus tard → subjonctif présent (il faut que tu te reposes).'),
    ],
    [['un concours', b('a competitive exam', 'un examen avec un nombre limité de places')], ['touché', b('touched, moved', 'ému')], ['abandonner', b('to give up', 'renoncer')]],
  ),
];
