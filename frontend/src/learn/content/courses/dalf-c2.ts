import type { CourseAbout } from '../../types';
import { b, card, dlg, exam, hear, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The DALF C2 oral test combines listening and speaking: you listen (twice) to a recording of several minutes on a topic of general interest, prepare for about an hour, then present a structured, argued talk from it and debate with the examiners. This course trains the C2 skills: taking dense notes from speech, restituting ideas faithfully, building a demanding argument, and debating with eloquence and precision.',
    'L’épreuve orale du DALF C2 combine compréhension et production : vous écoutez (deux fois) un enregistrement de plusieurs minutes sur un sujet d’intérêt général, vous préparez pendant environ une heure, puis vous présentez un exposé structuré et argumenté à partir de ce document, avant de débattre avec le jury. Ce cours entraîne les compétences du C2 : prendre des notes denses à l’écoute, restituer fidèlement les idées, construire une argumentation exigeante, débattre avec éloquence et précision.',
  ),
  outcomes: [
    b('Take dense notes from a long recording', 'Prendre des notes denses à partir d’un long enregistrement'),
    b('Restitute ideas faithfully', 'Restituer fidèlement les idées'),
    b('Build a demanding personal argument', 'Construire une argumentation personnelle exigeante'),
    b('Debate at the highest level', 'Débattre au plus haut niveau'),
  ],
};

const C = 'dalf-c2';
export default [
  lesson(C, 1, ['listening-and-notes', 'ecoute-et-prise-de-notes'],
    b('Listening and note-taking', 'Écoute et prise de notes'),
    b('Capture the structure, the arguments and the speakers’ positions of a long recording.', 'Saisir la structure, les arguments et les positions des intervenants d’un long enregistrement.'),
    [b('Note structure and positions', 'Noter structure et positions'), b('Distinguish speakers', 'Distinguer les intervenants'), b('Use the second listening wisely', 'Bien utiliser la seconde écoute')],
    13,
    [
      exam(b('The C2 oral', 'L’oral du C2'), b('You hear a recording (a radio debate, interview or lecture of several minutes) **twice**, then prepare for **about 1 hour**. Then about **30 minutes**: you **present the content** of the document and **develop a personal, argued point of view** on the issue, followed by a **debate** with the examiners. Score: **/50** for this part.', 'Vous écoutez un enregistrement (débat radiophonique, interview ou conférence de plusieurs minutes) **deux fois**, puis vous préparez pendant **environ 1 heure**. Ensuite, environ **30 minutes** : vous **présentez le contenu** du document et **développez un point de vue personnel argumenté** sur la question, suivi d’un **débat** avec le jury. Note : **/50** pour cette partie.')),
      card(b('Two listenings, two goals', 'Deux écoutes, deux objectifs'), b('**First listening**: the **big picture**: topic, speakers, their positions, the structure (introduction, arguments, conclusion). **Second listening**: **details**: examples, figures, nuances, precise formulations worth reusing. Use a page with **one column per speaker** for debates.', '**Première écoute** : la **vue d’ensemble** : thème, intervenants, positions, structure (introduction, arguments, conclusion). **Seconde écoute** : les **détails** : exemples, chiffres, nuances, formulations précises à réutiliser. Pour un débat, utilisez une page avec **une colonne par intervenant**.')),
      hear('— Faut-il interdire la publicité pour les produits les plus polluants ? — Je le crois. Nous l’avons fait pour le tabac, et personne ne le regrette. — Permettez-moi d’être plus prudent : interdire, c’est facile ; encore faut-il définir ce qu’est un produit polluant. Et qui financera les médias, qui vivent en grande partie de la publicité ?', b('What is the second speaker’s main reservation?', 'Quelle est la principale réserve du second intervenant ?'), [b('Defining polluting products, and media funding', 'Définir les produits polluants, et le financement des médias'), b('He fully supports the ban', 'Il soutient totalement l’interdiction'), b('Tobacco advertising should return', 'La publicité pour le tabac devrait revenir'), b('Media do not need advertising', 'Les médias n’ont pas besoin de publicité')], { voice: 'm' }),
      sort(b('First or second listening?', 'Première ou seconde écoute ?'), [b('first listening', 'première écoute'), b('second listening', 'seconde écoute')], [['le thème général', 0], ['un chiffre précis', 1], ['les positions des intervenants', 0], ['une formule à citer', 1], ['la structure du débat', 0], ['les nuances d’un argument', 1]]),
      pairs(P.match, [['encore faut-il…', b('it still remains to…', 'condition nécessaire')], ['Permettez-moi d’être plus prudent', b('Allow me to be more cautious', 'réserve polie')], ['un intervenant', b('a speaker, a participant', 'personne qui intervient')], ['financer', b('to fund', 'payer pour')]]),
    ],
    [
      b('Two listenings: overall picture, then details.', 'Deux écoutes : vue d’ensemble, puis détails.'),
      b('One column per speaker for debates.', 'Une colonne par intervenant pour les débats.'),
      b('Note positions, arguments, examples and nuances.', 'Notez positions, arguments, exemples et nuances.'),
    ],
    [['restituer', b('to report back, render', 'rendre compte')], ['une conférence', b('a lecture', 'exposé public')], ['polluant', b('polluting', 'qui pollue')]],
  ),
  lesson(C, 2, ['the-presentation', 'l-expose'],
    b('The presentation: restitution and argument', 'L’exposé : restitution et argumentation'),
    b('Report the document faithfully, then develop your own demanding argument.', 'Rendre compte fidèlement du document, puis développer sa propre argumentation exigeante.'),
    [b('Restitute faithfully and concisely', 'Restituer fidèlement et brièvement'), b('Move from restitution to your view', 'Passer de la restitution à votre point de vue'), b('Use culture and examples', 'Mobiliser culture et exemples')],
    13,
    [
      card(b('From restitution to argument', 'De la restitution à l’argumentation'), b('**Restitution** (2–3 min): **Le document que j’ai entendu est un débat radiophonique consacré à… Deux positions s’y opposent : … ; pour sa part, …** **Transition**: **Ce débat soulève une question plus large : …** **Your argument** (10 min): problématique, plan, arguments, **examples from history, literature, current affairs, your experience**, nuanced conclusion.', '**Restitution** (2 à 3 min) : **Le document que j’ai entendu est un débat radiophonique consacré à… Deux positions s’y opposent : … ; pour sa part, …** **Transition** : **Ce débat soulève une question plus large : …** **Votre argumentation** (10 min) : problématique, plan, arguments, **exemples tirés de l’histoire, de la littérature, de l’actualité, de votre expérience**, conclusion nuancée.')),
      mc(P.best, ['Le document est un débat consacré à l’interdiction de la publicité pour les produits polluants. Si le premier intervenant y est favorable, par analogie avec le tabac, le second souligne la difficulté de définir ces produits et la dépendance des médias à la publicité.', 'Le document parle de publicité. Moi, je déteste la publicité.', 'Il y avait deux hommes qui parlaient, je crois, de pollution.', 'Je n’ai pas tout compris, mais c’était intéressant.'], { fr: 'Quelle restitution est la meilleure ?' }),
      say('Ce débat soulève une question plus large : jusqu’où une société démocratique peut-elle encadrer la liberté commerciale au nom de l’intérêt général ?', 'This debate raises a broader question: how far can a democratic society regulate commercial freedom in the name of the public interest?'),
      sort(b('Restitution or personal argument?', 'Restitution ou argumentation personnelle ?'), [b('restitution', 'restitution'), b('personal argument', 'argumentation personnelle')], [['Deux positions s’y opposent.', 0], ['Je défendrai pour ma part l’idée que…', 1], ['Le second intervenant souligne que…', 0], ['L’exemple de la loi Évin sur l’alcool en France montre que…', 1], ['Le document est un débat radiophonique.', 0], ['Il me semble essentiel de distinguer…', 1]]),
      tip(b('Culture makes the difference', 'La culture fait la différence'), b('At C2, examiners value **references**: a historical precedent, a law, a book, a philosopher, a debate in your country. One or two precise references are worth more than vague generalities.', 'Au C2, le jury valorise les **références** : un précédent historique, une loi, un livre, un philosophe, un débat dans votre pays. Une ou deux références précises valent mieux que des généralités vagues.')),
    ],
    [
      b('Restitution: short, faithful, attributes positions.', 'Restitution : brève, fidèle, attribue les positions.'),
      b('Transition: Ce débat soulève une question plus large…', 'Transition : Ce débat soulève une question plus large…'),
      b('Argument: problématique, plan, references, nuanced conclusion.', 'Argumentation : problématique, plan, références, conclusion nuancée.'),
    ],
    [['l’intérêt général', b('the public interest', 'bien de tous')], ['un précédent', b('a precedent', 'cas antérieur')], ['encadrer', b('to regulate', 'mettre des règles')]],
  ),
  lesson(C, 3, ['debating-at-c2', 'debattre-au-c2'],
    b('Debating at C2', 'Débattre au C2'),
    b('Defend your view with eloquence, precision and intellectual honesty.', 'Défendre son point de vue avec éloquence, précision et honnêteté intellectuelle.'),
    [b('Reformulate a complex objection', 'Reformuler une objection complexe'), b('Refute with precision', 'Réfuter avec précision'), b('Acknowledge and integrate a strong argument', 'Reconnaître et intégrer un argument fort')],
    13,
    [
      card(b('C2 debate language', 'La langue du débat au C2'), b('**Si je vous suis bien, vous objectez que… · L’objection est sérieuse et mérite qu’on s’y arrête. · Je ne saurais souscrire à cette idée, dans la mesure où… · Votre remarque m’amène à affiner ma position : … · Loin de contredire ma thèse, cet exemple la conforte.** Register: sustained, precise, never aggressive.', '**Si je vous suis bien, vous objectez que… · L’objection est sérieuse et mérite qu’on s’y arrête. · Je ne saurais souscrire à cette idée, dans la mesure où… · Votre remarque m’amène à affiner ma position : … · Loin de contredire ma thèse, cet exemple la conforte.** Registre : soutenu, précis, jamais agressif.')),
      dlg(b('Debate', 'Débat'), undefined, [['Examinateur', 'm'], ['Vous', 'f']], [
        [0, 'Mais interdire la publicité, n’est-ce pas infantiliser le consommateur, comme s’il était incapable de choisir ?', 'But isn’t banning advertising treating consumers like children, as if they couldn’t choose?'],
        [1, { options: ['L’objection est sérieuse et mérite qu’on s’y arrête. Toutefois, la publicité n’informe pas seulement : elle façonne les désirs. Protéger le consommateur n’est pas l’infantiliser, c’est rééquilibrer un rapport de force.', 'Non, le consommateur est bête.', 'Je ne suis pas d’accord, c’est tout.'] }],
        [0, 'Et les médias, comment survivraient-ils ?', 'And the media, how would they survive?'],
        [1, { options: ['Votre remarque m’amène à affiner ma position : une interdiction progressive, accompagnée d’un soutien public transparent aux médias, me semblerait plus réaliste.', 'Ce n’est pas mon problème.', 'Ils trouveront bien.'] }],
      ]),
      sort(b('Function in the debate', 'Fonction dans le débat'), [b('reformulate', 'reformuler'), b('refute', 'réfuter'), b('refine / concede', 'affiner / concéder')], [['Si je vous suis bien, vous objectez que…', 0], ['Je ne saurais souscrire à cette idée.', 1], ['Votre remarque m’amène à affiner ma position.', 2], ['Autrement dit, vous craignez que…', 0], ['Cet argument repose sur un postulat discutable.', 1], ['Je vous concède volontiers ce point.', 2]]),
      say('Loin de contredire ma thèse, cet exemple la conforte : il montre que la régulation est possible sans tuer l’innovation.', 'Far from contradicting my thesis, this example supports it: it shows that regulation is possible without killing innovation.'),
    ],
    [
      b('Reformulate: Si je vous suis bien, vous objectez que…', 'Reformuler : Si je vous suis bien, vous objectez que…'),
      b('Refute: Je ne saurais souscrire à… Cet argument repose sur un postulat discutable.', 'Réfuter : Je ne saurais souscrire à… Cet argument repose sur un postulat discutable.'),
      b('Refine: Votre remarque m’amène à affiner ma position.', 'Affiner : Votre remarque m’amène à affiner ma position.'),
    ],
    [['infantiliser', b('to treat like a child', 'traiter en enfant')], ['façonner', b('to shape', 'former')], ['conforter', b('to strengthen, support', 'renforcer')]],
  ),
];
