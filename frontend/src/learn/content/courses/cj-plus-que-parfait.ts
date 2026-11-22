import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, hear, lesson, mc, ord, P, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Quand je suis arrivé, le film avait déjà commencé. The plus-que-parfait goes one step further back in the past. It is built like the passé composé, with the auxiliary in the imparfait, so everything you know about avoir, être and agreement still applies. This course trains the forms with avoir, then with être and pronominal verbs, then the order of past events, and ends with regrets and reported speech.',
    'Quand je suis arrivé, le film avait déjà commencé. Le plus-que-parfait remonte un cran plus loin dans le passé. Il se construit comme le passé composé, avec l’auxiliaire à l’imparfait : tout ce que vous savez sur avoir, être et l’accord reste valable. Ce cours entraîne les formes avec avoir, puis avec être et les verbes pronominaux, puis l’ordre des événements passés, et se termine par le regret et le discours rapporté.',
  ),
  outcomes: [
    b('Form the plus-que-parfait with avoir and être', 'Former le plus-que-parfait avec avoir et être'),
    b('Agree the participle as in the passé composé', 'Accorder le participe comme au passé composé'),
    b('Order two past events', 'Ordonner deux événements passés'),
    b('Express regret and report past words', 'Exprimer un regret et rapporter des paroles passées'),
  ],
};

const C = 'cj-plus-que-parfait';
const PQP = b('plus-que-parfait', 'plus-que-parfait');

export default [
  lesson(C, 1, ['forming-with-avoir', 'former-avec-avoir'],
    b('Avoir in the imparfait + participle', 'Avoir à l’imparfait + participe'),
    b('J’ai fini → j’avais fini: change only the auxiliary.', 'J’ai fini → j’avais fini : on ne change que l’auxiliaire.'),
    [b('Form the plus-que-parfait with avoir', 'Former le plus-que-parfait avec avoir'), b('Reuse the irregular participles', 'Réemployer les participes irréguliers'), b('Hear it next to the passé composé', 'L’entendre à côté du passé composé')],
    13,
    [
      card(b('Only the auxiliary changes', 'Seul l’auxiliaire change'), b('Take the passé composé and put **avoir** in the **imparfait**. The participle does not change: **j’ai fini → j’avais fini**, **nous avons pris → nous avions pris**. Auxiliary: **avais, avais, avait, avions, aviez, avaient**.', 'Prenez le passé composé et mettez **avoir** à l’**imparfait**. Le participe ne change pas : **j’ai fini → j’avais fini**, **nous avons pris → nous avions pris**. Auxiliaire : **avais, avais, avait, avions, aviez, avaient**.'), {
        table: {
          head: ['', 'finir', 'prendre', 'faire'],
          rows: [['j’', 'avais fini', 'avais pris', 'avais fait'], ['tu', 'avais fini', 'avais pris', 'avais fait'], ['il / elle', 'avait fini', 'avait pris', 'avait fait'], ['nous', 'avions fini', 'avions pris', 'avions fait'], ['vous', 'aviez fini', 'aviez pris', 'aviez fait'], ['ils / elles', 'avaient fini', 'avaient pris', 'avaient fait']],
        },
        ex: [['Il avait déjà mangé quand je suis arrivée.', 'He had already eaten when I arrived.'], ['Nous avions réservé une table, heureusement.', 'We had booked a table, luckily.']],
      }),
      conj('voir', PQP, [['j’', 'avais vu'], ['tu', 'avais vu'], ['il / elle', 'avait vu'], ['nous', 'avions vu'], ['vous', 'aviez vu'], ['ils / elles', 'avaient vu']], { given: [0] }),
      conj('écrire', PQP, [['j’', 'avais écrit'], ['tu', 'avais écrit'], ['il / elle', 'avait écrit'], ['nous', 'avions écrit'], ['vous', 'aviez écrit'], ['ils / elles', 'avaient écrit']], { given: [0] }),
      mc(P.form, ['avaient vendu', 'ont vendu', 'avaient vendre', 'avaient vendus'], { fr: 'Quand nous sommes arrivés, ils ___ tous les billets.' }),
      mc(P.form, ['avais oublié', 'ai oublié', 'oubliais', 'avait oublié'], { fr: 'Je suis retourné chez moi parce que j’___ mon téléphone.' }),
      gap(P.complete, 'Elle ___ (ne pas dormir) de la nuit : elle ___ (boire) trop de café.', [['n’avait pas dormi'], ['avait bu']]),
      hear('J’avais déjà vu ce film.', b('Which tense do you hear?', 'Quel temps entendez-vous ?'), [b('Plus-que-parfait: you hear « j’avais » + participle', 'Plus-que-parfait : on entend « j’avais » + participe'), b('Passé composé', 'Passé composé'), b('Imparfait', 'Imparfait')]),
      dict('Quand le médecin est arrivé, la fièvre avait déjà baissé.'),
      say('Je n’avais jamais vu la mer avant ce voyage.', 'I had never seen the sea before that trip.'),
    ],
    [
      b('Plus-que-parfait = avoir in the imparfait + past participle.', 'Plus-que-parfait = avoir à l’imparfait + participe passé.'),
      b('Same participles as the passé composé: avais pris, avais fait, avais vu.', 'Mêmes participes qu’au passé composé : avais pris, avais fait, avais vu.'),
      b('Negation around the auxiliary: je n’avais pas compris.', 'Négation autour de l’auxiliaire : je n’avais pas compris.'),
    ],
    [['réserver', b('to book', 'retenir à l’avance')], ['la fièvre', b('fever', 'une température trop élevée')], ['baisser', b('to go down', 'diminuer')]],
  ),

  lesson(C, 2, ['etre-and-pronominal-verbs', 'etre-et-verbes-pronominaux'],
    b('Être in the imparfait and pronominal verbs', 'Être à l’imparfait et verbes pronominaux'),
    b('Elle était partie, nous nous étions trompés: same verbs and agreements as the passé composé.', 'Elle était partie, nous nous étions trompés : mêmes verbes et mêmes accords qu’au passé composé.'),
    [b('Form the plus-que-parfait with être', 'Former le plus-que-parfait avec être'), b('Agree the participle with the subject', 'Accorder le participe avec le sujet'), b('Conjugate pronominal verbs', 'Conjuguer les verbes pronominaux')],
    13,
    [
      card(b('Être verbs keep être', 'Les verbes avec être gardent être'), b('The verbs that take être in the passé composé take **être in the imparfait** here, and the participle agrees with the subject: **elle est partie → elle était partie**, **ils sont arrivés → ils étaient arrivés**. Pronominal verbs too: **je me suis levé → je m’étais levé**.', 'Les verbes qui prennent être au passé composé prennent ici **être à l’imparfait**, et le participe s’accorde avec le sujet : **elle est partie → elle était partie**, **ils sont arrivés → ils étaient arrivés**. Les verbes pronominaux aussi : **je me suis levé → je m’étais levé**.'), {
        ex: [['Quand j’ai appelé, elle était déjà partie.', 'When I called, she had already left.'], ['Nous nous étions perdus dans la vieille ville.', 'We had got lost in the old town.']],
      }),
      conj('partir', PQP, [['il', 'était parti'], ['elle', 'était partie'], ['nous (Léo et moi)', 'étions partis'], ['vous (Ana et Mia)', 'étiez parties'], ['ils', 'étaient partis'], ['elles', 'étaient parties']], { given: [0] }),
      conj('se tromper', PQP, [['il', 's’était trompé'], ['elle', 's’était trompée'], ['nous (Tom et moi)', 'nous étions trompés'], ['vous (Inès et Lou)', 'vous étiez trompées'], ['ils', 's’étaient trompés'], ['elles', 's’étaient trompées']], { given: [0] }),
      trap(b('Avoir or être: same choice as in the passé composé', 'Avoir ou être : même choix qu’au passé composé'), b('Do not mix them: **il avait fini** but **il était venu**, **elle avait vu** but **elle s’était levée**. The rule never changes from one compound tense to another.', 'Ne les mélangez pas : **il avait fini** mais **il était venu**, **elle avait vu** mais **elle s’était levée**. La règle ne change jamais d’un temps composé à l’autre.')),
      mc(P.spelling, ['étaient arrivées', 'avaient arrivé', 'étaient arrivé', 'était arrivées'], { fr: 'Mes sœurs ___ avant nous.' }),
      mc(P.form, ['s’était réveillée', 'avait réveillé', 's’avait réveillée', 'était réveillé'], { fr: 'Ce jour-là, Clara ___ avant le lever du soleil.' }),
      sort(b('Avoir or être in the imparfait?', 'Avoir ou être à l’imparfait ?'), ['avais / avait…', 'étais / était…'], [['… mangé', 0], ['… descendu', 1], ['… écrit', 0], ['… resté', 1], ['… compris', 0], ['… né', 1]]),
      gap(P.complete, 'Quand je suis rentrée, les enfants ___ (s’endormir). Mon mari ___ (sortir) promener le chien.', [['s’étaient endormis'], ['était sorti']]),
      dict('Elle s’était trompée de train et elle était arrivée à Lyon au lieu de Dijon.'),
      say('Nous étions déjà partis quand ils sont arrivés.', 'We had already left when they arrived.'),
    ],
    [
      b('Être verbs: être in the imparfait + participle agreed with the subject.', 'Verbes avec être : être à l’imparfait + participe accordé avec le sujet.'),
      b('Pronominal verbs: je m’étais levé(e), nous nous étions levé(e)s.', 'Verbes pronominaux : je m’étais levé(e), nous nous étions levé(e)s.'),
      b('Same choice of auxiliary as in the passé composé.', 'Même choix d’auxiliaire qu’au passé composé.'),
    ],
    [['se perdre', b('to get lost', 'ne plus trouver son chemin')], ['promener le chien', b('to walk the dog', 'sortir le chien')], ['au lieu de', b('instead of', 'à la place de')]],
  ),

  lesson(C, 3, ['order-of-past-events', 'ordre-des-evenements-passes'],
    b('The order of past events', 'L’ordre des événements passés'),
    b('Passé composé for the story, imparfait for the scene, plus-que-parfait for what came before.', 'Passé composé pour le récit, imparfait pour le décor, plus-que-parfait pour ce qui est arrivé avant.'),
    [b('Order two past events', 'Ordonner deux événements passés'), b('Explain a past situation with parce que', 'Expliquer une situation passée avec parce que'), b('Use déjà, jamais, pas encore', 'Employer déjà, jamais, pas encore')],
    13,
    [
      card(b('Going further back', 'Remonter plus loin'), b('In a past story, the passé composé tells the main events, the imparfait the background, and the **plus-que-parfait** what had happened **before**: **Quand je suis arrivé, il pleuvait et le film avait commencé.** It often explains a past situation: **Il était fatigué parce qu’il avait mal dormi.**', 'Dans un récit au passé, le passé composé raconte les événements, l’imparfait le décor, et le **plus-que-parfait** ce qui s’était passé **avant** : **Quand je suis arrivé, il pleuvait et le film avait commencé.** Il explique souvent une situation passée : **Il était fatigué parce qu’il avait mal dormi.**'), {
        ex: [['Je n’ai pas reconnu Paul : il avait beaucoup changé.', 'I didn’t recognise Paul: he had changed a lot.'], ['Elle a réussi parce qu’elle avait bien préparé l’examen.', 'She passed because she had prepared well for the exam.']],
      }),
      sort(b('Which happened first?', 'Lequel s’est passé en premier ?'), [b('first: plus-que-parfait', 'd’abord : plus-que-parfait'), b('then: passé composé', 'ensuite : passé composé')], [['il avait neigé', 0], ['les écoles ont fermé', 1], ['j’avais perdu mon passeport', 0], ['j’ai raté l’avion', 1], ['nous avions réservé', 0], ['nous avons eu une table', 1]]),
      tip(b('Déjà, jamais, pas encore', 'Déjà, jamais, pas encore'), b('These adverbs go between the auxiliary and the participle, and they often signal the plus-que-parfait: **Il avait déjà fini.** **Je n’avais jamais pris l’avion.** **Elle n’était pas encore arrivée.**', 'Ces adverbes se placent entre l’auxiliaire et le participe, et ils annoncent souvent le plus-que-parfait : **Il avait déjà fini.** **Je n’avais jamais pris l’avion.** **Elle n’était pas encore arrivée.**')),
      mc(P.form, ['avait plu', 'a plu', 'pleuvait', 'aura plu'], { fr: 'Le matin, les rues étaient mouillées : il ___ toute la nuit.' }),
      mc(P.best, ['Je n’avais jamais vu la mer avant ce voyage.', 'Je n’ai jamais vu la mer avant ce voyage avait.', 'Je ne voyais jamais la mer avant avait.', 'Je n’avais jamais voir la mer.']),
      gap(P.completeText, 'Quand je ___ (arriver) au bureau, la réunion ___ (commencer). Mon collègue ___ (oublier) de me prévenir.', [['suis arrivé', 'suis arrivée'], ['avait commencé', 'avait déjà commencé'], ['avait oublié']]),
      ord(P.order, 'Elle était fatiguée parce qu’elle avait mal dormi.', { tr: 'She was tired because she had slept badly.' }),
      hear('Quand nous sommes arrivés, tout le monde était parti.', b('What happened first?', 'Qu’est-ce qui s’est passé en premier ?'), [b('Everyone left', 'Tout le monde est parti'), b('We arrived', 'Nous sommes arrivés'), b('Both at the same time', 'Les deux en même temps')]),
      dict('Je n’ai pas pu entrer : j’avais laissé mes clés au bureau.'),
      say('Quand je suis arrivé à la gare, le train était déjà parti.', 'When I got to the station, the train had already left.'),
    ],
    [
      b('Passé composé = events; imparfait = background; plus-que-parfait = earlier.', 'Passé composé = événements ; imparfait = décor ; plus-que-parfait = antériorité.'),
      b('Explains a past situation: parce qu’il avait plu.', 'Explique une situation passée : parce qu’il avait plu.'),
      b('déjà, jamais, pas encore often go with it.', 'déjà, jamais, pas encore l’accompagnent souvent.'),
    ],
    [['mouillé', b('wet', 'humide')], ['prévenir', b('to warn, to let know', 'avertir')], ['reconnaître', b('to recognise', 'identifier')]],
  ),

  lesson(C, 4, ['regrets-reported-speech-review', 'regret-discours-rapporte-bilan'],
    b('Regrets, reported speech and review', 'Regret, discours rapporté et bilan'),
    b('Si j’avais su… Il a dit qu’il avait fini. Then a story with three past tenses.', 'Si j’avais su… Il a dit qu’il avait fini. Puis un récit avec trois temps du passé.'),
    [b('Express regret with si + plus-que-parfait', 'Exprimer un regret avec si + plus-que-parfait'), b('Report past words', 'Rapporter des paroles passées'), b('Tell a story with three past tenses', 'Raconter avec trois temps du passé')],
    13,
    [
      card(b('Regret and reported speech', 'Le regret et le discours rapporté'), b('Regret: **Si j’avais su !** (If only I had known!), **Si tu m’avais écouté…** In reported speech, a passé composé becomes a plus-que-parfait after a past verb: **Il a dit : « J’ai fini. »** becomes **Il a dit qu’il avait fini.**', 'Le regret : **Si j’avais su !**, **Si tu m’avais écouté…** Au discours rapporté, un passé composé devient un plus-que-parfait après un verbe au passé : **Il a dit : « J’ai fini. »** devient **Il a dit qu’il avait fini.**'), {
        ex: [['Ah, si j’avais pris un parapluie !', 'Oh, if only I had taken an umbrella!'], ['Elle m’a dit qu’elle avait trouvé un travail.', 'She told me she had found a job.']],
      }),
      mc(P.form, ['avais su', 'savais', 'ai su', 'aurais su'], { fr: 'Ah, si j’___ que tu étais malade, je serais venu !' }),
      mc(P.best, ['Il m’a expliqué qu’il avait raté son bus.', 'Il m’a expliqué qu’il a raté son bus hier avait.', 'Il m’a expliqué qu’il rate son bus avait.', 'Il m’a expliqué qu’il avait rater son bus.']),
      gap(P.complete, 'Elle a dit : « J’ai perdu mes clés. » → Elle a dit qu’elle ___ ses clés. Ils ont annoncé : « Nous sommes rentrés. » → Ils ont annoncé qu’ils ___.', [['avait perdu'], ['étaient rentrés']]),
      dlg(b('A missed appointment', 'Un rendez-vous manqué'), b('Yanis tells Léa why he missed the dentist.', 'Yanis explique à Léa pourquoi il a manqué le dentiste.'), [['Léa', 'f'], ['Yanis', 'm']], [
        [0, 'Tu es allé chez le dentiste ce matin ?', 'Did you go to the dentist this morning?'],
        [1, { options: ['Non, j’avais oublié le rendez-vous !', 'Non, j’ai oublié le rendez-vous avait !', 'Non, j’avais oublier le rendez-vous !'] }],
        [0, 'Encore ? Tu l’avais pourtant noté.', 'Again? But you had written it down.'],
        [1, { options: ['Oui, mais j’avais laissé mon agenda au bureau.', 'Oui, mais j’étais laissé mon agenda au bureau.', 'Oui, mais j’avais laisser mon agenda au bureau.'] }],
        [0, 'Si tu avais mis une alarme sur ton téléphone…', 'If you had set an alarm on your phone…'],
      ]),
      write(b('A day that went wrong', 'Une journée qui a mal tourné'), b('In 50 to 80 words, tell a day that went wrong. Explain the causes with the plus-que-parfait (parce que j’avais oublié…) and end with a regret (si j’avais…).', 'En 50 à 80 mots, racontez une journée qui a mal tourné. Expliquez les causes avec le plus-que-parfait (parce que j’avais oublié…) et terminez par un regret (si j’avais…).'), 50, 80, [
        b('Two causes in the plus-que-parfait', 'Deux causes au plus-que-parfait'),
        b('Events in the passé composé, background in the imparfait', 'Événements au passé composé, décor à l’imparfait'),
        b('A regret with si + plus-que-parfait', 'Un regret avec si + plus-que-parfait'),
      ], 'Lundi dernier, tout est allé de travers. Mon réveil n’a pas sonné parce que j’avais oublié de le recharger. Je suis arrivé en retard à l’entretien et le directeur était déjà parti. En plus, il pleuvait et j’avais laissé mon parapluie dans le train. Le soir, j’étais vraiment déçu. Ah, si j’avais préparé mes affaires la veille !'),
      say('Si j’avais su, je serais parti plus tôt.', 'If I had known, I would have left earlier.'),
    ],
    [
      b('Regret: Si + plus-que-parfait ! (Si j’avais su !)', 'Regret : Si + plus-que-parfait ! (Si j’avais su !)'),
      b('Reported speech: passé composé → plus-que-parfait after a past verb.', 'Discours rapporté : passé composé → plus-que-parfait après un verbe au passé.'),
      b('With a consequence: si + plus-que-parfait, conditionnel passé (B2).', 'Avec une conséquence : si + plus-que-parfait, conditionnel passé (B2).'),
    ],
    [['aller de travers', b('to go wrong', 'mal se passer')], ['recharger', b('to recharge', 'remettre de l’énergie')], ['déçu', b('disappointed', 'triste parce que ce n’est pas comme prévu')]],
  ),
];
