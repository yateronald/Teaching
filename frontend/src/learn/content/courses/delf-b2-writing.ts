import type { CourseAbout } from '../../types';
import { b, card, doc, exam, gap, lesson, mc, ord, P, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The DELF B2 writing test (about 1 hour) asks for an argued text of at least 250 words: a formal letter (complaint, request, opinion), an article or an essay, defending a clear position. This course teaches the B2 method: analysing the instruction, building a progressive plan, writing paragraphs with topic sentences, using precise connectors and formal register, and proofreading the classic B2 errors.',
    'L’épreuve de production écrite du DELF B2 (environ 1 heure) demande un texte argumenté d’au moins 250 mots : lettre formelle (réclamation, demande, opinion), article ou essai, défendant une position claire. Ce cours enseigne la méthode du B2 : analyser la consigne, construire un plan progressif, rédiger des paragraphes avec une idée directrice, employer des connecteurs précis et un registre soutenu, et relire les erreurs classiques du B2.',
  ),
  outcomes: [
    b('Analyse a B2 instruction', 'Analyser une consigne de B2'),
    b('Build a progressive argumentative plan', 'Construire un plan argumentatif progressif'),
    b('Write a formal letter or an article', 'Rédiger une lettre formelle ou un article'),
    b('Avoid the classic B2 errors', 'Éviter les erreurs classiques du B2'),
  ],
};

const C = 'delf-b2-writing';
export default [
  lesson(C, 1, ['instruction-and-plan', 'consigne-et-plan'],
    b('Instruction and plan', 'Consigne et plan'),
    b('Analyse the situation and build a progressive plan.', 'Analyser la situation et construire un plan progressif.'),
    [b('Identify role, reader, goal', 'Identifier rôle, destinataire, objectif'), b('Choose a plan type', 'Choisir un type de plan'), b('Write topic sentences', 'Rédiger les idées directrices')],
    13,
    [
      exam(b('The B2 writing test', 'La production écrite B2'), b('About **1 hour**, **250 words minimum**. A realistic situation: you are a **resident, employee, parent, student**; you write to **a newspaper, a mayor, a director, a company**. Goal: **defend a position, protest, propose, convince**. Assessment: **respect of the situation, coherent argument, clear position, rich vocabulary, complex sentences, register**.', 'Environ **1 heure**, **250 mots minimum**. Une situation réaliste : vous êtes **habitant, salarié, parent, étudiant** ; vous écrivez à **un journal, un maire, un directeur, une entreprise**. Objectif : **défendre une position, protester, proposer, convaincre**. Critères : **respect de la situation, argumentation cohérente, position claire, lexique riche, phrases complexes, registre**.')),
      doc({ look: 'page', title: b('Instruction', 'Consigne'), text: 'La mairie de votre ville a décidé de fermer la bibliothèque du quartier pour la remplacer par un parking. Vous écrivez au maire pour protester contre cette décision et proposer d’autres solutions. (250 mots minimum)' }, b('What must the letter do?', 'Que doit faire la lettre ?'), [b('protest and propose alternatives, in a formal letter to the mayor', 'protester et proposer des solutions, dans une lettre formelle au maire'), b('thank the mayor', 'remercier le maire'), b('describe the library', 'décrire la bibliothèque'), b('ask for a parking space', 'demander une place de parking')]),
      card(b('A progressive plan', 'Un plan progressif'), b('**Introduction**: who you are + reason for writing + position. **Paragraph 1**: the strongest argument (+ example). **Paragraph 2**: a second argument (+ example). **Paragraph 3**: a concession and/or **proposals**. **Conclusion**: summary + request / call to action + formal closing. Each paragraph starts with a **topic sentence**.', '**Introduction** : qui vous êtes + raison de la lettre + position. **Paragraphe 1** : l’argument le plus fort (+ exemple). **Paragraphe 2** : un deuxième argument (+ exemple). **Paragraphe 3** : une concession et/ou des **propositions**. **Conclusion** : synthèse + demande / appel à l’action + formule de politesse. Chaque paragraphe commence par une **idée directrice**.')),
      sort(b('Which part of the letter?', 'Quelle partie de la lettre ?'), [b('introduction', 'introduction'), b('argument', 'argument'), b('proposal / conclusion', 'proposition / conclusion')], [['Habitant du quartier depuis dix ans, je me permets de vous écrire…', 0], ['Tout d’abord, cette bibliothèque est un lieu essentiel pour les enfants.', 1], ['Je vous propose donc d’étudier d’autres terrains pour ce parking.', 2], ['C’est avec stupéfaction que j’ai appris votre décision…', 0], ['Par ailleurs, elle accueille de nombreuses associations.', 1], ['Dans l’attente de votre réponse, je vous prie d’agréer…', 2]]),
      mc(P.best, ['Habitante du quartier des Lilas depuis douze ans, je me permets de vous écrire au sujet de la fermeture annoncée de notre bibliothèque, une décision que je regrette profondément.', 'Salut monsieur le maire, la bibliothèque, c’est nul de la fermer !', 'Je vous écris.', 'La bibliothèque a été construite en 1975 et compte 20 000 livres.'], { fr: 'Quelle introduction est la meilleure ?' }),
    ],
    [
      b('1 hour, 250 words minimum, formal and argued.', '1 heure, 250 mots minimum, formel et argumenté.'),
      b('Identify role, reader, goal and every requirement.', 'Identifiez rôle, destinataire, objectif et chaque exigence.'),
      b('Plan: introduction, 2 arguments, concession/proposals, conclusion.', 'Plan : introduction, 2 arguments, concession/propositions, conclusion.'),
    ],
    [['la stupéfaction', b('astonishment', 'grande surprise')], ['un terrain', b('a plot of land', 'espace')], ['une idée directrice', b('a topic sentence', 'idée principale du paragraphe')]],
  ),
  lesson(C, 2, ['formal-language-and-connectors', 'registre-soutenu-et-connecteurs'],
    b('Formal language and connectors', 'Registre soutenu et connecteurs'),
    b('Raise your register and link ideas precisely.', 'Élever son registre et relier les idées avec précision.'),
    [b('Use formal formulas', 'Employer les formules soutenues'), b('Use precise connectors', 'Employer des connecteurs précis'), b('Vary sentence structures', 'Varier les structures de phrases')],
    13,
    [
      card(b('Formal toolkit', 'Boîte à outils soutenue'), b('Openings: **Je me permets de vous écrire au sujet de… · C’est avec un vif intérêt / une grande inquiétude que…** Argument: **Il convient de souligner que… · Force est de constater que… · Il est indéniable que…** Proposal: **Ne serait-il pas préférable de… ? · Je suggère que + subjonctif.** Closing: **Je vous prie d’agréer, Monsieur le Maire, l’expression de ma considération distinguée.**', 'Ouverture : **Je me permets de vous écrire au sujet de… · C’est avec un vif intérêt / une grande inquiétude que…** Argument : **Il convient de souligner que… · Force est de constater que… · Il est indéniable que…** Proposition : **Ne serait-il pas préférable de… ? · Je suggère que + subjonctif.** Clôture : **Je vous prie d’agréer, Monsieur le Maire, l’expression de ma considération distinguée.**')),
      sort(b('Familiar or formal?', 'Familier ou soutenu ?'), [b('too familiar', 'trop familier'), b('formal (B2)', 'soutenu (B2)')], [['C’est trop nul.', 0], ['Cette décision me paraît regrettable.', 1], ['Y a plein de gens qui…', 0], ['De nombreux habitants…', 1], ['Franchement, ça craint.', 0], ['Force est de constater que…', 1]]),
      mc(P.form, ['Je suggère que la mairie organise une consultation des habitants.', 'Je suggère que la mairie organisera une consultation des habitants.', 'Je suggère que la mairie organiserait une consultation des habitants.', 'Je suggère de la mairie organise une consultation.']),
      gap(P.complete, 'Il ___ de souligner que cette bibliothèque accueille 300 enfants par semaine. ___ est de constater que le quartier manque déjà de lieux culturels.', ['convient', 'Force']),
      ord(P.order, 'Ne serait-il pas préférable de construire ce parking ailleurs ?', { tr: 'Would it not be preferable to build this car park elsewhere?' }),
    ],
    [
      b('Formal openings: Je me permets de…, C’est avec… que…', 'Ouvertures soutenues : Je me permets de…, C’est avec… que…'),
      b('Argument: il convient de souligner, force est de constater, il est indéniable.', 'Argument : il convient de souligner, force est de constater, il est indéniable.'),
      b('Proposals: Ne serait-il pas préférable de… ? Je suggère que + subjonctif.', 'Propositions : Ne serait-il pas préférable de… ? Je suggère que + subjonctif.'),
    ],
    [['une consultation', b('a consultation', 'demande d’avis')], ['regrettable', b('regrettable', 'qu’on regrette')], ['ailleurs', b('elsewhere', 'à un autre endroit')]],
  ),
  lesson(C, 3, ['full-text-and-errors', 'texte-complet-et-erreurs'],
    b('A full text and the classic errors', 'Un texte complet et les erreurs classiques'),
    b('Write a complete 250-word letter and correct the most frequent B2 errors.', 'Rédiger une lettre complète de 250 mots et corriger les erreurs les plus fréquentes du B2.'),
    [b('Write the full letter', 'Rédiger la lettre complète'), b('Spot classic B2 errors', 'Repérer les erreurs classiques du B2'), b('Proofread efficiently', 'Relire efficacement')],
    13,
    [
      card(b('Classic B2 errors', 'Les erreurs classiques du B2'), b('**Subjunctive missing** (bien que, il faut que, je souhaite que). **Agreement of the past participle**. **Anglicisms**: « ça fait sens » → **cela a du sens**; « supporter » (soutenir) → **soutenir**. **Prepositions**: **dépendre de, s’intéresser à, participer à**. **Repetition**: vary with synonyms. **Register breaks** (« ça », « y a », « super »).', '**Subjonctif oublié** (bien que, il faut que, je souhaite que). **Accord du participe passé**. **Anglicismes** : « ça fait sens » → **cela a du sens** ; « supporter » (au sens de soutenir) → **soutenir**. **Prépositions** : **dépendre de, s’intéresser à, participer à**. **Répétitions** : variez avec des synonymes. **Ruptures de registre** (« ça », « y a », « super »).')),
      doc({ look: 'letter', title: b('Spot the errors', 'Repérez les erreurs'), text: 'Bien que cette décision est sans doute justifiée économiquement, je pense que ça fait pas sens de fermer un lieu qui supporte tant d’associations.' }, b('Which corrections are needed?', 'Quelles corrections faut-il ?'), [b('soit (subjunctive), cela n’a pas de sens, soutient', 'soit (subjonctif), cela n’a pas de sens, soutient'), b('none', 'aucune'), b('only « est » → « était »', 'seulement « est » → « était »'), b('only add « ne »', 'seulement ajouter « ne »')]),
      mc(P.form, ['Cette mesure dépend de l’accord du conseil municipal.', 'Cette mesure dépend sur l’accord du conseil municipal.', 'Cette mesure dépend à l’accord du conseil municipal.', 'Cette mesure dépend l’accord du conseil municipal.']),
      write(b('Your B2 letter', 'Votre lettre B2'), b('Write the complete letter to the mayor (250–300 words): introduction, two arguments with examples, proposals, formal conclusion.', 'Rédigez la lettre complète au maire (250–300 mots) : introduction, deux arguments avec exemples, propositions, conclusion soutenue.'), 250, 330, [
        b('Formal introduction with your position', 'Introduction soutenue avec votre position'),
        b('Two arguments with examples', 'Deux arguments avec exemples'),
        b('Proposals and formal closing', 'Propositions et formule finale'),
      ], 'Monsieur le Maire,\n\nHabitante du quartier des Lilas depuis douze ans, je me permets de vous écrire au sujet de la fermeture annoncée de notre bibliothèque, remplacée par un parking. Cette décision me paraît profondément regrettable.\n\nTout d’abord, il convient de souligner que cette bibliothèque est bien plus qu’un lieu de prêt de livres. Chaque semaine, elle accueille des centaines d’enfants, notamment pour l’aide aux devoirs. Pour de nombreuses familles du quartier, qui n’ont pas de connexion à domicile, c’est aussi le seul accès à internet.\n\nPar ailleurs, force est de constater que notre quartier manque déjà de lieux culturels et de rencontre. Les associations de seniors et les ateliers de conversation pour les nouveaux arrivants s’y réunissent régulièrement. Les priver de cet espace reviendrait à affaiblir les liens qui font la richesse de notre quartier. De surcroît, la bibliothèque organise chaque mois des expositions d’artistes locaux et des lectures publiques qui attirent un large public, bien au-delà du quartier. Supprimer ce lieu enverrait un bien mauvais signal à tous ceux qui s’engagent pour la vie culturelle de notre ville, alors même que la municipalité affirme vouloir la soutenir.\n\nCertes, je comprends que le stationnement pose problème, en particulier le samedi. Néanmoins, ne serait-il pas préférable d’aménager le terrain vacant situé derrière la gare, ou de développer les navettes vers le centre ? Je suggère également que la mairie organise une consultation des habitants avant toute décision définitive.\n\nDans l’espoir que ces propositions retiendront votre attention, je vous prie d’agréer, Monsieur le Maire, l’expression de ma considération distinguée.\n\nAmina Benali'),
      tip(b('Count, then check', 'Comptez, puis vérifiez'), b('Under **250 words**, you are penalised. Count roughly (≈ 10 words per line), then check verbs, agreements, prepositions and register in separate passes.', 'Sous **250 mots**, vous êtes pénalisé. Comptez approximativement (≈ 10 mots par ligne), puis vérifiez verbes, accords, prépositions et registre en passages séparés.')),
    ],
    [
      b('Classic errors: subjunctive, participles, anglicisms, prepositions, register.', 'Erreurs classiques : subjonctif, participes, anglicismes, prépositions, registre.'),
      b('cela a du sens; soutenir; dépendre de.', 'cela a du sens ; soutenir ; dépendre de.'),
      b('250 words minimum; proofread in passes.', '250 mots minimum ; relisez en plusieurs passages.'),
    ],
    [['aménager', b('to develop, to fit out', 'organiser un espace')], ['une navette', b('a shuttle', 'transport régulier')], ['affaiblir', b('to weaken', 'rendre plus faible')]],
  ),
];
