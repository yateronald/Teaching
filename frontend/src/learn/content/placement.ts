// The free level test: four questions per level, A1 to C1. The test climbs
// level by level and stops as soon as a level is not secured (see PlacementPage).
import { b, type Level, type McqStep } from '../types';

export type PlacementQuestion = McqStep & { level: Level; skill: 'listening' | 'grammar' | 'vocabulary' | 'reading' };

const chooseWord = b('Choose the right word.', 'Choisissez le bon mot.');
const listenQ = b('Listen, then answer.', 'Écoutez, puis répondez.');

export const PLACEMENT: PlacementQuestion[] = [
  // ── A1 ──
  { kind: 'mcq', level: 'A1', skill: 'grammar', prompt: chooseWord, fr: 'Je ___ étudiant.', options: ['suis', 'es', 'est', 'sommes'], answer: 0 },
  { kind: 'mcq', level: 'A1', skill: 'listening', prompt: listenQ, audio: 'Bonjour, je m’appelle Clara et j’habite à Lyon.', listen: true,
    options: [b('Clara lives in Lyon.', 'Clara habite à Lyon.'), b('Clara lives in Paris.', 'Clara habite à Paris.'), b('Clara is from Lille.', 'Clara vient de Lille.'), b('Clara works in Lyon.', 'Clara travaille à Lyon.')], answer: 0 },
  { kind: 'mcq', level: 'A1', skill: 'vocabulary', prompt: b('What is “le mardi”?', 'Qu’est-ce que « le mardi » ?'), options: [b('a day of the week', 'un jour de la semaine'), b('a month', 'un mois'), b('a meal', 'un repas'), b('a colour', 'une couleur')], answer: 0 },
  { kind: 'mcq', level: 'A1', skill: 'grammar', prompt: chooseWord, fr: 'Elle a ___ chat noir.', options: ['un', 'une', 'des', 'la'], answer: 0 },

  // ── A2 ──
  { kind: 'mcq', level: 'A2', skill: 'grammar', prompt: chooseWord, fr: 'Hier, nous ___ au cinéma.', options: ['sommes allés', 'avons allé', 'allons', 'irons'], answer: 0 },
  { kind: 'mcq', level: 'A2', skill: 'listening', prompt: listenQ, audio: 'Le train à destination de Montréal partira avec vingt minutes de retard, voie trois.', listen: true,
    options: [b('The train is 20 minutes late.', 'Le train a vingt minutes de retard.'), b('The train is cancelled.', 'Le train est supprimé.'), b('The train leaves from platform 2.', 'Le train part de la voie 2.'), b('The train is early.', 'Le train est en avance.')], answer: 0 },
  { kind: 'mcq', level: 'A2', skill: 'grammar', prompt: chooseWord, fr: 'Je ne bois jamais ___ café le soir.', options: ['de', 'du', 'le', 'un'], answer: 0 },
  { kind: 'mcq', level: 'A2', skill: 'reading', prompt: b('Read the notice. What must you do?', 'Lisez l’affiche. Que devez-vous faire ?'),
    doc: { title: b('Notice', 'Affiche'), text: 'Piscine municipale — Le bonnet de bain est obligatoire. Douche avant l’entrée dans le bassin.' },
    options: [b('Wear a swimming cap and shower first.', 'Porter un bonnet et se doucher avant.'), b('Pay at the entrance.', 'Payer à l’entrée.'), b('Bring your own towel.', 'Apporter sa serviette.'), b('Book in advance.', 'Réserver à l’avance.')], answer: 0 },

  // ── B1 ──
  { kind: 'mcq', level: 'B1', skill: 'grammar', prompt: chooseWord, fr: 'Si j’avais plus de temps, j’___ le piano.', options: ['apprendrais', 'apprendrai', 'apprends', 'ai appris'], answer: 0 },
  { kind: 'mcq', level: 'B1', skill: 'listening', prompt: listenQ, audio: 'Franchement, le télétravail, au début j’étais contre, mais maintenant je ne pourrais plus m’en passer : je gagne deux heures de transport par jour.', listen: true,
    options: [b('She changed her mind and now likes remote work.', 'Elle a changé d’avis et apprécie le télétravail.'), b('She has always hated remote work.', 'Elle a toujours détesté le télétravail.'), b('She spends two hours a day working.', 'Elle travaille deux heures par jour.'), b('She wants to go back to the office.', 'Elle veut retourner au bureau.')], answer: 0 },
  { kind: 'mcq', level: 'B1', skill: 'vocabulary', prompt: b('Which word means “however”?', 'Quel mot signifie « toutefois » ?'), options: ['cependant', 'donc', 'puisque', 'ensuite'], answer: 0 },
  { kind: 'mcq', level: 'B1', skill: 'grammar', prompt: chooseWord, fr: 'C’est le livre ___ je t’ai parlé.', options: ['dont', 'que', 'qui', 'où'], answer: 0 },

  // ── B2 ──
  { kind: 'mcq', level: 'B2', skill: 'grammar', prompt: chooseWord, fr: 'Bien qu’il ___ malade, il est venu travailler.', options: ['soit', 'est', 'était', 'sera'], answer: 0 },
  { kind: 'mcq', level: 'B2', skill: 'reading', prompt: b('What is the author’s position?', 'Quelle est la position de l’auteur ?'),
    doc: { title: b('Opinion piece', 'Tribune'), text: 'On présente souvent la semaine de quatre jours comme une solution miracle. Les premiers résultats sont encourageants, certes, mais ils concernent surtout des entreprises de services : rien ne garantit que le modèle fonctionne dans l’industrie ou à l’hôpital.' },
    options: [b('Cautious: promising but not universal.', 'Prudente : prometteuse mais pas universelle.'), b('Fully in favour.', 'Totalement favorable.'), b('Completely against.', 'Totalement opposée.'), b('Indifferent.', 'Indifférente.')], answer: 0 },
  { kind: 'mcq', level: 'B2', skill: 'listening', prompt: listenQ, audio: 'Contrairement à ce qu’on pourrait croire, la hausse des loyers ne touche pas seulement les grandes villes : les villes moyennes sont désormais concernées.', listen: true,
    options: [b('Rents are also rising in medium-sized towns.', 'Les loyers augmentent aussi dans les villes moyennes.'), b('Rents are falling in big cities.', 'Les loyers baissent dans les grandes villes.'), b('Only big cities are affected.', 'Seules les grandes villes sont concernées.'), b('Rents are stable everywhere.', 'Les loyers sont stables partout.')], answer: 0 },
  { kind: 'mcq', level: 'B2', skill: 'vocabulary', prompt: b('“Il a pris la décision à la légère” means he decided…', '« Il a pris la décision à la légère » signifie qu’il a décidé…'), options: [b('without thinking it through', 'sans y réfléchir sérieusement'), b('very slowly', 'très lentement'), b('with great care', 'avec beaucoup de soin'), b('against his will', 'contre son gré')], answer: 0 },

  // ── C1 ──
  { kind: 'mcq', level: 'C1', skill: 'grammar', prompt: chooseWord, fr: 'Quelles que ___ vos raisons, votre absence n’est pas justifiée.', options: ['soient', 'sont', 'seraient', 'seront'], answer: 0 },
  { kind: 'mcq', level: 'C1', skill: 'reading', prompt: b('What does the author imply?', 'Que sous-entend l’auteur ?'),
    doc: { title: b('Editorial', 'Éditorial'), text: 'Le gouvernement se félicite d’avoir « écouté les citoyens ». On aurait aimé que cette écoute se traduise autrement que par la création d’un comité supplémentaire, dont les conclusions, comme celles des précédents, risquent fort de dormir dans un tiroir.' },
    options: [b('The consultation will probably change nothing.', 'La consultation ne changera probablement rien.'), b('The government listened carefully.', 'Le gouvernement a vraiment écouté.'), b('The committee will act quickly.', 'Le comité agira rapidement.'), b('Citizens did not take part.', 'Les citoyens n’ont pas participé.')], answer: 0 },
  { kind: 'mcq', level: 'C1', skill: 'listening', prompt: listenQ, audio: 'Je ne dis pas que la mesure est inutile, je dis qu’on en surestime la portée : à elle seule, elle ne réglera pas un problème qui est d’abord structurel.', listen: true,
    options: [b('The measure is useful but insufficient on its own.', 'La mesure est utile mais insuffisante à elle seule.'), b('The measure is useless.', 'La mesure est inutile.'), b('The measure will solve the problem.', 'La mesure réglera le problème.'), b('The problem is not structural.', 'Le problème n’est pas structurel.')], answer: 0 },
  { kind: 'mcq', level: 'C1', skill: 'vocabulary', prompt: b('Which connector expresses a concession?', 'Quel connecteur exprime une concession ?'), options: ['quoique', 'dès lors', 'en somme', 'à savoir'], answer: 0 },
];

/** Order of the levels the test climbs. */
export const PLACEMENT_LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
