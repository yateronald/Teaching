import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Film and series dialogue is French at its fastest and most colloquial: slang (le fric, bosser, un mec), verlan (relou, ouf), Québec expressions (c’est plate, avoir de la misère), idioms and cultural references. This C2 course trains you on original film-style scenes to understand informal vocabulary, verlan and idioms in context, and the implicit emotions of characters.',
    'Les dialogues de films et de séries sont le français le plus rapide et le plus familier : argot (le fric, bosser, un mec), verlan (relou, ouf), expressions québécoises (c’est plate, avoir de la misère), expressions idiomatiques et références culturelles. Ce cours de niveau C2 vous entraîne sur des scènes originales de style cinéma pour comprendre en contexte le vocabulaire familier, le verlan, les expressions et les émotions implicites des personnages.',
  ),
  outcomes: [
    b('Understand common slang', 'Comprendre l’argot courant'),
    b('Understand verlan', 'Comprendre le verlan'),
    b('Understand Québec colloquial expressions', 'Comprendre les expressions familières du Québec'),
    b('Infer characters’ emotions', 'Déduire les émotions des personnages'),
  ],
};

const C = 'l-film-dialogue';
export default [
  lesson(C, 1, ['slang-in-films', 'l-argot-au-cinema'],
    b('Slang in films', 'L’argot au cinéma'),
    b('Understand the most frequent slang words in context.', 'Comprendre en contexte les mots d’argot les plus fréquents.'),
    [b('Understand money and work slang', 'Comprendre l’argot de l’argent et du travail'), b('Understand people slang', 'Comprendre l’argot des personnes'), b('Infer meaning from the scene', 'Déduire le sens grâce à la scène')],
    13,
    [
      card(b('Frequent slang', 'L’argot fréquent'), b('**le fric / le blé** (money), **bosser** (to work), **un boulot** (a job), **un mec / un gars** (a guy), **une nana / une meuf** (a woman), **bouffer** (to eat), **se barrer** (to leave), **galérer** (to struggle).', '**le fric / le blé** (l’argent), **bosser** (travailler), **un boulot** (un emploi), **un mec / un gars** (un homme), **une nana / une meuf** (une femme), **bouffer** (manger), **se barrer** (partir), **galérer** (avoir du mal).')),
      hear('J’ai plus un rond, faut que je trouve un boulot, et vite. Je galère depuis trois mois.', b('What is his situation?', 'Quelle est sa situation ?'), [b('He has no money and has been struggling to find a job', 'Il n’a plus d’argent et galère depuis trois mois pour trouver un emploi'), b('He has a great job', 'Il a un excellent emploi'), b('He is on holiday', 'Il est en vacances'), b('He lost his phone', 'Il a perdu son téléphone')]),
      hear('Ce mec-là, il bosse comme un fou, mais il est payé des clopinettes.', b('What does she say about the man?', 'Que dit-elle de cet homme ?'), [b('He works extremely hard for very little money', 'Il travaille énormément pour très peu d’argent'), b('He is lazy', 'Il est paresseux'), b('He is rich', 'Il est riche'), b('He is crazy', 'Il est fou')]),
      hear('Bon, moi je me barre, j’en ai ras-le-bol de cette soirée.', b('What does he do and why?', 'Que fait-il et pourquoi ?'), [b('He leaves because he is fed up with the party', 'Il part car il en a assez de la soirée'), b('He stays to dance', 'Il reste pour danser'), b('He goes to eat', 'Il va manger'), b('He calls a friend', 'Il appelle un ami')]),
      pairs(P.match, [['le fric', b('money (slang)', 'l’argent')], ['bosser', b('to work (slang)', 'travailler')], ['se barrer', b('to leave, clear off', 'partir')], ['des clopinettes', b('peanuts, very little money', 'presque rien')]]),
      sort(b('Slang or standard?', 'Argot ou standard ?'), [b('slang', 'argot'), b('standard', 'standard')], [['le boulot', 0], ['l’emploi', 1], ['bouffer', 0], ['manger', 1], ['un mec', 0], ['un homme', 1]]),
      dict('Je n’ai plus d’argent, il faut que je trouve un emploi rapidement.', { voice: 'm', hint: b('Write it in standard French.', 'Écrivez-le en français standard.') }),
    ],
    [
      b('Money: le fric, le blé, pas un rond. Work: bosser, un boulot.', 'Argent : le fric, le blé, pas un rond. Travail : bosser, un boulot.'),
      b('People: un mec, un gars, une nana. Actions: bouffer, se barrer, galérer.', 'Personnes : un mec, un gars, une nana. Actions : bouffer, se barrer, galérer.'),
      b('en avoir ras-le-bol = to be fed up.', 'en avoir ras-le-bol = en avoir assez.'),
    ],
    [['galérer', b('to struggle (slang)', 'avoir beaucoup de mal')], ['pas un rond', b('not a penny', 'aucun argent')], ['ras-le-bol', b('fed up', 'exaspération')]],
  ),
  lesson(C, 2, ['verlan', 'le-verlan'],
    b('Verlan: words backwards', 'Le verlan : les mots à l’envers'),
    b('Understand the most frequent verlan words.', 'Comprendre les mots de verlan les plus fréquents.'),
    [b('Understand how verlan works', 'Comprendre le fonctionnement du verlan'), b('Recognise frequent verlan words', 'Reconnaître les mots de verlan fréquents'), b('Understand them in a scene', 'Les comprendre dans une scène')],
    13,
    [
      card(b('How verlan works', 'Comment fonctionne le verlan'), b('**Verlan** = « l’envers »: syllables are reversed. **relou** (lourd = annoying), **ouf** (fou = crazy, amazing), **chelou** (louche = weird), **vénère** (énervé = angry), **meuf** (femme), **chanmé** (méchant = awesome), **zarbi** (bizarre).', '**Verlan** = « l’envers » : on inverse les syllabes. **relou** (lourd = pénible), **ouf** (fou = fou, incroyable), **chelou** (louche = bizarre), **vénère** (énervé), **meuf** (femme), **chanmé** (méchant = génial), **zarbi** (bizarre).')),
      hear('Franchement, ce concert, c’était ouf ! J’ai jamais vu un truc pareil.', b('What did she think of the concert?', 'Qu’a-t-elle pensé du concert ?'), [b('It was amazing', 'C’était incroyable'), b('It was boring', 'C’était ennuyeux'), b('It was too loud', 'C’était trop fort'), b('It was cancelled', 'Il a été annulé')]),
      hear('Il est trop relou, ton frère. Il pose des questions toute la soirée.', b('What does he think of the brother?', 'Que pense-t-il du frère ?'), [b('He is really annoying', 'Il est vraiment pénible'), b('He is funny', 'Il est drôle'), b('He is shy', 'Il est timide'), b('He is clever', 'Il est intelligent')]),
      hear('C’est chelou, cette histoire. Pourquoi il serait parti sans rien dire ?', b('How does she find the story?', 'Comment trouve-t-elle cette histoire ?'), [b('Weird, suspicious', 'Bizarre, louche'), b('Funny', 'Drôle'), b('Normal', 'Normale'), b('Sad', 'Triste')]),
      pairs(b('Match the verlan with the standard word.', 'Associez le verlan au mot standard.'), [['relou', 'lourd (pénible)'], ['chelou', 'louche (bizarre)'], ['vénère', 'énervé'], ['zarbi', 'bizarre']]),
      tip(b('Understand, but use carefully', 'Comprenez, mais utilisez avec prudence'), b('Verlan is very informal and generational. Understanding it is essential for films and series; using it in a job interview is not a good idea!', 'Le verlan est très familier et générationnel. Le comprendre est essentiel pour les films et les séries ; l’employer en entretien d’embauche n’est pas une bonne idée !')),
      dict('Ce concert était incroyable, je n’ai jamais vu une chose pareille.', { voice: 'f', hint: b('Write it in standard French.', 'Écrivez-le en français standard.') }),
    ],
    [
      b('Verlan = syllables reversed: relou, ouf, chelou, vénère, meuf, zarbi.', 'Verlan = syllabes inversées : relou, ouf, chelou, vénère, meuf, zarbi.'),
      b('ouf = crazy, amazing; relou = annoying.', 'ouf = fou, incroyable ; relou = pénible.'),
      b('Understand it; use it only in very informal settings.', 'Comprenez-le ; employez-le seulement dans un cadre très familier.'),
    ],
    [['pénible', b('annoying', 'agaçant')], ['louche', b('shady, suspicious', 'suspect')], ['un truc pareil', b('such a thing', 'une chose semblable')]],
  ),
  lesson(C, 3, ['quebec-expressions-and-emotions', 'expressions-quebecoises-et-emotions'],
    b('Québec expressions and hidden emotions', 'Expressions québécoises et émotions cachées'),
    b('Understand Québec colloquial expressions and infer what characters feel.', 'Comprendre les expressions familières du Québec et déduire ce que ressentent les personnages.'),
    [b('Understand Québec colloquialisms', 'Comprendre les québécismes familiers'), b('Understand idioms', 'Comprendre les expressions idiomatiques'), b('Infer emotions', 'Déduire les émotions')],
    13,
    [
      card(b('Québec colloquialisms', 'Les québécismes familiers'), b('**C’est plate** (it’s boring), **avoir de la misère** (to have trouble), **être tanné** (to be fed up), **jaser** (to chat), **chum / blonde** (boyfriend / girlfriend), **pantoute** (not at all), **c’est le fun** (it’s fun), **icitte** (ici, very informal).', '**C’est plate** (c’est ennuyeux), **avoir de la misère** (avoir du mal), **être tanné** (en avoir assez), **jaser** (bavarder), **chum / blonde**, **pantoute** (pas du tout), **c’est le fun** (c’est amusant), **icitte** (ici, très familier).')),
      hear('Chu tanné de ce travail-là. C’est plate, pis j’ai de la misère à payer mon loyer.', b('How does he feel?', 'Que ressent-il ?'), [b('Fed up: the job is boring and he struggles to pay rent', 'Il en a assez : le travail est ennuyeux et il peine à payer son loyer'), b('Happy at work', 'Heureux au travail'), b('Excited about a new job', 'Enthousiaste pour un nouvel emploi'), b('Rich', 'Riche')]),
      hear('Ma blonde pis moi, on a jasé toute la nuit. C’était le fun en maudit !', b('What happened?', 'Que s’est-il passé ?'), [b('He chatted all night with his girlfriend and loved it', 'Il a bavardé toute la nuit avec sa copine et a adoré'), b('He argued with his girlfriend', 'Il s’est disputé avec sa copine'), b('He slept all night', 'Il a dormi toute la nuit'), b('He worked all night', 'Il a travaillé toute la nuit')]),
      hear('— Ça va, toi ? — Ben oui, ben oui… Pas de problème, pantoute. — T’es sûre ? T’as l’air ailleurs.', b('What does the friend suspect?', 'Que soupçonne l’amie ?'), [b('That she is not really fine', 'Qu’elle ne va pas vraiment bien'), b('That she is very happy', 'Qu’elle est très heureuse'), b('That she is lost', 'Qu’elle est perdue'), b('That she is late', 'Qu’elle est en retard')]),
      pairs(P.match, [['c’est plate', b('it’s boring (Québec)', 'c’est ennuyeux')], ['être tanné', b('to be fed up (Québec)', 'en avoir assez')], ['jaser', b('to chat (Québec)', 'bavarder')], ['pantoute', b('not at all (Québec)', 'pas du tout')]]),
      sort(b('Québec or France colloquial?', 'Familier du Québec ou de France ?'), [b('Québec', 'Québec'), b('France', 'France')], [['c’est plate', 0], ['c’est relou', 1], ['jaser', 0], ['tchatcher', 1], ['ma blonde', 0], ['ma meuf', 1]]),
      dict('Je suis fatigué de ce travail, c’est ennuyeux et j’ai du mal à payer mon loyer.', { voice: 'm', hint: b('Write it in standard French.', 'Écrivez-le en français standard.') }),
    ],
    [
      b('Québec: c’est plate, avoir de la misère, être tanné, jaser, pantoute, c’est le fun.', 'Québec : c’est plate, avoir de la misère, être tanné, jaser, pantoute, c’est le fun.'),
      b('« Ben oui, ben oui… » + T’as l’air ailleurs = hidden emotion.', '« Ben oui, ben oui… » + T’as l’air ailleurs = émotion cachée.'),
      b('pis = et puis (spoken).', 'pis = et puis (oral).'),
    ],
    [['avoir l’air ailleurs', b('to seem distracted', 'sembler absent')], ['en maudit', b('really, a lot (Québec, informal)', 'énormément')], ['la misère', b('trouble, hardship', 'difficulté')]],
  ),
];
