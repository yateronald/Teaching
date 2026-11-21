import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Quand tu auras fini, appelle-moi. D’ici juin, j’aurai obtenu mon diplôme. The futur antérieur (future perfect) describes an action that will be completed before another future moment. It is precise and very common in planning, at work and in formal French, and it also expresses a supposition about the past (il aura oublié). This course teaches its formation, its use after quand, dès que and lorsque, and its everyday meanings.',
    'Quand tu auras fini, appelle-moi. D’ici juin, j’aurai obtenu mon diplôme. Le futur antérieur exprime une action accomplie avant un autre moment futur. Précis et très courant pour planifier, au travail et à l’écrit soutenu, il exprime aussi une supposition sur le passé (il aura oublié). Ce cours présente sa formation, son emploi après quand, dès que et lorsque, et ses sens courants.',
  ),
  outcomes: [
    b('Form the futur antérieur', 'Former le futur antérieur'),
    b('Use it after quand, dès que, lorsque, une fois que', 'L’employer après quand, dès que, lorsque, une fois que'),
    b('Set deadlines with d’ici and avant', 'Fixer des échéances avec d’ici et avant'),
    b('Express a supposition about the past', 'Exprimer une supposition sur le passé'),
  ],
};

const C = 'futur-anterieur';
export default [
  lesson(C, 1, ['forming-the-future-perfect', 'former-le-futur-anterieur'],
    b('Forming the futur antérieur', 'Former le futur antérieur'),
    b('Future of avoir or être + past participle.', 'Futur simple de avoir ou être + participe passé.'),
    [b('Form the tense with avoir and être', 'Former le temps avec avoir et être'), b('Set a deadline with d’ici', 'Fixer une échéance avec d’ici'), b('Talk about goals', 'Parler de ses objectifs')],
    13,
    [
      card(b('Auxiliary in the future', 'L’auxiliaire au futur'), b('**j’aurai, tu auras, il aura, nous aurons, vous aurez, ils auront** + participle; **je serai, tu seras…** + participle (agreement with être). **D’ici vendredi, j’aurai terminé le rapport.**', '**j’aurai, tu auras, il aura, nous aurons, vous aurez, ils auront** + participe ; **je serai, tu seras…** + participe (accord avec être). **D’ici vendredi, j’aurai terminé le rapport.**'), {
        ex: [['Dans un an, nous aurons déménagé.', 'In a year, we will have moved.'], ['À 18 h, elle sera partie.', 'By 6 p.m., she will have left.'], ['D’ici la fin du mois, ils auront fini les travaux.', 'By the end of the month, they will have finished the work.']],
      }),
      conj('finir', b('futur antérieur', 'futur antérieur'), [['j’', 'aurai fini'], ['tu', 'auras fini'], ['il / elle', 'aura fini'], ['nous', 'aurons fini'], ['vous', 'aurez fini'], ['ils / elles', 'auront fini']], { given: [0] }),
      mc(P.form, ['aura trouvé', 'trouvera eu', 'aurait trouvé', 'a trouvé'], { fr: 'D’ici décembre, elle ___ un nouveau logement.' }),
      mc(P.form, ['seront arrivés', 'auront arrivé', 'arriveront', 'seront arrivé'], { fr: 'À minuit, tous les invités ___.' }),
      pairs(P.match, [['d’ici demain', b('by tomorrow', 'avant demain au plus tard')], ['avant la fin de l’année', b('before the end of the year', 'dans l’année')], ['dans six mois', b('in six months', 'six mois plus tard')], ['à cette heure-ci demain', b('this time tomorrow', 'demain à la même heure')]]),
      gap(P.complete, 'Dans cinq ans, j’___ ___ (obtenir) ma citoyenneté canadienne.', ['aurai', 'obtenu']),
      say('D’ici l’été, j’aurai terminé ma formation et j’aurai trouvé un emploi.', 'By the summer, I will have finished my training and found a job.'),
    ],
    [
      b('Futur antérieur = aurai / serai + past participle.', 'Futur antérieur = aurai / serai + participe passé.'),
      b('An action completed before a future moment.', 'Une action accomplie avant un moment futur.'),
      b('With deadlines: d’ici, avant, à + time.', 'Avec les échéances : d’ici, avant, à + heure.'),
    ],
    [['la citoyenneté', b('citizenship', 'nationalité')], ['une formation', b('a training course', 'un cursus de formation')], ['les travaux', b('the (building) work', 'chantier de rénovation')]],
  ),
  lesson(C, 2, ['quand-des-que', 'quand-des-que'],
    b('Quand tu auras fini: after quand and dès que', 'Quand tu auras fini : après quand et dès que'),
    b('Use the futur antérieur after time conjunctions to show which action comes first.', 'Employer le futur antérieur après les conjonctions de temps pour montrer l’action antérieure.'),
    [b('Use it after quand, dès que, lorsque, une fois que, après que', 'L’employer après quand, dès que, lorsque, une fois que, après que'), b('Avoid the English present after when', 'Éviter le présent anglais après when'), b('Give instructions in order', 'Donner des consignes dans l’ordre')],
    13,
    [
      card(b('Future after when', 'Le futur après quand'), b('English says “When you **have** finished, call me”. French uses the **future**: **Quand tu auras fini, appelle-moi.** Simultaneous actions: futur simple (**Quand tu arriveras, je serai là**). Completed first: futur antérieur.', 'L’anglais dit « When you have finished ». Le français emploie le **futur** : **Quand tu auras fini, appelle-moi.** Actions simultanées : futur simple (**Quand tu arriveras, je serai là**). Action accomplie avant : futur antérieur.'), {
        ex: [['Dès que j’aurai reçu ta réponse, je réserverai.', 'As soon as I’ve received your answer, I’ll book.'], ['Une fois que vous aurez rempli le formulaire, envoyez-le.', 'Once you’ve filled in the form, send it.']],
      }),
      trap(b('Not the present', 'Pas le présent'), b('« Quand tu as fini, appelle-moi » is wrong for the future. Say **Quand tu auras fini…**', '« Quand tu as fini, appelle-moi » est fautif pour le futur. Dites **Quand tu auras fini…**')),
      mc(P.best, ['Dès que j’aurai fini, je t’appellerai.', 'Dès que je finis, je t’appellerai.', 'Dès que j’ai fini, je t’appellerai.', 'Dès que je finirais, je t’appellerai.']),
      mc(P.form, ['aurez lu', 'lisez', 'avez lu', 'liriez'], { fr: 'Lorsque vous ___ le contrat, signez en bas de la page.' }),
      sort(b('Simultaneous or completed first?', 'Simultané ou accompli avant ?'), [b('futur simple', 'futur simple'), b('futur antérieur', 'futur antérieur')], [['Quand tu seras là, on dînera.', 0], ['Quand tu auras mangé, on sortira.', 1], ['Quand il fera beau, j’irai courir.', 0], ['Dès que la pluie aura cessé, on partira.', 1]]),
      gap(P.complete, 'Une fois que les enfants ___ ___ (se coucher), nous regarderons le film.', ['se seront', 'couchés']),
      dlg(b('Planning a move', 'Organiser un déménagement'), undefined, [['Camille', 'f'], ['Vous', 'm']], [
        [0, 'On commence à emballer la cuisine quand ?', 'When do we start packing the kitchen?'],
        [1, { options: ['Dès qu’on aura fini le salon.', 'Dès qu’on finit le salon.', 'Dès qu’on a fini le salon demain.'] }],
        [0, 'Et le camion ?', 'And the van?'],
        [1, { options: ['Je l’appellerai quand j’aurai reçu la confirmation du propriétaire.', 'Je l’appelle quand je reçois la confirmation hier.', 'Je l’appellerais quand j’ai reçu la confirmation.'] }],
      ]),
      dict('Quand vous aurez terminé l’examen, rendez votre copie au surveillant.', { voice: 'm' }),
    ],
    [
      b('After quand / dès que / lorsque / une fois que / après que: future tense.', 'Après quand / dès que / lorsque / une fois que / après que : futur.'),
      b('Completed first: futur antérieur (Quand tu auras fini…).', 'Accompli avant : futur antérieur (Quand tu auras fini…).'),
      b('Never the present for a future action after quand.', 'Jamais le présent pour une action future après quand.'),
    ],
    [['emballer', b('to pack', 'mettre dans des cartons')], ['la copie', b('the exam paper', 'feuille d’examen')], ['le surveillant', b('the invigilator', 'personne qui surveille l’examen')]],
  ),
  lesson(C, 3, ['supposition-and-assessment', 'supposition-et-bilan'],
    b('Il aura oublié: supposition and assessment', 'Il aura oublié : supposition et bilan'),
    b('Use the futur antérieur to guess about the past and to sum up.', 'Employer le futur antérieur pour une hypothèse sur le passé et pour un bilan.'),
    [b('Express a probable explanation', 'Exprimer une explication probable'), b('Sum up an experience', 'Faire le bilan d’une expérience'), b('Distinguish it from the past conditional', 'Le distinguer du conditionnel passé')],
    13,
    [
      card(b('A probable explanation', 'Une explication probable'), b('To guess why something happened: **Il n’est pas venu ? Il aura oublié.** (= he has probably forgotten). Also for an assessment: **Tu auras tout essayé !** (you really tried everything).', 'Pour supposer la cause d’un fait : **Il n’est pas venu ? Il aura oublié.** (= il a probablement oublié). Aussi pour un bilan : **Tu auras tout essayé !**'), {
        ex: [['Marc ne répond pas : il se sera endormi.', 'Marc isn’t answering: he must have fallen asleep.'], ['J’aurai au moins appris quelque chose.', 'At least I’ll have learnt something.']],
      }),
      mc(P.meaning, [b('She has probably missed her bus.', 'Elle a probablement raté son bus.'), b('She will miss her bus.', 'Elle ratera son bus.'), b('She should have missed her bus.', 'Elle aurait dû rater son bus.'), b('She never misses her bus.', 'Elle ne rate jamais son bus.')], { fr: 'Elle est en retard ? Elle aura raté son bus.' }),
      mc(P.best, ['Il se sera trompé d’adresse.', 'Il se serait trompé d’adresse hier demain.', 'Il s’est trompera d’adresse.', 'Il aura se tromper d’adresse.'], { fr: 'Le livreur n’est pas venu. Explication probable :' }),
      sort(b('Future perfect or past conditional?', 'Futur antérieur ou conditionnel passé ?'), [b('futur antérieur', 'futur antérieur'), b('conditionnel passé', 'conditionnel passé')], [['j’aurai fini', 0], ['j’aurais fini', 1], ['elle sera partie', 0], ['elle serait partie', 1], ['nous aurons vu', 0], ['nous aurions vu', 1]]),
      gap(P.complete, 'Le colis n’est pas arrivé ? La poste l’___ ___ (envoyer) à la mauvaise adresse.', ['aura', 'envoyé']),
      ord(P.order, 'Malgré tout, cette année aura été riche en découvertes.', { tr: 'Despite everything, this year will have been full of discoveries.' }),
      say('Il ne répond pas ? Il aura laissé son téléphone au bureau.', 'He’s not answering? He must have left his phone at the office.'),
    ],
    [
      b('Supposition about the past: Il aura oublié (= probably).', 'Supposition sur le passé : Il aura oublié (= probablement).'),
      b('Assessment: Cette année aura été difficile.', 'Bilan : Cette année aura été difficile.'),
      b('aurai (futur antérieur) ≠ aurais (conditionnel passé): listen for [e] / [ɛ].', 'aurai (futur antérieur) ≠ aurais (conditionnel passé) : [e] / [ɛ].'),
    ],
    [['le colis', b('the parcel', 'paquet envoyé')], ['le livreur', b('the delivery person', 'personne qui livre')], ['s’endormir', b('to fall asleep', 'commencer à dormir')]],
  ),
];
