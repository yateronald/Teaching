import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je vais en France, au Canada, aux États-Unis, à Montréal: the preposition depends on the gender and number of the country. This course gives you the simple rules (en for feminine countries, au for masculine, aux for plural, à for cities), the same logic for coming back (de France, du Canada, des États-Unis), and the words for provinces, regions and islands, so you can talk about your journeys and your origins with confidence.',
    'Je vais en France, au Canada, aux États-Unis, à Montréal : la préposition dépend du genre et du nombre du pays. Ce cours donne les règles simples (en pour les pays féminins, au pour les masculins, aux pour les pluriels, à pour les villes), la même logique pour la provenance (de France, du Canada, des États-Unis), et les cas des provinces, régions et îles, pour parler de vos voyages et de vos origines avec assurance.',
  ),
  outcomes: [
    b('Use en, au, aux and à with places', 'Employer en, au, aux et à avec les lieux'),
    b('Say where you come from: de, du, des', 'Dire d’où l’on vient : de, du, des'),
    b('Recognise the gender of countries', 'Reconnaître le genre des pays'),
    b('Talk about trips and origins', 'Parler de voyages et d’origines'),
  ],
};

const C = 'countries-cities';
export default [
  lesson(C, 1, ['going-to-a-country', 'aller-dans-un-pays'],
    b('En France, au Canada, aux États-Unis', 'En France, au Canada, aux États-Unis'),
    b('Choose the preposition from the gender and number of the country.', 'Choisir la préposition selon le genre et le nombre du pays.'),
    [b('Recognise feminine and masculine countries', 'Reconnaître les pays féminins et masculins'), b('Use en, au and aux', 'Employer en, au et aux'), b('Use à with cities', 'Employer à avec les villes')],
    13,
    [
      card(b('The rule', 'La règle'), b('Countries ending in **-e** are usually **feminine** → **en**: en France, en Italie, en Chine. Other countries are **masculine** → **au**: au Canada, au Japon, au Maroc. Plural countries → **aux**: aux États-Unis, aux Pays-Bas. Cities → **à**: à Paris, à Dakar.', 'Les pays terminés par **-e** sont en général **féminins** → **en** : en France, en Italie, en Chine. Les autres sont **masculins** → **au** : au Canada, au Japon, au Maroc. Pluriel → **aux** : aux États-Unis, aux Pays-Bas. Villes → **à** : à Paris, à Dakar.'), {
        table: { head: [b('country', 'pays'), b('preposition', 'préposition'), b('example', 'exemple')], rows: [[b('feminine', 'féminin'), 'en', 'en Espagne'], [b('masculine', 'masculin'), 'au', 'au Brésil'], [b('plural', 'pluriel'), 'aux', 'aux Philippines'], [b('city', 'ville'), 'à', 'à Toronto']] },
        ex: [['J’habite en Belgique.', 'I live in Belgium.'], ['Mes parents vivent au Sénégal.', 'My parents live in Senegal.'], ['Je pars aux États-Unis.', 'I’m going to the United States.']],
      }),
      trap(b('Exceptions and vowels', 'Exceptions et voyelles'), b('**le Mexique, le Cambodge, le Mozambique** end in -e but are masculine: **au Mexique**. Masculine countries starting with a vowel take **en**: **en Iran, en Israël, en Afghanistan**.', '**le Mexique, le Cambodge, le Mozambique** finissent par -e mais sont masculins : **au Mexique**. Les pays masculins à voyelle initiale prennent **en** : **en Iran, en Israël, en Afghanistan**.')),
      sort(b('En, au or aux?', 'En, au ou aux ?'), ['en', 'au', 'aux'], [['Allemagne', 0], ['Portugal', 1], ['Pays-Bas', 2], ['Inde', 0], ['Pérou', 1], ['Émirats arabes unis', 2], ['Mexique', 1], ['Algérie', 0]]),
      mc(P.word, ['au', 'en', 'à', 'aux'], { fr: 'Elle travaille ___ Japon depuis un an.' }),
      mc(P.word, ['à', 'en', 'au', 'dans'], { fr: 'Nous habitons ___ Montréal.' }),
      mc(P.word, ['en', 'au', 'à', 'aux'], { fr: 'Ils sont partis ___ Iran pour les vacances.', explain: b('Masculine but starts with a vowel: en.', 'Masculin mais commence par une voyelle : en.') }),
      gap(P.complete, 'L’été prochain, je vais ___ Italie, puis ___ Rome et ___ Maroc.', ['en', 'à', 'au']),
      say('Je suis né au Brésil, j’ai étudié en France et maintenant je vis au Canada.', 'I was born in Brazil, studied in France and now live in Canada.'),
    ],
    [
      b('Feminine countries (mostly in -e): en. Masculine: au. Plural: aux. Cities: à.', 'Pays féminins (souvent en -e) : en. Masculins : au. Pluriel : aux. Villes : à.'),
      b('Exceptions: au Mexique, au Cambodge, au Mozambique.', 'Exceptions : au Mexique, au Cambodge, au Mozambique.'),
      b('Masculine + vowel: en Iran, en Israël.', 'Masculin + voyelle : en Iran, en Israël.'),
    ],
    [['les Pays-Bas', b('the Netherlands', 'pays d’Europe')], ['l’Allemagne', b('Germany', 'pays d’Europe')], ['vivre', b('to live', 'habiter')]],
  ),
  lesson(C, 2, ['coming-from-a-country', 'venir-d-un-pays'],
    b('De France, du Canada, des États-Unis', 'De France, du Canada, des États-Unis'),
    b('Say where you come from or where you return from.', 'Dire d’où l’on vient ou d’où l’on revient.'),
    [b('Use de / d’ with feminine countries', 'Employer de / d’ avec les pays féminins'), b('Use du and des', 'Employer du et des'), b('Introduce your origins', 'Présenter ses origines')],
    13,
    [
      card(b('Coming from', 'La provenance'), b('Same logic with **de**: feminine → **de / d’** (de France, d’Italie), masculine → **du** (du Canada, du Japon), plural → **des** (des États-Unis), city → **de / d’** (de Paris, d’Ottawa).', 'Même logique avec **de** : féminin → **de / d’** (de France, d’Italie), masculin → **du** (du Canada, du Japon), pluriel → **des** (des États-Unis), ville → **de / d’** (de Paris, d’Ottawa).'), {
        ex: [['Je viens d’Espagne.', 'I come from Spain.'], ['Il rentre du Vietnam demain.', 'He returns from Vietnam tomorrow.'], ['Ce vin vient du Chili.', 'This wine comes from Chile.'], ['Elle arrive des Philippines.', 'She’s arriving from the Philippines.']],
      }),
      mc(P.word, ['du', 'de', 'des', 'd’'], { fr: 'Mon collègue vient ___ Cameroun.' }),
      mc(P.word, ['d’', 'du', 'de la', 'des'], { fr: 'Ces oranges viennent ___ Espagne.' }),
      mc(P.word, ['des', 'du', 'de', 'aux'], { fr: 'Nous revenons ___ États-Unis.' }),
      pairs(P.match, [['Je viens du Liban.', b('I come from Lebanon.', 'origine : Liban')], ['Il est originaire d’Haïti.', b('He is from Haiti.', 'origine : Haïti')], ['Elle rentre de Chine.', b('She is coming back from China.', 'retour de Chine')], ['On arrive des Antilles.', b('We are arriving from the West Indies.', 'arrivée des Antilles')]]),
      gap(P.complete, 'Ma mère vient ___ Colombie et mon père ___ Pérou.', ['de', 'du']),
      hear('Bonjour, je m’appelle Diego, je viens du Mexique et j’habite à Québec depuis un an.', b('Where is Diego from?', 'D’où vient Diego ?'), [b('Mexico', 'du Mexique'), b('Québec City', 'de Québec'), b('Spain', 'd’Espagne'), b('Peru', 'du Pérou')]),
      dlg(b('At a welcome workshop', 'À un atelier d’accueil'), undefined, [['Animatrice', 'f'], ['Vous', 'm']], [
        [0, 'Bienvenue ! Vous venez d’où ?', 'Welcome! Where are you from?'],
        [1, { options: ['Je viens du Maroc, de Casablanca.', 'Je viens de Maroc, du Casablanca.', 'Je viens au Maroc, à Casablanca.'] }],
        [0, 'Et vous êtes arrivé quand au Québec ?', 'And when did you arrive in Québec?'],
        [1, { options: ['Il y a six mois. Avant, j’ai vécu deux ans en France.', 'Il y a six mois. Avant, j’ai vécu deux ans au France.', 'Depuis six mois. Avant, à France.'] }],
      ]),
    ],
    [
      b('de / d’ + feminine country, du + masculine, des + plural, de + city.', 'de / d’ + pays féminin, du + masculin, des + pluriel, de + ville.'),
      b('Je viens d’Italie, du Canada, des États-Unis, de Lyon.', 'Je viens d’Italie, du Canada, des États-Unis, de Lyon.'),
      b('être originaire de = to be from.', 'être originaire de = venir de (origine).'),
    ],
    [['être originaire de', b('to be from', 'avoir ses origines dans')], ['rentrer', b('to return home', 'revenir')], ['les Antilles', b('the West Indies', 'îles des Caraïbes')]],
  ),
  lesson(C, 3, ['provinces-regions-islands', 'provinces-regions-iles'],
    b('Provinces, regions and islands', 'Provinces, régions et îles'),
    b('Apply the rule to provinces, states, regions and islands, and talk about a trip.', 'Appliquer la règle aux provinces, États, régions et îles, et raconter un voyage.'),
    [b('Use au Québec, en Ontario, en Bretagne', 'Employer au Québec, en Ontario, en Bretagne'), b('Use à with most islands', 'Employer à avec la plupart des îles'), b('Tell the story of a trip', 'Raconter un voyage')],
    13,
    [
      card(b('Provinces and regions', 'Provinces et régions'), b('Same rule: **au Québec, au Manitoba, au Nouveau-Brunswick** (masculine), **en Ontario, en Alberta, en Colombie-Britannique, en Nouvelle-Écosse** (feminine or vowel), **en Bretagne, en Provence**. US states: **en Californie, au Texas**.', 'Même règle : **au Québec, au Manitoba, au Nouveau-Brunswick** (masculins), **en Ontario, en Alberta, en Colombie-Britannique, en Nouvelle-Écosse** (féminins ou voyelle), **en Bretagne, en Provence**. États américains : **en Californie, au Texas**.'), {
        ex: [['J’ai de la famille en Ontario.', 'I have family in Ontario.'], ['Il fait très froid au Manitoba.', 'It’s very cold in Manitoba.']],
      }),
      tip(b('Islands', 'Les îles'), b('Most small islands take **à** without an article: **à Cuba, à Madagascar, à Tahiti, à Haïti**. Some take **en** or **à la**: **en Corse, en Sicile, à la Martinique, à la Réunion**.', 'La plupart des petites îles prennent **à** sans article : **à Cuba, à Madagascar, à Tahiti, à Haïti**. Certaines prennent **en** ou **à la** : **en Corse, en Sicile, à la Martinique, à la Réunion**.')),
      mc(P.word, ['au', 'en', 'à', 'dans le'], { fr: 'Elle vit ___ Québec, à Trois-Rivières.' }),
      mc(P.word, ['en', 'au', 'à', 'aux'], { fr: 'Mon frère travaille ___ Colombie-Britannique.' }),
      mc(P.word, ['à', 'en', 'au', 'aux'], { fr: 'Nous allons passer une semaine ___ Cuba.' }),
      gap(P.completeText, 'L’été dernier, je suis allé ___ Nouvelle-Écosse, puis ___ Nouveau-Brunswick. Cet hiver, je pars ___ Martinique.', ['en', 'au', ['à la', 'en']]),
      ord(P.order, 'Ma famille habite au Québec, mais moi, je vis en Ontario.', { tr: 'My family lives in Québec, but I live in Ontario.' }),
      say('L’année dernière, j’ai visité le Canada : je suis allée au Québec, en Ontario et en Colombie-Britannique.', 'Last year I visited Canada: I went to Québec, Ontario and British Columbia.'),
      dict('Je suis né en Haïti, mais j’ai grandi au Québec.', { voice: 'm' }),
    ],
    [
      b('Provinces: au Québec, au Manitoba, en Ontario, en Alberta, en Colombie-Britannique.', 'Provinces : au Québec, au Manitoba, en Ontario, en Alberta, en Colombie-Britannique.'),
      b('Most islands: à Cuba, à Madagascar; but en Corse, à la Martinique.', 'La plupart des îles : à Cuba, à Madagascar ; mais en Corse, à la Martinique.'),
      b('Haïti: en Haïti or à Haïti (both used).', 'Haïti : en Haïti ou à Haïti (les deux s’emploient).'),
    ],
    [['grandir', b('to grow up', 'devenir adulte')], ['l’année dernière', b('last year', 'l’an passé')], ['la Colombie-Britannique', b('British Columbia', 'province de l’Ouest canadien')]],
  ),
];
