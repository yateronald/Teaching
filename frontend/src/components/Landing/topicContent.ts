// Every word of the topic pages (one page per exam or kind of course), in
// English and French. Like landingContent, the page, its pre-rendered HTML and
// its structured data (breadcrumb, course, FAQ) are all built from this copy.
//
// Facts about the exams come from the organizations that run them (IRCC,
// Québec's immigration ministry, France Éducation International, CCI Paris
// Île-de-France). Check them again when an exam changes its format.
import type { Lang } from './landingContent';
import type { TopicId } from './sitePages';

export interface TopicTable {
  id: string;
  eyebrow: string;
  title: string;
  sub: string;
  cols: string[];
  /** The first cell of each row names the row. */
  rows: string[][];
  note?: string;
}

export interface TopicCopy {
  meta: { title: string; description: string };
  /** Short name: breadcrumb, footer and links from other pages. */
  name: string;
  /** One line under the name when another page links here. */
  card: string;
  eyebrow: string;
  /** Rendered as `h1[0] <em>h1[1]</em>`. */
  h1: [string, string];
  intro: string;
  highlights: string[];
  ctaSecondary: string;
  facts: [string, string][];
  tables: TopicTable[];
  guide: { title: string; paragraphs: string[]; links?: TopicId[] }[];
  method: { title: string; sub: string; items: { title: string; desc: string }[] };
  /** Index in the testimonials of the home page. */
  quote?: number;
  faqTitle: string;
  faq: { q: string; a: string }[];
  related: TopicId[];
  /** CEFR range, for the structured data. */
  level: string;
}

export interface TopicUi {
  home: string;
  breadcrumb: string;
  atGlance: string;
  demo: string;
  asideTitle: string;
  asideItems: string[];
  methodEyebrow: string;
  guideEyebrow: string;
  faqEyebrow: string;
  relatedEyebrow: string;
  relatedTitle: string;
  learnMore: string;
  readMore: string;
  quoteLabel: string;
  finale: { title: string; sub: string };
}

export const TOPIC_UI: Record<Lang, TopicUi> = {
  en: {
    home: 'Home',
    breadcrumb: 'Breadcrumb',
    atGlance: 'At a glance',
    demo: 'Book your free demo',
    asideTitle: 'Your free demo includes',
    asideItems: ['A level assessment with a native teacher', 'Your target and a realistic timeline', 'A personal study plan', 'No commitment'],
    methodEyebrow: 'Our method',
    guideEyebrow: 'Guide',
    faqEyebrow: 'FAQ',
    relatedEyebrow: 'Keep exploring',
    relatedTitle: 'More ways to learn French with us',
    learnMore: 'Learn more',
    readMore: 'Read more:',
    quoteLabel: 'Student review',
    finale: { title: 'Start with a free demo.', sub: 'Meet a native teacher, find out your level and leave with a plan for your goal.' },
  },
  fr: {
    home: 'Accueil',
    breadcrumb: 'Fil d’Ariane',
    atGlance: 'En bref',
    demo: 'Réserver ma démo gratuite',
    asideTitle: 'Votre démo gratuite comprend',
    asideItems: ['Une évaluation de votre niveau avec un professeur natif', 'Votre objectif et un calendrier réaliste', 'Un plan d’étude personnalisé', 'Aucun engagement'],
    methodEyebrow: 'Notre méthode',
    guideEyebrow: 'Guide',
    faqEyebrow: 'FAQ',
    relatedEyebrow: 'Pour aller plus loin',
    relatedTitle: 'D’autres façons d’apprendre le français avec nous',
    learnMore: 'En savoir plus',
    readMore: 'À lire aussi :',
    quoteLabel: 'Avis d’étudiant',
    finale: { title: 'Commencez par une démo gratuite.', sub: 'Rencontrez un professeur natif, découvrez votre niveau et repartez avec un plan pour votre objectif.' },
  },
};

// IRCC's official equivalence between TCF Canada scores and CLB / NCLC levels.
const TCF_CLB_ROWS = [
  ['549–699', '549–699', '16–20', '16–20'],
  ['523–548', '524–548', '14–15', '14–15'],
  ['503–522', '499–523', '12–13', '12–13'],
  ['458–502', '453–498', '10–11', '10–11'],
  ['398–457', '406–452', '7–9', '7–9'],
  ['369–397', '375–405', '6', '6'],
  ['331–368', '342–374', '4–5', '4–5'],
];
const clbRows = (scale: string, top: string) => TCF_CLB_ROWS.map((r, i) => [`${scale} ${i === 0 ? top : 10 - i}`, ...r]);

const en: Record<TopicId, TopicCopy> = {
  'tcf-canada': {
    meta: {
      title: 'TCF Canada Preparation Online | Native French Teachers',
      description: 'Prepare for the TCF Canada online with native French teachers: the four tests, the official CLB score chart and full mock exams. Book a free demo.',
    },
    name: 'TCF Canada preparation',
    card: 'The four tests, the CLB score chart and mock exams in real conditions.',
    eyebrow: 'Express Entry · Permanent residence · Citizenship',
    h1: ['TCF Canada preparation with', 'native French teachers'],
    intro: 'The TCF Canada is one of the two French tests IRCC accepts for Express Entry, permanent residence and citizenship. We prepare you for its four tests with live classes, full mock exams and a speaking and writing simulator scored in CLB, so you walk in knowing your level.',
    highlights: ['All four tests: listening, reading, writing, speaking', 'Mock exams in real conditions, with corrections', 'Your estimated CLB after every attempt'],
    ctaSecondary: 'See the test format',
    facts: [
      ['Test', 'TCF Canada, by France Éducation International'],
      ['Accepted by', 'IRCC: Express Entry, permanent residence, citizenship'],
      ['Tests', '4 compulsory: listening, reading, writing, speaking'],
      ['Total time', 'About 2 h 50'],
      ['Results', 'Valid for 2 years for IRCC'],
    ],
    tables: [
      {
        id: 'format', eyebrow: 'Test format', title: 'The four tests of the TCF Canada',
        sub: 'Every test is compulsory for IRCC. We train each one in its official format and timing.',
        cols: ['Test', 'What you do', 'Time', 'Score'],
        rows: [
          ['Listening (compréhension orale)', '39 multiple-choice questions on recordings, from everyday exchanges to radio extracts', '35 min', '100 to 699'],
          ['Reading (compréhension écrite)', '39 multiple-choice questions on documents of increasing difficulty', '60 min', '100 to 699'],
          ['Writing (expression écrite)', '3 tasks: a short message, an article or blog post, and a text comparing two points of view', '60 min', '0 to 20'],
          ['Speaking (expression orale)', '3 tasks with an examiner: a guided interview, a role-play and your point of view on a topic', 'About 12 min', '0 to 20'],
        ],
        note: 'Official scores are awarded by France Éducation International. Our simulator gives practice estimates.',
      },
      {
        id: 'scores', eyebrow: 'Score chart', title: 'TCF Canada scores and CLB levels',
        sub: 'IRCC converts each TCF Canada score into a CLB (NCLC) level, skill by skill. Here is the official equivalence.',
        cols: ['Level', 'Listening', 'Reading', 'Writing', 'Speaking'],
        rows: clbRows('CLB', '10+'),
        note: 'Source: Immigration, Refugees and Citizenship Canada (IRCC). Check the IRCC website before you apply, as equivalences can change.',
      },
    ],
    guide: [
      {
        title: 'Who needs the TCF Canada?',
        paragraphs: [
          'You need an approved French test if you apply for permanent residence through Express Entry with French as your first or second official language, if you want the additional points Express Entry gives to strong French speakers, or if you apply for Canadian citizenship and prove your language skills with a test.',
          'The TCF Canada and the TEF Canada are the only French tests IRCC accepts for these applications. Both measure the same four skills; the TCF Canada scores listening and reading out of 699, and writing and speaking out of 20.',
        ],
      },
      {
        title: 'What CLB do you need?',
        paragraphs: [
          'For the Federal Skilled Worker Program, the minimum is CLB 7 in each of the four skills of your first official language. Express Entry also gives additional points to candidates who reach CLB 7 or higher in all four French skills, and IRCC regularly holds draws reserved for candidates with strong French.',
          'For citizenship, adults aged 18 to 54 need at least CLB 4 in speaking and listening.',
          'Your exact target depends on your program and your profile. We confirm it with you during the free demo, then turn it into a score to reach in each test.',
        ],
      },
      {
        title: 'How long does it take to prepare?',
        paragraphs: [
          'It depends on where you start. A learner who is already around B1 usually needs 3 to 6 months of steady work (3 to 4 sessions a week) to reach CLB 7. Going from CLB 7 to CLB 9 often takes a few more months, mostly spent on speaking and writing.',
          'The fastest progress comes from practising the exact tasks of the test: we time you, correct you on the official criteria and show you what to change before the next attempt.',
        ],
      },
      {
        title: 'TCF Canada or TEF Canada?',
        paragraphs: [
          'Both are accepted by IRCC for the same applications. The TCF Canada has three tasks in writing and in speaking, with a shorter speaking test; the TEF Canada has two longer speaking sections and two writing sections. Many candidates choose based on the test dates available near them.',
        ],
        links: ['tef-canada'],
      },
    ],
    method: {
      title: 'How we prepare you for the TCF Canada',
      sub: 'Classes with a native teacher, and practice for every test between classes.',
      items: [
        { title: 'A level test first', desc: 'Your free demo starts with an assessment of all four skills, so your plan starts from your real level, not a guess.' },
        { title: 'Live classes by skill', desc: 'One-to-one or small-group classes with a certified native teacher, built around the tasks of the TCF Canada.' },
        { title: 'Speaking and writing simulator', desc: 'Rehearse the speaking test with an AI examiner and the writing test on a 60-minute clock, scored on the official grid.' },
        { title: 'Mock exams and CLB tracking', desc: 'Full mock exams in real conditions, with your estimated CLB for each skill and the three points to work on next.' },
      ],
    },
    quote: 3,
    faqTitle: 'TCF Canada: your questions',
    faq: [
      { q: 'How is the TCF Canada scored?', a: 'Listening and reading are scored from 100 to 699. Writing and speaking are scored from 0 to 20. IRCC then converts each score into a CLB level, skill by skill, using the chart on this page.' },
      { q: 'What score do I need for CLB 7?', a: 'For the TCF Canada, CLB 7 means at least 458 in listening, 453 in reading, and 10 out of 20 in both writing and speaking.' },
      { q: 'How long are TCF Canada results valid?', a: 'IRCC accepts results that are less than two years old when you create your Express Entry profile and when you submit your application for permanent residence.' },
      { q: 'Can I take the TCF Canada online?', a: 'The test itself is taken in an approved test centre. The preparation is online: live classes, mock exams and the simulator all run on our platform, wherever you live.' },
      { q: 'Can I prepare only for the speaking and writing tests?', a: 'Yes. Many candidates are comfortable with listening and reading and lose points in speaking and writing. We can focus your plan on those two tests, with the simulator and a teacher who corrects your answers.' },
    ],
    related: ['tef-canada', 'quebec', 'online'],
    level: 'A2 to C1',
  },

  'tef-canada': {
    meta: {
      title: 'TEF Canada Preparation Online | Native French Teachers',
      description: 'Prepare for the TEF Canada online with native French teachers: all four tests, speaking role-plays and mock exams to reach your CLB. Book a free demo.',
    },
    name: 'TEF Canada preparation',
    card: 'Role-plays, timed practice and mock exams for Express Entry.',
    eyebrow: 'Express Entry · Permanent residence · Citizenship',
    h1: ['TEF Canada preparation with', 'native French teachers'],
    intro: 'The TEF Canada is the French test of the Paris Île-de-France Chamber of Commerce and Industry, accepted by IRCC for Express Entry, permanent residence and citizenship. We prepare you for its four tests with live classes, timed practice and full mock exams, until your target CLB is within reach.',
    highlights: ['Reading, listening, writing and speaking', 'The two speaking sections rehearsed with a teacher', 'Mock exams with a correction after each one'],
    ctaSecondary: 'See the test format',
    facts: [
      ['Test', 'TEF Canada, by CCI Paris Île-de-France'],
      ['Accepted by', 'IRCC: Express Entry, permanent residence, citizenship'],
      ['Tests', '4 compulsory: reading, listening, writing, speaking'],
      ['Total time', 'About 2 h 55'],
      ['Results', 'Valid for 2 years for IRCC'],
    ],
    tables: [
      {
        id: 'format', eyebrow: 'Test format', title: 'The four tests of the TEF Canada',
        sub: 'All four tests are compulsory for IRCC. Since December 2023, each result is given on a scale of 0 to 699.',
        cols: ['Test', 'What you do', 'Time'],
        rows: [
          ['Reading (compréhension écrite)', '40 multiple-choice questions on everyday and professional documents', '60 min'],
          ['Listening (compréhension orale)', '40 multiple-choice questions on recordings, answered in order', '40 min'],
          ['Writing (expression écrite)', 'Section A: continue a news article (80 words minimum). Section B: give and justify your point of view (200 words minimum)', '60 min'],
          ['Speaking (expression orale)', 'Section A: ask questions to obtain information. Section B: convince a friend, face to face with an examiner', '15 min'],
        ],
        note: 'In writing, section A takes 25 minutes and section B 35 minutes. In speaking, section A lasts 5 minutes and section B 10 minutes.',
      },
    ],
    guide: [
      {
        title: 'Who takes the TEF Canada?',
        paragraphs: [
          'Candidates for permanent residence through Express Entry, applicants who want the extra points Express Entry gives for strong French, and people applying for Canadian citizenship who prove their language level with a test. The TEF Canada and the TCF Canada are the only two French tests IRCC accepts for these applications.',
          'All four tests are compulsory for Express Entry. IRCC converts each result into a CLB (NCLC) level, skill by skill, with its official equivalence table.',
        ],
      },
      {
        title: 'What makes the TEF Canada different',
        paragraphs: [
          'The speaking test is a real conversation: in section A you call someone to get information about an advertisement, and in section B you try to convince a friend. Candidates who rehearse these two role-plays with a partner who pushes back do much better than those who only learn set phrases.',
          'In writing, section A asks you to continue a news story in a neutral style, and section B to defend an opinion in a structured letter. Both are corrected on precise criteria that we teach you to meet.',
        ],
      },
      {
        title: 'What CLB do you need?',
        paragraphs: [
          'For the Federal Skilled Worker Program, the minimum is CLB 7 in each skill of your first official language, and Express Entry gives additional points to candidates who reach CLB 7 or higher in all four French skills. For citizenship, adults aged 18 to 54 need at least CLB 4 in speaking and listening.',
          'We confirm your exact target during your free demo and turn it into a score to reach in each test.',
        ],
      },
      {
        title: 'TEF Canada or TCF Canada?',
        paragraphs: [
          'Both are accepted by IRCC for the same applications. The TEF Canada has two longer speaking sections and two writing sections; the TCF Canada has three shorter tasks in each. Choose the format that suits you and the test dates available near you.',
        ],
        links: ['tcf-canada'],
      },
    ],
    method: {
      title: 'How we prepare you for the TEF Canada',
      sub: 'A native teacher for the tests that need a partner, and timed practice for the rest.',
      items: [
        { title: 'A level test first', desc: 'Your free demo starts with an assessment of all four skills, so your plan starts from your real level.' },
        { title: 'Role-plays with a real partner', desc: 'Your teacher plays the person you call and the friend you must convince, and pushes back like the examiner.' },
        { title: 'Writing corrected on the criteria', desc: 'Articles and opinion letters written on the clock, corrected with the mistakes explained and a model to compare.' },
        { title: 'Timed reading and listening', desc: 'Series of questions in exam timing, with every answer explained and your level after each attempt.' },
      ],
    },
    quote: 0,
    faqTitle: 'TEF Canada: your questions',
    faq: [
      { q: 'How long are TEF Canada results valid?', a: 'IRCC accepts results that are less than two years old when you create your Express Entry profile and when you submit your application for permanent residence.' },
      { q: 'Are all four TEF Canada tests compulsory?', a: 'For Express Entry and permanent residence, yes: IRCC needs a result in reading, listening, writing and speaking. For citizenship, IRCC looks at speaking and listening.' },
      { q: 'How long does it take to prepare?', a: 'From a B1 level, most students need 3 to 6 months of regular work to reach CLB 7. Higher targets take longer, mostly in speaking and writing. You get a personal timeline after your free demo.' },
      { q: 'Do you also prepare for the TCF Canada?', a: 'Yes. Both tests measure the same skills with different tasks. If you are not sure which one to take, we compare them with you during the free demo.' },
    ],
    related: ['tcf-canada', 'quebec', 'online'],
    level: 'A2 to C1',
  },

  quebec: {
    meta: {
      title: 'TCF Québec & TEFAQ Preparation Online | Native Teachers',
      description: 'Prepare for the TCF Québec or the TEFAQ online with native French teachers: oral practice, Québec situations and mock exams. Book a free demo.',
    },
    name: 'TCF Québec & TEFAQ preparation',
    card: 'The tests Québec requires, with a focus on spoken French.',
    eyebrow: 'Québec immigration · PSTQ',
    h1: ['TCF Québec and TEFAQ preparation with', 'native French teachers'],
    intro: 'Québec asks immigration candidates to prove their French with a recognized test, and the TCF Québec and the TEFAQ were designed for exactly that. We prepare you for the tests your program requires, with live classes, everyday Québec situations and timed practice.',
    highlights: ['Spoken French first, written French when your program asks for it', 'Everyday Québec situations in class', 'Mock exams with timed audio'],
    ctaSecondary: 'Compare the two tests',
    facts: [
      ['Tests', 'TCF Québec (France Éducation International) and TEFAQ (CCI Paris Île-de-France)'],
      ['Accepted by', 'Québec’s immigration ministry (MIFI)'],
      ['Format', 'Modular: you register for the tests your program requires'],
      ['Skills', 'Listening, speaking, reading, writing'],
      ['Results', 'Two years old or less when you apply'],
    ],
    tables: [
      {
        id: 'tests', eyebrow: 'The two tests', title: 'TCF Québec and TEFAQ side by side',
        sub: 'Both are recognized by Québec. Each skill is a separate test: you take the ones your program asks for.',
        cols: ['Skill', 'TCF Québec', 'TEFAQ'],
        rows: [
          ['Listening', '39 questions · 35 min', '40 questions · 40 min'],
          ['Reading', '39 questions · 60 min', '40 questions · 60 min'],
          ['Writing', '3 tasks · 60 min', '2 sections · 60 min'],
          ['Speaking', '3 tasks · about 12 min', '2 sections · 15 min'],
        ],
        note: 'The formats follow the TCF Canada and the TEF Canada. Check the requirement of your program on the Québec government website before you register.',
      },
    ],
    guide: [
      {
        title: 'Who needs the TCF Québec or the TEFAQ?',
        paragraphs: [
          'Anyone applying for permanent selection in Québec, for example through the Skilled Worker Selection Program (PSTQ), must show their level of French. Québec’s immigration ministry recognizes several tests, and the TCF Québec and the TEFAQ are the two built for this purpose.',
          'The TCF Canada, the TEF Canada, the DELF and the DALF are also accepted by Québec, which helps if you are applying to both Canada and Québec.',
        ],
        links: ['tcf-canada', 'tef-canada', 'delf-dalf'],
      },
      {
        title: 'Which skills, and which level?',
        paragraphs: [
          'Québec gives great weight to spoken French, and its skilled worker program now also takes written French into account. The level required depends on your program and your stream, and results are converted to Québec’s own scale of French proficiency.',
          'We check the current requirement with you during the free demo, then set a target for each test you need to take.',
        ],
      },
      {
        title: 'Why speaking practice matters most',
        paragraphs: [
          'In the speaking test you must understand quickly, answer naturally and keep the conversation going. That comes from speaking a lot with someone who corrects you, which is why every class is built around conversation, with the situations you will meet in Québec: work, housing, services and daily life.',
        ],
      },
    ],
    method: {
      title: 'How we prepare you for Québec',
      sub: 'Spoken French first, then the written tests your program requires.',
      items: [
        { title: 'A level test first', desc: 'Your free demo assesses your spoken and written French and confirms which tests your program requires.' },
        { title: 'Conversation every class', desc: 'A native teacher makes you speak from the first minute, on real Québec situations, and corrects you as you go.' },
        { title: 'Timed listening practice', desc: 'Audio series in exam timing, with the answers explained and your level after each attempt.' },
        { title: 'Written tests if you need them', desc: 'Letters, messages and opinion texts written on the clock and corrected on the official criteria.' },
      ],
    },
    quote: 2,
    faqTitle: 'TCF Québec and TEFAQ: your questions',
    faq: [
      { q: 'What is the difference between the TCF Québec and the TEFAQ?', a: 'They are two different tests recognized by Québec: the TCF Québec comes from France Éducation International and the TEFAQ from the Paris Île-de-France Chamber of Commerce and Industry. Their tasks and timings differ, but both let you take only the skills your program requires.' },
      { q: 'Can I use my TCF Canada or TEF Canada result for Québec?', a: 'Yes. Québec also recognizes the TCF Canada and the TEF Canada, so one test can serve both applications if it covers the skills each program asks for.' },
      { q: 'How long are the results valid?', a: 'Québec accepts results that are two years old or less on the date you apply for permanent selection.' },
      { q: 'Do you teach Québec French?', a: 'We teach the French the tests expect, and we practise with real Québec situations and vocabulary, so you understand what you will hear when you arrive.' },
    ],
    related: ['tcf-canada', 'tef-canada', 'online'],
    level: 'A2 to C1',
  },

  'delf-dalf': {
    meta: {
      title: 'DELF & DALF Preparation Online, A1 to C2 | Native Teachers',
      description: 'Prepare for the DELF or the DALF online, from A1 to C2, with native French teachers: official format, mock papers and writing and speaking coaching.',
    },
    name: 'DELF & DALF preparation',
    card: 'Official diplomas valid for life, from A1 to C2.',
    eyebrow: 'Official diplomas · Valid for life',
    h1: ['DELF and DALF preparation, from A1 to C2, with', 'native French teachers'],
    intro: 'The DELF and the DALF are the official French diplomas of France’s Ministry of Education, recognized worldwide and valid for life. We prepare every level in the official exam format, with live classes, full mock papers and coaching for the written and spoken tests.',
    highlights: ['Every level: DELF A1 to B2, DALF C1 and C2', 'Full mock papers in the official format', 'Writing and speaking coached by a native teacher'],
    ctaSecondary: 'See the levels',
    facts: [
      ['Diplomas', 'DELF A1, A2, B1, B2 · DALF C1, C2'],
      ['Issued by', 'France’s Ministry of Education, through France Éducation International'],
      ['Validity', 'For life'],
      ['Tests', '4 papers per level, each scored out of 25'],
      ['Pass mark', '50 out of 100, with at least 5 out of 25 in each paper'],
    ],
    tables: [
      {
        id: 'levels', eyebrow: 'The levels', title: 'Which DELF or DALF level is right for you?',
        sub: 'Each diploma matches a level of the Common European Framework of Reference (CEFR). You can register directly for the level you want.',
        cols: ['Diploma', 'CEFR level', 'What it shows'],
        rows: [
          ['DELF A1', 'A1, beginner', 'You can handle simple everyday exchanges'],
          ['DELF A2', 'A2, elementary', 'You can manage routine situations and short conversations'],
          ['DELF B1', 'B1, intermediate', 'You can get by in most situations and give your opinion'],
          ['DELF B2', 'B2, upper intermediate', 'You can argue a point of view and follow complex discussions'],
          ['DALF C1', 'C1, advanced', 'You can use French with ease for study and work'],
          ['DALF C2', 'C2, mastery', 'You can handle demanding academic and professional situations'],
        ],
      },
      {
        id: 'format', eyebrow: 'Exam format', title: 'The four papers, for example at DELF B2',
        sub: 'Every level has the same four papers, each scored out of 25. Here is the DELF B2, the most requested level.',
        cols: ['Paper', 'What you do', 'Time'],
        rows: [
          ['Listening', 'Questions on recorded documents', 'About 30 min'],
          ['Reading', 'Questions on written documents', '1 h'],
          ['Writing', 'An argued text, such as an opinion article or a formal letter', '1 h'],
          ['Speaking', 'Present and defend a point of view from a short document, then discuss it with the examiners', 'About 20 min, after 30 min of preparation'],
        ],
        note: 'To pass, you need 50 out of 100 in total and at least 5 out of 25 in each paper.',
      },
    ],
    guide: [
      {
        title: 'Why take the DELF or the DALF?',
        paragraphs: [
          'A DELF or DALF diploma never expires, so it proves your level for the rest of your life. It is used for university applications, jobs, and residence or citizenship files in several countries, and Québec recognizes it for immigration.',
          'Many French universities ask international students for a B2 level, and holders of the DALF C1 or C2 are exempt from French language tests when applying to a French university.',
        ],
      },
      {
        title: 'How to choose your level',
        paragraphs: [
          'Choose the level you can pass comfortably, not the one you hope to reach: each diploma is independent, and a pass at B2 is worth more than a fail at C1. Your free demo includes an assessment that tells you which level to register for and how long you need.',
        ],
      },
      {
        title: 'What examiners look for',
        paragraphs: [
          'In the written and spoken papers, examiners use a grid: completing the task, organizing your ideas, range of vocabulary, grammar and, in the speaking paper, pronunciation and interaction. We teach you these criteria, correct your work against them and show you where the points are.',
        ],
      },
    ],
    method: {
      title: 'How we prepare you for the DELF and the DALF',
      sub: 'The official format from the first class, and a teacher who corrects like an examiner.',
      items: [
        { title: 'The right level first', desc: 'An assessment during your free demo tells you which diploma to aim for and when you will be ready.' },
        { title: 'Classes in the official format', desc: 'Each class works on the tasks of your level, with authentic documents and the official timings.' },
        { title: 'Writing and speaking coaching', desc: 'Your texts and presentations are corrected on the examiners’ grid, with the mistakes explained.' },
        { title: 'Full mock papers', desc: 'Complete mock exams in real conditions before the big day, with your score for each paper.' },
      ],
    },
    quote: 1,
    faqTitle: 'DELF and DALF: your questions',
    faq: [
      { q: 'Do the DELF and the DALF expire?', a: 'No. Both diplomas are valid for life. Some institutions may still ask for a recent result, so check the requirement of the place you apply to.' },
      { q: 'Do I have to pass the lower levels first?', a: 'No. Each diploma is independent: you can register directly for B2 or C1 if that is your level.' },
      { q: 'What score do I need to pass?', a: 'At least 50 out of 100 in total, with a minimum of 5 out of 25 in each of the four papers.' },
      { q: 'Is the DELF accepted for Canadian immigration?', a: 'Québec accepts the DELF and the DALF for its immigration programs. For Express Entry and Canadian citizenship, IRCC only accepts the TEF Canada and the TCF Canada, which we also prepare.' },
      { q: 'How long does it take to prepare?', a: 'It depends on the gap between your level and the diploma. Moving up one CEFR level usually takes several months of regular classes; if you are already at the right level, a few weeks of exam training can be enough.' },
    ],
    related: ['online', 'tcf-canada', 'kids'],
    level: 'A1 to C2',
  },

  online: {
    meta: {
      title: 'Online French Classes & Private Lessons | Native Teachers',
      description: 'Live online French classes with certified native teachers, one-to-one or in small groups, for every level from A1 to C2. Book a free demo.',
    },
    name: 'Online French classes',
    card: 'Live classes for every level, one-to-one or in a small group.',
    eyebrow: 'All levels · One-to-one or small group',
    h1: ['Online French classes with', 'professional native teachers'],
    intro: 'Learn French online in live classes with certified native teachers, one-to-one or in a small group, from your first words to fluent conversation. Your teacher follows your progress, and everything you need between classes is on one platform.',
    highlights: ['Every level, from A1 beginner to C2', 'Live video classes at times that suit your time zone', 'Quizzes, resources and progress tracking between classes'],
    ctaSecondary: 'See the levels',
    facts: [
      ['Format', 'Live video classes, one-to-one or small group'],
      ['Teachers', 'Certified native French speakers'],
      ['Levels', 'A1 to C2'],
      ['Schedule', 'Flexible, adapted to your time zone'],
      ['First step', 'A free demo with a level assessment'],
    ],
    tables: [
      {
        id: 'levels', eyebrow: 'Levels', title: 'From beginner to fluent: the six CEFR levels',
        sub: 'We place you on the Common European Framework of Reference (CEFR) during your free demo, then move you up one level at a time.',
        cols: ['Level', 'What you can do'],
        rows: [
          ['A1 · Beginner', 'Introduce yourself, ask simple questions and understand familiar everyday words'],
          ['A2 · Elementary', 'Handle routine tasks: shopping, directions, simple exchanges about your life and work'],
          ['B1 · Intermediate', 'Get by in most situations, tell a story, explain a plan and give your opinion'],
          ['B2 · Upper intermediate', 'Speak with fluency, follow complex discussions and defend a point of view'],
          ['C1 · Advanced', 'Use French easily for work and study, with precise and well-organized language'],
          ['C2 · Mastery', 'Understand virtually everything and express fine shades of meaning'],
        ],
      },
    ],
    guide: [
      {
        title: 'What a class looks like',
        paragraphs: [
          'Each class is a live video session with your teacher. You speak from the first minute: conversation, pronunciation, grammar when you need it and vocabulary for your goals. After class, your teacher can assign exercises and resources on the platform, so you keep practising until the next session.',
        ],
      },
      {
        title: 'One-to-one or small group?',
        paragraphs: [
          'One-to-one classes move at your pace and focus entirely on your goals, which suits busy professionals and anyone preparing an exam. Small groups give you more conversation partners and a shared rhythm. We help you choose during your free demo.',
        ],
      },
      {
        title: 'How long does it take to learn French?',
        paragraphs: [
          'The US Foreign Service Institute places French among the languages English speakers learn fastest, and estimates about 600 to 750 class hours to reach professional working proficiency. Most learners notice clear progress within a few weeks of regular classes, and moving up one CEFR level usually takes a few months.',
        ],
      },
      {
        title: 'Learn French for your goal',
        paragraphs: [
          'Many of our students learn for a reason: an exam, a move, a job or family. Your classes follow that goal, and if it is an exam, you prepare it with us from start to finish.',
        ],
        links: ['tcf-canada', 'tef-canada', 'delf-dalf', 'business'],
      },
    ],
    method: {
      title: 'Why learn French with us',
      sub: 'A teacher who knows you, a clear path and the tools to practise between classes.',
      items: [
        { title: 'Native, certified teachers', desc: 'Every teacher is a certified native French speaker with years of experience teaching adults and children.' },
        { title: 'A plan built around you', desc: 'Your level, your goal and your schedule decide the program, not a fixed textbook.' },
        { title: 'Speaking from day one', desc: 'Classes are built on conversation, with corrections that help you sound natural.' },
        { title: 'Practice between classes', desc: 'Quizzes, audio and PDF resources and your progress, all on the platform your teacher uses.' },
      ],
    },
    quote: 4,
    faqTitle: 'Online French classes: your questions',
    faq: [
      { q: 'Can complete beginners join?', a: 'Yes. We teach every level from A1. Your first classes focus on sounds, essential words and simple conversations, so you speak from the start.' },
      { q: 'Are your teachers native French speakers?', a: 'Yes. Every teacher is a certified native French speaker with several years of teaching experience.' },
      { q: 'How do online classes work?', a: 'Classes are live video sessions on our platform. You join from a computer, tablet or phone, see your schedule and reminders, and find your exercises and resources in the same place.' },
      { q: 'Can I choose my schedule?', a: 'Yes. Classes are planned at times that suit you and your time zone. We agree on the rhythm during your free demo.' },
      { q: 'How do I start?', a: 'Book a free demo. We assess your level, talk about your goals and match you with the right teacher.' },
    ],
    related: ['tcf-canada', 'delf-dalf', 'business'],
    level: 'A1 to C2',
  },

  business: {
    meta: {
      title: 'Business French Classes Online | Native French Teachers',
      description: 'Business French classes online with native teachers: meetings, calls, emails and presentations, built around your job. Book a free demo.',
    },
    name: 'Business French',
    card: 'Meetings, emails and presentations in French.',
    eyebrow: 'Professionals · Teams · All levels',
    h1: ['Business French classes with', 'native French teachers'],
    intro: 'Work in French with confidence: meetings, calls, emails and presentations. Our business French classes are live, one-to-one or in small groups, and built around your job, your sector and the people you work with.',
    highlights: ['Meetings, calls, emails and presentations', 'The vocabulary of your sector and your role', 'Flexible times around your working day'],
    ctaSecondary: 'See what you will practise',
    facts: [
      ['For', 'Professionals and teams working with French speakers'],
      ['Format', 'Live video classes, one-to-one or small group'],
      ['Levels', 'A1 to C2'],
      ['Focus', 'Your job, your sector, your real situations'],
      ['Schedule', 'Before, during or after working hours'],
    ],
    tables: [
      {
        id: 'program', eyebrow: 'Program', title: 'What you practise in business French',
        sub: 'Your teacher builds each class from situations you actually meet at work.',
        cols: ['Situation', 'What you learn'],
        rows: [
          ['Meetings', 'Give an update, agree and disagree politely, summarize decisions'],
          ['Phone and video calls', 'Introduce yourself, handle questions, follow a fast conversation'],
          ['Emails and reports', 'Write clear, polite messages with the right level of formality'],
          ['Presentations', 'Structure a talk, present figures and answer questions'],
          ['Clients and negotiation', 'Present an offer, handle objections and close a discussion'],
          ['Networking', 'Small talk, introductions and building professional relationships'],
        ],
      },
    ],
    guide: [
      {
        title: 'Who business French is for',
        paragraphs: [
          'Professionals who work with French-speaking clients, colleagues or partners, in Canada, France, Belgium, Switzerland or French-speaking Africa, and people preparing to move for work. Classes suit all levels: beginners learn the essentials of professional life, advanced speakers polish precision and tone.',
        ],
      },
      {
        title: 'Classes built around your work',
        paragraphs: [
          'You bring your real material: an email to answer, a presentation to give, a meeting to prepare. Your teacher turns it into the lesson, so what you learn is useful the same day.',
        ],
      },
      {
        title: 'Getting a certificate',
        paragraphs: [
          'If your employer or an immigration program asks for proof of your level, we can prepare you for the TEF, the TCF or the DELF alongside your business classes.',
        ],
        links: ['tef-canada', 'tcf-canada', 'delf-dalf'],
      },
    ],
    method: {
      title: 'How our business French classes work',
      sub: 'Focused sessions that fit into a working week.',
      items: [
        { title: 'A needs assessment', desc: 'During your free demo we assess your level and list the situations you need French for.' },
        { title: 'Your sector’s vocabulary', desc: 'Finance, tech, health, sales, hospitality: the words and phrases of your field, in context.' },
        { title: 'Your real material', desc: 'Your emails, slides and meetings become exercises, corrected by a native teacher.' },
        { title: 'Progress you can measure', desc: 'Regular checks of your level and a clear record of your progress on the platform.' },
      ],
    },
    quote: 2,
    faqTitle: 'Business French: your questions',
    faq: [
      { q: 'Do I need a certain level to start?', a: 'No. Beginners learn the essentials of professional life from the first classes, and advanced speakers work on precision, tone and fluency.' },
      { q: 'Can colleagues learn together?', a: 'Yes. Small groups of colleagues can learn together, with a program built around your company’s needs. Book a demo or write to us to discuss it.' },
      { q: 'Can classes fit around my working hours?', a: 'Yes. Classes are scheduled when you are available, including early morning, lunchtime and evening, in your time zone.' },
      { q: 'Can you prepare me for a French certificate too?', a: 'Yes. We prepare the TEF, the TCF, the DELF and the DALF, and can combine exam training with your business classes.' },
    ],
    related: ['online', 'tef-canada', 'delf-dalf'],
    level: 'A1 to C2',
  },

  kids: {
    meta: {
      title: 'Online French Classes for Kids, Ages 6 to 16 | Native Teachers',
      description: 'Live online French classes for kids and teens aged 6 to 16, with native teachers: stories, games, conversation and school support. Free demo.',
    },
    name: 'French for kids',
    card: 'Playful live classes for children and teens aged 6 to 16.',
    eyebrow: 'Ages 6 to 16 · Live online classes',
    h1: ['Online French classes for kids, with', 'native French teachers'],
    intro: 'Lively French classes for children and teenagers aged 6 to 16, taught online by native teachers. Stories, games and conversation for the youngest, school support and exam preparation for teens, at a pace adapted to each child.',
    highlights: ['Stories, games and age-adapted activities', 'One-to-one or small groups of children of the same age', 'Progress you can follow on the platform'],
    ctaSecondary: 'See the age groups',
    facts: [
      ['Ages', '6 to 16'],
      ['Format', 'Live video classes, one-to-one or small group'],
      ['Teachers', 'Certified native French speakers'],
      ['Levels', 'From complete beginner'],
      ['First step', 'A free demo to meet the teacher'],
    ],
    tables: [
      {
        id: 'ages', eyebrow: 'Age groups', title: 'Classes that grow with your child',
        sub: 'Activities and goals change with age, so every child learns in the way that suits them.',
        cols: ['Age', 'How they learn', 'Goals'],
        rows: [
          ['6 to 9', 'Stories, games, pictures and short activities', 'Sounds, first words, simple sentences and confidence'],
          ['10 to 12', 'Games, projects and guided conversation', 'Reading, writing short texts and talking about their world'],
          ['13 to 16', 'Discussion, projects and exam-style practice', 'School support, fluency and, if they wish, a DELF diploma'],
        ],
      },
    ],
    guide: [
      {
        title: 'Why start French young',
        paragraphs: [
          'Children pick up sounds and accents easily, and learning a second language early builds listening skills and confidence. French is spoken on five continents and is an official language of Canada, which makes it a valuable language for school and, later, for work.',
        ],
      },
      {
        title: 'Safe, simple online classes',
        paragraphs: [
          'Classes take place on our platform, with the teacher and the children only. Parents book and follow the classes, and children join with one click from a computer or tablet.',
        ],
      },
      {
        title: 'A diploma for teenagers',
        paragraphs: [
          'Teenagers who want an official certificate can prepare for the DELF, a diploma from France’s Ministry of Education that is valid for life and useful for school and university applications.',
        ],
        links: ['delf-dalf'],
      },
    ],
    method: {
      title: 'How our kids’ classes work',
      sub: 'Children learn best when they are active: every session is lively and varied.',
      items: [
        { title: 'Meet the teacher first', desc: 'A free demo lets your child meet a native teacher and lets us assess their level.' },
        { title: 'Active, playful classes', desc: 'Games, stories and conversation keep children speaking for most of the class.' },
        { title: 'The right group', desc: 'One-to-one, or a small group of children of a similar age and level.' },
        { title: 'Progress you can follow', desc: 'Quizzes and results on the platform show what your child has learned.' },
      ],
    },
    faqTitle: 'French for kids: your questions',
    faq: [
      { q: 'From what age can my child start?', a: 'From age 6. Classes for the youngest are built on stories and games, with activities that change often to keep them engaged.' },
      { q: 'My child is a complete beginner. Is that a problem?', a: 'Not at all. We start from the first words and move at your child’s pace.' },
      { q: 'Can you help with French at school?', a: 'Yes. For school-age children and teenagers, classes can follow the school program, with homework support and exam practice.' },
      { q: 'How do online classes work for children?', a: 'Your child joins a live video class on our platform from a computer or tablet. The teacher uses pictures, games and shared activities to keep the class interactive.' },
    ],
    related: ['online', 'delf-dalf', 'business'],
    level: 'A1 to B2',
  },
};

const fr: Record<TopicId, TopicCopy> = {
  'tcf-canada': {
    meta: {
      title: 'Préparation au TCF Canada en ligne | Professeurs natifs',
      description: 'Préparez le TCF Canada en ligne avec des professeurs natifs : les quatre épreuves, le tableau officiel des NCLC et des examens blancs. Démo gratuite.',
    },
    name: 'Préparation au TCF Canada',
    card: 'Les quatre épreuves, le tableau des scores NCLC et des examens blancs.',
    eyebrow: 'Entrée express · Résidence permanente · Citoyenneté',
    h1: ['Préparation au TCF Canada avec des', 'professeurs natifs'],
    intro: 'Le TCF Canada est l’un des deux tests de français acceptés par IRCC pour Entrée express, la résidence permanente et la citoyenneté. Nous vous préparons à ses quatre épreuves avec des cours en direct, des examens blancs complets et un simulateur d’expression orale et écrite noté en NCLC : le jour J, vous connaissez déjà votre niveau.',
    highlights: ['Les quatre épreuves : compréhension et expression, orales et écrites', 'Des examens blancs en conditions réelles, corrigés', 'Votre NCLC estimé après chaque tentative'],
    ctaSecondary: 'Voir le format du test',
    facts: [
      ['Test', 'TCF Canada, de France Éducation international'],
      ['Accepté par', 'IRCC : Entrée express, résidence permanente, citoyenneté'],
      ['Épreuves', '4 obligatoires : CO, CE, EE, EO'],
      ['Durée totale', 'Environ 2 h 50'],
      ['Validité', '2 ans pour IRCC'],
    ],
    tables: [
      {
        id: 'format', eyebrow: 'Format du test', title: 'Les quatre épreuves du TCF Canada',
        sub: 'Toutes les épreuves sont obligatoires pour IRCC. Nous entraînons chacune dans son format et son minutage officiels.',
        cols: ['Épreuve', 'Ce que vous faites', 'Durée', 'Note'],
        rows: [
          ['Compréhension orale', '39 questions à choix multiple sur des enregistrements, des échanges du quotidien aux extraits radio', '35 min', '100 à 699'],
          ['Compréhension écrite', '39 questions à choix multiple sur des documents de difficulté croissante', '60 min', '100 à 699'],
          ['Expression écrite', '3 tâches : un message court, un article ou un billet de blog, et un texte qui compare deux points de vue', '60 min', '0 à 20'],
          ['Expression orale', '3 tâches avec un examinateur : un entretien dirigé, un jeu de rôle et votre point de vue sur un sujet', 'Environ 12 min', '0 à 20'],
        ],
        note: 'Les scores officiels sont attribués par France Éducation international. Notre simulateur donne des estimations d’entraînement.',
      },
      {
        id: 'scores', eyebrow: 'Tableau des scores', title: 'Scores du TCF Canada et niveaux NCLC',
        sub: 'IRCC convertit chaque score du TCF Canada en niveau NCLC (CLB), compétence par compétence. Voici l’équivalence officielle.',
        cols: ['Niveau', 'Compréhension orale', 'Compréhension écrite', 'Expression écrite', 'Expression orale'],
        rows: clbRows('NCLC', '10+'),
        note: 'Source : Immigration, Réfugiés et Citoyenneté Canada (IRCC). Vérifiez sur le site d’IRCC avant de déposer votre demande : les équivalences peuvent évoluer.',
      },
    ],
    guide: [
      {
        title: 'Qui doit passer le TCF Canada ?',
        paragraphs: [
          'Un test de français reconnu est nécessaire si vous demandez la résidence permanente par Entrée express avec le français comme première ou seconde langue officielle, si vous voulez les points supplémentaires qu’Entrée express accorde aux bons francophones, ou si vous demandez la citoyenneté canadienne et prouvez votre niveau par un test.',
          'Le TCF Canada et le TEF Canada sont les seuls tests de français acceptés par IRCC pour ces demandes. Tous deux évaluent les mêmes quatre compétences ; le TCF Canada note la compréhension orale et écrite sur 699, et l’expression écrite et orale sur 20.',
        ],
      },
      {
        title: 'Quel NCLC viser ?',
        paragraphs: [
          'Pour le Programme des travailleurs qualifiés (fédéral), le minimum est NCLC 7 dans chacune des quatre compétences de votre première langue officielle. Entrée express accorde aussi des points supplémentaires aux candidats qui atteignent NCLC 7 ou plus dans les quatre compétences en français, et IRCC organise régulièrement des rondes d’invitations réservées aux candidats qui parlent bien français.',
          'Pour la citoyenneté, les adultes de 18 à 54 ans doivent atteindre au moins NCLC 4 en expression et en compréhension orales.',
          'Votre cible exacte dépend de votre programme et de votre profil. Nous la confirmons avec vous pendant la démo gratuite, puis la traduisons en score à atteindre pour chaque épreuve.',
        ],
      },
      {
        title: 'Combien de temps faut-il pour se préparer ?',
        paragraphs: [
          'Cela dépend de votre point de départ. Un apprenant déjà proche du B1 a en général besoin de 3 à 6 mois de travail régulier (3 à 4 séances par semaine) pour atteindre NCLC 7. Passer de NCLC 7 à NCLC 9 demande souvent quelques mois de plus, surtout consacrés à l’oral et à l’écrit.',
          'Les progrès les plus rapides viennent de l’entraînement aux tâches exactes du test : nous vous chronométrons, vous corrigeons selon les critères officiels et vous montrons quoi changer avant la tentative suivante.',
        ],
      },
      {
        title: 'TCF Canada ou TEF Canada ?',
        paragraphs: [
          'Les deux sont acceptés par IRCC pour les mêmes démarches. Le TCF Canada compte trois tâches à l’écrit comme à l’oral, pour un oral plus court ; le TEF Canada propose deux sections orales plus longues et deux sections écrites. Beaucoup de candidats choisissent selon les dates de session disponibles près de chez eux.',
        ],
        links: ['tef-canada'],
      },
    ],
    method: {
      title: 'Comment nous vous préparons au TCF Canada',
      sub: 'Des cours avec un professeur natif, et de l’entraînement pour chaque épreuve entre les cours.',
      items: [
        { title: 'D’abord, un test de niveau', desc: 'Votre démo gratuite commence par une évaluation des quatre compétences : votre plan part de votre niveau réel, pas d’une estimation.' },
        { title: 'Des cours en direct par compétence', desc: 'Des cours individuels ou en petit groupe avec un professeur natif certifié, construits autour des tâches du TCF Canada.' },
        { title: 'Simulateur d’oral et d’écrit', desc: 'Entraînez-vous à l’oral avec un examinateur IA et à l’écrit avec un chronomètre de 60 minutes, notés selon la grille officielle.' },
        { title: 'Examens blancs et suivi NCLC', desc: 'Des examens blancs complets en conditions réelles, avec votre NCLC estimé pour chaque compétence et les trois points à travailler ensuite.' },
      ],
    },
    quote: 3,
    faqTitle: 'TCF Canada : vos questions',
    faq: [
      { q: 'Comment le TCF Canada est-il noté ?', a: 'La compréhension orale et la compréhension écrite sont notées de 100 à 699. L’expression écrite et l’expression orale sont notées de 0 à 20. IRCC convertit ensuite chaque score en niveau NCLC, compétence par compétence, selon le tableau de cette page.' },
      { q: 'Quel score faut-il pour NCLC 7 ?', a: 'Au TCF Canada, NCLC 7 correspond à au moins 458 en compréhension orale, 453 en compréhension écrite, et 10 sur 20 en expression écrite comme en expression orale.' },
      { q: 'Combien de temps les résultats du TCF Canada sont-ils valables ?', a: 'IRCC accepte les résultats de moins de deux ans au moment où vous créez votre profil Entrée express et au moment où vous déposez votre demande de résidence permanente.' },
      { q: 'Peut-on passer le TCF Canada en ligne ?', a: 'Le test se passe dans un centre agréé. La préparation, elle, se fait en ligne : cours en direct, examens blancs et simulateur fonctionnent sur notre plateforme, où que vous viviez.' },
      { q: 'Puis-je préparer seulement l’oral et l’écrit ?', a: 'Oui. Beaucoup de candidats sont à l’aise en compréhension et perdent des points en expression. Nous pouvons concentrer votre plan sur ces deux épreuves, avec le simulateur et un professeur qui corrige vos productions.' },
    ],
    related: ['tef-canada', 'quebec', 'online'],
    level: 'A2 à C1',
  },

  'tef-canada': {
    meta: {
      title: 'Préparation au TEF Canada en ligne | Professeurs natifs',
      description: 'Préparez le TEF Canada en ligne avec des professeurs natifs : les quatre épreuves, les jeux de rôle de l’oral et des examens blancs. Démo gratuite.',
    },
    name: 'Préparation au TEF Canada',
    card: 'Jeux de rôle, entraînement chronométré et examens blancs pour Entrée express.',
    eyebrow: 'Entrée express · Résidence permanente · Citoyenneté',
    h1: ['Préparation au TEF Canada avec des', 'professeurs natifs'],
    intro: 'Le TEF Canada est le test de français de la CCI Paris Île-de-France accepté par IRCC pour Entrée express, la résidence permanente et la citoyenneté. Nous vous préparons à ses quatre épreuves avec des cours en direct, un entraînement chronométré et des examens blancs complets, jusqu’à ce que votre NCLC cible soit à portée.',
    highlights: ['Compréhension écrite et orale, expression écrite et orale', 'Les deux sections de l’oral répétées avec un professeur', 'Des examens blancs corrigés après chaque tentative'],
    ctaSecondary: 'Voir le format du test',
    facts: [
      ['Test', 'TEF Canada, de la CCI Paris Île-de-France'],
      ['Accepté par', 'IRCC : Entrée express, résidence permanente, citoyenneté'],
      ['Épreuves', '4 obligatoires : CE, CO, EE, EO'],
      ['Durée totale', 'Environ 2 h 55'],
      ['Validité', '2 ans pour IRCC'],
    ],
    tables: [
      {
        id: 'format', eyebrow: 'Format du test', title: 'Les quatre épreuves du TEF Canada',
        sub: 'Les quatre épreuves sont obligatoires pour IRCC. Depuis décembre 2023, chaque résultat est donné sur une échelle de 0 à 699.',
        cols: ['Épreuve', 'Ce que vous faites', 'Durée'],
        rows: [
          ['Compréhension écrite', '40 questions à choix multiple sur des documents du quotidien et du monde professionnel', '60 min'],
          ['Compréhension orale', '40 questions à choix multiple sur des enregistrements, à traiter dans l’ordre', '40 min'],
          ['Expression écrite', 'Section A : rédiger la suite d’un article (80 mots minimum). Section B : exprimer et justifier votre point de vue (200 mots minimum)', '60 min'],
          ['Expression orale', 'Section A : poser des questions pour obtenir des informations. Section B : convaincre un ami, face à un examinateur', '15 min'],
        ],
        note: 'À l’écrit, la section A dure 25 minutes et la section B 35 minutes. À l’oral, la section A dure 5 minutes et la section B 10 minutes.',
      },
    ],
    guide: [
      {
        title: 'Qui passe le TEF Canada ?',
        paragraphs: [
          'Les candidats à la résidence permanente par Entrée express, ceux qui veulent les points supplémentaires qu’Entrée express accorde aux bons francophones, et les personnes qui demandent la citoyenneté canadienne et prouvent leur niveau par un test. Le TEF Canada et le TCF Canada sont les deux seuls tests de français acceptés par IRCC pour ces demandes.',
          'Les quatre épreuves sont obligatoires pour Entrée express. IRCC convertit chaque résultat en niveau NCLC, compétence par compétence, selon son tableau d’équivalence officiel.',
        ],
      },
      {
        title: 'Ce qui distingue le TEF Canada',
        paragraphs: [
          'L’oral est une vraie conversation : en section A, vous appelez quelqu’un pour obtenir des informations sur une annonce ; en section B, vous essayez de convaincre un ami. Les candidats qui répètent ces deux jeux de rôle avec un partenaire qui leur résiste réussissent bien mieux que ceux qui apprennent seulement des phrases toutes faites.',
          'À l’écrit, la section A demande de poursuivre un fait divers dans un style neutre, et la section B de défendre une opinion dans une lettre structurée. Les deux sont corrigées selon des critères précis que nous vous apprenons à remplir.',
        ],
      },
      {
        title: 'Quel NCLC viser ?',
        paragraphs: [
          'Pour le Programme des travailleurs qualifiés (fédéral), le minimum est NCLC 7 dans chaque compétence de votre première langue officielle, et Entrée express accorde des points supplémentaires aux candidats qui atteignent NCLC 7 ou plus dans les quatre compétences en français. Pour la citoyenneté, les adultes de 18 à 54 ans doivent atteindre au moins NCLC 4 en expression et en compréhension orales.',
          'Nous confirmons votre cible exacte pendant votre démo gratuite et la traduisons en score à atteindre pour chaque épreuve.',
        ],
      },
      {
        title: 'TEF Canada ou TCF Canada ?',
        paragraphs: [
          'Les deux sont acceptés par IRCC pour les mêmes démarches. Le TEF Canada propose deux sections orales plus longues et deux sections écrites ; le TCF Canada, trois tâches plus courtes dans chaque épreuve. Choisissez le format qui vous convient et les dates de session disponibles près de chez vous.',
        ],
        links: ['tcf-canada'],
      },
    ],
    method: {
      title: 'Comment nous vous préparons au TEF Canada',
      sub: 'Un professeur natif pour les épreuves qui demandent un partenaire, et un entraînement chronométré pour le reste.',
      items: [
        { title: 'D’abord, un test de niveau', desc: 'Votre démo gratuite commence par une évaluation des quatre compétences : votre plan part de votre niveau réel.' },
        { title: 'Des jeux de rôle avec un vrai partenaire', desc: 'Votre professeur joue la personne que vous appelez et l’ami à convaincre, et vous résiste comme l’examinateur.' },
        { title: 'L’écrit corrigé selon les critères', desc: 'Articles et lettres d’opinion rédigés en temps limité, corrigés avec vos erreurs expliquées et un modèle pour comparer.' },
        { title: 'Compréhension chronométrée', desc: 'Des séries de questions au minutage de l’examen, avec chaque réponse expliquée et votre niveau après chaque tentative.' },
      ],
    },
    quote: 0,
    faqTitle: 'TEF Canada : vos questions',
    faq: [
      { q: 'Combien de temps les résultats du TEF Canada sont-ils valables ?', a: 'IRCC accepte les résultats de moins de deux ans au moment où vous créez votre profil Entrée express et au moment où vous déposez votre demande de résidence permanente.' },
      { q: 'Les quatre épreuves du TEF Canada sont-elles obligatoires ?', a: 'Pour Entrée express et la résidence permanente, oui : IRCC demande un résultat en compréhension écrite, compréhension orale, expression écrite et expression orale. Pour la citoyenneté, IRCC regarde l’expression et la compréhension orales.' },
      { q: 'Combien de temps faut-il pour se préparer ?', a: 'À partir d’un niveau B1, la plupart des étudiants ont besoin de 3 à 6 mois de travail régulier pour atteindre NCLC 7. Les cibles plus hautes demandent plus de temps, surtout à l’oral et à l’écrit. Vous recevez un calendrier personnalisé après votre démo gratuite.' },
      { q: 'Préparez-vous aussi au TCF Canada ?', a: 'Oui. Les deux tests évaluent les mêmes compétences avec des tâches différentes. Si vous hésitez, nous les comparons avec vous pendant la démo gratuite.' },
    ],
    related: ['tcf-canada', 'quebec', 'online'],
    level: 'A2 à C1',
  },

  quebec: {
    meta: {
      title: 'Préparation TCF Québec et TEFAQ en ligne | Profs natifs',
      description: 'Préparez le TCF Québec ou le TEFAQ en ligne avec des professeurs natifs : oral intensif, situations québécoises et examens blancs. Démo gratuite.',
    },
    name: 'Préparation TCF Québec et TEFAQ',
    card: 'Les épreuves exigées par le Québec, avec l’oral en priorité.',
    eyebrow: 'Immigration au Québec · PSTQ',
    h1: ['Préparation au TCF Québec et au TEFAQ avec des', 'professeurs natifs'],
    intro: 'Le Québec demande aux candidats à l’immigration de prouver leur français avec un test reconnu, et le TCF Québec comme le TEFAQ ont été conçus pour cela. Nous vous préparons aux épreuves que votre programme exige, avec des cours en direct, des situations du quotidien québécois et un entraînement chronométré.',
    highlights: ['L’oral d’abord, l’écrit quand votre programme le demande', 'Des situations du quotidien québécois en cours', 'Des examens blancs avec audio chronométré'],
    ctaSecondary: 'Comparer les deux tests',
    facts: [
      ['Tests', 'TCF Québec (France Éducation international) et TEFAQ (CCI Paris Île-de-France)'],
      ['Accepté par', 'Le ministère de l’Immigration du Québec (MIFI)'],
      ['Format', 'Modulaire : vous vous inscrivez aux épreuves exigées par votre programme'],
      ['Compétences', 'Compréhension et expression, orales et écrites'],
      ['Validité', 'Deux ans ou moins au moment de la demande'],
    ],
    tables: [
      {
        id: 'tests', eyebrow: 'Les deux tests', title: 'TCF Québec et TEFAQ côte à côte',
        sub: 'Les deux sont reconnus par le Québec. Chaque compétence est une épreuve distincte : vous passez celles que votre programme demande.',
        cols: ['Compétence', 'TCF Québec', 'TEFAQ'],
        rows: [
          ['Compréhension orale', '39 questions · 35 min', '40 questions · 40 min'],
          ['Compréhension écrite', '39 questions · 60 min', '40 questions · 60 min'],
          ['Expression écrite', '3 tâches · 60 min', '2 sections · 60 min'],
          ['Expression orale', '3 tâches · environ 12 min', '2 sections · 15 min'],
        ],
        note: 'Les formats suivent ceux du TCF Canada et du TEF Canada. Vérifiez l’exigence de votre programme sur le site du gouvernement du Québec avant de vous inscrire.',
      },
    ],
    guide: [
      {
        title: 'Qui doit passer le TCF Québec ou le TEFAQ ?',
        paragraphs: [
          'Toute personne qui demande la sélection permanente au Québec, par exemple par le Programme de sélection des travailleurs qualifiés (PSTQ), doit démontrer son niveau de français. Le ministère de l’Immigration du Québec reconnaît plusieurs tests, dont le TCF Québec et le TEFAQ, conçus pour cela.',
          'Le TCF Canada, le TEF Canada, le DELF et le DALF sont aussi acceptés par le Québec, ce qui aide si vous faites une demande au Canada et au Québec.',
        ],
        links: ['tcf-canada', 'tef-canada', 'delf-dalf'],
      },
      {
        title: 'Quelles compétences, quel niveau ?',
        paragraphs: [
          'Le Québec accorde une grande place au français oral, et son programme des travailleurs qualifiés tient désormais aussi compte de l’écrit. Le niveau exigé dépend de votre programme et de votre volet, et les résultats sont convertis sur l’échelle québécoise des niveaux de compétence en français.',
          'Nous vérifions avec vous l’exigence en vigueur pendant la démo gratuite, puis fixons une cible pour chaque épreuve à passer.',
        ],
      },
      {
        title: 'Pourquoi l’oral compte le plus',
        paragraphs: [
          'À l’oral, il faut comprendre vite, répondre naturellement et faire vivre la conversation. Cela vient d’une pratique abondante avec quelqu’un qui vous corrige : chaque cours est donc construit autour de la conversation, avec les situations que vous vivrez au Québec, comme le travail, le logement, les services et la vie quotidienne.',
        ],
      },
    ],
    method: {
      title: 'Comment nous vous préparons pour le Québec',
      sub: 'L’oral d’abord, puis les épreuves écrites que votre programme exige.',
      items: [
        { title: 'D’abord, un test de niveau', desc: 'Votre démo gratuite évalue votre français oral et écrit, et confirme les épreuves exigées par votre programme.' },
        { title: 'De la conversation à chaque cours', desc: 'Un professeur natif vous fait parler dès la première minute, sur des situations réelles du Québec, et vous corrige au fil de l’échange.' },
        { title: 'Compréhension orale chronométrée', desc: 'Des séries audio au minutage de l’examen, avec les réponses expliquées et votre niveau après chaque tentative.' },
        { title: 'L’écrit si vous en avez besoin', desc: 'Lettres, messages et textes d’opinion rédigés en temps limité et corrigés selon les critères officiels.' },
      ],
    },
    quote: 2,
    faqTitle: 'TCF Québec et TEFAQ : vos questions',
    faq: [
      { q: 'Quelle différence entre le TCF Québec et le TEFAQ ?', a: 'Ce sont deux tests différents reconnus par le Québec : le TCF Québec est conçu par France Éducation international et le TEFAQ par la CCI Paris Île-de-France. Leurs tâches et leurs durées diffèrent, mais tous deux permettent de passer seulement les compétences exigées par votre programme.' },
      { q: 'Mon résultat au TCF Canada ou au TEF Canada vaut-il pour le Québec ?', a: 'Oui. Le Québec reconnaît aussi le TCF Canada et le TEF Canada : un seul test peut servir aux deux demandes s’il couvre les compétences exigées par chaque programme.' },
      { q: 'Combien de temps les résultats sont-ils valables ?', a: 'Le Québec accepte les résultats datant de deux ans ou moins à la date de votre demande de sélection permanente.' },
      { q: 'Enseignez-vous le français du Québec ?', a: 'Nous enseignons le français attendu aux tests, et nous pratiquons avec des situations et du vocabulaire du Québec, pour que vous compreniez ce que vous entendrez à votre arrivée.' },
    ],
    related: ['tcf-canada', 'tef-canada', 'online'],
    level: 'A2 à C1',
  },

  'delf-dalf': {
    meta: {
      title: 'Préparation DELF et DALF en ligne, A1 à C2 | Profs natifs',
      description: 'Préparez le DELF ou le DALF en ligne, du A1 au C2, avec des professeurs natifs : format officiel, sujets blancs et coaching écrit et oral.',
    },
    name: 'Préparation DELF et DALF',
    card: 'Des diplômes officiels valables à vie, du A1 au C2.',
    eyebrow: 'Diplômes officiels · Valables à vie',
    h1: ['Préparation au DELF et au DALF, du A1 au C2, avec des', 'professeurs natifs'],
    intro: 'Le DELF et le DALF sont les diplômes officiels de français du ministère français de l’Éducation, reconnus dans le monde entier et valables à vie. Nous préparons chaque niveau au format officiel de l’examen, avec des cours en direct, des sujets blancs complets et un coaching pour l’écrit et l’oral.',
    highlights: ['Tous les niveaux : DELF A1 à B2, DALF C1 et C2', 'Des sujets blancs complets au format officiel', 'L’écrit et l’oral coachés par un professeur natif'],
    ctaSecondary: 'Voir les niveaux',
    facts: [
      ['Diplômes', 'DELF A1, A2, B1, B2 · DALF C1, C2'],
      ['Délivrés par', 'Le ministère français de l’Éducation, via France Éducation international'],
      ['Validité', 'À vie'],
      ['Épreuves', '4 épreuves par niveau, notées chacune sur 25'],
      ['Réussite', '50 sur 100, avec au moins 5 sur 25 à chaque épreuve'],
    ],
    tables: [
      {
        id: 'levels', eyebrow: 'Les niveaux', title: 'Quel niveau de DELF ou de DALF choisir ?',
        sub: 'Chaque diplôme correspond à un niveau du Cadre européen commun de référence (CECR). Vous pouvez vous inscrire directement au niveau de votre choix.',
        cols: ['Diplôme', 'Niveau CECR', 'Ce qu’il atteste'],
        rows: [
          ['DELF A1', 'A1, découverte', 'Vous gérez des échanges simples du quotidien'],
          ['DELF A2', 'A2, survie', 'Vous vous débrouillez dans les situations courantes et les conversations brèves'],
          ['DELF B1', 'B1, seuil', 'Vous vous débrouillez dans la plupart des situations et donnez votre avis'],
          ['DELF B2', 'B2, avancé', 'Vous défendez un point de vue et suivez des discussions complexes'],
          ['DALF C1', 'C1, autonome', 'Vous utilisez le français avec aisance pour étudier et travailler'],
          ['DALF C2', 'C2, maîtrise', 'Vous évoluez dans des contextes universitaires et professionnels exigeants'],
        ],
      },
      {
        id: 'format', eyebrow: 'Format de l’examen', title: 'Les quatre épreuves, par exemple au DELF B2',
        sub: 'Chaque niveau comprend les mêmes quatre épreuves, notées chacune sur 25. Voici le DELF B2, le niveau le plus demandé.',
        cols: ['Épreuve', 'Ce que vous faites', 'Durée'],
        rows: [
          ['Compréhension de l’oral', 'Questions sur des documents enregistrés', 'Environ 30 min'],
          ['Compréhension des écrits', 'Questions sur des documents écrits', '1 h'],
          ['Production écrite', 'Un texte argumenté, comme un article d’opinion ou une lettre formelle', '1 h'],
          ['Production orale', 'Présenter et défendre un point de vue à partir d’un court document, puis en discuter avec le jury', 'Environ 20 min, après 30 min de préparation'],
        ],
        note: 'Pour réussir, il faut 50 sur 100 au total et au moins 5 sur 25 à chaque épreuve.',
      },
    ],
    guide: [
      {
        title: 'Pourquoi passer le DELF ou le DALF ?',
        paragraphs: [
          'Un diplôme DELF ou DALF n’expire jamais : il prouve votre niveau pour toute la vie. Il sert pour les candidatures universitaires, l’emploi et les dossiers de séjour ou de nationalité dans plusieurs pays, et le Québec le reconnaît pour l’immigration.',
          'Beaucoup d’universités françaises demandent un niveau B2 aux étudiants étrangers, et les titulaires du DALF C1 ou C2 sont dispensés de test de langue pour s’inscrire dans une université française.',
        ],
      },
      {
        title: 'Comment choisir votre niveau',
        paragraphs: [
          'Choisissez le niveau que vous pouvez réussir sereinement, pas celui que vous espérez atteindre : chaque diplôme est indépendant, et un B2 réussi vaut mieux qu’un C1 échoué. Votre démo gratuite comprend une évaluation qui vous dit à quel niveau vous inscrire et combien de temps il vous faut.',
        ],
      },
      {
        title: 'Ce que regardent les examinateurs',
        paragraphs: [
          'À l’écrit comme à l’oral, les examinateurs utilisent une grille : réalisation de la tâche, organisation des idées, étendue du vocabulaire, grammaire et, à l’oral, prononciation et interaction. Nous vous apprenons ces critères, corrigeons vos productions en les suivant et vous montrons où se trouvent les points.',
        ],
      },
    ],
    method: {
      title: 'Comment nous vous préparons au DELF et au DALF',
      sub: 'Le format officiel dès le premier cours, et un professeur qui corrige comme un examinateur.',
      items: [
        { title: 'D’abord, le bon niveau', desc: 'Une évaluation pendant votre démo gratuite vous indique le diplôme à viser et le moment où vous serez prêt.' },
        { title: 'Des cours au format officiel', desc: 'Chaque cours travaille les tâches de votre niveau, avec des documents authentiques et le minutage officiel.' },
        { title: 'Coaching écrit et oral', desc: 'Vos textes et vos présentations sont corrigés selon la grille des examinateurs, avec vos erreurs expliquées.' },
        { title: 'Des sujets blancs complets', desc: 'Des examens blancs complets en conditions réelles avant le jour J, avec votre note à chaque épreuve.' },
      ],
    },
    quote: 1,
    faqTitle: 'DELF et DALF : vos questions',
    faq: [
      { q: 'Le DELF et le DALF expirent-ils ?', a: 'Non. Les deux diplômes sont valables à vie. Certains établissements peuvent toutefois demander un résultat récent : vérifiez l’exigence de l’organisme auprès duquel vous postulez.' },
      { q: 'Faut-il passer les niveaux inférieurs d’abord ?', a: 'Non. Chaque diplôme est indépendant : vous pouvez vous inscrire directement au B2 ou au C1 si c’est votre niveau.' },
      { q: 'Quelle note faut-il pour réussir ?', a: 'Au moins 50 sur 100 au total, avec un minimum de 5 sur 25 à chacune des quatre épreuves.' },
      { q: 'Le DELF est-il accepté pour immigrer au Canada ?', a: 'Le Québec accepte le DELF et le DALF pour ses programmes d’immigration. Pour Entrée express et la citoyenneté canadienne, IRCC accepte uniquement le TEF Canada et le TCF Canada, que nous préparons aussi.' },
      { q: 'Combien de temps faut-il pour se préparer ?', a: 'Cela dépend de l’écart entre votre niveau et le diplôme visé. Gagner un niveau du CECR demande en général plusieurs mois de cours réguliers ; si vous avez déjà le bon niveau, quelques semaines d’entraînement à l’examen peuvent suffire.' },
    ],
    related: ['online', 'tcf-canada', 'kids'],
    level: 'A1 à C2',
  },

  online: {
    meta: {
      title: 'Cours particuliers de français en ligne | Professeurs natifs',
      description: 'Cours de français en ligne avec des professeurs natifs certifiés, en individuel ou en petit groupe, pour tous les niveaux du A1 au C2. Démo gratuite.',
    },
    name: 'Cours de français en ligne',
    card: 'Des cours en direct pour tous les niveaux, en individuel ou en petit groupe.',
    eyebrow: 'Tous niveaux · Individuel ou petit groupe',
    h1: ['Cours de français en ligne avec des', 'professeurs natifs expérimentés'],
    intro: 'Apprenez le français en ligne en cours en direct avec des professeurs natifs certifiés, en individuel ou en petit groupe, de vos premiers mots à une conversation fluide. Votre professeur suit vos progrès, et tout ce qu’il vous faut entre les cours se trouve sur une seule plateforme.',
    highlights: ['Tous les niveaux, du A1 débutant au C2', 'Des cours en visio à des horaires adaptés à votre fuseau', 'Quiz, ressources et suivi de progression entre les cours'],
    ctaSecondary: 'Voir les niveaux',
    facts: [
      ['Format', 'Cours en visio en direct, individuels ou en petit groupe'],
      ['Professeurs', 'Francophones natifs certifiés'],
      ['Niveaux', 'A1 à C2'],
      ['Horaires', 'Flexibles, adaptés à votre fuseau horaire'],
      ['Première étape', 'Une démo gratuite avec évaluation du niveau'],
    ],
    tables: [
      {
        id: 'levels', eyebrow: 'Niveaux', title: 'De débutant à bilingue : les six niveaux du CECR',
        sub: 'Nous vous situons sur le Cadre européen commun de référence (CECR) pendant votre démo gratuite, puis vous faisons progresser niveau par niveau.',
        cols: ['Niveau', 'Ce que vous savez faire'],
        rows: [
          ['A1 · Débutant', 'Vous présenter, poser des questions simples et comprendre des mots familiers du quotidien'],
          ['A2 · Élémentaire', 'Gérer les tâches courantes : achats, itinéraires, échanges simples sur votre vie et votre travail'],
          ['B1 · Intermédiaire', 'Vous débrouiller dans la plupart des situations, raconter, expliquer un projet et donner votre avis'],
          ['B2 · Avancé', 'Parler avec aisance, suivre des discussions complexes et défendre un point de vue'],
          ['C1 · Autonome', 'Utiliser le français facilement au travail et dans les études, avec une langue précise et structurée'],
          ['C2 · Maîtrise', 'Comprendre pratiquement tout et exprimer des nuances fines'],
        ],
      },
    ],
    guide: [
      {
        title: 'À quoi ressemble un cours',
        paragraphs: [
          'Chaque cours est une séance en visio, en direct avec votre professeur. Vous parlez dès la première minute : conversation, prononciation, grammaire quand vous en avez besoin et vocabulaire adapté à vos objectifs. Après le cours, votre professeur peut vous assigner des exercices et des ressources sur la plateforme, pour continuer à pratiquer jusqu’à la séance suivante.',
        ],
      },
      {
        title: 'Individuel ou petit groupe ?',
        paragraphs: [
          'Les cours individuels avancent à votre rythme et se concentrent entièrement sur vos objectifs : ils conviennent aux professionnels pressés et à ceux qui préparent un examen. Les petits groupes vous donnent plus de partenaires de conversation et un rythme partagé. Nous vous aidons à choisir pendant votre démo gratuite.',
        ],
      },
      {
        title: 'Combien de temps pour apprendre le français ?',
        paragraphs: [
          'Le Foreign Service Institute américain classe le français parmi les langues que les anglophones apprennent le plus vite, et estime à environ 600 à 750 heures de cours le temps pour atteindre un niveau professionnel. La plupart des apprenants voient des progrès nets en quelques semaines de cours réguliers, et gagner un niveau du CECR demande en général quelques mois.',
        ],
      },
      {
        title: 'Apprendre le français pour un objectif',
        paragraphs: [
          'Beaucoup de nos étudiants apprennent pour une raison précise : un examen, un déménagement, un emploi ou la famille. Vos cours suivent cet objectif, et s’il s’agit d’un examen, vous le préparez avec nous du début à la fin.',
        ],
        links: ['tcf-canada', 'tef-canada', 'delf-dalf', 'business'],
      },
    ],
    method: {
      title: 'Pourquoi apprendre le français avec nous',
      sub: 'Un professeur qui vous connaît, un parcours clair et les outils pour pratiquer entre les cours.',
      items: [
        { title: 'Des professeurs natifs certifiés', desc: 'Chaque professeur est un francophone natif certifié, avec des années d’expérience auprès des adultes et des enfants.' },
        { title: 'Un plan construit pour vous', desc: 'Votre niveau, votre objectif et votre emploi du temps décident du programme, pas un manuel figé.' },
        { title: 'Parler dès le premier jour', desc: 'Les cours reposent sur la conversation, avec des corrections qui vous aident à parler naturellement.' },
        { title: 'Pratiquer entre les cours', desc: 'Quiz, ressources audio et PDF, et votre progression, sur la plateforme qu’utilise votre professeur.' },
      ],
    },
    quote: 4,
    faqTitle: 'Cours de français en ligne : vos questions',
    faq: [
      { q: 'Les grands débutants peuvent-ils s’inscrire ?', a: 'Oui. Nous enseignons tous les niveaux dès le A1. Vos premiers cours portent sur les sons, les mots essentiels et des conversations simples : vous parlez dès le début.' },
      { q: 'Vos professeurs sont-ils francophones natifs ?', a: 'Oui. Chaque professeur est un francophone natif certifié, avec plusieurs années d’expérience d’enseignement.' },
      { q: 'Comment se déroulent les cours en ligne ?', a: 'Les cours sont des séances en visio sur notre plateforme. Vous vous connectez depuis un ordinateur, une tablette ou un téléphone, et retrouvez votre agenda, vos rappels, vos exercices et vos ressources au même endroit.' },
      { q: 'Puis-je choisir mes horaires ?', a: 'Oui. Les cours sont planifiés aux heures qui vous conviennent, selon votre fuseau horaire. Nous fixons le rythme ensemble pendant votre démo gratuite.' },
      { q: 'Comment commencer ?', a: 'Réservez une démo gratuite. Nous évaluons votre niveau, parlons de vos objectifs et vous jumelons avec le bon professeur.' },
    ],
    related: ['tcf-canada', 'delf-dalf', 'business'],
    level: 'A1 à C2',
  },

  business: {
    meta: {
      title: 'Cours de français des affaires en ligne | Profs natifs',
      description: 'Cours de français des affaires en ligne avec des professeurs natifs : réunions, appels, courriels et présentations, selon votre métier. Démo gratuite.',
    },
    name: 'Français des affaires',
    card: 'Réunions, courriels et présentations en français.',
    eyebrow: 'Professionnels · Équipes · Tous niveaux',
    h1: ['Cours de français des affaires avec des', 'professeurs natifs'],
    intro: 'Travaillez en français avec assurance : réunions, appels, courriels et présentations. Nos cours de français des affaires se font en direct, en individuel ou en petit groupe, et sont construits autour de votre métier, de votre secteur et des personnes avec qui vous travaillez.',
    highlights: ['Réunions, appels, courriels et présentations', 'Le vocabulaire de votre secteur et de votre poste', 'Des horaires souples autour de votre journée de travail'],
    ctaSecondary: 'Voir ce que vous pratiquerez',
    facts: [
      ['Pour', 'Les professionnels et les équipes qui travaillent avec des francophones'],
      ['Format', 'Cours en visio en direct, individuels ou en petit groupe'],
      ['Niveaux', 'A1 à C2'],
      ['Contenu', 'Votre métier, votre secteur, vos situations réelles'],
      ['Horaires', 'Avant, pendant ou après la journée de travail'],
    ],
    tables: [
      {
        id: 'program', eyebrow: 'Programme', title: 'Ce que vous pratiquez en français des affaires',
        sub: 'Votre professeur construit chaque cours à partir des situations que vous vivez vraiment au travail.',
        cols: ['Situation', 'Ce que vous apprenez'],
        rows: [
          ['Réunions', 'Faire un point, exprimer son accord ou son désaccord avec tact, résumer les décisions'],
          ['Appels et visioconférences', 'Vous présenter, gérer les questions, suivre une conversation rapide'],
          ['Courriels et rapports', 'Écrire des messages clairs et polis, au bon niveau de formalité'],
          ['Présentations', 'Structurer une intervention, présenter des chiffres et répondre aux questions'],
          ['Clients et négociation', 'Présenter une offre, répondre aux objections et conclure'],
          ['Réseautage', 'Conversation informelle, présentations et relations professionnelles'],
        ],
      },
    ],
    guide: [
      {
        title: 'À qui s’adresse le français des affaires',
        paragraphs: [
          'Aux professionnels qui travaillent avec des clients, des collègues ou des partenaires francophones, au Canada, en France, en Belgique, en Suisse ou en Afrique francophone, et aux personnes qui préparent une mobilité professionnelle. Les cours conviennent à tous les niveaux : les débutants apprennent l’essentiel de la vie professionnelle, les plus avancés affinent la précision et le ton.',
        ],
      },
      {
        title: 'Des cours construits autour de votre travail',
        paragraphs: [
          'Vous apportez vos vrais supports : un courriel à rédiger, une présentation à donner, une réunion à préparer. Votre professeur en fait la leçon : ce que vous apprenez vous sert le jour même.',
        ],
      },
      {
        title: 'Obtenir une certification',
        paragraphs: [
          'Si votre employeur ou un programme d’immigration demande une preuve de votre niveau, nous pouvons vous préparer au TEF, au TCF ou au DELF en parallèle de vos cours.',
        ],
        links: ['tef-canada', 'tcf-canada', 'delf-dalf'],
      },
    ],
    method: {
      title: 'Comment fonctionnent nos cours de français des affaires',
      sub: 'Des séances ciblées, qui trouvent leur place dans une semaine de travail.',
      items: [
        { title: 'Une analyse de vos besoins', desc: 'Pendant votre démo gratuite, nous évaluons votre niveau et listons les situations pour lesquelles vous avez besoin du français.' },
        { title: 'Le vocabulaire de votre secteur', desc: 'Finance, technologie, santé, vente, hôtellerie : les mots et expressions de votre domaine, en contexte.' },
        { title: 'Vos vrais supports', desc: 'Vos courriels, vos diapositives et vos réunions deviennent des exercices, corrigés par un professeur natif.' },
        { title: 'Des progrès mesurables', desc: 'Des points réguliers sur votre niveau et un suivi clair de votre progression sur la plateforme.' },
      ],
    },
    quote: 2,
    faqTitle: 'Français des affaires : vos questions',
    faq: [
      { q: 'Faut-il un certain niveau pour commencer ?', a: 'Non. Les débutants apprennent l’essentiel de la vie professionnelle dès les premiers cours, et les plus avancés travaillent la précision, le ton et l’aisance.' },
      { q: 'Des collègues peuvent-ils apprendre ensemble ?', a: 'Oui. De petits groupes de collègues peuvent apprendre ensemble, avec un programme construit autour des besoins de votre entreprise. Réservez une démo ou écrivez-nous pour en parler.' },
      { q: 'Les cours peuvent-ils s’adapter à mes horaires de travail ?', a: 'Oui. Les cours sont planifiés quand vous êtes disponible, y compris tôt le matin, à midi ou le soir, selon votre fuseau horaire.' },
      { q: 'Pouvez-vous aussi me préparer à une certification ?', a: 'Oui. Nous préparons le TEF, le TCF, le DELF et le DALF, et pouvons combiner l’entraînement à l’examen avec vos cours de français des affaires.' },
    ],
    related: ['online', 'tef-canada', 'delf-dalf'],
    level: 'A1 à C2',
  },

  kids: {
    meta: {
      title: 'Cours de français en ligne pour enfants de 6 à 16 ans',
      description: 'Cours de français en ligne pour enfants et ados de 6 à 16 ans, avec des professeurs natifs : histoires, jeux, conversation et soutien scolaire.',
    },
    name: 'Français pour enfants',
    card: 'Des cours vivants pour les enfants et les ados de 6 à 16 ans.',
    eyebrow: 'De 6 à 16 ans · Cours en direct en ligne',
    h1: ['Cours de français en ligne pour enfants, avec des', 'professeurs natifs'],
    intro: 'Des cours de français vivants, en direct, pour les enfants et les adolescents de 6 à 16 ans, donnés en ligne par des professeurs natifs. Histoires, jeux et conversation pour les plus jeunes, soutien scolaire et préparation aux examens pour les ados, à un rythme adapté à chaque enfant.',
    highlights: ['Histoires, jeux et activités adaptées à l’âge', 'En individuel ou en petit groupe d’enfants du même âge', 'Une progression à suivre sur la plateforme'],
    ctaSecondary: 'Voir les tranches d’âge',
    facts: [
      ['Âge', '6 à 16 ans'],
      ['Format', 'Cours en visio en direct, individuels ou en petit groupe'],
      ['Professeurs', 'Francophones natifs certifiés'],
      ['Niveaux', 'Dès le grand débutant'],
      ['Première étape', 'Une démo gratuite pour rencontrer le professeur'],
    ],
    tables: [
      {
        id: 'ages', eyebrow: 'Tranches d’âge', title: 'Des cours qui grandissent avec votre enfant',
        sub: 'Les activités et les objectifs évoluent avec l’âge : chaque enfant apprend de la manière qui lui convient.',
        cols: ['Âge', 'Comment il apprend', 'Objectifs'],
        rows: [
          ['6 à 9 ans', 'Histoires, jeux, images et activités courtes', 'Les sons, les premiers mots, des phrases simples et la confiance'],
          ['10 à 12 ans', 'Jeux, projets et conversation guidée', 'Lire, écrire de courts textes et parler de son univers'],
          ['13 à 16 ans', 'Discussions, projets et exercices type examen', 'Soutien scolaire, aisance à l’oral et, s’il le souhaite, un diplôme DELF'],
        ],
      },
    ],
    guide: [
      {
        title: 'Pourquoi commencer le français jeune',
        paragraphs: [
          'Les enfants assimilent facilement les sons et les accents, et apprendre tôt une deuxième langue développe l’écoute et la confiance. Le français est parlé sur les cinq continents et c’est une langue officielle du Canada : une langue précieuse pour l’école, puis pour le travail.',
        ],
      },
      {
        title: 'Des cours en ligne simples et sûrs',
        paragraphs: [
          'Les cours ont lieu sur notre plateforme, avec le professeur et les enfants uniquement. Les parents réservent et suivent les cours, et les enfants se connectent en un clic depuis un ordinateur ou une tablette.',
        ],
      },
      {
        title: 'Un diplôme pour les adolescents',
        paragraphs: [
          'Les adolescents qui veulent une certification officielle peuvent préparer le DELF, un diplôme du ministère français de l’Éducation valable à vie et utile pour les candidatures scolaires et universitaires.',
        ],
        links: ['delf-dalf'],
      },
    ],
    method: {
      title: 'Comment fonctionnent nos cours pour enfants',
      sub: 'Les enfants apprennent mieux quand ils sont actifs : chaque séance est vivante et variée.',
      items: [
        { title: 'Rencontrer le professeur d’abord', desc: 'Une démo gratuite permet à votre enfant de rencontrer un professeur natif, et à nous d’évaluer son niveau.' },
        { title: 'Des cours actifs et ludiques', desc: 'Jeux, histoires et conversation font parler les enfants pendant la plus grande partie du cours.' },
        { title: 'Le bon groupe', desc: 'En individuel, ou en petit groupe d’enfants d’âge et de niveau proches.' },
        { title: 'Une progression à suivre', desc: 'Les quiz et les résultats sur la plateforme montrent ce que votre enfant a appris.' },
      ],
    },
    faqTitle: 'Français pour enfants : vos questions',
    faq: [
      { q: 'À partir de quel âge mon enfant peut-il commencer ?', a: 'Dès 6 ans. Les cours des plus jeunes reposent sur les histoires et les jeux, avec des activités qui changent souvent pour garder leur attention.' },
      { q: 'Mon enfant est grand débutant. Est-ce un problème ?', a: 'Pas du tout. Nous partons des premiers mots et avançons au rythme de votre enfant.' },
      { q: 'Pouvez-vous aider pour le français à l’école ?', a: 'Oui. Pour les enfants scolarisés et les adolescents, les cours peuvent suivre le programme scolaire, avec de l’aide aux devoirs et des exercices type examen.' },
      { q: 'Comment se passent les cours en ligne pour un enfant ?', a: 'Votre enfant rejoint un cours en visio en direct sur notre plateforme, depuis un ordinateur ou une tablette. Le professeur utilise des images, des jeux et des activités partagées pour garder le cours interactif.' },
    ],
    related: ['online', 'delf-dalf', 'business'],
    level: 'A1 à B2',
  },
};

export const TOPICS: Record<Lang, Record<TopicId, TopicCopy>> = { en, fr };
