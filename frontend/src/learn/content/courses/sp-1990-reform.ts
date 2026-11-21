import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ognon or oignon? Nénufar or nénuphar? Évènement or événement? Connaitre or connaître? In 1990, the Conseil supérieur de la langue française published official spelling « rectifications », recommended by the Académie française and taught in schools in France, Belgium, Switzerland and Québec. Both spellings are correct, but you must recognise and use them consistently. This C1 course explains the main changes: circumflex accents, hyphens in numbers, plurals of compound words, accents and simplified forms.',
    'Ognon ou oignon ? Nénufar ou nénuphar ? Évènement ou événement ? Connaitre ou connaître ? En 1990, le Conseil supérieur de la langue française a publié des « rectifications » orthographiques officielles, recommandées par l’Académie française et enseignées dans les écoles en France, en Belgique, en Suisse et au Québec. Les deux orthographes sont correctes, mais il faut savoir les reconnaître et les employer de façon cohérente. Ce cours de niveau C1 présente les principaux changements : accent circonflexe, traits d’union dans les nombres, pluriel des mots composés, accents et formes simplifiées.',
  ),
  outcomes: [
    b('Know the main 1990 rectifications', 'Connaître les principales rectifications de 1990'),
    b('Apply the new circumflex rule', 'Appliquer la nouvelle règle de l’accent circonflexe'),
    b('Write numbers and compounds the new way', 'Écrire nombres et mots composés selon la nouvelle norme'),
    b('Stay consistent in a text', 'Rester cohérent dans un texte'),
  ],
};

const C = 'sp-1990-reform';
export default [
  lesson(C, 1, ['circumflex-and-accents', 'circonflexe-et-accents'],
    b('Circumflex and accents', 'L’accent circonflexe et les accents'),
    b('Drop the circumflex on i and u (with exceptions), and accent words by pronunciation.', 'Supprimer le circonflexe sur i et u (avec exceptions), et accentuer selon la prononciation.'),
    [b('Drop î and û where allowed', 'Supprimer î et û quand c’est permis'), b('Keep the useful exceptions', 'Garder les exceptions utiles'), b('Write è by pronunciation', 'Écrire è selon la prononciation')],
    13,
    [
      card(b('The circumflex', 'L’accent circonflexe'), b('The circumflex **disappears on i and u**: **connaitre, il connait, maitre, paraitre, flute, gout, cout, boite, diner, ile**. It is **kept** in verb endings (**nous vîmes, qu’il fût**) and where it distinguishes meaning: **dû** (du), **mûr** (mur), **sûr** (sur), **jeûne** (jeune), and **croître** (croire). It stays on **a, e, o**: **pâte, fête, côte**.', 'L’accent circonflexe **disparait sur i et u** : **connaitre, il connait, maitre, paraitre, flute, gout, cout, boite, diner, ile**. Il est **maintenu** dans les terminaisons verbales (**nous vîmes, qu’il fût**) et quand il distingue le sens : **dû** (du), **mûr** (mur), **sûr** (sur), **jeûne** (jeune), et **croître** (croire). Il reste sur **a, e, o** : **pâte, fête, côte**.')),
      card(b('Accents by pronunciation', 'Accents selon la prononciation'), b('Words are accented as they are pronounced: **évènement** (like avènement), **règlementaire**, **sècheresse**, **crèmerie**, **je cèderai** (future of é-verbs). Some words get an accent: **asséner, réfréner, pupitre…** and loanwords: **révolver, référendum, à priori** (also written a priori).', 'On accentue selon la prononciation : **évènement** (comme avènement), **règlementaire**, **sècheresse**, **crèmerie**, **je cèderai** (futur des verbes en é). Certains mots reçoivent un accent : **asséner, réfréner** et les emprunts : **révolver, référendum, à priori** (aussi écrit a priori).')),
      sort(b('Can the circumflex be dropped (1990)?', 'Le circonflexe peut-il disparaitre (1990) ?'), [b('yes', 'oui'), b('no, it is kept', 'non, il est maintenu')], [['connaître', 0], ['sûr', 1], ['la boîte', 0], ['mûr', 1], ['le goût', 0], ['la fête', 1]]),
      mc(P.choose, [b('Both are correct: évènement (1990) and événement (traditional).', 'Les deux sont corrects : évènement (1990) et événement (traditionnel).'), b('Only événement is correct.', 'Seul événement est correct.'), b('Only évènement is correct.', 'Seul évènement est correct.'), b('Neither: it is évenement.', 'Aucun : c’est évenement.')], { fr: 'Événement ou évènement ?' }),
      gap(P.complete, 'Nouvelle orthographe : il conn___t (connaître) ce ma___tre ; mais c’est s___r (certain).', ['ai', ['i', 'î'], 'û'], { strict: true, hint: b('Careful: sûr always keeps its û.', 'Attention : sûr garde toujours son û.') }),
      dict('Il connait le gout de ce plat et il est sûr que l’évènement aura lieu.', { hint: b('1990 spelling: connait, gout, évènement; sûr keeps its accent.', 'Orthographe de 1990 : connait, gout, évènement ; sûr garde son accent.') }),
    ],
    [
      b('No circumflex on i and u (connaitre, gout), except dû, mûr, sûr, jeûne, croître and verb endings.', 'Pas de circonflexe sur i et u (connaitre, gout), sauf dû, mûr, sûr, jeûne, croître et terminaisons verbales.'),
      b('Accents follow pronunciation: évènement, règlementaire.', 'Les accents suivent la prononciation : évènement, règlementaire.'),
      b('Both spellings are correct; be consistent.', 'Les deux orthographes sont correctes ; soyez cohérent.'),
    ],
    [['une sècheresse', b('a drought', 'manque d’eau')], ['règlementaire', b('regulatory', 'conforme au règlement')], ['paraitre', b('to appear', 'sembler')]],
  ),
  lesson(C, 2, ['numbers-and-compounds', 'nombres-et-mots-composes'],
    b('Numbers, hyphens and compounds', 'Nombres, traits d’union et mots composés'),
    b('Hyphenate all compound numbers and simplify the plural of compound nouns.', 'Mettre des traits d’union à tous les numéraux composés et simplifier le pluriel des mots composés.'),
    [b('Hyphens in all compound numbers', 'Traits d’union dans tous les numéraux composés'), b('Plural of verb + noun compounds', 'Pluriel des composés verbe + nom'), b('Welding some compounds', 'Souder certains composés')],
    13,
    [
      card(b('Numbers and compounds', 'Nombres et composés'), b('**All compound numbers** take hyphens: **vingt-et-un, deux-cents, trois-mille-cinq-cent-quarante** (traditional: vingt et un, deux cents, trois mille cinq cent quarante). **Verb + noun compounds** take a normal plural: **un pèse-lettre, des pèse-lettres; un après-midi, des après-midis; un sèche-cheveu, des sèche-cheveux**. Some words are **welded**: **portemonnaie, weekend, pingpong, entretemps, millefeuille, chauvesouris**.', '**Tous les numéraux composés** prennent des traits d’union : **vingt-et-un, deux-cents, trois-mille-cinq-cent-quarante** (traditionnel : vingt et un, deux cents, trois mille cinq cent quarante). Les **composés verbe + nom** prennent un pluriel normal : **un pèse-lettre, des pèse-lettres ; un après-midi, des après-midis ; un sèche-cheveu, des sèche-cheveux**. Certains mots sont **soudés** : **portemonnaie, weekend, pingpong, entretemps, millefeuille, chauvesouris**.')),
      mc(P.choose, ['trois-cent-vingt-et-un', 'trois cent vingt-et-un', 'trois-cent vingt et un', 'trois cents-vingt-et-un'], { fr: 'Écrivez 321 selon l’orthographe de 1990 :' }),
      mc(P.choose, ['des après-midis', 'des après-midi', 'des après-midies', 'des après-midits'], { fr: 'Pluriel de « après-midi » (1990) :' }),
      sort(b('1990 spelling or traditional?', 'Orthographe de 1990 ou traditionnelle ?'), [b('1990', '1990'), b('traditional', 'traditionnelle')], [['un portemonnaie', 0], ['un porte-monnaie', 1], ['vingt-et-un', 0], ['vingt et un', 1], ['des sèche-cheveux', 0], ['des sèche-cheveu', 1]]),
      mc(P.choose, ['Il a payé deux-cents euros pendant le weekend.', 'Il a payé deux cents euros pendant le week-end.', 'Il a payé deux-cents euros pendant le week-end.', 'Il a payé deux cent euros pendant le weekend.'], { fr: 'Quelle phrase applique entièrement les rectifications de 1990 ?' }),
      dict('Pendant le weekend, il a dépensé deux-cent-trente euros pour un portemonnaie.', { hint: b('1990 spelling throughout.', 'Orthographe de 1990 partout.') }),
    ],
    [
      b('All compound numbers: hyphens (deux-cent-trente).', 'Tous les numéraux composés : traits d’union (deux-cent-trente).'),
      b('Verb + noun: normal plural (des après-midis, des sèche-cheveux).', 'Verbe + nom : pluriel normal (des après-midis, des sèche-cheveux).'),
      b('Some compounds are welded: weekend, portemonnaie.', 'Certains composés sont soudés : weekend, portemonnaie.'),
    ],
    [['un portemonnaie', b('a purse', 'petit sac à argent')], ['un compte-gouttes', b('a dropper', 'pour compter les gouttes')], ['entretemps', b('meanwhile', 'pendant ce temps')]],
  ),
  lesson(C, 3, ['simplifications-and-consistency', 'simplifications-et-coherence'],
    b('Simplified words and consistency', 'Mots simplifiés et cohérence'),
    b('Recognise simplified words (ognon, nénufar), the -olle/-otte and -eler rules, and write consistently.', 'Reconnaître les mots simplifiés (ognon, nénufar), les règles -olle/-otte et -eler, et écrire de façon cohérente.'),
    [b('Know the simplified words', 'Connaître les mots simplifiés'), b('Apply the -eler / -eter rule', 'Appliquer la règle -eler / -eter'), b('Choose one norm per text', 'Choisir une norme par texte')],
    13,
    [
      card(b('Simplifications', 'Simplifications'), b('Anomalies corrected: **ognon, nénufar, relai** (like délai), **joailler, combattivité, charriot, imbécilité, eczéma…** **-eler / -eter** verbs: **è** instead of a double consonant: **il étiquète, il renouvèle, j’amoncèle** (except **appeler, jeter** and their compounds: j’appelle, je jette). **-olle / -otte**: simplified to **-ole / -ote** in some words: **corole, frisoter, grelotement**.', 'Anomalies corrigées : **ognon, nénufar, relai** (comme délai), **joailler, combattivité, charriot**… Verbes en **-eler / -eter** : **è** au lieu de la consonne double : **il étiquète, il renouvèle, j’amoncèle** (sauf **appeler, jeter** et leurs composés : j’appelle, je jette). **-olle / -otte** : simplifiés en **-ole / -ote** dans certains mots : **corole, frisoter, grelotement**.')),
      tip(b('Be consistent', 'Soyez cohérent'), b('Both spellings are correct, and spell-checkers accept both. What matters is **consistency**: don’t write « connaitre » in one sentence and « connaître » in the next. In exams (DELF, DALF, TCF, TEF), both are accepted.', 'Les deux orthographes sont correctes, et les correcteurs automatiques acceptent les deux. L’essentiel est la **cohérence** : n’écrivez pas « connaitre » dans une phrase et « connaître » dans la suivante. Aux examens (DELF, DALF, TCF, TEF), les deux sont acceptées.')),
      mc(P.choose, [b('All four: ognon, nénufar, relai and charriot', 'Les quatre : ognon, nénufar, relai et charriot'), b('None', 'Aucun'), b('Only ognon', 'Seulement ognon'), b('Only nénufar', 'Seulement nénufar')], { fr: 'Lesquels sont conformes aux rectifications de 1990 : ognon, nénufar, relai, charriot ?' }),
      mc(P.form, ['Il renouvèle son abonnement et il appelle sa banque.', 'Il renouvèle son abonnement et il appèle sa banque.', 'Il renouvelle son abonnement et il appèle sa banque.', 'Il renouvele son abonnement et il appele sa banque.'], { explain: b('renouveler: è (1990) or ll; appeler always keeps ll.', 'renouveler : è (1990) ou ll ; appeler garde toujours ll.') }),
      doc({ look: 'page', title: b('Consistent or not?', 'Cohérent ou non ?'), text: 'Je connais bien ce maitre d’hôtel. Il connaît tous les gouts de ses clients et il paraît que son ognon frit est célèbre.' }, b('What is the problem with this text?', 'Quel est le problème de ce texte ?'), [b('It mixes 1990 (maitre, gouts, ognon) and traditional (connaît, paraît) spellings.', 'Il mélange l’orthographe de 1990 (maitre, gouts, ognon) et l’orthographe traditionnelle (connaît, paraît).'), b('maitre is always wrong.', 'maitre est toujours fautif.'), b('There is no problem.', 'Il n’y a aucun problème.'), b('ognon is wrong.', 'ognon est fautif.')]),
      dict('Je connais bien ce maitre d’hôtel : il connait tous les gouts de ses clients.', { hint: b('Consistent 1990 spelling: maitre, connait, gouts.', 'Orthographe de 1990 cohérente : maitre, connait, gouts.') }),
    ],
    [
      b('Simplified words: ognon, nénufar, relai, charriot.', 'Mots simplifiés : ognon, nénufar, relai, charriot.'),
      b('-eler / -eter: è (il renouvèle), except appeler, jeter.', '-eler / -eter : è (il renouvèle), sauf appeler, jeter.'),
      b('Both norms are correct: never mix them in one text.', 'Les deux normes sont correctes : ne les mélangez jamais dans un même texte.'),
    ],
    [['un abonnement', b('a subscription', 'inscription payante')], ['étiqueter', b('to label', 'mettre une étiquette')], ['amonceler', b('to pile up', 'entasser')]],
  ),
];
