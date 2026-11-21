import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Parce que, puisque, grâce à, à cause de, donc, si bien que, c’est pourquoi: a convincing argument is built on clear links between causes and consequences. This course sorts the connectors by construction (conjunction + verb, preposition + noun, adverb) and by nuance (a positive or negative cause, an obvious cause, a strong consequence), and trains you to use them in an exam-style argument.',
    'Parce que, puisque, grâce à, à cause de, donc, si bien que, c’est pourquoi : une argumentation convaincante repose sur des liens clairs entre causes et conséquences. Ce cours classe les connecteurs selon leur construction (conjonction + verbe, préposition + nom, adverbe) et leur nuance (cause positive ou négative, cause évidente, conséquence forte), et vous entraîne à les employer dans une argumentation de type examen.',
  ),
  outcomes: [
    b('Use parce que, puisque, comme, car', 'Employer parce que, puisque, comme, car'),
    b('Choose grâce à or à cause de', 'Choisir entre grâce à et à cause de'),
    b('Use donc, alors, c’est pourquoi, si bien que', 'Employer donc, alors, c’est pourquoi, si bien que'),
    b('Use tellement… que and si… que', 'Employer tellement… que et si… que'),
  ],
};

const C = 'cause-consequence';
export default [
  lesson(C, 1, ['expressing-cause', 'exprimer-la-cause'],
    b('Parce que, puisque, comme, car', 'Parce que, puisque, comme, car'),
    b('Introduce a cause with the right conjunction and its nuance.', 'Introduire une cause avec la bonne conjonction et sa nuance.'),
    [b('Use parce que to answer pourquoi', 'Employer parce que pour répondre à pourquoi'), b('Use puisque for an obvious cause', 'Employer puisque pour une cause évidente'), b('Start a sentence with comme', 'Commencer une phrase par comme')],
    13,
    [
      card(b('Four conjunctions', 'Quatre conjonctions'), b('**parce que**: neutral, answers « pourquoi ? ». **puisque**: a cause both speakers know. **comme**: at the **start** of the sentence. **car**: written, explains after the fact (never at the start).', '**parce que** : neutre, répond à « pourquoi ? ». **puisque** : cause connue des deux interlocuteurs. **comme** : en **tête** de phrase. **car** : écrit, justifie après coup (jamais en tête).'), {
        ex: [['Je suis en retard parce que mon bus est tombé en panne.', 'I’m late because my bus broke down.'], ['Puisque tu es là, aide-moi !', 'Since you’re here, help me!'], ['Comme il pleuvait, nous sommes restés à la maison.', 'As it was raining, we stayed at home.'], ['Il faut partir tôt, car la route est longue.', 'We must leave early, for the road is long.']],
      }),
      mc(P.word, ['Comme', 'Parce que', 'Car', 'Grâce à'], { fr: '___ le magasin était fermé, je suis allé au marché.' }),
      mc(P.word, ['Puisque', 'Comme si', 'Car', 'Donc'], { fr: '___ tu connais la route, conduis, toi !' }),
      sort(b('Which conjunction fits best?', 'Quelle conjonction convient le mieux ?'), ['parce que', 'puisque', 'comme'], [['— Pourquoi tu pars ? — … je suis fatigué.', 0], ['… vous êtes tous d’accord, on commence.', 1], ['… il faisait beau, on a pique-niqué.', 2], ['Elle pleure … elle a perdu son chat.', 0], ['… c’est ton anniversaire, c’est toi qui choisis !', 1], ['… je n’avais pas de voiture, j’ai pris le train.', 2]]),
      gap(P.complete, 'Je ne peux pas venir ___ je travaille samedi. – Bon, ___ tu travailles, on se verra dimanche.', ['parce que', 'puisque']),
      ord(P.order, 'Comme il neigeait beaucoup, l’école était fermée.', { tr: 'As it was snowing heavily, the school was closed.' }),
      say('Comme j’habite loin, je fais du télétravail deux jours par semaine.', 'As I live far away, I work from home two days a week.'),
    ],
    [
      b('parce que: neutral; puisque: known cause; comme: at the start.', 'parce que : neutre ; puisque : cause connue ; comme : en tête.'),
      b('car: written, after the main clause.', 'car : écrit, après la principale.'),
      b('Answer « pourquoi ? » with parce que, never with car alone.', 'Répondez à « pourquoi ? » par parce que, jamais par car seul.'),
    ],
    [['pique-niquer', b('to have a picnic', 'manger dehors')], ['le télétravail', b('remote work', 'travail à distance')], ['tomber en panne', b('to break down', 'cesser de fonctionner')]],
  ),
  lesson(C, 2, ['grace-a-a-cause-de', 'grace-a-a-cause-de'],
    b('Grâce à, à cause de, en raison de', 'Grâce à, à cause de, en raison de'),
    b('Introduce a cause with a noun and the right positive or negative nuance.', 'Introduire une cause avec un nom, avec la bonne nuance positive ou négative.'),
    [b('Use grâce à for a positive cause', 'Employer grâce à pour une cause positive'), b('Use à cause de for a negative cause', 'Employer à cause de pour une cause négative'), b('Use en raison de and faute de in formal French', 'Employer en raison de et faute de à l’écrit soutenu')],
    13,
    [
      card(b('Preposition + noun', 'Préposition + nom'), b('**grâce à** = a positive cause (thanks to). **à cause de** = a negative cause (because of). **en raison de** = neutral, formal (due to). **faute de** = for lack of. Mind the contractions: **grâce au**, **à cause du**.', '**grâce à** = cause positive. **à cause de** = cause négative. **en raison de** = neutre, soutenu. **faute de** = par manque de. Attention aux contractions : **grâce au**, **à cause du**.'), {
        ex: [['J’ai trouvé ce poste grâce à mon réseau.', 'I found this job thanks to my network.'], ['Le vol est retardé à cause du brouillard.', 'The flight is delayed because of the fog.'], ['En raison des travaux, la station est fermée.', 'Due to construction, the station is closed.'], ['Faute de temps, nous reporterons la réunion.', 'For lack of time, we will postpone the meeting.']],
      }),
      mc(P.word, ['grâce à', 'à cause de', 'faute de', 'en raison de'], { fr: 'J’ai réussi mon examen ___ tes conseils. Merci !' }),
      mc(P.word, ['à cause du', 'grâce au', 'à cause de le', 'grâce à le'], { fr: 'Nous sommes arrivés en retard ___ trafic.' }),
      mc(P.word, ['En raison d’', 'Grâce à', 'Faute d’', 'Parce que'], { fr: '___ une panne électrique, le magasin fermera à 15 h.', explain: b('A neutral, official cause: en raison de.', 'Cause neutre et officielle : en raison de.') }),
      doc({ title: b('Announcement', 'Annonce'), text: 'En raison d’une grève des transports, les cours du jeudi 6 février sont annulés. Grâce à la plateforme en ligne, les étudiants pourront consulter les documents à distance. Faute de salle disponible, l’examen est reporté au 13 février.' }, P.read, [b('Thursday’s classes are cancelled because of a strike.', 'Les cours de jeudi sont annulés à cause d’une grève.'), b('The exam takes place on 6 February.', 'L’examen a lieu le 6 février.'), b('The online platform is closed.', 'La plateforme en ligne est fermée.'), b('Students must come to campus.', 'Les étudiants doivent venir sur le campus.')]),
      gap(P.complete, '___ ___ pluie, le match a été annulé, mais ___ ___ bénévoles, la fête a eu lieu.', ['À cause', 'de la', 'grâce', 'aux']),
      pairs(P.match, [['grâce à', b('thanks to (positive)', 'cause positive')], ['à cause de', b('because of (negative)', 'cause négative')], ['en raison de', b('due to (formal)', 'cause neutre, soutenue')], ['faute de', b('for lack of', 'par manque de')]]),
      dict('En raison des fortes chutes de neige, les écoles sont fermées aujourd’hui.', { voice: 'f' }),
    ],
    [
      b('grâce à (positive), à cause de (negative), en raison de (neutral, formal), faute de (lack).', 'grâce à (positive), à cause de (négative), en raison de (neutre, soutenu), faute de (manque).'),
      b('Contractions: grâce au, à cause du, à cause des.', 'Contractions : grâce au, à cause du, à cause des.'),
      b('These prepositions take a noun, not a verb.', 'Ces prépositions sont suivies d’un nom, pas d’un verbe.'),
    ],
    [['une grève', b('a strike', 'arrêt de travail collectif')], ['un bénévole', b('a volunteer', 'personne non payée qui aide')], ['le brouillard', b('fog', 'nuage au sol')]],
  ),
  lesson(C, 3, ['expressing-consequence', 'exprimer-la-consequence'],
    b('Donc, si bien que, tellement… que', 'Donc, si bien que, tellement… que'),
    b('Express consequences, including intense ones, in speech and writing.', 'Exprimer la conséquence, y compris intense, à l’oral et à l’écrit.'),
    [b('Use donc, alors, c’est pourquoi', 'Employer donc, alors, c’est pourquoi'), b('Use si bien que, de sorte que', 'Employer si bien que, de sorte que'), b('Use tellement / si … que', 'Employer tellement / si … que')],
    13,
    [
      card(b('Consequence connectors', 'Les connecteurs de conséquence'), b('**donc, alors** (spoken), **c’est pourquoi, c’est la raison pour laquelle, par conséquent** (formal), **si bien que, de sorte que** + indicative. Intensity: **si / tellement + adjective + que**, **tellement de + noun + que**.', '**donc, alors** (oral), **c’est pourquoi, c’est la raison pour laquelle, par conséquent** (soutenu), **si bien que, de sorte que** + indicatif. Intensité : **si / tellement + adjectif + que**, **tellement de + nom + que**.'), {
        ex: [['Il a beaucoup neigé, si bien que les routes sont fermées.', 'It snowed a lot, so the roads are closed.'], ['Elle était si fatiguée qu’elle s’est endormie au cinéma.', 'She was so tired that she fell asleep at the cinema.'], ['Il y avait tellement de monde qu’on est repartis.', 'There were so many people that we left.']],
      }),
      mc(P.word, ['si bien que', 'bien que', 'parce que', 'puisque'], { fr: 'Le train avait du retard, ___ j’ai raté mon rendez-vous.' }),
      mc(P.best, ['Il parlait si vite que je n’ai rien compris.', 'Il parlait si vite donc je n’ai rien compris.', 'Il parlait tellement de vite que je n’ai rien compris.', 'Il parlait si vite parce que je n’ai rien compris.']),
      sort(b('Cause or consequence?', 'Cause ou conséquence ?'), [b('introduces a cause', 'introduit une cause'), b('introduces a consequence', 'introduit une conséquence')], [['puisque', 0], ['par conséquent', 1], ['étant donné que', 0], ['c’est pourquoi', 1], ['vu que', 0], ['de sorte que', 1]]),
      gap(P.complete, 'Il y avait ___ de bruit ___ je n’ai pas dormi de la nuit.', ['tellement', 'que']),
      write(b('Write a short argument.', 'Rédigez une courte argumentation.'), b('Should cities ban cars from their centre? Explain two causes and two consequences, using at least four different connectors.', 'Faut-il interdire les voitures dans les centres-villes ? Exposez deux causes et deux conséquences, avec au moins quatre connecteurs différents.'), 70, 120,
        [b('Two causes (parce que, en raison de…)', 'Deux causes (parce que, en raison de…)'), b('Two consequences (donc, si bien que…)', 'Deux conséquences (donc, si bien que…)'), b('One intensity structure (si… que)', 'Une structure d’intensité (si… que)'), b('A clear conclusion', 'Une conclusion claire')],
        'À mon avis, il faut limiter fortement les voitures en centre-ville. En effet, la pollution y est si élevée que la santé des habitants est menacée. De plus, en raison des embouteillages, les déplacements sont lents et stressants. Par conséquent, réserver le centre aux piétons, aux vélos et aux transports en commun rendrait la ville plus agréable, si bien que les commerces de proximité en profiteraient aussi. C’est pourquoi je soutiens ce type de mesure.',
        { phrases: ['En effet, …', 'en raison de…', 'si… que', 'Par conséquent, …', 'si bien que…', 'C’est pourquoi…'] }),
      say('Il faisait si chaud que nous sommes allés à la plage.', 'It was so hot that we went to the beach.'),
    ],
    [
      b('donc, alors (spoken); c’est pourquoi, par conséquent (formal).', 'donc, alors (oral) ; c’est pourquoi, par conséquent (soutenu).'),
      b('si bien que, de sorte que + indicative.', 'si bien que, de sorte que + indicatif.'),
      b('si / tellement + adjective + que; tellement de + noun + que.', 'si / tellement + adjectif + que ; tellement de + nom + que.'),
    ],
    [['un embouteillage', b('a traffic jam', 'un bouchon')], ['un piéton', b('a pedestrian', 'personne à pied')], ['les commerces de proximité', b('local shops', 'magasins du quartier')]],
  ),
];
