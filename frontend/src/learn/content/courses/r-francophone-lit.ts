import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French literature stretches far beyond Paris: Québec winter solitude, Belgian ironic tenderness, West African oral rhythm and Maghrebi narratives of threshold and memory each reshape the language from within. At C1, reading Francophone literature means hearing regional lexis, proverb-like cadence, metaphor and shifting register without flattening them. This course guides you through four original literary excerpts across these traditions and trains you to write a crisp C1 stylistic analysis.',
    'La littérature de langue française dépasse largement Paris : solitude hivernale au Québec, tendresse ironique en Belgique, cadence orale en Afrique de l’Ouest et récits du seuil et de la mémoire au Maghreb réinventent la langue de l’intérieur. Au niveau C1, lire ces voix exige d’entendre lexique régional, souffle oral, métaphores et registres. Ce cours explore quatre extraits littéraires originaux et vous entraîne au commentaire stylistique.',
  ),
  outcomes: [
    b('Read Québec and Belgian literary prose with regional and tonal sensitivity', 'Lire des proses littéraires québécoise et belge avec sensibilité au ton'),
    b('Follow West African oral cadence and Maghrebi poetic imagery', 'Suivre le rythme oral ouest-africain et les images maghrébines'),
    b('Analyse narrative point of view, metaphor and register shifts', 'Analyser point de vue, métaphore et ruptures de registre'),
    b('Write a structured C1 literary commentary on voice and style', 'Rédiger un commentaire littéraire structuré de niveau C1'),
  ],
};

const QC_EXCERPT: Doc = { look: 'page', title: b('Montréal — Literary excerpt', 'Montréal — Extrait littéraire'), text: 'Ruelle blanche (extrait fictif)\n\nDès novembre, la poudrerie effaçait les clôtures derrière la ruelle. Mon grand-père disait que l’hiver, ici, n’était pas une saison mais un locataire exigeant qui réclamait son dû dès cinq heures du soir. Sur le balcon givré, on entendait gronder la déneigeuse au bout de l’avenue, et nous restions là, à deux, sans éprouver le besoin de meubler le silence.' };
const BE_EXCERPT: Doc = { look: 'page', title: b('Brussels — Literary excerpt', 'Bruxelles — Extrait littéraire'), text: 'Place Flagey, un mardi de drache (extrait fictif)\n\nSous la drache obstinée qui changeait les pavés en miroirs d’étain, Monsieur Verstraete poursuivait sa promenade sans tambour ni trompette. Il prétendait que la pluie belge possédait une politesse particulière : elle ne chasse personne à grands cris, elle vous convainc tout doucement, avec un rien de mélancolie, de rentrer prendre un café noir.' };
const WA_EXCERPT: Doc = { look: 'page', title: b('West Africa — Literary excerpt', 'Afrique de l’Ouest — Extrait littéraire'), text: 'Sous le fromager (extrait fictif)\n\nQuand la chaleur du milieu du jour faisait taire jusqu’aux oiseaux, les anciens s’asseyaient sous le grand fromager et laissaient venir la parole sans hâte. Car chez nous, l’on sait que la rivière ne se presse pas pour atteindre l’océan : qui veut écouter le monde doit d’abord prêter l’oreille au silence qui précède le récit.' };
const MA_EXCERPT: Doc = { look: 'page', title: b('Maghreb — Literary excerpt', 'Maghreb — Extrait littéraire'), text: 'Le seuil aux volets bleus (extrait fictif)\n\nEntre les deux rives de sa mémoire, ma mère gardait intacte l’odeur du jasmin écrasé dans la cour intérieure. Lorsqu’elle prononçait certains mots de son enfance au milieu d’une phrase française, ce n’était ni oubli ni maladresse : elle ouvrait simplement une fenêtre sur une maison que le temps n’avait pas réussi à fermer.' };

const C = 'r-francophone-lit';
export default [
  lesson(C, 1, ['quebec-and-belgian-voices', 'voix-du-quebec-et-de-belgique'],
    b('Québec and Belgian literary voices', 'Voix du Québec et de Belgique'),
    b('Read winter imagery, regional lexis and quiet irony across two northern voices.', 'Saisir images hivernales, lexique régional et douce ironie chez deux voix du Nord.'),
    [b('Understand regional lexis (poudrerie, drache)', 'Comprendre poudrerie, ruelle, drache'), b('Interpret personification and metaphor', 'Interpréter personnification et métaphore'), b('Sense understated Belgian humour', 'Percevoir l’autodérision et l’humour belge')],
    13,
    [
      card(b('Northern Francophone textures', 'Couleurs du Nord francophone'), b('In Québec writing, winter shapes space (**la poudrerie** = blowing snow, **la déneigeuse** = snowplough, **la ruelle** = back lane) and shared silence (**à deux**). In Belgian writing, ordinary rain (**la drache**) and modest routines (**sans tambour ni trompette** = quietly) often carry affectionate irony.', 'Au Québec, l’hiver sculpte l’espace (**la poudrerie**, **la déneigeuse**, **la ruelle**) et les silences partagés. En Belgique, pluie tenace (**la drache**) et gestes modestes (**sans tambour ni trompette**) s’accompagnent souvent d’une tendre ironie.')),
      doc(QC_EXCERPT, b('Why does the grandfather call winter « un locataire exigeant »?', 'Pourquoi le grand-père appelle-t-il l’hiver « un locataire exigeant » ?'), [b('Winter takes over daily space and imposes its own strict schedule.', 'L’hiver envahit le quotidien et impose tôt ses contraintes.'), b('They rent a winter cabin every November.', 'Ils louent un chalet chaque mois de novembre.'), b('The neighbour complains about snow.', 'Un voisin se plaint du déneigement.'), b('Winter arrives only once every few years.', 'L’hiver ne vient que rarement.')]),
      doc(QC_EXCERPT, b('What does « sans éprouver le besoin de meubler le silence » suggest about the two characters?', 'Que révèle « sans éprouver le besoin de meubler le silence » sur les deux personnages ?'), [b('Their relationship is comfortable enough that silence feels natural.', 'Leur complicité rend le silence confortable et naturel.'), b('They are angry and refuse to speak.', 'Ils sont fâchés et refusent de se parler.'), b('The noise of the snowplough drowns out their voices.', 'La déneigeuse empêche toute conversation.'), b('They forgot what they wanted to say.', 'Ils ont oublié le sujet de discussion.')]),
      doc(BE_EXCERPT, b('What tone shapes Monsieur Verstraete’s remark about Belgian rain?', 'Quel ton caractérise la remarque sur la pluie belge ?'), [b('Gentle, wry humour attributing politeness to persistent rain', 'Un humour doux et ironique prêtant de la politesse à la pluie'), b('Bitter anger against the city', 'Une colère amère contre la ville'), b('Scientific objectivity about meteorology', 'Une neutralité scientifique sur la météo'), b('Dramatic tragedy', 'Un registre tragique')]),
      pairs(P.match, [['la poudrerie', b('drifting, blowing snow (Québec)', 'neige soulevée par le vent')], ['la drache', b('heavy steady rain (Belgium)', 'pluie battante')], ['sans tambour ni trompette', b('quietly, without fanfare', 'discrètement')], ['meubler le silence', b('to fill the silence with chatter', 'combler un silence par des mots')]]),
      dict('Sur le balcon givré, ils restaient là sans éprouver le besoin de meubler le silence.', { voice: 'm' }),
    ],
    [
      b('Poudrerie (Québec blowing snow); drache (Belgian rain).', 'Poudrerie (Québec) ; drache (Belgique).'),
      b('Personification turns weather into a living character (locataire, politesse).', 'La personnification transforme la météo en personnage.'),
      b('Sans tambour ni trompette = quietly, unpretentiously.', 'Sans tambour ni trompette = sans éclat ni bruit.'),
    ],
    [['la poudrerie', b('blowing snow (Québec)', 'neige poussée par le vent')], ['la drache', b('downpour (Belgium)', 'forte pluie')], ['givre', b('frost', 'fine couche de glace')]],
  ),
  lesson(C, 2, ['west-african-and-maghrebi-narratives', 'recits-afrique-ouest-maghreb'],
    b('West African and Maghrebi narratives', 'Récits d’Afrique de l’Ouest et du Maghreb'),
    b('Follow oral cadence, proverb logic and bilingual memory in southern Francophone prose.', 'Suivre cadence orale, sagesse proverbiale et mémoire bilingue dans deux récits du Sud.'),
    [b('Recognise oral storytelling cadence and proverbs', 'Reconnaître cadence orale et proverbe'), b('Interpret motifs of threshold and dual language', 'Interpréter seuils, mémoire et deux langues'), b('Connect imagery to cultural transmission', 'Relier les images à la transmission')],
    13,
    [
      tip(b('Orality and multilingual echoes', 'Oralité et échos d’une autre langue'), b('West African prose often honours **oral transmission**—slow openings, collective voice (**chez nous, l’on sait que**), proverbs drawn from river and tree (**le fromager** = silk-cotton tree). Maghrebi writing frequently explores **le seuil** (threshold), **entre deux rives** (between two shores) and weaving mother-tongue words into French as acts of memory.', 'La prose ouest-africaine honore souvent l’**oralité** — parole patiente, sagesse partagée (**chez nous, l’on sait que**), images d’arbre et de fleuve. Au Maghreb, les motifs du **seuil**, d’**entre deux rives** et des mots maternels glissés dans le français disent la mémoire.')),
      doc(WA_EXCERPT, b('Why does the narrator invoke the river that « ne se presse pas »?', 'Pourquoi le narrateur évoque-t-il la rivière qui « ne se presse pas » ?'), [b('To justify taking time and listening patiently before speaking', 'Pour valoriser la patience et l’écoute avant de raconter'), b('To complain about drought during midday heat', 'Pour déplorer la sécheresse de midi'), b('To explain boat navigation', 'Pour expliquer la navigation fluviale'), b('To hurry the elders along', 'Pour presser les anciens de finir')]),
      doc(MA_EXCERPT, b('How does the narrator interpret her mother’s mixing of childhood words into French?', 'Comment la narratrice interprète-t-elle les mots d’enfance mêlés au français ?'), [b('As an intentional doorway keeping her childhood home alive', 'Comme une ouverture vivante sur la maison de son enfance'), b('As a lack of vocabulary in French', 'Comme un manque de vocabulaire en français'), b('As a sign of forgetting her native tongue', 'Comme un signe d’oubli de sa langue natale'), b('As an accidental slip she tries to hide', 'Comme une maladresse qu’elle cherche à cacher')]),
      sort(b('West African or Maghrebi motif here?', 'Motif du récit ouest-africain ou maghrébin ?'), [b('West African excerpt', 'Extrait ouest-africain'), b('Maghrebi excerpt', 'Extrait maghrébin')], [['l’ombre du fromager', 0], ['entre les deux rives de la mémoire', 1], ['prêter l’oreille au silence', 0], ['ouvrir une fenêtre par un mot maternel', 1]]),
      pairs(P.match, [['prêter l’oreille', b('to listen attentively', 'écouter avec attention')], ['le seuil', b('the threshold, doorway', 'entrée d’une maison')], ['la hâte', b('haste, hurry', 'précipitation')], ['intact', b('untouched, intact', 'demeuré entier')]]),
      gap(P.complete, 'Qui veut écouter le monde doit d’abord prêter l’___ au silence qui ___ le récit.', ['oreille', 'précède']),
    ],
    [
      b('Oral prose uses collective wisdom and nature analogies (river, tree).', 'La prose orale s’appuie sur la sagesse collective et la nature.'),
      b('Code-switching in Maghrebi writing is framed as memory, not error.', 'L’alternance des langues exprime la mémoire, non une maladresse.'),
      b('Le seuil / entre deux rives symbolise crossing cultures and memory.', 'Le seuil / entre deux rives symbolise la traversée des mémoires.'),
    ],
    [['le fromager', b('silk-cotton tree', 'grand arbre d’Afrique tropicale')], ['le seuil', b('the threshold', 'limite d’entrée')], ['une rive', b('a shore, riverbank', 'bord d’un cours d’eau ou d’une mer')]],
  ),
  lesson(C, 3, ['style-oral-rhythm-and-commentary', 'style-oralite-et-commentaire'],
    b('Comparative style and C1 literary commentary', 'Style comparé et commentaire C1'),
    b('Synthesise stylistic devices across Francophone texts and write a brief analysis.', 'Synthétiser procédés stylistiques et rédiger un court commentaire C1.'),
    [b('Compare metaphor, rhythm and register across passages', 'Comparer métaphore, rythme et registre'), b('Identify stylistic effects precisely', 'Nommer avec précision les procédés stylistiques'), b('Write a cohesive C1 stylistic analysis', 'Rédiger une analyse stylistique structurée')],
    13,
    [
      card(b('Toolkit for C1 literary commentary', 'Outils pour le commentaire C1'), b('Move beyond summarising what happens: name **how** the sentence creates meaning. Key moves: **La métaphore filée de…** (extended metaphor of…), **La personnification suggère…**, **Le rythme ample / posé mime…**, **Par cette image, l’auteur(e) donne à voir…**.', 'Ne vous bornez pas au résumé : montrez **comment** la phrase produit du sens. Formules clés : **La métaphore de…**, **La personnification suggère…**, **Le rythme posé mime…**, **Par cette image, l’auteur donne à voir…**.')),
      mc(P.best, ['Elle transforme un détail quotidien en image mémorielle pour relier deux mondes.', 'Elle raconte simplement une recette de cuisine.', 'Elle prouve que les fenêtres doivent rester ouvertes.', 'Elle critique la météo nord-africaine.'], { fr: 'Dans l’extrait maghrébin, que réussit la métaphore finale de la « fenêtre » ?' }),
      mc(P.meaning, [b('the narrator moves from individual memory to universal proverb', 'le narrateur passe du récit particulier à une vérité générale'), b('the narrator forgets who is speaking', 'le narrateur change de personnage sans raison'), b('the text becomes a legal document', 'le texte devient un règlement administratif'), b('the dialogue ends abruptly', 'le dialogue s’interrompt brusquement')], { fr: 'Dans « Sous le fromager », l’emploi de « l’on sait que » indique que…' }),
      pairs(P.match, [['une métaphore', b('an implicit comparison', 'image sans outil de comparaison')], ['une personnification', b('giving human traits to things', 'prêter des traits humains')], ['la cadence', b('rhythm and flow of prose', 'rythme d’une phrase')], ['l’implicite', b('what is suggested rather than stated', 'ce qui est sous-entendu')]]),
      write(b('C1 stylistic commentary', 'Commentaire stylistique C1'), b('Choose ONE of the four literary excerpts from this course and write a short commentary (75–120 words): situate the setting/tradition, analyse two stylistic devices (metaphor, personification, rhythm, lexis) with a brief quote, and explain the overall emotional effect.', 'Choisissez UN des quatre extraits littéraires de ce cours et rédigez un commentaire (75–120 mots) : situez le cadre, analysez deux procédés stylistiques (métaphore, personnification, rythme, lexique) avec une courte citation, et précisez l’effet produit.'), 75, 120, [
        b('Setting and regional voice named', 'Cadre et voix francophone identifiés'),
        b('Two stylistic devices analysed', 'Deux procédés stylistiques analysés'),
        b('At least one short quotation', 'Au moins une courte citation'),
        b('Clear conclusion on emotional effect', 'Conclusion sur l’effet d’ensemble'),
      ], 'Dans l’extrait québécois « Ruelle blanche », l’auteur évoque avec finesse l’intimité d’un soir d’hiver à Montréal grâce à un lexique ancré dans le quotidien, comme « poudrerie » ou « déneigeuse ». La personnification de l’hiver en « locataire exigeant qui réclamait son dû » traduit avec justesse la présence presque physique du froid qui s’impose dès la tombée du jour. Face à ce monde extérieur rude et sonore, la phrase finale mise sur une sobriété touchante : l’expression « meubler le silence » suggère une complicité apaisée entre deux générations, où la parole devient inutile.', { phrases: ['Dans l’extrait…, l’auteur évoque…', 'La personnification de… traduit…', 'L’expression « … » suggère…', 'Par ce contraste, le texte…'] }),
      gap(P.complete, 'La métaphore finale donne à voir comment une langue peut ___ une mémoire que le temps n’a pas ___.', ['préserver', 'effacée']),
    ],
    [
      b('Name the device (personification, metaphor, lexis), then explain its effect.', 'Nommez le procédé (personnification, métaphore, lexique), puis expliquez son effet.'),
      b('Quote briefly inside « … » and weave it into your syntax.', 'Citez brièvement entre « … » en intégrant les mots à votre phrase.'),
      b('Contrast external landscape and inner emotion—common across Francophone prose.', 'Reliez paysage extérieur et intériorité : un fil rouge des littératures francophones.'),
    ],
    [['la sobriété', b('restraint, economy of style', 'simplicité maîtrisée')], ['superflu', b('unnecessary, superfluous', 'inutile')], ['évoquer', b('to evoke, conjure up', 'rappeler à l’esprit')]],
  ),
];
