import type { CourseAbout } from '../../types';
import { b, card, conj, dict, doc, gap, hear, lesson, mc, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Il ouvrit la porte, elle comprit, ils vinrent. The passé simple is the tense of written narration: novels, tales, biographies and history books. You will rarely say it, but you need to recognise it at once to read French literature, and to use it in a formal story. This course trains the three families of endings, the irregular verbs, the passé antérieur that goes with it, and ends with an original tale to read and one to write.',
    'Il ouvrit la porte, elle comprit, ils vinrent. Le passé simple est le temps du récit écrit : romans, contes, biographies et livres d’histoire. Vous le direz rarement, mais il faut le reconnaître immédiatement pour lire la littérature française, et savoir l’employer dans un récit soutenu. Ce cours entraîne les trois familles de terminaisons, les verbes irréguliers, le passé antérieur qui l’accompagne, et se termine par un conte inédit à lire et un autre à écrire.',
  ),
  outcomes: [
    b('Recognise the passé simple of any verb', 'Reconnaître le passé simple de n’importe quel verbe'),
    b('Conjugate the -a, -i, -u and -in families', 'Conjuguer les familles en -a, -i, -u et -in'),
    b('Use the passé antérieur after dès que, quand', 'Employer le passé antérieur après dès que, quand'),
    b('Write a short story in the literary past', 'Écrire un court récit au passé littéraire'),
  ],
};

const C = 'cj-passe-simple';
const PS = b('passé simple', 'passé simple');

export default [
  lesson(C, 1, ['er-verbs-in-the-passe-simple', 'verbes-en-er-au-passe-simple'],
    b('The -er verbs: il parla, ils parlèrent', 'Les verbes en -er : il parla, ils parlèrent'),
    b('The tense of written stories, starting with the largest family.', 'Le temps des récits écrits, en commençant par la plus grande famille.'),
    [b('Know what the passé simple is for', 'Savoir à quoi sert le passé simple'), b('Conjugate -er verbs and aller', 'Conjuguer les verbes en -er et aller'), b('Recognise the third persons', 'Reconnaître les troisièmes personnes')],
    13,
    [
      card(b('The tense of written stories', 'Le temps des récits écrits'), b('The passé simple tells the events of a written story; in speech, the passé composé replaces it. You will mostly meet the third persons: **il parla, ils parlèrent**. For -er verbs and **aller**, the endings: **-ai, -as, -a, -âmes, -âtes, -èrent**.', 'Le passé simple raconte les événements d’un récit écrit ; à l’oral, le passé composé le remplace. Vous rencontrerez surtout les troisièmes personnes : **il parla, ils parlèrent**. Pour les verbes en -er et **aller**, les terminaisons : **-ai, -as, -a, -âmes, -âtes, -èrent**.'), {
        table: {
          head: ['', 'parler', 'aller', 'commencer'],
          rows: [['je / j’', 'parlai', 'allai', 'commençai'], ['tu', 'parlas', 'allas', 'commenças'], ['il / elle', 'parla', 'alla', 'commença'], ['nous', 'parlâmes', 'allâmes', 'commençâmes'], ['vous', 'parlâtes', 'allâtes', 'commençâtes'], ['ils / elles', 'parlèrent', 'allèrent', 'commencèrent']],
        },
        ex: [['Il entra, salua tout le monde et s’assit près du feu.', 'He came in, greeted everyone and sat down by the fire.'], ['Les enfants regardèrent le ciel et attendirent.', 'The children looked at the sky and waited.']],
      }),
      trap(b('Cedilla, e and grave accent', 'Cédille, e et accent grave'), b('Before a, the -cer and -ger verbs keep their sound: **il commença, il mangea**. The third person plural takes a grave accent: **ils parlèrent, ils mangèrent**, and **ils commencèrent** has no cedilla (e follows).', 'Devant a, les verbes en -cer et -ger gardent leur son : **il commença, il mangea**. La troisième personne du pluriel prend un accent grave : **ils parlèrent, ils mangèrent**, et **ils commencèrent** n’a pas de cédille (un e suit).')),
      conj('chanter', PS, [['je', 'chantai'], ['tu', 'chantas'], ['il / elle', 'chanta'], ['nous', 'chantâmes'], ['vous', 'chantâtes'], ['ils / elles', 'chantèrent']], { given: [0] }),
      mc(P.form, ['entra', 'entrait', 'entré', 'entrèrent'], { fr: 'Soudain, un inconnu ___ dans la pièce.' }),
      mc(P.form, ['marchèrent', 'marchâmes', 'marchent', 'marchérent'], { fr: 'Les voyageurs ___ toute la nuit et arrivèrent à l’aube.' }),
      pairs(b('Match the passé simple with the passé composé.', 'Associez le passé simple au passé composé.'), [['il parla', 'il a parlé'], ['elle commença', 'elle a commencé'], ['ils allèrent', 'ils sont allés'], ['il mangea', 'il a mangé'], ['elles arrivèrent', 'elles sont arrivées'], ['il tomba', 'il est tombé']], true),
      gap(P.complete, 'Elle ___ (regarder) longtemps la mer, puis elle ___ (soupirer). Ses amis ___ (rester) silencieux.', [['regarda'], ['soupira'], ['restèrent']]),
      hear('Le prince monta sur son cheval et quitta le château.', b('Which tense do you hear?', 'Quel temps entendez-vous ?'), [b('Passé simple: the tense of written stories', 'Passé simple : le temps des récits écrits'), b('Passé composé', 'Passé composé'), b('Imparfait', 'Imparfait')]),
      dict('Le prince monta sur son cheval et quitta le château avant l’aube.'),
      say('Il était une fois un roi qui aimait la musique. Un jour, il organisa un grand concours.', 'Once upon a time there was a king who loved music. One day, he organised a great contest.'),
    ],
    [
      b('Passé simple: events of a written story (speech uses the passé composé).', 'Passé simple : événements d’un récit écrit (l’oral emploie le passé composé).'),
      b('-er and aller: -ai, -as, -a, -âmes, -âtes, -èrent.', '-er et aller : -ai, -as, -a, -âmes, -âtes, -èrent.'),
      b('il commença, il mangea; ils parlèrent (grave accent).', 'il commença, il mangea ; ils parlèrent (accent grave).'),
    ],
    [['saluer', b('to greet', 'dire bonjour')], ['l’aube', b('dawn', 'le lever du jour')], ['soupirer', b('to sigh', 'respirer longuement par lassitude')]],
  ),

  lesson(C, 2, ['i-u-and-in-forms', 'formes-en-i-u-et-in'],
    b('The -i, -u and -in forms', 'Les formes en -i, -u et -in'),
    b('Il finit, il prit, il fut, il eut, il fit, il vint: the irregular verbs of every story.', 'Il finit, il prit, il fut, il eut, il fit, il vint : les irréguliers de chaque récit.'),
    [b('Recognise the -i, -u and -in families', 'Reconnaître les familles en -i, -u et -in'), b('Know être, avoir, faire and venir', 'Connaître être, avoir, faire et venir'), b('Tell il finit (present) from ils finirent', 'Distinguer il finit (présent) de ils finirent')],
    13,
    [
      card(b('Three more families', 'Trois autres familles'), b('The other verbs end in -i, -u or -in. In -i: **finir → il finit, prendre → il prit, mettre → il mit, dire → il dit, faire → il fit, voir → il vit**. In -u: **être → il fut, avoir → il eut, pouvoir → il put, vouloir → il voulut, savoir → il sut, lire → il lut, vivre → il vécut**. In -in: **venir → il vint, tenir → il tint**.', 'Les autres verbes se terminent en -i, -u ou -in. En -i : **finir → il finit, prendre → il prit, mettre → il mit, dire → il dit, faire → il fit, voir → il vit**. En -u : **être → il fut, avoir → il eut, pouvoir → il put, vouloir → il voulut, savoir → il sut, lire → il lut, vivre → il vécut**. En -in : **venir → il vint, tenir → il tint**.'), {
        table: {
          head: ['', 'être', 'avoir', 'faire', 'venir'],
          rows: [['je / j’', 'fus', 'eus', 'fis', 'vins'], ['tu', 'fus', 'eus', 'fis', 'vins'], ['il / elle', 'fut', 'eut', 'fit', 'vint'], ['nous', 'fûmes', 'eûmes', 'fîmes', 'vînmes'], ['vous', 'fûtes', 'eûtes', 'fîtes', 'vîntes'], ['ils / elles', 'furent', 'eurent', 'firent', 'vinrent']],
        },
      }),
      trap(b('Il finit: present or passé simple?', 'Il finit : présent ou passé simple ?'), b('For many -ir and -re verbs, the singular looks like the present: **il finit, il dit, il lit** can be either. The context decides (a story in the past), and the plural shows the difference: **ils finissent** (present), **ils finirent** (passé simple).', 'Pour beaucoup de verbes en -ir et en -re, le singulier ressemble au présent : **il finit, il dit, il lit** peuvent être l’un ou l’autre. Le contexte décide (un récit au passé), et le pluriel montre la différence : **ils finissent** (présent), **ils finirent** (passé simple).')),
      conj('être', PS, [['je', 'fus'], ['tu', 'fus'], ['il / elle', 'fut'], ['nous', 'fûmes'], ['vous', 'fûtes'], ['ils / elles', 'furent']], { given: [0] }),
      conj('prendre', PS, [['je', 'pris'], ['tu', 'pris'], ['il / elle', 'prit'], ['nous', 'prîmes'], ['vous', 'prîtes'], ['ils / elles', 'prirent']], { given: [0] }),
      pairs(b('Match each infinitive with its passé simple.', 'Associez chaque infinitif à son passé simple.'), [['avoir', 'il eut'], ['être', 'il fut'], ['faire', 'il fit'], ['voir', 'il vit'], ['venir', 'il vint'], ['savoir', 'il sut']], true),
      mc(P.form, ['dut', 'devit', 'dua', 'dû'], { fr: 'Le messager ___ partir sur-le-champ.' }),
      mc(P.form, ['vinrent', 'venirent', 'vînrent', 'vinèrent'], { fr: 'Le lendemain, ses amis ___ le chercher.' }),
      gap(P.complete, 'Ils ___ (faire) leurs adieux et ___ (prendre) la route du nord.', [['firent'], ['prirent']]),
      hear('Elle sut tout de suite que quelque chose avait changé.', b('Which verb is « sut »?', 'De quel verbe vient « sut » ?'), ['savoir', 'suivre', 'être']),
      dict('Ils vinrent nous voir au printemps et restèrent jusqu’à l’été.'),
      say('Il fut le premier à comprendre ce qui se passait.', 'He was the first to understand what was happening.'),
    ],
    [
      b('-i: il finit, il prit, il fit, il dit, il vit, il mit.', '-i : il finit, il prit, il fit, il dit, il vit, il mit.'),
      b('-u: il fut, il eut, il put, il voulut, il sut, il lut, il vécut.', '-u : il fut, il eut, il put, il voulut, il sut, il lut, il vécut.'),
      b('-in: il vint, ils vinrent; il tint, ils tinrent.', '-in : il vint, ils vinrent ; il tint, ils tinrent.'),
    ],
    [['sur-le-champ', b('at once', 'immédiatement')], ['faire ses adieux', b('to say goodbye', 'dire au revoir avant de partir')], ['le lendemain', b('the next day', 'le jour suivant')]],
  ),

  lesson(C, 3, ['passe-anterieur-and-narration', 'passe-anterieur-et-recit'],
    b('The passé antérieur and literary narration', 'Le passé antérieur et le récit littéraire'),
    b('Dès qu’il eut fini, il sortit. And the imparfait for the background.', 'Dès qu’il eut fini, il sortit. Et l’imparfait pour le décor.'),
    [b('Form the passé antérieur', 'Former le passé antérieur'), b('Use it after dès que, quand, lorsque', 'L’employer après dès que, quand, lorsque'), b('Combine passé simple and imparfait', 'Combiner passé simple et imparfait')],
    13,
    [
      card(b('Just before, in a literary story', 'Juste avant, dans un récit littéraire'), b('The **passé antérieur** is the auxiliary in the passé simple + the participle: **il eut fini, elle fut partie, ils se furent assis**. It marks an action completed just before another one in the passé simple, after **quand, lorsque, dès que, après que, aussitôt que**: **Dès qu’il eut fini, il sortit.** **Quand elle fut partie, il ferma la porte.**', 'Le **passé antérieur**, c’est l’auxiliaire au passé simple + le participe : **il eut fini, elle fut partie, ils se furent assis**. Il marque une action achevée juste avant une autre au passé simple, après **quand, lorsque, dès que, après que, aussitôt que** : **Dès qu’il eut fini, il sortit.** **Quand elle fut partie, il ferma la porte.**')),
      card(b('The roles in a literary story', 'Les rôles dans un récit littéraire'), b('A written story works like a spoken one, with literary tenses. Events: passé simple (**il ouvrit la fenêtre**). Background: imparfait (**la ville dormait**). Earlier: plus-que-parfait (**il avait plu toute la nuit**). Just before an event: passé antérieur (**dès qu’il eut mangé**).', 'Un récit écrit fonctionne comme un récit oral, avec des temps littéraires. Événements : passé simple (**il ouvrit la fenêtre**). Décor : imparfait (**la ville dormait**). Antériorité : plus-que-parfait (**il avait plu toute la nuit**). Juste avant un événement : passé antérieur (**dès qu’il eut mangé**).')),
      sort(b('Background or event?', 'Décor ou événement ?'), [b('background: imparfait', 'décor : imparfait'), b('event: passé simple', 'événement : passé simple')], [['il faisait froid', 0], ['il ouvrit la fenêtre', 1], ['la ville dormait', 0], ['un cri retentit', 1], ['elle était seule', 0], ['elle descendit l’escalier', 1]]),
      mc(P.form, ['eut lu', 'avait lu', 'lut', 'a lu'], { fr: 'Dès qu’elle ___ la lettre, elle la déchira.' }),
      mc(P.form, ['furent partis', 'eurent partis', 'furent parti', 'étaient partir'], { fr: 'Lorsque les invités ___, la maison retrouva son calme.' }),
      gap(P.complete, 'Quand il ___ (terminer) son repas, il ___ (aller) se coucher.', [['eut terminé'], ['alla']]),
      hear('Aussitôt qu’il eut reçu la nouvelle, il partit pour Paris.', b('What happened first?', 'Qu’est-ce qui s’est passé en premier ?'), [b('He received the news', 'Il a reçu la nouvelle'), b('He left for Paris', 'Il est parti pour Paris'), b('Both at once', 'Les deux en même temps')]),
      dict('Il pleuvait depuis le matin. Quand le facteur fut reparti, elle ouvrit enfin la lettre.'),
      say('La nuit tombait quand ils arrivèrent enfin au village.', 'Night was falling when they finally reached the village.'),
    ],
    [
      b('Passé antérieur = auxiliary in the passé simple + participle (il eut fini).', 'Passé antérieur = auxiliaire au passé simple + participe (il eut fini).'),
      b('After dès que, quand, lorsque + a main verb in the passé simple.', 'Après dès que, quand, lorsque + un verbe principal au passé simple.'),
      b('Literary roles: passé simple, imparfait, plus-que-parfait, passé antérieur.', 'Rôles littéraires : passé simple, imparfait, plus-que-parfait, passé antérieur.'),
    ],
    [['déchirer', b('to tear up', 'mettre en morceaux')], ['retentir', b('to ring out', 'se faire entendre fort')], ['un facteur', b('a postman', 'la personne qui distribue le courrier')]],
  ),

  lesson(C, 4, ['reading-and-writing-a-tale', 'lire-et-ecrire-un-conte'],
    b('Reading and writing a tale', 'Lire et écrire un conte'),
    b('An original tale to read, then your own story in the literary past.', 'Un conte inédit à lire, puis votre propre récit au passé littéraire.'),
    [b('Read a text in the passé simple fluently', 'Lire couramment un texte au passé simple'), b('Convert it to spoken tenses', 'Le convertir aux temps de l’oral'), b('Write a short tale', 'Écrire un court conte')],
    13,
    [
      tip(b('Reading strategy', 'Stratégie de lecture'), b('When a form looks unknown, check the ending of the third person. Endings: **-a, -èrent, -it, -irent, -ut, -urent, -int, -inrent**. Then think of the infinitive and translate mentally into the passé composé: **il prit = il a pris**, **ils durent = ils ont dû**.', 'Quand une forme paraît inconnue, regardez la terminaison de la troisième personne. Terminaisons : **-a, -èrent, -it, -irent, -ut, -urent, -int, -inrent**. Pensez ensuite à l’infinitif et traduisez mentalement au passé composé : **il prit = il a pris**, **ils durent = ils ont dû**.')),
      doc({ title: 'Le gardien du phare', text: 'Ce soir-là, la tempête soufflait sur la côte depuis des heures. Le vieux gardien monta l’escalier du phare et alluma la grande lampe. Soudain, il aperçut une barque qui luttait contre les vagues. Il prit sa lanterne, descendit sur les rochers et cria de toutes ses forces. Les pêcheurs le virent, changèrent de cap et rentrèrent au port sains et saufs. Dès qu’ils eurent amarré leur bateau, ils vinrent remercier le vieil homme.', look: 'page' }, b('What did the fishermen do once their boat was moored?', 'Que firent les pêcheurs une fois leur bateau amarré ?'), [b('They came to thank the old keeper', 'Ils vinrent remercier le vieux gardien'), b('They went back to sea', 'Ils repartirent en mer'), b('They lit the lamp', 'Ils allumèrent la lampe'), b('They called for help', 'Ils appelèrent à l’aide')]),
      mc(b('Which is the spoken version?', 'Quelle est la version orale ?'), ['Les pêcheurs l’ont vu et ont changé de cap.', 'Les pêcheurs le voyaient et changeaient de cap.', 'Les pêcheurs le verront et changeront de cap.', 'Les pêcheurs l’avaient vu et changeaient de cap.'], { fr: 'Les pêcheurs le virent et changèrent de cap.' }),
      sort(b('Which family of endings?', 'Quelle famille de terminaisons ?'), ['-a / -èrent', '-it / -irent', '-ut / -urent', '-int / -inrent'], [['il monta', 0], ['il aperçut', 2], ['il prit', 1], ['ils vinrent', 3], ['ils changèrent', 0], ['ils durent', 2], ['elle descendit', 1], ['il tint', 3]]),
      write(b('Your tale', 'Votre conte'), b('In 50 to 80 words, write the beginning of a tale. Set the scene in the imparfait, then tell at least four events in the passé simple. Start with « Il était une fois… » or « Ce matin-là… ».', 'En 50 à 80 mots, écrivez le début d’un conte. Posez le décor à l’imparfait, puis racontez au moins quatre événements au passé simple. Commencez par « Il était une fois… » ou « Ce matin-là… ».'), 50, 80, [
        b('A setting in the imparfait', 'Un décor à l’imparfait'),
        b('Four events in the passé simple', 'Quatre événements au passé simple'),
        b('At least one irregular verb (fit, prit, vint, fut…)', 'Au moins un verbe irrégulier (fit, prit, vint, fut…)'),
      ], 'Il était une fois une jeune boulangère qui vivait au bord d’une forêt. Chaque matin, elle cuisait du pain pour tout le village. Un jour d’hiver, un renard blessé frappa à sa porte. Elle le soigna, lui donna du pain chaud et le laissa dormir près du four. Le lendemain, le renard disparut, mais il revint au printemps avec un étrange cadeau.'),
      dict('Le lendemain, le renard disparut, mais il revint au printemps.'),
      say('Il prit sa lanterne, descendit sur les rochers et cria de toutes ses forces.', 'He took his lantern, went down onto the rocks and shouted with all his strength.'),
    ],
    [
      b('Reading: identify the ending, find the infinitive, think in the passé composé.', 'Lecture : repérer la terminaison, trouver l’infinitif, penser au passé composé.'),
      b('Spoken version: passé simple → passé composé.', 'Version orale : passé simple → passé composé.'),
      b('A tale: imparfait for the setting, passé simple for the events.', 'Un conte : imparfait pour le décor, passé simple pour les événements.'),
    ],
    [['un phare', b('a lighthouse', 'une tour lumineuse pour les bateaux')], ['changer de cap', b('to change course', 'changer de direction')], ['amarrer', b('to moor', 'attacher un bateau au quai')]],
  ),
];
