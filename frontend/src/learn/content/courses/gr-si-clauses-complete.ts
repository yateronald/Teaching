import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'S’il pleut, si j’avais le temps, si j’avais su. French hypotheses with si follow three crystal-clear tense patterns—plus a mixed pattern when a past decision changes today. This B1 course guides you through Type 1 (real/likely), Type 2 (imaginary present), Type 3 (past regrets), mixed hypotheses, même si and si jamais, while eliminating the classic "si j’aurais" mistake for good.',
    'S’il pleut, si j’avais le temps, si j’avais su. Les hypothèses avec si suivent trois schémas temporels rigoureux — plus un cas mixte quand un choix passé change le présent. Ce cours de niveau B1 maîtrise les trois types, les hypothèses mixtes, même si et si jamais, tout en éliminant définitivement l’erreur « si j’aurais ».',
  ),
  outcomes: [
    b('Build Type 1 real conditions with si + présent → présent, futur or impératif', 'Construire les hypothèses réelles : si + présent → présent, futur ou impératif'),
    b('Express imaginary present scenarios with si + imparfait → conditionnel présent', 'Exprimer l’irréel du présent avec si + imparfait → conditionnel présent'),
    b('Express past regrets with si + plus-que-parfait → conditionnel passé', 'Exprimer le regret passé avec si + plus-que-parfait → conditionnel passé'),
    b('Combine mixed hypotheses, même si and si jamais across everyday contexts', 'Employer les hypothèses mixtes, même si et si jamais avec justesse'),
  ],
};

const C = 'gr-si-clauses-complete';

const lessons: Lesson[] = [
  lesson(C, 1, ['si-type-1-real-likely', 'si-type-1-reel'],
    b('Type 1: real & likely conditions (si + présent)', 'Type 1 : condition réelle ou probable (si + présent)'),
    b('Pair si + présent with the present, the future or the imperative—and remember s’il vs si elle.', 'Associer si + présent au présent, au futur ou à l’impératif — et maîtriser s’il contre si elle.'),
    [
      b('Choose present, future or imperative in the result clause after si + présent', 'Choisir entre présent, futur et impératif après si + présent'),
      b('Never place futur or conditionnel directly after si', 'Ne jamais mettre le futur ni le conditionnel juste après si'),
      b('Elide si only before il and ils (s’il / s’ils), never before elle or on', 'Élider si uniquement devant il et ils (s’il / s’ils), jamais devant elle ou on'),
    ],
    13,
    [
      card(
        b('Type 1: si + présent → présent / futur / impératif', 'Type 1 : si + présent → présent / futur / impératif'),
        b(
          'Use **Type 1** for habits, general facts, or likely future plans. The **si** clause stays in the **présent**; the result clause takes the **présent** (for a regular habit), the **futur simple / futur proche** (for a likely future outcome), or the **impératif** (for advice or instructions).\n\nPresent result (habit): **Si il pleut → S’il pleut, je prends le bus**.\nFuture result (likely plan): **Si tu pars tôt, tu auras le train**.\nImperative result (advice): **Si tu as faim, prends une pomme !**.',
          'On utilise le **type 1** pour les habitudes, les vérités générales ou les projets probables. La proposition avec **si** reste au **présent**, tandis que la proposition principale se met au **présent** (habitude), au **futur** (conséquence probable) ou à l’**impératif** (conseil ou consigne).\n\nConséquence au présent : **S’il pleut, je prends le bus**.\nConséquence au futur : **Si tu pars tôt, tu auras le train**.\nConséquence à l’impératif : **Si tu as faim, prends une pomme !**.',
        ),
        {
          table: {
            head: [b('Condition (si clause)', 'Condition (avec si)'), b('Result clause', 'Principale'), b('Meaning', 'Valeur')],
            rows: [
              ['si + présent', 'présent', b('general truth / routine', 'habitude / règle générale')],
              ['si + présent', 'futur simple / futur proche', b('likely future consequence', 'projet probable dans l’avenir')],
              ['si + présent', 'impératif', b('advice / instruction if true', 'conseil / consigne')],
            ],
          },
          ex: [
            ['S’il fait beau demain matin, nous irons marcher au bord du lac.', 'If the weather is nice tomorrow morning, we’ll go for a walk by the lake.'],
            ['Si vous avez une question, n’hésitez pas à lever la main !', 'If you have a question, don’t hesitate to raise your hand!'],
          ],
        },
      ),
      trap(
        b('Never futur after si — and elide ONLY with il / ils!', 'Jamais de futur après si — et élision seulement devant il / ils !'),
        b(
          'French obeys a strict rule: **si** rejects `-r-` endings (`futur` and `conditionnel`). Say **Si tu viens demain, nous dînerons ensemble**, NEVER « Si tu viendras ». Also watch apostrophes: **si** becomes **s’** ONLY before **il** (`s’il`) and **ils** (`s’ils`), NEVER before `elle`, `on`, `un` or a vowel name (`si elle`, `si on`, `si Anne`).\n\nAllowed elision: **s’il pleut, s’ils arrivent, s’il fait froid**.\nNo elision: **si elle vient, si on sort, si Anne appelle**.',
          'En français, **si** n’est JAMAIS suivi directement du futur ni du conditionnel : dites **Si tu viens demain, nous dînerons ensemble** (jamais « Si tu viendras »). Attention aussi à l’élision : **si** devient **s’** UNIQUEMENT devant **il** (`s’il`) et **ils** (`s’ils`), jamais devant `elle`, `on` ou un prénom (`si elle`, `si on`, `si Anne`).\n\nÉlision obligatoire : **s’il pleut, s’ils arrivent, s’il fait froid**.\nPas d’élision : **si elle vient, si on sort, si Anne appelle**.',
        ),
      ),
      mc(P.form, ['fini', 'finirai', 'finissais', 'finirais'], {
        fr: 'Si j’ai ___ ce dossier avant midi, nous irons déjeuner au parc.',
        explain: b('After si, use present (or passé composé for completed condition before future), never future.', 'Après si, on n’emploie pas le futur ; ici si + passé composé ou présent convient.'),
      }),
      mc(P.spelling, ['si elle', 's’elle', 'si l’', 's’elle-même'], {
        fr: 'Préviens-moi tout de suite ___ décide de rester à Lyon.',
      }),
      gap(P.complete, 'S’il ___ (pleuvoir) demain, nous ___ (prendre, futur) le métro ; mais s’il ___ (faire) beau, ___ (venir, impératif tu) avec ton vélo !', [['pleut'], ['prendrons'], ['fait'], ['viens']], {
        choices: [['pleut', 'pleuvra'], ['prendrons', 'prenons'], ['fait', 'fera'], ['viens', 'viendras']],
      }),
      ord(P.order, 'Si vous réservez tôt, vous paierez moins cher.', {
        tr: 'If you book early, you will pay less.',
        extra: ['réserverez', 'payez'],
      }),
      pairs(
        b('Match each Type 1 condition with the best result clause.', 'Associez chaque condition de type 1 à la conséquence logique.'),
        [
          ['S’il neige cette nuit,', 'les routes seront glissantes demain.'],
          ['Si tu as encore mal au dos,', 'prends rendez-vous chez le médecin !'],
          ['Si on prend le tramway,', 'on arrive au bureau en dix minutes.'],
          ['S’ils acceptent notre invitation,', 'nous préparerons un grand dîner.'],
        ],
        true,
      ),
      hear('Si le train a plus de dix minutes de retard, envoie-moi un message et je t’attendrai au café d’en face.', b('What should the listener do if the train is late?', 'Que doit faire l’interlocuteur si le train a du retard ?'), [
        b('Send a text message, and the speaker will wait at the café opposite', 'Envoyer un message pendant que la personne attend au café d’en face'),
        b('Take a taxi straight to the office without calling', 'Prendre un taxi sans prévenir'),
        b('Wait inside the station until tomorrow morning', 'Attendre dans la gare jusqu’au lendemain'),
      ]),
      dict('Si on part avant huit heures, on évitera les embouteillages sur le pont.'),
      say('S’il reste des places pour samedi, j’en prendrai deux tout de suite.', 'If there are tickets left for Saturday, I’ll grab two right away.'),
    ],
    [
      b('Type 1: si + présent → présent (habit), futur (likely plan), or impératif (advice).', 'Type 1 : si + présent → présent (habitude), futur (projet probable) ou impératif (conseil).'),
      b('Never use futur or conditionnel directly after si.', 'N’employez jamais le futur ni le conditionnel juste après si.'),
      b('Elide si only before il/ils: s’il, s’ils — keep si elle, si on.', 'Élidez si seulement devant il/ils : s’il, s’ils — gardez si elle, si on.'),
    ],
    [
      ['un embouteillage', b('a traffic jam', 'une file de voitures bloquées')],
      ['glissant(e)', b('slippery', 'où l’on risque de glisser')],
      ['lever la main', b('to raise one’s hand', 'monter la main pour parler')],
    ],
  ),

  lesson(C, 2, ['si-type-2-hypothetical', 'si-type-2-irreel-present'],
    b('Type 2: imaginary present & future (si + imparfait)', 'Type 2 : imaginaire au présent (si + imparfait)'),
    b('Imagine an alternate present or unlikely future with si + imparfait → conditionnel présent.', 'Imaginer un présent différent ou un avenir peu probable avec si + imparfait → conditionnel présent.'),
    [
      b('Pair si + imparfait with conditionnel présent in both clause orders', 'Associer si + imparfait au conditionnel présent quel que soit l’ordre des propositions'),
      b('Give gentle advice with Si j’étais toi / Si j’étais à ta place', 'Donner un conseil nuancé avec Si j’étais toi / à ta place'),
      b('Eliminate the common mistake « si j’aurais »', 'Éviter définitivement la faute « si j’aurais »'),
    ],
    13,
    [
      card(
        b('Type 2: si + imparfait → conditionnel présent', 'Type 2 : si + imparfait → conditionnel présent'),
        b(
          'Use **Type 2** to imagine something **contrary to reality right now** or **unlikely in the future**: *"If I had more time (I don’t), I would learn Japanese."* Put **si + imparfait** (`avais, étais, pouvais, faisais`) in the condition, and **conditionnel présent** (`apprendrais, irais, ferais`) in the result.\n\nImaginary present: **Si j’avais le temps, Si j’étais riche, Si nous habitions là-bas**.\nAdvice: **Si j’étais toi, Si j’étais à ta place, À ta place**.\nCommon conditionals: **j’irais, je ferais, je pourrais, j’aurais**.',
          'On emploie le **type 2** pour imaginer une situation **irréelle dans le présent** ou **peu probable dans l’avenir**. On met **si + imparfait** (`avais, étais, pouvais, faisais`) dans la condition, et le **conditionnel présent** (`apprendrais, irais, ferais`) dans le résultat.\n\nPrésent imaginaire : **Si j’avais le temps, Si j’étais riche, Si nous habitions là-bas**.\nConseil : **Si j’étais toi, Si j’étais à ta place, À ta place**.\nConditionnels fréquents : **j’irais, je ferais, je pourrais, j’aurais**.',
        ),
        {
          table: {
            head: [b('Part 1: condition', 'Condition (si)'), b('Part 2: result', 'Résultat (conditionnel)'), b('Meaning', 'Sens')],
            rows: [
              ['Si j’avais une voiture,', 'j’irais plus souvent à la mer.', b('I don’t have one now', 'Je n’en ai pas maintenant')],
              ['S’il faisait moins froid,', 'nous déjeunerions sur la terrasse.', b('It’s cold right now', 'Il fait froid aujourd’hui')],
              ['Si j’étais à ta place,', 'j’accepterais cette offre.', b('Polite advice', 'Conseil poli')],
            ],
          },
          ex: [
            ['Si nous avions un grand jardin, nous planterions des cerisiers.', 'If we had a large garden, we would plant cherry trees.'],
            ['Je voyagerais beaucoup plus si les billets étaient moins chers.', 'I would travel much more if tickets were cheaper.'],
          ],
        },
      ),
      trap(
        b('Remember: « les si n’aiment pas les -r- »!', 'Astuce d’or : les si n’aiment pas les -rai- !'),
        b(
          'In spoken English, some people say *"If I would have..."*, which tempts learners into « Si j’aurais » or « Si tu serais ». In standard French, that is ALWAYS wrong! Repeat the memory trick: **si hates -r-** (`si j’avais`, `si tu voulais`, `si on pouvait` — never `-rais` right after `si`). Notice you can flip the two halves freely: **Je viendrais volontiers si j’avais moins de travail**.\n\nCorrect si-clause: **si j’avais, si j’étais, si tu pouvais, si il savait → s’il savait**.\nCorrect result: **je ferais, tu irais, nous serions, ils auraient**.',
          'Ne dites JAMAIS « Si j’aurais » ni « Si tu serais » ! Répétez le moyen mnémotechnique : **les si n’aiment pas les -rai-**. Juste après **si**, on utilise l’imparfait (`si j’avais`, `si tu voulais`, `si on pouvait`) ; le conditionnel (`-rais, -rait`) va uniquement dans l’autre moitié, même si vous inversez l’ordre de la phrase.\n\nAprès si (imparfait) : **si j’avais, si j’étais, si tu pouvais, s’il savait**.\nRésultat (conditionnel) : **je ferais, tu irais, nous serions, ils auraient**.',
        ),
      ),
      mc(P.form, ['savais', 'saurais', 'saurai', 'sais'], {
        fr: 'Si je ___ jouer du piano, je jouerais ce morceau tous les soirs.',
        explain: b('After si, use imparfait (savais), never conditionnel (saurais).', 'Après si, il faut l’imparfait (savais), jamais le conditionnel.'),
      }),
      mc(P.form, ['partirais', 'pars', 'partais', 'partirai'], {
        fr: 'À ta place, si j’avais deux semaines de congé, je ___ au Portugal.',
      }),
      gap(P.complete, 'Si mon frère ___ (être) moins timide, il ___ (rencontrer) plus de gens. Et toi, qu’est-ce que tu ___ (faire) si tu ___ (gagner) un voyage ?', [['était'], ['rencontrerait'], ['ferais'], ['gagnais']], {
        choices: [['était', 'serait'], ['rencontrerait', 'rencontrait'], ['ferais', 'faisais'], ['gagnais', 'gagnerais']],
      }),
      ord(P.order, 'Si j’étais à ta place, j’accepterais tout de suite.', {
        tr: 'If I were in your shoes, I would accept right away.',
        extra: ['serais', 'acceptais'],
      }),
      sort(
        b('Real possibility (Type 1) or imaginary hypothesis (Type 2)?', 'Hypothèse probable (type 1) ou imaginaire au présent (type 2) ?'),
        [b('Type 1 (si + présent → futur/présent)', 'Type 1 (probable : si + présent)'), b('Type 2 (si + imparfait → conditionnel)', 'Type 2 (imaginaire : si + imparfait)')],
        [['S’il pleut ce soir, nous resterons ici.', 0], ['Si j’avais des ailes, je volerais.', 1], ['Si tu prends ce train, tu arriveras à midi.', 0], ['Si elle parlait italien, elle travaillerait à Milan.', 1], ['Si on habitait au bord de la mer, on nagerait tous les jours.', 1]],
      ),
      hear('Si j’avais assez de place sur mon balcon, je cultiverais des tomates et du basilic tout l’été.', b('Does the speaker grow tomatoes on their balcony right now?', 'La personne cultive-t-elle des tomates sur son balcon aujourd’hui ?'), [
        b('No, the balcony does not have enough space right now', 'Non, elle manque de place sur son balcon actuellement'),
        b('Yes, she harvests tomatoes there every week', 'Oui, elle en récolte chaque semaine'),
        b('She already sold her flat to buy a garden', 'Elle a déjà vendu son appartement pour un jardin'),
      ]),
      dict('Si nous avions moins de réunions le vendredi, nous finirions toujours nos projets plus tôt.'),
      say('Si j’étais toi, j’essaierais d’abord de lui parler calmement.', 'If I were you, I would try talking to him/her calmly first.'),
    ],
    [
      b('Type 2 expresses an imaginary present or unlikely future: si + imparfait → conditionnel présent.', 'Le type 2 exprime l’irréel du présent ou l’improbable : si + imparfait → conditionnel présent.'),
      b('Never write « si j’aurais / si j’irais » — keep -rais/-rait out of the si clause.', 'N’écrivez jamais « si j’aurais / si j’irais » : pas de conditionnel juste après si.'),
      b('Both clause orders keep the exact same tenses.', 'L’inversion des deux propositions conserve exactement les mêmes temps.'),
    ],
    [
      ['une aile', b('a wing', 'ce qui permet aux oiseaux de voler')],
      ['cultiver', b('to grow (plants/crops)', 'faire pousser des plantes')],
      ['à ta place', b('in your shoes', 'dans ta situation')],
    ],
  ),

  lesson(C, 3, ['si-type-3-past-regret', 'si-type-3-irreel-passe'],
    b('Type 3: past regrets & what could have been (si + plus-que-parfait)', 'Type 3 : regrets du passé (si + plus-que-parfait)'),
    b('Rewind the past with si + plus-que-parfait → conditionnel passé.', 'Revenir sur le passé et exprimer un regret avec si + plus-que-parfait → conditionnel passé.'),
    [
      b('Form the plus-que-parfait and conditionnel passé accurately (avoir and être)', 'Former avec justesse le plus-que-parfait et le conditionnel passé (avoir et être)'),
      b('Express regrets and unrealized past results with Type 3 si clauses', 'Exprimer un regret ou une autre issue passée avec le type 3'),
      b('Maintain agreement rules with être in both halves of Type 3', 'Appliquer l’accord du participe avec être dans les deux propositions'),
    ],
    13,
    [
      card(
        b('Type 3: si + plus-que-parfait → conditionnel passé', 'Type 3 : si + plus-que-parfait → conditionnel passé'),
        b(
          'Use **Type 3** to talk about something in the **past** that **cannot be changed** anymore (*"If I had known, I wouldn’t have come"*). Put **si + plus-que-parfait** (`imparfait` of `avoir/être` + past participle) in the condition, and **conditionnel passé** (`conditionnel présent` of `avoir/être` + past participle) in the result.\n\nPlus-que-parfait: **si j’avais su, si tu étais parti(e), s’ils avaient réservé**.\nConditionnel passé: **j’aurais dit, je serais venu(e), nous aurions pris**.',
          'Le **type 3** sert à imaginer un **passé différent** qu’on ne peut plus changer (*regret, soulagement, reproche*). On emploie **si + plus-que-parfait** (`avais / étais` + participe passé) dans la condition, et le **conditionnel passé** (`aurais / serais` + participe passé) dans le résultat.\n\nPlus-que-parfait : **si j’avais su, si tu étais parti(e), s’ils avaient réservé**.\nConditionnel passé : **j’aurais dit, je serais venu(e), nous aurions pris**.',
        ),
        {
          table: {
            head: [b('Auxiliary', 'Auxiliaire'), b('Si + plus-que-parfait', 'Si + plus-que-parfait'), b('Conditionnel passé', 'Conditionnel passé')],
            rows: [
              ['avoir', 'Si j’avais vérifié la date,', 'je n’aurais pas fait d’erreur.'],
              ['être (agreement!)', 'Si elle était partie plus tôt,', 'elle ne serait pas arrivée en retard.'],
              ['pronominal (être)', 'S’ils s’étaient levés à six heures,', 'ils se seraient préparés tranquillement.'],
            ],
          },
          ex: [
            ['Si tu m’avais prévenu, je serais venu t’aider dès neuf heures.', 'If you had let me know, I would have come to help you at nine.'],
            ['Nous aurions raté le dernier ferry si nous n’avions pas couru.', 'We would have missed the last ferry if we hadn’t run.'],
          ],
        },
      ),
      trap(
        b('Keep Type 2 and Type 3 apart—and check être agreement!', 'Distinguez bien type 2 et type 3 — et vérifiez l’accord avec être !'),
        b(
          'Comparing the two hypothetical types keeps them clear: **Si j’avais de l’argent** (now) → **j’achèterais** (Type 2), whereas **Si j’avais eu de l’argent** (back then) → **j’aurais acheté** (Type 3). And never forget that **être** verbs (`aller, partir, venir, rester, se lever`) agree with the subject in **both** the plus-que-parfait and the conditionnel passé: « Si Marie **était venue**, elle **se serait amusée**. »\n\nType 2 (now): **si j’avais → je ferais, si tu étais → tu irais**.\nType 3 (past): **si j’avais eu → j’aurais fait, si tu étais venu(e) → tu serais allé(e)**.',
          'Ne mélangez pas les deux temps composés : **Si j’avais…** (aujourd’hui) → **j’achèterais** (type 2) ; **Si j’avais eu…** (autrefois) → **j’aurais acheté** (type 3). N’oubliez pas non plus l’accord avec le sujet pour les verbes conjugués avec **être** : « Si Marie **était venue**, elle **se serait amusée**. »\n\nType 2 (présent) : **si j’avais → je ferais, si tu étais → tu irais**.\nType 3 (passé) : **si j’avais eu → j’aurais fait, si tu étais venu(e) → tu serais allé(e)**.',
        ),
      ),
      mc(P.form, ['serais venue', 'suis venue', 'serais venu', 'serai venue'], {
        fr: 'Claire dit : « Si tu m’avais invitée hier, je ___ avec plaisir ! »',
        explain: b('Claire is feminine and expressing a past unrealized action → conditionnel passé with être + -e (`serais venue`).', 'Claire parle au féminin d’une action passée non réalisée → conditionnel passé (`serais venue`).'),
      }),
      mc(P.form, ['avait su', 'aurait su', 'savait', 'saura'], {
        fr: 'S’il ___ que la route était fermée, il aurait pris l’autoroute.',
      }),
      gap(P.complete, 'Si nous ___ (réserver, plus-que-parfait) la veille, nous ___ (trouver, conditionnel passé) de meilleures places. Et si Léa ___ (se coucher, plus-que-parfait) tôt, elle ___ (être, conditionnel passé) moins fatiguée ce matin-là.', [['avions réservé'], ['aurions trouvé'], ['s’était couchée'], ['aurait été']], {
        choices: [['avions réservé', 'aurions réservé'], ['aurions trouvé', 'avions trouvé'], ['s’était couchée', 'se serait couchée'], ['aurait été', 'était']],
      }),
      ord(P.order, 'Si j’avais su, je ne serais pas parti sans parapluie.', {
        tr: 'If I had known, I wouldn’t have left without an umbrella.',
        extra: ['aurais', 'étais'],
      }),
      pairs(
        b('Match each past condition with its Type 3 result.', 'Associez chaque condition passée à son résultat au conditionnel passé.'),
        [
          ['Si vous aviez lu la notice,', 'vous n’auriez pas cassé l’appareil.'],
          ['S’ils étaient arrivés à l’heure,', 'ils auraient vu le début du concert.'],
          ['Si elle avait gardé le ticket,', 'le magasin l’aurait remboursée.'],
          ['Si tu m’avais écouté,', 'tu ne te serais pas perdu dans le bois.'],
        ],
        true,
      ),
      hear('Si j’avais vérifié la météo avant de sortir, j’aurais mis des bottes au lieu de mes chaussures en toile.', b('What actually happened?', 'Que s’est-il réellement passé ?'), [
        b('They didn’t check the forecast and wore canvas shoes instead of boots', 'La personne n’a pas vérifié la météo et a mis des chaussures en toile'),
        b('They wore boots because the forecast warned of rain', 'La personne a mis des bottes grâce à la météo'),
        b('They stayed home all day to avoid the rain', 'La personne est restée chez elle toute la journée'),
      ]),
      dict('S’ils étaient partis dix minutes plus tôt, ils n’auraient pas raté leur correspondance à Lyon.'),
      say('Si j’avais appris cette règle avant, j’aurais évité bien des erreurs !', 'If I had learned this rule earlier, I would have avoided plenty of mistakes!'),
    ],
    [
      b('Type 3 expresses unreal past / regrets: si + plus-que-parfait → conditionnel passé.', 'Le type 3 exprime l’irréel du passé / le regret : si + plus-que-parfait → conditionnel passé.'),
      b('Form conditionnel passé with j’aurais / je serais + past participle (with être agreement).', 'Le conditionnel passé se forme avec j’aurais / je serais + participe passé (accord avec être).'),
      b('Never use conditionnel passé right after si (never « si j’aurais su »).', 'Jamais de conditionnel juste après si (jamais « si j’aurais su »).'),
    ],
    [
      ['une correspondance', b('a train/flight connection', 'le changement entre deux trains ou avions')],
      ['rembourser', b('to refund, pay back', 'rendre l’argent dépensé')],
      ['la veille', b('the day before', 'le jour juste précédent')],
    ],
  ),

  lesson(C, 4, ['si-mixed-and-variations', 'si-mixte-et-variantes'],
    b('Mixed hypotheses, même si, si jamais — all types together', 'Hypothèses mixtes, même si et si jamais : bilan complet'),
    b('Link a past action to a present result, use même si and si jamais, and choose smoothly across all si patterns.', 'Relier un choix passé au présent, employer même si et si jamais, et maîtriser tout le système des phrases en si.'),
    [
      b('Use mixed Type 3 + Type 2 hypotheses when a past event affects the present', 'Construire une hypothèse mixte quand une action passée change le présent'),
      b('Use même si across all three patterns and si jamais for polite possibilities', 'Employer même si à tous les types et si jamais pour une éventualité'),
      b('Select the exact si tense combination for real, imaginary, past and mixed contexts', 'Choisir avec précision le temps de chaque proposition selon le sens'),
    ],
    13,
    [
      card(
        b('All four si patterns side by side — including Mixed!', 'Les quatre schémas avec si côte à côte — y compris le mixte !'),
        b(
          'Sometimes a **past decision** changes how things would be **today** (`maintenant`, `aujourd’hui`). That creates a **Mixed hypothesis**: **si + plus-que-parfait** (past condition) → **conditionnel présent** (present result): « Si j’**avais choisi** la médecine, je **serais** médecin aujourd’hui. »\n\nMême si ("even if"): **Même s’il pleut, Même si j’avais le temps, Même s’il avait appelé**.\nSi jamais ("if by any chance"): **Si jamais tu passes, Si jamais vous avez besoin, Si jamais il oublie**.',
          'Parfois, une **décision passée** change la situation **d’aujourd’hui** (`maintenant`, `aujourd’hui`). On forme alors une **hypothèse mixte** : **si + plus-que-parfait** (cause passée) → **conditionnel présent** (effet actuel) : « Si j’**avais choisi** la médecine, je **serais** médecin aujourd’hui. »\n\nMême si : **Même s’il pleut, Même si j’avais le temps, Même s’il avait appelé**.\nSi jamais : **Si jamais tu passes, Si jamais vous avez besoin, Si jamais il oublie**.',
        ),
        {
          table: {
            head: [b('Type', 'Type'), b('Si clause', 'Condition (si)'), b('Main clause', 'Principale'), b('Time / Meaning', 'Temps / Sens')],
            rows: [
              [b('Type 1 (real)', 'Type 1 (réel)'), 'si + présent', 'présent / futur / impératif', b('likely or habitual', 'probable ou habituel')],
              [b('Type 2 (imaginary now)', 'Type 2 (irréel présent)'), 'si + imparfait', 'conditionnel présent', b('contrary to now', 'imaginaire aujourd’hui')],
              [b('Type 3 (unreal past)', 'Type 3 (irréel passé)'), 'si + plus-que-parfait', 'conditionnel passé', b('past regret / what-if', 'passé révolu')],
              [b('Mixed (past → now)', 'Mixte (passé → présent)'), 'si + plus-que-parfait', 'conditionnel présent (+ aujourd’hui)', b('past choice affecting today', 'cause passée, effet actuel')],
            ],
          },
          ex: [
            ['Si j’avais pris mon manteau ce matin, je n’aurais pas froid maintenant !', 'If I had taken my coat this morning, I wouldn’t be cold now!'],
            ['Même s’il faisait très mauvais demain, nous maintiendrions le spectacle en salle.', 'Even if the weather were awful tomorrow, we would keep the indoor show.'],
          ],
        },
      ),
      tip(
        b('Même si and si jamais follow the exact same tense rules!', 'Même si et si jamais suivent exactement les mêmes règles !'),
        b(
          'Adding **même** (*even if*) or **jamais** (*if by any chance*) does NOT change the tense after **si**! **Même si** works cleanly with Type 1, 2, or 3 (`Même s’il pleut, je sors` / `Même si j’étais riche, je travaillerais`). And **si jamais** takes Type 1 (`présent`) or Type 2 (`imparfait`, very tentative): « **Si jamais** tu passes à Nantes, appelle-moi ! »\n\nMême si (all 3): **Même si tu pars, Même si tu partais, Même si tu étais parti**.\nSi jamais (polite): **Si jamais il pleut, Si jamais vous changez d’avis, Si jamais on avait un doute**.',
          'Ajouter **même** ou **jamais** ne change rien aux temps employés ! **Même si** s’utilise aux trois types (`Même s’il pleut, je sors`, `Même si j’étais riche, je travaillerais`, `Même s’il avait plu, on serait venus`). Et **si jamais** (*au cas où*) s’emploie le plus souvent au présent (type 1) ou à l’imparfait (type 2).\n\nMême si (3 types) : **Même si tu pars, Même si tu partais, Même si tu étais parti**.\nSi jamais : **Si jamais il pleut, Si jamais vous changez d’avis, Si jamais on avait un doute**.',
        ),
      ),
      mc(P.form, ['serions', 'aurions été', 'sommes', 'serons'], {
        fr: 'Si nous avions acheté cet appartement il y a dix ans, nous ___ propriétaires aujourd’hui.',
        explain: b('Past condition (il y a dix ans → plus-que-parfait) affecting today (aujourd’hui) → conditionnel présent (serions).', 'Condition passée avec effet actuel (aujourd’hui) → conditionnel présent (serions).'),
      }),
      mc(P.form, ['Même s’il', 'Même si il', 'Même s’elle', 'Si même il'], {
        fr: '___ était fatigué après le vol, Marc prendrait quand même le temps de nous voir.',
      }),
      gap(P.complete, 'Si jamais vous ___ (passer) près de la librairie demain, ___ (entrer, impératif vous) dire bonjour ! Et moi, si j’___ (apprendre) l’espagnol au lycée, je le ___ (parler) couramment aujourd’hui.', [['passez'], ['entrez'], ['avais appris'], ['parlerais']], {
        choices: [['passez', 'passerez'], ['entrez', 'entrerez'], ['avais appris', 'apprenais'], ['parlerais', 'aurais parlé']],
      }),
      ord(P.order, 'Même si tu avais insisté, je n’aurais pas changé d’avis.', {
        tr: 'Even if you had insisted, I wouldn’t have changed my mind.',
        extra: ['insisterais', 'changeais'],
      }),
      sort(
        b('Match each sentence to its hypothesis type.', 'Classez chaque phrase selon son type d’hypothèse.'),
        [b('Type 1 (real / likely)', 'Type 1 (réel / probable)'), b('Type 2 (imaginary present)', 'Type 2 (irréel du présent)'), b('Type 3 or Mixed (past condition)', 'Type 3 ou mixte (condition passée)')],
        [['Si jamais tu as un doute, appelle-moi.', 0], ['Si j’avais moins de travail, je lirais plus.', 1], ['Si elle avait accepté ce poste, elle vivrait à Rome aujourd’hui.', 2], ['Même s’il neige demain, le train roulera.', 0], ['Si tu avais fermé la porte, le chat ne serait pas sorti.', 2]],
      ),
      hear('Si j’avais suivi un cours de menuiserie il y a cinq ans, je fabriquerais moi-même tous mes meubles aujourd’hui !', b('Why doesn’t the speaker make their own furniture today?', 'Pourquoi cette personne ne fabrique-t-elle pas ses meubles aujourd’hui ?'), [
        b('Because they didn’t take a carpentry course five years ago', 'Parce qu’elle n’a pas suivi de cours de menuiserie il y a cinq ans'),
        b('Because wood has become far too expensive this year', 'Parce que le bois coûte trop cher cette année'),
        b('Because they already finished building all their furniture', 'Parce qu’elle a déjà fini de fabriquer tous ses meubles'),
      ]),
      dlg(b('Changing plans or imagining another path', 'Changer de plans ou imaginer un autre choix'), b('Bastien and Zoé talk over coffee about a job offer and tonight’s concert.', 'Bastien et Zoé discutent autour d’un café d’une offre d’emploi et du concert de ce soir.'), [['Bastien', 'm'], ['Zoé', 'f']], [
        [0, 'Alors, ce concert en plein air ce soir : tu crois qu’on y va malgré les nuages ?', 'So, that outdoor concert tonight: do you think we’re going despite the clouds?'],
        [1, { options: ['Oui ! Même s’il pleut un peu, je prendrai mon ciré jaune et j’irai.', 'Oui ! Même s’il pleuvra un peu, je prendrai mon ciré jaune et j’irai.', 'Oui ! Même s’il pleuvait un peu, je prends mon ciré jaune et j’irai.'], explain: b('Type 1 real future condition: même si + présent → futur.', 'Type 1 probable : même si + présent → futur.') }],
        [0, 'Bonne idée ! Au fait, tu repenses encore au poste à Montréal ?', 'Good idea! By the way, do you still think about the job in Montreal?'],
        [1, { options: ['Parfois, oui : si j’avais accepté l’an dernier, j’habiterais au bord du fleuve aujourd’hui, mais je suis heureuse ici aussi.', 'Parfois, oui : si j’aurais accepté l’an dernier, j’habiterais au bord du fleuve aujourd’hui.', 'Parfois, oui : si j’acceptais l’an dernier, j’aurais habité au bord du fleuve aujourd’hui.'], explain: b('Mixed hypothesis: past choice (`si j’avais accepté`) → present state (`j’habiterais aujourd’hui`).', 'Hypothèse mixte : choix passé (`si j’avais accepté`) → situation actuelle (`j’habiterais`).') }],
      ]),
      write(
        b('Write about plans, daydreams and a past turning point', 'Rédiger un texte mêlant projets, rêves et regrets'),
        b('Write 45 to 80 words about your life or a trip using at least three different si structures: one Type 1 (si + présent → futur/impératif), one Type 2 (si + imparfait → conditionnel présent), and one Type 3 or Mixed (si + plus-que-parfait). Bonus if you include même si or si jamais!', 'Écrivez 45 à 80 mots sur vos projets ou un voyage en utilisant au moins trois schémas avec si différents : un type 1 (si + présent), un type 2 (si + imparfait) et un type 3 ou mixte (si + plus-que-parfait). Vous pouvez aussi inclure même si ou si jamais.'),
        45,
        80,
        [
          b('Type 1: si + présent → présent, futur or impératif', 'Type 1 : si + présent → présent, futur ou impératif'),
          b('Type 2: si + imparfait → conditionnel présent', 'Type 2 : si + imparfait → conditionnel présent'),
          b('Type 3 or Mixed: si + plus-que-parfait (never si j’aurais!)', 'Type 3 ou mixte : si + plus-que-parfait (jamais si j’aurais !)'),
        ],
        'S’il fait beau samedi, j’irai marcher dans les collines. Si jamais tu veux venir, appelle-moi vendredi soir ! Bien sûr, si j’avais plus de vacances cette année, je partirais un mois en Écosse. Parfois je me dis que si j’avais économisé davantage l’an dernier, j’aurais déjà réservé mon billet d’avion !',
      ),
    ],
    [
      b('Mixed hypothesis connects a past cause to a present state: si + plus-que-parfait → conditionnel présent.', 'L’hypothèse mixte relie une cause passée à un effet présent : si + plus-que-parfait → conditionnel présent.'),
      b('même si works with all patterns; si jamais expresses a polite possibility ("if by any chance").', 'même si s’emploie avec tous les types ; si jamais exprime une éventualité (« au cas où »).'),
      b('Across every pattern, never put futur or conditionnel directly after si.', 'Dans tous les types, ne mettez jamais le futur ni le conditionnel juste après si.'),
    ],
    [
      ['un ciré', b('a waterproof rain jacket', 'un manteau imperméable')],
      ['économiser', b('to save (money)', 'mettre de l’argent de côté')],
      ['changer d’avis', b('to change one’s mind', 'modifier sa décision')],
    ],
  ),
];

export default lessons;
