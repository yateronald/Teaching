import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'asking-questions-1',
    slug: { en: 'yes-no-questions', fr: 'questions-oui-non' },
    title: b('Yes/no questions', 'Les questions fermées (oui / non)'),
    summary: b('Ask a yes/no question in three ways and answer with oui, non or si.', 'Poser une question fermée de trois façons et répondre par oui, non ou si.'),
    objectives: [b('Ask with intonation and est-ce que', 'Demander avec l’intonation et est-ce que'), b('Recognise inversion', 'Reconnaître l’inversion'), b('Answer “si” to a negative question', 'Répondre « si » à une question négative')],
    minutes: 12,
    steps: [
      card(b('Three ways to ask', 'Trois façons de demander'), b('1. **Intonation** (everyday speech): Tu parles français ↗ ? 2. **Est-ce que** (neutral, always correct): **Est-ce que** tu parles français ? 3. **Inversion** (formal): **Parles-tu** français ? Start with the first two; recognise the third.', '1. **Intonation** (oral courant) : Tu parles français ↗ ? 2. **Est-ce que** (neutre, toujours correct) : **Est-ce que** tu parles français ? 3. **Inversion** (soutenu) : **Parles-tu** français ? Commencez par les deux premières ; reconnaissez la troisième.'), {
        examples: [{ fr: 'Tu es canadien ?', tr: 'Are you Canadian? (intonation)' }, { fr: 'Est-ce que vous avez des enfants ?', tr: 'Do you have children? (est-ce que)' }, { fr: 'Parlez-vous anglais ?', tr: 'Do you speak English? (inversion)' }],
      }),
      pick('A1', b('Which question uses est-ce que correctly?', 'Quelle question emploie correctement est-ce que ?'), ['Est-ce que tu habites ici ?', 'Est-ce que habites-tu ici ?', 'Tu est-ce que habites ici ?', 'Est-ce tu habites ici ?']),
      pick('A1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['Est-ce qu’', 'Est-ce que', 'Qu’est-ce', 'Est-ce'], { fr: '___ il travaille demain ?', explain: b('que → qu’ before a vowel.', 'que → qu’ devant une voyelle.') }),
      card(b('Oui, non… and si!', 'Oui, non… et si !'), b('To contradict a **negative** question, French uses **si**: — Tu n’aimes pas le café ? — **Si**, j’adore ça ! (= yes, I do). — Tu n’es pas fatigué ? — **Non**, ça va. (= agreeing: no, I’m not).', 'Pour contredire une question **négative**, on répond **si** : — Tu n’aimes pas le café ? — **Si**, j’adore ça ! — Tu n’es pas fatigué ? — **Non**, ça va.'), { variant: 'tip', examples: [{ fr: 'Tu ne viens pas ce soir ? Si, je viens !', tr: 'You’re not coming tonight? Yes, I am!' }] }),
      pick('A1', b('“Vous ne parlez pas français ?” You DO speak French. You answer:', '« Vous ne parlez pas français ? » Vous parlez français. Vous répondez :'), ['Si, un peu.', 'Oui, un peu.', 'Non, un peu.', 'Pas si.']),
      pick('A1', b('Which question is formal (inversion)?', 'Quelle question est soutenue (inversion) ?'), ['Avez-vous une réservation ?', 'Vous avez une réservation ?', 'Est-ce que vous avez une réservation ?', 'Une réservation ?']),
      { kind: 'order', prompt: b('Build the question.', 'Construisez la question.'), words: ['Est-ce', 'que', 'vous', 'avez', 'des', 'enfants', '?'], tr: 'Do you have children?' },
      { kind: 'speak', prompt: b('Ask aloud with rising intonation.', 'Posez la question avec une intonation montante.'), text: 'Tu parles français ?', tr: 'Do you speak French?', tip: b('Let your voice rise on the last syllable.', 'Faites monter la voix sur la dernière syllabe.') },
    ],
    notes: {
      points: [
        b('Intonation: Tu parles français ? (voice rises).', 'Intonation : Tu parles français ? (la voix monte).'),
        b('Est-ce que + sentence: Est-ce que tu parles français ? (qu’ before a vowel).', 'Est-ce que + phrase : Est-ce que tu parles français ? (qu’ devant une voyelle).'),
        b('Inversion (formal): Parlez-vous français ?', 'Inversion (soutenu) : Parlez-vous français ?'),
        b('“Si” answers yes to a negative question.', '« Si » répond oui à une question négative.'),
      ],
      vocab: [['la réservation', b('booking', 'place réservée')], ['un peu', b('a little', 'pas beaucoup')], ['fatigué', b('tired', 'qui a besoin de repos')]],
    },
  },
  {
    id: 'asking-questions-2',
    slug: { en: 'question-words', fr: 'les-mots-interrogatifs' },
    title: b('Question words: où, quand, comment, pourquoi…', 'Les mots interrogatifs : où, quand, comment, pourquoi…'),
    summary: b('Ask open questions with question words and answer them.', 'Poser des questions ouvertes avec les mots interrogatifs et y répondre.'),
    objectives: [b('Use eight question words', 'Employer huit mots interrogatifs'), b('Place the question word correctly', 'Placer correctement le mot interrogatif'), b('Answer pourquoi with parce que', 'Répondre à pourquoi avec parce que')],
    minutes: 13,
    steps: [
      { kind: 'match', prompt: b('Match each question word with its meaning.', 'Associez chaque mot interrogatif à son sens.'), pairs: [['où', 'where'], ['quand', 'when'], ['comment', 'how'], ['pourquoi', 'why'], ['combien', 'how much / how many'], ['qui', 'who']] },
      card(b('Where does the question word go?', 'Où se place le mot interrogatif ?'), b('In speech, often **at the end**: Tu habites **où** ? Tu pars **quand** ? With est-ce que, **at the start**: **Où est-ce que** tu habites ? **Quand est-ce que** tu pars ? **Pourquoi** → answer with **parce que**.', 'À l’oral, souvent **à la fin** : Tu habites **où** ? Tu pars **quand** ? Avec est-ce que, **au début** : **Où est-ce que** tu habites ? **Pourquoi** → répondez par **parce que**.'), {
        examples: [{ fr: 'Tu habites où ?', tr: 'Where do you live?' }, { fr: 'Comment est-ce que tu vas au travail ?', tr: 'How do you get to work?' }, { fr: 'Pourquoi tu apprends le français ? Parce que je veux vivre au Québec.', tr: 'Why are you learning French? Because I want to live in Québec.' }],
      }),
      card(b('Quel, quelle, quels, quelles', 'Quel, quelle, quels, quelles'), b('**Quel** (which / what) agrees with the noun: **Quel** âge as-tu ? **Quelle** heure est-il ? **Quels** sports tu aimes ? **Quelles** langues tu parles ?', '**Quel** s’accorde avec le nom : **Quel** âge as-tu ? **Quelle** heure est-il ? **Quels** sports tu aimes ? **Quelles** langues tu parles ?'), { variant: 'tip' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['Combien', 'Comment', 'Quand', 'Où'], { fr: '___ coûte ce livre ?' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['Quelle', 'Quel', 'Quels', 'Quelles'], { fr: '___ est ta couleur préférée ?' }),
      pick('A1', b('“Pourquoi tu es en retard ?” Best answer:', '« Pourquoi tu es en retard ? » Meilleure réponse :'), ['Parce que mon bus est en panne.', 'Pour mon bus.', 'Oui, je suis en retard.', 'Demain.']),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['qui', 'que', 'quoi', 'quel'], { fr: 'Avec ___ tu vas au cinéma ?' }),
      { kind: 'fill', prompt: b('Complete the questions.', 'Complétez les questions.'), text: '___ est-ce que tu habites ? — À Laval. ___ est-ce que tu arrives ? — Demain.', answers: [['Où'], ['Quand']] },
      { kind: 'speak', prompt: b('Ask aloud.', 'Posez la question à voix haute.'), text: 'Pourquoi est-ce que vous apprenez le français ?', tr: 'Why are you learning French?' },
    ],
    notes: {
      points: [
        b('où, quand, comment, pourquoi, combien, qui, que / quoi, quel.', 'où, quand, comment, pourquoi, combien, qui, que / quoi, quel.'),
        b('Oral: Tu habites où ? With est-ce que: Où est-ce que tu habites ?', 'Oral : Tu habites où ? Avec est-ce que : Où est-ce que tu habites ?'),
        b('Quel / quelle / quels / quelles agree with the noun.', 'Quel / quelle / quels / quelles s’accordent avec le nom.'),
        b('Pourquoi… ? → Parce que…', 'Pourquoi… ? → Parce que…'),
      ],
      vocab: [['en retard', b('late', 'après l’heure prévue')], ['préféré', b('favourite', 'qu’on aime le plus')], ['apprendre', b('to learn', 'étudier')]],
    },
  },
  {
    id: 'asking-questions-3',
    slug: { en: 'polite-questions-in-daily-life', fr: 'questions-polies-au-quotidien' },
    title: b('Polite questions in daily life', 'Les questions polies au quotidien'),
    summary: b('Ask strangers for help and information politely: excuse me, could you, do you know…', 'Demander poliment de l’aide et des informations à des inconnus : excusez-moi, pourriez-vous, savez-vous…'),
    objectives: [b('Start politely: excusez-moi, pardon', 'Commencer poliment : excusez-moi, pardon'), b('Use pouvez-vous / pourriez-vous', 'Employer pouvez-vous / pourriez-vous'), b('Ask “do you know…?” with savoir', 'Demander « savez-vous… ? » avec savoir')],
    minutes: 13,
    steps: [
      card(b('The polite formula', 'La formule polie'), b('**Excusez-moi / Pardon, madame**, + **pouvez-vous** / **pourriez-vous** (more polite) + infinitive. **Savez-vous** + où / si / à quelle heure… **Je voudrais savoir** si… Finish with **merci beaucoup**.', '**Excusez-moi / Pardon, madame**, + **pouvez-vous** / **pourriez-vous** (plus poli) + infinitif. **Savez-vous** + où / si / à quelle heure… **Je voudrais savoir** si… Terminez par **merci beaucoup**.'), {
        examples: [{ fr: 'Excusez-moi, pourriez-vous m’aider, s’il vous plaît ?', tr: 'Excuse me, could you help me, please?' }, { fr: 'Pardon, savez-vous où est la gare ?', tr: 'Sorry, do you know where the station is?' }, { fr: 'Je voudrais savoir si la bibliothèque est ouverte le dimanche.', tr: 'I’d like to know if the library is open on Sundays.' }],
      }),
      pick('A1', b('Which question is the most polite?', 'Quelle question est la plus polie ?'), ['Excusez-moi, pourriez-vous répéter, s’il vous plaît ?', 'Répétez !', 'Quoi ?', 'Tu répètes ?']),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['où', 'que', 'quel', 'qu’est-ce que'], { fr: 'Savez-vous ___ se trouve la poste ?' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['si', 'est-ce que', 'que', 'quand est-ce que'], { fr: 'Je voudrais savoir ___ le magasin est ouvert.' }),
      { kind: 'dialogue', title: b('In the street', 'Dans la rue'), scene: b('Choose the best question.', 'Choisissez la meilleure question.'), speakers: [{ name: 'Vous', voice: 'f', side: 'r' }, { name: 'Passant', voice: 'm2', side: 'l' }], lines: [
        { s: 0, choose: { options: ['Pardon, monsieur, savez-vous s’il y a une pharmacie près d’ici ?', 'Pharmacie ?', 'Hé, la pharmacie !'], answer: 0 } },
        { s: 1, fr: 'Oui, il y en a une au coin de la rue, à côté de la banque.', tr: 'Yes, there’s one on the corner, next to the bank.' },
        { s: 0, choose: { options: ['Merci beaucoup, bonne journée !', 'OK.', 'Je sais.'], answer: 0 } },
      ] },
      { kind: 'fill', prompt: b('Complete.', 'Complétez.'), text: '___ -moi, ___ -vous m’aider ?', answers: [['Excusez'], ['pourriez', 'pouvez']] },
      { kind: 'speak', prompt: b('Ask aloud.', 'Posez la question à voix haute.'), text: 'Excusez-moi, savez-vous où est la gare, s’il vous plaît ?', tr: 'Excuse me, do you know where the station is, please?' },
    ],
    notes: {
      points: [
        b('Start: Excusez-moi / Pardon + madame / monsieur.', 'Commencer : Excusez-moi / Pardon + madame / monsieur.'),
        b('Pouvez-vous… ? Pourriez-vous… ? (more polite) + infinitive.', 'Pouvez-vous… ? Pourriez-vous… ? (plus poli) + infinitif.'),
        b('Savez-vous où / si / quand… ? (no est-ce que after savez-vous).', 'Savez-vous où / si / quand… ? (pas de est-ce que après savez-vous).'),
        b('Je voudrais savoir si… = I’d like to know if…', 'Je voudrais savoir si… = j’aimerais savoir si…'),
      ],
      vocab: [['le passant', b('passer-by', 'personne dans la rue')], ['se trouver', b('to be located', 'être situé')], ['aider', b('to help', 'donner un coup de main')], ['près d’ici', b('nearby', 'pas loin')]],
    },
  },
];

export default lessons;
