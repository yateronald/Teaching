import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Documentaries and radio reports combine a narrator’s voice, explanations, figures and testimonies. This course trains you on three original documentary extracts (the St. Lawrence belugas, the history of Montréal’s metro, urban beekeeping) to distinguish narration from testimony, follow an explanation step by step and retain the key figures.',
    'Documentaires et reportages radio associent la voix d’un narrateur, des explications, des chiffres et des témoignages. Ce cours vous entraîne sur trois extraits documentaires originaux (les bélugas du Saint-Laurent, l’histoire du métro de Montréal, l’apiculture urbaine) pour distinguer narration et témoignage, suivre une explication pas à pas et retenir les chiffres clés.',
  ),
  outcomes: [
    b('Distinguish narration and testimony', 'Distinguer narration et témoignage'),
    b('Follow a step-by-step explanation', 'Suivre une explication pas à pas'),
    b('Retain key figures and dates', 'Retenir chiffres et dates clés'),
    b('Summarise a documentary extract', 'Résumer un extrait documentaire'),
  ],
};

const C = 'l-documentaries';
export default [
  lesson(C, 1, ['nature-documentary', 'documentaire-nature'],
    b('A nature documentary: the belugas', 'Un documentaire nature : les bélugas'),
    b('Follow a narrator’s explanation about an endangered species.', 'Suivre l’explication d’un narrateur sur une espèce menacée.'),
    [b('Catch figures and their evolution', 'Saisir les chiffres et leur évolution'), b('Understand causes of a threat', 'Comprendre les causes d’une menace'), b('Understand the solutions mentioned', 'Comprendre les solutions évoquées')],
    13,
    [
      card(b('Explaining a problem', 'Expliquer un problème'), b('Documentaries often follow: **situation** (il y a / on compte), **evolution** (est passé de… à…), **causes** (en raison de, à cause de), **solutions** (pour protéger…, des mesures ont été prises).', 'Les documentaires suivent souvent : **situation** (il y a / on compte), **évolution** (est passé de… à…), **causes** (en raison de, à cause de), **solutions** (pour protéger…, des mesures ont été prises).')),
      hear('Dans les années quatre-vingt, on comptait environ dix mille bélugas dans le Saint-Laurent. Aujourd’hui, ils ne seraient plus que mille huit cents.', b('How has the population changed?', 'Comment la population a-t-elle évolué ?'), [b('From about 10,000 to about 1,800', 'D’environ 10 000 à environ 1 800'), b('From 1,800 to 10,000', 'De 1 800 à 10 000'), b('It is stable', 'Elle est stable'), b('From 1,000 to 800', 'De 1 000 à 800')]),
      hear('Le bruit des navires, la pollution chimique et la raréfaction de leurs proies menacent leur survie.', b('Which is NOT a threat mentioned?', 'Laquelle n’est PAS une menace mentionnée ?'), [b('Hunting', 'La chasse'), b('Ship noise', 'Le bruit des navires'), b('Chemical pollution', 'La pollution chimique'), b('Fewer prey', 'La raréfaction des proies')]),
      hear('Pour les protéger, les bateaux doivent désormais ralentir dans certaines zones de la rivière Saguenay.', b('What measure has been taken?', 'Quelle mesure a été prise ?'), [b('Boats must slow down in certain areas', 'Les bateaux doivent ralentir dans certaines zones'), b('Fishing is banned everywhere', 'La pêche est interdite partout'), b('The river is closed', 'La rivière est fermée'), b('Belugas are moved', 'Les bélugas sont déplacés')]),
      sort(b('Cause or solution?', 'Cause ou solution ?'), [b('cause', 'cause'), b('solution', 'solution')], [['le bruit des navires', 0], ['ralentir les bateaux', 1], ['la pollution chimique', 0], ['créer des zones protégées', 1]]),
      pairs(P.match, [['un navire', b('a ship', 'grand bateau')], ['une proie', b('a prey', 'animal chassé')], ['la survie', b('survival', 'fait de survivre')], ['la raréfaction', b('growing scarcity', 'diminution')]]),
      dict('Aujourd’hui, il resterait environ mille huit cents bélugas dans le Saint-Laurent.', { voice: 'm' }),
    ],
    [
      b('Structure: situation → evolution → causes → solutions.', 'Structure : situation → évolution → causes → solutions.'),
      b('est passé de… à… = went from… to…', 'est passé de… à… = a évolué de… à…'),
      b('Conditional = estimate (ils ne seraient plus que…).', 'Conditionnel = estimation (ils ne seraient plus que…).'),
    ],
    [['le Saint-Laurent', b('the St. Lawrence River', 'fleuve du Québec')], ['menacer', b('to threaten', 'mettre en danger')], ['une espèce', b('a species', 'groupe d’animaux')]],
  ),
  lesson(C, 2, ['history-documentary', 'documentaire-historique'],
    b('A history documentary: the metro', 'Un documentaire historique : le métro'),
    b('Follow dates and events in a historical narration.', 'Suivre dates et événements dans une narration historique.'),
    [b('Catch dates and years', 'Saisir dates et années'), b('Follow the chronology', 'Suivre la chronologie'), b('Understand the historical present', 'Comprendre le présent de narration')],
    13,
    [
      tip(b('The historical present', 'Le présent de narration'), b('Documentaries often tell history in the **present** to make it vivid: **En 1966, Montréal inaugure son métro.** Focus on the **dates**: they structure the story.', 'Les documentaires racontent souvent l’histoire au **présent** pour la rendre vivante : **En 1966, Montréal inaugure son métro.** Concentrez-vous sur les **dates** : elles structurent le récit.')),
      hear('Le quatorze octobre mille neuf cent soixante-six, Montréal inaugure son métro, quelques mois avant l’Exposition universelle.', b('When was the metro inaugurated?', 'Quand le métro a-t-il été inauguré ?'), [b('14 October 1966', 'Le 14 octobre 1966'), b('1967', '1967'), b('4 October 1976', 'Le 4 octobre 1976'), b('1956', '1956')]),
      hear('Une particularité : les trains roulent sur des pneus, ce qui les rend plus silencieux et plus efficaces dans les pentes.', b('What is special about the trains?', 'Quelle est la particularité des trains ?'), [b('They run on rubber tyres: quieter, better on slopes', 'Ils roulent sur des pneus : plus silencieux, meilleurs dans les pentes'), b('They are driverless', 'Ils sont sans conducteur'), b('They run outside', 'Ils roulent à l’extérieur'), b('They are very old', 'Ils sont très anciens')]),
      hear('Chaque station a été confiée à un architecte différent, et beaucoup abritent des œuvres d’art.', b('Why are the stations special?', 'Pourquoi les stations sont-elles particulières ?'), [b('Each was designed by a different architect, many with artworks', 'Chacune a été conçue par un architecte différent, beaucoup avec des œuvres d’art'), b('They are all identical', 'Elles sont toutes identiques'), b('They are outdoors', 'Elles sont à l’air libre'), b('They are underground museums only', 'Ce sont seulement des musées')]),
      pairs(P.match, [['inaugurer', b('to inaugurate, open', 'ouvrir officiellement')], ['un pneu', b('a tyre', 'roue en caoutchouc')], ['une pente', b('a slope', 'terrain incliné')], ['une œuvre d’art', b('a work of art', 'création artistique')]]),
      sort(b('Fact about the metro: true or false?', 'Fait sur le métro : vrai ou faux ?'), [b('true', 'vrai'), b('false', 'faux')], [['inauguré en 1966', 0], ['trains sur pneus', 0], ['stations toutes identiques', 1], ['inauguré après l’Expo', 1]]),
      dict('En mille neuf cent soixante-six, Montréal inaugure son métro.', { voice: 'f' }),
    ],
    [
      b('Historical present: En 1966, Montréal inaugure…', 'Présent de narration : En 1966, Montréal inaugure…'),
      b('Dates structure the story: note them.', 'Les dates structurent le récit : notez-les.'),
      b('confier à = to entrust to.', 'confier à = remettre à.'),
    ],
    [['l’Exposition universelle', b('the World’s Fair', 'grande exposition internationale')], ['un architecte', b('an architect', 'concepteur de bâtiments')], ['abriter', b('to house, shelter', 'contenir')]],
  ),
  lesson(C, 3, ['narration-and-testimony', 'narration-et-temoignage'],
    b('Narration and testimony: urban bees', 'Narration et témoignage : les abeilles en ville'),
    b('Distinguish the narrator’s voice from the people interviewed.', 'Distinguer la voix du narrateur de celle des personnes interviewées.'),
    [b('Recognise a testimony', 'Reconnaître un témoignage'), b('Distinguish narrator and witness', 'Distinguer narrateur et témoin'), b('Summarise an extract', 'Résumer un extrait')],
    13,
    [
      card(b('Two kinds of voices', 'Deux types de voix'), b('The **narrator** is neutral, informative, often in the third person (**Sur le toit de cet hôtel, trois ruches…**). A **testimony** is personal, in the first person, with feelings (**Moi, quand j’ouvre la ruche, j’oublie tout.**).', 'Le **narrateur** est neutre, informatif, souvent à la troisième personne (**Sur le toit de cet hôtel, trois ruches…**). Le **témoignage** est personnel, à la première personne, avec des émotions (**Moi, quand j’ouvre la ruche, j’oublie tout.**).')),
      hear('Sur le toit de cet hôtel du centre-ville, trois ruches produisent chaque été près de cent kilos de miel.', b('Who is speaking?', 'Qui parle ?'), [b('The narrator (neutral information)', 'Le narrateur (information neutre)'), b('A beekeeper (testimony)', 'Un apiculteur (témoignage)'), b('A tourist', 'Un touriste'), b('The hotel manager', 'Le directeur de l’hôtel')]),
      hear('Moi, quand j’ouvre la ruche le matin, j’oublie tout : le bruit, le stress, les courriels. Il n’y a plus que les abeilles.', b('What does the beekeeper express?', 'Qu’exprime l’apiculteur ?'), [b('A feeling of calm and escape', 'Un sentiment de calme et d’évasion'), b('Fear of bees', 'La peur des abeilles'), b('Anger about noise', 'De la colère contre le bruit'), b('Boredom', 'De l’ennui')]),
      hear('Le miel est ensuite servi au petit-déjeuner des clients, qui viennent parfois visiter les ruches avec une combinaison de protection.', b('What happens to the honey?', 'Que devient le miel ?'), [b('It is served at the guests’ breakfast', 'Il est servi au petit-déjeuner des clients'), b('It is sold abroad', 'Il est vendu à l’étranger'), b('It is thrown away', 'Il est jeté'), b('The bees eat it', 'Les abeilles le mangent')]),
      sort(b('Narration or testimony?', 'Narration ou témoignage ?'), [b('narration', 'narration'), b('testimony', 'témoignage')], [['Trois ruches produisent cent kilos de miel.', 0], ['Moi, j’oublie tout.', 1], ['Le miel est servi au petit-déjeuner.', 0], ['J’adore ce moment.', 1]]),
      pairs(P.match, [['une ruche', b('a beehive', 'abri des abeilles')], ['le miel', b('honey', 'produit des abeilles')], ['une combinaison', b('a (protective) suit', 'vêtement intégral')], ['un toit', b('a roof', 'dessus d’un bâtiment')]]),
      tip(b('Summarise a documentary', 'Résumer un documentaire'), b('Keep the **narrator’s facts** (who, what, how many) and **one testimony** that illustrates them: **Sur le toit d’un hôtel, trois ruches produisent 100 kg de miel ; pour l’apiculteur, c’est un moment de calme.**', 'Gardez les **faits du narrateur** (qui, quoi, combien) et **un témoignage** qui les illustre : **Sur le toit d’un hôtel, trois ruches produisent 100 kg de miel ; pour l’apiculteur, c’est un moment de calme.**')),
    ],
    [
      b('Narrator: neutral, third person, facts.', 'Narrateur : neutre, troisième personne, faits.'),
      b('Testimony: first person, feelings, examples.', 'Témoignage : première personne, émotions, exemples.'),
      b('Summary: narrator’s facts + one testimony.', 'Résumé : faits du narrateur + un témoignage.'),
    ],
    [['un apiculteur', b('a beekeeper', 'éleveur d’abeilles')], ['produire', b('to produce', 'fabriquer')], ['oublier', b('to forget', 'ne plus penser à')]],
  ),
];
