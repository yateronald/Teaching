import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Express sharp wit, sound judgement and quiet resilience in C1 French. Master sensory and spatial idioms for foresight (avoir le nez creux, lire entre les lignes), critical distance (faire la part des choses, démêler le vrai du faux) and poise under pressure (ne pas se démonter, faire contre mauvaise fortune bon cœur).',
    'Exprimez finesse d’esprit, discernement et force de caractère en français C1. Maîtrisez les images sensorielles de l’intuition (avoir le nez creux, lire entre les lignes), du recul critique (faire la part des choses, démêler le vrai du faux) et du sang-froid (ne pas se démonter, faire contre mauvaise fortune bon cœur).',
  ),
  outcomes: [
    b('Talk naturally about wit, foresight and reading subtext', 'Nuancer intuition, esprit de repartie et lecture entre les lignes'),
    b('Weigh facts objectively and resist manipulation with idiomatic precision', 'Exprimer discernement, recul critique et lucidité'),
    b('Describe strong character, composure and resilience under adversity', 'Décrire caractère affirmé, sang-froid et résilience avec naturel'),
  ],
};

const C = 'exp-mind-judgement-character';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['wit-and-foresight', 'esprit-de-repartie-et-flair'],
    b('Wit, intuition & reading between the lines', 'Esprit, intuition et clairvoyance'),
    b('From Diderot’s late repartee to sharp foresight: master five C1 idioms of intellect and instinct.', 'De la réplique tardive de Diderot à l’intuition sûre : maîtrisez cinq expressions clés de la finesse d’esprit.'),
    [
      b('Distinguish avoir le nez creux and avoir du flair', 'Distinguer avoir le nez creux et avoir du flair'),
      b('Use avoir l’esprit de l’escalier in natural hindsight', 'Employer avoir l’esprit de l’escalier à bon escient'),
      b('Express foresight and subtext reading smoothly', 'Exprimer clairvoyance et lecture implicite avec aisance'),
    ],
    13,
    [
      card(
        b('Senses of the mind: wit and foresight', 'Les sens de l’esprit : repartie et clairvoyance'),
        b(
          'French pictures intellect and instinct through physical senses and space: **the nose** for foresight (**avoir le nez creux**, **voir plus loin que le bout de son nez**), **scent** for instinct (**avoir du flair**), **reading the white space** for subtext (**lire entre les lignes**), and **the staircase** for the clever retort that arrives too late (**avoir l’esprit de l’escalier**).\nForesight & instinct: **avoir le nez creux · avoir du flair · voir plus loin que le bout de son nez**.\nSubtext & wit: **lire entre les lignes · avoir l’esprit de l’escalier**.',
          'Le français incarne la vivacité d’esprit dans le corps et l’espace : le **nez** pour l’anticipation (**avoir le nez creux**, **voir plus loin que le bout de son nez**), le **flair** pour l’instinct, l’espace entre les mots pour l’implicite (**lire entre les lignes**), et **l’escalier** pour le bon mot qui vient trop tard (**avoir l’esprit de l’escalier**).\nIntuition et portée : **avoir le nez creux · avoir du flair · voir plus loin que le bout de son nez**.\nSous-entendu et repartie : **lire entre les lignes · avoir l’esprit de l’escalier**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Nuance & register', 'Nuance et registre')],
            rows: [
              ['avoir l’esprit de l’escalier', b('to think of the perfect reply too late', 'trouver la bonne réplique après coup'), b('cultivated, literary or witty', 'cultivé, souvent teinté d’humour')],
              ['avoir le nez creux', b('to have shrewd foresight, guess right', 'avoir une intuition juste et avisée'), b('informal-standard, often past tense', 'courant-soutenu, souvent au passé')],
              ['voir plus loin que le bout de son nez', b('to think ahead / see the bigger picture', 'anticiper, dépasser l’intérêt immédiat'), b('often negative when criticising myopia', 'souvent négatif contre la myopie')],
              ['lire entre les lignes', b('to read between the lines, catch subtext', 'saisir l’implicite derrière les mots'), b('standard-formal, press & analysis', 'courant-soutenu, presse et analyse')],
              ['avoir du flair', b('to have a sharp instinct / nose for something', 'sentir d’instinct la bonne piste'), b('everyday-standard, hunting metaphor', 'courant, métaphore du chien de chasse')],
            ],
          },
          ex: [
            ['J’ai encore eu l’esprit de l’escalier : la réplique parfaite m’est venue dans le métro.', 'I had staircase wit again: the perfect retort came to me on the metro.'],
            ['Elle a eu le nez creux en refusant cette fusion dès le premier trimestre.', 'She showed great foresight by turning down that merger in the very first quarter.'],
            ['À lire entre les lignes du communiqué, le directeur prépare déjà son départ.', 'Reading between the lines of the press release, the director is already preparing to leave.'],
          ],
        },
      ),
      culture(
        b('Diderot and the staircase', 'Diderot et la naissance de « l’esprit de l’escalier »'),
        b(
          'Denis Diderot coined **l’esprit de l’escalier** in his *Paradoxe sur le comédien* (1773): stunned in a salon debate, the sensitive thinker only finds the crushing reply once he has left the drawing room and reached the bottom of the **staircase**. Notice the subtle pair **avoir le nez creux** (retrospective praise: *Tu as eu le nez creux !* — you picked right) versus **avoir du flair** (a lasting gift for spotting talent or danger before others do).',
          'C’est Denis Diderot qui forgea **l’esprit de l’escalier** dans le *Paradoxe sur le comédien* (1773) : décontenancé dans un salon, l’homme sensible ne trouve la riposte brillante qu’une fois arrivé au bas de l’**escalier**. Distinguez aussi **avoir le nez creux** (constat après coup d’un choix heureux : *Il a eu le nez creux !*) et **avoir du flair** (qualité durable pour sentir la bonne piste avant les autres).',
        ),
      ),
      flash(
        b('Wit & foresight', 'Esprit et clairvoyance'),
        [
          ['avoir l’esprit de l’escalier', b('to think of a clever reply too late', 'trouver la bonne réplique trop tard')],
          ['avoir le nez creux', b('to have shrewd foresight, pick right', 'deviner juste avant les autres')],
          ['voir plus loin que le bout de son nez', b('to see the bigger picture, look ahead', 'anticiper au-delà de l’immédiat')],
          ['lire entre les lignes', b('to read between the lines', 'déceler le sens caché d’un texte')],
          ['avoir du flair', b('to have a keen instinct / nose for things', 'sentir d’instinct la bonne piste')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('She thought of the ideal comeback only after leaving the room.', 'Elle n’a trouvé la répartie idéale qu’une fois la discussion terminée.'),
          b('She speaks loudly on the stairs before entering a meeting.', 'Elle répète ses arguments dans l’escalier avant d’entrer en séance.'),
          b('She always improvises sparkling replies right on the spot.', 'Elle réplique toujours du tac au tac sans jamais hésiter.'),
          b('She forgets the names of people she met upstairs.', 'Elle oublie vite les noms des personnes qu’elle vient de croiser.'),
        ],
        {
          fr: 'Camille a toujours l’esprit de l’escalier.',
          explain: b('L’esprit de l’escalier is specifically the delayed wit that arrives on the way out, too late to use.', 'L’esprit de l’escalier désigne précisément la répartie brillante qui vient après coup, trop tard.'),
        },
      ),
      mc(
        P.complete,
        [
          'voir plus loin que le bout de son nez',
          'avoir l’esprit de l’escalier',
          'lire entre les lignes',
          'perdre son flair',
        ],
        {
          fr: 'En sacrifiant la recherche pour des gains trimestriels, ce dirigeant refuse de ___ .',
          explain: b('Refusing to look beyond short-term gains is literally failing to see past the tip of one’s nose.', 'Refuser d’anticiper au-delà du court terme, c’est ne pas voir plus loin que le bout de son nez.'),
        },
      ),
      pairs(
        P.match,
        [
          ['avoir l’esprit de l’escalier', b('to think of a clever reply too late', 'trouver la bonne réplique trop tard')],
          ['avoir le nez creux', b('to have shrewd foresight, pick right', 'deviner juste avant les autres')],
          ['voir plus loin que le bout de son nez', b('to see the bigger picture, look ahead', 'anticiper au-delà de l’immédiat')],
          ['lire entre les lignes', b('to read between the lines', 'déceler le sens caché d’un texte')],
          ['avoir du flair', b('to have a keen instinct / nose for things', 'sentir d’instinct la bonne piste')],
        ],
      ),
      gap(
        P.complete,
        'Cette éditrice a eu le ___ creux en signant ce roman méconnu : elle sait lire entre les ___ et possède un ___ infaillible pour repérer les nouveaux talents.',
        ['nez', 'lignes', 'flair'],
        {
          choices: [
            ['nez', 'front', 'bras'],
            ['lignes', 'pages', 'marges'],
            ['flair', 'escalier', 'bout'],
          ],
          explain: b('avoir le nez creux (shrewd intuition), lire entre les lignes (catch subtext), avoir du flair (keen instinct).', 'avoir le nez creux (intuition juste), lire entre les lignes (saisir l’implicite), avoir du flair (instinct sûr).'),
        },
      ),
      hear(
        'Dans la lettre de démission, aucune plainte n’est écrite noir sur blanc, mais en lisant entre les lignes on devine un profond désaccord.',
        b('What does the speaker point out about the resignation letter?', 'Que souligne le locuteur à propos de la lettre de démission ?'),
        [
          b('A deep disagreement is implied beneath polite phrasing.', 'Un désaccord profond transparaît de façon implicite sous les mots.'),
          b('The author listed every complaint in bold ink.', 'L’auteur a détaillé chaque grief de manière explicite.'),
          b('Several lines were physically erased from the letter.', 'Plusieurs lignes ont été effacées du document.'),
        ],
        {
          voice: 'm',
          explain: b('Lire entre les lignes reveals unspoken meaning behind neutral or diplomatic phrasing.', 'Lire entre les lignes permet de déceler un message implicite sous une formulation neutre.'),
        },
      ),
      dict(
        'Ce journaliste a eu le nez creux et sait voir plus loin que le bout de son nez.',
        {
          voice: 'f',
          hint: b('Watch silent -z in nez and silent -t in bout.', 'Attention aux consonnes muettes de nez et bout.'),
        },
      ),
      say(
        'En lisant entre les lignes, on comprend qu’elle a eu du flair dès le début.',
        'Reading between the lines, you can tell she had a good instinct from the start.',
        { tip: b('Link en + lisant smoothly and mark a slight pause after lignes.', 'Liez en lisant avec fluidité et marquez une légère pause après lignes.') },
      ),
    ],
    [
      b('Avoir l’esprit de l’escalier = thinking of the witty reply once the conversation is over.', 'Avoir l’esprit de l’escalier = trouver la répartie brillante après coup.'),
      b('Avoir le nez creux (praised hindsight) and avoir du flair (keen instinct) capture sharp intuition.', 'Avoir le nez creux et avoir du flair expriment la sûreté de l’intuition.'),
      b('Voir plus loin que le bout de son nez = long-term vision; lire entre les lignes = decoding subtext.', 'Voir plus loin que le bout de son nez = voir large ; lire entre les lignes = saisir l’implicite.'),
    ],
    [
      ['avoir l’esprit de l’escalier', b('to think of a clever reply too late', 'trouver la bonne réplique trop tard')],
      ['avoir le nez creux', b('to have shrewd foresight, pick right', 'deviner juste avant les autres')],
      ['voir plus loin que le bout de son nez', b('to see the bigger picture, look ahead', 'anticiper au-delà de l’immédiat')],
      ['lire entre les lignes', b('to read between the lines', 'déceler le sens caché d’un texte')],
      ['avoir du flair', b('to have a keen instinct / nose for things', 'sentir d’instinct la bonne piste')],
    ],
  ),

  lesson(
    C,
    2,
    ['discernment-and-perspective', 'discernement-et-recul'],
    b('Discernment, perspective & lucidity', 'Discernement, recul et lucidité'),
    b('Separate fact from spin, weigh nuances calmly and show you are not easily taken in.', 'Démêler le vrai du faux, garder les idées claires et montrer qu’on ne vous trompe pas aisément.'),
    [
      b('Use faire la part des choses accurately without confusing it with taking sides', 'Employer faire la part des choses sans le confondre avec prendre parti'),
      b('Step back and clarify complex debates with prendre du recul and avoir les idées claires', 'Prendre du recul et avoir les idées claires face à un dossier complexe'),
      b('Signal worldly experience with ne pas être né de la dernière pluie', 'Exprimer sa lucidité avec ne pas être né de la dernière pluie'),
    ],
    13,
    [
      card(
        b('Keeping a cool, discerning eye', 'Garder l’esprit clair et le jugement sûr'),
        b(
          'Sound judgement in French relies on sorting, distancing and clarity: **prendre du recul** (stepping back like a painter viewing a canvas), **faire la part des choses** (weighing each element fairly rather than lumping everything together), **démêler le vrai du faux** (untangling fact from rumour), **avoir les idées claires** (thinking lucidly), and **ne pas être né de la dernière pluie** (having enough life experience not to be fooled).\nBalanced judgement: **faire la part des choses · prendre du recul · avoir les idées claires**.\nCritical lucidity: **démêler le vrai du faux · ne pas être né de la dernière pluie**.',
          'Le jugement sûr passe par la mise à distance et le tri : **prendre du recul** (s’éloigner pour voir l’ensemble), **faire la part des choses** (distinguer ce qui revient à chaque facteur sans tout confondre), **démêler le vrai du faux** (séparer faits et rumeurs), **avoir les idées claires** et **ne pas être né de la dernière pluie** (ne pas être naïf).\nJuste mesure : **faire la part des choses · prendre du recul · avoir les idées claires**.\nLucidité critique : **démêler le vrai du faux · ne pas être né de la dernière pluie**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Usage note', 'Remarque d’usage')],
            rows: [
              ['faire la part des choses', b('to keep things in perspective, weigh fairly', 'distinguer le juste du excessif, nuancer'), b('never means “take sides” (prendre parti)', 'ne signifie jamais « prendre parti »')],
              ['ne pas être né de la dernière pluie', b('not to have been born yesterday', 'avoir assez d’expérience pour ne pas être dupe'), b('agrees in gender/number: née, nés', 'accord en genre et nombre : née, nés')],
              ['avoir les idées claires', b('to think clearly, have a clear head', 'raisonner avec netteté et lucidité'), b('often contrasted with emotion or fatigue', 'opposé au trouble ou à l’émotion')],
              ['prendre du recul', b('to step back and gain perspective', 'prendre de la distance pour mieux juger'), b('takes par rapport à + noun', 'se construit avec par rapport à')],
              ['démêler le vrai du faux', b('to separate fact from fiction', 'distinguer l’exactitude de la rumeur'), b('common in journalism and inquiry', 'fréquent dans l’enquête et la presse')],
            ],
          },
          ex: [
            ['Entre rumeurs alarmistes et promesses hâtives, il devient urgent de démêler le vrai du faux.', 'Between alarmist rumours and hasty promises, it is urgent to separate fact from fiction.'],
            ['Inutile de lui servir ce prétexte : elle n’est pas née de la dernière pluie.', 'No point giving her that excuse: she wasn’t born yesterday.'],
            ['Une bonne nuit de sommeil m’a permis de prendre du recul et d’avoir les idées claires.', 'A good night’s sleep helped me step back and think clearly.'],
          ],
        },
      ),
      trap(
        b('Don’t confuse « faire la part des choses » with « prendre parti »', 'Ne confondez pas « faire la part des choses » et « prendre parti »'),
        b(
          '**Faire la part des choses** means *not* jumping to extremes — separating legitimate criticism from personal anger, or isolating each person’s share of responsibility. And watch **ne pas être né(e) de la dernière pluie**: it is almost exclusively negative (*Je ne suis pas né de la dernière pluie*), and **né** agrees with the subject (*Elles ne sont pas nées de la dernière pluie*).',
          '**Faire la part des choses** signifie nuancer et séparer ce qui est juste de ce qui est exagéré — jamais « choisir un camp » (**prendre parti**). De plus, **ne pas être né(e) de la dernière pluie** s’emploie presque toujours à la forme négative et s’accorde avec le sujet (*Elle n’est pas née de la dernière pluie*).',
        ),
      ),
      flash(
        b('Discernment & lucidity', 'Discernement et lucidité'),
        [
          ['faire la part des choses', b('to weigh things fairly, keep perspective', 'distinguer avec mesure chaque aspect')],
          ['ne pas être né de la dernière pluie', b('not to have been born yesterday', 'être trop avisé pour se laisser duper')],
          ['avoir les idées claires', b('to have a clear head, think straight', 'avoir l’esprit lucide et ordonné')],
          ['prendre du recul', b('to step back and gain perspective', 'prendre de la distance critique')],
          ['démêler le vrai du faux', b('to separate truth from falsehood', 'trier faits établis et rumeurs')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('He is experienced enough not to fall for an empty pitch.', 'Il a trop d’expérience pour se laisser bercer par de belles promesses.'),
          b('He prefers staying indoors whenever a storm breaks out.', 'Il évite de sortir dès qu’une averse menace.'),
          b('He remembers every rainy summer of his childhood.', 'Il se souvient de chaque été pluvieux de son enfance.'),
          b('He recently joined the company and knows little yet.', 'Il vient d’arriver dans l’équipe et manque encore de repères.'),
        ],
        {
          fr: 'Mon associé n’est pas né de la dernière pluie.',
          explain: b('Being born in an earlier rain means having plenty of real-world experience.', 'Ne pas être né de la dernière pluie exprime une solide expérience qui protège de la naïveté.'),
        },
      ),
      mc(
        P.best,
        [
          'Il convient de prendre du recul et de faire la part des choses avant de sanctionner qui que ce soit.',
          'Il faut prendre parti tout de suite et mélanger le vrai du faux.',
          'Comme nous avons les idées troubles, décidons sur-le-champ sans rien vérifier.',
          'Elle est née de la dernière pluie, donc personne ne peut la tromper.',
        ],
        {
          fr: 'Quel conseil exprime le mieux l’attitude juste face à une accusation confuse ?',
          explain: b('Stepping back (prendre du recul) and weighing elements fairly (faire la part des choses) show calm discernment.', 'Prendre du recul et faire la part des choses traduisent la retenue et le discernement.'),
        },
      ),
      sort(
        b('Distancing & nuance, or spotting deception?', 'Distance et mesure, ou lucidité face à la ruse ?'),
        [b('Distance, clarity & balance', 'Recul, clarté et juste mesure'), b('Resisting spin & falsehood', 'Lucidité face au faux')],
        [
          ['prendre du recul par rapport au conflit', 0],
          ['ne pas être né de la dernière pluie', 1],
          ['faire la part des choses avec calme', 0],
          ['démêler le vrai du faux dans un récit', 1],
          ['avoir les idées claires le matin', 0],
          ['refuser un argument trop beau pour être vrai', 1],
        ],
        { explain: b('Perspective idioms regulate our own judgement; lucidity idioms filter claims coming from outside.', 'Les expressions de recul régulent notre jugement ; celles de lucidité filtrent les récits extérieurs.') },
      ),
      gap(
        P.complete,
        'Avant de réagir à chaud, prenez du ___ pour faire la ___ des choses et démêler le ___ du faux.',
        ['recul', 'part', 'vrai'],
        {
          tr: 'Before reacting on the spot, step back to keep things in perspective and separate truth from falsehood.',
          hint: b('Three single nouns from this lesson: distance, share, truth.', 'Trois noms simples vus dans la leçon : distance, part, vérité.'),
          explain: b('prendre du recul (step back), faire la part des choses (weigh fairly), démêler le vrai du faux (separate truth from falsehood).', 'prendre du recul, faire la part des choses, démêler le vrai du faux.'),
        },
      ),
      ord(
        P.order,
        'Ma collègue n’est pas née de la dernière pluie.',
        {
          tr: 'My colleague wasn’t born yesterday.',
          extra: ['neige', 'né'],
          explain: b('Past participle née agrees with feminine singular subject Ma collègue.', 'Le participe passé née s’accorde au féminin singulier avec Ma collègue.'),
        },
      ),
      hear(
        'Sous le coup de l’émotion, on peine souvent à avoir les idées claires ; attendez demain pour répondre avec recul.',
        b('Why does the speaker advise waiting until tomorrow?', 'Pourquoi conseille-t-il d’attendre demain ?'),
        [
          b('Strong emotion clouds clear thinking and perspective.', 'L’émotion immédiate brouille la clarté d’esprit et le recul.'),
          b('The recipient only reads emails in the afternoon.', 'Le destinataire ne lit ses courriels que le lendemain après-midi.'),
          b('Tomorrow’s weather will make the commute easier.', 'Le temps de demain facilitera le trajet au bureau.'),
        ],
        {
          voice: 'f2',
          explain: b('Emotional heat obscures avoir les idées claires; waiting restores perspective.', 'L’émotion empêche d’avoir les idées claires ; attendre restaure le recul.'),
        },
      ),
      say(
        'Même dans l’urgence, il importe de prendre du recul et de démêler le vrai du faux.',
        'Even in an emergency, it matters to step back and separate fact from fiction.',
      ),
    ],
    [
      b('Faire la part des choses = weigh nuances fairly (never “take sides”).', 'Faire la part des choses = nuancer et répartir avec justesse (jamais « prendre parti »).'),
      b('Prendre du recul + avoir les idées claires = calm distance before deciding.', 'Prendre du recul + avoir les idées claires = distance calme avant de décider.'),
      b('Ne pas être né(e) de la dernière pluie agrees with the subject and stays negative.', 'Ne pas être né(e) de la dernière pluie s’accorde avec le sujet et reste négatif.'),
    ],
    [
      ['faire la part des choses', b('to weigh things fairly, keep perspective', 'distinguer avec mesure chaque aspect')],
      ['ne pas être né de la dernière pluie', b('not to have been born yesterday', 'être trop avisé pour se laisser duper')],
      ['avoir les idées claires', b('to have a clear head, think straight', 'avoir l’esprit lucide et ordonné')],
      ['prendre du recul', b('to step back and gain perspective', 'prendre de la distance critique')],
      ['démêler le vrai du faux', b('to separate truth from falsehood', 'trier faits établis et rumeurs')],
    ],
  ),

  lesson(
    C,
    3,
    ['temperament-and-resilience', 'caractere-et-sang-froid'],
    b('Temperament, grit & grace under pressure', 'Caractère, fermeté et sang-froid'),
    b('Stand your ground without losing poise and face setbacks with dignity.', 'Tenir bon sans perdre son calme et affronter les revers avec élégance.'),
    [
      b('Distinguish avoir du caractère from avoir mauvais caractère', 'Distinguer avoir du caractère et avoir mauvais caractère'),
      b('Use ne pas se démonter and tenir tête à quelqu’un cleanly', 'Employer ne pas se démonter et tenir tête à quelqu’un avec justesse'),
      b('Master the fixed syntax of faire contre mauvaise fortune bon cœur', 'Maîtriser la syntaxe figée de faire contre mauvaise fortune bon cœur'),
    ],
    13,
    [
      card(
        b('Strength of character in French idioms', 'La trempe du caractère en français'),
        b(
          'High-register French prizes composure as much as courage: **avoir du caractère** (having backbone and personality), **avoir la tête sur les épaules** (being level-headed and sensible), **ne pas se démonter** (keeping one’s nerve when challenged), **tenir tête à quelqu’un** (standing up to someone without backing down), and **faire contre mauvaise fortune bon cœur** (putting a brave face on bad luck).\nSteadiness & backbone: **avoir du caractère · avoir la tête sur les épaules**.\nCourage & grace: **ne pas se démonter · tenir tête à quelqu’un · faire contre mauvaise fortune bon cœur**.',
          'Le français valorise autant le sang-froid que l’audace : **avoir du caractère** (avoir de la personnalité et du ressort), **avoir la tête sur les épaules** (être posé et lucide), **ne pas se démonter** (ne pas perdre contenance face à une attaque), **tenir tête à quelqu’un** (résister fermement) et **faire contre mauvaise fortune bon cœur** (garder bonne figure face à un revers).\nAssise et solidité : **avoir du caractère · avoir la tête sur les épaules**.\nCourage et tenue : **ne pas se démonter · tenir tête à quelqu’un · faire contre mauvaise fortune bon cœur**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Grammar & tone', 'Grammaire et ton')],
            rows: [
              ['avoir du caractère', b('to have grit, strong personality', 'avoir de la fermeté, de l’allant'), b('positive; ≠ avoir mauvais caractère', 'positif ; ≠ avoir mauvais caractère')],
              ['ne pas se démonter', b('not to lose one’s nerve / get rattled', 'garder son aplomb face à l’imprévu'), b('almost always negative', 'presque toujours à la forme négative')],
              ['avoir la tête sur les épaules', b('to have a good head on one’s shoulders', 'être réfléchi, raisonnable et solide'), b('warm praise for maturity', 'éloge de la maturité')],
              ['faire contre mauvaise fortune bon cœur', b('to put a brave face on misfortune', 'garder bonne humeur face à l’adversité'), b('fixed archaic order, no articles', 'ordre figé archaïque, sans articles')],
              ['tenir tête à quelqu’un', b('to stand up to someone', 'résister fermement à une autorité'), b('indirect object à + person', 'complément indirect en à + personne')],
            ],
          },
          ex: [
            ['Malgré les interruptions du jury, la candidate ne s’est pas démontée.', 'Despite the panel’s interruptions, the candidate did not flinch.'],
            ['À vingt-cinq ans à peine, il a déjà la tête sur les épaules.', 'Barely twenty-five, he already has a remarkably level head on his shoulders.'],
            ['L’avion annulé, nous avons fait contre mauvaise fortune bon cœur en explorant la ville.', 'With the flight cancelled, we made the best of a bad situation by exploring the city.'],
          ],
        },
      ),
      tip(
        b('Watch « avoir du caractère » vs « avoir son caractère »', '« Avoir du caractère » vs « avoir son caractère »'),
        b(
          '**Avoir du caractère** is a compliment (backbone, strong individuality). **Avoir son petit caractère** or **avoir mauvais caractère** means being touchy or stubborn! Also note **faire contre mauvaise fortune bon cœur**: never insert articles (*la mauvaise fortune*) or flip the words—the classical inversion *contre + mauvaise fortune + bon cœur* is completely fixed.',
          '**Avoir du caractère** est élogieux (fermeté, personnalité). En revanche, **avoir son petit caractère** ou **avoir mauvais caractère** signifie être susceptible ou têtu. Enfin, dans **faire contre mauvaise fortune bon cœur**, ne rajoutez jamais d’article et ne changez pas l’ordre des groupes : la formule est figée.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('She stayed calm and refused to be intimidated by a harsh question.', 'Elle a gardé son aplomb face à une question déstabilisante.'),
          b('She disassembled her slides right before the presentation.', 'Elle a retiré toutes ses diapositives juste avant la séance.'),
          b('She apologised immediately and gave up her argument.', 'Elle s’est aussitôt excusée et a abandonné son point de vue.'),
          b('She lost her temper and walked out of the meeting room.', 'Elle s’est emportée et a quitté la salle de réunion.'),
        ],
        {
          fr: 'Face aux remarques acerbes, Nadia ne s’est pas démontée.',
          explain: b('Ne pas se démonter comes from losing one’s bearings/mechanisms; keeping them intact means keeping your cool.', 'Ne pas se démonter signifie ne pas se laisser impressionner ni déstabiliser.'),
        },
      ),
      pairs(
        P.match,
        [
          ['avoir du caractère', b('to have strong personality and grit', 'avoir de la personnalité et du ressort')],
          ['ne pas se démonter', b('not to get rattled, keep one’s nerve', 'garder son aplomb sous la pression')],
          ['avoir la tête sur les épaules', b('to be sensible and level-headed', 'être posé, réfléchi et fiable')],
          ['faire contre mauvaise fortune bon cœur', b('to put a brave face on bad luck', 'sourire et tenir bon malgré un revers')],
          ['tenir tête à quelqu’un', b('to stand up to someone firmly', 'résister sans céder devant quelqu’un')],
        ],
      ),
      hear(
        'Le directeur voulait imposer ce calendrier irréaliste, mais Thomas lui a tenu tête avec mesure et lui a démontré chiffres à l’appui qu’il fallait trois semaines de plus.',
        b('How did Thomas handle the director’s unrealistic timeline?', 'Comment Thomas a-t-il réagi face au calendrier irréaliste du directeur ?'),
        [
          b('He stood his ground calmly and backed his stance with numbers.', 'Il lui a résisté calmement en s’appuyant sur des chiffres précis.'),
          b('He accepted the timeline to avoid displeasing his boss.', 'Il a accepté le calendrier pour éviter tout conflit.'),
          b('He complained behind the director’s back to colleagues.', 'Il s’est plaint auprès de ses collègues sans rien dire au directeur.'),
        ],
        {
          voice: 'm2',
          explain: b('Tenir tête à quelqu’un means standing up firmly to someone in authority rather than yielding.', 'Tenir tête à quelqu’un signifie résister fermement sans céder.'),
        },
      ),
      dlg(
        b('After a tough steering committee', 'À la sortie d’un comité difficile'),
        b('Hélène and Samy discuss how their colleague Inès handled an unexpected budget cut.', 'Hélène et Samy commentent l’attitude d’Inès après une coupe budgétaire imprévue.'),
        [['Hélène', 'f'], ['Samy', 'm']],
        [
          [0, 'Tu as vu comme le vice-président a attaqué le projet d’Inès dès l’ouverture ?', 'Did you see how the VP attacked Inès’s project right at the start?'],
          [1, {
            options: [
              'Oui, mais elle ne s’est pas démontée une seule seconde : elle lui a tenu tête avec beaucoup de calme.',
              'Oui, elle a eu mauvais caractère et a cassé son dossier.',
              'Oui, elle a eu l’esprit de l’escalier dès les premiers mots.',
            ],
            explain: b('Standing firm calmly under attack is ne pas se démonter + tenir tête à quelqu’un.', 'Garder son sang-froid et répondre fermement correspond à ne pas se démonter et tenir tête.'),
          }],
          [0, 'C’est vrai qu’elle a la tête sur les épaules. Et pourtant, la réduction de crédit reste sévère.', 'True, she has a good head on her shoulders. Still, the budget cut remains severe.'],
          [1, {
            options: [
              'C’est là qu’on voit qu’elle a du caractère : elle fait contre mauvaise fortune bon cœur et cherche déjà des solutions.',
              'Elle n’est pas née de la dernière pluie, donc elle démissionne dès ce soir.',
              'Elle fait la part des choses en refusant de travailler sur le dossier.',
            ],
            explain: b('Accepting an unchangeable setback gracefully and moving forward is faire contre mauvaise fortune bon cœur.', 'Garder bonne contenance face à un revers et rebondir illustre faire contre mauvaise fortune bon cœur.'),
          }],
          [0, 'Avec une telle sérénité, elle finira par rallier tout le comité à sa méthode.', 'With that kind of poise, she will eventually win the whole committee over to her approach.'],
        ],
      ),
      dict(
        'Elle a la tête sur les épaules et fait contre mauvaise fortune bon cœur.',
        {
          voice: 'f',
          hint: b('Notice the fixed wording: contre mauvaise fortune bon cœur (no articles).', 'Attention à la formule figée sans article : contre mauvaise fortune bon cœur.'),
        },
      ),
      write(
        b('Portrait of composure under pressure', 'Portrait d’une réaction pleine de sang-froid'),
        b('In 80–140 words, describe a colleague, friend or public figure facing harsh criticism or an unexpected setback. Use at least four idioms from this course accurately.', 'En 80 à 140 mots, décrivez une collègue, un ami ou une personnalité face à une critique vive ou un revers imprévu. Employez avec justesse au moins quatre expressions de ce cours.'),
        80,
        140,
        [
          b('At least four idioms from the course used accurately', 'Au moins quatre expressions du cours employées avec justesse'),
          b('Clear distinction between lucidity/perspective and resilience', 'Articulation nette entre discernement et sang-froid'),
          b('Natural C1 transitions and register', 'Enchaînements et registre C1 naturels'),
        ],
        'Lors du dernier conseil, alors que plusieurs membres critiquaient vivement notre réforme, ma collègue Claire ne s’est pas démontée. Comme elle a la tête sur les épaules, elle a d’abord pris du recul pour faire la part des choses entre les craintes légitimes et les attaques gratuites. Loin de céder à l’agitation, elle a tenu tête au rapporteur en lisant entre les lignes de ses propres chiffres, prouvant ainsi qu’elle n’est pas née de la dernière pluie. Même lorsque le vote a réduit notre budget de moitié, Claire a fait contre mauvaise fortune bon cœur : dès le lendemain, elle proposait un calendrier réaliste qui a forcé le respect de toute l’équipe.',
        {
          phrases: ['prendre du recul', 'faire la part des choses', 'ne s’est pas démontée', 'faire contre mauvaise fortune bon cœur'],
          modelNote: b('Notice how the idioms weave smoothly into a coherent C1 narrative without feeling stacked.', 'Remarquez comment les expressions s’enchaînent dans un récit fluide sans paraître artificielles.'),
        },
      ),
    ],
    [
      b('Avoir du caractère = strong personality/grit (positive), unlike avoir mauvais caractère.', 'Avoir du caractère = force et personnalité (positif), à distinguer d’avoir mauvais caractère.'),
      b('Ne pas se démonter + tenir tête à quelqu’un = keep composure and stand firm.', 'Ne pas se démonter + tenir tête à quelqu’un = garder son aplomb et résister.'),
      b('Faire contre mauvaise fortune bon cœur is fixed (no articles, never invert the words).', 'Faire contre mauvaise fortune bon cœur est une formule figée sans articles.'),
    ],
    [
      ['avoir du caractère', b('to have grit, strong personality', 'avoir de la personnalité et du ressort')],
      ['ne pas se démonter', b('not to get rattled, keep one’s nerve', 'garder son aplomb sous la pression')],
      ['avoir la tête sur les épaules', b('to be sensible and level-headed', 'être posé, réfléchi et fiable')],
      ['faire contre mauvaise fortune bon cœur', b('to put a brave face on bad luck', 'sourire et tenir bon malgré un revers')],
      ['tenir tête à quelqu’un', b('to stand up to someone firmly', 'résister sans céder devant quelqu’un')],
    ],
  ),
];

export default lessons;
