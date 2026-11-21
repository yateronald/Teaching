import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Quand je suis arrivé, le film avait déjà commencé. The plus-que-parfait (pluperfect) places an event before another past event: it is what gives depth to a story. This course shows how to form it (imparfait of avoir or être + past participle), how it works with the passé composé and the imparfait, and how to use it for regrets (si j’avais su…) and for reported speech.',
    'Quand je suis arrivé, le film avait déjà commencé. Le plus-que-parfait place un événement avant un autre événement passé : c’est lui qui donne de la profondeur à un récit. Ce cours montre comment le former (imparfait de avoir ou être + participe passé), comment il s’articule avec le passé composé et l’imparfait, et comment l’employer pour les regrets (si j’avais su…) et le discours rapporté.',
  ),
  outcomes: [
    b('Form the plus-que-parfait with avoir and être', 'Former le plus-que-parfait avec avoir et être'),
    b('Order two past events', 'Ordonner deux événements passés'),
    b('Tell a story with three past tenses', 'Raconter avec trois temps du passé'),
    b('Express regret with si + plus-que-parfait', 'Exprimer un regret avec si + plus-que-parfait'),
  ],
};

const C = 'plus-que-parfait';
export default [
  lesson(C, 1, ['forming-the-pluperfect', 'former-le-plus-que-parfait'],
    b('Forming the plus-que-parfait', 'Former le plus-que-parfait'),
    b('Imparfait of avoir or être + past participle, with the same agreements as the passé composé.', 'Imparfait de avoir ou être + participe passé, avec les mêmes accords qu’au passé composé.'),
    [b('Form the tense with avoir', 'Former le temps avec avoir'), b('Form it with être and agree the participle', 'Le former avec être et accorder le participe'), b('Recognise it in a text', 'Le reconnaître dans un texte')],
    13,
    [
      card(b('Auxiliary in the imparfait', 'L’auxiliaire à l’imparfait'), b('Take the passé composé and put the auxiliary in the **imparfait**: **j’ai mangé → j’avais mangé**, **elle est partie → elle était partie**. The choice of avoir / être and the agreements do not change.', 'Reprenez le passé composé et mettez l’auxiliaire à l’**imparfait** : **j’ai mangé → j’avais mangé**, **elle est partie → elle était partie**. Le choix de avoir / être et les accords ne changent pas.'), {
        ex: [['J’avais oublié mes clés.', 'I had forgotten my keys.'], ['Nous étions déjà partis.', 'We had already left.'], ['Elle s’était trompée de date.', 'She had got the date wrong.']],
      }),
      conj('finir', b('plus-que-parfait', 'plus-que-parfait'), [['j’', 'avais fini'], ['tu', 'avais fini'], ['il / elle', 'avait fini'], ['nous', 'avions fini'], ['vous', 'aviez fini'], ['ils / elles', 'avaient fini']], { given: [0] }),
      conj('arriver', b('plus-que-parfait', 'plus-que-parfait'), [['j’', 'étais arrivé(e)'], ['tu', 'étais arrivé(e)'], ['elle', 'était arrivée'], ['nous', 'étions arrivés'], ['vous', 'étiez arrivé(e)s'], ['elles', 'étaient arrivées']], { given: [0] }),
      mc(P.form, ['avaient vendu', 'ont vendu', 'avaient vendus', 'étaient vendu'], { fr: 'Quand nous sommes arrivés, ils ___ tous les billets.' }),
      mc(P.form, ['était sortie', 'avait sorti', 'était sorti', 'avait sortie'], { fr: 'J’ai appelé Marie, mais elle ___.' }),
      gap(P.complete, 'Il ___ (ne pas dormir) de la nuit : il ___ (boire) trop de café.', [['n’avait pas dormi'], ['avait bu']]),
      dict('Quand le médecin est arrivé, la fièvre avait déjà baissé.', { voice: 'f' }),
    ],
    [
      b('Plus-que-parfait = avoir / être in the imparfait + past participle.', 'Plus-que-parfait = avoir / être à l’imparfait + participe passé.'),
      b('Same auxiliary and agreements as the passé composé.', 'Même auxiliaire et mêmes accords qu’au passé composé.'),
      b('Negation: je n’avais pas compris.', 'Négation : je n’avais pas compris.'),
    ],
    [['se tromper de', b('to get (sth) wrong', 'faire une erreur sur')], ['la fièvre', b('fever', 'température élevée')], ['baisser', b('to go down', 'diminuer')]],
  ),
  lesson(C, 2, ['before-another-past-event', 'avant-un-autre-evenement'],
    b('An event before another past event', 'Un événement antérieur à un autre'),
    b('Use the plus-que-parfait to go back further in the past.', 'Employer le plus-que-parfait pour remonter plus loin dans le passé.'),
    [b('Order two past events', 'Ordonner deux événements passés'), b('Combine it with passé composé and imparfait', 'Le combiner avec le passé composé et l’imparfait'), b('Use déjà, encore, jamais', 'Employer déjà, encore, jamais')],
    13,
    [
      card(b('Going back further', 'Remonter plus loin'), b('In a past story, the **passé composé** tells the main events, the **imparfait** the background, and the **plus-que-parfait** what had happened **before**: **Quand je suis arrivé (event), il pleuvait (background) et le film avait commencé (before).**', 'Dans un récit au passé, le **passé composé** raconte les événements, l’**imparfait** décrit le décor, et le **plus-que-parfait** dit ce qui s’était passé **avant** : **Quand je suis arrivé, il pleuvait et le film avait commencé.**'), {
        ex: [['Je n’ai pas reconnu Paul : il avait beaucoup changé.', 'I didn’t recognise Paul: he had changed a lot.'], ['Elle a réussi parce qu’elle avait bien préparé l’examen.', 'She passed because she had prepared well.']],
      }),
      sort(b('Which happened first?', 'Lequel s’est passé en premier ?'), [b('first (plus-que-parfait)', 'd’abord (plus-que-parfait)'), b('then (passé composé)', 'ensuite (passé composé)')], [['il avait neigé', 0], ['les écoles ont fermé', 1], ['j’avais perdu mon passeport', 0], ['j’ai raté l’avion', 1], ['nous avions réservé', 0], ['nous avons eu une table', 1]]),
      mc(P.best, ['Je n’avais jamais vu la mer avant ce voyage.', 'Je n’ai jamais vu la mer avant ce voyage avait.', 'Je ne voyais jamais la mer avant avait.', 'Je n’avais jamais voir la mer.']),
      mc(P.form, ['avait plu', 'a plu', 'pleuvait', 'aura plu'], { fr: 'Le matin, les rues étaient mouillées : il ___ toute la nuit.' }),
      gap(P.completeText, 'Quand je ___ (arriver) au bureau, la réunion ___ (commencer). Mon collègue ___ (oublier) de me prévenir.', [['suis arrivé', 'suis arrivée'], ['avait commencé', 'avait déjà commencé'], 'avait oublié']),
      ord(P.order, 'Elle était fatiguée parce qu’elle avait mal dormi.', { tr: 'She was tired because she had slept badly.' }),
      say('Quand je suis arrivé à la gare, le train était déjà parti.', 'When I got to the station, the train had already left.'),
    ],
    [
      b('Passé composé = main events; imparfait = background; plus-que-parfait = earlier events.', 'Passé composé = événements ; imparfait = décor ; plus-que-parfait = antériorité.'),
      b('Often with déjà, jamais, pas encore.', 'Souvent avec déjà, jamais, pas encore.'),
      b('Explains a past situation: parce qu’il avait plu.', 'Explique une situation passée : parce qu’il avait plu.'),
    ],
    [['mouillé', b('wet', 'humide')], ['prévenir', b('to warn, to let know', 'avertir')], ['reconnaître', b('to recognise', 'identifier')]],
  ),
  lesson(C, 3, ['regrets-and-reported-speech', 'regrets-et-discours-rapporte'],
    b('Si j’avais su… regrets and reported speech', 'Si j’avais su… regrets et discours rapporté'),
    b('Use the plus-que-parfait to express regret and to report what someone had said.', 'Employer le plus-que-parfait pour le regret et pour rapporter des paroles passées.'),
    [b('Express regret with si + plus-que-parfait', 'Exprimer un regret avec si + plus-que-parfait'), b('Report past statements', 'Rapporter des paroles passées'), b('Tell an anecdote', 'Raconter une anecdote')],
    13,
    [
      card(b('Regret: si + plus-que-parfait', 'Le regret : si + plus-que-parfait'), b('**Si j’avais su !** (If only I had known!) **Si tu m’avais écouté…** Alone, it expresses a regret. With a consequence, it takes the past conditional: **Si j’avais su, je serais venu.**', '**Si j’avais su !** **Si tu m’avais écouté…** Seul, il exprime un regret. Avec une conséquence, il est suivi du conditionnel passé : **Si j’avais su, je serais venu.**'), {
        ex: [['Ah, si j’avais pris un parapluie !', 'Oh, if only I had taken an umbrella!'], ['Si on était partis plus tôt…', 'If we had left earlier…']],
      }),
      tip(b('In reported speech', 'Au discours rapporté'), b('A passé composé in direct speech becomes a **plus-que-parfait** after a past verb: **Il a dit : « J’ai fini. »** → **Il a dit qu’il avait fini.**', 'Un passé composé au discours direct devient un **plus-que-parfait** après un verbe au passé : **Il a dit : « J’ai fini. »** → **Il a dit qu’il avait fini.**'), {
        ex: [['Elle m’a dit qu’elle avait trouvé un travail.', 'She told me she had found a job.']],
      }),
      mc(P.best, ['Si j’avais su, je ne serais pas venu.', 'Si j’ai su, je ne serais pas venu.', 'Si je savais, je n’étais pas venu.', 'Si j’aurais su, je ne serais pas venu.'], { explain: b('Never « si j’aurais »: si + plus-que-parfait.', 'Jamais « si j’aurais » : si + plus-que-parfait.') }),
      mc(P.best, ['Il m’a expliqué qu’il avait raté son bus.', 'Il m’a expliqué qu’il a raté son bus avait.', 'Il m’a expliqué qu’il ratait son bus avant.', 'Il m’a expliqué qu’il aura raté son bus.'], { fr: 'Il a dit : « J’ai raté mon bus. »' }),
      gap(P.complete, 'Ah, si nous ___ (réserver) plus tôt, nous aurions eu de meilleures places !', [['avions réservé']]),
      pairs(P.match, [['Si j’avais su…', b('If I had known…', 'regret d’ignorance')], ['Si tu m’avais écouté…', b('If you had listened to me…', 'reproche')], ['Il a dit qu’il avait fini.', b('He said he had finished.', 'discours rapporté')], ['Je n’avais jamais vu ça !', b('I had never seen that!', 'surprise passée')]]),
      dlg(b('An unlucky trip', 'Un voyage malchanceux'), undefined, [['Nadia', 'f'], ['Vous', 'm']], [
        [0, 'Alors, ce voyage à Gaspé ?', 'So, how was the trip to Gaspé?'],
        [1, { options: ['Compliqué ! J’avais oublié mon permis, alors je n’ai pas pu louer de voiture.', 'Compliqué ! J’oubliais mon permis, alors je n’avais pas pu louer.', 'Compliqué ! J’ai oublié avais mon permis.'] }],
        [0, 'Oh non ! Si tu m’avais appelée, je t’aurais prêté la mienne.', 'Oh no! If you had called me, I would have lent you mine.'],
        [1, { options: ['Je sais… Si j’avais su, je t’aurais appelée tout de suite.', 'Je sais… Si j’aurais su, je t’appelais.', 'Je sais… Si je savais, je t’ai appelée.'] }],
      ]),
      say('Si j’avais su que tu étais à Montréal, je t’aurais invité à dîner.', 'If I had known you were in Montréal, I would have invited you to dinner.'),
    ],
    [
      b('Regret: Si j’avais su ! Si tu m’avais écouté…', 'Regret : Si j’avais su ! Si tu m’avais écouté…'),
      b('Si + plus-que-parfait, past conditional (never si j’aurais).', 'Si + plus-que-parfait, conditionnel passé (jamais si j’aurais).'),
      b('Reported speech: passé composé → plus-que-parfait (Il a dit qu’il avait fini).', 'Discours rapporté : passé composé → plus-que-parfait (Il a dit qu’il avait fini).'),
    ],
    [['le permis (de conduire)', b('driving licence', 'autorisation de conduire')], ['prêter', b('to lend', 'donner pour un temps')], ['malchanceux', b('unlucky', 'qui n’a pas de chance')]],
  ),
];
