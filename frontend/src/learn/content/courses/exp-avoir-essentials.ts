import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In French, you do not “be” hungry, cold, scared, or right—you have them. Master the fifteen core avoir expressions every beginner needs for physical states, emotions, luck, aches, and daily habits.',
    'En français, on n’« est » pas faim, froid, peur ou raison : on les a ! Maîtrisez les quinze expressions essentielles avec avoir pour parler de vos sensations, émotions, envies, douleurs et habitudes.',
  ),
  outcomes: [
    b('Express hunger, thirst, heat, cold, and sleepiness naturally with avoir', 'Exprimer la faim, la soif, la chaleur, le froid et le sommeil avec avoir'),
    b('Talk about fear, shame, need, and being right or wrong without être traps', 'Parler de peur, de honte, de besoin et d’avoir raison ou tort sans confondre avec être'),
    b('Share wishes, luck, aches, impressions, and habits in everyday conversation', 'Exprimer ses envies, sa chance, ses douleurs, ses impressions et ses habitudes au quotidien'),
  ],
};

const C = 'exp-avoir-essentials';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['avoir-physical-feelings', 'avoir-sensations-physiques'],
    b('Physical feelings with avoir', 'Les sensations physiques avec avoir'),
    b('Say you are hungry, thirsty, hot, cold, or sleepy using avoir instead of être.', 'Dire qu’on a faim, soif, chaud, froid ou sommeil avec avoir plutôt qu’être.'),
    [
      b('Use avoir faim, soif, chaud, froid, and sommeil accurately', 'Employer correctement avoir faim, soif, chaud, froid et sommeil'),
      b('Avoid translating English “to be” literally with être', 'Éviter le calque de l’anglais « to be » avec être'),
      b('Intensify sensations with très instead of beaucoup', 'Intensifier les sensations avec très et non beaucoup'),
    ],
    13,
    [
      card(
        b('Body sensations take avoir', 'Les sensations physiques prennent avoir'),
        b(
          'English uses *to be* for physical states, while French treats them as things you **have**: **avoir faim, avoir soif, avoir chaud, avoir froid, avoir sommeil**. Use **très** (never *beaucoup*) to make them stronger: *J’ai très faim.*',
          'L’anglais emploie *to be* pour les sensations, alors que le français utilise **avoir** : **avoir faim, avoir soif, avoir chaud, avoir froid, avoir sommeil**. Pour insister, employez **très** (jamais *beaucoup*) : *J’ai très faim.*',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['avoir faim', b('to have hunger', 'posséder la faim'), b('to be hungry', 'ressentir le besoin de manger')],
              ['avoir soif', b('to have thirst', 'posséder la soif'), b('to be thirsty', 'ressentir le besoin de boire')],
              ['avoir chaud', b('to have heat', 'posséder la chaleur'), b('to be / feel hot', 'ressentir une forte chaleur')],
              ['avoir froid', b('to have cold', 'posséder le froid'), b('to be / feel cold', 'ressentir le froid')],
              ['avoir sommeil', b('to have sleepiness', 'posséder le sommeil'), b('to be sleepy', 'avoir envie de dormir')],
            ],
          },
          ex: [
            ['Il est treize heures et j’ai très faim !', 'It is one p.m. and I am very hungry!'],
            ['En juillet, nous avons souvent chaud l’après-midi.', 'In July, we are often hot in the afternoon.'],
            ['Les enfants ont sommeil après la promenade.', 'The children are sleepy after the walk.'],
          ],
        },
      ),
      tip(
        b('No article and no beaucoup', 'Pas d’article et jamais beaucoup'),
        b(
          'Keep these nouns bare after **avoir**: say **J’ai soif**, never *J’ai la soif* or *J’ai une soif*. And to say “very”, always place **très** before the noun: **J’ai très froid**, **Il a très sommeil**.',
          'Gardez ces noms sans article après **avoir** : dites **J’ai soif**, jamais *J’ai la soif* ni *J’ai une soif*. Et pour dire « very », placez toujours **très** devant le nom : **J’ai très froid**, **Il a très sommeil**.',
        ),
      ),
      flash(
        b('Physical feelings', 'Les sensations physiques'),
        [
          ['avoir faim', b('to be hungry', 'avoir besoin de manger')],
          ['avoir soif', b('to be thirsty', 'avoir besoin de boire')],
          ['avoir chaud', b('to feel hot', 'ressentir de la chaleur')],
          ['avoir froid', b('to feel cold', 'ressentir du froid')],
          ['avoir sommeil', b('to be sleepy', 'avoir envie de dormir')],
        ],
      ),
      mc(
        b('How do you say “I am thirsty” in natural French?', 'Comment dit-on « I am thirsty » en français naturel ?'),
        [
          'J’ai soif.',
          'Je suis soif.',
          'J’ai une soif.',
          'Je fais soif.',
        ],
        {
          explain: b('French uses avoir without an article: J’ai soif.', 'Le français emploie avoir sans article : J’ai soif.'),
        },
      ),
      mc(
        P.form,
        [
          'avons très froid',
          'sommes très froids',
          'avons beaucoup froid',
          'faisons très froid',
        ],
        {
          fr: 'En janvier, quand il neige, nous ___ sans manteau.',
          explain: b('Use avoir + très + froid for feeling cold: nous avons très froid.', 'On dit avoir + très + froid pour ressentir le froid : nous avons très froid.'),
        },
      ),
      pairs(
        P.match,
        [
          ['avoir faim', b('to be hungry', 'avoir besoin de manger')],
          ['avoir soif', b('to be thirsty', 'avoir besoin de boire')],
          ['avoir chaud', b('to feel hot', 'ressentir de la chaleur')],
          ['avoir froid', b('to feel cold', 'ressentir du froid')],
          ['avoir sommeil', b('to be sleepy', 'avoir envie de dormir')],
        ],
      ),
      gap(
        P.complete,
        'À midi, j’ai ___ et j’ai ___ : je commande un sandwich et un grand verre d’eau.',
        [['faim'], ['soif']],
        {
          choices: [
            ['faim', 'sommeil', 'chaud'],
            ['soif', 'froid', 'faim'],
          ],
          explain: b('Ordering a sandwich and water matches hunger (faim) and thirst (soif).', 'Commander un sandwich et de l’eau correspond à la faim et à la soif.'),
        },
      ),
      hear(
        'Il fait trente degrés dans le salon ! Ouvrons la fenêtre, j’ai vraiment très chaud.',
        b('Why does the speaker want to open the window?', 'Pourquoi la personne veut-elle ouvrir la fenêtre ?'),
        [
          b('Because she feels very hot inside', 'Parce qu’elle a très chaud dans la pièce'),
          b('Because she is feeling sleepy', 'Parce qu’elle a sommeil'),
          b('Because she feels cold without a sweater', 'Parce qu’elle a froid sans pull'),
          b('Because she wants a glass of water', 'Parce qu’elle a très soif'),
        ],
      ),
      dict('Ce soir, les enfants ont faim et ils ont déjà sommeil.', {
        hint: b('Plural ont with les enfants and ils.', 'Forme plurielle ont avec les enfants et ils.'),
      }),
      say('Quand j’ai très froid, je bois un thé chaud.', 'When I am very cold, I drink a hot tea.'),
    ],
    [
      b('Physical sensations take avoir + bare noun: avoir faim, soif, chaud, froid, sommeil.', 'Les sensations physiques prennent avoir sans article : avoir faim, soif, chaud, froid, sommeil.'),
      b('Use très (never beaucoup) before faim, soif, chaud, froid, sommeil.', 'Utilisez très (jamais beaucoup) devant faim, soif, chaud, froid, sommeil.'),
      b('Never use être for personal heat or cold sensations (je suis chaud/froid means something completely different!).', 'N’utilisez jamais être pour dire qu’on a chaud ou froid (je suis chaud/froid a un tout autre sens !).'),
    ],
    [
      ['avoir faim', b('to be hungry', 'avoir besoin de manger')],
      ['avoir soif', b('to be thirsty', 'avoir besoin de boire')],
      ['avoir chaud', b('to feel hot', 'ressentir de la chaleur')],
      ['avoir froid', b('to feel cold', 'ressentir du froid')],
      ['avoir sommeil', b('to be sleepy', 'avoir envie de dormir')],
    ],
  ),

  lesson(
    C,
    2,
    ['avoir-mind-and-feelings', 'avoir-emotions-et-jugement'],
    b('Mind & feelings with avoir', 'Émotions et jugements avec avoir'),
    b('Say you are afraid, ashamed, right, wrong, or in need using avoir and the right prepositions.', 'Dire qu’on a peur, honte, raison, tort ou besoin de quelque chose avec avoir.'),
    [
      b('Use avoir peur, raison, tort, honte, and besoin de accurately', 'Employer avoir peur, raison, tort, honte et besoin de correctement'),
      b('Keep de before nouns and infinitives after peur, honte, and besoin', 'Garder de devant un nom ou un infinitif après peur, honte et besoin'),
      b('Contrast physical states with mental and emotional avoir expressions', 'Distinguer sensations physiques et états d’esprit avec avoir'),
    ],
    13,
    [
      card(
        b('Emotions, judgment & needs', 'Émotions, jugement et besoins'),
        b(
          'Mental reactions and judgments also use **avoir**: **avoir peur (de), avoir raison, avoir tort, avoir honte (de), avoir besoin de**. Remember to keep **de** whenever you name what you fear, feel ashamed of, or need!',
          'Les réactions de l’esprit et les jugements utilisent aussi **avoir** : **avoir peur (de), avoir raison, avoir tort, avoir honte (de), avoir besoin de**. Gardez **de** dès que vous précisez ce que vous craignez ou ce dont vous avez besoin !',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['avoir peur', b('to have fear', 'posséder la peur'), b('to be scared / afraid', 'ressentir de la crainte')],
              ['avoir raison', b('to have reason', 'détenir la raison'), b('to be right', 'dire ou penser la vérité')],
              ['avoir tort', b('to have wrong', 'porter le tort'), b('to be wrong', 'se tromper')],
              ['avoir honte', b('to have shame', 'éprouver la honte'), b('to be ashamed / embarrassed', 'se sentir très gêné')],
              ['avoir besoin de', b('to have need of', 'manquer de'), b('to need', 'devoir obtenir ou faire')],
            ],
          },
          ex: [
            ['Tu as raison, ce bus est plus rapide.', 'You are right, this bus is faster.'],
            ['Mon petit frère a peur du noir.', 'My little brother is afraid of the dark.'],
            ['Nous avons besoin de calme pour travailler.', 'We need quiet to work.'],
          ],
        },
      ),
      trap(
        b('Never drop de—and never use être!', 'Ne supprimez pas de et évitez être !'),
        b(
          'Two frequent A1 slips: 1) Saying *Tu es raison* instead of **Tu as raison**. 2) Dropping **de** after **avoir besoin** or **avoir peur**: say **J’ai besoin d’un café** and **J’ai peur de parler**, never *J’ai besoin un café*.',
          'Deux erreurs fréquentes au niveau A1 : 1) Dire *Tu es raison* au lieu de **Tu as raison**. 2) Oublier **de** après **avoir besoin** ou **avoir peur** : dites **J’ai besoin d’un café** et **J’ai peur de parler**, jamais *J’ai besoin un café*.',
        ),
      ),
      flash(
        b('Mind & feelings', 'Émotions et jugements'),
        [
          ['avoir peur', b('to be afraid', 'ressentir de la crainte')],
          ['avoir raison', b('to be right', 'ne pas se tromper')],
          ['avoir tort', b('to be wrong', 'faire une erreur')],
          ['avoir honte', b('to be ashamed / embarrassed', 'se sentir très gêné')],
          ['avoir besoin de', b('to need', 'manquer de quelque chose')],
        ],
      ),
      mc(
        P.best,
        [
          'as raison',
          'es raison',
          'fais raison',
          'vas raison',
        ],
        {
          fr: 'Oui, tu ___ : le train part bien à huit heures !',
          explain: b('To be right is always avoir raison: tu as raison.', 'Pour dire qu’on est dans le vrai, on dit toujours avoir raison : tu as raison.'),
        },
      ),
      mc(
        P.word,
        [
          'd’aide',
          'aide',
          'à aide',
          'pour aide',
        ],
        {
          fr: 'Cet exercice est difficile, j’ai vraiment besoin ___.',
          explain: b('avoir besoin de contracts to d’ before a vowel: j’ai besoin d’aide.', 'avoir besoin de devient d’ devant une voyelle : j’ai besoin d’aide.'),
        },
      ),
      sort(
        b('Sort into Physical sensation or Mind & judgment.', 'Classez chaque expression : sensation physique ou esprit et jugement.'),
        [b('Physical sensation', 'Sensation physique'), b('Mind & judgment', 'Esprit et jugement')],
        [
          ['avoir faim', 0],
          ['avoir peur', 1],
          ['avoir froid', 0],
          ['avoir raison', 1],
          ['avoir sommeil', 0],
          ['avoir tort', 1],
        ],
      ),
      gap(
        P.complete,
        'Elle a ___ de parler devant le groupe, mais elle a ___ de pratiquer son français.',
        ['peur', 'besoin'],
        {
          tr: 'She is afraid of speaking in front of the group, but she needs to practice her French.',
          hint: b('First blank: fear; second blank: need (before de).', 'Premier trou : crainte ; second trou : nécessité (devant de).'),
        },
      ),
      ord(
        P.order,
        'Tu as vraiment besoin de te reposer ce soir.',
        {
          tr: 'You really need to rest tonight.',
          extra: ['es'],
          explain: b('Subject (Tu) + conjugated avoir (as) + vraiment besoin de + infinitive.', 'Sujet (Tu) + avoir conjugué (as) + vraiment besoin de + infinitif.'),
        },
      ),
      hear(
        'N’aie pas honte de faire des erreurs en classe : on a tous besoin de pratiquer.',
        b('What advice does the speaker give?', 'Quel conseil l’homme donne-t-il ?'),
        [
          b('Do not be embarrassed to make mistakes', 'Ne pas avoir honte de faire des erreurs'),
          b('Do not speak in class today', 'Ne pas parler en classe aujourd’hui'),
          b('Leave the classroom right away', 'Quitter la salle tout de suite'),
          b('He says everyone is completely wrong', 'Il dit que tout le monde a tort'),
        ],
        { voice: 'm' },
      ),
      say('Tu as raison, j’ai besoin d’un peu d’aide.', 'You are right, I need a little help.'),
    ],
    [
      b('avoir peur (de), avoir raison, avoir tort, avoir honte (de), avoir besoin de.', 'avoir peur (de), avoir raison, avoir tort, avoir honte (de), avoir besoin de.'),
      b('Always keep de (or d’) before a noun or verb after peur, honte, and besoin.', 'Gardez toujours de (ou d’) devant un nom ou un verbe après peur, honte et besoin.'),
      b('The opposite of avoir raison is avoir tort (with a silent final -t).', 'Le contraire d’avoir raison est avoir tort (avec un -t final muet).'),
    ],
    [
      ['avoir peur', b('to be afraid', 'ressentir de la crainte')],
      ['avoir raison', b('to be right', 'ne pas se tromper')],
      ['avoir tort', b('to be wrong', 'faire une erreur')],
      ['avoir honte', b('to be ashamed / embarrassed', 'se sentir très gêné')],
      ['avoir besoin de', b('to need', 'manquer de quelque chose')],
    ],
  ),

  lesson(
    C,
    3,
    ['avoir-wishes-and-habits', 'avoir-envies-et-habitudes'],
    b('Wishes, luck & habits with avoir', 'Envies, chance et habitudes avec avoir'),
    b('Express what you feel like doing, say where it hurts, describe how someone looks, and talk about habits.', 'Dire ce dont on a envie, où on a mal, comment quelqu’un paraît et quelles sont ses habitudes.'),
    [
      b('Use avoir envie de and avoir l’habitude de with nouns or infinitives', 'Employer avoir envie de et avoir l’habitude de avec un nom ou un infinitif'),
      b('Locate aches accurately using avoir mal à (+ au, à la, à l’, aux)', 'Situer une douleur avec avoir mal à (+ au, à la, à l’, aux)'),
      b('Comment on appearances with avoir l’air and congratulate with avoir de la chance', 'Décrire une apparence avec avoir l’air et parler de chance avec avoir de la chance'),
    ],
    13,
    [
      card(
        b('Wishes, aches, looks & habits', 'Envies, douleurs, allure et habitudes'),
        b(
          'Use **avoir envie de** to say what you feel like doing, **avoir de la chance** for being lucky, **avoir mal à** for physical pain, **avoir l’air** for seeming or looking a certain way, and **avoir l’habitude de** for routines.',
          'Utilisez **avoir envie de** pour vos souhaits, **avoir de la chance** pour la réussite heureuse, **avoir mal à** pour une douleur, **avoir l’air** pour une apparence et **avoir l’habitude de** pour les routines.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['avoir envie de', b('to have desire of', 'ressentir le désir de'), b('to feel like / want to', 'souhaiter faire ou avoir')],
              ['avoir de la chance', b('to have some luck', 'posséder de la chance'), b('to be lucky', 'bénéficier d’un bon hasard')],
              ['avoir mal à', b('to have pain at', 'sentir une douleur à'), b('to have an ache in', 'souffrir d’une partie du corps')],
              ['avoir l’air', b('to have the air', 'présenter un aspect'), b('to seem / look', 'paraître, sembler')],
              ['avoir l’habitude de', b('to have the habit of', 'posséder l’usage de'), b('to be used to', 'faire souvent par coutume')],
            ],
          },
          ex: [
            ['Tu as envie de sortir ce soir ?', 'Do you feel like going out tonight?'],
            ['J’ai mal à la tête depuis ce matin.', 'I have had a headache since this morning.'],
            ['Elle a l’air fatiguée, mais elle a de la chance : demain c’est samedi.', 'She looks tired, but she is lucky: tomorrow is Saturday.'],
          ],
        },
      ),
      culture(
        b('Softer wishes & body articles', 'Envies douces et parties du corps'),
        b(
          '**J’ai envie d’un café** sounds warmer and friendlier than *Je veux un café*. Remember that **avoir mal à** blends with the noun’s article: **mal au dos** (masculine), **mal à la gorge** (feminine), **mal à l’estomac** (vowel), and **mal aux yeux** (plural).',
          '**J’ai envie d’un café** est plus doux et amical que *Je veux un café*. Pensez aussi à accorder l’article après **avoir mal à** : **mal au dos** (masculin), **mal à la gorge** (féminin), **mal à l’estomac** (voyelle) et **mal aux yeux** (pluriel).',
        ),
      ),
      mc(
        P.best,
        [
          'a l’air',
          'a mal',
          'a l’habitude',
          'a de la chance',
        ],
        {
          fr: 'Mon collègue sourit depuis ce matin : il ___ vraiment très content !',
          explain: b('avoir l’air + adjective expresses how someone looks or seems.', 'avoir l’air + adjectif décrit l’apparence ou l’impression donnée.'),
        },
      ),
      pairs(
        P.match,
        [
          ['avoir envie de', b('to feel like / want to', 'souhaiter faire ou avoir')],
          ['avoir de la chance', b('to be lucky', 'bénéficier d’un bon hasard')],
          ['avoir mal à', b('to have a pain / ache in', 'souffrir d’une partie du corps')],
          ['avoir l’air', b('to seem / look', 'paraître, sembler')],
          ['avoir l’habitude de', b('to be used to', 'faire régulièrement par coutume')],
        ],
      ),
      hear(
        'J’ai de la chance : j’ai l’habitude de marcher jusqu’au bureau, mais aujourd’hui j’ai un peu mal aux pieds.',
        b('Why can the speaker not enjoy her usual walk today?', 'Pourquoi ne profite-t-elle pas de sa marche habituelle aujourd’hui ?'),
        [
          b('Her feet hurt a little today', 'Elle a un peu mal aux pieds aujourd’hui'),
          b('She has no shoes at the office', 'Elle n’a pas de chaussures au bureau'),
          b('She hates walking to the office', 'Elle déteste marcher jusqu’au bureau'),
          b('She feels like taking the bus instead', 'Elle préfère dormir au bureau'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('After work with Camille', 'Après le travail avec Camille'),
        b('Camille suggests grabbing an ice cream, then notices how you look.', 'Camille propose une glace, puis remarque votre visage.'),
        [['Camille', 'f'], ['Vous', 'm']],
        [
          [0, 'On vient de finir la journée ! Tu as envie de prendre une glace au parc ?', 'We just finished the day! Do you feel like grabbing an ice cream in the park?'],
          [1, {
            options: [
              'Oui, j’ai vraiment envie d’une glace à la vanille !',
              'Non, je suis une glace au parc.',
              'Oui, j’ai tort d’une glace.',
            ],
            explain: b('Use avoir envie de + noun to say what you feel like having.', 'Employez avoir envie de + nom pour dire ce dont vous avez envie.'),
          }],
          [0, 'Super ! Dis-moi, tu as l’air un peu fatigué ce soir. Tout va bien ?', 'Great! Tell me, you look a bit tired tonight. Is everything okay?'],
          [1, {
            options: [
              'Un peu, oui : j’ai mal à la tête depuis midi.',
              'Un peu, oui : j’ai de l’air à la tête.',
              'Un peu, oui : j’ai besoin à la tête.',
            ],
            explain: b('Headache is avoir mal à la tête.', 'Pour le mal de tête, on dit avoir mal à la tête.'),
          }],
          [0, 'Oh mince ! Repose-toi bien ce soir, tu as de la chance : demain c’est samedi !', 'Oh no! Get some good rest tonight, you are lucky: tomorrow is Saturday!'],
          [1, 'C’est vrai, j’ai de la chance ! D’ailleurs j’ai l’habitude de dormir tard le samedi.', 'True, I am lucky! Besides, I am used to sleeping late on Saturdays.'],
        ],
      ),
      dict('J’ai l’habitude de boire un café, mais ce matin j’ai envie d’un thé.', {
        voice: 'm',
        hint: b('Watch the apostrophes in l’habitude and d’un.', 'Attention aux apostrophes dans l’habitude et d’un.'),
      }),
      write(
        b('Write a quick note about your day', 'Écrivez un petit mot sur votre journée'),
        b('Write 2–3 sentences (20–45 words) to a friend using at least three avoir expressions: mention one habit, how you feel or look, and one thing you feel like doing tonight.', 'Écrivez 2 à 3 phrases (20–45 mots) à un ami avec au moins trois expressions avec avoir : mentionnez une habitude, votre état ou votre allure, et une envie pour ce soir.'),
        20,
        45,
        [
          b('Mention a habit with avoir l’habitude de', 'Mentionner une habitude avec avoir l’habitude de'),
          b('Describe a feeling, ache, or appearance', 'Décrire une sensation, une douleur ou une allure'),
          b('Express a wish with avoir envie de', 'Exprimer un souhait avec avoir envie de'),
        ],
        'Salut Léo ! J’ai l’habitude de courir le vendredi, mais aujourd’hui j’ai mal au genou et j’ai l’air fatigué. Ce soir, j’ai juste envie de rester chez moi et de regarder un bon film !',
      ),
    ],
    [
      b('avoir envie de (wish) and avoir l’habitude de (habit) take de + noun or infinitive.', 'avoir envie de (souhait) et avoir l’habitude de (habitude) prennent de + nom ou infinitif.'),
      b('avoir mal à + body part uses au, à la, à l’, or aux.', 'avoir mal à + partie du corps s’accorde en au, à la, à l’ ou aux.'),
      b('avoir l’air (+ adjective) = to seem/look; avoir de la chance = to be lucky.', 'avoir l’air (+ adjectif) = paraître ; avoir de la chance = être chanceux.'),
    ],
    [
      ['avoir envie de', b('to feel like / want to', 'souhaiter faire ou avoir')],
      ['avoir de la chance', b('to be lucky', 'bénéficier d’un bon hasard')],
      ['avoir mal à', b('to have a pain / ache in', 'souffrir d’une partie du corps')],
      ['avoir l’air', b('to seem / look', 'paraître, sembler')],
      ['avoir l’habitude de', b('to be used to', 'faire régulièrement par coutume')],
    ],
  ),
];

export default lessons;
