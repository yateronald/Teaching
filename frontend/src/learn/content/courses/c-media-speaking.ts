import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A local radio interviews you about your association, a journalist calls your company, you record a video for a conference: speaking in the media is a specific exercise. You must be brief, clear and quotable, keep your key message, handle awkward questions and never be trapped. This course gives you the techniques media trainers teach: the three key messages, bridging, short sentences and the art of the concise answer.',
    'Une radio locale vous interroge sur votre association, un journaliste appelle votre entreprise, vous enregistrez une vidéo pour un colloque : parler dans les médias est un exercice particulier. Il faut être bref, clair et citable, garder son message clé, gérer les questions gênantes et ne jamais se laisser piéger. Ce cours vous donne les techniques des formateurs en communication : les trois messages clés, la passerelle, les phrases courtes et l’art de la réponse concise.',
  ),
  outcomes: [
    b('Prepare three key messages', 'Préparer trois messages clés'),
    b('Answer briefly and clearly', 'Répondre brièvement et clairement'),
    b('Bridge back to your message', 'Revenir à son message par une passerelle'),
    b('Handle difficult questions', 'Gérer les questions difficiles'),
  ],
};

const C = 'c-media-speaking';
export default [
  lesson(C, 1, ['key-messages-and-short-answers', 'messages-cles-et-reponses-courtes'],
    b('Key messages and short answers', 'Messages clés et réponses courtes'),
    b('Prepare your message and say the essential first, in short sentences.', 'Préparer son message et dire l’essentiel d’abord, en phrases courtes.'),
    [b('Define three key messages', 'Définir trois messages clés'), b('Put the conclusion first', 'Mettre la conclusion en premier'), b('Speak in short, concrete sentences', 'Parler en phrases courtes et concrètes')],
    13,
    [
      card(b('The essential first', 'L’essentiel d’abord'), b('In the media, answer like a **pyramid**: the **main idea first**, then one example, then a detail if time allows. One idea per sentence. Concrete images: **« l’équivalent de deux piscines olympiques »** rather than **« 5 000 m³ »**.', 'Dans les médias, répondez en **pyramide inversée** : **l’idée principale d’abord**, puis un exemple, puis un détail s’il reste du temps. Une idée par phrase. Des images concrètes : **« l’équivalent de deux piscines olympiques »** plutôt que **« 5 000 m³ »**.')),
      mc(P.best, ['Notre objectif est simple : qu’aucun enfant du quartier ne reste sans activité l’été. Cette année, nous en accueillons trois cents.', 'Alors, euh, il faut d’abord remonter à 2009, quand nous avons créé, avec quelques amis, dans un contexte assez compliqué…', 'C’est une question complexe qui mérite une analyse approfondie de nombreux facteurs.', 'Je ne sais pas trop par où commencer.'], { fr: '— En quelques mots, que fait votre association ?' }),
      sort(b('Media-friendly or not?', 'Adapté aux médias ou non ?'), [b('media-friendly', 'adapté'), b('not media-friendly', 'pas adapté')], [['Une idée par phrase.', 0], ['Une phrase de quatre lignes avec trois subordonnées.', 1], ['Un exemple concret et chiffré.', 0], ['Du jargon technique non expliqué.', 1], ['La conclusion en premier.', 0], ['Un long historique avant d’arriver au sujet.', 1]]),
      hear('Ce qu’il faut retenir, c’est que le nouveau tramway réduira de moitié le temps de trajet entre la gare et l’hôpital. Concrètement, vingt minutes au lieu de quarante. Et les travaux commenceront en mars.', b('What is the key message?', 'Quel est le message clé ?'), [b('The new tram will halve the journey time.', 'Le nouveau tramway divisera le temps de trajet par deux.'), b('The works will be very noisy.', 'Les travaux seront très bruyants.'), b('The hospital is moving.', 'L’hôpital déménage.'), b('The station is closing in March.', 'La gare ferme en mars.')], { voice: 'm' }),
      ord(P.order, 'Ce qu’il faut retenir, c’est que le projet est financé.', { tr: 'What you need to remember is that the project is funded.' }),
      pairs(P.match, [['un message clé', b('a key message', 'idée à faire passer')], ['citable', b('quotable', 'qu’on peut reprendre')], ['le jargon', b('jargon', 'langage technique')], ['concrètement', b('in practical terms', 'dans les faits')]]),
      say('Ce qu’il faut retenir, c’est une chose simple : grâce à ce projet, trois cents enfants auront des activités cet été.', 'What you need to remember is one simple thing: thanks to this project, three hundred children will have activities this summer.'),
    ],
    [
      b('Inverted pyramid: main idea first, then example, then detail.', 'Pyramide inversée : idée principale, puis exemple, puis détail.'),
      b('One idea per sentence; concrete images and figures.', 'Une idée par phrase ; images et chiffres concrets.'),
      b('Signal it: Ce qu’il faut retenir, c’est que…', 'Signalez-le : Ce qu’il faut retenir, c’est que…'),
    ],
    [['un trajet', b('a journey', 'parcours')], ['les travaux', b('works, construction', 'chantier')], ['accueillir', b('to welcome, take in', 'recevoir')]],
  ),
  lesson(C, 2, ['bridging-back-to-your-message', 'la-technique-de-la-passerelle'],
    b('Bridging back to your message', 'La technique de la passerelle'),
    b('Acknowledge a question briefly, then bring the conversation back to your key point.', 'Reconnaître brièvement la question, puis ramener l’échange à son point clé.'),
    [b('Acknowledge the question', 'Reconnaître la question'), b('Use a bridge phrase', 'Utiliser une phrase passerelle'), b('Return to your message', 'Revenir à son message')],
    13,
    [
      card(b('Bridge phrases', 'Les phrases passerelles'), b('Acknowledge + bridge + message: **C’est une vraie question, et justement, ce qui compte aujourd’hui, c’est…** · **Je comprends cette inquiétude. Ce que je peux vous dire, c’est que…** · **Au-delà de ce point, l’essentiel est…** · **Permettez-moi de revenir à l’essentiel : …**', 'Reconnaître + passerelle + message : **C’est une vraie question, et justement, ce qui compte aujourd’hui, c’est…** · **Je comprends cette inquiétude. Ce que je peux vous dire, c’est que…** · **Au-delà de ce point, l’essentiel est…** · **Permettez-moi de revenir à l’essentiel : …**')),
      tip(b('Don’t dodge everything', 'N’esquivez pas tout'), b('A bridge works only if you **really acknowledge** the question. Dodging every question destroys your credibility. Answer briefly, **then** bridge.', 'La passerelle ne fonctionne que si vous **reconnaissez vraiment** la question. Esquiver toutes les questions détruit votre crédibilité. Répondez brièvement, **puis** faites la passerelle.')),
      mc(P.best, ['Je comprends cette inquiétude, et nous la prenons au sérieux. Ce que je peux vous dire, c’est que les commerçants seront indemnisés pendant toute la durée des travaux.', 'Ce n’est pas le sujet.', 'Je ne réponds pas à cette question.', 'Les commerçants se plaignent toujours.'], { fr: '— Les commerçants disent que les travaux vont les ruiner. Que leur répondez-vous ?' }),
      mc(P.best, ['Au-delà de ce point, l’essentiel est que…', 'Bon, passons, ce n’est pas intéressant.', 'Votre question est stupide, mais…', 'Je ne sais pas, et donc…'], { fr: 'Quelle passerelle est la plus efficace ?' }),
      dlg(b('A radio interview', 'Une interview à la radio'), undefined, [['Journaliste', 'f'], ['Vous', 'm']], [
        [0, 'Votre festival a coûté cher à la ville. N’est-ce pas de l’argent gaspillé ?', 'Your festival cost the city a lot. Isn’t it wasted money?'],
        [1, { options: ['C’est une vraie question. Justement, chaque euro investi a rapporté trois euros aux commerces locaux.', 'Pas du tout, c’est faux, vous êtes mal informée.', 'Je ne parle pas d’argent.'] }],
        [0, 'Mais certains habitants se plaignent du bruit.', 'But some residents complain about the noise.'],
        [1, { options: ['Je comprends, et nous avons avancé la fin des concerts à 23 h. Ce qui compte, c’est que le festival reste une fête pour tous.', 'Ils n’ont qu’à partir en vacances.', 'Le bruit, ce n’est pas mon problème.'] }],
      ]),
      pairs(P.match, [['une passerelle', b('a bridge (technique)', 'transition vers son message')], ['gaspiller', b('to waste', 'dépenser inutilement')], ['rapporter', b('to bring in (money)', 'générer')], ['l’essentiel', b('the main thing', 'le plus important')]]),
      say('Je comprends cette inquiétude. Ce que je peux vous dire, c’est que nous avons trouvé une solution pour chaque commerçant.', 'I understand that concern. What I can tell you is that we have found a solution for every shopkeeper.'),
    ],
    [
      b('Acknowledge: C’est une vraie question. Je comprends cette inquiétude.', 'Reconnaître : C’est une vraie question. Je comprends cette inquiétude.'),
      b('Bridge: Justement… Ce que je peux vous dire, c’est que… Au-delà de ce point…', 'Passerelle : Justement… Ce que je peux vous dire, c’est que… Au-delà de ce point…'),
      b('Answer briefly before bridging.', 'Répondez brièvement avant la passerelle.'),
    ],
    [['un commerçant', b('a shopkeeper', 'qui tient un commerce')], ['indemniser', b('to compensate', 'dédommager')], ['la crédibilité', b('credibility', 'confiance qu’on inspire')]],
  ),
  lesson(C, 3, ['difficult-questions-and-traps', 'questions-difficiles-et-pieges'],
    b('Difficult questions and traps', 'Questions difficiles et pièges'),
    b('Spot the classic traps and answer without being caught.', 'Repérer les pièges classiques et répondre sans se faire prendre.'),
    [b('Spot leading questions', 'Repérer les questions orientées'), b('Refuse a false alternative', 'Refuser une fausse alternative'), b('Say « I don’t know » professionally', 'Dire « je ne sais pas » professionnellement')],
    13,
    [
      card(b('Classic traps', 'Les pièges classiques'), b('**False alternative**: « Incompétence ou mensonge ? » → **Ni l’un ni l’autre : …** · **Hypothetical**: « Et si ça échoue ? » → **Je ne vais pas spéculer ; ce qui est sûr, c’est que…** · **Putting words in your mouth**: « Donc vous admettez que… ? » → **Ce n’est pas ce que j’ai dit. Ce que j’ai dit, c’est que…** · **Unknown**: **Je n’ai pas ce chiffre en tête, je vous le communiquerai.**', '**Fausse alternative** : « Incompétence ou mensonge ? » → **Ni l’un ni l’autre : …** · **Hypothèse** : « Et si ça échoue ? » → **Je ne vais pas spéculer ; ce qui est sûr, c’est que…** · **Paroles prêtées** : « Donc vous admettez que… ? » → **Ce n’est pas ce que j’ai dit. Ce que j’ai dit, c’est que…** · **Inconnu** : **Je n’ai pas ce chiffre en tête, je vous le communiquerai.**')),
      mc(P.best, ['Ni l’un ni l’autre : nous avons détecté un problème technique et nous l’avons corrigé en vingt-quatre heures.', 'Un peu des deux, je l’avoue.', 'Plutôt l’incompétence.', 'Je refuse de répondre.'], { fr: '— Ce retard, c’est de l’incompétence ou un mensonge ?' }),
      mc(P.best, ['Ce n’est pas ce que j’ai dit. Ce que j’ai dit, c’est que le calendrier est serré mais tenable.', 'Oui, j’admets tout.', 'Peut-être, je ne sais plus.', 'Vous déformez tout, c’est scandaleux !'], { fr: '— Donc vous admettez que le projet est un échec ?' }),
      sort(b('Which trap?', 'Quel piège ?'), [b('false alternative', 'fausse alternative'), b('hypothetical', 'hypothèse'), b('words put in your mouth', 'paroles prêtées')], [['Erreur ou négligence ?', 0], ['Et si les chiffres baissent l’an prochain ?', 1], ['Vous reconnaissez donc avoir menti ?', 2], ['C’est la faute du maire ou de l’État ?', 0], ['Que ferez-vous si personne ne vient ?', 1], ['Si je vous comprends bien, vous avez échoué ?', 2]]),
      gap(P.complete, 'Je n’ai pas ce chiffre en ___ , mais je vous le ___ dès cet après-midi.', ['tête', ['communiquerai', 'transmettrai', 'enverrai']]),
      pairs(P.match, [['spéculer', b('to speculate', 'faire des hypothèses')], ['tenable', b('achievable, sustainable', 'qu’on peut tenir')], ['déformer', b('to distort', 'changer le sens')], ['une négligence', b('negligence', 'manque de soin')]]),
      say('Je ne vais pas spéculer. Ce qui est sûr, c’est que nous avons tout mis en œuvre pour réussir.', 'I won’t speculate. What is certain is that we have done everything to succeed.'),
    ],
    [
      b('False alternative: Ni l’un ni l’autre.', 'Fausse alternative : Ni l’un ni l’autre.'),
      b('Hypothetical: Je ne vais pas spéculer ; ce qui est sûr, c’est que…', 'Hypothèse : Je ne vais pas spéculer ; ce qui est sûr, c’est que…'),
      b('Distortion: Ce n’est pas ce que j’ai dit. Unknown: je vous le communiquerai.', 'Déformation : Ce n’est pas ce que j’ai dit. Inconnu : je vous le communiquerai.'),
    ],
    [['un piège', b('a trap', 'question dangereuse')], ['un échec', b('a failure', 'contraire de réussite')], ['mettre en œuvre', b('to implement', 'réaliser')]],
  ),
];
