// Every word of the public landing page, in English and French.
//
// One typed module (instead of scattered i18n keys) so that the page, its
// pre-rendered HTML and its structured data (FAQ, courses) always say exactly
// the same thing in the same language — a requirement for rich results.

export type Lang = 'en' | 'fr';

export const SITE_URL = 'https://www.learnfrenchwithnatives.com';
export const PATHS: Record<Lang, string> = { en: '/', fr: '/fr/' };
export const CONTACT_EMAIL = 'support@learnfrenchwithnatives.com';

export interface Program {
  id: string;
  tab: string;
  exams: string;
  title: string;
  desc: string;
  includes: string[];
  goal: string;
  format: string;
  levels: string;
}

export interface LandingCopy {
  meta: { title: string; description: string; ogAlt: string };
  skip: string;
  announce: { tag: string; text: string; link: string };
  statsLabel: string;
  langSuggest: { text: string; link: string; dismiss: string };
  nav: { programs: string; method: string; simulator: string; platform: string; reviews: string; faq: string; signIn: string; demo: string; menu: string; close: string; language: string };
  hero: {
    eyebrow: string; before: string; accent: string; after: string; sub: string;
    ctaPrimary: string; ctaSecondary: string;
    rating: string; ratingLabel: string; pass: string; students: string;
    cardResult: { label: string; scoreLabel: string; level: string; nclc: string };
    cardLive: { title: string; sub: string };
    cardExaminer: string;
    imageAlt: string;
  };
  marquee: { label: string };
  stats: { value: number; suffix: string; label: string }[];
  programs: { eyebrow: string; title: string; sub: string; includes: string; goal: string; format: string; levels: string; cta: string; items: Program[] };
  simulator: {
    eyebrow: string; title: string; sub: string;
    features: { title: string; desc: string }[];
    report: { title: string; scoreLabel: string; level: string; nclc: string; criteria: [string, number][]; next: string; track: string };
    disclaimer: string; cta: string;
  };
  method: { eyebrow: string; title: string; sub: string; items: { title: string; desc: string }[] };
  platform: { eyebrow: string; title: string; sub: string; features: { title: string; desc: string }[]; altDashboard: string; altMarksheet: string };
  how: { eyebrow: string; title: string; sub: string; step: string; steps: { title: string; desc: string }[] };
  reviews: {
    eyebrow: string; title: string; sub: string; summary: string;
    videos: { title: string; desc: string }[];
    videoLabel: string; play: string; prev: string; next: string;
    quotes: { name: string; role: string; text: string; exam?: string }[];
  };
  faq: { eyebrow: string; title: string; sub: string; more: string; items: { q: string; a: string }[] };
  finale: { title: string; sub: string; cta: string; login: string; trust: string };
  footer: {
    tagline: string; contactLabel: string;
    exams: string; platform: string; company: string; languages: string;
    examLinks: string[];
    platformLinks: { label: string; href: string }[];
    companyLinks: { label: string; href: string; demo?: boolean }[];
    rights: string; made: string;
  };
}

// Student testimonials are quotes: they stay in the words the students used.
const QUOTES = [
  { name: 'Aarav Sharma', role: 'TEF Canada candidate', exam: 'TEF Canada', text: 'Scored CLB 9 in speaking! Classes were structured, patient, and truly native. Practice felt like real-life conversations — exactly what I needed.' },
  { name: 'Priya Patel', role: 'DELF B2 graduate', exam: 'DELF B2', text: "Cleared DELF B2 on my first attempt. Mock exams and feedback were spot on. The teacher's corrections improved my fluency fast." },
  { name: 'Rohan Mehta', role: 'Business professional', text: 'Needed French for clients in Quebec. Flexible scheduling and industry vocabulary focus helped me present confidently in French within months.' },
  { name: 'Arjun Iyer', role: 'TCF candidate', exam: 'TCF', text: 'Clear strategies for TCF listening and speaking. My scores improved quickly thanks to targeted feedback and daily practice.' },
  { name: 'Sneha Kapoor', role: 'Student', text: 'The step-by-step curriculum and native accents made learning enjoyable. Speaking clubs boosted my confidence in just weeks!' },
];

export const EXAM_NAMES = ['TEF Canada', 'TCF Canada', 'TCF Québec', 'TEFAQ', 'DELF A1–B2', 'DALF C1–C2', 'Business French'];

const en: LandingCopy = {
  meta: {
    title: 'Learn French Online with Native Teachers | TEF & TCF Canada Prep',
    description: 'Live French classes with certified native teachers and exam simulations scored like TEF Canada and TCF Canada. Reach your CLB target. Book a free demo.',
    ogAlt: 'Learn French with Natives — French exam preparation with native teachers',
  },
  skip: 'Skip to main content',
  announce: { tag: 'New', text: 'TCF Canada speaking & writing simulator with an AI examiner.', link: 'See how it works' },
  statsLabel: 'Learn French with Natives in numbers',
  langSuggest: { text: 'Cette page existe aussi en français.', link: 'Voir en français', dismiss: 'Close' },
  nav: { programs: 'Programs', method: 'Method', simulator: 'Exam simulator', platform: 'Platform', reviews: 'Reviews', faq: 'FAQ', signIn: 'Sign in', demo: 'Book a free demo', menu: 'Open menu', close: 'Close menu', language: 'Language' },
  hero: {
    eyebrow: 'TEF Canada · TCF Canada · DELF · DALF',
    before: 'Learn French with',
    accent: 'native teachers',
    after: 'and pass your exam.',
    sub: 'Live classes with certified native French teachers, full exam simulations scored like the real TEF and TCF Canada, and a personal plan to reach your CLB target.',
    ctaPrimary: 'Book your free demo',
    ctaSecondary: 'Explore the exam simulator',
    rating: '4.9/5',
    ratingLabel: 'from 500+ reviews',
    pass: '98% pass rate',
    students: '1,000+ students',
    cardResult: { label: 'Speaking · Mock exam', scoreLabel: 'Score', level: 'B2', nclc: 'CLB 8' },
    cardLive: { title: 'Live class in 10 min', sub: 'TCF Canada · Speaking' },
    cardExaminer: 'AI examiner · Task 2',
    imageAlt: 'The Learn French with Natives student platform: marksheet with quiz scores, grades and progress',
  },
  marquee: { label: 'Preparation for the exams that open doors' },
  stats: [
    { value: 1000, suffix: '+', label: 'students trained' },
    { value: 98, suffix: '%', label: 'exam pass rate' },
    { value: 15, suffix: '+', label: 'native teachers' },
    { value: 10000, suffix: '+', label: 'hours taught' },
  ],
  programs: {
    eyebrow: 'Programs',
    title: 'One goal. The right program.',
    sub: 'Tell us why you need French — we build your preparation around your exam, your level and your deadline.',
    includes: "What's included",
    goal: 'Goal',
    format: 'Format',
    levels: 'Levels',
    cta: 'Get my personal plan',
    items: [
      {
        id: 'canada', tab: 'Immigrate to Canada', exams: 'TEF Canada · TCF Canada', title: 'TEF Canada & TCF Canada',
        desc: 'The French tests accepted by IRCC for Express Entry and Canadian citizenship. We prepare all four skills and train you until your target CLB is within reach.',
        includes: ['All four skills: listening, reading, writing, speaking', 'Full mock exams in real conditions', 'Speaking & writing simulator scored in CLB', 'Proven strategies for every task type'],
        goal: 'CLB 7+ for Express Entry', format: '1-on-1 or small group', levels: 'A2 → C1',
      },
      {
        id: 'quebec', tab: 'Settle in Québec', exams: 'TCF Québec · TEFAQ', title: 'TCF Québec & TEFAQ',
        desc: 'Speaking and listening are the skills Québec immigration programs assess — so that is where we train you, with everyday Québec situations and timed practice.',
        includes: ['Intensive speaking & listening practice', 'Mock exams with timed audio', 'Everyday Québec situations', 'Personal feedback after every session'],
        goal: 'Oral skills for Québec programs', format: '1-on-1 or small group', levels: 'A2 → C1',
      },
      {
        id: 'diplomas', tab: 'Earn a diploma', exams: 'DELF A1–B2 · DALF C1–C2', title: 'DELF & DALF',
        desc: "Official diplomas from France's Ministry of Education, valid for life. We prepare each level in the official exam format, with full mock papers.",
        includes: ['Every level from A1 to C2', 'Official format for all four papers', 'Full mock exams with corrections', 'Writing and speaking coaching'],
        goal: 'A diploma valid for life', format: '1-on-1 or small group', levels: 'A1 → C2',
      },
      {
        id: 'everyday', tab: 'Work & everyday French', exams: 'Business · Conversation · Kids 6–16', title: 'Business, conversation & kids',
        desc: 'Speak with confidence at work and in daily life: meetings and presentations in business French, immersive conversation practice, and playful classes for children aged 6 to 16.',
        includes: ['Business French: meetings, presentations, emails', 'Conversation: pronunciation, fluency, culture', 'Kids 6–16: stories, games, age-adapted activities', 'A schedule that fits your time zone'],
        goal: 'Real-life fluency', format: '1-on-1 or small group', levels: 'A1 → C2',
      },
    ],
  },
  simulator: {
    eyebrow: 'Exam simulator',
    title: 'Rehearse the real exam. As often as you need.',
    sub: 'Our TCF Canada simulator recreates the speaking and writing tests minute by minute — then scores you the way examiners do.',
    features: [
      { title: 'Speaking with an AI examiner', desc: 'Three tasks, official timings. The examiner interviews you, plays the role-play and challenges your opinion — out loud, in real time.' },
      { title: 'Writing in exam conditions', desc: 'One 60-minute clock for three texts, a live word counter and a French keyboard. Your work is saved as you type.' },
      { title: 'Scored like the real thing', desc: 'Each task is corrected twice on the official grid, then converted to a CEFR level and a CLB score, with your three priorities to work on.' },
    ],
    report: {
      title: 'Speaking · Mock exam #3', scoreLabel: 'Estimated score', level: 'CEFR B2', nclc: 'CLB 8',
      criteria: [['Task completion', 14], ['Coherence', 13], ['Vocabulary', 12.5], ['Grammar', 11.5], ['Pronunciation', 13]],
      next: 'Next milestone: CLB 9 — 1 point to go', track: 'CLB',
    },
    disclaimer: 'Practice estimate. Official scores are awarded by certified examiners.',
    cta: 'Try it during your free demo',
  },
  method: {
    eyebrow: 'Our method',
    title: 'The method that gets results',
    sub: 'Everything you need to pass your French exam, in one place.',
    items: [
      { title: '100% native teachers', desc: 'Every teacher is a certified native French speaker with years of teaching experience and specialised training for TEF, TCF, DELF and DALF.' },
      { title: 'Exam-focused program', desc: 'Targeted preparation for TEF, TCF, DELF, DALF and TEFAQ, with regular mock exams in real conditions.' },
      { title: 'Flexible scheduling', desc: 'Individual or small-group classes adapted to your pace, your time zone and your schedule.' },
      { title: 'Personalised feedback', desc: 'Detailed corrections and progress tracking aligned with your target score.' },
      { title: 'A clear path from A1 to C2', desc: 'A progressive journey with clear milestones: you always know your level and your next step.' },
      { title: 'Proven results', desc: '98% of our students pass their target exam on the first attempt.' },
    ],
  },
  platform: {
    eyebrow: 'The platform',
    title: 'Your whole preparation, in one place',
    sub: 'Between classes, you practise, follow your scores and prepare on the same platform your teacher uses.',
    features: [
      { title: 'Dashboard', desc: 'Scores, progress and upcoming sessions at a glance.' },
      { title: 'Quizzes', desc: 'Exercises assigned by your teacher, with instant feedback.' },
      { title: 'Results & marksheet', desc: 'Every score, skill by skill, and your progress over time.' },
      { title: 'Exam preparation', desc: 'Timed series and full simulations for every skill.' },
      { title: 'Resources', desc: 'PDF and audio material, organised by exam.' },
      { title: 'Schedule & live classes', desc: 'Your calendar, reminders and one-click access to class.' },
    ],
    altDashboard: 'Student dashboard: average score, completed quizzes, score over time and upcoming classes',
    altMarksheet: 'Academic marksheet: quiz scores, grades and performance for each assessment',
  },
  how: {
    eyebrow: 'How it works',
    title: 'From first call to exam day',
    sub: 'We guide you at every step — from your first demo to the day you pass.',
    step: 'Step',
    steps: [
      { title: 'Book your free demo', desc: 'A no-commitment discovery session: free level assessment, your goals and timeline, and your future teacher.' },
      { title: 'Receive your personal plan', desc: 'A program calibrated to your level and target exam, with a schedule that fits your life.' },
      { title: 'Learn live and practise', desc: 'Interactive classes for all four skills, plus quizzes and exam simulations between sessions.' },
      { title: 'Pass your exam with confidence', desc: 'Regular mock exams in real conditions and personalised feedback on every skill.' },
    ],
  },
  reviews: {
    eyebrow: 'Student reviews',
    title: 'What our students say',
    sub: 'Videos and testimonials from students who passed their exams with us.',
    summary: '4.9/5 from more than 500 reviews',
    videos: [
      { title: 'Our teaching method', desc: 'Discover how our native teachers create an immersive and effective learning experience.' },
      { title: 'Student success stories', desc: 'Hear from students who passed their exam and reached their goals with our program.' },
    ],
    videoLabel: 'Video testimonial', play: 'Play the video', prev: 'Previous testimonial', next: 'Next testimonial',
    quotes: QUOTES,
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    sub: 'Everything you need to know before starting your French journey.',
    more: 'Still have a question? Write to us',
    items: [
      { q: 'How can I prepare for TEF Canada or TCF Canada online?', a: 'You take live 1-on-1 or small-group classes with certified native French teachers, full mock exams, and our speaking and writing simulator — with examiner-style feedback on all four skills.' },
      { q: 'What is the difference between TEF Canada and TCF Canada?', a: 'Both are official French tests accepted by Immigration, Refugees and Citizenship Canada (IRCC) for Express Entry and citizenship. Their formats differ; the right choice depends on your immigration program and on test availability near you. We help you decide during your free demo.' },
      { q: 'What CLB level do I need for Express Entry?', a: 'It depends on your program. The Federal Skilled Worker Program asks for at least CLB 7 in all four skills, and Express Entry gives additional points to candidates who reach CLB 7 or higher in all four French skills. We confirm your exact target during your free demo.' },
      { q: 'How long does it take to prepare?', a: 'It depends on your starting level. Most students reach CLB 7 within 3 to 6 months of consistent training (3 to 4 sessions a week). Higher targets such as CLB 9 may take 6 to 12 months. You receive a personal roadmap after your free demo.' },
      { q: 'How does the exam simulator work?', a: 'You take the TCF Canada speaking or writing test in real conditions: official timings, an AI examiner for speaking and a 60-minute clock for writing. Each task is corrected twice on the official grid, and you receive a CEFR level, a CLB estimate and your priorities. It is a practice estimate: official scores are awarded by certified examiners.' },
      { q: 'Are your French teachers native speakers?', a: 'Yes. Every teacher is a certified native French speaker with several years of teaching experience and specialised training for TEF, TCF, DELF and DALF.' },
      { q: 'Can I book a free demo lesson?', a: 'Yes. The discovery session is free and without commitment: we assess your level, discuss your goals and exam timeline, and match you with the right teacher.' },
      { q: 'Do you teach beginners and children?', a: 'Yes. We teach every level from A1 to C2, and we offer interactive classes for children aged 6 to 16.' },
    ],
  },
  finale: {
    title: 'Your next score starts with a free demo.',
    sub: 'Join more than 1,000 students who trusted native teachers to reach their goals.',
    cta: 'Book your free demo',
    login: 'I already have an account',
    trust: 'No commitment · 100% free demo',
  },
  footer: {
    tagline: 'Your partner for French exam success. Native teachers, proven methods, real results.',
    contactLabel: 'Questions & support',
    exams: 'Exams', platform: 'Platform', company: 'Company', languages: 'Languages',
    examLinks: ['TEF Canada', 'TCF Canada', 'TCF Québec & TEFAQ', 'DELF & DALF', 'Business French'],
    platformLinks: [
      { label: 'Our method', href: '#method' }, { label: 'Exam simulator', href: '#simulator' },
      { label: 'The platform', href: '#platform' }, { label: 'How it works', href: '#how' }, { label: 'Student space', href: '/login' },
    ],
    companyLinks: [
      { label: 'Book a free demo', href: '#', demo: true }, { label: 'Student reviews', href: '#reviews' },
      { label: 'FAQ', href: '#faq' }, { label: 'Contact us', href: `mailto:${CONTACT_EMAIL}` },
    ],
    rights: 'All rights reserved.',
    made: 'Made with care for our French learners.',
  },
};

const fr: LandingCopy = {
  meta: {
    title: 'Cours de français en ligne avec des profs natifs | Préparation TEF & TCF',
    description: 'Cours de français en direct avec des professeurs natifs certifiés et simulations notées comme le TEF et le TCF Canada. Visez votre NCLC. Démo gratuite.',
    ogAlt: 'Learn French with Natives — préparation aux examens de français avec des professeurs natifs',
  },
  skip: 'Aller au contenu principal',
  announce: { tag: 'Nouveau', text: 'Simulateur d’expression orale et écrite du TCF Canada avec examinateur IA.', link: 'Découvrir' },
  statsLabel: 'Learn French with Natives en chiffres',
  langSuggest: { text: 'This page is also available in English.', link: 'View in English', dismiss: 'Fermer' },
  nav: { programs: 'Programmes', method: 'Méthode', simulator: 'Simulateur', platform: 'Plateforme', reviews: 'Avis', faq: 'FAQ', signIn: 'Connexion', demo: 'Démo gratuite', menu: 'Ouvrir le menu', close: 'Fermer le menu', language: 'Langue' },
  hero: {
    eyebrow: 'TEF Canada · TCF Canada · DELF · DALF',
    before: 'Apprenez le français avec des',
    accent: 'professeurs natifs',
    after: 'et réussissez votre examen.',
    sub: 'Des cours en direct avec des professeurs natifs certifiés, des simulations d’examen notées comme le vrai TEF et TCF Canada, et un plan personnalisé pour atteindre votre NCLC.',
    ctaPrimary: 'Réserver ma démo gratuite',
    ctaSecondary: 'Découvrir le simulateur',
    rating: '4,9/5',
    ratingLabel: 'sur plus de 500 avis',
    pass: '98 % de réussite',
    students: '1 000+ étudiants',
    cardResult: { label: 'Expression orale · Examen blanc', scoreLabel: 'Score', level: 'B2', nclc: 'NCLC 8' },
    cardLive: { title: 'Cours en direct dans 10 min', sub: 'TCF Canada · Expression orale' },
    cardExaminer: 'Examinateur IA · Tâche 2',
    imageAlt: 'La plateforme étudiante Learn French with Natives : bulletin de notes avec scores, mentions et progression',
  },
  marquee: { label: 'Préparation aux examens qui ouvrent les portes' },
  stats: [
    { value: 1000, suffix: '+', label: 'étudiants formés' },
    { value: 98, suffix: ' %', label: 'de réussite aux examens' },
    { value: 15, suffix: '+', label: 'professeurs natifs' },
    { value: 10000, suffix: '+', label: 'heures de cours' },
  ],
  programs: {
    eyebrow: 'Programmes',
    title: 'Un objectif. Le bon programme.',
    sub: 'Dites-nous pourquoi vous apprenez le français : nous construisons votre préparation autour de votre examen, de votre niveau et de votre échéance.',
    includes: 'Ce qui est inclus',
    goal: 'Objectif',
    format: 'Format',
    levels: 'Niveaux',
    cta: 'Obtenir mon plan personnalisé',
    items: [
      {
        id: 'canada', tab: 'Immigrer au Canada', exams: 'TEF Canada · TCF Canada', title: 'TEF Canada et TCF Canada',
        desc: 'Les tests de français acceptés par IRCC pour Entrée express et la citoyenneté canadienne. Nous préparons les quatre compétences et vous entraînons jusqu’à ce que votre NCLC cible soit à portée.',
        includes: ['Les quatre compétences : compréhension et expression, orales et écrites', 'Examens blancs complets en conditions réelles', 'Simulateur d’expression orale et écrite noté en NCLC', 'Des stratégies éprouvées pour chaque type de tâche'],
        goal: 'NCLC 7+ pour Entrée express', format: 'Individuel ou petit groupe', levels: 'A2 → C1',
      },
      {
        id: 'quebec', tab: 'S’installer au Québec', exams: 'TCF Québec · TEFAQ', title: 'TCF Québec et TEFAQ',
        desc: 'L’oral est au cœur des programmes d’immigration du Québec : c’est là que nous vous entraînons, avec des situations du quotidien québécois et une pratique chronométrée.',
        includes: ['Pratique intensive de l’oral', 'Examens blancs avec audio chronométré', 'Situations du quotidien au Québec', 'Retour personnalisé après chaque séance'],
        goal: 'L’oral pour les programmes du Québec', format: 'Individuel ou petit groupe', levels: 'A2 → C1',
      },
      {
        id: 'diplomas', tab: 'Obtenir un diplôme', exams: 'DELF A1–B2 · DALF C1–C2', title: 'DELF et DALF',
        desc: 'Les diplômes officiels du ministère français de l’Éducation, valables à vie. Nous préparons chaque niveau au format officiel, avec des sujets blancs complets.',
        includes: ['Tous les niveaux, du A1 au C2', 'Format officiel des quatre épreuves', 'Examens blancs complets et corrigés', 'Coaching en expression écrite et orale'],
        goal: 'Un diplôme valable à vie', format: 'Individuel ou petit groupe', levels: 'A1 → C2',
      },
      {
        id: 'everyday', tab: 'Français pro et du quotidien', exams: 'Affaires · Conversation · Enfants 6–16 ans', title: 'Affaires, conversation et enfants',
        desc: 'Parlez avec assurance au travail et au quotidien : réunions et présentations en français des affaires, conversation immersive, et cours ludiques pour les enfants de 6 à 16 ans.',
        includes: ['Français des affaires : réunions, présentations, courriels', 'Conversation : prononciation, aisance, culture', 'Enfants 6–16 ans : histoires, jeux, activités adaptées', 'Des horaires adaptés à votre fuseau'],
        goal: 'L’aisance au quotidien', format: 'Individuel ou petit groupe', levels: 'A1 → C2',
      },
    ],
  },
  simulator: {
    eyebrow: 'Simulateur d’examen',
    title: 'Répétez le vrai examen. Autant de fois qu’il le faut.',
    sub: 'Notre simulateur du TCF Canada reproduit les épreuves d’expression orale et écrite minute par minute — puis vous note comme un examinateur.',
    features: [
      { title: 'L’oral avec un examinateur IA', desc: 'Trois tâches, minutage officiel. L’examinateur vous interroge, joue le jeu de rôle et challenge votre point de vue — à voix haute, en temps réel.' },
      { title: 'L’écrit en conditions réelles', desc: 'Un chronomètre de 60 minutes pour trois textes, un compteur de mots et un clavier français. Votre copie est sauvegardée en continu.' },
      { title: 'Noté comme le vrai examen', desc: 'Chaque tâche est corrigée deux fois selon la grille officielle, puis convertie en niveau CECR et en NCLC, avec vos trois priorités de travail.' },
    ],
    report: {
      title: 'Expression orale · Examen blanc n° 3', scoreLabel: 'Score estimé', level: 'CECR B2', nclc: 'NCLC 8',
      criteria: [['Réalisation de la tâche', 14], ['Cohérence', 13], ['Lexique', 12.5], ['Grammaire', 11.5], ['Prononciation', 13]],
      next: 'Prochain palier : NCLC 9 — encore 1 point', track: 'NCLC',
    },
    disclaimer: 'Estimation d’entraînement. Le score officiel est attribué par des correcteurs habilités.',
    cta: 'L’essayer pendant ma démo gratuite',
  },
  method: {
    eyebrow: 'Notre méthode',
    title: 'La méthode qui donne des résultats',
    sub: 'Tout ce qu’il faut pour réussir votre examen de français, au même endroit.',
    items: [
      { title: 'Professeurs 100 % natifs', desc: 'Chaque professeur est un francophone natif certifié, avec plusieurs années d’expérience et une formation spécialisée pour le TEF, le TCF, le DELF et le DALF.' },
      { title: 'Un programme centré sur l’examen', desc: 'Préparation ciblée au TEF, au TCF, au DELF, au DALF et au TEFAQ, avec des examens blancs réguliers en conditions réelles.' },
      { title: 'Des horaires flexibles', desc: 'Cours individuels ou en petit groupe, adaptés à votre rythme, à votre fuseau horaire et à votre emploi du temps.' },
      { title: 'Des retours personnalisés', desc: 'Corrections détaillées et suivi de progression alignés sur votre score cible.' },
      { title: 'Un parcours clair du A1 au C2', desc: 'Une progression par étapes : vous connaissez toujours votre niveau et votre prochaine marche.' },
      { title: 'Des résultats prouvés', desc: '98 % de nos étudiants réussissent leur examen cible dès la première tentative.' },
    ],
  },
  platform: {
    eyebrow: 'La plateforme',
    title: 'Toute votre préparation, au même endroit',
    sub: 'Entre les cours, vous vous entraînez, suivez vos scores et préparez l’examen sur la plateforme qu’utilise votre professeur.',
    features: [
      { title: 'Tableau de bord', desc: 'Scores, progression et prochaines séances en un coup d’œil.' },
      { title: 'Quiz', desc: 'Des exercices assignés par votre professeur, avec correction immédiate.' },
      { title: 'Résultats et bulletin', desc: 'Chaque score, compétence par compétence, et votre progression.' },
      { title: 'Préparation aux examens', desc: 'Séries chronométrées et simulations complètes pour chaque compétence.' },
      { title: 'Ressources', desc: 'Documents PDF et audio, classés par examen.' },
      { title: 'Agenda et cours en direct', desc: 'Votre calendrier, des rappels et l’accès au cours en un clic.' },
    ],
    altDashboard: 'Tableau de bord étudiant : score moyen, quiz réalisés, évolution des scores et prochains cours',
    altMarksheet: 'Bulletin de notes : scores, mentions et performance pour chaque évaluation',
  },
  how: {
    eyebrow: 'Comment ça marche',
    title: 'Du premier appel au jour de l’examen',
    sub: 'Nous vous accompagnons à chaque étape — de votre première démo au jour de la réussite.',
    step: 'Étape',
    steps: [
      { title: 'Réservez votre démo gratuite', desc: 'Une séance découverte sans engagement : évaluation gratuite de votre niveau, vos objectifs et votre échéancier, et votre futur professeur.' },
      { title: 'Recevez votre plan personnalisé', desc: 'Un programme calibré sur votre niveau et votre examen cible, avec un calendrier adapté à votre vie.' },
      { title: 'Apprenez en direct et entraînez-vous', desc: 'Des cours interactifs pour les quatre compétences, plus des quiz et des simulations d’examen entre les séances.' },
      { title: 'Réussissez votre examen avec confiance', desc: 'Des examens blancs réguliers en conditions réelles et un retour personnalisé sur chaque compétence.' },
    ],
  },
  reviews: {
    eyebrow: 'Avis des étudiants',
    title: 'Ce que disent nos étudiants',
    sub: 'Vidéos et témoignages d’étudiants qui ont réussi leur examen avec nous.',
    summary: '4,9/5 sur plus de 500 avis',
    videos: [
      { title: 'Notre méthode d’enseignement', desc: 'Découvrez comment nos professeurs natifs créent une expérience d’apprentissage immersive et efficace.' },
      { title: 'Réussites étudiantes', desc: 'Écoutez des étudiants qui ont réussi leur examen et atteint leurs objectifs grâce à notre programme.' },
    ],
    videoLabel: 'Témoignage vidéo', play: 'Lire la vidéo', prev: 'Témoignage précédent', next: 'Témoignage suivant',
    quotes: QUOTES,
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Questions fréquentes',
    sub: 'Tout ce qu’il faut savoir avant de commencer votre parcours en français.',
    more: 'Une autre question ? Écrivez-nous',
    items: [
      { q: 'Comment se préparer au TEF Canada ou au TCF Canada en ligne ?', a: 'Vous suivez des cours en direct, en individuel ou en petit groupe, avec des professeurs natifs certifiés, des examens blancs complets et notre simulateur d’expression orale et écrite — avec un retour de type examinateur sur les quatre compétences.' },
      { q: 'Quelle est la différence entre le TEF Canada et le TCF Canada ?', a: 'Ce sont deux tests officiels de français acceptés par Immigration, Réfugiés et Citoyenneté Canada (IRCC) pour Entrée express et la citoyenneté. Leurs formats diffèrent ; le bon choix dépend de votre programme d’immigration et des sessions disponibles près de chez vous. Nous vous aidons à choisir pendant votre démo gratuite.' },
      { q: 'Quel NCLC faut-il pour Entrée express ?', a: 'Cela dépend du programme. Le Programme des travailleurs qualifiés (fédéral) exige au moins NCLC 7 dans les quatre compétences, et Entrée express accorde des points supplémentaires aux candidats qui atteignent NCLC 7 ou plus dans les quatre compétences en français. Nous confirmons votre cible exacte pendant votre démo gratuite.' },
      { q: 'Combien de temps faut-il pour se préparer ?', a: 'Cela dépend de votre niveau de départ. La plupart des étudiants atteignent NCLC 7 en 3 à 6 mois d’entraînement régulier (3 à 4 séances par semaine). Des objectifs plus élevés, comme NCLC 9, peuvent demander 6 à 12 mois. Vous recevez une feuille de route personnalisée après votre démo gratuite.' },
      { q: 'Comment fonctionne le simulateur d’examen ?', a: 'Vous passez l’épreuve d’expression orale ou écrite du TCF Canada en conditions réelles : minutage officiel, examinateur IA pour l’oral et chronomètre de 60 minutes pour l’écrit. Chaque tâche est corrigée deux fois selon la grille officielle, et vous recevez un niveau CECR, une estimation NCLC et vos priorités. Il s’agit d’une estimation d’entraînement : le score officiel est attribué par des correcteurs habilités.' },
      { q: 'Vos professeurs sont-ils des locuteurs natifs ?', a: 'Oui. Chaque professeur est un francophone natif certifié, avec plusieurs années d’expérience et une formation spécialisée pour le TEF, le TCF, le DELF et le DALF.' },
      { q: 'Puis-je réserver une démo gratuite ?', a: 'Oui. La séance découverte est gratuite et sans engagement : nous évaluons votre niveau, parlons de vos objectifs et de votre échéancier, puis vous jumelons avec le bon professeur.' },
      { q: 'Accueillez-vous les débutants et les enfants ?', a: 'Oui. Nous enseignons tous les niveaux, du A1 au C2, et proposons des cours interactifs pour les enfants de 6 à 16 ans.' },
    ],
  },
  finale: {
    title: 'Votre prochain score commence par une démo gratuite.',
    sub: 'Rejoignez plus de 1 000 étudiants qui ont fait confiance à des professeurs natifs pour atteindre leurs objectifs.',
    cta: 'Réserver ma démo gratuite',
    login: 'J’ai déjà un compte',
    trust: 'Sans engagement · Démo 100 % gratuite',
  },
  footer: {
    tagline: 'Votre partenaire pour réussir vos examens de français. Professeurs natifs, méthodes éprouvées, résultats réels.',
    contactLabel: 'Questions et assistance',
    exams: 'Examens', platform: 'Plateforme', company: 'Entreprise', languages: 'Langues',
    examLinks: ['TEF Canada', 'TCF Canada', 'TCF Québec et TEFAQ', 'DELF et DALF', 'Français des affaires'],
    platformLinks: [
      { label: 'Notre méthode', href: '#method' }, { label: 'Simulateur d’examen', href: '#simulator' },
      { label: 'La plateforme', href: '#platform' }, { label: 'Comment ça marche', href: '#how' }, { label: 'Espace étudiant', href: '/login' },
    ],
    companyLinks: [
      { label: 'Réserver une démo gratuite', href: '#', demo: true }, { label: 'Avis des étudiants', href: '#reviews' },
      { label: 'FAQ', href: '#faq' }, { label: 'Nous contacter', href: `mailto:${CONTACT_EMAIL}` },
    ],
    rights: 'Tous droits réservés.',
    made: 'Conçu avec soin pour nos apprenants de français.',
  },
};

export const LANDING: Record<Lang, LandingCopy> = { en, fr };
