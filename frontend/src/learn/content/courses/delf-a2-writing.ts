import type { CourseAbout } from '../../types';
import { b, card, dict, doc, exam, gap, lesson, mc, ord, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The DELF A2 writing paper has two distinct tasks, each requiring 60 words minimum: telling about a past event or holiday experience (Task 1), and replying to an invitation, accepting, refusing with an excuse, or thanking someone (Task 2). Examiners check that you cover every bullet point in the prompt, choose the right register (tu or vous), use past tenses accurately, and write clear linked sentences.',
    'La production écrite du DELF A2 comporte deux tâches distinctes de 60 mots minimum chacune : raconter un événement passé ou une expérience (tâche 1), et répondre à une invitation, accepter, refuser en s’excusant ou remercier (tâche 2). Les correcteurs vérifient que chaque point de la consigne est traité, que le registre (tu ou vous) convient, que les temps du passé sont bien employés et que les phrases sont reliées clairement.',
  ),
  outcomes: [
    b('Narrate a past event or trip in 60+ words', 'Raconter un événement ou voyage passé en plus de 60 mots'),
    b('Reply naturally to an invitation or friendly message', 'Répondre naturellement à une invitation ou un message'),
    b('Use passé composé and imparfait clearly in A2 texts', 'Employer clairement passé composé et imparfait au niveau A2'),
    b('Apply a fast word-count and checklist routine', 'Appliquer une méthode rapide de relecture et comptage'),
  ],
};

const C = 'delf-a2-writing';
export default [
  lesson(C, 1, ['task1-narrating-past-experience', 'tache-1-raconter-le-passe'],
    b('Task 1: telling a past experience', 'Tâche 1 : raconter un événement passé'),
    b('Write a lively 60-to-80-word narrative or postcard covering where, with whom and feelings.', 'Écrire un récit ou courriel de 60 à 80 mots précisant lieu, compagnie et impressions.'),
    [b('Cover every point of the prompt', 'Traiter chaque point de la consigne'), b('Combine passé composé and imparfait', 'Combiner passé composé et imparfait'), b('Reach 60–80 words effortlessly', 'Atteindre 60 à 80 mots avec aisance')],
    13,
    [
      exam(b('DELF A2 Writing Task 1', 'DELF A2 Production écrite — Tâche 1'), b('Task 1 asks you to **describe an event or personal experience** (holidays, a party, a weekend, moving house) in **at least 60 words** (aim for **65–85 words**). Use **passé composé** for what you did, **imparfait** for weather, place and feelings (**il faisait beau, j’étais ravi**), and time connectors (**d’abord, ensuite, finalement**).', 'La tâche 1 demande de **raconter un événement ou une expérience personnelle** (vacances, fête, week-end, déménagement) en **60 mots minimum** (visez **65 à 85 mots**). Employez le **passé composé** pour les actions, l’**imparfait** pour le décor et les émotions (**il faisait beau, j’étais ravi**), et des connecteurs (**d’abord, ensuite, finalement**).')),
      mc(P.best, ['Salut Théo ! Le week-end dernier, je suis allé à Annecy avec ma sœur. Il faisait très beau et le lac était magnifique. Samedi, nous avons loué des vélos et mangé dans un petit restaurant. J’ai adoré cette escapade ! À bientôt, Claire', 'Je suis allé à Annecy. C’était bien. Il faisait beau. Voilà.', 'Annecy est une belle ville dans les Alpes françaises avec un lac.', 'Cher Monsieur Théo, je vous informe de mon voyage à Annecy. Cordialement.'], { fr: 'Consigne : « Écrivez un courriel à un ami pour raconter votre dernier week-end (60 mots environ) : lieu, activités, impressions. »' }),
      gap(P.completeText, 'Samedi soir, je ___ (aller) au concert avec Paul. La salle ___ (être) pleine et le public ___ (chanter) très fort. Nous ___ (passer) une soirée inoubliable !', ['suis allé', 'était', 'chantait', 'avons passé']),
      ord(P.order, 'Le dimanche matin, nous avons visité le vieux quartier.', { tr: 'On Sunday morning, we visited the old quarter.' }),
      pairs(P.match, [['d’abord', b('first of all', 'en premier')], ['ensuite', b('then, next', 'après cela')], ['malheureusement', b('unfortunately', 'par malchance')], ['inoubliable', b('unforgettable', 'qu’on n’oublie pas')]]),
      write(b('Write Task 1', 'Rédigez la tâche 1'), b('You spent three days in the mountains with friends. Write an email to a friend (60–85 words): say where you went, what you did, the weather and what you liked best.', 'Vous avez passé trois jours à la montagne avec des amis. Écrivez un courriel à un ami (60–85 mots) : lieu, activités, météo et ce que vous avez préféré.'), 60, 85, [
        b('Friendly greeting & sign-off', 'Formule d’accueil et signature amicale'),
        b('Where, when, who with & weather', 'Lieu, moment, avec qui et météo'),
        b('Activities in passé composé & impressions', 'Activités au passé composé et impressions'),
      ], 'Salut Karim !\n\nLa semaine dernière, je suis parti trois jours dans les Alpes avec deux amis. Il faisait froid mais le ciel était tout bleu ! Samedi, nous avons fait une longue randonnée dans la neige et le soir, nous avons mangé une bonne raclette au chalet. Ce que j’ai préféré, c’est la vue depuis le sommet. On y retourne ensemble l’hiver prochain ?\n\nBises,\nNora', { phrases: ['Salut…', 'La semaine dernière, je suis parti…', 'Il faisait…', 'Ce que j’ai préféré, c’est…'] }),
    ],
    [
      b('Task 1 = 60+ words describing a past event or holiday.', 'Tâche 1 = 60 mots minimum pour raconter un événement passé.'),
      b('Actions → passé composé; setting/weather/feelings → imparfait.', 'Actions → passé composé ; décor/météo/sentiments → imparfait.'),
      b('Always check greeting, prompt points, connectors and closing.', 'Vérifiez toujours salutation, points de la consigne, connecteurs et signature.'),
    ],
    [['une escapade', b('a short getaway', 'court voyage')], ['louer', b('to rent', 'prendre en location')], ['le sommet', b('the summit, top', 'le point le plus haut')]],
  ),
  lesson(C, 2, ['task2-invitations-accepting-refusing', 'tache-2-inviter-accepter-refuser'],
    b('Task 2: replying to an invitation', 'Tâche 2 : répondre à une invitation'),
    b('Accept enthusiastically, decline politely with an excuse, or propose another date.', 'Accepter avec chaleur, refuser poliment avec une excuse ou proposer une autre date.'),
    [b('Adapt tu vs vous to the sender', 'Adapter tu ou vous au destinataire'), b('Give a polite reason when declining', 'Donner une excuse polie pour refuser'), b('Propose an alternative plan', 'Proposer une autre solution')],
    13,
    [
      card(b('Task 2 essentials', 'Les réflexes de la tâche 2'), b('You receive a message inviting you to a wedding, dinner, colleague’s farewell or club outing. Usually you must: **1. thank** (**Merci beaucoup pour ton invitation !**), **2. accept OR refuse politely** (**Je suis vraiment désolé(e), mais je ne pourrai pas venir parce que…**), and **3. ask a question or propose another meeting** (**On peut se voir la semaine prochaine ?**).', 'Vous recevez une invitation (mariage, dîner, pot de départ, sortie). En général, il faut : **1. remercier** (**Merci beaucoup pour ton invitation !**), **2. accepter OU refuser poliment** (**Je suis vraiment désolé(e), mais je ne pourrai pas venir parce que…**), et **3. poser une question ou proposer un autre moment** (**On peut se voir la semaine prochaine ?**).')),
      doc({ look: 'email', title: b('Prompt message', 'Message reçu'), text: 'De : Julien Martin (collègue)\nObjet : Pot de départ de Léa\n\nBonjour à tous,\nNous organisons un dîner vendredi 18 h 30 au restaurant Le Comptoir pour le départ de Léa. Peux-tu venir ? Dis-moi si tu souhaites participer au cadeau commun !' }, b('Which three elements belong in a strong reply?', 'Quels trois éléments faut-il mettre dans une bonne réponse ?'), [b('Thanks + clear yes/no with excuse + answer about the gift', 'Remerciement + oui/non avec raison + réponse pour le cadeau'), b('Only “Yes” in three words', 'Seulement « Oui, merci »'), b('A detailed story about last summer', 'Le récit détaillé de l’été dernier'), b('A formal complaint to the restaurant', 'Une plainte adressée au restaurant')]),
      sort(b('Accepting or refusing politely?', 'Accepter ou refuser poliment ?'), [b('accepting', 'accepter'), b('refusing politely', 'refuser poliment')], [['Avec grand plaisir, je serai là dès 18 h 30 !', 0], ['Malheureusement, j’ai un imprévu familial ce soir-là.', 1], ['Je viens sûrement, merci pour l’idée !', 0], ['Quel dommage, je travaille tard vendredi soir.', 1], ['Tu peux compter sur moi !', 0], ['Je ne pourrai pas être présent, mais…', 1]]),
      mc(P.best, ['Cher Julien, merci pour l’organisation ! Malheureusement, je ne pourrai pas venir vendredi car mes parents arrivent de Lyon ce soir-là. Par contre, je participe volontiers au cadeau : je te donne dix euros demain au bureau. Bon dîner à vous !', 'Salut, non je ne viens pas. Pas de cadeau pour moi. Au revoir.', 'Bonjour Monsieur, je refuse votre dîner. Cordialement.', 'Merci mais vendredi non, peut-être jamais.'], { fr: 'Quelle réponse à Julien obtient tous les points au DELF A2 ?' }),
      write(b('Write Task 2 (refusal + gift)', 'Rédigez la tâche 2 (refus + cadeau)'), b('Reply to Julien’s email (60–80 words): thank him, say you cannot come and explain why, ask to contribute to Léa’s gift, and suggest having coffee with Léa next week.', 'Répondez au courriel de Julien (60–80 mots) : remerciez-le, dites que vous ne pouvez pas venir et pourquoi, proposez de participer au cadeau, et suggérez un café avec Léa la semaine prochaine.'), 60, 85, [
        b('Thank Julien and state your refusal', 'Remercier Julien et annoncer le refus'),
        b('Give a clear reason', 'Donner une excuse claire'),
        b('Mention the gift & suggest coffee next week', 'Parler du cadeau et proposer un café'),
      ], 'Salut Julien,\n\nMerci beaucoup pour l’organisation de cette soirée ! Malheureusement, je ne pourrai pas venir vendredi soir parce que je dois garder mes enfants et rentrer tôt chez moi. Par contre, je participe avec grand plaisir au cadeau commun pour Léa : je peux te passer quinze euros demain matin au bureau. On pourrait aussi prendre un café avec elle mardi midi ?\n\nBonne soirée à tous,\nSamir', { phrases: ['Merci beaucoup pour…', 'Malheureusement, je ne pourrai pas…', 'Par contre, je participe…', 'On pourrait… ?'] }),
    ],
    [
      b('Declining = thank + clear excuse + warm alternative.', 'Refuser = remercier + excuse crédible + alternative chaleureuse.'),
      b('Match the sender’s register: « Salut… » for a friend/colleague, « Bonjour Monsieur… » for formal.', 'Adaptez le registre : « Salut… » pour un ami/collègue, « Bonjour Monsieur… » si formel.'),
      b('Always answer secondary questions in the email (gift, time, bringing something).', 'Répondez toujours aux petites questions du message (cadeau, heure, quoi apporter).'),
    ],
    [['un pot de départ', b('a farewell party', 'fête quand quelqu’un part')], ['un imprévu', b('an unexpected event', 'quelque chose de non prévu')], ['volontiers', b('gladly', 'avec plaisir')]],
  ),
  lesson(C, 3, ['linking-ideas-and-checking-a2', 'relier-les-idees-et-relecture-a2'],
    b('Linking sentences and checking your 60 words', 'Relier ses phrases et se relire à A2'),
    b('Avoid short choppy sentences and eliminate A2 spelling and verb slips before handing in.', 'Éviter les phrases hachées et corriger fautes de verbes, d’accords et de mots avant de rendre sa copie.'),
    [b('Link ideas with parce que, mais, donc, alors', 'Relier avec parce que, mais, donc, alors'), b('Check word count efficiently', 'Compter ses mots rapidement'), b('Proofread gender and past participles', 'Relire genre et participes passés')],
    13,
    [
      tip(b('From choppy A1 to smooth A2', 'Passer de phrases courtes A1 au lien A2'), b('Instead of « Je ne viens pas. Je travaille. Il pleut. », write: « Je ne viens pas **parce que** je travaille tard, **mais** je viendrai samedi **si** le temps est beau. » **Four connectors** (parce que, mais, alors/donc, quand) raise your score right away.', 'Au lieu de « Je ne viens pas. Je travaille. Il pleut. », écrivez : « Je ne viens pas **parce que** je travaille tard, **mais** je viendrai samedi **si** le temps est beau. » **Quatre connecteurs** (parce que, mais, alors/donc, quand) font tout de suite monter la note.')),
      gap(P.completeText, 'J’ai beaucoup aimé la visite ___ le guide expliquait très bien. Il faisait froid, ___ nous avons bu un chocolat chaud, ___ il était tard ___ nous sommes rentrés.', ['parce que', 'donc', 'mais', 'quand']),
      mc(P.spelling, ['Elles sont allées au marché puis elles ont acheté des fraises.', 'Elles sont allé au marché puis elles ont achetés des fraises.', 'Elles ont allées au marché puis elles ont acheter des fraises.', 'Elles sont aller au marché puis elles ont acheté des fraises.'], { fr: 'Quelle phrase est sans faute d’accord ?' }),
      sort(b('Cause, contrast or consequence?', 'Cause, opposition ou conséquence ?'), [b('cause', 'cause'), b('contrast', 'opposition'), b('consequence', 'conséquence')], [['parce que', 0], ['car', 0], ['mais', 1], ['par contre', 1], ['donc', 2], ['alors', 2]]),
      tip(b('Counting words the fast way', 'Compter ses mots sans perdre de temps'), b('Each word separated by a space counts as 1 word, and **l’hôtel** or **j’ai** usually count as **1 or 2 words depending on convention** — aim for **68–80 words** so you are safely above 60 under any count.', 'Chaque bloc séparé par un espace compte pour 1 mot (aimant la marge : **visez 68 à 80 mots** pour rester largement au-dessus des 60 mots exigés).')),
      dict('Merci pour ton invitation, mais je travaille tard ce vendredi, donc je viendrai samedi matin.', { voice: 'm' }),
    ],
    [
      b('Link clauses with parce que, mais, donc, alors, quand.', 'Reliez vos propositions avec parce que, mais, donc, alors, quand.'),
      b('Check auxiliary choice (être vs avoir) and feminine/plural -e/-s endings.', 'Vérifiez l’auxiliaire (être ou avoir) et les accords -e / -s.'),
      b('Aim for 68–80 words so the 60-word minimum is safely passed.', 'Visez 68 à 80 mots pour dépasser largement le seuil de 60 mots.'),
    ],
    [['une consigne', b('exam instructions', 'ce qui est demandé')], ['par contre', b('however, on the other hand', 'en revanche')], ['au moins', b('at least', 'pas moins de')]],
  ),
];
