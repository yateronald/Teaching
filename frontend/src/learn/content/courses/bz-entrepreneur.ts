import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Starting a business in a French-speaking country means pitching your idea, writing a business plan, talking to a banker or an investor, and dealing with administrative steps (statut, immatriculation, assurances). This course trains the language of the entrepreneur: a clear elevator pitch, the sections of a plan d’affaires, the vocabulary of funding (prêt, subvention, levée de fonds) and the key paperwork terms in France and Québec. It is a language course, not legal or financial advice.',
    'Créer une entreprise dans un pays francophone, c’est présenter son idée, rédiger un plan d’affaires, convaincre un banquier ou un investisseur, et gérer les démarches administratives (statut, immatriculation, assurances). Ce cours entraîne la langue de l’entrepreneur : un pitch clair, les parties d’un plan d’affaires, le vocabulaire du financement (prêt, subvention, levée de fonds) et les termes administratifs clés en France et au Québec. C’est un cours de langue, pas un conseil juridique ou financier.',
  ),
  outcomes: [
    b('Pitch a business idea in one minute', 'Présenter un projet d’entreprise en une minute'),
    b('Know the sections of a business plan', 'Connaître les parties d’un plan d’affaires'),
    b('Talk about funding', 'Parler de financement'),
    b('Understand key administrative terms', 'Comprendre les termes administratifs clés'),
  ],
};

const C = 'bz-entrepreneur';
export default [
  lesson(C, 1, ['the-pitch', 'le-pitch'],
    b('The one-minute pitch', 'Le pitch d’une minute'),
    b('Present the problem, your solution, your market and your ask.', 'Présenter le problème, votre solution, votre marché et votre demande.'),
    [b('State the problem', 'Énoncer le problème'), b('Present the solution and the market', 'Présenter la solution et le marché'), b('Make your ask', 'Formuler sa demande')],
    13,
    [
      card(b('Pitch structure', 'Structure du pitch'), b('**Problème**: **Chaque année, 30 % des fruits des petits producteurs sont jetés.** **Solution**: **Nous transformons ces fruits invendus en jus vendus localement.** **Marché**: **Les épiceries fines et les cafés de la région, soit environ 400 points de vente.** **Équipe**: **Nous sommes deux, une ingénieure agroalimentaire et un commercial.** **Demande**: **Nous cherchons 80 000 € pour acheter une presse et lancer la production.**', '**Problème** : **Chaque année, 30 % des fruits des petits producteurs sont jetés.** **Solution** : **Nous transformons ces fruits invendus en jus vendus localement.** **Marché** : **Les épiceries fines et les cafés de la région, soit environ 400 points de vente.** **Équipe** : **Nous sommes deux, une ingénieure agroalimentaire et un commercial.** **Demande** : **Nous cherchons 80 000 € pour acheter une presse et lancer la production.**')),
      sort(b('Which part of the pitch?', 'Quelle partie du pitch ?'), [b('problem', 'problème'), b('solution', 'solution'), b('ask', 'demande')], [['Les parents perdent des heures à chercher une garderie.', 0], ['Notre application affiche les places libres en temps réel.', 1], ['Nous cherchons 150 000 $ pour notre lancement.', 2], ['Les petits commerces n’ont pas de site web.', 0], ['Nous créons leur boutique en ligne en 48 heures.', 1], ['Nous souhaitons un prêt de 40 000 €.', 2]]),
      hear('Chaque année, des tonnes de pain sont jetées par les boulangeries. Notre idée : les transformer en chapelure et en biscuits apéritifs. Nous visons les épiceries et les restaurants de Montréal, et nous cherchons soixante mille dollars pour équiper notre atelier.', b('What is the ask?', 'Quelle est la demande ?'), [b('$60,000 to equip the workshop', '60 000 $ pour équiper l’atelier'), b('a bakery to buy', 'une boulangerie à racheter'), b('new restaurant clients only', 'seulement de nouveaux restaurants clients'), b('free bread', 'du pain gratuit')], { voice: 'm' }),
      mc(P.best, ['Nous cherchons 80 000 € pour acheter une presse et produire nos premiers 20 000 litres.', 'Donnez-nous de l’argent, c’est une super idée.', 'On verra combien il nous faut.', 'Le plus possible.'], { fr: 'Formulez la demande à la fin de votre pitch :' }),
      ord(P.order, 'Nous transformons des fruits invendus en jus locaux.', { tr: 'We turn unsold fruit into local juices.' }),
      say('Chaque année, trente pour cent des fruits sont jetés. Nous les transformons en jus locaux, et nous cherchons quatre-vingt mille euros pour lancer la production.', 'Every year thirty per cent of fruit is thrown away. We turn it into local juices, and we are looking for eighty thousand euros to launch production.'),
    ],
    [
      b('Problème → solution → marché → équipe → demande.', 'Problème → solution → marché → équipe → demande.'),
      b('Use figures: 30 %, 400 points de vente, 80 000 €.', 'Utilisez des chiffres : 30 %, 400 points de vente, 80 000 €.'),
      b('End with a precise ask.', 'Terminez par une demande précise.'),
    ],
    [['invendu', b('unsold', 'pas vendu')], ['une épicerie fine', b('a delicatessen', 'magasin de produits fins')], ['un point de vente', b('a retail outlet', 'lieu où l’on vend')]],
  ),
  lesson(C, 2, ['business-plan-and-funding', 'plan-d-affaires-et-financement'],
    b('Business plan and funding', 'Plan d’affaires et financement'),
    b('Know the parts of a business plan and the vocabulary of funding.', 'Connaître les parties d’un plan d’affaires et le vocabulaire du financement.'),
    [b('Name the sections of a plan', 'Nommer les parties d’un plan'), b('Talk about funding sources', 'Parler des sources de financement'), b('Answer a banker’s questions', 'Répondre aux questions d’un banquier')],
    13,
    [
      card(b('Plan and funding', 'Plan et financement'), b('**Le plan d’affaires** (France: business plan / plan d’affaires): **résumé, présentation du projet, étude de marché, stratégie commerciale, prévisions financières, besoins de financement**. Funding: **l’apport personnel, un prêt bancaire, une subvention, un prêt d’honneur, le financement participatif, une levée de fonds, un investisseur providentiel (business angel)**. **le seuil de rentabilité** (break-even point).', '**Le plan d’affaires** : **résumé, présentation du projet, étude de marché, stratégie commerciale, prévisions financières, besoins de financement**. Financement : **l’apport personnel, un prêt bancaire, une subvention, un prêt d’honneur, le financement participatif, une levée de fonds, un investisseur providentiel**. **le seuil de rentabilité**.')),
      pairs(P.match, [['l’apport personnel', b('personal contribution', 'argent du créateur')], ['une subvention', b('a grant', 'aide publique non remboursable')], ['le financement participatif', b('crowdfunding', 'financement par le public')], ['le seuil de rentabilité', b('break-even point', 'moment où on ne perd plus')]]),
      dlg(b('At the bank', 'À la banque'), undefined, [['Conseiller', 'm'], ['Vous', 'f']], [
        [0, 'Quel est le montant total de votre projet ?', 'What is the total amount of your project?'],
        [1, { options: ['Cent mille euros : vingt mille d’apport personnel, quinze mille de subvention régionale, et nous sollicitons un prêt de soixante-cinq mille.', 'Beaucoup.', 'Je ne sais pas encore.'] }],
        [0, 'Et quand pensez-vous atteindre le seuil de rentabilité ?', 'And when do you expect to break even?'],
        [1, { options: ['D’après nos prévisions, au cours de la deuxième année, avec environ 250 clients réguliers.', 'Très vite, c’est sûr.', 'Jamais, mais ce n’est pas grave.'] }],
      ]),
      mc(P.choose, [b('a grant: public aid you don’t pay back', 'une subvention : aide publique non remboursable'), b('a bank loan', 'un prêt bancaire'), b('your own money', 'votre propre argent'), b('a tax', 'un impôt')], { fr: 'Qu’est-ce qu’une subvention ?' }),
      gap(P.complete, 'Notre ___ personnel est de 20 000 €, et nous sollicitons un ___ bancaire de 65 000 €.', ['apport', 'prêt']),
      say('Nous sollicitons un prêt de soixante-cinq mille euros ; nous prévoyons d’atteindre le seuil de rentabilité la deuxième année.', 'We are applying for a sixty-five-thousand-euro loan; we expect to break even in the second year.'),
    ],
    [
      b('Plan: résumé, marché, stratégie, prévisions financières, besoins.', 'Plan : résumé, marché, stratégie, prévisions financières, besoins.'),
      b('Funding: apport, prêt, subvention, financement participatif, levée de fonds.', 'Financement : apport, prêt, subvention, financement participatif, levée de fonds.'),
      b('Seuil de rentabilité = break-even.', 'Seuil de rentabilité = point mort.'),
    ],
    [['solliciter', b('to apply for, request', 'demander')], ['des prévisions', b('forecasts', 'estimations futures')], ['une étude de marché', b('a market study', 'analyse du marché')]],
  ),
  lesson(C, 3, ['administrative-steps', 'les-demarches-administratives'],
    b('Administrative steps', 'Les démarches administratives'),
    b('Understand the key terms of legal status, registration, insurance and taxes.', 'Comprendre les termes clés du statut, de l’immatriculation, des assurances et des impôts.'),
    [b('Talk about legal status', 'Parler du statut juridique'), b('Understand registration steps', 'Comprendre les étapes d’immatriculation'), b('Ask the right questions to an advisor', 'Poser les bonnes questions à un conseiller')],
    13,
    [
      card(b('Key terms', 'Termes clés'), b('**France**: **micro-entreprise** (simplified status for small activities), **SARL, SAS** (companies), **l’immatriculation**, **le numéro SIRET**, **l’URSSAF**, **les cotisations sociales**. **Québec**: **entreprise individuelle**, **société par actions (inc.)**, **immatriculer son entreprise au Registraire des entreprises**, **le NEQ** (numéro d’entreprise du Québec), **TPS/TVQ**. Everywhere: **une assurance responsabilité civile professionnelle**, **un expert-comptable / comptable**.', '**France** : **micro-entreprise** (statut simplifié pour les petites activités), **SARL, SAS** (sociétés), **l’immatriculation**, **le numéro SIRET**, **l’URSSAF**, **les cotisations sociales**. **Québec** : **entreprise individuelle**, **société par actions (inc.)**, **immatriculer son entreprise au Registraire des entreprises**, **le NEQ**, **TPS/TVQ**. Partout : **une assurance responsabilité civile professionnelle**, **un expert-comptable / comptable**.')),
      culture(b('Get professional advice', 'Faites-vous conseiller'), b('Rules change and depend on your situation. Use this vocabulary to **ask the right questions** to official advisors (chambres de commerce, CCI, Entreprises Québec, accountants). This course teaches the language, not the law.', 'Les règles changent et dépendent de votre situation. Utilisez ce vocabulaire pour **poser les bonnes questions** aux conseillers officiels (chambres de commerce, CCI, Entreprises Québec, comptables). Ce cours enseigne la langue, pas le droit.'), { variant: 'culture' }),
      sort(b('France or Québec term?', 'Terme de France ou du Québec ?'), [b('France', 'France'), b('Québec', 'Québec')], [['le numéro SIRET', 0], ['le NEQ', 1], ['l’URSSAF', 0], ['le Registraire des entreprises', 1], ['la micro-entreprise', 0], ['la TVQ', 1]]),
      mc(P.best, ['Quel statut me conseilleriez-vous pour une activité de traduction en indépendant, et quelles cotisations devrai-je payer ?', 'C’est quoi le mieux, dites-moi.', 'Je ne veux pas payer d’impôts, comment faire ?', 'Faites tout pour moi.'], { fr: 'Vous rencontrez un conseiller à la chambre de commerce :' }),
      write(b('Questions for an advisor', 'Questions pour un conseiller'), b('Write an email (50–80 words) to a business advisor: present your project in two sentences and ask three precise questions (status, insurance, taxes).', 'Rédigez un courriel (50–80 mots) à un conseiller : présentez votre projet en deux phrases et posez trois questions précises (statut, assurance, impôts).'), 50, 80, [
        b('Project in two sentences', 'Projet en deux phrases'),
        b('Three precise questions', 'Trois questions précises'),
        b('Formal greeting and closing', 'Formules d’appel et de fin'),
      ], 'Bonjour Madame,\n\nJe souhaite créer une activité de cours de cuisine à domicile à Sherbrooke. Je commencerais seule, avec une vingtaine de clients par mois.\n\nPourriez-vous me conseiller sur trois points : quel statut est le plus adapté, quelle assurance responsabilité je dois prendre, et à partir de quel chiffre d’affaires je dois facturer la TPS et la TVQ ?\n\nMerci d’avance,\nMariam Coulibaly'),
    ],
    [
      b('France: micro-entreprise, SARL, SAS, SIRET, URSSAF.', 'France : micro-entreprise, SARL, SAS, SIRET, URSSAF.'),
      b('Québec: entreprise individuelle, inc., NEQ, TPS/TVQ.', 'Québec : entreprise individuelle, inc., NEQ, TPS/TVQ.'),
      b('Always confirm rules with an official advisor.', 'Confirmez toujours les règles auprès d’un conseiller officiel.'),
    ],
    [['l’immatriculation', b('registration', 'inscription officielle')], ['un indépendant', b('a freelancer', 'travailleur autonome')], ['facturer', b('to invoice, to charge', 'faire payer')]],
  ),
];
