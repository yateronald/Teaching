import type { CourseAbout } from '../../types';
import { b, card, exam, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At DALF C2, candidates choose either the Humanities or Sciences domain and face two comprehensive tests combining listening, speaking, reading and writing. This course refines the highest C2 competencies: reformulating dense source dossiers without borrowing phrasing, adjusting editorial style and register cleanly, and leading a poised, sharp, respectful debate with an academic jury.',
    'Au DALF C2, les candidats choisissent entre le domaine Lettres et sciences humaines ou Sciences et passent deux épreuves intégrées mêlant compréhension et production. Ce cours affine les plus hautes compétences C2 : reformuler un dossier complexe sans reprendre ses formules, ciseler un style éditorial soutenu et mener un débat vif, nuancé et maître avec un jury universitaire.',
  ),
  outcomes: [
    b('Reformulate complex dossiers without lexical borrowing', 'Reformuler un dossier complexe sans reprendre ses tournures'),
    b('Write with C2 stylistic precision, cadence and cohesion', 'Écrire avec précision stylistique, rythme et cohésion C2'),
    b('Synthesise a 15-minute C2 recording into an oral standpoint', 'Synthétiser un document audio de 15 minutes en exposé oral'),
    b('Pivot smoothly and hold your ground under jury questioning', 'Répondre avec finesse et sang-froid aux questions du jury'),
  ],
};

const C = 'dalf-c2-jury-debate';
export default [
  lesson(C, 1, ['c2-reformulation-and-lexical-precision', 'c2-reformulation-et-precision'],
    b('C2 reformulation and conceptual elegance', 'Reformulation C2 et justesse conceptuelle'),
    b('Move away from source wording seamlessly using nominalisation, abstract verbs and refined syntax.', 'S’affranchir des mots du dossier par la nominalisation, le verbe juste et la syntaxe soutenue.'),
    [b('Reformulate without losing conceptual depth', 'Reformuler sans affaiblir le concept'), b('Replace heavy relative chains cleanly', 'Alléger les relatives lourdes'), b('Distinguish near-synonyms at C2 level', 'Distinguer les quasi-synonymes au C2')],
    13,
    [
      exam(b('Why C2 penalises lexical borrowing', 'Pourquoi le C2 sanctionne la copie servile'), b('In the **DALF C2 Written Paper** (producing ~700 words from a 2,000-word dossier), **borrowing whole phrases** from the texts reveals a C1 ceiling. Examiners reward **conceptual reformulation**: transforming concrete examples into broader categories and shifting parts of speech (**« Les citoyens craignent de perdre leur anonymat » → « La hantise d’une érosion de la vie privée »**).', 'Dans l’**épreuve écrite du DALF C2** (env. 700 mots à partir d’un dossier de 2 000 mots), **reprendre des bribes du texte** traduit un niveau C1. Le jury attend une **reformulation conceptuelle** : passer de l’exemple au concept et varier les catégories grammaticales (**« Les citoyens craignent de perdre leur anonymat » → « La hantise d’une érosion de la vie privée »**).')),
      mc(P.best, ['L’essor fulgurant des algorithmes ravive l’inquiétude quant à une possible standardisation des goûts culturels.', 'Aujourd’hui, les algorithmes font que beaucoup de gens finissent tous par écouter ou voir exactement les mêmes choses.', 'Comme le dit le texte 2 : « les algorithmes uniformisent les goûts culturels ». ', 'Beaucoup d’ordinateurs choisissent nos films et cela pose un grand problème culturel.'], { fr: 'Comment reformuler au niveau C2 l’idée : « Les algorithmes amènent les gens à aimer les mêmes films et musiques » ?' }),
      pairs(P.match, [['une érosion', b('a gradual wearing away / erosion', 'affaiblissement progressif')], ['un écueil', b('a pitfall, stumbling block', 'obstacle caché à éviter')], ['corroborer', b('to corroborate, back up', 'confirmer par d’autres faits')], ['s’affranchir de', b('to break free from', 'se libérer d’une contrainte')]]),
      gap(P.complete, 'Loin de ___ (confirmer) cette hypothèse, les enquêtes récentes mettent en lumière l’___ (obstacle) majeur que constitue le cloisonnement des disciplines.', ['corroborer', 'écueil'], { choices: [['corroborer', 'démentir', 'ignorer'], ['écueil', 'atout', 'élan']] }),
      sort(b('Register fit for a C2 editorial', 'Registre adapté à un article C2'), [b('C2 editorial standard', 'style éditorial C2'), b('too conversational / imprecise', 'trop oral ou imprécis')], [['Il convient de nuancer ce constat.', 0], ['Du coup, on voit bien que ça marche pas.', 1], ['Une telle dérive appelle une vigilance accrue.', 0], ['Franchement, c’est un truc un peu bizarre.', 1]]),
    ],
    [
      b('Transform verbs + nouns into crisp nominalisations when synthesising dossiers.', 'Transformez phrases verbales en nominalisations précises pour synthétiser.'),
      b('Distinguish close words carefully: « écueil » (hidden obstacle) vs « contrainte ».', 'Choisissez le terme exact : « écueil », « dérive », « corollaire », « érosion ».'),
      b('Keep metaphors restrained and analytical, never melodramatic.', 'Préférez des formules sobrement analytiques au ton sensationnel.'),
    ],
    [['une dérive', b('a drift / worrying shift', 'glissement progressif vers l’excès')], ['le cloisonnement', b('compartmentalisation', 'isolement entre domaines')], ['accru', b('heightened, increased', 'augmenté')]],
  ),
  lesson(C, 2, ['c2-editorial-craft-and-cadence', 'c2-style-et-rythme-editorial'],
    b('Crafting C2 prose: cadence, nuance and cohesion', 'Ciseler un texte C2 : nuance et rythme'),
    b('Use subtle framing devices, concession without clichés and refined transitions in formal writing.', 'Maîtriser les modulations, concessions sans clichés et transitions élégantes à l’écrit.'),
    [b('Avoid tired textbook connectors', 'Éviter les connecteurs scolaires usés'), b('Use subtle modalisation and concessions', 'Moduler sans affaiblir sa pensée'), b('Deliver a clean C2 editorial paragraph', 'Rédiger un paragraphe éditorial C2')],
    13,
    [
      card(b('Beyond « Premièrement / Deuxièmement »', 'Au-delà de « Premièrement / Deuxièmement »'), b('At C2, mechanical signposts (*Tout d’abord, Ensuite, En conclusion*) feel stiff. Replace them with **thematic transitions** that carry the thought forward: **« Encore convient-il de souligner… »**, **« À ce premier écueil s’ajoute… »**, **« Dès lors, l’enjeu ne réside plus dans…, mais dans… »**.', 'Au niveau C2, les balises mécaniques (*Tout d’abord, Ensuite, En conclusion*) paraissent scolaires. Préférez des **transitions thématiques** qui prolongent la pensée : **« Encore convient-il de souligner… »**, **« À ce premier écueil s’ajoute… »**, **« Dès lors, l’enjeu ne réside plus dans…, mais dans… »**.')),
      mc(P.best, ['À ce premier constat s’ajoute toutefois une réserve d’ordre méthodologique qu’il importe de ne pas éluder.', 'Deuxièmement, je veux maintenant parler d’un autre problème très différent de méthodologie.', 'Pour finir ce paragraphe, il existe aussi un souci dans la façon de calculer.', 'Néanmoins cependant, il y a un autre aspect à discuter tout de suite.'], { fr: 'Quelle transition relie le mieux deux paragraphes d’un essai DALF C2 ?' }),
      write(b('Draft a C2 Editorial Paragraph (90–130 words)', 'Rédiger un paragraphe éditorial C2 (90–130 mots)'), b('As an essayist, write a 90–130-word analytical paragraph examining why open public data alone does not guarantee democratic transparency, using at least one thematic transition and one conceptual reformulation.', 'Rédigez un paragraphe analytique de 90 à 130 mots expliquant pourquoi la seule mise en ligne des données publiques ne suffit pas à garantir la transparence démocratique, avec une transition élégante et une reformulation conceptuelle.'), 90, 130, [
        b('Refined thematic transition (not Premièrement)', 'Transition thématique soignée (sans Premièrement)'),
        b('Conceptual phrasing & accurate C2 vocabulary', 'Style conceptuel et lexique juste'),
        b('90–130 words, clear logical climax', '90 à 130 mots avec chute nette'),
      ], 'S’il est tentant de confondre profusion d’archives numériques et transparence civique, l’expérience démontre combien l’accès brut aux données demeure insuffisant. Encore convient-il en effet que les citoyens disposent du temps et des clés d’analyse nécessaires pour interpréter des tableaux techniques souvent opaques. À défaut d’un travail rigoureux de médiation journalistique ou scientifique, cette abondance risque même d’engendrer l’effet inverse : noyer l’information cruciale sous un flux indigeste de chiffres. Dès lors, l’exigence démocratique réside moins dans l’accumulation de fichiers ouverts que dans la formation d’esprits capables d’en éprouver la pertinence.', { phrases: ['S’il est tentant de…', 'Encore convient-il en effet que…', 'À défaut de…', 'Dès lors, l’enjeu réside moins dans… que dans…'] }),
      pairs(P.match, [['éluder', b('to evade, sidestep', 'éviter une question')], ['à défaut de', b('failing, in the absence of', 'en l’absence de')], ['engendrer', b('to give rise to, breed', 'provoquer, produire')], ['éprouver (la pertinence)', b('to put to the test', 'vérifier par l’usage')]]),
    ],
    [
      b('Replace mechanical markers (*Premièrement, En conclusion*) with idea-carrying transitions.', 'Remplacez les marqueurs scolaires par des transitions qui portent le sens.'),
      b('Contrast structure « moins dans X que dans Y » sharpens conclusions smoothly.', 'La structure « moins dans X que dans Y » affine la chute d’un paragraphe.'),
      b('Choose verbs with exact weight: « éluder, engendrer, réhabiliter, nuancer ».', 'Privilégiez des verbes précis : « éluder, engendrer, réhabiliter, nuancer ».'),
    ],
    [['la profusion', b('overabundance, profusion', 'quantité excessive')], ['à défaut de', b('in the absence of', 'si cela manque')], ['opaque', b('opaque, obscure', 'difficile à comprendre')]],
  ),
  lesson(C, 3, ['c2-jury-debate-and-defence', 'c2-echange-avec-le-jury'],
    b('Defending your position before a C2 jury', 'Soutenir le débat devant un jury C2'),
    b('Re-frame loaded jury questions, concede tactfully without surrendering, and maintain natural eloquence.', 'Recadrer les questions pièges du jury, nuancer sans céder et garder une éloquence naturelle.'),
    [b('Synthesise two listening plays swiftly', 'Synthétiser un long audio dès l’exposé'), b('Reframe false dichotomies gracefully', 'Dépasser les faux choix binaires'), b('Pivot smoothly under tough follow-ups', 'Rebondir avec aisance face aux relances')],
    13,
    [
      exam(b('The DALF C2 Oral Test (15-min audio · 1 h prep · 30 min exam)', 'L’oral du DALF C2 (audio 15 min · 1 h prép. · 30 min)'), b('You hear an authentic **15-minute broadcast twice**, then organise two parts: **1. Faithful summary** of the audio (~5–7 min), **2. Personal argued stance** (~8–10 min), followed by **3. Deep debate (~15 min)** with an expert jury. Examiners deliberately provoke you with **binary traps** or **historical objections** to test your flexibility.', 'Vous écoutez **deux fois une émission de 15 minutes**, puis enchaînez : **1. Compte rendu fidèle** (~5–7 min), **2. Point de vue argumenté** (~8–10 min), puis **3. Débat approfondi (~15 min)** avec un jury spécialiste. Le jury pose volontairement des **dilemmes forcés** pour tester votre souplesse intellectuelle.')),
      hear('Ce que l’on nomme un peu vite « fracture générationnelle » masque souvent une simple divergence d’accès au logement et au crédit : les attentes civiques des plus jeunes demeurent, à bien des égards, très proches de celles de leurs aînés.', b('How does the speaker qualify the idea of a “generational divide”?', 'Comment l’intervenante nuance-t-elle l’idée de « fracture générationnelle » ?'), [b('She attributes it mainly to economic gaps rather than differing civic values.', 'Elle l’explique surtout par des écarts économiques plutôt que par des valeurs différentes.'), b('She argues younger citizens reject all civic values of their elders.', 'Elle affirme que les jeunes rejettent toutes les valeurs civiques des aînés.'), b('She claims housing access was identical across generations.', 'Elle estime que l’accès au logement a toujours été identique.'), b('She suggests banning credit for young buyers.', 'Elle propose d’interdire le crédit aux jeunes acheteurs.')], { voice: 'f2' }),
      mc(P.best, ['Loin d’opposer radicalement innovation et prudence, il s’agit précisément de penser les conditions éthiques qui rendent cette innovation acceptable.', 'Non, vous voyez bien que c’est soit tout l’un, soit tout l’autre !', 'Je préfère ne pas me prononcer sur ce dilemme assez complexe.', 'Si le jury pense que c’est dangereux, alors j’abandonne mon premier point.'], { fr: 'Le jury lance : « Donc au fond, il faut choisir : freiner la science ou sacrifier la vie privée ? » Comment recadrer à C2 ?' }),
      say('Je me garderais bien d’enfermer ce débat dans une alternative si tranchée : tout l’enjeu consiste justement à articuler les deux exigences.', 'I would be careful not to lock this debate into such a sharp either-or: the whole challenge lies precisely in combining both demands.'),
      say('Votre remarque touche au cœur du problème ; c’est d’ailleurs ce qui m’amène à nuancer l’optimisme de la seconde intervenante.', 'Your remark touches the heart of the issue; that is precisely what leads me to qualify the second speaker’s optimism.'),
      sort(b('Effective C2 jury move or defensive trap?', 'Réponse maîtrisée C2 ou maladresse ?'), [b('poised C2 move', 'réponse maîtrisée C2'), b('trap to avoid', 'maladresse à éviter')], [['recadrer une fausse opposition', 0], ['s’entêter sans écouter l’objection', 1], ['relier l’objection à un exemple précis du document', 0], ['changer brutalement d’avis dès la première critique', 1]]),
    ],
    [
      b('Break binary traps politely: « Je me garderais d’opposer X à Y… ».', 'Déjouez les faux dilemmes : « Je me garderais d’opposer X à Y… ».'),
      b('Anchor jury replies in concrete elements heard in the 15-minute broadcast.', 'Reliez vos réponses aux faits entendus dans l’enregistrement de départ.'),
      b('Maintain measured pace, rhetorical pauses and natural authority throughout.', 'Gardez un débit posé, des silences maîtrisés et une autorité calme.'),
    ],
    [['une alternative tranchée', b('a stark either-or', 'choix binaire strict')], ['se garder bien de', b('to be careful not to', 'éviter soigneusement de')], ['articuler', b('to link / coordinate two principles', 'concilier avec logique')]],
  ),
];
