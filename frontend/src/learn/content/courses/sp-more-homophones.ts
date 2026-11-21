import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ce or se? C’est, s’est, sait or sais? Ou or où? Ni or n’y? Si or s’y? Mais, mes or met? These homophones are not covered by the basic a/à, et/est, son/sont rules, yet they appear in almost every text you write. This course gives you a simple substitution test for each pair, trains them in context and ends with a proofreading dictation.',
    'Ce ou se ? C’est, s’est, sait ou sais ? Ou ou où ? Ni ou n’y ? Si ou s’y ? Mais, mes ou met ? Ces homophones ne sont pas couverts par les règles de base a/à, et/est, son/sont, et pourtant ils apparaissent dans presque tous vos textes. Ce cours vous donne un test de remplacement simple pour chaque paire, les entraîne en contexte et se termine par une dictée de relecture.',
  ),
  outcomes: [
    b('Choose ce / se and c’est / s’est / sait', 'Choisir ce / se et c’est / s’est / sait'),
    b('Choose ou / où', 'Choisir ou / où'),
    b('Choose ni / n’y, si / s’y', 'Choisir ni / n’y, si / s’y'),
    b('Choose mais / mes / met', 'Choisir mais / mes / met'),
  ],
};

const C = 'sp-more-homophones';
export default [
  lesson(C, 1, ['ce-se-cest-sest', 'ce-se-c-est-s-est'],
    b('ce / se, c’est / s’est / sait', 'ce / se, c’est / s’est / sait'),
    b('Use the cela and me tests to choose.', 'Utiliser les tests cela et me pour choisir.'),
    [b('ce = cela / this', 'ce = cela / cet'), b('se = reflexive (me, te)', 'se = réfléchi (me, te)'), b('sait / sais = savoir', 'sait / sais = savoir')],
    13,
    [
      card(b('The tests', 'Les tests'), b('**ce / c’** = demonstrative: replace by **cela**: **C’est beau** → cela est beau; **ce livre** → cet/ce. **se / s’** = reflexive pronoun before a verb: replace by **me**: **Il se lave** → je me lave; **Il s’est trompé** → je me suis trompé. **sait / sais** = verb **savoir**: replace by **savait**: **Il sait nager** → il savait nager.', '**ce / c’** = démonstratif : remplacez par **cela** : **C’est beau** → cela est beau ; **ce livre**. **se / s’** = pronom réfléchi devant un verbe : remplacez par **me** : **Il se lave** → je me lave ; **Il s’est trompé** → je me suis trompé. **sait / sais** = verbe **savoir** : remplacez par **savait** : **Il sait nager** → il savait nager.')),
      sort(b('c’est, s’est or sait?', 'c’est, s’est ou sait ?'), [b('c’est (cela est)', 'c’est (cela est)'), b('s’est (me suis)', 's’est (me suis)'), b('sait (savait)', 'sait (savait)')], [['… très joli.', 0], ['Elle … réveillée tôt.', 1], ['Il … conduire.', 2], ['… mon ami.', 0], ['Il … perdu.', 1], ['Qui … la réponse ?', 2]]),
      gap(P.complete, '___ matin, Paul ___ levé tard ; il ne ___ pas pourquoi. ___ bizarre.', ['Ce', 's’est', 'sait', 'C’est'], { strict: true }),
      mc(P.form, ['Elle se demande si c’est vrai.', 'Elle ce demande si s’est vrai.', 'Elle se demande si s’est vrai.', 'Elle ce demande si c’est vrai.']),
      dict('C’est étrange : il s’est trompé de route alors qu’il sait très bien lire une carte.', { strict: true }),
    ],
    [
      b('ce / c’ → cela; se / s’ → me; sait / sais → savait.', 'ce / c’ → cela ; se / s’ → me ; sait / sais → savait.'),
      b('s’est + participle = reflexive passé composé.', 's’est + participe = passé composé pronominal.'),
      b('je sais, tu sais, il sait.', 'je sais, tu sais, il sait.'),
    ],
    [['se tromper', b('to be mistaken', 'faire une erreur')], ['bizarre', b('strange', 'étrange')], ['une carte', b('a map', 'plan')]],
  ),
  lesson(C, 2, ['ou-ou-ni-ny-si-sy', 'ou-ou-ni-n-y-si-s-y'],
    b('ou / où, ni / n’y, si / s’y', 'ou / où, ni / n’y, si / s’y'),
    b('Choose with ou bien, the negation test and the reflexive test.', 'Choisir avec ou bien, le test de la négation et le test réfléchi.'),
    [b('ou = ou bien; où = place/time', 'ou = ou bien ; où = lieu/temps'), b('ni / n’y', 'ni / n’y'), b('si / s’y', 'si / s’y')],
    13,
    [
      card(b('The tests', 'Les tests'), b('**ou** = **ou bien** (or): **thé ou café ?** **où** = place or time: **Où vas-tu ? Le jour où…** **ni** = neither…nor: **ni thé ni café**; **n’y** = ne + y (there): **Je n’y vais pas** (→ je n’y vais = je ne vais pas là). **si** = if / so: **si tu veux, si beau**; **s’y** = se + y: **Il s’y habitue** (→ je m’y habitue).', '**ou** = **ou bien** : **thé ou café ?** **où** = lieu ou temps : **Où vas-tu ? Le jour où…** **ni** = négation double : **ni thé ni café** ; **n’y** = ne + y : **Je n’y vais pas**. **si** = condition / intensité : **si tu veux, si beau** ; **s’y** = se + y : **Il s’y habitue** (→ je m’y habitue).')),
      sort(b('Which word?', 'Quel mot ?'), [b('ou (ou bien)', 'ou (ou bien)'), b('où (place/time)', 'où (lieu/temps)')], [['du thé … du café', 0], ['… habites-tu ?', 1], ['aujourd’hui … demain', 0], ['le jour … je t’ai vu', 1], ['à pied … à vélo', 0], ['la ville … je suis né', 1]]),
      gap(P.complete, 'Je ne bois ___ thé ___ café. Le cinéma ? Je ___ vais jamais.', ['ni', 'ni', 'n’y'], { strict: true }),
      gap(P.complete, '___ tu aimes la mer, tu vas adorer Nice : on ___ sent bien tout de suite.', ['Si', 's’y'], { strict: true }),
      mc(P.form, ['Où que tu ailles, emporte ton parapluie ou ton manteau.', 'Ou que tu ailles, emporte ton parapluie où ton manteau.', 'Où que tu ailles, emporte ton parapluie où ton manteau.', 'Ou que tu ailles, emporte ton parapluie ou ton manteau.']),
      dict('Où vas-tu ce soir ? Je n’y vais pas, ni au cinéma ni au théâtre, sauf si tu viens.', { strict: true }),
    ],
    [
      b('ou = ou bien; où = place or time.', 'ou = ou bien ; où = lieu ou temps.'),
      b('ni… ni = neither… nor; n’y = ne + y.', 'ni… ni = négation double ; n’y = ne + y.'),
      b('si = if / so; s’y = se + y (je m’y…).', 'si = condition / intensité ; s’y = se + y (je m’y…).'),
    ],
    [['s’habituer', b('to get used to', 'prendre l’habitude')], ['un parapluie', b('an umbrella', 'contre la pluie')], ['emporter', b('to take along', 'prendre avec soi')]],
  ),
  lesson(C, 3, ['mais-mes-met-and-review', 'mais-mes-met-et-revision'],
    b('mais / mes / met, and review', 'mais / mes / met, et révision'),
    b('Choose mais, mes, met, and proofread a text with all the pairs.', 'Choisir mais, mes, met, et relire un texte avec toutes les paires.'),
    [b('mais = however; mes = my; met = mettre', 'mais = cependant ; mes = possessif ; met = mettre'), b('Review all pairs', 'Réviser toutes les paires'), b('Proofread a text', 'Relire un texte')],
    13,
    [
      card(b('mais, mes, met, mai', 'mais, mes, met, mai'), b('**mais** = **cependant** (but): **Il pleut, mais je sors.** **mes** = possessive, plural of **mon/ma**: **mes amis**. **met / mets** = verb **mettre**: replace by **mettait**: **Il met son manteau.** **mai** = the month.', '**mais** = **cependant** : **Il pleut, mais je sors.** **mes** = possessif, pluriel de **mon/ma** : **mes amis**. **met / mets** = verbe **mettre** : remplacez par **mettait** : **Il met son manteau.** **mai** = le mois.')),
      gap(P.complete, 'En ___ , il ___ toujours un pull, ___ ___ amis rient de lui.', ['mai', 'met', 'mais', 'mes'], { strict: true }),
      doc({ look: 'email', title: b('Email to correct', 'Courriel à corriger'), text: 'Bonjour Léa,\n\nSe matin, Marc ses levé tôt, mes il ne c’est pas réveillé à temps. Je ne sais pas ou il est allé ensuite. Si tu le vois, dis-lui que je n’y suis pour rien !\n\nMes amitiés,\nSam' }, b('Which corrections are needed?', 'Quelles corrections faut-il ?'), [b('Ce matin, s’est levé, mais, s’est (réveillé), où', 'Ce matin, s’est levé, mais, s’est (réveillé), où'), b('No correction', 'Aucune correction'), b('Only « ou » → « où »', 'Seulement « ou » → « où »'), b('« n’y » → « ni »', '« n’y » → « ni »')]),
      sort(b('Which test?', 'Quel test ?'), [b('cela', 'cela'), b('me', 'me'), b('ou bien', 'ou bien')], [['c’est', 0], ['s’est', 1], ['ou', 2], ['ce', 0], ['se', 1], ['ou (thé ou café)', 2]]),
      dict('Ce matin, mes voisins se sont disputés, mais où est le problème ? Je n’y comprends rien.', { strict: true }),
      write(b('Write a short message.', 'Écrivez un court message.'), b('Write a message (30–60 words) to a friend about your day, using at least five of these words correctly: ce, se, c’est, s’est, ou, où, si, s’y, mais, mes.', 'Écrivez un message (30–60 mots) à un ami sur votre journée, en employant correctement au moins cinq de ces mots : ce, se, c’est, s’est, ou, où, si, s’y, mais, mes.'), 30, 60, [
        b('At least five homophones', 'Au moins cinq homophones'),
        b('Each one checked with its test', 'Chacun vérifié par son test'),
      ], 'Salut ! Ce matin, je suis allée à la piscine où mes amis m’attendaient. C’est une piscine immense, mais l’eau était froide. Paul s’est baigné quand même ! Si tu veux, on y retourne samedi : on s’y amuse vraiment bien. Tu préfères le matin ou l’après-midi ?'),
    ],
    [
      b('mais = cependant; mes = my (plural); met = mettre; mai = month.', 'mais = cependant ; mes = possessif ; met = mettre ; mai = mois.'),
      b('One test per pair: cela, me, ou bien, savait, mettait.', 'Un test par paire : cela, me, ou bien, savait, mettait.'),
      b('Proofread specifically for homophones.', 'Relisez spécialement les homophones.'),
    ],
    [['se disputer', b('to argue', 'avoir une dispute')], ['n’y être pour rien', b('to have nothing to do with it', 'ne pas être responsable')], ['amitiés', b('best wishes (closing)', 'formule de fin amicale')]],
  ),
];
