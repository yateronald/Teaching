import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'J’y vais, j’en prends deux, je pense à lui. The tiny pronouns y and en replace whole phrases and make your French flow naturally. This course builds complete mastery step by step: y for places and à + things, en for de + things and quantities (with numbers kept at the end), word order across every tense, and when to switch to à lui / à elle for people.',
    'J’y vais, j’en prends deux, je pense à lui. Les petits pronoms y et en évitent les répétitions et donnent tout de suite un rythme naturel à vos phrases. Ce cours détaille chaque emploi : y pour les lieux et à + chose, en pour de + chose et les quantités, la place dans chaque temps, et le passage à lui / elle pour les personnes.',
  ),
  outcomes: [
    b('Replace places and à + thing smoothly with y', 'Remplacer les lieux et « à + chose » avec y'),
    b('Use en for partitives, de + thing and numbers kept at the end', 'Employer en pour les partitifs, « de + chose » et les quantités précises'),
    b('Place en and y in negatives, futur proche, passé composé and imperatives', 'Placer en et y à la négation, au futur proche, au passé composé et à l’impératif'),
    b('Distinguish y vs en and use à lui / d’elle for people', 'Distinguer y et en, et employer à lui / d’elle pour les personnes'),
  ],
};

const C = 'gr-pronom-en-y-depth';

const lessons: Lesson[] = [
  lesson(C, 1, ['pronoun-y-places-and-a', 'pronom-y-lieux-et-a'],
    b('The pronoun y: places and à + thing', 'Le pronom y : lieux et « à + chose »'),
    b('Replace destinations, locations and verbs with à + thing in one compact syllable.', 'Remplacer un lieu ou un groupe introduit par à + chose avec le pronom y.'),
    [
      b('Use y for places introduced by à, en, dans, sur, chez, devant', 'Remplacer un lieu introduit par à, en, dans, sur, chez ou devant par y'),
      b('Use y for à + thing or idea (penser à, participer à, s’intéresser à)', 'Remplacer « à + chose / idée » par y après penser à, participer à, s’intéresser à'),
      b('Keep y out of phrases about people', 'Ne jamais employer y pour remplacer une personne'),
    ],
    13,
    [
      card(
        b('What y replaces: places and à + thing', 'Ce que remplace y : un lieu ou « à + chose »'),
        b(
          'The pronoun **y** ("there" / "about it" / "to it") replaces two main structures without repeating the noun: first, any **place** introduced by **à, au, aux, en, dans, sur, sous, chez**; second, **à + a thing or idea** after verbs like **penser à**, **réfléchir à**, **participer à** or **s’intéresser à**.\n\nPlaces replaced: **à Lyon, au bureau, en France, chez Paul**.\nVerbs with à + thing: **penser à, réfléchir à, participer à, s’habituer à**.\nEveryday idioms: **On y va !, Ça y est !, J’y réfléchis.**.',
          'Le pronom **y** remplace deux grands types de compléments : d’abord tout **lieu** introduit par **à, au, aux, en, dans, sur, sous, chez** ; ensuite **à + une chose ou une idée** après des verbes comme **penser à**, **réfléchir à**, **participer à** ou **s’intéresser à**.\n\nLieux remplacés : **à Lyon, au bureau, en France, chez Paul**.\nVerbes avec à + chose : **penser à, réfléchir à, participer à, s’habituer à**.\nExpressions courantes : **On y va !, Ça y est !, J’y réfléchis.**.',
        ),
        {
          ex: [
            ['Nous allons à Marseille vendredi, et nous y restons quatre jours.', 'We are going to Marseille on Friday, and we are staying there for four days.'],
            ['Tu penses à ton rendez-vous ? Oui, j’y pense depuis ce matin.', 'Are you thinking about your appointment? Yes, I’ve been thinking about it since this morning.'],
          ],
        },
      ),
      trap(
        b('Never use y for a person!', 'Jamais y pour une personne !'),
        b(
          'Wait before substituting **y** after **penser à** or **faire attention à**: is the object a **thing** or a **person**? Only **things and ideas** take **y** (**J’y pense** = I’m thinking about it). For a person, keep **à** and switch to a stressed pronoun (**Je pense à lui / à elle**).\n\nThing with y: **penser à l’examen → j’y pense, répondre à ce mail → j’y réponds**.\nPerson with stressed pronoun: **penser à Paul → je pense à lui, penser à Léa → je pense à elle**.',
          'Avant d’employer **y** après **penser à** ou **s’intéresser à**, vérifiez s’il s’agit d’une **chose** ou d’une **personne**. Seules les **choses et les idées** deviennent **y** (**J’y pense**). Pour une personne, gardez **à** + pronom tonique (**Je pense à lui / à elle**).\n\nChose avec y : **penser à l’examen → j’y pense, répondre à ce mail → j’y réponds**.\nPersonne avec pronom tonique : **penser à Paul → je pense à lui, penser à Léa → je pense à elle**.',
        ),
      ),
      mc(P.form, ['j’y travaille', 'je travaille y', 'j’en travaille', 'je lui travaille'], {
        fr: 'Tu connais bien ce quartier ? — Oui, ___ depuis cinq ans.',
      }),
      mc(P.form, ['j’y participe', 'j’en participe', 'je le participe', 'je lui participe'], {
        fr: 'Le marathon de dimanche ? Bien sûr, ___ chaque année !',
      }),
      gap(P.complete, 'Les clés sont sur l’étagère ? — Oui, elles ___ sont. Et tu réfléchis à ma proposition ? — Oui, j’___ réfléchis sérieusement.', [['y'], ['y']], {
        choices: [['y', 'en', 'les'], ['y', 'en', 'lui']],
      }),
      pairs(
        b('Match each question with the natural reply using y.', 'Associez chaque question à la réponse correcte avec y.'),
        [
          ['Tu vas au marché ?', 'Oui, j’y vais tout de suite.'],
          ['Ils habitent en Suisse ?', 'Oui, ils y habitent depuis mai.'],
          ['Tu t’habitues à ce rythme ?', 'Oui, je m’y habitue doucement.'],
          ['Vous jouez souvent au tennis ?', 'Oui, nous y jouons le samedi.'],
        ],
        true,
      ),
      ord(P.order, 'Mes parents habitent à Nantes et ils y sont très heureux.', {
        tr: 'My parents live in Nantes and they are very happy there.',
        extra: ['en', 'là-bas'],
      }),
      hear('La réunion commence dans dix minutes, on y va maintenant ?', b('What is the speaker suggesting?', 'Que propose la personne ?'), [
        b('Heading to the meeting right now', 'D’aller à la réunion dès maintenant'),
        b('Leaving the office after the meeting', 'De quitter le bureau après la réunion'),
        b('Postponing the meeting for ten minutes', 'De reporter la réunion de dix minutes'),
      ]),
      dict('C’est un projet passionnant et toute l’équipe y participe volontiers.'),
      say('Tu as répondu à son message ? Pas encore, j’y réponds ce soir.', 'Did you reply to his message? Not yet, I’m replying to it tonight.'),
    ],
    [
      b('y replaces places (à, en, dans, sur, chez) and à + thing/idea.', 'y remplace un lieu (à, en, dans, sur, chez) et « à + chose ou idée ».'),
      b('y goes right before the conjugated verb: j’y vais, j’y pense.', 'y se place juste avant le verbe conjugué : j’y vais, j’y pense.'),
      b('Never use y for people after penser à: use à lui / à elle.', 'N’employez jamais y pour une personne après penser à : dites à lui / à elle.'),
    ],
    [
      ['une étagère', b('a shelf', 'une planche fixée au mur pour ranger')],
      ['volontiers', b('gladly, willingly', 'avec plaisir')],
      ['ça y est !', b('that’s it! / all done!', 'c’est prêt, c’est fini !')],
    ],
  ),

  lesson(C, 2, ['pronoun-en-de-and-quantities', 'pronom-en-de-et-quantites'],
    b('The pronoun en: de + thing and quantities', 'Le pronom en : « de + chose » et quantités'),
    b('Replace du/de la/des, de + noun phrases, and keep numbers and quantifiers at the end.', 'Remplacer les partitifs et « de + chose » par en, et garder les chiffres ou quantités en fin de phrase.'),
    [
      b('Use en to replace partitive articles (du, de la, des) and de + thing', 'Employer en pour remplacer du, de la, des et « de + chose »'),
      b('Keep numbers and quantifiers (deux, beaucoup, un peu, un) at the end of the sentence', 'Maintenir les nombres et expressions de quantité à la fin de la phrase'),
      b('Drop the number in negative replies unless specifying', 'Adapter la quantité dans une phrase négative avec en'),
    ],
    13,
    [
      card(
        b('When to use en — and keep the number at the end', 'Quand employer en — et garder le nombre à la fin'),
        b(
          'Use **en** to replace **du, de la, de l’, des + noun** (some / any) and anything introduced by **de** after a verb or adjective (**parler de, avoir besoin de, avoir envie de, revenir de**). Whenever there is a **number** or **quantity word**, replace ONLY the noun with **en** and leave the number at the end!\n\nPartitives: **du pain, de l’eau, des pommes**.\nVerbs with de: **avoir besoin de, parler de, s’occuper de**.\nEnd quantities: **J’en prends deux, J’en ai beaucoup, J’en veux un peu**.',
          'Employez **en** pour remplacer **du, de la, de l’, des + nom** ainsi que tout complément introduit par **de** après un verbe ou un adjectif (**parler de, avoir besoin de, avoir envie de, revenir de**). S’il y a un **nombre** ou une **quantité**, remplacez seulement le nom par **en** et gardez le nombre à la fin !\n\nPartitifs : **du pain, de l’eau, des pommes**.\nVerbes avec de : **avoir besoin de, parler de, s’occuper de**.\nQuantités finales : **J’en prends deux, J’en ai beaucoup, J’en veux un peu**.',
        ),
        {
          table: {
            head: [b('Question / Context', 'Question / Contexte'), b('With en', 'Avec en'), b('Rule', 'Règle')],
            rows: [
              ['Tu veux du fromage ?', 'Oui, j’en veux bien.', b('en replaces du fromage', 'en remplace du fromage')],
              ['Tu as besoin de ce livre ?', 'Oui, j’en ai besoin.', b('en replaces de ce livre', 'en remplace de ce livre')],
              ['Vous avez des enfants ?', 'Oui, nous en avons deux.', b('keep the number at the end', 'gardez le chiffre à la fin')],
              ['Tu achètes un café ?', 'Oui, j’en achète un.', b('keep un/une in affirmative!', 'gardez un/une à l’affirmatif !')],
              ['Il reste des billets ?', 'Non, il n’en reste plus.', b('drop number in negative', 'pas de chiffre avec ne… plus')],
            ],
          },
          ex: [
            ['Combien de frères as-tu ? J’en ai trois.', 'How many brothers do you have? I have three.'],
            ['Ce dictionnaire est utile, j’en ai vraiment besoin.', 'This dictionary is useful, I really need it.'],
          ],
        },
      ),
      trap(
        b('Don’t forget un / une at the end of affirmative replies!', 'N’oubliez pas un / une à la fin de l’affirmatif !'),
        b(
          'If someone asks « Tu prends une pomme ? » or « Vous avez un stylo ? », saying just « Oui, j’en ai » sounds incomplete when referring to a single countable item—keep **un** or **une** at the end: **Oui, j’en ai un.** In the negative, drop it: **Non, je n’en ai pas.**\n\nAffirmative singular: **J’en veux un, J’en prends une, J’en vois trois**.\nNegative replies: **Je n’en ai pas, Je n’en veux plus, Il n’en reste aucun**.',
          'À la question « Tu prends une pomme ? » ou « Vous avez un stylo ? », on garde **un** ou **une** à la fin de la réponse affirmative : **Oui, j’en ai un.** Au négatif, l’article disparaît : **Non, je n’en ai pas.**\n\nSingulier affirmatif : **J’en veux un, J’en prends une, J’en vois trois**.\nRéponses négatives : **Je n’en ai pas, Je n’en veux plus, Il n’en reste aucun**.',
        ),
      ),
      mc(P.form, ['j’en ai besoin', 'j’y ai besoin', 'je l’ai besoin', 'j’ai besoin en'], {
        fr: 'Tu peux me prêter ta règle ? Moi, ___ pour finir ce dessin.',
      }),
      mc(P.form, ['J’en prends quatre.', 'Je prends quatre.', 'J’en prends.', 'J’y prends quatre.'], {
        fr: 'Combien de croissants voulez-vous ce matin ? — ___',
      }),
      gap(P.complete, 'Tu reviens de la poste ? — Oui, j’___ viens. Tu as acheté des timbres ? — Oui, j’___ ai acheté dix, mais il n’___ reste déjà plus beaucoup !', [['en'], ['en'], ['en']], {
        choices: [['en', 'y', 'la'], ['en', 'les', 'y'], ['en', 'y', 'les']],
      }),
      ord(P.order, 'J’ai beaucoup de livres et j’en lis un chaque semaine.', {
        tr: 'I have a lot of books and I read one every week.',
        extra: ['le', 'y'],
      }),
      pairs(
        b('Match each question with the matching reply using en.', 'Associez chaque question à la bonne réponse avec en.'),
        [
          ['Tu bois du thé vert ?', 'Oui, j’en bois tous les matins.'],
          ['Vous avez combien de valises ?', 'Nous en avons deux.'],
          ['Elle s’occupe du dossier ?', 'Oui, elle s’en occupe aujourd’hui.'],
          ['Tu as une gomme ?', 'Oui, j’en ai une dans ma trousse.'],
        ],
        true,
      ),
      hear('Des places pour le concert de samedi ? Il en reste seulement deux au premier rang.', b('How many seats are left?', 'Combien de places reste-t-il ?'), [
        b('Only two seats left in the front row', 'Il reste seulement deux places au premier rang'),
        b('No seats left at all', 'Il ne reste aucune place'),
        b('Ten seats left at the back', 'Il reste dix places au fond'),
      ]),
      dict('Nous avons cueilli des cerises ce matin et nous en avons mangé beaucoup.'),
      say('Tu as envie d’un café ? Oui, j’en prendrais volontiers un petit !', 'Do you feel like a coffee? Yes, I’d gladly have a small one!'),
    ],
    [
      b('en replaces du/de la/des + noun and de + thing/place.', 'en remplace du/de la/des + nom et « de + chose ou lieu ».'),
      b('Keep numbers, un/une, and quantifiers (beaucoup, peu, trop) at the end in affirmatives.', 'Gardez les nombres, un/une et les quantités (beaucoup, peu, trop) à la fin à l’affirmatif.'),
      b('In negatives, drop the article/number: Je n’en ai pas / Il n’en reste plus.', 'À la négation, pas d’article : Je n’en ai pas / Il n’en reste plus.'),
    ],
    [
      ['un timbre', b('a postage stamp', 'une petite vignette collée sur une lettre')],
      ['cueillir', b('to pick (fruit/flowers)', 'récolter à la main')],
      ['une trousse', b('a pencil case', 'un petit étui pour stylos')],
    ],
  ),

  lesson(C, 3, ['en-y-placement-tenses', 'place-de-en-et-y'],
    b('Where en and y go across every tense', 'La place de en et y à tous les temps'),
    b('Negative, futur proche, passé composé and imperative: master exact pronoun placement.', 'Négation, futur proche, passé composé et impératif : placez en et y sans hésitation.'),
    [
      b('Place en and y inside ne… pas and before infinitives in futur proche', 'Placer en et y dans ne… pas et devant l’infinitif au futur proche'),
      b('Place en and y before the auxiliary in passé composé without agreeing en', 'Placer en et y devant l’auxiliaire au passé composé sans accorder après en'),
      b('Use the restored -s in affirmative imperatives: Vas-y ! Prends-en !', 'Ajouter le -s euphonique à l’impératif affirmatif : Vas-y ! Prends-en !'),
    ],
    13,
    [
      card(
        b('Four tenses, one simple rule', 'Quatre structures, une règle claire'),
        b(
          'In simple tenses and the **passé composé**, **en** and **y** sit **right before the conjugated verb** (the auxiliary in passé composé), wrapped inside **ne … pas**. When there is an **infinitive** (`aller, vouloir, pouvoir, devoir`), they jump right before that **infinitive**.\n\nPresent negative: **Je n’y vais pas, Je n’en veux plus**.\nWith infinitive: **Je vais y aller, Tu peux en prendre**.\nPassé composé: **J’y suis allé, J’en ai acheté**.',
          'Aux temps simples et au **passé composé**, **en** et **y** se placent **juste avant le verbe conjugué** (ou l’auxiliaire), à l’intérieur de **ne … pas**. Devant un **infinitif** (`aller, vouloir, pouvoir, devoir`), ils se placent juste avant cet **infinitif**.\n\nPrésent négatif : **Je n’y vais pas, Je n’en veux plus**.\nAvec infinitif : **Je vais y aller, Tu peux en prendre**.\nPassé composé : **J’y suis allé, J’en ai acheté**.',
        ),
        {
          table: {
            head: [b('Tense / Form', 'Temps / Forme'), b('With y', 'Avec y'), b('With en', 'Avec en')],
            rows: [
              [b('Present', 'Présent'), 'J’y pense.', 'J’en prends.'],
              [b('Negative', 'Négation'), 'Je n’y pense pas.', 'Je n’en prends pas.'],
              [b('Infinitive / futur proche', 'Infinitif / futur proche'), 'Je vais y aller.', 'Tu peux en prendre.'],
              [b('Passé composé', 'Passé composé'), 'J’y suis allé(e).', 'Nous en avons acheté.'],
              [b('Imperative + / -', 'Impératif + / -'), 'Vas-y ! / N’y va pas !', 'Manges-en ! / N’en mange pas !'],
            ],
          },
          ex: [
            ['Nous n’avons pas encore eu le temps d’y aller.', 'We haven’t had time to go there yet.'],
            ['Ces fraises sont excellentes, prends-en encore !', 'These strawberries are excellent, have some more!'],
          ],
        },
      ),
      trap(
        b('Two classic traps: Vas-y! and passé composé with en', 'Deux pièges : Vas-y ! et le passé composé avec en'),
        b(
          'First, in an **affirmative imperative**, **va** and **-er** verbs (`mange, donne, achète`) recover a linking **-s** before **y** and **en**: **Vas-y !**, **Manges-en !**, **Parles-en !** (not « Va-y »). In the negative imperative, drop the -s and move the pronoun back in front: **N’y va pas !**. Second, after **en** in the **passé composé**, the past participle stays invariable: **Des pommes ? J’en ai acheté trois** (never « achetées »).\n\nAffirmative imperative: **Vas-y !, Prends-en !, Penses-y !**.\nNegative imperative: **N’y va pas !, N’en prends pas !, N’y pense plus !**.',
          'D’abord, à l’**impératif affirmatif**, **va** et les verbes en **-er** (`mange, donne, achète`) retrouvent un **-s** devant **y** et **en** : **Vas-y !**, **Manges-en !**, **Parles-en !** Au négatif, le -s disparaît : **N’y va pas !** Ensuite, avec **en** au **passé composé**, le participe passé reste invariable : **Des pommes ? J’en ai acheté trois**.\n\nImpératif affirmatif : **Vas-y !, Prends-en !, Penses-y !**.\nImpératif négatif : **N’y va pas !, N’en prends pas !, N’y pense plus !**.',
        ),
      ),
      mc(P.form, ['va y aller', 'y va aller', 'va aller y', 'vas-y aller'], {
        fr: 'Le musée ferme à dix-huit heures, donc Zoé ___ tout de suite.',
      }),
      mc(P.spelling, ['Vas-y', 'Va-y', 'Vasy', 'Y va'], {
        fr: '___ sans moi, je te rejoins dans dix minutes !',
      }),
      gap(P.complete, 'Tu es déjà allé à Lisbonne ? — Oui, j’___ suis ___ (aller) l’été dernier, et j’___ ai ___ (garder) un souvenir magnifique.', [['y'], ['allé'], ['en'], ['gardé']], {
        choices: [['y', 'en'], ['allé', 'allée'], ['en', 'y'], ['gardé', 'gardés']],
        hint: b('Keep gardé invariable after en!', 'Gardez gardé invariable après en !'),
      }),
      ord(P.order, 'Je ne veux pas en parler devant tout le monde.', {
        tr: 'I don’t want to talk about it in front of everyone.',
        extra: ['y'],
      }),
      sort(
        b('Sort by pronoun position.', 'Classez selon la place du pronom.'),
        [b('Before the auxiliary or conjugated verb', 'Avant l’auxiliaire ou le verbe conjugué'), b('Before an infinitive or after an affirmative imperative', 'Avant l’infinitif ou après l’impératif affirmatif')],
        [['J’y suis allé.', 0], ['Tu vas en prendre.', 1], ['Vas-y !', 1], ['Je n’en veux pas.', 0], ['Je peux y penser.', 1], ['Nous en avons vu deux.', 0]],
      ),
      hear('Ces gâteaux sont délicieux : goûtes-en un, mais n’en mange pas dix !', b('What does the speaker tell the listener?', 'Que dit la personne ?'), [
        b('Try one cake, but don’t eat ten', 'Goûter un gâteau, mais ne pas en manger dix'),
        b('Put all ten cakes in the fridge', 'Mettre les dix gâteaux au réfrigérateur'),
        b('Don’t touch any of the cakes', 'Ne toucher à aucun gâteau'),
      ]),
      dict('Nous n’avons pas pu y aller hier, mais nous allons en reparler demain.'),
      say('Tu veux encore de la soupe ? Servez-vous, prenez-en autant que vous voulez !', 'Would you like some more soup? Help yourself, take as much as you want!'),
    ],
    [
      b('With an infinitive, en/y sit right before the infinitive: Je vais y aller, Tu peux en prendre.', 'Avec un infinitif, en/y se placent juste avant l’infinitif : Je vais y aller, Tu peux en prendre.'),
      b('In passé composé, en/y sit before the auxiliary, and en causes NO past participle agreement.', 'Au passé composé, en/y précèdent l’auxiliaire, et en n’entraîne pas d’accord du participe.'),
      b('Affirmative imperative adds -s to -er verbs and aller: Vas-y ! Manges-en !', 'L’impératif affirmatif ajoute un -s aux verbes en -er et à aller : Vas-y ! Manges-en !'),
    ],
    [
      ['rejoindre quelqu’un', b('to meet up with someone', 'retrouver quelqu’un à un endroit')],
      ['garder un souvenir', b('to keep a memory', 'se rappeler avec plaisir')],
      ['autant que', b('as much / as many as', 'dans la même quantité que')],
    ],
  ),

  lesson(C, 4, ['y-vs-en-and-people', 'y-ou-en-et-personnes'],
    b('Choosing between y, en, and stressed pronouns for people', 'Choisir entre y, en et les pronoms pour les personnes'),
    b('Master the y vs en contrast, il y en a, and à lui / d’elle when referring to people.', 'Distinguer y et en dans le même contexte, employer il y en a et parler des personnes avec à lui / d’elle.'),
    [
      b('Contrast y (à + place/thing) and en (de + place/thing/quantity) reliably', 'Distinguer avec sûreté y (à + lieu/chose) et en (de + lieu/chose/quantité)'),
      b('Use il y en a / il n’y en a plus naturally', 'Employer il y en a / il n’y en a plus avec aisance'),
      b('Switch to à lui / à elle / d’eux when a preposition introduces a person', 'Employer à lui / à elle / d’eux quand la préposition introduit une personne'),
    ],
    13,
    [
      card(
        b('Y vs en — and what to do for people', 'Y contre en — et le cas des personnes'),
        b(
          'Look at the preposition before the noun you want to replace: **à / en / dans / chez** + place or thing → **y**; **de / du / de la / des** + place, thing or quantity → **en**. When combining **il y a** with a partitive or quantity, keep both: **il y en a** ("there is/are some").\n\nContrast places: **J’y vais (to Paris) · J’en viens (from Paris)**.\nWith il y a: **Il y en a · Il n’y en a pas · Combien y en a-t-il ?**.',
          'Observez la préposition : **à / en / dans / chez** + lieu ou chose → **y** ; **de / du / de la / des** + lieu, chose ou quantité → **en**. Avec **il y a** suivi d’un partitif ou d’une quantité, on garde les deux : **il y en a**.\n\nContraste de lieu : **J’y vais (à Paris) · J’en viens (de Paris)**.\nAvec il y a : **Il y en a · Il n’y en a pas · Combien y en a-t-il ?**.',
        ),
        {
          table: {
            head: [b('Original phrase', 'Phrase de départ'), b('Replacement', 'Remplacement'), b('Why', 'Pourquoi')],
            rows: [
              ['Je vais à la gare.', 'J’y vais.', b('à + place → y', 'à + lieu → y')],
              ['Je viens de la gare.', 'J’en viens.', b('de + place → en', 'de + lieu → en')],
              ['Je pense à ce projet.', 'J’y pense.', b('à + thing → y', 'à + chose → y')],
              ['Je pense à ma sœur.', 'Je pense à elle.', b('à + person → à + stressed pronoun', 'à + personne → à + pronom tonique')],
              ['Je m’occupe de mes neveux.', 'Je m’occupe d’eux.', b('de + person → de + stressed pronoun', 'de + personne → de + pronom tonique')],
            ],
          },
          ex: [
            ['Il y a du jus d’orange dans le frigo ? Oui, il y en a une bouteille.', 'Is there orange juice in the fridge? Yes, there is one bottle.'],
            ['Mon grand-père est loin, mais je pense souvent à lui.', 'My grandfather is far away, but I often think of him.'],
          ],
        },
      ),
      tip(
        b('Exception: counted people can take en!', 'Nuance utile : les personnes comptées prennent en !'),
        b(
          'Although **y** NEVER refers to a person, **en** CAN replace a plural/counted noun referring to people when you give a **number** or **quantity**: « Tu as des collègues à Lyon ? — Oui, **j’en ai trois**. » Without a number after **de**, stick to stressed pronouns: **Je parle d’elle / Je m’occupe de lui**.\n\nCounted people: **J’en ai deux, J’en connais beaucoup, Il y en a cinq**.\nSpecific person: **à lui, à elle, d’eux, d’elles**.',
          'Si **y** ne s’emploie JAMAIS pour une personne, **en** peut remplacer des personnes quand on exprime une **quantité** ou un **nombre** : « Tu as des collègues à Lyon ? — Oui, **j’en ai trois**. » Pour une personne précise après **à** ou **de**, utilisez le pronom tonique : **Je parle d’elle / Je m’occupe de lui**.\n\nQuantité de personnes : **J’en ai deux, J’en connais beaucoup, Il y en a cinq**.\nPersonne précise : **à lui, à elle, d’eux, d’elles**.',
        ),
      ),
      mc(P.form, ['à lui', 'y', 'en', 'lui'], {
        fr: 'Mon frère habite à Québec ; je pense très souvent ___.',
        explain: b('Penser à + person requires à + stressed pronoun (à lui), never y.', 'Penser à + personne demande à + pronom tonique (à lui), jamais y.'),
      }),
      mc(P.form, ['il y en a', 'il y a en', 'il en y a', 'il y a'], {
        fr: 'Des places libres dans ce wagon ? Oui, ___ encore plusieurs au fond.',
      }),
      gap(P.complete, 'Tu vas au marché ? — Oui, j’___ vais, mais je reviens à midi : j’___ reviens avec des fruits. Et ton amie Claire ? — Je m’occupe ___ (d’elle) cet après-midi.', [['y'], ['en'], ['d’elle']], {
        choices: [['y', 'en'], ['en', 'y'], ['d’elle', 'd’en', 'y']],
      }),
      sort(
        b('Choose y, en, or stressed pronoun (à lui / d’elle).', 'Choisissez y, en ou un pronom tonique (à lui / d’elle).'),
        [b('Use y', 'Employer y'), b('Use en', 'Employer en'), b('Use à lui / à elle / d’eux', 'Employer à lui / à elle / d’eux')],
        [['aller à la piscine', 0], ['revenir de la plage', 1], ['penser à son père', 2], ['penser à ses vacances', 0], ['avoir trois cousins', 1], ['s’occuper de sa mère', 2]],
      ),
      hear('— Il reste des places pour l’atelier ? — Non, il n’y en a plus, mais vous pouvez vous inscrire sur la liste d’attente, je vous y ajoute tout de suite.', b('What can the caller do?', 'Que peut faire la personne qui appelle ?'), [
        b('Join the waiting list because no spots are left', 'S’inscrire sur la liste d’attente car il n’y a plus de places'),
        b('Book two spots right away', 'Réserver deux places tout de suite'),
        b('Come back next month without registering', 'Revenir le mois prochain sans s’inscrire'),
      ]),
      dlg(b('At the bakery and on the phone', 'À la boulangerie et au téléphone'), b('Léo buys pastries and checks on his sister.', 'Léo achète des pâtisseries et parle de sa sœur avec la vendeuse.'), [['Léo', 'm'], ['Vendeuse', 'f']], [
        [0, 'Bonjour ! Il reste des tartelettes aux framboises ?', 'Hello! Do you have any raspberry tartlets left?'],
        [1, { options: ['Oui, il y en a encore quatre en vitrine ! Vous en voulez combien ?', 'Oui, il y a encore quatre en vitrine ! Vous y voulez combien ?', 'Oui, il en y a encore quatre en vitrine ! Vous voulez combien ?'], explain: b('Il y en a combines il y a + en for remaining items.', 'Il y en a combine il y a et en pour une quantité restante.') }],
        [0, 'J’en prends trois, s’il vous plaît. C’est pour ma sœur : je pense à elle, elle adore ça.', 'I’ll take three, please. They’re for my sister: I’m thinking of her, she loves them.'],
        [1, 'C’est gentil ! Et vous habitez dans le quartier ?', 'That’s kind! And do you live in the neighbourhood?'],
        [0, { options: ['Oui, j’y habite juste au coin, et je passe devant tous les matins.', 'Oui, j’en habite juste au coin, et je passe devant tous les matins.', 'Oui, j’habite à lui juste au coin, et je passe devant tous les matins.'], explain: b('Dans le quartier is a place → y.', 'Dans le quartier est un lieu → y.') }],
      ]),
      say('Des idées pour son anniversaire ? Oui, j’en ai déjà trois, et je vais y réfléchir ce soir.', 'Ideas for her birthday? Yes, I already have three, and I’ll think about it tonight.'),
      write(
        b('Write a short message about a place, supplies and a friend', 'Rédiger un message avec y, en et un pronom tonique'),
        b('Write 40 to 70 words to a friend about going to a market, a shop or a party. Include at least two uses of y (place or à + thing), two uses of en (including one quantity/number), one il y en a / il n’y en a plus, and one à lui / à elle / d’elle for a person.', 'Écrivez 40 à 70 mots à un ami à propos d’un marché, d’une boutique ou d’une fête. Incluez au moins deux emplois de y (lieu ou à + chose), deux de en (dont une quantité chiffrée), un il y en a / il n’y en a plus, et un à lui / à elle / d’elle pour une personne.'),
        40,
        70,
        [
          b('At least two correct uses of y and two of en', 'Au moins deux emplois justes de y et deux de en'),
          b('One il y en a or il n’y en a plus', 'Un il y en a ou il n’y en a plus'),
          b('Stressed pronoun after à or de for a person', 'Pronom tonique après à ou de pour une personne'),
        ],
        'Salut ! Je viens de passer au marché : j’y vais chaque samedi matin. Je voulais des fraises, mais il n’y en avait plus beaucoup, alors j’en ai pris seulement deux barquettes. J’ai pensé à ma sœur en voyant des pivoines : elle adore ces fleurs, donc j’en ai acheté un bouquet pour elle !',
      ),
    ],
    [
      b('Use y for à/dans/chez + place or thing; en for de + place/thing or quantities.', 'Employez y pour à/dans/chez + lieu/chose ; en pour de + lieu/chose ou les quantités.'),
      b('Combine il y a + en into il y en a / il n’y en a plus.', 'Combinez il y a + en en il y en a / il n’y en a plus.'),
      b('For specific people after à or de, use stressed pronouns: je pense à lui, je parle d’elle.', 'Pour une personne précise après à ou de, employez un pronom tonique : je pense à lui, je parle d’elle.'),
    ],
    [
      ['une barquette', b('a punnet / small tray', 'une petite boîte pour fruits rouges')],
      ['la liste d’attente', b('the waiting list', 'la liste des personnes en attente d’une place')],
      ['au coin de la rue', b('at the street corner', 'là où deux rues se croisent')],
    ],
  ),
];

export default lessons;
