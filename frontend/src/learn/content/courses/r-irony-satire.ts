import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At C2, reading French press columns and literary satire means never taking an apparently polite sentence at face value. Writers praise what they despise by antiphrasis, wrap absurd rules in solemnly archaic bureaucracy, and feign naive enthusiasm to expose modern clichés. This mastery course trains you on satirical columns to detect mock-serious tone, separate surface meaning from implicit target, and write a razor-sharp analysis of irony.',
    'Au niveau C2, lire une chronique satirique ou un billet d’humeur exige de ne jamais prendre une phrase polie au pied de la lettre. Les chroniqueurs louent par antiphrase ce qu’ils tournent en ridicule, parent des travers absurdes d’une gravité bureaucratique et feignent l’enthousiasme pour mieux exposer nos travers. Ce cours vous entraîne à décoder l’antiphrase, la fausse gravité et à analyser l’ironie.',
  ),
  outcomes: [
    b('Decode antiphrasis, feigned naivety and biting understatement', 'Décoder antiphrase, candeur feinte et litote mordante'),
    b('Detect mock-serious parody and deliberate register clashes', 'Repérer la fausse gravité et les chocs de registres parodiques'),
    b('Pinpoint the implicit target and true thesis behind satirical praise', 'Identifier la cible implicite et la thèse réelle derrière l’éloge ironique'),
    b('Write a C2 analytical commentary unpacking satirical mechanics', 'Rédiger un commentaire C2 démontant les ressorts de l’ironie'),
  ],
};

const SATIRE_WELLNESS: Doc = { look: 'article', title: b('Satirical column', 'Chronique satirique'), text: 'Un bien-être enfin certifié\n\nQuel progrès admirable que cette nouvelle mode du « rire obligatoire » à sept heures trente du matin ! Grâce à la clairvoyance de nos directions des ressources humaines, nul salarié n’aura désormais le mauvais goût de traverser sa semaine sans afficher une sérénité mesurée au chronomètre. Il est vrai qu’augmenter les effectifs aurait relevé d’une vulgarité archaïque ; un coussin ergonomique et deux exercices de respiration règlent si élégamment la fatigue.' };
const SATIRE_APPS: Doc = { look: 'article', title: b('Mock-serious essay', 'Billet d’humeur'), text: 'Éloge de la notification perpétuelle\n\nIl convient de saluer l’abnégation de ces applications bienveillantes qui veillent à interrompre chacune de nos lectures toutes les quatre minutes. Sans cette vigilance fraternelle, le citoyen risquerait de s’abandonner à une oisiveté coupable, comme terminer un chapitre entier ou contempler un nuage sans en dresser le bilan chiffré. Nul n’oserait soutenir qu’un esprit laissé à lui-même sache encore occuper une heure.' };
const SATIRE_BENCHES: Doc = { look: 'article', title: b('Urban chronicle', 'Chronique urbaine'), text: 'Des bancs enfin intelligents\n\nLa municipalité s’enorgueillit d’avoir remplacé nos vulgaires bancs de bois par des assises connectées, capables de mesurer votre posture et de vous rappeler, par une vibration amicale, qu’il est temps de consommer ailleurs. On s’étonnera à peine que personne ne s’y attarde plus : le progrès urbain consiste visiblement à transformer la flânerie en passage contrôlé.' };

const C = 'r-irony-satire';
export default [
  lesson(C, 1, ['antiphrasis-and-understatement', 'antiphrase-et-litote'],
    b('Antiphrasis and feigned enthusiasm', 'Antiphrase et enthousiasme feint'),
    b('Spot when praise means blame and decode false concessions.', 'Repérer quand un éloge vaut blâme et décoder les fausses concessions.'),
    [b('Recognise antiphrasis markers (quel progrès, si élégamment)', 'Reconnaître les indices d’antiphrase'), b('Spot juxtaposition of absurd and serious', 'Repérer le choc entre sérieux et absurde'), b('Identify the true criticism behind mock praise', 'Identifier la critique réelle sous l’éloge')],
    13,
    [
      trap(b('Never read antiphrasis literally', 'Ne prenez jamais l’antiphrase à la lettre'), b('**L’antiphrase** says the opposite of what the writer thinks (**Quel progrès admirable !**, **si élégamment**). Two clues give it away: **over-praise of something trivial** (compulsory 7:30 a.m. laughter) and a **biting contrast** (calling real staffing solutions « une vulgarité archaïque »).', 'L’**antiphrase** dit le contraire de ce qu’on pense (**Quel progrès admirable !**, **si élégamment**). Deux indices la trahissent : l’**éloge outrancier d’un détail absurde** et le **contraste mordant** qui feint de mépriser la vraie solution.')),
      doc(SATIRE_WELLNESS, b('What is the columnist’s real target?', 'Quelle est la véritable cible du chroniqueur ?'), [b('Superficial corporate wellness perks used instead of hiring enough staff', 'Les gadgets de bien-être qui remplacent des embauches réelles'), b('Employees who arrive late at 7:30 a.m.', 'Les salariés qui arrivent en retard le matin'), b('Ergonomic chairs in offices', 'La qualité des fauteuils de bureau'), b('Working hours being too short', 'Des horaires de travail trop courts')]),
      doc(SATIRE_WELLNESS, b('Why does the author call hiring more staff « une vulgarité archaïque »?', 'Pourquoi l’auteur qualifie-t-il l’augmentation des effectifs de « vulgarité archaïque » ?'), [b('By antiphrasis: to mock managers who treat real solutions as unfashionable', 'Par antiphrase : pour moquer ceux qui jugent dépassée la vraie solution'), b('Because he believes fewer workers are always better', 'Parce qu’il trouve que réduire les équipes est toujours préférable'), b('Because ergonomic cushions cost more than salaries', 'Parce que les coussins coûtent plus cher que des salaires'), b('Because he dislikes breathing exercises too', 'Parce qu’il préfère travailler sans aucune pause')]),
      doc(SATIRE_WELLNESS, b('Which expression signals mock praise of forced cheerfulness?', 'Quelle tournure signale la fausse admiration pour la bonne humeur forcée ?'), [b('« afficher une sérénité mesurée au chronomètre »', '« afficher une sérénité mesurée au chronomètre »'), b('« sept heures trente du matin »', '« sept heures trente du matin »'), b('« nos directions »', '« nos directions »'), b('« deux exercices »', '« deux exercices »')]),
      pairs(P.match, [['une antiphrase', b('saying the opposite ironically', 'dire le contraire par ironie')], ['la candeur feinte', b('pretended innocence / naivety', 'naïveté simulée')], ['une litote', b('understatement (saying less to mean more)', 'dire moins pour suggérer plus')], ['mordant', b('biting, caustic', 'piquant, caustique')]]),
      gap(P.complete, 'En feignant de louer cette mesure « si ___ », le chroniqueur pratique une ___ mordante.', ['élégamment', 'antiphrase']),
    ],
    [
      b('Antiphrasis: praise + absurd detail = sharp criticism.', 'Antiphrase : éloge solennel + détail absurde = critique vive.'),
      b('Watch adverbs like « si élégamment » or « admirablement ».', 'Méfiez-vous d’adverbes hyperboliques comme « si élégamment ».'),
      b('The final clause often drops the mask slightly to reveal the true issue.', 'La fin de phrase révèle souvent l’enjeu réel par contraste.'),
    ],
    [['la clairvoyance', b('foresight, clear-sightedness', 'lucidité')], ['archaïque', b('outdated, archaic', 'dépassé')], ['outrancier', b('overblown, excessive', 'exagéré')]],
  ),
  lesson(C, 2, ['mock-serious-and-bureaucratic-parody', 'pastiche-et-fausse-gravite'],
    b('Mock-serious tone and bureaucratic parody', 'Fausse gravité et pastiche'),
    b('Decode elevated, solemn syntax used to satirise modern habits.', 'Décoder un style noble et solennel employé pour tourner en dérision le quotidien.'),
    [b('Spot register clashes (style noble vs trivial subject)', 'Repérer le décalage entre style noble et sujet banal'), b('Decode moralistic parody (« oisiveté coupable »)', 'Décoder la parodie moralisatrice (« oisiveté coupable »)'), b('Reconstruct the inverted argument', 'Rétablir la thèse inversée de l’auteur')],
    13,
    [
      card(b('The heroicomical register clash', 'Le choc héroï-comique des registres'), b('Satirists borrow solemn phrasing (**il convient de saluer**, **l’abnégation**, **vigilance fraternelle**, **nul n’oserait soutenir**) and apply it to trivial annoyances—such as phone alerts. Calling uninterrupted reading **une oisiveté coupable** (culpable idleness) exposes our obsession with constant metrics.', 'Le satiriste emprunte un ton noble (**il convient de saluer**, **l’abnégation**, **nul n’oserait soutenir**) pour traiter un sujet trivial, ici les alertes de téléphone. Qualifier la lecture tranquille d’**oisiveté coupable** dénonce la tyrannie des métriques.')),
      doc(SATIRE_APPS, b('What does the author ACTUALLY value in this passage?', 'Que défend RÉELLEMENT l’auteur dans ce billet ?'), [b('Uninterrupted reading and unmeasured quiet contemplation', 'La lecture sans interruption et la contemplation gratuite'), b('Receiving notifications every four minutes', 'Recevoir des notifications toutes les quatre minutes'), b('Calculating cloud shapes numerically', 'Mesurer les nuages en statistiques'), b('App developers’ self-sacrifice', 'Le dévouement des concepteurs d’applications')]),
      doc(SATIRE_APPS, b('Why does he call notification alerts « une vigilance fraternelle »?', 'Pourquoi parle-t-il de « vigilance fraternelle » ?'), [b('To disguise intrusive tracking as warm care, exposing its absurdity', 'Pour déguiser l’intrusion numérique en sollicitude et en montrer l’absurdité'), b('Because apps actually care deeply about friendship', 'Parce que les applications cultivent une vraie amitié'), b('Because reading chapters is dangerous', 'Parce que lire un chapitre entier est nuisible'), b('Because he helped design the system', 'Parce qu’il fait la promotion du logiciel')]),
      sort(b('Surface literal mask or real implied stance?', 'Masque ironique ou position réelle implicite ?'), [b('ironic surface mask', 'masque ironique de surface'), b('author’s implied stance', 'position réelle implicite')], [['saluer l’abnégation des applications', 0], ['terminer un chapitre en paix est précieux', 1], ['contempler un nuage est une oisiveté coupable', 0], ['l’attention humaine n’a pas besoin de bilan chiffré', 1]]),
      mc(P.meaning, [b('Selfless devotion—used ironically here for annoying pop-ups', 'Dévouement total — employé ici par ironie pour des alertes agaçantes'), b('Technical failure in a smartphone', 'Panne technique d’un téléphone'), b('Secret password protection', 'Protection par mot de passe'), b('Silent mode on a device', 'Mode silencieux d’un appareil')], { fr: 'l’abnégation (dans ce contexte)' }),
      dict('Nul n’oserait soutenir qu’un esprit libre sache encore occuper une heure.', { voice: 'f' }),
    ],
    [
      b('Elevated register + trivial object = satirical parody.', 'Style solennel + objet dérisoire = parodie satirique.'),
      b('Inverted moral terms (« oisiveté coupable ») highlight what the author defends.', 'Les jugements moraux inversés révèlent ce que l’auteur défend.'),
      b('Nul n’oserait soutenir… mimics pompous certainty to invite disbelief.', 'Nul n’oserait soutenir… imite l’assurance pompeuse pour susciter le doute.'),
    ],
    [['l’abnégation', b('self-sacrifice, selfless devotion', 'dévouement absolu')], ['l’oisiveté', b('idleness', 'inaction prolongée')], ['un pastiche', b('a stylistic parody', 'imitation d’un style')], ],
  ),
  lesson(C, 3, ['decoding-c2-satire-and-writing', 'decoder-et-analyser-la-satire'],
    b('Decoding satire and writing a C2 analysis', 'Décoder et analyser la satire (C2)'),
    b('Unpack shifting irony where the mask slips, then write a concise C2 commentary.', 'Repérer les moments où le masque tombe et rédiger une analyse C2 rigoureuse.'),
    [b('Track subtle shifts from parody to direct critique', 'Suivre le glissement de la parodie à la critique directe'), b('Decode loaded modifiers (amicale, visiblement)', 'Décoder les adjectifs et adverbes chargés d’ironie'), b('Write a crisp C2 analysis of satirical mechanics', 'Rédiger une analyse C2 des ressorts de l’ironie')],
    13,
    [
      card(b('When the mask slips', 'Quand le masque tombe'), b('Strong French chronicles often start in **feigned pride** (**la municipalité s’enorgueillit**), slide into **oxymoronic irony** (**une vibration amicale** that tells you to leave), and finish on a **pointed punchline** (**visiblement**, **chute**) where the true thesis emerges in plain sight.', 'Une chronique commence souvent par une **fausse fierté** (**s’enorgueillit**), glisse vers l’**oxymore ironique** (**vibration amicale** qui chasse le passant) et achève sur une **chute** lucidement formulée.')),
      doc(SATIRE_BENCHES, b('What makes « une vibration amicale » an ironic oxymoron?', 'Qu’est-ce qui rend « une vibration amicale » ironique ?'), [b('Its friendly adjective masks a mechanism designed to push people away.', 'L’adjectif chaleureux masque un mécanisme conçu pour chasser les usagers.'), b('Benches are actually softer than wooden ones.', 'Les bancs connectés sont plus confortables que le bois.'), b('People love feeling vibrations while resting.', 'Les passants apprécient ces rappels pour se reposer.'), b('The city forgot to plug the benches in.', 'La mairie a oublié de brancher les bancs.')]),
      doc(SATIRE_BENCHES, b('What is the implicit thesis of the last sentence?', 'Quelle est la thèse implicite de la dernière phrase ?'), [b('Under the label of « smart progress », public space is being commercialised and stripped of free leisure.', 'Sous couvert de « progrès », l’espace public devient marchand et hostile à la flânerie.'), b('Wooden benches caused too much traffic congestion.', 'Les bancs en bois créaient des embouteillages.'), b('Strolling slowly should be banned in city centres.', 'Il faut interdire la flânerie au centre-ville.'), b('Citizens prefer checking posture data outdoors.', 'Les citoyens veulent mesurer leur posture dehors.')]),
      pairs(P.match, [['s’enorgueillir de', b('to pride oneself on', 'tirer orgueil de')], ['la flânerie', b('aimless, leisurely strolling', 'promenade sans but')], ['visiblement', b('evidently (often ironic)', 'de toute évidence')], ['une chute', b('a closing punchline', 'trait final d’un texte')]]),
      write(b('C2 satire analysis', 'Analyse de l’ironie (C2)'), b('Analyse the short column « Des bancs enfin intelligents » (85–130 words): identify its satirical target, explain how two specific expressions create irony (contrast, false praise or oxymoron), and comment on the closing punchline.', 'Analysez la chronique « Des bancs enfin intelligents » (85–130 mots) : identifiez la cible satirique, montrez comment deux procédés créent l’ironie (antiphrase, oxymore ou fausse fierté) et commentez la chute finale.'), 85, 130, [
        b('Satirical target clearly identified', 'Cible satirique clairement nommée'),
        b('Two ironic devices analysed with quotes', 'Deux procédés d’ironie analysés avec citations'),
        b('Closing punchline and implicit thesis explained', 'Chute et thèse implicite expliquées'),
        b('Sustained C2 analytical register', 'Registre analytique soutenu de niveau C2'),
      ], 'Sous les dehors d’un éloge technologique enthousiaste, cette chronique vise en réalité la marchandisation de l’espace public et le jargon du « progrès ». Dès l’ouverture, l’opposition entre les « vulgaires bancs de bois » et les « assises connectées » parodie le mépris technocratique pour la simplicité des usages ordinaires. L’ironie culmine dans l’oxymore « vibration amicale » : le lexique chaleureux et bienveillant dissimule l’injonction brutale à « consommer ailleurs ». En chute, l’adverbe « visiblement » lève le masque et révèle toute l’absurdité du dispositif : transformer la flânerie gratuite et libre en un simple « passage contrôlé ».', { phrases: ['Sous les dehors de…', 'L’opposition entre… parodie…', 'L’ironie culmine dans…', 'En chute, … révèle…'] }),
      gap(P.complete, 'L’éloge apparent sert à démasquer une contradiction : la ___ libre se trouve réduite à un passage ___.', ['flânerie', 'contrôlé']),
    ],
    [
      b('Look for contrast between warm words (« amicale ») and cold function (pushing people off benches).', 'Repérez l’écart entre mots chaleureux et fonction hostile.'),
      b('Adverbs like « visiblement » or « à peine » often signal ironic understatement.', 'Les adverbes « visiblement » ou « à peine » signalent souvent la distance ironique.'),
      b('In C2 analysis: name the target, unpack the linguistic tension, explain the punchline.', 'À l’écrit C2 : cible, tension linguistique, puis portée de la chute.'),
    ],
    [['la marchandisation', b('commodification', 'transformation en marchandise')], ['un oxymore', b('an oxymoron', 'alliance de deux termes opposés')], ['la flânerie', b('leisurely strolling', 'promenade gratuite et libre')]],
  ),
];
