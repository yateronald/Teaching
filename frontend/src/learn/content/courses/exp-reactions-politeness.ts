import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Real French conversation lives in quick reactions and polite softeners. Learn fifteen high-frequency phrases to accept invitations warmly, respond to good or bad news, encourage friends, and close exchanges with ease.',
    'Une vraie conversation française passe par de petits mots vivants. Maîtrisez quinze expressions essentielles pour accepter avec naturel, réagir aux bonnes ou mauvaises nouvelles, encourager vos proches et répondre avec politesse.',
  ),
  outcomes: [
    b('Agree, accept plans, and reassure others naturally with pas de souci and ça marche', 'Accepter des plans et rassurer avec naturel grâce à pas de souci et ça marche'),
    b('React warmly to good news, setbacks, and hard work ahead', 'Réagir avec justesse aux bonnes nouvelles, aux contretemps et aux efforts à venir'),
    b('Handle thanks, apologies, nuance, and friendly goodbyes smoothly', 'Répondre aux remerciements et excuses avec politesse et nuance'),
  ],
};

const C = 'exp-reactions-politeness';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['agreeing-and-accepting', 'accepter-et-reagir'],
    b('Agreeing & saying yes warmly', 'Accepter et dire oui avec naturel'),
    b('Go beyond a flat oui with everyday French ways to accept plans and reassure someone.', 'Aller au-delà d’un simple oui pour accepter un rendez-vous et rassurer son interlocuteur.'),
    [
      b('Use pas de souci, ça marche, avec plaisir, bien sûr, and d’accord', 'Employer pas de souci, ça marche, avec plaisir, bien sûr et d’accord'),
      b('Choose between casual confirmation (ça marche) and warm acceptance (avec plaisir)', 'Choisir entre accord familier (ça marche) et acceptation chaleureuse (avec plaisir)'),
      b('Reassure someone who apologizes with pas de souci', 'Rassurer quelqu’un qui s’excuse avec pas de souci'),
    ],
    13,
    [
      card(
        b('Five natural ways to say yes', 'Cinq façons naturelles de dire oui'),
        b(
          'In everyday French, a bare *oui* can feel abrupt. Pair it with **pas de souci** (no worries), **ça marche** (works for me), **avec plaisir** (gladly), **bien sûr** (of course), or **d’accord** (okay).',
          'Au quotidien, un simple *oui* peut sembler sec. Préférez **pas de souci**, **ça marche**, **avec plaisir**, **bien sûr** ou **d’accord** pour sonner tout de suite naturel et chaleureux.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['pas de souci', b('no worry', 'aucune inquiétude'), b('no problem / no worries', 'aucun problème, avec calme')],
              ['ça marche', b('that walks / works', 'cela fonctionne'), b('sounds good / deal / works for me', 'c’est entendu, parfait')],
              ['avec plaisir', b('with pleasure', 'avec joie'), b('gladly / my pleasure', 'volontiers, avec grand plaisir')],
              ['bien sûr', b('well sure', 'bien évidemment'), b('of course / certainly', 'sans aucun doute, oui')],
              ['d’accord', b('of agreement', 'en accord'), b('okay / agreed', 'oui, je suis d’accord')],
            ],
          },
          ex: [
            ['On se retrouve devant le cinéma à vingt heures ? — Ça marche !', 'Shall we meet in front of the cinema at eight p.m.? — Sounds good!'],
            ['Tu veux goûter ce gâteau ? — Oui, avec plaisir !', 'Would you like to taste this cake? — Yes, gladly!'],
            ['Désolé pour mon retard ! — Pas de souci, je viens d’arriver.', 'Sorry I am late! — No worries, I just arrived.'],
          ],
        },
      ),
      tip(
        b('Softening “yes” in messages and cafés', 'Adoucir « oui » à l’oral et par message'),
        b(
          '**Ça marche !** is hugely popular in texts and casual plans (“works for me!”). **Bien sûr !** answers requests warmly (“of course!”), and **avec plaisir !** turns an invitation into an enthusiastic yes.',
          '**Ça marche !** est très fréquent à l’oral et par SMS pour valider un rendez-vous. **Bien sûr !** répond avec chaleur à une demande, et **avec plaisir !** rend une acceptation encore plus enthousiaste.',
        ),
      ),
      flash(
        b('Agreeing & accepting', 'Accepter et valider'),
        [
          ['pas de souci', b('no problem / no worries', 'aucun problème')],
          ['ça marche', b('sounds good / works for me', 'c’est entendu')],
          ['avec plaisir', b('gladly / with pleasure', 'volontiers, avec joie')],
          ['bien sûr', b('of course', 'évidemment, oui')],
          ['d’accord', b('okay / agreed', 'oui, entendu')],
        ],
      ),
      mc(
        b('A friend texts: “On se voit à 18 h devant la gare ?” What sounds most natural?', 'Un ami écrit : « On se voit à 18 h devant la gare ? » Quelle réponse est la plus naturelle ?'),
        [
          'Ça marche, à 18 h !',
          'Avec tort, à 18 h.',
          'Tant pis, à 18 h.',
          'Fais attention, à 18 h.',
        ],
        {
          explain: b('Ça marche means “sounds good / works for me” for scheduling plans.', 'Ça marche signifie « c’est noté, ça me convient » pour un rendez-vous.'),
        },
      ),
      mc(
        P.best,
        [
          'Bien sûr',
          'Dommage',
          'Tant pis',
          'Ça dépend pas',
        ],
        {
          fr: 'Tu peux me prêter ton stylo deux minutes ? — ___, tiens !',
          explain: b('Use Bien sûr (“of course”) when gladly granting a quick request.', 'Utilisez Bien sûr pour répondre positivement à une petite demande.'),
        },
      ),
      pairs(
        P.match,
        [
          ['pas de souci', b('no problem / no worries', 'aucun problème')],
          ['ça marche', b('sounds good / works for me', 'c’est entendu')],
          ['avec plaisir', b('gladly / with pleasure', 'volontiers, avec joie')],
          ['bien sûr', b('of course', 'évidemment, oui')],
          ['d’accord', b('okay / agreed', 'oui, entendu')],
        ],
      ),
      gap(
        P.complete,
        'Tu veux dîner chez nous samedi ? — Oui, ___ ! On arrive vers vingt heures ? — Parfait, ___ !',
        [['avec plaisir'], ['ça marche']],
        {
          choices: [
            ['avec plaisir', 'pas de souci', 'tant pis'],
            ['ça marche', 'dommage', 'bien sûr pas'],
          ],
          explain: b('Accept an invitation with avec plaisir and confirm a time with ça marche.', 'On accepte une invitation avec avec plaisir et on confirme l’heure avec ça marche.'),
        },
      ),
      hear(
        'Excuse-moi pour ce petit retard ! — Pas de souci, je viens juste d’arriver moi aussi.',
        b('How does the second speaker react to the apology?', 'Comment réagit le second locuteur face aux excuses ?'),
        [
          b('Warmly: it is no problem at all', 'Avec calme : il n’y a aucun souci'),
          b('Angrily: she waited for an hour', 'Avec colère : elle a attendu une heure'),
          b('She cancels their meeting right away', 'Elle annule le rendez-vous tout de suite'),
          b('She asks the friend to leave', 'Elle demande à son amie de partir'),
        ],
      ),
      dict('D’accord, bien sûr, je viens avec plaisir demain soir.', {
        hint: b('Watch the apostrophe in D’accord and the circumflex in sûr.', 'Pensez à l’apostrophe dans D’accord et à l’accent circonflexe sur sûr.'),
      }),
      say('Pas de souci, ça marche pour demain matin !', 'No worries, tomorrow morning works for me!'),
    ],
    [
      b('ça marche = sounds good / works for me; d’accord = okay / agreed.', 'ça marche = c’est entendu ; d’accord = oui, j’accepte.'),
      b('avec plaisir = gladly; bien sûr = of course.', 'avec plaisir = volontiers ; bien sûr = évidemment.'),
      b('pas de souci reassures someone (“no worries / no problem”).', 'pas de souci rassure quelqu’un (« aucun problème »).'),
    ],
    [
      ['pas de souci', b('no problem / no worries', 'aucun problème')],
      ['ça marche', b('sounds good / works for me', 'c’est entendu')],
      ['avec plaisir', b('gladly / with pleasure', 'volontiers, avec joie')],
      ['bien sûr', b('of course', 'évidemment, oui')],
      ['d’accord', b('okay / agreed', 'oui, entendu')],
    ],
  ),

  lesson(
    C,
    2,
    ['good-and-bad-news', 'bonnes-et-mauvaises-nouvelles'],
    b('Reacting to good & bad news', 'Réagir aux bonnes et mauvaises nouvelles'),
    b('Celebrate good news, shrug off minor setbacks, sympathize, and cheer someone on.', 'Se réjouir, relativiser un contretemps, compatir et encourager quelqu’un.'),
    [
      b('Contrast tant mieux (great!) with tant pis (oh well) and dommage (what a pity)', 'Opposer tant mieux à tant pis et dommage'),
      b('Congratulate with félicitations and cheer effort with bon courage', 'Féliciter avec félicitations et encourager avec bon courage'),
      b('Avoid using bonne chance when someone needs stamina rather than luck', 'Éviter bonne chance quand la situation demande de l’effort (bon courage)'),
    ],
    13,
    [
      card(
        b('Instant emotional reactions', 'Réactions spontanées'),
        b(
          'React smoothly in one or two words: **tant mieux** (good for you!), **tant pis** (oh well / too bad), **dommage** (what a shame), **félicitations** (congratulations!), and **bon courage** (hang in there / you’ve got this!).',
          'Réagissez en un clin d’œil : **tant mieux** (bonne nouvelle !), **tant pis** (on fait avec), **dommage** (quel regret !), **félicitations** (bravo !) et **bon courage** (force pour la suite !).',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['tant mieux', b('so much better', 'd’autant mieux'), b('great! / good for you!', 'c’est une excellente chose')],
              ['tant pis', b('so much worse', 'd’autant moins bien'), b('oh well / too bad', 'on accepte le contretemps')],
              ['dommage', b('damage / pity', 'quel regret'), b('what a pity / shame', 'c’est regrettable')],
              ['félicitations', b('congratulations', 'compliments'), b('congratulations!', 'bravo pour un succès')],
              ['bon courage', b('good courage', 'du courage'), b('hang in there! / keep it up!', 'encouragement devant l’effort')],
            ],
          },
          ex: [
            ['Tu te sens déjà mieux ? Tant mieux !', 'You already feel better? Great!'],
            ['Le musée est fermé le mardi… Dommage, on ira jeudi !', 'The museum is closed on Tuesdays… What a pity, we will go Thursday!'],
            ['Tu travailles tout le week-end ? Bon courage !', 'You are working all weekend? Hang in there!'],
          ],
        },
      ),
      trap(
        b('Bon courage vs Bonne chance—and always keep tant!', 'Bon courage ou Bonne chance—et gardez toujours tant !'),
        b(
          'English uses “good luck” everywhere, but French distinguishes **Bonne chance !** (random luck, a lottery, a game) from **Bon courage !** (hard work ahead: an exam, moving boxes, a long shift). Also keep **félicitations** plural (`-s`), and never drop **tant** in **tant pis**!',
          'Là où l’anglais dit toujours « good luck », le français distingue **Bonne chance !** (hasard) et **Bon courage !** (effort, examen, déménagement, longue journée). Gardez aussi le **-s** de **félicitations** et dites toujours **tant pis** en entier !',
        ),
      ),
      flash(
        b('Good & bad news', 'Bonnes et mauvaises nouvelles'),
        [
          ['tant mieux', b('great! / all the better', 'c’est une bonne nouvelle')],
          ['tant pis', b('oh well / too bad', 'on accepte un petit contretemps')],
          ['dommage', b('what a pity / shame', 'quel regret')],
          ['félicitations', b('congratulations!', 'bravo pour une réussite')],
          ['bon courage', b('hang in there! / good luck with the work', 'encouragement devant un effort')],
        ],
      ),
      mc(
        b('Your friend tells you she passed her driving test! What do you say?', 'Votre amie vous annonce qu’elle a réussi son permis de conduire ! Que dites-vous ?'),
        [
          'Félicitations !',
          'Tant pis !',
          'Dommage !',
          'Pas de souci !',
        ],
        {
          explain: b('Use Félicitations ! to celebrate an achievement or milestone.', 'On dit Félicitations ! pour célébrer une réussite.'),
        },
      ),
      mc(
        b('Your colleague has a long eight-hour shift ahead on Sunday. What fits best?', 'Votre collègue a une longue journée de travail dimanche. Que lui dites-vous ?'),
        [
          'Bon courage !',
          'Félicitations !',
          'Tant mieux !',
          'Avec plaisir !',
        ],
        {
          explain: b('Use Bon courage ! to encourage someone facing hard work.', 'On dit Bon courage ! pour encourager quelqu’un devant une tâche fatigante.'),
        },
      ),
      sort(
        b('Sort into Celebrating good news or Handling setbacks & effort.', 'Classez : bonne nouvelle ou contretemps et effort.'),
        [b('Celebrating good news', 'Bonne nouvelle'), b('Setbacks & effort', 'Contretemps et effort')],
        [
          ['tant mieux', 0],
          ['tant pis', 1],
          ['félicitations', 0],
          ['dommage', 1],
          ['avec plaisir', 0],
          ['bon courage', 1],
        ],
      ),
      gap(
        P.complete,
        'Le concert est complet ce soir… — Oh, c’est ___ ! Mais ___ , on ira au cinéma à la place.',
        ['dommage', 'tant pis'],
        {
          tr: 'The concert is sold out tonight… — Oh, what a pity! But oh well, we will go to the cinema instead.',
          hint: b('First blank: “a pity”; second blank: “oh well”.', 'Premier trou : regret ; second trou : fatalisme positif.'),
        },
      ),
      ord(
        P.order,
        'Il pleut encore, tant pis pour la promenade.',
        {
          tr: 'It is still raining, too bad about the walk.',
          extra: ['mieux'],
          explain: b('Il pleut encore, + tant pis + pour la promenade.', 'Il pleut encore, + tant pis + pour la promenade.'),
        },
      ),
      hear(
        'Tu as trouvé un appartement juste en face du parc ? Tant mieux ! Félicitations, je suis ravi pour toi !',
        b('Why is the speaker happy for his friend?', 'Pourquoi cet homme est-il heureux pour son ami ?'),
        [
          b('His friend found an apartment facing the park', 'Son ami a trouvé un appartement face au parc'),
          b('His friend got a brand-new bicycle', 'Son ami a acheté un vélo neuf'),
          b('His friend won two cinema tickets', 'Son ami a gagné deux places de cinéma'),
          b('His friend just finished cleaning the park', 'Son ami vient de nettoyer le parc'),
        ],
        { voice: 'm' },
      ),
      say('C’est dommage, mais tant pis, on essaiera la semaine prochaine.', 'It is a shame, but oh well, we will try next week.'),
    ],
    [
      b('tant mieux = great!; tant pis = oh well / too bad; dommage = what a pity.', 'tant mieux = bonne chose ; tant pis = on fait avec ; dommage = quel regret.'),
      b('félicitations (always plural) celebrates success.', 'félicitations (toujours au pluriel) célèbre une réussite.'),
      b('bon courage encourages effort ahead (exams, work, chores).', 'bon courage encourage devant un effort à fournir.'),
    ],
    [
      ['tant mieux', b('great! / all the better', 'c’est une bonne nouvelle')],
      ['tant pis', b('oh well / too bad', 'on accepte un petit contretemps')],
      ['dommage', b('what a pity / shame', 'quel regret')],
      ['félicitations', b('congratulations!', 'bravo pour une réussite')],
      ['bon courage', b('hang in there! / good luck with the work', 'encouragement devant un effort')],
    ],
  ),

  lesson(
    C,
    3,
    ['polite-softeners', 'formules-de-politesse'],
    b('Polite replies, goodbyes & nuance', 'Politesse, au revoir et nuance'),
    b('Respond gracefully to thanks and apologies, hedge politely, and say see you soon.', 'Répondre avec élégance aux remerciements et excuses, nuancer et dire à bientôt.'),
    [
      b('Reply politely to thank you with je vous en prie and reassure with ce n’est pas grave', 'Répondre poliment avec je vous en prie et rassurer avec ce n’est pas grave'),
      b('Add nuance with ça dépend and agree with tu as raison', 'Nuancer avec ça dépend et approuver avec tu as raison'),
      b('Close conversations warmly using à bientôt', 'Prendre congé chaleureusement avec à bientôt'),
    ],
    13,
    [
      card(
        b('Politeness & everyday fillers', 'Politesse et petits mots'),
        b(
          'Finish interactions with polish: **je vous en prie** (you are welcome / please go ahead), **ce n’est pas grave** (it is no big deal), **à bientôt** (see you soon), **ça dépend** (it depends), and **tu as raison** (you are right).',
          'Soignez chaque échange avec **je vous en prie**, **ce n’est pas grave**, **à bientôt**, **ça dépend** et **tu as raison**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Literal', 'Sens littéral'), b('Meaning', 'Sens réel')],
            rows: [
              ['je vous en prie', b('I beg you of it', 'je vous en prie'), b('you’re welcome / please go ahead', 'réponse très polie à merci')],
              ['ce n’est pas grave', b('it is not serious', 'ce n’est rien de sérieux'), b('it’s okay / no big deal', 'ce n’est pas un problème')],
              ['à bientôt', b('until soon', 'à très vite'), b('see you soon', 'au revoir amical ou poli')],
              ['ça dépend', b('that depends', 'cela varie'), b('it depends', 'cela change selon le cas')],
              ['tu as raison', b('you have reason', 'tu as juste'), b('you’re right', 'je partage ton avis')],
            ],
          },
          ex: [
            ['Merci infiniment pour votre aide ! — Je vous en prie, madame.', 'Thank you so much for your help! — You are very welcome, madam.'],
            ['Pardon, j’ai fait tomber votre stylo ! — Ce n’est pas grave !', 'Sorry, I dropped your pen! — It is no big deal!'],
            ['Tu préfères la mer ou la montagne ? — Ça dépend de la saison !', 'Do you prefer the sea or the mountains? — It depends on the season!'],
          ],
        },
      ),
      culture(
        b('Je vous en prie: more than just “you’re welcome”', 'Je vous en prie : la politesse à la française'),
        b(
          'In shops, hotels, and polite conversation, **Je vous en prie** (or **Je t’en prie** with friends) is warmer and more refined than *De rien*. People also say it when holding a door open or offering a seat (“please, after you!”).',
          'Dans les commerces, les bureaux et les échanges polis, **Je vous en prie** (ou **Je t’en prie** entre amis) est plus soigné que *De rien*. On l’emploie aussi en tenant une porte pour dire « passez devant » !',
        ),
      ),
      mc(
        P.best,
        [
          'Je vous en prie !',
          'Tant pis !',
          'Ça dépend !',
          'Tu as raison !',
        ],
        {
          fr: 'Un client vous dit : « Merci beaucoup pour votre aide, bonne journée ! » Vous répondez poliment :',
          explain: b('Je vous en prie is the classic polite reply to merci in service and formal settings.', 'Je vous en prie est la réponse polie par excellence à merci.'),
        },
      ),
      pairs(
        P.match,
        [
          ['je vous en prie', b('you’re welcome / go ahead', 'réponse polie à merci')],
          ['ce n’est pas grave', b('it’s okay / no big deal', 'ce n’est rien')],
          ['à bientôt', b('see you soon', 'formule d’au revoir')],
          ['ça dépend', b('it depends', 'cela varie selon le cas')],
          ['tu as raison', b('you’re right', 'je suis d’accord avec toi')],
        ],
      ),
      hear(
        'Ne vous inquiétez pas, ce n’est pas grave du tout. Passez une belle journée et à bientôt !',
        b('How does the speaker respond?', 'Quel est le ton de la réponse ?'),
        [
          b('Reassuring and polite, saying see you soon', 'Rassurant et poli, en disant à bientôt'),
          b('Upset because the error was very serious', 'Contrariée car l’erreur est grave'),
          b('Asking the listener to pay immediately', 'Pressée que la personne paie vite'),
          b('Unsure whether it depends on the weather', 'Hésitante selon la météo'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('At the neighborhood bakery', 'À la boulangerie du quartier'),
        b('You buy bread and reply politely when the croissants are sold out.', 'Vous achetez du pain et réagissez poliment quand il n’y a plus de croissants.'),
        [['Boulangère', 'f'], ['Vous', 'm']],
        [
          [0, 'Bonjour ! Vous aimez votre baguette bien cuite ou pas trop cuite ?', 'Hello! Do you like your baguette well-done or not too crusty?'],
          [1, {
            options: [
              'Ça dépend des jours, mais aujourd’hui pas trop cuite, s’il vous plaît.',
              'Félicitations des jours, pas trop cuite.',
              'Tant pis des jours, merci.',
            ],
            explain: b('Use ça dépend when your preference varies from day to day.', 'Employez ça dépend quand votre choix varie selon le moment.'),
          }],
          [0, 'Bien sûr ! Par contre, excusez-moi, je n’ai plus de croissants ce matin…', 'Of course! However, excuse me, I am out of croissants this morning…'],
          [1, {
            options: [
              'Ce n’est pas grave, je prends juste la baguette. Merci beaucoup !',
              'C’est très grave, bon courage !',
              'Je vous en prie, j’ai faim.',
            ],
            explain: b('Reassure someone politely with ce n’est pas grave.', 'On rassure poliment avec ce n’est pas grave.'),
          }],
          [0, 'Je vous en prie ! Voici votre monnaie et belle journée à vous.', 'You are welcome! Here is your change and have a lovely day.'],
          [1, 'Merci madame, à bientôt !', 'Thank you madam, see you soon!'],
        ],
      ),
      dict('Tu as raison, on part plus tôt. À bientôt !', {
        voice: 'm2',
        hint: b('Two sentences: check the accent on bientôt.', 'Deux phrases : attention à l’accent circonflexe sur bientôt.'),
      }),
      write(
        b('Write a friendly reply', 'Écrivez une réponse amicale'),
        b('Write a short message (20–45 words) to a friend: accept an invitation warmly, react to one small change of plan, and sign off using at least three expressions from this course.', 'Écrivez un court message (20–45 mots) à un ami : acceptez une invitation avec chaleur, réagissez à un petit changement de programme et signez avec au moins trois expressions de ce cours.'),
        20,
        45,
        [
          b('Accept warmly (ça marche, avec plaisir, bien sûr)', 'Accepter chaleureusement (ça marche, avec plaisir, bien sûr)'),
          b('React to a small change (pas de souci, ce n’est pas grave, tant pis)', 'Réagir à un petit imprévu (pas de souci, ce n’est pas grave, tant pis)'),
          b('End politely with à bientôt', 'Conclure poliment avec à bientôt'),
        ],
        'Salut Nadia ! Oui, je viens dîner avec plaisir vendredi. Tu as raison pour l’heure : vingt heures, ça marche très bien. Il n’y a plus de tarte aux pommes ? Ce n’est pas grave ! À bientôt !',
      ),
    ],
    [
      b('je vous en prie = polite “you’re welcome” or “please go ahead”.', 'je vous en prie = réponse polie à merci ou invitation à passer.'),
      b('ce n’est pas grave = it’s okay / no big deal; ça dépend = it depends.', 'ce n’est pas grave = ce n’est rien ; ça dépend = cela varie.'),
      b('tu as raison = you’re right; à bientôt = see you soon.', 'tu as raison = je suis d’accord ; à bientôt = à très vite.'),
    ],
    [
      ['je vous en prie', b('you’re welcome / go ahead', 'réponse polie à merci')],
      ['ce n’est pas grave', b('it’s okay / no big deal', 'ce n’est rien')],
      ['à bientôt', b('see you soon', 'formule d’au revoir')],
      ['ça dépend', b('it depends', 'cela varie selon le cas')],
      ['tu as raison', b('you’re right', 'je suis d’accord avec toi')],
    ],
  ),
];

export default lessons;
