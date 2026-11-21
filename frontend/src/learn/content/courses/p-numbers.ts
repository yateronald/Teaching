import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, mc, P, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Six, huit, dix: three numbers that change pronunciation depending on what follows. Cinq euros, vingt ans, cent ans, neuf heures: numbers are full of liaisons and traps, and a wrong number in a price, a phone number or an address causes real problems. This course trains the pronunciation of numbers alone, before a consonant, before a vowel, in prices, times, phone numbers and dates.',
    'Six, huit, dix : trois nombres qui changent de prononciation selon ce qui suit. Cinq euros, vingt ans, cent ans, neuf heures : les nombres sont pleins de liaisons et de pièges, et un mauvais chiffre dans un prix, un numéro de téléphone ou une adresse pose de vrais problèmes. Ce cours entraîne la prononciation des nombres seuls, devant une consonne, devant une voyelle, dans les prix, les heures, les numéros et les dates.',
  ),
  outcomes: [
    b('Pronounce six, huit, dix in every position', 'Prononcer six, huit, dix dans toutes les positions'),
    b('Make liaisons with numbers', 'Faire les liaisons avec les nombres'),
    b('Say prices and times correctly', 'Dire correctement prix et heures'),
    b('Read phone numbers the French way', 'Lire les numéros de téléphone à la française'),
  ],
};

const C = 'p-numbers';
export default [
  lesson(C, 1, ['six-huit-dix', 'six-huit-dix'],
    b('Six, huit, dix: three pronunciations', 'Six, huit, dix : trois prononciations'),
    b('Say six, huit and dix alone, before a consonant and before a vowel.', 'Dire six, huit et dix seuls, devant une consonne et devant une voyelle.'),
    [b('Say them alone', 'Les dire seuls'), b('Drop the consonant before a consonant', 'Taire la consonne devant une consonne'), b('Link before a vowel', 'Lier devant une voyelle')],
    13,
    [
      card(b('Three positions', 'Trois positions'), b('**Alone**: final consonant pronounced: **six** [sis], **huit** [ɥit], **dix** [dis]. **Before a consonant**: silent: **six livres** [si], **huit jours** [ɥi], **dix minutes** [di]. **Before a vowel**: liaison: **six ans** [siz‿ɑ̃], **huit heures** [ɥit‿œʁ], **dix euros** [diz‿øʁo].', '**Seul** : consonne finale prononcée : **six** [sis], **huit** [ɥit], **dix** [dis]. **Devant une consonne** : muette : **six livres** [si], **huit jours** [ɥi], **dix minutes** [di]. **Devant une voyelle** : liaison : **six ans** [siz‿ɑ̃], **huit heures** [ɥit‿œʁ], **dix euros** [diz‿øʁo].'), {
        table: { head: [b('number', 'nombre'), b('alone', 'seul'), b('+ consonant', '+ consonne'), b('+ vowel', '+ voyelle')], rows: [['six', '[sis]', 'six livres [si]', 'six ans [siz]'], ['huit', '[ɥit]', 'huit jours [ɥi]', 'huit heures [ɥit]'], ['dix', '[dis]', 'dix minutes [di]', 'dix euros [diz]']] },
      }),
      hear('J’ai dix euros.', b('Listen. How is dix pronounced?', 'Écoutez. Comment se prononce dix ?'), [b('[diz], linked to euros', '[diz], lié à euros'), b('[dis]', '[dis]'), b('[di]', '[di]')]),
      hear('Il reste six places.', b('Listen. How is six pronounced?', 'Écoutez. Comment se prononce six ?'), [b('[si], before a consonant', '[si], devant une consonne'), b('[sis]', '[sis]'), b('[siz]', '[siz]')], { voice: 'm' }),
      sort(b('How is the number pronounced?', 'Comment se prononce le nombre ?'), [b('consonant heard', 'consonne entendue'), b('consonant silent', 'consonne muette')], [['J’en veux six.', 0], ['six bouteilles', 1], ['huit amis', 0], ['huit garçons', 1], ['dix enfants', 0], ['dix jours', 1]], { listen: true }),
      dict('Le train part à huit heures, dans dix minutes.', { hint: b('huit heures: liaison; dix minutes: silent x.', 'huit heures : liaison ; dix minutes : x muet.') }),
      say('Six amis, six livres. Huit heures, huit jours. Dix euros, dix minutes.', 'Six friends, six books. Eight o’clock, eight days. Ten euros, ten minutes.'),
    ],
    [
      b('Alone: six [sis], huit [ɥit], dix [dis].', 'Seul : six [sis], huit [ɥit], dix [dis].'),
      b('+ consonant: silent (six livres [si]).', '+ consonne : muette (six livres [si]).'),
      b('+ vowel: liaison (six ans [siz], huit heures [ɥit]).', '+ voyelle : liaison (six ans [siz], huit heures [ɥit]).'),
    ],
    [['une place', b('a seat, a spot', 'siège disponible')], ['une bouteille', b('a bottle', 'récipient')], ['rester', b('to remain, be left', 'il y a encore')]],
  ),
  lesson(C, 2, ['cinq-neuf-vingt-cent', 'cinq-neuf-vingt-cent'],
    b('Cinq, neuf, vingt, cent: the other traps', 'Cinq, neuf, vingt, cent : les autres pièges'),
    b('Master the liaisons and special cases of the other numbers.', 'Maîtriser les liaisons et cas particuliers des autres nombres.'),
    [b('Say neuf ans, neuf heures', 'Dire neuf ans, neuf heures'), b('Use the t of vingt correctly', 'Bien utiliser le t de vingt'), b('Link un, deux, trois, cent', 'Lier un, deux, trois, cent')],
    13,
    [
      card(b('Special cases', 'Cas particuliers'), b('**neuf**: [nœf], but **[nœv]** in **neuf ans** and **neuf heures**. **vingt**: [vɛ̃], but the **t** is heard in **vingt et un… vingt-neuf** [vɛ̃t] and in liaison **vingt ans** [vɛ̃t‿ɑ̃]; not in **quatre-vingts** [katʁəvɛ̃]. **cinq**: [sɛ̃k] (the q is usually kept, even before a consonant). Liaisons: **un‿ami, deux‿ans, trois‿heures, cent‿euros**.', '**neuf** : [nœf], mais **[nœv]** dans **neuf ans** et **neuf heures**. **vingt** : [vɛ̃], mais le **t** s’entend dans **vingt et un… vingt-neuf** [vɛ̃t] et en liaison **vingt ans** [vɛ̃t‿ɑ̃] ; pas dans **quatre-vingts**. **cinq** : [sɛ̃k] (le q se garde le plus souvent, même devant une consonne). Liaisons : **un‿ami, deux‿ans, trois‿heures, cent‿euros**.')),
      hear('Il a neuf ans.', b('Listen. How is neuf pronounced?', 'Écoutez. Comment se prononce neuf ?'), [b('[nœv]', '[nœv]'), b('[nœf]', '[nœf]'), b('[nø]', '[nø]')]),
      hear('Elle a vingt-deux ans.', b('Listen. Is the t of vingt heard?', 'Écoutez. Entend-on le t de vingt ?'), [b('Yes: vingt-deux [vɛ̃tdø]', 'Oui : vingt-deux [vɛ̃tdø]'), b('No', 'Non')], { voice: 'm' }),
      sort(b('Is there a liaison or linking?', 'Y a-t-il une liaison ou un enchaînement ?'), [b('yes', 'oui'), b('no', 'non')], [['deux ans', 0], ['deux livres', 1], ['trois heures', 0], ['trois jours', 1], ['cent euros', 0], ['cent pages', 1]], { listen: true }),
      mc(P.choose, ['quatre-vingts [katʁəvɛ̃]', 'quatre-vingts [katʁəvɛ̃t]', 'quatre-vingts [katvɛ̃]', 'quatre-vingts [katʁəvɛ̃z]'], { fr: 'Comment se prononce « quatre-vingts » seul ?' }),
      dict('Mon grand-père a quatre-vingt-neuf ans et ma sœur vingt ans.', { hint: b('vingt ans: liaison in t.', 'vingt ans : liaison en t.') }),
      say('Neuf heures, neuf ans, vingt-cinq euros, cent ans.', 'Nine o’clock, nine years, twenty-five euros, a hundred years.'),
    ],
    [
      b('neuf → [nœv] only in neuf ans, neuf heures.', 'neuf → [nœv] seulement dans neuf ans, neuf heures.'),
      b('vingt: t heard in 21–29 and before a vowel; not in quatre-vingts.', 'vingt : t entendu de 21 à 29 et devant une voyelle ; pas dans quatre-vingts.'),
      b('Liaison: un, deux, trois, six, dix, cent + vowel.', 'Liaison : un, deux, trois, six, dix, cent + voyelle.'),
    ],
    [['le grand-père', b('the grandfather', 'père du parent')], ['une page', b('a page', 'feuille d’un livre')], ['un an', b('a year', 'douze mois')]],
  ),
  lesson(C, 3, ['prices-times-phone-numbers', 'prix-heures-et-numeros'],
    b('Prices, times and phone numbers', 'Prix, heures et numéros de téléphone'),
    b('Say and understand numbers in real situations.', 'Dire et comprendre les nombres en situation réelle.'),
    [b('Say prices with euros', 'Dire des prix en euros'), b('Say times', 'Dire l’heure'), b('Read phone numbers in pairs', 'Lire les numéros par paires')],
    13,
    [
      card(b('Numbers in real life', 'Les nombres au quotidien'), b('**Prices**: **12,50 €** = **douze euros cinquante**. **Times**: **14 h 30** = **quatorze heures trente** (official) or **deux heures et demie** (spoken). **Phone numbers** in France are read **in pairs**: **06 12 45 78 90** = **zéro six, douze, quarante-cinq, soixante-dix-huit, quatre-vingt-dix**. In Québec, digits are often read in groups of three and four.', '**Prix** : **12,50 €** = **douze euros cinquante**. **Heures** : **14 h 30** = **quatorze heures trente** (officiel) ou **deux heures et demie** (oral). **Numéros** en France : lus **par paires** : **06 12 45 78 90** = **zéro six, douze, quarante-cinq, soixante-dix-huit, quatre-vingt-dix**. Au Québec, on lit souvent par groupes de trois et quatre chiffres.')),
      hear('Ça fait vingt-huit euros quatre-vingt-dix.', b('Listen. How much is it?', 'Écoutez. Combien ça coûte ?'), [b('€28.90', '28,90 €'), b('€20.90', '20,90 €'), b('€28.19', '28,19 €'), b('€98.20', '98,20 €')]),
      hear('Mon numéro, c’est le zéro six, quinze, quarante-trois, soixante-sept, quatre-vingt-un.', b('Listen. Which number?', 'Écoutez. Quel numéro ?'), [b('06 15 43 67 81', '06 15 43 67 81'), b('06 50 43 67 81', '06 50 43 67 81'), b('06 15 33 77 81', '06 15 33 77 81'), b('06 15 43 47 21', '06 15 43 47 21')], { voice: 'm' }),
      hear('Le rendez-vous est à dix-sept heures quarante-cinq.', b('Listen. What time?', 'Écoutez. À quelle heure ?'), [b('17:45', '17 h 45'), b('7:45', '7 h 45'), b('17:15', '17 h 15'), b('16:45', '16 h 45')]),
      dict('Le billet coûte trente-six euros, le train part à onze heures.', { hint: b('Write the numbers in words.', 'Écrivez les nombres en lettres.') }),
      mc(P.choose, ['quatre-vingt-dix-neuf euros', 'quatre-vingts-dix-neuf euros', 'quatre-vingt-neuf euros', 'cent moins un euros'], { fr: 'Dites 99 € :' }),
      say('Mon numéro, c’est le zéro six, vingt-deux, trente-quatre, cinquante-six, soixante-dix-huit.', 'My number is 06 22 34 56 78.'),
    ],
    [
      b('Prices: douze euros cinquante (12,50 €).', 'Prix : douze euros cinquante (12,50 €).'),
      b('Times: quatorze heures trente / deux heures et demie.', 'Heures : quatorze heures trente / deux heures et demie.'),
      b('French phone numbers: read in pairs.', 'Numéros français : lus par paires.'),
    ],
    [['un billet', b('a ticket', 'titre de transport')], ['un rendez-vous', b('an appointment', 'rencontre prévue')], ['un numéro', b('a number', 'suite de chiffres')]],
  ),
];
