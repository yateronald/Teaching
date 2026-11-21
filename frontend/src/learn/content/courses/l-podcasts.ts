import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Podcasts (balados in Québec) are a fantastic way to hear spontaneous French: hesitations, jokes, interruptions, everyday vocabulary. This course trains you on short original podcast-style extracts about food, travel and daily life, to get the gist without understanding every word, to recognise fillers (bon, ben, genre, tu sais) and to identify the speakers’ opinions.',
    'Les balados (podcasts) sont un excellent moyen d’entendre un français spontané : hésitations, plaisanteries, interruptions, vocabulaire du quotidien. Ce cours vous entraîne sur de courts extraits originaux de style balado consacrés à la cuisine, aux voyages et à la vie quotidienne, pour saisir l’essentiel sans tout comprendre, reconnaître les mots de remplissage (bon, ben, genre, tu sais) et repérer l’opinion des intervenants.',
  ),
  outcomes: [
    b('Get the gist of a spontaneous conversation', 'Saisir l’essentiel d’une conversation spontanée'),
    b('Recognise fillers and hesitations', 'Reconnaître les mots de remplissage et les hésitations'),
    b('Identify each speaker’s opinion', 'Repérer l’opinion de chaque intervenant'),
    b('Follow a topic change', 'Suivre un changement de sujet'),
  ],
};

const C = 'l-podcasts';
export default [
  lesson(C, 1, ['getting-the-gist', 'saisir-l-essentiel'],
    b('Getting the gist', 'Saisir l’essentiel'),
    b('Understand the topic and the main idea without understanding every word.', 'Comprendre le sujet et l’idée principale sans tout comprendre.'),
    [b('Identify the topic in the first seconds', 'Identifier le sujet dès les premières secondes'), b('Ignore unknown words', 'Ignorer les mots inconnus'), b('Find the main idea', 'Trouver l’idée principale')],
    13,
    [
      tip(b('Gist first', 'L’essentiel d’abord'), b('In a podcast, the **introduction** announces the topic. Then focus on **repeated words** and the **conclusion** of each speaker. Do not stop on unknown words: the next sentence often explains them.', 'Dans un balado, l’**introduction** annonce le sujet. Concentrez-vous ensuite sur les **mots répétés** et la **conclusion** de chaque intervenant. Ne bloquez pas sur un mot inconnu : la phrase suivante l’explique souvent.')),
      hear('Bienvenue dans « Ça se mange », le balado qui parle de bouffe ! Aujourd’hui, on parle de la poutine : plat national ou simple frites-sauce-fromage ?', b('What is today’s topic?', 'Quel est le sujet du jour ?'), [b('Poutine', 'La poutine'), b('French cheese', 'Le fromage français'), b('A new restaurant', 'Un nouveau restaurant'), b('Healthy eating', 'Manger sainement')]),
      hear('Moi, honnêtement, la poutine, c’est plus qu’un plat. C’est un souvenir d’enfance, les soirs de hockey avec mon père.', b('What does poutine mean to this speaker?', 'Que représente la poutine pour cet intervenant ?'), [b('A childhood memory', 'Un souvenir d’enfance'), b('A boring dish', 'Un plat ennuyeux'), b('A new discovery', 'Une découverte récente'), b('A health problem', 'Un problème de santé')]),
      hear('Ben, je suis pas d’accord. Une bonne poutine, il faut du fromage en grains qui fait « squick-squick ». Sinon, c’est juste des frites mouillées !', b('What is essential for her?', 'Qu’est-ce qui est essentiel pour elle ?'), [b('Squeaky cheese curds', 'Du fromage en grains qui fait « squick-squick »'), b('A lot of sauce', 'Beaucoup de sauce'), b('Thin fries', 'Des frites fines'), b('Meat', 'De la viande')]),
      card(b('Spoken French features', 'Les traits de l’oral'), b('Spontaneous speech drops the **ne** (je suis pas), uses **ben / bon / bah**, **on** for nous, and informal words: **la bouffe** (food), **genre** (like), **trop** (really).', 'L’oral spontané supprime le **ne** (je suis pas), emploie **ben / bon / bah**, **on** pour nous, et des mots familiers : **la bouffe**, **genre**, **trop**.')),
      pairs(P.match, [['la bouffe', b('food (informal)', 'nourriture, familier')], ['un balado', b('a podcast (Québec)', 'émission audio')], ['honnêtement', b('honestly', 'franchement')], ['le fromage en grains', b('cheese curds', 'fromage frais de la poutine')]]),
      dict('Aujourd’hui, on parle de la poutine, le plat préféré des Québécois.', { voice: 'm' }),
    ],
    [
      b('The introduction announces the topic: listen carefully.', 'L’introduction annonce le sujet : écoutez-la bien.'),
      b('Skip unknown words; focus on repetitions and conclusions.', 'Passez les mots inconnus ; concentrez-vous sur les répétitions et les conclusions.'),
      b('Spoken French: ne dropped, ben, bon, on, la bouffe.', 'Oral : ne supprimé, ben, bon, on, la bouffe.'),
    ],
    [['un souvenir d’enfance', b('a childhood memory', 'souvenir de jeunesse')], ['mouillé', b('soggy, wet', 'humide')], ['un plat national', b('a national dish', 'plat emblématique')]],
  ),
  lesson(C, 2, ['fillers-and-hesitations', 'hesitations-et-mots-de-remplissage'],
    b('Fillers and hesitations', 'Hésitations et mots de remplissage'),
    b('Recognise fillers so they do not block your understanding.', 'Reconnaître les mots de remplissage pour qu’ils ne bloquent plus la compréhension.'),
    [b('Recognise euh, ben, genre, tu sais, en fait', 'Reconnaître euh, ben, genre, tu sais, en fait'), b('Filter them out', 'Les filtrer'), b('Use a few yourself', 'En employer quelques-uns')],
    13,
    [
      card(b('Common fillers', 'Les mots de remplissage courants'), b('**euh** (um), **ben / bah** (well), **genre** (like), **tu sais / tu vois** (you know), **en fait** (actually), **du coup** (so), **bref** (anyway), **c’est ça** (exactly / right).', '**euh**, **ben / bah**, **genre**, **tu sais / tu vois**, **en fait**, **du coup**, **bref**, **c’est ça**.')),
      hear('Euh, en fait, je suis partie au Portugal, genre, sans rien réserver. Du coup, j’ai dormi dans des petites auberges, tu vois.', b('What did she do?', 'Qu’a-t-elle fait ?'), [b('She went to Portugal without booking and stayed in small hostels.', 'Elle est partie au Portugal sans réserver et a dormi dans de petites auberges.'), b('She booked a hotel in Portugal.', 'Elle a réservé un hôtel au Portugal.'), b('She stayed at home.', 'Elle est restée chez elle.'), b('She went camping in Spain.', 'Elle a fait du camping en Espagne.')]),
      hear('Ben, le train, c’est plus long, c’est sûr, mais bon, tu vois le paysage, tu lis, tu dors… Bref, moi, j’adore.', b('What does he think of the train?', 'Que pense-t-il du train ?'), [b('Slower, but he loves it', 'Plus long, mais il adore'), b('Too slow, he hates it', 'Trop lent, il déteste'), b('Too expensive', 'Trop cher'), b('Dangerous', 'Dangereux')]),
      sort(b('Filler or meaningful word?', 'Mot de remplissage ou mot porteur de sens ?'), [b('filler', 'remplissage'), b('meaning', 'sens')], [['euh', 0], ['Portugal', 1], ['genre', 0], ['auberge', 1], ['tu vois', 0], ['paysage', 1]], { listen: true }),
      mc2(),
      pairs(P.match, [['du coup', b('so, as a result', 'par conséquent')], ['en fait', b('actually', 'en réalité')], ['bref', b('anyway, in short', 'pour résumer')], ['une auberge', b('an inn, a hostel', 'petit hôtel simple')]]),
      dict('En fait, je suis partie sans rien réserver.', { voice: 'f' }),
    ],
    [
      b('Fillers: euh, ben, genre, tu sais, en fait, du coup, bref.', 'Remplissage : euh, ben, genre, tu sais, en fait, du coup, bref.'),
      b('Filter them out to keep the meaning.', 'Filtrez-les pour garder le sens.'),
      b('du coup = so; en fait = actually; bref = anyway.', 'du coup = donc ; en fait = en réalité ; bref = pour résumer.'),
    ],
    [['le paysage', b('the landscape, scenery', 'ce que l’on voit')], ['réserver', b('to book', 'retenir')], ['c’est sûr', b('for sure', 'évidemment')]],
  ),
  lesson(C, 3, ['speakers-and-opinions', 'intervenants-et-opinions'],
    b('Speakers and their opinions', 'Les intervenants et leurs opinions'),
    b('Follow a discussion and identify who thinks what.', 'Suivre une discussion et repérer qui pense quoi.'),
    [b('Distinguish two speakers', 'Distinguer deux intervenants'), b('Identify agreement and disagreement', 'Repérer accord et désaccord'), b('Follow a change of topic', 'Suivre un changement de sujet')],
    13,
    [
      hear('Pour moi, le télétravail, c’est la liberté. Je gagne deux heures par jour de transport !', b('What is his opinion of remote work?', 'Quelle est son opinion sur le télétravail ?'), [b('Very positive: he saves commuting time', 'Très positive : il gagne du temps de transport'), b('Negative: he feels alone', 'Négative : il se sent seul'), b('He has never tried it', 'Il ne l’a jamais essayé'), b('He works in a café', 'Il travaille dans un café')]),
      hear('Oui, mais moi, à la maison, je me sens seule. Mes collègues me manquent, les pauses café aussi.', b('What does she miss?', 'Qu’est-ce qui lui manque ?'), [b('Her colleagues and coffee breaks', 'Ses collègues et les pauses café'), b('Her car', 'Sa voiture'), b('Her home', 'Sa maison'), b('Her commute', 'Son trajet')]),
      hear('Bon, on change de sujet : parlons des vacances. Vous partez où cet été ?', b('What happens here?', 'Que se passe-t-il ici ?'), [b('The host changes the topic to holidays.', 'L’animateur change de sujet : les vacances.'), b('The podcast ends.', 'Le balado se termine.'), b('A guest leaves.', 'Un invité part.'), b('They talk about work again.', 'Ils reparlent du travail.')]),
      tip(b('Topic-change signals', 'Les signaux de changement de sujet'), b('**Bon, on change de sujet**, **Passons à…**, **Autre chose…**, **D’ailleurs…** (by the way), **En parlant de…** (speaking of…).', '**Bon, on change de sujet**, **Passons à…**, **Autre chose…**, **D’ailleurs…**, **En parlant de…**.')),
      sort(b('For or against remote work?', 'Pour ou contre le télétravail ?'), [b('for', 'pour'), b('against / reserved', 'contre / réservé')], [['Je gagne deux heures par jour.', 0], ['Je me sens seule.', 1], ['C’est la liberté.', 0], ['Mes collègues me manquent.', 1]]),
      pairs(P.match, [['me manquer', b('to be missed by me (I miss…)', 'je regrette son absence')], ['passons à…', b('let’s move on to…', 'parlons maintenant de…')], ['d’ailleurs', b('by the way, besides', 'en outre')], ['en parlant de…', b('speaking of…', 'à propos de…')]]),
      dict('Bon, on change de sujet : vous partez où cet été ?', { voice: 'm' }),
    ],
    [
      b('Identify each speaker with their first words (Pour moi, Moi, Oui mais…).', 'Repérez chaque intervenant par ses premiers mots (Pour moi, Moi, Oui mais…).'),
      b('Oui, mais… = polite disagreement.', 'Oui, mais… = désaccord poli.'),
      b('Topic change: Bon, on change de sujet, Passons à…', 'Changement de sujet : Bon, on change de sujet, Passons à…'),
    ],
    [['le télétravail', b('remote work', 'travail à distance')], ['un animateur', b('a host (radio, podcast)', 'personne qui anime')], ['un invité', b('a guest', 'personne invitée')]],
  ),
];

function mc2() {
  return hear('Genre, c’était trop bien ! Tu sais, le genre de voyage que tu oublies jamais.', b('How was the trip?', 'Comment était le voyage ?'), [b('Really great, unforgettable', 'Vraiment génial, inoubliable'), b('Too long', 'Trop long'), b('Boring', 'Ennuyeux'), b('Forgettable', 'Oubliable')]);
}
