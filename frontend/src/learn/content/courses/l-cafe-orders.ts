import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, P, pairs, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ordering a coffee, catching the daily special or hearing the price at a busy market stall happens fast in French. Staff speak naturally, use polite shortcuts and string numbers together without pausing. This course trains your ear on authentic café counters and open-air markets so you catch orders, weights, prices and polite exchanges on the first listen.',
    'Commander un café, saisir le plat du jour ou entendre le prix sur un marché animé va vite en français. Les commerçants parlent à rythme naturel, emploient des raccourcis polis et enchaînent les chiffres sans pause. Ce cours entraîne votre oreille au comptoir des cafés et aux étals des marchés pour capter commandes, poids, prix et formules de politesse dès la première écoute.',
  ),
  outcomes: [
    b('Catch drink, pastry and daily-special orders', 'Saisir les commandes de boissons, viennoiseries et plats du jour'),
    b('Understand market weights, portions and ripeness cues', 'Comprendre les poids, portions et indications de maturité au marché'),
    b('Hear prices and change accurately in euros and cents', 'Entendre les prix et la monnaie avec précision'),
    b('Follow quick, polite counter exchanges', 'Suivre les échanges polis et rapides au comptoir'),
  ],
};

const C = 'l-cafe-orders';
export default [
  lesson(C, 1, ['ordering-at-the-cafe', 'commander-au-cafe'],
    b('At the café counter', 'Au comptoir du café'),
    b('Understand barista questions, coffee sizes, pastries and table service.', 'Comprendre les questions du serveur, les formats de café et le service en salle.'),
    [b('Catch café drink and pastry items', 'Repérer boissons et viennoiseries'), b('Distinguish sur place and à emporter', 'Distinguer sur place et à emporter'), b('Understand polite counter offers', 'Comprendre les propositions polies au comptoir')],
    13,
    [
      card(b('Café counter essentials', 'L’essentiel au comptoir'), b('At the counter, listen for key phrases: **Je vous écoute** (I’m listening), **Un allongé** (an americano), **Un café crème** (coffee with steamed milk), **Avec du lait d’avoine ?** (with oat milk?), **Sur place ou à emporter ?** (here or to go?).', 'Au comptoir, repérez les formules clés : **Je vous écoute**, **Un allongé**, **Un café crème**, **Avec du lait d’avoine ?**, **Sur place ou à emporter ?**.'), {
        ex: [['Bonjour ! Je vous écoute.', 'Hello! What can I get you?'], ['Un croissant et un allongé, sur place ?', 'A croissant and a long coffee, to drink here?']],
      }),
      hear('Bonjour ! Je vous écoute : ce sera pour manger ici ou à emporter ?', b('What does the server ask?', 'Que demande le serveur ?'), [b('Whether you are eating here or taking away', 'Si vous mangez ici ou à emporter'), b('Whether you want sugar', 'Si vous voulez du sucre'), b('How you would like to pay', 'Comment vous souhaitez payer'), b('What table number you have', 'Quel est votre numéro de table')], { voice: 'm' }),
      hear('Désolée, on n’a plus de pains au chocolat, mais il reste des croissants chauds.', b('What is still available?', 'Qu’est-ce qu’il reste ?'), [b('Warm croissants', 'Des croissants chauds'), b('Chocolate pastries', 'Des pains au chocolat'), b('Apple tarts', 'Des tartes aux pommes'), b('Cold sandwiches', 'Des sandwiches froids')], { voice: 'f' }),
      dlg(b('Morning order', 'Commande du matin'), b('You step up to a Parisian café counter.', 'Vous arrivez au comptoir d’un café parisien.'), [['Serveuse', 'f2'], ['Vous', 'm']], [
        [0, 'Bonjour ! Qu’est-ce que je vous sers ce matin ?', 'Hello! What can I get you this morning?'],
        [1, { options: ['Un café crème et un croissant, s’il vous plaît.', 'Oui, un café est chaud.', 'Bonjour, vous êtes un croissant.'] }],
        [0, 'Très bien. Vous prenez un verre d’eau avec ?', 'Very well. Would you like a glass of water with that?'],
        [1, { options: ['Oui, volontiers, merci beaucoup.', 'Non, je prends le comptoir.', 'Je bois la table.'] }],
        [0, 'Ça marche, je vous apporte ça tout de suite.', 'Got it, I’ll bring that right over.'],
      ]),
      sort(b('Drink/food or service question?', 'Produit ou question de service ?'), [b('food or drink', 'boisson ou plat'), b('service question', 'question de service')], [['un café allongé', 0], ['Sur place ou à emporter ?', 1], ['une tartine beurrée', 0], ['Avec du sucre ?', 1], ['un jus pressé', 0], ['Vous avez choisi ?', 1]], { listen: true }),
      pairs(P.match, [['un café allongé', b('a long black coffee', 'café noir avec plus d’eau')], ['un verre d’eau', b('a glass of water', 'eau servie au verre')], ['volontiers', b('gladly, yes please', 'avec plaisir')], ['il reste…', b('there are … left', 'il y en a encore')]]),
      dict('Un café crème et deux croissants chauds, s’il vous plaît.', { voice: 'f2' }),
    ],
    [
      b('Je vous écoute / Qu’est-ce que je vous sers ? open the order.', 'Je vous écoute / Qu’est-ce que je vous sers ? lancent la commande.'),
      b('Il n’y a plus de… = sold out; il reste… = still available.', 'Il n’y a plus de… = épuisé ; il reste… = encore disponible.'),
      b('Volontiers = gladly, yes please.', 'Volontiers = oui, avec plaisir.'),
    ],
    [['un café allongé', b('a long black coffee', 'expresso allongé d’eau')], ['une tartine', b('a slice of bread with butter or jam', 'tranche de pain garnie')], ['volontiers', b('gladly', 'avec plaisir')]],
  ),
  lesson(C, 2, ['market-specials-and-weights', 'marche-plats-et-quantites'],
    b('At the market stall', 'À l’étal du marché'),
    b('Catch weights, seasonal specials and ripeness questions from market vendors.', 'Saisir les poids, produits de saison et questions de maturité au marché.'),
    [b('Understand kilos, half-kilos and portions', 'Comprendre kilos, demi-kilos et barquettes'), b('Hear ripeness questions (pour aujourd’hui ?)', 'Entendre les questions sur la maturité'), b('Recognise daily market specials', 'Reconnaître les offres du jour')],
    13,
    [
      tip(b('Weights and ripeness', 'Poids et maturité'), b('At the market, vendors ask **Combien vous en voulez ?** (How much do you want?) and **C’est pour manger aujourd’hui ?** (Is it to eat today?) so they can pick ripe fruit (**bien mûr**) or firmer ones (**un peu moins mûr**). Listen for **un demi-kilo** (500 g), **une barquette** (a punnet), **une tranche** (a slice).', 'Au marché, on demande **Combien vous en voulez ?** et **C’est pour manger aujourd’hui ?** pour choisir des fruits **bien mûrs** ou **un peu plus fermes**. Repérez **un demi-kilo** (500 g), **une barquette**, **une tranche**.'), {
        ex: [['Une barquette de fraises bien mûres.', 'A punnet of ripe strawberries.'], ['Un demi-kilo de tomates, pour ce soir ?', 'Half a kilo of tomatoes, for tonight?']],
      }),
      hear('Aujourd’hui, j’ai de belles pêches de saison : c’est pour manger tout de suite ou dans deux jours ?', b('Why does the vendor ask when you will eat the peaches?', 'Pourquoi le vendeur demande-t-il quand vous mangerez les pêches ?'), [b('To choose ripe or firmer fruit for you', 'Pour choisir des fruits mûrs ou plus fermes'), b('Because the stall closes in two days', 'Parce que l’étal ferme dans deux jours'), b('To change the price per kilo', 'Pour changer le prix au kilo'), b('Because he only sells apples', 'Parce qu’il ne vend que des pommes')], { voice: 'm2' }),
      hear('Je vous mets un beau morceau de comté : quatre cents grammes, ça vous va ?', b('What does the cheesemonger ask?', 'Que demande le fromager ?'), [b('If 400 grams of cheese is the right amount', 'Si 400 grammes de fromage vous conviennent'), b('If you want four different cheeses', 'Si vous voulez quatre fromages différents'), b('If you want the cheese sliced thin', 'Si vous voulez des tranches fines'), b('If you already paid four euros', 'Si vous avez déjà payé quatre euros')], { voice: 'f' }),
      hear('Avec les deux melons, je vous ajoute une petite botte de basilic, c’est offert !', b('What bonus does the vendor offer?', 'Quel petit plus offre la vendeuse ?'), [b('A free bunch of basil', 'Une botte de basilic offerte'), b('A third melon at half price', 'Un troisième melon à moitié prix'), b('A free plastic bag', 'Un sac gratuit'), b('A recipe card', 'Une fiche recette')], { voice: 'f2' }),
      sort(b('Quantity or quality?', 'Quantité ou qualité ?'), [b('quantity / weight', 'quantité / poids'), b('quality / ripeness', 'qualité / maturité')], [['un demi-kilo', 0], ['bien mûr', 1], ['une barquette', 0], ['de saison', 1], ['trois cents grammes', 0], ['très sucré', 1]], { listen: true }),
      pairs(P.match, [['un demi-kilo', b('half a kilo (500 g)', 'cinq cents grammes')], ['une barquette', b('a small punnet or tray', 'petite boîte pour fruits')], ['bien mûr', b('nice and ripe', 'prêt à manger')], ['c’est offert', b('it’s on the house, free', 'gratuit, cadeau')]]),
      dict('Je voudrais un demi-kilo de fraises et une tranche de fromage.', { voice: 'm' }),
    ],
    [
      b('un demi-kilo = 500 g; une barquette = a punnet; une botte = a bunch.', 'un demi-kilo = 500 g ; une barquette ; une botte.'),
      b('C’est pour aujourd’hui ? lets the vendor pick the right ripeness.', 'C’est pour aujourd’hui ? sert à choisir la bonne maturité.'),
      b('C’est offert = free / complimentary.', 'C’est offert = gratuit.'),
    ],
    [['une barquette', b('a punnet, tray', 'petit contenant de fruits')], ['bien mûr', b('nice and ripe', 'prêt à être mangé')], ['une botte', b('a bunch (herbs, carrots)', 'petit bouquet lié')]],
  ),
  lesson(C, 3, ['prices-change-and-politeness', 'prix-monnaie-et-politesse'],
    b('Prices, change and polite exchanges', 'Prix, monnaie et échanges polis'),
    b('Catch prices in natural speech, daily specials and polite farewells.', 'Saisir les prix à l’oral naturel, les formules du jour et les salutations.'),
    [b('Hear prices with euros and cents', 'Entendre les prix en euros et centimes'), b('Catch lunch specials (la formule)', 'Comprendre la formule du midi'), b('Respond politely at payment', 'Répondre poliment au paiement')],
    13,
    [
      card(b('Hearing prices smoothly', 'Entendre les prix sans hésiter'), b('In France, prices drop the word **centimes**: **quatre euros cinquante** = 4,50 €; **douze euros quatre-vingts** = 12,80 €. Also listen for **la formule du midi** (lunch combo), **vous avez l’appoint ?** (do you have exact change?), and **sans contact** (tap/contactless).', 'En France, on omet souvent le mot **centimes** : **quatre euros cinquante** = 4,50 € ; **douze euros quatre-vingts** = 12,80 €. Repérez aussi **la formule du midi**, **vous avez l’appoint ?** et **sans contact**.'), {
        ex: [['Ça vous fait huit euros quarante.', 'That comes to €8.40.'], ['La formule plat et café est à quinze euros.', 'The main + coffee combo is €15.']],
      }),
      trap(b('Quatre-vingts vs quatre euros vingt', 'Quatre-vingts ou quatre euros vingt'), b('Listen for where **euros** falls! **Quatre euros vingt** = 4,20 €, while **quatre-vingts** (80) after euros means cents: **six euros quatre-vingts** = 6,80 €.', 'Repérez où tombe le mot **euros** ! **Quatre euros vingt** = 4,20 €, alors que **six euros quatre-vingts** = 6,80 €.')),
      hear('Alors, pour les deux cafés et la tarte au citron, ça vous fait neuf euros soixante-dix.', b('How much do you owe?', 'Combien devez-vous payer ?'), ['9,70 €', '9,17 €', '19,70 €', '7,90 €'], { voice: 'f' }),
      hear('Excusez-moi, je n’ai plus de monnaie : vous avez l’appoint ou vous préférez payer par carte ?', b('What does the vendor ask?', 'Que demande le commerçant ?'), [b('If you have exact change or can pay by card', 'Si vous avez la monnaie exacte ou payez par carte'), b('If you want a paper bag', 'Si vous voulez un sac en papier'), b('If you forgot your wallet', 'Si vous avez oublié votre portefeuille'), b('If you want a receipt for work', 'Si vous voulez un justificatif')], { voice: 'm' }),
      dlg(b('Paying at the bistro', 'Régler au bistrot'), b('You are paying for lunch at a neighbourhood café.', 'Vous réglez votre déjeuner dans un café de quartier.'), [['Serveur', 'm2'], ['Vous', 'f']], [
        [0, 'Vous avez pris la formule plat et dessert, c’est bien ça ?', 'You had the main and dessert combo, right?'],
        [1, 'Oui, exactement, plus une eau pétillante.', 'Yes, exactly, plus a sparkling water.'],
        [0, 'Parfait. Ça fait dix-huit euros cinquante. Vous réglez comment ?', 'Perfect. That’s 18.50 euros. How are you paying?'],
        [1, { options: ['Par carte, sans contact, s’il vous plaît.', 'Par l’appoint, merci la table.', 'Je mange dix-huit euros.'] }],
        [0, 'Allez-y, posez votre carte. Bonne fin de journée !', 'Go ahead, tap your card. Have a nice rest of the day!'],
      ]),
      pairs(P.match, [['l’appoint', b('exact change', 'somme exacte en pièces et billets')], ['la formule du midi', b('the lunch set menu', 'menu combiné du déjeuner')], ['ça vous fait…', b('that comes to…', 'le total est de…')], ['bonne fin de journée', b('have a nice rest of the day', 'formule de départ polie')]]),
      dict('Ça vous fait douze euros quarante, s’il vous plaît.', { voice: 'f2' }),
    ],
    [
      b('Drop of centimes: neuf euros soixante-dix = €9.70.', 'On omet centimes : neuf euros soixante-dix = 9,70 €.'),
      b('Listen for where euros sits in the phrase (4,20 € vs 6,80 €).', 'Repérez la place du mot euros (4,20 € contre 6,80 €).'),
      b('l’appoint = exact change; sans contact = contactless.', 'l’appoint = somme exacte ; sans contact = paiement par carte posée.'),
    ],
    [['l’appoint', b('exact change', 'monnaie exacte')], ['la monnaie', b('change, coins', 'pièces rendues')], ['une formule', b('a set combo', 'menu à prix fixe')]],
  ),
];
