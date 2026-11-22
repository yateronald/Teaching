import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Magazine profiles and biographies compress an entire life into a few paragraphs, jumping between childhood, turning points and lasting legacy. At B1, you need to keep track of chronology even when the text switches between past tenses and the narrative present, or flashes back before moving forward. This course trains you to follow timelines, identify turning points and understand how French portraits evaluate achievements.',
    'Les portraits de presse et biographies condensent toute une vie en quelques paragraphes, passant de l’enfance aux tournants décisifs puis à l’héritage laissé. Au niveau B1, il faut suivre la chronologie même lorsque le texte mêle temps du passé et présent de narration, ou revient en arrière. Ce cours vous entraîne à reconstruire un parcours, repérer les moments clés et comprendre comment un portrait évalue une œuvre.',
  ),
  outcomes: [
    b('Follow life timelines across past tenses and narrative present', 'Suivre une chronologie entre temps du passé et présent de narration'),
    b('Spot turning points and unexpected career changes', 'Repérer les tournants décisifs et reconversions'),
    b('Understand verbs of overcoming obstacles and founding projects', 'Comprendre les verbes d’obstacle, de rebond et de création'),
    b('Identify achievements, awards and lasting legacy', 'Identifier réalisations, distinctions et transmission'),
  ],
};

const BIO_1: Doc = { look: 'article', title: b('Profile — Science', 'Portrait — Sciences'), text: 'Claire Delacroix : une vie tournée vers l’océan\n\nNée à Brest en 1978, Claire Delacroix grandit au bord de l’Atlantique auprès d’un père marin-pêcheur. Dès son plus jeune âge, elle passe des heures à observer les marées. Après des études de biologie marine à Marseille, elle obtient son doctorat en 2005 et embarque aussitôt pour trois campagnes en Arctique. C’est en 2012, après avoir découvert une nouvelle espèce de corail d’eau froide, qu’elle acquiert une reconnaissance internationale. Aujourd’hui, elle dirige un laboratoire consacré à la protection des grands fonds.' };
const BIO_2: Doc = { look: 'article', title: b('Profile — Arts', 'Portrait — Culture'), text: 'Karim Mansouri : de la mécanique à la scène\n\nRien ne prédestinait Karim Mansouri au théâtre. Pendant dix ans, il travaille comme mécanicien dans le garage familial à Lyon. Tout bascule en 2014 lorsqu’un accident de moto l’oblige à interrompre son métier durant huit mois. Immobilisé, il s’inscrit presque par hasard à un atelier d’écriture de quartier. Contre toute attente, sa première pièce, inspirée de l’atelier, remporte un franc succès au festival d’Avignon. Il renonce alors définitivement aux moteurs pour fonder sa propre compagnie.' };
const BIO_3: Doc = { look: 'article', title: b('Profile — Innovation', 'Portrait — Innovation'), text: 'Amadou Diallo : réinventer l’agriculture urbaine\n\nInstallé à Montréal après un parcours entre Dakar et Toulouse, l’agronome Amadou Diallo a marqué son secteur par une idée simple : transformer les toits plats des entrepôts en potagers productifs. Lauréat de plusieurs prix écologiques, il est aujourd’hui reconnu pour ses serres à faible consommation d’eau. Mais sa plus grande fierté reste la transmission : depuis cinq ans, son association forme chaque été des dizaines de jeunes entrepreneurs à l’agriculture durable.' };

const C = 'r-biographies';
export default [
  lesson(C, 1, ['life-timelines-and-origins', 'parcours-et-origines'],
    b('Timelines, origins and narrative present', 'Chronologie, origines et présent de narration'),
    b('Reconstruct the order of life events when a profile uses the present tense for the past.', 'Reconstruire l’ordre des événements quand un portrait emploie le présent de narration.'),
    [b('Follow chronological markers (dès, après, en…)', 'Suivre les repères chronologiques'), b('Recognise the narrative present', 'Reconnaître le présent de narration'), b('Distinguish early life from adult career', 'Distinguer enfance et carrière')],
    13,
    [
      tip(b('The narrative present in French', 'Le présent de narration'), b('French biographies often tell past events in the **present tense** to make them vivid: **Née en 1978, elle grandit à Brest, obtient son doctorat en 2005 et embarque…** Always look at dates and connectors (**dès son plus jeune âge**, **après des études de**, **aussitôt**) to build the real timeline.', 'Les biographies françaises racontent souvent le passé au **présent** pour le rendre vivant : **Née en 1978, elle grandit à Brest, obtient son doctorat en 2005…** Repérez dates et marqueurs (**dès son plus jeune âge**, **après des études de**, **aussitôt**) pour suivre la chronologie.')),
      doc(BIO_1, b('Where did Claire Delacroix study marine biology?', 'Où Claire Delacroix a-t-elle étudié la biologie marine ?'), [b('In Marseille', 'À Marseille'), b('In Brest', 'À Brest'), b('In the Arctic', 'En Arctique'), b('In Lyon', 'À Lyon')]),
      doc(BIO_1, b('Which event happened FIRST?', 'Quel événement s’est produit EN PREMIER ?'), [b('She earned her doctorate.', 'Elle a obtenu son doctorat.'), b('She sailed on Arctic expeditions.', 'Elle est partie en Arctique.'), b('She discovered a cold-water coral.', 'Elle a découvert un corail d’eau froide.'), b('She became director of a laboratory.', 'Elle dirige un laboratoire.')]),
      doc(BIO_1, b('What made her internationally known in 2012?', 'Qu’est-ce qui l’a fait connaître internationalement en 2012 ?'), [b('Discovering a new cold-water coral species', 'La découverte d’une nouvelle espèce de corail d’eau froide'), b('Her father’s fishing boat', 'Le bateau de son père'), b('Teaching in Marseille', 'Son enseignement à Marseille'), b('Writing a book about tides', 'Un livre sur les marées')]),
      pairs(P.match, [['dès son plus jeune âge', b('from a very early age', 'tout enfant')], ['obtenir un doctorat', b('to earn a PhD', 'réussir une thèse')], ['aussitôt', b('immediately afterwards', 'tout de suite')], ['consacré à', b('dedicated to', 'voué à')]]),
      gap(P.complete, '___ à Brest, elle grandit près de la mer et ___ aujourd’hui un laboratoire.', ['Née', 'dirige']),
      dict('Après ses études à Marseille, elle embarque aussitôt pour trois campagnes.', { voice: 'f' }),
    ],
    [
      b('French portraits often use the present tense for past milestones.', 'Les portraits utilisent souvent le présent pour des faits passés.'),
      b('Time markers: dès son plus jeune âge, après des études de, aussitôt.', 'Repères : dès son plus jeune âge, après des études de, aussitôt.'),
      b('Track dates (1978, 2005, 2012) to verify the order.', 'Suivez les dates (1978, 2005, 2012) pour vérifier l’ordre.'),
    ],
    [['une marée', b('a tide', 'mouvement de la mer')], ['un parcours', b('a life path, career', 'chemin suivi')], ['une reconnaissance', b('recognition', 'fait d’être reconnu')]],
  ),
  lesson(C, 2, ['turning-points-and-obstacles', 'tournants-et-obstacles'],
    b('Turning points and career shifts', 'Tournants décisifs et reconversions'),
    b('Identify what changed a life path and how obstacles led to new directions.', 'Repérer ce qui fait basculer un parcours et comment naît une nouvelle voie.'),
    [b('Spot turning-point expressions (tout bascule, contre toute attente)', 'Repérer les marqueurs de tournant'), b('Understand cause and unexpected change', 'Comprendre cause et changement imprévu'), b('Use verbs of renouncing and founding', 'Comprendre renoncer à, fonder')],
    13,
    [
      card(b('Words of change and resilience', 'Mots du tournant et du rebond'), b('**Rien ne prédestinait X à…** = nothing pointed X toward… · **Tout bascule lorsque…** = everything changes when… · **Contre toute attente** = against all odds · **Par hasard** = by chance · **Renoncer à** = to give up · **Fonder** = to found.', '**Rien ne prédestinait X à…** · **Tout bascule lorsque…** · **Contre toute attente** · **Par hasard** · **Renoncer à** · **Fonder**.')),
      doc(BIO_2, b('What was Karim Mansouri’s job before 2014?', 'Quel était le métier de Karim Mansouri avant 2014 ?'), [b('A mechanic in the family garage', 'Mécanicien dans le garage familial'), b('A theatre director', 'Metteur en scène'), b('A festival organiser', 'Organisateur de festival'), b('A writing teacher', 'Professeur d’écriture')]),
      doc(BIO_2, b('How did he discover writing?', 'Comment a-t-il découvert l’écriture ?'), [b('By joining a local workshop while recovering from an accident', 'En s’inscrivant à un atelier de quartier pendant sa convalescence'), b('Through university literature studies', 'Grâce à des études universitaires'), b('By watching plays in Avignon', 'En regardant des pièces à Avignon'), b('Because his father was a writer', 'Parce que son père était écrivain')]),
      doc(BIO_2, b('What happened to his first play?', 'Qu’est-il arrivé à sa première pièce ?'), [b('It was unexpectedly very successful in Avignon.', 'Elle a connu un grand succès à Avignon, contre toute attente.'), b('It failed and he went back to the garage.', 'Elle a échoué et il est retourné au garage.'), b('It was never staged.', 'Elle n’a jamais été jouée.'), b('It was written in English.', 'Elle était écrite en anglais.')]),
      sort(b('Early life or turning point?', 'Situation initiale ou tournant ?'), [b('before the shift', 'avant le tournant'), b('the turning point', 'le tournant')], [['Rien ne le prédestinait au théâtre.', 0], ['Tout bascule en 2014.', 1], ['Il travaille dix ans au garage.', 0], ['Contre toute attente, sa pièce réussit.', 1], ['Il renonce définitivement aux moteurs.', 1]]),
      mc(P.meaning, [b('to give up something', 'abandonner quelque chose'), b('to buy something new', 'acheter quelque chose'), b('to repair slowly', 'réparer lentement'), b('to return to the past', 'revenir en arrière')], { fr: 'renoncer à' }),
      gap(P.complete, 'Tout ___ lorsqu’un accident l’oblige à interrompre son métier ; contre toute ___, il devient auteur.', ['bascule', 'attente']),
    ],
    [
      b('Turning point: Tout bascule lorsque…, Contre toute attente…', 'Tournant : Tout bascule lorsque…, Contre toute attente…'),
      b('Rien ne le prédestinait à… introduces an unexpected career shift.', 'Rien ne le prédestinait à… annonce une reconversion inattendue.'),
      b('Renoncer à = give up; fonder = establish.', 'Renoncer à = abandonner ; fonder = créer.'),
    ],
    [['basculer', b('to shift suddenly', 'changer brutalement')], ['par hasard', b('by chance', 'sans l’avoir prévu')], ['fonder', b('to found', 'créer durablement')]],
  ),
  lesson(C, 3, ['legacy-and-achievements', 'heritage-et-reussites'],
    b('Achievements and lasting legacy', 'Réalisations, prix et transmission'),
    b('Understand how profiles highlight impact, awards and mentoring.', 'Comprendre comment un portrait souligne l’impact, les prix et la transmission.'),
    [b('Recognise achievement verbs (marquer, réinventer)', 'Reconnaître les verbes de réussite'), b('Understand awards and recognition (lauréat, reconnu)', 'Comprendre distinctions et notoriété'), b('Follow what a person values most', 'Saisir ce qui compte le plus pour la personne')],
    13,
    [
      card(b('Impact and recognition', 'Impact et reconnaissance'), b('**Marquer son secteur / son époque** = leave a mark on one’s field / era · **Lauréat(e) d’un prix** = award winner · **Être reconnu pour** = be known for · **La transmission** = passing knowledge on · **Former la relève** = train the next generation.', '**Marquer son secteur / son époque** · **Lauréat(e) d’un prix** · **Être reconnu pour** · **La transmission** · **Former la relève**.')),
      doc(BIO_3, b('Where do Amadou Diallo’s vegetable gardens grow?', 'Où poussent les potagers d’Amadou Diallo ?'), [b('On the flat roofs of warehouses', 'Sur les toits plats d’entrepôts'), b('Inside school classrooms', 'Dans des salles de classe'), b('Along railway tracks', 'Le long des voies ferrées'), b('On boats on the river', 'Sur des bateaux sur le fleuve')]),
      doc(BIO_3, b('What are his greenhouses especially known for?', 'Pour quoi ses serres sont-elles particulièrement reconnues ?'), [b('Using very little water', 'Leur faible consommation d’eau'), b('Growing tropical flowers only', 'La culture exclusive de fleurs'), b('Costing nothing to build', 'Leur construction gratuite'), b('Working without sunlight', 'Leur fonctionnement sans lumière')]),
      doc(BIO_3, b('What is Amadou Diallo proudest of?', 'De quoi Amadou Diallo est-il le plus fier ?'), [b('Training young entrepreneurs in sustainable farming', 'Former de jeunes entrepreneurs à l’agriculture durable'), b('Winning ecological awards', 'Avoir gagné des prix écologiques'), b('Moving to Toulouse', 'Avoir vécu à Toulouse'), b('Building big warehouses', 'Construire de grands entrepôts')]),
      pairs(P.match, [['lauréat d’un prix', b('award winner', 'gagnant d’un prix')], ['marquer son secteur', b('to leave a mark on one’s field', 'transformer son domaine')], ['la transmission', b('passing skills on', 'partager son savoir')], ['durable', b('sustainable', 'respectueux de l’avenir')]]),
      mc(P.meaning, [b('his greatest pride', 'ce dont il est le plus fier'), b('his biggest regret', 'son plus grand regret'), b('his oldest project', 'son plus vieux projet'), b('his first award', 'son premier prix')], { fr: 'sa plus grande fierté' }),
      dict('Lauréat de plusieurs prix, il forme aujourd’hui de jeunes entrepreneurs.', { voice: 'm' }),
    ],
    [
      b('Lauréat = award winner; reconnu pour = known for.', 'Lauréat = gagnant d’un prix ; reconnu pour = célèbre grâce à.'),
      b('Notice contrast words like « Mais sa plus grande fierté reste… ».', 'Repérez les nuances : « Mais sa plus grande fierté reste… ».'),
      b('La transmission = mentoring and passing skills on.', 'La transmission = partager son savoir avec la génération suivante.'),
    ],
    [['un lauréat', b('an award winner', 'personne récompensée par un prix')], ['une serre', b('a greenhouse', 'abri vitré pour plantes')], ['la fierté', b('pride', 'sentiment de satisfaction')]],
  ),
];
