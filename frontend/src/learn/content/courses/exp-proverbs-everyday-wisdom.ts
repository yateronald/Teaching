import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Wield classic French proverbs at C1 level with precision and restraint. Decode warnings about appearances and caution (l’habit ne fait pas le moine, chat échaudé craint l’eau froide), temper impatience with nature proverbs (petit à petit l’oiseau fait son nid, chasser le naturel), and weave practical wisdom into speech and essays naturally.',
    'Maniez les grands proverbes français au niveau C1 avec justesse et mesure. Décryptez la prudence face aux apparences (l’habit ne fait pas le moine, chat échaudé craint l’eau froide), les leçons de patience et de nature (petit à petit l’oiseau fait son nid, chasser le naturel), et intégrez la sagesse proverbiale sans lourdeur.',
  ),
  outcomes: [
    b('Interpret cautionary proverbs accurately, including French vs English shifts', 'Saisir les nuances des proverbes de prudence et leurs faux amis culturels'),
    b('Use truncated and conversational proverb forms like a native speaker', 'Reconnaître et employer les formes abrégées ou allusives en conversation'),
    b('Frame proverbs elegantly in C1 commentary without sounding cliché', 'Introduire un proverbe avec naturel dans un essai ou un débat C1'),
  ],
};

const C = 'exp-proverbs-everyday-wisdom';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['appearances-and-caution', 'apparences-et-prudence'],
    b('Appearances, suspicion & caution', 'Apparences, méfiance et prudence'),
    b('Judge beyond surface glitter, read warning signs and know why a scalded cat fears cold water.', 'Se méfier des apparences, repérer les signes avant-coureurs et comprendre la prudence née de l’expérience.'),
    [
      b('Contrast l’habit ne fait pas le moine with les apparences sont parfois trompeuses', 'Opposer l’habit ne fait pas le moine et les apparences sont parfois trompeuses'),
      b('Understand chat échaudé craint l’eau froide and il n’y a pas de fumée sans feu', 'Employer chat échaudé craint l’eau froide et il n’y a pas de fumée sans feu'),
      b('Avoid the English semantic trap around pierre qui roule n’amasse pas mousse', 'Éviter le faux ami culturel sur pierre qui roule n’amasse pas mousse'),
    ],
    13,
    [
      card(
        b('Beyond first impressions and sudden rumours', 'Au-delà des apparences et des rumeurs'),
        b(
          'French cautionary proverbs warn against naive trust—and against careless restlessness. Whether reminding us that **l’habit ne fait pas le moine** (judge merit, not clothes or titles), that **les apparences sont parfois trompeuses**, that **il n’y a pas de fumée sans feu** (persistent rumours rarely arise from nothing), or that **chat échaudé craint l’eau froide** (a bad past shock makes someone wary of anything similar), each formula condenses a whole argument.\nAppearances: **l’habit ne fait pas le moine · les apparences sont parfois trompeuses**.\nCaution & stability: **chat échaudé craint l’eau froide · il n’y a pas de fumée sans feu · pierre qui roule n’amasse pas mousse**.',
          'Les proverbes de prudence mettent en garde contre l’illusion comme contre l’instabilité. Qu’il s’agisse de rappeler que **l’habit ne fait pas le moine**, que **les apparences sont parfois trompeuses**, qu’**il n’y a pas de fumée sans feu** (une rumeur insistante repose souvent sur un fond de vérité) ou que **chat échaudé craint l’eau froide** (une mauvaise expérience rend méfiant même devant un risque nul), chaque formule condense une argumentation.\nApparences : **l’habit ne fait pas le moine · les apparences sont parfois trompeuses**.\nPrudence et ancrage : **chat échaudé craint l’eau froide · il n’y a pas de fumée sans feu · pierre qui roule n’amasse pas mousse**.',
        ),
        {
          table: {
            head: [b('Proverb', 'Proverbe'), b('Meaning', 'Sens'), b('Typical context', 'Contexte d’emploi')],
            rows: [
              ['l’habit ne fait pas le moine', b('don’t judge by appearances / clothing', 'ne pas juger à l’extérieur ou au titre'), b('casual dress hiding talent, or polish hiding incompetence', 'tenue modeste cachant un expert, ou l’inverse')],
              ['chat échaudé craint l’eau froide', b('once bitten, twice shy', 'une mauvaise expérience rend hyper-prudent'), b('hesitating after a past scam or failure', 'méfiance après une déconvenue passée')],
              ['les apparences sont parfois trompeuses', b('appearances can be deceiving', 'ce qui semble évident peut induire en erreur'), b('surprising twist or misjudged situation', 'revirement inattendu ou jugement hâtif')],
              ['pierre qui roule n’amasse pas mousse', b('a rolling stone gathers no moss (instability prevents wealth)', 'qui change sans cesse ne bâtit rien de durable'), b('warning against frequent job/city hops', 'mise en garde contre l’instabilité')],
              ['il n’y a pas de fumée sans feu', b('where there’s smoke, there’s fire', 'toute rumeur tenace a souvent une cause réelle'), b('leaks, scandals, persistent whispers', 'fuites, rumeurs persistantes')],
            ],
          },
          ex: [
            ['Méfiez-vous des contrats trop flatteurs : les apparences sont parfois trompeuses.', 'Be wary of overly flattering contracts: appearances can be deceiving.'],
            ['Après sa faillite, il refuse tout crédit ; chat échaudé craint l’eau froide.', 'After his bankruptcy, he refuses any loan; once bitten, twice shy.'],
            ['L’entreprise nie toute tension, mais trois cadres démissionnent : il n’y a pas de fumée sans feu.', 'The firm denies any tension, yet three executives resign: where there is smoke, there is fire.'],
          ],
        },
      ),
      culture(
        b('Why « pierre qui roule » diverges from modern English', 'Pourquoi « pierre qui roule » garde un sens prudent en français'),
        b(
          'English speakers sometimes quote *“a rolling stone gathers no moss”* approvingly to praise staying agile and untamed. In French, **pierre qui roule n’amasse pas mousse** still carries its traditional warning: moss symbolises accumulated wealth, roots and stability, so changing jobs, partners or projects endlessly leaves you empty-handed.',
          'En anglais moderne, on cite parfois ce proverbe pour louer le mouvement et la liberté. En français, **pierre qui roule n’amasse pas mousse** conserve presque toujours sa mise en garde d’origine : la mousse représente l’épargne et l’enracinement, et changer sans cesse empêche de bâtir durablement.',
        ),
      ),
      flash(
        b('Appearances & caution', 'Apparences et prudence'),
        [
          ['l’habit ne fait pas le moine', b('don’t judge a book by its cover', 'l’apparence extérieure ne prouve rien')],
          ['chat échaudé craint l’eau froide', b('once bitten, twice shy', 'une épreuve rend méfiant même sans danger')],
          ['les apparences sont parfois trompeuses', b('appearances can be deceiving', 'l’image visible peut induire en erreur')],
          ['pierre qui roule n’amasse pas mousse', b('a rolling stone gathers no moss (restlessness prevents lasting gains)', 'l’instabilité empêche de s’enrichir ou de s’ancrer')],
          ['il n’y a pas de fumée sans feu', b('there’s no smoke without fire', 'une rumeur tenace repose souvent sur un fait réel')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('Having suffered once before, he now distrusts even harmless offers.', 'Échaudé par un échec passé, il se méfie désormais même d’une offre sûre.'),
          b('He always boils water carefully before making tea for guests.', 'Il fait toujours bouillir l’eau avant de servir ses invités.'),
          b('He adopts stray cats whenever winter temperatures drop.', 'Il recueille les chats du quartier dès les premiers froids.'),
          b('He welcomes risky ventures enthusiastically after losing money.', 'Il multiplie les paris risqués juste après avoir perdu gros.'),
        ],
        {
          fr: 'Depuis cette escroquerie, Marc vérifie trois fois chaque facture : chat échaudé craint l’eau froide.',
          explain: b('A scalded cat fears even cold water—someone hurt once becomes wary of harmless parallels.', 'Un chat brûlé par l’eau chaude craint même l’eau froide : une déception rend prudent à l’excès.'),
        },
      ),
      mc(
        P.complete,
        [
          'l’habit ne fait pas le moine',
          'il n’y a pas de fumée sans feu',
          'pierre qui roule n’amasse pas mousse',
          'chat échaudé craint l’eau froide',
        ],
        {
          fr: 'Cet ingénieur porte un vieux pull troué, mais il dirige les meilleurs chercheurs du pays : décidément, ___ .',
          explain: b('Humble clothing masking brilliance illustrates l’habit ne fait pas le moine.', 'Une tenue simple dissimulant un grand talent illustre l’habit ne fait pas le moine.'),
        },
      ),
      pairs(
        P.match,
        [
          ['l’habit ne fait pas le moine', b('don’t judge a book by its cover', 'l’apparence extérieure ne prouve rien')],
          ['chat échaudé craint l’eau froide', b('once bitten, twice shy', 'une épreuve rend méfiant même sans danger')],
          ['les apparences sont parfois trompeuses', b('appearances can be deceiving', 'l’image visible peut induire en erreur')],
          ['pierre qui roule n’amasse pas mousse', b('a rolling stone gathers no moss (restlessness prevents lasting gains)', 'l’instabilité empêche de s’enrichir ou de s’ancrer')],
          ['il n’y a pas de fumée sans feu', b('there’s no smoke without fire', 'une rumeur tenace repose souvent sur un fait réel')],
        ],
      ),
      gap(
        P.complete,
        'Même si la direction dément la fusion, il n’y a pas de ___ sans ___, et l’on sait bien que les ___ sont parfois trompeuses.',
        ['fumée', 'feu', 'apparences'],
        {
          choices: [
            ['fumée', 'mousse', 'pluie'],
            ['feu', 'eau', 'vent'],
            ['apparences', 'habitudes', 'pierres'],
          ],
          explain: b('il n’y a pas de fumée sans feu; les apparences sont parfois trompeuses.', 'il n’y a pas de fumée sans feu ; les apparences sont parfois trompeuses.'),
        },
      ),
      hear(
        'En dix ans, Lucas a changé sept fois de ville et de métier sans jamais poser ses valises ; ses parents lui répètent que pierre qui roule n’amasse pas mousse.',
        b('What are Lucas’s parents worried about?', 'Que craignent les parents de Lucas ?'),
        [
          b('That constant instability keeps him from building lasting security.', 'Que son instabilité constante l’empêche de bâtir quelque chose de solide.'),
          b('That he has spent too long working in the same city.', 'Qu’il reste trop longtemps bloqué dans une seule entreprise.'),
          b('That he collects stones during his hikes in the countryside.', 'Qu’il perde son temps à ramasser des pierres en randonnée.'),
        ],
        {
          voice: 'm',
          explain: b('In French, pierre qui roule n’amasse pas mousse warns against constant mobility without putting down roots.', 'En français, pierre qui roule n’amasse pas mousse met en garde contre l’instabilité chronique.'),
        },
      ),
      dict(
        'L’habit ne fait pas le moine et les apparences sont parfois trompeuses.',
        {
          voice: 'f',
          hint: b('Watch silent h in habit and feminine plural -es in trompeuses.', 'Attention au h muet d’habit et à l’accord féminin pluriel trompeuses.'),
        },
      ),
      say(
        'Chat échaudé craint l’eau froide, mais les apparences sont parfois trompeuses.',
        'Once bitten, twice shy, yet appearances can sometimes be deceiving.',
      ),
    ],
    [
      b('L’habit ne fait pas le moine & les apparences sont parfois trompeuses caution against superficial judgement.', 'L’habit ne fait pas le moine et les apparences sont parfois trompeuses invitent à dépasser les dehors.'),
      b('Chat échaudé craint l’eau froide = extreme caution after a setback; il n’y a pas de fumée sans feu = rumours often reflect a real spark.', 'Chat échaudé craint l’eau froide = prudence extrême après un choc ; il n’y a pas de fumée sans feu = rumeur fondée.'),
      b('In French, pierre qui roule n’amasse pas mousse warns against constant restlessness.', 'En français, pierre qui roule n’amasse pas mousse déconseille l’instabilité permanente.'),
    ],
    [
      ['l’habit ne fait pas le moine', b('don’t judge a book by its cover', 'l’apparence extérieure ne prouve rien')],
      ['chat échaudé craint l’eau froide', b('once bitten, twice shy', 'une épreuve rend méfiant même sans danger')],
      ['les apparences sont parfois trompeuses', b('appearances can be deceiving', 'l’image visible peut induire en erreur')],
      ['pierre qui roule n’amasse pas mousse', b('a rolling stone gathers no moss (restlessness prevents lasting gains)', 'l’instabilité empêche de s’enrichir ou de s’ancrer')],
      ['il n’y a pas de fumée sans feu', b('there’s no smoke without fire', 'une rumeur tenace repose souvent sur un fait réel')],
    ],
  ),

  lesson(
    C,
    2,
    ['nature-patience-and-effort', 'nature-patience-et-effort'],
    b('Nature, patience & calculated risk', 'Nature, patience et prise de risque'),
    b('Why old habits gallop back, slow steady work builds a nest and starting on time beats sprinting.', 'Pourquoi les travers reviennent au galop, la patience paie et partir à point vaut mieux que courir.'),
    [
      b('Use chasser le naturel, il revient au galop for ingrained traits', 'Employer chasser le naturel, il revient au galop pour les réflexes tenaces'),
      b('Balance patience proverbs with qui ne risque rien n’a rien', 'Concilier les proverbes de patience avec qui ne risque rien n’a rien'),
      b('Recognise shortened spoken versions like « Rien ne sert de courir… »', 'Comprendre les formes tronquées à l’oral comme « Rien ne sert de courir… »'),
    ],
    13,
    [
      card(
        b('Patience, temperament and daring', 'Tempérament, persévérance et audace'),
        b(
          'Several famous French proverbs come straight from classical theatre and fables. Destouches gave us **Chassez le naturel, il revient au galop** (also cited as **chasser le naturel, il revient au galop**), while La Fontaine taught **Rien ne sert de courir ; il faut partir à point**. Paired with **petit à petit l’oiseau fait son nid**, **tout vient à point à qui sait attendre** and **qui ne risque rien n’a rien**, they map the tension between patience and initiative.\nNature & daring: **chasser le naturel, il revient au galop · qui ne risque rien n’a rien**.\nPatience & pacing: **petit à petit l’oiseau fait son nid · rien ne sert de courir · tout vient à point à qui sait attendre**.',
          'Plusieurs proverbes célèbres viennent du théâtre et des fables : Destouches écrivait *Chassez le naturel, il revient au galop* (souvent cité **chasser le naturel, il revient au galop**), et La Fontaine **Rien ne sert de courir** (; *il faut partir à point*). Avec **petit à petit l’oiseau fait son nid**, **tout vient à point à qui sait attendre** et **qui ne risque rien n’a rien**, ils dessinent l’équilibre entre constance et audace.\nNature et audace : **chasser le naturel, il revient au galop · qui ne risque rien n’a rien**.\nPatience et rythme : **petit à petit l’oiseau fait son nid · rien ne sert de courir · tout vient à point à qui sait attendre**.',
        ),
        {
          table: {
            head: [b('Proverb', 'Proverbe'), b('Meaning', 'Sens'), b('Literary / usage note', 'Origine et usage')],
            rows: [
              ['chasser le naturel, il revient au galop', b('you cannot change your true nature; old habits return', 'les penchants profonds finissent toujours par ressurgir'), b('Destouches (1732): Chassez le naturel…', 'Destouches (1732) : Chassez le naturel…')],
              ['petit à petit l’oiseau fait son nid', b('little by little, steady effort achieves big goals', 'avec patience et régularité, on accomplit beaucoup'), b('encouraging slow steady progress', 'encourage la progression régulière')],
              ['qui ne risque rien n’a rien', b('nothing ventured, nothing gained', 'sans prise de risque, aucun résultat majeur'), b('justifies bold moves or investments', 'justifie une initiative audacieuse')],
              ['rien ne sert de courir', b('haste makes waste (… il faut partir à point)', 'inutile de se précipiter ; mieux vaut partir à temps'), b('La Fontaine, The Hare and the Tortoise', 'La Fontaine, Le Lièvre et la Tortue')],
              ['tout vient à point à qui sait attendre', b('all good things come to those who wait', 'la réussite arrive au moment propice avec patience'), b('à point = at the ripe/right moment', 'à point = au moment juste')],
            ],
          },
          ex: [
            ['Il avait juré de rester discret, mais dès qu’on parle d’architecture, chassez le naturel, il revient au galop !', 'He swore to stay quiet, yet the moment architecture comes up, old habits gallop right back!'],
            ['Ne brûlez pas les étapes : rien ne sert de courir, il faut partir à point.', 'Don’t skip steps: haste makes waste, you have to set off on time.'],
            ['Lancer cette revue indépendante est risqué, certes, mais qui ne risque rien n’a rien.', 'Launching this independent journal is risky, true, yet nothing ventured, nothing gained.'],
          ],
        },
      ),
      trap(
        b('Half-spoken proverbs and the trap of « à point »', 'Proverbes sous-entendus et piège de « à point »'),
        b(
          'In real French conversation, speakers often utter only the first clause—*« Oh, tu sais, chassez le naturel… »* or *« Rien ne sert de courir ! »*—relying on the listener to complete the rest mentally. Also watch **à point** in **tout vient à point à qui sait attendre**: here *à point* means *at the right/ripe moment* (NOT medium-rare meat, and NEVER *tout vient à point pour qui*, always **à qui sait attendre**!).',
          'À l’oral, les francophones ne prononcent souvent que le début : *« Tu sais bien, chassez le naturel… »* ou *« Rien ne sert de courir ! »*, en laissant l’interlocuteur compléter. Attention aussi à **à point** dans **tout vient à point à qui sait attendre** : cela signifie « au moment propice », et la préposition reste toujours **à qui** (jamais *pour qui*).',
        ),
      ),
      flash(
        b('Nature, patience & effort', 'Nature, patience et effort'),
        [
          ['chasser le naturel, il revient au galop', b('old habits die hard; nature always returns', 'on ne peut réprimer longtemps sa vraie nature')],
          ['petit à petit l’oiseau fait son nid', b('little by little, steady work builds success', 'la constance permet d’accomplir de grandes choses')],
          ['qui ne risque rien n’a rien', b('nothing ventured, nothing gained', 'il faut oser prendre des risques pour obtenir quelque chose')],
          ['rien ne sert de courir', b('no use rushing; better to start on time', 'la précipitation est vaine ; il faut partir à point')],
          ['tout vient à point à qui sait attendre', b('good things come to those who wait', 'la patience finit par porter ses fruits au bon moment')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('Deep-rooted habits inevitably resurface despite efforts to hide them.', 'Les penchants naturels finissent toujours par ressurgir malgré les efforts.'),
          b('Riding horses outdoors cures bad habits faster than indoor study.', 'L’équitation en plein air corrige les défauts plus vite que l’étude.'),
          b('Once a habit is chased away, it never comes back again.', 'Une fois chassé, un défaut disparaît définitivement.'),
          b('Rushing forward at full speed is the safest way to win.', 'Foncer au galop garantit toujours la victoire finale.'),
        ],
        {
          fr: 'Elle voulait rester neutre, mais dès qu’on critique son quartier, chassez le naturel, il revient au galop.',
          explain: b('Nature repressed momentarily gallops right back as soon as a trigger appears.', 'Le naturel qu’on essaie de contenir revient aussitôt dès que l’occasion se présente.'),
        },
      ),
      mc(
        P.best,
        [
          'Rien ne sert de courir : mieux vaut consolider les bases chaque semaine.',
          'Qui ne risque rien n’a rien, donc négligeons toute préparation méthodique.',
          'Tout vient à point à qui court sans jamais réfléchir.',
          'Petit à petit l’oiseau perd son nid s’il travaille trop longtemps.',
        ],
        {
          fr: 'Un étudiant veut apprendre mille mots en un week-end avant son examen dans six mois. Que lui répondre ?',
          explain: b('Cramming misses the value of steady, well-timed progress (rien ne sert de courir).', 'Le bachotage ignore la valeur d’un travail régulier et démarré à temps.'),
        },
      ),
      sort(
        b('Patience and steady pace, or daring and human nature?', 'Patience et régularité, ou audace et nature humaine ?'),
        [b('Patience & steady progress', 'Patience et progression'), b('Boldness & innate nature', 'Audace et tempérament')],
        [
          ['petit à petit l’oiseau fait son nid', 0],
          ['qui ne risque rien n’a rien', 1],
          ['tout vient à point à qui sait attendre', 0],
          ['chasser le naturel, il revient au galop', 1],
          ['rien ne sert de courir', 0],
          ['oser lancer un projet sans garantie totale', 1],
        ],
        { explain: b('Three proverbs celebrate steady pacing; the other two address innate temperament and taking chances.', 'Trois proverbes valorisent la constance ; les autres portent sur le tempérament inné et l’audace.') },
      ),
      gap(
        P.complete,
        'Pour réussir un projet durable, souvenez-vous que rien ne sert de ___ et que petit à petit l’oiseau fait son ___ ; mais osez tout de même, car qui ne ___ rien n’a rien.',
        ['courir', 'nid', 'risque'],
        {
          tr: 'To succeed in a lasting project, remember there is no point rushing and little by little the bird builds its nest; yet still dare, for nothing ventured, nothing gained.',
          hint: b('Three words: an infinitive (to run), a noun (nest), and a verb (risks).', 'Trois mots : un infinitif (courir), un nom (nid) et un verbe conjugué (risque).'),
          explain: b('rien ne sert de courir; petit à petit l’oiseau fait son nid; qui ne risque rien n’a rien.', 'rien ne sert de courir ; petit à petit l’oiseau fait son nid ; qui ne risque rien n’a rien.'),
        },
      ),
      ord(
        P.order,
        'Tout vient à point à qui sait attendre.',
        {
          tr: 'All good things come to those who wait.',
          extra: ['courir', 'attend'],
          explain: b('Fixed wording: Tout vient à point + à qui sait attendre (infinitive after savoir).', 'Formule figée : Tout vient à point + à qui sait attendre (infinitif après sait).'),
        },
      ),
      hear(
        'Mon père jurait qu’à la retraite il ne toucherait plus un ordinateur ; deux mois plus tard, il programmait déjà un nouveau site : chassez le naturel, il revient au galop !',
        b('What happened to the speaker’s father after retiring?', 'Qu’est-il arrivé au père du locuteur à la retraite ?'),
        [
          b('He soon went right back to his lifelong passion for computing.', 'Il a vite renoué avec sa passion de toujours pour l’informatique.'),
          b('He sold all his computers and moved to the countryside.', 'Il a vendu tous ses ordinateurs et déménagé à la campagne.'),
          b('He took up horse riding every morning after retiring.', 'Il s’est mis à monter à cheval chaque matin.'),
        ],
        {
          voice: 'm',
          explain: b('Despite promising to stop, his natural inclination returned immediately.', 'Malgré ses promesses, sa passion naturelle a repris le dessus.'),
        },
      ),
      say(
        'Petit à petit l’oiseau fait son nid : tout vient à point à qui sait attendre.',
        'Little by little the bird builds its nest: good things come to those who wait.',
      ),
    ],
    [
      b('Chasser le naturel, il revient au galop = ingrained traits always resurface.', 'Chasser le naturel, il revient au galop = les penchants profonds ressurgissent toujours.'),
      b('Rien ne sert de courir (… il faut partir à point), petit à petit l’oiseau fait son nid, tout vient à point à qui sait attendre = steady patience.', 'Rien ne sert de courir, petit à petit l’oiseau fait son nid, tout vient à point à qui sait attendre = patience constante.'),
      b('Qui ne risque rien n’a rien balances caution by encouraging bold initiative.', 'Qui ne risque rien n’a rien équilibre la prudence en défendant l’audace.'),
    ],
    [
      ['chasser le naturel, il revient au galop', b('old habits die hard; nature always returns', 'on ne peut réprimer longtemps sa vraie nature')],
      ['petit à petit l’oiseau fait son nid', b('little by little, steady work builds success', 'la constance permet d’accomplir de grandes choses')],
      ['qui ne risque rien n’a rien', b('nothing ventured, nothing gained', 'il faut oser prendre des risques pour obtenir quelque chose')],
      ['rien ne sert de courir', b('no use rushing; better to start on time', 'la précipitation est vaine ; il faut partir à point')],
      ['tout vient à point à qui sait attendre', b('good things come to those who wait', 'la patience finit par porter ses fruits au bon moment')],
    ],
  ),

  lesson(
    C,
    3,
    ['human-wisdom-and-action', 'sagesse-pratique-et-action'],
    b('Human wisdom: foresight, action & craft', 'Sagesse pratique : prévoyance, volonté et métier'),
    b('Move from wait-and-see realism to decisive action and mastery earned through practice.', 'Passer du réalisme attentif à l’action décisive et à la maîtrise acquise par la pratique.'),
    [
      b('Contrast qui vivra verra with aux grands maux les grands remèdes', 'Opposer qui vivra verra et aux grands maux les grands remèdes'),
      b('Distinguish mieux vaut prévenir que guérir from crisis measures', 'Distinguer la prévention (mieux vaut prévenir que guérir) de l’urgence'),
      b('Use c’est en forgeant qu’on devient forgeron and vouloir c’est pouvoir thoughtfully', 'Employer c’est en forgeant qu’on devient forgeron et vouloir c’est pouvoir avec nuances'),
    ],
    13,
    [
      card(
        b('Pragmatism, effort and craftsmanship', 'Pragmatisme, volonté et maîtrise par l’exercice'),
        b(
          'Everyday French wisdom weighs future uncertainty (**qui vivra verra**), bold crisis responses (**aux grands maux les grands remèdes**), upstream prevention (**mieux vaut prévenir que guérir**), determination (**vouloir c’est pouvoir**), and mastery gained only through hands-on repetition (**c’est en forgeant qu’on devient forgeron**).\nCaution & foresight: **qui vivra verra · mieux vaut prévenir que guérir**.\nAction & mastery: **aux grands maux les grands remèdes · vouloir c’est pouvoir · c’est en forgeant qu’on devient forgeron**.',
          'La sagesse quotidienne met en balance l’incertitude (**qui vivra verra**), les mesures radicales en cas de crise (**aux grands maux les grands remèdes**), la prévention (**mieux vaut prévenir que guérir**), la détermination (**vouloir c’est pouvoir**) et l’apprentissage par la pratique (**c’est en forgeant qu’on devient forgeron**).\nPrévoyance et attente : **qui vivra verra · mieux vaut prévenir que guérir**.\nDécision et maîtrise : **aux grands maux les grands remèdes · vouloir c’est pouvoir · c’est en forgeant qu’on devient forgeron**.',
        ),
        {
          table: {
            head: [b('Proverb', 'Proverbe'), b('Meaning', 'Sens'), b('Nuance', 'Nuance')],
            rows: [
              ['qui vivra verra', b('time will tell; wait and see', 'l’avenir nous le dira ; on verra bien'), b('philosophical, slightly fatalistic', 'philosophique, accepte l’incertitude')],
              ['aux grands maux les grands remèdes', b('desperate times call for desperate measures', 'une crise grave exige une réponse forte'), b('no verb; plural maux (mal → maux)', 'sans verbe ; pluriel irrégulier maux')],
              ['mieux vaut prévenir que guérir', b('prevention is better than cure', 'anticiper un problème coûte moins que le réparer'), b('policy, health, risk management', 'santé, gestion des risques, politique')],
              ['vouloir c’est pouvoir', b('where there’s a will, there’s a way', 'la détermination rend l’objectif possible'), b('can sound naive if unnuanced at C1', 'à nuancer au C1 pour éviter la naïveté')],
              ['c’est en forgeant qu’on devient forgeron', b('practice makes perfect', 'c’est par la pratique répétée qu’on maîtrise un art'), b('gerund en forgeant (keep the e)', 'gérondif en forgeant (garder le e)')],
            ],
          },
          ex: [
            ['Installer des digues coûte cher, mais mieux vaut prévenir que guérir.', 'Building dikes is expensive, yet prevention is better than cure.'],
            ['Le réseau s’effondre chaque matin : aux grands maux les grands remèdes, on change toute l’architecture.', 'The network crashes every morning: desperate times call for desperate measures, we are replacing the entire architecture.'],
            ['Ne vous découragez pas devant les premiers brouillons : c’est en forgeant qu’on devient forgeron.', 'Don’t get discouraged by early drafts: practice makes perfect.'],
          ],
        },
      ),
      culture(
        b('How C1 speakers introduce proverbs without sounding stiff', 'Citer un proverbe au C1 sans tomber dans le lieu commun'),
        b(
          'Dropping bare proverbs like *« Vouloir, c’est pouvoir ! »* in an essay can sound simplistic. C1 speakers **frame, qualify or gently play with them**: *« Sans céder à l’adage trop commode selon lequel vouloir c’est pouvoir… »*, *« Comme le rappelle le bon sens populaire, mieux vaut prévenir que guérir »*, or *« Qui vivra verra, bien sûr, mais… »*.',
          'Poser un proverbe brut comme *« Vouloir, c’est pouvoir ! »* dans une dissertation peut paraître simpliste. Au niveau C1, on l’**encadre ou on le nuance** : *« Sans céder à la facilité du vouloir c’est pouvoir… »*, *« Comme le veut l’adage, mieux vaut prévenir que guérir »* ou *« Qui vivra verra, certes, encore faut-il… »*.',
        ),
      ),
      mc(
        P.best,
        [
          'Face à une épidémie de pannes coûteuses, une maintenance préventive s’impose : mieux vaut prévenir que guérir.',
          'Comme personne ne peut prévoir l’avenir, abandonnons toute maintenance : c’est en forgeant qu’on devient forgeron.',
          'La crise est bénigne, alors appliquons sans délai les mesures les plus extrêmes : qui vivra verra.',
          'L’argent manque totalement pour réparer le pont, mais vouloir c’est pouvoir sans aucun budget.',
        ],
        {
          fr: 'Quel commentaire mobilise un proverbe avec justesse dans un rapport technique ?',
          explain: b('Preventive maintenance directly embodies mieux vaut prévenir que guérir.', 'La maintenance préventive illustre exactement mieux vaut prévenir que guérir.'),
        },
      ),
      pairs(
        P.match,
        [
          ['qui vivra verra', b('time will tell, wait and see', 'seul l’avenir montrera ce qui adviendra')],
          ['aux grands maux les grands remèdes', b('desperate times call for desperate measures', 'une crise grave appelle une action énergique')],
          ['mieux vaut prévenir que guérir', b('prevention is better than cure', 'anticiper évite de réparer plus tard')],
          ['vouloir c’est pouvoir', b('where there’s a will, there’s a way', 'la volonté permet de surmonter l’obstacle')],
          ['c’est en forgeant qu’on devient forgeron', b('practice makes perfect', 'on acquiert la maîtrise en s’exerçant')],
        ],
      ),
      hear(
        'Le directeur hésite encore à réformer entièrement le service ; pour moi, la crise est trop grave pour des demi-mesures : aux grands maux les grands remèdes.',
        b('What position does the speaker defend?', 'Quelle position défend la locutrice ?'),
        [
          b('The severity of the crisis demands decisive, sweeping action rather than half-measures.', 'La gravité de la crise exige une réforme résolue plutôt que des demi-mesures.'),
          b('They should wait several months to see if the crisis solves itself.', 'Il vaut mieux attendre quelques mois sans rien changer.'),
          b('Minor tweaks will fix the entire department effortlessly.', 'De petits ajustements suffiront largement à tout régler.'),
        ],
        {
          voice: 'f2',
          explain: b('Aux grands maux les grands remèdes rejects timid half-measures when a crisis is severe.', 'Aux grands maux les grands remèdes écarte les demi-mesures face à une crise majeure.'),
        },
      ),
      dlg(
        b('Learning a demanding craft', 'Apprendre un métier exigeant'),
        b('Bastien doubts his progress in cabinetmaking; his mentor Sabine puts things in perspective.', 'Bastien doute de ses progrès en ébénisterie ; son mentor Sabine remet les choses en perspective.'),
        [['Bastien', 'm2'], ['Sabine', 'f']],
        [
          [0, 'Mon troisième assemblage est encore de travers… Je me demande si j’ai vraiment l’étoffe d’un ébéniste.', 'My third joint is crooked again… I wonder if I’m really cut out to be a cabinetmaker.'],
          [1, {
            options: [
              'Ne te décourage pas après trois essais : c’est en forgeant qu’on devient forgeron.',
              'Tu as raison, aux grands maux les grands remèdes, jette tout à la poubelle.',
              'De toute façon, les apparences sont parfois trompeuses, arrête dès ce soir.',
            ],
            explain: b('Mastery comes only through repeated practice: c’est en forgeant qu’on devient forgeron.', 'La maîtrise vient par l’exercice répété : c’est en forgeant qu’on devient forgeron.'),
          }],
          [0, 'Je sais bien que je manque d’entraînement, mais je perds du temps sur chaque coupe.', 'I know I lack practice, yet I waste time on every single cut.'],
          [1, {
            options: [
              'Vérifions tes réglages avant de tracer la coupe : mieux vaut prévenir que guérir !',
              'Fais-les de plus en plus vite sans vérifier : qui vivra verra !',
              'Dans ce métier, il n’y a pas de fumée sans feu, alors évite les outils.',
            ],
            explain: b('Checking measurements ahead of cutting prevents wasted wood: mieux vaut prévenir que guérir.', 'Contrôler ses réglages avant de couper évite les erreurs : mieux vaut prévenir que guérir.'),
          }],
          [0, 'C’est vrai qu’avec de la méthode et de l’envie, on avance déjà plus sereinement.', 'True—with method and drive, you move forward much more calmly.'],
          [1, 'Exactement : la volonté aide, la pratique fait le reste — et dans un an, qui vivra verra tes progrès !', 'Exactly: willpower helps, practice does the rest—and in a year, time will show how far you’ve come!'],
        ],
      ),
      dict(
        'Mieux vaut prévenir que guérir : c’est en forgeant qu’on devient forgeron.',
        {
          voice: 'm2',
          hint: b('Keep the e after g in forgeant, and double-check the spelling of guérir.', 'Gardez le e après g dans forgeant et l’accent de guérir.'),
        },
      ),
      write(
        b('Nuanced reflection on effort and foresight', 'Réflexion nuancée sur la volonté et la prudence'),
        b('In 80–140 words, write a short opinion paragraph for a debate on whether persistence alone guarantees success in a new career or skill. Frame and weave in at least four proverbs from this course naturally.', 'En 80 à 140 mots, rédigez un paragraphe argumenté demandant si la seule volonté garantit le succès dans un nouveau métier. Intégrez avec nuance au moins quatre proverbes de ce cours.'),
        80,
        140,
        [
          b('At least four proverbs framed naturally rather than dropped raw', 'Au moins quatre proverbes encadrés avec nuance'),
          b('Balanced argument weighing willpower, practice and realism', 'Argumentation équilibrée entre volonté, pratique et prudence'),
          b('Accurate C1 punctuation, phrasing and tone', 'Ponctuation, syntaxe et ton C1 maîtrisés'),
        ],
        'On répète volontiers que vouloir c’est pouvoir, comme si l’enthousiasme suffisait à lever tous les obstacles. En réalité, lorsqu’on embrasse un nouveau métier, les apparences sont parfois trompeuses : le talent brut compte moins que la constance. Comme le rappelle la sagesse populaire, petit à petit l’oiseau fait son nid, et c’est en forgeant qu’on devient forgeron. Cela ne dispense pas d’oser au départ, car qui ne risque rien n’a rien, ni d’anticiper les écueils financiers : mieux vaut prévenir que guérir avant de tout quitter. Quant à savoir qui réussira dans cinq ans, qui vivra verra — mais la méthode demeure la meilleure alliée de l’audace.',
        {
          phrases: ['On répète volontiers que…', 'Comme le rappelle…', 'Cela ne dispense pas…', 'Quant à savoir…'],
          modelNote: b('Notice how each proverb is introduced or qualified (On répète volontiers que…, Comme le rappelle…) so the prose reads like an authentic C1 editorial.', 'Remarquez comment chaque proverbe est nuancé ou introduit pour préserver un style C1 élégant.'),
        },
      ),
    ],
    [
      b('Qui vivra verra = time will tell; mieux vaut prévenir que guérir = prevention beats cure.', 'Qui vivra verra = l’avenir le dira ; mieux vaut prévenir que guérir = anticiper vaut mieux que réparer.'),
      b('Aux grands maux les grands remèdes (plural maux) = drastic problems call for bold solutions.', 'Aux grands maux les grands remèdes (pluriel maux) = réponse forte face à une crise grave.'),
      b('C’est en forgeant qu’on devient forgeron = mastery through practice; qualify vouloir c’est pouvoir at C1.', 'C’est en forgeant qu’on devient forgeron = maîtrise par la pratique ; nuancer vouloir c’est pouvoir au C1.'),
    ],
    [
      ['qui vivra verra', b('time will tell, wait and see', 'seul l’avenir montrera ce qui adviendra')],
      ['aux grands maux les grands remèdes', b('desperate times call for desperate measures', 'une crise grave appelle une action énergique')],
      ['mieux vaut prévenir que guérir', b('prevention is better than cure', 'anticiper évite de réparer plus tard')],
      ['vouloir c’est pouvoir', b('where there’s a will, there’s a way', 'la volonté permet de surmonter l’obstacle')],
      ['c’est en forgeant qu’on devient forgeron', b('practice makes perfect', 'on acquiert la maîtrise en s’exerçant')],
    ],
  ),
];

export default lessons;
