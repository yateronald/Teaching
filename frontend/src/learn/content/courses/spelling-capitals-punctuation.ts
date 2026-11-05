import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'spelling-capitals-punctuation-1',
    slug: { en: 'capital-letters', fr: 'les-majuscules' },
    title: b('Capital letters: fewer than in English', 'Les majuscules : moins qu’en anglais'),
    summary: b('French uses fewer capitals than English: no capital for days, months, languages or nationality adjectives.', 'Le français emploie moins de majuscules que l’anglais : pas de majuscule aux jours, aux mois, aux langues ni aux adjectifs de nationalité.'),
    objectives: [b('Know where French uses capitals', 'Savoir où le français met des majuscules'), b('Distinguish un Canadien and canadien', 'Distinguer un Canadien et canadien'), b('Write titles and names correctly', 'Écrire correctement titres et noms')],
    minutes: 12,
    steps: [
      card(b('No capital', 'Pas de majuscule'), b('Lower case in French: **days** (lundi), **months** (janvier), **languages** (le français), **nationality adjectives** (un film canadien), **monsieur / madame** in a sentence. Capital: **start of a sentence**, **names** (Paris, Marie), **people of a nation** (un **C**anadien, les **F**rançais).', 'Minuscule en français : **jours** (lundi), **mois** (janvier), **langues** (le français), **adjectifs de nationalité** (un film canadien), **monsieur / madame** dans une phrase. Majuscule : **début de phrase**, **noms propres** (Paris, Marie), **habitants** (un **C**anadien, les **F**rançais).'), {
        examples: [{ fr: 'Lundi 3 mars, j’ai rencontré un Canadien qui parle français.', tr: 'Only Lundi (start) and Canadien (person) take a capital.' }, { fr: 'J’aime la cuisine marocaine.', tr: 'marocaine: adjective, lower case' }],
      }),
      pick('A2', b('Which sentence is correctly written?', 'Quelle phrase est correctement écrite ?'), ['Elle parle français et elle est canadienne.', 'Elle parle Français et elle est Canadienne.', 'Elle parle français et elle est Canadienne.', 'Elle parle Français et elle est canadienne.']),
      pick('A2', b('Which sentence is correctly written?', 'Quelle phrase est correctement écrite ?'), ['Les Québécois fêtent la Saint-Jean le 24 juin.', 'Les québécois fêtent la Saint-Jean le 24 Juin.', 'Les Québécois fêtent la saint-jean le 24 Juin.', 'les Québécois Fêtent la Saint-Jean le 24 juin.']),
      pick('A2', b('Which is correct in a letter?', 'Quelle forme est correcte dans une lettre ?'), ['Bonjour Madame Tremblay,', 'Bonjour madame tremblay,', 'bonjour Madame Tremblay,', 'Bonjour MADAME tremblay,'], { explain: b('In a greeting addressing someone directly, Madame / Monsieur take a capital.', 'Dans une formule d’appel, Madame / Monsieur prennent une majuscule.') }),
      { kind: 'categorize', prompt: b('Capital or not?', 'Majuscule ou non ?'), buckets: [b('Capital', 'Majuscule'), b('Lower case', 'Minuscule')], items: [{ text: 'les (C/c)anadiens adorent le hockey', bucket: 0 }, { text: 'un fromage (F/f)rançais', bucket: 1 }, { text: 'le mois de (J/j)uillet', bucket: 1 }, { text: 'la ville de (Q/q)uébec', bucket: 0 }, { text: 'j’apprends l’(A/a)nglais', bucket: 1 }, { text: 'le (M/m)ardi', bucket: 1 }] },
      { kind: 'dictation', prompt: b('Write what you hear (watch the capitals).', 'Écrivez ce que vous entendez (attention aux majuscules).'), text: 'Le mardi, les Français et les Canadiens parlent anglais.', voice: 'f2', strict: true },
    ],
    notes: {
      points: [
        b('No capital: days, months, languages, nationality adjectives.', 'Pas de majuscule : jours, mois, langues, adjectifs de nationalité.'),
        b('Capital: inhabitants (un Canadien, les Québécois), names, start of a sentence.', 'Majuscule : habitants (un Canadien, les Québécois), noms propres, début de phrase.'),
        b('Monsieur / Madame: capital when addressing someone (Bonjour Madame,).', 'Monsieur / Madame : majuscule quand on s’adresse à quelqu’un (Bonjour Madame,).'),
        b('Holidays: la Saint-Jean, Noël, la fête du Canada.', 'Fêtes : la Saint-Jean, Noël, la fête du Canada.'),
      ],
      vocab: [['la majuscule', b('capital letter', 'grande lettre')], ['la minuscule', b('lower-case letter', 'petite lettre')], ['l’habitant', b('inhabitant', 'personne qui vit dans un lieu')]],
    },
  },
  {
    id: 'spelling-capitals-punctuation-2',
    slug: { en: 'french-punctuation', fr: 'la-ponctuation-francaise' },
    title: b('French punctuation and spaces', 'La ponctuation française et les espaces'),
    summary: b('Use French quotation marks and spaces before : ; ! ? and write numbers the French way.', 'Employer les guillemets français, les espaces avant : ; ! ? et écrire les nombres à la française.'),
    objectives: [b('Put a space before double punctuation', 'Mettre une espace avant la ponctuation double'), b('Use « » quotation marks', 'Employer les guillemets « »'), b('Write decimals and thousands correctly', 'Écrire correctement décimales et milliers')],
    minutes: 13,
    steps: [
      card(b('Spaces before : ; ! ?', 'Espaces avant : ; ! ?'), b('In France, a space goes **before** two-part signs: **:** **;** **!** **?** (Tu viens ? Attention !). In Québec, the space is used before **:** but often not before ; ! ?. Both are accepted in the TCF / TEF. Never a space before **.** or **,**.', 'En France, on met une espace **avant** les signes doubles : **:** **;** **!** **?** (Tu viens ? Attention !). Au Québec, l’espace s’emploie devant **:** mais souvent pas devant ; ! ?. Les deux sont acceptés au TCF / TEF. Jamais d’espace avant **.** ni **,**.'), { variant: 'culture' }),
      card(b('Quotation marks and numbers', 'Guillemets et nombres'), b('French quotation marks: **« Bonjour »** with spaces inside. Decimals with a **comma**: 3,5 kg; 12,99 $. Thousands with a **space**: 1 500 habitants; 25 000 $.', 'Guillemets français : **« Bonjour »** avec des espaces à l’intérieur. Décimales avec une **virgule** : 3,5 kg ; 12,99 $. Milliers avec une **espace** : 1 500 habitants ; 25 000 $.'), { variant: 'tip' }),
      pick('A2', b('Which price is written the French way?', 'Quel prix est écrit à la française ?'), ['1 250,50 $', '$1,250.50', '1.250,50$', '1,250.50 $']),
      pick('A2', b('Which sentence uses French quotation marks?', 'Quelle phrase emploie les guillemets français ?'), ['Il m’a dit : « Je reviens demain. »', 'Il m’a dit: "Je reviens demain."', 'Il m’a dit : ‘Je reviens demain.’', 'Il m’a dit « Je reviens demain ».']),
      pick('A2', b('Which sentence follows the France rule?', 'Quelle phrase suit la règle de France ?'), ['Tu viens ce soir ?', 'Tu viens ce soir?', 'Tu viens ce soir ?.', 'Tu viens ce soir ? !']),
      pick('A2', b('How do you write “3.5 kilos” in French?', 'Comment écrire « 3.5 kilos » en français ?'), ['3,5 kilos', '3.5 kilos', '3 5 kilos', '3;5 kilos']),
      { kind: 'match', prompt: b('Match each sign with its French name.', 'Associez chaque signe à son nom.'), pairs: [['le point d’interrogation', '?'], ['le point d’exclamation', '!'], ['le point-virgule', ';'], ['les deux-points', ':'], ['les guillemets', '« »']] },
    ],
    notes: {
      points: [
        b('France: space before : ; ! ?. Québec: space before : (often not before ; ! ?).', 'France : espace avant : ; ! ?. Québec : espace avant : (souvent pas avant ; ! ?).'),
        b('Quotation marks: « … » with spaces inside.', 'Guillemets : « … » avec des espaces à l’intérieur.'),
        b('Decimal comma (3,5) and thousands space (1 500).', 'Virgule décimale (3,5) et espace des milliers (1 500).'),
        b('Currency after the number: 12,99 $, 20 €.', 'Devise après le nombre : 12,99 $, 20 €.'),
      ],
      vocab: [['la virgule', b('comma', 'signe ,')], ['le point', b('full stop', 'signe .')], ['les guillemets', b('quotation marks', 'signes « »')]],
    },
  },
  {
    id: 'spelling-capitals-punctuation-3',
    slug: { en: 'apostrophe-and-hyphen', fr: 'apostrophe-et-trait-d-union' },
    title: b('The apostrophe and the hyphen', 'L’apostrophe et le trait d’union'),
    summary: b('Know when to elide (l’, j’, qu’) and when to use a hyphen (questions, numbers, compound words).', 'Savoir quand élider (l’, j’, qu’) et quand mettre un trait d’union (questions, nombres, mots composés).'),
    objectives: [b('Elide le, la, je, ne, de, que, si before a vowel', 'Élider le, la, je, ne, de, que, si devant une voyelle'), b('Use the hyphen in inversion and -t-', 'Employer le trait d’union dans l’inversion et -t-'), b('Write compound numbers with hyphens', 'Écrire les nombres composés avec des traits d’union')],
    minutes: 13,
    steps: [
      card(b('The apostrophe (elision)', 'L’apostrophe (élision)'), b('Before a vowel or silent h, these words lose their vowel: **le / la → l’**, **je → j’**, **me / te / se → m’ / t’ / s’**, **ne → n’**, **de → d’**, **que → qu’**. **si → s’** only before **il / ils**: s’il vous plaît, but si elle.', 'Devant une voyelle ou un h muet, ces mots perdent leur voyelle : **le / la → l’**, **je → j’**, **me / te / se → m’ / t’ / s’**, **ne → n’**, **de → d’**, **que → qu’**. **si → s’** seulement devant **il / ils** : s’il vous plaît, mais si elle.')),
      pick('A2', b('Which is correct?', 'Laquelle est correcte ?'), ['si elle vient', 's’elle vient', 's’ elle vient', 'si’elle vient']),
      pick('A2', b('Which is correct?', 'Laquelle est correcte ?'), ['Je n’ai pas d’argent.', 'Je ne ai pas de argent.', 'J’ne ai pas d’argent.', 'Je n’ai pas de argent.']),
      card(b('The hyphen', 'Le trait d’union'), b('**Inversion**: Parlez-vous ? Est-ce ? **-t-** between two vowels: **A-t-il** fini ? **Va-t-elle** venir ? **Numbers under 100**: vingt-deux, quatre-vingt-dix (but **vingt et un**). Since 1990, you may also hyphenate all numbers: deux-cent-trois. **Compound words**: grand-mère, arc-en-ciel.', '**Inversion** : Parlez-vous ? Est-ce ? **-t-** entre deux voyelles : **A-t-il** fini ? **Va-t-elle** venir ? **Nombres inférieurs à 100** : vingt-deux, quatre-vingt-dix (mais **vingt et un**). Depuis 1990, on peut aussi relier tous les nombres : deux-cent-trois. **Mots composés** : grand-mère, arc-en-ciel.'), { variant: 'tip' }),
      pick('A2', b('Which question is correct?', 'Quelle question est correcte ?'), ['A-t-il réservé une table ?', 'A-il réservé une table ?', 'At-il réservé une table ?', 'A t il réservé une table ?']),
      pick('A2', b('How do you write 92?', 'Comment écrit-on 92 ?'), ['quatre-vingt-douze', 'quatre vingt douze', 'quatre-vingts-douze', 'quatrevingt-douze']),
      { kind: 'fill', prompt: b('Add the apostrophe or the hyphen.', 'Ajoutez l’apostrophe ou le trait d’union.'), text: 'Parle___t___elle anglais ? Je ne sais pas s___il viendra.', answers: [['-'], ['-'], ['’', '\'']], strict: true },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'A-t-il vingt-deux ans ?', voice: 'm2', strict: true },
    ],
    notes: {
      points: [
        b('Elision before a vowel / silent h: l’, j’, m’, t’, s’, n’, d’, qu’.', 'Élision devant voyelle / h muet : l’, j’, m’, t’, s’, n’, d’, qu’.'),
        b('Si → s’ only before il / ils.', 'Si → s’ seulement devant il / ils.'),
        b('Inversion with a hyphen; add -t- between two vowels: a-t-il, va-t-elle.', 'Inversion avec trait d’union ; -t- entre deux voyelles : a-t-il, va-t-elle.'),
        b('Numbers: vingt-deux, quatre-vingt-dix, but vingt et un, trente et un.', 'Nombres : vingt-deux, quatre-vingt-dix, mais vingt et un, trente et un.'),
      ],
      vocab: [['l’apostrophe (f.)', b('apostrophe', 'signe ’')], ['le trait d’union', b('hyphen', 'signe -')], ['l’arc-en-ciel (m.)', b('rainbow', 'arc de couleurs')]],
    },
  },
];

export default lessons;
