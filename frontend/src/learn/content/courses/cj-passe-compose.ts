import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'J’ai mangé, elle est partie, nous nous sommes rencontrés. The passé composé tells what happened, and it is the past tense you use most. It has two parts: an auxiliary (avoir or être) and a past participle. This course builds it step by step: regular participles, the irregular ones you meet every day, the verbs that take être, pronominal verbs and agreement, then negation, questions and a full story.',
    'J’ai mangé, elle est partie, nous nous sommes rencontrés. Le passé composé raconte ce qui s’est passé, et c’est le temps du passé que l’on emploie le plus. Il a deux parties : un auxiliaire (avoir ou être) et un participe passé. Ce cours le construit pas à pas : les participes réguliers, les irréguliers que l’on rencontre tous les jours, les verbes qui prennent être, les verbes pronominaux et l’accord, puis la négation, les questions et un récit complet.',
  ),
  outcomes: [
    b('Form regular and irregular past participles', 'Former les participes passés réguliers et irréguliers'),
    b('Choose avoir or être', 'Choisir avoir ou être'),
    b('Agree the participle when needed', 'Accorder le participe quand il le faut'),
    b('Tell what you did, with negation and questions', 'Raconter ce que l’on a fait, avec la négation et les questions'),
  ],
};

const C = 'cj-passe-compose';
const PC = b('passé composé', 'passé composé');

export default [
  lesson(C, 1, ['avoir-and-regular-participles', 'avoir-et-participes-reguliers'],
    b('Avoir + a regular past participle', 'Avoir + un participe passé régulier'),
    b('Most verbs form the passé composé with avoir and a participle in -é, -i or -u.', 'La plupart des verbes forment le passé composé avec avoir et un participe en -é, -i ou -u.'),
    [b('Conjugate avoir in the present', 'Conjuguer avoir au présent'), b('Form regular participles', 'Former les participes réguliers'), b('Hear the difference with the present', 'Entendre la différence avec le présent')],
    13,
    [
      card(b('Two parts', 'Deux parties'), b('Passé composé = **avoir** in the present + **past participle**. The participle depends on the infinitive. Regular participles: **parler → parlé, finir → fini, vendre → vendu**.', 'Passé composé = **avoir** au présent + **participe passé**. Le participe dépend de l’infinitif. Participes réguliers : **parler → parlé, finir → fini, vendre → vendu**.'), {
        table: {
          head: ['', 'parler', 'finir', 'attendre'],
          rows: [['j’', 'ai parlé', 'ai fini', 'ai attendu'], ['tu', 'as parlé', 'as fini', 'as attendu'], ['il / elle', 'a parlé', 'a fini', 'a attendu'], ['nous', 'avons parlé', 'avons fini', 'avons attendu'], ['vous', 'avez parlé', 'avez fini', 'avez attendu'], ['ils / elles', 'ont parlé', 'ont fini', 'ont attendu']],
        },
        ex: [['Hier, j’ai regardé un documentaire.', 'Yesterday, I watched a documentary.'], ['Nous avons fini le projet vendredi.', 'We finished the project on Friday.'], ['Ils ont attendu le bus pendant vingt minutes.', 'They waited for the bus for twenty minutes.']],
      }),
      tip(b('Parlé or parler? Same sound', 'Parlé ou parler ? Même son'), b('**parlé** and **parler** sound the same. Replace the verb with **vendre** to check: if you would say **vendu**, write **-é** (**j’ai vendu → j’ai parlé**); if you would say **vendre**, write **-er** (**je vais vendre → je vais parler**).', '**parlé** et **parler** se prononcent pareil. Remplacez le verbe par **vendre** pour vérifier : si vous diriez **vendu**, écrivez **-é** (**j’ai vendu → j’ai parlé**) ; si vous diriez **vendre**, écrivez **-er** (**je vais vendre → je vais parler**).')),
      conj('travailler', PC, [['j’', 'ai travaillé'], ['tu', 'as travaillé'], ['il / elle', 'a travaillé'], ['nous', 'avons travaillé'], ['vous', 'avez travaillé'], ['ils / elles', 'ont travaillé']], { given: [0] }),
      conj('choisir', PC, [['j’', 'ai choisi'], ['tu', 'as choisi'], ['il / elle', 'a choisi'], ['nous', 'avons choisi'], ['vous', 'avez choisi'], ['ils / elles', 'ont choisi']], { given: [0] }),
      mc(P.form, ['avons mangé', 'avons manger', 'sommes mangé', 'avons mangeons'], { fr: 'Hier soir, nous ___ au restaurant.' }),
      mc(P.spelling, ['réussi', 'réussit', 'réussis', 'réussir'], { fr: 'Bravo, tu as ___ ton examen !' }),
      gap(P.complete, 'Samedi, j’___ (acheter) un vélo. Mes parents ___ (vendre) leur maison et nous ___ (choisir) un nouvel appartement.', [['ai acheté'], ['ont vendu'], ['avons choisi']]),
      sort(b('Which participle ending?', 'Quelle terminaison de participe ?'), ['-é', '-i', '-u'], [['manger', 0], ['dormir', 1], ['perdre', 2], ['écouter', 0], ['grandir', 1], ['répondre', 2]]),
      hear('J’ai parlé avec la directrice.', b('Present or past?', 'Présent ou passé ?'), [b('Past: you hear « j’ai » before the verb', 'Passé : on entend « j’ai » avant le verbe'), b('Present', 'Présent'), b('Future', 'Futur')]),
      dict('Hier, nous avons visité le musée et nous avons déjeuné sur une terrasse.'),
      say('J’ai fini mon travail et j’ai appelé ma mère.', 'I finished my work and called my mother.'),
    ],
    [
      b('Passé composé = avoir (present) + past participle.', 'Passé composé = avoir (présent) + participe passé.'),
      b('Regular participles: -er → -é, -ir → -i, -re → -u.', 'Participes réguliers : -er → -é, -ir → -i, -re → -u.'),
      b('The vendre test: vendu → -é, vendre → -er.', 'Le test de vendre : vendu → -é, vendre → -er.'),
    ],
    [['un documentaire', b('a documentary', 'un film sur la réalité')], ['déjeuner', b('to have lunch', 'prendre le repas de midi')], ['une terrasse', b('a café terrace', 'les tables dehors d’un café')]],
  ),

  lesson(C, 2, ['irregular-participles', 'participes-irreguliers'],
    b('The irregular participles', 'Les participes irréguliers'),
    b('Pris, mis, fait, vu, bu, eu, été: the participles you use every day, learnt in families.', 'Pris, mis, fait, vu, bu, eu, été : les participes de tous les jours, appris par familles.'),
    [b('Learn the irregular participles by family', 'Apprendre les participes irréguliers par famille'), b('Tell eu and été apart', 'Distinguer eu et été'), b('Use them in sentences', 'Les employer dans des phrases')],
    13,
    [
      card(b('Learn them in families', 'Apprenez-les par familles'), b('Many frequent verbs have an irregular participle. In -u: **avoir → eu, boire → bu, lire → lu, voir → vu, pouvoir → pu, vouloir → voulu, devoir → dû, savoir → su, venir → venu**. In -is or -it: **prendre → pris, mettre → mis, dire → dit, écrire → écrit, faire → fait**. Others: **être → été, ouvrir → ouvert, naître → né, mourir → mort**.', 'Beaucoup de verbes fréquents ont un participe irrégulier. En -u : **avoir → eu, boire → bu, lire → lu, voir → vu, pouvoir → pu, vouloir → voulu, devoir → dû, savoir → su, venir → venu**. En -is ou -it : **prendre → pris, mettre → mis, dire → dit, écrire → écrit, faire → fait**. Autres : **être → été, ouvrir → ouvert, naître → né, mourir → mort**.'), {
        ex: [['J’ai pris le métro ce matin.', 'I took the metro this morning.'], ['Qu’est-ce que tu as fait hier ?', 'What did you do yesterday?']],
      }),
      pairs(b('Match each infinitive with its participle.', 'Associez chaque infinitif à son participe.'), [['prendre', 'pris'], ['mettre', 'mis'], ['boire', 'bu'], ['voir', 'vu'], ['faire', 'fait'], ['ouvrir', 'ouvert']], true),
      trap(b('Eu, été, dû', 'Eu, été, dû'), b('**eu** belongs to avoir and **été** to être: **j’ai eu de la chance** (I was lucky), **j’ai été malade** (I was ill). Both use avoir. And **dû** keeps its circumflex: **il a dû partir**.', '**eu** est le participe de avoir et **été** celui de être : **j’ai eu de la chance**, **j’ai été malade**. Les deux se conjuguent avec avoir. Et **dû** garde son accent circonflexe : **il a dû partir**.')),
      conj('prendre', PC, [['j’', 'ai pris'], ['tu', 'as pris'], ['il / elle', 'a pris'], ['nous', 'avons pris'], ['vous', 'avez pris'], ['ils / elles', 'ont pris']], { given: [0] }),
      mc(P.form, ['pris', 'prendu', 'prit', 'prenu'], { fr: 'Ce matin, j’ai ___ le train de sept heures.' }),
      mc(P.form, ['mis', 'mettu', 'mit', 'metté'], { fr: 'Où est-ce que tu as ___ mes clés ?' }),
      mc(P.form, ['fait', 'faisé', 'fai', 'faisu'], { fr: 'Qu’est-ce que vous avez ___ ce week-end ?' }),
      gap(P.completeText, 'Hier, j’___ (lire) un article intéressant. Ensuite, j’___ (écrire) à ma sœur et nous ___ (boire) un café ensemble.', [['ai lu'], ['ai écrit'], ['avons bu']]),
      hear('Il a dû partir plus tôt.', P.meaning, [b('He had to leave earlier', 'Il a été obligé de partir plus tôt'), b('He wanted to leave earlier', 'Il a voulu partir plus tôt'), b('He was able to leave earlier', 'Il a pu partir plus tôt')]),
      dict('Nous avons pris un taxi parce que nous avons perdu nos billets.'),
      say('Je n’ai pas vu le film, mais j’ai lu le livre.', 'I haven’t seen the film, but I’ve read the book.'),
    ],
    [
      b('In -u: eu, bu, lu, vu, pu, voulu, dû, su, venu.', 'En -u : eu, bu, lu, vu, pu, voulu, dû, su, venu.'),
      b('In -is / -it: pris, mis, dit, écrit, fait.', 'En -is / -it : pris, mis, dit, écrit, fait.'),
      b('eu (avoir) and été (être) both take avoir: j’ai eu, j’ai été.', 'eu (avoir) et été (être) prennent tous deux avoir : j’ai eu, j’ai été.'),
    ],
    [['avoir de la chance', b('to be lucky', 'être chanceux')], ['un billet', b('a ticket', 'un titre de transport')], ['perdre', b('to lose', 'ne plus avoir')]],
  ),

  lesson(C, 3, ['etre-verbs', 'verbes-avec-etre'],
    b('The verbs that take être', 'Les verbes qui prennent être'),
    b('Movement and change of state: je suis allé, elle est partie, ils sont nés.', 'Le mouvement et le changement d’état : je suis allé, elle est partie, ils sont nés.'),
    [b('Know the verbs that take être', 'Connaître les verbes qui prennent être'), b('Agree the participle with the subject', 'Accorder le participe avec le sujet'), b('Choose avoir or être', 'Choisir avoir ou être')],
    13,
    [
      card(b('Être for movement and change', 'Être pour le mouvement et le changement'), b('A small group of verbs uses **être**: verbs of movement and of change of state. The verbs: **aller, venir, arriver, partir, entrer, sortir, monter, descendre, tomber, rester, retourner, naître, mourir, devenir**. With être, the participle **agrees with the subject**: **elle est partie, ils sont arrivés, elles sont venues**.', 'Un petit groupe de verbes se conjugue avec **être** : les verbes de mouvement et de changement d’état. Les verbes : **aller, venir, arriver, partir, entrer, sortir, monter, descendre, tomber, rester, retourner, naître, mourir, devenir**. Avec être, le participe **s’accorde avec le sujet** : **elle est partie, ils sont arrivés, elles sont venues**.'), {
        table: {
          caption: b('je, tu, nous, vous: masculine forms (add -e for a woman)', 'je, tu, nous, vous : formes au masculin (ajoutez -e pour une femme)'),
          head: ['', 'aller', 'partir'],
          rows: [['je', 'suis allé', 'suis parti'], ['tu', 'es allé', 'es parti'], ['il', 'est allé', 'est parti'], ['elle', 'est allée', 'est partie'], ['nous', 'sommes allés', 'sommes partis'], ['vous', 'êtes allés', 'êtes partis'], ['ils', 'sont allés', 'sont partis'], ['elles', 'sont allées', 'sont parties']],
        },
      }),
      tip(b('A memory trick: the house', 'Un moyen mnémotechnique : la maison'), b('Picture a house. You **arrive**, you **enter**, you **go up** the stairs and **come down**, you **stay**, you **go out**, you **leave**, you **fall** in the garden. All these movements take être. **Naître** and **mourir** frame the story of a life.', 'Imaginez une maison. On **arrive**, on **entre**, on **monte** l’escalier et on **descend**, on **reste**, on **sort**, on **part**, on **tombe** dans le jardin. Tous ces mouvements prennent être. **Naître** et **mourir** encadrent l’histoire d’une vie.')),
      conj('arriver', PC, [['il', 'est arrivé'], ['elle', 'est arrivée'], ['nous (Paul et moi)', 'sommes arrivés'], ['vous (Léa et Zoé)', 'êtes arrivées'], ['ils', 'sont arrivés'], ['elles', 'sont arrivées']], { given: [0] }),
      mc(P.form, ['est', 'a', 'es', 'ont'], { fr: 'Ma grand-mère ___ née en 1950.' }),
      mc(P.spelling, ['sont parties', 'sont partis', 'ont parti', 'sont partie'], { fr: 'Les filles ___ à huit heures.' }),
      sort(b('Avoir or être?', 'Avoir ou être ?'), ['avoir', 'être'], [['manger', 0], ['aller', 1], ['dormir', 0], ['tomber', 1], ['finir', 0], ['rester', 1], ['voir', 0], ['naître', 1]]),
      gap(P.complete, 'Elle ___ (venir) en voiture. Nous ___ (rester) à la maison. Mes cousins ___ (arriver) hier soir.', [['est venue'], ['sommes restés', 'sommes restées'], ['sont arrivés']]),
      hear('Elles sont sorties ensemble.', b('Who went out?', 'Qui est sorti ?'), [b('Several women: you hear « elles sont »', 'Plusieurs femmes : on entend « elles sont »'), b('One man', 'Un homme'), b('One woman', 'Une femme')]),
      dict('Nous sommes partis tôt et nous sommes arrivés à Québec avant midi.'),
      say('Je suis né à Dakar et je suis venu au Canada en 2019.', 'I was born in Dakar and came to Canada in 2019.'),
    ],
    [
      b('Être: movement and change of state (aller, venir, partir, naître, mourir…).', 'Être : mouvement et changement d’état (aller, venir, partir, naître, mourir…).'),
      b('With être, the participle agrees with the subject: elle est venue.', 'Avec être, le participe s’accorde avec le sujet : elle est venue.'),
      b('All the other verbs take avoir.', 'Tous les autres verbes prennent avoir.'),
    ],
    [['naître', b('to be born', 'venir au monde')], ['tomber', b('to fall', 'perdre l’équilibre')], ['monter', b('to go up', 'aller vers le haut')]],
  ),

  lesson(C, 4, ['pronominal-verbs-and-agreement', 'pronominaux-et-accords'],
    b('Pronominal verbs and agreement', 'Les verbes pronominaux et l’accord'),
    b('Je me suis levé, elle s’est trompée, la lettre que j’ai écrite.', 'Je me suis levé, elle s’est trompée, la lettre que j’ai écrite.'),
    [b('Conjugate pronominal verbs with être', 'Conjuguer les verbes pronominaux avec être'), b('Agree the participle with the subject', 'Accorder le participe avec le sujet'), b('Know the agreement rule with avoir', 'Connaître la règle d’accord avec avoir')],
    13,
    [
      card(b('Pronominal verbs take être', 'Les verbes pronominaux prennent être'), b('Every pronominal verb uses **être**, and the pronoun stays before the auxiliary: **je me suis levé, tu t’es trompé, elle s’est couchée, nous nous sommes rencontrés**. The participle usually agrees with the subject: **elle s’est réveillée tôt**.', 'Tous les verbes pronominaux se conjuguent avec **être**, et le pronom reste avant l’auxiliaire : **je me suis levé, tu t’es trompé, elle s’est couchée, nous nous sommes rencontrés**. Le participe s’accorde en général avec le sujet : **elle s’est réveillée tôt**.'), {
        ex: [['Elle s’est réveillée à six heures.', 'She woke up at six.'], ['Nous nous sommes rencontrés à l’université.', 'We met at university.']],
      }),
      tip(b('With avoir: agreement only with an object placed before', 'Avec avoir : accord seulement avec un complément placé avant'), b('With avoir, the participle never agrees with the subject: **elles ont mangé**. It agrees with a direct object placed **before** the verb: **la lettre que j’ai écrite**, **ces photos, je les ai prises**.', 'Avec avoir, le participe ne s’accorde jamais avec le sujet : **elles ont mangé**. Il s’accorde avec un complément d’objet direct placé **avant** le verbe : **la lettre que j’ai écrite**, **ces photos, je les ai prises**.')),
      conj('se lever', PC, [['il', 's’est levé'], ['elle', 's’est levée'], ['nous (Tom et moi)', 'nous sommes levés'], ['vous (Ana et Lou)', 'vous êtes levées'], ['ils', 'se sont levés'], ['elles', 'se sont levées']], { given: [0] }),
      mc(P.form, ['s’est réveillée', 's’a réveillée', 's’est réveillé', 's’est réveiller'], { fr: 'Ce matin, Julie ___ à cinq heures.' }),
      mc(P.spelling, ['écrite', 'écrit', 'écrits', 'écrites'], { fr: 'La lettre que tu m’as ___ m’a fait très plaisir.' }),
      gap(P.complete, 'Nous ___ (se rencontrer) à l’université. Elle ___ (se tromper) de numéro.', [['nous sommes rencontrés', 'nous sommes rencontrées'], ['s’est trompée']]),
      ord(P.order, 'Ils se sont mariés au mois de juin.', { tr: 'They got married in June.' }),
      hear('Elle s’est trompée de jour.', P.meaning, [b('She got the day wrong', 'Elle s’est trompée de jour : elle a fait une erreur'), b('She found the right day', 'Elle a trouvé le bon jour'), b('She changed the day on purpose', 'Elle a changé le jour exprès')]),
      dict('Elle s’est levée tard et elle s’est dépêchée pour ne pas rater son train.'),
      say('Nous nous sommes bien amusés à la fête.', 'We had a lot of fun at the party.'),
    ],
    [
      b('Pronominal verbs: être + agreement with the subject (elle s’est levée).', 'Verbes pronominaux : être + accord avec le sujet (elle s’est levée).'),
      b('Avoir: no agreement with the subject (elles ont mangé).', 'Avoir : pas d’accord avec le sujet (elles ont mangé).'),
      b('Avoir: agreement with a direct object placed before (la lettre que j’ai écrite).', 'Avoir : accord avec un COD placé avant (la lettre que j’ai écrite).'),
    ],
    [['se tromper de', b('to get (sth) wrong', 'faire une erreur sur')], ['se marier', b('to get married', 'devenir mari et femme')], ['s’amuser', b('to have fun', 'passer un bon moment')]],
  ),

  lesson(C, 5, ['negation-questions-and-story', 'negation-questions-et-recit'],
    b('Negation, questions and a full story', 'Négation, questions et récit complet'),
    b('Je n’ai pas compris, tu es déjà venu ?, and your own weekend told in the passé composé.', 'Je n’ai pas compris, tu es déjà venu ?, et votre propre week-end raconté au passé composé.'),
    [b('Put the negation around the auxiliary', 'Placer la négation autour de l’auxiliaire'), b('Place déjà, bien, encore', 'Placer déjà, bien, encore'), b('Tell a story in the passé composé', 'Raconter une histoire au passé composé')],
    13,
    [
      card(b('Around the auxiliary', 'Autour de l’auxiliaire'), b('The negation goes around the **auxiliary**: **je n’ai pas compris**, **elle n’est pas venue**, **il ne s’est pas levé**. Short adverbs go between the auxiliary and the participle: **j’ai déjà mangé**, **tu as bien dormi ?**, **il n’est pas encore arrivé**. Three ways to ask: **Tu as fini ?**, **Est-ce que tu as fini ?**, **As-tu fini ?**', 'La négation entoure l’**auxiliaire** : **je n’ai pas compris**, **elle n’est pas venue**, **il ne s’est pas levé**. Les adverbes courts se placent entre l’auxiliaire et le participe : **j’ai déjà mangé**, **tu as bien dormi ?**, **il n’est pas encore arrivé**. Trois façons de demander : **Tu as fini ?**, **Est-ce que tu as fini ?**, **As-tu fini ?**')),
      mc(P.form, ['Je n’ai pas compris la question.', 'Je n’ai compris pas la question.', 'Je ne pas ai compris la question.', 'J’ai ne pas compris la question.']),
      mc(P.form, ['Êtes-vous déjà allés à Québec ?', 'Êtes-vous allés déjà à Québec ?', 'Avez-vous déjà allés à Québec ?', 'Êtes-vous déjà aller à Québec ?']),
      ord(P.order, 'Elle n’est pas encore arrivée au bureau.', { tr: 'She hasn’t arrived at the office yet.' }),
      gap(P.completeText, 'Samedi dernier, nous ___ (partir) tôt. Nous ___ (prendre) le train, mais nous ___ (ne pas voir) la pluie arriver !', [['sommes partis', 'sommes parties'], ['avons pris'], ['n’avons pas vu']]),
      hear('Tu as bien dormi ?', b('What does the person ask?', 'Que demande la personne ?'), [b('If you slept well', 'Si vous avez bien dormi'), b('If you are going to sleep', 'Si vous allez dormir'), b('If you sleep well in general', 'Si vous dormez bien en général')]),
      dlg(b('Monday morning', 'Lundi matin'), b('Two colleagues talk about their weekend.', 'Deux collègues parlent de leur week-end.'), [['Claire', 'f'], ['Hugo', 'm']], [
        [0, 'Salut Hugo ! Tu as passé un bon week-end ?', 'Hi Hugo! Did you have a good weekend?'],
        [1, { options: ['Oui, je suis allé à la montagne avec des amis.', 'Oui, j’ai allé à la montagne avec des amis.', 'Oui, je suis aller à la montagne avec des amis.'] }],
        [0, 'Génial ! Vous avez fait du ski ?', 'Great! Did you go skiing?'],
        [1, { options: ['Non, il n’a pas neigé, mais nous avons beaucoup marché.', 'Non, il n’a neigé pas, mais nous avons beaucoup marché.', 'Non, il ne pas a neigé, mais nous sommes beaucoup marché.'] }],
        [0, 'Moi, je suis restée chez moi et j’ai lu tout le dimanche.', 'I stayed at home and read all Sunday.'],
      ]),
      write(b('Your last weekend', 'Votre dernier week-end'), b('In 40 to 70 words, tell what you did last weekend. Use at least two verbs with avoir, two verbs with être and one negative sentence.', 'En 40 à 70 mots, racontez ce que vous avez fait le week-end dernier. Employez au moins deux verbes avec avoir, deux verbes avec être et une phrase négative.'), 40, 70, [
        b('Two verbs with avoir', 'Deux verbes avec avoir'),
        b('Two verbs with être, agreed correctly', 'Deux verbes avec être, bien accordés'),
        b('One negative sentence', 'Une phrase négative'),
      ], 'Samedi, je me suis levée tard. L’après-midi, je suis allée au marché avec ma voisine et nous avons acheté des légumes. Le soir, des amis sont venus à la maison et nous avons préparé une soupe. Dimanche, il a plu, alors je ne suis pas sortie : j’ai regardé deux films et j’ai téléphoné à mes parents.'),
      say('Je n’ai pas encore fini, mais j’ai déjà fait la moitié.', 'I haven’t finished yet, but I’ve already done half.'),
    ],
    [
      b('Negation around the auxiliary: je n’ai pas vu, elle n’est pas venue.', 'Négation autour de l’auxiliaire : je n’ai pas vu, elle n’est pas venue.'),
      b('déjà, bien, encore, souvent: between the auxiliary and the participle.', 'déjà, bien, encore, souvent : entre l’auxiliaire et le participe.'),
      b('Inversion: As-tu fini ? Êtes-vous partis ?', 'Inversion : As-tu fini ? Êtes-vous partis ?'),
    ],
    [['passer un bon week-end', b('to have a good weekend', 'profiter de son week-end')], ['la moitié', b('half', 'une des deux parts égales')], ['pleuvoir (il a plu)', b('to rain (it rained)', 'tomber de la pluie')]],
  ),
];
