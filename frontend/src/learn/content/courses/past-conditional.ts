import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'J’aurais dû partir plus tôt. Si tu m’avais prévenu, je serais venu. The past conditional lets you imagine another past: regrets, reproaches, missed opportunities, and also unconfirmed information in the news (l’accident aurait fait trois blessés). This course teaches its formation, the third type of si clause, the key verbs devoir, pouvoir and vouloir, and the journalistic conditional.',
    'J’aurais dû partir plus tôt. Si tu m’avais prévenu, je serais venu. Le conditionnel passé permet d’imaginer un autre passé : regrets, reproches, occasions manquées, et aussi informations non confirmées dans l’actualité (l’accident aurait fait trois blessés). Ce cours présente sa formation, la troisième hypothèse avec si, les verbes clés devoir, pouvoir et vouloir, et le conditionnel journalistique.',
  ),
  outcomes: [
    b('Form the past conditional', 'Former le conditionnel passé'),
    b('Express regrets and reproaches with j’aurais dû / tu aurais pu', 'Exprimer regrets et reproches avec j’aurais dû / tu aurais pu'),
    b('Build si + plus-que-parfait, conditionnel passé', 'Construire si + plus-que-parfait, conditionnel passé'),
    b('Recognise the journalistic conditional', 'Reconnaître le conditionnel journalistique'),
  ],
};

const C = 'past-conditional';
export default [
  lesson(C, 1, ['forming-the-past-conditional', 'former-le-conditionnel-passe'],
    b('Forming the past conditional', 'Former le conditionnel passé'),
    b('Conditional of avoir or être + past participle.', 'Conditionnel présent de avoir ou être + participe passé.'),
    [b('Form the tense with avoir and être', 'Former le temps avec avoir et être'), b('Agree the participle with être', 'Accorder le participe avec être'), b('Express a wish about the past', 'Exprimer un souhait sur le passé')],
    13,
    [
      card(b('Auxiliary in the conditional', 'L’auxiliaire au conditionnel'), b('**j’aurais, tu aurais, il aurait, nous aurions, vous auriez, ils auraient** + participle; **je serais, tu serais, il serait…** + participle (with agreement). **J’aurais aimé voir ça. Elle serait venue.**', '**j’aurais, tu aurais, il aurait, nous aurions, vous auriez, ils auraient** + participe ; **je serais, tu serais, il serait…** + participe (avec accord). **J’aurais aimé voir ça. Elle serait venue.**'), {
        ex: [['J’aurais adoré être là.', 'I would have loved to be there.'], ['Nous serions partis plus tôt.', 'We would have left earlier.'], ['Ils auraient pris le train.', 'They would have taken the train.']],
      }),
      conj('venir', b('past conditional', 'conditionnel passé'), [['je', 'serais venu(e)'], ['tu', 'serais venu(e)'], ['elle', 'serait venue'], ['nous', 'serions venus'], ['vous', 'seriez venu(e)s'], ['ils', 'seraient venus']], { given: [0] }),
      mc(P.form, ['aurais voulu', 'aurai voulu', 'voudrais eu', 'serais voulu'], { fr: 'J’___ te voir avant ton départ.' }),
      mc(P.form, ['serait restée', 'aurait restée', 'serait resté', 'aurait resté'], { fr: 'Sans ce problème, elle ___ plus longtemps.' }),
      pairs(P.match, [['J’aurais aimé…', b('I would have liked…', 'souhait passé')], ['On aurait dit…', b('It looked like… / You’d have thought…', 'impression')], ['Qui l’aurait cru ?', b('Who would have thought?', 'surprise')], ['Tu aurais vu ça !', b('You should have seen it!', 'enthousiasme')]]),
      gap(P.complete, 'Avec plus de temps, nous ___ ___ (visiter) la Gaspésie.', ['aurions', 'visité']),
      say('J’aurais aimé apprendre le français plus tôt.', 'I would have liked to learn French earlier.'),
    ],
    [
      b('Past conditional = aurais / serais + past participle.', 'Conditionnel passé = aurais / serais + participe passé.'),
      b('Same auxiliary and agreements as the passé composé.', 'Même auxiliaire et mêmes accords qu’au passé composé.'),
      b('aurais (conditional) ≠ aurai (future).', 'aurais (conditionnel) ≠ aurai (futur).'),
    ],
    [['la Gaspésie', b('the Gaspé Peninsula', 'péninsule du Québec')], ['le départ', b('the departure', 'le moment où l’on part')], ['longtemps', b('a long time', 'une longue durée')]],
  ),
  lesson(C, 2, ['regrets-and-reproaches', 'regrets-et-reproches'],
    b('J’aurais dû, tu aurais pu: regrets and reproaches', 'J’aurais dû, tu aurais pu : regrets et reproches'),
    b('Use devoir, pouvoir and vouloir in the past conditional.', 'Employer devoir, pouvoir et vouloir au conditionnel passé.'),
    [b('Express regret with j’aurais dû', 'Exprimer un regret avec j’aurais dû'), b('Make a reproach with tu aurais pu', 'Faire un reproche avec tu aurais pu'), b('Respond to a reproach', 'Répondre à un reproche')],
    13,
    [
      card(b('Three useful verbs', 'Trois verbes utiles'), b('**J’aurais dû** + infinitive = I should have (regret). **Tu aurais pu** + infinitive = you could have (reproach). **J’aurais voulu** + infinitive = I would have wanted (wish). **Tu aurais pu me prévenir !**', '**J’aurais dû** + infinitif = regret. **Tu aurais pu** + infinitif = reproche. **J’aurais voulu** + infinitif = souhait. **Tu aurais pu me prévenir !**'), {
        ex: [['J’aurais dû écouter tes conseils.', 'I should have listened to your advice.'], ['Vous auriez pu m’appeler !', 'You could have called me!'], ['On n’aurait pas dû accepter.', 'We shouldn’t have accepted.']],
      }),
      sort(b('Regret or reproach?', 'Regret ou reproche ?'), [b('regret (about oneself)', 'regret (sur soi)'), b('reproach (to someone)', 'reproche (à quelqu’un)')], [['J’aurais dû réviser.', 0], ['Tu aurais pu m’attendre.', 1], ['Je n’aurais pas dû crier.', 0], ['Vous auriez dû me le dire.', 1], ['On aurait dû réserver.', 0], ['Il aurait pu s’excuser.', 1]]),
      mc(P.best, ['Tu aurais pu me prévenir !', 'Tu pourrais me prévenir hier !', 'Tu as pu me prévenir !', 'Tu aurais pouvoir me prévenir !'], { fr: 'Ton ami annule au dernier moment. Vous lui dites :' }),
      mc(P.meaning, [b('I should have taken an umbrella.', 'C’était une erreur de ne pas prendre de parapluie.'), b('I will take an umbrella.', 'Je prendrai un parapluie.'), b('I had to take an umbrella.', 'J’ai été obligé de prendre un parapluie.'), b('I could take an umbrella.', 'Je pourrais prendre un parapluie.')], { fr: 'J’aurais dû prendre un parapluie.' }),
      gap(P.complete, 'Nous ___ ___ partir plus tôt : il y avait des bouchons partout !', ['aurions', 'dû']),
      dlg(b('A late arrival', 'Un retard'), undefined, [['Collègue', 'f'], ['Vous', 'm']], [
        [0, 'Enfin ! La réunion a commencé il y a vingt minutes. Tu aurais pu envoyer un message.', 'Finally! The meeting started twenty minutes ago. You could have sent a message.'],
        [1, { options: ['Tu as raison, j’aurais dû te prévenir. Je suis désolé.', 'Tu as raison, je devrais te prévenir hier.', 'Tu as raison, j’ai dû te prévenir avant.'] }],
        [0, 'Bon, ce n’est pas grave. Qu’est-ce qui s’est passé ?', 'Well, never mind. What happened?'],
        [1, { options: ['Mon bus est tombé en panne. J’aurais dû prendre le métro !', 'Mon bus est tombé en panne. Je devais prendre le métro demain.', 'Mon bus est tombé en panne. J’aurai dû prendre le métro.'] }],
      ]),
      dict('Je n’aurais pas dû dépenser autant d’argent pendant les vacances.', { voice: 'f' }),
    ],
    [
      b('j’aurais dû + infinitive = I should have (regret).', 'j’aurais dû + infinitif = regret.'),
      b('tu aurais pu + infinitive = you could have (reproach).', 'tu aurais pu + infinitif = reproche.'),
      b('Negative: je n’aurais pas dû.', 'Négatif : je n’aurais pas dû.'),
    ],
    [['prévenir', b('to warn, to let know', 'avertir')], ['annuler', b('to cancel', 'supprimer')], ['dépenser', b('to spend', 'utiliser de l’argent')]],
  ),
  lesson(C, 3, ['si-clauses-and-the-news', 'si-et-l-actualite'],
    b('Si j’avais su…, and the news conditional', 'Si j’avais su…, et le conditionnel de l’actualité'),
    b('Build the third type of hypothesis and recognise unconfirmed information.', 'Construire la troisième hypothèse et reconnaître une information non confirmée.'),
    [b('Build si + plus-que-parfait + past conditional', 'Construire si + plus-que-parfait + conditionnel passé'), b('Mix past and present hypotheses', 'Mélanger hypothèses passées et présentes'), b('Recognise the journalistic conditional', 'Reconnaître le conditionnel journalistique')],
    13,
    [
      card(b('Hypothesis about the past', 'L’hypothèse sur le passé'), b('**Si + plus-que-parfait, conditionnel passé**: **Si j’avais su, je serais venu.** Mixed: a past condition with a present result: **Si j’avais accepté ce poste, je vivrais à Paris aujourd’hui.**', '**Si + plus-que-parfait, conditionnel passé** : **Si j’avais su, je serais venu.** Mixte : condition passée, conséquence présente : **Si j’avais accepté ce poste, je vivrais à Paris aujourd’hui.**'), {
        table: { head: [b('type', 'type'), 'si…', b('result', 'conséquence')], rows: [[b('real', 'réel'), 'présent', 'futur / présent'], [b('imaginary (present)', 'imaginaire (présent)'), 'imparfait', 'conditionnel présent'], [b('imaginary (past)', 'imaginaire (passé)'), 'plus-que-parfait', 'conditionnel passé']] },
      }),
      tip(b('The news conditional', 'Le conditionnel de l’actualité'), b('Journalists use the conditional for **unconfirmed** facts: **L’incendie aurait fait deux blessés** (= reportedly). **Le ministre serait sur le point de démissionner.**', 'Les journalistes emploient le conditionnel pour un fait **non confirmé** : **L’incendie aurait fait deux blessés**. **Le ministre serait sur le point de démissionner.**')),
      mc(P.best, ['Si tu m’avais demandé, je t’aurais aidé.', 'Si tu m’aurais demandé, je t’aurais aidé.', 'Si tu m’as demandé, je t’aurais aidé.', 'Si tu me demandais, je t’aurais aidé hier.']),
      mc(P.best, ['Si j’avais pris ce train, je serais déjà arrivé.', 'Si je prenais ce train, je serai déjà arrivé.', 'Si j’aurais pris ce train, je serais arrivé.', 'Si j’ai pris ce train, je serais arrivé.']),
      mc(P.meaning, [b('The fire reportedly injured two people (not confirmed).', 'L’incendie a fait deux blessés selon des informations non confirmées.'), b('The fire will injure two people.', 'L’incendie fera deux blessés.'), b('The fire should have injured two people.', 'L’incendie aurait dû faire deux blessés.'), b('Two people started the fire.', 'Deux personnes ont allumé l’incendie.')], { fr: 'L’incendie aurait fait deux blessés.' }),
      gap(P.complete, 'Si nous ___ (partir) à l’heure, nous ___ (ne pas rater) l’avion.', [['étions partis'], ['n’aurions pas raté']]),
      ord(P.order, 'Si j’avais su, je ne serais pas venu.', { tr: 'If I had known, I wouldn’t have come.' }),
      say('Si j’avais eu plus de temps, j’aurais visité Québec.', 'If I had had more time, I would have visited Québec City.'),
    ],
    [
      b('Si + plus-que-parfait, conditionnel passé (Si j’avais su, je serais venu).', 'Si + plus-que-parfait, conditionnel passé (Si j’avais su, je serais venu).'),
      b('Mixed: Si j’avais accepté, je vivrais à Paris aujourd’hui.', 'Mixte : Si j’avais accepté, je vivrais à Paris aujourd’hui.'),
      b('News conditional = unconfirmed (l’accident aurait fait…).', 'Conditionnel journalistique = non confirmé (l’accident aurait fait…).'),
    ],
    [['un blessé', b('an injured person', 'personne blessée')], ['démissionner', b('to resign', 'quitter son poste')], ['être sur le point de', b('to be about to', 'aller très bientôt')]],
  ),
];
