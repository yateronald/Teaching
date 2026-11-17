// B1 · Formal email. A newcomer asks a language school about evening
// classes: the structure of a formal email and the polite conditional.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'une-demande-d-informations',
  email: { from: 'Amadou Diallo', to: 'Centre de langues du Plateau', subject: 'Demande d’informations : cours de français du soir' },
  warmup: b(
    'You want information about a course. How do you start and end a formal email in French?',
    'Vous voulez des informations sur un cours. Comment commencer et terminer un courriel formel en français ?',
  ),
  paras: [
    { s: [['Madame, Monsieur,', 'Dear Sir or Madam,']] },
    { s: [
      ['Je me permets de vous écrire car je suis intéressé par vos cours de français du soir.', 'I am writing to you because I am interested in your evening French classes.'],
      ['Je suis arrivé à Montréal il y a quatre mois et je travaille comme technicien informatique.', 'I arrived in Montréal four months ago and I work as an IT technician.'],
      ['J’ai déjà un niveau intermédiaire, mais je voudrais améliorer mon expression orale pour mon travail.', 'I already have an intermediate level, but I would like to improve my speaking for my job.'],
    ] },
    { s: [
      ['Pourriez-vous m’indiquer les jours et les horaires des cours ?', 'Could you tell me the days and times of the classes?'],
      ['J’aimerais également savoir combien coûte une session et s’il faut passer un test de niveau avant l’inscription.', 'I would also like to know how much a session costs and whether I need to take a level test before registering.'],
      ['Enfin, serait-il possible d’assister à un cours gratuitement avant de m’inscrire ?', 'Finally, would it be possible to attend a class for free before signing up?'],
    ] },
    { s: [
      ['Je suis disponible le lundi et le mercredi après dix-huit heures.', 'I am available on Mondays and Wednesdays after six p.m.'],
      ['Je vous remercie par avance de votre réponse.', 'Thank you in advance for your reply.'],
    ] },
    { lines: true, s: [
      ['Veuillez agréer, Madame, Monsieur, mes salutations distinguées.', 'Yours faithfully,'],
      ['Amadou Diallo', 'Amadou Diallo'],
    ] },
  ],
  glossary: [
    { fr: 'Je me permets de vous écrire', tr: b('I am writing to you (polite opening)', 'formule polie pour commencer une lettre') },
    { fr: 'intéressé', tr: b('interested', 'qui a envie d’en savoir plus') },
    { fr: 'il y a quatre mois', tr: b('four months ago', 'quatre mois avant aujourd’hui') },
    { fr: 'technicien informatique', tr: b('IT technician', 'il répare et installe les ordinateurs et les logiciels') },
    { fr: 'améliorer', tr: b('to improve', 'rendre meilleur') },
    { fr: 'une session', tr: b('a term (a series of classes)', 'une période de cours, par exemple dix semaines') },
    { fr: 'l’inscription', tr: b('registration', 'le fait de s’inscrire à un cours') },
    { fr: 'assister à', tr: b('to attend', 'être présent à') },
    { fr: 'par avance', tr: b('in advance', 'avant votre réponse') },
    { fr: 'salutations distinguées', tr: b('formal closing of a letter', 'formule de politesse très formelle pour finir une lettre') },
  ],
  questions: [
    {
      q: 'Pourquoi Amadou écrit-il ?',
      qEn: 'Why is Amadou writing?',
      options: ['Pour s’inscrire tout de suite à un cours', 'Pour demander des informations sur des cours', 'Pour annuler son inscription', 'Pour se plaindre d’un professeur'],
      answer: 1,
      evidence: 'je suis intéressé par vos cours de français du soir',
      explain: b(
        'The subject line and the first sentence say it: he is interested and wants information before signing up.',
        'L’objet et la première phrase le disent : il est intéressé et veut des informations avant de s’inscrire.',
      ),
      skill: 'global',
    },
    {
      q: 'Quel est le métier d’Amadou ?',
      qEn: 'What is Amadou’s job?',
      options: ['Professeur de français', 'Technicien informatique', 'Étudiant', 'Directeur d’un centre de langues'],
      answer: 1,
      evidence: 'je travaille comme technicien informatique',
      explain: b(
        '“Je travaille comme technicien informatique.” Travailler comme + job, with no article.',
        '« Je travaille comme technicien informatique. » Travailler comme + métier, sans article.',
      ),
      skill: 'detail',
    },
    {
      q: 'Qu’est-ce qu’Amadou veut surtout améliorer ?',
      qEn: 'What does Amadou mainly want to improve?',
      options: ['L’écrit', 'La grammaire', 'L’expression orale', 'La lecture'],
      answer: 2,
      evidence: 'améliorer mon expression orale',
      explain: b(
        '“Je voudrais améliorer mon expression orale pour mon travail.” Expression orale means speaking.',
        '« Je voudrais améliorer mon expression orale pour mon travail. » L’expression orale, c’est parler.',
      ),
      skill: 'detail',
    },
    {
      q: 'Combien de questions Amadou pose-t-il au centre ?',
      qEn: 'How many questions does Amadou ask the school?',
      options: ['Une', 'Deux', 'Quatre', 'Six'],
      answer: 2,
      evidence: ['Pourriez-vous m’indiquer les jours et les horaires des cours ?', 'combien coûte une session', 's’il faut passer un test de niveau', 'serait-il possible d’assister à un cours gratuitement'],
      explain: b(
        'Four: the days and times, the price of a session, the level test, and a free trial class. A question can be hidden in a sentence that starts with j’aimerais savoir.',
        'Quatre : les jours et horaires, le prix d’une session, le test de niveau, et un cours d’essai gratuit. Une question peut se cacher dans une phrase qui commence par j’aimerais savoir.',
      ),
      skill: 'inference',
    },
    {
      q: 'Quand Amadou est-il disponible ?',
      qEn: 'When is Amadou available?',
      options: ['Le lundi et le mercredi après dix-huit heures', 'Tous les matins', 'Le week-end', 'Le mardi et le jeudi soir'],
      answer: 0,
      evidence: 'Je suis disponible le lundi et le mercredi après dix-huit heures.',
      explain: b(
        '“Je suis disponible le lundi et le mercredi après dix-huit heures”: after work.',
        '« Je suis disponible le lundi et le mercredi après dix-huit heures » : après son travail.',
      ),
      skill: 'detail',
    },
    {
      q: 'Le ton de ce courriel est :',
      qEn: 'The tone of this email is:',
      options: ['familier', 'formel et poli', 'en colère', 'humoristique'],
      answer: 1,
      evidence: ['Madame, Monsieur,', 'Veuillez agréer, Madame, Monsieur, mes salutations distinguées.'],
      explain: b(
        'Madame, Monsieur, the vous form, the conditional (pourriez-vous, j’aimerais) and the formal closing: everything shows a formal, polite tone.',
        'Madame, Monsieur, le vouvoiement, le conditionnel (pourriez-vous, j’aimerais) et la formule finale : tout montre un ton formel et poli.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('The polite conditional', 'Le conditionnel de politesse'),
    body: b(
      'In a formal request, the conditional softens the question: __je voudrais__ instead of je veux, __j’aimerais__ instead of j’aime, __pourriez-vous__ instead of pouvez-vous, __serait-il possible__ instead of est-ce que c’est possible. It is formed with the future stem + the imparfait endings: pouvoir → **pourr-** + **-iez**.',
      'Dans une demande formelle, le conditionnel adoucit la question : __je voudrais__ plutôt que je veux, __j’aimerais__ plutôt que j’aime, __pourriez-vous__ plutôt que pouvez-vous, __serait-il possible__ plutôt que est-ce que c’est possible. On le forme avec le radical du futur + les terminaisons de l’imparfait : pouvoir → **pourr-** + **-iez**.',
    ),
    examples: [
      { fr: 'Je voudrais améliorer mon expression orale.', tr: 'I would like to improve my speaking.' },
      { fr: 'Pourriez-vous m’indiquer les horaires des cours ?', tr: 'Could you tell me the class times?' },
      { fr: 'Serait-il possible d’assister à un cours ?', tr: 'Would it be possible to attend a class?' },
    ],
  },
};

export default text;
