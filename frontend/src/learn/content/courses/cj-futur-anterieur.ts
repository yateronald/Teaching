import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, hear, lesson, mc, ord, P, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Quand tu auras fini, tu m’appelleras. D’ici lundi, j’aurai tout lu. Il aura oublié. The futur antérieur places an action before another point in the future, and it also expresses suppositions about the past. It is built like every compound tense: the auxiliary, here in the future, and the past participle. This course trains the forms, the link with quand and dès que, and the uses of supposition and assessment.',
    'Quand tu auras fini, tu m’appelleras. D’ici lundi, j’aurai tout lu. Il aura oublié. Le futur antérieur place une action avant un autre moment du futur, et il exprime aussi des suppositions sur le passé. Il se construit comme tous les temps composés : l’auxiliaire, ici au futur, et le participe passé. Ce cours entraîne les formes, le lien avec quand et dès que, et les emplois de supposition et de bilan.',
  ),
  outcomes: [
    b('Form the futur antérieur with avoir and être', 'Former le futur antérieur avec avoir et être'),
    b('Order two future actions', 'Ordonner deux actions futures'),
    b('Use it after quand, dès que, une fois que', 'L’employer après quand, dès que, une fois que'),
    b('Make suppositions about the past', 'Faire des suppositions sur le passé'),
  ],
};

const C = 'cj-futur-anterieur';
const FA = b('futur antérieur', 'futur antérieur');

export default [
  lesson(C, 1, ['forming-the-future-perfect', 'former-le-futur-anterieur'],
    b('The auxiliary in the future + participle', 'L’auxiliaire au futur + participe'),
    b('J’aurai fini, elle sera partie, nous nous serons levés.', 'J’aurai fini, elle sera partie, nous nous serons levés.'),
    [b('Conjugate avoir and être in the future', 'Conjuguer avoir et être au futur'), b('Form the futur antérieur', 'Former le futur antérieur'), b('Agree the participle as usual', 'Accorder le participe comme d’habitude')],
    13,
    [
      card(b('Like every compound tense', 'Comme tous les temps composés'), b('Put the auxiliary in the **future** and add the past participle. Same choice of avoir or être, same agreements as the passé composé. Avoir: **j’aurai fini, tu auras vu, nous aurons pris**. Être: **je serai parti, elle sera arrivée, ils se seront levés**.', 'Mettez l’auxiliaire au **futur** et ajoutez le participe passé. Même choix d’avoir ou d’être, mêmes accords qu’au passé composé. Avoir : **j’aurai fini, tu auras vu, nous aurons pris**. Être : **je serai parti, elle sera arrivée, ils se seront levés**.'), {
        table: {
          head: ['', 'finir', 'partir'],
          rows: [['je / j’', 'aurai fini', 'serai parti'], ['tu', 'auras fini', 'seras parti'], ['il', 'aura fini', 'sera parti'], ['elle', 'aura fini', 'sera partie'], ['nous', 'aurons fini', 'serons partis'], ['vous', 'aurez fini', 'serez partis'], ['ils', 'auront fini', 'seront partis'], ['elles', 'auront fini', 'seront parties']],
        },
        ex: [['À vingt heures, j’aurai terminé le rapport.', 'By eight p.m., I will have finished the report.'], ['Quand vous arriverez, nous serons déjà partis.', 'When you arrive, we will already have left.']],
      }),
      conj('terminer', FA, [['j’', 'aurai terminé'], ['tu', 'auras terminé'], ['il / elle', 'aura terminé'], ['nous', 'aurons terminé'], ['vous', 'aurez terminé'], ['ils / elles', 'auront terminé']], { given: [0] }),
      conj('arriver', FA, [['il', 'sera arrivé'], ['elle', 'sera arrivée'], ['nous (Marc et moi)', 'serons arrivés'], ['vous (Lina et Sara)', 'serez arrivées'], ['ils', 'seront arrivés'], ['elles', 'seront arrivées']], { given: [0] }),
      mc(P.form, ['aurons visité', 'visiterons', 'avons visité', 'aurions visité'], { fr: 'À la fin du voyage, nous ___ cinq pays.' }),
      mc(P.spelling, ['se seront couchés', 's’auront couchés', 'se seront couché', 'se sont couchés'], { fr: 'À minuit, les enfants ___ depuis longtemps.' }),
      gap(P.complete, 'Dans un an, elle ___ (obtenir) son diplôme. Ses parents ___ (venir) pour la cérémonie.', [['aura obtenu'], ['seront venus']]),
      hear('Demain soir, j’aurai lu tout le dossier.', b('What will be done by tomorrow evening?', 'Qu’est-ce qui sera fait demain soir ?'), [b('Reading the whole file', 'La lecture de tout le dossier'), b('Writing the file', 'L’écriture du dossier'), b('Nothing yet', 'Rien encore')]),
      dict('Dans deux semaines, nous aurons déménagé et nous aurons enfin une chambre d’amis.'),
      say('Quand tu reviendras, j’aurai repeint la cuisine.', 'When you come back, I’ll have repainted the kitchen.'),
    ],
    [
      b('Futur antérieur = avoir / être in the future + past participle.', 'Futur antérieur = avoir / être au futur + participe passé.'),
      b('Same auxiliary and agreements as the passé composé.', 'Même auxiliaire et mêmes accords qu’au passé composé.'),
      b('aurai, auras, aura, aurons, aurez, auront / serai, seras, sera…', 'aurai, auras, aura, aurons, aurez, auront / serai, seras, sera…'),
    ],
    [['obtenir un diplôme', b('to get a degree', 'réussir ses études')], ['une chambre d’amis', b('a guest room', 'une chambre pour les invités')], ['repeindre', b('to repaint', 'peindre à nouveau')]],
  ),

  lesson(C, 2, ['before-a-future-moment', 'avant-un-moment-futur'],
    b('Before another future moment', 'Avant un autre moment du futur'),
    b('Quand j’aurai fini, je sortirai. Dès que tu seras arrivé, appelle-moi. D’ici demain…', 'Quand j’aurai fini, je sortirai. Dès que tu seras arrivé, appelle-moi. D’ici demain…'),
    [b('Order two future actions', 'Ordonner deux actions futures'), b('Use quand, dès que, une fois que, après que', 'Employer quand, dès que, une fois que, après que'), b('Use d’ici and avant + a date', 'Employer d’ici et avant + une date')],
    13,
    [
      card(b('First this, then that', 'D’abord ceci, ensuite cela'), b('When two actions are in the future, the one that will be **finished first** takes the futur antérieur, the other the future: **Quand j’aurai fini mes devoirs, je regarderai la télé.** Words: **quand, lorsque, dès que, aussitôt que, une fois que, après que**. With a deadline: **d’ici lundi, avant la fin du mois** + futur antérieur.', 'Quand deux actions sont futures, celle qui sera **terminée en premier** prend le futur antérieur, l’autre le futur : **Quand j’aurai fini mes devoirs, je regarderai la télé.** Mots : **quand, lorsque, dès que, aussitôt que, une fois que, après que**. Avec une échéance : **d’ici lundi, avant la fin du mois** + futur antérieur.'), {
        ex: [['Dès que j’aurai reçu ta réponse, je réserverai les billets.', 'As soon as I have received your answer, I’ll book the tickets.'], ['D’ici la fin de l’année, nous aurons remboursé le prêt.', 'By the end of the year, we will have paid back the loan.']],
      }),
      trap(b('English says « have done »', 'L’anglais dit « have done »'), b('English often uses a present perfect here (**when I have finished**). French needs the futur antérieur: **quand j’aurai fini**, never « quand j’ai fini » for a future action.', 'L’anglais emploie souvent un present perfect ici (**when I have finished**). Le français demande le futur antérieur : **quand j’aurai fini**, jamais « quand j’ai fini » pour une action future.')),
      sort(b('Which action comes first?', 'Quelle action vient en premier ?'), [b('first: futur antérieur', 'd’abord : futur antérieur'), b('then: futur simple', 'ensuite : futur simple')], [['quand j’aurai économisé', 0], ['j’achèterai une voiture', 1], ['dès qu’il aura signé', 0], ['il commencera lundi', 1], ['une fois que tu seras rentré', 0], ['on dînera', 1]]),
      mc(P.form, ['aurai terminé', 'termine', 'ai terminé', 'terminerais'], { fr: 'Je t’enverrai le fichier dès que j’___ la mise en page.' }),
      mc(P.form, ['aura fini', 'finira', 'finit', 'avait fini'], { fr: 'D’ici vendredi, l’équipe ___ les travaux.' }),
      gap(P.complete, 'Une fois que vous ___ (lire) le contrat, vous le ___ (signer).', [['aurez lu'], ['signerez']]),
      ord(P.order, 'Appelle-moi dès que tu seras arrivé à l’hôtel.', { tr: 'Call me as soon as you’ve arrived at the hotel.' }),
      hear('Quand tu auras goûté ce gâteau, tu comprendras.', b('What will happen first?', 'Qu’est-ce qui se passera en premier ?'), [b('You will taste the cake', 'Vous goûterez le gâteau'), b('You will understand', 'Vous comprendrez'), b('Both at the same time', 'Les deux en même temps')]),
      dict('Lorsque les travaux seront terminés, nous organiserons une grande fête.'),
      say('Je partirai en vacances quand j’aurai rendu mon mémoire.', 'I’ll go on holiday when I’ve handed in my thesis.'),
    ],
    [
      b('Two future actions: the first takes the futur antérieur.', 'Deux actions futures : la première prend le futur antérieur.'),
      b('quand, dès que, une fois que, après que + futur antérieur.', 'quand, dès que, une fois que, après que + futur antérieur.'),
      b('d’ici + date + futur antérieur: d’ici lundi, j’aurai fini.', 'd’ici + date + futur antérieur : d’ici lundi, j’aurai fini.'),
    ],
    [['économiser', b('to save (money)', 'mettre de l’argent de côté')], ['la mise en page', b('the layout', 'la présentation d’un document')], ['rembourser un prêt', b('to pay back a loan', 'rendre l’argent emprunté')]],
  ),

  lesson(C, 3, ['suppositions-and-review', 'suppositions-et-bilan'],
    b('Suppositions, assessment and review', 'Supposition, bilan et révision'),
    b('Il aura oublié. J’aurai tout essayé ! Then plans for a busy week.', 'Il aura oublié. J’aurai tout essayé ! Puis le planning d’une semaine chargée.'),
    [b('Make a supposition about the past', 'Faire une supposition sur le passé'), b('Draw up an assessment', 'Dresser un bilan'), b('Plan steps in the future', 'Planifier des étapes futures')],
    13,
    [
      card(b('Two more uses', 'Deux autres emplois'), b('A **supposition** about something already done: **Paul n’est pas là ? Il aura oublié le rendez-vous.** (He must have forgotten.) An **assessment**, often an exclamation: **J’aurai tout essayé !** (I’ll have tried everything!) **On aura bien ri.**', 'Une **supposition** sur quelque chose de déjà fait : **Paul n’est pas là ? Il aura oublié le rendez-vous.** Un **bilan**, souvent une exclamation : **J’aurai tout essayé !** **On aura bien ri.**'), {
        ex: [['Le train a du retard ? Il y aura eu un problème sur la ligne.', 'The train is late? There must have been a problem on the line.'], ['Elle ne répond pas : elle se sera endormie.', 'She isn’t answering: she must have fallen asleep.']],
      }),
      tip(b('Aura dû, a dû, doit avoir', 'Aura dû, a dû, doit avoir'), b('The supposition can also be said with devoir: **Il aura oublié** = **Il a dû oublier** = **Il doit avoir oublié**. The futur antérieur sounds a little more literary.', 'La supposition peut aussi se dire avec devoir : **Il aura oublié** = **Il a dû oublier** = **Il doit avoir oublié**. Le futur antérieur paraît un peu plus littéraire.')),
      mc(P.meaning, [b('He must have missed his bus', 'Il a probablement raté son bus'), b('He will miss his bus', 'Il ratera son bus'), b('He never misses his bus', 'Il ne rate jamais son bus'), b('He wanted to miss his bus', 'Il voulait rater son bus')], { fr: 'Karim est en retard ? Il aura raté son bus.' }),
      mc(P.form, ['se seront perdus', 'se perdront', 'se sont perdu', 's’auront perdus'], { fr: 'Nos invités ne sont pas encore là : ils ___ dans le quartier.' }),
      gap(P.complete, 'Le colis n’est pas arrivé ? Le livreur ___ (se tromper) d’adresse. Après tous ces efforts, nous ___ (bien mériter) nos vacances !', [['se sera trompé'], ['aurons bien mérité']]),
      dlg(b('A busy week ahead', 'Une semaine chargée'), b('Two colleagues plan the week.', 'Deux collègues planifient la semaine.'), [['Amélie', 'f'], ['Rachid', 'm']], [
        [0, 'Tu crois qu’on sera prêts pour la présentation de jeudi ?', 'Do you think we’ll be ready for Thursday’s presentation?'],
        [1, { options: ['Oui, d’ici mercredi, j’aurai fini les graphiques.', 'Oui, d’ici mercredi, j’ai fini les graphiques.', 'Oui, d’ici mercredi, je serai fini les graphiques.'] }],
        [0, 'Et le client nous a répondu ?', 'And has the client answered us?'],
        [1, { options: ['Pas encore. Il aura oublié de vérifier ses courriels.', 'Pas encore. Il oubliera de vérifier ses courriels hier.', 'Pas encore. Il sera oublié de vérifier ses courriels.'] }],
        [0, 'Bon, dès qu’il aura confirmé, je réserverai la salle.', 'OK, as soon as he has confirmed, I’ll book the room.'],
      ]),
      write(b('Your goals for next month', 'Vos objectifs pour le mois prochain'), b('In 40 to 70 words, say what you will have done by the end of next month, and what you will do once it is done. Use the futur antérieur at least four times.', 'En 40 à 70 mots, dites ce que vous aurez fait d’ici la fin du mois prochain, et ce que vous ferez une fois que ce sera fait. Employez le futur antérieur au moins quatre fois.'), 40, 70, [
        b('Four verbs in the futur antérieur', 'Quatre verbes au futur antérieur'),
        b('One sentence with d’ici + date', 'Une phrase avec d’ici + date'),
        b('One sentence with quand or dès que + futur antérieur', 'Une phrase avec quand ou dès que + futur antérieur'),
      ], 'D’ici la fin du mois prochain, j’aurai terminé ma formation en ligne et j’aurai passé mon examen de français. J’aurai aussi trouvé un nouvel appartement plus près du travail. Quand j’aurai signé le bail, j’inviterai mes amis à dîner. Et dès que nous aurons emménagé, nous adopterons un chat.'),
      say('Ne t’inquiète pas, il aura simplement oublié son téléphone.', 'Don’t worry, he must simply have forgotten his phone.'),
    ],
    [
      b('Supposition about the past: il aura oublié (= il a dû oublier).', 'Supposition sur le passé : il aura oublié (= il a dû oublier).'),
      b('Assessment: j’aurai tout essayé !', 'Bilan : j’aurai tout essayé !'),
      b('Planning: d’ici…, quand…, dès que… + futur antérieur.', 'Planification : d’ici…, quand…, dès que… + futur antérieur.'),
    ],
    [['un colis', b('a parcel', 'un paquet envoyé')], ['un livreur', b('a delivery driver', 'la personne qui livre')], ['le bail', b('the lease', 'le contrat de location')]],
  ),
];
