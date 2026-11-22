import type { CourseAbout } from '../../types';
import { b, card, dict, gap, hear, lesson, mc, P, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In French, pitch contour carries grammar and structure just as much as words do. A rising curve signals a yes/no question or an unfinished list item, a falling curve closes a wh-question or statement, and a low, flat contour marks a parenthetical aside (incise). This B1 course trains you to use and interpret question contours, list rises and parenthetical drops naturally.',
    'En français, la courbe mélodique porte la grammaire autant que les mots. Une montée signale une question fermée ou une énumération inachevée, une chute ferme une question ouverte ou une affirmation, et un palier bas isole une incise. Ce cours B1 vous entraîne à maîtriser et interpréter mélodies des questions, listes et incises avec naturel.',
  ),
  outcomes: [
    b('Separate yes/no rising questions from falling wh-questions', 'Distinguer questions fermées montantes et questions ouvertes descendantes'),
    b('Use A ↗ ou B ↘ contours cleanly in choice questions', 'Maîtriser la courbe A ↗ ou B ↘ dans les questions à choix'),
    b('Keep pitch suspended across multi-clause lists and subordinate openings', 'Maintenir la montée de continuation dans listes et subordonnées'),
    b('Drop pitch and flatten tone for incises, appositions and reporting tags', 'Abaisser le ton pour incises, appositions et paroles rapportées'),
  ],
};

const C = 'p-question-melody';
export default [
  lesson(C, 1, ['yes-no-and-wh-question-contours', 'courbes-des-questions-fermees-et-ouvertes'],
    b('Question contours: yes/no rise vs wh-question fall', 'Courbes des questions : fermée montante, ouverte descendante'),
    b('Contrast rising yes/no questions with falling wh-questions and A/B choices.', 'Opposer questions fermées montantes, questions ouvertes descendantes et choix A/B.'),
    [b('Rise clearly at the end of yes/no questions', 'Monter nettement à la fin d’une question fermée'), b('Start high and fall on standard wh-questions', 'Partir haut et descendre sur une question ouverte'), b('Use rising-then-falling pitch in alternative questions (A ou B ?)', 'Enchaîner montée puis descente dans A ou B ?')],
    13,
    [
      card(b('Three core question melodies', 'Trois courbes de questions essentielles'), b('**Yes/no questions** rise sharply on the final syllable ↗: **Tu pars demain ?** · **Est-ce qu’il vient ?** **Wh-questions** (qui, où, quand, pourquoi, comment) normally peak on the question word and **fall at the end** ↘: **Où est le quai ?** (Only when asking for surprise/repetition does a wh-question rise at the end: **Tu vas OÙ ? ↗**). **Choice questions** rise on A and fall on B: **Café ↗ ou thé ↘ ?**', 'La **question fermée** (oui/non) monte nettement sur la dernière syllabe ↗ : **Tu pars demain ?** · **Est-ce qu’il vient ?** La **question ouverte** (qui, où, quand, pourquoi, comment) attaque haut puis **descend à la fin** ↘ : **Où est le quai ?** (Elle ne remonte qu’en question écho de surprise : **Tu vas OÙ ? ↗**). La **question à choix** monte sur A et descend sur B : **Café ↗ ou thé ↘ ?**'), {
        ex: [['Vous avez votre billet ?', 'yes/no → ends rising ↗'], ['À quelle heure part le train ?', 'wh-question → ends falling ↘'], ['Tu préfères le train ou l’avion ?', 'choice → train ↗, avion ↘']],
      }),
      tip(b('Avoid an English rise on every question', 'Ne montez pas sur toutes les questions'), b('In English, people often raise pitch on *Where are you going?*. In standard French, **Où vas-tu ?** and **Pourquoi tu ris ?** glide **downward** at the end unless you are echoing someone in disbelief.', 'Évitez de monter systématiquement en fin de phrase : en français standard, **Où vas-tu ?** et **Pourquoi tu ris ?** **descendent** à la fin, sauf surprise ou demande de répétition.')),
      hear('Tu préfères le train ou l’avion ?', b('Listen. How does the pitch move across « le train » and « l’avion »?', 'Écoutez. Comment évolue la mélodie sur « le train » et « l’avion » ?'), [b('Rises on « train », falls on « avion »', 'Elle monte sur « train », puis descend sur « avion »'), b('Falls on both options', 'Elle descend sur les deux choix'), b('Rises sharply on « avion » only', 'Elle monte fortement sur « avion » seul'), b('Stays completely flat throughout', 'Elle reste parfaitement plate')], { voice: 'm' }),
      hear('À quelle heure part le dernier train pour Lyon ?', b('Listen. Where does the sentence end in pitch?', 'Écoutez. Comment se termine la mélodie de cette question ?'), [b('Falling at the end (standard wh-question)', 'Descendante à la fin (question ouverte standard)'), b('Rising sharply at the end (yes/no question)', 'Montante à la fin (question fermée)'), b('Flat like a parenthetical aside', 'Plate comme une incise'), b('Rising twice on « dernier » and « Lyon »', 'Montante sur « dernier » et « Lyon »')], { voice: 'f' }),
      sort(b('Rising end ↗ or falling end ↘?', 'Fin montante ↗ ou descendante ↘ ?'), [b('rising end (yes/no)', 'fin montante (fermée)'), b('falling end (wh-question)', 'fin descendante (ouverte)')], [['Vous avez le billet ?', 0], ['Où est le quai ?', 1], ['Tu veux du thé ?', 0], ['Pourquoi tu ris ?', 1], ['Est-ce qu’il vient ?', 0], ['Comment ça va ?', 1]], { listen: true }),
      mc(P.choose, [b('Surprise or asking the speaker to repeat where they are going (echo question)', 'De la surprise ou une demande de répétition (question écho)'), b('A formal polite request at a ticket office', 'Une demande formelle au guichet'), b('An unfinished item in a shopping list', 'Un élément inachevé dans une liste'), b('Indifference or boredom', 'De l’indifférence ou de l’ennui')], { fr: 'Que signifie une forte montée finale sur « Tu vas OÙ ? ↗ » ?' }),
      say('Où vas-tu ce soir ? Tu prends le train ou le bus ? Est-ce que tu as ton billet ?', 'Where are you going tonight? Are you taking the train or the bus? Do you have your ticket?', { tip: b('Fall on soir and bus; rise on train and billet.', 'Descendez sur soir et bus ; montez sur train et billet.') }),
    ],
    [
      b('Yes/no questions rise ↗; standard wh-questions fall ↘.', 'Question fermée ↗ ; question ouverte standard ↘.'),
      b('Echo wh-questions (Tu vas OÙ ? ↗) express surprise or ask to repeat.', 'Question ouverte montante (Tu vas OÙ ? ↗) = surprise ou répétition.'),
      b('Choice questions: rise on A ↗, fall on B ↘.', 'Question alternative : montée sur A ↗, descente sur B ↘.'),
    ],
    [['une question fermée', b('a yes/no question', 'question appelant oui ou non')], ['une question ouverte', b('a wh-question', 'question avec où, quand, pourquoi…')], ['le quai', b('the train platform', 'bord où s’arrête le train')]],
  ),
  lesson(C, 2, ['lists-and-continuation-rises', 'listes-et-montees-de-continuation'],
    b('Lists, clauses and the continuation rise', 'Énumérations, subordonnées et montée de continuation'),
    b('Signal « I’m not done yet » with slight rises on introductory clauses and list items.', 'Signaler « je n’ai pas fini » par une légère montée sur chaque groupe non final.'),
    [b('Use continuation rises on opening clauses (Quand…, Si…)', 'Monter légèrement en fin de proposition initiale (Quand…, Si…)'), b('Keep list items rising until the final falling item', 'Enchaîner les montées d’une liste jusqu’au dernier élément descendant'), b('Tell an unfinished clause from a finished statement by ear', 'Distinguer à l’oreille groupe inachevé et phrase terminée')],
    13,
    [
      card(b('Continuation = slight rise ↗', 'La continuation = légère montée ↗'), b('In a longer French sentence, **every non-final group rises slightly** on its last syllable to tell the listener « keep listening, more is coming »; **only the last group falls** ↘: **S’il fait beau ↗, nous irons au marché ↗, puis nous déjeunerons au parc ↘.** Dropping too early makes your sentence sound finished before the main point arrives!', 'Dans une phrase longue, **chaque groupe non final monte légèrement** sur sa dernière syllabe pour indiquer « ce n’est pas fini » ; **seul le dernier groupe descend** ↘ : **S’il fait beau ↗, nous irons au marché ↗, puis nous déjeunerons au parc ↘.** Descendre trop tôt coupe l’élan avant l’idée principale !'), {
        ex: [['D’abord, on écoute le texte.', '↗ on d’abord, ↘ on texte'], ['Des pommes, des poires, du raisin et des figues.', '↗ on items, ↘ on figues']],
      }),
      hear('S’il fait beau dimanche, nous irons au marché, puis au parc.', b('Listen. Where does the speaker’s voice finally fall?', 'Écoutez. Où la voix descend-elle définitivement pour fermer la phrase ?'), [b('Only on « parc » at the very end', 'Uniquement sur « parc » tout à la fin'), b('On « dimanche » after the first clause', 'Sur « dimanche » après la première proposition'), b('On « marché » before « puis »', 'Sur « marché » avant « puis »'), b('Nowhere, it keeps rising at the end', 'Nulle part, la voix monte à la fin')], { voice: 'f2' }),
      sort(b('Continuation rise ↗ or final closing fall ↘?', 'Montée de continuation ↗ ou chute finale ↘ ?'), [b('continuation ↗ (more coming)', 'continuation ↗ (suite attendue)'), b('closing ↘ (sentence ends)', 'clôture ↘ (fin de phrase)')], [['Quand il arrive ↗', 0], ['il pose son sac ↘', 1], ['D’abord ↗', 0], ['on vérifie le dossier ↘', 1], ['En plus ↗', 0], ['c’est entièrement gratuit ↘', 1]]),
      mc(P.choose, [b('The listener hears « more is coming » and waits for the main verb', 'L’auditeur comprend que la phrase continue et attend la suite'), b('The clause sounds like a completed statement', 'La proposition sonne comme une phrase terminée'), b('It turns the clause into a yes/no question', 'Cela transforme la proposition en question fermée'), b('It expresses sudden anger', 'Cela exprime une colère soudaine')], { fr: 'Quel effet produit la légère montée à la fin de « Avant de partir ↗, … » ?' }),
      gap(P.complete, 'Dans une énumération de trois fruits : « Des fraises ↗, des cerises ↗ et des pêches ___. »', ['↘'], { choices: [['↘', '↗', '—']] }),
      dict('D’abord, on achète du pain, du fromage et des pommes.', { voice: 'm' }),
      say('Quand il arrive au bureau, il pose son sac, allume son ordinateur et lit ses messages.', 'When he arrives at the office, he puts down his bag, turns on his computer and reads his messages.', { tip: b('Rise gently on bureau, sac, ordinateur; fall clearly on messages.', 'Montez doucement sur bureau, sac, ordinateur ; descendez nettement sur messages.') }),
    ],
    [
      b('Non-final clauses and list items take a light continuation rise ↗.', 'Propositions initiales et éléments de liste prennent une montée ↗.'),
      b('Only the final element drops clearly ↘ to close the sentence.', 'Seul le dernier élément descend nettement ↘ pour conclure.'),
      b('Early drops chop a sentence into disconnected fragments.', 'Une chute trop tôt hache la phrase en morceaux.'),
    ],
    [['une énumération', b('a list, enumeration', 'suite d’éléments cités')], ['une subordonnée', b('a subordinate clause', 'proposition liée à une principale')], ['inachevé', b('unfinished', 'pas encore terminé')]],
  ),
  lesson(C, 3, ['parentheses-incises-and-tags', 'incises-appositions-et-n-est-ce-pas'],
    b('Parentheses (incises), tags and reporting clauses', 'Incises, appositions et mots en fin de phrase'),
    b('Drop pitch and flatten intonation on parenthetical asides, appositions and reporting verbs.', 'Baisser la hauteur et aplanir le ton sur les incises, appositions et verbes de parole.'),
    [b('Deliver incises (dit-elle, à vrai dire) on a lower, flatter register', 'Prononcer les incises sur un palier plus bas et plus plat'), b('Resume the main sentence contour right after an apposition', 'Reprendre la courbe principale juste après une apposition'), b('Distinguish tag rises (n’est-ce pas ? ↗) from reporting drops (dit-il ↘)', 'Distinguer la montée d’un mot-balise (d’accord ?) du plat de dit-il')],
    13,
    [
      card(b('Stepping down for incises', 'Le palier bas des incises'), b('An **incise** (reporting tag like **dit-elle**, **répond Marc**, or aside like **à vrai dire**, **franchement**, **un ancien musicien**) steps **down in pitch** and stays **flat and slightly faster**. If it sits **in the middle**, pause briefly, drop for the aside, then jump right back to the main curve: **Ce projet ↗ — à vrai dire — m’inquiète beaucoup ↘.** Tags asking confirmation (**d’accord ?**, **hein ?**, **n’est-ce pas ?**) take a light **rise ↗**.', 'Une **incise** (**dit-elle**, **à vrai dire**, **franchement**, **un ancien musicien**) descend sur un **palier plus bas, plat et un peu plus rapide**. Au milieu d’une phrase, la voix descend pour l’aside puis reprend sa courbe : **Ce projet ↗ — à vrai dire — m’inquiète beaucoup ↘.** À l’inverse, **d’accord ?**, **hein ?**, **n’est-ce pas ?** remontent légèrement ↗.'), {
        ex: [['« C’est prêt », dit-elle.', 'dit-elle: low and flat'], ['Mon voisin, un ancien pianiste, joue le soir.', 'apposition drops in pitch, then main clause falls'], ['On se voit à midi, d’accord ?', 'd’accord ? rises lightly ↗']],
      }),
      tip(b('Keep the aside subordinate by ear', 'Gardez l’incise en arrière-plan'), b('If you stress **dit-elle** or **franchement** at the same pitch as the main clause, listeners lose track of the main point. Lowering the pitch acts like spoken parentheses!', 'Si vous prononcez **dit-elle** ou **franchement** à la même hauteur que le reste, l’auditeur perd le fil. Baisser la voix joue le rôle de parenthèses sonores !')),
      hear('Ce rapport, à vrai dire, arrive beaucoup trop tard.', b('Listen. How should « à vrai dire » be delivered?', 'Écoutez. Comment se prononce « à vrai dire » dans cette phrase ?'), [b('Lower, flatter and slightly faster than the rest of the sentence', 'Plus bas, plus plat et un peu plus rapide que le reste'), b('Louder and much higher than « rapport »', 'Plus fort et beaucoup plus haut que « rapport »'), b('With a sharp yes/no question rise on « dire »', 'Avec une forte montée interrogative sur « dire »'), b('With a long 3-second silence in the middle', 'Avec trois secondes de silence au milieu')], { voice: 'm2' }),
      hear('On se retrouve devant le cinéma à dix-neuf heures, d’accord ?', b('Listen. What happens to the pitch on « d’accord ? »?', 'Écoutez. Que fait la mélodie sur « d’accord ? » ?'), [b('It rises lightly to invite confirmation', 'Elle monte légèrement pour demander l’accord'), b('It drops lower and flatter like « dit-elle »', 'Elle descend platement comme « dit-elle »'), b('It stays unchanged from « heures »', 'Elle reste identique à « heures »'), b('It drops sharply like a strict command', 'Elle chute sèchement comme un ordre')], { voice: 'f' }),
      mc(P.choose, [b('Low and flat, continuing the falling end of « partir » without rising', 'Bas et plat, dans le prolongement bas de « partir », sans remonter'), b('High and sharply rising, like a yes/no question', 'Haut et montant, comme une question fermée'), b('Hammered syllable by syllable with pauses', 'Martelé syllabe par syllabe avec des pauses'), b('Louder than « Il est temps de partir »', 'Plus fort que « Il est temps de partir »')], { fr: 'Dans « Il est temps de partir, murmura-t-elle », comment se dit « murmura-t-elle » ?' }),
      dict('« Ce dossier est complet », répondit-elle avant de partir.', { voice: 'f2' }),
      say('« Ce livre, à vrai dire, est passionnant », dit-il. Tu me le prêtes demain, d’accord ?', '“This book, to tell the truth, is fascinating,” he said. You’ll lend it to me tomorrow, okay?', { tip: b('Lower and flatten à vrai dire and dit-il; lift gently on d’accord ?.', 'Abaissez et aplanissez à vrai dire et dit-il ; montez légèrement sur d’accord ?.') }),
    ],
    [
      b('Incises and appositions (dit-elle, à vrai dire): lower pitch, flatter contour.', 'Incises et appositions (dit-elle, à vrai dire) : ton plus bas et plus plat.'),
      b('Mid-sentence asides step down, then resume the main pitch curve.', 'En milieu de phrase, la voix descend pour l’incise puis reprend la courbe principale.'),
      b('Confirmation tags (d’accord ?, n’est-ce pas ?) rise lightly ↗.', 'Les mots de confirmation (d’accord ?, n’est-ce pas ?) montent légèrement ↗.'),
    ],
    [['une incise', b('a parenthetical or reporting tag', 'groupe inséré dans une phrase')], ['à vrai dire', b('to tell the truth, actually', 'à dire vrai')], ['murmurer', b('to murmur, whisper', 'parler très bas')]],
  ),
];
