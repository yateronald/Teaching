import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, doc, flash, gap, hear, lesson, mc, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Speaking French fluently across France, Québec, Switzerland, Belgium and West Africa means reading unspoken social codes as accurately as vocabulary. This B2 conversation course explores how greetings (la bise, le tutoiement, Bienvenue !), debate styles (lively French contradiction vs consensus-driven dialogue), meal names and hospitality customs shift across the Francophone world.',
    'Parler français avec aisance entre la France, le Québec, la Suisse, la Belgique et l’Afrique francophone suppose de décoder les usages implicites autant que le vocabulaire. Ce cours de conversation B2 explore comment salutations (bise, tutoiement, Bienvenue !), rapport au débat (franchise frontale ou recherche de consensus), noms des repas et règles d’hospitalité varient dans le monde francophone.',
  ),
  outcomes: [
    b('Adapt greetings, bise and tu/vous by region', 'Adapter salutations, bise et tutoiement selon la région'),
    b('Decode French directness vs consensus styles', 'Décoder franchise française et culture du consensus'),
    b('Avoid social faux pas on timing, shoes and gifts', 'Éviter les impairs sur l’heure, les chaussures et les cadeaux'),
    b('Navigate meal names and hospitality customs smoothly', 'Maîtriser noms des repas et codes d’hospitalité'),
  ],
};

const C = 'c-francophone-codes';
export default [
  lesson(C, 1, ['greetings-bise-and-tu-vous', 'salutations-bise-et-tutoiement'],
    b('Greetings, la bise & tu / vous', 'Salutations, bise et tutoiement'),
    b('Recognise regional greeting rituals and avoid misreading Québec tu or « Bienvenue ! ».', 'Reconnaître les rituels d’accueil selon les régions et bien interpréter tu ou « Bienvenue ! ».'),
    [b('Adapt greetings across Francophone regions', 'Adapter ses salutations selon le pays'), b('Decode Québec « Bienvenue ! » and early tu', 'Comprendre le « Bienvenue ! » et le tu québécois'), b('Avoid skipping Bonjour in shops', 'Ne pas oublier Bonjour dans un commerce')],
    13,
    [
      card(b('Greetings across regions', 'Les salutations selon les régions'), b('In **France** and **Belgium**, friends greet with **la bise** (two, three or four cheeks depending on the region), whereas in **Québec** a quick **accolade** (hug) or wave is common and **tu** arrives much faster. In **West Africa**, titles of warm respect (**tonton, tata, patron**) and unhurried greetings are deeply valued.', 'En **France** et en **Belgique**, on se fait **la bise** (deux, trois ou quatre selon la région), alors qu’au **Québec** une **accolade** rapide ou un signe de la main est fréquent et le **tu** vient vite. En **Afrique de l’Ouest**, les marques de respect chaleureuses (**tonton, tata, patron**) et le temps pris pour saluer comptent beaucoup.'), {
        table: { head: [b('code', 'code'), b('France / Switzerland', 'France / Suisse'), b('Québec', 'Québec')], rows: [['shops & cafés', 'vous + Bonjour d’abord', 'tu courant, accueil direct'], ['after « Merci »', 'De rien / Je vous en prie', 'Bienvenue ! (= You’re welcome)']] },
      }),
      culture(b('The golden rule of Bonjour', 'La règle d’or du Bonjour'), b('In France, asking a shopkeeper a question without saying **Bonjour** first often feels brusque. Conversely, if a Montréal café barista uses **tu** right away, it signals warm equality, never rudeness.', 'En France, poser une question dans un commerce sans dire **Bonjour** d’abord paraît sec. À l’inverse, si un serveur à Montréal vous tutoie d’emblée, c’est un signe de proximité chaleureuse, jamais un manque de respect.'), { variant: 'culture' }),
      sort(b('France, Québec or shared rule?', 'France, Québec ou partagé ?'), [b('France', 'France'), b('Québec', 'Québec'), b('shared across both', 'partagé')], [['faire la bise selon les régions (2, 3 ou 4)', 0], ['répondre « Bienvenue ! » après « Merci ! »', 1], ['saluer avant toute question dans un commerce', 2], ['tutoyer facilement au café ou en boutique', 1], ['garder le vouvoiement longtemps avec un supérieur', 0], ['adapter son registre à son interlocuteur', 2]]),
      hear('Quand je suis arrivée à Montréal après dix ans à Paris, j’ai été surprise qu’on me tutoie dès la boulangerie, mais j’ai vite compris que c’était une marque de proximité chaleureuse, jamais un manque de respect.', b('How did she reinterpret Québec « tu »?', 'Comment a-t-elle fini par interpréter le « tu » québécois ?'), [b('as warm friendliness, not disrespect', 'comme une proximité chaleureuse, sans irrespect'), b('as a lack of formal politeness', 'comme un manque de politesse formelle'), b('as a habit reserved only for close family', 'comme un usage réservé à la famille'), b('as a mistake by a young baker', 'comme une erreur d’un jeune boulanger')], { voice: 'f' }),
      mc(P.meaning, [b('You’re welcome! (de rien / je vous en prie)', 'De rien ! / Je vous en prie !'), b('Welcome to my house for dinner!', 'Bienvenue chez moi pour dîner !'), b('Could you please repeat your order?', 'Pouvez-vous répéter votre commande ?'), b('Please come back tomorrow.', 'Revenez demain, s’il vous plaît.')], { fr: 'Au Québec, vous dites « Merci beaucoup ! » à la caisse et on vous répond « Bienvenue ! » :' }),
      pairs(P.match, [['une accolade', b('a hug / warm embrace', 'étreinte amicale')], ['la bise', b('cheek kiss greeting', 'baiser amical sur la joue')], ['la proximité', b('closeness, warmth', 'relation directe et simple')], ['d’emblée', b('right away, from the start', 'dès le premier instant')]]),
      say('Le tutoiement québécois exprime une chaleur immédiate, tandis qu’en France le vouvoiement protège la politesse.', 'Québec tu conveys immediate warmth, whereas in France vous safeguards politeness.'),
    ],
    [
      b('Bonjour first before any request in shops across the Francophone world.', 'Bonjour d’abord avant toute demande dans un commerce.'),
      b('Québec: early tu = warmth; « Bienvenue ! » = You’re welcome.', 'Québec : tutoiement rapide = chaleur ; « Bienvenue ! » = De rien.'),
      b('la bise varies regionally (2–4) vs l’accolade.', 'la bise varie selon les régions (2 à 4) / l’accolade.'),
    ],
    [['d’emblée', b('straight away', 'immédiatement')], ['une accolade', b('a hug', 'geste amical en serrant quelqu’un')], ['un faux pas', b('a social blunder', 'maladresse sociale')]],
  ),
  lesson(C, 2, ['directness-disagreement-and-debate', 'franchise-et-debat'],
    b('Directness, debate & understatement', 'Franchise, débat et litotes'),
    b('Read lively French contradiction without feeling attacked and navigate consensus cultures.', 'Comprendre la contradiction à la française sans se sentir attaqué et saisir les cultures du consensus.'),
    [b('Distinguish lively debate from hostility', 'Distinguer débat animé et hostilité'), b('Decode understatement like « Pas mal ! »', 'Décoder des litotes comme « Pas mal ! »'), b('Bridge French and Québec debate styles', 'Relier styles de discussion français et québécois')],
    13,
    [
      card(b('Debate vs consensus', 'Débat ou consensus'), b('In **France**, challenging an idea vigorously over dinner (**« Ah non, je ne suis pas du tout d’accord ! »**) often shows intellectual engagement, not anger. In **Québec** or **Switzerland**, speakers frequently value smooth consensus and soften disagreement to preserve harmony.', 'En **France**, contester une idée avec entrain au dîner (**« Ah non, je ne suis pas du tout d’accord ! »**) montre souvent de l’intérêt, pas de la colère. Au **Québec** ou en **Suisse**, on cherche davantage le consensus et on adoucit le désaccord pour préserver l’harmonie.'), {
        ex: [['Contredire une idée n’est pas rejeter la personne.', 'Disagreeing with an idea is not rejecting the person.'], ['C’est pas mal du tout !', b('It’s actually very good!', 'C’est vraiment réussi !')]],
      }),
      trap(b('Decode « Pas mal » and « Intéressant »', 'Décoder « Pas mal » et « Intéressant »'), b('**« C’est pas mal ! »** in French is often warm praise (litote = quite good!). By contrast, a flat **« C’est… original »** followed by a silence usually signals polite hesitation.', '**« C’est pas mal ! »** en français est souvent un vrai compliment (une litote = c’est réussi !). À l’inverse, un **« C’est… original »** suivi d’un silence traduit souvent une réserve polie.')),
      dlg(b('Unpacking a lively dinner', 'Débriefer un dîner animé'), undefined, [['Nadia (Paris)', 'f'], ['Marc-Antoine (Québec)', 'm']], [
        [0, 'Tu n’as pas trop parlé à table tout à l’heure, quelque chose t’a gêné ?', 'You didn’t talk much at dinner earlier, did something bother you?'],
        [1, { options: ['À vrai dire, quand Julien a dit « Mais non, pas du tout ! », j’ai cru qu’il était fâché.', 'Oui, il criait parce qu’il me déteste.', 'Non, je n’aime pas manger à Paris.'] }],
        [0, 'Oh pas du tout ! Au contraire, quand il débat comme ça, c’est qu’il trouve le sujet passionnant.', 'Oh not at all! On the contrary, when he debates like that, it means he finds the topic fascinating.'],
        [1, { options: ['C’est bon à savoir ! Chez nous, on évite plutôt d’affronter quelqu’un aussi directement.', 'Alors je vais l’insulter la prochaine fois.', 'Je ne parlerai plus jamais à Julien.'] }],
      ]),
      mc(P.best, ['They are engaged in the conversation and enjoying the debate — not angry with you.', 'They want to end the dinner immediately.', 'They think your French is too weak to continue.', 'They are personally offended by your background.'], { fr: 'À Paris, un invité répond avec énergie : « Ah non, pas du tout ! Écoute, je vais t’expliquer pourquoi… »' }),
      gap(P.complete, 'Là où un débat à la française valorise la ___, d’autres cultures francophones privilégient la recherche du ___.', ['contradiction', 'consensus'], { choices: [['contradiction', 'ponctualité', 'cuisine'], ['consensus', 'conflit', 'silence']] }),
      say('En France, contredire une idée pendant le dîner est souvent un signe d’intérêt, pas d’hostilité.', 'In France, contradicting an idea over dinner is often a sign of interest, not hostility.'),
    ],
    [
      b('In France, lively contradiction often signals interest, not hostility.', 'En France, contredire montre souvent de l’intérêt, pas de la colère.'),
      b('C’est pas mal ! = often a positive understatement.', 'C’est pas mal ! = souvent un compliment par litote.'),
      b('Québec & Switzerland lean more toward consensus.', 'Le Québec et la Suisse privilégient souvent le consensus.'),
    ],
    [['le consensus', b('consensus, agreement', 'accord général sans conflit')], ['une litote', b('understatement', 'dire moins pour suggérer plus')], ['l’entrain (m)', b('enthusiasm, liveliness', 'énergie joyeuse')]],
  ),
  lesson(C, 3, ['hospitality-invitations-and-gifts', 'hospitalite-et-savoir-vivre'],
    b('Hospitality, meals & invitations', 'Hospitalité, repas et invitations'),
    b('Navigate meal names, timing customs, shoes at the door and small host gifts.', 'Maîtriser noms des repas, ponctualité, chaussures à l’entrée et cadeaux d’hôte.'),
    [b('Know meal names across the Francophonie', 'Connaître déjeuner, dîner et souper selon les pays'), b('Judge arrival time and small host gifts', 'Gérer l’heure d’arrivée et les cadeaux d’hôte'), b('Write a practical cross-cultural guide', 'Rédiger un guide comparatif d’usages culturels')],
    13,
    [
      card(b('Hosting & being hosted', 'Recevoir et être reçu'), b('Meals: in **France**, *petit-déjeuner, déjeuner, dîner* ; in **Québec, Belgium and Switzerland**, *déjeuner, dîner, souper*. Invitations: never arrive empty-handed (**les mains vides**); remember **le quart d’heure de politesse** in France vs strict punctuality in Switzerland, and taking off shoes inside in Québec.', 'Repas : en **France**, *petit-déjeuner, déjeuner, dîner* ; au **Québec, en Belgique et en Suisse**, *déjeuner, dîner, souper*. Invitations : ne pas arriver **les mains vides** ; le **quart d’heure de politesse** en France face à la ponctualité stricte en Suisse, et retirer ses chaussures au Québec.'), {
        ex: [['Vous n’auriez pas dû ! — Mais si, ça me fait plaisir.', 'You shouldn’t have! — Of course, my pleasure.'], ['En Suisse et au Québec, « dîner » désigne le repas de midi.', 'In Switzerland and Québec, « dîner » means lunch.']],
      }),
      doc({ look: 'article', title: b('Meal names & visits across the Francophonie', 'Repas et visites dans la francophonie'), text: 'En France : petit-déjeuner · déjeuner · dîner.\nAu Québec, en Belgique et en Suisse romande : déjeuner (matin) · dîner (midi) · souper (soir).\n\nAutre code d’invitation : à Paris, arriver 10 minutes après l’heure dite est courant ; à Genève, mieux vaut être parfaitement à l’heure. Et au Québec, on enlève presque toujours ses chaussures en entrant chez quelqu’un — surtout en hiver !' }, b('What should you remember when invited into someone’s home in Québec?', 'Que faut-il retenir quand on est invité chez quelqu’un au Québec ?'), [b('take off your shoes at the entrance', 'enlever ses chaussures dès l’entrée'), b('arrive at least twenty minutes late', 'arriver au moins vingt minutes en retard'), b('call dinner « le déjeuner »', 'appeler le repas du soir « le déjeuner »'), b('wait outside until hosts open the wine', 'attendre dehors avant d’entrer')]),
      mc(P.best, ['Arriver vers 20 h 10 avec un dessert, des fleurs ou une bouteille, sans exiger qu’on les serve aussitôt.', 'Arriver à 19 h 45 les mains vides pour aider à cuisiner.', 'Arriver à 21 h passées avec votre propre plat principal.', 'Demander dès l’entrée si le repas est déjà prêt.'], { fr: 'On vous invite à dîner à 20 h chez des amis à Lyon :' }),
      write(b('Cross-cultural survival note', 'Note d’usages culturels'), b('Write a short guide (75–110 words) for a friend moving between Paris and Montréal (or Geneva): explain two concrete cultural codes (tu/vous, « Bienvenue ! », debate style, punctuality or shoes) and give one practical tip to avoid faux pas.', 'Rédigez un court guide (75–110 mots) pour un ami qui s’installe entre Paris et Montréal (ou Genève) : expliquez deux codes culturels concrets (tutoiement, « Bienvenue ! », style de débat, ponctualité ou chaussures) et donnez un conseil pratique.'), 75, 110, [
        b('At least two concrete regional codes compared', 'Au moins deux codes régionaux comparés'),
        b('Explanation of what each code means in practice', 'Explication du sens réel de chaque usage'),
        b('One practical tip to avoid faux pas', 'Un conseil concret pour éviter les impairs'),
      ], 'Quand on passe de Paris à Montréal, deux petits codes surprennent vite. D’abord, le tutoiement arrive presque partout dès le premier accueil, y compris dans les cafés : ce n’est pas un manque de respect, mais une façon directe de mettre à l’aise. Ensuite, si un Québécois vous répond « Bienvenue ! » après votre « Merci », il veut simplement dire « De rien ». Enfin, en hiver, pensez toujours à enlever vos chaussures dès l’entrée chez vos hôtes, et ne vous inquiétez pas si les débats restent plus consensuels qu’en France.', { phrases: ['D’abord…', 'ce n’est pas…, mais…', 'pensez toujours à…'] }),
      flash(b('Quick revision', 'Révision express'), [['le quart d’heure de politesse', b('fashionable 10–15 min margin', 'léger retard toléré en France')], ['ne pas venir les mains vides', b('not to come empty-handed', 'apporter une petite attention')], ['chercher le consensus', b('to seek consensus', 'éviter le choc frontal')], ['contredire sans froisser', b('to disagree without offending', 'débattre avec tact')], ['enlever ses chaussures', b('to take off one’s shoes', 'usage courant chez les hôtes')]]),
      say('À Paris, le quart d’heure de politesse est courant, mais à Genève la ponctualité reste la règle.', 'In Paris, a fifteen-minute margin is common, whereas in Geneva punctuality remains the rule.'),
    ],
    [
      b('France: déjeuner / dîner · Québec, Belgium, Switzerland: dîner / souper.', 'France : déjeuner / dîner · Québec, Belgique, Suisse : dîner / souper.'),
      b('Ne jamais arriver les mains vides · retirer ses chaussures au Québec.', 'Ne jamais arriver les mains vides · retirer ses chaussures au Québec.'),
      b('le quart d’heure de politesse (France) vs ponctualité stricte (Suisse).', 'le quart d’heure de politesse (France) / ponctualité stricte (Suisse).'),
    ],
    [['le souper', b('dinner / evening meal (QC, BE, CH)', 'repas du soir hors de France')], ['les mains vides', b('empty-handed', 'sans rien apporter')], ['froisser', b('to offend, ruffle feelings', 'blesser légèrement quelqu’un')]],
  ),
];
