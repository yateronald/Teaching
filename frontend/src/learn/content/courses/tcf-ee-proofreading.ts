import type { CourseAbout } from '../../types';
import { b, card, doc, exam, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In the 60-minute TCF writing paper, keeping the last 5 minutes for structured proofreading easily saves a full CEFR band. Most candidates reread passively from start to finish and miss silent gender slips, verb endings, missing accents or a word count slightly outside the limit. This course gives you a fast three-pass editing system to catch high-cost mistakes before the clock hits zero.',
    'Dans l’épreuve d’expression écrite du TCF de 60 minutes, garder les 5 dernières minutes pour une relecture ciblée peut faire gagner un niveau entier. La plupart des candidats relisent trop vite et laissent passer fautes de genre, accords verbaux, accents oubliés ou dépassement de mots. Ce cours propose une méthode d’audit en trois passes rapides pour corriger les erreurs coûteuses avant la fin du chrono.',
  ),
  outcomes: [
    b('Run a 3-pass self-edit in 5 minutes flat', 'Effectuer une relecture en 3 passes en 5 minutes'),
    b('Catch gender, adjective and past-participle agreements', 'Corriger genre, accords d’adjectifs et participes passés'),
    b('Fix critical accents, homophones and tense shifts', 'Corriger accents, homophones et concordance des temps'),
    b('Audit word counts and edit drafts without losing arguments', 'Vérifier le nombre de mots et ajuster un brouillon'),
  ],
};

const C = 'tcf-ee-proofreading';
export default [
  lesson(C, 1, ['gender-and-agreement-sweep', 'chasse-aux-accords'],
    b('Gender and agreement sweep', 'La chasse aux accords et au genre'),
    b('Catch silent plural endings, noun genders and past-participle agreements in Pass 1.', 'Repérer pluriels muets, genres piégeux et accords du participe passé dès la première passe.'),
    [b('Use the 3-pass 5-minute audit', 'Appliquer la relecture en 3 passes'), b('Fix trapped exam noun genders', 'Corriger le genre des noms fréquents'), b('Check avoir/être past participle agreements', 'Vérifier l’accord des participes passés')],
    13,
    [
      exam(b('The 5-minute, 3-pass audit', 'L’audit de 5 minutes en 3 passes'), b('Never reread just « to see if it sounds good ». Split your last 5 minutes: **Pass 1 (1 min)**: word count & prompt points. **Pass 2 (2 min)**: verbs, gender & plural agreements. **Pass 3 (2 min)**: accents, homophones & register.', 'Ne relisez jamais « à l’oreille ». Découpez vos 5 dernières minutes : **Passe 1 (1 min)** : nombre de mots et consigne. **Passe 2 (2 min)** : verbes, genres et pluriels. **Passe 3 (2 min)** : accents, homophones et registre.')),
      trap(b('Silent traps in B2 drafts', 'Les pièges muets au B2'), b('Silent plural **-s** and feminine **-e** disappear when read aloud in your head! Check: **un problème / un système / un avantage** (masculine!), **les gens sont** (plural verb!), **elle s’est inscrite**, **les décisions qu’on a prises** (direct object before avoir).', 'Les **-s** du pluriel et les **-e** du féminin ne s’entendent pas dans la tête ! Vérifiez : **un problème / un système / un avantage** (masculins !), **les gens sont** (pluriel !), **elle s’est inscrite**, **les décisions qu’on a prises** (COD placé avant avoir).')),
      mc(P.form, ['Les mesures que la ville a prises sont efficaces.', 'Les mesures que la ville a pris sont efficace.', 'Les mesures que la ville a prise sont efficaces.', 'Les mesures que la ville a prises est efficace.']),
      gap(P.completeText, 'Ma sœur s’est ___ au club lundi. Les deux solutions ___ nous avons ___ me semblent ___ que l’ancien système.', ['inscrite', 'que', 'choisies', 'meilleures'], { strict: true }),
      sort(b('Masculine or feminine noun?', 'Nom masculin ou féminin ?'), [b('masculine (un / ce)', 'masculin (un / ce)'), b('feminine (une / cette)', 'féminin (une / cette)')], [['problème', 0], ['solution', 1], ['système', 0], ['difficulté', 1], ['avantage', 0], ['méthode', 1]]),
      ord(P.order, 'Les solutions qu’elle a choisies sont vraiment utiles.', { tr: 'The solutions she chose are really useful.' }),
    ],
    [
      b('Split proofreading into 3 focused passes instead of one vague read-through.', 'Découpez la relecture en 3 passes ciblées plutôt qu’une lecture floue.'),
      b('Un problème, un système, un avantage, un choix are all masculine.', 'Un problème, un système, un avantage, un choix sont masculins.'),
      b('With avoir, agree the past participle when que / les precedes the verb.', 'Avec avoir, accordez le participe passé quand le COD (que, les…) précède.'),
    ],
    [['une mesure', b('a measure / policy', 'action décidée')], ['s’inscrire', b('to sign up / register', 'donner son nom')], ['efficace', b('effective', 'qui donne de bons résultats')]],
  ),
  lesson(C, 2, ['tense-and-accent-repair', 'temps-et-accents'],
    b('Tense, homophones and accents', 'Temps, homophones et accents'),
    b('Spot subjunctive triggers, a/à, ou/où and missing accents in 2 minutes.', 'Repérer subjonctif, a/à, ou/où et accents oubliés en 2 minutes.'),
    [b('Fix a/à, ou/où and ce/se homophones', 'Corriger les homophones a/à, ou/où, ce/se'), b('Check subjunctive triggers after bien que / il faut que', 'Vérifier le subjonctif après bien que / il faut que'), b('Spot missing é/è/ê accents on common exam words', 'Repérer les accents é/è/ê sur les mots clés')],
    13,
    [
      card(b('Four fast homophone & accent fixes', 'Quatre contrôles ultra-rapides'), b('Test mentally with a replacement: **a → avait** (no accent) vs **à** (preposition); **ou → ou bien** vs **où** (place/time); **ce** (+ noun) vs **se** (+ verb); **son** (+ noun) vs **sont** (être). Also check **bien que + subjonctif** and **créé / coût / tâche**.', 'Testez dans votre tête : **a → avait** (sans accent) vs **à** (préposition) ; **ou → ou bien** vs **où** (lieu/temps) ; **ce** (+ nom) vs **se** (+ verbe) ; **son** (+ nom) vs **sont** (être). Vérifiez aussi **bien que + subjonctif** et **créé / coût / tâche**.')),
      mc(P.form, ['Bien qu’il soit tard, elle va à la gare où son frère l’attend.', 'Bien qu’il est tard, elle va a la gare ou son frère l’attend.', 'Bien qu’il soit tard, elle va à la gare ou son frère l’attend.', 'Bien qu’il soit tard, elle va a la gare où son frère l’attend.']),
      gap(P.completeText, 'Le quartier ___ je vis ___ beaucoup changé. Bien que ce projet ___ coûteux, la ville a ___ un parc agréable.', ['où', 'a', 'soit', 'créé'], { strict: true }),
      pairs(P.match, [['malgrés les efforts', 'malgré les efforts'], ['biensûr que oui', 'bien sûr que oui'], ['il a dit que c’est faux', 'il a affirmé que c’était faux'], ['beaucoups de gens', 'beaucoup de gens']], true),
      sort(b('Which type of error?', 'Quel type d’erreur ?'), [b('homophone / accent', 'homophone / accent'), b('verb mood / tense', 'temps ou mode verbal'), b('invariable word', 'mot invariable')], [['Il va a Paris.', 0], ['Bien qu’il fait froid…', 1], ['malgrés la pluie', 2], ['la ville ou je travaille', 0], ['Il faut que vous venez.', 1], ['beaucoups d’amis', 2]]),
      say('Bien que ce quartier soit calme, le coût des loyers reste très élevé.', 'Although this neighbourhood is quiet, the cost of rents remains very high.'),
    ],
    [
      b('Test a/à with avait, and ou/où with ou bien.', 'Testez a/à avec avait, et ou/où avec ou bien.'),
      b('Malgré and beaucoup never take a final -s; bien sûr is always two words.', 'Malgré et beaucoup ne prennent jamais de -s ; bien sûr s’écrit en deux mots.'),
      b('After bien que and il faut que, check for the subjunctive (soit, fasse, aille).', 'Après bien que et il faut que, vérifiez le subjonctif (soit, fasse, aille).'),
    ],
    [['un homophone', b('a homophone', 'mot de même son, orthographe différente')], ['coûteux', b('expensive / costly', 'qui coûte cher')], ['invariable', b('invariable (never takes -s)', 'qui ne change jamais')]],
  ),
  lesson(C, 3, ['word-count-and-final-audit', 'comptage-et-audit-final'],
    b('Word count and final audit', 'Nombre de mots et audit final'),
    b('Count TCF words accurately, adjust length cleanly and rescue a flawed draft.', 'Compter les mots selon la règle du TCF, ajuster la longueur et corriger un brouillon.'),
    [b('Count apostrophes and hyphens accurately', 'Compter apostrophes et traits d’union sans erreur'), b('Expand or trim a draft without breaking structure', 'Allonger ou réduire un texte sans nuire au sens'), b('Correct a flawed draft cleanly in 5 minutes', 'Corriger un brouillon fautif en 5 minutes')],
    13,
    [
      card(b('How TCF counts words', 'Comment le TCF compte les mots'), b('A word is any unit between spaces: **l’école** = **1 word**, **c’est-à-dire** = **1 word**, **qu’est-ce que** = **2 words**. Stay inside **60–120** (T1), **120–150** (T2), **120–180** (T3). If 10 words short, add **1 concrete example**; if 15 words over, cut filler like **« dans notre société actuelle »**.', 'Un mot est une unité séparée par un espace : **l’école** = **1 mot**, **c’est-à-dire** = **1 mot**, **qu’est-ce que** = **2 mots**. Respectez **60–120** (T1), **120–150** (T2), **120–180** (T3). Trop court ? Ajoutez **un exemple concret** ; trop long ? Coupez les formules vides (**« dans notre société actuelle »**).')),
      doc({ look: 'page', title: b('Flawed Task 1 draft (48 words)', 'Brouillon fautif de tâche 1 (48 mots)'), text: 'Bonjour monsieur le directeur,\n\nJe vous écrit car il y a un gros problème dans ma appartement. Le chauffage ne marche pas depuis mardi et biensûr il fait très froid. Pouvez vous envoyer quelqu’un demain ?\n\nMerci beaucoup,\nSamir' }, b('What are the two biggest priorities to fix first?', 'Quelles sont les deux priorités à corriger en premier ?'), [b('word count (too short: expand to 60+ words) + basic spelling/gender slips', 'la longueur (trop court : atteindre 60+ mots) + les fautes d’orthographe et de genre'), b('change the formal vous to tu', 'remplacer vous par tu'), b('delete the closing formula', 'supprimer la formule de politesse'), b('remove the mention of the heating', 'retirer la mention du chauffage')]),
      mc(P.best, ['Cut empty padding (« de nos jours, dans le monde moderne ») rather than deleting an example.', 'Delete the entire conclusion paragraph.', 'Erase all linking words to save space.', 'Write shorter words without punctuation.'], { fr: 'Votre tâche 3 compte 195 mots (maximum 180). Que faire ?' }),
      sort(b('Good expansion or empty padding?', 'Bon ajout ou remplissage vide ?'), [b('adds real value', 'enrichit le texte'), b('empty padding', 'remplissage inutile')], [['ajouter un exemple précis (« par exemple, dans ma rue… »)', 0], ['répéter « je pense que, à mon avis, personnellement »', 1], ['préciser une date, une adresse ou une conséquence', 0], ['écrire « dans notre société d’aujourd’hui actuelle »', 1]]),
      write(b('Fix and expand the draft (75–115 words)', 'Corriger et étoffer le brouillon (75–115 mots)'), b('Rewrite Samir’s email to the building manager cleanly: fix « j’écris, mon appartement, bien sûr, Pouvez-vous », add apartment number, availability and polite closing so it fits 75–115 words.', 'Réécrivez proprement le courriel de Samir au gérant : corrigez « j’écris, mon appartement, bien sûr, Pouvez-vous », ajoutez le numéro d’appartement, vos disponibilités et une clôture polie (75–115 mots).'), 75, 115, [
        b('All four mistakes corrected cleanly', 'Les quatre erreurs corrigées'),
        b('Practical details added (flat number, availability)', 'Détails pratiques ajoutés (numéro, disponibilités)'),
        b('Polite formal closing and 75–115 words', 'Clôture formelle et 75–115 mots'),
      ], 'Bonjour Monsieur,\n\nJe vous écris car il y a un problème important dans mon appartement, au 3e étage (porte 34). Le chauffage ne fonctionne plus depuis mardi matin et, bien sûr, il fait très froid dans les chambres.\n\nPourriez-vous envoyer un technicien dès demain ? Je suis disponible toute la matinée, entre 8 h 30 et 12 h 30, pour lui ouvrir la porte. En cas d’absence, vous pouvez me joindre par téléphone à tout moment.\n\nJe vous remercie par avance pour votre intervention rapide.\n\nCordialement,\nSamir Haddad'),
      tip(b('Your 5-minute clock ritual', 'Votre rituel des 5 dernières minutes'), b('Minute 55–56: count words on all 3 tasks and verify every prompt point. Minute 56–58: check verbs, gender and **-s / -e** agreements. Minute 58–60: fix **à / où / é / è**, hyphens (**Pouvez-vous**) and signatures.', 'Minutes 55–56 : comptez les mots et cochez la consigne. Minutes 56–58 : vérifiez verbes, genres et accords **-s / -e**. Minutes 58–60 : corrigez **à / où / é / è**, traits d’union (**Pouvez-vous**) et signatures.')),
    ],
    [
      b('In TCF word counts, apostrophes join into 1 word (l’école = 1), spaces split.', 'Au TCF, l’apostrophe compte 1 mot (l’école = 1), l’espace sépare.'),
      b('Expand short drafts with concrete examples or practical details, never fluff.', 'Complétez un texte trop court par des exemples concrets, jamais du remplissage.'),
      b('Trim over-long drafts by cutting clichés while keeping arguments and examples.', 'Réduisez un texte trop long en coupant les clichés, pas les exemples.'),
    ],
    [['un gérant', b('a building manager', 'responsable de l’immeuble')], ['joindre quelqu’un', b('to reach someone', 'contacter par téléphone')], ['un remplissage', b('padding / filler', 'mots ajoutés sans idée')]],
  ),
];
