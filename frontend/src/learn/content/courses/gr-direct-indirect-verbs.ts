import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je te le prête, elle la lui envoie, donne-le-moi ! Combining two object pronouns in one French sentence looks intimidating until you see the single fixed order grid. This course moves cleanly from choosing between direct (le, la, les) and indirect (lui, leur) pronouns, to stacking two pronouns in statements, negatives, passé composé with agreement, and finally affirmative vs negative imperatives.',
    'Je te le prête, elle la lui envoie, donne-le-moi ! Combiner deux pronoms compléments devient simple dès qu’on connaît l’ordre fixe. Ce cours va pas à pas du choix entre COD (le, la, les) et COI (lui, leur) jusqu’aux doubles pronoms dans les phrases affirmatives, négatives, au passé composé avec accord, puis à l’impératif.',
  ),
  outcomes: [
    b('Tell direct objects (le, la, les) apart from indirect objects (lui, leur)', 'Distinguer les pronoms COD (le, la, les) des pronoms COI (lui, leur)'),
    b('Stack two object pronouns in the exact French order before the verb', 'Ordonner deux pronoms compléments avant le verbe sans hésiter'),
    b('Agree the past participle only with a preceding direct object, never lui/leur', 'Accorder le participe passé seulement avec le COD placé avant, jamais avec lui/leur'),
    b('Switch pronoun order accurately between affirmative and negative imperatives', 'Maîtriser l’ordre des pronoms à l’impératif affirmatif et négatif'),
  ],
};

const C = 'gr-direct-indirect-verbs';

const lessons: Lesson[] = [
  lesson(C, 1, ['direct-vs-indirect-pronouns', 'cod-ou-coi'],
    b('Direct (le, la, les) vs Indirect (lui, leur)', 'COD (le, la, les) contre COI (lui, leur)'),
    b('Know which verbs take a direct object and which demand à + person.', 'Savoir quels verbes prennent un complément direct et lesquels exigent à + personne.'),
    [
      b('Replace direct objects (things and people) with le, la, l’, les', 'Remplacer un COD (chose ou personne) par le, la, l’, les'),
      b('Replace à + person with lui (him or her) or leur (them, no -s)', 'Remplacer « à + personne » par lui (masculin ou féminin) ou leur (sans -s)'),
      b('Avoid classic French/English preposition traps like attendre vs téléphoner à', 'Éviter les pièges classiques comme attendre quelqu’un contre téléphoner à quelqu’un'),
    ],
    13,
    [
      card(
        b('Direct (no preposition) vs Indirect (à + person)', 'COD (sans préposition) contre COI (à + personne)'),
        b(
          'Before combining two pronouns, you must pick the right one. Use **le, la, l’, les** when the verb connects **directly** to the person or thing. Use **lui** (both *to him* and *to her*!) and **leur** (*to them* — never **leurs**!) when the verb takes **à + person**.\n\nDirect verbs: **voir, attendre, écouter, aider, inviter**.\nIndirect verbs (à): **parler à, téléphoner à, répondre à, écrire à, offrir à**.',
          'Avant de combiner deux pronoms, il faut choisir le bon pronom. On emploie **le, la, l’, les** quand le verbe se construit **directement** sans préposition. On emploie **lui** (*à lui* ou *à elle* !) et **leur** (*à eux* ou *à elles* — jamais **leurs** !) quand le verbe prend **à + personne**.\n\nVerbes directs : **voir, attendre, écouter, aider, inviter**.\nVerbes indirects (à) : **parler à, téléphoner à, répondre à, écrire à, offrir à**.',
        ),
        {
          table: {
            head: [b('Person', 'Personne'), b('Direct (COD)', 'COD (direct)'), b('Indirect (COI: à + person)', 'COI (à + personne)')],
            rows: [
              ['1st sg / pl', 'me / m’, nous', 'me / m’, nous'],
              ['2nd sg / pl', 'te / t’, vous', 'te / t’, vous'],
              ['3rd sg (him / her / it)', 'le / la / l’', 'lui (only for people / pets!)'],
              ['3rd pl (them)', 'les', 'leur (NEVER leurs)'],
            ],
          },
          ex: [
            ['J’attends Paul devant la gare → Je l’attends devant la gare.', 'I’m waiting for Paul in front of the station → I’m waiting for him there.'],
            ['Je téléphone à Sophie ce soir → Je lui téléphone ce soir.', 'I’m calling Sophie tonight → I’m calling her tonight.'],
          ],
        },
      ),
      trap(
        b('Watch the four biggest verb traps!', 'Attention aux quatre pièges classiques !'),
        b(
          'English uses "for" with *wait for* and *look for*, yet French **attendre** and **chercher** are **direct**: **Je l’attends**, **Je la cherche** (never *lui*). Conversely, *call someone* and *answer someone* take **à** in French: **téléphoner à**, **répondre à**, **obéir à**, **ressembler à** → **Je lui téléphone**, **Je leur réponds**.\n\nDirect despite English: **attendre quelqu’un, chercher quelqu’un, écouter quelqu’un, regarder quelque chose**.\nIndirect with à: **téléphoner à, répondre à, plaire à, ressembler à**.',
          'En français, **attendre** et **chercher** n’ont pas de préposition : **Je l’attends**, **Je la cherche** (jamais *lui*). À l’inverse, **téléphoner à**, **répondre à**, **obéir à** et **ressembler à** exigent **à** : **Je lui téléphone**, **Je leur réponds**.\n\nDirects en français : **attendre quelqu’un, chercher quelqu’un, écouter quelqu’un, regarder quelque chose**.\nIndirects avec à : **téléphoner à, répondre à, plaire à, ressembler à**.',
        ),
      ),
      mc(P.form, ['lui', 'la', 'leur', 'le'], {
        fr: 'Ma grand-mère aime nos appels : je ___ téléphone chaque dimanche.',
      }),
      mc(P.form, ['les', 'leur', 'leurs', 'eux'], {
        fr: 'Mes amis arrivent à dix heures ; je vais ___ attendre sur le quai.',
      }),
      gap(P.complete, 'Tu écris souvent à tes cousins ? — Oui, je ___ écris une fois par mois, et quand ils viennent, je ___ invite à dîner. — Et ta voisine ? — Je ___ aide parfois à porter ses courses.', [['leur'], ['les'], ['l’']], {
        choices: [['leur', 'les', 'leurs'], ['les', 'leur', 'eux'], ['l’', 'lui', 'la']],
      }),
      sort(
        b('Direct (le/la/les) or Indirect (lui/leur)?', 'COD (le/la/les) ou COI (lui/leur) ?'),
        [b('Direct: le / la / les', 'COD : le / la / les'), b('Indirect: lui / leur', 'COI : lui / leur')],
        [['attendre Marc', 0], ['répondre au professeur', 1], ['chercher ses clés', 0], ['offrir un cadeau à Léa', 1], ['aider nos voisins', 0], ['ressembler à sa mère', 1]],
      ),
      pairs(
        b('Match each noun phrase with its pronoun form.', 'Associez chaque phrase à sa version avec pronom.'),
        [
          ['Je parle à Claire.', 'Je lui parle.'],
          ['Je regarde Claire.', 'Je la regarde.'],
          ['J’écoute mes parents.', 'Je les écoute.'],
          ['J’écris à mes parents.', 'Je leur écris.'],
        ],
        true,
      ),
      hear('Mes collègues attendent ma réponse : je leur envoie un message tout de suite.', b('What is the speaker doing?', 'Que fait la personne ?'), [
        b('Sending a message to their colleagues', 'Elle envoie un message à ses collègues'),
        b('Waiting for a call from one colleague', 'Elle attend l’appel d’un collègue'),
        b('Refusing to answer the email', 'Elle refuse de répondre au courriel'),
      ]),
      dict('Je la connais très bien et je lui fais entièrement confiance.'),
      say('Tu peux l’appeler maintenant ou lui répondre demain matin.', 'You can call him/her now or reply to him/her tomorrow morning.'),
    ],
    [
      b('Direct objects (no preposition) take le, la, l’, les.', 'Les COD (sans préposition) donnent le, la, l’, les.'),
      b('Indirect objects (à + person) take lui (him/her) and leur (them, never leurs).', 'Les COI (à + personne) donnent lui (à lui/à elle) et leur (à eux/à elles, jamais leurs).'),
      b('attendre/chercher/aider = direct; téléphoner à/répondre à/plaire à = indirect.', 'attendre/chercher/aider = COD ; téléphoner à/répondre à/plaire à = COI.'),
    ],
    [
      ['faire confiance à', b('to trust', 'croire en la fiabilité de')],
      ['ressembler à', b('to look like, resemble', 'avoir des traits communs avec')],
      ['un quai', b('a train platform', 'le bord où s’arrête le train')],
    ],
  ),

  lesson(C, 2, ['double-pronoun-order', 'ordre-des-doubles-pronoms'],
    b('Two pronouns together: the fixed order table', 'Deux pronoms ensemble : l’ordre fixe'),
    b('Je te le prête, elle la lui donne, il m’en parle: stack any two pronouns before the verb.', 'Je te le prête, elle la lui donne, il m’en parle : l’ordre exact des doubles pronoms avant le verbe.'),
    [
      b('Apply the 5-column pronoun order before the verb', 'Appliquer le tableau d’ordre des pronoms avant le verbe'),
      b('Put 1st/2nd person before le/la/les, and le/la/les before lui/leur', 'Placer me/te/nous/vous avant le/la/les, et le/la/les avant lui/leur'),
      b('Know when two pronouns cannot stack (me + lui → à lui)', 'Savoir éviter les combinaisons impossibles (me + lui → à lui)'),
    ],
    13,
    [
      card(
        b('The 5-column pronoun ladder', 'L’échelle fixe des pronoms avant le verbe'),
        b(
          'When two pronouns appear before a verb, French ALWAYS arranges them in one strict left-to-right order—regardless of which one is direct or indirect! Notice the big twist: **me/te/nous/vous** go **before** `le/la/les`, whereas **lui/leur** go **after** `le/la/les`. And **y** and **en** always come last.\n\nFirst or second person: **me le, te la, nous les, vous en**.\nThird person pairs: **le lui, la leur, les lui, lui en**.',
          'Quand deux pronoms précèdent le verbe, le français suit TOUJOURS un ordre unique de gauche à droite ! Attention au contraste clé : **me/te/nous/vous** se placent **avant** `le/la/les`, tandis que **lui/leur** se placent **après** `le/la/les`. Et **y** puis **en** ferment toujours la marche.\n\nPremière ou deuxième personne : **me le, te la, nous les, vous en**.\nTroisième personne : **le lui, la leur, les lui, lui en**.',
        ),
        {
          table: {
            head: ['1', '2', '3', '4', '5'],
            rows: [
              ['me / m’', 'le / l’', 'lui', 'y', 'en'],
              ['te / t’ / se / s’', 'la / l’', 'leur', '', ''],
              ['nous / vous', 'les', '', '', ''],
            ],
          },
          ex: [
            ['Tu me prêtes ton vélo ? Oui, je te le prête volontiers.', 'Will you lend me your bike? Yes, I’ll gladly lend it to you.'],
            ['Paul veut cette photo ? Elle la lui envoie ce soir.', 'Does Paul want this photo? She’s sending it to him tonight.'],
          ],
        },
      ),
      trap(
        b('Two pronouns that never stand together: me/te + lui/leur', 'Une combinaison impossible : me/te + lui/leur'),
        b(
          'You can combine column 1 + 2 (**il me le donne**), column 2 + 3 (**il le lui donne**), or any column + **y / en** (**il m’en parle**, **il lui en offre**). However, you **cannot** put column 1 and column 3 together before the verb! Instead, keep **à + stressed pronoun** after the verb: **Il me présente à lui** (never « Il me lui présente »).\n\nAllowed pairs: **te les, la lui, nous y, leur en**.\nSplit with à: **Il me présente à elle, Tu nous confies à eux**.',
          'Vous pouvez combiner colonne 1 + 2 (**il me le donne**), colonne 2 + 3 (**il le lui donne**) ou n’importe quel pronom avec **y / en** (**il m’en parle**, **il lui en offre**). En revanche, colonne 1 + colonne 3 est impossible devant le verbe ! Gardez alors **à + pronom tonique** après le verbe : **Il me présente à lui**.\n\nPaires autorisées : **te les, la lui, nous y, leur en**.\nAvec à après le verbe : **Il me présente à elle, Tu nous confies à eux**.',
        ),
      ),
      mc(P.form, ['je te le montre', 'je le te montre', 'je montre te le', 'je t’y montre'], {
        fr: 'Tu veux voir le nouveau plan ? Attends, ___ tout de suite.',
      }),
      mc(P.form, ['la leur', 'leur la', 'les leur', 'la lui'], {
        fr: 'Nos voisins attendent notre réponse ; nous ___ donnons demain.',
        explain: b('La (direct: réponse) comes BEFORE leur (indirect: voisins).', 'La (COD : réponse) précède leur (COI : voisins).'),
      }),
      gap(P.complete, 'Tu as besoin de stylos ? Je ___ (te + en) donne trois. Et ces clés, c’est pour Léa ? Oui, je ___ (les + lui) rends ce midi. Mon frère ? Il ___ (me + en) parle tous les jours.', [['t’en'], ['les lui'], ['m’en']], {
        choices: [['t’en', 'en te', 'te les'], ['les lui', 'lui les', 'la lui'], ['m’en', 'en me', 'me les']],
      }),
      ord(P.order, 'Mon collègue me l’a expliqué très clairement.', {
        tr: 'My colleague explained it to me very clearly.',
        extra: ['lui', 'le'],
      }),
      pairs(
        b('Match each two-object sentence with its two-pronoun version.', 'Associez chaque phrase à sa transformation avec deux pronoms.'),
        [
          ['Je prête ma veste à Paul.', 'Je la lui prête.'],
          ['Il envoie les billets à ses amis.', 'Il les leur envoie.'],
          ['Tu me donnes du sucre ?', 'Tu m’en donnes ?'],
          ['Elle nous apporte le dossier.', 'Elle nous l’apporte.'],
        ],
        true,
      ),
      hear('Mes parents cherchaient un bon restaurant à Lyon, alors je leur en ai recommandé deux.', b('What did the speaker do for their parents?', 'Qu’a fait la personne pour ses parents ?'), [
        b('Recommended two good restaurants in Lyon to them', 'Elle leur a recommandé deux bons restaurants à Lyon'),
        b('Booked one table for themselves in Lyon', 'Elle a réservé une table pour elle seule à Lyon'),
        b('Asked them to choose a café in Paris', 'Elle leur a demandé de choisir un café à Paris'),
      ]),
      dict('Si tu veux la recette, je te l’écris tout de suite et je t’en envoie une photo.'),
      say('Ce livre est à Marc ? Oui, je le lui rends après le déjeuner.', 'Is this book Marc’s? Yes, I’m giving it back to him after lunch.'),
    ],
    [
      b('Fixed order before the verb: me/te/se/nous/vous → le/la/les → lui/leur → y → en.', 'Ordre fixe avant le verbe : me/te/se/nous/vous → le/la/les → lui/leur → y → en.'),
      b('Notice: te le (1st/2nd first), but le lui (3rd direct before 3rd indirect).', 'Attention : te le (1re/2e d’abord), mais le lui (COD 3e avant COI 3e).'),
      b('Never stack me/te/nous/vous + lui/leur before the verb: use à lui / à elle after.', 'Ne combinez jamais me/te/nous/vous + lui/leur devant le verbe : mettez à lui / à elle après.'),
    ],
    [
      ['recommander', b('to recommend', 'conseiller quelque chose de bien')],
      ['confier à', b('to entrust to', 'remettre à la garde de')],
      ['rendre', b('to give back, return', 'redonner ce qu’on a emprunté')],
    ],
  ),

  lesson(C, 3, ['double-pronouns-negation-pc', 'negation-et-passe-compose'],
    b('Negation, infinitives and passé composé agreement', 'Négation, infinitifs et accord au passé composé'),
    b('Keep pronoun pairs together in negatives and before infinitives—and know when the participle agrees.', 'Garder les doubles pronoms groupés à la négation et devant l’infinitif, et réussir l’accord du participe.'),
    [
      b('Wrap ne… pas around the whole pronoun pair + conjugated verb', 'Encadrer le bloc « doubles pronoms + verbe » par ne… pas'),
      b('Place pronoun pairs right before an infinitive (Je vais te le montrer)', 'Placer les doubles pronoms juste devant l’infinitif'),
      b('Agree the past participle ONLY with preceding le/la/les, never lui/leur/en', 'Accorder le participe passé seulement avec le COD placé avant (le/la/les), jamais avec lui/leur/en'),
    ],
    13,
    [
      card(
        b('Where the pronoun pair sits in negatives, infinitives and passé composé', 'Où placer la paire à la négation, à l’infinitif et au passé composé'),
        b(
          'Two pronouns act as a single glued block—never split them with **ne** or **pas**! In a negative sentence, **ne** goes before the whole block and **pas** after the conjugated verb. With an infinitive (`aller, pouvoir, vouloir`), the pair jumps directly in front of the **infinitive**. In the **passé composé**, the pair stands before `avoir` or `être`, and the past participle agrees **only** with a preceding **direct object** (`la`, `les`), **never** with `lui`, `leur` or `en`.\n\nNegative: **Je ne te le dis pas, Elle ne la lui prête jamais**.\nInfinitive: **Je vais te le montrer, Il ne peut pas me les envoyer**.\nPassé composé agreement: **la lettre → je la lui ai écrite, les clés → je les leur ai rendues**.',
          'Les deux pronoms forment un bloc inséparable : **ne** ne passe jamais entre eux ! À la négation, **ne** précède tout le bloc et **pas** suit le verbe conjugué. Avec un infinitif (`aller, pouvoir, vouloir`), la paire se place juste avant l’**infinitif**. Au **passé composé**, elle précède l’auxiliaire, et le participe passé s’accorde **uniquement** avec le **COD** placé avant (`la`, `les`), **jamais** avec `lui`, `leur` ou `en`.\n\nNégation : **Je ne te le dis pas, Elle ne la lui prête jamais**.\nInfinitif : **Je vais te le montrer, Il ne peut pas me les envoyer**.\nAccord au passé composé : **la lettre → je la lui ai écrite, les clés → je les leur ai rendues**.',
        ),
        {
          table: {
            head: [b('Structure', 'Structure'), b('Example', 'Exemple'), b('Agreement?', 'Accord ?')],
            rows: [
              [b('Negative present', 'Présent négatif'), 'Je ne le lui donne pas.', b('—', '—')],
              [b('With infinitive', 'Avec infinitif'), 'Elle ne veut pas me les prêter.', b('—', '—')],
              [b('Passé composé + la', 'Passé composé + la'), 'Cette carte, je la lui ai envoyée.', b('Yes: + -e (la = carte)', 'Oui : + -e (COD féminin)')],
              [b('Passé composé + les', 'Passé composé + les'), 'Ces photos, il me les a montrées.', b('Yes: + -es (les = photos)', 'Oui : + -es (COD fém. pl.)')],
              [b('Passé composé + lui/leur/en', 'Passé composé + lui/leur/en'), 'Je leur en ai parlé.', b('No: lui/leur/en never trigger agreement', 'Non : jamais d’accord avec lui/leur/en')],
            ],
          },
          ex: [
            ['La facture ? Je ne la lui ai pas encore payée.', 'The bill? I haven’t paid it to him/her yet.'],
            ['Tu pourras me les rapporter lundi matin ?', 'Will you be able to bring them back to me on Monday morning?'],
          ],
        },
      ),
      trap(
        b('Don’t confuse direct les with indirect leur!', 'Ne confondez pas les (COD) et leur (COI) pour l’accord !'),
        b(
          'Even when **leur** refers to several women (**mes sœurs**), there is **no agreement**: « Mes sœurs ? Je **leur** ai **écrit** hier » (never « écrites »), because **leur** is indirect (`à` + person). Agreement happens ONLY when **la / les** (or direct **me/te/nous/vous**) represents the direct object: « Les lettres ? Je **les** **leur** ai **envoyées** ».\n\nIndirect only (no -e/-s): **Je lui ai téléphoné, Je leur ai répondu, Je leur en ai donné**.\nPreceding COD (agrees): **Je l’ai vue, Je les leur ai données, Je la lui ai écrite**.',
          'Même si **leur** désigne plusieurs femmes (**mes sœurs**), le participe passé reste invariable : « Mes sœurs ? Je **leur** ai **écrit** hier » (jamais « écrites »), car **leur** est un COI. L’accord ne se fait que si un **COD** (`la`, `les`, `me/te/nous/vous` direct) est placé avant : « Les lettres ? Je **les** **leur** ai **envoyées** ».\n\nCOI seul (invariable) : **Je lui ai téléphoné, Je leur ai répondu, Je leur en ai donné**.\nCOD avant (accord) : **Je l’ai vue, Je les leur ai données, Je la lui ai écrite**.',
        ),
      ),
      mc(P.spelling, ['les lui ai rendues', 'les lui ai rendu', 'lui les ai rendues', 'les lui ai rendus'], {
        fr: 'Mes clés ? Oui, je ___ ce matin avant de partir.',
        explain: b('Clés is feminine plural, and les (COD) precedes avoir → rendues.', 'Clés est féminin pluriel, et les (COD) précède avoir → rendues.'),
      }),
      mc(P.order, ['Je ne vais pas te le répéter.', 'Je ne te le vais pas répéter.', 'Je vais ne te le pas répéter.', 'Je ne vais te le pas répéter.'], {
        fr: 'Choisissez la phrase correcte avec un infinitif négatif.',
      }),
      gap(P.complete, 'La réponse ? Nous ne ___ (la + leur) avons pas encore ___ (donner). Et mes amies ? Je ___ (leur) ai déjà ___ (parler) hier soir.', [['la leur'], ['donnée'], ['leur'], ['parlé']], {
        choices: [['la leur', 'leur la', 'les leur'], ['donnée', 'donné', 'données'], ['leur', 'les', 'leurs'], ['parlé', 'parlées', 'parlée']],
      }),
      ord(P.order, 'Tu ne peux pas nous les envoyer avant demain ?', {
        tr: 'Can’t you send them to us before tomorrow?',
        extra: ['leur', 'pas ne'],
      }),
      sort(
        b('Does the past participle agree or stay invariable?', 'Le participe passé s’accorde-t-il ou reste-t-il invariable ?'),
        [b('Agrees (preceding direct object)', 'S’accorde (COD placé avant)'), b('Stays invariable (COI or en)', 'Reste invariable (COI ou en)')],
        [['Cette robe, je la lui ai offerte.', 0], ['Mes amies, je leur ai téléphoné.', 1], ['Ces lettres, elle me les a écrites.', 0], ['Des pommes, il m’en a acheté.', 1], ['Ma collègue, je lui ai répondu.', 1]],
      ),
      hear('Les invitations pour le mariage ? Oui, nous les leur avons toutes envoyées lundi matin.', b('What is already done?', 'Qu’est-ce qui est déjà fait ?'), [
        b('All the wedding invitations have already been sent to them', 'Toutes les invitations du mariage leur ont déjà été envoyées'),
        b('Only half of the invitations were printed on Monday', 'La moitié des invitations a été imprimée lundi'),
        b('They decided not to send invitations by post', 'Ils ont décidé de ne pas envoyer d’invitations'),
      ]),
      dict('Cette histoire, je ne la lui ai jamais racontée et je ne vais pas la lui dire maintenant.'),
      say('Ne t’inquiète pas, tes lunettes, je les ai posées sur la table et je ne les y ai pas oubliées.', 'Don’t worry, I put your glasses on the table and didn’t leave them there.'),
    ],
    [
      b('In negatives, ne… pas wraps the whole pronoun block + conjugated verb.', 'À la négation, ne… pas entoure le bloc pronoms + verbe conjugué.'),
      b('With an infinitive, the pronoun pair goes directly before the infinitive.', 'Avec un infinitif, les deux pronoms se placent juste avant l’infinitif.'),
      b('In passé composé, agree ONLY with preceding COD (la/les), never with lui, leur or en.', 'Au passé composé, accordez seulement avec le COD placé avant (la/les), jamais avec lui, leur ni en.'),
    ],
    [
      ['une facture', b('a bill, invoice', 'un document indiquant la somme à payer')],
      ['rapporter', b('to bring back', 'ramener un objet emprunté')],
      ['un mariage', b('a wedding', 'la cérémonie d’union de deux personnes')],
    ],
  ),

  lesson(C, 4, ['imperative-pronoun-order', 'ordre-a-limperatif'],
    b('Affirmative vs negative imperative: Donne-le-moi !', 'Impératif affirmatif contre négatif : Donne-le-moi !'),
    b('See how pronouns jump after the verb in commands—and return to normal order with ne… pas.', 'Voyez comment les pronoms passent après le verbe à l’impératif affirmatif — et reviennent devant au négatif.'),
    [
      b('Place pronouns after affirmative imperatives with hyphens (le/la/les + moi/toi/lui/leur)', 'Placer les pronoms après l’impératif affirmatif avec trait d’union'),
      b('Use moi/toi at the end, or m’/t’ before y and en (Donne-m’en !)', 'Employer moi/toi en fin de groupe, ou m’/t’ devant y et en (Donne-m’en !)'),
      b('Keep standard pre-verb pronoun order in negative imperatives', 'Garder l’ordre normal avant le verbe à l’impératif négatif'),
    ],
    13,
    [
      card(
        b('Two completely different orders for imperatives', 'Deux ordres opposés à l’impératif'),
        b(
          'In a **negative imperative**, pronouns stay **before** the verb in the normal order you already know (`ne me le donne pas !`). In an **affirmative imperative**, pronouns move **after** the verb, joined by hyphens—and **le / la / les comes FIRST**, before **moi / toi / lui / nous / vous / leur**! Notice that **me** and **te** become **moi** and **toi** unless followed by **y** or **en** (**Donne-m’en !**).\n\nAffirmative commands: **Donne-le-moi !, Passe-la-nous !, Explique-le-leur !**.\nNegative commands: **Ne me le donne pas !, Ne la lui montre pas !, Ne m’en parle plus !**.',
          'À l’**impératif négatif**, les pronoms restent **devant** le verbe dans l’ordre habituel (`Ne me le donne pas !`). À l’**impératif affirmatif**, ils passent **après** le verbe avec des traits d’union — et **le / la / les passe EN PREMIER**, avant **moi / toi / lui / nous / vous / leur** ! De plus, **me** et **te** deviennent **moi** et **toi**, sauf devant **y** ou **en** (**Donne-m’en !**).\n\nImpératif affirmatif : **Donne-le-moi !, Passe-la-nous !, Explique-le-leur !**.\nImpératif négatif : **Ne me le donne pas !, Ne la lui montre pas !, Ne m’en parle plus !**.',
        ),
        {
          table: {
            head: [b('Meaning', 'Sens'), b('Affirmative imperative', 'Impératif affirmatif'), b('Negative imperative', 'Impératif négatif')],
            rows: [
              [b('Give it to me!', 'Donner à moi'), 'Donne-le-moi !', 'Ne me le donne pas !'],
              [b('Send them to him/her!', 'Envoyer à lui/elle'), 'Envoie-les-lui !', 'Ne les lui envoie pas !'],
              [b('Explain it to them!', 'Expliquer à eux/elles'), 'Explique-le-leur !', 'Ne le leur explique pas !'],
              [b('Give me some!', 'Donner une part à moi'), 'Donne-m’en !', 'Ne m’en donne pas !'],
            ],
          },
          ex: [
            ['Tu as mon parapluie ? Passe-le-moi, il commence à pleuvoir !', 'Do you have my umbrella? Pass it to me, it’s starting to rain!'],
            ['C’est un secret : ne le leur dis surtout pas !', 'It’s a secret: definitely don’t tell them!'],
          ],
        },
      ),
      trap(
        b('Watch moi vs m’ and hyphens!', 'Attention à moi contre m’ et aux traits d’union !'),
        b(
          'In French, never write « Donne-moi-le » or « Ne donne-le-moi pas »: at the affirmative imperative, **le/la/les** ALWAYS precedes **moi/toi/nous/vous/lui/leur** (**Prête-le-moi !**). Before **en**, however, **moi** shrinks back to **m’**: **Parle-m’en !** (not « Parle-moi-en »). And remember: drop the final **-s** on `-er` imperatives unless **y** or **en** follows directly (**Donne-le-moi**, but **Donnes-en !**).\n\nWith le/la/les: **Prête-le-moi !, Montre-la-nous !, Garde-les-lui !**.\nWith m’/t’ + en: **Parle-m’en !, Donne-m’en !, Achète-t’en !**.',
          'Ne dites jamais « Donne-moi-le » ni « Ne donne-le-moi pas » : à l’impératif affirmatif, **le/la/les** passe toujours avant **moi/toi/nous/vous/lui/leur** (**Prête-le-moi !**). En revanche, devant **en**, **moi** redevient **m’** : **Parle-m’en !** Enfin, les verbes en `-er` ne prennent pas de `-s` devant `le/la/moi`, mais seulement devant `y` ou `en` (**Donne-le-moi**, mais **Donnes-en !**).\n\nAvec le/la/les : **Prête-le-moi !, Montre-la-nous !, Garde-les-lui !**.\nAvec m’/t’ + en : **Parle-m’en !, Donne-m’en !, Achète-t’en !**.',
        ),
      ),
      mc(P.form, ['Passe-le-moi', 'Passe-moi-le', 'Me le passe', 'Passes-le-moi'], {
        fr: 'J’ai besoin du sel : ___, s’il te plaît !',
      }),
      mc(P.form, ['Ne le lui montrez pas', 'Ne montrez-le-lui pas', 'Ne lui le montrez pas', 'Montrez-ne-le-lui pas'], {
        fr: 'C’est une surprise pour Marc : ___ avant ce soir !',
      }),
      gap(P.complete, 'Tu as fini cette bande dessinée ? ___ (Prêter / la / moi) ! Mais les lettres sur le bureau, ___ (ne / les / lire / pas) et ___ (ne / me / en / parler / pas) !', [['Prête-la-moi'], ['ne les lis pas'], ['ne m’en parle pas']], {
        choices: [['Prête-la-moi', 'Prête-moi-la', 'Prêtes-la-moi'], ['ne les lis pas', 'ne lis-les pas'], ['ne m’en parle pas', 'ne me en parle pas', 'ne parle-m’en pas']],
      }),
      ord(P.order, 'Expliquez-nous-le calmement ou ne nous en parlez pas !', {
        tr: 'Explain it to us calmly or don’t talk to us about it!',
        extra: ['lui', 'moi'],
      }),
      hear('Tu as acheté des cerises ? Donne-m’en quelques-unes, mais ne les donne pas toutes aux voisins !', b('What does the speaker want?', 'Que demande la personne ?'), [
        b('To be given a few cherries, without giving them all to the neighbours', 'Qu’on lui donne quelques cerises, sans tout donner aux voisins'),
        b('To give all the cherries to the neighbours right away', 'Qu’on donne toutes les cerises aux voisins'),
        b('To keep every cherry in the kitchen until tomorrow', 'Qu’on garde toutes les cerises jusqu’à demain'),
      ]),
      dlg(b('Setting up for dinner', 'Les préparatifs du dîner'), b('Manon and Sam are busy in the kitchen before guests arrive.', 'Manon et Sam préparent le repas avant l’arrivée des invités.'), [['Manon', 'f'], ['Sam', 'm']], [
        [0, 'Sam, tu tiens le plat chaud ? Pose-le sur la table, s’il te plaît.', 'Sam, are you holding the hot dish? Put it on the table, please.'],
        [1, { options: ['D’accord ! Et cette sauce au poivre, je la verse maintenant ?', 'D’accord ! Et cette sauce au poivre, verse-la maintenant ?'], explain: b('Sam is asking a question (`je la verse ?`), not giving a command.', 'Sam pose une question (`je la verse ?`), il ne donne pas d’ordre.') }],
        [0, 'Non, ne la verse pas encore ! Laisse-la au chaud, et les assiettes, apporte-les-moi ici.', 'No, don’t pour it yet! Keep it warm, and bring the plates over to me here.'],
        [1, { options: ['Tiens, je te les pose juste là. Tu veux du pain ? Je t’en coupe tout de suite.', 'Tiens, je les te pose juste là. Tu veux du pain ? Je en te coupe tout de suite.', 'Tiens, pose-les-moi juste là. Tu veux du pain ? Coupe-t’en tout de suite.'], explain: b('In a statement, te comes before les (`je te les pose`), and t’ before en (`je t’en coupe`).', 'Dans une phrase déclarative, te précède les (`je te les pose`) et t’ précède en (`je t’en coupe`).') }],
      ]),
      say('Si cette histoire t’inquiète, parle-m’en maintenant et ne la garde pas pour toi !', 'If this situation worries you, tell me about it now and don’t keep it to yourself!'),
      write(
        b('Write instructions and promises with double pronouns', 'Rédiger des consignes et réponses avec doubles pronoms'),
        b('Write 40 to 70 words as a short note to a flatmate or friend about preparing a surprise party or borrowing items. Include at least one affirmative imperative with two pronouns (e.g. Donne-le-moi / Envoie-les-lui), one negative imperative with pronouns, and one passé composé sentence with a preceding direct object agreement.', 'Écrivez 40 à 70 mots dans un mot laissé à un colocataire ou un ami pour préparer une surprise ou prêter des affaires. Incluez au moins un impératif affirmatif à deux pronoms, un impératif négatif avec pronoms, et un passé composé avec accord du COD placé avant.'),
        40,
        70,
        [
          b('Affirmative imperative with hyphenated pronoun order', 'Impératif affirmatif avec bon ordre et traits d’union'),
          b('Negative imperative with pronouns before the verb', 'Impératif négatif avec pronoms avant le verbe'),
          b('Correct past participle agreement with preceding direct object', 'Accord juste du participe passé avec le COD placé avant'),
        ],
        'Salut Léo ! Voici les guirlandes pour la fête de Maya : accroche-les dans le salon avant son retour, mais surtout ne lui en parle pas ! Pour sa lettre d’anniversaire, je l’ai déjà écrite et je l’ai posée sur ton bureau : lis-la et rends-la-moi ce soir avant le dîner.',
      ),
    ],
    [
      b('Affirmative imperative: pronouns go after with hyphens (`le/la/les` before `moi/toi/lui/leur`).', 'Impératif affirmatif : pronoms après le verbe avec traits d’union (`le/la/les` avant `moi/toi/lui/leur`).'),
      b('Before y or en, me/te stay m’/t’: Donne-m’en !', 'Devant y ou en, me/te redeviennent m’/t’ : Donne-m’en !'),
      b('Negative imperative returns to pre-verb order: Ne me le donne pas !', 'Impératif négatif : on revient à l’ordre normal devant le verbe : Ne me le donne pas !'),
    ],
    [
      ['une bande dessinée', b('a comic book', 'une histoire racontée en dessins')],
      ['une guirlande', b('string lights / garland', 'une décoration lumineuse ou en papier')],
      ['verser', b('to pour', 'faire couler un liquide')],
    ],
  ),
];

export default lessons;
