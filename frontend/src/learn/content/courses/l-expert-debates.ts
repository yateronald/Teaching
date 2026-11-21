import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Expert debates are the hardest listening of all: dense arguments, technical vocabulary, figures, references to studies, implicit disagreements and fast interruptions. This C2 course trains you on original exchanges between experts on artificial intelligence, the energy transition and public health, to follow complex reasoning, evaluate the strength of arguments and summarise the debate faithfully.',
    'Les débats d’experts sont l’écoute la plus exigeante : arguments denses, vocabulaire technique, chiffres, références à des études, désaccords implicites et interruptions rapides. Ce cours de niveau C2 vous entraîne sur des échanges originaux entre experts sur l’intelligence artificielle, la transition énergétique et la santé publique, pour suivre un raisonnement complexe, évaluer la solidité des arguments et résumer fidèlement le débat.',
  ),
  outcomes: [
    b('Follow dense technical reasoning', 'Suivre un raisonnement technique dense'),
    b('Evaluate the strength of an argument', 'Évaluer la solidité d’un argument'),
    b('Identify implicit disagreements', 'Repérer les désaccords implicites'),
    b('Summarise an expert debate faithfully', 'Résumer fidèlement un débat d’experts'),
  ],
};

const C = 'l-expert-debates';
export default [
  lesson(C, 1, ['ai-and-work', 'ia-et-travail'],
    b('Artificial intelligence and work', 'L’intelligence artificielle et le travail'),
    b('Follow two experts with opposite readings of the same data.', 'Suivre deux experts qui lisent différemment les mêmes données.'),
    [b('Understand technical vocabulary', 'Comprendre le vocabulaire technique'), b('Compare two interpretations', 'Comparer deux interprétations'), b('Spot the underlying disagreement', 'Repérer le désaccord de fond')],
    13,
    [
      card(b('Reading the same data', 'Lire les mêmes données'), b('Experts often **agree on the facts** but **disagree on their interpretation**: **Les chiffres sont clairs, mais ce qu’ils signifient…**, **Encore faut-il distinguer…**, **C’est une lecture possible, mais pas la seule.**', 'Les experts sont souvent **d’accord sur les faits** mais **en désaccord sur leur interprétation** : **Les chiffres sont clairs, mais ce qu’ils signifient…**, **Encore faut-il distinguer…**, **C’est une lecture possible, mais pas la seule.**')),
      hear('Selon l’étude, près de trente pour cent des tâches administratives pourraient être automatisées d’ici dix ans. Ce n’est pas une destruction d’emplois, c’est une transformation des métiers.', b('How does this expert interpret the figure?', 'Comment cette experte interprète-t-elle le chiffre ?'), [b('As a transformation of jobs, not their destruction', 'Comme une transformation des métiers, pas une destruction d’emplois'), b('As mass unemployment', 'Comme un chômage de masse'), b('As irrelevant', 'Comme sans importance'), b('As a mistake in the study', 'Comme une erreur de l’étude')]),
      hear('Encore faut-il distinguer les tâches des emplois. Quand trente pour cent des tâches disparaissent, certains postes, eux, disparaissent entièrement, notamment chez les moins qualifiés.', b('What is his objection?', 'Quelle est son objection ?'), [b('Some whole jobs will disappear, especially low-skilled ones', 'Certains postes disparaîtront entièrement, surtout les moins qualifiés'), b('The study is false', 'L’étude est fausse'), b('Nothing will change', 'Rien ne changera'), b('Only managers will lose jobs', 'Seuls les cadres perdront leur emploi')]),
      hear('Sur ce point, nous sommes d’accord : sans un effort massif de formation continue, la transition se fera au détriment des plus vulnérables.', b('On what do they agree?', 'Sur quoi sont-ils d’accord ?'), [b('Massive continuing training is needed to protect the vulnerable', 'Une formation continue massive est nécessaire pour protéger les plus vulnérables'), b('AI should be banned', 'Il faut interdire l’IA'), b('Nothing will happen for ten years', 'Rien ne se passera avant dix ans'), b('Training is useless', 'La formation est inutile')]),
      pairs(P.match, [['automatiser', b('to automate', 'confier aux machines')], ['encore faut-il…', b('one still has to…', 'il faudrait d’abord…')], ['au détriment de', b('at the expense of', 'aux dépens de')], ['la formation continue', b('continuing education', 'formation tout au long de la vie')]]),
      sort(b('Fact or interpretation?', 'Fait ou interprétation ?'), [b('fact / data', 'fait / donnée'), b('interpretation', 'interprétation')], [['30 % des tâches automatisables', 0], ['C’est une transformation des métiers', 1], ['d’ici dix ans, selon l’étude', 0], ['les moins qualifiés seront les plus touchés', 1]]),
      dict('Encore faut-il distinguer les tâches des emplois.', { voice: 'm' }),
    ],
    [
      b('Same data, different readings: facts vs interpretation.', 'Mêmes données, lectures différentes : faits / interprétation.'),
      b('Encore faut-il… = introduces a decisive nuance.', 'Encore faut-il… = introduit une nuance décisive.'),
      b('au détriment de = at the expense of.', 'au détriment de = aux dépens de.'),
    ],
    [['une tâche', b('a task', 'travail précis')], ['qualifié', b('skilled', 'formé')], ['vulnérable', b('vulnerable', 'fragile')]],
  ),
  lesson(C, 2, ['energy-transition', 'transition-energetique'],
    b('The energy transition', 'La transition énergétique'),
    b('Evaluate the strength of arguments based on figures and studies.', 'Évaluer la solidité d’arguments fondés sur des chiffres et des études.'),
    [b('Recognise argument by authority and by data', 'Reconnaître l’argument d’autorité et l’argument chiffré'), b('Spot a weak argument', 'Repérer un argument faible'), b('Understand technical figures', 'Comprendre les chiffres techniques')],
    13,
    [
      tip(b('Strong or weak?', 'Solide ou fragile ?'), b('A strong argument relies on **verifiable data** and **causal reasoning**. A weaker one relies on a **single example**, an **authority without data**, or a **generalisation** (**tout le monde sait que…**). C2 listeners notice the difference.', 'Un argument solide repose sur des **données vérifiables** et un **raisonnement causal**. Un argument plus fragile repose sur un **exemple isolé**, une **autorité sans données** ou une **généralisation** (**tout le monde sait que…**). À l’écoute, le niveau C2 perçoit la différence.')),
      hear('Les coûts de production de l’énergie solaire ont baissé de près de quatre-vingt-dix pour cent en dix ans ; c’est désormais l’électricité la moins chère dans de nombreux pays.', b('What kind of argument is this?', 'De quel type d’argument s’agit-il ?'), [b('An argument based on figures', 'Un argument chiffré'), b('A personal anecdote', 'Une anecdote personnelle'), b('A generalisation', 'Une généralisation'), b('An insult', 'Une attaque personnelle')]),
      hear('Moi, j’ai un voisin qui a installé des panneaux solaires, et il n’en est pas content. Ça prouve bien que ça ne marche pas.', b('Why is this argument weak?', 'Pourquoi cet argument est-il fragile ?'), [b('It generalises from a single example', 'Il généralise à partir d’un exemple isolé'), b('It uses too many figures', 'Il utilise trop de chiffres'), b('It quotes a study', 'Il cite une étude'), b('It is too technical', 'Il est trop technique')]),
      hear('Le vrai défi n’est pas la production, mais le stockage : sans batteries performantes, l’intermittence du solaire et de l’éolien reste un obstacle majeur.', b('What is the « real challenge » according to this expert?', 'Quel est le « vrai défi » selon cet expert ?'), [b('Storage, because solar and wind are intermittent', 'Le stockage, à cause de l’intermittence du solaire et de l’éolien'), b('Production costs', 'Les coûts de production'), b('Public opinion', 'L’opinion publique'), b('The price of oil', 'Le prix du pétrole')]),
      pairs(P.match, [['l’intermittence', b('intermittency', 'production irrégulière')], ['le stockage', b('storage', 'fait de stocker')], ['l’éolien', b('wind power', 'énergie du vent')], ['performant', b('efficient, high-performing', 'efficace')]]),
      sort(b('Strong or weak argument?', 'Argument solide ou fragile ?'), [b('strong', 'solide'), b('weak', 'fragile')], [['Les coûts ont baissé de 90 % selon l’Agence internationale de l’énergie.', 0], ['Mon voisin n’est pas content.', 1], ['Une étude sur 20 pays montre que…', 0], ['Tout le monde sait que ça ne marche pas.', 1]]),
      dict('Le vrai défi n’est pas la production, mais le stockage de l’énergie.', { voice: 'f' }),
    ],
    [
      b('Strong: verifiable data, causal reasoning.', 'Solide : données vérifiables, raisonnement causal.'),
      b('Weak: single example, generalisation, authority without data.', 'Fragile : exemple isolé, généralisation, autorité sans données.'),
      b('Le vrai défi n’est pas X, mais Y = reframing the problem.', 'Le vrai défi n’est pas X, mais Y = recadrage du problème.'),
    ],
    [['un panneau solaire', b('a solar panel', 'capteur d’énergie solaire')], ['un obstacle', b('an obstacle', 'frein')], ['désormais', b('now, from now on', 'à présent')]],
  ),
  lesson(C, 3, ['summarising-a-debate', 'resumer-un-debat'],
    b('Public health: summarising a debate', 'Santé publique : résumer un débat'),
    b('Follow a three-way debate and summarise the positions faithfully.', 'Suivre un débat à trois voix et résumer fidèlement les positions.'),
    [b('Identify three positions', 'Identifier trois positions'), b('Remain neutral when summarising', 'Rester neutre en résumant'), b('Write a faithful summary', 'Rédiger un résumé fidèle')],
    13,
    [
      hear('Taxer les boissons sucrées réduit leur consommation : les données de plusieurs pays le montrent. C’est une mesure simple et efficace.', b('What is the first expert’s position?', 'Quelle est la position de la première experte ?'), [b('For a tax on sugary drinks, based on data', 'Pour une taxe sur les boissons sucrées, données à l’appui'), b('Against any tax', 'Contre toute taxe'), b('For banning sugar', 'Pour l’interdiction du sucre'), b('Undecided', 'Indécise')]),
      hear('Une taxe pèse d’abord sur les ménages modestes. Je préférerais miser sur l’éducation et l’étiquetage nutritionnel.', b('What does the second expert propose?', 'Que propose le deuxième expert ?'), [b('Education and nutrition labelling instead of a tax', 'L’éducation et l’étiquetage nutritionnel plutôt qu’une taxe'), b('A higher tax', 'Une taxe plus élevée'), b('Free drinks', 'Des boissons gratuites'), b('Nothing', 'Rien')]),
      hear('Les deux ne s’opposent pas : on peut taxer et réinvestir les recettes dans des programmes de prévention pour les familles à faible revenu.', b('What is the third position?', 'Quelle est la troisième position ?'), [b('Combine the tax with prevention funded by its revenue', 'Combiner la taxe et la prévention financée par ses recettes'), b('Reject both ideas', 'Rejeter les deux idées'), b('Only education', 'Seulement l’éducation'), b('Only a tax', 'Seulement une taxe')]),
      card(b('Summarising neutrally', 'Résumer avec neutralité'), b('Attribute each view: **La première intervenante estime que…, Le deuxième juge plutôt que…, Le troisième propose de concilier…** Avoid your own opinion and keep the **logic**: who proposes what, with which argument.', 'Attribuez chaque point de vue : **La première intervenante estime que…, Le deuxième juge plutôt que…, Le troisième propose de concilier…** Évitez votre opinion et gardez la **logique** : qui propose quoi, avec quel argument.')),
      write(b('Summarise the debate.', 'Résumez le débat.'), b('Summarise the three positions on taxing sugary drinks in 4 or 5 sentences, neutrally.', 'Résumez en 4 ou 5 phrases, de façon neutre, les trois positions sur la taxation des boissons sucrées.'), 70, 120,
        [b('Each position attributed (estime que, juge que…)', 'Chaque position attribuée (estime que, juge que…)'), b('The main argument of each', 'L’argument principal de chacun'), b('Neutral tone, no personal opinion', 'Ton neutre, sans opinion personnelle'), b('Connectors of contrast and synthesis', 'Connecteurs d’opposition et de synthèse')],
        'Le débat porte sur l’opportunité de taxer les boissons sucrées. La première intervenante y est favorable : selon elle, les données internationales montrent qu’une telle taxe réduit la consommation. Le deuxième expert craint en revanche qu’elle pénalise surtout les ménages modestes et préférerait miser sur l’éducation et l’étiquetage. Enfin, le troisième propose de concilier les deux approches en réinvestissant les recettes de la taxe dans la prévention auprès des familles à faible revenu.',
        { phrases: ['Le débat porte sur…', 'X y est favorable : selon elle…', 'Y craint en revanche que…', 'Enfin, Z propose de concilier…'] }),
      pairs(P.match, [['les recettes (fiscales)', b('(tax) revenue', 'argent perçu')], ['l’étiquetage', b('labelling', 'information sur l’emballage')], ['peser sur', b('to weigh on', 'pénaliser')], ['concilier', b('to reconcile', 'mettre d’accord')]]),
    ],
    [
      b('Attribute: estime que, juge que, propose de, craint que.', 'Attribuer : estime que, juge que, propose de, craint que.'),
      b('Neutral summary: no personal opinion.', 'Résumé neutre : pas d’opinion personnelle.'),
      b('concilier = to reconcile two approaches.', 'concilier = rapprocher deux approches.'),
    ],
    [['la prévention', b('prevention', 'actions pour éviter')], ['un ménage modeste', b('a low-income household', 'foyer aux faibles revenus')], ['l’opportunité de', b('the advisability of', 'le bien-fondé de')]],
  ),
];
