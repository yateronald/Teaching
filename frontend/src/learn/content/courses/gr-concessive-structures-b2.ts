import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Bien qu’il pleuve, même s’il pleut, malgré la pluie, il a beau essayer… Concession is the heart of B2 nuance and argumentation, yet each connector obeys strict grammar: bien que and quoique require the subjunctive, même si takes the indicative, malgré and en dépit de take nouns only (never *malgré que*!), and avoir beau + infinitive captures fruitless effort. This course rounds out your concession toolkit with formal connectors (pourtant, cependant, toutefois, néanmoins).',
    'Bien qu’il pleuve, même s’il pleut, malgré la pluie, il a beau essayer… La concession est au cœur de l’argumentation B2, mais chaque outil impose sa grammaire : bien que et quoique exigent le subjonctif, même si demande l’indicatif, malgré et en dépit de introduisent un nom (jamais *malgré que* !), et avoir beau + infinitif exprime l’effort inutile. Ce cours complète votre maîtrise avec pourtant, cependant, toutefois et néanmoins.',
  ),
  outcomes: [
    b('Choose accurately between bien que / quoique (+ subjunctive) and même si (+ indicative)', 'Choisir avec justesse entre bien que / quoique (+ subjonctif) et même si (+ indicatif)'),
    b('Use malgré and en dépit de strictly with nouns or pronouns, avoiding *malgré que*', 'Employer malgré et en dépit de uniquement avec un nom ou pronom, en évitant *malgré que*'),
    b('Express persistent effort in vain with avoir beau + infinitive', 'Exprimer un effort vain avec avoir beau + infinitif'),
    b('Connect arguments cleanly across registers with pourtant, cependant, toutefois and néanmoins', 'Nuancer et relier des idées avec pourtant, cependant, toutefois et néanmoins selon le registre'),
  ],
};

const C = 'gr-concessive-structures-b2';

const lessons: Lesson[] = [
  lesson(C, 1, ['bien-que-quoique-vs-meme-si', 'bien-que-quoique-ou-meme-si'],
    b('Bien que & quoique (+ subjunctive) vs même si (+ indicative)', 'Bien que et quoique (+ subjonctif) ou même si (+ indicatif) ?'),
    b('Express real obstacles with opposite moods: subjunctive after bien que and quoique, indicative after même si.', 'Exprimez une opposition avec le bon mode : subjonctif après bien que et quoique, indicatif après même si.'),
    [
      b('Use bien que and quoique systematically with the subjunctive', 'Employer systématiquement bien que et quoique avec le subjonctif'),
      b('Use même si with the indicative (and never future tense after si)', 'Employer même si avec l’indicatif (sans jamais de futur après si)'),
      b('Tell quoique (although) apart from quoi que (whatever)', 'Distinguer quoique en un mot (bien que) de quoi que en deux mots (quelle que soit la chose que)'),
    ],
    13,
    [
      card(b('Same meaning, opposite moods', 'Même sens concessif, modes opposés'), b('**Bien que** and **quoique** (slightly more literary) introduce a conceded fact that **always** takes the **subjunctive**. **Même si** introduces a real or hypothetical concession and **always** takes the **indicative** — following the normal **si** tense rules (present/past/imperfect, never future!).\nSubjunctive connectors: **bien que, quoique, encore que**.\nIndicative connectors: **même si, alors que, tandis que**.', '**Bien que** et **quoique** (un peu plus soutenu) introduisent un fait reconnu et exigent **toujours le subjonctif**. **Même si** présente une concession réelle ou hypothétique et prend **toujours l’indicatif** — selon la règle habituelle de **si** (présent, passé ou imparfait, jamais de futur !).\nAvec subjonctif : **bien que, quoique, encore que**.\nAvec indicatif : **même si, alors que, tandis que**.'), {
        table: {
          head: [b('Connector', 'Connecteur'), b('Mood required', 'Mode exigé'), b('Example', 'Exemple')],
          rows: [
            ['bien que / qu’', b('Subjunctive', 'Subjonctif'), 'Bien qu’il fasse froid, nous marchons jusqu’au port.'],
            ['quoique / quoiqu’', b('Subjunctive', 'Subjonctif'), 'Quoiqu’elle ait peu dormi, elle reste très lucide.'],
            ['même si / même s’', b('Indicative (no future)', 'Indicatif (pas de futur)'), 'Même s’il pleut demain, la visite est maintenue.'],
            ['alors que / tandis que', b('Indicative (contrast)', 'Indicatif (contraste)'), 'Il économise, alors que son frère dépense tout.'],
          ],
        },
        ex: [
          ['Bien que ce quartier soit animé, notre rue demeure paisible.', 'Although this neighborhood is lively, our street remains peaceful.'],
          ['Même si le trajet était long, personne ne s’est plaint.', 'Even though the journey was long, nobody complained.'],
          ['Quoique vous ayez raison sur le fond, le ton paraît un peu sec.', 'Although you are right in substance, the tone seems a bit abrupt.'],
        ],
      }),
      trap(b('Quoique (1 word) vs quoi que (2 words) & never *même s’il fera*!', 'Quoique vs quoi que, et jamais *même s’il fera* !'), b('Watch two classic B2 pitfalls:\n1. **Quoique** (one word) = *bien que* (although): *Quoiqu’il soit tard, il répond.* **Quoi que** (two words) = whatever: *Quoi que tu dises, je reste.* Both take the subjunctive!\n2. After **même si**, use the **présent** for a future event (*Même s’il pleut demain, on part*), or the **imparfait** for a hypothesis (*Même s’il pleuvait, on partirait*) — NEVER *même s’il pleuvra* or *même qu’il pleuve*!\nOne word (although): **quoiqu’il fasse, quoiqu’elle dise**.\nTwo words (whatever): **quoi que tu fasses, quoi qu’il arrive**.', 'Attention à deux pièges classiques au B2 :\n1. **Quoique** (en un mot) = *bien que* : *Quoiqu’il soit tard, il répond.* **Quoi que** (en deux mots) = quelle que soit la chose que : *Quoi que tu dises, je reste.* Les deux prennent le subjonctif !\n2. Après **même si**, employez le **présent** pour l’avenir (*Même s’il pleut demain, on part*), ou l’**imparfait** pour l’hypothèse (*Même s’il pleuvait, on partirait*) — JAMAIS *même s’il pleuvra* !\nUn mot (bien que) : **quoiqu’il fasse, quoiqu’elle dise**.\nDeux mots (peu importe ce que) : **quoi que tu fasses, quoi qu’il arrive**.')),
      mc(P.form, ['soit', 'est', 'sera', 'serait'], { fr: 'Bien que cette solution ___ coûteuse à court terme, elle réduira nos dépenses dès l’an prochain.', explain: b('Bien que always requires the subjunctive (soit).', 'Bien que exige toujours le subjonctif (soit).') }),
      hear('Même si les délais semblent courts, notre équipe tient absolument à livrer un travail soigné.', P.meaning, [
        b('Despite tight deadlines, the team insists on delivering careful work.', 'Malgré des délais serrés, l’équipe veut livrer un travail soigné.'),
        b('Because deadlines are short, the team will deliver sloppy work.', 'À cause des délais courts, le travail sera bâclé.'),
        b('The team asked to cancel the project.', 'L’équipe a demandé d’annuler le projet.'),
      ]),
      sort(b('Which mood follows each connector?', 'Quel mode suit chaque connecteur ?'), [
        b('Subjunctive (bien que, quoique, quoi que)', 'Subjonctif (bien que, quoique, quoi que)'),
        b('Indicative (même si, alors que)', 'Indicatif (même si, alors que)'),
      ], [
        ['Bien qu’il ___ (avoir) raison', 0],
        ['Même s’il ___ (pleuvoir) demain', 1],
        ['Quoique vous ___ (dire)', 0],
        ['Alors que tu ___ (dormir)', 1],
        ['Quoi que nous ___ (faire)', 0],
        ['Même s’ils ___ (être) fatigués hier', 1],
      ]),
      gap(P.complete, 'Bien que le train ___ (être — subj.) en retard de vingt minutes, nous arriverons à l’heure, même si la correspondance ___ (paraître — ind. pr.) un peu juste demain.', [['soit'], ['paraît']], {
        choices: [
          ['soit', 'est', 'sera'],
          ['paraît', 'paraisse', 'paraîtra'],
        ],
      }),
      pairs(P.match, [
        ['Bien qu’il ait essayé', b('Although he tried', 'Quoiqu’il ait fait un effort')],
        ['Même s’il a essayé', b('Even though he tried', 'Bien qu’il ait tenté (à l’indicatif)')],
        ['Quoi qu’il fasse', b('Whatever he does', 'Quelle que soit son action')],
        ['Quoiqu’il fasse froid', b('Although it is cold', 'Bien que la température soit basse')],
      ]),
      ord(P.order, 'Quoiqu’elle ait beaucoup hésité, elle a finalement accepté ce poste.', {
        tr: b('Although she hesitated a lot, she finally accepted this position.', 'Bien qu’elle ait longtemps hésité, elle a fini par accepter ce poste.'),
        extra: ['est', 'même'],
      }),
      dict('Même si ce projet exige des efforts, nous le poursuivrons, quoi qu’il arrive et bien qu’il soit complexe.'),
      say('Bien que la route soit longue, même s’il pleut un peu, nous partirons dès l’aube.', 'Although the road is long, even if it rains a little, we will set off at dawn.'),
    ],
    [
      b('bien que and quoique always require the subjunctive.', 'bien que et quoique exigent toujours le subjonctif.'),
      b('même si always takes the indicative (présent, passé, imparfait — never futur).', 'même si prend toujours l’indicatif (présent, passé, imparfait — jamais le futur).'),
      b('quoique (1 word) = although; quoi que (2 words) = whatever (both + subjunctive).', 'quoique (1 mot) = bien que ; quoi que (2 mots) = quelle que soit la chose que (les deux au subjonctif).'),
    ],
    [
      ['bien que + subj.', b('although / even though', 'malgré le fait que')],
      ['quoique + subj.', b('although (formal)', 'bien que (registre soutenu)')],
      ['quoi que + subj.', b('whatever', 'quelle que soit la chose que')],
      ['même si + ind.', b('even if / even though', 'quand bien même')],
    ],
  ),

  lesson(C, 2, ['malgre-en-depit-de-avoir-beau', 'malgre-en-depit-de-avoir-beau'],
    b('Malgré, en dépit de (+ noun) & avoir beau (+ infinitive)', 'Malgré, en dépit de (+ nom) et avoir beau (+ infinitif)'),
    b('Banish *malgré que* forever, elevate your style with en dépit de, and master idiomatic avoir beau.', 'Bannissez *malgré que*, variez avec en dépit de et maîtrisez l’expression idiomatique avoir beau.'),
    [
      b('Use malgré and en dépit de strictly with nouns or pronouns (never *malgré que*)', 'Employer malgré et en dépit de uniquement devant un nom ou pronom (jamais *malgré que*)'),
      b('Replace *malgré que* cleanly with bien que or malgré le fait que + subjunctive', 'Remplacer *malgré que* par bien que ou malgré le fait que + subjonctif'),
      b('Express repeated or fruitless effort with avoir beau + infinitive', 'Exprimer un effort vain avec avoir beau + infinitif'),
    ],
    13,
    [
      card(b('Malgré / en dépit de + noun — NEVER *malgré que*!', 'Malgré / en dépit de + nom — JAMAIS *malgré que* !'), b('**Malgré** (everyday–neutral) and **en dépit de** (formal/written) are **prepositions**: they MUST be followed by a **noun** or **stressed pronoun** (*malgré la pluie, malgré tout, malgré lui, en dépit des obstacles*). Standard French strictly rejects *malgré que + verb*! To introduce a clause, use **bien que + subjonctif** (or **malgré le fait que + subjonctif**).\nCorrect with noun: **malgré ses efforts, malgré le froid, en dépit de son retard**.\nCorrect with clause: **bien qu’il pleuve, malgré le fait qu’il pleuve**.', '**Malgré** (courant–neutre) et **en dépit de** (soutenu/écrit) sont des **prépositions** : ils introduisent OBLIGATOIREMENT un **nom** ou un **pronom** (*malgré la pluie, malgré tout, malgré lui, en dépit des obstacles*). Évitez absolument *malgré que* ! Devant un verbe conjugué, utilisez **bien que + subjonctif** (ou **malgré le fait que + subjonctif**).\nAvec un nom : **malgré ses efforts, malgré le froid, en dépit de son retard**.\nAvec un verbe : **bien qu’il pleuve, malgré le fait qu’il pleuve**.'), {
        table: {
          head: [b('Structure', 'Structure'), b('Follow-up', 'Suite obligatoire'), b('Example', 'Exemple')],
          rows: [
            ['malgré', b('Noun / pronoun', 'Nom / pronom'), 'Malgré la fatigue, elle a continué.'],
            ['en dépit de', b('Noun (formal)', 'Nom (soutenu)'), 'En dépit des critiques, le film triomphe.'],
            ['bien que / malgré le fait que', b('Clause (subjunctive)', 'Proposition (subjonctif)'), 'Bien qu’elle soit fatiguée, elle continue.'],
            ['avoir beau + inf.', b('Infinitive (fruitless effort)', 'Infinitif (effort vain)'), 'J’ai beau chercher, je ne trouve rien.'],
          ],
        },
        ex: [
          ['En dépit de son jeune âge, il dirige déjà trois ateliers.', 'In spite of his young age, he already runs three workshops.'],
          ['Il a accepté malgré lui, sans grande conviction.', 'He accepted in spite of himself, without much conviction.'],
          ['Vous aurez beau insister, le règlement ne changera pas.', 'No matter how hard you insist, the rule will not change.'],
        ],
      }),
      card(b('Avoir beau + infinitive: “no matter how hard…”', 'Avoir beau + infinitif : l’effort qui échoue'), b('**Avoir beau + infinitive** is one of the most idiomatic B2 expressions in French: conjugate **avoir** in any tense (*j’ai beau, il avait beau, nous aurons beau, tu as eu beau*), add **beau** (invariable!), then the **infinitive**, followed by a **comma** and the disappointing outcome (**NO *mais* right after!**).\nConjugated forms: **j’ai beau expliquer, ils avaient beau courir, vous aurez beau dire**.', '**Avoir beau + infinitif** est une expression phare du B2 : conjuguez **avoir** à n’importe quel temps (*j’ai beau, il avait beau, nous aurons beau, tu as eu beau*), ajoutez **beau** (invariable !), puis l’**infinitif**, suivi d’une **virgule** et du résultat contraire (**SANS *mais* juste après !**).\nFormes fréquentes : **j’ai beau expliquer, ils avaient beau courir, vous aurez beau dire**.'), {
        ex: [
          ['J’ai beau relire cette page, je ne repère aucune coquille.', 'No matter how many times I reread this page, I can’t spot any typo.'],
          ['Elle a eu beau se dépêcher, le guichet venait de fermer.', 'Even though she hurried, the ticket counter had just closed.'],
        ],
      }),
      trap(b('Two errors to cut: *malgré de* & *avoir beau …, mais …*', 'Deux erreurs à éviter : *malgré de* et *avoir beau …, mais …*'), b('Never put **de** after **malgré** (*malgré de la pluie* ❌ → **malgré la pluie** ✅; **en dépit DE** keeps *de*!). And because **avoir beau** already contains the idea of contrast, avoid writing **mais** right after the comma in careful writing.\nClean contrast: **Malgré la grève, le colloque a eu lieu.**\nClean avoir beau: **Il a beau s’entraîner, il s’essouffle vite.**', 'Ne mettez jamais **de** après **malgré** (*malgré de la pluie* ❌ → **malgré la pluie** ✅ ; seul **en dépit DE** prend *de* !). De plus, comme **avoir beau** exprime déjà l’opposition, évitez d’ajouter **mais** après la virgule.\nPréposition juste : **Malgré la grève, le colloque a eu lieu.**\nAvoir beau juste : **Il a beau s’entraîner, il s’essouffle vite.**')),
      mc(P.best, [
        'En dépit de l’averse soudaine, les coureurs ont maintenu leur rythme.',
        'Malgré qu’il pleuvait fort, les coureurs ont maintenu leur rythme.',
        'Malgré de l’averse soudaine, les coureurs ont maintenu leur rythme.',
      ], { fr: 'Choisissez la phrase parfaitement correcte.' }),
      mc(P.meaning, [
        b('Even though we warned him repeatedly, he made the same mistake.', 'Bien qu’on l’ait prévenu plusieurs fois, il a refait la même erreur.'),
        b('Because we warned him, he avoided the mistake.', 'Grâce à nos avertissements, il a évité l’erreur.'),
        b('He politely thanked us for our advice.', 'Il nous a remerciés poliment pour nos conseils.'),
      ], { fr: 'Nous avons eu beau le prévenir, il a commis la même erreur.' }),
      sort(b('Noun/pronoun, infinitive, or subjunctive clause?', 'Nom/pronom, infinitif ou proposition au subjonctif ?'), [
        b('Noun or pronoun (malgré / en dépit de)', 'Nom ou pronom (malgré / en dépit de)'),
        b('Infinitive (avoir beau)', 'Infinitif (avoir beau)'),
        b('Clause + subjunctive (bien que / malgré le fait que)', 'Verbe au subjonctif (bien que / malgré le fait que)'),
      ], [
        ['Malgré ___ (ses doutes)', 0],
        ['Ils ont beau ___ (chercher)', 1],
        ['Bien qu’elle ___ (avoir) raison', 2],
        ['En dépit de ___ (ce retard)', 0],
        ['Tu as eu beau ___ (appeler)', 1],
        ['Malgré le fait qu’il ___ (pleuvoir)', 2],
      ]),
      gap(P.complete, '___ (Malgré / Malgré que) les apparences, ce quartier est calme. Tu ___ (avoir beau — présent) écouter à la fenêtre, tu n’entends rien, ___ (en dépit de / bien que) la proximité du boulevard.', [['Malgré'], ['as beau'], ['en dépit de']], {
        choices: [
          ['Malgré', 'Malgré que', 'Malgré de'],
          ['as beau', 'es beau', 'avais beau de'],
          ['en dépit de', 'bien que', 'quoique'],
        ],
      }),
      pairs(P.match, [
        ['malgré lui', b('in spite of himself', 'contre son gré, sans le vouloir')],
        ['en dépit des obstacles', b('despite the obstacles', 'malgré les difficultés rencontrées')],
        ['j’ai beau réfléchir', b('no matter how hard I think', 'même en réfléchissant beaucoup')],
        ['malgré le fait qu’il sache', b('despite the fact that he knows', 'bien qu’il soit au courant')],
      ]),
      dlg(b('Trying to unlock the bike', 'Impossible de déverrouiller le vélo'), b('Lucas tries a bike-share dock while Maya watches.', 'Lucas essaie une borne de vélo pendant que Maya attend.'), [['Maya', 'f'], ['Lucas', 'm2']], [
        [0, 'Ça ne marche toujours pas ? Pourtant ta carte est active !', 'Still not working? Yet your card is active!'],
        [1, { options: ['J’ai beau passer le badge devant le capteur, la lumière reste rouge ! En dépit de mes essais, rien ne se débloque.', 'J’ai beau de passer le badge, mais malgré que j’essaie, rien ne marche.', 'Malgré d’essayer, j’ai beau !'], explain: b('Avoir beau takes a direct infinitive (passer) without de; en dépit de takes a noun (mes essais).', 'Avoir beau prend l’infinitif direct (passer) sans de ; en dépit de prend un nom (mes essais).') }],
        [0, 'Viens, essayons la borne d’en face malgré le détour.', 'Come on, let’s try the dock across the street despite the detour.'],
      ]),
      dict('En dépit de ses explications précises, il a eu beau répéter l’exemple, personne n’avait compris.'),
      say('Malgré les imprévus, j’ai beau chercher une faille, ce plan reste très solide.', 'Despite the setbacks, no matter how hard I look for a flaw, this plan remains very solid.'),
    ],
    [
      b('malgré and en dépit de take nouns or pronouns only — NEVER *malgré que* or *malgré de*.', 'malgré et en dépit de prennent uniquement un nom ou un pronom — JAMAIS *malgré que* ni *malgré de*.'),
      b('Replace *malgré que* with bien que + subjunctive or malgré le fait que + subjunctive.', 'Remplacez *malgré que* par bien que + subjonctif ou malgré le fait que + subjonctif.'),
      b('avoir beau + infinitive (invariable beau, no mais right after) expresses fruitless effort.', 'avoir beau + infinitif (beau invariable, sans mais derrière) exprime l’effort vain.'),
    ],
    [
      ['en dépit de', b('in spite of / despite (formal)', 'malgré (registre soutenu)')],
      ['avoir beau + inf.', b('no matter how hard one tries', 'faire quelque chose en vain')],
      ['malgré lui / elle', b('in spite of himself / herself', 'contre sa volonté')],
      ['malgré le fait que', b('despite the fact that (+ subj.)', 'bien que (+ subjonctif)')],
    ],
  ),

  lesson(C, 3, ['pourtant-cependant-toutefois-neanmoins', 'pourtant-cependant-toutefois-neanmoins'],
    b('Register & connectors: pourtant, cependant, toutefois, néanmoins', 'Registres et connecteurs : pourtant, cependant, toutefois, néanmoins'),
    b('Link independent sentences smoothly across spoken, journalistic and academic French.', 'Reliez des phrases autonomes avec nuance selon le registre : courant, journalistique ou soutenu.'),
    [
      b('Differentiate pourtant, cependant, toutefois and néanmoins by register and nuance', 'Différencier pourtant, cependant, toutefois et néanmoins par registre et nuance'),
      b('Place adverbial connectors accurately (initial, post-verb, or after a semicolon)', 'Placer les adverbes de concession avec justesse (début, après le verbe, point-virgule)'),
      b('Write a cohesive B2 concessive paragraph combining subordination, nouns and connectors', 'Rédiger un paragraphe argumentatif B2 combinant subordination, noms et connecteurs'),
    ],
    13,
    [
      card(b('Concessive adverbs between sentences', 'Adverbes d’opposition entre deux phrases'), b('Unlike **bien que** (subordinator) or **malgré** (preposition), **pourtant, cependant, toutefois** and **néanmoins** link **two independent clauses** (with **.** or **;** or **et**). They never take the subjunctive!\nEveryday–neutral: **pourtant, quand même, tout de même**.\nFormal–argumentative: **cependant, toutefois, néanmoins**.', 'Contrairement à **bien que** (subordonnant) ou **malgré** (préposition), **pourtant, cependant, toutefois** et **néanmoins** relient **deux propositions indépendantes** (après **.** ou **;** ou **et**). Ils n’entraînent jamais le subjonctif !\nCourant–neutre : **pourtant, quand même, tout de même**.\nSoutenu–argumentatif : **cependant, toutefois, néanmoins**.'), {
        table: {
          head: [b('Connector', 'Connecteur'), b('Register', 'Registre'), b('Core nuance', 'Nuance précise'), b('Example', 'Exemple')],
          rows: [
            ['pourtant', b('Everyday / neutral', 'Courant / neutre'), b('surprising contrast', 'contraste étonnant'), 'Il pleuvait ; pourtant, la terrasse était pleine.'],
            ['cependant', b('Neutral / formal', 'Neutre / soutenu'), b('balanced counterpoint', 'nuance équilibrée'), 'Le projet coûte cher ; cependant, il est rentable.'],
            ['toutefois', b('Formal / written', 'Soutenu / écrit'), b('caveat / restriction', 'réserve ou exception précise'), 'L’entrée est libre ; toutefois, l’inscription reste requise.'],
            ['néanmoins', b('Formal / essay', 'Soutenu / essai'), b('nevertheless', 'maintien d’une conclusion malgré tout'), 'Les risques subsistent ; ce choix reste néanmoins pertinent.'],
          ],
        },
        ex: [
          ['Ce logiciel est ancien ; il demeure néanmoins très fiable.', 'This software is old; it nevertheless remains very reliable.'],
          ['Le tarif augmente peu ; toutefois, les abonnés annuels conservent l’ancien prix.', 'The rate increases slightly; however, annual subscribers keep the old price.'],
          ['J’avais dormi huit heures ; pourtant, je me sentais encore épuisé.', 'I had slept eight hours; yet I still felt exhausted.'],
        ],
      }),
      tip(b('Where to place them + punctuation power', 'Où les placer ? Ponctuation et rythme'), b('At B2, placing **cependant** or **néanmoins** right **after the conjugated verb** sounds remarkably polished (*Ce résultat reste **néanmoins** fragile*). Note also that **quand même** (informal–neutral) sits **after the verb** (*Il est venu quand même*), whereas **toutefois** nearly always opens the second sentence after a period or semicolon.\nPost-verb polish: **reste néanmoins, demeure cependant, paraît toutefois**.', 'Au niveau B2, placer **cependant** ou **néanmoins** juste **après le verbe conjugué** donne un style très fluide (*Ce résultat reste **néanmoins** fragile*). Notez que **quand même** (courant) se place **après le verbe** (*Il est venu quand même*), alors que **toutefois** ouvre presque toujours la seconde proposition.\nÉlégance après le verbe : **reste néanmoins, demeure cependant, paraît toutefois**.')),
      doc({
        look: 'article',
        title: b('Municipal policy brief: Remote work', 'Note municipale : Télétravail et centres-villes'),
        text: 'Le télétravail réduit les trajets quotidiens et améliore la qualité de l’air.\nCependant, la fréquentation des commerces de proximité recule les lundis et vendredis.\nPlusieurs villes tentent d’attirer de nouveaux habitants ; toutefois, l’offre de logements reste insuffisante.\nLes experts estiment néanmoins que l’équilibre peut être retrouvé d’ici trois ans.',
      }, b('In this policy brief, why is toutefois chosen in sentence 3?', 'Dans cette note, pourquoi toutefois est-il choisi dans la phrase 3 ?'), [
        b('To introduce a concrete limitation/obstacle to the cities’ effort', 'Pour introduire une limite ou réserve concrète à l’action des villes'),
        b('Because it requires a subjunctive verb right after it', 'Parce qu’il impose un verbe au subjonctif'),
        b('To express an informal surprise among friends', 'Pour exprimer un étonnement familier entre amis'),
      ]),
      mc(P.word, ['toutefois', 'bien que', 'malgré', 'quoique'], { fr: 'La bibliothèque reste ouverte jusqu’à 21 heures ; ___, l’accès aux archives ferme dès 18 heures.', explain: b('Between two independent indicative clauses introducing a rule restriction, toutefois fits cleanly.', 'Entre deux phrases indépendantes à l’indicatif pour une restriction précise, toutefois convient parfaitement.') }),
      sort(b('Sort by grammar category: subordinator, preposition, or independent adverb.', 'Classez par catégorie : subordonnant, préposition ou adverbe ?'), [
        b('Subordinator + subjunctive (bien que, quoique)', 'Subordonnant + subjonctif (bien que, quoique)'),
        b('Preposition + noun (malgré, en dépit de)', 'Préposition + nom (malgré, en dépit de)'),
        b('Independent adverb (cependant, toutefois, néanmoins)', 'Adverbe autonome (cependant, toutefois, néanmoins)'),
      ], [
        ['bien que', 0],
        ['en dépit de', 1],
        ['néanmoins', 2],
        ['malgré', 1],
        ['toutefois', 2],
        ['quoique', 0],
      ]),
      gap(P.complete, '___ (Bien que / Pourtant) les ventes progressent, le marché reste fragile. La direction prévoit ___ (néanmoins / malgré) d’embaucher cet automne ; ___ (toutefois / quoique), les contrats débuteront seulement en octobre.', [['Bien que'], ['néanmoins'], ['toutefois']], {
        choices: [
          ['Bien que', 'Pourtant', 'Malgré'],
          ['néanmoins', 'malgré', 'bien que'],
          ['toutefois', 'quoique', 'en dépit de'],
        ],
      }),
      pairs(P.match, [
        ['pourtant', b('yet / still (unexpected contrast)', 'pourtant (contraste fort ou inattendu)')],
        ['toutefois', b('however (caveat / exception)', 'toutefois (réserve ou condition précise)')],
        ['néanmoins', b('nevertheless (despite that)', 'néanmoins (malgré ces arguments)')],
        ['quand même', b('all the same / anyway (spoken)', 'tout de même (registre courant)')],
      ]),
      ord(P.order, 'Les prévisions étaient prudentes ; l’année demeure néanmoins très encourageante.', {
        tr: b('Forecasts were cautious; the year nevertheless remains very encouraging.', 'Les prévisions étaient prudentes ; l’année reste néanmoins très encourageante.'),
        extra: ['malgré', 'soit'],
      }),
      dict('La salle était comble ; pourtant, la réunion a commencé à l’heure. Toutefois, deux points restent en suspens.'),
      write(
        b('Write a balanced B2 argument paragraph.', 'Rédigez un paragraphe argumentatif nuancé de niveau B2.'),
        b('Give a balanced view on a modern topic (remote work, city cycling, smartphones, or AI) in 4–5 sentences using: bien que or quoique (+ subjunctive), malgré or en dépit de (+ noun), avoir beau (+ infinitive), and cependant / toutefois / néanmoins.', 'Donnez un avis nuancé sur un sujet actuel (télétravail, vélo en ville, smartphones ou IA) en 4 à 5 phrases en utilisant : bien que ou quoique (+ subjonctif), malgré ou en dépit de (+ nom), avoir beau (+ infinitif), et cependant / toutefois / néanmoins.'),
        40, 88,
        [
          b('Use bien que or quoique with an accurate subjunctive', 'Employer bien que ou quoique suivi du subjonctif'),
          b('Use malgré or en dépit de with a noun (no *malgré que*)', 'Employer malgré ou en dépit de avec un nom (sans *malgré que*)'),
          b('Include avoir beau + infinitive and one formal adverb (cependant, toutefois, néanmoins)', 'Inclure avoir beau + infinitif et un connecteur soutenu (cependant, toutefois, néanmoins)'),
        ],
        'Bien que le télétravail facilite l’organisation familiale, il ne convient pas à tous les métiers. On a beau vanter ses avantages, certains salariés souffrent vite de l’isolement. En dépit de ces limites, la formule hybride séduit de plus en plus d’entreprises. Toutefois, elle exige des règles claires pour préserver la cohésion d’équipe.',
        { phrases: ['Bien que … soit / ait…', 'On a beau + infinitif', 'En dépit de / Malgré + nom', 'Toutefois / Cependant / Néanmoins'] },
      ),
    ],
    [
      b('pourtant, cependant, toutefois and néanmoins join independent indicative sentences (no subjunctive!).', 'pourtant, cependant, toutefois et néanmoins relient des phrases indépendantes à l’indicatif (pas de subjonctif !).'),
      b('Use toutefois for caveats/exceptions, néanmoins for formal “nevertheless”, and quand même after the verb in speech.', 'Employez toutefois pour une réserve, néanmoins pour « malgré tout » soutenu, et quand même après le verbe à l’oral.'),
      b('Never mix categories: bien que + verb (subj.), malgré + noun, cependant + independent clause.', 'Ne mélangez pas les catégories : bien que + verbe (subj.), malgré + nom, cependant + phrase autonome.'),
    ],
    [
      ['cependant', b('however (balanced contrast)', 'cependant (opposition équilibrée)')],
      ['toutefois', b('however / yet (specific caveat)', 'toutefois (réserve ou exception)')],
      ['néanmoins', b('nevertheless (formal)', 'néanmoins (malgré cela, soutenu)')],
      ['pourtant', b('yet / still (strong contrast)', 'pourtant (opposition marquée)')],
    ],
  ),
];

export default lessons;
