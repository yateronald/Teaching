import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Build clear, natural French sentences from day one. Start with the Subject + Verb + Object backbone, place time and place expressions smoothly without breaking the verb group, and wrap ne … pas and everyday adverbs around the conjugated verb.',
    'Construisez des phrases françaises claires et naturelles dès le début. Maîtrisez l’ordre de base Sujet + Verbe + Complément, placez le temps et le lieu sans couper le groupe verbal, et encadrez le verbe conjugué avec ne … pas et les adverbes courants.',
  ),
  outcomes: [
    b('Build natural Subject + Verb + Object sentences', 'Construire des phrases naturelles Sujet + Verbe + Complément'),
    b('Place time and place expressions in the right slots', 'Placer les compléments de temps et de lieu au bon endroit'),
    b('Position ne … pas and common adverbs around the conjugated verb', 'Placer ne … pas et les adverbes courants autour du verbe conjugué'),
  ],
};

const C = 'gr-sentence-order';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['svo-core-order', 'ordre-sujet-verbe-objet'],
    b('Subject + Verb + Object: the core order', 'Sujet + Verbe + Complément : l’ordre de base'),
    b('French sentences follow a steady backbone: who acts, the action, then what or whom it reaches.', 'La phrase française suit une colonne vertébrale stable : qui agit, l’action, puis ce qui reçoit l’action.'),
    [
      b('Keep Subject + Verb + Object in order', 'Respecter l’ordre Sujet + Verbe + Complément'),
      b('Include an explicit subject before every verb', 'Toujours exprimer un sujet devant le verbe'),
      b('Keep object nouns after the verb', 'Placer le nom complément après le verbe'),
    ],
    13,
    [
      card(
        b('The SVO backbone', 'La structure Sujet + Verbe + Complément'),
        b(
          'A standard French statement puts the **subject** first, the **conjugated verb** second, and the **object** after the verb. Unlike Spanish or Italian, French never drops the subject pronoun.\nCore order: **Subject, Verb, Object**.',
          'Une phrase déclarative française place d’abord le **sujet**, ensuite le **verbe conjugué**, puis le **complément**. Contrairement à l’espagnol ou à l’italien, le français n’omet jamais le pronom sujet.\nOrdre de base : **Sujet, Verbe, Complément**.',
        ),
        {
          table: {
            head: [b('Subject', 'Sujet'), b('Verb', 'Verbe'), b('Object / Complement', 'Complément')],
            rows: [
              ['Je', 'prends', 'le métro.'],
              ['Ma sœur', 'regarde', 'un film.'],
              ['Nous', 'parlons', 'français.'],
              ['Les clients', 'attendent', 'le serveur.'],
            ],
          },
          ex: [
            ['Je prends le métro.', 'I take the subway.'],
            ['Ma sœur regarde un film.', 'My sister is watching a movie.'],
            ['Les étudiants écoutent le professeur.', 'The students listen to the teacher.'],
          ],
        },
      ),
      tip(
        b('Do not split subject and verb', 'Ne séparez pas le sujet du verbe'),
        b(
          'Keep the subject and its verb side by side. With a noun object, never push the verb to the end of the sentence.\nAvoid these traps: **missing subject, verb at end, split subject-verb**.',
          'Gardez le sujet et son verbe côte à côte. Avec un nom complément, ne rejetez jamais le verbe à la fin de la phrase.\nErreurs à éviter : **sujet absent, verbe à la fin, coupure sujet-verbe**.',
        ),
      ),
      mc(
        b('Which sentence follows natural French statement order?', 'Quelle phrase suit l’ordre naturel d’une phrase affirmative ?'),
        [
          'Paul prépare le dîner.',
          'Prépare Paul le dîner.',
          'Paul le dîner prépare.',
          'Prépare le dîner.',
        ],
        {
          explain: b('Statements follow Subject (Paul) + Verb (prépare) + Object (le dîner).', 'Une phrase affirmative suit l’ordre Sujet (Paul) + Verbe (prépare) + Complément (le dîner).'),
        },
      ),
      mc(
        b('How do you say "We are visiting the museum"?', 'Comment dit-on « We are visiting the museum » en ordre naturel ?'),
        [
          'Nous visitons le musée.',
          'Visitons le musée.',
          'Nous le musée visitons.',
          'Le musée nous visitons.',
        ],
        {
          explain: b('French requires the subject pronoun nous right before visitons, followed by le musée.', 'Le français exige le pronom sujet nous juste devant visitons, suivi de le musée.'),
        },
      ),
      ord(
        P.order,
        'Mon frère lit un journal.',
        {
          tr: 'My brother is reading a newspaper.',
          extra: ['lis'],
          explain: b('Subject (Mon frère) + conjugated verb (lit) + object (un journal).', 'Sujet (Mon frère) + verbe conjugué (lit) + complément (un journal).'),
        },
      ),
      ord(
        P.order,
        'Camille achète des fleurs pour sa mère.',
        {
          tr: 'Camille buys flowers for her mother.',
          extra: ['achètent'],
        },
      ),
      pairs(
        b('Match each subject with the verb and object that complete the sentence.', 'Associez chaque sujet au verbe et au complément qui complètent la phrase.'),
        [
          ['Le boulanger', 'prépare du pain frais.'],
          ['Nos voisins', 'promènent leur chien.'],
          ['Tu', 'écris une carte postale.'],
          ['J’', 'ouvre la fenêtre.'],
        ],
        true,
      ),
      dict('Mes amis partagent une grande pizza.', {
        hint: b('Plural verb ending -ent on partagent.', 'Terminaison plurielle -ent pour partagent.'),
      }),
      say('Je cherche mon passeport et mes clés.', 'I am looking for my passport and my keys.'),
    ],
    [
      b('Neutral French statement order is Subject + Verb + Object.', 'L’ordre neutre d’une phrase française est Sujet + Verbe + Complément.'),
      b('Every conjugated verb needs an explicit subject before it.', 'Tout verbe conjugué a besoin d’un sujet exprimé devant lui.'),
      b('Keep the noun object directly after the verb, never before it.', 'Le nom complément reste après le verbe, jamais avant.'),
    ],
    [
      ['le métro', b('the subway', 'le train souterrain')],
      ['le boulanger', b('the baker', 'la personne qui fait le pain')],
      ['partager', b('to share', 'diviser avec d’autres')],
      ['la fenêtre', b('the window', 'l’ouverture vitrée')],
    ],
  ),

  lesson(
    C,
    2,
    ['time-and-place-order', 'place-du-temps-et-du-lieu'],
    b('Where to put time and place', 'Placer le temps et le lieu'),
    b('Time and place frames go at the start or end of a sentence—never between the subject and the verb.', 'Les repères de temps et de lieu vont au début ou à la fin de la phrase, jamais entre le sujet et le verbe.'),
    [
      b('Place time words at the start or end', 'Placer le temps en début ou en fin de phrase'),
      b('Put place expressions after the verb and object', 'Mettre le lieu après le verbe et son complément'),
      b('Never interrupt Subject + Verb with a time or place phrase', 'Ne jamais couper Sujet + Verbe avec le temps ou le lieu'),
    ],
    13,
    [
      card(
        b('Time and place slots', 'Les places du temps et du lieu'),
        b(
          'A **time** expression can open the sentence (with a comma) or close it. A **place** expression normally follows the verb and object. When both appear at the end, **place usually comes before time**.\nTime markers: **ce matin, aujourd’hui, le samedi**.\nPlace markers: **à Lyon, au bureau, chez moi**.',
          'Un complément de **temps** peut ouvrir la phrase (avec une virgule) ou la fermer. Un complément de **lieu** suit normalement le verbe et le complément d’objet. Quand les deux sont à la fin, **le lieu précède souvent le temps**.\nRepères de temps : **ce matin, aujourd’hui, le samedi**.\nRepères de lieu : **à Lyon, au bureau, chez moi**.',
        ),
        {
          table: {
            head: [b('Opening frame', 'Ouverture'), b('Core SVO', 'Cœur SVC'), b('Place', 'Lieu'), b('End frame', 'Temps final')],
            rows: [
              ['Le matin,', 'je bois un thé', 'à la cuisine.', '—'],
              ['—', 'Nous dînons', 'au restaurant', 'ce soir.'],
              ['Demain,', 'Claire retrouve Paul', 'devant la gare.', '—'],
            ],
          },
          ex: [
            ['Le matin, je bois un café.', 'In the morning, I drink a coffee.'],
            ['Nous déjeunons à la cantine à midi.', 'We have lunch at the cafeteria at noon.'],
            ['Tu travailles à la maison aujourd’hui ?', 'Are you working from home today?'],
          ],
        },
      ),
      trap(
        b('Never wedge time between subject and verb', 'Ne glissez pas le temps entre le sujet et le verbe'),
        b(
          'Unlike English (“I usually work…” or “I today saw…”), French does not put time phrases between the subject and verb. Say **Aujourd’hui, je travaille** or **Je travaille aujourd’hui**, never *Je aujourd’hui travaille*.\nValid slots: **start of sentence, end of sentence, after place**.',
          'Contrairement à certaines tournures anglaises, le français ne met pas le complément de temps entre le sujet et le verbe. Dites **Aujourd’hui, je travaille** ou **Je travaille aujourd’hui**, jamais *Je aujourd’hui travaille*.\nPlaces valides : **début de phrase, fin de phrase, après le lieu**.',
        ),
      ),
      mc(
        b('Choose the natural French sentence.', 'Choisissez la phrase française naturelle.'),
        [
          'Demain, nous prenons le train à la gare.',
          'Nous demain prenons le train à la gare.',
          'Nous prenons demain à la gare le train.',
          'Prendrons à la gare demain le train nous.',
        ],
      ),
      hear(
        'Le samedi matin, Luc achète des croissants à la boulangerie.',
        b('When does Luc go to the bakery?', 'Quand Luc va-t-il à la boulangerie ?'),
        [
          b('On Saturday mornings', 'Le samedi matin'),
          b('On Sunday evenings', 'Le dimanche soir'),
          b('Every weekday at noon', 'Tous les midis en semaine'),
        ],
      ),
      sort(
        b('Sort each expression into Time or Place.', 'Classez chaque expression selon qu’elle indique le temps ou le lieu.'),
        [b('Time', 'Temps'), b('Place', 'Lieu')],
        [
          ['aujourd’hui', 0],
          ['à la gare', 1],
          ['le vendredi soir', 0],
          ['au centre-ville', 1],
          ['la semaine prochaine', 0],
          ['chez mes parents', 1],
        ],
      ),
      gap(
        P.complete,
        '___, je travaille ___ avec mon équipe.',
        [['Ce matin'], ['au bureau']],
        {
          choices: [
            ['Ce matin', 'Au bureau', 'Mange'],
            ['au bureau', 'ce matin', 'demain'],
          ],
          explain: b('Time sets the opening frame (Ce matin,), while place follows the verb (au bureau).', 'Le temps ouvre la phrase (Ce matin,), tandis que le lieu suit le verbe (au bureau).'),
        },
      ),
      ord(
        P.order,
        'Demain, Sophie retrouve ses amis au café.',
        {
          tr: 'Tomorrow, Sophie meets her friends at the café.',
          alt: ['Sophie retrouve ses amis au café demain.'],
          extra: ['retrouvent'],
          explain: b('Time works at the start (Demain, ...) or at the very end (... demain.).', 'Le temps fonctionne au début (Demain, ...) ou tout à la fin (... demain.).'),
        },
      ),
      dict('Le dimanche, nous déjeunons chez mes grands-parents.'),
      say('Ce soir, je dîne dans un petit restaurant.', 'Tonight, I am having dinner in a small restaurant.'),
    ],
    [
      b('Put time frames at the start or end of the sentence.', 'Placez le temps en début ou en fin de phrase.'),
      b('Put place phrases after the verb and object.', 'Placez le lieu après le verbe et le complément d’objet.'),
      b('Never place time or place between the subject and the verb.', 'Ne coupez jamais le sujet et le verbe par un repère de temps ou de lieu.'),
    ],
    [
      ['la boulangerie', b('the bakery', 'le magasin de pain')],
      ['la gare', b('the train station', 'la station de trains')],
      ['chez moi', b('at my place', 'à mon domicile')],
      ['retrouver', b('to meet up with', 'rejoindre quelqu’un')],
    ],
  ),

  lesson(
    C,
    3,
    ['negatives-and-adverbs-order', 'place-de-la-negation-et-des-adverbes'],
    b('Negatives and adverbs around the verb', 'La négation et les adverbes autour du verbe'),
    b('Wrap ne … pas around the conjugated verb and place short frequency adverbs right after it.', 'Encadrez le verbe conjugué avec ne … pas et placez les adverbes courts juste après lui.'),
    [
      b('Frame the conjugated verb with ne … pas', 'Encadrer le verbe conjugué avec ne … pas'),
      b('Switch ne to n’ before a vowel or silent h', 'Transformer ne en n’ devant une voyelle ou un h muet'),
      b('Place short adverbs right after the conjugated verb', 'Placer les adverbes courts juste après le verbe conjugué'),
    ],
    13,
    [
      card(
        b('Around the conjugated verb', 'Autour du verbe conjugué'),
        b(
          'In a negative sentence, **ne** (or **n’** before a vowel/silent h) goes right before the conjugated verb, and **pas** goes right after it. Short adverbs like **souvent, toujours, bien, beaucoup, déjà** also go right after the conjugated verb—never before it.\nCommon adverbs: **souvent, toujours, beaucoup, bien, déjà**.\nNegative frames: **ne … pas, n’… pas, ne … jamais**.',
          'À la forme négative, **ne** (ou **n’** devant voyelle ou h muet) se place juste avant le verbe conjugué, et **pas** juste après. Les adverbes courts comme **souvent, toujours, bien, beaucoup, déjà** se placent aussi juste après le verbe conjugué, jamais avant.\nAdverbes courants : **souvent, toujours, beaucoup, bien, déjà**.\nFormes négatives : **ne … pas, n’… pas, ne … jamais**.',
        ),
        {
          table: {
            head: [b('Pattern', 'Modèle'), b('Example', 'Exemple')],
            rows: [
              [b('ne + verb + pas', 'ne + verbe + pas'), 'Je ne regarde pas la télé.'],
              [b('n’ + vowel verb + pas', 'n’ + verbe à voyelle + pas'), 'Il n’aime pas le bruit.'],
              [b('verb + short adverb', 'verbe + adverbe court'), 'Elle parle souvent français.'],
              [b('ne + verb + pas + adverb', 'ne + verbe + pas + adverbe'), 'Nous ne sortons pas souvent.'],
            ],
          },
          ex: [
            ['Je ne travaille pas le dimanche.', 'I do not work on Sundays.'],
            ['Nous écoutons toujours la radio le matin.', 'We always listen to the radio in the morning.'],
            ['Elle n’habite plus dans ce quartier.', 'She no longer lives in this neighborhood.'],
          ],
        },
      ),
      tip(
        b('Short adverbs vs. long time phrases', 'Adverbes courts vs longs groupes de temps'),
        b(
          'One-word adverbs (**souvent, parfois, toujours**) hug the verb from the right: *Je lis souvent le soir*. Multi-word phrases (**le soir, tous les jours**) stay at the start or end.\nVerb-hugging adverbs: **toujours, souvent, rarement, déjà**.',
          'Les adverbes en un mot (**souvent, parfois, toujours**) suivent directement le verbe : *Je lis souvent le soir*. Les groupes de plusieurs mots (**le soir, tous les jours**) restent au début ou à la fin.\nAdverbes après le verbe : **toujours, souvent, rarement, déjà**.',
        ),
      ),
      mc(
        b('Where does souvent go in "My sister often cooks at home"?', 'Où se place souvent dans cette phrase ?'),
        [
          'Ma sœur cuisine souvent à la maison.',
          'Ma sœur souvent cuisine à la maison.',
          'Souvent ma sœur à la maison cuisine.',
          'Ma sœur cuisine à la maison souvent ne.',
        ],
        {
          explain: b('Place short adverbs like souvent right after the conjugated verb (cuisine souvent).', 'Placez un adverbe court comme souvent juste après le verbe conjugué (cuisine souvent).'),
        },
      ),
      mc(
        b('Choose the correct negative sentence.', 'Choisissez la phrase négative correcte.'),
        [
          'Il n’écoute pas la radio.',
          'Il ne écoute pas la radio.',
          'Il écoute ne pas la radio.',
          'Il n’pas écoute la radio.',
        ],
        {
          explain: b('Before écoute, ne elides to n’, and pas follows the conjugated verb.', 'Devant écoute, ne devient n’ et pas suit le verbe conjugué.'),
        },
      ),
      gap(
        P.complete,
        'Je ___ travaille ___ le mercredi après-midi, et ___ pas loin du parc.',
        [['ne'], ['pas'], ['je n’habite']],
        {
          choices: [
            ['ne', 'n’', 'pas'],
            ['pas', 'ne', 'jamais'],
            ['je n’habite', 'je ne habite', 'j’habite'],
          ],
        },
      ),
      ord(
        P.order,
        'Nous ne prenons pas le bus aujourd’hui.',
        {
          tr: 'We are not taking the bus today.',
          extra: ['prennent'],
        },
      ),
      ord(
        P.order,
        'Tu arrives toujours à l’heure au travail.',
        {
          tr: 'You always arrive on time at work.',
          extra: ['arrive'],
        },
      ),
      sort(
        b('Sort by where each word or phrase usually goes.', 'Classez chaque mot ou groupe selon sa place habituelle.'),
        [b('Right after the verb', 'Juste après le verbe'), b('Start or end of sentence', 'Début ou fin de phrase')],
        [
          ['toujours', 0],
          ['le mardi matin', 1],
          ['souvent', 0],
          ['dans ce quartier', 1],
          ['beaucoup', 0],
          ['tous les week-ends', 1],
        ],
      ),
      dlg(
        b('At the neighborhood café', 'Au café du quartier'),
        b('Nadia and Léo talk about their weekday habits.', 'Nadia et Léo parlent de leurs habitudes en semaine.'),
        [['Nadia', 'f'], ['Léo', 'm']],
        [
          [0, 'Tu prends souvent ton café ici le matin ?', 'Do you often have your coffee here in the morning?'],
          [1, {
            options: [
              'Oui, je viens toujours avant le bureau.',
              'Oui, je toujours viens avant le bureau.',
              'Oui, ne je viens pas avant le bureau.',
            ],
            explain: b('The adverb toujours sits right after viens.', 'L’adverbe toujours se place juste après viens.'),
          }],
          [0, 'Tu travailles au centre-ville toute la semaine ?', 'Do you work downtown all week?'],
          [1, {
            options: [
              'Non, je ne vais pas au bureau le vendredi.',
              'Non, je vais ne pas au bureau le vendredi.',
              'Non, au bureau je pas ne vais le vendredi.',
            ],
          }],
          [0, 'Moi aussi, je reste chez moi le vendredi !', 'Me too, I stay home on Fridays!'],
        ],
      ),
      write(
        b('Write about your routine.', 'Décrivez votre routine.'),
        b('Write 3–4 sentences about your day: include a time phrase, a place, one adverb (souvent or toujours), and one negative sentence (ne … pas).', 'Écrivez 3 ou 4 phrases sur votre journée : ajoutez un repère de temps, un lieu, un adverbe (souvent ou toujours) et une phrase négative (ne … pas).'),
        22,
        42,
        [
          b('Keep Subject + Verb + Object order', 'Respecter l’ordre Sujet + Verbe + Complément'),
          b('Place time at the start or end', 'Placer le temps au début ou à la fin'),
          b('Put an adverb right after the conjugated verb', 'Mettre un adverbe juste après le verbe conjugué'),
          b('Wrap ne … pas around one verb', 'Encadrer un verbe avec ne … pas'),
        ],
        'Le matin, je prends un café à la cuisine. Je travaille souvent au bureau, mais je ne reste pas tard le vendredi. Le soir, je retrouve mes amis au parc.',
      ),
    ],
    [
      b('ne (or n’) goes before the conjugated verb; pas goes right after it.', 'ne (ou n’) se place avant le verbe conjugué ; pas juste après.'),
      b('Short adverbs (souvent, toujours, bien, beaucoup) follow the conjugated verb immediately.', 'Les adverbes courts (souvent, toujours, bien, beaucoup) suivent immédiatement le verbe conjugué.'),
      b('Longer time or place phrases frame the sentence without splitting subject and verb.', 'Les groupes de temps ou de lieu encadrent la phrase sans couper le sujet et le verbe.'),
    ],
    [
      ['souvent', b('often', 'fréquemment')],
      ['toujours', b('always', 'chaque fois')],
      ['le bruit', b('noise', 'un son fort ou gênant')],
      ['le quartier', b('neighborhood', 'une zone de la ville')],
    ],
  ),
];

export default lessons;
