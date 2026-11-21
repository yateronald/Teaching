import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In French, the possessive agrees with the thing owned, not with the owner: sa voiture can be his car or her car. This course teaches mon, ma, mes and the full set (ton, son, notre, votre, leur), the mon-before-a-vowel rule (mon amie), and how to talk about your family, your home and your belongings without the classic mistakes.',
    'En français, le possessif s’accorde avec la chose possédée, pas avec le possesseur : sa voiture peut être la voiture d’un homme ou d’une femme. Ce cours présente mon, ma, mes et toute la série (ton, son, notre, votre, leur), la règle de mon devant une voyelle (mon amie), et la façon de parler de sa famille, de son logement et de ses affaires sans les erreurs classiques.',
  ),
  outcomes: [
    b('Use mon, ma, mes, ton, ta, tes, son, sa, ses', 'Employer mon, ma, mes, ton, ta, tes, son, sa, ses'),
    b('Use notre, votre, leur and their plurals', 'Employer notre, votre, leur et leurs pluriels'),
    b('Apply mon / ton / son before a vowel', 'Appliquer mon / ton / son devant une voyelle'),
    b('Talk about your family and belongings', 'Parler de sa famille et de ses affaires'),
  ],
};

const C = 'possessives';
export default [
  lesson(C, 1, ['my-your-his-her', 'mon-ton-son'],
    b('Mon, ton, son: one owner', 'Mon, ton, son : un seul possesseur'),
    b('Choose mon / ma / mes, ton / ta / tes and son / sa / ses according to the noun.', 'Choisir mon / ma / mes, ton / ta / tes et son / sa / ses selon le nom.'),
    [b('Agree the possessive with the noun', 'Accorder le possessif avec le nom'), b('Understand son / sa for “his” and “her”', 'Comprendre son / sa pour « his » et « her »'), b('Use mon before a vowel', 'Employer mon devant une voyelle')],
    13,
    [
      card(b('Agree with the thing owned', 'Accord avec l’objet possédé'), b('The possessive takes the gender and number of the **noun**: **mon frère** (m.), **ma sœur** (f.), **mes parents** (pl.). **Son / sa / ses** mean both **his** and **her**: **sa voiture** = his car or her car.', 'Le possessif prend le genre et le nombre du **nom** : **mon frère** (m.), **ma sœur** (f.), **mes parents** (pl.). **Son / sa / ses** correspondent à la fois à **his** et **her** : **sa voiture** = la voiture de lui ou d’elle.'), {
        table: { head: ['', b('masculine', 'masculin'), b('feminine', 'féminin'), b('plural', 'pluriel')], rows: [['je', 'mon', 'ma', 'mes'], ['tu', 'ton', 'ta', 'tes'], ['il / elle', 'son', 'sa', 'ses']] },
        ex: [['Mon frère habite à Lyon.', 'My brother lives in Lyon.'], ['Paul adore sa grand-mère.', 'Paul loves his grandmother.'], ['Julie cherche son téléphone.', 'Julie is looking for her phone.']],
      }),
      tip(b('Mon before a vowel', 'Mon devant une voyelle'), b('Before a feminine noun starting with a vowel or a silent h, **ma, ta, sa** become **mon, ton, son**, for the sound: **mon amie**, **ton école**, **son histoire**.', 'Devant un nom féminin qui commence par une voyelle ou un h muet, **ma, ta, sa** deviennent **mon, ton, son**, pour le son : **mon amie**, **ton école**, **son histoire**.'), {
        ex: [['C’est mon amie Clara.', 'This is my friend Clara.'], ['Ton adresse, s’il te plaît ?', 'Your address, please?']],
      }),
      mc(P.word, ['ma', 'mon', 'mes', 'me'], { fr: 'Je te présente ___ mère.' }),
      mc(P.word, ['mon', 'ma', 'mes', 'm’'], { fr: 'Voici ___ adresse e-mail.', explain: b('Adresse is feminine but starts with a vowel: mon.', 'Adresse est féminin mais commence par une voyelle : mon.') }),
      mc(P.best, ['Marc cherche ses clés.', 'Marc cherche leurs clés.', 'Marc cherche sa clés.', 'Marc cherche son clés.']),
      mc(P.meaning, [b('her husband or his husband: the noun decides', 'le mari de quelqu’un : le nom décide'), b('only her husband', 'seulement le mari d’une femme'), b('their husband', 'le mari de plusieurs personnes'), b('my husband', 'mon mari')], { fr: 'son mari' }),
      gap(P.complete, 'Je vis avec ___ femme et ___ deux enfants. ___ fils a sept ans.', ['ma', 'mes', 'Mon'], { choices: [['ma', 'mon', 'mes'], ['ma', 'mon', 'mes'], ['Mon', 'Ma', 'Mes']] }),
      ord(P.order, 'Tu as ton passeport et ta carte ?', { tr: 'Do you have your passport and your card?' }),
      say('Ma sœur et mon frère habitent à Toronto avec leurs enfants.', 'My sister and my brother live in Toronto with their children.'),
    ],
    [
      b('The possessive agrees with the noun owned: mon livre, ma maison, mes clés.', 'Le possessif s’accorde avec le nom possédé : mon livre, ma maison, mes clés.'),
      b('Son / sa / ses = his or her.', 'Son / sa / ses = de lui ou d’elle.'),
      b('Mon, ton, son before a feminine noun starting with a vowel: mon amie.', 'Mon, ton, son devant un nom féminin à voyelle initiale : mon amie.'),
    ],
    [['la clé', b('the key', 'objet pour ouvrir une porte')], ['le fils', b('the son', 'enfant garçon')], ['une adresse', b('an address', 'lieu où l’on habite')]],
  ),
  lesson(C, 2, ['our-your-their', 'notre-votre-leur'],
    b('Notre, votre, leur: several owners', 'Notre, votre, leur : plusieurs possesseurs'),
    b('Use notre / nos, votre / vos and leur / leurs, and the polite votre.', 'Employer notre / nos, votre / vos et leur / leurs, et le votre de politesse.'),
    [b('Use notre and nos', 'Employer notre et nos'), b('Use votre and vos, also to be polite', 'Employer votre et vos, aussi pour la politesse'), b('Never add -s to leur before a singular noun', 'Ne jamais mettre de -s à leur devant un singulier')],
    13,
    [
      card(b('Plural owners', 'Plusieurs possesseurs'), b('With several owners there is no gender, only number: **notre / nos**, **votre / vos**, **leur / leurs**. **Votre / vos** is also the polite form for one person: **Votre passeport, madame.**', 'Avec plusieurs possesseurs, pas de genre, seulement le nombre : **notre / nos**, **votre / vos**, **leur / leurs**. **Votre / vos** sert aussi de forme polie pour une seule personne : **Votre passeport, madame.**'), {
        table: { head: ['', b('one thing', 'un objet'), b('several things', 'plusieurs objets')], rows: [['nous', 'notre', 'nos'], ['vous', 'votre', 'vos'], ['ils / elles', 'leur', 'leurs']] },
        ex: [['Notre appartement est petit.', 'Our flat is small.'], ['Vos papiers, s’il vous plaît.', 'Your papers, please.'], ['Ils adorent leurs voisins.', 'They love their neighbours.']],
      }),
      trap(b('Leur or leurs?', 'Leur ou leurs ?'), b('**Leur** + singular noun, **leurs** + plural noun: **leur fille**, **leurs filles**. And **leur** before a verb is a pronoun, never with -s: **je leur parle**.', '**Leur** + nom singulier, **leurs** + nom pluriel : **leur fille**, **leurs filles**. Et **leur** devant un verbe est un pronom, jamais avec -s : **je leur parle**.')),
      mc(P.word, ['nos', 'notre', 'nous', 'notres'], { fr: 'Nous invitons ___ amis samedi.' }),
      mc(P.word, ['leur', 'leurs', 'son', 'ses'], { fr: 'Les Martin vendent ___ maison.' }),
      mc(P.word, ['votre', 'vos', 'ton', 'leur'], { fr: 'Monsieur, ___ billet, s’il vous plaît.', explain: b('Polite address to one person: votre.', 'Vouvoiement d’une personne : votre.') }),
      sort(b('Singular or plural noun?', 'Nom singulier ou pluriel ?'), [b('leur …', 'leur …'), b('leurs …', 'leurs …')], [['voiture', 0], ['enfants', 1], ['quartier', 0], ['vacances', 1], ['professeure', 0], ['bagages', 1]]),
      gap(P.complete, 'Les étudiants ont oublié ___ livres, mais ils ont ___ ordinateur.', ['leurs', 'leur']),
      dlg(b('At the hotel desk', 'À la réception de l’hôtel'), undefined, [['Réceptionniste', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour ! Vous avez une réservation ?', 'Hello! Do you have a booking?'],
        [1, { options: ['Oui, au nom de Silva. Voici nos passeports.', 'Oui, au nom de Silva. Voici notre passeports.', 'Oui. Voici leurs passeports à nous.'] }],
        [0, 'Merci. Votre chambre est au troisième étage.', 'Thank you. Your room is on the third floor.'],
        [1, { options: ['Parfait. Et nos valises, on les laisse ici ?', 'Parfait. Et notres valises ?', 'Parfait. Et vos valises de nous ?'] }],
      ]),
      dict('Nos voisins promènent leur chien avec leurs enfants.', { voice: 'm' }),
    ],
    [
      b('notre / nos, votre / vos, leur / leurs: no gender, only number.', 'notre / nos, votre / vos, leur / leurs : pas de genre, seulement le nombre.'),
      b('Votre / vos is also the polite “your” for one person.', 'Votre / vos est aussi le possessif de politesse pour une personne.'),
      b('leur + singular, leurs + plural; leur before a verb never takes -s.', 'leur + singulier, leurs + pluriel ; leur devant un verbe ne prend jamais de -s.'),
    ],
    [['une valise', b('a suitcase', 'bagage')], ['le quartier', b('the neighbourhood', 'partie d’une ville')], ['promener le chien', b('to walk the dog', 'sortir le chien')]],
  ),
  lesson(C, 3, ['family-and-belongings', 'famille-et-affaires'],
    b('Talking about your family and your things', 'Parler de sa famille et de ses affaires'),
    b('Use every possessive to present your family, your home and lost-and-found items.', 'Employer tous les possessifs pour présenter sa famille, son logement et des objets perdus.'),
    [b('Present your family tree', 'Présenter son arbre généalogique'), b('Ask “Is it yours?” politely', 'Demander poliment « C’est à vous ? »'), b('Use à moi, à toi to show ownership', 'Employer à moi, à toi pour la possession')],
    13,
    [
      card(b('The family', 'La famille'), b('Learn the key words with their possessive: **mon père, ma mère, mes grands-parents, mon oncle, ma tante, mon cousin, ma cousine, mon mari, ma femme, mon / ma conjoint(e)**. In Québec, **mon chum** (boyfriend) and **ma blonde** (girlfriend) are common.', 'Retenez les mots clés avec leur possessif : **mon père, ma mère, mes grands-parents, mon oncle, ma tante, mon cousin, ma cousine, mon mari, ma femme, mon / ma conjoint(e)**. Au Québec, **mon chum** et **ma blonde** sont très courants.'), {
        ex: [['Mes grands-parents vivent à la campagne.', 'My grandparents live in the countryside.'], ['Ma tante est la sœur de mon père.', 'My aunt is my father’s sister.'], ['Mon conjoint travaille de nuit.', 'My partner works nights.']],
      }),
      tip(b('À moi, à toi: who owns it?', 'À moi, à toi : à qui est-ce ?'), b('To ask or say who owns something: **C’est à qui ? – C’est à moi / à toi / à lui / à elle / à nous / à vous / à eux.** **C’est à vous, ce sac ?**', 'Pour demander ou dire à qui appartient un objet : **C’est à qui ? – C’est à moi / à toi / à lui / à elle / à nous / à vous / à eux.** **C’est à vous, ce sac ?**'), {
        ex: [['Ce parapluie, c’est à vous ?', 'This umbrella, is it yours?'], ['Non, c’est à elle.', 'No, it’s hers.']],
      }),
      pairs(P.match, [['ma belle-mère', b('my mother-in-law / stepmother', 'la mère du conjoint')], ['mes petits-enfants', b('my grandchildren', 'les enfants de mes enfants')], ['mon neveu', b('my nephew', 'le fils de mon frère ou de ma sœur')], ['ma cousine', b('my (female) cousin', 'la fille de mon oncle')]]),
      mc(P.best, ['C’est à moi.', 'C’est mon.', 'C’est à mon.', 'C’est le moi.'], { fr: '— Ce téléphone est à qui ?' }),
      mc(P.word, ['sa', 'son', 'ses', 'leur'], { fr: 'Ma sœur vit avec ___ fille à Laval.' }),
      gap(P.completeText, 'Dans ___ famille, nous sommes cinq : ___ parents, ___ deux frères et moi. ___ appartement est près de ___ école.', ['ma', 'mes', 'mes', 'Notre', 'mon'], { choices: [['ma', 'mon'], ['mes', 'ma'], ['mes', 'mon'], ['Notre', 'Nos'], ['mon', 'ma']] }),
      dlg(b('Lost property', 'Aux objets trouvés'), b('At the lost-and-found desk of a train station.', 'Au bureau des objets trouvés d’une gare.'), [['Agent', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour, je peux vous aider ?', 'Hello, can I help you?'],
        [1, { options: ['Oui, j’ai perdu mon sac à dos hier, dans le train de 18 h.', 'Oui, j’ai perdu ma sac à dos hier.', 'Oui, j’ai perdu le mien sac hier.'] }],
        [0, 'Il est comment, votre sac ?', 'What does your bag look like?'],
        [1, { options: ['Il est bleu, avec mes clés et mon portefeuille dedans.', 'Il est bleu, avec ma clés et ma portefeuille.', 'Il est bleu, avec leurs clés.'] }],
        [0, 'Ah, celui-ci ? Il est à vous ?', 'Ah, this one? Is it yours?'],
        [1, { options: ['Oui, c’est à moi ! Merci beaucoup !', 'Oui, c’est mon !', 'Oui, il est le mien de moi !'] }],
      ]),
      say('Je vous présente ma famille : mon mari, mes deux filles et notre chien.', 'Let me introduce my family: my husband, my two daughters and our dog.'),
    ],
    [
      b('Family: mon père, ma mère, mes grands-parents, mon oncle, ma tante, mon neveu, ma nièce.', 'Famille : mon père, ma mère, mes grands-parents, mon oncle, ma tante, mon neveu, ma nièce.'),
      b('Ownership: C’est à qui ? – C’est à moi / à toi / à lui / à elle.', 'Possession : C’est à qui ? – C’est à moi / à toi / à lui / à elle.'),
      b('Québec: mon chum (boyfriend), ma blonde (girlfriend).', 'Au Québec : mon chum, ma blonde.'),
    ],
    [['le portefeuille', b('the wallet', 'pochette pour l’argent')], ['le conjoint, la conjointe', b('the partner, spouse', 'l’époux ou le partenaire')], ['les objets trouvés', b('lost and found', 'service des objets perdus')]],
  ),
];
