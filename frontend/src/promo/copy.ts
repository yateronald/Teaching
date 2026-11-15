// The words of the campaigns' interface on the public site, in both languages.
// (What a campaign itself says is written by the administrator.)
import type { Kind, Lang } from './model';

interface Copy {
  kinds: Record<Kind, string>;
  /** Default button label of each kind, when the administrator gave none. */
  cta: Record<Kind, string>;
  ctaFull: string;
  details: string;
  seeAll: (n: number) => string;
  allOffers: string;
  close: string;
  notNow: string;
  starts: string;
  dates: string;
  schedule: string;
  level: string;
  teacher: string;
  weeks: (n: number) => string;
  seatsLeft: (n: number) => string;
  seatsOf: (left: number, limit: number) => string;
  /** The size of the group, while many seats are still free. */
  groupOf: (limit: number) => string;
  full: string;
  endsIn: string;
  lastDay: string;
  unit: { d: string; h: string; m: string; s: string };
  save: (pct: number) => string;
  insteadOf: string;
  registered: string;

  home: { eyebrow: string; title: string; sub: string };
  learn: { eyebrowOne: string; eyebrowMany: string; liked: string; likedMany: (n: number) => string; flashTitle: string };

  form: {
    title: string; titleWait: string; sub: string; subWait: string;
    name: string; email: string; phone: string; phoneHint: string; country: string; level: string; levelPick: string;
    levels: string[];
    message: string; messageHint: string; optional: string;
    submit: string; submitWait: string; sending: string;
    consent: string; error: string; nameError: string; emailError: string;
  };
  done: {
    title: string; titleWait: string; titleAlready: string;
    text: (title: string) => string; textWait: (title: string) => string; textAlready: string;
    next: string; steps: string[];
    freeCourses: string; back: string;
  };

  page: {
    metaTitle: string; metaDescription: string;
    eyebrow: string; title: string; sub: string;
    loading: string;
    emptyTitle: string; emptyText: string; emptyDemo: string; emptyLearn: string;
    gone: string;
    whyTitle: string; why: [string, string][];
    crumbHome: string; crumb: string;
  };
}

export const COPY: Record<Lang, Copy> = {
  en: {
    kinds: { group_class: 'Group class', offer: 'Special offer', event: 'Free event', announcement: 'News' },
    cta: { group_class: 'Reserve my seat', offer: 'Get this offer', event: 'Save my spot', announcement: 'Learn more' },
    ctaFull: 'Join the waiting list',
    details: 'See the details',
    seeAll: n => `See the ${n} current offers`,
    allOffers: 'All current offers',
    close: 'Close',
    notNow: 'Not now',
    starts: 'Starts',
    dates: 'Dates',
    schedule: 'Schedule',
    level: 'Level',
    teacher: 'Teacher',
    weeks: n => `${n} weeks`,
    seatsLeft: n => (n === 1 ? 'Last seat' : `${n} seats left`),
    seatsOf: (left, limit) => (left === 1 ? 'Last seat left' : `${left} of ${limit} seats left`),
    groupOf: limit => (limit <= 15 ? `Small group · ${limit} seats max` : `Limited to ${limit} seats`),
    full: 'Group full: waiting list open',
    endsIn: 'Registration closes in',
    lastDay: 'Last day to register',
    unit: { d: 'd', h: 'h', m: 'min', s: 's' },
    save: pct => `Save ${pct} %`,
    insteadOf: 'instead of',
    registered: 'You are registered',

    home: {
      eyebrow: 'Happening now',
      title: 'Upcoming groups and current offers',
      sub: 'Small groups with a native teacher, with a start date and a limited number of seats. Reserve yours in one minute: nothing is charged when you register.',
    },
    learn: {
      eyebrowOne: 'Go further with a teacher',
      eyebrowMany: 'Go further with a teacher',
      liked: 'Enjoying this course? Learn it live, with a native teacher.',
      likedMany: n => `Enjoying this course? ${n} groups and offers are open right now.`,
      flashTitle: 'Enjoying the free courses?',
    },

    form: {
      title: 'Reserve your seat', titleWait: 'Join the waiting list',
      sub: 'One minute. Our team confirms your seat by email within one working day. Nothing is charged now.',
      subWait: 'The group is full. Leave your details: we write to you as soon as a seat opens or a new group starts.',
      name: 'Full name', email: 'Email', phone: 'Phone or WhatsApp', phoneHint: 'With the country code, e.g. +1 514 555 0100',
      country: 'Country', level: 'Your French today', levelPick: 'Choose…',
      levels: ['Complete beginner', 'A1 (a few words)', 'A2 (simple conversations)', 'B1 (I get by)', 'B2 (comfortable)', 'C1 or above', 'I don’t know'],
      message: 'Anything we should know?', messageHint: 'Your goal, your exam date, your availability…', optional: 'optional',
      submit: 'Confirm my registration', submitWait: 'Add me to the waiting list', sending: 'Sending…',
      consent: 'We only use these details to contact you about this registration.',
      error: 'Your registration could not be sent. Check your connection and try again.',
      nameError: 'Enter your name.', emailError: 'Enter a valid email address.',
    },
    done: {
      title: 'You are registered!', titleWait: 'You are on the waiting list', titleAlready: 'You are already registered',
      text: title => `Your registration for “${title}” is with our team.`,
      textWait: title => `“${title}” is full for now. We will write to you as soon as a seat opens or a new group starts.`,
      textAlready: 'We already have your registration for this offer. Our team will contact you by email.',
      next: 'What happens next',
      steps: ['A confirmation email is on its way to you.', 'A member of our team contacts you within one working day.', 'You confirm your seat and receive your access to the class.'],
      freeCourses: 'Continue with the free courses', back: 'Back to the site',
    },

    page: {
      metaTitle: 'Current Offers and Upcoming French Groups | Learn French with Natives',
      metaDescription: 'Upcoming small-group French classes, exam preparation groups for the TCF and TEF Canada, free events and current offers. Reserve your seat online in one minute.',
      eyebrow: 'Offers and upcoming groups',
      title: 'Join a group that starts soon.',
      sub: 'Small groups led by native teachers, exam preparation with a start date, free events and limited-time offers. Reserve your seat in one minute: our team confirms it by email.',
      loading: 'Loading the current offers…',
      emptyTitle: 'No group is open for registration right now',
      emptyText: 'New groups open every month. Book a free demo class and we will tell you about the next start dates, or begin today with the free courses.',
      emptyDemo: 'Book a free demo class', emptyLearn: 'Explore the free courses',
      gone: 'The offer you were looking for has ended. Here is what is open right now.',
      whyTitle: 'Why join a group?',
      why: [
        ['A native teacher, live', 'Every class is taught live by a qualified native teacher who corrects you as you speak.'],
        ['Small groups', 'A handful of learners at your level: you speak in every class.'],
        ['A clear goal and an end date', 'A programme with a start, an end and a result to reach, so you keep going.'],
        ['The platform included', 'Recordings, exercises and exam simulations between classes.'],
      ],
      crumbHome: 'Home', crumb: 'Offers',
    },
  },
  fr: {
    kinds: { group_class: 'Cours en groupe', offer: 'Offre spéciale', event: 'Événement gratuit', announcement: 'Actualité' },
    cta: { group_class: 'Réserver ma place', offer: 'Profiter de l’offre', event: 'Réserver ma place', announcement: 'En savoir plus' },
    ctaFull: 'Rejoindre la liste d’attente',
    details: 'Voir les détails',
    seeAll: n => `Voir les ${n} offres en cours`,
    allOffers: 'Toutes les offres en cours',
    close: 'Fermer',
    notNow: 'Plus tard',
    starts: 'Début',
    dates: 'Dates',
    schedule: 'Horaires',
    level: 'Niveau',
    teacher: 'Enseignant',
    weeks: n => `${n} semaines`,
    seatsLeft: n => (n === 1 ? 'Dernière place' : `${n} places restantes`),
    seatsOf: (left, limit) => (left === 1 ? 'Dernière place disponible' : `${left} places restantes sur ${limit}`),
    groupOf: limit => (limit <= 15 ? `Petit groupe · ${limit} places max` : `Limité à ${limit} places`),
    full: 'Groupe complet : liste d’attente ouverte',
    endsIn: 'Fin des inscriptions dans',
    lastDay: 'Dernier jour pour s’inscrire',
    unit: { d: 'j', h: 'h', m: 'min', s: 's' },
    save: pct => `Économisez ${pct} %`,
    insteadOf: 'au lieu de',
    registered: 'Vous êtes inscrit',

    home: {
      eyebrow: 'En ce moment',
      title: 'Prochains groupes et offres en cours',
      sub: 'De petits groupes avec un professeur natif, une date de début et un nombre de places limité. Réservez la vôtre en une minute : rien n’est facturé à l’inscription.',
    },
    learn: {
      eyebrowOne: 'Allez plus loin avec un professeur',
      eyebrowMany: 'Allez plus loin avec un professeur',
      liked: 'Ce cours vous plaît ? Suivez-le en direct, avec un professeur natif.',
      likedMany: n => `Ce cours vous plaît ? ${n} groupes et offres sont ouverts en ce moment.`,
      flashTitle: 'Les cours gratuits vous plaisent ?',
    },

    form: {
      title: 'Réservez votre place', titleWait: 'Rejoignez la liste d’attente',
      sub: 'Une minute suffit. Notre équipe confirme votre place par e-mail sous un jour ouvré. Rien n’est facturé maintenant.',
      subWait: 'Le groupe est complet. Laissez vos coordonnées : nous vous écrivons dès qu’une place se libère ou qu’un nouveau groupe démarre.',
      name: 'Nom complet', email: 'E-mail', phone: 'Téléphone ou WhatsApp', phoneHint: 'Avec l’indicatif du pays, par ex. +1 514 555 0100',
      country: 'Pays', level: 'Votre français aujourd’hui', levelPick: 'Choisir…',
      levels: ['Grand débutant', 'A1 (quelques mots)', 'A2 (conversations simples)', 'B1 (je me débrouille)', 'B2 (à l’aise)', 'C1 ou plus', 'Je ne sais pas'],
      message: 'Quelque chose à nous préciser ?', messageHint: 'Votre objectif, la date de votre examen, vos disponibilités…', optional: 'facultatif',
      submit: 'Confirmer mon inscription', submitWait: 'M’ajouter à la liste d’attente', sending: 'Envoi…',
      consent: 'Ces informations servent uniquement à vous contacter au sujet de cette inscription.',
      error: 'Votre inscription n’a pas pu être envoyée. Vérifiez votre connexion et réessayez.',
      nameError: 'Indiquez votre nom.', emailError: 'Indiquez une adresse e-mail valide.',
    },
    done: {
      title: 'Vous êtes inscrit !', titleWait: 'Vous êtes sur la liste d’attente', titleAlready: 'Vous êtes déjà inscrit',
      text: title => `Votre inscription à « ${title} » est entre les mains de notre équipe.`,
      textWait: title => `« ${title} » est complet pour le moment. Nous vous écrirons dès qu’une place se libère ou qu’un nouveau groupe démarre.`,
      textAlready: 'Nous avons déjà votre inscription à cette offre. Notre équipe vous contactera par e-mail.',
      next: 'La suite',
      steps: ['Un e-mail de confirmation vient de vous être envoyé.', 'Un membre de notre équipe vous contacte sous un jour ouvré.', 'Vous confirmez votre place et recevez votre accès au cours.'],
      freeCourses: 'Continuer avec les cours gratuits', back: 'Retour au site',
    },

    page: {
      metaTitle: 'Offres en cours et prochains groupes de français | Learn French with Natives',
      metaDescription: 'Prochains cours de français en petit groupe, groupes de préparation au TCF et au TEF Canada, événements gratuits et offres du moment. Réservez votre place en ligne en une minute.',
      eyebrow: 'Offres et prochains groupes',
      title: 'Rejoignez un groupe qui démarre bientôt.',
      sub: 'De petits groupes animés par des professeurs natifs, des préparations aux examens avec une date de début, des événements gratuits et des offres limitées dans le temps. Réservez votre place en une minute : notre équipe la confirme par e-mail.',
      loading: 'Chargement des offres en cours…',
      emptyTitle: 'Aucun groupe n’est ouvert aux inscriptions pour le moment',
      emptyText: 'De nouveaux groupes ouvrent chaque mois. Réservez un cours d’essai gratuit et nous vous indiquerons les prochaines dates, ou commencez dès aujourd’hui avec les cours gratuits.',
      emptyDemo: 'Réserver un cours d’essai gratuit', emptyLearn: 'Découvrir les cours gratuits',
      gone: 'L’offre que vous cherchiez est terminée. Voici ce qui est ouvert en ce moment.',
      whyTitle: 'Pourquoi rejoindre un groupe ?',
      why: [
        ['Un professeur natif, en direct', 'Chaque cours est donné en direct par un professeur natif qualifié, qui vous corrige pendant que vous parlez.'],
        ['De petits groupes', 'Quelques apprenants de votre niveau : vous parlez à chaque cours.'],
        ['Un objectif clair et une date de fin', 'Un programme avec un début, une fin et un résultat à atteindre, pour tenir dans la durée.'],
        ['La plateforme incluse', 'Enregistrements, exercices et simulations d’examen entre les cours.'],
      ],
      crumbHome: 'Accueil', crumb: 'Offres',
    },
  },
};
