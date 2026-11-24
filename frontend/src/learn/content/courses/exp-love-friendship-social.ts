import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Relationships in French are full of vivid images—from thunderbolts of attraction and butterflies in the stomach to being on the same wavelength, backing each other up, standing someone up with a rabbit, or wiping the slate clean with a sponge. This B1 course guides you through fifteen essential idioms of romance, friendship, loyalty and reconciliation.',
    'En français, les relations humaines regorgent d’images fortes : coup de foudre, papillons dans le ventre, longueur d’onde partagée, entraide ou réconciliation autour d’une hache de guerre enterrée. Ce cours B1 vous fait pratiquer quinze expressions indispensables sur l’amour, l’amitié, la confiance et le pardon.',
  ),
  outcomes: [
    b('Describe attraction, romance and infatuation naturally in French', 'Décrire l’attirance, le coup de foudre et les élans amoureux'),
    b('Talk about friendship, compatibility and mutual support', 'Parler de complicité, d’entente et de solidarité entre amis'),
    b('Express forgiveness, moving on, standing someone up and holding grudges', 'Exprimer le pardon, l’oubli d’un conflit, l’absence à un rendez-vous et la rancune'),
  ],
};

const C = 'exp-love-friendship-social';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['romance-and-attraction', 'amour-et-attirance'],
    b('Love at first sight & romance', 'Coup de foudre et élan amoureux'),
    b('Talk about sudden attraction, confessing feelings and lasting love using natural French idioms.', 'Parler d’attirance soudaine, de déclaration et de bonheur amoureux avec justesse.'),
    [
      b('Express instant attraction with avoir le coup de foudre', 'Exprimer l’attirance soudaine avec avoir le coup de foudre'),
      b('Describe emotional excitement and devotion with avoir des papillons dans le ventre and être fou amoureux', 'Décrire l’émotion amoureuse et la passion'),
      b('Use déclarer sa flamme and filer le parfait amour in context', 'Employer déclarer sa flamme et filer le parfait amour en contexte'),
    ],
    13,
    [
      card(
        b('The language of romance', 'Les images du sentiment amoureux'),
        b(
          'French loves dramatic images of lightning, fire and spinning thread for love. Notice **avoir le coup de foudre** (which can also describe falling instantly for a city or house!), **déclarer sa flamme** (to confess one’s feelings), **avoir des papillons dans le ventre**, **être fou amoureux** (feminine: **folle amoureuse**), and **filer le parfait amour**.\n\nFirst spark: **avoir le coup de foudre, avoir des papillons dans le ventre**.\nConfession & lasting bond: **déclarer sa flamme, être fou amoureux, filer le parfait amour**.',
          'Le français associe l’amour à l’éclair, au feu et au fil tissé. **Avoir le coup de foudre** s’emploie aussi pour une ville ou un lieu ! Ajoutez **déclarer sa flamme**, **avoir des papillons dans le ventre**, **être fou amoureux** (au féminin : **folle amoureuse**) et **filer le parfait amour**.\n\nPremière étincelle : **avoir le coup de foudre, avoir des papillons dans le ventre**.\nDéclaration et durée : **déclarer sa flamme, être fou amoureux, filer le parfait amour**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['avoir le coup de foudre', b('to be struck by lightning', 'recevoir un éclair'), b('to experience love at first sight', 'tomber amoureux d’un seul coup')],
              ['déclarer sa flamme', b('to declare one’s flame', 'avouer son feu intérieur'), b('to confess one’s romantic feelings', 'avouer son amour à quelqu’un')],
              ['filer le parfait amour', b('to spin perfect love', 'tisser un fil harmonieux'), b('to live in blissful harmony', 'vivre une relation très heureuse')],
              ['avoir des papillons dans le ventre', b('butterflies in the stomach', 'frémissement intérieur'), b('to have nervous romantic excitement', 'sentir un trac joyeux par amour')],
              ['être fou amoureux', b('to be madly in love', 'fou / folle d’amour'), b('to be head over heels in love', 'aimer passionnément')],
            ],
          },
          ex: [
            ['Ils ont eu le coup de foudre dès leur premier voyage à Bordeaux.', 'They fell in love at first sight during their very first trip to Bordeaux.'],
            ['Après des mois d’hésitation, Julien lui a enfin déclaré sa flamme.', 'After months of hesitation, Julien finally declared his feelings to her.'],
            ['Dix ans plus tard, ils filent toujours le parfait amour.', 'Ten years later, they are still living in blissful harmony.'],
          ],
        },
      ),
      tip(
        b('Agreement and broader uses', 'Accords et emplois élargis'),
        b(
          'Remember that both words agree in **être fou amoureux**: *Il est fou amoureux*, **Elle est folle amoureuse**, *Ils sont fous amoureux* (or *être fou/folle amoureux de quelqu’un*). Note too that **avoir le coup de foudre pour** works outside romance: *J’ai eu un vrai coup de foudre pour cette vieille librairie !*\n\nGender forms: **fou amoureux / folle amoureuse**.\nWith preposition: **avoir un coup de foudre pour + nom**.',
          'N’oubliez pas le double accord dans **être fou amoureux** : *Il est fou amoureux*, **Elle est folle amoureuse**, *Ils sont fous amoureux*. De plus, **avoir le coup de foudre pour** s’utilise aussi pour un lieu ou un objet : *J’ai eu le coup de foudre pour cette vieille librairie !*\n\nAccords : **fou amoureux / folle amoureuse**.\nPréposition : **avoir un coup de foudre pour + nom**.',
        ),
      ),
      flash(b('Romance & attraction', 'Amour et attirance'), [
        ['avoir le coup de foudre', b('to experience love at first sight', 'tomber amoureux instantanément')],
        ['déclarer sa flamme', b('to declare one’s feelings', 'avouer son amour')],
        ['filer le parfait amour', b('to live in blissful harmony', 'vivre une belle histoire sans nuages')],
        ['avoir des papillons dans le ventre', b('to have butterflies in one’s stomach', 'ressentir une émotion amoureuse vive')],
        ['être fou amoureux', b('to be madly in love', 'aimer passionnément')],
      ]),
      mc(
        P.best,
        ['a eu le coup de foudre', 'a tourné la page', 'a gardé rancune', 'a posé un lapin'],
        {
          fr: 'Dès la première seconde où Antoine a croisé le regard d’Élise à la gare, il ___ !',
          explain: b('Instant, overwhelming attraction at first glance is avoir le coup de foudre.', 'Une attirance immédiate au premier regard se dit avoir le coup de foudre.'),
        },
      ),
      mc(
        P.form,
        ['folle amoureuse', 'fou amoureuse', 'folle amoureux', 'fous amoureuse'],
        {
          fr: 'Camille ne parle que de Thomas : elle est ___ de lui.',
          explain: b('Both adjectives agree with Camille (feminine singular): folle amoureuse.', 'Les deux adjectifs s’accordent au féminin singulier avec Camille : folle amoureuse.'),
        },
      ),
      pairs(P.match, [
        ['avoir le coup de foudre', b('love at first sight', 'attirance soudaine et immédiate')],
        ['déclarer sa flamme', b('to confess one’s love', 'dire ses sentiments pour la première fois')],
        ['filer le parfait amour', b('to be blissfully happy together', 's’aimer durablement en harmonie')],
        ['avoir des papillons dans le ventre', b('to have butterflies', 'sentir un doux frémissement avant un rendez-vous')],
        ['être fou amoureux', b('to be head over heels in love', 'éprouver une grande passion')],
      ]),
      gap(
        P.complete,
        'Juste avant de dîner avec Nadia, j’avais des ___ dans le ventre, puis j’ai pris mon courage à deux mains pour lui ___ ma flamme.',
        [['papillons'], ['déclarer']],
        {
          choices: [
            ['papillons', 'nuages', 'lapins'],
            ['déclarer', 'filer', 'compter'],
          ],
          explain: b('Avoir des papillons dans le ventre describes excited nerves; déclarer sa flamme means confessing love.', 'Avoir des papillons dans le ventre exprime l’émotion et déclarer sa flamme signifie avouer son amour.'),
        },
      ),
      hear(
        'Ils se sont rencontrés par hasard dans le train de Bordeaux : ça a été le coup de foudre, et cinq ans après ils filent toujours le parfait amour.',
        b('What happened between the two people?', 'Que s’est-il passé entre ces deux personnes ?'),
        [
          b('They fell in love at first sight on a train and are still very happy together.', 'Ils sont tombés amoureux tout de suite et vivent toujours heureux ensemble.'),
          b('They argued on the train and stopped speaking for five years.', 'Ils se sont disputés dans le train et ne se parlent plus.'),
          b('They missed their train because they were daydreaming.', 'Ils ont raté leur train par distraction.'),
        ],
      ),
      dict('Avant de lui déclarer sa flamme, il avait des papillons dans le ventre.'),
      say('C’était un vrai coup de foudre : ils filent le parfait amour depuis trois ans.', 'It was true love at first sight: they have been blissfully happy for three years.'),
    ],
    [
      b('avoir le coup de foudre describes instant attraction (for a person or even a place).', 'avoir le coup de foudre décrit un charme immédiat (pour une personne ou même un lieu).'),
      b('déclarer sa flamme = confess feelings; filer le parfait amour = live happily in love.', 'déclarer sa flamme = avouer ses sentiments ; filer le parfait amour = vivre une relation harmonieuse.'),
      b('Both words agree in être fou amoureux / être folle amoureuse.', 'Les deux adjectifs s’accordent : fou amoureux / folle amoureuse.'),
    ],
    [
      ['avoir le coup de foudre', b('to fall in love at first sight', 'éprouver une attirance immédiate')],
      ['déclarer sa flamme', b('to declare one’s love', 'avouer ses sentiments')],
      ['filer le parfait amour', b('to live in blissful harmony', 'vivre un grand bonheur à deux')],
      ['avoir des papillons dans le ventre', b('to have butterflies in one’s stomach', 'ressentir une vive émotion intérieure')],
      ['être fou amoureux', b('to be madly in love', 'aimer avec passion')],
    ],
  ),

  lesson(
    C,
    2,
    ['connection-and-friendship', 'complicite-et-amitie'],
    b('Friendship, wavelength & solidarity', 'Complicité, longueur d’onde et solidarité'),
    b('Describe natural rapport, breaking the ice and standing by friends through thick and thin.', 'Décrire une belle entente, briser la glace et soutenir ses amis dans les épreuves.'),
    [
      b('Express instant rapport with être sur la même longueur d’onde and s’entendre à merveille', 'Exprimer la complicité et la bonne entente'),
      b('Talk about easing tension with briser la glace', 'Parler du premier contact avec briser la glace'),
      b('Show loyalty and support with se serrer les coudes and compter sur quelqu’un', 'Exprimer l’entraide et la confiance'),
    ],
    13,
    [
      card(
        b('Five expressions of true friendship', 'Cinq expressions d’amitié et d’entente'),
        b(
          'Great friendships combine easy conversation and dependable action. You **brisez la glace** at a first meeting, discover you **êtes sur la même longueur d’onde**, **vous entendez à merveille**, know you can **compter sur quelqu’un**, and **vous serrez les coudes** when life gets hard.\n\nAffinity & rapport: **être sur la même longueur d’onde, s’entendre à merveille, briser la glace**.\nLoyalty & trust: **se serrer les coudes, compter sur quelqu’un**.',
          'Une vraie amitié unit complicité et solidarité. On commence par **briser la glace**, on réalise qu’on **est sur la même longueur d’onde**, on **s’entend à merveille**, on sait qu’on peut **compter sur quelqu’un**, et on **se serre les coudes** dans les coups durs.\n\nAffinités et entente : **être sur la même longueur d’onde, s’entendre à merveille, briser la glace**.\nSoutien et confiance : **se serrer les coudes, compter sur quelqu’un**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['être sur la même longueur d’onde', b('on the same radio wavelength', 'capter la même fréquence'), b('to think alike, share the same vibe', 'partager les mêmes idées et goûts')],
              ['se serrer les coudes', b('to press elbows together', 'rapprocher ses coudes'), b('to stick together, back each other up', 'être solidaire, s’entraider')],
              ['s’entendre à merveille', b('to understand each other marvelously', 's’accorder à la perfection'), b('to get along wonderfully', 'avoir une excellente entente')],
              ['briser la glace', b('to break the ice', 'rompre la glace'), b('to ease awkwardness at a first meeting', 'détendre l’atmosphère au début')],
              ['compter sur quelqu’un', b('to count on someone', 's’appuyer sur quelqu’un'), b('to rely on, trust someone', 'faire confiance à quelqu’un')],
            ],
          },
          ex: [
            ['Dès la première pause café, une blague a suffi pour briser la glace.', 'At the very first coffee break, one joke was enough to break the ice.'],
            ['Samir et Léo s’entendent à merveille : ils sont toujours sur la même longueur d’onde.', 'Samir and Léo get along wonderfully: they are always on the same wavelength.'],
            ['Dans cette association, tout le monde se serre les coudes quand il y a un imprévu.', 'In this association, everyone sticks together when something unexpected happens.'],
          ],
        },
      ),
      trap(
        b('Watch the past participle in se serrer les coudes!', 'Piège d’accord avec se serrer les coudes !'),
        b(
          'Be careful with the passé composé of **se serrer les coudes**: because *les coudes* is the direct object placed **after** the verb, *serré* stays invariable: **Elles se sont serré les coudes** (never *serrées*!). By contrast, in **Elles se sont entendues à merveille**, *entendues* agrees with *elles*. Also do not confuse *être inséparables* (very close friends) with *se ressembler comme deux gouttes d’eau* (looking physically alike).\n\nInvariable COD after verb: **Elles se sont serré les coudes**.\nAgrees with direct reflexive: **Elles se sont entendues à merveille**.',
          'Attention au passé composé de **se serrer les coudes** : comme *les coudes* est complément d’objet direct placé **après** le verbe, *serré* reste invariable : **Elles se sont serré les coudes** (jamais *serrées* !). À l’inverse, dans **Elles se sont entendues à merveille**, l’accord se fait. Ne confondez pas non plus *être inséparables* et *se ressembler comme deux gouttes d’eau* (ressemblance physique).\n\nParticipe invariable : **Elles se sont serré les coudes**.\nParticipe accordé : **Elles se sont entendues à merveille**.',
        ),
      ),
      flash(b('Friendship & trust', 'Amitié et solidarité'), [
        ['être sur la même longueur d’onde', b('to be on the same wavelength', 'penser pareil, avoir les mêmes goûts')],
        ['se serrer les coudes', b('to stick together, support each other', 's’entraider face aux difficultés')],
        ['s’entendre à merveille', b('to get along wonderfully', 'avoir une excellente relation')],
        ['briser la glace', b('to break the ice', 'détendre une première rencontre')],
        ['compter sur quelqu’un', b('to count on someone', 'pouvoir faire confiance à quelqu’un')],
      ]),
      mc(
        P.best,
        ['sur la même longueur d’onde', 'au beau fixe', 'dans le ventre', 'à deux doigts'],
        {
          fr: 'Nous avons exactement les mêmes références musicales et cinématographiques : nous sommes ___.',
          explain: b('Sharing the exact same ideas and tastes is être sur la même longueur d’onde.', 'Partager les mêmes goûts et la même façon de penser se dit être sur la même longueur d’onde.'),
        },
      ),
      mc(
        P.form,
        ['se sont serré', 'se sont serrées', 'ont serré', 'se sont serrés'],
        {
          fr: 'Pendant la tempête d’hiver, les voisines ___ les coudes pour aider les personnes âgées.',
          explain: b('With les coudes placed after the verb, se serrer takes an invariable participle: se sont serré.', 'Comme les coudes suit le verbe, le participe reste invariable : se sont serré.'),
        },
      ),
      sort(
        b('Sort each phrase: warm affinity or solidarity & reliability.', 'Classez : affinités et accueil ou solidarité et confiance.'),
        [
          b('Warm affinity & first contact', 'Complicité et premier contact'),
          b('Loyalty & mutual support', 'Solidarité et confiance'),
        ],
        [
          ['être sur la même longueur d’onde', 0],
          ['se serrer les coudes', 1],
          ['s’entendre à merveille', 0],
          ['compter sur quelqu’un', 1],
          ['briser la glace', 0],
          ['soutenir un ami dans l’épreuve', 1],
        ],
      ),
      gap(
        P.complete,
        'Au début du dîner, personne ne parlait, mais un jeu de cartes a vite ___ la glace. Ensuite, tout le monde s’est ___ à merveille !',
        [['brisé'], ['entendu']],
        {
          choices: [
            ['brisé', 'serré', 'compté'],
            ['entendu', 'remis', 'passé'],
          ],
          explain: b('Briser la glace (break the ice) and s’entendre à merveille (here with masculine/impersonal tout le monde → entendu).', 'Briser la glace détend l’atmosphère et tout le monde s’est entendu à merveille.'),
        },
      ),
      ord(
        P.order,
        'Je sais que je peux toujours compter sur mes amis.',
        {
          tr: 'I know I can always count on my friends.',
          extra: ['onde', 'serrer'],
          explain: b('Compter sur + person always precedes the friend’s name or noun.', 'Compter sur précède directement la personne de confiance.'),
        },
      ),
      hear(
        'Quand notre colocataire a perdu son travail, nous nous sommes serré les coudes pendant deux mois : elle savait qu’elle pouvait compter sur nous.',
        b('How did the flatmates respond to the crisis?', 'Comment les colocataires ont-ils réagi face à cette difficulté ?'),
        [
          b('They stood by her and supported her reliably.', 'Ils ont été solidaires et elle a pu s’appuyer sur eux.'),
          b('They broke off contact until she found another flat.', 'Ils ont pris leurs distances en attendant qu’elle déménage.'),
          b('They had trouble breaking the ice at first.', 'Ils ont eu du mal à faire connaissance au début.'),
        ],
        { voice: 'f2' },
      ),
      say('Dès la première conversation, nous étions sur la même longueur d’onde et nous nous sommes entendus à merveille.', 'From the very first conversation, we were on the same wavelength and got along wonderfully.'),
    ],
    [
      b('briser la glace = ease initial awkwardness; être sur la même longueur d’onde = share the same mindset.', 'briser la glace = détendre le début ; être sur la même longueur d’onde = partager les mêmes idées.'),
      b('compter sur quelqu’un = rely on someone; s’entendre à merveille = get along splendidly.', 'compter sur quelqu’un = avoir confiance ; s’entendre à merveille = avoir une excellente entente.'),
      b('In the passé composé, write elles se sont serré les coudes (invariable serré).', 'Au passé composé, écrivez elles se sont serré les coudes (participe invariable).'),
    ],
    [
      ['être sur la même longueur d’onde', b('to be on the same wavelength', 'partager les mêmes idées et goûts')],
      ['se serrer les coudes', b('to stick together', 's’entraider avec solidarité')],
      ['s’entendre à merveille', b('to get along wonderfully', 'avoir une entente parfaite')],
      ['briser la glace', b('to break the ice', 'détendre l’ambiance au premier contact')],
      ['compter sur quelqu’un', b('to rely on someone', 'avoir confiance en quelqu’un')],
    ],
  ),

  lesson(
    C,
    3,
    ['forgiving-and-moving-on', 'pardonner-et-tourner-la-page'],
    b('Friction, forgiveness & moving on', 'Conflits, pardon et page tournée'),
    b('Talk about standing someone up, letting go of grudges and making peace with tact.', 'Évoquer un lapin posé, la rancune et la réconciliation avec nuance.'),
    [
      b('Name broken promises and resentment with poser un lapin à quelqu’un and garder rancune', 'Nommer un rendez-vous manqué et le ressentiment'),
      b('Express reconciliation with passer l’éponge and enterrer la hache de guerre', 'Exprimer le pardon et la réconciliation'),
      b('Close a painful chapter with tourner la page', 'Tourner la page après un différend'),
    ],
    13,
    [
      card(
        b('Making peace or holding back', 'Apaiser ou garder rancune'),
        b(
          'Even close friends clash sometimes—maybe someone forgot to show up (**poser un lapin à quelqu’un**). Afterwards, you can **garder rancune** (hold a grudge), or choose to **passer l’éponge** (forgive and forget), **enterrer la hache de guerre** (make peace), and **tourner la page** (move forward).\n\nFriction: **poser un lapin à quelqu’un, garder rancune**.\nReconciliation: **passer l’éponge, enterrer la hache de guerre, tourner la page**.',
          'Même entre amis, un malentendu arrive : quelqu’un oublie un rendez-vous (**poser un lapin à quelqu’un**). On peut alors **garder rancune**, ou choisir de **passer l’éponge**, d’**enterrer la hache de guerre** et de **tourner la page**.\n\nTension : **poser un lapin à quelqu’un, garder rancune**.\nRéconciliation : **passer l’éponge, enterrer la hache de guerre, tourner la page**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['tourner la page', b('to turn the page', 'passer à la page suivante'), b('to move on from the past', 'laisser le passé derrière soi')],
              ['passer l’éponge', b('to wipe with a sponge', 'effacer l’ardoise'), b('to forgive and forget', 'pardonner, effacer une faute')],
              ['enterrer la hache de guerre', b('to bury the war hatchet', 'enfouir l’arme du conflit'), b('to bury the hatchet, make peace', 'mettre fin à une querelle')],
              ['poser un lapin à quelqu’un', b('to put a rabbit on someone', 'laisser attendre en vain'), b('to stand someone up', 'ne pas venir à un rendez-vous')],
              ['garder rancune', b('to keep resentment', 'conserver du ressentiment'), b('to hold a grudge (against)', 'en vouloir durablement à quelqu’un')],
            ],
          },
          ex: [
            ['Je l’ai attendu quarante minutes devant le cinéma : il m’a posé un lapin !', 'I waited forty minutes for him outside the cinema: he stood me up!'],
            ['Il s’est excusé sincèrement, alors j’ai décidé de passer l’éponge.', 'He apologized sincerely, so I decided to let bygones be bygones.'],
            ['Après des mois de silence, les deux sœurs ont enfin enterré la hache de guerre.', 'After months of silence, the two sisters finally buried the hatchet.'],
          ],
        },
      ),
      culture(
        b('Why a rabbit, a sponge and a hatchet?', 'Pourquoi un lapin, une éponge et une hache ?'),
        b(
          'In 19th-century France, **poser un lapin** meant leaving without paying—and soon came to mean not showing up to meet someone at all! **Passer l’éponge** comes from wiping chalk off a school slate so the mistake disappears, while **enterrer la hache de guerre** entered French through accounts of Indigenous peace ceremonies in North America. Notice too: **garder rancune à quelqu’un** takes **à** (*Je ne lui garde pas rancune*).\n\nIndirect pronoun: **Il m’a posé un lapin · Je ne lui garde aucune rancune**.',
          'Au XIXe siècle, **poser un lapin** désignait d’abord un refus de payer, puis l’absence à un rendez-vous convenu. **Passer l’éponge** vient de l’ardoise scolaire qu’on efface, et **enterrer la hache de guerre** vient des récits de paix en Amérique du Nord. Notez la préposition de **garder rancune à quelqu’un** (*Je ne lui garde pas rancune*).\n\nPronom indirect : **Il m’a posé un lapin · Je ne lui garde aucune rancune**.',
        ),
      ),
      mc(
        P.best,
        ['passer l’éponge', 'poser un lapin', 'garder rancune', 'sortir de ses gonds'],
        {
          fr: 'Tu as reconnu ton erreur et tu as payé le dîner pour te faire pardonner : allez, je veux bien ___ !',
          explain: b('Forgiving a mistake and wiping the slate clean is passer l’éponge.', 'Pardonner une erreur sincèrement reconnue se dit passer l’éponge.'),
        },
      ),
      pairs(P.match, [
        ['tourner la page', b('to move on', 'passer à autre chose après une épreuve')],
        ['passer l’éponge', b('to forgive and forget', 'pardonner sans reproche')],
        ['enterrer la hache de guerre', b('to bury the hatchet', 'se réconcilier après un conflit')],
        ['poser un lapin à quelqu’un', b('to stand someone up', 'ne pas venir à un rendez-vous')],
        ['garder rancune', b('to hold a grudge', 'continuer d’en vouloir à quelqu’un')],
      ]),
      hear(
        'Même si Marc m’avait posé un lapin la semaine dernière, je ne lui garde pas rancune : nous avons enterré la hache de guerre autour d’un café ce matin.',
        b('Where does their relationship stand now?', 'Où en est leur relation aujourd’hui ?'),
        [
          b('They have made peace and she holds no grudge.', 'Ils se sont réconciliés et elle ne lui en veut plus.'),
          b('She refuses to see him again after last week.', 'Elle refuse de le revoir après l’incident.'),
          b('He stood her up a second time at the café.', 'Il ne s’est pas présenté au café non plus ce matin.'),
        ],
        { voice: 'm2' },
      ),
      dlg(
        b('Making peace at the café', 'Se réconcilier au café'),
        b('Léa arrives to meet her friend Bastien after missing their appointment two days earlier.', 'Léa retrouve son ami Bastien deux jours après avoir manqué leur rendez-vous.'),
        [['Léa', 'f'], ['Bastien', 'm']],
        [
          [0, 'Bastien, merci d’être venu. Je suis encore désolée de t’avoir posé un lapin mardi… mon téléphone était mort.', 'Bastien, thanks for coming. I’m still sorry I stood you up on Tuesday… my phone was dead.'],
          [1, {
            options: [
              'Honnêtement, j’étais vexé sur le coup, mais je ne te garde pas rancune.',
              'Honnêtement, je vais monter sur mes grands chevaux pour toujours.',
              'Honnêtement, j’ai déclaré ma flamme au serveur.',
            ],
            explain: b('Je ne te garde pas rancune politely says “I don’t hold it against you.”', 'Je ne te garde pas rancune signifie « je ne t’en veux pas ».'),
          }],
          [0, 'C’est vraiment gentil. J’espère qu’on peut passer l’éponge et continuer notre projet ensemble.', 'That’s really kind. I hope we can wipe the slate clean and keep working on our project together.'],
          [1, {
            options: [
              'Bien sûr ! Allez, on enterre la hache de guerre et on tourne la page.',
              'Bien sûr ! On va encore se poser un lapin demain.',
              'Non, j’ai le trac devant ce croissant.',
            ],
            explain: b('Enterrer la hache de guerre and tourner la page seal the reconciliation.', 'Enterrer la hache de guerre et tourner la page scellent la réconciliation.'),
          }],
          [0, 'Super, c’est moi qui invite aujourd’hui !', 'Great, today’s coffee is on me!'],
        ],
      ),
      dict('Il est difficile de tourner la page quand on continue à garder rancune.'),
      write(
        b('After a misunderstanding', 'Après un malentendu'),
        b('Write 45–85 words telling a short story (real or invented) about a misunderstanding between two friends—someone misses a meeting or says the wrong thing—and how they resolve it. Use at least three idioms from this course (such as poser un lapin, garder rancune, passer l’éponge, enterrer la hache de guerre or tourner la page).', 'Racontez en 45 à 85 mots un court malentendu entre deux amis — un rendez-vous manqué ou une remarque maladroite — puis comment ils se réconcilient. Utilisez au moins trois expressions de ce cours (comme poser un lapin, garder rancune, passer l’éponge, enterrer la hache de guerre ou tourner la page).'),
        45,
        85,
        [
          b('Clear narrative: incident, feelings, reconciliation', 'Récit clair : incident, ressenti, réconciliation'),
          b('At least three relationship idioms used accurately', 'Au moins trois expressions employées avec justesse'),
          b('Correct indirect pronouns (lui poser un lapin, ne pas lui garder rancune)', 'Bons pronoms indirects (lui poser un lapin, ne pas lui garder rancune)'),
        ],
        'Le mois dernier, mon ami Thomas m’a posé un lapin devant la gare parce qu’il avait noté la mauvaise heure. Sur le moment, j’étais déçu, mais je sais que je peux compter sur lui d’habitude. Quand il s’est excusé avec deux billets de concert, j’ai vite passé l’éponge. Nous avons enterré la hache de guerre et tourné la page sans garder rancune.',
        { phrases: ['… m’a posé un lapin…', 'Je ne lui ai pas gardé rancune…', 'Nous avons passé l’éponge…', '… tourner la page'] },
      ),
    ],
    [
      b('poser un lapin à quelqu’un = stand someone up; garder rancune = hold a grudge.', 'poser un lapin à quelqu’un = ne pas venir au rendez-vous ; garder rancune = en vouloir.'),
      b('passer l’éponge and enterrer la hache de guerre express forgiving and making peace.', 'passer l’éponge et enterrer la hache de guerre signifient pardonner et se réconcilier.'),
      b('tourner la page = leave the past behind and move forward.', 'tourner la page = passer à autre chose.'),
    ],
    [
      ['tourner la page', b('to turn the page, move on', 'laisser le passé derrière soi')],
      ['passer l’éponge', b('to forgive and forget', 'pardonner et effacer une faute')],
      ['enterrer la hache de guerre', b('to bury the hatchet', 'se réconcilier après une dispute')],
      ['poser un lapin à quelqu’un', b('to stand someone up', 'ne pas venir à un rendez-vous')],
      ['garder rancune', b('to hold a grudge', 'garder du ressentiment')],
    ],
  ),
];

export default lessons;
