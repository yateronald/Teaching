import type { CourseAbout } from '../../types';
import { b, card, dict, doc, exam, gap, hear, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At DALF C1, you face authentic long-form recordings (interviews, documentaries, academic talks up to 8 minutes) and dense literary, journalistic or essay passages of 1,500+ words with implicit meaning and nuanced register. This course trains systematic note-taking, dissecting logical flow, recognising speaker irony or hesitation, and answering C1 precision questions rapidly.',
    'Au DALF C1, vous affrontez de longs documents authentiques (entretiens, documentaires, conférences jusqu’à 8 minutes) et des textes denses de plus de 1 500 mots riches en implicite et en nuances stylistiques. Ce cours entraîne la prise de notes efficace, le repérage de l’architecture logique, la détection d’ironie ou d’hésitation et la précision attendue aux questions C1.',
  ),
  outcomes: [
    b('Structure rapid notes during an 8-minute C1 recording', 'Structurer une prise de notes sur un audio C1 de 8 minutes'),
    b('Detect implicit reservations, irony and speaker hedging', 'Repérer réserves implicites, ironie et atténuations'),
    b('Dissect logical links in 1,500-word C1 essays', 'Analyser la charpente logique d’un long essai C1'),
    b('Reformulate complex ideas accurately in comprehension answers', 'Reformuler avec exactitude des idées complexes'),
  ],
};

const C = 'dalf-c1-comprehension';
export default [
  lesson(C, 1, ['c1-note-taking-long-audio', 'c1-prise-de-notes-audio-long'],
    b('Long listening: note-taking and implicit tone', 'Écoute longue : prise de notes et implicite'),
    b('Divide your scratch sheet effectively during long recordings and catch unstated speaker nuances.', 'Organiser son brouillon sur de longs enregistrements et capter les nuances sous-entendues.'),
    [b('Use a 3-column note grid', 'Utiliser une grille de notes en 3 colonnes'), b('Track multi-speaker turn-taking', 'Suivre les échanges à plusieurs intervenants'), b('Decode hedging and understatement', 'Décoder l’atténuation et la litote')],
    13,
    [
      exam(b('DALF C1 Listening (40 min · 25 pts)', 'Épreuve de compréhension orale DALF C1'), b('**Exercise 1 (8–10 min talk/interview, played twice)**: take notes cleanly across the 3-minute pause between plays. **Exercise 2 (several brief clips, played once)**: test immediate grasp of register, irony, intent and field-specific vocabulary. Focus on **verbs of stance** and **concessive pivots** rather than transcribing full sentences.', '**Exercice 1 (entretien ou conférence de 8–10 min, 2 écoutes)** : organisez vos notes pendant la pause de 3 minutes. **Exercice 2 (courts extraits, 1 seule écoute)** : évalue registre, ironie, intention et lexique précis. Notez **verbes d’attitude** et **pivots logiques**, jamais de phrases entières.')),
      tip(b('The 3-column scratch layout', 'La feuille de brouillon en 3 zones'), b('Split your page: **Left = Theme / Chronology**, **Centre = Arguments & Figures** (abbreviations: ↑, ↓, ≠, →), **Right = Disagreements / Reservations / Examples**. During the second listening, fill only the missing blanks in another ink colour or mark stars.', 'Partagez la page : **Gauche = Thèmes**, **Centre = Arguments & Chiffres** (abréviations : ↑, ↓, ≠, →), **Droite = Réserves / Exemples**. À la 2e écoute, complétez uniquement les manques.')),
      hear('Bien entendu, cette loi affiche des ambitions écologiques louables. Encore eût-il fallu prévoir les moyens financiers permettant aux petites communes de les appliquer avant 2028, sans quoi le texte restera un simple vœu pieux.', b('What is the speaker’s real verdict on this environmental law?', 'Quel est le véritable jugement de l’intervenant sur cette loi ?'), [b('Sceptical: ambitious on paper, but lacks funding for small municipalities', 'Sceptique : louable en théorie, mais irréalisable faute de financements locaux'), b('Confident it will achieve every goal well ahead of 2028', 'Persuadé qu’elle sera appliquée avant 2028'), b('Angry that small municipalities wrote the law themselves', 'Mécontent que les petites communes aient rédigé la loi'), b('Convinced ecological laws should never have timelines', 'Convaincu qu’aucune loi ne doit fixer de date')], { voice: 'm2' }),
      hear('Pour tout vous dire, lorsque la commission nous a présenté ces statistiques triomphales, personne dans la salle n’a osé rappeler que la méthode de calcul avait été modifiée six mois plus tôt.', b('What does this anecdote imply about the triumphant statistics?', 'Que sous-entend cette anecdote sur les statistiques présentées ?'), [b('Their apparent improvement may come from changing the measurement method.', 'Leur amélioration apparente tient sans doute au changement de méthode de calcul.'), b('Everyone in the room praised the commission loudly.', 'Toute la salle a applaudi la commission avec enthousiasme.'), b('No statistics had been collected six months earlier.', 'Aucune statistique n’avait été relevée six mois plus tôt.'), b('The audience preferred not to speak about methods at all.', 'La méthode de calcul était déjà bien connue de chacun.')], { voice: 'f2' }),
      pairs(P.match, [['un vœu pieux', b('wishful thinking', 'souhait sans effet réel')], ['sur le papier / en théorie', b('in principle', 'sans application concrète')], ['encore eût-il fallu que', b('it would still have been necessary that', 'condition manquante au C1')], ['oser rappeler', b('to dare point out', 'avoir le courage de mentionner')]]),
    ],
    [
      b('Abbreviate during C1 listening: use symbols (↑, ↓, →, ≠) and track speaker stance, not verbatim words.', 'Abrégez vos notes (↑, ↓, →, ≠) et captez l’attitude plus que le mot à mot.'),
      b('C1 phrasing like « encore faut-il… » or « sur le papier… » marks a critical reservation.', '« Encore eût-il fallu… » ou « afficher des ambitions » annoncent une réserve de fond.'),
      b('During the 3-minute break, highlight unanswered questions so Listening #2 targets them cleanly.', 'Pendant la pause de 3 minutes, repérez les questions sans réponse pour cibler la 2e écoute.'),
    ],
    [['louable', b('praiseworthy', 'qui mérite l’estime')], ['triomphal', b('triumphant (often ironic here)', 'trop glorieux')], ['les moyens financiers', b('funding / financial resources', 'budget disponible')]],
  ),
  lesson(C, 2, ['c1-dissecting-dense-articles', 'c1-analyser-des-textes-denses'],
    b('Reading: 1,500-word essays and logical architecture', 'Lecture : longs essais et architecture logique'),
    b('Map complex essays quickly, spot nuanced concessions and answer reformulation questions in your own words.', 'Cartographier un long essai, repérer concessions subtiles et répondre avec reformulation.'),
    [b('Skim paragraph first lines to map structure', 'Repérer le plan par les phrases d’attaque'), b('Track pronoun and metaphor chains', 'Suivre renvois pronominaux et métaphores'), b('Reformulate rather than copy verbatim', 'Reformuler sans recopier servilement')],
    13,
    [
      doc({ look: 'article', title: b('Extrait — L’accélération de l’information', 'Extrait — L’accélération de l’information'), text: 'Jamais nos sociétés n’ont produit autant de commentaires en temps réel, et pourtant jamais le temps accordé à la vérification n’a paru aussi compté. Ce paradoxe tient moins à une quelconque paresse intellectuelle qu’à un modèle économique récompensant la réaction immédiate au détriment de l’enquête patiente. Loin de condamner les outils numériques en bloc, il s’agit donc de réhabiliter une lenteur critique, seule capable de redonner du poids à la parole publique.' }, b('According to the author, what mainly explains the lack of fact-checking?', 'Selon l’auteur, qu’est-ce qui explique principalement le manque de vérification ?'), [b('An economic model that rewards instant reactions over patient investigation', 'Un modèle économique récompensant l’immédiateté plutôt que l’enquête patiente'), b('Widespread intellectual laziness among modern readers', 'Une paresse intellectuelle généralisée des lecteurs'), b('A complete ban on traditional investigative tools', 'Une interdiction des outils d’enquête classiques'), b('Too few commentaries produced in real time', 'Un manque de commentaires en temps réel')]),
      doc({ look: 'article', title: b('Extrait — Le paradoxe du patrimoine urbain', 'Extrait — Le paradoxe du patrimoine urbain'), text: 'À force de restaurer nos centres historiques pour satisfaire le regard du visiteur pressé, certaines municipalités finissent par les vider de leurs habitants ordinaires. On obtient ainsi des décors impeccables mais figés, où les ateliers cèdent la place aux boutiques de souvenirs — évolution que d’aucuns célèbrent comme une renaissance économique, mais qui menace l’âme même de la cité.' }, b('What nuance does « que d’aucuns célèbrent » introduce?', 'Quelle nuance l’expression « que d’aucuns célèbrent » introduit-elle ?'), [b('Some view this change positively for the economy, though the author sees it as a threat to city life.', 'Certains y voient une réussite économique, alors que l’auteur y perçoit une menace pour la vie du quartier.'), b('No one welcomes this change anywhere in Europe.', 'Personne ne se réjouit de cette transformation.'), b('Craft workshops deliberately chose to sell souvenirs.', 'Les artisans ont volontairement choisi de vendre des souvenirs.'), b('Historic city centres lacked visitors before restoration.', 'Les centres historiques manquaient totalement de visiteurs.')]),
      sort(b('Author’s stance vs counter-stance', 'Position de l’auteur ou thèse opposée ?'), [b('author’s core claim', 'thèse de l’auteur'), b('view the author qualifies / rejects', 'idée rejetée ou nuancée')], [['réhabiliter une lenteur critique', 0], ['une quelconque paresse intellectuelle', 1], ['un décor figé qui chasse les habitants', 0], ['une renaissance économique célébrée sans réserve', 1]]),
      gap(P.complete, 'Ce phénomène tient ___ à un manque de volonté ___ à des contraintes économiques ; ___ condamner la technique, il convient de la réguler.', ['moins', 'qu’', 'loin de'], { choices: [['moins', 'plus', 'autant'], ['qu’', 'et', 'ou'], ['loin de', 'grâce à', 'faute de']] }),
    ],
    [
      b('C1 uses « tient moins à X qu’à Y » to refute a cliché before giving the true explanation.', '« Tient moins à X qu’à Y » réfute l’idée reçue avant de donner la vraie cause.'),
      b('« D’aucuns » (= certains) distances the author from a popular claim.', '« D’aucuns » (= certains) marque la distance de l’auteur face à un avis répandu.'),
      b('At C1, comprehension answers graded « reformuler » deduct points if copied word-for-word.', 'Au C1, quand la consigne demande de reformuler, évitez de recopier des lignes entières.'),
    ],
    [['d’aucuns', b('some people (literary/formal)', 'certaines personnes')], ['compté', b('scarce, strictly limited', 'limité, rare')], ['figé', b('frozen, lifeless', 'immobile, sans vie')]],
  ),
  lesson(C, 3, ['c1-reformulation-and-lexicon', 'c1-reformuler-avec-precision'],
    b('Reformulation, idioms and fine vocabulary nuances', 'Reformuler avec justesse et lexique C1'),
    b('Practice turning dense C1 sentences into concise, accurate comprehension answers.', 'S’entraîner à reformuler des passages denses en réponses précises et personnelles.'),
    [b('Match abstract C1 idioms to plain sense', 'Relier tournures C1 et sens exact'), b('Preserve subtle qualifiers (partiellement, à terme)', 'Conserver les nuances dans la reformulation'), b('Avoid adding outside assumptions', 'Ne jamais extrapoler au-delà du texte')],
    13,
    [
      card(b('Three rules of C1 comprehension reformulation', 'Trois règles pour reformuler au DALF C1'), b('1. Replace key **verbs and nouns** with accurate **synonyms** (**« freiner l’exode » → « ralentir le départ des habitants »**). 2. Keep the **exact degree of certainty or nuance** (never turn *« il arrive que »* into *« toujours »*). 3. Stay **brief and neutral**: never give your personal opinion on a comprehension sheet.', '1. Remplacez **verbes et noms clés** par des **synonymes justes** (**« freiner l’exode » → « ralentir le départ des habitants »**). 2. Gardez le **degré exact de nuance** (ne transformez jamais *« il arrive que »* en *« toujours »*). 3. Restez **concis et neutre** : aucun avis personnel en compréhension.')),
      mc(P.best, ['L’auteur estime que cette mesure limite provisoirement le problème sans en traiter l’origine profonde.', 'Selon le texte : « L’auteur pense que c’est un pansement sur une jambe de bois. »', 'Cette mesure est totalement inutile et dangereuse pour tout le monde.', 'Moi aussi, je pense qu’il faudrait plus d’argent public dans ce secteur.'], { fr: 'Texte : « Cette mesure revient à poser un pansement sur une plaie profonde. » Quelle reformulation obtient tous les points en C1 ?' }),
      pairs(P.match, [['à contre-courant', b('against the trend', 'à l’opposé de la tendance')], ['battre en brèche', b('to challenge / undermine', 'remettre fortement en cause')], ['faire florès', b('to thrive / spread widely', 'avoir grand succès')], ['demeurer lettre morte', b('to remain a dead letter / unenforced', 'ne jamais être appliqué')]]),
      mc(P.meaning, [b('the rule exists on paper but is not enforced', 'la règle existe mais n’est pas appliquée'), b('the postal service lost a parcel', 'un courrier a été perdu'), b('laws are written in Latin', 'les lois sont écrites en latin'), b('citizens refused to read the notice', 'les citoyens refusent de lire')], { fr: 'Que veut dire « cette disposition demeure lettre morte » ?' }),
      dict('Loin de condamner le progrès, l’auteur invite simplement à en maîtriser le rythme.', { voice: 'f' }),
    ],
    [
      b('Replace metaphorical idioms (« pansement sur une plaie ») with literal prose in C1 answers.', 'Traduisez les images (« pansement sur une plaie ») en termes clairs et littéraux.'),
      b('Maintain exact qualifiers: provisional, partial, systemic.', 'Respectez la nuance exacte : provisoire, partiel, structurel.'),
      b('Leave your own opinion solely for Paper 3 (synthesis & essay) and Paper 4 (oral).', 'Gardez votre avis personnel pour les épreuves de production, jamais en compréhension.'),
    ],
    [['un pansement', b('a bandage', 'soin superficiel')], ['en bloc', b('wholesale, completely', 'dans son ensemble')], ['à contre-courant', b('against the tide', 'en sens inverse')]],
  ),
];
