import type { CourseAbout, Doc } from '../../types';
import { b, card, doc, gap, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Reportage, portraits and investigations mix narration, description, testimony and analysis. They begin with a scene, zoom out to the issue, give voices to several people and end with an image. This course trains you on three original long-form extracts (a fishing village facing change, a portrait of a night nurse, an investigation into food waste) to understand how they are built and what the journalist wants you to feel and think.',
    'Reportages, portraits et enquêtes mêlent narration, description, témoignages et analyse. Ils commencent par une scène, élargissent vers l’enjeu, donnent la parole à plusieurs personnes et se terminent sur une image. Ce cours vous entraîne sur trois extraits originaux (un village de pêcheurs face au changement, le portrait d’une infirmière de nuit, une enquête sur le gaspillage alimentaire) pour comprendre leur construction et ce que le journaliste veut vous faire ressentir et penser.',
  ),
  outcomes: [
    b('Understand the structure of a reportage', 'Comprendre la structure d’un reportage'),
    b('Distinguish scene, testimony and analysis', 'Distinguer scène, témoignage et analyse'),
    b('Understand a portrait and its angle', 'Comprendre un portrait et son angle'),
    b('Follow the evidence of an investigation', 'Suivre les preuves d’une enquête'),
  ],
};

const R1: Doc = { look: 'article', title: b('Reportage', 'Reportage'), text: 'À cinq heures du matin, le quai de Rivière-au-Renard sent le gasoil et le sel. Gilles, 62 ans, vérifie ses filets à la lueur d’une lampe frontale. « Mon père pêchait ici, mon grand-père aussi. Moi, je serai le dernier », dit-il sans quitter son ouvrage des yeux.\n\nEn vingt ans, le nombre de bateaux a été divisé par trois. Les quotas se sont resserrés, les jeunes partent vers les villes, et le prix des permis atteint des sommets. Pourtant, la municipalité veut y croire : une coopérative de transformation vient d’ouvrir, et un programme forme une nouvelle génération de pêcheurs.\n\nQuand le soleil se lève, le bateau de Gilles franchit la jetée. Derrière lui, sur le quai, deux adolescents en ciré jaune regardent la mer.' };
const R2: Doc = { look: 'article', title: b('Portrait', 'Portrait'), text: 'Nathalie Boucher ne se souvient plus de la dernière fois qu’elle a dîné à une heure normale. Infirmière de nuit depuis dix-sept ans, elle traverse les couloirs silencieux de l’hôpital avec la précision d’un métronome. On la dit sévère ; ses patients la disent rassurante. « La nuit, les gens ont peur. Mon travail, c’est souvent juste d’être là. »\n\nElle parle peu d’elle, beaucoup des autres : de la vieille dame qui l’appelait « ma fille », du jeune homme qu’elle a veillé jusqu’à l’aube. Quand on lui demande si elle songe à arrêter, elle sourit : « Tous les matins. Et tous les soirs, je reviens. »' };
const R3: Doc = { look: 'article', title: b('Investigation', 'Enquête'), text: 'Chaque année, près d’un tiers des aliments produits au pays finissent à la poubelle. Pour comprendre où, nous avons suivi pendant trois mois le parcours d’une cargaison de laitues, du champ à l’assiette.\n\nPremier constat : 15 % sont écartées dès la récolte, parce qu’elles sont trop petites ou abîmées. Ensuite, chez le distributeur, les normes esthétiques en éliminent encore une part. Mais c’est dans nos cuisines que le gaspillage est le plus important : selon les données que nous avons obtenues, les ménages jettent près de la moitié des aliments perdus. Contacté, le ministère reconnaît « un problème majeur », sans toutefois annoncer de mesure concrète.' };

const C = 'r-long-form-journalism';
export default [
  lesson(C, 1, ['the-structure-of-a-reportage', 'la-structure-d-un-reportage'],
    b('The structure of a reportage', 'La structure d’un reportage'),
    b('Follow the movement from scene to issue to closing image.', 'Suivre le mouvement de la scène à l’enjeu, puis à l’image finale.'),
    [b('Recognise the opening scene', 'Reconnaître la scène d’ouverture'), b('Find the context and figures', 'Repérer le contexte et les chiffres'), b('Interpret the final image', 'Interpréter l’image finale')],
    13,
    [
      card(b('Scene, zoom out, scene', 'Scène, élargissement, scène'), b('A reportage often opens with a **sensory scene** (sounds, smells, a person), then **zooms out** to the issue (figures, causes, stakeholders), and ends with a **symbolic image** that sums up the stakes without stating them.', 'Un reportage s’ouvre souvent sur une **scène sensorielle** (sons, odeurs, une personne), puis **élargit** vers l’enjeu (chiffres, causes, acteurs), et se termine sur une **image symbolique** qui résume l’enjeu sans le dire.')),
      doc(R1, b('What is the issue of the reportage?', 'Quel est l’enjeu du reportage ?'), [b('The decline of fishing and its possible renewal', 'Le déclin de la pêche et son renouveau possible'), b('Tourism in Gaspésie', 'Le tourisme en Gaspésie'), b('The price of fish in Montréal', 'Le prix du poisson à Montréal'), b('Gilles’s retirement party', 'La fête de retraite de Gilles')]),
      doc(R1, b('Which is NOT a cause of the decline?', 'Lequel n’est PAS une cause du déclin ?'), [b('A new processing cooperative', 'Une nouvelle coopérative de transformation'), b('Tighter quotas', 'Des quotas resserrés'), b('Young people leaving', 'Le départ des jeunes'), b('Expensive permits', 'Des permis très chers')]),
      doc(R1, b('What does the final image suggest?', 'Que suggère l’image finale ?'), [b('A possible next generation of fishers', 'Une possible relève de pêcheurs'), b('That the teenagers are tourists', 'Que les adolescents sont des touristes'), b('That it is raining', 'Qu’il pleut'), b('That Gilles is leaving for good', 'Que Gilles part pour toujours')]),
      pairs(P.match, [['le quai', b('the quay, wharf', 'bord aménagé du port')], ['un filet', b('a net', 'outil de pêche')], ['un quota', b('a quota', 'quantité maximale autorisée')], ['la relève', b('the next generation (taking over)', 'ceux qui prennent la suite')]]),
      gap(P.complete, 'En vingt ans, le nombre de bateaux a été ___ par trois, mais la municipalité veut y ___.', ['divisé', 'croire']),
    ],
    [
      b('Reportage: sensory scene → issue (figures, causes) → symbolic image.', 'Reportage : scène sensorielle → enjeu (chiffres, causes) → image symbolique.'),
      b('Testimonies make the issue human.', 'Les témoignages incarnent l’enjeu.'),
      b('The ending suggests rather than states.', 'La fin suggère plutôt qu’elle n’affirme.'),
    ],
    [['une lampe frontale', b('a headlamp', 'lampe fixée sur la tête')], ['la jetée', b('the jetty, pier', 'ouvrage qui avance dans la mer')], ['un ciré', b('an oilskin raincoat', 'imperméable de marin')]],
  ),
  lesson(C, 2, ['the-portrait', 'le-portrait'],
    b('The portrait: an angle on a person', 'Le portrait : un angle sur une personne'),
    b('Understand how a portrait reveals a personality through details and quotes.', 'Comprendre comment un portrait révèle une personnalité par des détails et des citations.'),
    [b('Find the angle of the portrait', 'Trouver l’angle du portrait'), b('Interpret details and contrasts', 'Interpréter détails et contrastes'), b('Understand a quote as a conclusion', 'Comprendre une citation qui sert de conclusion')],
    13,
    [
      tip(b('Contrasts reveal', 'Les contrastes révèlent'), b('Portraits often use **contrasts**: **On la dit sévère ; ses patients la disent rassurante.** **Elle parle peu d’elle, beaucoup des autres.** The final quote usually gives the key to the character.', 'Les portraits utilisent souvent des **contrastes** : **On la dit sévère ; ses patients la disent rassurante.** **Elle parle peu d’elle, beaucoup des autres.** La citation finale donne souvent la clé du personnage.')),
      doc(R2, b('What is the angle of the portrait?', 'Quel est l’angle du portrait ?'), [b('A devoted night nurse whose role is mainly to reassure', 'Une infirmière de nuit dévouée dont le rôle est surtout de rassurer'), b('The problems of hospital management', 'Les problèmes de gestion de l’hôpital'), b('A nurse who wants to quit immediately', 'Une infirmière qui veut démissionner tout de suite'), b('A doctor’s career', 'La carrière d’un médecin')]),
      doc(R2, b('« On la dit sévère ; ses patients la disent rassurante » shows…', '« On la dit sévère ; ses patients la disent rassurante » montre…'), [b('a contrast between appearance and reality', 'un contraste entre l’apparence et la réalité'), b('that she is cruel', 'qu’elle est cruelle'), b('that patients complain', 'que les patients se plaignent'), b('that she is new', 'qu’elle est nouvelle')]),
      doc(R2, b('What does her final answer mean?', 'Que signifie sa réponse finale ?'), [b('She is tempted to stop, but her commitment always wins.', 'Elle est tentée d’arrêter, mais son engagement l’emporte toujours.'), b('She works mornings and evenings.', 'Elle travaille matin et soir.'), b('She will stop tomorrow.', 'Elle arrête demain.'), b('She never thinks about stopping.', 'Elle ne pense jamais à arrêter.')]),
      sort(b('Narration or quote?', 'Narration ou citation ?'), [b('narration by the journalist', 'narration du journaliste'), b('quote of Nathalie', 'citation de Nathalie')], [['Elle traverse les couloirs silencieux.', 0], ['« La nuit, les gens ont peur. »', 1], ['Elle parle peu d’elle.', 0], ['« Tous les matins. Et tous les soirs, je reviens. »', 1]]),
      pairs(P.match, [['veiller quelqu’un', b('to sit up with someone', 'rester auprès de quelqu’un la nuit')], ['un métronome', b('a metronome (regularity)', 'appareil qui bat la mesure')], ['songer à', b('to think about, to consider', 'envisager')], ['l’aube', b('dawn', 'lever du jour')]]),
      mc(P.meaning, [b('with great regularity and precision', 'avec une grande régularité et précision'), b('very slowly', 'très lentement'), b('while listening to music', 'en écoutant de la musique'), b('in a hurry', 'dans la précipitation')], { fr: 'avec la précision d’un métronome' }),
    ],
    [
      b('Portrait: an angle, revealing details, contrasts, a key quote.', 'Portrait : un angle, des détails révélateurs, des contrastes, une citation clé.'),
      b('On la dit… = people say she is…', 'On la dit… = on prétend qu’elle est…'),
      b('veiller quelqu’un = to stay by someone’s side at night.', 'veiller quelqu’un = rester auprès de lui la nuit.'),
    ],
    [['rassurant', b('reassuring', 'qui calme les craintes')], ['sévère', b('strict', 'exigeant')], ['dévoué', b('devoted', 'qui se consacre aux autres')]],
  ),
  lesson(C, 3, ['the-investigation', 'l-enquete'],
    b('The investigation: method and evidence', 'L’enquête : méthode et preuves'),
    b('Follow the method, the evidence and the conclusion of an investigation.', 'Suivre la méthode, les preuves et la conclusion d’une enquête.'),
    [b('Identify the method', 'Identifier la méthode'), b('Follow the stages of the evidence', 'Suivre les étapes de la démonstration'), b('Understand an official reaction', 'Comprendre une réaction officielle')],
    13,
    [
      card(b('How investigations are written', 'L’écriture de l’enquête'), b('**Method** (nous avons suivi, nous avons obtenu), **stages** (premier constat, ensuite, mais c’est… que), **sources** (selon les données), **right of reply** (contacté, le ministère reconnaît…). The order often builds to the most surprising finding.', '**Méthode** (nous avons suivi, nous avons obtenu), **étapes** (premier constat, ensuite, mais c’est… que), **sources** (selon les données), **droit de réponse** (contacté, le ministère reconnaît…). L’ordre mène souvent au constat le plus surprenant.')),
      doc(R3, b('What method did the journalists use?', 'Quelle méthode les journalistes ont-ils employée ?'), [b('They followed a shipment of lettuces for three months.', 'Ils ont suivi une cargaison de laitues pendant trois mois.'), b('They interviewed one farmer.', 'Ils ont interrogé un agriculteur.'), b('They read a novel.', 'Ils ont lu un roman.'), b('They cooked lettuces.', 'Ils ont cuisiné des laitues.')]),
      doc(R3, b('Where is the waste greatest?', 'Où le gaspillage est-il le plus important ?'), [b('In households', 'Dans les ménages'), b('In the fields', 'Dans les champs'), b('At the distributor', 'Chez le distributeur'), b('At the ministry', 'Au ministère')]),
      doc(R3, b('What is implied about the ministry’s reaction?', 'Que laisse entendre l’article sur la réaction du ministère ?'), [b('It admits the problem but does nothing concrete.', 'Il reconnaît le problème mais n’agit pas concrètement.'), b('It denies the problem.', 'Il nie le problème.'), b('It announces a new law.', 'Il annonce une nouvelle loi.'), b('It refuses to answer.', 'Il refuse de répondre.')]),
      sort(b('Method, finding or reaction?', 'Méthode, constat ou réaction ?'), [b('method', 'méthode'), b('finding', 'constat'), b('reaction', 'réaction')], [['nous avons suivi pendant trois mois', 0], ['15 % sont écartées à la récolte', 1], ['le ministère reconnaît « un problème majeur »', 2], ['selon les données que nous avons obtenues', 0], ['les ménages jettent près de la moitié', 1]]),
      pairs(P.match, [['le gaspillage', b('waste', 'fait de gaspiller')], ['une cargaison', b('a shipment', 'marchandises transportées')], ['un ménage', b('a household', 'foyer')], ['écarter', b('to discard, to set aside', 'mettre de côté')]]),
      gap(P.complete, 'C’est dans nos cuisines ___ le gaspillage est le plus important ; le ministère reconnaît le problème, sans ___ annoncer de mesure.', ['que', 'toutefois']),
    ],
    [
      b('Investigation: method → stages of evidence → sources → reaction.', 'Enquête : méthode → étapes → sources → réaction.'),
      b('Contacté, X reconnaît… sans toutefois… = implicit criticism.', 'Contacté, X reconnaît… sans toutefois… = critique implicite.'),
      b('c’est… que highlights the key finding.', 'c’est… que met en relief le constat clé.'),
    ],
    [['abîmé', b('damaged', 'détérioré')], ['les normes', b('the standards', 'règles')], ['concret', b('concrete, practical', 'réel, tangible')]],
  ),
];
