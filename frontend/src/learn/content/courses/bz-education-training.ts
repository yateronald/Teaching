import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Teaching a class or leading a professional workshop in French requires crisp instructions, smooth group management and encouraging, specific feedback. Learners freeze when instructions are vague or feedback feels blunt. This B1 course equips teachers, coaches and corporate trainers to structure a session, give timed instructions, facilitate group discussions, use evaluation rubrics and write constructive assessments.',
    'Donner un cours ou animer un atelier professionnel en français exige des consignes limpides, une gestion fluide du groupe et des retours à la fois encourageants et précis. Les apprenants bloquent vite face à des consignes floues ou à une critique sèche. Ce cours de niveau B1 prépare enseignants, tuteurs et formateurs à cadrer une séance, animer les échanges, évaluer et rédiger un bilan constructif.',
  ),
  outcomes: [
    b('State learning objectives and clear, timed workshop instructions', 'Formuler objectifs pédagogiques et consignes minutées'),
    b('Facilitate group discussions and balance speaking time fairly', 'Animer un atelier et répartir équitablement la parole'),
    b('Deliver balanced oral feedback (strengths and growth areas)', 'Donner un retour oral équilibré entre acquis et axes de progrès'),
    b('Read evaluation grids and write constructive trainee feedback', 'Utiliser une grille d’évaluation et rédiger une appréciation constructive'),
  ],
};

const C = 'bz-education-training';
export default [
  lesson(C, 1, ['clear-instructions-and-objectives', 'consignes-et-objectifs'],
    b('Objectives and clear workshop instructions', 'Objectifs et consignes d’atelier'),
    b('Launch activities smoothly with clear groupings, timing and checks.', 'Lancer une activité avec objectifs clairs, binômes, durée et vérification.'),
    [b('State session aims cleanly (à l’issue de cette séance)', 'Formuler les objectifs de séance'), b('Give timed pair/group instructions', 'Donner des consignes minutées en sous-groupes'), b('Check understanding before starting', 'Vérifier la compréhension avant de lancer l’exercice')],
    13,
    [
      card(b('Structuring instructions (les consignes)', 'Donner des consignes efficaces'), b('Follow four steps: 1. **Goal**: *L’objectif est de…* 2. **Grouping**: *Mettez-vous par deux / en petits groupes.* 3. **Time**: *Vous disposez de dix minutes.* 4. **Check**: *Est-ce que la consigne est claire pour tout le monde ?*', 'Suivez quatre étapes : 1. **But** : *L’objectif de cet exercice est de…* 2. **Organisation** : *Mettez-vous par deux / en sous-groupes.* 3. **Durée** : *Vous disposez de dix minutes.* 4. **Vérification** : *Y a-t-il des questions avant de commencer ?*')),
      doc({ look: 'page', title: b('Workshop sheet', 'Fiche animateur — Atelier 45 min'), text: 'ATELIER : Négocier un partenariat\n\n• 0–10 min | Mise en route et rappel des objectifs\n• 10–25 min | Travail en binôme : préparer 3 arguments (fiche page 4)\n• 25–40 min | Mise en commun en grand groupe\n• 40–45 min | Synthèse et tour de table final\n\nMatériel : tableau blanc, chronomètre, fiches distribuées.' }, b('What happens between minutes 25 and 40?', 'Que fait le groupe entre les minutes 25 et 40 ?'), [b('Everyone shares and discusses their pair work together.', 'Toute la classe met en commun le travail des binômes.'), b('Participants read page 4 silently alone.', 'Chaque participant lit la page 4 en silence.'), b('The trainer introduces the workshop aims.', 'Le formateur présente les objectifs de la séance.'), b('The workshop finishes with a final survey.', 'L’atelier se termine par le bilan final.')]),
      hear('Pour cette deuxième activité, mettez-vous par groupes de trois. Vous disposez de douze minutes pour classer les cartes sur votre table. Attention : chaque groupe désigne un rapporteur qui présentera la synthèse ensuite.', b('What role must each group assign?', 'Quel rôle chaque groupe doit-il choisir ?'), [b('A spokesperson to present the summary', 'Un rapporteur pour présenter la synthèse'), b('A timekeeper to watch the clock', 'Un gardien du temps'), b('A writer to copy the textbook', 'Un secrétaire qui recopie le manuel'), b('Nobody, everyone speaks at once', 'Aucun, tout le monde parle ensemble')], { voice: 'f' }),
      pairs(P.match, [['en binôme', b('in pairs', 'par deux')], ['la mise en commun', b('plenary sharing / group debrief', 'partage en grand groupe')], ['vous disposez de…', b('you have … (time)', 'vous avez … devant vous')], ['un rapporteur', b('a group spokesperson', 'personne qui présente le travail du groupe')]]),
      gap(P.complete, 'Mettez-vous par ___ et préparez trois idées ; vous ___ de dix minutes avant la mise en commun.', ['deux', 'disposez']),
      say('L’objectif est de rédiger trois conseils. Mettez-vous en binôme, vous disposez de dix minutes.', 'The goal is to draft three tips. Pair up; you have ten minutes.'),
    ],
    [
      b('Always give goal + grouping + duration + check question.', 'Donnez toujours : objectif + groupe + durée + vérification.'),
      b('En binôme = in pairs; mise en commun = group sharing.', 'En binôme = par deux ; mise en commun = partage collectif.'),
      b('Name a rapporteur before group work starts so sharing flows faster.', 'Désignez un rapporteur avant le travail pour fluidifier la suite.'),
    ],
    [['la consigne', b('the instruction, prompt', 'règle d’un exercice')], ['un binôme', b('a pair of two people', 'groupe de deux')], ['la mise en commun', b('group sharing / debrief', 'partage collectif')]],
  ),
  lesson(C, 2, ['facilitating-discussions-and-feedback', 'animer-et-donner-un-retour'],
    b('Facilitating workshops and giving feedback', 'Animer les échanges et faire un retour'),
    b('Keep discussions inclusive, manage time kindly and deliver balanced feedback.', 'Répartir la parole, gérer le temps et formuler un retour constructif.'),
    [b('Encourage quieter speakers tactfully', 'Donner la parole aux plus discrets avec tact'), b('Manage timing smoothly during debates', 'Gérer les transitions et le temps restant'), b('Frame positive and constructive feedback', 'Associer points forts et pistes d’amélioration')],
    13,
    [
      card(b('Balanced coaching phrases', 'Animer et corriger avec tact'), b('Manage floor: **Merci pour cette remarque ; écoutons maintenant quelqu’un qui n’a pas encore parlé.** Time: **Il nous reste cinq minutes, avançons sur le dernier point.** Feedback: **Ce qui est très réussi, c’est… · Un axe d’amélioration : … · Tu gagnerais à préciser…**', 'Parole : **Merci ; écoutons maintenant un autre avis.** Temps : **Il nous reste cinq minutes.** Retour : **Un vrai point fort : … · Un axe d’amélioration : … · Tu gagnerais à illustrer par un exemple.**')),
      dlg(b('Workshop debrief', 'Débriefing après un jeu de rôle'), undefined, [['Formateur', 'm'], ['Stagiaire (Léa)', 'f']], [
        [0, 'Merci Léa pour cette présentation. Comment t’es-tu sentie pendant l’exercice ?', 'Thanks Léa for that presentation. How did you feel during the exercise?'],
        [1, 'Un peu stressée au début, mais plus à l’aise vers la fin.', 'A bit nervous at first, then more comfortable toward the end.'],
        [0, { options: ['Ça ne s’est pas vu ! Ta structure était très claire. Pour progresser, tu gagnerais juste à ralentir un peu sur les chiffres.', 'Tu as parlé beaucoup trop vite, c’était confus.', 'Tout était parfait, ne change rien du tout.'] }],
        [1, { options: ['D’accord, je note pour le prochain tour, merci pour le conseil !', 'Non, je parle très bien.', 'C’est la faute du chronomètre.'] }],
      ]),
      sort(b('Encouraging facilitation or too blunt?', 'Animation bienveillante ou trop sèche ?'), [b('constructive / inclusive', 'constructif / bienveillant'), b('too blunt / abrupt', 'trop sec / maladroit')], [['Un point fort : ton exemple concret.', 0], ['C’est faux, recommence.', 1], ['Tu gagnerais à préciser ton idée.', 0], ['Tais-toi, on n’a pas le temps.', 1], ['Écoutons aussi l’autre table.', 0]]),
      mc(P.best, ['Merci pour cette piste intéressante. Pour respecter le timing, je propose d’entendre encore un avis puis de synthétiser.', 'Arrêtez de parler, il est trop tard.', 'Vous parlez beaucoup trop longtemps.', 'Changeons vite de sujet, c’est ennuyeux.'], { fr: 'Un participant développe longuement son idée alors qu’il reste trois minutes :' }),
      pairs(P.match, [['un axe d’amélioration', b('an area for improvement', 'point à travailler')], ['un point fort', b('a strength', 'qualité réussie')], ['tu gagnerais à…', b('you would benefit from…', 'il serait utile de…')], ['une piste', b('an idea, lead, avenue', 'idée à explorer')]]),
      say('Ton plan est très clair ; pour la suite, tu gagnerais à donner un exemple concret.', 'Your outline is very clear; going forward, you would benefit from giving a concrete example.'),
    ],
    [
      b('Start with a specific strength before naming one growth point.', 'Commencez par un point fort précis avant l’axe de progrès.'),
      b('Use « tu gagnerais à… » instead of blunt criticism.', 'Préférez « tu gagnerais à… » à une critique négative directe.'),
      b('Protect speaking equity: thank the speaker and invite another voice.', 'Protégez l’équilibre de parole en remerciant avant de passer le relais.'),
    ],
    [['un axe d’amélioration', b('an area to improve', 'compétence à renforcer')], ['synthétiser', b('to summarise, pull together', 'résumer l’essentiel')], ['pertinent', b('relevant, on-point', 'bien adapté au sujet')]],
  ),
  lesson(C, 3, ['assessment-criteria-and-follow-up', 'evaluation-et-suivi'],
    b('Assessment criteria and trainee reports', 'Grilles d’évaluation et bilans écrits'),
    b('Read French competence rubrics and write encouraging end-of-module evaluations.', 'Lire une grille de compétences et rédiger une appréciation encourageante.'),
    [b('Understand French grading tiers (acquis / en cours)', 'Comprendre acquis, en cours d’acquisition, à renforcer'), b('Distinguish factual criteria from personal traits', 'Baser l’évaluation sur des critères observables'), b('Write a balanced assessment note', 'Rédiger un bilan écrit équilibré et motivant')],
    13,
    [
      card(b('Assessment rubrics in French', 'Les grilles d’évaluation'), b('French education & training rubrics commonly use four levels: **Maîtrisé / Acquis** (mastered), **En cours d’acquisition** (developing), **Fragile / À renforcer** (needs work), **Non acquis**. Always comment on **skills observed** (clarté, structure, participation), not personality.', 'Les grilles emploient souvent : **Acquis / Maîtrisé**, **En cours d’acquisition**, **À renforcer**, **Non acquis**. Commentez des **compétences observables** (clarté, méthode, participation), jamais la personnalité.')),
      mc(P.meaning, [b('developing, progressing toward mastery', 'en progrès vers la maîtrise'), b('completely mastered already', 'déjà totalement maîtrisé'), b('failed with zero progress', 'échoué sans progrès'), b('absent from class', 'absent au cours')], { fr: 'Compétence : En cours d’acquisition' }),
      pairs(P.match, [['acquis', b('mastered, achieved', 'compétence maîtrisée')], ['à renforcer', b('needs further practice', 'à consolider')], ['une grille d’évaluation', b('an assessment rubric', 'tableau de critères')], ['une attestation de formation', b('a training certificate', 'document prouvant le suivi')]]),
      gap(P.complete, 'La structure de votre exposé est ___, mais la gestion du temps reste encore à ___.', ['acquise', 'renforcer']),
      write(b('Trainee assessment note', 'Appréciation de fin de module'), b('Write a short written evaluation (50–85 words) for a training participant named Samir: praise his active participation and clear slides, note one area to strengthen (speaking slower during Q&A), and conclude encouragingly.', 'Rédigez une appréciation écrite (50–85 mots) pour un participant nommé Samir : saluez sa participation active et la clarté de ses supports, signalez un axe à renforcer (ralentir le débit lors des questions), et concluez par un encouragement.'), 50, 85, [
        b('Specific strengths mentioned', 'Points forts précis mentionnés'),
        b('One clear, respectful area to strengthen', 'Un axe d’amélioration formulé avec tact'),
        b('Encouraging closing sentence', 'Conclusion motivante'),
      ], 'Samir s’est montré très impliqué tout au long du module, avec une participation pertinente en atelier. La structure de sa présentation finale est acquise et ses diapositives sont particulièrement limpides. La gestion du débit lors des questions reste à renforcer : prendre le temps de respirer avant de répondre mettra encore mieux en valeur ses arguments. Très bon bilan d’ensemble, poursuivez ainsi !'),
      dict('La grille d’évaluation précise les compétences acquises et les points à renforcer.', { voice: 'm' }),
    ],
    [
      b('Acquis = mastered; en cours d’acquisition = developing; à renforcer = needs work.', 'Acquis ; en cours d’acquisition ; à renforcer.'),
      b('Comment on observable skills rather than judging the person.', 'Évaluez des compétences observables, jamais la personne.'),
      b('End written assessments on clear next steps and encouragement.', 'Terminez chaque bilan par un conseil concret et un encouragement.'),
    ],
    [['une grille', b('a rubric, grid', 'tableau de critères')], ['impliqué', b('engaged, committed', 'actif et attentif')], ['limpide', b('crystal clear', 'très clair')]],
  ),
];
