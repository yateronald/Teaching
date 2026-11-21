import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ce, cet, cette, ces: the little words you need to point at things in a shop, at a market or in a conversation. This course explains the four forms and the cet-before-a-vowel rule, adds -ci and -là to compare two items, and practises them in real situations: choosing clothes, ordering at the counter and talking about time (ce matin, cette semaine).',
    'Ce, cet, cette, ces : les petits mots indispensables pour désigner un objet en magasin, au marché ou dans une conversation. Ce cours explique les quatre formes et la règle de cet devant une voyelle, ajoute -ci et -là pour comparer deux objets, et les met en pratique dans des situations réelles : choisir un vêtement, commander au comptoir et parler du temps (ce matin, cette semaine).',
  ),
  outcomes: [
    b('Use ce, cet, cette and ces correctly', 'Employer correctement ce, cet, cette et ces'),
    b('Compare two items with -ci and -là', 'Comparer deux objets avec -ci et -là'),
    b('Talk about time: ce matin, cette semaine, ces jours-ci', 'Parler du temps : ce matin, cette semaine, ces jours-ci'),
    b('Choose and buy items in a shop', 'Choisir et acheter des articles en magasin'),
  ],
};

const C = 'demonstratives';
export default [
  lesson(C, 1, ['ce-cet-cette-ces', 'ce-cet-cette-ces'],
    b('Ce, cet, cette, ces', 'Ce, cet, cette, ces'),
    b('Point to people and things with the right demonstrative.', 'Désigner les personnes et les choses avec le bon démonstratif.'),
    [b('Choose ce, cette or ces', 'Choisir ce, cette ou ces'), b('Use cet before a vowel or silent h', 'Employer cet devant une voyelle ou un h muet'), b('Hear the difference between ces and ses', 'Entendre la différence entre ces et ses')],
    13,
    [
      card(b('Four forms', 'Quatre formes'), b('**ce** + masculine noun (**ce livre**), **cet** + masculine noun starting with a vowel or silent h (**cet hôtel**, **cet ami**), **cette** + feminine noun (**cette maison**), **ces** + any plural (**ces gens**).', '**ce** + nom masculin (**ce livre**), **cet** + nom masculin à voyelle ou h muet (**cet hôtel**, **cet ami**), **cette** + nom féminin (**cette maison**), **ces** + tout pluriel (**ces gens**).'), {
        ex: [['Ce restaurant est excellent.', 'This restaurant is excellent.'], ['Cet appartement est trop cher.', 'This flat is too expensive.'], ['Cette rue est très calme.', 'This street is very quiet.'], ['Ces chaussures sont confortables.', 'These shoes are comfortable.']],
      }),
      trap(b('Cet and cette sound the same', 'Cet et cette se prononcent pareil'), b('**cet ami** and **cette amie** are both pronounced [sɛt]: only the spelling shows the gender. Write **cet** for a masculine noun, **cette** for a feminine one.', '**cet ami** et **cette amie** se prononcent tous deux [sɛt] : seule l’orthographe montre le genre. Écrivez **cet** devant un masculin, **cette** devant un féminin.')),
      mc(P.word, ['cet', 'ce', 'cette', 'ces'], { fr: 'J’adore ___ hôtel.' }),
      mc(P.word, ['cette', 'ce', 'cet', 'ces'], { fr: 'Tu connais ___ chanson ?' }),
      mc(P.word, ['ces', 'cette', 'ce', 'ses'], { fr: 'Combien coûtent ___ pommes ?' }),
      sort(b('Which demonstrative?', 'Quel démonstratif ?'), ['ce', 'cet', 'cette'], [['ordinateur', 1], ['voiture', 2], ['quartier', 0], ['homme', 1], ['idée', 2], ['film', 0]]),
      gap(P.complete, '___ pantalon est trop petit, mais ___ chemise et ___ chaussettes sont parfaites.', ['Ce', 'cette', 'ces']),
      ord(P.order, 'Qui est cet homme près de la porte ?', { tr: 'Who is that man near the door?' }),
      dict('Cet été, nous visitons ces trois villes avec cette agence.', { voice: 'f' }),
    ],
    [
      b('ce + masculine, cet + masculine with a vowel / silent h, cette + feminine, ces + plural.', 'ce + masculin, cet + masculin à voyelle / h muet, cette + féminin, ces + pluriel.'),
      b('cet and cette sound the same: [sɛt].', 'cet et cette se prononcent pareil : [sɛt].'),
      b('ces (these) ≠ ses (his / her): same sound, different meaning.', 'ces (démonstratif) ≠ ses (possessif) : même son, sens différent.'),
    ],
    [['une chanson', b('a song', 'musique chantée')], ['les chaussettes', b('socks', 'vêtements pour les pieds')], ['une agence', b('an agency', 'entreprise de services')]],
  ),
  lesson(C, 2, ['this-one-that-one', 'celui-ci-celui-la'],
    b('-ci and -là: this one or that one?', '-ci et -là : celui-ci ou celui-là ?'),
    b('Compare two items in a shop with -ci and -là.', 'Comparer deux articles en magasin avec -ci et -là.'),
    [b('Add -ci and -là to a noun', 'Ajouter -ci et -là à un nom'), b('Compare two items', 'Comparer deux articles'), b('Shop for clothes politely', 'Acheter des vêtements poliment')],
    13,
    [
      card(b('Near or far', 'Proche ou éloigné'), b('To contrast two things, add **-ci** (here, near) and **-là** (there, further): **cette veste-ci** ou **cette veste-là** ? In everyday speech, **-là** is often used for both.', 'Pour opposer deux choses, ajoutez **-ci** (proche) et **-là** (plus loin) : **cette veste-ci** ou **cette veste-là** ? À l’oral courant, **-là** sert souvent pour les deux.'), {
        ex: [['Je préfère ce modèle-ci.', 'I prefer this model.'], ['Ces jours-ci, je suis très occupé.', 'These days, I’m very busy.'], ['À ce moment-là, il a compris.', 'At that moment, he understood.']],
      }),
      tip(b('Useful shopping phrases', 'Formules utiles en magasin'), b('**Je peux essayer cette robe ?** · **Vous l’avez en taille 40 ?** · **Je vais prendre celle-ci.** · **Elle coûte combien, cette veste-là ?**', '**Je peux essayer cette robe ?** · **Vous l’avez en taille 40 ?** · **Je vais prendre celle-ci.** · **Elle coûte combien, cette veste-là ?**'), {
        ex: [['Je peux essayer ce manteau-ci ?', 'Can I try on this coat?'], ['Vous l’avez en bleu ?', 'Do you have it in blue?']],
      }),
      mc(P.best, ['Je préfère cette robe-là.', 'Je préfère ce robe-là.', 'Je préfère cette-là robe.', 'Je préfère robe cette-là.']),
      mc(P.meaning, [b('at that moment (in the past)', 'à ce moment précis du passé'), b('right now', 'maintenant'), b('this morning', 'ce matin'), b('in a moment', 'bientôt')], { fr: 'à ce moment-là' }),
      pairs(P.match, [['Je peux l’essayer ?', b('Can I try it on?', 'demander à essayer')], ['Vous l’avez en 38 ?', b('Do you have it in size 38?', 'demander une taille')], ['Je vais prendre celle-ci.', b('I’ll take this one.', 'décider d’acheter')], ['Elle coûte combien ?', b('How much is it?', 'demander le prix')]]),
      gap(P.complete, 'Ce pull-___ est joli, mais ce pull-___, au fond, est moins cher.', ['ci', 'là']),
      dlg(b('In a clothes shop', 'Dans une boutique de vêtements'), undefined, [['Vendeuse', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour ! Je peux vous aider ?', 'Hello! Can I help you?'],
        [1, { options: ['Oui, je peux essayer cette veste-ci, en taille M ?', 'Oui, je peux essayer ce veste-ci ?', 'Oui, je peux essayer cet veste ?'] }],
        [0, 'Bien sûr. Les cabines sont au fond.', 'Of course. The fitting rooms are at the back.'],
        [1, { options: ['Elle est un peu grande. Vous avez ce modèle-là en S ?', 'Elle est grande. Vous avez ces modèle-là ?', 'Elle est grande. Vous avez cet modèle ?'] }],
        [0, 'Oui, tenez. Celle-ci devrait aller.', 'Yes, here you are. This one should fit.'],
      ]),
      say('Je vais prendre ces chaussures-ci et cette ceinture.', 'I’ll take these shoes and this belt.'),
    ],
    [
      b('-ci = this one (near), -là = that one (further); in speech -là is often used for both.', '-ci = proche, -là = éloigné ; à l’oral, -là sert souvent pour les deux.'),
      b('Time: ces jours-ci (these days), à ce moment-là (at that moment).', 'Le temps : ces jours-ci, à ce moment-là.'),
      b('Shop: Je peux l’essayer ? Vous l’avez en taille… ? Je vais prendre celle-ci.', 'En boutique : Je peux l’essayer ? Vous l’avez en taille… ? Je vais prendre celle-ci.'),
    ],
    [['la cabine d’essayage', b('the fitting room', 'lieu pour essayer')], ['la taille', b('the size', 'mesure d’un vêtement')], ['une ceinture', b('a belt', 'accessoire pour le pantalon')]],
  ),
  lesson(C, 3, ['time-with-demonstratives', 'le-temps-avec-les-demonstratifs'],
    b('Ce matin, cette semaine: talking about time', 'Ce matin, cette semaine : parler du temps'),
    b('Locate an action in time with ce, cet, cette and ces.', 'Situer une action dans le temps avec ce, cet, cette et ces.'),
    [b('Say ce matin, cet après-midi, ce soir', 'Dire ce matin, cet après-midi, ce soir'), b('Talk about this week, month and year', 'Parler de la semaine, du mois, de l’année en cours'), b('Plan your week aloud', 'Annoncer le programme de sa semaine')],
    13,
    [
      card(b('Time expressions', 'Les expressions de temps'), b('Demonstratives point to the current period: **ce matin, cet après-midi, ce soir, cette nuit, cette semaine, ce mois-ci, cette année, cet été, cet hiver**. Note **ce mois-ci** (not « ce mois »).', 'Les démonstratifs désignent la période en cours : **ce matin, cet après-midi, ce soir, cette nuit, cette semaine, ce mois-ci, cette année, cet été, cet hiver**. On dit **ce mois-ci** plutôt que « ce mois ».'), {
        ex: [['Ce matin, j’ai pris le métro.', 'This morning, I took the metro.'], ['Cet après-midi, j’ai une réunion.', 'This afternoon, I have a meeting.'], ['Cet hiver, il a beaucoup neigé.', 'This winter, it snowed a lot.']],
      }),
      mc(P.word, ['cet', 'ce', 'cette', 'ces'], { fr: 'On se voit ___ après-midi ?' }),
      mc(P.word, ['cette', 'ce', 'cet', 'ces'], { fr: 'Je suis en vacances toute ___ semaine.' }),
      mc(P.best, ['Ce mois-ci, je travaille moins.', 'Ce mois, je travaille moins.', 'Cette mois-ci, je travaille moins.', 'Cet mois-ci, je travaille moins.']),
      sort(b('Masculine or feminine period?', 'Période masculine ou féminine ?'), [b('ce / cet', 'ce / cet'), b('cette', 'cette')], [['matin', 0], ['semaine', 1], ['été', 0], ['année', 1], ['soir', 0], ['nuit', 1]]),
      gap(P.complete, '___ soir, je dîne chez ma mère et ___ week-end, je pars au chalet.', ['Ce', 'ce']),
      ord(P.order, 'Cette année, nous allons apprendre le français.', { tr: 'This year, we are going to learn French.' }),
      dlg(b('Planning the week', 'Organiser la semaine'), b('Two colleagues compare their agendas.', 'Deux collègues comparent leurs agendas.'), [['Karim', 'm'], ['Vous', 'f']], [
        [0, 'Tu es libre cet après-midi pour la réunion ?', 'Are you free this afternoon for the meeting?'],
        [1, { options: ['Non, cet après-midi je suis chez le client. Ce soir, peut-être ?', 'Non, ce après-midi je suis chez le client.', 'Non, cette après-midi je suis client.'] }],
        [0, 'Ce soir, c’est difficile. Et jeudi matin ?', 'Tonight is difficult. What about Thursday morning?'],
        [1, { options: ['Jeudi, c’est parfait. Cette semaine est vraiment chargée !', 'Jeudi, c’est parfait. Ce semaine est chargée !', 'Jeudi, parfait. Cet semaine est chargée !'] }],
      ]),
      say('Cette semaine, je travaille beaucoup, mais ce week-end je me repose.', 'This week I’m working a lot, but this weekend I’m resting.'),
    ],
    [
      b('ce matin, cet après-midi, ce soir, cette nuit.', 'ce matin, cet après-midi, ce soir, cette nuit.'),
      b('cette semaine, ce mois-ci, cette année, cet été, cet hiver.', 'cette semaine, ce mois-ci, cette année, cet été, cet hiver.'),
      b('Après-midi is usually masculine: cet après-midi.', 'Après-midi s’emploie surtout au masculin : cet après-midi.'),
    ],
    [['chargé', b('busy, full (schedule)', 'très occupé')], ['un chalet', b('a cottage', 'maison de campagne')], ['libre', b('free, available', 'disponible')]],
  ),
];
