import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In French, colours carry unexpected emotional codes—and false friends for English speakers! Laughing yellow means forced amusement, a blue fear means sheer terror, a white night means no sleep at all, and green rage means absolute fury. This B2 course explores fifteen nuanced colour idioms across social reactions, mood, crowds and setbacks.',
    'En français, les couleurs portent des nuances psychologiques parfois inattendues : rire jaune, passer une nuit blanche, avoir une peur bleue, faire grise mine ou être vert de rage. Ce cours B2 explore quinze expressions colorées entre humeurs, réactions sociales, autorité et contretemps.',
  ),
  outcomes: [
    b('Decode social and emotional nuances in yellow, red and white idioms', 'Décoder les nuances sociales et affectives des expressions en jaune, rouge et blanc'),
    b('Distinguish French blue, black, pink and grey idioms from English false friends', 'Distinguer les expressions en bleu, noir, rose et gris des faux amis de l’anglais'),
    b('Use green and multi-colour idioms accurately with proper syntax and register', 'Employer avec précision les expressions en vert et de toutes les couleurs'),
  ],
};

const C = 'exp-colours-symbolism';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['yellow-red-and-white', 'jaune-rouge-et-blanc'],
    b('Yellow, red & white: embarrassment, trust & sleepless nights', 'Jaune, rouge et blanc : gêne, confiance et nuits sans sommeil'),
    b('Master rire jaune, être rouge de honte, passer une nuit blanche, donner carte blanche and montrer patte blanche.', 'Maîtriser rire jaune, être rouge de honte, passer une nuit blanche, donner carte blanche et montrer patte blanche.'),
    [
      b('Contrast forced laughter (rire jaune) with blushing embarrassment (être rouge de honte)', 'Opposer le rire forcé (rire jaune) à la confusion (être rouge de honte)'),
      b('Express sleeplessness (passer une nuit blanche) and full trust (donner carte blanche)', 'Exprimer l’insomnie (nuit blanche) et la liberté totale (carte blanche)'),
      b('Use montrer patte blanche for proving trustworthiness or credentials', 'Employer montrer patte blanche pour prouver sa fiabilité'),
    ],
    13,
    [
      card(
        b('Yellow, red and white symbolism', 'Symbolique du jaune, du rouge et du blanc'),
        b(
          'In French colour idioms, **jaune** often signals unease or falseness (**rire jaune**), **rouge** shows intense emotion rising to the cheeks (**être rouge de honte**), and **blanc / blanche** suggests emptiness, purity or a blank page (**passer une nuit blanche, donner carte blanche, montrer patte blanche**).\n\nReactions: **rire jaune, être rouge de honte**.\nBlank slate & proof: **passer une nuit blanche, donner carte blanche, montrer patte blanche**.',
          'Dans les expressions françaises, le **jaune** évoque souvent la gêne ou le malaise (**rire jaune**), le **rouge** l’émotion qui monte au visage (**être rouge de honte**), et le **blanc / blanche** le vide, l’innocence ou la page vierge (**passer une nuit blanche, donner carte blanche, montrer patte blanche**).\n\nRéactions : **rire jaune, être rouge de honte**.\nPage vierge et preuve : **passer une nuit blanche, donner carte blanche, montrer patte blanche**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Nuanced meaning', 'Sens nuancé')],
            rows: [
              ['rire jaune', b('to laugh yellow', 'sourire avec amertume'), b('to give a forced, wry or uneasy laugh', 'rire par gêne ou dépit sans envie')],
              ['être rouge de honte', b('to be red with shame', 'rougir de confusion'), b('to blush deeply from embarrassment', 'être extrêmement gêné, confus')],
              ['passer une nuit blanche', b('to spend a white night', 'nuit sans sommeil'), b('to have a completely sleepless night', 'ne pas dormir de la nuit')],
              ['donner carte blanche', b('to give a blank card', 'donner un document vierge signé'), b('to give free rein / full discretion', 'accorder une totale liberté d’action')],
              ['montrer patte blanche', b('to show a white paw', 'montrer patte innocente'), b('to prove one’s identity or trustworthiness', 'prouver sa bonne foi ou ses garanties')],
            ],
          },
          ex: [
            ['Quand son collègue a repris son idée en réunion, Marc a ri jaune.', 'When his colleague took credit for his idea in the meeting, Marc gave a forced laugh.'],
            ['Après avoir envoyé le message au mauvais destinataire, elle était rouge de honte.', 'After sending the message to the wrong recipient, she was blushing furiously with embarrassment.'],
            ['Pour entrer dans le bâtiment sécurisé, chaque visiteur doit montrer patte blanche.', 'To enter the secure building, every visitor has to present valid credentials.'],
          ],
        },
      ),
      culture(
        b('From La Fontaine’s fable to medieval vigils', 'De La Fontaine aux veillées de chevaliers'),
        b(
          '**Montrer patte blanche** comes straight from Jean de La Fontaine’s fable *Le Loup, la Chèvre et le Chevreau*: the little kid refuses to open the door until the visitor slips a white paw under it! **Passer une nuit blanche** recalls medieval knights dressed in white staying awake in prayer all night before their dubbing, while **carte blanche** originally meant a signed blank sheet giving an envoy unlimited authority.\n\nNotice: **donner carte blanche à quelqu’un** never takes an article before *carte*.',
          '**Montrer patte blanche** vient tout droit de la fable de La Fontaine *Le Loup, la Chèvre et le Chevreau* : le chevreau exige de voir patte blanche avant d’ouvrir ! **Passer une nuit blanche** rappelle la veillée nocturne des futurs chevaliers vêtus de blanc, et **carte blanche** désignait une feuille signée d’avance laissant toute liberté.\n\nSyntaxe : **donner carte blanche à quelqu’un** s’emploie sans article devant *carte*.',
        ),
      ),
      flash(b('Yellow, red & white idioms', 'Expressions jaune, rouge et blanc'), [
        ['rire jaune', b('to give a forced, wry laugh', 'rire par gêne ou dépit')],
        ['être rouge de honte', b('to blush deep red with embarrassment', 'éprouver une grande confusion')],
        ['passer une nuit blanche', b('to have a sleepless night / all-nighter', 'rester éveillé toute la nuit')],
        ['donner carte blanche', b('to give free rein / full authority', 'laisser toute liberté d’action')],
        ['montrer patte blanche', b('to prove credentials / good faith', 'prouver son identité ou son sérieux')],
      ]),
      mc(
        P.best,
        ['ri jaune', 'passé une nuit blanche', 'donné carte blanche', 'montré patte blanche'],
        {
          fr: 'Quand le présentateur a fait une blague gênante sur son retard, l’invité a ___ devant les caméras.',
          explain: b('A tight, uncomfortable smile or laugh in an awkward moment is rire jaune.', 'Un rire contraint face à une remarque gênante se dit rire jaune.'),
        },
      ),
      mc(
        P.meaning,
        [
          b('The director granted the designer complete creative freedom.', 'La directrice a laissé une totale liberté de création à la graphiste.'),
          b('The director asked the designer to verify her badge at reception.', 'La directrice a demandé à la graphiste de présenter son badge.'),
          b('The director rejected the project after reading it overnight.', 'La directrice a rejeté le projet après une nuit sans sommeil.'),
          b('The director felt deeply embarrassed by the draft.', 'La directrice était très gênée par la première maquette.'),
        ],
        {
          fr: 'Pour la nouvelle affiche du festival, la directrice a donné carte blanche à la graphiste.',
          explain: b('Donner carte blanche à quelqu’un means entrusting them with total freedom to act.', 'Donner carte blanche à quelqu’un signifie lui accorder toute confiance et toute liberté.'),
        },
      ),
      pairs(P.match, [
        ['rire jaune', b('to laugh wryly / awkwardly', 'rire sans joie réelle, par gêne')],
        ['être rouge de honte', b('to blush furiously', 'être mortifié par une bévue')],
        ['passer une nuit blanche', b('to pull an all-nighter / not sleep', 'ne pas fermer l’œil de la nuit')],
        ['donner carte blanche', b('to give full discretion', 'accorder toute liberté de décision')],
        ['montrer patte blanche', b('to prove trustworthiness / credentials', 'donner des garanties pour être admis')],
      ]),
      gap(
        P.complete,
        'J’ai passé une nuit ___ pour boucler ce dossier avant l’audit, car il fallait montrer patte ___ auprès de la commission, qui nous a finalement donné ___ blanche pour la suite.',
        [['blanche'], ['blanche'], ['carte']],
        {
          choices: [
            ['blanche', 'jaune', 'noire'],
            ['blanche', 'verte', 'rouge'],
            ['carte', 'patte', 'main'],
          ],
          explain: b('Combine passer une nuit blanche, montrer patte blanche, and donner carte blanche.', 'On retrouve passer une nuit blanche, montrer patte blanche et donner carte blanche.'),
        },
      ),
      hear(
        'Le nouveau prestataire a dû montrer patte blanche en fournissant trois références avant que le conseil ne lui donne carte blanche sur le chantier.',
        b('What happened before the contractor got full freedom?', 'Que s’est-il passé avant que le prestataire obtienne carte blanche ?'),
        [
          b('He had to prove his reliability with three references first.', 'Il a d’abord dû prouver son sérieux avec trois références.'),
          b('He stayed up all night writing a formal apology.', 'Il a passé la nuit à rédiger des excuses.'),
          b('He laughed uneasily during the committee interview.', 'Il a ri jaune pendant l’entretien devant le conseil.'),
        ],
      ),
      dict('Après une nuit blanche, elle était rouge de honte d’avoir oublié ses notes.'),
      say('Quand il a lu l’article critique, il a ri jaune mais nous a tout de même donné carte blanche.', 'When he read the critical article, he gave a wry laugh yet still gave us free rein.'),
    ],
    [
      b('rire jaune = forced/uneasy laugh; être rouge de honte = blush deeply with embarrassment.', 'rire jaune = rire contraint ; être rouge de honte = être confus.'),
      b('passer une nuit blanche = get zero sleep; donner carte blanche (no article) = grant full freedom.', 'passer une nuit blanche = ne pas dormir ; donner carte blanche (sans article) = laisser carte libre.'),
      b('montrer patte blanche = prove identity, innocence or trustworthiness.', 'montrer patte blanche = prouver sa bonne foi ou ses garanties.'),
    ],
    [
      ['rire jaune', b('to laugh wryly / awkwardly', 'rire par gêne ou dépit')],
      ['être rouge de honte', b('to blush deep red with shame', 'être mortifié de honte')],
      ['passer une nuit blanche', b('to have a sleepless night', 'ne pas dormir de la nuit')],
      ['donner carte blanche', b('to give free rein', 'laisser toute liberté d’action')],
      ['montrer patte blanche', b('to prove one’s credentials / good faith', 'prouver sa fiabilité')],
    ],
  ),

  lesson(
    C,
    2,
    ['blue-black-and-grey', 'bleu-noir-et-gris'],
    b('Blue, black, pink & grey: fear, gloom & packed rooms', 'Bleu, noir, rose et gris : peur, morosité et foule'),
    b('Avoid English false friends with blue, decode black gloom vs packed crowds and read grim expressions.', 'Éviter les faux amis autour du bleu, distinguer morosité et foule noire de monde, et décoder grise mine.'),
    [
      b('Distinguish avoir une peur bleue (terror) from broyer du noir (dark gloom)', 'Distinguer frayeur intense (peur bleue) et mélancolie sombre (broyer du noir)'),
      b('Contrast seeing life positively (voir la vie en rose) with looking glum (faire grise mine)', 'Opposer optimisme (voir la vie en rose) et air renfrogné (faire grise mine)'),
      b('Use être noir de monde naturally for packed places', 'Employer être noir de monde pour une foule dense'),
    ],
    13,
    [
      card(
        b('Blue, rose, black and grey', 'Bleu, rose, noir et gris en contexte'),
        b(
          'Beware of false friends! In French, **avoir une peur bleue** means sheer terror, NOT feeling sad. Deep sadness or brooding is **broyer du noir**, whereas bright optimism is **voir la vie en rose**. Notice also **faire grise mine** (to look glum or displeased) and **être noir de monde** (packed wall to wall with people).\n\nFear & mood: **avoir une peur bleue, broyer du noir, voir la vie en rose**.\nAppearance & crowd: **faire grise mine, être noir de monde**.',
          'Méfiez-vous des faux amis ! En français, **avoir une peur bleue** exprime une terreur soudaine, jamais la tristesse. La déprime sombre se dit **broyer du noir**, tandis que l’optimisme rayonnant se dit **voir la vie en rose**. Ajoutez **faire grise mine** (avoir l’air contrarié) et **être noir de monde** (comble de foule).\n\nPeur et humeur : **avoir une peur bleue, broyer du noir, voir la vie en rose**.\nVisage et foule : **faire grise mine, être noir de monde**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Nuanced meaning', 'Sens nuancé')],
            rows: [
              ['avoir une peur bleue', b('to have a blue fear', 'avoir très peur'), b('to be scared stiff, terrified', 'éprouver une frayeur intense')],
              ['voir la vie en rose', b('to see life in pink', 'tout voir en rose'), b('to be upbeat / look on the bright side', 'être très optimiste')],
              ['broyer du noir', b('to grind black pigment', 'broyer du noir (peinture)'), b('to brood, feel deeply gloomy', 'avoir des pensées tristes, déprimer')],
              ['faire grise mine', b('to make a grey face', 'prendre un air sombre'), b('to pull a long face, look glum', 'paraître mécontent, déçu ou inquiet')],
              ['être noir de monde', b('to be black with people', 'masse sombre de foule'), b('to be packed / crowded to capacity', 'être rempli d’une foule dense')],
            ],
          },
          ex: [
            ['Quand l’orage a coupé l’électricité dans l’ascenseur, nous avons eu une peur bleue.', 'When the storm cut power in the elevator, we were scared stiff.'],
            ['Depuis qu’elle a trouvé ce stage à Montréal, Nadia voit vraiment la vie en rose.', 'Since finding that internship in Montréal, Nadia has been looking on the bright side.'],
            ['Le samedi après-midi, le marché couvert est toujours noir de monde.', 'On Saturday afternoons, the covered market is always packed with people.'],
          ],
        },
      ),
      trap(
        b('Syntax traps: grise before mine, and noir agrees with the place', 'Pièges de syntaxe : grise mine et noir de monde'),
        b(
          'In **faire grise mine**, the adjective **grise** ALWAYS stands before **mine** with NO article (*Il fait grise mine*, never *une mine grise*!). In **être noir de monde**, the subject is a place (*le hall, la place, les rues*), and **noir** agrees with that place: **La place était noire de monde**, **Les quais sont noirs de monde**. And remember: **broyer du noir** comes from grinding dark paint pigments in an artist’s studio!\n\nCorrect: **La salle est noire de monde · Il fait grise mine**.\nFalse friend alert: **avoir une peur bleue** = terror, NOT sadness.',
          'Dans **faire grise mine**, l’adjectif **grise** précède toujours **mine**, sans article (*Il fait grise mine*, jamais *une mine grise* !). Dans **être noir de monde**, le sujet désigne un lieu et **noir** s’accorde avec ce lieu : **La place était noire de monde**, **Les quais sont noirs de monde**. Rappelez-vous aussi que **broyer du noir** vient des ateliers de peinture !\n\nCorrect : **La salle est noire de monde · Il fait grise mine**.\nFaux ami : **avoir une peur bleue** = terreur, et non tristesse.',
        ),
      ),
      flash(b('Blue, black & grey idioms', 'Expressions bleu, noir et gris'), [
        ['avoir une peur bleue', b('to be scared stiff', 'ressentir une frayeur intense')],
        ['voir la vie en rose', b('to look on the bright side', 'tout voir avec optimisme')],
        ['broyer du noir', b('to brood, feel deeply gloomy', 'entretenir des pensées sombres')],
        ['faire grise mine', b('to look glum / pull a long face', 'montrer un air déçu ou contrarié')],
        ['être noir de monde', b('to be packed with people', 'être bondé d’une foule compacte')],
      ]),
      mc(
        P.best,
        ['est noire de monde', 'fait grise mine', 'broie du noir', 'a une peur bleue'],
        {
          fr: 'Impossible d’avancer sur la promenade des Anglais pendant le carnaval : l’avenue ___ !',
          explain: b('A street packed with a huge crowd is noire de monde (agreeing with l’avenue).', 'Une avenue remplie de foule se dit noire de monde (accord avec l’avenue).'),
        },
      ),
      mc(
        P.meaning,
        [
          b('He looks visibly displeased or gloomy about the announcement.', 'Il a l’air contrarié ou déçu par cette annonce.'),
          b('He is delighted and congratulating everyone.', 'Il est ravi et félicite tout le monde.'),
          b('He is painting his studio walls grey.', 'Il repeint les murs de son atelier.'),
          b('He was startled by a sudden loud noise.', 'Il a sursauté à cause d’un bruit soudain.'),
        ],
        {
          fr: 'Depuis l’annonce des nouveaux horaires, le chef d’équipe fait grise mine.',
          explain: b('Faire grise mine means showing visible disappointment, worry or displeasure on one’s face.', 'Faire grise mine signifie afficher un visage fermé, déçu ou mécontent.'),
        },
      ),
      sort(
        b('Sort each idiom: dark mood or fear vs optimism or packed crowd.', 'Classez : peur et morosité vs optimisme et affluence.'),
        [
          b('Fear, gloom or displeasure', 'Peur, morosité ou air contrarié'),
          b('Optimism or dense crowd', 'Optimisme ou lieu bondé'),
        ],
        [
          ['avoir une peur bleue', 0],
          ['voir la vie en rose', 1],
          ['broyer du noir', 0],
          ['être noir de monde', 1],
          ['faire grise mine', 0],
          ['voir le bon côté des choses', 1],
        ],
      ),
      gap(
        P.complete,
        'Quand le chien a surgi dans le noir, j’ai eu une ___ bleue ! Heureusement, mon amie voit toujours la vie en ___ et m’a empêché de broyer du ___.',
        [['peur'], ['rose'], ['noir']],
        {
          choices: [
            ['peur', 'nuit', 'mine'],
            ['rose', 'vert', 'jaune'],
            ['noir', 'blanc', 'rouge'],
          ],
          explain: b('Combine avoir une peur bleue, voir la vie en rose, and broyer du noir.', 'On associe avoir une peur bleue, voir la vie en rose et broyer du noir.'),
        },
      ),
      ord(
        P.order,
        'La gare était noire de monde vendredi soir.',
        {
          tr: 'The station was packed with people on Friday evening.',
          extra: ['grise', 'bleue'],
          explain: b('Noire agrees with feminine singular la gare.', 'L’adjectif noire s’accorde au féminin singulier avec la gare.'),
        },
      ),
      hear(
        'En hiver, quand la pluie tombe sans arrêt, Thomas a tendance à broyer du noir et à faire grise mine, mais dès le premier rayon de soleil il voit la vie en rose.',
        b('How does the weather affect Thomas?', 'Comment la météo influence-t-elle Thomas ?'),
        [
          b('Rain makes him gloomy and glum, while sunshine immediately lifts his mood.', 'La pluie le rend morose et fermé, tandis que le soleil le rend optimiste.'),
          b('Storms make him terrified to leave the house.', 'Les orages lui donnent une peur bleue de sortir.'),
          b('Crowded cafés in winter make him feel cheerful.', 'Les cafés bondés l’hiver lui donnent le sourire.'),
        ],
        { voice: 'm' },
      ),
      say('Même quand la salle fait grise mine, elle garde le sourire et refuse de broyer du noir.', 'Even when the room looks glum, she keeps smiling and refuses to brood.'),
    ],
    [
      b('avoir une peur bleue = be terrified (never “feel sad”!); broyer du noir = brood / feel depressed.', 'avoir une peur bleue = avoir très peur (jamais « être triste » !) ; broyer du noir = avoir des idées sombres.'),
      b('voir la vie en rose = stay cheerful and optimistic; faire grise mine = look glum or displeased (grise before mine, no article).', 'voir la vie en rose = être optimiste ; faire grise mine = avoir l’air contrarié (grise avant mine, sans article).'),
      b('être noir de monde = be packed with a crowd (noir agrees with the place noun).', 'être noir de monde = être bondé (accord de noir avec le lieu).'),
    ],
    [
      ['avoir une peur bleue', b('to be scared stiff', 'avoir très peur')],
      ['voir la vie en rose', b('to see life through rose-tinted glasses', 'tout voir avec optimisme')],
      ['broyer du noir', b('to brood, feel deeply gloomy', 'avoir des pensées tristes')],
      ['faire grise mine', b('to look glum, pull a long face', 'afficher un air mécontent ou déçu')],
      ['être noir de monde', b('to be packed with people', 'être rempli d’une foule compacte')],
    ],
  ),

  lesson(
    C,
    3,
    ['green-and-colour-nuances', 'vert-et-toutes-les-couleurs'],
    b('Green & “all the colours”: permission, rage & trials', 'Le vert et toutes les couleurs : feu vert, fureur et épreuves'),
    b('Distinguish gardening talent, green fury, official approval, stunned silence and tough ordeals.', 'Distinguer main verte, rage, feu vert, stupeur et épreuves difficiles avec justesse.'),
    [
      b('Contrast gardening skill (avoir la main verte) with extreme anger (être vert de rage)', 'Opposer le don du jardinage (main verte) à la colère (vert de rage)'),
      b('Use donner le feu vert for official approval and rester bleu for stunned amazement', 'Employer donner le feu vert (autoriser) et rester bleu (être stupéfait)'),
      b('Master indirect pronouns in en faire voir de toutes les couleurs', 'Maîtriser le pronom indirect dans en faire voir de toutes les couleurs'),
    ],
    13,
    [
      card(
        b('Green nuances and full-spectrum trouble', 'Les nuances du vert et toutes les couleurs'),
        b(
          'Green splits cleanly between nature and strong emotion: **avoir la main verte** means a knack for growing plants, **donner le feu vert** gives official permission to proceed, and **être vert de rage** signals seething anger. Meanwhile, **rester bleu** captures speechless astonishment, and **en faire voir de toutes les couleurs à quelqu’un** means putting someone through every kind of trouble.\n\nGreen idioms: **avoir la main verte, donner le feu vert, être vert de rage**.\nShock & trials: **rester bleu, en faire voir de toutes les couleurs**.',
          'Le vert couvre le jardin, l’autorisation et la fureur : **avoir la main verte** désigne le talent pour les plantes, **donner le feu vert** l’accord officiel, et **être vert de rage** une colère froide ou intense. Enfin, **rester bleu** signifie être sidéré, et **en faire voir de toutes les couleurs à quelqu’un** veut dire lui causer mille difficultés.\n\nExpressions en vert : **avoir la main verte, donner le feu vert, être vert de rage**.\nStupeur et épreuves : **rester bleu, en faire voir de toutes les couleurs**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Nuanced meaning', 'Sens nuancé')],
            rows: [
              ['avoir la main verte', b('to have the green hand', 'main favorable aux plantes'), b('to have a green thumb', 'être doué pour le jardinage')],
              ['être vert de rage', b('to be green with rage', 'verdir de colère'), b('to be livid, fuming with anger', 'être fou de rage, furieux')],
              ['donner le feu vert', b('to give the green traffic light', 'passer le feu au vert'), b('to give the green light / approve', 'autoriser un projet à démarrer')],
              ['rester bleu', b('to remain blue', 'rester figé, ébahi'), b('to be flabbergasted, stunned', 'rester bouche bée, stupéfait')],
              ['en faire voir de toutes les couleurs', b('make someone see all colours', 'faire vivre mille péripéties'), b('to put someone through hell / a hard time', 'causer de gros ennuis à quelqu’un')],
            ],
          },
          ex: [
            ['Sur son balcon, même les orchidées difficiles fleurissent : elle a vraiment la main verte.', 'On her balcony, even finicky orchids bloom: she really has a green thumb.'],
            ['Quand la mairie a enfin donné le feu vert, les travaux de la serre ont démarré.', 'When city hall finally gave the green light, work on the greenhouse began.'],
            ['Ce logiciel instable nous en a fait voir de toutes les couleurs pendant deux semaines.', 'That unstable software gave us a really hard time for two weeks.'],
          ],
        },
      ),
      tip(
        b('En faire voir de toutes les couleurs: mind the two pronouns!', 'Attention aux deux pronoms dans en faire voir de toutes les couleurs'),
        b(
          'Notice how **en faire voir de toutes les couleurs à quelqu’un** keeps both **en** (standing vaguely for hardships) and an indirect object (**me / te / lui / nous / leur**): **Cet enfant leur en fait voir de toutes les couleurs !** Also distinguish **être vert de rage** (furious, standard B2) from informal **être vert** (gutted/disappointed in casual speech), and remember **rester bleu** agrees when needed (*Elle est restée bleue devant cette nouvelle*).\n\nTwo pronouns: **Il nous en fait voir de toutes les couleurs**.',
          'Dans **en faire voir de toutes les couleurs à quelqu’un**, gardez bien les deux pronoms : le pronom indirect (**me / te / lui / nous / leur**) suivi de **en** : **Ce dossier nous en fait voir de toutes les couleurs !** Distinguez aussi **être vert de rage** (furieux, courant) du familier **être vert** (très déçu), et accordez **rester bleu** si le sujet est féminin (*Elle est restée bleue*).\n\nDouble pronom : **Il nous en fait voir de toutes les couleurs**.',
        ),
      ),
      mc(
        P.best,
        ['donner le feu vert', 'avoir la main verte', 'être vert de rage', 'rester bleu'],
        {
          fr: 'Le budget est validé : il ne manque plus que la signature du comité pour ___ au projet.',
          explain: b('Official permission to launch a project is donner le feu vert.', 'L’autorisation officielle de lancer un projet se dit donner le feu vert.'),
        },
      ),
      pairs(P.match, [
        ['avoir la main verte', b('to have a green thumb', 'réussir à faire pousser les plantes')],
        ['être vert de rage', b('to be livid / fuming', 'être furieux, hors de soi')],
        ['donner le feu vert', b('to give the green light', 'autoriser officiellement le départ')],
        ['rester bleu', b('to be flabbergasted', 'rester stupéfait sans voix')],
        ['en faire voir de toutes les couleurs', b('to put someone through a hard time', 'causer mille difficultés à quelqu’un')],
      ]),
      hear(
        'Le jardin botanique nous en a fait voir de toutes les couleurs à cause du gel de printemps, mais le directeur est resté bleu devant la qualité des serres et nous a donné le feu vert pour l’exposition.',
        b('How did the garden project end?', 'Comment s’est terminé le projet du jardin ?'),
        [
          b('Despite spring frost setbacks, the impressed director approved the exhibition.', 'Malgré les soucis dus au gel, le directeur admiratif a autorisé l’exposition.'),
          b('The furious director cancelled the exhibition after the frost.', 'Le directeur furieux a annulé l’exposition à cause du gel.'),
          b('Nobody managed to keep any plants alive in the greenhouse.', 'Personne n’a réussi à faire pousser de plantes dans la serre.'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('At the botanical studio', 'À l’atelier botanique'),
        b('Inès meets her partner Hugo right after the city commission votes on their urban garden plan.', 'Inès retrouve son associé Hugo juste après le vote de la commission sur leur jardin urbain.'),
        [['Inès', 'f'], ['Hugo', 'm']],
        [
          [0, 'Alors, Hugo, cette réunion avec la mairie ? Ce dernier dossier nous en a fait voir de toutes les couleurs !', 'So Hugo, how was the meeting with city hall? That last file really put us through the wringer!'],
          [1, {
            options: [
              'Bonne nouvelle : ils viennent de nous donner le feu vert pour planter dès avril !',
              'Bonne nouvelle : tout le monde est vert de rage contre nos plantes.',
              'Oui, j’ai passé une nuit blanche pour arroser le trottoir.',
            ],
            explain: b('Donner le feu vert announces official approval to begin planting.', 'Donner le feu vert annonce l’autorisation officielle.'),
          }],
          [0, 'Sans blague ? J’en reste bleue ! Je pensais qu’ils allaient encore reporter la décision.', 'Really? I’m stunned! I thought they would postpone the decision again.'],
          [1, {
            options: [
              'Franchement, quand ils ont vu ton prototype, ils ont compris que tu avais la main verte.',
              'Franchement, ils ont ri jaune devant les devis et fermé la porte.',
              'Franchement, ils nous ont fait grise mine jusqu’à la sortie.',
            ],
            explain: b('Avoir la main verte highlights Inès’s plant expertise convincing the jury.', 'Avoir la main verte met en valeur le savoir-faire végétal d’Inès.'),
          }],
          [0, 'Génial ! Fini de broyer du noir : dès demain, on commande les semis.', 'Awesome! No more brooding: tomorrow we order the seeds.'],
        ],
      ),
      dict('Mon voisin a la main verte, mais la grêle lui en a fait voir de toutes les couleurs.'),
      write(
        b('A colourful setback turned victory', 'Un contretemps haut en couleur'),
        b('Write 60–110 words about a demanding creative, professional or personal experience (a renovation, event, travel snag or exam) that tested your patience before turning out well. Use at least four colour idioms from this course (such as passer une nuit blanche, faire grise mine, être vert de rage, rester bleu, donner le feu vert or en faire voir de toutes les couleurs).', 'Racontez en 60 à 110 mots une expérience exigeante (chantier, événement, voyage ou examen) qui a mis votre patience à l’épreuve avant de bien se terminer. Employez au moins quatre expressions de couleur de ce cours (par exemple passer une nuit blanche, faire grise mine, être vert de rage, rester bleu, donner le feu vert ou en faire voir de toutes les couleurs).'),
        60,
        110,
        [
          b('Structured B2 account: difficulty, turning point, resolution', 'Récit B2 structuré : obstacle, tournant, dénouement'),
          b('At least four colour idioms used naturally and accurately', 'Au moins quatre expressions de couleur employées avec justesse'),
          b('Accurate agreement and pronouns (e.g. nous en a fait voir, noire de monde)', 'Accords et pronoms exacts (ex. nous en a fait voir, noire de monde)'),
        ],
        'La semaine avant l’ouverture de notre exposition, l’imprimeur nous en a fait voir de toutes les couleurs. Après deux livraisons abîmées, j’étais vert de rage et j’ai passé une nuit blanche à refaire les fichiers. Le lendemain matin, la commissaire faisait grise mine devant les cartons encore vides. Heureusement, un atelier local a sauvé le tirage à midi : nous sommes restés bleus devant la qualité des affiches, et le soir même la galerie était noire de monde !',
        { phrases: ['… nous en a fait voir de toutes les couleurs', 'J’étais vert(e) de rage…', '… passé une nuit blanche…', '… est resté(e) bleu(e)'] },
      ),
    ],
    [
      b('avoir la main verte = have a green thumb; donner le feu vert = approve a project; être vert de rage = be furious.', 'avoir la main verte = être doué pour les plantes ; donner le feu vert = autoriser ; être vert de rage = être furieux.'),
      b('rester bleu = be left stunned/speechless (agrees with the subject).', 'rester bleu = être stupéfait (s’accorde avec le sujet).'),
      b('en faire voir de toutes les couleurs à quelqu’un keeps both indirect pronoun and en.', 'en faire voir de toutes les couleurs à quelqu’un garde le pronom indirect et en.'),
    ],
    [
      ['avoir la main verte', b('to have a green thumb', 'être doué avec les plantes')],
      ['être vert de rage', b('to be livid, fuming', 'être furieux, hors de soi')],
      ['donner le feu vert', b('to give the green light', 'donner son accord officiel')],
      ['rester bleu', b('to be stunned, flabbergasted', 'rester stupéfait, sans voix')],
      ['en faire voir de toutes les couleurs', b('to put someone through a lot', 'causer mille ennuis à quelqu’un')],
    ],
  ),
];

export default lessons;
