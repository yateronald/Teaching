import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Après avoir fini, en partant, ayant compris. The infinitive, the participles and the gerund are verb forms without a person. They make sentences shorter and more elegant, especially in writing, and they follow precise rules: the past infinitive after après, the same subject for the gerund, the invariable present participle. This course takes each form in turn, then mixes them in real instructions and formal texts.',
    'Après avoir fini, en partant, ayant compris. L’infinitif, les participes et le gérondif sont des formes verbales sans personne. Ils rendent les phrases plus courtes et plus élégantes, surtout à l’écrit, et ils obéissent à des règles précises : l’infinitif passé après après, le même sujet pour le gérondif, le participe présent invariable. Ce cours aborde chaque forme à tour de rôle, puis les mélange dans de vraies consignes et des textes soutenus.',
  ),
  outcomes: [
    b('Use the present and past infinitive', 'Employer l’infinitif présent et passé'),
    b('Form and use the present participle', 'Former et employer le participe présent'),
    b('Use the gerund with the right subject', 'Employer le gérondif avec le bon sujet'),
    b('Write shorter, more formal sentences', 'Écrire des phrases plus courtes et plus soutenues'),
  ],
};

const C = 'cj-modes-impersonnels';

export default [
  lesson(C, 1, ['present-and-past-infinitive', 'infinitif-present-et-passe'],
    b('The present and past infinitive', 'L’infinitif présent et passé'),
    b('Avant de partir, après être parti, merci de ne pas fumer.', 'Avant de partir, après être parti, merci de ne pas fumer.'),
    [b('Form the past infinitive', 'Former l’infinitif passé'), b('Use après + past infinitive', 'Employer après + infinitif passé'), b('Place the negation before the infinitive', 'Placer la négation avant l’infinitif')],
    13,
    [
      card(b('Same time, or before', 'En même temps, ou avant'), b('The **present infinitive** is for the same time or later: **Je veux partir. Avant de partir, ferme la porte.** The **past infinitive** (avoir or être + participle) is for an action that comes **before**: **après avoir mangé, après être arrivé, après s’être levé**. After **après**, it is the rule: **Après avoir fini, il est sorti.**', 'L’**infinitif présent** marque la simultanéité ou la postériorité : **Je veux partir. Avant de partir, ferme la porte.** L’**infinitif passé** (avoir ou être + participe) marque une action **antérieure** : **après avoir mangé, après être arrivé, après s’être levé**. Après **après**, c’est la règle : **Après avoir fini, il est sorti.**'), {
        ex: [['Après avoir dîné, nous sommes allés nous promener.', 'After having dinner, we went for a walk.'], ['Je regrette de ne pas être venu.', 'I’m sorry I didn’t come.']],
      }),
      trap(b('Après + past infinitive, and the same subject', 'Après + infinitif passé, et le même sujet'), b('In correct French, say **après avoir mangé**, not « après manger ». The infinitive has the same subject as the main verb: **Après avoir dîné, nous sommes sortis** (we dined, we went out). The negation stays together before the infinitive: **Merci de ne pas fumer.**', 'En français correct, on dit **après avoir mangé**, pas « après manger ». L’infinitif a le même sujet que le verbe principal : **Après avoir dîné, nous sommes sortis**. La négation reste groupée devant l’infinitif : **Merci de ne pas fumer.**')),
      mc(P.form, ['avoir terminé', 'terminé', 'terminer', 'avoir terminer'], { fr: 'Après ___ ses études, elle a voyagé pendant un an.' }),
      mc(P.form, ['être rentrés', 'avoir rentrés', 'être rentrer', 'rentrés'], { fr: 'Après ___ du travail, nous avons dîné.' }),
      mc(P.form, ['de ne pas avoir répondu', 'de ne avoir pas répondu', 'de pas avoir répondu', 'ne de pas avoir répondu'], { fr: 'Je m’excuse ___ plus tôt.' }),
      sort(b('Present or past infinitive?', 'Infinitif présent ou passé ?'), [b('same time or later: present', 'simultané ou postérieur : présent'), b('before: past', 'antérieur : passé')], [['avant de partir', 0], ['après être parti', 1], ['pour comprendre', 0], ['après avoir compris', 1], ['sans réfléchir', 0], ['après avoir réfléchi', 1]]),
      gap(P.complete, 'Après ___ (se lever), il a pris une douche. Merci de ___ (ne pas parler) pendant le film.', [['s’être levé'], ['ne pas parler']]),
      hear('Après avoir lu votre lettre, j’ai tout de suite appelé.', b('What happened first?', 'Qu’est-ce qui s’est passé en premier ?'), [b('Reading the letter', 'La lecture de la lettre'), b('The phone call', 'L’appel'), b('Both at the same time', 'Les deux en même temps')]),
      dict('Après être arrivés à l’hôtel, nous avons déposé nos valises et nous sommes sortis.'),
      say('Je suis content d’avoir enfin terminé ce projet.', 'I’m happy to have finally finished this project.'),
    ],
    [
      b('Past infinitive = avoir / être + participle (avoir fini, être parti).', 'Infinitif passé = avoir / être + participe (avoir fini, être parti).'),
      b('après + past infinitive; avant de + present infinitive.', 'après + infinitif passé ; avant de + infinitif présent.'),
      b('Negation: ne pas + infinitive (de ne pas fumer).', 'Négation : ne pas + infinitif (de ne pas fumer).'),
    ],
    [['déposer', b('to drop off', 'laisser quelque part')], ['réfléchir', b('to think (it over)', 'penser avec attention')], ['s’excuser', b('to apologise', 'demander pardon')]],
  ),

  lesson(C, 2, ['present-participle', 'participe-present'],
    b('The present participle', 'Le participe présent'),
    b('Parlant, finissant, étant, ayant, sachant: and the compound ayant fini, étant parti.', 'Parlant, finissant, étant, ayant, sachant : et le composé ayant fini, étant parti.'),
    [b('Form the present participle', 'Former le participe présent'), b('Use it in formal writing', 'L’employer à l’écrit soutenu'), b('Tell it from the verbal adjective', 'Le distinguer de l’adjectif verbal')],
    13,
    [
      card(b('Nous minus -ons, plus -ant', 'Nous moins -ons, plus -ant'), b('Take **nous** in the present, remove **-ons**, add **-ant**: **nous parlons → parlant, nous finissons → finissant, nous faisons → faisant**. Three exceptions: **être → étant, avoir → ayant, savoir → sachant**. The present participle never changes: **des personnes parlant français**.', 'Prenez **nous** au présent, enlevez **-ons**, ajoutez **-ant** : **nous parlons → parlant, nous finissons → finissant, nous faisons → faisant**. Trois exceptions : **être → étant, avoir → ayant, savoir → sachant**. Le participe présent ne varie jamais : **des personnes parlant français**.')),
      card(b('What it is for', 'À quoi il sert'), b('Mostly in writing. It replaces **qui** + verb: **les voyageurs ayant un billet** (= qui ont un billet). It gives a cause: **Étant malade, il est resté chez lui.** The compound participle shows an earlier cause: **Ayant raté le train, elle a pris un taxi.** **Étant arrivés en retard, ils ont attendu dehors.**', 'Surtout à l’écrit. Il remplace **qui** + verbe : **les voyageurs ayant un billet** (= qui ont un billet). Il donne une cause : **Étant malade, il est resté chez lui.** Le participe composé indique une cause antérieure : **Ayant raté le train, elle a pris un taxi.** **Étant arrivés en retard, ils ont attendu dehors.**')),
      trap(b('Participle or adjective?', 'Participe ou adjectif ?'), b('The participle is invariable and often has a complement: **des enfants obéissant à leurs parents**. The verbal adjective agrees: **des enfants obéissants**. Some are spelled differently. Participle and adjective: **fatiguant / fatigant, convainquant / convaincant, différant / différent**.', 'Le participe est invariable et a souvent un complément : **des enfants obéissant à leurs parents**. L’adjectif verbal s’accorde : **des enfants obéissants**. Certains s’écrivent différemment. Participe et adjectif : **fatiguant / fatigant, convainquant / convaincant, différant / différent**.')),
      pairs(b('Match each infinitive with its present participle.', 'Associez chaque infinitif à son participe présent.'), [['faire', 'faisant'], ['être', 'étant'], ['avoir', 'ayant'], ['savoir', 'sachant'], ['finir', 'finissant'], ['voir', 'voyant']], true),
      mc(P.form, ['ayant', 'avant', 'ayants', 'avoir'], { fr: 'Les voyageurs ___ un billet électronique peuvent embarquer.' }),
      mc(P.form, ['sachant', 'savant', 'savoir', 'sachants'], { fr: 'Ne ___ pas quoi dire, il s’est tu.' }),
      mc(P.spelling, ['fatigant', 'fatiguant', 'fatigants', 'fatiguants'], { fr: 'Ce voyage était vraiment ___.' }),
      gap(P.complete, '___ (être) en retard, nous avons pris un taxi. ___ (avoir + finir) son travail, elle est rentrée chez elle.', [['Étant'], ['Ayant fini']]),
      dict('Les étudiants souhaitant participer au voyage doivent s’inscrire avant vendredi.'),
      say('Ayant manqué le dernier bus, nous sommes rentrés à pied.', 'Having missed the last bus, we walked home.'),
    ],
    [
      b('Present participle: nous minus -ons + -ant; étant, ayant, sachant.', 'Participe présent : nous sans -ons + -ant ; étant, ayant, sachant.'),
      b('Invariable; mostly written; replaces qui + verb or gives a cause.', 'Invariable ; surtout à l’écrit ; remplace qui + verbe ou donne une cause.'),
      b('Compound participle: ayant fini, étant parti (earlier cause).', 'Participe composé : ayant fini, étant parti (cause antérieure).'),
    ],
    [['embarquer', b('to board', 'monter à bord')], ['se taire', b('to fall silent', 'arrêter de parler')], ['s’inscrire', b('to sign up', 'donner son nom pour participer')]],
  ),

  lesson(C, 3, ['the-gerund', 'le-gerondif'],
    b('The gerund: en + participle', 'Le gérondif : en + participe'),
    b('En marchant, en partant tôt, tout en souriant: and its one strict rule.', 'En marchant, en partant tôt, tout en souriant : et sa règle stricte.'),
    [b('Form the gerund', 'Former le gérondif'), b('Express time, manner, means and condition', 'Exprimer le temps, la manière, le moyen et la condition'), b('Respect the same-subject rule', 'Respecter la règle du même sujet')],
    13,
    [
      card(b('En + present participle', 'En + participe présent'), b('The gerund is **en** + present participle. It expresses an action done by the same subject at the same time. Time: **Il chante en cuisinant.** Manner: **Elle est venue en courant.** Means: **On apprend en pratiquant.** Condition: **En partant maintenant, tu arriveras à l’heure.** **Tout en** adds opposition: **Tout en étant fatigué, il a continué.**', 'Le gérondif, c’est **en** + participe présent. Il exprime une action faite par le même sujet, en même temps. Temps : **Il chante en cuisinant.** Manière : **Elle est venue en courant.** Moyen : **On apprend en pratiquant.** Condition : **En partant maintenant, tu arriveras à l’heure.** **Tout en** ajoute une opposition : **Tout en étant fatigué, il a continué.**'), {
        ex: [['Il s’est cassé le bras en tombant de vélo.', 'He broke his arm falling off his bike.'], ['C’est en forgeant qu’on devient forgeron.', 'Practice makes perfect.']],
      }),
      trap(b('The same subject, always', 'Toujours le même sujet'), b('The gerund has the subject of the main verb: **En sortant du métro, j’ai vu Paul** (I came out). Never « En sortant du métro, la pluie a commencé »: the rain did not come out of the metro. Say: **Quand je suis sorti du métro, la pluie a commencé.**', 'Le gérondif a le sujet du verbe principal : **En sortant du métro, j’ai vu Paul**. Jamais « En sortant du métro, la pluie a commencé » : la pluie n’est pas sortie du métro. Dites : **Quand je suis sorti du métro, la pluie a commencé.**')),
      mc(P.form, ['en faisant', 'en fait', 'faisant', 'en faire'], { fr: 'Elle écoute de la musique ___ ses devoirs.' }),
      mc(P.best, ['En arrivant à la gare, j’ai vu que le train était parti.', 'En arrivant à la gare, le train était parti.', 'En arrivant à la gare, mon billet a été perdu.', 'En arrivant à la gare, la pluie a commencé.']),
      sort(b('What does the gerund express?', 'Qu’exprime le gérondif ?'), [b('time', 'le temps'), b('manner or means', 'la manière ou le moyen'), b('condition', 'la condition')], [['Il lit en mangeant.', 0], ['Elle a maigri en faisant du sport.', 1], ['En partant tôt, vous éviterez les bouchons.', 2], ['J’ai vu Lucie en sortant du cinéma.', 0], ['On apprend en pratiquant.', 1], ['En cherchant bien, tu trouveras.', 2]]),
      gap(P.complete, 'Il s’est blessé ___ (tomber) de vélo. ___ (travailler) régulièrement, vous progresserez.', [['en tombant'], ['En travaillant']]),
      ord(P.order, 'Elle est entrée dans la salle en souriant.', { tr: 'She came into the room smiling.' }),
      hear('En prenant le train de huit heures, tu arriveras à midi.', P.meaning, [b('If you take the eight o’clock train, you will arrive at noon', 'Si tu prends le train de huit heures, tu arriveras à midi'), b('You took the eight o’clock train', 'Tu as pris le train de huit heures'), b('The train left at noon', 'Le train est parti à midi')]),
      dict('En lisant chaque jour un peu, vous enrichirez votre vocabulaire.'),
      say('Tout en travaillant beaucoup, elle trouve du temps pour sa famille.', 'While working a lot, she finds time for her family.'),
    ],
    [
      b('Gerund = en + present participle (en marchant).', 'Gérondif = en + participe présent (en marchant).'),
      b('Time, manner, means, condition; tout en = opposition.', 'Temps, manière, moyen, condition ; tout en = opposition.'),
      b('Same subject as the main verb, always.', 'Toujours le même sujet que le verbe principal.'),
    ],
    [['maigrir', b('to lose weight', 'perdre du poids')], ['un bouchon', b('a traffic jam', 'un embouteillage')], ['se blesser', b('to hurt oneself', 'se faire mal')]],
  ),

  lesson(C, 4, ['formal-writing-review', 'ecrit-soutenu-bilan'],
    b('Formal writing: review', 'L’écrit soutenu : bilan'),
    b('Infinitives, participles and gerunds in notices, instructions and emails.', 'Infinitifs, participes et gérondifs dans les affiches, les consignes et les courriels.'),
    [b('Read a formal notice', 'Lire une affiche officielle'), b('Choose the right impersonal form', 'Choisir la bonne forme impersonnelle'), b('Write formal instructions', 'Rédiger des consignes soutenues')],
    13,
    [
      card(b('Shorter and more formal', 'Plus court et plus soutenu'), b('Impersonal forms make writing more compact. Compare: **Quand vous aurez rempli le formulaire, vous l’enverrez.** and **Après avoir rempli le formulaire, envoyez-le.** Or: **Les personnes qui ont un billet** and **Les personnes ayant un billet**. Use them in notices, instructions and formal emails.', 'Les formes impersonnelles rendent l’écrit plus compact. Comparez : **Quand vous aurez rempli le formulaire, vous l’enverrez.** et **Après avoir rempli le formulaire, envoyez-le.** Ou : **Les personnes qui ont un billet** et **Les personnes ayant un billet**. Employez-les dans les affiches, les consignes et les courriels soutenus.')),
      doc({ title: 'Bibliothèque municipale', text: 'Les lecteurs souhaitant emprunter plus de cinq livres doivent s’adresser à l’accueil.\nAprès avoir rendu vos documents, vérifiez votre compte en ligne.\nMerci de ne pas manger dans les salles de lecture.\nEn cas de perte, le document sera facturé.', look: 'notice' }, b('What must you do after returning your books?', 'Que devez-vous faire après avoir rendu vos livres ?'), [b('Check your account online', 'Vérifier votre compte en ligne'), b('Go to the reception desk', 'Aller à l’accueil'), b('Pay for the books', 'Payer les livres'), b('Borrow five more books', 'Emprunter cinq autres livres')]),
      gap(P.completeText, '___ (après + lire) attentivement les consignes, complétez le formulaire. ___ (en + cliquer) sur « Envoyer », vous acceptez les conditions. Les candidats ___ (avoir) moins de dix-huit ans doivent joindre une autorisation.', [['Après avoir lu'], ['En cliquant'], ['ayant']]),
      mc(P.best, ['Avant de partir, n’oubliez pas d’éteindre la lumière.', 'Avant partir, n’oubliez pas d’éteindre la lumière.', 'Avant de être parti, n’oubliez pas d’éteindre la lumière.', 'En partant avant, n’oubliez pas éteindre la lumière.']),
      mc(P.form, ['ayant obtenu', 'ayant obtenus', 'avoir obtenu', 'en ayant obtenir'], { fr: 'Les étudiants ___ la meilleure note recevront une bourse.' }),
      write(b('Instructions for newcomers', 'Des consignes pour les nouveaux'), b('Write formal instructions for new members of a sports club, in 50 to 80 words. Use at least one past infinitive (après avoir…), one gerund (en + -ant), one present participle and one negative infinitive (merci de ne pas…).', 'Rédigez des consignes soutenues pour les nouveaux membres d’un club de sport, en 50 à 80 mots. Employez au moins un infinitif passé (après avoir…), un gérondif (en + -ant), un participe présent et un infinitif négatif (merci de ne pas…).'), 50, 80, [
        b('One past infinitive', 'Un infinitif passé'),
        b('One gerund and one present participle', 'Un gérondif et un participe présent'),
        b('One negative infinitive', 'Un infinitif négatif'),
      ], 'Bienvenue au club ! Après avoir reçu votre carte, présentez-la à l’accueil à chaque visite. Les membres souhaitant suivre un cours collectif doivent réserver en ligne. Merci de ne pas utiliser les machines sans serviette. En respectant ces règles, vous aiderez chacun à s’entraîner dans de bonnes conditions. Avant de partir, rangez votre matériel.'),
      say('Après avoir signé le contrat, nous avons fêté la nouvelle en famille.', 'After signing the contract, we celebrated the news with the family.'),
    ],
    [
      b('après + past infinitive, avant de + infinitive, sans + infinitive.', 'après + infinitif passé, avant de + infinitif, sans + infinitif.'),
      b('Participle in formal writing: les personnes ayant…', 'Participe à l’écrit soutenu : les personnes ayant…'),
      b('Gerund for means or condition: en cliquant, en respectant.', 'Gérondif pour le moyen ou la condition : en cliquant, en respectant.'),
    ],
    [['emprunter', b('to borrow', 'prendre pour un temps')], ['facturer', b('to charge (for)', 'faire payer')], ['une bourse', b('a grant, a scholarship', 'une aide financière pour les études')]],
  ),
];
