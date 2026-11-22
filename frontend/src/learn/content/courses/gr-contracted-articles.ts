import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Stop saying *à le* or *de les* forever. Master French contracted articles (au, aux, du, des) across directions, activities, possession, partitive quantities, and negative sentences where partitives simplify to de or d’.',
    'Oubliez pour toujours *à le* et *de les*. Maîtrisez les articles contractés (au, aux, du, des) pour les lieux, les activités, l’appartenance, les quantités partitives et les phrases négatives où le partitif devient de ou d’.',
  ),
  outcomes: [
    b('Contract à + le/les into au/aux and keep à la / à l’', 'Contracter à + le/les en au/aux et garder à la / à l’'),
    b('Use du, de la, de l’, des for origin and possession', 'Employer du, de la, de l’, des pour l’origine et l’appartenance'),
    b('Tell contracted definite articles apart from partitives and pas de', 'Distinguer les articles contractés des partitifs et de pas de'),
  ],
};

const C = 'gr-contracted-articles';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['contractions-with-a', 'articles-contractes-avec-a'],
    b('Contractions with à: au, à la, à l’, aux', 'Contractions avec à : au, à la, à l’, aux'),
    b('Merge à + le into au and à + les into aux before places, people, and flavors.', 'Fusionnez à + le en au et à + les en aux devant les lieux, les personnes et les parfums.'),
    [
      b('Replace à + le with au and à + les with aux', 'Remplacer à + le par au et à + les par aux'),
      b('Keep à la and à l’ uncontracted', 'Garder à la et à l’ sans contraction'),
      b('Apply contractions after aller, être, parler, and téléphoner', 'Appliquer la contraction après aller, être, parler et téléphoner'),
    ],
    13,
    [
      card(
        b('The four forms of à + article', 'Les quatre formes de à + article'),
        b(
          'In French, **à + le** and **à + les** cannot stay separate—they always fuse into **au** and **aux**. Before feminine **la** or vowel/silent h **l’**, no fusion occurs.\nContractions with à: **au, à la, à l’, aux**.',
          'En français, **à + le** et **à + les** ne restent jamais séparés : ils fusionnent toujours en **au** et **aux**. Devant **la** ou **l’** (voyelle ou h muet), il n’y a aucune contraction.\nFormes avec à : **au, à la, à l’, aux**.',
        ),
        {
          table: {
            head: [b('Combination', 'Combinaison'), b('Result', 'Résultat'), b('Example', 'Exemple')],
            rows: [
              ['à + le', 'au', 'Je vais au cinéma.'],
              ['à + la', 'à la', 'Elle va à la bibliothèque.'],
              ['à + l’', 'à l’', 'Nous arrivons à l’aéroport.'],
              ['à + les', 'aux', 'Il parle aux clients.'],
            ],
          },
          ex: [
            ['Nous allons au supermarché ce soir.', 'We are going to the supermarket tonight.'],
            ['L’infirmière parle aux patients.', 'The nurse is talking to the patients.'],
            ['Je prends un croissant au beurre et une glace à la vanille.', 'I will have a butter croissant and a vanilla ice cream.'],
          ],
        },
      ),
      trap(
        b('Same rule for places AND verbs taking à', 'Même règle pour les lieux ET les verbes avec à'),
        b(
          'Do not watch only *aller*: any verb followed by **à** contracts the article! Think of **parler au directeur**, **téléphoner à l’hôtel**, **répondre aux messages**, or **jouer au foot**.\nVerbs with à: **aller à, parler à, téléphoner à, jouer à**.',
          'Ne surveillez pas seulement *aller* : tout verbe suivi de **à** contracte l’article ! Pensez à **parler au directeur**, **téléphoner à l’hôtel**, **répondre aux messages** ou **jouer au foot**.\nVerbes avec à : **aller à, parler à, téléphoner à, jouer à**.',
        ),
      ),
      mc(
        P.form,
        ['au', 'à le', 'à la', 'aux'],
        {
          fr: 'Le dimanche, mon père travaille ___ jardin.',
          explain: b('Jardin is masculine singular (le jardin), so à + le contracts to au.', 'Jardin est masculin singulier (le jardin), donc à + le devient au.'),
        },
      ),
      hear(
        'Les touristes demandent leur chemin aux policiers.',
        b('Who are the tourists asking?', 'À qui les touristes demandent-ils leur chemin ?'),
        [
          b('To several police officers (aux)', 'À plusieurs policiers (aux)'),
          b('To one police officer (au)', 'À un seul policier (au)'),
          b('To a passerby at the station', 'À une passante à la gare'),
        ],
      ),
      gap(
        P.complete,
        'Ce matin, je vais ___ boulangerie, puis ___ marché. Ensuite, je passe ___ hôpital et j’écris ___ voisins.',
        [['à la'], ['au'], ['à l’'], ['aux']],
        {
          choices: [
            ['à la', 'au', 'à l’'],
            ['au', 'à le', 'aux'],
            ['à l’', 'au', 'à la'],
            ['aux', 'à les', 'au'],
          ],
        },
      ),
      pairs(
        b('Match each preposition + noun with its correct French form.', 'Associez chaque préposition + nom à sa forme correcte.'),
        [
          ['à + le bureau', 'au bureau'],
          ['à + la poste', 'à la poste'],
          ['à + l’université', 'à l’université'],
          ['à + les toilettes', 'aux toilettes'],
        ],
        true,
      ),
      sort(
        b('Sort each noun by the form it takes after à.', 'Classez chaque nom selon la forme qu’il prend après à.'),
        ['au', 'à la', 'à l’', 'aux'],
        [
          ['parc (m.)', 0],
          ['plage (f.)', 1],
          ['école (f.)', 2],
          ['États-Unis (m. pl.)', 3],
          ['restaurant (m.)', 0],
          ['enfants (pl.)', 3],
        ],
      ),
      ord(
        P.order,
        'Tu téléphones au médecin ou à l’hôpital ?',
        {
          tr: 'Are you calling the doctor or the hospital?',
          extra: ['le'],
        },
      ),
      say('Je vais au bureau à pied et je parle aux collègues.', 'I walk to the office and talk to colleagues.'),
    ],
    [
      b('à + le = au; à + les = aux (never write *à le* or *à les*).', 'à + le = au ; à + les = aux (n’écrivez jamais *à le* ni *à les*).'),
      b('à la (feminine) and à l’ (before vowel or silent h) never contract.', 'à la (féminin) et à l’ (devant voyelle ou h muet) ne se contractent pas.'),
      b('The contraction applies after any verb taking à (parler, répondre, jouer).', 'La contraction s’applique après tout verbe suivi de à (parler, répondre, jouer).'),
    ],
    [
      ['la boulangerie', b('bakery', 'magasin où l’on vend le pain')],
      ['le marché', b('open-air market', 'lieu où l’on achète des produits frais')],
      ['demander son chemin', b('to ask for directions', 'demander où aller')],
      ['à pied', b('on foot', 'en marchant')],
    ],
  ),

  lesson(
    C,
    2,
    ['contractions-with-de', 'articles-contractes-avec-de'],
    b('Contractions with de: du, de la, de l’, des', 'Contractions avec de : du, de la, de l’, des'),
    b('Merge de + le into du and de + les into des to express origin, topics, and possession.', 'Fusionnez de + le en du et de + les en des pour exprimer l’origine, un sujet ou l’appartenance.'),
    [
      b('Replace de + le with du and de + les with des', 'Remplacer de + le par du et de + les par des'),
      b('Keep de la and de l’ uncontracted', 'Garder de la et de l’ sans contraction'),
      b('Express possession with de / du / de la / de l’ / des', 'Exprimer l’appartenance avec de / du / de la / de l’ / des'),
    ],
    13,
    [
      card(
        b('The four forms of de + article', 'Les quatre formes de de + article'),
        b(
          'Just like *à*, **de + le** fuses into **du**, and **de + les** fuses into **des**. Before feminine **la** or vowel/silent h **l’**, keep **de la** and **de l’**. Use this after *venir de* (coming from), *parler de* (talking about), location phrases (*près de, loin de*), and possession.\nContractions with de: **du, de la, de l’, des**.',
          'Comme pour *à*, **de + le** fusionne en **du**, et **de + les** fusionne en **des**. Devant **la** ou **l’** (voyelle ou h muet), on garde **de la** et **de l’**. On emploie ces formes après *venir de*, *parler de*, les locutions de lieu (*près de, loin de*) et l’appartenance.\nFormes avec de : **du, de la, de l’, des**.',
        ),
        {
          table: {
            head: [b('Combination', 'Combinaison'), b('Result', 'Résultat'), b('Example', 'Exemple')],
            rows: [
              ['de + le', 'du', 'Je rentre du travail.'],
              ['de + la', 'de la', 'Elle habite près de la gare.'],
              ['de + l’', 'de l’', 'C’est l’entrée de l’immeuble.'],
              ['de + les', 'des', 'Le bureau des professeurs est là.'],
            ],
          },
          ex: [
            ['Nous sortons du cinéma vers vingt-deux heures.', 'We are leaving the movie theater around 10 p.m.'],
            ['La voiture du voisin est garée devant l’école.', 'The neighbor’s car is parked in front of the school.'],
            ['Ils parlent des vacances avec enthousiasme.', 'They are talking about the holidays with enthusiasm.'],
          ],
        },
      ),
      tip(
        b('Possession in French: flip the order', 'L’appartenance en français : inversez l’ordre'),
        b(
          'French never uses ’s for possession. Put the **thing owned first**, then **de + article + owner**: *the teacher’s bag* = **le sac du professeur**; *the children’s room* = **la chambre des enfants**.\nPossessive pattern: **le livre du client, la porte de l’hôtel, les jouets des enfants**.',
          'Le français n’utilise jamais ’s pour l’appartenance. Placez d’abord **l’objet possédé**, puis **de + article + possesseur** : **le sac du professeur**, **la chambre des enfants**.\nModèles d’appartenance : **le livre du client, la porte de l’hôtel, les jouets des enfants**.',
        ),
      ),
      mc(
        P.form,
        ['du', 'de le', 'des', 'de la'],
        {
          fr: 'Mon appartement est juste en face ___ parc.',
          explain: b('Parc is masculine singular (le parc), so de + le merges into du.', 'Parc est masculin singulier (le parc) : de + le fusionne en du.'),
        },
      ),
      mc(
        b('How do you say "the guests’ keys"?', 'Comment dit-on « les clés » appartenant aux clients ?'),
        [
          'les clés des clients',
          'les clés de les clients',
          'des clients les clés',
          'les clés du clients',
        ],
        {
          explain: b('Thing owned first (les clés) + de + les clients → les clés des clients.', 'L’objet d’abord (les clés) + de + les clients → les clés des clients.'),
        },
      ),
      gap(
        P.complete,
        'L’arrêt de bus est près ___ musée, juste à côté ___ poste. La porte ___ université reste ouverte jusqu’à l’arrivée ___ étudiants.',
        [['du'], ['de la'], ['de l’'], ['des']],
        {
          choices: [
            ['du', 'de le', 'des'],
            ['de la', 'du', 'de l’'],
            ['de l’', 'du', 'de la'],
            ['des', 'de les', 'du'],
          ],
        },
      ),
      pairs(
        b('Match each French phrase with its possessive or spatial meaning.', 'Associez chaque expression à la structure correspondante.'),
        [
          ['le bureau + le directeur', 'le bureau du directeur'],
          ['le bureau + la directrice', 'le bureau de la directrice'],
          ['le bureau + l’avocate', 'le bureau de l’avocate'],
          ['les bureaux + les médecins', 'les bureaux des médecins'],
        ],
        true,
      ),
      ord(
        P.order,
        'Le frère du boulanger habite loin de l’usine.',
        {
          tr: 'The baker’s brother lives far from the factory.',
          extra: ['des'],
        },
      ),
      dict('Nous parlons du voyage près de la fontaine du quartier.'),
      say('C’est le manteau du serveur ou celui de la cliente ?', 'Is that the waiter’s coat or the customer’s?'),
    ],
    [
      b('de + le = du; de + les = des (never write *de le* or *de les*).', 'de + le = du ; de + les = des (n’écrivez jamais *de le* ni *de les*).'),
      b('Keep de la and de l’ uncontracted before feminine singular or vowel/h nouns.', 'Gardez de la et de l’ devant le féminin singulier ou une voyelle/h muet.'),
      b('Express possession as [thing] + du / de la / de l’ / des + [owner].', 'Exprimez l’appartenance avec [objet] + du / de la / de l’ / des + [possesseur].'),
    ],
    [
      ['en face de', b('across from', 'juste devant, de l’autre côté')],
      ['à côté de', b('next to', 'tout près de')],
      ['l’usine (f.)', b('factory', 'bâtiment industriel')],
      ['l’immeuble (m.)', b('apartment building', 'grand bâtiment à étages')],
    ],
  ),

  lesson(
    C,
    3,
    ['contractions-partitives-and-negation', 'contractions-partitifs-et-de-negatif'],
    b('Contractions vs. partitives vs. pas de', 'Contractés, partitifs et pas de'),
    b('Tell when du/des is a contraction (of/from the), when it means "some", and when a negative turns it into simple de.', 'Sachez quand du/des signifie « de + le/les », quand il exprime une quantité, et quand la négation le réduit à de.'),
    [
      b('Tell contracted definite articles from partitive/indefinite articles', 'Distinguer l’article contracté du partitif et de l’indéfini'),
      b('Switch partitives to de / d’ after pas and quantity words', 'Transformer le partitif en de / d’ après pas et les mots de quantité'),
      b('Keep contracted articles intact when de belongs to the verb or noun', 'Garder l’article contracté quand de appartient au verbe ou au nom'),
    ],
    13,
    [
      card(
        b('Two jobs for du and des', 'Les deux visages de du et des'),
        b(
          '**Du** and **des** do two different jobs. First, they can mean **de + le / de + les** (contraction: *Je parle du film*). Second, they can express an **unspecified quantity** (partitive/plural: *Je bois du thé*, *J’achète des pommes*). In a negative sentence or after **beaucoup de**, the quantity article drops to **de / d’**, while **être** keeps *du/des* (*Ce n’est pas du beurre*).\nQuantity markers taking de: **pas de, beaucoup de, un peu de, trop de**.\nKeep contraction: **parler du film, sortir du bureau, près des arbres**.',
          '**Du** et **des** jouent deux rôles différents. D’une part, ils valent **de + le / de + les** (contracté : *Je parle du film*). D’autre part, ils expriment une **quantité non précisée** (partitif/indéfini : *Je bois du thé*, *J’achète des pommes*). À la forme négative ou après **beaucoup de**, l’article de quantité devient **de / d’**, alors qu’après **être** on garde *du/des* (*Ce n’est pas du beurre*).\nQuantité suivie de de : **pas de, beaucoup de, un peu de, trop de**.\nForme contractée maintenue : **parler du film, sortir du bureau, près des arbres**.',
        ),
        {
          table: {
            head: [b('Role', 'Rôle'), b('Affirmative', 'Affirmatif'), b('Negative / Quantity', 'Négatif / Quantité')],
            rows: [
              [b('Partitive ("some")', 'Partitif'), 'Je mange du pain.', 'Je ne mange pas de pain.'],
              [b('Indefinite plural', 'Indéfini pluriel'), 'J’ai des billets.', 'Je n’ai pas de billets.'],
              [b('With quantity word', 'Avec quantité'), 'Elle boit de l’eau.', 'Elle boit beaucoup d’eau.'],
              [b('Contracted (de + le)', 'Contracté (de + le)'), 'Il parle du match.', 'Il ne parle pas du match.'],
            ],
          },
          ex: [
            ['Nous prenons du fromage, mais nous ne prenons pas de vin.', 'We are having some cheese, but we are not having any wine.'],
            ['Il y a beaucoup de monde au marché aujourd’hui.', 'There are a lot of people at the market today.'],
            ['Elle ne parle pas du travail le week-end.', 'She does not talk about work on the weekend.'],
          ],
        },
      ),
      trap(
        b('Beaucoup de, pas de—never beaucoup du!', 'Beaucoup de, pas de — jamais beaucoup du !'),
        b(
          'After quantity words (**beaucoup, peu, trop, assez, un kilo**) and negative **pas**, never leave *du, de la, des*: drop the article and use bare **de** or **d’** (*beaucoup de sucre*, *pas d’argent*, *trop de bruit*).\nCorrect drops: **pas de café, beaucoup d’amis, assez de temps**.',
          'Après les mots de quantité (**beaucoup, peu, trop, assez, un kilo**) et après **pas**, supprimez *du, de la, des* et gardez **de** ou **d’** (*beaucoup de sucre*, *pas d’argent*, *trop de bruit*).\nFormes justes : **pas de café, beaucoup d’amis, assez de temps**.',
        ),
      ),
      mc(
        P.form,
        ['de', 'du', 'des', 'de la'],
        {
          fr: 'Dans mon thé, je ne mets pas ___ lait.',
          explain: b('After ne ... pas, the partitive du lait simplifies to de lait.', 'Après ne ... pas, le partitif du lait devient de lait.'),
        },
      ),
      mc(
        P.form,
        ['du', 'de', 'des', 'au'],
        {
          fr: 'Ce soir, ils ne parlent pas ___ projet : ils se reposent.',
          explain: b('Parler de + le projet contracts to du projet even in the negative.', 'Parler de + le projet reste contracté en du projet même à la négation.'),
        },
      ),
      sort(
        b('Is it a contraction (de + le/les) or a quantity/negative expression?', 'Est-ce une contraction (de + le/les) ou une expression de quantité / négation ?'),
        [b('Contraction (de + le/les)', 'Contraction (de + le/les)'), b('Quantity or negative (partitive / de)', 'Quantité ou négation (partitif / de)')],
        [
          ['la porte du garage', 0],
          ['beaucoup de bruit', 1],
          ['le cahier des élèves', 0],
          ['pas de sucre', 1],
          ['elle sort du métro', 0],
          ['un peu d’eau', 1],
        ],
      ),
      gap(
        P.complete,
        'Au petit-déjeuner, je vais ___ café du coin. Je commande ___ pain et ___ confiture, mais je ne bois pas ___ jus d’orange. Ensuite, je rentre ___ marché avec mes sacs.',
        [['au'], ['du'], ['de la'], ['de'], ['du']],
        {
          choices: [
            ['au', 'du', 'à le'],
            ['du', 'de', 'au'],
            ['de la', 'du', 'de'],
            ['de', 'du', 'des'],
            ['du', 'au', 'de'],
          ],
        },
      ),
      ord(
        P.order,
        'Il n’y a pas beaucoup de tables libres au restaurant.',
        {
          tr: 'There are not many free tables at the restaurant.',
          extra: ['des'],
        },
      ),
      dlg(
        b('Lunch break downtown', 'Pause déjeuner en ville'),
        b('Clara and Thomas order lunch and plan their afternoon walk.', 'Clara et Thomas commandent à déjeuner et organisent leur après-midi.'),
        [['Clara', 'f'], ['Thomas', 'm']],
        [
          [0, 'On mange à la cantine ou au bistro du coin ?', 'Shall we eat at the cafeteria or at the corner bistro?'],
          [1, {
            options: [
              'Au bistro ! Je veux du poisson avec des légumes, sans frites.',
              'À le bistro ! Je veux de poisson avec de légumes, sans frites.',
              'Au bistro ! Je ne veux pas du poisson avec des légumes.',
            ],
          }],
          [0, 'Moi, je ne prends pas de dessert : je prends juste un café.', 'For me, I am not having dessert: I am just having a coffee.'],
          [1, {
            options: [
              'Après, on passe à la librairie près des jardins ?',
              'Après, on passe au librairie près de les jardins ?',
              'Après, on passe à l’librairie près du jardins ?',
            ],
          }],
        ],
      ),
      dict('Je n’achète pas de fromage aujourd’hui, mais j’apporte du raisin.'),
      write(
        b('Write about your day and meals.', 'Écrivez sur votre journée et vos repas.'),
        b('Write 3–4 sentences using au/à la/aux for places, du/de la/des for food or possession, and one negative with pas de.', 'Écrivez 3 ou 4 phrases en employant au/à la/aux pour des lieux, du/de la/des pour des aliments ou une appartenance, et une négation avec pas de.'),
        22,
        44,
        [
          b('Use at least two contractions with à (au, à la, à l’, aux)', 'Employer au moins deux formes avec à (au, à la, à l’, aux)'),
          b('Use du/de la/des accurately', 'Utiliser correctement du/de la/des'),
          b('Switch to de after pas in a negative sentence', 'Passer à de après pas dans une négation'),
        ],
        'Le matin, je vais au bureau et je prends du café. À midi, je déjeune à la cantine avec des collègues. Le soir, je rentre de l’école, mais je ne mange pas de dessert.',
      ),
    ],
    [
      b('du and des can be contracted definite articles (de + le/les) OR quantity articles ("some").', 'du et des sont soit des articles contractés (de + le/les), soit des articles de quantité.'),
      b('In negatives and after quantity expressions (beaucoup, trop), quantity articles simplify to de / d’.', 'Dans les négations et après les mots de quantité (beaucoup, trop), on emploie de / d’.'),
      b('Contracted articles after verbs/locations (parler du, près des) stay contracted.', 'Les articles contractés après un verbe ou un lieu (parler du, près des) restent contractés.'),
    ],
    [
      ['la confiture', b('jam', 'fruit cuit sucré pour les tartines')],
      ['le bistro', b('small café-restaurant', 'petit restaurant de quartier')],
      ['le raisin', b('grapes', 'petits fruits en grappe')],
      ['beaucoup de monde', b('lots of people', 'une foule')],
    ],
  ),
];

export default lessons;
