import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Manger, mangé, mangez, mangeait: four spellings, one sound [e]. This is the single most frequent spelling mistake in French, made even by native speakers. This course gives you the replacement test that solves it (replace with a verb of the 3rd group like vendre / vendu), then extends it to -ai / -ais / -ait and to the imperative, with many short sentences to train the reflex.',
    'Manger, mangé, mangez, mangeait : quatre graphies, un seul son [e]. C’est la faute d’orthographe la plus fréquente en français, même chez les natifs. Ce cours vous donne le test de remplacement qui la résout (remplacer par un verbe du 3e groupe comme vendre / vendu), puis l’étend à -ai / -ais / -ait et à l’impératif, avec de nombreuses phrases courtes pour entraîner le réflexe.',
  ),
  outcomes: [
    b('Use the vendre / vendu test', 'Utiliser le test vendre / vendu'),
    b('Choose -er, -é(e)(s) or -ez', 'Choisir -er, -é(e)(s) ou -ez'),
    b('Choose -ai or -ais / -ait', 'Choisir -ai ou -ais / -ait'),
    b('Proofread your verbs', 'Relire ses verbes'),
  ],
};

const C = 'sp-er-e-ez';
export default [
  lesson(C, 1, ['the-replacement-test', 'le-test-de-remplacement'],
    b('-er or -é? The replacement test', '-er ou -é ? Le test de remplacement'),
    b('Replace the verb with vendre / vendu to choose the infinitive or the participle.', 'Remplacer le verbe par vendre / vendu pour choisir infinitif ou participe.'),
    [b('Apply the vendre/vendu test', 'Appliquer le test vendre/vendu'), b('Infinitive after a preposition or a verb', 'Infinitif après une préposition ou un verbe'), b('Participle after avoir/être', 'Participe après avoir/être')],
    13,
    [
      card(b('The test', 'Le test'), b('Replace the verb with **vendre** (or prendre, mordre): if you can say **vendre** → write **-er** (infinitive): **Je vais manger** → je vais vendre. If you can say **vendu** → write **-é** (participle): **J’ai mangé** → j’ai vendu. Infinitive after **à, de, pour, sans** and after another verb (**aller, vouloir, pouvoir, aimer…**).', 'Remplacez le verbe par **vendre** (ou prendre, mordre) : si vous pouvez dire **vendre** → écrivez **-er** (infinitif) : **Je vais manger** → je vais vendre. Si vous pouvez dire **vendu** → écrivez **-é** (participe) : **J’ai mangé** → j’ai vendu. Infinitif après **à, de, pour, sans** et après un autre verbe (**aller, vouloir, pouvoir, aimer…**).'), {
        table: { head: [b('sentence', 'phrase'), b('test', 'test'), b('ending', 'terminaison')], rows: [['Je vais travaill…', 'je vais vendre', '-er'], ['J’ai travaill…', 'j’ai vendu', '-é'], ['Il est fatigu…', 'il est vendu', '-é'], ['Avant de part… / Pour mang…', 'pour vendre', '-er']] },
      }),
      sort(b('-er or -é?', '-er ou -é ?'), [b('-er (vendre)', '-er (vendre)'), b('-é (vendu)', '-é (vendu)')], [['Je dois travaill…', 0], ['J’ai travaill…', 1], ['Il faut écout…', 0], ['Nous avons écout…', 1], ['sans parl…', 0], ['Elle est arriv…', 1]]),
      mc(P.form, ['Elle a oublié de fermer la porte.', 'Elle a oublier de fermé la porte.', 'Elle a oublié de fermé la porte.', 'Elle a oublier de fermer la porte.']),
      gap(P.complete, 'J’ai décid___ de commenc___ à étudi___ le soir.', ['é', 'er', 'er'], { strict: true }),
      mc(P.form, ['Je l’ai vu traverser la rue.', 'Je l’ai vu traversé la rue.', 'Je l’ai vue traversé la rue.', 'Je l’ai vu traversée la rue.'], { explain: b('After a verb of perception (voir, entendre), the second verb is an infinitive: je l’ai vu vendre.', 'Après un verbe de perception (voir, entendre), le second verbe est à l’infinitif : je l’ai vu vendre.') }),
      dict('Il a commencé à pleuvoir quand nous sommes arrivés pour déjeuner.', { strict: true, hint: b('commencé (vendu), pleuvoir, arrivés (vendus), déjeuner (vendre).', 'commencé (vendu), pleuvoir, arrivés (vendus), déjeuner (vendre).') }),
    ],
    [
      b('Say vendre → -er; say vendu → -é.', 'On dit vendre → -er ; on dit vendu → -é.'),
      b('After à, de, pour, sans or a verb: infinitive -er.', 'Après à, de, pour, sans ou un verbe : infinitif -er.'),
      b('After avoir / être: participle -é (+ agreement if needed).', 'Après avoir / être : participe -é (+ accord si besoin).'),
    ],
    [['traverser', b('to cross', 'passer de l’autre côté')], ['décider', b('to decide', 'choisir')], ['déjeuner', b('to have lunch', 'repas de midi')]],
  ),
  lesson(C, 2, ['ez-and-agreement', 'ez-et-l-accord'],
    b('-ez, and -é / -ée / -és / -ées', '-ez, et -é / -ée / -és / -ées'),
    b('Recognise vous + -ez and add agreement to participles.', 'Reconnaître vous + -ez et ajouter l’accord aux participes.'),
    [b('-ez with vous', '-ez avec vous'), b('-ez in the imperative', '-ez à l’impératif'), b('Agree participles with être', 'Accorder les participes avec être')],
    13,
    [
      card(b('-ez and agreement', '-ez et l’accord'), b('**-ez** = verb with **vous**: **vous mangez, vous parlez**, and the imperative **mangez !** (test: replace with **vendez**). Careful: **vous avez mangé** (avoir + participle) and **vous allez manger** (aller + infinitive). With **être** or as an adjective, the participle agrees: **elles sont fatiguées, une porte fermée, des enfants épuisés**.', '**-ez** = verbe avec **vous** : **vous mangez, vous parlez**, et l’impératif **mangez !** (test : remplacer par **vendez**). Attention : **vous avez mangé** (avoir + participe) et **vous allez manger** (aller + infinitif). Avec **être** ou comme adjectif, le participe s’accorde : **elles sont fatiguées, une porte fermée, des enfants épuisés**.')),
      sort(b('-er, -é or -ez?', '-er, -é ou -ez ?'), [b('-er (vendre)', '-er (vendre)'), b('-é (vendu)', '-é (vendu)'), b('-ez (vendez)', '-ez (vendez)')], [['vous voulez dans…', 0], ['vous avez dans…', 1], ['vous dans… bien', 2], ['Écout… bien !', 2], ['vous allez chant…', 0], ['vous avez chant…', 1]]),
      gap(P.complete, 'Vous ___ (parler) français ? Vous avez ___ (étudier) longtemps ? Vous allez ___ (continuer) ?', ['parlez', 'étudié', 'continuer'], { strict: true }),
      mc(P.form, ['Les fenêtres sont fermées depuis hier.', 'Les fenêtres sont fermés depuis hier.', 'Les fenêtres sont fermer depuis hier.', 'Les fenêtres sont fermez depuis hier.']),
      mc(P.form, ['Entrez, et installez-vous !', 'Entrer, et installé-vous !', 'Entré, et installez-vous !', 'Entrez, et installer-vous !']),
      dict('Vous avez terminé ? Alors rangez vos affaires et allez déjeuner, les filles sont déjà installées.', { strict: true }),
    ],
    [
      b('-ez = vous form and imperative (test: vendez).', '-ez = forme de vous et impératif (test : vendez).'),
      b('vous avez mangé (vendu) / vous allez manger (vendre).', 'vous avez mangé (vendu) / vous allez manger (vendre).'),
      b('With être or as adjective: -é, -ée, -és, -ées.', 'Avec être ou comme adjectif : -é, -ée, -és, -ées.'),
    ],
    [['s’installer', b('to settle, sit down', 'prendre place')], ['épuisé', b('exhausted', 'très fatigué')], ['les affaires', b('belongings, things', 'objets personnels')]],
  ),
  lesson(C, 3, ['ai-or-ais', 'ai-ou-ais'],
    b('-ai or -ais? Future, past or conditional', '-ai ou -ais ? Futur, passé ou conditionnel'),
    b('Choose -ai (passé simple, future) or -ais/-ait (imparfait, conditional).', 'Choisir -ai (passé simple, futur) ou -ais/-ait (imparfait, conditionnel).'),
    [b('Use the « tu / il » test', 'Utiliser le test « tu / il »'), b('j’irai / j’irais', 'j’irai / j’irais'), b('je mangeai / je mangeais', 'je mangeai / je mangeais')],
    13,
    [
      card(b('The « nous » test', 'Le test « nous »'), b('To choose between **-rai** (future) and **-rais** (conditional), replace **je** by **nous**: **nous irons** → **j’irai** (future); **nous irions** → **j’irais** (conditional). Between **-ai** (passé simple) and **-ais** (imparfait): **nous mangeâmes** → je mangeai; **nous mangions** → je mangeais. Imparfait: **-ais, -ais, -ait, -ions, -iez, -aient**.', 'Pour choisir entre **-rai** (futur) et **-rais** (conditionnel), remplacez **je** par **nous** : **nous irons** → **j’irai** (futur) ; **nous irions** → **j’irais** (conditionnel). Entre **-ai** (passé simple) et **-ais** (imparfait) : **nous mangeâmes** → je mangeai ; **nous mangions** → je mangeais. Imparfait : **-ais, -ais, -ait, -ions, -iez, -aient**.')),
      gap(P.complete, 'Demain, j’ir___ à la piscine. Si j’avais le temps, j’ir___ tous les jours.', ['ai', 'ais'], { strict: true }),
      mc(P.form, ['Quand j’étais petit, je jouais au football.', 'Quand j’étai petit, je jouai au football.', 'Quand j’étais petit, je jouai au football.', 'Quand j’étai petit, je jouais au football.']),
      sort(b('-rai (future) or -rais (conditional)?', '-rai (futur) ou -rais (conditionnel) ?'), [b('-rai: nous …rons', '-rai : nous …rons'), b('-rais: nous …rions', '-rais : nous …rions')], [['Demain, je partir…', 0], ['Si je pouvais, je partir…', 1], ['Je te le dir… ce soir.', 0], ['J’aimer… un café, s’il vous plaît.', 1], ['L’an prochain, je ser… médecin.', 0], ['À ta place, je ser… prudent.', 1]]),
      dict('Je pensais que je viendrais, mais je viendrai plutôt la semaine prochaine.', { strict: true, hint: b('pensais (imparfait), viendrais (conditionnel), viendrai (futur).', 'pensais (imparfait), viendrais (conditionnel), viendrai (futur).') }),
      say('Demain, j’irai au marché. Si j’avais une voiture, j’irais à la campagne.', 'Tomorrow I will go to the market. If I had a car, I would go to the countryside.'),
    ],
    [
      b('Test with nous: nous irons → j’irai; nous irions → j’irais.', 'Test avec nous : nous irons → j’irai ; nous irions → j’irais.'),
      b('Imparfait: -ais, -ais, -ait.', 'Imparfait : -ais, -ais, -ait.'),
      b('Polite requests use the conditional: j’aimerais, je voudrais.', 'Les demandes polies sont au conditionnel : j’aimerais, je voudrais.'),
    ],
    [['la piscine', b('the swimming pool', 'bassin pour nager')], ['prudent', b('careful', 'qui fait attention')], ['plutôt', b('rather, instead', 'de préférence')]],
  ),
];
