import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, lesson, mc, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'CDI or CDD, période d’essai, congés payés, RTT, fiche de paie, mutuelle, entretien annuel: French-speaking working life comes with its own vocabulary and documents. This course helps you read an employment contract and a pay slip, request leave or a schedule change, and prepare your annual review, with the terms used in France and their equivalents in Québec. It is a language course, not legal advice.',
    'CDI ou CDD, période d’essai, congés payés, RTT, fiche de paie, mutuelle, entretien annuel : la vie professionnelle francophone a son propre vocabulaire et ses propres documents. Ce cours vous aide à lire un contrat de travail et une fiche de paie, à demander un congé ou un changement d’horaires, et à préparer votre entretien annuel, avec les termes utilisés en France et leurs équivalents au Québec. C’est un cours de langue, pas un conseil juridique.',
  ),
  outcomes: [
    b('Understand a contract’s key terms', 'Comprendre les termes clés d’un contrat'),
    b('Read a pay slip', 'Lire une fiche de paie'),
    b('Request leave politely in writing', 'Demander un congé poliment par écrit'),
    b('Prepare an annual review', 'Préparer un entretien annuel'),
  ],
};

const C = 'bz-hr';
export default [
  lesson(C, 1, ['the-employment-contract', 'le-contrat-de-travail'],
    b('The employment contract', 'Le contrat de travail'),
    b('Understand the main types of contract and the key clauses.', 'Comprendre les principaux types de contrat et les clauses clés.'),
    [b('CDI, CDD, intérim, temps partiel', 'CDI, CDD, intérim, temps partiel'), b('Probation, notice, working hours', 'Période d’essai, préavis, horaires'), b('France and Québec terms', 'Termes de France et du Québec')],
    13,
    [
      card(b('Contract vocabulary', 'Le vocabulaire du contrat'), b('**CDI** (permanent contract; Québec: **emploi permanent**) · **CDD** (fixed-term; Québec: **contrat à durée déterminée / emploi temporaire**) · **l’intérim** (temp work) · **temps plein / temps partiel** · **la période d’essai** (probation) · **le préavis** (notice period) · **la rémunération brute annuelle** · **35 heures par semaine** (France) / **40 heures** (often in Québec).', '**CDI** (contrat à durée indéterminée ; Québec : **emploi permanent**) · **CDD** (contrat à durée déterminée ; Québec : **emploi temporaire**) · **l’intérim** · **temps plein / temps partiel** · **la période d’essai** · **le préavis** · **la rémunération brute annuelle** · **35 heures par semaine** (France) / **40 heures** (souvent au Québec).')),
      doc({ look: 'page', title: b('Contract extract (fictional)', 'Extrait de contrat (fictif)'), text: 'Article 2 — Nature du contrat\nLe présent contrat est conclu pour une durée indéterminée à compter du 2 septembre.\nArticle 3 — Période d’essai\nLe salarié est soumis à une période d’essai de deux mois, renouvelable une fois.\nArticle 5 — Durée du travail\nLa durée hebdomadaire de travail est fixée à 35 heures.\nArticle 6 — Rémunération\nLe salarié percevra une rémunération brute annuelle de 34 000 euros, versée en douze mensualités.' }, b('What type of contract is it?', 'De quel type de contrat s’agit-il ?'), [b('a permanent contract (CDI) with 2 months’ probation, renewable once', 'un CDI avec 2 mois d’essai, renouvelable une fois'), b('a 2-month fixed-term contract', 'un CDD de 2 mois'), b('a part-time contract', 'un contrat à temps partiel'), b('a temp contract', 'un contrat d’intérim')]),
      pairs(P.match, [['un CDI', b('a permanent contract', 'durée indéterminée')], ['un CDD', b('a fixed-term contract', 'durée déterminée')], ['la période d’essai', b('the probation period', 'période de test')], ['le préavis', b('the notice period', 'délai avant de partir')]]),
      mc(P.meaning, [b('before tax and social contributions', 'avant impôts et cotisations sociales'), b('after tax', 'après impôts'), b('paid in cash', 'payé en espèces'), b('per month', 'par mois')], { fr: '« Rémunération brute » :' }),
      say('J’ai signé un CDI à temps plein, avec une période d’essai de deux mois.', 'I signed a full-time permanent contract, with a two-month probation period.'),
    ],
    [
      b('CDI = permanent; CDD = fixed-term; intérim = temp work.', 'CDI = durée indéterminée ; CDD = durée déterminée ; intérim = travail temporaire.'),
      b('Période d’essai, préavis, temps plein / partiel.', 'Période d’essai, préavis, temps plein / partiel.'),
      b('Brut = before deductions; net = what you receive.', 'Brut = avant retenues ; net = ce que vous recevez.'),
    ],
    [['un salarié', b('an employee', 'personne employée')], ['hebdomadaire', b('weekly', 'par semaine')], ['une mensualité', b('a monthly payment', 'versement mensuel')]],
  ),
  lesson(C, 2, ['pay-slip-and-leave', 'fiche-de-paie-et-conges'],
    b('Pay slip and leave', 'La fiche de paie et les congés'),
    b('Read the main lines of a pay slip and request leave in writing.', 'Lire les principales lignes d’une fiche de paie et demander un congé par écrit.'),
    [b('Read gross, net and contributions', 'Lire brut, net et cotisations'), b('Name types of leave', 'Nommer les types de congés'), b('Write a leave request', 'Rédiger une demande de congé')],
    13,
    [
      card(b('Pay slip and leave', 'Fiche de paie et congés'), b('Pay slip (Québec: **relevé de paie / talon de paie**): **salaire brut, cotisations sociales, net à payer, net imposable, heures supplémentaires, prime**. Leave: **les congés payés** (5 weeks in France), **les RTT** (extra days off for working over 35 h), **un congé maladie, un congé maternité / paternité, un congé sans solde**. Québec: **les vacances annuelles**, often 2–3 weeks.', 'Fiche de paie (Québec : **relevé de paie / talon de paie**) : **salaire brut, cotisations sociales, net à payer, net imposable, heures supplémentaires, prime**. Congés : **les congés payés** (5 semaines en France), **les RTT** (jours de repos pour le travail au-delà de 35 h), **un congé maladie, un congé maternité / paternité, un congé sans solde**. Québec : **les vacances annuelles**, souvent 2 à 3 semaines.')),
      doc({ look: 'receipt', title: b('Pay slip extract (fictional)', 'Extrait de fiche de paie (fictif)'), text: 'Salaire de base | 2 833,33\nHeures supplémentaires (6 h) | 145,20\nPrime d’assiduité | 100,00\nSalaire brut | 3 078,53\nCotisations sociales | – 692,67\nNet à payer avant impôt | 2 385,86' }, b('How much was paid for overtime?', 'Combien ont rapporté les heures supplémentaires ?'), [b('145.20', '145,20'), b('100.00', '100,00'), b('692.67', '692,67'), b('2,385.86', '2 385,86')]),
      sort(b('Pay or leave?', 'Paie ou congé ?'), [b('pay', 'paie'), b('leave', 'congé')], [['le salaire brut', 0], ['les congés payés', 1], ['une prime', 0], ['un congé sans solde', 1], ['les cotisations', 0], ['les RTT', 1]]),
      doc({ look: 'email', title: b('Leave request', 'Demande de congé'), text: 'Objet : Demande de congés du 14 au 25 juillet\n\nBonjour Madame Perrin,\n\nJe souhaiterais poser mes congés payés du lundi 14 au vendredi 25 juillet inclus. J’ai vérifié avec l’équipe : Thomas pourra assurer le suivi de mes dossiers pendant mon absence.\n\nPourriez-vous me confirmer votre accord ?\n\nBien cordialement,\nSamir Ouali' }, b('What has Samir already organised?', 'Qu’est-ce que Samir a déjà organisé ?'), [b('Thomas will cover his files', 'Thomas suivra ses dossiers'), b('a pay rise', 'une augmentation'), b('a trip with the team', 'un voyage avec l’équipe'), b('unpaid leave', 'un congé sans solde')]),
      say('Je souhaiterais poser mes congés du quatorze au vingt-cinq juillet. Thomas pourra assurer le suivi de mes dossiers.', 'I would like to take my leave from 14 to 25 July. Thomas will be able to follow up on my files.'),
    ],
    [
      b('Pay slip: brut, cotisations, net à payer, heures supplémentaires, prime.', 'Fiche de paie : brut, cotisations, net à payer, heures supplémentaires, prime.'),
      b('Leave: congés payés, RTT, maladie, sans solde.', 'Congés : congés payés, RTT, maladie, sans solde.'),
      b('Request: Je souhaiterais poser mes congés du… au…', 'Demande : Je souhaiterais poser mes congés du… au…'),
    ],
    [['poser ses congés', b('to book one’s leave', 'demander ses jours de vacances')], ['une prime', b('a bonus', 'somme en plus du salaire')], ['inclus', b('inclusive', 'compris')]],
  ),
  lesson(C, 3, ['the-annual-review', 'l-entretien-annuel'],
    b('The annual review', 'L’entretien annuel'),
    b('Present your results, discuss your goals and ask for training or a raise.', 'Présenter vos résultats, discuter de vos objectifs et demander une formation ou une augmentation.'),
    [b('Present achievements', 'Présenter ses réalisations'), b('Discuss difficulties constructively', 'Parler des difficultés de façon constructive'), b('Ask for training or a raise', 'Demander une formation ou une augmentation')],
    13,
    [
      card(b('Review language', 'La langue de l’entretien'), b('Results: **Cette année, j’ai mené à bien… · J’ai atteint / dépassé mon objectif de…** Difficulties: **J’ai rencontré des difficultés avec…, et j’ai appris à…** Goals: **L’année prochaine, j’aimerais développer mes compétences en…** Requests: **Serait-il possible de suivre une formation en… ? · Compte tenu de mes résultats, je souhaiterais aborder la question de ma rémunération.**', 'Résultats : **Cette année, j’ai mené à bien… · J’ai atteint / dépassé mon objectif de…** Difficultés : **J’ai rencontré des difficultés avec…, et j’ai appris à…** Objectifs : **L’année prochaine, j’aimerais développer mes compétences en…** Demandes : **Serait-il possible de suivre une formation en… ? · Compte tenu de mes résultats, je souhaiterais aborder la question de ma rémunération.**')),
      mc(P.best, ['Compte tenu de mes résultats cette année, je souhaiterais aborder la question de ma rémunération.', 'Je veux plus d’argent, sinon je pars.', 'Tout le monde est augmenté sauf moi.', 'Vous me payez mal.'], { fr: 'Vous demandez une augmentation :' }),
      sort(b('Achievement, difficulty or goal?', 'Réalisation, difficulté ou objectif ?'), [b('achievement', 'réalisation'), b('difficulty', 'difficulté'), b('goal', 'objectif')], [['J’ai dépassé mon objectif de 15 %.', 0], ['J’ai eu du mal à gérer les délais.', 1], ['J’aimerais encadrer un stagiaire.', 2], ['J’ai mené à bien le projet export.', 0], ['La nouvelle plateforme m’a posé problème.', 1], ['Je voudrais me former en gestion de projet.', 2]]),
      dlg(b('The review', 'L’entretien'), undefined, [['Responsable', 'f'], ['Vous', 'm']], [
        [0, 'Comment évaluez-vous votre année ?', 'How would you assess your year?'],
        [1, { options: ['Plutôt positive : j’ai mené à bien le projet de refonte du site et dépassé mon objectif de ventes de 10 %.', 'Bien.', 'Je ne sais pas, à vous de dire.'] }],
        [0, 'Et les points à améliorer ?', 'And the areas for improvement?'],
        [1, { options: ['J’ai parfois eu du mal à respecter les délais. J’aimerais suivre une formation en gestion du temps.', 'Aucun, tout était parfait.', 'C’est la faute de l’équipe.'] }],
      ]),
      say('Cette année, j’ai dépassé mon objectif de quinze pour cent. L’année prochaine, j’aimerais suivre une formation en gestion de projet.', 'This year I exceeded my target by fifteen per cent. Next year I’d like to take a project-management course.'),
    ],
    [
      b('Achievements: j’ai mené à bien…, j’ai atteint / dépassé…', 'Réalisations : j’ai mené à bien…, j’ai atteint / dépassé…'),
      b('Difficulties + what you learned.', 'Difficultés + ce que vous avez appris.'),
      b('Requests: formation, rémunération — with arguments.', 'Demandes : formation, rémunération — avec arguments.'),
    ],
    [['mener à bien', b('to carry out successfully', 'réussir')], ['encadrer', b('to supervise', 'diriger, accompagner')], ['un stagiaire', b('an intern', 'étudiant en stage')]],
  ),
];
