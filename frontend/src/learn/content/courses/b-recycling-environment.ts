import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Which bin for this yoghurt pot? When is the compost collected? How can I save energy? This course gives you the everyday French of ecology: sorting waste (le tri), recycling and compost, saving water and energy at home, sustainable transport, and the simple phrases to talk about the environment and give your opinion.',
    'Quelle poubelle pour ce pot de yaourt ? Quand passe la collecte du compost ? Comment économiser l’énergie ? Ce cours vous donne le français quotidien de l’écologie : le tri des déchets, le recyclage et le compost, les économies d’eau et d’énergie à la maison, les transports durables, et les phrases simples pour parler d’environnement et donner son avis.',
  ),
  outcomes: [
    b('Sort waste correctly', 'Trier correctement ses déchets'),
    b('Understand collection notices', 'Comprendre les avis de collecte'),
    b('Talk about saving energy and water', 'Parler des économies d’énergie et d’eau'),
    b('Give a simple opinion on the environment', 'Donner un avis simple sur l’environnement'),
  ],
};

const C = 'b-recycling-environment';
export default [
  lesson(C, 1, ['sorting-waste', 'trier-ses-dechets'],
    b('Sorting waste', 'Trier ses déchets'),
    b('Name the bins and put each item in the right one.', 'Nommer les poubelles et mettre chaque déchet dans la bonne.'),
    [b('Name types of waste', 'Nommer les types de déchets'), b('Use the right bin', 'Utiliser la bonne poubelle'), b('Ask where to throw something', 'Demander où jeter quelque chose')],
    13,
    [
      card(b('The bins', 'Les poubelles'), b('**la poubelle de recyclage** (France: often the **yellow** bin; Québec: **le bac bleu**): **le papier, le carton, les bouteilles en plastique, les canettes**. **le verre**: bottles and jars (a separate container in France). **le compost / les déchets alimentaires** (Québec: **le bac brun**): **les épluchures, le marc de café**. **les ordures ménagères** (general waste). **Où est-ce que je jette ça ?**', '**la poubelle de recyclage** (France : souvent la poubelle **jaune** ; Québec : **le bac bleu**) : **le papier, le carton, les bouteilles en plastique, les canettes**. **le verre** : bouteilles et bocaux (conteneur à part en France). **le compost / les déchets alimentaires** (Québec : **le bac brun**) : **les épluchures, le marc de café**. **les ordures ménagères**. **Où est-ce que je jette ça ?**')),
      culture(b('Rules vary by city', 'Les règles varient selon les villes'), b('Colours and rules change from one city to another. Always check your **municipality’s** guide (**le guide du tri**, often an app). Batteries, electronics and paint go to a **déchetterie** (France) or **écocentre** (Québec).', 'Les couleurs et les règles changent d’une ville à l’autre. Vérifiez toujours le **guide du tri** de votre **municipalité** (souvent une appli). Piles, appareils électroniques et peinture vont à la **déchetterie** (France) ou à l’**écocentre** (Québec).'), { variant: 'culture' }),
      sort(b('Which bin?', 'Quelle poubelle ?'), [b('recycling', 'recyclage'), b('compost', 'compost'), b('special drop-off', 'dépôt spécial')], [['une boîte en carton', 0], ['des épluchures de carottes', 1], ['des piles usagées', 2], ['une canette', 0], ['du marc de café', 1], ['un vieux téléphone', 2]]),
      mc(P.best, ['Excusez-moi, où est-ce que je jette les bouteilles en verre ?', 'Verre ?', 'Je jette où le truc ?', 'Poubelle !'], { fr: 'Vous demandez à votre voisin :' }),
      pairs(P.match, [['une canette', b('a can', 'boîte de boisson')], ['les épluchures', b('peelings', 'peau des légumes')], ['un bocal', b('a jar', 'pot en verre')], ['une pile', b('a battery (small)', 'pour les télécommandes')]]),
      say('Le carton et les canettes vont au recyclage, les épluchures au compost.', 'Cardboard and cans go in recycling, peelings in the compost.'),
    ],
    [
      b('recyclage (papier, carton, plastique, canettes), verre, compost, ordures.', 'recyclage (papier, carton, plastique, canettes), verre, compost, ordures.'),
      b('Special waste: déchetterie (France), écocentre (Québec).', 'Déchets spéciaux : déchetterie (France), écocentre (Québec).'),
      b('Où est-ce que je jette ça ?', 'Où est-ce que je jette ça ?'),
    ],
    [['le tri', b('sorting (waste)', 'séparer les déchets')], ['usagé', b('used', 'déjà utilisé')], ['les ordures', b('rubbish, garbage', 'déchets')]],
  ),
  lesson(C, 2, ['saving-energy-and-water', 'economiser-l-energie-et-l-eau'],
    b('Saving energy and water', 'Économiser l’énergie et l’eau'),
    b('Talk about eco-friendly habits at home and give advice.', 'Parler des gestes écologiques à la maison et donner des conseils.'),
    [b('Name eco-friendly habits', 'Nommer les gestes écologiques'), b('Give advice with il faut / on peut', 'Conseiller avec il faut / on peut'), b('Understand a collection notice', 'Comprendre un avis de collecte')],
    13,
    [
      card(b('Eco habits', 'Les écogestes'), b('**éteindre la lumière, débrancher les appareils, baisser le chauffage, prendre une douche courte, fermer le robinet, laver à 30 degrés, réparer au lieu de jeter, acheter d’occasion, utiliser un sac réutilisable**. Advice: **Il faut éteindre la lumière. · On peut baisser le chauffage d’un degré. · Pensez à fermer le robinet.**', '**éteindre la lumière, débrancher les appareils, baisser le chauffage, prendre une douche courte, fermer le robinet, laver à 30 degrés, réparer au lieu de jeter, acheter d’occasion, utiliser un sac réutilisable**. Conseils : **Il faut éteindre la lumière. · On peut baisser le chauffage d’un degré. · Pensez à fermer le robinet.**')),
      doc({ look: 'notice', title: b('Collection notice', 'Avis de collecte'), text: 'COLLECTE DES DÉCHETS — QUARTIER CENTRE\nRecyclage (bac bleu) : chaque mardi\nCompost (bac brun) : chaque jeudi\nOrdures : un lundi sur deux\nSortez vos bacs la veille après 19 h.\nLes encombrants : sur rendez-vous uniquement.' }, b('When should you put out the compost bin?', 'Quand faut-il sortir le bac brun ?'), [b('Wednesday evening after 7 p.m.', 'le mercredi soir après 19 h'), b('Thursday at noon', 'le jeudi à midi'), b('Tuesday morning', 'le mardi matin'), b('every Monday', 'chaque lundi')]),
      sort(b('Good habit or waste?', 'Bon geste ou gaspillage ?'), [b('good habit', 'bon geste'), b('waste', 'gaspillage')], [['éteindre la lumière', 0], ['laisser l’eau couler', 1], ['réparer un vélo', 0], ['chauffer avec la fenêtre ouverte', 1], ['acheter d’occasion', 0], ['jeter un appareil qui marche', 1]]),
      gap(P.complete, 'Pour économiser l’énergie, il ___ éteindre la lumière et on ___ baisser le chauffage.', ['faut', 'peut']),
      hear('Chez nous, on prend des douches courtes, on lave le linge à trente degrés et on répare au lieu de jeter. Ce n’est pas compliqué !', b('Which habit is mentioned?', 'Quel geste est mentionné ?'), [b('washing at 30 degrees', 'laver à 30 degrés'), b('buying a new car', 'acheter une voiture neuve'), b('turning up the heating', 'monter le chauffage'), b('long baths', 'de longs bains')], { voice: 'f' }),
      say('Pensez à éteindre la lumière et à fermer le robinet !', 'Remember to turn off the light and the tap!'),
    ],
    [
      b('éteindre, débrancher, baisser, fermer, réparer, acheter d’occasion.', 'éteindre, débrancher, baisser, fermer, réparer, acheter d’occasion.'),
      b('Advice: Il faut + infinitive · On peut… · Pensez à…', 'Conseils : Il faut + infinitif · On peut… · Pensez à…'),
      b('Collection: bac, collecte, la veille, encombrants.', 'Collecte : bac, collecte, la veille, encombrants.'),
    ],
    [['le robinet', b('the tap', 'd’où sort l’eau')], ['d’occasion', b('second-hand', 'déjà utilisé')], ['les encombrants', b('bulky waste', 'gros objets à jeter')]],
  ),
  lesson(C, 3, ['talking-about-the-environment', 'parler-d-environnement'],
    b('Talking about the environment', 'Parler d’environnement'),
    b('Give a simple opinion on environmental topics and talk about your transport.', 'Donner un avis simple sur l’environnement et parler de ses transports.'),
    [b('Use opinion phrases', 'Employer les formules d’opinion'), b('Talk about sustainable transport', 'Parler des transports durables'), b('Say what you do and want to do', 'Dire ce qu’on fait et ce qu’on veut faire')],
    13,
    [
      card(b('Opinions and transport', 'Opinions et transports'), b('**À mon avis, c’est important de… · Je pense qu’on doit… · Pour moi, le plus important, c’est…** Transport: **aller au travail à vélo / à pied / en transports en commun, le covoiturage, une voiture électrique, prendre le train au lieu de l’avion**. **J’essaie de… · Je voudrais…**', '**À mon avis, c’est important de… · Je pense qu’on doit… · Pour moi, le plus important, c’est…** Transports : **aller au travail à vélo / à pied / en transports en commun, le covoiturage, une voiture électrique, prendre le train au lieu de l’avion**. **J’essaie de… · Je voudrais…**')),
      dlg(b('A chat about ecology', 'Une discussion sur l’écologie'), undefined, [['Nina', 'f'], ['Vous', 'm']], [
        [0, 'Tu fais attention à l’environnement, toi ?', 'Do you pay attention to the environment?'],
        [1, { options: ['Oui, j’essaie. Je trie mes déchets et je vais au travail à vélo.', 'Environnement oui.', 'Je ne sais pas c’est quoi.'] }],
        [0, 'Moi aussi. Et l’avion ?', 'Me too. And flying?'],
        [1, { options: ['À mon avis, c’est important de prendre le train quand c’est possible.', 'L’avion, c’est bien.', 'Je ne veux pas parler.'] }],
      ]),
      sort(b('Sustainable or not?', 'Durable ou pas ?'), [b('sustainable', 'durable'), b('less sustainable', 'moins durable')], [['le covoiturage', 0], ['un vol court en avion', 1], ['le vélo', 0], ['la voiture seul tous les jours', 1], ['les transports en commun', 0], ['jeter sans trier', 1]]),
      mc(P.best, ['À mon avis, c’est important de réduire nos déchets.', 'Avis déchets important.', 'C’est important de déchets.', 'Mon avis est les déchets.'], { fr: 'Donnez votre avis sur les déchets :' }),
      dict('À mon avis, il faut prendre le train au lieu de l’avion quand c’est possible.', {}),
      write(b('Your eco habits', 'Vos écogestes'), b('Write 3–5 sentences (30–50 words): what you already do for the environment, what you want to do, and your opinion.', 'Écrivez 3 à 5 phrases (30–50 mots) : ce que vous faites déjà pour l’environnement, ce que vous voulez faire, et votre avis.'), 30, 50, [
        b('What you do', 'Ce que vous faites'),
        b('What you want to do', 'Ce que vous voulez faire'),
        b('An opinion', 'Un avis'),
      ], 'Je trie mes déchets et je vais au travail en métro. Je voudrais acheter plus de vêtements d’occasion et utiliser moins de plastique. À mon avis, c’est important de réparer les objets au lieu de les jeter.'),
    ],
    [
      b('À mon avis… Je pense qu’on doit… Pour moi, le plus important…', 'À mon avis… Je pense qu’on doit… Pour moi, le plus important…'),
      b('à vélo, à pied, en transports en commun, le covoiturage.', 'à vélo, à pied, en transports en commun, le covoiturage.'),
      b('J’essaie de… Je voudrais…', 'J’essaie de… Je voudrais…'),
    ],
    [['le covoiturage', b('carpooling', 'partager une voiture')], ['réduire', b('to reduce', 'diminuer')], ['au lieu de', b('instead of', 'à la place de')]],
  ),
];
