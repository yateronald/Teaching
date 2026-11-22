import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je ne sais rien, personne n’est venu, je n’ai vu personne. Going beyond ne… pas unlocks how French expresses "never", "no longer", "nothing", "nobody" and "not a single". This course covers every negative word, shows what happens when personne or rien starts the sentence, and clears up word order in the passé composé and before infinitives.',
    'Je ne sais rien, personne n’est venu, je n’ai vu personne. Aller au-delà de ne… pas permet d’exprimer « jamais », « plus », « rien », « personne » et « aucun ». Ce cours maîtrise chaque mot négatif, la place de personne et rien en position de sujet, et l’ordre exact au passé composé comme devant un infinitif.',
  ),
  outcomes: [
    b('Use ne… plus, ne… jamais, ne… rien, ne… personne and ne… aucun(e) without doubling pas', 'Employer ne… plus, ne… jamais, ne… rien, ne… personne et ne… aucun(e) sans pas'),
    b('Put personne and rien first as subjects and combine negatives cleanly', 'Placer personne et rien en tête de phrase et combiner deux négations'),
    b('Place every negative accurately in passé composé and before an infinitive', 'Placer chaque négation au passé composé et devant un infinitif'),
  ],
};

const C = 'gr-negation-advanced-a2';

const lessons: Lesson[] = [
  lesson(C, 1, ['jamais-plus-rien-personne', 'jamais-plus-rien-personne'],
    b('Ne… plus, jamais, rien, personne, aucun', 'Ne… plus, jamais, rien, personne, aucun'),
    b('Each negative replaces pas to say no longer, never, nothing, nobody or not one.', 'Chaque négation remplace pas pour exprimer la fin, l’absence ou la quantité nulle.'),
    [
      b('Match positive words (toujours, encore, quelque chose, quelqu’un) with their negative pair', 'Associer chaque mot positif à sa négation exacte'),
      b('Drop pas completely when using plus, jamais, rien, personne or aucun', 'Supprimer complètement pas avec plus, jamais, rien, personne ou aucun'),
      b('Keep aucun(e) singular after ne', 'Garder aucun(e) au singulier après ne'),
    ],
    13,
    [
      card(
        b('Every negative word replaces pas', 'Chaque mot négatif remplace pas'),
        b(
          'In French, **ne… pas** is just the baseline. To say *never, no longer, nothing, nobody* or *not a single*, keep **ne / n’** before the verb and **replace pas** with the exact negative word.\n\nPositive triggers: **encore, toujours, quelque chose, quelqu’un**.\nNegative partners: **ne… plus, ne… jamais, ne… rien, ne… personne**.',
          'En français, **ne… pas** n’est que le point de départ. Pour dire *jamais, plus, rien, personne* ou *aucun*, on garde **ne / n’** devant le verbe et on **remplace pas** par le mot négatif adapté.\n\nMots positifs : **encore, toujours, quelque chose, quelqu’un**.\nNégations correspondantes : **ne… plus, ne… jamais, ne… rien, ne… personne**.',
        ),
        {
          table: {
            head: [b('Positive', 'Positif'), b('Negative', 'Négatif'), b('Example', 'Exemple')],
            rows: [
              ['encore / toujours', 'ne… plus', 'Il ne pleut plus.'],
              ['toujours / déjà / souvent', 'ne… jamais', 'Je ne bois jamais de café le soir.'],
              ['quelque chose / tout', 'ne… rien', 'Elle ne dit rien.'],
              ['quelqu’un / tout le monde', 'ne… personne', 'Je ne connais personne ici.'],
              ['un(e) / des / quelques', 'ne… aucun(e)', 'Nous n’avons aucune question.'],
            ],
          },
          ex: [
            ['À cette heure-ci, il n’y a plus de métro.', 'At this time of night, there is no metro left.'],
            ['Je ne comprends rien à ce mode d’emploi.', 'I don’t understand anything in this manual.'],
          ],
        },
      ),
      trap(
        b('Never add pas — and keep aucun(e) singular', 'Jamais de pas en double — et aucun reste singulier'),
        b(
          'Never combine **pas** with **jamais, plus, rien, personne** or **aucun**: say **Je ne sais rien**, never « Je ne sais pas rien ». Also remember that **ne… aucun(e)** means *not a single one*, so the noun is ALWAYS singular (**aucun problème**, **aucune idée**). For short one-word answers without a verb, drop **ne**: **Rien. / Personne. / Jamais.**\n\nOne-word replies: **Rien du tout !, Personne !, Jamais de la vie !**.\nSingular noun: **aucun bruit, aucune erreur, aucun billet**.',
          'N’ajoutez jamais **pas** avec **jamais, plus, rien, personne** ou **aucun** : on dit **Je ne sais rien**, jamais « Je ne sais pas rien ». Avec **ne… aucun(e)**, le nom reste TOUJOURS au singulier (**aucun problème**, **aucune idée**). Dans une réponse courte sans verbe, on enlève **ne** : **Rien. / Personne. / Jamais.**\n\nRéponses courtes : **Rien du tout !, Personne !, Jamais de la vie !**.\nNom singulier : **aucun bruit, aucune erreur, aucun billet**.',
        ),
      ),
      mc(P.form, ['plus', 'pas plus', 'rien', 'aucune'], {
        fr: 'Avant je fumais, mais maintenant je ne fume ___.',
      }),
      mc(P.form, ['aucune idée', 'aucunes idées', 'pas aucune idée', 'rien idée'], {
        fr: 'Où a-t-il mis les clés ? Je n’ai ___ !',
      }),
      gap(P.complete, 'Tu vois ___ (quelqu’un) ? — Non, je ne vois ___ . Et dans le sac, il n’y a ___ (nothing) — vraiment ___ (nothing at all) !', [['quelqu’un'], ['personne'], ['rien'], ['rien du tout']], {
        choices: [['quelqu’un', 'personne'], ['personne', 'pas personne', 'rien'], ['rien', 'pas rien', 'plus'], ['rien du tout', 'pas rien']],
      }),
      pairs(
        b('Match each question with its natural negative answer.', 'Associez chaque question à la bonne réponse négative.'),
        [
          ['Tu as déjà visité Rome ?', 'Non, je n’y vais jamais.'],
          ['Il reste du pain ?', 'Non, il n’y en a plus.'],
          ['Tu entends quelqu’un ?', 'Non, je n’entends personne.'],
          ['Tu veux quelque chose ?', 'Non merci, je ne veux rien.'],
        ],
        true,
      ),
      sort(
        b('Which negative responds to which positive word?', 'Quel mot négatif correspond à chaque mot positif ?'),
        [b('ne… jamais / ne… plus', 'ne… jamais / ne… plus'), b('ne… rien / ne… personne / ne… aucun', 'ne… rien / ne… personne / ne… aucun')],
        [['quelqu’un', 1], ['déjà', 0], ['encore', 0], ['quelque chose', 1], ['souvent', 0], ['quelques amis', 1]],
      ),
      hear('Je n’ai aucune nouvelle de lui, et je ne travaille plus dans son entreprise.', b('What is true about the speaker?', 'Qu’apprend-on sur cette personne ?'), [
        b('They have no news of him and no longer work at his company', 'Elle n’a aucune nouvelle et ne travaille plus dans son entreprise'),
        b('They have never met him and work alone', 'Elle ne l’a jamais rencontré et travaille seule'),
        b('They talk to him every week at the office', 'Elle lui parle chaque semaine au bureau'),
      ]),
      dict('Il n’y a plus de lait et je n’ai aucune envie de sortir sous la pluie.'),
      say('Personne ? D’accord, je ne dis rien pour l’instant.', 'Nobody? Okay, I’m not saying anything for now.'),
    ],
    [
      b('Plus, jamais, rien, personne and aucun(e) replace pas completely.', 'Plus, jamais, rien, personne et aucun(e) remplacent complètement pas.'),
      b('Ne… aucun(e) always takes a singular noun: aucune idée, aucun bruit.', 'Ne… aucun(e) est toujours suivi d’un nom singulier : aucune idée, aucun bruit.'),
      b('In short replies without a verb, drop ne: Rien. / Personne. / Jamais.', 'Dans une réponse sans verbe, ne disparaît : Rien. / Personne. / Jamais.'),
    ],
    [
      ['un mode d’emploi', b('a user manual', 'un livret qui explique comment utiliser un objet')],
      ['rien du tout', b('nothing at all', 'absolument rien')],
      ['plus maintenant', b('not anymore', 'ce n’est plus le cas')],
    ],
  ),

  lesson(C, 2, ['personne-rien-as-subjects', 'personne-rien-sujets'],
    b('Personne and rien as subjects (and combined negatives)', 'Personne et rien sujets (et doubles négations)'),
    b('Put Personne n’… and Rien n’… at the front of the sentence, and stack two negatives cleanly.', 'Placer Personne n’… et Rien n’… en début de phrase, et combiner deux négations sans erreur.'),
    [
      b('Build subject-first sentences with Personne ne… and Rien ne…', 'Construire des phrases avec Personne ne… et Rien ne… en tête'),
      b('Keep the verb in 3rd-person singular after personne and rien', 'Accorder le verbe au singulier après personne et rien'),
      b('Combine compatible negatives like ne… plus rien or ne… jamais personne', 'Combiner deux négations comme ne… plus rien ou ne… jamais personne'),
    ],
    13,
    [
      card(
        b('When personne or rien is the subject', 'Quand personne ou rien est sujet'),
        b(
          'If *nobody* or *nothing* performs the action, **personne** or **rien** goes **at the very start**, followed immediately by **ne / n’** and a **3rd-person singular** verb (**il / elle** form).\n\nPersonne subject: **Personne ne sait, Personne n’est là, Personne n’a téléphoné**.\nRien subject: **Rien ne marche, Rien n’est prêt, Rien n’a changé**.',
          'Quand *personne* ou *rien* fait l’action, il se place **tout au début**, suivi aussitôt de **ne / n’** et d’un verbe à la **3e personne du singulier**.\n\nPersonne sujet : **Personne ne sait, Personne n’est là, Personne n’a téléphoné**.\nRien sujet : **Rien ne marche, Rien n’est prêt, Rien n’a changé**.',
        ),
        {
          ex: [
            ['Personne ne comprend cette affiche dans le couloir.', 'Nobody understands this poster in the corridor.'],
            ['Rien n’est impossible quand on s’entraîne régulièrement.', 'Nothing is impossible when you practise regularly.'],
          ],
        },
      ),
      tip(
        b('Stacking two negatives without pas', 'Combiner deux négations (toujours sans pas)'),
        b(
          'In French, two compatible negative words reinforce each other cleanly—still with only one **ne** and NO **pas**! Notice how natural the order sounds: **plus** or **jamais** comes before **rien** or **personne**.\n\nCombined pairs: **ne… plus rien, ne… plus personne, ne… jamais rien, ne… jamais personne**.\nSubject + object: **Personne ne dit rien, Rien ne change jamais**.',
          'En français, on peut associer deux mots négatifs pour renforcer le sens — avec un seul **ne** et toujours SANS **pas** ! **Plus** ou **jamais** se place avant **rien** ou **personne**.\n\nCombinaisons courantes : **ne… plus rien, ne… plus personne, ne… jamais rien, ne… jamais personne**.\nSujet + objet : **Personne ne dit rien, Rien ne change jamais**.',
        ),
        {
          ex: [
            ['Il n’y a plus personne au bureau après dix-neuf heures.', 'There is nobody left at the office after seven p.m.'],
            ['Elle ne jette jamais rien avant de vérifier.', 'She never throws anything away before checking.'],
          ],
        },
      ),
      mc(P.form, ['Personne n’est', 'Personne est', 'Ne personne est', 'Personne ne sont'], {
        fr: '___ arrivé en retard ce matin : toute l’équipe est là.',
        explain: b('Personne stays singular and takes ne/n’ before the verb.', 'Personne est sujet singulier suivi de ne/n’.'),
      }),
      mc(P.form, ['ne dit jamais rien', 'ne dit pas jamais rien', 'ne dit rien jamais', 'dit jamais ne rien'], {
        fr: 'Mon collègue est très discret : il ___ de personnel.',
      }),
      gap(P.complete, '___ (Nothing) ne fonctionne aujourd’hui ! ___ (Nobody) n’a la clé, et je n’ai ___ (no longer anything) à proposer.', [['Rien'], ['Personne'], ['plus rien']], {
        choices: [['Rien', 'Ne rien'], ['Personne', 'Ne personne'], ['plus rien', 'pas rien', 'rien plus']],
      }),
      ord(P.order, 'Il n’y a plus personne dans la rue à minuit.', {
        tr: 'There is nobody left in the street at midnight.',
        extra: ['pas', 'aucun'],
      }),
      hear('Rien n’est fermé le dimanche ici, mais personne ne se lève avant neuf heures.', b('What is true about Sundays here?', 'Que se passe-t-il le dimanche ici ?'), [
        b('Nothing is closed, yet nobody gets up before nine', 'Rien n’est fermé, mais personne ne se lève avant neuf heures'),
        b('Everything is closed and everybody wakes up early', 'Tout est fermé et tout le monde se lève tôt'),
        b('Only the bakery opens before nine', 'Seule la boulangerie ouvre avant neuf heures'),
      ]),
      dict('Personne ne sait pourquoi rien ne marche dans cette salle.'),
      say('Ne t’inquiète pas, il n’y a plus rien de grave.', 'Don’t worry, there isn’t anything serious anymore.'),
    ],
    [
      b('As subjects, personne and rien come first + ne/n’ + 3rd-person singular verb.', 'En position sujet, personne et rien viennent d’abord + ne/n’ + verbe au singulier.'),
      b('Combine negatives freely without pas: ne… plus rien, ne… jamais personne.', 'On peut combiner deux négations sans pas : ne… plus rien, ne… jamais personne.'),
      b('Order inside combined negatives: plus / jamais comes before rien / personne.', 'Ordre des combinaisons : plus / jamais précède rien / personne.'),
    ],
    [
      ['discret / discrète', b('discreet, quiet', 'qui parle peu de sa vie privée')],
      ['proposer', b('to suggest, offer', 'soumettre une idée')],
      ['s’inquiéter', b('to worry', 'ressentir de l’inquiétude')],
    ],
  ),

  lesson(C, 3, ['negation-passe-compose-infinitive', 'negation-temps-composes-infinitif'],
    b('Placement in passé composé and before an infinitive', 'Place au passé composé et devant l’infinitif'),
    b('Why Je n’ai rien vu puts rien before the participle, while Je n’ai vu personne puts personne after it.', 'Pourquoi rien précède le participe passé alors que personne le suit, et comment nier un infinitif.'),
    [
      b('Place pas, plus, jamais and rien around the auxiliary in passé composé', 'Placer pas, plus, jamais et rien autour de l’auxiliaire au passé composé'),
      b('Place personne and aucun(e) after the past participle', 'Placer personne et aucun(e) après le participe passé'),
      b('Keep ne pas, ne plus, ne jamais, ne rien together before an infinitive', 'Garder ne pas, ne plus, ne jamais, ne rien groupés devant l’infinitif'),
    ],
    13,
    [
      card(
        b('Passé composé: before or after the participle?', 'Passé composé : avant ou après le participe ?'),
        b(
          'In the **passé composé**, most negative words (**pas, plus, jamais, rien**) wrap tightly around the **auxiliary** (`avoir` or `être`), sitting **before** the past participle. By contrast, **personne** and **aucun(e)** wait until **after** the past participle!\n\nBefore participle: **n’a pas, n’a plus, n’a jamais, n’a rien**.\nAfter participle: **n’a vu personne, n’a parlé à personne, n’a fait aucune erreur**.',
          'Au **passé composé**, la plupart des négations (**pas, plus, jamais, rien**) encadrent l’**auxiliaire** (`avoir` ou `être`) et se placent **avant** le participe passé. En revanche, **personne** et **aucun(e)** passent **après** le participe passé !\n\nAvant le participe : **n’a pas, n’a plus, n’a jamais, n’a rien**.\nAprès le participe : **n’a vu personne, n’a parlé à personne, n’a fait aucune erreur**.',
        ),
        {
          table: {
            head: [b('Negative', 'Négatif'), b('Position in passé composé', 'Place au passé composé'), b('Example', 'Exemple')],
            rows: [
              ['ne… pas / plus / jamais', b('around auxiliary', 'autour de l’auxiliaire'), 'Elle n’est jamais venue ici.'],
              ['ne… rien', b('around auxiliary', 'autour de l’auxiliaire'), 'Je n’ai rien acheté.'],
              ['ne… personne', b('ne + aux + p.p. + personne', 'après le participe passé'), 'Nous n’avons croisé personne.'],
              ['ne… aucun(e)', b('ne + aux + p.p. + aucun(e)', 'après le participe passé'), 'Il n’a reçu aucune lettre.'],
            ],
          },
          ex: [
            ['Tu n’as rien oublié dans le train ?', 'Didn’t you forget anything on the train?'],
            ['Hier soir, je n’ai appelé personne.', 'Last night, I didn’t call anyone.'],
          ],
        },
      ),
      tip(
        b('Negating an infinitive: ne + word stay glued in front', 'Nier un infinitif : les deux mots restent collés devant'),
        b(
          'Before an infinitive, **ne pas, ne plus, ne jamais** and **ne rien** stand **together in front** of the verb—do NOT split them around the infinitive! Only **personne** still goes after the infinitive: **ne déranger personne**.\n\nBefore infinitive: **ne pas fumer, ne jamais mentir, ne rien dire, ne plus attendre**.\nOn signs and advice: **Merci de ne pas déranger, Il vaut mieux ne rien toucher**.',
          'Devant un infinitif, **ne pas, ne plus, ne jamais** et **ne rien** restent **collés devant** le verbe — ne les séparez pas autour de l’infinitif ! Seul **personne** se place après : **ne déranger personne**.\n\nDevant l’infinitif : **ne pas fumer, ne jamais mentir, ne rien dire, ne plus attendre**.\nConsignes et conseils : **Merci de ne pas déranger, Il vaut mieux ne rien toucher**.',
        ),
        {
          ex: [
            ['J’essaie de ne rien oublier avant mon départ.', 'I’m trying not to forget anything before I leave.'],
            ['Le guide demande de ne pas prendre de photos.', 'The guide asks not to take photos.'],
          ],
        },
      ),
      mc(P.order, ['Je n’ai rien entendu.', 'Je n’ai entendu rien.', 'Je rien n’ai entendu.', 'J’ai ne rien entendu.'], {
        fr: 'Choisissez la phrase correcte au passé composé.',
      }),
      mc(P.order, ['Il n’a invité personne à sa fête.', 'Il n’a personne invité à sa fête.', 'Il personne n’a invité à sa fête.', 'Il n’a invité pas personne.'], {
        fr: 'Quelle phrase est grammaticalement juste ?',
      }),
      gap(P.complete, 'Hier, nous ___ (ne / manger / rien) avant midi, et je ___ (ne / voir / personne) dans le parc. Merci de ___ (ne / laisser / pas) de déchets ici !', [['n’avons rien mangé'], ['n’ai vu personne'], ['ne pas laisser']], {
        choices: [['n’avons rien mangé', 'n’avons mangé rien'], ['n’ai vu personne', 'n’ai personne vu'], ['ne pas laisser', 'ne laisser pas']],
      }),
      ord(P.order, 'Elle a décidé de ne plus jamais conduire la nuit.', {
        tr: 'She decided never to drive at night again.',
        extra: ['pas'],
      }),
      sort(
        b('Where does the second negative word go in passé composé?', 'Où se place le second mot négatif au passé composé ?'),
        [b('Before the past participle (around auxiliary)', 'Avant le participe passé (autour de l’auxiliaire)'), b('After the past participle', 'Après le participe passé')],
        [['rien (Je n’ai ___ dit)', 0], ['personne (Je n’ai vu ___)', 1], ['jamais (Il n’est ___ venu)', 0], ['aucune (Elle n’a pris ___ photo)', 1], ['plus (Nous n’avons ___ parlé)', 0]],
      ),
      hear('Comme il avait neigé toute la nuit, nous n’avons croisé personne et nous n’avons rien entendu jusqu’à dix heures.', b('What happened that morning?', 'Que s’est-il passé ce matin-là ?'), [
        b('They met nobody and heard nothing until ten', 'Ils n’ont croisé personne et n’ont rien entendu jusqu’à dix heures'),
        b('They walked with neighbours before breakfast', 'Ils ont marché avec des voisins avant le petit-déjeuner'),
        b('Everyone stayed indoors because of a concert', 'Tout le monde est resté dedans à cause d’un concert'),
      ]),
      dlg(b('Closing up the office', 'En fermant le bureau'), b('Camille checks with Théo before locking the front door.', 'Camille vérifie avec Théo avant de fermer la porte à clé.'), [['Camille', 'f'], ['Théo', 'm']], [
        [0, 'Tu as vu quelqu’un dans l’autre salle ?', 'Did you see anyone in the other room?'],
        [1, { options: ['Non, je n’ai vu personne et je n’ai laissé aucune lumière allumée.', 'Non, je n’ai personne vu et je n’ai aucune laissé lumière allumée.', 'Non, je n’ai vu pas personne et je n’ai laissé pas lumière.'], explain: b('Personne and aucune come AFTER the past participle.', 'Personne et aucune se placent après le participe passé.') }],
        [0, 'Parfait ! Tu as bien pensé à fermer la fenêtre du couloir ?', 'Perfect! Did you remember to shut the corridor window?'],
        [1, { options: ['Oui, j’ai fait attention à ne rien oublier cette fois.', 'Oui, j’ai fait attention à ne oublier rien cette fois.', 'Oui, j’ai fait attention à pas ne oublier cette fois.'], explain: b('With an infinitive, ne rien stays together in front of the verb.', 'Devant l’infinitif, ne rien reste groupé avant le verbe.') }],
      ]),
      write(
        b('Tell a story of a quiet day when nothing went as planned', 'Raconter une journée où rien ne s’est passé comme prévu'),
        b('Write 40 to 70 words in the past and present about a quiet or unexpected day. Include at least one ne… rien in passé composé, one ne… personne in passé composé, one negative subject (Personne ne… or Rien ne…) and one negated infinitive (de ne pas / de ne rien…).', 'Écrivez 40 à 70 mots sur une journée calme ou imprévue. Employez au moins un ne… rien au passé composé, un ne… personne au passé composé, un sujet négatif (Personne ne… ou Rien ne…) et un infinitif négatif (de ne pas / de ne rien…).'),
        40,
        70,
        [
          b('Correct order for rien vs personne in passé composé', 'Place exacte de rien et personne au passé composé'),
          b('Subject personne/rien with ne + singular verb', 'Sujet personne ou rien suivi de ne + singulier'),
          b('Negated infinitive with ne + negative word in front', 'Infinitif négatif avec ne + mot négatif devant'),
        ],
        'Dimanche matin, je suis allé au bureau par erreur. Personne n’était là et je n’ai croisé personne dans l’immeuble. Je n’ai rien pu faire parce que mon ordinateur ne marchait pas. Avant de repartir, j’ai vérifié les portes pour ne rien oublier et je me suis promis de ne plus jamais venir le week-end.',
      ),
    ],
    [
      b('In passé composé: pas, plus, jamais, rien wrap the auxiliary; personne and aucun(e) follow the participle.', 'Au passé composé : pas, plus, jamais, rien entourent l’auxiliaire ; personne et aucun(e) suivent le participe.'),
      b('Before an infinitive: ne pas, ne plus, ne jamais, ne rien sit together in front.', 'Devant un infinitif : ne pas, ne plus, ne jamais, ne rien restent collés devant le verbe.'),
      b('With personne + infinitive, personne goes after: merci de ne déranger personne.', 'Avec personne et un infinitif, personne suit l’infinitif : merci de ne déranger personne.'),
    ],
    [
      ['croiser quelqu’un', b('to run into someone', 'rencontrer brièvement')],
      ['un déchet', b('rubbish, litter', 'un objet jeté ou abandonné')],
      ['allumé(e)', b('switched on, lit', 'en marche (lumière, écran)')],
    ],
  ),
];

export default lessons;
