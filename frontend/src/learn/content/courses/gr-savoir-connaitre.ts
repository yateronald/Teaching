import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, conj, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Two French verbs translate “to know”—and choosing the right one depends entirely on what follows. Master savoir with clauses, question words, and skills; master connaître with people, places, and works; and discover how their meaning shifts sharply in the passé composé (j’ai su vs. j’ai connu).',
    'Deux verbes français traduisent « to know », et tout dépend de ce qui suit. Maîtrisez savoir avec les propositions, mots interrogatifs et savoir-faire ; maîtrisez connaître avec les personnes, lieux et œuvres ; et découvrez comment leur sens change au passé composé (j’ai su vs j’ai connu).',
  ),
  outcomes: [
    b('Use savoir before que, si, question words, and infinitives', 'Employer savoir devant que, si, un mot interrogatif et un infinitif'),
    b('Use connaître exclusively with nouns and object pronouns (people, places, works)', 'Employer connaître uniquement avec des noms ou pronoms compléments'),
    b('Contrast j’ai su (found out) and j’ai connu (met / experienced) against je savais / je connaissais', 'Distinguer j’ai su (apprendre une nouvelle) et j’ai connu (rencontrer / vivre) de l’imparfait'),
  ],
};

const C = 'gr-savoir-connaitre';
const PRESENT = b('présent', 'présent');

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['savoir-facts-clauses-skills', 'savoir-faits-propositions-et-savoir-faire'],
    b('Savoir: facts, clauses & skills', 'Savoir : faits, propositions et savoir-faire'),
    b('Pair savoir with que, si, question words, or an infinitive to talk about information and learned abilities.', 'Associez savoir à que, si, un mot interrogatif ou un infinitif pour parler de faits connus et de savoir-faire.'),
    [
      b('Conjugate savoir accurately in the present tense', 'Conjuguer savoir au présent sans faute'),
      b('Combine savoir with que, si/s’il, and question words (où, quand, comment)', 'Construire savoir avec que, si/s’il et les mots interrogatifs'),
      b('Express learned skills with savoir + infinitive', 'Exprimer un savoir-faire avec savoir + infinitif'),
    ],
    13,
    [
      card(
        b('When to use savoir', 'Quand employer savoir'),
        b(
          'Use **savoir** for **information** you know in your head and **skills** you learned how to do. Grammar gives an easy signal: **savoir** is almost always followed by **que**, **si** (*whether*), a **question word** (*où, quand, comment, pourquoi*), or an **infinitive** (*savoir nager*)—plus short fact nouns like *savoir la vérité*, *savoir son numéro*, or *le savoir*.\nAfter savoir: **savoir + que, savoir + si, savoir + infinitif**.',
          'Employez **savoir** pour les **informations** apprises et les **compétences**. La grammaire donne un repère clair : **savoir** est presque toujours suivi de **que**, **si**, d’un **mot interrogatif** (*où, quand, comment, pourquoi*) ou d’un **infinitif** (*savoir nager*)—ainsi que de noms de faits comme *la réponse*, *la date*, ou *le savoir*.\nConstructions avec savoir : **savoir + que, savoir + si, savoir + infinitif**.',
        ),
        {
          table: {
            head: [b('Pattern', 'Structure'), b('Use', 'Emploi'), b('Example', 'Exemple')],
            rows: [
              ['savoir + que / qu’', b('know a fact', 'savoir un fait'), 'Je sais qu’il arrive à midi.'],
              ['savoir + si / s’il', b('know whether', 'savoir si oui ou non'), 'Tu sais s’il pleut dehors ?'],
              ['savoir + où / comment…', b('know where / how…', 'mot interrogatif'), 'Elle sait comment réparer ça.'],
              ['savoir + infinitive', b('know how to', 'savoir-faire'), 'Nous savons parler italien.'],
            ],
          },
          ex: [
            ['Je sais qu’elle travaille à Bordeaux cette année.', 'I know that she is working in Bordeaux this year.'],
            ['Est-ce que vous savez où se trouve la sortie ?', 'Do you know where the exit is?'],
            ['Mon petit frère sait déjà lire et écrire.', 'My little brother already knows how to read and write.'],
          ],
        },
      ),
      tip(
        b('Never use savoir for a person or a city', 'Jamais savoir pour une personne ou une ville'),
        b(
          'You can know **where** a city is (*Je sais où est Lyon*), or **who** someone is (*Je sais qui c’est*), because a question word follows *savoir*. But you can NEVER say *Je sais Lyon* or *Je sais Paul*—people and places always require **connaître**.\nSavoir needs: **que, si, qui/où/quand, un infinitif**.',
          'On peut dire *Je sais où est Lyon* ou *Je sais qui c’est*, car un mot interrogatif suit *savoir*. En revanche, on ne dit JAMAIS *Je sais Lyon* ni *Je sais Paul* : pour une personne ou un lieu seul, il faut **connaître**.\nSavoir demande : **que, si, qui/où/quand, un infinitif**.',
        ),
      ),
      conj('savoir', PRESENT, [['je', 'sais'], ['tu', 'sais'], ['il / elle', 'sait'], ['nous', 'savons'], ['vous', 'savez'], ['ils / elles', 'savent']], { given: [0, 3] }),
      mc(
        P.form,
        ['savent', 'savons', 'sait', 'connaissent'],
        {
          fr: 'Mes collègues ___ que la réunion commence plus tôt aujourd’hui.',
          explain: b('Before a que clause, use savoir; with ils/mes collègues, the form is savent.', 'Devant une proposition en que, on emploie savoir ; avec mes collègues, la forme est savent.'),
        },
      ),
      hear(
        'Je ne sais pas s’il reste encore des places pour ce soir.',
        b('What does the speaker not know?', 'Qu’est-ce que la personne ignore ?'),
        [
          b('Whether any seats are still left for tonight', 'S’il reste des places pour ce soir'),
          b('How much the tickets cost', 'Combien coûtent les billets'),
          b('Where the theater entrance is located', 'Où se trouve l’entrée de la salle'),
        ],
      ),
      gap(
        P.complete,
        'Tu ___ (savoir) ___ le magasin ouvre le dimanche ? — Non, mais je ___ (savoir) ___ est fermé le lundi, et ma sœur ___ (savoir) parler au gérant.',
        [['sais'], ['si'], ['sais'], ['qu’il'], ['sait']],
        {
          choices: [
            ['sais', 'sait', 'connais'],
            ['si', 'que', 'qui'],
            ['sais', 'savez', 'savent'],
            ['qu’il', 'si', 'où'],
            ['sait', 'sais', 'savent'],
          ],
        },
      ),
      ord(
        P.order,
        'Je ne sais pas s’il vient avec nous demain.',
        {
          tr: 'I do not know if he is coming with us tomorrow.',
          extra: ['connais'],
        },
      ),
      dict('Vous savez comment changer le mot de passe du réseau ?'),
      say('Nous savons déjà cuisiner ce plat sans recette.', 'We already know how to cook this dish without a recipe.'),
    ],
    [
      b('savoir pairs with que, si/s’il, question words, and infinitives.', 'savoir s’emploie avec que, si/s’il, les mots interrogatifs et les infinitifs.'),
      b('Watch the singular stem sai- (je sais, tu sais, il sait) vs. plural sav- (nous savons).', 'Attention au radical sai- au singulier et sav- au pluriel.'),
      b('Never follow savoir directly with a person or place noun.', 'Ne faites jamais suivre savoir directement d’une personne ou d’un lieu.'),
    ],
    [
      ['la vérité', b('truth', 'ce qui est réel, pas un mensonge')],
      ['le mot de passe', b('password', 'code secret pour se connecter')],
      ['la recette', b('recipe', 'instructions pour cuisiner un plat')],
      ['le gérant', b('manager', 'responsable d’un magasin ou café')],
    ],
  ),

  lesson(
    C,
    2,
    ['connaitre-people-places-things', 'connaitre-personnes-lieux-et-oeuvres'],
    b('Connaître: people, places & works', 'Connaître : personnes, lieux et œuvres'),
    b('Use connaître with any noun you are familiar with—and learn the subtle boundary between knowing a fact and being acquainted with a topic.', 'Employez connaître avec tout nom qui vous est familier—et saisissez la nuance entre savoir un fait et connaître un sujet.'),
    [
      b('Conjugate connaître accurately (keeping the î before t)', 'Conjuguer connaître avec justesse (avec î devant t)'),
      b('Use connaître exclusively with nouns and object pronouns', 'Employer connaître uniquement avec des noms ou pronoms compléments'),
      b('Tell savoir une information from connaître un domaine ou un lieu', 'Distinguer savoir une information précise de connaître un lieu ou un domaine'),
    ],
    13,
    [
      card(
        b('Connaître + noun', 'Connaître + nom'),
        b(
          '**Connaître** means “to be familiar with / acquainted with” and **ALWAYS takes a noun** (or an object pronoun like *le, la, les*). Use it for **people** (*Je connais Léa*), **places** (*Tu connais Marseille ?*), **books, films, music**, and **fields of study** (*Elle connaît l’histoire*). Notice the **î** before **t** in *il/elle connaît*.\nAfter connaître: **une personne, une ville, un film, un livre**.',
          '**Connaître** exprime la familiarité ou la fréquentation et est **TOUJOURS suivi d’un nom** (ou d’un pronom complément *le, la, les*). Employez-le pour les **personnes** (*Je connais Léa*), les **lieux** (*Tu connais Marseille ?*), les **œuvres** et les **domaines** (*Elle connaît l’histoire*). Notez le **î** devant **t** dans *il/elle connaît*.\nCompléments de connaître : **une personne, une ville, un film, un livre**.',
        ),
        {
          table: {
            head: [b('Verb', 'Verbe'), b('Grammatical complement', 'Complément grammatical'), b('Example', 'Exemple')],
            rows: [
              ['connaître', b('person / place / thing noun', 'nom (personne, lieu, œuvre)'), 'Nous connaissons bien ce quartier.'],
              ['connaître', b('object pronoun (le, la, les)', 'pronom complément'), 'Ce chanteur ? Oui, je le connais !'],
              ['savoir', b('clause / question / infinitive', 'proposition / question / infinitif'), 'Je sais où habite ce chanteur.'],
            ],
          },
          ex: [
            ['Vous connaissez un bon restaurant près de la gare ?', 'Do you know a good restaurant near the station?'],
            ['Mon père connaît tous les musées de la ville.', 'My father knows all the museums in the city.'],
            ['Je connais cette chanson, mais je ne sais pas qui la chante.', 'I know this song, but I do not know who sings it.'],
          ],
        },
      ),
      trap(
        b('Never follow connaître with que or an infinitive', 'Jamais connaître devant que ou un infinitif'),
        b(
          'Even if a noun appears, check the nuance: **savoir** covers memorized/exact facts (*Je sais son numéro de téléphone*, *Je sais l’heure*), whereas **connaître** means familiarity (*Je connais bien son numéro*, or *Je connais son adresse* = familiar with the area). And **never** write *Je connais qu’il vient* or *Je connais nager*!\nWrong with connaître: **connaître que, connaître si, connaître + infinitif**.',
          'Même devant un nom, observez la nuance : **savoir** porte sur un fait précis appris par cœur (*Je sais la réponse*, *Je sais l’heure*), alors que **connaître** indique une familiarité (*Je connais bien ce quartier*, *Je connais ce roman*). Et n’écrivez **jamais** *Je connais qu’il vient* ou *Je connais nager* !\nÀ éviter : **connaître que, connaître si, connaître + infinitif**.',
        ),
      ),
      conj('connaître', PRESENT, [['je', 'connais'], ['tu', 'connais'], ['il / elle', 'connaît'], ['nous', 'connaissons'], ['vous', 'connaissez'], ['ils / elles', 'connaissent']], { given: [0, 3] }),
      mc(
        P.word,
        ['connaissons', 'savons', 'connaissez', 'savent'],
        {
          fr: 'Ma femme et moi, nous ___ très bien le sud de la France.',
          explain: b('Le sud de la France is a place noun → connaître (nous connaissons).', 'Le sud de la France est un lieu : on emploie connaître (nous connaissons).'),
        },
      ),
      mc(
        b('Choose the sentence that combines connaître and savoir accurately.', 'Choisissez la phrase qui associe connaître et savoir sans erreur.'),
        [
          'Je connais bien ce livre, mais je ne sais pas quand l’auteur l’a écrit.',
          'Je sais bien ce livre, mais je ne connais pas quand l’auteur l’a écrit.',
          'Je connais bien ce livre, mais je ne connais pas qui l’a écrit.',
          'Je sais bien ce livre, mais je ne sais pas l’auteur.',
        ],
      ),
      pairs(
        b('Match each verb start with the complement that fits its grammar.', 'Associez chaque début de phrase au complément qui respecte la grammaire.'),
        [
          ['Je connais', 'ce réalisateur canadien.'],
          ['Je sais', 'qu’il tourne un nouveau film.'],
          ['Tu connais', 'le chemin jusqu’au port ?'],
          ['Tu sais', 'où se trouve le port ?'],
        ],
        true,
      ),
      sort(
        b('Does each complement follow savoir or connaître?', 'Chaque complément suit-il savoir ou connaître ?'),
        ['savoir', 'connaître'],
        [
          ['jouer du violon', 0],
          ['ce quartier calme', 1],
          ['qu’il arrive demain', 0],
          ['mes deux voisins', 1],
          ['pourquoi elle part', 0],
          ['la cuisine japonaise', 1],
        ],
      ),
      gap(
        P.complete,
        'Est-ce que tu ___ (connaître) ma cousine Claire ? — Oui, je la ___ très bien, et je ___ (savoir) ___ déménage à Nantes.',
        [['connais'], ['connais'], ['sais'], ['qu’elle']],
        {
          choices: [
            ['connais', 'sais', 'connaît'],
            ['connais', 'sais', 'connaissons'],
            ['sais', 'connais', 'sait'],
            ['qu’elle', 'si', 'qui'],
          ],
        },
      ),
      dict('Il connaît bien cet auteur, mais il ne sait pas le titre du dernier roman.'),
    ],
    [
      b('connaître is always followed by a noun or object pronoun (person, place, book, topic).', 'connaître est toujours suivi d’un nom ou d’un pronom complément (personne, lieu, œuvre, domaine).'),
      b('Never use connaître before que, si, question words, or an infinitive.', 'N’utilisez jamais connaître devant que, si, un mot interrogatif ou un infinitif.'),
      b('Keep the circumflex on il/elle connaît and on the infinitive connaître.', 'Gardez l’accent circonflexe sur il/elle connaît et à l’infinitif connaître.'),
    ],
    [
      ['le réalisateur', b('film director', 'personne qui réalise un film')],
      ['le chemin', b('way / path', 'route pour aller quelque part')],
      ['le violon', b('violin', 'instrument à cordes')],
      ['le titre', b('title', 'nom d’un livre ou d’un film')],
    ],
  ),

  lesson(
    C,
    3,
    ['past-tense-jai-su-vs-jai-connu', 'passe-compose-j-ai-su-et-j-ai-connu'],
    b('In the past: j’ai su vs. j’ai connu', 'Au passé : j’ai su vs j’ai connu'),
    b('Understand why savoir and connaître shift meaning in the passé composé—from already knowing (imparfait) to finding out or meeting for the first time.', 'Comprenez pourquoi savoir et connaître changent de nuance au passé composé : découvrir une nouvelle ou rencontrer quelqu’un pour la première fois.'),
    [
      b('Contrast ongoing past knowledge (je savais / je connaissais) with sudden events (j’ai su / j’ai connu)', 'Distinguer l’état passé (imparfait) de l’événement ponctuel (passé composé)'),
      b('Use j’ai su to mean "I found out / I managed to"', 'Employer j’ai su au sens de « j’ai appris / j’ai réussi à »'),
      b('Use j’ai connu to mean "I met / experienced for the first time"', 'Employer j’ai connu au sens de « j’ai rencontré / vécu »'),
    ],
    13,
    [
      card(
        b('How the past tense changes the meaning', 'Le changement de sens au passé'),
        b(
          'In the **imparfait**, **je savais** (*I knew*) and **je connaissais** (*I knew / was familiar with*) describe an ongoing state in the past. In the **passé composé**, both describe a **turning point**: **j’ai su** means *I found out / learned* (or *I knew how at that moment*), while **j’ai connu** means *I met* (for the first time) or *I experienced*!\nImparfait state: **je savais, je connaissais, nous savions**.\nPassé composé event: **j’ai su, j’ai connu, j’ai découvert**.',
          'À **l’imparfait**, **je savais** et **je connaissais** décrivent un état déjà installé dans le passé. Au **passé composé**, les deux verbes marquent un **déclic** : **j’ai su** signifie *j’ai appris / découvert une information*, tandis que **j’ai connu** signifie *j’ai rencontré pour la première fois* ou *j’ai vécu une époque / situation* !\nÉtat à l’imparfait : **je savais, je connaissais, nous savions**.\nÉvénement au passé composé : **j’ai su, j’ai connu, j’ai découvert**.',
        ),
        {
          table: {
            head: [b('Tense', 'Temps'), 'savoir', 'connaître'],
            rows: [
              [b('Imparfait (background state)', 'Imparfait (état)'), b('je savais = I already knew', 'je savais = je connaissais déjà le fait'), b('je connaissais = I already knew/visited', 'je connaissais = j’étais déjà familier')],
              [b('Passé composé (moment)', 'Passé composé (événement)'), b('j’ai su = I found out / learned', 'j’ai su = j’ai appris la nouvelle'), b('j’ai connu = I met / experienced', 'j’ai connu = j’ai fait la connaissance de / vécu')],
            ],
          },
          ex: [
            ['J’ai su la nouvelle ce matin en lisant mon courriel.', 'I found out the news this morning when reading my email.'],
            ['J’ai connu Marc pendant mes études à Grenoble.', 'I met Marc during my studies in Grenoble.'],
            ['À l’époque, je ne connaissais personne dans cette ville.', 'At that time, I did not know anyone in this city.'],
          ],
        },
      ),
      tip(
        b('Do not confuse "I met" and "I found out"', 'Ne confondez pas « j’ai su » et « j’ai connu »'),
        b(
          'To say “I met Claire in 2021”, say **J’ai connu Claire en 2021** (or *J’ai rencontré Claire*). To say “I found out yesterday that she was moving”, say **J’ai su hier qu’elle déménageait**. Both past participles are short and irregular: **su** and **connu**.\nPast forms: **j’ai su, j’ai connu, je savais**.',
          'Pour dire quand vous avez fait la connaissance de quelqu’un, dites **J’ai connu Claire en 2021** (ou *J’ai rencontré Claire*). Pour dire quand vous avez appris un fait, dites **J’ai su hier qu’elle déménageait**. Les deux participes passés sont courts : **su** et **connu**.\nFormes du passé : **j’ai su, j’ai connu, je savais**.',
        ),
      ),
      mc(
        P.choose,
        [
          'J’ai su hier soir que le train était annulé.',
          'J’ai connu hier soir que le train était annulé.',
          'J’ai su mon collègue Paul à l’université.',
          'Je savais hier à midi exactement la nouvelle.',
        ],
        {
          explain: b('Finding out a piece of news at a specific moment takes passé composé j’ai su + que.', 'Apprendre une information à un moment précis demande le passé composé j’ai su + que.'),
        },
      ),
      hear(
        'Nous avons connu nos voisins le jour de notre déménagement.',
        b('What happened on moving day?', 'Que s’est-il passé le jour du déménagement ?'),
        [
          b('They met their neighbors for the first time.', 'Ils ont fait la connaissance de leurs voisins.'),
          b('They found out their neighbors were leaving.', 'Ils ont appris que leurs voisins partaient.'),
          b('They already knew their neighbors for years.', 'Ils connaissaient déjà leurs voisins depuis des années.'),
        ],
      ),
      gap(
        P.complete,
        'En 2019, je ne ___ (connaître, imp.) pas encore Paris. Puis j’ai ___ (connaître, PC) Lucie au travail. L’an dernier, j’ai ___ (savoir, PC) qu’elle ouvrait sa propre librairie, même si je ___ (savoir, imp.) déjà qu’elle adorait lire.',
        [['connaissais'], ['connu'], ['su'], ['savais']],
        {
          choices: [
            ['connaissais', 'ai connu', 'savais'],
            ['connu', 'su', 'connaissais'],
            ['su', 'connu', 'savais'],
            ['savais', 'ai su', 'connaissais'],
          ],
        },
      ),
      pairs(
        b('Match each French past form with its exact meaning.', 'Associez chaque forme du passé à son sens précis.'),
        [
          ['J’ai su la date.', b('I found out the date.', 'J’ai appris la date.')],
          ['Je savais la date.', b('I already knew the date.', 'Je connaissais déjà la date.')],
          ['J’ai connu Karim.', b('I first met Karim.', 'J’ai fait la connaissance de Karim.')],
          ['Je connaissais Karim.', b('I already knew Karim.', 'Karim m’était déjà familier.')],
        ],
      ),
      ord(
        P.order,
        'Comment as-tu su qu’il cherchait un appartement ?',
        {
          tr: 'How did you find out that he was looking for an apartment?',
          extra: ['connu'],
        },
      ),
      dlg(
        b('Catching up at a reunion', 'Retrouvailles autour d’un café'),
        b('Yasmine and Benoît talk about how they met an old friend and heard her latest news.', 'Yasmine et Benoît parlent d’une amie commune et de ses nouvelles.'),
        [['Yasmine', 'f'], ['Benoît', 'm']],
        [
          [0, 'Tu as connu Sophie quand, déjà ?', 'Remind me—when did you meet Sophie?'],
          [1, {
            options: [
              'Je l’ai connue en 2020, pendant notre stage à Lille.',
              'Je l’ai sue en 2020, pendant notre stage à Lille.',
              'J’ai su qu’elle en 2020, pendant notre stage à Lille.',
            ],
            explain: b('Meeting someone for the first time uses connaître in the passé composé (with agreement: l’ = Sophie → connue).', 'Faire la connaissance de quelqu’un demande connaître au passé composé (accord avec l’ = Sophie → connue).'),
          }],
          [0, 'Et tu sais qu’elle vient de changer de poste ?', 'And do you know she just changed jobs?'],
          [1, {
            options: [
              'Oui, je l’ai su hier ! Elle m’a envoyé un message.',
              'Oui, je l’ai connu hier ! Elle m’a envoyé un message.',
              'Oui, je connaissais qu’elle changeait hier !',
            ],
          }],
        ],
      ),
      dict('À l’époque, je ne savais pas conduire, mais j’ai connu un excellent moniteur.'),
      write(
        b('Write about someone you met and something you found out.', 'Racontez une rencontre et une nouvelle apprise.'),
        b('Write 4–5 sentences combining j’ai connu (someone you met or place you discovered), j’ai su (news you learned), present connaître, and present savoir + skill or clause.', 'Écrivez 4 ou 5 phrases mêlant j’ai connu (une rencontre ou un lieu découvert), j’ai su (une information apprise), connaître au présent et savoir au présent + infinitif ou que.'),
        38,
        65,
        [
          b('Use j’ai connu to tell when/where you met someone', 'Employer j’ai connu pour raconter une rencontre'),
          b('Use j’ai su to report news you found out', 'Employer j’ai su pour une information apprise'),
          b('Include both connaître and savoir correctly in the present tense', 'Utiliser correctement connaître et savoir au présent'),
        ],
        'J’ai connu ma collègue Léa à l’université il y a cinq ans. Elle connaît très bien Lyon parce qu’elle y a vécu. Hier, j’ai su qu’elle cherche un nouvel appartement. Je sais qu’elle aime les quartiers calmes, et elle sait déjà cuisiner des plats délicieux pour toute l’équipe.',
      ),
    ],
    [
      b('je savais / je connaissais (imparfait) describe ongoing past knowledge.', 'je savais / je connaissais (imparfait) expriment un état passé durable.'),
      b('j’ai su (passé composé) = found out / learned at a specific moment.', 'j’ai su (passé composé) signifie « j’ai appris / découvert sur le moment ».'),
      b('j’ai connu (passé composé) = met someone for the first time or experienced an era/event.', 'j’ai connu (passé composé) signifie « j’ai fait la connaissance de / vécu ».'),
    ],
    [
      ['le courriel', b('email', 'courrier électronique')],
      ['le stage', b('internship / training course', 'période de formation pratique')],
      ['le moniteur', b('driving/sports instructor', 'personne qui enseigne une pratique')],
      ['à l’époque', b('at that time', 'à ce moment-là du passé')],
    ],
  ),
];

export default lessons;
