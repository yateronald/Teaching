import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, hear, lesson, mc, P, say, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'For candidates aiming at the top TEF levels (C1 and above): a demanding practice set with ironic and implicit audio documents, complex opinion texts, writing sections requiring sophisticated argument and style, and speaking sections where precision, rhetorical skill and nuance make the difference. All documents are original practice material.',
    'Pour les candidats qui visent les niveaux les plus élevés du TEF (C1 et au-delà) : un entraînement exigeant avec des documents sonores ironiques et implicites, des textes d’opinion complexes, des sections écrites exigeant une argumentation et un style recherchés, et des sections orales où la précision, l’habileté rhétorique et la nuance font la différence. Tous les documents sont des supports d’entraînement originaux.',
  ),
  outcomes: [
    b('Understand irony and implicit criticism', 'Comprendre l’ironie et la critique implicite'),
    b('Analyse complex opinion texts', 'Analyser des textes d’opinion complexes'),
    b('Write at C1 level', 'Écrire au niveau C1'),
    b('Persuade with rhetorical precision', 'Persuader avec précision rhétorique'),
  ],
};

const C = 'tef-mock-c1';
export default [
  lesson(C, 1, ['comprehension', 'comprehension'],
    b('C1 comprehension (timed)', 'Compréhension C1 (chronométrée)'),
    b('Infer irony, implicit criticism and the logic of complex texts.', 'Inférer ironie, critique implicite et logique des textes complexes.'),
    [b('Understand irony', 'Comprendre l’ironie'), b('Follow complex argument', 'Suivre une argumentation complexe'), b('Understand nuanced vocabulary', 'Comprendre un lexique nuancé')],
    13,
    [
      hear('Quelle merveilleuse idée que de fermer la bibliothèque le samedi pour faire des économies : c’est précisément le seul jour où les familles qui travaillent pouvaient s’y rendre. On ne saurait mieux viser.', b('What is the speaker’s attitude?', 'Quelle est l’attitude du locuteur ?'), [b('ironic and critical of the decision', 'ironique et critique envers la décision'), b('sincerely enthusiastic', 'sincèrement enthousiaste'), b('neutral', 'neutre'), b('grateful for the savings', 'reconnaissant pour les économies')], { voice: 'm', timer: 60 }),
      hear('Que l’on se comprenne bien : je ne conteste pas la nécessité de réduire la circulation automobile. Ce que je conteste, c’est une méthode qui fait porter l’essentiel de l’effort à ceux qui n’ont aucune alternative, faute de transports en commun dans leur secteur.', b('What exactly does the speaker contest?', 'Que conteste exactement la locutrice ?'), [b('the method, which burdens people without alternatives', 'la méthode, qui pénalise ceux qui n’ont pas d’alternative'), b('the need to reduce traffic', 'la nécessité de réduire la circulation'), b('public transport', 'les transports en commun'), b('nothing', 'rien')], { voice: 'f', timer: 60 }),
      doc({ look: 'article', title: b('Essay extract', 'Extrait d’essai'), text: 'On célèbre volontiers la « liberté » du travailleur indépendant, maître de son temps et de ses choix. On oublie de préciser que cette liberté s’accompagne souvent de l’absence de congés payés, de protection sociale réduite et d’une disponibilité permanente exigée par les plateformes. Appeler cela liberté relève, au mieux, de la naïveté ; au pire, de la publicité.' }, b('What is the author’s position?', 'Quelle est la position de l’auteur ?'), [b('The so-called freedom of platform freelancers hides real insecurity.', 'La prétendue liberté des indépendants des plateformes cache une réelle précarité.'), b('Freelancers are completely free.', 'Les indépendants sont totalement libres.'), b('Platforms protect workers well.', 'Les plateformes protègent bien les travailleurs.'), b('Paid holidays are useless.', 'Les congés payés sont inutiles.')], { timer: 120 }),
      mc(P.choose, [b('to suggest the word « liberté » is misleading, even manipulative', 'suggérer que le mot « liberté » est trompeur, voire manipulateur'), b('to praise advertising', 'faire l’éloge de la publicité'), b('to give a neutral definition', 'donner une définition neutre'), b('to change the subject', 'changer de sujet')], { fr: 'Quelle est la fonction de la dernière phrase (« au mieux, de la naïveté ; au pire, de la publicité ») ?', timer: 60 }),
    ],
    [
      b('C1: irony, implicit criticism, precise distinctions (je ne conteste pas…, ce que je conteste…).', 'C1 : ironie, critique implicite, distinctions précises (je ne conteste pas…, ce que je conteste…).'),
      b('Quotation marks often signal distance.', 'Les guillemets signalent souvent une distance.'),
      b('Gradation (au mieux…, au pire…) strengthens criticism.', 'La gradation (au mieux…, au pire…) renforce la critique.'),
    ],
    [['on ne saurait mieux viser', b('you couldn’t aim better (ironic)', 'ironie : c’est le pire choix')], ['la précarité', b('insecurity (job)', 'situation instable')], ['relever de', b('to be a matter of', 'appartenir à')]],
  ),
  lesson(C, 2, ['writing-at-c1', 'ecrire-au-c1'],
    b('Writing section B at C1', 'La section B écrite au C1'),
    b('Write a sophisticated opinion letter with refined argument and style.', 'Rédiger une lettre d’opinion raffinée, à l’argumentation et au style soignés.'),
    [b('Reframe the debate', 'Recadrer le débat'), b('Use refined connectors and syntax', 'Employer connecteurs et syntaxe raffinés'), b('Conclude with a proposal', 'Conclure par une proposition')],
    13,
    [
      card(b('C1 writing', 'L’écrit au C1'), b('**Reframe**: **Le véritable enjeu n’est pas…, mais…** **Refined connectors**: force est de constater, il n’en demeure pas moins, dès lors, à cet égard. **Syntax**: inversion (Aussi convient-il de…), mise en relief (C’est précisément… que…), participiales. **Modalisation**: il semble que, sans doute, dans une large mesure. **A precise proposal** at the end.', '**Recadrer** : **Le véritable enjeu n’est pas…, mais…** **Connecteurs raffinés** : force est de constater, il n’en demeure pas moins, dès lors, à cet égard. **Syntaxe** : inversion (Aussi convient-il de…), mise en relief (C’est précisément… que…), participiales. **Modalisation** : il semble que, sans doute, dans une large mesure. **Une proposition précise** pour finir.')),
      write(b('Section B at C1 (230–300 words)', 'Section B au C1 (230–300 mots)'), b('React to: « Il faudrait interdire la publicité destinée aux enfants. » Write a letter to a newspaper with a reframed issue, three arguments, a concession and a precise proposal.', 'Réagissez à : « Il faudrait interdire la publicité destinée aux enfants. » Écrivez une lettre à un journal avec un enjeu recadré, trois arguments, une concession et une proposition précise.'), 230, 310, [
        b('Reframed issue', 'Enjeu recadré'),
        b('Three arguments + concession', 'Trois arguments + concession'),
        b('C1 syntax and a precise proposal', 'Syntaxe C1 et proposition précise'),
      ], 'Madame, Monsieur,\n\nLa proposition d’interdire la publicité destinée aux enfants suscite, dans vos colonnes, des réactions passionnées. Elle mérite pourtant mieux qu’un débat entre partisans de la liberté commerciale et défenseurs de l’enfance : le véritable enjeu n’est pas d’interdire, mais de protéger un public qui ne dispose pas encore des outils pour se défendre.\n\nForce est de constater, d’abord, que les jeunes enfants distinguent mal un contenu informatif d’un message commercial. Les publicités qui leur sont destinées exploitent précisément cette vulnérabilité, en associant produits sucrés et personnages familiers.\n\nPar ailleurs, ces messages pèsent sur les familles : nombre de parents se retrouvent à négocier chaque passage en caisse, ce qui transforme l’enfant en prescripteur malgré lui.\n\nEnfin, l’argument de la liberté commerciale me paraît discutable. La liberté de vendre n’a jamais impliqué celle de cibler n’importe qui, n’importe comment : c’est précisément pour cette raison que la publicité pour le tabac a été encadrée.\n\nCertes, une interdiction totale poserait des difficultés, notamment pour le financement de certaines émissions jeunesse. Il n’en demeure pas moins que des solutions existent. Aussi conviendrait-il d’interdire la publicité pour les produits trop sucrés aux heures de grande écoute des enfants, tout en finançant une partie des programmes jeunesse par une contribution des annonceurs.\n\nProtéger l’enfance n’est pas brider l’économie : c’est lui fixer des limites dignes d’une société responsable.\n\nVeuillez agréer, Madame, Monsieur, l’expression de mes salutations distinguées.\n\nÉlise Fournier'),
    ],
    [
      b('Reframe: le véritable enjeu n’est pas…, mais…', 'Recadrer : le véritable enjeu n’est pas…, mais…'),
      b('C1 syntax: inversion, mise en relief, participiales.', 'Syntaxe C1 : inversion, mise en relief, participiales.'),
      b('End with a precise, balanced proposal.', 'Terminez par une proposition précise et équilibrée.'),
    ],
    [['un prescripteur', b('an influencer of purchases', 'qui pousse à acheter')], ['brider', b('to restrain', 'limiter')], ['les heures de grande écoute', b('prime time', 'heures où l’audience est forte')]],
  ),
  lesson(C, 3, ['speaking-at-c1', 'parler-au-c1'],
    b('Speaking section B at C1', 'La section B orale au C1'),
    b('Convince with precision, anticipate objections and adapt your rhetoric.', 'Convaincre avec précision, anticiper les objections et adapter sa rhétorique.'),
    [b('Anticipate objections', 'Anticiper les objections'), b('Adapt arguments to the person', 'Adapter les arguments à la personne'), b('Close with commitment', 'Conclure par un engagement')],
    13,
    [
      card(b('C1 persuasion', 'La persuasion au C1'), b('**Anticipate**: **Je sais déjà ce que tu vas me dire : … Eh bien, justement…** **Adapt**: arguments that match the friend’s values (temps, argent, famille, plaisir). **Reframe**: **Ce n’est pas une dépense, c’est un investissement.** **Close**: obtain a small commitment: **On en parle samedi ? · Je t’envoie le lien, tu me dis ce soir ?**', '**Anticiper** : **Je sais déjà ce que tu vas me dire : … Eh bien, justement…** **Adapter** : des arguments qui correspondent aux valeurs de l’ami (temps, argent, famille, plaisir). **Recadrer** : **Ce n’est pas une dépense, c’est un investissement.** **Conclure** : obtenir un petit engagement : **On en parle samedi ? · Je t’envoie le lien, tu me dis ce soir ?**')),
      dlg(b('Convincing at C1', 'Convaincre au C1'), undefined, [['Examinatrice (amie)', 'f'], ['Vous', 'm']], [
        [0, 'Une formation en gestion de projet le soir ? Après mes journées de travail ? Impossible.', 'An evening project-management course? After my working days? Impossible.'],
        [1, { options: ['Je savais que tu me dirais ça. Justement : la formation est en ligne, à ton rythme, et elle est reconnue par ton employeur. Ce n’est pas une contrainte de plus, c’est le moyen d’obtenir le poste dont tu parles depuis un an.', 'Tant pis pour toi.', 'Tu ne veux jamais rien.'] }],
        [0, 'Tu crois vraiment que ça changerait quelque chose ?', 'Do you really think it would change anything?'],
        [1, { options: ['Je ne te promets rien, mais la plupart des postes de responsable exigent cette certification. Je t’envoie le lien, et tu me dis ce soir ce que tu en penses ?', 'Oui, à cent pour cent, c’est garanti.', 'Je ne sais pas.'] }],
      ]),
      say('Ce n’est pas une dépense, c’est un investissement : tu gagnerais en compétences, en confiance, et sans doute en salaire.', 'It isn’t an expense, it’s an investment: you’d gain skills, confidence, and probably salary.'),
      tip(b('Honesty persuades', 'L’honnêteté persuade'), b('At C1, avoid exaggerated promises (« c’est garanti »). A **nuanced, honest** argument (« je ne te promets rien, mais… ») is more credible and better rated.', 'Au C1, évitez les promesses exagérées (« c’est garanti »). Un argument **nuancé et honnête** (« je ne te promets rien, mais… ») est plus crédible et mieux noté.')),
    ],
    [
      b('Anticipate: Je sais déjà ce que tu vas me dire… Justement…', 'Anticiper : Je sais déjà ce que tu vas me dire… Justement…'),
      b('Reframe: ce n’est pas…, c’est…', 'Recadrer : ce n’est pas…, c’est…'),
      b('Stay honest and get a small commitment.', 'Restez honnête et obtenez un petit engagement.'),
    ],
    [['une certification', b('a certification', 'diplôme professionnel')], ['à ton rythme', b('at your own pace', 'quand tu veux')], ['une contrainte', b('a constraint', 'obligation pénible')]],
  ),
];
