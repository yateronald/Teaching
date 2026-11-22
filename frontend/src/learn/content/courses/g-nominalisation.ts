import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French press headlines, administrative reports and DALF C1 syntheses rarely use long verbal clauses where one crisp noun phrase does the job: instead of « parce que les prix ont augmenté rapidement », formal French writes « en raison de la hausse rapide des prix ». This C1 course trains you to turn verbs and adjectives into exact nouns (-tion, -ment, -age, -té, -eur, -ance), match them with the right prepositions (faute de, lors de, en dépit de), and produce dense, elegant prose.',
    'Les titres de presse, les rapports administratifs et les synthèses du DALF C1 évitent les longues subordonnées lorsqu’un groupe nominal suffit : plutôt que « parce que les prix ont augmenté rapidement », on écrit « en raison de la hausse rapide des prix ». Ce cours C1 vous entraîne à transformer verbes et adjectifs en noms exacts (-tion, -ment, -age, -té, -eur, -ance), à les relier aux bonnes prépositions (faute de, lors de, en dépit de) et à rédiger un style dense et précis.',
  ),
  outcomes: [
    b('Derive accurate nouns from verbs using -tion, -ment, -age, -ure and stem nouns', 'Former des noms exacts à partir de verbes (-tion, -ment, -age, -ure et déverbaux)'),
    b('Derive abstract nouns from adjectives (-té, -eur, -esse, -ence)', 'Former des noms abstraits à partir d’adjectifs (-té, -eur, -esse, -ence)'),
    b('Replace causal, temporal and concessive clauses with nominal prepositions', 'Remplacer subordonnées causales, temporelles et concessives par des prépositions'),
    b('Write concise C1 press headlines and executive summaries', 'Rédiger des titres de presse et notes de synthèse denses de niveau C1'),
  ],
};

const C = 'g-nominalisation';
export default [
  lesson(C, 1, ['verb-to-noun-nominalisation', 'nominalisation-des-verbes'],
    b('Turning verbs into nouns', 'La nominalisation des verbes'),
    b('Master the main verb-to-noun suffixes and compact press-style headlines.', 'Maîtriser les principaux suffixes verbaux et les tournures nominales de la presse.'),
    [b('Form nouns in -tion, -ment, -age, -ure, -ance', 'Former les noms en -tion, -ment, -age, -ure, -ance'), b('Use short verb-stem nouns (la baisse, l’arrêt, le recul)', 'Employer les déverbaux courts (la baisse, l’arrêt, le recul)'), b('Know the gender of each nominal suffix', 'Connaître le genre de chaque suffixe')],
    13,
    [
      card(b('From action verb to noun phrase', 'Du verbe d’action au groupe nominal'), b('French derives action nouns in five main ways: **-tion / -ation / -ition** (f.: *augmenter → l’augmentation, réduire → la réduction*), **-ment** (m.: *développer → le développement, changer → le changement*), **-age** (m.: *démarrer → le démarrage, trier → le tri*), **-ure** (f.: *fermer → la fermeture, rouvrir → la réouverture*), and **short stem nouns** (*baisser → la baisse, augmenter/hausser → la hausse, reculer → le recul, arrêter → l’arrêt*).', 'Le français forme les noms d’action par cinq voies principales : **-tion / -ation / -ition** (f. : *augmenter → l’augmentation, réduire → la réduction*), **-ment** (m. : *développer → le développement*), **-age** (m. : *démarrer → le démarrage*), **-ure** (f. : *fermer → la fermeture, rouvrir → la réouverture*), et des **déverbaux courts** (*la baisse, la hausse, le recul, l’arrêt*).'), {
        ex: [['Les tarifs ont augmenté → La hausse / L’augmentation des tarifs.', 'Fares rose → The fare increase.'], ['La ligne fermera en août → La fermeture de la ligne en août.', 'The line will close in August → Closure of the line in August.'], ['On a interdit ce produit → L’interdiction de ce produit.', 'This product was banned → The ban on this product.']],
      }),
      tip(b('Gender comes for free with the suffix', 'Le suffixe donne le genre'), b('**-tion / -sion / -ure / -ance / -ence / -aison** are **feminine** (*la livraison, l’ouverture, la croissance*). **-ment / -age** are **masculine** (*le lancement, le recyclage*). Notice *la baisse / la hausse* vs *le recul / le déclin / l’essor*.', '**-tion / -sion / -ure / -ance / -ence / -aison** sont **féminins** (*la livraison, l’ouverture, la croissance*). **-ment / -age** sont **masculins** (*le lancement, le recyclage*). Notez *la baisse / la hausse* contre *le recul / le déclin / l’essor*.')),
      pairs(P.match, [['Les vols ont repris.', b('La reprise des vols.', 'reprendre → la reprise')], ['Le chômage a reculé.', b('Le recul du chômage.', 'reculer → le recul')], ['Le projet a démarré.', b('Le démarrage du projet.', 'démarrer → le démarrage')], ['La loi a été adoptée.', b('L’adoption de la loi.', 'adopter → l’adoption')]]),
      sort(b('Masculine or feminine noun?', 'Nom masculin ou féminin ?'), [b('masculine (le / un)', 'masculin (le / un)'), b('feminine (la / une)', 'féminin (la / une)')], [['… financement', 0], ['… réduction', 1], ['… tri', 0], ['… fermeture', 1], ['… ralentissement', 0], ['… interdiction', 1]]),
      mc(P.word, ['l’ouverture', 'l’ouvrement', 'l’ouvrure', 'l’ouvration'], { fr: 'Suite à ___ d’une nouvelle ligne, le trafic sera perturbé.' }),
      gap(P.complete, 'La mairie annonce ___ (supprimer) de vingt places et ___ (élargir) des trottoirs.', ['la suppression', 'l’élargissement'], { choices: [['la suppression', 'le supprimage', 'la supprimation'], ['l’élargissement', 'l’élargition', 'la élargissure']] }),
      dict('La réouverture du musée s’accompagne d’une refonte complète des tarifs.', { voice: 'f' }),
    ],
    [
      b('-tion, -ure, -ance/-ence, -aison → feminine; -ment, -age → masculine.', '-tion, -ure, -ance/-ence, -aison → féminin ; -ment, -age → masculin.'),
      b('Irregular pairs to memorise: fermer → fermeture, supprimer → suppression, reprendre → reprise.', 'Paires irrégulières : fermer → fermeture, supprimer → suppression, reprendre → reprise.'),
      b('Verbal subject or object connects with de: Les usagers manifestent → La manifestation des usagers.', 'Le sujet ou COD se relie par de : La manifestation des usagers.'),
    ],
    [['une refonte', b('an overhaul, redesign', 'réorganisation complète')], ['un essor', b('a boom, rapid growth', 'développement rapide')], ['un usager', b('a user (public service)', 'utilisateur d’un service')]],
  ),
  lesson(C, 2, ['adjective-to-noun-nominalisation', 'nominalisation-des-adjectifs'],
    b('Turning adjectives into nouns', 'La nominalisation des adjectifs'),
    b('Build exact abstract nouns from adjectives and transform clauses into compact evaluations.', 'Former des noms abstraits à partir d’adjectifs et condenser l’évaluation.'),
    [b('Form nouns in -té / -ité, -eur, -esse, -ence', 'Former les noms en -té / -ité, -eur, -esse, -ence'), b('Avoid spelling traps like clarté and ambiguïté', 'Éviter les pièges orthographiques comme clarté et ambiguïté'), b('Condense être + adjective into noun phrases', 'Condenser être + adjectif en groupe nominal')],
    13,
    [
      card(b('Adjective suffixes', 'Les suffixes adjectivaux'), b('**-(i)té** (f.): *efficace → l’efficacité, fiable → la fiabilité, clair → la clarté, bref → la brièveté*. **-eur** (f.): *lent → la lenteur, lourd → la lourdeur, profond → la profondeur*. **-esse** (f.): *faible → la faiblesse, juste → la justesse, riche → la richesse*. **-ance / -ence** (f.): *pertinent → la pertinence, cohérent → la cohérence, prudent → la prudence*. **-itude** (f.): *exact → l’exactitude, inquiet → l’inquiétude*.', '**-(i)té** (f.) : *efficace → l’efficacité, fiable → la fiabilité, clair → la clarté, bref → la brièveté*. **-eur** (f.) : *lent → la lenteur, lourd → la lourdeur, profond → la profondeur*. **-esse** (f.) : *faible → la faiblesse, juste → la justesse, riche → la richesse*. **-ance / -ence** (f.) : *pertinent → la pertinence, cohérent → la cohérence*. **-itude** (f.) : *exact → l’exactitude, inquiet → l’inquiétude*.'), {
        ex: [['Les démarches sont lentes → La lenteur des démarches.', 'Procedures are slow → The slowness of the procedures.'], ['Son analyse est pertinente → La pertinence de son analyse.', 'Her analysis is relevant → The relevance of her analysis.'], ['Ce logiciel est fiable → La fiabilité de ce logiciel.', 'This software is reliable → The reliability of this software.']],
      }),
      trap(b('Tricky spellings & false pairs', 'Pièges d’orthographe et faux amis'), b('Write **la clarté** (not « clairté »), **la brièveté** (from *bref*), **la souveraineté** (keeps *-e-*), **l’ambiguïté** (with *ï*), and **la lourdeur** (with *-eur*, like *chaleur, douceur*). Also distinguish **la compétence** (skill) from **la compétitivité** (competitiveness).', 'Écrivez **la clarté** (pas « clairté »), **la brièveté** (de *bref*), **la souveraineté** (avec *e*), **l’ambiguïté** (tréma sur *i*) et **la lourdeur** (en *-eur*). Distinguez aussi **la compétence** (savoir-faire) de **la compétitivité** (capacité à affronter la concurrence).')),
      pairs(P.match, [['ce texte est clair', b('la clarté de ce texte', 'clair → clarté')], ['cette mesure est juste', b('la justesse de cette mesure', 'juste → justesse')], ['le réseau est lent', b('la lenteur du réseau', 'lent → lenteur')], ['les chiffres sont exacts', b('l’exactitude des chiffres', 'exact → exactitude')]]),
      mc(P.spelling, ['l’ambiguïté et la clarté', 'l’ambiguité et la clairté', 'l’ambiguïté et la clairté', 'l’ambigüité et la clareté'], { fr: 'Le jury a souligné ___ de ce rapport, malgré ___ de sa conclusion.' }),
      mc(P.word, ['pertinence', 'pertinenté', 'pertinesse', 'pertinitude'], { fr: 'Tout le monde a salué la ___ de ses remarques.' }),
      gap(P.complete, 'Nous déplorons ___ (lourd) des procédures et saluons ___ (rapide) de votre réponse.', ['la lourdeur', 'la rapidité'], { choices: [['la lourdeur', 'la lourdesse', 'la lourdité'], ['la rapidité', 'la rapideur', 'la rapidesse']] }),
      say('La pertinence du diagnostic et la clarté du calendrier rassurent les partenaires.', 'The relevance of the diagnosis and the clarity of the schedule reassure the partners.'),
    ],
    [
      b('Main feminine suffixes from adjectives: -(i)té, -eur, -esse, -ance/-ence, -itude.', 'Principaux suffixes féminins : -(i)té, -eur, -esse, -ance/-ence, -itude.'),
      b('Watch stems: clair → clarté, bref → brièveté, lourd → lourdeur, juste → justesse.', 'Radicaux à retenir : clair → clarté, bref → brièveté, lourd → lourdeur, juste → justesse.'),
      b('Convert subject + être + adjective into [noun] + de + [subject].', 'Transformez sujet + être + adjectif en [nom] + de + [sujet].'),
    ],
    [['la justesse', b('accuracy, soundness', 'caractère exact et mesuré')], ['la lourdeur', b('heaviness, red tape', 'caractère pesant ou lent')], ['déplorer', b('to deplore, regret', 'regretter vivement')]],
  ),
  lesson(C, 3, ['condensing-clauses-into-noun-phrases', 'condenser-la-phrase-en-style-soutenu'],
    b('Condensing clauses into C1 formal prose', 'Condenser les subordonnées en style soutenu'),
    b('Replace subordinate clauses with prepositions + noun phrases for formal reports and DALF C1.', 'Remplacer les propositions subordonnées par des prépositions + groupes nominaux.'),
    [b('Use faute de, en raison de, suite à, lors de, malgré', 'Employer faute de, en raison de, suite à, lors de, malgré'), b('Avoid repeating verbs by using nominal subjects and complements', 'Éviter les répétitions verbales par des groupes nominaux'), b('Rewrite an informal report in dense C1 prose', 'Réécrire un texte courant en style soutenu C1')],
    13,
    [
      card(b('Preposition + noun replaces conjunction + verb', 'Préposition + nom au lieu de conjonction + verbe'), b('**Cause**: *parce qu’on manque de moyens* → **faute de moyens** / **en raison d’un manque de moyens**. **Time**: *quand le salon a ouvert* → **lors de l’ouverture du salon**; *après qu’il a démissionné* → **à la suite de / suite à sa démission**; *avant qu’on vote* → **préalablement au vote**. **Concession**: *bien que les coûts soient élevés* → **en dépit / malgré le coût élevé**.', '**Cause** : *parce qu’on manque de moyens* → **faute de moyens** / **en raison d’un manque de moyens**. **Temps** : *quand le salon a ouvert* → **lors de l’ouverture du salon** ; *après qu’il a démissionné* → **à la suite de sa démission** ; *avant qu’on vote* → **préalablement au vote**. **Concession** : *bien que les coûts soient élevés* → **en dépit du coût élevé**.'), {
        table: { head: [b('clause', 'subordonnée'), b('nominal equivalent', 'équivalent nominal')], rows: [['parce que X manque', 'faute de X'], ['quand X a eu lieu', 'lors de X'], ['après que X est arrivé', 'à la suite de / dès X'], ['bien que X soit fort', 'malgré / en dépit de X']] },
      }),
      doc({ look: 'article', title: b('Extrait d’une note de synthèse', 'Extrait d’une note de synthèse'), text: 'En dépit d’une hausse sensible de la fréquentation lors de la réouverture du site, les travaux ont été suspendus faute de financements durables. Une reprise partielle interviendra toutefois dès l’adoption du nouveau budget.' }, P.read, [b('Attendance rose when the site reopened, yet work stopped for lack of sustainable funding.', 'La fréquentation a augmenté à la réouverture, mais les travaux ont stoppé par manque de budget durable.'), b('Funding increased, causing the site to close.', 'Les financements ont augmenté, causant la fermeture du site.'), b('Work has already resumed permanently.', 'Les travaux ont déjà repris définitivement.'), b('The budget will not be voted on.', 'Le budget ne sera pas voté.')]),
      mc(P.best, ['Faute d’accord entre les partenaires, la séance a été levée.', 'Parce que faute d’accord entre les partenaires, la séance a été levée.', 'Faute que les partenaires s’accordent, la séance a été levée.', 'En raison faute d’accord, la séance a été levée.']),
      mc(P.word, ['Lors de', 'Pendant que', 'Malgré', 'Faute de'], { fr: '___ la présentation du bilan, plusieurs actionnaires ont exprimé leurs réserves.' }),
      gap(P.complete, '___ (bien que l’effectif ait baissé), l’équipe a assuré le service ___ (grâce à son efficacité).', ['Malgré la baisse de l’effectif', 'grâce à son efficacité'], { choices: [['Malgré la baisse de l’effectif', 'En raison de la baisse de l’effectif', 'Faute de la baisse de l’effectif'], ['grâce à son efficacité', 'à cause de son efficacité', 'en dépit de son efficacité']] }),
      write(b('Condense into C1 nominal style.', 'Condensez en style nominal C1.'), b('Rewrite this paragraph (45–80 words) using nominalisation and prepositions (lors de, faute de, en dépit de, grâce à): « Quand l’usine a fermé, cent salariés ont perdu leur emploi. Bien que la mairie ait proposé des aides, le projet n’a pas démarré parce qu’il manquait des investisseurs. »', 'Réécrivez ce passage (45–80 mots) avec nominalisations et prépositions (lors de, faute de, en dépit de, grâce à) : « Quand l’usine a fermé, cent salariés ont perdu leur emploi. Bien que la mairie ait proposé des aides, le projet n’a pas démarré parce qu’il manquait des investisseurs. »'), 45, 85, [
        b('At least three nominalised verbs or adjectives', 'Au moins trois verbes ou adjectifs nominalisés'),
        b('Use of lors de, en dépit de / malgré, faute de', 'Emploi de lors de, en dépit de / malgré, faute de'),
        b('Formal C1 tone without heavy subordinate clauses', 'Ton soutenu C1 sans lourdes subordonnées'),
      ], 'Lors de la fermeture de l’usine, la suppression de cent emplois a fragilisé le bassin local. En dépit de la proposition d’aides municipales et de la rapidité de la réaction publique, le redémarrage de l’activité demeure impossible faute d’investisseurs. Seule l’arrivée prochaine de capitaux privés permettra une relance durable du site.'),
    ],
    [
      b('Replace causal/concessive/temporal clauses with en raison de, faute de, en dépit de, lors de, dès.', 'Remplacez les subordonnées par en raison de, faute de, en dépit de, lors de, dès.'),
      b('Faute de + noun without article = for lack of (faute de temps, faute de preuves).', 'Faute de + nom sans article = par manque de (faute de temps, faute de preuves).'),
      b('Nominalisation boosts concision and objectivity in C1 syntheses.', 'La nominalisation renforce la concision et l’objectivité des synthèses C1.'),
    ],
    [['faute de', b('for lack of', 'par manque de')], ['en dépit de', b('in spite of', 'malgré')], ['préalablement à', b('prior to', 'avant')]],
  ),
];
