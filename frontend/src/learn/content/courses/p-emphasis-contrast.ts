import type { CourseAbout } from '../../types';
import { b, card, dict, gap, hear, lesson, mc, ord, P, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In neutral French, stress always lands gently at the end of a phrase. When speakers debate, contrast two ideas or show strong emotion, they shift an extra punch onto the start of a key word—and drop strategic half-second silences before decisive points. This C1 course trains contrastive stress, rhetorical pauses and balanced three-part rhythm so your arguments sound persuasive and natural.',
    'En français neutre, l’accent tombe toujours en fin de groupe. Quand on débat, oppose deux idées ou exprime une émotion forte, on déplace un appui net sur le début d’un mot clé et l’on ménage des silences stratégiques. Ce cours C1 entraîne l’accent d’insistance, les pauses rhétoriques et le rythme ternaire pour convaincre avec naturel.',
  ),
  outcomes: [
    b('Place affective and contrastive stress on initial consonant onsets', 'Placer l’accent affectif et contrastif sur l’attaque du mot'),
    b('Avoid English word-stress distortion when emphasising French words', 'Éviter de calquer l’accent lexical anglais en insistant'),
    b('Use strategic rhetorical pauses before key claims and pivots', 'Utiliser les pauses rhétoriques avant un pivot ou un mot clé'),
    b('Deliver balanced ternary lists and concessive pairs (certes…, mais…)', 'Maîtriser le rythme ternaire et les oppositions (certes…, mais…)'),
  ],
};

const C = 'p-emphasis-contrast';
export default [
  lesson(C, 1, ['contrastive-and-affective-stress', 'accent-d-insistance-contrastif-et-affectif'],
    b('Contrastive vs affective initial stress', 'L’accent d’insistance : contraste et émotion'),
    b('Hit the first consonant syllable for emotional punch or sharp conceptual contrast.', 'Appuyer sur la première syllabe à consonne pour exprimer l’émotion ou le contraste.'),
    [b('Place affective stress on initial syllables (FOR-midable !)', 'Placer l’accent affectif en début de mot (FOR-midable !)'), b('Place contrastive stress cleanly on opposing prefixes (EX-porter / IM-porter)', 'Marquer l’accent contrastif sur les préfixes opposés'), b('Avoid English middle-syllable emphasis on cognates', 'Éviter l’accent anglais sur les mots transparents')],
    13,
    [
      card(b('Two kinds of French insistence', 'Deux accents d’insistance'), b('Normally French stresses only the **last syllable** of a rhythmic group. To add **emphasis** (**accent d’insistance**), French adds a crisp initial boost on the **first consonant-starting syllable**: **1. Affective stress** (emotion): **C’est FOR-mi-da-ble !**, **C’est in-CROY-a-ble !** **2. Contrastive stress** (opposition): **Je ne parle pas d’EX-por-ter, mais d’IM-por-ter !** · **Pas en a-MONT, en a-VAL !**', 'Normalement, le français accentue la **dernière syllabe** du groupe. Pour **insister**, on ajoute un appui net sur la **première syllabe à consonne** : **1. Accent affectif** : **C’est FOR-mi-da-ble !**, **C’est in-CROY-a-ble !** **2. Accent contrastif** : **Non pas EX-por-ter, mais IM-por-ter !** · **Pas en a-MONT, en a-VAL !**'), {
        ex: [['C’est FORmidable ! C’est INacceptable !', 'affective initial stress'], ['Il faut EXporter, pas IMporter.', 'contrastive prefix stress'], ['Pas CE dossier-là, L’AUTRE !', 'determiner / pronoun contrast']],
      }),
      trap(b('Don’t pull the English stress back in!', 'Ne ramenez pas l’accent lexical anglais !'), b('In English, people emphasise *for-MI-dable* or *im-POR-tant* on the middle syllable. In French, even under heavy emotion, keep vowels even and punch the **initial onset** (**FOR-midable**, **IM-portant**, **in-A-ccep-table**).', 'Évitez l’accent anglais sur la syllabe du milieu (*for-MI-dable*, *im-POR-tant*). En français, l’insistance frappe l’**attaque initiale** (**FOR-midable**, **IM-portant**, **in-A-ccep-table**).')),
      hear('Il ne s’agit pas d’exporter nos matières premières, mais de les transformer sur place.', b('Where should contrastive emphasis land if the speaker opposes « exporter » and « transformer »?', 'Où tombe l’accent contrastif pour opposer « exporter » et « transformer » ?'), [b('On the initial onset of each verb: ex- and trans-', 'Sur l’attaque initiale de chaque verbe : ex- et trans-'), b('On the middle syllable -por- and -for-', 'Sur la syllabe médiane -por- et -for-'), b('Only on the preposition « de »', 'Uniquement sur la préposition « de »'), b('No word should carry emphasis in debate', 'Aucun mot ne doit être mis en relief')], { voice: 'm' }),
      sort(b('Contrastive pair or emotional emphasis?', 'Opposition contrastive ou emphase affective ?'), [b('contrastive pair', 'opposition contrastive'), b('affective emphasis', 'emphase affective')], [['non pas réduire, mais renforcer', 0], ['c’est absolument remarquable !', 1], ['pas mardi, mercredi', 0], ['c’est tout à fait inadmissible !', 1], ['en amont plutôt qu’en aval', 0], ['une réussite formidable !', 1]], { listen: true }),
      mc(P.choose, [b('« C’est in-CROY-a-ble ! » or « C’est IN-croyable ! » (initial / first-consonant punch)', '« C’est in-CROY-a-ble ! » ou « C’est IN-croyable ! » (attaque forte au début)'), b('« C’est incroy-A-ble ! » (stretched final syllable only)', '« C’est incroy-A-ble ! » (étirement uniquement final)'), b('« C’est incroya-BLEUH ! » (extra sound after final l)', '« C’est incroya-BLEUH ! » (voyelle ajoutée après l)'), b('Completely flat monotone without pitch rise', 'Un ton parfaitement plat sans montée')], { fr: 'Où frappe naturellement l’accent affectif sur « incroyable » ?' }),
      dict('Il ne s’agit pas d’exporter le problème, mais de le résoudre ici.', { voice: 'f' }),
      say('Ce n’est pas une erreur mineure : c’est une faute grave, tout à fait inadmissible !', 'This is not a minor error: it is a serious mistake, completely unacceptable!', { tip: b('Contrast mi-neure vs GRAVE, then punch the start of in-AD-mis-si-ble.', 'Opposez mi-neure et GRAVE, puis appuyez le début d’in-AD-mis-sible.') }),
    ],
    [
      b('Accent d’insistance punches the initial consonant onset (FORmidable, EXporter).', 'L’accent d’insistance frappe l’attaque initiale (FORmidable, EXporter).'),
      b('Contrastive stress highlights opposing prefixes or words (en aMONT / en aVAL).', 'L’accent contrastif oppose préfixes ou mots clés (en aMONT / en aVAL).'),
      b('Never borrow English middle-syllable stress on French cognates.', 'Ne calquez jamais l’accent médian anglais sur les mots transparents.'),
    ],
    [['en amont', b('upstream / beforehand', 'avant ou plus haut sur le cours')], ['en aval', b('downstream / afterwards', 'après ou plus bas sur le cours')], ['inadmissible', b('unacceptable', 'qu’on ne peut tolérer')]],
  ),
  lesson(C, 2, ['rhetorical-pauses-and-suspense', 'pauses-rhetoriques-et-suspension'],
    b('Rhetorical pauses, framing and dramatic timing', 'Pauses rhétoriques, cadrage et silence expressif'),
    b('Use crisp half-second silences to spotlight key claims without raising your voice.', 'Utiliser de courts silences pour mettre un mot en relief sans hausser le ton.'),
    [b('Time short framing pauses before key revelations', 'Placer de courtes pauses de cadrage avant le mot décisif'), b('Combine c’est… qui / ce qui… c’est with suspension pitch', 'Associer mise en relief et suspension mélodique'), b('Use pivot pauses after Or, Pourtant, En réalité', 'Marquer la pause après Or, Pourtant, En réalité')],
    13,
    [
      card(b('Silence louder than shouting', 'Le silence porte plus que le volume'), b('Skilled French speakers rarely shout to persuade. Instead, they **raise pitch slightly before a brief silence** (0.4 s) right **before** the decisive point: **Ce qui manque aujourd’hui ↗ … c’est la confiance ↘.** · **Une seule priorité : … la prévention ↘.** · **Or, … les chiffres disent tout autre chose.** The silence forces every listener to lean in.', 'Les bons orateurs crient rarement. Ils **suspendent légèrement la voix avant un bref silence** (0,4 s) juste **avant** le point clé : **Ce qui manque aujourd’hui ↗ … c’est la confiance ↘.** · **Une seule priorité : … la prévention ↘.** · **Or, … les chiffres disent tout autre chose.** Ce silence capte l’attention sans effort.'), {
        ex: [['Ce qui compte avant tout, … c’est la cohérence.', 'suspension rise + micro-pause before c’est'], ['Or, … aucun rapport ne valide cette thèse.', 'pause right after logical pivot Or']],
      }),
      tip(b('Avoid « euh » inside your rhetorical pause', 'Pas de « euh » dans la pause !'), b('A clean **silent** breath pause sounds confident and authoritative; filling the same gap with **euh** breaks the suspense immediately.', 'Un vrai **silence** net donne de l’autorité ; remplir le même espace par **euh** détruit aussitôt l’effet.')),
      hear('Ce qui manque à ce projet, ce n’est pas l’ambition : c’est la méthode.', b('Where is the most effective rhetorical pause in this sentence?', 'Où placer la pause rhétorique la plus efficace dans cette phrase ?'), [b('Right after « ambition » before « c’est la méthode » (plus a tiny pause after « projet »)', 'Juste après « ambition » avant « c’est la méthode » (et brièvement après « projet »)'), b('Between « ce » and « n’est »', 'Entre « ce » et « n’est »'), b('Right before « pas »', 'Juste devant « pas »'), b('Nowhere—deliver the whole sentence on one breath at maximum speed', 'Nulle part : tout dire d’un seul trait à pleine vitesse')], { voice: 'f2' }),
      mc(P.best, [b('« Une question demeure, essentielle : … qui financera la transition ? »', '« Une question demeure, essentielle : … qui financera la transition ? »'), b('« Une question demeure essentielle qui financera la transition… euh… »', '« Une question demeure essentielle qui financera la transition… euh… »'), b('« Qui financera la transition une question demeure essentielle ? »', '« Qui financera la transition une question demeure essentielle ? »'), b('« UNE QUESTION DEMEURE ESSENTIELLE ! »', '« UNE QUESTION DEMEURE ESSENTIELLE ! »')], { fr: 'Quel phrasé met le mieux la question centrale en valeur dans un exposé C1 ?' }),
      gap(P.complete, 'Ce ___ importe vraiment, ___ la cohérence du ___ dans la durée.', ['qui', 'c’est', 'projet'], { choices: [['qui', 'que'], ['c’est', 'il est'], ['projet', 'silence']] }),
      dict('Ce qui compte avant tout, c’est la cohérence de notre démarche.', { voice: 'm2' }),
      say('Ce qui nous divise ici, ce ne sont pas les chiffres : c’est le sens que nous leur donnons.', 'What divides us here is not the figures: it is the meaning we give them.', { tip: b('Slight suspension rise on ici and chiffres, crisp silent pause before c’est le sens.', 'Légère suspension sur ici et chiffres, court silence net avant c’est le sens.') }),
    ],
    [
      b('A clean 0.4 s silence before the key claim creates natural authority.', 'Un silence net de 0,4 s avant l’idée clé crée une autorité naturelle.'),
      b('Combine ce qui… c’est… with a slight rise then brief pause.', 'Alliez ce qui… c’est… à une légère suspension puis une pause.'),
      b('Never fill a rhetorical pause with « euh ».', 'Ne remplissez jamais une pause rhétorique par « euh ».'),
    ],
    [['la cohérence', b('coherence, consistency', 'logique d’ensemble')], ['une démarche', b('an approach, course of action', 'manière de procéder')], ['demeurer', b('to remain (formal)', 'rester')]],
  ),
  lesson(C, 3, ['debating-without-sounding-robotic', 'nuancer-et-convaincre-a-l-oral'],
    b('Three-part rhythms and concessive contours in debate', 'Rythme ternaire et mise en relief dans le débat'),
    b('Shape three-part triads and certes…, mais… concessions with persuasive pitch control.', 'Sculpter le rythme ternaire et les concessions certes…, mais… avec maîtrise.'),
    [b('Deliver French ternary rhythms with rising-rising-falling balance', 'Équilibrer le rythme ternaire (montée, montée, descente)'), b('Shape concessive pivots (certes…, mais…) persuasively', 'Moduler la courbe concessive (certes…, mais…)'), b('Keep delivery lively without hammering every word', 'Rester fluide sans marteler chaque mot')],
    13,
    [
      card(b('Ternary rhythm and concession', 'Rythme ternaire et courbe concessive'), b('French rhetoric loves the **rythme ternaire** (three-part triad)—three balanced phrases where **1 and 2 rise gently ↗** and **3 drops firmly ↘**: **Écouter ↗, comprendre ↗, et décider ↘.** For **concession** (**certes…, mais…** / **il est vrai que…, toutefois…**), hold a lighter, higher tone on the concession, pause briefly, then drop into a firmer, lower voice for your real counter-argument.', 'L’art oratoire français affectionne le **rythme ternaire** : trois segments équilibrés où **1 et 2 montent légèrement ↗** et **3 descend avec fermeté ↘** : **Écouter ↗, comprendre ↗, et décider ↘.** Dans la **concession** (**certes…, mais…**), gardez un ton plus léger sur l’accord partiel, puis ancrez une voix plus grave et ferme sur votre contre-argument.'), {
        ex: [['Observer, analyser, agir.', 'ternary triad: ↗, ↗, ↘'], ['Certes le coût est réel, mais l’inaction coûterait davantage.', 'higher concession → firm counter-claim']],
      }),
      hear('Certes le coût initial est élevé, mais le coût de l’inaction serait bien plus lourd.', b('Listen. How should the voice distinguish the two halves?', 'Écoutez. Comment la voix distingue-t-elle les deux moitiés ?'), [b('Lighter suspended pitch on « Certes… élevé », firmer falling pitch on « mais… lourd »', 'Ton suspendu plus léger sur « Certes… élevé », chute ferme sur « mais… lourd »'), b('Both halves shouted at identical flat volume', 'Les deux moitiés criées sur un même ton plat'), b('Rising steeply on « lourd » like a yes/no question', 'Forte montée finale sur « lourd » comme une question'), b('Whispering « mais… » and shouting « élevé »', 'Chuchotement sur « mais… » et cri sur « élevé »')], { voice: 'm2' }),
      hear('Face à cette crise, il faut écouter, décider et agir sans délai.', b('Listen. What rhythmic pattern structures the end of the sentence?', 'Écoutez. Quelle structure rythmique porte la fin de la phrase ?'), [b('A ternary triad: écouter ↗, décider ↗, agir sans délai ↘', 'Un rythme ternaire : écouter ↗, décider ↗, agir sans délai ↘'), b('A parenthetical aside whispered quickly', 'Une incise chuchotée rapidement'), b('A binary yes/no alternative question', 'Une question alternative fermée'), b('A flat bureaucratic disclaimer', 'Une mention légale monocorde')], { voice: 'f' }),
      mc(P.choose, [b('Stressing ONLY 1–2 key pivots per sentence while keeping surrounding words smooth', 'Mettre en relief 1 ou 2 pivots clés par phrase tout en gardant le reste fluide'), b('Hammering every single syllable equally like a metronome', 'Marteler chaque syllabe à force égale comme un métronome'), b('Speaking continuously without any commas or pauses', 'Parler en continu sans virgules ni pauses'), b('Dropping the voice below audibility on verbs', 'Rendre les verbes inaudibles')], { fr: 'Comment éviter de paraître robotique quand on défend une thèse à l’oral ?' }),
      ord(P.order, 'Certes le délai est court, mais l’objectif reste réalisable.', { extra: ['jamais', 'pourquoi'], tr: 'Granted the deadline is short, yet the goal remains achievable.' }),
      dict('Nous devons écouter les citoyens, clarifier les priorités et agir vite.', { voice: 'f2' }),
      say('Certes le chemin est exigeant, mais nous pouvons observer, comprendre et réussir ensemble.', 'Granted the path is demanding, yet we can observe, understand and succeed together.', { tip: b('Suspend lightly on exigeant, pause, then shape the triad observer ↗, comprendre ↗, réussir ensemble ↘.', 'Suspendez sur exigeant, faites une micro-pause, puis modulez observer ↗, comprendre ↗, réussir ensemble ↘.') }),
    ],
    [
      b('Ternary triad (A ↗, B ↗, C ↘) gives classic French rhetorical poise.', 'Le rythme ternaire (A ↗, B ↗, C ↘) donne de l’équilibre au propos.'),
      b('Concession (certes…, mais…): lighter suspended setup, firmer lower reply.', 'Concession (certes…, mais…) : amorce suspendue, réplique plus grave et ferme.'),
      b('Select 1–2 focal pivots per sentence rather than over-stressing every word.', 'Choisissez 1 à 2 appuis par phrase plutôt que de tout marteler.'),
    ],
    [['le rythme ternaire', b('three-part rhetorical rhythm', 'suite rythmée en trois temps')], ['certes', b('admittedly, granted', 'il est vrai que')], ['l’inaction', b('inaction', 'fait de ne rien faire')]],
  ),
];
