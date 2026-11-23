// The Privacy Policy and the Terms of Service, in English and French.
//
// Written from what the platform actually does (see the backend services
// named in the comments). When the platform changes how it handles personal
// information or what it sells, change these texts too, update UPDATED and,
// for the Terms, LEARN_TERMS_VERSION in backend/.env (stored with each
// account's consent).
//
// A text block is a paragraph (string) or a bulleted list (string[]).
// Links: [label](href). These texts should be reviewed by a lawyer (Québec).
import type { Lang } from '../components/Landing/landingContent';
import type { LegalKind } from './paths';

export type { LegalKind };
export type Block = string | string[];
export interface LegalSection { id: string; title: string; blocks: Block[] }
export interface LegalDoc { title: string; metaDescription: string; updated: string; intro: Block[]; sections: LegalSection[] }

const EMAIL = 'support@learnfrenchwithnatives.com';
const MAIL = `[${EMAIL}](mailto:${EMAIL})`;

/** Version of the Terms (the same value as LEARN_TERMS_VERSION, kept with each sign-up). */
export const TERMS_VERSION = '2026-11';

const privacyEn: LegalDoc = {
  title: 'Privacy Policy',
  metaDescription: 'How Learn French with Natives collects, uses, shares and protects your personal information, and how to exercise your rights.',
  updated: 'Last updated: November 23, 2026',
  intro: [
    'Learn French with Natives (“we”, “us”) is an online French school based in Québec, Canada. This policy explains what personal information we collect when you use learnfrenchwithnatives.com, our online courses, the student portal and our live classes, why we collect it, who receives it, how long we keep it, and the rights you have over it.',
    'We collect only what we need to teach you and to run the service. We do not sell your personal information, and we do not use advertising trackers.',
  ],
  sections: [
    {
      id: 'contact',
      title: '1. Who is responsible, and how to reach us',
      blocks: [
        `Our person in charge of the protection of personal information answers every question and request about your information. Write to ${MAIL} with the subject “Privacy”.`,
      ],
    },
    {
      id: 'collect',
      title: '2. What we collect and why',
      blocks: [
        'When you visit the website, we count visits to understand which pages help learners and to keep the site fast. For each page we record the page, its language, the site you came from (its domain only), campaign tags in the address (utm), your approximate country, the type of device, browser and operating system, the screen width, how fast the page loaded and how long it stayed open. We use no cookie for this and we never store your IP address: we keep a code made from it with a random value that changes every day and is deleted after two days, so a visit cannot be traced back to you afterwards. If your browser sends “Do Not Track” or “Global Privacy Control”, the visit is counted without any code.',
        'When you fill in a form (free demo class, a group or an offer), we receive what you type: your name, email, phone number if you give it, country, time zone, level, goals, preferred schedule and your message. We use it to answer you and organize the class.',
        'When you create a website account, we collect:',
        [
          'your first name (and last name if you add it), your email address, your country and the language of your emails;',
          'your password, which we store only in a protected (hashed) form that nobody can read, including us;',
          'the date and version of the Terms you accepted, and whether you agreed to receive our news by email;',
          'if you sign up or sign in with Google: your Google account identifier, name and email address. We never receive your Google password.',
        ],
        'When you use the online courses, we record which locked lessons your account opened and when (kept 180 days), to apply the access you paid for and to detect abuse such as mass copying. Your progress, scores and preferences in the courses are stored in your own browser, not on our servers; clearing your browser data erases them.',
        'To keep your account safe, we record the devices signed in to it (for example “Chrome on Windows”), the IP address and the dates of each sign-in, and failed sign-in attempts.',
        'When you pay for Premium, the payment is made on Paystack’s secure page. We never receive your card number, its security code or your mobile money PIN. We keep the offer, amount, currency, date, status and reference of the payment, the customer and payment-method type Paystack gives us (for example “card”), and the status of any subscription.',
        'If you are a student of our live classes or part of a company program, your account is created by us or by your company. We then also process your class enrolment, attendance, quiz and exam-practice answers (including written texts and voice recordings of speaking practice), results, notifications, the optional profile photo, and recordings of live classes.',
        'When you send us an email or ask for Premium from your account, we keep your message to answer it.',
      ],
    },
    {
      id: 'ai',
      title: '3. Automatic scoring with artificial intelligence',
      blocks: [
        'The exam simulator and some speaking and writing exercises use artificial intelligence services (Google Gemini and Google Cloud Vertex AI) to act as an examiner and to score your answers. Your answers (texts and voice recordings) are sent to Google for this processing only.',
        `These scores are produced automatically. They are practice estimates, not official exam results, and no other decision about you is made from them alone. You can ask that a member of our team review an automatic score by writing to ${MAIL}.`,
      ],
    },
    {
      id: 'cookies',
      title: '4. Cookies and browser storage',
      blocks: [
        [
          'One sign-in cookie for the website, needed for your account to work. It cannot be read by the page’s scripts and lasts up to 60 days, or until you sign out.',
          'Two short-lived cookies during “Continue with Google” (10 to 15 minutes), to protect the sign-in against forgery.',
          'The student portal keeps its sign-in in your browser’s storage until you sign out.',
          'Your progress, scores and preferences in the courses (for example showing translations) are kept in your browser’s storage.',
        ],
        'We use no advertising or social-network cookies. The printable mark sheet of the student portal loads a font from Google Fonts.',
      ],
    },
    {
      id: 'share',
      title: '5. Who receives your information',
      blocks: [
        'Only the people at Learn French with Natives who need it for their work (your teachers, our administrators) can see your information. We use these service providers, who process it on our behalf and only for the service they provide:',
        [
          'Paystack (payments): your email, the amount and the payment details you give on its page;',
          'Google: “Continue with Google” sign-in, and the artificial intelligence scoring described above;',
          'Brevo (email sending): your name and email address, to send account, class and, if you agreed, news emails;',
          'Infomaniak kDrive (file storage): course resources and profile photos;',
          'the providers of the servers on which our website, database, live-class video and class recordings run.',
        ],
        'Your company sees the progress and results of the program it pays for, if you are part of one. We may disclose information when the law requires it. We never sell or rent your personal information.',
      ],
    },
    {
      id: 'outside',
      title: '6. Information processed outside Québec',
      blocks: [
        'Some of these providers store or process information outside Québec: Google in the United States and other countries, Brevo in the European Union, Infomaniak in Switzerland and Paystack in Africa (it is headquartered in Nigeria). We choose providers that commit by contract to protect the information they process for us and to use it only for our service.',
      ],
    },
    {
      id: 'keep',
      title: '7. How long we keep it',
      blocks: [
        [
          'Your account: as long as it is open. When you close it, we delete or anonymize your information within 30 days, except what the law requires us to keep.',
          'Sign-ups never confirmed and one-time codes: deleted within two days of expiring.',
          'Signed-in devices: 60 days after the end of each session. Lessons opened: 180 days.',
          'Visit statistics: 180 days, without any identifier after two days.',
          'Live-class recordings: 30 days.',
          'Payment records: for the time tax and accounting laws require (generally six years).',
          'Messages from forms and emails: as long as needed to answer you and follow up, then deleted.',
        ],
      ],
    },
    {
      id: 'security',
      title: '8. How we protect it',
      blocks: [
        'All exchanges with our site are encrypted (HTTPS). Passwords and one-time codes are stored only in protected (hashed) form. Signed-in sessions can be ended at any time, access to administration tools is limited to the people who need it, and actions on accounts and access are logged.',
        'If a confidentiality incident creates a risk of serious injury, we inform the Commission d’accès à l’information du Québec and the people concerned, as the law requires, and we keep a register of incidents.',
      ],
    },
    {
      id: 'rights',
      title: '9. Your rights',
      blocks: [
        'You can, at any time:',
        [
          'ask whether we hold information about you, get a copy of it, and receive the information you gave us in a structured, commonly used format;',
          'have inaccurate or incomplete information corrected (you can change most of your details in My account);',
          'withdraw your consent, for example to our news emails (link at the bottom of each email, or in My account);',
          'ask us to close your account and delete your information, subject to what the law requires us to keep;',
          'ask that information about you stop being disseminated or be de-indexed when the law allows it.',
        ],
        `Write to ${MAIL}. We answer within 30 days, after checking your identity. If you are not satisfied with our answer, you can file a complaint with the Commission d’accès à l’information du Québec ([cai.gouv.qc.ca](https://www.cai.gouv.qc.ca)).`,
      ],
    },
    {
      id: 'children',
      title: '10. Children',
      blocks: [
        'You must be 16 or older to create a website account yourself. Younger learners take part through our kids’ classes, with a parent or guardian, who gives consent for them. If we learn that a child under 14 gave us information without a parent’s consent, we delete it.',
      ],
    },
    {
      id: 'changes',
      title: '11. Changes to this policy',
      blocks: [
        'We will update this policy when our practices change. The date at the top shows the latest version. If a change is important, we will tell account holders by email before it applies.',
      ],
    },
  ],
};

const privacyFr: LegalDoc = {
  title: 'Politique de confidentialité',
  metaDescription: 'Comment Learn French with Natives recueille, utilise, communique et protège vos renseignements personnels, et comment exercer vos droits.',
  updated: 'Dernière mise à jour : 23 novembre 2026',
  intro: [
    'Learn French with Natives (« nous ») est une école de français en ligne établie au Québec, Canada. Cette politique explique quels renseignements personnels nous recueillons lorsque vous utilisez learnfrenchwithnatives.com, nos cours en ligne, l’espace étudiant et nos cours en direct, pourquoi nous les recueillons, à qui nous les communiquons, combien de temps nous les conservons et quels droits vous avez sur eux.',
    'Nous recueillons seulement ce qui est nécessaire pour vous enseigner et faire fonctionner le service. Nous ne vendons pas vos renseignements personnels et n’utilisons aucun traceur publicitaire.',
  ],
  sections: [
    {
      id: 'contact',
      title: '1. Responsable et coordonnées',
      blocks: [
        `Notre responsable de la protection des renseignements personnels répond à toute question et demande concernant vos renseignements. Écrivez à ${MAIL} avec l’objet « Confidentialité ».`,
      ],
    },
    {
      id: 'collect',
      title: '2. Ce que nous recueillons et pourquoi',
      blocks: [
        'Lorsque vous visitez le site, nous comptons les visites pour savoir quelles pages aident les apprenants et garder le site rapide. Pour chaque page, nous enregistrons la page, sa langue, le site d’où vous venez (son domaine seulement), les étiquettes de campagne de l’adresse (utm), votre pays approximatif, le type d’appareil, de navigateur et de système d’exploitation, la largeur de l’écran, la vitesse de chargement et la durée d’affichage. Nous n’utilisons aucun témoin (cookie) pour cela et ne conservons jamais votre adresse IP : nous gardons un code calculé à partir d’elle avec une valeur aléatoire qui change chaque jour et est supprimée après deux jours, de sorte qu’une visite ne peut plus ensuite être reliée à vous. Si votre navigateur envoie « Do Not Track » ou « Global Privacy Control », la visite est comptée sans aucun code.',
        'Lorsque vous remplissez un formulaire (cours de démonstration gratuit, un groupe ou une offre), nous recevons ce que vous saisissez : nom, adresse courriel, téléphone si vous le donnez, pays, fuseau horaire, niveau, objectifs, horaire souhaité et votre message. Nous les utilisons pour vous répondre et organiser le cours.',
        'Lorsque vous créez un compte sur le site, nous recueillons :',
        [
          'votre prénom (et votre nom si vous l’ajoutez), votre adresse courriel, votre pays et la langue de vos courriels ;',
          'votre mot de passe, que nous conservons uniquement sous une forme protégée (hachée) que personne ne peut lire, pas même nous ;',
          'la date et la version des Conditions acceptées, et si vous acceptez de recevoir nos nouvelles par courriel ;',
          'si vous vous inscrivez ou vous connectez avec Google : l’identifiant de votre compte Google, votre nom et votre adresse courriel. Nous ne recevons jamais votre mot de passe Google.',
        ],
        'Lorsque vous utilisez les cours en ligne, nous enregistrons quelles leçons verrouillées votre compte a ouvertes et quand (conservé 180 jours), pour appliquer l’accès que vous avez payé et détecter les abus, comme la copie massive. Votre progression, vos scores et vos préférences dans les cours sont enregistrés dans votre propre navigateur, et non sur nos serveurs ; effacer les données de votre navigateur les efface.',
        'Pour protéger votre compte, nous enregistrons les appareils qui y sont connectés (par exemple « Chrome sur Windows »), l’adresse IP et les dates de chaque connexion, ainsi que les tentatives de connexion échouées.',
        'Lorsque vous payez Premium, le paiement se fait sur la page sécurisée de Paystack. Nous ne recevons jamais votre numéro de carte, son code de sécurité ni votre code mobile money. Nous conservons l’offre, le montant, la devise, la date, l’état et la référence du paiement, le type de client et de moyen de paiement que Paystack nous transmet (par exemple « carte ») et l’état d’un éventuel abonnement.',
        'Si vous êtes étudiant de nos cours en direct ou inscrit à un programme d’entreprise, votre compte est créé par nous ou par votre entreprise. Nous traitons alors aussi votre inscription aux cours, vos présences, vos réponses aux quiz et aux entraînements d’examen (y compris les textes écrits et les enregistrements vocaux de l’oral), vos résultats, vos notifications, la photo de profil facultative et les enregistrements des cours en direct.',
        'Lorsque vous nous écrivez ou demandez Premium depuis votre compte, nous conservons votre message pour y répondre.',
      ],
    },
    {
      id: 'ai',
      title: '3. Évaluation automatique par intelligence artificielle',
      blocks: [
        'Le simulateur d’examen et certains exercices d’oral et d’écrit utilisent des services d’intelligence artificielle (Google Gemini et Google Cloud Vertex AI) pour jouer le rôle d’examinateur et noter vos réponses. Vos réponses (textes et enregistrements vocaux) sont envoyées à Google uniquement pour ce traitement.',
        `Ces notes sont produites automatiquement. Ce sont des estimations d’entraînement, et non des résultats officiels d’examen, et aucune autre décision vous concernant n’est prise sur cette seule base. Vous pouvez demander qu’un membre de notre équipe révise une note automatique en écrivant à ${MAIL}.`,
      ],
    },
    {
      id: 'cookies',
      title: '4. Témoins (cookies) et stockage du navigateur',
      blocks: [
        [
          'Un témoin de connexion pour le site, nécessaire au fonctionnement de votre compte. Il ne peut pas être lu par les scripts de la page et dure au plus 60 jours, ou jusqu’à votre déconnexion.',
          'Deux témoins de courte durée pendant « Continuer avec Google » (10 à 15 minutes), pour protéger la connexion contre la falsification.',
          'L’espace étudiant conserve votre connexion dans le stockage de votre navigateur jusqu’à votre déconnexion.',
          'Votre progression, vos scores et vos préférences dans les cours (par exemple l’affichage des traductions) sont conservés dans le stockage de votre navigateur.',
        ],
        'Nous n’utilisons aucun témoin publicitaire ni de réseau social. Le relevé de notes imprimable de l’espace étudiant charge une police de caractères depuis Google Fonts.',
      ],
    },
    {
      id: 'share',
      title: '5. À qui vos renseignements sont communiqués',
      blocks: [
        'Seules les personnes de Learn French with Natives qui en ont besoin pour leur travail (vos professeurs, nos administrateurs) peuvent voir vos renseignements. Nous faisons appel à ces fournisseurs de services, qui les traitent pour notre compte et uniquement pour le service qu’ils rendent :',
        [
          'Paystack (paiements) : votre adresse courriel, le montant et les informations de paiement que vous saisissez sur sa page ;',
          'Google : la connexion « Continuer avec Google » et l’évaluation par intelligence artificielle décrite plus haut ;',
          'Brevo (envoi de courriels) : votre nom et votre adresse courriel, pour les courriels de compte, de cours et, si vous l’avez accepté, de nouvelles ;',
          'Infomaniak kDrive (stockage de fichiers) : ressources de cours et photos de profil ;',
          'les fournisseurs des serveurs qui hébergent notre site, notre base de données, la vidéo des cours en direct et leurs enregistrements.',
        ],
        'Si vous suivez un programme payé par votre entreprise, celle-ci voit votre progression et vos résultats dans ce programme. Nous pouvons communiquer des renseignements lorsque la loi l’exige. Nous ne vendons ni ne louons jamais vos renseignements personnels.',
      ],
    },
    {
      id: 'outside',
      title: '6. Renseignements traités hors du Québec',
      blocks: [
        'Certains de ces fournisseurs conservent ou traitent des renseignements hors du Québec : Google aux États-Unis et dans d’autres pays, Brevo dans l’Union européenne, Infomaniak en Suisse et Paystack en Afrique (son siège est au Nigeria). Nous choisissons des fournisseurs qui s’engagent par contrat à protéger les renseignements qu’ils traitent pour nous et à ne les utiliser que pour notre service.',
      ],
    },
    {
      id: 'keep',
      title: '7. Durée de conservation',
      blocks: [
        [
          'Votre compte : tant qu’il est ouvert. Lorsque vous le fermez, nous supprimons ou anonymisons vos renseignements dans les 30 jours, sauf ce que la loi nous oblige à conserver.',
          'Inscriptions jamais confirmées et codes à usage unique : supprimés dans les deux jours suivant leur expiration.',
          'Appareils connectés : 60 jours après la fin de chaque session. Leçons ouvertes : 180 jours.',
          'Statistiques de visite : 180 jours, sans aucun identifiant après deux jours.',
          'Enregistrements des cours en direct : 30 jours.',
          'Dossiers de paiement : la durée exigée par les lois fiscales et comptables (en général six ans).',
          'Messages des formulaires et courriels : le temps nécessaire pour vous répondre et assurer le suivi, puis supprimés.',
        ],
      ],
    },
    {
      id: 'security',
      title: '8. Protection',
      blocks: [
        'Tous les échanges avec notre site sont chiffrés (HTTPS). Les mots de passe et les codes à usage unique sont conservés uniquement sous forme protégée (hachée). Les sessions de connexion peuvent être fermées à tout moment, l’accès aux outils d’administration est limité aux personnes qui en ont besoin et les actions sur les comptes et les accès sont journalisées.',
        'Si un incident de confidentialité présente un risque de préjudice sérieux, nous en avisons la Commission d’accès à l’information du Québec et les personnes concernées, comme la loi l’exige, et nous tenons un registre des incidents.',
      ],
    },
    {
      id: 'rights',
      title: '9. Vos droits',
      blocks: [
        'Vous pouvez, à tout moment :',
        [
          'savoir si nous détenons des renseignements sur vous, en obtenir une copie et recevoir les renseignements que vous nous avez fournis dans un format structuré et couramment utilisé ;',
          'faire rectifier des renseignements inexacts ou incomplets (la plupart de vos informations se modifient dans Mon compte) ;',
          'retirer votre consentement, par exemple à nos courriels de nouvelles (lien au bas de chaque courriel, ou dans Mon compte) ;',
          'nous demander de fermer votre compte et de supprimer vos renseignements, sous réserve de ce que la loi nous oblige à conserver ;',
          'demander la cessation de la diffusion d’un renseignement ou sa désindexation lorsque la loi le permet.',
        ],
        `Écrivez à ${MAIL}. Nous répondons dans les 30 jours, après vérification de votre identité. Si notre réponse ne vous satisfait pas, vous pouvez porter plainte auprès de la Commission d’accès à l’information du Québec ([cai.gouv.qc.ca](https://www.cai.gouv.qc.ca)).`,
      ],
    },
    {
      id: 'children',
      title: '10. Enfants',
      blocks: [
        'Il faut avoir 16 ans ou plus pour créer soi-même un compte sur le site. Les plus jeunes participent à nos cours pour enfants, avec un parent ou tuteur, qui consent pour eux. Si nous apprenons qu’un enfant de moins de 14 ans nous a fourni des renseignements sans le consentement d’un parent, nous les supprimons.',
      ],
    },
    {
      id: 'changes',
      title: '11. Modifications de cette politique',
      blocks: [
        'Nous mettrons cette politique à jour lorsque nos pratiques changent. La date en haut de la page indique la version en vigueur. Si un changement est important, nous en avisons les titulaires de compte par courriel avant qu’il s’applique.',
      ],
    },
  ],
};

const termsEn: LegalDoc = {
  title: 'Terms of Service',
  metaDescription: 'The rules for using Learn French with Natives: accounts, free and Premium access, payments, renewals, refunds and your rights.',
  updated: `Last updated: November 23, 2026 (version ${TERMS_VERSION})`,
  intro: [
    'These Terms govern your use of learnfrenchwithnatives.com, its online courses, website accounts and Premium access, offered by Learn French with Natives (“we”, “us”), an online French school based in Québec, Canada. By creating an account or using the service, you accept these Terms and our [Privacy Policy](/privacy-policy/).',
    'Live classes, exam preparation programs and company programs are also covered by the quote or agreement you receive for them; where that document differs from these Terms, it prevails for that program.',
    'These Terms exist in French and in English. The French version is available here: [Conditions d’utilisation](/fr/conditions-d-utilisation/).',
  ],
  sections: [
    {
      id: 'accounts',
      title: '1. Your account',
      blocks: [
        [
          'You must be 16 or older to create a website account yourself.',
          'The information you give must be accurate. Each account is for one person, with one email address: do not share your account or your password.',
          'Keep your password safe and tell us at once if you think someone else used your account. An account can be signed in on a limited number of devices at the same time.',
          'Accounts of students and company programs are created by us or by the company; their access to the online courses is set by us or by that company.',
        ],
      ],
    },
    {
      id: 'access',
      title: '2. Free access and Premium',
      blocks: [
        [
          'Without an account, you can use the first module of the A1 path and the level test.',
          'With a free account, you can use the first module of every path.',
          'Premium gives access to every lesson of every path, the practice library, the games and the certificates of completion, for the period you paid for or that we granted.',
        ],
        'We regularly add and improve lessons. We may change which content is free, but never reduce what a Premium period already paid for includes while it lasts.',
      ],
    },
    {
      id: 'payment',
      title: '3. Prices and payment',
      blocks: [
        'Prices are shown in the currency of the offer before you pay, and the price shown is the total price you pay. Payment is made on the secure page of our payment provider, Paystack; we never receive your card or mobile money details.',
        'Premium starts as soon as the payment is confirmed. If you already have Premium, the new period starts when your current paid period ends.',
        [
          'One-time offers give Premium for the period shown and do not renew.',
          'Subscriptions renew automatically at the end of each period, at the price shown when you subscribed, until you stop the renewals in My account. Stop them before the next renewal date to avoid being charged again; Premium then stays active until the end of the period already paid.',
          'If a renewal payment fails, Premium ends at the end of the period already paid.',
          'If we change the price of a subscription, we tell you by email at least 30 days before it applies, and you can stop the renewals before then.',
        ],
      ],
    },
    {
      id: 'refunds',
      title: '4. Refunds',
      blocks: [
        'We refund your first purchase in full if you ask within 14 days of the payment and have opened fewer than five Premium lessons. Once a renewal period has started, it is not refunded, unless the law requires it.',
        `To ask for a refund, write to ${MAIL} with the email address of your account and the date of the payment. The refund is made to the payment method you used, through Paystack, and the Premium period it paid for ends.`,
        'If you dispute a payment with your bank or provider, the Premium period it paid for ends; if the dispute is settled in favour of the payment, we restore it.',
        'Nothing in these Terms limits the rights you have under Québec’s Consumer Protection Act. If that Act gives you the right to cancel your contract (for example at any time, for a contract of successive services), we will cancel it and refund you as the Act provides.',
      ],
    },
    {
      id: 'certificates',
      title: '5. Certificates, scores and exams',
      blocks: [
        'Certificates of completion are included in Premium. They show that you completed an online course; they are not an official language diploma.',
        'Scores from the exam simulator and from automatic exercises are practice estimates produced partly by artificial intelligence. They are not official results of the TCF, TEF, DELF, DALF or any other exam. We are not affiliated with the organizations that run these exams.',
      ],
    },
    {
      id: 'use',
      title: '6. Acceptable use',
      blocks: [
        'The service is for your personal learning. You agree not to:',
        [
          'copy, download, record, resell or publish our lessons, audio, images or exercises, except short extracts for your own revision;',
          'use robots, scripts or any automated means to access, copy or collect content;',
          'get around the access limits, the locks or the security of the service;',
          'share your account, or let several people use it;',
          'send unlawful, offensive or misleading content in forms, messages or exercises.',
        ],
        'If you do, we may suspend or close your account. If we close it for a serious breach, a Premium period already paid is not refunded, unless the law requires it.',
      ],
    },
    {
      id: 'content',
      title: '7. Our content and yours',
      blocks: [
        'The courses, texts, audio, images, exercises and software of the service belong to Learn French with Natives or to its licensors and are protected by copyright. We give you a personal, non-transferable right to use them for your learning while your access lasts.',
        'What you write or record in exercises remains yours. You allow us to use it to provide the service to you: to correct and score it, give you feedback and show you your history.',
      ],
    },
    {
      id: 'service',
      title: '8. Availability of the service',
      blocks: [
        'We work to keep the service available and secure, but it may be interrupted for maintenance or for reasons beyond our control. If a serious interruption prevents you from using Premium for a long time, contact us and we will extend your period accordingly.',
      ],
    },
    {
      id: 'closing',
      title: '9. Closing your account',
      blocks: [
        `You can stop using the service at any time and ask us to close your account by writing to ${MAIL}. A subscription is stopped when the account is closed. Refunds follow section 4.`,
      ],
    },
    {
      id: 'liability',
      title: '10. Liability',
      blocks: [
        'We provide the service with care. To the extent the law allows, we are not responsible for indirect losses, such as a missed exam result or lost opportunities, resulting from the use of the service. Nothing in these Terms excludes or limits a liability or a right that the law does not allow us to exclude or limit, including your rights as a consumer.',
      ],
    },
    {
      id: 'law',
      title: '11. Applicable law',
      blocks: [
        'These Terms are governed by the laws of Québec and the federal laws of Canada that apply there. Disputes are heard by the courts of Québec. If you are a consumer, nothing in these Terms takes away your right to bring a claim before the court of your place of residence or the protection given to you by the law of your country of residence.',
      ],
    },
    {
      id: 'changes',
      title: '12. Changes to these Terms',
      blocks: [
        'We may update these Terms. If a change is important, we tell account holders by email at least 30 days before it applies. If you do not accept the change, you can close your account before that date; the unused part of a Premium period that has not started yet is then refunded.',
      ],
    },
    {
      id: 'contact',
      title: '13. Contact',
      blocks: [`For any question about these Terms: ${MAIL}.`],
    },
  ],
};

const termsFr: LegalDoc = {
  title: 'Conditions d’utilisation',
  metaDescription: 'Les règles d’utilisation de Learn French with Natives : comptes, accès gratuit et Premium, paiements, renouvellements, remboursements et vos droits.',
  updated: `Dernière mise à jour : 23 novembre 2026 (version ${TERMS_VERSION})`,
  intro: [
    'Les présentes Conditions régissent l’utilisation de learnfrenchwithnatives.com, de ses cours en ligne, des comptes du site et de l’accès Premium, offerts par Learn French with Natives (« nous »), une école de français en ligne établie au Québec, Canada. En créant un compte ou en utilisant le service, vous acceptez ces Conditions et notre [Politique de confidentialité](/fr/politique-de-confidentialite/).',
    'Les cours en direct, les programmes de préparation aux examens et les programmes d’entreprise sont aussi régis par la soumission ou l’entente que vous recevez pour eux ; lorsque ce document diffère des présentes Conditions, il prévaut pour ce programme.',
    'Ces Conditions existent en français et en anglais. La version anglaise est disponible ici : [Terms of Service](/terms-of-service/).',
  ],
  sections: [
    {
      id: 'accounts',
      title: '1. Votre compte',
      blocks: [
        [
          'Il faut avoir 16 ans ou plus pour créer soi-même un compte sur le site.',
          'Les renseignements que vous fournissez doivent être exacts. Chaque compte est destiné à une seule personne, avec une seule adresse courriel : ne partagez ni votre compte ni votre mot de passe.',
          'Protégez votre mot de passe et avisez-nous immédiatement si vous pensez qu’une autre personne a utilisé votre compte. Un compte peut être connecté sur un nombre limité d’appareils à la fois.',
          'Les comptes des étudiants et des programmes d’entreprise sont créés par nous ou par l’entreprise ; leur accès aux cours en ligne est fixé par nous ou par cette entreprise.',
        ],
      ],
    },
    {
      id: 'access',
      title: '2. Accès gratuit et Premium',
      blocks: [
        [
          'Sans compte, vous pouvez utiliser le premier module du parcours A1 et le test de niveau.',
          'Avec un compte gratuit, vous pouvez utiliser le premier module de chaque parcours.',
          'Premium donne accès à toutes les leçons de tous les parcours, à la bibliothèque d’exercices, aux jeux et aux certificats de réussite, pour la période payée ou que nous avons accordée.',
        ],
        'Nous ajoutons et améliorons régulièrement des leçons. Nous pouvons modifier le contenu gratuit, mais jamais réduire ce qu’inclut une période Premium déjà payée tant qu’elle dure.',
      ],
    },
    {
      id: 'payment',
      title: '3. Prix et paiement',
      blocks: [
        'Les prix sont affichés dans la devise de l’offre avant le paiement, et le prix affiché est le prix total que vous payez. Le paiement se fait sur la page sécurisée de notre prestataire de paiement, Paystack ; nous ne recevons jamais les données de votre carte ni de votre compte mobile money.',
        'Premium commence dès que le paiement est confirmé. Si vous avez déjà Premium, la nouvelle période commence à la fin de votre période payée en cours.',
        [
          'Les offres à paiement unique donnent Premium pour la période indiquée et ne se renouvellent pas.',
          'Les abonnements se renouvellent automatiquement à la fin de chaque période, au prix affiché lors de l’abonnement, jusqu’à ce que vous arrêtiez les renouvellements dans Mon compte. Arrêtez-les avant la prochaine date de renouvellement pour ne pas être débité de nouveau ; Premium reste alors actif jusqu’à la fin de la période déjà payée.',
          'Si le paiement d’un renouvellement échoue, Premium prend fin à la fin de la période déjà payée.',
          'Si nous modifions le prix d’un abonnement, nous vous en avisons par courriel au moins 30 jours avant qu’il s’applique, et vous pouvez arrêter les renouvellements d’ici là.',
        ],
      ],
    },
    {
      id: 'refunds',
      title: '4. Remboursements',
      blocks: [
        'Nous remboursons intégralement votre premier achat si vous le demandez dans les 14 jours suivant le paiement et avez ouvert moins de cinq leçons Premium. Une fois une période de renouvellement commencée, elle n’est pas remboursée, sauf si la loi l’exige.',
        `Pour demander un remboursement, écrivez à ${MAIL} en indiquant l’adresse courriel de votre compte et la date du paiement. Le remboursement est fait sur le moyen de paiement utilisé, par l’intermédiaire de Paystack, et la période Premium qu’il avait payée prend fin.`,
        'Si vous contestez un paiement auprès de votre banque ou de votre opérateur, la période Premium qu’il avait payée prend fin ; si la contestation est réglée en faveur du paiement, nous la rétablissons.',
        'Rien dans les présentes Conditions ne limite les droits que vous accorde la Loi sur la protection du consommateur du Québec. Si cette loi vous donne le droit de résilier votre contrat (par exemple à tout moment, pour un contrat de services à exécution successive), nous le résilierons et vous rembourserons comme elle le prévoit.',
      ],
    },
    {
      id: 'certificates',
      title: '5. Certificats, notes et examens',
      blocks: [
        'Les certificats de réussite sont inclus dans Premium. Ils attestent que vous avez terminé un cours en ligne ; ce ne sont pas des diplômes de langue officiels.',
        'Les notes du simulateur d’examen et des exercices automatiques sont des estimations d’entraînement produites en partie par intelligence artificielle. Ce ne sont pas des résultats officiels du TCF, du TEF, du DELF, du DALF ou de tout autre examen. Nous ne sommes pas affiliés aux organismes qui font passer ces examens.',
      ],
    },
    {
      id: 'use',
      title: '6. Utilisation acceptable',
      blocks: [
        'Le service est destiné à votre apprentissage personnel. Vous vous engagez à ne pas :',
        [
          'copier, télécharger, enregistrer, revendre ou publier nos leçons, audios, images ou exercices, sauf de courts extraits pour vos propres révisions ;',
          'utiliser des robots, des scripts ou tout moyen automatisé pour accéder au contenu, le copier ou le recueillir ;',
          'contourner les limites d’accès, les verrous ou la sécurité du service ;',
          'partager votre compte ou le laisser utiliser par plusieurs personnes ;',
          'envoyer un contenu illégal, offensant ou trompeur dans les formulaires, messages ou exercices.',
        ],
        'Dans ce cas, nous pouvons suspendre ou fermer votre compte. Si nous le fermons pour un manquement grave, une période Premium déjà payée n’est pas remboursée, sauf si la loi l’exige.',
      ],
    },
    {
      id: 'content',
      title: '7. Notre contenu et le vôtre',
      blocks: [
        'Les cours, textes, audios, images, exercices et logiciels du service appartiennent à Learn French with Natives ou à ses concédants de licence et sont protégés par le droit d’auteur. Nous vous accordons un droit personnel et non transférable de les utiliser pour votre apprentissage pendant la durée de votre accès.',
        'Ce que vous écrivez ou enregistrez dans les exercices vous appartient. Vous nous autorisez à l’utiliser pour vous rendre le service : le corriger et le noter, vous faire un retour et vous montrer votre historique.',
      ],
    },
    {
      id: 'service',
      title: '8. Disponibilité du service',
      blocks: [
        'Nous faisons le nécessaire pour que le service reste disponible et sûr, mais il peut être interrompu pour maintenance ou pour des raisons indépendantes de notre volonté. Si une interruption importante vous empêche d’utiliser Premium pendant longtemps, contactez-nous et nous prolongerons votre période en conséquence.',
      ],
    },
    {
      id: 'closing',
      title: '9. Fermeture de votre compte',
      blocks: [
        `Vous pouvez cesser d’utiliser le service à tout moment et nous demander de fermer votre compte en écrivant à ${MAIL}. Un abonnement est arrêté à la fermeture du compte. Les remboursements suivent la section 4.`,
      ],
    },
    {
      id: 'liability',
      title: '10. Responsabilité',
      blocks: [
        'Nous fournissons le service avec soin. Dans la mesure permise par la loi, nous ne sommes pas responsables des pertes indirectes, comme un résultat d’examen manqué ou une occasion perdue, découlant de l’utilisation du service. Rien dans les présentes Conditions n’exclut ni ne limite une responsabilité ou un droit que la loi ne nous permet pas d’exclure ou de limiter, y compris vos droits de consommateur.',
      ],
    },
    {
      id: 'law',
      title: '11. Loi applicable',
      blocks: [
        'Les présentes Conditions sont régies par les lois du Québec et les lois fédérales du Canada qui s’y appliquent. Les litiges relèvent des tribunaux du Québec. Si vous êtes un consommateur, rien dans les présentes Conditions ne vous retire le droit de vous adresser au tribunal de votre lieu de résidence ni la protection que vous accorde la loi de votre pays de résidence.',
      ],
    },
    {
      id: 'changes',
      title: '12. Modifications des Conditions',
      blocks: [
        'Nous pouvons mettre à jour ces Conditions. Si un changement est important, nous en avisons les titulaires de compte par courriel au moins 30 jours avant qu’il s’applique. Si vous n’acceptez pas le changement, vous pouvez fermer votre compte avant cette date ; une période Premium payée qui n’a pas encore commencé est alors remboursée.',
      ],
    },
    {
      id: 'contact',
      title: '13. Nous joindre',
      blocks: [`Pour toute question sur ces Conditions : ${MAIL}.`],
    },
  ],
};

export const LEGAL: Record<LegalKind, Record<Lang, LegalDoc>> = {
  privacy: { en: privacyEn, fr: privacyFr },
  terms: { en: termsEn, fr: termsFr },
};
