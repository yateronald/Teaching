import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French hides entire stories inside numbers: dressing to the thirty-one, looking for noon at two p.m., firing four hundred shots of youthful mischief, splitting hairs in four, or seeing thirty-six candles after a shock. This B2 course unlocks fifteen figurative number and measure idioms for precision, effort, exaggeration and speed.',
    'Le français cache tout un imaginaire derrière les chiffres : se mettre sur son trente-et-un, chercher midi à quatorze heures, faire les quatre cents coups, couper les cheveux en quatre ou voir trente-six chandelles. Ce cours B2 vous fait maîtriser quinze expressions chiffrées pour parler de précision, d’efforts, d’excès et de rapidité.',
  ),
  outcomes: [
    b('Use classic number idioms for dressing up, overcomplicating, mischief and peace of mind', 'Employer les grands classiques chiffrés avec aisance et justesse'),
    b('Distinguish hair-splitting nitpicking from generous effort and extreme shifts', 'Distinguer minutie excessive, dévouement généreux et bascules extrêmes'),
    b('Express lightning speed, bluntness, shock and full commitment idiomatically', 'Exprimer rapidité, franchise directe, choc et engagement total'),
  ],
};

const C = 'exp-numbers-measures';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['classic-number-idioms', 'chiffres-classiques-et-images'],
    b('Classic numbers: from trente-et-un to quatre cents coups', 'Chiffres classiques : du trente-et-un aux quatre cents coups'),
    b('Decode five iconic number idioms used across French conversation, cinema and journalism.', 'Décoder cinq grands classiques chiffrés présents dans la conversation, le cinéma et la presse.'),
    [
      b('Talk about dressing up and sleeping soundly with se mettre sur son trente-et-un and dormir sur ses deux oreilles', 'Exprimer l’élégance et la tranquillité d’esprit'),
      b('Recognize overcomplication and tiny height with chercher midi à quatorze heures and être haut comme trois pommes', 'Reconnaître complication inutile et petite taille'),
      b('Describe wild youth or mischief with faire les quatre cents coups', 'Évoquer les bêtises ou folies de jeunesse avec faire les quatre cents coups'),
    ],
    13,
    [
      card(
        b('Five iconic number idioms', 'Cinq grands classiques chiffrés'),
        b(
          'Even in modern French, people count in apples, ears, hours and shots! **Se mettre sur son trente-et-un** means dressing in your finest clothes; **dormir sur ses deux oreilles** means resting completely carefree; **chercher midi à quatorze heures** criticizes inventing complications; **être haut comme trois pommes** affectionately describes a tiny child; and **faire les quatre cents coups** means getting up to wild mischief.\n\nStyle & calm: **se mettre sur son trente-et-un, dormir sur ses deux oreilles**.\nComplications, size & mischief: **chercher midi à quatorze heures, être haut comme trois pommes, faire les quatre cents coups**.',
          'Le français courant compte encore en pommes, en oreilles, en heures et en coups ! **Se mettre sur son trente-et-un** veut dire s’habiller très chic ; **dormir sur ses deux oreilles** exprime une sérénité totale ; **chercher midi à quatorze heures** reproche de compliquer ce qui est simple ; **être haut comme trois pommes** décrit un tout petit enfant ; et **faire les quatre cents coups** évoque les folies ou bêtises.\n\nTenue et sérénité : **se mettre sur son trente-et-un, dormir sur ses deux oreilles**.\nDétours, taille et bêtises : **chercher midi à quatorze heures, être haut comme trois pommes, faire les quatre cents coups**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['se mettre sur son trente-et-un', b('put on one’s thirty-one', 'revêtir son plus bel habit'), b('to dress up to the nines', 's’habiller avec grande élégance')],
              ['chercher midi à quatorze heures', b('look for noon at 2 p.m.', 'compliquer inutilement'), b('to overcomplicate simple things', 'chercher des problèmes où il n’y en a pas')],
              ['faire les quatre cents coups', b('fire the four hundred shots', 'multiplier les excès'), b('to raise hell, be up to mischief', 'mener une vie agitée ou faire des bêtises')],
              ['être haut comme trois pommes', b('be three apples tall', 'hauteur de trois pommes'), b('to be knee-high / tiny (of a child)', 'être tout petit (enfant)')],
              ['dormir sur ses deux oreilles', b('sleep on both ears', 'dormir à poings fermés'), b('to sleep soundly, rest easy', 'dormir tranquille sans inquiétude')],
            ],
          },
          ex: [
            ['Pour le gala d’ouverture au théâtre, tout le monde s’est mis sur son trente-et-un.', 'For the opening gala at the theatre, everyone dressed up to the nines.'],
            ['La solution est évidente : ne cherche pas midi à quatorze heures !', 'The solution is obvious: stop overcomplicating things!'],
            ['L’alarme est activée et les comptes sont bouclés : tu peux dormir sur tes deux oreilles.', 'The alarm is on and the books are closed: you can rest easy.'],
          ],
        },
      ),
      culture(
        b('Sieges, fine wool and Truffaut’s cinema', 'Sièges historiques, drap fin et cinéma de Truffaut'),
        b(
          'Why **trente-et-un**? Linguists link it either to *trentain* (a luxury woollen cloth woven with 30 × 100 threads) or to the 31st day of the month when soldiers received extra pay and dressed sharply. **Faire les quatre cents coups** recalls the 1621 siege of Montauban—400 cannon shots fired at the city—and inspired François Truffaut’s landmark 1959 film *Les Quatre Cents Coups*. Note the spelling: *quatre cents* takes **-s** on *cents* because it ends the number!\n\nWatch spelling: **quatre cents coups** (plural -s on cents) · **haut(e) comme trois pommes**.',
          'D’où vient **trente-et-un** ? Peut-être du *trentain* (un drap de laine luxueux à trente centaines de fils) ou du 31 du mois où les soldats touchaient un supplément. **Faire les quatre cents coups** évoque les 400 coups de canon tirés sur Montauban en 1621, avant d’inspirer le célèbre film de Truffaut. Attention à l’orthographe : **cents** prend un **-s** dans **quatre cents coups** !\n\nAccords : **quatre cents coups** · **haute comme trois pommes** (au féminin).',
        ),
      ),
      flash(b('Classic number idioms', 'Grands classiques chiffrés'), [
        ['se mettre sur son trente-et-un', b('to dress up to the nines', 'mettre sa plus belle tenue')],
        ['chercher midi à quatorze heures', b('to overcomplicate things', 'compliquer inutilement ce qui est simple')],
        ['faire les quatre cents coups', b('to be up to mischief, live wildly', 'faire mille bêtises ou excès')],
        ['être haut comme trois pommes', b('to be knee-high / tiny', 'être tout petit (enfant)')],
        ['dormir sur ses deux oreilles', b('to sleep soundly, rest easy', 'être parfaitement rassuré')],
      ]),
      mc(
        P.best,
        ['sur son trente-et-un', 'haut comme trois pommes', 'à quatorze heures', 'sur ses deux oreilles'],
        {
          fr: 'Pour la remise des prix à l’opéra, Paul a sorti son costume bleu nuit : il s’est vraiment mis ___.',
          explain: b('Dressing in one’s sharpest outfit for a grand occasion is se mettre sur son trente-et-un.', 'S’habiller avec beaucoup d’élégance pour une grande soirée se dit se mettre sur son trente-et-un.'),
        },
      ),
      mc(
        P.meaning,
        [
          b('She gets worked up inventing difficulties where everything is straightforward.', 'Elle complique une situation simple au lieu d’aller droit au fait.'),
          b('She regularly misses lunch because she works until 2 p.m.', 'Elle déjeune toujours tard à cause de son emploi du temps.'),
          b('She has been causing mischief since primary school.', 'Elle multiplie les bêtises depuis l’école primaire.'),
          b('She feels completely calm about the whole arrangement.', 'Elle est parfaitement rassurée par l’organisation.'),
        ],
        {
          fr: 'Le contrat est clair et avantageux : pourquoi cherches-tu midi à quatorze heures ?',
          explain: b('Chercher midi à quatorze heures criticizes hunting for unnecessary complications.', 'Chercher midi à quatorze heures reproche de chercher des complications là où il n’y en a pas.'),
        },
      ),
      pairs(P.match, [
        ['se mettre sur son trente-et-un', b('to dress up to the nines', 'porter sa tenue la plus chic')],
        ['chercher midi à quatorze heures', b('to overcomplicate matters', 'inventer des complications inutiles')],
        ['faire les quatre cents coups', b('to run wild / get up to mischief', 'multiplier bêtises et aventures')],
        ['être haut comme trois pommes', b('to be tiny / knee-high', 'être tout jeune et petit')],
        ['dormir sur ses deux oreilles', b('to rest easy, sleep worry-free', 'ne plus avoir aucune inquiétude')],
      ]),
      gap(
        P.complete,
        'Quand mon frère était haut comme trois ___, il faisait déjà les quatre ___ coups ! Aujourd’hui il est devenu très sérieux : ses parents peuvent enfin dormir sur leurs ___ oreilles.',
        [['pommes'], ['cents'], ['deux']],
        {
          choices: [
            ['pommes', 'coups', 'heures'],
            ['cents', 'cent', 'trente'],
            ['deux', 'trois', 'quatre'],
          ],
          explain: b('Watch the plural -s on quatre cents coups and possessive agreement leurs deux oreilles.', 'Attention au -s de quatre cents coups et à l’accord leurs deux oreilles.'),
        },
      ),
      hear(
        'Je me souviens de ma grand-mère quand j’étais haute comme trois pommes : même si je faisais les quatre cents coups dans le jardin, elle ne cherchait jamais midi à quatorze heures et réglait tout avec calme.',
        b('What does the speaker remember about her childhood?', 'Que raconte cette femme à propos de son enfance ?'),
        [
          b('She was tiny and mischievous, and her grandmother stayed calm and practical.', 'Elle était petite et espiègle, et sa grand-mère gardait les choses simples.'),
          b('She had to dress formally every afternoon in the garden.', 'Elle devait mettre son trente-et-un chaque après-midi au jardin.'),
          b('Her grandmother worried constantly and lost sleep over the garden.', 'Sa grand-mère perdait le sommeil à cause du jardin.'),
        ],
      ),
      dict('Ne cherche pas midi à quatorze heures : tout est prêt, dors sur tes deux oreilles.'),
      say('Ce soir, on se met sur notre trente-et-un pour fêter nos vingt ans d’amitié !', 'Tonight, we are dressing up to the nines to celebrate twenty years of friendship!'),
    ],
    [
      b('se mettre sur son trente-et-un = dress up to the nines; dormir sur ses deux oreilles = rest completely easy.', 'se mettre sur son trente-et-un = s’habiller très chic ; dormir sur ses deux oreilles = être serein.'),
      b('chercher midi à quatorze heures = overcomplicate simple things.', 'chercher midi à quatorze heures = compliquer inutilement.'),
      b('être haut comme trois pommes (agrees: haute) = tiny child; faire les quatre cents coups (with -s on cents) = mischief.', 'être haut(e) comme trois pommes = tout petit ; faire les quatre cents coups (avec -s à cents) = bêtises.'),
    ],
    [
      ['se mettre sur son trente-et-un', b('to dress up to the nines', 'porter sa plus belle tenue')],
      ['chercher midi à quatorze heures', b('to overcomplicate things', 'chercher des complications inutiles')],
      ['faire les quatre cents coups', b('to get up to wild mischief', 'multiplier bêtises et excès')],
      ['être haut comme trois pommes', b('to be knee-high / tiny', 'être tout petit (enfant)')],
      ['dormir sur ses deux oreilles', b('to rest easy, sleep soundly', 'dormir tranquille sans souci')],
    ],
  ),

  lesson(
    C,
    2,
    ['fractions-and-extremes', 'nuances-et-extremes'],
    b('Splitting hairs, bending over backwards & extremes', 'Couper en quatre, se plier en quatre et extrêmes'),
    b('Contrast nitpicking with generous devotion, weigh pros and cons and express close calls.', 'Opposer minutie excessive et dévouement généreux, peser le pour et le contre et situer les extrêmes.'),
    [
      b('Tell couper les cheveux en quatre (nitpicking) apart from se plier en quatre (going out of one’s way)', 'Distinguer couper les cheveux en quatre et se plier en quatre'),
      b('Express careful weighing and abrupt reversals with peser le pour et le contre and passer du tout au tout', 'Exprimer la délibération et les revirements extrêmes'),
      b('Use à deux doigts de + noun/infinitive for near misses', 'Exprimer ce qui a failli arriver avec à deux doigts de'),
    ],
    13,
    [
      card(
        b('Four ways to slice, bend and weigh', 'Diviser, se plier, peser et frôler'),
        b(
          'Notice how “four” flips meaning depending on the verb! **Couper les cheveux en quatre** criticizes nitpicking over microscopic details, whereas **se plier en quatre** praises going to great lengths to help. Add **peser le pour et le contre** (weighing pros and cons), **passer du tout au tout** (swinging from one extreme to another), and **à deux doigts de** (on the brink of).\n\nCareful vs excessive detail: **peser le pour et le contre, couper les cheveux en quatre**.\nDevotion, reversal & close call: **se plier en quatre, passer du tout au tout, à deux doigts de**.',
          'Observez comment le chiffre « quatre » change totalement de sens selon le verbe ! **Couper les cheveux en quatre** critique un excès de pinaillage, tandis que **se plier en quatre** loue un dévouement généreux. Complétez avec **peser le pour et le contre**, **passer du tout au tout** et **à deux doigts de**.\n\nAnalyse et excès : **peser le pour et le contre, couper les cheveux en quatre**.\nEffort, bascule et frôlement : **se plier en quatre, passer du tout au tout, à deux doigts de**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Nuanced meaning', 'Sens nuancé')],
            rows: [
              ['couper les cheveux en quatre', b('split hairs into four', 'couper un cheveu en quatre'), b('to split hairs, overanalyze tiny details', 'pinailler, ergoter sur des détails')],
              ['se plier en quatre', b('fold oneself in four', 'se démultiplier'), b('to bend over backwards to help', 'faire tout son possible pour aider')],
              ['peser le pour et le contre', b('weigh the for and against', 'comparer sur une balance'), b('to weigh the pros and cons', 'évaluer avantages et inconvénients')],
              ['passer du tout au tout', b('go from everything to everything', 'basculer à l’opposé'), b('to swing from one extreme to another', 'changer radicalement du jour au lendemain')],
              ['à deux doigts de', b('two fingers away from', 'à deux doigts du but/gouffre'), b('on the verge of, within a hair’s breadth', 'tout près de, à deux pas de')],
            ],
          },
          ex: [
            ['Arrêtons de couper les cheveux en quatre sur cette virgule : le texte est déjà clair.', 'Let’s stop splitting hairs over this comma: the text is already clear.'],
            ['Nos hôtes se sont pliés en quatre pour rendre notre séjour inoubliable.', 'Our hosts bent over backwards to make our stay unforgettable.'],
            ['Le gardien était à deux doigts d’arrêter le tir décisif à la dernière seconde.', 'The goalkeeper was within a hair’s breadth of stopping the decisive shot at the last second.'],
          ],
        },
      ),
      trap(
        b('Couper vs se plier en quatre — and past participle agreement!', 'Couper ou se plier en quatre : deux sens opposés'),
        b(
          'Learners often confuse **couper les cheveux en quatre** (negative: pedantic nitpicking) with **se plier en quatre** (positive: generous effort—often followed by **pour + infinitive**). Note also the agreement: **Elle s’est pliée en quatre pour nous recevoir** (*pliée* agrees with *elle*). And with **à deux doigts de**, use either a noun (**à deux doigts de la victoire**) or an infinitive (**à deux doigts de renoncer**).\n\nDo not mix: **couper les cheveux en quatre** (nitpick) ≠ **se plier en quatre** (help generously).',
          'Ne confondez pas **couper les cheveux en quatre** (péjoratif : pinailler inutilement) et **se plier en quatre** (élogieux : se dévouer, suivi de **pour + infinitif**). Accordez le participe : **Elle s’est pliée en quatre pour nous aider**. Après **à deux doigts de**, employez un nom (**à deux doigts de la victoire**) ou un infinitif (**à deux doigts d’abandonner**).\n\nÀ ne pas confondre : **couper les cheveux en quatre** (ergoter) ≠ **se plier en quatre** (se dévouer).',
        ),
      ),
      flash(b('Fractions & extremes', 'Proportions et extrêmes'), [
        ['couper les cheveux en quatre', b('to split hairs', 'pinailler sur des détails infimes')],
        ['se plier en quatre', b('to bend over backwards', 'faire tout son possible pour quelqu’un')],
        ['peser le pour et le contre', b('to weigh pros and cons', 'comparer avantages et risques')],
        ['passer du tout au tout', b('to swing from one extreme to the other', 'changer du tout au tout')],
        ['à deux doigts de', b('within a hair’s breadth of', 'sur le point de, tout près de')],
      ]),
      mc(
        P.best,
        ['se plie en quatre', 'coupe les cheveux en quatre', 'passe du tout au tout', 'cherche midi à quatorze heures'],
        {
          fr: 'Même pendant la haute saison, cette gérante d’hôtel ___ pour trouver une solution à chaque voyageur.',
          explain: b('Going out of one’s way generously for guests is se plier en quatre.', 'Se dévouer pour aider chaque client se dit se plier en quatre.'),
        },
      ),
      mc(
        P.meaning,
        [
          b('They nearly cancelled the concert before fixing the sound issue.', 'Ils ont failli annuler le concert juste avant de régler la panne.'),
          b('They calmly weighed the pros and cons of the venue.', 'Ils ont longuement comparé les avantages et les inconvénients de la salle.'),
          b('They argued over minor wording on the posters.', 'Ils ont ergoté sur un détail infime des affiches.'),
          b('They changed the program completely at intermission.', 'Ils ont bouleversé tout le programme à l’entracte.'),
        ],
        {
          fr: 'À cause de la panne de micro, l’équipe était à deux doigts d’annuler le concert.',
          explain: b('Être à deux doigts de + infinitive means being on the very brink of doing something.', 'Être à deux doigts de + infinitif signifie faillir faire quelque chose de justesse.'),
        },
      ),
      sort(
        b('Sort each phrase: careful analysis/nitpicking or extreme shift/devotion.', 'Classez : réflexion et détail ou effort et revirement.'),
        [
          b('Weighing & over-analyzing details', 'Peser et pinailler sur les détails'),
          b('Effort, abrupt shifts & close calls', 'Dévouement, bascules et frôlements'),
        ],
        [
          ['couper les cheveux en quatre', 0],
          ['se plier en quatre', 1],
          ['peser le pour et le contre', 0],
          ['passer du tout au tout', 1],
          ['à deux doigts de', 1],
          ['examiner chaque détail à la loupe', 0],
        ],
      ),
      gap(
        P.complete,
        'Avant de signer ce bail, j’ai longuement ___ le pour et le contre sans couper les ___ en quatre. Quand la propriétaire a vu mon hésitation, elle est passée du ___ au tout et m’a proposé un accord souple.',
        [['pesé'], ['cheveux'], ['tout']],
        {
          choices: [
            ['pesé', 'plié', 'coupé'],
            ['cheveux', 'doigts', 'pommes'],
            ['tout', 'noir', 'rien'],
          ],
          explain: b('Combine peser le pour et le contre, couper les cheveux en quatre, and passer du tout au tout.', 'On emploie peser le pour et le contre, couper les cheveux en quatre et passer du tout au tout.'),
        },
      ),
      ord(
        P.order,
        'Nous étions à deux doigts de manquer ce train.',
        {
          tr: 'We were within a hair’s breadth of missing that train.',
          extra: ['quatre', 'cheveux'],
          explain: b('Être à deux doigts de precedes the infinitive manquer.', 'Être à deux doigts de s’enchaîne directement avec l’infinitif manquer.'),
        },
      ),
      hear(
        'Le directeur passait du tout au tout d’une réunion à l’autre, mais son adjointe se pliait en quatre pour apaiser les tensions sans couper les cheveux en quatre.',
        b('How did the deputy manager behave?', 'Comment s’est comportée l’adjointe ?'),
        [
          b('She worked generously to calm tensions and avoided petty nitpicking.', 'Elle a fait de grands efforts pour apaiser l’équipe sans pinailler.'),
          b('She flipped moods constantly from morning to evening.', 'Elle changeait constamment d’avis du matin au soir.'),
          b('She insisted on debating every minor paragraph.', 'Elle insistait pour ergoter sur chaque virgule.'),
        ],
        { voice: 'f2' },
      ),
      say('Pesons calmement le pour et le contre sans couper les cheveux en quatre.', 'Let’s calmly weigh the pros and cons without splitting hairs.'),
    ],
    [
      b('couper les cheveux en quatre = nitpick; se plier en quatre (pour) = bend over backwards to help.', 'couper les cheveux en quatre = pinailler ; se plier en quatre (pour) = se dévouer.'),
      b('peser le pour et le contre = weigh pros and cons; passer du tout au tout = swing from one extreme to the other.', 'peser le pour et le contre = comparer ; passer du tout au tout = basculer à l’extrême opposé.'),
      b('à deux doigts de + noun/infinitive = on the very brink of.', 'à deux doigts de + nom/infinitif = tout près de, sur le point de.'),
    ],
    [
      ['couper les cheveux en quatre', b('to split hairs', 'pinailler sur des détails')],
      ['se plier en quatre', b('to bend over backwards', 'faire tout son possible pour aider')],
      ['peser le pour et le contre', b('to weigh the pros and cons', 'évaluer avantages et inconvénients')],
      ['passer du tout au tout', b('to go from one extreme to the other', 'changer radicalement d’attitude')],
      ['à deux doigts de', b('on the verge of', 'tout près de, sur le point de')],
    ],
  ),

  lesson(
    C,
    3,
    ['precision-and-exaggeration', 'vitesse-et-exageration'],
    b('Speed, bluntness & “thirty-six candles”', 'Vitesse, franchise directe et « trente-six chandelles »'),
    b('Describe lightning-fast action, getting straight to the point, dizzying shocks and 100% commitment.', 'Décrire la rapidité, la franchise directe, les chocs étourdissants et l’adhésion totale.'),
    [
      b('Express speed and blazing starts with en deux temps trois mouvements and sur les chapeaux de roues', 'Exprimer rapidité et démarrage vif'),
      b('Speak bluntly without detours using ne pas y aller par quatre chemins', 'Aller droit au but avec ne pas y aller par quatre chemins'),
      b('Use voir trente-six chandelles and cent pour cent naturally', 'Employer voir trente-six chandelles et cent pour cent avec justesse'),
    ],
    13,
    [
      card(
        b('Speed, directness and exaggerated numbers', 'Rapidité, franchise et exagération'),
        b(
          'Number idioms also measure tempo, impact and certainty. Do something **en deux temps trois mouvements** (in a flash) or start **sur les chapeaux de roues** (at breakneck speed—like hubcaps scraping in a sharp turn!). Speak bluntly without detours with **ne pas y aller par quatre chemins**, describe seeing stars after a bump or shock with **voir trente-six chandelles**, and back an idea **à cent pour cent**.\n\nTempo & speed: **en deux temps trois mouvements, sur les chapeaux de roues**.\nBluntness, shock & total backing: **ne pas y aller par quatre chemins, voir trente-six chandelles, cent pour cent**.',
          'Les nombres servent aussi à mesurer le rythme, le choc et la certitude. On règle une affaire **en deux temps trois mouvements** et on démarre **sur les chapeaux de roues**. On parle sans détour quand on **n’y va pas par quatre chemins**, on **voit trente-six chandelles** après un choc, et on adhère à **cent pour cent**.\n\nTempo et vitesse : **en deux temps trois mouvements, sur les chapeaux de roues**.\nFranchise, choc et adhésion : **ne pas y aller par quatre chemins, voir trente-six chandelles, cent pour cent**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal image', 'Image littérale'), b('Meaning', 'Sens')],
            rows: [
              ['en deux temps trois mouvements', b('in two beats three moves', 'manœuvre militaire rapide'), b('in no time flat, in a flash', 'très vite, sans difficulté')],
              ['voir trente-six chandelles', b('to see 36 candles', 'étincelles après un coup'), b('to see stars (from a blow or shock)', 'être étourdi après un choc')],
              ['ne pas y aller par quatre chemins', b('not go via four roads', 'aller tout droit sans détour'), b('to not beat around the bush, be blunt', 'parler ou agir directement')],
              ['sur les chapeaux de roues', b('on the wheel hubcaps', 'virage pris à toute vitesse'), b('at breakneck speed, flying start', 'à toute allure, avec un départ vif')],
              ['cent pour cent', b('one hundred percent', 'à 100 %'), b('totally, completely, one hundred percent', 'entièrement, sans réserve')],
            ],
          },
          ex: [
            ['Le technicien a réparé la panne en deux temps trois mouvements.', 'The technician fixed the breakdown in no time flat.'],
            ['En entrant dans la poutre basse du grenier, il a vu trente-six chandelles !', 'When he walked into the low attic beam, he saw stars!'],
            ['L’inspectrice n’y est pas allée par quatre chemins : elle a exigé des corrections immédiates.', 'The inspector didn’t beat around the bush: she demanded immediate corrections.'],
          ],
        },
      ),
      tip(
        b('Watch fixed prepositions and missing “et”!', 'Attention aux prépositions figées et aux mots à ne pas ajouter'),
        b(
          'Keep the phrasing exact: say **en deux temps trois mouvements** (never add *et* between *temps* and *trois*!), keep **y** inside **ne pas y aller par quatre chemins** (*Il n’y va pas par quatre chemins*), and pair **cent pour cent** with **à** when modifying a verb or adjective (**Je suis d’accord à cent pour cent**, **un projet réussi à cent pour cent**). With **sur les chapeaux de roues**, common verbs are *démarrer*, *partir* and *arriver*.\n\nKeep exact: **en deux temps trois mouvements** (no *et*) · **n’y va pas par quatre chemins** (keep *y*).',
          'Respectez les tournures exactes : dites **en deux temps trois mouvements** (n’ajoutez jamais *et* entre *temps* et *trois* !), gardez toujours **y** dans **ne pas y aller par quatre chemins** (*Il n’y va pas par quatre chemins*), et ajoutez **à** devant **cent pour cent** après un verbe ou un adjectif (**Je suis d’accord à cent pour cent**). **Sur les chapeaux de roues** s’emploie surtout avec *démarrer, partir, arriver*.\n\nFormes exactes : **en deux temps trois mouvements** · **n’y va pas par quatre chemins**.',
        ),
      ),
      mc(
        P.best,
        ['en deux temps trois mouvements', 'à deux doigts', 'par quatre chemins', 'sur son trente-et-un'],
        {
          fr: 'Cette serrurière connaît son métier sur le bout des doigts : elle a ouvert la porte bloquée ___ !',
          explain: b('Doing something briskly and effortlessly in no time is en deux temps trois mouvements.', 'Régler un problème avec rapidité et aisance se dit en deux temps trois mouvements.'),
        },
      ),
      pairs(P.match, [
        ['en deux temps trois mouvements', b('in a flash, in no time', 'très rapidement et facilement')],
        ['voir trente-six chandelles', b('to see stars after a blow', 'être étourdi par un choc')],
        ['ne pas y aller par quatre chemins', b('to be brutally direct', 'aller droit au but sans détour')],
        ['sur les chapeaux de roues', b('at breakneck speed / flying start', 'à toute vitesse, dès le départ')],
        ['cent pour cent', b('one hundred percent / totally', 'totalement, sans la moindre réserve')],
      ]),
      hear(
        'La réunion a démarré sur les chapeaux de roues : la nouvelle directrice n’y est pas allée par quatre chemins, et tout le conseil l’a soutenue à cent pour cent.',
        b('How did the meeting go?', 'Comment la réunion s’est-elle déroulée ?'),
        [
          b('It started fast and briskly, the director spoke plainly, and the board backed her completely.', 'Elle a démarré très vite, la directrice a parlé sans détour et le conseil l’a approuvée totalement.'),
          b('It dragged on for hours while the director hesitated over minor details.', 'Elle a traîné pendant des heures faute de décisions claires.'),
          b('The board rejected her proposal because it moved too quickly.', 'Le conseil a refusé sa proposition jugée trop hâtive.'),
        ],
        { voice: 'm2' },
      ),
      dlg(
        b('Launching the festival on a tight clock', 'Lancer le festival sur les chapeaux de roues'),
        b('Nadia checks in with her colleague Rémi as the stage setup races against the clock.', 'Nadia fait le point avec son collègue Rémi pendant le montage express de la scène.'),
        [['Nadia', 'f'], ['Rémi', 'm']],
        [
          [0, 'Rémi, le camion sono vient enfin d’arriver : la journée démarre sur les chapeaux de roues !', 'Rémi, the sound truck just arrived at last: the day is off to a flying start!'],
          [1, {
            options: [
              'Tant mieux ! Avec notre équipe technique, on va installer les micros en deux temps trois mouvements.',
              'Tant mieux ! On va couper les cheveux en quatre jusqu’à demain matin.',
              'Non, dormons sur nos deux oreilles pendant que la salle se remplit.',
            ],
            explain: b('En deux temps trois mouvements fits a skilled crew setting up fast.', 'En deux temps trois mouvements exprime une installation rapide et efficace.'),
          }],
          [0, 'Attention à l’arche en bois près des coulisses : tout à l’heure, j’ai heurté le montant et j’ai vu trente-six chandelles !', 'Watch out for the wooden arch near backstage: earlier I bumped the frame and saw stars!'],
          [1, {
            options: [
              'Aïe ! Je n’y vais pas par quatre chemins : je pose tout de suite un ruban fluo dessus pour que tu sois rassurée à cent pour cent.',
              'Aïe ! Tu cherches midi à quatorze heures avec cette arche en bois.',
              'Aïe ! Je vais me mettre sur mon trente-et-un pour réparer la poutre.',
            ],
            explain: b('N’y vais pas par quatre chemins (decisive, direct action) and à cent pour cent (total reassurance) match naturally.', 'Ne pas y aller par quatre chemins et à cent pour cent conviennent parfaitement ici.'),
          }],
          [0, 'Merci Rémi, c’est exactement ce qu’il fallait !', 'Thanks Rémi, that’s just what we needed!'],
        ],
      ),
      dict('La semaine a démarré sur les chapeaux de roues et il n’y est pas allé par quatre chemins.'),
      write(
        b('High speed & direct talk', 'À toute allure et sans détour'),
        b('Write 60–110 words recounting a busy launch, urgent repair or decisive conversation where things moved quickly and someone spoke plainly. Use at least four number idioms from this course (such as sur les chapeaux de roues, en deux temps trois mouvements, ne pas y aller par quatre chemins, à deux doigts de, peser le pour et le contre or cent pour cent).', 'Racontez en 60 à 110 mots un lancement intense, une réparation urgente ou une discussion décisive où tout est allé vite et sans détour. Utilisez au moins quatre expressions chiffrées de ce cours (comme sur les chapeaux de roues, en deux temps trois mouvements, ne pas y aller par quatre chemins, à deux doigts de, peser le pour et le contre ou cent pour cent).'),
        60,
        110,
        [
          b('Coherent B2 anecdote with brisk pacing', 'Anecdote B2 cohérente au rythme soutenu'),
          b('At least four number/measure idioms used accurately', 'Au moins quatre expressions chiffrées employées avec justesse'),
          b('Exact idiomatic syntax (e.g. n’y va pas par quatre chemins, en deux temps trois mouvements)', 'Syntaxe figée respectée (ex. n’y va pas par quatre chemins, en deux temps trois mouvements)'),
        ],
        'Lundi matin, le projet a démarré sur les chapeaux de roues. Face à une panne informatique majeure, nous étions à deux doigts de reporter la présentation. Heureusement, la responsable technique n’y est pas allée par quatre chemins : sans couper les cheveux en quatre, elle a réparti les tâches et relancé le serveur en deux temps trois mouvements. Rassuré à cent pour cent, tout le groupe a présenté le bilan avec succès avant midi.',
        { phrases: ['… a démarré sur les chapeaux de roues', '… à deux doigts de…', '… n’y est pas allé(e) par quatre chemins', '… en deux temps trois mouvements'] },
      ),
    ],
    [
      b('en deux temps trois mouvements = in a flash (no “et”); sur les chapeaux de roues = at full speed / flying start.', 'en deux temps trois mouvements = très vite (sans « et ») ; sur les chapeaux de roues = à toute allure.'),
      b('ne pas y aller par quatre chemins (keep y!) = speak directly without detours.', 'ne pas y aller par quatre chemins (gardez y !) = parler sans détour.'),
      b('voir trente-six chandelles = see stars after a shock; à cent pour cent = totally, completely.', 'voir trente-six chandelles = être étourdi par un choc ; à cent pour cent = totalement.'),
    ],
    [
      ['en deux temps trois mouvements', b('in no time flat, in a flash', 'très rapidement et avec aisance')],
      ['voir trente-six chandelles', b('to see stars (from a shock)', 'être étourdi après un coup')],
      ['ne pas y aller par quatre chemins', b('to not beat around the bush', 'parler ou agir directement')],
      ['sur les chapeaux de roues', b('at breakneck speed', 'à toute allure, avec entrain')],
      ['cent pour cent', b('one hundred percent, totally', 'entièrement, sans réserve')],
    ],
  ),
];

export default lessons;
