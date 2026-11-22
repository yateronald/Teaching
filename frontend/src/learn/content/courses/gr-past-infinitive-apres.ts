import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Après avoir terminé ce dossier, sans avoir relu, merci d’être venu. Whenever you look back from an infinitive—after doing something, without having done it, or thanking someone for doing it—French requires the past infinitive (avoir or être + past participle). This course drills auxiliary choice, negative placement (ne pas avoir), the strict rule on après, and past-participle agreement.',
    'Après avoir terminé ce dossier, sans avoir relu, merci d’être venu. Dès qu’un infinitif renvoie à une action antérieure — après avoir fait, sans avoir vérifié, remercier d’avoir aidé — le français exige l’infinitif passé (avoir ou être + participe passé). Ce cours entraîne au choix de l’auxiliaire, à la place de la négation (ne pas avoir), à la règle stricte d’après et aux accords du participe.',
  ),
  outcomes: [
    b('Form the past infinitive with avoir, être and pronominal verbs', 'Former l’infinitif passé avec avoir, être et les verbes pronominaux'),
    b('Apply the strict rule: après + past infinitive (never *après manger*)', 'Appliquer la règle stricte : après + infinitif passé (jamais *après manger*)'),
    b('Place ne pas / ne rien / ne jamais before the infinitive auxiliary', 'Placer ne pas / ne rien / ne jamais avant l’auxiliaire à l’infinitif'),
    b('Handle past-participle agreement with être and preceding direct objects', 'Maîtriser l’accord du participe avec être et avec un COD placé avant'),
  ],
};

const C = 'gr-past-infinitive-apres';

const lessons: Lesson[] = [
  lesson(C, 1, ['formation-past-infinitive', 'formation-infinitif-passe'],
    b('Forming the past infinitive (avoir / être + past participle)', 'Former l’infinitif passé (avoir / être + participe passé)'),
    b('Build the past infinitive just like the passé composé, with one key twist on negative word order.', 'Construisez l’infinitif passé comme le passé composé, avec une place particulière pour la négation.'),
    [
      b('Choose avoir vs être in the past infinitive', 'Choisir entre avoir et être à l’infinitif passé'),
      b('Form negative past infinitives (ne pas avoir / ne jamais être)', 'Former la négation à l’infinitif passé (ne pas avoir / ne jamais être)'),
      b('Build pronominal past infinitives (s’être reposé)', 'Former l’infinitif passé des verbes pronominaux (s’être reposé)'),
    ],
    13,
    [
      card(b('Auxiliary in the infinitive + past participle', 'Auxiliaire à l’infinitif + participe passé'), b('The past infinitive uses the infinitive **avoir** or **être** followed by the past participle. Verbs of movement/change (**aller, venir, partir, arriver, rester**) and all pronominal verbs (**se reposer, se tromper**) take **être**, just like in the passé composé.\nWith avoir: **avoir fini, avoir compris, avoir lu**.\nWith être: **être arrivé, être sorti, s’être levé**.', 'L’infinitif passé combine l’infinitif **avoir** ou **être** suivi du participe passé. Les verbes de déplacement ou d’état (**aller, venir, partir, arriver, rester**) et tous les verbes pronominaux (**se reposer, se tromper**) prennent **être**, exactement comme au passé composé.\nAvec avoir : **avoir fini, avoir compris, avoir lu**.\nAvec être : **être arrivé, être sorti, s’être levé**.'), {
        table: {
          head: [b('Verb type', 'Catégorie'), b('Present infinitive', 'Infinitif présent'), b('Past infinitive', 'Infinitif passé')],
          rows: [
            [b('Standard (avoir)', 'Courant (avoir)'), 'finir / lire', 'avoir fini / avoir lu'],
            [b('Movement / state (être)', 'Mouvement / état (être)'), 'partir / rentrer', 'être parti(e) / être rentré(e)'],
            [b('Pronominal (être)', 'Pronominal (être)'), 'se préparer', 's’être préparé(e)'],
            [b('Negative (ne pas)', 'Négatif (ne pas)'), 'ne pas oublier', 'ne pas avoir oublié'],
          ],
        },
        ex: [
          ['Il regrette d’avoir parlé trop vite.', 'He regrets having spoken too fast.'],
          ['Elle est contente d’être arrivée à l’heure.', 'She is glad to have arrived on time.'],
          ['Je m’excuse de ne pas avoir répondu plus tôt.', 'I apologize for not having replied earlier.'],
        ],
      }),
      tip(b('Negation sits BEFORE the auxiliary!', 'La négation se place AVANT l’auxiliaire !'), b('In a normal sentence, **ne… pas** wraps the conjugated verb (*je n’ai pas vu*). In an infinitive, **ne pas**, **ne jamais**, **ne rien**, **ne plus** stay together right **before** **avoir** or **être** (or before **s’être**).\nNegative patterns: **ne pas avoir compris, ne jamais être venu, ne rien avoir dit, ne pas s’être excusé**.', 'Dans une phrase conjuguée, **ne… pas** encadre le verbe (*je n’ai pas vu*). À l’infinitif, **ne pas**, **ne jamais**, **ne rien**, **ne plus** restent groupés **devant** **avoir** ou **être** (ou devant **s’être**).\nFormes négatives : **ne pas avoir compris, ne jamais être venu, ne rien avoir dit, ne pas s’être excusé**.')),
      mc(P.form, ['ne pas avoir prévenu', 'n’avoir pas prévenu', 'ne avoir prévenu pas', 'pas avoir prévenu'], { fr: 'Il regrette de ___ ses collègues avant son départ.' }),
      hear('Après s’être reposé vingt minutes, il a repris la route tranquillement.', P.meaning, [
        b('He rested for twenty minutes before getting back on the road.', 'Il s’est d’abord reposé vingt minutes, puis il a repris la route.'),
        b('He drove twenty minutes before resting.', 'Il a roulé vingt minutes avant de se reposer.'),
        b('He drove without taking any break.', 'Il a continué sans faire aucune pause.'),
      ]),
      sort(b('Sort by auxiliary: avoir vs être.', 'Classez par auxiliaire : avoir ou être ?'), [
        b('Takes avoir', 'Prend avoir'),
        b('Takes être (movement / pronominal)', 'Prend être (mouvement / pronominal)'),
      ], [
        ['comprendre', 0],
        ['partir', 1],
        ['se tromper', 1],
        ['écrire', 0],
        ['devenir', 1],
        ['répondre', 0],
      ]),
      gap(P.complete, 'Marc est ravi d’___ (obtenir) ce stage, mais il s’en veut de ___ (ne pas — envoyer) son dossier une semaine plus tôt.', [['avoir obtenu'], ['ne pas avoir envoyé']], {
        choices: [
          ['avoir obtenu', 'être obtenu', 'obtenir'],
          ['ne pas avoir envoyé', 'n’avoir pas envoyé', 'ne pas être envoyé'],
        ],
      }),
      pairs(P.match, [
        ['avoir pris', b('to have taken', 'avoir saisi / choisi')],
        ['être revenu', b('to have come back', 'être retourné au point de départ')],
        ['s’être trompé', b('to have made a mistake', 'avoir commis une erreur')],
        ['ne pas avoir vu', b('not to have seen', 'avoir manqué de voir')],
      ]),
      ord(P.order, 'Je regrette de ne pas avoir posé cette question hier.', {
        tr: b('I regret not having asked that question yesterday.', 'Je regrette de ne pas avoir posé cette question hier.'),
        extra: ['être', 'pas ne'],
      }),
      dict('Elle est soulagée d’avoir retrouvé ses clés et de ne pas être rentrée tard.'),
      say('Je suis désolé de ne pas avoir appelé avant d’arriver.', 'I am sorry for not having called before arriving.'),
    ],
    [
      b('Past infinitive = infinitive avoir / être + past participle.', 'Infinitif passé = infinitif avoir / être + participe passé.'),
      b('Movement verbs and all pronominal verbs take être (être parti, s’être levé).', 'Les verbes de mouvement et tous les verbes pronominaux prennent être (être parti, s’être levé).'),
      b('Put ne pas / ne jamais / ne rien together BEFORE avoir, être or s’être.', 'Placez ne pas / ne jamais / ne rien ensemble AVANT avoir, être ou s’être.'),
    ],
    [
      ['avoir compris', b('to have understood', 'avoir saisi le sens')],
      ['être parti', b('to have left', 'avoir quitté un lieu')],
      ['s’être reposé', b('to have rested', 'avoir pris du repos')],
      ['ne pas avoir répondu', b('not to have replied', 'être resté sans réponse')],
    ],
  ),

  lesson(C, 2, ['apres-pour-sans-remercier', 'apres-pour-sans-remercier'],
    b('Après, pour, sans, avant de: past vs present infinitive', 'Après, pour, sans, avant de : infinitif passé ou présent ?'),
    b('Learn the ironclad rule for après, and distinguish cause (pour + past) from purpose (pour + present).', 'Retenez la règle absolue d’après, et distinguez la cause passée (pour + passé) du but (pour + présent).'),
    [
      b('Always use the past infinitive after après (never *après manger*)', 'Toujours employer l’infinitif passé après après (jamais *après manger*)'),
      b('Contrast avant de + present infinitive with après + past infinitive', 'Opposer avant de + infinitif présent à après + infinitif passé'),
      b('Use pour, sans and remercier de + past infinitive for prior actions', 'Employer pour, sans et remercier de + infinitif passé pour un fait antérieur'),
    ],
    13,
    [
      card(b('Golden rule: après + past infinitive!', 'Règle d’or : après + infinitif passé !'), b('In English you say “after eating”; in French, **après** ALWAYS requires the **past infinitive**: **après avoir mangé**, **après être sorti**, **après s’être douché**. Never say *après manger*! By contrast, **avant de** takes the **present infinitive** (**avant de partir**).\nAfter = past infinitive: **après avoir fini, après être rentré, après avoir lu**.\nBefore = present infinitive: **avant de finir, avant de rentrer, avant de lire**.', 'En français, **après** exige TOUJOURS l’**infinitif passé** : **après avoir mangé**, **après être sorti**, **après s’être douché**. Ne dites jamais *après manger* ! À l’inverse, **avant de** prend l’**infinitif présent** (**avant de partir**).\nAprès = infinitif passé : **après avoir fini, après être rentré, après avoir lu**.\nAvant de = infinitif présent : **avant de finir, avant de rentrer, avant de lire**.'), {
        table: {
          head: [b('Preposition', 'Préposition'), b('Infinitive used', 'Infinitif choisi'), b('Meaning', 'Sens'), b('Example', 'Exemple')],
          rows: [
            ['après', b('Past infinitive', 'Infinitif passé'), b('after doing', 'action antérieure'), 'Après avoir dîné, il a lu.'],
            ['avant de', b('Present infinitive', 'Infinitif présent'), b('before doing', 'action suivante'), 'Avant de sortir, éteins la lampe.'],
            ['pour', b('Past infinitive', 'Infinitif passé'), b('because of having done', 'cause passée / motif'), 'Il a été récompensé pour avoir aidé.'],
            ['sans', b('Past infinitive', 'Infinitif passé'), b('without having done', 'action absente avant'), 'Elle a signé sans avoir lu la fin.'],
          ],
        },
        ex: [
          ['Après avoir vérifié les comptes, nous avons fermé le bureau.', 'After checking the accounts, we closed the office.'],
          ['Merci beaucoup d’avoir pris le temps de répondre !', 'Thank you very much for taking the time to reply!'],
          ['Il est reparti sans avoir dit au revoir.', 'He left again without having said goodbye.'],
        ],
      }),
      trap(b('Pour + present vs pour + past', 'Pour + présent ou pour + passé ?'), b('**Pour + infinitif présent** expresses a **future goal** (*Il travaille pour réussir* = in order to succeed). **Pour + infinitif passé** expresses a **past cause** — praise, thanks, or punishment (*Il a reçu un prix pour avoir créé ce projet* = for having created).\nGoal (present): **pour réussir, pour apprendre, pour arriver à l’heure**.\nPast cause (past): **pour avoir aidé, d’avoir prévenu, d’avoir menti**.', '**Pour + infinitif présent** exprime un **but** (*Il travaille pour réussir*). **Pour + infinitif passé** exprime une **cause passée** — félicitation, remerciement ou sanction (*Il a reçu un prix pour avoir créé ce projet*).\nBut (présent) : **pour réussir, pour apprendre, pour arriver à l’heure**.\nCause passée (passé) : **pour avoir aidé, d’avoir prévenu, d’avoir menti**.')),
      mc(P.form, ['avoir terminé', 'terminer', 'être terminé', 'terminant'], { fr: 'Après ___ son appel, Claire a noté tous les détails dans son carnet.', explain: b('Après always takes the past infinitive: après avoir terminé.', 'Après demande toujours l’infinitif passé : après avoir terminé.') }),
      hear('Le conducteur a reçu une amende pour avoir grillé le feu rouge.', P.meaning, [
        b('He was fined because he had run a red light.', 'Il a été sanctionné parce qu’il avait grillé un feu rouge.'),
        b('He got a fine so that he would drive faster.', 'Il a payé une amende afin de rouler plus vite.'),
        b('He avoided a fine by stopping in time.', 'Il a évité l’amende en s’arrêtant à temps.'),
      ]),
      sort(b('Present infinitive or past infinitive?', 'Infinitif présent ou infinitif passé ?'), [
        b('Present infinitive (avant de, goal pour)', 'Infinitif présent (avant de, but pour)'),
        b('Past infinitive (après, cause pour, merci de)', 'Infinitif passé (après, cause pour, merci de)'),
      ], [
        ['Avant de ___ (partir)', 0],
        ['Après ___ (manger)', 1],
        ['Merci d’___ (venir)', 1],
        ['Il épargne pour ___ (voyager)', 0],
        ['Félicitations pour ___ (réussir)', 1],
        ['Sans ___ (faire) de bruit maintenant', 0],
      ]),
      gap(P.complete, 'Avant de ___ (signer) un contrat, il vaut mieux lire chaque ligne. Paul a accepté sans ___ (lire) les annexes, et après ___ (recevoir) la facture, il a regretté.', [['signer'], ['avoir lu'], ['avoir reçu']], {
        choices: [
          ['signer', 'avoir signé', 'signant'],
          ['avoir lu', 'lire', 'être lu'],
          ['avoir reçu', 'recevoir', 'être reçu'],
        ],
      }),
      pairs(P.match, [
        ['Merci d’être passé.', b('Thanks for stopping by.', 'Je te remercie de ta visite.')],
        ['Avant d’entrer, frappez.', b('Knock before entering.', 'Frappez d’abord, puis entrez.')],
        ['sans avoir réfléchi', b('without having thought it through', 'sans réflexion préalable')],
        ['puni pour avoir triché', b('punished for having cheated', 'sanctionné à cause d’une tricherie')],
      ]),
      ord(P.order, 'Je vous remercie chaleureusement d’avoir accepté notre invitation.', {
        tr: b('I warmly thank you for having accepted our invitation.', 'Je vous remercie vivement d’avoir accepté notre invitation.'),
        extra: ['accepter', 'pour'],
      }),
      dlg(b('After the conference', 'Après la conférence'), b('Two colleagues wrap up after a busy morning.', 'Deux collègues font le point après une matinée chargée.'), [['Sonia', 'f'], ['Denis', 'm2']], [
        [0, 'Ouf ! Après avoir présenté devant cent personnes, j’ai besoin d’un café.', 'Phew! After presenting in front of a hundred people, I need a coffee.'],
        [1, { options: ['Je te félicite d’avoir gardé ton calme malgré les questions difficiles !', 'Je te félicite de garder ton calme hier !', 'Après présenter, tu dois boire un café !'], explain: b('Praise for a finished action takes de + past infinitive (d’avoir gardé).', 'Pour féliciter d’une action achevée, on emploie de + infinitif passé (d’avoir gardé).') }],
        [0, 'Merci, et merci à toi aussi d’être arrivé tôt pour tester le micro.', 'Thanks, and thank you too for arriving early to test the microphone.'],
      ]),
      dict('Après avoir vérifié les bagages, nous sommes partis sans avoir oublié les passeports.'),
      say('Je te remercie d’avoir relancé le client avant de partir en congé.', 'Thank you for following up with the client before going on leave.'),
    ],
    [
      b('après ALWAYS takes the past infinitive (après avoir fait / après être allé).', 'après exige TOUJOURS l’infinitif passé (après avoir fait / après être allé).'),
      b('avant de takes the present infinitive (avant de partir).', 'avant de prend l’infinitif présent (avant de partir).'),
      b('pour + past infinitive expresses past cause; remercier / s’excuser de + past infinitive gives thanks/apology for a past act.', 'pour + infinitif passé exprime la cause ; remercier / s’excuser de + infinitif passé renvoie à un acte passé.'),
    ],
    [
      ['après avoir + p.p.', b('after having done', 'une fois l’action accomplie')],
      ['avant de + inf.', b('before doing', 'préalablement à l’action')],
      ['remercier d’avoir', b('to thank for having done', 'exprimer sa gratitude pour un geste passé')],
      ['sans avoir + p.p.', b('without having done', 'sans que l’action ait eu lieu avant')],
    ],
  ),

  lesson(C, 3, ['agreement-past-infinitive', 'accord-infinitif-passe'],
    b('Agreement & same-subject rule in the past infinitive', 'Accords et règle du même sujet à l’infinitif passé'),
    b('Know when the past participle agrees (être, pronominals, preceding COD) and when you must switch to après que.', 'Sachez quand accorder le participe (être, pronominaux, COD placé avant) et quand basculer vers après que.'),
    [
      b('Make past-participle agreement with être and pronominals', 'Accorder le participe avec être et les verbes pronominaux'),
      b('Apply preceding-COD agreement with avoir in the past infinitive', 'Accorder avec avoir quand le COD précède l’infinitif'),
      b('Respect the same-subject constraint (après vs après que)', 'Respecter la contrainte d’identité de sujet (après vs après que)'),
    ],
    13,
    [
      card(b('Three agreement rules in the past infinitive', 'Trois règles d’accord à l’infinitif passé'), b('The past infinitive follows the **exact same agreement rules** as the passé composé:\n1. **With être**: agrees with the subject of the clause (**Après être arrivée, Léa…**).\n2. **With pronominals**: agrees with the reflexive pronoun if it is the direct object (**Après s’être levée…**), NOT if an indirect object (**Après s’être parlé, ils…**).\n3. **With avoir**: agrees ONLY if a direct object (**les, la, l’, que**) comes **before** the participle!\nWith être: **être venue, être rentrés, s’être préparées**.\nPreceding COD: **les avoir vues, la lettre qu’il dit avoir écrite**.', 'L’infinitif passé obéit aux **mêmes règles d’accord** que le passé composé :\n1. **Avec être** : accord avec le sujet (**Après être arrivée, Léa…**).\n2. **Avec les pronominaux** : accord avec le pronom si c’est un COD (**Après s’être levée…**), mais pas s’il est COI (**Après s’être parlé, ils…**).\n3. **Avec avoir** : accord uniquement si un COD (**les, la, l’, que**) précède le participe !\nAvec être : **être venue, être rentrés, s’être préparées**.\nCOD avant : **les avoir vues, la lettre qu’il dit avoir écrite**.'), {
        table: {
          head: [b('Rule', 'Règle'), b('Example', 'Exemple'), b('Agreement?', 'Accord ?')],
          rows: [
            ['être + subject', 'Après être rentrées, elles ont dîné.', b('Yes (f. pl.)', 'Oui (f. pl.)')],
            ['pronominal (COD)', 'Après s’être maquillée, elle est sortie.', b('Yes (f. sg.)', 'Oui (f. sg.)')],
            ['pronominal (COI)', 'Après s’être téléphoné, ils se sont vus.', b('No (COI)', 'Non (COI)')],
            ['avoir + COD before', 'Ces photos, je regrette de les avoir jetées.', b('Yes (f. pl.)', 'Oui (f. pl.)')],
          ],
        },
        ex: [
          ['Après être descendues du train, mes cousines m’ont appelé.', 'After getting off the train, my cousins called me.'],
          ['Voilà l’erreur que je suis sûr d’avoir corrigée.', 'Here is the mistake that I am sure I corrected.'],
          ['Après s’être serré la main, les deux joueuses ont souri.', 'After shaking hands, the two players smiled.'],
        ],
      }),
      trap(b('Same subject in BOTH clauses!', 'Le même sujet dans les DEUX parties !'), b('Only use **après + infinitif passé** when the subject of both actions is **identical** (*Après être arrivé, Marc a appelé* → Marc arrived AND Marc called). If the subjects differ, use **après que + indicatif** or a noun (*Après le départ de Marc, Julie a appelé*).\nSame subject: **Après avoir payé, nous sommes sortis.**\nDifferent subjects: **Après qu’il est parti, nous avons rangé.**', 'N’employez **après + infinitif passé** que si le sujet des deux verbes est **identique** (*Après être arrivé, Marc a appelé* → c’est Marc qui arrive et qui appelle). Si les sujets diffèrent, utilisez **après que + indicatif** ou un nom (*Après le départ de Marc, Julie a appelé*).\nMême sujet : **Après avoir payé, nous sommes sortis.**\nSujets différents : **Après qu’il est parti, nous avons rangé.**')),
      mc(P.spelling, [
        'Après être arrivée à Bordeaux, Nadia a pris le tramway.',
        'Après être arrivé à Bordeaux, Nadia a pris le tramway.',
        'Après avoir arrivée à Bordeaux, Nadia a pris le tramway.',
        'Après arriver à Bordeaux, Nadia a pris le tramway.',
      ], { fr: 'Choisissez la phrase correctement accordée.' }),
      doc({
        look: 'email',
        title: b('Subject: Signed contract', 'Objet : Contrat signé'),
        text: 'Bonjour Madame,\n\nJe vous remercie d’avoir vérifié les deux dernières pages du contrat.\nLes corrections que vous m’avez signalées, je suis heureuse de les avoir apportées à temps.\nAprès m’être entretenue avec la direction, je vous confirme notre accord.\n\nBien cordialement,\nClaire Moreau',
      }, b('Why is apportées feminine plural and entretenue feminine singular?', 'Pourquoi apportées est-il au féminin pluriel et entretenue au féminin singulier ?'), [
        b('les refers to les corrections (COD before avoir), and Claire (f.) is the subject of s’entretenir', 'les reprend les corrections (COD avant avoir), et Claire (f.) est le sujet de s’entretenir'),
        b('Because every past participle agrees with vous', 'Parce que tout participe s’accorde avec vous'),
        b('Because avoir always agrees with the subject', 'Parce qu’avoir s’accorde toujours avec le sujet'),
      ]),
      sort(b('Does the past participle agree?', 'Le participe passé s’accorde-t-il ?'), [
        b('Agrees (être / COD before avoir)', 'S’accorde (être / COD avant avoir)'),
        b('Invariable (no COD before / COI)', 'Invariable (pas de COD avant / COI)'),
      ], [
        ['Après être parti(e)s, elles…', 0],
        ['Après s’être parlé, ils…', 1],
        ['Ces clés, je regrette de les avoir perdu(e)s.', 0],
        ['Après avoir lu ces pages, elle…', 1],
        ['Après s’être lavé les mains, elle…', 1],
        ['La porte qu’il dit avoir fermé(e)…', 0],
      ]),
      gap(P.complete, 'Après s’être ___ (promener — f. pl.) au bord du lac, les deux sœurs ont retrouvé les écharpes qu’elles pensaient avoir ___ (oublier).', [['promenées'], ['oubliées']], {
        strict: true,
        hint: b('Watch gender and number: les deux sœurs and les écharpes (que).', 'Attention au genre et au nombre : les deux sœurs et les écharpes (que).'),
      }),
      pairs(P.match, [
        ['Après s’être réveillée', b('after waking up (f. sg.)', 'une fois réveillée (fém. sing.)')],
        ['Après s’être téléphoné', b('after calling each other', 'après s’être parlé au téléphone')],
        ['de les avoir relues', b('of having reread them (f. pl.)', 'd’avoir relu ces choses féminines')],
        ['Après son départ', b('after he/she left (diff. subject)', 'quand les sujets changent')],
      ]),
      ord(P.order, 'Ces erreurs, nous sommes soulagés de les avoir repérées à temps.', {
        tr: b('Those mistakes, we are relieved to have spotted them in time.', 'Ces erreurs, nous sommes soulagés de les avoir remarquées assez tôt.'),
        extra: ['repéré', 'être'],
      }),
      dict('Après s’être excusées d’être venues si tard, elles ont rendu les livres qu’elles avaient dit avoir empruntés.'),
      write(
        b('Write a formal follow-up note.', 'Rédigez un court message de suivi professionnel.'),
        b('Write 3–4 sentences as a woman (or plural group) thanking a contact and summarizing two completed steps, using: merci d’avoir, après être / s’être (with agreement!), and sans avoir.', 'Rédigez 3 à 4 phrases (au féminin ou au pluriel) remerciant un contact et résumant deux étapes accomplies avec : merci d’avoir, après être / s’être (avec accord !) et sans avoir.'),
        28, 62,
        [
          b('Include merci d’avoir / d’être + past participle', 'Inclure merci d’avoir / d’être + participe passé'),
          b('Show accurate agreement with être or preceding COD', 'Réussir un accord avec être ou un COD placé avant'),
          b('Keep the same subject after après', 'Garder le même sujet après après'),
        ],
        'Bonjour Paul, merci beaucoup d’avoir relu ma présentation hier soir. Après être arrivée au bureau ce matin, j’ai corrigé les fautes que j’avais remarquées. J’ai donc pu envoyer la version finale sans avoir dépassé le délai prévu.',
        { phrases: ['Merci d’avoir…', 'Après être arrivée / arrivés…', 'sans avoir…', 'les … que j’ai…'] },
      ),
    ],
    [
      b('être and pronominals (with COD) agree with the subject in the past infinitive.', 'être et les pronominaux (avec COD) s’accordent avec le sujet à l’infinitif passé.'),
      b('avoir agrees only when a direct object (les, la, que…) comes before it.', 'avoir s’accorde seulement si un COD (les, la, que…) précède le participe.'),
      b('After après + past infinitive, both clauses must share the exact same subject.', 'Après + infinitif passé exige le même sujet dans les deux propositions.'),
    ],
    [
      ['après être arrivé(e)', b('after having arrived', 'une fois arrivé(e)')],
      ['s’être parlé', b('to have spoken to each other (invariable)', 'avoir échangé ensemble (invariable)')],
      ['les avoir vues', b('to have seen them (f. pl.)', 'avoir vu ces personnes/choses féminines')],
      ['après que + indicatif', b('after (when subjects differ)', 'après (quand les sujets changent)')],
    ],
  ),
];

export default lessons;
