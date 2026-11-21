import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A long interview lets a guest tell their story, explain their choices and nuance their ideas. To follow it, you need to keep track of the chronology, distinguish facts from feelings and opinions, and notice the nuances (pas vraiment, en quelque sorte, d’une certaine manière). This course trains you on three original interviews with an entrepreneur, a nurse who changed careers and a novelist.',
    'Un long entretien permet à un invité de raconter son parcours, d’expliquer ses choix et de nuancer ses idées. Pour le suivre, il faut garder le fil de la chronologie, distinguer faits, sentiments et opinions, et remarquer les nuances (pas vraiment, en quelque sorte, d’une certaine manière). Ce cours vous entraîne sur trois entretiens originaux avec une entrepreneure, un infirmier qui a changé de métier et une romancière.',
  ),
  outcomes: [
    b('Follow the chronology of a life story', 'Suivre la chronologie d’un parcours'),
    b('Distinguish facts, feelings and opinions', 'Distinguer faits, sentiments et opinions'),
    b('Catch nuances and hedges', 'Saisir nuances et atténuations'),
    b('Understand a guest’s motivations', 'Comprendre les motivations d’un invité'),
  ],
};

const C = 'l-long-interviews';
export default [
  lesson(C, 1, ['a-life-story', 'un-parcours'],
    b('A life story: the entrepreneur', 'Un parcours : l’entrepreneure'),
    b('Follow the stages of a career told in an interview.', 'Suivre les étapes d’une carrière racontée en entretien.'),
    [b('Follow time markers', 'Suivre les marqueurs de temps'), b('Identify turning points', 'Repérer les tournants'), b('Understand the motivation', 'Comprendre la motivation')],
    13,
    [
      card(b('Life-story markers', 'Les marqueurs du parcours'), b('**À l’époque…, Au départ…, Puis un jour…, C’est là que…, Du jour au lendemain…, Aujourd’hui…** A **turning point** is often introduced with **C’est là que tout a changé** or **un déclic**.', '**À l’époque…, Au départ…, Puis un jour…, C’est là que…, Du jour au lendemain…, Aujourd’hui…** Un **tournant** est souvent introduit par **C’est là que tout a changé** ou **un déclic**.')),
      hear('À l’époque, je travaillais dans une banque. J’avais un bon salaire, mais je m’ennuyais terriblement.', b('What was her situation at the time?', 'Quelle était sa situation à l’époque ?'), [b('A good salary in a bank, but bored', 'Un bon salaire dans une banque, mais elle s’ennuyait'), b('Unemployed', 'Au chômage'), b('Happy in a bakery', 'Heureuse dans une boulangerie'), b('A student', 'Étudiante')]),
      hear('Puis un jour, ma grand-mère m’a appris à faire son pain. Ça a été le déclic. Six mois plus tard, j’ouvrais ma boulangerie.', b('What was the turning point?', 'Quel a été le déclic ?'), [b('Learning to bake bread with her grandmother', 'Apprendre à faire le pain avec sa grand-mère'), b('Losing her job', 'Perdre son emploi'), b('Travelling abroad', 'Voyager à l’étranger'), b('Winning money', 'Gagner de l’argent')]),
      hear('Aujourd’hui, on a trois boulangeries et vingt employés. Mais honnêtement, ce qui me rend fière, c’est d’avoir gardé la recette de ma grand-mère.', b('What makes her proud?', 'Qu’est-ce qui la rend fière ?'), [b('Keeping her grandmother’s recipe', 'Avoir gardé la recette de sa grand-mère'), b('Having twenty employees', 'Avoir vingt employés'), b('Earning more than at the bank', 'Gagner plus qu’à la banque'), b('Having three shops', 'Avoir trois boulangeries')]),
      sort(b('Before, turning point or now?', 'Avant, tournant ou maintenant ?'), [b('before', 'avant'), b('turning point', 'tournant'), b('now', 'maintenant')], [['Je travaillais dans une banque.', 0], ['Ça a été le déclic.', 1], ['On a trois boulangeries.', 2], ['Je m’ennuyais.', 0], ['J’ouvrais ma boulangerie.', 1], ['Vingt employés.', 2]]),
      pairs(P.match, [['à l’époque', b('at the time, back then', 'autrefois')], ['un déclic', b('a trigger, a click', 'prise de conscience soudaine')], ['s’ennuyer', b('to be bored', 'trouver le temps long')], ['du jour au lendemain', b('overnight', 'très soudainement')]]),
      dict('À l’époque, je travaillais dans une banque, mais je m’ennuyais.', { voice: 'f' }),
    ],
    [
      b('Markers: à l’époque, au départ, puis un jour, aujourd’hui.', 'Marqueurs : à l’époque, au départ, puis un jour, aujourd’hui.'),
      b('Turning point: un déclic, c’est là que tout a changé.', 'Tournant : un déclic, c’est là que tout a changé.'),
      b('Imparfait = background; passé composé = events.', 'Imparfait = décor ; passé composé = événements.'),
    ],
    [['un salaire', b('a salary', 'paie')], ['fier, fière', b('proud', 'content de soi')], ['une recette', b('a recipe', 'méthode de cuisine')]],
  ),
  lesson(C, 2, ['facts-feelings-opinions', 'faits-sentiments-opinions'],
    b('Facts, feelings and opinions', 'Faits, sentiments et opinions'),
    b('Distinguish what happened, what was felt and what is thought.', 'Distinguer ce qui s’est passé, ce qui a été ressenti et ce qui est pensé.'),
    [b('Identify facts', 'Repérer les faits'), b('Identify feelings', 'Repérer les sentiments'), b('Identify opinions', 'Repérer les opinions')],
    13,
    [
      tip(b('Three layers', 'Trois couches'), b('**Fact**: verifiable (j’ai travaillé dix ans aux urgences). **Feeling**: j’étais épuisé, j’avais peur, ça m’a bouleversé. **Opinion**: je pense que, à mon avis, le système devrait…', '**Fait** : vérifiable (j’ai travaillé dix ans aux urgences). **Sentiment** : j’étais épuisé, j’avais peur, ça m’a bouleversé. **Opinion** : je pense que, à mon avis, le système devrait…')),
      hear('J’ai été infirmier aux urgences pendant douze ans, souvent de nuit.', b('What kind of information is it?', 'De quel type d’information s’agit-il ?'), [b('A fact', 'Un fait'), b('A feeling', 'Un sentiment'), b('An opinion', 'Une opinion'), b('A question', 'Une question')]),
      hear('À la fin, j’étais épuisé. Je rentrais chez moi et je n’arrivais plus à dormir.', b('How did he feel?', 'Que ressentait-il ?'), [b('Exhausted, unable to sleep', 'Épuisé, incapable de dormir'), b('Excited', 'Enthousiaste'), b('Bored', 'Ennuyé'), b('Relaxed', 'Détendu')]),
      hear('À mon avis, le système de santé devrait mieux protéger les soignants. Sinon, on va tous les perdre.', b('What is his opinion?', 'Quelle est son opinion ?'), [b('The health system should protect caregivers better', 'Le système de santé devrait mieux protéger les soignants'), b('Nurses should work more', 'Les infirmiers devraient travailler plus'), b('Hospitals are perfect', 'Les hôpitaux sont parfaits'), b('He wants to go back', 'Il veut y retourner')]),
      sort(b('Fact, feeling or opinion?', 'Fait, sentiment ou opinion ?'), [b('fact', 'fait'), b('feeling', 'sentiment'), b('opinion', 'opinion')], [['J’ai travaillé douze ans aux urgences.', 0], ['J’étais épuisé.', 1], ['Le système devrait changer.', 2], ['Je suis devenu enseignant en 2022.', 0], ['Ça m’a bouleversé.', 1], ['À mon avis, il faut agir.', 2]]),
      pairs(P.match, [['les urgences', b('the emergency department', 'service des urgences')], ['épuisé', b('exhausted', 'très fatigué')], ['un soignant', b('a caregiver, health worker', 'personne qui soigne')], ['bouleverser', b('to deeply move, to upset', 'émouvoir fortement')]]),
      dict('À mon avis, le système de santé devrait mieux protéger les soignants.', { voice: 'm' }),
    ],
    [
      b('Fact = verifiable; feeling = j’étais, ça m’a…; opinion = je pense, à mon avis.', 'Fait = vérifiable ; sentiment = j’étais, ça m’a… ; opinion = je pense, à mon avis.'),
      b('devrait = should (recommendation).', 'devrait = recommandation.'),
      b('Sinon = otherwise.', 'Sinon = autrement.'),
    ],
    [['protéger', b('to protect', 'défendre')], ['le système de santé', b('the health system', 'organisation des soins')], ['n’arriver plus à', b('to no longer manage to', 'ne plus réussir à')]],
  ),
  lesson(C, 3, ['nuances-and-hedges', 'nuances-et-attenuations'],
    b('Nuances and hedges: the novelist', 'Nuances et atténuations : la romancière'),
    b('Catch the nuances that soften or qualify an idea.', 'Saisir les nuances qui atténuent ou précisent une idée.'),
    [b('Recognise hedges', 'Reconnaître les atténuations'), b('Understand a nuanced answer', 'Comprendre une réponse nuancée'), b('Avoid over-interpreting', 'Éviter la surinterprétation')],
    13,
    [
      card(b('Hedging words', 'Les mots d’atténuation'), b('**pas vraiment, pas tout à fait, plutôt, en quelque sorte, d’une certaine manière, si l’on veut, dans une certaine mesure, je dirais que…** They mean the guest is **not fully** agreeing or disagreeing.', '**pas vraiment, pas tout à fait, plutôt, en quelque sorte, d’une certaine manière, si l’on veut, dans une certaine mesure, je dirais que…** Ils indiquent que l’invité n’est **pas totalement** d’accord ou en désaccord.')),
      hear('Est-ce que ce roman est autobiographique ? Pas vraiment… disons qu’il est inspiré, en quelque sorte, de mon enfance.', b('Is the novel autobiographical?', 'Le roman est-il autobiographique ?'), [b('Partly: inspired by her childhood, not exactly her life', 'En partie : inspiré de son enfance, pas exactement sa vie'), b('Completely', 'Complètement'), b('Not at all', 'Pas du tout'), b('She refuses to answer', 'Elle refuse de répondre')]),
      hear('Je dirais que l’écriture, c’est un métier comme un autre, dans une certaine mesure. On travaille tous les jours, avec des horaires.', b('How does she see writing?', 'Comment voit-elle l’écriture ?'), [b('Partly like an ordinary job, with daily work', 'En partie comme un métier ordinaire, avec un travail quotidien'), b('As pure inspiration', 'Comme une pure inspiration'), b('As a hobby', 'Comme un passe-temps'), b('As impossible', 'Comme impossible')]),
      hear('Le succès ? C’est agréable, bien sûr, mais d’une certaine manière, ça m’effraie un peu. J’ai peur de décevoir.', b('What does she feel about success?', 'Que ressent-elle face au succès ?'), [b('Pleased, but a little afraid of disappointing', 'Contente, mais un peu effrayée de décevoir'), b('Only happy', 'Seulement heureuse'), b('Indifferent', 'Indifférente'), b('Angry', 'En colère')]),
      sort(b('Strong or hedged statement?', 'Affirmation forte ou nuancée ?'), [b('strong', 'forte'), b('hedged', 'nuancée')], [['C’est totalement faux.', 0], ['Pas vraiment.', 1], ['C’est évident.', 0], ['En quelque sorte.', 1], ['Absolument.', 0], ['Dans une certaine mesure.', 1]]),
      pairs(P.match, [['en quelque sorte', b('in a way, sort of', 'd’une certaine façon')], ['dans une certaine mesure', b('to a certain extent', 'partiellement')], ['effrayer', b('to frighten', 'faire peur')], ['décevoir', b('to disappoint', 'ne pas satisfaire')]]),
      dict('Disons que ce roman est inspiré, en quelque sorte, de mon enfance.', { voice: 'f' }),
    ],
    [
      b('Hedges: pas vraiment, plutôt, en quelque sorte, dans une certaine mesure.', 'Atténuations : pas vraiment, plutôt, en quelque sorte, dans une certaine mesure.'),
      b('Disons que… / Je dirais que… = cautious statement.', 'Disons que… / Je dirais que… = affirmation prudente.'),
      b('Do not over-interpret a hedged answer.', 'Ne surinterprétez pas une réponse nuancée.'),
    ],
    [['autobiographique', b('autobiographical', 'qui raconte sa propre vie')], ['l’enfance', b('childhood', 'jeunesse')], ['un horaire', b('a schedule', 'emploi du temps')]],
  ),
];
