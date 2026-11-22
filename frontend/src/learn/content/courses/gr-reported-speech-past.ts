import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Il a dit qu’il viendrait le lendemain. Reporting what someone said in the past requires a coordinated shift across tenses, question words, commands, pronouns, and time-and-place markers. Going from B1 into B2, this four-lesson course builds complete mastery of indirect speech—from everyday retelling to crisp journalistic transposition.',
    'Il a dit qu’il viendrait le lendemain. Rapporter des paroles au passé exige une transposition coordonnée des temps, des mots interrogatifs, des ordres, des pronoms et des repères temporels. Du B1 vers le B2, ce cours en quatre leçons construit une maîtrise complète du discours indirect, du récit quotidien jusqu’à la synthèse journalistique.',
  ),
  outcomes: [
    b('Shift tenses accurately after a past reporting verb (présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel)', 'Opérer la concordance des temps au passé (présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel)'),
    b('Report yes/no questions with si, open questions with ce qui / ce que, and commands with de + infinitive', 'Rapporter questions fermées (si), questions ouvertes (ce qui / ce que) et ordres (de + infinitif)'),
    b('Transpose time and place markers (aujourd’hui → ce jour-là, hier → la veille, demain → le lendemain, ici → là-bas)', 'Transposer les repères de temps et de lieu (aujourd’hui → ce jour-là, hier → la veille, demain → le lendemain, ici → là-bas)'),
    b('Transpose multi-line dialogues and press statements naturally at B2 level', 'Transposer un dialogue complet ou un communiqué de presse avec aisance au niveau B2'),
  ],
};

const C = 'gr-reported-speech-past';

const lessons: Lesson[] = [
  lesson(C, 1, ['tense-shifts-statement', 'concordance-temps-affirmations'],
    b('Backshifting tenses after a past reporting verb', 'La concordance des temps après un verbe introducteur au passé'),
    b('When the reporting verb is in the present, tenses stay put; when it is in the past, every tense steps back one notch.', 'Quand le verbe introducteur est au présent, rien ne change ; au passé, chaque temps recule d’un cran.'),
    [
      b('Keep original tenses when the reporting verb is in the present', 'Garder les temps d’origine quand le verbe introducteur est au présent'),
      b('Apply the three core past shifts (présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel)', 'Appliquer les trois bascules clés au passé (présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel)'),
      b('Know which tenses stay unchanged (imparfait, conditionnel, plus-que-parfait)', 'Savoir quels temps restent inchangés (imparfait, conditionnel, plus-que-parfait)'),
    ],
    13,
    [
      card(b('Present reporting = no shift; past reporting = backshift', 'Introducteur au présent = stable ; au passé = recul d’un temps'), b('With **Il dit que…**, keep the speaker’s exact tense. With a past reporting verb (**Il a dit, Elle expliquait, Ils ont annoncé**), shift present → **imparfait**, past (**passé composé**) → **plus-que-parfait**, future → **conditionnel présent**, and **vais + inf.** → **allais + inf.** Already-past/conditional forms stay as they are.\nMain shifts: **présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel présent**.\nUnchanged forms: **imparfait, plus-que-parfait, conditionnel**.', 'Avec **Il dit que…**, gardez le temps exact. Avec un verbe introducteur au passé (**Il a dit, Elle expliquait, Ils ont annoncé**), le présent devient **imparfait**, le **passé composé** devient **plus-que-parfait**, le futur devient **conditionnel présent**, et **vais + inf.** devient **allais + inf.** L’imparfait, le plus-que-parfait et le conditionnel ne bougent pas.\nBascule principale : **présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel présent**.\nTemps stables : **imparfait, plus-que-parfait, conditionnel**.'), {
        table: {
          head: [b('Direct speech', 'Discours direct'), b('Past reported speech (Il a dit que…)', 'Discours indirect passé (Il a dit que…)')],
          rows: [
            ['« Je suis prêt. » (présent)', 'Il a dit qu’il était prêt. (imparfait)'],
            ['« J’ai fini le rapport. » (passé composé)', 'Il a dit qu’il avait fini le rapport. (plus-que-parfait)'],
            ['« Je partirai tôt. » (futur simple)', 'Il a dit qu’il partirait tôt. (conditionnel présent)'],
            ['« Je vais appeler. » (futur proche)', 'Il a dit qu’il allait appeler. (allait + inf.)'],
          ],
        },
        ex: [
          ['Léa dit qu’elle comprend très bien la consigne.', 'Léa says that she understands the instruction very well.'],
          ['Léa a dit qu’elle comprenait très bien la consigne.', 'Léa said that she understood the instruction very well.'],
          ['Le directeur a annoncé que les travaux commenceraient en mai.', 'The director announced that the works would start in May.'],
        ],
      }),
      trap(b('Don’t use futur simple after a past verb!', 'Évitez le futur simple après un verbe au passé !'), b('In reported narration, « Je viendrai » after **Il a promis que…** MUST shift to **conditionnel présent**: *Il a promis qu’il viendrait*. Keeping *viendra* mixes past storytelling with the speaker’s original future! Watch **être/avoir** too: *sera → serait*, *aura → aurait*.\nFuture shifts: **je ferai → il ferait, nous irons → ils iraient, j’aurai fini → il aurait fini**.', 'Dans un récit au passé, « Je viendrai » après **Il a promis que…** passe OBLIGATOIREMENT au **conditionnel présent** : *Il a promis qu’il viendrait*. Garder *viendra* mélangerait deux points de vue temporels ! Attention aux irréguliers : *sera → serait*, *aura → aurait*.\nFutur transposé : **je ferai → il ferait, nous irons → ils iraient, j’aurai fini → il aurait fini**.')),
      mc(P.form, ['avait déjà envoyé', 'a déjà envoyé', 'enverra déjà', 'envoyait déjà'], { fr: 'Direct : « J’ai déjà envoyé le colis. » → Paul a assuré qu’il ___ le colis.', explain: b('Passé composé shifts to plus-que-parfait (avait envoyé).', 'Le passé composé devient plus-que-parfait (avait envoyé).') }),
      hear('Elle m’a expliqué qu’elle changerait de service à la rentrée.', P.meaning, [
        b('She explained to me that she would change departments in September.', 'Elle m’a dit : « Je changerai de service à la rentrée. »'),
        b('She explained that she had already changed departments.', 'Elle m’a dit : « J’ai déjà changé de service. »'),
        b('She is explaining right now why she changed departments.', 'Elle explique en ce moment son changement de service.'),
      ]),
      sort(b('Sort each indirect sentence by the original direct tense.', 'Retrouvez le temps d’origine de chaque phrase rapportée.'), [
        b('Originally présent (now imparfait)', 'À l’origine au présent (imparfait)'),
        b('Originally passé composé (now plus-que-parfait)', 'À l’origine au passé composé (plus-que-parfait)'),
        b('Originally futur (now conditionnel)', 'À l’origine au futur (conditionnel)'),
      ], [
        ['Il a dit qu’il travaillait tard.', 0],
        ['Elle a avoué qu’elle avait oublié.', 1],
        ['Tu as promis que tu aiderais.', 2],
        ['Ils ont affirmé qu’ils étaient d’accord.', 0],
        ['On m’a dit que le train partirait à huit heures.', 2],
        ['Il a expliqué qu’il avait pris le métro.', 1],
      ]),
      gap(P.complete, 'Marc a dit : « Je finis mes études et je chercherai un emploi. » → Marc a dit qu’il ___ (finir) ses études et qu’il ___ (chercher) un emploi.', [['finissait'], ['chercherait']], {
        choices: [
          ['finissait', 'finit', 'avait fini'],
          ['chercherait', 'cherchera', 'avait cherché'],
        ],
      }),
      pairs(P.match, [
        ['« J’attends. » → Il a dit…', b('qu’il attendait', 'qu’il attendait (imparfait)')],
        ['« J’ai attendu. » → Il a dit…', b('qu’il avait attendu', 'qu’il avait attendu (plus-que-parfait)')],
        ['« J’attendrai. » → Il a dit…', b('qu’il attendrait', 'qu’il attendrait (conditionnel présent)')],
        ['« Je vais attendre. » → Il a dit…', b('qu’il allait attendre', 'qu’il allait attendre (futur proche du passé)')],
      ]),
      ord(P.order, 'Elle a affirmé qu’elle n’avait jamais vu ce document.', {
        tr: b('She stated that she had never seen this document.', 'Elle a assuré qu’elle n’avait jamais vu ce document.'),
        extra: ['ait', 'verrait'],
      }),
      dict('Il m’a prévenu qu’il aurait un peu de retard, mais qu’il arriverait avant le dîner.'),
      say('Mon collègue a confirmé qu’il avait envoyé le dossier et qu’il attendait la réponse.', 'My colleague confirmed that he had sent the file and was waiting for the reply.'),
    ],
    [
      b('After a present reporting verb, tenses do not change.', 'Après un verbe introducteur au présent, les temps ne changent pas.'),
      b('After a past reporting verb: présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel.', 'Après un verbe au passé : présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel.'),
      b('Imparfait, plus-que-parfait and conditionnel remain unchanged.', 'L’imparfait, le plus-que-parfait et le conditionnel restent inchangés.'),
    ],
    [
      ['il a dit que', b('he said that', 'il a déclaré que')],
      ['elle a promis que', b('she promised that', 'elle s’est engagée à ce que')],
      ['il allait partir', b('he was going to leave', 'futur proche transposé au passé')],
      ['qu’il avait fini', b('that he had finished', 'plus-que-parfait rapporté')],
    ],
  ),

  lesson(C, 2, ['reported-questions-and-imperatives', 'questions-et-imperatifs-rapportes'],
    b('Reported questions (si, ce que, ce qui) & commands (de + infinitive)', 'Questions (si, ce que, ce qui) et ordres (de + infinitif)'),
    b('Drop est-ce que and verb inversion in indirect questions, and turn imperatives into de + infinitive.', 'Supprimez est-ce que et l’inversion dans les questions indirectes, et transformez l’impératif en de + infinitif.'),
    [
      b('Report yes/no questions with si (and know when s’ elides)', 'Rapporter les questions fermées avec si (et l’élision devant il/ils)'),
      b('Convert qu’est-ce qui → ce qui and qu’est-ce que → ce que', 'Convertir qu’est-ce qui → ce qui et qu’est-ce que → ce que'),
      b('Report affirmative and negative imperatives with de (+ ne pas) + infinitive', 'Rapporter les ordres et conseils avec de (+ ne pas) + infinitif'),
    ],
    13,
    [
      card(b('Turning direct questions into indirect clauses', 'Transformer une question directe en question indirecte'), b('Indirect questions ALWAYS end with a **period** (.), NEVER keep **est-ce que**, and NEVER use **subject–verb inversion**! Use **si** for yes/no questions, **ce qui** for “what” (subject), **ce que / ce qu’** for “what” (object), and keep **où, quand, comment, pourquoi, combien** in normal **sujet + verbe** order.\nQuestion links: **demander si, demander ce qui, demander ce que, demander pourquoi**.\nCommand links: **dire de, demander de, conseiller de ne pas**.', 'Une question indirecte se termine par un **point** (.), supprime TOUJOURS **est-ce que** et supprime l’**inversion sujet-verbe** ! Employez **si** pour oui/non, **ce qui** pour un sujet, **ce que / ce qu’** pour un objet, et gardez **où, quand, comment, pourquoi, combien** avec l’ordre **sujet + verbe**.\nLiens interrogatifs : **demander si, demander ce qui, demander ce que, demander pourquoi**.\nLiens impératifs : **dire de, demander de, conseiller de ne pas**.'), {
        table: {
          head: [b('Direct question / command', 'Forme directe'), b('Connector', 'Outil'), b('Reported (Il m’a demandé / dit…)', 'Forme rapportée')],
          rows: [
            ['« Est-ce que tu viens ? »', 'si (+ normal order)', 'Il m’a demandé si je venais.'],
            ['« Qu’est-ce qui se passe ? »', 'ce qui (subject)', 'Il a demandé ce qui se passait.'],
            ['« Qu’est-ce que tu veux ? »', 'ce que (object)', 'Il m’a demandé ce que je voulais.'],
            ['« Où habitez-vous ? »', 'où (+ sujet + verbe)', 'Il a demandé où nous habitions.'],
            ['« Attendez-moi ! / Ne partez pas ! »', 'de (+ ne pas) + inf.', 'Il nous a dit de l’attendre et de ne pas partir.'],
          ],
        },
        ex: [
          ['La réceptionniste a demandé si nous avions réservé une chambre.', 'The receptionist asked whether we had booked a room.'],
          ['Il voulait savoir ce qui nous avait retenus si longtemps.', 'He wanted to know what had held us up for so long.'],
          ['Le médecin lui a conseillé de se reposer et de ne pas porter de charges.', 'The doctor advised him to rest and not to carry heavy loads.'],
        ],
      }),
      trap(b('Elision trap: s’il / s’ils ONLY, never *s’elle*!', 'Élision : s’il / s’ils seulement, jamais *s’elle* !'), b('Two ultra-common B1 traps:\n1. **Si** elides ONLY before **il** or **ils** (**s’il vient, s’ils partent**) — write **si elle**, **si on**, **si un ami** in full!\n2. Never write *Il a demandé qu’est-ce que…* — always replace **qu’est-ce que** with **ce que** (and **qu’est-ce qui** with **ce qui**).\nRight elision: **s’il pleut, si elle arrive, si on pouvait**.\nRight order: **demander où il va, dire de ne pas crier**.', 'Deux pièges très fréquents :\n1. **Si** s’élide UNIQUEMENT devant **il** ou **ils** (**s’il vient, s’ils partent**) — écrivez **si elle**, **si on**, **si un ami** sans apostrophe !\n2. N’écrivez jamais *Il a demandé qu’est-ce que…* — remplacez **qu’est-ce que** par **ce que** (et **qu’est-ce qui** par **ce qui**).\nÉlision juste : **s’il pleut, si elle arrive, si on pouvait**.\nOrdre juste : **demander où il va, dire de ne pas crier**.')),
      mc(P.form, ['ce que je cherchais', 'qu’est-ce que je cherchais', 'que je cherchais', 'ce qui je cherchais'], { fr: 'Direct : « Qu’est-ce que tu cherches ? » → Le vendeur m’a demandé ___.' }),
      hear('Elle nous a demandé de ne pas faire de bruit et d’éteindre nos téléphones.', P.meaning, [
        b('She asked us not to make noise and to turn off our phones.', 'Elle nous a dit : « Ne faites pas de bruit et éteignez vos téléphones ! »'),
        b('She asked us why our phones made noise.', 'Elle nous a demandé pourquoi nos téléphones sonnaient.'),
        b('She promised not to make noise.', 'Elle a promis de ne pas faire de bruit.'),
      ]),
      sort(b('Which connector introduces the reported clause?', 'Quel outil introduit la phrase rapportée ?'), [
        b('si + sujet + verbe (yes/no)', 'si + sujet + verbe (question fermée)'),
        b('ce qui / ce que (what)', 'ce qui / ce que (qu’est-ce qui / que)'),
        b('de + infinitif (command)', 'de + infinitif (ordre / conseil)'),
      ], [
        ['« Avez-vous fini ? » → demander ___', 0],
        ['« Ne bougez pas ! » → ordonner ___', 2],
        ['« Que faites-vous ? » → demander ___', 1],
        ['« Viendra-t-elle ? » → savoir ___', 0],
        ['« Qu’est-ce qui manque ? » → vérifier ___', 1],
        ['« Sois prudente ! » → conseiller ___', 2],
      ]),
      gap(P.complete, 'Le douanier m’a demandé ___ quelque chose à déclarer, ___ contenait ma valise, et il m’a dit ___ (ouvrir) le grand sac.', [['si j’avais'], ['ce que'], ['d’ouvrir']], {
        choices: [
          ['si j’avais', 'est-ce que j’avais', 'que j’avais'],
          ['ce que', 'qu’est-ce que', 'ce qui'],
          ['d’ouvrir', 'que j’ouvre', 'ouvrir'],
        ],
        explain: b('Yes/no -> si; object what -> ce que (before contenait ma valise, subject is ma valise!); command -> de + infinitive.', 'Oui/non -> si ; objet -> ce que (le sujet de contenait est ma valise) ; ordre -> de + infinitif.'),
      }),
      pairs(P.match, [
        ['« Viens ! »', b('Il m’a dit de venir.', 'Il m’a dit de venir.')],
        ['« Ne crie pas ! »', b('Il m’a dit de ne pas crier.', 'Il m’a dit de ne pas crier.')],
        ['« Qu’est-ce qui brille ? »', b('Il a demandé ce qui brillait.', 'Il a demandé ce qui brillait.')],
        ['« Est-ce qu’elle reste ? »', b('Il a demandé si elle restait.', 'Il a demandé si elle restait.')],
      ]),
      ord(P.order, 'Il m’a demandé ce qui avait provoqué cette panne soudaine.', {
        tr: b('He asked me what had caused this sudden breakdown.', 'Il m’a demandé quelle était la cause de cette panne soudaine.'),
        extra: ['qu’est-ce', 'ce que'],
      }),
      dlg(b('Reporting the inspector’s visit', 'Rapporter la visite de l’inspecteur'), b('Samir explains to Claire what the safety inspector asked.', 'Samir raconte à Claire ce que l’inspecteur de sécurité a demandé.'), [['Claire', 'f'], ['Samir', 'm']], [
        [0, 'Alors, qu’est-ce que l’inspecteur a voulu vérifier ce matin ?', 'So, what did the inspector want to check this morning?'],
        [1, { options: ['Il a d’abord demandé si toutes les sorties restaient libres, puis il nous a dit de déplacer ces cartons.', 'Il a demandé est-ce que les sorties restaient libres, puis il a dit que déplacez ces cartons.', 'Il a demandé s’elles restaient libres !'], explain: b('Use si (not est-ce que, never s’elles) and de + infinitive for the order.', 'Employez si (jamais est-ce que ni s’elles) et de + infinitif pour l’ordre.') }],
        [0, 'D’accord, occupons-nous de ranger le couloir tout de suite.', 'Okay, let’s clear the hallway right away.'],
      ]),
      say('Elle m’a demandé si j’avais besoin d’aide et de ne pas hésiter à l’appeler.', 'She asked me whether I needed help and told me not to hesitate to call her.'),
    ],
    [
      b('Drop est-ce que and verb inversion in indirect questions; end with a period.', 'Supprimez est-ce que et l’inversion dans la question indirecte ; terminez par un point.'),
      b('Use si (yes/no, eliding ONLY to s’il / s’ils), ce qui (subject what) and ce que (object what).', 'Employez si (oui/non, élidé seulement en s’il / s’ils), ce qui (sujet) et ce que (objet).'),
      b('Turn imperatives into dire / demander / conseiller de (+ ne pas) + infinitive.', 'Transformez l’impératif en dire / demander / conseiller de (+ ne pas) + infinitif.'),
    ],
    [
      ['demander si', b('to ask whether / if', 'poser une question fermée')],
      ['ce qui (sujet)', b('what (subject in indirect Q)', 'ce qui est le sujet du verbe')],
      ['ce que (objet)', b('what (object in indirect Q)', 'ce que le verbe prend pour objet')],
      ['dire de ne pas + inf.', b('to tell someone not to do', 'rapporter une défense')],
    ],
  ),

  lesson(C, 3, ['time-place-pronoun-shifts', 'marqueurs-temps-lieu-et-pronoms'],
    b('Time, place & pronoun shifts (hier → la veille, demain → le lendemain)', 'Repères de temps, de lieu et pronoms (hier → la veille, demain → le lendemain)'),
    b('Re-anchor words like aujourd’hui, hier, demain and ici to the moment of the story.', 'Réancrez aujourd’hui, hier, demain et ici au moment passé de l’histoire.'),
    [
      b('Convert present-centered time words (aujourd’hui, hier, demain) into narrative equivalents', 'Convertir les repères du présent (aujourd’hui, hier, demain) en repères du récit'),
      b('Shift place expressions (ici → là-bas) and demonstratives (ce matin → ce matin-là)', 'Transposer les marques de lieu (ici → là-bas) et démonstratifs (ce matin → ce matin-là)'),
      b('Adjust personal pronouns and possessives accurately (mon → son, nous → ils)', 'Ajuster pronoms personnels et possessifs (mon → son, nous → ils)'),
    ],
    13,
    [
      card(b('Why aujourd’hui and demain must change in a past story', 'Pourquoi aujourd’hui et demain changent dans un récit au passé'), b('If someone said « Je pars demain » last Tuesday, calling it *demain* today would mean tomorrow! In past narration, shift time anchors relative to **that day**, and shift **ici** to **là / là-bas**.\nKey day shifts: **aujourd’hui → ce jour-là, hier → la veille, demain → le lendemain**.\nWeek and distance shifts: **la semaine prochaine → la semaine suivante, ici → là-bas, dans deux jours → deux jours plus tard**.', 'Si quelqu’un a dit « Je pars demain » mardi dernier, dire *demain* aujourd’hui désignerait demain ! Dans un récit passé, réancrez le temps par rapport à **ce moment-là**, et remplacez **ici** par **là / là-bas**.\nJours clés : **aujourd’hui → ce jour-là, hier → la veille, demain → le lendemain**.\nSemaines et lieu : **la semaine prochaine → la semaine suivante, ici → là-bas, dans deux jours → deux jours plus tard**.'), {
        table: {
          head: [b('Direct speech (now)', 'Discours direct (ici/maintenant)'), b('Reported in the past (then)', 'Discours indirect passé (alors)')],
          rows: [
            ['aujourd’hui / ce matin', 'ce jour-là / ce matin-là'],
            ['hier / avant-hier', 'la veille / l’avant-veille'],
            ['demain / après-demain', 'le lendemain / le surlendemain'],
            ['maintenant / en ce moment', 'à ce moment-là / alors'],
            ['la semaine prochaine / dernière', 'la semaine suivante / précédente'],
            ['dans trois jours / il y a trois jours', 'trois jours plus tard / trois jours plus tôt'],
            ['ici', 'là / là-bas'],
          ],
        },
        ex: [
          ['« J’ai fini hier. » → Elle a expliqué qu’elle avait fini la veille.', '“I finished yesterday.” → She explained that she had finished the day before.'],
          ['« On se voit ici demain. » → Il a proposé qu’on se voie là-bas le lendemain.', '“We’ll meet here tomorrow.” → He suggested meeting over there the next day.'],
        ],
      }),
      tip(b('Watch possessives and pronouns too!', 'N’oubliez pas pronoms et possessifs !'), b('Besides verbs and dates, **je / tu / nous** and **mon / ton / notre** shift to match who is telling the story. Example: Nadia told Paul: « J’ai oublié mon passeport ici. » → Nadia a dit à Paul qu’**elle** avait oublié **son** passeport **là-bas**.\nPronoun shifts: **je → il / elle, nous → ils / elles, mon → son, notre → leur**.', 'En plus des verbes et des dates, **je / tu / nous** et **mon / ton / notre** s’adaptent au narrateur. Exemple : Nadia a dit à Paul : « J’ai oublié mon passeport ici. » → Nadia a dit à Paul qu’**elle** avait oublié **son** passeport **là-bas**.\nAjustements : **je → il / elle, nous → ils / elles, mon → son, notre → leur**.')),
      mc(P.word, ['le lendemain', 'demain', 'la veille', 'ce jour-là'], { fr: 'Lundi dernier, Thomas a promis : « Je te rendrai ton livre demain. » → Lundi dernier, Thomas a promis qu’il me rendrait mon livre ___.' }),
      mc(P.word, ['la veille', 'hier', 'le lendemain', 'avant-hier'], { fr: 'Direct : « J’ai reçu ta lettre hier. » → Il m’a confirmé qu’il avait reçu ma lettre ___.' }),
      sort(b('Sort by reference direction: earlier, same day, or later.', 'Classez chaque marqueur : avant, le même jour ou après ?'), [
        b('Earlier (la veille, plus tôt…)', 'Antérieur (la veille, plus tôt…)'),
        b('Same moment (ce jour-là, à ce moment-là)', 'Même jour (ce jour-là, à ce moment-là)'),
        b('Later (le lendemain, suivante…)', 'Postérieur (le lendemain, suivante…)'),
      ], [
        ['la veille', 0],
        ['le lendemain', 2],
        ['ce jour-là', 1],
        ['la semaine précédente', 0],
        ['trois jours plus tard', 2],
        ['à ce moment-là', 1],
      ]),
      gap(P.complete, 'La directrice a déclaré : « Aujourd’hui, nous signons l’accord ; hier, tout était bloqué, et la semaine prochaine, nous fêterons le lancement ici. » → Elle a déclaré que ___, ils signaient l’accord, que ___, tout avait été bloqué, et que ___, ils fêteraient le lancement ___.', [['ce jour-là'], ['la veille'], ['la semaine suivante'], ['là-bas']], {
        choices: [
          ['ce jour-là', 'aujourd’hui', 'demain'],
          ['la veille', 'hier', 'le lendemain'],
          ['la semaine suivante', 'la semaine prochaine', 'la semaine précédente'],
          ['là-bas', 'ici', 'maintenant'],
        ],
      }),
      pairs(P.match, [
        ['aujourd’hui', b('ce jour-là', 'ce jour-là')],
        ['hier', b('la veille', 'la veille')],
        ['demain', b('le lendemain', 'le lendemain')],
        ['la semaine prochaine', b('la semaine suivante', 'la semaine suivante')],
        ['il y a deux jours', b('deux jours plus tôt', 'deux jours plus tôt')],
      ]),
      ord(P.order, 'Elle a expliqué qu’elle avait déposé son dossier là-bas la veille.', {
        tr: b('She explained that she had submitted her file over there the day before.', 'Elle a expliqué qu’elle y avait déposé son dossier le jour précédent.'),
        extra: ['ici', 'hier'],
      }),
      dict('Il m’a assuré qu’il avait pris les billets la veille et que nous partirions le lendemain.'),
      say('Mon frère a dit qu’il ne pouvait pas venir ce jour-là, mais qu’il passerait la semaine suivante.', 'My brother said he could not come that day, but that he would drop by the following week.'),
    ],
    [
      b('aujourd’hui → ce jour-là; hier → la veille; demain → le lendemain.', 'aujourd’hui → ce jour-là ; hier → la veille ; demain → le lendemain.'),
      b('la semaine dernière → précédente; la semaine prochaine → suivante; ici → là-bas.', 'la semaine dernière → précédente ; la semaine prochaine → suivante ; ici → là-bas.'),
      b('Always update pronouns and possessives (mon → son, nous → ils/elles) to fit the narrator.', 'Mettez toujours à jour pronoms et possessifs (mon → son, nous → ils/elles).'),
    ],
    [
      ['la veille', b('the day before', 'le jour précédent')],
      ['le lendemain', b('the next day', 'le jour suivant')],
      ['ce jour-là', b('that day', 'le jour en question')],
      ['la semaine suivante', b('the following week', 'la semaine d’après')],
      ['là-bas', b('over there (from ici)', 'à cet endroit-là')],
    ],
  ),

  lesson(C, 4, ['dialogue-and-journalism-transposition', 'transposition-dialogue-presse'],
    b('Full dialogue & journalism transposition (B1 → B2)', 'Transposition complète de dialogues et d’articles (B1 → B2)'),
    b('Synthesize tense, question, command and time shifts while varying reporting verbs like a French journalist.', 'Enchaînez concordance des temps, questions, ordres et marqueurs en variant les verbes introducteurs.'),
    [
      b('Vary reporting verbs accurately (affirmer, préciser, ajouter, reconnaître, prévenir)', 'Varier avec justesse les verbes introducteurs (affirmer, préciser, ajouter, reconnaître, prévenir)'),
      b('Know when a general truth or ongoing fact may stay in the present', 'Savoir quand une vérité générale ou un fait toujours actuel reste au présent'),
      b('Transpose a multi-turn dialogue or press quote into cohesive indirect prose', 'Transposer un dialogue ou un extrait de presse en récit indirect fluide'),
    ],
    13,
    [
      card(b('Going beyond il a dit: B2 reporting verbs', 'Dépasser il a dit : les verbes introducteurs B2'), b('Repeating *il a dit que* in every sentence makes French flat. Journalists and fluent speakers choose verbs that convey **intent** — whether someone clarifies (**préciser**), concedes (**reconnaître**), insists (**assurer, affirmer**), warns (**prévenir**), or adds a point (**ajouter**). Some take **que**, while others take **de + infinitive**.\nStatement verbs (+ que): **affirmer, préciser, assurer, reconnaître, ajouter, rappeler**.\nAction verbs (+ de + inf.): **demander, conseiller, ordonner, promettre, prévenir**.', 'Répéter *il a dit que* à chaque phrase alourdit le texte. La presse et le français soutenu choisissent un verbe qui marque **l’intention** : **préciser, reconnaître, assurer, affirmer, prévenir, ajouter**. Certains introduisent **que + verbe**, d’autres **de + infinitif**.\nVerbes déclaratifs (+ que) : **affirmer, préciser, assurer, reconnaître, ajouter, rappeler**.\nVerbes d’action (+ de + inf.) : **demander, conseiller, ordonner, promettre, prévenir**.'), {
        table: {
          head: [b('Verb', 'Verbe'), b('Nuance', 'Nuance'), b('Structure', 'Structure')],
          rows: [
            ['préciser', b('add an exact detail', 'donner un détail exact'), 'préciser que + ind.'],
            ['reconnaître', b('admit / acknowledge', 'admettre un fait'), 'reconnaître que + ind.'],
            ['assurer / affirmer', b('state firmly', 'déclarer avec fermeté'), 'assurer que + ind.'],
            ['prévenir', b('warn in advance', 'avertir à l’avance'), 'prévenir que + ind. / de + inf.'],
          ],
        },
        ex: [
          ['La ministre a précisé que la mesure entrerait en vigueur le lendemain.', 'The minister specified that the measure would take effect the next day.'],
          ['L’entraîneur a reconnu que son équipe avait manqué de précision.', 'The coach admitted that his team had lacked accuracy.'],
        ],
      }),
      tip(b('When can the present stay in past indirect speech?', 'Quand le présent peut-il rester après un passé ?'), b('For timeless scientific truths or facts still visibly true right now, French allows the present (**Il a rappelé que l’eau bout à cent degrés.**). Yet whenever the fact belongs to a past narrative, exam essays and news articles expect the standard backshift (**imparfait / plus-que-parfait / conditionnel**).\nTimeless truth: **Il a rappelé que la Terre tourne autour du Soleil.**\nEvent report: **Elle a rappelé que le guichet fermait à dix-sept heures.**', 'Pour une vérité scientifique intemporelle ou un fait toujours actuel, le français admet le présent (**Il a rappelé que l’eau bout à cent degrés.**). Mais dans un récit passé ou un résumé de presse, la concordance classique (**imparfait / plus-que-parfait / conditionnel**) reste la règle sûre.\nVérité générale : **Il a rappelé que la Terre tourne autour du Soleil.**\nFait rapporté : **Elle a rappelé que le guichet fermait à dix-sept heures.**')),
      doc({
        look: 'article',
        title: b('Press briefing: Central Station', 'Point presse : Gare Centrale'),
        text: 'Hier matin, la directrice du réseau a reconnu que les retards de la semaine précédente avaient pénalisé les usagers.\nElle a toutefois assuré que deux nouvelles rames circuleraient dès le lendemain, tout en précisant si les travaux nocturnes étaient terminés ou non.\nEnfin, elle a conseillé aux voyageurs de consulter l’application avant leur départ.',
      }, b('Look at the verb forms in this briefing. What did the director originally say?', 'Observez les verbes de ce résumé. Qu’avait dit exactement la directrice hier matin ?'), [
        b('« Les retards de la semaine dernière ont pénalisé… Deux rames circuleront dès demain. Consultez l’application ! »', '« Les retards de la semaine dernière ont pénalisé… Deux rames circuleront dès demain. Consultez l’application ! »'),
        b('« Les retards auront pénalisé… Deux rames circulaient hier. Ne consultez pas l’application ! »', '« Les retards auront pénalisé… Deux rames circulaient hier. Ne consultez pas l’application ! »'),
        b('« Les retards pénaliseront demain… Deux rames ont circulé la veille. »', '« Les retards pénaliseront demain… Deux rames ont circulé la veille. »'),
      ]),
      mc(P.best, [
        'Le témoin a ajouté qu’il n’avait rien entendu ce soir-là.',
        'Le témoin a ajouté qu’il n’a rien entendu ce soir.',
        'Le témoin a ajouté que qu’est-ce qu’il avait entendu.',
      ], { fr: 'Comment rapporter au passé : « D’ailleurs, je n’ai rien entendu ce soir. » ?' }),
      sort(b('Which structure follows each reporting verb here?', 'Quelle structure suit chaque verbe introducteur ?'), [
        b('que + conjugated verb (statement)', 'que + verbe conjugué (constat)'),
        b('de + infinitive (request / advice)', 'de + infinitif (demande / conseil)'),
        b('si / ce que (indirect question)', 'si / ce que (question indirecte)'),
      ], [
        ['Il a reconnu ___ il avait tort.', 0],
        ['Elle nous a conseillé ___ attendre.', 1],
        ['On a demandé ___ le train partait.', 0],
        ['Il a vérifié ___ restait dans la caisse.', 2],
        ['Elle m’a prévenu ___ ne pas signer.', 1],
        ['Il a voulu savoir ___ nous venions.', 2],
      ]),
      gap(P.complete, 'Lors de la réunion d’hier, le responsable a ___ (reconnaître — p. c.) que le budget ___ (être — imp.) serré, mais il a ___ (promettre — p. c.) qu’il ___ (trouver — cond.) une solution ___ (demain -> …).', [['reconnu'], ['était'], ['promis'], ['trouverait'], ['le lendemain']], {
        choices: [
          ['reconnu', 'conseillé', 'demandé'],
          ['était', 'est', 'serait'],
          ['promis', 'ordonné', 'demandé'],
          ['trouverait', 'trouvera', 'avait trouvé'],
          ['le lendemain', 'demain', 'la veille'],
        ],
      }),
      dlg(b('Recounting a meeting to a colleague', 'Raconter une réunion à une collègue'), b('Marc updates Julie on what the client said the day before.', 'Marc résume à Julie ce que la cliente a dit la veille.'), [['Julie', 'f2'], ['Marc', 'm2']], [
        [0, 'Alors, la cliente était satisfaite de la maquette hier ?', 'So, was the client happy with the mockup yesterday?'],
        [1, { options: ['Oui ! Elle a précisé qu’elle aimait beaucoup les couleurs, mais elle nous a demandé de réduire la taille du logo et de lui renvoyer le fichier le lendemain.', 'Oui ! Elle a précisé qu’elle aime les couleurs hier, et elle a demandé que réduisez le logo demain.', 'Oui ! Elle a reconnu si elle aimait les couleurs et de ne pas envoyer demain.'], explain: b('Imparfait (aimait), de + infinitive for requests (de réduire, de renvoyer), and le lendemain for demain.', 'Imparfait (aimait), de + infinitif pour les demandes (de réduire, de renvoyer) et le lendemain pour demain.') }],
        [0, 'Très bien, envoyons-lui la version corrigée dès aujourd’hui !', 'Great, let’s send her the corrected version today!'],
      ]),
      ord(P.order, 'La porte-parole a assuré que les services rouvriraient dès le lendemain.', {
        tr: b('The spokesperson gave assurances that services would reopen as early as the next day.', 'La porte-parole a assuré que les services rouvriraient dès le jour suivant.'),
        extra: ['rouvriront', 'demain'],
      }),
      dict('Le maire a reconnu que les travaux avaient pris du retard, tout en promettant qu’ils s’achèveraient la semaine suivante.'),
      write(
        b('Transpose a short direct message into past indirect speech.', 'Transposez un court message direct au discours indirect passé.'),
        b('Read Paul’s note from yesterday and rewrite it as one cohesive paragraph starting with « Hier, Paul m’a écrit… »: « Salut ! Je suis bloqué à Lyon aujourd’hui parce que j’ai manqué mon train. Est-ce que tu peux prévenir l’équipe ? Ne commencez pas sans moi ! Je prendrai le premier train demain matin. »', 'Lisez le message de Paul d’hier et réécrivez-le en un paragraphe fluide commençant par « Hier, Paul m’a écrit… » : « Salut ! Je suis bloqué à Lyon aujourd’hui parce que j’ai manqué mon train. Est-ce que tu peux prévenir l’équipe ? Ne commencez pas sans moi ! Je prendrai le premier train demain matin. »'),
        35, 72,
        [
          b('Shift all tenses (était, avait manqué, pouvais, prendrait)', 'Transposer tous les temps (était, avait manqué, pouvais, prendrait)'),
          b('Shift question (si), command (de ne pas commencer) and time markers (ce jour-là, le lendemain)', 'Transposer question (si), ordre (de ne pas commencer) et temps (ce jour-là, le lendemain)'),
          b('Vary reporting verbs smoothly', 'Varier les verbes introducteurs avec naturel'),
        ],
        'Hier, Paul m’a écrit qu’il était bloqué à Lyon ce jour-là parce qu’il avait manqué son train. Il m’a demandé si je pouvais prévenir l’équipe et nous a dit de ne pas commencer sans lui. Il a promis qu’il prendrait le premier train le lendemain matin.',
        { phrases: ['Hier, Paul m’a écrit qu’il…', 'ce jour-là', 'Il m’a demandé si…', 'de ne pas commencer', 'le lendemain matin'] },
      ),
    ],
    [
      b('Vary reporting verbs (affirmer, préciser, reconnaître, assurer, prévenir, conseiller) to match speaker intent.', 'Variez les verbes introducteurs (affirmer, préciser, reconnaître, assurer, prévenir, conseiller) selon l’intention.'),
      b('Combine tense backshifts, indirect questions (si / ce que / ce qui), imperatives (de + inf.) and time/place shifts together.', 'Combinez concordance des temps, questions (si / ce que / ce qui), ordres (de + inf.) et repères temporels.'),
      b('Keep present tense only for timeless truths; backshift narrative reports consistently.', 'Ne gardez le présent que pour les vérités générales ; appliquez la concordance dans le récit.'),
    ],
    [
      ['préciser que', b('to clarify / specify that', 'donner une précision')],
      ['reconnaître que', b('to acknowledge / admit that', 'admettre un fait')],
      ['assurer que', b('to assure / state firmly that', 'affirmer avec assurance')],
      ['prévenir de', b('to warn / notify to', 'avertir à l’avance de')],
    ],
  ),
];

export default lessons;
