import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, doc, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Whether you are a student, a parent or a learner yourself, school vocabulary is everywhere. This beginner course covers classroom objects and instructions, school subjects and timetables, and student life (exams, homework, university). You will learn to say what you study, which subjects you like and to understand a simple timetable, in France and in Québec (where école secondaire, cégep and université follow each other).',
    'Que vous soyez élève, parent ou vous-même apprenant, le vocabulaire de l’école est partout. Ce cours pour débutants couvre les objets et consignes de la classe, les matières et l’emploi du temps, et la vie étudiante (examens, devoirs, université). Vous apprendrez à dire ce que vous étudiez, quelles matières vous aimez et à comprendre un emploi du temps simple, en France et au Québec (où se suivent école secondaire, cégep et université).',
  ),
  outcomes: [
    b('Name classroom objects', 'Nommer les objets de la classe'),
    b('Understand classroom instructions', 'Comprendre les consignes de la classe'),
    b('Talk about school subjects', 'Parler des matières'),
    b('Read a simple timetable', 'Lire un emploi du temps simple'),
  ],
};

const C = 'b-school-studies';
export default [
  lesson(C, 1, ['in-the-classroom', 'dans-la-salle-de-classe'],
    b('In the classroom', 'Dans la salle de classe'),
    b('Name classroom objects and understand the teacher’s instructions.', 'Nommer les objets de la classe et comprendre les consignes du professeur.'),
    [b('Name objects', 'Nommer les objets'), b('Understand instructions', 'Comprendre les consignes'), b('Ask to borrow something', 'Demander à emprunter quelque chose')],
    13,
    [
      card(b('Classroom words', 'Les mots de la classe'), b('**un cahier, un stylo, un crayon, une gomme, une règle, un livre, une trousse, un sac, le tableau, une table, une chaise**. Instructions: **Ouvrez vos livres. · Écoutez. · Répétez. · Lisez le texte. · Écrivez la réponse. · Levez la main. · Travaillez à deux.** Borrow: **Tu peux me prêter un stylo ?**', '**un cahier, un stylo, un crayon, une gomme, une règle, un livre, une trousse, un sac, le tableau, une table, une chaise**. Consignes : **Ouvrez vos livres. · Écoutez. · Répétez. · Lisez le texte. · Écrivez la réponse. · Levez la main. · Travaillez à deux.** Emprunter : **Tu peux me prêter un stylo ?**')),
      flash(b('Classroom objects', 'Objets de la classe'), [['un cahier', b('a notebook', 'pour écrire')], ['une gomme', b('an eraser', 'pour effacer')], ['une règle', b('a ruler', 'pour tracer')], ['une trousse', b('a pencil case', 'pour les stylos')], ['le tableau', b('the board', 'au mur de la classe')]]),
      hear('Bonjour à tous ! Ouvrez vos livres à la page vingt-trois et écoutez bien.', b('What page?', 'Quelle page ?'), [b('23', '23'), b('33', '33'), b('13', '13'), b('20', '20')], { voice: 'f' }),
      pairs(P.match, [['Levez la main.', b('Raise your hand.', 'pour parler')], ['Travaillez à deux.', b('Work in pairs.', 'avec un partenaire')], ['Répétez.', b('Repeat.', 'dites encore')], ['Fermez vos livres.', b('Close your books.', 'livres fermés')]]),
      mc(P.best, ['Tu peux me prêter une gomme, s’il te plaît ?', 'Gomme !', 'Donne gomme.', 'Je prends ta gomme.'], { fr: 'Vous demandez une gomme à votre voisin :' }),
      say('Tu peux me prêter un stylo, s’il te plaît ? Merci !', 'Can you lend me a pen, please? Thanks!'),
    ],
    [
      b('un cahier, un stylo, une gomme, une règle, le tableau.', 'un cahier, un stylo, une gomme, une règle, le tableau.'),
      b('Instructions: Ouvrez, Écoutez, Répétez, Écrivez, Levez la main.', 'Consignes : Ouvrez, Écoutez, Répétez, Écrivez, Levez la main.'),
      b('Tu peux me prêter… ?', 'Tu peux me prêter… ?'),
    ],
    [['prêter', b('to lend', 'donner pour un temps')], ['une page', b('a page', 'feuille d’un livre')], ['effacer', b('to erase', 'faire disparaître')]],
  ),
  lesson(C, 2, ['subjects-and-timetable', 'matieres-et-emploi-du-temps'],
    b('Subjects and timetable', 'Les matières et l’emploi du temps'),
    b('Name school subjects, say what you like and read a timetable.', 'Nommer les matières, dire ce qu’on aime et lire un emploi du temps.'),
    [b('Name subjects', 'Nommer les matières'), b('Say what you like and why', 'Dire ce qu’on aime et pourquoi'), b('Read a timetable', 'Lire un emploi du temps')],
    13,
    [
      card(b('School subjects', 'Les matières'), b('**les maths, le français, l’anglais, l’histoire, la géographie, les sciences, la physique, la chimie, la biologie, l’éducation physique (le sport), la musique, les arts plastiques, l’informatique**. **Ma matière préférée, c’est l’histoire. · J’adore les maths, c’est logique. · Je n’aime pas trop la chimie, c’est difficile.**', '**les maths, le français, l’anglais, l’histoire, la géographie, les sciences, la physique, la chimie, la biologie, l’éducation physique (le sport), la musique, les arts plastiques, l’informatique**. **Ma matière préférée, c’est l’histoire. · J’adore les maths, c’est logique. · Je n’aime pas trop la chimie, c’est difficile.**')),
      doc({ look: 'page', title: b('Timetable — Tuesday', 'Emploi du temps — mardi'), text: 'Heure | Matière | Salle\n8 h 30 | Mathématiques | 12\n9 h 30 | Anglais | 7\n10 h 30 | Récréation | —\n10 h 45 | Histoire-géographie | 15\n12 h | Déjeuner | cantine\n13 h 30 | Éducation physique | gymnase' }, b('What is at 10:45 and where?', 'Qu’y a-t-il à 10 h 45 et où ?'), [b('history-geography in room 15', 'histoire-géographie en salle 15'), b('English in room 7', 'anglais en salle 7'), b('maths in room 12', 'maths en salle 12'), b('PE in the gym', 'sport au gymnase')]),
      sort(b('Science or humanities?', 'Sciences ou lettres ?'), [b('sciences', 'sciences'), b('humanities / languages', 'lettres / langues')], [['la physique', 0], ['l’histoire', 1], ['la biologie', 0], ['le français', 1], ['la chimie', 0], ['l’anglais', 1]]),
      gap(P.complete, 'Ma matière ___ , c’est la musique. Je n’___ pas trop la chimie.', ['préférée', 'aime']),
      dlg(b('Favourite subjects', 'Les matières préférées'), undefined, [['Hugo', 'm'], ['Vous', 'f']], [
        [0, 'Tu préfères quelle matière ?', 'Which subject do you prefer?'],
        [1, { options: ['Ma matière préférée, c’est la biologie. J’adore les animaux !', 'Biologie matière.', 'Je préfère.'] }],
        [0, 'Moi, c’est l’informatique. Mais je n’aime pas trop l’histoire.', 'For me it’s computer science. But I don’t really like history.'],
        [1, { options: ['Ah bon ? Pourquoi ?', 'D’accord. Au revoir.', 'Moi aussi biologie.'] }],
      ]),
      say('Ma matière préférée, c’est l’histoire, mais je n’aime pas trop la chimie.', 'My favourite subject is history, but I don’t really like chemistry.'),
    ],
    [
      b('les maths, le français, l’histoire, les sciences, l’informatique…', 'les maths, le français, l’histoire, les sciences, l’informatique…'),
      b('Ma matière préférée, c’est… J’adore… Je n’aime pas trop…', 'Ma matière préférée, c’est… J’adore… Je n’aime pas trop…'),
      b('Timetable: heure, matière, salle, récréation, cantine.', 'Emploi du temps : heure, matière, salle, récréation, cantine.'),
    ],
    [['la récréation', b('break time (school)', 'pause entre les cours')], ['la cantine', b('the school canteen', 'restaurant scolaire')], ['le gymnase', b('the gym', 'salle de sport')]],
  ),
  lesson(C, 3, ['student-life', 'la-vie-etudiante'],
    b('Student life', 'La vie étudiante'),
    b('Talk about your studies, exams and homework.', 'Parler de ses études, de ses examens et de ses devoirs.'),
    [b('Say what you study', 'Dire ce qu’on étudie'), b('Talk about exams and homework', 'Parler des examens et des devoirs'), b('Know the school systems', 'Connaître les systèmes scolaires')],
    13,
    [
      card(b('Studies', 'Les études'), b('**Je suis étudiant(e) en droit / en informatique. · Je suis en deuxième année. · J’ai un examen demain. · Je dois réviser. · J’ai beaucoup de devoirs. · J’ai réussi / raté mon examen. · J’ai eu une bonne note.**', '**Je suis étudiant(e) en droit / en informatique. · Je suis en deuxième année. · J’ai un examen demain. · Je dois réviser. · J’ai beaucoup de devoirs. · J’ai réussi / raté mon examen. · J’ai eu une bonne note.**')),
      culture(b('School systems', 'Les systèmes scolaires'), b('**France**: école maternelle → école primaire → collège (11–15) → lycée (15–18, le bac) → université. **Québec**: école primaire → école secondaire (12–17) → **cégep** (2 or 3 years, pre-university or technical) → université. Marks: France /20, Québec in %.', '**France** : école maternelle → école primaire → collège (11–15 ans) → lycée (15–18 ans, le bac) → université. **Québec** : école primaire → école secondaire (12–17 ans) → **cégep** (2 ou 3 ans, préuniversitaire ou technique) → université. Notes : France sur 20, Québec en %.'), { variant: 'culture' }),
      mc(P.best, ['Je suis étudiante en informatique, en deuxième année.', 'J’étudie étudiante informatique deux.', 'Je suis informatique.', 'Je fais étudiant.'], { fr: '— Tu fais quoi comme études ?' }),
      sort(b('Good news or bad news?', 'Bonne ou mauvaise nouvelle ?'), [b('good', 'bonne'), b('bad', 'mauvaise')], [['J’ai réussi mon examen.', 0], ['J’ai raté le bus et l’examen.', 1], ['J’ai eu 17 sur 20.', 0], ['J’ai eu une mauvaise note.', 1], ['J’ai obtenu mon diplôme.', 0], ['Je dois repasser l’examen.', 1]]),
      ord(P.order, 'J’ai un examen demain, je dois réviser ce soir.', { tr: 'I have an exam tomorrow, I must revise tonight.' }),
      dict('Je suis étudiant en deuxième année et j’ai beaucoup de devoirs.', {}),
      write(b('About your studies', 'Vos études'), b('Write 3–4 sentences (25–45 words) about your studies or your French classes: what you study, what you like, a recent exam.', 'Écrivez 3 ou 4 phrases (25–45 mots) sur vos études ou vos cours de français : ce que vous étudiez, ce que vous aimez, un examen récent.'), 25, 45, [
        b('What you study', 'Ce que vous étudiez'),
        b('What you like', 'Ce que vous aimez'),
        b('An exam or homework', 'Un examen ou des devoirs'),
      ], 'J’apprends le français depuis six mois. J’adore la grammaire, mais la prononciation est difficile. La semaine dernière, j’ai eu un examen oral et j’ai eu une bonne note : 16 sur 20 !'),
    ],
    [
      b('Je suis étudiant(e) en… · Je suis en … année.', 'Je suis étudiant(e) en… · Je suis en … année.'),
      b('J’ai un examen · réviser · réussir / rater · une note.', 'J’ai un examen · réviser · réussir / rater · une note.'),
      b('France: collège, lycée, bac; Québec: secondaire, cégep.', 'France : collège, lycée, bac ; Québec : secondaire, cégep.'),
    ],
    [['réviser', b('to revise, to study', 'relire pour l’examen')], ['une note', b('a mark, a grade', 'résultat chiffré')], ['un diplôme', b('a degree, a diploma', 'titre obtenu')]],
  ),
];
