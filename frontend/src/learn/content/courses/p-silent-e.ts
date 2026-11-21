import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, mc, P, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Sam(e)di, p(e)tit, je n(e) sais pas, la f(e)nêtre: in natural French, many e’s disappear. Learners who pronounce every e sound slow and bookish; learners who don’t know which e can drop don’t understand fast speech. This course explains the « e muet » (or e caduc): the law of three consonants, the e that always drops, the e that must stay, and the chains of small words (je ne le, ce que je) that native speakers compress.',
    'Sam(e)di, p(e)tit, je n(e) sais pas, la f(e)nêtre : en français naturel, beaucoup de e disparaissent. L’apprenant qui prononce chaque e paraît lent et livresque ; celui qui ignore quels e peuvent tomber ne comprend pas l’oral rapide. Ce cours explique le e muet (ou e caduc) : la loi des trois consonnes, le e qui tombe toujours, celui qui doit rester, et les enchaînements de petits mots (je ne le, ce que je) que les natifs compressent.',
  ),
  outcomes: [
    b('Drop the e inside common words', 'Faire tomber le e à l’intérieur des mots courants'),
    b('Apply the law of three consonants', 'Appliquer la loi des trois consonnes'),
    b('Compress chains of small words', 'Compresser les enchaînements de petits mots'),
    b('Understand e-dropping in fast speech', 'Comprendre la chute du e à l’oral rapide'),
  ],
};

const C = 'p-silent-e';
export default [
  lesson(C, 1, ['the-e-that-drops', 'le-e-qui-tombe'],
    b('The e that drops', 'Le e qui tombe'),
    b('Drop the e between two single consonants, inside words and between words.', 'Faire tomber le e entre deux consonnes simples, dans les mots et entre les mots.'),
    [b('Spot droppable e’s', 'Repérer les e qui peuvent tomber'), b('Drop them inside words', 'Les faire tomber dans les mots'), b('Drop them between words', 'Les faire tomber entre les mots')],
    13,
    [
      card(b('Only one consonant before', 'Une seule consonne avant'), b('An **e** preceded by **a single pronounced consonant** usually drops in everyday speech: **sam(e)di, p(e)tit, ach(e)ter, la f(e)nêtre, tout d(e) suite, beaucoup d(e) monde, je n(e) sais pas**. The final **e** of words is silent too: **une tabl(e), il parl(e)**.', 'Un **e** précédé d’**une seule consonne prononcée** tombe en général à l’oral courant : **sam(e)di, p(e)tit, ach(e)ter, la f(e)nêtre, tout d(e) suite, beaucoup d(e) monde, je n(e) sais pas**. Le **e** final des mots est muet aussi : **une tabl(e), il parl(e)**.'), {
        ex: [['samedi → [samdi]', ''], ['un petit chat → [œ̃pti ʃa]', ''], ['tout de suite → [tutsɥit]', '']],
      }),
      hear('On se voit samedi ?', b('Listen. How is samedi pronounced?', 'Écoutez. Comment se prononce samedi ?'), [b('[samdi]: two syllables', '[samdi] : deux syllabes'), b('[samədi]: three syllables', '[samədi] : trois syllabes')]),
      hear('Je reviens tout de suite.', b('Listen. Which e’s drop?', 'Écoutez. Quels e tombent ?'), [b('the e of de (tout d’suite)', 'le e de de (tout d’suite)'), b('none', 'aucun'), b('the e of reviens only', 'seulement celui de reviens'), b('all of them', 'tous')], { voice: 'm' }),
      sort(b('Does the e usually drop in everyday speech?', 'Le e tombe-t-il en général à l’oral courant ?'), [b('drops', 'tombe'), b('stays', 'reste')], [['samedi', 0], ['vendredi', 1], ['acheter', 0], ['quelquefois', 1], ['la fenêtre', 0], ['une fenêtre', 1]]),
      mc(P.choose, [b('Because « une fenêtre » would give three consonants together [nfn].', 'Parce que « une fenêtre » donnerait trois consonnes [nfn].'), b('Because une is feminine.', 'Parce que une est féminin.'), b('Because the e is always pronounced in fenêtre.', 'Parce que le e de fenêtre se prononce toujours.'), b('It drops in both.', 'Il tombe dans les deux.')], { fr: 'Pourquoi le e tombe dans « la f(e)nêtre » mais reste dans « une fenêtre » ?' }),
      say('Samedi, on va acheter un petit cadeau tout de suite.', 'On Saturday we’re going to buy a small present right away.', { tip: b('[samdi], [aʃte], [pti], [tutsɥit].', '[samdi], [aʃte], [pti], [tutsɥit].') }),
    ],
    [
      b('e after one consonant usually drops: sam(e)di, p(e)tit.', 'Le e après une consonne tombe en général : sam(e)di, p(e)tit.'),
      b('Between words too: tout d(e) suite, je n(e) sais pas.', 'Entre les mots aussi : tout d(e) suite, je n(e) sais pas.'),
      b('Final e is silent: tabl(e), parl(e).', 'Le e final est muet : tabl(e), parl(e).'),
    ],
    [['tout de suite', b('right away', 'immédiatement')], ['un cadeau', b('a present', 'ce qu’on offre')], ['la fenêtre', b('the window', 'ouverture dans le mur')]],
  ),
  lesson(C, 2, ['the-law-of-three-consonants', 'la-loi-des-trois-consonnes'],
    b('The law of three consonants', 'La loi des trois consonnes'),
    b('Keep the e when dropping it would put three consonants together.', 'Garder le e quand sa chute rapprocherait trois consonnes.'),
    [b('Apply the law of three consonants', 'Appliquer la loi des trois consonnes'), b('Keep the e at the start of a group', 'Garder le e en début de groupe'), b('Keep it before an aspirated h and in some words', 'Le garder devant un h aspiré et dans certains mots')],
    13,
    [
      card(b('When the e stays', 'Quand le e reste'), b('**Law of three consonants**: if dropping the e would join **three consonants**, keep it: **vendredi** (d-r-d → keep), **mercredi**, **quelquefois**, **une fenêtre**, **il te dit** but **il ne te le dit pas**. The e also tends to stay **at the start of a breath group**: **Le train part.** · **Demain, je pars.** and before **h aspiré**: **le haut, dehors**.', '**Loi des trois consonnes** : si la chute du e réunissait **trois consonnes**, on le garde : **vendredi**, **mercredi**, **quelquefois**, **une fenêtre**. Le e tend aussi à rester **en début de groupe** : **Le train part.** · **Demain, je pars.** et devant un **h aspiré** : **le haut, dehors**.')),
      sort(b('Drop or keep the e?', 'Faire tomber ou garder le e ?'), [b('drop', 'tomber'), b('keep', 'garder')], [['la semaine', 0], ['vendredi', 1], ['un petit ami', 0], ['mercredi', 1], ['beaucoup de gens', 0], ['quelque chose de bon', 1]]),
      hear('Il part mercredi, pas vendredi.', b('Listen. Is the e of mercredi and vendredi pronounced?', 'Écoutez. Le e de mercredi et vendredi est-il prononcé ?'), [b('Yes, in both', 'Oui, dans les deux'), b('No, in neither', 'Non, dans aucun'), b('Only in mercredi', 'Seulement dans mercredi'), b('Only in vendredi', 'Seulement dans vendredi')]),
      mc(P.choose, [b('[ynfənɛtʁ]: e kept (three consonants otherwise)', '[ynfənɛtʁ] : e gardé (sinon trois consonnes)'), b('[ynfnɛtʁ]: e dropped', '[ynfnɛtʁ] : e tombé'), b('[ynəfnɛtʁ]', '[ynəfnɛtʁ]'), b('[ynfɛtʁ]', '[ynfɛtʁ]')], { fr: 'Comment dit-on « une fenêtre » ?' }),
      dict('Vendredi, je te le redis : la fenêtre ne ferme pas.', { hint: b('Several e’s drop, some stay. Write every word fully.', 'Certains e tombent, d’autres restent. Écrivez tous les mots en entier.') }),
      say('Vendredi et mercredi, mais samedi et la semaine.', 'Friday and Wednesday, but Saturday and the week.', { tip: b('Keep the e in vendredi and mercredi, drop it in samedi and semaine.', 'Gardez le e dans vendredi et mercredi, faites-le tomber dans samedi et semaine.') }),
    ],
    [
      b('Keep the e if dropping it would join three consonants (vendredi).', 'Gardez le e si sa chute réunit trois consonnes (vendredi).'),
      b('The e often stays at the start of a breath group.', 'Le e reste souvent en début de groupe.'),
      b('la f(e)nêtre but une fenêtre.', 'la f(e)nêtre mais une fenêtre.'),
    ],
    [['quelquefois', b('sometimes', 'parfois')], ['dehors', b('outside', 'à l’extérieur')], ['redire', b('to say again', 'répéter')]],
  ),
  lesson(C, 3, ['chains-of-small-words', 'les-enchainements-de-petits-mots'],
    b('Chains of small words', 'Les enchaînements de petits mots'),
    b('Compress je ne le, ce que je, je me le: one e out of two drops.', 'Compresser je ne le, ce que je, je me le : un e sur deux tombe.'),
    [b('Drop one e out of two', 'Faire tomber un e sur deux'), b('Recognise compressed chains', 'Reconnaître les chaînes compressées'), b('Understand fast everyday phrases', 'Comprendre les phrases rapides du quotidien')],
    13,
    [
      card(b('One out of two', 'Un sur deux'), b('In a chain of small words with e, **one out of two** usually drops (alternation): **je n(e) le sais pas** [ʒənləsɛpa] or **j(e) ne l(e) sais pas** [ʃnəlsɛpa]. **Ce que je dis** → [skəʒdi]. **Je me demande** → [ʒəmdəmɑ̃d]. **Est-ce que tu viens ?** → [ɛsktyvjɛ̃].', 'Dans une suite de petits mots en e, **un sur deux** tombe en général (alternance) : **je n(e) le sais pas** [ʒənləsɛpa] ou **j(e) ne l(e) sais pas** [ʃnəlsɛpa]. **Ce que je dis** → [skəʒdi]. **Je me demande** → [ʒəmdəmɑ̃d]. **Est-ce que tu viens ?** → [ɛsktyvjɛ̃].')),
      tip(b('Writing stays complete', 'L’écrit reste complet'), b('Even if you hear [ʃsɛpa] for **je sais pas**, always **write** the full form: **je ne sais pas**. Compression is a feature of speech only.', 'Même si vous entendez [ʃsɛpa] pour **je sais pas**, **écrivez** toujours la forme complète : **je ne sais pas**. La compression ne concerne que l’oral.')),
      hear('Je me demande ce que tu veux.', b('Listen. What did you hear?', 'Écoutez. Qu’avez-vous entendu ?'), [b('Je me demande ce que tu veux.', 'Je me demande ce que tu veux.'), b('Je demande ce que tu veux.', 'Je demande ce que tu veux.'), b('Je me demande ce que tu vois.', 'Je me demande ce que tu vois.'), b('Je te demande ce que tu veux.', 'Je te demande ce que tu veux.')]),
      hear('Est-ce que tu le sais ?', b('Listen. What did you hear?', 'Écoutez. Qu’avez-vous entendu ?'), [b('Est-ce que tu le sais ?', 'Est-ce que tu le sais ?'), b('Est-ce que tu sais ?', 'Est-ce que tu sais ?'), b('Est-ce que tu l’as ?', 'Est-ce que tu l’as ?'), b('C’est que tu le sais.', 'C’est que tu le sais.')], { voice: 'm' }),
      dict('Je ne le sais pas, mais je me demande ce que tu en penses.', { hint: b('Write every e, even those you don’t hear.', 'Écrivez tous les e, même ceux que vous n’entendez pas.') }),
      say('Je ne le sais pas. Je me demande ce que tu veux.', 'I don’t know. I wonder what you want.', { tip: b('One e out of two: je n’le sais pas, je m’demande c’que tu veux.', 'Un e sur deux : je n’le sais pas, je m’demande c’que tu veux.') }),
    ],
    [
      b('Chains of small words: one e out of two drops.', 'Suites de petits mots : un e sur deux tombe.'),
      b('ce que je → [skəʒ]; est-ce que → [ɛsk].', 'ce que je → [skəʒ] ; est-ce que → [ɛsk].'),
      b('Always write the full form.', 'Écrivez toujours la forme complète.'),
    ],
    [['se demander', b('to wonder', 's’interroger')], ['en penser', b('to think about it', 'avoir une opinion')], ['l’alternance', b('alternation', 'un sur deux')]],
  ),
];
