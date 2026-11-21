import type { CourseAbout } from '../../types';
import { b, card, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In the TCF listening test, each document is played only once, and questions get harder from A1 to C2. This course trains the strategies that make the difference: reading the question and options before the recording, recognising the type of document in the first seconds, listening for the target information, handling distractors (options that repeat words you hear) and keeping your concentration over 39 questions.',
    'À l’épreuve de compréhension orale du TCF, chaque document est diffusé une seule fois, et les questions deviennent plus difficiles de A1 à C2. Ce cours entraîne les stratégies qui font la différence : lire la question et les options avant l’enregistrement, reconnaître le type de document dès les premières secondes, écouter l’information ciblée, déjouer les distracteurs (options qui reprennent des mots entendus) et garder sa concentration sur 39 questions.',
  ),
  outcomes: [
    b('Read questions before listening', 'Lire les questions avant d’écouter'),
    b('Identify the document type quickly', 'Identifier rapidement le type de document'),
    b('Avoid distractors', 'Déjouer les distracteurs'),
    b('Handle B2–C1 documents heard once', 'Gérer les documents B2–C1 entendus une fois'),
  ],
};

const C = 'tcf-co-strategies';
export default [
  lesson(C, 1, ['before-the-recording', 'avant-l-enregistrement'],
    b('Before the recording', 'Avant l’enregistrement'),
    b('Use the seconds before each recording to predict and target.', 'Utiliser les secondes avant chaque enregistrement pour prévoir et cibler.'),
    [b('Read question and options', 'Lire question et options'), b('Predict the situation', 'Prévoir la situation'), b('Decide what to listen for', 'Décider quoi écouter')],
    13,
    [
      card(b('The 10-second routine', 'La routine des 10 secondes'), b('1. Read the **question**: who? what? why? 2. Read the **four options** quickly: what differs between them (a time? a place? an opinion?). 3. **Predict** the situation (an announcement, a phone message, an interview). 4. Listen **only** for what distinguishes the options.', '1. Lisez la **question** : qui ? quoi ? pourquoi ? 2. Lisez rapidement les **quatre options** : qu’est-ce qui les distingue (une heure ? un lieu ? une opinion ?). 3. **Prévoyez** la situation (une annonce, un message, une interview). 4. Écoutez **uniquement** ce qui distingue les options.')),
      hear('Bonjour, c’est Julie du cabinet du docteur Martin. Votre rendez-vous de jeudi est déplacé à vendredi, même heure. Rappelez-nous si cela ne vous convient pas.', b('What changes?', 'Qu’est-ce qui change ?'), [b('the day: Thursday → Friday', 'le jour : jeudi → vendredi'), b('the time', 'l’heure'), b('the doctor', 'le médecin'), b('the address', 'l’adresse')], { voice: 'f' }),
      sort(b('What do the options differ on?', 'Sur quoi les options diffèrent-elles ?'), [b('time', 'heure'), b('place', 'lieu'), b('reason', 'raison')], [['À 9 h / À 10 h / À 11 h / À midi', 0], ['À la gare / Au musée / À l’école / Au parc', 1], ['Parce qu’il pleut / Parce qu’il est malade / …', 2], ['Le matin / Le soir / À minuit / À l’aube', 0], ['Chez elle / Au bureau / En ville / À l’hôpital', 1], ['Pour économiser / Pour gagner du temps / …', 2]]),
      hear('Mesdames et messieurs, en raison d’un incident technique, le vol 342 à destination de Montréal partira de la porte 18 au lieu de la porte 12. L’embarquement commencera à quatorze heures trente.', b('What has changed for the flight?', 'Qu’est-ce qui a changé pour le vol ?'), [b('the gate', 'la porte'), b('the destination', 'la destination'), b('the boarding time', 'l’heure d’embarquement'), b('the airline', 'la compagnie')], { voice: 'm' }),
      tip(b('Don’t write during short documents', 'N’écrivez pas pendant les documents courts'), b('For short documents, **listen and answer immediately**; taking notes makes you miss the key word. Keep note-taking for longer B2–C1 documents.', 'Pour les documents courts, **écoutez et répondez immédiatement** ; prendre des notes fait manquer le mot clé. Gardez la prise de notes pour les documents plus longs de niveau B2–C1.')),
    ],
    [
      b('Read question + options before the recording.', 'Lisez question + options avant l’enregistrement.'),
      b('Find what distinguishes the options.', 'Trouvez ce qui distingue les options.'),
      b('Short documents: listen and answer, no notes.', 'Documents courts : écoutez et répondez, sans notes.'),
    ],
    [['déplacer', b('to move, reschedule', 'changer la date')], ['l’embarquement', b('boarding', 'montée dans l’avion')], ['un cabinet', b('a practice (medical)', 'bureau du médecin')]],
  ),
  lesson(C, 2, ['distractors', 'les-distracteurs'],
    b('Avoiding distractors', 'Déjouer les distracteurs'),
    b('Recognise options that repeat words you hear but change the meaning.', 'Reconnaître les options qui reprennent des mots entendus mais changent le sens.'),
    [b('Spot word repetition traps', 'Repérer les pièges de répétition'), b('Listen for negation and time', 'Écouter la négation et le temps'), b('Prefer paraphrases', 'Préférer les reformulations')],
    13,
    [
      card(b('Classic distractors', 'Les distracteurs classiques'), b('1. **Same words, different meaning**: you hear « annulé », the wrong option says « annulé » about something else. 2. **Negation**: « ce n’est **pas** le train de 8 h qui est en retard ». 3. **Time shift**: « **avant**, je travaillais à Paris ; **maintenant**, à Lyon ». 4. **Correction**: « le rendez-vous est mardi… **non, pardon**, mercredi ». The right answer is often a **paraphrase**.', '1. **Mêmes mots, autre sens** : vous entendez « annulé », la mauvaise option dit « annulé » à propos d’autre chose. 2. **Négation** : « ce n’est **pas** le train de 8 h qui est en retard ». 3. **Décalage temporel** : « **avant**, je travaillais à Paris ; **maintenant**, à Lyon ». 4. **Correction** : « le rendez-vous est mardi… **non, pardon**, mercredi ». La bonne réponse est souvent une **reformulation**.')),
      hear('Avant, je prenais ma voiture tous les jours. Mais depuis que j’ai déménagé près du métro, je ne l’utilise plus que le week-end, pour aller voir mes parents.', b('How does he get to work now?', 'Comment va-t-il au travail maintenant ?'), [b('by metro', 'en métro'), b('by car every day', 'en voiture tous les jours'), b('by car at the weekend', 'en voiture le week-end'), b('his parents drive him', 'ses parents l’emmènent')], { voice: 'm' }),
      hear('La réunion aura lieu mardi à dix heures… non, pardon, je me trompe : mercredi, à dix heures, dans la salle B.', b('When is the meeting?', 'Quand a lieu la réunion ?'), [b('Wednesday at 10', 'mercredi à 10 h'), b('Tuesday at 10', 'mardi à 10 h'), b('Wednesday in room A', 'mercredi en salle A'), b('Tuesday in room B', 'mardi en salle B')], { voice: 'f' }),
      hear('Ce n’est pas le prix qui m’a convaincue, il était plutôt élevé. Ce qui m’a décidée, c’est le service après-vente, vraiment excellent.', b('What convinced her?', 'Qu’est-ce qui l’a convaincue ?'), [b('the after-sales service', 'le service après-vente'), b('the low price', 'le prix bas'), b('the design', 'le design'), b('a friend’s advice', 'le conseil d’une amie')], { voice: 'f' }),
      sort(b('Trap signal', 'Signal de piège'), [b('negation', 'négation'), b('time shift', 'décalage temporel'), b('correction', 'correction')], [['ce n’est pas…', 0], ['avant… maintenant…', 1], ['non, pardon…', 2], ['je n’ai jamais…', 0], ['autrefois… aujourd’hui…', 1], ['je veux dire…', 2]]),
    ],
    [
      b('Beware: same words, negation, time shifts, self-corrections.', 'Attention : mêmes mots, négation, décalages temporels, corrections.'),
      b('The right answer is often a paraphrase.', 'La bonne réponse est souvent une reformulation.'),
      b('Listen to the end of the sentence.', 'Écoutez jusqu’à la fin de la phrase.'),
    ],
    [['un distracteur', b('a distractor', 'option piège')], ['élevé', b('high', 'haut')], ['décider', b('to convince, make decide', 'faire choisir')]],
  ),
  lesson(C, 3, ['long-documents-b2-c1', 'documents-longs-b2-c1'],
    b('Long B2–C1 documents', 'Les documents longs B2–C1'),
    b('Follow interviews and reports heard once, and identify opinions and implicit meaning.', 'Suivre interviews et reportages entendus une fois, et repérer opinions et implicite.'),
    [b('Follow the structure of a report', 'Suivre la structure d’un reportage'), b('Identify the speaker’s attitude', 'Identifier l’attitude du locuteur'), b('Infer implicit meaning', 'Inférer l’implicite')],
    13,
    [
      card(b('B2–C1 listening', 'Écoute B2–C1'), b('Higher-level questions ask about **the speaker’s attitude** (sceptique, enthousiaste, ironique), **the main idea**, **implicit meaning** (what is suggested, not said) or **the function** of a sentence (concéder, illustrer, contester). Listen for **attitude markers**: « je reste sceptique », « on peut s’en réjouir », « encore faudrait-il… ».', 'Les questions de niveau supérieur portent sur **l’attitude du locuteur** (sceptique, enthousiaste, ironique), **l’idée principale**, **l’implicite** (ce qui est suggéré, non dit) ou **la fonction** d’une phrase (concéder, illustrer, contester). Écoutez les **marques d’attitude** : « je reste sceptique », « on peut s’en réjouir », « encore faudrait-il… ».')),
      hear('Certes, la ville a planté dix mille arbres cette année, et on ne peut que s’en réjouir. Encore faudrait-il qu’ils soient arrosés : l’été dernier, une bonne partie des jeunes plants n’a pas survécu à la sécheresse.', b('What is the speaker’s attitude?', 'Quelle est l’attitude du locuteur ?'), [b('positive but sceptical about the follow-up', 'positive mais sceptique sur le suivi'), b('totally enthusiastic', 'totalement enthousiaste'), b('indifferent', 'indifférente'), b('completely hostile to the project', 'complètement hostile au projet')], { voice: 'm' }),
      hear('On nous annonce une révolution de l’apprentissage grâce à l’intelligence artificielle. Je me souviens qu’on disait exactement la même chose de la télévision scolaire dans les années soixante-dix.', b('What does the speaker imply?', 'Que sous-entend la personne ?'), [b('Such promises have been made before and were exaggerated.', 'Ces promesses ont déjà été faites et étaient exagérées.'), b('AI will certainly revolutionise learning.', 'L’IA va certainement révolutionner l’apprentissage.'), b('Television was a great success at school.', 'La télévision scolaire a été un grand succès.'), b('She works in television.', 'Elle travaille à la télévision.')], { voice: 'f' }),
      sort(b('Which attitude?', 'Quelle attitude ?'), [b('enthusiastic', 'enthousiaste'), b('sceptical', 'sceptique'), b('critical / ironic', 'critique / ironique')], [['On ne peut que s’en réjouir.', 0], ['Je reste prudent.', 1], ['Belle réussite, vraiment…', 2], ['C’est une excellente nouvelle.', 0], ['Encore faudrait-il que…', 1], ['On croit rêver.', 2]]),
      pairs(P.match, [['encore faudrait-il', b('it would still be necessary', 'condition non remplie')], ['sous-entendre', b('to imply', 'dire sans dire')], ['s’en réjouir', b('to be pleased about it', 'en être content')], ['sceptique', b('sceptical', 'qui doute')]]),
    ],
    [
      b('High-level questions: attitude, main idea, implicit, function.', 'Questions de haut niveau : attitude, idée principale, implicite, fonction.'),
      b('Attitude markers: on peut s’en réjouir, je reste sceptique, encore faudrait-il.', 'Marques d’attitude : on peut s’en réjouir, je reste sceptique, encore faudrait-il.'),
      b('Infer from comparisons and irony.', 'Inférez à partir des comparaisons et de l’ironie.'),
    ],
    [['un plant', b('a seedling', 'jeune plante')], ['survivre', b('to survive', 'rester en vie')], ['la sécheresse', b('drought', 'manque de pluie')]],
  ),
];
