import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ce qui m’étonne, ce que tu veux, ce dont j’ai besoin, ce à quoi je pense. Whenever French expresses "what" or "that which" without a specific noun before it, you choose among ce qui, ce que, ce dont and ce à quoi depending on the verb’s grammar. This B1 course makes each choice automatic and teaches you how to highlight ideas cleanly with C’est… qui/que and Ce qui…, c’est…',
    'Ce qui m’étonne, ce que tu veux, ce dont j’ai besoin, ce à quoi je pense. Quand le français exprime « ce qui/que… » sans nom antécédent, le choix dépend directement du verbe qui suit. Ce cours de niveau B1 rend chaque structure évidente et enseigne la mise en relief avec C’est… qui/que et Ce qui…, c’est…',
  ),
  outcomes: [
    b('Choose accurately between ce qui (subject) and ce que (direct object)', 'Choisir avec sûreté entre ce qui (sujet) et ce que (COD)'),
    b('Use ce dont after verbs and adjectives built with de without ever repeating de or en', 'Employer ce dont après de sans jamais répéter de ni en'),
    b('Build ce à quoi, ce sur quoi, ce avec quoi and ce pour quoi for prepositional verbs', 'Construire ce à quoi, ce sur quoi, ce avec quoi et ce pour quoi'),
    b('Emphasize ideas naturally using C’est … qui/que and Ce qui / Ce que / Ce dont …, c’est …', 'Mettre une idée en relief avec C’est … qui/que et Ce qui / Ce que / Ce dont …, c’est …'),
  ],
};

const C = 'gr-ce-qui-ce-que-ce-dont';

const lessons: Lesson[] = [
  lesson(C, 1, ['ce-qui-vs-ce-que', 'ce-qui-ou-ce-que'],
    b('Ce qui vs ce que: saying "what" in statements', 'Ce qui contre ce que : exprimer « what » dans une phrase'),
    b('Know when "what" is the subject (ce qui) or the direct object (ce que / ce qu’)—and when not to add ce.', 'Savoir quand choisir ce qui (sujet) ou ce que / ce qu’ (COD) — et quand ne pas ajouter ce.'),
    [
      b('Use ce qui when "what" acts as subject of the following verb (never ce qu’)', 'Employer ce qui quand le pronom est sujet du verbe suivant (jamais élidé)'),
      b('Use ce que / ce qu’ when a subject + verb follows (direct object)', 'Employer ce que / ce qu’ quand un sujet + verbe suit (COD)'),
      b('Contrast ce qui/ce que (no noun before) with qui/que (noun before)', 'Distinguer ce qui/ce que (sans nom devant) de qui/que (après un nom)'),
    ],
    13,
    [
      card(
        b('No noun before "what" → ce qui or ce que', 'Sans nom avant : ce qui (sujet) ou ce que (COD)'),
        b(
          'In a statement like *"I don’t know what happened"* or *"Tell me what you want"*, there is **no noun** before *"what"*, so French puts **ce** in front of **qui** or **que**! Look right after the blank: if a **verb** (or object pronoun + verb like `m’étonne`, `se passe`) follows immediately, choose **ce qui**. If a **new subject + verb** follows, choose **ce que** (or **ce qu’** before a vowel or silent h).\n\nCe qui (subject): **ce qui arrive, ce qui compte, ce qui m’étonne, ce qui se passe**.\nCe que (object): **ce que je veux, ce que tu dis, ce qu’il fait, ce qu’elle aime**.',
          'Dans une phrase déclarative (*« Je ne sais pas ce qui s’est passé »*, *« Dis-moi ce que tu veux »*), il n’y a **aucun nom** avant le pronom : on ajoute donc **ce** devant **qui** ou **que** ! Regardez juste après : s’il y a tout de suite un **verbe** (ou un pronom objet + verbe comme `m’étonne`, `se passe`), choisissez **ce qui**. S’il y a un **nouveau sujet + verbe**, choisissez **ce que** (ou **ce qu’** devant voyelle ou h muet).\n\nCe qui (sujet) : **ce qui arrive, ce qui compte, ce qui m’étonne, ce qui se passe**.\nCe que (COD) : **ce que je veux, ce que tu dis, ce qu’il fait, ce qu’elle aime**.',
        ),
        {
          table: {
            head: [b('Form', 'Forme'), b('Role in the clause', 'Fonction'), b('What follows', 'Ce qui suit'), b('Example', 'Exemple')],
            rows: [
              ['ce qui', b('Subject', 'Sujet'), b('verb (or me/te/se + verb)', 'verbe (ou pronom + verbe)'), 'Dis-moi ce qui te plaît.'],
              ['ce que / ce qu’', b('Direct object (COD)', 'COD'), b('subject + verb', 'sujet + verbe'), 'Prends ce que tu préfères.'],
              ['tout ce qui / tout ce que', b('everything that', 'tout ce…'), b('same rule after tout', 'même règle après tout'), 'J’ai compris tout ce qu’il a dit.'],
            ],
          },
          ex: [
            ['Je n’ai pas bien compris ce qui s’est passé pendant la réunion.', 'I didn’t quite understand what happened during the meeting.'],
            ['Tu peux choisir tout ce que tu veux sur la carte.', 'You can choose whatever you want on the menu.'],
          ],
        },
      ),
      trap(
        b('Two quick traps: never ce qu’arrive, and don’t add ce after a noun!', 'Deux pièges : jamais ce qu’arrive, et pas de ce après un nom !'),
        b(
          'First, **qui** NEVER drops its **-i** before a vowel: always write **ce qui arrive**, **ce qui est vrai**, **ce qui existe** (only `que` elides to **ce qu’il**, **ce qu’on**!). Second, only add **ce** when there is **no noun** in front; if a noun appears, use plain **qui** or **que**: « Voici le livre **que** je lis » (NOT « le livre ce que »).\n\nNo elision on qui: **ce qui arrive, ce qui existe, ce qui est utile**.\nWith a noun (no ce!): **le film que j’aime, l’idée qui marche, les amis qui viennent**.',
          'D’abord, **qui** ne s’élide JAMAIS : écrivez toujours **ce qui arrive**, **ce qui est vrai**, **ce qui existe** (seul `que` devient **ce qu’** devant voyelle : **ce qu’il dit**). Ensuite, n’ajoutez **ce** que s’il n’y a **pas de nom** avant : après un nom, utilisez simplement **qui** ou **que** (« Voici le livre **que** je lis », jamais « le livre ce que »).\n\nPas d’élision pour qui : **ce qui arrive, ce qui existe, ce qui est utile**.\nAprès un nom (sans ce) : **le film que j’aime, l’idée qui marche, les amis qui viennent**.',
        ),
      ),
      mc(P.form, ['ce qui', 'ce que', 'ce qu’', 'qui'], {
        fr: 'Personne ne comprend vraiment ___ est arrivé dans ce dossier.',
        explain: b('Est arrivé is a verb with no separate subject, and qui never elides → ce qui.', 'Le pronom est sujet de est arrivé et qui ne s’élide jamais → ce qui.'),
      }),
      mc(P.form, ['ce qu’elle', 'ce qui elle', 'qu’elle', 'ce que elle'], {
        fr: 'Écoute attentivement ___ propose avant de refuser.',
      }),
      gap(P.complete, 'Fais ___ (ce qui / ce que) te semble juste, mais n’oublie pas tout ___ (ce que / ce qu’) on a prévu. Et le gâteau ___ (que / ce que) tu as préparé sent délicieusement bon !', [['ce qui'], ['ce qu’'], ['que']], {
        choices: [['ce qui', 'ce que'], ['ce qu’', 'ce qui'], ['que', 'ce que']],
      }),
      ord(P.order, 'Je ne sais pas encore ce qui va se passer demain.', {
        tr: 'I don’t know yet what is going to happen tomorrow.',
        extra: ['ce que', 'qu’'],
      }),
      sort(
        b('Do you need ce qui, ce que / ce qu’, or plain qui / que?', 'Faut-il ce qui, ce que / ce qu’ ou simplement qui / que ?'),
        [b('ce qui (subject, no noun)', 'ce qui (sujet, sans nom)'), b('ce que / ce qu’ (object, no noun)', 'ce que / ce qu’ (COD, sans nom)'), b('qui / que (after a noun)', 'qui / que (après un nom)')],
        [['Je ne sais pas ___ est vrai.', 0], ['Dis-moi ___ il a acheté.', 1], ['Voici la veste ___ me plaît.', 2], ['Tout ___ brille n’est pas or.', 0], ['Le film ___ nous avons vu était drôle.', 2], ['Écris tout ___ tu penses.', 1]],
      ),
      hear('Ce qui m’inquiète un peu, ce n’est pas le trajet, c’est ce qu’ils ont annoncé pour la météo de dimanche.', b('What worries the speaker?', 'Qu’est-ce qui inquiète la personne ?'), [
        b('What the weather forecast announced for Sunday', 'Ce que la météo a annoncé pour dimanche'),
        b('How long the journey will take', 'La durée du trajet en voiture'),
        b('Having to travel alone on Sunday', 'Le fait de voyager seule dimanche'),
      ]),
      dict('Elle note tout ce qui est important et tout ce que le professeur explique au tableau.'),
      say('Dis-moi ce qui t’a surpris et ce que tu aimerais changer.', 'Tell me what surprised you and what you would like to change.'),
    ],
    [
      b('No noun antecedent: ce qui (subject, before verb/pronoun+verb) vs ce que / ce qu’ (COD, before subject+verb).', 'Sans nom antécédent : ce qui (sujet) contre ce que / ce qu’ (COD).'),
      b('qui NEVER elides: always ce qui arrive / ce qui est (never ce qu’arrive).', 'qui ne s’élide jamais : toujours ce qui arrive / ce qui est.'),
      b('After a noun, drop ce and use plain qui / que: le livre que je lis.', 'Après un nom, pas de ce : utilisez simplement qui ou que (le livre que je lis).'),
    ],
    [
      ['un antécédent', b('an antecedent noun', 'le nom repris par un pronom')],
      ['se passer', b('to happen, take place', 'avoir lieu, se produire')],
      ['briller', b('to shine, glitter', 'émettre de l’éclat')],
    ],
  ),

  lesson(C, 2, ['ce-dont-verbs-with-de', 'ce-dont-verbes-avec-de'],
    b('Ce dont: replacing de + what', 'Ce dont : reprendre « de + quelque chose »'),
    b('Use ce dont whenever the verb or adjective after "what" requires de—and never double the de or en.', 'Employer ce dont dès que le verbe ou l’adjectif se construit avec de — sans jamais répéter de ni en.'),
    [
      b('Spot verbs and adjectives taking de (avoir besoin de, parler de, être fier de) and choose ce dont', 'Repérer les verbes et adjectifs avec de pour choisir ce dont'),
      b('Use tout ce dont naturally (Tout ce dont j’ai besoin)', 'Employer tout ce dont avec naturel'),
      b('Never repeat de or en inside a ce dont clause', 'Ne jamais rajouter de ni en dans la proposition avec ce dont'),
    ],
    13,
    [
      card(
        b('Verb or adjective takes de → ce dont', 'Verbe ou adjectif construit avec de → ce dont'),
        b(
          'Whenever the verb or expression in the relative clause takes **de**, you cannot use `ce qui` or `ce que`—you MUST use **ce dont** (literally *"that of which"* / *"what … about/of"*). Check the verb at the end of the phrase: if it comes from `avoir besoin de`, `parler de`, `rêver de` or `être fier de`, pick **ce dont**!\n\nVerbs with de: **avoir besoin de, parler de, rêver de, se souvenir de**.\nMore de-verbs: **avoir envie de, avoir peur de, s’occuper de, manquer de**.\nAdjectives with de: **être fier de, être sûr de, être content de, être responsable de**.',
          'Dès que le verbe ou l’adjectif qui suit se construit avec **de**, on ne peut utiliser ni `ce qui` ni `ce que` : il faut obligatoirement **ce dont** ! Vérifiez le verbe final : s’il vient d’`avoir besoin de`, `parler de`, `rêver de` ou `être fier de`, employez **ce dont** !\n\nVerbes avec de : **avoir besoin de, parler de, rêver de, se souvenir de**.\nAutres verbes en de : **avoir envie de, avoir peur de, s’occuper de, manquer de**.\nAdjectifs avec de : **être fier de, être sûr de, être content de, être responsable de**.',
        ),
        {
          table: {
            head: [b('Underlying verb/adj', 'Construction d’origine'), b('With ce dont', 'Avec ce dont'), b('Why not ce que?', 'Pourquoi pas ce que ?')],
            rows: [
              ['avoir besoin de qqch', 'Voici ce dont j’ai besoin.', b('besoin DE → dont', 'avoir besoin DE → dont')],
              ['parler de qqch', 'Je sais ce dont il parle.', b('parler DE → dont', 'parler DE → dont')],
              ['se souvenir de qqch', 'Dis-moi ce dont tu te souviens.', b('se souvenir DE → dont', 'se souvenir DE → dont')],
              ['être fier de qqch', 'Ce dont je suis fier, c’est mon équipe.', b('être fier DE → dont', 'être fier DE → dont')],
              ['avoir envie de qqch', 'Achète tout ce dont tu as envie.', b('avoir envie DE → dont', 'avoir envie DE → dont')],
            ],
          },
          ex: [
            ['C’est exactement ce dont nous avions besoin pour finir ce meuble.', 'That is exactly what we needed to finish this piece of furniture.'],
            ['Je ne me souviens plus de tout ce dont ils ont parlé hier.', 'I don’t remember everything they talked about yesterday anymore.'],
          ],
        },
      ),
      trap(
        b('Never repeat de or en inside ce dont!', 'Ne répétez jamais de ni en avec ce dont !'),
        b(
          'Because **dont** already contains **de**, adding **en** or a leftover **de** is a double mistake! Say **Voici ce dont j’ai besoin**—NEVER « Voici ce dont j’**en** ai besoin » or « Voici ce que j’ai besoin **de** ». Notice also that **ce dont** never elides (`ce dont il parle`, `ce dont elle rêve`).\n\nClean ce dont: **ce dont j’ai envie, ce dont il s’occupe, ce dont elle est sûre**.\nNo extra en/de: **tout ce dont on manque, ce dont vous rêvez, ce dont tu te souviens**.',
          'Comme **dont** contient déjà l’idée de **de**, n’ajoutez JAMAIS **en** ni **de** à la fin ! Dites **Voici ce dont j’ai besoin** — jamais « ce dont j’**en** ai besoin » ni « ce que j’ai besoin **de** ». Notez aussi que **dont** ne s’élide jamais (`ce dont il parle`).\n\nFormes justes : **ce dont j’ai envie, ce dont il s’occupe, ce dont elle est sûre**.\nSans en ni de : **tout ce dont on manque, ce dont vous rêvez, ce dont tu te souviens**.',
        ),
      ),
      mc(P.form, ['ce dont', 'ce que', 'ce qui', 'ce dont en'], {
        fr: 'Voici exactement ___ j’avais besoin pour réparer la fenêtre.',
      }),
      mc(P.form, ['ce dont', 'ce que', 'ce qu’', 'ce qui'], {
        fr: 'Je n’ai pas tout compris : tu peux me répéter ___ tu te souviens ?',
      }),
      gap(P.complete, 'Fais la liste de tout ___ (ce que / ce dont) nous manquons pour le voyage. C’est drôle : tout ___ (ce qui / ce dont) l’inquiète aujourd’hui est exactement ___ (ce que / ce dont) elle rêvait l’an dernier !', [['ce dont'], ['ce qui'], ['ce dont']], {
        choices: [['ce dont', 'ce que'], ['ce qui', 'ce dont'], ['ce dont', 'ce que']],
      }),
      ord(P.order, 'Je connais très bien ce dont elle est capable.', {
        tr: 'I know very well what she is capable of.',
        extra: ['en', 'de'],
      }),
      pairs(
        b('Match each verb/adjective expression with the natural ce dont clause.', 'Associez chaque verbe ou adjectif à sa suite avec ce dont.'),
        [
          ['avoir peur de', 'Voilà ce dont il a toujours eu peur.'],
          ['être sûr de', 'Dis-moi ce dont tu es vraiment sûr.'],
          ['s’occuper de', 'Elle gère tout ce dont personne ne veut s’occuper.'],
          ['avoir envie de', 'Prends tout ce dont tu as envie !'],
        ],
        true,
      ),
      hear('Ce dont je suis le plus fière dans ce projet, ce n’est pas la note finale, c’est la façon dont tout le groupe s’est entraidé.', b('What is the speaker proudest of?', 'De quoi la personne est-elle la plus fière ?'), [
        b('How the whole group helped one another', 'La manière dont tout le groupe s’est entraidé'),
        b('The final grade they got on the project', 'La note finale obtenue pour le projet'),
        b('Finishing the entire project completely alone', 'D’avoir terminé le projet toute seule'),
      ]),
      dict('Voici tout ce dont nous avons besoin pour cuisiner, et ce dont j’ai envie pour le dessert.'),
      say('Tu te souviens de ce dont nous avons parlé mardi dernier ?', 'Do you remember what we talked about last Tuesday?'),
    ],
    [
      b('Whenever the verb or adjective requires de, "what" becomes ce dont.', 'Dès que le verbe ou l’adjectif se construit avec de, « ce… » devient ce dont.'),
      b('Key triggers: avoir besoin de, parler de, rêver de, se souvenir de, manquer de, être fier/sûr de.', 'Déclencheurs clés : avoir besoin de, parler de, rêver de, se souvenir de, manquer de, être fier/sûr de.'),
      b('Never add en or a trailing de inside a ce dont clause.', 'N’ajoutez jamais en ni de en trop dans une proposition avec ce dont.'),
    ],
    [
      ['s’entraider', b('to help one another', 's’aider mutuellement')],
      ['être capable de', b('to be capable of', 'avoir la capacité de')],
      ['manquer de', b('to lack, be short of', 'ne pas avoir assez de')],
    ],
  ),

  lesson(C, 3, ['ce-a-quoi-prepositions', 'ce-a-quoi-prepositions'],
    b('Ce à quoi, ce sur quoi, ce avec quoi, ce pour quoi', 'Ce à quoi, ce sur quoi, ce avec quoi, ce pour quoi'),
    b('Handle prepositions other than de—like penser à, travailler sur, compter sur—using ce + preposition + quoi.', 'Maîtriser les autres prépositions après ce (à, sur, avec, pour) grâce au pronom quoi.'),
    [
      b('Build ce à quoi after verbs with à (penser à, s’attendre à, s’intéresser à, tenir à)', 'Construire ce à quoi après penser à, s’attendre à, s’intéresser à, tenir à'),
      b('Use ce sur quoi, ce avec quoi, ce pour quoi for things and ideas', 'Employer ce sur quoi, ce avec quoi, ce pour quoi pour les choses et idées'),
      b('Contrast ce + prep + quoi (things) with prep + qui (people)', 'Distinguer ce + prép. + quoi (choses) de prép. + qui (personnes)'),
    ],
    13,
    [
      card(
        b('Preposition other than de (à, sur, avec, pour…) → ce + prep + quoi', 'Autre préposition que de → ce + préposition + quoi'),
        b(
          'What if the verb needs **à** (`penser à, s’attendre à, s’intéresser à, faire attention à, tenir à`), **sur** (`travailler sur, compter sur`), **avec** (`écrire avec`), or **pour** (`se battre pour`)? Because French cannot dangle a preposition at the end of a sentence like English (*"what I’m thinking about"*), put **ce + preposition + quoi** in front!\n\nWith à: **ce à quoi je pense, ce à quoi je m’attends, ce à quoi elle tient**.\nWith sur / pour / avec: **ce sur quoi nous travaillons, ce pour quoi il lutte, ce avec quoi j’écris**.\nWith sans / contre: **ce sans quoi rien ne marche, ce contre quoi on agit**.',
          'Quand le verbe demande **à** (`penser à, s’attendre à, s’intéresser à, faire attention à, tenir à`), **sur** (`travailler sur, compter sur`), **avec** ou **pour**, le français ne laisse jamais la préposition à la fin de la phrase : on place **ce + préposition + quoi** devant !\n\nAvec à : **ce à quoi je pense, ce à quoi je m’attends, ce à quoi elle tient**.\nAvec sur / pour / avec : **ce sur quoi nous travaillons, ce pour quoi il lutte, ce avec quoi j’écris**.\nAvec sans / contre : **ce sans quoi rien ne marche, ce contre quoi on agit**.',
        ),
        {
          table: {
            head: [b('Verb + preposition', 'Verbe + préposition'), b('Relative for "what"', 'Relatif pour « ce… »'), b('Example', 'Exemple')],
            rows: [
              ['penser à / s’attendre à', 'ce à quoi', 'Ce n’est pas ce à quoi je m’attendais.'],
              ['travailler sur / compter sur', 'ce sur quoi', 'Voici ce sur quoi l’équipe travaille.'],
              ['écrire avec / cuisiner avec', 'ce avec quoi', 'Regarde ce avec quoi j’ai réparé la chaise.'],
              ['voter pour / se battre pour', 'ce pour quoi', 'C’est exactement ce pour quoi nous agissons.'],
            ],
          },
          ex: [
            ['Dis-moi exactement ce à quoi tu penses depuis dix minutes.', 'Tell me exactly what you’ve been thinking about for the last ten minutes.'],
            ['L’écoute est ce sans quoi aucun dialogue ne fonctionne.', 'Listening is what no dialogue works without.'],
          ],
        },
      ),
      trap(
        b('Quoi is for things — NEVER for people!', 'Quoi sert aux choses — JAMAIS aux personnes !'),
        b(
          'Use **ce + preposition + quoi** ONLY when referring to a **thing, idea or situation** (`ce à quoi je m’intéresse` = *what I’m interested in*). If there is a **person** after a preposition, use **qui** (`la personne à qui je pense`, `l’ami avec qui je travaille`), NEVER `quoi`! And compare all four forms side by side: subject → **ce qui**, direct object → **ce que**, `de` → **ce dont**, other preposition → **ce + prep + quoi**.\n\nThing / idea: **ce à quoi je tiens, ce sur quoi je compte, ce pour quoi je viens**.\nPerson (use qui!): **la collègue à qui je parle, l’ami sur qui je compte**.',
          'Utilisez **ce + préposition + quoi** UNIQUEMENT pour des **choses, idées ou situations** (`ce à quoi je m’intéresse`). Pour une **personne**, employez toujours **qui** après la préposition (`la personne à qui je pense`, `l’ami avec qui je travaille`), jamais `quoi` ! Retenez le quatuor complet : sujet → **ce qui**, COD → **ce que**, `de` → **ce dont**, autre préposition → **ce + prép. + quoi**.\n\nChose / idée : **ce à quoi je tiens, ce sur quoi je compte, ce pour quoi je viens**.\nPersonne (qui !) : **la collègue à qui je parle, l’ami sur qui je compte**.',
        ),
      ),
      mc(P.form, ['ce à quoi', 'ce dont', 'ce que', 'à ce que'], {
        fr: 'La sécurité à vélo ? C’est justement ___ nous devons faire attention.',
        explain: b('Faire attention à + thing → ce à quoi.', 'Faire attention à + chose → ce à quoi.'),
      }),
      mc(P.form, ['ce sur quoi', 'ce dont', 'ce à quoi', 'sur ce que'], {
        fr: 'Je peux vous montrer ___ notre atelier travaille ce mois-ci.',
      }),
      gap(P.complete, 'Ce n’était vraiment pas ___ (ce à quoi / ce dont) je m’attendais ! Mais c’est exactement ___ (ce pour quoi / ce dont) nous avons besoin d’outils : regarde ___ (ce avec quoi / ce qui) j’ai ouvert cette boîte !', [['ce à quoi'], ['ce dont'], ['ce avec quoi']], {
        choices: [['ce à quoi', 'ce dont'], ['ce dont', 'ce pour quoi'], ['ce avec quoi', 'ce dont']],
      }),
      ord(P.order, 'Voilà ce à quoi je tiens le plus dans mon métier.', {
        tr: 'That is what matters most to me in my job.',
        extra: ['dont', 'que'],
      }),
      sort(
        b('Choose ce dont (takes de) or ce à quoi (takes à).', 'Choisissez ce dont (avec de) ou ce à quoi (avec à).'),
        [b('ce dont (verb/adj + de)', 'ce dont (verbe/adj + de)'), b('ce à quoi (verb + à)', 'ce à quoi (verbe + à)')],
        [['penser ___ (tu penses à…)', 1], ['rêver ___ (tu rêves de…)', 0], ['s’attendre ___ (je m’attends à…)', 1], ['être fier ___ (il est fier de…)', 0], ['tenir ___ (nous tenons à…)', 1], ['avoir besoin ___ (j’ai besoin de…)', 0]],
      ),
      hear('Ce à quoi j’ai eu du mal à m’habituer au début, ce sont les repas à vingt heures, mais ce dont je suis ravi, c’est la vie de quartier.', b('What took the speaker time to get used to?', 'À quoi la personne a-t-elle eu du mal à s’habituer ?'), [
        b('Eating dinner at eight p.m.', 'Aux dîners à vingt heures'),
        b('The lively neighbourhood life', 'À la vie de quartier'),
        b('Waking up early for work', 'Au réveil matinal pour travailler'),
      ]),
      dict('Voici ce sur quoi nous comptons et ce à quoi vous devez réfléchir avant vendredi.'),
      say('C’est tout à fait ce à quoi je m’attendais, mais ce dont je suis sûr, c’est que nous allons réussir.', 'It’s completely what I expected, though what I’m sure of is that we’ll succeed.'),
    ],
    [
      b('With à, sur, avec, pour, sans, contre + "what", use ce + preposition + quoi.', 'Avec à, sur, avec, pour, sans, contre + « ce… », employez ce + préposition + quoi.'),
      b('Key à verbs: penser à, s’attendre à, s’intéresser à, tenir à, faire attention à → ce à quoi.', 'Verbes en à clés : penser à, s’attendre à, s’intéresser à, tenir à, faire attention à → ce à quoi.'),
      b('Quoi refers only to things/ideas; for people after a preposition, use qui.', 'Quoi ne désigne que des choses ou idées ; pour les personnes, employez qui.'),
    ],
    [
      ['s’attendre à', b('to expect', 'prévoir, penser qu’une chose va arriver')],
      ['tenir à', b('to value, care deeply about', 'attacher beaucoup d’importance à')],
      ['compter sur', b('to rely on, count on', 's’appuyer avec confiance sur')],
    ],
  ),

  lesson(C, 4, ['cleft-emphasis-cest-ce-qui', 'mise-en-relief-cest-ce-qui'],
    b('Emphasis: C’est … qui/que and Ce qui …, c’est …', 'Mise en relief : C’est … qui/que et Ce qui …, c’est …'),
    b('Spotlight a person, time or idea in French using natural cleft sentences.', 'Mettre en valeur une personne, un lieu, un moment ou une idée grâce aux phrases clivées.'),
    [
      b('Spotlight any element with C’est / Ce sont … qui (subject) or … que (object/time/place)', 'Mettre en relief un élément avec C’est / Ce sont … qui ou … que'),
      b('Build suspense before the main point with Ce qui / Ce que / Ce dont …, c’est …', 'Annoncer le point fort avec Ce qui / Ce que / Ce dont …, c’est …'),
      b('Match singular c’est and plural ce sont cleanly in formal vs everyday French', 'Accorder c’est et ce sont au singulier et au pluriel'),
    ],
    13,
    [
      card(
        b('Two natural ways to highlight what matters most', 'Deux structures élégantes pour mettre en relief'),
        b(
          'In English, you stress a word with your voice (*"LÉA organized it"*). In French, you wrap it inside a **cleft frame**! Put **C’est … qui** (for the subject) or **C’est … que** (for a direct object, time, place or prepositional phrase). Or flip the sentence to build anticipation: **Ce qui / Ce que / Ce dont / Ce à quoi …, c’est …**.\n\nC’est … qui/que: **C’est moi qui paie, C’est demain qu’il arrive, C’est ce film que j’adore**.\nCe qui/que …, c’est: **Ce qui m’étonne, c’est son calme · Ce que j’aime, c’est la lumière**.\nCe dont …, c’est: **Ce dont j’ai besoin, c’est de vacances · Ce dont je rêve, c’est d’un café**.',
          'Pour insister sur un mot en français, on l’encadre ! Utilisez **C’est … qui** (si le mot mis en valeur est sujet) ou **C’est … que** (s’il est COD, lieu, moment ou complément avec préposition). Vous pouvez aussi créer un effet d’attente avec **Ce qui / Ce que / Ce dont / Ce à quoi …, c’est …**.\n\nC’est … qui/que : **C’est moi qui paie, C’est demain qu’il arrive, C’est ce film que j’adore**.\nCe qui/que …, c’est : **Ce qui m’étonne, c’est son calme · Ce que j’aime, c’est la lumière**.\nCe dont …, c’est : **Ce dont j’ai besoin, c’est de vacances · Ce dont je rêve, c’est d’un café**.',
        ),
        {
          table: {
            head: [b('Focus', 'Élément mis en relief'), b('Frame', 'Structure'), b('Example', 'Exemple')],
            rows: [
              [b('Subject', 'Sujet'), 'C’est / Ce sont … qui', 'C’est Thomas qui a trouvé la clé.'],
              [b('Direct object / Time / Place', 'COD / Temps / Lieu'), 'C’est … que', 'C’est à Lyon qu’ils se sont rencontrés.'],
              [b('Idea (subject)', 'Idée (sujet)'), 'Ce qui …, c’est …', 'Ce qui compte, c’est d’essayer.'],
              [b('Idea (object)', 'Idée (COD)'), 'Ce que …, c’est / ce sont …', 'Ce que je préfère, ce sont les marchés d’été.'],
              [b('Idea (with de)', 'Idée (avec de)'), 'Ce dont …, c’est de …', 'Ce dont nous manquons, c’est de temps.'],
            ],
          },
          ex: [
            ['C’est vous qui décidez de la date de la réunion.', 'You are the ones who decide the date of the meeting.'],
            ['Ce qui me plaît dans ce quartier, ce sont les petites rues calmes.', 'What I like about this neighbourhood is the quiet little streets.'],
          ],
        },
      ),
      tip(
        b('Verb agreement after C’est moi qui… & de after Ce qui / Ce dont…', 'Accord après C’est moi qui… et de après Ce qui / Ce dont…'),
        b(
          'After **C’est moi qui**, **C’est toi qui**, **C’est nous qui**, **C’est vous qui**, the verb agrees with **moi / toi / nous / vous**: **C’est moi qui suis** prêt, **C’est toi qui as** raison, **C’est vous qui venez**. Notice also: before an **infinitive** after `c’est` (`Ce qui compte, c’est…`), add **de / d’**: `Ce qui est important, c’est d’écouter`. And with `Ce dont`, echo **de** before a noun too: `Ce dont j’ai besoin, c’est de repos`.\n\nPerson agreement: **C’est moi qui paie, C’est toi qui conduis, C’est vous qui choisissez**.\nBefore infinitive: **c’est de partir tôt, c’est d’essayer, c’est de rester calme**.',
          'Après **C’est moi qui**, **C’est toi qui**, **C’est nous qui**, **C’est vous qui**, le verbe s’accorde avec la personne : **C’est moi qui suis** prêt, **C’est toi qui as** raison, **C’est vous qui venez**. Notez aussi : devant un **infinitif** après `c’est`, on ajoute **de / d’** (`Ce qui compte, c’est d’essayer`), et avec `Ce dont`, on reprend **de** devant le nom (`Ce dont j’ai besoin, c’est de repos`).\n\nAccord avec la personne : **C’est moi qui paie, C’est toi qui conduis, C’est vous qui choisissez**.\nDevant infinitif : **c’est de partir tôt, c’est d’essayer, c’est de rester calme**.',
        ),
      ),
      mc(P.form, ['qui as', 'qui a', 'que tu as', 'qui es'], {
        fr: 'Ne t’excuse pas : c’est toi ___ raison depuis le début !',
        explain: b('After C’est toi qui, the verb agrees with tu (`as`).', 'Après C’est toi qui, le verbe s’accorde avec tu (`as`).'),
      }),
      mc(P.form, ['Ce qui', 'Ce que', 'Ce dont', 'Ce à quoi'], {
        fr: '___ m’étonne le plus dans cette histoire, c’est qu’il n’ait rien dit.',
      }),
      gap(P.complete, 'C’est à Bordeaux ___ (que / qui) mes parents se sont connus, mais ___ (ce qui / ce que) j’adore chez eux, ___ (c’est / ce sont) les grands repas de famille le dimanche !', [['que'], ['ce que'], ['ce sont']], {
        choices: [['que', 'qui', 'où'], ['ce que', 'ce qui', 'ce dont'], ['ce sont', 'c’est']],
      }),
      ord(P.order, 'Ce dont j’ai vraiment besoin, c’est d’une bonne nuit de sommeil.', {
        tr: 'What I really need is a good night’s sleep.',
        extra: ['en', 'que'],
      }),
      pairs(
        b('Match each emphasized opening with the natural ending.', 'Associez chaque mise en relief à sa fin logique.'),
        [
          ['Ce qui compte vraiment,', 'c’est de rester curieux.'],
          ['Ce dont je suis sûr,', 'c’est qu’il fera de son mieux.'],
          ['C’est demain matin', 'que le train part à sept heures.'],
          ['Ce à quoi je pense,', 'c’est à notre prochain voyage.'],
        ],
        true,
      ),
      hear('Ce qui rend ce petit café si agréable, ce n’est pas seulement le chocolat chaud, c’est surtout le calme et les vieux fauteuils.', b('What makes the café especially pleasant according to the speaker?', 'Qu’est-ce qui rend ce café particulièrement agréable ?'), [
        b('Mostly the calm atmosphere and old armchairs, not just the hot chocolate', 'Surtout le calme et les vieux fauteuils, pas seulement le chocolat chaud'),
        b('Only the price and the fast service at lunchtime', 'Uniquement les prix et le service rapide'),
        b('The loud live music every afternoon', 'La musique très forte chaque après-midi'),
      ]),
      dlg(b('Planning the team retreat', 'Organiser la sortie d’équipe'), b('Salomé and Victor agree on priorities for next month’s trip.', 'Salomé et Victor se mettent d’accord sur les priorités du prochain séjour.'), [['Salomé', 'f'], ['Victor', 'm']], [
        [0, 'Alors, qui s’occupe des billets de train cette année ?', 'So, who is taking care of the train tickets this year?'],
        [1, { options: ['C’est moi qui m’en occupe ! Mais ce dont j’ai besoin avant vendredi, c’est la liste exacte des participants.', 'C’est moi qui s’en occupe ! Mais ce que j’ai besoin avant vendredi, c’est la liste exacte des participants.', 'C’est moi que j’en occupe ! Mais ce dont j’ai besoin avant vendredi, c’est la liste exacte des participants.'], explain: b('Verb agrees with moi (`m’en occupe`), and avoir besoin de requires `ce dont`.', 'Accord avec moi (`m’en occupe`) et avoir besoin de → `ce dont`.') }],
        [0, 'Parfait ! Et pour le logement, tu sais déjà ce que tout le monde préfère ?', 'Perfect! And for accommodation, do you already know what everyone prefers?'],
        [1, { options: ['Oui, ce qui plaît à toute l’équipe, ce sont des chalets en bois près du lac.', 'Oui, ce que plaît à toute l’équipe, c’est des chalets en bois près du lac.', 'Oui, ce dont plaît à toute l’équipe, ce sont des chalets en bois près du lac.'], explain: b('Plaît follows immediately → subject `ce qui`, with plural `ce sont` before `des chalets`.', 'Plaît suit directement → sujet `ce qui`, puis `ce sont` devant `des chalets`.') }],
      ]),
      write(
        b('Express what matters to you using ce qui, ce que, ce dont and clefts', 'Exprimer vos priorités avec ce qui, ce que, ce dont et la mise en relief'),
        b('Write 45 to 80 words about your ideal weekend, city or job. Include at least three different structures from this course: ce qui, ce que, ce dont, ce à quoi, or a cleft with C’est … qui/que and Ce qui …, c’est …', 'Écrivez 45 à 80 mots sur votre week-end idéal, votre ville ou votre travail. Employez au moins trois structures de ce cours : ce qui, ce que, ce dont, ce à quoi, ou une mise en relief avec C’est … qui/que et Ce qui …, c’est …'),
        45,
        80,
        [
          b('Correct distinction among ce qui, ce que, ce dont and ce à quoi', 'Bon choix entre ce qui, ce que, ce dont et ce à quoi'),
          b('Natural emphasis frame (C’est… qui/que or Ce qui…, c’est…)', 'Mise en relief naturelle (C’est… qui/que ou Ce qui…, c’est…)'),
          b('Accurate verb agreement and no repeated de/en with dont', 'Accords justes et aucun de/en en trop avec dont'),
        ],
        'Ce que j’aime le plus le dimanche, ce sont les matins sans réveil. C’est ma sœur qui prépare toujours le café pendant que j’ouvre les volets. Ce dont j’ai surtout besoin après une longue semaine, c’est de marcher en forêt. Voilà exactement ce à quoi je pense dès le jeudi soir !',
      ),
    ],
    [
      b('Spotlight elements with C’est / Ce sont … qui (subject) or … que (object/place/time).', 'Mettez en relief avec C’est / Ce sont … qui (sujet) ou … que (COD/lieu/moment).'),
      b('After C’est moi/toi/nous/vous qui, agree the verb with that pronoun.', 'Après C’est moi/toi/nous/vous qui, accordez le verbe avec ce pronom.'),
      b('Use Ce qui / Ce que / Ce dont / Ce à quoi …, c’est (de)… to highlight whole ideas.', 'Utilisez Ce qui / Ce que / Ce dont / Ce à quoi …, c’est (de)… pour souligner une idée.'),
    ],
    [
      ['un chalet', b('a wooden cabin / chalet', 'une maison en bois en montagne')],
      ['faire de son mieux', b('to do one’s best', 'fournir le maximum d’efforts')],
      ['le repos', b('rest, relaxation', 'le calme après la fatigue')],
    ],
  ),
];

export default lessons;
