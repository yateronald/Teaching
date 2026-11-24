import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French turns everyday kitchen ingredients—peaches, bananas, cheese, flour, onions, and vinegar—into sharp B1 idioms for energy, exaggeration, deception, and sour outcomes. Master 15 vivid food and cooking metaphors, distinguish register and grammatical traps like en faire tout un fromage or raconter des salades, and weave them naturally into spoken and written French.',
    'Le français transforme les ingrédients de la cuisine — pêche, banane, fromage, farine, oignons ou vinaigre — en expressions B1 savoureuses pour parler de forme, d’exagération, de ruse et de dénouements tendus. Maîtrisez 15 métaphores culinaires, repérez leurs nuances de registre et employez-les avec justesse à l’oral comme à l’écrit.',
  ),
  outcomes: [
    b('Express hunger, vitality, feeling unwell, and fainting with everyday food idioms', 'Exprimer faim, tonus, malaise et évanouissement avec des images alimentaires'),
    b('Spot exaggeration, tall stories, and trickery with kitchen metaphors', 'Repérer l’exagération, les mensonges et la tromperie grâce aux métaphores culinaires'),
    b('Describe heavy workloads, meddling, and things going wrong naturally at B1 level', 'Parler de charge de travail, d’indiscrétion et de situations qui dégénèrent au niveau B1'),
  ],
};

const C = 'exp-food-cooking-idioms';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['hunger-energy-and-mood', 'faim-energie-et-humeur'],
    b('Hunger, energy & feeling off', 'Avoir la dalle, la pêche ou tomber dans les pommes'),
    b('Talk about extreme hunger, upbeat energy, feeling out of sorts, and fainting with five food expressions.', 'Exprimer une grande faim, le plein d’énergie, un malaise ou un évanouissement avec cinq images gourmandes.'),
    [
      b('Distinguish casual hunger (avoir la dalle) from great mood (avoir la pêche / avoir la banane)', 'Distinguer faim familière (avoir la dalle) et bonne humeur (avoir la pêche / avoir la banane)'),
      b('Express feeling unwell or fainting with ne pas être dans son assiette and tomber dans les pommes', 'Exprimer malaise et évanouissement avec ne pas être dans son assiette et tomber dans les pommes'),
      b('Choose the appropriate register in everyday B1 interactions', 'Adapter le registre selon la situation au niveau B1'),
    ],
    13,
    [
      card(
        b('Energy, appetite, and feeling unwell on a plate', 'Énergie, appétit et petits malaises'),
        b(
          'In French, your mood and physical state sound like a fruit basket and a dinner setting: peaches and bananas stand for vitality and big smiles, while a missing plate or falling into apples means feeling off or fainting.\n\nAppetite & energy: **avoir la dalle, avoir la pêche, avoir la banane**.\nFeeling unwell: **ne pas être dans son assiette, tomber dans les pommes**.',
          'En français, la forme et l’humeur empruntent aux fruits et à la vaisselle : la pêche et la banane symbolisent l’entrain et le sourire, tandis que l’assiette et les pommes traduisent le malaise ou l’évanouissement.\n\nAppétit et tonus : **avoir la dalle, avoir la pêche, avoir la banane**.\nMalaise : **ne pas être dans son assiette, tomber dans les pommes**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal picture', 'Image littérale'), b('Meaning', 'Sens réel')],
            rows: [
              ['avoir la dalle', b('to have the flagstone', 'avoir le gosier sec comme une dalle'), b('to be starving (colloquial)', 'avoir très faim (familier)')],
              ['avoir la pêche', b('to have the peach', 'avoir la pêche'), b('to feel full of energy', 'être en pleine forme, dynamique')],
              ['avoir la banane', b('to have the banana', 'avoir la banane'), b('to beam with a big smile', 'avoir un grand sourire, être ravi')],
              ['ne pas être dans son assiette', b('not to be in one’s plate', 'ne pas être dans son assiette'), b('to feel out of sorts, unwell', 'ne pas se sentir dans son état normal')],
              ['tomber dans les pommes', b('to fall into the apples', 'tomber dans les pommes'), b('to faint, pass out', 's’évanouir, perdre connaissance')],
            ],
          },
          ex: [
            ['Il est déjà treize heures et je n’ai rien pris ce matin : j’ai vraiment la dalle !', 'It’s already one p.m. and I haven’t had anything this morning: I’m starving!'],
            ['Depuis qu’elle a reçu sa lettre d’admission, Sarah a la banane toute la journée.', 'Since she received her acceptance letter, Sarah has had a huge smile all day.'],
            ['Il faisait tellement chaud dans le métro qu’un passager a failli tomber dans les pommes.', 'It was so hot in the subway that a passenger nearly fainted.'],
          ],
        },
      ),
      culture(
        b('Plates, swoons, and casual slang', 'Assiette, pommes et registre familier'),
        b(
          'Surprisingly, **ne pas être dans son assiette** has nothing to do with tableware: in older French, *assiette* meant a stable sitting posture or state of mind ("not feeling quite yourself"). Likewise, **tomber dans les pommes** likely evolved from *être dans les pâmes* ("to be in a swoon"). Note also that **avoir la dalle** is distinctly informal—great with friends, whereas at a formal dinner say *j’ai très faim*!',
          'Étonnamment, **ne pas être dans son assiette** ne vient pas de la vaisselle : autrefois, *l’assiette* désignait l’équilibre ou l’état d’esprit habituel. De même, **tomber dans les pommes** viendrait de *pâmer* (s’évanouir). Attention au registre : **avoir la dalle** est très familier et se réserve aux échanges entre proches.',
        ),
      ),
      flash(
        b('Five hunger, mood and energy idioms', 'Cinq expressions de faim, forme et humeur'),
        [
          ['avoir la dalle', b('to be starving (colloquial)', 'avoir très faim (familier)')],
          ['avoir la pêche', b('to be full of energy', 'être en pleine forme')],
          ['avoir la banane', b('to have a huge smile, feel upbeat', 'avoir un large sourire, être ravi')],
          ['ne pas être dans son assiette', b('to feel off, out of sorts', 'ne pas se sentir bien')],
          ['tomber dans les pommes', b('to faint, pass out', 's’évanouir')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('He feels slightly unwell or emotionally off today.', 'Il ne se sent pas en forme ou a le moral un peu bas aujourd’hui.'),
          b('He forgot to bring a plate to the office picnic.', 'Il a oublié d’apporter une assiette au pique-nique.'),
          b('He did not like the main dish at the canteen.', 'Il n’a pas aimé le plat servi à la cantine.'),
          b('He wants to eat dessert straight from the bowl.', 'Il veut manger son dessert directement dans le plat.'),
        ],
        {
          fr: 'Thomas reste très silencieux depuis ce matin : on dirait qu’il n’est pas dans son assiette.',
          explain: b('« Ne pas être dans son assiette » means feeling under the weather or out of sorts.', '« Ne pas être dans son assiette » signifie ne pas se sentir dans son état normal.'),
        },
      ),
      mc(
        P.complete,
        [
          'a vraiment la pêche',
          'tombe dans les pommes',
          'n’est pas dans son assiette',
          'a une grande dalle',
        ],
        {
          fr: 'Après deux semaines de vacances à la mer, notre directrice ___ et lance déjà trois nouveaux projets !',
          explain: b('Bursting with energy after a holiday = avoir la pêche.', 'Déborder de vitalité après les vacances = avoir la pêche.'),
        },
      ),
      pairs(
        P.match,
        [
          ['avoir la dalle', b('to be starving (colloquial)', 'avoir très faim (familier)')],
          ['avoir la pêche', b('to be full of energy', 'être en pleine forme')],
          ['avoir la banane', b('to have a huge smile, feel upbeat', 'avoir un large sourire, être ravi')],
          ['ne pas être dans son assiette', b('to feel off, out of sorts', 'ne pas se sentir bien')],
          ['tomber dans les pommes', b('to faint, pass out', 's’évanouir')],
        ],
      ),
      gap(
        P.complete,
        'J’ai couru dix kilomètres ce matin sans petit-déjeuner : maintenant j’___ ! Prends vite un jus et un sandwich, sinon tu vas ___ !',
        [['ai la dalle'], ['tomber dans les pommes']],
        {
          choices: [
            ['ai la dalle', 'ai la pêche', 'ai la banane'],
            ['tomber dans les pommes', 'être dans mon assiette', 'tourner au vinaigre'],
          ],
          explain: b('Being starving = avoir la dalle; fainting from low energy = tomber dans les pommes.', 'Avoir très faim = avoir la dalle ; s’évanouir = tomber dans les pommes.'),
        },
      ),
      hear(
        'Depuis que Léa a décroché ce stage à Montréal, elle a la banane du matin au soir et une énergie incroyable.',
        b('How does Léa feel about her internship?', 'Comment Léa vit-elle l’obtention de son stage ?'),
        [
          b('She is beaming with joy all day long', 'Elle garde le sourire et reste ravie toute la journée'),
          b('She is anxious because she doesn’t feel well', 'Elle est inquiète parce qu’elle ne se sent pas bien'),
          b('She complains about the food in Montreal', 'Elle se plaint des repas à Montréal'),
        ],
      ),
      dict('Il faisait trop chaud dans la salle et elle est tombée dans les pommes.'),
      say('Ce matin, j’ai vraiment la pêche pour attaquer la semaine !', 'This morning, I really feel full of energy to tackle the week!'),
    ],
    [
      b('avoir la dalle = be starving (informal); avoir la pêche / la banane = feel energetic / beaming.', 'avoir la dalle = avoir très faim (familier) ; avoir la pêche / la banane = être en forme / souriant.'),
      b('ne pas être dans son assiette = feel out of sorts or slightly unwell.', 'ne pas être dans son assiette = ne pas se sentir bien.'),
      b('tomber dans les pommes = to faint (conjugated with être: elle est tombée dans les pommes).', 'tomber dans les pommes = s’évanouir (auxiliaire être au passé composé).'),
    ],
    [
      ['avoir la dalle', b('to be starving (colloquial)', 'avoir très faim (familier)')],
      ['avoir la pêche', b('to be full of energy', 'être en pleine forme')],
      ['avoir la banane', b('to have a huge smile, feel upbeat', 'avoir un large sourire, être ravi')],
      ['ne pas être dans son assiette', b('to feel off, out of sorts', 'ne pas se sentir bien')],
      ['tomber dans les pommes', b('to faint, pass out', 's’évanouir')],
    ],
  ),

  lesson(
    C,
    2,
    ['exaggeration-and-deception', 'exageration-et-tromperie'],
    b('Making a fuss & pulling the wool', 'Tout un fromage et rouler dans la farine'),
    b('Spot exaggeration, tall stories, clever scams, and tough consequences using five kitchen expressions.', 'Repérer l’exagération, les mensonges, la duperie et les sanctions avec cinq métaphores culinaires.'),
    [
      b('Express overreacting with en faire tout un fromage and en faire tout un plat', 'Exprimer la dramatisation avec en faire tout un fromage et en faire tout un plat'),
      b('Identify deception and tall tales with rouler quelqu’un dans la farine and raconter des salades', 'Identifier mensonge et tromperie avec rouler quelqu’un dans la farine et raconter des salades'),
      b('Use passer à la casserole naturally in informal B1 contexts', 'Employer passer à la casserole avec discernement en français courant'),
    ],
    13,
    [
      card(
        b('Drama, lies, and facing the music', 'Drames inutiles, mensonges et mauvais quarts d’heure'),
        b(
          'When someone blows a small glitch out of proportion, tells you tall tales, or tricks you cleanly, French cooks up cheese, salads, flour, and casseroles.\n\nOverreacting: **en faire tout un fromage, en faire tout un plat**.\nDeception & trouble: **rouler quelqu’un dans la farine, raconter des salades, passer à la casserole**.',
          'Quand quelqu’un dramatise un détail, invente des excuses ou vous trompe habilement, le français convoque fromage, salades, farine et casserole.\n\nExagération : **en faire tout un fromage, en faire tout un plat**.\nRuse et épreuve : **rouler quelqu’un dans la farine, raconter des salades, passer à la casserole**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens réel'), b('Example', 'Exemple')],
            rows: [
              ['en faire tout un fromage', b('make a mountain out of a molehill', 'dramatiser un petit détail'), 'Ce n’est qu’une faute de frappe : n’en fais pas tout un fromage !'],
              ['rouler quelqu’un dans la farine', b('to trick / con someone', 'duper quelqu’un habilement'), 'Ce vendeur l’a roulé dans la farine.'],
              ['raconter des salades', b('to tell tall tales, lie', 'mentir, inventer des histoires'), 'Arrête de me raconter des salades !'],
              ['en faire tout un plat', b('to make a huge deal out of it', 'exagérer l’importance d’une chose'), 'On a juste dix minutes de retard, inutile d’en faire tout un plat.'],
              ['passer à la casserole', b('to face the music, get caught/grilled', 'subir un sort redouté ou un contrôle'), 'Tout le monde passe à la casserole lors de l’audit annuel.'],
            ],
          },
          ex: [
            ['Il a oublié un dossier à la maison, mais sa collègue en a fait tout un fromage.', 'He forgot one file at home, and his colleague made a whole drama out of it.'],
            ['Ne te laisse pas rouler dans la farine par ces publicités trop belles pour être vraies.', 'Don’t let yourself be fooled by those ads that sound too good to be true.'],
            ['Chaque printemps, les contribuables passent à la casserole pour la déclaration d’impôts.', 'Every spring, taxpayers face the music with their tax return.'],
          ],
        },
      ),
      trap(
        b('Watch « en », negative « de », and informal tone', 'Attention à « en », au « de » négatif et au registre'),
        b(
          'In **en faire tout un fromage** and **en faire tout un plat**, keep the pronoun **en** (*about it*): **N’en fais pas tout un plat !** In **raconter des salades**, **des** changes to **de** in the negative: **Ne me raconte pas de salades !** Also keep **passer à la casserole** carefully scoped: in neutral/work contexts it means *to face a dreaded ordeal, bill, or inspection*, though in slang it can carry a suggestive double meaning—so stick to clear contexts like taxes or exams.',
          'Dans **en faire tout un fromage** et **en faire tout un plat**, gardez le pronom **en** : **N’en fais pas tout un plat !** Avec une négation, **raconter des salades** devient **Ne me raconte pas de salades !** Quant à **passer à la casserole**, employez-le dans un contexte clair (impôts, contrôle, examen), car l’argot lui donne parfois un autre sens grivois.',
        ),
      ),
      flash(
        b('Five exaggeration and deception idioms', 'Cinq expressions d’exagération et de tromperie'),
        [
          ['en faire tout un fromage', b('to make a huge fuss over nothing', 'exagérer un petit problème')],
          ['rouler quelqu’un dans la farine', b('to dupe, trick someone', 'tromper quelqu’un par la ruse')],
          ['raconter des salades', b('to tell lies, spin tall tales', 'mentir ou inventer des excuses')],
          ['en faire tout un plat', b('to make a big deal out of it', 'dramatiser une situation simple')],
          ['passer à la casserole', b('to face a dreaded ordeal or bill', 'subir une épreuve ou une sanction')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('He cleverly deceived me with false promises.', 'Il m’a trompé habilement avec de fausses promesses.'),
          b('He invited me to bake bread at his bakery.', 'Il m’a invité à faire du pain dans sa boulangerie.'),
          b('He helped me clean up after a messy kitchen accident.', 'Il m’a aidé à nettoyer la cuisine après un incident.'),
          b('He exaggerated how difficult the exam was.', 'Il a exagéré la difficulté de l’examen.'),
        ],
        {
          fr: 'J’ai payé trois fois le vrai tarif pour ce billet : ce site m’a complètement roulé dans la farine !',
          explain: b('« Rouler quelqu’un dans la farine » means tricking or scamming someone.', '« Rouler quelqu’un dans la farine » signifie duper ou arnaquer quelqu’un.'),
        },
      ),
      mc(
        P.form,
        [
          'N’en fais pas tout un fromage',
          'Ne fais pas tout un fromage de ça',
          'Ne raconte pas tout un fromage',
          'Ne passe pas à tout un fromage',
        ],
        {
          fr: 'Ce n’est qu’une petite rayure sur la table : ___ !',
          explain: b('Keep the pronoun en right before fais: N’en fais pas tout un fromage !', 'Gardez le pronom en devant fais : N’en fais pas tout un fromage !'),
        },
      ),
      sort(
        b('Sort each expression by its meaning.', 'Classez chaque expression selon son sens.'),
        [
          b('Exaggerating or facing a tough ordeal', 'Dramatiser ou subir un mauvais moment'),
          b('Lying or deceiving someone', 'Mentir ou tromper quelqu’un'),
        ],
        [
          ['en faire tout un fromage', 0],
          ['raconter des salades', 1],
          ['en faire tout un plat', 0],
          ['rouler quelqu’un dans la farine', 1],
          ['passer à la casserole', 0],
          ['inventer un faux prétexte', 1],
        ],
      ),
      gap(
        P.complete,
        'Ne me raconte pas de ___ : je sais que tu n’as pas raté ton réveil ! Ce n’est pas grave, je ne vais pas en faire tout un ___.',
        [['salades'], ['fromage', 'plat']],
        {
          tr: 'Don’t tell me tall tales: I know you didn’t sleep through your alarm! It’s no big deal, I’m not going to make a mountain out of a molehill.',
          hint: b('First blank: plural noun after negative de; second blank: cheese (or dish).', 'Premier trou : nom pluriel après de ; second trou : fromage (ou plat).'),
        },
      ),
      ord(
        P.order,
        'Arrête de nous raconter des salades sur ton retard.',
        {
          tr: 'Stop telling us tall stories about why you’re late.',
          extra: ['fromage', 'farine'],
        },
      ),
      hear(
        'Le garagiste voulait me facturer des pièces neuves inutilement, mais j’ai vérifié le devis pour ne pas me faire rouler dans la farine.',
        b('Why did the speaker check the quote carefully?', 'Pourquoi la personne a-t-elle vérifié le devis avec soin ?'),
        [
          b('To avoid being tricked into paying for unneeded repairs', 'Pour éviter de se faire duper et de payer des réparations inutiles'),
          b('To make sure the mechanic ordered enough snacks', 'Pour vérifier que le garagiste avait assez à manger'),
          b('To exaggerate the damage done to the car', 'Pour exagérer les dégâts sur la voiture'),
        ],
        { voice: 'm' },
      ),
      say('Ce n’est qu’un petit contretemps, n’en faisons pas tout un plat.', 'It’s only a small setback, let’s not make a big deal out of it.'),
    ],
    [
      b('en faire tout un fromage / tout un plat = blow a small issue out of proportion (keep en!).', 'en faire tout un fromage / tout un plat = dramatiser un détail (gardez en !).'),
      b('rouler quelqu’un dans la farine = dupe/con someone; raconter des salades = tell tall tales.', 'rouler quelqu’un dans la farine = duper ; raconter des salades = mentir.'),
      b('passer à la casserole = face an unpleasant ordeal, inspection, or hefty bill.', 'passer à la casserole = subir un contrôle, une facture ou un moment pénible.'),
    ],
    [
      ['en faire tout un fromage', b('to make a huge fuss over nothing', 'exagérer un petit problème')],
      ['rouler quelqu’un dans la farine', b('to dupe, trick someone', 'tromper quelqu’un par la ruse')],
      ['raconter des salades', b('to tell lies, spin tall tales', 'mentir ou inventer des excuses')],
      ['en faire tout un plat', b('to make a big deal out of it', 'dramatiser une situation simple')],
      ['passer à la casserole', b('to face a dreaded ordeal or bill', 'subir une épreuve ou une sanction')],
    ],
  ),

  lesson(
    C,
    3,
    ['work-mixups-and-outcomes', 'travail-melanges-et-issues'],
    b('Workloads, meddling & sour endings', 'Pain sur la planche et grain de sel'),
    b('Describe heavy workloads, minding your own business, unsolicited advice, disasters, and situations turning sour.', 'Parler de surcharge de travail, d’indiscrétion, de catastrophe et d’ambiance qui se gâte.'),
    [
      b('Talk about heavy workloads with avoir du pain sur la planche', 'Exprimer une grande charge de travail avec avoir du pain sur la planche'),
      b('Contrast minding one’s own business (s’occuper de ses oignons) with meddling (mettre son grain de sel)', 'Opposer discrétion (s’occuper de ses oignons) et ingérence (mettre son grain de sel)'),
      b('Express crises and sour outcomes with c’est la fin des haricots and tourner au vinaigre', 'Décrire un échec ou une dégradation avec c’est la fin des haricots et tourner au vinaigre'),
    ],
    13,
    [
      card(
        b('From bread on the board to turning sour', 'Du pain sur la planche au vinaigre'),
        b(
          'These five B1 idioms capture everyday tensions at work or among friends: facing a mountain of tasks, interfering uninvited, telling someone to back off, dramatic despair, and arguments turning sour.\n\nWork & outcomes: **avoir du pain sur la planche, c’est la fin des haricots, tourner au vinaigre**.\nAdvice & boundaries: **mettre son grain de sel, s’occuper de ses oignons**.',
          'Ces cinq expressions B1 décrivent les tensions du quotidien ou du bureau : une montagne de dossiers, un avis non demandé, un rappel à l’ordre, un drame exagéré et une discussion qui dégénère.\n\nTravail et issue : **avoir du pain sur la planche, c’est la fin des haricots, tourner au vinaigre**.\nIngérence et limites : **mettre son grain de sel, s’occuper de ses oignons**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens réel'), b('Example', 'Exemple')],
            rows: [
              ['avoir du pain sur la planche', b('have lots of work to do', 'avoir beaucoup de travail devant soi'), 'Cette semaine, j’ai du pain sur la planche.'],
              ['s’occuper de ses oignons', b('mind one’s own business', 'se mêler de ses propres affaires'), 'Occupe-toi de tes oignons !'],
              ['c’est la fin des haricots', b('all is lost, that’s the end', 'c’est la catastrophe (souvent ironique)'), 'Plus de réseau avant la réunion ? C’est la fin des haricots !'],
              ['mettre son grain de sel', b('put one’s two cents in uninvited', 'donner un avis non sollicité'), 'Il met toujours son grain de sel partout.'],
              ['tourner au vinaigre', b('to turn sour, go badly', 'dégénérer, mal finir'), 'Le débat a vite tourné au vinaigre.'],
            ],
          },
          ex: [
            ['Avec trois rapports à rendre vendredi, toute l’équipe a du pain sur la planche.', 'With three reports due Friday, the whole team has plenty on its plate.'],
            ['Nous discutions calmement, puis quelqu’un a mis son grain de sel et tout a tourné au vinaigre.', 'We were chatting calmly, then someone put their oar in and everything turned sour.'],
            ['Au lieu de commenter mes choix, il ferait mieux de s’occuper de ses oignons !', 'Instead of commenting on my choices, he’d better mind his own business!'],
          ],
        },
      ),
      tip(
        b('Pair the opposites: « grain de sel » vs. « oignons »', 'Deux contraires : « grain de sel » contre « oignons »'),
        b(
          'Whenever someone **met son grain de sel** (butts in with unsolicited advice), the classic blunt reply is **Occupe-toi de tes oignons !** (*Mind your own business!*). Remember to match the possessive in both: *je m’occupe de mes oignons*, *elle met son grain de sel*, *vous mettez votre grain de sel*. Notice also that **c’est la fin des haricots** is often playful or dramatic rather than tragic.',
          'Quand quelqu’un **met son grain de sel** (donne un avis non demandé), la réplique classique est **Occupe-toi de tes oignons !** (plus familier et vif). Pensez à accorder le possessif avec le sujet : *je m’occupe de mes oignons*, *elle met son grain de sel*. Notez enfin que **c’est la fin des haricots** a souvent une touche d’humour ou d’exagération.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('The conversation became hostile and started going badly.', 'La conversation s’est envenimée et a pris une mauvaise tournure.'),
          b('The chef added too much dressing to the salad.', 'Le cuisinier a mis trop de sauce dans la salade.'),
          b('The meeting ended early because everyone agreed.', 'La réunion s’est terminée tôt dans la bonne humeur.'),
          b('The wine cellar stayed closed until next autumn.', 'La cave à vin est restée fermée jusqu’à l’automne.'),
        ],
        {
          fr: 'Au bout de dix minutes, la réunion entre voisins a tourné au vinaigre.',
          explain: b('« Tourner au vinaigre » means turning bitter, tense, or unpleasant.', '« Tourner au vinaigre » signifie mal tourner, dégénérer.'),
        },
      ),
      pairs(
        P.match,
        [
          ['avoir du pain sur la planche', b('to have a lot of work to do', 'avoir beaucoup de travail devant soi')],
          ['s’occuper de ses oignons', b('to mind one’s own business', 'se mêler uniquement de ses affaires')],
          ['c’est la fin des haricots', b('that’s the last straw, all is lost', 'c’est la catastrophe totale')],
          ['mettre son grain de sel', b('to butt in with unsolicited advice', 'intervenir sans qu’on le demande')],
          ['tourner au vinaigre', b('to turn sour, go downhill', 'mal évoluer, dégénérer')],
        ],
      ),
      hear(
        'La machine à café du bureau vient de tomber en panne un lundi matin à huit heures : vraiment, c’est la fin des haricots !',
        b('What happened at the office on Monday morning?', 'Que s’est-il passé au bureau lundi matin ?'),
        [
          b('The coffee machine broke down, which feels like a disaster', 'La machine à café est en panne, ce qui paraît catastrophique'),
          b('The canteen ran out of green beans for lunch', 'La cantine n’avait plus de haricots verts pour déjeuner'),
          b('Everyone went home early because the meeting finished', 'Tout le monde est rentré tôt après la réunion'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Preparing the community festival', 'En préparant la fête du quartier'),
        b('Nadia and Julien organize the festival stands while dealing with a meddling neighbour.', 'Nadia et Julien organisent les stands tout en gérant un voisin un peu trop curieux.'),
        [['Nadia', 'f2'], ['Julien', 'm']],
        [
          [0, 'Avec vingt stands à installer avant midi, on a vraiment du pain sur la planche aujourd’hui.', 'With twenty stalls to set up before noon, we really have our work cut out today.'],
          [1, {
            options: [
              'C’est clair ! Et en plus, le voisin d’en face vient encore mettre son grain de sel sur le placement des tables.',
              'C’est clair ! Le voisin vient de tomber dans les pommes devant les tables.',
              'Oui, on dirait que le voisin a vraiment la dalle ce matin.',
            ],
            explain: b('Giving unwanted opinions about how to arrange the tables = mettre son grain de sel.', 'Donner son avis sans qu’on le demande = mettre son grain de sel.'),
          }],
          [0, 'Oh non, la dernière fois la discussion avec lui avait tourné au vinaigre en deux minutes.', 'Oh no, last time talking with him turned sour within two minutes.'],
          [1, {
            options: [
              'Ne t’inquiète pas : s’il insiste, je lui dirai poliment de s’occuper de ses oignons.',
              'Ne t’inquiète pas : s’il insiste, je vais rouler les tables dans la farine.',
              'Ne t’en fais pas : je vais lui donner ma langue au chat.',
            ],
            explain: b('Telling a meddler to mind their own business = s’occuper de ses oignons.', 'Inviter un curieux à ne pas se mêler des affaires d’autrui = s’occuper de ses oignons.'),
          }],
          [0, 'Parfait, concentrons-nous sur l’ouverture, tout va bien se passer !', 'Great, let’s focus on opening on time—everything will go fine!'],
        ],
      ),
      dict('Il met toujours son grain de sel quand la discussion tourne au vinaigre.'),
      write(
        b('A hectic day in the kitchen or at work', 'Une journée mouvementée au travail ou en famille'),
        b('Write 45 to 85 words describing a busy or tense situation where people disagreed, overreacted, or worked hard together. Use at least three idioms from this course.', 'Écrivez 45 à 85 mots pour raconter une journée chargée ou tendue où quelqu’un a exagéré, menti ou beaucoup travaillé. Employez au moins trois expressions de ce cours.'),
        45,
        85,
        [
          b('At least three food or cooking idioms', 'Au moins trois expressions culinaires de ce cours'),
          b('Consistent past or present narration', 'Récit cohérent au passé ou au présent'),
          b('Correct pronouns (en, se) and agreement', 'Pronoms (en, se) et accords justes'),
        ],
        'Lundi matin, nous avions du pain sur la planche pour préparer la présentation trimestrielle. Malheureusement, Paul n’était pas dans son assiette et a commencé à en faire tout un fromage pour un graphique décalé. Quand Marc a mis son grain de sel, j’ai cru que la réunion allait tourner au vinaigre. Finalement, chacun a gardé son calme et nous avons terminé à temps !',
        { phrases: ['du pain sur la planche', 'en faire tout un fromage', 'mis son grain de sel', 'tourner au vinaigre'] },
      ),
    ],
    [
      b('avoir du pain sur la planche = have lots of work to do.', 'avoir du pain sur la planche = avoir beaucoup de travail devant soi.'),
      b('mettre son grain de sel = give unsolicited advice; s’occuper de ses oignons = mind your own business.', 'mettre son grain de sel = s’immiscer ; s’occuper de ses oignons = rester à sa place.'),
      b('c’est la fin des haricots = all is lost (often humorous); tourner au vinaigre = turn sour.', 'c’est la fin des haricots = c’est la catastrophe ; tourner au vinaigre = mal tourner.'),
    ],
    [
      ['avoir du pain sur la planche', b('to have a lot of work to do', 'avoir beaucoup de travail devant soi')],
      ['s’occuper de ses oignons', b('to mind one’s own business', 'se mêler uniquement de ses affaires')],
      ['c’est la fin des haricots', b('that’s the last straw, all is lost', 'c’est la catastrophe totale')],
      ['mettre son grain de sel', b('to butt in with unsolicited advice', 'intervenir sans qu’on le demande')],
      ['tourner au vinaigre', b('to turn sour, go downhill', 'mal évoluer, dégénérer')],
    ],
  ),
];

export default lessons;
