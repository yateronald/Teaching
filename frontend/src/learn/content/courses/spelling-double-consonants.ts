import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right spelling.', 'Choisissez la bonne orthographe.');

const lessons: Lesson[] = [
  {
    id: 'spelling-double-consonants-1',
    slug: { en: 'double-consonants-in-words', fr: 'consonnes-doubles-dans-les-mots' },
    title: b('Double consonants in common words', 'Les consonnes doubles dans les mots courants'),
    summary: b('Learn the patterns: -elle, -onne, -enne, -ette, and words that start with ap-, ac-, ef-.', 'Apprendre les régularités : -elle, -onne, -enne, -ette, et les mots qui commencent par ap-, ac-, ef-.'),
    objectives: [b('Double the n and l in feminine endings', 'Doubler n et l dans les terminaisons féminines'), b('Spell common words with ap-, ac-, at-, ef-', 'Écrire les mots courants en ap-, ac-, at-, ef-'), b('Avoid doubling where French has one letter', 'Ne pas doubler là où le français n’a qu’une lettre')],
    minutes: 13,
    steps: [
      card(b('Feminine endings that double', 'Les féminins qui doublent'), b('Many adjectives and nouns **double** their final consonant in the feminine: bon → **bonne**, canadien → **canadienne**, cruel → **cruelle**, muet → **muette**, gros → **grosse**. Exceptions in -et: complet → **complète**, inquiet → **inquiète**.', 'Beaucoup d’adjectifs et de noms **doublent** leur consonne finale au féminin : bon → **bonne**, canadien → **canadienne**, cruel → **cruelle**, muet → **muette**, gros → **grosse**. Exceptions en -et : complet → **complète**, inquiet → **inquiète**.'), {
        examples: [{ fr: 'une bonne nouvelle', tr: 'good news' }, { fr: 'une famille canadienne', tr: 'a Canadian family' }],
      }),
      pick('B1', choose, ['ancienne', 'anciene', 'ancièneé', 'anciènne'], { fr: 'C’est une ___ maison.' }),
      pick('B1', choose, ['naturelle', 'naturele', 'naturèle', 'natturelle'], { fr: 'Une eau ___.' }),
      card(b('Beginnings that double', 'Les débuts qui doublent'), b('After **a-** at the start, the consonant is often double: **app**eler, **app**rendre, **acc**epter, **att**endre, **arr**iver, **all**er. After **e-**: **eff**ort, **ess**ayer, **ell**e. English cognates often have one letter less or more: **adresse** (address), **appartement** (apartment), **personnel**, **développement**.', 'Après **a-** en début de mot, la consonne est souvent double : **app**eler, **app**rendre, **acc**epter, **att**endre, **arr**iver. Après **e-** : **eff**ort, **ess**ayer. Attention aux mots proches de l’anglais : **adresse** (address), **appartement** (apartment), **personnel**, **développement**.'), { variant: 'trap' }),
      pick('B1', choose, ['adresse', 'address', 'addresse', 'adrese'], { fr: 'Quelle est votre ___ ?' }),
      pick('B1', choose, ['appartement', 'apartement', 'appartment', 'apartment'], { fr: 'Nous louons un ___ au centre-ville.' }),
      pick('B1', choose, ['développement', 'dévelopement', 'développemment', 'devellopement'], { fr: 'Le ___ durable est une priorité.' }),
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Elle attend une bonne nouvelle de son appartement.', voice: 'f', strict: true },
    ],
    notes: {
      points: [
        b('Feminines that double: -onne, -enne, -elle, -ette, -esse (bonne, canadienne, cruelle, muette, grosse).', 'Féminins qui doublent : -onne, -enne, -elle, -ette, -esse (bonne, canadienne, cruelle, muette, grosse).'),
        b('Exceptions: complète, inquiète, secrète.', 'Exceptions : complète, inquiète, secrète.'),
        b('Double after a- at the start: appeler, accepter, attendre, arriver.', 'Double après a- en début de mot : appeler, accepter, attendre, arriver.'),
        b('False friends: adresse, appartement, développement, personnel.', 'Faux amis : adresse, appartement, développement, personnel.'),
      ],
      vocab: [['la nouvelle', b('news', 'information')], ['durable', b('sustainable', 'qui dure')], ['muet', b('mute, silent', 'qui ne parle pas')]],
    },
  },
  {
    id: 'spelling-double-consonants-2',
    slug: { en: 'appeler-jeter-and-similar-verbs', fr: 'appeler-jeter-et-verbes-semblables' },
    title: b('Appeler, jeter and verbs that double', 'Appeler, jeter et les verbes qui doublent'),
    summary: b('Know when appeler and jeter double their consonant, and when acheter takes an accent instead.', 'Savoir quand appeler et jeter doublent leur consonne, et quand acheter prend plutôt un accent.'),
    objectives: [b('Conjugate appeler and jeter', 'Conjuguer appeler et jeter'), b('Know verbs with è instead: acheter, geler', 'Connaître les verbes avec è : acheter, geler'), b('Apply the rule in future and conditional', 'Appliquer la règle au futur et au conditionnel')],
    minutes: 13,
    steps: [
      card(b('Double before a silent e', 'Doubler devant un e muet'), b('**Appeler** and **jeter** double their consonant when the next **e is silent**: j’appe**ll**e, tu je**tt**es, ils appe**ll**ent, j’appe**ll**erai. But not with nous / vous: nous appe**l**ons, vous je**t**ez.', '**Appeler** et **jeter** doublent leur consonne quand le **e suivant est muet** : j’appe**ll**e, tu je**tt**es, ils appe**ll**ent, j’appe**ll**erai. Mais pas avec nous / vous : nous appe**l**ons, vous je**t**ez.')),
      { kind: 'conjugate', prompt: b('Conjugate appeler in the present.', 'Conjuguez appeler au présent.'), verb: 'appeler', tense: b('present', 'présent'), forms: [['j’', 'appelle'], ['tu', 'appelles'], ['il / elle', 'appelle'], ['nous', 'appelons'], ['vous', 'appelez'], ['ils / elles', 'appellent']], given: [0] },
      card(b('Or an accent instead', 'Ou un accent à la place'), b('Some verbs take **è** instead of doubling: **acheter** → j’ach**è**te, **geler** → il g**è**le, **peser** → je p**è**se, **lever** → je l**è**ve. Learn them as a list.', 'Certains verbes prennent **è** au lieu de doubler : **acheter** → j’ach**è**te, **geler** → il g**è**le, **peser** → je p**è**se, **lever** → je l**è**ve. Apprenez-les en liste.'), { variant: 'tip' }),
      pick('B1', choose, ['jette', 'jète', 'jete', 'jettes'], { fr: 'Je ___ mes vieux papiers au recyclage.' }),
      pick('B1', choose, ['achète', 'achette', 'achete', 'achètte'], { fr: 'Elle ___ du pain tous les matins.' }),
      pick('B1', choose, ['appelons', 'appellons', 'apelons', 'appelon'], { fr: 'Nous vous ___ demain.' }),
      pick('B1', choose, ['appellerai', 'appelerai', 'apellerai', 'appèlerai'], { fr: 'Je t’___ ce soir.' }),
      { kind: 'fill', prompt: b('Write the verb in the present.', 'Écrivez le verbe au présent.'), text: 'Comment tu t’___ (appeler) ? — Je m’___ (appeler) Ana.', answers: [['appelles'], ['appelle']], strict: true },
    ],
    notes: {
      points: [
        b('Appeler, jeter: double before a silent e (j’appelle, je jette, j’appellerai).', 'Appeler, jeter : doublent devant un e muet (j’appelle, je jette, j’appellerai).'),
        b('No doubling with nous / vous: nous appelons, vous jetez.', 'Pas de doublement avec nous / vous : nous appelons, vous jetez.'),
        b('Accent instead: acheter (j’achète), geler, peser, lever, mener.', 'Accent à la place : acheter (j’achète), geler, peser, lever, mener.'),
        b('Since 1990, most -eler / -eter verbs may also take è (j’époussète), except appeler and jeter.', 'Depuis 1990, la plupart des verbes en -eler / -eter peuvent prendre è (j’époussète), sauf appeler et jeter.'),
      ],
      vocab: [['jeter', b('to throw away', 'mettre à la poubelle')], ['geler', b('to freeze', 'devenir glace')], ['peser', b('to weigh', 'mesurer le poids')]],
    },
  },
  {
    id: 'spelling-double-consonants-3',
    slug: { en: 'm-before-b-and-p-and-other-rules', fr: 'm-devant-b-et-p-et-autres-regles' },
    title: b('M before b and p, and -tion or -ssion', 'M devant b et p, et -tion ou -ssion'),
    summary: b('Write m before b and p, choose between -tion, -ssion and -sion, and spell common adverbs in -ment.', 'Écrire m devant b et p, choisir entre -tion, -ssion et -sion, et écrire les adverbes courants en -ment.'),
    objectives: [b('Apply the m before b / p rule', 'Appliquer la règle du m devant b / p'), b('Choose -tion, -ssion or -sion', 'Choisir -tion, -ssion ou -sion'), b('Spell adverbs in -amment / -emment', 'Écrire les adverbes en -amment / -emment')],
    minutes: 13,
    steps: [
      card(b('M before b, p (and m)', 'M devant b, p (et m)'), b('Before **b**, **p** and **m**, the n of a nasal becomes **m**: **em**porter, **im**portant, **com**bien, **tem**ps, **em**mener. Exception: **bonbon**, **néanmoins**.', 'Devant **b**, **p** et **m**, le n d’une nasale devient **m** : **em**porter, **im**portant, **com**bien, **tem**ps, **em**mener. Exceptions : **bonbon**, **néanmoins**.')),
      pick('B1', choose, ['important', 'inportant', 'imporrtant', 'importent'], { fr: 'C’est un rendez-vous très ___.' }),
      pick('B1', choose, ['combien', 'conbien', 'commbien', 'combiens'], { fr: 'Ça coûte ___ ?' }),
      card(b('-tion, -ssion or -sion?', '-tion, -ssion ou -sion ?'), b('**-tion** is the most frequent: na**tion**, ques**tion**, informa**tion**. **-ssion** after a vowel when the verb has ss or a related word: discu**ssion** (discuter), profe**ssion**, mi**ssion**. **-sion** after a consonant: ver**sion**, pen**sion**, expan**sion**.', '**-tion** est le plus fréquent : nation, question, information. **-ssion** après une voyelle, souvent quand un mot de la famille a ss : discussion, profession, mission. **-sion** après une consonne : version, pension, expansion.'), { variant: 'tip' }),
      pick('B1', choose, ['discussion', 'discution', 'discusion', 'discucion'], { fr: 'Nous avons eu une longue ___.' }),
      card(b('Adverbs: -amment, -emment', 'Adverbes : -amment, -emment'), b('Adjectives in **-ant** → **-amment**: courant → cour**amment**, constant → const**amment**. In **-ent** → **-emment** (same sound!): récent → réc**emment**, évident → évid**emment**. Both sound [amɑ̃].', 'Adjectifs en **-ant** → **-amment** : courant → couramment. En **-ent** → **-emment** (même son !) : récent → récemment, évident → évidemment.'), { variant: 'trap' }),
      pick('B1', choose, ['couramment', 'couremment', 'courament', 'courammant'], { fr: 'Elle parle ___ trois langues.' }),
      pick('B1', choose, ['récemment', 'récamment', 'récement', 'récemmant'], { fr: 'Ils ont déménagé ___.' }),
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Évidemment, cette question est importante.', voice: 'm', strict: true },
    ],
    notes: {
      points: [
        b('m before b, p, m: important, combien, emmener (exceptions: bonbon, néanmoins).', 'm devant b, p, m : important, combien, emmener (exceptions : bonbon, néanmoins).'),
        b('-tion (most frequent), -ssion (discussion, profession), -sion after a consonant (version).', '-tion (le plus fréquent), -ssion (discussion, profession), -sion après une consonne (version).'),
        b('-ant → -amment (couramment); -ent → -emment (récemment).', '-ant → -amment (couramment) ; -ent → -emment (récemment).'),
        b('-amment and -emment are pronounced the same: think of the adjective.', '-amment et -emment se prononcent pareil : pensez à l’adjectif.'),
      ],
      vocab: [['couramment', b('fluently', 'avec aisance')], ['récemment', b('recently', 'il y a peu de temps')], ['évidemment', b('obviously', 'bien sûr')], ['emmener', b('to take (someone)', 'conduire quelqu’un')]],
    },
  },
];

export default lessons;
