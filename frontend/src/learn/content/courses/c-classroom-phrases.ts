import type { CourseAbout } from '../../types';
import { b, card, dlg, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Pardon, je n’ai pas compris. Vous pouvez répéter plus lentement ? Comment dit-on « wallet » en français ? The most useful sentences for a learner are the ones that let you keep learning in French: asking for repetition, spelling, meanings and help. This course gives you these survival phrases for class, for work and for daily life, so you never have to switch to English.',
    'Pardon, je n’ai pas compris. Vous pouvez répéter plus lentement ? Comment dit-on « wallet » en français ? Les phrases les plus utiles pour un apprenant sont celles qui permettent de continuer à apprendre en français : demander une répétition, une orthographe, un sens, de l’aide. Ce cours vous donne ces phrases de survie pour la classe, le travail et la vie quotidienne, pour ne plus jamais devoir passer à l’anglais.',
  ),
  outcomes: [
    b('Say you did not understand and ask to repeat', 'Dire que vous n’avez pas compris et demander de répéter'),
    b('Ask for a word, a meaning or a spelling', 'Demander un mot, un sens ou une orthographe'),
    b('Check that you understood', 'Vérifier que vous avez compris'),
    b('Ask for help and correction', 'Demander de l’aide et une correction'),
  ],
};

const C = 'c-classroom-phrases';
export default [
  lesson(C, 1, ['i-did-not-understand', 'je-n-ai-pas-compris'],
    b('I didn’t understand: asking to repeat', 'Je n’ai pas compris : demander de répéter'),
    b('Politely signal that you did not understand and ask for a repetition.', 'Signaler poliment que vous n’avez pas compris et demander une répétition.'),
    [b('Say you did not understand', 'Dire que vous n’avez pas compris'), b('Ask to repeat slowly', 'Demander de répéter lentement'), b('Ask to speak louder', 'Demander de parler plus fort')],
    13,
    [
      card(b('Survival phrases', 'Les phrases de survie'), b('**Pardon ? / Excusez-moi ?** · **Je n’ai pas compris.** · **Vous pouvez répéter, s’il vous plaît ?** · **Plus lentement, s’il vous plaît.** · **Vous pouvez parler un peu plus fort ?**', '**Pardon ? / Excusez-moi ?** · **Je n’ai pas compris.** · **Vous pouvez répéter, s’il vous plaît ?** · **Plus lentement, s’il vous plaît.** · **Vous pouvez parler un peu plus fort ?**'), {
        ex: [['Pardon, je n’ai pas compris.', 'Sorry, I didn’t understand.'], ['Vous pouvez répéter plus lentement, s’il vous plaît ?', 'Can you repeat more slowly, please?']],
      }),
      tip(b('Never just say « What? »', 'Ne dites jamais juste « Quoi ? »'), b('« Quoi ? » alone can sound rude. Use **Pardon ?** or **Excusez-moi ?** with a questioning tone.', '« Quoi ? » seul peut sembler impoli. Dites **Pardon ?** ou **Excusez-moi ?** sur un ton interrogatif.')),
      mc(P.best, ['Pardon, vous pouvez répéter plus lentement ?', 'Quoi ?', 'Répète !', 'Je ne veux pas comprendre.'], { fr: 'Le pharmacien parle très vite :' }),
      ord(P.order, 'Vous pouvez parler un peu plus fort, s’il vous plaît ?', { tr: 'Can you speak a bit louder, please?' }),
      dlg(b('At the counter', 'Au guichet'), undefined, [['Employée', 'f'], ['Vous', 'm']], [
        [0, 'Il faut remplir le formulaire bleu et le déposer au comptoir numéro trois.', 'You must fill in the blue form and drop it at counter three.'],
        [1, { options: ['Pardon, je n’ai pas compris. Vous pouvez répéter plus lentement ?', 'Quoi ?', 'Oui oui.'] }],
        [0, 'Bien sûr. Le formulaire bleu… au comptoir trois.', 'Of course. The blue form… at counter three.'],
        [1, { options: ['Merci beaucoup, c’est clair maintenant.', 'Non.', 'Plus vite, s’il vous plaît.'] }],
      ]),
      pairs(P.match, [['Pardon ?', b('Sorry? / Pardon?', 'demander de répéter')], ['Plus lentement', b('More slowly', 'moins vite')], ['Plus fort', b('Louder', 'à voix plus haute')], ['C’est clair.', b('It’s clear.', 'j’ai compris')]]),
      say('Pardon, je n’ai pas compris. Vous pouvez répéter, s’il vous plaît ?', 'Sorry, I didn’t understand. Can you repeat, please?'),
    ],
    [
      b('Pardon ? Excusez-moi ? Je n’ai pas compris.', 'Pardon ? Excusez-moi ? Je n’ai pas compris.'),
      b('Vous pouvez répéter plus lentement / plus fort ?', 'Vous pouvez répéter plus lentement / plus fort ?'),
      b('Avoid « Quoi ? » alone.', 'Évitez « Quoi ? » seul.'),
    ],
    [['répéter', b('to repeat', 'redire')], ['lentement', b('slowly', 'pas vite')], ['un guichet', b('a counter, a desk', 'comptoir de service')]],
  ),
  lesson(C, 2, ['words-meanings-spelling', 'mots-sens-orthographe'],
    b('Words, meanings and spelling', 'Mots, sens et orthographe'),
    b('Ask how to say a word, what a word means and how it is spelled.', 'Demander comment on dit un mot, ce qu’il signifie et comment il s’écrit.'),
    [b('Ask « Comment dit-on… ? »', 'Demander « Comment dit-on… ? »'), b('Ask « Qu’est-ce que ça veut dire ? »', 'Demander « Qu’est-ce que ça veut dire ? »'), b('Ask « Ça s’écrit comment ? »', 'Demander « Ça s’écrit comment ? »')],
    13,
    [
      card(b('Three essential questions', 'Trois questions essentielles'), b('**Comment dit-on « wallet » en français ?** **Qu’est-ce que ça veut dire, « dépanneur » ?** **Ça s’écrit comment ? / Vous pouvez l’épeler ?** Also: **C’est masculin ou féminin ?**', '**Comment dit-on « wallet » en français ?** **Qu’est-ce que ça veut dire, « dépanneur » ?** **Ça s’écrit comment ? / Vous pouvez l’épeler ?** Aussi : **C’est masculin ou féminin ?**')),
      sort(b('Which question do you need?', 'Quelle question vous faut-il ?'), [b('a word in French', 'un mot en français'), b('a meaning', 'un sens'), b('a spelling', 'une orthographe')], [['Comment dit-on « fork » ?', 0], ['Qu’est-ce que ça veut dire ?', 1], ['Ça s’écrit comment ?', 2], ['Comment on dit « bill » ?', 0], ['Ça signifie quoi, « tanné » ?', 1], ['Vous pouvez l’épeler ?', 2]]),
      mc(P.best, ['Comment dit-on « receipt » en français ?', 'Qu’est-ce que receipt veut dire en anglais ?', 'Receipt, c’est féminin ?', 'Ça s’écrit receipt ?'], { fr: 'Vous cherchez le mot français pour « receipt » :' }),
      mc(P.best, ['Qu’est-ce que ça veut dire, « dépanneur » ?', 'Comment dit-on dépanneur ?', 'Dépanneur, ça s’écrit comment ?', 'C’est un dépanneur ?'], { fr: 'Vous ne connaissez pas le mot « dépanneur » :' }),
      dlg(b('In class', 'En classe'), undefined, [['Professeure', 'f'], ['Vous', 'm']], [
        [0, 'Pour demain, lisez le texte sur le déménagement.', 'For tomorrow, read the text about moving.'],
        [1, { options: ['Pardon, qu’est-ce que ça veut dire, « déménagement » ?', 'Comment dit-on demain ?', 'Non, merci.'] }],
        [0, 'C’est quand on change de logement, on part vivre ailleurs.', 'It’s when you change homes, you go and live elsewhere.'],
        [1, { options: ['Ah, d’accord ! Et ça s’écrit comment ?', 'Ah. Au revoir.', 'C’est masculin, la professeure ?'] }],
      ]),
      pairs(P.match, [['Comment dit-on… ?', b('How do you say…?', 'demander un mot')], ['Ça veut dire quoi ?', b('What does it mean?', 'demander un sens')], ['Ça s’écrit comment ?', b('How is it spelled?', 'demander l’orthographe')], ['C’est masculin ou féminin ?', b('Is it masculine or feminine?', 'demander le genre')]]),
      say('Excusez-moi, comment dit-on « wallet » en français ? Et ça s’écrit comment ?', 'Excuse me, how do you say “wallet” in French? And how is it spelled?'),
    ],
    [
      b('Comment dit-on « X » en français ?', 'Comment dit-on « X » en français ?'),
      b('Qu’est-ce que ça veut dire ? / Ça signifie quoi ?', 'Qu’est-ce que ça veut dire ? / Ça signifie quoi ?'),
      b('Ça s’écrit comment ? Vous pouvez l’épeler ?', 'Ça s’écrit comment ? Vous pouvez l’épeler ?'),
    ],
    [['épeler', b('to spell', 'dire lettre par lettre')], ['un déménagement', b('a move (house)', 'changement de logement')], ['signifier', b('to mean', 'vouloir dire')]],
  ),
  lesson(C, 3, ['checking-and-asking-for-help', 'verifier-et-demander-de-l-aide'],
    b('Checking and asking for help', 'Vérifier et demander de l’aide'),
    b('Rephrase to check, ask for an example and ask to be corrected.', 'Reformuler pour vérifier, demander un exemple et demander à être corrigé.'),
    [b('Check by rephrasing', 'Vérifier en reformulant'), b('Ask for an example', 'Demander un exemple'), b('Ask to be corrected', 'Demander à être corrigé')],
    13,
    [
      card(b('Check and learn', 'Vérifier et apprendre'), b('Check: **Si j’ai bien compris, …** · **Vous voulez dire que… ?** Example: **Vous pouvez me donner un exemple ?** Correction: **N’hésitez pas à me corriger.** · **C’est correct de dire… ?** · **Je le dis comment, mieux ?**', 'Vérifier : **Si j’ai bien compris, …** · **Vous voulez dire que… ?** Exemple : **Vous pouvez me donner un exemple ?** Correction : **N’hésitez pas à me corriger.** · **C’est correct de dire… ?** · **Je le dis comment, mieux ?**')),
      tip(b('Native speakers rarely correct you', 'Les natifs corrigent rarement'), b('Out of politeness, people seldom correct learners. **Ask them**: **N’hésitez pas à me corriger, ça m’aide !** Most will be happy to help.', 'Par politesse, on corrige rarement les apprenants. **Demandez-le** : **N’hésitez pas à me corriger, ça m’aide !** La plupart seront ravis d’aider.')),
      mc(P.best, ['Si j’ai bien compris, je dois revenir lundi avec mon passeport ?', 'Lundi passeport ?', 'Je ne sais pas.', 'Revenez lundi, vous !'], { fr: 'Vous vérifiez une consigne :' }),
      mc(P.best, ['C’est correct de dire « je suis allé au dentiste » ?', 'Dentiste correct ?', 'Je suis dentiste ?', 'Corrigez le dentiste !'], { fr: 'Vous voulez vérifier une phrase :' }),
      dlg(b('With a colleague', 'Avec une collègue'), undefined, [['Collègue', 'f'], ['Vous', 'm']], [
        [1, 'Hier, je suis allé au réunion avec le client.', 'Yesterday I went to the meeting with the client.'],
        [0, 'Ah, très bien ! Et ça s’est bien passé ?', 'Oh, very good! And did it go well?'],
        [1, { options: ['Oui ! Au fait, n’hésite pas à me corriger : on dit « au réunion » ?', 'Oui. Au revoir.', 'Non, je suis la réunion.'] }],
        [0, 'On dit « à la réunion », c’est féminin. Mais je t’ai très bien compris !', 'We say “à la réunion”, it’s feminine. But I understood you perfectly!'],
      ]),
      pairs(P.match, [['Si j’ai bien compris…', b('If I understood correctly…', 'vérifier')], ['Vous voulez dire que… ?', b('Do you mean that…?', 'reformuler')], ['Un exemple, s’il vous plaît.', b('An example, please.', 'demander un exemple')], ['N’hésitez pas à me corriger.', b('Feel free to correct me.', 'demander une correction')]]),
      say('N’hésitez pas à me corriger, ça m’aide beaucoup à progresser !', 'Feel free to correct me, it really helps me improve!'),
    ],
    [
      b('Check: Si j’ai bien compris… / Vous voulez dire que… ?', 'Vérifier : Si j’ai bien compris… / Vous voulez dire que… ?'),
      b('Ask: Vous pouvez me donner un exemple ?', 'Demander : Vous pouvez me donner un exemple ?'),
      b('Invite correction: N’hésitez pas à me corriger.', 'Inviter la correction : N’hésitez pas à me corriger.'),
    ],
    [['corriger', b('to correct', 'rectifier')], ['progresser', b('to improve', 'faire des progrès')], ['au fait', b('by the way', 'à propos')]],
  ),
];
