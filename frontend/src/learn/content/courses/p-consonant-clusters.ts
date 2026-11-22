import type { CourseAbout } from '../../types';
import { b, card, dict, gap, hear, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Why does médecin sound like « metsin », absent like « apsan », and anecdote like « anegdote » in natural French? When two consonants meet—often after a silent e drops—one voices or devoices its neighbour automatically. This B1 course explains regressive voicing assimilation, the two sounds of x ([gz] vs [ks]), and how native speakers handle heavy consonant clusters.',
    'Pourquoi médecin sonne-t-il « metsin », absent « apsan » et anecdote « anegdote » à l’oral naturel ? Lorsque deux consonnes se touchent — souvent après la chute d’un e muet — la seconde modifie la vibration de la première. Ce cours B1 explique l’assimilation régressive, les deux sons de x ([gz] et [ks]) et les groupes consonantiques lourds.',
  ),
  outcomes: [
    b('Understand regressive devoicing (médecin [metsɛ̃], absent [apsɑ̃])', 'Comprendre l’assourdissement régressif (médecin, absent, observer)'),
    b('Hear voiced assimilation (anecdote [anɛgdɔt], neuf heures [nœvœʁ])', 'Entendre la sonorisation (anecdote, neuf heures)'),
    b('Distinguish [gz] (examen, exact) from [ks] (taxi, texte, expliquer)', 'Distinguer [gz] (examen, exact) et [ks] (taxi, texte, expliquer)'),
    b('Pronounce final clusters cleanly and understand casual cluster drops', 'Prononcer les groupes finaux et comprendre les allègements familiers'),
  ],
};

const C = 'p-consonant-clusters';
export default [
  lesson(C, 1, ['regressive-voicing-assimilation', 'assimilation-de-voisement'],
    b('Voicing assimilation: médecin [metsɛ̃], absent [apsɑ̃]', 'L’assimilation : médecin [metsɛ̃], absent [apsɑ̃]'),
    b('See how a voiceless consonant pulls a preceding voiced consonant into silence.', 'Voir comment une consonne sourde assourdit la consonne sonore qui précède.'),
    [b('Apply the « second consonant rules » rule', 'Appliquer la règle « la deuxième consonne commande »'), b('Hear devoicing in médecin, absent, observer, tout de suite', 'Entendre l’assourdissement dans médecin, absent, observer, tout de suite'), b('Keep standard spelling intact when writing', 'Conserver l’orthographe standard à l’écrit')],
    13,
    [
      card(b('The second consonant commands', 'La deuxième consonne commande'), b('French avoids pronouncing a **voiced** consonant (**b, d, g, v, z, j**) right before a **voiceless** one (**p, t, k, f, s, ch**). So the **second consonant turns the first one voiceless** (**regressive assimilation**): **absent** (`b`+`s`) → **[apsɑ̃]**, **observer** (`b`+`s`) → **[ɔpsɛʁve]**, **médecin** (`d`+`s` after silent *e*) → **[metsɛ̃]**, **tout de suite** (`d`+`s`) → **[tutsɥit]**.', 'Le français évite de garder une **sonore** (**b, d, g, v, z, j**) juste devant une **sourde** (**p, t, k, f, s, ch**). La **deuxième consonne assourdit la première** (**assimilation régressive**) : **absent** (`b`+`s`) → **[apsɑ̃]**, **observer** (`b`+`s`) → **[ɔpsɛʁve]**, **médecin** (`d`+`s` après e muet) → **[metsɛ̃]**, **tout de suite** (`d`+`s`) → **[tutsɥit]**.'), {
        ex: [['un médecin', '[metsɛ̃]: d before s becomes [t]'], ['absent, observer', '[apsɑ̃], [ɔpsɛʁve]: b before s becomes [p]'], ['je sais pas', '[ʃepa]: j before s becomes [ʃ]']],
      }),
      trap(b('Never write what you assimilate!', 'N’écrivez jamais l’assimilation !'), b('Assimilation is purely a physical shortcut of the vocal cords—never write « *apsent* » or « *métsin* ». Keep the real spelling **absent, médecin, tout de suite, rez-de-chaussée**.', 'L’assimilation est purement physique pour les cordes vocales : n’écrivez jamais « *apsent* » ou « *métsin* ». Gardez **absent, médecin, tout de suite, rez-de-chaussée**.')),
      hear('Le médecin est absent toute la journée, mais son collègue arrive tout de suite.', b('Listen. What sounds do you hear at the clusters in « médecin », « absent » and « tout de suite »?', 'Écoutez. Quels sons ressortent dans « médecin », « absent » et « tout de suite » ?'), [b('médecin [ts], absent [ps], tout de suite [ts]', 'médecin [ts], absent [ps], tout de suite [ts]'), b('A full pronounced vowel [ə] between every consonant', 'Un [ə] bien prononcé entre toutes les consonnes'), b('Voiced [dz] and [bz] with extra throat vibration', 'Des sons [dz] et [bz] très sonores'), b('The middle consonants disappear completely', 'Les consonnes du milieu disparaissent totalement')], { voice: 'm' }),
      sort(b('Devoiced by next consonant or normal voiced b/d?', 'Assourdi par la consonne suivante ou sonore normal ?'), [b('devoiced (b→p / d→t)', 'assourdi (b→p / d→t)'), b('stays voiced (b / d)', 'reste sonore (b / d)')], [['absent', 0], ['un bureau', 1], ['le médecin', 0], ['un objet', 1], ['observer', 0], ['un jardin', 1]], { listen: true }),
      mc(P.choose, [b('[ɔpsɛʁve]: b becomes voiceless [p] before [s]', '[ɔpsɛʁve] : b s’assourdit en [p] devant [s]'), b('[ɔbzɛʁve]: s turns into [z]', '[ɔbzɛʁve] : s devient [z]'), b('[ɔbəsɛʁve]: a schwa is added after b', '[ɔbəsɛʁve] : on ajoute un e entre b et s'), b('[ɔsɛʁve]: b is completely silent', '[ɔsɛʁve] : le b disparaît')], { fr: 'Comment se prononce naturellement « observer » ?' }),
      dict('Le médecin doit observer le patient absent tout de suite.', { voice: 'f' }),
      say('Le médecin absent nous conseille d’observer le calme tout de suite.', 'The absent doctor advises us to observe calm right away.', { tip: b('Let your vocal cords stop naturally into [ts] and [ps]—don’t force an artificial e.', 'Laissez la voix s’arrêter naturellement sur [ts] et [ps], sans forcer de e artificiel.') }),
    ],
    [
      b('Voiced + voiceless → first consonant devoices (b→p, d→t, j→ch).', 'Sonore + sourde → la première s’assourdit (b→p, d→t, j→ch).'),
      b('Classic words: médecin [metsɛ̃], absent [apsɑ̃], observer [ɔpsɛʁve].', 'Mots classiques : médecin [metsɛ̃], absent [apsɑ̃], observer [ɔpsɛʁve].'),
      b('Speech shortcut only: spelling never changes.', 'Phénomène purement oral : l’orthographe reste intacte.'),
    ],
    [['observer', b('to observe, watch', 'regarder attentivement')], ['absent', b('absent, away', 'qui n’est pas là')], ['le rez-de-chaussée', b('the ground floor', 'niveau du sol d’un bâtiment')]],
  ),
  lesson(C, 2, ['voicing-before-voiced-consonants', 'sonorisation-devant-consonne-sonore'],
    b('Voicing spread and the letter x: [gz] vs [ks]', 'Sonorisation et lettre x : [gz] contre [ks]'),
    b('Understand voicing spread in anecdote and the ex- + vowel rule for [gz] vs [ks].', 'Comprendre la sonorisation dans anecdote et la règle ex- + voyelle ([gz] / [ks]).'),
    [b('Hear voicing spread in anecdote [anɛgdɔt] and paquebot', 'Entendre la sonorisation dans anecdote et paquebot'), b('Apply the ex- + vowel → [gz] rule (examen, exact)', 'Appliquer la règle ex- + voyelle → [gz] (examen, exact)'), b('Keep [ks] before consonants and inside words (taxi, texte, expliquer)', 'Garder [ks] devant consonne et en milieu de mot (taxi, texte, expliquer)')],
    13,
    [
      card(b('Voicing spread and x = [gz] vs [ks]', 'Sonorisation et x = [gz] ou [ks]'), b('Sometimes a **voiced** second consonant pulls a voiceless first consonant into vibration: **une anecdote** (`c`+`d` → **[anɛgdɔt]**), **un paquebot** (`qu`+`b` → **[pagbo]**). Even more useful is **x**: word-initial **ex- + vowel (or h)** sounds **[gz]** (**un examen, exact, un exemple, exister, hésiter? no, exhumer**), while **ex- + consonant** or medial **x** sounds **[ks]** (**expliquer, le texte, un taxi, excuser**).', 'Parfois une seconde consonne **sonore** fait vibrer la précédente : **une anecdote** (`c`+`d` → **[anɛgdɔt]**), **un paquebot** (`qu`+`b` → **[pagbo]**). Règle très fiable pour **x** : **ex- initial + voyelle (ou h)** se dit **[gz]** (**un examen, exact, un exemple, exister**), tandis que **ex- + consonne** ou **x** intérieur se dit **[ks]** (**expliquer, le texte, un taxi, excuser**).'), {
        ex: [['un examen, exactement, un exemple', 'ex- + vowel → [gz]'], ['expliquer, un taxi, le texte', 'ex- + consonant / medial → [ks]'], ['une anecdote', '[anɛgdɔt]: c + d → [ɡd]']],
      }),
      hear('Voici un exemple exact pour expliquer le texte de l’examen.', b('Listen. How are « exemple », « exact » and « examen » pronounced vs « expliquer » and « texte »?', 'Écoutez. Comment se prononcent « exemple », « exact » et « examen » face à « expliquer » et « texte » ?'), [b('exemple, exact, examen = [gz]; expliquer, texte = [ks]', 'exemple, exact, examen = [gz] ; expliquer, texte = [ks]'), b('All five words use [ks]', 'Les cinq mots ont [ks]'), b('All five words use [gz]', 'Les cinq mots ont [gz]'), b('exemple, texte = [gz]; examen, expliquer = [ks]', 'exemple, texte = [gz] ; examen, expliquer = [ks]')], { voice: 'f2' }),
      hear('Elle a raconté une anecdote amusante pendant le trajet en taxi.', b('Listen. In « anecdote », what does the c before d sound like?', 'Écoutez. Dans « anecdote », comment sonne le c devant d ?'), [b('Like [ɡ], voiced by the following d', 'Comme [ɡ], sonorisé par le d qui suit'), b('Completely silent', 'Complètement muet'), b('Like [s], hissed', 'Comme un [s] sifflant'), b('With an inserted vowel [ə] after c', 'Avec un [ə] ajouté après c')], { voice: 'm2' }),
      sort(b('Sort by sound of x: [gz] or [ks]?', 'Classez par son du x : [gz] ou [ks] ?'), [b('[gz] (ex- + vowel)', '[gz] (ex- + voyelle)'), b('[ks] (other positions)', '[ks] (autres cas)')], [['un examen', 0], ['un taxi', 1], ['exactement', 0], ['le texte', 1], ['un exemple', 0], ['expliquer', 1]], { listen: true }),
      pairs(b('Match each [gz] word with a contrasting [ks] word.', 'Associez chaque mot en [gz] à un mot contrasté en [ks].'), [['un examen', 'un taxi'], ['exactement', 'le texte'], ['un exemple', 'expliquer'], ['exister', 'excuser']], true),
      dict('C’est un exemple exact pour expliquer cet exercice.', { voice: 'f' }),
      say('L’anecdote exacte de cet examen aide à expliquer tout le texte.', 'The exact anecdote from this exam helps explain the whole text.', { tip: b('Voice [ɡd] in anecdote and [ɡz] in exacte, examen; crisp [ks] in expliquer, texte.', 'Sonorisez [ɡd] dans anecdote et [ɡz] dans exacte, examen ; gardez [ks] net dans expliquer, texte.') }),
    ],
    [
      b('Initial ex- + vowel/h → [gz] (examen, exact, exemple, exercice).', 'ex- initial + voyelle/h → [gz] (examen, exact, exemple, exercice).'),
      b('ex- + consonant or medial x → [ks] (expliquer, texte, taxi).', 'ex- + consonne ou x intérieur → [ks] (expliquer, texte, taxi).'),
      b('Voiced assimilation turns c+d into [ɡd] (anecdote) and qu+b into [ɡb] (paquebot).', 'La sonorisation donne [ɡd] dans anecdote et [ɡb] dans paquebot.'),
    ],
    [['une anecdote', b('an anecdote, short story', 'petit récit réel ou amusant')], ['un exemple', b('an example', 'cas concret qui illustre')], ['expliquer', b('to explain', 'faire comprendre')]],
  ),
  lesson(C, 3, ['simplifying-heavy-clusters', 'alleger-les-groupes-de-consonnes'],
    b('Heavy clusters: quatre, arbre, spectacle', 'Groupes finaux : quatre, arbre, spectacle'),
    b('Pronounce final clusters without adding an extra vowel—and hear casual cluster drops.', 'Prononcer les groupes finaux sans ajouter de voyelle, et comprendre les allègements familiers.'),
    [b('Release final -tr, -br, -cl cleanly without adding « euh »', 'Relâcher -tr, -br, -cl sans ajouter de « euh »'), b('Recognise casual drops (quatre personnes, parce que)', 'Reconnaître les réductions courantes (quatre personnes, parce que)'), b('Adjust cluster clarity to formal vs casual speech', 'Adapter la netteté des groupes au registre')],
    13,
    [
      card(b('Final clusters: careful vs casual', 'Groupes finaux : soigné ou courant'), b('Words like **un arbre, un spectacle, quatre, notre, possible** end in two consonants plus silent **-e**. In **careful speech**, release both consonants softly without adding an extra « euh » vowel after them (avoid *spectacl-euh*). In **casual speech**, when a **consonant** follows right away, speakers often drop the final **l** or **r**: **quatre personnes** → often *[kat pɛʁsɔn]*, **notre voisin** → *[nɔt vwazɛ̃]*, **parce que** → *[paskə]*.', 'Les mots comme **un arbre, un spectacle, quatre, notre, possible** finissent par deux consonnes + **-e** muet. En **français soigné**, on relâche les deux consonnes doucement, sans ajouter de « euh » final. À l’**oral courant** devant une **autre consonne**, le **r** ou **l** final tombe souvent : **quatre personnes** → *[kat pɛʁsɔn]*, **notre voisin** → *[nɔt vwazɛ̃]*, **parce que** → *[paskə]*.'), {
        ex: [['un arbre, un spectacle, notre quartier', 'careful: soft light release'], ['quatre personnes, parce que', 'casual: lightened before consonant']],
      }),
      tip(b('Keep the full cluster before a vowel!', 'Gardez tout le groupe devant une voyelle !'), b('Even casual speakers keep the **r** when a **vowel** follows because it links smoothly: **quatre‿amis [katʁami]**, **notre‿école [nɔtʁekɔl]**!', 'Même à l’oral familier, on garde le **r** devant une **voyelle** pour enchaîner : **quatre‿amis [katʁami]**, **notre‿école [nɔtʁekɔl]** !')),
      hear('Quatre personnes visitent notre quartier, parce que le spectacle a lieu sous un grand arbre.', b('Listen. How does a speaker simplify « parce que » in fast everyday talk?', 'Écoutez. Comment simplifie-t-on souvent « parce que » à l’oral rapide ?'), [b('As [paskə], dropping the r before s', 'En [paskə], en laissant tomber le r devant s'), b('By pronouncing three clear syllables [pa-ʁə-sə-kə]', 'En détachant quatre syllabes [pa-ʁə-sə-kə]'), b('By dropping the p at the start', 'En supprimant le p au début'), b('As [paʁk], dropping ce', 'En [paʁk], en supprimant ce')], { voice: 'f' }),
      mc(P.choose, [b('In « notre ami » (vowel follows), the r links smoothly; in « notre voisin » (consonant), r may drop in casual talk', 'Dans « notre ami » (voyelle), le r s’enchaîne ; dans « notre voisin » (consonne), il tombe souvent en parler familier'), b('The r drops in « notre ami » but stays in « notre voisin »', 'Le r tombe dans « notre ami » mais reste dans « notre voisin »'), b('Both drop the t and keep the r', 'Les deux suppriment le t et gardent le r'), b('Both always insert an extra [ə] vowel after r', 'Les deux ajoutent toujours un [ə] après r')], { fr: 'Quelle différence observe-t-on à l’oral familier entre « notre ami » et « notre voisin » ?' }),
      gap(P.complete, 'Dans un mot comme « un spectacle », il ne faut ___ ajouter de voyelle « euh » après le ___.', ['pas', 'l'], { choices: [['pas', 'plus'], ['l', 's']] }),
      dict('Quatre amis assistent à notre spectacle sous le grand arbre.', { voice: 'm2' }),
      say('Quatre amis observent un spectacle près de notre arbre, parce qu’il fait beau.', 'Four friends watch a show near our tree, because the weather is nice.', { tip: b('Link quatre‿amis and notre‿arbre cleanly; don’t add « euh » after spectacle.', 'Enchaînez quatre‿amis et notre‿arbre sans ajouter de « euh » après spectacle.') }),
    ],
    [
      b('Careful speech: release final -tr, -br, -cl softly without adding « euh ».', 'Soigné : relâchez -tr, -br, -cl doucement sans ajouter de « euh ».'),
      b('Casual speech before a consonant often drops r/l: quatre personnes, parce que.', 'Familier devant consonne : r/l tombe souvent (quatre personnes, parce que).'),
      b('Before a vowel, r always stays and links: quatre‿amis, notre‿école.', 'Devant voyelle, le r reste toujours pour lier : quatre‿amis.'),
    ],
    [['un spectacle', b('a show, performance', 'représentation sur scène')], ['un quartier', b('a neighbourhood', 'secteur d’une ville')], ['un arbre', b('a tree', 'grande plante à tronc')]],
  ),
];
