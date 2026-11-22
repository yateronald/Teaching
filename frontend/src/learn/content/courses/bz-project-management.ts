import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Running a project in French means managing scope, milestones, blockers and tough trade-offs before a deadline slips. Whether you coordinate software launches, client implementations or internal migrations, teams expect concise updates that separate facts from guesswork. This B1–B2 course trains you to read project scopes and milestone boards, flag risks early in meetings, negotiate priorities and write weekly status updates.',
    'Piloter un projet en français implique de tenir le périmètre, les jalons, les blocages et les arbitrages avant qu’un retard ne s’installe. Qu’il s’agisse d’un déploiement numérique, d’un dossier client ou d’un chantier interne, vos interlocuteurs attendent des points précis et factuels. Ce cours B1–B2 vous forme à lire cahier des charges et tableaux de suivi, alerter tôt sur un risque et rédiger un point hebdomadaire.',
  ),
  outcomes: [
    b('Read project scopes, milestones and deliverables accurately', 'Lire cahier des charges, jalons et livrables avec précision'),
    b('Flag delays early and propose realistic trade-offs in meetings', 'Signaler un risque tôt et proposer des arbitrages en réunion'),
    b('Distinguish scope creep, dependencies and blockers cleanly', 'Distinguer dérive du périmètre, dépendances et points bloquants'),
    b('Write structured weekly status updates (vert / orange / rouge)', 'Rédiger un point d’avancement hebdomadaire structuré'),
  ],
};

const C = 'bz-project-management';
export default [
  lesson(C, 1, ['scope-milestones-and-deliverables', 'cadrage-jalons-et-livrables'],
    b('Scope, milestones and deliverables', 'Périmètre, jalons et livrables'),
    b('Master core project vocabulary and read a milestone tracker accurately.', 'Maîtriser le vocabulaire projet et lire un tableau de jalons.'),
    [b('Define cahier des charges, périmètre, jalon, livrable', 'Comprendre cahier des charges, périmètre, jalon, livrable'), b('Read status boards and owner deadlines', 'Lire un tableau d’avancement et ses échéances'), b('Spot scope creep (dérive du périmètre)', 'Repérer une dérive du périmètre')],
    13,
    [
      card(b('Project management essentials', 'Les mots clés du projet'), b('**Le cahier des charges** = specifications / project brief · **Le périmètre** = scope (**hors périmètre** = out of scope) · **Un jalon** = milestone · **Un livrable** = deliverable · **La date butoir / l’échéance** = hard deadline · **Le chemin critique** = critical path.', '**Le cahier des charges** · **Le périmètre** (**hors périmètre**) · **Un jalon** · **Un livrable** · **La date butoir** · **Le chemin critique**.')),
      doc({ look: 'page', title: b('Project milestone tracker', 'Suivi projet — Portail client'), text: 'Chef de projet : N. Laurent · Date butoir : 30 juin\n\n• Lot 1 — Maquettes validées | Terminé (2 mai) · Resp. : Julie\n• Lot 2 — Paiement en ligne | En retard (prévu 16 mai) · Resp. : Marc (attente API banque)\n• Lot 3 — Recette utilisateur | À venir (2 juin) · Resp. : Équipe produit\n\nDemande reçue ce matin : ajouter un mode sombre → Hors périmètre phase 1.' }, b('Why is Workstream 2 (Lot 2) currently delayed?', 'Pourquoi le lot 2 est-il actuellement en retard ?'), [b('It is waiting for the bank’s API.', 'Il attend l’API de la banque.'), b('Julie has not validated the mockups yet.', 'Julie n’a pas encore validé les maquettes.'), b('User testing took longer than expected.', 'La recette utilisateur a duré plus longtemps.'), b('Dark mode was added to phase 1.', 'Le mode sombre a été ajouté à la phase 1.')]),
      doc({ look: 'page', title: b('Project milestone tracker', 'Suivi projet — Portail client'), text: 'Chef de projet : N. Laurent · Date butoir : 30 juin\n\n• Lot 1 — Maquettes validées | Terminé (2 mai) · Resp. : Julie\n• Lot 2 — Paiement en ligne | En retard (prévu 16 mai) · Resp. : Marc (attente API banque)\n• Lot 3 — Recette utilisateur | À venir (2 juin) · Resp. : Équipe produit\n\nDemande reçue ce matin : ajouter un mode sombre → Hors périmètre phase 1.' }, b('How is the new « dark mode » request handled?', 'Comment la demande de « mode sombre » est-elle traitée ?'), [b('It is left out of phase 1 scope.', 'Elle est classée hors périmètre pour la phase 1.'), b('It replaces the payment workstream.', 'Elle remplace le lot paiement.'), b('It pushes the launch to July.', 'Elle repousse le lancement à juillet.'), b('It starts on 2 May.', 'Elle commence le 2 mai.')]),
      pairs(P.match, [['le cahier des charges', b('specifications / project brief', 'document des besoins')], ['un jalon', b('a milestone', 'étape clé datée')], ['un livrable', b('a deliverable', 'résultat concret attendu')], ['la date butoir', b('hard deadline', 'date limite absolue')]]),
      gap(P.complete, 'Cette fonctionnalité est ___ périmètre pour la phase 1 ; il faut tenir la date ___ du 30 juin.', ['hors', 'butoir']),
      say('Le jalon numéro deux dépend de l’API partenaire, mais le reste du périmètre reste dans les temps.', 'Milestone two depends on the partner API, while the rest of the scope remains on schedule.'),
    ],
    [
      b('Cahier des charges = specs; périmètre = scope; jalon = milestone; livrable = deliverable.', 'Cahier des charges, périmètre, jalon, livrable.'),
      b('Protect deadlines by marking late new requests « hors périmètre phase 1 ».', 'Protégez les délais en classant les ajouts tardifs « hors périmètre ».'),
      b('La recette (in French IT/projects) = user acceptance testing.', 'La recette = phase de tests et validation avant mise en ligne.'),
    ],
    [['un jalon', b('a milestone', 'étape majeure datée')], ['le périmètre', b('the project scope', 'ce qui est inclus ou exclu')], ['la recette', b('acceptance testing', 'vérification finale avant livraison')]],
  ),
  lesson(C, 2, ['risks-delays-and-tradeoffs', 'risques-retards-et-arbitrages'],
    b('Flagging risks, delays and trade-offs', 'Risques, retards et arbitrages'),
    b('Escalate a slip calmly and propose realistic trade-offs to decision makers.', 'Signaler un dérapage avec calme et proposer des scénarios d’arbitrage.'),
    [b('Escalate a blocker without panic or blame', 'Alerter sur un blocage sans chercher de coupable'), b('Propose options: scope, timeline or resources', 'Proposer un arbitrage : délai, périmètre ou moyens'), b('Understand glissement, plan d’atténuation, prioriser', 'Comprendre glissement, atténuation, arbitrage')],
    13,
    [
      card(b('Escalating and trading off', 'Alerter et arbitrer'), b('Never report a problem alone—bring **options**: **Nous constatons un glissement de dix jours sur… · Sans arbitrage rapide, la mise en production est menacée. · Nous avons deux options : soit prioriser les fonctions clés, soit décaler l’échéance d’une semaine. · Quel scénario privilégiez-vous ?**', 'N’apportez jamais un problème sans **solutions** : **Nous constatons un glissement de dix jours… · Sans arbitrage, l’échéance est menacée. · Deux options : réduire le lot ou décaler la mise en production. · Quel scénario retenez-vous ?**')),
      dlg(b('Project steering sync', 'Point d’arbitrage projet'), undefined, [['Directrice', 'f'], ['Vous (chef de projet)', 'm']], [
        [0, 'Marc m’a dit que l’API bancaire prenait du retard. Où en est-on pour le 30 juin ?', 'Marc told me the bank API is delayed. Where do we stand for 30 June?'],
        [1, { options: ['Nous avons cinq jours de glissement. Pour tenir le 30 juin, je propose de lancer d’abord le paiement par carte et de livrer le virement en juillet.', 'C’est la faute de la banque, on ne peut rien faire.', 'Ne vous inquiétez pas, on verra le 29 juin.'] }],
        [0, 'C’est raisonnable. Est-ce que cela suffit pour sécuriser les tests ?', 'That’s reasonable. Is that enough to safeguard testing?'],
        [1, { options: ['Oui, à condition de valider cet arbitrage dès aujourd’hui afin de lancer la recette lundi.', 'Peut-être, je crois.', 'Non, tout est bloqué.'] }],
      ]),
      hear('Point d’alerte sur le lot logistique : faute de validation du fournisseur avant jeudi midi, le calendrier glissera mécaniquement de quatre jours ouvrés. L’équipe propose de mobiliser un prestataire de secours dès demain matin.', b('What mitigation plan does the team suggest?', 'Quel plan d’atténuation l’équipe propose-t-elle ?'), [b('Bringing in a backup contractor tomorrow morning', 'Mobiliser un prestataire de secours dès demain matin'), b('Cancelling the logistics workstream', 'Annuler le lot logistique'), b('Waiting until next Tuesday without acting', 'Attendre mardi prochain sans agir'), b('Moving the entire team to another project', 'Changer toute l’équipe de projet')], { voice: 'f' }),
      sort(b('Risk statement or trade-off option?', 'Constat de risque ou proposition d’arbitrage ?'), [b('risk / blocker', 'risque / blocage'), b('trade-off / solution', 'arbitrage / solution')], [['Le fournisseur accuse cinq jours de retard.', 0], ['Prioriser les fonctions essentielles pour le 30 juin.', 1], ['La recette risque d’être comprimée.', 0], ['Décaler le lot secondaire à la phase 2.', 1]]),
      mc(P.best, ['Sans validation avant jeudi, l’échéance glissera d’une semaine ; nous recommandons de livrer le lot B en phase 2.', 'C’est une catastrophe totale.', 'Personne ne m’écoute jamais.', 'On va travailler la nuit peut-être.'], { fr: 'Vous devez formuler un arbitrage clair dans un compte rendu :' }),
      say('Nous constatons un glissement de cinq jours ; nous vous proposons deux options d’arbitrage.', 'We are seeing a five-day slip; we propose two trade-off options.'),
    ],
    [
      b('Pair every risk with concrete options (reduce scope, add backup, or shift date).', 'Associez chaque risque à des scénarios clairs (périmètre, renfort ou date).'),
      b('Un glissement = schedule slip; un arbitrage = executive trade-off decision.', 'Glissement = décalage ; arbitrage = décision entre options.'),
      b('Always attach a decision deadline: « à condition de trancher avant jeudi ».', 'Fixez la date limite de décision : « à condition de valider avant jeudi ».'),
    ],
    [['un glissement', b('a schedule slip, drift', 'retard progressif')], ['un arbitrage', b('a trade-off decision', 'choix entre plusieurs options')], ['un point bloquant', b('a blocker', 'obstacle qui arrête la suite')]],
  ),
  lesson(C, 3, ['weekly-status-updates', 'point-d-avancement-hebdomadaire'],
    b('Weekly status updates and action summaries', 'Le point d’avancement hebdomadaire'),
    b('Write crisp, scannable weekly project status reports with RAG indicators.', 'Rédiger un point d’avancement hebdomadaire clair et orienté décisions.'),
    [b('Use the standard status template (statut, fait, blocages, suite)', 'Structurer le point : statut, fait, blocages, suite'), b('Choose accurate status labels (vert, orange, rouge)', 'Choisir la bonne météo projet (vert, orange, rouge)'), b('Write a crisp weekly status email', 'Rédiger un courriel hebdomadaire d’avancement')],
    13,
    [
      card(b('Weekly status structure', 'Structure du point hebdomadaire'), b('Use four scannable sections: 1. **Météo projet** : Vert (dans les temps) · Orange (vigilance / risque maîtrisable) · Rouge (bloqué / échéance menacée). 2. **Réalisé cette semaine**. 3. **Points de blocage / vigilance**. 4. **Prochaines étapes et décisions attendues**.', 'Quatre blocs lisibles : 1. **Météo** : Vert (dans les temps) · Orange (vigilance) · Rouge (critique). 2. **Réalisé cette semaine**. 3. **Points de blocage**. 4. **Prochaines étapes / arbitrages attendus**.')),
      mc(P.best, ['Statut : Orange — Le développement est à jour, mais un arbitrage est attendu sur l’API avant jeudi.', 'Statut : Vert — Tout est parfait même si rien ne marche.', 'Bonjour, cette semaine il a fait beau.', 'Tout va mal, bonne chance.'], { fr: 'Une tâche critique est en attente de décision client :' }),
      pairs(P.match, [['météo orange', b('amber / watch status', 'risque à surveiller')], ['réalisé cette semaine', b('completed this week', 'tâches achevées')], ['décision attendue', b('decision required', 'arbitrage demandé')], ['dans les temps', b('on schedule', 'conforme au calendrier')]]),
      gap(P.complete, 'Météo projet : ___, en raison d’un point de ___ sur la validation juridique.', ['Orange', 'vigilance']),
      write(b('Weekly status email', 'Courriel d’avancement hebdomadaire'), b('Write a structured weekly status update (60–95 words) for your sponsor: state status (Orange), list 2 completed items, flag 1 blocker (missing legal sign-off delaying launch by 3 days), and specify next steps + decision requested by Wednesday.', 'Rédigez un point hebdomadaire structuré (60–95 mots) : indiquez le statut (Orange), deux tâches réalisées, un point de vigilance (validation juridique en attente, risque de 3 jours de retard), puis prochaines étapes et décision attendue avant mercredi.'), 60, 95, [
        b('Project status clearly stated (Orange)', 'Météo projet claire (Orange)'),
        b('Two completed achievements listed', 'Deux réalisations de la semaine'),
        b('Blocker + impact + requested decision date', 'Point de vigilance, impact et échéance de décision'),
      ], 'Objet : Point hebdomadaire — Portail Client (Semaine 21)\n\nBonjour à tous,\n\nMétéo projet : Orange.\n\nRéalisé cette semaine : les maquettes finales ont été validées et la formation de l’équipe support est terminée.\n\nPoint de vigilance : nous attendons toujours le retour du service juridique sur les conditions d’utilisation, ce qui risque d’entraîner un glissement de trois jours.\n\nProchaines étapes : lancement des tests lundi. Décision attendue : validation juridique souhaitée avant mercredi midi.\n\nCordialement,\nN. Laurent'),
      say('Météo orange cette semaine : les maquettes sont validées, mais la validation juridique reste attendue mercredi.', 'Amber status this week: the mockups are approved, though legal sign-off is still awaited Wednesday.'),
    ],
    [
      b('RAG status: Vert (on track), Orange (at risk), Rouge (off track).', 'Météo : Vert (dans les temps), Orange (à surveiller), Rouge (critique).'),
      b('Keep weekly updates scannable: completed, blockers, next steps, decision needed.', 'Structurez en blocs courts : réalisé, vigilance, suite, arbitrage.'),
      b('Always attach a clear owner and deadline to any requested decision.', 'Précisez toujours qui doit trancher et pour quand.'),
    ],
    [['la météo projet', b('project RAG health status', 'indicateur vert, orange ou rouge')], ['la vigilance', b('watch item, caution', 'attention requise')], ['achever', b('to complete, finish', 'mener à terme')]],
  ),
];
