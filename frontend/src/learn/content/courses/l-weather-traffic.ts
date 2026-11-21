import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Will it snow tomorrow? Is the bridge closed? Radio weather forecasts and traffic reports are fast, full of numbers and specific words (averses, verglas, ressenti, entrave, voie fermée). This course trains your ear on them so you can plan your day: temperatures, wind chill, precipitation, alerts, closures and detours.',
    'Va-t-il neiger demain ? Le pont est-il fermé ? Les bulletins météo et les infos circulation à la radio sont rapides, pleins de chiffres et de mots spécifiques (averses, verglas, ressenti, entrave, voie fermée). Ce cours entraîne votre oreille à les comprendre pour organiser votre journée : températures, refroidissement éolien, précipitations, alertes, fermetures et détours.',
  ),
  outcomes: [
    b('Understand a weather forecast', 'Comprendre un bulletin météo'),
    b('Catch temperatures and wind chill', 'Saisir températures et refroidissement éolien'),
    b('Understand weather alerts', 'Comprendre les alertes météo'),
    b('Understand traffic reports and detours', 'Comprendre les infos circulation et les détours'),
  ],
};

const C = 'l-weather-traffic';
export default [
  lesson(C, 1, ['the-forecast', 'le-bulletin-meteo'],
    b('The weather forecast', 'Le bulletin météo'),
    b('Catch the sky, the temperatures and the precipitation.', 'Saisir le ciel, les températures et les précipitations.'),
    [b('Understand sky and precipitation words', 'Comprendre le vocabulaire du ciel et des précipitations'), b('Catch maximum and minimum temperatures', 'Saisir les températures maximales et minimales'), b('Understand the day’s evolution', 'Comprendre l’évolution de la journée')],
    13,
    [
      card(b('Forecast vocabulary', 'Le vocabulaire de la météo'), b('**ensoleillé, nuageux, couvert, des éclaircies** (sunny spells), **des averses** (showers), **de la pluie, de la neige, de la grêle**, **le maximum / le minimum**, **en matinée, en après-midi, en soirée, en fin de journée**.', '**ensoleillé, nuageux, couvert, des éclaircies**, **des averses**, **de la pluie, de la neige, de la grêle**, **le maximum / le minimum**, **en matinée, en après-midi, en soirée, en fin de journée**.')),
      hear('Demain, ciel nuageux en matinée, puis éclaircies en après-midi. Maximum de dix-huit degrés.', b('What will the afternoon be like?', 'Comment sera l’après-midi ?'), [b('Sunny spells, up to 18 °C', 'Des éclaircies, jusqu’à 18 °C'), b('Rainy all day', 'Pluvieux toute la journée'), b('Snow, 8 °C', 'De la neige, 8 °C'), b('Cloudy and cold', 'Nuageux et froid')]),
      hear('Averses de pluie en fin de journée, avec des vents de quarante kilomètres heure.', b('When will it rain?', 'Quand pleuvra-t-il ?'), [b('At the end of the day', 'En fin de journée'), b('In the morning', 'Le matin'), b('All night', 'Toute la nuit'), b('Not at all', 'Pas du tout')]),
      hear('Cette nuit, minimum de moins quatre degrés, avec un risque de gel au sol.', b('What is the minimum tonight?', 'Quel est le minimum cette nuit ?'), ['−4 °C', '4 °C', '−14 °C', '−40 °C']),
      sort(b('Good or bad weather?', 'Beau ou mauvais temps ?'), [b('good', 'beau'), b('bad', 'mauvais')], [['ensoleillé', 0], ['des averses', 1], ['des éclaircies', 0], ['de la grêle', 1], ['un ciel dégagé', 0], ['un orage', 1]], { listen: true }),
      pairs(P.match, [['une averse', b('a shower', 'pluie courte')], ['une éclaircie', b('a sunny spell', 'moment de soleil')], ['couvert', b('overcast', 'plein de nuages')], ['le gel', b('frost', 'eau qui gèle')]]),
      dict('Demain, ciel ensoleillé et maximum de vingt-deux degrés.', { voice: 'f' }),
    ],
    [
      b('Sky: ensoleillé, nuageux, couvert, éclaircies.', 'Ciel : ensoleillé, nuageux, couvert, éclaircies.'),
      b('Precipitation: averses, pluie, neige, grêle.', 'Précipitations : averses, pluie, neige, grêle.'),
      b('Time of day: en matinée, en après-midi, en fin de journée.', 'Moment : en matinée, en après-midi, en fin de journée.'),
    ],
    [['un orage', b('a thunderstorm', 'tempête avec éclairs')], ['dégagé', b('clear (sky)', 'sans nuages')], ['la grêle', b('hail', 'glace qui tombe')]],
  ),
  lesson(C, 2, ['wind-chill-and-alerts', 'ressenti-et-alertes'],
    b('Wind chill and weather alerts', 'Ressenti et alertes météo'),
    b('Understand winter forecasts, wind chill and official alerts.', 'Comprendre les prévisions d’hiver, le ressenti et les alertes officielles.'),
    [b('Understand le ressenti / le refroidissement éolien', 'Comprendre le ressenti / le refroidissement éolien'), b('Understand alerts and advice', 'Comprendre alertes et conseils'), b('Understand snow amounts', 'Comprendre les quantités de neige')],
    13,
    [
      card(b('Winter in Canada', 'L’hiver au Canada'), b('**le refroidissement éolien / le ressenti** (wind chill), **une tempête de neige**, **de la poudrerie** (blowing snow, Québec), **du verglas / de la pluie verglaçante** (freezing rain), **un avertissement** (warning), **une alerte**.', '**le refroidissement éolien / le ressenti**, **une tempête de neige**, **de la poudrerie** (Québec), **du verglas / de la pluie verglaçante**, **un avertissement**, **une alerte**.')),
      hear('Ce matin, moins vingt-deux degrés, ressenti moins trente-quatre avec le vent.', b('What does it feel like?', 'Quelle est la température ressentie ?'), ['−34 °C', '−22 °C', '−24 °C', '−43 °C']),
      hear('Environnement Canada émet un avertissement de pluie verglaçante pour la région de Québec. Évitez les déplacements non essentiels.', b('What is advised?', 'Que conseille-t-on ?'), [b('Avoid non-essential trips', 'Éviter les déplacements non essentiels'), b('Go out early', 'Sortir tôt'), b('Open the windows', 'Ouvrir les fenêtres'), b('Drive faster', 'Rouler plus vite')]),
      hear('On attend entre vingt et trente centimètres de neige d’ici demain matin, avec de la poudrerie.', b('How much snow is expected?', 'Combien de neige attend-on ?'), [b('20 to 30 cm', 'De 20 à 30 cm'), b('2 to 3 cm', 'De 2 à 3 cm'), b('30 to 40 cm', 'De 30 à 40 cm'), b('None', 'Aucune')]),
      tip(b('Alerts: listen for the action', 'Alertes : écoutez l’action'), b('After the weather facts, alerts give an **advice** in the imperative or infinitive: **Évitez…, Restez…, Prévoyez…, Soyez prudents.**', 'Après les faits météo, les alertes donnent un **conseil** à l’impératif ou à l’infinitif : **Évitez…, Restez…, Prévoyez…, Soyez prudents.**')),
      pairs(P.match, [['le ressenti', b('wind chill, “feels like”', 'température perçue')], ['la pluie verglaçante', b('freezing rain', 'pluie qui gèle au sol')], ['la poudrerie', b('blowing snow (Québec)', 'neige soulevée par le vent')], ['un avertissement', b('a warning', 'alerte officielle')]]),
      dict('Soyez prudents : la pluie verglaçante rend les routes très glissantes.', { voice: 'm' }),
    ],
    [
      b('ressenti / refroidissement éolien = wind chill.', 'ressenti / refroidissement éolien.'),
      b('verglas, pluie verglaçante, poudrerie, tempête de neige.', 'verglas, pluie verglaçante, poudrerie, tempête de neige.'),
      b('Alerts end with advice: Évitez…, Soyez prudents.', 'Les alertes finissent par un conseil : Évitez…, Soyez prudents.'),
    ],
    [['glissant', b('slippery', 'où l’on glisse')], ['émettre', b('to issue', 'publier')], ['non essentiel', b('non-essential', 'pas indispensable')]],
  ),
  lesson(C, 3, ['traffic-reports', 'infos-circulation'],
    b('Traffic reports', 'Les infos circulation'),
    b('Understand closures, slowdowns and detours on the radio.', 'Comprendre fermetures, ralentissements et détours à la radio.'),
    [b('Understand closures and slowdowns', 'Comprendre fermetures et ralentissements'), b('Understand detours', 'Comprendre les détours'), b('Choose your route', 'Choisir son itinéraire')],
    13,
    [
      card(b('Traffic vocabulary', 'Le vocabulaire de la circulation'), b('**une entrave** (an obstruction, Québec), **une voie fermée** (a lane closed), **un ralentissement** (slowdown), **un accrochage / un accident**, **un détour / une déviation**, **en direction de** (heading to), **à la hauteur de** (near, at the level of).', '**une entrave** (Québec), **une voie fermée**, **un ralentissement**, **un accrochage / un accident**, **un détour / une déviation**, **en direction de**, **à la hauteur de**.')),
      hear('Sur l’autoroute quarante en direction est, une voie est fermée à la hauteur de la sortie soixante-dix à cause d’un accrochage.', b('What is happening?', 'Que se passe-t-il ?'), [b('A lane is closed after a minor collision.', 'Une voie est fermée à cause d’un accrochage.'), b('The highway is completely closed.', 'L’autoroute est complètement fermée.'), b('There is no traffic.', 'Il n’y a aucune circulation.'), b('Exit 70 is open again.', 'La sortie 70 est rouverte.')]),
      hear('Le pont Jacques-Cartier sera complètement fermé ce week-end pour des travaux. Prévoyez un détour par le pont Champlain.', b('Which bridge should you take this weekend?', 'Quel pont faut-il prendre ce week-end ?'), [b('The Champlain Bridge', 'Le pont Champlain'), b('The Jacques-Cartier Bridge', 'Le pont Jacques-Cartier'), b('No bridge', 'Aucun pont'), b('Both', 'Les deux')]),
      hear('Ralentissements importants dans le tunnel Louis-Hippolyte-La Fontaine : comptez vingt-cinq minutes de plus.', b('How much extra time should you plan?', 'Combien de temps en plus faut-il prévoir ?'), [b('25 minutes', '25 minutes'), b('5 minutes', '5 minutes'), b('2 hours', '2 heures'), b('No extra time', 'Pas de temps en plus')]),
      tip(b('Listen for YOUR road', 'Écoutez VOTRE route'), b('Traffic reports list many roads quickly. Before listening, think of **your road and your direction**, and react only when you hear them.', 'Les infos circulation énumèrent vite de nombreuses routes. Avant d’écouter, pensez à **votre route et votre direction**, et ne réagissez que lorsque vous les entendez.')),
      pairs(P.match, [['une entrave', b('an obstruction (Québec)', 'obstacle à la circulation')], ['un accrochage', b('a minor collision', 'petit accident')], ['un détour', b('a detour', 'chemin de contournement')], ['à la hauteur de', b('at, near', 'au niveau de')]]),
      dict('Prévoyez un détour par le pont Champlain.', { voice: 'f' }),
    ],
    [
      b('entrave, voie fermée, ralentissement, accrochage, détour.', 'entrave, voie fermée, ralentissement, accrochage, détour.'),
      b('en direction de / à la hauteur de.', 'en direction de / à la hauteur de.'),
      b('Advice: Prévoyez…, Comptez… minutes de plus.', 'Conseil : Prévoyez…, Comptez… minutes de plus.'),
    ],
    [['un pont', b('a bridge', 'ouvrage pour traverser')], ['une sortie', b('an exit', 'bretelle de sortie')], ['un itinéraire', b('a route', 'chemin choisi')]],
  ),
];
