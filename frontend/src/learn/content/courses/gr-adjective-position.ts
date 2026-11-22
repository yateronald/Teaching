import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Un grand parc, une robe bleue, un ancien collègue. Most French adjectives follow the noun, yet a core group comes before it—and a handful shift meaning depending on where they sit. This course covers the BAGS rule, post-noun descriptive adjectives, the liaison forms bel, nouvel and vieil, and the everyday meaning shifts that make your French precise and natural.',
    'Un grand parc, une robe bleue, un ancien collègue. La plupart des adjectifs français se placent après le nom, mais un groupe essentiel vient avant lui — et plusieurs changent de sens selon leur position. Ce cours passe en revue les adjectifs courts placés avant, les adjectifs descriptifs placés après, les formes bel, nouvel et vieil, ainsi que les nuances de sens les plus utiles au quotidien.',
  ),
  outcomes: [
    b('Place BAGS adjectives and bel / nouvel / vieil naturally before the noun', 'Placer les adjectifs courts courants et bel / nouvel / vieil avant le nom'),
    b('Put colours, nationalities and longer descriptions after the noun', 'Placer les couleurs, nationalités et descriptions précises après le nom'),
    b('Master meaning shifts like ancien, grand, propre, cher and pauvre', 'Maîtriser les changements de sens avec ancien, grand, propre, cher et pauvre'),
  ],
};

const C = 'gr-adjective-position';

const lessons: Lesson[] = [
  lesson(C, 1, ['bags-before-the-noun', 'adjectifs-avant-le-nom'],
    b('Before the noun: Beauty, Age, Goodness, Size', 'Avant le nom : beauté, âge, qualité, taille'),
    b('The core short adjectives that come before the noun, plus bel, nouvel, vieil and plural de.', 'Les adjectifs courts qui précèdent le nom, ainsi que bel, nouvel, vieil et de au pluriel.'),
    [
      b('Recognise the BAGS adjectives placed before the noun', 'Reconnaître les adjectifs courts placés avant le nom'),
      b('Use bel, nouvel and vieil before a vowel or silent h', 'Employer bel, nouvel et vieil devant une voyelle ou un h muet'),
      b('Switch des to de before a plural pre-noun adjective', 'Remplacer des par de devant un adjectif placé avant le nom'),
    ],
    13,
    [
      card(
        b('BAGS: short everyday adjectives before the noun', 'Les adjectifs courts placés avant le nom'),
        b(
          'In French, most adjectives come after the noun, except a high-frequency set easy to remember as **BAGS**: Beauty, Age, Goodness and Size (plus order words like **premier** and **dernier**).\n\nBeauty: **beau, belle, joli**.\nAge: **jeune, vieux, nouveau**.\nGoodness: **bon, mauvais, gentil**.\nSize: **grand, petit, gros**.',
          'En français, la majorité des adjectifs suivent le nom, sauf un petit groupe très fréquent lié à la beauté, à l’âge, à la qualité morale et à la taille (ainsi que **premier** et **dernier**).\n\nBeauté : **beau, belle, joli**.\nÂge : **jeune, vieux, nouveau**.\nQualité : **bon, mauvais, gentil**.\nTaille : **grand, petit, gros**.',
        ),
        {
          table: {
            head: [b('Category', 'Catégorie'), b('Common adjectives', 'Adjectifs courants'), b('Example', 'Exemple')],
            rows: [
              [b('Beauty', 'Beauté'), 'beau / belle, joli(e)', 'une jolie rue calme'],
              [b('Age', 'Âge'), 'jeune, vieux / vieille, nouveau / nouvelle', 'un jeune médecin'],
              [b('Goodness', 'Qualité'), 'bon / bonne, mauvais(e), gentil(le)', 'une bonne idée'],
              [b('Size', 'Taille'), 'grand(e), petit(e), gros(se), long(ue)', 'un petit café'],
            ],
          },
          ex: [
            ['Nous habitons dans un petit village tranquille.', 'We live in a small, quiet village.'],
            ['C’est une très bonne nouvelle pour toute l’équipe.', 'That’s very good news for the whole team.'],
          ],
        },
      ),
      tip(
        b('Bel, nouvel, vieil and plural de', 'Bel, nouvel, vieil et de au pluriel'),
        b(
          'Before a masculine singular noun starting with a vowel or silent h, **beau, nouveau, vieux** become **bel, nouvel, vieil**. And before any plural adjective placed in front of the noun, **des** normally turns into **de** (or **d’** before a vowel).\n\nVowel forms: **un bel appartement, un nouvel ami, un vieil arbre**.\nPlural de: **de grands parcs, de belles photos, d’autres idées**.',
          'Devant un nom masculin singulier commençant par une voyelle ou un h muet, **beau, nouveau, vieux** deviennent **bel, nouvel, vieil**. Au pluriel, devant un adjectif placé avant le nom, **des** devient normalement **de** (ou **d’** devant une voyelle).\n\nDevant voyelle : **un bel appartement, un nouvel ami, un vieil arbre**.\nAvec de : **de grands parcs, de belles photos, d’autres idées**.',
        ),
        {
          ex: [
            ['Ils ont trouvé un bel appartement près du canal.', 'They found a lovely flat near the canal.'],
            ['On a visité de beaux musées à Lyon.', 'We visited some wonderful museums in Lyon.'],
          ],
        },
      ),
      mc(P.form, ['un nouvel hôtel', 'un nouveau hôtel', 'un hôtel nouvel', 'une nouvelle hôtel'], {
        fr: 'Nous avons réservé ___ au centre-ville.',
        explain: b('Hôtel is masculine singular with a silent h, so nouveau becomes nouvel.', 'Hôtel est masculin singulier avec h muet : nouveau devient nouvel.'),
      }),
      mc(P.form, ['de jolies cartes', 'des jolies cartes', 'jolies des cartes', 'des jolis cartes'], {
        fr: 'Elle m’envoie toujours ___ postales de voyage.',
        explain: b('Before a plural pre-noun adjective like jolies, des becomes de.', 'Devant un adjectif pluriel placé avant le nom, des devient de.'),
      }),
      gap(P.complete, 'C’est un ___ (vieux) ordinateur, mais il marche encore. Dans la rue, il y a ___ (des / de) grands arbres et un ___ (beau) immeuble ancien.', [['vieil'], ['de'], ['bel']], {
        choices: [['vieil', 'vieux', 'vieille'], ['de', 'des', 'du'], ['bel', 'beau', 'belle']],
        hint: b('Watch the vowels in ordinateur and immeuble, and the plural adjective grands.', 'Regardez les voyelles de ordinateur et immeuble, et l’adjectif pluriel grands.'),
      }),
      sort(
        b('Sort by masculine pre-noun form.', 'Classez selon la forme devant le nom masculin.'),
        [b('Before a consonant (beau / nouveau / vieux)', 'Devant consonne (beau / nouveau / vieux)'), b('Before vowel or silent h (bel / nouvel / vieil)', 'Devant voyelle ou h muet (bel / nouvel / vieil)')],
        [['___ livre', 0], ['___ ami', 1], ['___ hôtel', 1], ['___ quartier', 0], ['___ été', 1], ['___ parc', 0]],
      ),
      ord(P.order, 'J’ai acheté un bel imperméable et de bonnes chaussures.', {
        tr: 'I bought a handsome raincoat and good shoes.',
        extra: ['beau', 'des'],
      }),
      hear('Dans ce quartier, il y a de vieux immeubles et un nouvel hôpital.', b('What do you hear in this neighbourhood?', 'Qu’y a-t-il dans ce quartier ?'), [
        b('Old buildings and a new hospital', 'De vieux immeubles et un nouvel hôpital'),
        b('A new museum and a small park', 'Un nouveau musée et un petit parc'),
        b('Old houses and a large station', 'De vieilles maisons et une grande gare'),
      ]),
      dict('Mon nouvel ami habite dans un bel appartement avec de grandes fenêtres.'),
      say('C’est une bonne idée de visiter ce vieux quartier à pied.', 'It’s a good idea to visit this old neighbourhood on foot.'),
    ],
    [
      b('BAGS adjectives (Beauty, Age, Goodness, Size) precede the noun.', 'Les adjectifs de beauté, d’âge, de qualité et de taille se placent avant le nom.'),
      b('Before a masculine singular vowel/silent h: beau → bel, nouveau → nouvel, vieux → vieil.', 'Devant une voyelle ou un h muet au masculin singulier : beau → bel, nouveau → nouvel, vieux → vieil.'),
      b('Before a plural pre-noun adjective, des normally becomes de (de bonnes idées).', 'Devant un adjectif pluriel placé avant le nom, des devient de (de bonnes idées).'),
    ],
    [
      ['un immeuble', b('an apartment building', 'un bâtiment à plusieurs étages')],
      ['un quartier', b('a neighbourhood', 'une partie d’une ville')],
      ['un imperméable', b('a raincoat', 'un manteau contre la pluie')],
    ],
  ),

  lesson(C, 2, ['descriptive-after-the-noun', 'adjectifs-apres-le-nom'],
    b('After the noun: colour, nationality and precise details', 'Après le nom : couleur, nationalité et détails précis'),
    b('Where most French adjectives go, and how to combine two adjectives around one noun.', 'Où se placent la majorité des adjectifs français, et comment en combiner deux autour d’un nom.'),
    [
      b('Place colour, nationality, shape and style adjectives after the noun', 'Placer les couleurs, nationalités, formes et styles après le nom'),
      b('Combine a BAGS adjective and a descriptive adjective cleanly', 'Combiner un adjectif avant le nom et un adjectif après le nom'),
      b('Keep des when the adjective follows the noun', 'Garder des quand l’adjectif suit le nom'),
    ],
    13,
    [
      card(
        b('Descriptive adjectives follow the noun', 'Les adjectifs descriptifs suivent le nom'),
        b(
          'Whenever an adjective classifies or describes an objective quality—colour, nationality, religion, shape, material, style, or a long/modified adjective—it goes **after** the noun.\n\nColours: **une veste bleue, un pull noir, des fleurs blanches**.\nNationalities: **un film japonais, la cuisine italienne, un train suisse**.\nShapes and qualities: **une table ronde, un quartier calme, un roman passionnant**.',
          'Dès qu’un adjectif précise une qualité objective — couleur, nationalité, forme, matière, style, ou adjectif long ou modifié — il se place **après** le nom.\n\nCouleurs : **une veste bleue, un pull noir, des fleurs blanches**.\nNationalités : **un film japonais, la cuisine italienne, un train suisse**.\nFormes et qualités : **une table ronde, un quartier calme, un roman passionnant**.',
        ),
        {
          ex: [
            ['Nous avons dîné dans un restaurant coréen très animé.', 'We had dinner in a very lively Korean restaurant.'],
            ['Elle porte une écharpe verte en laine douce.', 'She is wearing a green scarf in soft wool.'],
          ],
        },
      ),
      card(
        b('Using two adjectives with one noun', 'Deux adjectifs avec un seul nom'),
        b(
          'When you use a BAGS adjective and a descriptive adjective together, they frame the noun like a sandwich: **une jolie robe bleue**. When both adjectives go after the noun, join them with **et**: **un studio clair et calme**.\n\nTwo adjectives framing: **une jolie robe bleue, un petit café parisien, un grand jardin fleuri**.\nJoined after noun: **un studio clair et calme, une rue large et lumineuse, un livre utile et court**.',
          'Quand on associe un adjectif court habituel et un adjectif descriptif, ils encadrent le nom : **une jolie robe bleue**. Quand les deux adjectifs vont après le nom, on les relie avec **et** : **un studio clair et calme**.\n\nAutour du nom : **une jolie robe bleue, un petit café parisien, un grand jardin fleuri**.\nReliés après le nom : **un studio clair et calme, une rue large et lumineuse, un livre utile et court**.',
        ),
        {
          table: {
            head: [b('Pattern', 'Structure'), b('Example', 'Exemple'), b('Meaning', 'Sens')],
            rows: [
              [b('BAGS + noun + descriptive', 'Avant + nom + après'), 'un petit café parisien', b('a small Parisian café', 'un petit café typique de Paris')],
              [b('noun + adj 1 + et + adj 2', 'Nom + adj 1 + et + adj 2'), 'une rue large et lumineuse', b('a wide, bright street', 'une rue à la fois large et lumineuse')],
              [b('noun + adverb + adj', 'Nom + adverbe + adj'), 'un livre vraiment utile', b('a really useful book', 'un livre très pratique')],
            ],
          },
        },
      ),
      trap(
        b('Keep des after the noun — and watch adverbs', 'Gardez des après le nom — et attention aux adverbes'),
        b(
          'With a post-noun adjective, **des** never drops its -s: **des chaussures noires** (not « de chaussures noires »). Also, if you add **très** or **vraiment** to a short adjective, it often moves after the noun: **une histoire très drôle**.\n\nPost-noun plural: **des étudiants canadiens, des pommes rouges, des rues calmes**.\nModified adjectives: **un film assez long, une maison très ancienne, un exercice trop difficile**.',
          'Quand l’adjectif est après le nom, **des** ne change pas : **des chaussures noires** (jamais « de chaussures noires »). De plus, un adverbe comme **très** ou **assez** attire souvent l’adjectif après le nom : **une histoire très drôle**.\n\nPluriel après le nom : **des étudiants canadiens, des pommes rouges, des rues calmes**.\nAvec un adverbe : **un film assez long, une maison très ancienne, un exercice trop difficile**.',
        ),
      ),
      mc(P.form, ['des vélos électriques', 'de vélos électriques', 'électriques vélos', 'des électriques vélos'], {
        fr: 'Dans cette ville, beaucoup de gens utilisent ___.',
      }),
      gap(P.complete, 'Tu as vu ___ (ce / film / français) hier ? Moi, j’ai acheté ___ (une / jolie / chemise / verte) et ___ (des / chaussettes / blanches).', [['ce film français'], ['une jolie chemise verte'], ['des chaussettes blanches']]),
      ord(P.order, 'Ils cherchent un grand appartement calme et lumineux.', {
        tr: 'They are looking for a large, quiet, bright flat.',
        extra: ['noir', 'petit'],
      }),
      pairs(
        b('Match each English noun phrase with its natural French word order.', 'Associez chaque groupe nominal à sa construction correcte.'),
        [
          ['un grand parc public', b('a large public park', 'un vaste espace vert ouvert à tous')],
          ['une table carrée en bois', b('a square wooden table', 'un meuble de forme carrée')],
          ['des tomates bien mûres', b('nice ripe tomatoes', 'des légumes rouges prêts à manger')],
          ['un bon film espagnol', b('a good Spanish film', 'un long-métrage réussi d’Espagne')],
        ],
      ),
      hear('J’ai commandé un grand café noir et une tartelette aux fraises.', b('What did the speaker order?', 'Qu’a commandé la personne ?'), [
        b('A large black coffee and a strawberry tartlet', 'Un grand café noir et une tartelette aux fraises'),
        b('A small white coffee and an apple tart', 'Un petit café au lait et une tarte aux pommes'),
        b('A hot green tea and a chocolate cake', 'Un thé vert chaud et un gâteau au chocolat'),
      ]),
      dict('Nous avons loué une petite maison blanche dans un village calme et fleuri.'),
      say('Elle porte un long manteau bleu et des bottes noires.', 'She is wearing a long blue coat and black boots.'),
    ],
    [
      b('Colours, nationalities, shapes, styles and modified adjectives follow the noun.', 'Les couleurs, nationalités, formes, styles et adjectifs avec adverbe suivent le nom.'),
      b('A BAGS adjective and a descriptive adjective frame the noun: un petit café parisien.', 'Un adjectif court et un adjectif descriptif encadrent le nom : un petit café parisien.'),
      b('Keep des when the adjective comes after the noun: des rues calmes.', 'Gardez des quand l’adjectif suit le nom : des rues calmes.'),
    ],
    [
      ['lumineux / lumineuse', b('bright, full of light', 'qui reçoit beaucoup de lumière')],
      ['fleuri(e)', b('full of flowers', 'orné de fleurs')],
      ['carré(e)', b('square', 'à quatre côtés égaux')],
    ],
  ),

  lesson(C, 3, ['position-meaning-shifts', 'sens-selon-la-place'],
    b('When moving the adjective changes the meaning', 'Quand la place de l’adjectif change le sens'),
    b('Ancien, grand, propre, cher, pauvre, même, seul: two positions, two very different meanings.', 'Ancien, grand, propre, cher, pauvre, même, seul : deux positions, deux sens bien distincts.'),
    [
      b('Distinguish figurative pre-noun meanings from literal post-noun meanings', 'Distinguer le sens figuré avant le nom du sens propre après le nom'),
      b('Choose the right position for ancien, grand, propre, cher and pauvre', 'Choisir la bonne place pour ancien, grand, propre, cher et pauvre'),
      b('Use même and seul accurately before or after a noun', 'Employer même et seul avec justesse avant ou après le nom'),
    ],
    13,
    [
      card(
        b('Figurative before, literal after', 'Sens figuré avant, sens concret après'),
        b(
          'A small set of adjectives shifts meaning when it moves. Placed **before** the noun, the sense is often subjective, figurative or emotional; placed **after**, it is concrete and literal.\n\nBefore the noun: **mon ancien professeur, un grand écrivain, ma propre clé**.\nAfter the noun: **un meuble ancien, un homme grand, une chemise propre**.',
          'Une série d’adjectifs change de sens selon sa place. Placé **avant** le nom, l’adjectif prend souvent une valeur subjective, figurée ou affective ; placé **après**, il garde son sens concret et littéral.\n\nAvant le nom : **mon ancien professeur, un grand écrivain, ma propre clé**.\nAprès le nom : **un meuble ancien, un homme grand, une chemise propre**.',
        ),
        {
          table: {
            head: [b('Adjective', 'Adjectif'), b('Before noun', 'Avant le nom'), b('After noun', 'Après le nom')],
            rows: [
              ['ancien', b('former (ex-)', 'd’avant, ex- (mon ancien patron)'), b('old / antique', 'très vieux (un vase ancien)')],
              ['grand', b('great / famous', 'remarquable (un grand artiste)'), b('tall / big', 'de haute taille (un garçon grand)')],
              ['propre', b('own (my own)', 'à soi (sa propre chambre)'), b('clean', 'lavé, sans tache (un verre propre)')],
              ['cher', b('dear (affection)', 'aimé, précieux (mon cher ami)'), b('expensive', 'coûteux (un billet cher)')],
              ['pauvre', b('poor = unfortunate', 'à plaindre (ce pauvre chien)'), b('poor = low income', 'sans argent (un pays pauvre)')],
              ['même', b('the same', 'identique (le même jour)'), b('the very / exact', 'exactement ce (le jour même)')],
              ['seul', b('only / single', 'unique (un seul billet)'), b('alone / lonely', 'sans compagnie (un enfant seul)')],
            ],
          },
          ex: [
            ['J’ai croisé mon ancien voisin dans le métro.', 'I bumped into my former neighbour on the metro.'],
            ['Ce restaurant est un peu cher, mais la cuisine est excellente.', 'This restaurant is a bit expensive, but the food is excellent.'],
          ],
        },
      ),
      trap(
        b('Three traps to watch out for', 'Trois pièges à éviter'),
        b(
          'Saying **un professeur ancien** means an elderly or antique-style teacher—for your former teacher, always say **un ancien professeur**. Saying **une chambre propre** means a tidy, clean room, whereas **ma propre chambre** means my very own room. And **un billet cher** is costly, while **mon cher Paul** starts a warm letter.\n\nFormer vs antique: **mon ancienne école, un château ancien**.\nOwn vs clean: **mes propres yeux, des mains propres**.\nDear vs expensive: **chère Claire, un manteau cher**.',
          'Dire **un professeur ancien** évoque un professeur très âgé — pour un ex-professeur, dites toujours **un ancien professeur**. **Une chambre propre** est rangée et lavée, tandis que **ma propre chambre** est celle qui m’appartient. Et **un billet cher** coûte beaucoup d’argent, alors que **mon cher Paul** exprime l’affection.\n\nEx- ou antique : **mon ancienne école, un château ancien**.\nÀ soi ou lavé : **mes propres yeux, des mains propres**.\nAimé ou coûteux : **chère Claire, un manteau cher**.',
        ),
      ),
      mc(P.meaning, [b('my former colleague', 'mon collègue d’autrefois'), b('my elderly colleague', 'mon collègue très âgé'), b('my clean colleague', 'mon collègue soigné')], {
        fr: 'Je déjeune aujourd’hui avec mon ancienne collègue.',
      }),
      mc(P.form, ['sa propre voiture', 'sa voiture propre', 'sa cher voiture', 'sa voiture seule'], {
        fr: 'À vingt-cinq ans, Léa a enfin acheté ___, qui lui appartient.',
        explain: b('Before the noun, propre means own (her very own car).', 'Avant le nom, propre signifie qui lui appartient en propre.'),
      }),
      gap(P.complete, 'Nous avons pris ___ (le même) bus, mais le billet était ___ (trop cher) pour un ___ (seul) trajet.', [['le même'], ['trop cher'], ['seul']], {
        choices: [['le même', 'même le'], ['trop cher', 'cher trop'], ['seul', 'seule']],
      }),
      pairs(
        b('Match each French phrase with its exact meaning.', 'Associez chaque expression française à son sens précis.'),
        [
          ['un grand poète', b('a great poet', 'un poète célèbre et admiré')],
          ['un immeuble ancien', b('a historic / old building', 'un bâtiment de plusieurs siècles')],
          ['une assiette propre', b('a clean plate', 'une assiette lavée et nette')],
          ['ce pauvre chat', b('that poor (unfortunate) cat', 'ce chat qui fait pitié')],
          ['un seul café', b('just one coffee', 'un unique café, pas deux')],
          ['une femme seule', b('a woman on her own', 'une femme sans personne avec elle')],
        ],
      ),
      sort(
        b('Does the adjective go BEFORE or AFTER the noun for this meaning?', 'Placez l’adjectif AVANT ou APRÈS le nom selon le sens.'),
        [b('Before the noun (figurative / subjective)', 'Avant le nom (sens figuré ou affectif)'), b('After the noun (literal / objective)', 'Après le nom (sens concret ou objectif)')],
        [['former flatmate (ancien)', 0], ['expensive hotel (cher)', 1], ['my own keys (propres)', 0], ['clean hands (propres)', 1], ['only one ticket (seul)', 0], ['a tall player (grand)', 1]],
      ),
      hear('J’ai payé mes propres vacances dans un hôtel ancien, mais pas très cher.', b('What is true about this trip?', 'Qu’apprend-on sur ce voyage ?'), [
        b('The speaker paid for their own stay in an old, affordable hotel', 'La personne a payé elle-même son séjour dans un hôtel historique abordable'),
        b('A former friend paid for a clean, expensive hotel', 'Un ancien ami a payé un hôtel propre et coûteux'),
        b('The speaker travelled alone to a brand-new hotel', 'La personne a voyagé seule dans un hôtel très récent'),
      ]),
      dlg(b('At the antique market', 'Au marché aux puces'), b('Nora and Karim look at an old mirror and talk about Nora’s former flat.', 'Nora et Karim regardent un miroir ancien et parlent de l’ancien appartement de Nora.'), [['Nora', 'f'], ['Karim', 'm']], [
        [0, 'Regarde ce miroir ! Il irait bien dans mon salon.', 'Look at this mirror! It would look good in my living room.'],
        [1, { options: ['Oui, c’est un objet ancien très joli, mais il doit être cher !', 'Oui, c’est un ancien objet très joli, mais il doit être mon cher !', 'Oui, c’est un propre objet, mais il doit être pauvre !'], explain: b('Ancien after the noun = antique; cher after the noun = expensive.', 'Ancien après le nom = antique ; cher après le nom = coûteux.') }],
        [0, 'Je vais demander le prix. Tu sais, j’ai croisé mon ancien propriétaire tout à l’heure.', 'I’ll ask the price. You know, I bumped into my former landlord earlier.'],
        [1, { options: ['Ah oui ? Celui qui ne nettoyait jamais sa propre cuisine ?', 'Ah oui ? Celui qui ne nettoyait jamais sa cuisine propre ?', 'Ah oui ? Celui qui ne nettoyait jamais son seul cuisine ?'], explain: b('Sa propre cuisine = his own kitchen.', 'Sa propre cuisine = la cuisine qui lui appartenait.') }],
      ]),
      write(
        b('Describe a room or object with meaning-shift adjectives', 'Décrire un lieu ou un objet avec la place des adjectifs'),
        b('Write 35 to 65 words about a flat, a shop or a memory. Use at least two position-sensitive adjectives (ancien, grand, propre, cher, pauvre, même or seul) and two standard descriptive adjectives.', 'Écrivez 35 à 65 mots sur un appartement, une boutique ou un souvenir. Employez au moins deux adjectifs dont le sens change selon la place (ancien, grand, propre, cher, pauvre, même ou seul) et deux adjectifs descriptifs courants.'),
        35,
        65,
        [
          b('At least two meaning-shift adjectives in the right position', 'Au moins deux adjectifs à sens variable bien placés'),
          b('At least one BAGS + descriptive combination', 'Au moins une combinaison adjectif court + descriptif'),
          b('Correct gender and plural agreement', 'Accords en genre et en nombre corrects'),
        ],
        'Mon ancien studio était très petit, mais il avait de grandes fenêtres blanches et une cuisine propre. Aujourd’hui, j’ai enfin mon propre appartement dans un quartier calme. Les meubles anciens de ma grand-mère sont dans le salon, près d’une jolie table ronde en bois. Le loyer n’est pas trop cher.',
      ),
    ],
    [
      b('Ancien, grand, propre, cher, pauvre, même and seul shift meaning by position.', 'Ancien, grand, propre, cher, pauvre, même et seul changent de sens selon leur place.'),
      b('Before the noun: former, great, own, dear, unfortunate, same, single.', 'Avant le nom : d’autrefois, remarquable, à soi, aimé, à plaindre, identique, unique.'),
      b('After the noun: old/antique, tall, clean, expensive, low-income, exact, alone.', 'Après le nom : vieux/antique, de haute taille, lavé, coûteux, sans argent, exact, sans compagnie.'),
    ],
    [
      ['un loyer', b('rent', 'la somme payée chaque mois pour un logement')],
      ['un meuble', b('a piece of furniture', 'un objet d’équipement comme une table ou une armoire')],
      ['croiser quelqu’un', b('to bump into someone', 'rencontrer par hasard')],
    ],
  ),
];

export default lessons;
