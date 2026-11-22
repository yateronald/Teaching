import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Il faut partir, il vaut mieux réserver, il reste deux places. Impersonal verbs always keep the subject il—which never refers to a person—and allow you to express necessity, advice, what is left or missing, weather and time cleanly. This course unpacks il faut and its negative trap, everyday expressions like il s’agit de and il manque, and the difference between il fait, il y a and il est.',
    'Il faut partir, il vaut mieux réserver, il reste deux places. Les verbes impersonnels gardent toujours un il neutre et permettent d’exprimer la nécessité, le conseil, le manque, la météo et l’heure avec naturel. Ce cours décrypte il faut et son piège négatif, les tournures courantes comme il s’agit de ou il reste, et le trio il fait / il y a / il est.',
  ),
  outcomes: [
    b('Use il faut + noun, + infinitive, or + que, and avoid the il ne faut pas trap', 'Employer il faut + nom, + infinitif ou + que, et éviter le piège d’il ne faut pas'),
    b('Express advice, remainder, shortage and topic with il vaut mieux, il reste, il manque, il s’agit de', 'Exprimer le conseil, le reste, le manque et le sujet avec il vaut mieux, il reste, il manque, il s’agit de'),
    b('Distinguish il fait, il y a and il est for weather, time and general statements', 'Distinguer il fait, il y a et il est pour la météo, l’heure et les avis généraux'),
  ],
};

const C = 'gr-impersonal-verbs';

const lessons: Lesson[] = [
  lesson(C, 1, ['il-faut-necessity', 'il-faut-obligation'],
    b('Il faut: noun, infinitive, que — and il ne faut pas', 'Il faut : nom, infinitif, que — et il ne faut pas'),
    b('Express needs and obligations in every tense, and learn why il ne faut pas means "must not".', 'Exprimer le besoin et l’obligation à tous les temps, et maîtriser le sens de il ne faut pas.'),
    [
      b('Build all three patterns after il faut (+ noun, + infinitive, + que)', 'Construire les trois structures après il faut (+ nom, + infinitif, + que)'),
      b('Contrast il ne faut pas (must not) with tu n’es pas obligé de (don’t have to)', 'Distinguer il ne faut pas (interdiction) de ne pas être obligé de (absence d’obligation)'),
      b('Conjugate falloir in past and future (il fallait, il a fallu, il faudra)', 'Conjuguer falloir au passé et au futur (il fallait, il a fallu, il faudra)'),
    ],
    13,
    [
      card(
        b('Three ways to use il faut', 'Les trois emplois de il faut'),
        b(
          'The verb **falloir** exists only with **il**: **il faut** (present), **il fallait** (imparfait), **il a fallu** (passé composé), **il faudra** (future). Follow it with a **noun** ("need"), a bare **infinitive** (general rule), or **que + subjunctive** (for a specific person).\n\nIl faut + noun: **il faut du temps, il faut un billet, il faut de la patience**.\nIl faut + infinitive: **il faut partir tôt, il faut réserver, il faut faire attention**.\nIl faut que + person: **il faut que tu viennes, il faut qu’on parte, il faut que vous soyez prêts**.',
          'Le verbe **falloir** n’existe qu’à la 3e personne neutre : **il faut** (présent), **il fallait** (imparfait), **il a fallu** (passé composé), **il faudra** (futur). On le fait suivre d’un **nom** (besoin), d’un **infinitif** sans préposition (règle générale) ou de **que + subjonctif** (pour une personne précise).\n\nIl faut + nom : **il faut du temps, il faut un billet, il faut de la patience**.\nIl faut + infinitif : **il faut partir tôt, il faut réserver, il faut faire attention**.\nIl faut que + personne : **il faut que tu viennes, il faut qu’on parte, il faut que vous soyez prêts**.',
        ),
        {
          table: {
            head: [b('Pattern', 'Structure'), b('Example', 'Exemple'), b('Meaning', 'Sens')],
            rows: [
              ['il faut + noun', 'Il faut un passeport.', b('You need a passport.', 'On a besoin d’un passeport.')],
              ['il faut + infinitive', 'Il faut écouter.', b('One must / we have to listen.', 'On doit écouter.')],
              ['il faut que + subjunctive', 'Il faut que je parte.', b('I have to leave.', 'Je dois partir.')],
              ['il a fallu / il faudra', 'Il faudra attendre.', b('We will have to wait.', 'On devra attendre.')],
            ],
          },
          ex: [
            ['Pour faire une omelette, il faut trois œufs et un peu de beurre.', 'To make an omelette, you need three eggs and a little butter.'],
            ['Il a fallu réparer la porte avant l’hiver.', 'We had to repair the door before winter.'],
          ],
        },
      ),
      trap(
        b('Il ne faut pas = must NOT, never "don’t have to"!', 'Il ne faut pas = interdiction, jamais « pas obligé » !'),
        b(
          'Beware of a huge English/French false friend: **Il ne faut pas** means **must not** (prohibition or strong warning), NEVER *"don’t have to"*! If something is optional, say **Ce n’est pas nécessaire**, **Tu n’es pas obligé(e) de**, or **On n’a pas besoin de**. And never insert `de` or `à` between **il faut** and the infinitive!\n\nProhibition (must not): **Il ne faut pas fumer, Il ne faut pas courir, Il ne faut pas oublier**.\nOptional (don’t have to): **Tu n’es pas obligé de venir, Ce n’est pas nécessaire d’imprimer, On n’a pas besoin d’attendre**.',
          'Attention au contresens classique : **Il ne faut pas** exprime une **interdiction** ou une mise en garde forte, jamais une dispense ! Si quelque chose n’est pas obligatoire, dites **Ce n’est pas nécessaire**, **Tu n’es pas obligé(e) de** ou **On n’a pas besoin de**. Et n’ajoutez jamais `de` ni `à` après **il faut** !\n\nInterdiction : **Il ne faut pas fumer, Il ne faut pas courir, Il ne faut pas oublier**.\nPas d’obligation : **Tu n’es pas obligé de venir, Ce n’est pas nécessaire d’imprimer, On n’a pas besoin d’attendre**.',
        ),
      ),
      mc(P.meaning, [b('You must not park here', 'Il est interdit de se garer ici'), b('You don’t need to park here', 'Vous n’êtes pas obligé de vous garer ici'), b('You may park here for free', 'Vous pouvez vous garer ici gratuitement')], {
        fr: 'Il ne faut pas se garer devant cette sortie.',
      }),
      mc(P.form, ['partir', 'de partir', 'à partir', 'pour partir'], {
        fr: 'Le train est à huit heures : il faut ___ maintenant.',
      }),
      gap(P.complete, 'Hier soir, il ___ (falloir, passé composé) appeler un serrurier. Demain, il ___ (falloir, futur) acheter des piles, et n’oublie pas : tu ___ (ne pas être obligé) d’apporter un dessert.', [['a fallu'], ['faudra'], ['n’es pas obligé']], {
        choices: [['a fallu', 'faut', 'faudra'], ['faudra', 'faut', 'fallait'], ['n’es pas obligé', 'ne faut pas']],
      }),
      ord(P.order, 'Il ne faut pas oublier de fermer la fenêtre.', {
        tr: 'We mustn’t forget to close the window.',
        extra: ['à', 'devons'],
      }),
      sort(
        b('Prohibition (must not) or optional (no need)?', 'Interdiction (il ne faut pas) ou dispense (pas obligatoire) ?'),
        [b('Must NOT (prohibition / warning)', 'Interdiction / mise en garde'), b('Don’t HAVE to (optional)', 'Pas obligatoire / facultatif')],
        [['Il ne faut pas toucher ce fil.', 0], ['Tu n’es pas obligé de répondre ce soir.', 1], ['Il ne faut pas arriver en retard.', 0], ['Ce n’est pas nécessaire d’apporter une serviette.', 1], ['On n’a pas besoin de réserver pour le déjeuner.', 1]],
      ),
      hear('Pour entrer au musée, il faut montrer son billet, mais il n’est pas nécessaire d’imprimer le reçu : l’écran du téléphone suffit.', b('What does the visitor need to do?', 'Que doit faire le visiteur ?'), [
        b('Show the ticket on their phone; printing is unnecessary', 'Montrer le billet sur son téléphone sans l’imprimer'),
        b('Print two copies of the receipt at home', 'Imprimer deux exemplaires du reçu chez soi'),
        b('Buy a second ticket at the museum entrance', 'Acheter un deuxième billet à l’entrée'),
      ]),
      dict('Il faudra beaucoup de patience, mais il ne faut surtout pas abandonner maintenant.'),
      say('Il faut que je parte tôt demain matin pour attraper le premier bus.', 'I have to leave early tomorrow morning to catch the first bus.'),
    ],
    [
      b('falloir only uses il: il faut, il fallait, il a fallu, il faudra.', 'falloir n’existe qu’avec il : il faut, il fallait, il a fallu, il faudra.'),
      b('Follow il faut directly with a noun, a bare infinitive, or que + subjunctive.', 'il faut est suivi directement d’un nom, d’un infinitif (sans préposition) ou de que + subjonctif.'),
      b('il ne faut pas = must NOT; for "don’t have to", use tu n’es pas obligé de / ce n’est pas nécessaire de.', 'il ne faut pas = interdiction ; pour l’absence d’obligation, dites tu n’es pas obligé de / ce n’est pas nécessaire de.'),
    ],
    [
      ['un serrurier', b('a locksmith', 'un artisan qui ouvre ou répare les serrures')],
      ['un reçu', b('a receipt', 'la preuve d’un paiement')],
      ['abandonner', b('to give up', 'renoncer, arrêter un effort')],
    ],
  ),

  lesson(C, 2, ['il-vaut-mieux-reste-manque', 'il-vaut-mieux-reste-manque'],
    b('Il vaut mieux, il reste, il manque, il s’agit de', 'Il vaut mieux, il reste, il manque, il s’agit de'),
    b('Four high-frequency impersonal verbs to give advice, count what is left, note what is missing, and state what something is about.', 'Quatre verbes impersonnels incontournables pour conseiller, compter ce qui reste, signaler un manque et définir un sujet.'),
    [
      b('Give advice with il vaut mieux / il vaudrait mieux + infinitive', 'Conseiller avec il vaut mieux / il vaudrait mieux + infinitif'),
      b('Keep il reste and il manque singular even before plural nouns', 'Garder il reste et il manque au singulier même devant un nom pluriel'),
      b('Use il s’agit de and il suffit de cleanly with nouns or infinitives', 'Employer il s’agit de et il suffit de avec un nom ou un infinitif'),
    ],
    13,
    [
      card(
        b('Everyday impersonal verbs beyond il faut', 'Les tournures impersonnelles du quotidien'),
        b(
          'Like **il faut**, these expressions ALWAYS keep a singular **il** and a singular verb—even when the noun after them is plural! Say **Il reste trois places** (never « Ils restent ») and **Il manque deux verres** (never « Ils manquent »).\n\nAdvice: **il vaut mieux partir, il vaudrait mieux attendre, il vaut mieux ne pas crier**.\nQuantity left or missing: **il reste deux chaises, il ne reste plus de pain, il manque une signature**.\nTopic or minimum condition: **il s’agit d’un roman, il s’agit de comprendre, il suffit d’appuyer**.',
          'Comme **il faut**, ces tournures gardent TOUJOURS un **il** neutre et un verbe au singulier — même quand le nom qui suit est pluriel ! Dites **Il reste trois places** (jamais « Ils restent ») et **Il manque deux verres**.\n\nConseil : **il vaut mieux partir, il vaudrait mieux attendre, il vaut mieux ne pas crier**.\nReste ou manque : **il reste deux chaises, il ne reste plus de pain, il manque une signature**.\nSujet ou condition : **il s’agit d’un roman, il s’agit de comprendre, il suffit d’appuyer**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Structure', 'Construction'), b('Example', 'Exemple')],
            rows: [
              ['il vaut mieux', b('+ infinitive (bare, no de!)', '+ infinitif sans préposition'), 'Il vaut mieux réserver avant samedi.'],
              ['il reste', b('+ singular or plural noun', '+ nom singulier ou pluriel'), 'Il reste cinq minutes avant le départ.'],
              ['il manque', b('+ singular or plural noun', '+ nom singulier ou pluriel'), 'Il manque deux fourchettes sur la table.'],
              ['il s’agit de', b('+ noun or infinitive', '+ nom ou infinitif'), 'Il s’agit d’un malentendu très simple.'],
              ['il suffit de', b('+ noun or infinitive', '+ nom ou infinitif'), 'Il suffit de cliquer sur ce lien.'],
            ],
          },
          ex: [
            ['Il vaut mieux prendre un parapluie : le ciel devient sombre.', 'It’s better to take an umbrella: the sky is turning dark.'],
            ['Dans ce documentaire, il s’agit de la vie des abeilles.', 'This documentary is about the life of bees.'],
          ],
        },
      ),
      trap(
        b('Watch il vaut mieux (no de!) and il me reste / il me manque', 'Attention à il vaut mieux (sans de !) et à il me reste / il me manque'),
        b(
          'Never insert **de** after **il vaut mieux** unless there’s a comparison (**il vaut mieux partir**, NOT « il vaut mieux de partir »). You can also add **me / te / lui / nous / vous** before **reste** or **manque** to say who has something left or missing: **Il me reste dix euros**, **Il nous manque une clé**. Note the difference from personal **Tu me manques** (*I miss you*), where **tu** is the subject!\n\nNo de after vaut mieux: **il vaut mieux écouter, il vaudrait mieux vérifier, il vaut mieux ne rien dire**.\nWith a pronoun: **il me reste deux jours, il lui manque un timbre, il nous suffit d’une heure**.',
          'Ne mettez jamais **de** juste après **il vaut mieux** : dites **il vaut mieux partir** (et non « il vaut mieux de partir »). Ajoutez **me / te / lui / nous / vous** devant **reste** ou **manque** pour indiquer la personne concernée : **Il me reste dix euros**, **Il nous manque une clé**. Attention : dans **Tu me manques**, le sujet est personnel (**tu**), ce n’est pas une tournure impersonnelle !\n\nSans de : **il vaut mieux écouter, il vaudrait mieux vérifier, il vaut mieux ne rien dire**.\nAvec un pronom : **il me reste deux jours, il lui manque un timbre, il nous suffit d’une heure**.',
        ),
      ),
      mc(P.form, ['reste', 'restent', 'sont restées', 'restes'], {
        fr: 'Regarde dans le panier : il ___ seulement quatre pommes pour la tarte.',
        explain: b('Impersonal il reste ALWAYS stays singular, even before quatre pommes.', 'La tournure impersonnelle il reste reste toujours au singulier.'),
      }),
      mc(P.form, ['mieux prendre', 'mieux de prendre', 'meilleur prendre', 'mieux à prendre'], {
        fr: 'Les routes sont glissantes ce soir ; il vaut ___ le tramway.',
      }),
      gap(P.complete, 'Dans ce film, il ___ (s’agir) d’un chef qui cherche sa recette perdue. Pour entrer en cuisine, il ___ (suffire) d’avoir un tablier, mais ce soir il ___ (manquer) trois assiettes propres.', [['s’agit'], ['suffit'], ['manque']], {
        choices: [['s’agit', 'agit'], ['suffit', 'suffise'], ['manque', 'manquent']],
      }),
      ord(P.order, 'Il vaudrait mieux ne pas attendre la dernière minute.', {
        tr: 'It would be better not to wait until the last minute.',
        extra: ['de', 'à'],
      }),
      pairs(
        b('Match each impersonal expression with its English meaning.', 'Associez chaque tournure impersonnelle à son sens.'),
        [
          ['il vaut mieux partir tôt', b('it’s better to leave early', 'il est préférable de partir tôt')],
          ['il reste dix minutes', b('there are ten minutes left', 'on dispose encore de dix minutes')],
          ['il manque une page', b('a page is missing', 'une page n’est pas là')],
          ['il s’agit d’une erreur', b('it’s a mistake / it concerns a mistake', 'c’est une question d’erreur')],
          ['il suffit de demander', b('all you have to do is ask', 'demander est tout ce qu’il faut')],
        ],
      ),
      hear('Il nous manque encore deux chaises pour le dîner, alors il vaudrait mieux emprunter celles de la voisine.', b('What should they do before dinner?', 'Que vaut-il mieux faire avant le dîner ?'), [
        b('Borrow two chairs from the neighbour', 'Emprunter deux chaises à la voisine'),
        b('Cancel dinner because there is no food left', 'Annuler le dîner par manque de nourriture'),
        b('Buy a brand-new table this afternoon', 'Acheter une table neuve cet après-midi'),
      ]),
      dict('Il s’agit d’un projet simple : il suffit de répondre au sondage, mais il reste peu de temps.'),
      say('Il ne me reste plus que cinq euros, alors il vaut mieux payer par carte.', 'I only have five euros left, so it’s better to pay by card.'),
    ],
    [
      b('il reste and il manque ALWAYS take a singular verb even with plural nouns.', 'il reste et il manque restent toujours au singulier même devant un nom pluriel.'),
      b('il vaut mieux / il vaudrait mieux is followed directly by an infinitive (no de).', 'il vaut mieux / il vaudrait mieux est suivi directement de l’infinitif (sans de).'),
      b('il s’agit de = it is about / a matter of; il suffit de = all it takes is.', 'il s’agit de = il est question de ; il suffit de = il n’en faut pas plus pour.'),
    ],
    [
      ['un malentendu', b('a misunderstanding', 'une erreur de compréhension')],
      ['un tablier', b('an apron', 'un vêtement porté pour cuisiner')],
      ['un sondage', b('a poll, survey', 'une enquête par questions')],
    ],
  ),

  lesson(C, 3, ['weather-il-y-a-il-est', 'meteo-il-y-a-il-est'],
    b('Weather, time and existence: il fait, il y a, il est', 'Météo, heure et existence : il fait, il y a, il est'),
    b('Choose effortlessly between il fait, il y a, il est and c’est when describing the weather, telling time, or introducing ideas.', 'Choisir sans hésiter entre il fait, il y a, il est et c’est pour la météo, l’heure et les constats généraux.'),
    [
      b('Describe the weather with il fait + adj/temp, il y a + noun, and weather verbs', 'Décrire la météo avec il fait, il y a et les verbes météorologiques'),
      b('Tell time and talk about existence or elapsed time with il est and il y a', 'Donner l’heure avec il est et exprimer l’existence ou un délai passé avec il y a'),
      b('Use il est + adjective + de + infinitive (and its everyday twin c’est)', 'Employer il est + adjectif + de + infinitif et son équivalent c’est'),
    ],
    13,
    [
      card(
        b('Il fait, il y a, il pleut, il est: every weather & time pattern', 'Il fait, il y a, il pleut, il est : météo et heure'),
        b(
          'In weather reports, **il fait** takes an **adjective** or **temperature**, **il y a** takes a **noun** (with partitive `du / de la / des`), and pure weather verbs stand alone (**il pleut, il neige, il gèle**). For clock time, French ALWAYS uses **il est** (**Il est huit heures**, never « C’est huit heures »).\n\nIl fait (adj / temp): **il fait beau, il fait doux, il fait frais, il fait vingt degrés**.\nIl y a (weather nouns): **il y a du vent, il y a du soleil, il y a des nuages, il y a du brouillard**.\nTime with il est: **il est midi, il est neuf heures et quart, il est tard**.',
          'Pour la météo, **il fait** s’emploie avec un **adjectif** ou une **température**, **il y a** s’emploie avec un **nom** (souvent avec `du / de la / des`), et les verbes météo s’utilisent seuls (**il pleut, il neige, il gèle**). Pour l’heure, on emploie TOUJOURS **il est** (**Il est huit heures**, jamais « C’est huit heures »).\n\nIl fait (adj / temp.) : **il fait beau, il fait doux, il fait frais, il fait vingt degrés**.\nIl y a (noms météo) : **il y a du vent, il y a du soleil, il y a des nuages, il y a du brouillard**.\nHeure avec il est : **il est midi, il est neuf heures et quart, il est tard**.',
        ),
        {
          table: {
            head: [b('Form', 'Tournure'), b('What follows', 'Ce qui suit'), b('Examples', 'Exemples')],
            rows: [
              ['il fait', b('adjective / temperature / dark-light', 'adjectif / température / jour-nuit'), 'Il fait froid. Il fait nuit. Il fait 18 °C.'],
              ['il y a', b('noun (existence, weather, "ago")', 'nom (existence, météo, passé)'), 'Il y a du vent. Il y a un parc. Il est parti il y a deux jours.'],
              ['il est', b('clock time / early-late / adj + de + inf', 'heure / tôt-tard / adj + de + inf'), 'Il est midi. Il est utile de réviser.'],
              ['c’est', b('commenting on an idea / noun', 'avis général / nom'), 'C’est utile de réviser ! C’est un bel endroit.'],
            ],
          },
          ex: [
            ['Ce matin il fait un peu frais, mais il y a déjà un beau soleil.', 'This morning it’s a bit chilly, but there is already lovely sunshine.'],
            ['Dépêchons-nous, il est déjà huit heures moins dix !', 'Let’s hurry up, it’s already ten to eight!'],
          ],
        },
      ),
      tip(
        b('Il est important de… vs C’est important de…', 'Il est important de… contre C’est important de…'),
        b(
          'To introduce an impersonal judgement before **de + infinitive** or **que + clause**, formal and written French uses **il est + adjective + de / que** (`Il est interdit de fumer`, `Il est possible qu’il pleuve`). In everyday speech, **c’est + adjective + de** is very common (`C’est super de te voir !`). Never drop **de** before the infinitive (`Il est facile de comprendre`, NOT « Il est facile comprendre »).\n\nImpersonal il est: **il est interdit de, il est possible que, il est temps de**.\nEveryday c’est: **c’est facile de, c’est agréable de, c’est dommage que**.',
          'Pour introduire une appréciation avant **de + infinitif** ou **que**, la langue écrite ou soignée emploie **il est + adjectif + de / que** (`Il est interdit de fumer`, `Il est possible qu’il pleuve`). À l’oral courant, **c’est + adjectif + de** est très fréquent (`C’est super de te voir !`). N’oubliez jamais **de** devant l’infinitif !\n\nForme il est : **il est interdit de, il est possible que, il est temps de**.\nOral avec c’est : **c’est facile de, c’est agréable de, c’est dommage que**.',
        ),
      ),
      mc(P.form, ['il fait', 'il y a', 'il est', 'c’est'], {
        fr: 'Prends une veste légère : ce matin, ___ assez frais dehors.',
      }),
      mc(P.form, ['Il est', 'C’est', 'Il y a', 'Il fait'], {
        fr: 'Quelle heure est-il ? — ___ dix heures et demie, nous sommes à l’heure.',
      }),
      gap(P.complete, 'Aujourd’hui, il ___ (y avoir) beaucoup de vent et il ___ (pleuvoir) depuis une heure. Il ___ (être) impossible de pique-niquer dehors, alors il ___ (valoir) mieux rester à la maison.', [['y a'], ['pleut'], ['est'], ['vaut']], {
        choices: [['y a', 'fait', 'est'], ['pleut', 'fait pluie'], ['est', 'y a', 'fait'], ['vaut', 'faut', 'fait']],
      }),
      sort(
        b('Which impersonal verb fits each weather or time item?', 'Quel verbe impersonnel convient à chaque élément ?'),
        [b('il fait', 'il fait'), b('il y a', 'il y a'), b('il est', 'il est')],
        [['___ très chaud', 0], ['___ du brouillard', 1], ['___ midi et quart', 2], ['___ moins cinq degrés', 0], ['___ des nuages gris', 1], ['___ utile de vérifier', 2]],
      ),
      hear('Ce matin il fait doux, mais il y a un peu de brouillard sur la rivière et il est seulement sept heures.', b('What is the weather like at seven a.m.?', 'Quel temps fait-il à sept heures ?'), [
        b('Mild with some fog over the river', 'Il fait doux avec un peu de brouillard sur la rivière'),
        b('Freezing cold with heavy snow', 'Il gèle avec beaucoup de neige'),
        b('Very windy under a clear afternoon sky', 'Il y a grand vent dans l’après-midi'),
      ]),
      dlg(b('Planning a hike', 'Préparer une randonnée'), b('Chloé checks the forecast and the time with Malik.', 'Chloé vérifie la météo et l’heure avec Malik.'), [['Chloé', 'f'], ['Malik', 'm']], [
        [0, 'Malik, quelle heure est-il ? On devait partir à huit heures !', 'Malik, what time is it? We were supposed to leave at eight!'],
        [1, { options: ['Il est huit heures moins le quart, on a encore quinze minutes !', 'C’est huit heures moins le quart, on a encore quinze minutes !', 'Il fait huit heures moins le quart, on a encore quinze minutes !'], explain: b('Clock time always uses il est.', 'On donne toujours l’heure avec il est.') }],
        [0, 'Super ! Tu as regardé la météo ? Il fait comment en montagne aujourd’hui ?', 'Great! Did you check the weather? How is it in the mountains today?'],
        [1, { options: ['Il fait beau et doux, mais il y a du vent au sommet : il faut prendre un coupe-vent.', 'Il y a beau et doux, mais il fait du vent au sommet : il faut prendre un coupe-vent.', 'Il est beau et doux, mais il pleut du vent au sommet : il ne faut pas prendre un coupe-vent.'], explain: b('il fait + adjective (`beau, doux`), il y a + noun (`du vent`).', 'il fait + adjectif (`beau, doux`), il y a + nom (`du vent`).') }],
      ]),
      say('Il est important de vérifier la météo avant de partir en mer.', 'It is important to check the weather before going out to sea.'),
      write(
        b('Write a quick travel and weather update', 'Rédiger un court message météo et conseils'),
        b('Write 40 to 70 words to a friend visiting your city tomorrow. Mention the time or weather (using il fait and il y a), give advice with il faut / il ne faut pas or il vaut mieux, and include one il reste / il manque or il est + adjective + de + infinitive.', 'Écrivez 40 à 70 mots à un ami qui visite votre ville demain. Indiquez le temps qu’il fait (avec il fait et il y a), donnez un conseil avec il faut / il ne faut pas ou il vaut mieux, et ajoutez un il reste / il manque ou il est + adjectif + de + infinitif.'),
        40,
        70,
        [
          b('Correct distinction between il fait (+ adj) and il y a (+ noun)', 'Distinction juste entre il fait (+ adj) et il y a (+ nom)'),
          b('Proper use of il faut / il ne faut pas or il vaut mieux', 'Bon emploi de il faut / il ne faut pas ou il vaut mieux'),
          b('Accurate structure after il est / il reste / il manque', 'Structure exacte après il est / il reste / il manque'),
        ],
        'Salut ! Pour demain matin, il fait beau et doux, mais il y a souvent du vent près du port. Il vaut mieux apporter une veste légère, et il ne faut pas oublier de bonnes chaussures de marche. Il reste encore deux places pour la visite de dix heures : il est plus simple de réserver ce soir !',
      ),
    ],
    [
      b('Weather: il fait + adj/temp, il y a + noun, il pleut / neige / gèle.', 'Météo : il fait + adj/temp., il y a + nom, il pleut / neige / gèle.'),
      b('Time: ALWAYS il est + hour/tôt/tard (never c’est huit heures).', 'Heure : TOUJOURS il est + heure/tôt/tard (jamais c’est huit heures).'),
      b('Impersonal judgement: il est + adjective + de + infinitive (Il est utile de noter).', 'Appréciation impersonnelle : il est + adjectif + de + infinitif (Il est utile de noter).'),
    ],
    [
      ['le brouillard', b('fog', 'un nuage bas qui réduit la visibilité')],
      ['un coupe-vent', b('a windbreaker jacket', 'une veste légère contre le vent')],
      ['doux / douce (météo)', b('mild (weather)', 'ni trop chaud ni trop froid')],
    ],
  ),
];

export default lessons;
