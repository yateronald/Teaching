import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right answer.', 'Choisissez la bonne réponse.');

const lessons: Lesson[] = [
  {
    id: 'negation-1',
    slug: { en: 'ne-pas', fr: 'ne-pas' },
    title: b('Ne… pas: the basic negation', 'Ne… pas : la négation de base'),
    summary: b('Build a negative sentence: ne before the verb, pas after, and what happens in speech.', 'Construire une phrase négative : ne avant le verbe, pas après, et ce qui se passe à l’oral.'),
    objectives: [b('Place ne… pas around the verb', 'Placer ne… pas autour du verbe'), b('Use n’ before a vowel', 'Employer n’ devant une voyelle'), b('Recognise the spoken negation without ne', 'Reconnaître la négation orale sans ne')],
    minutes: 12,
    steps: [
      card(b('Around the verb', 'Autour du verbe'), b('**ne** + conjugated verb + **pas**: Je **ne** travaille **pas** le lundi. Before a vowel or h: **n’**: Il **n’**aime **pas** le café. With an infinitive, both go before: Je préfère **ne pas** sortir.', '**ne** + verbe conjugué + **pas** : Je **ne** travaille **pas** le lundi. Devant une voyelle ou un h : **n’** : Il **n’**aime **pas** le café. Avec un infinitif, les deux se placent devant : Je préfère **ne pas** sortir.'), {
        examples: [{ fr: 'Je ne parle pas espagnol.', tr: 'I don’t speak Spanish.' }, { fr: 'Elle n’habite pas ici.', tr: 'She doesn’t live here.' }, { fr: 'Il est conseillé de ne pas fumer.', tr: 'It is advisable not to smoke.' }],
      }),
      card(b('In everyday speech', 'À l’oral courant'), b('In conversation, French speakers often **drop the ne**: “Je sais **pas**.” “C’est **pas** grave.” You will hear it everywhere, but **write** and use **ne** in exams and formal situations.', 'En conversation, on **supprime souvent le ne** : « Je sais **pas**. » « C’est **pas** grave. » Vous l’entendrez partout, mais **écrivez** et employez **ne** à l’examen et en situation formelle.'), { variant: 'culture' }),
      pick('A1', choose, ['n’aime pas', 'ne aime pas', 'aime ne pas', 'n’aime'], { fr: 'Mon fils ___ les légumes.' }),
      pick('A1', choose, ['ne pas', 'pas ne', 'ne', 'pas'], { fr: 'Attention à ___ oublier ton passeport !' }),
      pick('A1', b('Which sentence is correct written French?', 'Quelle phrase est correcte à l’écrit ?'), ['Je ne sais pas.', 'Je sais pas.', 'Je ne sais.', 'Je pas sais.']),
      { kind: 'fill', prompt: b('Make the sentences negative.', 'Mettez les phrases à la forme négative.'), text: 'Il ___ travaille ___ demain. Nous ___ avons ___ de voiture.', answers: [['ne'], ['pas'], ['n’', 'n\''], ['pas']] },
      { kind: 'order', prompt: b('Build the negative sentence.', 'Construisez la phrase négative.'), words: ['Elle', 'n’', 'habite', 'pas', 'à', 'Montréal.'], tr: 'She doesn’t live in Montréal.' },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je ne parle pas encore très bien français.', tr: 'I don’t speak French very well yet.' },
    ],
    notes: {
      points: [
        b('ne + verb + pas; n’ before a vowel or h.', 'ne + verbe + pas ; n’ devant une voyelle ou un h.'),
        b('With an infinitive: ne pas + infinitive (ne pas fumer).', 'Avec un infinitif : ne pas + infinitif (ne pas fumer).'),
        b('Spoken French often drops ne: je sais pas. Keep it in writing.', 'L’oral supprime souvent ne : je sais pas. Gardez-le à l’écrit.'),
        b('After pas, un / une / du / des become de: je n’ai pas de voiture.', 'Après pas, un / une / du / des deviennent de : je n’ai pas de voiture.'),
      ],
      vocab: [['encore', b('yet, still', 'jusqu’à maintenant')], ['grave', b('serious', 'important')], ['oublier', b('to forget', 'ne plus penser à')]],
    },
  },
  {
    id: 'negation-2',
    slug: { en: 'jamais-plus-rien-personne', fr: 'jamais-plus-rien-personne' },
    title: b('Jamais, plus, rien, personne', 'Jamais, plus, rien, personne'),
    summary: b('Go beyond pas: never, no longer, nothing, nobody, and their position.', 'Aller au-delà de pas : jamais, plus, rien, personne, et leur place.'),
    objectives: [b('Use ne… jamais / plus / rien / personne', 'Employer ne… jamais / plus / rien / personne'), b('Place rien and personne as subjects', 'Placer rien et personne en sujet'), b('Answer briefly: jamais, rien, personne', 'Répondre brièvement : jamais, rien, personne')],
    minutes: 13,
    steps: [
      card(b('Four other negations', 'Quatre autres négations'), b('**ne… jamais** (never), **ne… plus** (no longer, not any more), **ne… rien** (nothing), **ne… personne** (nobody). Same position as pas: Je **ne** fume **plus**. Il **ne** mange **rien**. Je **ne** connais **personne** ici.', '**ne… jamais**, **ne… plus**, **ne… rien**, **ne… personne**. Même place que pas : Je **ne** fume **plus**. Il **ne** mange **rien**. Je **ne** connais **personne** ici.'), {
        examples: [{ fr: 'Je ne bois jamais de café le soir.', tr: 'I never drink coffee in the evening.' }, { fr: 'Elle n’habite plus à Paris.', tr: 'She doesn’t live in Paris any more.' }, { fr: 'Il ne connaît personne dans cette ville.', tr: 'He doesn’t know anybody in this town.' }],
      }),
      { kind: 'match', prompt: b('Match each negation with its meaning.', 'Associez chaque négation à son sens.'), pairs: [['ne… jamais', 'never'], ['ne… plus', 'no longer'], ['ne… rien', 'nothing'], ['ne… personne', 'nobody'], ['ne… pas encore', 'not yet']] },
      pick('A2', choose, ['plus', 'jamais', 'rien', 'personne'], { fr: 'J’ai arrêté le sport : je ne cours ___.' }),
      pick('A2', choose, ['rien', 'personne', 'jamais', 'pas'], { fr: 'Il n’a ___ mangé depuis ce matin.' }),
      card(b('Rien and personne as subjects', 'Rien et personne en sujet'), b('They can start the sentence; **ne** stays before the verb and there is **no pas**: **Personne n’**est venu. **Rien n’**est impossible. Short answers: — Qui est là ? — **Personne.** — Tu veux quoi ? — **Rien.**', 'Ils peuvent commencer la phrase ; **ne** reste devant le verbe et il n’y a **pas de pas** : **Personne n’**est venu. **Rien n’**est impossible. Réponses brèves : — Qui est là ? — **Personne.**'), { variant: 'tip' }),
      pick('A2', b('Which sentence is correct?', 'Quelle phrase est correcte ?'), ['Personne n’a appelé.', 'Personne n’a pas appelé.', 'Personne a pas appelé.', 'Ne personne a appelé.']),
      { kind: 'fill', prompt: b('Answer negatively.', 'Répondez négativement.'), text: 'Tu vas souvent au cinéma ? — Non, je ne vais ___ au cinéma. Tu habites encore ici ? — Non, je n’habite ___ ici.', answers: [['jamais'], ['plus']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je ne connais personne ici, mais rien n’est impossible.', tr: 'I don’t know anybody here, but nothing is impossible.' },
    ],
    notes: {
      points: [
        b('ne… jamais (never), ne… plus (no longer), ne… rien (nothing), ne… personne (nobody).', 'ne… jamais, ne… plus, ne… rien, ne… personne.'),
        b('Never with pas: je ne mange rien (not “pas rien”).', 'Jamais avec pas : je ne mange rien (pas « pas rien »).'),
        b('Subject position: Personne n’est venu. Rien n’a changé.', 'En sujet : Personne n’est venu. Rien n’a changé.'),
        b('Ne… pas encore = not yet.', 'Ne… pas encore = pas jusqu’à maintenant.'),
      ],
      vocab: [['arrêter', b('to stop', 'ne plus faire')], ['courir', b('to run', 'aller vite à pied')], ['connaître', b('to know (a person, place)', 'avoir déjà rencontré')]],
    },
  },
  {
    id: 'negation-3',
    slug: { en: 'negation-with-past-and-pronouns', fr: 'negation-avec-le-passe-et-les-pronoms' },
    title: b('Negation with the past tense and pronouns', 'La négation au passé et avec les pronoms'),
    summary: b('Place the negation in compound tenses and with object pronouns.', 'Placer la négation aux temps composés et avec les pronoms compléments.'),
    objectives: [b('Negate the passé composé', 'Mettre le passé composé à la négative'), b('Place pronouns inside the negation', 'Placer les pronoms dans la négation'), b('Know the special place of personne', 'Connaître la place particulière de personne')],
    minutes: 13,
    steps: [
      card(b('Around the auxiliary', 'Autour de l’auxiliaire'), b('In the passé composé, the negation surrounds the **auxiliary** (avoir / être): Je **n’**ai **pas** compris. Elle **n’**est **jamais** venue. Exception: **personne** goes after the participle: Je n’ai vu **personne**.', 'Au passé composé, la négation entoure l’**auxiliaire** : Je **n’**ai **pas** compris. Elle **n’**est **jamais** venue. Exception : **personne** se place après le participe : Je n’ai vu **personne**.'), {
        examples: [{ fr: 'Je n’ai pas compris la question.', tr: 'I didn’t understand the question.' }, { fr: 'Nous ne sommes jamais allés au Japon.', tr: 'We have never been to Japan.' }, { fr: 'Il n’a rencontré personne.', tr: 'He didn’t meet anyone.' }],
      }),
      pick('A2', choose, ['n’ai pas vu', 'ai pas vu', 'n’ai vu pas', 'ne pas ai vu'], { fr: 'Je ___ ce film.' }),
      pick('A2', choose, ['n’ai vu personne', 'n’ai personne vu', 'ai vu personne', 'n’ai pas vu personne'], { fr: 'Dans le parc, je ___.' }),
      card(b('With pronouns', 'Avec les pronoms'), b('Object pronouns stay **glued to the verb**, inside the negation: Je **ne le** connais **pas**. Il **ne lui** a **pas** téléphoné. Je **n’y** vais **plus**. Je **n’en** veux **pas**.', 'Les pronoms compléments restent **collés au verbe**, à l’intérieur de la négation : Je **ne le** connais **pas**. Il **ne lui** a **pas** téléphoné. Je **n’y** vais **plus**. Je **n’en** veux **pas**.'), { variant: 'tip' }),
      pick('A2', choose, ['ne lui ai pas', 'ne ai lui pas', 'lui n’ai pas', 'n’ai pas lui'], { fr: 'Je ___ parlé.' }),
      pick('A2', choose, ['n’y vais plus', 'ne vais y plus', 'y ne vais plus', 'ne vais plus y'], { fr: 'Ce restaurant ? Je ___.' }),
      { kind: 'fill', prompt: b('Make the sentence negative.', 'Mettez la phrase à la forme négative.'), text: 'Elle est partie. → Elle ___ est ___ partie.', answers: [['n’', 'n\''], ['pas']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je ne l’ai pas encore vu, mais je n’ai rien oublié.', tr: 'I haven’t seen him yet, but I haven’t forgotten anything.' },
    ],
    notes: {
      points: [
        b('Compound tenses: ne + auxiliary + pas + participle (je n’ai pas compris).', 'Temps composés : ne + auxiliaire + pas + participe (je n’ai pas compris).'),
        b('Personne goes after the participle: je n’ai vu personne.', 'Personne se place après le participe : je n’ai vu personne.'),
        b('Pronouns inside the negation, before the verb: je ne le connais pas.', 'Pronoms à l’intérieur de la négation, devant le verbe : je ne le connais pas.'),
        b('Rien goes before the participle: je n’ai rien oublié.', 'Rien se place avant le participe : je n’ai rien oublié.'),
      ],
      vocab: [['comprendre', b('to understand', 'saisir le sens')], ['rencontrer', b('to meet', 'voir quelqu’un')], ['partir', b('to leave', 's’en aller')]],
    },
  },
];

export default lessons;
