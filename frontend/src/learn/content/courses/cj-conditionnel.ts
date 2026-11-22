import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je voudrais un café. Tu devrais te reposer. Si j’avais le temps, je voyagerais. The present conditional is the tense of politeness, wishes, advice and imagination. It is easy to build if you know the future: same stem, imparfait endings. This course trains the forms, then each use in real situations, including the conditional of the news (unconfirmed facts) and the future in a past story.',
    'Je voudrais un café. Tu devrais te reposer. Si j’avais le temps, je voyagerais. Le conditionnel présent est le temps de la politesse, des souhaits, des conseils et de l’imaginaire. Il se construit facilement si vous connaissez le futur : même radical, terminaisons de l’imparfait. Ce cours entraîne les formes, puis chaque emploi en situation réelle, y compris le conditionnel de l’information (faits non confirmés) et le futur dans un récit au passé.',
  ),
  outcomes: [
    b('Form the conditional from the future stem', 'Former le conditionnel à partir du radical du futur'),
    b('Make polite requests and express wishes', 'Faire des demandes polies et exprimer des souhaits'),
    b('Give advice and make hypotheses with si', 'Donner des conseils et faire des hypothèses avec si'),
    b('Report unconfirmed news', 'Rapporter une information non confirmée'),
  ],
};

const C = 'cj-conditionnel';
const COND = b('conditionnel présent', 'conditionnel présent');

export default [
  lesson(C, 1, ['forming-the-conditional', 'former-le-conditionnel'],
    b('Future stem + imparfait endings', 'Radical du futur + terminaisons de l’imparfait'),
    b('Je parlerais, je serais, je pourrais: if you know the future, you know the conditional.', 'Je parlerais, je serais, je pourrais : si vous connaissez le futur, vous connaissez le conditionnel.'),
    [b('Build the conditional on the future stem', 'Construire le conditionnel sur le radical du futur'), b('Reuse the irregular stems', 'Réemployer les radicaux irréguliers'), b('Tell the future from the conditional', 'Distinguer le futur du conditionnel')],
    13,
    [
      card(b('A blend of two tenses', 'Un mélange de deux temps'), b('Take the **stem of the future** and add the **endings of the imparfait**. Endings: **-ais, -ais, -ait, -ions, -iez, -aient**. Regular: **parler → je parlerais**, **prendre → je prendrais**. Irregular, same stems as the future: **être → je serais, avoir → j’aurais, aller → j’irais, faire → je ferais, pouvoir → je pourrais, vouloir → je voudrais**.', 'Prenez le **radical du futur** et ajoutez les **terminaisons de l’imparfait**. Terminaisons : **-ais, -ais, -ait, -ions, -iez, -aient**. Réguliers : **parler → je parlerais**, **prendre → je prendrais**. Irréguliers, mêmes radicaux qu’au futur : **être → je serais, avoir → j’aurais, aller → j’irais, faire → je ferais, pouvoir → je pourrais, vouloir → je voudrais**.'), {
        table: {
          head: ['', 'aimer', 'être', 'pouvoir'],
          rows: [['je / j’', 'aimerais', 'serais', 'pourrais'], ['tu', 'aimerais', 'serais', 'pourrais'], ['il / elle', 'aimerait', 'serait', 'pourrait'], ['nous', 'aimerions', 'serions', 'pourrions'], ['vous', 'aimeriez', 'seriez', 'pourriez'], ['ils / elles', 'aimeraient', 'seraient', 'pourraient']],
        },
      }),
      trap(b('Future or conditional?', 'Futur ou conditionnel ?'), b('With je, only one letter separates them: **je ferai** (future, a decision) and **je ferais** (conditional, an idea). In careful speech, -rai sounds like « ré » and -rais like « rè ». In writing, ask yourself: is it certain, or does it depend on something?', 'Avec je, une seule lettre les sépare : **je ferai** (futur, une décision) et **je ferais** (conditionnel, une idée). Dans un discours soigné, -rai se prononce « ré » et -rais « rè ». À l’écrit, demandez-vous : est-ce certain, ou cela dépend-il de quelque chose ?')),
      conj('vouloir', COND, [['je', 'voudrais'], ['tu', 'voudrais'], ['il / elle', 'voudrait'], ['nous', 'voudrions'], ['vous', 'voudriez'], ['ils / elles', 'voudraient']], { given: [0] }),
      conj('finir', COND, [['je', 'finirais'], ['tu', 'finirais'], ['il / elle', 'finirait'], ['nous', 'finirions'], ['vous', 'finiriez'], ['ils / elles', 'finiraient']], { given: [0] }),
      mc(P.form, ['irions', 'allerions', 'irons', 'iraions'], { fr: 'Avec plus de vacances, nous ___ au Japon.' }),
      mc(P.form, ['aurait', 'avrait', 'aura', 'avait'], { fr: 'Sans ce problème, il ___ déjà fini.' }),
      sort(b('Future or conditional?', 'Futur ou conditionnel ?'), [b('future (-rai, -ra, -ront)', 'futur (-rai, -ra, -ront)'), b('conditional (-rais, -rait, -raient)', 'conditionnel (-rais, -rait, -raient)')], [['je viendrai', 0], ['je viendrais', 1], ['ils feront', 0], ['ils feraient', 1], ['elle saura', 0], ['elle saurait', 1]]),
      hear('Nous aimerions visiter la vieille ville.', b('What does it express?', 'Qu’est-ce que cela exprime ?'), [b('A wish', 'Un souhait'), b('A certain plan', 'Un projet certain'), b('A past habit', 'Une habitude passée')]),
      dict('Nous pourrions partir plus tôt et nous serions à Montréal avant midi.'),
      say('Je voudrais un café et un croissant, s’il vous plaît.', 'I would like a coffee and a croissant, please.'),
    ],
    [
      b('Conditional = future stem + -ais, -ais, -ait, -ions, -iez, -aient.', 'Conditionnel = radical du futur + -ais, -ais, -ait, -ions, -iez, -aient.'),
      b('Same irregular stems as the future: serais, aurais, irais, ferais, pourrais.', 'Mêmes radicaux irréguliers qu’au futur : serais, aurais, irais, ferais, pourrais.'),
      b('je ferai (future) / je ferais (conditional).', 'je ferai (futur) / je ferais (conditionnel).'),
    ],
    [['la vieille ville', b('the old town', 'le quartier historique')], ['un souhait', b('a wish', 'un désir')], ['un projet', b('a plan', 'une chose que l’on prévoit')]],
  ),

  lesson(C, 2, ['politeness-and-wishes', 'politesse-et-souhaits'],
    b('Politeness and wishes', 'La politesse et les souhaits'),
    b('Je voudrais, pourriez-vous, j’aimerais bien, ce serait génial.', 'Je voudrais, pourriez-vous, j’aimerais bien, ce serait génial.'),
    [b('Make polite requests', 'Faire des demandes polies'), b('Express wishes and dreams', 'Exprimer des souhaits et des rêves'), b('Soften what you say', 'Adoucir ses paroles')],
    13,
    [
      card(b('The polite tense', 'Le temps de la politesse'), b('The conditional makes a request softer and more polite. Requests: **Je voudrais un renseignement. Pourriez-vous m’aider ? Auriez-vous un moment ?** Wishes: **J’aimerais bien partir au Japon. Ce serait génial !** In a shop, **je voudrais** is the normal way to ask; **je veux** sounds abrupt.', 'Le conditionnel rend une demande plus douce et plus polie. Demandes : **Je voudrais un renseignement. Pourriez-vous m’aider ? Auriez-vous un moment ?** Souhaits : **J’aimerais bien partir au Japon. Ce serait génial !** Dans un magasin, **je voudrais** est la façon normale de demander ; **je veux** paraît brusque.'), {
        ex: [['Pourriez-vous parler un peu plus lentement ?', 'Could you speak a little more slowly?'], ['Ça vous dérangerait de fermer la fenêtre ?', 'Would you mind closing the window?'], ['J’aimerais tellement voir les aurores boréales.', 'I’d love to see the northern lights.']],
      }),
      mc(b('Which request is the most polite?', 'Quelle demande est la plus polie ?'), ['Pourriez-vous me dire où se trouve la mairie ?', 'Vous pouvez me dire où se trouve la mairie, vite ?', 'Dites-moi où est la mairie.', 'Je veux savoir où est la mairie.']),
      mc(P.form, ['aimerais', 'aimerai', 'aime', 'aimerait'], { fr: 'J’___ bien vous poser une question.' }),
      mc(P.form, ['Auriez', 'Aurez', 'Avez-vous', 'Avriez'], { fr: '___-vous cinq minutes pour moi ?' }),
      gap(P.complete, '___ (vous, pouvoir) m’envoyer le document ? Ce ___ (être) très gentil.', [['Pourriez-vous', 'Pourriez vous'], ['serait']]),
      pairs(b('Match each request with the situation.', 'Associez chaque demande à la situation.'), [['Je voudrais un aller simple pour Lyon.', b('at a ticket office', 'au guichet')], ['Pourriez-vous répéter, s’il vous plaît ?', b('on the phone', 'au téléphone')], ['Ça te dirait d’aller au cinéma ?', b('with a friend', 'avec un ami')]]),
      hear('Ça vous dérangerait de baisser la musique ?', b('What does the person want?', 'Que veut la personne ?'), [b('That you turn the music down', 'Que vous baissiez la musique'), b('That you turn it up', 'Que vous montiez le son'), b('To borrow your music', 'Emprunter votre musique')]),
      dlg(b('At the hotel reception', 'À la réception de l’hôtel'), b('A guest asks for help.', 'Une cliente demande de l’aide.'), [['Cliente', 'f'], ['Réceptionniste', 'm']], [
        [0, 'Bonjour monsieur. Je voudrais réserver une table pour ce soir.', 'Hello sir. I would like to book a table for tonight.'],
        [1, { options: ['Bien sûr. Vous préféreriez quel restaurant ?', 'Bien sûr. Vous préfériez quel restaurant demain ?', 'Bien sûr. Vous préférerez quel restaurant hier ?'] }],
        [0, 'Celui du port, si possible. Et pourriez-vous m’appeler un taxi à dix-neuf heures ?', 'The one by the harbour, if possible. And could you call me a taxi at seven?'],
        [1, { options: ['Avec plaisir. Ce serait pour combien de personnes ?', 'Avec plaisir. Ce sera pour combien de personnes hier ?', 'Avec plaisir. Ce serais pour combien de personnes ?'] }],
        [0, 'Pour deux. Merci beaucoup, vous êtes très aimable.', 'For two. Thank you very much, you are very kind.'],
      ]),
      say('Est-ce que vous pourriez m’aider à porter cette valise ?', 'Could you help me carry this suitcase?'),
    ],
    [
      b('Polite requests: je voudrais, pourriez-vous, auriez-vous.', 'Demandes polies : je voudrais, pourriez-vous, auriez-vous.'),
      b('Wishes: j’aimerais (bien), ce serait génial.', 'Souhaits : j’aimerais (bien), ce serait génial.'),
      b('Ça vous dérangerait de… ? = Would you mind…?', 'Ça vous dérangerait de… ? = une demande très polie.'),
    ],
    [['un renseignement', b('a piece of information', 'une information demandée')], ['la mairie', b('the town hall', 'le bâtiment de la municipalité')], ['un aller simple', b('a one-way ticket', 'un billet sans retour')]],
  ),

  lesson(C, 3, ['advice-and-hypotheses', 'conseils-et-hypotheses'],
    b('Advice and hypotheses', 'Les conseils et les hypothèses'),
    b('Tu devrais, à ta place je…, il vaudrait mieux, si + imparfait → conditionnel.', 'Tu devrais, à ta place je…, il vaudrait mieux, si + imparfait → conditionnel.'),
    [b('Give advice with the conditional', 'Donner des conseils avec le conditionnel'), b('Imagine with si + imparfait', 'Imaginer avec si + imparfait'), b('Never put the conditional after si', 'Ne jamais mettre le conditionnel après si')],
    13,
    [
      card(b('Advice and imagination', 'Le conseil et l’imaginaire'), b('Advice: **Tu devrais te reposer. À ta place, je dormirais un peu. Il vaudrait mieux partir tôt.** Hypothesis, the situation is not real now: **si + imparfait**, then the **conditional**: **Si j’avais le temps, je voyagerais.** **Si nous habitions à la mer, nous nagerions tous les jours.**', 'Le conseil : **Tu devrais te reposer. À ta place, je dormirais un peu. Il vaudrait mieux partir tôt.** L’hypothèse, la situation n’est pas réelle maintenant : **si + imparfait**, puis le **conditionnel** : **Si j’avais le temps, je voyagerais.** **Si nous habitions à la mer, nous nagerions tous les jours.**'), {
        ex: [['Si j’étais toi, j’accepterais ce poste.', 'If I were you, I would accept this job.'], ['Vous devriez réserver à l’avance.', 'You should book in advance.']],
      }),
      trap(b('Never the conditional after si', 'Jamais de conditionnel après si'), b('After **si**, the imparfait; the conditional goes in the other part: **Si j’avais de l’argent, j’achèterais une maison.** Never « si j’aurais ». Three combinations: **si + présent → futur** (real), **si + imparfait → conditionnel** (imagined), **si + plus-que-parfait → conditionnel passé** (too late).', 'Après **si**, l’imparfait ; le conditionnel va dans l’autre partie : **Si j’avais de l’argent, j’achèterais une maison.** Jamais « si j’aurais ». Trois combinaisons : **si + présent → futur** (réel), **si + imparfait → conditionnel** (imaginé), **si + plus-que-parfait → conditionnel passé** (trop tard).')),
      mc(P.form, ['devrais', 'devrait', 'dois-tu', 'devrai'], { fr: 'Tu tousses beaucoup : tu ___ voir un médecin.' }),
      mc(P.form, ['avais', 'aurais', 'auras', 'as eu'], { fr: 'Si j’___ une voiture, je t’emmènerais à la plage.' }),
      mc(P.form, ['parlerions', 'parlerons', 'parlons', 'parlions'], { fr: 'Si nous vivions à Montréal, nous ___ français tous les jours.' }),
      gap(P.complete, 'Si tu ___ (se coucher) plus tôt, tu ___ (être) moins fatigué. À ta place, je ___ (prendre) des vacances.', [['te couchais'], ['serais'], ['prendrais']]),
      ord(P.order, 'Si j’étais toi, j’appellerais tout de suite.', { tr: 'If I were you, I would call right away.' }),
      hear('Il vaudrait mieux attendre un peu.', b('What is the speaker doing?', 'Que fait la personne ?'), [b('Giving advice', 'Elle donne un conseil'), b('Making a promise', 'Elle fait une promesse'), b('Telling a memory', 'Elle raconte un souvenir')]),
      dict('Si nous avions un jardin, nous planterions des tomates et des fleurs.'),
      say('À ta place, je n’hésiterais pas une seconde.', 'If I were you, I wouldn’t hesitate for a second.'),
    ],
    [
      b('Advice: tu devrais, à ta place je + conditional, il vaudrait mieux.', 'Conseil : tu devrais, à ta place je + conditionnel, il vaudrait mieux.'),
      b('Hypothesis: si + imparfait → conditional.', 'Hypothèse : si + imparfait → conditionnel.'),
      b('Never si + conditional.', 'Jamais si + conditionnel.'),
    ],
    [['tousser', b('to cough', 'faire sortir l’air de la gorge avec bruit')], ['emmener', b('to take (someone somewhere)', 'conduire quelqu’un quelque part')], ['hésiter', b('to hesitate', 'ne pas savoir quoi décider')]],
  ),

  lesson(C, 4, ['news-future-in-the-past-review', 'information-futur-dans-le-passe-bilan'],
    b('News, the future in the past, and review', 'L’information, le futur dans le passé et bilan'),
    b('Selon la police, l’incendie serait accidentel. Il a dit qu’il viendrait.', 'Selon la police, l’incendie serait accidentel. Il a dit qu’il viendrait.'),
    [b('Report unconfirmed news', 'Rapporter une information non confirmée'), b('Use the future in a past story', 'Employer le futur dans un récit au passé'), b('Write a wish list', 'Écrire une liste de souhaits')],
    13,
    [
      card(b('Two more uses', 'Deux autres emplois'), b('The news uses the conditional for facts that are **not confirmed**: **Selon la police, l’incendie serait accidentel.** **Le ministre démissionnerait demain.** In a past story, the conditional is the **future seen from the past**: **Il a dit : « Je viendrai. »** becomes **Il a dit qu’il viendrait.**', 'L’information emploie le conditionnel pour des faits **non confirmés** : **Selon la police, l’incendie serait accidentel.** **Le ministre démissionnerait demain.** Dans un récit au passé, le conditionnel est le **futur vu du passé** : **Il a dit : « Je viendrai. »** devient **Il a dit qu’il viendrait.**'), {
        ex: [['D’après les médias, le concert serait annulé.', 'According to the media, the concert may be cancelled.'], ['Elle m’a promis qu’elle m’appellerait.', 'She promised me she would call me.']],
      }),
      doc({ title: 'Accident sur l’autoroute', text: 'Un camion s’est renversé ce matin sur l’autoroute 20. Selon les premiers témoins, le conducteur aurait perdu le contrôle à cause du verglas. Il n’y aurait pas de blessés graves. La circulation devrait reprendre normalement en fin de journée.', look: 'article' }, b('What does the journalist say about the cause?', 'Que dit le journaliste sur la cause ?'), [b('It is not confirmed: maybe the ice on the road', 'Elle n’est pas confirmée : peut-être le verglas'), b('It is certain: the driver was too fast', 'Elle est certaine : le conducteur roulait trop vite'), b('The police know the exact cause', 'La police connaît la cause exacte'), b('There is no information', 'Il n’y a aucune information')]),
      mc(b('Which form shows that the news is not confirmed?', 'Quelle forme montre que l’information n’est pas confirmée ?'), ['serait', 'sera', 'est', 'était'], { fr: 'Selon nos informations, le joueur ___ blessé au genou.' }),
      mc(P.form, ['viendrait', 'viendra', 'venait', 'vient'], { fr: 'La semaine dernière, Marc m’a dit qu’il ___ à la fête, mais il n’est pas venu.' }),
      gap(P.complete, 'Le guide nous a expliqué que la visite ___ (durer) deux heures et que nous ___ (pouvoir) prendre des photos.', [['durerait'], ['pourrions']]),
      write(b('Your wish list', 'Votre liste de souhaits'), b('In 40 to 70 words, imagine: if you had a year off and no money problems, what would you do? Use at least five verbs in the conditional and one si + imparfait.', 'En 40 à 70 mots, imaginez : si vous aviez une année libre et pas de problèmes d’argent, que feriez-vous ? Employez au moins cinq verbes au conditionnel et une phrase avec si + imparfait.'), 40, 70, [
        b('Five verbs in the conditional', 'Cinq verbes au conditionnel'),
        b('One sentence with si + imparfait', 'Une phrase avec si + imparfait'),
        b('Two irregular stems (ferais, irais, serais…)', 'Deux radicaux irréguliers (ferais, irais, serais…)'),
      ], 'Si j’avais une année libre, je ferais le tour du monde. D’abord, j’irais au Japon pour découvrir Kyoto. Ensuite, je traverserais le Canada en train. J’apprendrais aussi à jouer de la guitare et je lirais tous les livres que je n’ai jamais eu le temps de lire. Ce serait une année parfaite.'),
      dict('D’après la météo, il pourrait neiger demain sur les hauteurs.'),
      say('Il m’a promis qu’il m’aiderait à déménager.', 'He promised me he would help me move.'),
    ],
    [
      b('News: unconfirmed facts in the conditional (le suspect serait…).', 'Information : faits non confirmés au conditionnel (le suspect serait…).'),
      b('Future in the past: il a dit qu’il viendrait.', 'Futur dans le passé : il a dit qu’il viendrait.'),
      b('Selon, d’après + conditional = I am not sure.', 'Selon, d’après + conditionnel = ce n’est pas sûr.'),
    ],
    [['le verglas', b('black ice', 'une fine couche de glace sur la route')], ['un témoin', b('a witness', 'une personne qui a vu')], ['démissionner', b('to resign', 'quitter son poste')]],
  ),
];
