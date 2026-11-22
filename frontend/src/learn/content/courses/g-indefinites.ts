import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'How do you talk about someone you can’t name, a few options among many, or none at all? French uses indefinite pronouns and determiners such as quelqu’un, quelque chose, personne, rien, chacun, aucun, plusieurs, certains and n’importe qui. Their grammar has strict rules: verb number (chacun + singular, plusieurs + plural), negative ne without pas, and the mandatory de before an adjective (quelque chose d’utile). This B1 course makes every choice automatic.',
    'Comment parler d’une personne inconnue, d’une quantité imprécise ou d’une absence totale ? Le français emploie les pronoms et déterminants indéfinis : quelqu’un, quelque chose, personne, rien, chacun, aucun, plusieurs, certains et n’importe qui. Leur syntaxe obéit à des règles nettes : accord du verbe (chacun + singulier, plusieurs + pluriel), ne sans pas à la négation, et de obligatoire devant un adjectif (quelque chose d’utile). Ce cours B1 les rend simples et naturels.',
  ),
  outcomes: [
    b('Use quelqu’un, quelque chose, personne and rien with + de + adjective', 'Employer quelqu’un, quelque chose, personne et rien avec + de + adjectif'),
    b('Distinguish chaque, chacun(e) and aucun(e) with singular agreement', 'Distinguer chaque, chacun(e) et aucun(e) avec l’accord au singulier'),
    b('Choose between plusieurs, certains, quelques-uns and la plupart', 'Choisir entre plusieurs, certains, quelques-uns et la plupart'),
    b('Express free choice with n’importe qui, quoi, où and quel', 'Exprimer le choix libre avec n’importe qui, quoi, où et quel'),
  ],
};

const C = 'g-indefinites';
export default [
  lesson(C, 1, ['someone-something-nothing', 'quelqu-un-quelque-chose-personne-rien'],
    b('Quelqu’un, quelque chose, personne, rien', 'Quelqu’un, quelque chose, personne, rien'),
    b('Refer to unspecified people and things, negate them properly and add adjectives with de.', 'Désigner des personnes et choses indéterminées, nier sans pas et ajouter un adjectif avec de.'),
    [b('Pair quelqu’un / personne and quelque chose / rien', 'Associer quelqu’un / personne et quelque chose / rien'), b('Use ne without pas with personne and rien', 'Employer ne sans pas avec personne et rien'), b('Add de + masculine singular adjective', 'Ajouter de + adjectif masculin singulier')],
    13,
    [
      card(b('People vs things, positive vs negative', 'Personnes ou choses, positif ou négatif'), b('**Someone / anyone**: **quelqu’un** → negative: **ne… personne**. **Something / anything**: **quelque chose** → negative: **ne… rien**. Both **personne** and **rien** replace **pas**: **Je ne vois personne** (never « ne vois pas personne »). As subjects: **Personne n’est venu. Rien n’a changé.**', '**Quelqu’un** (personne indéterminée) → négation : **ne… personne**. **Quelque chose** (chose indéterminée) → négation : **ne… rien**. **Personne** et **rien** remplacent **pas** : **Je ne vois personne** (jamais « pas personne »). Sujets : **Personne n’est venu. Rien n’a changé.**'), {
        ex: [['Quelqu’un a frappé à la porte.', 'Someone knocked on the door.'], ['Je n’ai rien entendu.', 'I didn’t hear anything.'], ['Personne ne connaît la réponse.', 'Nobody knows the answer.']],
      }),
      tip(b('Always + de + masculine singular adjective', 'Toujours + de + adjectif masculin singulier'), b('Before an adjective, **quelqu’un, quelque chose, personne, rien** always take **de** (or **d’**) + **masculine singular**: **quelqu’un de sérieux, quelque chose d’utile, rien de nouveau, personne d’autre**. Note also **rien** goes **before** the past participle: **Je n’ai rien vu**, while **personne** goes **after**: **Je n’ai vu personne.**', 'Devant un adjectif, **quelqu’un, quelque chose, personne, rien** prennent **de / d’** + **masculin singulier** : **quelqu’un de sérieux, quelque chose d’utile, rien de nouveau, personne d’autre**. Place au passé composé : **Je n’ai rien vu** (avant), mais **Je n’ai vu personne** (après).')),
      pairs(P.match, [['quelqu’un d’autre', b('someone else', 'une autre personne')], ['rien d’important', b('nothing important', 'aucune chose grave')], ['personne ne sait', b('nobody knows', 'aucune personne ne sait')], ['quelque chose de drôle', b('something funny', 'une chose amusante')]]),
      mc(P.best, ['Je n’ai vu personne dans le couloir.', 'Je n’ai pas vu personne dans le couloir.', 'Je n’ai personne vu dans le couloir.', 'Personne j’ai vu dans le couloir.']),
      mc(P.best, ['Il y a quelque chose d’intéressant dans ce rapport.', 'Il y a quelque chose intéressante dans ce rapport.', 'Il y a quelque chose intéressant dans ce rapport.', 'Il y a quelque chose de intéressante dans ce rapport.']),
      gap(P.complete, 'Tu as besoin de ___ d’autre ? – Non, je n’ai ___ oublié et je n’attends ___.', ['quelque chose', 'rien', 'personne'], { choices: [['quelque chose', 'quelqu’un', 'rien'], ['rien', 'pas', 'personne'], ['personne', 'rien', 'aucun']] }),
      ord(P.order, 'Il n’y a rien de nouveau aujourd’hui.', { tr: 'There is nothing new today.', extra: ['pas'] }),
      say('Je cherche quelqu’un de fiable, parce que je ne connais personne dans cette ville.', 'I’m looking for someone reliable, because I don’t know anyone in this city.'),
    ],
    [
      b('quelqu’un ↔ ne… personne; quelque chose ↔ ne… rien (never add pas).', 'quelqu’un ↔ ne… personne ; quelque chose ↔ ne… rien (jamais de pas).'),
      b('Word order in compound tenses: Je n’ai rien dit, but Je n’ai vu personne.', 'Place aux temps composés : Je n’ai rien dit, mais Je n’ai vu personne.'),
      b('Always + de + masculine singular adjective: rien de grave, quelqu’un de gentil.', 'Toujours + de + adjectif masculin singulier : rien de grave, quelqu’un de gentil.'),
    ],
    [['frapper à la porte', b('to knock on the door', 'taper à la porte')], ['fiable', b('reliable', 'digne de confiance')], ['un couloir', b('a hallway', 'passage entre des pièces')]],
  ),
  lesson(C, 2, ['chacun-and-aucun', 'chacun-et-aucun'],
    b('Chaque, chacun(e) & aucun(e)', 'Chaque, chacun(e) et aucun(e)'),
    b('Use determiners and pronouns for each individual or zero items with singular verbs.', 'Employer les déterminants et pronoms d’individualité ou de quantité nulle avec le singulier.'),
    [b('Distinguish chaque (determiner) and chacun (pronoun)', 'Distinguer chaque (déterminant) et chacun (pronom)'), b('Agree chacun / chacune and aucun / aucune', 'Accorder chacun / chacune et aucun / aucune'), b('Keep verbs singular after chacun and aucun', 'Garder le verbe au singulier après chacun et aucun')],
    13,
    [
      card(b('Each vs each one; none', 'Chaque ou chacun ; aucun'), b('**Chaque** is a **determiner** (followed by a singular noun, invariable): **chaque jour, chaque étudiante**. **Chacun / chacune** is a **pronoun** (stands alone or with **de**): **Chacun a son avis. Chacune de ces salles est libre.** **Aucun / aucune… ne** means *not one / none* and is **almost always singular**: **Aucun candidat n’a réussi. Je n’ai aucune idée.**', '**Chaque** est un **déterminant** (devant un nom singulier, invariable) : **chaque jour, chaque étudiante**. **Chacun / chacune** est un **pronom** (seul ou suivi de **de**) : **Chacun a son avis. Chacune de ces salles est libre.** **Aucun / aucune… ne** exprime le zéro et reste **singulier** : **Aucun candidat n’a réussi. Je n’ai aucune idée.**'), {
        ex: [['Chacun paie sa part.', 'Each person pays their share.'], ['Aucune de mes amies n’était disponible.', 'None of my friends (f.) was available.'], ['Chaque dossier doit être signé.', 'Each file must be signed.']],
      }),
      trap(b('Singular verb, even after « de + plural »', 'Verbe au singulier, même après « de + pluriel »'), b('After **chacun de + plural noun** or **aucun de + plural noun**, the verb is **singular** (agreeing with *chacun / aucun*): **Chacun des joueurs a reçu une médaille** (not « ont reçu »). **Aucune de ces solutions ne convient.**', 'Après **chacun de + nom pluriel** ou **aucun de + nom pluriel**, le verbe reste au **singulier** : **Chacun des joueurs a reçu une médaille** (et non « ont reçu »). **Aucune de ces solutions ne convient.**')),
      sort(b('Determiner (+ noun) or pronoun (alone / + de)?', 'Déterminant (+ nom) ou pronom (seul / + de) ?'), [b('determiner', 'déterminant'), b('pronoun', 'pronom')], [['chaque matin', 0], ['chacun pour soi', 1], ['aucune erreur', 0], ['chacune d’entre elles', 1], ['aucun problème', 0], ['aucune n’est venue', 1]]),
      mc(P.form, ['a répondu', 'ont répondu', 'as répondu', 'avaient répondus'], { fr: 'Chacun des participants ___ au sondage.' }),
      mc(P.form, ['Aucune', 'Aucun', 'Aucunes', 'Pas une de'], { fr: '___ de ces deux dates ne me convient.' }),
      gap(P.complete, '___ matin, ___ de mes collègues apporte les nouvelles, mais ___ n’a encore lu le mémo.', ['Chaque', 'chacun', 'aucun'], { choices: [['Chaque', 'Chacun'], ['chacun', 'chaque'], ['aucun', 'aucuns']] }),
      dlg(b('Organising a team lunch', 'Organiser un déjeuner d’équipe'), b('Two colleagues check preferences.', 'Deux collègues vérifient les préférences.'), [['Nadia', 'f'], ['Vous', 'm']], [
        [0, 'On réserve le restaurant de la rue Victor-Hugo ?', 'Shall we book the restaurant on Rue Victor-Hugo?'],
        [1, { options: ['Oui, chacune de nos collègues a validé la date.', 'Oui, chaque de nos collègues a validé.', 'Oui, chacun ont validé la date.'] }],
        [0, 'Parfait ! Est-ce que quelqu’un a une allergie ?', 'Perfect! Does anyone have an allergy?'],
        [1, { options: ['Non, aucune personne n’a signalé d’allergie.', 'Non, aucune personne n’a pas signalé.', 'Non, aucun personnes n’ont signalé.'] }],
      ]),
      dict('Chacune de ces idées est bonne, mais aucun projet n’est encore prêt.', { voice: 'f' }),
    ],
    [
      b('chaque + noun (invariable); chacun / chacune = pronoun (agrees in gender).', 'chaque + nom (invariable) ; chacun / chacune = pronom (accorde en genre).'),
      b('aucun(e) + ne = none / not any (without pas).', 'aucun(e) + ne = zéro (sans pas).'),
      b('Both chacun(e) and aucun(e) take a singular verb, even with de + plural.', 'chacun(e) et aucun(e) prennent un verbe au singulier, même avec de + pluriel.'),
    ],
    [['un sondage', b('a survey, poll', 'enquête d’opinion')], ['convenir', b('to suit, fit', 'être adapté')], ['signaler', b('to report, point out', 'indiquer clairement')]],
  ),
  lesson(C, 3, ['plusieurs-certains-n-importe', 'plusieurs-certains-et-n-importe'],
    b('Plusieurs, certains, la plupart & n’importe…', 'Plusieurs, certains, la plupart et n’importe…'),
    b('Quantify groups accurately and express “anyone, anything, anywhere” with n’importe.', 'Quantifier un groupe avec justesse et exprimer le choix indifférent avec n’importe.'),
    [b('Use plusieurs, certains and quelques-uns', 'Employer plusieurs, certains et quelques-uns'), b('Agree the verb after la plupart', 'Accorder le verbe après la plupart'), b('Form n’importe qui, quoi, où, quel', 'Former n’importe qui, quoi, où, quel')],
    13,
    [
      card(b('Plural indefinites', 'Les indéfinis du pluriel'), b('**Plusieurs** (*several*) is invariable (never *plusieures*): **plusieurs livres, plusieurs fois, plusieurs d’entre nous**. **Certains / certaines** (*some / certain people*) agrees: **Certaines préfèrent attendre.** **Quelques-uns / quelques-unes** (*a few*): **J’en ai pris quelques-uns.** **La plupart** (*most*): **la plupart des gens pensent** (plural verb!).', '**Plusieurs** est invariable (jamais « plusieures ») : **plusieurs livres, plusieurs d’entre nous**. **Certains / certaines** s’accorde : **Certaines préfèrent attendre.** **Quelques-uns / quelques-unes** : **J’en ai pris quelques-uns.** **La plupart** + nom pluriel prend un verbe au **pluriel** : **la plupart des gens pensent**.'), {
        ex: [['Plusieurs collègues travaillent à distance.', 'Several colleagues work remotely.'], ['J’ai lu la plupart de ces articles.', 'I’ve read most of these articles.'], ['Certaines personnes hésitent encore.', 'Some people are still hesitating.']],
      }),
      tip(b('N’importe qui, quoi, où, quel', 'N’importe qui, quoi, où, quel'), b('**N’importe + question word** means *anyone / anything / anywhere / any*: **n’importe qui** (anyone), **n’importe quoi** (anything, or *nonsense!*), **n’importe où** (anywhere), **n’importe quand** (anytime), **n’importe quel(le)(s) + noun** (any… at all): **Viens à n’importe quelle heure.**', '**N’importe + mot interrogatif** signifie *peu importe lequel* : **n’importe qui** (qui que ce soit), **n’importe quoi** (ou *c’est absurde !*), **n’importe où**, **n’importe quand**, **n’importe quel(le)(s) + nom** : **Viens à n’importe quelle heure.**')),
      pairs(P.match, [['n’importe qui', b('anyone at all', 'qui que ce soit')], ['n’importe où', b('anywhere', 'en tout lieu')], ['quelques-unes', b('a few (feminine)', 'un petit nombre (f.)')], ['la plupart du temps', b('most of the time', 'le plus souvent')]]),
      mc(P.spelling, ['Plusieurs étudiantes ont posé la même question.', 'Plusieures étudiantes ont posé la même question.', 'Plusieurs étudiantes a posé la même question.', 'Plusieure étudiantes ont posé la même question.']),
      mc(P.form, ['n’importe quelle', 'n’importe quel', 'n’importe quoi', 'n’importe qui'], { fr: 'Tu peux choisir ___ couleur, elles sont toutes jolies.' }),
      gap(P.complete, 'La plupart des visiteurs ___ (aimer) ce musée, mais ___ (quelques / masculin pluriel) préfèrent la galerie voisine.', ['aiment', 'quelques-uns'], { choices: [['aiment', 'aime'], ['quelques-uns', 'quelques-unes', 'quelques']] }),
      ord(P.order, 'La plupart des étudiants ont choisi ce cours.', { tr: 'Most of the students chose this course.' }),
      say('Tu peux m’appeler à n’importe quelle heure, plusieurs collègues restent tard au bureau.', 'You can call me at any time, several colleagues stay late at the office.'),
    ],
    [
      b('plusieurs is invariable (never -e or -es) and takes a plural verb.', 'plusieurs est invariable (jamais -e) et prend un verbe au pluriel.'),
      b('la plupart des + plural noun → plural verb (la plupart sont venus).', 'la plupart des + nom pluriel → verbe au pluriel (la plupart sont venus).'),
      b('n’importe qui / quoi / où / quand / quel(le)(s) = no matter who/what/where/when/which.', 'n’importe qui / quoi / où / quand / quel(le)(s) = choix totalement libre.'),
    ],
    [['à distance', b('remotely', 'depuis chez soi')], ['hésiter', b('to hesitate', 'ne pas se décider tout de suite')], ['la plupart', b('most, the majority', 'la plus grande partie')]],
  ),
];
