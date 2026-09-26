/* Email-first sign-in: what each kind of space says before the password.
   The server only ever tells the page a kind of space (and, for company
   accounts, the company's public name and logo) — see backend
   services/signInHints.js. Unknown emails and administrators both get the
   neutral "platform" welcome. */

export type Audience = 'platform' | 'exam' | 'student' | 'teacher' | 'company_learner' | 'company_manager';
export const AUDIENCES: Audience[] = ['platform', 'exam', 'student', 'teacher', 'company_learner', 'company_manager'];

/** A company's public branding (also served for its own sign-in page, /o/<slug>). */
export interface CompanyBrand { name: string; slug: string; logo_url: string | null; default_language: 'fr' | 'en' }
export interface Presentation { audience: Audience; company?: CompanyBrand | null }

type Tr = (en: string, fr: string) => string;

export interface Welcome {
  /** Small line above the title. */
  eyebrow: string;
  title: string;
  sub: string;
  /** Left panel. */
  side: { eyebrow: string; title: string; chips: string[]; stats: boolean };
}

const skills = (tr: Tr) => [tr('Reading', 'Compréhension écrite'), tr('Listening', 'Compréhension orale'), tr('Writing', 'Expression écrite'), tr('Speaking', 'Expression orale')];

/** The welcome of the password step, for one audience. */
export function welcomeFor(p: Presentation, tr: Tr): Welcome {
  const name = p.company?.name || '';
  switch (p.audience) {
    case 'company_manager':
      return {
        eyebrow: tr(`${name} · Company space`, `${name} · Espace entreprise`),
        title: tr('Welcome back', 'Bon retour'),
        sub: tr(`Manage ${name}’s learners, their exams and their credits.`, `Gérez les apprenants de ${name}, leurs examens et leurs crédits.`),
        side: {
          eyebrow: tr('Company space', 'Espace entreprise'),
          title: tr(`Guide ${name}’s team to their French exam`, `Accompagnez l’équipe de ${name} vers son examen de français`),
          chips: [tr('Learners', 'Apprenants'), tr('Groups', 'Groupes'), tr('Assignments', 'Attributions'), tr('Credits', 'Crédits')],
          stats: false,
        },
      };
    case 'company_learner':
      return {
        eyebrow: name,
        title: tr('Welcome back', 'Bon retour'),
        sub: tr(`Prepare for your exam with ${name}: practice tests, corrections and your results in one place.`,
          `Préparez votre examen avec ${name} : examens blancs, corrections et résultats au même endroit.`),
        side: {
          eyebrow: tr('Exam preparation', 'Préparation aux examens'),
          title: tr(`Prepare for the TCF with ${name}`, `Préparez le TCF avec ${name}`),
          chips: skills(tr),
          stats: false,
        },
      };
    case 'exam':
      return {
        eyebrow: tr('Exam preparation', 'Préparation aux examens'),
        title: tr('Welcome back', 'Bon retour'),
        sub: tr('Pick up your preparation where you left it: practice tests, AI corrections and your results.',
          'Reprenez votre préparation là où vous l’avez laissée : examens blancs, corrections par l’IA et résultats.'),
        side: {
          eyebrow: tr('Exam preparation', 'Préparation aux examens'),
          title: tr('Train in real exam conditions, corrected by AI', 'Entraînez-vous en conditions réelles, corrigé par l’IA'),
          chips: skills(tr),
          stats: false,
        },
      };
    case 'student':
      return {
        eyebrow: tr('Student space', 'Espace étudiant'),
        title: tr('Welcome back', 'Bon retour'),
        sub: tr('Your classes, homework and progress are waiting for you.', 'Vos cours, vos devoirs et votre progression vous attendent.'),
        side: {
          eyebrow: tr('Official preparation', 'Préparation officielle'),
          title: tr('Join 1,000+ students who trusted us', 'Rejoignez plus de 1 000 étudiants qui nous ont fait confiance'),
          chips: ['TEF Canada', 'DELF', 'DALF', 'TCF', 'TEFAQ'],
          stats: true,
        },
      };
    case 'teacher':
      return {
        eyebrow: tr('Teacher space', 'Espace enseignant'),
        title: tr('Welcome back', 'Bon retour'),
        sub: tr('Your classes, your students and their work to correct are one step away.',
          'Vos cours, vos élèves et leurs travaux à corriger sont à portée de main.'),
        side: {
          eyebrow: tr('Teacher space', 'Espace enseignant'),
          title: tr('Every lesson you give brings a learner closer to their goal', 'Chaque cours que vous donnez rapproche un apprenant de son objectif'),
          chips: [tr('Live classes', 'Cours en direct'), tr('Homework', 'Devoirs'), tr('Corrections', 'Corrections'), tr('Attendance', 'Présences')],
          stats: false,
        },
      };
    default:
      return {
        eyebrow: 'Learn French with Natives',
        title: tr('Welcome back', 'Bon retour'),
        sub: tr('Enter your password to continue.', 'Saisissez votre mot de passe pour continuer.'),
        side: {
          eyebrow: tr('Official preparation', 'Préparation officielle'),
          title: tr('Join 1,000+ students who trusted us', 'Rejoignez plus de 1 000 étudiants qui nous ont fait confiance'),
          chips: ['TEF Canada', 'DELF', 'DALF', 'TCF', 'TEFAQ'],
          stats: true,
        },
      };
  }
}

/** The first step (email), before the space is known. */
export function emailStepFor(company: CompanyBrand | null, tr: Tr) {
  return company
    ? { eyebrow: company.name, title: tr('Sign in', 'Connexion'), sub: tr(`Sign in to ${company.name}’s exam preparation space.`, `Connectez-vous à l’espace de préparation de ${company.name}.`) }
    : { eyebrow: 'Learn French with Natives', title: tr('Sign in', 'Connexion'), sub: tr('Enter your email: we will take you to your space.', 'Saisissez votre email : nous vous conduisons à votre espace.') };
}

/** Only a well-formed answer is trusted; anything else reads as the neutral welcome. */
export function readPresentation(data: unknown): Presentation {
  const d = (data && typeof data === 'object' ? data : {}) as { audience?: unknown; company?: Partial<CompanyBrand> | null };
  const audience = AUDIENCES.includes(d.audience as Audience) ? (d.audience as Audience) : 'platform';
  const c = d.company;
  const company = c && typeof c.name === 'string' && typeof c.slug === 'string'
    ? { name: c.name, slug: c.slug, logo_url: typeof c.logo_url === 'string' && c.logo_url.startsWith('/api/public/org/') ? c.logo_url : null, default_language: c.default_language === 'en' ? 'en' as const : 'fr' as const }
    : null;
  if ((audience === 'company_learner' || audience === 'company_manager') && !company) return { audience: 'platform' };
  return { audience, company };
}
