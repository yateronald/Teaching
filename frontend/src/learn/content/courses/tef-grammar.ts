// TEF Canada · Grammaire et vocabulaire, A1 → C2. The grammar and the words of
// everyday and working life in Canada: housing, work, services, administration.
import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right answer.', 'Choisissez la bonne réponse.');

const lessons: Lesson[] = [
  // ── A1 ──
  {
    id: 'tef-grammar-1',
    level: 'A1',
    slug: { en: 'a1-irregular-verbs-and-questions', fr: 'a1-verbes-irreguliers-et-questions' },
    title: b('A1 · Key irregular verbs and questions', 'A1 · Verbes irréguliers clés et questions'),
    summary: b('Conjugate aller, faire, venir, prendre and ask questions with quel, où, quand, combien.', 'Conjuguer aller, faire, venir, prendre et poser des questions avec quel, où, quand, combien.'),
    objectives: [b('Conjugate four essential irregular verbs', 'Conjuguer quatre verbes irréguliers essentiels'), b('Ask questions with question words', 'Poser des questions avec les mots interrogatifs'), b('Name everyday services', 'Nommer les services du quotidien')],
    minutes: 14,
    steps: [
      { kind: 'conjugate', prompt: b('Conjugate aller in the present.', 'Conjuguez aller au présent.'), verb: 'aller', tense: b('present', 'présent'), forms: [['je', 'vais'], ['tu', 'vas'], ['il / elle', 'va'], ['nous', 'allons'], ['vous', 'allez'], ['ils / elles', 'vont']], given: [0] },
      { kind: 'conjugate', prompt: b('Conjugate prendre in the present.', 'Conjuguez prendre au présent.'), verb: 'prendre', tense: b('present', 'présent'), forms: [['je', 'prends'], ['tu', 'prends'], ['il / elle', 'prend'], ['nous', 'prenons'], ['vous', 'prenez'], ['ils / elles', 'prennent']], given: [0] },
      pick('A1', choose, ['fais', 'fait', 'faire', 'faites'], { fr: 'Le samedi, je ___ les courses.' }),
      pick('A1', choose, ['viennent', 'venons', 'vient', 'venez'], { fr: 'Mes parents ___ du Cameroun.' }),
      card(b('Question words', 'Les mots interrogatifs'), b('**Où** (where), **quand** (when), **combien** (how much / many), **comment** (how), **pourquoi** (why), **qui** (who), **quel / quelle** + noun (which, what). In speech, they often go at the end: Tu habites **où** ?', '**Où**, **quand**, **combien**, **comment**, **pourquoi**, **qui**, **quel / quelle** + nom. À l’oral, ils se placent souvent à la fin : Tu habites **où** ?')),
      pick('A1', choose, ['Quelle', 'Quel', 'Où', 'Combien'], { fr: '___ est votre adresse ?' }),
      pick('A1', choose, ['Combien', 'Comment', 'Où', 'Qui'], { fr: '___ coûte le billet d’autobus ?' }),
      { kind: 'match', prompt: b('Match each place with what you do there.', 'Associez chaque lieu à ce qu’on y fait.'), pairs: [['la banque', b('open an account', 'ouvrir un compte')], ['la pharmacie', b('buy medicine', 'acheter des médicaments')], ['l’épicerie', b('buy food', 'acheter de la nourriture')], ['le bureau de poste', b('send a parcel', 'envoyer un colis')], ['la clinique', b('see a doctor', 'voir un médecin')]] },
    ],
    notes: {
      points: [
        b('aller: vais, vas, va, allons, allez, vont. faire: fais, fais, fait, faisons, faites, font.', 'aller : vais, vas, va, allons, allez, vont. faire : fais, fais, fait, faisons, faites, font.'),
        b('venir: viens, viens, vient, venons, venez, viennent. prendre: prends, prends, prend, prenons, prenez, prennent.', 'venir : viens, viens, vient, venons, venez, viennent. prendre : prends, prends, prend, prenons, prenez, prennent.'),
        b('Question words: où, quand, combien, comment, pourquoi, qui, quel(le).', 'Mots interrogatifs : où, quand, combien, comment, pourquoi, qui, quel(le).'),
        b('Quel / quelle agrees with the noun: quelle adresse, quel numéro.', 'Quel / quelle s’accorde avec le nom : quelle adresse, quel numéro.'),
      ],
      vocab: [['l’épicerie (f.)', b('grocery store', 'magasin d’alimentation')], ['le compte', b('bank account', 'compte bancaire')], ['le billet', b('ticket', 'titre de transport')], ['faire les courses', b('to do the groceries', 'acheter à manger')]],
    },
  },

  // ── A2 ──
  {
    id: 'tef-grammar-2',
    level: 'A2',
    slug: { en: 'a2-time-markers-future', fr: 'a2-indicateurs-de-temps-et-futur' },
    title: b('A2 · Time markers and the future', 'A2 · Indicateurs de temps et futur'),
    summary: b('Use depuis, il y a, pendant, dans correctly, and talk about the future with aller + infinitive and the futur simple.', 'Employer correctement depuis, il y a, pendant, dans, et parler de l’avenir avec aller + infinitif et le futur simple.'),
    objectives: [b('Choose depuis, il y a, pendant, dans', 'Choisir depuis, il y a, pendant, dans'), b('Form the futur simple', 'Former le futur simple'), b('Talk about plans: work, housing, studies', 'Parler de projets : travail, logement, études')],
    minutes: 14,
    steps: [
      card(b('Four time markers', 'Quatre indicateurs de temps'), b('**depuis** + duration, still going on: J’habite ici **depuis** deux ans. **il y a** + duration, finished: Je suis arrivé **il y a** deux ans. **pendant** + duration, length: J’ai travaillé **pendant** six mois. **dans** + duration, in the future: Je déménage **dans** un mois.', '**depuis** + durée, qui continue : J’habite ici **depuis** deux ans. **il y a** + durée, terminé : Je suis arrivé **il y a** deux ans. **pendant** + durée : J’ai travaillé **pendant** six mois. **dans** + durée, futur : Je déménage **dans** un mois.')),
      pick('A2', choose, ['depuis', 'il y a', 'pendant', 'dans'], { fr: 'Je travaille dans cette entreprise ___ trois ans.' }),
      pick('A2', choose, ['il y a', 'depuis', 'dans', 'pendant'], { fr: 'J’ai envoyé ma demande ___ deux semaines.' }),
      pick('A2', choose, ['dans', 'il y a', 'depuis', 'pendant'], { fr: 'Le bail se termine ___ trois mois.' }),
      card(b('The futur simple', 'Le futur simple'), b('Infinitive + **-ai, -as, -a, -ons, -ez, -ont**: je travaillerai, nous finirons. Irregular stems: être → **ser-**, avoir → **aur-**, aller → **ir-**, faire → **fer-**, pouvoir → **pourr-**, venir → **viendr-**, devoir → **devr-**.', 'Infinitif + **-ai, -as, -a, -ons, -ez, -ont** : je travaillerai, nous finirons. Radicaux irréguliers : être → **ser-**, avoir → **aur-**, aller → **ir-**, faire → **fer-**, pouvoir → **pourr-**, venir → **viendr-**, devoir → **devr-**.'), { variant: 'tip' }),
      pick('A2', choose, ['pourrez', 'pouvrez', 'pouvez', 'pourriez'], { fr: 'Vous ___ récupérer votre permis la semaine prochaine.' }),
      pick('A2', choose, ['serai', 'serais', 'suis', 'étais'], { fr: 'L’an prochain, je ___ infirmière.' }),
      { kind: 'fill', prompt: b('Complete with the right marker.', 'Complétez avec le bon indicateur.'), text: 'J’ai étudié le français ___ six mois, et maintenant j’habite au Québec ___ un an.', answers: [['pendant'], ['depuis']] },
    ],
    notes: {
      points: [
        b('depuis (still going on), il y a (finished, ago), pendant (length), dans (in the future).', 'depuis (qui continue), il y a (terminé), pendant (durée), dans (futur).'),
        b('Futur simple: infinitive + -ai, -as, -a, -ons, -ez, -ont.', 'Futur simple : infinitif + -ai, -as, -a, -ons, -ez, -ont.'),
        b('Irregular: ser-, aur-, ir-, fer-, pourr-, viendr-, devr-, saur-, verr-.', 'Irréguliers : ser-, aur-, ir-, fer-, pourr-, viendr-, devr-, saur-, verr-.'),
        b('Near future: aller + infinitive (je vais déménager) for close or certain plans.', 'Futur proche : aller + infinitif (je vais déménager) pour un projet proche ou sûr.'),
      ],
      vocab: [['la demande', b('application', 'formulaire de requête')], ['le permis', b('permit, licence', 'autorisation')], ['déménager', b('to move house', 'changer de logement')], ['se terminer', b('to end', 'finir')]],
    },
  },

  // ── B1 ──
  {
    id: 'tef-grammar-3',
    level: 'B1',
    slug: { en: 'b1-pronouns-and-polite-requests', fr: 'b1-pronoms-et-demandes-polies' },
    title: b('B1 · Pronouns and polite requests', 'B1 · Pronoms et demandes polies'),
    summary: b('Combine pronouns (le lui, m’en, y), and make requests with the polite conditional, at work and with services.', 'Combiner les pronoms (le lui, m’en, y), et formuler des demandes avec le conditionnel de politesse, au travail et avec les services.'),
    objectives: [b('Use y and en in context', 'Employer y et en en contexte'), b('Place two pronouns in the right order', 'Placer deux pronoms dans le bon ordre'), b('Make polite requests with the conditional', 'Formuler des demandes polies au conditionnel')],
    minutes: 14,
    steps: [
      card(b('Double pronouns', 'Les doubles pronoms'), b('Order before the verb: **me / te / nous / vous** → **le / la / les** → **lui / leur** → **y** → **en**. Tu me donnes le formulaire ? → Tu **me le** donnes ? J’envoie le rapport au directeur → Je **le lui** envoie. Il y a des places ? → Il **y en** a.', 'Ordre devant le verbe : **me / te / nous / vous** → **le / la / les** → **lui / leur** → **y** → **en**. Tu me donnes le formulaire ? → Tu **me le** donnes ? J’envoie le rapport au directeur → Je **le lui** envoie. Il y a des places ? → Il **y en** a.')),
      pick('B1', choose, ['le lui', 'lui le', 'la lui', 'leur le'], { fr: 'J’envoie le contrat à la cliente. → Je ___ envoie.' }),
      pick('B1', choose, ['me les', 'les me', 'me leur', 'me le'], { fr: 'Pourriez-vous m’envoyer les documents ? → Pourriez-vous ___ envoyer ?' }),
      pick('B1', choose, ['en', 'y', 'le', 'lui'], { fr: 'Des collègues francophones ? J’___ ai trois.' }),
      card(b('The polite conditional', 'Le conditionnel de politesse'), b('With services and at work, the conditional softens requests: **Je voudrais**, **J’aimerais**, **Pourriez-vous**, **Serait-il possible de**, **Auriez-vous** + noun. It is expected in the TEF role-plays and letters.', 'Avec les services et au travail, le conditionnel adoucit la demande : **Je voudrais**, **J’aimerais**, **Pourriez-vous**, **Serait-il possible de**, **Auriez-vous** + nom. Il est attendu dans les jeux de rôle et les lettres du TEF.'), { variant: 'tip' }),
      pick('B1', b('Which request is the most polite?', 'Quelle demande est la plus polie ?'), ['Serait-il possible de reporter notre rendez-vous à jeudi ?', 'Reportez le rendez-vous à jeudi.', 'Je veux jeudi.', 'Jeudi, c’est mieux, non ?']),
      pick('B1', choose, ['Auriez-vous', 'Avez-vous eu', 'Aurez-vous', 'Aviez-vous'], { fr: '___ quelques minutes pour répondre à mes questions ?' }),
      { kind: 'fill', prompt: b('Replace the underlined words with pronouns.', 'Remplacez les mots soulignés par des pronoms.'), text: 'Je parle de mon projet à mon chef. → Je ___ ___ parle.', answers: [['lui'], ['en']] },
    ],
    notes: {
      points: [
        b('Pronoun order: me/te/nous/vous → le/la/les → lui/leur → y → en.', 'Ordre des pronoms : me/te/nous/vous → le/la/les → lui/leur → y → en.'),
        b('Je le lui envoie; il y en a; tu me le donnes.', 'Je le lui envoie ; il y en a ; tu me le donnes.'),
        b('Polite conditional: je voudrais, j’aimerais, pourriez-vous, serait-il possible de, auriez-vous.', 'Conditionnel de politesse : je voudrais, j’aimerais, pourriez-vous, serait-il possible de, auriez-vous.'),
        b('En replaces de + noun and quantities: j’en ai trois.', 'En remplace de + nom et les quantités : j’en ai trois.'),
      ],
      vocab: [['le contrat', b('contract', 'accord écrit')], ['reporter', b('to postpone', 'déplacer à plus tard')], ['francophone', b('French-speaking', 'qui parle français')], ['le chef', b('boss, manager', 'responsable')]],
    },
  },

  // ── B2 ──
  {
    id: 'tef-grammar-4',
    level: 'B2',
    slug: { en: 'b2-subjunctive-and-logical-connectors', fr: 'b2-subjonctif-et-connecteurs-logiques' },
    title: b('B2 · The subjunctive and logical connectors', 'B2 · Le subjonctif et les connecteurs logiques'),
    summary: b('Use the subjunctive after conjunctions of purpose, condition and concession, and choose the right logical connector.', 'Employer le subjonctif après les conjonctions de but, de condition et de concession, et choisir le bon connecteur logique.'),
    objectives: [b('Know which conjunctions take the subjunctive', 'Savoir quelles conjonctions demandent le subjonctif'), b('Express cause, consequence, purpose and opposition', 'Exprimer cause, conséquence, but et opposition'), b('Avoid connector confusions', 'Éviter les confusions de connecteurs')],
    minutes: 14,
    steps: [
      card(b('Conjunctions + subjunctive', 'Conjonctions + subjonctif'), b('**Purpose**: pour que, afin que. **Condition**: à condition que, pourvu que. **Concession**: bien que, quoique. **Time**: avant que, jusqu’à ce que. **Fear / negation**: de peur que, sans que. But **parce que, puisque, après que, pendant que, alors que** take the indicative.', '**But** : pour que, afin que. **Condition** : à condition que, pourvu que. **Concession** : bien que, quoique. **Temps** : avant que, jusqu’à ce que. **Crainte / négation** : de peur que, sans que. Mais **parce que, puisque, après que, pendant que, alors que** prennent l’indicatif.')),
      pick('B2', choose, ['puissiez', 'pouvez', 'pourrez', 'pourriez'], { fr: 'Nous vous envoyons le formulaire afin que vous ___ le remplir avant lundi.' }),
      pick('B2', choose, ['a été', 'ait été', 'soit', 'serait'], { fr: 'Après que la décision ___ annoncée, les employés ont réagi.', explain: b('Après que + indicative (standard rule), here the passé composé.', 'Après que + indicatif (règle standard), ici au passé composé.') }),
      pick('B2', choose, ['ait', 'a', 'aura', 'aurait'], { fr: 'Vous pouvez postuler, à condition que votre diplôme ___ été reconnu.' }),
      { kind: 'categorize', prompt: b('Sort the connectors.', 'Classez les connecteurs.'), buckets: [b('Cause', 'Cause'), b('Consequence', 'Conséquence'), b('Purpose', 'But'), b('Opposition', 'Opposition')], items: [{ text: 'puisque', bucket: 0 }, { text: 'en raison de', bucket: 0 }, { text: 'par conséquent', bucket: 1 }, { text: 'de sorte que', bucket: 1 }, { text: 'afin de', bucket: 2 }, { text: 'en vue de', bucket: 2 }, { text: 'tandis que', bucket: 3 }, { text: 'en revanche', bucket: 3 }] },
      pick('B2', choose, ['Par conséquent', 'Pourtant', 'Puisque', 'Afin que'], { fr: 'Le loyer a augmenté de 15 %. ___, plusieurs locataires ont déposé une plainte.' }),
      pick('B2', choose, ['Bien que', 'Parce que', 'Puisque', 'Comme'], { fr: '___ il ait l’expérience requise, sa candidature n’a pas été retenue.' }),
    ],
    notes: {
      points: [
        b('Subjunctive: pour que, afin que, à condition que, bien que, avant que, jusqu’à ce que, sans que, de peur que.', 'Subjonctif : pour que, afin que, à condition que, bien que, avant que, jusqu’à ce que, sans que, de peur que.'),
        b('Indicative: parce que, puisque, après que, pendant que, alors que, tandis que.', 'Indicatif : parce que, puisque, après que, pendant que, alors que, tandis que.'),
        b('Cause: puisque, en raison de. Consequence: par conséquent, de sorte que. Purpose: afin de, en vue de. Opposition: tandis que, en revanche.', 'Cause : puisque, en raison de. Conséquence : par conséquent, de sorte que. But : afin de, en vue de. Opposition : tandis que, en revanche.'),
        b('Same subject: afin de / pour + infinitive (not afin que).', 'Même sujet : afin de / pour + infinitif (pas afin que).'),
      ],
      vocab: [['postuler', b('to apply (for a job)', 'présenter sa candidature')], ['déposer une plainte', b('to file a complaint', 'se plaindre officiellement')], ['la candidature', b('application', 'demande d’emploi')], ['retenir', b('to select', 'choisir')]],
    },
  },

  // ── C1 ──
  {
    id: 'tef-grammar-5',
    level: 'C1',
    slug: { en: 'c1-administrative-and-formal-french', fr: 'c1-francais-administratif-et-soutenu' },
    title: b('C1 · Administrative and formal French', 'C1 · Le français administratif et soutenu'),
    summary: b('Understand and use the structures of official texts: impersonal forms, the passive, nominalisation and formal vocabulary.', 'Comprendre et employer les structures des textes officiels : tournures impersonnelles, passif, nominalisation et vocabulaire soutenu.'),
    objectives: [b('Recognise impersonal administrative forms', 'Reconnaître les tournures impersonnelles administratives'), b('Turn everyday French into formal French', 'Transformer le français courant en français soutenu'), b('Use the passive and nominalisation', 'Employer le passif et la nominalisation')],
    minutes: 14,
    steps: [
      card(b('The style of official texts', 'Le style des textes officiels'), b('Official texts avoid “je / vous” and prefer **impersonal** forms: **Il est rappelé que…**, **Il convient de…**, **Il est demandé aux usagers de…**, the **passive** (Les demandes **seront traitées**…) and **nouns** (**Le dépôt** des dossiers…).', 'Les textes officiels évitent « je / vous » et préfèrent les tournures **impersonnelles** : **Il est rappelé que…**, **Il convient de…**, **Il est demandé aux usagers de…**, le **passif** (Les demandes **seront traitées**…) et les **noms** (**Le dépôt** des dossiers…).')),
      { kind: 'match', prompt: b('Match the everyday phrase with its formal equivalent.', 'Associez la tournure courante à son équivalent soutenu.'), pairs: [['Il faut…', 'Il convient de…'], ['On vous rappelle que…', 'Il est rappelé que…'], ['Envoyez votre dossier avant le 30.', 'Le dépôt des dossiers doit être effectué avant le 30.'], ['On va étudier votre demande.', 'Votre demande sera examinée.'], ['si vous ne le faites pas', 'à défaut']] },
      pick('C1', b('Which sentence is in administrative style?', 'Quelle phrase est en style administratif ?'), ['Il est demandé aux locataires de libérer le stationnement avant 8 h.', 'Les locataires, enlevez vos voitures avant 8 h !', 'Faut libérer le stationnement.', 'On aimerait bien que vous bougiez vos chars.']),
      pick('C1', choose, ['seront traitées', 'traiteront', 'seront traité', 'ont traité'], { fr: 'Les demandes incomplètes ne ___ pas.' }),
      pick('C1', choose, ['Le renouvellement', 'Renouveler', 'Le renouveler', 'La renouvelle'], { fr: '___ de votre carte doit être effectué en personne.' }),
      pick('C1', choose, ['convient', 'faut', 'doit', 'devrait'], { fr: 'Il ___ de joindre une copie de votre passeport.' }),
      pick('C1', b('What does “à défaut de paiement” mean?', 'Que signifie « à défaut de paiement » ?'), ['If payment is not made', 'After payment', 'Thanks to the payment', 'Instead of a refund']),
      { kind: 'fill', prompt: b('Nominalise.', 'Nominalisez.'), text: 'Vous devez déclarer vos revenus. → La ___ de vos revenus est obligatoire.', answers: [['déclaration']] },
    ],
    notes: {
      points: [
        b('Impersonal forms: il est rappelé que, il convient de, il est demandé à… de.', 'Tournures impersonnelles : il est rappelé que, il convient de, il est demandé à… de.'),
        b('Passive: les demandes seront traitées / examinées.', 'Passif : les demandes seront traitées / examinées.'),
        b('Nominalisation: déposer → le dépôt; renouveler → le renouvellement; déclarer → la déclaration.', 'Nominalisation : déposer → le dépôt ; renouveler → le renouvellement ; déclarer → la déclaration.'),
        b('À défaut de + noun = if … is not done.', 'À défaut de + nom = si … n’est pas fait.'),
      ],
      vocab: [['le dépôt', b('submission', 'remise d’un document')], ['joindre', b('to attach', 'ajouter à un envoi')], ['libérer', b('to vacate', 'quitter, rendre libre')], ['les revenus (m.)', b('income', 'argent gagné')], ['effectuer', b('to carry out', 'faire')]],
    },
  },

  // ── C2 ──
  {
    id: 'tef-grammar-6',
    level: 'C2',
    slug: { en: 'c2-precision-anglicisms-tricky-constructions', fr: 'c2-precision-anglicismes-constructions-delicates' },
    title: b('C2 · Precision: anglicisms and tricky constructions', 'C2 · Précision : anglicismes et constructions délicates'),
    summary: b('Remove the anglicisms common in Canada, master difficult verb constructions and choose the exact word.', 'Éliminer les anglicismes fréquents au Canada, maîtriser les constructions verbales difficiles et choisir le mot exact.'),
    objectives: [b('Correct anglicisms common in Canadian French', 'Corriger les anglicismes fréquents au Canada'), b('Master tricky verb constructions', 'Maîtriser les constructions verbales délicates'), b('Choose between close words', 'Choisir entre des mots proches')],
    minutes: 15,
    steps: [
      card(b('Anglicisms to avoid', 'Les anglicismes à éviter'), b('In Canada, English influences French. In a formal context (and in the TEF), prefer: **postuler à un poste** (not “appliquer sur”), **être censé** (not “être supposé de”), **à l’heure actuelle** or **actuellement** (not “présentement” in France, though accepted in Québec), **assister à une réunion** (not “attendre”), **avoir lieu** (not “prendre place”).', 'Au Canada, l’anglais influence le français. Dans un contexte formel (et au TEF), préférez : **postuler à un poste** (et non « appliquer sur »), **être censé** (et non « être supposé de »), **assister à une réunion**, **avoir lieu** (et non « prendre place »).')),
      { kind: 'match', prompt: b('Match each anglicism with its correct form.', 'Associez chaque anglicisme à sa forme correcte.'), pairs: [['appliquer sur un poste', 'postuler à un poste'], ['être supposé de venir', 'être censé venir'], ['la réunion prend place', 'la réunion a lieu'], ['canceller', 'annuler'], ['faire du sens', 'avoir du sens']] },
      pick('C2', choose, ['postuler à', 'appliquer sur', 'appliquer pour', 'postuler sur'], { fr: 'Elle souhaite ___ ce poste de gestionnaire.' }),
      pick('C2', choose, ['censé', 'supposé de', 'sensé', 'censé de'], { fr: 'Le technicien était ___ venir ce matin.', explain: b('Censé (supposed to) ≠ sensé (sensible).', 'Censé (qui doit) ≠ sensé (raisonnable).') }),
      card(b('Tricky constructions', 'Les constructions délicates'), b('**se souvenir de** qqch, but **se rappeler** qqch (no “de”): je me rappelle cette date. **pallier** un problème (no “à”). **à l’intention de** (for) ≠ **dans l’intention de** (with the aim of). **Quoique** (although) ≠ **quoi que** (whatever).', '**se souvenir de** qqch, mais **se rappeler** qqch (sans « de ») : je me rappelle cette date. **pallier** un problème (sans « à »). **à l’intention de** ≠ **dans l’intention de**. **Quoique** (bien que) ≠ **quoi que** (quelle que soit la chose que).'), { variant: 'tip' }),
      pick('C2', choose, ['me rappelle', 'me rappelle de', 'me souviens', 'souviens de'], { fr: 'Je ___ très bien notre première rencontre.' }),
      pick('C2', choose, ['pallier', 'pallier à', 'palier', 'palier à'], { fr: 'Des mesures ont été prises pour ___ le manque de personnel.' }),
      pick('C2', choose, ['Quoi que', 'Quoique', 'Quoi qu’il', 'Quelque'], { fr: '___ vous décidiez, nous respecterons votre choix.' }),
    ],
    notes: {
      points: [
        b('Anglicisms: postuler à (not appliquer sur), être censé (not supposé de), avoir lieu (not prendre place), annuler (not canceller), avoir du sens (not faire du sens).', 'Anglicismes : postuler à (et non appliquer sur), être censé (et non supposé de), avoir lieu (et non prendre place), annuler (et non canceller), avoir du sens (et non faire du sens).'),
        b('Se souvenir DE qqch; se rappeler qqch (no de).', 'Se souvenir DE qqch ; se rappeler qqch (sans de).'),
        b('Pallier un problème (direct object, no à).', 'Pallier un problème (COD, sans à).'),
        b('Quoique = bien que; quoi que = whatever. Censé = supposed to; sensé = sensible.', 'Quoique = bien que ; quoi que = quelle que soit la chose. Censé = qui doit ; sensé = raisonnable.'),
      ],
      vocab: [['le gestionnaire', b('manager', 'responsable')], ['pallier', b('to make up for', 'compenser')], ['censé', b('supposed to', 'qui doit normalement')], ['sensé', b('sensible', 'raisonnable')], ['le personnel', b('staff', 'employés')]],
    },
  },
];

export default lessons;
