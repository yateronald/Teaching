import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Tiredness, late nights, foggy mornings, and catching up on sleep: French has colourful, everyday idioms for every stage of your energy level. Master fifteen A2 expressions from être crevé and avoir un coup de barre to la gueule de bois and dormir comme un loir.',
    'Coups de fatigue, nuits courtes, réveils brumeux et nuits réparatrices : le français possède des images savoureuses pour chaque niveau d’énergie. Maîtrisez quinze expressions de niveau A2, d’être crevé et avoir un coup de barre à la gueule de bois et dormir comme un loir.',
  ),
  outcomes: [
    b('Describe levels of exhaustion naturally across casual and standard registers', 'Exprimer différents degrés de fatigue selon le registre familier ou courant'),
    b('Talk about hangovers, dry mouth, bad moods, and morning fog accurately', 'Décrire lendemains de fête, bouche pâteuse, mauvaise humeur et brouillard matinal'),
    b('Contrast sleepless nights with deep sleep and bouncing back', 'Opposer nuits blanches, sommeil profond et retour en pleine forme'),
  ],
};

const C = 'exp-fatigue-sleep-morning';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['exhaustion-expressions', 'exprimer-la-fatigue'],
    b('Running on empty: describing exhaustion', 'Dire qu’on est épuisé'),
    b('Move beyond je suis fatigué with vivid expressions for afternoon slumps and total exhaustion.', 'Dépasser le simple je suis fatigué pour dire le coup de barre et l’épuisement total.'),
    [
      b('Distinguish casual être crevé from neutral être épuisé', 'Distinguer le familier être crevé du courant être épuisé'),
      b('Use n’en plus pouvoir in real conjugated sentences (je n’en peux plus)', 'Conjuguer n’en plus pouvoir au présent (je n’en peux plus)'),
      b('Describe afternoon energy drops with avoir un coup de barre and tomber de fatigue', 'Décrire un coup de fatigue soudain avec avoir un coup de barre et tomber de fatigue'),
    ],
    13,
    [
      card(
        b('Five ways to say you are worn out', 'Cinq façons de dire qu’on n’a plus d’énergie'),
        b(
          'When *je suis fatigué* is too mild, French uses **être crevé** (informal, like a flat tire), **être épuisé** (neutral/standard), **n’en plus pouvoir** (to be at one’s limit), **tomber de fatigue** (dropping with tiredness), and **avoir un coup de barre** (a sudden slump).',
          'Quand *je suis fatigué* ne suffit plus, dites **être crevé** (familier, comme un pneu percé), **être épuisé** (courant), **n’en plus pouvoir** (être à bout), **tomber de fatigue** ou **avoir un coup de barre** (fatigue brutale).',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['être crevé', b('to be punctured / burst', 'être percé comme un pneu'), b('to be wiped out / dead tired (informal)', 'être extrêmement fatigué (familier)')],
              ['être épuisé', b('to be drained / emptied', 'avoir épuisé ses forces'), b('to be exhausted (standard)', 'n’avoir plus aucune énergie')],
              ['n’en plus pouvoir', b('to not be able any more of it', 'ne plus pouvoir supporter'), b('to be completely beat / at one’s limit', 'être à bout de forces')],
              ['tomber de fatigue', b('to fall from fatigue', 'tomber sous le poids du sommeil'), b('to be dropping from exhaustion', 'avoir un besoin urgent de dormir')],
              ['avoir un coup de barre', b('to get a blow of a bar', 'recevoir un coup brutal'), b('to hit a sudden wall of tiredness', 'ressentir une fatigue soudaine')],
            ],
          },
          ex: [
            ['Après le déménagement, je suis complètement crevé !', 'After the move, I am completely wiped out!'],
            ['Vers quatorze heures, j’ai souvent un coup de barre au bureau.', 'Around two p.m., I often hit a slump at the office.'],
            ['Les randonneurs n’en peuvent plus, ils tombent de fatigue.', 'The hikers are completely beat, they are dropping from exhaustion.'],
          ],
        },
      ),
      tip(
        b('Agreement & word order in n’en plus pouvoir', 'Accord et place de plus dans n’en plus pouvoir'),
        b(
          'Both **crevé** and **épuisé** agree with the subject: *elle est crevée, ils sont épuisés*. And notice that the dictionary infinitive **n’en plus pouvoir** splits when conjugated: **je n’en peux plus, nous n’en pouvons plus** (*plus* goes right after the conjugated verb!).',
          '**Crevé** et **épuisé** s’accordent avec le sujet : *elle est crevée, ils sont épuisés*. Quant à l’infinitif **n’en plus pouvoir**, **plus** repasse après le verbe une fois conjugué : **je n’en peux plus, nous n’en pouvons plus**.',
        ),
      ),
      flash(
        b('Exhaustion expressions', 'Expressions de fatigue'),
        [
          ['être crevé', b('to be wiped out (informal)', 'être très fatigué (familier)')],
          ['être épuisé', b('to be exhausted', 'n’avoir plus de force')],
          ['n’en plus pouvoir', b('to be completely beat / at one’s limit', 'être à bout de forces')],
          ['tomber de fatigue', b('to be dropping from exhaustion', 'avoir très envie de dormir')],
          ['avoir un coup de barre', b('to hit a sudden slump of tiredness', 'subir une baisse d’énergie soudaine')],
        ],
      ),
      mc(
        b('Right after a heavy lunch at 2 p.m., your eyes start closing at your desk. What fits?', 'À 14 h après un gros déjeuner, vos yeux se ferment au bureau. Quelle expression convient ?'),
        [
          'J’ai un coup de barre.',
          'Je retrouve la forme.',
          'Je fais nuit blanche.',
          'Je dors comme un loir.',
        ],
        {
          explain: b('avoir un coup de barre describes a sudden wave of daytime drowsiness.', 'avoir un coup de barre décrit une fatigue soudaine en pleine journée.'),
        },
      ),
      mc(
        b('Which sentence is grammatically right for two female colleagues?', 'Quelle phrase est grammaticalement juste pour deux collègues femmes ?'),
        [
          'Elles sont complètement crevées après ce salon.',
          'Elles sont complètement crevé après ce salon.',
          'Elles ont complètement crevées après ce salon.',
          'Elles n’en plus peuvent de fatigue.',
        ],
        {
          explain: b('With être + elles, crevé takes -es: elles sont crevées.', 'Avec être + elles, crevé prend -es : elles sont crevées.'),
        },
      ),
      pairs(
        P.match,
        [
          ['être crevé', b('to be wiped out (informal)', 'être très fatigué (familier)')],
          ['être épuisé', b('to be exhausted', 'n’avoir plus de force')],
          ['n’en plus pouvoir', b('to be completely beat / at one’s limit', 'être à bout de forces')],
          ['tomber de fatigue', b('to be dropping from exhaustion', 'avoir très envie de dormir')],
          ['avoir un coup de barre', b('to hit a sudden slump of tiredness', 'subir une baisse d’énergie soudaine')],
        ],
      ),
      gap(
        P.complete,
        'Après dix heures de route, je ___ de fatigue et je ___ vraiment plus !',
        [['tombe'], ['n’en peux']],
        {
          choices: [
            ['tombe', 'suis', 'dors'],
            ['n’en peux', 'n’en suis', 'ne veux'],
          ],
          explain: b('Use tomber de fatigue (je tombe) and n’en plus pouvoir (je n’en peux plus).', 'On dit je tombe de fatigue et je n’en peux plus.'),
        },
      ),
      hear(
        'Après le déjeuner, j’ai souvent un petit coup de barre vers quatorze heures, mais ce soir je suis carrément épuisée !',
        b('How does the speaker contrast her afternoon and evening?', 'Comment oppose-t-elle son après-midi et sa soirée ?'),
        [
          b('She has a small afternoon slump, and by evening she is exhausted', 'Elle a un coup de barre à 14 h et est épuisée le soir'),
          b('She feels full of energy all afternoon and evening', 'Elle se sent en pleine forme toute la journée'),
          b('She slept all afternoon and went out dancing at night', 'Elle a dormi l’après-midi puis est sortie danser'),
          b('She skipped lunch because she was too tired to eat', 'Elle n’a pas déjeuné par manque d’appétit'),
        ],
      ),
      dict('Je suis complètement crevé, je tombe de fatigue ce soir.', {
        hint: b('Accent grave on complètement, acute accents on crevé.', 'Accent grave sur complètement et accent aigu sur crevé.'),
      }),
      say('Après cette longue semaine, je n’en peux plus, je suis épuisé.', 'After this long week, I am completely beat, I am exhausted.'),
    ],
    [
      b('être crevé(e) is informal; être épuisé(e) works in every register.', 'être crevé(e) est familier ; être épuisé(e) convient dans tout contexte.'),
      b('n’en plus pouvoir conjugates with plus after the verb: je n’en peux plus.', 'n’en plus pouvoir place plus après le verbe conjugué : je n’en peux plus.'),
      b('avoir un coup de barre = sudden afternoon slump; tomber de fatigue = dropping with tiredness.', 'avoir un coup de barre = fatigue soudaine ; tomber de fatigue = s’écrouler de sommeil.'),
    ],
    [
      ['être crevé', b('to be wiped out (informal)', 'être très fatigué (familier)')],
      ['être épuisé', b('to be exhausted', 'n’avoir plus de force')],
      ['n’en plus pouvoir', b('to be completely beat / at one’s limit', 'être à bout de forces')],
      ['tomber de fatigue', b('to be dropping from exhaustion', 'avoir très envie de dormir')],
      ['avoir un coup de barre', b('to hit a sudden slump of tiredness', 'subir une baisse d’énergie soudaine')],
    ],
  ),

  lesson(
    C,
    2,
    ['rough-mornings-and-hangovers', 'matins-difficiles-et-gueule-de-bois'],
    b('Rough mornings & hangover idioms', 'Matins difficiles et lendemains de fête'),
    b('Describe hangovers, cottonmouth, bad morning moods, brain fog, and slowly waking up.', 'Décrire gueule de bois, bouche pâteuse, mauvaise humeur et réveil lent.'),
    [
      b('Use avoir la gueule de bois and avoir la bouche pâteuse in the right informal context', 'Employer avoir la gueule de bois et avoir la bouche pâteuse dans le bon registre'),
      b('Say you woke up grumpy with se lever du mauvais pied', 'Dire qu’on est de mauvaise humeur dès le réveil avec se lever du mauvais pied'),
      b('Express grogginess with avoir la tête dans le brouillard and émerger doucement', 'Décrire la somnolence matinale avec avoir la tête dans le brouillard et émerger doucement'),
    ],
    13,
    [
      card(
        b('Surviving a rough morning', 'Survivre à un matin difficile'),
        b(
          'After a late party or short night, French speakers talk about **avoir la gueule de bois** (hangover), **avoir la bouche pâteuse** (dry, pasty mouth), **se lever du mauvais pied** (waking up grumpy), **avoir la tête dans le brouillard** (brain fog), and **émerger doucement** (waking up slowly).',
          'Après une soirée arrosée ou une nuit trop courte, on parle d’**avoir la gueule de bois**, d’**avoir la bouche pâteuse**, de **se lever du mauvais pied**, d’**avoir la tête dans le brouillard** et d’**émerger doucement**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['avoir la gueule de bois', b('to have the wooden mouth/jaw', 'avoir la bouche sèche comme du bois'), b('to have a hangover', 'souffrir d’un lendemain de fête')],
              ['avoir la bouche pâteuse', b('to have a pasty mouth', 'avoir la bouche sèche et épaisse'), b('to have cottonmouth', 'avoir la bouche sèche au réveil')],
              ['se lever du mauvais pied', b('to get up on the wrong foot', 'poser le mauvais pied au sol'), b('to wake up on the wrong side of the bed', 'être de mauvaise humeur le matin')],
              ['avoir la tête dans le brouillard', b('to have one’s head in the fog', 'avoir l’esprit entouré de brume'), b('to feel groggy / foggy-headed', 'avoir du mal à réfléchir au réveil')],
              ['émerger doucement', b('to emerge gently', 'sortir lentement du sommeil'), b('to slowly come around / wake up', 'se réveiller très lentement')],
            ],
          },
          ex: [
            ['Après le mariage, il avait une sacrée gueule de bois et la bouche pâteuse.', 'After the wedding, he had quite a hangover and cottonmouth.'],
            ['Ne lui parle pas avant son café, elle s’est levée du mauvais pied.', 'Do not talk to her before her coffee, she got up on the wrong side of the bed.'],
            ['Il est sept heures, j’ai encore la tête dans le brouillard et j’émerge doucement.', 'It is seven a.m., my head is still in a fog and I am slowly waking up.'],
          ],
        },
      ),
      trap(
        b('Wrong foot—and mind the register of gueule!', 'Le mauvais pied—et attention au registre de gueule !'),
        b(
          'Two traps to dodge: 1) English steps out on the wrong *side of the bed*, whereas French steps down on the wrong **foot**: **se lever du mauvais pied** (never *du mauvais côté*). 2) **Gueule** is informal (literally an animal’s muzzle), so **avoir la gueule de bois** belongs with friends—at work, just say *je suis un peu fatigué* or *j’ai mal à la tête*!',
          'Deux pièges à éviter : 1) On dit **se lever du mauvais pied** (jamais *du mauvais côté du lit*). 2) Le mot **gueule** est familier : gardez **avoir la gueule de bois** pour vos amis, et préférez *je suis fatigué* ou *j’ai mal à la tête* au travail !',
        ),
      ),
      flash(
        b('Rough mornings', 'Matins difficiles'),
        [
          ['avoir la gueule de bois', b('to have a hangover', 'souffrir d’un lendemain de fête')],
          ['avoir la bouche pâteuse', b('to have cottonmouth', 'avoir la bouche sèche et pâteuse')],
          ['se lever du mauvais pied', b('to get up on the wrong side of the bed', 'être de mauvaise humeur dès le matin')],
          ['avoir la tête dans le brouillard', b('to feel groggy / foggy-headed', 'avoir l’esprit encore endormi')],
          ['émerger doucement', b('to slowly wake up / come around', 'sortir lentement du sommeil')],
        ],
      ),
      mc(
        b('Everything has irritated you since you woke up at 7 a.m. What happened?', 'Tout vous agace depuis le réveil à 7 h. Que dites-vous ?'),
        [
          'Je me suis levé du mauvais pied.',
          'J’émerge doucement avec le sourire.',
          'J’ai un coup de barre au lit.',
          'Je suis de la mauvaise jambe.',
        ],
        {
          explain: b('Being irritable from the moment you get up is se lever du mauvais pied.', 'Être de mauvaise humeur dès le matin se dit se lever du mauvais pied.'),
        },
      ),
      mc(
        P.best,
        [
          'la tête dans le brouillard',
          'la bouche de bois',
          'le pied dans la pâte',
          'la gueule dans le brouillard',
        ],
        {
          fr: 'Avant mon premier espresso, j’ai encore ___ et je n’arrive pas à réfléchir.',
          explain: b('Mental grogginess in the morning is avoir la tête dans le brouillard.', 'Avoir l’esprit brumeux le matin se dit avoir la tête dans le brouillard.'),
        },
      ),
      sort(
        b('Sort into Heavy exhaustion (Lesson 1) or Rough mornings (Lesson 2).', 'Classez : grande fatigue (leçon 1) ou réveil difficile (leçon 2).'),
        [b('Heavy exhaustion', 'Grande fatigue'), b('Rough mornings', 'Réveil difficile')],
        [
          ['être crevé', 0],
          ['avoir la gueule de bois', 1],
          ['avoir un coup de barre', 0],
          ['avoir la bouche pâteuse', 1],
          ['tomber de fatigue', 0],
          ['avoir la tête dans le brouillard', 1],
        ],
      ),
      gap(
        P.complete,
        'On a trop fêté hier soir : j’ai la ___ de bois, la bouche ___ et aucune énergie.',
        ['gueule', 'pâteuse'],
        {
          tr: 'We partied too hard last night: I have a hangover, cottonmouth, and zero energy.',
          hint: b('Watch the silent u in gueule and the circumflex on pâteuse.', 'Attention au u muet de gueule et à l’accent circonflexe sur pâteuse.'),
        },
      ),
      ord(
        P.order,
        'Ce matin, il émerge doucement avec un grand café.',
        {
          tr: 'This morning, he is slowly waking up with a big coffee.',
          extra: ['pâteuse'],
          explain: b('Time frame (Ce matin,) + subject (il) + verb (émerge) + adverb (doucement) + detail.', 'Repère de temps (Ce matin,) + sujet (il) + verbe (émerge) + adverbe (doucement) + précision.'),
        },
      ),
      hear(
        'Ouh là, j’ai la bouche pâteuse et la tête dans le brouillard… Je crois que je me suis levée du mauvais pied ce matin.',
        b('How does she describe her morning?', 'Comment décrit-elle son réveil ?'),
        [
          b('She has a dry mouth, brain fog, and a bad mood', 'Elle a la bouche sèche, l’esprit brumeux et mauvais moral'),
          b('She feels wide awake and ready for sports', 'Elle est déjà bien réveillée et prête pour le sport'),
          b('She fell asleep at her desk after lunch', 'Elle s’est endormie au bureau après le déjeuner'),
          b('She slept soundly and woke up cheerful', 'Elle a très bien dormi et se sent joyeuse'),
        ],
        { voice: 'f2' },
      ),
      say('Attends dix minutes, j’ai encore la tête dans le brouillard et j’émerge doucement.', 'Wait ten minutes, my head is still in a fog and I am slowly coming around.'),
    ],
    [
      b('avoir la gueule de bois (hangover, informal) and avoir la bouche pâteuse (cottonmouth).', 'avoir la gueule de bois (familier) et avoir la bouche pâteuse (bouche sèche).'),
      b('se lever du mauvais pied = wake up grumpy (foot, not side of the bed!).', 'se lever du mauvais pied = être de mauvaise humeur au réveil.'),
      b('avoir la tête dans le brouillard + émerger doucement = groggy morning wake-up.', 'avoir la tête dans le brouillard + émerger doucement = réveil lent et brumeux.'),
    ],
    [
      ['avoir la gueule de bois', b('to have a hangover', 'souffrir d’un lendemain de fête')],
      ['avoir la bouche pâteuse', b('to have cottonmouth', 'avoir la bouche sèche et pâteuse')],
      ['se lever du mauvais pied', b('to get up on the wrong side of the bed', 'être de mauvaise humeur dès le matin')],
      ['avoir la tête dans le brouillard', b('to feel groggy / foggy-headed', 'avoir l’esprit encore endormi')],
      ['émerger doucement', b('to slowly wake up / come around', 'sortir lentement du sommeil')],
    ],
  ),

  lesson(
    C,
    3,
    ['sleeping-well-and-recovery', 'sommeil-et-retrouver-la-forme'],
    b('Sleeping soundly & bouncing back', 'Bien dormir et retrouver la forme'),
    b('Contrast pulling an all-nighter with sleeping like a log and getting your energy back.', 'Opposer une nuit blanche au sommeil profond et au retour en pleine forme.'),
    [
      b('Contrast faire nuit blanche with se coucher tôt and dormir comme un loir', 'Opposer faire nuit blanche, se coucher tôt et dormir comme un loir'),
      b('Use the poetic idiom tomber dans les bras de Morphée naturally', 'Employer avec naturel l’image tomber dans les bras de Morphée'),
      b('Describe recovering your energy with retrouver la forme', 'Exprimer le regain d’énergie avec retrouver la forme'),
    ],
    13,
    [
      card(
        b('From all-nighters to deep sleep', 'De la nuit blanche au sommeil profond'),
        b(
          'Recover from bad nights with these five staples: **dormir comme un loir** (sleep deeply), **faire nuit blanche** (stay awake all night), **se coucher tôt** (go to bed early), **tomber dans les bras de Morphée** (drift off to sleep), and **retrouver la forme** (get your energy back).',
          'Réparez une mauvaise nuit avec ces cinq expressions : **dormir comme un loir**, **faire nuit blanche**, **se coucher tôt**, **tomber dans les bras de Morphée** et **retrouver la forme**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['dormir comme un loir', b('to sleep like a dormouse', 'dormir comme un loir hibernant'), b('to sleep like a log', 'dormir très profondément')],
              ['faire nuit blanche', b('to make a white night', 'passer une nuit sans dormir'), b('to pull an all-nighter / sleepless night', 'ne pas dormir de la nuit')],
              ['se coucher tôt', b('to lie down early', 'aller au lit de bonne heure'), b('to go to bed early', 'se mettre au lit tôt le soir')],
              ['tomber dans les bras de Morphée', b('to fall into Morpheus’s arms', 'rejoindre le dieu des rêves'), b('to drift off into deep sleep', 's’endormir profondément')],
              ['retrouver la forme', b('to find back one’s shape', 'récupérer son énergie'), b('to feel oneself again / bounce back', 'retrouver tonus et vitalité')],
            ],
          },
          ex: [
            ['J’ai fait nuit blanche pour préparer ma présentation.', 'I pulled an all-nighter to prepare my presentation.'],
            ['À vingt et une heures, il est tombé dans les bras de Morphée.', 'At nine p.m., he drifted off into a deep sleep.'],
            ['Après un week-end au calme, j’ai enfin retrouvé la forme !', 'After a quiet weekend, I finally got my energy back!'],
          ],
        },
      ),
      culture(
        b('Why a dormouse, white nights, and Morpheus?', 'Pourquoi un loir, une nuit blanche et Morphée ?'),
        b(
          'The edible dormouse (**un loir**) hibernates up to seven months a year—no wonder French compares deep sleepers to it! **Faire nuit blanche** comes from medieval knights keeping vigil all night in white tunics, while **Morphée** is the Greek god of dreams.',
          'Le **loir** hiberne jusqu’à sept mois par an : voilà pourquoi il symbolise le sommeil profond ! Quant à **faire nuit blanche**, l’expression vient des futurs chevaliers qui veillaient toute la nuit en tunique blanche, et **Morphée** est le dieu grec des rêves.',
        ),
      ),
      mc(
        P.best,
        [
          'retrouvé la forme',
          'fait nuit blanche',
          'eu la bouche pâteuse',
          'levé du mauvais pied',
        ],
        {
          fr: 'Après deux nuits très courtes, j’ai dormi dix heures et j’ai enfin ___ !',
          explain: b('Getting your energy and vitality back is retrouver la forme.', 'Récupérer son énergie se dit retrouver la forme.'),
        },
      ),
      pairs(
        P.match,
        [
          ['dormir comme un loir', b('to sleep like a log', 'dormir profondément')],
          ['faire nuit blanche', b('to pull an all-nighter', 'passer la nuit sans dormir')],
          ['se coucher tôt', b('to go to bed early', 'aller au lit de bonne heure')],
          ['tomber dans les bras de Morphée', b('to fall fast asleep', 's’endormir profondément')],
          ['retrouver la forme', b('to feel energized again', 'retrouver son tonus')],
        ],
      ),
      hear(
        'Hier soir, je me suis couché tôt : à vingt et une heures trente, je suis tombé dans les bras de Morphée et j’ai dormi comme un loir.',
        b('How was the speaker’s night?', 'Comment s’est passée sa nuit ?'),
        [
          b('He went to bed early and slept deeply all night', 'Il s’est couché tôt et a dormi profondément'),
          b('He stayed awake working until dawn', 'Il a fait nuit blanche pour travailler'),
          b('He woke up grumpy with a dry mouth', 'Il s’est réveillé avec la bouche pâteuse'),
          b('He hit an afternoon slump at nine p.m.', 'Il a eu un coup de barre à midi'),
        ],
        { voice: 'm2' },
      ),
      dlg(
        b('Coffee break after a tough week', 'Pause café après une semaine chargée'),
        b('Sara notices you look much better today than yesterday morning.', 'Sara remarque que vous avez bien meilleure mine qu’hier matin.'),
        [['Sara', 'f'], ['Vous', 'm']],
        [
          [0, 'Salut ! Tu as meilleure mine qu’hier matin. Tu as réussi à dormir ?', 'Hi! You look much better than yesterday morning. Did you manage to sleep?'],
          [1, {
            options: [
              'Oui ! Je me suis couché tôt et j’ai dormi comme un loir pendant neuf heures.',
              'Oui ! J’ai encore la gueule de bois depuis neuf heures.',
              'Non, je suis tombé dans le brouillard.',
            ],
            explain: b('Combine se coucher tôt and dormir comme un loir to describe a great night of sleep.', 'Associez se coucher tôt et dormir comme un loir pour décrire une excellente nuit.'),
          }],
          [0, 'Tant mieux ! Hier, tu avais vraiment la tête dans le brouillard.', 'Good for you! Yesterday, your head really seemed to be in a fog.'],
          [1, {
            options: [
              'C’est vrai, j’avais fait nuit blanche pour finir mon dossier. Là, j’ai retrouvé la forme !',
              'C’est vrai, j’avais dormi comme un loir pour finir mon dossier.',
              'Oui, j’avais la bouche pâteuse de forme.',
            ],
            explain: b('faire nuit blanche explains why you were exhausted yesterday, and retrouver la forme shows you recovered.', 'faire nuit blanche explique la fatigue d’hier et retrouver la forme marque votre rétablissement.'),
          }],
          [0, 'Parfait ! On va marcher vingt minutes au parc après déjeuner ?', 'Great! Shall we go for a twenty-minute walk in the park after lunch?'],
          [1, 'Ça marche, avec plaisir !', 'Sounds good, gladly!'],
        ],
      ),
      dict('Après une nuit blanche, il faut se coucher tôt pour retrouver la forme.', {
        voice: 'f2',
        hint: b('Watch the circumflex accent on tôt.', 'Attention à l’accent circonflexe sur tôt.'),
      }),
      write(
        b('Contrast a rough morning with a good night', 'Comparez un matin difficile et une bonne nuit'),
        b('Write a short message or journal entry (30–60 words) comparing a rough morning after a short or sleepless night with how you slept the next night and bounced back. Use at least four expressions from this course.', 'Écrivez un court message ou journal (30–60 mots) comparant un matin difficile après une nuit courte ou blanche avec une vraie nuit réparatrice. Utilisez au moins quatre expressions de ce cours.'),
        30,
        60,
        [
          b('Describe a rough morning or exhaustion (crevé, brouillard, nuit blanche)', 'Décrire une fatigue ou un réveil difficile (crevé, brouillard, nuit blanche)'),
          b('Explain how you rested (se coucher tôt, dormir comme un loir)', 'Expliquer comment vous vous êtes reposé (se coucher tôt, dormir comme un loir)'),
          b('Close on your recovery (retrouver la forme)', 'Conclure sur le regain d’énergie (retrouver la forme)'),
        ],
        'Vendredi matin, j’étais complètement crevé : j’avais fait nuit blanche pour mon projet et j’avais la tête dans le brouillard toute la matinée. Le soir même, je me suis couché tôt et j’ai dormi comme un loir. Aujourd’hui, j’ai enfin retrouvé la forme !',
      ),
    ],
    [
      b('faire nuit blanche = pull an all-nighter; se coucher tôt = go to bed early.', 'faire nuit blanche = ne pas dormir ; se coucher tôt = aller au lit tôt.'),
      b('dormir comme un loir / tomber dans les bras de Morphée = sleep deeply.', 'dormir comme un loir / tomber dans les bras de Morphée = dormir profondément.'),
      b('retrouver la forme = feel energetic and well rested again.', 'retrouver la forme = retrouver son énergie.'),
    ],
    [
      ['dormir comme un loir', b('to sleep like a log', 'dormir profondément')],
      ['faire nuit blanche', b('to pull an all-nighter', 'passer la nuit sans dormir')],
      ['se coucher tôt', b('to go to bed early', 'aller au lit de bonne heure')],
      ['tomber dans les bras de Morphée', b('to fall fast asleep', 's’endormir profondément')],
      ['retrouver la forme', b('to feel energized again', 'retrouver son tonus')],
    ],
  ),
];

export default lessons;
