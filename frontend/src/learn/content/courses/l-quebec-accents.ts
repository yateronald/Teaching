import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French sounds and flows differently from Montréal and Québec City to Brussels, Geneva, Dakar and Abidjan. Beyond a handful of regional words, each variety has its own rhythm, intonation, discourse markers and polite routines. This B2 listening course trains your ear across the Francophone world so you follow Québec, Belgian, Swiss and African speakers without losing the thread.',
    'Le français sonne et respire différemment de Montréal et Québec jusqu’à Bruxelles, Genève, Dakar et Abidjan. Au-delà de quelques mots régionaux, chaque variété possède son rythme, son intonation, ses marqueurs du discours et ses formules de politesse. Ce cours de niveau B2 habitue votre oreille à la francophonie pour suivre locuteurs québécois, belges, suisses et africains sans perdre le fil.',
  ),
  outcomes: [
    b('Follow Québec discourse markers and conversational rhythm', 'Suivre marqueurs du discours et rythme québécois'),
    b('Catch Belgian and Swiss numbers, expressions and polite forms', 'Saisir nombres, expressions et politesses belges et suisses'),
    b('Recognise West and North African Francophone cadences and idioms', 'Reconnaître cadences et tournures d’Afrique de l’Ouest et du Maghreb'),
    b('Extract key meaning across regional accents at natural speed', 'Dégager l’essentiel à travers les accents régionaux à vitesse naturelle'),
  ],
};

const C = 'l-quebec-accents';
export default [
  lesson(C, 1, ['montreal-and-quebec-rhythms', 'rythmes-de-montreal-et-quebec'],
    b('Montréal & Québec rhythms and markers', 'Rythmes et marqueurs de Montréal et Québec'),
    b('Recognise Québec conversation markers, contractions and question cues.', 'Reconnaître marqueurs conversationnels, contractions et questions au Québec.'),
    [b('Decode fait que, mettons, pantoute, ben là', 'Décoder fait que, mettons, pantoute, ben là'), b('Hear Québec contractions in fast speech', 'Entendre les contractions rapides du Québec'), b('Track opinions despite regional idioms', 'Suivre une opinion malgré les expressions régionales')],
    13,
    [
      culture(b('The glue of Québec talk', 'Les charnières de l’oral québécois'), b('In Montréal and Québec City, connectors anchor every turn: **fait que** (so, as a result), **mettons** (let’s say / for example), **pantoute** (not at all), **ben là** (come on / well now), **c’est ben correct** (that’s totally fine), **à cette heure** (nowadays / right now).', 'À Montréal comme à Québec, de petits mots structurent l’échange : **fait que** (donc), **mettons** (disons / par exemple), **pantoute** (pas du tout), **ben là** (voyons donc), **c’est ben correct** (ça va très bien), **à cette heure** (maintenant).'), {
        ex: [['Fait que, mettons qu’on part à huit heures ?', 'So, say we leave at eight?'], ['Je ne suis pas d’accord pantoute.', 'I don’t agree at all.']],
      }),
      tip(b('Stay on the verb', 'Restez accroché au verbe'), b('When a Québec sentence moves fast, don’t freeze on a contraction like **m’as** (je vais) or **tsé** (tu sais): lock onto the **main verb and negation** right after it.', 'Quand une phrase québécoise file vite, ne bloquez pas sur une contraction comme **m’as** (je vais) ou **tsé** (tu sais) : visez tout de suite le **verbe principal et la négation**.')),
      hear('Fait que là, avec la tempête de neige, le bus avait quarante minutes de retard. J’étais pas content pantoute, mais bon, c’est l’hiver !', b('How did the speaker feel about the bus delay?', 'Comment le locuteur a-t-il réagi au retard du bus ?'), [b('Not happy at all, though resigned to winter', 'Pas content du tout, mais résigné face à l’hiver'), b('Thrilled to wait forty minutes in the snow', 'Ravi d’attendre quarante minutes dans la neige'), b('Surprised because buses never run in winter', 'Surpris car il n’y a jamais de bus en hiver'), b('Angry because the snowstorm was cancelled', 'Fâché parce que la tempête a été annulée')], { voice: 'm' }),
      hear('Mettons que tu prends le métro jusqu’à Berri, après ça tu marches cinq minutes pis t’arrives direct devant la salle.', b('What is she doing?', 'Que fait-elle ?'), [b('Giving simple directions using the metro and a short walk', 'Elle donne un itinéraire simple en métro puis à pied'), b('Complaining about metro ticket prices', 'Elle se plaint du prix du métro'), b('Cancelling tonight’s meeting near Berri', 'Elle annule le rendez-vous près de Berri'), b('Asking where the nearest station is', 'Elle demande où se trouve la station')], { voice: 'f2' }),
      sort(b('Québec marker or standard equivalent?', 'Marqueur québécois ou équivalent standard ?'), [b('Québec spoken marker', 'marqueur québécois'), b('standard equivalent', 'équivalent standard')], [['pas pantoute', 0], ['pas du tout', 1], ['fait que on part', 0], ['donc on part', 1], ['c’est ben correct', 0], ['c’est très bien', 1]], { listen: true }),
      pairs(P.match, [['fait que', 'donc, alors'], ['pas pantoute', 'pas du tout'], ['mettons', 'disons, par exemple'], ['à cette heure', 'maintenant']], true),
      dict('Fait que, mettons qu’on se retrouve à l’arrêt de bus.', { voice: 'f' }),
    ],
    [
      b('fait que = so/therefore; mettons = let’s say; pantoute = at all.', 'fait que = donc ; mettons = disons ; pantoute = pas du tout.'),
      b('c’est ben correct = that’s totally fine.', 'c’est ben correct = ça va très bien.'),
      b('Lock onto the main verb when speech accelerates.', 'Repérez le verbe principal quand le débit accélère.'),
    ],
    [['pantoute', b('at all (with negation, Québec)', 'pas du tout')], ['fait que', b('so, therefore (Québec)', 'donc, par conséquent')], ['mettons', b('say, suppose (Québec)', 'disons, par exemple')]],
  ),
  lesson(C, 2, ['belgian-and-swiss-francophonie', 'francais-de-belgique-et-de-suisse'],
    b('Belgian and Swiss rhythms and turns of phrase', 'Belgique et Suisse : rythmes et tournures'),
    b('Catch septante, nonante, huitante and everyday Belgian and Swiss expressions.', 'Saisir septante, nonante, huitante et les tournures belges et suisses.'),
    [b('Hear septante, huitante and nonante effortlessly', 'Comprendre septante, huitante et nonante sans calculer'), b('Understand Belgian and Swiss polite exchanges', 'Comprendre les politesses belges et suisses'), b('Spot differences in savoir vs pouvoir and meal words', 'Repérer savoir vs pouvoir et les noms des repas')],
    13,
    [
      card(b('Brussels and Geneva at the counter', 'À Bruxelles et à Genève'), b('Numbers first: Belgium and Switzerland use **septante** (70) and **nonante** (90); Switzerland also uses **huitante** (80, in Vaud/Fribourg). In Belgium: **S’il vous plaît !** also means « Here you go! » when handing something over, **à tantôt** = see you later today, **savoir** often means « to be able to » (**Tu sais m’aider ?**). In Switzerland: **un natel** = mobile phone, **Service !** = you’re welcome.', 'Les nombres d’abord : Belgique et Suisse disent **septante** (70) et **nonante** (90) ; la Suisse romande dit aussi **huitante** (80). En Belgique : **S’il vous plaît !** se dit aussi en tendant un objet, **à tantôt** = à tout à l’heure, **savoir** signifie souvent pouvoir (**Tu sais m’aider ?**). En Suisse : **un natel** = téléphone portable, **Service !** = de rien.'), {
        ex: [['Ça vous fait septante-cinq francs.', 'That comes to seventy-five francs.'], ['Tu sais fermer la fenêtre, s’il te plaît ?', 'Could you close the window, please?']],
      }),
      hear('Voici votre monnaie, monsieur, s’il vous plaît ! Et le total faisait septante-deux euros nonante.', b('How much was the total?', 'Quel était le montant total ?'), ['72,90 €', '62,90 €', '72,80 €', '92,70 €'], { voice: 'f' }),
      hear('Tu sais me prêter ton chargeur jusqu’à tantôt ? J’ai oublié mon câble au bureau.', b('When will he give back the charger?', 'Quand rendra-t-il le chargeur ?'), [b('Later today', 'Plus tard aujourd’hui'), b('Next month', 'Le mois prochain'), b('Tomorrow evening only', 'Demain soir seulement'), b('Right now, he doesn’t need it', 'Tout de suite, il n’en a pas besoin')], { voice: 'm2' }),
      hear('Envoie-moi un message sur mon natel dès que tu arrives à Lausanne, j’ai réservé pour le souper à huitante francs le menu.', b('What is the price of the dinner menu in Lausanne?', 'Quel est le prix du menu du souper à Lausanne ?'), [b('80 francs', '80 francs'), b('70 francs', '70 francs'), b('90 francs', '90 francs'), b('18 francs', '18 francs')], { voice: 'm' }),
      sort(b('Belgium, Switzerland or shared outside France?', 'Belgique, Suisse ou partagé hors de France ?'), [b('Belgian usage', 'usage belge'), b('Swiss usage', 'usage suisse'), b('shared (Belgium, Switzerland & Québec)', 'partagé (Belgique, Suisse et Québec)')], [['à tantôt pour le café', 0], ['mon nouveau natel', 1], ['le dîner de midi', 2], ['tu sais m’aider ?', 0], ['huitante-deux pour cent', 1], ['le souper de ce soir', 2]], { listen: true }),
      pairs(P.match, [['septante-quatre', b('74 (seventy-four)', 'soixante-quatorze')], ['nonante-neuf', b('99 (ninety-nine)', 'quatre-vingt-dix-neuf')], ['un natel', b('a mobile phone (Switzerland)', 'téléphone portable en Suisse')], ['à tantôt', b('see you later today (Belgium)', 'à tout à l’heure en Belgique')]]),
      dict('Tu sais me confirmer si le souper coûte nonante francs ?', { voice: 'f2' }),
    ],
    [
      b('septante = 70, huitante = 80 (CH), nonante = 90.', 'septante = 70, huitante = 80 (CH), nonante = 90.'),
      b('Belgian savoir = pouvoir (Tu sais m’aider ?); à tantôt = later today.', 'Savoir = pouvoir en Belgique ; à tantôt = à plus tard.'),
      b('Swiss natel = mobile phone; Service ! = you’re welcome.', 'Natel = portable en Suisse ; Service ! = de rien.'),
    ],
    [['septante', b('seventy (Belgium, Switzerland)', 'soixante-dix')], ['nonante', b('ninety (Belgium, Switzerland)', 'quatre-vingt-dix')], ['à tantôt', b('see you later today (Belgium)', 'à tout à l’heure')]],
  ),
  lesson(C, 3, ['west-and-north-african-francophonie', 'francophonie-d-afrique-et-du-maghreb'],
    b('African & Maghreb Francophone voices and cadences', 'Voix d’Afrique et du Maghreb'),
    b('Train your ear on West, Central and North African French rhythm and expressions.', 'Habituer son oreille aux rythmes et tournures d’Afrique et du Maghreb.'),
    [b('Hear syllable-timed clarity and expressive warmth', 'Percevoir la netteté syllabique et la chaleur expressive'), b('Understand everyday African and Maghreb French idioms', 'Comprendre des tournures courantes d’Afrique et du Maghreb'), b('Follow multi-accent Francophone broadcasts', 'Suivre un échange radiophonique multi-accents')],
    13,
    [
      culture(b('Across Dakar, Abidjan and Algiers', 'De Dakar à Abidjan et Alger'), b('In West and Central Africa, French often features crisp, syllable-timed pacing and vivid expressions: **on est ensemble** (we’re in this together / goodbye), **c’est géré** (it’s handled), **y a pas match** (no contest), **du courage !** (keep going!). In the Maghreb, French blends warm Arabic phrases like **saha** (thank you / cheers) and **inch’Allah** (hopefully) with French syntax.', 'En Afrique subsaharienne, le français a souvent un rythme syllabique très net et des expressions imagées : **on est ensemble**, **c’est géré**, **y a pas match**, **du courage !**. Au Maghreb, on mêle volontiers des touches comme **saha** (merci / bravo) et **inch’Allah** à un français fluide.'), {
        ex: [['Ne t’inquiète pas, le dossier est géré !', 'Don’t worry, the file is taken care of!'], ['Bon courage pour demain, on est ensemble !', 'Good luck tomorrow, we’re with you!']],
      }),
      tip(b('Listening across rhythms', 'S’adapter à chaque rythme'), b('North African French often rolls the **R** lightly or places crisp stress on phrase endings, while West African varieties tend to pronounce **every syllable evenly**—which can actually make words clearer once you tune in to the cadence!', 'Le français du Maghreb roule parfois légèrement le **R**, tandis que les variétés d’Afrique de l’Ouest détachent **chaque syllabe avec netteté**—ce qui facilite l’écoute dès qu’on adopte la cadence !')),
      hear('Franchement, pour l’organisation du colloque à Dakar, c’est géré : la salle est prête et les intervenants arrivent ce soir. On se retrouve demain, on est ensemble !', b('What is the status of the conference in Dakar?', 'Où en est l’organisation du colloque à Dakar ?'), [b('Everything is sorted out and speakers arrive tonight', 'Tout est géré et les intervenants arrivent ce soir'), b('The room is not ready yet', 'La salle n’est pas encore prête'), b('The conference has been postponed', 'Le colloque a été reporté'), b('Nobody knows when the guests arrive', 'Personne ne sait quand arrivent les invités')], { voice: 'm2' }),
      hear('Côté cuisine, entre le couscous de ma grand-mère et celui du restaurant, y a pas match : c’est elle la championne, et de loin !', b('What does « y a pas match » mean here?', 'Que veut dire « y a pas match » ici ?'), [b('There is no contest: her grandmother’s is far better', 'Aucune comparaison possible : celui de sa grand-mère gagne haut la main'), b('They are equally delicious', 'Les deux sont exactement pareils'), b('She prefers the restaurant’s version', 'Elle préfère celui du restaurant'), b('Nobody is cooking tonight', 'Personne ne cuisine ce soir')], { voice: 'f' }),
      dlg(b('Francophone radio roundtable', 'Table ronde francophone'), b('Hosts from Abidjan and Tunis wrap up a live music broadcast.', 'Des animateurs d’Abidjan et de Tunis concluent une émission musicale.'), [['Animateur', 'm'], ['Invitée', 'f2']], [
        [0, 'Merci pour cette belle sélection d’artistes de Tunisie et de Côte d’Ivoire !', 'Thanks for this great lineup of artists from Tunisia and Côte d’Ivoire!'],
        [1, 'Avec plaisir ! La tournée démarre vendredi à Abidjan, puis on passe par Tunis le mois prochain.', 'With pleasure! The tour kicks off Friday in Abidjan, then heads to Tunis next month.'],
        [0, { options: ['Bon courage pour les répétitions, et on reste ensemble pour la suite !', 'Bon courage pour le septante match.', 'Non, la tournée est gérée hier.'] }],
        [1, 'Merci infiniment, à très bientôt sur les ondes !', 'Thank you so much, talk to you soon on air!'],
      ]),
      pairs(P.match, [['c’est géré', b('it’s all taken care of', 'c’est réglé, maîtrisé')], ['on est ensemble', b('we’re with you / take care', 'solidarité, à bientôt')], ['y a pas match', b('no contest, hands down', 'aucune comparaison possible')], ['sur les ondes', b('on the airwaves (radio)', 'à l’antenne radio')]]),
      dict('Ne vous inquiétez pas, le dossier est entièrement géré.', { voice: 'm2' }),
    ],
    [
      b('c’est géré = handled; y a pas match = no contest.', 'c’est géré = réglé ; y a pas match = sans comparaison.'),
      b('on est ensemble = solidarity / warm goodbye.', 'on est ensemble = solidarité / à bientôt.'),
      b('Tune to the syllable cadence rather than fighting unfamiliar rhythm.', 'Suivez la cadence des syllabes plutôt que de résister au rythme.'),
    ],
    [['c’est géré', b('it’s handled / sorted out', 'affaire réglée')], ['sur les ondes', b('on the air (radio)', 'diffusé à la radio')], ['un colloque', b('an academic conference', 'rencontre de spécialistes')]],
  ),
];
