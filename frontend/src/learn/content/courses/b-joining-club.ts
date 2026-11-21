import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Joining a gym, a choir, a football team or a language exchange is the best way to make friends and practise French. This course gives you the language to find an activity, ask for information (days, times, prices, level), fill in a registration form, take part in your first session and chat with other members.',
    'S’inscrire à une salle de sport, une chorale, une équipe de football ou un café-langues est le meilleur moyen de se faire des amis et de pratiquer le français. Ce cours vous donne la langue pour trouver une activité, se renseigner (jours, horaires, prix, niveau), remplir un formulaire d’inscription, participer à sa première séance et discuter avec les autres membres.',
  ),
  outcomes: [
    b('Ask for information about an activity', 'Se renseigner sur une activité'),
    b('Fill in a registration form', 'Remplir un formulaire d’inscription'),
    b('Take part in a first session', 'Participer à une première séance'),
    b('Chat with other members', 'Discuter avec les autres membres'),
  ],
};

const C = 'b-joining-club';
export default [
  lesson(C, 1, ['asking-for-information', 'se-renseigner'],
    b('Asking for information', 'Se renseigner'),
    b('Ask about days, times, prices, level and equipment.', 'Demander les jours, horaires, prix, niveau et équipement.'),
    [b('Ask about schedule and price', 'Demander horaires et prix'), b('Ask about level and equipment', 'Demander niveau et équipement'), b('Ask for a trial session', 'Demander une séance d’essai')],
    13,
    [
      card(b('Asking', 'Se renseigner'), b('**Bonjour, je voudrais des renseignements sur les cours de yoga. · Les cours ont lieu quels jours ? · Ça coûte combien par mois / à l’année ? · C’est pour quel niveau ? Je suis débutant(e). · Il faut apporter quelque chose ? · Est-ce qu’on peut faire un cours d’essai ?**', '**Bonjour, je voudrais des renseignements sur les cours de yoga. · Les cours ont lieu quels jours ? · Ça coûte combien par mois / à l’année ? · C’est pour quel niveau ? Je suis débutant(e). · Il faut apporter quelque chose ? · Est-ce qu’on peut faire un cours d’essai ?**')),
      doc({ look: 'ad', title: b('Club ad', 'Annonce de club'), text: 'CHORALE « LES VOIX DU QUARTIER »\nRépétitions le mercredi de 19 h à 21 h, salle municipale\nTous niveaux, aucune connaissance musicale nécessaire\nCotisation : 90 € par an\nPremière répétition gratuite !\nContact : chorale.quartier@exemple.org' }, b('What is free?', 'Qu’est-ce qui est gratuit ?'), [b('the first rehearsal', 'la première répétition'), b('the whole year', 'toute l’année'), b('the sheet music', 'les partitions'), b('nothing', 'rien')]),
      mc(P.best, ['Bonjour, je voudrais des renseignements sur les cours de natation pour débutants.', 'Natation. Combien ?', 'Je veux nager, vous avez quoi ?', 'C’est quoi, ici ?'], { fr: 'Vous appelez la piscine municipale :' }),
      sort(b('Schedule, price or level?', 'Horaire, prix ou niveau ?'), [b('schedule', 'horaire'), b('price', 'prix'), b('level', 'niveau')], [['le mardi à 18 h', 0], ['30 € par mois', 1], ['pour débutants', 2], ['deux fois par semaine', 0], ['la cotisation annuelle', 1], ['niveau intermédiaire', 2]]),
      gap(P.complete, 'Les cours ont ___ quels jours ? Est-ce qu’on peut faire un cours d’___ ?', ['lieu', 'essai']),
      say('Bonjour, je voudrais des renseignements. Les cours ont lieu quels jours, et ça coûte combien ?', 'Hello, I’d like some information. What days are the classes, and how much does it cost?'),
    ],
    [
      b('Je voudrais des renseignements sur…', 'Je voudrais des renseignements sur…'),
      b('Quels jours ? Combien ? Quel niveau ? Il faut apporter… ?', 'Quels jours ? Combien ? Quel niveau ? Il faut apporter… ?'),
      b('un cours d’essai, la cotisation, débutant.', 'un cours d’essai, la cotisation, débutant.'),
    ],
    [['les renseignements', b('information', 'informations')], ['une cotisation', b('a membership fee', 'somme annuelle')], ['une répétition', b('a rehearsal', 'séance d’entraînement musical')]],
  ),
  lesson(C, 2, ['registration', 'l-inscription'],
    b('Registration', 'L’inscription'),
    b('Fill in a registration form and understand the documents required.', 'Remplir un formulaire d’inscription et comprendre les documents demandés.'),
    [b('Fill in a form', 'Remplir un formulaire'), b('Understand required documents', 'Comprendre les documents demandés'), b('Ask about payment', 'Demander les modalités de paiement')],
    13,
    [
      card(b('Registration form', 'Le formulaire d’inscription'), b('**Nom, prénom, date de naissance, adresse, courriel, téléphone, personne à contacter en cas d’urgence, niveau, signature**. Documents: **un certificat médical** (often required for sports in France), **une photo d’identité, un justificatif de domicile**. Payment: **On peut payer en plusieurs fois ? · Il y a un tarif réduit pour les étudiants ?**', '**Nom, prénom, date de naissance, adresse, courriel, téléphone, personne à contacter en cas d’urgence, niveau, signature**. Documents : **un certificat médical** (souvent demandé pour le sport en France), **une photo d’identité, un justificatif de domicile**. Paiement : **On peut payer en plusieurs fois ? · Il y a un tarif réduit pour les étudiants ?**')),
      culture(b('Les associations', 'Les associations'), b('In France, many activities are run by **associations** (non-profit clubs) with a yearly **cotisation** and a **certificat médical** for sports. In Québec, cities offer many **activités de loisirs** with online registration each season. **La rentrée** (September) is the big registration period.', 'En France, beaucoup d’activités sont proposées par des **associations** avec une **cotisation** annuelle et un **certificat médical** pour le sport. Au Québec, les villes proposent de nombreuses **activités de loisirs** avec inscription en ligne à chaque saison. **La rentrée** (septembre) est la grande période d’inscription.'), { variant: 'culture' }),
      pairs(P.match, [['la date de naissance', b('date of birth', 'jour où l’on est né')], ['un certificat médical', b('a medical certificate', 'papier du médecin')], ['une personne à contacter', b('an emergency contact', 'en cas de problème')], ['payer en plusieurs fois', b('to pay in instalments', 'payer en plusieurs parties')]]),
      hear('Pour l’inscription, il faut le formulaire rempli, un certificat médical de moins de trois mois et le paiement. Vous pouvez payer en trois fois.', b('What medical document is needed?', 'Quel document médical faut-il ?'), [b('a certificate less than 3 months old', 'un certificat de moins de trois mois'), b('a blood test', 'une prise de sang'), b('a vaccination card', 'un carnet de vaccination'), b('nothing', 'rien')], { voice: 'f' }),
      mc(P.best, ['Est-ce qu’on peut payer en plusieurs fois ?', 'Je ne paie pas tout.', 'C’est trop cher, au revoir.', 'Payer plus tard ou jamais ?'], { fr: 'Vous voulez étaler le paiement :' }),
      say('Est-ce qu’il faut un certificat médical ? Et on peut payer en plusieurs fois ?', 'Do I need a medical certificate? And can I pay in instalments?'),
    ],
    [
      b('Form: nom, prénom, date de naissance, coordonnées, contact d’urgence.', 'Formulaire : nom, prénom, date de naissance, coordonnées, contact d’urgence.'),
      b('Documents: certificat médical, photo, justificatif.', 'Documents : certificat médical, photo, justificatif.'),
      b('Payer en plusieurs fois · tarif réduit.', 'Payer en plusieurs fois · tarif réduit.'),
    ],
    [['une association', b('a non-profit club', 'groupe à but non lucratif')], ['la rentrée', b('back to school (September)', 'reprise en septembre')], ['étaler', b('to spread out', 'répartir')]],
  ),
  lesson(C, 3, ['first-session', 'la-premiere-seance'],
    b('The first session', 'La première séance'),
    b('Introduce yourself to the group, follow instructions and chat after the session.', 'Se présenter au groupe, suivre les consignes et discuter après la séance.'),
    [b('Introduce yourself to the group', 'Se présenter au groupe'), b('Understand the coach’s instructions', 'Comprendre les consignes de l’entraîneur'), b('Chat after the session', 'Discuter après la séance')],
    13,
    [
      card(b('First time', 'La première fois'), b('**Bonjour, je suis nouveau / nouvelle, c’est ma première séance.** Coach: **Échauffez-vous. · Mettez-vous par deux. · Levez les bras. · On recommence. · Pause de cinq minutes. · Bien joué !** After: **Ça fait longtemps que tu viens ? · Tu viens aussi la semaine prochaine ? · On prend un verre après ?**', '**Bonjour, je suis nouveau / nouvelle, c’est ma première séance.** Entraîneur : **Échauffez-vous. · Mettez-vous par deux. · Levez les bras. · On recommence. · Pause de cinq minutes. · Bien joué !** Après : **Ça fait longtemps que tu viens ? · Tu viens aussi la semaine prochaine ? · On prend un verre après ?**')),
      hear('Bonjour à tous ! On commence par dix minutes d’échauffement, puis mettez-vous par deux pour les passes. On finit par un petit match.', b('What do they do after the warm-up?', 'Que font-ils après l’échauffement ?'), [b('passes in pairs', 'des passes par deux'), b('a long run', 'une longue course'), b('a break', 'une pause'), b('go home', 'rentrer chez eux')], { voice: 'm' }),
      dlg(b('After the session', 'Après la séance'), undefined, [['Karim', 'm'], ['Vous', 'f']], [
        [0, 'Salut ! Tu es nouvelle, non ?', 'Hi! You’re new, aren’t you?'],
        [1, { options: ['Oui, c’est ma première séance. Ça fait longtemps que tu viens ?', 'Oui. Au revoir.', 'Non, je suis vieille.'] }],
        [0, 'Deux ans ! L’ambiance est super. On prend un verre après, tu viens ?', 'Two years! The atmosphere is great. We’re having a drink afterwards, coming?'],
        [1, { options: ['Avec plaisir ! C’est une bonne occasion de pratiquer mon français.', 'Non, jamais.', 'Pourquoi ?'] }],
      ]),
      sort(b('Coach or member?', 'Entraîneur ou membre ?'), [b('coach', 'entraîneur'), b('member', 'membre')], [['Échauffez-vous.', 0], ['Ça fait longtemps que tu viens ?', 1], ['Mettez-vous par deux.', 0], ['Tu viens la semaine prochaine ?', 1], ['On recommence !', 0], ['On prend un verre après ?', 1]]),
      dict('C’est ma première séance. Ça fait longtemps que tu viens ?', {}),
      write(b('A message to the club', 'Un message au club'), b('Write a short message (25–45 words) to a club: say you want to join, ask two questions (days, price, level) and ask for a trial session.', 'Écrivez un court message (25–45 mots) à un club : dites que vous voulez vous inscrire, posez deux questions (jours, prix, niveau) et demandez une séance d’essai.'), 25, 45, [
        b('Say what you want', 'Dire ce que vous voulez'),
        b('Two questions', 'Deux questions'),
        b('Ask for a trial session', 'Demander une séance d’essai'),
      ], 'Bonjour, je voudrais m’inscrire au club de badminton. Je suis débutante. Les entraînements ont lieu quels jours, et quelle est la cotisation ? Est-ce que je peux faire une séance d’essai ? Merci beaucoup, Lina'),
    ],
    [
      b('Je suis nouveau / nouvelle, c’est ma première séance.', 'Je suis nouveau / nouvelle, c’est ma première séance.'),
      b('Coach: Échauffez-vous, mettez-vous par deux, on recommence.', 'Entraîneur : Échauffez-vous, mettez-vous par deux, on recommence.'),
      b('Chat: Ça fait longtemps que tu viens ? On prend un verre ?', 'Discuter : Ça fait longtemps que tu viens ? On prend un verre ?'),
    ],
    [['s’échauffer', b('to warm up', 'préparer le corps')], ['l’ambiance', b('the atmosphere', 'climat du groupe')], ['une occasion', b('an opportunity', 'chance')]],
  ),
];
