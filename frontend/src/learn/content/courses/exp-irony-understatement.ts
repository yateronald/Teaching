import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At C1 level, what makes French sound genuinely cultivated and sharp is rarely exaggeration—it is understatement, irony and subtext. Master fifteen classic expressions of litotes, futile effort, open secrets and wry restraint so you never miss dry praise, polite dismissal or subtle sarcasm in literature, press and conversation.',
    'Au niveau C1, la finesse du français tient rarement à l’emphase : elle passe par la litote, l’ironie et le sous-entendu. Maîtrisez quinze expressions classiques — éloge détourné, efforts vains, secrets de Polichinelle et sourire en coin — pour ne plus jamais manquer une louange discrète, une critique feutrée ou une ironie mordante.',
  ),
  outcomes: [
    b('Decode French negative understatement (litotes) for praise, mediocrity and reassurance', 'Décoder la litote française entre éloge discret, réserve polie et relativisation'),
    b('Distinguish open secrets, futile gestures, false alarms and premature boasts', 'Distinguer secret de Polichinelle, coup d’épée dans l’eau, fausse alerte et précipitation'),
    b('Recognise and craft biting yet polite C1 irony in speech and editorial prose', 'Reconnaître et manier une ironie fine et maîtrisée à l’oral comme à l’écrit C1'),
  ],
};

const C = 'exp-irony-understatement';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['understatement-and-praise', 'litote-et-eloge-mesure'],
    b('Understatement, Faint Praise & Reassurance', 'Litote, réserve polie et relativisation'),
    b('Hear what French really means behind negative phrasing—from hearty praise to lukewarm critique and calm perspective.', 'Entendre ce que dit vraiment la forme négative en français : éloge enthousiaste, critique tiède ou relativisation rassurante.'),
    [
      b('Decode negative expressions that actually signal high praise or sharp denial', 'Décoder les tournures négatives exprimant éloge appuyé ou démenti ferme'),
      b('Tell genuine compliment apart from lukewarm dismissal', 'Distinguer compliment détourné et critique polie d’un résultat banal'),
      b('Use five classic C1 understatement idioms naturally', 'Employer cinq expressions classiques de litote et de mesure'),
    ],
    13,
    [
      card(
        b('Saying less to suggest more', 'Dire moins pour suggérer davantage'),
        b(
          'French loves **la litote**—using a negative frame to deliver praise, polite disappointment, or reassurance with dry charm. Take care: **ce n’est pas piqué des hannetons** is *enthusiastic praise*, whereas **ça ne casse pas trois pattes à un canard** is *underwhelmed dismissal*!\nPraise & denial: **ce n’est pas piqué des hannetons, tant s’en faut**.\nMediocrity & perspective: **ça ne casse pas trois pattes à un canard, il n’y a pas de quoi fouetter un chat, ce n’est pas la mer à boire**.',
          'Le français affectionne **la litote** : une tournure négative qui exprime avec malice un vif compliment, une déception feutrée ou du bon sens. Attention au contraste : **ce n’est pas piqué des hannetons** est un *éloge chaleureux*, tandis que **ça ne casse pas trois pattes à un canard** juge une œuvre *banale* !\nÉloge et démenti : **ce n’est pas piqué des hannetons, tant s’en faut**.\nRelativisation : **ça ne casse pas trois pattes à un canard, il n’y a pas de quoi fouetter un chat, ce n’est pas la mer à boire**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Real stance', 'Sens réel'), b('Meaning', 'Explication')],
            rows: [
              ['ce n’est pas piqué des hannetons', b('Warm praise', 'Éloge vif'), b('it’s remarkable / top-notch', 'c’est excellent, hors du commun')],
              ['ça ne casse pas trois pattes à un canard', b('Lukewarm critique', 'Critique tiède'), b('it’s nothing special', 'c’est banal, sans grand éclat')],
              ['il n’y a pas de quoi fouetter un chat', b('Dismissing drama', 'Dédramatisation'), b('it’s no big deal / nothing serious', 'ce n’est vraiment pas grave')],
              ['tant s’en faut', b('Emphatic denial', 'Démenti net'), b('far from it', 'il s’en faut de beaucoup')],
              ['ce n’est pas la mer à boire', b('Reassurance', 'Encouragement'), b('it’s not impossible / quite doable', 'ce n’est pas si difficile à accomplir')],
            ],
          },
          ex: [
            ['Goûte ce clafoutis aux cerises : il n’est vraiment pas piqué des hannetons !', 'Taste this cherry clafoutis: it really is top-notch!'],
            ['Honnêtement, le dernier roman de cet auteur ne casse pas trois pattes à un canard.', 'Honestly, that author’s latest novel is nothing to write home about.'],
            ['La réforme n’a pas résolu la pénurie de logements, tant s’en faut.', 'The reform has not solved the housing shortage, far from it.'],
          ],
        },
      ),
      tip(
        b('How intonation splits praise from dismissal', 'L’intonation qui sépare l’éloge de la réserve'),
        b(
          'Although both look negative on paper, **ce n’est pas piqué des hannetons** is always spoken with admiring warmth (originally praising crisp wood or fine wine untouched by beetles/grubs), while **ça ne casse pas trois pattes à un canard** drops in pitch with a mild shrug. Note too that **tant s’en faut** thrives in elevated written prose right after a negative clause.',
          'Bien que toutes deux soient négatives, **ce n’est pas piqué des hannetons** se dit avec chaleur admirative (du bois ou du vin intact, épargné par les insectes), tandis que **ça ne casse pas trois pattes à un canard** marque une moue poliment déçue. Quant à **tant s’en faut**, il brille à l’écrit soutenu en fin de phrase négative.',
        ),
      ),
      flash(
        b('Five understatement & perspective idioms', 'Cinq expressions de litote et de nuance'),
        [
          ['ce n’est pas piqué des hannetons', b('it’s really impressive / first-rate', 'c’est remarquable, excellent (litote élogieuse)')],
          ['ça ne casse pas trois pattes à un canard', b('it’s nothing special / pretty ordinary', 'c’est médiocre ou sans originalité')],
          ['il n’y a pas de quoi fouetter un chat', b('it’s no big deal / harmless slip', 'ce n’est pas grave, inutile d’en faire un drame')],
          ['tant s’en faut', b('far from it', 'bien au contraire, il s’en faut de beaucoup')],
          ['ce n’est pas la mer à boire', b('it’s not an impossible task', 'ce n’est pas si difficile à réaliser')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('The film looks fairly ordinary and failed to impress her.', 'Le film lui a semblé assez banal et ne l’a pas vraiment convaincue.'),
          b('The film was a masterpiece that stunned every critic.', 'Le film était un chef-d’œuvre salué par toute la critique.'),
          b('The film featured an unforgettable wildlife documentary on ducks.', 'Le film proposait un documentaire animalier remarquable sur les canards.'),
          b('The film lasted far longer than three hours.', 'Le film a duré largement plus de trois heures.'),
        ],
        {
          fr: '« Le casting est prestigieux, mais entre nous, le scénario ne casse pas trois pattes à un canard. »',
          explain: b('Ne pas casser trois pattes à un canard means something is unimpressive or run-of-the-mill.', 'Ne pas casser trois pattes à un canard qualifie une œuvre banale ou décevante.'),
        },
      ),
      mc(
        P.best,
        [
          'Deux erreurs mineures de virgule sur dix pages ? Allons, il n’y a vraiment pas de quoi fouetter un chat.',
          'Deux erreurs mineures de virgule sur dix pages ? Allons, ce n’est pas piqué des hannetons.',
          'Deux erreurs mineures de virgule sur dix pages ? Allons, ça ne casse pas trois pattes à un canard.',
          'Deux erreurs mineures de virgule sur dix pages ? Allons, tant s’en faut.',
        ],
        {
          fr: 'Un collègue s’inquiète excessivement d’une broutille dans son rapport :',
          explain: b('Il n’y a pas de quoi fouetter un chat reassures someone making a mountain out of a molehill.', 'Il n’y a pas de quoi fouetter un chat relativise une petite faute sans gravité.'),
        },
      ),
      pairs(
        P.match,
        [
          ['ce n’est pas piqué des hannetons', b('it’s truly remarkable / top-notch', 'c’est vraiment réussi, remarquable')],
          ['ça ne casse pas trois pattes à un canard', b('it’s mediocre / nothing special', 'c’est quelconque, sans grand génie')],
          ['il n’y a pas de quoi fouetter un chat', b('it’s nothing to fuss over', 'ce n’est pas grave du tout')],
          ['tant s’en faut', b('far from it', 'il s’en faut de beaucoup')],
          ['ce n’est pas la mer à boire', b('it’s completely manageable', 'ce n’est pas insurmontable')],
        ],
      ),
      gap(
        P.complete,
        'Rédiger cette note de synthèse ___, même si l’exercice n’est pas toujours aussi rapide qu’on le croit, ___.',
        [['ce n’est pas la mer à boire'], ['tant s’en faut']],
        {
          choices: [
            ['ce n’est pas la mer à boire', 'il n’y a pas de quoi fouetter un chat', 'ce n’est pas piqué des hannetons'],
            ['tant s’en faut', 'à un canard', 'des hannetons'],
          ],
          explain: b('Reassure that it is doable (ce n’est pas la mer à boire), then add an emphatic denial of effortless speed (tant s’en faut).', 'On rassure d’abord (ce n’est pas la mer à boire), puis on nuance nettement par tant s’en faut.'),
        },
      ),
      hear(
        'Le premier essai de ce jeune chef ne cassait pas trois pattes à un canard, mais sa nouvelle carte d’automne, franchement, ce n’est pas piqué des hannetons !',
        b('How does the critic rate the chef’s new autumn menu compared to his first attempt?', 'Comment le critique juge-t-il la nouvelle carte par rapport au premier essai ?'),
        [
          b('The first attempt was ordinary, whereas the new autumn menu is truly outstanding.', 'Le premier essai était quelconque, mais la nouvelle carte est remarquable.'),
          b('Both menus disappointed the critic for lacking originality.', 'Les deux cartes ont déçu le critique par leur banalité.'),
          b('The first menu was impressive, while the new one fell short.', 'La première carte était brillante, mais la nouvelle est médiocre.'),
          b('The critic refused to taste the autumn menu because of an insect incident.', 'Le critique a refusé de goûter la carte d’automne.'),
        ],
      ),
      dict('Rassurez-vous, ce n’est pas la mer à boire et il n’y a pas de quoi fouetter un chat.', {
        hint: b('Watch hyphenated verb inversion in Rassurez-vous and infinitive boire / fouetter.', 'Attention au trait d’union de Rassurez-vous et aux infinitifs boire et fouetter.'),
      }),
      say(
        'Sa démonstration n’est pas piquée des hannetons, même si le débat n’est pas clos, tant s’en faut.',
        'Her demonstration is truly impressive, even though the debate is not over, far from it.',
      ),
    ],
    [
      b('ce n’est pas piqué des hannetons = genuine praise; ça ne casse pas trois pattes à un canard = nothing special.', 'ce n’est pas piqué des hannetons = excellent ; ça ne casse pas trois pattes à un canard = banal.'),
      b('il n’y a pas de quoi fouetter un chat = no big deal; ce n’est pas la mer à boire = quite doable.', 'il n’y a pas de quoi fouetter un chat = sans gravité ; ce n’est pas la mer à boire = pas si difficile.'),
      b('tant s’en faut = far from it (elevated C1 closing negation).', 'tant s’en faut = bien au contraire, il s’en faut de beaucoup.'),
    ],
    [
      ['ce n’est pas piqué des hannetons', b('it’s remarkable / top-notch', 'c’est excellent, hors pair')],
      ['ça ne casse pas trois pattes à un canard', b('it’s nothing special / ordinary', 'c’est banal, sans éclat')],
      ['il n’y a pas de quoi fouetter un chat', b('it’s no big deal', 'ce n’est vraiment pas grave')],
      ['tant s’en faut', b('far from it', 'il s’en faut de beaucoup')],
      ['ce n’est pas la mer à boire', b('it’s not that hard / quite doable', 'ce n’est pas insurmontable')],
    ],
  ),

  lesson(
    C,
    2,
    ['open-secrets-and-futility', 'secrets-et-vanite-des-efforts'],
    b('Open Secrets, Futile Efforts & False Alarms', 'Secrets de Polichinelle et efforts vains'),
    b('Expose fake secrets, wasted gestures, unheeded warnings, repeated false alarms and premature victory laps.', 'Démasquer faux secrets, gestes inopérants, avertissements inaudibles, fausses alertes et triomphes prématurés.'),
    [
      b('Contrast ineffective actions (coup d’épée dans l’eau) with ignored counsel (prêcher dans le désert)', 'Opposer geste sans effet (coup d’épée dans l’eau) et appel ignoré (prêcher dans le désert)'),
      b('Spot spelling and meaning traps (Polichinelle, crier au loup, vendre la peau de l’ours)', 'Éviter pièges d’orthographe et de sens (Polichinelle, crier au loup, vendre la peau de l’ours)'),
      b('Build and sort C1 idioms of irony and illusion cleanly', 'Classer et assembler ces expressions d’ironie et d’illusion'),
    ],
    13,
    [
      card(
        b('Illusions, wasted efforts & premature claims', 'Illusions, gestes vains et précipitation'),
        b(
          'Irony often punctures self-importance: pretending a widely known fact is confidential (**un secret de Polichinelle**), celebrating victory too early (**vendre la peau de l’ours**), or warning nobody listens to (**prêcher dans le désert**).\nFutility: **un coup d’épée dans l’eau, prêcher dans le désert**.\nIllusion & excess: **un secret de Polichinelle, crier au loup, vendre la peau de l’ours**.',
          'L’ironie vise volontiers la fausse solennité : prétendre cacher ce que chacun sait (**un secret de Polichinelle**), crier victoire trop tôt (**vendre la peau de l’ours**) ou parler sans écho (**prêcher dans le désert**).\nVanité de l’effort : **un coup d’épée dans l’eau, prêcher dans le désert**.\nIllusion et précipitation : **un secret de Polichinelle, crier au loup, vendre la peau de l’ours**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Target of irony', 'Cible ironique'), b('Meaning', 'Sens')],
            rows: [
              ['un secret de Polichinelle', b('fake secrecy', 'fausse confidentialité'), b('an open secret everyone already knows', 'secret connu de tout le monde')],
              ['un coup d’épée dans l’eau', b('zero real impact', 'action sans effet'), b('a futile effort leaving no trace', 'tentative totalement inefficace')],
              ['prêcher dans le désert', b('unheard warning', 'avertissement inécouté'), b('to preach in the wilderness / talk to a wall', 'parler sans être ni écouté ni suivi')],
              ['crier au loup', b('false alarms', 'fausses alertes répétées'), b('to cry wolf', 'alarmer à tort jusqu’à perdre toute crédibilité')],
              ['vendre la peau de l’ours', b('premature boast', 'triomphe prématuré'), b('to count one’s chickens before they hatch', 'disposer d’un succès encore incertain')],
            ],
          },
          ex: [
            ['Sa démission prochaine était devenue un secret de Polichinelle dans toute la rédaction.', 'His upcoming resignation had become an open secret across the whole newsroom.'],
            ['Sans sanctions réelles, cette circulaire n’est qu’un coup d’épée dans l’eau.', 'Without real sanctions, this directive is merely a futile gesture.'],
            ['Ne vendez pas la peau de l’ours avant d’avoir reçu la réponse écrite du jury.', 'Don’t count your chickens before getting the jury’s written reply.'],
          ],
        },
      ),
      trap(
        b('Futility vs. ignored warning vs. premature boast', 'Geste inopérant, parole inécoutée et hâte imprudente'),
        b(
          'Do not treat **un coup d’épée dans l’eau** and **prêcher dans le désert** as interchangeable: the first highlights an *action* that produces zero effect (like slicing water), whereas the second highlights a *speaker* whose repeated advice falls on deaf ears. Note also the capital **P** in **Polichinelle** (the loud-mouthed *commedia dell’arte* character who whispers "secrets" on stage) and that **vendre la peau de l’ours** often implies *avant de l’avoir tué*.',
          'Ne confondez pas **coup d’épée dans l’eau** (une *action* sans aucune prise sur le réel) et **prêcher dans le désert** (une *parole* juste mais inécoutée). Notez la majuscule à **Polichinelle** (personnage théâtral incapable de garder un secret) et l’ellipse fréquente de *avant de l’avoir tué* dans **vendre la peau de l’ours**.',
        ),
      ),
      flash(
        b('Five open-secret & futility idioms', 'Cinq expressions de faux secret et de vanité'),
        [
          ['un secret de Polichinelle', b('an open secret known to all', 'un faux secret que tout le monde connaît')],
          ['un coup d’épée dans l’eau', b('a futile effort with zero impact', 'une action vaine, sans aucun effet')],
          ['prêcher dans le désert', b('to talk to deaf ears / preach in vain', 'parler ou alerter sans être écouté')],
          ['crier au loup', b('to cry wolf (repeated false alarms)', 'lancer de fausses alertes à répétition')],
          ['vendre la peau de l’ours', b('to celebrate / claim victory prematurely', 'se réjouir trop tôt d’un succès incertain')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('Everyone in the ministry already knew who would be appointed.', 'Tout le monde au ministère savait déjà qui allait être nommé.'),
          b('The appointment was kept strictly confidential until midnight.', 'La nomination est restée strictement confidentielle jusqu’à minuit.'),
          b('The ministry cancelled the appointment at the last moment.', 'Le ministère a annulé la nomination à la dernière minute.'),
          b('Only two senior advisors knew the real candidate’s name.', 'Seuls deux conseillers connaissaient le nom du véritable candidat.'),
        ],
        {
          fr: '« La nomination du prochain directeur ? Allons, c’est un secret de Polichinelle depuis trois semaines ! »',
          explain: b('Un secret de Polichinelle is an open secret pretending to be confidential when everyone knows it.', 'Un secret de Polichinelle désigne un faux mystère déjà connu de tous.'),
        },
      ),
      mc(
        P.best,
        [
          'À force de crier au loup à chaque variation d’un centime, cet analyste n’est plus pris au sérieux.',
          'À force de vendre la peau de l’ours à chaque variation d’un centime, cet analyste garde son calme.',
          'À force de prêcher dans le désert, cet analyste a inventé une crise imaginaire.',
          'À force de fouetter un chat, cet analyste a trouvé un secret de Polichinelle.',
        ],
        {
          fr: 'Vous critiquez un commentateur qui annonce une crise majeure chaque semaine sans fondement :',
          explain: b('Crier au loup describes raising repeated false alarms until nobody trusts your warnings.', 'Crier au loup désigne le fait de lancer sans cesse de fausses alertes et de perdre toute crédibilité.'),
        },
      ),
      sort(
        b('Sort each expression by its core tone and meaning.', 'Classez chaque expression selon son sens dominant.'),
        [b('Understatement & perspective', 'Litote et relativisation'), b('Illusion, futility & haste', 'Illusion, vanité et précipitation')],
        [
          ['ça ne casse pas trois pattes à un canard', 0],
          ['un secret de Polichinelle', 1],
          ['il n’y a pas de quoi fouetter un chat', 0],
          ['un coup d’épée dans l’eau', 1],
          ['ce n’est pas la mer à boire', 0],
          ['vendre la peau de l’ours', 1],
        ],
      ),
      gap(
        P.complete,
        'Tout le secteur connaît déjà le rachat prévu : c’est un secret de ___ ; ces conférences de presse tardives sont donc un coup d’___ dans l’eau.',
        ['Polichinelle', 'épée'],
        {
          tr: 'The whole sector already knows about the planned takeover: it’s an open secret; these late press conferences are therefore a futile gesture.',
          hint: b('Two single nouns: secret de ___ / coup d’___ dans l’eau.', 'Deux noms simples : secret de ___ / coup d’___ dans l’eau.'),
        },
      ),
      ord(
        P.order,
        'Il a prêché dans le désert pendant dix ans avant que les élus ne l’écoutent.',
        {
          tr: 'He preached in the wilderness for ten years before elected officials finally listened to him.',
          extra: ['loup', 'ours'],
          explain: b('Notice avant que + subjunctive with ne explétif (ne l’écoutent) in formal C1 French.', 'Notez la tournure soutenue avant que + subjonctif avec ne explétif (ne l’écoutent).'),
        },
      ),
      hear(
        'Le directeur fête déjà la signature sur les réseaux sociaux, mais nos juristes pensent qu’il vend la peau de l’ours un peu vite : sans clause d’application réelle, ce texte ne sera qu’un coup d’épée dans l’eau.',
        b('What two flaws do the lawyers point out?', 'Quelles deux faiblesses les juristes soulignent-ils ?'),
        [
          b('The director is celebrating prematurely and the text may have zero practical effect.', 'Le directeur crie victoire trop tôt et le texte risque de rester sans effet réel.'),
          b('Everyone already knew the secret terms and nobody listened to the lawyers.', 'Tout le monde connaissait l’accord et personne n’a écouté les juristes.'),
          b('The lawyers accuse the director of crying wolf over minor legal clauses.', 'Les juristes reprochent au directeur de crier au loup sur des clauses mineures.'),
          b('The director kept the entire agreement secret until final ratification.', 'Le directeur a gardé l’accord secret jusqu’à la ratification finale.'),
        ],
        { voice: 'f2' },
      ),
      say(
        'Inutile de crier au loup ni de vendre la peau de l’ours : gardons la tête froide devant ce secret de Polichinelle.',
        'No need to cry wolf or count our chickens early: let’s keep a cool head facing this open secret.',
      ),
    ],
    [
      b('un secret de Polichinelle = open secret; vendre la peau de l’ours = celebrate prematurely.', 'un secret de Polichinelle = faux secret ; vendre la peau de l’ours = crier victoire trop tôt.'),
      b('un coup d’épée dans l’eau = futile action; prêcher dans le désert = speak without being heard.', 'un coup d’épée dans l’eau = effort inopérant ; prêcher dans le désert = parler sans écho.'),
      b('crier au loup = raise repeated false alarms and lose credibility.', 'crier au loup = lancer de fausses alertes jusqu’à ne plus être cru.'),
    ],
    [
      ['un secret de Polichinelle', b('an open secret', 'un faux secret connu de tous')],
      ['un coup d’épée dans l’eau', b('a futile effort with zero effect', 'une action vaine et sans résultat')],
      ['prêcher dans le désert', b('to preach in the wilderness / go unheeded', 'parler ou alerter sans être écouté')],
      ['crier au loup', b('to cry wolf', 'lancer de fausses alertes à répétition')],
      ['vendre la peau de l’ours', b('to count one’s chickens too early', 'se féliciter trop vite d’un succès incertain')],
    ],
  ),

  lesson(
    C,
    3,
    ['quiet-amusement-and-biting-irony', 'ironie-fine-et-fausse-naivete'],
    b('Quiet Amusement, Coyness & Biting Irony', 'Rire sous cape, réserve et ironie fine'),
    b('Read hidden amusement, picky reluctance, risk-averse hedging, dramatic timing and mock innocence in refined French style.', 'Saisir amusement discret, réticence précieuse, prudence calculée, sens du rythme et fausse naïveté en français soutenu.'),
    [
      b('Distinguish quiet amusement (rire sous cape) from false innocence (jouer les innocents)', 'Distinguer amusement discret (rire sous cape) et fausse naïveté (jouer les innocents)'),
      b('Decode hedging, coy refusal and calculated pacing in C1 dialogue', 'Décoder prudence, refus feutré et art du suspens dans un dialogue C1'),
      b('Write a polished ironic C1 review or satirical column excerpt', 'Rédiger une critique ou chronique C1 teintée d’ironie élégante'),
    ],
    13,
    [
      card(
        b('Dry wit, reluctance & feigned innocence', 'Esprit pince-sans-rire et sous-entendus'),
        b(
          'High-register French irony thrives on restraint: smiling inwardly at someone’s blunder (**rire sous cape**), pacing a reveal so the punchline lands (**ménager ses effets**), refusing cautiously to commit (**ne pas se mouiller**), or acting amazed by a scandal one helped spark (**jouer les innocents**).\nAmusement & pacing: **rire sous cape, ménager ses effets**.\nCaution & stance: **faire la fine bouche, ne pas se mouiller, jouer les innocents**.',
          'L’ironie française de haut niveau joue sur la retenue : sourire en secret d’un faux pas (**rire sous cape**), doser son récit pour frapper juste (**ménager ses effets**), éviter tout engagement risqué (**ne pas se mouiller**) ou feindre l’étonnement (**jouer les innocents**).\nAmusement et art du récit : **rire sous cape, ménager ses effets**.\nPrudence et feinte : **faire la fine bouche, ne pas se mouiller, jouer les innocents**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Attitude', 'Attitude'), b('Meaning', 'Sens')],
            rows: [
              ['rire sous cape', b('secret amusement', 'amusement discret'), b('to laugh up one’s sleeve', 'se moquer discrètement sans rien laisser voir')],
              ['faire la fine bouche', b('hard to please / coy', 'dédain affecté'), b('to turn up one’s nose / be picky', 'se montrer difficile ou hésitant devant une offre')],
              ['ne pas se mouiller', b('risk-averse hedging', 'prudence calculée'), b('to play it safe / avoid taking a stand', 'refuser de prendre risque ou parti')],
              ['ménager ses effets', b('rhetorical timing', 'sens dramatique'), b('to pace one’s delivery / save punchlines', 'préparer progressivement une révélation marquante')],
              ['jouer les innocents', b('mock naivety', 'fausse ingénuité'), b('to play innocent / feign surprise', 'feindre de ne rien savoir ou de n’y être pour rien')],
            ],
          },
          ex: [
            ['En écoutant son rival s’emmêler dans les chiffres, elle riait doucement sous cape.', 'Listening to her rival tangle up the figures, she laughed quietly up her sleeve.'],
            ['Après avoir exigé une place au conseil, il ne faudrait pas faire la fine bouche devant l’offre.', 'After demanding a seat on the board, one shouldn’t turn up one’s nose at the offer.'],
            ['L’oratrice sait ménager ses effets : elle garde son exemple le plus incisif pour la dernière minute.', 'The speaker knows how to pace her delivery: she saves her sharpest example for the final minute.'],
          ],
        },
      ),
      culture(
        b('L’art de la pointe sèche: restraint as sharper wit', 'La pointe sèche : la retenue plus mordante que l’excès'),
        b(
          'In French literary criticism, cinema columns and salon conversation, raising your voice or piling on insults often weakens your point. Far more devastating is the calm, *pince-sans-rire* observation—pointing out that an expert **ne se mouille pas** in a cautious review, or noting someone who **joue les innocents** with polite disbelief.',
          'Dans la critique littéraire, les chroniques culturelles ou les salons, hausser le ton ou multiplier les attaques affaiblit souvent le propos. Bien plus redoutable est la remarque posée, **pince-sans-rire** : relever qu’un expert **ne se mouille guère** ou qu’un interlocuteur **joue les innocents** avec une politesse glacée.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('The critic avoids taking a clear stance so as not to upset either camp.', 'Le critique évite de prendre une position tranchée pour ne froisser personne.'),
          b('The critic forgot his umbrella when leaving the premiere.', 'Le critique a oublié son parapluie en sortant de l’avant-première.'),
          b('The critic enthusiastically praised every single scene of the film.', 'Le critique a salué avec ferveur chaque scène du film.'),
          b('The critic refused to attend the festival altogether.', 'Le critique a refusé d’assister au festival.'),
        ],
        {
          fr: '« Dans son papier de ce matin, l’éditorialiste ne se mouille vraiment pas : trois paragraphes pour conclure que “tout dépend du point de vue”. »',
          explain: b('Ne pas se mouiller means hedging safely and avoiding any risky commitment or clear judgment.', 'Ne pas se mouiller signifie éviter soigneusement de s’engager ou de prendre parti.'),
        },
      ),
      pairs(
        P.match,
        [
          ['rire sous cape', b('to laugh quietly up one’s sleeve', 's’amuser en secret sans le montrer')],
          ['faire la fine bouche', b('to turn up one’s nose / act picky', 'se montrer difficile devant une proposition')],
          ['ne pas se mouiller', b('to play it safe / hedge', 'éviter de prendre parti ou de risquer')],
          ['ménager ses effets', b('to build up / time one’s impact', 'doser ses arguments pour frapper juste')],
          ['jouer les innocents', b('to play dumb / feign innocence', 'feindre la naïveté ou l’ignorance')],
        ],
      ),
      hear(
        'Le metteur en scène a d’abord fait la fine bouche devant le petit théâtre, mais en voyant la salle comble acclamer la pièce, ses anciens détracteurs ont bien dû cesser de rire sous cape.',
        b('How did attitudes shift toward the production?', 'Comment les attitudes ont-elles évolué autour de la pièce ?'),
        [
          b('After initially acting reluctant toward the small venue, the director triumphed and silenced quiet mockers.', 'Après avoir hésité devant la petite salle, le metteur en scène a triomphé et fait taire les moqueurs.'),
          b('The audience left the theatre halfway through because the staging was mediocre.', 'Le public a quitté la salle à l’entracte devant une mise en scène banale.'),
          b('The director pretended he had never signed the contract with the theatre.', 'Le metteur en scène a feint de n’avoir jamais signé avec le théâtre.'),
          b('Critics refused to comment on the opening night performance.', 'Les critiques ont refusé de commenter la première.'),
        ],
        { voice: 'm2' },
      ),
      dlg(
        b('Two reviewers leaving an exhibition preview', 'Deux critiques au sortir d’un vernissage'),
        b('Claire and Olivier exchange dry, understated reactions to an overhyped contemporary art show.', 'Claire et Olivier échangent leurs impressions ironiques après une exposition très médiatisée.'),
        [['Claire', 'f'], ['Olivier', 'm']],
        [
          [0, 'Alors, que penses-tu de l’installation centrale qu’on nous présentait comme révolutionnaire ?', 'So, what do you think of the central installation billed to us as revolutionary?'],
          [1, {
            options: [
              'Franchement, je ne veux pas faire la fine bouche devant autant de moyens, mais ça ne casse pas trois pattes à un canard.',
              'Je vais crier au loup dans l’eau devant tout le monde.',
              'C’est un secret de cape qu’on fouette un chat.',
            ],
            explain: b('Faire la fine bouche paired with ça ne casse pas trois pattes à un canard creates quintessential polite C1 understatement.', 'Faire la fine bouche suivi de ça ne casse pas trois pattes à un canard compose une litote ironique typiquement C1.'),
          }],
          [0, 'Tu m’as fait sourire : pendant le discours officiel, j’ai bien vu le conservateur lui-même rire sous cape quand le mécène a vanté la « sobriété » de l’œuvre.', 'You made me smile: during the official speech, I noticed the curator himself laughing up his sleeve when the patron praised the work’s “restraint”.'],
          [1, {
            options: [
              'Et maintenant il joue les innocents devant la presse ! Mais dans ton article, n’aie pas peur : mouille-toi un peu tout en ménageant tes effets.',
              'Oui, il n’y a pas de mer à boire pour vendre la peau du chat.',
              'Parfait, ne te mouille surtout jamais et prêche dans le canard.',
            ],
          }],
          [0, 'Compte sur moi : deux éloges discrets en ouverture, puis une chute pince-sans-rire au dernier paragraphe.', 'Count on me: two mild compliments up front, then a deadpan punchline in the final paragraph.'],
        ],
      ),
      dict('Il joue les innocents et ne se mouille guère, mais elle sait ménager ses effets.', {
        voice: 'f2',
        hint: b('Notice formal adverb guère (scarcely) after ne se mouille.', 'Notez l’adverbe soutenu guère dans ne se mouille guère.'),
      }),
      write(
        b('Deadpan C1 cultural column', 'Chronique culturelle C1 pince-sans-rire'),
        b('Write 80–140 words in the style of a refined, mildly ironic C1 cultural review (film, exhibition, restaurant or tech launch): start with polite restraint, expose an open secret or overhyped flaw without shouting, and end on a crisp deadpan line using at least three expressions from this course.', 'Rédigez 80 à 140 mots dans le style d’une chronique culturelle C1 nuancée et légèrement ironique (film, exposition, restaurant ou lancement) : ouvrez avec mesure, dévoilez un faux mystère ou une promesse fragile sans emphase, et terminez sur une chute pince-sans-rire avec au moins trois expressions du cours.'),
        80,
        140,
        [
          b('Polished C1 prose relying on irony and litotes rather than exclamation', 'Prose C1 soignée jouant sur la litote et l’ironie plutôt que l’emphase'),
          b('At least three idioms from this course integrated gracefully', 'Au moins trois expressions du cours intégrées avec finesse'),
          b('Sharp, understated final sentence', 'Chute finale nette et mesurée'),
        ],
        'Annoncée comme le manifeste architectural de la décennie, la nouvelle passerelle vitrée avait suscité des louanges anticipées — chacun vendant déjà la peau de l’ours bien avant l’inauguration. À la visite, l’ouvrage n’est certes pas désagréable, mais il ne casse pas trois pattes à un canard, tant s’en faut. Pour ne rien arranger, son budget triplé était devenu un secret de Polichinelle dans les couloirs de la mairie, même si ses concepteurs continuent de jouer les innocents face aux questions gênantes. Les premiers guides, prudents, ne se mouillent guère dans leurs brochures ; les visiteurs du dimanche, eux, rient doucement sous cape devant ce chef-d’œuvre « minimaliste ».',
        {
          phrases: ['tant s’en faut', 'secret de Polichinelle', 'jouer les innocents', 'rient doucement sous cape'],
        },
      ),
    ],
    [
      b('rire sous cape = laugh secretly; ménager ses effets = pace one’s rhetorical reveal.', 'rire sous cape = s’amuser en secret ; ménager ses effets = doser la portée de son récit.'),
      b('faire la fine bouche = act picky/reluctant; ne pas se mouiller = hedge safely.', 'faire la fine bouche = se montrer difficile ; ne pas se mouiller = éviter de prendre parti.'),
      b('jouer les innocents = feign ignorance or surprise with mock naivety.', 'jouer les innocents = feindre la naïveté ou l’étonnement.'),
    ],
    [
      ['rire sous cape', b('to laugh up one’s sleeve', 'se moquer ou s’amuser discrètement')],
      ['faire la fine bouche', b('to turn up one’s nose / be picky', 'se montrer dédaigneux ou difficile')],
      ['ne pas se mouiller', b('to play it safe / avoid taking sides', 'refuser de prendre risque ou position')],
      ['ménager ses effets', b('to pace one’s delivery for impact', 'préparer habilement l’effet de son propos')],
      ['jouer les innocents', b('to play innocent / feign naivety', 'feindre de ne rien savoir ou de s’étonner')],
    ],
  ),
];

export default lessons;
