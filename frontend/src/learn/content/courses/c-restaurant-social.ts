import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, doc, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Sharing a meal in French is about much more than ordering food: it is a moment of warmth, recommendations and easy conversation around the table. This A1 conversation course helps you recommend dishes to friends, check ingredients for allergies or dietary needs, raise a glass with natural toasts and split the bill smoothly at the end of the evening.',
    'Partager un repas en français dépasse la simple commande : c’est un moment de convivialité, de recommandations et d’échanges simples autour de la table. Ce cours de conversation A1 vous aide à conseiller un plat à des amis, vérifier les ingrédients en cas d’allergie ou de régime, trinquer naturellement et partager l’addition en fin de repas.',
  ),
  outcomes: [
    b('Recommend dishes and check ingredients', 'Conseiller un plat et vérifier les ingrédients'),
    b('Mention allergies or dietary needs politely', 'Signaler poliment une allergie ou un régime'),
    b('React to food and make natural toasts', 'Complimenter le repas et trinquer naturellement'),
    b('Split the bill smoothly with friends', 'Partager l’addition simplement entre amis'),
  ],
};

const C = 'c-restaurant-social';
export default [
  lesson(C, 1, ['recommending-and-allergies', 'conseiller-et-signaler-une-allergie'],
    b('Recommending dishes & allergies', 'Conseiller un plat et signaler une allergie'),
    b('Suggest dishes to friends and ask clearly about allergens or vegetarian choices.', 'Recommander un plat à des amis et vérifier allergènes ou options végétariennes.'),
    [b('Recommend a dish on the menu', 'Recommander un plat de la carte'), b('State an allergy or vegetarian diet', 'Dire une allergie ou un régime végétarien'), b('Check ingredients on a menu', 'Vérifier les ingrédients sur un menu')],
    13,
    [
      card(b('Choosing together', 'Choisir ensemble'), b('Recommend: **Je te conseille le saumon. · C’est la spécialité de la maison. · On partage une entrée ?** Dietary needs: **Je suis végétarien(ne). · Je suis allergique aux noix / aux fruits de mer / au gluten. · Est-ce qu’il y a du beurre ou des arachides dedans ?**', 'Recommander : **Je te conseille le saumon. · C’est la spécialité de la maison. · On partage une entrée ?** Régimes et allergies : **Je suis végétarien(ne). · Je suis allergique aux noix / aux fruits de mer / au gluten. · Est-ce qu’il y a du beurre ou des arachides dedans ?**'), {
        ex: [['Tu devrais goûter le risotto, il est excellent ici.', 'You should try the risotto, it’s excellent here.'], ['Excusez-moi, je suis allergique aux noix : il y en a dans ce plat ?', 'Excuse me, I’m allergic to nuts: are there any in this dish?']],
      }),
      dlg(b('Reading the menu with a friend', 'Lire la carte avec une amie'), undefined, [['Chloé', 'f'], ['Vous', 'm']], [
        [0, 'Tout a l’air bon ! Tu es déjà venu ici, tu me conseilles quoi ?', 'Everything looks good! You’ve been here before, what do you recommend?'],
        [1, { options: ['Je te conseille les légumes grillés en entrée : c’est la spécialité ici !', 'Mange du poisson.', 'Je ne sais pas lire.'] }],
        [0, 'Super ! Moi je suis végétarienne et allergique aux noix, alors je vérifie toujours.', 'Great! I’m vegetarian and allergic to nuts, so I always check.'],
        [1, { options: ['Tu as raison, on va demander au serveur pour la sauce.', 'Pourquoi tu manges alors ?', 'Les noix sont très bonnes.'] }],
      ]),
      doc({ look: 'menu', title: b('Table d’amis — Evening menu', 'Table d’amis — Carte du soir'), text: 'ENTRÉES À PARTAGER\nHoumous et pain pita chaud (végétarien) | 9 €\nCalamars grillés au citron | 12 €\n\nPLATS\nRisotto aux champignons (sans gluten) | 18 €\nFilet de bar, purée maison (beurre) | 22 €\nTarte fine aux noix et miel (allergène : noix) | 8 €' }, b('Which main dish is safe for someone avoiding gluten and nuts?', 'Quel plat convient à une personne qui évite gluten et noix ?'), [b('mushroom risotto', 'le risotto aux champignons'), b('walnut and honey tart', 'la tarte fine aux noix'), b('grilled squid', 'les calamars grillés'), b('sea bass with butter', 'le filet de bar au beurre')]),
      pairs(P.match, [['sans gluten', b('gluten-free', 'sans blé ni seigle')], ['allergique aux noix', b('allergic to nuts', 'ne peut pas manger de noix')], ['la spécialité', b('the house speciality', 'plat célèbre du lieu')], ['à partager', b('to share', 'pour plusieurs personnes')]]),
      mc(P.best, ['Excusez-moi, est-ce qu’il y a des noix dans cette sauce ? Je suis allergique.', 'Enlevez les noix vite !', 'Je ne veux pas de sauce du tout.', 'C’est dangereux ici ?'], { fr: 'Vous vérifiez les ingrédients auprès du serveur :' }),
      say('Je suis végétarienne et allergique aux noix. Qu’est-ce que vous me conseillez ?', 'I’m vegetarian and allergic to nuts. What do you recommend?'),
    ],
    [
      b('Je te conseille… · C’est la spécialité de la maison.', 'Je te conseille… · C’est la spécialité de la maison.'),
      b('Je suis végétarien(ne) · allergique aux noix / aux fruits de mer.', 'Je suis végétarien(ne) · allergique aux noix / aux fruits de mer.'),
      b('Est-ce qu’il y a du… dedans ?', 'Est-ce qu’il y a du… dedans ?'),
    ],
    [['végétarien', b('vegetarian', 'qui ne mange pas de viande')], ['un allergène', b('an allergen', 'ingrédient qui provoque une allergie')], ['goûter', b('to taste / try', 'essayer un aliment')]],
  ),
  lesson(C, 2, ['table-talk-and-toasting', 'discuter-et-trinquer'],
    b('Table talk & toasting', 'Discuter à table et trinquer'),
    b('Pass dishes, react warmly to the food and raise a glass with French toasts.', 'Passer les plats, complimenter la cuisine et trinquer en français.'),
    [b('Offer a taste and pass items politely', 'Proposer de goûter et passer un plat'), b('Use natural toasts like Santé !', 'Employer Santé ! et À la tienne !'), b('Follow French table etiquette', 'Suivre les usages de table francophones')],
    13,
    [
      card(b('Around the table', 'Autour de la table'), b('Sharing: **Tu veux goûter mon plat ? · Tu peux me passer le sel / la carafe, s’il te plaît ? · Bon appétit ! · C’est un vrai régal !** Toasting: **Santé ! · Tchin ! · À la tienne / À la vôtre ! · À notre amitié !**', 'Partager : **Tu veux goûter mon plat ? · Tu peux me passer le sel / la carafe, s’il te plaît ? · Bon appétit ! · C’est un vrai régal !** Trinquer : **Santé ! · Tchin ! · À la tienne / À la vôtre ! · À notre amitié !**'), {
        ex: [['Santé à tous ! Et bon appétit !', 'Cheers everyone! And enjoy your meal!'], ['Ce risotto est un vrai régal, tu veux goûter ?', 'This risotto is a real treat, want a taste?']],
      }),
      culture(b('Eye contact when you toast', 'Se regarder dans les yeux pour trinquer'), b('In French-speaking countries, always **look the person in the eye** when clinking glasses and avoid crossing someone else’s arm while toasting. Wait until everyone is served before starting to eat after **Bon appétit !**.', 'Dans les pays francophones, on se **regarde toujours dans les yeux** en trinquant et on évite de croiser le bras d’un autre convive. On attend aussi que tout le monde soit servi avant de commencer après **Bon appétit !**.'), { variant: 'culture' }),
      sort(b('Toast, compliment or request?', 'Trinquer, complimenter ou demander ?'), [b('toasting', 'trinquer'), b('complimenting', 'complimenter'), b('request / offer', 'demander ou proposer')], [['À ton anniversaire !', 0], ['Ce risotto est un vrai régal !', 1], ['Tu peux me passer la carafe ?', 2], ['Santé à tous !', 0], ['C’est super bien assaisonné.', 1], ['Tu veux goûter un morceau ?', 2]]),
      hear('Bon appétit tout le monde ! Avant de manger, je lève mon verre à notre amitié et au beau voyage de Nadia ! Santé !', b('What are they toasting to?', 'À quoi trinquent-ils ?'), [b('their friendship and Nadia’s trip', 'à leur amitié et au voyage de Nadia'), b('a new job in Paris', 'à un nouveau travail à Paris'), b('the restaurant’s birthday', 'à l’anniversaire du restaurant'), b('a football victory', 'à une victoire au football')], { voice: 'm' }),
      ord(P.order, 'Tu veux goûter un peu de ma tarte aux pommes ?', { tr: 'Do you want to taste a bit of my apple tart?', extra: ['sel'] }),
      say('Santé à tous ! Et bon appétit ! Ce plat a l’air délicieux.', 'Cheers everyone! Enjoy your meal! This dish looks delicious.'),
    ],
    [
      b('Santé ! · Tchin ! · À la tienne / À la vôtre !', 'Santé ! · Tchin ! · À la tienne / À la vôtre !'),
      b('Tu veux goûter ? · Tu peux me passer le sel ?', 'Tu veux goûter ? · Tu peux me passer le sel ?'),
      b('C’est délicieux ! · C’est un vrai régal !', 'C’est délicieux ! · C’est un vrai régal !'),
    ],
    [['trinquer', b('to clink glasses, toast', 'lever son verre ensemble')], ['un régal', b('a treat, delicious dish', 'quelque chose de délicieux')], ['À la tienne !', b('Cheers! (informal)', 'toast amical')]],
  ),
  lesson(C, 3, ['splitting-the-bill-with-friends', 'partager-l-addition'],
    b('Splitting the bill with friends', 'Partager l’addition entre amis'),
    b('Divide the bill fairly, offer to treat a friend and close the evening warmly.', 'Diviser la note justement, inviter un ami et conclure la soirée avec chaleur.'),
    [b('Split the bill evenly or by person', 'Diviser la note ou payer chacun sa part'), b('Offer to pay for coffee or dessert', 'Offrir le café ou le dessert'), b('Thank and wrap up the meal', 'Remercier et conclure le repas')],
    13,
    [
      card(b('Sorting out the bill', 'Régler l’addition ensemble'), b('**On divise l’addition en quatre ? · On fait moitié-moitié ? · Chacun paie ce qu’il a pris.** Offering: **C’est moi qui invite pour le café ! · Laisse, le dessert est pour moi !** Tip: **On laisse deux euros chacun de pourboire ?**', '**On divise l’addition en quatre ? · On fait moitié-moitié ? · Chacun paie ce qu’il a pris.** Inviter : **C’est moi qui invite pour le café ! · Laisse, le dessert est pour moi !** Pourboire : **On laisse deux euros chacun de pourboire ?**'), {
        ex: [['On fait moitié-moitié ? Ça fera vingt-quatre euros chacun.', 'Shall we go halves? That’ll be twenty-four euros each.'], ['Laisse, le café est pour moi ce soir !', 'Leave it, coffee’s on me tonight!']],
      }),
      dlg(b('At the end of dinner', 'En fin de repas'), undefined, [['Marc', 'm'], ['Vous', 'f']], [
        [0, 'L’addition fait soixante-douze euros. On divise par trois ?', 'The bill is seventy-two euros. Shall we split it by three?'],
        [1, { options: ['Oui, vingt-quatre euros chacun ! Et je laisse un petit pourboire pour le serveur.', 'Non, tu paies tout.', 'Soixante-douze pour toi.'] }],
        [0, 'Super ! Attends, je paie les cafés à part, c’est ton anniversaire.', 'Great! Wait, I’ll pay for the coffees separately, it’s your birthday.'],
        [1, { options: ['Oh, merci beaucoup Marc, c’est très gentil ! On a passé une super soirée.', 'Normal.', 'Donne aussi le dessert.'] }],
      ]),
      mc(P.best, ['Laisse, le dessert est pour moi ce soir, c’est ton anniversaire !', 'Paie ton dessert.', 'Tu me dois de l’argent maintenant.', 'Je ne mange pas de gâteau.'], { fr: 'Vous voulez offrir le dessert à votre ami :' }),
      gap(P.complete, 'L’addition fait soixante euros : on ___ par trois ou chacun ___ ce qu’il a pris ?', ['divise', 'paie'], { choices: [['divise', 'laisse', 'mange'], ['paie', 'goûte', 'trinque']] }),
      flash(b('Quick revision', 'Révision express'), [['Tu veux goûter ?', b('Want a taste?', 'proposer de partager')], ['À la tienne, santé !', b('Cheers, to your health!', 'trinquer entre amis')], ['C’est un vrai régal !', b('It’s a real treat!', 'plat délicieux')], ['On divise l’addition en quatre ?', b('Shall we split the bill four ways?', 'partager à parts égales')], ['Laisse, le café est pour moi !', b('Leave it, coffee is on me!', 'offrir à quelqu’un')]]),
      dict('C’était délicieux ! On partage en deux et on laisse un petit pourboire ?', { voice: 'f' }),
      say('On divise par trois et je paie les cafés, ça vous va ?', 'Shall we split it three ways and I’ll pay for the coffees, does that suit you?'),
    ],
    [
      b('On fait moitié-moitié ? · On divise par trois / quatre ?', 'On fait moitié-moitié ? · On divise par trois / quatre ?'),
      b('C’est moi qui invite ! · Laisse, c’est pour moi !', 'C’est moi qui invite ! · Laisse, c’est pour moi !'),
      b('On a passé une super soirée !', 'On a passé une super soirée !'),
    ],
    [['moitié-moitié', b('fifty-fifty, halves', 'partagé en deux parts égales')], ['diviser', b('to divide, split', 'partager une somme')], ['inviter', b('to treat someone (pay for them)', 'payer pour quelqu’un')]],
  ),
];
