import type { CourseAbout } from '../../types';
import { b, doc, exam, hear, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Put your DELF B2 skills to the test in one integrated rehearsal across all four papers: nuanced B2 listening reports heard once or twice, reading an opinion column with implicit stance, composing a structured 250-word formal argument, and defending a viewpoint while countering the examiner’s objections in the speaking exam.',
    'Mettez vos acquis du DELF B2 à l’épreuve dans une répétition générale des quatre épreuves : reportages radio nuancés, article d’opinion avec prise de position implicite, rédaction structurée de 250 mots, puis défense d’un point de vue face aux objections du jury à l’oral.',
  ),
  outcomes: [
    b('Decode implicit speaker stance in B2 listening reports', 'Décoder l’implicite et l’attitude dans un audio B2'),
    b('Identify counter-arguments and purpose in B2 opinion articles', 'Repérer contre-arguments et intention dans la presse B2'),
    b('Draft and self-check a 250-word DELF B2 essay', 'Rédiger et relire un essai DELF B2 de 250 mots'),
    b('Refute live examiner objections politely and logically', 'Répondre avec tact et logique aux objections du jury'),
  ],
};

const C = 'delf-b2-mock';
export default [
  lesson(C, 1, ['b2-mock-listening-reading', 'b2-bilan-ecoute-et-lecture'],
    b('Papers 1 & 2: listening and reading', 'Épreuves 1 et 2 : écoute et lecture'),
    b('Work through B2 radio interviews and opinion journalism spotting subtle stance and irony.', 'Analyser interviews radio B2 et chroniques de presse en repérant distance et implicite.'),
    [b('Handle single-play vs double-play B2 audio', 'Gérer écoutes unique et double au B2'), b('Spot subtle writer reservations', 'Repérer réserves implicites d’un auteur'), b('Avoid overstated exam distractors', 'Éviter les distracteurs exagérés')],
    13,
    [
      exam(b('DELF B2 Comprehension Structure', 'Structure des compréhensions DELF B2'), b('Listening includes **two exercises**: a short piece heard **only once** (2–3 min) and a longer interview/debate heard **twice** (5–6 min). In reading, you analyse **one informational/scientific text** and **one opinion piece** (**45 minutes total**). Watch extreme words in options (**toujours, jamais, uniquement**): they are classic traps.', 'L’écoute compte **deux exercices** : un extrait bref entendu **une seule fois** et un long entretien entendu **deux fois**. En lecture : un texte **informatif** et un texte d’**opinion** (**60 min en tout**). Méfiez-vous des mots absolus (**toujours, jamais, uniquement**) dans les choix : pièges fréquents !')),
      hear('Sur le papier, l’installation de distributeurs intelligents dans nos gares semble moderniser le service. En pratique, près d’un usager âgé sur trois renonce tout simplement à voyager faute d’un conseiller humain capable d’expliquer les tarifs réduits.', b('What is the speaker’s real judgment on automated ticket machines?', 'Quel est le jugement réel de l’intervenant sur les bornes automatiques ?'), [b('Critical: technical modernisation excludes elderly users needing human advice', 'Critique : la modernisation exclut des usagers âgés privés de conseil humain'), b('Wholeheartedly positive about faster stations', 'Entièrement favorable pour la rapidité en gare'), b('He urges travellers never to ask for reduced fares', 'Il déconseille les tarifs réduits'), b('Human staff were more confusing than machines', 'Les agents humains étaient moins clairs que les bornes')], { voice: 'm2', timer: 30 }),
      doc({ look: 'article', title: b('Chronique — L’illusion du « tout numérique » à l’école', 'Chronique — L’illusion du « tout numérique » à l’école'), text: 'Faut-il équiper chaque élève de dix ans d’une tablette ? Les fabricants vantent des progrès spectaculaires, oubliant que plusieurs études scandinaves observent une baisse de la compréhension profonde sur écran par rapport au papier. Le numérique reste précieux pour la recherche documentaire ; encore faut-il qu’il complète le livre au lieu de s’y substituer.' }, b('What balanced position does the columnist defend?', 'Quelle position nuancée le chroniqueur défend-il ?'), [b('Digital tools have value for research but should complement books, not replace them.', 'Le numérique est utile pour chercher mais doit compléter le livre sans le remplacer.'), b('Tablets must be banned completely from every school.', 'Il faut bannir totalement les tablettes des écoles.'), b('Scandinavian schools proved screens are always superior to paper.', 'Les études scandinaves prouvent la supériorité des écrans.'), b('Equipment manufacturers paid for the recent studies.', 'Les fabricants ont financé ces études scandinaves.')], { timer: 45 }),
      sort(b('Distractor trap or valid B2 inference?', 'Piège classique ou inférence B2 juste ?'), [b('valid B2 nuance', 'nuance B2 juste'), b('extreme trap word', 'piège par excès')], [['utile mais limité à un usage précis', 0], ['doit être totalement interdit dès demain', 1], ['exclut une partie des usagers', 0], ['n’apporte jamais aucun bénéfice', 1]]),
    ],
    [
      b('Be suspicious of absolute options (« jamais, toujours, uniquement, totalement »).', 'Méfiez-vous des choix absolus (« jamais, toujours, uniquement, totalement »).'),
      b('Notice contrast pairs: « Sur le papier… En pratique… ».', 'Repérez les oppositions type « Sur le papier… En pratique… ».'),
      b('In single-listening items, read all options quickly before the audio begins.', 'Lors de l’écoute unique, parcourez vite les choix avant le lancement.'),
    ],
    [['sur le papier', b('on paper, in theory', 'en théorie')], ['faute de', b('for lack of', 'par manque de')], ['se substituer à', b('to replace, take the place of', 'remplacer')]],
  ),
  lesson(C, 2, ['b2-mock-essay-practice', 'b2-bilan-production-ecrite'],
    b('Paper 3: the 250-word argued essay', 'Épreuve 3 : l’essai argumenté de 250 mots'),
    b('Draft a cohesive 250-word reader letter or opinion article with nuanced syntax and examples.', 'Rédiger un texte d’opinion structuré de 250 mots avec syntaxe variée et exemples.'),
    [b('Use B2 syntax: subjunctive, passive, concession', 'Employer subjonctif, passif et concession'), b('Develop arguments beyond slogans', 'Développer ses idées au-delà du slogan'), b('Self-edit 250 words in 5 minutes', 'Relire 250 mots en 5 minutes')],
    13,
    [
      tip(b('Four B2 grammar upgrades scorers look for', 'Quatre structures B2 attendues'), b('To score 18+/25 in writing: include **1. one subjunctive after bien que / pour que / il faut que**, **2. one clean relative with dont / auquel**, **3. one hypothesis or conditional for nuance (il conviendrait de)**, and **4. rich verbs (favoriser, renforcer, atténuer, remédier à)** rather than *faire* or *être*.', 'Pour viser 18+/25 à l’écrit : glissez **1. un subjonctif après bien que / pour que / il faut que**, **2. un relatif en dont / auquel**, **3. un conditionnel de nuance (il conviendrait de)**, et **4. des verbes précis (favoriser, renforcer, atténuer, remédier à)** au lieu de *faire* ou *être*.')),
      write(b('DELF B2 Writing Task (~240 words)', 'Tâche écrite DELF B2 (~240 mots)'), b('A newspaper publishes an article claiming that remote learning will completely replace university classrooms within ten years. Write a reasoned opinion piece to the editor (215–265 words): formulate the debate question, acknowledge online benefits, defend the vital role of campus life, and conclude with a hybrid vision.', 'Un journal affirme que l’enseignement à distance remplacera bientôt les universités traditionnelles. Vous écrivez au courrier des lecteurs (215–265 mots) : posez la problématique, reconnaissez les apports du numérique, défendez le rôle humain du campus et concluez par une vision équilibrée.'), 215, 265, [
        b('Clear hook and problématique in the intro', 'Accroche nette et problématique en introduction'),
        b('Concession paragraph + main defence paragraph', 'Paragraphe de concession + défense principale'),
        b('At least one subjunctive (bien que…) & relative (dont / auquel)', 'Subjonctif (bien que…) et pronom relatif précis'),
        b('215–265 words with formal editorial tone', '215 à 265 mots, registre soutenu'),
      ], 'Monsieur le Rédacteur en chef,\n\nVotre récent article annonçant la disparition prochaine des campus universitaires au profit du tout-numérique soulève une question essentielle pour notre avenir : dans quelle mesure les cours en ligne peuvent-ils démocratiser le savoir sans appauvrir l’expérience humaine des études supérieures ?\n\nCertes, l’enseignement à distance offre des atouts indéniables au quotidien. En supprimant les barrières géographiques et financières liées au transport ou au logement, il permet à des salariés en reconversion, à des jeunes parents ou à des étudiants résidant loin des métropoles d’accéder à des formations exigeantes. De même, la réécoute des cours enregistrés favorise un apprentissage plus autonome et plus souple.\n\nToutefois, réduire l’université à une simple transmission de contenus sur écran serait une erreur majeure. Un campus demeure avant tout un lieu précieux d’émulation intellectuelle, de débats spontanés, de recherche en bibliothèque et d’entraide quotidienne dont les jeunes adultes ont besoin pour mûrir. De nombreuses études rappellent d’ailleurs que le taux d’abandon reste nettement plus élevé chez les apprenants isolés devant leur ordinateur.\n\nBien que les outils numériques constituent un formidable complément pédagogique, il conviendrait plutôt de développer des parcours hybrides associant flexibilité en ligne et ateliers collaboratifs en présentiel. L’avenir de l’université repose sur cette alliance équilibrée, et non sur l’effacement progressif du contact humain.\n\nVeuillez agréer, Monsieur le Rédacteur en chef, l’expression de mes salutations distinguées.', { phrases: ['Dans quelle mesure… sans… ?', 'Certes…', 'Toutefois… dont…', 'Bien que + subjonctif…'] }),
      mc(P.best, ['démocratiser l’accès au savoir tout en préservant l’émulation humaine', 'être très bien pour les étudiants et les ordinateurs', 'faire beaucoup de progrès avec Internet', 'donner des leçons faciles sur les écrans'], { fr: 'Quelle formulation élève le style au niveau B2 ?' }),
    ],
    [
      b('Sprinkle high-value grammar naturally: bien que + subjunctive, dont/auquel, en + -ant.', 'Intégrez naturellement bien que + subjonctif, dont/auquel et le gérondif.'),
      b('Upgrade generic verbs (« faire, être bien ») to « favoriser, soulever, constituer, appauvrir ».', 'Remplacez « faire, être bien » par « favoriser, soulever, constituer, appauvrir ».'),
      b('Verify accent marks and past participle agreement during the final 5 minutes.', 'Contrôlez accents et accords du participe passé pendant les 5 dernières minutes.'),
    ],
    [['l’émulation', b('intellectual stimulation', 'dynamique de groupe motivante')], ['le taux d’abandon', b('the dropout rate', 'part des abandons')], ['hybride', b('hybrid / blended', 'mélange présentiel et à distance')]],
  ),
  lesson(C, 3, ['b2-mock-speaking-and-debate', 'b2-bilan-exposes-et-debat'],
    b('Paper 4: the B2 monologue and live debate', 'Épreuve 4 : exposé et débat avec le jury'),
    b('Present a structured 5-to-7-minute oral response from a stimulus text and counter examiner objections calmly.', 'Présenter un exposé de 5 à 7 minutes à partir d’un déclencheur et répondre aux objections du jury.'),
    [b('Summarise the trigger text in 45 seconds', 'Résumer le texte déclencheur en 45 secondes'), b('Keep the monologue flowing for 5+ minutes', 'Tenir 5 minutes d’exposé fluide'), b('Answer challenges without getting flustered', 'Répondre aux objections avec calme')],
    13,
    [
      exam(b('DELF B2 Oral Format (30 min prep · 20 min talk)', 'Format oral DELF B2 (30 min prép. · 20 min)'), b('You draw two short articles and pick **one**. **Part 1 (Monologue, ~5–7 min)**: present source & theme, pose your **problématique**, argue **2 structured points with examples**, conclude clearly. **Part 2 (Debate, ~10–13 min)**: the two examiners challenge your views (**« Mais ne pensez-vous pas que… ? »**). Welcome their objection (**« Vous soulevez un point juste, cependant… »**) and defend your reasoning.', 'Vous tirez deux courts articles et en choisissez **un**. **Partie 1 (Monologue, ~5–7 min)** : source et thème, **problématique**, **2 axes argumentés avec exemples**, conclusion. **Partie 2 (Débat, ~10–13 min)** : le jury vous contredit (**« Mais ne pensez-vous pas que… ? »**). Accueillez l’objection (**« Vous soulevez un point juste, cependant… »**) et défendez votre analyse.')),
      mc(P.best, ['Je comprends votre argument concernant le coût immédiat ; néanmoins, à long terme, cet investissement réduit les dépenses de santé.', 'Non, ce que vous dites est complètement faux !', 'Euh… oui, vous avez raison, je change d’avis.', 'Je ne sais pas, je n’ai pas pensé à ça dans mes notes.'], { fr: 'L’examinateur dit : « Votre proposition coûterait trop cher aux petites villes. » Quelle réplique marque des points en B2 ?' }),
      say('Vous soulevez un point tout à fait pertinent. Cependant, il me semble que cet effort initial reste rentable à moyen terme.', 'You raise a very relevant point. However, it seems to me this initial effort pays off in the medium term.'),
      say('En conclusion, loin de s’opposer, ces deux approches se complètent dès lors qu’on fixe des règles claires.', 'In conclusion, far from opposing each other, these two approaches complement one another once clear rules are set.'),
      tip(b('Avoid repeating « oui » or « non » abruptly', 'Évitez de couper par un « non » sec'), b('Bridge every examiner interruption with a short **concession formula**: **C’est exact, toutefois… / On pourrait le craindre, mais en réalité… / Je nuancerais ce point en rappelant que…** It buys two seconds to think and sounds genuinely B2.', 'Enchaînez toute relance avec une **formule de transition** : **C’est exact, toutefois… / On pourrait le craindre, mais en réalité… / Je nuancerais ce point…** Cela donne deux secondes pour réfléchir et montre une vraie aisance B2.')),
    ],
    [
      b('In B2 oral prep (30 min), outline keyword bullets only—never write a full script to read aloud.', 'Pendant les 30 min de prép., notez des mots clés, jamais de phrases rédigées à lire.'),
      b('Keep the summary under 1 minute; dedicate 80% of your monologue to structured arguments.', 'Limitez le résumé à 1 minute ; consacrez 80 % de l’exposé à votre argumentation.'),
      b('In the debate, concede softly before pivoting to a concrete counter-example.', 'En débat, concédez brièvement avant de pivoter vers un contre-exemple concret.'),
    ],
    [['un texte déclencheur', b('a trigger / prompt article', 'article de départ')], ['pertinent', b('relevant, pertinent', 'juste, bien adapté')], ['à moyen terme', b('in the medium term', 'sur quelques années')]],
  ),
];
