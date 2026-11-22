import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je cherche quelqu’un qui sache… / J’ai trouvé quelqu’un qui sait… C’est le meilleur film que j’aie jamais vu. At B2, choosing between the indicative and the subjunctive inside relative clauses expresses your exact stance on reality: uncertain wish vs concrete fact, non-existence, or sweeping superlative evaluation. This four-lesson course trains every nuance, including when reality restores the indicative.',
    'Je cherche quelqu’un qui sache… ou J’ai trouvé quelqu’un qui sait… C’est le meilleur film que j’aie jamais vu. Au niveau B2, le choix entre indicatif et subjonctif dans une proposition relative exprime votre rapport exact au réel : quête incertaine ou fait avéré, négation d’existence, ou jugement superlatif. Ce cours en quatre leçons entraîne chaque nuance, y compris le retour de l’indicatif devant un fait objectif.',
  ),
  outcomes: [
    b('Contrast indefinite or hypothetical antecedents (subjunctive) with real, known ones (indicative)', 'Opposer un antécédent indéfini ou hypothétique (subjonctif) à un antécédent réel et connu (indicatif)'),
    b('Use the subjunctive systematically after negative and questioning antecedents (personne qui puisse)', 'Employer le subjonctif après un antécédent négatif ou interrogatif (personne qui puisse)'),
    b('Apply the subjunctive after superlatives and exclusivity markers (le seul, l’unique, le premier, le dernier)', 'Appliquer le subjonctif après les superlatifs et termes d’exclusivité (le seul, l’unique, le premier, le dernier)'),
    b('Judge at B2 when an indisputable factual superlative keeps the indicative', 'Distinguer au niveau B2 quand un fait objectif indiscutable garde l’indicatif'),
  ],
};

const C = 'gr-subjunctive-relatives-superlatives';

const lessons: Lesson[] = [
  lesson(C, 1, ['indefinite-vs-known-antecedent', 'antecedent-indefini-ou-connu'],
    b('Seeking an ideal vs finding reality (qui sache vs qui sait)', 'Chercher un idéal ou décrire le réel (qui sache ou qui sait ?)'),
    b('Use the subjunctive when the person or thing you describe is not yet certain to exist—and the indicative once it is real.', 'Employez le subjonctif quand l’existence de la personne ou de la chose reste incertaine — et l’indicatif quand elle est avérée.'),
    [
      b('Identify search, wish and uncertainty triggers before a relative clause', 'Repérer les verbes de recherche, souhait ou doute devant une relative'),
      b('Switch to the indicative when the antecedent is identified or known', 'Basculer à l’indicatif dès que l’antécédent est trouvé ou connu'),
      b('Recognize key irregular subjunctives inside relative clauses (sache, puisse, ait, soit, veuille)', 'Reconnaître les subjonctifs irréguliers clés dans la relative (sache, puisse, ait, soit, veuille)'),
    ],
    13,
    [
      card(b('Two mental worlds inside the relative clause', 'Deux regards sur la réalité dans la relative'), b('In a relative clause (**qui / que / dont / où**), the mood signals whether the noun exists for sure.\n- **Subjunctive**: you are **looking for, hoping for, or imagining** someone/something whose existence is not guaranteed (**chercher, vouloir, souhaiter, avoir besoin de** + indefinite **un, une, des, quelqu’un**).\n- **Indicative**: the person or thing is **real, found, or guaranteed** (**j’ai trouvé, je connais, voici, il existe**).\nHypothetical triggers: **chercher un(e), vouloir un(e), avoir besoin de quelqu’un qui**.\nReal triggers: **connaître quelqu’un qui, avoir trouvé un(e), voir un(e)**.', 'Dans une proposition relative (**qui / que / dont / où**), le mode indique si l’objet ou la personne est garanti(e) dans le réel.\n- **Subjonctif** : vous **cherchez, souhaitez ou imaginez** un profil idéal dont l’existence reste incertaine (**chercher, vouloir, souhaiter, avoir besoin de** + **un, une, des, quelqu’un**).\n- **Indicatif** : la personne ou la chose est **réelle, trouvée ou connue** (**j’ai trouvé, je connais, voici, il existe**).\nIndices d’hypothèse : **chercher un(e), vouloir un(e), avoir besoin de quelqu’un qui**.\nIndices de réalité : **connaître quelqu’un qui, avoir trouvé un(e), voir un(e)**.'), {
        table: {
          head: [b('Stance', 'Point de vue'), b('Mood', 'Mode'), b('Example', 'Exemple')],
          rows: [
            [b('Uncertain search / wish', 'Quête / souhait incertain'), b('Subjonctif', 'Subjonctif'), 'Je cherche un appartement qui ait un balcon.'],
            [b('Known / already found', 'Réel / déjà trouvé'), b('Indicatif', 'Indicatif'), 'J’ai loué un appartement qui a un balcon.'],
            [b('Open question', 'Question ouverte'), b('Subjonctif', 'Subjonctif'), 'Connaissez-vous quelqu’un qui sache réparer cette horloge ?'],
            [b('Certain existence', 'Existence certaine'), b('Indicatif', 'Indicatif'), 'Oui, je connais un artisan qui sait la réparer.'],
          ],
        },
        ex: [
          ['Nous voudrions un logiciel qui soit simple et accessible hors ligne.', 'We would like software that is simple and accessible offline.'],
          ['Nous utilisons un logiciel qui est simple et accessible hors ligne.', 'We use software that is simple and accessible offline.'],
          ['Il me faudrait un traducteur qui connaisse bien le droit maritime.', 'I would need a translator who knows maritime law well.'],
        ],
      }),
      tip(b('Watch out for definite articles in a search!', 'Attention à l’article défini même avec chercher !'), b('If you say *Je cherche **le** collègue qui…* (definite **le / la** = a specific person you already know exists!), use the **indicative**: *Je cherche le collègue qui **a** les clés de la salle.* With indefinite **un** (*un collègue qui ait*), the person is hypothetical, so use the **subjunctive**!\nDefinite (real): **Je cherche le livre qui explique cette règle.**\nIndefinite (ideal): **Je cherche un livre qui explique bien cette règle.**', 'Si vous dites *Je cherche **le** collègue qui…* (article défini = une personne précise dont l’existence est sûre !), mettez l’**indicatif** : *Je cherche le collègue qui **a** les clés de la salle.* Avec **un** indéfini (*un collègue qui ait*), le profil reste à trouver : mettez le **subjonctif** !\nDéfini (réel) : **Je cherche le livre qui parle de ce sujet.**\nIndéfini (idéal) : **Je cherche un livre qui sache tout expliquer.**')),
      mc(P.form, ['sache', 'sait', 'saura', 'savait'], { fr: 'Pour ce poste urgent, nous recherchons un candidat qui ___ parler couramment japonais.', explain: b('Searching for an indefinite candidate with an ideal skill takes the subjunctive (sache).', 'La recherche d’un candidat indéfini au profil souhaité demande le subjonctif (sache).') }),
      hear('J’ai enfin trouvé une couturière qui sait réparer ce type de manteau.', P.meaning, [
        b('She actually exists and has been found (certainty).', 'La couturière est trouvée et existe bel et bien (certitude).'),
        b('The speaker is still searching desperately.', 'La personne cherche encore sans avoir trouvé.'),
        b('Nobody knows how to mend the coat.', 'Personne ne sait réparer ce manteau.'),
      ]),
      sort(b('Hypothetical wish (subjunctive) or verified reality (indicative)?', 'Souhait hypothétique (subjonctif) ou fait avéré (indicatif) ?'), [
        b('Subjunctive (uncertain / ideal)', 'Subjonctif (incertain / souhaité)'),
        b('Indicative (real / identified)', 'Indicatif (réel / identifié)'),
      ], [
        ['Je cherche une salle qui ___ (pouvoir) accueillir cinquante invités.', 0],
        ['Voici une salle qui ___ (pouvoir) accueillir cinquante invités.', 1],
        ['Connais-tu un garage qui ___ (être) ouvert le dimanche ?', 0],
        ['Je vais au garage qui ___ (être) ouvert le dimanche.', 1],
        ['Il aimerait un vélo qui ___ (faire) moins de dix kilos.', 0],
        ['Il a acheté un vélo qui ___ (faire) moins de dix kilos.', 1],
      ]),
      gap(P.complete, 'Avant de partir, je voudrais trouver quelqu’un qui ___ (pouvoir — subj.) arroser mes plantes. Ah, super : ma voisine connaît justement une étudiante qui ___ (avoir — ind.) du temps libre !', [['puisse'], ['a']], {
        choices: [
          ['puisse', 'peut', 'pourra'],
          ['a', 'ait', 'avait'],
        ],
      }),
      pairs(P.match, [
        ['un guide qui connaisse la région', b('a guide who might know the region (wanted)', 'un guide idéal que l’on cherche encore')],
        ['un guide qui connaît la région', b('a guide who knows the region (real)', 'un guide réel déjà identifié')],
        ['le collègue qui a la clé', b('the specific colleague with the key', 'le collègue précis que l’on sait détenteur de la clé')],
        ['quelqu’un qui veuille bien aider', b('someone willing to help (hoped for)', 'une bonne volonté recherchée')],
      ]),
      ord(P.order, 'Nous avons besoin d’une solution qui tienne compte de tous les avis.', {
        tr: b('We need a solution that takes every opinion into account.', 'Il nous faut une solution qui prenne en compte chaque avis.'),
        extra: ['tient', 'tiendra'],
      }),
      dict('Je cherche quelqu’un qui fasse preuve de calme et qui sache écouter sans interrompre.'),
      say('Nous souhaitons recruter une personne qui ait déjà mené des projets similaires.', 'We wish to recruit someone who has already led similar projects.'),
    ],
    [
      b('Uncertain or desired indefinite antecedents (chercher, vouloir + un/quelqu’un) take the subjunctive.', 'Un antécédent indéfini souhaité ou incertain (chercher, vouloir + un/quelqu’un) prend le subjonctif.'),
      b('Identified or already-found antecedents (j’ai trouvé, voici, le/la + nom précis) take the indicative.', 'Un antécédent trouvé ou identifié (j’ai trouvé, voici, le/la + nom précis) prend l’indicatif.'),
      b('Definite le/la even after chercher points to a real thing and keeps the indicative.', 'L’article défini le/la même après chercher renvoie au réel et garde l’indicatif.'),
    ],
    [
      ['qui sache', b('who knows how to (subjunctive)', 'subjonctif de savoir')],
      ['qui puisse', b('who can / may (subjunctive)', 'subjonctif de pouvoir')],
      ['qui ait', b('who has (subjunctive)', 'subjonctif d’avoir')],
      ['qui tienne compte de', b('that takes into account (subjunctive)', 'subjonctif de tenir')],
    ],
  ),

  lesson(C, 2, ['negative-and-restrictive-antecedents', 'antecedents-negatifs-et-restrictifs'],
    b('Negative & questioning antecedents (Il n’y a personne qui puisse…)', 'Antécédents négatifs et interrogatifs (Il n’y a personne qui puisse…)'),
    b('When you deny or question the existence of someone or something, the relative clause shifts into the subjunctive.', 'Quand on nie ou questionne l’existence d’un être ou d’une chose, la relative bascule au subjonctif.'),
    [
      b('Use the subjunctive after personne, rien, aucun, pas de and sans + relative', 'Employer le subjonctif après personne, rien, aucun, pas de et sans + relative'),
      b('Keep the relative free of redundant *pas* after personne/rien/aucun', 'Éviter un *pas* redondant dans la relative après personne/rien/aucun'),
      b('Use the subjunctive in open yes/no questions probing existence (Y a-t-il… ?)', 'Employer le subjonctif dans les questions ouvertes sur l’existence (Y a-t-il… ?)'),
    ],
    13,
    [
      card(b('Denying existence triggers the subjunctive', 'Nier l’existence entraîne le subjonctif'), b('If the main clause says **no one**, **nothing**, **not a single**, or **without any** such person or thing exists, the relative clause describes an **empty set** — a classic B2 subjunctive trigger!\nNegative triggers: **il n’y a personne qui, il n’y a rien qui, je ne connais aucun(e) … qui, sans … qui**.\nInterrogative triggers: **y a-t-il quelqu’un qui, existe-t-il un moyen qui**.', 'Si la proposition principale affirme qu’il n’existe **personne**, **rien**, **aucun(e)** ou **pas de** tel élément, la relative décrit une **absence** — déclencheur systématique du subjonctif au niveau B2 !\nDéclencheurs négatifs : **il n’y a personne qui, il n’y a rien qui, je ne connais aucun(e) … qui, sans … qui**.\nDéclencheurs interrogatifs : **y a-t-il quelqu’un qui, existe-t-il un moyen qui**.'), {
        table: {
          head: [b('Negative / Question frame', 'Structure négative / interrogative'), b('Subjunctive relative', 'Relative au subjonctif')],
          rows: [
            ['Il n’y a personne qui…', 'Il n’y a personne qui comprenne ce dossier.'],
            ['Il n’y a rien qui / que…', 'Il n’y a rien qui me fasse plus plaisir !'],
            ['Je ne connais aucun(e) X qui…', 'Je ne connais aucun hôtel qui soit calme en août.'],
            ['Il n’existe pas de X qui…', 'Il n’existe pas de méthode qui garantisse tout.'],
            ['Y a-t-il quelqu’un qui… ?', 'Y a-t-il un étudiant qui veuille présenter ?'],
          ],
        },
        ex: [
          ['Dans ce quartier, il n’y a aucun commerce qui reste ouvert après vingt-deux heures.', 'In this neighborhood, there is no shop that stays open after 10 p.m.'],
          ['Y a-t-il vraiment quelqu’un ici qui croie cette rumeur ?', 'Is there really anyone here who believes this rumor?'],
          ['On ne peut pas décider sans qu’il y ait une preuve qui confirme les faits.', 'We cannot decide without there being proof that confirms the facts.'],
        ],
      }),
      trap(b('Don’t add *pas* inside the relative!', 'Ne rajoutez pas *pas* dans la relative !'), b('When the main clause already contains **personne, rien, aucun, pas de**, do **NOT** put *ne… pas* inside the relative clause unless you mean a double negative (“there’s nobody who DOESN’T know”). Say **Il n’y a rien qui me plaise** (there is nothing that pleases me), NOT *rien qui ne me plaise pas*!\nClean single negative: **Il n’y a personne qui sache le code.**\nIntentional double negative: **Il n’y a personne qui ne connaisse cette chanson** (= everyone knows it!).', 'Quand la principale contient déjà **personne, rien, aucun, pas de**, ne rajoutez PAS *ne… pas* dans la relative, sinon vous inversez le sens en double négation (« tout le monde connaît ») ! Dites **Il n’y a rien qui me plaise**, pas *rien qui ne me plaise pas* !\nNégation simple juste : **Il n’y a personne qui sache le code.**\nDouble négation voulue : **Il n’y a personne qui ne connaisse cette chanson** (= tout le monde la connaît !).')),
      mc(P.form, ['soit', 'est', 'sera', 'était'], { fr: 'Dans toute la ville, je ne vois aucune boulangerie qui ___ encore ouverte à cette heure.', explain: b('Aucune boulangerie (negative existence) triggers the subjunctive (soit).', 'Aucune boulangerie nie l’existence et demande le subjonctif (soit).') }),
      mc(P.meaning, [
        b('Everyone knows this neighborhood.', 'Tout le monde connaît ce quartier (double négation).'),
        b('Nobody knows this neighborhood.', 'Personne ne connaît ce quartier.'),
        b('Only two people know this neighborhood.', 'Seules deux personnes connaissent ce quartier.'),
      ], { fr: 'À Lyon, il n’y a personne qui ne connaisse ce quartier !' }),
      sort(b('Subjunctive or indicative?', 'Subjonctif ou indicatif ?'), [
        b('Subjunctive (negative / open existence question)', 'Subjonctif (négation / question d’existence)'),
        b('Indicative (affirmative real existence)', 'Indicatif (affirmation d’un fait réel)'),
      ], [
        ['Il n’y a rien qui ___ (pouvoir) nous arrêter.', 0],
        ['Il y a un détail qui ___ (pouvoir) tout bloquer.', 1],
        ['Je ne connais personne qui ___ (aller) si vite.', 0],
        ['Je connais un collègue qui ___ (aller) très vite.', 1],
        ['Existe-t-il un train qui ___ (arriver) avant neuf heures ?', 0],
        ['Voici le train qui ___ (arriver) avant neuf heures.', 1],
      ]),
      gap(P.complete, 'Malgré nos recherches, nous n’avons trouvé aucun document qui ___ (contenir — subj.) sa signature, et il n’y a personne au bureau qui ___ (savoir — subj.) où il l’a rangé.', [['contienne'], ['sache']], {
        choices: [
          ['contienne', 'contient', 'contiendra'],
          ['sache', 'sait', 'savait'],
        ],
      }),
      pairs(P.match, [
        ['aucun train qui parte tôt', b('no train that leaves early', 'aucun train partant tôt')],
        ['personne qui veuille répondre', b('no one who wants to answer', 'aucune personne volontaire pour répondre')],
        ['rien qui vaille la peine', b('nothing worthwhile', 'rien d’intéressant ou d’utile')],
        ['pas un bruit qui trouble', b('not a sound that disturbs', 'aucun bruit dérangeant')],
      ]),
      ord(P.order, 'Il n’existe aucune règle qui justifie une telle décision.', {
        tr: b('There is no rule that justifies such a decision.', 'Aucune règle existante ne justifie une telle décision.'),
        extra: ['justifiera', 'pas'],
      }),
      dlg(b('Late arrival at the station', 'Arrivée tardive à la gare'), b('Nora and Karim look for a ride at midnight.', 'Nora et Karim cherchent un moyen de rentrer à minuit.'), [['Nora', 'f2'], ['Karim', 'm2']], [
        [0, 'Le dernier tram est passé… Tu crois qu’il reste un bus qui desserve notre quartier ?', 'The last tram has left… Do you think there’s still a bus serving our neighborhood?'],
        [1, { options: ['À minuit, je ne connais aucune ligne qui passe encore par là, et il n’y a personne qui puisse venir nous chercher.', 'À minuit, je ne connais aucune ligne qui passe par là, et il n’y a personne qui peut venir.', 'Il n’y a personne qui ne puisse pas venir !'], explain: b('Both aucune ligne qui passe (look: passer -er has identical subjunctive/indicative passe) and personne qui puisse use the subjunctive without redundant pas.', 'Aucune ligne et personne appellent le subjonctif (puisse) sans pas redondant.') }],
        [0, 'Bon, prenons un vélo en libre-service si la borne fonctionne !', 'Okay, let’s take a bike-share if the dock is working!'],
      ]),
      dict('Il n’y a rien qui me rende plus fier que de voir toute l’équipe réussir ensemble.'),
      say('Je ne connais aucun restaurant ici qui serve après vingt-trois heures.', 'I don’t know any restaurant here that serves after 11 p.m.'),
    ],
    [
      b('Negative antecedents (personne, rien, aucun, pas de) require the subjunctive in the relative clause.', 'Les antécédents négatifs (personne, rien, aucun, pas de) demandent le subjonctif dans la relative.'),
      b('Existence questions (Y a-t-il quelqu’un qui… ?) take the subjunctive when the answer is open.', 'Les questions sur l’existence (Y a-t-il quelqu’un qui… ?) prennent le subjonctif quand l’issue reste ouverte.'),
      b('Never add a redundant *pas* inside the relative unless you intend a double negative (“everyone”).', 'N’ajoutez jamais un *pas* redondant dans la relative, sauf double négation voulue (« tout le monde »).'),
    ],
    [
      ['il n’y a personne qui', b('there is nobody who', 'aucune personne qui')],
      ['il n’y a rien qui', b('there is nothing that', 'aucune chose qui')],
      ['aucun(e) … qui soit', b('no … that is (subjunctive)', 'aucun élément qui soit')],
      ['rien qui vaille', b('nothing worth (from valoir)', 'rien d’assez valable (verbe valoir)')],
    ],
  ),

  lesson(C, 3, ['superlatives-le-seul-lunique', 'superlatifs-le-seul-lunique'],
    b('Superlatives & exclusivity (le plus… qui, le seul, l’unique, le premier)', 'Superlatifs et exclusivité (le plus… qui, le seul, l’unique, le premier)'),
    b('Express extreme claims and unique cases with the subjunctive—and remember how jamais works without ne.', 'Exprimez jugements extrêmes et cas uniques au subjonctif — sans jamais ajouter ne devant jamais.'),
    [
      b('Use the subjunctive after superlatives followed by qui / que / dont', 'Employer le subjonctif après les superlatifs suivis de qui / que / dont'),
      b('Apply the subjunctive after le seul, l’unique, le premier, le dernier and ne… que', 'Appliquer le subjonctif après le seul, l’unique, le premier, le dernier et ne… que'),
      b('Use passé du subjonctif (que j’aie jamais vu) correctly without ne', 'Employer le subjonctif passé (que j’aie jamais vu) sans mettre ne'),
    ],
    13,
    [
      card(b('Superlatives & “only / first / last” + subjunctive', 'Superlatifs et termes uniques + subjonctif'), b('Whenever you single something out as the **most / least / best / worst**, or the **only / unique / first / last** of its kind, French usually places the relative clause in the **subjunctive** (often the **passé du subjonctif** for past experience!).\nSuperlative triggers: **le plus + adj., le moins + adj., le meilleur, le pire**.\nExclusivity triggers: **le seul, l’unique, le premier, le dernier, ne… que**.', 'Dès qu’on isole un élément comme **le plus / le moins / le meilleur / le pire**, ou comme **le seul, l’unique, le premier, le dernier**, le français emploie généralement le **subjonctif** dans la relative (souvent le **subjonctif passé** pour une expérience passée !).\nSuperlatifs : **le plus + adj., le moins + adj., le meilleur, le pire**.\nExclusivité : **le seul, l’unique, le premier, le dernier, ne… que**.'), {
        table: {
          head: [b('Trigger', 'Déclencheur'), b('Subjunctive tense', 'Temps du subjonctif'), b('Example', 'Exemple')],
          rows: [
            ['le meilleur / le plus…', b('Passé du subjonctif', 'Subjonctif passé'), 'C’est le meilleur roman que j’aie jamais lu.'],
            ['le pire / le moins…', b('Présent du subjonctif', 'Subjonctif présent'), 'C’est la pire excuse qu’on puisse inventer.'],
            ['le seul / l’unique', b('Présent du subjonctif', 'Subjonctif présent'), 'Tu es la seule collègue qui comprenne ce système.'],
            ['le premier / le dernier', b('Passé du subjonctif', 'Subjonctif passé'), 'C’est le premier film qu’elle ait réalisé.'],
          ],
        },
        ex: [
          ['C’est la ville la plus vivante que je connaisse en Europe.', 'It is the liveliest city that I know in Europe.'],
          ['Voilà l’unique solution qui soit réellement réaliste.', 'Here is the only solution that is truly realistic.'],
          ['C’est le dernier train qui parte pour Bordeaux ce soir.', 'That is the last train leaving for Bordeaux tonight.'],
        ],
      }),
      trap(b('Jamais = “ever” (NO ne!) & past participle agreement', 'Jamais = « de toute ma vie » (SANS ne !) et accord'), b('In *C’est la plus belle pièce que j’**aie jamais vue***, **jamais** means **ever** — do NOT insert *ne*! Also remember the **direct object agreement** on the past participle when **que** refers to a feminine or plural noun (*la plus belle pièce que j’aie vu**e***, *les meilleurs amis que j’aie eu**s***).\nNo ne with jamais: **que j’aie jamais vu, qu’il ait jamais écrit, que nous ayons jamais entendue**.', 'Dans *C’est la plus belle pièce que j’**aie jamais vue***, **jamais** signifie **de toute ma vie** — n’ajoutez surtout pas *ne* ! Et n’oubliez pas l’accord du participe passé avec **que** placé avant **avoir** (*la plus belle pièce que j’aie vu**e***).\nJamais positif : **que j’aie jamais vu, qu’il ait jamais écrit, que nous ayons jamais entendue**.')),
      mc(P.form, ['que j’aie jamais vu', 'que j’ai jamais vu', 'que je n’aie jamais vu', 'que j’avais jamais vu'], { fr: 'Sortons du cinéma ! Franchement, c’est le film le plus touchant ___.' }),
      hear('Tu es vraiment la seule personne qui sache rester calme dans cette situation.', P.meaning, [
        b('Nobody else manages to stay calm like you do.', 'Personne d’autre n’arrive à garder son calme comme toi.'),
        b('Everyone here stays calm.', 'Tout le monde garde son calme ici.'),
        b('You are looking for someone calm.', 'Tu cherches quelqu’un de calme.'),
      ]),
      sort(b('Which mood and tense fit best?', 'Quel mode et quel temps conviennent ?'), [
        b('Present subjunctive (ongoing trait / quality)', 'Subjonctif présent (trait actuel)'),
        b('Past subjunctive (completed life experience)', 'Subjonctif passé (expérience passée)'),
      ], [
        ['la meilleure décision qu’il ___ (prendre) l’an dernier', 1],
        ['la seule personne qui ___ (pouvoir) signer aujourd’hui', 0],
        ['le plus beau concert auquel j’___ (assister) jusqu’ici', 1],
        ['l’unique voie qui ___ (mener) au sommet', 0],
        ['le premier essai qu’elle ___ (réussir) du premier coup', 1],
        ['le pire scénario que l’on ___ (imaginer) actuellement', 0],
      ]),
      gap(P.complete, 'Pour moi, Grenoble est la ville la plus sportive que je ___ (connaître — subj. pr.), et cette randonnée reste la plus longue que nous ___ (faire — subj. passé) ensemble.', [['connaisse'], ['ayons faite']], {
        choices: [
          ['connaisse', 'connais', 'connaîtrai'],
          ['ayons faite', 'avons faite', 'faisions'],
        ],
      }),
      pairs(P.match, [
        ['le seul argument qui tienne', b('the only argument that holds up', 'le seul argument vraiment solide')],
        ['le meilleur café que j’aie bu', b('the best coffee I have ever drunk', 'le meilleur café de toute mon expérience')],
        ['la première fois qu’il soit venu', b('the first time he has come', 'sa toute première venue')],
        ['l’unique issue qui reste', b('the only exit that remains', 'la seule sortie disponible')],
      ]),
      ord(P.order, 'C’est l’erreur la plus fréquente que les candidats puissent commettre.', {
        tr: b('It is the most frequent mistake that candidates can make.', 'C’est la faute la plus courante que puissent faire les candidats.'),
        extra: ['peuvent', 'ne'],
      }),
      dict('C’est la seule explication qui soit claire et la meilleure synthèse que vous ayez écrite.'),
      say('C’est sans doute le plus beau paysage que nous ayons jamais admiré.', 'It is surely the most beautiful landscape we have ever admired.'),
    ],
    [
      b('Superlatives (le plus, le meilleur, le pire) + relative clause take the subjunctive.', 'Les superlatifs (le plus, le meilleur, le pire) + relative demandent le subjonctif.'),
      b('Exclusivity words (le seul, l’unique, le premier, le dernier) trigger the subjunctive.', 'Les mots d’exclusivité (le seul, l’unique, le premier, le dernier) appellent le subjonctif.'),
      b('Use the past subjunctive without ne for “ever” (que j’aie jamais vue), remembering COD agreement.', 'Employez le subjonctif passé sans ne pour « jamais » (que j’aie jamais vue), avec accord du COD.'),
    ],
    [
      ['que j’aie jamais vu', b('that I have ever seen', 'de toute mon expérience (sans ne)')],
      ['le seul qui puisse', b('the only one who can', 'l’unique personne capable de')],
      ['l’unique moyen qui soit', b('the only way that is', 'le seul procédé qui soit')],
      ['dont je me souvienne', b('that I remember (subjunctive)', 'dont je garde le souvenir (subjonctif)')],
    ],
  ),

  lesson(C, 4, ['fact-vs-judgment-nuances', 'fait-indiscutable-ou-jugement'],
    b('B2 nuance: objective fact (indicative) vs sweeping claim (subjunctive)', 'Nuance B2 : fait objectif (indicatif) ou jugement absolu (subjonctif)'),
    b('Even after le premier, le seul or a superlative, B2 French keeps the indicative when stating an indisputable factual event.', 'Même après le premier, le seul ou un superlatif, le français B2 garde l’indicatif devant un fait objectif et incontestable.'),
    [
      b('Distinguish factual chronology or physical reality (indicative) from personal evaluation (subjunctive)', 'Distinguer chronologie ou fait matériel (indicatif) et appréciation personnelle (subjonctif)'),
      b('Handle dont and où inside subjunctive vs indicative relatives cleanly', 'Maîtriser dont et où dans les relatives au subjonctif ou à l’indicatif'),
      b('Write a B2 critical review combining all four relative-clause moods naturally', 'Rédiger une critique B2 combinant avec justesse les modes des relatives'),
    ],
    13,
    [
      card(b('When superlatives & le premier take the INDICATIVE', 'Quand le superlatif et le premier gardent l’INDICATIF'), b('At B2, the subjunctive is not mechanical! Use the **indicative** even after **le premier, le dernier, le seul** or a superlative when you state a **neutral, verifiable, indisputable fact** (a timetable, a recorded historical date, a physical object on a desk). Keep the **subjunctive** when you express a **personal evaluation, value judgment, or sweeping claim**.\nObjective facts (indicative): **C’est le premier train qui part. Voici le seul dossier qui contient les factures.**\nPersonal claims (subjunctive): **C’est la seule chose qui compte. C’est le plus beau discours que j’aie entendu.**', 'Au niveau B2, le subjonctif n’est pas automatique ! Gardez l’**indicatif** même après **le premier, le dernier, le seul** ou un superlatif quand vous énoncez un **fait neutre, matériel ou chronologique** (un horaire, une date officielle, un objet vérifiable). Gardez le **subjonctif** pour un **jugement de valeur, une appréciation ou une affirmation absolue**.\nFaits objectifs (indicatif) : **C’est le premier train qui part. Voici le seul dossier qui contient les factures.**\nJugements personnels (subjonctif) : **C’est la seule chose qui compte. C’est le plus beau discours que j’aie entendu.**'), {
        table: {
          head: [b('Intent', 'Intention'), b('Mood', 'Mode'), b('Example', 'Exemple')],
          rows: [
            [b('Verifiable timetable / order', 'Horaire / ordre chronologique'), b('Indicatif', 'Indicatif'), 'C’est le premier TGV qui part pour Lyon ce matin.'],
            [b('Concrete physical fact', 'Fait matériel constatable'), b('Indicatif', 'Indicatif'), 'C’est la seule porte qui donne sur la cour.'],
            [b('Value judgment / praise', 'Jugement de valeur / éloge'), b('Subjonctif', 'Subjonctif'), 'C’est la seule remarque qui soit vraiment constructive.'],
            [b('Sweeping life superlative', 'Superlatif d’expérience'), b('Subjonctif', 'Subjonctif'), 'C’est le plus grand défi dont je me souvienne.'],
          ],
        },
        ex: [
          ['Neil Armstrong est le premier homme qui a marché sur la Lune.', 'Neil Armstrong is the first man who walked on the Moon.'],
          ['C’est la seule collègue à qui je puisse confier ce secret.', 'She is the only colleague to whom I can entrust this secret.'],
        ],
      }),
      tip(b('Dont and à qui inside subjunctive relatives', 'Dont et à qui dans une relative au subjonctif'), b('Remember that the relative pronoun depends on the verb’s preposition, **not** on the mood! Use **dont** for *parler de, avoir besoin de, se souvenir de* (*le meilleur film **dont** je me souvienne*), and **à qui / auquel** for *faire confiance à, assister à* (*le plus beau concert **auquel** j’aie assisté*).\nWith dont: **le seul détail dont j’aie besoin, le pire défaut dont on puisse parler**.\nWith auquel / à qui: **le plus grand projet auquel elle ait participé**.', 'N’oubliez pas que le pronom relatif dépend de la construction du verbe, **pas** du mode ! Employez **dont** avec *parler de, avoir besoin de, se souvenir de* (*le meilleur film **dont** je me souvienne*), et **à qui / auquel** avec *faire confiance à, assister à* (*le plus grand concert **auquel** j’aie assisté*).\nAvec dont : **le seul détail dont j’aie besoin, le pire défaut dont on puisse parler**.\nAvec auquel / à qui : **le plus grand projet auquel elle ait participé**.')),
      doc({
        look: 'article',
        title: b('Culture review: Festival opening', 'Critique : Ouverture du festival'),
        text: 'Hier soir, Le Pont de verre était le premier film qui ouvrait la sélection officielle.\nC’est sans doute l’œuvre la plus audacieuse que ce réalisateur ait jamais tournée.\nOn y cherche en vain un seul plan qui soit inutile, et c’est le seul long-métrage dont tous les critiques se souviennent encore le lendemain.',
      }, b('Why does the first sentence use the indicative (ouvrait), while the rest use the subjunctive (ait tournée, soit)?', 'Pourquoi la première phrase emploie-t-elle l’indicatif (ouvrait), mais les suivantes le subjonctif (ait tournée, soit) ?'), [
        b('Opening the festival is an objective schedule fact; the rest are critical evaluations and “in vain” negation', 'Ouvrir le festival est un fait objectif du programme ; la suite relève du jugement critique et de l’absence (« en vain »)'),
        b('Because all past tenses must use the indicative', 'Parce que tout verbe au passé prend l’indicatif'),
        b('Because réalisateur is masculine and film is singular', 'Parce que réalisateur est masculin et film est singulier'),
      ]),
      mc(P.best, [
        'Voici l’unique fenêtre qui donne sur le jardin intérieur.',
        'Voici l’unique fenêtre qui donnait jamais sur rien.',
        'C’est le meilleur conseil que tu peux jamais donner.',
      ], { fr: 'Dans quelle phrase l’indicatif est-il tout à fait naturel pour décrire un fait matériel ?' }),
      sort(b('Factual certainty (indicative) or evaluation / negative / wish (subjunctive)?', 'Fait matériel (indicatif) ou jugement / négation / quête (subjonctif) ?'), [
        b('Indicative (verifiable objective fact)', 'Indicatif (fait objectif vérifiable)'),
        b('Subjunctive (value claim / negative / search)', 'Subjonctif (jugement / négation / quête)'),
      ], [
        ['C’est le dernier avion qui a décollé avant la tempête.', 0],
        ['C’est le plus bel effort qu’elle ait fourni cette année.', 1],
        ['Voilà la seule clé qui ouvre le coffre.', 0],
        ['Je ne vois aucune raison qui justifie ce refus.', 1],
        ['Elle cherche un appartement qui soit près du parc.', 1],
        ['C’est le premier chapitre qui résume les chiffres de 2024.', 0],
      ]),
      gap(P.complete, 'C’est le dernier train qui ___ (partir — factuel) ce soir à 22 h 15, mais c’est aussi la seule option qui nous ___ (permettre — jugement) d’arriver avant demain.', [['part'], ['permette']], {
        choices: [
          ['part', 'parte', 'partira'],
          ['permette', 'permet', 'permettait'],
        ],
      }),
      dlg(b('After a theater play', 'À la sortie du théâtre'), b('Élodie and Thomas compare impressions on the street.', 'Élodie et Thomas échangent leurs impressions dans la rue.'), [['Élodie', 'f'], ['Thomas', 'm']], [
        [0, 'Franchement, c’est la pièce la plus originale que j’aie vue depuis des années !', 'Honestly, that’s the most original play I’ve seen in years!'],
        [1, { options: ['Oui ! D’ailleurs, je ne connais aucune actrice qui tienne la scène avec autant d’énergie. Et pourtant c’est la première pièce qu’elle a écrite seule.', 'Oui ! Je ne connais aucune actrice qui tient la scène, et c’est la première qu’elle ait écrite seule dans sa vie !', 'Oui ! Cherchons une actrice qui tient la scène !'], explain: b('Aucune actrice takes subjunctive (tienne); when emphasizing a verified biographical fact, indicative (a écrite) works cleanly.', 'Aucune actrice demande le subjonctif (tienne) ; pour un fait biographique vérifié, l’indicatif (a écrite) est tout à fait juste.') }],
        [0, 'Le premier mot qu’elle a prononcé au début résumait déjà toute l’histoire.', 'The very first word she spoke at the start already summed up the whole story.'],
      ]),
      ord(P.order, 'C’est le meilleur roman dont je me sois jamais souvenu.', {
        tr: b('It is the best novel that I have ever remembered.', 'C’est le plus grand roman dont je garde le souvenir.'),
        extra: ['que', 'suis'],
      }),
      write(
        b('Write a B2 cultural or product recommendation.', 'Rédigez une courte critique ou recommandation B2.'),
        b('Recommend a book, film, restaurant or tool in 4 sentences including: one indefinite search (qui + subjunctive), one negative antecedent (aucun / personne qui + subjunctive), one superlative/only subjunctive, and one verifiable factual indicative.', 'Recommandez un livre, un film, un restaurant ou un outil en 4 phrases incluant : une quête indéfinie (qui + subjonctif), un antécédent négatif (aucun / personne qui + subjonctif), un superlatif ou seul au subjonctif, et un fait objectif à l’indicatif.'),
        38, 82,
        [
          b('Include an indefinite search with subjunctive', 'Inclure une recherche indéfinie au subjonctif'),
          b('Include a negative antecedent with subjunctive', 'Inclure un antécédent négatif au subjonctif'),
          b('Contrast a superlative subjunctive with an objective factual indicative', 'Opposer un superlatif au subjonctif à un fait objectif à l’indicatif'),
        ],
        'Si vous cherchez un café qui soit calme pour lire le matin, allez chez L’Atelier du Parc. C’est le premier endroit du quartier qui a ouvert une vraie salle sans musique forte. Je ne connais aucun autre lieu qui serve un chocolat chaud aussi fin. Franchement, c’est la meilleure adresse que j’aie découverte cette année.',
        { phrases: ['Si vous cherchez un … qui soit…', 'C’est le premier … qui a…', 'Je ne connais aucun … qui…', 'C’est la meilleure … que j’aie…'] },
      ),
    ],
    [
      b('Objective, verifiable facts (timetables, history, physical reality) keep the indicative even after le premier or le seul.', 'Les faits objectifs et vérifiables (horaires, histoire, réalité matérielle) gardent l’indicatif même après le premier ou le seul.'),
      b('Personal evaluations, sweeping superlatives and moral claims take the subjunctive.', 'Les jugements de valeur, superlatifs absolus et appréciations personnelles prennent le subjonctif.'),
      b('Choose qui / que / dont / auquel by the verb’s construction independently of the mood.', 'Choisissez qui / que / dont / auquel selon la construction du verbe, indépendamment du mode.'),
    ],
    [
      ['dont je me souvienne', b('that I remember (subjunctive)', 'dont j’ai gardé le souvenir')],
      ['auquel j’aie assisté', b('that I have attended (subjunctive)', 'auquel j’ai participé')],
      ['fait objectif', b('objective / verifiable fact', 'fait constatable sans jugement')],
      ['jugement de valeur', b('value judgment', 'appréciation personnelle')],
    ],
  ),
];

export default lessons;
