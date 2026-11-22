import type { CourseAbout, Lesson } from '../../types';
import { b, card, conj, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je dois partir, il doit être fatigué, j’aurais dû t’écouter. At B1, modal verbs carry far more than basic rules: they express logical deduction, polite hedging and past regret. This course unpacks the shift between obligation and probability in devoir and falloir, teaches you how to soften requests with the conditional (je devrais, on pourrait, il faudrait), and trains past counterfactuals (j’aurais dû, tu n’aurais pas dû, il aurait fallu) for real-life conversations.',
    'Je dois partir, il doit être fatigué, j’aurais dû t’écouter. Au niveau B1, les verbes modaux expriment bien plus que la simple règle : déduction logique, atténuation polie et regret au passé. Ce cours distingue l’obligation de la probabilité avec devoir et falloir, vous apprend à nuancer vos demandes au conditionnel (je devrais, on pourrait, il faudrait), et vous entraîne aux regrets et reproches au passé (j’aurais dû, tu n’aurais pas dû, il aurait fallu) dans des situations concrètes.',
  ),
  outcomes: [
    b('Tell obligation apart from logical probability with devoir and falloir', 'Distinguer l’obligation de la probabilité logique avec devoir et falloir'),
    b('Use the conditional of devoir, pouvoir and falloir for polite advice and requests', 'Employer le conditionnel de devoir, pouvoir et falloir pour conseiller ou demander poliment'),
    b('Express past regrets, reproaches and missed necessities with j’aurais dû and il aurait fallu', 'Exprimer le regret, le reproche et la nécessité manquée avec j’aurais dû et il aurait fallu'),
    b('Avoid the English trap between il ne faut pas and ne pas être obligé de', 'Éviter le piège entre il ne faut pas et ne pas être obligé de'),
  ],
};

const C = 'gr-devoir-pouvoir-nuances';
const COND_PRES = b('present conditional', 'conditionnel présent');

const lessons: Lesson[] = [
  lesson(C, 1, ['obligation-vs-probability', 'obligation-ou-probabilite'],
    b('Obligation or logical probability? (devoir & falloir)', 'Obligation ou probabilité logique ? (devoir et falloir)'),
    b('The same verb devoir can mean “must do” or “is probably”, while falloir expresses general necessity.', 'Le même verbe devoir signifie tantôt « être obligé », tantôt « être probable », tandis que falloir exprime la nécessité générale.'),
    [
      b('Distinguish obligation from probability with devoir', 'Distinguer l’obligation de la probabilité avec devoir'),
      b('Choose between devoir and il faut', 'Choisir entre devoir et il faut'),
      b('Contrast prohibition (il ne faut pas) with no obligation', 'Opposer l’interdiction (il ne faut pas) à l’absence d’obligation'),
    ],
    13,
    [
      card(b('Devoir: rule or deduction?', 'Devoir : règle ou déduction ?'), b('Context decides what **devoir** means. Before an action verb with an agent, it states an obligation. Before a state verb (**être, avoir**) or in the **passé composé** explaining a clue, it expresses strong probability.\nObligation uses: **règle, rendez-vous, devoir moral**.\nProbability clues: **lumière allumée, retard, silence**.', 'Le contexte décide du sens de **devoir**. Devant un verbe d’action volontaire, il indique une obligation. Devant un verbe d’état (**être, avoir**) ou au **passé composé** face à un indice, il exprime une forte probabilité.\nIndices d’obligation : **règle, rendez-vous, devoir moral**.\nIndices de probabilité : **lumière allumée, retard, silence**.'), {
        table: {
          head: [b('Tense', 'Temps'), b('Obligation', 'Obligation'), b('Probability', 'Probabilité')],
          rows: [
            [b('Présent', 'Présent'), 'Je dois finir ce dossier avant midi.', 'Il doit être malade : son bureau est vide.'],
            [b('Passé composé', 'Passé composé'), 'J’ai dû prendre un taxi ce matin.', 'Elle a dû oublier notre rendez-vous.'],
          ],
        },
        ex: [
          ['Tu dois présenter ta carte d’identité à l’entrée.', 'You have to show your ID at the entrance.'],
          ['Les voisins doivent être rentrés : j’entends des pas.', 'The neighbors must be back: I hear footsteps.'],
          ['Il a dû rater son train à cause de la grève.', 'He must have missed his train because of the strike.'],
        ],
      }),
      card(b('Il faut vs devoir', 'Il faut ou devoir ?'), b('**Il faut** is always impersonal (**il**) and states what is needed in general, before a noun, an infinitive or **que + subjonctif**. **Devoir** links the duty directly to a specific subject (**je, tu, nous**).\nStructures with falloir: **il faut + nom, il faut + infinitif, il faut que + subjonctif**.', '**Il faut** reste toujours impersonnel (**il**) et énonce ce qui est nécessaire en général, devant un nom, un infinitif ou **que + subjonctif**. **Devoir** rattache le devoir directement à un sujet précis (**je, tu, nous**).\nConstructions de falloir : **il faut + nom, il faut + infinitif, il faut que + subjonctif**.'), {
        ex: [
          ['Il faut de la patience pour apprendre une langue.', 'Patience is needed to learn a language.'],
          ['Nous devons signer le contrat avant vendredi.', 'We must sign the contract before Friday.'],
        ],
      }),
      trap(b('Prohibition vs no obligation', 'Interdiction ou absence d’obligation ?'), b('**Il ne faut pas** always means “you must not” (forbidden). To say “you don’t have to” (optional), French uses **ne pas être obligé de** or **ne pas avoir besoin de**.\nForbidden forms: **il ne faut pas, tu ne dois pas**.\nOptional forms: **tu n’es pas obligé de, ce n’est pas nécessaire de**.', '**Il ne faut pas** signifie toujours « c’est interdit ». Pour dire que quelque chose est facultatif, on utilise **ne pas être obligé de** ou **ne pas avoir besoin de**.\nPour interdire : **il ne faut pas, tu ne dois pas**.\nPour laisser le choix : **tu n’es pas obligé de, ce n’est pas nécessaire de**.'), {
        ex: [
          ['Il ne faut pas stationner devant cette sortie.', 'You must not park in front of this exit.'],
          ['Tu n’es pas obligé de répondre tout de suite.', 'You don’t have to answer right away.'],
        ],
      }),
      mc(P.meaning, [
        b('She probably forgot her keys at the office.', 'Elle a sans doute oublié ses clés au bureau.'),
        b('She was forced to forget her keys.', 'On l’a obligée à oublier ses clés.'),
        b('She ought to forget her keys tomorrow.', 'Elle devrait oublier ses clés demain.'),
      ], { fr: 'Son sac est encore ici : elle a dû oublier ses clés.', explain: b('Here a clue (the bag is still here) makes a dû express logical deduction.', 'Ici, un indice (le sac est encore là) donne à a dû un sens de déduction logique.') }),
      hear('Tu n’es pas obligé de porter une cravate pour cette réunion.', P.meaning, [
        b('A tie is optional.', 'La cravate est facultative.'),
        b('A tie is strictly forbidden.', 'La cravate est strictement interdite.'),
        b('You must wear a tie.', 'Vous devez porter une cravate.'),
      ]),
      sort(b('Obligation or probability?', 'Obligation ou probabilité ?'), [
        b('Obligation / Rule', 'Obligation / Règle'),
        b('Logical probability', 'Probabilité logique'),
      ], [
        ['Il doit être déjà minuit.', 1],
        ['Vous devez valider votre billet.', 0],
        ['Elle a dû se tromper d’adresse.', 1],
        ['Nous devons rendre les clés mardi.', 0],
        ['Ils doivent avoir faim après ce trajet.', 1],
        ['Tu dois éteindre ton téléphone en salle.', 0],
      ]),
      gap(P.complete, 'L’entrée est libre : vous ___ de réserver. En revanche, ___ fumer dans la cour.', [['n’êtes pas obligés', 'n’êtes pas obligé'], ['il ne faut pas']], {
        choices: [
          ['n’êtes pas obligés', 'ne devez pas', 'avez dû'],
          ['il ne faut pas', 'vous n’êtes pas obligé', 'il a fallu'],
        ],
        explain: b('No obligation = ne pas être obligé de; prohibition = il ne faut pas.', 'Absence d’obligation = ne pas être obligé de ; interdiction = il ne faut pas.'),
      }),
      pairs(P.match, [
        ['Il doit y avoir une erreur.', b('There is probably a mistake.', 'Il y a sans doute une erreur.')],
        ['Il faut du temps.', b('Time is needed.', 'Du temps est nécessaire.')],
        ['Il ne faut pas entrer.', b('Entering is forbidden.', 'Il est interdit d’entrer.')],
        ['Tu n’es pas obligé de venir.', b('Coming is optional for you.', 'Tu es libre de ne pas venir.')],
      ]),
      ord(P.order, 'Il a dû manquer son bus à cause de la pluie.', {
        tr: b('He must have missed his bus because of the rain.', 'Il a sans doute manqué son bus à cause de la pluie.'),
        extra: ['devait', 'faut'],
      }),
      dlg(b('Outside the closed bakery', 'Devant la boulangerie fermée'), b('Léa and Samir find the shutter down at noon.', 'Léa et Samir trouvent le rideau baissé à midi.'), [['Léa', 'f'], ['Samir', 'm']], [
        [0, 'Tiens, c’est fermé ! Pourtant il est à peine midi.', 'Hey, it’s closed! Yet it’s barely noon.'],
        [1, { options: ['Ils ont dû fermer plus tôt pour les travaux.', 'Ils n’ont pas été obligés de fermer.', 'Il ne faut pas acheter de pain ici.'], explain: b('With no sign, a dû expresses a logical guess.', 'Sans affiche, a dû exprime une supposition logique.') }],
        [0, 'Tu as raison. Il va falloir trouver une autre boulangerie.', 'You’re right. We’ll have to find another bakery.'],
      ]),
      say('Ce colis est lourd : il doit contenir tous les livres.', 'This parcel is heavy: it must contain all the books.'),
    ],
    [
      b('Devoir expresses obligation (action) or probability (clue/state).', 'Devoir exprime l’obligation (action) ou la probabilité (indice/état).'),
      b('Il faut states general necessity; devoir ties the obligation to a subject.', 'Il faut énonce une nécessité générale ; devoir lie l’obligation à un sujet.'),
      b('Il ne faut pas = forbidden; ne pas être obligé de = optional.', 'Il ne faut pas = interdit ; ne pas être obligé de = facultatif.'),
    ],
    [
      ['il ne faut pas', b('must not (prohibition)', 'interdiction formelle')],
      ['être obligé de', b('to have to (obligation)', 'être contraint de')],
      ['il doit être…', b('he/it is probably…', 'il est sans doute…')],
      ['a dû + infinitif', b('must have (deduction or past obligation)', 'a probablement / a été forcé de')],
    ],
  ),

  lesson(C, 2, ['polite-attenuation', 'attenuation-polie'],
    b('Softening requests and advice (je devrais, on pourrait, il faudrait)', 'Adoucir demandes et conseils (je devrais, on pourrait, il faudrait)'),
    b('Swap the blunt present tense for the conditional to advise, propose or ask without sounding bossy.', 'Remplacez le présent direct par le conditionnel pour conseiller, proposer ou demander sans paraître brusque.'),
    [
      b('Conjugate devoir, pouvoir and falloir in the conditional', 'Conjuguer devoir, pouvoir et falloir au conditionnel'),
      b('Use je devrais / tu devrais to give tactful advice', 'Employer je devrais / tu devrais pour conseiller avec tact'),
      b('Make gentle suggestions and polite requests with on pourrait and il faudrait', 'Faire des suggestions douces avec on pourrait et il faudrait'),
    ],
    13,
    [
      card(b('From blunt duty to gentle advice', 'Du devoir sec au conseil nuancé'), b('In French, **tu dois** or **il faut** can sound like an order. Using the **conditionnel présent** softens the tone into advice (**tu devrais** = you ought to), a gentle suggestion (**on pourrait** = we could), or a tactful requirement (**il faudrait** = it would be good to).\nDirect forms: **tu dois, vous pouvez, il faut**.\nSoftened forms: **tu devrais, vous pourriez, il faudrait**.', 'En français, **tu dois** ou **il faut** peuvent sembler autoritaires. Le **conditionnel présent** adoucit le ton en conseil (**tu devrais**), en proposition ouverte (**on pourrait**) ou en besoin formulé avec tact (**il faudrait**).\nFormes directes : **tu dois, vous pouvez, il faut**.\nFormes atténuées : **tu devrais, vous pourriez, il faudrait**.'), {
        table: {
          head: [b('Verb', 'Verbe'), b('Stem', 'Radical'), b('je / il / on', 'je / il / on'), b('nous / vous', 'nous / vous')],
          rows: [
            ['devoir', 'devr-', 'je devrais, il devrait', 'nous devrions, vous devriez'],
            ['pouvoir', 'pourr-', 'je pourrais, on pourrait', 'nous pourrions, vous pourriez'],
            ['falloir', 'faudr-', 'il faudrait', '—'],
          ],
        },
        ex: [
          ['Tu devrais te reposer un peu avant de conduire.', 'You ought to rest a bit before driving.'],
          ['On pourrait dîner dehors ce soir, qu’en dis-tu ?', 'We could have dinner out tonight, what do you think?'],
          ['Il faudrait vérifier ces chiffres avant l’envoi.', 'We should probably check these figures before sending.'],
        ],
      }),
      tip(b('Two r’s in pourrais, one r in devrais', 'Deux r à pourrais, un r à devrais'), b('Watch the spelling: **pouvoir** doubles the **r** (**je pourrais, vous pourriez**), whereas **devoir** and **falloir** keep a single **r** (**je devrais, il faudrait**).\nDouble r verbs: **pouvoir, voir, courir**.\nSingle r modals: **devoir, falloir, vouloir**.', 'Attention à l’orthographe : **pouvoir** double le **r** (**je pourrais, vous pourriez**), tandis que **devoir** et **falloir** gardent un seul **r** (**je devrais, il faudrait**).\nVerbes à deux r : **pouvoir, voir, courir**.\nModaux à un seul r : **devoir, falloir, vouloir**.'), {
        ex: [
          ['Pourriez-vous me rappeler vers seize heures ?', 'Could you call me back around four p.m.?'],
          ['Je devrais sans doute lui envoyer un message.', 'I should probably send him a message.'],
        ],
      }),
      conj('devoir', COND_PRES, [['je', 'devrais'], ['tu', 'devrais'], ['il / elle', 'devrait'], ['nous', 'devrions'], ['vous', 'devriez'], ['ils / elles', 'devraient']], { given: [0, 3] }),
      mc(P.best, [
        'Pourriez-vous relire cette page quand vous aurez un moment ?',
        'Vous devez relire cette page tout de suite.',
        'Il faut relire cette page avant ce soir.',
      ], { fr: 'Quel message est le plus poli pour demander un service à un collègue ?', explain: b('Pourriez-vous softens the request into an optional favor.', 'Pourriez-vous transforme la demande en service demandé poliment.') }),
      doc({
        look: 'email',
        title: b('Subject: Client presentation', 'Objet : Présentation client'),
        text: 'Bonjour Camille,\n\nMerci pour ce premier document, il est très clair.\nPour la diapositive 4, il faudrait peut-être simplifier le graphique.\nOn pourrait aussi ajouter un exemple concret à la fin.\nQu’en penses-tu ?\n\nBonne journée,\nMarc',
      }, b('Why does Marc use il faudrait and on pourrait?', 'Pourquoi Marc emploie-t-il il faudrait et on pourrait ?'), [
        b('To suggest improvements tactfully without imposing them', 'Pour proposer des améliorations avec tact sans les imposer'),
        b('To say the work is already too late to fix', 'Pour dire qu’il est déjà trop tard pour corriger'),
        b('To remind Camille of a strict legal rule', 'Pour rappeler à Camille une règle juridique stricte'),
      ]),
      gap(P.complete, 'Tu ___ (devoir) appeler le médecin. À ta place, je ___ (pouvoir) même prendre ma journée, mais il ___ (falloir) prévenir l’équipe.', [['devrais'], ['pourrais'], ['faudrait']], {
        hint: b('Use the present conditional of devoir, pouvoir and falloir.', 'Utilisez le conditionnel présent de devoir, pouvoir et falloir.'),
      }),
      sort(b('Order or polite suggestion?', 'Ordre direct ou suggestion polie ?'), [
        b('Direct obligation', 'Obligation directe'),
        b('Polite attenuation', 'Atténuation polie'),
      ], [
        ['On pourrait reporter la réunion.', 1],
        ['Vous devez signer ici.', 0],
        ['Il faudrait aérer la salle.', 1],
        ['Tu devrais parler moins vite.', 1],
        ['Il faut payer avant de sortir.', 0],
        ['Pourriez-vous fermer la fenêtre ?', 1],
      ]),
      pairs(P.match, [
        ['Tu devrais essayer.', b('You ought to try.', 'Je te conseille d’essayer.')],
        ['On pourrait marcher.', b('We could walk.', 'Je propose de marcher.')],
        ['Il faudrait partir.', b('It would be best to leave.', 'Il serait bon de partir.')],
        ['Pourriez-vous patienter ?', b('Could you wait a moment?', 'Auriez-vous l’amabilité d’attendre ?')],
      ]),
      ord(P.order, 'Pourriez-vous me transmettre le compte rendu ?', {
        tr: b('Could you forward me the minutes?', 'Pourriez-vous m’envoyer le compte rendu ?'),
        extra: ['pouvez', 'faudrait'],
      }),
      dict('On pourrait réserver une table pour demain, mais il faudrait téléphoner ce soir.'),
      say('À mon avis, tu devrais accepter cette proposition.', 'In my opinion, you ought to accept this offer.'),
    ],
    [
      b('Present conditional softens commands into advice (devrais), offers (pourrais) and needs (faudrait).', 'Le conditionnel présent adoucit les ordres en conseil (devrais), proposition (pourrais) et besoin (faudrait).'),
      b('Pouvoir doubles the r (je pourrais); devoir and falloir keep one r (je devrais, il faudrait).', 'Pouvoir prend deux r (je pourrais) ; devoir et falloir gardent un r (je devrais, il faudrait).'),
      b('On pourrait + infinitive is the natural French way to pitch an idea smoothly.', 'On pourrait + infinitif est la tournure naturelle pour lancer une idée en douceur.'),
    ],
    [
      ['tu devrais', b('you ought to / you should', 'tu ferais bien de')],
      ['on pourrait', b('we could (suggestion)', 'nous pourrions (proposition)')],
      ['il faudrait', b('one should / we ought to', 'il serait souhaitable de')],
      ['pourriez-vous', b('could you (polite)', 'auriez-vous la gentillesse de')],
    ],
  ),

  lesson(C, 3, ['past-regret-counterfactual', 'regret-et-reproche-passe'],
    b('Past regrets and missed necessities (j’aurais dû, il aurait fallu)', 'Regrets et reproches au passé (j’aurais dû, il aurait fallu)'),
    b('Look back at what did not happen: j’aurais dû, tu n’aurais pas dû, on aurait pu, il aurait fallu.', 'Revenez sur ce qui ne s’est pas produit : j’aurais dû, tu n’aurais pas dû, on aurait pu, il aurait fallu.'),
    [
      b('Form the past conditional of devoir, pouvoir and falloir', 'Former le conditionnel passé de devoir, pouvoir et falloir'),
      b('Express regret, reproach and missed opportunity', 'Exprimer le regret, le reproche et l’occasion manquée'),
      b('Contrast j’ai dû (real) with j’aurais dû (unrealized)', 'Opposer j’ai dû (réel) à j’aurais dû (irréel)'),
    ],
    13,
    [
      card(b('Conditionnel passé: what should have happened', 'Conditionnel passé : ce qui aurait dû se passer'), b('To express a regret, a reproach or an unrealized past necessity, combine **avoir** in the conditional (**j’aurais, tu aurais, il aurait…**) with the past participle (**dû, pu, fallu**) + infinitive.\nRegret and reproach: **j’aurais dû, tu n’aurais pas dû**.\nMissed possibility: **on aurait pu, il aurait fallu**.', 'Pour exprimer un regret, un reproche ou une nécessité passée non réalisée, combinez **avoir** au conditionnel (**j’aurais, tu aurais, il aurait…**) avec le participe passé (**dû, pu, fallu**) + infinitif.\nRegret et reproche : **j’aurais dû, tu n’aurais pas dû**.\nPossibilité manquée : **on aurait pu, il aurait fallu**.'), {
        table: {
          head: [b('Form', 'Forme'), b('Meaning', 'Sens'), b('Example', 'Exemple')],
          rows: [
            ['j’aurais dû + inf.', b('I should have (didn’t)', 'j’avais intérêt à (non fait)'), 'J’aurais dû partir plus tôt.'],
            ['tu n’aurais pas dû + inf.', b('you shouldn’t have (did)', 'c’était une erreur de'), 'Tu n’aurais pas dû lui répondre ainsi.'],
            ['on aurait pu + inf.', b('we could have (didn’t)', 'c’était possible (non fait)'), 'On aurait pu éviter cet embouteillage.'],
            ['il aurait fallu + inf. / que', b('it would have been needed', 'cela aurait été nécessaire'), 'Il aurait fallu réserver la veille.'],
          ],
        },
        ex: [
          ['J’aurais dû noter son numéro avant qu’il parte.', 'I should have written down his number before he left.'],
          ['Il aurait fallu prévenir les voisins du bruit.', 'We should have warned the neighbors about the noise.'],
        ],
      }),
      trap(b('J’ai dû vs j’aurais dû', 'J’ai dû ou j’aurais dû ?'), b('Do not mix up the **passé composé** and the **conditionnel passé**! **J’ai dû partir** means I actually left (or probably left). **J’aurais dû partir** means I stayed — and I regret it now.\nRealized past: **j’ai dû, j’ai pu, il a fallu**.\nUnrealized regret: **j’aurais dû, j’aurais pu, il aurait fallu**.', 'Ne confondez pas **passé composé** et **conditionnel passé** ! **J’ai dû partir** signifie que je suis vraiment parti (ou sans doute). **J’aurais dû partir** signifie que je suis resté — et je le regrette maintenant.\nPassé réalisé : **j’ai dû, j’ai pu, il a fallu**.\nRegret irréel : **j’aurais dû, j’aurais pu, il aurait fallu**.'), {
        ex: [
          ['J’ai dû annuler ma visite à cause de la fièvre.', 'I had to cancel my visit because of my fever.'],
          ['J’aurais dû annuler ma visite, j’étais épuisé.', 'I should have canceled my visit, I was exhausted.'],
        ],
      }),
      mc(P.meaning, [
        b('He did not check the lock, and he regrets it.', 'Il n’a pas vérifié la serrure, et il le regrette.'),
        b('He checked the lock twice before leaving.', 'Il a vérifié la serrure deux fois avant de partir.'),
        b('He will check the lock tomorrow.', 'Il vérifiera la serrure demain.'),
      ], { fr: 'J’aurais dû vérifier la serrure avant de sortir.' }),
      hear('Tu n’aurais pas dû dépenser autant pour un simple cadeau.', P.meaning, [
        b('The speaker thinks you spent too much.', 'La personne trouve que tu as trop dépensé.'),
        b('The speaker advises you not to buy a gift yet.', 'La personne te conseille de ne pas encore acheter de cadeau.'),
        b('You refused to pay for the gift.', 'Tu as refusé de payer le cadeau.'),
      ]),
      sort(b('Did it actually happen?', 'L’action a-t-elle eu lieu ?'), [
        b('Yes / Probably happened', 'Oui / A sans doute eu lieu'),
        b('No (regret or missed option)', 'Non (regret ou occasion manquée)'),
      ], [
        ['Il a fallu recommencer.', 0],
        ['Il aurait fallu insister.', 1],
        ['J’aurais pu accepter.', 1],
        ['J’ai dû payer l’amende.', 0],
        ['Tu n’aurais pas dû partir.', 1],
        ['On a pu finir à temps.', 0],
      ]),
      gap(P.complete, 'La salle était complète ! On ___ (devoir) arriver une demi-heure avant. Il ___ (falloir) acheter les billets en ligne.', [['aurait dû'], ['aurait fallu']], {
        explain: b('Notice dû keeps its circumflex accent in the masculine singular, whereas fallu and pu take no accent.', 'Notez que dû garde son accent circonflexe au masculin singulier, alors que fallu et pu n’ont pas d’accent.'),
      }),
      pairs(P.match, [
        ['J’aurais dû me taire.', b('I should have kept quiet.', 'J’ai parlé à tort.')],
        ['On aurait pu gagner.', b('We could have won.', 'La victoire était possible, mais perdue.')],
        ['Il aurait fallu attendre.', b('We should have waited.', 'Il était préférable de patienter.')],
        ['Tu n’aurais pas dû mentir.', b('You shouldn’t have lied.', 'Tu aurais dû dire la vérité.')],
      ]),
      ord(P.order, 'Nous n’aurions pas dû attendre la dernière minute !', {
        tr: b('We shouldn’t have waited until the last minute!', 'Nous n’aurions vraiment pas dû attendre si tard !'),
        extra: ['avons', 'fallait'],
      }),
      dlg(b('Missed connection', 'Correspondance manquée'), b('Nadia and Hugo arrive at the platform just as the train pulls away.', 'Nadia et Hugo arrivent sur le quai au moment où le train démarre.'), [['Nadia', 'f2'], ['Hugo', 'm']], [
        [0, 'Le train vient de partir sous nos yeux !', 'The train just left right in front of us!'],
        [1, { options: ['J’aurais dû commander un taxi dix minutes plus tôt.', 'J’ai dû commander un taxi demain.', 'Je devrais arriver hier soir.'], explain: b('J’aurais dû expresses Hugo’s regret about a past mistake.', 'J’aurais dû exprime le regret d’Hugo face à une erreur passée.') }],
        [0, 'C’est vrai, il aurait fallu prévoir la circulation du vendredi.', 'True, we should have planned for Friday traffic.'],
      ]),
      dict('Tu aurais pu m’appeler avant de décider, il aurait fallu consulter toute l’équipe.'),
      write(
        b('Write a short message about a small mishap.', 'Rédigez un court message sur un petit contretemps.'),
        b('Tell a friend about a minor mistake (missed train, forgotten umbrella, bad purchase) using j’aurais dû, on aurait pu and il aurait fallu.', 'Racontez à un ami une petite erreur (train manqué, parapluie oublié, mauvais achat) en utilisant j’aurais dû, on aurait pu et il aurait fallu.'),
        25, 55,
        [
          b('Use j’aurais dû + infinitive', 'Utiliser j’aurais dû + infinitif'),
          b('Include on aurait pu or il aurait fallu', 'Inclure on aurait pu ou il aurait fallu'),
          b('Keep past time coherent', 'Garder un récit cohérent au passé'),
        ],
        'Quelle matinée ! Je suis parti sous l’orage sans parapluie. J’aurais dû regarder la météo avant de sortir. On aurait pu prendre le métro ensemble, mais j’étais déjà en retard. Franchement, il aurait fallu préparer mon sac la veille.',
        { phrases: ['J’aurais dû…', 'Tu n’aurais pas dû…', 'On aurait pu…', 'Il aurait fallu…'] },
      ),
    ],
    [
      b('Conditionnel passé (aurais dû / pu / fallu) expresses unfulfilled regrets and reproaches.', 'Le conditionnel passé (aurais dû / pu / fallu) exprime regrets et reproches non réalisés.'),
      b('Only dû takes a circumflex accent; pu and fallu take none.', 'Seul dû porte un accent circonflexe ; pu et fallu n’en prennent pas.'),
      b('Negation wraps the auxiliary: tu n’aurais pas dû + infinitive.', 'La négation encadre l’auxiliaire : tu n’aurais pas dû + infinitif.'),
    ],
    [
      ['j’aurais dû', b('I should have', 'j’aurais bien fait de')],
      ['tu n’aurais pas dû', b('you shouldn’t have', 'tu as eu tort de')],
      ['il aurait fallu', b('it would have been necessary', 'il eût fallu / cela aurait été nécessaire')],
      ['on aurait pu', b('we could have', 'il était possible de')],
    ],
  ),
];

export default lessons;
