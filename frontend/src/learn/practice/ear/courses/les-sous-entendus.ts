// C2 · Implicit meaning: presuppositions and insinuations (lui, au moins…; encore; enfin; même).
import { ear, ex, fill, pick, situation } from '../authoring';

const MERE = 'Ton frère, au moins, il appelle sa mère le dimanche. Enfin, je dis ça, je dis rien.';
const MERE_SHOW = 'Ton frère, {au moins}, il appelle sa mère le dimanche. Enfin, {je dis ça, je dis rien}.';

export default ear('les-sous-entendus', {
  rule: [
    ['Ce qui n’est pas dit', 'What is left unsaid'],
    [
      'Une phrase dit souvent plus que ses mots. Quelques petits mots portent un **présupposé** : __il a arrêté de fumer__ (donc il fumait), __tu as encore oublié__ (ce n’est pas la première fois), __elle a enfin trouvé__ (elle cherchait depuis longtemps), __même Paul a compris__ (Paul comprend difficilement).\n\nD’autres phrases font un **sous-entendu** que l’on doit deviner : __Lui, au moins, il est à l’heure__ (toi, tu ne l’es pas), __Il fait froid ici, non ?__ (ferme la fenêtre), __Tu as vu l’heure ?__ (il est tard). La formule __je dis ça, je dis rien__ prétend ne rien dire… tout en critiquant.',
      'A sentence often says more than its words. Some little words carry a **presupposition**: __il a arrêté de fumer__ (so he smoked), __tu as encore oublié__ (not the first time), __elle a enfin trouvé__ (she had been looking for a long time), __même Paul a compris__ (Paul is slow to understand).\n\nOther sentences carry an **insinuation** you must guess: __Lui, au moins, il est à l’heure__ (you are not), __Il fait froid ici, non ?__ (close the window), __Tu as vu l’heure ?__ (it is late). The phrase __je dis ça, je dis rien__ claims to say nothing… while criticising.',
    ],
  ],
  goal: ['Comprendre ce qu’une phrase laisse entendre sans le dire.', 'Understand what a sentence implies without saying it.'],
  examples: [
    ex('Lui, au moins, il est à l’heure.', 'Lui, {au moins}, il est à l’heure.', ['Sous-entendu : toi, tu ne l’es pas.', 'Implied: you are not.']),
    ex('Il fait un peu froid ici, non ?', 'Il fait un peu froid ici, {non} ?', ['Sous-entendu : ferme la fenêtre.', 'Implied: close the window.']),
    ex('Même Paul a compris.', '{Même} Paul a compris.', ['Présupposé : Paul a souvent du mal.', 'Presupposed: Paul usually struggles.']),
  ],
  items: [
    pick('Elle a enfin trouvé un travail.', ['Elle n’avait jamais cherché', 'Elle cherchait depuis longtemps'], 1, 'Elle a {enfin} trouvé un travail.', [
      '« Enfin » marque une longue attente.', '« Enfin » marks a long wait.',
    ], ['Que sous-entend « enfin » ?', 'What does « enfin » imply?']),
    pick('Tu as encore perdu tes clés ?', ['C’est la première fois', 'Ce n’est pas la première fois'], 1, 'Tu as {encore} perdu tes clés ?', [
      '« Encore » : cela s’est déjà produit, avec un reproche.', '« Encore »: it has happened before, with a reproach.',
    ], ['Que présuppose la question ?', 'What does the question presuppose?']),
    pick('Même mon grand-père sait utiliser ce téléphone.', ['Le grand-père est expert en informatique', 'Le téléphone est très simple'], 1, '{Même} mon grand-père sait utiliser ce téléphone.', [
      '« Même » : si lui y arrive, c’est que c’est facile.', '« Even » him: so it must be easy.',
    ], ['Que veut montrer la personne ?', 'What is the speaker suggesting?']),
    pick('Tu as vu l’heure ?', ['Il est tard, il faut se dépêcher ou partir', 'Elle veut savoir l’heure exacte'], 0, 'Tu as vu l’heure ?', [
      'Ce n’est pas une vraie question : c’est un reproche ou un signal.', 'Not a real question: a reproach or a signal.',
    ], ['Que veut probablement dire la personne ?', 'What does the speaker probably mean?']),
    pick('Il a arrêté de mentir.', ['Il n’a jamais menti', 'Il mentait avant'], 1, 'Il a {arrêté de} mentir.', [
      'Arrêter de suppose qu’on le faisait.', 'Stopping presupposes he used to.',
    ], ['Que présuppose la phrase ?', 'What does the sentence presuppose?']),
    fill('Lui, au moins, il dit merci.', 'Lui, au ___, il dit merci.', 'moins', 'Lui, au {moins}, il dit merci.', [
      'Au moins : d’autres, eux, ne le disent pas.', 'Au moins: others don’t.',
    ]),
    fill('Elle s’est enfin décidée.', 'Elle s’est ___ décidée.', 'enfin', 'Elle s’est {enfin} décidée.', [
      'Enfin : après une longue hésitation.', 'After a long hesitation.',
    ]),
    fill('Même lui a réussi.', '___ lui a réussi.', ['Même', 'même'], '{Même} lui a réussi.', [
      'Même : on ne l’attendait pas de lui.', 'Even he: not expected.',
    ]),
    situation(MERE, 'Que reproche-t-on implicitement à la personne ?', ['D’appeler trop souvent', 'De ne pas appeler sa mère', 'De ne pas aimer son frère'], 1, MERE_SHOW, [
      '« Ton frère, au moins… » : lui le fait, toi non.', '« Your brother, at least… »: he does, you don’t.',
    ]),
    situation(MERE, 'Que signifie « je dis ça, je dis rien » ?', ['La personne fait semblant de ne pas critiquer', 'La personne ne veut plus parler', 'La personne retire ce qu’elle a dit'], 0, MERE_SHOW, [
      'La formule prétend ne rien dire, mais confirme la critique.', 'It claims to say nothing, but confirms the criticism.',
    ]),
  ],
  takeaway: [
    'Encore, enfin, même, arrêter de portent des présupposés ; au moins, « tu as vu l’heure ? », « il fait froid, non ? » font des sous-entendus. Demandez-vous toujours : qu’est-ce que cela laisse entendre ?',
    'Encore, enfin, même, arrêter de carry presuppositions; au moins, « tu as vu l’heure ? », « il fait froid, non ? » carry insinuations. Always ask: what does it imply?',
  ],
});
