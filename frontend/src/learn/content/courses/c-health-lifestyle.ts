import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, doc, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Conversations with friends and colleagues often turn to sleep, stress at work, food habits and how hard it is to keep new routines going. This B1 conversation course equips you with natural, non-preachy French to talk about insomnia, unplugging from screens, balanced eating without guilt, and contrasting past habits (imparfait) with realistic lifestyle changes.',
    'Les conversations entre amis ou collègues reviennent souvent sur le sommeil, le stress au travail, l’alimentation et la difficulté de tenir de nouvelles habitudes. Ce cours de conversation B1 vous donne un français naturel et sans morale pour parler d’insomnie, de déconnexion, d’équilibre alimentaire sans culpabiliser, et pour opposer anciennes habitudes (imparfait) et changements réalistes.',
  ),
  outcomes: [
    b('Discuss sleep, stress and unplugging naturally', 'Parler de sommeil, de stress et de déconnexion'),
    b('Talk about food and exercise with balance', 'Évoquer alimentation et sport avec nuance'),
    b('Contrast past habits with current routines', 'Opposer anciennes habitudes et routine actuelle'),
    b('Share practical wellbeing tips in conversation', 'Partager des conseils concrets sans faire la morale'),
  ],
};

const C = 'c-health-lifestyle';
export default [
  lesson(C, 1, ['talking-about-sleep-and-stress', 'sommeil-et-stress'],
    b('Sleep, stress & switching off', 'Sommeil, stress et déconnexion'),
    b('Talk naturally about fatigue, sleepless nights, screens and slowing down.', 'Parler naturellement de fatigue, de nuits courtes, d’écrans et de lever le pied.'),
    [b('Describe sleep difficulties naturally', 'Décrire des difficultés de sommeil'), b('Talk about work stress and unplugging', 'Parler de stress et de déconnexion'), b('Understand practical sleep stories', 'Comprendre un témoignage sur le sommeil')],
    13,
    [
      card(b('Sleep & stress', 'Sommeil et charge mentale'), b('Sleep: **avoir du mal à s’endormir, avoir le sommeil léger, se réveiller en pleine nuit, tourner dans son lit**. Stress & relief: **être débordé(e), ne pas arriver à décrocher, lever le pied, couper les écrans, décompresser**.', 'Sommeil : **avoir du mal à s’endormir, avoir le sommeil léger, se réveiller en pleine nuit, tourner dans son lit**. Stress et détente : **être débordé(e), ne pas arriver à décrocher, lever le pied, couper les écrans, décompresser**.'), {
        ex: [['En ce moment, j’ai beaucoup de mal à décrocher le soir.', 'At the moment, I really struggle to switch off in the evening.'], ['Il faudrait vraiment que je lève le pied cette semaine.', 'I really ought to ease off a bit this week.']],
      }),
      dlg(b('Coffee break chat', 'Discussion à la pause café'), undefined, [['Amélie', 'f'], ['Vous', 'm']], [
        [0, 'Tu as l’air un peu fatigué aujourd’hui, tu as mal dormi ?', 'You look a bit tired today, did you sleep badly?'],
        [1, { options: ['Oui, je n’arrive pas à décrocher le soir et je mets une heure à m’endormir.', 'Oui, je suis lit.', 'Non, j’ai dormi trop bien fatigué.'] }],
        [0, 'Je connais ça ! Moi, j’ai arrêté de regarder mon téléphone après vingt-deux heures.', 'I know that feeling! I stopped looking at my phone after ten p.m.'],
        [1, { options: ['Bonne idée, il faut vraiment que j’essaie de couper les écrans plus tôt.', 'Les écrans sont bons pour dormir.', 'Non, je préfère travailler la nuit.'] }],
      ]),
      hear('Avant, je consultais mes courriels jusque tard le soir et je tournais dans mon lit pendant une heure. Depuis que je laisse mon téléphone dans le salon, je m’endors en dix minutes.', b('What single habit improved his sleep?', 'Quelle habitude précise a amélioré son sommeil ?'), [b('leaving his phone in the living room', 'laisser son téléphone dans le salon'), b('drinking herbal tea at noon', 'boire une tisane à midi'), b('waking up an hour earlier', 'se lever une heure plus tôt'), b('checking emails at breakfast', 'lire ses courriels au petit-déjeuner')], { voice: 'm' }),
      pairs(P.match, [['lever le pied', b('to slow down, ease off', 'réduire son rythme')], ['décrocher', b('to switch off (from work)', 'cesser de penser au travail')], ['avoir le sommeil léger', b('to be a light sleeper', 'se réveiller au moindre bruit')], ['décompresser', b('to unwind', 'relâcher la pression')]]),
      ord(P.order, 'J’ai beaucoup de mal à décrocher quand je rentre tard.', { tr: 'I find it very hard to switch off when I get home late.', extra: ['dormir'] }),
      say('En ce moment, j’essaie de couper les écrans à vingt-deux heures pour mieux dormir.', 'At the moment, I’m trying to turn off screens at ten p.m. to sleep better.'),
    ],
    [
      b('avoir du mal à s’endormir · avoir le sommeil léger.', 'avoir du mal à s’endormir · avoir le sommeil léger.'),
      b('décrocher (switch off) · lever le pied (slow down) · décompresser.', 'décrocher · lever le pied · décompresser.'),
      b('couper les écrans avant de dormir.', 'couper les écrans avant de dormir.'),
    ],
    [['s’endormir', b('to fall asleep', 'entrer dans le sommeil')], ['lever le pied', b('to ease off, slow down', 'travailler moins vite')], ['décompresser', b('to decompress, unwind', 'évacuer le stress')]],
  ),
  lesson(C, 2, ['food-sport-and-balance', 'alimentation-sport-et-equilibre'],
    b('Food, sport & balance', 'Alimentation, sport et équilibre'),
    b('Discuss cooking, snacking and exercise without extreme rules or guilt.', 'Parler de cuisine, de grignotage et de sport sans excès ni culpabilité.'),
    [b('Express balance and moderation', 'Exprimer équilibre et modération'), b('React with empathy to friends’ struggles', 'Réagir avec empathie sans juger'), b('Distinguish steady habits from pressure', 'Distinguer régularité et pression')],
    13,
    [
      card(b('Balance without guilt', 'L’équilibre sans culpabiliser'), b('**manger équilibré, cuisiner des produits frais, éviter de grignoter entre les repas, réduire le sucre / la caféine, tenir sur la durée, se faire plaisir sans culpabiliser**. Key idea: **L’important, c’est la régularité, pas la perfection.**', '**manger équilibré, cuisiner des produits frais, éviter de grignoter entre les repas, réduire le sucre / la caféine, tenir sur la durée, se faire plaisir sans culpabiliser**. Idée clé : **L’important, c’est la régularité, pas la perfection.**'), {
        ex: [['Les régimes stricts ne tiennent jamais sur la durée.', 'Strict diets never last in the long run.'], ['La semaine je cuisine simple, et le week-end je me fais plaisir.', 'During the week I cook simply, and at the weekend I treat myself.']],
      }),
      sort(b('Sustainable balance or extra pressure?', 'Équilibre durable ou pression inutile ?'), [b('sustainable balance', 'équilibre durable'), b('excess or pressure', 'excès ou pression')], [['privilégier la régularité plutôt que l’intensité', 0], ['se priver de tout et culpabiliser', 1], ['cuisiner des plats simples à l’avance', 0], ['sauter des repas par manque de temps', 1], ['boire de l’eau tout au long de la journée', 0], ['faire du sport seulement quand on est épuisé', 1]]),
      mc(P.best, ['Franchement, je te comprends : les régimes stricts ne tiennent jamais sur la durée.', 'Tu manques juste de volonté !', 'Ne mange plus rien le soir.', 'C’est facile, il suffit de ne jamais craquer.'], { fr: 'Un ami avoue qu’il abandonne toujours ses régimes trop stricts :' }),
      gap(P.complete, 'J’évite de ___ entre les repas, mais je garde un petit ___ le dimanche sans culpabiliser.', ['grignoter', 'plaisir'], { choices: [['grignoter', 'dormir', 'courir'], ['plaisir', 'écran', 'régime']] }),
      dict('L’important pour garder la forme, ce n’est pas la perfection, c’est la régularité.', { voice: 'f2' }),
      say('Je préfère cuisiner simple la semaine et me faire plaisir au restaurant le week-end.', 'I prefer cooking simply during the week and treating myself at a restaurant on the weekend.'),
    ],
    [
      b('grignoter (snack) · manger équilibré · tenir sur la durée.', 'grignoter · manger équilibré · tenir sur la durée.'),
      b('se faire plaisir sans culpabiliser.', 'se faire plaisir sans culpabiliser.'),
      b('La régularité compte plus que la perfection.', 'La régularité compte plus que la perfection.'),
    ],
    [['grignoter', b('to snack / nibble between meals', 'manger par petites bouchées')], ['culpabiliser', b('to feel guilty', 'se faire des reproches')], ['sur la durée', b('over the long term', 'pendant longtemps')]],
  ),
  lesson(C, 3, ['making-lasting-changes', 'changer-d-habitudes'],
    b('Making lasting changes', 'Changer d’habitudes'),
    b('Contrast what you used to do with realistic changes you have kept.', 'Opposer anciennes habitudes et changements concrets qui durent.'),
    [b('Contrast Avant, je… with Maintenant, je…', 'Opposer Avant, je… et Maintenant, je…'), b('Read everyday lifestyle tips', 'Lire des témoignages sur les habitudes'), b('Write about a personal habit change', 'Rédiger un récit sur un changement d’habitude')],
    13,
    [
      card(b('Before and now', 'Avant et maintenant'), b('Contrast past and present: **Avant, je prenais toujours l’ascenseur ; maintenant, je monte à pied. · J’ai pris l’habitude de… · J’ai réussi à réduire… · J’y vais petit à petit / progressivement. · Le plus dur, c’est de s’y tenir.**', 'Opposer passé et présent : **Avant, je prenais toujours l’ascenseur ; maintenant, je monte à pied. · J’ai pris l’habitude de… · J’ai réussi à réduire… · J’y vais petit à petit / progressivement. · Le plus dur, c’est de s’y tenir.**'), {
        ex: [['Depuis que je descends deux arrêts plus tôt, je marche vingt minutes par jour.', 'Since getting off two stops early, I walk twenty minutes a day.'], ['J’ai senti une vraie différence dès la troisième semaine.', 'I felt a real difference from the third week.']],
      }),
      doc({ look: 'article', title: b('Wellbeing forum — Reader tips', 'Forum bien-être — Astuces de lecteurs'), text: '« Quel petit changement a vraiment amélioré votre quotidien ? »\n\n• Léa, 34 ans : « Remplacer le café de 16 h par une tisane : je dors beaucoup mieux. »\n• Karim, 41 ans : « Descendre du métro deux stations plus tôt le soir pour marcher et me vider la tête. »\n• Sophie, 29 ans : « Ne plus prendre mon téléphone dans la chambre. »' }, b('Why does Karim get off the metro early?', 'Pourquoi Karim descend-il du métro plus tôt ?'), [b('to walk and clear his head', 'pour marcher et se vider la tête'), b('to save money on his ticket', 'pour payer moins cher son billet'), b('to buy herbal tea on the way', 'pour acheter une tisane en chemin'), b('to avoid walking upstairs at work', 'pour éviter les escaliers au travail')]),
      mc(P.best, ['Et concrètement, depuis que tu cours le matin, tu te sens moins fatiguée ?', 'Courir le matin est obligatoire.', 'Avant tu étais paresseuse.', 'Je ne sais pas ce que tu cours.'], { fr: 'Une amie vous raconte sa nouvelle routine sportive du matin :' }),
      write(b('A habit you changed', 'Une habitude que vous avez changée'), b('Write a conversational message (60–90 words) about one lifestyle habit you changed (sleep, stress, food or walking): say what you used to do (imparfait), what you changed, how it felt at first and the result today.', 'Écrivez un message naturel (60–90 mots) sur une habitude de vie changée (sommeil, stress, repas ou marche) : ce que vous faisiez avant (imparfait), ce que vous avez modifié, les débuts et le résultat aujourd’hui.'), 60, 90, [
        b('Past habit in imparfait (Avant, je…)', 'Ancienne habitude à l’imparfait'),
        b('Concrete new habit', 'Nouvelle habitude précise'),
        b('Progress and concrete result today', 'Progression et résultat concret'),
      ], 'Franchement, le petit changement qui m’a fait le plus de bien cette année concerne le soir. Avant, je consultais toujours mes messages au lit et je mettais une heure à m’endormir. Maintenant, je laisse mon téléphone dans le salon dès vingt-deux heures et je lis vingt minutes à la place. Les premiers jours, c’était étrange, mais j’y suis allé progressivement. Aujourd’hui, je dors bien mieux et je me réveille avec beaucoup plus d’énergie.', { phrases: ['Avant, je…', 'Maintenant, je…', 'j’y suis allé progressivement'] }),
      flash(b('Quick revision', 'Révision express'), [['J’ai besoin de lever le pied.', b('I need to slow down.', 'réduire la pression')], ['Je n’arrive pas à décrocher.', b('I can’t switch off.', 'continuer à penser au travail')], ['Tenir sur la durée.', b('To keep it up long-term.', 'être régulier')], ['Se faire plaisir sans culpabiliser.', b('Treat yourself guilt-free.', 'profiter sereinement')], ['J’ai pris l’habitude de marcher.', b('I’ve got into the habit of walking.', 'nouvelle routine')]]),
      say('Avant, je travaillais souvent tard le soir ; maintenant, j’essaie de lever le pied après dix-neuf heures.', 'Before, I often worked late in the evening; now I try to ease off after seven p.m.'),
    ],
    [
      b('Avant, je… (imparfait) → Maintenant, j’essaie de…', 'Avant, je… (imparfait) → Maintenant, j’essaie de…'),
      b('prendre l’habitude de · s’y tenir · y aller progressivement.', 'prendre l’habitude de · s’y tenir · y aller progressivement.'),
      b('se vider la tête · sentir une vraie différence.', 'se vider la tête · sentir une vraie différence.'),
    ],
    [['s’y tenir', b('to stick to it', 'continuer malgré l’effort')], ['progressivement', b('gradually', 'petit à petit')], ['se vider la tête', b('to clear one’s head', 'oublier ses soucis')]],
  ),
];
