import type { CourseAbout } from '../../types';
import { b, card, dict, gap, hear, lesson, mc, P, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Nuit, soleil, montagne, travail: French glides (semi-vowels) pack crisp movement into a single syllable. Learners often mispronounce ui as « oui », read travail with a heavy l, or split gn into a hard g + n. This A2 course trains the three French glides [w], [ɥ] and [j], plus the palatal [ɲ] of gn, so your syllables flow effortlessly.',
    'Nuit, soleil, montagne, travail : les semi-voyelles françaises glissent rapidement au cœur d’une seule syllabe. Beaucoup confondent ui et « oui », prononcent le l de travail ou séparent gn en g + n. Ce cours A2 entraîne les trois glissements [w], [ɥ] et [j], ainsi que le [ɲ] de gn, pour des syllabes fluides et naturelles.',
  ),
  outcomes: [
    b('Produce [wa] (oi) and front-rounded [ɥi] (ui) distinctly', 'Produire [wa] (oi) et [ɥi] (ui) sans les confondre'),
    b('Say -ail, -eil, -euil and -ille endings smoothly with yod [j]', 'Prononcer -ail, -eil, -euil et -ille avec un yod [j] fluide'),
    b('Spot the -ille exceptions that keep [l] (ville, mille, tranquille)', 'Repérer les exceptions en -ille qui gardent [l] (ville, mille, tranquille)'),
    b('Articulate palatal [ɲ] (gn) cleanly in montagne and campagne', 'Articuler le [ɲ] palatal (gn) dans montagne et campagne'),
  ],
};

const C = 'p-semi-vowels';
export default [
  lesson(C, 1, ['glides-oi-and-ui', 'glissements-oi-et-ui'],
    b('The glides [wa] (oi) and [ɥi] (ui)', 'Les glissements [wa] (oi) et [ɥi] (ui)'),
    b('Separate back-rounded [w] (moi, oui) from front-rounded [ɥ] (nuit, lui).', 'Distinguer [w] arrière (moi, oui) et [ɥ] avant (nuit, lui).'),
    [b('Produce crisp [wa] for oi (soir, trois, voir)', 'Produire [wa] pour oi (soir, trois, voir)'), b('Glide from [y] to [i] for ui (nuit, pluie, lui)', 'Glisser de [y] à [i] pour ui (nuit, pluie, lui)'), b('Keep Louis [wi] apart from lui [ɥi]', 'Séparer Louis [wi] et lui [ɥi]')],
    13,
    [
      card(b('Two rounded glides: [w] vs [ɥ]', 'Deux glissements arrondis : [w] et [ɥ]'), b('**oi = [wa]** and **oui = [wi]**: start with tight back-rounded lips (like **ou** in *tout*), then open fast to **a** or **i**: **le soir, la voix, oui, Louis**. **ui = [ɥi]**: start from **u** [y] (tongue forward, tight lips like *tu*), then glide straight to **i** in one syllable: **la nuit, la pluie, lui, la cuisine**.', '**oi = [wa]** et **oui = [wi]** : partez de la position **ou** (lèvres très rondes, langue en arrière), puis ouvrez vite sur **a** ou **i** : **le soir, la voix, oui, Louis**. **ui = [ɥi]** : partez de **u** [y] (langue devant, lèvres serrées comme *tu*), puis glissez vers **i** en une syllabe : **la nuit, la pluie, lui, la cuisine**.'), {
        ex: [['le soir, la boîte, trois fois', 'oi = [wa]'], ['la nuit, la pluie, huit heures', 'ui = [ɥi]'], ['Louis, lui', '[lwi] vs [lɥi]']],
      }),
      trap(b('Don’t turn « nuit » into « noui »!', 'Ne dites pas « noui » pour « nuit » !'), b('If your tongue drops back to *ou* in **nuit**, **lui** or **cuisine**, **lui** sounds like **Louis**! Anchor the tongue tip behind the lower teeth like **u**, then zip to **i**.', 'Si la langue recule vers *ou* dans **nuit**, **lui** ou **cuisine**, **lui** sonne comme **Louis** ! Gardez la pointe devant comme pour **u**, puis filez vers **i**.')),
      hear('Il pleut toute la nuit sur la cuisine.', b('Listen. Which glide repeats in « nuit » and « cuisine »?', 'Écoutez. Quel glissement revient dans « nuit » et « cuisine » ?'), [b('[ɥi]: fronted glide ui', '[ɥi] : glissement avant ui'), b('[wa]: glide oi', '[wa] : glissement oi'), b('[ɲ]: palatal gn', '[ɲ] : son gn'), b('[j]: yod ill', '[j] : son yod')], { voice: 'm' }),
      hear('Ce soir, Louis part voir ses amis avec lui.', b('Listen. Are « Louis » and « lui » pronounced the same?', 'Écoutez. « Louis » et « lui » sonnent-ils pareil ?'), [b('No: Louis has [wi], lui has [ɥi]', 'Non : Louis a [wi], lui a [ɥi]'), b('Yes, both have [wi]', 'Oui, tous deux ont [wi]'), b('Yes, both have [wa]', 'Oui, tous deux ont [wa]'), b('No: Louis has [wa], lui has [y]', 'Non : Louis a [wa], lui a [y]')], { voice: 'f2' }),
      sort(b('Sort by glide: [wa] (oi) or [ɥi] (ui)?', 'Classez par glissement : [wa] (oi) ou [ɥi] (ui) ?'), [b('[wa] (oi)', '[wa] (oi)'), b('[ɥi] (ui)', '[ɥi] (ui)')], [['le soir', 0], ['la nuit', 1], ['la voix', 0], ['la pluie', 1], ['la boîte', 0], ['la cuisine', 1]], { listen: true }),
      dict('La pluie tombe toute la nuit, mais il fait beau le soir.', { voice: 'f' }),
      say('Louis et lui cuisinent trois poires ce soir malgré la pluie de la nuit.', 'Louis and he are cooking three pears tonight despite the night rain.', { tip: b('Feel the tongue shift forward from Louis [lwi] to lui [lɥi].', 'Sentez la langue avancer entre Louis [lwi] et lui [lɥi].') }),
    ],
    [
      b('oi = [wa] (soir, trois); oui = [wi] (Louis).', 'oi = [wa] (soir, trois) ; oui = [wi] (Louis).'),
      b('ui = [ɥi]: start with French u [y], glide fast to [i] (nuit, lui).', 'ui = [ɥi] : partez de u [y] puis glissez vers [i] (nuit, lui).'),
      b('Keep Louis [wi] distinct from lui [ɥi].', 'Distinguez bien Louis [wi] et lui [ɥi].'),
    ],
    [['la pluie', b('the rain', 'eau qui tombe du ciel')], ['la cuisine', b('kitchen / cooking', 'pièce où l’on prépare les repas')], ['la boîte', b('the box', 'contenant fermé')]],
  ),
  lesson(C, 2, ['yod-ill-and-ail-eil', 'le-yod-ill-ail-eil'],
    b('The yod [j]: fille, soleil, travail, payer', 'Le yod [j] : fille, soleil, travail, payer'),
    b('Pronounce -ail, -eil, -euil, -ille and vowel + y with a light [j] glide.', 'Prononcer -ail, -eil, -euil, -ille et voyelle + y avec un yod [j] léger.'),
    [b('Drop the written l in travail, soleil, fille', 'Ne pas prononcer le l dans travail, soleil, fille'), b('Spot -ille exceptions that keep [l] (ville, mille, tranquille)', 'Retenir les exceptions en -ille avec [l] (ville, mille, tranquille)'), b('Split medial y cleanly (payer, voyage)', 'Couper correctement le y entre voyelles (payer, voyage)')],
    13,
    [
      card(b('When written l turns into [j]', 'Quand le l écrit devient [j]'), b('After **i** or **vowel + i**, **-il / -ille** is pronounced **[j]** (like the *y* in *yes*)—the **l is silent**: **le travail** [tʁavaj], **le soleil** [sɔlɛj], **un fauteuil** [fotœj], **une grenouille** [ɡʁənuj], **la famille** [famij]. Between vowels, **y = i + j**: **payer** = *pai + yer* [pɛje], **voyager** = *voi + yager*.', 'Après **i** ou **voyelle + i**, **-il / -ille** se dit **[j]** (comme *y* de *yeux*) — le **l ne s’entend pas** : **le travail**, **le soleil**, **un fauteuil**, **une grenouille**, **la famille**. Entre voyelles, **y = i + j** : **payer** [pɛje], **voyager**.'), {
        ex: [['le travail, le soleil, la feuille', '[j] glide, zero [l]'], ['la famille, la fille, habiller', '[ij]'], ['la ville, mille, tranquille', 'exceptions with [l]']],
      }),
      trap(b('Ville, mille, tranquille keep [l]!', 'Ville, mille, tranquille gardent le [l] !'), b('Never turn **la ville** (city) into **la fille** (girl)! Three ultra-common words plus **Lille** keep a clear **[l]**: **la ville, mille, tranquille** (and **le village**).', 'Ne confondez jamais **la ville** et **la fille** ! Retenez les grandes exceptions qui gardent **[l]** : **la ville, mille, tranquille** (et **Lille, le village**).')),
      hear('Toute la famille travaille dans une ville tranquille.', b('Listen. Which words end with [j] and which keep [l]?', 'Écoutez. Quels mots ont [j] et lesquels gardent [l] ?'), [b('famille, travaille = [j]; ville, tranquille = [l]', 'famille, travaille = [j] ; ville, tranquille = [l]'), b('All four words end in [l]', 'Les quatre mots ont le son [l]'), b('All four words end in [j]', 'Les quatre mots ont le son [j]'), b('famille, ville = [l]; travaille, tranquille = [j]', 'famille, ville = [l] ; travaille, tranquille = [j]')], { voice: 'f' }),
      sort(b('Yod [j] or clear [l]?', 'Yod [j] ou [l] clair ?'), [b('yod [j] (no l)', 'yod [j] (sans l)'), b('clear [l]', '[l] clair')], [['le soleil', 0], ['la ville', 1], ['la famille', 0], ['tranquille', 1], ['le travail', 0], ['mille euros', 1]], { listen: true }),
      gap(P.complete, 'Le matin, le sole___ br___e sur la v___e tranqu___e.', ['il', 'ill', 'ill', 'ill'], { choices: [['il', 'l', 'ille'], ['ill', 'l', 'el'], ['ill', 'l', 'ay'], ['ill', 'l', 'eil']] }),
      dict('Ma famille travaille au soleil dans un fauteuil tranquille.', { voice: 'm2' }),
      say('Le soleil brille sur la feuille pendant que ma fille travaille en ville.', 'The sun shines on the leaf while my daughter works in town.', { tip: b('Keep [j] light in soleil, brille, feuille, fille, travaille, and switch to crisp [l] in ville.', 'Glissez sur [j] dans soleil, brille, feuille, fille, travaille, puis passez à un [l] net dans ville.') }),
    ],
    [
      b('-ail, -eil, -euil, -ouil, -ille usually sound [j] with zero [l].', '-ail, -eil, -euil, -ouil, -ille se prononcent en général [j] sans [l].'),
      b('Key [l] exceptions: la ville, mille, tranquille, le village.', 'Exceptions avec [l] : la ville, mille, tranquille, le village.'),
      b('Medial y splits into vowel + [j] (payer, voyage).', 'Le y médial se dédouble en voyelle + [j] (payer, voyage).'),
    ],
    [['le soleil', b('the sun', 'astre du jour')], ['un fauteuil', b('an armchair', 'siège confortable à bras')], ['une grenouille', b('a frog', 'petit amphibien vert')]],
  ),
  lesson(C, 3, ['palatal-gn-and-clusters', 'le-son-gn-et-les-groupes'],
    b('The palatal [ɲ] (gn) and glide clusters', 'Le son [ɲ] (gn) et les groupes complexes'),
    b('Press the middle of your tongue to the palate for gn in montagne and oignon.', 'Appuyer le milieu de la langue au palais pour gn dans montagne et oignon.'),
    [b('Produce single-sound [ɲ] without hard g', 'Produire [ɲ] d’un bloc sans g dur'), b('Distinguish gn ([ɲ]) from ni ([nj])', 'Distinguer gn ([ɲ]) et ni ([nj])'), b('Say tricky glide words like cuillère and oignon', 'Prononcer les mots pièges comme cuillère et oignon')],
    13,
    [
      card(b('One unified sound: [ɲ]', 'Un seul son : [ɲ]'), b('Written **gn** is NOT *g + n*. Press the **middle blade of your tongue** gently against the roof of your mouth while humming through the nose: **la montagne, la campagne, l’agneau, signer, le peigne**. Also watch two famous spellings: **un oignon** [ɔɲɔ̃] (the *i* is silent!) and **une cuillère** [kɥijɛʁ].', '**gn** ne se lit PAS *g + n*. Collez le **milieu de la langue** contre le palais dur en laissant passer l’air par le nez : **la montagne, la campagne, l’agneau, signer, le peigne**. Attention à **un oignon** [ɔɲɔ̃] (le *i* ne se lit pas !) et **une cuillère** [kɥijɛʁ].'), {
        ex: [['la montagne, la campagne, signer', '[ɲ]'], ['un oignon', '[ɔɲɔ̃] (silent i before gn)'], ['une cuillère, un billet', '[kɥijɛʁ], [bijɛ]']],
      }),
      trap(b('Gn vs ni + vowel', 'gn contre ni + voyelle'), b('In everyday modern speech, **gn** (**baigner, montagne**) is very close to **ni + vowel** (**panier, dernier**), yet true **[ɲ]** uses one single tongue contact rather than *n* followed by *j*. Keep them both light and never insert a hard **[ɡ]**!', 'En parole moderne, **gn** (**baigner**) et **ni + voyelle** (**panier**) sont proches, mais le vrai **[ɲ]** fait un seul contact doux au palais, jamais un **[ɡ]** dur !')),
      hear('Nous préparons une soupe à l’oignon à la campagne.', b('Listen. How is « oignon » pronounced?', 'Écoutez. Comment se prononce « oignon » ?'), [b('[ɔɲɔ̃]: like « ognon », without [wa]', '[ɔɲɔ̃] : sans le son [wa]'), b('[wanɔ̃]: with [wa] at the start', '[wanɔ̃] : avec [wa] au début'), b('[ɔɡnɔ̃]: with a hard g', '[ɔɡnɔ̃] : avec un g dur'), b('[ɔinɔ̃]: with a separate i', '[ɔinɔ̃] : avec un i séparé')], { voice: 'm2' }),
      sort(b('Written gn ([ɲ]) or ni + vowel ([nj])?', 'Graphie gn ([ɲ]) ou ni + voyelle ([nj]) ?'), [b('gn [ɲ]', 'gn [ɲ]'), b('ni + vowel [nj]', 'ni + voyelle [nj]')], [['la montagne', 0], ['le panier', 1], ['la campagne', 0], ['la manière', 1], ['l’agneau', 0], ['le dernier', 1]], { listen: true }),
      mc(P.choose, [b('[kɥijɛʁ]: ui glide + yod [j]', '[kɥijɛʁ] : glissement ui + yod [j]'), b('[kujɛl]: ou + final l', '[kujɛl] : ou + l final'), b('[kwijɛʁ]: back glide oi', '[kwijɛʁ] : glissement oi'), b('[kyilɛʁ]: separate u + i + l', '[kyilɛʁ] : u + i + l séparés')], { fr: 'Comment se prononce « une cuillère » ?' }),
      dict('À la montagne, il coupe un oignon avec une grande cuillère.', { voice: 'f2' }),
      say('Nous signons la lettre à la campagne, puis nous cuisinons la soupe à l’oignon.', 'We sign the letter in the countryside, then cook onion soup.', { tip: b('Keep gn smooth in signons, campagne, oignon—no hard g!', 'Gardez gn doux dans signons, campagne, oignon, sans g dur !') }),
    ],
    [
      b('gn = single palatal [ɲ] (middle of tongue on palate, no hard g).', 'gn = un seul son [ɲ] au milieu du palais, sans g dur.'),
      b('un oignon = [ɔɲɔ̃] (written i stays silent).', 'un oignon = [ɔɲɔ̃] (le i écrit est muet).'),
      b('une cuillère = [kɥijɛʁ] combines front glide [ɥ] and yod [j].', 'une cuillère = [kɥijɛʁ] réunit glissement [ɥ] et yod [j].'),
    ],
    [['la campagne', b('the countryside', 'zone hors de la ville')], ['un oignon', b('an onion', 'légume à bulbe')], ['une cuillère', b('a spoon', 'couvert pour la soupe')]],
  ),
];
