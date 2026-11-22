import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Connect short ideas into flowing French. Master coordination with et, ou, and ne … ni … ni, express contrast and surprise with mais and pourtant, and explain reasons and results cleanly with parce que and donc.',
    'Reliez vos idées courtes pour parler un français fluide. Maîtrisez la coordination avec et, ou et ne … ni … ni, exprimez l’opposition avec mais et pourtant, et donnez causes et conséquences avec parce que et donc.',
  ),
  outcomes: [
    b('Join ideas and negatives using et, ou, and ne … ni … ni', 'Relier des idées et des négations avec et, ou et ne … ni … ni'),
    b('Contrast two facts naturally with mais and pourtant', 'Opposer deux faits avec mais et pourtant'),
    b('Connect cause and result accurately with parce que and donc', 'Relier cause et conséquence avec parce que et donc'),
  ],
};

const C = 'gr-basic-connectors';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['et-ou-ni-coordination', 'et-ou-ni-coordination'],
    b('Joining and listing: et, ou, and ni … ni', 'Relier et lister : et, ou et ni … ni'),
    b('Link positive items with et, offer choices with ou, and negate two options cleanly with ne … ni … ni.', 'Reliez des éléments avec et, proposez un choix avec ou et excluez deux options avec ne … ni … ni.'),
    [
      b('Connect words and clauses with et and ou', 'Relier des mots et des propositions avec et et ou'),
      b('Use ne … ni … ni without adding pas', 'Employer ne … ni … ni sans ajouter pas'),
      b('Drop partitive/indefinite articles after ni', 'Supprimer l’article indéfini ou partitif après ni'),
    ],
    13,
    [
      card(
        b('Adding, choosing, and excluding: et, ou, ni', 'Ajouter, choisir et exclure : et, ou, ni'),
        b(
          '**Et** joins two items or actions (*du pain et du beurre*). **Ou** offers a choice (*thé ou café ?*). To say “neither … nor …”, place **ne** (or **n’**) before the verb and **ni … ni …** before the two nouns—and drop *un, une, du, de la, des*!\nCoordination words: **et, ou, ne … ni … ni**.',
          '**Et** additionne deux éléments ou actions (*du pain et du beurre*). **Ou** propose un choix (*thé ou café ?*). Pour dire « neither … nor … », placez **ne** (ou **n’**) avant le verbe et **ni … ni …** devant les deux noms—en supprimant *un, une, du, de la, des* !\nMots de liaison : **et, ou, ne … ni … ni**.',
        ),
        {
          table: {
            head: [b('Connector', 'Connecteur'), b('Role', 'Rôle'), b('Example', 'Exemple')],
            rows: [
              ['et', b('addition', 'addition'), 'J’aime la musique et le cinéma.'],
              ['ou', b('choice', 'choix'), 'Tu prends le bus ou le métro ?'],
              ['ne … ni … ni', b('neither … nor', 'double exclusion'), 'Il ne boit ni café ni thé.'],
            ],
          },
          ex: [
            ['Nous visitons Lyon et Annecy cette semaine.', 'We are visiting Lyon and Annecy this week.'],
            ['Vous préférez une table dedans ou en terrasse ?', 'Do you prefer a table inside or on the patio?'],
            ['Je n’ai ni frère ni sœur.', 'I have neither a brother nor a sister.'],
          ],
        },
      ),
      trap(
        b('No pas with ni … ni — and watch articles', 'Pas de pas avec ni … ni — et attention aux articles'),
        b(
          '**Ni … ni** already makes the sentence negative, so NEVER add **pas** (*Je n’aime ni le froid ni la pluie*, NOT *Je n’aime pas ni…*). Notice that definite articles (**le, la, les**) stay after *ni*, while indefinite/partitive articles (**un, une, du, des**) disappear (*Elle n’a ni stylo ni cahier*).\nAfter ni, keep: **le, la, l’, les**.\nAfter ni, drop: **un, une, du, des**.',
          '**Ni … ni** porte déjà la négation : n’ajoutez JAMAIS **pas** (*Je n’aime ni le froid ni la pluie*, pas *Je n’aime pas ni…*). Les articles définis (**le, la, les**) restent après *ni*, tandis que **un, une, du, des** disparaissent (*Elle n’a ni stylo ni cahier*).\nÀ garder après ni : **le, la, l’, les**.\nÀ supprimer après ni : **un, une, du, des**.',
        ),
      ),
      mc(
        b('How do you say "He eats neither meat nor fish"?', 'Comment dit-on « He eats neither meat nor fish » ?'),
        [
          'Il ne mange ni viande ni poisson.',
          'Il ne mange pas ni viande ni poisson.',
          'Il ne mange ni de viande ni de poisson pas.',
          'Il mange ni viande ni poisson.',
        ],
        {
          explain: b('Use ne before the verb and ni … ni without pas or partitive articles.', 'Placez ne avant le verbe et ni … ni sans pas ni article partitif.'),
        },
      ),
      mc(
        P.word,
        ['ou', 'où', 'et', 'ni'],
        {
          fr: 'Vous payez par carte ___ en espèces ?',
          explain: b('Ou (without accent) expresses a choice between two payment methods.', 'Ou (sans accent) exprime le choix entre deux moyens de paiement.'),
        },
      ),
      gap(
        P.complete,
        'Ce matin, je prends du pain ___ de la confiture. Mon ami Paul ___ boit ___ thé ___ café : il prend juste de l’eau.',
        [['et'], ['ne'], ['ni'], ['ni']],
        {
          choices: [
            ['et', 'ou', 'ni'],
            ['ne', 'pas', 'n’'],
            ['ni', 'ou', 'et'],
            ['ni', 'et', 'ou'],
          ],
        },
      ),
      pairs(
        b('Match each beginning with the connector and second half that make sense.', 'Associez chaque début de phrase à sa suite logique.'),
        [
          ['Tu préfères la mer', 'ou la montagne ?'],
          ['Elle parle espagnol', 'et un peu d’allemand.'],
          ['Il n’a ni voiture', 'ni vélo.'],
          ['Nous n’aimons ni l’hiver', 'ni la pluie.'],
        ],
        true,
      ),
      ord(
        P.order,
        'Nous n’avons ni le temps ni l’argent pour ce voyage.',
        {
          tr: 'We have neither the time nor the money for this trip.',
          extra: ['pas'],
        },
      ),
      dict('Vous voulez du fromage et du pain, ou juste une salade ?'),
      say('Je ne regarde ni la télé ni les séries le soir.', 'I watch neither TV nor series in the evening.'),
    ],
    [
      b('et adds items; ou offers an alternative (no accent on ou).', 'et relie deux éléments ; ou exprime un choix (sans accent sur ou).'),
      b('ne … ni … ni replaces pas—never use both pas and ni.', 'ne … ni … ni remplace pas : n’utilisez jamais les deux ensemble.'),
      b('Drop un, une, du, de la, des after ni, while keeping le, la, les.', 'Supprimez un, une, du, de la, des après ni, mais gardez le, la, les.'),
    ],
    [
      ['en espèces', b('in cash', 'en billets et en pièces')],
      ['la terrasse', b('outdoor patio', 'tables dehors devant un café')],
      ['la viande', b('meat', 'aliment d’origine animale')],
    ],
  ),

  lesson(
    C,
    2,
    ['mais-and-pourtant-contrast', 'mais-et-pourtant-opposition'],
    b('Contrast and surprise: mais vs. pourtant', 'Opposition et surprise : mais vs pourtant'),
    b('Balance two facts with mais and highlight an unexpected contradiction with pourtant.', 'Opposez deux faits avec mais et soulignez une contradiction surprenante avec pourtant.'),
    [
      b('Link two contrasting clauses with mais', 'Opposer deux idées avec mais'),
      b('Use pourtant to express surprise ("yet / even so")', 'Employer pourtant pour marquer la surprise (« et pourtant »)'),
      b('Place pourtant cleanly at the start of a clause or after the verb', 'Placer pourtant au début de la proposition ou après le verbe'),
    ],
    13,
    [
      card(
        b('Mais vs. pourtant', 'Mais ou pourtant ?'),
        b(
          '**Mais** introduces a simple contrast (*Il est petit, mais il est rapide*). **Pourtant** (“yet / however / even so”) goes a step further: the second fact seems **surprising** given the first (*Il pleut ; pourtant, il sort sans parapluie*). **Pourtant** can open the second clause or sit right after its verb.\nContrast tools: **mais, pourtant, pourtant + verb, verb + pourtant**.',
          '**Mais** introduit une opposition simple (*Il est petit, mais il est rapide*). **Pourtant** va plus loin : le deuxième fait paraît **surprenant** par rapport au premier (*Il pleut ; pourtant, il sort sans parapluie*). **Pourtant** peut commencer la deuxième phrase ou se placer juste après le verbe.\nOutils d’opposition : **mais, pourtant, pourtant + verbe, verbe + pourtant**.',
        ),
        {
          table: {
            head: [b('Connector', 'Connecteur'), b('Nuance', 'Nuance'), b('Example', 'Exemple')],
            rows: [
              ['mais', b('plain contrast', 'opposition simple'), 'J’aime Paris, mais la vie est chère.'],
              ['pourtant (start)', b('unexpected result', 'fait surprenant'), 'Il étudie peu ; pourtant, il réussit.'],
              ['pourtant (after verb)', b('surprising contrast', 'contraste appuyé'), 'Elle travaille beaucoup ; elle gagne pourtant peu.'],
            ],
          },
          ex: [
            ['Le studio est petit, mais il est très lumineux.', 'The studio apartment is small, but it is very bright.'],
            ['Il fait froid ; pourtant, la terrasse est pleine.', 'It is cold; yet the patio is full.'],
            ['Je dors huit heures, je suis pourtant fatigué.', 'I sleep eight hours, yet I am tired.'],
          ],
        },
      ),
      tip(
        b('Rhythm and punctuation', 'Rythme et ponctuation'),
        b(
          'Use a comma before **mais** inside a single sentence (*J’essaie, mais c’est difficile*). Use a semicolon, period, or **et** before **pourtant** (*Il est tard ; pourtant, les rues sont animées*).\nTypical pairs: **petit mais calme, tard pourtant animé, fatigué pourtant souriant**.',
          'Mettez une virgule avant **mais** dans une même phrase (*J’essaie, mais c’est difficile*). Utilisez un point, un point-virgule ou **et** devant **pourtant** (*Il est tard ; pourtant, les rues sont animées*).\nPaires courantes : **petit mais calme, tard pourtant animé, fatigué pourtant souriant**.',
        ),
      ),
      mc(
        b('Which sentence highlights a surprising contradiction?', 'Quelle phrase exprime une contradiction surprenante ?'),
        [
          'Il porte un gros pull ; pourtant, il a froid.',
          'Il porte un gros pull ; ou, il a froid.',
          'Il porte un gros pull ; mais pourtant de, il a froid.',
          'Il porte un gros pull ; ni, il a froid.',
        ],
      ),
      hear(
        'Le restaurant est complet presque tous les soirs, mais la carte est très simple.',
        b('How are the two parts of the sentence related?', 'Quel est le lien entre les deux parties de la phrase ?'),
        [
          b('Contrast: busy even with a simple menu', 'Opposition : complet malgré une carte simple'),
          b('Choice between two restaurants', 'Choix entre deux restaurants'),
          b('Addition of two identical facts', 'Addition de deux faits identiques'),
        ],
      ),
      gap(
        P.complete,
        'Ce quartier est loin du centre, ___ il est très calme. Le loyer monte chaque année ; ___, beaucoup d’étudiants restent ici.',
        [['mais'], ['pourtant']],
        {
          choices: [
            ['mais', 'ni', 'ou'],
            ['pourtant', 'et', 'ou'],
          ],
        },
      ),
      sort(
        b('Does the sentence add/choose, or show contrast?', 'La phrase exprime-t-elle un ajout/choix ou une opposition ?'),
        [b('Addition or choice (et / ou)', 'Ajout ou choix (et / ou)'), b('Contrast (mais / pourtant)', 'Opposition (mais / pourtant)')],
        [
          ['Un café et un croissant.', 0],
          ['Petit, mais confortable.', 1],
          ['À pied ou en bus ?', 0],
          ['Il pleut ; pourtant, il sort.', 1],
          ['Cher, mais très bon.', 1],
          ['Du pain et du fromage.', 0],
        ],
      ),
      ord(
        P.order,
        'Le trajet est long, mais la vue est magnifique.',
        {
          tr: 'The trip is long, but the view is wonderful.',
          extra: ['ni'],
        },
      ),
      dict('Il parle très peu ; pourtant, il comprend toute la conversation.'),
      say('Ce sac est léger, mais il contient beaucoup de choses.', 'This bag is light, but it holds a lot of things.'),
    ],
    [
      b('Use mais for a straightforward contrast between two clauses.', 'Utilisez mais pour une opposition simple entre deux propositions.'),
      b('Use pourtant when the second fact goes surprisingly against the first.', 'Utilisez pourtant quand le second fait contredit ce qu’on attendait.'),
      b('pourtant works either at the start of the clause or right after the conjugated verb.', 'pourtant se place soit au début de la proposition, soit juste après le verbe conjugué.'),
    ],
    [
      ['lumineux / lumineuse', b('bright', 'plein de lumière')],
      ['le loyer', b('rent', 'prix payé chaque mois pour un logement')],
      ['le trajet', b('journey / commute', 'le chemin d’un point à un autre')],
      ['animé / animée', b('lively', 'plein de vie et de mouvement')],
    ],
  ),

  lesson(
    C,
    3,
    ['parce-que-and-donc-cause-consequence', 'parce-que-et-donc-cause-consequence'],
    b('Cause and result: parce que and donc', 'Cause et conséquence : parce que et donc'),
    b('Never flip cause and result again: pair parce que (and parce qu’) with reasons, and donc with logical consequences.', 'Ne confondez plus cause et conséquence : utilisez parce que (et parce qu’) pour la raison, et donc pour le résultat.'),
    [
      b('Introduce reasons with parce que / parce qu’', 'Introduire une raison avec parce que / parce qu’'),
      b('Introduce results with donc', 'Introduire un résultat avec donc'),
      b('Avoid flipping cause and consequence in connected sentences', 'Éviter d’inverser cause et conséquence'),
    ],
    13,
    [
      card(
        b('Cause (parce que) vs. result (donc)', 'La cause (parce que) et la conséquence (donc)'),
        b(
          '**Parce que** (becoming **parce qu’** before a vowel or silent h) explains **why** something happens and answers *Pourquoi ?*. **Donc** (“so / therefore”) introduces the **result** that follows from a fact. Remember the arrow: **Action ← parce que + Cause**, whereas **Cause → donc + Result**.\nCause starters: **parce que, parce qu’il, car**.\nResult links: **donc, alors, par conséquent**.',
          '**Parce que** (qui devient **parce qu’** devant voyelle ou h muet) explique **pourquoi** un fait arrive et répond à *Pourquoi ?*. **Donc** introduit le **résultat** qui découle d’un fait. Gardez le sens de la flèche : **Fait ← parce que + Cause**, mais **Cause → donc + Conséquence**.\nPour la cause : **parce que, parce qu’il, car**.\nPour la conséquence : **donc, alors, par conséquent**.',
        ),
        {
          table: {
            head: [b('Connector', 'Connecteur'), b('Direction', 'Sens'), b('Example', 'Exemple')],
            rows: [
              ['parce que / qu’', b('answers "why?"', 'explique la cause'), 'Je reste ici parce qu’il pleut.'],
              ['donc', b('gives the result', 'donne le résultat'), 'Il pleut, donc je reste ici.'],
              ['car', b('written "for/because"', 'cause à l’écrit'), 'Nous partons tôt, car la route est longue.'],
            ],
          },
          ex: [
            ['Je prends un pull parce qu’il fait frais ce matin.', 'I am taking a sweater because it is chilly this morning.'],
            ['Le métro est en panne, donc nous prenons le bus.', 'The subway is out of service, so we are taking the bus.'],
            ['Elle apprend le français parce qu’elle déménage à Montréal.', 'She is learning French because she is moving to Montreal.'],
          ],
        },
      ),
      trap(
        b('Watch the direction arrow—and elide parce qu’', 'Attention au sens de la flèche — et à parce qu’'),
        b(
          'Never write *Il fait froid, parce que je mets un manteau*—putting on a coat is the **result**, so it needs **donc** (*Il fait froid, donc je mets un manteau*). Also remember **parce qu’** before *il, elle, on, un, une* (*parce qu’elle travaille*).\nCheck the elision: **parce qu’il, parce qu’elle, parce qu’on**.',
          'Ne dites jamais *Il fait froid, parce que je mets un manteau* : mettre un manteau est le **résultat**, il faut donc **donc** (*Il fait froid, donc je mets un manteau*). Pensez aussi à élider **parce qu’** devant *il, elle, on, un, une* (*parce qu’elle travaille*).\nÉlisions obligatoires : **parce qu’il, parce qu’elle, parce qu’on**.',
        ),
      ),
      mc(
        b('Which sentence puts cause and result in the logical direction?', 'Quelle phrase met cause et conséquence dans le bon sens ?'),
        [
          'Le frigo est vide, donc je vais faire les courses.',
          'Le frigo est vide, parce que je vais faire les courses.',
          'Je vais faire les courses, donc le frigo est vide.',
          'Le frigo est vide, pourtant je vais faire les courses.',
        ],
        {
          explain: b('Empty fridge (cause) → going grocery shopping (result), linked by donc.', 'Frigo vide (cause) → faire les courses (conséquence) : le lien logique est donc.'),
        },
      ),
      mc(
        b('Choose the accurate French sentence.', 'Choisissez la phrase correcte.'),
        [
          'Nous rentrons vite parce qu’il commence à pleuvoir.',
          'Nous rentrons vite parce que il commence à pleuvoir.',
          'Nous rentrons vite donc il commence à pleuvoir.',
          'Nous rentrons vite parce qu’il commencent à pleuvoir.',
        ],
      ),
      gap(
        P.complete,
        'J’arrive en retard ___ le bus ne passe pas. Le bureau est loin, ___ je prends un taxi. Je n’ai ___ parapluie ___ veste, ___ il fait beau maintenant !',
        [['parce que'], ['donc'], ['ni'], ['ni'], ['mais']],
        {
          choices: [
            ['parce que', 'donc', 'mais'],
            ['donc', 'parce que', 'ni'],
            ['ni', 'et', 'pas'],
            ['ni', 'ou', 'et'],
            ['mais', 'donc', 'parce que'],
          ],
        },
      ),
      pairs(
        b('Match each situation with its logical reason or result.', 'Associez chaque situation à sa cause ou sa conséquence logique.'),
        [
          ['Il est fatigué,', 'donc il se couche tôt.'],
          ['Il se couche tôt', 'parce qu’il est fatigué.'],
          ['La rue est bloquée,', 'donc le bus change de route.'],
          ['Nous prenons le train', 'parce qu’il va très vite.'],
        ],
        true,
      ),
      ord(
        P.order,
        'Elle étudie le soir parce qu’elle travaille la journée.',
        {
          tr: 'She studies in the evening because she works during the day.',
          extra: ['donc'],
        },
      ),
      dlg(
        b('Weekend hiking plans', 'Randonnée ce week-end'),
        b('Hugo and Léa decide what to do on Sunday.', 'Hugo et Léa décident de leur programme pour dimanche.'),
        [['Hugo', 'm'], ['Léa', 'f']],
        [
          [0, 'On part à la mer ou en forêt dimanche ?', 'Are we going to the sea or to the forest on Sunday?'],
          [1, {
            options: [
              'En forêt, parce qu’il fait très chaud et il y a de l’ombre.',
              'En forêt, donc il fait très chaud et il y a de l’ombre.',
              'En forêt, parce que il fait très chaud ni il y a de l’ombre.',
            ],
          }],
          [0, 'Bonne idée ! On prend des sandwichs et de l’eau, donc on ne cherche pas de restaurant.', 'Good idea! We are bringing sandwiches and water, so we will not look for a restaurant.'],
          [1, {
            options: [
              'Parfait ! Moi, je ne prends ni fromage ni beurre, mais j’apporte des fruits.',
              'Parfait ! Moi, je ne prends pas ni fromage ni beurre, mais j’apporte des fruits.',
              'Parfait ! Moi, je prends ni fromage ou beurre, parce que j’apporte des fruits.',
            ],
          }],
        ],
      ),
      dict('La bibliothèque ferme tôt aujourd’hui, donc je rentre chez moi.'),
      write(
        b('Write a message about your weekend plans.', 'Écrivez un message sur vos projets du week-end.'),
        b('Write a 3–4 sentence note to a friend explaining what you are doing this weekend, using et, mais, parce que (or parce qu’), and donc.', 'Écrivez un petit message de 3 ou 4 phrases à un ami sur vos projets du week-end en utilisant et, mais, parce que (ou parce qu’) et donc.'),
        24,
        45,
        [
          b('Include et and mais naturally', 'Inclure et et mais naturellement'),
          b('Give a reason with parce que / parce qu’', 'Donner une raison avec parce que / parce qu’'),
          b('Show a logical result with donc', 'Exprimer une conséquence logique avec donc'),
        ],
        'Samedi, je vais au marché et je cuisine pour mes amis. Le matin il fait froid, mais l’après-midi il fait beau, donc on marche dans le parc. Je reste chez moi dimanche parce que je travaille tôt lundi.',
      ),
    ],
    [
      b('parce que / parce qu’ introduces a reason and answers Pourquoi ?.', 'parce que / parce qu’ donne une cause et répond à Pourquoi ?.'),
      b('donc introduces a result that follows from the previous fact.', 'donc exprime la conséquence d’un fait précédent.'),
      b('Never use pas with ni … ni, and keep the direction of cause vs. result clear.', 'N’ajoutez jamais pas à ni … ni et gardez bien le sens cause → conséquence.'),
    ],
    [
      ['être en panne', b('to be broken / out of order', 'ne plus fonctionner')],
      ['faire les courses', b('to do grocery shopping', 'acheter à manger')],
      ['l’ombre (f.)', b('shade', 'zone protégée du soleil')],
      ['la forêt', b('forest', 'grand espace plein d’arbres')],
    ],
  ),
];

export default lessons;
