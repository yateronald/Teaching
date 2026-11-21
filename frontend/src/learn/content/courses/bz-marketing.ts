import type { CourseAbout } from '../../types';
import { b, card, culture, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Marketing and communication in French means defining a target, positioning a brand, briefing an agency, writing catchy and accurate copy, and measuring a campaign. This course trains the vocabulary of the field (cible, positionnement, notoriété, taux de conversion), the writing of short persuasive texts and social-media posts, and the language rules that apply in France and Québec (French-language requirements, honest claims).',
    'Le marketing et la communication en français, c’est définir une cible, positionner une marque, briefer une agence, rédiger des textes accrocheurs et exacts, et mesurer une campagne. Ce cours entraîne le vocabulaire du métier (cible, positionnement, notoriété, taux de conversion), la rédaction de textes persuasifs courts et de publications pour les réseaux sociaux, et les règles linguistiques en vigueur en France et au Québec (obligation du français, allégations honnêtes).',
  ),
  outcomes: [
    b('Describe a target and a positioning', 'Décrire une cible et un positionnement'),
    b('Write a short campaign brief', 'Rédiger un court brief de campagne'),
    b('Write catchy, honest copy', 'Rédiger des textes accrocheurs et honnêtes'),
    b('Comment on campaign results', 'Commenter les résultats d’une campagne'),
  ],
};

const C = 'bz-marketing';
export default [
  lesson(C, 1, ['target-and-positioning', 'cible-et-positionnement'],
    b('Target and positioning', 'Cible et positionnement'),
    b('Describe who you speak to and how your brand differs.', 'Décrire à qui vous parlez et en quoi votre marque se distingue.'),
    [b('Describe a target', 'Décrire une cible'), b('State a positioning', 'Énoncer un positionnement'), b('Use the key marketing vocabulary', 'Employer le vocabulaire clé du marketing')],
    13,
    [
      card(b('Marketing vocabulary', 'Vocabulaire du marketing'), b('**la cible** (target): **les 25–35 ans urbains, sensibles à l’écologie** · **le positionnement**: **une marque de vélos haut de gamme, fiable et durable** · **la notoriété** (awareness) · **l’image de marque** · **un avantage concurrentiel** · **le persona** · **le parcours client**.', '**la cible** : **les 25–35 ans urbains, sensibles à l’écologie** · **le positionnement** : **une marque de vélos haut de gamme, fiable et durable** · **la notoriété** · **l’image de marque** · **un avantage concurrentiel** · **le persona** · **le parcours client**.')),
      sort(b('Target or positioning?', 'Cible ou positionnement ?'), [b('target', 'cible'), b('positioning', 'positionnement')], [['les jeunes parents actifs', 0], ['une marque accessible et joyeuse', 1], ['les PME du secteur du bâtiment', 0], ['le spécialiste du sur-mesure', 1], ['les étudiants internationaux', 0], ['la solution la plus simple du marché', 1]]),
      mc(P.best, ['Notre cible : les 25–40 ans urbains qui veulent se déplacer sans voiture. Notre positionnement : des vélos électriques fiables, réparables et fabriqués localement.', 'On vend des vélos à tout le monde.', 'Notre marque est la meilleure.', 'On fait du marketing.'], { fr: 'Présentez cible et positionnement d’une marque de vélos :' }),
      pairs(P.match, [['la notoriété', b('brand awareness', 'fait d’être connu')], ['haut de gamme', b('premium, high-end', 'de qualité supérieure')], ['un avantage concurrentiel', b('a competitive advantage', 'ce qui distingue')], ['le parcours client', b('the customer journey', 'étapes du client')]]),
      gap(P.complete, 'Notre ___ principale, ce sont les jeunes parents. Notre ___ : une marque simple et rassurante.', ['cible', 'positionnement']),
      say('Notre cible, ce sont les jeunes actifs urbains ; notre positionnement, une marque fiable et responsable.', 'Our target is young urban professionals; our positioning, a reliable and responsible brand.'),
    ],
    [
      b('Cible: who you speak to (age, lifestyle, needs).', 'Cible : à qui vous parlez (âge, mode de vie, besoins).'),
      b('Positionnement: how you differ (haut de gamme, accessible…).', 'Positionnement : en quoi vous vous distinguez (haut de gamme, accessible…).'),
      b('Notoriété, image de marque, avantage concurrentiel.', 'Notoriété, image de marque, avantage concurrentiel.'),
    ],
    [['durable', b('sustainable, durable', 'qui dure, écologique')], ['réparable', b('repairable', 'qu’on peut réparer')], ['sur-mesure', b('tailor-made', 'fait pour chaque client')]],
  ),
  lesson(C, 2, ['writing-copy', 'rediger-des-textes'],
    b('Writing catchy, honest copy', 'Rédiger des textes accrocheurs et honnêtes'),
    b('Write slogans, short ads and social posts that respect the rules.', 'Écrire slogans, courtes annonces et publications qui respectent les règles.'),
    [b('Write a slogan', 'Écrire un slogan'), b('Write a social media post', 'Rédiger une publication'), b('Avoid misleading claims', 'Éviter les allégations trompeuses')],
    13,
    [
      card(b('Copywriting tools', 'Les outils du rédacteur'), b('**Imperative and tu/vous**: **Découvrez…, Profitez…, Essayez gratuitement.** **Short rhythm**: **Simple. Rapide. Local.** **Benefits, not features**: **Arrivez au travail sans transpirer.** **Call to action**: **Réservez votre essai.** For social media: a **hook**, one idea, a **call to action**, few hashtags.', '**Impératif et tu/vous** : **Découvrez…, Profitez…, Essayez gratuitement.** **Rythme court** : **Simple. Rapide. Local.** **Bénéfices, pas caractéristiques** : **Arrivez au travail sans transpirer.** **Appel à l’action** : **Réservez votre essai.** Sur les réseaux : une **accroche**, une idée, un **appel à l’action**, peu de mots-clics.')),
      culture(b('Rules to know', 'Règles à connaître'), b('In **Québec**, the **Charte de la langue française** requires French in commercial advertising (other languages may be added, French must be predominant). In **France**, the **loi Toubon** requires French in advertising (translations allowed). Everywhere, claims must be **truthful and provable**: « le meilleur du monde » or « 100 % écologique » without proof can be considered misleading.', 'Au **Québec**, la **Charte de la langue française** impose le français dans l’affichage et la publicité commerciale (d’autres langues peuvent s’ajouter, le français doit prédominer). En **France**, la **loi Toubon** impose le français dans la publicité (traductions permises). Partout, les allégations doivent être **vraies et vérifiables** : « le meilleur du monde » ou « 100 % écologique » sans preuve peuvent être jugés trompeurs.'), { variant: 'culture' }),
      mc(P.best, ['Fabriqué à Lyon, réparable à vie. Essayez-le gratuitement ce week-end.', 'Le vélo le plus écologique de la planète, garanti à 100 %.', 'Achetez notre vélo maintenant, sinon vous le regretterez.', 'Nos vélos sont des vélos.'], { fr: 'Quel texte publicitaire est accrocheur et honnête ?' }),
      doc({ look: 'sms', title: b('Social media post', 'Publication sur les réseaux'), text: 'Marre des bouchons le matin ? 🚲\nAvec nos vélos électriques, arrivez au bureau frais et à l’heure.\nEssai gratuit ce samedi dans notre atelier.\nRéservez votre créneau : lien en bio !' }, b('What is the call to action?', 'Quel est l’appel à l’action ?'), [b('book a free trial slot', 'réserver un créneau d’essai gratuit'), b('buy a bike today', 'acheter un vélo aujourd’hui'), b('share the post', 'partager la publication'), b('avoid traffic jams', 'éviter les bouchons')]),
      ord(P.order, 'Essayez gratuitement notre nouvelle application pendant un mois.', { tr: 'Try our new app free for a month.' }),
      write(b('Your post', 'Votre publication'), b('Write a social-media post (30–55 words) for a local bakery launching a new bread: hook, benefit, call to action. No false claims.', 'Rédigez une publication (30–55 mots) pour une boulangerie de quartier qui lance un nouveau pain : accroche, bénéfice, appel à l’action. Pas d’allégation fausse.'), 30, 55, [
        b('A hook', 'Une accroche'),
        b('A concrete benefit', 'Un bénéfice concret'),
        b('A call to action', 'Un appel à l’action'),
      ], 'Envie d’un pain qui se garde toute la semaine ? Découvrez notre nouveau pain au levain, pétri à la main chaque matin avec des farines de la région. Dégustation offerte samedi de 9 h à midi : passez nous voir !'),
    ],
    [
      b('Imperative + benefit + call to action.', 'Impératif + bénéfice + appel à l’action.'),
      b('Short rhythm: Simple. Rapide. Local.', 'Rythme court : Simple. Rapide. Local.'),
      b('French required in ads (Québec, France); claims must be provable.', 'Français obligatoire en publicité (Québec, France) ; allégations vérifiables.'),
    ],
    [['un créneau', b('a time slot', 'plage horaire')], ['une allégation', b('a claim', 'affirmation')], ['trompeur', b('misleading', 'qui induit en erreur')]],
  ),
  lesson(C, 3, ['measuring-a-campaign', 'mesurer-une-campagne'],
    b('Measuring a campaign', 'Mesurer une campagne'),
    b('Comment on campaign indicators and recommend improvements.', 'Commenter les indicateurs d’une campagne et recommander des améliorations.'),
    [b('Name key indicators', 'Nommer les indicateurs clés'), b('Interpret results', 'Interpréter les résultats'), b('Recommend next steps', 'Recommander la suite')],
    13,
    [
      card(b('Campaign indicators', 'Les indicateurs de campagne'), b('**la portée** (reach), **les impressions**, **le taux d’engagement**, **le taux de clics**, **le taux de conversion**, **le coût par acquisition**, **le retour sur investissement**. Interpret: **La campagne a touché 80 000 personnes, mais le taux de conversion reste faible (0,8 %). · Les vidéos courtes ont généré deux fois plus d’engagement.**', '**la portée**, **les impressions**, **le taux d’engagement**, **le taux de clics**, **le taux de conversion**, **le coût par acquisition**, **le retour sur investissement**. Interpréter : **La campagne a touché 80 000 personnes, mais le taux de conversion reste faible (0,8 %). · Les vidéos courtes ont généré deux fois plus d’engagement.**')),
      doc({ look: 'page', title: b('Campaign results', 'Résultats de la campagne'), text: 'Canal | Portée | Taux de clics | Conversions\nVidéos courtes | 45 000 | 3,2 % | 210\nBannières | 60 000 | 0,6 % | 40\nInfolettre | 8 000 | 7,5 % | 95' }, b('Which channel converted best relative to its reach?', 'Quel canal a le mieux converti par rapport à sa portée ?'), [b('the newsletter', 'l’infolettre'), b('the banners', 'les bannières'), b('short videos and banners equally', 'vidéos et bannières à égalité'), b('none', 'aucun')]),
      hear('Les bannières ont eu la plus grande portée, mais très peu de conversions. Je recommande de réduire ce budget de moitié et de le transférer vers les vidéos courtes et l’infolettre.', b('What does she recommend?', 'Que recommande-t-elle ?'), [b('move half the banner budget to videos and the newsletter', 'transférer la moitié du budget des bannières vers les vidéos et l’infolettre'), b('stop the newsletter', 'arrêter l’infolettre'), b('double the banners', 'doubler les bannières'), b('stop all advertising', 'arrêter toute publicité')], { voice: 'f' }),
      pairs(P.match, [['la portée', b('reach', 'nombre de personnes touchées')], ['le taux de conversion', b('conversion rate', 'part qui achète')], ['une infolettre', b('a newsletter', 'lettre d’information par courriel')], ['le taux de clics', b('click-through rate', 'part qui clique')]]),
      gap(P.complete, 'La campagne a ___ 80 000 personnes, mais le taux de conversion ___ faible.', ['touché', 'reste']),
      say('Les vidéos courtes ont généré deux fois plus d’engagement. Je recommande d’y transférer une partie du budget.', 'Short videos generated twice as much engagement. I recommend moving part of the budget there.'),
    ],
    [
      b('Indicators: portée, taux de clics, taux de conversion, coût par acquisition.', 'Indicateurs : portée, taux de clics, taux de conversion, coût par acquisition.'),
      b('Interpret: a touché…, mais… reste faible.', 'Interpréter : a touché…, mais… reste faible.'),
      b('Recommend: Je recommande de réduire / transférer / tester…', 'Recommander : Je recommande de réduire / transférer / tester…'),
    ],
    [['un canal', b('a channel', 'moyen de diffusion')], ['une bannière', b('a banner ad', 'publicité en ligne')], ['générer', b('to generate', 'produire')]],
  ),
];
