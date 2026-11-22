import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Who is speaking, and to whom? Master French subject pronouns from je/j’ to ils/elles. Learn how il and elle replace things as well as people, why everyday French prefers on over nous, when to choose tu or vous, and why a single man in a group turns the plural into ils.',
    'Qui parle, et à qui ? Maîtrisez les pronoms sujets français de je/j’ à ils/elles. Apprenez comment il et elle remplacent les choses autant que les personnes, pourquoi le français oral préfère on à nous, quand choisir tu ou vous, et pourquoi un seul élément masculin impose ils.',
  ),
  outcomes: [
    b('Use singular pronouns je/j’, tu, il, elle, and on accurately', 'Employer je/j’, tu, il, elle et on avec justesse'),
    b('Choose naturally between tu and vous, and between on and nous', 'Choisir naturellement entre tu et vous, puis entre on et nous'),
    b('Distinguish ils and elles for people and nouns', 'Distinguer ils et elles pour les personnes et les objets'),
  ],
};

const C = 'gr-subject-pronouns';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['singular-subject-pronouns', 'pronoms-sujets-singuliers'],
    b('The singular subjects: je, tu, il, elle, on', 'Les sujets singuliers : je, tu, il, elle, on'),
    b('Match every singular subject to people and things, and remember je becomes j’ before a vowel.', 'Reliez chaque pronom singulier aux personnes et aux objets, et pensez à j’ devant une voyelle.'),
    [
      b('Use j’ before vowels and silent h', 'Écrire j’ devant une voyelle ou un h muet'),
      b('Use il and elle for masculine and feminine things', 'Utiliser il et elle pour les objets masculins et féminins'),
      b('Avoid using a pronoun for "it" other than il/elle', 'Remplacer « it » par il ou elle selon le genre'),
    ],
    13,
    [
      card(
        b('Singular subject pronouns', 'Les pronoms sujets du singulier'),
        b(
          'Every French verb needs an explicit subject. Use **je** (or **j’** before a vowel/silent h), **tu** for one familiar person, and **il / elle** for one person OR one thing (French has no separate “it” for nouns!). **On** uses the same verb ending as **il / elle**.\nSingular pronouns: **je, tu, il, elle, on**.',
          'Chaque verbe français demande un sujet exprimé. Employez **je** (ou **j’** devant voyelle ou h muet), **tu** pour une personne proche, et **il / elle** pour une personne OU une chose. Le pronom **on** prend la même terminaison que **il / elle**.\nPronoms singuliers : **je, tu, il, elle, on**.',
        ),
        {
          table: {
            head: [b('Pronoun', 'Pronom'), b('Refers to', 'Désigne'), b('Example', 'Exemple')],
            rows: [
              ['je / j’', b('I (the speaker)', 'la personne qui parle'), 'J’habite à Nantes.'],
              ['tu', b('you (one friend/child)', 'une personne proche'), 'Tu parles vite.'],
              ['il', b('he / masculine noun', 'un homme / un nom masculin'), 'Le train arrive. Il est plein.'],
              ['elle', b('she / feminine noun', 'une femme / un nom féminin'), 'La porte ferme. Elle est lourde.'],
              ['on', b('people / we (sg. verb)', 'les gens / nous (verbe au singulier)'), 'On mange bien ici.'],
            ],
          },
          ex: [
            ['J’écoute la radio chaque matin.', 'I listen to the radio every morning.'],
            ['Regarde ce sac : il est léger.', 'Look at this bag: it is light.'],
            ['Cette chanson est connue : elle passe souvent.', 'This song is famous: it plays often.'],
          ],
        },
      ),
      tip(
        b('Il and elle for everyday objects', 'Il et elle pour les objets du quotidien'),
        b(
          'Check the noun’s article first: **le** or **un** becomes **il**; **la** or **une** becomes **elle**. Even a table or a city takes **il** or **elle**!\nMasculine to il: **le café, le bus, un livre**.\nFeminine to elle: **la gare, la clé, une tasse**.',
          'Regardez d’abord l’article du nom : **le** ou **un** devient **il** ; **la** ou **une** devient **elle**. Même une table ou une ville se reprend par **il** ou **elle**.\nNoms repris par il : **le café, le bus, un livre**.\nNoms repris par elle : **la gare, la clé, une tasse**.',
        ),
      ),
      mc(
        P.spelling,
        ['J’aime', 'Je aime', 'J’aimes', 'Je aimes'],
        {
          fr: '___ beaucoup cette librairie.',
          explain: b('Je contracts to j’ before the vowel a in aime.', 'Je devient j’ devant la voyelle a de aime.'),
        },
      ),
      mc(
        P.form,
        ['elle', 'il', 'on', 'tu'],
        {
          fr: 'Voici ma voiture : ___ est garée devant la maison.',
          explain: b('Voiture is feminine (la/une voiture), so use elle.', 'Voiture est féminin (la/une voiture), on emploie donc elle.'),
        },
      ),
      gap(
        P.complete,
        'Le musée ouvre à dix heures : ___ ferme à dix-huit heures. La boutique est petite, mais ___ est ouverte le dimanche.',
        [['il'], ['elle']],
        {
          choices: [
            ['il', 'elle', 'on'],
            ['elle', 'il', 'tu'],
          ],
        },
      ),
      pairs(
        b('Match each noun with the pronoun that replaces it.', 'Associez chaque nom au pronom qui le remplace.'),
        [
          ['le passeport', 'il'],
          ['la valise', 'elle'],
          ['l’adresse (f.)', 'elle'],
          ['un billet', 'il'],
        ],
        true,
      ),
      hear(
        'Elle travaille dans une pharmacie près du marché.',
        b('Who works in the pharmacy?', 'Qui travaille dans la pharmacie ?'),
        [
          b('One woman (elle)', 'Une femme (elle)'),
          b('One man (il)', 'Un homme (il)'),
          b('You and I (on)', 'Toi et moi (on)'),
        ],
      ),
      dict('Le bus passe dans cinq minutes : il arrive bientôt.'),
      say('J’habite dans une rue calme : elle est très agréable.', 'I live on a quiet street: it is very pleasant.'),
    ],
    [
      b('je becomes j’ before a vowel or silent h (j’aime, j’habite).', 'je devient j’ devant une voyelle ou un h muet (j’aime, j’habite).'),
      b('il replaces masculine people and things; elle replaces feminine people and things.', 'il remplace les personnes et objets masculins ; elle remplace le féminin.'),
      b('on always takes a third-person singular verb.', 'on prend toujours un verbe à la troisième personne du singulier.'),
    ],
    [
      ['la valise', b('the suitcase', 'le grand bagage de voyage')],
      ['la pharmacie', b('the pharmacy', 'où l’on achète des médicaments')],
      ['agréable', b('pleasant', 'plaisant, confortable')],
      ['lourd / lourde', b('heavy', 'qui pèse beaucoup')],
    ],
  ),

  lesson(
    C,
    2,
    ['nous-vs-on-and-vous', 'nous-on-et-vous'],
    b('Tu, vous, on, and nous', 'Tu, vous, on et nous'),
    b('Choose naturally between familiar tu and polite or plural vous, and understand how on replaces nous in speech.', 'Choisissez avec justesse entre tu familier et vous poli ou pluriel, et comprenez comment on remplace nous à l’oral.'),
    [
      b('Tell polite singular vous from plural vous', 'Distinguer le vous de politesse du vous pluriel'),
      b('Use on + singular verb for spoken "we"', 'Employer on + verbe au singulier pour dire « nous » à l’oral'),
      b('Switch cleanly between tu and vous by social context', 'Passer de tu à vous selon la situation'),
    ],
    13,
    [
      card(
        b('One "you" or two? One "we" or two?', 'Tu ou vous ? On ou nous ?'),
        b(
          '**Tu** speaks to one friend, relative, or child. **Vous** speaks either to **one** person politely (a stranger, teacher, customer, manager) OR to **two or more** people, even close friends. For “we”, everyday spoken French mostly uses **on** (+ 3rd-person singular verb), while **nous** feels slightly more formal or written.\nWhen to use vous: **one stranger, a shopkeeper, two friends**.\nWhen to use on: **spoken we, general people, informal plans**.',
          '**Tu** s’adresse à un ami, un proche ou un enfant. **Vous** s’adresse soit à **une seule** personne avec politesse (un inconnu, un client, un professeur), soit à **plusieurs** personnes, même des amis proches. Pour dire « we », le français parlé emploie surtout **on** (+ verbe au singulier), alors que **nous** est plus soigné ou écrit.\nEmplois de vous : **un inconnu, un commerçant, deux amis**.\nEmplois de on : **nous à l’oral, les gens en général, projets informels**.',
        ),
        {
          table: {
            head: [b('Pronoun', 'Pronom'), b('People', 'Personnes'), b('Register & verb', 'Registre et verbe')],
            rows: [
              ['tu', b('1 close person', '1 proche'), b('Informal (-es / -s)', 'Familier (-es / -s)')],
              ['vous', b('1 polite OR 2+ people', '1 personne polie OU 2+'), b('Polite or plural (-ez)', 'Poli ou pluriel (-ez)')],
              ['on', b('we / people in general', 'nous / les gens'), b('Everyday speech (sg.)', 'Oral courant (singulier)')],
              ['nous', b('we', 'nous'), b('Neutral / formal (-ons)', 'Standard / soigné (-ons)')],
            ],
          },
          ex: [
            ['Excusez-moi, vous avez l’heure ?', 'Excuse me, do you have the time?'],
            ['Les enfants, vous rangez vos affaires !', 'Kids, put your things away!'],
            ['Ce soir, on dîne chez Paul ?', 'Tonight, shall we have dinner at Paul’s?'],
          ],
        },
      ),
      trap(
        b('On means "we", never with -ons!', 'On veut dire « nous », jamais avec -ons !'),
        b(
          'Even when **on** refers to two or three people, its verb ALWAYS stays singular: **On va au parc**, **On parle français**, never *On allons* or *On parlons*.\nCorrect with on: **on va, on fait, on mange**.',
          'Même lorsque **on** désigne deux ou trois personnes, son verbe reste TOUJOURS au singulier : **On va au parc**, **On parle français**, jamais *On allons* ni *On parlons*.\nFormes justes avec on : **on va, on fait, on mange**.',
        ),
      ),
      mc(
        b('You greet an adult customer in a shop. What do you say?', 'Vous accueillez une cliente dans un magasin. Que dites-vous ?'),
        [
          'Bonjour Madame, vous cherchez une taille ?',
          'Bonjour Madame, tu cherches une taille ?',
          'Bonjour Madame, on cherche une taille ?',
          'Bonjour Madame, ils cherchent une taille ?',
        ],
        {
          explain: b('Use polite vous with an adult customer you do not know.', 'Employez le vous de politesse avec une cliente inconnue.'),
        },
      ),
      mc(
        P.form,
        ['on prend', 'on prenons', 'nous prend', 'vous prenons'],
        {
          fr: 'Camille et moi, ___ le train de neuf heures.',
          explain: b('On takes the third-person singular verb (prend).', 'On prend le verbe à la troisième personne du singulier (prend).'),
        },
      ),
      hear(
        'Mes amis, vous venez avec nous au concert samedi ?',
        b('Why does the speaker use vous here?', 'Pourquoi la personne utilise-t-elle vous ici ?'),
        [
          b('She is speaking to several friends (plural)', 'Elle s’adresse à plusieurs amis (pluriel)'),
          b('She is speaking politely to one stranger', 'Elle parle poliment à une personne inconnue'),
          b('She is talking about herself', 'Elle parle d’elle-même'),
        ],
      ),
      sort(
        b('Which pronoun fits each person or group you address?', 'Quel pronom convient à chaque interlocuteur ?'),
        ['tu', 'vous', 'on'],
        [
          ['Ton petit frère', 0],
          ['Un médecin à la clinique', 1],
          ['Deux camarades de classe', 1],
          ['Mon ami et moi, au café', 2],
          ['Ton meilleur ami', 0],
          ['Tout le monde en France', 2],
        ],
      ),
      gap(
        P.complete,
        'Maman, ___ prépares le goûter ? — Oui, et les garçons, ___ mettez la table ! Ensuite ___ mange tous ensemble.',
        [['tu'], ['vous'], ['on']],
        {
          choices: [
            ['tu', 'vous', 'on'],
            ['vous', 'tu', 'ils'],
            ['on', 'nous', 'vous'],
          ],
        },
      ),
      ord(
        P.order,
        'Ce week-end, on visite un château avec Lucas.',
        {
          tr: 'This weekend, we are visiting a castle with Lucas.',
          extra: ['visitons'],
        },
      ),
      say('Pardon Monsieur, vous travaillez à la mairie ?', 'Excuse me sir, do you work at the town hall?'),
    ],
    [
      b('vous covers both one person politely and any group of two or more.', 'vous sert à la fois pour une personne poliment et pour un groupe de deux personnes ou plus.'),
      b('on is the everyday spoken "we", always paired with a singular verb.', 'on est le « nous » courant à l’oral, toujours avec un verbe au singulier.'),
      b('nous remains standard in formal speech and writing.', 'nous reste courant à l’écrit et dans un registre soutenu.'),
    ],
    [
      ['la taille', b('clothing/shoe size', 'la mesure d’un vêtement')],
      ['le goûter', b('afternoon snack', 'petit repas de l’après-midi')],
      ['la mairie', b('town hall', 'administration de la ville')],
      ['le château', b('castle', 'grand bâtiment ancien')],
    ],
  ),

  lesson(
    C,
    3,
    ['ils-vs-elles-plural', 'ils-ou-elles-au-pluriel'],
    b('Ils vs. elles: all plural subjects', 'Ils ou elles : maîtriser le pluriel'),
    b('Tell when a plural group takes ils or elles, hear the plural liaison, and bring every subject pronoun together.', 'Sachez quand un groupe prend ils ou elles, entendez la liaison du pluriel et réunissez tous les pronoms sujets.'),
    [
      b('Use elles only for 100% feminine people or nouns', 'Réserver elles aux groupes 100 % féminins'),
      b('Use ils as soon as one masculine person or noun is included', 'Employer ils dès qu’un élément masculin est présent'),
      b('Combine all subject pronouns naturally in short stories', 'Combiner tous les pronoms sujets dans de courts récits'),
    ],
    13,
    [
      card(
        b('The plural rule: ils vs. elles', 'La règle du pluriel : ils vs elles'),
        b(
          '**Elles** is strictly for an all-female group or exclusively feminine plural nouns (**les tables, Sarah et Inès**). **Ils** is used for an all-male group, exclusively masculine nouns (**les trains**), AND **any mixed group**, even ten women and one man!\nPure feminine to elles: **Léa et Zoé, les clés, mes tantes**.\nMixed or masculine to ils: **Marc et Léa, les livres, Paul et ses sœurs**.',
          '**Elles** s’emploie uniquement pour un groupe 100 % féminin (**les tables, Sarah et Inès**). **Ils** s’emploie pour un groupe masculin, des noms masculins (**les trains**), ET **tout groupe mixte**, même dix femmes et un homme !\nFéminin pur vers elles : **Léa et Zoé, les clés, mes tantes**.\nMixte ou masculin vers ils : **Marc et Léa, les livres, Paul et ses sœurs**.',
        ),
        {
          table: {
            head: [b('Group', 'Groupe'), b('Pronoun', 'Pronom'), b('Example', 'Exemple')],
            rows: [
              ['Paul + Karim', 'ils', 'Ils jouent au foot.'],
              ['Chloé + Emma', 'elles', 'Elles prennent le bus.'],
              ['Paul + Chloé + Emma', 'ils', 'Ils habitent ensemble.'],
              ['le stylo + la gomme', 'ils', 'Ils sont sur le bureau.'],
              ['la chaise + la lampe', 'elles', 'Elles sont neuves.'],
            ],
          },
          ex: [
            ['Claire et Thomas arrivent : ils prennent le métro.', 'Claire and Thomas are arriving: they take the subway.'],
            ['Mes deux sœurs sont étudiantes : elles vivent à Lille.', 'My two sisters are students: they live in Lille.'],
            ['Où sont mes lunettes ? Elles sont sur la table.', 'Where are my glasses? They are on the table.'],
          ],
        },
      ),
      tip(
        b('Hear the difference before a vowel', 'Entendez la différence devant une voyelle'),
        b(
          'Before a consonant, **il** and **ils** sound identical (*il parle / ils parlent*). Before a vowel or silent h, **ils** and **elles** make a clear **-z-** liaison you can hear: **ils‿aiment**, **elles‿arrivent**.\nClear liaisons: **ils‿ont, elles‿habitent, ils‿écoutent**.',
          'Devant une consonne, **il** et **ils** se prononcent pareil (*il parle / ils parlent*). Devant une voyelle ou un h muet, **ils** et **elles** font une liaison en **-z-** bien audible : **ils‿aiment**, **elles‿arrivent**.\nLiaisons nettes : **ils‿ont, elles‿habitent, ils‿écoutent**.',
        ),
      ),
      mc(
        P.form,
        ['Ils', 'Elles', 'On', 'Il'],
        {
          fr: 'Mon frère et mes trois cousines voyagent ensemble. ___ partent demain matin.',
          explain: b('One masculine member (mon frère) makes the whole group ils.', 'Un seul élément masculin (mon frère) impose le pronom ils.'),
        },
      ),
      hear(
        'Elles habitent près du jardin public.',
        b('Listen carefully: is the speaker talking about one woman or several?', 'Écoutez bien : parle-t-on d’une seule femme ou de plusieurs ?'),
        [
          b('Several women (you hear the -z- liaison)', 'Plusieurs femmes (on entend la liaison en -z-)'),
          b('One woman only', 'Une seule femme'),
          b('A man and a woman', 'Un homme et une femme'),
        ],
      ),
      sort(
        b('Replace each group with ils or elles.', 'Remplacez chaque groupe par ils ou elles.'),
        ['ils', 'elles'],
        [
          ['Sophie et Camille', 1],
          ['Sophie et Hugo', 0],
          ['les fenêtres et les portes', 1],
          ['le sac et la valise', 0],
          ['mes deux grands-pères', 0],
          ['mes tantes', 1],
        ],
      ),
      gap(
        P.complete,
        'Voici mes deux clés : ___ sont rouges. Et voici Luc et Manon : ___ cherchent un appartement.',
        [['elles'], ['ils']],
        {
          choices: [
            ['elles', 'ils', 'elle'],
            ['ils', 'elles', 'on'],
          ],
        },
      ),
      pairs(
        b('Match each pair of people or objects to the right pronoun.', 'Associez chaque paire de personnes ou d’objets au bon pronom.'),
        [
          ['la tasse et la cuillère', 'elles'],
          ['le couteau et la fourchette', 'ils'],
          ['mon voisin', 'il'],
          ['ta sœur', 'elle'],
        ],
        true,
      ),
      dlg(
        b('Saturday night plans', 'Projets du samedi soir'),
        b('Inès and Sam check who is coming to dinner and greet a neighbor.', 'Inès et Sam vérifient qui vient dîner et saluent un voisin.'),
        [['Inès', 'f'], ['Sam', 'm']],
        [
          [0, 'Marc et Julie viennent ce soir ?', 'Are Marc and Julie coming tonight?'],
          [1, {
            options: [
              'Oui, ils arrivent vers vingt heures.',
              'Oui, elles arrivent vers vingt heures.',
              'Oui, il arrive vers vingt heures.',
            ],
            explain: b('Marc + Julie is a mixed group, so use ils.', 'Marc et Julie forment un groupe mixte : il faut ils.'),
          }],
          [0, 'Et tes deux sœurs ? Qu’est-ce qu’on prépare pour le dessert ?', 'And your two sisters? What are we making for dessert?'],
          [1, {
            options: [
              'Elles apportent un gâteau, et on fait du thé.',
              'Ils apportent un gâteau, et on faisons du thé.',
              'Elles apporte un gâteau, et nous fait du thé.',
            ],
          }],
          [0, 'Super ! Dis bonjour à Monsieur Mercier : vous montez ensemble ?', 'Great! Say hello to Mr. Mercier: are you going up together?'],
        ],
      ),
      dict('Mes cousines adorent la musique : elles écoutent souvent du jazz.'),
      write(
        b('Introduce your circle.', 'Présentez votre entourage.'),
        b('Write 3–4 sentences using at least 4 different subject pronouns (je/j’, on, ils, elles) to tell where you live and what friends or family do.', 'Écrivez 3 ou 4 phrases avec au moins 4 pronoms sujets différents (je/j’, on, ils, elles) pour dire où vous habitez et ce que font vos proches.'),
        24,
        44,
        [
          b('Use je or j’ accurately', 'Utiliser je ou j’ correctement'),
          b('Use on with a singular verb for spoken "we"', 'Employer on avec un verbe au singulier'),
          b('Include both ils and elles accurately', 'Employer correctement ils et elles'),
        ],
        'Je m’appelle Nadia et j’habite à Lyon. Le samedi, on va au marché avec mon frère. Mes cousins jouent au tennis. Ils arrivent tôt, mais mes sœurs restent à la maison. Elles préparent le déjeuner.',
      ),
    ],
    [
      b('elles is strictly for 100% feminine plural groups or nouns.', 'elles s’utilise uniquement pour un groupe ou des noms 100 % féminins.'),
      b('As soon as one masculine noun or person is present, use ils.', 'Dès qu’un seul élément masculin est présent, on emploie ils.'),
      b('Before a vowel or silent h, ils and elles link with a clear -z- sound.', 'Devant une voyelle ou un h muet, ils et elles font une liaison nette en -z-.'),
    ],
    [
      ['les lunettes (f.)', b('glasses', 'pour mieux voir ou contre le soleil')],
      ['la fourchette', b('fork', 'couvert à dents')],
      ['le couteau', b('knife', 'couvert pour couper')],
      ['la cuillère', b('spoon', 'couvert pour la soupe ou le yaourt')],
    ],
  ),
];

export default lessons;
