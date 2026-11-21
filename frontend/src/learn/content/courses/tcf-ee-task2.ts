import type { CourseAbout } from '../../types';
import { b, card, doc, exam, gap, lesson, mc, ord, P, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Task 2 of the TCF writing test asks for a text of about 120 to 150 words, such as a blog post, an article or a message to a group, in which you tell an experience and give your impressions or an opinion. You must narrate in the past (passé composé and imparfait), describe, react and engage your reader. This course gives you a narrative structure, the key past-tense techniques and models.',
    'La tâche 2 de l’expression écrite du TCF demande un texte d’environ 120 à 150 mots, comme un billet de blog, un article ou un message à un groupe, dans lequel vous racontez une expérience et donnez vos impressions ou votre avis. Il faut raconter au passé (passé composé et imparfait), décrire, réagir et impliquer le lecteur. Ce cours vous donne une structure narrative, les techniques clés du passé et des modèles.',
  ),
  outcomes: [
    b('Tell an experience in the past', 'Raconter une expérience au passé'),
    b('Mix passé composé and imparfait', 'Combiner passé composé et imparfait'),
    b('Give impressions and opinions', 'Donner ses impressions et son avis'),
    b('Write a 120–150-word article', 'Rédiger un article de 120–150 mots'),
  ],
};

const C = 'tcf-ee-task2';
export default [
  lesson(C, 1, ['the-task-and-structure', 'la-tache-et-la-structure'],
    b('The task and a narrative structure', 'La tâche et une structure narrative'),
    b('Understand task 2 and organise an experience into a clear article.', 'Comprendre la tâche 2 et organiser une expérience en article clair.'),
    [b('Know the task 2 format', 'Connaître le format de la tâche 2'), b('Use a 4-part narrative plan', 'Utiliser un plan narratif en 4 parties'), b('Write an engaging title', 'Rédiger un titre accrocheur')],
    13,
    [
      exam(b('Task 2', 'Tâche 2'), b('**About 120–150 words**. Typical instructions: **« Vous avez participé à… Racontez votre expérience sur un blog et donnez vos impressions »** or **« Écrivez un article pour le journal de votre quartier sur… »**. Allow about **20 minutes**. Assessed: **telling + describing + giving impressions**, coherence, past tenses, richer vocabulary than task 1.', '**Environ 120 à 150 mots**. Consignes typiques : **« Vous avez participé à… Racontez votre expérience sur un blog et donnez vos impressions »** ou **« Écrivez un article pour le journal de votre quartier sur… »**. Prévoyez environ **20 minutes**. Critères : **raconter + décrire + donner ses impressions**, cohérence, temps du passé, lexique plus riche qu’en tâche 1.')),
      card(b('4-part plan', 'Plan en 4 parties'), b('**Title** (optional but appreciated). 1. **Context**: when, where, who (imparfait for the setting). 2. **Events**: what happened, in order (passé composé + d’abord, ensuite, soudain, finalement). 3. **Impressions**: how you felt, what you learned (c’était…, j’ai trouvé que…). 4. **Conclusion / advice to readers**: Je vous le recommande ! · Et vous, … ?', '**Titre** (facultatif mais apprécié). 1. **Contexte** : quand, où, qui (imparfait pour le cadre). 2. **Événements** : ce qui s’est passé, dans l’ordre (passé composé + d’abord, ensuite, soudain, finalement). 3. **Impressions** : ce que vous avez ressenti, appris (c’était…, j’ai trouvé que…). 4. **Conclusion / conseil aux lecteurs** : Je vous le recommande ! · Et vous, … ?')),
      doc({ look: 'page', title: b('Instruction', 'Consigne'), text: 'Vous avez participé à une journée de bénévolat dans votre ville. Vous racontez cette expérience sur votre blog et vous donnez vos impressions. (120 mots minimum, 150 mots maximum)' }, b('What must the text contain?', 'Que doit contenir le texte ?'), [b('the story of the day and your impressions', 'le récit de la journée et vos impressions'), b('only a list of volunteers', 'seulement une liste de bénévoles'), b('an invitation for next week', 'une invitation pour la semaine prochaine'), b('a formal complaint', 'une réclamation formelle')]),
      sort(b('Which part of the plan?', 'Quelle partie du plan ?'), [b('context', 'contexte'), b('events', 'événements'), b('impressions / conclusion', 'impressions / conclusion')], [['C’était un samedi de septembre, il faisait doux.', 0], ['D’abord, nous avons ramassé les déchets au bord du fleuve.', 1], ['J’ai trouvé l’ambiance incroyablement chaleureuse.', 2], ['Nous étions une trentaine de bénévoles.', 0], ['Ensuite, on a planté des arbres.', 1], ['Je vous recommande vivement l’expérience !', 2]]),
      mc(P.best, ['Un samedi utile et joyeux au bord du fleuve', 'Mon texte', 'Bénévolat', 'Tâche 2'], { fr: 'Quel titre est le plus accrocheur ?' }),
    ],
    [
      b('120–150 words; tell, describe, give impressions.', '120–150 mots ; raconter, décrire, donner ses impressions.'),
      b('Plan: context, events, impressions, conclusion.', 'Plan : contexte, événements, impressions, conclusion.'),
      b('A short catchy title is a plus.', 'Un titre court et accrocheur est un plus.'),
    ],
    [['ramasser', b('to pick up', 'prendre par terre')], ['chaleureux', b('warm, friendly', 'accueillant')], ['un fleuve', b('a (large) river', 'grande rivière')]],
  ),
  lesson(C, 2, ['past-tenses-in-action', 'les-temps-du-passe-en-action'],
    b('Past tenses in action', 'Les temps du passé en action'),
    b('Use the imparfait for the setting and the passé composé for events.', 'Employer l’imparfait pour le cadre et le passé composé pour les événements.'),
    [b('Imparfait for description', 'Imparfait pour la description'), b('Passé composé for events', 'Passé composé pour les événements'), b('Express impressions', 'Exprimer ses impressions')],
    13,
    [
      card(b('Setting vs events', 'Cadre et événements'), b('**Imparfait** = background: **il faisait beau, nous étions nombreux, l’ambiance était festive**. **Passé composé** = actions in sequence: **nous avons commencé à 9 h, j’ai rencontré une retraitée passionnante**. Interruption: **Nous plantions les arbres quand il a commencé à pleuvoir.** Impressions: **J’ai été surpris(e) par… · Ce qui m’a le plus marqué(e), c’est… · Je ne m’attendais pas à…**', '**Imparfait** = arrière-plan : **il faisait beau, nous étions nombreux, l’ambiance était festive**. **Passé composé** = actions successives : **nous avons commencé à 9 h, j’ai rencontré une retraitée passionnante**. Interruption : **Nous plantions les arbres quand il a commencé à pleuvoir.** Impressions : **J’ai été surpris(e) par… · Ce qui m’a le plus marqué(e), c’est… · Je ne m’attendais pas à…**')),
      gap(P.completeText, 'Ce matin-là, il ___ (faire) froid et nous ___ (être) une trentaine. Nous ___ (commencer) à huit heures. Nous ramassions des déchets quand un journaliste ___ (arriver).', ['faisait', 'étions', 'avons commencé', 'est arrivé']),
      sort(b('Imparfait or passé composé?', 'Imparfait ou passé composé ?'), [b('imparfait (setting)', 'imparfait (cadre)'), b('passé composé (event)', 'passé composé (événement)')], [['il y avait beaucoup de monde', 0], ['nous avons planté cinquante arbres', 1], ['l’ambiance était joyeuse', 0], ['une enfant m’a offert un dessin', 1], ['le soleil brillait', 0], ['la mairesse est venue nous remercier', 1]]),
      mc(P.best, ['Ce qui m’a le plus marqué, c’est la générosité des habitants.', 'C’était bien.', 'J’ai aimé.', 'Bénévolat bien.'], { fr: 'Quelle phrase exprime le mieux une impression ?' }),
      ord(P.order, 'Je ne m’attendais pas à rencontrer autant de personnes passionnantes.', { tr: 'I didn’t expect to meet so many fascinating people.' }),
    ],
    [
      b('Imparfait: setting, weather, feelings, background.', 'Imparfait : cadre, météo, sentiments, arrière-plan.'),
      b('Passé composé: events in sequence.', 'Passé composé : événements successifs.'),
      b('Impressions: Ce qui m’a le plus marqué, c’est… Je ne m’attendais pas à…', 'Impressions : Ce qui m’a le plus marqué, c’est… Je ne m’attendais pas à…'),
    ],
    [['un retraité', b('a retiree', 'personne à la retraite')], ['la mairesse', b('the mayor (woman, Québec)', 'femme maire')], ['marquer', b('to leave an impression', 'impressionner')]],
  ),
  lesson(C, 3, ['full-article', 'article-complet'],
    b('A complete article', 'Un article complet'),
    b('Write and check a full task 2 article.', 'Rédiger et vérifier un article complet de tâche 2.'),
    [b('Write a full article', 'Rédiger un article complet'), b('Engage the reader', 'Impliquer le lecteur'), b('Check tenses and length', 'Vérifier les temps et la longueur')],
    13,
    [
      write(b('Your blog post', 'Votre billet de blog'), b('Instruction: You took part in a volunteering day in your city. Tell the experience on your blog and give your impressions (120–150 words).', 'Consigne : Vous avez participé à une journée de bénévolat dans votre ville. Racontez cette expérience sur votre blog et donnez vos impressions (120–150 mots).'), 120, 150, [
        b('Context with imparfait', 'Contexte à l’imparfait'),
        b('Events with passé composé', 'Événements au passé composé'),
        b('Impressions and a conclusion to readers', 'Impressions et conclusion pour les lecteurs'),
      ], 'Un samedi utile et joyeux\n\nSamedi dernier, j’ai participé à ma première journée de bénévolat. Il faisait frais, mais le soleil brillait et nous étions une trentaine au bord du fleuve. D’abord, nous avons ramassé des déchets : bouteilles, sacs, et même un vieux vélo ! Ensuite, nous avons planté une cinquantaine de jeunes arbres avec l’aide d’un jardinier de la ville. À midi, une association nous a offert un repas.\n\nCe qui m’a le plus marquée, c’est l’ambiance : des étudiants, des familles et des retraités travaillaient ensemble en riant. Je ne m’attendais pas à me faire autant d’amis en une journée. Le soir, j’étais fatiguée, mais vraiment fière du travail accompli.\n\nJe vous recommande vivement l’expérience. Et vous, avez-vous déjà fait du bénévolat ?'),
      sort(b('Engaging the reader', 'Impliquer le lecteur'), [b('engages the reader', 'implique le lecteur'), b('neutral', 'neutre')], [['Et vous, avez-vous déjà essayé ?', 0], ['La journée a eu lieu samedi.', 1], ['Je vous le recommande vivement !', 0], ['Il y avait trente bénévoles.', 1], ['N’hésitez pas à me raconter vos expériences !', 0], ['Nous avons commencé à 9 h.', 1]]),
      tip(b('Checklist', 'Liste de vérification'), b('**120–150 words? Title? Context in the imparfait? Events in the passé composé with être/avoir correct? Impressions? A sentence for the reader?** Then agreements (nous sommes allés / allées) and accents.', '**120–150 mots ? Titre ? Contexte à l’imparfait ? Événements au passé composé avec le bon auxiliaire ? Impressions ? Une phrase pour le lecteur ?** Puis les accords (nous sommes allés / allées) et les accents.')),
      mc(P.form, ['Nous sommes arrivés à neuf heures et nous avons travaillé toute la journée.', 'Nous avons arrivés à neuf heures et nous sommes travaillé toute la journée.', 'Nous arrivions à neuf heures et nous travaillons toute la journée hier.', 'Nous sommes arrivé à neuf heures et nous avons travaillés.']),
    ],
    [
      b('Title, context, events, impressions, reader engagement.', 'Titre, contexte, événements, impressions, implication du lecteur.'),
      b('Check auxiliaries and agreements in the passé composé.', 'Vérifiez auxiliaires et accords au passé composé.'),
      b('120–150 words.', '120–150 mots.'),
    ],
    [['vivement', b('strongly', 'fortement')], ['un jardinier', b('a gardener', 'qui s’occupe des plantes')], ['en riant', b('laughing', 'avec le sourire')]],
  ),
];
