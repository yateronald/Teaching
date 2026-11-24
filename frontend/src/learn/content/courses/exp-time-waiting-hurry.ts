import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Speed, punctuality, patience, and passing time: master fifteen A2 expressions French speakers reach for constantly—from en un clin d’œil and tout de suite to prendre son temps, du jour au lendemain, and ça fait un bail.',
    'Vitesse, ponctualité, patience et temps qui passe : maîtrisez quinze expressions essentielles de niveau A2, d’en un clin d’œil et tout de suite à prendre son temps, du jour au lendemain et ça fait un bail.',
  ),
  outcomes: [
    b('Express urgency, sudden changes, and high speed with natural idioms', 'Exprimer l’urgence, la soudaineté et la rapidité avec des expressions idiomatiques'),
    b('Talk about pacing, punctuality, and wasting or having time without preposition errors', 'Parler de rythme, de ponctualité et de temps libre sans erreur de préposition'),
    b('Describe overnight shifts, last-minute plans, habits, and long reunions', 'Décrire changements brusques, dernière minute, fréquence et retrouvailles'),
  ],
};

const C = 'exp-time-waiting-hurry';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['speed-and-immediacy', 'vitesse-et-immediatete'],
    b('Speed & right away', 'Vitesse, soudaineté et urgence'),
    b('Describe things happening instantly, suddenly, at top speed, or as soon as possible.', 'Exprimer l’instantanéité, la soudaineté, la pleine vitesse et l’urgence.'),
    [
      b('Distinguish tout de suite (immediately) from au plus vite (as soon as possible)', 'Distinguer tout de suite (sur-le-champ) et au plus vite (le plus rapidement possible)'),
      b('Use en un clin d’œil and à toute vitesse for high speed', 'Employer en un clin d’œil et à toute vitesse pour la rapidité'),
      b('Express sudden change with d’un seul coup', 'Exprimer la soudaineté avec d’un seul coup'),
    ],
    13,
    [
      card(
        b('When every second counts', 'Quand chaque seconde compte'),
        b(
          'These five expressions capture speed and immediacy: **en un clin d’œil** (in an instant), **tout de suite** (right away), **d’un seul coup** (suddenly / all at once), **à toute vitesse** (at full speed), and **au plus vite** (as soon as possible).',
          'Ces cinq tournures expriment vitesse et urgence : **en un clin d’œil** (en un instant), **tout de suite** (immédiatement), **d’un seul coup** (brusquement), **à toute vitesse** (très vite) et **au plus vite** (dans les plus brefs délais).',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['en un clin d’œil', b('in a wink of an eye', 'le temps d’un battement de paupière'), b('in the blink of an eye', 'très rapidement, en un instant')],
              ['tout de suite', b('all of sequence', 'immédiatement après'), b('right away / immediately', 'sans attendre, à l’instant')],
              ['d’un seul coup', b('in a single blow', 'en une seule fois'), b('all of a sudden / all at once', 'brusquement, soudainement')],
              ['à toute vitesse', b('at all speed', 'à la vitesse maximale'), b('at full speed / super fast', 'extrêmement vite')],
              ['au plus vite', b('at the fastest', 'le plus vite possible'), b('as soon as possible / ASAP', 'dans les plus brefs délais')],
            ],
          },
          ex: [
            ['La semaine de vacances est passée en un clin d’œil !', 'The holiday week went by in the blink of an eye!'],
            ['Attends-moi ici, je reviens tout de suite.', 'Wait for me here, I will be right back.'],
            ['D’un seul coup, le vent s’est levé et il a plu à verse.', 'All of a sudden, the wind picked up and it poured down.'],
          ],
        },
      ),
      tip(
        b('Tout de suite vs Au plus vite', 'Tout de suite ou Au plus vite'),
        b(
          '**Tout de suite** means right this second (*J’arrive tout de suite !*), whereas **au plus vite** is ideal in requests and emails meaning “as fast / soon as you can” (*Merci de me répondre au plus vite*).',
          '**Tout de suite** signifie immédiatement (*J’arrive tout de suite !*), tandis qu’**au plus vite** signifie « dès que possible » dans une demande ou un courriel (*Merci de me répondre au plus vite*).',
        ),
      ),
      flash(
        b('Speed & urgency', 'Vitesse et urgence'),
        [
          ['en un clin d’œil', b('in the blink of an eye', 'très rapidement')],
          ['tout de suite', b('right away / immediately', 'sans attendre')],
          ['d’un seul coup', b('all of a sudden / all at once', 'brusquement, d’un coup')],
          ['à toute vitesse', b('at full speed', 'extrêmement vite')],
          ['au plus vite', b('as soon as possible / ASAP', 'le plus rapidement possible')],
        ],
      ),
      mc(
        P.best,
        [
          'd’un seul coup',
          'au plus vite',
          'à toute suite',
          'en un seul œil',
        ],
        {
          fr: 'Le ciel était bleu, puis l’orage a éclaté ___ !',
          explain: b('d’un seul coup introduces a sudden, abrupt event.', 'd’un seul coup marque un événement soudain et brusque.'),
        },
      ),
      mc(
        b('How do you politely ask a colleague to send a document as soon as possible?', 'Comment demander poliment à un collègue d’envoyer un document le plus tôt possible ?'),
        [
          'Tu peux m’envoyer ce fichier au plus vite ?',
          'Tu peux m’envoyer ce fichier en un clin ?',
          'Tu peux m’envoyer ce fichier d’un coup de vitesse ?',
          'Tu peux m’envoyer ce fichier tout de temps ?',
        ],
        {
          explain: b('Use au plus vite to mean “as soon / fast as possible”.', 'On emploie au plus vite pour dire « le plus rapidement possible ».'),
        },
      ),
      pairs(
        P.match,
        [
          ['en un clin d’œil', b('in the blink of an eye', 'très rapidement')],
          ['tout de suite', b('right away / immediately', 'sans attendre')],
          ['d’un seul coup', b('all of a sudden / all at once', 'brusquement, d’un coup')],
          ['à toute vitesse', b('at full speed', 'extrêmement vite')],
          ['au plus vite', b('as soon as possible / ASAP', 'le plus rapidement possible')],
        ],
      ),
      gap(
        P.complete,
        'Le TGV est passé ___ devant la petite gare, et ce mois d’août a filé ___ !',
        [['à toute vitesse'], ['en un clin d’œil']],
        {
          choices: [
            ['à toute vitesse', 'au plus vite', 'tout de suite'],
            ['en un clin d’œil', 'd’un seul coup', 'au plus vite'],
          ],
          explain: b('A speeding train goes à toute vitesse; a month flies by en un clin d’œil.', 'Un train file à toute vitesse ; un mois passe en un clin d’œil.'),
        },
      ),
      hear(
        'Dépêche-toi, le taxi attend déjà en bas ! Descends tout de suite et ferme la porte au plus vite.',
        b('What is the speaker urging the listener to do?', 'Que demande-t-on à la personne de faire ?'),
        [
          b('Come downstairs right away and close the door ASAP', 'Descendre tout de suite et fermer la porte au plus vite'),
          b('Take their time because the taxi is early', 'Prendre son temps car le taxi est en avance'),
          b('Cancel the taxi and stay indoors', 'Annuler le taxi et rester à la maison'),
          b('Wait another ten minutes before packing', 'Attendre dix minutes avant de partir'),
        ],
      ),
      dict('D’un seul coup, la voiture est partie à toute vitesse.', {
        hint: b('Watch the apostrophe in D’un and feminine agreement on partie.', 'Pensez à l’apostrophe dans D’un et à l’accord de partie.'),
      }),
      say('Ne bouge pas, j’arrive tout de suite et je règle ça en un clin d’œil.', 'Do not move, I am coming right away and I will fix that in the blink of an eye.'),
    ],
    [
      b('tout de suite = right now; au plus vite = as soon as possible.', 'tout de suite = immédiatement ; au plus vite = le plus vite possible.'),
      b('en un clin d’œil = in a flash; à toute vitesse = at full speed.', 'en un clin d’œil = en un instant ; à toute vitesse = extrêmement vite.'),
      b('d’un seul coup = all of a sudden / all at once.', 'd’un seul coup = brusquement, en une fois.'),
    ],
    [
      ['en un clin d’œil', b('in the blink of an eye', 'très rapidement')],
      ['tout de suite', b('right away / immediately', 'sans attendre')],
      ['d’un seul coup', b('all of a sudden / all at once', 'brusquement, d’un coup')],
      ['à toute vitesse', b('at full speed', 'extrêmement vite')],
      ['au plus vite', b('as soon as possible / ASAP', 'le plus rapidement possible')],
    ],
  ),

  lesson(
    C,
    2,
    ['pace-and-punctuality', 'rythme-et-ponctualite'],
    b('Taking your time & being on time', 'Prendre son temps et être à l’heure'),
    b('Talk smoothly about slowing down, arriving early or on time, and not wasting time.', 'Parler de prendre son temps, d’être en avance ou à l’heure et d’éviter de perdre son temps.'),
    [
      b('Use à l’heure (on time) and en avance (early) with the exact prepositions', 'Employer à l’heure et en avance avec la bonne préposition'),
      b('Match the possessive inside prendre son temps, perdre son temps, and avoir tout son temps', 'Accorder le possessif dans prendre, perdre ou avoir tout son temps'),
      b('Contrast hurry idioms with calm-pace expressions', 'Opposer les expressions de hâte et celles de calme'),
    ],
    13,
    [
      card(
        b('Pace, punctuality & patience', 'Rythme, ponctualité et patience'),
        b(
          'Slow down with these five everyday expressions: **prendre son temps** (not rush), **arriver à l’heure** (arrive on time), **être en avance** (be early), **perdre son temps** (waste time), and **avoir tout son temps** (have plenty of time).',
          'Ralentissez avec ces cinq expressions : **prendre son temps**, **arriver à l’heure**, **être en avance**, **perdre son temps** et **avoir tout son temps**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['prendre son temps', b('to take one’s time', 'utiliser le temps disponible'), b('to take one’s time / not rush', 'agir calmement sans se presser')],
              ['arriver à l’heure', b('to arrive at the hour', 'arriver au moment prévu'), b('to arrive on time', 'arriver à l’heure exacte')],
              ['être en avance', b('to be in advance', 'arriver avant l’heure fixée'), b('to be early', 'arriver plus tôt que prévu')],
              ['perdre son temps', b('to lose one’s time', 'gaspiller son temps'), b('to waste one’s time', 'utiliser son temps inutilement')],
              ['avoir tout son temps', b('to have all one’s time', 'disposer de beaucoup de temps'), b('to have all the time in the world', 'ne pas être pressé du tout')],
            ],
          },
          ex: [
            ['Le dimanche matin, j’aime prendre mon temps pour le petit-déjeuner.', 'On Sunday mornings, I like to take my time for breakfast.'],
            ['Le train est arrivé à l’heure, mais moi j’étais en avance !', 'The train arrived on time, and I was actually early!'],
            ['Ne perds pas ton temps à attendre devant cette porte fermée.', 'Do not waste your time waiting in front of that closed door.'],
          ],
        },
      ),
      trap(
        b('À l’heure (not sur l’heure!)—and match son!', 'À l’heure (jamais sur l’heure !) et accordez son !'),
        b(
          'Never translate “on time” literally as *sur l’heure*—always say **à l’heure** (and **en avance** for early, **en retard** for late). Also adjust **son** inside **prendre / perdre / avoir tout son temps** to the subject: *Tu prends **ton** temps*, *Nous avons tout **notre** temps*!',
          'Ne dites jamais *sur l’heure* ni *en temps* pour « on time » : dites toujours **à l’heure** (et **en avance** / **en retard**). Pensez aussi à accorder **son** avec le sujet : *Tu prends **ton** temps*, *Nous avons tout **notre** temps* !',
        ),
      ),
      flash(
        b('Pace & punctuality', 'Rythme et ponctualité'),
        [
          ['prendre son temps', b('to take one’s time', 'ne pas se presser')],
          ['arriver à l’heure', b('to arrive on time', 'arriver au moment prévu')],
          ['être en avance', b('to be early', 'arriver avant l’heure')],
          ['perdre son temps', b('to waste one’s time', 'gaspiller son temps')],
          ['avoir tout son temps', b('to have plenty of time', 'ne pas être pressé')],
        ],
      ),
      mc(
        b('Your appointment is at 10:00 and you arrive at 9:45. What do you say?', 'Votre rendez-vous est à 10 h et vous arrivez à 9 h 45. Que dites-vous ?'),
        [
          'Je suis en avance !',
          'Je suis sur l’heure !',
          'Je perds mon temps !',
          'Je suis au plus vite !',
        ],
        {
          explain: b('Arriving before the scheduled time is être en avance.', 'Arriver avant l’heure fixée se dit être en avance.'),
        },
      ),
      mc(
        P.best,
        [
          'tout notre temps',
          'tout son temps',
          'toute notre heure',
          'tout notre avance',
        ],
        {
          fr: 'Ne vous inquiétez pas, nous avons ___ pour visiter le château.',
          explain: b('With nous, son changes to notre: nous avons tout notre temps.', 'Avec nous, son devient notre : nous avons tout notre temps.'),
        },
      ),
      sort(
        b('Sort into Speed & urgency (Lesson 1) or Pace & punctuality (Lesson 2).', 'Classez : vitesse et urgence (leçon 1) ou calme et ponctualité (leçon 2).'),
        [b('Speed & urgency', 'Vitesse et urgence'), b('Pace & punctuality', 'Calme et ponctualité')],
        [
          ['en un clin d’œil', 0],
          ['prendre son temps', 1],
          ['tout de suite', 0],
          ['arriver à l’heure', 1],
          ['à toute vitesse', 0],
          ['avoir tout son temps', 1],
        ],
      ),
      gap(
        P.complete,
        'Ne ___ pas ton temps devant cet écran : prépare-toi pour arriver ___ à la gare !',
        ['perds', 'à l’heure'],
        {
          tr: 'Do not waste your time in front of that screen: get ready to arrive on time at the station!',
          hint: b('First blank: imperative of perdre (with -s); second blank: “on time”.', 'Premier trou : impératif de perdre ; second trou : ponctualité exacte.'),
        },
      ),
      ord(
        P.order,
        'Le dimanche matin, je prends mon temps pour déjeuner.',
        {
          tr: 'On Sunday mornings, I take my time to have lunch.',
          extra: ['son'],
          explain: b('With je, use prends and mon temps (never son).', 'Avec je, on emploie prends et mon temps (jamais son).'),
        },
      ),
      hear(
        'Il ne faut pas perdre notre temps dans les embouteillages : partons tôt pour être un peu en avance.',
        b('Why does he suggest leaving early?', 'Pourquoi propose-t-il de partir tôt ?'),
        [
          b('To avoid wasting time in traffic and arrive early', 'Pour ne pas perdre de temps et arriver en avance'),
          b('Because the meeting starts in one minute', 'Parce que la réunion commence tout de suite'),
          b('Because they have all the time in the world', 'Parce qu’ils ont tout leur temps après midi'),
          b('Because the bus already left at full speed', 'Parce que le bus est déjà parti à toute vitesse'),
        ],
        { voice: 'm' },
      ),
      say('Prends ton temps, nous avons vraiment tout notre temps aujourd’hui.', 'Take your time, we really have all the time in the world today.'),
    ],
    [
      b('arriver à l’heure = arrive on time; être en avance = be early (opposite: en retard).', 'arriver à l’heure = ponctuel ; être en avance = avant l’heure (contraire : en retard).'),
      b('prendre / perdre / avoir tout son temps adapts son to mon, ton, notre, votre, leur.', 'prendre / perdre / avoir tout son temps accorde son : mon, ton, notre, votre, leur.'),
      b('Never say sur l’heure for “on time”—always à l’heure.', 'Ne dites jamais sur l’heure : dites toujours à l’heure.'),
    ],
    [
      ['prendre son temps', b('to take one’s time', 'ne pas se presser')],
      ['arriver à l’heure', b('to arrive on time', 'arriver au moment prévu')],
      ['être en avance', b('to be early', 'arriver avant l’heure')],
      ['perdre son temps', b('to waste one’s time', 'gaspiller son temps')],
      ['avoir tout son temps', b('to have plenty of time', 'ne pas être pressé')],
    ],
  ),

  lesson(
    C,
    3,
    ['change-and-waiting', 'changement-et-attente'],
    b('Long waits, last minutes & big shifts', 'Attente, dernière minute et changements'),
    b('Talk about sudden life changes, last-minute plans, habits, inevitability, and old friends.', 'Parler de changements brusques, de dernière minute, d’habitudes et de longues retrouvailles.'),
    [
      b('Use du jour au lendemain and à la dernière minute accurately', 'Employer correctement du jour au lendemain et à la dernière minute'),
      b('Express frequency and inevitability with de temps en temps and tôt ou tard', 'Exprimer la fréquence et l’inévitable avec de temps en temps et tôt ou tard'),
      b('Greet an old friend naturally with ça fait un bail', 'Saluer un vieil ami avec l’expression ça fait un bail'),
    ],
    13,
    [
      card(
        b('Changes, delays & long gaps', 'Changements, délais et retrouvailles'),
        b(
          'Finish your time toolkit with five authentic idioms: **du jour au lendemain** (overnight), **à la dernière minute** (at the last minute), **tôt ou tard** (sooner or later), **de temps en temps** (from time to time), and **ça fait un bail** (it’s been ages!).',
          'Complétez votre palette avec cinq expressions très vivantes : **du jour au lendemain**, **à la dernière minute**, **tôt ou tard**, **de temps en temps** et **ça fait un bail**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['du jour au lendemain', b('from day to the next day', 'd’un jour sur le suivant'), b('overnight / out of nowhere', 'très rapidement, sans prévenir')],
              ['à la dernière minute', b('at the last minute', 'au tout dernier instant'), b('at the last minute', 'juste avant la limite')],
              ['tôt ou tard', b('early or late', 'un jour ou l’autre'), b('sooner or later', 'tôt ou tard dans le futur')],
              ['de temps en temps', b('from time in time', 'par moments'), b('from time to time / occasionally', 'quelquefois, parfois')],
              ['ça fait un bail', b('that makes a lease', 'cela fait un long bail'), b('it’s been ages! / long time no see', 'il y a très longtemps')],
            ],
          },
          ex: [
            ['Il a changé d’avis du jour au lendemain.', 'He changed his mind overnight.'],
            ['Nous réservons toujours nos billets à la dernière minute.', 'We always book our tickets at the last minute.'],
            ['Salut Marc ! Ça fait un bail qu’on ne s’est pas vus !', 'Hi Marc! It has been ages since we saw each other!'],
          ],
        },
      ),
      culture(
        b('Why “ça fait un bail” means “long time no see”', 'Pourquoi dit-on « ça fait un bail » ?'),
        b(
          'Un **bail** is a rental lease—traditionally signed for three, six, or nine years! Saying **Ça fait un bail !** when bumping into an old friend is warm and idiomatic in everyday French (in formal writing, prefer *Cela fait longtemps*).',
          'Un **bail** est un contrat de location qui dure souvent plusieurs années ! Dire **Ça fait un bail !** quand on retrouve un ami perdu de vue est très spontané et chaleureux (à l’écrit formel, préférez *Cela fait longtemps*).',
        ),
      ),
      mc(
        b('You run into an old classmate you have not seen in three years. What do you say?', 'Vous croisez un ancien camarade que vous n’avez pas vu depuis trois ans. Que dites-vous ?'),
        [
          'Salut, ça fait un bail !',
          'Salut, à la dernière minute !',
          'Salut, du jour au lendemain !',
          'Salut, au plus vite !',
        ],
        {
          explain: b('ça fait un bail means “it has been ages / long time no see!”.', 'ça fait un bail signifie « il y a très longtemps qu’on ne s’est pas vus ! ».'),
        },
      ),
      pairs(
        P.match,
        [
          ['du jour au lendemain', b('overnight / all of a sudden', 'très vite, sans prévenir')],
          ['à la dernière minute', b('at the last minute', 'au dernier moment')],
          ['tôt ou tard', b('sooner or later', 'un jour ou l’autre')],
          ['de temps en temps', b('from time to time', 'parfois, quelquefois')],
          ['ça fait un bail', b('it’s been ages!', 'il y a très longtemps')],
        ],
      ),
      hear(
        'On ne peut pas tout préparer à la dernière minute : tôt ou tard, on finit par oublier quelque chose d’important.',
        b('What warning does the speaker give?', 'Quel avertissement donne-t-elle ?'),
        [
          b('Preparing at the last minute eventually leads to forgetting things', 'Préparer à la dernière minute fait oublier des choses tôt ou tard'),
          b('Arriving early wastes valuable time every morning', 'Arriver en avance fait perdre du temps chaque matin'),
          b('Overnight trips never require packing in advance', 'Un court voyage ne demande jamais de préparation'),
          b('She only prepares her bag from time to time', 'Elle prépare son sac seulement de temps en temps'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Bumping into Thomas on the street', 'Croiser Thomas dans la rue'),
        b('Thomas runs into you downtown after two years without seeing each other.', 'Thomas vous retrouve par hasard en ville après deux ans sans vous voir.'),
        [['Thomas', 'm'], ['Vous', 'f']],
        [
          [0, 'Claire ! Quel plaisir de te voir ! Ça fait un bail qu’on ne s’est pas croisés !', 'Claire! What a pleasure to see you! It has been ages since we ran into each other!'],
          [1, {
            options: [
              'Oui, ça fait vraiment un bail ! On s’écrit de temps en temps, mais jamais en vrai.',
              'Oui, c’est à la dernière minute depuis deux ans.',
              'Non, je perds mon temps à te voir.',
            ],
            explain: b('Echo ça fait un bail and describe occasional texting with de temps en temps.', 'Rebondissez sur ça fait un bail et exprimez l’occasionnel avec de temps en temps.'),
          }],
          [0, 'C’est vrai ! Et tu habites toujours près de la gare ?', 'True! And do you still live near the train station?'],
          [1, {
            options: [
              'Non, j’ai déménagé presque du jour au lendemain le mois dernier.',
              'Non, j’ai déménagé en avance à la dernière minute.',
              'Oui, je déménage tôt ou tard hier.',
            ],
            explain: b('du jour au lendemain fits a sudden, fast move.', 'du jour au lendemain convient pour un changement rapide et inattendu.'),
          }],
          [0, 'Tu as cinq minutes pour boire un café, ou tu dois filer tout de suite ?', 'Do you have five minutes for a coffee, or do you have to dash right away?'],
          [1, 'J’ai tout mon temps ! Allons-y.', 'I have all the time in the world! Let us go.'],
        ],
      ),
      dict('De temps en temps, il organise son voyage à la dernière minute.', {
        voice: 'm2',
        hint: b('Watch the silent -ps in temps and the grave accent on à.', 'Attention au -ps muet de temps et à l’accent grave sur à.'),
      }),
      write(
        b('Catch up with a friend', 'Donnez de vos nouvelles à un ami'),
        b('Write a short message (30–60 words) to an old friend: greet them after a long gap, describe one sudden change or last-minute plan, and suggest meeting calmly without rushing. Use at least four expressions from this course.', 'Écrivez un court message (30–60 mots) à un vieil ami : évoquez le temps passé, racontez un changement brusque ou un plan de dernière minute, et proposez de vous voir sans vous presser. Utilisez au moins quatre expressions de ce cours.'),
        30,
        60,
        [
          b('Mention the long gap (ça fait un bail)', 'Évoquer la longue attente (ça fait un bail)'),
          b('Include a sudden shift or timing phrase (du jour au lendemain, à la dernière minute, de temps en temps)', 'Inclure une expression de changement ou de moment'),
          b('Suggest meeting without rushing (prendre son temps, arriver à l’heure, tout de suite)', 'Proposer de se voir tranquillement'),
        ],
        'Salut Karim ! Ça fait un bail qu’on ne s’est pas vus ! Je sais qu’on s’écrit de temps en temps, mais j’ai changé de travail presque du jour au lendemain. Samedi matin, j’ai tout mon temps : on prend notre temps autour d’un café ?',
      ),
    ],
    [
      b('du jour au lendemain = overnight; à la dernière minute = at the last minute.', 'du jour au lendemain = très brusquement ; à la dernière minute = juste avant la fin.'),
      b('tôt ou tard = sooner or later; de temps en temps = from time to time.', 'tôt ou tard = un jour ou l’autre ; de temps en temps = parfois.'),
      b('ça fait un bail = it has been ages (long time no see).', 'ça fait un bail = il y a très longtemps.'),
    ],
    [
      ['du jour au lendemain', b('overnight / all of a sudden', 'très vite, sans prévenir')],
      ['à la dernière minute', b('at the last minute', 'au dernier moment')],
      ['tôt ou tard', b('sooner or later', 'un jour ou l’autre')],
      ['de temps en temps', b('from time to time', 'parfois, quelquefois')],
      ['ça fait un bail', b('it’s been ages!', 'il y a très longtemps')],
    ],
  ),
];

export default lessons;
