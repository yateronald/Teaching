// TCF Canada · Grammaire et vocabulaire, A1 → C2. The language each level of
// the TCF expects: a rule explained simply, then practice until it sticks.
import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right answer.', 'Choisissez la bonne réponse.');

const lessons: Lesson[] = [
  // ── A1 ──
  {
    id: 'tcf-grammar-1',
    level: 'A1',
    slug: { en: 'a1-present-articles-negation', fr: 'a1-present-articles-negation' },
    title: b('A1 · The present, articles and negation', 'A1 · Le présent, les articles et la négation'),
    summary: b('Conjugate être, avoir and -er verbs, choose le / un / du, and say no correctly.', 'Conjuguer être, avoir et les verbes en -er, choisir le / un / du, et dire non correctement.'),
    objectives: [b('Conjugate être, avoir and regular -er verbs', 'Conjuguer être, avoir et les verbes réguliers en -er'), b('Choose definite, indefinite and partitive articles', 'Choisir articles définis, indéfinis et partitifs'), b('Build a negative sentence: ne… pas', 'Construire une phrase négative : ne… pas')],
    minutes: 14,
    steps: [
      { kind: 'conjugate', prompt: b('Conjugate être in the present.', 'Conjuguez être au présent.'), verb: 'être', tense: b('present', 'présent'), forms: [['je', 'suis'], ['tu', 'es'], ['il / elle', 'est'], ['nous', 'sommes'], ['vous', 'êtes'], ['ils / elles', 'sont']], given: [0] },
      { kind: 'conjugate', prompt: b('Conjugate parler in the present.', 'Conjuguez parler au présent.'), verb: 'parler', tense: b('present', 'présent'), forms: [['je', 'parle'], ['tu', 'parles'], ['il / elle', 'parle'], ['nous', 'parlons'], ['vous', 'parlez'], ['ils / elles', 'parlent']], given: [0] },
      card(b('Three kinds of articles', 'Trois sortes d’articles'), b('**le / la / les**: something specific or general (j’aime **le** café). **un / une / des**: one or several, countable (j’ai **un** chat). **du / de la / de l’**: an unknown quantity (je bois **du** café). After a negation, un / du become **de**: je n’ai pas **de** voiture.', '**le / la / les** : une chose précise ou générale (j’aime **le** café). **un / une / des** : une ou plusieurs choses comptables (j’ai **un** chat). **du / de la / de l’** : une quantité non précisée (je bois **du** café). Après une négation, un / du deviennent **de** : je n’ai pas **de** voiture.'), {
        examples: [
          { fr: 'J’aime le thé, mais aujourd’hui je bois du café.', tr: 'I like tea, but today I’m drinking coffee.' },
          { fr: 'Je n’ai pas de voiture.', tr: 'I don’t have a car.' },
        ],
      }),
      pick('A1', choose, ['du', 'le', 'un', 'des'], { fr: 'Le matin, je bois ___ café.' }),
      pick('A1', choose, ['de', 'une', 'la', 'des'], { fr: 'Je n’ai pas ___ voiture.', explain: b('After a negation: pas de.', 'Après une négation : pas de.') }),
      pick('A1', choose, ['avons', 'sommes', 'ont', 'êtes'], { fr: 'Nous ___ deux enfants.' }),
      pick('A1', choose, ['n’habite pas', 'habite pas ne', 'ne habite pas', 'pas habite'], { fr: 'Je ___ à Paris.', explain: b('ne → n’ before a vowel: je n’habite pas.', 'ne devient n’ devant une voyelle : je n’habite pas.') }),
      pick('A1', choose, ['la', 'le', 'les', 'l’'], { fr: 'Elle aime ___ musique classique.' }),
      { kind: 'fill', prompt: b('Make the sentence negative.', 'Mettez la phrase à la forme négative.'), text: 'Il ___ travaille ___ le dimanche.', answers: [['ne'], ['pas']] },
      { kind: 'flashcards', title: b('Everyday A1 words', 'Mots A1 du quotidien'), cards: [{ fr: 'le travail', tr: 'work' }, { fr: 'la famille', tr: 'family' }, { fr: 'le logement', tr: 'housing' }, { fr: 'les courses', tr: 'groceries' }, { fr: 'le médecin', tr: 'doctor' }, { fr: 'la gare', tr: 'station' }] },
    ],
    notes: {
      points: [
        b('être: je suis, tu es, il est, nous sommes, vous êtes, ils sont. avoir: j’ai, tu as, il a, nous avons, vous avez, ils ont.', 'être : je suis, tu es, il est, nous sommes, vous êtes, ils sont. avoir : j’ai, tu as, il a, nous avons, vous avez, ils ont.'),
        b('-er verbs: -e, -es, -e, -ons, -ez, -ent.', 'Verbes en -er : -e, -es, -e, -ons, -ez, -ent.'),
        b('le (specific / general), un (one), du (some). After ne… pas: **de**.', 'le (précis / général), un (un seul), du (une quantité). Après ne… pas : **de**.'),
        b('Negation surrounds the verb: je **ne** parle **pas**; n’ before a vowel.', 'La négation entoure le verbe : je **ne** parle **pas** ; n’ devant une voyelle.'),
      ],
      vocab: [['le logement', b('housing', 'lieu où l’on habite')], ['les courses', b('groceries', 'achats de nourriture')], ['le médecin', b('doctor', 'docteur')], ['la gare', b('train station', 'arrêt des trains')]],
    },
  },

  // ── A2 ──
  {
    id: 'tcf-grammar-2',
    level: 'A2',
    slug: { en: 'a2-past-tenses-object-pronouns', fr: 'a2-temps-du-passe-pronoms-complements' },
    title: b('A2 · Past tenses and object pronouns', 'A2 · Temps du passé et pronoms compléments'),
    summary: b('Use the passé composé and the imparfait, and replace nouns with le, la, lui, leur.', 'Employer le passé composé et l’imparfait, et remplacer les noms par le, la, lui, leur.'),
    objectives: [b('Form the passé composé with avoir and être', 'Former le passé composé avec avoir et être'), b('Choose between passé composé and imparfait', 'Choisir entre passé composé et imparfait'), b('Use direct and indirect object pronouns', 'Employer les pronoms COD et COI')],
    minutes: 14,
    steps: [
      card(b('Passé composé: avoir or être?', 'Passé composé : avoir ou être ?'), b('Most verbs take **avoir** (j’ai mangé). About fifteen verbs of movement and change take **être**, and the participle agrees: aller, venir, arriver, partir, entrer, sortir, monter, descendre, naître, mourir, rester, tomber… Elle **est partie**. Reflexive verbs also take être: je **me suis** levé.', 'La plupart des verbes prennent **avoir** (j’ai mangé). Une quinzaine de verbes de mouvement et de changement prennent **être**, et le participe s’accorde : aller, venir, arriver, partir, entrer, sortir, monter, descendre, naître, mourir, rester, tomber… Elle **est partie**. Les verbes pronominaux aussi : je **me suis** levé.')),
      pick('A2', choose, ['sommes arrivés', 'avons arrivé', 'sommes arrivé', 'avons arrivés'], { fr: 'Hier, nous ___ en retard.' }),
      pick('A2', choose, ['était', 'a été', 'est', 'sera'], { fr: 'Quand j’étais petit, ma maison ___ près de la mer.', explain: b('Description in the past: imparfait.', 'Description dans le passé : imparfait.') }),
      card(b('Object pronouns', 'Les pronoms compléments'), b('**Direct** (COD, no preposition): le, la, les → Je vois Marie → Je **la** vois. **Indirect** (COI, à + person): lui, leur → Je parle à Marie → Je **lui** parle. The pronoun goes **before the verb**: je ne **la** vois pas; je vais **lui** téléphoner.', '**Direct** (COD, sans préposition) : le, la, les → Je vois Marie → Je **la** vois. **Indirect** (COI, à + personne) : lui, leur → Je parle à Marie → Je **lui** parle. Le pronom se place **devant le verbe** : je ne **la** vois pas ; je vais **lui** téléphoner.'), { variant: 'tip' }),
      pick('A2', choose, ['leur', 'les', 'lui', 'y'], { fr: 'J’écris à mes parents. → Je ___ écris.' }),
      pick('A2', choose, ['le', 'lui', 'la', 'en'], { fr: 'Tu connais ce film ? — Oui, je ___ connais.' }),
      pick('A2', choose, ['vais lui téléphoner', 'lui vais téléphoner', 'vais téléphoner lui', 'vais le téléphoner'], { fr: 'Demain, je ___. (à Paul)' }),
      { kind: 'fill', prompt: b('Passé composé or imparfait?', 'Passé composé ou imparfait ?'), text: 'Il ___ (pleuvoir) quand nous ___ (sortir).', answers: [['pleuvait'], ['sommes sortis', 'sommes sorties']] },
      { kind: 'match', prompt: b('Match the time marker with its tense.', 'Associez l’indicateur au temps.'), pairs: [['hier soir, soudain', b('passé composé (event)', 'passé composé (événement)')], ['autrefois, d’habitude', b('imparfait (habit)', 'imparfait (habitude)')], ['demain, bientôt', b('future', 'futur')], ['en ce moment', b('present', 'présent')]] },
    ],
    notes: {
      points: [
        b('Passé composé = avoir / être + past participle. Être verbs: movement, change, reflexive; the participle agrees.', 'Passé composé = avoir / être + participe passé. Verbes avec être : mouvement, changement, pronominaux ; le participe s’accorde.'),
        b('Imparfait: description, habit, background. Passé composé: completed event.', 'Imparfait : description, habitude, décor. Passé composé : événement terminé.'),
        b('COD le / la / les; COI lui / leur. The pronoun goes before the conjugated verb, or before the infinitive.', 'COD le / la / les ; COI lui / leur. Le pronom se place devant le verbe conjugué, ou devant l’infinitif.'),
        b('Verbs with à + person take lui / leur: parler, écrire, téléphoner, répondre, demander à.', 'Les verbes avec à + personne prennent lui / leur : parler, écrire, téléphoner, répondre, demander à.'),
      ],
      vocab: [['autrefois', b('in the past', 'dans le passé')], ['soudain', b('suddenly', 'tout à coup')], ['en retard', b('late', 'après l’heure')], ['bientôt', b('soon', 'dans peu de temps')]],
    },
  },

  // ── B1 ──
  {
    id: 'tcf-grammar-3',
    level: 'B1',
    slug: { en: 'b1-conditional-relative-pronouns-y-en', fr: 'b1-conditionnel-relatifs-y-en' },
    title: b('B1 · Conditional, relative pronouns, y and en', 'B1 · Conditionnel, relatifs, y et en'),
    summary: b('Make hypotheses and polite requests, link sentences with qui, que, où, dont, and use y and en.', 'Faire des hypothèses et des demandes polies, relier des phrases avec qui, que, où, dont, et employer y et en.'),
    objectives: [b('Use the conditional for politeness and hypotheses', 'Employer le conditionnel pour la politesse et l’hypothèse'), b('Choose qui, que, où, dont', 'Choisir qui, que, où, dont'), b('Replace places and quantities with y and en', 'Remplacer lieux et quantités par y et en')],
    minutes: 14,
    steps: [
      card(b('The conditional', 'Le conditionnel'), b('Future stem + imparfait endings: je **voudrais**, tu **pourrais**, nous **aimerions**. Uses: **politeness** (Je voudrais un renseignement), **advice** (Tu devrais te reposer), **hypothesis**: **Si + imparfait → conditionnel** (Si j’avais le temps, je voyagerais).', 'Radical du futur + terminaisons de l’imparfait : je **voudrais**, tu **pourrais**, nous **aimerions**. Emplois : **politesse** (Je voudrais un renseignement), **conseil** (Tu devrais te reposer), **hypothèse** : **Si + imparfait → conditionnel** (Si j’avais le temps, je voyagerais).')),
      pick('B1', choose, ['achèterais', 'achète', 'achèterai', 'achetais'], { fr: 'Si je gagnais au loto, j’___ une maison.' }),
      pick('B1', choose, ['avais', 'aurais', 'ai', 'aurai'], { fr: 'Si j’___ plus de temps, je ferais du sport.', explain: b('Never the conditional after si: si + imparfait.', 'Jamais de conditionnel après si : si + imparfait.') }),
      card(b('Relative pronouns', 'Les pronoms relatifs'), b('**qui** = subject (la femme **qui** parle). **que** = direct object (le livre **que** je lis). **où** = place or time (la ville **où** j’habite, le jour **où** je suis arrivé). **dont** = replaces de + noun (le film **dont** je parle = je parle **de** ce film).', '**qui** = sujet (la femme **qui** parle). **que** = COD (le livre **que** je lis). **où** = lieu ou temps (la ville **où** j’habite, le jour **où** je suis arrivé). **dont** = remplace de + nom (le film **dont** je parle = je parle **de** ce film).'), { variant: 'tip' }),
      pick('B1', choose, ['dont', 'que', 'qui', 'où'], { fr: 'C’est le collègue ___ je t’ai parlé.' }),
      pick('B1', choose, ['où', 'que', 'dont', 'qui'], { fr: 'Je me souviens du jour ___ je suis arrivé au Canada.' }),
      pick('B1', choose, ['en', 'y', 'le', 'leur'], { fr: 'Tu veux du café ? — Oui, j’___ veux bien.' }),
      pick('B1', choose, ['y', 'en', 'lui', 'la'], { fr: 'Tu vas à la banque ? — Oui, j’___ vais cet après-midi.' }),
      { kind: 'fill', prompt: b('Complete with qui, que, où or dont.', 'Complétez avec qui, que, où ou dont.'), text: 'Voici l’appartement ___ j’ai visité et ___ le propriétaire est très sympathique.', answers: [['que'], ['dont']] },
    ],
    notes: {
      points: [
        b('Conditional: future stem + -ais, -ais, -ait, -ions, -iez, -aient.', 'Conditionnel : radical du futur + -ais, -ais, -ait, -ions, -iez, -aient.'),
        b('Si + imparfait → conditionnel. Never the conditional right after si.', 'Si + imparfait → conditionnel. Jamais de conditionnel juste après si.'),
        b('qui (subject), que (object), où (place / time), dont (de + noun).', 'qui (sujet), que (COD), où (lieu / temps), dont (de + nom).'),
        b('y = à + place / thing; en = de + thing / quantity.', 'y = à + lieu / chose ; en = de + chose / quantité.'),
      ],
      vocab: [['un renseignement', b('a piece of information', 'une information')], ['le propriétaire', b('owner, landlord', 'personne à qui appartient le bien')], ['se souvenir de', b('to remember', 'avoir en mémoire')], ['volontiers', b('gladly', 'avec plaisir')]],
    },
  },

  // ── B2 ──
  {
    id: 'tcf-grammar-4',
    level: 'B2',
    slug: { en: 'b2-subjunctive-reported-speech', fr: 'b2-subjonctif-discours-rapporte' },
    title: b('B2 · The subjunctive and reported speech', 'B2 · Le subjonctif et le discours rapporté'),
    summary: b('Know when the subjunctive is required, and report what someone said with the right tense changes.', 'Savoir quand le subjonctif est obligatoire, et rapporter les paroles de quelqu’un avec la bonne concordance des temps.'),
    objectives: [b('Form the present subjunctive', 'Former le subjonctif présent'), b('Recognise the triggers: il faut que, bien que, pour que…', 'Reconnaître les déclencheurs : il faut que, bien que, pour que…'), b('Transform direct speech into reported speech', 'Transformer le discours direct en discours rapporté')],
    minutes: 14,
    steps: [
      card(b('When the subjunctive?', 'Quand le subjonctif ?'), b('After expressions of **necessity** (il faut que), **will** (je veux que), **emotion** (je suis content que), **doubt** (je doute que, je ne pense pas que), and some conjunctions: **bien que, pour que, avant que, à condition que, sans que**. Not after **après que**, **espérer que**, **je pense que**.', 'Après les expressions de **nécessité** (il faut que), de **volonté** (je veux que), de **sentiment** (je suis content que), de **doute** (je doute que, je ne pense pas que), et certaines conjonctions : **bien que, pour que, avant que, à condition que, sans que**. Pas après **après que**, **espérer que**, **je pense que**.')),
      { kind: 'conjugate', prompt: b('Conjugate faire in the present subjunctive.', 'Conjuguez faire au subjonctif présent.'), verb: 'faire', tense: b('present subjunctive', 'subjonctif présent'), forms: [['que je', 'fasse'], ['que tu', 'fasses'], ['qu’il', 'fasse'], ['que nous', 'fassions'], ['que vous', 'fassiez'], ['qu’ils', 'fassent']], given: [0] },
      pick('B2', choose, ['puisses', 'peux', 'pourras', 'pourrais'], { fr: 'Je vais t’expliquer pour que tu ___ comprendre.' }),
      pick('B2', choose, ['viendra', 'vienne', 'viennent', 'venir'], { fr: 'J’espère qu’il ___ demain.', explain: b('Espérer que + indicative (here, the future).', 'Espérer que + indicatif (ici, le futur).') }),
      pick('B2', choose, ['soit', 'est', 'était', 'sera'], { fr: 'Bien que le loyer ___ élevé, l’appartement est très demandé.' }),
      card(b('Reported speech', 'Le discours rapporté'), b('When the reporting verb is in the past (il a dit que…), tenses shift back: présent → **imparfait**, passé composé → **plus-que-parfait**, futur → **conditionnel**. “Je suis fatigué” → Il a dit qu’il **était** fatigué. “Je viendrai” → Elle a dit qu’elle **viendrait**.', 'Quand le verbe introducteur est au passé (il a dit que…), les temps reculent : présent → **imparfait**, passé composé → **plus-que-parfait**, futur → **conditionnel**. « Je suis fatigué » → Il a dit qu’il **était** fatigué. « Je viendrai » → Elle a dit qu’elle **viendrait**.'), { variant: 'tip' }),
      pick('B2', choose, ['viendrait', 'viendra', 'vient', 'venait'], { fr: '« Je viendrai à la réunion. » → Elle a affirmé qu’elle ___ à la réunion.' }),
      pick('B2', choose, ['avait perdu', 'a perdu', 'perdait', 'perdrait'], { fr: '« J’ai perdu mes clés. » → Il m’a expliqué qu’il ___ ses clés.' }),
      { kind: 'fill', prompt: b('Report the question.', 'Rapportez la question.'), text: '« Est-ce que tu viens ? » → Il m’a demandé ___ je venais.', answers: [['si']], explain: b('Yes/no question → si.', 'Question fermée → si.') },
    ],
    notes: {
      points: [
        b('Subjunctive after: il faut que, vouloir que, être content que, douter que, ne pas penser que, bien que, pour que, avant que, à condition que.', 'Subjonctif après : il faut que, vouloir que, être content que, douter que, ne pas penser que, bien que, pour que, avant que, à condition que.'),
        b('Indicative after: espérer que, penser que, après que, parce que.', 'Indicatif après : espérer que, penser que, après que, parce que.'),
        b('Irregular subjunctives: être → soit, avoir → ait, faire → fasse, pouvoir → puisse, aller → aille, savoir → sache.', 'Subjonctifs irréguliers : être → soit, avoir → ait, faire → fasse, pouvoir → puisse, aller → aille, savoir → sache.'),
        b('Reported speech in the past: présent → imparfait; passé composé → plus-que-parfait; futur → conditionnel.', 'Discours rapporté au passé : présent → imparfait ; passé composé → plus-que-parfait ; futur → conditionnel.'),
      ],
      vocab: [['affirmer', b('to state', 'dire avec certitude')], ['élevé', b('high', 'haut')], ['demandé', b('in demand', 'recherché')], ['douter', b('to doubt', 'ne pas être sûr')]],
    },
  },

  // ── C1 ──
  {
    id: 'tcf-grammar-5',
    level: 'C1',
    slug: { en: 'c1-passive-gerund-nominalisation', fr: 'c1-passif-gerondif-nominalisation' },
    title: b('C1 · The passive, the gerund and nominalisation', 'C1 · Le passif, le gérondif et la nominalisation'),
    summary: b('Master the structures of formal French: the passive voice, the gerund and present participle, and nominalisation.', 'Maîtriser les structures du français soutenu : la voix passive, le gérondif et le participe présent, et la nominalisation.'),
    objectives: [b('Form and use the passive voice', 'Former et employer la voix passive'), b('Distinguish gerund and present participle', 'Distinguer gérondif et participe présent'), b('Turn verbs into nouns to condense ideas', 'Transformer des verbes en noms pour condenser les idées')],
    minutes: 14,
    steps: [
      card(b('The passive voice', 'La voix passive'), b('**être** (in the tense of the active verb) + past participle (agrees with the subject) + **par** + agent. “Le maire a inauguré le pont” → Le pont **a été inauguré par** le maire. Use it to focus on the result, or when the agent is unknown: Le musée **sera rénové** en 2027.', '**être** (au temps du verbe actif) + participe passé (accordé avec le sujet) + **par** + agent. « Le maire a inauguré le pont » → Le pont **a été inauguré par** le maire. On l’emploie pour mettre en valeur le résultat, ou quand l’agent est inconnu : Le musée **sera rénové** en 2027.')),
      pick('C1', choose, ['ont été adoptées', 'ont adopté', 'sont adopté', 'ont été adopté'], { fr: 'De nouvelles règles ___ par le conseil municipal.' }),
      pick('C1', choose, ['sera publié', 'publiera', 'sera publiée', 'a publié'], { fr: 'Le rapport ___ la semaine prochaine.' }),
      card(b('Gerund or present participle?', 'Gérondif ou participe présent ?'), b('**Gerund** = **en** + -ant, same subject, expresses manner, means, simultaneity: Il a trouvé du travail **en envoyant** cent CV. **Present participle** (no “en”) = a written alternative to qui + verb or a cause: Les candidats **ayant** un diplôme… / **Ne sachant** pas quoi répondre, il s’est tu.', '**Gérondif** = **en** + -ant, même sujet ; il exprime la manière, le moyen, la simultanéité : Il a trouvé du travail **en envoyant** cent CV. **Participe présent** (sans « en ») = équivalent écrit de qui + verbe ou d’une cause : Les candidats **ayant** un diplôme… / **Ne sachant** pas quoi répondre, il s’est tu.'), { variant: 'tip' }),
      pick('C1', choose, ['en lisant', 'lisant', 'à lire', 'en lire'], { fr: 'On apprend beaucoup de vocabulaire ___ la presse.' }),
      pick('C1', choose, ['possédant', 'en possédant', 'possédés', 'possède'], { fr: 'Les candidats ___ une expérience à l’étranger seront privilégiés.' }),
      { kind: 'match', prompt: b('Match each verb with its noun.', 'Associez chaque verbe à son nom.'), pairs: [['augmenter', 'l’augmentation'], ['réduire', 'la réduction'], ['décider', 'la décision'], ['construire', 'la construction'], ['refuser', 'le refus']] },
      pick('C1', b('Which sentence is nominalised?', 'Quelle phrase est nominalisée ?'), ['L’ouverture du nouveau centre est prévue en mars.', 'On va ouvrir le nouveau centre en mars.', 'Le centre, on l’ouvre en mars.', 'Ils ouvrent en mars le centre.']),
      { kind: 'fill', prompt: b('Put the sentence in the passive.', 'Mettez la phrase au passif.'), text: 'L’entreprise a licencié deux cents employés. → Deux cents employés ___ licenciés par l’entreprise.', answers: [['ont été']] },
    ],
    notes: {
      points: [
        b('Passive = être (tense of the active verb) + agreed participle + par. Le pont a été inauguré par le maire.', 'Passif = être (au temps du verbe actif) + participe accordé + par. Le pont a été inauguré par le maire.'),
        b('Gerund: en + -ant, same subject (manner, means, simultaneity).', 'Gérondif : en + -ant, même sujet (manière, moyen, simultanéité).'),
        b('Present participle: formal equivalent of qui + verb (les candidats ayant…) or of a cause.', 'Participe présent : équivalent soutenu de qui + verbe (les candidats ayant…) ou d’une cause.'),
        b('Nominalisation: augmenter → l’augmentation, refuser → le refus, ouvrir → l’ouverture.', 'Nominalisation : augmenter → l’augmentation, refuser → le refus, ouvrir → l’ouverture.'),
      ],
      vocab: [['inaugurer', b('to open officially', 'ouvrir officiellement')], ['licencier', b('to lay off', 'renvoyer un employé')], ['privilégier', b('to favour', 'préférer')], ['le conseil municipal', b('city council', 'assemblée de la ville')]],
    },
  },

  // ── C2 ──
  {
    id: 'tcf-grammar-6',
    level: 'C2',
    slug: { en: 'c2-fine-points-of-french', fr: 'c2-finesses-de-la-langue' },
    title: b('C2 · The fine points of French', 'C2 · Les finesses de la langue'),
    summary: b('The details that distinguish an expert user: the expletive ne, difficult agreements, literary tenses and precise vocabulary.', 'Les détails qui distinguent l’utilisateur expérimenté : le ne explétif, les accords difficiles, les temps littéraires et le vocabulaire précis.'),
    objectives: [b('Recognise the expletive ne and literary tenses', 'Reconnaître le ne explétif et les temps littéraires'), b('Apply difficult past participle agreements', 'Appliquer les accords difficiles du participe passé'), b('Avoid common errors of near-native speakers', 'Éviter les erreurs courantes des quasi-natifs')],
    minutes: 15,
    steps: [
      card(b('The expletive ne', 'Le ne explétif'), b('In formal French, a **ne** without negative meaning appears after **avant que**, **à moins que**, **de peur que**, **craindre que**, and in comparisons: Partez avant qu’il **ne** pleuve (= before it rains). Il est plus riche qu’on **ne** le pense. It is optional but marks a controlled register.', 'En français soutenu, un **ne** sans valeur négative apparaît après **avant que**, **à moins que**, **de peur que**, **craindre que**, et dans les comparaisons : Partez avant qu’il **ne** pleuve (= avant qu’il pleuve). Il est plus riche qu’on **ne** le pense. Il est facultatif mais signale un registre maîtrisé.')),
      pick('C2', b('What does this sentence mean? “Je crains qu’il ne soit trop tard.”', 'Que signifie cette phrase ? « Je crains qu’il ne soit trop tard. »'), ['I fear it is too late.', 'I fear it is not too late.', 'I am sure it is not late.', 'I hope it is too late.'], { explain: b('The expletive ne has no negative meaning.', 'Le ne explétif n’a pas de valeur négative.') }),
      card(b('Difficult agreements', 'Les accords difficiles'), b('With **avoir**, the participle agrees with a **direct object placed before** it: les lettres que j’ai **écrites**. Reflexive verbs: elle s’est **lavée** but elle s’est lavé **les mains** (the object follows). **Fait + infinitive** never agrees: la maison qu’il a **fait** construire.', 'Avec **avoir**, le participe s’accorde avec le **COD placé avant** : les lettres que j’ai **écrites**. Verbes pronominaux : elle s’est **lavée**, mais elle s’est lavé **les mains** (le COD est après). **Fait + infinitif** ne s’accorde jamais : la maison qu’il a **fait** construire.'), { variant: 'tip' }),
      pick('C2', choose, ['écrites', 'écrit', 'écrits', 'écrite'], { fr: 'Ce sont les lettres que j’ai ___ hier.' }),
      pick('C2', choose, ['fait', 'faite', 'faits', 'faites'], { fr: 'Voici la robe qu’elle s’est ___ faire sur mesure.' }),
      pick('C2', choose, ['succédé', 'succédés', 'succédées', 'succédée'], { fr: 'Les ministres qui se sont ___ ont tous promis des réformes.', explain: b('Se succéder: succéder À quelqu’un → indirect object, no agreement.', 'Se succéder : succéder À quelqu’un → COI, pas d’accord.') }),
      card(b('Literary tenses: recognise them', 'Les temps littéraires : les reconnaître'), b('In novels and formal texts: **passé simple** (il **fut**, elle **prit**, ils **vinrent**) for narration, and the **imperfect subjunctive** (qu’il **fût**, qu’il **eût**) in very formal writing. You do not need to produce them, but you must understand them.', 'Dans les romans et les textes soutenus : le **passé simple** (il **fut**, elle **prit**, ils **vinrent**) pour la narration, et le **subjonctif imparfait** (qu’il **fût**, qu’il **eût**) à l’écrit très soutenu. Inutile de les produire, mais il faut les comprendre.')),
      pick('C2', b('“Ils vinrent à l’aube.” Which verb and tense?', '« Ils vinrent à l’aube. » Quel verbe, quel temps ?'), ['venir, passé simple', 'vaincre, présent', 'vendre, passé simple', 'venir, subjonctif'], {}),
      { kind: 'match', prompt: b('Paronyms: match each word with its meaning.', 'Paronymes : associez chaque mot à son sens.'), pairs: [['éminent', b('distinguished', 'remarquable')], ['imminent', b('about to happen', 'qui va arriver très vite')], ['conjecture', b('assumption', 'supposition')], ['conjoncture', b('economic situation', 'situation du moment')], ['prolongation', b('extension in time', 'allongement dans le temps')]] },
    ],
    notes: {
      points: [
        b('Expletive ne after avant que, à moins que, de peur que, craindre que, and comparisons: no negative meaning.', 'Ne explétif après avant que, à moins que, de peur que, craindre que, et dans les comparaisons : pas de valeur négative.'),
        b('Avoir: agreement with a direct object placed before. Fait + infinitive: no agreement.', 'Avoir : accord avec le COD placé avant. Fait + infinitif : pas d’accord.'),
        b('Reflexive verbs with an indirect pronoun (se succéder, se parler, se téléphoner): no agreement.', 'Pronominaux avec pronom COI (se succéder, se parler, se téléphoner) : pas d’accord.'),
        b('Paronyms: éminent / imminent, conjecture / conjoncture, prolongation / prolongement.', 'Paronymes : éminent / imminent, conjecture / conjoncture, prolongation / prolongement.'),
      ],
      vocab: [['l’aube (f.)', b('dawn', 'lever du jour')], ['sur mesure', b('made to measure', 'adapté exactement')], ['la conjoncture', b('economic climate', 'situation économique')], ['imminent', b('imminent', 'tout proche')]],
    },
  },
];

export default lessons;
