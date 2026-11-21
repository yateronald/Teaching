import type { CourseAbout } from '../../types';
import { b, card, flash, gap, lesson, mc, P, pairs, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The TEF covers everyday and professional life: services, consumption, work, health, leisure, media and society. A rich, precise vocabulary helps in every test: you understand faster and you write and speak more convincingly. This course builds high-frequency vocabulary by theme, with collocations (prendre rendez-vous, déposer une demande, porter plainte), synonyms to avoid repetition and the formal equivalents expected at B2.',
    'Le TEF couvre la vie quotidienne et professionnelle : services, consommation, travail, santé, loisirs, médias et société. Un vocabulaire riche et précis aide dans toutes les épreuves : on comprend plus vite et on écrit et parle de façon plus convaincante. Ce cours construit un vocabulaire fréquent par thème, avec des collocations (prendre rendez-vous, déposer une demande, porter plainte), des synonymes pour éviter les répétitions et les équivalents soutenus attendus au B2.',
  ),
  outcomes: [
    b('Master high-frequency themes', 'Maîtriser les thèmes fréquents'),
    b('Use collocations', 'Employer les collocations'),
    b('Avoid repetition with synonyms', 'Éviter les répétitions avec des synonymes'),
    b('Move from everyday to formal vocabulary', 'Passer du vocabulaire courant au vocabulaire soutenu'),
  ],
};

const C = 'tef-vocab';
export default [
  lesson(C, 1, ['services-and-consumption', 'services-et-consommation'],
    b('Services and consumption', 'Services et consommation'),
    b('Vocabulary of administrative procedures, shopping and complaints.', 'Vocabulaire des démarches, des achats et des réclamations.'),
    [b('Administrative collocations', 'Collocations administratives'), b('Consumer vocabulary', 'Vocabulaire de la consommation'), b('Complaint vocabulary', 'Vocabulaire de la réclamation')],
    13,
    [
      card(b('Key collocations', 'Collocations clés'), b('**prendre rendez-vous, remplir un formulaire, déposer une demande, fournir un justificatif, renouveler un document, annuler une commande, se faire rembourser, porter plainte, faire une réclamation, résilier un abonnement, bénéficier d’une réduction, respecter un délai**.', '**prendre rendez-vous, remplir un formulaire, déposer une demande, fournir un justificatif, renouveler un document, annuler une commande, se faire rembourser, porter plainte, faire une réclamation, résilier un abonnement, bénéficier d’une réduction, respecter un délai**.')),
      pairs(P.match, [['déposer', 'une demande'], ['fournir', 'un justificatif'], ['résilier', 'un abonnement'], ['porter', 'plainte']], true),
      gap(P.complete, 'Pour ___ votre passeport, vous devez ___ un formulaire et ___ un justificatif de domicile.', ['renouveler', 'remplir', 'fournir']),
      sort(b('Administration or consumption?', 'Administration ou consommation ?'), [b('administration', 'administration'), b('consumption', 'consommation')], [['renouveler un titre de séjour', 0], ['se faire rembourser', 1], ['déposer une demande', 0], ['bénéficier d’une promotion', 1], ['fournir un justificatif', 0], ['annuler une commande', 1]]),
      flash(b('Services', 'Services'), [['un justificatif', b('supporting document', 'preuve écrite')], ['un délai', b('a time limit', 'temps accordé')], ['résilier', b('to cancel (a contract)', 'mettre fin')], ['une réclamation', b('a complaint', 'plainte formelle')], ['bénéficier de', b('to benefit from', 'profiter de')]]),
    ],
    [
      b('Learn verbs with their nouns: déposer une demande, fournir un justificatif.', 'Apprenez les verbes avec leurs noms : déposer une demande, fournir un justificatif.'),
      b('Consumption: se faire rembourser, annuler, résilier.', 'Consommation : se faire rembourser, annuler, résilier.'),
      b('Reuse them in writing section B and speaking section A.', 'Réemployez-les à l’écrit (section B) et à l’oral (section A).'),
    ],
    [['un titre de séjour', b('a residence permit', 'autorisation de rester')], ['une commande', b('an order', 'achat demandé')], ['respecter un délai', b('to meet a deadline', 'être à l’heure')]],
  ),
  lesson(C, 2, ['work-and-health', 'travail-et-sante'],
    b('Work and health', 'Travail et santé'),
    b('Vocabulary of employment, workplace and health services.', 'Vocabulaire de l’emploi, du milieu de travail et des services de santé.'),
    [b('Employment vocabulary', 'Vocabulaire de l’emploi'), b('Health vocabulary', 'Vocabulaire de la santé'), b('Formal equivalents', 'Équivalents soutenus')],
    13,
    [
      card(b('Work and health', 'Travail et santé'), b('Work: **postuler, une candidature, un entretien / une entrevue, embaucher, licencier, démissionner, un contrat à durée indéterminée, la formation continue, l’équilibre vie pro / vie perso**. Health: **un médecin de famille, un spécialiste, une ordonnance, un arrêt maladie, les urgences, la prévention, le bien-être**.', 'Travail : **postuler, une candidature, un entretien / une entrevue, embaucher, licencier, démissionner, un contrat à durée indéterminée, la formation continue, l’équilibre vie pro / vie perso**. Santé : **un médecin de famille, un spécialiste, une ordonnance, un arrêt maladie, les urgences, la prévention, le bien-être**.')),
      sort(b('Work or health?', 'Travail ou santé ?'), [b('work', 'travail'), b('health', 'santé')], [['postuler', 0], ['une ordonnance', 1], ['démissionner', 0], ['un arrêt maladie', 1], ['embaucher', 0], ['les urgences', 1]]),
      pairs(P.match, [['trouver un travail', 'décrocher un emploi'], ['perdre son travail', 'être licencié'], ['partir de son travail', 'démissionner'], ['aller mieux', 'se rétablir']], true),
      mc(P.best, ['De nombreuses entreprises peinent à recruter des candidats qualifiés.', 'Les entreprises ont du mal à trouver des gens bien.', 'Il y a des problèmes pour avoir des employés.', 'Les patrons cherchent des gens.'], { fr: 'Quelle phrase a le registre le plus soutenu ?' }),
      gap(P.complete, 'Elle a ___ sa candidature lundi et elle a ___ un emploi deux semaines plus tard.', ['envoyé', 'décroché']),
    ],
    [
      b('Work: postuler, embaucher, licencier, démissionner, formation continue.', 'Travail : postuler, embaucher, licencier, démissionner, formation continue.'),
      b('Health: ordonnance, arrêt maladie, urgences, prévention.', 'Santé : ordonnance, arrêt maladie, urgences, prévention.'),
      b('Formal: décrocher un emploi, peiner à, se rétablir.', 'Soutenu : décrocher un emploi, peiner à, se rétablir.'),
    ],
    [['peiner à', b('to struggle to', 'avoir du mal à')], ['une ordonnance', b('a prescription', 'papier du médecin')], ['décrocher', b('to land (a job)', 'obtenir')]],
  ),
  lesson(C, 3, ['society-and-media', 'societe-et-medias'],
    b('Society and media', 'Société et médias'),
    b('Vocabulary for opinion topics and synonyms to avoid repetition.', 'Vocabulaire des sujets d’opinion et synonymes pour éviter les répétitions.'),
    [b('Society and media vocabulary', 'Vocabulaire de la société et des médias'), b('Synonyms for common words', 'Synonymes des mots courants'), b('Reuse in an opinion paragraph', 'Réemploi dans un paragraphe d’opinion')],
    13,
    [
      card(b('Avoid repetition', 'Éviter les répétitions'), b('**problème** → difficulté, enjeu, défi, obstacle · **important** → essentiel, crucial, majeur · **augmenter** → croître, progresser, s’accroître · **montrer** → révéler, démontrer, illustrer · **les gens** → les citoyens, la population, les usagers · **dire** → affirmer, souligner, estimer.', '**problème** → difficulté, enjeu, défi, obstacle · **important** → essentiel, crucial, majeur · **augmenter** → croître, progresser, s’accroître · **montrer** → révéler, démontrer, illustrer · **les gens** → les citoyens, la population, les usagers · **dire** → affirmer, souligner, estimer.')),
      pairs(P.match, [['important', 'essentiel'], ['augmenter', 'progresser'], ['montrer', 'révéler'], ['les gens', 'la population']], true),
      sort(b('Media or society?', 'Médias ou société ?'), [b('media', 'médias'), b('society', 'société')], [['la désinformation', 0], ['le vieillissement de la population', 1], ['un éditorial', 0], ['l’égalité des chances', 1], ['les réseaux sociaux', 0], ['le pouvoir d’achat', 1]]),
      write(b('Opinion with rich vocabulary', 'Avis avec un vocabulaire riche'), b('In 60–90 words, give your opinion on « Les réseaux sociaux sont la principale source d’information des jeunes », without using « problème », « important » or « les gens ».', 'En 60–90 mots, donnez votre avis sur « Les réseaux sociaux sont la principale source d’information des jeunes », sans employer « problème », « important » ni « les gens ».'), 60, 90, [
        b('A clear opinion', 'Une opinion claire'),
        b('Synonyms instead of vague words', 'Des synonymes au lieu de mots vagues'),
        b('One example', 'Un exemple'),
      ], 'Il est indéniable que les réseaux sociaux sont devenus une source d’information majeure pour les jeunes. Ce constat soulève toutefois un enjeu crucial : la désinformation. Une étude récente révèle qu’un grand nombre d’adolescents ont déjà partagé une fausse nouvelle sans la vérifier. C’est pourquoi l’école devrait développer l’éducation aux médias, afin que les citoyens de demain sachent distinguer une information fiable d’une rumeur.'),
    ],
    [
      b('Replace vague words: problème, important, les gens, dire.', 'Remplacez les mots vagues : problème, important, les gens, dire.'),
      b('Society and media topics recur in section B.', 'Les thèmes société et médias reviennent en section B.'),
      b('Keep a personal list of synonyms.', 'Tenez une liste personnelle de synonymes.'),
    ],
    [['un enjeu', b('a stake, an issue', 'ce qui est en jeu')], ['la désinformation', b('disinformation', 'fausses informations')], ['fiable', b('reliable', 'digne de confiance')]],
  ),
];
