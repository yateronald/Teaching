import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French captures hard work, craft and breakthrough moments through vivid physical and nautical metaphors—rolling up your sleeves, hitting two targets with one stone, keeping the ship on course, and unhooking the silver prize cup. This B1 course teaches fifteen high-value idioms for effort, mastery, strategy and professional recognition.',
    'Le français décrit l’effort, le savoir-faire et la réussite par des images concrètes, artisanales ou maritimes : se retrousser les manches, faire d’une pierre deux coups, garder le cap ou décrocher la timbale. Ce cours B1 vous fait maîtriser quinze expressions clés du travail, de l’ambition et de la persévérance.',
  ),
  outcomes: [
    b('Talk about intense effort and dedication using idiomatic verbs', 'Exprimer l’engagement et l’effort soutenu avec naturel'),
    b('Describe versatile skills, efficiency and steady focus in work contexts', 'Décrire polyvalence, stratégie efficace et maîtrise professionnelle'),
    b('Celebrate milestones, breakthroughs and recognition fluently', 'Parler de caps franchis, de résultats fructueux et de reconnaissance'),
  ],
};

const C = 'exp-work-effort-success';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['rolling-up-sleeves', 'se-retrousser-les-manches'],
    b('Rolling up your sleeves & hard work', 'Se retrousser les manches et redoubler d’efforts'),
    b('Describe diving into demanding work, giving your all and doubling the pace.', 'Dire qu’on s’attaque au travail avec énergie, détermination et sans compter ses heures.'),
    [
      b('Express getting straight to work with se retrousser les manches', 'Dire qu’on se met à l’œuvre avec se retrousser les manches'),
      b('Describe relentless effort with travailler d’arrache-pied, se donner à fond and ne pas compter ses heures', 'Exprimer un travail acharné et sans relâche'),
      b('Show stepped-up pace with mettre les bouchées doubles', 'Exprimer l’accélération de l’effort avec mettre les bouchées doubles'),
    ],
    13,
    [
      card(
        b('Getting down to real work', 'Passer à l’action sans compter'),
        b(
          'Whether preparing a workshop, finishing a thesis or launching a project, French leans on energetic physical images: **se retrousser les manches** (to roll up one’s sleeves), **travailler d’arrache-pied** (working tirelessly), **se donner à fond** (giving 100%), **mettre les bouchées doubles** (doubling the pace), and **ne pas compter ses heures** (putting in long hours).\n\nStarting & accelerating: **se retrousser les manches, mettre les bouchées doubles**.\nSustained dedication: **travailler d’arrache-pied, se donner à fond, ne pas compter ses heures**.',
          'Pour préparer un chantier, boucler un mémoire ou lancer un projet, le français recourt à des images d’énergie concrète : **se retrousser les manches**, **travailler d’arrache-pied**, **se donner à fond**, **mettre les bouchées doubles** et **ne pas compter ses heures**.\n\nLancer et accélérer : **se retrousser les manches, mettre les bouchées doubles**.\nEndurance : **travailler d’arrache-pied, se donner à fond, ne pas compter ses heures**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['se retrousser les manches', b('to roll up one’s sleeves', 'relever ses manches'), b('to get ready for hard work', 'se mettre au travail avec énergie')],
              ['travailler d’arrache-pied', b('without lifting one’s foot', 'sans lâcher prise'), b('to work tirelessly, relentlessly', 'travailler avec acharnement')],
              ['se donner à fond', b('to give oneself to the bottom', 's’investir totalement'), b('to give it one’s all', 'fournir son effort maximal')],
              ['mettre les bouchées doubles', b('to take double mouthfuls', 'manger par grosses bouchées'), b('to work twice as hard / fast', 'accélérer et redoubler d’efforts')],
              ['ne pas compter ses heures', b('not to count one’s hours', 'ne pas regarder la montre'), b('to work long hours willingly', 'travailler longtemps sans hésiter')],
            ],
          },
          ex: [
            ['Le délai est court : il va falloir se retrousser les manches dès lundi matin.', 'The deadline is tight: we will have to roll up our sleeves first thing Monday morning.'],
            ['L’équipe a mis les bouchées doubles pour livrer le prototype à temps.', 'The team worked twice as hard to deliver the prototype on time.'],
            ['Cette artisane ne compte pas ses heures quand elle prépare une exposition.', 'That craftswoman puts in endless hours whenever she prepares an exhibition.'],
          ],
        },
      ),
      tip(
        b('Reflexive agreement: se retrousser les manches vs se donner à fond', 'Accord pronominal : se retrousser les manches ou se donner à fond'),
        b(
          'In the passé composé, watch the difference between these two reflexive verbs! In **Elle s’est retroussé les manches**, *les manches* is the direct object placed after the verb, so *retroussé* stays invariable. In **Elle s’est donnée à fond**, *se* refers directly to *elle*, so **donnée** agrees! Also spell **d’arrache-pied** with a hyphen and a silent final **d**.\n\nInvariable: **Ils se sont retroussé les manches**.\nAgrees: **Elles se sont données à fond**.',
          'Au passé composé, comparez ces deux verbes pronominaux ! Dans **Elle s’est retroussé les manches**, le COD *les manches* est placé après le verbe : *retroussé* reste donc invariable. Dans **Elle s’est donnée à fond**, *se* est COD placé avant : **donnée** s’accorde ! Écrivez aussi **d’arrache-pied** avec un trait d’union et un **d** muet final.\n\nInvariable : **Ils se sont retroussé les manches**.\nAccordé : **Elles se sont données à fond**.',
        ),
      ),
      flash(b('Effort & perseverance', 'Travail et persévérance'), [
        ['se retrousser les manches', b('to roll up one’s sleeves', 'se préparer à travailler dur')],
        ['travailler d’arrache-pied', b('to work tirelessly', 'travailler avec acharnement')],
        ['se donner à fond', b('to give it one’s all', 's’investir totalement')],
        ['mettre les bouchées doubles', b('to double one’s efforts', 'travailler deux fois plus vite')],
        ['ne pas compter ses heures', b('to put in long hours', 'travailler sans regarder la montre')],
      ]),
      mc(
        P.best,
        ['mettre les bouchées doubles', 'tourner la page', 'tomber des nues', 'avoir le cafard'],
        {
          fr: 'Le client avance la date de livraison à vendredi : nous devons ___ dès aujourd’hui.',
          explain: b('Mettre les bouchées doubles means stepping up the pace to meet a tight deadline.', 'Mettre les bouchées doubles signifie accélérer le rythme pour finir à temps.'),
        },
      ),
      mc(
        P.form,
        ['se sont retroussé', 'se sont retroussées', 'ont retroussé', 'se sont retroussés'],
        {
          fr: 'Pour rénover la librairie avant septembre, les deux associées ___ les manches.',
          explain: b('Because les manches follows the verb as direct object, retroussé stays invariable.', 'Comme les manches est placé après le verbe, retroussé reste invariable.'),
        },
      ),
      pairs(P.match, [
        ['se retrousser les manches', b('to roll up one’s sleeves', 'se mettre résolument au travail')],
        ['travailler d’arrache-pied', b('to work flat out', 'travailler sans relâche')],
        ['se donner à fond', b('to give it one’s all', 'fournir un effort total')],
        ['mettre les bouchées doubles', b('to double one’s efforts', 'redoubler d’efforts pour aller vite')],
        ['ne pas compter ses heures', b('to work long hours', 'ne pas limiter son temps de travail')],
      ]),
      gap(
        P.complete,
        'Pour réussir son concours, Nadia a travaillé ___ pendant six mois : elle s’est donnée à ___ et n’a pas ___ ses heures.',
        [['d’arrache-pied'], ['fond'], ['compté']],
        {
          choices: [
            ['d’arrache-pied', 'à merveille', 'en quatre'],
            ['fond', 'bout', 'pied'],
            ['compté', 'mis', 'donné'],
          ],
          explain: b('Combine travailler d’arrache-pied, se donner à fond, and ne pas compter ses heures.', 'On retrouve travailler d’arrache-pied, se donner à fond et ne pas compter ses heures.'),
        },
      ),
      hear(
        'Le chantier avait pris du retard à cause de la pluie, mais toute l’équipe s’est retroussé les manches et a mis les bouchées doubles cette semaine.',
        b('How did the team handle the weather delay?', 'Comment l’équipe a-t-elle réagi au retard dû à la pluie ?'),
        [
          b('They got right to work and doubled their pace to catch up.', 'Ils se sont mobilisés et ont accéléré le rythme pour rattraper le temps.'),
          b('They decided to postpone the project until next spring.', 'Ils ont décidé de reporter les travaux au printemps suivant.'),
          b('They complained to the client about working overtime.', 'Ils se sont plaints des heures supplémentaires auprès du client.'),
        ],
      ),
      dict('Il travaille d’arrache-pied et ne compte jamais ses heures avant une ouverture.'),
      say('On se retrousse les manches et on met les bouchées doubles pour finir avant ce soir !', 'Let’s roll up our sleeves and double our efforts to finish before tonight!'),
    ],
    [
      b('se retrousser les manches = get down to hard work (past participle stays retroussé before les manches).', 'se retrousser les manches = se mettre au travail (participe invariable devant les manches).'),
      b('travailler d’arrache-pied, se donner à fond and ne pas compter ses heures describe intense dedication.', 'travailler d’arrache-pied, se donner à fond et ne pas compter ses heures expriment l’investissement total.'),
      b('mettre les bouchées doubles = speed up and double one’s output.', 'mettre les bouchées doubles = redoubler d’efforts pour avancer plus vite.'),
    ],
    [
      ['se retrousser les manches', b('to roll up one’s sleeves', 'se mettre au travail sérieusement')],
      ['travailler d’arrache-pied', b('to work tirelessly', 'travailler avec acharnement')],
      ['se donner à fond', b('to give it one’s all', 'donner le maximum de soi-même')],
      ['mettre les bouchées doubles', b('to double one’s efforts', 'accélérer la cadence')],
      ['ne pas compter ses heures', b('to put in long hours', 'travailler sans compter le temps')],
    ],
  ),

  lesson(
    C,
    2,
    ['skill-and-strategy', 'competences-et-strategie'],
    b('Skill, versatility & smart strategy', 'Maîtrise, polyvalence et stratégie'),
    b('Talk about multi-skilled profiles, smart shortcuts, combining business with pleasure and staying on course.', 'Parler de polyvalence, d’efficacité, de plaisir au travail et de cap maintenu.'),
    [
      b('Highlight skills and expertise with avoir plusieurs cordes à son arc and connaître son affaire sur le bout des doigts', 'Valoriser compétences multiples et maîtrise'),
      b('Describe smart efficiency with faire d’une pierre deux coups and joindre l’utile à l’agréable', 'Exprimer l’efficacité et l’équilibre'),
      b('Express steady direction with garder le cap', 'Maintenir la direction avec garder le cap'),
    ],
    13,
    [
      card(
        b('Working smart, not only hard', 'Savoir-faire et sens stratégique'),
        b(
          'Effort works best with strategy and craft. Describe versatile talent with **avoir plusieurs cordes à son arc** and deep expertise with **connaître son affaire sur le bout des doigts**. Efficiency and enjoyment appear in **faire d’une pierre deux coups** and **joindre l’utile à l’agréable**, while steady focus is **garder le cap**.\n\nSkill & mastery: **avoir plusieurs cordes à son arc, connaître son affaire sur le bout des doigts**.\nStrategy & focus: **faire d’une pierre deux coups, joindre l’utile à l’agréable, garder le cap**.',
          'L’effort gagne à s’appuyer sur la méthode. On salue la polyvalence avec **avoir plusieurs cordes à son arc** et la maîtrise experte avec **connaître son affaire sur le bout des doigts**. L’efficacité se dit **faire d’une pierre deux coups** ou **joindre l’utile à l’agréable**, et la constance **garder le cap**.\n\nSavoir-faire : **avoir plusieurs cordes à son arc, connaître son affaire sur le bout des doigts**.\nStratégie et cap : **faire d’une pierre deux coups, joindre l’utile à l’agréable, garder le cap**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['avoir plusieurs cordes à son arc', b('several strings to one’s bow', 'plusieurs cordes prêtes'), b('to have multiple skills or options', 'posséder plusieurs compétences utiles')],
              ['faire d’une pierre deux coups', b('two hits with one stone', 'une pierre, deux cibles'), b('to kill two birds with one stone', 'atteindre deux objectifs en une action')],
              ['joindre l’utile à l’agréable', b('join useful and pleasant', 'unir devoir et plaisir'), b('to combine business with pleasure', 'allier travail et moment plaisant')],
              ['connaître son affaire sur le bout des doigts', b('know at one’s fingertips', 'maîtriser parfaitement'), b('to know one’s stuff inside out', 'maîtriser un domaine à la perfection')],
              ['garder le cap', b('to keep the ship’s heading', 'maintenir la direction'), b('to stay the course, stay focused', 'rester fidèle à son objectif')],
            ],
          },
          ex: [
            ['Entre la menuiserie, le dessin technique et la gestion, elle a plusieurs cordes à son arc.', 'Between carpentry, drafting and management, she has several strings to her bow.'],
            ['En déjeunant avec notre cliente dans ce bistrot, nous avons joint l’utile à l’agréable.', 'By having lunch with our client at this bistro, we combined business with pleasure.'],
            ['Malgré les critiques, le chef de projet garde le cap sur ses priorités.', 'Despite the criticism, the project lead stays focused on his priorities.'],
          ],
        },
      ),
      trap(
        b('Do not swap the prepositions or numbers!', 'Attention aux prépositions et aux chiffres figés !'),
        b(
          'Idioms resist translation tweaks: say **une pierre deux coups** (one stone, two hits—never *deux oiseaux*), **à son arc** (never *sur son arc*), and **sur le bout des doigts** (plural *doigts*, never *doigt*). Note also **connaître son affaire** can swap *affaire* for *métier* or *dossier* (*Il connaît son dossier sur le bout des doigts*).\n\nExact forms: **d’une pierre deux coups · à son arc · sur le bout des doigts**.',
          'Ne calquez pas les images de l’anglais : dites **d’une pierre deux coups** (jamais *deux oiseaux*), **à son arc** (jamais *sur son arc*) et **sur le bout des doigts** (toujours au pluriel). Dans **connaître son affaire sur le bout des doigts**, on remplace souvent *affaire* par *métier* ou *sujet* (*Elle connaît son sujet sur le bout des doigts*).\n\nFormes exactes : **d’une pierre deux coups · à son arc · sur le bout des doigts**.',
        ),
      ),
      flash(b('Skill & strategy', 'Compétences et stratégie'), [
        ['avoir plusieurs cordes à son arc', b('to have several strings to one’s bow', 'maîtriser plusieurs savoir-faire')],
        ['faire d’une pierre deux coups', b('to kill two birds with one stone', 'réussir deux choses en une action')],
        ['joindre l’utile à l’agréable', b('to combine business with pleasure', 'allier obligation et plaisir')],
        ['connaître son affaire sur le bout des doigts', b('to know one’s stuff inside out', 'maîtriser son domaine parfaitement')],
        ['garder le cap', b('to stay the course', 'maintenir son cap malgré les obstacles')],
      ]),
      mc(
        P.best,
        ['faire d’une pierre deux coups', 'garder le cap', 'compter ses heures', 'briser la glace'],
        {
          fr: 'Je vais à Lyon pour une réunion et j’en profite pour voir ma sœur : je vais ___.',
          explain: b('Accomplishing two goals on one trip is faire d’une pierre deux coups.', 'Régler deux choses en un seul déplacement se dit faire d’une pierre deux coups.'),
        },
      ),
      mc(
        P.meaning,
        [
          b('She knows every technical detail of her craft perfectly.', 'Elle maîtrise parfaitement son domaine professionnel.'),
          b('She prefers counting manually without a computer.', 'Elle préfère tout calculer à la main.'),
          b('She is looking for an assistant to delegate her work.', 'Elle cherche un assistant pour déléguer son travail.'),
          b('She recently changed careers.', 'Elle vient tout juste de changer de métier.'),
        ],
        {
          fr: 'Ne t’inquiète pas pour l’atelier : Sophie connaît son affaire sur le bout des doigts.',
          explain: b('Connaître son affaire sur le bout des doigts means complete mastery.', 'Connaître son affaire sur le bout des doigts désigne une maîtrise totale.'),
        },
      ),
      sort(
        b('Sort each expression: skill & expertise or strategy & direction.', 'Classez : compétence et maîtrise ou stratégie et direction.'),
        [
          b('Skill & deep mastery', 'Compétence et maîtrise'),
          b('Smart strategy & direction', 'Stratégie et cap'),
        ],
        [
          ['avoir plusieurs cordes à son arc', 0],
          ['faire d’une pierre deux coups', 1],
          ['connaître son affaire sur le bout des doigts', 0],
          ['joindre l’utile à l’agréable', 1],
          ['garder le cap', 1],
          ['maîtriser un dossier de A à Z', 0],
        ],
      ),
      gap(
        P.complete,
        'En organisant le séminaire dans les Alpes, nous avons joint l’___ à l’agréable. De plus, comme notre formatrice connaît son ___ sur le bout des doigts, le groupe a su garder le ___.',
        [['utile'], ['affaire'], ['cap']],
        {
          choices: [
            ['utile', 'ancien', 'urgent'],
            ['affaire', 'arc', 'cœur'],
            ['cap', 'coup', 'bout'],
          ],
          explain: b('Fixed wording: joindre l’utile à l’agréable, connaître son affaire sur le bout des doigts, garder le cap.', 'Tournures figées : joindre l’utile à l’agréable, connaître son affaire sur le bout des doigts et garder le cap.'),
        },
      ),
      ord(
        P.order,
        'Cet artisan a vraiment plusieurs cordes à son arc.',
        {
          tr: 'This craftsperson really has several strings to their bow.',
          extra: ['doigts', 'sur'],
          explain: b('Verb avoir + vraiment + plusieurs cordes à son arc.', 'La locution s’emploie avec la préposition à : plusieurs cordes à son arc.'),
        },
      ),
      hear(
        'En allant livrer ce meuble à Nantes, j’ai fait d’une pierre deux coups : j’ai visité un fournisseur et j’ai joint l’utile à l’agréable en dînant près du port.',
        b('Why was the trip to Nantes so efficient?', 'Pourquoi ce déplacement à Nantes était-il si réussi ?'),
        [
          b('He combined a delivery, a supplier visit and a pleasant dinner in one trip.', 'Il a accompli deux objectifs professionnels et profité d’un bon dîner.'),
          b('He had to cancel the delivery because the supplier moved.', 'Il a dû annuler sa livraison chez le fournisseur.'),
          b('He refused to mix work meetings with dining out.', 'Il refuse toujours de mélanger travail et repas.'),
        ],
        { voice: 'm' },
      ),
      say('Elle connaît son métier sur le bout des doigts et garde toujours le cap.', 'She knows her trade inside out and always stays the course.'),
    ],
    [
      b('avoir plusieurs cordes à son arc = have diverse skills; connaître son affaire sur le bout des doigts = master one’s craft.', 'avoir plusieurs cordes à son arc = être polyvalent ; sur le bout des doigts = maîtriser à fond.'),
      b('faire d’une pierre deux coups = achieve two goals at once; joindre l’utile à l’agréable = mix work and pleasure.', 'faire d’une pierre deux coups = double objectif ; joindre l’utile à l’agréable = allier devoir et plaisir.'),
      b('garder le cap = keep a steady direction despite turbulence.', 'garder le cap = rester fidèle à son objectif.'),
    ],
    [
      ['avoir plusieurs cordes à son arc', b('to have several strings to one’s bow', 'disposer de compétences variées')],
      ['faire d’une pierre deux coups', b('to kill two birds with one stone', 'atteindre deux buts à la fois')],
      ['joindre l’utile à l’agréable', b('to combine business with pleasure', 'unir travail et plaisir')],
      ['connaître son affaire sur le bout des doigts', b('to know one’s stuff inside out', 'maîtriser son domaine à la perfection')],
      ['garder le cap', b('to stay the course', 'maintenir le bon cap')],
    ],
  ),

  lesson(
    C,
    3,
    ['breakthroughs-and-recognition', 'reussite-et-reconnaissance'],
    b('Milestones, payoffs & recognition', 'Caps franchis, résultats et renommée'),
    b('Celebrate turning points, hard-earned rewards and growing recognition in French.', 'Célébrer les étapes décisives, les efforts récompensés et la reconnaissance acquise.'),
    [
      b('Talk about turning points with passer un cap and toucher au but', 'Évoquer un palier décisif et l’approche du succès'),
      b('Express payoff and triumph with porter ses fruits and décrocher la timbale', 'Exprimer la réussite et les efforts récompensés'),
      b('Describe growing reputation with se faire un nom', 'Décrire la notoriété avec se faire un nom'),
    ],
    13,
    [
      card(
        b('From persistence to breakthrough', 'De l’étape décisive à la réussite'),
        b(
          'After long weeks of effort, results appear: your work **porte ses fruits** (pays off), you **passez un cap** (cross a milestone), you **touchez au but** (are nearly at the finish line), you **décrochez la timbale** (land the big prize), and little by little you **vous faites un nom** (build a reputation).\n\nProgress & milestone: **passer un cap, toucher au but, porter ses fruits**.\nBig win & reputation: **décrocher la timbale, se faire un nom**.',
          'Après des mois d’efforts, les résultats arrivent : le travail **porte ses fruits**, l’équipe **passe un cap**, on **touche au but**, on **décroche la timbale** et on finit par **se faire un nom**.\n\nProgrès et palier : **passer un cap, toucher au but, porter ses fruits**.\nSuccès et notoriété : **décrocher la timbale, se faire un nom**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['décrocher la timbale', b('to unhook the silver cup', 'attraper la timbale en haut du mât'), b('to hit the jackpot, win the top prize', 'remporter un grand succès, un gros contrat')],
              ['passer un cap', b('to round a cape (sailing)', 'doubler un cap difficile'), b('to reach a milestone, turn a corner', 'franchir une étape décisive')],
              ['toucher au but', b('to be touching the goal', 'arriver tout près de la cible'), b('to be nearly there, almost succeed', 'être sur le point d’aboutir')],
              ['porter ses fruits', b('to bear its fruit', 'donner de bons fruits'), b('to pay off, yield results', 'produire les résultats attendus')],
              ['se faire un nom', b('to make oneself a name', 'devenir reconnu par son nom'), b('to make a name for oneself', 'acquérir de la notoriété')],
            ],
          },
          ex: [
            ['Après trois ans d’entraînement quotidien, sa patience a enfin porté ses fruits.', 'After three years of daily training, her patience finally paid off.'],
            ['Avec cette commande nationale, notre jeune atelier a décroché la timbale.', 'With this nationwide order, our young workshop hit the jackpot.'],
            ['Encore deux semaines de vérifications et nous touchons au but !', 'Two more weeks of checks and we are nearly at the finish line!'],
          ],
        },
      ),
      culture(
        b('A greasy pole, a silver cup and a sea cape', 'Un mât de cocagne, une timbale et un cap marin'),
        b(
          'At traditional French village fairs, a silver cup (**la timbale**) was tied to the top of a tall, slippery pole (*le mât de cocagne*): whoever climbed up to grab it **décrochait la timbale**! Meanwhile, **passer un cap** echoes sailing around a stormy headland, and remember that **toucher au but** means *almost* reaching the goal (not yet fully finished!).\n\nClose but not quite done: **Nous touchons au but !** (nearly finished)\nRewarding outcome: **Nos efforts portent leurs fruits**.',
          'Dans les fêtes de village d’autrefois, on accrochait une coupe en argent (**la timbale**) tout en haut d’un mât savonné : le gagnant **décrochait la timbale** ! Quant à **passer un cap**, l’image vient des marins doublant une pointe rocheuse. Retenez aussi que **toucher au but** signifie être *tout près* d’aboutir.\n\nPresque terminé : **Nous touchons au but !**\nEfforts récompensés : **Nos efforts portent leurs fruits**.',
        ),
      ),
      mc(
        P.best,
        ['porté ses fruits', 'passé l’éponge', 'posé un lapin', 'cherché midi à quatorze heures'],
        {
          fr: 'Tu as révisé ton oral tous les soirs et tu as obtenu 18/20 : ton travail sérieux a ___ !',
          explain: b('Hard work paying off is porter ses fruits.', 'Un travail sérieux qui donne de bons résultats porte ses fruits.'),
        },
      ),
      pairs(P.match, [
        ['décrocher la timbale', b('to hit the jackpot', 'remporter un beau succès')],
        ['passer un cap', b('to reach a milestone', 'franchir un palier décisif')],
        ['toucher au but', b('to be nearly at the goal', 'être tout près de réussir')],
        ['porter ses fruits', b('to pay off', 'donner des résultats concrets')],
        ['se faire un nom', b('to make a name for oneself', 'devenir reconnu dans son milieu')],
      ]),
      hear(
        'Après avoir passé un cap difficile l’an dernier, cette ébéniste vient de décrocher la timbale au salon du design : elle commence vraiment à se faire un nom.',
        b('What has this furniture maker just achieved?', 'Que vient de réussir cette ébéniste ?'),
        [
          b('She got past a tough stage, won a major breakthrough and is building a reputation.', 'Elle a franchi un cap, remporté un grand succès et gagne en notoriété.'),
          b('She decided to close her workshop after a slow year.', 'Elle a choisi de fermer son atelier après une année difficile.'),
          b('She is still struggling to sell her very first piece.', 'Elle peine encore à vendre sa toute première création.'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Good news in the workshop', 'Bonne nouvelle à l’atelier'),
        b('Marc visits his friend Zoé in her woodworking studio as a major project wraps up.', 'Marc rend visite à son amie Zoé dans son atelier de menuiserie.'),
        [['Marc', 'm'], ['Zoé', 'f']],
        [
          [0, 'Alors Zoé, ce chantier pour la bibliothèque municipale, vous arrivez au bout ?', 'So Zoé, this job for the city library, are you getting to the end?'],
          [1, {
            options: [
              'Oui, il reste juste les finitions : on touche vraiment au but !',
              'Oui, on vient à peine de commencer à poser un lapin.',
              'Non, tout le monde en a ras le bol de se faire un nom.',
            ],
            explain: b('On touche au but means being right near completion.', 'On touche au but signifie qu’on est tout près de terminer.'),
          }],
          [0, 'Franchement, vous avez travaillé d’arrache-pied tout l’hiver, ça finit par porter ses fruits.', 'Honestly, you worked flat out all winter, it is really paying off.'],
          [1, {
            options: [
              'Merci ! Ce projet nous fait passer un cap, et on commence même à se faire un nom dans la région.',
              'Merci ! On va monter sur nos grands chevaux dès demain.',
              'Non, nous préférons broyer du noir dans l’atelier.',
            ],
            explain: b('Passer un cap (cross a milestone) and se faire un nom (build a reputation) fit naturally.', 'Passer un cap et se faire un nom résument parfaitement cette progression.'),
          }],
          [0, 'Si vous décrochez le prochain contrat régional, vous aurez vraiment décroché la timbale !', 'If you land the next regional contract, you’ll really have hit the jackpot!'],
        ],
      ),
      dict('Nos longs mois de préparation ont porté leurs fruits et nous touchons au but.'),
      write(
        b('From hard work to breakthrough', 'De l’effort à la réussite'),
        b('Write 45–85 words about a personal, academic or professional goal you (or someone you admire) worked hard to achieve. Use at least three idioms from this course (for instance se retrousser les manches, travailler d’arrache-pied, garder le cap, passer un cap, porter ses fruits or se faire un nom).', 'Racontez en 45 à 85 mots un objectif personnel, scolaire ou professionnel atteint grâce à la persévérance. Employez au moins trois expressions de ce cours (par exemple se retrousser les manches, travailler d’arrache-pied, garder le cap, passer un cap, porter ses fruits ou se faire un nom).'),
        45,
        85,
        [
          b('Concrete context (project, study, craft or sport)', 'Contexte concret (projet, études, métier ou sport)'),
          b('At least three work/success idioms used smoothly', 'Au moins trois expressions employées avec naturel'),
          b('Clear link between steady effort and final outcome', 'Lien clair entre l’effort soutenu et le résultat final'),
        ],
        'Quand mon frère a lancé sa petite boulangerie, il s’est retroussé les manches et a travaillé d’arrache-pied pendant toute la première année. Même les semaines calmes, il a gardé le cap sur la qualité du pain. Peu à peu, sa patience a porté ses fruits : la boutique a passé un cap et il s’est fait un nom dans tout le quartier.',
        { phrases: ['… s’est retroussé les manches…', '… a gardé le cap…', '… a porté ses fruits…', '… s’est fait un nom'] },
      ),
    ],
    [
      b('passer un cap = turn a corner / cross a milestone; toucher au but = be almost at the goal.', 'passer un cap = franchir une étape décisive ; toucher au but = être tout près du résultat.'),
      b('porter ses fruits = pay off; décrocher la timbale = score a major triumph.', 'porter ses fruits = donner des résultats ; décrocher la timbale = remporter un grand succès.'),
      b('se faire un nom = establish a reputation in one’s field.', 'se faire un nom = gagner en notoriété.'),
    ],
    [
      ['décrocher la timbale', b('to hit the jackpot, win big', 'remporter un succès majeur')],
      ['passer un cap', b('to reach a milestone', 'franchir un palier décisif')],
      ['toucher au but', b('to be nearly at the goal', 'être sur le point d’aboutir')],
      ['porter ses fruits', b('to bear fruit, pay off', 'produire les résultats espérés')],
      ['se faire un nom', b('to make a name for oneself', 'acquérir une vraie réputation')],
    ],
  ),
];

export default lessons;
