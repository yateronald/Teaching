// Level B1 — 10 intermediate French dictations (~92–115 words each).
// Targets: passé composé vs imparfait, COD agreement with avoir, c’est/s’est,
// leur/leurs, adverbs in -emment/-amment, subjonctif présent, conditionnel,
// tout/tous/toutes, quel/quelle/qu’elle, relative pronouns.
import { b } from '../../types';
import type { DictationCourse } from './types';

export const B1_DICTATIONS: DictationCourse[] = [
  {
    id: 'un-entretien-d-embauche',
    slug: 'un-entretien-d-embauche',
    title: 'Un entretien d’embauche',
    subtitle: b(
      'After weeks of preparation, Mehdi steps into a decisive job interview and turns nerves into confidence.',
      'Après plusieurs semaines de préparation, Mehdi passe un entretien décisif et reprend vite confiance.',
    ),
    level: 'B1',
    theme: b('Work', 'Travail'),
    focus: [
      b('c’est vs s’est', 'Homophones c’est et s’est'),
      b('Passé composé vs imparfait', 'Passé composé et imparfait'),
      b('Workplace spelling', 'Orthographe professionnelle'),
    ],
    image: 'dialogue-l-entretien-d-embauche',
    minutes: 7,
    text: 'Ce matin-là, Mehdi s’est levé bien avant son réveil pour relire les notes qu’il avait préparées toute la semaine. C’est la première fois qu’il postulait dans une entreprise internationale, et son cœur battait un peu plus vite que d’habitude. Lorsqu’il est entré dans la salle de réunion, la responsable du recrutement s’est présentée avec un sourire rassurant. L’entretien s’est déroulé dans un climat détendu : Mehdi a expliqué son parcours avec clarté et a répondu aux questions techniques sans hésiter. En sortant, il savait déjà que cette expérience lui serait précieuse.',
    translation: 'That morning, Mehdi got up well before his alarm to reread the notes he had prepared all week. It was the first time he had applied to an international company, and his heart was beating a little faster than usual. When he entered the meeting room, the hiring manager introduced herself with a reassuring smile. The interview went smoothly in a relaxed atmosphere: Mehdi explained his background clearly and answered the technical questions without hesitation. Walking out, he already knew that this experience would be valuable to him.',
    blanks: ['réveil', 'préparées', 'postulait', 'cœur', 'réunion', 'présentée', 'déroulé', 'parcours', 'hésiter', 'précieuse'],
    traps: [
      { word: 's’est levé / C’est la première fois', note: b('s’est precedes a past participle of a pronominal verb; c’est introduces a noun or fact.', '« s’est » accompagne un verbe pronominal ; « c’est » présente un fait ou un nom.') },
      { word: 'les notes qu’il avait préparées', note: b('Direct object les notes (feminine plural) comes before avoir → préparées.', 'Le COD « les notes » (féminin pluriel) précède « avait » → préparées.') },
      { word: 'cœur / parcours', note: b('Ligature œ in cœur; silent final -s in singular parcours.', 'Ligature œ dans « cœur » ; « un parcours » prend toujours un -s.') },
      { word: 's’est présentée', note: b('Feminine subject la responsable → présentée (-ée).', 'Sujet féminin « la responsable » → présentée.') },
      { word: 'sans hésiter', note: b('After preposition sans, always use the infinitive -er (and silent h).', 'Après « sans », on écrit l’infinitif en -er : « hésiter ».') },
    ],
    rules: [
      {
        title: b('Distinguishing c’est and s’est', 'Distinguer « c’est » et « s’est »'),
        body: b(
          'Use c’est when you can replace it with cela est (c’est la première fois). Use s’est when conjugating a reflexive verb in the past (il s’est levé, l’entretien s’est déroulé).',
          'Écrivez « c’est » quand on peut dire « cela est », et « s’est » devant le participe passé d’un verbe pronominal.',
        ),
        examples: [
          { fr: 'C’est un entretien qui s’est bien déroulé.', note: b('c’est = cela est; s’est = se dérouler.', '« c’est » = cela est ; « s’est » = verbe pronominal.') },
        ],
      },
      {
        title: b('Agreement with avoir when COD comes first', 'L’accord avec « avoir » (COD avant le verbe)'),
        body: b(
          'Normally avoir does not agree, UNLESS the direct object comes before the verb: les notes qu’il avait préparées.',
          'Avec « avoir », le participe passé s’accorde uniquement si le COD est placé avant : les notes qu’il avait préparées.',
        ),
        examples: [
          { fr: 'Les notes qu’il avait préparées étaient claires.', note: b('qu’ = les notes (f. pl.) → préparées.', '« qu’ » reprend « les notes » (fém. plur.) → préparées.') },
        ],
      },
    ],
  },
  {
    id: 'le-train-de-nuit',
    slug: 'le-train-de-nuit',
    title: 'Le train de nuit',
    subtitle: b(
      'Travelling overnight towards the south, Amélie watches blurred villages pass by her compartment lamp.',
      'À bord d’un train de nuit vers le sud, Amélie lit sous une lampe douce tandis que défilent les campagnes.',
    ),
    level: 'B1',
    theme: b('Travel', 'Voyages'),
    focus: [
      b('COD agreement with avoir', 'Accord du participe passé (COD)'),
      b('Narrative imparfait', 'Imparfait narratif'),
      b('Travel & evening imagery', 'Vocabulaire du voyage'),
    ],
    image: 'text-night-train',
    minutes: 7,
    text: 'À vingt-deux heures, le train de nuit a quitté la gare dans un silence presque complet. Amélie avait réservé une couchette près de la vitre afin de profiter du trajet sans se presser. Les lumières des banlieues qu’elle regardait défiler s’effaçaient peu à peu pour laisser place aux collines sombres. Elle a ouvert le roman que sa sœur lui avait prêté et l’a lu sous une petite lampe tiède. Vers minuit, le bercement régulier des rails a fini par l’endormir. Au réveil, le soleil méditerranéen illuminait déjà les vallées que le train traversait.',
    translation: 'At ten o’clock at night, the sleeper train left the station in almost complete silence. Amélie had booked a berth near the window so she could enjoy the journey without rushing. The lights of the suburbs she watched go by faded little by little, giving way to dark hills. She opened the novel her sister had lent her and read it under a small warm lamp. Around midnight, the steady rocking of the rails finally put her to sleep. When she woke up, the Mediterranean sun was already lighting up the valleys the train was crossing.',
    blanks: ['vingt-deux', 'couchette', 'trajet', 'banlieues', 's’effaçaient', 'prêté', 'tiède', 'bercement', 'méditerranéen', 'vallées'],
    traps: [
      { word: 'vingt-deux heures', note: b('Hyphen between vingt and deux; silent -gt in vingt.', 'Trait d’union dans « vingt-deux » ; g et t muets dans « vingt ».') },
      { word: 's’effaçaient', note: b('Cedilla ç before a keeps the [s] sound; plural -aient for les lumières.', 'Cédille sur le ç devant a, et terminaison plurielle -aient pour « les lumières ».') },
      { word: 'le roman que sa sœur lui avait prêté', note: b('COD le roman (masculine singular) → prêté; ligature œ in sœur.', 'Le COD « le roman » est masculin singulier → prêté ; ligature œ dans « sœur ».') },
      { word: 'méditerranéen', note: b('Double r, single n, then -éen (acute é + silent e + n).', 'Deux r, un seul n, puis la finale -éen : « méditerranéen ».') },
      { word: 'banlieues / collines', note: b('Notice -ue in banlieue; double l in colline.', 'Terminaison -ue dans « banlieue » ; deux l dans « colline ».') },
    ],
    rules: [
      {
        title: b('Cedilla ç in -cer verbs at the imparfait', 'La cédille dans les verbes en -cer à l’imparfait'),
        body: b(
          'Verbs ending in -cer (effacer, commencer, avancer) take ç before -ais, -ait, -aient: elles s’effaçaient.',
          'Les verbes en -cer prennent une cédille devant a : elles s’effaçaient, nous avancions (pas de cédille devant i).',
        ),
        examples: [
          { fr: 'Les lumières s’effaçaient dans la nuit.', note: b('ç before a keeps the soft [s] sound.', 'Le ç devant a conserve le son [s].') },
        ],
      },
      {
        title: b('Hyphens in compound numbers', 'Les traits d’union dans les nombres'),
        body: b(
          'Always hyphenate numbers below one hundred (and under modern rules, all compound numbers): vingt-deux, trente-quatre.',
          'On place un trait d’union dans les nombres composés : vingt-deux heures.',
        ),
        examples: [
          { fr: 'Le train part à vingt-deux heures.', note: b('Hyphen in vingt-deux + plural heures.', 'Trait d’union dans « vingt-deux » et pluriel à « heures ».') },
        ],
      },
    ],
  },
  {
    id: 'l-atelier-de-velo',
    slug: 'l-atelier-de-velo',
    title: 'L’atelier de réparation vélo',
    subtitle: b(
      'In a community workshop, volunteers teach cyclists how to fix their own brakes and punctured tyres.',
      'Dans un atelier associatif, des bénévoles apprennent aux cyclistes à réparer leurs freins et leurs pneus.',
    ),
    level: 'B1',
    theme: b('Everyday life', 'Écologie & vie locale'),
    focus: [
      b('Pronoun leur vs determiner leurs', 'Homophones leur et leurs'),
      b('Verbs in -yer & -ger', 'Verbes en -yer et -ger'),
      b('Practical vocabulary', 'Vocabulaire pratique'),
    ],
    image: 'text-bike-workshop',
    minutes: 7,
    text: 'Chaque mercredi soir, l’atelier associatif accueille des cyclistes qui souhaitent entretenir eux-mêmes leur bicyclette. Les bénévoles ne font pas le travail à leur place : ils leur montrent comment régler les freins, nettoyer une chaîne rouillée ou remplacer une chambre à air. Beaucoup d’adhérents arrivent en pensant qu’ils n’y parviendront jamais, puis ils se prennent au jeu et rangent soigneusement leurs outils. Au fil des séances, ils échangent aussi leurs itinéraires préférés et repartent fiers d’avoir redonné vie à des vélos qu’ils croyaient bons pour la déchetterie.',
    translation: 'Every Wednesday evening, the community workshop welcomes cyclists who want to maintain their bicycle themselves. The volunteers do not do the work for them: they show them how to adjust the brakes, clean a rusty chain or replace an inner tube. Many members arrive thinking they will never manage, then they get into the swing of it and neatly put away their tools. Over the sessions, they also swap their favourite routes and leave proud to have given new life to bikes they thought were ready for the tip.',
    blanks: ['accueille', 'bicyclette', 'bénévoles', 'régler', 'rouillée', 'adhérents', 'soigneusement', 'itinéraires', 'redonné', 'déchetterie'],
    traps: [
      { word: 'leur montrent / leurs outils', note: b('Pronoun leur before a verb NEVER takes -s; possessive leurs before a plural noun takes -s.', 'Devant un verbe, le pronom « leur » est toujours invariable ; devant un nom pluriel, « leurs » prend un -s.') },
      { word: 'accueille', note: b('After c or g, French spells the [œ] sound -ue- (accueillir, cueillir).', 'Après c ou g, on écrit « ue » et non « eu » : « accueille ».') },
      { word: 'eux-mêmes', note: b('Hyphen and plural -s on mêmes after eux.', 'Trait d’union et -s au pluriel : « eux-mêmes ».') },
      { word: 'adhérents / itinéraires', note: b('Silent h in adhérents; acute é then ai in itinéraires.', 'h muet dans « adhérents » ; accent aigu puis ai dans « itinéraires ».') },
      { word: 'qu’ils croyaient', note: b('Imparfait of croire uses y before -aient: ils croyaient.', 'À l’imparfait, « croire » s’écrit avec un y : « ils croyaient ».') },
    ],
    rules: [
      {
        title: b('Pronoun leur (invariable) vs determiner leurs', '« leur » (pronom) ou « leurs » (déterminant)'),
        body: b(
          'Right before a verb, leur means “to them” and NEVER takes an -s (ils leur montrent). Before a plural noun, it is possessive and takes -s (leurs outils, leurs itinéraires).',
          'Devant un verbe, « leur » (= à eux) ne prend JAMAIS de -s. Devant un nom pluriel, « leurs » prend un -s.',
        ),
        examples: [
          { fr: 'Les bénévoles leur prêtent leurs outils.', note: b('leur + verb (no -s); leurs + plural noun (-s).', '« leur » devant verbe (invariable) ; « leurs » devant nom pluriel.') },
        ],
      },
      {
        title: b('The -cueill- spelling after c', 'La graphie « cueill » après la lettre c'),
        body: b(
          'In accueillir, cueillir and recueil, write u before e so the c keeps its hard [k] sound.',
          'Dans « accueillir » et « cueillir », on écrit u avant e pour garder le son [k].',
        ),
        examples: [
          { fr: 'L’atelier accueille les cyclistes le mercredi.', note: b('c + u + e + ill in accueille.', 'Graphie « cueill » dans « accueille ».') },
        ],
      },
    ],
  },
  {
    id: 'travailler-depuis-chez-soi',
    slug: 'travailler-depuis-chez-soi',
    title: 'Une journée en télétravail',
    subtitle: b(
      'Working from home twice a week saves commuting time, provided you keep clear boundaries.',
      'Travailler chez soi deux jours par semaine change le rythme quotidien, à condition de garder un cadre précis.',
    ),
    level: 'B1',
    theme: b('Work', 'Travail'),
    focus: [
      b('Adverbs (-ment, -emment, -amment)', 'Adverbes (-ment, -emment, -amment)'),
      b('Accents & prefixes (télé-, ré-)', 'Accents et préfixes'),
      b('Modern work vocabulary', 'Vocabulaire du bureau'),
    ],
    image: 'text-telework',
    minutes: 7,
    text: 'Récemment, l’entreprise d’Olivier a autorisé deux journées de télétravail par semaine. Évidemment, il apprécie de ne plus perdre une heure entière dans les transports bondés. Dès huit heures et demie, il s’installe calmement devant son écran et répond attentivement aux messages urgents. Pourtant, il a vite compris qu’il fallait organiser sa journée différemment pour rester efficace. À midi, il ferme résolument son ordinateur et sort marcher dans le quartier. Grâce à cette discipline simple, il travaille plus sereinement et retrouve ses collègues avec plaisir le jeudi matin.',
    translation: 'Recently, Olivier’s company allowed two days of remote work per week. Naturally, he enjoys no longer losing a whole hour on packed public transport. From eight-thirty, he settles calmly in front of his screen and replies carefully to urgent messages. However, he quickly realised he had to organise his day differently to stay effective. At noon, he firmly shuts his laptop and goes out for a walk in the neighbourhood. Thanks to this simple discipline, he works more serenely and is happy to see his colleagues again on Thursday morning.',
    blanks: ['Récemment', 'télétravail', 'Évidemment', 'entière', 'calmement', 'attentivement', 'différemment', 'résolument', 'sereinement', 'collègues'],
    traps: [
      { word: 'Récemment / Évidemment / différemment', note: b('Adjectives ending in -ent form adverbs in -emment (double m, pronounced [amɑ̃]).', 'Les adjectifs en -ent forment des adverbes en -emment (deux m, prononcés [amɑ̃]).') },
      { word: 'huit heures et demie', note: b('After a feminine noun (heures), demi agrees in gender: et demie.', 'Placé après le nom féminin « heures », « demie » s’accorde au féminin.') },
      { word: 'résolument', note: b('No circumflex or -e before -ment in résolument (from résolu).', 'Pas de -e muet dans « résolument » (formé sur « résolu »).') },
      { word: 'sereinement / collègues', note: b('Single n in sereinement (from serein/sereine); double l and è in collègues.', 'Un seul n dans « sereinement » ; deux l et un è dans « collègues ».') },
      { word: 'Grâce à', note: b('Circumflex â in grâce + grave accent à.', 'Accent circonflexe sur « grâce » et accent grave sur « à ».') },
    ],
    rules: [
      {
        title: b('Adverbs in -emment vs -amment', 'Les adverbes en -emment et -amment'),
        body: b(
          'Both sound like [amɑ̃]! Check the base adjective: récent → récemment, évident → évidemment, différent → différemment (-ent → -emment); courant → couramment (-ant → -amment).',
          'Même si on entend [amɑ̃], regardez l’adjectif : récent → récemment, évident → évidemment (-ent → -emment) ; courant → couramment (-ant → -amment).',
        ),
        examples: [
          { fr: 'Évidemment, il s’organise différemment.', note: b('From évident and différent → double m with e.', 'Formés sur « évident » et « différent » → -emment.') },
        ],
      },
      {
        title: b('When demi agrees (and when it does not)', 'L’accord de « demi »'),
        body: b(
          'Before a noun, demi- is invariable (une demi-heure). After a noun, it agrees in gender only (huit heures et demie).',
          'Avant le nom, « demi- » est invariable (une demi-heure). Après le nom, il s’accorde en genre (huit heures et demie).',
        ),
        examples: [
          { fr: 'Il commence à huit heures et demie.', note: b('After heures (f.) → et demie.', 'Après « heures » → féminin « demie ».') },
        ],
      },
    ],
  },
  {
    id: 'le-club-de-lecture',
    slug: 'le-club-de-lecture',
    title: 'Le club de lecture du jeudi',
    subtitle: b(
      'Once a month, neighbours meet at the library to debate a novel they all read with very different eyes.',
      'Une fois par mois, des voisins se réunissent à la médiathèque pour débattre d’un roman lu ensemble.',
    ),
    level: 'B1',
    theme: b('Culture', 'Culture'),
    focus: [
      b('Present subjunctive (il faut que)', 'Subjonctif présent'),
      b('tout / tous / toute / toutes', 'Accords de tout / tous / toutes'),
      b('Reading & debate words', 'Vocabulaire culturel'),
    ],
    image: 'dialogue-le-club-de-lecture',
    minutes: 7,
    text: 'Tous les premiers jeudis du mois, une dizaine de lecteurs se réunissent dans une salle chaleureuse de la médiathèque. Bien que chacun ait des goûts très différents, tout le monde accepte de lire le même roman avant la séance. Pour que la discussion soit vivante, il faut que chaque participant puisse donner son avis librement, sans craindre d’être interrompu. Hier soir, toutes les personnes présentes ont adoré la fin inattendue du livre, même si certains auraient souhaité que l’auteur développe davantage les personnages secondaires. Avant de partir, nous avons déjà choisi le titre du mois prochain.',
    translation: 'Every first Thursday of the month, around ten readers meet in a cosy room at the public library. Although everyone has very different tastes, everyone agrees to read the same novel before the session. For the discussion to be lively, every participant must be able to give their opinion freely without fearing interruption. Last night, all the people present loved the book’s unexpected ending, even if some would have wished the author had developed the secondary characters further. Before leaving, we already chose next month’s title.',
    blanks: ['dizaine', 'médiathèque', 'chacun', 'séance', 'puisse', 'interrompu', 'inattendue', 'souhaité', 'davantage', 'secondaires'],
    traps: [
      { word: 'Bien que chacun ait / Pour que… soit / il faut que… puisse', note: b('Bien que, pour que and il faut que trigger the present subjunctive (ait, soit, puisse).', '« Bien que », « pour que » et « il faut que » imposent le subjonctif présent.') },
      { word: 'Tous les jeudis / tout le monde / toutes les personnes', note: b('Determiner tout agrees with its noun: tous (m. pl.), tout (m. sg.), toutes (f. pl.).', 'Le déterminant « tout » s’accorde avec le nom qu’il accompagne.') },
      { word: 'davantage', note: b('One single word meaning “more” (never confuse with d’avantage = of advantage).', 'En un seul mot au sens de « plus » : « davantage ».') },
      { word: 'inattendue / interrompu', note: b('Double t in inattendue (feminine of inattendu); double r in interrompu.', 'Deux t dans « inattendue » ; deux r dans « interrompu ».') },
      { word: 'médiathèque / dizaine', note: b('Keep th + è in médiathèque; single z and -aine in dizaine.', 'th + è dans « médiathèque » ; finale -aine dans « dizaine ».') },
    ],
    rules: [
      {
        title: b('Everyday triggers of the subjunctive', 'Les déclencheurs courants du subjonctif'),
        body: b(
          'After il faut que, bien que and pour que, conjugate in the present subjunctive: qu’il soit, qu’il ait, qu’il puisse.',
          'Après « il faut que », « bien que » et « pour que », le verbe se met au subjonctif : soit, ait, puisse.',
        ),
        examples: [
          { fr: 'Il faut que chacun puisse donner son avis.', note: b('il faut que + subjunctive puisse.', '« il faut que » + subjonctif « puisse ».') },
        ],
      },
      {
        title: b('Agreeing tout as a determiner', 'L’accord du déterminant « tout »'),
        body: b(
          'Before a noun, tout agrees in gender and number: tout le monde, toute la salle, tous les jeudis, toutes les personnes.',
          'Devant un nom, « tout » s’accorde : tout, toute, tous, toutes.',
        ),
        examples: [
          { fr: 'Toutes les personnes ont aimé ce roman.', note: b('Feminine plural personnes → toutes.', 'Féminin pluriel → « toutes ».') },
        ],
      },
    ],
  },
  {
    id: 'quitter-la-ville-pour-la-campagne',
    slug: 'quitter-la-ville-pour-la-campagne',
    title: 'Quitter Paris pour la campagne',
    subtitle: b(
      'Dreaming of quieter mornings and a vegetable garden, Clara weighs up leaving the capital.',
      'Rêvant de matins plus calmes et d’un potager, Clara imagine sa nouvelle vie loin de la capitale.',
    ),
    level: 'B1',
    theme: b('Society', 'Société'),
    focus: [
      b('Present conditional', 'Conditionnel présent'),
      b('Double consonants', 'Consonnes doubles'),
      b('Si + imparfait + conditionnel', 'Hypothèse avec si'),
    ],
    image: 'listen-j-ai-quitte-paris-pour-la-campagne',
    minutes: 7,
    text: 'Depuis quelques mois, Clara rêve de quitter son petit appartement parisien pour s’installer dans un village tranquille. Si elle trouvait un poste adapté à son métier, elle louerait une maison ancienne avec un potager et un verger. Le matin, elle n’entendrait plus les klaxons sous sa fenêtre, mais seulement le chant des merles dans le jardin. Bien sûr, ses amis lui manqueraient parfois et il faudrait organiser des trajets plus longs pour aller au théâtre. Pourtant, elle est convaincue qu’elle gagnerait en sérénité et qu’elle retrouverait enfin le temps de cuisiner et de lire.',
    translation: 'For the past few months, Clara has dreamed of leaving her small Parisian flat to settle in a quiet village. If she found a job suited to her profession, she would rent an old house with a vegetable patch and an orchard. In the morning, she would no longer hear car horns beneath her window, only blackbirds singing in the garden. Of course, she would miss her friends sometimes and she would have to plan longer trips to go to the theatre. Still, she is convinced she would gain peace of mind and finally find time again to cook and read.',
    blanks: ['appartement', 'tranquille', 'louerait', 'verger', 'entendrait', 'manqueraient', 'faudrait', 'théâtre', 'convaincue', 'sérénité'],
    traps: [
      { word: 'louerait / entendrait / manqueraient / faudrait', note: b('Present conditional uses future stem + imparfait endings (-ait, -aient).', 'Le conditionnel présent associe le radical du futur et les terminaisons de l’imparfait.') },
      { word: 'tranquille / appartement', note: b('Double l in tranquille (pronounced [l], not [j]); double p in appartement.', 'Deux l dans « tranquille » (son [l]) ; deux p dans « appartement ».') },
      { word: 'théâtre / sérénité', note: b('Keep th + é + â in théâtre; two acute accents in sérénité.', 'Attention à « théâtre » (th, é, â) et aux deux é dans « sérénité ».') },
      { word: 'convaincue', note: b('Feminine subject Clara → convaincue (keep u before e after c).', 'Féminin de « convaincu » → « convaincue ».') },
      { word: 'Bien sûr', note: b('Circumflex û in sûr (meaning certain, distinct from preposition sur).', 'Accent circonflexe sur « sûr » (= certain), à distinguer de « sur ».') },
    ],
    rules: [
      {
        title: b('Hypothetical si + imparfait → conditional', 'L’hypothèse : si + imparfait → conditionnel'),
        body: b(
          'Never put the conditional right after si! Use imparfait in the si-clause and conditional in the main clause: Si elle trouvait…, elle louerait…',
          'Jamais de conditionnel après « si » : on utilise l’imparfait après « si », puis le conditionnel présent.',
        ),
        examples: [
          { fr: 'Si elle trouvait un poste, elle louerait une maison.', note: b('Imparfait after si; conditional in result.', 'Imparfait après « si », conditionnel ensuite.') },
        ],
      },
      {
        title: b('sûr (certain) vs sur (on)', 'Distinguer « sûr » et « sur »'),
        body: b(
          'Write sûr with a circumflex when it means “certain/sure” (bien sûr, j’en suis sûr). Write sur without an accent for the preposition “on”.',
          '« sûr » avec accent circonflexe signifie « certain » (bien sûr) ; « sur » sans accent est la préposition.',
        ),
        examples: [
          { fr: 'Bien sûr, ses amis lui manqueraient.', note: b('Bien sûr always takes û.', '« Bien sûr » porte toujours un accent circonflexe.') },
        ],
      },
    ],
  },
  {
    id: 'le-dernier-commerce-du-village',
    slug: 'le-dernier-commerce-du-village',
    title: 'Le dernier commerce du village',
    subtitle: b(
      'When the only grocery shop in a small village risks closing, residents rally together to keep it alive.',
      'Quand l’unique épicerie d’un petit village menace de fermer, les habitants se mobilisent pour la sauver.',
    ),
    level: 'B1',
    theme: b('Local life', 'Vie locale'),
    focus: [
      b('peu / peut / peux', 'Homophones peu, peut et peux'),
      b('près vs prêt', 'Homophones près et prêt'),
      b('Distant subject agreements', 'Accords sujets éloignés'),
    ],
    image: 'listen-le-dernier-commerce-du-village',
    minutes: 7,
    text: 'Dans ce petit village perché près des collines, l’épicerie de madame Laurent est bien plus qu’un simple magasin. On y trouve du pain, des légumes de saison, des timbres et surtout quelqu’un qui peut prendre quelques minutes pour discuter. Lorsque l’épicière a annoncé son départ à la retraite, peu d’habitants imaginaient la place sans sa vitrine éclairée. En quelques semaines, la mairie et une vingtaine de familles, prêtes à donner un coup de main, ont monté un projet collectif. Aujourd’hui, le nouveau gérant est prêt à ouvrir et tout le village respire enfin.',
    translation: 'In this small village perched near the hills, Mrs Laurent’s grocery shop is much more than a simple store. You find bread there, seasonal vegetables, stamps and above all someone who can take a few minutes to chat. When the grocer announced her retirement, few residents could imagine the square without her lit shopfront. In a few weeks, the town hall and around twenty families, ready to lend a hand, put together a community project. Today, the new manager is ready to open and the whole village can finally breathe again.',
    blanks: ['perché', 'épicerie', 'timbres', 'épicière', 'retraite', 'habitants', 'vingtaine', 'prêtes', 'collectif', 'gérant'],
    traps: [
      { word: 'près des collines / prêtes / prêt à ouvrir', note: b('près (è + s) = near (invariable); prêt/prête/prêts/prêtes (ê + t) = ready (agrees!).', '« près » (= proche) est invariable ; « prêt » (= disposé à) s’accorde en genre et en nombre.') },
      { word: 'peut prendre / peu d’habitants', note: b('peut = verb pouvoir (pouvait); peu = adverb (little/few).', '« peut » est le verbe pouvoir (pouvait) ; « peu » indique une petite quantité.') },
      { word: 'la mairie et une vingtaine de familles… ont monté', note: b('Watch the distant plural subject before ont monté!', 'Repérez le sujet pluriel éloigné du verbe : « ont monté ».') },
      { word: 'épicerie / épicière', note: b('Single r in épicerie; grave accent è in feminine épicière.', 'Accent grave sur le è dans « épicière ».') },
      { word: 'quelqu’un', note: b('Apostrophe between quelqu’ and un (never quelque un).', 'Élision obligatoire avec apostrophe : « quelqu’un ».') },
    ],
    rules: [
      {
        title: b('Distinguishing près (near) and prêt (ready)', 'Distinguer « près » et « prêt »'),
        body: b(
          'près (with è and -s) means “near” and never changes. prêt (with ê and -t) means “ready” and agrees: prêt, prête, prêts, prêtes.',
          '« près » (proche) est invariable. « prêt » (disposé à) s’accorde : le gérant est prêt, les familles sont prêtes.',
        ),
        examples: [
          { fr: 'Près de la place, le gérant est prêt à ouvrir.', note: b('Près = near; prêt = ready.', '« Près » = lieu ; « prêt » = disposé à.') },
        ],
      },
      {
        title: b('Distinguishing peu and peut', 'Distinguer « peu » et « peut »'),
        body: b(
          'If you can replace it with pouvait, write peut (verb pouvoir). Otherwise write peu (quantity: peu d’habitants, un peu).',
          'Si l’on peut dire « pouvait », écrivez « peut ». Pour une quantité, écrivez « peu ».',
        ),
        examples: [
          { fr: 'Peu de gens savent qu’il peut réussir.', note: b('peu = few; peut = can (pouvait).', '« peu » = quantité ; « peut » = verbe pouvoir.') },
        ],
      },
    ],
  },
  {
    id: 'un-job-d-ete',
    slug: 'un-job-d-ete',
    title: 'Un premier job d’été',
    subtitle: b(
      'During July, Lucas works at a lively seaside campsite and learns to welcome guests in two languages.',
      'En juillet, Lucas travaille à l’accueil d’un camping au bord de la mer et apprend l’autonomie.',
    ),
    level: 'B1',
    theme: b('Jobs & studies', 'Études et emploi'),
    focus: [
      b('Plus-que-parfait', 'Plus-que-parfait'),
      b('Soft g/c (ge, ç, gu)', 'Orthographe ge, gu et ç'),
      b('Workplace narration', 'Récit au passé'),
    ],
    image: 'text-summer-job',
    minutes: 7,
    text: 'En juillet dernier, Lucas a décroché son premier emploi saisonnier à l’accueil d’un camping proche de l’océan. Comme il n’avait encore jamais travaillé en équipe, il redoutait les journées chargées du week-end. Dès le premier matin, il a aperçu une longue file de vacanciers fatigués qui attendaient leurs clés. Heureusement, sa responsable lui avait expliqué chaque étape avec méthode. Lucas dirigeait les familles vers leur emplacement, corrigeait parfois une réservation et renseignait les voyageurs étrangers. À la fin du mois, il avait gagné bien plus qu’un salaire : une véritable assurance.',
    translation: 'Last July, Lucas landed his first seasonal job at the reception of a campsite near the ocean. Since he had never worked in a team before, he dreaded the busy weekend days. On the very first morning, he spotted a long queue of tired holidaymakers waiting for their keys. Fortunately, his manager had explained every step methodically. Lucas directed families to their pitch, occasionally corrected a booking and helped foreign travellers. By the end of the month, he had earned far more than a salary: genuine self-confidence.',
    blanks: ['saisonnier', 'accueil', 'océan', 'chargées', 'aperçu', 'vacanciers', 'dirigeait', 'corrigeait', 'étrangers', 'assurance'],
    traps: [
      { word: 'dirigeait / corrigeait', note: b('Keep the e after g before a to maintain the soft [ʒ] sound!', 'Gardez le e après g devant a pour conserver le son [ʒ] : dirigeait, corrigeait.') },
      { word: 'aperçu', note: b('Only ONE p in apercevoir/aperçu, plus cedilla ç before u.', 'Un seul p dans « aperçu » (contrairement à « apprendre ») et une cédille devant u.') },
      { word: 'accueil', note: b('Double c and -ueil (not -euil!) after c.', 'Deux c et graphie -ueil après c : « accueil ».') },
      { word: 'n’avait jamais travaillé / lui avait expliqué', note: b('Plus-que-parfait (imparfait of avoir + past participle) marks an earlier past action.', 'Le plus-que-parfait situe un fait antérieur à un autre moment du passé.') },
      { word: 'saisonnier / vacanciers', note: b('Double n in saisonnier; single c in vacanciers.', 'Deux n dans « saisonnier » ; finale -ciers dans « vacanciers ».') },
    ],
    rules: [
      {
        title: b('Keeping the e in -ger verbs (dirigeait, corrigeait)', 'Le e muet des verbes en -ger devant a et o'),
        body: b(
          'Before a or o, the letter g sounds hard [g]. Keep an e in -ger verbs to preserve [ʒ]: il dirigeait, il corrigeait, nous mangeons.',
          'Devant a ou o, les verbes en -ger gardent un e pour conserver le son [ʒ] : il dirigeait, il corrigeait.',
        ),
        examples: [
          { fr: 'Il dirigeait les familles et corrigeait les fiches.', note: b('ge + ait preserves soft [ʒ].', 'Le e après g garde le son doux [ʒ].') },
        ],
      },
      {
        title: b('Single p in apercevoir / aperçu', 'Un seul p dans « apercevoir »'),
        body: b(
          'Unlike apprendre or apporter, apercevoir takes only ONE p — and needs a cedilla ç before u (il a aperçu).',
          'Contrairement à « apporter », « apercevoir » ne prend qu’un seul p, et un ç devant u : il a aperçu.',
        ),
        examples: [
          { fr: 'Il a aperçu une longue file à l’accueil.', note: b('Single p + ç in aperçu.', 'Un seul p et une cédille dans « aperçu ».') },
        ],
      },
    ],
  },
  {
    id: 'les-clefs-du-jardin',
    slug: 'les-clefs-du-jardin',
    title: 'Les clefs du jardin partagé',
    subtitle: b(
      'In a quiet corner of the district, residents share keys to a communal garden where tomatoes and friendships grow.',
      'Au cœur du quartier, les voisins se transmettent les clefs d’un jardin partagé où poussent légumes et liens.',
    ),
    level: 'B1',
    theme: b('Community', 'Quartier'),
    focus: [
      b('Relative pronouns (dont, où, auquel)', 'Pronoms relatifs (dont, où, auquel)'),
      b('Past participle with être', 'Participe passé avec être'),
      b('Nature & garden spelling', 'Vocabulaire du jardin'),
    ],
    image: 'text-les-clefs-du-jardin',
    minutes: 7,
    text: 'Derrière l’ancienne école se cache un terrain clos dont les habitants du quartier s’occupent depuis trois printemps. Chaque famille qui participe à l’entretien possède un double de la clef et un petit carré de terre auquel elle tient beaucoup. Au fil des saisons, des tomates mûres, des herbes aromatiques et des fleurs sauvages y sont apparues grâce à la patience de tous. Le soir, lorsque la chaleur retombe, des voisins qui ne se connaissaient guère se croisent près des arrosoirs. Ce lieu modeste, où les générations se mêlent naturellement, est devenu le véritable cœur du quartier.',
    translation: 'Behind the old school hides an enclosed plot that neighbourhood residents have been tending for three springs. Each family taking part in its upkeep holds a spare key and a small patch of earth they care deeply about. Over the seasons, ripe tomatoes, aromatic herbs and wildflowers have appeared there thanks to everyone’s patience. In the evening, when the heat subsides, neighbours who barely knew one another cross paths by the watering cans. This modest place, where generations naturally mingle, has become the true heart of the neighbourhood.',
    blanks: ['terrain', 'printemps', 'entretien', 'auquel', 'aromatiques', 'apparues', 'chaleur', 'arrosoirs', 'générations', 'véritable'],
    traps: [
      { word: 'sont apparues', note: b('With être, apparues agrees with the feminine plural nouns (tomates, herbes, fleurs).', 'Avec « être », « apparues » s’accorde au féminin pluriel avec les sujets.') },
      { word: 'dont / auquel / où', note: b('dont replaces de + noun (s’occuper de); auquel replaces à + masculine noun (tenir à).', '« dont » remplace « de » (s’occuper de) ; « auquel » remplace « à » (tenir à un carré).') },
      { word: 'printemps / arrosoirs', note: b('Silent -ps at the end of printemps (even in the singular); double r in arrosoir.', '« printemps » finit toujours par -ps ; deux r dans « arrosoirs ».') },
      { word: 'guère / se mêlent', note: b('Grave accent è in guère (barely); circumflex ê in se mêlent (mingle).', 'Accent grave dans « guère » ; accent circonflexe dans « se mêlent ».') },
      { word: 'mûres', note: b('Circumflex û in mûr/mûre (ripe), distinguishing it from un mur (wall).', 'Accent circonflexe sur « mûres » (= à maturité), différent de « mur ».') },
    ],
    rules: [
      {
        title: b('Using dont and auquel accurately', 'Bien employer « dont » et « auquel »'),
        body: b(
          'Use dont when the verb uses de (s’occuper de → le terrain dont ils s’occupent). Use auquel when the verb uses à + masculine noun (tenir à → un carré auquel elle tient).',
          'Employez « dont » avec un verbe construit avec « de » (s’occuper de) et « auquel » avec « à » + nom masculin (tenir à).',
        ),
        examples: [
          { fr: 'Un jardin dont ils s’occupent et auquel ils tiennent.', note: b('dont = de; auquel = à.', '« dont » (de) et « auquel » (à).') },
        ],
      },
      {
        title: b('mûr (ripe) vs mur (wall)', 'Distinguer « mûr » et « mur »'),
        body: b(
          'The adjective mûr (ripe/mature) always takes a circumflex û (des tomates mûres), whereas the noun un mur (wall) has no accent.',
          'L’adjectif « mûr » (à maturité) porte un accent circonflexe, contrairement au nom « un mur ».',
        ),
        examples: [
          { fr: 'Des tomates bien mûres près du mur.', note: b('mûres (û) = ripe; mur = wall.', '« mûres » (û) vs « mur ».') },
        ],
      },
    ],
  },
  {
    id: 'une-voix-dans-la-chorale',
    slug: 'une-voix-dans-la-chorale',
    title: 'Une voix dans la chorale',
    subtitle: b(
      'Nervous about singing in public, Pauline joins an amateur choir and discovers the joy of harmony.',
      'Intimidée à l’idée de chanter en public, Pauline rejoint une chorale et découvre le plaisir du chant collectif.',
    ),
    level: 'B1',
    theme: b('Arts & music', 'Musique'),
    focus: [
      b('quel / quelle / qu’elle', 'Homophones quel, quelle et qu’elle'),
      b('même vs mêmes', 'Accord de même / mêmes'),
      b('Accents & music words', 'Vocabulaire musical'),
    ],
    image: 'text-une-voix-dans-la-chorale',
    minutes: 7,
    text: 'Longtemps, Pauline a cru qu’elle ne chanterait jamais devant un public. Quelle surprise, pourtant, lorsqu’elle a poussé la porte de la chorale municipale à la rentrée ! Dès la première répétition, le chef de chœur a su rassurer les nouveaux membres en leur montrant que les mêmes exercices de respiration aidaient chacun à trouver sa place. Peu importe quel morceau le groupe choisit : qu’elle chante une chanson populaire ou un air classique, Pauline ressent la même émotion lorsque toutes les voix s’unissent enfin. Ce soir-là, elle a compris qu’elle ne quitterait plus cet ensemble.',
    translation: 'For a long time, Pauline believed she would never sing in front of an audience. What a surprise, though, when she pushed open the door of the town choir at the start of term! From the very first rehearsal, the choir director knew how to reassure the new members by showing them that the same breathing exercises helped everyone find their place. No matter which piece the group chooses: whether she sings a folk song or a classical melody, Pauline feels the same emotion when all the voices finally blend together. That evening, she realised she would never leave this ensemble.',
    blanks: ['Longtemps', 'chorale', 'répétition', 'chœur', 'respiration', 'morceau', 'émotion', 'unissent', 'quitterait', 'ensemble'],
    traps: [
      { word: 'qu’elle ne chanterait / Quelle surprise / quel morceau', note: b('qu’elle = que + pronoun elle (before a verb); quel/quelle = adjective (before a noun).', '« qu’elle » = que + pronom « elle » devant un verbe ; « quel / quelle » s’accorde avec un nom.') },
      { word: 'les mêmes exercices / la même émotion', note: b('Before a noun, même agrees in number: la même, les mêmes.', 'Devant un nom, « même » s’accorde en nombre : les mêmes exercices.') },
      { word: 'chorale / chef de chœur', note: b('Both use ch pronounced [k]; ligature œ in chœur (choir).', 'ch prononcé [k] dans les deux mots ; ligature œ dans « chœur ».') },
      { word: 'répétition / émotion', note: b('Two acute é in répétition; single t in -tion.', 'Deux accents aigus dans « répétition ».') },
      { word: 'Longtemps', note: b('One word combining long + temps (silent g, p, s).', 'En un seul mot avec g, p et s muets : « longtemps ».') },
    ],
    rules: [
      {
        title: b('Distinguishing quel/quelle and qu’elle', 'Distinguer « quel / quelle » et « qu’elle »'),
        body: b(
          'Test by replacing with qu’il: if it works, write qu’elle (elle a cru qu’elle chanterait → qu’il chanterait). Before a noun, agree quel/quelle/quels/quelles.',
          'Remplacez par « qu’il » : si cela marche, écrivez « qu’elle ». Devant un nom, accordez « quel / quelle ».',
        ),
        examples: [
          { fr: 'Quelle joie qu’elle chante dans la chorale !', note: b('Quelle + noun; qu’elle + verb.', '« Quelle » + nom ; « qu’elle » + verbe.') },
        ],
      },
      {
        title: b('ch pronounced [k] in Greek-origin words', 'Le « ch » prononcé [k] (chorale, chœur)'),
        body: b(
          'Several music and science words keep a Greek ch pronounced [k]: chorale, chœur, orchestre, technique.',
          'Plusieurs mots d’origine grecque gardent « ch » prononcé [k] : chorale, chœur, orchestre.',
        ),
        examples: [
          { fr: 'Le chef de chœur dirige la chorale.', note: b('Both chœur and chorale sound like [k].', 'Son [k] dans « chœur » et « chorale ».') },
        ],
      },
    ],
  },
];
