import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Whether you are stretching a tight budget, splitting the bill, or hunting for a bargain, French speakers rely on vivid idioms for money and value. This A2 course teaches 15 everyday expressions—from être fauché and joindre les deux bouts to jeter l’argent par les fenêtres and valoir son pesant d’or—through authentic dialogues, listening drills, and guided writing.',
    'Que l’on serre son budget, que l’on partage l’addition ou que l’on cherche une bonne affaire, le français regorge d’expressions imagées sur l’argent et la valeur. Ce cours A2 vous fait pratiquer 15 tournures indispensables — d’être fauché et joindre les deux bouts à jeter l’argent par les fenêtres et valoir son pesant d’or — dans des situations concrètes.',
  ),
  outcomes: [
    b('Talk naturally about being broke, earning a living, and wealth', 'Parler avec naturel de manque d’argent, de salaire et de richesse'),
    b('Discuss saving, tight budgets, and splitting costs fairly', 'Évoquer l’épargne, les fins de mois et le partage des frais'),
    b('Evaluate bargains, overspending, and true value in French', 'Commenter les bonnes affaires, les dépenses excessives et la vraie valeur'),
  ],
};

const C = 'exp-money-shopping-value';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['broke-vs-rich', 'fauche-ou-riche'],
    b('Being broke vs. rolling in it', 'Être fauché ou rouler sur l’or'),
    b('Describe empty pockets, great wealth, and earning a living with five core money expressions.', 'Parler de poches vides, de grande richesse et de revenus avec cinq expressions courantes.'),
    [
      b('Say you are broke with être fauché, être à sec, and n’avoir pas un sou', 'Dire qu’on n’a plus d’argent avec être fauché, être à sec et n’avoir pas un sou'),
      b('Describe wealth and livelihoods with rouler sur l’or and gagner sa vie', 'Décrire la richesse et le travail avec rouler sur l’or et gagner sa vie'),
      b('Match casual and neutral registers for talking about money', 'Adapter le registre familier ou courant quand on parle d’argent'),
    ],
    13,
    [
      card(
        b('Empty pockets, gold, and earning a living', 'Poches vides, or et salaire'),
        b(
          'French has colourful expressions for both ends of the bank balance—whether you are waiting for payday or living in luxury.\n\nOut of money: **être fauché, être à sec, n’avoir pas un sou**.\nWealth & income: **rouler sur l’or, gagner sa vie**.',
          'Le français possède des images parlantes pour décrire les deux extrêmes du compte en banque, de la fin de mois difficile à la grande fortune.\n\nÀ court d’argent : **être fauché, être à sec, n’avoir pas un sou**.\nRichesse et revenu : **rouler sur l’or, gagner sa vie**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal picture', 'Image littérale'), b('Meaning', 'Sens réel')],
            rows: [
              ['être fauché', b('to be mown down', 'être fauché comme un pré'), b('to be broke (informal)', 'ne plus avoir d’argent (familier)')],
              ['rouler sur l’or', b('to roll on gold', 'rouler sur l’or'), b('to be rolling in money', 'être extrêmement riche')],
              ['n’avoir pas un sou', b('not to have a sou coin', 'ne pas avoir un seul sou'), b('not to have a penny', 'n’avoir absolument rien')],
              ['être à sec', b('to be dry', 'être à sec'), b('to be completely tapped out', 'être totalement sans argent')],
              ['gagner sa vie', b('to earn one’s life', 'gagner sa vie'), b('to earn a living', 'travailler pour vivre')],
            ],
          },
          ex: [
            ['En fin de mois, je suis souvent fauché avant le virement du salaire.', 'At the end of the month, I am often broke before payday.'],
            ['Mon voisin ne roule pas sur l’or, mais il gagne bien sa vie.', 'My neighbour isn’t rolling in gold, though he earns a good living.'],
            ['Après l’achat des meubles, nous sommes complètement à sec.', 'After buying the furniture, we are completely tapped out.'],
          ],
        },
      ),
      culture(
        b('What is « un sou »—and how do you conjugate « n’avoir pas un sou »?', 'Qu’est-ce qu’un « sou » et comment conjuguer l’expression ?'),
        b(
          'Long before the euro and the franc, **le sou** was a small French coin—still alive in **Je n’ai pas un sou** (*I don’t have a penny*) and **être sans le sou**. Note that in everyday conversation, speakers wrap **n’… pas** around the conjugated verb: **Je n’ai pas un sou** / **Il n’a pas un sou**. And **fauché(e)** agrees with the subject: *elle est fauchée*.',
          'Bien avant l’euro et le franc, **le sou** était une petite pièce de monnaie — toujours vivante dans **Je n’ai pas un sou** et **être sans le sou**. En phrase conjuguée, **n’… pas** encadre le verbe : **Je n’ai pas un sou** / **Il n’a pas un sou**. Pensez aussi à accorder **fauché(e)** : *elle est fauchée*.',
        ),
      ),
      flash(
        b('Five money status idioms', 'Cinq expressions sur sa situation financière'),
        [
          ['être fauché', b('to be broke (informal)', 'ne plus avoir d’argent (familier)')],
          ['rouler sur l’or', b('to be rolling in money', 'être très riche')],
          ['n’avoir pas un sou', b('not to have a penny', 'ne pas avoir le moindre argent')],
          ['être à sec', b('to be completely out of cash', 'n’avoir plus aucune réserve')],
          ['gagner sa vie', b('to earn a living', 'travailler pour subvenir à ses besoins')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('They are not extremely rich.', 'Ils ne sont pas extrêmement riches.'),
          b('They hate wearing gold jewellery.', 'Ils n’aiment pas porter de bijoux en or.'),
          b('They have lost their car keys on the road.', 'Ils ont perdu leurs clés sur la route.'),
          b('They prefer paying by card instead of coins.', 'Ils paient toujours par carte bancaire.'),
        ],
        {
          fr: 'Mes parents sont généreux, même s’ils ne roulent pas sur l’or.',
          explain: b('« Rouler sur l’or » means being wealthy; « ne pas rouler sur l’or » means having modest or normal means.', '« Rouler sur l’or » signifie être très riche ; à la forme négative, cela indique des moyens modestes ou normaux.'),
        },
      ),
      mc(
        P.complete,
        [
          'suis complètement fauchée',
          'roule sur l’or',
          'gagne ma vie en dormant',
          'jette mon or par la fenêtre',
        ],
        {
          fr: 'Désolée, je ne peux pas venir au restaurant ce soir : je ___ jusqu’à vendredi !',
          explain: b('Waiting until payday because you are out of money = être fauché(e).', 'Ne pas pouvoir sortir faute d’argent avant la paie = être fauché(e).'),
        },
      ),
      pairs(
        P.match,
        [
          ['être fauché', b('to be broke (informal)', 'ne plus avoir d’argent (familier)')],
          ['rouler sur l’or', b('to be rolling in money', 'être très riche')],
          ['n’avoir pas un sou', b('not to have a penny', 'ne pas avoir le moindre argent')],
          ['être à sec', b('to be completely out of cash', 'n’avoir plus aucune réserve')],
          ['gagner sa vie', b('to earn a living', 'travailler pour subvenir à ses besoins')],
        ],
      ),
      gap(
        P.complete,
        'Tu ___ bien ___ comme photographe ? — Je ne ___ pas sur l’or, mais j’ai assez pour vivre sans jamais ___ à sec.',
        [['gagnes'], ['ta vie'], ['roule'], ['être']],
        {
          choices: [
            ['gagnes', 'perds', 'coupes'],
            ['ta vie', 'un sou', 'une poire'],
            ['roule', 'suis', 'fais'],
            ['être', 'avoir', 'mettre'],
          ],
          explain: b('Do you earn a good living (gagnes bien ta vie)? I’m not rolling in gold (roule sur l’or), without being tapped out (être à sec).', '« Tu gagnes bien ta vie ? Je ne roule pas sur l’or, sans être à sec. »'),
        },
      ),
      hear(
        'Après avoir payé les billets d’avion et l’hôtel, Lucas n’avait plus un sou en poche pour acheter des souvenirs.',
        b('What was Lucas’s situation after paying for his trip?', 'Quelle était la situation de Lucas après avoir payé son voyage ?'),
        [
          b('He had no money left at all', 'Il n’avait plus aucun argent sur lui'),
          b('He had plenty of cash for souvenirs', 'Il lui restait beaucoup d’argent pour des cadeaux'),
          b('He got a free upgrade at the hotel', 'Il a obtenu une chambre gratuite à l’hôtel'),
        ],
      ),
      dict('Je ne roule pas sur l’or, mais je gagne honnêtement ma vie.'),
      say('En fin de mois, je suis souvent à sec avant la paie.', 'At the end of the month, I am often tapped out before payday.'),
    ],
    [
      b('être fauché, être à sec, n’avoir pas un sou = to be broke / penniless.', 'être fauché, être à sec, n’avoir pas un sou = ne plus avoir d’argent.'),
      b('rouler sur l’or = to be rolling in money.', 'rouler sur l’or = être très riche.'),
      b('gagner sa vie = to earn a living.', 'gagner sa vie = travailler pour subvenir à ses besoins.'),
    ],
    [
      ['être fauché', b('to be broke (informal)', 'ne plus avoir d’argent (familier)')],
      ['rouler sur l’or', b('to be rolling in money', 'être très riche')],
      ['n’avoir pas un sou', b('not to have a penny', 'ne pas avoir le moindre argent')],
      ['être à sec', b('to be completely out of cash', 'n’avoir plus aucune réserve')],
      ['gagner sa vie', b('to earn a living', 'travailler pour subvenir à ses besoins')],
    ],
  ),

  lesson(
    C,
    2,
    ['saving-and-budgets', 'epargne-et-budget'],
    b('Tightening the belt & splitting the cost', 'Se serrer la ceinture et partager'),
    b('Talk about tight budgets, saving up for projects, and splitting costs fairly in French.', 'Parler de budget serré, d’épargne et de compromis financier en français.'),
    [
      b('Describe tight monthly budgets with se serrer la ceinture and joindre les deux bouts', 'Décrire un budget serré avec se serrer la ceinture et joindre les deux bouts'),
      b('Talk about saving up using mettre de l’argent de côté and faire des économies', 'Parler d’épargne avec mettre de l’argent de côté et faire des économies'),
      b('Negotiate a fair 50/50 split with couper la poire en deux', 'Négocier un partage équitable avec couper la poire en deux'),
    ],
    13,
    [
      card(
        b('Managing a budget and reaching a compromise', 'Gérer son budget et trouver un terrain d’entente'),
        b(
          'These five expressions cover the everyday reality of watching your spending, building savings, and splitting a cost down the middle.\n\nTight budgets: **se serrer la ceinture, joindre les deux bouts**.\nSaving & sharing: **mettre de l’argent de côté, faire des économies, couper la poire en deux**.',
          'Ces cinq tournures couvrent le quotidien de la gestion d’argent : réduire ses dépenses, boucler le mois, épargner et partager une somme en deux.\n\nBudget serré : **se serrer la ceinture, joindre les deux bouts**.\nÉpargne et partage : **mettre de l’argent de côté, faire des économies, couper la poire en deux**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal picture', 'Image littérale'), b('Meaning', 'Sens réel')],
            rows: [
              ['se serrer la ceinture', b('tighten one’s belt', 'serrer sa ceinture'), b('to tighten one’s belt, cut back', 'réduire ses dépenses')],
              ['joindre les deux bouts', b('join the two ends', 'faire toucher les deux bouts'), b('to make ends meet', 'boucler le budget du mois')],
              ['mettre de l’argent de côté', b('put money to the side', 'garder de l’argent à part'), b('to put money aside, save up', 'épargner pour plus tard')],
              ['faire des économies', b('make savings', 'économiser'), b('to save money', 'dépenser moins, épargner')],
              ['couper la poire en deux', b('cut the pear in two', 'partager la poire en deux'), b('to split the difference', 'partager à parts égales, faire un compromis')],
            ],
          },
          ex: [
            ['Avec la hausse du loyer, il faut se serrer la ceinture ce trimestre.', 'With the rent increase, we have to tighten our belts this quarter.'],
            ['Chaque mois, je mets cent euros de côté pour mes vacances.', 'Every month, I put a hundred euros aside for my holidays.'],
            ['Tu proposes quarante euros, j’en veux soixante : coupons la poire en deux à cinquante !', 'You offer forty euros, I want sixty: let’s split the difference at fifty!'],
          ],
        },
      ),
      trap(
        b('False friend: « faire des économies » ≠ economics!', 'Faux ami : « faire des économies » ≠ étudier l’économie !'),
        b(
          '**Faire des économies** ALWAYS means *to save money* (by spending less or setting cash aside)—whereas studying economics at university is **faire de l’économie** (singular) or **étudier les sciences économiques**. Also remember **couper la poire en deux** is used both for splitting a price AND for finding a middle-ground compromise in any disagreement.',
          '**Faire des économies** (au pluriel) veut TOUJOURS dire *économiser de l’argent* — alors que la matière scolaire est **l’économie** (au singulier). De plus, **couper la poire en deux** s’emploie aussi bien pour négocier un prix que pour trouver un compromis dans n’importe quelle discussion.',
        ),
      ),
      flash(
        b('Five budgeting and saving idioms', 'Cinq expressions de budget et d’épargne'),
        [
          ['se serrer la ceinture', b('to tighten one’s belt, cut spending', 'réduire ses dépenses')],
          ['joindre les deux bouts', b('to make ends meet', 'équilibrer son budget')],
          ['mettre de l’argent de côté', b('to put money aside', 'épargner une somme')],
          ['faire des économies', b('to save money', 'dépenser moins pour épargner')],
          ['couper la poire en deux', b('to split the difference, compromise', 'partager également ou transiger')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('She struggles to pay all her bills until the end of the month.', 'Elle a du mal à payer toutes ses charges jusqu’à la fin du mois.'),
          b('She ties two shoelaces together before going jogging.', 'Elle attache ses lacets avant d’aller courir.'),
          b('She saves half of her salary effortlessly every month.', 'Elle épargne la moitié de son salaire sans effort.'),
          b('She buys two identical coats at the same shop.', 'Elle achète deux manteaux identiques.'),
        ],
        {
          fr: 'Avec deux enfants et un petit salaire, elle peine parfois à joindre les deux bouts.',
          explain: b('« Joindre les deux bouts » means managing to cover living costs from one paycheque to the next.', '« Joindre les deux bouts » signifie réussir à payer ses dépenses jusqu’à la fin du mois.'),
        },
      ),
      mc(
        P.complete,
        [
          'couper la poire en deux',
          'joindre les deux bouts',
          'serrer la ceinture',
          'rouler sur l’or',
        ],
        {
          fr: 'Pour la réparation du mur entre nos deux jardins, nous allons ___ et payer chacun la moitié.',
          explain: b('Sharing a cost 50/50 or meeting halfway = couper la poire en deux.', 'Partager les frais à égalité ou trouver un compromis = couper la poire en deux.'),
        },
      ),
      sort(
        b('Sort each expression by its focus.', 'Classez chaque expression selon son idée principale.'),
        [
          b('Tight budget & cutting back', 'Budget serré et restriction'),
          b('Saving up or sharing fairly', 'Épargne ou partage équitable'),
        ],
        [
          ['se serrer la ceinture', 0],
          ['mettre de l’argent de côté', 1],
          ['joindre les deux bouts', 0],
          ['couper la poire en deux', 1],
          ['avoir du mal à finir le mois', 0],
          ['faire des économies', 1],
        ],
      ),
      gap(
        P.complete,
        'Pour acheter une voiture l’an prochain, nous devons faire des ___ et mettre de l’argent de ___ dès maintenant.',
        [['économies'], ['côté']],
        {
          tr: 'To buy a car next year, we need to save money and put money aside starting right now.',
          hint: b('Plural noun for “savings” in the first blank, and “side” in the second.', 'Nom pluriel dans le premier trou, puis le mot pour « side » dans le second.'),
        },
      ),
      ord(
        P.order,
        'Chaque mois, ils mettent un peu d’argent de côté.',
        {
          tr: 'Every month, they put a little money aside.',
          extra: ['ceinture', 'poire'],
        },
      ),
      hear(
        'Le vendeur demandait trois cents euros pour ce bureau ancien, j’en proposais deux cents, alors nous avons coupé la poire en deux à deux cent cinquante.',
        b('How much did they agree on for the desk?', 'Quel prix ont-ils finalement convenu pour le bureau ?'),
        [
          b('Two hundred and fifty euros', 'Deux cent cinquante euros'),
          b('Three hundred euros', 'Trois cents euros'),
          b('Two hundred euros', 'Deux cents euros'),
        ],
        { voice: 'm' },
      ),
      say('Je dois me serrer la ceinture ce mois-ci pour faire des économies.', 'I have to tighten my belt this month to save money.'),
    ],
    [
      b('se serrer la ceinture = cut spending; joindre les deux bouts = make ends meet.', 'se serrer la ceinture = limiter ses dépenses ; joindre les deux bouts = boucler son budget.'),
      b('mettre de l’argent de côté / faire des économies = save money (plural économies!).', 'mettre de l’argent de côté / faire des économies = épargner.'),
      b('couper la poire en deux = split the difference or reach a 50/50 compromise.', 'couper la poire en deux = partager en deux ou trouver un compromis.'),
    ],
    [
      ['se serrer la ceinture', b('to tighten one’s belt, cut spending', 'réduire ses dépenses')],
      ['joindre les deux bouts', b('to make ends meet', 'équilibrer son budget')],
      ['mettre de l’argent de côté', b('to put money aside', 'épargner une somme')],
      ['faire des économies', b('to save money', 'dépenser moins pour épargner')],
      ['couper la poire en deux', b('to split the difference, compromise', 'partager également ou transiger')],
    ],
  ),

  lesson(
    C,
    3,
    ['spending-and-value', 'depenses-et-valeur'],
    b('Spending, bargains & worth', 'Dépenses, bonnes affaires et vraie valeur'),
    b('Talk about wasting money, paying top price, spotting great bargains, and knowing what is truly worth it.', 'Parler de gaspillage, de prix fort, de bonnes affaires et de rapport qualité-prix.'),
    [
      b('Criticise waste and high tariffs with jeter l’argent par les fenêtres and payer le prix fort', 'Critiquer le gaspillage et les prix élevés avec jeter l’argent par les fenêtres et payer le prix fort'),
      b('Praise great deals and value with faire une bonne affaire and en avoir pour son argent', 'Saluer un bon achat avec faire une bonne affaire et en avoir pour son argent'),
      b('Express priceless quality with valoir son pesant d’or in conversation and writing', 'Valoriser une qualité rare avec valoir son pesant d’or en dialogue et à l’écrit'),
    ],
    13,
    [
      card(
        b('Smart purchases vs. wasted money', 'Achats malins contre argent gaspillé'),
        b(
          'In shops, markets, and everyday life, French distinguishes clearly between paying too much, wasting cash, getting a bargain, and receiving real value.\n\nOverspending: **jeter l’argent par les fenêtres, payer le prix fort**.\nTrue worth & bargains: **valoir son pesant d’or, faire une bonne affaire, en avoir pour son argent**.',
          'Dans les magasins, aux marchés ou au quotidien, le français distingue nettement le gaspillage, le prix maximal, la trouvaille et le bon rapport qualité-prix.\n\nDépenses excessives : **jeter l’argent par les fenêtres, payer le prix fort**.\nJuste valeur et bonnes affaires : **valoir son pesant d’or, faire une bonne affaire, en avoir pour son argent**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens réel'), b('Example', 'Exemple')],
            rows: [
              ['jeter l’argent par les fenêtres', b('throw money out the windows', 'dépenser sans compter ni réfléchir'), 'Acheter trois abonnements inutiles, c’est jeter l’argent par les fenêtres.'],
              ['valoir son pesant d’or', b('be worth its weight in gold', 'avoir une valeur exceptionnelle'), 'Ce dictionnaire de poche vaut son pesant d’or.'],
              ['payer le prix fort', b('to pay full / top price', 'payer le tarif maximal sans rabais'), 'En juillet, on paie souvent le prix fort pour les hôtels.'],
              ['faire une bonne affaire', b('to get a great bargain', 'acheter à un prix très avantageux'), 'J’ai trouvé ce vélo à moitié prix : j’ai fait une bonne affaire !'],
              ['en avoir pour son argent', b('to get your money’s worth', 'obtenir une qualité à la hauteur du prix'), 'Le billet est cher, mais on en a vraiment pour son argent.'],
            ],
          },
          ex: [
            ['En réservant la veille du départ, tu risques de payer le prix fort.', 'By booking the day before departure, you risk paying top price.'],
            ['Avec les soldes d’hiver, elle a fait une très bonne affaire sur son manteau.', 'With the winter sales, she got a really good deal on her coat.'],
            ['Le menu dégustation n’est pas donné, mais on en a pour son argent.', 'The tasting menu isn’t cheap, though you get your money’s worth.'],
          ],
        },
      ),
      tip(
        b('« Valoir son pesant d’or » works for people too!', '« Valoir son pesant d’or » s’emploie aussi pour les personnes !'),
        b(
          'You can use **valoir son pesant d’or** for a useful tool, a wise piece of advice—or even a reliable colleague or neighbour: *Un voisin comme Paul vaut son pesant d’or !* Note also that **en avoir pour son argent** always keeps the pronoun **en** and matches the possessive: *j’en ai pour mon argent*, *vous en avez pour votre argent*.',
          'On peut dire **valoir son pesant d’or** pour un objet précieux, un conseil utile, ou même une personne fiable : *Un collègue comme Paul vaut son pesant d’or !* Dans **en avoir pour son argent**, le pronom **en** reste fixe et le possessif s’accorde : *j’en ai pour mon argent*, *vous en avez pour votre argent*.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('Spending carelessly on useless things.', 'Dépenser inutilement sans compter.'),
          b('Cleaning windows to earn pocket money.', 'Nettoyer des vitres pour gagner un peu d’argent.'),
          b('Hiding cash safely inside the house.', 'Cacher son argent en sécurité chez soi.'),
          b('Comparing prices in five different shops.', 'Comparer les prix dans cinq boutiques.'),
        ],
        {
          fr: 'Changer de téléphone tous les six mois alors que l’ancien marche très bien, c’est jeter l’argent par les fenêtres !',
          explain: b('« Jeter l’argent par les fenêtres » means squandering money foolishly.', '« Jeter l’argent par les fenêtres » signifie gaspiller son argent.'),
        },
      ),
      pairs(
        P.match,
        [
          ['jeter l’argent par les fenêtres', b('to throw money out the window', 'gaspiller son argent')],
          ['valoir son pesant d’or', b('to be worth its weight in gold', 'avoir une valeur exceptionnelle')],
          ['payer le prix fort', b('to pay top / full price', 'payer très cher sans réduction')],
          ['faire une bonne affaire', b('to get a great bargain', 'acheter à un prix très avantageux')],
          ['en avoir pour son argent', b('to get one’s money’s worth', 'obtenir une qualité à la hauteur du prix')],
        ],
      ),
      hear(
        'L’entrée du musée coûte vingt euros, mais l’exposition dure trois heures avec audioguide compris : on en a vraiment pour son argent.',
        b('What does the speaker think of the twenty-euro ticket?', 'Que pense la personne du billet à vingt euros ?'),
        [
          b('The quality and duration make it well worth the price', 'La qualité et la durée justifient largement le prix'),
          b('Buying a ticket there is a waste of money', 'Acheter ce billet revient à jeter l’argent par les fenêtres'),
          b('She waited for a half-price discount at closing time', 'Elle a attendu une réduction à la fermeture'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Back from the flea market', 'De retour du marché aux puces'),
        b('Chloé shows Romain the armchair and jacket she bought this morning.', 'Chloé montre à Romain le fauteuil et la veste qu’elle a achetés ce matin.'),
        [['Chloé', 'f2'], ['Romain', 'm']],
        [
          [0, 'Regarde cette table en bois massif : je l’ai trouvée pour quarante euros au lieu de deux cents !', 'Look at this solid wood table: I found it for forty euros instead of two hundred!'],
          [1, {
            options: [
              'Bravo, tu as vraiment fait une bonne affaire ! Elle est en parfait état en plus.',
              'Dommage, tu as payé le prix fort pour du bois.',
              'Franchement, tu jettes l’argent par les fenêtres.',
            ],
            explain: b('Buying something in great condition for a fraction of the price = faire une bonne affaire.', 'Acheter un bel objet à prix très bas = faire une bonne affaire.'),
          }],
          [0, 'Oui, et j’ai aussi vu un vélo électrique neuf dans la boutique d’en face, mais là, il fallait payer le prix fort.', 'Yes, and I also saw a new e-bike in the shop across the street, though there you had to pay full price.'],
          [1, {
            options: [
              'Tu as bien fait d’attendre les soldes pour ne pas jeter l’argent par les fenêtres.',
              'Tu aurais dû être à sec tout de suite.',
              'C’est normal, le vélo vaut son pesant de pierre.',
            ],
            explain: b('Waiting for sales instead of overspending avoids jeter l’argent par les fenêtres.', 'Attendre les soldes évite de jeter l’argent par les fenêtres.'),
          }],
          [0, 'Exactement ! Et ce petit guide des brocantes que tu m’as prêté vaut son pesant d’or.', 'Exactly! And that little flea-market guide you lent me is worth its weight in gold.'],
        ],
      ),
      dict('En réservant tôt, on évite de payer le prix fort pendant l’été.'),
      write(
        b('A smart purchase—or a regret', 'Un bel achat ou un regret'),
        b('Write 30 to 60 words about something you bought recently (a bargain, a splurge, or saving up for it). Use at least two idioms from this course.', 'Écrivez 30 à 60 mots sur un achat récent (bonne affaire, dépense excessive ou épargne). Employez au moins deux expressions de ce cours.'),
        30,
        60,
        [
          b('At least two money or value idioms', 'Au moins deux expressions sur l’argent ou la valeur'),
          b('Clear contrast between price and quality', 'Lien clair entre prix et qualité'),
          b('Accurate French grammar and spelling', 'Grammaire et orthographe soignées'),
        ],
        'Pendant trois mois, j’ai mis de l’argent de côté pour changer mon vieux manteau. Hier, j’ai trouvé exactement le modèle que je voulais à moitié prix : j’ai fait une excellente affaire et j’en ai vraiment pour mon argent !',
        { phrases: ['mis de l’argent de côté', 'fait une bonne affaire', 'j’en ai pour mon argent'] },
      ),
    ],
    [
      b('jeter l’argent par les fenêtres = waste money; payer le prix fort = pay full/top price.', 'jeter l’argent par les fenêtres = gaspiller ; payer le prix fort = payer le maximum.'),
      b('faire une bonne affaire = get a bargain; en avoir pour son argent = get your money’s worth.', 'faire une bonne affaire = acheter à bon prix ; en avoir pour son argent = avoir la qualité attendue.'),
      b('valoir son pesant d’or = be worth its weight in gold (objects, advice, or people).', 'valoir son pesant d’or = avoir une valeur rare (objet, conseil ou personne).'),
    ],
    [
      ['jeter l’argent par les fenêtres', b('to throw money out the window', 'gaspiller son argent')],
      ['valoir son pesant d’or', b('to be worth its weight in gold', 'avoir une valeur exceptionnelle')],
      ['payer le prix fort', b('to pay top / full price', 'payer très cher sans réduction')],
      ['faire une bonne affaire', b('to get a great bargain', 'acheter à un prix très avantageux')],
      ['en avoir pour son argent', b('to get one’s money’s worth', 'obtenir une qualité à la hauteur du prix')],
    ],
  ),
];

export default lessons;
