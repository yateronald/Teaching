// B2 · Interjections: bof, ouf, aïe, chiche, mince, tant pis, ah bon.
import { ear, ex, fill, pick, situation } from '../authoring';

const EXAM = 'Ouf, c’est fini ! Le dernier exercice, bof, je ne suis pas sûr. Mais tant pis, on verra bien. Un resto ce soir pour fêter ça ? Chiche !';
const EXAM_SHOW = '{Ouf}, c’est fini ! Le dernier exercice, {bof}, je ne suis pas sûr. Mais {tant pis}, on verra bien. Un resto ce soir pour fêter ça ? {Chiche} !';

export default ear('les-interjections', {
  rule: [
    ['Les petits mots des réactions', 'Little reaction words'],
    [
      'Les interjections disent une réaction en un mot : __ouf !__ (soulagement), __aïe !__ (douleur), __bof__ (peu d’enthousiasme), __mince !__ (contrariété, poli), __tant pis__ (on accepte), __chiche !__ (on relève un défi), __ah bon ?__ (surprise).\n\nLeur sens dépend beaucoup de l’intonation : un __bof__ traînant dit qu’on n’est pas convaincu ; un __ah bon ?__ qui monte exprime la surprise.',
      'Interjections express a reaction in one word: __ouf !__ (relief), __aïe !__ (pain), __bof__ (lack of enthusiasm), __mince !__ (annoyance, polite), __tant pis__ (accepting it), __chiche !__ (taking up a dare), __ah bon ?__ (surprise).\n\nTheir meaning depends a lot on intonation: a drawn-out __bof__ says you are not convinced; a rising __ah bon ?__ shows surprise.',
    ],
  ],
  goal: ['Comprendre la réaction exprimée par une interjection.', 'Understand the reaction an interjection expresses.'],
  examples: [
    ex('Ouf, on a eu le train !', '{Ouf}, on a eu le train !', ['Soulagement.', 'Relief.']),
    ex('Le film ? Bof, pas terrible.', 'Le film ? {Bof}, pas terrible.', ['Peu d’enthousiasme.', 'Not impressed.']),
    ex('Mince, j’ai oublié mes clés.', '{Mince}, j’ai oublié mes clés.', ['Contrariété, de façon polie.', 'Annoyance, politely.']),
  ],
  items: [
    pick('Tu as aimé le concert ? Bof.', ['Il n’a pas trouvé ça génial', 'Il a adoré', 'Il ne l’a pas vu'], 0, 'Tu as aimé le concert ? {Bof}.', [
      'Bof = moyen, sans enthousiasme.', 'Bof = so-so, not keen.',
    ], ['Qu’en pense-t-il ?', 'What does he think?']),
    pick('Aïe ! Je me suis coupé.', ['Il a mal', 'Il est content', 'Il est surpris'], 0, '{Aïe} ! Je me suis coupé.', [
      'Aïe = la douleur.', 'Aïe = pain.',
    ], ['Que ressent-il ?', 'What does he feel?']),
    pick('Tu n’oserais pas lui dire ? Chiche !', ['Il relève le défi', 'Il refuse', 'Il a peur'], 0, 'Tu n’oserais pas lui dire ? {Chiche} !', [
      'Chiche = défi accepté : « je vais le faire ».', 'Chiche = dare accepted: « I’ll do it ».',
    ], ['Que veut dire « chiche » ici ?', 'What does « chiche » mean here?']),
    pick('Le magasin est fermé. Tant pis, on reviendra demain.', ['Ils acceptent la situation', 'Ils sont en colère', 'Ils sont ravis'], 0, 'Le magasin est fermé. {Tant pis}, on reviendra demain.', [
      'Tant pis = on accepte, ce n’est pas grave.', 'Tant pis = never mind.',
    ], ['Comment réagissent-ils ?', 'How do they react?']),
    pick('Il a démissionné ? Ah bon ?', ['Elle est surprise', 'Elle le savait déjà', 'Elle est triste'], 0, 'Il a démissionné ? {Ah bon} ? ↗', [
      'Ah bon ? qui monte = la surprise.', 'A rising Ah bon ? = surprise.',
    ], ['Quelle est sa réaction ?', 'What is her reaction?']),
    fill('Ouf, j’ai retrouvé mon portefeuille !', '___, j’ai retrouvé mon portefeuille !', ['Ouf', 'ouf'], '{Ouf}, j’ai retrouvé mon portefeuille !', [
      'Ouf = le soulagement.', 'Ouf = relief.',
    ]),
    fill('Mince, il pleut encore.', '___, il pleut encore.', ['Mince', 'mince'], '{Mince}, il pleut encore.', [
      'Mince = contrariété, sans grossièreté.', 'Mince = mild annoyance.',
    ]),
    fill('Il n’y a plus de place ? Tant pis.', 'Il n’y a plus de place ? Tant ___.', 'pis', 'Il n’y a plus de place ? {Tant pis}.', [
      'Tant pis : on renonce sans drame.', 'Tant pis: giving up calmly.',
    ]),
    situation(EXAM, 'Comment se sent la personne à la fin de l’examen ?', ['Soulagée', 'Furieuse', 'Malade'], 0, EXAM_SHOW, [
      '« Ouf, c’est fini ! »', '« Phew, it is over! »',
    ]),
    situation(EXAM, 'Que pense-t-elle du dernier exercice ?', ['Elle n’est pas sûre de l’avoir réussi', 'Elle est sûre de l’avoir réussi', 'Elle ne l’a pas fait'], 0, EXAM_SHOW, [
      '« Bof, je ne suis pas sûr. »', '« Meh, I am not sure. »',
    ]),
  ],
  takeaway: [
    'Ouf = soulagement, aïe = douleur, bof = peu d’enthousiasme, mince = contrariété, tant pis = on accepte, chiche = défi relevé, ah bon ? = surprise. Écoutez aussi l’intonation.',
    'Ouf = relief, aïe = pain, bof = not keen, mince = annoyance, tant pis = never mind, chiche = dare accepted, ah bon ? = surprise. Listen to the intonation too.',
  ],
});
