import type { CourseAbout } from '../../types';
import { b, card, doc, exam, gap, lesson, mc, ord, P, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The DELF B1 writing test (about 45 minutes) asks you to write a text of at least 160 words expressing your opinion on a general topic, in the form of an essay, a letter, a forum post or an article. This course teaches you to analyse the instruction, plan in 5 minutes, structure your text, use B1 connectors and opinion phrases, and proofread efficiently, with annotated model texts.',
    'L’épreuve de production écrite du DELF B1 (environ 45 minutes) demande de rédiger un texte d’au moins 160 mots exprimant votre opinion sur un sujet général, sous forme d’essai, de lettre, de message de forum ou d’article. Ce cours vous apprend à analyser la consigne, planifier en 5 minutes, structurer votre texte, employer les connecteurs et formules d’opinion du B1 et relire efficacement, avec des textes modèles commentés.',
  ),
  outcomes: [
    b('Analyse the instruction (type, reader, topic)', 'Analyser la consigne (type, destinataire, sujet)'),
    b('Plan and structure a 160-word text', 'Planifier et structurer un texte de 160 mots'),
    b('Use B1 connectors and opinion phrases', 'Employer connecteurs et formules d’opinion B1'),
    b('Proofread with a checklist', 'Relire avec une grille'),
  ],
};

const C = 'delf-b1-writing';
export default [
  lesson(C, 1, ['analysing-the-instruction', 'analyser-la-consigne'],
    b('Analysing the instruction', 'Analyser la consigne'),
    b('Identify text type, reader, topic and points to cover.', 'Repérer le type de texte, le destinataire, le sujet et les points à traiter.'),
    [b('Identify the text type', 'Identifier le type de texte'), b('Identify the reader and register', 'Identifier le destinataire et le registre'), b('List the points to cover', 'Lister les points à traiter')],
    13,
    [
      exam(b('The B1 writing test', 'La production écrite B1'), b('About **45 minutes**, **160 words minimum**. You express your **opinion** on a general topic and support it with **arguments and examples**, often from personal experience. Types: **essai, lettre / courriel, message de forum, article**. The examiner assesses: **respect of the instruction, coherence, opinion and arguments, vocabulary, grammar**.', 'Environ **45 minutes**, **160 mots minimum**. Vous exprimez votre **opinion** sur un sujet général et l’appuyez par des **arguments et des exemples**, souvent tirés de votre expérience. Types : **essai, lettre / courriel, message de forum, article**. Critères : **respect de la consigne, cohérence, opinion et arguments, lexique, grammaire**.')),
      doc({ look: 'page', title: b('Instruction', 'Consigne'), text: 'Le journal de votre ville organise un débat : « Faut-il interdire les voitures dans le centre-ville ? » Vous écrivez un article pour donner votre opinion, en vous appuyant sur des exemples précis. (160 mots minimum)' }, b('What text type, for which reader?', 'Quel type de texte, pour quel lecteur ?'), [b('an article for the readers of a local newspaper', 'un article pour les lecteurs d’un journal local'), b('a letter to a friend', 'une lettre à un ami'), b('a story about your holidays', 'un récit de vacances'), b('an email to the mayor only', 'un courriel au maire seulement')]),
      sort(b('Which register?', 'Quel registre ?'), [b('friendly (tu)', 'amical (tu)'), b('formal (vous)', 'formel (vous)')], [['un message à un ami sur un forum de jeux', 0], ['une lettre au directeur de l’école', 1], ['un courriel à ta cousine', 0], ['un article pour le journal municipal', 1], ['un message à un collègue proche', 0], ['une lettre de réclamation', 1]]),
      tip(b('Underline the key words', 'Soulignez les mots clés'), b('Underline: **the text type** (article), **the reader** (lecteurs du journal), **the question** (interdire les voitures ?), **the requirements** (opinion, exemples précis, 160 mots). Each forgotten element costs points.', 'Soulignez : **le type de texte** (article), **le destinataire** (lecteurs du journal), **la question** (interdire les voitures ?), **les exigences** (opinion, exemples précis, 160 mots). Chaque élément oublié coûte des points.')),
      mc(P.choose, [b('Give your opinion with precise examples, in an article of at least 160 words', 'Donner son opinion avec des exemples précis, dans un article d’au moins 160 mots'), b('Describe your car', 'Décrire sa voiture'), b('Summarise the debate neutrally', 'Résumer le débat de façon neutre'), b('Write a short message of 60 words', 'Écrire un court message de 60 mots')], { fr: 'Que demande exactement la consigne ?' }),
    ],
    [
      b('45 min, 160 words minimum, an opinion with arguments and examples.', '45 min, 160 mots minimum, une opinion avec arguments et exemples.'),
      b('Identify type, reader, register, question and requirements.', 'Repérez type, destinataire, registre, question et exigences.'),
      b('Answer the exact question asked.', 'Répondez exactement à la question posée.'),
    ],
    [['une consigne', b('an instruction', 'ce qu’il faut faire')], ['s’appuyer sur', b('to rely on, to base on', 'utiliser comme base')], ['interdire', b('to ban', 'défendre')]],
  ),
  lesson(C, 2, ['planning-and-structuring', 'planifier-et-structurer'],
    b('Planning and structuring', 'Planifier et structurer'),
    b('Plan in 5 minutes and organise your text in clear paragraphs.', 'Planifier en 5 minutes et organiser son texte en paragraphes clairs.'),
    [b('Make a quick plan', 'Faire un plan rapide'), b('Write an introduction and a conclusion', 'Rédiger introduction et conclusion'), b('Link paragraphs with connectors', 'Relier les paragraphes par des connecteurs')],
    13,
    [
      card(b('A 4-paragraph structure', 'Une structure en 4 paragraphes'), b('**1. Introduction**: present the topic + your position: **Depuis quelques années, … Personnellement, je suis favorable à…** **2. Argument 1 + example**: **Tout d’abord, … Par exemple, …** **3. Argument 2 + example**: **De plus / Ensuite, … C’est le cas de…** **4. Conclusion**: **Pour conclure, … même si…** Time: **5 min plan, 30 min writing, 10 min proofreading**.', '**1. Introduction** : présenter le sujet + votre position : **Depuis quelques années, … Personnellement, je suis favorable à…** **2. Argument 1 + exemple** : **Tout d’abord, … Par exemple, …** **3. Argument 2 + exemple** : **De plus / Ensuite, … C’est le cas de…** **4. Conclusion** : **Pour conclure, … même si…** Temps : **5 min de plan, 30 min de rédaction, 10 min de relecture**.')),
      doc({ look: 'article', title: b('Model article (extract)', 'Article modèle (extrait)'), text: 'Depuis quelques années, de nombreuses villes réduisent la place de la voiture dans leur centre. Personnellement, je suis favorable à cette idée, même si elle demande des efforts.\n\nTout d’abord, un centre sans voitures est plus agréable : on respire mieux et on entend moins de bruit. Par exemple, depuis que la rue principale de ma ville est piétonne, les familles s’y promènent le week-end et les cafés ont ouvert des terrasses.\n\nDe plus, cette mesure encourage les transports en commun et le vélo…' }, b('What is the function of the first paragraph?', 'Quelle est la fonction du premier paragraphe ?'), [b('to introduce the topic and give the writer’s position', 'présenter le sujet et la position de l’auteur'), b('to give the first example', 'donner le premier exemple'), b('to conclude', 'conclure'), b('to describe the writer’s car', 'décrire la voiture de l’auteur')]),
      sort(b('Which connector?', 'Quel connecteur ?'), [b('add an argument', 'ajouter un argument'), b('give an example', 'donner un exemple'), b('conclude', 'conclure')], [['De plus,', 0], ['Par exemple,', 1], ['Pour conclure,', 2], ['En outre,', 0], ['C’est le cas de…', 1], ['En résumé,', 2]]),
      ord(P.order, 'Personnellement, je suis favorable à cette idée, même si elle demande des efforts.', { tr: 'Personally, I am in favour of this idea, even if it requires effort.' }),
      gap(P.complete, 'Tout d’___ , c’est plus agréable. ___ plus, c’est meilleur pour la santé. Pour ___ , je suis pour.', ['abord', 'De', 'conclure']),
    ],
    [
      b('4 paragraphs: introduction, argument 1, argument 2, conclusion.', '4 paragraphes : introduction, argument 1, argument 2, conclusion.'),
      b('Each argument + a precise example.', 'Chaque argument + un exemple précis.'),
      b('Timing: 5 min plan, 30 min writing, 10 min proofreading.', 'Temps : 5 min de plan, 30 min de rédaction, 10 min de relecture.'),
    ],
    [['piéton(ne)', b('pedestrian', 'réservé aux piétons')], ['une mesure', b('a measure', 'décision')], ['en outre', b('moreover', 'de plus')]],
  ),
  lesson(C, 3, ['writing-and-proofreading', 'rediger-et-relire'],
    b('Writing and proofreading', 'Rédiger et relire'),
    b('Write a complete 160-word text and proofread it with a checklist.', 'Rédiger un texte complet de 160 mots et le relire avec une grille.'),
    [b('Write the full text', 'Rédiger le texte complet'), b('Proofread grammar and spelling', 'Relire grammaire et orthographe'), b('Check the instruction one last time', 'Vérifier la consigne une dernière fois')],
    13,
    [
      card(b('Proofreading checklist', 'Grille de relecture'), b('1. **Instruction**: right type, reader, register, all points, **160+ words**? 2. **Verbs**: subject agreement, tenses, **être / avoir** in the passé composé, subjunctive after **il faut que, bien que**. 3. **Agreements**: adjectives, participles. 4. **Accents** and **homophones** (a / à, ce / se, ou / où). 5. **Punctuation** and paragraphs.', '1. **Consigne** : bon type, destinataire, registre, tous les points, **160 mots ou plus** ? 2. **Verbes** : accord sujet, temps, **être / avoir** au passé composé, subjonctif après **il faut que, bien que**. 3. **Accords** : adjectifs, participes. 4. **Accents** et **homophones** (a / à, ce / se, ou / où). 5. **Ponctuation** et paragraphes.')),
      mc(P.form, ['Il faut que les villes développent les pistes cyclables.', 'Il faut que les villes développent les pistes cyclable.', 'Il faut que les villes développer les pistes cyclables.', 'Il faut que les villes développeront les pistes cyclables.']),
      doc({ look: 'page', title: b('Find the mistakes', 'Trouvez les erreurs'), text: 'Depuis deux ans, ma ville a fermée la rue principale au voitures. Au début, les commerçants était inquiets, mais maintenant ils sont contents.' }, b('How many mistakes are there?', 'Combien d’erreurs y a-t-il ?'), [b('three: a fermé, aux voitures, étaient', 'trois : a fermé, aux voitures, étaient'), b('none', 'aucune'), b('one', 'une'), b('six', 'six')]),
      write(b('Your B1 text', 'Votre texte B1'), b('Instruction: « Sur un forum, on demande : faut-il apprendre une langue étrangère dès l’école primaire ? » Give your opinion with arguments and examples (160–200 words).', 'Consigne : « Sur un forum, on demande : faut-il apprendre une langue étrangère dès l’école primaire ? » Donnez votre opinion avec des arguments et des exemples (160–200 mots).'), 160, 200, [
        b('Introduction with your position', 'Introduction avec votre position'),
        b('Two arguments with examples', 'Deux arguments avec exemples'),
        b('Conclusion; connectors; 160 words minimum', 'Conclusion ; connecteurs ; 160 mots minimum'),
      ], 'Bonjour à tous,\n\nJe lis vos messages avec intérêt et je voudrais donner mon avis. Personnellement, je pense qu’il faut apprendre une langue étrangère dès l’école primaire.\n\nTout d’abord, les enfants apprennent très vite à cet âge. Ils imitent facilement les sons et n’ont pas peur de faire des erreurs. Par exemple, mon neveu de sept ans parle déjà quelques phrases d’anglais avec un très bon accent, alors que moi, j’ai commencé à quinze ans et j’ai toujours un accent fort.\n\nDe plus, apprendre une langue tôt ouvre l’esprit. Les enfants découvrent d’autres cultures, d’autres fêtes, d’autres façons de vivre. C’est une bonne préparation pour le monde d’aujourd’hui, où l’on voyage et où l’on travaille avec des personnes de nombreux pays.\n\nBien sûr, il ne faut pas surcharger les enfants : deux heures par semaine, sous forme de jeux et de chansons, me semblent suffisantes. Il faut aussi bien former les enseignants.\n\nPour conclure, je suis convaincu que c’est un vrai cadeau pour leur avenir.\n\nMarc'),
      tip(b('Keep 10 minutes', 'Gardez 10 minutes'), b('Many candidates lose points on **simple mistakes** they could have corrected. Keep **10 minutes** at the end and read your text **once for verbs, once for agreements, once for spelling**.', 'Beaucoup de candidats perdent des points sur des **fautes simples** qu’ils auraient pu corriger. Gardez **10 minutes** à la fin et relisez **une fois pour les verbes, une fois pour les accords, une fois pour l’orthographe**.')),
    ],
    [
      b('Checklist: instruction, verbs, agreements, accents, punctuation.', 'Grille : consigne, verbes, accords, accents, ponctuation.'),
      b('Proofread in several passes.', 'Relisez en plusieurs passages.'),
      b('Never go under 160 words.', 'Ne descendez jamais sous 160 mots.'),
    ],
    [['surcharger', b('to overload', 'donner trop')], ['un commerçant', b('a shopkeeper', 'qui tient un commerce')], ['ouvrir l’esprit', b('to broaden the mind', 'rendre curieux')]],
  ),
];
