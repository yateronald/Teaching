import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right answer.', 'Choisissez la bonne réponse.');

const lessons: Lesson[] = [
  {
    id: 'reflexive-verbs-1',
    slug: { en: 'reflexive-verbs-in-the-present', fr: 'verbes-pronominaux-au-present' },
    title: b('Reflexive verbs in the present', 'Les verbes pronominaux au présent'),
    summary: b('Conjugate se lever, s’habiller, se coucher with the right pronoun.', 'Conjuguer se lever, s’habiller, se coucher avec le bon pronom.'),
    objectives: [b('Use me, te, se, nous, vous, se', 'Employer me, te, se, nous, vous, se'), b('Elide before a vowel: m’, t’, s’', 'Élider devant une voyelle : m’, t’, s’'), b('Make reflexive verbs negative', 'Mettre les verbes pronominaux à la négative')],
    minutes: 12,
    steps: [
      card(b('A pronoun that matches the subject', 'Un pronom qui correspond au sujet'), b('Reflexive verbs have a pronoun that refers to the subject: je **me** lève, tu **te** lèves, il / elle **se** lève, nous **nous** levons, vous **vous** levez, ils / elles **se** lèvent. Before a vowel: je **m’**habille, il **s’**appelle.', 'Les verbes pronominaux ont un pronom qui renvoie au sujet : je **me** lève, tu **te** lèves, il / elle **se** lève, nous **nous** levons, vous **vous** levez, ils / elles **se** lèvent. Devant une voyelle : je **m’**habille, il **s’**appelle.')),
      { kind: 'conjugate', prompt: b('Conjugate se coucher in the present.', 'Conjuguez se coucher au présent.'), verb: 'se coucher', tense: b('present', 'présent'), forms: [['je', 'me couche'], ['tu', 'te couches'], ['il / elle', 'se couche'], ['nous', 'nous couchons'], ['vous', 'vous couchez'], ['ils / elles', 'se couchent']], given: [0] },
      pick('A2', choose, ['nous', 'se', 'nos', 'vous'], { fr: 'Le dimanche, nous ___ reposons.' }),
      pick('A2', choose, ['m’', 'me', 'se', 'te'], { fr: 'Je ___ habille en cinq minutes.' }),
      card(b('Negation and questions', 'Négation et questions'), b('The pronoun stays glued to the verb: Je **ne me** lève **pas** tôt. Tu **te** couches à quelle heure ? With an infinitive, the pronoun matches the subject: Je vais **me** reposer. Nous devons **nous** dépêcher.', 'Le pronom reste collé au verbe : Je **ne me** lève **pas** tôt. Tu **te** couches à quelle heure ? Avec un infinitif, le pronom correspond au sujet : Je vais **me** reposer. Nous devons **nous** dépêcher.'), { variant: 'tip' }),
      pick('A2', b('Which sentence is correct?', 'Quelle phrase est correcte ?'), ['Je ne me réveille pas avant 8 h.', 'Je me ne réveille pas avant 8 h.', 'Je ne réveille me pas avant 8 h.', 'Ne je me réveille pas avant 8 h.']),
      pick('A2', choose, ['me', 'se', 'te', 'nous'], { fr: 'Je vais ___ promener au parc.' }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je me lève à six heures, je me douche et je m’habille.', tr: 'I get up at six, I shower and I get dressed.' },
    ],
    notes: {
      points: [
        b('me, te, se, nous, vous, se + verb; m’, t’, s’ before a vowel.', 'me, te, se, nous, vous, se + verbe ; m’, t’, s’ devant une voyelle.'),
        b('Negation: je ne me lève pas (ne before the pronoun).', 'Négation : je ne me lève pas (ne avant le pronom).'),
        b('With an infinitive, the pronoun matches the subject: je vais me reposer.', 'Avec un infinitif, le pronom correspond au sujet : je vais me reposer.'),
        b('Daily routine verbs: se réveiller, se lever, se laver, s’habiller, se coucher.', 'Verbes de la routine : se réveiller, se lever, se laver, s’habiller, se coucher.'),
      ],
      vocab: [['se dépêcher', b('to hurry', 'aller vite')], ['se promener', b('to go for a walk', 'marcher pour le plaisir')], ['se doucher', b('to shower', 'prendre une douche')], ['se réveiller', b('to wake up', 'sortir du sommeil')]],
    },
  },
  {
    id: 'reflexive-verbs-2',
    slug: { en: 'reflexive-verbs-in-the-past', fr: 'verbes-pronominaux-au-passe' },
    title: b('Reflexive verbs in the passé composé', 'Les verbes pronominaux au passé composé'),
    summary: b('Use être with reflexive verbs and make the participle agree.', 'Employer être avec les verbes pronominaux et accorder le participe.'),
    objectives: [b('Use être as the auxiliary', 'Employer être comme auxiliaire'), b('Make the participle agree with the subject', 'Accorder le participe avec le sujet'), b('Place the negation', 'Placer la négation')],
    minutes: 13,
    steps: [
      card(b('Always être', 'Toujours être'), b('In the passé composé, reflexive verbs **always** take **être**, and the participle usually **agrees** with the subject: Il **s’est levé**. Elle **s’est levée**. Ils **se sont levés**. Elles **se sont levées**.', 'Au passé composé, les verbes pronominaux prennent **toujours être**, et le participe **s’accorde** en général avec le sujet : Il **s’est levé**. Elle **s’est levée**. Ils **se sont levés**. Elles **se sont levées**.'), {
        examples: [{ fr: 'Ce matin, je me suis réveillé en retard.', tr: 'This morning I woke up late.' }, { fr: 'Elle s’est habillée très vite.', tr: 'She got dressed very quickly.' }, { fr: 'Nous nous sommes rencontrés à Montréal.', tr: 'We met in Montréal.' }],
      }),
      pick('A2', choose, ['s’est levée', 's’a levée', 'est levée', 's’est levé'], { fr: 'Hier, Sophie ___ à six heures.' }),
      pick('A2', choose, ['nous sommes promenés', 'avons promené', 'nous avons promenés', 'sommes promenés'], { fr: 'Dimanche, nous ___ au bord du fleuve.' }),
      pick('A2', choose, ['se sont mariées', 'se sont mariés', 'ont mariées', 's’est mariées'], { fr: 'Mes deux cousines ___ l’an dernier.' }),
      card(b('Negation in the past', 'La négation au passé'), b('**ne** + pronoun + **être** + **pas** + participle: Je **ne me suis pas** réveillé. Elle **ne s’est jamais** ennuyée.', '**ne** + pronom + **être** + **pas** + participe : Je **ne me suis pas** réveillé. Elle **ne s’est jamais** ennuyée.'), { variant: 'tip' }),
      pick('A2', b('Which sentence is correct?', 'Quelle phrase est correcte ?'), ['Il ne s’est pas rasé ce matin.', 'Il ne s’a pas rasé ce matin.', 'Il s’est ne pas rasé ce matin.', 'Il ne est pas se rasé ce matin.']),
      { kind: 'fill', prompt: b('Put the verb in the passé composé.', 'Mettez le verbe au passé composé.'), text: 'Hier soir, elle ___ (se coucher) tard.', answers: [['s’est couchée', 's\'est couchée']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Nous nous sommes rencontrés à Montréal il y a cinq ans.', tr: 'We met in Montréal five years ago.' },
    ],
    notes: {
      points: [
        b('Reflexive verbs always take être in compound tenses.', 'Les verbes pronominaux prennent toujours être aux temps composés.'),
        b('The participle usually agrees with the subject: elle s’est levée.', 'Le participe s’accorde en général avec le sujet : elle s’est levée.'),
        b('Negation: je ne me suis pas levé.', 'Négation : je ne me suis pas levé.'),
        b('Exception (advanced): elle s’est lavé les mains (the object follows: no agreement).', 'Exception (avancé) : elle s’est lavé les mains (le COD suit : pas d’accord).'),
      ],
      vocab: [['se raser', b('to shave', 'couper sa barbe')], ['se marier', b('to get married', 'faire un mariage')], ['s’ennuyer', b('to be bored', 'ne pas savoir quoi faire')], ['le fleuve', b('river (to the sea)', 'grande rivière')]],
    },
  },
  {
    id: 'reflexive-verbs-3',
    slug: { en: 'reciprocal-and-idiomatic-verbs', fr: 'verbes-reciproques-et-idiomatiques' },
    title: b('Reciprocal and idiomatic reflexive verbs', 'Verbes réciproques et idiomatiques'),
    summary: b('Use reflexive verbs for “each other” and learn verbs whose meaning changes: s’entendre, se rendre compte.', 'Employer les verbes pronominaux pour « l’un l’autre » et apprendre les verbes dont le sens change : s’entendre, se rendre compte.'),
    objectives: [b('Express reciprocity', 'Exprimer la réciprocité'), b('Learn ten idiomatic reflexive verbs', 'Apprendre dix verbes pronominaux idiomatiques'), b('Distinguish verb and reflexive verb', 'Distinguer verbe simple et verbe pronominal')],
    minutes: 13,
    steps: [
      card(b('Each other', 'L’un l’autre'), b('In the plural, reflexive verbs often mean **each other**: Ils **s’aiment** (they love each other). Nous **nous téléphonons** tous les jours. Vous **vous écrivez** ?', 'Au pluriel, les verbes pronominaux signifient souvent **l’un l’autre** : Ils **s’aiment**. Nous **nous téléphonons** tous les jours. Vous **vous écrivez** ?'), {
        examples: [{ fr: 'On se voit demain ?', tr: 'Shall we see each other tomorrow?' }, { fr: 'Mes sœurs se ressemblent beaucoup.', tr: 'My sisters look very much alike.' }],
      }),
      card(b('When the meaning changes', 'Quand le sens change'), b('Some verbs change meaning when reflexive: **entendre** (to hear) / **s’entendre** (to get along); **rendre** (to give back) / **se rendre compte** (to realise); **passer** / **se passer** (to happen); **tromper** (to deceive) / **se tromper** (to be wrong); **douter** / **se douter** (to suspect).', 'Certains verbes changent de sens à la forme pronominale : **entendre** / **s’entendre** (avoir de bonnes relations) ; **rendre** / **se rendre compte** (comprendre soudain) ; **passer** / **se passer** (arriver) ; **tromper** / **se tromper** (faire une erreur) ; **douter** / **se douter** (deviner).'), { variant: 'tip' }),
      { kind: 'match', prompt: b('Match each reflexive verb with its meaning.', 'Associez chaque verbe pronominal à son sens.'), pairs: [['s’entendre bien', b('to get along', 'avoir de bonnes relations')], ['se rendre compte', b('to realise', 'comprendre soudain')], ['se tromper', b('to be wrong', 'faire une erreur')], ['se passer', b('to happen', 'arriver')], ['se débrouiller', b('to manage, cope', 'trouver une solution seul')]] },
      pick('B1', choose, ['m’entends', 'entends', 'm’entend', 'me entends'], { fr: 'Je ___ très bien avec mes collègues.' }),
      pick('B1', choose, ['s’est passé', 'a passé', 'est passé', 's’a passé'], { fr: 'Qu’est-ce qui ___ hier soir ?' }),
      pick('B1', choose, ['me suis trompé', 'ai trompé', 'me suis trompée de lui', 'suis trompé'], { fr: 'Excusez-moi, je ___ de numéro.' }),
      { kind: 'fill', prompt: b('Complete.', 'Complétez.'), text: 'Je ne me suis pas rendu ___ de l’heure. Ne t’inquiète pas, je me ___ toujours !', answers: [['compte'], ['débrouille']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je m’entends très bien avec mes voisins : on se voit souvent.', tr: 'I get along very well with my neighbours: we see each other often.' },
    ],
    notes: {
      points: [
        b('Plural reflexive = each other: ils s’aiment, on se voit demain.', 'Pronominal au pluriel = l’un l’autre : ils s’aiment, on se voit demain.'),
        b('Meaning changes: s’entendre (get along), se rendre compte (realise), se tromper (be wrong).', 'Sens différent : s’entendre, se rendre compte, se tromper.'),
        b('Se passer = to happen: Qu’est-ce qui se passe ?', 'Se passer = arriver : Qu’est-ce qui se passe ?'),
        b('Se débrouiller = to manage on your own (very common).', 'Se débrouiller = trouver une solution seul (très courant).'),
      ],
      vocab: [['se ressembler', b('to look alike', 'avoir l’air pareil')], ['s’inquiéter', b('to worry', 'se faire du souci')], ['se douter de', b('to suspect', 'deviner')], ['se débrouiller', b('to manage', 's’en sortir')]],
    },
  },
];

export default lessons;
