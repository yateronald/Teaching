// Published prices supplied by the school. Each currency has its own fixed
// amount; changing the display currency does not perform an exchange conversion.
import type { Lang } from './landingContent';

export const PRICING_CURRENCIES = ['EUR', 'CAD', 'USD', 'CFA'] as const;
export type PricingCurrency = typeof PRICING_CURRENCIES[number];
export const CURRENCY_LABELS: Record<PricingCurrency, string> = {
  EUR: 'EUR · €', CAD: 'CAD · $CA', USD: 'USD · $US', CFA: 'XOF / XAF · F CFA',
};

export const EXAM_PLANS = [
  { id: 'sprint', name: 'Sprint', days: 7, written: 6, oral: 6, prices: { EUR: 9.99, CAD: 14.99, USD: 10.99, CFA: 6500 } },
  { id: 'intensive', name: 'Intensive', days: 30, written: 28, oral: 28, prices: { EUR: 24.99, CAD: 34.99, USD: 26.99, CFA: 16500 } },
  { id: 'mastery', name: 'Mastery', days: 90, written: 56, oral: 56, prices: { EUR: 59.99, CAD: 84.99, USD: 64.99, CFA: 39500 } },
] as const;

export function formatPlanPrice(amount: number, currency: PricingCurrency, lang: Lang) {
  const number = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
    minimumFractionDigits: currency === 'CFA' ? 0 : 2,
    maximumFractionDigits: currency === 'CFA' ? 0 : 2,
  }).format(amount).replace(/\u202f/g, '\u00a0');
  if (lang === 'fr') return `${number}\u00a0${{ EUR: '€', CAD: '$CA', USD: '$US', CFA: 'F CFA' }[currency]}`;
  return `${{ EUR: '€', CAD: 'CA$', USD: 'US$', CFA: 'F CFA ' }[currency]}${number}`;
}

export const PRICING_COPY = {
  fr: {
    eyebrow: 'Tarifs · Préparation aux examens',
    title: 'Votre préparation aux quatre épreuves.',
    sub: 'Chaque forfait donne accès aux tests de compréhension écrite et orale, ainsi qu’à des crédits pour pratiquer l’expression écrite et orale avec l’IA. Choisissez la durée adaptée à votre examen.',
    currency: 'Devise d’affichage', duration: 'jours d’accès', credits: 'Crédits IA inclus',
    written: 'crédits d’expression écrite', oral: 'crédits d’expression orale', cta: 'Demander cette offre',
    tests: 'Tests de compréhension', included: 'Tests inclus', interactive: 'Expression · Pratique interactive', creditUnit: 'crédits IA',
    includedShort: 'Inclus', sequences: '(plusieurs séquences)', expand: 'Voir les détails', collapse: 'Masquer les détails',
    reading: 'Compréhension écrite', listening: 'Compréhension orale', writing: 'Expression écrite', speaking: 'Expression orale',
    readingDetail: 'Tests de lecture avec questions et corrections.',
    listeningDetail: 'Tests audio pour travailler l’écoute et vérifier votre compréhension.',
    writingDetail: 'Rédigez vos réponses et recevez une correction IA détaillée.',
    speakingDetail: 'Entraînez-vous avec un examinateur IA interactif et recevez un bilan.',
    descriptions: ['Pour une dernière semaine de préparation ciblée.', 'Pour installer une routine de pratique sur un mois.', 'Pour préparer votre examen avec plus de temps.'],
    compare: 'Voir les tarifs dans toutes les devises', offer: 'Offre',
    creditNote: 'Les tests de compréhension écrite et orale sont inclus dans chaque forfait. Les crédits IA indiqués sont réservés aux entraînements interactifs d’expression écrite et orale, avec correction ou bilan personnalisé.',
    note: 'Ces forfaits concernent la préparation autonome. Pour des cours en direct avec un professeur, réservez une démo et recevez un programme personnalisé.',
    teacherCta: 'Découvrir les cours en direct',
    demoTitle: 'Testez avant d’acheter.',
    demoText: 'Contactez les administrateurs pour obtenir un accès de démonstration aux simulations, notamment en expression écrite et orale. Ils vous fourniront les accès au système, sans achat préalable.',
    demoCta: 'Contacter les administrateurs',
    demoRequestLabel: 'Demande d’accès démo — simulations d’expression écrite et orale, avant achat',
    imageAlt: 'Illustration d’une apprenante préparant son examen avec un cahier, un ordinateur et un casque audio.',
  },
  en: {
    eyebrow: 'Pricing · Exam preparation',
    title: 'Your preparation for all four papers.',
    sub: 'Every plan includes reading and listening practice tests, plus credits for interactive writing and speaking practice with AI. Choose the duration that fits your exam timeline.',
    currency: 'Display currency', duration: 'days of access', credits: 'AI credits included',
    written: 'writing credits', oral: 'speaking credits', cta: 'Request this plan',
    tests: 'Comprehension practice tests', included: 'Tests included', interactive: 'Expression · Interactive practice', creditUnit: 'AI credits',
    includedShort: 'Included', sequences: '(multiple practice sets)', expand: 'View details', collapse: 'Hide details',
    reading: 'Reading comprehension', listening: 'Listening comprehension', writing: 'Written expression', speaking: 'Spoken expression',
    readingDetail: 'Reading tests with questions and corrections.',
    listeningDetail: 'Audio tests to practise listening and check your understanding.',
    writingDetail: 'Write your responses and receive detailed AI corrections.',
    speakingDetail: 'Practise with an interactive AI examiner and receive feedback.',
    descriptions: ['For a final week of focused preparation.', 'For building a regular practice routine over a month.', 'For preparing for your exam with more time.'],
    compare: 'View prices in all currencies', offer: 'Plan',
    creditNote: 'Reading and listening practice tests are included in every plan. The AI credits shown apply to interactive writing and speaking practice, with corrections or personalised feedback.',
    note: 'These plans cover independent preparation. For live classes with a teacher, book a demo and receive a personal study plan.',
    teacherCta: 'Explore live classes',
    demoTitle: 'Try before you buy.',
    demoText: 'Contact the administrators to request demo access to the simulations, particularly writing and speaking. They will provide access to the system, with no purchase required beforehand.',
    demoCta: 'Contact the administrators',
    demoRequestLabel: 'Demo access request — writing and speaking simulations, before purchase',
    imageAlt: 'Illustration of a learner preparing for an exam with a notebook, laptop and headphones.',
  },
};
