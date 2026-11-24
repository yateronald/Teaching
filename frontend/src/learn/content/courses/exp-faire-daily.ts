import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Faire is the Swiss-army knife of everyday French. Learn fifteen indispensable faire expressions for practical chores and caution, sports and downtime, and social life—from standing in line and doing your best to pretending and trusting someone.',
    'Faire est le verbe couteau suisse du français quotidien. Maîtrisez quinze expressions incontournables avec faire pour les gestes pratiques et la prudence, les loisirs et le sport, et la vie sociale : faire la queue, faire de son mieux, faire semblant ou faire confiance.',
  ),
  outcomes: [
    b('Talk about daily errands, cooking, cleaning, queuing, and being careful', 'Parler des courses, de la cuisine, du ménage, de l’attente et de la prudence'),
    b('Describe sports, walks, naps, and doing your best with faire', 'Décrire sport, promenades, siestes et efforts avec faire'),
    b('Express social nuances like pleasing, trusting, pretending, and acting on purpose', 'Exprimer les nuances sociales : faire plaisir, faire confiance, faire semblant et faire exprès'),
  ],
};

const C = 'exp-faire-daily';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['faire-practical-actions', 'faire-actions-pratiques'],
    b('Practical actions with faire', 'Les actions pratiques avec faire'),
    b('Master five daily-life faire expressions for caution, lines, groceries, cleaning, and cooking.', 'Maîtriser cinq expressions pratiques avec faire : prudence, file d’attente, courses, ménage et cuisine.'),
    [
      b('Use faire attention, faire la queue, faire les courses, faire le ménage, and faire la cuisine', 'Employer faire attention, faire la queue, faire les courses, faire le ménage et faire la cuisine'),
      b('Keep the right definite article (la or les) inside each expression', 'Garder le bon article défini (la ou les) dans chaque expression'),
      b('Add à after faire attention when naming a danger or target', 'Ajouter à après faire attention pour indiquer un danger'),
    ],
    13,
    [
      card(
        b('Everyday tasks with faire', 'Les gestes du quotidien avec faire'),
        b(
          'In French, everyday errands and chores pair **faire** with a fixed noun: **faire attention (à)**, **faire la queue**, **faire les courses**, **faire le ménage**, and **faire la cuisine**. Watch the exact article in each one!',
          'En français, beaucoup d’actions courantes associent **faire** à un nom fixe : **faire attention (à)**, **faire la queue**, **faire les courses**, **faire le ménage** et **faire la cuisine**. Observez bien l’article de chaque tournure !',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['faire attention', b('to make attention', 'porter son attention'), b('to pay attention / be careful', 'être prudent ou concentré')],
              ['faire la queue', b('to make the tail', 'former une file'), b('to stand in line / queue', 'attendre son tour en file')],
              ['faire les courses', b('to do the errands', 'effectuer les achats courants'), b('to do the grocery shopping', 'acheter provisions et repas')],
              ['faire le ménage', b('to do the household', 'nettoyer le logement'), b('to clean the house', 'nettoyer et ranger chez soi')],
              ['faire la cuisine', b('to do the kitchen', 'préparer les repas'), b('to cook', 'cuisiner à la maison')],
            ],
          },
          ex: [
            ['Fais attention aux vélos quand tu traverses !', 'Watch out for bikes when you cross!'],
            ['Le samedi matin, on fait la queue devant la boulangerie.', 'On Saturday mornings, people line up outside the bakery.'],
            ['Ce soir, je fais les courses et tu fais la cuisine.', 'Tonight, I am doing the grocery shopping and you are cooking.'],
          ],
        },
      ),
      tip(
        b('Fixed nouns, not plurals by chance', 'Des articles fixes à mémoriser'),
        b(
          'Say **faire les courses** (always plural *les*) for food and household shopping, **faire le ménage** (singular *le*) for housecleaning, and **faire la queue** (singular *la*) for standing in line—even in front of a museum or café!',
          'On dit toujours **faire les courses** (au pluriel) pour les achats alimentaires, **faire le ménage** (au singulier) pour nettoyer le logement et **faire la queue** (au singulier) pour attendre son tour en file !',
        ),
      ),
      flash(
        b('Practical actions', 'Actions pratiques'),
        [
          ['faire attention', b('to pay attention / be careful', 'être prudent ou concentré')],
          ['faire la queue', b('to wait in line', 'attendre son tour en file')],
          ['faire les courses', b('to do the grocery shopping', 'acheter de la nourriture')],
          ['faire le ménage', b('to clean the house', 'nettoyer le logement')],
          ['faire la cuisine', b('to cook', 'préparer les repas')],
        ],
      ),
      mc(
        b('You warn a friend about slippery ice on the sidewalk. What do you say?', 'Vous prévenez un ami qu’il y a du verglas sur le trottoir. Que dites-vous ?'),
        [
          'Fais attention, ça glisse !',
          'Fais la queue, ça glisse !',
          'Fais le ménage, ça glisse !',
          'Prends attention, ça glisse !',
        ],
        {
          explain: b('Being careful is always faire attention—never prendre attention.', 'Pour demander d’être prudent, on dit toujours faire attention (jamais prendre attention).'),
        },
      ),
      mc(
        P.best,
        [
          'fais la queue',
          'fais les courses',
          'fais le ménage',
          'fais la cuisine',
        ],
        {
          fr: 'Il y a dix personnes devant moi à la caisse : je ___ depuis cinq minutes.',
          explain: b('Waiting in line at a checkout or counter is faire la queue.', 'Attendre son tour devant une caisse se dit faire la queue.'),
        },
      ),
      pairs(
        P.match,
        [
          ['faire attention', b('to pay attention / be careful', 'être prudent ou concentré')],
          ['faire la queue', b('to wait in line', 'attendre son tour en file')],
          ['faire les courses', b('to do the grocery shopping', 'acheter de la nourriture')],
          ['faire le ménage', b('to clean the house', 'nettoyer le logement')],
          ['faire la cuisine', b('to cook', 'préparer les repas')],
        ],
      ),
      gap(
        P.complete,
        'Le samedi matin, je fais ___ au supermarché, et avant dîner je fais ___ dans le salon.',
        [['les courses'], ['le ménage']],
        {
          choices: [
            ['les courses', 'le ménage', 'la queue'],
            ['le ménage', 'la queue', 'les courses'],
          ],
          explain: b('At the supermarket you do les courses; in the living room you do le ménage.', 'Au supermarché on fait les courses ; dans le salon on fait le ménage.'),
        },
      ),
      hear(
        'Le samedi, j’adore faire la cuisine pour mes amis, mais je n’aime pas faire la queue au marché.',
        b('What does the speaker dislike on Saturdays?', 'Qu’est-ce que la femme n’aime pas faire le samedi ?'),
        [
          b('Standing in line at the market', 'Faire la queue au marché'),
          b('Cooking dinner for her friends', 'Cuisiner pour ses amis'),
          b('Cleaning the kitchen after lunch', 'Nettoyer la cuisine après le déjeuner'),
          b('Going to the supermarket early', 'Aller tôt au supermarché'),
        ],
      ),
      dict('Le dimanche, mon père fait les courses et ma mère fait la cuisine.', {
        hint: b('Notice singular verb fait with mon père and ma mère.', 'Attention au verbe au singulier fait.'),
      }),
      say('Fais attention aux voitures quand tu traverses la rue !', 'Watch out for cars when you cross the street!'),
    ],
    [
      b('faire attention (à) = to be careful / watch out (for).', 'faire attention (à) = être prudent / faire preuve d’attention.'),
      b('faire la queue = to stand in line; faire les courses = grocery shopping.', 'faire la queue = attendre en file ; faire les courses = acheter à manger.'),
      b('faire le ménage = housecleaning; faire la cuisine = cooking.', 'faire le ménage = nettoyer chez soi ; faire la cuisine = préparer les repas.'),
    ],
    [
      ['faire attention', b('to pay attention / be careful', 'être prudent ou concentré')],
      ['faire la queue', b('to wait in line', 'attendre son tour en file')],
      ['faire les courses', b('to do the grocery shopping', 'acheter de la nourriture')],
      ['faire le ménage', b('to clean the house', 'nettoyer le logement')],
      ['faire la cuisine', b('to cook', 'préparer les repas')],
    ],
  ),

  lesson(
    C,
    2,
    ['faire-leisure-and-sports', 'faire-loisirs-et-sport'],
    b('Leisure, rest & effort with faire', 'Loisirs, détente et effort avec faire'),
    b('Talk about going for a walk, taking a nap, doing sports, and doing your best.', 'Parler de promenade, de sieste, de sport et d’effort avec faire.'),
    [
      b('Distinguish faire un tour (short outing) from faire une promenade (walk)', 'Distinguer faire un tour et faire une promenade'),
      b('Use faire du sport and faire la sieste naturally', 'Employer naturellement faire du sport et faire la sieste'),
      b('Adapt the possessive inside faire de son mieux to match the subject', 'Accorder le possessif dans faire de son mieux selon le sujet'),
    ],
    13,
    [
      card(
        b('Outings, rest & doing your best', 'Balades, repos et effort'),
        b(
          'Use **faire un tour** for a quick stroll or spin around town, **faire une promenade** for a longer walk, **faire du sport** for working out, **faire la sieste** for napping, and **faire de son mieux** for trying as hard as you can.',
          'Utilisez **faire un tour** pour une petite sortie, **faire une promenade** pour une balade plus longue, **faire du sport** pour l’activité physique, **faire la sieste** pour dormir l’après-midi et **faire de son mieux** pour donner son maximum.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['faire un tour', b('to make a turn', 'effectuer un court trajet'), b('to go for a quick stroll / look around', 'se promener brièvement')],
              ['faire une promenade', b('to make a walk', 'effectuer une balade'), b('to go for a walk', 'marcher pour le plaisir')],
              ['faire du sport', b('to do some sport', 'pratiquer une activité physique'), b('to work out / play sports', 'pratiquer un sport')],
              ['faire la sieste', b('to do the nap', 'dormir l’après-midi'), b('to take a nap', 'se reposer en dormant le jour')],
              ['faire de son mieux', b('to do of one’s best', 'donner son maximum'), b('to do one’s best', 'essayer autant que possible')],
            ],
          },
          ex: [
            ['On va faire un tour au marché ?', 'Shall we go for a quick stroll to the market?'],
            ['En été, mon grand-père fait la sieste après déjeuner.', 'In summer, my grandfather takes a nap after lunch.'],
            ['L’exercice est long, mais je fais de mon mieux.', 'The exercise is long, but I am doing my best.'],
          ],
        },
      ),
      trap(
        b('Match son in faire de son mieux!', 'Accordez son dans faire de son mieux !'),
        b(
          'In **faire de son mieux**, **son** changes with the subject: **je fais de mon mieux, tu fais de ton mieux, nous faisons de notre mieux, vous faites de votre mieux**. Also never say *jouer du sport*—French always says **faire du sport**!',
          'Dans **faire de son mieux**, **son** change selon le sujet : **je fais de mon mieux, tu fais de ton mieux, nous faisons de notre mieux, vous faites de votre mieux**. Et on ne dit jamais *jouer du sport*, mais toujours **faire du sport** !',
        ),
      ),
      flash(
        b('Leisure & effort', 'Loisirs et effort'),
        [
          ['faire un tour', b('to go for a short stroll / look around', 'se promener brièvement')],
          ['faire une promenade', b('to go for a walk', 'marcher pour se détendre')],
          ['faire du sport', b('to work out / play sports', 'pratiquer une activité physique')],
          ['faire la sieste', b('to take a nap', 'dormir un moment le jour')],
          ['faire de son mieux', b('to do one’s best', 'donner son maximum')],
        ],
      ),
      mc(
        P.best,
        [
          'faisons de notre mieux',
          'faisons de son mieux',
          'faisons du mieux',
          'jouons de notre mieux',
        ],
        {
          fr: 'Le projet est difficile, mais nous ___ pour finir à temps.',
          explain: b('With nous, son changes to notre: nous faisons de notre mieux.', 'Avec nous, son devient notre : nous faisons de notre mieux.'),
        },
      ),
      mc(
        P.best,
        [
          'faire du sport',
          'jouer le sport',
          'faire les courses',
          'prendre la sieste',
        ],
        {
          fr: 'Pour rester en forme, j’essaie de ___ trois fois par semaine.',
          explain: b('Sports always pair with faire + du: faire du sport.', 'Avec le mot sport, on utilise toujours faire du sport.'),
        },
      ),
      sort(
        b('Sort into Practical chores or Leisure & rest.', 'Classez : tâches pratiques ou loisirs et détente.'),
        [b('Practical chores', 'Tâches pratiques'), b('Leisure & rest', 'Loisirs et détente')],
        [
          ['faire les courses', 0],
          ['faire un tour', 1],
          ['faire le ménage', 0],
          ['faire une promenade', 1],
          ['faire la cuisine', 0],
          ['faire la sieste', 1],
        ],
      ),
      gap(
        P.complete,
        'Après le déjeuner, j’aime ___ la sieste vingt minutes, puis je ___ un tour dans le parc.',
        ['faire', 'fais'],
        {
          tr: 'After lunch, I like to take a twenty-minute nap, then I go for a quick stroll in the park.',
          hint: b('Infinitive after j’aime, then present je form.', 'Infinitif après j’aime, puis présent avec je.'),
        },
      ),
      ord(
        P.order,
        'Nous faisons une belle promenade dans la forêt.',
        {
          tr: 'We are taking a lovely walk in the forest.',
          extra: ['jouons'],
          explain: b('Subject (Nous) + verb (faisons) + article and adjective (une belle) + noun (promenade) + place.', 'Sujet (Nous) + verbe (faisons) + groupe nominal (une belle promenade) + lieu.'),
        },
      ),
      hear(
        'Le dimanche après-midi, si j’ai le temps, je fais une courte sieste, puis je vais faire un tour en vélo.',
        b('What does she do after her nap on Sunday?', 'Que fait-elle après sa sieste le dimanche ?'),
        [
          b('She goes for a quick bike ride', 'Elle va faire un tour en vélo'),
          b('She goes grocery shopping', 'Elle va faire les courses'),
          b('She cleans her whole house', 'Elle fait tout le ménage'),
          b('She cooks dinner for six people', 'Elle fait la cuisine pour six personnes'),
        ],
        { voice: 'f2' },
      ),
      say('Ne t’inquiète pas, tu fais de ton mieux !', 'Do not worry, you are doing your best!'),
    ],
    [
      b('faire un tour (quick stroll), faire une promenade (walk), faire la sieste (nap).', 'faire un tour (petite sortie), faire une promenade (balade), faire la sieste (repos).'),
      b('Always say faire du sport, never jouer du sport.', 'Dites toujours faire du sport, jamais jouer du sport.'),
      b('Adjust faire de son mieux to mon, ton, son, notre, votre, or leur.', 'Accordez faire de son mieux : mon, ton, son, notre, votre ou leur.'),
    ],
    [
      ['faire un tour', b('to go for a short stroll / look around', 'se promener brièvement')],
      ['faire une promenade', b('to go for a walk', 'marcher pour se détendre')],
      ['faire du sport', b('to work out / play sports', 'pratiquer une activité physique')],
      ['faire la sieste', b('to take a nap', 'dormir un moment le jour')],
      ['faire de son mieux', b('to do one’s best', 'donner son maximum')],
    ],
  ),

  lesson(
    C,
    3,
    ['faire-social-nuance', 'faire-relations-et-nuances'],
    b('Social life & intentions with faire', 'Relations et intentions avec faire'),
    b('Express pleasing someone, getting to know people, trusting, pretending, and acting on purpose.', 'Dire faire plaisir, faire connaissance, faire confiance, faire semblant et faire exprès.'),
    [
      b('Use faire plaisir à and faire confiance à with people and pronouns', 'Employer faire plaisir à et faire confiance à avec une personne ou un pronom'),
      b('Introduce yourself and others with faire connaissance', 'Rencontrer quelqu’un avec faire connaissance'),
      b('Distinguish pretending (faire semblant) from acting deliberately (faire exprès)', 'Distinguer simuler (faire semblant) et agir volontairement (faire exprès)'),
    ],
    13,
    [
      card(
        b('Social verbs & intentions', 'Relations et intentions'),
        b(
          'These five **faire** phrases cover real social life: **faire plaisir à** (to make someone happy), **faire connaissance** (to get to know someone), **faire confiance à** (to trust), **faire semblant** (to pretend), and **faire exprès** (to do on purpose).',
          'Ces cinq tournures avec **faire** rythment la vie sociale : **faire plaisir à**, **faire connaissance**, **faire confiance à**, **faire semblant** et **faire exprès**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['faire plaisir à', b('to make pleasure to', 'donner de la joie à'), b('to please / make happy', 'rendre quelqu’un content')],
              ['faire connaissance', b('to make knowledge', 'entrer en relation'), b('to meet / get acquainted', 'rencontrer pour la première fois')],
              ['faire confiance à', b('to make trust to', 'accorder sa foi à'), b('to trust someone', 'compter sur quelqu’un')],
              ['faire semblant', b('to make seeming', 'imiter une apparence'), b('to pretend', 'simuler, feindre')],
              ['faire exprès', b('to do expressly', 'agir volontairement'), b('to do on purpose', 'agir de manière voulue')],
            ],
          },
          ex: [
            ['Merci pour les fleurs, ça me fait vraiment plaisir !', 'Thanks for the flowers, that makes me really happy!'],
            ['Je fais confiance à mon équipe.', 'I trust my team.'],
            ['Pardon ! Je n’ai pas fait exprès de renverser le verre.', 'Sorry! I did not knock over the glass on purpose.'],
          ],
        },
      ),
      culture(
        b('Saying “sorry, it was an accident”', 'Dire « ce n’était pas volontaire »'),
        b(
          'If you bump into someone or drop something in France, **Excusez-moi, je n’ai pas fait exprès !** is warm and idiomatic. Also note how **à** works with pronouns: *Ça **me** fait plaisir* (it makes me happy) and *Je **te** fais confiance* (I trust you).',
          'Si vous bousculez quelqu’un ou faites tomber un objet, **Excusez-moi, je n’ai pas fait exprès !** sonne très naturel. Notez aussi l’emploi des pronoms à la place de **à** : *Ça **me** fait plaisir* et *Je **te** fais confiance*.',
        ),
      ),
      mc(
        P.best,
        [
          'fait exprès',
          'fait semblant',
          'fait connaissance',
          'fait plaisir',
        ],
        {
          fr: 'Tu as cassé l’assiette ? — Pardon, je n’ai pas ___ !',
          explain: b('Je n’ai pas fait exprès means “I didn’t do it on purpose”.', 'Je n’ai pas fait exprès signifie qu’on ne l’a pas fait volontairement.'),
        },
      ),
      pairs(
        P.match,
        [
          ['faire plaisir à', b('to please / make someone happy', 'rendre quelqu’un content')],
          ['faire connaissance', b('to meet / get to know each other', 'rencontrer quelqu’un')],
          ['faire confiance à', b('to trust someone', 'croire en la fiabilité de')],
          ['faire semblant', b('to pretend', 'simuler quelque chose')],
          ['faire exprès', b('to do on purpose', 'agir volontairement')],
        ],
      ),
      hear(
        'Le chat dort sur le canapé, mais quand on ouvre le frigo, il fait semblant de ne rien entendre pour avoir du fromage.',
        b('What is the cat doing when the fridge opens?', 'Que fait le chat quand on ouvre le frigo ?'),
        [
          b('It pretends not to hear anything', 'Il fait semblant de ne rien entendre'),
          b('It lines up in front of the door', 'Il fait la queue devant la porte'),
          b('It goes for a walk outside', 'Il fait un tour dehors'),
          b('It gets to know the neighbors', 'Il fait connaissance avec les voisins'),
        ],
        { voice: 'm2' },
      ),
      dlg(
        b('Meeting Inès’s cousin', 'Rencontrer le cousin d’Inès'),
        b('Inès introduces her cousin Hugo before dinner.', 'Inès vous présente son cousin Hugo avant le dîner.'),
        [['Inès', 'f'], ['Vous', 'm']],
        [
          [0, 'Je te présente mon cousin Hugo, il vient d’arriver à Lyon !', 'Meet my cousin Hugo, he just arrived in Lyon!'],
          [1, {
            options: [
              'Enchanté, Hugo ! Je suis ravi de faire connaissance.',
              'Enchanté, Hugo ! Je suis ravi de faire exprès.',
              'Enchanté, Hugo ! Je fais la queue.',
            ],
            explain: b('To say you are happy to meet someone, use faire connaissance.', 'Pour dire qu’on est ravi de rencontrer quelqu’un, on dit faire connaissance.'),
          }],
          [0, 'Hugo a apporté une tarte aux fraises qu’il a préparée ce matin.', 'Hugo brought a strawberry tart he made this morning.'],
          [1, {
            options: [
              'Oh merci, ça nous fait vraiment plaisir !',
              'Oh merci, ça nous fait vraiment semblant !',
              'Oh merci, ça nous fait vraiment attention !',
            ],
            explain: b('Use ça nous fait plaisir to thank someone warmly for a kind gesture.', 'On dit ça nous fait plaisir pour remercier d’une gentille attention.'),
          }],
          [0, 'Par contre, il a mis un peu de sucre par terre en entrant…', 'However, he spilled a bit of sugar on the floor coming in…'],
          [1, 'Pas de souci ! On sait bien qu’il n’a pas fait exprès.', 'No worries! We know he did not do it on purpose.'],
        ],
      ),
      dict('Je fais confiance à mon ami, il ne fait jamais exprès.', {
        voice: 'f2',
        hint: b('Watch the preposition à after confiance and the -s on exprès.', 'Attention à la préposition à après confiance et au -s de exprès.'),
      }),
      write(
        b('Write about your Saturday', 'Racontez votre samedi'),
        b('Write 2–3 sentences (20–45 words) about a Saturday: include one chore or outing, one leisure activity, and one social faire expression (faire plaisir, faire confiance, or faire connaissance).', 'Écrivez 2 à 3 phrases (20–45 mots) sur un samedi : incluez une tâche ou sortie, un loisir et une expression sociale avec faire (faire plaisir, faire confiance ou faire connaissance).'),
        20,
        45,
        [
          b('Include a practical faire task or outing', 'Inclure une tâche pratique ou sortie avec faire'),
          b('Include a leisure or effort phrase', 'Inclure un loisir ou un effort avec faire'),
          b('Use one social faire expression accurately', 'Employer correctement une expression sociale avec faire'),
        ],
        'Samedi matin, je fais les courses au marché et un peu de ménage. L’après-midi, je fais une promenade avec ma voisine pour mieux faire connaissance. Le soir, je fais la cuisine pour lui faire plaisir !',
      ),
    ],
    [
      b('faire plaisir à and faire confiance à take à + person (or me, te, lui, nous, vous, leur).', 'faire plaisir à et faire confiance à prennent à + personne (ou me, te, lui…).'),
      b('faire connaissance = to meet / get acquainted; faire semblant (de) = to pretend.', 'faire connaissance = se rencontrer ; faire semblant (de) = simuler.'),
      b('Je n’ai pas fait exprès = I did not do it on purpose.', 'Je n’ai pas fait exprès = ce n’était pas volontaire.'),
    ],
    [
      ['faire plaisir à', b('to please / make someone happy', 'rendre quelqu’un content')],
      ['faire connaissance', b('to meet / get to know each other', 'rencontrer quelqu’un')],
      ['faire confiance à', b('to trust someone', 'croire en la fiabilité de')],
      ['faire semblant', b('to pretend', 'simuler quelque chose')],
      ['faire exprès', b('to do on purpose', 'agir volontairement')],
    ],
  ),
];

export default lessons;
