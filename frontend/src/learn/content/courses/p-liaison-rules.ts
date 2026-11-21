import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, mc, P, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Les‿enfants, mais « et | elle » ; un‿ami, mais « un héros »; c’est‿important, or c’est important? Liaison is the silent final consonant that wakes up before a vowel, and French speakers instinctively know when it is required, optional or forbidden. This course turns that instinct into clear rules, trains the sounds of liaison ([z], [t], [n], [v]) and helps you sound natural, neither too casual nor too formal.',
    'Les‿enfants, mais « et | elle » ; un‿ami, mais « un héros » ; c’est‿important ou c’est important ? La liaison, c’est la consonne finale muette qui se réveille devant une voyelle, et les francophones savent d’instinct quand elle est obligatoire, facultative ou interdite. Ce cours transforme cet instinct en règles claires, entraîne les sons de liaison ([z], [t], [n], [v]) et vous aide à sonner naturel, ni trop relâché, ni trop soutenu.',
  ),
  outcomes: [
    b('Make all required liaisons', 'Faire toutes les liaisons obligatoires'),
    b('Avoid forbidden liaisons', 'Éviter les liaisons interdites'),
    b('Use optional liaisons to adjust register', 'Utiliser les liaisons facultatives selon le registre'),
    b('Produce the right liaison sound', 'Produire le bon son de liaison'),
  ],
};

const C = 'p-liaison-rules';
export default [
  lesson(C, 1, ['required-liaisons', 'les-liaisons-obligatoires'],
    b('Required liaisons', 'Les liaisons obligatoires'),
    b('Link where every French speaker links: in the noun group and the pronoun + verb group.', 'Lier là où tout francophone lie : dans le groupe nominal et le groupe pronom + verbe.'),
    [b('Link determiner + noun/adjective', 'Lier déterminant + nom/adjectif'), b('Link pronoun + verb', 'Lier pronom + verbe'), b('Link after short adverbs and prepositions', 'Lier après les adverbes et prépositions courts')],
    13,
    [
      card(b('Where liaison is required', 'Où la liaison est obligatoire'), b('1. **Determiner + noun/adjective**: **les‿amis, un‿enfant, mes‿anciens‿élèves, deux‿heures**. 2. **Pronoun + verb** (and verb + pronoun): **nous‿avons, ils‿aiment, on‿arrive, allez-y, prends-en**. 3. **Short adverbs/prepositions**: **très‿important, chez‿eux, dans‿une heure, en‿avion**. 4. Fixed phrases: **tout‿à coup, petit‿à petit, de temps‿en temps**.', '1. **Déterminant + nom/adjectif** : **les‿amis, un‿enfant, mes‿anciens‿élèves, deux‿heures**. 2. **Pronom + verbe** (et verbe + pronom) : **nous‿avons, ils‿aiment, on‿arrive, allez-y, prends-en**. 3. **Adverbes/prépositions courts** : **très‿important, chez‿eux, dans‿une heure, en‿avion**. 4. Expressions figées : **tout‿à coup, petit‿à petit, de temps‿en temps**.'), {
        ex: [['Les‿enfants‿ont‿aimé.', '[lezɑ̃fɑ̃ zɔ̃tɛme]'], ['Nous‿allons chez‿eux en‿avion.', 'liaisons ×3']],
      }),
      card(b('The liaison sounds', 'Les sons de liaison'), b('**s, x, z → [z]**: les‿amis, deux‿ans, chez‿eux. **t, d → [t]**: petit‿ami, grand‿homme [ɡʁɑ̃tɔm], quand‿il. **n → [n]**: un‿ami, mon‿oncle, bien‿aimé. **f → [v]**: only in **neuf ans, neuf heures**.', '**s, x, z → [z]** : les‿amis, deux‿ans, chez‿eux. **t, d → [t]** : petit‿ami, grand‿homme [ɡʁɑ̃tɔm], quand‿il. **n → [n]** : un‿ami, mon‿oncle, bien‿aimé. **f → [v]** : seulement dans **neuf ans, neuf heures**.')),
      sort(b('Which liaison sound?', 'Quel son de liaison ?'), [b('[z]', '[z]'), b('[t]', '[t]'), b('[n]', '[n]')], [['les‿écoles', 0], ['un grand‿arbre', 1], ['mon‿amie', 2], ['chez‿elle', 0], ['quand‿il pleut', 1], ['un‿hôtel', 2]], { listen: true }),
      hear('Ils ont deux enfants.', b('Listen. How many liaisons?', 'Écoutez. Combien de liaisons ?'), [b('two: ils‿ont, deux‿enfants', 'deux : ils‿ont, deux‿enfants'), b('one', 'une'), b('none', 'aucune'), b('three', 'trois')]),
      mc(P.choose, ['un grand‿homme [ɡʁɑ̃tɔm]', 'un grand‿homme [ɡʁɑ̃dɔm]', 'un grand homme [ɡʁɑ̃ ɔm], sans liaison', 'un grand‿homme [ɡʁɑ̃zɔm]'], { fr: 'Comment se prononce « un grand homme » ?' }),
      dict('Nous avons invité nos amis chez eux, dans un petit hôtel.', { hint: b('Five required liaisons.', 'Cinq liaisons obligatoires.') }),
      say('Les enfants ont aimé leurs anciens amis.', 'The children liked their old friends.', { tip: b('les‿enfants‿ont, leurs‿anciens‿amis.', 'les‿enfants‿ont, leurs‿anciens‿amis.') }),
    ],
    [
      b('Required: determiner + noun, pronoun + verb, très/chez/dans/en + word.', 'Obligatoire : déterminant + nom, pronom + verbe, très/chez/dans/en + mot.'),
      b('s, x, z → [z]; t, d → [t]; n → [n]; f → [v] (neuf ans).', 's, x, z → [z] ; t, d → [t] ; n → [n] ; f → [v] (neuf ans).'),
      b('Fixed phrases: tout‿à coup, petit‿à petit.', 'Expressions figées : tout‿à coup, petit‿à petit.'),
    ],
    [['un ancien élève', b('a former student', 'élève d’avant')], ['un oncle', b('an uncle', 'frère du parent')], ['bien-aimé', b('beloved', 'très aimé')]],
  ),
  lesson(C, 2, ['forbidden-liaisons', 'les-liaisons-interdites'],
    b('Forbidden liaisons', 'Les liaisons interdites'),
    b('Never link in the places where French speakers never do.', 'Ne jamais lier là où les francophones ne lient jamais.'),
    [b('Never link after et', 'Ne jamais lier après et'), b('Never link before h aspiré', 'Ne jamais lier devant un h aspiré'), b('Never link after a singular noun', 'Ne jamais lier après un nom singulier')],
    13,
    [
      card(b('Where liaison is forbidden', 'Où la liaison est interdite'), b('1. **After « et »**: **toi et | elle**. 2. **Before an h aspiré**: **les | héros, en | haut, les | haricots**. 3. **After a singular noun**: **un étudiant | intelligent, le train | arrive**. 4. **After a proper name**: **Louis | arrive**. 5. **Before onze, oui, uh**: **les | onze joueurs, mais | oui**. 6. **After an inverted pronoun**: **Sont-ils | arrivés ?**', '1. **Après « et »** : **toi et | elle**. 2. **Devant un h aspiré** : **les | héros, en | haut, les | haricots**. 3. **Après un nom singulier** : **un étudiant | intelligent, le train | arrive**. 4. **Après un nom propre** : **Louis | arrive**. 5. **Devant onze, oui** : **les | onze joueurs, mais | oui**. 6. **Après un pronom inversé** : **Sont-ils | arrivés ?**')),
      trap(b('Les héros, not « les zéros »', 'Les héros, pas « les zéros »'), b('A liaison in **les héros** would make **les zéros** (the zeros)! The h aspiré is why the liaison is forbidden here.', 'Une liaison dans **les héros** donnerait **les zéros** ! C’est pourquoi le h aspiré interdit la liaison ici.')),
      sort(b('Liaison or not?', 'Liaison ou pas ?'), [b('liaison', 'liaison'), b('no liaison', 'pas de liaison')], [['les hôtels', 0], ['les haricots', 1], ['un enfant', 0], ['un enfant adorable', 1], ['ils arrivent', 0], ['toi et elle', 1]]),
      hear('Les héros sont arrivés en haut.', b('Listen. Is there a liaison after les and en?', 'Écoutez. Y a-t-il une liaison après les et en ?'), [b('No: h aspiré in héros and haut', 'Non : h aspiré dans héros et haut'), b('Yes, both', 'Oui, les deux'), b('Only after les', 'Seulement après les'), b('Only after en', 'Seulement après en')], { voice: 'm' }),
      mc(P.choose, ['un étudiant | intelligent (pas de liaison)', 'un étudiant‿intelligent [t]', 'un étudiant‿intelligent [z]', 'un étudiant‿intelligent [n]'], { fr: 'Comment dit-on « un étudiant intelligent » ?' }),
      dict('Le train arrive en haut, et elle descend avec les héros.', { hint: b('No liaison after train, en (haut), et, les (héros).', 'Pas de liaison après train, en (haut), et, les (héros).') }),
      say('Toi et elle, vous êtes les héros. Le train arrive en haut.', 'You and her, you are the heroes. The train is arriving at the top.'),
    ],
    [
      b('Never after et: toi et | elle.', 'Jamais après et : toi et | elle.'),
      b('Never before h aspiré: les | héros, en | haut.', 'Jamais devant h aspiré : les | héros, en | haut.'),
      b('Never after a singular noun or a proper name.', 'Jamais après un nom singulier ou un nom propre.'),
    ],
    [['en haut', b('upstairs, at the top', 'en hauteur')], ['un joueur', b('a player', 'qui joue')], ['descendre', b('to go down', 'aller en bas')]],
  ),
  lesson(C, 3, ['optional-liaisons-and-register', 'liaisons-facultatives-et-registre'],
    b('Optional liaisons and register', 'Les liaisons facultatives et le registre'),
    b('Use optional liaisons to sound more relaxed or more formal.', 'Utiliser les liaisons facultatives pour paraître plus détendu ou plus soutenu.'),
    [b('Recognise optional liaisons', 'Reconnaître les liaisons facultatives'), b('Adjust to the register', 'S’adapter au registre'), b('Avoid false liaisons', 'Éviter les fausses liaisons')],
    13,
    [
      card(b('Optional liaisons', 'Les liaisons facultatives'), b('After **être**: **c’est‿important / c’est important**. After **plural nouns**: **des enfants‿adorables**. After **pas, plus, jamais**: **pas‿encore / pas encore**. After **auxiliaries**: **ils sont‿allés**, **je suis‿arrivé**. **The more you make, the more formal you sound**: news readers and speeches make many; everyday conversation makes few.', 'Après **être** : **c’est‿important / c’est important**. Après les **noms pluriels** : **des enfants‿adorables**. Après **pas, plus, jamais** : **pas‿encore / pas encore**. Après les **auxiliaires** : **ils sont‿allés**, **je suis‿arrivé**. **Plus on en fait, plus on paraît soutenu** : présentateurs et discours en font beaucoup ; la conversation courante en fait peu.')),
      trap(b('False liaisons', 'Les fausses liaisons'), b('Don’t add a consonant that is not written: **« quatre‿z‿enfants »** or **« il va‿t‿à Paris »** are mistakes (called **cuirs** and **velours**). Only link a letter that exists: **quatre | enfants**, **il va | à Paris**.', 'N’ajoutez pas une consonne qui n’est pas écrite : **« quatre‿z‿enfants »** ou **« il va‿t‿à Paris »** sont des fautes (appelées **velours** et **cuirs**). On ne lie qu’une lettre qui existe : **quatre | enfants**, **il va | à Paris**.')),
      sort(b('Required, optional or forbidden?', 'Obligatoire, facultative ou interdite ?'), [b('required', 'obligatoire'), b('optional', 'facultative'), b('forbidden', 'interdite')], [['les‿amis', 0], ['c’est‿important', 1], ['et | alors', 2], ['nous‿avons', 0], ['pas‿encore', 1], ['les | haricots', 2]]),
      mc(P.best, ['Mesdames et messieurs, il est‿essentiel que nous soyons‿unis.', 'Ouais, c’est | important, quoi.', 'Les | amis, on y va.', 'Quatre‿z‿enfants sont là.'], { fr: 'Quel extrait sonne comme un discours soutenu ?' }),
      mc(P.choose, [b('sont‿arrivés and pas‿encore', 'sont‿arrivés et pas‿encore'), b('mais‿ce and n’est‿pas', 'mais‿ce et n’est‿pas'), b('Ils‿sont', 'Ils‿sont'), b('fini‿encore', 'fini‿encore')], { fr: '« Ils sont arrivés, mais ce n’est pas encore fini. » Quelles liaisons sont facultatives ?' }),
      say('C’est‿important : nous sommes‿arrivés, mais pas‿encore installés.', 'It’s important: we have arrived, but are not settled yet.', { tip: b('Formal style: make the optional liaisons.', 'Style soutenu : faites les liaisons facultatives.') }),
    ],
    [
      b('Optional: after être, plural nouns, pas/plus/jamais, auxiliaries.', 'Facultative : après être, noms pluriels, pas/plus/jamais, auxiliaires.'),
      b('More liaisons = more formal.', 'Plus de liaisons = plus soutenu.'),
      b('Never link a letter that is not written (no « quatre‿z‿enfants »).', 'Ne liez jamais une lettre absente (pas de « quatre‿z‿enfants »).'),
    ],
    [['uni', b('united', 'ensemble')], ['installé', b('settled in', 'bien en place')], ['un présentateur', b('a news reader, a presenter', 'qui présente les nouvelles')]],
  ),
];
