import type { CourseAbout } from '../../types';
import { b, card, doc, gap, lesson, mc, ord, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Minutes after a meeting, a weekly status summary, a short report to management: professional writing in French has its own conventions. This course teaches you to write factual minutes (decisions, actions, owners), to turn notes into nominal style (Validation du budget, Report de la livraison), to report what people said with reported speech, and to structure a short report with an introduction, findings and recommendations.',
    'Le compte rendu après une réunion, le point d’avancement hebdomadaire, le court rapport pour la direction : l’écrit professionnel en français a ses propres conventions. Ce cours vous apprend à rédiger un compte rendu factuel (décisions, actions, responsables), à transformer des notes en style nominal (Validation du budget, Report de la livraison), à rapporter les propos avec le discours indirect, et à structurer un court rapport avec introduction, constats et recommandations.',
  ),
  outcomes: [
    b('Write factual minutes', 'Rédiger un compte rendu factuel'),
    b('Use the nominal style', 'Employer le style nominal'),
    b('Report what was said', 'Rapporter les propos'),
    b('Structure a short report', 'Structurer un court rapport'),
  ],
};

const C = 'bz-reports-minutes';
export default [
  lesson(C, 1, ['meeting-minutes', 'le-compte-rendu-de-reunion'],
    b('Meeting minutes', 'Le compte rendu de réunion'),
    b('Record attendees, decisions and actions in a clear, neutral format.', 'Consigner participants, décisions et actions dans un format clair et neutre.'),
    [b('Know the structure of minutes', 'Connaître la structure du compte rendu'), b('Stay factual and neutral', 'Rester factuel et neutre'), b('List actions with owners and deadlines', 'Lister les actions avec responsables et échéances')],
    13,
    [
      card(b('Structure of minutes', 'Structure du compte rendu'), b('**En-tête**: date, objet, participants (présents, excusés). **Points abordés**: one paragraph per agenda item. **Décisions**: what was decided. **Actions**: **Qui – Quoi – Échéance**. **Prochaine réunion**. Tone: neutral, present or passé composé, no personal opinion: **L’équipe a validé… · Il a été décidé de…**', '**En-tête** : date, objet, participants (présents, excusés). **Points abordés** : un paragraphe par point de l’ordre du jour. **Décisions** : ce qui a été décidé. **Actions** : **Qui – Quoi – Échéance**. **Prochaine réunion**. Ton : neutre, présent ou passé composé, sans opinion personnelle : **L’équipe a validé… · Il a été décidé de…**')),
      doc({ look: 'page', title: b('Minutes (extract)', 'Compte rendu (extrait)'), text: 'Compte rendu — Réunion projet « Nouveau site » — 12 mars\nPrésents : L. Martin, S. Haddad, P. Roy. Excusée : C. Dubois.\n1. Calendrier : la mise en ligne est reportée au 15 avril en raison des tests.\n2. Budget : le budget complémentaire de 5 000 € est validé.\nActions | Responsable | Échéance\nFinaliser les tests | S. Haddad | 5 avril\nInformer les clients | P. Roy | 8 avril\nProchaine réunion : 2 avril, 10 h' }, b('Who must inform the clients, and by when?', 'Qui doit informer les clients, et pour quand ?'), [b('P. Roy, by 8 April', 'P. Roy, pour le 8 avril'), b('S. Haddad, by 5 April', 'S. Haddad, pour le 5 avril'), b('C. Dubois, by 15 April', 'C. Dubois, pour le 15 avril'), b('L. Martin, by 2 April', 'L. Martin, pour le 2 avril')]),
      sort(b('Neutral minutes or personal opinion?', 'Compte rendu neutre ou opinion personnelle ?'), [b('neutral', 'neutre'), b('opinion (to avoid)', 'opinion (à éviter)')], [['Le budget a été validé.', 0], ['Heureusement, le budget a enfin été validé !', 1], ['Il a été décidé de reporter la date.', 0], ['Paul a encore été en retard, comme d’habitude.', 1], ['Mme Dubois était excusée.', 0], ['La réunion était trop longue et ennuyeuse.', 1]]),
      gap(P.complete, 'Il a été ___ de reporter la mise en ligne. Le budget complémentaire a été ___ .', ['décidé', 'validé']),
      mc(P.best, ['Mise en ligne reportée au 15 avril (tests en cours). Responsable : S. Haddad.', 'On a parlé du site, ça va être en retard je crois.', 'Le site sera en retard, comme toujours, à cause de Samir.', 'Site : problème.'], { fr: 'Quelle ligne de compte rendu est la meilleure ?' }),
    ],
    [
      b('Header, points, decisions, actions (qui–quoi–échéance), next meeting.', 'En-tête, points, décisions, actions (qui–quoi–échéance), prochaine réunion.'),
      b('Neutral tone: Il a été décidé de… L’équipe a validé…', 'Ton neutre : Il a été décidé de… L’équipe a validé…'),
      b('No personal opinions or blame.', 'Pas d’opinions personnelles ni de reproches.'),
    ],
    [['excusé', b('absent with apologies', 'absent mais prévenu')], ['la mise en ligne', b('the go-live', 'publication sur internet')], ['une échéance', b('a deadline', 'date limite')]],
  ),
  lesson(C, 2, ['nominal-style-and-reported-speech', 'style-nominal-et-discours-rapporte'],
    b('Nominal style and reported speech', 'Style nominal et discours rapporté'),
    b('Turn verbs into nouns for titles and notes, and report what participants said.', 'Transformer des verbes en noms pour les titres et notes, et rapporter les propos des participants.'),
    [b('Nominalise verbs', 'Nominaliser des verbes'), b('Use reporting verbs', 'Employer des verbes introducteurs'), b('Shift tenses in reported speech', 'Concorder les temps au discours rapporté')],
    13,
    [
      card(b('Nominal style', 'Le style nominal'), b('Titles, bullet points and emails often use **nouns instead of verbs**: **valider → validation du budget**; **reporter → report de la livraison**; **augmenter → augmentation des effectifs**; **recruter → recrutement d’un stagiaire**; **lancer → lancement de la campagne**.', 'Titres, listes et courriels emploient souvent **des noms au lieu de verbes** : **valider → validation du budget** ; **reporter → report de la livraison** ; **augmenter → augmentation des effectifs** ; **recruter → recrutement d’un stagiaire** ; **lancer → lancement de la campagne**.')),
      card(b('Reporting speech', 'Rapporter les propos'), b('Reporting verbs: **indiquer, préciser, souligner, rappeler, proposer, s’interroger sur**. Tense shift after a past verb: « Les tests **sont** terminés » → **Mme Haddad a indiqué que les tests étaient terminés.** « Nous **livrerons** en avril » → **Il a précisé qu’ils livreraient en avril.**', 'Verbes introducteurs : **indiquer, préciser, souligner, rappeler, proposer, s’interroger sur**. Concordance après un verbe au passé : « Les tests **sont** terminés » → **Mme Haddad a indiqué que les tests étaient terminés.** « Nous **livrerons** en avril » → **Il a précisé qu’ils livreraient en avril.**')),
      pairs(P.match, [['valider', 'la validation'], ['reporter', 'le report'], ['recruter', 'le recrutement'], ['lancer', 'le lancement']], true),
      mc(P.form, ['M. Roy a souligné que les clients attendaient une réponse rapide.', 'M. Roy a souligné que les clients attendent une réponse rapide hier.', 'M. Roy a souligné que les clients attendront une réponse rapide hier.', 'M. Roy a souligné que les clients ont attendu une réponse rapide demain.']),
      gap(P.complete, '« Nous finirons les tests vendredi. » → Samir a précisé qu’ils ___ les tests vendredi.', ['finiraient']),
      ord(P.order, 'Lancement de la campagne prévu le 3 mai.', { tr: 'Campaign launch scheduled for 3 May.' }),
    ],
    [
      b('Nominal style: validation, report, lancement, recrutement.', 'Style nominal : validation, report, lancement, recrutement.'),
      b('Reporting verbs: indiquer, préciser, souligner, rappeler.', 'Verbes introducteurs : indiquer, préciser, souligner, rappeler.'),
      b('Past reporting verb → imparfait, conditionnel, plus-que-parfait.', 'Verbe introducteur au passé → imparfait, conditionnel, plus-que-parfait.'),
    ],
    [['les effectifs', b('headcount, staff', 'nombre de salariés')], ['souligner', b('to stress', 'insister sur')], ['prévu', b('scheduled', 'planifié')]],
  ),
  lesson(C, 3, ['short-reports', 'le-rapport-court'],
    b('Writing a short report', 'Rédiger un court rapport'),
    b('Structure a one-page report: context, findings, recommendations.', 'Structurer un rapport d’une page : contexte, constats, recommandations.'),
    [b('Write the context', 'Rédiger le contexte'), b('Present findings with figures', 'Présenter les constats chiffrés'), b('Make recommendations', 'Formuler des recommandations')],
    13,
    [
      card(b('Report structure', 'Structure du rapport'), b('**Objet** · **Contexte**: À la demande de…, ce rapport analyse… · **Constats**: Il ressort de l’analyse que… · On constate que… · Les chiffres montrent que… · **Recommandations**: Nous recommandons de… · Il conviendrait de… · Il serait souhaitable que… (subjonctif) · **Conclusion**.', '**Objet** · **Contexte** : À la demande de…, ce rapport analyse… · **Constats** : Il ressort de l’analyse que… · On constate que… · Les chiffres montrent que… · **Recommandations** : Nous recommandons de… · Il conviendrait de… · Il serait souhaitable que… (subjonctif) · **Conclusion**.')),
      tip(b('One idea per paragraph', 'Une idée par paragraphe'), b('Managers read fast: start each paragraph with its **main idea**, give **one figure** to support it, and keep recommendations **concrete** (who, what, when).', 'Les responsables lisent vite : commencez chaque paragraphe par son **idée principale**, appuyez-la par **un chiffre**, et gardez des recommandations **concrètes** (qui, quoi, quand).')),
      sort(b('Context, finding or recommendation?', 'Contexte, constat ou recommandation ?'), [b('context', 'contexte'), b('finding', 'constat'), b('recommendation', 'recommandation')], [['À la demande de la direction, ce rapport analyse…', 0], ['On constate une hausse de 20 % des réclamations.', 1], ['Nous recommandons de recruter un conseiller.', 2], ['Ce rapport porte sur le service client.', 0], ['Il ressort de l’analyse que les délais ont doublé.', 1], ['Il conviendrait de revoir les horaires.', 2]]),
      mc(P.form, ['Il serait souhaitable que l’équipe soit renforcée avant l’été.', 'Il serait souhaitable que l’équipe est renforcée avant l’été.', 'Il serait souhaitable que l’équipe sera renforcée avant l’été.', 'Il serait souhaitable de l’équipe soit renforcée avant l’été.']),
      write(b('Your short report', 'Votre court rapport'), b('Write a short report (90–140 words) on a problem in a team (e.g. long customer waiting times): context, two findings with figures, two recommendations.', 'Rédigez un court rapport (90–140 mots) sur un problème dans une équipe (ex. : temps d’attente des clients) : contexte, deux constats chiffrés, deux recommandations.'), 90, 140, [
        b('Context', 'Contexte'),
        b('Two findings with figures', 'Deux constats chiffrés'),
        b('Two concrete recommendations', 'Deux recommandations concrètes'),
      ], 'Objet : temps d’attente au service client\n\nÀ la demande de la direction, ce rapport analyse l’évolution du temps d’attente téléphonique depuis janvier.\n\nOn constate que le temps d’attente moyen est passé de 4 à 11 minutes en six mois. Par ailleurs, 30 % des appels sont abandonnés avant d’aboutir, contre 12 % l’an dernier.\n\nNous recommandons de recruter deux conseillers temporaires pour la période de pointe, de juin à septembre. Il conviendrait également de mettre en place un rappel automatique pour les clients en attente.\n\nCes mesures devraient ramener le temps d’attente sous les cinq minutes d’ici la fin de l’année.'),
    ],
    [
      b('Context: À la demande de…, ce rapport analyse…', 'Contexte : À la demande de…, ce rapport analyse…'),
      b('Findings: On constate que… Il ressort de l’analyse que…', 'Constats : On constate que… Il ressort de l’analyse que…'),
      b('Recommendations: Nous recommandons de… Il conviendrait de…', 'Recommandations : Nous recommandons de… Il conviendrait de…'),
    ],
    [['il ressort que', b('it emerges that', 'on conclut que')], ['aboutir', b('to get through, succeed', 'arriver au but')], ['la période de pointe', b('the peak period', 'moment de forte activité')]],
  ),
];
