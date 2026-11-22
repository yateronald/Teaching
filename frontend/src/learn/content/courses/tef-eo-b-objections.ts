import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In TEF Speaking Section B, you have ten minutes to convince a sceptical friend (played by the examiner) to join an activity, trip or project from an ad. Examiners systematically throw tough blockers: « C’est trop cher », « Je n’ai pas le temps », « Je suis nul », « Je suis trop fatigué » or « J’ai déjà essayé ». This course equips you with empathetic reframes, concrete compromises and low-pressure closings using natural tu.',
    'En section B de l’expression orale du TEF, vous disposez d’une dizaine de minutes pour convaincre un ami sceptique (joué par l’examinateur) de participer à une activité. Les examinateurs opposent des blocages classiques : « C’est trop cher », « Je n’ai pas le temps », « Je suis nul », « Je suis trop crevé » ou « J’ai déjà essayé ». Ce cours arme vos réponses de reformulations empathiques, de compromis concrets et de conclusions naturelles au tutoiement.',
  ),
  outcomes: [
    b('Overcome money and schedule blockers without arguing head-on', 'Lever les objections de budget et de temps sans brusquer'),
    b('Turn fear of failing, fatigue and past bad experiences around', 'Transformer manque de confiance, fatigue et scepticisme en atouts'),
    b('Handle double pushbacks and stubborn hesitation smoothly', 'Gérer les relances insistantes et doubles objections avec calme'),
    b('Secure a realistic low-friction agreement at the end of the call', 'Conclure par un accord concret et réaliste sans forcer'),
  ],
};

const C = 'tef-eo-b-objections';
export default [
  lesson(C, 1, ['money-and-time-objections', 'objections-prix-et-temps'],
    b('Beating « c’est trop cher » and « pas le temps »', 'Répondre à « c’est trop cher » et « pas le temps »'),
    b('Validate your friend’s reality first, then reframe cost and schedule concretely.', 'Valider la contrainte de votre ami puis recadrer budget et emploi du temps.'),
    [b('Handle price objections with value math and split options', 'Répondre au prix par le calcul réel et les solutions pratiques'), b('Handle busy-schedule blockers with low time commitment', 'Contourner le manque de temps par la souplesse'), b('Avoid blunt dismissal or quick surrender', 'Éviter de minimiser sèchement ou d’abandonner trop vite')],
    13,
    [
      card(b('Empathy + Reframe + Compromise', 'Empathie + Recadrage + Compromis'), b('Never reply « Mais non, ce n’est pas cher ! » — that ignores your friend. Use **tu** + 3 steps: **1. Validate**: **Je comprends, c’est vrai que…** **2. Reframe**: **Mais si tu calcules… / Justement, en deux heures…** **3. Compromise**: **On peut tester une seule fois / partager les frais.**', 'Ne dites jamais « Mais non, ce n’est pas cher ! » — c’est maladroit. Utilisez **tu** en 3 temps : **1. Valider** : **Je comprends, c’est vrai que…** **2. Recadrer** : **Mais si tu calcules… / Justement, en deux heures…** **3. Compromis** : **On peut tester une seule fois / partager les frais.**')),
      mc(P.best, ['Je comprends que 180 dollars paraisse élevé, mais tout le matériel et quatre repas sont compris ; en plus, si on divise en trois mois ou qu’on covoiture, ça te coûte moins qu’une sortie au restaurant par semaine.', 'Mais non, 180 dollars ce n’est rien du tout aujourd’hui !', 'Si tu n’as pas d’argent, tant pis, j’irai avec quelqu’un d’autre.', 'Demande une augmentation à ton chef ou emprunte-moi l’argent.'], { fr: 'Votre ami dit : « 180 dollars le stage de week-end, c’est hors budget pour moi en ce moment. »' }),
      mc(P.best, ['Je sais que tes semaines sont chargées, justement c’est seulement deux heures le samedi matin, et tout est prêt sur place : aucune préparation à faire chez toi !', 'Tu dis toujours que tu n’as pas le temps, c’est une fausse excuse.', 'Alors travaille tout le week-end et reste stressé.', 'D’accord, on annule tout, je comprends.'], { fr: 'Votre amie soupire : « Je travaille cinquante heures par semaine, je n’ai zéro temps libre… »' }),
      dlg(b('Price + schedule double blocker', 'Double objection prix et temps'), undefined, [['Examinatrice (amie)', 'f'], ['Vous', 'm']], [
        [0, 'Un panier hebdomadaire de légumes bio à trente dollars ? Entre le prix et le temps pour cuisiner, oublie ça !', 'A weekly organic veggie box for thirty dollars? Between the price and time to cook, forget it!'],
        [1, { options: ['Je te comprends, trente dollars ça fait réfléchir. Mais à deux on peut partager un grand panier à quinze dollars chacun, et ils donnent des recettes rapides en quinze minutes !', 'Trente dollars, c’est donné ! Arrête de te plaindre.', 'Bon, tu as raison, achetons des plats tout prêts au supermarché.'] }],
        [0, 'Mouais… et il faut aller chercher le panier à l’autre bout du quartier ?', 'Yeah right… and we have to pick it up across the neighbourhood?'],
        [1, { options: ['Justement non, le point de dépôt est juste devant ton arrêt de métro le jeudi soir, et je peux le récupérer pour nous deux une semaine sur deux !', 'Tu peux marcher vingt minutes, ça te fera du sport.', 'Je ne sais pas où c’est exactement.'] }],
      ]),
      sort(b('Good persuasion or bad tone?', 'Bonne persuasion ou mauvais ton ?'), [b('empathetic & persuasive', 'empathique et persuasif'), b('blunt / gives up too fast', 'brusque ou résigné')], [['Je sais que ton budget est serré ; si on partage, ça passe à moitié prix.', 0], ['C’est ton problème si tu gères mal ton argent.', 1], ['Justement, ça dure une heure et tu n’as rien à préparer avant.', 0], ['Bon ben tant pis, reste devant ta télé.', 1]]),
      say('Je te comprends complètement, mais si on partage les frais à deux, ça revient vraiment moins cher qu’une sortie ordinaire.', 'I completely understand you, but if we split the costs between the two of us, it really works out cheaper than an ordinary night out.'),
    ],
    [
      b('Validate cost or time pressure first (« Je sais que ton budget est serré… ») before reframing.', 'Validez d’abord la contrainte (« Je sais que ton budget est serré… ») avant de répondre.'),
      b('Break big prices down per session/person and show concrete cost-sharing ideas.', 'Ramenez le prix à la séance ou par personne et proposez de partager les frais.'),
      b('Counter lack of time with zero-prep convenience, flexible slots or doing errands together.', 'Répondez au manque de temps par la simplicité, l’horaire souple ou l’entraide.'),
    ],
    [['hors budget', b('over budget / unaffordable', 'trop cher pour ses moyens')], ['covoiturer', b('to carpool', 'partager une voiture')], ['diviser les frais', b('to split the costs', 'partager ce qu’on paie')]],
  ),
  lesson(C, 2, ['skill-fatigue-and-scepticism', 'peur-fatigue-et-scepticisme'],
    b('Skill doubts, fatigue and scepticism', 'Peur d’être nul, fatigue et scepticisme'),
    b('Overcome self-doubt, low energy and past disappointments with reassuring solutions.', 'Désamorcer le manque d’assurance, la fatigue et les mauvais souvenirs.'),
    [b('Turn self-doubt (« je suis nul ») into a selling point', 'Transformer le manque de niveau en avantage'), b('Reframe fatigue into recharging energy', 'Présenter l’activité comme un vrai repos actif'), b('Overcome scepticism from past disappointments', 'Lever les doutes liés à une mauvaise expérience passée')],
    13,
    [
      card(b('Three emotional blockers', 'Trois blocages émotionnels fréquents'), b('When an examiner says **« Je suis nul »**, **« Je suis crevé »** or **« J’ai déjà essayé et c’était nul »**, facts alone won’t move them. Reassure warmly: **Justement, c’est pensé pour les débutants · Tu vas voir, ça vide la tête · Fais-moi confiance, cette fois le format est tout petit.**', 'Face à **« Je suis nul »**, **« Je suis crevé »** ou **« J’ai déjà essayé »**, les chiffres ne suffisent pas. Rassurez avec chaleur : **Justement, c’est pensé pour les débutants · Tu vas voir, ça vide la tête · Fais-moi confiance, cette fois le format est tout petit.**')),
      hear('Franchement, la dernière fois que j’ai accepté de t’accompagner dans un club le soir, tout le monde se connaissait déjà et je me suis senti complètement à l’écart pendant deux heures.', b('Which reply best resolves this past bad experience?', 'Quelle réponse rassure le mieux après cette mauvaise expérience ?'), [b('I remember that and I’m sorry — here everyone arrives alone for speed-exchanges, and I’ll stay right with you all evening.', 'Je m’en souviens et tu as raison ; là-bas tout le monde débute ensemble, et je reste avec toi toute la soirée.'), b('That was your fault because you didn’t talk to enough strangers last time.', 'C’était de ta faute parce que tu n’as parlé à personne la dernière fois.'), b('Oh, forget the past, people in clubs are always super friendly anyway.', 'Oublie le passé, les gens sont toujours sympas partout.'), b('If you felt left out, maybe group activities aren’t made for you.', 'Si tu t’es senti à l’écart, reste plutôt chez toi alors.')], { voice: 'm', timer: 45 }),
      dlg(b('Dragon boat / kayak morning', 'Matinée kayak communautaire'), undefined, [['Examinateur (ami)', 'm'], ['Vous', 'f']], [
        [0, 'Du kayak dimanche à 9 h ? Je suis nul en sport et je vais être ridicule devant tout le monde !', 'Kayaking Sunday at 9 a.m.? I’m terrible at sports and I’ll look ridiculous in front of everyone!'],
        [1, { options: ['Justement, ce n’est pas une course : c’est une balade tranquille avec un moniteur qui apprend les gestes de base en dix minutes, et on est dans le même bateau !', 'Mais non, il suffit d’avoir des bras solides !', 'Si tu as peur du ridicule, regarde-nous depuis le bord.'] }],
        [0, 'Et puis je suis épuisé de ma semaine, j’ai juste envie de dormir.', 'Besides, I’m exhausted from my week; I just want to sleep.'],
        [1, { options: ['Franchement, passer une heure sur l’eau calme au soleil, loin des écrans, ça recharge dix fois mieux que de traîner au lit — et après, je t’offre le brunch !', 'Tu dors déjà assez la nuit, fais un effort.', 'D’accord, dors bien alors, salut !'] }],
      ]),
      pairs(P.match, [['Je suis nul là-dedans', b('Justement, c’est une initiation sans jugement', 'réponse au manque de niveau')], ['Je suis trop fatigué', b('Ça te videra la tête bien mieux qu’un écran', 'réponse à la fatigue')], ['C’est trop loin de chez moi', b('Je passe te prendre en voiture devant ta porte', 'réponse à la distance')], ['Et si je n’aime pas ?', b('Ça ne t’engage à rien, on teste une seule fois', 'réponse à la peur d’engagement')]]),
      gap(P.completeText, '___ , ce n’est qu’un cours d’essai gratuit, donc ___ . Et ___ , si ça ne te plaît vraiment pas après trente minutes, on s’en va boire un café !', ['Franchement', 'ça ne t’engage à rien', 'au pire'], { choices: [['Franchement', 'Malheureusement', 'Jamais'], ['ça ne t’engage à rien', 'tu dois payer un an', 'c’est obligatoire'], ['au pire', 'enfin bref', 'par conséquent']] }),
      ord(P.order, 'Si ça ne te plaît pas, on rentre tout de suite !', { tr: 'If you don’t like it, we’ll go straight home!' }),
    ],
    [
      b('Use « Justement… » to turn your friend’s insecurity into proof the activity fits them.', 'Employez « Justement… » pour transformer la crainte de l’ami en avantage.'),
      b('When your friend recalls a bad memory, acknowledge it honestly then show what is different now.', 'S’il évoque un mauvais souvenir, reconnaissez-le puis montrez ce qui change cette fois.'),
      b('Lower the stakes with zero-commitment trials: ça ne t’engage à rien, au pire on rentre.', 'Réduisez le risque perçu : ça ne t’engage à rien, au pire on rentre.'),
    ],
    [['à l’écart', b('left out / on the sidelines', 'isolé du groupe')], ['vider la tête', b('to clear one’s head', 'oublier le stress')], ['ça ne t’engage à rien', b('there’s no commitment', 'aucune obligation de continuer')]],
  ),
  lesson(C, 3, ['handling-pushback-and-closing', 'relances-difficiles-et-conclusion'],
    b('Handling stubborn pushback and closing', 'Gérer les relances et conclure'),
    b('Stay persuasive under repeated pushback without turning aggressive, and lock in an agreement.', 'Rester convaincant face aux hésitations répétées sans forcer, et obtenir un accord.'),
    [b('Avoid aggressive pressure during persistent hesitation', 'Éviter l’insistance agressive face aux doutes'), b('Adapt your pitch mid-call to your friend’s priorities', 'Adapter ses arguments en cours de discussion'), b('Close smoothly with a specific small commitment', 'Conclure par un petit engagement concret')],
    13,
    [
      card(b('Closing without pressure', 'Conclure sans forcer l’ami'), b('When the examiner keeps resisting at minute 8 or 9, stop adding new features and **lower the commitment**: offer **one free trial**, **going together as a pair**, and a clear **next-step confirmation** (« Je réserve mardi ? »).', 'Quand l’examinateur résiste encore vers 8 ou 9 minutes, n’empilez plus de nouveaux arguments : **baissez l’engagement** (séance d’essai gratuite, y aller à deux, action simple pour confirmer).')),
      doc({ look: 'ad', title: b('Section B ad', 'Annonce section B'), text: 'ATELIER CAFÉ-THÉÂTRE & IMPROVISATION\nTous les mardis de 19 h à 20 h 30 — Centre Saint-Laurent\nPremière séance d’essai gratuite (sur inscription)\nParticipation en binôme bienvenue !' }, b('Which detail in this ad makes the best closing offer for a shy friend?', 'Quel détail de l’annonce offre le meilleur argument de conclusion pour un ami timide ?'), [b('free trial session together as a pair', 'la première séance d’essai gratuite en binôme'), b('running every single Tuesday forever', 'le fait que ce soit tous les mardis'), b('the Saint-Laurent building address', 'l’adresse du centre Saint-Laurent'), b('starting promptly at 7:00 p.m.', 'l’horaire précis de 19 h')]),
      trap(b('Persuasive ≠ pushy', 'Persuader n’est pas forcer'), b('Shouting « Arrête tes excuses, tu viens point final ! » damages your interaction grade. Stay warm, give your friend an **easy exit** (**une seule séance gratuite**), and ask **a concrete action question** to close.', 'Dire « Arrête tes excuses, tu viens un point c’est tout ! » fait baisser la note d’interaction. Restez chaleureux, offrez une **porte de sortie facile** (**une seule séance gratuite**) et concluez sur une **action précise**.')),
      dlg(b('Winning over a stubborn friend', 'Convaincre un ami tenace'), undefined, [['Examinatrice (amie)', 'f'], ['Vous', 'm']], [
        [0, 'De l’improvisation ? Jamais de la vie, je déteste parler devant des inconnus !', 'Improv? Never in a million years, I hate speaking in front of strangers!'],
        [1, { options: ['Je comprends, mais justement on s’inscrit en binôme, et au premier atelier tu peux surtout observer ou faire de petits jeux à deux sans monter seul sur scène.', 'Arrête d’être timide, tout le monde doit parler en public !', 'Ok, je comprends, oublions l’atelier alors.'] }],
        [0, 'Oui, mais quand même… si je bloque au bout de cinq minutes, j’aurai l’air bête.', 'Yes, still… if I freeze after five minutes, I’ll look silly.'],
        [1, { options: ['Au pire, tout le monde débute et le groupe est bienveillant : c’est fait pour rire de ses bafouilles. En plus, le premier essai est gratuit, tu ne risques rien !', 'Non, personne ne rit jamais en improvisation.', 'Si tu bloques, tu n’auras qu’à sortir discrètement.'] }],
        [0, 'Bon… pour un seul essai gratuit avec toi, je veux bien y réfléchir.', 'Well… for just one free trial with you, I guess I’ll think about it.'],
        [1, { options: ['Génial ! Je réserve deux places pour mardi prochain et je t’envoie l’adresse ce soir — tu me confirmes demain matin ?', 'Parfait, c’est bon pour toute l’année !', 'D’accord, tu me diras un jour peut-être.'] }],
      ]),
      mc(P.best, ['Super ! Je t’envoie le lien tout de suite : on essaie juste mardi soir pendant une heure, et tu décides ensuite ?', 'Tu dois me dire oui maintenant sinon il n’y aura plus de place !', 'Bon, réfléchis bien pendant deux semaines et rappelle-moi si tu veux.', 'Tant pis, je vois bien que tu n’as pas envie de venir avec moi.'], { fr: 'Votre ami dit « Bon, je vais y réfléchir… » à 9 minutes. Comment conclure efficacement ?' }),
      sort(b('Effective close, pushy or passive?', 'Conclusion efficace, agressive ou passive ?'), [b('smart low-friction close', 'conclusion fluide et concrète'), b('too aggressive / pushy', 'trop agressive'), b('too passive / vague', 'trop passive / floue')], [['Je réserve nos deux places d’essai pour mardi, ça te va ?', 0], ['Tu n’as pas le choix, je t’inscris de force !', 1], ['Bon, fais comme tu veux un de ces jours…', 2], ['On teste une séance et on va boire un verre après, marché conclu ?', 0], ['Arrête de trouver des prétextes et dis oui !', 1], ['D’accord, passe une bonne soirée alors.', 2]]),
      say('Allez, fais-moi confiance pour une seule séance d’essai mardi : si ça ne te plaît pas, je te paie le café après !', 'Come on, trust me for just one trial session Tuesday: if you don’t like it, coffee’s on me afterwards!'),
    ],
    [
      b('Keep Section B friendly and respectful: persuade through value and reassurance, never bullying.', 'Gardez un ton chaleureux : on convainc par l’écoute et l’assurance, jamais en forçant.'),
      b('Offer a low-commitment first step (free trial, one session, pair signup) to break deadlock.', 'Proposez un premier pas sans risque (essai gratuit, une séance, binôme) face au blocage.'),
      b('Always end with a concrete next step (time, place, confirmation) to lock in agreement.', 'Concluez toujours sur une étape précise (jour, lieu, confirmation) pour sceller l’accord.'),
    ],
    [['en binôme', b('as a pair / in twos', 'à deux')], ['bienveillant', b('kind / supportive', 'indulgent et accueillant')], ['marché conclu', b('deal / agreed', 'accord accepté')]],
  ),
];
