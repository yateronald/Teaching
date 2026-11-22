import type { CourseAbout } from '../../types';
import { b, card, exam, gap, lesson, mc, ord, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At DELF B2, listing vague opinions is no longer enough: examiners expect a sharp problématique (central question), a logical plan (concession/refutation or causes/solutions), formal French letters addressed to a mayor, company director or editor, and complex grammar (subjunctive, concession, passive) used naturally. This course trains you to build winning B2 plans in five minutes and write persuasive formal letters.',
    'Au DELF B2, aligner des avis vagues ne suffit plus : les correcteurs attendent une vraie problématique, un plan structuré (thèse/antithèse nuancée ou causes/solutions), des lettres formelles adressées à un maire, un directeur ou un journal, et une syntaxe maîtrisée (subjonctif, concession, passif). Ce cours vous entraîne à bâtir un plan solide en cinq minutes et à rédiger des courriers formels convaincants.',
  ),
  outcomes: [
    b('Turn a broad B2 prompt into a sharp problématique', 'Transformer un sujet B2 en une problématique précise'),
    b('Choose the right 2- or 3-part plan in five minutes', 'Choisir le bon plan en deux ou trois parties en cinq minutes'),
    b('Write a formal letter with exact French salutations and closings', 'Rédiger une lettre formelle avec les formules exactes'),
    b('Connect arguments with high-band B2 concessions and transitions', 'Relier ses arguments avec concessions et transitions B2'),
  ],
};

const C = 'delf-b2-problematique';
export default [
  lesson(C, 1, ['crafting-the-problematique', 'construire-la-problematique'],
    b('Turning any topic into a problématique', 'Passer du sujet à la problématique'),
    b('Ask a balanced central question instead of repeating the prompt or jumping straight to yes/no.', 'Poser une question centrale équilibrée au lieu de recopier le sujet ou répondre oui/non.'),
    [b('Spot weak vs strong B2 hooks', 'Distinguer accroche faible et accroche B2'), b('Formulate a balanced tension', 'Formuler la tension au cœur du sujet'), b('Pick an effective 2-part plan', 'Choisir un plan efficace en deux parties')],
    13,
    [
      exam(b('What a problématique really is', 'Ce qu’est vraiment une problématique'), b('A **problématique** shows **the tension inside a question**: *not* « Le télétravail est-il bien ? », *but* « **Dans quelle mesure** le développement du télétravail **permet-il** d’améliorer le bien-être des salariés **sans nuire à** la cohésion des équipes ? » It immediately sets up both sides of your plan.', 'Une **problématique** montre **la tension au cœur d’un sujet** : *pas* « Le télétravail est-il bien ? », *mais* « **Dans quelle mesure** le développement du télétravail **permet-il** d’améliorer le bien-être des salariés **tout en préservant** la cohésion des équipes ? » Elle annonce aussitôt les deux volets de votre plan.')),
      mc(P.best, ['Dans quelle mesure le développement du vélo en ville favorise-t-il la santé publique tout en posant de nouveaux défis de sécurité et de partage de l’espace ?', 'Le vélo, c’est super et les voitures polluent beaucoup.', 'Aujourd’hui, beaucoup de gens font du vélo partout dans le monde.', 'Est-ce que le vélo est bon ? Oui, je pense que oui.'], { fr: 'Sujet : « Faut-il donner la priorité absolue aux vélos en centre-ville ? » Quelle problématique est de niveau B2 ?' }),
      sort(b('Good B2 problématique or weak opening?', 'Bonne problématique B2 ou ouverture faible ?'), [b('balanced B2 problématique', 'problématique B2 équilibrée'), b('weak / B1 phrasing', 'formule faible / B1')], [['Comment concilier tourisme économique et protection des habitants ?', 0], ['Aujourd’hui il y a beaucoup de touristes partout.', 1], ['Jusqu’où les écoles peuvent-elles intégrer l’intelligence artificielle sans affaiblir l’effort personnel ?', 0], ['À mon avis l’IA est bonne mais dangereuse.', 1]]),
      gap(P.complete, '___ quelle mesure peut-on ___ le commerce en ligne ___ sacrifier les boutiques de proximité ?', ['Dans', 'développer', 'sans'], { choices: [['Dans', 'Sur', 'Pour'], ['développer', 'faire', 'dire'], ['sans', 'avec', 'mais']] }),
      pairs(P.match, [['dans quelle mesure', b('to what extent', 'jusqu’à quel point')], ['concilier', b('to reconcile / balance', 'rendre compatible')], ['tout en préservant', b('while preserving', 'sans détruire')], ['nuire à', b('to harm', 'faire du tort à')]]),
    ],
    [
      b('Never start with « De nos jours, tout le monde… »: hook cleanly and expose a real tension.', 'Évitez « De nos jours, tout le monde… » : posez vite le débat réel.'),
      b('Templates like « Dans quelle mesure… tout en… ? » or « Comment concilier X et Y ? » create sharp B2 clarity.', '« Dans quelle mesure… tout en… ? » ou « Comment concilier X et Y ? » créent une vraie problématique.'),
      b('Let your problématique dictate your two main body paragraphs.', 'Faites découler vos deux grandes parties directement de cette question.'),
    ],
    [['la cohésion', b('cohesion, unity', 'lien entre les membres')], ['un enjeu', b('a stake, key issue', 'ce qui est en jeu')], ['au détriment de', b('at the expense of', 'en pénalisant')]],
  ),
  lesson(C, 2, ['structuring-a-b2-argument', 'structurer-un-plan-b2'],
    b('Two reliable B2 plans and clean paragraphs', 'Plans fiables B2 et paragraphes'),
    b('Organise concessive (Certes / Néanmoins) and analytical plans without contradicting yourself.', 'Bâtir un plan concessif ou analytique sans se contredire.'),
    [b('Build a concessive plan without contradiction', 'Construire un plan concessif cohérent'), b('Use Topic + Explanation + Example inside each paragraph', 'Structurer Idée + Explication + Exemple'), b('Link paragraphs with sharp transitions', 'Enchaîner les paragraphes sans rupture')],
    13,
    [
      card(b('Two plans that always work at B2', 'Deux plans qui fonctionnent à coup sûr'), b('**Plan 1 (Concession → Standpoint)**: **Paragraph 1**: concede what is true on the other side (**Certes / Il est indéniable que…**). **Paragraph 2**: defend your main position with stronger arguments (**Toutefois / Il n’en demeure pas moins que…**). **Plan 2 (Causes → Solutions)** when asked to solve a local issue (**Noise, housing, waste**): analyse **root causes**, then propose **concrete solutions**.', '**Plan 1 (Concession → Position)** : **Paragraphe 1** : reconnaître la part de vérité adverse (**Certes / Il est indéniable que…**). **Paragraphe 2** : défendre votre position principale (**Toutefois / Il n’en demeure pas moins que…**). **Plan 2 (Causes → Solutions)** pour un problème concret : analyser **causes**, puis proposer **solutions réalistes**.')),
      mc(P.best, ['Si l’interdiction des emballages plastiques représente une contrainte pour les commerçants à court terme, elle demeure indispensable pour réduire durablement les déchets urbains.', 'Les plastiques sont horribles. Toutefois, j’adore les emballages pratiques et ils ne polluent pas.', 'Premièrement c’est bien, deuxièmement c’est pas bien, finalement je ne sais pas.', 'Il y a beaucoup de plastique partout et les gens jettent tout par terre.'], { fr: 'Quelle phrase assure une transition sans contradiction entre nuance et position défendue ?' }),
      ord(P.order, 'Il n’en demeure pas moins que cette réforme reste urgente.', { tr: 'The fact remains that this reform is urgent.' }),
      pairs(P.match, [['certes', b('admittedly', 'il est vrai que')], ['il n’en demeure pas moins que', b('nevertheless, the fact remains that', 'malgré cela, il reste vrai que')], ['à court terme', b('in the short term', 'dans l’immédiat')], ['en revanche', b('on the other hand', 'par opposition')]]),
      tip(b('Avoid contradicting your conclusion', 'Ne contredisez pas votre propre thèse'), b('Never praise an idea 100% in Paragraph 1 and attack it 100% in Paragraph 2! Signal from the start in Paragraph 1 that those points are **partial or secondary** (**Certes, certains avancent que…**).', 'Ne dites jamais tout blanc au §1 puis tout noir au §2 ! Indiquez dès le §1 que l’argument adverse n’est qu’un **aspect limité** (**Certes, certains avancent que…**).')),
    ],
    [
      b('Match Plan 1 (concession → standpoint) to debate prompts and Plan 2 (causes → solutions) to action letters.', 'Plan concessif pour un débat, plan causes/solutions pour une lettre d’action.'),
      b('Each paragraph needs one clear topic sentence, explanation and concrete example.', 'Chaque paragraphe développe une idée claire, expliquée et illustrée.'),
      b('Stay consistent between your introduction and conclusion.', 'Restez cohérent de l’introduction à la conclusion.'),
    ],
    [['demeurer', b('to remain', 'rester')], ['indispensable', b('essential', 'absolument nécessaire')], ['une contrainte', b('a constraint', 'limite, effort imposé')]],
  ),
  lesson(C, 3, ['formal-letters-and-concluding-formulas', 'lettres-formelles-et-formules-b2'],
    b('Writing formal letters: mayor, director, editor', 'Rédiger des lettres formelles B2'),
    b('Master formal openings, diplomatic complaints, concrete proposals and classic B2 closings.', 'Maîtriser entrées formelles, protestations polies, propositions et formules de politesse B2.'),
    [b('Open a formal letter without Englishisms', 'Ouvrir une lettre formelle sans calque'), b('Challenge a decision with diplomacy', 'Contester une décision avec diplomatie'), b('Close with the exact French prise de congé', 'Terminer avec la vraie formule de politesse')],
    13,
    [
      card(b('Formal letter anatomy (250 words)', 'Anatomie d’une lettre formelle (250 mots)'), b('Header: **Monsieur le Maire,** (never *Cher Maire*). Opening: **Je me permets de vous écrire afin d’attirer votre attention sur…** Diplomatic criticism: **Bien que je comprenne vos contraintes budgétaires, il me semble regrettable que…** Proposal: **C’est pourquoi je vous soumets deux propositions concrètes…** Closing: **Dans l’attente de votre réponse, je vous prie d’agréer, Monsieur le Maire, l’expression de mes salutations distinguées.**', 'Appel : **Monsieur le Maire,** (jamais *Cher Maire*). Entrée : **Je me permets de vous écrire afin d’attirer votre attention sur…** Critique diplomate : **Bien que je comprenne vos contraintes budgétaires, il me semble regrettable que…** Proposition : **C’est pourquoi je vous soumets deux propositions concrètes…** Finale : **Dans l’attente de votre réponse, je vous prie d’agréer, Monsieur le Maire, l’expression de mes salutations distinguées.**')),
      mc(P.best, ['Madame la Directrice,', 'Chère Madame Directrice,', 'Salut la Direction,', 'À Madame qui dirige l’école,'], { fr: 'Comment commencer une lettre formelle à une directrice d’établissement ?' }),
      mc(P.best, ['Je vous prie d’agréer, Monsieur le Maire, l’expression de mes salutations distinguées.', 'Merci d’avance et amicalement vôtre,', 'Meilleures salutations à bientôt, Jean.', 'Cordialement vôtre pour la mairie,'], { fr: 'Quelle formule finale convient à une lettre officielle au maire ?' }),
      write(b('DELF B2 Formal Letter (~230 words)', 'Lettre formelle DELF B2 (~230 mots)'), b('Your town council plans to close the local public swimming pool on weekday evenings to save energy. As president of a local sports association, write a formal letter to the Mayor (210–260 words): explain why evening access matters for workers and young people, acknowledge budget constraints, and propose two alternative savings measures.', 'La mairie envisage de fermer la piscine municipale en soirée la semaine pour économiser l’énergie. Président d’une association sportive, vous écrivez au maire (210–260 mots) : montrez l’importance des créneaux du soir, reconnaissez les contraintes budgétaires et proposez deux pistes d’économie.'), 210, 260, [
        b('Proper formal opening & closing formulas', 'Appel et formule finale corrects'),
        b('Subjunctive or formal concession used accurately', 'Subjonctif ou concession employés justement'),
        b('Two concrete alternative measures proposed', 'Deux solutions concrètes proposées'),
        b('210–260 words, clear formal paragraphs', '210 à 260 mots, paragraphes structurés'),
      ], 'Monsieur le Maire,\n\nEn tant que président de l’association sportive du quartier, je me permets de vous écrire afin d’attirer votre attention sur le projet de fermeture de la piscine municipale en soirée dès le mois prochain.\n\nCertes, chacun comprend les difficultés financières actuelles liées à la hausse du coût de l’énergie, et il est tout à fait légitime que la commune cherche à réduire ses dépenses publiques. Toutefois, supprimer les créneaux de 18 h à 21 h pénaliserait directement les salariés, les jeunes et les étudiants qui ne peuvent pratiquer de sport qu’après leur journée de travail ou de cours. De plus, cette piscine constitue un lieu essentiel de santé publique et de lien social pour plus de quatre cents adhérents réguliers.\n\nC’est pourquoi je vous soumets deux solutions alternatives plus équilibrées. Premièrement, il serait possible de baisser la température de l’eau d’un degré et d’installer des minuteurs sur les douches, ce qui permettrait des économies notables sans priver les habitants de l’équipement. Deuxièmement, la mairie pourrait regrouper les cours des clubs sur trois soirs précis et fermer uniquement le mardi soir, créneau historiquement le moins fréquenté de la semaine.\n\nEspérant vivement que ces propositions constructives retiendront votre attention et restant à votre entière disposition pour en discuter lors d’un rendez-vous, je vous prie d’agréer, Monsieur le Maire, l’expression de mes salutations distinguées.\n\nMarc Delacroix', { phrases: ['Je me permets de vous écrire afin de…', 'Certes… Toutefois…', 'C’est pourquoi je vous soumets…', 'Je vous prie d’agréer…'] }),
    ],
    [
      b('Never address an official with « Cher / Chère » — write « Monsieur le Maire, », « Madame la Directrice, ».', 'Jamais de « Cher » pour une autorité : « Monsieur le Maire, », « Madame la Directrice, ».'),
      b('Match the opening title inside the closing formula.', 'Reprenez exactement le même titre dans la formule finale.'),
      b('Offer constructive alternatives whenever you critique a decision.', 'Appuyez toujours une critique sur des propositions réalistes.'),
    ],
    [['attirer l’attention sur', b('to draw attention to', 'signaler l’importance de')], ['soumettre une proposition', b('to submit a proposal', 'présenter une idée')], ['un créneau horaire', b('a time slot', 'plage d’heures')]],
  ),
];
