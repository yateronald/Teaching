import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In French, weather and nature do much more than describe the forecast: they express intense cold, awkward silences, sudden relief, and snowballing problems. This A2 course teaches 15 high-frequency weather and nature idioms—from il pleut des cordes and briser la glace to faire boule de neige—through everyday situations, listening drills, dialogues, and guided writing.',
    'En français, la météo et la nature servent bien plus qu’à annoncer le temps : elles expriment un froid mordant, un malaise, un soulagement ou un problème qui s’amplifie. Ce cours A2 vous fait maîtriser 15 expressions courantes de la météo et de la nature — d’il pleut des cordes et briser la glace à faire boule de neige — grâce à des mises en situation, de l’écoute, des dialogues et de la rédaction guidée.',
  ),
  outcomes: [
    b('Describe heavy rain and bitter cold with vivid everyday idioms', 'Décrire une forte pluie et un grand froid avec des expressions imagées'),
    b('Use ice and weather metaphors for mood, calm, and social icebreakers', 'Employer les images météo pour parler d’ambiance, de calme et de prise de contact'),
    b('Express growing problems, relief, and uncertainty with nature idioms', 'Exprimer un problème croissant, une éclaircie ou l’incertitude avec la nature'),
  ],
};

const C = 'exp-weather-nature';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['rain-and-cold', 'pluie-et-froid'],
    b('Rain, chills & downpours', 'Pluie battante et froid de canard'),
    b('Talk about pouring rain, freezing cold, and getting soaked using five vivid everyday expressions.', 'Parler de pluie torrentielle, de froid intense et de frissons avec cinq expressions courantes.'),
    [
      b('Describe heavy rain with il pleut des cordes and sous la pluie battante', 'Décrire une forte pluie avec il pleut des cordes et sous la pluie battante'),
      b('Express intense cold and shivers with un froid de canard and avoir la chair de poule', 'Exprimer le grand froid et les frissons avec un froid de canard et avoir la chair de poule'),
      b('Agree être trempé(e) jusqu’aux os accurately with the subject', 'Accorder être trempé(e) jusqu’aux os avec le sujet'),
    ],
    13,
    [
      card(
        b('When the sky opens up—and the temperature drops', 'Quand le ciel se déchaîne et que le thermomètre chute'),
        b(
          'Instead of just saying *il pleut beaucoup* or *il fait très froid*, French speakers reach for colourful images: ropes of rain, duck-hunting cold, and goosebumps.\n\nRain idioms: **il pleut des cordes, sous la pluie battante, être trempé jusqu’aux os**.\nCold idioms: **un froid de canard, avoir la chair de poule**.',
          'Au lieu de dire simplement *il pleut beaucoup* ou *il fait très froid*, les francophones utilisent des images vives : des cordes de pluie, un froid de canard et une peau de poule.\n\nPluie : **il pleut des cordes, sous la pluie battante, être trempé jusqu’aux os**.\nFroid : **un froid de canard, avoir la chair de poule**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal picture', 'Image littérale'), b('Meaning', 'Sens réel')],
            rows: [
              ['il pleut des cordes', b('it is raining ropes', 'il pleut des cordes'), b('it is pouring down', 'il pleut très fort')],
              ['un froid de canard', b('a duck’s cold', 'un froid de canard'), b('freezing, bitter cold', 'un froid très vif')],
              ['avoir la chair de poule', b('to have hen’s flesh', 'avoir la peau d’une poule'), b('to have goosebumps', 'frissonner de froid ou d’émotion')],
              ['être trempé jusqu’aux os', b('soaked to the bones', 'mouillé jusqu’aux os'), b('to be soaked through', 'être complètement mouillé')],
              ['sous la pluie battante', b('under beating rain', 'sous une pluie qui bat'), b('in driving, pouring rain', 'sous une pluie forte et continue')],
            ],
          },
          ex: [
            ['Prends ton parapluie, il pleut des cordes dehors !', 'Take your umbrella, it’s pouring outside!'],
            ['En janvier, il fait souvent un froid de canard le matin.', 'In January, it is often freezing cold in the morning.'],
            ['J’ai oublié mon manteau et je suis trempé jusqu’aux os.', 'I forgot my coat and I am soaked to the bone.'],
          ],
        },
      ),
      culture(
        b('Why ducks and hens in French weather?', 'Pourquoi des canards et des poules dans la météo ?'),
        b(
          '**Un froid de canard** comes from autumn duck-hunting season, when hunters waited motionless near icy ponds at dawn. **Avoir la chair de poule** describes tiny bumps on the skin that look like a plucked hen—used for cold, fear, or a moving song! Remember also that **trempé** agrees in gender and number: **elle est trempée jusqu’aux os**, **nous sommes trempés jusqu’aux os**.',
          '**Un froid de canard** vient de la chasse aux canards en automne, quand les chasseurs attendaient immobiles près des étangs glacés. **Avoir la chair de poule** évoque la peau d’une volaille plumée — pour le froid, la peur ou une vive émotion ! Notez que **trempé** s’accorde : **elle est trempée jusqu’aux os**, **nous sommes trempés jusqu’aux os**.',
        ),
      ),
      flash(
        b('Five rain and cold idioms', 'Cinq expressions de pluie et de froid'),
        [
          ['il pleut des cordes', b('it is pouring with rain', 'il pleut très fort')],
          ['un froid de canard', b('bitter, freezing cold', 'un froid très intense')],
          ['avoir la chair de poule', b('to have goosebumps', 'frissonner sur la peau')],
          ['être trempé jusqu’aux os', b('to be soaked to the bone', 'être complètement mouillé')],
          ['sous la pluie battante', b('in the driving rain', 'sous une pluie violente')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('It is raining heavily.', 'Il pleut très fort.'),
          b('The wind is blowing gently.', 'Il y a un petit vent doux.'),
          b('It is snowing on the mountain.', 'Il neige sur les sommets.'),
          b('The sun is coming back out.', 'Le soleil revient enfin.'),
        ],
        {
          fr: 'N’oublie pas ton imperméable : il pleut des cordes !',
          explain: b('« Il pleut des cordes » means it is pouring hard, like English “raining cats and dogs”.', '« Il pleut des cordes » signifie qu’il pleut très fort, à verse.'),
        },
      ),
      mc(
        P.complete,
        [
          'j’ai la chair de poule',
          'je fais boule de neige',
          'je suis dans le brouillard',
          'je brise la glace',
        ],
        {
          fr: 'J’ai oublié mon pull sur le quai en plein hiver : ___ !',
          explain: b('Being cold without a jumper gives you goosebumps (avoir la chair de poule).', 'Avoir froid sans pull donne des frissons : avoir la chair de poule.'),
        },
      ),
      pairs(
        P.match,
        [
          ['il pleut des cordes', b('it is pouring with rain', 'il pleut très fort')],
          ['un froid de canard', b('bitter, freezing cold', 'un froid très intense')],
          ['avoir la chair de poule', b('to have goosebumps', 'frissonner sur la peau')],
          ['être trempé jusqu’aux os', b('to be soaked to the bone', 'être complètement mouillé')],
          ['sous la pluie battante', b('in the driving rain', 'sous une pluie violente')],
        ],
      ),
      gap(
        P.complete,
        'Ce matin, il fait ___ dehors et ___ depuis une heure : sans parapluie, on est vite ___ !',
        [['un froid de canard'], ['il pleut des cordes'], ['trempé jusqu’aux os']],
        {
          choices: [
            ['un froid de canard', 'la chair de poule', 'le beau temps'],
            ['il pleut des cordes', 'il brise la glace', 'il fait beau'],
            ['trempé jusqu’aux os', 'dans de beaux draps', 'dans le brouillard'],
          ],
          explain: b('Bitter cold (un froid de canard), heavy rain (il pleut des cordes), and soaked through (trempé jusqu’aux os).', 'Grand froid, forte pluie et vêtements complètement mouillés.'),
        },
      ),
      hear(
        'Comme le dernier bus avait vingt minutes de retard, nous avons attendu devant la gare sous la pluie battante.',
        b('How did they wait for the bus?', 'Dans quelles conditions ont-ils attendu le bus ?'),
        [
          b('In heavy, driving rain', 'Sous une pluie très violente'),
          b('Inside a warm café', 'À l’abri dans un café chaud'),
          b('Under a clear sunny sky', 'Sous un grand ciel bleu'),
        ],
      ),
      dict('Il fait un froid de canard ce soir et il pleut des cordes.'),
      say('J’ai la chair de poule : il fait vraiment un froid de canard !', 'I have goosebumps: it really is freezing cold!'),
    ],
    [
      b('il pleut des cordes / sous la pluie battante = heavy pouring rain.', 'il pleut des cordes / sous la pluie battante = forte pluie continue.'),
      b('un froid de canard = freezing cold; avoir la chair de poule = to get goosebumps.', 'un froid de canard = froid glacial ; avoir la chair de poule = frissonner.'),
      b('être trempé(e) jusqu’aux os agrees with the subject.', 'être trempé(e) jusqu’aux os s’accorde avec le sujet.'),
    ],
    [
      ['il pleut des cordes', b('it is pouring with rain', 'il pleut très fort')],
      ['un froid de canard', b('bitter, freezing cold', 'un froid très intense')],
      ['avoir la chair de poule', b('to have goosebumps', 'frissonner sur la peau')],
      ['être trempé jusqu’aux os', b('to be soaked to the bone', 'être complètement mouillé')],
      ['sous la pluie battante', b('in the driving rain', 'sous une pluie violente')],
    ],
  ),

  lesson(
    C,
    2,
    ['sun-ice-and-storms', 'soleil-glace-et-tempetes'],
    b('Sun, ice & keeping cool', 'Briser la glace et garder son sang-froid'),
    b('Use weather and temperature metaphors to talk about social warmth, power, confusion, and staying calm.', 'Employer la glace, le brouillard et le beau temps pour parler de rencontres, d’autorité, de flou mental et de maîtrise de soi.'),
    [
      b('Start conversations smoothly with briser la glace', 'Lancer un échange avec briser la glace'),
      b('Describe power and grogginess with faire la pluie et le beau temps and être dans le brouillard', 'Décrire l’autorité et la confusion avec faire la pluie et le beau temps et être dans le brouillard'),
      b('Stay composed under pressure with garder son sang-froid', 'Rester maître de soi avec garder son sang-froid'),
    ],
    13,
    [
      card(
        b('Ice, fog, and bright skies in daily life', 'Glace, brouillard et éclaircies au quotidien'),
        b(
          'Weather idioms easily shift from the sky to people’s behaviour: breaking an awkward silence, running the whole show, waking up foggy, or staying calm in a crisis.\n\nSocial & calm: **briser la glace, garder son sang-froid, après la pluie le beau temps**.\nControl & confusion: **faire la pluie et le beau temps, être dans le brouillard**.',
          'Les expressions météo passent facilement du ciel aux relations humaines : détendre l’atmosphère, tout décider, avoir les idées floues ou rester calme en situation tendue.\n\nDétente et calme : **briser la glace, garder son sang-froid, après la pluie le beau temps**.\nPouvoir et flou : **faire la pluie et le beau temps, être dans le brouillard**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Context', 'Contexte')],
            rows: [
              ['briser la glace', b('to break the ice', 'détendre l’atmosphère'), b('first meetings, parties', 'première rencontre, réunion')],
              ['faire la pluie et le beau temps', b('to call all the shots', 'décider de tout'), b('workplace, politics', 'bureau, direction')],
              ['être dans le brouillard', b('to feel foggy / unclear', 'avoir l’esprit confus'), b('early morning, tiredness', 'réveil, fatigue')],
              ['après la pluie le beau temps', b('every cloud has a silver lining', 'le calme revient après l’épreuve'), b('comforting someone', 'réconforter un ami')],
              ['garder son sang-froid', b('to keep one’s cool', 'rester calme face au danger'), b('emergencies, stress', 'urgence, stress')],
            ],
          },
          ex: [
            ['Elle a posé une question simple pour briser la glace au début de la réunion.', 'She asked a simple question to break the ice at the start of the meeting.'],
            ['Dans cette maison d’édition, c’est la rédactrice qui fait la pluie et le beau temps.', 'In this publishing house, the editor calls all the shots.'],
            ['Malgré la panne de métro, le conducteur a su garder son sang-froid.', 'Despite the metro breakdown, the driver kept his cool.'],
          ],
        },
      ),
      trap(
        b('Sang-froid is calmness—not cold weather!', 'Le sang-froid n’est pas le froid !'),
        b(
          'Do not mix up **un froid de canard** (outdoor temperature) with **garder son sang-froid** (keeping your composure under stress). Similarly, **être dans le brouillard** is used far more often for a groggy head in the morning than for driving in actual mist.\n\nCalm vs temperature: **garder son sang-froid** (composure) vs **avoir froid** (feeling cold).\nMental fog: **être encore dans le brouillard au réveil**.',
          'Ne confondez pas **un froid de canard** (température extérieure) et **garder son sang-froid** (garder son calme face à un imprévu). De même, **être dans le brouillard** décrit très souvent un esprit encore endormi le matin plutôt que la météo.\n\nCalme vs température : **garder son sang-froid** (maîtrise) vs **avoir froid** (température).\nEsprit flou : **être encore dans le brouillard au réveil**.',
        ),
      ),
      flash(
        b('Five sun, ice and calm idioms', 'Cinq expressions de soleil, glace et calme'),
        [
          ['briser la glace', b('to break the ice', 'détendre l’ambiance au début')],
          ['faire la pluie et le beau temps', b('to call all the shots', 'avoir tout pouvoir de décision')],
          ['être dans le brouillard', b('to be in a fog, groggy', 'ne pas avoir les idées claires')],
          ['après la pluie le beau temps', b('after the storm comes the calm', 'le mieux suit les moments difficiles')],
          ['garder son sang-froid', b('to keep one’s cool', 'rester calme sous pression')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('He decides everything and controls the whole team.', 'Il décide de tout et impose sa loi dans le service.'),
          b('He writes the daily weather forecast on the radio.', 'Il présente la météo du matin à la radio.'),
          b('He always leaves work early when it rains.', 'Il part toujours plus tôt quand il pleut.'),
          b('He forgets to check the forecast before travelling.', 'Il oublie souvent de regarder la météo.'),
        ],
        {
          fr: 'Dans ce service, c’est le directeur qui fait la pluie et le beau temps.',
          explain: b('« Faire la pluie et le beau temps » means having complete authority over decisions.', '« Faire la pluie et le beau temps » signifie avoir tout pouvoir de décision.'),
        },
      ),
      mc(
        P.complete,
        [
          'gardé son sang-froid',
          'brisé la glace',
          'fait la pluie et le beau temps',
          'été trempée jusqu’aux os',
        ],
        {
          fr: 'Quand l’alarme a sonné dans le magasin, la responsable a ___ et guidé les clients vers la sortie.',
          explain: b('In a sudden emergency, staying calm means garder son sang-froid.', 'Face à une alerte soudaine, garder son calme se dit garder son sang-froid.'),
        },
      ),
      sort(
        b('Sort each expression by its meaning.', 'Classez chaque expression selon son sens.'),
        [
          b('Calm, comfort & breaking tension', 'Calme, détente et réconfort'),
          b('Confusion or total control', 'Confusion ou autorité totale'),
        ],
        [
          ['briser la glace', 0],
          ['être dans le brouillard', 1],
          ['garder son sang-froid', 0],
          ['faire la pluie et le beau temps', 1],
          ['après la pluie le beau temps', 0],
          ['ne rien comprendre au dossier', 1],
        ],
      ),
      gap(
        P.complete,
        'Au réveil, je suis souvent dans le ___, mais un bon café m’aide à ___ la glace avec mes nouveaux collègues.',
        [['brouillard'], ['briser']],
        {
          tr: 'When I wake up, I am often in a fog, but a good coffee helps me break the ice with my new colleagues.',
          hint: b('First blank: fog; second blank: infinitive of “break”.', 'Premier trou : le nom météo du flou ; second trou : l’infinitif de « break ».'),
        },
      ),
      ord(
        P.order,
        'Dans cette équipe, Marc fait la pluie et le beau temps.',
        {
          tr: 'In this team, Marc calls all the shots.',
          extra: ['glace', 'brouillard'],
        },
      ),
      hear(
        'Ne t’inquiète pas pour ton examen raté : après la pluie le beau temps, tu réussiras la prochaine fois.',
        b('What message is the speaker giving?', 'Quel message la personne transmet-elle ?'),
        [
          b('Bad moments pass and better days will follow', 'Les moments difficiles passent et la suite ira mieux'),
          b('The exam was cancelled because of bad weather', 'L’examen a été annulé à cause du mauvais temps'),
          b('You must wait for sunny weather to study', 'Il faut attendre le soleil pour réviser'),
        ],
        { voice: 'm' },
      ),
      say('Une petite blague suffit souvent pour briser la glace.', 'A little joke is often enough to break the ice.'),
    ],
    [
      b('briser la glace = break an awkward silence; garder son sang-froid = stay calm.', 'briser la glace = détendre l’atmosphère ; garder son sang-froid = garder son calme.'),
      b('faire la pluie et le beau temps = hold all the power.', 'faire la pluie et le beau temps = tout décider.'),
      b('être dans le brouillard = feel groggy/confused; après la pluie le beau temps = better times come next.', 'être dans le brouillard = avoir l’esprit flou ; après la pluie le beau temps = l’espoir revient.'),
    ],
    [
      ['briser la glace', b('to break the ice', 'détendre l’ambiance au début')],
      ['faire la pluie et le beau temps', b('to call all the shots', 'avoir tout pouvoir de décision')],
      ['être dans le brouillard', b('to be in a fog, groggy', 'ne pas avoir les idées claires')],
      ['après la pluie le beau temps', b('after the storm comes the calm', 'le mieux suit les moments difficiles')],
      ['garder son sang-froid', b('to keep one’s cool', 'rester calme sous pression')],
    ],
  ),

  lesson(
    C,
    3,
    ['nature-metaphors', 'metaphores-de-la-nature'],
    b('Snowballs, tunnels & rough waters', 'Boule de neige, tunnel et eaux troubles'),
    b('Talk about escalating issues, light at the end of the tunnel, mixed signals, and flying blind.', 'Parler d’effet boule de neige, d’issue favorable, d’attitudes changeantes et d’improvisation.'),
    [
      b('Describe growing chains of events with faire boule de neige', 'Décrire une réaction en chaîne avec faire boule de neige'),
      b('Contrast hope (voir le bout du tunnel) with trouble (être dans de beaux draps)', 'Opposer espoir (voir le bout du tunnel) et embarras (être dans de beaux draps)'),
      b('Use souffler le chaud et le froid and naviguer à vue in dialogue and writing', 'Employer souffler le chaud et le froid et naviguer à vue en dialogue et à l’écrit'),
    ],
    13,
    [
      card(
        b('Nature images for momentum and uncertainty', 'Images de la nature pour l’élan et le doute'),
        b(
          'When a situation grows quickly, shifts unpredictably, or leaves you stuck without a map, French turns to snowballs, tunnels, winds, and sailing.\n\nMomentum & relief: **faire boule de neige, voir le bout du tunnel**.\nUncertainty & trouble: **souffler le chaud et le froid, être dans de beaux draps, naviguer à vue**.',
          'Quand une situation s’emballe, change sans cesse ou laisse sans repères, le français emprunte aux boules de neige, aux tunnels, aux vents et à la navigation.\n\nÉlan et soulagement : **faire boule de neige, voir le bout du tunnel**.\nDoute et embarras : **souffler le chaud et le froid, être dans de beaux draps, naviguer à vue**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal picture', 'Image littérale'), b('Meaning', 'Sens réel')],
            rows: [
              ['faire boule de neige', b('to roll like a snowball', 'grossir comme une boule de neige'), b('to snowball, grow rapidly', 's’amplifier par effet d’entraînement')],
              ['voir le bout du tunnel', b('see the end of the tunnel', 'voir la sortie du tunnel'), b('see light at the end of the tunnel', 'approcher de la fin d’une épreuve')],
              ['souffler le chaud et le froid', b('blow hot and cold', 'souffler chaud puis froid'), b('to send mixed signals', 'changer sans cesse d’avis ou de ton')],
              ['être dans de beaux draps', b('to be in fine sheets', 'être dans de jolis draps'), b('to be in a fine mess', 'être dans une situation très gênante')],
              ['naviguer à vue', b('to sail by sight', 'naviguer sans instruments'), b('to play it by ear, improvise', 'avancer sans plan précis')],
            ],
          },
          ex: [
            ['Une petite erreur de calendrier a fait boule de neige toute la semaine.', 'A small scheduling mistake snowballed all week long.'],
            ['Après trois mois de travaux, nous voyons enfin le bout du tunnel.', 'After three months of renovation, we finally see the light at the end of the tunnel.'],
            ['Avec son client qui souffle le chaud et le froid, elle ne sait plus quoi décider.', 'With her client blowing hot and cold, she no longer knows what to decide.'],
          ],
        },
      ),
      tip(
        b('The irony of « être dans de beaux draps »', 'L’ironie de « être dans de beaux draps »'),
        b(
          'Even though *beaux* means "lovely", **être dans de beaux draps** is ALWAYS ironic: you are in deep trouble or a very awkward mess! Compare it with English "we’re in a fine mess". Notice also that **faire boule de neige** has NO article before *boule*.',
          'Même si l’adjectif *beaux* semble positif, **être dans de beaux draps** est TOUJOURS ironique : vous êtes dans une situation très délicate ou embarrassante ! Notez aussi que **faire boule de neige** s’emploie sans article devant *boule*.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('She keeps alternating between enthusiastic praise and sudden refusal.', 'Elle alterne sans cesse encouragements et refus brusques.'),
          b('She turns on the heating whenever the window is open.', 'Elle allume le chauffage dès que la fenêtre est ouverte.'),
          b('She checks the weather twice before leaving home.', 'Elle vérifie la météo deux fois avant de sortir.'),
          b('She always stays calm during long meetings.', 'Elle reste toujours calme pendant les longues réunions.'),
        ],
        {
          fr: 'Mon propriétaire souffle le chaud et le froid au sujet de notre bail.',
          explain: b('« Souffler le chaud et le froid » means constantly switching attitude or giving contradictory signals.', '« Souffler le chaud et le froid » signifie changer sans cesse d’avis ou d’attitude.'),
        },
      ),
      pairs(
        P.match,
        [
          ['faire boule de neige', b('to snowball, grow rapidly', 's’amplifier par effet d’entraînement')],
          ['voir le bout du tunnel', b('to see the light at the end of the tunnel', 'approcher de la fin d’une épreuve')],
          ['souffler le chaud et le froid', b('to blow hot and cold', 'changer sans cesse d’avis ou de ton')],
          ['être dans de beaux draps', b('to be in a fine mess', 'être dans une situation très gênante')],
          ['naviguer à vue', b('to play it by ear, fly blind', 'avancer sans plan précis')],
        ],
      ),
      hear(
        'Le train est annulé et j’ai laissé mon téléphone au bureau : je suis vraiment dans de beaux draps !',
        b('How is the speaker feeling?', 'Quelle est la situation de la personne ?'),
        [
          b('She is stuck in an awkward mess', 'Elle se retrouve dans une situation très compliquée'),
          b('She is delighted to stay longer at the office', 'Elle est ravie de rester tard au bureau'),
          b('She is folding clean sheets at home', 'Elle plie des draps propres chez elle'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Before the event launches', 'Avant le lancement de l’événement'),
        b('Camille and Thomas review how the week is going at work.', 'Camille et Thomas font le point sur leur semaine de travail.'),
        [['Camille', 'f'], ['Thomas', 'm']],
        [
          [0, 'Le fournisseur nous a envoyé la mauvaise livraison ce matin. Sans plan B, on navigue un peu à vue.', 'The supplier sent us the wrong delivery this morning. Without a backup plan, we’re flying a bit blind.'],
          [1, {
            options: [
              'Si on ne règle pas ça vite, le retard va faire boule de neige sur tout le week-end !',
              'Super, on va être trempés jusqu’aux os au bureau.',
              'Ne t’en fais pas, le fournisseur fait boule de laine.',
            ],
            explain: b('One delay triggering bigger delays is faire boule de neige.', 'Un retard qui entraîne d’autres retards « fait boule de neige ».'),
          }],
          [0, 'Bonne nouvelle quand même : l’autre imprimeur vient de confirmer qu’il livre demain à huit heures.', 'Good news though: the other printer just confirmed they’re delivering tomorrow at eight.'],
          [1, {
            options: [
              'Ouf ! On voit enfin le bout du tunnel après cette semaine difficile.',
              'Zut, nous sommes encore dans de beaux draps demain.',
              'Ah bon, il souffle le chaud et le froid avec ses colis.',
            ],
            explain: b('Finally approaching relief after a tough week is voir le bout du tunnel.', 'Approcher enfin de la solution se dit voir le bout du tunnel.'),
          }],
          [0, 'Oui, on va pouvoir souffler un peu dès demain midi !', 'Yes, we’ll finally be able to catch our breath tomorrow at noon!'],
        ],
      ),
      dict('Après des semaines difficiles, nous voyons enfin le bout du tunnel.'),
      write(
        b('A week full of surprises', 'Une semaine pleine de rebondissements'),
        b('Write 30 to 60 words about a busy week or a sudden change of plans (weather, work, or travel). Use at least two idioms from this course.', 'Écrivez 30 à 60 mots sur une semaine chargée ou un imprévu (météo, travail ou voyage). Employez au moins deux expressions de ce cours.'),
        30,
        60,
        [
          b('At least two weather or nature idioms', 'Au moins deux expressions météo ou nature'),
          b('A clear problem and resolution', 'Un problème clair et une issue'),
          b('Correct verb conjugation and agreement', 'Des verbes bien conjugués et accordés'),
        ],
        'Lundi matin, il pleuvait des cordes et mon bus est tombé en panne. Sans parapluie, je suis arrivé au bureau trempé jusqu’aux os. Heureusement, j’ai gardé mon sang-froid et un collègue m’a prêté une veste sèche. Le soir, nous voyions enfin le bout du tunnel !',
        { phrases: ['il pleuvait des cordes', 'gardé mon sang-froid', 'on voit le bout du tunnel'] },
      ),
    ],
    [
      b('faire boule de neige = grow rapidly; voir le bout du tunnel = approach relief.', 'faire boule de neige = s’amplifier vite ; voir le bout du tunnel = voir la fin d’une épreuve.'),
      b('souffler le chaud et le froid = blow hot and cold; naviguer à vue = improvise without a clear plan.', 'souffler le chaud et le froid = changer sans cesse d’avis ; naviguer à vue = improviser sans visibilité.'),
      b('être dans de beaux draps is always ironic: to be in a fine mess.', 'être dans de beaux draps est toujours ironique : être dans une mauvaise posture.'),
    ],
    [
      ['faire boule de neige', b('to snowball, grow rapidly', 's’amplifier par effet d’entraînement')],
      ['voir le bout du tunnel', b('to see the light at the end of the tunnel', 'approcher de la fin d’une épreuve')],
      ['souffler le chaud et le froid', b('to blow hot and cold', 'changer sans cesse d’avis ou de ton')],
      ['être dans de beaux draps', b('to be in a fine mess', 'être dans une situation très gênante')],
      ['naviguer à vue', b('to play it by ear, fly blind', 'avancer sans plan précis')],
    ],
  ),
];

export default lessons;
