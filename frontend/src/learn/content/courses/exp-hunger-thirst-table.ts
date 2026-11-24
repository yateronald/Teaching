import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Go far beyond “j’ai faim”. Learn how French speakers really talk about hunger from a mild snack attack to wolf-sized starvation, quench their thirst and raise a glass, and compliment a meal at the table.',
    'Allez bien au-delà de « j’ai faim ». Apprenez comment les francophones parlent d’un petit creux ou d’une faim de loup, étanchent leur soif et trinquent entre amis, ou profitent d’un bon repas à table.',
  ),
  outcomes: [
    b('Describe every level of hunger and fullness without faux amis', 'Décrire tous les degrés de la faim et de la satiété sans faux amis'),
    b('Order drinks, quench your thirst, and propose a toast naturally', 'Parler de soif, boire un verre et trinquer avec naturel'),
    b('Use warm table expressions for quick bites, compliments, and second helpings', 'Utiliser les expressions de la table pour manger vite, complimenter ou se resservir'),
  ],
};

const C = 'exp-hunger-thirst-table';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['hunger-levels', 'degres-de-faim'],
    b('From peckish to starving', 'Du petit creux à la faim de loup'),
    b('Describe mild hunger, extreme hunger, mouth-watering dishes, and feeling full.', 'Exprimer un petit creux, une faim énorme, l’envie devant un plat et la satiété.'),
    [
      b('Grade hunger with avoir un petit creux, avoir une faim de loup, and mourir de faim', 'Nuancer la faim avec avoir un petit creux, avoir une faim de loup et mourir de faim'),
      b('Show anticipation with avoir l’eau à la bouche', 'Exprimer l’envie gourmande avec avoir l’eau à la bouche'),
      b('Say you are full correctly with être calé instead of je suis plein', 'Dire qu’on n’a plus faim avec être calé sans dire je suis plein'),
    ],
    13,
    [
      card(
        b('Every degree of appetite', 'Tous les degrés de l’appétit'),
        b(
          'Between a light snack and a feast, French paints vivid pictures: **avoir un petit creux** (a slight hollow), **avoir une faim de loup** (wolf’s hunger), **mourir de faim** (starving), **avoir l’eau à la bouche** (mouth watering), and **être calé** (completely full).',
          'Entre la petite envie et le grand appétit, le français utilise des images vivantes : **avoir un petit creux**, **avoir une faim de loup**, **mourir de faim**, **avoir l’eau à la bouche** et **être calé**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['avoir une faim de loup', b('to have a wolf’s hunger', 'avoir la faim d’un loup'), b('to be starving / ravenous', 'avoir extrêmement faim')],
              ['avoir un petit creux', b('to have a little hollow', 'sentir un petit vide'), b('to feel a bit peckish', 'avoir légèrement faim')],
              ['mourir de faim', b('to die of hunger', 'périr de faim'), b('to be starving (exaggeration)', 'avoir très faim')],
              ['être calé', b('to be wedged / propped', 'être bien rempli'), b('to be completely full', 'ne plus avoir faim du tout')],
              ['avoir l’eau à la bouche', b('to have water in the mouth', 'saliver d’envie'), b('to have one’s mouth watering', 'avoir très envie de goûter')],
            ],
          },
          ex: [
            ['Il est seize heures, j’ai un petit creux : je prends un biscuit.', 'It is four p.m., I feel a bit peckish: I am having a biscuit.'],
            ['Ce parfum de pain chaud me donne l’eau à la bouche !', 'This smell of warm bread makes my mouth water!'],
            ['Merci, je ne peux plus rien manger, je suis vraiment calé.', 'Thanks, I cannot eat anything else, I am really full.'],
          ],
        },
      ),
      tip(
        b('Never say “Je suis plein” after a meal!', 'Ne dites jamais « Je suis plein » après un repas !'),
        b(
          'Translating “I’m full” literally as *Je suis plein(e)* is a classic faux ami: in French it refers to animals expecting babies, or someone drunk. Say **Je suis calé(e)** or **J’ai très bien mangé, merci !**',
          'Traduire « I’m full » par *Je suis plein(e)* est un piège classique : en français, cela se dit d’un animal qui attend des petits ou d’une personne ivre. Dites **Je suis calé(e)** ou **J’ai très bien mangé, merci !**',
        ),
      ),
      flash(
        b('Hunger levels', 'Degrés de faim'),
        [
          ['avoir une faim de loup', b('to be starving / ravenous', 'avoir extrêmement faim')],
          ['avoir un petit creux', b('to feel slightly peckish', 'avoir un peu faim')],
          ['mourir de faim', b('to be starving', 'avoir très faim')],
          ['être calé', b('to be completely full', 'ne plus avoir faim du tout')],
          ['avoir l’eau à la bouche', b('to have one’s mouth watering', 'saliver devant un bon plat')],
        ],
      ),
      mc(
        b('After hiking for four hours without lunch, what fits best?', 'Après quatre heures de randonnée sans déjeuner, quelle phrase convient ?'),
        [
          'J’ai une faim de loup !',
          'J’ai un petit creux.',
          'Je suis déjà calé.',
          'Je suis plein de pain.',
        ],
        {
          explain: b('avoir une faim de loup expresses huge, intense hunger.', 'avoir une faim de loup exprime une très grande faim.'),
        },
      ),
      mc(
        P.best,
        [
          'l’eau à la bouche',
          'un petit creux plein',
          'une faim calée',
          'la bouche de loup',
        ],
        {
          fr: 'Quand je passe devant cette pâtisserie, j’ai toujours ___.',
          explain: b('Seeing or smelling delicious food gives you l’eau à la bouche.', 'Voir ou sentir de bons plats donne l’eau à la bouche.'),
        },
      ),
      pairs(
        P.match,
        [
          ['avoir une faim de loup', b('to be starving / ravenous', 'avoir extrêmement faim')],
          ['avoir un petit creux', b('to feel slightly peckish', 'avoir un peu faim')],
          ['mourir de faim', b('to be starving', 'avoir très faim')],
          ['être calé', b('to be completely full', 'ne plus avoir faim du tout')],
          ['avoir l’eau à la bouche', b('to have one’s mouth watering', 'saliver devant un bon plat')],
        ],
      ),
      gap(
        P.complete,
        'À seize heures, j’ai ___ : je mange juste une pomme. Après le dîner, je suis complètement ___ !',
        [['un petit creux'], ['calé']],
        {
          choices: [
            ['un petit creux', 'une faim de loup', 'l’eau à la bouche'],
            ['calé', 'plein', 'creux'],
          ],
          explain: b('An apple satisfies un petit creux; after dinner you are calé.', 'Une pomme suffit pour un petit creux ; après dîner on est calé.'),
        },
      ),
      hear(
        'Ce gratin sent tellement bon que j’ai déjà l’eau à la bouche ! Vite, passons à table, je meurs de faim.',
        b('How does the speaker feel right now?', 'Comment la personne se sent-elle en ce moment ?'),
        [
          b('Very hungry and tempted by the smell', 'Elle meurt de faim et a l’eau à la bouche'),
          b('Already full and ready to leave', 'Elle est déjà calée et veut partir'),
          b('Only slightly peckish for fruit', 'Elle a juste un petit creux pour un fruit'),
          b('Not interested in eating tonight', 'Elle n’a pas envie de dîner ce soir'),
        ],
      ),
      dict('Après cette longue marche, j’ai vraiment une faim de loup.', {
        hint: b('Remember the feminine article une before faim de loup.', 'Pensez à l’article féminin une devant faim de loup.'),
      }),
      say('Merci pour le repas, je suis complètement calé !', 'Thank you for the meal, I am completely full!'),
    ],
    [
      b('avoir un petit creux (peckish) vs avoir une faim de loup / mourir de faim (starving).', 'avoir un petit creux (petite faim) vs avoir une faim de loup / mourir de faim (grande faim).'),
      b('avoir l’eau à la bouche = your mouth is watering.', 'avoir l’eau à la bouche = saliver d’envie devant un plat.'),
      b('Say être calé(e) for being full—never je suis plein(e).', 'Dites être calé(e) quand vous n’avez plus faim, jamais je suis plein(e).'),
    ],
    [
      ['avoir une faim de loup', b('to be starving / ravenous', 'avoir extrêmement faim')],
      ['avoir un petit creux', b('to feel slightly peckish', 'avoir un peu faim')],
      ['mourir de faim', b('to be starving', 'avoir très faim')],
      ['être calé', b('to be completely full', 'ne plus avoir faim du tout')],
      ['avoir l’eau à la bouche', b('to have one’s mouth watering', 'saliver devant un bon plat')],
    ],
  ),

  lesson(
    C,
    2,
    ['thirst-and-drinking', 'soif-et-boissons'],
    b('Thirst, toasts & grabbing a drink', 'Soif, toast et verres entre amis'),
    b('Describe intense thirst, quench it, grab a drink, and raise your glass in French.', 'Dire qu’on a très soif, étancher sa soif, boire un coup et trinquer.'),
    [
      b('Use avoir une soif terrible and étancher sa soif accurately', 'Employer avoir une soif terrible et étancher sa soif correctement'),
      b('Suggest drinks casually with boire un coup or neutrally with prendre un verre', 'Proposer de boire un verre avec boire un coup ou prendre un verre'),
      b('Raise a toast using trinquer à + person or occasion', 'Porter un toast avec trinquer à + personne ou événement'),
    ],
    13,
    [
      card(
        b('Drinks, thirst & toasting', 'Soif, boissons et toast'),
        b(
          'Use **avoir une soif terrible** when plain *avoir soif* is too mild, **étancher sa soif** to quench it, **trinquer à** to clink glasses in a toast, **boire un coup** (casual) or **prendre un verre** (neutral) to grab a drink.',
          'Utilisez **avoir une soif terrible** quand *avoir soif* ne suffit pas, **étancher sa soif** pour se désaltérer, **trinquer à** pour lever son verre, et **boire un coup** (familier) ou **prendre un verre** (courant) pour partager une boisson.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['avoir une soif terrible', b('to have a terrible thirst', 'ressentir une soif intense'), b('to be terribly thirsty / parched', 'avoir extrêmement soif')],
              ['étancher sa soif', b('to quench one’s thirst', 'faire disparaître sa soif'), b('to quench one’s thirst', 'calmer sa soif en buvant')],
              ['trinquer à', b('to clink glasses to', 'choquer les verres pour'), b('to toast to', 'lever son verre en l’honneur de')],
              ['boire un coup', b('to drink a blow', 'avaler une boisson rapidement'), b('to have a quick drink (casual)', 'boire quelque chose ensemble')],
              ['prendre un verre', b('to take a glass', 'commander une boisson'), b('to go for a drink / have a drink', 'partager un moment autour d’un verre')],
            ],
          },
          ex: [
            ['Il fait trente-deux degrés : j’ai une soif terrible !', 'It is thirty-two degrees: I am terribly thirsty!'],
            ['Rien de tel qu’un grand verre d’eau fraîche pour étancher sa soif.', 'Nothing beats a tall glass of cold water to quench your thirst.'],
            ['On trinquera à ton nouveau travail ce soir !', 'We will toast to your new job tonight!'],
          ],
        },
      ),
      trap(
        b('Notice une in une soif terrible—and match sa!', 'Attention à une dans une soif terrible et accordez sa !'),
        b(
          'Bare **avoir soif** has no article, but adding an adjective brings **une** back: **avoir une soif terrible** (just like *avoir une faim de loup*). Also match the possessive in **étancher sa soif**: *j’étanche **ma** soif, nous étanchons **notre** soif*. And **boire un coup** does not require alcohol—it works for water, juice, or soda too!',
          'Sans adjectif, **avoir soif** n’a pas d’article, mais avec un adjectif **une** revient : **avoir une soif terrible** (comme *avoir une faim de loup*). Accordez aussi **étancher sa soif** : *j’étanche **ma** soif, nous étanchons **notre** soif*. Enfin, **boire un coup** s’utilise aussi bien pour de l’eau ou un jus que pour un apéritif !',
        ),
      ),
      flash(
        b('Thirst & drinks', 'Soif et boissons'),
        [
          ['avoir une soif terrible', b('to be terribly thirsty', 'avoir extrêmement soif')],
          ['étancher sa soif', b('to quench one’s thirst', 'calmer sa soif en buvant')],
          ['trinquer à', b('to toast to', 'lever son verre en l’honneur de')],
          ['boire un coup', b('to have a quick drink', 'partager une boisson (familier)')],
          ['prendre un verre', b('to have / go for a drink', 'se retrouver autour d’une boisson')],
        ],
      ),
      mc(
        P.best,
        [
          'prendre un verre',
          'étancher un verre',
          'calé un coup',
          'trinquer la soif',
        ],
        {
          fr: 'On se retrouve après le travail pour ___ au café du coin ?',
          explain: b('prendre un verre is the everyday invitation to grab a drink together.', 'prendre un verre est l’expression courante pour inviter quelqu’un à boire quelque chose.'),
        },
      ),
      mc(
        P.best,
        [
          'trinquer à',
          'boire de',
          'étancher sur',
          'prendre en',
        ],
        {
          fr: 'Tout le monde lève son verre pour ___ la réussite de Camille.',
          explain: b('Use trinquer à + what or whom you are celebrating.', 'On utilise trinquer à + ce que l’on célèbre.'),
        },
      ),
      sort(
        b('Sort into Hunger & fullness or Thirst & drinks.', 'Classez : faim et satiété ou soif et boissons.'),
        [b('Hunger & fullness', 'Faim et satiété'), b('Thirst & drinks', 'Soif et boissons')],
        [
          ['avoir un petit creux', 0],
          ['étancher sa soif', 1],
          ['mourir de faim', 0],
          ['boire un coup', 1],
          ['être calé', 0],
          ['trinquer à', 1],
        ],
      ),
      gap(
        P.complete,
        'Il fait chaud et j’ai une ___ terrible : je bois de l’eau fraîche pour ___ ma soif.',
        ['soif', 'étancher'],
        {
          tr: 'It is hot and I am terribly thirsty: I drink cold water to quench my thirst.',
          hint: b('First blank: thirst; second blank: infinitive meaning “to quench”.', 'Premier trou : soif ; second trou : infinitif signifiant « calmer la soif ».'),
        },
      ),
      ord(
        P.order,
        'On va prendre un verre en terrasse ce soir ?',
        {
          tr: 'Shall we go for a drink on the patio tonight?',
          extra: ['manger'],
          explain: b('On va + infinitive (prendre un verre) + place (en terrasse) + time (ce soir) + ?.', 'On va + infinitif (prendre un verre) + lieu (en terrasse) + temps (ce soir) + ?.'),
        },
      ),
      hear(
        'Il fait vraiment trop chaud pour marcher encore : arrêtons-nous ici deux minutes pour boire un coup et étancher notre soif.',
        b('Why do they decide to stop walking?', 'Pourquoi décident-ils de s’arrêter ?'),
        [
          b('To have a quick drink and quench their thirst', 'Pour boire un coup et étancher leur soif'),
          b('Because they are already completely full', 'Parce qu’ils sont déjà calés'),
          b('To celebrate someone’s birthday with a toast', 'Pour trinquer à un anniversaire'),
          b('Because they feel cold in the shade', 'Parce qu’ils ont froid à l’ombre'),
        ],
        { voice: 'm' },
      ),
      say('Trinquons à nos vacances et à notre amitié !', 'Let us toast to our holidays and our friendship!'),
    ],
    [
      b('avoir soif (no article) vs avoir une soif terrible (une + adjective).', 'avoir soif (sans article) vs avoir une soif terrible (une + adjectif).'),
      b('étancher sa soif changes sa to ma, ta, notre, etc.', 'étancher sa soif accorde sa : ma, ta, notre, etc.'),
      b('trinquer à = toast to; boire un coup (casual) / prendre un verre (neutral).', 'trinquer à = porter un toast ; boire un coup (familier) / prendre un verre (courant).'),
    ],
    [
      ['avoir une soif terrible', b('to be terribly thirsty', 'avoir extrêmement soif')],
      ['étancher sa soif', b('to quench one’s thirst', 'calmer sa soif en buvant')],
      ['trinquer à', b('to toast to', 'lever son verre en l’honneur de')],
      ['boire un coup', b('to have a quick drink', 'partager une boisson (familier)')],
      ['prendre un verre', b('to have / go for a drink', 'se retrouver autour d’une boisson')],
    ],
  ),

  lesson(
    C,
    3,
    ['at-the-table', 'a-table-et-repas'],
    b('At the table & quick bites', 'À table et sur le pouce'),
    b('Enjoy quick snacks, compliment delicious food, wish everyone bon appétit, and ask for seconds.', 'Manger vite, complimenter un plat, souhaiter bon appétit et reprendre une part.'),
    [
      b('Tell casser la croûte (simple meal) from manger sur le pouce (quick bite)', 'Distinguer casser la croûte et manger sur le pouce'),
      b('Compliment a dish naturally with se régaler and wish bon appétit', 'Complimenter un plat avec se régaler et souhaiter bon appétit'),
      b('Ask politely for a second slice or helping with reprendre une part', 'Demander une deuxième part avec reprendre une part'),
    ],
    13,
    [
      card(
        b('Around the table', 'Autour de la table'),
        b(
          'Use **casser la croûte** for sharing a simple meal or snack, **manger sur le pouce** for eating quickly in a rush, **se régaler** for truly enjoying your meal, **bon appétit** before eating, and **reprendre une part** to take another slice.',
          'Employez **casser la croûte** pour un repas simple ou un casse-croûte, **manger sur le pouce** pour manger vite faute de temps, **se régaler** pour savourer avec plaisir, **bon appétit** avant le repas et **reprendre une part** pour se resservir.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['casser la croûte', b('to break the crust', 'rompre la croûte du pain'), b('to grab a bite / simple meal', 'manger un repas simple ou léger')],
              ['manger sur le pouce', b('to eat on the thumb', 'manger vite avec les doigts'), b('to grab a quick bite on the go', 'manger très vite sans s’attabler')],
              ['se régaler', b('to regale oneself', 'se faire un grand plaisir'), b('to really enjoy a meal', 'trouver un plat délicieux')],
              ['bon appétit', b('good appetite', 'bon appétit'), b('enjoy your meal!', 'souhait avant de manger')],
              ['reprendre une part', b('to take back a slice', 'se servir une nouvelle portion'), b('to have another slice / helping', 'se resservir d’un plat ou gâteau')],
            ],
          },
          ex: [
            ['Je n’ai que vingt minutes : je vais manger sur le pouce.', 'I only have twenty minutes: I am going to grab a quick bite.'],
            ['Cette quiche est délicieuse, on se régale !', 'This quiche is delicious, we are really enjoying it!'],
            ['Il reste du gâteau, tu veux reprendre une part ?', 'There is cake left, do you want another slice?'],
          ],
        },
      ),
      culture(
        b('Bon appétit and praising the cook', 'Bon appétit et compliments à table'),
        b(
          'Before starting any meal—even a quick sandwich with colleagues—French speakers always say **Bon appétit !** (and reply *Merci, bon appétit !*). Later, telling your host **Je me régale !** is the most natural compliment—and asking to **reprendre une part** makes them even happier!',
          'Avant de commencer un repas, même un sandwich entre collègues, on dit toujours **Bon appétit !** (et on répond *Merci, à vous aussi !*). Pendant le repas, dire **Je me régale !** est le plus beau compliment, surtout si l’on demande à **reprendre une part** !',
        ),
      ),
      mc(
        P.best,
        [
          'manger sur le pouce',
          'reprendre une part de loup',
          'étancher sa croûte',
          'trinquer sur le pouce',
        ],
        {
          fr: 'Je n’ai que quinze minutes entre deux réunions : je vais ___.',
          explain: b('Eating quickly because you are short on time is manger sur le pouce.', 'Manger rapidement par manque de temps se dit manger sur le pouce.'),
        },
      ),
      pairs(
        P.match,
        [
          ['casser la croûte', b('to grab a bite / simple meal', 'manger un repas simple')],
          ['manger sur le pouce', b('to grab a quick bite on the go', 'manger très vite sans s’installer')],
          ['se régaler', b('to really enjoy a meal', 'savourer un plat délicieux')],
          ['bon appétit', b('enjoy your meal!', 'formule avant de manger')],
          ['reprendre une part', b('to have another slice / helping', 'se servir une deuxième fois')],
        ],
      ),
      hear(
        'Cette tarte aux pommes maison est incroyable, je me régale ! Est-ce que je peux reprendre une part ?',
        b('What does the speaker want to do?', 'Que souhaite faire la personne ?'),
        [
          b('Have another slice of apple tart', 'Reprendre une part de tarte aux pommes'),
          b('Leave the table to grab a quick bite', 'Manger sur le pouce avant de partir'),
          b('Order a cold drink right away', 'Boire un coup tout de suite'),
          b('Save the tart for tomorrow’s picnic', 'Garder la tarte pour demain'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Dinner at Lucie’s', 'Dîner chez Lucie'),
        b('Lucie brings a warm quiche to the table.', 'Lucie pose une quiche chaude sur la table.'),
        [['Lucie', 'f'], ['Vous', 'm']],
        [
          [0, 'Voici la quiche aux légumes ! Installez-vous, bon appétit !', 'Here is the vegetable quiche! Sit down, enjoy your meal!'],
          [1, {
            options: [
              'Merci, bon appétit à toi aussi ! Ça sent bon, j’ai l’eau à la bouche.',
              'Merci, je suis déjà plein de légumes.',
              'Non, je casse le pouce aujourd’hui.',
            ],
            explain: b('Return bon appétit politely and express excitement with avoir l’eau à la bouche.', 'Répondez poliment bon appétit et exprimez votre envie avec avoir l’eau à la bouche.'),
          }],
          [0, 'Alors, elle te plaît ? Il en reste encore la moitié.', 'So, do you like it? There is still half left.'],
          [1, {
            options: [
              'C’est délicieux, je me régale ! Je peux reprendre une part ?',
              'C’est délicieux, j’étanche ma soif !',
              'Oui, je meurs sur le pouce.',
            ],
            explain: b('Praise the meal with je me régale and ask for seconds with reprendre une part.', 'Complimentez avec je me régale et demandez une portion avec reprendre une part.'),
          }],
          [0, 'Bien sûr, sers-toi ! Tu veux un verre d’eau avec ça ?', 'Of course, help yourself! Would you like a glass of water with that?'],
          [1, 'Avec plaisir, après cette part je serai complètement calé !', 'Gladly—after this slice I will be completely full!'],
        ],
      ),
      dict('À midi, on mange sur le pouce ou on casse la croûte au parc.', {
        voice: 'm',
        hint: b('Watch the circumflex accent on croûte.', 'Pensez à l’accent circonflexe sur croûte.'),
      }),
      write(
        b('Describe a meal or snack', 'Racontez un repas ou un goûter'),
        b('Write 2–3 sentences (20–45 words) about eating with a friend: say how hungry or thirsty you were, what you ate or drank, and use at least three expressions from this course.', 'Écrivez 2 à 3 phrases (20–45 mots) sur un repas avec un ami : dites votre faim ou soif, ce que vous avez pris, et utilisez au moins trois expressions de ce cours.'),
        20,
        45,
        [
          b('Mention your hunger or thirst level', 'Mentionner votre niveau de faim ou de soif'),
          b('Include a table or quick-bite expression', 'Inclure une expression de repas ou de table'),
          b('Close with fullness or enjoyment (se régaler, être calé)', 'Conclure avec le plaisir ou la satiété (se régaler, être calé)'),
        ],
        'À midi, j’avais une faim de loup, alors j’ai mangé sur le pouce avec Paul. Ce soir, on a dîné chez lui : je me suis régalé, j’ai repris une part de tarte et maintenant je suis complètement calé !',
      ),
    ],
    [
      b('casser la croûte (simple meal) vs manger sur le pouce (fast bite on the go).', 'casser la croûte (repas simple) vs manger sur le pouce (manger très vite).'),
      b('Wish Bon appétit ! before eating and praise the food with Je me régale !', 'Souhaitez Bon appétit ! avant le repas et complimentez avec Je me régale !'),
      b('reprendre une part = to have another slice or helping.', 'reprendre une part = se resservir d’une portion.'),
    ],
    [
      ['casser la croûte', b('to grab a bite / simple meal', 'manger un repas simple')],
      ['manger sur le pouce', b('to grab a quick bite on the go', 'manger très vite sans s’installer')],
      ['se régaler', b('to really enjoy a meal', 'savourer un plat délicieux')],
      ['bon appétit', b('enjoy your meal!', 'formule avant de manger')],
      ['reprendre une part', b('to have another slice / helping', 'se servir une deuxième fois')],
    ],
  ),
];

export default lessons;
