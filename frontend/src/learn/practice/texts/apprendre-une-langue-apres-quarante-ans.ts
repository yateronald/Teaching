// B1 · Forum. Sabine, 47, asks whether it is too late to learn a language;
// three members answer with different views. Giving and qualifying an opinion.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'apprendre-une-langue-apres-quarante-ans',
  speakers: [
    { name: 'Sabine', voice: 'f' },
    { name: 'Karim', voice: 'm' },
    { name: 'Lucía', voice: 'f' },
    { name: 'Thomas', voice: 'm' },
  ],
  warmup: b(
    'Is there an age when it becomes too late to learn a language? What do you think?',
    'Existe-t-il un âge où il est trop tard pour apprendre une langue ? Qu’en pensez-vous ?',
  ),
  paras: [
    { who: 0, s: [
      ['Bonjour à tous !', 'Hello everyone!'],
      ['J’ai quarante-sept ans et je viens de m’inscrire à un cours d’italien.', 'I am forty-seven and I have just signed up for an Italian class.'],
      ['Mes enfants me disent que c’est trop tard et que je ne parlerai jamais couramment.', 'My children tell me it is too late and that I will never speak fluently.'],
      ['Est-ce que vous avez appris une langue à l’âge adulte ?', 'Did any of you learn a language as an adult?'],
      ['Est-ce que ça vaut vraiment la peine ?', 'Is it really worth it?'],
    ] },
    { who: 1, s: [
      ['Bonjour Sabine !', 'Hello Sabine!'],
      ['À mon avis, il n’est jamais trop tard.', 'In my opinion, it is never too late.'],
      ['J’ai commencé l’anglais à quarante-deux ans, pour mon travail.', 'I started English at forty-two, for my job.'],
      ['Au début, c’était difficile : je comprenais mal et j’avais peur de parler.', 'At first it was hard: I did not understand much and I was afraid to speak.'],
      ['Mais je trouve qu’un adulte a un grand avantage : il sait pourquoi il apprend.', 'But I find that an adult has a big advantage: they know why they are learning.'],
      ['Aujourd’hui, je fais des réunions en anglais sans problème.', 'Today, I hold meetings in English without any problem.'],
    ] },
    { who: 2, s: [
      ['Je ne suis pas tout à fait d’accord avec Karim.', 'I do not completely agree with Karim.'],
      ['Je pense qu’on peut apprendre à tout âge, mais il faut être honnête : l’accent, c’est plus difficile après quarante ans.', 'I think you can learn at any age, but let us be honest: the accent is harder after forty.'],
      ['Moi, je vis en France depuis quinze ans et on entend toujours que je suis espagnole.', 'I have lived in France for fifteen years and people can still hear that I am Spanish.'],
      ['Et alors ?', 'So what?'],
      ['Les gens me comprennent, et c’est l’essentiel.', 'People understand me, and that is what matters.'],
    ] },
    { who: 3, s: [
      ['Il me semble que le plus important, ce n’est pas l’âge, c’est la régularité.', 'It seems to me that the most important thing is not age, it is regularity.'],
      ['Vingt minutes par jour, c’est mieux que trois heures le dimanche.', 'Twenty minutes a day is better than three hours on Sunday.'],
      ['Mon conseil : regardez des séries en italien avec les sous-titres, et cherchez un partenaire d’échange pour parler.', 'My advice: watch series in Italian with subtitles, and look for a language exchange partner to talk to.'],
      ['Bon courage, Sabine !', 'Good luck, Sabine!'],
    ] },
    { who: 0, s: [
      ['Merci beaucoup pour vos réponses !', 'Thank you very much for your answers!'],
      ['Je me sens beaucoup plus motivée.', 'I feel much more motivated.'],
      ['Je vais suivre vos conseils, et je vous donnerai des nouvelles dans six mois.', 'I am going to follow your advice, and I will let you know how it goes in six months.'],
    ] },
  ],
  glossary: [
    { fr: 'je viens de m’inscrire', tr: b('I have just signed up', 'je me suis inscrite il y a très peu de temps') },
    { fr: 'couramment', tr: b('fluently', 'facilement, sans chercher ses mots') },
    { fr: 'ça vaut vraiment la peine', tr: b('it is really worth it', 'l’effort est vraiment utile') },
    { fr: 'À mon avis', tr: b('in my opinion', 'selon moi') },
    { fr: 'je trouve', tr: b('I find (that), I think (that): a personal opinion', 'je pense (que) : un avis personnel') },
    { fr: 'pas tout à fait d’accord', tr: b('not completely in agreement', 'd’accord en partie seulement') },
    { fr: 'honnête', tr: b('honest', 'qui dit la vérité') },
    { fr: 'l’accent', tr: b('the accent', 'la façon de prononcer, qui montre d’où on vient') },
    { fr: 'Et alors ?', tr: b('So what?', 'ce n’est pas grave, ce n’est pas un problème') },
    { fr: 'l’essentiel', tr: b('what matters most', 'la chose la plus importante') },
    { fr: 'Il me semble que', tr: b('it seems to me that', 'je pense que (avis prudent)') },
    { fr: 'la régularité', tr: b('regularity, consistency', 'le fait de faire quelque chose souvent, sans arrêter') },
    { fr: 'les sous-titres', tr: b('subtitles', 'le texte écrit en bas de l’écran') },
    { fr: 'un partenaire d’échange', tr: b('a language exchange partner', 'une personne avec qui on échange sa langue contre la sienne') },
    { fr: 'Bon courage', tr: b('good luck, hang in there', 'je vous souhaite de réussir') },
    { fr: 'je vous donnerai des nouvelles', tr: b('I will let you know how it goes', 'je vous raconterai la suite') },
  ],
  questions: [
    {
      q: 'Pourquoi Sabine écrit-elle sur ce forum ?',
      qEn: 'Why does Sabine post on this forum?',
      options: ['Pour vendre un cours d’italien', 'Pour savoir s’il est trop tard pour apprendre une langue', 'Pour se plaindre de ses enfants', 'Pour trouver un professeur'],
      answer: 1,
      evidence: ['Est-ce que vous avez appris une langue à l’âge adulte ?', 'Est-ce que ça vaut vraiment la peine ?'],
      explain: b(
        'She asks two questions to other adults: have you learned a language as an adult, and is it worth it?',
        'Elle pose deux questions aux autres adultes : avez-vous appris une langue adulte, et est-ce que ça vaut la peine ?',
      ),
      skill: 'global',
    },
    {
      q: 'Pourquoi Sabine doute-t-elle ?',
      qEn: 'Why does Sabine have doubts?',
      options: ['Son cours est trop cher', 'Ses enfants disent qu’il est trop tard', 'Elle n’aime pas l’italien', 'Elle n’a pas le temps'],
      answer: 1,
      evidence: 'Mes enfants me disent que c’est trop tard',
      explain: b(
        '“Mes enfants me disent que c’est trop tard et que je ne parlerai jamais couramment.”',
        '« Mes enfants me disent que c’est trop tard et que je ne parlerai jamais couramment. »',
      ),
      skill: 'detail',
    },
    {
      q: 'Selon Karim, quel est le grand avantage d’un adulte ?',
      qEn: 'According to Karim, what is an adult’s big advantage?',
      options: ['Il a plus de temps', 'Il a un meilleur accent', 'Il sait pourquoi il apprend', 'Il a peur de parler'],
      answer: 2,
      evidence: 'il sait pourquoi il apprend',
      explain: b(
        '“Je trouve qu’un adulte a un grand avantage : il sait pourquoi il apprend.” Karim learned English for his job.',
        '« Je trouve qu’un adulte a un grand avantage : il sait pourquoi il apprend. » Karim a appris l’anglais pour son travail.',
      ),
      skill: 'detail',
    },
    {
      q: 'Sur quel point Lucía nuance-t-elle l’avis de Karim ?',
      qEn: 'On what point does Lucía qualify Karim’s opinion?',
      options: ['On ne peut pas apprendre après quarante ans', 'L’accent est plus difficile à perdre quand on est adulte', 'Il faut vivre dans le pays', 'L’anglais est plus facile que l’italien'],
      answer: 1,
      evidence: ['Je ne suis pas tout à fait d’accord avec Karim.', 'l’accent, c’est plus difficile après quarante ans'],
      explain: b(
        '“Pas tout à fait d’accord” means partly in agreement: she agrees you can learn at any age, but the accent is harder.',
        '« Pas tout à fait d’accord », c’est d’accord en partie : elle pense qu’on peut apprendre à tout âge, mais que l’accent est plus difficile.',
      ),
      skill: 'inference',
    },
    {
      q: 'Pour Lucía, son accent espagnol est :',
      qEn: 'For Lucía, her Spanish accent is:',
      options: ['un gros problème au travail', 'une raison d’arrêter le français', 'pas grave, car on la comprend', 'une chose qu’elle a perdue'],
      answer: 2,
      evidence: 'Les gens me comprennent, et c’est l’essentiel.',
      explain: b(
        '“Et alors ?” shows it does not bother her: people understand her, and that is what matters.',
        '« Et alors ? » montre que ça ne la dérange pas : les gens la comprennent, et c’est l’essentiel.',
      ),
      skill: 'inference',
    },
    {
      q: 'Selon Thomas, qu’est-ce qui compte le plus ?',
      qEn: 'According to Thomas, what matters most?',
      options: ['L’âge', 'Le prix des cours', 'La régularité', 'Le pays où on vit'],
      answer: 2,
      evidence: 'ce n’est pas l’âge, c’est la régularité',
      explain: b(
        '“Ce n’est pas l’âge, c’est la régularité”: a little every day rather than a lot once a week.',
        '« Ce n’est pas l’âge, c’est la régularité » : un peu chaque jour plutôt que beaucoup une fois par semaine.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que veut dire « Est-ce que ça vaut vraiment la peine ? » ?',
      qEn: 'What does “Est-ce que ça vaut vraiment la peine ?” mean?',
      options: ['Est-ce que c’est triste ?', 'Est-ce que l’effort est vraiment utile ?', 'Est-ce que c’est cher ?', 'Est-ce que c’est dangereux ?'],
      answer: 1,
      evidence: 'Est-ce que ça vaut vraiment la peine ?',
      explain: b(
        'Valoir la peine: to be worth the effort. Here la peine is the effort, not sadness.',
        'Valoir la peine : mériter l’effort. Ici, la peine, c’est l’effort, pas la tristesse.',
      ),
      skill: 'vocab',
    },
  ],
  focus: {
    title: b('Giving and qualifying an opinion', 'Donner son avis et nuancer'),
    body: b(
      'To give an opinion: __à mon avis__, __je pense que__, __je trouve que__ (+ indicative). To be more careful: __il me semble que__. To agree only partly: __je ne suis pas tout à fait d’accord__, or __oui, mais…__. To insist on what counts: __le plus important, c’est…__ / __l’essentiel, c’est…__.',
      'Pour donner son avis : __à mon avis__, __je pense que__, __je trouve que__ (+ indicatif). Pour être plus prudent : __il me semble que__. Pour n’être d’accord qu’en partie : __je ne suis pas tout à fait d’accord__, ou __oui, mais…__. Pour insister sur ce qui compte : __le plus important, c’est…__ / __l’essentiel, c’est…__.',
    ),
    examples: [
      { fr: 'À mon avis, il n’est jamais trop tard.', tr: 'In my opinion, it is never too late.' },
      { fr: 'Je ne suis pas tout à fait d’accord avec Karim.', tr: 'I do not completely agree with Karim.' },
      { fr: 'Il me semble que le plus important, c’est la régularité.', tr: 'It seems to me that the most important thing is regularity.' },
    ],
  },
};

export default text;
