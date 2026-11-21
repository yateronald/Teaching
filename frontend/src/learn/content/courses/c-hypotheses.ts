import type { CourseAbout } from '../../types';
import { b, card, conj, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Si tu gagnais au loto, qu’est-ce que tu ferais ? Et si on avait pris l’autre route ? Imagining, dreaming and regretting are a big part of conversation. This course trains the three si-clauses in real exchanges: possible plans (si + présent), dreams and imaginary situations (si + imparfait → conditionnel), and regrets about the past (si + plus-que-parfait → conditionnel passé), plus the expressions to speculate and to wonder aloud.',
    'Si tu gagnais au loto, qu’est-ce que tu ferais ? Et si on avait pris l’autre route ? Imaginer, rêver et regretter occupent une grande place dans la conversation. Ce cours entraîne les trois systèmes hypothétiques en situation : projets possibles (si + présent), rêves et situations imaginaires (si + imparfait → conditionnel), regrets sur le passé (si + plus-que-parfait → conditionnel passé), ainsi que les formules pour faire des suppositions et s’interroger à voix haute.',
  ),
  outcomes: [
    b('Talk about possible plans with si + présent', 'Parler de projets possibles avec si + présent'),
    b('Imagine with si + imparfait and the conditional', 'Imaginer avec si + imparfait et le conditionnel'),
    b('Express regrets with the past conditional', 'Exprimer des regrets au conditionnel passé'),
    b('Speculate and make guesses', 'Faire des suppositions'),
  ],
};

const C = 'c-hypotheses';
export default [
  lesson(C, 1, ['dreams-and-imaginary-situations', 'reves-et-situations-imaginaires'],
    b('Dreams and imaginary situations', 'Rêves et situations imaginaires'),
    b('Ask and answer « what would you do if… ? » questions.', 'Poser et répondre aux questions « que ferais-tu si… ? ».'),
    [b('Use si + imparfait → conditionnel', 'Employer si + imparfait → conditionnel'), b('Ask a hypothetical question', 'Poser une question hypothétique'), b('Develop your answer', 'Développer sa réponse')],
    13,
    [
      card(b('Imagining', 'Imaginer'), b('**Si + imparfait, conditionnel présent.** **Si je gagnais au loto, j’achèterais une maison au bord de la mer.** Ask: **Qu’est-ce que tu ferais si tu pouvais changer de métier ?** · **Si tu avais le choix, tu vivrais où ?** Develop: **…et puis je…**, **…surtout parce que…**', '**Si + imparfait, conditionnel présent.** **Si je gagnais au loto, j’achèterais une maison au bord de la mer.** Demander : **Qu’est-ce que tu ferais si tu pouvais changer de métier ?** · **Si tu avais le choix, tu vivrais où ?** Développer : **…et puis je…**, **…surtout parce que…**'), {
        ex: [['Si j’avais plus de temps, j’apprendrais le piano.', 'If I had more time, I’d learn the piano.'], ['Si tu pouvais dîner avec une personne célèbre, ce serait qui ?', 'If you could have dinner with a famous person, who would it be?']],
      }),
      conj('pouvoir', b('conditional present', 'conditionnel présent'), [['je', 'pourrais'], ['tu', 'pourrais'], ['il/elle', 'pourrait'], ['nous', 'pourrions'], ['vous', 'pourriez'], ['ils/elles', 'pourraient']], { given: [0] }),
      gap(P.complete, 'Si j’___ le choix, je ___ à Montréal.', ['avais', 'vivrais']),
      mc(P.form, ['Si on habitait plus près, on se verrait plus souvent.', 'Si on habiterait plus près, on se verrait plus souvent.', 'Si on habitait plus près, on se voit plus souvent hier.', 'Si on habite plus près, on se verrait hier.']),
      mc(P.best, ['Je partirais un an faire le tour du monde, et puis j’ouvrirais un petit café.', 'Je pars un an.', 'Je partais un an.', 'Je serai parti un an.'], { fr: '— Si tu ne devais plus jamais travailler, qu’est-ce que tu ferais ?' }),
      ord(P.order, 'Qu’est-ce que tu ferais si tu pouvais changer de métier ?', { tr: 'What would you do if you could change jobs?' }),
      say('Si je gagnais au loto, j’achèterais une petite maison au bord de la mer et j’inviterais tous mes amis.', 'If I won the lottery, I’d buy a little house by the sea and invite all my friends.'),
    ],
    [
      b('Si + imparfait → conditionnel présent.', 'Si + imparfait → conditionnel présent.'),
      b('Never put the conditional after si.', 'Jamais de conditionnel après si.'),
      b('Ask: Qu’est-ce que tu ferais si… ?', 'Demander : Qu’est-ce que tu ferais si… ?'),
    ],
    [['le loto', b('the lottery', 'jeu de hasard')], ['faire le tour du monde', b('to travel round the world', 'voyager partout')], ['célèbre', b('famous', 'connu de tous')]],
  ),
  lesson(C, 2, ['regrets-about-the-past', 'regrets-sur-le-passe'],
    b('Regrets about the past', 'Les regrets sur le passé'),
    b('Imagine how the past could have been different.', 'Imaginer comment le passé aurait pu être différent.'),
    [b('Use si + plus-que-parfait → conditionnel passé', 'Employer si + plus-que-parfait → conditionnel passé'), b('Express a regret', 'Exprimer un regret'), b('Mix past and present', 'Mélanger passé et présent')],
    13,
    [
      card(b('Past regrets', 'Les regrets passés'), b('**Si + plus-que-parfait, conditionnel passé.** **Si j’avais su, je serais venu(e) plus tôt.** · **Si on était partis à l’heure, on n’aurait pas raté le train.** Regret: **J’aurais dû…** · **J’aurais aimé…** · **Si seulement j’avais…!** Mixed: **Si j’avais fait médecine, je serais médecin aujourd’hui.**', '**Si + plus-que-parfait, conditionnel passé.** **Si j’avais su, je serais venu(e) plus tôt.** · **Si on était partis à l’heure, on n’aurait pas raté le train.** Regret : **J’aurais dû…** · **J’aurais aimé…** · **Si seulement j’avais…!** Mixte : **Si j’avais fait médecine, je serais médecin aujourd’hui.**')),
      gap(P.complete, 'Si on ___ partis plus tôt, on n’___ pas raté le début du film.', ['était', 'aurait']),
      mc(P.form, ['Si tu m’avais appelé, je serais venu t’aider.', 'Si tu m’aurais appelé, je serais venu t’aider.', 'Si tu m’appelais, je serais venu hier.', 'Si tu m’avais appelé, je viendrai t’aider.']),
      mc(P.best, ['J’aurais dû réserver plus tôt ! Si seulement j’avais écouté ma sœur…', 'Je dois réserver hier.', 'J’aurai dû réserver.', 'Si je réserve plus tôt, j’aurais eu une place.'], { fr: 'Le concert est complet, vous regrettez :' }),
      dlg(b('What if…?', 'Et si… ?'), undefined, [['Élise', 'f'], ['Vous', 'm']], [
        [0, 'Tu te rends compte ? Si je n’avais pas raté mon bus ce jour-là, on ne se serait jamais rencontrés.', 'Can you imagine? If I hadn’t missed my bus that day, we would never have met.'],
        [1, { options: ['C’est vrai ! Et si tu avais pris le suivant, tu serais arrivée trop tard.', 'C’est vrai ! Et si tu prendrais le suivant…', 'Oui, tu rates toujours le bus.'] }],
        [0, 'Comme quoi, un petit retard peut changer une vie !', 'Goes to show, a little delay can change a life!'],
      ]),
      pairs(P.match, [['J’aurais dû…', b('I should have…', 'regret')], ['Si seulement…!', b('If only…!', 'souhait sur le passé')], ['Si j’avais su…', b('Had I known…', 'regret classique')], ['Comme quoi…', b('Goes to show…', 'conclusion d’une histoire')]]),
      say('Si j’avais su, je serais venue plus tôt. J’aurais vraiment aimé voir le début.', 'If I’d known, I’d have come earlier. I would really have liked to see the beginning.'),
    ],
    [
      b('Si + plus-que-parfait → conditionnel passé.', 'Si + plus-que-parfait → conditionnel passé.'),
      b('Regret: J’aurais dû… J’aurais aimé… Si seulement…!', 'Regret : J’aurais dû… J’aurais aimé… Si seulement…!'),
      b('Mixed: past condition, present result (je serais médecin aujourd’hui).', 'Mixte : condition passée, résultat présent (je serais médecin aujourd’hui).'),
    ],
    [['se rendre compte', b('to realise', 'prendre conscience')], ['le suivant', b('the next one', 'celui d’après')], ['complet', b('sold out, full', 'plus de place')]],
  ),
  lesson(C, 3, ['speculating', 'faire-des-suppositions'],
    b('Speculating and guessing', 'Faire des suppositions'),
    b('Make guesses about what is happening or what happened, with the right degree of certainty.', 'Faire des suppositions sur ce qui se passe ou s’est passé, avec le bon degré de certitude.'),
    [b('Guess with devoir and the conditional', 'Supposer avec devoir et le conditionnel'), b('Express degrees of probability', 'Exprimer des degrés de probabilité'), b('Wonder aloud', 'S’interroger à voix haute')],
    13,
    [
      card(b('Guessing', 'Supposer'), b('Probable: **Il a dû oublier.** (he must have forgotten) · **Elle doit être en réunion.** Possible: **Il est possible qu’il soit malade.** (subjonctif) · **Il se peut que…** · **Peut-être qu’il a raté son train.** Wondering: **Je me demande si…** · **Ça m’étonnerait qu’il vienne.** · **Et si c’était une blague ?**', 'Probable : **Il a dû oublier.** · **Elle doit être en réunion.** Possible : **Il est possible qu’il soit malade.** (subjonctif) · **Il se peut que…** · **Peut-être qu’il a raté son train.** S’interroger : **Je me demande si…** · **Ça m’étonnerait qu’il vienne.** · **Et si c’était une blague ?**')),
      sort(b('Probable or just possible?', 'Probable ou seulement possible ?'), [b('probable', 'probable'), b('possible', 'possible')], [['Il a dû oublier.', 0], ['Il se peut qu’il soit en retard.', 1], ['Elle doit être chez elle.', 0], ['Peut-être qu’il a raté son train.', 1], ['Ils ont sûrement perdu l’adresse.', 0], ['Il est possible qu’elle ait changé d’avis.', 1]]),
      mc(P.best, ['Il a dû rester coincé dans les bouchons. Je me demande s’il a essayé d’appeler.', 'Il a sûrement déménagé à l’étranger.', 'Il ne viendra jamais, c’est sûr à 100 %.', 'Il doit venir hier.'], { fr: 'Votre ami a une heure de retard et ne répond pas :' }),
      gap(P.complete, 'Il se peut qu’elle ___ malade. Ça m’étonnerait qu’elle ___ oublié.', ['soit', 'ait']),
      hear('Les lumières sont éteintes et la voiture n’est plus là. Ils ont dû partir en week-end. À moins qu’ils soient simplement allés au cinéma… Je me demande s’ils ont pensé à fermer la fenêtre.', b('What does the speaker think is most likely?', 'Qu’est-ce que la personne trouve le plus probable ?'), [b('The neighbours have gone away for the weekend.', 'Les voisins sont partis en week-end.'), b('The neighbours are asleep.', 'Les voisins dorment.'), b('The car was stolen.', 'La voiture a été volée.'), b('The neighbours have moved.', 'Les voisins ont déménagé.')], { voice: 'f' }),
      pairs(P.match, [['Il a dû…', b('He must have…', 'forte probabilité')], ['Il se peut que…', b('It may be that…', 'possibilité')], ['Ça m’étonnerait que…', b('I’d be surprised if…', 'peu probable')], ['Je me demande si…', b('I wonder if…', 's’interroger')]]),
      say('Il a dû oublier notre rendez-vous. À moins qu’il soit coincé dans les bouchons… Je me demande s’il va appeler.', 'He must have forgotten our meeting. Unless he’s stuck in traffic… I wonder if he’ll call.'),
    ],
    [
      b('Probable: devoir (il a dû, elle doit être).', 'Probable : devoir (il a dû, elle doit être).'),
      b('Possible: il se peut que / il est possible que + subjonctif; peut-être que + indicatif.', 'Possible : il se peut que / il est possible que + subjonctif ; peut-être que + indicatif.'),
      b('Unlikely: Ça m’étonnerait que + subjonctif.', 'Peu probable : Ça m’étonnerait que + subjonctif.'),
    ],
    [['les bouchons', b('traffic jams', 'embouteillages')], ['changer d’avis', b('to change one’s mind', 'penser autrement')], ['à moins que', b('unless', 'sauf si')]],
  ),
];
