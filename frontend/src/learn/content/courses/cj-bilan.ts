import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, hear, lesson, mc, ord, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'You know the forms; now the real question is which tense to choose. This review course puts the tenses side by side, the way they appear in real texts: the four past tenses of a story, the four ways to talk about the future, the three si patterns, and the choice between indicative and subjunctive. Every lesson ends with a full text to complete, so you train the decision, not just the forms.',
    'Vous connaissez les formes ; la vraie question est maintenant de choisir le bon temps. Ce cours de révision met les temps côte à côte, tels qu’ils apparaissent dans de vrais textes : les quatre temps du passé d’un récit, les quatre façons de parler du futur, les trois structures avec si, et le choix entre indicatif et subjonctif. Chaque leçon se termine par un texte complet à compléter : vous entraînez la décision, pas seulement les formes.',
  ),
  outcomes: [
    b('Combine the past tenses in a story', 'Combiner les temps du passé dans un récit'),
    b('Choose the right way to talk about the future', 'Choisir la bonne façon de parler du futur'),
    b('Master the three si patterns', 'Maîtriser les trois structures avec si'),
    b('Choose between indicative and subjunctive', 'Choisir entre indicatif et subjonctif'),
  ],
};

const C = 'cj-bilan';

export default [
  lesson(C, 1, ['past-tenses-together', 'temps-du-passe-ensemble'],
    b('The past tenses together', 'Les temps du passé ensemble'),
    b('Passé composé, imparfait, plus-que-parfait and venais de in one story.', 'Passé composé, imparfait, plus-que-parfait et venais de dans un même récit.'),
    [b('Give each past tense its role', 'Donner à chaque temps du passé son rôle'), b('Complete a story with four past tenses', 'Compléter un récit avec quatre temps du passé'), b('Hear the tenses in a recording', 'Entendre les temps dans un enregistrement')],
    13,
    [
      card(b('Four roles in a story', 'Quatre rôles dans un récit'), b('Each past tense has a role. Choose by asking what the verb does in the story.', 'Chaque temps du passé a un rôle. Choisissez en vous demandant ce que fait le verbe dans le récit.'), {
        table: {
          head: [b('tense', 'temps'), b('role', 'rôle'), b('example', 'exemple')],
          rows: [
            [b('passé composé', 'passé composé'), b('the events', 'les événements'), 'Il a ouvert la porte.'],
            [b('imparfait', 'imparfait'), b('background, habit', 'décor, habitude'), 'Il pleuvait.'],
            [b('plus-que-parfait', 'plus-que-parfait'), b('earlier', 'antériorité'), 'Il avait oublié ses clés.'],
            ['venais de + inf.', b('just before', 'juste avant'), 'Je venais de rentrer.'],
          ],
        },
        ex: [['Je venais de m’endormir quand le téléphone a sonné : ma sœur avait raté son train.', 'I had just fallen asleep when the phone rang: my sister had missed her train.']],
      }),
      sort(b('Which role does each verb play?', 'Quel rôle joue chaque verbe ?'), [b('event', 'événement'), b('background', 'décor'), b('earlier', 'antériorité')], [['elle a crié', 0], ['la maison était silencieuse', 1], ['quelqu’un avait cassé la vitre', 2], ['nous sommes sortis', 0], ['il faisait très froid', 1], ['ils étaient déjà partis', 2]]),
      mc(P.form, ['avait laissé', 'a laissé', 'laissait', 'laisse'], { fr: 'Je n’ai pas pu entrer chez moi : mon colocataire ___ la clé à l’intérieur.' }),
      mc(P.form, ['venions d’arriver', 'sommes venus d’arriver', 'venons d’arriver', 'étions venus d’arriver'], { fr: 'Nous ___ quand l’orage a éclaté.' }),
      gap(P.completeText, 'Ce matin-là, il ___ (neiger) depuis des heures. Je ___ (venir de + se lever) quand mon chef ___ (appeler) : l’usine ___ (fermer) à cause de la tempête, et personne ne m’___ (prévenir) la veille.', [['neigeait'], ['venais de me lever'], ['a appelé'], ['avait fermé', 'était fermée'], ['avait prévenu']]),
      hear('Quand je suis arrivée, la réunion avait commencé et tout le monde prenait des notes.', b('What had already started?', 'Qu’est-ce qui avait déjà commencé ?'), [b('The meeting', 'La réunion'), b('The note-taking only', 'La prise de notes seulement'), b('Nothing', 'Rien')]),
      dict('Il pleuvait depuis la veille et la rivière avait débordé pendant la nuit.'),
      say('Je venais de fermer la porte quand j’ai compris que j’avais oublié mes clés.', 'I had just closed the door when I realised I had forgotten my keys.'),
    ],
    [
      b('Passé composé: events; imparfait: background and habits.', 'Passé composé : événements ; imparfait : décor et habitudes.'),
      b('Plus-que-parfait: earlier; venais de: just before.', 'Plus-que-parfait : antériorité ; venais de : juste avant.'),
      b('Ask what the verb does in the story, not only when it happened.', 'Demandez-vous ce que fait le verbe dans le récit, pas seulement quand.'),
    ],
    [['un orage', b('a thunderstorm', 'une tempête avec éclairs')], ['une usine', b('a factory', 'un lieu de production')], ['déborder', b('to overflow', 'sortir de son lit')]],
  ),

  lesson(C, 2, ['ways-to-talk-about-the-future', 'facons-de-parler-du-futur'],
    b('Four ways to talk about the future', 'Quatre façons de parler du futur'),
    b('Le train part à huit heures, je vais partir, je partirai, je serai parti.', 'Le train part à huit heures, je vais partir, je partirai, je serai parti.'),
    [b('Use the present for timetables', 'Employer le présent pour les horaires'), b('Choose between near future and future', 'Choisir entre futur proche et futur simple'), b('Place the futur antérieur', 'Placer le futur antérieur')],
    13,
    [
      card(b('From the timetable to the deadline', 'De l’horaire à l’échéance'), b('The **present** for a timetable or a fixed plan: **Le train part à huit heures.** The **near future** for an intention or what is about to happen: **Je vais déménager.** The **future** for predictions, promises, formal plans: **Il fera beau. Je t’écrirai.** The **futur antérieur** for what will be done before another moment: **D’ici lundi, j’aurai fini.**', 'Le **présent** pour un horaire ou un programme fixé : **Le train part à huit heures.** Le **futur proche** pour une intention ou ce qui va arriver : **Je vais déménager.** Le **futur simple** pour les prévisions, les promesses, les projets officiels : **Il fera beau. Je t’écrirai.** Le **futur antérieur** pour ce qui sera fait avant un autre moment : **D’ici lundi, j’aurai fini.**')),
      tip(b('And the future seen from the past', 'Et le futur vu du passé'), b('In a past story, the future becomes the **conditional**: **Elle a promis qu’elle viendrait.** The futur antérieur becomes the past conditional: **Il a dit qu’il aurait fini avant midi.**', 'Dans un récit au passé, le futur devient le **conditionnel** : **Elle a promis qu’elle viendrait.** Le futur antérieur devient le conditionnel passé : **Il a dit qu’il aurait fini avant midi.**')),
      sort(b('Which form fits best?', 'Quelle forme convient le mieux ?'), [b('present: timetable', 'présent : horaire'), b('near future: intention', 'futur proche : intention'), b('future: prediction, promise', 'futur : prévision, promesse'), b('futur antérieur: done before', 'futur antérieur : fait avant')], [['Le cours commence à neuf heures.', 0], ['Je vais m’inscrire à la salle de sport.', 1], ['Demain, il neigera sur les montagnes.', 2], ['À minuit, nous aurons tout rangé.', 3], ['L’avion décolle à seize heures.', 0], ['Je te rembourserai la semaine prochaine.', 2]]),
      mc(P.form, ['aurai envoyé', 'enverrai', 'envoie', 'enverrais'], { fr: 'Je vous appellerai dès que j’___ le devis.' }),
      mc(P.form, ['viendrait', 'viendra', 'vient', 'venait'], { fr: 'Le mois dernier, il m’a juré qu’il ___ à mon mariage, mais il n’est pas venu.' }),
      gap(P.completeText, 'Bonjour à tous ! La réunion ___ (avoir lieu) jeudi. D’ici là, chacun ___ (lire) le rapport. Quand nous ___ (finir) la présentation, nous ___ (voter).', [['aura lieu', 'a lieu'], ['aura lu', 'lira'], ['aurons fini'], ['voterons']]),
      hear('Ne t’inquiète pas, quand tu rentreras, j’aurai préparé le dîner.', b('What will be ready when you come home?', 'Qu’est-ce qui sera prêt à votre retour ?'), [b('Dinner', 'Le dîner'), b('Nothing yet', 'Rien encore'), b('Your room', 'Votre chambre')]),
      dict('Quand vous aurez reçu votre badge, vous pourrez accéder au bâtiment.'),
      say('Je vais changer de travail : d’ici l’été, j’aurai trouvé quelque chose.', 'I’m going to change jobs: by the summer, I’ll have found something.'),
    ],
    [
      b('Present: timetables; near future: intentions; future: predictions and promises.', 'Présent : horaires ; futur proche : intentions ; futur : prévisions et promesses.'),
      b('Futur antérieur: done before another future moment.', 'Futur antérieur : fait avant un autre moment futur.'),
      b('In a past story: future → conditional.', 'Dans un récit au passé : futur → conditionnel.'),
    ],
    [['un devis', b('a quote, an estimate', 'un prix proposé à l’avance')], ['décoller', b('to take off', 'quitter le sol')], ['rembourser', b('to pay back', 'rendre l’argent')]],
  ),

  lesson(C, 3, ['the-three-si-patterns', 'les-trois-structures-avec-si'],
    b('The three si patterns', 'Les trois structures avec si'),
    b('Real, imagined now, imagined past: and the mixed patterns.', 'Réel, imaginé maintenant, passé imaginé : et les structures mixtes.'),
    [b('Tell real from imagined conditions', 'Distinguer les conditions réelles et imaginées'), b('Use the mixed patterns', 'Employer les structures mixtes'), b('Never put the conditional after si', 'Ne jamais mettre le conditionnel après si')],
    13,
    [
      card(b('Three patterns, one rule', 'Trois structures, une règle'), b('Real: **si + présent → futur** (Si tu viens, on ira au cinéma.) Imagined now: **si + imparfait → conditionnel présent** (Si j’étais riche, je voyagerais.) Imagined past: **si + plus-que-parfait → conditionnel passé** (Si j’avais su, je serais venu.) Mixed, a past cause and a present result: **Si j’avais pris le train, je serais déjà là.** The rule: never a conditional right after si.', 'Réel : **si + présent → futur** (Si tu viens, on ira au cinéma.) Imaginé maintenant : **si + imparfait → conditionnel présent** (Si j’étais riche, je voyagerais.) Passé imaginé : **si + plus-que-parfait → conditionnel passé** (Si j’avais su, je serais venu.) Mixte, une cause passée et un résultat présent : **Si j’avais pris le train, je serais déjà là.** La règle : jamais de conditionnel juste après si.')),
      sort(b('Which pattern?', 'Quelle structure ?'), [b('real', 'réel'), b('imagined now', 'imaginé maintenant'), b('imagined past', 'passé imaginé'), b('mixed: past cause, present result', 'mixte : cause passée, résultat présent')], [['S’il fait beau, on ira pique-niquer.', 0], ['Si j’avais un jardin, je planterais des tomates.', 1], ['Si tu m’avais appelé, je serais venu.', 2], ['Si elle avait accepté ce poste, elle vivrait à Lyon.', 3], ['Si vous réservez ce soir, vous aurez une réduction.', 0], ['Si nous étions partis à l’heure, nous ne serions pas en retard.', 3]]),
      mc(P.form, ['avais', 'aurais', 'aurai', 'ai eu'], { fr: 'Si j’___ plus de temps, j’apprendrais le piano.' }),
      mc(P.form, ['serions', 'serons', 'aurions été', 'étions'], { fr: 'Si nous avions acheté cette maison, nous ___ propriétaires aujourd’hui.' }),
      mc(P.form, ['aurais vu', 'aurai vu', 'verrais', 'avais vu'], { fr: 'Si tu étais venu hier, tu ___ le spectacle.' }),
      gap(P.complete, 'S’il ___ (pleuvoir) demain, nous ___ (rester) à la maison. Si je ___ (savoir) parler chinois, je ___ (travailler) à Shanghai.', [['pleut'], ['resterons'], ['savais'], ['travaillerais']]),
      ord(P.order, 'Si tu avais écouté mes conseils, tu ne serais pas dans cette situation.', { tr: 'If you had listened to my advice, you wouldn’t be in this situation.' }),
      hear('Si on avait réservé, on aurait eu une table en terrasse.', b('Did they book?', 'Ont-ils réservé ?'), [b('No, and they did not get a terrace table', 'Non, et ils n’ont pas eu de table en terrasse'), b('Yes, they got a terrace table', 'Oui, ils ont eu une table en terrasse'), b('They will book tomorrow', 'Ils réserveront demain')]),
      dict('Si nous avions mieux préparé le voyage, nous n’aurions pas perdu autant de temps.'),
      say('Si j’avais su que c’était si facile, j’aurais commencé bien plus tôt.', 'If I had known it was so easy, I would have started much earlier.'),
    ],
    [
      b('si + présent → futur; si + imparfait → conditionnel présent.', 'si + présent → futur ; si + imparfait → conditionnel présent.'),
      b('si + plus-que-parfait → conditionnel passé (or présent if the result is now).', 'si + plus-que-parfait → conditionnel passé (ou présent si le résultat est actuel).'),
      b('Never a conditional right after si.', 'Jamais de conditionnel juste après si.'),
    ],
    [['un propriétaire', b('an owner', 'une personne qui possède un bien')], ['une réduction', b('a discount', 'une baisse de prix')], ['une terrasse', b('a terrace', 'les tables dehors')]],
  ),

  lesson(C, 4, ['indicative-or-subjunctive-review', 'indicatif-ou-subjonctif-bilan'],
    b('Indicative or subjunctive? Final review', 'Indicatif ou subjonctif ? Bilan final'),
    b('Certain or not, done or not: and one email that uses every tense.', 'Certain ou non, fait ou non : et un courriel qui emploie tous les temps.'),
    [b('Choose the mood after common expressions', 'Choisir le mode après les expressions courantes'), b('Complete a text with many tenses', 'Compléter un texte avec de nombreux temps'), b('Write an email that uses past, future and subjunctive', 'Écrire un courriel avec passé, futur et subjonctif')],
    13,
    [
      card(b('The mood question', 'La question du mode'), b('The **indicative** presents a fact as real or certain: **je sais que, je pense que, il est sûr que, après que, parce que**. The **subjunctive** presents it as wished, needed, felt or doubtful: **il faut que, je veux que, je suis content que, je doute que, bien que, pour que, avant que**. Then choose present or past subjunctive: not done yet, or already done.', 'L’**indicatif** présente un fait comme réel ou certain : **je sais que, je pense que, il est sûr que, après que, parce que**. Le **subjonctif** le présente comme souhaité, nécessaire, ressenti ou douteux : **il faut que, je veux que, je suis content que, je doute que, bien que, pour que, avant que**. Puis choisissez subjonctif présent ou passé : pas encore fait, ou déjà fait.')),
      sort(b('Indicative or subjunctive after it?', 'Indicatif ou subjonctif après ?'), [b('indicative', 'indicatif'), b('subjunctive', 'subjonctif')], [['parce que', 0], ['pour que', 1], ['après que', 0], ['avant que', 1], ['je suis certain que', 0], ['il est rare que', 1], ['il me semble que', 0], ['bien que', 1]]),
      mc(P.form, ['soit', 'est', 'sera', 'serait'], { fr: 'Bien que le projet ___ ambitieux, l’équipe est confiante.' }),
      mc(P.form, ['avions reçu', 'ayons reçu', 'eussions reçu', 'recevrions'], { fr: 'Nous avons répondu après que nous ___ votre lettre.' }),
      doc({ title: 'Courriel de Nadia', text: 'Chère Camille,\nJe viens de rentrer de Montréal et je dois te raconter ! Quand je suis arrivée, il faisait moins vingt, mais tout le monde avait l’air heureux. J’avais réservé un petit hôtel qui donnait sur le fleuve. Si j’avais su qu’il faisait si froid, j’aurais pris un meilleur manteau ! Je suis contente que tu aies aimé mes photos. L’été prochain, nous irons ensemble, à condition que tu sois libre en juillet.', look: 'email' }, b('What does Nadia regret?', 'Que regrette Nadia ?'), [b('Not taking a warmer coat', 'Ne pas avoir pris un manteau plus chaud'), b('Booking a small hotel', 'Avoir réservé un petit hôtel'), b('Going to Montreal in winter', 'Être allée à Montréal en hiver'), b('Sending photos', 'Avoir envoyé des photos')]),
      gap(P.completeText, 'Hier, je ___ (recevoir) une bonne nouvelle : la banque ___ (accepter) mon prêt. Je suis ravie que tout ___ (se passer) si vite. Il faut maintenant que je ___ (trouver) un artisan. Si tout va bien, les travaux ___ (commencer) en mars.', [['ai reçu'], ['a accepté', 'avait accepté'], ['se soit passé'], ['trouve'], ['commenceront']]),
      write(b('An email that uses every tense', 'Un courriel avec tous les temps'), b('In 60 to 90 words, write to a friend: tell a recent event (past tenses), share a plan (future), express a feeling or a wish (subjunctive) and imagine something (si + imparfait or plus-que-parfait).', 'En 60 à 90 mots, écrivez à un ami : racontez un événement récent (temps du passé), annoncez un projet (futur), exprimez un sentiment ou un souhait (subjonctif) et imaginez quelque chose (si + imparfait ou plus-que-parfait).'), 60, 90, [
        b('Past tenses for the event (passé composé, imparfait)', 'Temps du passé pour l’événement (passé composé, imparfait)'),
        b('A future plan', 'Un projet au futur'),
        b('A subjunctive and a si clause', 'Un subjonctif et une phrase avec si'),
      ], 'Salut Léo ! Samedi, j’ai couru mon premier semi-marathon. Il faisait beau et je m’étais bien entraîné, alors j’ai fini en moins de deux heures. Je suis tellement content que mes parents soient venus m’encourager ! Si j’avais su que c’était si motivant, j’aurais commencé plus tôt. L’année prochaine, je courrai le marathon de Montréal. Il faut absolument que tu viennes avec moi !'),
      say('Je suis contente que tu sois venu et j’espère que tu reviendras bientôt.', 'I’m glad you came and I hope you’ll come back soon.'),
    ],
    [
      b('Indicative: fact, certainty, après que, parce que.', 'Indicatif : fait, certitude, après que, parce que.'),
      b('Subjunctive: necessity, will, feeling, doubt, bien que, pour que, avant que.', 'Subjonctif : nécessité, volonté, sentiment, doute, bien que, pour que, avant que.'),
      b('Present subjunctive: not done yet; past subjunctive: already done.', 'Subjonctif présent : pas encore fait ; subjonctif passé : déjà fait.'),
    ],
    [['un artisan', b('a tradesperson', 'un ouvrier indépendant')], ['un semi-marathon', b('a half marathon', 'une course de vingt et un kilomètres')], ['encourager', b('to cheer on', 'soutenir')]],
  ),
];
