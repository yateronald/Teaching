import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je fais réparer ma voiture, je la fais réparer, il s’est fait voler son sac. When you don’t perform an action yourself—whether you ask a mechanic, let someone pass, or have something happen to you—French relies on faire + infinitive, laisser + infinitive and se faire + infinitive. This course breaks down the word order, pronoun placement, and invariable past participle rule.',
    'Je fais réparer ma voiture, je la fais réparer, il s’est fait voler son sac. Quand une autre personne agit à votre place, que vous la laissez faire ou que vous subissez une action, le français utilise faire + infinitif, laisser + infinitif et se faire + infinitif. Ce cours clarifie l’ordre des mots, la place des pronoms et l’accord du participe.',
  ),
  outcomes: [
    b('Use faire + infinitive for delegated actions and agent phrases with par or à', 'Employer faire + infinitif pour une action confiée à quelqu’un et introduire l’agent avec par ou à'),
    b('Place object pronouns before faire (never between faire and the infinitive) and keep fait invariable', 'Placer les pronoms avant faire et garder fait invariable au passé composé'),
    b('Contrast laisser + infinitive (allowing) with se faire + infinitive (getting something done / passive nuance)', 'Distinguer laisser + infinitif (autoriser) et se faire + infinitif (sens passif ou service)'),
  ],
};

const C = 'gr-faire-laisser-causative';

const lessons: Lesson[] = [
  lesson(C, 1, ['faire-causative-action', 'faire-plus-infinitif'],
    b('Faire + infinitive: having something done', 'Faire + infinitif : faire agir quelqu’un d’autre'),
    b('Say "I’m having my car repaired" or "she makes us laugh" with faire tightly glued to the infinitive.', 'Exprimer une action confiée à quelqu’un ou provoquée chez quelqu’un en soudant faire à l’infinitif.'),
    [
      b('Keep faire and the infinitive together with no noun in between', 'Garder faire et l’infinitif collés sans intercaler le nom objet'),
      b('Use par or à to name who actually does the action when there are two objects', 'Introduire celui qui fait l’action avec par ou à quand il y a deux compléments'),
      b('Use everyday causative phrases like faire rire, faire peur, faire visiter', 'Employer les expressions courantes comme faire rire, faire visiter, faire construire'),
    ],
    13,
    [
      card(
        b('Subject causes action → faire + infinitive (nothing in between!)', 'Faire faire une action : rien entre faire et l’infinitif !'),
        b(
          'In English, you split *"have my car repaired"* around the noun. In French, **faire** and the **infinitive stay glued together**: put the noun **after** both verbs (`Je fais réparer ma voiture`, NEVER « Je fais ma voiture réparer »). The same pattern works when one person makes someone else feel or act (**faire rire, faire pleurer, faire attendre**).\n\nServices: **faire réparer, faire nettoyer, faire livrer, faire construire**.\nReactions: **faire rire, faire sourire, faire peur à, faire visiter**.',
          'Contrairement à l’anglais (*have my car repaired*), **faire** et l’**infinitif ne se séparent jamais** par un nom ! Le nom se place toujours **après** les deux verbes : `Je fais réparer ma voiture` (jamais « Je fais ma voiture réparer »). Le même schéma s’emploie quand on provoque une réaction (**faire rire, faire attendre**).\n\nServices : **faire réparer, faire nettoyer, faire livrer, faire construire**.\nRéactions : **faire rire, faire sourire, faire peur à, faire visiter**.',
        ),
        {
          table: {
            head: [b('Situation', 'Situation'), b('French pattern', 'Structure'), b('Example', 'Exemple')],
            rows: [
              [b('Action only (no agent named)', 'Sans préciser qui agit'), 'faire + inf. + object', 'Elle fait repeindre son salon.'],
              [b('Agent only (1 object)', 'Seulement la personne qui agit'), 'faire + inf. + agent', 'Le professeur fait lire les élèves.'],
              [b('Both object & agent', 'Objet ET personne qui agit'), 'faire + inf. + object + par/à + agent', 'Il fait traduire le texte par un expert.'],
            ],
          },
          ex: [
            ['Nous faisons livrer les courses quand il pleut fort.', 'We have the groceries delivered when it rains heavily.'],
            ['Ce film fait rire toute la salle dès la première minute.', 'This film makes the whole cinema laugh from the very first minute.'],
          ],
        },
      ),
      tip(
        b('How to add the agent: à or par?', 'Comment ajouter la personne qui agit : à ou par ?'),
        b(
          'If there is **only one** noun after **faire + infinitive**, no preposition is needed (`Je fais entrer les invités`, `Je fais réparer la montre`). When you include **both** the thing being acted on AND the person doing it, add **par** (for a service or passive agent) or **à** (common with `faire visiter, faire goûter, faire signer, faire comprendre`): `Le guide fait visiter la ville aux touristes`.\n\nWith par: **réparer par un mécanicien, traduire par un collègue, livrer par coursier**.\nWith à: **faire visiter à Paul, faire goûter aux enfants, faire signer au client**.',
          'S’il n’y a **qu’un seul** nom après **faire + infinitif**, aucune préposition n’est nécessaire (`Je fais entrer les invités`, `Je fais réparer la montre`). Si vous nommez **à la fois** l’objet et celui qui agit, utilisez **par** (service, agent) ou **à** (très courant avec `faire visiter, faire goûter, faire signer`) : `Le guide fait visiter la ville aux touristes`.\n\nAvec par : **réparer par un mécanicien, traduire par un collègue, livrer par coursier**.\nAvec à : **faire visiter à Paul, faire goûter aux enfants, faire signer au client**.',
        ),
      ),
      mc(P.order, ['fait réparer sa moto', 'fait sa moto réparer', 'répare fait sa moto', 'fait à réparer sa moto'], {
        fr: 'Comme il n’a pas les outils, Yanis ___ chez un garagiste.',
      }),
      mc(P.form, ['aux étudiants', 'les étudiants', 'avec les étudiants', 'de les étudiants'], {
        fr: 'Avant l’examen, la professeure fait relire la consigne ___.',
        explain: b('There are two objects (la consigne + les étudiants), so the agent takes à (aux étudiants) or par.', 'Il y a déjà un objet (la consigne) : celui qui agit est introduit par à (aux étudiants) ou par.'),
      }),
      gap(P.complete, 'Nous ___ (faire, présent) construire une terrasse en bois ___ (par / à) un artisan local, et nous ___ (faire, futur) goûter nos premiers légumes ___ (à) nos voisins.', [['faisons'], ['par'], ['ferons'], ['à']], {
        choices: [['faisons', 'faisez'], ['par', 'de'], ['ferons', 'faisons'], ['à', 'par']],
      }),
      ord(P.order, 'Mes grands-parents font entretenir leur jardin par un jeune voisin.', {
        tr: 'My grandparents have their garden looked after by a young neighbour.',
        extra: ['à', 'font jardin'],
      }),
      pairs(
        b('Match each causative phrase with its meaning.', 'Associez chaque tournure causative à son sens.'),
        [
          ['faire bouillir l’eau', b('to boil the water (bring it to a boil)', 'porter l’eau à ébullition')],
          ['faire visiter l’appartement', b('to show someone round the flat', 'guider quelqu’un dans les pièces')],
          ['faire attendre un client', b('to keep a customer waiting', 'laisser patienter un client')],
          ['faire nettoyer un manteau', b('to have a coat cleaned', 'confier le lavage d’un manteau')],
        ],
      ),
      hear('J’ai fait installer la fibre optique par un technicien mardi matin ; maintenant la connexion marche très bien.', b('Who installed the fibre internet?', 'Qui a installé la fibre optique ?'), [
        b('A technician installed it for the speaker on Tuesday morning', 'Un technicien l’a installée mardi matin'),
        b('The speaker installed it alone on Tuesday evening', 'La personne l’a installée elle-même mardi soir'),
        b('Nobody could install it because of a problem', 'Personne n’a pu l’installer'),
      ]),
      dict('Elle fait souvent rire ses collègues et elle fait goûter ses gâteaux à toute l’équipe.'),
      say('Nous allons faire réparer l’ascenseur dès demain matin.', 'We are going to have the lift repaired first thing tomorrow morning.'),
    ],
    [
      b('Keep faire and the infinitive glued together: noun objects come AFTER both.', 'Ne séparez jamais faire et l’infinitif par un nom : le nom vient après les deux verbes.'),
      b('With one object (thing or person), use no preposition: Je fais lire les élèves.', 'Avec un seul complément, pas de préposition : Je fais lire les élèves.'),
      b('With both an object and an agent, introduce the agent with par or à.', 'Avec un objet et un agent, introduisez l’agent par par ou à.'),
    ],
    [
      ['un artisan', b('a craftsperson, tradesperson', 'un professionnel d’un métier manuel')],
      ['entretenir', b('to maintain, look after', 'maintenir en bon état')],
      ['faire bouillir', b('to bring to a boil', 'chauffer un liquide jusqu’aux bulles')],
    ],
  ),

  lesson(C, 2, ['pronouns-with-faire-causative', 'pronoms-avec-faire'],
    b('Pronouns with faire + infinitive — and no agreement!', 'Les pronoms avec faire + infinitif — et participe invariable !'),
    b('Put pronouns before faire, never before the infinitive, and keep fait invariable in passé composé.', 'Placer les pronoms devant faire (jamais devant l’infinitif) et laisser fait invariable au passé composé.'),
    [
      b('Move direct and indirect pronouns in front of faire (Je la fais réparer)', 'Placer les pronoms COD et COI devant faire (Je la fais réparer)'),
      b('Combine two pronouns before faire (Je le lui fais signer)', 'Combiner deux pronoms devant faire (Je le lui fais signer)'),
      b('Keep fait strictly invariable in passé composé + infinitive', 'Laisser fait invariable devant un infinitif même avec un COD féminin ou pluriel'),
    ],
    13,
    [
      card(
        b('Pronouns go BEFORE faire, never between faire and the infinitive', 'Les pronoms passent DEVANT faire'),
        b(
          'Even though the infinitive describes the action, French treats **faire + infinitive** as one inseparable verb block. Therefore, **every object pronoun goes BEFORE faire**—never between `faire` and the infinitive! Say **Je la fais réparer** (NOT « Je fais la réparer »), and with an infinitive modal, right before **faire**: **Je vais la faire réparer**.\n\nDirect pronoun: **Je le fais livrer, Elle les fait nettoyer, Nous l’avons fait construire**.\nIndirect pronoun (agent): **Je lui fais visiter Lyon, Tu leur fais goûter le plat**.\nTwo pronouns: **Je le lui fais signer, Elle nous les fait relire**.',
          'Parce que **faire + infinitif** forme un bloc soudé, **tous les pronoms compléments se placent DEVANT faire** — jamais entre `faire` et l’infinitif ! Dites **Je la fais réparer** (jamais « Je fais la réparer »). Même après `aller` ou `pouvoir`, le pronom reste juste avant **faire** : **Je vais la faire réparer**.\n\nPronom COD : **Je le fais livrer, Elle les fait nettoyer, Nous l’avons fait construire**.\nPronom COI (agent) : **Je lui fais visiter Lyon, Tu leur fais goûter le plat**.\nDeux pronoms : **Je le lui fais signer, Elle nous les fait relire**.',
        ),
        {
          table: {
            head: [b('Full sentence', 'Phrase complète'), b('With pronoun(s)', 'Avec pronom(s)'), b('Key rule', 'Règle clé')],
            rows: [
              ['Je fais réparer ma montre.', 'Je la fais réparer.', b('la goes before fais', 'la se place devant fais')],
              ['Je fais rire mes amis.', 'Je les fais rire.', b('les goes before fais', 'les se place devant fais')],
              ['Je fais visiter Paris à Paul.', 'Je lui fais visiter Paris.', b('à Paul → lui before fais', 'à Paul → lui devant fais')],
              ['Je fais signer le bail à Léa.', 'Je le lui fais signer.', b('le before lui, both before fais', 'le avant lui, devant fais')],
              ['J’ai fait imprimer ces photos.', 'Je les ai fait imprimer.', b('fait stays INVARIABLE!', 'fait reste INVARIABLE !')],
            ],
          },
          ex: [
            ['Ta veste était tachée ? Oui, je l’ai fait nettoyer au pressing.', 'Was your jacket stained? Yes, I had it cleaned at the dry cleaner’s.'],
            ['Mes cousins arrivent de Québec : je vais leur faire découvrir le quartier.', 'My cousins are arriving from Quebec: I’m going to show them around the neighbourhood.'],
          ],
        },
      ),
      trap(
        b('Fait + infinitive is ALWAYS invariable!', 'Fait + infinitif est TOUJOURS invariable !'),
        b(
          'Normally, a preceding `la` or `les` adds `-e` or `-s` to a past participle (`Ces photos, je les ai prises`). **Not with faire + infinitive!** Whenever `faire` is followed by an infinitive, **fait** NEVER takes `-e` or `-s`: « Ma robe ? Je l’ai **fait** raccourcir », « Ces affiches ? Nous les avons **fait** imprimer ». Only when `faire` stands alone with no infinitive does it agree (`La robe que j’ai faite`).\n\nInvariable fait + infinitive: **je l’ai fait réparer, je les ai fait venir, nous l’avons fait traduire**.',
          'Habituellement, un `la` ou `les` placé avant `avoir` entraîne l’accord (`Ces photos, je les ai prises`). **Exception absolue avec faire + infinitif** : `fait` suivi d’un infinitif reste **TOUJOURS invariable**, sans `-e` ni `-s` ! Dites « Ma robe ? Je l’ai **fait** raccourcir », « Ces affiches ? Nous les avons **fait** imprimer ».\n\nToujours invariable devant infinitif : **je l’ai fait réparer, je les ai fait venir, nous l’avons fait traduire**.',
        ),
      ),
      mc(P.order, ['je la fais développer', 'je fais la développer', 'je fais développer la', 'la je fais développer'], {
        fr: 'Cette pellicule photo ? Demain matin, ___.',
      }),
      mc(P.spelling, ['les avons fait réparer', 'les avons faits réparer', 'les avons faites réparer', 'avons les fait réparer'], {
        fr: 'Nos deux bicyclettes étaient cassées : nous ___ hier.',
        explain: b('Fait + infinitive NEVER agrees, even when les refers to feminine plural bicyclettes!', 'Fait suivi d’un infinitif reste toujours invariable, même avec bicyclettes au féminin pluriel !'),
      }),
      gap(P.complete, 'Tu montres le dossier aux stagiaires ? — Oui, je ___ (le + leur) fais lire ce matin. Et les chaises abîmées ? — Le menuisier ___ (les) a ___ (faire) réparer hier.', [['le leur'], ['les'], ['fait']], {
        choices: [['le leur', 'leur le', 'les leur'], ['les', 'leur'], ['fait', 'faites', 'faits']],
      }),
      ord(P.order, 'Mes parents m’ont fait goûter une spécialité régionale.', {
        tr: 'My parents had me taste a regional speciality.',
        extra: ['faite', 'à'],
      }),
      sort(
        b('Agree or stay invariable?', 'Le participe s’accorde-t-il ou reste-t-il invariable ?'),
        [b('Stays invariable (fait + infinitive)', 'Reste invariable (fait + infinitif)'), b('Agrees with preceding COD (no infinitive)', 'S’accorde avec le COD (pas d’infinitif)')],
        [['Cette jupe, je l’ai fait raccourcir.', 0], ['Cette tarte, je l’ai faite maison.', 1], ['Mes lunettes, je les ai fait ajuster.', 0], ['Ces erreurs, nous les avons faites hier.', 1], ['La lettre, je la lui ai fait relire.', 0]],
      ),
      hear('La table était trop grande pour le salon, alors nous l’avons fait couper de dix centimètres par un menuisier.', b('What happened to the table?', 'Qu’est-il arrivé à la table ?'), [
        b('They had a carpenter cut it down by ten centimetres', 'Ils l’ont fait raccourcir de dix centimètres par un menuisier'),
        b('They sold it to a carpenter ten days ago', 'Ils l’ont vendue à un menuisier il y a dix jours'),
        b('They cut it themselves in the living room', 'Ils l’ont coupée eux-mêmes dans le salon'),
      ]),
      dict('Ces chemises étaient froissées, donc je les ai fait repasser avant le mariage.'),
      say('Si tu ne comprends pas ce contrat, je peux te le faire expliquer par une amie juriste.', 'If you don’t understand this contract, I can have a lawyer friend explain it to you.'),
    ],
    [
      b('All object pronouns go BEFORE faire: Je la fais réparer, Je le lui fais signer.', 'Tous les pronoms vont DEVANT faire : Je la fais réparer, Je le lui fais signer.'),
      b('With modals/futur proche, pronouns sit right before faire: Je vais les faire livrer.', 'Avec un modal ou futur proche, les pronoms précèdent juste faire : Je vais les faire livrer.'),
      b('fait + infinitive is ALWAYS invariable in the passé composé: Je les ai fait imprimer.', 'fait + infinitif reste TOUJOURS invariable au passé composé : Je les ai fait imprimer.'),
    ],
    [
      ['un menuisier', b('a carpenter', 'un artisan qui travaille le bois')],
      ['froissé(e)', b('creased, crumpled', 'qui a des plis (un tissu)')],
      ['raccourcir', b('to shorten', 'rendre plus court')],
    ],
  ),

  lesson(C, 3, ['laisser-and-se-faire-infinitive', 'laisser-et-se-faire-infinitif'],
    b('Laisser + infinitive and se faire + infinitive', 'Laisser + infinitif et se faire + infinitif'),
    b('Allow someone to act with laisser, or describe passive services and mishaps with se faire.', 'Autoriser ou ne pas empêcher avec laisser, et exprimer le service reçu ou l’événement subi avec se faire.'),
    [
      b('Use laisser + infinitive to express letting or allowing someone/something act', 'Employer laisser + infinitif pour autoriser ou ne pas empêcher'),
      b('Contrast active faire + inf with passive-like se faire + infinitive (services and mishaps)', 'Distinguer faire + inf et se faire + inf (soins, services ou mésaventures)'),
      b('Keep fait invariable in se faire + infinitive (Elle s’est fait couper les cheveux)', 'Garder fait invariable dans se faire + infinitif'),
    ],
    13,
    [
      card(
        b('Laisser + infinitive (letting) vs se faire + infinitive (getting… done)', 'Laisser + infinitif et se faire + infinitif'),
        b(
          '**Laisser + infinitive** means to *let* or *allow* someone or something to act (`Laisse-moi finir !`, `Je laisse les enfants jouer`). Unlike `faire`, `laisser` lets a noun sit either before or after the infinitive, though pronouns still go **before laisser** (`Je les laisse jouer`). Meanwhile, **se faire + infinitive** means *"to get oneself …"*—either a deliberate service (`Je me fais couper les cheveux`) or a passive mishap (`Il s’est fait voler son vélo`).\n\nLaisser + inf: **laisser passer, laisser dormir, laisser parler, laisser refroidir**.\nSe faire (service): **se faire couper les cheveux, se faire livrer, se faire soigner**.\nSe faire (passive / mishap): **se faire voler, se faire gronder, se faire embaucher**.',
          '**Laisser + infinitif** signifie *permettre* ou *ne pas empêcher* (`Laisse-moi finir !`, `Je laisse les enfants jouer`). Les pronoms se placent toujours **devant laisser** (`Je les laisse jouer`). Quant à **se faire + infinitif**, il donne une valeur quasi passive : soit un **service qu’on reçoit** (`Je me fais couper les cheveux`), soit une **mésaventure ou un événement subi** (`Il s’est fait voler son vélo`).\n\nLaisser + inf : **laisser passer, laisser dormir, laisser parler, laisser refroidir**.\nSe faire (service) : **se faire couper les cheveux, se faire livrer, se faire soigner**.\nSe faire (passif / subi) : **se faire voler, se faire gronder, se faire embaucher**.',
        ),
        {
          table: {
            head: [b('Pattern', 'Structure'), b('Nuance', 'Nuance'), b('Example', 'Exemple')],
            rows: [
              ['laisser + inf.', b('allow / not stop', 'permettre / ne pas empêcher'), 'Je le laisse décider tout seul.'],
              ['se faire + inf. (service)', b('have done for oneself', 'service demandé pour soi'), 'Elle se fait livrer ses courses.'],
              ['se faire + inf. (passive)', b('get …ed (often unwanted or lucky)', 'événement subi (positif ou négatif)'), 'Il s’est fait renvoyer / embaucher.'],
            ],
          },
          ex: [
            ['Laisse refroidir la soupe deux minutes avant de goûter.', 'Let the soup cool for two minutes before tasting it.'],
            ['Mon frère s’est fait embaucher dans un studio d’animation !', 'My brother got hired at an animation studio!'],
          ],
        },
      ),
      trap(
        b('Se faire + infinitive: être auxiliary, yet fait NEVER agrees!', 'Se faire + infinitif : auxiliaire être, mais fait toujours invariable !'),
        b(
          'Even though pronominal **se faire** uses **être** in the passé composé, **fait** followed by an infinitive remains **invariable**! Write: « Claire **s’est fait** couper les cheveux » (never « faite »), and « Ils **se sont fait** voler leurs passeports » (never « faits »). Also notice: you cannot say « Je suis coupé les cheveux » in French—always use **Je me suis fait couper les cheveux**.\n\nPassé composé invariable: **elle s’est fait opérer, ils se sont fait arnaquer, nous nous sommes fait livrer**.',
          'Même si le verbe pronominal **se faire** prend l’auxiliaire **être**, **fait** suivi d’un infinitif ne s’accorde JAMAIS ! Écrivez : « Claire **s’est fait** couper les cheveux » (jamais « faite ») et « Ils **se sont fait** voler leurs passeports » (jamais « faits »). De même, pour le coiffeur, dites toujours **Je me fais couper les cheveux**.\n\nToujours invariable : **elle s’est fait opérer, ils se sont fait arnaquer, nous nous sommes fait livrer**.',
        ),
      ),
      mc(P.form, ['s’est fait voler', 'a fait voler', 's’est faite voler', 's’est volé'], {
        fr: 'Dans le bus bondé, Nadia ___ son téléphone.',
        explain: b('Passive mishap happening to Nadia → se faire voler, with fait invariable.', 'Mésaventure subie par Nadia → se faire voler, avec fait invariable.'),
      }),
      mc(P.form, ['Laissez-moi', 'Faites-moi', 'Me laissez', 'Laisse-me'], {
        fr: 'S’il vous plaît, ___ finir ma phrase avant de répondre !',
      }),
      gap(P.complete, 'Hier, mes sœurs ___ (se faire, passé composé) couper les cheveux, puis elles ___ (laisser) leur petit frère ___ (jouer) dans le parc pendant qu’elles lisaient.', [['se sont fait'], ['ont laissé'], ['jouer']], {
        choices: [['se sont fait', 'se sont faites', 'ont fait'], ['ont laissé', 'se sont laissé'], ['jouer', 'à jouer']],
      }),
      ord(P.order, 'Ne te laisse pas décourager par cette première difficulté !', {
        tr: 'Don’t let yourself be discouraged by this first difficulty!',
        extra: ['fait', 'à'],
      }),
      sort(
        b('Is it delegated action (faire), permission (laisser), or passive/self-service (se faire)?', 'Action confiée (faire), permission (laisser) ou événement subi/service (se faire) ?'),
        [b('faire + infinitive', 'faire + infinitif'), b('laisser + infinitive', 'laisser + infinitif'), b('se faire + infinitive', 'se faire + infinitif')],
        [['Je fais réparer mon toit.', 0], ['Tu le laisses entrer ?', 1], ['Il s’est fait piquer par une guêpe.', 2], ['Elle se fait masser le dos.', 2], ['Laisse-la réfléchir tranquille.', 1], ['Nous faisons livrer le canapé.', 0]],
      ),
      hear('Ma mère a failli se faire renverser par un scooter, mais heureusement un passant l’a attrapée à temps et l’a laissée s’asseoir sur un banc.', b('What happened to the speaker’s mother?', 'Qu’est-il arrivé à la mère de la personne ?'), [
        b('She nearly got knocked down by a scooter, and a passer-by helped her sit down', 'Elle a failli se faire renverser par un scooter et un passant l’a aidée à s’asseoir'),
        b('She bought a scooter and rode it to the park', 'Elle a acheté un scooter pour aller au parc'),
        b('She knocked down a bench while walking quickly', 'Elle a renversé un banc en marchant vite'),
      ]),
      dlg(b('After a busy morning', 'Après une matinée mouvementée'), b('Amélie tells Lucas about her morning.', 'Amélie raconte sa matinée pleine de rebondissements à Lucas.'), [['Amélie', 'f'], ['Lucas', 'm']], [
        [0, 'Quelle matinée ! D’abord, je suis allée chez le coiffeur me faire couper les cheveux.', 'What a morning! First I went to the hairdresser’s to get my hair cut.'],
        [1, { options: ['Ah, ça te va très bien ! Et ensuite, tu as pu récupérer ta montre ?', 'Ah, ça te va très bien ! Et ensuite, tu as pu faire ta montre récupérer ?'], explain: b('Récupérer is normal active action by Amélie; faire goes with réparer, not récupérer here.', 'Amélie récupère sa montre elle-même ; seul réparer est causatif.') }],
        [0, 'Oui, je l’ai fait réparer chez l’horloger en vingt minutes, mais en sortant j’ai failli me faire tremper par une voiture dans une flaque !', 'Yes, I had it repaired at the watchmaker’s in twenty minutes, though leaving the shop I nearly got splashed by a car in a puddle!'],
        [1, { options: ['Eh bien, assieds-toi et laisse-moi te préparer un bon thé chaud.', 'Eh bien, assieds-toi et fais-moi te préparer un bon thé chaud.', 'Eh bien, assieds-toi et laisse-toi me préparer un bon thé chaud.'], explain: b('Laisse-moi te préparer = let me make you.', 'Laisse-moi te préparer = permets-moi de te préparer.') }],
      ]),
      write(
        b('Write about services and small surprises using faire, laisser and se faire', 'Raconter des démarches ou imprévus avec faire, laisser et se faire'),
        b('Write 40 to 75 words about errands, home repairs or a funny mishap. Include at least one faire + infinitive with a pronoun before faire, one laisser + infinitive, and one se faire + infinitive in the passé composé (remembering invariable fait!).', 'Écrivez 40 à 75 mots sur des courses, des réparations ou une petite mésaventure. Incluez au moins un faire + infinitif précédé d’un pronom, un laisser + infinitif, et un se faire + infinitif au passé composé (fait invariable !).'),
        40,
        75,
        [
          b('Pronoun placed before faire (never between faire and infinitive)', 'Pronom placé avant faire'),
          b('Accurate use of laisser + infinitive', 'Emploi juste de laisser + infinitif'),
          b('Invariable fait in se faire + infinitive at passé composé', 'Fait invariable dans se faire + infinitif au passé composé'),
        ],
        'Samedi, mon vélo avait un pneu crevé : je l’ai fait réparer au magasin du quartier. Pendant l’attente, j’ai laissé mon chien dormir devant la vitrine. Ensuite, je suis allée me faire couper la frange, mais il s’est mis à pleuvoir et je me suis fait arroser en rentrant à pied !',
      ),
    ],
    [
      b('laisser + infinitive means to allow or not prevent someone/something from acting.', 'laisser + infinitif signifie permettre ou ne pas empêcher.'),
      b('se faire + infinitive expresses a passive-like service (je me fais couper les cheveux) or mishap (il s’est fait voler).', 'se faire + infinitif exprime un service reçu ou un événement subi (il s’est fait voler).'),
      b('Even with être, fait in se faire + infinitive stays invariable: Elle s’est fait couper les cheveux.', 'Même avec être, fait suivi d’un infinitif reste invariable : Elle s’est fait couper les cheveux.'),
    ],
    [
      ['embaucher', b('to hire', 'recruter pour un emploi')],
      ['bondé(e)', b('packed, crowded', 'rempli de monde')],
      ['un pneu crevé', b('a flat tyre', 'une roue dégonflée et percée')],
    ],
  ),
];

export default lessons;
