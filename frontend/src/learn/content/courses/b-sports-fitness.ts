import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, doc, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Whether you prefer a morning run, a swim at the municipal pool or a match with friends, this beginner course gives you the French to talk about sport, fitness and wellbeing. You will master the key choice between faire de and jouer à, learn essential gym and pool rules, and talk comfortably about energy, stretching and healthy daily routines.',
    'Que vous aimiez courir le matin, nager à la piscine municipale ou jouer un match entre amis, ce cours pour débutants vous donne le français du sport, de la forme et du bien-être. Vous maîtriserez le choix essentiel entre faire de et jouer à, le vocabulaire de la salle et de la piscine, et comment parler d’énergie, d’étirements et de bonnes habitudes.',
  ),
  outcomes: [
    b('Use faire de and jouer à with the right sports', 'Employer faire de et jouer à selon le sport'),
    b('Navigate a gym or swimming pool in French', 'Se repérer en salle de sport ou à la piscine'),
    b('Read pool rules and sports notices', 'Comprendre un règlement de piscine ou de club'),
    b('Talk about energy, sleep and staying active', 'Parler de forme, de sommeil et d’activité physique'),
  ],
};

const C = 'b-sports-fitness';
export default [
  lesson(C, 1, ['talking-about-sports', 'parler-de-sport'],
    b('Talking about sports', 'Parler de sport'),
    b('Choose faire de or jouer à and say how often you exercise.', 'Choisir faire de ou jouer à et dire à quelle fréquence on s’entraîne.'),
    [b('Use faire de for individual sports', 'Employer faire de pour les sports individuels'), b('Use jouer à for ball and team sports', 'Employer jouer à pour les sports de balle'), b('Say how often you practise', 'Exprimer la fréquence d’entraînement')],
    13,
    [
      card(b('Faire de or jouer à?', 'Faire de ou jouer à ?'), b('Use **faire du / de la / de l’** for individual sports and workouts: **faire du vélo, du yoga, de la natation, de la course à pied, de la randonnée**. Use **jouer au / à la / aux** for games and team sports: **jouer au football, au tennis, au basket**.', 'Employez **faire du / de la / de l’** pour les sports individuels : **faire du vélo, du yoga, de la natation, de la course à pied, de la randonnée**. Employez **jouer au / à la / aux** pour les sports de balle ou d’équipe : **jouer au football, au tennis, au basket**.'), {
        table: { head: [b('verb', 'verbe'), b('article', 'article'), b('examples', 'exemples')], rows: [['faire de', 'du / de la / de l’', 'du ski, de la natation'], ['jouer à', 'au / à la / aux', 'au tennis, au football']] },
      }),
      trap(b('Don’t mix faire and jouer', 'Ne mélangez pas faire et jouer'), b('Say **je joue au tennis** (never *je joue du tennis*), and **je fais de la natation** (never *je fais à la natation*). For musical instruments, it’s **jouer de** (*jouer du piano*).', 'Dites **je joue au tennis** (jamais *je joue du tennis*), et **je fais de la natation** (jamais *je fais à la natation*). Pour les instruments de musique, on dit **jouer de** (*jouer du piano*).')),
      sort(b('Faire de or jouer à?', 'Faire de ou jouer à ?'), [b('faire du / de la', 'faire du / de la'), b('jouer au / à la', 'jouer au / à la')], [['… la natation', 0], ['… football', 1], ['… vélo', 0], ['… tennis', 1], ['… yoga', 0], ['… basket', 1]]),
      gap(P.complete, 'Le mardi, je ___ de la natation, et le samedi je ___ au tennis avec mon frère.', ['fais', 'joue'], { choices: [['fais', 'joue', 'vais'], ['joue', 'fais', 'prends']] }),
      hear('J’essaie de faire du sport trois fois par semaine : je cours le lundi matin et je fais du vélo le dimanche.', b('How often does he exercise?', 'À quelle fréquence fait-il du sport ?'), [b('three times a week', 'trois fois par semaine'), b('once a week', 'une fois par semaine'), b('every morning', 'tous les matins'), b('only on Sundays', 'seulement le dimanche')], { voice: 'm' }),
      ord(P.order, 'Je fais de la natation deux fois par semaine.', { tr: 'I go swimming twice a week.', extra: ['joue'] }),
      say('J’aime courir le matin, et le week-end je joue au tennis avec des amis.', 'I like running in the morning, and at the weekend I play tennis with friends.'),
    ],
    [
      b('faire du / de la / de l’ (individual sports, fitness).', 'faire du / de la / de l’ (sports individuels, remise en forme).'),
      b('jouer au / à la / aux (team and racket sports).', 'jouer au / à la / aux (sports d’équipe et de raquette).'),
      b('une / deux / trois fois par semaine.', 'une / deux / trois fois par semaine.'),
    ],
    [['la natation', b('swimming', 'sport dans l’eau')], ['la randonnée', b('hiking', 'longue marche dans la nature')], ['s’entraîner', b('to train, work out', 'pratiquer régulièrement')]],
  ),
  lesson(C, 2, ['at-the-gym-and-pool', 'a-la-salle-et-a-la-piscine'],
    b('At the gym & swimming pool', 'À la salle de sport et à la piscine'),
    b('Find lockers and equipment, read pool notices and talk about warming up.', 'Trouver vestiaires et matériel, lire un règlement de piscine et parler d’échauffement.'),
    [b('Read swimming pool rules', 'Lire le règlement d’une piscine'), b('Name gym and pool gear', 'Nommer l’équipement de sport'), b('Ask for practical help', 'Demander une information pratique')],
    13,
    [
      card(b('Gym & pool basics', 'En salle et à la piscine'), b('Places: **les vestiaires, le casier, le bassin, la ligne d’eau**. Gear: **le tapis de course, les haltères, le bonnet de bain, les lunettes de natation, les baskets, la serviette**. Actions: **s’échauffer, nager, s’étirer**.', 'Lieux : **les vestiaires, le casier, le bassin, la ligne d’eau**. Matériel : **le tapis de course, les haltères, le bonnet de bain, les lunettes de natation, les baskets, la serviette**. Actions : **s’échauffer, nager, s’étirer**.'), {
        ex: [['Les casiers sont dans les vestiaires au sous-sol.', 'The lockers are in the changing rooms downstairs.'], ['N’oubliez pas de vous étirer après la séance.', 'Don’t forget to stretch after the session.']],
      }),
      doc({ look: 'notice', title: b('Municipal pool — Rules', 'Piscine municipale — Règlement'), text: 'ACCÈS AUX BASSINS\n• Douche savonnée obligatoire avant d’entrer dans l’eau\n• Bonnet de bain obligatoire (vente à l’accueil : 3 €)\n• Maillot de bain uniquement (shorts de bain interdits)\n• Lignes réservées : nageurs lents (1–2), rapides (3–4)\n• Casiers gratuits avec pièce de 1 € ou jeton' }, b('What must swimmers wear in the pool?', 'Que faut-il porter obligatoirement dans le bassin ?'), [b('a swimming cap and proper swimwear', 'un bonnet de bain et un maillot de bain'), b('swim shorts and flip-flops', 'un short de bain et des tongs'), b('swimming goggles only', 'seulement des lunettes de natation'), b('any sports clothes', 'n’importe quelle tenue de sport')]),
      dlg(b('First day at the gym', 'Premier jour à la salle'), undefined, [['Coach', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour ! Bienvenue à la salle. Tu connais déjà nos équipements ?', 'Hello! Welcome to the gym. Do you already know our equipment?'],
        [1, { options: ['Pas encore ! Où sont les vestiaires, s’il vous plaît ?', 'Oui, casier.', 'Non, pas de piscine.'] }],
        [0, 'Juste à gauche. Pense à prendre une serviette et à t’échauffer dix minutes avant de courir.', 'Just to the left. Remember to bring a towel and warm up for ten minutes before running.'],
        [1, { options: ['D’accord, merci beaucoup ! Il faut une pièce pour le casier ?', 'Non, je dors.', 'Pourquoi ?'] }],
      ]),
      pairs(P.match, [['les vestiaires', b('changing rooms', 'où l’on se change')], ['le casier', b('locker', 'petit placard fermé')], ['le bonnet de bain', b('swimming cap', 'bonnet pour la piscine')], ['s’étirer', b('to stretch', 'détendre les muscles')]]),
      mc(P.best, ['Excusez-moi, où sont les vestiaires, s’il vous plaît ?', 'Vestiaires où ?', 'Je veux un casier tout de suite.', 'Donnez-moi ma serviette.'], { fr: 'Vous arrivez pour la première fois au centre sportif :' }),
      dict('N’oublie pas ta serviette, tes baskets et une bouteille d’eau.', { voice: 'f2' }),
      say('Excusez-moi, où sont les vestiaires ? Il faut une pièce pour le casier ?', 'Excuse me, where are the changing rooms? Do I need a coin for the locker?'),
    ],
    [
      b('vestiaires, casier, serviette, baskets, bonnet de bain.', 'vestiaires, casier, serviette, baskets, bonnet de bain.'),
      b('s’échauffer (warm up) → s’entraîner → s’étirer (stretch).', 's’échauffer → s’entraîner → s’étirer.'),
      b('obligatoire (required) vs interdit (forbidden).', 'obligatoire / interdit.'),
    ],
    [['un casier', b('a locker', 'coffre fermé pour ses affaires')], ['s’étirer', b('to stretch', 'allonger les muscles')], ['obligatoire', b('mandatory', 'qu’il faut absolument faire')]],
  ),
  lesson(C, 3, ['staying-active-and-wellbeing', 'forme-et-bien-etre'],
    b('Staying active & wellbeing', 'Forme et bien-être'),
    b('Talk about feeling fit, sore muscles, walking, fresh air and good sleep.', 'Parler de forme, de courbatures, de marche, de grand air et de sommeil.'),
    [b('Say how you feel physically', 'Dire comment on se sent'), b('Talk about walking and fresh air', 'Parler de marche et de grand air'), b('Connect exercise and sleep', 'Relier activité et sommeil')],
    13,
    [
      card(b('Fitness & energy', 'Forme et énergie'), b('Feeling good: **être en pleine forme, se sentir mieux, avoir plus d’énergie, bien dormir, se détendre**. After sport: **avoir des courbatures, être un peu fatigué(e)**. Daily habits: **marcher trente minutes par jour, prendre l’air, boire beaucoup d’eau**.', 'Se sentir bien : **être en pleine forme, se sentir mieux, avoir plus d’énergie, bien dormir, se détendre**. Après le sport : **avoir des courbatures, être un peu fatigué(e)**. Habitudes : **marcher trente minutes par jour, prendre l’air, boire beaucoup d’eau**.'), {
        ex: [['Ça fait du bien de prendre l’air après le travail.', 'It feels good to get some fresh air after work.'], ['J’ai un peu de courbatures, mais je me sens en forme.', 'I’m a bit sore, but I feel fit.']],
      }),
      hear('Depuis que je marche vingt minutes chaque matin pour aller travailler, je dors beaucoup mieux et j’ai plus d’énergie.', b('What benefit did she notice?', 'Quel bienfait a-t-elle remarqué ?'), [b('she sleeps better and has more energy', 'elle dort mieux et a plus d’énergie'), b('she runs marathons now', 'elle court des marathons'), b('she stopped going to work', 'elle ne va plus au travail'), b('her legs hurt every night', 'elle a mal aux jambes')], { voice: 'f' }),
      sort(b('Healthy habit or fatigue?', 'Bonne habitude ou fatigue ?'), [b('healthy habit', 'bonne habitude'), b('fatigue or soreness', 'fatigue ou douleur')], [['marcher trente minutes', 0], ['avoir des courbatures', 1], ['boire beaucoup d’eau', 0], ['être épuisé', 1], ['dormir huit heures', 0], ['avoir mal aux jambes', 1]]),
      mc(P.best, ['Je marche tous les jours et je fais du yoga le jeudi soir.', 'Sport, non merci, jamais.', 'Je dors pendant le yoga.', 'Je suis les jambes.'], { fr: '— Comment fais-tu pour rester en forme ?' }),
      flash(b('Quick revision', 'Révision express'), [['Je fais du vélo le dimanche.', b('I go cycling on Sundays.', 'activité du week-end')], ['Je vais à la piscine deux fois par semaine.', b('I go to the pool twice a week.', 'fréquence régulière')], ['Je suis en pleine forme !', b('I feel in great shape!', 'beaucoup d’énergie')], ['J’ai des courbatures aujourd’hui.', b('My muscles are sore today.', 'après un effort')], ['Ça fait du bien de prendre l’air.', b('It feels good to get fresh air.', 'sortir dehors')]]),
      gap(P.complete, 'Après une grande randonnée, je suis un peu ___ mais je me ___ très bien.', ['fatigué', 'sens'], { choices: [['fatigué', 'content', 'calme'], ['sens', 'fais', 'joue']] }),
      say('Marcher trente minutes par jour fait du bien au moral et aide à mieux dormir.', 'Walking thirty minutes a day lifts your mood and helps you sleep better.'),
    ],
    [
      b('être en pleine forme · se sentir mieux · bien dormir.', 'être en pleine forme · se sentir mieux · bien dormir.'),
      b('avoir des courbatures = to have sore muscles.', 'avoir des courbatures = avoir mal aux muscles après le sport.'),
      b('prendre l’air · ça fait du bien.', 'prendre l’air · ça fait du bien.'),
    ],
    [['les courbatures (f)', b('muscle soreness', 'douleur musculaire après le sport')], ['prendre l’air', b('to get fresh air', 'sortir dehors')], ['se détendre', b('to relax', 'se reposer, calmer le stress')]],
  ),
];
