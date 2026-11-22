import type { CourseAbout } from '../../types';
import { b, card, conj, dict, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'J’aurais dû partir plus tôt. Si j’avais su, je serais venu. Selon la police, l’incendie aurait été accidentel. The past conditional speaks about what did not happen: regrets, reproaches, missed chances and imagined pasts. It is also the tense of unconfirmed past facts in the news. This course trains the forms, then each use, including the mixed hypotheses that link a past cause to a present result.',
    'J’aurais dû partir plus tôt. Si j’avais su, je serais venu. Selon la police, l’incendie aurait été accidentel. Le conditionnel passé parle de ce qui ne s’est pas produit : regrets, reproches, occasions manquées et passés imaginés. C’est aussi le temps des faits passés non confirmés dans l’information. Ce cours entraîne les formes, puis chaque emploi, y compris les hypothèses mixtes qui relient une cause passée à un résultat présent.',
  ),
  outcomes: [
    b('Form the past conditional', 'Former le conditionnel passé'),
    b('Express regrets and reproaches', 'Exprimer des regrets et des reproches'),
    b('Build si + plus-que-parfait hypotheses', 'Construire des hypothèses avec si + plus-que-parfait'),
    b('Report unconfirmed past facts', 'Rapporter des faits passés non confirmés'),
  ],
};

const C = 'cj-conditionnel-passe';
const CP = b('conditionnel passé', 'conditionnel passé');

export default [
  lesson(C, 1, ['forming-the-past-conditional', 'former-le-conditionnel-passe'],
    b('The auxiliary in the conditional + participle', 'L’auxiliaire au conditionnel + participe'),
    b('J’aurais aimé, elle serait venue, nous nous serions trompés.', 'J’aurais aimé, elle serait venue, nous nous serions trompés.'),
    [b('Conjugate avoir and être in the conditional', 'Conjuguer avoir et être au conditionnel'), b('Form the past conditional', 'Former le conditionnel passé'), b('Tell it apart from the futur antérieur', 'Le distinguer du futur antérieur')],
    13,
    [
      card(b('One more compound tense', 'Encore un temps composé'), b('Put the auxiliary in the **present conditional** and add the past participle, with the usual choice of avoir or être and the usual agreements. Avoir: **j’aurais aimé, tu aurais pu, ils auraient dû**. Être: **je serais venu, elle serait partie, nous nous serions trompés**.', 'Mettez l’auxiliaire au **conditionnel présent** et ajoutez le participe passé, avec le choix habituel d’avoir ou d’être et les accords habituels. Avoir : **j’aurais aimé, tu aurais pu, ils auraient dû**. Être : **je serais venu, elle serait partie, nous nous serions trompés**.'), {
        table: {
          head: ['', 'aimer', 'venir'],
          rows: [['je / j’', 'aurais aimé', 'serais venu'], ['tu', 'aurais aimé', 'serais venu'], ['il', 'aurait aimé', 'serait venu'], ['elle', 'aurait aimé', 'serait venue'], ['nous', 'aurions aimé', 'serions venus'], ['vous', 'auriez aimé', 'seriez venus'], ['ils', 'auraient aimé', 'seraient venus'], ['elles', 'auraient aimé', 'seraient venues']],
        },
      }),
      trap(b('Aurais or aurai?', 'Aurais ou aurai ?'), b('**j’aurai fini** (futur antérieur: it will be done) and **j’aurais fini** (past conditional: it would have been done, but it was not). One s changes everything. Ask yourself: did it really happen, or will it happen?', '**j’aurai fini** (futur antérieur : ce sera fait) et **j’aurais fini** (conditionnel passé : cela aurait été fait, mais ce n’est pas le cas). Un s change tout. Demandez-vous : est-ce que cela arrivera vraiment ?')),
      conj('pouvoir', CP, [['j’', 'aurais pu'], ['tu', 'aurais pu'], ['il / elle', 'aurait pu'], ['nous', 'aurions pu'], ['vous', 'auriez pu'], ['ils / elles', 'auraient pu']], { given: [0] }),
      conj('partir', CP, [['il', 'serait parti'], ['elle', 'serait partie'], ['nous (Hugo et moi)', 'serions partis'], ['vous (Emma et Jade)', 'seriez parties'], ['ils', 'seraient partis'], ['elles', 'seraient parties']], { given: [0] }),
      mc(P.form, ['aurions préféré', 'aurons préféré', 'préférerions', 'avions préféré'], { fr: 'Nous ___ un hôtel plus calme, mais il n’y avait plus de place.' }),
      mc(P.spelling, ['serait arrivée', 'aurait arrivée', 'serait arrivé', 'serai arrivée'], { fr: 'Sans la grève, Julie ___ à l’heure.' }),
      gap(P.complete, 'Avec un peu plus de temps, nous ___ (finir) le projet. Sans toi, je ___ (se perdre).', [['aurions fini'], ['me serais perdu', 'me serais perdue']]),
      hear('J’aurais adoré venir avec vous.', b('Did the person come?', 'La personne est-elle venue ?'), [b('No: it is a regret', 'Non : c’est un regret'), b('Yes, she came', 'Oui, elle est venue'), b('She will come later', 'Elle viendra plus tard')]),
      dict('Sans cette panne, nous serions arrivés avant la nuit.'),
      say('J’aurais aimé te le dire plus tôt.', 'I would have liked to tell you sooner.'),
    ],
    [
      b('Past conditional = avoir / être in the conditional + participle.', 'Conditionnel passé = avoir / être au conditionnel + participe.'),
      b('Same auxiliary and agreements as the passé composé.', 'Même auxiliaire et mêmes accords qu’au passé composé.'),
      b('j’aurai fini (it will happen) / j’aurais fini (it did not happen).', 'j’aurai fini (cela arrivera) / j’aurais fini (cela n’est pas arrivé).'),
    ],
    [['une grève', b('a strike', 'un arrêt de travail collectif')], ['une panne', b('a breakdown', 'un arrêt d’une machine')], ['se perdre', b('to get lost', 'ne plus trouver son chemin')]],
  ),

  lesson(C, 2, ['regrets-and-reproaches', 'regrets-et-reproches'],
    b('Regrets and reproaches', 'Les regrets et les reproches'),
    b('J’aurais dû, j’aurais aimé, tu aurais pu me prévenir, vous auriez mieux fait de…', 'J’aurais dû, j’aurais aimé, tu aurais pu me prévenir, vous auriez mieux fait de…'),
    [b('Express a regret', 'Exprimer un regret'), b('Make a reproach politely', 'Faire un reproche poliment'), b('React to someone’s regret', 'Réagir au regret de quelqu’un')],
    13,
    [
      card(b('What did not happen', 'Ce qui ne s’est pas produit'), b('Regret: **J’aurais dû étudier davantage. J’aurais aimé connaître mon grand-père.** Reproach: **Tu aurais pu m’appeler ! Vous auriez dû prévenir.** Advice that comes too late: **Tu aurais mieux fait de prendre le train.**', 'Le regret : **J’aurais dû étudier davantage. J’aurais aimé connaître mon grand-père.** Le reproche : **Tu aurais pu m’appeler ! Vous auriez dû prévenir.** Le conseil qui arrive trop tard : **Tu aurais mieux fait de prendre le train.**'), {
        ex: [['J’aurais dû écouter tes conseils.', 'I should have listened to your advice.'], ['Tu aurais pu me prévenir que tu serais en retard !', 'You could have told me you’d be late!']],
      }),
      pairs(b('Match each sentence with its meaning.', 'Associez chaque phrase à son sens.'), [['J’aurais dû partir plus tôt.', b('a regret', 'un regret')], ['Tu aurais pu m’aider !', b('a reproach', 'un reproche')], ['Il aurait mieux fait de se taire.', b('advice that comes too late', 'un conseil trop tard')]]),
      mc(P.form, ['aurais dû', 'aurai dû', 'devrais', 'avais dû'], { fr: 'Il pleut et j’ai oublié mon parapluie : j’___ regarder la météo.' }),
      mc(P.form, ['aurais pu', 'pourrais', 'auras pu', 'as pu'], { fr: 'Tu ___ me dire que tu ne venais pas !' }),
      mc(P.best, ['Vous auriez mieux fait de réserver à l’avance.', 'Vous aurez mieux fait de réserver à l’avance.', 'Vous auriez mieux faire de réserver à l’avance.', 'Vous auriez fait mieux réserver à l’avance.']),
      gap(P.complete, 'Elle ___ (devoir) accepter ce poste. Nous ___ (aimer) vous voir plus souvent.', [['aurait dû'], ['aurions aimé']]),
      hear('Vous auriez pu fermer la porte !', b('What is the tone?', 'Quel est le ton ?'), [b('A reproach', 'Un reproche'), b('A compliment', 'Un compliment'), b('A question about the future', 'Une question sur le futur')]),
      dict('J’aurais aimé voyager davantage quand j’étais étudiant.'),
      say('Tu aurais dû me demander, je t’aurais aidé avec plaisir.', 'You should have asked me, I would gladly have helped you.'),
    ],
    [
      b('Regret: j’aurais dû, j’aurais aimé, j’aurais voulu.', 'Regret : j’aurais dû, j’aurais aimé, j’aurais voulu.'),
      b('Reproach: tu aurais pu, vous auriez dû.', 'Reproche : tu aurais pu, vous auriez dû.'),
      b('Too late: tu aurais mieux fait de + infinitive.', 'Trop tard : tu aurais mieux fait de + infinitif.'),
    ],
    [['davantage', b('more', 'plus')], ['se taire', b('to keep quiet', 'ne rien dire')], ['un poste', b('a job, a position', 'un emploi')]],
  ),

  lesson(C, 3, ['si-and-the-plus-que-parfait', 'si-et-le-plus-que-parfait'],
    b('Si + plus-que-parfait', 'Si + plus-que-parfait'),
    b('Si j’avais su, je serais venu. And the mixed form: si j’avais pris le train, je serais déjà là.', 'Si j’avais su, je serais venu. Et la forme mixte : si j’avais pris le train, je serais déjà là.'),
    [b('Build an unreal past hypothesis', 'Construire une hypothèse passée irréelle'), b('Link a past cause to a present result', 'Relier une cause passée à un résultat présent'), b('Choose among the three si patterns', 'Choisir parmi les trois structures avec si')],
    13,
    [
      card(b('Too late to change it', 'Trop tard pour le changer'), b('To imagine a different past: **si + plus-que-parfait**, then the **past conditional**: **Si j’avais su, je serais venu.** **Si tu avais pris ton parapluie, tu n’aurais pas été mouillé.** When the result is in the present, use the present conditional: **Si j’avais pris le train, je serais déjà à Paris.**', 'Pour imaginer un autre passé : **si + plus-que-parfait**, puis le **conditionnel passé** : **Si j’avais su, je serais venu.** **Si tu avais pris ton parapluie, tu n’aurais pas été mouillé.** Quand le résultat est présent, employez le conditionnel présent : **Si j’avais pris le train, je serais déjà à Paris.**'), {
        ex: [['Si nous étions partis plus tôt, nous n’aurions pas raté l’avion.', 'If we had left earlier, we wouldn’t have missed the plane.'], ['Si elle avait accepté ce poste, elle habiterait à Montréal maintenant.', 'If she had accepted that job, she would live in Montreal now.']],
      }),
      tip(b('The three si patterns', 'Les trois structures avec si'), b('Real: **si + présent → futur** (Si tu viens, on ira au cinéma.) Imagined now: **si + imparfait → conditionnel présent** (Si tu venais, on irait…) Imagined past: **si + plus-que-parfait → conditionnel passé** (Si tu étais venu, on serait allés…). Never a conditional right after si.', 'Réel : **si + présent → futur** (Si tu viens, on ira au cinéma.) Imaginé maintenant : **si + imparfait → conditionnel présent** (Si tu venais, on irait…) Passé imaginé : **si + plus-que-parfait → conditionnel passé** (Si tu étais venu, on serait allés…). Jamais de conditionnel juste après si.')),
      sort(b('Which pattern?', 'Quelle structure ?'), [b('real: si + présent', 'réel : si + présent'), b('imagined now: si + imparfait', 'imaginé : si + imparfait'), b('imagined past: si + plus-que-parfait', 'passé imaginé : si + plus-que-parfait')], [['Si tu as faim, mange.', 0], ['Si j’étais riche, j’achèterais un bateau.', 1], ['Si j’avais su, je serais resté.', 2], ['S’il pleut, on restera ici.', 0], ['Si nous habitions ici, nous serions heureux.', 1], ['Si tu m’avais écouté, tu aurais réussi.', 2]]),
      mc(P.form, ['aurais réussi', 'réussirais', 'aurai réussi', 'avais réussi'], { fr: 'Si tu avais travaillé davantage, tu ___ ton examen.' }),
      mc(P.form, ['avais pris', 'aurais pris', 'prenais', 'as pris'], { fr: 'Si j’___ un taxi, je serais arrivé à temps.' }),
      mc(P.form, ['serais', 'aurais été', 'serai', 'étais'], { fr: 'Si j’avais accepté ce travail, je ___ riche aujourd’hui.' }),
      gap(P.complete, 'Si nous ___ (réserver) plus tôt, nous ___ (avoir) de meilleures places.', [['avions réservé'], ['aurions eu']]),
      ord(P.order, 'Si tu m’avais prévenu, je serais venu te chercher.', { tr: 'If you had told me, I would have come to pick you up.' }),
      dict('Si nous avions su que la route était fermée, nous aurions pris un autre chemin.'),
      say('Si j’avais su, je ne serais pas venu.', 'If I had known, I wouldn’t have come.'),
    ],
    [
      b('Imagined past: si + plus-que-parfait → past conditional.', 'Passé imaginé : si + plus-que-parfait → conditionnel passé.'),
      b('Mixed: si + plus-que-parfait → present conditional (result now).', 'Mixte : si + plus-que-parfait → conditionnel présent (résultat présent).'),
      b('Never a conditional right after si.', 'Jamais de conditionnel juste après si.'),
    ],
    [['être mouillé', b('to get wet', 'être trempé')], ['à temps', b('in time', 'pas trop tard')], ['venir chercher', b('to come and pick up', 'venir prendre quelqu’un')]],
  ),

  lesson(C, 4, ['news-and-review', 'information-et-bilan'],
    b('Unconfirmed past facts and review', 'Les faits passés non confirmés et bilan'),
    b('Selon les témoins, le conducteur aurait perdu le contrôle. Then your own regrets in writing.', 'Selon les témoins, le conducteur aurait perdu le contrôle. Puis vos propres regrets à l’écrit.'),
    [b('Report unconfirmed past facts', 'Rapporter des faits passés non confirmés'), b('Read a news brief', 'Lire une brève'), b('Write about a regret', 'Écrire sur un regret')],
    13,
    [
      card(b('The conditional of the news', 'Le conditionnel de l’information'), b('Journalists use the past conditional for **past facts that are not confirmed**: **Selon les témoins, le conducteur aurait perdu le contrôle.** **Le suspect se serait enfui par la fenêtre.** It often follows **selon, d’après, de source policière**.', 'Les journalistes emploient le conditionnel passé pour les **faits passés non confirmés** : **Selon les témoins, le conducteur aurait perdu le contrôle.** **Le suspect se serait enfui par la fenêtre.** Il suit souvent **selon, d’après, de source policière**.')),
      doc({ title: 'Cambriolage au musée', text: 'Un tableau de grande valeur a disparu cette nuit au musée des Beaux-Arts. Selon nos informations, les voleurs seraient entrés par le toit vers deux heures du matin. Ils auraient désactivé l’alarme en quelques minutes. La police n’a pas encore confirmé ces détails.', look: 'article' }, b('What is certain in this article?', 'Qu’est-ce qui est certain dans cet article ?'), [b('A painting has disappeared', 'Un tableau a disparu'), b('The thieves came in through the roof', 'Les voleurs sont entrés par le toit'), b('They switched off the alarm', 'Ils ont désactivé l’alarme'), b('The police confirmed everything', 'La police a tout confirmé')]),
      mc(P.form, ['aurait été', 'a été', 'serait été', 'aura été'], { fr: 'D’après la presse, le contrat ___ signé hier soir, mais personne ne le confirme.' }),
      gap(P.complete, 'Selon des témoins, l’incendie ___ (commencer) dans la cuisine. Les habitants ___ (sortir) à temps.', [['aurait commencé'], ['seraient sortis']]),
      hear('Le ministre aurait démissionné ce matin.', b('Is the information confirmed?', 'L’information est-elle confirmée ?'), [b('No: the conditional shows it is not confirmed', 'Non : le conditionnel montre qu’elle n’est pas confirmée'), b('Yes, it is official', 'Oui, c’est officiel'), b('It will happen tomorrow', 'Cela arrivera demain')]),
      write(b('A regret', 'Un regret'), b('In 50 to 80 words, write about a decision you regret or a chance you missed. Imagine what would have happened if you had acted differently.', 'En 50 à 80 mots, écrivez sur une décision que vous regrettez ou une occasion que vous avez manquée. Imaginez ce qui se serait passé si vous aviez agi autrement.'), 50, 80, [
        b('One regret with j’aurais dû or j’aurais aimé', 'Un regret avec j’aurais dû ou j’aurais aimé'),
        b('One si + plus-que-parfait → past conditional', 'Une phrase si + plus-que-parfait → conditionnel passé'),
        b('One mixed hypothesis (result now)', 'Une hypothèse mixte (résultat présent)'),
      ], 'Quand j’avais vingt ans, on m’a proposé un stage à Londres, mais j’ai refusé parce que j’avais peur. J’aurais dû accepter. Si j’étais parti, j’aurais appris l’anglais beaucoup plus vite et j’aurais rencontré des gens du monde entier. Aujourd’hui, je parlerais sans doute trois langues. Mais si j’étais parti, je n’aurais pas rencontré ma femme !'),
      say('D’après la radio, l’accident aurait fait trois blessés.', 'According to the radio, the accident may have injured three people.'),
    ],
    [
      b('News: unconfirmed past facts in the past conditional.', 'Information : faits passés non confirmés au conditionnel passé.'),
      b('Selon, d’après + past conditional = not confirmed.', 'Selon, d’après + conditionnel passé = non confirmé.'),
      b('Regret + hypothesis: j’aurais dû…, si j’avais…, j’aurais…', 'Regret + hypothèse : j’aurais dû…, si j’avais…, j’aurais…'),
    ],
    [['un cambriolage', b('a burglary', 'un vol dans un lieu')], ['s’enfuir', b('to run away', 'partir en courant')], ['un stage', b('an internship', 'une période de formation en entreprise')]],
  ),
];
