// C1 · Column. A writer defends boredom: what we lose by filling every empty
// minute with a screen, why idle moments feed thought, and a measured
// conclusion. Emphasis with c’est… que and ce que… c’est.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'eloge-de-l-ennui',
  warmup: b(
    'When did you last wait for something without looking at your phone? Can boredom be useful?',
    'Quand avez-vous attendu pour la dernière fois sans regarder votre téléphone ? L’ennui peut-il être utile ?',
  ),
  paras: [
    { s: [
      ['Il y a encore une vingtaine d’années, attendre un bus, c’était regarder la rue.', 'Only twenty or so years ago, waiting for a bus meant watching the street.'],
      ['On observait les passants, on remarquait une vitrine, on laissait son esprit vagabonder.', 'You watched the passers-by, noticed a shop window, let your mind wander.'],
      ['Aujourd’hui, à peine une minute de vide se présente-t-elle que nous sortons notre téléphone.', 'Today, no sooner does an empty minute come along than we take out our phones.'],
      ['L’ennui, ce compagnon discret de nos journées, est en voie de disparition, et c’est peut-être une perte plus grande qu’il n’y paraît.', 'Boredom, that discreet companion of our days, is on the verge of disappearing, and this may be a greater loss than it seems.'],
    ] },
    { s: [
      ['Ce que nous fuyons ainsi, ce n’est pas seulement l’inaction : c’est la rencontre avec nous-mêmes.', 'What we are running away from is not just inactivity: it is the encounter with ourselves.'],
      ['Car l’ennui n’est pas un vide absolu.', 'For boredom is not an absolute void.'],
      ['C’est dans ces moments sans stimulation que l’esprit, privé de sollicitations extérieures, se met à relier des idées éparses, à revenir sur une conversation, à imaginer une solution qu’il ne cherchait pas.', 'It is in these moments without stimulation that the mind, deprived of outside demands, starts linking scattered ideas, going back over a conversation, imagining a solution it was not looking for.'],
      ['Nombre d’écrivains et de chercheurs racontent que leurs meilleures intuitions leur sont venues sous la douche, en marchant ou en regardant par la fenêtre d’un train.', 'Many writers and researchers say their best intuitions came to them in the shower, while walking or looking out of a train window.'],
    ] },
    { s: [
      ['Certaines études suggèrent même qu’après une tâche monotone, on se montre plus inventif qu’après une activité qui nous a tenus occupés en permanence.', 'Some studies even suggest that after a monotonous task, people are more inventive than after an activity that kept them constantly busy.'],
      ['Il ne s’agit pas de faire l’apologie de la paresse, mais de reconnaître que l’esprit a besoin de jachère, comme un champ qu’on laisse reposer pour qu’il redevienne fertile.', 'This is not about praising laziness, but about recognising that the mind needs to lie fallow, like a field left to rest so that it becomes fertile again.'],
    ] },
    { s: [
      ['Ce qui frappe, c’est que nous traitons désormais l’ennui comme un problème à résoudre, en particulier chez les enfants.', 'What is striking is that we now treat boredom as a problem to be solved, especially in children.'],
      ['On remplit leurs mercredis d’activités, on leur tend une tablette dans la salle d’attente, de peur qu’ils ne s’ennuient.', 'We fill their Wednesdays with activities, hand them a tablet in the waiting room, for fear they might get bored.'],
      ['Or c’est précisément en s’ennuyant qu’un enfant invente un jeu, construit une cabane ou se raconte une histoire.', 'Yet it is precisely by being bored that a child invents a game, builds a den or tells themselves a story.'],
    ] },
    { s: [
      ['Faut-il pour autant éteindre nos écrans et contempler les murs ?', 'Does that mean we should switch off our screens and stare at the walls?'],
      ['Sans doute pas.', 'Probably not.'],
      ['Mais peut-être pourrions-nous, de temps à autre, résister au réflexe de combler chaque instant.', 'But perhaps we could, from time to time, resist the reflex of filling every moment.'],
      ['Laisser son téléphone dans sa poche pendant un trajet, c’est accepter quelques minutes d’inconfort ; c’est aussi, parfois, se donner une chance de penser vraiment.', 'Leaving your phone in your pocket during a journey means accepting a few minutes of discomfort; it is also, sometimes, giving yourself a chance to really think.'],
    ] },
  ],
  glossary: [
    { fr: 'vagabonder', tr: b('to wander, to drift', 'aller librement, sans but précis') },
    { fr: 'à peine', tr: b('no sooner, hardly', 'tout juste, presque immédiatement') },
    { fr: 'en voie de disparition', tr: b('on the verge of disappearing, endangered', 'qui est en train de disparaître') },
    { fr: 'qu’il n’y paraît', tr: b('than it seems', 'qu’on ne le croit au premier regard') },
    { fr: 'fuyons', tr: b('run away from (fuir)', 'évitons, essayons d’échapper à') },
    { fr: 'l’inaction', tr: b('inactivity', 'le fait de ne rien faire') },
    { fr: 'sollicitations', tr: b('demands, prompts (for attention)', 'tout ce qui attire ou réclame notre attention') },
    { fr: 'éparses', tr: b('scattered', 'dispersées, séparées les unes des autres') },
    { fr: 'Nombre d’écrivains', tr: b('many writers', 'beaucoup d’écrivains (soutenu)') },
    { fr: 'intuitions', tr: b('intuitions, insights', 'idées qui viennent sans raisonnement') },
    { fr: 'monotone', tr: b('monotonous, dull', 'répétitive, toujours pareille') },
    { fr: 'faire l’apologie de', tr: b('to praise, to defend', 'faire l’éloge de, défendre') },
    { fr: 'la paresse', tr: b('laziness', 'le refus de faire des efforts') },
    { fr: 'jachère', tr: b('fallow (land left to rest)', 'terre qu’on ne cultive pas pendant un temps pour qu’elle se repose') },
    { fr: 'fertile', tr: b('fertile', 'qui produit beaucoup') },
    { fr: 'Ce qui frappe', tr: b('what is striking', 'ce qui étonne, ce qu’on remarque') },
    { fr: 'de peur qu’ils ne s’ennuient', tr: b('for fear they might get bored (subjunctive, expletive ne)', 'parce qu’on craint qu’ils s’ennuient (subjonctif, ne explétif)') },
    { fr: 'précisément', tr: b('precisely, exactly', 'justement') },
    { fr: 'pour autant', tr: b('for all that, does that mean', 'malgré cela, est-ce une raison pour') },
    { fr: 'combler', tr: b('to fill (a gap)', 'remplir complètement un vide') },
    { fr: 'inconfort', tr: b('discomfort', 'sensation désagréable, gêne') },
  ],
  questions: [
    {
      q: 'Quelle est la thèse de l’auteur ?',
      qEn: 'What is the author’s thesis?',
      options: [
        'Il faut supprimer les téléphones',
        'L’ennui a une valeur, et sa disparition est une perte',
        'Les enfants s’ennuient trop aujourd’hui',
        'Attendre le bus était plus agréable autrefois',
      ],
      answer: 1,
      evidence: 'c’est peut-être une perte plus grande qu’il n’y paraît',
      explain: b(
        'The title (“éloge”, praise) and the first paragraph set the thesis: losing boredom costs us more than we think.',
        'Le titre (« éloge ») et le premier paragraphe posent la thèse : perdre l’ennui nous coûte plus qu’on ne le croit.',
      ),
      skill: 'global',
    },
    {
      q: '« À peine une minute de vide se présente-t-elle que nous sortons notre téléphone » signifie que…',
      qEn: '“À peine une minute de vide se présente-t-elle que nous sortons notre téléphone” means that…',
      options: [
        'nous sortons notre téléphone dès qu’un moment vide arrive',
        'nous avons rarement une minute de libre',
        'nous regardons notre téléphone pendant à peine une minute',
        'nous attendons une minute avant de sortir notre téléphone',
      ],
      answer: 0,
      evidence: 'à peine une minute de vide se présente-t-elle que nous sortons notre téléphone',
      explain: b(
        'À peine… que (with inversion of the subject) marks immediate succession: as soon as the empty minute comes, the phone comes out.',
        'À peine… que (avec inversion du sujet) marque la succession immédiate : dès que la minute vide arrive, le téléphone sort.',
      ),
      skill: 'vocab',
    },
    {
      q: 'Selon l’auteur, que fuyons-nous vraiment en évitant l’ennui ?',
      qEn: 'According to the author, what are we really running from when we avoid boredom?',
      options: ['Le travail', 'La rencontre avec nous-mêmes', 'Les autres passagers', 'Le silence de la rue'],
      answer: 1,
      evidence: 'c’est la rencontre avec nous-mêmes',
      explain: b(
        '“Ce que nous fuyons, ce n’est pas seulement l’inaction : c’est la rencontre avec nous-mêmes.” The emphatic structure highlights the real answer.',
        '« Ce que nous fuyons, ce n’est pas seulement l’inaction : c’est la rencontre avec nous-mêmes. » La mise en relief souligne la vraie réponse.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que fait l’esprit dans un moment sans stimulation ?',
      qEn: 'What does the mind do in a moment without stimulation?',
      options: [
        'Il s’arrête complètement',
        'Il relie des idées éparses et imagine des solutions',
        'Il cherche une distraction',
        'Il oublie les conversations',
      ],
      answer: 1,
      evidence: 'se met à relier des idées éparses',
      explain: b(
        'Boredom “n’est pas un vide absolu”: the mind links ideas, revisits a conversation, imagines a solution.',
        'L’ennui « n’est pas un vide absolu » : l’esprit relie des idées, revient sur une conversation, imagine une solution.',
      ),
      skill: 'detail',
    },
    {
      q: 'Pourquoi l’auteur précise-t-il « Il ne s’agit pas de faire l’apologie de la paresse » ?',
      qEn: 'Why does the author specify “Il ne s’agit pas de faire l’apologie de la paresse”?',
      options: [
        'Pour défendre la paresse',
        'Pour éviter un malentendu : il ne défend pas le fait de ne rien faire par principe',
        'Pour critiquer les études scientifiques',
        'Pour changer de sujet',
      ],
      answer: 1,
      evidence: 'Il ne s’agit pas de faire l’apologie de la paresse',
      explain: b(
        'He anticipates an objection: praising boredom is not praising laziness, but recognising the mind needs rest.',
        'Il anticipe une objection : faire l’éloge de l’ennui n’est pas faire l’éloge de la paresse, mais reconnaître que l’esprit a besoin de repos.',
      ),
      skill: 'inference',
    },
    {
      q: 'Que signifie l’image de la « jachère » ?',
      qEn: 'What does the image of “jachère” (fallow land) mean?',
      options: [
        'L’esprit a besoin de périodes de repos pour redevenir productif',
        'Il faut travailler à la campagne',
        'Les idées poussent mieux en été',
        'L’esprit doit être cultivé sans arrêt',
      ],
      answer: 0,
      evidence: 'comme un champ qu’on laisse reposer pour qu’il redevienne fertile',
      explain: b(
        'A field left to rest becomes fertile again; likewise, a mind left idle for a while becomes inventive again.',
        'Un champ qu’on laisse reposer redevient fertile ; de même, un esprit laissé au repos redevient inventif.',
      ),
      skill: 'vocab',
    },
    {
      q: 'Que reproche l’auteur à notre façon de traiter les enfants ?',
      qEn: 'What does the author criticise in the way we treat children?',
      options: [
        'Nous leur laissons trop de temps libre',
        'Nous les empêchons de s’ennuyer, alors que l’ennui les rend créatifs',
        'Nous leur interdisons les tablettes',
        'Nous ne les emmenons pas assez chez le médecin',
      ],
      answer: 1,
      evidence: ['de peur qu’ils ne s’ennuient', 'c’est précisément en s’ennuyant qu’un enfant invente un jeu'],
      explain: b(
        'We fill every moment “de peur qu’ils ne s’ennuient”; yet (or) boredom is what makes them invent games and stories.',
        'On comble chaque moment « de peur qu’ils ne s’ennuient » ; or c’est justement l’ennui qui leur fait inventer des jeux et des histoires.',
      ),
      skill: 'inference',
    },
    {
      q: 'Quelle est la position finale de l’auteur sur les écrans ?',
      qEn: 'What is the author’s final position on screens?',
      options: [
        'Il faut les éteindre définitivement',
        'Ils ne posent aucun problème',
        'Sans les rejeter, il faudrait parfois résister au réflexe de combler chaque instant',
        'Il faut les réserver aux adultes',
      ],
      answer: 2,
      evidence: ['Sans doute pas.', 'résister au réflexe de combler chaque instant'],
      explain: b(
        'A measured conclusion: “Faut-il éteindre nos écrans ? Sans doute pas.” Just resist, from time to time, filling every moment.',
        'Une conclusion nuancée : « Faut-il éteindre nos écrans ? Sans doute pas. » Simplement résister, de temps à autre, au réflexe de tout combler.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('Emphasis: c’est… que, ce que… c’est', 'La mise en relief : c’est… que, ce que… c’est'),
    body: b(
      'To highlight one element, French frames it. __C’est… que__ / __c’est… qui__: **c’est** dans ces moments **que** l’esprit relie des idées; **c’est** en s’ennuyant **qu’**un enfant invente un jeu. __Ce que… c’est__ / __ce qui… c’est__ announces the element at the end: **ce que** nous fuyons, **c’est** la rencontre avec nous-mêmes; **ce qui** frappe, **c’est que**… Use ce que when the element is an object, ce qui when it is a subject.',
      'Pour mettre un élément en valeur, le français l’encadre. __C’est… que__ / __c’est… qui__ : **c’est** dans ces moments **que** l’esprit relie des idées ; **c’est** en s’ennuyant **qu’**un enfant invente un jeu. __Ce que… c’est__ / __ce qui… c’est__ annonce l’élément à la fin : **ce que** nous fuyons, **c’est** la rencontre avec nous-mêmes ; **ce qui** frappe, **c’est que**… On emploie ce que pour un complément d’objet, ce qui pour un sujet.',
    ),
    examples: [
      { fr: 'Ce que nous fuyons, c’est la rencontre avec nous-mêmes.', tr: 'What we are running from is the encounter with ourselves.' },
      { fr: 'C’est en s’ennuyant qu’un enfant invente un jeu.', tr: 'It is by being bored that a child invents a game.' },
      { fr: 'Ce qui frappe, c’est que nous traitons l’ennui comme un problème.', tr: 'What is striking is that we treat boredom as a problem.' },
    ],
  },
};

export default text;
