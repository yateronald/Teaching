import type { CourseAbout } from '../../types';
import { b, card, dlg, flash, hear, lesson, mc, ord, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At C2 level, true oral mastery shows up when the script disappears: an unexpected question on a panel, a pointed interruption, an improvised farewell toast or a momentary mental blank. This course trains high-level spontaneity in French—buying thinking time with poise, structuring instant replies, disarming tension with self-deprecating wit (autodérision) and landing crisp, memorable punchlines without notes.',
    'Au niveau C2, la véritable maîtrise orale se révèle quand le texte disparaît : question imprévue en table ronde, interruption piquante, toast improvisé ou trou de mémoire passager. Ce cours entraîne l’aisance spontanée en français : gagner du temps avec élégance, structurer une réponse à chaud, désamorcer par l’autodérision et conclure sur une formule ciselée sans aucune note.',
  ),
  outcomes: [
    b('Buy thinking time and structure replies on the fly', 'Gagner du temps avec élégance et structurer à chaud'),
    b('Handle interruptions and witty repartee with poise', 'Gérer interruptions et repartie du tac au tac'),
    b('Recover seamlessly from a momentary blank mind', 'Rebondir avec naturel après un trou de mémoire'),
    b('Deliver an unscripted speech or toast memorably', 'Improviser un discours ou un toast mémorable'),
  ],
};

const C = 'c-impromptu-c2';
export default [
  lesson(C, 1, ['thinking-on-your-feet', 'rebondir-a-l-improviste'],
    b('Thinking on your feet', 'Rebondir à l’improviste'),
    b('Buy thinking time gracefully, latch onto a speaker’s words and structure instant answers.', 'Gagner du temps avec élégance, rebondir sur un mot et structurer une réponse à chaud.'),
    [b('Replace clumsy fillers with poised bridges', 'Remplacer les hésitations par des transitions fluides'), b('Structure instant replies in two or three beats', 'Structurer une réponse à chaud en deux ou trois temps'), b('Concede a point before pivoting', 'Concéder un point avant de pivoter')],
    13,
    [
      card(b('Elegance under pressure', 'Élégance à brûle-pourpoint'), b('Buy three seconds without *« euh »*: **Vous mettez précisément le doigt sur le paradoxe central. · À brûle-pourpoint, deux éléments me frappent. · Si j’ose une réponse à chaud… · Prenons un instant un pas de recul.** Then frame quickly: *constat, nuance, perspective* or *à court terme / à long terme*.', 'Gagner trois secondes sans *« euh »* : **Vous mettez précisément le doigt sur le paradoxe central. · À brûle-pourpoint, deux éléments me frappent. · Si j’ose une réponse à chaud… · Prenons un instant un pas de recul.** Puis cadrez vite : *constat, nuance, perspective* ou *à court terme / à long terme*.'), {
        ex: [['Excellente objection — elle mérite qu’on la regarde sous deux angles.', 'Excellent objection — it deserves to be looked at from two angles.'], ['Oui, le coût initial est réel, mais c’est sur la durée que l’équilibre se fait.', 'Yes, the upfront cost is real, but it’s over time that the balance pays off.']],
      }),
      sort(b('Poised bridge or clumsy hesitation?', 'Transition maîtrisée ou hésitation maladroite ?'), [b('poised bridge', 'relance élégante'), b('clumsy filler', 'hésitation maladroite')], [['Vous mettez précisément le doigt sur le paradoxe central.', 0], ['Euh, attendez, je sais pas trop quoi dire là…', 1], ['À brûle-pourpoint, deux aspects me viennent à l’esprit.', 0], ['C’est une question bizarre, je n’avais rien préparé.', 1], ['Permettez-moi d’élargir un instant votre remarque.', 0], ['Bref, voilà, quoi, c’est assez compliqué.', 1]]),
      hear('À brûle-pourpoint, je dirais que votre objection touche juste : oui, le coût initial est élevé, mais c’est précisément sur la durée que l’économie se révèle.', b('How does the speaker handle the unexpected objection?', 'Comment l’orateur traite-t-il l’objection imprévue ?'), [b('acknowledges it hits the mark, concedes upfront cost, then pivots to long-term savings', 'reconnaît sa justesse, admet le coût initial, puis pivote vers l’économie durable'), b('rejects the question as off-topic for the panel', 'rejette la question comme hors sujet'), b('promises to send written figures later instead of answering', 'promet d’envoyer des chiffres plus tard sans répondre'), b('claims upfront costs do not exist at all', 'affirme qu’il n’y a aucun coût initial')], { voice: 'm' }),
      mc(P.best, ['Vous soulevez là un angle fascinant : si l’on prend un pas de recul, deux réalités coexistent…', 'Bonne question, mais passez au suivant s’il vous plaît.', 'Je ne peux pas répondre sans relire mes fiches.', 'Attendez deux minutes que je réfléchisse en silence.'], { fr: 'En table ronde, une question surprise arrive hors de votre thème préparé :' }),
      pairs(P.match, [['à brûle-pourpoint', b('on the spot, point-blank', 'sans préparation, tout à coup')], ['prendre un pas de recul', b('to step back', 'élargir sa perspective')], ['mettre le doigt sur', b('to pinpoint', 'identifier exactement')], ['à chaud', b('off the cuff, right away', 'immédiatement, sur le vif')]]),
      say('À brûle-pourpoint, deux aspects me semblent essentiels : l’immédiateté de la réponse et sa portée à long terme.', 'Off the cuff, two aspects seem essential to me: the immediacy of the answer and its long-term reach.'),
    ],
    [
      b('À brûle-pourpoint · à chaud · prendre un pas de recul.', 'À brûle-pourpoint · à chaud · prendre un pas de recul.'),
      b('Acknowledge the sharpness of a question before structuring 2–3 beats.', 'Saluer la pertinence d’une question avant de dérouler 2 ou 3 axes.'),
      b('Concede the obvious truth first, then pivot cleanly.', 'Concéder l’évidence d’abord, puis pivoter avec netteté.'),
    ],
    [['à brûle-pourpoint', b('suddenly, without warning', 'de façon imprévue et directe')], ['la portée', b('the scope, impact', 'effet à long terme')], ['à chaud', b('on the spot, immediately', 'sur le vif')]],
  ),
  lesson(C, 2, ['pivoting-and-repartee', 'pivoter-et-repondre-du-tac-au-tac'],
    b('Pivoting, wit & repartee', 'Pivoter, esprit et repartie'),
    b('Handle interruptions gracefully, disarm critics with wit and steer back to your core message.', 'Gérer une interruption avec grâce, désamorcer par l’esprit et recentrer son propos.'),
    [b('Handle interruptions without losing composure', 'Gérer une interruption avec calme'), b('Use self-deprecation to disarm tension', 'Employer l’autodérision pour désarmer'), b('Pivot smoothly back to the true issue', 'Recentrer vers l’enjeu véritable')],
    13,
    [
      card(b('Repartee without aggression', 'La repartie sans agressivité'), b('Wit hits harder when it stays smiling: **Répondre du tac au tac. · Je prends votre pique avec le sourire, mais revenons à l’enjeu véritable. · Laissez-moi achever cette phrase, je vous cède aussitôt la parole. · Au risque de vous surprendre…**', 'L’esprit porte d’autant mieux qu’il garde le sourire : **Répondre du tac au tac. · Je prends votre pique avec le sourire, mais revenons à l’enjeu véritable. · Laissez-moi achever cette phrase, je vous cède aussitôt la parole. · Au risque de vous surprendre…**'), {
        ex: [['L’autodérision désarme une salle plus vite que la défensive.', 'Self-deprecation disarms a room faster than defensiveness.'], ['J’achève mon exemple en dix secondes et je vous écoute aussitôt.', 'I’ll finish my example in ten seconds and listen to you right away.']],
      }),
      tip(b('The disarming power of autodérision', 'La force désarmante de l’autodérision'), b('A brief, smiling acknowledgment of an imperfection wins the audience instantly: **« J’avoue que même ma mère ne m’aurait pas défendu avec autant de conviction — mais venons-en au fait ! »**', 'Reconnaître avec légèreté une limite conquiert aussitôt le public : **« J’avoue que même ma mère ne m’aurait pas défendu avec autant de conviction — mais venons-en au fait ! »**')),
      dlg(b('Unscripted Q&A', 'Séance de questions imprévues'), undefined, [['Modératrice', 'f2'], ['Vous', 'm']], [
        [0, 'Avouez-le : votre proposition était surtout brillante sur le papier il y a dix ans !', 'Admit it: your proposal was mainly brilliant on paper ten years ago!'],
        [1, { options: ['Je prends votre pique avec le sourire — et j’espère avoir un peu mûri depuis ! Mais regardons surtout les résultats de l’an dernier.', 'C’est insultant, vous n’avez pas le droit de dire ça.', 'Oui, vous avez raison, tout était faux.'] }],
        [0, 'Bien esquivé ! Attendez, un intervenant souhaite vous couper sur les chiffres…', 'Nicely parried! Wait, a panellist wants to jump in on the figures…'],
        [1, { options: ['Avec plaisir : laissez-moi juste boucler cette idée en dix secondes et je lui cède aussitôt la parole.', 'Non, qu’il se taise jusqu’à la fin !', 'Bon, j’arrête de parler alors.'] }],
      ]),
      mc(P.best, ['Un instant, je termine mon raisonnement en dix secondes et je vous écoute aussitôt.', 'Taisez-vous, c’est mon tour de parole !', 'Ne me coupez plus jamais la parole.', 'D’accord, j’ai oublié ce que je disais de toute façon.'], { fr: 'Un contradicteur tente de vous interrompre en plein milieu d’une phrase clé :' }),
      ord(P.order, 'Je prends votre pique avec le sourire, mais revenons à l’essentiel.', { tr: 'I take your jab with a smile, yet let’s return to what matters.', extra: ['colère'] }),
      say('Je prends votre remarque avec le sourire, mais le véritable enjeu est ailleurs.', 'I take your remark with a smile, yet the real issue lies elsewhere.'),
    ],
    [
      b('Répondre du tac au tac = quick, sharp repartee.', 'Répondre du tac au tac = répliquer sur-le-champ.'),
      b('L’autodérision désarme mieux qu’une défense crispée.', 'L’autodérision désarme mieux qu’une défense crispée.'),
      b('Hold the floor politely: « J’achève en dix secondes et je vous écoute. »', 'Garder la parole poliment : « J’achève en dix secondes et je vous écoute. »'),
    ],
    [['du tac au tac', b('quick as a flash, tit for tat', 'réponse immédiate et vive')], ['l’autodérision (f)', b('self-deprecation', 'humour dirigé contre soi-même')], ['une pique', b('a subtle dig, barb', 'remarque légèrement piquante')]],
  ),
  lesson(C, 3, ['holding-the-floor-without-notes', 'tenir-la-scene-sans-notes'],
    b('Holding the floor without notes', 'Tenir la scène sans notes'),
    b('Recover smoothly from a blank mind, tell a micro-anecdote and deliver a chiselled close.', 'Surmonter un trou de mémoire, placer une micro-anecdote et conclure par une formule ciselée.'),
    [b('Recover naturally from a blank moment', 'Rebondir élégamment après un trou de mémoire'), b('Use concrete imagery and pace shifts', 'Employer image concrète et variation de débit'), b('Write a crisp improvised farewell toast', 'Rédiger un toast d’adieu improvisé de niveau C2')],
    13,
    [
      card(b('Speaking without a net', 'Parler sans filet'), b('If your mind goes blank, slow down and anchor to something concrete: **Reprenons le fil un instant… · Ce que révèle cette anecdote, c’est… · Mieux vaut une image nette qu’un grand discours abstrait.** Before the punchline, pause and slow down: **une formule brève et ciselée** stays in memory.', 'En cas de blanc, ralentissez et ancrez-vous dans du concret : **Reprenons le fil un instant… · Ce que révèle cette anecdote, c’est… · Mieux vaut une image nette qu’un grand discours abstrait.** Avant la chute, marquez un silence et ralentissez : **une formule brève et ciselée** reste en mémoire.'), {
        ex: [['Votre chaise restera peut-être vide, mais votre trace demeure intacte.', 'Your chair may remain empty, yet your mark stays intact.'], ['On m’a pris au dépourvu, mais l’essentiel tient en trois mots.', 'I was caught off guard, yet what matters fits in three words.']],
      }),
      mc(P.best, ['Reprenons le fil un instant : ce qui compte dans cet exemple concret, c’est…', 'Oh là là, j’ai tout oublié, pardon !', 'Attendez que je cherche mes notes dans mon sac.', 'C’est fini, merci à tous.'], { fr: 'En plein discours sans notes, vous perdez brièvement le fil de votre deuxième idée :' }),
      write(b('Impromptu farewell toast', 'Toast d’adieu improvisé'), b('Write an impromptu 1-minute speech (95–140 words) for a colleague or mentor’s farewell when called on unexpectedly: acknowledge being put on the spot, share one vivid micro-anecdote, pivot with light wit or antithesis, and end on a concise, chiselled toast.', 'Rédigez une prise de parole improvisée d’une minute (95–140 mots) lors du départ d’une collègue ou d’un mentor : évoquez la surprise d’être appelé à brûle-pourpoint, racontez une micro-anecdote vivante, pivotez par un trait d’esprit ou une antithèse et concluez sur un toast ciselé.'), 95, 140, [
        b('Graceful acknowledgment of speaking on the spot', 'Mention élégante de l’improvisation'),
        b('One vivid, concrete micro-anecdote', 'Une micro-anecdote concrète et vivante'),
        b('Wit or antithesis pivoting to gratitude', 'Trait d’esprit ou antithèse vers l’hommage'),
        b('Brief, memorable closing toast', 'Toast final bref et ciselé'),
      ], 'À brûle-pourpoint, on me demande de saluer dix ans aux côtés de Claire — autant dire résumer un roman en trois lignes ! Quand j’ai rejoint l’équipe, j’étais convaincu de tout maîtriser ; dès la première réunion, Claire m’a posé une seule question silencieuse qui a démonté mon plan en dix secondes, avec ce sourire bienveillant qui désarme toute vanité. Voilà toute sa marque : l’exigence sans dureté, l’autorité sans bruit. On pourrait craindre son départ ; je préfère y voir l’élan qu’elle nous laisse en héritage. Chère Claire, votre chaise restera peut-être vide, mais votre trace demeure intacte. À vos nouveaux projets — et santé à celle qui nous a appris à viser juste !', { phrases: ['À brûle-pourpoint…', 'Voilà toute sa marque…', 'je préfère y voir…'] }),
      flash(b('Quick revision', 'Révision express'), [['À brûle-pourpoint…', b('On the spot / without warning…', 'sans préparation')], ['Répondre du tac au tac', b('To reply quick as a flash', 'repartir aussitôt avec esprit')], ['Prendre avec le sourire', b('To take in good humour', 'garder son calme élégant')], ['Reprendre le fil', b('To pick up the thread', 'retrouver le sens du propos')], ['Une formule ciselée', b('A finely crafted line', 'phrase brève et mémorable')]]),
      pairs(P.match, [['ciselé', b('finely crafted, incisive', 'taillé avec précision')], ['reprendre le fil', b('to pick up the thread', 'retrouver le fil du discours')], ['au dépourvu', b('off guard, unprepared', 'sans y être préparé')], ['viser juste', b('to hit the mark', 'toucher exactement le bon point')]]),
      say('Pardonnez la spontanéité du propos : on m’a pris au dépourvu, mais ce que je retiens tient en trois mots.', 'Forgive the spontaneity of these words: I was caught off guard, yet what stays with me fits in three words.'),
    ],
    [
      b('Anchor a blank mind with a concrete anecdote, then pause before the close.', 'Ancrer un trou de mémoire dans une anecdote concrète, puis marquer une pause avant la chute.'),
      b('Reprenons le fil… · Ce que je retiens tient en…', 'Reprenons le fil… · Ce que je retiens tient en…'),
      b('Finish on a short, chiselled contrast or image.', 'Conclure sur un contraste ou une image courte et ciselée.'),
    ],
    [['ciselé', b('chiselled, finely honed', 'écrit ou dit avec justesse')], ['au dépourvu', b('unprepared, off guard', 'par surprise')], ['un trou de mémoire', b('a mental blank', 'oubli soudain')]],
  ),
];
