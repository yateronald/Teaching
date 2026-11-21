import type { CourseAbout } from '../../types';
import { b, card, culture, dict, doc, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Joyeux anniversaire ! Bonne année ! Joyeux Noël ! This course teaches the words and wishes for celebrations in French-speaking countries: birthdays and invitations, end-of-year holidays (Noël, le réveillon, le jour de l’An), and national and cultural holidays (14 juillet, Fête nationale du Québec, Aïd, Hanoukka, Diwali). You will learn to wish, invite, thank and talk about how you celebrate.',
    'Joyeux anniversaire ! Bonne année ! Joyeux Noël ! Ce cours présente les mots et les vœux des fêtes dans les pays francophones : anniversaires et invitations, fêtes de fin d’année (Noël, le réveillon, le jour de l’An), et fêtes nationales et culturelles (14 juillet, Fête nationale du Québec, Aïd, Hanoukka, Diwali). Vous apprendrez à souhaiter, inviter, remercier et raconter comment vous faites la fête.',
  ),
  outcomes: [
    b('Give the right wishes', 'Formuler les bons vœux'),
    b('Talk about birthdays and invitations', 'Parler d’anniversaires et d’invitations'),
    b('Know French and Québec holidays', 'Connaître les fêtes de France et du Québec'),
    b('Describe how you celebrate', 'Décrire comment vous faites la fête'),
  ],
};

const C = 'b-holidays-celebrations';
export default [
  lesson(C, 1, ['birthdays', 'les-anniversaires'],
    b('Birthdays', 'Les anniversaires'),
    b('Wish a happy birthday, invite and thank for a gift.', 'Souhaiter un bon anniversaire, inviter et remercier pour un cadeau.'),
    [b('Wish happy birthday', 'Souhaiter un bon anniversaire'), b('Invite to a party', 'Inviter à une fête'), b('Thank for a gift', 'Remercier pour un cadeau')],
    13,
    [
      card(b('Birthdays', 'Les anniversaires'), b('**Joyeux anniversaire ! · Bon anniversaire !** (Québec also: **Bonne fête !**) · **Tu as quel âge ? J’ai trente ans.** · **Je fête mon anniversaire samedi, tu viens ?** · **un gâteau, des bougies, un cadeau, souffler les bougies**. Thanks: **Merci, c’est trop gentil ! Il me plaît beaucoup.**', '**Joyeux anniversaire ! · Bon anniversaire !** (Québec aussi : **Bonne fête !**) · **Tu as quel âge ? J’ai trente ans.** · **Je fête mon anniversaire samedi, tu viens ?** · **un gâteau, des bougies, un cadeau, souffler les bougies**. Remercier : **Merci, c’est trop gentil ! Il me plaît beaucoup.**')),
      doc({ look: 'sms', title: b('Invitation', 'Invitation'), text: 'Coucou ! 🎉 Je fête mes 30 ans samedi 14, à partir de 19 h, chez moi (12 rue des Lilas). Apporte juste ta bonne humeur ! Réponds-moi avant jeudi. Bisous, Chloé' }, b('What must you do before Thursday?', 'Que faut-il faire avant jeudi ?'), [b('answer Chloé', 'répondre à Chloé'), b('buy a cake', 'acheter un gâteau'), b('bring a dish', 'apporter un plat'), b('call the restaurant', 'appeler le restaurant')]),
      mc(P.best, ['Merci, c’est trop gentil ! Il me plaît beaucoup.', 'Ah. Merci.', 'Je n’en voulais pas.', 'C’est combien ?'], { fr: 'Un ami vous offre un cadeau :' }),
      pairs(P.match, [['une bougie', b('a candle', 'sur le gâteau')], ['souffler', b('to blow (out)', 'éteindre avec la bouche')], ['fêter', b('to celebrate', 'célébrer')], ['Bonne fête !', b('Happy birthday! (Québec)', 'souhait d’anniversaire au Québec')]]),
      gap(P.complete, '___ anniversaire ! Tu as quel ___ aujourd’hui ?', [['Joyeux', 'Bon'], 'âge']),
      say('Joyeux anniversaire ! Je te souhaite une très belle journée.', 'Happy birthday! I wish you a lovely day.'),
    ],
    [
      b('Joyeux / Bon anniversaire ! (Québec: Bonne fête !)', 'Joyeux / Bon anniversaire ! (Québec : Bonne fête !)'),
      b('Je fête mon anniversaire… tu viens ?', 'Je fête mon anniversaire… tu viens ?'),
      b('Merci, c’est trop gentil !', 'Merci, c’est trop gentil !'),
    ],
    [['un cadeau', b('a gift', 'présent offert')], ['la bonne humeur', b('good mood', 'gaieté')], ['offrir', b('to give (a gift)', 'donner en cadeau')]],
  ),
  lesson(C, 2, ['end-of-year-holidays', 'les-fetes-de-fin-d-annee'],
    b('End-of-year holidays', 'Les fêtes de fin d’année'),
    b('Talk about Christmas, New Year’s Eve and New Year wishes.', 'Parler de Noël, du réveillon et des vœux du Nouvel An.'),
    [b('Give holiday wishes', 'Formuler les vœux des fêtes'), b('Understand le réveillon', 'Comprendre le réveillon'), b('Talk about traditions', 'Parler des traditions')],
    13,
    [
      card(b('The holidays', 'Les fêtes'), b('**Joyeux Noël ! · Joyeuses fêtes ! · Bonne année ! · Meilleurs vœux ! · Bonne et heureuse année !** **Le réveillon** = the big dinner on the evening of 24 December (Christmas) or 31 December (Saint-Sylvestre). Traditions: **le sapin, les décorations, la bûche de Noël, le foie gras** (France), **la tourtière, le temps des fêtes** (Québec), **la galette des rois** in January.', '**Joyeux Noël ! · Joyeuses fêtes ! · Bonne année ! · Meilleurs vœux ! · Bonne et heureuse année !** **Le réveillon** = le grand repas du soir du 24 décembre (Noël) ou du 31 décembre (Saint-Sylvestre). Traditions : **le sapin, les décorations, la bûche de Noël, le foie gras** (France), **la tourtière, le temps des fêtes** (Québec), **la galette des rois** en janvier.')),
      culture(b('Wishes until the end of January', 'Des vœux jusqu’à fin janvier'), b('In France, it is normal to wish **Bonne année !** to everyone you see for the first time in January, until about the end of the month. Companies send **cartes de vœux**. **Joyeuses fêtes** is a neutral wish that works for everyone, whatever their beliefs.', 'En France, on souhaite **Bonne année !** à chaque personne qu’on revoit en janvier, jusqu’à la fin du mois environ. Les entreprises envoient des **cartes de vœux**. **Joyeuses fêtes** est un souhait neutre qui convient à tout le monde, quelles que soient ses croyances.'), { variant: 'culture' }),
      mc(P.best, ['Bonne année ! Meilleurs vœux !', 'Joyeux anniversaire !', 'Bon appétit !', 'Bon voyage !'], { fr: 'Le 2 janvier, vous revoyez vos collègues :' }),
      hear('Pour le réveillon de Noël, on se retrouve chez mes parents. On mange de la dinde, et à minuit, on ouvre les cadeaux sous le sapin.', b('When do they open the gifts?', 'Quand ouvrent-ils les cadeaux ?'), [b('at midnight', 'à minuit'), b('in the morning', 'le matin'), b('at dinner', 'pendant le dîner'), b('on 31 December', 'le 31 décembre')], { voice: 'f' }),
      sort(b('Christmas or New Year?', 'Noël ou Nouvel An ?'), [b('Christmas', 'Noël'), b('New Year', 'Nouvel An')], [['le sapin', 0], ['la Saint-Sylvestre', 1], ['la bûche', 0], ['les bonnes résolutions', 1], ['le père Noël', 0], ['le compte à rebours', 1]]),
      say('Joyeuses fêtes et bonne année à toute ta famille !', 'Happy holidays and happy new year to your whole family!'),
    ],
    [
      b('Joyeux Noël ! Joyeuses fêtes ! Bonne année ! Meilleurs vœux !', 'Joyeux Noël ! Joyeuses fêtes ! Bonne année ! Meilleurs vœux !'),
      b('Le réveillon: dinner on 24 or 31 December.', 'Le réveillon : dîner du 24 ou du 31 décembre.'),
      b('Wish Bonne année until the end of January.', 'Souhaitez Bonne année jusqu’à fin janvier.'),
    ],
    [['le sapin', b('the Christmas tree', 'arbre de Noël')], ['une résolution', b('a resolution', 'promesse pour l’année')], ['le compte à rebours', b('the countdown', 'dix, neuf, huit…')]],
  ),
  lesson(C, 3, ['national-and-cultural-holidays', 'fetes-nationales-et-culturelles'],
    b('National and cultural holidays', 'Fêtes nationales et culturelles'),
    b('Know key holidays and describe how you celebrate a holiday from your culture.', 'Connaître les grandes fêtes et décrire comment vous célébrez une fête de votre culture.'),
    [b('Know France’s and Québec’s holidays', 'Connaître les fêtes de France et du Québec'), b('Wish for religious and cultural holidays', 'Souhaiter les fêtes religieuses et culturelles'), b('Describe your own celebration', 'Décrire votre propre fête')],
    13,
    [
      card(b('Holidays', 'Les fêtes'), b('France: **le 14 juillet** (fête nationale, feux d’artifice), **le 1er mai** (fête du Travail, muguet), **la fête de la Musique** (21 juin). Québec: **la Saint-Jean-Baptiste / Fête nationale** (24 juin), **la fête du Canada** (1er juillet), **l’Action de grâce** (October). Wishes: **Aïd Moubarak ! · Joyeux Hanoukka ! · Joyeux Diwali ! · Bonne fête nationale !**', 'France : **le 14 juillet** (fête nationale, feux d’artifice), **le 1er mai** (fête du Travail, muguet), **la fête de la Musique** (21 juin). Québec : **la Saint-Jean-Baptiste / Fête nationale** (24 juin), **la fête du Canada** (1er juillet), **l’Action de grâce** (octobre). Vœux : **Aïd Moubarak ! · Joyeux Hanoukka ! · Joyeux Diwali ! · Bonne fête nationale !**')),
      sort(b('France or Québec?', 'France ou Québec ?'), [b('France', 'France'), b('Québec / Canada', 'Québec / Canada')], [['le 14 juillet', 0], ['la Saint-Jean-Baptiste', 1], ['le muguet du 1er mai', 0], ['l’Action de grâce', 1], ['la fête de la Musique', 0], ['la fête du Canada', 1]]),
      mc(P.choose, [b('the 24th of June', 'le 24 juin'), b('the 14th of July', 'le 14 juillet'), b('the 1st of May', 'le 1er mai'), b('the 25th of December', 'le 25 décembre')], { fr: 'La Fête nationale du Québec a lieu…' }),
      dict('Le 14 juillet, il y a un défilé le matin et des feux d’artifice le soir.', {}),
      write(b('A holiday you celebrate', 'Une fête que vous célébrez'), b('Describe a holiday you celebrate (35–60 words): when it is, what you eat, what you do, who you are with.', 'Décrivez une fête que vous célébrez (35–60 mots) : quand elle a lieu, ce que vous mangez, ce que vous faites, avec qui.'), 35, 60, [
        b('When', 'Quand'),
        b('Food and activities', 'Repas et activités'),
        b('Who you celebrate with', 'Avec qui'),
      ], 'Chez moi, la fête la plus importante, c’est l’Aïd. Le matin, nous mettons de beaux vêtements et nous allons rendre visite à la famille. Nous mangeons des pâtisseries et un grand repas avec de l’agneau. Les enfants reçoivent des cadeaux. C’est une journée très joyeuse !'),
    ],
    [
      b('France: 14 juillet, 1er mai, fête de la Musique.', 'France : 14 juillet, 1er mai, fête de la Musique.'),
      b('Québec: 24 juin, 1er juillet, Action de grâce.', 'Québec : 24 juin, 1er juillet, Action de grâce.'),
      b('Wishes: Aïd Moubarak, Joyeux Hanoukka, Joyeux Diwali.', 'Vœux : Aïd Moubarak, Joyeux Hanoukka, Joyeux Diwali.'),
    ],
    [['un défilé', b('a parade', 'marche officielle')], ['des feux d’artifice', b('fireworks', 'lumières dans le ciel')], ['le muguet', b('lily of the valley', 'fleur du 1er mai')]],
  ),
];
