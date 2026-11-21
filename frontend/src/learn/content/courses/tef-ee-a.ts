import type { CourseAbout } from '../../types';
import { b, card, doc, exam, gap, lesson, mc, ord, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Section A of the TEF writing test asks you to continue a short news story (un fait divers): you read the beginning of an article and write the rest, in a journalistic style, in at least 80 words. You must stay consistent with the start, tell events clearly in the past and finish the story logically. This course trains the codes of the fait divers, past tenses in journalistic narration and a reliable plan.',
    'La section A de l’expression écrite du TEF demande de poursuivre un court article de fait divers : vous lisez le début d’un article et vous en rédigez la suite, dans un style journalistique, en 80 mots minimum. Il faut rester cohérent avec le début, raconter clairement les événements au passé et terminer l’histoire de façon logique. Ce cours entraîne les codes du fait divers, les temps du récit journalistique et un plan fiable.',
  ),
  outcomes: [
    b('Know the codes of the fait divers', 'Connaître les codes du fait divers'),
    b('Stay consistent with the beginning', 'Rester cohérent avec le début'),
    b('Narrate in the past, journalistic style', 'Raconter au passé, en style journalistique'),
    b('Write at least 80 words', 'Écrire au moins 80 mots'),
  ],
};

const C = 'tef-ee-a';
export default [
  lesson(C, 1, ['the-fait-divers', 'le-fait-divers'],
    b('The fait divers and the task', 'Le fait divers et la tâche'),
    b('Understand section A and the codes of a news story.', 'Comprendre la section A et les codes du fait divers.'),
    [b('Know section A', 'Connaître la section A'), b('Recognise the 5 W’s', 'Reconnaître les 5 questions'), b('Keep a neutral journalistic tone', 'Garder un ton journalistique neutre')],
    13,
    [
      exam(b('Section A', 'Section A'), b('You receive the **beginning of a news article** (a fait divers: an unusual event, an accident, a rescue, a surprising discovery). You write **the rest of the article**, **at least 80 words**, in about **25 minutes**. Assessed: **consistency** with the start, **clear narration**, **journalistic register**, vocabulary and grammar.', 'Vous recevez le **début d’un article** (un fait divers : un événement insolite, un accident, un sauvetage, une découverte surprenante). Vous rédigez **la suite de l’article**, **80 mots minimum**, en environ **25 minutes**. Critères : **cohérence** avec le début, **narration claire**, **registre journalistique**, lexique et grammaire.')),
      card(b('The codes', 'Les codes'), b('A fait divers answers **qui ? quoi ? où ? quand ? comment ?** (and often **pourquoi ?**). Tone: **neutral, factual, third person**: **Les pompiers sont intervenus… · Selon un témoin… · L’enquête se poursuit.** Typical endings: outcome, testimony, consequence, lesson.', 'Un fait divers répond à **qui ? quoi ? où ? quand ? comment ?** (et souvent **pourquoi ?**). Ton : **neutre, factuel, à la troisième personne** : **Les pompiers sont intervenus… · Selon un témoin… · L’enquête se poursuit.** Fins typiques : dénouement, témoignage, conséquence, leçon.')),
      doc({ look: 'article', title: b('Beginning of the article', 'Début de l’article'), text: 'Un chien retrouve son maître après 300 kilomètres\nLundi matin, une habitante de Rimouski a eu la surprise de découvrir un chien épuisé devant sa porte. L’animal portait un collier avec une adresse… à Québec, à plus de 300 kilomètres.' }, b('Which continuation is consistent?', 'Quelle suite est cohérente ?'), [b('She called the number on the collar and learned the dog had disappeared three weeks earlier.', 'Elle a appelé le numéro du collier et a appris que le chien avait disparu trois semaines plus tôt.'), b('The dog then flew to Paris.', 'Le chien a ensuite pris l’avion pour Paris.'), b('I think dogs are great.', 'Je pense que les chiens sont formidables.'), b('The weather was sunny in Montréal.', 'Il faisait beau à Montréal.')]),
      sort(b('Journalistic or not?', 'Journalistique ou non ?'), [b('journalistic', 'journalistique'), b('not journalistic', 'non journalistique')], [['Selon un témoin, …', 0], ['Moi, j’adore cette histoire !', 1], ['Les secours sont intervenus rapidement.', 0], ['C’est trop mignon.', 1], ['L’enquête se poursuit.', 0], ['Je vous raconte la suite.', 1]]),
      pairs(P.match, [['un fait divers', b('a news item (unusual event)', 'petit événement de la vie réelle')], ['un témoin', b('a witness', 'personne qui a vu')], ['intervenir', b('to step in', 'agir sur place')], ['l’enquête', b('the investigation', 'recherche de la police')]]),
    ],
    [
      b('Continue the article: 80 words minimum, about 25 minutes.', 'Poursuivez l’article : 80 mots minimum, environ 25 minutes.'),
      b('Qui, quoi, où, quand, comment, pourquoi.', 'Qui, quoi, où, quand, comment, pourquoi.'),
      b('Neutral, factual, third person.', 'Neutre, factuel, troisième personne.'),
    ],
    [['épuisé', b('exhausted', 'très fatigué')], ['un collier', b('a collar', 'pour le cou de l’animal')], ['un maître', b('an owner (of a pet)', 'propriétaire de l’animal')]],
  ),
  lesson(C, 2, ['narrating-the-news', 'raconter-l-evenement'],
    b('Narrating the events', 'Raconter les événements'),
    b('Use past tenses, time markers and reported testimony.', 'Employer les temps du passé, les repères temporels et les témoignages rapportés.'),
    [b('Use passé composé, imparfait, plus-que-parfait', 'Employer passé composé, imparfait, plus-que-parfait'), b('Use time markers', 'Employer les repères temporels'), b('Report testimony', 'Rapporter un témoignage')],
    13,
    [
      card(b('Journalistic narration', 'La narration journalistique'), b('**Passé composé** for events: **Les secouristes ont retrouvé…** **Imparfait** for the situation: **Il faisait nuit, la route était glissante.** **Plus-que-parfait** for earlier events: **Le chien avait disparu trois semaines plus tôt.** Markers: **quelques minutes plus tard, peu après, aussitôt, finalement**. Testimony: **« Je n’en croyais pas mes yeux », a déclaré la propriétaire.**', '**Passé composé** pour les événements : **Les secouristes ont retrouvé…** **Imparfait** pour la situation : **Il faisait nuit, la route était glissante.** **Plus-que-parfait** pour l’antériorité : **Le chien avait disparu trois semaines plus tôt.** Repères : **quelques minutes plus tard, peu après, aussitôt, finalement**. Témoignage : **« Je n’en croyais pas mes yeux », a déclaré la propriétaire.**')),
      gap(P.completeText, 'La propriétaire ___ (appeler) aussitôt le numéro. Le chien ___ (disparaître) trois semaines plus tôt pendant un voyage. Quelques heures plus tard, son maître ___ (arriver) en voiture.', ['a appelé', 'avait disparu', 'est arrivé']),
      sort(b('Which tense?', 'Quel temps ?'), [b('passé composé (event)', 'passé composé (événement)'), b('imparfait (situation)', 'imparfait (situation)'), b('plus-que-parfait (earlier)', 'plus-que-parfait (antériorité)')], [['les pompiers sont arrivés', 0], ['il neigeait fortement', 1], ['le conducteur avait perdu le contrôle', 2], ['un passant a donné l’alerte', 0], ['la route était glissante', 1], ['l’enfant était sorti seul', 2]]),
      mc(P.best, ['« Je n’en croyais pas mes yeux », a confié la propriétaire.', 'La propriétaire dit : je crois pas.', 'Elle croyait pas ses yeux, moi non plus.', 'Je n’en croyais pas mes yeux, dis-je.'], { fr: 'Quelle phrase rapporte un témoignage dans le style journalistique ?' }),
      ord(P.order, 'Quelques heures plus tard, son maître est arrivé en voiture.', { tr: 'A few hours later, his owner arrived by car.' }),
    ],
    [
      b('Passé composé: events; imparfait: situation; plus-que-parfait: earlier.', 'Passé composé : événements ; imparfait : situation ; plus-que-parfait : antériorité.'),
      b('Markers: aussitôt, peu après, quelques heures plus tard, finalement.', 'Repères : aussitôt, peu après, quelques heures plus tard, finalement.'),
      b('Testimony: « … », a déclaré / a confié / a expliqué X.', 'Témoignage : « … », a déclaré / a confié / a expliqué X.'),
    ],
    [['aussitôt', b('immediately', 'tout de suite')], ['confier', b('to confide, say', 'dire, raconter')], ['glissant', b('slippery', 'où l’on glisse')]],
  ),
  lesson(C, 3, ['writing-section-a', 'rediger-la-section-a'],
    b('Writing section A', 'Rédiger la section A'),
    b('Write the full continuation of a news story and check it.', 'Rédiger la suite complète d’un fait divers et la vérifier.'),
    [b('Plan: development, climax, ending', 'Plan : développement, point culminant, dénouement'), b('Write 80+ words', 'Écrire 80 mots ou plus'), b('Check consistency', 'Vérifier la cohérence')],
    13,
    [
      card(b('A 3-part plan', 'Un plan en 3 parties'), b('1. **Development**: what happened next (actions, people involved). 2. **Climax / explanation**: the key moment or the explanation of the mystery. 3. **Ending**: outcome + testimony or consequence (**Depuis, … · L’histoire a ému les internautes… · La police rappelle que…**).', '1. **Développement** : ce qui s’est passé ensuite (actions, personnes impliquées). 2. **Point culminant / explication** : le moment clé ou l’explication du mystère. 3. **Dénouement** : issue + témoignage ou conséquence (**Depuis, … · L’histoire a ému les internautes… · La police rappelle que…**).')),
      write(b('Continue the article', 'Poursuivez l’article'), b('Continue the article « Un chien retrouve son maître après 300 kilomètres » (80–150 words).', 'Poursuivez l’article « Un chien retrouve son maître après 300 kilomètres » (80–150 mots).'), 80, 150, [
        b('Consistent with the beginning', 'Cohérent avec le début'),
        b('Past tenses and time markers', 'Temps du passé et repères temporels'),
        b('An ending with a testimony or consequence', 'Un dénouement avec témoignage ou conséquence'),
      ], 'Intriguée, la Rimouskoise a aussitôt composé le numéro inscrit sur le collier. Au bout du fil, un homme de Québec a éclaté en sanglots : son chien, Filou, avait disparu trois semaines plus tôt lors d’une halte sur l’autoroute. Malgré de nombreuses recherches, la famille avait fini par perdre espoir.\n\nLe lendemain, le propriétaire a parcouru les 300 kilomètres pour récupérer son compagnon. « Il était maigre, mais il m’a reconnu tout de suite », a-t-il confié. Selon un vétérinaire, l’animal aurait suivi la côte du fleuve pendant des jours.\n\nDepuis, l’histoire a ému des milliers d’internautes, et la famille a offert une récompense à la femme qui avait recueilli Filou.'),
      tip(b('Consistency check', 'Vérification de cohérence'), b('Re-read the beginning: **names, places, dates and details** must match your continuation. A contradiction (e.g. changing the city) costs many points.', 'Relisez le début : **noms, lieux, dates et détails** doivent correspondre à votre suite. Une contradiction (par ex. changer la ville) coûte beaucoup de points.')),
      mc(P.best, ['Depuis, l’histoire a ému des milliers d’internautes.', 'Voilà, c’est fini.', 'Et ils vécurent heureux et eurent beaucoup d’enfants.', 'Je trouve cette histoire géniale.'], { fr: 'Quelle phrase finale convient le mieux à un fait divers ?' }),
    ],
    [
      b('Plan: development → climax/explanation → ending.', 'Plan : développement → point culminant/explication → dénouement.'),
      b('80 words minimum; stay consistent with the beginning.', '80 mots minimum ; restez cohérent avec le début.'),
      b('End with a testimony or consequence.', 'Terminez par un témoignage ou une conséquence.'),
    ],
    [['au bout du fil', b('on the line (phone)', 'au téléphone')], ['recueillir', b('to take in (an animal)', 'accueillir')], ['une récompense', b('a reward', 'cadeau pour remercier')]],
  ),
];
