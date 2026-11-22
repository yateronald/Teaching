import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Perception verbs (voir, entendre, regarder, écouter, sentir) unlock one of French’s most expressive structures: the infinitive clause. Know when to choose the infinitive over que, place one or two pronouns naturally before the perception verb, and master the famous past participle agreement rule: Je l’ai vue peindre vs. Je l’ai vu peindre.',
    'Les verbes de perception (voir, entendre, regarder, écouter, sentir) ouvrent une structure emblématique du français : la proposition infinitive. Choisissez justement entre l’infinitif et la complétive en que, placez un ou deux pronoms devant le verbe, et maîtrisez la célèbre règle d’accord du participe passé : Je l’ai vue peindre contre Je l’ai vu peindre.',
  ),
  outcomes: [
    b('Choose between voir / entendre + infinitive (direct perception) and que + indicative (indirect deduction)', 'Choisir entre voir / entendre + infinitif (perception directe) et que + indicatif (constat indirect)'),
    b('Place noun agents and one or two clitic pronouns accurately around perception verbs', 'Placer les groupes nominaux et un ou deux pronoms devant les verbes de perception'),
    b('Apply the past participle agreement test accurately: agent performs vs. object undergoes', 'Appliquer avec sûreté la règle d’accord du participe passé selon le rôle du COD'),
  ],
};

const C = 'gr-infinitive-clauses-perception';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['perception-verbs-infinitive-vs-que', 'verbes-de-perception-infinitif-ou-que'],
    b('Perception verbs: infinitive vs. completive que', 'Verbes de perception : infinitif ou complétive en que'),
    b('Distinguish live sensory perception from intellectual observation, and place the agent smoothly.', 'Distinguer la perception directe d’un constat intellectuel et placer correctement le sujet de l’infinitif.'),
    [
      b('Know the core perception verbs: voir, regarder, entendre, écouter, sentir, apercevoir', 'Maîtriser les verbes de perception : voir, regarder, entendre, écouter, sentir, apercevoir'),
      b('Contrast infinitive (direct sensory witness) with que + indicative (realization / fact)', 'Opposer infinitif (perception en direct) et que + indicatif (constat ou information)'),
      b('Place the agent before or after an intransitive infinitive cleanly', 'Placer l’agent avant ou après un infinitif sans COD'),
    ],
    13,
    [
      card(
        b('Direct perception vs. indirect fact', 'Perception directe ou constat intellectuel'),
        b(
          'After **voir, regarder, entendre, écouter, sentir, apercevoir**, use an **infinitive clause** when you directly witness the action unfolding with your eyes, ears, or senses (*J’ai entendu la pluie tomber*). Use **que + indicative** when you deduce a completed fact, learn information secondhand, or express an opinion (*J’ai vu que la rue était mouillée*, *J’ai entendu dire que…*).\n\nPerception verbs: **voir, regarder, entendre, écouter, sentir**.\nInfinitive (witnessed live): **j’ai vu l’avion décoller · j’ai senti le sol trembler**.\nQue-clause (inferred fact): **j’ai vu qu’il était parti · j’ai entendu qu’elle réussissait**.',
          'Après **voir, regarder, entendre, écouter, sentir, apercevoir**, employez une **proposition infinitive** lorsque vous percevez l’action en direct par vos sens (*J’ai entendu la pluie tomber*). Employez **que + indicatif** lorsque vous déduisez un état, rapportez un fait ou apprenez une nouvelle (*J’ai vu que la rue était mouillée*, *J’ai entendu dire que…*).\n\nVerbes de perception : **voir, regarder, entendre, écouter, sentir**.\nInfinitif (en direct) : **j’ai vu l’avion décoller · j’ai senti le sol trembler**.\nComplétive en que (constat) : **j’ai vu qu’il était parti · j’ai entendu qu’elle réussissait**.',
        ),
        {
          table: {
            head: [b('Structure', 'Structure'), b('Meaning', 'Valeur'), b('Example', 'Exemple')],
            rows: [
              ['V + noun + infinitif', b('direct live perception (standard order)', 'perception en direct (ordre usuel)'), 'J’ai vu les enfants traverser la cour.'],
              ['V + infinitif + noun', b('elegant order when infinitive has no COD', 'ordre fréquent sans COD de l’infinitif'), 'J’ai vu traverser les enfants.'],
              ['V + que + indicatif', b('noticed result or reported fact', 'constat intellectuel ou fait rapporté'), 'J’ai vu que les enfants avaient traversé.'],
            ],
          },
          ex: [
            ['Nous avons regardé les musiciens accorder leurs instruments.', 'We watched the musicians tune their instruments.'],
            ['J’entends souvent passer le premier tramway vers cinq heures.', 'I often hear the first tram go by around five o’clock.'],
            ['En entrant dans la cuisine, j’ai senti que le pain venait de cuire.', 'Upon entering the kitchen, I smelled that the bread had just baked.'],
          ],
        },
      ),
      tip(
        b('Word order: never split an infinitive and its own object', 'Ne séparez pas l’infinitif de son propre COD'),
        b(
          'If the infinitive has **no direct object** (*partir, arriver, tomber*), the noun doing the action can go **before or after** the infinitive: *J’ai entendu **la porte claquer*** or *J’ai entendu **claquer la porte***. If the infinitive **has its own direct object** (*fermer la fenêtre*), keep the doer right after the perception verb: *J’ai vu **Paul fermer la fenêtre*** (so you know Paul closed it, not the window!).\n\nIntransitive (both orders): **j’ai vu tomber la neige · j’ai vu la neige tomber**.\nTransitive (agent first): **j’ai vu Claire ouvrir le colis**.',
          'Si l’infinitif n’a **pas de COD** (*partir, arriver, tomber*), l’auteur de l’action peut précéder ou suivre l’infinitif : *J’ai entendu **la porte claquer*** ou *J’ai entendu **claquer la porte***. Si l’infinitif **a un COD** (*fermer la fenêtre*), placez l’agent juste après le verbe de perception : *J’ai vu **Paul fermer la fenêtre***.\n\nSans COD (deux ordres) : **j’ai vu tomber la neige · j’ai vu la neige tomber**.\nAvec COD (agent devant) : **j’ai vu Claire ouvrir le colis**.',
        ),
      ),
      mc(
        P.best,
        [
          'J’ai entendu mon voisin jouer du violoncelle.',
          'J’ai entendu jouer du violoncelle mon voisin.',
          'J’ai entendu que mon voisin jouer du violoncelle.',
          'J’ai entendu à mon voisin jouer du violoncelle.',
        ],
        {
          fr: 'Which sentence clearly states that you heard your neighbor play the cello?',
          explain: b('Because jouer du violoncelle carries a complement, keep the agent mon voisin directly after entendu.', 'Comme jouer du violoncelle comporte un complément, placez l’agent mon voisin juste après entendu.'),
        },
      ),
      mc(
        P.meaning,
        [
          b('She saw the completed result afterward (not the act of painting).', 'Elle a constaté le résultat après coup, sans voir le peintre travailler.'),
          b('She stood and watched the painter paint the facade live.', 'Elle a observé le peintre peindre la façade en direct.'),
          b('She doubts the facade will ever be painted.', 'Elle doute que la façade soit jamais peinte.'),
        ],
        {
          fr: 'En rentrant le soir, elle a vu que la façade avait été repeinte.',
          explain: b('Voir que + indicative expresses noticing a state or completed fact afterward rather than witnessing the ongoing action.', 'Voir que + indicatif marque le constat d’un fait accompli plutôt que la perception de l’action en train de se faire.'),
        },
      ),
      gap(
        P.complete,
        'J’ai écouté la soprano ___ (chanter) cet air célèbre. En voyant le verre vide, il a vite compris ___ (que / quel) quelqu’un ___ (passer — p.-q.-p.) par là.',
        [['chanter'], ['que'], ['était passé']],
        { hint: b('Use the bare infinitive after écouter, then que + plus-que-parfait for an inferred prior event.', 'Infinitif sans préposition après écouter, puis que + plus-que-parfait pour un fait antérieur déduit.') },
      ),
      hear(
        'Nous avons senti le plancher vibrer sous nos pas.',
        b('What did the speaker experience?', 'Qu’a ressenti la personne qui parle ?'),
        [
          b('Direct physical perception of the floor vibrating at that moment.', 'La perception directe de la vibration au moment même.'),
          b('A secondhand rumor that the floor had vibrated earlier.', 'Une rumeur entendue après coup au sujet du plancher.'),
          b('A future warning about repairs.', 'Un avertissement sur de futurs travaux.'),
        ],
      ),
      ord(
        P.order,
        'J’ai souvent regardé les bateaux quitter le port à l’aube.',
        { tr: 'I have often watched the boats leave the harbor at dawn.' },
      ),
      dict('De ma fenêtre, j’entendais les oiseaux chanter et les passants discuter.'),
      say('Nous avons aperçu le train entrer en gare juste avant l’averse.', 'We spotted the train pulling into the station right before the downpour.'),
    ],
    [
      b('Perception verbs (voir, regarder, entendre, écouter, sentir) take an infinitive with NO preposition (à/de) for direct perception.', 'Les verbes de perception (voir, regarder, entendre, écouter, sentir) se construisent directement avec l’infinitif sans préposition.'),
      b('Use que + indicative when inferring a result or reporting a fact rather than witnessing an action live.', 'Employez que + indicatif pour un constat indirect ou une information rapportée.'),
      b('Put the agent right after the perception verb whenever the infinitive also takes an object (J’ai vu Luc ouvrir la porte).', 'Placez l’agent juste après le verbe de perception quand l’infinitif possède un complément.'),
    ],
    [
      ['apercevoir', b('to catch sight of', 'voir brièvement ou soudainement')],
      ['entendre dire que', b('to hear (rumor / secondhand) that', 'apprendre par ouï-dire que')],
      ['claquer', b('to slam, bang shut', 'se fermer brusquement avec bruit')],
      ['à l’aube', b('at dawn', 'au lever du jour')],
    ],
  ),

  lesson(
    C,
    2,
    ['pronoun-word-order-perception', 'place-des-pronoms-avec-infinitif'],
    b('Pronoun word order with perception verbs', 'Place des pronoms avec les verbes de perception'),
    b('Know where le, la, les, en, y, and lui/leur go when you replace nouns in a perception clause.', 'Savoir où placer le, la, les, en, y et lui/leur quand on pronominalise une proposition infinitive.'),
    [
      b('Place a single clitic pronoun (the agent OR the object) before the perception verb', 'Placer un pronom unique (agent ou objet) devant le verbe de perception'),
      b('Master the two-pronoun rule: direct object + lui/leur before the perception verb', 'Maîtriser la règle des deux pronoms : COD + lui/leur devant le verbe de perception'),
      b('Notice how reflexives stay attached directly to the infinitive (Je l’ai vu se lever)', 'Garder le pronom réfléchi devant l’infinitif (Je l’ai vu se lever)'),
    ],
    13,
    [
      card(
        b('Where do pronouns go with voir / entendre?', 'Où placer les pronoms avec voir / entendre ?'),
        b(
          'Unlike ordinary infinitive phrases (*Je veux **le** voir*), perception verbs pull **object and agent pronouns** forward **in front of the perception verb** (or its auxiliary *avoir/être*): *J’ai vu Paul partir → Je **l’**ai vu partir*. Notice two key twists: (1) If the infinitive is **pronominal**, *se* stays right before the infinitive (*Je **l’**ai vu **se** lever*). (2) If **BOTH** the agent and the infinitive’s direct object become pronouns, the **object** becomes **le/la/les** and the **agent** shifts to **lui/leur**!\n\nOne pronoun: **je l’ai entendu jouer · je l’ai vu signer ce texte**.\nReflexive infinitive: **je l’ai vue s’approcher · je les ai entendus se disputer**.\nTwo pronouns (object + agent): **je le lui ai entendu dire · je la leur ai vu réparer**.',
          'Contrairement aux semi-auxiliaires (*Je veux **le** voir*), les verbes de perception attirent les pronoms **devant le verbe de perception** (ou son auxiliaire) : *J’ai vu Paul partir → Je **l’**ai vu partir*. Deux subtilités clés : (1) Si l’infinitif est **pronominal**, *se* reste devant l’infinitif (*Je **l’**ai vu **se** lever*). (2) Si l’on pronominalise à la fois le **COD** de l’infinitif et l’**agent**, l’objet prend **le/la/les** et l’agent devient **lui/leur** !\n\nUn seul pronom : **je l’ai entendu jouer · je l’ai vu signer ce texte**.\nInfinitif pronominal : **je l’ai vue s’approcher · je les ai entendus se disputer**.\nDeux pronoms : **je le lui ai entendu dire · je la leur ai vu réparer**.',
        ),
        {
          table: {
            head: [b('Full sentence', 'Phrase complète'), b('Pronominalized', 'Avec pronom(s)')],
            rows: [
              ['J’ai entendu Marc chanter.', 'Je l’ai entendu chanter.'],
              ['J’ai vu Sarah jouer ce morceau.', 'Je l’ai vue jouer ce morceau.'],
              ['J’ai vu Sarah s’éloigner.', 'Je l’ai vue s’éloigner.'],
              ['J’ai entendu Marc dire cela.', 'Je le lui ai entendu dire.'],
              ['J’ai vu les élèves rendre les copies.', 'Je les leur ai vus rendre.'],
            ],
          },
          ex: [
            ['Cette chanson, je l’ai souvent entendue jouer à la radio.', 'That song, I have often heard it played on the radio.'],
            ['Mon frère prétend le contraire, pourtant je le lui ai entendu dire hier !', 'My brother claims the opposite, yet I heard him say it yesterday!'],
            ['Nous les avons regardés s’installer autour de la grande table.', 'We watched them settle around the big table.'],
          ],
        },
      ),
      trap(
        b('Why two pronouns turn the agent into lui / leur', 'Pourquoi le second pronom devient lui / leur'),
        b(
          'French never puts two third-person direct object pronouns (*le le* or *la les*) side by side before one verb. So in *J’ai vu **Paul** réparer **la voiture***, if you replace **only Paul**, Paul is *le* (*Je **l’**ai vu réparer la voiture*). If you replace **only la voiture**, it is *la* (*Je **l’**ai vu réparer par Paul*). If you replace **BOTH**, *la voiture* keeps *la* and *Paul* becomes indirect **lui**: *Je **la lui** ai vu réparer*!\n\nOne pronoun (agent): **Je l’ai vu réparer la voiture**.\nTwo pronouns (object + agent): **Je la lui ai vu réparer**.',
          'Le français interdit deux pronoms COD de 3e personne côte à côte (*le le* est impossible). Dans *J’ai vu **Paul** réparer **la voiture***, si on ne remplace que **Paul**, il reste COD : *Je **l’**ai vu réparer la voiture*. Si on remplace **les deux**, *la voiture* reste **la** et *Paul* passe à l’indirect **lui** : *Je **la lui** ai vu réparer* !\n\nUn pronom (agent) : **Je l’ai vu réparer la voiture**.\nDeux pronoms (objet + agent) : **Je la lui ai vu réparer**.',
        ),
      ),
      mc(
        P.best,
        [
          'Je le lui ai entendu promettre.',
          'Je lui l’ai entendu promettre.',
          'Je le l’ai entendu promettre.',
          'J’ai entendu le lui promettre.',
        ],
        {
          fr: 'Replace both « cela » and « ma sœur » in: « J’ai entendu ma sœur promettre cela. »',
          explain: b('Put both clitics before ai entendu in French order: direct object (le) before indirect agent (lui) → Je le lui ai entendu promettre.', 'Les deux pronoms se placent devant ai entendu dans l’ordre COD (le) avant COI (lui) → Je le lui ai entendu promettre.'),
        },
      ),
      mc(
        P.form,
        ['je les ai vus se saluer', 'je se les ai vus saluer', 'je les me suis vus saluer', 'je leur ai vu se saluer'],
        {
          fr: 'En sortant du théâtre, ___ chaleureusement.',
          explain: b('The subject pronoun les moves before ai vus, while the reflexive pronoun se stays right before the infinitive saluer.', 'Le pronom les passe devant ai vus, tandis que le pronom réfléchi se reste devant l’infinitif saluer.'),
        },
      ),
      gap(
        P.complete,
        'Ce poème, je ___ (l’ai / lui ai) souvent entendu réciter par mon grand-père. Quant à cette promesse, je ___ (le leur / les leur) ai entendu formuler publiquement.',
        [['l’ai'], ['le leur']],
        {
          choices: [
            ['l’ai', 'lui ai', 'y ai'],
            ['le leur', 'les leur', 'leur le'],
          ],
        },
      ),
      sort(
        b('One pronoun or two pronouns?', 'Un seul pronom ou deux pronoms ?'),
        [
          b('One pronoun (agent OR object)', 'Un pronom (agent OU objet)'),
          b('Two pronouns (object + indirect agent)', 'Deux pronoms (objet + agent en lui/leur)'),
        ],
        [
          ['Je l’ai vu sortir.', 0],
          ['Je le lui ai vu signer.', 1],
          ['Nous les avons entendus rire.', 0],
          ['Nous la leur avons entendu chanter.', 1],
          ['Elle l’a regardé partir.', 0],
          ['Ils les lui ont vu réparer.', 1],
        ],
      ),
      ord(
        P.order,
        'Cette remarque, je la lui ai entendue dire plusieurs fois.',
        { tr: 'That remark, I heard her say it several times.' },
      ),
      dict('Je les ai regardés se préparer en silence avant leur entrée en scène.'),
      say('Ce secret, je ne le lui ai jamais entendu révéler à qui que ce soit.', 'That secret, I have never heard him or her reveal it to anyone.'),
    ],
    [
      b('Object and agent pronouns jump in front of the perception verb (Je l’ai entendu jouer), except reflexives which stay before the infinitive (Je l’ai vu s’approcher).', 'Les pronoms passent devant le verbe de perception (Je l’ai entendu jouer), sauf le pronom réfléchi qui reste devant l’infinitif.'),
      b('When replacing BOTH the agent and the infinitive’s direct object, use le/la/les + lui/leur before the perception verb.', 'Avec deux pronoms, l’objet prend le/la/les et l’agent prend lui/leur devant le verbe de perception.'),
    ],
    [
      ['entrer en scène', b('to go onstage', 'apparaître sur scène')],
      ['formuler une promesse', b('to make / word a promise', 'exprimer une promesse')],
      ['qui que ce soit', b('anyone at all', 'n’importe quelle personne')],
      ['à tue-tête', b('at the top of one’s lungs', 'à très haute voix')],
    ],
  ),

  lesson(
    C,
    3,
    ['past-participle-agreement-perception', 'accord-du-participe-passe-perception'],
    b('The classic rule: Je l’ai vue peindre vs. Je l’ai vu peindre', 'L’accord classique : Je l’ai vue peindre vs Je l’ai vu peindre'),
    b('Master the decisive semantic test behind past participle agreement with perception verbs.', 'Maîtriser le test sémantique qui commande l’accord du participe passé avec les verbes de perception.'),
    [
      b('Agree the participle when the preceding COD performs the infinitive action', 'Accorder le participe quand le COD placé devant accomplit l’action de l’infinitif'),
      b('Leave the participle invariable when the preceding COD undergoes the infinitive action', 'Laisser le participe invariable quand le COD placé devant subit l’action de l’infinitif'),
      b('Contrast perception verbs with faire + infinitif (always invariable)', 'Distinguer les verbes de perception de faire + infinitif (toujours invariable)'),
    ],
    13,
    [
      card(
        b('Does the pronoun DO the action or RECEIVE it?', 'Le pronom FAIT-il ou SUBIT-il l’action ?'),
        b(
          'In compound tenses with **avoir** (*j’ai vu, j’ai entendu, j’ai regardé*), when a direct object pronoun (**la, les, que…**) comes **before** the verb, ask one simple question: **Does that pronoun perform the action of the infinitive?**\n- If **YES** (it is the **agent** of the infinitive): **AGREE** (*Cette peintre, je l’ai **vue** peindre un portrait* — *she* is doing the painting!).\n- If **NO** (it **undergoes** a passive infinitive action): **NO AGREEMENT** (*Cette toile, je l’ai **vu** peindre par un élève* — *the canvas* is being painted, it doesn’t paint!).\n\nAgent does the action (agrees): **je l’ai vue peindre · les actrices que j’ai entendues chanter**.\nObject undergoes action (invariable): **la toile que j’ai vu peindre · les chansons que j’ai entendu chanter**.\nAlways invariable: **faire + infinitif (je les ai fait venir)**.',
          'Aux temps composés avec **avoir** (*j’ai vu, j’ai entendu, j’ai regardé*), quand un COD (**la, les, que…**) précède le verbe, posez une question décisive : **ce COD fait-il l’action exprimée par l’infinitif ?**\n- Si **OUI** (c’est l’**agent** de l’infinitif) : **ON ACCORDE** (*Cette artiste, je l’ai **vue** peindre un tableau* — c’est *elle* qui peint !).\n- Si **NON** (il **subit** l’action de l’infinitif, au sens passif) : **INVARIABLE** (*Cette fresque, je l’ai **vu** peindre par un élève* — la fresque est peinte !).\n\nLe COD agit (accord) : **je l’ai vue peindre · les actrices que j’ai entendues chanter**.\nLe COD subit (invariable) : **la toile que j’ai vu peindre · les chansons que j’ai entendu chanter**.\nToujours invariable : **faire + infinitif (je les ai fait venir)**.',
        ),
        {
          table: {
            head: [b('Sentence', 'Phrase'), b('Role of preceding COD', 'Rôle du COD antéposé'), b('Agreement?', 'Accord ?')],
            rows: [
              ['La soliste que j’ai entendue jouer…', b('the soloist plays (agent)', 'la soliste joue (agent)'), b('YES → entendue', 'OUI → entendue')],
              ['La sonate que j’ai entendu jouer…', b('the sonata is played (undergoes)', 'la sonate est jouée (subit)'), b('NO → entendu', 'NON → entendu')],
              ['Les enfants que j’ai regardés courir…', b('the children run (agent)', 'les enfants courent (agent)'), b('YES → regardés', 'OUI → regardés')],
              ['Les maisons que j’ai vu construire…', b('the houses are built (undergoes)', 'les maisons sont bâties (subit)'), b('NO → vu', 'NON → vu')],
              ['Les collègues que j’ai fait venir…', b('causative faire + inf.', 'factitif faire + inf.'), b('NEVER → fait', 'JAMAIS → fait')],
            ],
          },
          ex: [
            ['La violoniste que nous avons entendue jouer hier soir était remarquable.', 'The violinist whom we heard play last night was remarkable.'],
            ['C’est une pièce très rare que j’ai entendu jouer à Prague.', 'It is a very rare piece that I heard played in Prague.'],
            ['Les dossiers que j’ai fait imprimer ce matin sont sur votre bureau.', 'The files that I had printed this morning are on your desk.'],
          ],
        },
      ),
      trap(
        b('Compare two tricky cases: pronominal infinitives & faire', 'Deux cas piégeux : pronominaux et faire'),
        b(
          '1. With **faire + infinitive**, the past participle **fait** is **ALWAYS invariable**, even when the preceding object is the agent (*Les étudiantes que j’ai **fait** entrer* — never *faites*!).\n2. Watch the two-pronoun case from Lesson 2: in *Cette lettre, je **la** lui ai **vu** écrire*, *la* = *cette lettre* (undergoes writing!), while *lui* = the writer (indirect!). Because *la* does NOT write, **vu** stays invariable! (Note: under the 1990 spelling reform, even agent-performed infinitives with *laisser* stay invariable like *faire*, though traditional agreement remains standard with *voir/entendre*.)\n\nAgrees (agent = direct object): **les oiseaux que j’ai vus voler**.\nInvariable (undergoes or faire): **la lettre que je lui ai vu écrire · les amis que j’ai fait rire**.',
          '1. Avec **faire + infinitif**, le participe **fait** est **TOUJOURS invariable**, même si le COD agit (*Les étudiantes que j’ai **fait** entrer* — jamais *faites* !).\n2. Dans le cas à deux pronoms (*Cette lettre, je **la** lui ai **vu** écrire*), *la* reprend *cette lettre* (qui subit l’action d’être écrite), et l’auteur est *lui* (indirect). Comme *la* n’écrit pas, **vu** reste invariable !\n\nAccord (COD = agent) : **les oiseaux que j’ai vus voler**.\nInvariable (COD subit ou faire) : **la lettre que je lui ai vu écrire · les amis que j’ai fait rire**.',
        ),
      ),
      mc(
        P.spelling,
        ['entendue', 'entendu', 'entendues', 'entendus'],
        {
          fr: 'La chanteuse que nous avons ___ chanter en rappel a bouleversé le public.',
          explain: b('The preceding COD (que = la chanteuse) performs the singing, so entendue agrees in the feminine singular.', 'Le COD antéposé (que = la chanteuse) fait l’action de chanter : entendue s’accorde au féminin singulier.'),
        },
      ),
      mc(
        P.spelling,
        ['entendu', 'entendue', 'entendues', 'entendus'],
        {
          fr: 'La symphonie que nous avons ___ interpréter à Vienne reste inoubliable.',
          explain: b('The symphony does not perform the interpreting—it is interpreted! So entendu stays invariable.', 'La symphonie subit l’action d’être interprétée : entendu reste invariable.'),
        },
      ),
      mc(
        P.spelling,
        ['fait', 'faites', 'faite', 'faits'],
        {
          fr: 'Les ingénieures que le directeur a ___ venir d’urgence ont trouvé la panne.',
          explain: b('Fait + infinitive is ALWAYS invariable in French, even when the preceding COD performs the action.', 'Fait suivi d’un infinitif est TOUJOURS invariable, même lorsque le COD fait l’action.'),
        },
      ),
      gap(
        P.complete,
        'Les danseuses que j’ai ___ (regarder) répéter étaient épuisées. Les maquettes que j’ai ___ (voir) construire au musée m’ont impressionné. Quant aux invitées, je les ai ___ (faire) patienter au salon.',
        [['regardées'], ['vu'], ['fait']],
        {
          strict: true,
          hint: b('Ask for each blank: does the preceding feminine plural COD perform the infinitive, undergo it, or follow faire?', 'Demandez-vous pour chaque trou si le COD féminin pluriel fait l’action, la subit ou suit faire.'),
        },
      ),
      sort(
        b('Agrees or stays invariable?', 'Accord ou invariable ?'),
        [
          b('Agrees with preceding COD', 'S’accorde avec le COD antéposé'),
          b('Stays invariable', 'Reste invariable'),
        ],
        [
          ['les comédiennes que j’ai vues jouer', 0],
          ['les pièces que j’ai vu jouer', 1],
          ['la pluie que j’ai entendue tomber', 0],
          ['la maison que j’ai vu bâtir', 1],
          ['les clientes que j’ai fait entrer', 1],
          ['mes sœurs que j’ai regardées partir', 0],
        ],
      ),
      dlg(
        b('Backstage after the premiere', 'Dans les coulisses après la première'),
        b('Sophie and Rémi discuss the concert they just attended.', 'Sophie et Rémi commentent le concert auquel ils viennent d’assister.'),
        [['Sophie', 'f'], ['Rémi', 'm']],
        [
          [0, 'Quelle soirée ! La soliste que nous avons entendue jouer ce soir a un jeu lumineux.', 'What an evening! The soloist we heard play tonight has a luminous touch.'],
          [1, { options: ['Oui, et les deux sonates que nous avons entendu interpréter en seconde partie étaient très rares.', 'Oui, et les deux sonates que nous avons entendues interpréter en seconde partie étaient très rares.', 'Oui, et les deux sonates que nous avons fait interpréter étaient très rares.'] }],
          [0, 'As-tu remarqué les étudiants du conservatoire au premier rang ?', 'Did you notice the conservatory students in the front row?'],
          [1, { options: ['Oui, c’est leur professeure qui les a fait venir pour qu’ils observent la mise en scène.', 'Oui, c’est leur professeure qui les a faits venir pour qu’ils observent la mise en scène.', 'Oui, c’est leur professeure qui leur a fait venir pour qu’ils observent.'] }],
        ],
      ),
      ord(
        P.order,
        'Voici l’artiste que j’ai vue sculpter cette statue monumentale.',
        { tr: 'Here is the artist whom I saw sculpt this monumental statue.' },
      ),
      say('Ces œuvres que j’avais vu restaurer l’an dernier sont enfin exposées.', 'These works that I had seen restored last year are finally on display.'),
      write(
        b('Review a live cultural performance', 'Commenter un spectacle vivant avec précision'),
        b(
          'In 50 to 80 words, describe a concert, theater rehearsal, or exhibition setup you witnessed. Include one agreed perception participle (COD performs the action), one invariable perception participle (COD undergoes the action), and one fait + infinitive construction.',
          'En 50 à 80 mots, racontez un concert, une répétition ou le montage d’une exposition auquel vous avez assisté. Intégrez un participe passé accordé après verbe de perception (le COD agit), un participe invariable (le COD subit) et une tournure avec fait + infinitif.',
        ),
        50,
        80,
        [
          b('One agreed participle after voir / entendre / regarder (COD performs)', 'Un participe passé accordé après voir / entendre / regarder (COD agent)'),
          b('One invariable participle after voir / entendre (COD undergoes)', 'Un participe passé invariable après voir / entendre (COD subit l’action)'),
          b('One invariable fait + infinitive construction', 'Une tournure invariable avec fait + infinitif'),
        ],
        'Samedi, j’ai assisté au montage de la nouvelle exposition municipale. Les sculptrices que j’ai vues installer leurs œuvres en bronze travaillaient avec une précision admirable. J’ai aussi admiré deux grandes fresques que j’avais vu restaurer l’hiver dernier par des apprentis. Pour éclairer l’ensemble, la conservatrice a fait venir trois techniciens spécialisés dès le matin.',
        {
          phrases: ['que j’ai vues installer', 'que j’avais vu restaurer', 'a fait venir'],
        },
      ),
    ],
    [
      b('With perception verbs + infinitive, agree the past participle ONLY when the preceding COD performs the infinitive action.', 'Avec un verbe de perception + infinitif, accordez le participe passé UNIQUEMENT si le COD antéposé fait l’action de l’infinitif.'),
      b('When the preceding COD undergoes a passive infinitive action (la pièce que j’ai vu jouer), keep the participle invariable.', 'Quand le COD antéposé subit l’action (la pièce que j’ai vu jouer), laissez le participe invariable.'),
      b('With faire + infinitive, fait is ALWAYS invariable (les personnes que j’ai fait venir).', 'Avec faire + infinitif, fait reste TOUJOURS invariable (les personnes que j’ai fait venir).'),
    ],
    [
      ['une fresque', b('a fresco, mural', 'une peinture murale')],
      ['un rappel', b('an encore (at a concert)', 'un morceau joué à la fin sur applaudissements')],
      ['interpréter', b('to perform (a piece)', 'jouer une œuvre musicale ou théâtrale')],
      ['restaurer', b('to restore (an artwork)', 'remettre en état d’origine')],
    ],
  ),
];

export default lessons;
