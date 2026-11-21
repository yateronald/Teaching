import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Prices at the market, the time of an appointment, a phone number on a voicemail: numbers go by fast in spoken French, and soixante-dix or quatre-vingt-quinze are traps for every learner. This listening course trains your ear on numbers in real situations, at natural speed, with strategies to catch them the first time: anticipate, note immediately, listen for the last word.',
    'Les prix au marché, l’heure d’un rendez-vous, un numéro de téléphone sur une boîte vocale : les nombres passent vite à l’oral, et soixante-dix ou quatre-vingt-quinze piègent tous les apprenants. Ce cours d’écoute entraîne votre oreille aux nombres en situation réelle, à vitesse naturelle, avec des stratégies pour les saisir du premier coup : anticiper, noter immédiatement, écouter le dernier mot.',
  ),
  outcomes: [
    b('Hear prices and amounts at natural speed', 'Entendre prix et montants à vitesse naturelle'),
    b('Catch times and dates', 'Saisir heures et dates'),
    b('Write down a phone number from a message', 'Noter un numéro de téléphone d’après un message'),
    b('Avoid the 70–99 traps', 'Éviter les pièges de 70 à 99'),
  ],
};

const C = 'l-numbers-prices';
export default [
  lesson(C, 1, ['hearing-prices', 'entendre-les-prix'],
    b('Hearing prices', 'Entendre les prix'),
    b('Catch prices in euros and dollars, with cents.', 'Saisir des prix en euros et en dollars, avec les centimes.'),
    [b('Hear prices with cents', 'Entendre des prix avec centimes'), b('Distinguish close numbers', 'Distinguer des nombres proches'), b('Note a price quickly', 'Noter rapidement un prix')],
    13,
    [
      card(b('How prices are said', 'Comment on dit les prix'), b('**3,50 $** = trois dollars cinquante (or trois cinquante). **12,99 €** = douze euros quatre-vingt-dix-neuf. The currency often goes **in the middle**, and the cents come last.', '**3,50 $** = trois dollars cinquante (ou trois cinquante). **12,99 €** = douze euros quatre-vingt-dix-neuf. La devise se place souvent **au milieu**, et les centimes à la fin.'), {
        ex: [['Ça fait quatre dollars soixante-quinze.', 'That’s four seventy-five.'], ['Le kilo est à deux euros quarante.', 'It’s two euros forty a kilo.']],
      }),
      tip(b('Listen to the end', 'Écoutez jusqu’au bout'), b('French numbers are built by **addition**: soixante-dix = 60 + 10, quatre-vingt-quinze = 4 × 20 + 15. Do not write too early: wait for the **last word**.', 'Les nombres français se construisent par **addition** : soixante-dix = 60 + 10, quatre-vingt-quinze = 4 × 20 + 15. N’écrivez pas trop tôt : attendez le **dernier mot**.')),
      hear('Ça fait sept dollars cinquante, s’il vous plaît.', b('How much is it?', 'Combien ça coûte ?'), ['7,50 $', '17,50 $', '7,15 $', '70,50 $']),
      hear('Les fraises sont à quatre euros quatre-vingt-dix le panier.', b('How much is a basket of strawberries?', 'Combien coûte le panier de fraises ?'), ['4,90 €', '4,80 €', '80,90 €', '4,19 €']),
      hear('Le total est de soixante-douze dollars.', b('What is the total?', 'Quel est le total ?'), ['72 $', '62 $', '82 $', '92 $']),
      hear('Ce manteau coûte cent quatre-vingt-quinze dollars.', b('How much is the coat?', 'Combien coûte le manteau ?'), ['195 $', '175 $', '185 $', '115 $']),
      sort(b('Which number do you hear?', 'Quel nombre entendez-vous ?'), ['70', '80', '90'], [['soixante-dix', 0], ['quatre-vingts', 1], ['quatre-vingt-dix', 2]], { listen: true }),
      dict('Le pain coûte trois dollars vingt-cinq.', { voice: 'f' }),
    ],
    [
      b('Prices: 3,50 $ = trois dollars cinquante.', 'Prix : 3,50 $ = trois dollars cinquante.'),
      b('70 = soixante-dix, 80 = quatre-vingts, 90 = quatre-vingt-dix.', '70 = soixante-dix, 80 = quatre-vingts, 90 = quatre-vingt-dix.'),
      b('Wait for the last word before writing.', 'Attendez le dernier mot avant d’écrire.'),
    ],
    [['ça fait…', b('that comes to…', 'le total est de…')], ['un panier', b('a basket', 'contenant tressé')], ['le total', b('the total', 'la somme')]],
  ),
  lesson(C, 2, ['hearing-times-and-dates', 'entendre-heures-et-dates'],
    b('Hearing times and dates', 'Entendre les heures et les dates'),
    b('Catch appointment times and dates in short dialogues.', 'Saisir les heures et les dates de rendez-vous dans de courts dialogues.'),
    [b('Hear the 24-hour clock', 'Entendre l’heure sur 24 heures'), b('Hear et quart, et demie, moins le quart', 'Entendre et quart, et demie, moins le quart'), b('Hear dates', 'Entendre les dates')],
    13,
    [
      card(b('Two ways to tell the time', 'Deux façons de dire l’heure'), b('Official (24 h): **seize heures trente**. Everyday: **quatre heures et demie**. **et quart** = :15, **et demie** = :30, **moins le quart** = :45 (of the next hour).', 'Officielle (24 h) : **seize heures trente**. Courante : **quatre heures et demie**. **et quart** = :15, **et demie** = :30, **moins le quart** = :45 (de l’heure suivante).'), {
        ex: [['Le train part à dix-huit heures quinze.', 'The train leaves at 6:15 p.m.'], ['On se voit à huit heures moins le quart.', 'See you at 7:45.']],
      }),
      hear('Votre rendez-vous est à quatorze heures trente.', b('What time is the appointment?', 'À quelle heure est le rendez-vous ?'), ['14 h 30', '4 h 30', '14 h 13', '13 h 30']),
      hear('Je finis à six heures moins le quart.', b('When does she finish?', 'À quelle heure finit-elle ?'), ['5 h 45', '6 h 15', '6 h 45', '5 h 15']),
      hear('La réunion est reportée au jeudi seize mars.', b('When is the meeting now?', 'Quand a lieu la réunion maintenant ?'), [b('Thursday 16 March', 'Jeudi 16 mars'), b('Tuesday 6 March', 'Mardi 6 mars'), b('Thursday 6 May', 'Jeudi 6 mai'), b('Tuesday 16 March', 'Mardi 16 mars')]),
      hear('Le magasin ouvre à neuf heures et ferme à vingt et une heures.', b('When does the shop close?', 'À quelle heure ferme le magasin ?'), ['21 h', '20 h', '9 h', '19 h']),
      dlg(b('Booking an appointment', 'Prendre rendez-vous'), undefined, [['Secrétaire', 'f'], ['Vous', 'm']], [
        [0, 'Cabinet du docteur Roy, bonjour !', 'Dr Roy’s office, hello!'],
        [1, 'Bonjour, je voudrais un rendez-vous, s’il vous plaît.', 'Hello, I’d like an appointment, please.'],
        [0, 'Mardi prochain, à dix heures et quart, ça vous va ?', 'Next Tuesday at a quarter past ten, does that suit you?'],
        [1, { options: ['Mardi à dix heures et quart, parfait.', 'Mardi à dix heures moins le quart, parfait.', 'Jeudi à dix heures et demie, parfait.'] }],
      ], true),
      dict('Le cours commence à dix-neuf heures trente, le mercredi.', { voice: 'm' }),
    ],
    [
      b('24 h: seize heures trente. Everyday: quatre heures et demie.', '24 h : seize heures trente. Courant : quatre heures et demie.'),
      b('et quart = :15, et demie = :30, moins le quart = :45.', 'et quart = :15, et demie = :30, moins le quart = :45.'),
      b('Dates: le jeudi seize mars.', 'Dates : le jeudi seize mars.'),
    ],
    [['un rendez-vous', b('an appointment', 'rencontre prévue')], ['reporté', b('postponed', 'remis à plus tard')], ['un cabinet', b('a (doctor’s) office', 'lieu de consultation')]],
  ),
  lesson(C, 3, ['hearing-phone-numbers', 'entendre-les-numeros'],
    b('Hearing phone numbers', 'Entendre les numéros de téléphone'),
    b('Note phone numbers said in groups, as in Québec and France.', 'Noter des numéros dits par groupes, comme au Québec et en France.'),
    [b('Hear numbers in groups', 'Entendre les nombres par groupes'), b('Note a number from a voicemail', 'Noter un numéro sur une boîte vocale'), b('Check a number by repeating it', 'Vérifier un numéro en le répétant')],
    13,
    [
      card(b('Numbers in groups', 'Les numéros par groupes'), b('In **France**, numbers are said in pairs: 06 12 45 78 90 = zéro six, douze, quarante-cinq, soixante-dix-huit, quatre-vingt-dix. In **Québec**, often digit by digit or in groups: 514 555-0198 = cinq un quatre, cinq cinq cinq, zéro un neuf huit.', 'En **France**, on dit les numéros par paires : 06 12 45 78 90 = zéro six, douze, quarante-cinq, soixante-dix-huit, quatre-vingt-dix. Au **Québec**, souvent chiffre par chiffre ou par groupes : 514 555-0198 = cinq un quatre, cinq cinq cinq, zéro un neuf huit.')),
      hear('Mon numéro, c’est le zéro six, douze, quarante-cinq, soixante-dix-huit, quatre-vingt-dix.', b('Which number do you hear?', 'Quel numéro entendez-vous ?'), ['06 12 45 78 90', '06 12 45 68 90', '06 12 55 78 90', '06 02 45 78 90']),
      hear('Rappelez-moi au cinq un quatre, cinq cinq cinq, zéro un neuf huit.', b('Which number must you call?', 'Quel numéro devez-vous appeler ?'), ['514 555-0198', '514 555-0189', '541 555-0198', '514 555-1098']),
      hear('Le code de la porte, c’est quatre-vingt-trois, soixante-sept.', b('What is the door code?', 'Quel est le code de la porte ?'), ['8367', '4367', '8377', '2367']),
      tip(b('Repeat to check', 'Répétez pour vérifier'), b('On the phone, always **repeat** the number: **Je répète : cinq un quatre…** and ask **Vous pouvez répéter plus lentement, s’il vous plaît ?**', 'Au téléphone, **répétez** toujours le numéro : **Je répète : cinq un quatre…** et demandez **Vous pouvez répéter plus lentement, s’il vous plaît ?**')),
      dlg(b('Leaving a number', 'Laisser un numéro'), undefined, [['Réceptionniste', 'm'], ['Vous', 'f']], [
        [0, 'Je peux avoir votre numéro de téléphone ?', 'Can I have your phone number?'],
        [1, 'Oui, c’est le quatre trois huit, cinq cinq cinq, vingt-deux, quarante.', 'Yes, it’s 438 555 22 40.'],
        [0, 'Je répète : quatre trois huit, cinq cinq cinq, vingt-deux, quarante. C’est bien ça ?', 'Let me repeat: 438 555 22 40. Is that right?'],
        [1, { options: ['Oui, c’est bien ça, merci.', 'Non, c’est trente-deux, quarante.', 'Oui, c’est quatre-vingt-trois.'] }],
      ], true),
      dict('Appelez le cinq un quatre, cinq cinq cinq, zéro un neuf huit.', { voice: 'f' }),
    ],
    [
      b('France: numbers in pairs (zéro six, douze…). Québec: often digit by digit.', 'France : par paires (zéro six, douze…). Québec : souvent chiffre par chiffre.'),
      b('Check: Je répète… C’est bien ça ?', 'Vérifier : Je répète… C’est bien ça ?'),
      b('Ask: Vous pouvez répéter plus lentement ?', 'Demander : Vous pouvez répéter plus lentement ?'),
    ],
    [['rappeler', b('to call back', 'téléphoner de nouveau')], ['un code', b('a code', 'combinaison de chiffres')], ['lentement', b('slowly', 'pas vite')]],
  ),
];
