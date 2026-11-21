import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Chais pas, t’as vu, y’a pas, j’suis là: in natural speech, French shrinks. Mute e disappear, ne vanishes, il y a becomes y’a, tu es becomes t’es. This course decodes the most frequent reductions of spoken French so you can recognise them at full speed, and trains your ear with original fast exchanges.',
    'Chais pas, t’as vu, y’a pas, j’suis là : à l’oral naturel, le français rétrécit. Les e muets disparaissent, le ne s’efface, il y a devient y’a, tu es devient t’es. Ce cours décode les réductions les plus fréquentes du français parlé pour que vous les reconnaissiez à pleine vitesse, et entraîne votre oreille avec des échanges rapides originaux.',
  ),
  outcomes: [
    b('Recognise dropped mute e', 'Reconnaître la chute du e muet'),
    b('Recognise dropped ne and il', 'Reconnaître la chute de ne et de il'),
    b('Recognise reduced pronouns (t’es, t’as, j’)', 'Reconnaître les pronoms réduits (t’es, t’as, j’)'),
    b('Understand fast exchanges', 'Comprendre des échanges rapides'),
  ],
};

const C = 'l-fast-speech';
export default [
  lesson(C, 1, ['the-disappearing-e', 'le-e-qui-disparait'],
    b('The disappearing e', 'Le e qui disparaît'),
    b('Recognise words where the mute e is dropped in speech.', 'Reconnaître les mots où le e muet tombe à l’oral.'),
    [b('Recognise je → j’ before a consonant', 'Reconnaître je → j’ devant une consonne'), b('Recognise dropped e inside words', 'Reconnaître la chute du e dans les mots'), b('Write the full form', 'Écrire la forme complète')],
    13,
    [
      card(b('Where the e falls', 'Où tombe le e'), b('In fast speech, the mute **e** often disappears: **je suis → j’suis**, **je sais pas → chais pas**, **petit → p’tit**, **samedi → sam’di**, **maintenant → maint’nant**, **tout de suite → tout d’suite**. Written French keeps the full form.', 'À l’oral rapide, le **e** muet disparaît souvent : **je suis → j’suis**, **je sais pas → chais pas**, **petit → p’tit**, **samedi → sam’di**, **maintenant → maint’nant**, **tout de suite → tout d’suite**. L’écrit garde la forme complète.')),
      hear('J’suis crevé, j’rentre tout d’suite.', b('What does he say?', 'Que dit-il ?'), [b('I’m exhausted, I’m going home right away.', 'Je suis crevé, je rentre tout de suite.'), b('I’m hungry, I’m eating now.', 'J’ai faim, je mange maintenant.'), b('I’m late, I’m staying.', 'Je suis en retard, je reste.'), b('I’m happy, I’m going out.', 'Je suis content, je sors.')]),
      hear('Un p’tit café, sam’di matin ?', b('What is proposed?', 'Que propose-t-on ?'), [b('A small coffee on Saturday morning', 'Un petit café samedi matin'), b('A big breakfast on Sunday', 'Un gros déjeuner dimanche'), b('A tea tonight', 'Un thé ce soir'), b('Nothing', 'Rien')]),
      sort(b('Spoken or written form?', 'Forme orale ou écrite ?'), [b('spoken', 'orale'), b('written', 'écrite')], [['j’suis', 0], ['je suis', 1], ['p’tit', 0], ['petit', 1], ['sam’di', 0], ['samedi', 1]]),
      pairs(b('Match the spoken form with the written form.', 'Associez la forme orale à la forme écrite.'), [['chais pas', 'je ne sais pas'], ['maint’nant', 'maintenant'], ['tout d’suite', 'tout de suite'], ['j’peux', 'je peux']]),
      tip(b('Write the full form', 'Écrivez la forme complète'), b('In a dictation of spoken French, always write the **standard form**: you hear « chais pas », you write **je ne sais pas** (or je sais pas in informal writing).', 'Dans une dictée d’oral familier, écrivez toujours la **forme standard** : vous entendez « chais pas », vous écrivez **je ne sais pas** (ou je sais pas dans un écrit familier).')),
      dict('Je suis crevé, je rentre tout de suite.', { voice: 'm', hint: b('Write the standard form.', 'Écrivez la forme standard.') }),
    ],
    [
      b('Mute e drops: j’suis, p’tit, sam’di, tout d’suite.', 'Le e muet tombe : j’suis, p’tit, sam’di, tout d’suite.'),
      b('je sais pas → chais pas.', 'je sais pas → chais pas.'),
      b('Write the standard form.', 'Écrivez la forme standard.'),
    ],
    [['crevé', b('exhausted (informal)', 'très fatigué, familier')], ['rentrer', b('to go home', 'revenir chez soi')], ['tout de suite', b('right away', 'immédiatement')]],
  ),
  lesson(C, 2, ['ne-and-il-disappear', 'ne-et-il-disparaissent'],
    b('Ne and il disappear', 'Ne et il disparaissent'),
    b('Understand sentences without ne, and il y a → y’a, il faut → faut.', 'Comprendre les phrases sans ne, et il y a → y’a, il faut → faut.'),
    [b('Understand negation without ne', 'Comprendre la négation sans ne'), b('Recognise y’a and faut', 'Reconnaître y’a et faut'), b('Keep the meaning', 'Garder le sens')],
    13,
    [
      card(b('Negation with pas only', 'La négation avec pas seul'), b('In speech, **ne** almost always disappears: **je sais pas, c’est pas grave, j’ai rien vu, on y va jamais**. The **pas / rien / jamais** carries the negation: listen for it! Also: **il y a → y’a**, **il faut → faut**, **il est → y’est** (Québec).', 'À l’oral, le **ne** disparaît presque toujours : **je sais pas, c’est pas grave, j’ai rien vu, on y va jamais**. C’est **pas / rien / jamais** qui porte la négation : écoutez-le ! Aussi : **il y a → y’a**, **il faut → faut**, **il est → y’est** (Québec).')),
      hear('Y’a plus de lait, faut aller en acheter.', b('What is the problem?', 'Quel est le problème ?'), [b('There is no milk left; someone must buy some.', 'Il n’y a plus de lait ; il faut en acheter.'), b('There is too much milk.', 'Il y a trop de lait.'), b('The milk is bad.', 'Le lait est mauvais.'), b('Someone bought milk.', 'Quelqu’un a acheté du lait.')]),
      hear('C’est pas grave, j’ai rien compris non plus.', b('What does she mean?', 'Que veut-elle dire ?'), [b('It doesn’t matter, she didn’t understand anything either.', 'Ce n’est pas grave, elle n’a rien compris non plus.'), b('It is serious.', 'C’est grave.'), b('She understood everything.', 'Elle a tout compris.'), b('She is angry.', 'Elle est fâchée.')]),
      hear('On y va jamais, à ce resto, c’est trop cher.', b('Do they go to this restaurant?', 'Vont-ils dans ce restaurant ?'), [b('Never: it is too expensive', 'Jamais : c’est trop cher'), b('Often', 'Souvent'), b('Tonight', 'Ce soir'), b('Sometimes', 'Parfois')]),
      sort(b('Positive or negative?', 'Affirmatif ou négatif ?'), [b('positive', 'affirmatif'), b('negative', 'négatif')], [['J’ai vu.', 0], ['J’ai rien vu.', 1], ['C’est grave.', 0], ['C’est pas grave.', 1], ['On y va.', 0], ['On y va jamais.', 1]], { listen: true }),
      pairs(b('Match the spoken form with the written form.', 'Associez la forme orale à la forme écrite.'), [['y’a pas', 'il n’y a pas'], ['faut partir', 'il faut partir'], ['c’est pas', 'ce n’est pas'], ['j’ai rien', 'je n’ai rien']]),
      dict('Il n’y a plus de lait, il faut aller en acheter.', { voice: 'f', hint: b('Write the standard form.', 'Écrivez la forme standard.') }),
    ],
    [
      b('Ne disappears: listen for pas, rien, jamais, plus.', 'Le ne disparaît : écoutez pas, rien, jamais, plus.'),
      b('il y a → y’a; il faut → faut.', 'il y a → y’a ; il faut → faut.'),
      b('non plus = either / neither.', 'non plus = également, à la forme négative.'),
    ],
    [['grave', b('serious', 'sérieux')], ['un resto', b('a restaurant (informal)', 'restaurant, familier')], ['non plus', b('either, neither', 'pas davantage')]],
  ),
  lesson(C, 3, ['reduced-pronouns', 'pronoms-reduits'],
    b('Reduced pronouns and fast exchanges', 'Pronoms réduits et échanges rapides'),
    b('Recognise t’es, t’as, j’, chuis and understand fast dialogues.', 'Reconnaître t’es, t’as, j’, chuis et comprendre des dialogues rapides.'),
    [b('Recognise t’es / t’as / t’sais', 'Reconnaître t’es / t’as / t’sais'), b('Recognise chuis, j’veux, j’vais', 'Reconnaître chuis, j’veux, j’vais'), b('Follow a fast exchange', 'Suivre un échange rapide')],
    13,
    [
      card(b('Reduced pronouns', 'Les pronoms réduits'), b('**tu es → t’es**, **tu as → t’as**, **tu sais → t’sais**, **je suis → chuis**, **je vais → j’vais**, **je veux → j’veux**, **elle est → è’est** (very fast), **il / ils → i’**: **i’ sont où ?**', '**tu es → t’es**, **tu as → t’as**, **tu sais → t’sais**, **je suis → chuis**, **je vais → j’vais**, **je veux → j’veux**, **elle est → è’est** (très rapide), **il / ils → i’** : **i’ sont où ?**')),
      hear('T’es où ? T’as vu l’heure ? Chuis devant le cinéma depuis vingt minutes !', b('What is the situation?', 'Quelle est la situation ?'), [b('She has been waiting in front of the cinema for 20 minutes.', 'Elle attend devant le cinéma depuis 20 minutes.'), b('She is late.', 'Elle est en retard.'), b('The film is over.', 'Le film est fini.'), b('She lost her phone.', 'Elle a perdu son téléphone.')]),
      hear('J’vais pas pouvoir venir, t’sais, j’ai un truc avec ma sœur.', b('Is he coming?', 'Vient-il ?'), [b('No, he has something with his sister', 'Non, il a quelque chose avec sa sœur'), b('Yes, with his sister', 'Oui, avec sa sœur'), b('Maybe later', 'Peut-être plus tard'), b('He doesn’t know', 'Il ne sait pas')]),
      hear('I’ sont où, les clés ? J’les trouve pas.', b('What is he looking for?', 'Que cherche-t-il ?'), [b('The keys', 'Les clés'), b('His friends', 'Ses amis'), b('His phone', 'Son téléphone'), b('The car', 'La voiture')]),
      pairs(b('Match the spoken form with the written form.', 'Associez la forme orale à la forme écrite.'), [['t’es', 'tu es'], ['t’as', 'tu as'], ['chuis', 'je suis'], ['j’vais', 'je vais']]),
      tip(b('Train with context', 'Entraînez-vous avec le contexte'), b('Reductions are hard alone but easy **in context**: the situation tells you which word it must be. Listen to series and podcasts and repeat the fast forms.', 'Les réductions sont difficiles isolément mais faciles **en contexte** : la situation indique le mot attendu. Écoutez séries et balados et répétez les formes rapides.')),
      dict('Tu es où ? Je suis devant le cinéma depuis vingt minutes.', { voice: 'f', hint: b('Write the standard form.', 'Écrivez la forme standard.') }),
    ],
    [
      b('t’es, t’as, t’sais, chuis, j’vais, j’veux, i’.', 't’es, t’as, t’sais, chuis, j’vais, j’veux, i’.'),
      b('Context helps you rebuild the full form.', 'Le contexte aide à reconstituer la forme complète.'),
      b('un truc = a thing (informal).', 'un truc = une chose (familier).'),
    ],
    [['un truc', b('a thing, stuff (informal)', 'une chose, familier')], ['trouver', b('to find', 'découvrir')], ['l’heure', b('the time', 'moment de la journée')]],
  ),
];
