import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, doc, exam, gap, hear, lesson, mc, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The DELF Junior and DELF Scolaire are the same official diplomas as the DELF, with topics adapted to teenagers: school, friends, hobbies, social media, family life. This course prepares 12–17-year-old learners (and their parents or teachers) with teen-friendly documents, model answers and simple strategies for each of the four tests at A2 level.',
    'Le DELF junior et le DELF scolaire sont les mêmes diplômes officiels que le DELF, avec des thèmes adaptés aux adolescents : école, amis, loisirs, réseaux sociaux, vie de famille. Ce cours prépare les apprenants de 12 à 17 ans (et leurs parents ou enseignants) avec des documents adaptés, des réponses modèles et des stratégies simples pour chacune des quatre épreuves au niveau A2.',
  ),
  outcomes: [
    b('Understand teen-topic documents', 'Comprendre des documents sur des thèmes d’ados'),
    b('Write a message to a friend or a forum', 'Écrire un message à un ami ou sur un forum'),
    b('Talk about school, friends and hobbies', 'Parler de l’école, des amis et des loisirs'),
    b('Manage stress and time on exam day', 'Gérer le stress et le temps le jour J'),
  ],
};

const C = 'delf-junior';
export default [
  lesson(C, 1, ['teen-topics-comprehension', 'comprehension-themes-ados'],
    b('Comprehension: teen topics', 'Compréhension : thèmes ados'),
    b('Understand messages, posters and recordings about school and leisure.', 'Comprendre messages, affiches et enregistrements sur l’école et les loisirs.'),
    [b('Know the Junior format', 'Connaître le format junior'), b('Understand school notices', 'Comprendre les avis scolaires'), b('Understand teen conversations', 'Comprendre des conversations d’ados')],
    13,
    [
      exam(b('DELF Junior / Scolaire', 'DELF junior / scolaire'), b('Same **four tests** and the same **diploma value** as the adult DELF (each test /25, pass at 50/100 with at least 5/25 per test). Only the **topics** change: **le collège, les profs, les copains, les loisirs, les réseaux sociaux, les sorties scolaires**. The **Scolaire** version is organised through schools.', 'Mêmes **quatre épreuves** et même **valeur du diplôme** que le DELF adulte (chaque épreuve /25, réussite à 50/100 avec au moins 5/25 par épreuve). Seuls les **thèmes** changent : **le collège, les profs, les copains, les loisirs, les réseaux sociaux, les sorties scolaires**. La version **scolaire** est organisée par les établissements.')),
      doc({ look: 'notice', title: b('School notice', 'Avis du collège'), text: 'SORTIE SCOLAIRE — CLASSES DE 4e\nVisite du musée des Sciences le jeudi 14 mars\nDépart : 8 h 15 devant le collège — Retour : 16 h 30\nPrévoir : un pique-nique, une bouteille d’eau, un cahier\nAutorisation parentale à rendre avant le lundi 11 mars' }, b('What must be returned before 11 March?', 'Que faut-il rendre avant le 11 mars ?'), [b('the parental permission', 'l’autorisation parentale'), b('a notebook', 'un cahier'), b('the museum ticket', 'le billet du musée'), b('a picnic', 'un pique-nique')]),
      hear('Salut Léo ! C’est Inès. Tu viens au cinéma samedi ? On se retrouve à quatorze heures devant la médiathèque. Apporte ton skate, on ira au parc après !', b('Where do they meet?', 'Où se retrouvent-ils ?'), [b('in front of the media library', 'devant la médiathèque'), b('at the cinema', 'au cinéma'), b('at the park', 'au parc'), b('at school', 'au collège')], { voice: 'f' }),
      pairs(P.match, [['un prof', b('a teacher (informal)', 'professeur')], ['un copain', b('a friend, a mate', 'ami')], ['le collège', b('middle school (11–15)', 'école des 11–15 ans')], ['une sortie scolaire', b('a school trip', 'visite avec la classe')]]),
      sort(b('School or leisure?', 'École ou loisirs ?'), [b('school', 'école'), b('leisure', 'loisirs')], [['le cours de maths', 0], ['le skate', 1], ['les devoirs', 0], ['un jeu vidéo', 1], ['la cantine', 0], ['un concert', 1]]),
    ],
    [
      b('Same diploma as the DELF, teen topics.', 'Même diplôme que le DELF, thèmes ados.'),
      b('Topics: collège, copains, loisirs, réseaux sociaux.', 'Thèmes : collège, copains, loisirs, réseaux sociaux.'),
      b('Look for date, time, place and what to bring.', 'Repérez date, heure, lieu et ce qu’il faut apporter.'),
    ],
    [['une médiathèque', b('a media library', 'bibliothèque moderne')], ['une autorisation', b('a permission slip', 'accord écrit')], ['prévoir', b('to plan, to bring', 'apporter, organiser')]],
  ),
  lesson(C, 2, ['writing-to-friends-and-forums', 'ecrire-a-un-ami-ou-sur-un-forum'],
    b('Writing: messages and forums', 'Écrire : messages et forums'),
    b('Write a message to a friend or a forum post, at A2 level.', 'Écrire un message à un ami ou un message de forum, au niveau A2.'),
    [b('Write to a friend (tu)', 'Écrire à un ami (tu)'), b('Write a forum post', 'Écrire un message de forum'), b('Tell an event in the past', 'Raconter un événement au passé')],
    13,
    [
      card(b('Messages and forums', 'Messages et forums'), b('A2 writing: about **60–80 words**, often to **tell an event** or **give your opinion**: a school trip, a birthday, a new hobby. Tone: **tu**, friendly: **Salut ! · Tu sais quoi ? · C’était trop bien ! · Et toi ? · À plus !** Use **passé composé** for events, **imparfait** for descriptions (c’était, il faisait).', 'Production écrite A2 : environ **60 à 80 mots**, souvent pour **raconter un événement** ou **donner son avis** : une sortie scolaire, un anniversaire, un nouveau loisir. Ton : **tu**, amical : **Salut ! · Tu sais quoi ? · C’était trop bien ! · Et toi ? · À plus !** Passé composé pour les événements, **imparfait** pour les descriptions (c’était, il faisait).')),
      mc(P.best, ['Salut Emma ! Samedi, je suis allé au concert de mon groupe préféré avec mon cousin. Il y avait beaucoup de monde et l’ambiance était géniale. On a chanté toutes les chansons ! Et toi, tu as fait quoi ce week-end ? À plus, Hugo', 'Concert samedi. Bien. Hugo.', 'Madame, je vous écris pour vous informer de ma présence au concert.', 'Le concert est une forme de spectacle musical.'], { fr: 'Consigne : « Racontez à un ami un concert où vous êtes allé(e) (60 mots minimum). » Quelle réponse est la meilleure ?' }),
      gap(P.complete, 'Hier, on ___ (aller) au musée avec la classe. C’___ (être) super intéressant !', [['est allés', 'est allé', 'est allées'], 'était']),
      write(b('Forum post', 'Message de forum'), b('A forum asks: « Quel est votre loisir préféré ? » Write your answer (60–80 words): what it is, since when, why you like it, a recent memory.', 'Un forum demande : « Quel est votre loisir préféré ? » Écrivez votre réponse (60–80 mots) : lequel, depuis quand, pourquoi vous l’aimez, un souvenir récent.'), 60, 80, [
        b('Your hobby and since when', 'Votre loisir et depuis quand'),
        b('Why you like it', 'Pourquoi vous l’aimez'),
        b('A recent memory in the past', 'Un souvenir récent au passé'),
      ], 'Salut à tous ! Mon loisir préféré, c’est le basket. J’en fais depuis trois ans dans un club près de chez moi. J’adore ce sport parce qu’on joue en équipe et c’est très rapide. Le mois dernier, on a gagné un tournoi contre une autre ville : c’était le plus beau jour de l’année ! Et vous, vous faites quoi ?'),
      tip(b('Re-read with a checklist', 'Relisez avec une liste'), b('Before handing in: **all points answered? word count? greetings? past tenses with the right auxiliary (je suis allé / j’ai vu)? accents?**', 'Avant de rendre : **tous les points traités ? nombre de mots ? salutations ? passés composés avec le bon auxiliaire (je suis allé / j’ai vu) ? accents ?**')),
    ],
    [
      b('About 60–80 words; friendly tone with tu.', 'Environ 60–80 mots ; ton amical avec tu.'),
      b('Passé composé for events, imparfait for description.', 'Passé composé pour les événements, imparfait pour la description.'),
      b('Finish with a question to the reader.', 'Terminez par une question au lecteur.'),
    ],
    [['un tournoi', b('a tournament', 'compétition')], ['l’ambiance', b('the atmosphere', 'climat d’un lieu')], ['À plus !', b('See you! (informal)', 'à plus tard')]],
  ),
  lesson(C, 3, ['speaking-and-exam-day', 'oral-et-jour-j'],
    b('Speaking, and exam day', 'L’oral et le jour J'),
    b('Talk about yourself and your school life, and manage the exam day.', 'Parler de soi et de sa vie scolaire, et gérer le jour de l’examen.'),
    [b('Talk about school and friends', 'Parler de l’école et des amis'), b('Role-play with a friend (tu)', 'Jeu de rôle avec un ami (tu)'), b('Manage stress and time', 'Gérer le stress et le temps')],
    13,
    [
      card(b('Teen oral topics', 'Sujets oraux ados'), b('**Parlez de votre collège / lycée. · Décrivez votre meilleur(e) ami(e). · Que faites-vous après l’école ? · Racontez une sortie scolaire. · Que pensez-vous des réseaux sociaux ?** In the role-play, the examiner often plays **a friend** (tu) or **a teacher / shop assistant** (vous).', '**Parlez de votre collège / lycée. · Décrivez votre meilleur(e) ami(e). · Que faites-vous après l’école ? · Racontez une sortie scolaire. · Que pensez-vous des réseaux sociaux ?** Dans le jeu de rôle, l’examinateur joue souvent **un ami** (tu) ou **un professeur / un vendeur** (vous).')),
      say('Je suis en troisième au collège Victor-Hugo. Ma matière préférée, c’est l’histoire. Après l’école, je fais du foot avec mes copains.', 'I’m in Year 10 at Victor-Hugo school. My favourite subject is history. After school I play football with my friends.'),
      dlg(b('Role-play: planning an outing with a friend', 'Jeu de rôle : organiser une sortie avec un ami'), undefined, [['Examinatrice (amie)', 'f'], ['Vous', 'm']], [
        [0, 'Salut ! On fait quoi samedi ?', 'Hi! What shall we do on Saturday?'],
        [1, { options: ['Salut ! Ça te dit d’aller à la piscine l’après-midi ?', 'Bonjour madame, je voudrais une piscine.', 'Samedi.'] }],
        [0, 'Bof, je n’aime pas trop nager. Autre chose ?', 'Meh, I don’t really like swimming. Something else?'],
        [1, { options: ['Alors, on pourrait aller au cinéma ? Il y a un nouveau film d’aventure.', 'Non, piscine.', 'Je ne sais pas.'] }],
        [0, 'Bonne idée ! À quelle heure ?', 'Good idea! What time?'],
        [1, { options: ['La séance est à 15 h. On se retrouve devant le cinéma à 14 h 45 ?', 'Le soir, tard.', 'Quand tu veux.'] }],
      ]),
      culture(b('Exam day', 'Le jour J'), b('Bring your **convocation** and **ID**, arrive **early**. During written tests, **watch the clock** and leave 5 minutes to re-read. At the oral, it’s normal to be nervous: **breathe**, smile, and if you don’t understand, ask: **Pouvez-vous répéter, s’il vous plaît ?**', 'Apportez votre **convocation** et votre **pièce d’identité**, arrivez **en avance**. Pendant les épreuves écrites, **surveillez l’heure** et gardez 5 minutes pour relire. À l’oral, le stress est normal : **respirez**, souriez, et si vous ne comprenez pas, demandez : **Pouvez-vous répéter, s’il vous plaît ?**'), { variant: 'culture' }),
      sort(b('Tu or vous in the role-play?', 'Tu ou vous dans le jeu de rôle ?'), [b('tu', 'tu'), b('vous', 'vous')], [['un copain de classe', 0], ['la directrice du collège', 1], ['ta sœur', 0], ['un vendeur', 1], ['ton cousin', 0], ['une bibliothécaire', 1]]),
      mc(P.best, ['Pardon, pouvez-vous répéter la question, s’il vous plaît ?', 'Quoi ?', 'Je ne sais pas, au revoir.', 'Hein ?'], { fr: 'Vous n’avez pas compris la question de l’examinateur :' }),
    ],
    [
      b('Topics: school, friends, hobbies, social media, trips.', 'Thèmes : école, amis, loisirs, réseaux sociaux, sorties.'),
      b('Role-play: tu with a friend, vous with an adult.', 'Jeu de rôle : tu avec un ami, vous avec un adulte.'),
      b('Exam day: convocation, ID, early, watch the time.', 'Jour J : convocation, pièce d’identité, en avance, surveiller l’heure.'),
    ],
    [['la convocation', b('the exam notice', 'lettre d’examen')], ['en troisième', b('in Year 10 / 9th grade', 'dernière année de collège')], ['respirer', b('to breathe', 'inspirer et expirer')]],
  ),
];
