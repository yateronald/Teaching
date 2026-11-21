import type { CourseAbout } from '../../types';
import { b, card, dict, lesson, mc, P, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'For perfectionists: three championship-style dictations at C2 level, in the tradition of the great French dictation contests. Rare words, literary tenses (passé simple, imparfait du subjonctif), tricky agreements (participles followed by an infinitive, pronominal verbs, quelque / quel que), and the finest points of spelling. Each text is original and comes with a detailed explanation of every trap.',
    'Pour les perfectionnistes : trois dictées de niveau C2 dans l’esprit des grands concours de dictée francophones. Mots rares, temps littéraires (passé simple, imparfait du subjonctif), accords délicats (participes suivis d’un infinitif, verbes pronominaux, quelque / quel que) et subtilités de l’orthographe. Chaque texte est original et accompagné d’une explication détaillée de chaque piège.',
  ),
  outcomes: [
    b('Master literary verb forms in writing', 'Maîtriser à l’écrit les formes verbales littéraires'),
    b('Apply the hardest agreement rules', 'Appliquer les règles d’accord les plus difficiles'),
    b('Spell rare and learned words', 'Écrire des mots rares et savants'),
    b('Justify every choice', 'Justifier chaque choix'),
  ],
};

const C = 'sp-dictation-c2';
export default [
  lesson(C, 1, ['dictation-the-collector', 'dictee-le-collectionneur'],
    b('Dictation 1: the collector', 'Dictée 1 : le collectionneur'),
    b('Rare words and participles followed by an infinitive.', 'Mots rares et participes suivis d’un infinitif.'),
    [b('Spell rare nouns', 'Écrire des noms rares'), b('Agree participles + infinitive', 'Accorder les participes + infinitif'), b('Handle quelque / quel que', 'Gérer quelque / quel que')],
    13,
    [
      card(b('The traps', 'Les pièges'), b('**Les cantatrices qu’il avait entendues chanter** (they sing → agreement) · **les airs qu’il avait entendu chanter** (the airs are sung → invariable) · **quelque rares qu’elles fussent** (= si rares: invariable; imparfait du subjonctif) · **un pot-pourri, des pots-pourris** · **un ex-libris, des ex-libris** · **les phylactères**.', '**Les cantatrices qu’il avait entendues chanter** (elles chantent → accord) · **les airs qu’il avait entendu chanter** (les airs sont chantés → invariable) · **quelque rares qu’elles fussent** (= si rares : invariable ; imparfait du subjonctif) · **un pot-pourri, des pots-pourris** · **un ex-libris, des ex-libris** · **les phylactères**.')),
      dict('Le vieux collectionneur conservait, dans des vitrines poussiéreuses, des partitions annotées et des ex-libris jaunis.', { strict: true }),
      dict('Il évoquait avec émotion les cantatrices qu’il avait entendues chanter et les airs qu’il avait entendu fredonner dans sa jeunesse.', { strict: true }),
      dict('Quelque rares qu’elles fussent, ces partitions ne valaient rien à ses yeux sans les souvenirs qui s’y rattachaient.', { strict: true }),
      mc(P.choose, [b('entendues: the singers do the action of singing', 'entendues : les cantatrices font l’action de chanter'), b('entendu: always invariable before an infinitive', 'entendu : toujours invariable devant un infinitif'), b('entendus: masculine plural', 'entendus : masculin pluriel'), b('entendre: infinitive', 'entendre : infinitif')], { fr: 'Pourquoi « les cantatrices qu’il avait entendues chanter » ?' }),
      mc(P.choose, [b('fussent: imparfait du subjonctif after quelque… que', 'fussent : imparfait du subjonctif après quelque… que'), b('furent: passé simple', 'furent : passé simple'), b('soient: always required', 'soient : toujours obligatoire'), b('étaient: indicative', 'étaient : indicatif')], { fr: '« Quelque rares qu’elles fussent » : quelle forme et pourquoi ?' }),
    ],
    [
      b('Participle + infinitive: agree if the COD does the action.', 'Participe + infinitif : accord si le COD fait l’action.'),
      b('quelque + adjective + que = si: invariable, + subjunctive.', 'quelque + adjectif + que = si : invariable, + subjonctif.'),
      b('In literary narration, the imparfait du subjonctif may follow a past main verb.', 'En narration littéraire, l’imparfait du subjonctif peut suivre un verbe principal au passé.'),
    ],
    [['une cantatrice', b('an opera singer', 'chanteuse d’opéra')], ['fredonner', b('to hum', 'chanter à bouche fermée')], ['un ex-libris', b('a bookplate', 'marque de propriété dans un livre')]],
  ),
  lesson(C, 2, ['dictation-the-crossing', 'dictee-la-traversee'],
    b('Dictation 2: the crossing', 'Dictée 2 : la traversée'),
    b('Passé simple, pronominal agreements and nautical vocabulary.', 'Passé simple, accords des pronominaux et vocabulaire maritime.'),
    [b('Spell the passé simple', 'Écrire le passé simple'), b('Agree pronominal verbs', 'Accorder les verbes pronominaux'), b('Spell nautical words', 'Écrire le vocabulaire maritime')],
    13,
    [
      card(b('The traps', 'Les pièges'), b('**ils hissèrent, elle vainquit, ils parvinrent** (passé simple) · **les vagues qui s’étaient succédé** (COI: invariable) · **les deux marins s’étaient juré fidélité** (COD fidélité after: invariable) · **elles s’étaient tues** (se taire: essentially pronominal in this use → agreement) · **la houle, le bastingage, le roulis, le tangage**.', '**ils hissèrent, elle vainquit, ils parvinrent** (passé simple) · **les vagues qui s’étaient succédé** (COI : invariable) · **les deux marins s’étaient juré fidélité** (COD fidélité après : invariable) · **elles s’étaient tues** (se taire : accord avec le sujet) · **la houle, le bastingage, le roulis, le tangage**.')),
      dict('À l’aube, les matelots hissèrent les voiles et le navire quitta le port malgré la houle.', { strict: true }),
      dict('Les vagues qui s’étaient succédé toute la nuit avaient fait trembler le bastingage.', { strict: true }),
      dict('Les deux passagères, qui s’étaient tues pendant la tempête, se sourirent enfin lorsqu’ils parvinrent en vue des côtes.', { strict: true }),
      sort(b('Agreement or invariable?', 'Accord ou invariable ?'), [b('agreement', 'accord'), b('invariable', 'invariable')], [['elles se sont tu…', 0], ['elles se sont souri…', 1], ['ils se sont juré… fidélité', 1], ['les promesses qu’ils se sont juré…', 0], ['elles se sont aperçu… de l’erreur', 0], ['elles se sont succédé…', 1]]),
      mc(P.choose, ['ils parvinrent', 'ils parvenèrent', 'ils parvinèrent', 'ils parvinent'], { fr: 'Passé simple de « parvenir » à la 3e personne du pluriel :' }),
    ],
    [
      b('Passé simple of -venir: ils parvinrent, ils vinrent.', 'Passé simple des verbes en -venir : ils parvinrent, ils vinrent.'),
      b('se taire, s’apercevoir: agree with the subject.', 'se taire, s’apercevoir : accord avec le sujet.'),
      b('se succéder, se sourire, se jurer + COD after: invariable.', 'se succéder, se sourire, se jurer + COD après : invariables.'),
    ],
    [['la houle', b('the swell', 'mouvement de la mer')], ['le bastingage', b('the ship’s rail', 'garde-corps du navire')], ['hisser', b('to hoist', 'lever')]],
  ),
  lesson(C, 3, ['dictation-the-banquet', 'dictee-le-banquet'],
    b('Dictation 3: the banquet', 'Dictée 3 : le banquet'),
    b('A final championship-style dictation mixing every trap.', 'Une dictée finale de championnat mêlant tous les pièges.'),
    [b('Combine all the rules', 'Combiner toutes les règles'), b('Proofread methodically', 'Relire méthodiquement'), b('Justify the hardest choices', 'Justifier les choix les plus difficiles')],
    13,
    [
      card(b('Proofreading method', 'La méthode de relecture'), b('Proofread **three times**, each time for one thing: 1. **verbs** (subject, tense, mood, participles); 2. **agreements** of nouns, adjectives, colours, numbers; 3. **homophones and accents** (quelque / quel que, leur / leurs, a / à, accents of rare words).', 'Relisez **trois fois**, chaque fois pour une seule chose : 1. les **verbes** (sujet, temps, mode, participes) ; 2. les **accords** des noms, adjectifs, couleurs, nombres ; 3. les **homophones et accents** (quelque / quel que, leur / leurs, a / à, accents des mots rares).')),
      dict('Quels que fussent les mets qu’on leur eût servis, les convives se seraient extasiés : la soirée s’annonçait mémorable.', { strict: true, hint: b('quels que (two words, agreement), eût servis (plus-que-parfait du subjonctif, COD before), extasiés.', 'quels que (deux mots, accord), eût servis (plus-que-parfait du subjonctif, COD avant), extasiés.') }),
      dict('On apporta des pièces montées couleur crème et des sorbets vert pomme, que les cuisiniers avaient fait glacer la veille.', { strict: true }),
      dict('Les quelque deux cents invités, qui s’étaient laissé convaincre de rester, ne se quittèrent qu’à l’aurore.', { strict: true }),
      mc(P.choose, [b('All are correct: invariable colours, fait + infinitive, quelque = environ, laissé + infinitive (1990).', 'Tout est correct : couleurs invariables, fait + infinitif, quelque = environ, laissé + infinitif (1990).'), b('« vert pomme » should be « verts pommes ».', '« vert pomme » devrait être « verts pommes ».'), b('« fait glacer » should be « faits glacer ».', '« fait glacer » devrait être « faits glacer ».'), b('« quelque » should be « quelques ».', '« quelque » devrait être « quelques ».')], { fr: 'Dans « des sorbets vert pomme… qu’ils avaient fait glacer… les quelque deux cents invités », que faut-il corriger ?' }),
      write(b('Your own dictation.', 'Votre propre dictée.'), b('Write a short original text (60–100 words) containing at least five traps from this course (participle + infinitive, pronominal agreement, quelque / quel que, compound colour, passé simple), then underline them mentally and check each one.', 'Rédigez un court texte original (60–100 mots) contenant au moins cinq pièges de ce cours (participe + infinitif, accord pronominal, quelque / quel que, couleur composée, passé simple), puis vérifiez chacun.'), 50, 110, [
        b('At least five traps', 'Au moins cinq pièges'),
        b('Every agreement checked', 'Chaque accord vérifié'),
        b('Consistent tenses', 'Temps cohérents'),
      ], 'Quelles que fussent leurs craintes, les deux sœurs se rendirent au bal. Elles portaient des robes bleu nuit qu’elles s’étaient fait coudre en secret. Les musiciens qu’elles avaient entendus jouer la veille les accueillirent avec quelque solennité. Elles dansèrent jusqu’à minuit, se sourirent souvent et ne se quittèrent qu’au lever du jour.'),
    ],
    [
      b('Proofread in three passes: verbs, agreements, homophones/accents.', 'Relisez en trois passages : verbes, accords, homophones/accents.'),
      b('Literary tenses: passé simple, subjonctif imparfait and plus-que-parfait.', 'Temps littéraires : passé simple, subjonctif imparfait et plus-que-parfait.'),
      b('Every rule of the spelling path appears in real texts: keep practising.', 'Toutes les règles du parcours apparaissent dans les vrais textes : continuez à pratiquer.'),
    ],
    [['un convive', b('a dinner guest', 'invité à un repas')], ['une pièce montée', b('a tiered cake', 'grand gâteau de fête')], ['l’aurore', b('dawn', 'lever du jour')]],
  ),
];
