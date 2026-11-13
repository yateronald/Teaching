// L'école de mes enfants (A2 → B1): the French a parent needs, from enrolment
// to the parent-teacher meeting, with the school systems of Québec and France,
// the daily messages, a call from the school and the report card.
import { b, type DialogueStep, type Doc, type Lesson, type McqStep, type T, type Voice } from '../../types';
import { card } from '../kit';

const hear = (voice: Voice, audio: string, prompt: T, options: T[], explain?: T): McqStep =>
  ({ kind: 'mcq', voice, audio, listen: true, prompt, options, answer: 0, ...(explain ? { explain } : {}) });
const q = (doc: Doc, prompt: T, options: T[], explain?: T): McqStep =>
  ({ kind: 'mcq', doc, prompt, options, answer: 0, ...(explain ? { explain } : {}) });

type Speaker = DialogueStep['speakers'][number];
const PARENT: Speaker = { name: 'Vous', voice: 'f2', side: 'r' };

const ENROL: Doc = { look: 'notice', title: b('A notice at the school', 'Un avis à l’école'), text: 'Inscriptions pour la rentrée\n\nDu 3 au 14 février, au secrétariat, de 8 h à 15 h.\n\nDocuments à apporter :\nActe de naissance de l’enfant | original\nPreuve de résidence | bail ou facture récente\nCarnet de vaccination | à jour\nDocuments d’immigration | s’il y a lieu\n\nAucune inscription par téléphone.' };
const PEDA: Doc = { look: 'email', title: b('A message from the school', 'Un message de l’école'), text: 'De : École des Érables\nObjet : Journée pédagogique du vendredi 7 mars\n\nChers parents,\n\nNous vous rappelons que le vendredi 7 mars est une journée pédagogique : il n’y aura pas de cours. Le service de garde sera ouvert de 7 h à 18 h pour les élèves inscrits, au coût de 16 $ pour la journée.\n\nPour inscrire votre enfant, remplissez le formulaire en ligne avant le lundi 3 mars.\n\nMerci,\nL’équipe du service de garde' };
const AGENDA: Doc = { look: 'letter', title: b('A note in the agenda', 'Un mot dans l’agenda'), text: 'Mardi 11 février\n\nBonjour,\n\nYanis a oublié ses devoirs trois fois cette semaine. Pourriez-vous vérifier son agenda chaque soir et signer la page de la semaine ? Il est capable de faire beaucoup mieux !\n\nMerci de votre collaboration,\nMme Gagnon' };

const lessons: Lesson[] = [
  {
    id: 'school-parents-1',
    slug: { en: 'the-school-system-and-enrolment', fr: 'le-systeme-scolaire-et-l-inscription' },
    title: b('The school system and enrolment', 'Le système scolaire et l’inscription'),
    summary: b('From daycare to cégep (and from crèche to lycée): the names of each level, the documents to enrol your child and the conversation at the school office.', 'De la garderie au cégep (et de la crèche au lycée) : le nom de chaque niveau, les documents pour inscrire votre enfant et la conversation au secrétariat.'),
    objectives: [b('Name the school levels in Québec and France', 'Nommer les niveaux scolaires au Québec et en France'), b('Prepare the documents for enrolment', 'Préparer les documents d’inscription'), b('Enrol your child at the school office', 'Inscrire votre enfant au secrétariat')],
    minutes: 13,
    steps: [
      card(b('School in Québec', 'L’école au Québec'), b('Here is the path of a child in Québec. Children usually start school in **maternelle** at 5 (sometimes at 4).', 'Voici le parcours d’un enfant au Québec. L’école commence habituellement en **maternelle** à 5 ans (parfois à 4 ans).'), { image: 'school-classroom', table: { head: [b('Age', 'Âge'), b('Level', 'Niveau')], rows: [['0 – 4', 'la garderie, le CPE'], ['5', 'la maternelle'], ['6 – 12', 'le primaire : 1re à 6e année'], ['12 – 17', 'le secondaire : secondaire 1 à 5'], ['17 +', 'le cégep, puis l’université']] } }),
      card(b('And in France?', 'Et en France ?'), b('In France the names change: **la crèche** (babies), **l’école maternelle** (3 to 6), **l’école élémentaire** with the classes **CP, CE1, CE2, CM1, CM2**, then **le collège** (from **la sixième** to **la troisième**: the numbers go down!) and **le lycée** (seconde, première, terminale) before **le bac**.', 'En France, les noms changent : **la crèche** (les bébés), **l’école maternelle** (3 à 6 ans), **l’école élémentaire** avec les classes **CP, CE1, CE2, CM1, CM2**, puis **le collège** (de **la sixième** à **la troisième** : les numéros descendent !) et **le lycée** (seconde, première, terminale) avant **le bac**.'), { variant: 'culture' }),
      { kind: 'categorize', prompt: b('Québec or France?', 'Québec ou France ?'), buckets: [b('Québec', 'Québec'), b('France', 'France')], items: [{ text: 'le cégep', bucket: 0 }, { text: 'secondaire 3', bucket: 0 }, { text: 'le CPE', bucket: 0 }, { text: 'le CM2', bucket: 1 }, { text: 'le lycée', bucket: 1 }, { text: 'la crèche', bucket: 1 }] },
      { kind: 'flashcards', title: b('The words of school', 'Les mots de l’école'), cards: [
        { fr: 'la rentrée', tr: b('the start of the school year', 'le début de l’année scolaire'), ex: 'La rentrée a lieu fin août.' },
        { fr: 'le bulletin', tr: b('the report card', 'les notes de l’élève'), ex: 'Le premier bulletin arrive en novembre.' },
        { fr: 'l’agenda', tr: b('the homework diary', 'le carnet des devoirs'), ex: 'Les devoirs sont notés dans l’agenda.' },
        { fr: 'le service de garde', tr: b('before- and after-school care', 'la garde des élèves avant et après les cours'), ex: 'Le service de garde ouvre à 7 h.' },
        { fr: 'la boîte à lunch', tr: b('the lunch box', 'le repas du midi apporté de la maison'), ex: 'N’oublie pas ta boîte à lunch !' },
        { fr: 'l’enseignant, l’enseignante', tr: b('the teacher', 'le professeur ; en France, le maître, la maîtresse'), ex: 'L’enseignante s’appelle Mme Gagnon.' },
      ] },
      q(ENROL, b('Can you enrol your child by phone?', 'Pouvez-vous inscrire votre enfant par téléphone ?'), [b('No, you must go to the school office', 'Non, il faut aller au secrétariat'), b('Yes, from 8 a.m. to 3 p.m.', 'Oui, de 8 h à 15 h'), b('Yes, until February 14', 'Oui, jusqu’au 14 février')]),
      q(ENROL, b('Which document proves where you live?', 'Quel document prouve où vous habitez ?'), [b('Your lease or a recent bill', 'Votre bail ou une facture récente'), b('The birth certificate', 'L’acte de naissance'), b('The vaccination record', 'Le carnet de vaccination')], b('“Preuve de résidence” = proof of address. The school depends on where you live.', '« Preuve de résidence » : l’école dépend de votre adresse.')),
      {
        kind: 'dialogue',
        title: b('At the school office', 'Au secrétariat de l’école'),
        speakers: [{ name: 'Secrétaire', voice: 'f', side: 'l' }, PARENT],
        lines: [
          { s: 0, fr: 'Bonjour, madame. Je peux vous aider ?', tr: 'Hello. Can I help you?' },
          { s: 1, choose: { options: ['Bonjour, je voudrais inscrire mon fils en deuxième année.', 'Bonjour, je voudrais inscrire mon fils au cégep, il a sept ans.', 'Bonjour, mon fils veut des devoirs.'], answer: 0 } },
          { s: 0, fr: 'Très bien. Vous avez son acte de naissance et une preuve de résidence ?', tr: 'Very well. Do you have his birth certificate and proof of address?' },
          { s: 1, choose: { options: ['Oui, voici son acte de naissance et mon bail.', 'Non, mais je connais mon adresse.', 'Oui, voici mon passeport de vacances.'], answer: 0 } },
          { s: 0, fr: 'Parfait. Est-ce qu’il aura besoin du service de garde ?', tr: 'Perfect. Will he need after-school care?' },
          { s: 1, choose: { options: ['Oui, le soir seulement. Il ferme à quelle heure ?', 'Non, il a déjà un garde du corps.', 'Je ne sais pas, il est en deuxième.'], answer: 0 } },
          { s: 0, fr: 'À dix-huit heures. Je vous donne le formulaire.', tr: 'At 6 p.m. Here is the form.' },
        ],
      },
      hear('f', 'Parfait. Est-ce qu’il aura besoin du service de garde ?', b('What does the secretary ask?', 'Que demande la secrétaire ?'), [b('If the child will need before/after-school care', 'Si l’enfant aura besoin du service de garde'), b('If the child needs a bodyguard', 'Si l’enfant a besoin d’un garde du corps'), b('If the child has a lunch box', 'Si l’enfant a une boîte à lunch')]),
      { kind: 'speak', prompt: b('Say it at the school office.', 'Dites-le au secrétariat.'), text: 'Je voudrais inscrire ma fille en maternelle pour la rentrée.', tr: b('I would like to enrol my daughter in kindergarten for the new school year.', 'Je souhaite inscrire ma fille en maternelle.') },
    ],
    notes: {
      points: [
        b('Québec: garderie / CPE → maternelle (5) → primaire (1re–6e année) → secondaire (1–5) → cégep.', 'Québec : garderie / CPE → maternelle (5 ans) → primaire (1re–6e année) → secondaire (1–5) → cégep.'),
        b('France: crèche → maternelle → élémentaire (CP–CM2) → collège (6e–3e) → lycée.', 'France : crèche → maternelle → élémentaire (CP–CM2) → collège (6e–3e) → lycée.'),
        b('To enrol: acte de naissance, preuve de résidence, carnet de vaccination.', 'Pour inscrire : acte de naissance, preuve de résidence, carnet de vaccination.'),
        b('“Je voudrais inscrire mon fils / ma fille en…”', '« Je voudrais inscrire mon fils / ma fille en… »'),
      ],
      vocab: [['inscrire', b('to enrol', 'faire entrer dans une école')], ['l’acte de naissance', b('birth certificate', 'le document de naissance')], ['le secrétariat', b('the school office', 'le bureau de l’administration')], ['la rentrée', b('back to school', 'le début de l’année')]],
    },
  },
  {
    id: 'school-parents-2',
    slug: { en: 'messages-from-the-school', fr: 'les-messages-de-l-ecole' },
    title: b('Messages from the school', 'Les messages de l’école'),
    summary: b('A day without classes, a note in the homework diary, a call because your child is ill: understand them, and write an absence note.', 'Une journée sans cours, un mot dans l’agenda, un appel parce que votre enfant est malade : comprenez-les et écrivez un mot d’absence.'),
    objectives: [b('Understand the school’s messages', 'Comprendre les messages de l’école'), b('React to a call from the school', 'Réagir à un appel de l’école'), b('Write an absence note', 'Écrire un mot d’absence')],
    minutes: 13,
    steps: [
      card(b('A calendar full of surprises', 'Un calendrier plein de surprises'), b('In Québec, watch for: **la journée pédagogique** (no classes, teachers are in training; the after-school service is often open, for a fee), **la semaine de relâche** (the winter break, in early March), **la sortie éducative** (a school outing), **la photo scolaire**. In France: **les vacances de la Toussaint, de Noël, d’hiver, de printemps**.', 'Au Québec, surveillez : **la journée pédagogique** (pas de cours, les enseignants sont en formation ; le service de garde est souvent ouvert, contre paiement), **la semaine de relâche** (les vacances d’hiver, début mars), **la sortie éducative**, **la photo scolaire**. En France : **les vacances de la Toussaint, de Noël, d’hiver, de printemps**.'), { variant: 'culture' }),
      q(PEDA, b('What happens on Friday, March 7?', 'Que se passe-t-il le vendredi 7 mars ?'), [b('No classes; the after-school service is open for $16', 'Pas de cours ; le service de garde est ouvert pour 16 $'), b('The school is completely closed', 'L’école est complètement fermée'), b('Classes end at 6 p.m.', 'Les cours finissent à 18 h')]),
      q(PEDA, b('What must you do to use the service that day?', 'Que devez-vous faire pour utiliser le service ce jour-là ?'), [b('Fill in the online form before Monday, March 3', 'Remplir le formulaire en ligne avant le lundi 3 mars'), b('Call the school on the 7th', 'Appeler l’école le 7'), b('Nothing, it is automatic', 'Rien, c’est automatique')]),
      q(AGENDA, b('What does the teacher ask the parents?', 'Que demande l’enseignante aux parents ?'), [b('To check the diary every evening and sign it', 'Vérifier l’agenda chaque soir et le signer'), b('To do Yanis’s homework', 'Faire les devoirs de Yanis'), b('To come to the school on Tuesday', 'Venir à l’école mardi')]),
      q(AGENDA, b('What is the tone of the message?', 'Quel est le ton du message ?'), [b('Firm but encouraging', 'Ferme mais encourageant'), b('Very angry', 'Très fâché'), b('Indifferent', 'Indifférent')], b('“Il est capable de faire beaucoup mieux !” ends on a positive note.', '« Il est capable de faire beaucoup mieux ! » termine sur une note positive.')),
      {
        kind: 'dialogue',
        call: true,
        title: b('The school calls you', 'L’école vous appelle'),
        speakers: [{ name: 'Infirmerie', voice: 'f', side: 'l' }, PARENT],
        lines: [
          { s: 0, fr: 'Bonjour, ici Martine, de l’école des Érables. Je vous appelle au sujet de votre fille, Lina.', tr: 'Hello, this is Martine from Les Érables school. I am calling about your daughter, Lina.' },
          { s: 1, choose: { options: ['Oui ? Il y a un problème ?', 'Lina n’est pas ma fille.', 'Rappelez-moi l’année prochaine.'], answer: 0 } },
          { s: 0, fr: 'Elle a de la fièvre et mal au ventre. Elle est couchée à l’infirmerie. Est-ce que vous pouvez venir la chercher ?', tr: 'She has a fever and a stomach ache. She is lying down in the sick room. Can you come and pick her up?' },
          { s: 1, choose: { options: ['Oui, j’arrive dans vingt minutes.', 'Non, donnez-lui des devoirs.', 'Elle a de la fièvre ? C’est le fun.'], answer: 0 } },
          { s: 0, fr: 'Merci. Passez au secrétariat en arrivant, il faudra signer le registre de départ.', tr: 'Thank you. Go to the office when you arrive: you will have to sign the departure register.' },
        ],
      },
      hear('f', 'Elle a de la fièvre et mal au ventre. Elle est couchée à l’infirmerie. Est-ce que vous pouvez venir la chercher ?', b('What is wrong with Lina?', 'Qu’est-ce qui ne va pas avec Lina ?'), [b('Fever and a stomach ache', 'De la fièvre et mal au ventre'), b('She fell in the playground', 'Elle est tombée dans la cour'), b('She forgot her lunch', 'Elle a oublié son lunch')]),
      card(b('The absence note', 'Le mot d’absence'), b('When your child misses school, the school wants a short note (in the diary, by email or on the school portal): **who**, **when**, **why**, and your signature. No need to give medical details.', 'Quand votre enfant manque l’école, l’école veut un court mot (dans l’agenda, par courriel ou sur le portail) : **qui**, **quand**, **pourquoi**, et votre signature. Inutile de donner des détails médicaux.'), { examples: [{ fr: 'Lina était absente hier pour cause de maladie.', tr: 'Lina was absent yesterday because of illness.' }, { fr: 'Adam sera absent jeudi en raison d’un rendez-vous médical.', tr: 'Adam will be absent on Thursday because of a medical appointment.' }] }),
      { kind: 'fill', prompt: b('Complete the absence note.', 'Complétez le mot d’absence.'), text: 'Madame, je vous informe que mon fils ___ absent demain ___ raison d’un rendez-vous chez le dentiste.', answers: [['sera'], ['en']], choices: [['sera', 'était'], ['en', 'pour']], explain: b('Tomorrow = future (sera); “en raison de” = because of.', 'Demain = futur (sera) ; « en raison de » = à cause de.') },
      { kind: 'write', prompt: b('Write an absence note.', 'Écrivez un mot d’absence.'), task: b('Your daughter Lina was absent yesterday (fever). Write a note to her teacher, Mrs. Gagnon (30 to 50 words): who, when, why, and ask for the homework she missed.', 'Votre fille Lina était absente hier (fièvre). Écrivez un mot à son enseignante, Mme Gagnon (30 à 50 mots) : qui, quand, pourquoi, et demandez les devoirs qu’elle a manqués.'), min: 30, max: 50, checklist: [b('Who and when', 'Qui et quand'), b('Why (briefly)', 'Pourquoi (brièvement)'), b('A request for the homework', 'Une demande pour les devoirs'), b('Greeting and signature', 'Salutation et signature')], phrases: ['Bonjour Madame Gagnon,', 'Lina était absente hier…', 'Pourriez-vous…', 'Merci,'], model: 'Bonjour Madame Gagnon,\n\nLina était absente hier, lundi 10 février, car elle avait de la fièvre. Elle va mieux aujourd’hui. Pourriez-vous lui donner les devoirs qu’elle a manqués ?\n\nMerci et bonne journée,\nSamira Haddad' },
    ],
    notes: {
      points: [
        b('Journée pédagogique = no classes (the service de garde is often open, with a fee).', 'Journée pédagogique = pas de cours (le service de garde est souvent ouvert, payant).'),
        b('La semaine de relâche = winter break in Québec (early March).', 'La semaine de relâche = vacances d’hiver au Québec (début mars).'),
        b('Absence note: who, when, why (pour cause de, en raison de), signature.', 'Mot d’absence : qui, quand, pourquoi (pour cause de, en raison de), signature.'),
        b('“Venir chercher” un enfant = to pick up a child.', '« Venir chercher » un enfant = aller le prendre à l’école.'),
      ],
      vocab: [['la journée pédagogique', b('teacher training day (no classes)', 'jour sans cours')], ['l’infirmerie', b('the sick room', 'la salle de soins de l’école')], ['venir chercher', b('to pick up', 'aller prendre quelqu’un')], ['en raison de', b('because of', 'à cause de')], ['manquer l’école', b('to miss school', 'ne pas aller à l’école')]],
    },
  },
  {
    id: 'school-parents-3',
    slug: { en: 'the-parent-teacher-meeting', fr: 'la-rencontre-avec-l-enseignant' },
    title: b('The parent-teacher meeting', 'La rencontre avec l’enseignant'),
    summary: b('Understand the comments of the report card, talk with the teacher, ask how to help at home and raise a concern.', 'Comprendre les commentaires du bulletin, parler avec l’enseignant, demander comment aider à la maison et exprimer une inquiétude.'),
    objectives: [b('Understand report card comments', 'Comprendre les commentaires du bulletin'), b('Ask useful questions to the teacher', 'Poser des questions utiles à l’enseignant'), b('Express a concern politely', 'Exprimer une inquiétude poliment')],
    minutes: 14,
    steps: [
      card(b('Reading the report card', 'Lire le bulletin'), b('Teachers soften their words. Learn to read between the lines: **il a de la facilité en…** (he is good at…), **elle éprouve des difficultés en…** (she struggles with…), **il est souvent distrait** (he does not pay attention), **elle participe bien** (she takes part), **il doit fournir plus d’efforts** (he must work harder), **elle a fait de beaux progrès** (she has improved a lot).', 'Les enseignants adoucissent leurs mots. Apprenez à lire entre les lignes : **il a de la facilité en…**, **elle éprouve des difficultés en…**, **il est souvent distrait**, **elle participe bien**, **il doit fournir plus d’efforts**, **elle a fait de beaux progrès**.')),
      { kind: 'categorize', prompt: b('Good news or something to work on?', 'Bonne nouvelle ou point à travailler ?'), buckets: [b('Good news', 'Bonne nouvelle'), b('To work on', 'À travailler')], items: [{ text: 'Elle a fait de beaux progrès.', bucket: 0 }, { text: 'Il a de la facilité en mathématiques.', bucket: 0 }, { text: 'Elle participe bien en classe.', bucket: 0 }, { text: 'Il est souvent distrait.', bucket: 1 }, { text: 'Elle éprouve des difficultés en lecture.', bucket: 1 }, { text: 'Il doit fournir plus d’efforts.', bucket: 1 }] },
      hear('m2', 'Yanis est un élève agréable. Il a de la facilité en mathématiques, mais il éprouve encore des difficultés en lecture.', b('What does the teacher say about Yanis?', 'Que dit l’enseignant de Yanis ?'), [b('Good at maths, still struggling with reading', 'Bon en mathématiques, encore en difficulté en lecture'), b('Struggling with maths, good at reading', 'En difficulté en mathématiques, bon en lecture'), b('Struggling in everything', 'En difficulté partout')]),
      {
        kind: 'dialogue',
        title: b('The meeting with Mr. Roy', 'La rencontre avec M. Roy'),
        scene: b('Fifteen minutes with your son’s teacher, after the first report card.', 'Quinze minutes avec l’enseignant de votre fils, après le premier bulletin.'),
        speakers: [{ name: 'M. Roy', voice: 'm2', side: 'l' }, PARENT],
        lines: [
          { s: 0, fr: 'Bonjour ! Merci d’être venue. Yanis fait de beaux progrès en mathématiques.', tr: 'Hello! Thank you for coming. Yanis is making good progress in maths.' },
          { s: 1, choose: { options: ['Merci, ça me fait plaisir. Et en lecture, comment ça se passe ?', 'Je sais, il est parfait.', 'Les mathématiques, ça ne sert à rien.'], answer: 0, explain: b('Thank him, then ask about the weak point: it shows you are involved.', 'Remerciez, puis demandez le point faible : cela montre votre implication.') } },
          { s: 0, fr: 'C’est plus difficile. Il lit lentement et il perd vite sa concentration.', tr: 'It is harder. He reads slowly and quickly loses concentration.' },
          { s: 1, choose: { options: ['Comment est-ce que je peux l’aider à la maison ?', 'C’est de votre faute.', 'Ce n’est pas grave, il regardera la télé.'], answer: 0 } },
          { s: 0, fr: 'Lisez avec lui quinze minutes chaque soir, en français ou dans votre langue : les deux l’aident. Et posez-lui des questions sur l’histoire.', tr: 'Read with him fifteen minutes every evening, in French or in your language: both help. And ask him questions about the story.' },
          { s: 1, choose: { options: ['D’accord. Est-ce qu’il y a de l’aide aux devoirs à l’école ?', 'Quinze minutes ? C’est trop.', 'Il n’aime pas les histoires.'], answer: 0 } },
          { s: 0, fr: 'Oui, le mardi et le jeudi après les cours. Je peux l’inscrire si vous voulez.', tr: 'Yes, on Tuesdays and Thursdays after class. I can sign him up if you like.' },
        ],
      },
      hear('m2', 'Lisez avec lui quinze minutes chaque soir, en français ou dans votre langue : les deux l’aident. Et posez-lui des questions sur l’histoire.', b('What does the teacher advise?', 'Que conseille l’enseignant ?'), [b('Read with him 15 minutes every evening, in any language', 'Lire avec lui 15 minutes chaque soir, dans n’importe quelle langue'), b('Read only in French, one hour a day', 'Lire seulement en français, une heure par jour'), b('Stop reading at home', 'Arrêter la lecture à la maison')], b('Reading in your home language also builds reading skills: you do not have to speak perfect French to help.', 'Lire dans votre langue développe aussi la lecture : pas besoin de parler un français parfait pour aider.')),
      card(b('Raising a concern', 'Exprimer une inquiétude'), b('If something worries you (a conflict, bullying, a child who cries before school), say it calmly and precisely, and ask what the school will do. **L’intimidation** is the word used in Québec schools for bullying (in France: **le harcèlement scolaire**).', 'Si quelque chose vous inquiète (un conflit, de l’intimidation, un enfant qui pleure avant l’école), dites-le calmement et précisément, et demandez ce que l’école va faire. **L’intimidation** est le mot utilisé dans les écoles du Québec (en France : **le harcèlement scolaire**).'), { examples: [
        { fr: 'Je suis un peu inquiète : ma fille ne veut plus aller à l’école.', tr: 'I am a little worried: my daughter does not want to go to school anymore.' },
        { fr: 'Elle dit que deux élèves se moquent d’elle à la récréation.', tr: 'She says two pupils make fun of her at recess.' },
        { fr: 'Qu’est-ce que l’école peut faire dans ce cas ?', tr: 'What can the school do in this case?' },
      ] }),
      { kind: 'order', prompt: b('Build the question to the teacher.', 'Construisez la question à l’enseignant.'), words: ['Comment', 'est-ce', 'que', 'je', 'peux', 'l’aider', 'à', 'la', 'maison ?'], tr: 'How can I help him at home?' },
      { kind: 'match', prompt: b('Match the expressions.', 'Associez les expressions.'), pairs: [['éprouver des difficultés', b('to struggle', 'avoir du mal')], ['avoir de la facilité', b('to find it easy', 'réussir sans trop d’efforts')], ['l’aide aux devoirs', b('homework help', 'du soutien pour les devoirs')], ['se moquer de', b('to make fun of', 'rire de quelqu’un méchamment')], ['l’intimidation', b('bullying', 'des violences répétées entre élèves')]] },
      { kind: 'speak', prompt: b('Say it to the teacher.', 'Dites-le à l’enseignant.'), text: 'Merci pour vos conseils. Je vais lire avec lui tous les soirs.', tr: b('Thank you for your advice. I will read with him every evening.', 'Merci pour vos conseils.') },
    ],
    notes: {
      points: [
        b('Report card: avoir de la facilité (good at) / éprouver des difficultés (struggles with).', 'Bulletin : avoir de la facilité / éprouver des difficultés.'),
        b('Useful questions: Comment ça se passe en… ? Comment puis-je l’aider à la maison ? Y a-t-il de l’aide aux devoirs ?', 'Questions utiles : Comment ça se passe en… ? Comment puis-je l’aider à la maison ? Y a-t-il de l’aide aux devoirs ?'),
        b('Reading with your child in your own language helps too.', 'Lire avec votre enfant dans votre langue l’aide aussi.'),
        b('A concern: say the facts calmly, then ask what the school will do.', 'Une inquiétude : dites les faits calmement, puis demandez ce que l’école va faire.'),
      ],
      vocab: [['le bulletin', b('the report card', 'le relevé des résultats')], ['la récréation, la récré', b('recess, break', 'la pause dans la cour')], ['distrait', b('inattentive', 'qui ne fait pas attention')], ['l’intimidation', b('bullying (Québec)', 'le harcèlement entre élèves')], ['fournir des efforts', b('to make an effort', 'travailler davantage')]],
    },
  },
];

export default lessons;
