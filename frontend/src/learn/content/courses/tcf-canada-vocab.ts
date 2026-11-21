import type { CourseAbout } from '../../types';
import { b, card, doc, flash, hear, lesson, mc, P, pairs, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The TCF Canada draws on everyday and professional situations of life in Canada: finding housing, working, using health and public services, getting around, community life. This course builds the vocabulary of these themes, with Canadian and Québec expressions (logement, bail, épicerie, courriel, cellulaire, assurance maladie, NAS), so you recognise them instantly in listening and reading, and use them naturally in writing and speaking.',
    'Le TCF Canada puise dans des situations quotidiennes et professionnelles de la vie au Canada : se loger, travailler, utiliser les services de santé et les services publics, se déplacer, vie communautaire. Ce cours construit le vocabulaire de ces thèmes, avec les expressions canadiennes et québécoises (logement, bail, épicerie, courriel, cellulaire, assurance maladie, NAS), pour les reconnaître immédiatement à l’écoute et à la lecture, et les employer naturellement à l’écrit et à l’oral.',
  ),
  outcomes: [
    b('Master housing and daily-life vocabulary', 'Maîtriser le vocabulaire du logement et du quotidien'),
    b('Master work and services vocabulary', 'Maîtriser le vocabulaire du travail et des services'),
    b('Recognise Canadian French expressions', 'Reconnaître les expressions du français canadien'),
    b('Reuse themes in writing and speaking', 'Réutiliser les thèmes à l’écrit et à l’oral'),
  ],
};

const C = 'tcf-canada-vocab';
export default [
  lesson(C, 1, ['housing-and-daily-life', 'logement-et-quotidien'],
    b('Housing and daily life', 'Logement et vie quotidienne'),
    b('Vocabulary of housing, shopping and transport in Canada.', 'Vocabulaire du logement, des achats et des transports au Canada.'),
    [b('Housing words', 'Mots du logement'), b('Shopping and transport words', 'Mots des achats et des transports'), b('Canadian expressions', 'Expressions canadiennes')],
    13,
    [
      card(b('Housing in Canada', 'Le logement au Canada'), b('**un logement, un appartement (un appart), un 4 ½** (Québec: number of rooms, ½ = bathroom), **un bail** (lease), **le propriétaire, le locataire, le loyer, chauffé / éclairé** (heating / electricity included), **le déménagement** (moving day: 1st July in Québec). Daily life: **l’épicerie** (grocery store), **le dépanneur** (corner shop), **la carte OPUS / PRESTO** (transit cards), **le traversier** (ferry).', '**un logement, un appartement (un appart), un 4 ½** (Québec : nombre de pièces, ½ = salle de bain), **un bail**, **le propriétaire, le locataire, le loyer, chauffé / éclairé** (chauffage / électricité compris), **le déménagement** (le 1er juillet au Québec). Quotidien : **l’épicerie**, **le dépanneur**, **la carte OPUS / PRESTO** (cartes de transport), **le traversier**.')),
      doc({ look: 'ad', title: b('Rental ad', 'Annonce de location'), text: 'À LOUER — 4 ½ rénové, Rosemont\n1 350 $/mois, chauffé, éclairé\nPrès du métro, buanderie dans l’immeuble\nLibre le 1er juillet — bail de 12 mois\nNon-fumeur, animaux acceptés' }, b('What is included in the rent?', 'Qu’est-ce qui est compris dans le loyer ?'), [b('heating and electricity', 'le chauffage et l’électricité'), b('internet', 'internet'), b('parking', 'le stationnement'), b('furniture', 'les meubles')]),
      flash(b('Canadian daily words', 'Mots du quotidien au Canada'), [['le dépanneur', b('corner shop (Québec)', 'petit magasin de quartier')], ['l’épicerie', b('grocery store', 'magasin d’alimentation')], ['un bail', b('a lease', 'contrat de location')], ['la buanderie', b('laundry room', 'lieu pour laver le linge')], ['chauffé, éclairé', b('heating and electricity included', 'charges comprises')]]),
      pairs(P.match, [['le propriétaire', b('the landlord', 'qui loue le logement')], ['le locataire', b('the tenant', 'qui habite et paie')], ['le traversier', b('the ferry (Canada)', 'bateau de traversée')], ['déménager', b('to move house', 'changer de logement')]]),
      hear('Bonjour, j’appelle pour le quatre et demie à louer. Est-ce qu’il est toujours disponible ? Et le loyer comprend le chauffage ?', b('What does the caller want to know?', 'Que veut savoir la personne ?'), [b('if the flat is available and if heating is included', 'si l’appartement est disponible et si le chauffage est compris'), b('the address of the metro', 'l’adresse du métro'), b('if pets are allowed', 'si les animaux sont acceptés'), b('the size of the bedroom', 'la taille de la chambre')], { voice: 'm' }),
    ],
    [
      b('Housing: bail, loyer, propriétaire, locataire, chauffé/éclairé, 4 ½.', 'Logement : bail, loyer, propriétaire, locataire, chauffé/éclairé, 4 ½.'),
      b('Daily life: épicerie, dépanneur, traversier, cartes de transport.', 'Quotidien : épicerie, dépanneur, traversier, cartes de transport.'),
      b('Québec: moving day is 1st July.', 'Québec : le jour du déménagement est le 1er juillet.'),
    ],
    [['rénové', b('renovated', 'remis à neuf')], ['libre', b('available, vacant', 'disponible')], ['non-fumeur', b('non-smoking', 'interdit de fumer')]],
  ),
  lesson(C, 2, ['work-and-services', 'travail-et-services'],
    b('Work and public services', 'Travail et services publics'),
    b('Vocabulary of jobs, workplace rights and public services.', 'Vocabulaire de l’emploi, des droits au travail et des services publics.'),
    [b('Job-search words', 'Mots de la recherche d’emploi'), b('Public services words', 'Mots des services publics'), b('Health system words', 'Mots du système de santé')],
    13,
    [
      card(b('Work and services', 'Travail et services'), b('Work: **un emploi, un poste, un CV, une entrevue** (Canada: job interview), **un employeur, le salaire horaire, les avantages sociaux, les vacances, un congé parental, le chômage / l’assurance-emploi**. Services: **le NAS** (numéro d’assurance sociale), **la carte d’assurance maladie** (Québec: RAMQ card), **une clinique sans rendez-vous, Service Canada, un formulaire, une demande**.', 'Travail : **un emploi, un poste, un CV, une entrevue** (Canada : entretien d’embauche), **un employeur, le salaire horaire, les avantages sociaux, les vacances, un congé parental, l’assurance-emploi**. Services : **le NAS** (numéro d’assurance sociale), **la carte d’assurance maladie** (Québec : carte RAMQ), **une clinique sans rendez-vous, Service Canada, un formulaire, une demande**.')),
      sort(b('Work or public services?', 'Travail ou services publics ?'), [b('work', 'travail'), b('public services', 'services publics')], [['une entrevue', 0], ['le NAS', 1], ['le salaire horaire', 0], ['la carte d’assurance maladie', 1], ['les avantages sociaux', 0], ['une clinique sans rendez-vous', 1]]),
      mc(P.meaning, [b('a job interview (Canada)', 'un entretien d’embauche (Canada)'), b('a newspaper interview only', 'seulement une interview de journal'), b('a phone bill', 'une facture de téléphone'), b('a holiday', 'des vacances')], { fr: '« Une entrevue » au Canada :' }),
      doc({ look: 'ad', title: b('Job offer', 'Offre d’emploi'), text: 'Préposé(e) aux bénéficiaires — CHSLD de Laval\nTemps plein, quart de soir\n24,50 $ de l’heure + avantages sociaux\nFormation en santé et 1 an d’expérience exigés\nFrançais fonctionnel requis' }, b('What is the shift?', 'Quel est l’horaire de travail ?'), [b('evenings', 'le soir'), b('nights', 'la nuit'), b('weekends only', 'seulement le week-end'), b('mornings', 'le matin')]),
      pairs(P.match, [['un quart de travail', b('a shift', 'période de travail')], ['l’assurance-emploi', b('employment insurance', 'aide en cas de chômage')], ['un employeur', b('an employer', 'qui embauche')], ['une demande', b('an application', 'formulaire de requête')]]),
    ],
    [
      b('Work: emploi, poste, entrevue, salaire horaire, avantages sociaux, quart.', 'Travail : emploi, poste, entrevue, salaire horaire, avantages sociaux, quart.'),
      b('Services: NAS, carte d’assurance maladie, Service Canada, formulaire.', 'Services : NAS, carte d’assurance maladie, Service Canada, formulaire.'),
      b('Health: clinique sans rendez-vous.', 'Santé : clinique sans rendez-vous.'),
    ],
    [['un préposé aux bénéficiaires', b('a patient attendant (Québec)', 'aide-soignant')], ['exigé', b('required', 'obligatoire')], ['fonctionnel', b('functional, workable', 'suffisant pour travailler')]],
  ),
  lesson(C, 3, ['community-and-environment', 'communaute-et-environnement'],
    b('Community, climate and society themes', 'Communauté, climat et thèmes de société'),
    b('Vocabulary for the opinion topics often found in tasks 3: environment, technology, society.', 'Vocabulaire des sujets d’opinion fréquents en tâche 3 : environnement, technologie, société.'),
    [b('Society vocabulary', 'Vocabulaire de société'), b('Opinion-topic vocabulary', 'Vocabulaire des sujets d’opinion'), b('Reuse in a short text', 'Réemploi dans un court texte')],
    13,
    [
      card(b('Society themes', 'Thèmes de société'), b('**Environnement**: le réchauffement climatique, les feux de forêt, le recyclage, le transport en commun. **Technologie**: le télétravail, les réseaux sociaux, l’intelligence artificielle, la protection des données. **Société**: le bénévolat, l’intégration des nouveaux arrivants, le bilinguisme, le vieillissement de la population, la conciliation travail-famille.', '**Environnement** : le réchauffement climatique, les feux de forêt, le recyclage, le transport en commun. **Technologie** : le télétravail, les réseaux sociaux, l’intelligence artificielle, la protection des données. **Société** : le bénévolat, l’intégration des nouveaux arrivants, le bilinguisme, le vieillissement de la population, la conciliation travail-famille.')),
      sort(b('Which theme?', 'Quel thème ?'), [b('environment', 'environnement'), b('technology', 'technologie'), b('society', 'société')], [['les feux de forêt', 0], ['l’intelligence artificielle', 1], ['le bénévolat', 2], ['le transport en commun', 0], ['la protection des données', 1], ['la conciliation travail-famille', 2]]),
      pairs(P.match, [['le bénévolat', b('volunteering', 'travail non payé pour aider')], ['un nouvel arrivant', b('a newcomer', 'immigrant récent')], ['la conciliation travail-famille', b('work-life balance', 'équilibre travail et famille')], ['le vieillissement', b('ageing', 'fait de vieillir')]]),
      mc(P.best, ['Le bénévolat favorise l’intégration des nouveaux arrivants, car il permet de créer des liens et de pratiquer le français.', 'Le bénévolat, c’est bien.', 'Les nouveaux arrivants sont nombreux.', 'Je fais du sport.'], { fr: 'Quelle phrase utilise le mieux le vocabulaire du thème « société » ?' }),
      write(b('Short opinion', 'Courte opinion'), b('In 50–80 words, give your opinion: « Le bénévolat devrait-il être encouragé pour les nouveaux arrivants ? » Use at least four words from this lesson.', 'En 50–80 mots, donnez votre avis : « Le bénévolat devrait-il être encouragé pour les nouveaux arrivants ? » Employez au moins quatre mots de cette leçon.'), 50, 80, [
        b('A clear opinion', 'Une opinion claire'),
        b('An argument and an example', 'Un argument et un exemple'),
        b('Four theme words', 'Quatre mots du thème'),
      ], 'À mon avis, le bénévolat devrait être fortement encouragé pour les nouveaux arrivants. D’abord, il favorise l’intégration : on rencontre des voisins, on découvre la culture locale et on pratique le français dans des situations réelles. Par exemple, une amie colombienne a trouvé son premier emploi grâce à une banque alimentaire où elle faisait du bénévolat. C’est donc un excellent tremplin.'),
    ],
    [
      b('Environment, technology, society: frequent opinion themes.', 'Environnement, technologie, société : thèmes d’opinion fréquents.'),
      b('Learn theme words in collocations (favoriser l’intégration).', 'Apprenez les mots du thème en collocations (favoriser l’intégration).'),
      b('Reuse them in writing and speaking.', 'Réemployez-les à l’écrit et à l’oral.'),
    ],
    [['une banque alimentaire', b('a food bank', 'aide alimentaire')], ['un tremplin', b('a springboard', 'qui aide à avancer')], ['favoriser', b('to encourage, promote', 'aider à')]],
  ),
];
