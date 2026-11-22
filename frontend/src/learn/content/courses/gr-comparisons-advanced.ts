import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ce café est meilleur, il travaille mieux, autant de temps que toi, d’autant plus que… Once you move past basic plus… que, French comparisons demand precision: adjectives vs adverbs (meilleur vs mieux), equality with nouns vs adjectives (autant de vs aussi), refined davantage, double comparatives (plus… plus…) and reasoning with d’autant plus que. This course sharpens every comparative tool you need at B1.',
    'Ce café est meilleur, il travaille mieux, autant de temps que toi, d’autant plus que… Au-delà de plus… que, la comparaison demande de la précision : adjectif ou adverbe (meilleur ou mieux), égalité devant nom ou adjectif (autant de ou aussi), davantage, doubles comparatifs (plus… plus…) et argumentation avec d’autant plus que. Ce cours affine tous vos outils de comparaison au niveau B1.',
  ),
  outcomes: [
    b('Keep bon / meilleur apart from bien / mieux (and pire / plus mal)', 'Distinguer sans faute bon / meilleur de bien / mieux (et pire / plus mal)'),
    b('Choose accurately between aussi, autant (de) and davantage', 'Choisir avec précision entre aussi, autant (de) et davantage'),
    b('Build natural double comparatives (plus… plus…, moins… moins…) without le', 'Construire des comparatifs doubles (plus… plus…, moins… moins…) sans le'),
    b('Reinforce an argument with d’autant plus que / d’autant moins que', 'Renforcer un argument avec d’autant plus que / d’autant moins que'),
  ],
};

const C = 'gr-comparisons-advanced';

const lessons: Lesson[] = [
  lesson(C, 1, ['bon-meilleur-vs-bien-mieux', 'bon-meilleur-ou-bien-mieux'],
    b('Bon / meilleur vs bien / mieux', 'Bon / meilleur ou bien / mieux ?'),
    b('Never say *plus bon* or *plus bien*: match adjectives to nouns and adverbs to verbs.', 'Ne dites jamais *plus bon* ni *plus bien* : accordez l’adjectif au nom et liez l’adverbe au verbe.'),
    [
      b('Contrast bon → meilleur with bien → mieux', 'Opposer bon → meilleur à bien → mieux'),
      b('Agree meilleur(e)(s) while keeping mieux invariable', 'Accorder meilleur(e)(s) et laisser mieux invariable'),
      b('Use mauvais / pire and mal / plus mal correctly', 'Employer mauvais / pire et mal / plus mal avec justesse'),
    ],
    13,
    [
      card(b('Adjective vs adverb: the core split', 'Adjectif ou adverbe : le partage clé'), b('**Bon** is an **adjective** (qualifies a noun, agrees in gender and number); its comparative is **meilleur(e)(s)**. **Bien** is an **adverb** (qualifies a verb, adjective or situation); its comparative is **mieux** (always invariable!). Both *plus bon* and *plus bien* are wrong.\nAdjective pairs: **bon, meilleur, mauvais, pire**.\nAdverb pairs: **bien, mieux, mal, plus mal**.', '**Bon** est un **adjectif** (qualifie un nom, s’accorde en genre et en nombre) ; son comparatif est **meilleur(e)(s)**. **Bien** est un **adverbe** (qualifie un verbe, un adjectif ou une situation) ; son comparatif est **mieux** (toujours invariable !). *Plus bon* et *plus bien* n’existent pas.\nPaires adjectivales : **bon, meilleur, mauvais, pire**.\nPaires adverbiales : **bien, mieux, mal, plus mal**.'), {
        table: {
          head: [b('Role', 'Rôle'), b('Base', 'Base'), b('Comparative', 'Comparatif'), b('Superlative', 'Superlatif')],
          rows: [
            [b('Adjective (noun)', 'Adjectif (nom)'), 'bon / bonne', 'meilleur(e)(s) que', 'le / la meilleur(e)'],
            [b('Adverb (verb)', 'Adverbe (verbe)'), 'bien', 'mieux que', 'le mieux'],
            [b('Adjective (negative)', 'Adjectif (négatif)'), 'mauvais(e)', 'pire / plus mauvais', 'le / la pire'],
            [b('Adverb (negative)', 'Adverbe (négatif)'), 'mal', 'plus mal / pire', 'le plus mal'],
          ],
        },
        ex: [
          ['Cette nouvelle version du texte est nettement meilleure.', 'This new version of the text is clearly better.'],
          ['Tu expliques beaucoup mieux que l’an dernier.', 'You explain things much better than last year.'],
          ['C’est le meilleur restaurant du quartier, sans hésiter.', 'It’s the best restaurant in the neighborhood, hands down.'],
        ],
      }),
      trap(b('C’est meilleur vs c’est mieux', 'C’est meilleur ou c’est mieux ?'), b('Compare food or a concrete thing: **C’est meilleur** (it tastes/is higher quality). Compare a choice, timing or general situation: **C’est mieux** (it’s preferable / works better). And notice **faire mieux de + infinitive** (had better do).\nConcrete quality: **ce plat est meilleur, une meilleure idée**.\nBetter choice or state: **c’est mieux ainsi, je dors mieux, tu ferais mieux de partir**.', 'Pour qualifier un plat ou un objet précis : **C’est meilleur** (goût ou qualité). Pour juger une option, un horaire ou une situation : **C’est mieux** (préférable). Notez aussi **faire mieux de + infinitif** (avoir intérêt à).\nQualité concrète : **ce plat est meilleur, une meilleure idée**.\nOption ou état : **c’est mieux ainsi, je dors mieux, tu ferais mieux de partir**.'), {
        ex: [
          ['Partir demain matin ? Oui, c’est beaucoup mieux pour tout le monde.', 'Leaving tomorrow morning? Yes, that’s much better for everyone.'],
          ['Tu ferais mieux d’emporter une veste.', 'You had better bring a jacket.'],
        ],
      }),
      mc(P.word, ['meilleure', 'mieux', 'plus bonne', 'le mieux'], { fr: 'J’ai trouvé une ___ méthode pour réviser le vocabulaire.', explain: b('Méthode is a feminine singular noun, so it takes the adjective meilleure.', 'Méthode est un nom féminin singulier : il faut l’adjectif meilleure.') }),
      hear('Ce film est meilleur que le premier, mais les dialogues fonctionnent moins bien.', P.meaning, [
        b('Overall the second film is better, though the dialogue is weaker.', 'Le deuxième film est meilleur dans l’ensemble, mais les dialogues sont moins réussis.'),
        b('The first film was much better in every way.', 'Le premier film était bien meilleur sur tous les plans.'),
        b('Both films have identical dialogue.', 'Les deux films ont exactement les mêmes dialogues.'),
      ]),
      sort(b('Adjective (meilleur / pire) or adverb (mieux / plus mal)?', 'Adjectif (meilleur / pire) ou adverbe (mieux / plus mal) ?'), [
        b('Qualifies a noun (meilleur / pire)', 'Qualifie un nom (meilleur / pire)'),
        b('Modifies a verb or choice (mieux / plus mal)', 'Modifie un verbe ou un choix (mieux / plus mal)'),
      ], [
        ['une ___ note', 0],
        ['parler ___', 1],
        ['aller ___ demain', 1],
        ['la ___ solution', 0],
        ['dormir ___ mal', 1],
        ['le ___ résultat', 0],
      ]),
      gap(P.complete, 'Avec de la sauce tomate maison, les pâtes sont ___ (bon — comp. f. pl.), et tu les cuisines déjà ___ (bien — comp.) que moi !', [['meilleures'], ['mieux']], {
        choices: [
          ['meilleures', 'meilleurs', 'mieux'],
          ['mieux', 'meilleur', 'plus bien'],
        ],
      }),
      pairs(P.match, [
        ['C’est mieux ainsi.', b('It’s better this way.', 'Cette situation est préférable.')],
        ['Ce pain est meilleur.', b('This bread is tastier/better.', 'Ce pain a une meilleure qualité.')],
        ['Tu ferais mieux de rentrer.', b('You’d better go home.', 'Il serait plus sage que tu rentres.')],
        ['La circulation est pire.', b('Traffic is worse.', 'La circulation s’est aggravée.')],
      ]),
      ord(P.order, 'Cette année, nos résultats sont nettement meilleurs qu’avant.', {
        tr: b('This year, our results are clearly better than before.', 'Cette année, nos résultats dépassent nettement ceux d’avant.'),
        extra: ['mieux', 'bons'],
      }),
      dlg(b('Changing the appointment', 'Changer le rendez-vous'), b('Lina asks Karim if Thursday morning suits him better.', 'Lina demande à Karim si jeudi matin lui convient mieux.'), [['Lina', 'f2'], ['Karim', 'm']], [
        [0, 'Je peux déplacer notre rendez-vous à jeudi matin, qu’en penses-tu ?', 'I can move our appointment to Thursday morning, what do you think?'],
        [1, { options: ['Oui, c’est beaucoup mieux ! Le jeudi, on travaille dans de meilleures conditions.', 'Oui, c’est beaucoup meilleur ! Dans de mieux conditions.', 'Oui, c’est plus bien !'], explain: b('C’est mieux judges the timing/situation; meilleures agrees with feminine plural conditions.', 'C’est mieux évalue la situation ; meilleures s’accorde avec conditions.') }],
        [0, 'Parfait, je t’envoie la confirmation tout de suite.', 'Great, I’ll send you the confirmation right away.'],
      ]),
      dict('Je me sens déjà mieux, et cette tisane au miel est bien meilleure que le café.'),
      say('C’est la meilleure décision que nous ayons prise, tout fonctionne mieux maintenant.', 'It’s the best decision we’ve made, everything works better now.'),
    ],
    [
      b('bon → meilleur(e)(s) modifies nouns; bien → mieux modifies verbs and situations.', 'bon → meilleur(e)(s) qualifie un nom ; bien → mieux modifie un verbe ou une situation.'),
      b('Never say *plus bon* or *plus bien*.', 'Ne dites jamais *plus bon* ni *plus bien*.'),
      b('C’est meilleur = better quality/taste; c’est mieux = preferable choice or state.', 'C’est meilleur = qualité/goût ; c’est mieux = choix ou état préférable.'),
    ],
    [
      ['meilleur(e)', b('better (adjective)', 'plus bon (forme correcte)')],
      ['mieux', b('better (adverb)', 'plus bien (forme correcte)')],
      ['faire mieux de', b('had better (do something)', 'avoir intérêt à')],
      ['pire', b('worse (adjective)', 'plus mauvais')],
    ],
  ),

  lesson(C, 2, ['autant-vs-aussi-vs-davantage', 'autant-aussi-davantage'],
    b('Autant (de) vs aussi vs davantage', 'Autant (de), aussi et davantage'),
    b('Choose between aussi, autant de, verb + autant, and the elegant comparative davantage.', 'Choisissez sans hésiter entre aussi, autant de, verbe + autant et le comparatif soutenu davantage.'),
    [
      b('Distinguish aussi (adjective/adverb) from autant (noun/verb)', 'Distinguer aussi (adjectif/adverbe) de autant (nom/verbe)'),
      b('Drop the article after autant de (even for plurals)', 'Supprimer l’article après autant de (même au pluriel)'),
      b('Use davantage properly in place of plus', 'Employer davantage correctement à la place de plus'),
    ],
    13,
    [
      card(b('Equality: aussi vs autant (de)', 'Égalité : aussi ou autant (de) ?'), b('Both mean “as / as much / as many”, yet they never mix! Use **aussi** before an **adjective** or **adverb**. Use **autant de** (never *des*!) before a **noun**, and **autant** right after a **verb**.\nBefore adjectives/adverbs: **aussi grand que, aussi vite que, aussi souvent que**.\nWith nouns or verbs: **autant de temps que, autant d’amis que, lire autant que**.', 'Les deux expriment l’égalité, mais leurs emplois sont séparés ! Utilisez **aussi** devant un **adjectif** ou un **adverbe**. Utilisez **autant de** (jamais *des* !) devant un **nom**, et **autant** après un **verbe**.\nDevant adjectif/adverbe : **aussi grand que, aussi vite que, aussi souvent que**.\nAvec nom ou verbe : **autant de temps que, autant d’amis que, lire autant que**.'), {
        table: {
          head: [b('Word attached', 'Mot comparé'), b('Structure', 'Structure'), b('Example', 'Exemple')],
          rows: [
            [b('Adjective', 'Adjectif'), 'aussi + adj. + que', 'Elle est aussi patiente que lui.'],
            [b('Adverb', 'Adverbe'), 'aussi + adv. + que', 'Tu parles aussi clairement qu’hier.'],
            [b('Noun', 'Nom'), 'autant de/d’ + nom + que', 'Il a autant d’idées que sa sœur.'],
            [b('Verb', 'Verbe'), 'verbe + autant + que', 'Nous voyageons autant qu’avant.'],
          ],
        },
        ex: [
          ['Ce quartier est aussi calme que la campagne.', 'This neighborhood is as quiet as the countryside.'],
          ['Il y avait autant de monde samedi que dimanche.', 'There were as many people on Saturday as on Sunday.'],
          ['Je n’ai jamais autant ri que ce soir-là !', 'I have never laughed as much as that evening!'],
        ],
      }),
      card(b('Davantage: the refined cousin of plus', 'Davantage : l’équivalent soigné de plus'), b('**Davantage** replaces **plus** when no comparison target follows right after (typically at the end of a clause), or before **de + nom**. Never place **davantage** directly before an adjective (*davantage cher* ❌ → **plus cher** ✅).\nClean uses: **travailler davantage, en savoir davantage, davantage de moyens**.', '**Davantage** remplace **plus** en fin de proposition (sans **que** derrière) ou devant **de + nom**. Ne placez jamais **davantage** devant un adjectif (*davantage cher* ❌ → **plus cher** ✅).\nEmplois justes : **travailler davantage, en savoir davantage, davantage de moyens**.'), {
        ex: [
          ['Tu devrais dormir davantage avant les examens.', 'You ought to sleep more before exams.'],
          ['Pour ce poste, il faut davantage d’expérience.', 'For this position, more experience is required.'],
        ],
      }),
      mc(P.word, ['autant de', 'aussi', 'aussi de', 'autant'], { fr: 'Cette voiture consomme ___ carburant que l’ancien modèle.', explain: b('Carburant is a noun, so equality requires autant de.', 'Carburant est un nom : l’égalité demande autant de.') }),
      mc(P.word, ['aussi', 'autant', 'autant de', 'davantage'], { fr: 'Ce train régional est ___ rapide que le car express.', explain: b('Rapide is an adjective, so it takes aussi.', 'Rapide est un adjectif : il faut aussi.') }),
      sort(b('Sort by word type being compared.', 'Classez selon la nature du mot comparé.'), [
        b('Adjective / Adverb (aussi)', 'Adjectif / Adverbe (aussi)'),
        b('Noun (autant de / davantage de)', 'Nom (autant de / davantage de)'),
        b('Verb alone (autant / davantage)', 'Verbe seul (autant / davantage)'),
      ], [
        ['___ calme que', 0],
        ['___ patience que', 1],
        ['travailler ___', 2],
        ['___ souvent que', 0],
        ['___ temps libre', 1],
        ['écouter ___', 2],
      ]),
      gap(P.complete, 'Mon bureau n’est pas ___ (aussi / autant) grand que le tien, mais j’y passe ___ (autant / aussi) de temps. J’aimerais ___ (davantage / aussi) de lumière naturelle.', [['aussi'], ['autant'], ['davantage']], {
        choices: [
          ['aussi', 'autant', 'davantage'],
          ['autant', 'aussi', 'davantage'],
          ['davantage', 'aussi', 'autant'],
        ],
      }),
      pairs(P.match, [
        ['aussi utile que', b('as useful as', 'd’une utilité égale à')],
        ['autant de livres que', b('as many books as', 'le même nombre de livres que')],
        ['travailler autant que', b('to work as much as', 'fournir la même quantité de travail')],
        ['en savoir davantage', b('to learn / know more', 'obtenir plus d’informations')],
      ]),
      ord(P.order, 'Nous aimerions en savoir davantage sur ce projet !', {
        tr: b('We would like to know more about this project!', 'Nous voudrions obtenir plus d’informations sur ce projet !'),
        extra: ['aussi', 'plus'],
      }),
      dlg(b('Comparing two apartments', 'Comparer deux appartements'), b('Sébastien and Élodie visit a second studio.', 'Sébastien et Élodie visitent un deuxième studio.'), [['Élodie', 'f'], ['Sébastien', 'm2']], [
        [0, 'Celui-ci a autant de placards que le premier, et il est aussi lumineux !', 'This one has as many closets as the first, and it’s just as bright!'],
        [1, { options: ['Oui, et on y entend moins de bruit. En plus, il offre davantage d’espace dans la cuisine.', 'Oui, il est aussi d’espace et davantage lumineux.', 'Oui, il a autant lumineux que l’autre.'], explain: b('Espace is a noun (davantage d’espace); never put davantage before an adjective.', 'Espace est un nom (davantage d’espace) ; on ne met jamais davantage devant un adjectif.') }],
        [0, 'D’accord, alors déposons notre dossier dès ce soir.', 'Agreed, let’s submit our application tonight.'],
      ]),
      dict('Elle parle aussi vite que son frère, mais elle pose davantage de questions.'),
      say('Je ne sors pas autant qu’avant, mais je lis davantage le soir.', 'I don’t go out as much as before, yet I read more in the evening.'),
    ],
    [
      b('aussi + adjective/adverb; autant de + noun; verb + autant.', 'aussi + adjectif/adverbe ; autant de + nom ; verbe + autant.'),
      b('Never use *aussi de* or put an article between autant de and the noun.', 'N’utilisez jamais *aussi de* et ne mettez pas d’article entre autant de et le nom.'),
      b('davantage replaces plus at the end of a clause or with de + noun (never before an adjective).', 'davantage remplace plus en fin de proposition ou avec de + nom (jamais devant un adjectif).'),
    ],
    [
      ['autant de', b('as much / as many', 'la même quantité de')],
      ['aussi … que', b('as … as (adj./adv.)', 'à un degré égal à')],
      ['davantage', b('more (no adj. after)', 'plus (en fin de phrase ou + de)')],
      ['en savoir davantage', b('to find out more', 'en apprendre plus')],
    ],
  ),

  lesson(C, 3, ['double-comparatives-dautant-plus', 'comparatifs-doubles-dautant'],
    b('Double comparatives (plus… plus…) & d’autant plus que', 'Comparatifs doubles (plus… plus…) et d’autant plus que'),
    b('Express proportional change (“the more…, the more…”) and add strong extra justification with d’autant plus que.', 'Exprimez une progression parallèle (plus… plus…) et renforcez un argument grâce à d’autant plus que.'),
    [
      b('Form correlative double comparatives (plus… plus…, moins… moins…)', 'Former les comparatifs doubles (plus… plus…, moins… moins…)'),
      b('Avoid adding le or que in double comparatives', 'Éviter le ou que dans les comparatifs doubles'),
      b('Use d’autant plus que / d’autant moins que / d’autant mieux que', 'Employer d’autant plus que / d’autant moins que / d’autant mieux que'),
    ],
    13,
    [
      card(b('Plus… plus… / Moins… moins… (NO “le”!)', 'Plus… plus… / Moins… moins… (SANS « le » !)'), b('To say “the more…, the more…”, French opens each clause directly with **plus** or **moins** — **never** with *le* and **never** with *que* between the two clauses! Watch word order too: **plus + sujet + verbe**, and if an adjective is compared, place it right after the verb (**plus il est tard** or **plus tard on part**).\nParallel pairs: **plus… plus…, moins… moins…, plus… moins…, moins… plus…**.', 'Pour exprimer une évolution proportionnelle, chaque proposition commence directement par **plus** ou **moins** — **jamais** avec *le* et **jamais** avec *que* entre les deux ! Placez **plus + sujet + verbe**, et l’adjectif après le verbe (**plus il est tard**).\nPaires parallèles : **plus… plus…, moins… moins…, plus… moins…, moins… plus…**.'), {
        table: {
          head: [b('Pattern', 'Schéma'), b('Example', 'Exemple'), b('Meaning', 'Sens')],
          rows: [
            ['Plus…, plus…', 'Plus on lit, plus on enrichit son vocabulaire.', b('The more…, the more…', 'Progression parallèle croissante')],
            ['Moins…, moins…', 'Moins il dort, moins il est concentré.', b('The less…, the less…', 'Progression parallèle décroissante')],
            ['Plus…, moins…', 'Plus j’y réfléchis, moins je suis convaincu.', b('The more…, the less…', 'Progression inverse')],
            ['Moins…, plus…', 'Moins on se presse, plus on travaille bien.', b('The less…, the more…', 'Moins d’un côté, plus de l’autre')],
          ],
        },
        ex: [
          ['Plus la ville grandit, plus les loyers augmentent.', 'The larger the city grows, the higher the rents rise.'],
          ['Moins vous ajoutez de sucre, mieux vous sentez le fruit.', 'The less sugar you add, the better you taste the fruit.'],
        ],
      }),
      card(b('D’autant plus que: adding a decisive reason', 'D’autant plus que : renforcer une raison'), b('**D’autant plus (+ adjectif/adverbe) que** means “all the more (so) because / especially since”. It reinforces a point by giving an extra reason that makes it even stronger. Variants follow the same rule: **d’autant moins que** and **d’autant mieux que** (never *d’autant plus bon*!).\nReinforcement forms: **d’autant plus que, d’autant plus vrai que, d’autant moins que, d’autant mieux que**.', '**D’autant plus (+ adjectif/adverbe) que** signifie « surtout parce que / à plus forte raison parce que ». Cette locution ajoute un argument décisif qui renforce le premier constat. Variantes : **d’autant moins que** et **d’autant mieux que** (jamais *d’autant plus bon* !).\nFormes clés : **d’autant plus que, d’autant plus vrai que, d’autant moins que, d’autant mieux que**.'), {
        ex: [
          ['Ce succès est d’autant plus mérité qu’il a travaillé seul.', 'This success is all the more deserved since he worked alone.'],
          ['Je connais d’autant mieux ce quartier que j’y ai vécu dix ans.', 'I know this neighborhood all the better because I lived there for ten years.'],
          ['La décision semble d’autant plus urgente que l’été approche.', 'The decision seems all the more urgent as summer approaches.'],
        ],
      }),
      trap(b('Avoid the English “the more… the more…” trap', 'Évitez le calque anglais *Le plus… le plus…*'), b('In English you say “The more I practice, the easier it gets.” In French, NEVER write *Le plus je pratique, le plus facile c’est*! Drop **le**, put the subject right after **plus**, and keep any adjective after **est**: **Plus je pratique, plus c’est facile**.\nWrong vs right: **Plus on attend, plus c’est cher.**', 'Ne calquez jamais l’anglais « The more… » avec *Le plus* ! Supprimez **le**, placez le sujet juste après **plus**, et laissez l’adjectif après le verbe : **Plus je pratique, plus c’est facile**.\nForme naturelle : **Plus on attend, plus c’est cher.**')),
      mc(P.best, [
        'Plus le train approche, plus la foule s’agite.',
        'Le plus le train approche, le plus la foule s’agite.',
        'Plus le train approche que plus la foule s’agite.',
      ], { fr: 'Choisissez le comparatif double grammaticalement juste.' }),
      doc({
        look: 'article',
        title: b('Urban cycling note', 'Mobilité douce en ville'),
        text: 'Le nombre de cyclistes progresse chaque trimestre.\nPlus les pistes sont sécurisées, plus les habitants abandonnent la voiture sur les petits trajets.\nCette évolution est d’autant plus encourageante qu’elle réduit aussi le bruit dans les rues commerçantes.',
      }, b('Why does the writer add d’autant plus encourageante qu’…?', 'Pourquoi l’auteur emploie-t-il d’autant plus encourageante qu’… ?'), [
        b('To add a second positive effect that strengthens the praise', 'Pour ajouter un second effet positif qui renforce le constat'),
        b('To contradict the first paragraph', 'Pour contredire le premier paragraphe'),
        b('To say cycling creates more noise', 'Pour dire que le vélo augmente le bruit'),
      ]),
      sort(b('Which comparative nuance fits each sentence?', 'Quelle nuance comparative convient ?'), [
        b('Parallel trend (plus… plus… / moins…)', 'Évolution parallèle (plus… plus… / moins…)'),
        b('Extra justification (d’autant plus / mieux que)', 'Justification renforcée (d’autant plus / mieux que)'),
      ], [
        ['Plus on écoute, plus on comprend.', 0],
        ['C’est d’autant plus utile qu’on voyage souvent.', 1],
        ['Moins il pleut, plus les randonneurs sortent.', 0],
        ['Je l’apprécie d’autant mieux qu’il reste simple.', 1],
        ['Plus on explique, moins c’est flou.', 0],
        ['Je suis d’autant moins inquiet que tout est signé.', 1],
      ]),
      gap(P.complete, '___ tu attendras pour réserver, ___ les billets seront chers. C’est ___ plus vrai ___ le festival tombe un long week-end.', [['Plus'], ['plus'], ['d’autant'], ['que']], {
        choices: [
          ['Plus', 'Le plus', 'Autant'],
          ['plus', 'que plus', 'le plus'],
          ['d’autant', 'autant', 'aussi'],
          ['que', 'car', 'dont'],
        ],
      }),
      pairs(P.match, [
        ['Plus on est nombreux, plus on rit.', b('The more of us there are, the more we laugh.', 'Plus le groupe grandit, plus l’ambiance est joyeuse.')],
        ['d’autant plus vite que', b('all the faster because', 'encore plus rapidement puisque')],
        ['d’autant moins probable que', b('all the less likely since', 'encore moins vraisemblable vu que')],
        ['d’autant mieux que', b('all the better because', 'avec d’autant plus d’aisance que')],
      ]),
      ord(P.order, 'Ce résultat est d’autant plus remarquable que le budget était modeste.', {
        tr: b('This result is all the more remarkable because the budget was modest.', 'Ce résultat mérite d’autant plus d’attention que le budget était limité.'),
        extra: ['autant', 'aussi'],
      }),
      dict('Plus nous échangeons en français, moins nous hésitons, d’autant plus que nos sujets deviennent variés.'),
      write(
        b('Argue a short opinion using advanced comparatives.', 'Défendez une opinion courte avec des comparatifs nuancés.'),
        b('Write 3–4 sentences comparing two habits (reading, cooking, cycling, remote work) using one double comparative (plus… plus… or moins… plus…) and d’autant plus que.', 'Rédigez 3 à 4 phrases sur une habitude (lecture, cuisine, vélo, télétravail) en utilisant un comparatif double (plus… plus… ou moins… plus…) et d’autant plus que.'),
        28, 60,
        [
          b('Build a double comparative without le or que', 'Construire un comparatif double sans le ni que'),
          b('Use d’autant plus (or d’autant mieux) que', 'Utiliser d’autant plus (ou d’autant mieux) que'),
          b('Keep bon/meilleur or bien/mieux accurate', 'Respecter l’accord de meilleur ou l’invariabilité de mieux'),
        ],
        'Depuis que je cuisine le dimanche, je mange nettement mieux en semaine. Plus je prépare mes repas à l’avance, moins je dépense à midi. C’est une habitude d’autant plus agréable qu’elle rassemble toute la famille autour de la table.',
        { phrases: ['Plus je…, plus/moins…', 'd’autant plus … que…', 'nettement mieux / meilleur(e)'] },
      ),
    ],
    [
      b('Double comparatives drop le and que: Plus on pratique, mieux on parle.', 'Les comparatifs doubles suppriment le et que : Plus on pratique, mieux on parle.'),
      b('Keep adjectives after the verb in double comparatives (plus c’est simple).', 'Gardez l’adjectif après le verbe dans les comparatifs doubles (plus c’est simple).'),
      b('d’autant plus / moins / mieux que reinforces a claim with a decisive reason.', 'd’autant plus / moins / mieux que renforce une idée par une raison décisive.'),
    ],
    [
      ['plus…, plus…', b('the more…, the more…', 'progression parallèle croissante')],
      ['d’autant plus que', b('all the more because', 'à plus forte raison puisque')],
      ['d’autant mieux que', b('all the better because', 'd’autant plus facilement que')],
      ['d’autant moins que', b('all the less because', 'encore moins puisque')],
    ],
  ),
];

export default lessons;
