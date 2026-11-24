import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French thrives far beyond Paris. Explore iconic idioms from Québec (être aux oiseaux, attache ta tuque, magasiner, c’est de valeur), Belgium (avoir une brique dans le ventre, il drache, tirer son plan), Switzerland (ça joue, être déçu en bien) and Francophone Africa (on est ensemble), backed by accurate cultural context and zero stereotypes.',
    'Le français rayonne bien au-delà de Paris. Explorez les expressions vivantes du Québec (être aux oiseaux, attache ta tuque, magasiner, c’est de valeur), de Belgique (avoir une brique dans le ventre, il drache, tirer son plan), de Suisse romande (ça joue, être déçu en bien) et d’Afrique francophone (on est ensemble), dans le respect de chaque culture.',
  ),
  outcomes: [
    b('Recognise and understand classic Québec emotional, weather and daily-life expressions', 'Comprendre les expressions emblématiques du Québec (émotions, hiver et vie quotidienne)'),
    b('Distinguish false friends between France and Québec French cleanly', 'Éviter les faux amis entre français de France et français québécois'),
    b('Decode hallmark Belgian, Swiss and West/Central African French idioms accurately', 'Décoder les tournures authentiques de Belgique, de Suisse romande et d’Afrique francophone'),
  ],
};

const C = 'exp-quebec-francophonie';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['quebec-classics', 'classiques-du-quebec'],
    b('Québec Classics: Joy, Winter & Grit', 'Classiques du Québec : joie, hiver et courage'),
    b('Discover five celebrated Québec idioms expressing joy, bracing for surprise, perseverance, romance and bitter cold.', 'Découvrir cinq expressions québécoises célèbres pour dire la joie, l’élan, la ténacité, l’amour et le grand froid.'),
    [
      b('Understand five flagship Québec expressions in context', 'Comprendre cinq expressions phares du Québec en contexte'),
      b('Appreciate the climate and historical roots of Québec French', 'Saisir les racines climatiques et historiques du français québécois'),
      b('Use Québec classics naturally when listening or speaking', 'Reconnaître et réutiliser ces tournures avec justesse'),
    ],
    13,
    [
      card(
        b('Warmth & winter in Québec idioms', 'Chaleur humaine et hiver québécois'),
        b(
          'Québec French combines rich maritime and Old French heritage with colourful metaphors shaped by northern winters and lively community spirit. You hear these expressions every day on Radio-Canada, in cafés and at work.\nJoy & romance: **être aux oiseaux, tomber en amour**.\nGrit & cold: **attache ta tuque, lâche pas la patate, il fait frette**.',
          'Le français québécois unit un riche héritage ancien à des images colorées nées de l’hiver nordique et d’une grande chaleur sociale. On les entend chaque jour à Radio-Canada, au travail et en famille.\nJoie et élan du cœur : **être aux oiseaux, tomber en amour**.\nCourage et hiver : **attache ta tuque, lâche pas la patate, il fait frette**.',
        ),
        {
          table: {
            head: [b('Québec idiom', 'Expression québécoise'), b('France equivalent', 'Équivalent en France'), b('Meaning', 'Sens')],
            rows: [
              ['être aux oiseaux', 'être aux anges / ravi', b('to be over the moon', 'être extrêmement heureux')],
              ['attache ta tuque', 'accroche-toi bien', b('hold on tight (intense ride ahead)', 'prépare-toi, ça va décoiffer')],
              ['lâche pas la patate', 'ne baisse pas les bras', b('don’t give up / hang in there', 'n’abandonne pas, tiens bon')],
              ['tomber en amour', 'tomber amoureux / amoureuse', b('to fall in love', 'éprouver un coup de foudre')],
              ['il fait frette', 'il fait un froid glacial', b('it’s freezing cold', 'il gèle, il fait très froid')],
            ],
          },
          ex: [
            ['Depuis qu’elle a eu sa bourse à Sherbrooke, elle est vraiment aux oiseaux !', 'Ever since she got her scholarship in Sherbrooke, she’s been over the moon!'],
            ['Attache ta tuque avec de la broche : le mois de novembre va être intense au bureau.', 'Hold onto your winter hat: November is going to be intense at the office.'],
            ['Sors ton gros manteau, il fait frette ce matin à Montréal !', 'Get your heavy coat out, it’s freezing cold this morning in Montréal!'],
          ],
        },
      ),
      culture(
        b('Legitimate regional variety, not “broken French”', 'Une variété légitime, pas un « mauvais français »'),
        b(
          'Expressions like **il fait frette** (which preserves an old pronunciation of *froid*), **une tuque** (a knitted winter hat), and **tomber en amour** (standard in Québec dictionaries such as *Usito*) are authentic pillars of Québec culture—not errors. Knowing them shows deep respect for the wider French-speaking world and helps enormously in TEFAQ and TCF Canada listening.',
          'Des mots comme **frette** (hérité d’une prononciation ancienne de *froid*), **la tuque** (le bonnet d’hiver) ou **tomber en amour** (attesté comme usuel au Québec dans le dictionnaire *Usito*) appartiennent pleinement au patrimoine québécois, jamais à une « faute ». Les maîtriser est un atout précieux pour le TEFAQ et le TCF Canada.',
        ),
      ),
      flash(
        b('Five Québec classics', 'Cinq classiques du Québec'),
        [
          ['être aux oiseaux', b('to be over the moon (Québec)', 'être ravi, aux anges (Québec)')],
          ['attache ta tuque', b('hold on tight / brace yourself (Québec)', 'accroche-toi bien, ça va bouger (Québec)')],
          ['lâche pas la patate', b('don’t give up / keep going (Québec)', 'ne lâche rien, courage (Québec)')],
          ['tomber en amour', b('to fall in love (Québec)', 'tomber amoureux ou amoureuse (Québec)')],
          ['il fait frette', b('it’s freezing cold (Québec)', 'il fait un froid glacial (Québec)')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('Hang in there and don’t give up during exam week.', 'Tiens bon et n’abandonne pas pendant la semaine d’examens.'),
          b('Stop peeling potatoes for tonight’s soup.', 'Arrête d’éplucher des pommes de terre pour ce soir.'),
          b('Put on a warmer wool hat before leaving.', 'Mets un bonnet de laine plus chaud avant de partir.'),
          b('Turn down the heating in the apartment.', 'Baisse le chauffage dans l’appartement.'),
        ],
        {
          fr: 'Un ami de Québec vous écrit avant votre soutenance : « Dernière ligne droite, lâche pas la patate ! »',
          explain: b('Lâche pas la patate is a warm Québec encouragement meaning “don’t give up!”.', 'Lâche pas la patate est un encouragement québécois chaleureux signifiant « n’abandonne pas ! ».'),
        },
      ),
      mc(
        P.best,
        [
          'Il est tombé en amour avec le fleuve Saint-Laurent dès son premier voyage.',
          'Il fait frette avec le fleuve Saint-Laurent dès son premier voyage.',
          'Il a attaché sa tuque avec le fleuve Saint-Laurent dès son premier voyage.',
          'Il a lâché la patate avec le fleuve Saint-Laurent dès son premier voyage.',
        ],
        {
          fr: 'Comment un Québécois dirait-il qu’il a eu un coup de foudre immédiat pour une région ?',
          explain: b('Tomber en amour can refer to a person, a city or a landscape.', 'Tomber en amour s’emploie aussi bien pour une personne que pour une ville ou un paysage.'),
        },
      ),
      pairs(
        P.match,
        [
          ['être aux oiseaux', b('to be delighted / over the moon', 'être très heureux, ravi')],
          ['attache ta tuque', b('brace yourself / hold on tight', 'accroche-toi, ça va être intense')],
          ['lâche pas la patate', b('don’t give up / hang in there', 'ne baisse pas les bras')],
          ['tomber en amour', b('to fall in love', 'tomber amoureux')],
          ['il fait frette', b('it is freezing cold', 'il fait très froid')],
        ],
      ),
      gap(
        P.complete,
        'Mets tes gants avant de sortir, ___ ce matin ! Mais garde le sourire et ___, la fin de session arrive vite.',
        [['il fait frette'], ['lâche pas la patate']],
        {
          choices: [
            ['il fait frette', 'il est aux oiseaux', 'il tombe en amour'],
            ['lâche pas la patate', 'attache ta tuque', 'est aux oiseaux'],
          ],
          explain: b('Severe cold calls for il fait frette, and encouraging a student through finals calls for lâche pas la patate.', 'Le grand froid s’exprime par il fait frette, et l’encouragement par lâche pas la patate.'),
        },
      ),
      hear(
        'Quand Marc-Antoine a reçu sa lettre d’admission à l’Université Laval, il était littéralement aux oiseaux — et je pense même qu’il est tombé en amour avec la ville dès le premier jour.',
        b('How did Marc-Antoine react to moving to Québec City?', 'Comment Marc-Antoine a-t-il réagi à son admission à Québec ?'),
        [
          b('He was thrilled and fell in love with the city right away.', 'Il était ravi et est tombé amoureux de la ville dès le début.'),
          b('He complained about the freezing cold all winter.', 'Il s’est plaint du froid glacial tout l’hiver.'),
          b('He almost gave up before receiving the letter.', 'Il a failli abandonner avant de recevoir la lettre.'),
          b('He bought a warm hat before leaving Montréal.', 'Il a acheté une tuque chaude avant de quitter Montréal.'),
        ],
      ),
      dict('Attache ta tuque, il fait frette dehors, mais je suis aux oiseaux de te revoir !', {
        hint: b('Watch tuque and frette—both standard spellings in Québec French.', 'Vérifiez l’orthographe de tuque et frette.'),
      }),
      say(
        'Il fait frette aujourd’hui, alors attache ta tuque et lâche pas la patate !',
        'It’s freezing today, so hold on tight and don’t give up!',
      ),
    ],
    [
      b('être aux oiseaux = delighted; tomber en amour = fall in love.', 'être aux oiseaux = ravi ; tomber en amour = tomber amoureux.'),
      b('attache ta tuque = brace yourself; lâche pas la patate = hang in there.', 'attache ta tuque = accroche-toi ; lâche pas la patate = ne baisse pas les bras.'),
      b('il fait frette = it’s freezing cold (genuine Québec expression, not a mistake).', 'il fait frette = il fait très froid (tournure québécoise authentique).'),
    ],
    [
      ['être aux oiseaux', b('to be over the moon (Québec)', 'être ravi, très heureux (Québec)')],
      ['attache ta tuque', b('hold on tight / brace yourself (Québec)', 'accroche-toi bien (Québec)')],
      ['lâche pas la patate', b('don’t give up (Québec)', 'tiens bon, n’abandonne pas (Québec)')],
      ['tomber en amour', b('to fall in love (Québec)', 'tomber amoureux ou amoureuse (Québec)')],
      ['il fait frette', b('it’s freezing cold (Québec)', 'il fait très froid (Québec)')],
    ],
  ),

  lesson(
    C,
    2,
    ['quebec-daily-life', 'quotidien-au-quebec'],
    b('Québec Daily Life & False Friends', 'Vie quotidienne au Québec et faux amis'),
    b('Use everyday Québec expressions for anticipation, shopping, hitchhiking, going for a walk and expressing regret without misreading them.', 'Employer les tournures québécoises du quotidien (impatience, achats, auto-stop, promenade, regret) sans contresens.'),
    [
      b('Use magasiner, faire du pouce and prendre une marche naturally', 'Employer magasiner, faire du pouce et prendre une marche naturellement'),
      b('Avoid the classic false friend c’est de valeur (= c’est dommage)', 'Éviter le faux ami c’est de valeur (= quel dommage)'),
      b('Handle avoir hâte à vs avoir hâte de cleanly', 'Maîtriser avoir hâte de / avoir hâte à selon le contexte'),
    ],
    13,
    [
      card(
        b('Everyday actions & feelings in Québec', 'Actions et émotions du quotidien au Québec'),
        b(
          'In Québec, everyday verbs and polite reactions often differ delightfully from European French—and **c’est de valeur** catches nearly every newcomer off guard on first hearing.\nActions: **magasiner, faire du pouce, prendre une marche**.\nReactions & anticipation: **avoir hâte, c’est de valeur**.',
          'Au Québec, plusieurs verbes du quotidien et réactions courantes diffèrent agréablement du français européen — et **c’est de valeur** surprend presque tous les nouveaux arrivants.\nActions : **magasiner, faire du pouce, prendre une marche**.\nAttente et regret : **avoir hâte, c’est de valeur**.',
        ),
        {
          table: {
            head: [b('Québec expression', 'Expression au Québec'), b('European French', 'Français d’Europe'), b('Meaning', 'Sens')],
            rows: [
              ['avoir hâte', 'avoir très envie / être impatient', b('to look forward to / can’t wait', 'attendre avec impatience')],
              ['magasiner', 'faire les magasins / du shopping', b('to go shopping / shop around', 'parcourir les boutiques, comparer')],
              ['faire du pouce', 'faire de l’auto-stop', b('to hitchhike', 'demander un trajet en voiture')],
              ['prendre une marche', 'faire une promenade à pied', b('to go for a walk', 'se promener à pied')],
              ['c’est de valeur', 'c’est dommage / quel dommage', b('that’s a pity / too bad', 'c’est regrettable')],
            ],
          },
          ex: [
            ['J’ai vraiment hâte aux vacances d’été en Gaspésie !', 'I’m really looking forward to summer holidays in Gaspésie!'],
            ['Dimanche après-midi, on va prendre une marche au parc du Mont-Royal.', 'Sunday afternoon, we’re going for a walk in Mount Royal Park.'],
            ['Le musée ferme justement aujourd’hui ? Ah, c’est vraiment de valeur !', 'The museum happens to be closed today? Oh, that’s really a shame!'],
          ],
        },
      ),
      trap(
        b('False friend alert: c’est de valeur means “what a pity”!', 'Faux ami : c’est de valeur veut dire « c’est dommage » !'),
        b(
          'Never translate **c’est de valeur** as “it’s valuable”! In Québec, **c’est de valeur** means **c’est dommage** (*what a shame*). Note also **magasiner**: besides clothes shopping, people say *magasiner un forfait téléphonique* (shop around for a phone plan). Finally, Québec speakers often use **avoir hâte à + noun** (*j’ai hâte à vendredi*) alongside standard **avoir hâte de + infinitive**.',
          'Ne traduisez jamais **c’est de valeur** par « cela a de la valeur » ! Au Québec, **c’est de valeur** signifie **c’est dommage**. Notez aussi **magasiner** : on magasine des vêtements, mais aussi un forfait ou une hypothèque (comparer les offres). Enfin, on entend souvent **avoir hâte à + nom** (*j’ai hâte à demain*) en plus d’**avoir hâte de + infinitif**.',
        ),
      ),
      flash(
        b('Five Québec daily-life expressions', 'Cinq expressions du quotidien québécois'),
        [
          ['avoir hâte', b('to look forward to / can’t wait', 'être impatient de quelque chose')],
          ['magasiner', b('to go shopping / shop around (Québec)', 'faire les magasins ou comparer des offres (Québec)')],
          ['faire du pouce', b('to hitchhike (Québec)', 'faire de l’auto-stop (Québec)')],
          ['prendre une marche', b('to go for a walk (Québec)', 'faire une promenade à pied (Québec)')],
          ['c’est de valeur', b('that’s a pity / what a shame (Québec)', 'c’est dommage (Québec)')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('What a shame that you have to leave the party so early!', 'Quel dommage que tu doives partir de la fête si tôt !'),
          b('Your early departure is very valuable for our budget.', 'Ton départ rapide a une grande valeur financière.'),
          b('You should take a quick walk before heading home.', 'Tu devrais faire une petite marche avant de rentrer.'),
          b('Everyone is looking forward to tomorrow’s concert.', 'Tout le monde attend le concert de demain avec impatience.'),
        ],
        {
          fr: '« Tu dois déjà partir avant le dessert ? Ah non, c’est ben de valeur ! »',
          explain: b('C’est de valeur (often intensified as c’est ben de valeur) means “that’s such a shame / pity”.', 'C’est de valeur exprime le regret : « c’est vraiment dommage ».'),
        },
      ),
      mc(
        P.best,
        [
          'Il fait beau : on va prendre une marche le long du canal Lachine, puis magasiner un manteau ?',
          'Il fait beau : on va faire du pouce le long du salon, puis c’est de valeur ?',
          'Il fait beau : on va attacher sa tuque pour magasiner de valeur ?',
          'Il fait beau : on va avoir hâte au pouce dans le parc ?',
        ],
        {
          fr: 'À Montréal, vous proposez à un ami de vous promener dehors puis de faire des achats :',
          explain: b('Prendre une marche = go for a walk; magasiner = go shopping.', 'Prendre une marche signifie se promener, et magasiner signifie faire les boutiques.'),
        },
      ),
      sort(
        b('Sort each Québec expression by category.', 'Classez chaque expression québécoise selon sa catégorie.'),
        [b('Everyday activity', 'Activité du quotidien'), b('Emotion or reaction', 'Émotion ou réaction')],
        [
          ['magasiner', 0],
          ['avoir hâte', 1],
          ['faire du pouce', 0],
          ['c’est de valeur', 1],
          ['prendre une marche', 0],
          ['être aux oiseaux', 1],
        ],
      ),
      gap(
        P.complete,
        'J’ai vraiment ___ d’aller ___ sur la rue Saint-Jean avec toi, mais si la boutique est fermée ce sera vraiment de ___.',
        ['hâte', 'magasiner', 'valeur'],
        {
          tr: 'I’m really looking forward to going shopping on Rue Saint-Jean with you, though if the shop is closed it’ll really be a shame.',
          hint: b('Three single words: avoir ___, verb for shopping, and c’est de ___.', 'Trois mots simples : avoir ___, verbe québécois pour faire les boutiques, et c’est de ___.'),
        },
      ),
      ord(
        P.order,
        'Après le souper, nous sommes sortis prendre une marche dans le quartier.',
        {
          tr: 'After dinner, we went out for a walk in the neighbourhood.',
          extra: ['pouce', 'magasiner'],
          explain: b('Notice souper (evening meal in Québec) + prendre une marche (go for a walk).', 'Notez souper (repas du soir au Québec) suivi de prendre une marche.'),
        },
      ),
      hear(
        'Quand j’étais étudiante en Gaspésie, on faisait parfois du pouce l’été pour rejoindre la plage, et j’avais tellement hâte de retrouver mes amis le soir.',
        b('How did she get to the beach in summer?', 'Comment allait-elle à la plage l’été ?'),
        [
          b('She sometimes hitchhiked there.', 'Elle faisait parfois de l’auto-stop.'),
          b('She shopped for a new bicycle every July.', 'Elle magasinait un vélo chaque mois de juillet.'),
          b('She walked three hours alone because buses stopped.', 'Elle marchait trois heures seule faute de bus.'),
          b('She stayed indoors because it was freezing cold.', 'Elle restait à l’intérieur à cause du grand froid.'),
        ],
        { voice: 'f2' },
      ),
      say(
        'J’ai vraiment hâte de prendre une marche avec toi ce week-end ; s’il pleut, ce sera de valeur !',
        'I’m really looking forward to going for a walk with you this weekend; if it rains, it’ll be a shame!',
      ),
    ],
    [
      b('c’est de valeur = what a pity / too bad (never “it has value”).', 'c’est de valeur = c’est dommage (faux ami fréquent).'),
      b('magasiner = go shopping / shop around; prendre une marche = go for a walk; faire du pouce = hitchhike.', 'magasiner = faire les magasins ; prendre une marche = se promener ; faire du pouce = faire de l’auto-stop.'),
      b('avoir hâte (de / à) = look forward eagerly to something.', 'avoir hâte (de / à) = attendre avec impatience.'),
    ],
    [
      ['avoir hâte', b('to look forward to / can’t wait', 'être impatient de')],
      ['magasiner', b('to go shopping / shop around (Québec)', 'faire les magasins, comparer des offres (Québec)')],
      ['faire du pouce', b('to hitchhike (Québec)', 'faire de l’auto-stop (Québec)')],
      ['prendre une marche', b('to go for a walk (Québec)', 'faire une promenade à pied (Québec)')],
      ['c’est de valeur', b('that’s a pity / shame (Québec)', 'c’est dommage (Québec)')],
    ],
  ),

  lesson(
    C,
    3,
    ['belgium-switzerland-francophonie', 'belgique-suisse-et-francophonie'],
    b('Belgium, Switzerland & the Francophone World', 'Belgique, Suisse et Francophonie vivante'),
    b('Understand signature idioms from Belgium, Switzerland and West & Central Francophone Africa with cultural precision.', 'Comprendre les expressions emblématiques de Belgique, de Suisse romande et d’Afrique francophone avec justesse culturelle.'),
    [
      b('Understand iconic Belgian idioms (avoir une brique dans le ventre, il drache, tirer son plan)', 'Comprendre les belgicismes célèbres (avoir une brique dans le ventre, il drache, tirer son plan)'),
      b('Recognise Swiss Romand classics (ça joue, être déçu en bien) and African solidarity (on est ensemble)', 'Reconnaître helvétismes (ça joue, être déçu en bien) et solidarité africaine (on est ensemble)'),
      b('Write a nuanced comparative guide to Francophone idioms', 'Rédiger une note culturelle comparée sur les expressions francophones'),
    ],
    13,
    [
      card(
        b('Brussels, Geneva, Abidjan: one language, many colours', 'Bruxelles, Genève, Abidjan : une langue plurielle'),
        b(
          'Across Belgium, Switzerland and Francophone Africa, French carries proud local idioms reflecting architecture, weather, resourcefulness and solidarity. In **Switzerland**, you will also hear **être déçu en bien** (pleasantly surprised) and **tenir les pouces** (wish luck).\nBelgium: **avoir une brique dans le ventre, il drache, tirer son plan**.\nSwitzerland & Africa: **ça joue, on est ensemble**.',
          'De la Belgique à la Suisse et à l’Afrique francophone, le français se teinte d’expressions locales fières reflétant habitat, météo, débrouillardise et fraternité. En **Suisse romande**, on dit aussi **être déçu en bien** (agréablement surpris) et **tenir les pouces** (croiser les doigts).\nBelgique : **avoir une brique dans le ventre, il drache, tirer son plan**.\nSuisse et Afrique francophone : **ça joue, on est ensemble**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Region', 'Région'), b('Meaning', 'Sens')],
            rows: [
              ['avoir une brique dans le ventre', b('Belgium', 'Belgique'), b('to be keen on owning/building a house', 'rêver d’acheter ou bâtir sa maison')],
              ['il drache', b('Belgium / N. France', 'Belgique / Nord'), b('it’s pouring with rain', 'il pleut à verse')],
              ['tirer son plan', b('Belgium', 'Belgique'), b('to manage on one’s own / figure it out', 'se débrouiller seul')],
              ['ça joue', b('Switzerland', 'Suisse romande'), b('all good / that works / sounds good', 'ça va, d’accord, tout est bon')],
              ['on est ensemble', b('W. & C. Africa', 'Afrique francophone'), b('we’re with you / solidarity / see you', 'solidarité, soutien, à bientôt')],
            ],
          },
          ex: [
            ['Prends un parapluie à Bruxelles : il drache depuis ce matin !', 'Take an umbrella in Brussels: it’s been pouring since this morning!'],
            ['On se retrouve à la gare de Lausanne à 18 h ? — Ça joue !', 'Shall we meet at Lausanne station at 6 p.m.? — Works for me!'],
            ['Ne baisse pas les bras pour ton concours, on est ensemble !', 'Don’t give up on your exam, we’re right behind you!'],
          ],
        },
      ),
      culture(
        b('Respecting regional origins without mixing them up', 'Respecter l’origine exacte de chaque expression'),
        b(
          'Avoid attributing a Belgian, Swiss, Québec or African idiom to the wrong country! For instance, **il drache** and **tirer son plan** belong to Belgium (Wallonia & Brussels), **ça joue**, **tenir les pouces** and **être déçu en bien** belong to Romandy (French-speaking Switzerland), while **on est ensemble** radiates from West and Central Africa (Abidjan, Dakar, Douala, Kinshasa) to mean warm solidarity and support.',
          'Évitez de confondre les provenances ! **Il drache** et **tirer son plan** sont belges (Wallonie et Bruxelles) ; **ça joue**, **tenir les pouces** et **être déçu en bien** appartiennent à la Suisse romande ; **on est ensemble**, né en Afrique francophone (Abidjan, Dakar, Douala, Kinshasa), exprime soutien fraternel et solidarité.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('Belgians place great importance on buying or building their own home.', 'Les Belges accordent une grande importance à l’achat ou à la construction de leur maison.'),
          b('Belgian restaurants serve very heavy bread.', 'Les restaurants belges servent un pain très lourd.'),
          b('People in Brussels complain constantly about rain.', 'Les Bruxellois se plaignent sans arrêt de la pluie.'),
          b('Belgian architects refuse to use wooden beams.', 'Les architectes belges refusent d’utiliser du bois.'),
        ],
        {
          fr: '« On dit souvent en souriant que les Belges ont une brique dans le ventre. »',
          explain: b('Avoir une brique dans le ventre is an affectionate Belgian idiom describing the strong desire to own or build a home.', 'Avoir une brique dans le ventre exprime l’attachement culturel à la propriété et à la construction immobilière en Belgique.'),
        },
      ),
      pairs(
        P.match,
        [
          ['avoir une brique dans le ventre', b('to dream of owning/building a home (Belgium)', 'rêver d’acheter ou bâtir sa maison (Belgique)')],
          ['il drache', b('it’s pouring rain (Belgium)', 'il pleut très fort (Belgique)')],
          ['tirer son plan', b('to fend for oneself / manage (Belgium)', 'se débrouiller seul (Belgique)')],
          ['ça joue', b('all good / works for me (Switzerland)', 'ça marche, ça va (Suisse)')],
          ['on est ensemble', b('I’ve got your back / solidarity (Africa)', 'soutien et solidarité (Afrique francophone)')],
        ],
      ),
      hear(
        'À Genève, quand j’ai accepté l’horaire de la réunion en disant « d’accord », mon collègue m’a répondu en souriant : « Parfait, ça joue ! » Et il m’a assuré qu’on avait été déçus en bien par le nouveau logiciel.',
        b('What did her Geneva colleague mean by « ça joue » and « déçus en bien »?', 'Qu’a voulu dire son collègue genevois par « ça joue » et « déçus en bien » ?'),
        [
          b('The schedule works, and the software turned out pleasantly better than expected.', 'L’horaire convient et le logiciel s’est révélé bien meilleur que prévu.'),
          b('Everyone disliked the software and cancelled the meeting.', 'Tout le monde a détesté le logiciel et annulé la réunion.'),
          b('He wanted to play a quick game before starting work.', 'Il voulait jouer à un jeu rapide avant de travailler.'),
          b('He was deeply disappointed by the final test results.', 'Il a été très déçu par les résultats du test.'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Four friends planning a Francophone week', 'Quatre amis préparent une semaine francophone'),
        b('Léa (Brussels) and Yannick (Geneva) coordinate an intercultural panel with friends.', 'Léa (Bruxelles) et Yannick (Genève) préparent une table ronde francophone.'),
        [['Léa', 'f'], ['Yannick', 'm']],
        [
          [0, 'Salut Yannick ! Il drache tellement sur Bruxelles aujourd’hui que j’ai failli prendre le tram deux fois pour rien.', 'Hi Yannick! It’s pouring so hard in Brussels today that I almost took the tram twice for nothing.'],
          [1, {
            options: [
              'Ici à Lausanne il fait sec ! Pour notre programme de vendredi à 14 h, ça joue toujours pour toi ?',
              'Oui, il faut tirer ton parapluie dans le ventre.',
              'Ne t’inquiète pas, c’est de valeur pour la pluie.',
            ],
            explain: b('Ça joue? is the natural Swiss Romand way to ask “does that still work / is everything OK?”.', 'Ça joue ? est l’expression romande usuelle pour demander « ça te convient / tout va bien ? ».'),
          }],
          [0, 'Oui, ça joue parfaitement ! Et comme dit notre ami Moussa à Abidjan quand on se motive avant une conférence : « On est ensemble ! »', 'Yes, works perfectly! And as our friend Moussa in Abidjan says when we motivate each other before a talk: “We’re in this together!”'],
          [1, {
            options: [
              'J’adore cette formule ! Et pour le matériel technique, ne t’en fais pas, on va tirer notre plan sur place.',
              'J’ai une brique dans le ventre pour le projecteur.',
              'Attache ta tuque, il fait frette à Abidjan.',
            ],
          }],
          [0, 'Génial, je suis sûre que le public va être déçu en bien par la richesse de toutes ces variétés de français.', 'Awesome, I’m sure the audience will be pleasantly surprised by how rich all these varieties of French are.'],
        ],
      ),
      dict('À Bruxelles, même quand il drache fort, on tire son plan avec le sourire.', {
        voice: 'm2',
        hint: b('Watch drache (Belgian verb dracher) and tirer son plan.', 'Vérifiez drache et tirer son plan.'),
      }),
      write(
        b('A passport to Francophone idioms', 'Passeport pour les expressions francophones'),
        b('Write 60–110 words for a student travelling across Québec, Belgium, Switzerland and West Africa: compare at least four idioms from different regions of this course, explain their real meanings accurately, and note one false friend or cultural nuance to remember.', 'Rédigez 60 à 110 mots pour un étudiant qui voyage entre le Québec, la Belgique, la Suisse et l’Afrique de l’Ouest : comparez au moins quatre expressions de régions différentes vues dans ce cours, précisez leur sens réel et signalez un faux ami ou une nuance culturelle.'),
        60,
        110,
        [
          b('At least four idioms across three or more Francophone regions', 'Au moins quatre expressions issues d’au moins trois régions francophones'),
          b('Accurate regional attribution and clear explanation', 'Attribution régionale exacte et sens clairement expliqué'),
          b('Mention of one false friend or cultural insight', 'Mention d’un faux ami ou d’une nuance culturelle précise'),
        ],
        'Voyager en français réserve de belles découvertes linguistiques. À Montréal, si un ami vous dit « c’est de valeur », il ne parle pas d’argent : il veut simplement dire « c’est dommage ». Quand il fait frette l’hiver, on peut tout de même prendre une marche bien emmitouflé. En Belgique, s’il drache dehors, chacun tire son plan sans se plaindre. En Suisse romande, on valide un rendez-vous d’un simple « ça joue ! ». Enfin, en Afrique francophone, « on est ensemble » rappelle avec chaleur que la solidarité passe aussi par les mots.',
        {
          phrases: ['c’est de valeur', 'il drache', 'ça joue', 'on est ensemble'],
        },
      ),
    ],
    [
      b('Belgium: avoir une brique dans le ventre, il drache, tirer son plan.', 'Belgique : avoir une brique dans le ventre, il drache, tirer son plan.'),
      b('Switzerland: ça joue (all good / works), être déçu en bien (pleasantly surprised), tenir les pouces.', 'Suisse : ça joue, être déçu en bien, tenir les pouces.'),
      b('Francophone Africa: on est ensemble expresses solidarity, support and warm connection.', 'Afrique francophone : on est ensemble exprime solidarité, soutien et fraternité.'),
    ],
    [
      ['avoir une brique dans le ventre', b('to dream of owning/building a house (Belgium)', 'rêver d’acheter ou bâtir sa maison (Belgique)')],
      ['il drache', b('it’s pouring with rain (Belgium)', 'il pleut à verse (Belgique)')],
      ['tirer son plan', b('to manage on one’s own (Belgium)', 'se débrouiller seul (Belgique)')],
      ['ça joue', b('all good / works for me (Switzerland)', 'ça va, d’accord (Suisse romande)')],
      ['on est ensemble', b('we’re in this together / solidarity (Africa)', 'soutien et solidarité (Afrique francophone)')],
    ],
  ),
];

export default lessons;
