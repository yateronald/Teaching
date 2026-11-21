import type { CourseAbout } from '../../types';
import { b, dlg, doc, hear, lesson, say, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A complete B1 practice set in the spirit of the TEF: timed listening and reading questions on everyday and professional documents, the two writing sections (news story continuation, opinion letter) and the two speaking sections (getting information, convincing a friend), with model answers. Use it as a dress rehearsal and compare your work with the models. All documents are original practice material.',
    'Un entraînement complet de niveau B1 dans l’esprit du TEF : questions chronométrées de compréhension orale et écrite sur des documents quotidiens et professionnels, les deux sections écrites (suite de fait divers, lettre d’opinion) et les deux sections orales (obtenir des informations, convaincre un ami), avec des réponses modèles. Utilisez-le comme une répétition générale et comparez votre travail avec les modèles. Tous les documents sont des supports d’entraînement originaux.',
  ),
  outcomes: [
    b('Practise B1 comprehension under time pressure', 'S’entraîner à la compréhension B1 en temps limité'),
    b('Write sections A and B at B1', 'Rédiger les sections A et B au B1'),
    b('Practise speaking sections A and B', 'S’entraîner aux sections A et B de l’oral'),
    b('Compare with model answers', 'Comparer avec des réponses modèles'),
  ],
};

const C = 'tef-mock-b1';
export default [
  lesson(C, 1, ['comprehension', 'comprehension'],
    b('Listening and reading (timed)', 'Compréhension orale et écrite (chronométrée)'),
    b('Answer B1 questions within the time limit.', 'Répondre à des questions B1 dans le temps imparti.'),
    [b('Identify situations', 'Identifier les situations'), b('Catch changes and details', 'Saisir changements et détails'), b('Read everyday documents fast', 'Lire vite les documents du quotidien')],
    13,
    [
      hear('Bonjour, vous êtes bien au cabinet dentaire du docteur Simard. Le cabinet est fermé pour les vacances jusqu’au 22 août. En cas d’urgence, composez le 514 555 0199.', b('What should you do in an emergency?', 'Que faire en cas d’urgence ?'), [b('call another number', 'appeler un autre numéro'), b('come to the office', 'venir au cabinet'), b('wait until August 22', 'attendre le 22 août'), b('send an email', 'envoyer un courriel')], { voice: 'f', timer: 45 }),
      hear('Finalement, la réunion de lundi est annulée. On se voit plutôt mercredi à quatorze heures, dans la petite salle.', b('When is the meeting now?', 'Quand a lieu la réunion maintenant ?'), [b('Wednesday at 2 p.m.', 'mercredi à 14 h'), b('Monday at 2 p.m.', 'lundi à 14 h'), b('Wednesday morning', 'mercredi matin'), b('it is cancelled for good', 'elle est définitivement annulée')], { voice: 'm', timer: 45 }),
      hear('Moi, je fais mes courses en ligne depuis deux ans. C’est pratique, mais je regrette un peu le marché du samedi, l’ambiance, les discussions avec les producteurs.', b('What does she miss?', 'Qu’est-ce qui lui manque ?'), [b('the atmosphere of the Saturday market', 'l’ambiance du marché du samedi'), b('online shopping', 'les courses en ligne'), b('cheaper prices', 'des prix plus bas'), b('home delivery', 'la livraison à domicile')], { voice: 'f', timer: 45 }),
      doc({ look: 'notice', title: b('Notice', 'Avis'), text: 'CENTRE SPORTIF MUNICIPAL\nÀ partir du 1er septembre, la réservation des terrains de tennis se fera uniquement en ligne.\nLes membres pourront réserver jusqu’à 7 jours à l’avance.\nTarif inchangé : 12 $ de l’heure.' }, b('What changes on 1 September?', 'Qu’est-ce qui change le 1er septembre ?'), [b('bookings are made online only', 'les réservations se font uniquement en ligne'), b('the price goes up', 'le prix augmente'), b('the centre closes', 'le centre ferme'), b('members can book a month ahead', 'les membres peuvent réserver un mois à l’avance')], { timer: 60 }),
      doc({ look: 'email', title: b('Email', 'Courriel'), text: 'Bonjour Julien,\n\nMerci pour ton aide lors du déménagement samedi ! Sans toi, on n’aurait jamais réussi à monter le canapé au troisième. Pour te remercier, on t’invite à dîner vendredi prochain. Tu es libre ?\n\nÀ bientôt,\nSarah et Thomas' }, b('Why do they write to Julien?', 'Pourquoi écrivent-ils à Julien ?'), [b('to thank him and invite him to dinner', 'pour le remercier et l’inviter à dîner'), b('to ask for help moving', 'pour demander de l’aide pour déménager'), b('to sell a sofa', 'pour vendre un canapé'), b('to complain', 'pour se plaindre')], { timer: 60 }),
    ],
    [
      b('Listen for changes: finalement, plutôt, au lieu de.', 'Écoutez les changements : finalement, plutôt, au lieu de.'),
      b('Find the purpose of messages and emails.', 'Trouvez l’objectif des messages et courriels.'),
      b('Respect the timer; note the question types you miss.', 'Respectez le chronomètre ; notez les types de questions manquées.'),
    ],
    [['composer un numéro', b('to dial a number', 'faire un numéro')], ['un producteur', b('a producer, a farmer', 'qui produit les aliments')], ['inchangé', b('unchanged', 'qui ne change pas')]],
  ),
  lesson(C, 2, ['writing', 'expression-ecrite'],
    b('Writing sections A and B', 'Expression écrite : sections A et B'),
    b('Write a news story continuation and an opinion letter at B1.', 'Rédiger une suite de fait divers et une lettre d’opinion au B1.'),
    [b('Section A: continue a news story', 'Section A : poursuivre un fait divers'), b('Section B: give your opinion', 'Section B : donner son avis'), b('Compare with models', 'Comparer avec les modèles')],
    13,
    [
      doc({ look: 'article', title: b('Beginning of the article', 'Début de l’article'), text: 'Une alliance perdue retrouvée vingt ans plus tard\nEn jardinant dans son potager, un retraité de Trois-Rivières a découvert dimanche une alliance en or, couverte de terre. À l’intérieur, deux prénoms et une date étaient gravés.' }, b('What was engraved inside the ring?', 'Qu’était-il gravé à l’intérieur de l’alliance ?'), [b('two first names and a date', 'deux prénoms et une date'), b('an address', 'une adresse'), b('a phone number', 'un numéro de téléphone'), b('nothing', 'rien')]),
      write(b('Section A (80–130 words)', 'Section A (80–130 mots)'), b('Continue the article about the lost wedding ring.', 'Poursuivez l’article sur l’alliance perdue.'), 80, 130, [
        b('Consistent with the beginning', 'Cohérent avec le début'),
        b('Past tenses and time markers', 'Temps du passé et repères temporels'),
        b('An ending', 'Un dénouement'),
      ], 'Intrigué, le retraité a publié une photo de l’alliance sur le groupe d’entraide en ligne de son quartier. En moins de deux jours, le message a été partagé des centaines de fois. Mardi, une femme de 68 ans l’a contacté : la bague appartenait à son mari, qui l’avait perdue en plantant des tomates, vingt ans plus tôt, quand le couple habitait cette maison. « Il la cherchait encore en parlant de ce jardin », a-t-elle confié, émue. Le retraité lui a rendu l’alliance dès le lendemain.'),
      write(b('Section B (200–250 words)', 'Section B (200–250 mots)'), b('React to this statement in a forum: « Les achats en ligne vont faire disparaître les petits commerces. » Give your opinion with three arguments.', 'Réagissez à cette affirmation sur un forum : « Les achats en ligne vont faire disparaître les petits commerces. » Donnez votre avis avec trois arguments.'), 200, 260, [
        b('Clear position', 'Position claire'),
        b('Three arguments with examples', 'Trois arguments avec exemples'),
        b('Conclusion', 'Conclusion'),
      ], 'Bonjour à tous,\n\nJe lis souvent que les achats en ligne vont faire disparaître les petits commerces. Je comprends cette inquiétude, mais je ne suis pas tout à fait d’accord.\n\nTout d’abord, il est vrai que beaucoup de clients préfèrent aujourd’hui commander sur internet, parce que c’est rapide et souvent moins cher. Dans ma rue, par exemple, une librairie a fermé l’année dernière.\n\nCependant, les petits commerces offrent quelque chose qu’internet ne peut pas donner : le conseil et le contact humain. Quand j’achète des chaussures de course, je préfère essayer plusieurs modèles et parler avec un vendeur qui connaît bien ses produits.\n\nEnfin, de nombreux commerçants se sont adaptés. Ma boulangerie de quartier, par exemple, prend maintenant les commandes en ligne et livre à vélo. Ainsi, elle combine les avantages des deux mondes. De même, plusieurs commerçants de mon quartier se sont regroupés pour créer un site commun, ce qui leur permet de mieux se faire connaître sans dépenser une fortune en publicité.\n\nEn conclusion, je pense que les petits commerces ne vont pas disparaître, mais qu’ils devront se transformer pour survivre. Et nous, les clients, avons aussi un rôle à jouer en choisissant d’acheter local. C’est un petit geste qui fait une grande différence.\n\nCamille'),
    ],
    [
      b('Section A: consistent, past tenses, ending.', 'Section A : cohérente, temps du passé, dénouement.'),
      b('Section B: position + 3 arguments + examples + conclusion.', 'Section B : position + 3 arguments + exemples + conclusion.'),
      b('Respect the minimum word counts.', 'Respectez les nombres de mots minimums.'),
    ],
    [['une alliance', b('a wedding ring', 'bague de mariage')], ['un potager', b('a vegetable garden', 'jardin de légumes')], ['graver', b('to engrave', 'inscrire dans le métal')]],
  ),
  lesson(C, 3, ['speaking', 'expression-orale'],
    b('Speaking sections A and B', 'Expression orale : sections A et B'),
    b('Practise getting information and convincing a friend.', 'S’entraîner à obtenir des informations et à convaincre un ami.'),
    [b('Section A: ask about 10 questions', 'Section A : poser une dizaine de questions'), b('Section B: convince a friend', 'Section B : convaincre un ami'), b('Self-assess', 'S’auto-évaluer')],
    13,
    [
      doc({ look: 'ad', title: b('Section A — Ad', 'Section A — Annonce'), text: 'COURS DE CUISINE DU MONDE\nCentre communautaire Saint-Michel\nTous les samedis matin\nGroupes de 10 personnes maximum' }, b('Which question is useful (not already in the ad)?', 'Quelle question est utile (pas déjà dans l’annonce) ?'), [b('Combien coûte une séance ?', 'Combien coûte une séance ?'), b('Les cours ont lieu quel jour ?', 'Les cours ont lieu quel jour ?'), b('C’est le matin ou l’après-midi ?', 'C’est le matin ou l’après-midi ?'), b('Il y a combien de personnes au maximum ?', 'Il y a combien de personnes au maximum ?')]),
      say('Bonjour, je vous appelle au sujet des cours de cuisine du monde. Pourriez-vous me dire combien coûte une séance et si les ingrédients sont fournis ?', 'Hello, I’m calling about the world-cuisine classes. Could you tell me how much a session costs and whether ingredients are provided?'),
      dlg(b('Section B — convincing a friend', 'Section B — convaincre un ami'), undefined, [['Examinatrice (amie)', 'f'], ['Vous', 'm']], [
        [0, 'Un cours de cuisine le samedi matin ? Je préfère dormir !', 'A cooking class on Saturday morning? I’d rather sleep!'],
        [1, { options: ['Je te comprends, mais imagine : on apprend à faire des plats de dix pays différents, et après, on mange ce qu’on a préparé !', 'Tant pis.', 'Tu dors trop.'] }],
        [0, 'Mais je cuisine très mal…', 'But I’m a terrible cook…'],
        [1, { options: ['Justement, c’est fait pour ça ! Et les groupes sont petits, le chef a le temps d’aider chacun.', 'Oui, c’est vrai.', 'Moi aussi.'] }],
      ]),
      tip(b('Self-assessment', 'Auto-évaluation'), b('Section A: **10 questions? varied? nothing already in the ad?** Section B: **every objection answered? tu used? friendly tone? agreement at the end?**', 'Section A : **10 questions ? variées ? rien de déjà dans l’annonce ?** Section B : **chaque objection traitée ? tu employé ? ton amical ? accord à la fin ?**')),
    ],
    [
      b('Section A: ~10 varied questions on what is missing.', 'Section A : ~10 questions variées sur ce qui manque.'),
      b('Section B: acknowledge, counter, propose; tu; friendly.', 'Section B : reconnaître, contrer, proposer ; tu ; amical.'),
      b('Record and self-assess.', 'Enregistrez-vous et auto-évaluez-vous.'),
    ],
    [['un centre communautaire', b('a community centre', 'lieu d’activités du quartier')], ['une séance', b('a session', 'un cours')], ['fourni', b('provided', 'donné')]],
  ),
];
