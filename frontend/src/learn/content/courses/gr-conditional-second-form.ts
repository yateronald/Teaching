import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Master the literary C2 past conditional 2nd form (plus-que-parfait du subjonctif: j’eusse dit, eût-il fallu) plus asymmetrical mixed si-clauses (past cause + present result) and idiomatic survivals like fût-ce.',
    'Maîtriser le conditionnel passé 2e forme au niveau C2 (j’eusse agi, eût-il fallu), les systèmes hypothétiques mixtes (cause passée, effet présent) et les tournures figées vivantes comme fût-ce.',
  ),
  outcomes: [
    b('Recognise and translate second-form past conditional clauses in both the si-clause and the result clause.', 'Identifier et employer le conditionnel passé 2e forme dans la subordonnée comme dans la principale.'),
    b('Build asymmetric mixed hypothetical systems linking a past unreal cause with an ongoing present outcome.', 'Construire les hypothèses mixtes reliant un irréel du passé à une conséquence présente.'),
    b('Use inverted concessive/conditional forms naturally in high-register essays (fût-ce, dût-il en coûter, n’eût été).', 'Manier les tournures inversées soutenues en essai C2 (fût-ce, dût-il, n’eût été).'),
  ],
};

const lessons: Lesson[] = [
  lesson(
    'gr-conditional-second-form',
    1,
    ['pluperfect-subjunctive-as-conditional', 'conditionnel-passe-deuxieme-forme'],
    b('The Past Conditional 2nd Form (Plus-que-parfait du subjonctif)', 'Le conditionnel passé 2e forme : morphologie et valeur'),
    b('Spot when eusse / fusses / eût / fût serves as a literary unreal past conditional and use it in formal symmetry.', 'Reconnaître et manier le plus-que-parfait du subjonctif comme conditionnel passé littéraire.'),
    [
      b('Conjugate auxiliary eusse/eusses/eût/eussions/eussiez/eussent and fusse/fusses/fût + past participle cleanly.', 'Former sans faute le plus-que-parfait du subjonctif avec avoir et être.'),
      b('Distinguish literary symmetry (S’il l’eût su, il l’eût dit) from contemporary mixed forms.', 'Distinguer la symétrie classique de l’usage moderne avec aurait/serait + participe.'),
    ],
    13,
    [
      card(
        b('How the pluperfect subjunctive doubles as a past unreal conditional', 'Un temps du subjonctif au service de l’irréel du passé'),
        b(
          'In classic and high-literary French (essays, memoirs, legal opinions, speeches), **j’eusse fait** or **il fût parti** replaces **j’aurais fait / il serait parti** AND can even stand inside the **si-clause** itself instead of *si j’avais fait*! Today it most often enriches formal C2 writing or clarifies that an action sits purely in the **unfulfilled past**.\nAuxiliary avoir forms: **j’eusse, tu eusses, il/elle eût, nous eussions, vous eussiez, ils eussent**.\nAuxiliary être forms: **je fusse, tu fusses, il/elle fût, nous fussions, vous fussiez, ils fussent**.\nFormal pairing: **S’il eût prévenu, on eût différé le vote ; Il se fût trompé**.',
          'Dans le registre littéraire ou oratoire, le **plus-que-parfait du subjonctif** joue le rôle d’un **conditionnel passé 2e forme** : **il eût agi** (= *il aurait agi*) ou **elle fût partie** (= *elle serait partie*), et peut même entrer dans la proposition en **si** (*s’il l’eût su* = *s’il l’avait su*). On le rencontre surtout à la **3e personne** dans les essais contemporains.\nAuxiliaire avoir : **j’eusse, tu eusses, il/elle eût, nous eussions, vous eussiez, ils eussent**.\nAuxiliaire être : **je fusse, tu fusses, il/elle fût, nous fussions, vous fussiez, ils fussent**.\nEnchaînement soutenu : **S’il l’eût prévu, il se fût abstenu ; Qui l’eût cru ?**.',
        ),
        {
          table: {
            head: [b('Everyday B1–B2', 'Forme courante'), b('Literary C2 (2nd form)', '2e forme littéraire (C2)')],
            rows: [
              ['S’il avait écouté, il aurait évité l’écueil.', 'S’il eût écouté, il eût évité l’écueil.'],
              ['Elle serait venue si elle avait pu.', 'Elle fût venue si elle l’eût pu.'],
              ['On aurait cru à un malentendu.', 'On eût cru à un malentendu.'],
              ['Il aurait mieux valu attendre.', 'Il eût mieux valu attendre.'],
            ],
          },
          ex: [
            ['Il eût été préférable de consulter le comité avant toute publication.', 'It would have been preferable to consult the committee before any publication.'],
            ['Sans votre vigilance, l’erreur fût passée inaperçue jusqu’en décembre.', 'Without your vigilance, the error would have gone unnoticed until December.'],
            ['Qui eût prédit un revirement aussi brutal il y a seulement six mois ?', 'Who would have predicted such an abrupt reversal only six months ago?'],
          ],
        },
      ),
      trap(
        b('Circumflex only on the 3rd person singular (eût / fût)', 'Accent circonflexe uniquement à la 3e personne du singulier'),
        b(
          'Only **il/elle/on eût** and **il/elle/on fût** carry the circumflex (distinguishing them from *passé simple* *eut / fut*). Every other person (**j’eusse, ils eussent, nous fussions**) has **no circumflex**.',
          'Seule la **3e personne du singulier** (**il eût, il fût**) porte l’accent circonflexe (ce qui évite la confusion avec le passé simple *eut, fut*). Jamais d’accent à **j’eusse** ou **ils eussent**.',
        ),
      ),
      mc(
        P.best,
        [
          b('Sans cet éclairage décisif, le jury fût demeuré indécis.', 'Sans cet éclairage décisif, le jury fût demeuré indécis.'),
          b('Sans cet éclairage décisif, le jury fut demeuré indécis.', 'Sans cet éclairage décisif, le jury fut demeuré indécis.'),
          b('Sans cet éclairage décisif, le jury eut demeuré indécis.', 'Sans cet éclairage décisif, le jury eut demeuré indécis.'),
        ],
        { explain: b('Demeurer (in its stative sense “to remain”) takes être and the past conditional 2nd form takes fût with circumflex.', 'Demeurer au sens de rester se conjugue avec être : il faut fût avec accent circonflexe.') },
      ),
      gap(
        b('Transpose into the literary past conditional 2nd form.', 'Transposez au conditionnel passé 2e forme.'),
        'On ___ (croire) à une mise en scène tant la coïncidence ___ (paraître) troublante ; nul ne s’y ___ (tromper) cependant.',
        ['eût cru', 'eût paru', 'fût trompé'],
        {
          explain: b('On eût cru (avoir), la coïncidence eût paru (avoir), pronominal se tromper → nul ne s’y fût trompé (être).', 'Croire et paraître prennent avoir (eût cru, eût paru) ; le pronominal se tromper exige être (se fût trompé).'),
        },
      ),
      hear(
        'Il eût fallu mesurer d’emblée la portée budgétaire d’une telle promesse.',
        P.listen,
        [
          b('One ought to have weighed the budgetary impact from the outset.', 'Il aurait fallu mesurer dès le départ les conséquences budgétaires.'),
          b('It will soon be necessary to assess the cost.', 'Il faudra bientôt mesurer le coût de la mesure.'),
          b('They rightly measured the budgetary impact in advance.', 'Ils ont fort heureusement tout calculé à l’avance.'),
        ],
      ),
      ord(
        P.order,
        'Sans son intervention rapide, l’archive eût disparu à tout jamais.',
        {
          tr: 'Without her swift intervention, the archive would have vanished forever.',
          extra: ['eut', 'avait'],
        },
      ),
      dict('Il eût mieux valu différer cette annonce de quelques jours.'),
    ],
    [
      b('Il eût + p.p. / Il fût + p.p. serves as an elevated past conditional in C2 essays and literary prose.', 'Il eût et il fût + participe passé servent de conditionnel passé soutenu en C2.'),
      b('Write the circumflex strictly on 3rd-person singular eût and fût.', 'N’ajoutez l’accent circonflexe qu’à il/elle/on eût et fût.'),
    ],
    [
      ['il eût mieux valu', 'it would have been better'],
      ['qui eût cru… ?', 'who would have believed…?'],
      ['sans cela, elle fût partie', 'otherwise, she would have left'],
    ],
  ),

  lesson(
    'gr-conditional-second-form',
    2,
    ['mixed-hypothetical-systems-c2', 'systemes-hypothetiques-mixtes-c2'],
    b('Mixed Hypothetical Systems & Inverted Conditionals', 'Systèmes hypothétiques mixtes et inversion conditionnelle'),
    b('Combine past causes with present consequences accurately, and omit si cleanly via subject-verb inversion.', 'Relier cause passée et effet présent, et remplacer si par l’inversion élégante du sujet.'),
    [
      b('Link Type-3 cause (plus-que-parfait) with Type-2 present state (conditionnel présent / passé mixtes).', 'Associer irréel du passé (cause) et conditionnel présent (effet actuel) ou vice versa.'),
      b('Drop si cleanly via literary inversion: Eût-il su…, Dût-elle échouer…, N’eût été….', 'Remplacer si par l’inversion littéraire : Eût-il agi, Dût-il en coûter, N’eût été.'),
    ],
    13,
    [
      card(
        b('Asymmetry across time — and dropping “si” altogether', 'Dissymétrie temporelle et ellipse du « si »'),
        b(
          'Real thoughts frequently cross time boundaries: a **past mistake** causes a **present situation** (**Si nous avions investi plus tôt, nous serions aujourd’hui autonomes**), or a **permanent trait** explains a **past event** (**S’il était moins rigide, il aurait accepté ce compromis**). At C2, you can even drop **si** through **subject-verb inversion** (**Eût-il refusé…**, **N’eût été votre aide…**).\nPast cause → present result: **si + plus-que-parfait → conditionnel présent**.\nPermanent trait → past result: **si + imparfait → conditionnel passé**.\nSi-less inverted patterns: **eût-il accepté, fût-elle venue, n’eût été son courage**.',
          'La pensée fine croise souvent les époques : une **décision passée** produit un **état présent** (**Si j’avais accepté ce poste, je vivrais à Lyon aujourd’hui**), ou un **trait durable** explique un **acte passé** (**Si elle était moins exigeante, elle aurait signé plus vite**). En C2, l’**inversion du verbe et du pronom** permet aussi de supprimer **si** (**Eût-il échoué qu’il n’aurait rien regretté**).\nCause passée → effet présent : **si + plus-que-parfait → conditionnel présent**.\nTrait permanent → acte passé : **si + imparfait → conditionnel passé**.\nInversions sans si : **eût-il fallu, fût-il même venu, n’eût été cette panne**.',
        ),
        {
          ex: [
            ['Si les travaux avaient débuté au printemps, la ligne fonctionnerait dès aujourd’hui.', 'Had works begun in spring, the line would be operating today.'],
            ['Si cet historien était moins scrupuleux, il aurait publié ces pages sans vérifier.', 'Were this historian less scrupulous, he would have published those pages without checking.'],
            ['Eût-il disposé de ces chiffres à l’époque, son verdict aurait été tout autre.', 'Had he possessed those figures at the time, his verdict would have been quite different.'],
          ],
        },
      ),
      pairs(
        P.match,
        [
          ['Eût-il accepté l’offre…', b('If he had accepted the offer…', 'S’il avait accepté l’offre…')],
          ['N’eût été votre prudence…', b('Had it not been for your caution…', 'N’eût été / Sans votre prudence…')],
          ['Dût-il y passer la nuit…', b('Even if he had to spend the night there…', 'Même s’il devait y passer la nuit…')],
          ['Si j’avais suivi son conseil, je serais libre.', b('Past counterfactual cause → present consequence', 'Cause passée → effet présent')],
        ],
      ),
      mc(
        P.best,
        [
          b('Si tu n’avais pas égaré les clés hier, nous serions déjà à l’intérieur maintenant.', 'Si tu n’avais pas égaré les clés hier, nous serions déjà à l’intérieur maintenant.'),
          b('Si tu n’aurais pas égaré les clés hier, nous serions déjà à l’intérieur maintenant.', 'Si tu n’aurais pas égaré les clés hier, nous serions déjà à l’intérieur maintenant.'),
          b('Si tu n’avais pas égaré les clés hier, nous sommes déjà à l’intérieur maintenant.', 'Si tu n’avais pas égaré les clés hier, nous sommes déjà à l’intérieur maintenant.'),
        ],
        { explain: b('Yesterday’s unreal condition uses plus-que-parfait (avais égaré); today’s unreal state uses conditionnel présent (serions).', 'La cause passée irréelle demande le plus-que-parfait (avais égaré) et la conséquence présente actuelle le conditionnel présent (serions).') },
      ),
      gap(
        b('Supply the missing inverted or mixed-time conditional forms.', 'Complétez les systèmes mixtes et inversions conditionnelles.'),
        '___ (être, n’eût… ) cet imprévu de dernière heure, l’accord serait en vigueur ; et s’il ___ (avoir) plus d’audace par nature, il ___ (saisir) l’occasion l’an passé.',
        ['N’eût été', 'avait', 'aurait saisi'],
        {
          hint: b('Use invariable N’eût été in blank 1; durable character trait (imparfait) + past action (conditionnel passé) in blanks 2–3.', '1 : tournure figée N’eût été ; 2–3 : trait durable à l’imparfait + occasion passée au conditionnel passé.'),
        },
      ),
      ord(
        P.order,
        'Eût-il fallu tout reprendre, nous aurions maintenu cette exigence.',
        {
          tr: 'Had it been necessary to redo everything, we would have maintained that requirement.',
          extra: ['si', 'eut'],
        },
      ),
    ],
    [
      b('Mix plus-que-parfait + conditionnel présent when a past choice shapes today, or imparfait + conditionnel passé for permanent traits.', 'Croisez plus-que-parfait et conditionnel présent quand une cause passée agit encore aujourd’hui.'),
      b('Drop si in high literary register via verb-pronoun inversion (Eût-il su…, Dût-il…).', 'L’inversion Eût-il… ou Dût-il… exprime élégamment l’hypothèse ou la concession sans si.'),
    ],
    [
      ['n’eût été (+ nom)', 'had it not been for (note singular invariability)'],
      ['eût-il fallu', 'even if it had been necessary'],
      ['dût-il (+ inf.)', 'even if he had to…'],
    ],
  ),

  lesson(
    'gr-conditional-second-form',
    3,
    ['fossilized-subjunctives-fut-ce-puisse', 'tournures-figees-fut-ce-advienne'],
    b('Live Fossilised Subjunctives: fût-ce, ne fût-ce que, plût au ciel', 'Les tournures figées vivantes : fût-ce, ne fût-ce que, plût au ciel'),
    b('Use the rare subjunctive fossils still prized by contemporary French essayists without sounding archaic.', 'Employer avec mesure et précision fût-ce, ne fût-ce que, dût-on et advienne que pourra.'),
    [
      b('Deploy fût-ce / ne fût-ce que (= if only / even if only for) accurately inside modern prose.', 'Intégrer fût-ce et ne fût-ce que avec justesse dans un essai contemporain.'),
      b('Understand concessive subjunctive pairs like que… ou que, vaille que vaille, coûte que coûte, and advienne que pourra.', 'Maîtriser les tournures figées du subjonctif optatif et concessif encore usuelles.'),
    ],
    13,
    [
      card(
        b('Ancient forms that remain everyday gold at C2', 'Des survivances toujours bien vivantes en prose C2'),
        b(
          'Even writers who never write *vous chantassiez* still regularly write **ne fût-ce que** (= if only / even just) and **fût-ce** (= even if it were / be it). Unlike stiff antiquarian relics, **ne fût-ce qu’un instant** or **fût-ce à contrecœur** conveys razor-sharp elegance in journalism, criticism, and public speaking.\nLiving concessions: **fût-ce, ne fût-ce que, dût-on, vaille que vaille, coûte que coûte**.\nOptative idioms: **plaise à Dieu, plût au ciel, à Dieu ne plaise, vive la liberté**.\nUniversal alternatives: **quoi qu’il en soit, advienne que pourra, soit… soit…**.',
          'Même les auteurs qui évitent l’imparfait du subjonctif emploient couramment **ne fût-ce que** (« ne serait-ce que », pour marquer le moindre degré) et **fût-ce** (« même si c’était »). Prisés dans la presse intellectuelle et l’essai, ils s’accordent seulement parfois au pluriel (**fussent-ils nombreux**).\nConcessions vivantes : **fût-ce, ne fût-ce que, dût-on, vaille que vaille, coûte que coûte**.\nSouhaits et formules figées : **plût au ciel que, à Dieu ne plaise, vive + nom**.\nAlternatives : **quoi qu’il en soit, advienne que pourra, tant bien que mal**.',
        ),
        {
          ex: [
            ['Relisez ce passage attentivement, ne fût-ce que pour vérifier la chronologie.', 'Reread this passage carefully, if only to check the chronology.'],
            ['Tout compromis — fût-il modeste — mérite d’être exploré avant l’impasse.', 'Any compromise — be it even modest — deserves exploring before deadlock.'],
            ['Elle a maintenu l’atelier vaille que vaille pendant toute la crise.', 'She kept the workshop running after a fashion throughout the crisis.'],
          ],
        },
      ),
      trap(
        b('Agreement of fût-ce vs. fût-il / fussent-ils', 'Invariabilité de fût-ce contre accord de fût-il / fussent-ils'),
        b(
          'Because its subject is impersonal **ce**, **fût-ce** and **ne fût-ce que** remain strictly **singular** even before a plural noun (**ne fût-ce que deux heures** — never *fussent-ce*!). When replacing *ce* with *il/ils/elles*, however, the verb agrees (**fussent-ils nombreux**).',
          'Avec le sujet neutre *ce*, **fût-ce** et **ne fût-ce que** restent **toujours au singulier** même devant un pluriel (**ne fût-ce que quelques lignes**). Avec un pronom personnel, on accorde : **fussent-elles parfaites**.',
        ),
      ),
      mc(
        P.best,
        [
          b('Conservez une trace écrite, ne fût-ce que deux mots signés.', 'Conservez une trace écrite, ne fût-ce que deux mots signés.'),
          b('Conservez une trace écrite, ne fussent-ce que deux mots signés.', 'Conservez une trace écrite, ne fussent-ce que deux mots signés.'),
          b('Conservez une trace écrite, ne fut-ce que deux mots signés.', 'Conservez une trace écrite, ne fut-ce que deux mots signés.'),
        ],
        { explain: b('Ne fût-ce que always keeps singular fût (with circumflex) regardless of plural words following.', 'Ne fût-ce que demeure invariable au singulier avec accent circonflexe sur le u.') },
      ),
      dlg(
        b('Polishing an academic conclusion', 'Polir une conclusion universitaire'),
        b('A thesis advisor helps refine two stiff or unidiomatic hypothetical expressions.', 'Une directrice de mémoire aide un doctorant à affiner deux formules concessives.'),
        [['Professeure', 'f2'], ['Rémi', 'm']],
        [
          [0, 'Dans ta conclusion, « même si ce n’est que pour nuancer un détail » fonctionne, mais en C2 tu peux condenser.', 'In your conclusion, “même si ce n’est que pour nuancer un détail” works, yet at C2 you can tighten it.'],
          [1, {
            options: [
              'En écrivant simplement « ne fût-ce que pour nuancer un détail » ?',
              'En écrivant « ne fut-elle que pour nuancer un détail » ?',
              'En mettant « j’eusse aimé que nous nuancions » sans lien ?',
            ],
          }],
          [0, 'Exact. Et dans « ces obstacles, même s’ils étaient redoutables, n’ont pas arrêté le projet », essaie l’inversion sans « si ».', 'Exact. And in “ces obstacles, même s’ils étaient redoutables…”, try an inversion without “si”.'],
          [1, {
            options: [
              '« Ces obstacles, fussent-ils redoutables, n’ont pas arrêté le projet » ?',
              '« Ces obstacles, fût-ce redoutables, n’ont pas arrêté le projet » ?',
              '« Ces obstacles, eussent-ils été, n’ont pas arrêté le projet » ?',
            ],
            explain: b('Fussent-ils agrees cleanly in plural with les obstacles and sits neatly between dashes or commas.', 'Fussent-ils s’accorde au pluriel avec obstacles pour exprimer une concession élégante.'),
          }],
        ],
      ),
      gap(
        b('Fill in the right invariable or agreeing fossilised subjunctive.', 'Complétez avec l’expression figée exacte.'),
        'Accordez-lui cinq minutes d’écoute, ___ pour entendre son argumentaire ; ces règles — ___ imparfaites — protègent néanmoins l’essentiel.',
        ['ne fût-ce que', ['fussent-elles', 'eussent-elles été']],
        {
          choices: [['ne fût-ce que', 'ne fussent-ce que', 'n’eût été'], ['fussent-elles', 'fût-ce', 'fut-elles']],
        },
      ),
      say('Relisons cette clause ensemble, ne fût-ce que pour lever toute ambiguïté.', 'Let us reread this clause together, if only to clear up any ambiguity.'),
    ],
    [
      b('Ne fût-ce que (= if only) and fût-ce (= even if it were) are always singular with circumflex on û.', 'Ne fût-ce que et fût-ce restent toujours au singulier avec l’accent circonflexe.'),
      b('When replacing ce with personal pronouns (fût-il, fussent-elles), match gender and number cleanly.', 'Avec un pronom personnel (fût-il, fussent-elles), on accorde le verbe au sujet.'),
    ],
    [
      ['ne fût-ce que', 'if only / even just'],
      ['fût-il / fussent-elles', 'even were it / they'],
      ['vaille que vaille', 'for better or worse / after a fashion'],
      ['advienne que pourra', 'come what may'],
    ],
  ),
];

export default lessons;
