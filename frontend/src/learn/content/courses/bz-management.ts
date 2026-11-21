import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, gap, hear, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Managing a team in French requires subtle language: delegating clearly, giving positive and corrective feedback without hurting, running a difficult conversation, and announcing and leading change. This C1 course trains the managerial language used in French-speaking workplaces, from the one-to-one meeting to the team announcement, with attention to tone, register and cultural expectations in France and Québec.',
    'Manager une équipe en français demande une langue nuancée : déléguer clairement, faire un retour positif ou correctif sans blesser, mener une conversation difficile, annoncer et accompagner le changement. Ce cours de niveau C1 entraîne la langue managériale des milieux de travail francophones, de l’entretien individuel à l’annonce d’équipe, avec une attention particulière au ton, au registre et aux attentes culturelles en France et au Québec.',
  ),
  outcomes: [
    b('Delegate with clear expectations', 'Déléguer avec des attentes claires'),
    b('Give constructive feedback', 'Faire un retour constructif'),
    b('Handle a difficult conversation', 'Mener une conversation difficile'),
    b('Announce and support change', 'Annoncer et accompagner le changement'),
  ],
};

const C = 'bz-management';
export default [
  lesson(C, 1, ['delegating', 'deleguer'],
    b('Delegating', 'Déléguer'),
    b('Entrust a task with context, expected result, autonomy and follow-up.', 'Confier une tâche avec contexte, résultat attendu, marge de manœuvre et suivi.'),
    [b('Give context and purpose', 'Donner contexte et finalité'), b('Define the expected result', 'Définir le résultat attendu'), b('Agree on autonomy and follow-up', 'Convenir de l’autonomie et du suivi')],
    13,
    [
      card(b('Delegating well', 'Bien déléguer'), b('**Contexte**: **Le client X nous demande une proposition d’ici le 20.** **Pourquoi toi**: **J’ai pensé à toi parce que tu connais bien ce secteur.** **Résultat attendu**: **Il faudrait une proposition de cinq pages, avec deux options chiffrées.** **Autonomie**: **Tu as carte blanche sur la forme.** **Suivi**: **On fait un point mercredi ? N’hésite pas si tu bloques.**', '**Contexte** : **Le client X nous demande une proposition d’ici le 20.** **Pourquoi toi** : **J’ai pensé à toi parce que tu connais bien ce secteur.** **Résultat attendu** : **Il faudrait une proposition de cinq pages, avec deux options chiffrées.** **Autonomie** : **Tu as carte blanche sur la forme.** **Suivi** : **On fait un point mercredi ? N’hésite pas si tu bloques.**')),
      sort(b('Which element of delegation?', 'Quel élément de la délégation ?'), [b('context / why you', 'contexte / pourquoi toi'), b('expected result', 'résultat attendu'), b('autonomy / follow-up', 'autonomie / suivi')], [['J’ai pensé à toi parce que tu connais le client.', 0], ['Il faudrait deux options chiffrées.', 1], ['Tu as carte blanche sur la forme.', 2], ['Le client attend une réponse d’ici le 20.', 0], ['Le document doit tenir en cinq pages.', 1], ['On fait un point mercredi ?', 2]]),
      mc(P.best, ['J’aimerais te confier la préparation du salon de mai. Tu connais bien nos clients : il faudrait un plan d’action pour le 10. Tu as carte blanche, et on fait un point chaque lundi.', 'Fais le salon.', 'Le salon, c’est toi maintenant, débrouille-toi.', 'Si tu as le temps, peut-être, regarde le salon.'], { fr: 'Quelle délégation est la plus claire ?' }),
      gap(P.complete, 'J’aimerais te ___ ce dossier. Tu as ___ blanche sur la méthode, et on fait un ___ jeudi.', ['confier', 'carte', 'point']),
      say('J’ai pensé à toi parce que tu connais bien ce client. Tu as carte blanche, et on fait un point mercredi.', 'I thought of you because you know this client well. You have a free hand, and we’ll catch up on Wednesday.'),
    ],
    [
      b('Context + why you + expected result + autonomy + follow-up.', 'Contexte + pourquoi toi + résultat attendu + autonomie + suivi.'),
      b('Confier, carte blanche, faire un point.', 'Confier, carte blanche, faire un point.'),
      b('Invite questions: N’hésite pas si tu bloques.', 'Invitez les questions : N’hésite pas si tu bloques.'),
    ],
    [['confier', b('to entrust', 'donner la responsabilité')], ['avoir carte blanche', b('to have a free hand', 'liberté totale')], ['chiffré', b('costed, with figures', 'avec des montants')]],
  ),
  lesson(C, 2, ['giving-feedback', 'faire-un-retour'],
    b('Giving feedback', 'Faire un retour'),
    b('Use facts, impact and a request to give positive and corrective feedback.', 'Utiliser faits, impact et demande pour un retour positif ou correctif.'),
    [b('Describe facts, not personality', 'Décrire des faits, pas la personnalité'), b('Explain the impact', 'Expliquer l’impact'), b('Make a clear request', 'Formuler une demande claire')],
    13,
    [
      card(b('Facts – impact – request', 'Faits – impact – demande'), b('**Fait**: **Lors de la réunion client, tu as coupé la parole à Sophie à plusieurs reprises.** **Impact**: **Le client a semblé gêné, et Sophie n’a pas pu présenter sa partie.** **Demande**: **La prochaine fois, j’aimerais que tu attendes la fin de son intervention.** Positive feedback too: **Ta présentation était claire et bien chiffrée ; le client a tout de suite accroché.**', '**Fait** : **Lors de la réunion client, tu as coupé la parole à Sophie à plusieurs reprises.** **Impact** : **Le client a semblé gêné, et Sophie n’a pas pu présenter sa partie.** **Demande** : **La prochaine fois, j’aimerais que tu attendes la fin de son intervention.** Retour positif aussi : **Ta présentation était claire et bien chiffrée ; le client a tout de suite accroché.**')),
      tip(b('Behaviour, not identity', 'Le comportement, pas l’identité'), b('« **Tu es désorganisé** » attacks the person. « **Les deux derniers rapports sont arrivés après l’échéance** » describes a fact that can change.', '« **Tu es désorganisé** » attaque la personne. « **Les deux derniers rapports sont arrivés après l’échéance** » décrit un fait qui peut changer.')),
      sort(b('Fact or judgement?', 'Fait ou jugement ?'), [b('fact (good)', 'fait (bien)'), b('judgement (avoid)', 'jugement (à éviter)')], [['Le rapport est arrivé avec deux jours de retard.', 0], ['Tu es toujours en retard.', 1], ['Trois clients ont signalé une erreur de prix.', 0], ['Tu ne fais jamais attention.', 1], ['Tu as présenté sans support visuel.', 0], ['Ta présentation était nulle.', 1]]),
      mc(P.best, ['Les deux derniers rapports sont arrivés après l’échéance, ce qui a retardé la facturation. Qu’est-ce qui t’a posé problème, et comment puis-je t’aider ?', 'Tu es vraiment désorganisé.', 'Encore en retard ! C’est la dernière fois.', 'Je ne veux plus voir ça.'], { fr: 'Retour correctif sur des retards :' }),
      dlg(b('A feedback conversation', 'Un entretien de retour'), undefined, [['Vous (manager)', 'f'], ['Julien', 'm']], [
        [0, { options: ['Julien, je voulais revenir sur la réunion de ce matin. Tu as coupé la parole à Sophie plusieurs fois.', 'Julien, tu es impoli.', 'Julien, encore une fois…'] }],
        [1, 'Ah… Je voulais juste aller plus vite, le client semblait pressé.', 'Oh… I just wanted to go faster, the client seemed in a hurry.'],
        [0, { options: ['Je comprends l’intention. L’impact, c’est que Sophie n’a pas pu présenter sa partie. La prochaine fois, j’aimerais que tu la laisses terminer.', 'Ce n’est pas une excuse.', 'Bon, tant pis.'] }],
        [1, 'D’accord, c’est noté. Je m’excuserai auprès d’elle.', 'All right, noted. I’ll apologise to her.'],
      ]),
      say('Ta présentation était claire et bien chiffrée. Le client a tout de suite accroché : bravo.', 'Your presentation was clear and well backed by figures. The client was hooked straight away: well done.'),
    ],
    [
      b('Fait → impact → demande.', 'Fait → impact → demande.'),
      b('Describe behaviour, never personality.', 'Décrivez le comportement, jamais la personnalité.'),
      b('Give positive feedback precisely too.', 'Faites aussi des retours positifs précis.'),
    ],
    [['à plusieurs reprises', b('several times', 'plusieurs fois')], ['accrocher', b('to be hooked, to connect', 'être séduit')], ['gêné', b('embarrassed', 'mal à l’aise')]],
  ),
  lesson(C, 3, ['leading-change', 'conduire-le-changement'],
    b('Announcing and leading change', 'Annoncer et conduire le changement'),
    b('Announce a change transparently, acknowledge concerns and involve the team.', 'Annoncer un changement avec transparence, reconnaître les inquiétudes et impliquer l’équipe.'),
    [b('Announce the change and its reasons', 'Annoncer le changement et ses raisons'), b('Acknowledge concerns', 'Reconnaître les inquiétudes'), b('Involve the team', 'Impliquer l’équipe')],
    13,
    [
      card(b('Announcing change', 'Annoncer le changement'), b('**Quoi**: **À partir de septembre, nous passons à un nouvel outil de gestion.** **Pourquoi**: **Notre outil actuel ne sera plus mis à jour, et nous perdons du temps en ressaisies.** **Ce qui ne change pas**: **Vos horaires et vos missions restent les mêmes.** **Inquiétudes**: **Je sais que ce changement peut inquiéter, et c’est légitime.** **Implication**: **J’aimerais que deux volontaires participent au choix de la formation.**', '**Quoi** : **À partir de septembre, nous passons à un nouvel outil de gestion.** **Pourquoi** : **Notre outil actuel ne sera plus mis à jour, et nous perdons du temps en ressaisies.** **Ce qui ne change pas** : **Vos horaires et vos missions restent les mêmes.** **Inquiétudes** : **Je sais que ce changement peut inquiéter, et c’est légitime.** **Implication** : **J’aimerais que deux volontaires participent au choix de la formation.**')),
      culture(b('Transparency', 'La transparence'), b('French-speaking teams often expect **explanations** (« le pourquoi ») and the chance to **debate**. In Québec, a **collaborative**, consensus-seeking tone is appreciated. Avoid announcing a change by email only: present it, then answer questions.', 'Les équipes francophones attendent souvent des **explications** (« le pourquoi ») et la possibilité de **débattre**. Au Québec, un ton **collaboratif** et la recherche de consensus sont appréciés. Évitez d’annoncer un changement uniquement par courriel : présentez-le, puis répondez aux questions.'), { variant: 'culture' }),
      hear('Je sais que ce changement peut inquiéter, et c’est tout à fait légitime. Ce qui ne change pas : vos horaires et vos missions. Ce qui change : l’outil, et nous serons formés pendant deux jours en août. J’aimerais que deux volontaires participent au choix du formateur.', b('What will NOT change?', 'Qu’est-ce qui ne changera PAS ?'), [b('working hours and tasks', 'les horaires et les missions'), b('the tool', 'l’outil'), b('the training dates', 'les dates de formation'), b('the trainer', 'le formateur')], { voice: 'f' }),
      sort(b('Which part of the announcement?', 'Quelle partie de l’annonce ?'), [b('what / why', 'quoi / pourquoi'), b('acknowledging concerns', 'reconnaître les inquiétudes'), b('involving the team', 'impliquer l’équipe')], [['Notre outil ne sera plus mis à jour.', 0], ['C’est normal d’être inquiet.', 1], ['Qui aimerait participer au groupe de travail ?', 2], ['Nous changeons d’outil en septembre.', 0], ['Je comprends que cela bouscule vos habitudes.', 1], ['Vos idées sont les bienvenues.', 2]]),
      write(b('Your announcement', 'Votre annonce'), b('Write a change announcement (70–110 words) for your team: what, why, what does not change, acknowledgement of concerns, involvement.', 'Rédigez une annonce de changement (70–110 mots) pour votre équipe : quoi, pourquoi, ce qui ne change pas, reconnaissance des inquiétudes, implication.'), 70, 110, [
        b('What and why', 'Quoi et pourquoi'),
        b('What does not change', 'Ce qui ne change pas'),
        b('Acknowledge concerns and involve the team', 'Reconnaître les inquiétudes et impliquer l’équipe'),
      ], 'Chère équipe,\n\nÀ partir du 1er septembre, nous passerons au télétravail deux jours par semaine. Cette décision répond à vos demandes et réduira les temps de trajet. Ce qui ne change pas : nos réunions d’équipe du lundi et vos objectifs. Je sais que cette nouvelle organisation peut soulever des questions, c’est légitime. Je vous propose un atelier jeudi pour définir ensemble les jours de présence. Vos idées seront les bienvenues.\n\nÀ jeudi,\nClaire'),
    ],
    [
      b('Announce: quoi, pourquoi, ce qui ne change pas.', 'Annoncer : quoi, pourquoi, ce qui ne change pas.'),
      b('Acknowledge: Je sais que…, c’est légitime.', 'Reconnaître : Je sais que…, c’est légitime.'),
      b('Involve: volontaires, atelier, groupe de travail.', 'Impliquer : volontaires, atelier, groupe de travail.'),
    ],
    [['une ressaisie', b('re-entering data', 'saisir à nouveau')], ['bousculer', b('to upset, disrupt', 'déranger')], ['un volontaire', b('a volunteer', 'personne qui se propose')]],
  ),
];
