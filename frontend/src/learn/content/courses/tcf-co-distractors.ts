import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'From B1 onward, TCF listening questions rarely fail because of unknown vocabulary alone — they trap candidates who latch onto an isolated keyword. Wrong options echo a word you just heard while flipping the negation, shifting the decision at the last second or masking polite criticism behind friendly words. This course drills every major distractor type so you listen to the whole meaning and beat B1–B2 traps consistently.',
    'À partir du B1, les questions d’écoute du TCF piègent surtout ceux qui s’accrochent à un mot isolé. Les mauvaises options reprennent un terme entendu tout en inversant la négation, en changeant d’avis à la dernière seconde ou en cachant une critique derrière des formules polies. Ce cours entraîne tous les grands distracteurs pour capter le sens global et réussir les questions B1–B2.',
  ),
  outcomes: [
    b('Avoid false keyword echoes and partial negations', 'Déjouer les mots-pièges et négations partielles'),
    b('Catch last-second pivots and self-corrections', 'Repérer les revirements de dernière seconde'),
    b('Decode polite hesitation and masked criticism', 'Décoder l’hésitation polie et la critique implicite'),
    b('Recognise accurate paraphrases on one listening', 'Reconnaître les bonnes reformulations en une écoute'),
  ],
};

const C = 'tcf-co-distractors';
export default [
  lesson(C, 1, ['false-keywords-and-negation', 'mots-pieges-et-negation'],
    b('False keywords and partial negation', 'Mots-pièges et négation partielle'),
    b('Look past repeated words and hear restrictions like ne… que, ne… plus and sans.', 'Dépasser les mots répétés et repérer ne… que, ne… plus et sans.'),
    [b('Resist options that copy a single heard word', 'Résister aux options qui répètent un mot entendu'), b('Distinguish total negation from restriction', 'Distinguer négation totale et restriction'), b('Recognise true paraphrases', 'Reconnaître les vraies reformulations')],
    13,
    [
      trap(b('The keyword-echo trap', 'Le piège du mot-écho'), b('In B1–B2 TCF listening, an option containing the **exact noun or verb** you heard is often a trap. Also watch restrictive forms: **ne… que** (= only), **ne… plus** (= no longer), **à peine** (= barely), **faute de** (= for lack of).', 'En écoute B1–B2 au TCF, l’option qui reprend le **mot exact** entendu est souvent un piège. Surveillez aussi les restrictions : **ne… que** (= seulement), **ne… plus** (= arrêt), **à peine**, **faute de** (= par manque de).')),
      hear('Contrairement à la rumeur, la conférence sur l’énergie solaire n’est pas annulée : faute de salle disponible à l’hôtel de ville, elle aura simplement lieu en ligne jeudi soir.', b('What is happening to the conference?', 'Qu’arrive-t-il à la conférence ?'), [b('it is moving online', 'elle se tiendra en ligne'), b('it is cancelled completely', 'elle est annulée'), b('it will take place at the town hall', 'elle aura lieu à l’hôtel de ville'), b('it is moved to next month', 'elle est reportée au mois prochain')], { voice: 'f', timer: 45 }),
      hear('Ce nouveau logiciel est joli, mais il ne corrige que les fautes simples ; pour la ponctuation, il ne sert pratiquement à rien, et il ne fonctionne plus hors connexion.', b('What does the speaker say about the software?', 'Que dit le locuteur du logiciel ?'), [b('it only fixes basic mistakes and needs internet', 'il ne corrige que les fautes simples et exige internet'), b('it fixes all punctuation offline', 'il corrige toute la ponctuation hors ligne'), b('it no longer works at all', 'il ne fonctionne plus du tout'), b('it is completely useless', 'il est totalement inutile')], { voice: 'm', timer: 45 }),
      sort(b('What kind of restriction?', 'Quel type de restriction ?'), [b('only / limited', 'seulement / limité'), b('no longer / stopped', 'arrêt / fin'), b('lack / absence', 'manque / absence')], [['il ne reste que deux places', 0], ['le service ne fonctionne plus', 1], ['faute de budget', 2], ['à peine dix minutes', 0], ['nous n’acceptons plus les chèques', 1], ['sans aucune aide', 2]]),
      mc(P.meaning, [b('She is very far from satisfied.', 'Elle est très loin d’être satisfaite.'), b('She is slightly tired but happy.', 'Elle est un peu fatiguée mais contente.'), b('She loves the new rule.', 'Elle adore la nouvelle règle.'), b('She cannot decide.', 'Elle n’arrive pas à décider.')], { fr: '« La directrice est loin d’être convaincue par ce résultat. »' }),
      pairs(P.match, [['ne… guère', b('hardly, barely', 'très peu')], ['faute de temps', b('for lack of time', 'par manque de temps')], ['loin de là', b('far from it', 'pas du tout')], ['ne… que', b('only', 'seulement')]]),
    ],
    [
      b('Ignore echo words: check who does what and whether it is negated.', 'Méfiez-vous du mot-écho : vérifiez qui fait quoi et s’il est nié.'),
      b('Ne… que = only; ne… plus = stopped; loin de = not at all.', 'Ne… que = seulement ; ne… plus = arrêt ; loin de = pas du tout.'),
      b('Right answers usually rephrase the meaning in simpler or broader words.', 'La bonne réponse reformule souvent l’idée avec d’autres mots.'),
    ],
    [['faute de', b('for lack of', 'par manque de')], ['hors connexion', b('offline', 'sans internet')], ['à peine', b('barely / hardly', 'tout juste')]],
  ),
  lesson(C, 2, ['last-second-changes', 'revirements-de-derniere-seconde'],
    b('Last-second changes and pivots', 'Revirements de dernière seconde'),
    b('Keep listening until the final word when speakers change their mind mid-sentence.', 'Rester attentif jusqu’au dernier mot quand le locuteur change d’avis.'),
    [b('Spot spoken pivot markers', 'Repérer les marqueurs de changement d’avis'), b('Track the final decision in dialogues', 'Suivre la décision finale d’un dialogue'), b('Avoid locking in the first option heard', 'Ne pas choisir trop tôt la première option')],
    13,
    [
      card(b('Never stop listening early', 'Écoutez jusqu’à la dernière seconde'), b('TCF speakers often propose Plan A, discuss Plan B, and switch at the end with **en fait**, **tout bien réfléchi**, **à vrai dire**, **finalement** or **sauf que**. Wait for the final verb before picking!', 'Au TCF, les locuteurs évoquent un plan A, discutent un plan B, puis basculent à la fin avec **en fait**, **tout bien réfléchi**, **à vrai dire**, **finalement** ou **sauf que**. Attendez la dernière phrase avant de cocher !')),
      hear('On pensait réserver le bistrot du port pour vendredi soir, car tout le monde l’adore. Mais comme il annonce de la pluie et qu’on est vingt, tout bien réfléchi, on commande des plateaux au bureau mardi midi.', b('What do they decide in the end?', 'Que décident-ils finalement ?'), [b('to order food at the office on Tuesday noon', 'commander des plateaux au bureau mardi midi'), b('to book the harbour bistro on Friday', 'réserver le bistrot du port vendredi'), b('to go to the harbour on Tuesday', 'aller au port mardi'), b('to cancel the team lunch', 'annuler le repas d’équipe')], { voice: 'm2', timer: 45 }),
      hear('Attention, voyageurs du train Intercités pour Nantes : le départ initialement prévu voie six à seize heures vingt se fera finalement voie neuf, et non voie six, avec un départ avancé à seize heures dix.', b('Which statement is accurate?', 'Quelle information est exacte ?'), [b('platform 9 at 4:10 p.m.', 'voie 9 à 16 h 10'), b('platform 6 at 4:20 p.m.', 'voie 6 à 16 h 20'), b('platform 9 at 4:20 p.m.', 'voie 9 à 16 h 20'), b('platform 6 at 4:10 p.m.', 'voie 6 à 16 h 10')], { voice: 'f', timer: 45 }),
      gap(P.complete, 'Je voulais partir en train, mais ___ réfléchi, l’horaire du soir est plus pratique ; ___ , je prends le bus de dix-neuf heures.', ['tout bien', 'finalement'], { choices: [['tout bien', 'malgré', 'enfin'], ['finalement', 'avant', 'jamais']] }),
      dlg(b('Confirming the updated plan', 'Confirmer le plan modifié'), undefined, [['Collègue', 'f'], ['Vous', 'm']], [
        [0, 'Pour la présentation client, on avait dit salle B, mais le projecteur est en panne. On bascule en salle D, à 14 h 30 plutôt que 14 h.', 'For the client presentation, we had said room B, but the projector is broken. We’re switching to room D at 2:30 p.m. instead of 2.'],
        [1, { options: ['Bien reçu : je préviens l’équipe qu’on se retrouve en salle D à 14 h 30.', 'Parfait, j’attends devant la salle B à 14 h.', 'D’accord, donc on annule la présentation.'] }],
      ]),
      ord(P.order, 'Tout bien réfléchi, nous partirons demain plutôt que ce soir.', { tr: 'All things considered, we’ll leave tomorrow rather than tonight.' }),
    ],
    [
      b('Listen past Plan A: pivot signals (en fait, tout bien réfléchi, plutôt) reverse earlier details.', 'Dépassez le plan A : en fait, tout bien réfléchi, plutôt annulent ce qui précède.'),
      b('Track both parameters when two details change (e.g. platform AND time).', 'Suivez les deux paramètres quand deux éléments changent (voie ET heure).'),
      b('Look for et non… (« and not… ») as an instant cross-out clue.', 'Repérez et non… pour éliminer aussitôt l’ancienne information.'),
    ],
    [['tout bien réfléchi', b('on second thought / all things considered', 'après réflexion')], ['basculer vers', b('to switch over to', 'changer pour')], ['un plateau-repas', b('a catering tray / meal box', 'repas livré en boîte')]],
  ),
  lesson(C, 3, ['subtle-tone-shifts', 'changements-de-ton'],
    b('Subtle tone shifts and masked criticism', 'Nuances de ton et critique implicite'),
    b('Recognise polite hesitation, qualified agreement and hidden disagreement in B2 speech.', 'Repérer hésitation polie, accord réservé et désaccord masqué à l’oral B2.'),
    [b('Decode polite French hedging formulas', 'Décoder les formules d’atténuation polies'), b('Detect scepticism behind positive openings', 'Repérer le scepticisme derrière un début positif'), b('Distinguish agreement from polite pushback', 'Distinguer accord franc et réserve polie')],
    13,
    [
      card(b('Polite disagreement in French', 'Dire non avec politesse'), b('French speakers rarely say « c’est faux ! » directly. Instead they start positively (**Sur le papier, c’est séduisant… / Je salue l’intention…**) before adding **mais**, **sauf que**, **encore faut-il**, or hedging with **Disons que… / C’est vite dit.**', 'En français, on dit rarement « c’est faux ! » de front. On commence par une formule positive (**Sur le papier, c’est séduisant… / Je salue l’intention…**) avant d’ajouter **mais**, **sauf que**, **encore faut-il**, ou d’atténuer avec **Disons que… / C’est vite dit.**')),
      hear('Sur le papier, ce projet de gratuité des parkings en centre-ville paraît généreux. Sauf qu’en pratique, il risque surtout d’attirer encore plus de voitures et d’asphyxier les rues piétonnes.', b('What is the speaker’s position on free parking?', 'Quelle est la position du locuteur sur les parkings gratuits ?'), [b('critical: it looks good in theory but will worsen traffic', 'critique : séduisant en théorie, mais mauvais pour la circulation'), b('enthusiastic: it will save the city centre', 'enthousiaste : cela va sauver le centre-ville'), b('neutral: he has no opinion', 'neutre : il n’a pas d’avis'), b('supportive if pedestrian streets close', 'favorable si on ferme les rues piétonnes')], { voice: 'm', timer: 50 }),
      hear('— Alors, tu es satisfait de la nouvelle organisation ? — Disons que l’équipe gagne un peu de temps le matin, oui, enfin… quand le logiciel accepte de démarrer sans planter.', b('How does the speaker really feel?', 'Que ressent vraiment le locuteur ?'), [b('frustrated by technical bugs despite small gains', 'agacé par les pannes malgré un petit gain de temps'), b('completely delighted with the new software', 'entièrement ravi du nouveau logiciel'), b('indifferent because he works alone', 'indifférent car il travaille seul'), b('ready to quit immediately', 'prêt à démissionner tout de suite')], { voice: 'm2', timer: 50 }),
      sort(b('What is the speaker’s tone?', 'Quel est le ton du locuteur ?'), [b('genuine agreement', 'accord franc'), b('polite doubt / criticism', 'doute / critique polie'), b('clear refusal', 'refus net')], [['C’est une excellente avancée, sans réserve.', 0], ['C’est vite dit : attendons les chiffres.', 1], ['Il n’en est absolument pas question.', 2], ['Je partage entièrement votre analyse.', 0], ['Sur le principe, oui, mais en pratique…', 1], ['Je m’y oppose fermement.', 2]]),
      mc(P.meaning, [b('That is easy to say, but probably not true.', 'C’est facile à dire, mais peu crédible en réalité.'), b('That was spoken very quickly.', 'Cela a été prononcé très vite.'), b('Everyone agrees immediately.', 'Tout le monde est vite d’accord.'), b('It is a brief summary.', 'C’est un résumé rapide.')], { fr: '« — Grâce à cette réforme, tout ira mieux en un mois. — Oui, enfin… c’est vite dit ! »' }),
      say('Sur le principe, l’idée est intéressante ; cela dit, sa mise en place risque de coûter cher.', 'In principle, the idea is interesting; that said, implementing it risks being expensive.'),
    ],
    [
      b('Positive opening + mais/sauf que usually means the speaker opposes or doubts.', 'Un début positif suivi de mais/sauf que annonce souvent une critique.'),
      b('Listen for disons que, oui enfin, c’est vite dit as signals of hesitation or sarcasm.', 'Repérez disons que, oui enfin, c’est vite dit comme indices de doute.'),
      b('Separate theoretical praise (sur le papier) from practical verdict.', 'Distinguez l’éloge théorique (sur le papier) du jugement pratique.'),
    ],
    [['sur le papier', b('in theory / on paper', 'en théorie')], ['planter', b('to crash (software)', 's’arrêter brutalement (informatique)')], ['asphyxier', b('to choke / congest', 'bloquer complètement')]],
  ),
];
