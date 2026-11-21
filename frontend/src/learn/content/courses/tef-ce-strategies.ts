import type { CourseAbout } from '../../types';
import { b, card, doc, exam, gap, lesson, mc, ord, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The TEF reading test gives you about 60 minutes to answer many questions on everyday documents (signs, ads, forms), press articles, professional letters and argumentative texts. This course trains TEF reading strategies: understanding documents of daily and professional life quickly, finding information in articles, understanding the logic of a text (order of paragraphs, connectors) and the writer’s viewpoint.',
    'L’épreuve de compréhension écrite du TEF donne environ 60 minutes pour répondre à de nombreuses questions sur des documents du quotidien (panneaux, annonces, formulaires), des articles de presse, des lettres professionnelles et des textes argumentatifs. Ce cours entraîne les stratégies de lecture du TEF : comprendre vite les documents de la vie quotidienne et professionnelle, trouver l’information dans un article, saisir la logique d’un texte (ordre des paragraphes, connecteurs) et le point de vue de l’auteur.',
  ),
  outcomes: [
    b('Read everyday documents fast', 'Lire vite les documents du quotidien'),
    b('Find information in articles', 'Trouver l’information dans un article'),
    b('Understand text logic and connectors', 'Comprendre la logique du texte et les connecteurs'),
    b('Identify the writer’s viewpoint', 'Identifier le point de vue de l’auteur'),
  ],
};

const C = 'tef-ce-strategies';
export default [
  lesson(C, 1, ['everyday-documents', 'documents-du-quotidien'],
    b('Everyday and professional documents', 'Documents du quotidien et professionnels'),
    b('Understand signs, ads, forms and work notices quickly.', 'Comprendre vite panneaux, annonces, formulaires et notes de service.'),
    [b('Know the TEF reading format', 'Connaître le format de la compréhension écrite du TEF'), b('Read signs and ads', 'Lire panneaux et annonces'), b('Read work notices', 'Lire des notes de service')],
    13,
    [
      exam(b('TEF reading', 'Compréhension écrite du TEF'), b('About **60 minutes**, many **multiple-choice questions**, from **A1 to C2**, on **everyday documents**, **press articles**, **professional letters** and **opinion texts**. Strategy: **question first**, then the useful part of the document. Check the current format on the official TEF website.', 'Environ **60 minutes**, de nombreuses **questions à choix multiple**, du **A1 au C2**, sur des **documents du quotidien**, des **articles de presse**, des **lettres professionnelles** et des **textes d’opinion**. Stratégie : **la question d’abord**, puis la partie utile du document. Vérifiez le format en vigueur sur le site officiel du TEF.')),
      doc({ look: 'notice', title: b('Sign', 'Panneau'), text: 'PISCINE — RÈGLEMENT\nBonnet de bain obligatoire\nDouche obligatoire avant la baignade\nInterdit de courir autour du bassin\nEnfants de moins de 8 ans accompagnés d’un adulte' }, b('Who must be accompanied?', 'Qui doit être accompagné ?'), [b('children under 8', 'les enfants de moins de 8 ans'), b('all swimmers', 'tous les nageurs'), b('people without a cap', 'les personnes sans bonnet'), b('adults', 'les adultes')], { timer: 40 }),
      doc({ look: 'email', title: b('Work notice', 'Note de service'), text: 'À tout le personnel\n\nÀ compter du 1er mars, les demandes de congés devront être déposées sur la plateforme RH au moins trois semaines à l’avance. Les demandes papier ne seront plus acceptées.\n\nLa direction' }, b('What changes from 1 March?', 'Qu’est-ce qui change à partir du 1er mars ?'), [b('leave requests must be made online, 3 weeks ahead', 'les demandes de congés se font en ligne, 3 semaines à l’avance'), b('holidays are cancelled', 'les vacances sont annulées'), b('paper requests are preferred', 'les demandes papier sont préférées'), b('staff get more holidays', 'le personnel a plus de congés')], { timer: 60 }),
      sort(b('Obligation, prohibition or information?', 'Obligation, interdiction ou information ?'), [b('obligation', 'obligation'), b('prohibition', 'interdiction'), b('information', 'information')], [['Bonnet obligatoire', 0], ['Interdit de courir', 1], ['Ouvert de 7 h à 22 h', 2], ['Les demandes devront être déposées…', 0], ['Les demandes papier ne seront plus acceptées.', 1], ['Le bureau est au 3e étage.', 2]]),
      pairs(P.match, [['à compter de', b('from (a date)', 'à partir de')], ['le personnel', b('the staff', 'les employés')], ['déposer une demande', b('to submit a request', 'envoyer une demande')], ['le bassin', b('the pool (basin)', 'partie avec l’eau')]]),
    ],
    [
      b('About 60 min, many questions, A1 → C2.', 'Environ 60 min, beaucoup de questions, A1 → C2.'),
      b('Spot obligation, prohibition and information.', 'Repérez obligation, interdiction et information.'),
      b('Question first, then the useful part.', 'La question d’abord, puis la partie utile.'),
    ],
    [['un bonnet de bain', b('a swimming cap', 'pour les cheveux à la piscine')], ['la baignade', b('swimming, bathing', 'fait de se baigner')], ['une plateforme', b('a platform (online)', 'site en ligne')]],
  ),
  lesson(C, 2, ['text-logic', 'la-logique-du-texte'],
    b('Text logic and connectors', 'Logique du texte et connecteurs'),
    b('Understand how a text is organised and what connectors signal.', 'Comprendre comment un texte est organisé et ce que signalent les connecteurs.'),
    [b('Read connectors as signposts', 'Lire les connecteurs comme des panneaux'), b('Find the logical order', 'Trouver l’ordre logique'), b('Complete a text with the right connector', 'Compléter un texte avec le bon connecteur')],
    13,
    [
      card(b('Connectors as signposts', 'Les connecteurs, des panneaux'), b('**Addition**: de plus, en outre. **Opposition**: mais, cependant, pourtant, en revanche. **Cause**: car, en effet, puisque. **Consequence**: donc, ainsi, c’est pourquoi. **Example**: par exemple, notamment. **Conclusion**: enfin, en somme. Some TEF questions ask you to **choose the right connector** or to **put paragraphs in order**.', '**Addition** : de plus, en outre. **Opposition** : mais, cependant, pourtant, en revanche. **Cause** : car, en effet, puisque. **Conséquence** : donc, ainsi, c’est pourquoi. **Exemple** : par exemple, notamment. **Conclusion** : enfin, en somme. Certaines questions du TEF demandent de **choisir le bon connecteur** ou de **remettre des paragraphes dans l’ordre**.')),
      gap(P.completeText, 'Le covoiturage se développe rapidement. ___ , il permet de réduire les frais de transport. ___ , il limite la pollution. ___ , certains utilisateurs regrettent le manque de flexibilité des horaires.', [['D’abord', 'Tout d’abord', 'En effet'], ['De plus', 'En outre', 'Ensuite'], ['Cependant', 'Pourtant', 'Toutefois', 'En revanche']]),
      mc(P.choose, ['pourtant', 'donc', 'par exemple', 'de plus'], { fr: 'Il a beaucoup révisé ; ___ , il a échoué à l’examen.' }),
      sort(b('Function of the connector', 'Fonction du connecteur'), [b('opposition', 'opposition'), b('cause', 'cause'), b('consequence', 'conséquence')], [['en revanche', 0], ['puisque', 1], ['c’est pourquoi', 2], ['pourtant', 0], ['car', 1], ['ainsi', 2]]),
      ord(P.order, 'Le projet est ambitieux ; c’est pourquoi il faudra plusieurs années.', { tr: 'The project is ambitious; that’s why it will take several years.' }),
    ],
    [
      b('Connectors signal addition, opposition, cause, consequence, example.', 'Les connecteurs signalent addition, opposition, cause, conséquence, exemple.'),
      b('Use them to predict the next idea.', 'Utilisez-les pour prévoir l’idée suivante.'),
      b('For ordering paragraphs, follow connectors and pronouns.', 'Pour ordonner des paragraphes, suivez connecteurs et pronoms.'),
    ],
    [['le covoiturage', b('carpooling', 'partage de voiture')], ['la flexibilité', b('flexibility', 'souplesse')], ['échouer', b('to fail', 'ne pas réussir')]],
  ),
  lesson(C, 3, ['articles-and-viewpoint', 'articles-et-point-de-vue'],
    b('Articles and the writer’s viewpoint', 'Articles et point de vue de l’auteur'),
    b('Find information in an article and identify the author’s opinion.', 'Trouver l’information dans un article et identifier l’opinion de l’auteur.'),
    [b('Find details in an article', 'Trouver des détails dans un article'), b('Identify the opinion', 'Identifier l’opinion'), b('Understand words in context', 'Comprendre les mots en contexte')],
    13,
    [
      doc({ look: 'article', title: b('Les épiceries zéro déchet en difficulté', 'Les épiceries zéro déchet en difficulté'), text: 'Après des années de croissance, plusieurs épiceries « zéro déchet » ont fermé leurs portes. En cause : la hausse des prix, qui pousse les clients vers les supermarchés, et la concurrence de ces mêmes supermarchés, qui proposent désormais leurs propres rayons de vrac. Faut-il pour autant parler d’échec ? Pas vraiment : si ces petites boutiques souffrent, leurs idées, elles, se sont imposées partout.' }, b('According to the author, why do these shops struggle?', 'Selon l’auteur, pourquoi ces boutiques sont-elles en difficulté ?'), [b('rising prices and competition from supermarkets', 'la hausse des prix et la concurrence des supermarchés'), b('customers dislike bulk products', 'les clients n’aiment pas le vrac'), b('a new law', 'une nouvelle loi'), b('lack of staff', 'le manque de personnel')], { timer: 90 }),
      mc(P.choose, [b('The shops suffer, but their ideas have spread: it is not really a failure.', 'Les boutiques souffrent, mais leurs idées se sont répandues : ce n’est pas vraiment un échec.'), b('It is a total failure.', 'C’est un échec total.'), b('Zero-waste is a bad idea.', 'Le zéro déchet est une mauvaise idée.'), b('Supermarkets will close.', 'Les supermarchés vont fermer.')], { fr: 'Quelle est l’opinion de l’auteur dans la dernière phrase ?' }),
      mc(P.meaning, [b('have become widely accepted', 'ont été largement adoptées'), b('have been forced by law', 'ont été imposées par la loi'), b('have disappeared', 'ont disparu'), b('have become expensive', 'sont devenues chères')], { fr: '« leurs idées, elles, se sont imposées partout » :' }),
      tip(b('Words in context', 'Les mots en contexte'), b('When a question asks the meaning of a word, **re-read the whole sentence** and replace the word with each option: the right one keeps the **logic of the sentence**.', 'Quand une question porte sur le sens d’un mot, **relisez toute la phrase** et remplacez le mot par chaque option : la bonne conserve **la logique de la phrase**.')),
      pairs(P.match, [['en cause', b('the reason being', 'la cause est')], ['le vrac', b('bulk (unpackaged)', 'sans emballage')], ['la concurrence', b('competition', 'rivalité commerciale')], ['pour autant', b('for all that', 'malgré cela')]]),
    ],
    [
      b('Find details: question first, then scan the paragraph.', 'Détails : la question d’abord, puis parcourez le paragraphe.'),
      b('Opinion often appears at the end, after a question or « pourtant ».', 'L’opinion apparaît souvent à la fin, après une question ou « pourtant ».'),
      b('Meaning in context: test each option in the sentence.', 'Sens en contexte : testez chaque option dans la phrase.'),
    ],
    [['fermer ses portes', b('to close down', 'cesser son activité')], ['un rayon', b('a section (shop)', 'partie du magasin')], ['s’imposer', b('to become established', 'être adopté')]],
  ),
];
