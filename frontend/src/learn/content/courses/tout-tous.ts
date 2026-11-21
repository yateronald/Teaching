import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Tout, toute, tous, toutes: one small word with four forms and three jobs. As an adjective it agrees with the noun (toute la journée, tous les jours), as a pronoun it stands alone (tout est prêt, ils sont tous là, with a pronounced s), and as an adverb meaning “completely” it is mostly invariable (ils sont tout contents) except before a feminine consonant (elle est toute contente). This course makes these rules simple and practical.',
    'Tout, toute, tous, toutes : un petit mot, quatre formes, trois rôles. Adjectif, il s’accorde avec le nom (toute la journée, tous les jours) ; pronom, il s’emploie seul (tout est prêt, ils sont tous là, avec un s prononcé) ; adverbe au sens de « complètement », il est en général invariable (ils sont tout contents) sauf devant un féminin à consonne (elle est toute contente). Ce cours rend ces règles simples et pratiques.',
  ),
  outcomes: [
    b('Agree tout with the noun', 'Accorder tout avec le nom'),
    b('Use tout and tous as pronouns, and pronounce tous', 'Employer tout et tous comme pronoms, et prononcer tous'),
    b('Use tout as an adverb', 'Employer tout comme adverbe'),
    b('Use common expressions: tout le monde, tout de suite', 'Employer les expressions courantes : tout le monde, tout de suite'),
  ],
};

const C = 'tout-tous';
export default [
  lesson(C, 1, ['tout-as-adjective', 'tout-adjectif'],
    b('Tout le, toute la, tous les, toutes les', 'Tout le, toute la, tous les, toutes les'),
    b('Agree tout with the noun that follows.', 'Accorder tout avec le nom qui suit.'),
    [b('Choose the four forms', 'Choisir parmi les quatre formes'), b('Express frequency with tous les', 'Exprimer la fréquence avec tous les'), b('Contrast toute la journée and tous les jours', 'Opposer toute la journée et tous les jours')],
    13,
    [
      card(b('Four forms', 'Quatre formes'), b('**tout le** + masculine singular, **toute la** + feminine singular, **tous les** + masculine plural, **toutes les** + feminine plural. **Tout le gâteau, toute la nuit, tous les enfants, toutes les fenêtres.**', '**tout le** + masculin singulier, **toute la** + féminin singulier, **tous les** + masculin pluriel, **toutes les** + féminin pluriel. **Tout le gâteau, toute la nuit, tous les enfants, toutes les fenêtres.**'), {
        ex: [['J’ai travaillé toute la journée.', 'I worked all day.'], ['Je fais du sport tous les jours.', 'I exercise every day.'], ['Toutes les places sont prises.', 'All the seats are taken.']],
      }),
      tip(b('Whole vs every', 'Entier ou chaque'), b('Singular = **the whole**: **toute la semaine** (the whole week). Plural = **every**: **toutes les semaines** (every week). Also **tous les deux jours** (every other day).', 'Singulier = **en entier** : **toute la semaine**. Pluriel = **chaque** : **toutes les semaines**. Aussi **tous les deux jours** (un jour sur deux).')),
      sort(b('Which form?', 'Quelle forme ?'), ['tout le', 'toute la', 'tous les', 'toutes les'], [['… monde', 0], ['… ville', 1], ['… matins', 2], ['… semaines', 3], ['… temps', 0], ['… famille', 1]]),
      mc(P.word, ['tous', 'tout', 'toute', 'toutes'], { fr: 'Il va à la piscine ___ les mercredis.' }),
      mc(P.word, ['toute', 'tout', 'tous', 'toutes'], { fr: 'Nous avons dansé ___ la nuit.' }),
      mc(P.meaning, [b('every other day', 'un jour sur deux'), b('all day long', 'toute la journée'), b('twice a day', 'deux fois par jour'), b('both days', 'les deux jours')], { fr: 'tous les deux jours' }),
      gap(P.complete, '___ les matins, je lis ___ le journal.', ['Tous', 'tout']),
      say('Je travaille tous les jours, mais je me repose tout le week-end.', 'I work every day, but I rest the whole weekend.'),
    ],
    [
      b('tout le / toute la = the whole; tous les / toutes les = every.', 'tout le / toute la = en entier ; tous les / toutes les = chaque.'),
      b('tous les deux jours = every other day.', 'tous les deux jours = un jour sur deux.'),
      b('tout le monde = everybody (verb in the singular).', 'tout le monde = chacun (verbe au singulier).'),
    ],
    [['la piscine', b('the swimming pool', 'bassin pour nager')], ['se reposer', b('to rest', 'se détendre')], ['une place', b('a seat; a square', 'siège ; place publique')]],
  ),
  lesson(C, 2, ['tout-and-tous-as-pronouns', 'tout-et-tous-pronoms'],
    b('Tout est prêt, ils sont tous là', 'Tout est prêt, ils sont tous là'),
    b('Use tout, tous and toutes as pronouns and pronounce them correctly.', 'Employer tout, tous et toutes comme pronoms et les prononcer correctement.'),
    [b('Use tout = everything', 'Employer tout = toutes les choses'), b('Use tous / toutes = all of them', 'Employer tous / toutes = l’ensemble des personnes'), b('Pronounce the s of the pronoun tous', 'Prononcer le s du pronom tous')],
    13,
    [
      card(b('Tout = everything', 'Tout = toutes les choses'), b('**Tout** alone means **everything** and takes a singular verb: **Tout va bien. J’ai tout compris. C’est tout.**', '**Tout** seul signifie **toutes les choses** et prend un verbe au singulier : **Tout va bien. J’ai tout compris. C’est tout.**'), {
        ex: [['Tout est prêt pour la fête.', 'Everything is ready for the party.'], ['Merci pour tout !', 'Thanks for everything!']],
      }),
      card(b('Tous, toutes = all of them', 'Tous, toutes = tous ensemble'), b('**Tous / toutes** replace a group: **Les invités sont tous arrivés. Mes sœurs ? Elles sont toutes médecins.** The pronoun **tous** is pronounced with **[s]**: [tus]. The adjective (tous les) is not: [tu].', '**Tous / toutes** remplacent un groupe : **Les invités sont tous arrivés. Mes sœurs ? Elles sont toutes médecins.** Le pronom **tous** se prononce avec **[s]** : [tus]. L’adjectif (tous les) non : [tu].'), {
        ex: [['Ils sont tous là.', 'They are all here.'], ['Bonjour à tous !', 'Hello everyone!'], ['Tous les jours.', 'Every day.']],
      }),
      mc(P.best, ['Nous sommes tous d’accord.', 'Nous sommes tout d’accord.', 'Nous tous sommes d’accord tous.', 'Nous sommes toutes d’accords.'], { fr: 'Une équipe d’hommes et de femmes dit :' }),
      mc(P.best, ['J’ai tout oublié !', 'J’ai tous oublié !', 'J’ai oublié tout de !', 'Tout j’ai oublié !']),
      mc(P.listen, [b('the s is pronounced: [tus]', 'le s se prononce : [tus]'), b('the s is silent: [tu]', 'le s est muet : [tu]'), b('it sounds like « toute »', 'cela sonne comme « toute »'), b('it sounds like « tôt »', 'cela sonne comme « tôt »')], { audio: 'Ils sont tous partis.', listen: true, explain: b('Pronoun tous: [tus].', 'Pronom tous : [tus].') }),
      gap(P.complete, 'Les filles ? Elles sont ___ parties à la plage. Et toi, tu as ___ rangé ?', ['toutes', 'tout']),
      ord(P.order, 'Bonjour à tous et merci d’être venus.', { tr: 'Hello everyone and thank you for coming.' }),
      say('Bonjour à tous ! Tout est prêt, vous pouvez vous asseoir.', 'Hello everyone! Everything is ready, you can sit down.'),
    ],
    [
      b('tout (pronoun) = everything, singular verb (Tout va bien).', 'tout (pronom) = toutes les choses, verbe au singulier (Tout va bien).'),
      b('tous / toutes (pronoun) = all of them; tous pronounced [tus].', 'tous / toutes (pronom) = l’ensemble ; tous se prononce [tus].'),
      b('Adjective tous les: [tu] (no s sound).', 'Adjectif tous les : [tu].'),
    ],
    [['être d’accord', b('to agree', 'avoir la même opinion')], ['ranger', b('to tidy up', 'mettre en ordre')], ['un invité', b('a guest', 'personne invitée')]],
  ),
  lesson(C, 3, ['tout-as-adverb', 'tout-adverbe'],
    b('Tout as an adverb and key expressions', 'Tout adverbe et expressions clés'),
    b('Use tout meaning “completely” and the everyday expressions with tout.', 'Employer tout au sens de « complètement » et les expressions courantes.'),
    [b('Use invariable tout before adjectives', 'Employer tout invariable devant un adjectif'), b('Apply the feminine-consonant exception', 'Appliquer l’exception du féminin à consonne'), b('Use tout de suite, tout à fait, pas du tout', 'Employer tout de suite, tout à fait, pas du tout')],
    13,
    [
      card(b('Tout = completely', 'Tout = complètement'), b('Before an adjective, **tout** means **completely** and does not change: **Ils sont tout contents. Elle est tout émue.** Exception, for the sound: before a **feminine adjective starting with a consonant**, it agrees: **Elle est toute contente. Elles sont toutes rouges.**', 'Devant un adjectif, **tout** signifie **complètement** et reste invariable : **Ils sont tout contents. Elle est tout émue.** Exception, pour le son : devant un **adjectif féminin commençant par une consonne**, il s’accorde : **Elle est toute contente. Elles sont toutes rouges.**'), {
        ex: [['Il est tout seul.', 'He’s all alone.'], ['Elle est toute seule.', 'She’s all alone.'], ['Elles sont tout heureuses.', 'They are very happy.']],
      }),
      pairs(P.match, [['tout de suite', b('right away', 'immédiatement')], ['tout à fait', b('absolutely, exactly', 'entièrement d’accord')], ['pas du tout', b('not at all', 'aucunement')], ['tout à l’heure', b('a moment ago / in a moment', 'récemment ou bientôt')]]),
      mc(P.word, ['toute', 'tout', 'tous', 'toutes'], { fr: 'Ma fille est ___ fière de son dessin.', explain: b('Feminine adjective starting with a consonant: toute.', 'Adjectif féminin à consonne initiale : toute.') }),
      mc(P.word, ['tout', 'toute', 'tous', 'toutes'], { fr: 'Les enfants sont ___ excités.', explain: b('Masculine plural: tout stays invariable.', 'Masculin pluriel : tout reste invariable.') }),
      mc(P.best, ['Pas du tout, c’est très clair.', 'Pas tout, c’est très clair.', 'Du tout pas, c’est clair.', 'Pas de tout, c’est clair.'], { fr: '— Mes explications sont trop compliquées ?' }),
      gap(P.complete, 'Je reviens ___ de suite ! – Tu as ___ à fait raison.', ['tout', 'tout']),
      dict('Elle est toute seule, mais elle n’a pas du tout peur.', { voice: 'f' }),
      say('Je suis tout à fait d’accord, on part tout de suite.', 'I totally agree, let’s leave right away.'),
    ],
    [
      b('Adverb tout = completely, invariable: ils sont tout contents.', 'tout adverbe = complètement, invariable : ils sont tout contents.'),
      b('Before a feminine adjective with a consonant: toute contente, toutes rouges.', 'Devant un adjectif féminin à consonne : toute contente, toutes rouges.'),
      b('tout de suite, tout à fait, pas du tout, tout à l’heure, tout le monde.', 'tout de suite, tout à fait, pas du tout, tout à l’heure, tout le monde.'),
    ],
    [['fier, fière', b('proud', 'content de soi')], ['ému', b('moved, touched', 'touché par une émotion')], ['seul', b('alone', 'sans personne')]],
  ),
];
