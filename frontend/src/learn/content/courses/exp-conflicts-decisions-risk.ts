import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Master the B2 idioms French speakers rely on when tensions rise, choices split the room or bold action is overdue. Learn to de-escalate disputes, name complex dilemmas accurately and articulate decisive solutions in conversation, debate and B2 writing.',
    'Maîtrisez les expressions de niveau B2 utilisées lorsque la tension monte, que les choix divisent ou qu’une décision s’impose. Apprenez à désamorcer un conflit, décrire un dilemme avec justesse et défendre une action résolue à l’oral comme à l’écrit.',
  ),
  outcomes: [
    b('Distinguish de-escalation idioms from expressions of escalation', 'Distinguer les expressions qui apaisent un conflit de celles qui l’enveniment'),
    b('Describe compromises, dilemmas and risky balancing acts accurately', 'Formuler compromis, dilemmes et prises de risque avec précision'),
    b('Express bold decisions and follow-through naturally in B2 speech and writing', 'Exprimer une prise de décision ferme avec naturel à l’oral et à l’écrit'),
  ],
};

const C = 'exp-conflicts-decisions-risk';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['easing-tension-vs-escalation', 'apaiser-ou-envenimer'],
    b('Easing Tension vs. Escalation', 'Apaiser les esprits ou jeter de l’huile sur le feu'),
    b('Contrast five essential idioms for moderating demands, clarifying boundaries, calming conflicts and worsening arguments.', 'Opposer cinq expressions clés pour modérer ses exigences, clarifier ses attentes, apaiser ou envenimer un conflit.'),
    [
      b('Tell calming idioms apart from escalation idioms', 'Distinguer les tournures d’apaisement et d’escalade'),
      b('Use mettre les points sur les i for firm clarity', 'Employer mettre les points sur les i pour recadrer fermement'),
      b('Recognise conflict-resolution idioms in spoken French', 'Reconnaître ces expressions dans des échanges oraux'),
    ],
    13,
    [
      card(
        b('Water, oil & clarifying boundaries', 'Eau, huile et mise au point'),
        b(
          'When disagreement erupts, French paints tension through vivid physical metaphors: diluting strong wine, pouring oil on flames, or dotting every *i* so nothing remains vague.\nDe-escalating: **mettre de l’eau dans son vin, apaiser les esprits, calmer le jeu**.\nFirm boundary vs. worsening: **mettre les points sur les i, jeter de l’huile sur le feu**.',
          'Face à un désaccord, le français recourt à des images concrètes : adoucir un vin trop fort, verser de l’huile sur la flamme ou pointer chaque *i* pour lever tout doute.\nApaisement : **mettre de l’eau dans son vin, apaiser les esprits, calmer le jeu**.\nMise au point ferme ou aggravation : **mettre les points sur les i, jeter de l’huile sur le feu**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Tone / Effect', 'Effet'), b('Meaning', 'Sens')],
            rows: [
              ['mettre de l’eau dans son vin', b('Conciliatory', 'Conciliant'), b('to tone down demands / compromise', 'modérer ses exigences, céder un peu')],
              ['jeter de l’huile sur le feu', b('Provocative', 'Aggravant'), b('to add fuel to the fire', 'envenimer un conflit déjà tendu')],
              ['mettre les points sur les i', b('Firm & clear', 'Ferme et net'), b('to set the record straight', 'clarifier fermement sans ambiguïté')],
              ['apaiser les esprits', b('Calming', 'Apaisant'), b('to calm tempers / soothe feelings', 'ramener le calme dans un groupe')],
              ['calmer le jeu', b('De-escalating', 'Modérateur'), b('to cool things down', 'faire baisser la tension')],
            ],
          },
          ex: [
            ['Après des négociations tendues, chacun a mis un peu d’eau dans son vin.', 'After tense talks, everyone softened their demands a little.'],
            ['Inutile de jeter de l’huile sur le feu avec des messages agressifs.', 'There’s no point adding fuel to the fire with aggressive messages.'],
            ['La directrice a réuni l’équipe pour mettre les points sur les i sur les horaires.', 'The director gathered the team to set things straight on the schedule.'],
          ],
        },
      ),
      tip(
        b('Small prepositions, big precision', 'Petites prépositions, grande précision'),
        b(
          'Keep the exact articles and prepositions fixed: **mettre de l’eau dans son vin** (always possessive *son/leur* vin), **jeter de l’huile sur le feu** (never *dans le feu*), and **mettre les points sur les i** (notice plural *les points*, plural *les i* with no *-s*).',
          'Respectez les articles et prépositions figés : **mettre de l’eau dans son vin** (toujours le possessif *son/leur* vin), **jeter de l’huile sur le feu** (jamais *dans le feu*) et **mettre les points sur les i** (*i* reste invariable, sans *-s*).',
        ),
      ),
      flash(
        b('Five conflict & tension idioms', 'Cinq expressions de tension et d’apaisement'),
        [
          ['mettre de l’eau dans son vin', b('to moderate one’s demands / compromise', 'modérer ses exigences, faire des concessions')],
          ['jeter de l’huile sur le feu', b('to add fuel to the fire', 'aggraver une situation déjà tendue')],
          ['mettre les points sur les i', b('to set things straight firmly', 'expliquer très clairement ses attentes')],
          ['apaiser les esprits', b('to calm tempers / ease tension', 'ramener le calme après une dispute')],
          ['calmer le jeu', b('to cool things down / defuse tension', 'faire retomber la pression ou la colère')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('Stop making a tense dispute even worse with sarcastic remarks.', 'Cesser d’aggraver une dispute avec des remarques piquantes.'),
          b('Pour cold water on a barbecue fire.', 'Éteindre un barbecue avec de l’eau froide.'),
          b('Explain the budget figures in greater detail.', 'Expliquer les chiffres du budget en détail.'),
          b('Agree immediately to every demand from the other side.', 'Accepter immédiatement toutes les demandes adverses.'),
        ],
        {
          fr: '« Arrête de répondre sur ce ton, tu ne fais que jeter de l’huile sur le feu ! »',
          explain: b('Jeter de l’huile sur le feu means deliberately or carelessly worsening an argument.', 'Jeter de l’huile sur le feu signifie envenimer une querelle déjà vive.'),
        },
      ),
      mc(
        P.best,
        [
          'Si personne ne veut mettre un peu d’eau dans son vin, l’accord restera bloqué.',
          'Si personne ne veut jeter de l’huile sur le feu, l’accord restera bloqué.',
          'Si personne ne veut apaiser les esprits, on va signer tout de suite.',
          'Si personne ne veut calmer le jeu, la paix est immédiate.',
        ],
        {
          fr: 'Deux voisins refusent tous les deux la moindre concession au sujet d’une clôture :',
          explain: b('Mettre de l’eau dans son vin means softening one’s stance to allow compromise.', 'Mettre de l’eau dans son vin signifie modérer ses exigences pour trouver un compromis.'),
        },
      ),
      pairs(
        P.match,
        [
          ['mettre de l’eau dans son vin', b('to soften one’s stance', 'modérer ses exigences')],
          ['jeter de l’huile sur le feu', b('to inflame the conflict', 'aggraver la querelle')],
          ['mettre les points sur les i', b('to lay down the law / clarify firmly', 'préciser fermement les règles')],
          ['apaiser les esprits', b('to soothe tempers', 'ramener le calme dans le groupe')],
          ['calmer le jeu', b('to cool things down', 'réduire la tension')],
        ],
      ),
      gap(
        P.complete,
        'Avant que la réunion ne dégénère, la médiatrice a essayé d’___ puis de ___ pour clarifier les responsabilités.',
        [['apaiser les esprits'], ['mettre les points sur les i']],
        {
          choices: [
            ['apaiser les esprits', 'jeter de l’huile sur le feu', 'tomber à l’eau'],
            ['mettre les points sur les i', 'mettre de l’eau dans son vin', 'jeter de l’huile'],
          ],
          explain: b('First soothe tempers (apaiser les esprits), then establish clear expectations (mettre les points sur les i).', 'D’abord ramener le calme (apaiser les esprits), puis clarifier fermement (mettre les points sur les i).'),
        },
      ),
      hear(
        'Au début, les deux syndicats campaient sur leurs positions, mais le médiateur a réussi à calmer le jeu en leur demandant de mettre de l’eau dans leur vin.',
        b('How did the mediator break the deadlock?', 'Comment le médiateur a-t-il débloqué la situation ?'),
        [
          b('He cooled tempers and urged both sides to soften their demands.', 'Il a fait baisser la tension et incité chacun à faire des concessions.'),
          b('He ended the meeting and called the press immediately.', 'Il a levé la séance et appelé la presse aussitôt.'),
          b('He accused one union of adding fuel to the fire.', 'Il a accusé un syndicat d’aggraver le conflit.'),
          b('He left the room without proposing any compromise.', 'Il a quitté la salle sans proposer de compromis.'),
        ],
      ),
      dict('Pour apaiser les esprits, chacun a mis un peu d’eau dans son vin sans jeter d’huile sur le feu.', {
        hint: b('Notice partitive d’huile after negative sans.', 'Attention au partitif d’huile après sans.'),
      }),
      say(
        'Inutile de jeter de l’huile sur le feu : mieux vaut calmer le jeu et mettre les points sur les i calmement.',
        'There’s no point adding fuel to the fire: better cool things down and clarify expectations calmly.',
      ),
    ],
    [
      b('De-escalate: mettre de l’eau dans son vin, apaiser les esprits, calmer le jeu.', 'Apaiser : mettre de l’eau dans son vin, apaiser les esprits, calmer le jeu.'),
      b('Escalate: jeter de l’huile sur le feu (always sur le feu, never dans).', 'Envenimer : jeter de l’huile sur le feu (toujours sur le feu).'),
      b('Clarify firmly: mettre les points sur les i (i stays invariable).', 'Recadrer : mettre les points sur les i (i reste invariable).'),
    ],
    [
      ['mettre de l’eau dans son vin', b('to tone down demands / compromise', 'modérer ses exigences, faire des concessions')],
      ['jeter de l’huile sur le feu', b('to add fuel to the fire', 'aggraver une situation tendue')],
      ['mettre les points sur les i', b('to set things straight firmly', 'clarifier fermement sans ambiguïté')],
      ['apaiser les esprits', b('to calm tempers', 'ramener le calme')],
      ['calmer le jeu', b('to cool things down', 'faire baisser la tension')],
    ],
  ),

  lesson(
    C,
    2,
    ['dilemmas-and-balancing-acts', 'dilemmes-et-equilibres'],
    b('Dilemmas, Compromises & Risky Choices', 'Dilemmes, compromis et jeux dangereux'),
    b('Express impossible choices, split-the-difference deals, awkward balancing acts and reckless risks accurately.', 'Exprimer choix impossibles, compromis équilibrés, acrobaties délicates et prises de risque périlleuses.'),
    [
      b('Distinguish fair compromise (couper la poire en deux) from awkward pleasing (ménager la chèvre et le chou)', 'Distinguer compromis équitable et équilibre impossible entre deux camps'),
      b('Describe double pressure and hesitation cleanly', 'Décrire une double pression et l’hésitation sur la conduite à tenir'),
      b('Sort balancing idioms from danger idioms', 'Classer les expressions d’équilibre et de danger'),
    ],
    13,
    [
      card(
        b('Navigating impossible choices', 'Naviguer entre deux contraintes'),
        b(
          'Life and leadership regularly trap people between competing demands. French contrasts the **pain of pressure**, the **art of compromise**, and the **danger of recklessness**.\nPressure & hesitation: **être entre le marteau et l’enclume, hésiter sur la marche à suivre**.\nCompromise & risk: **couper la poire en deux, ménager la chèvre et le chou, jouer avec le feu**.',
          'Au travail comme en société, on se retrouve souvent pris entre deux exigences contraires. Le français distingue la **pression subie**, l’**art du compromis** et le **danger de l’imprudence**.\nPression et doute : **être entre le marteau et l’enclume, hésiter sur la marche à suivre**.\nCompromis et risque : **couper la poire en deux, ménager la chèvre et le chou, jouer avec le feu**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Core image', 'Image'), b('Meaning', 'Sens')],
            rows: [
              ['être entre le marteau et l’enclume', b('hammer & anvil', 'marteau et enclume'), b('caught between two painful pressures', 'coincé entre deux camps exigeants')],
              ['couper la poire en deux', b('halving a pear', 'partager une poire'), b('to split the difference', 'trouver un compromis équitable')],
              ['jouer avec le feu', b('playing with fire', 'jouer avec la flamme'), b('to play with fire / take reckless risk', 'prendre un risque très imprudent')],
              ['ménager la chèvre et le chou', b('goat & cabbage riddle', 'énigme de la chèvre'), b('to please two incompatible sides', 'satisfaire deux intérêts opposés')],
              ['hésiter sur la marche à suivre', b('hesitating over next steps', 'douter de la procédure'), b('to be unsure how to proceed', 'ne pas savoir quelle voie choisir')],
            ],
          },
          ex: [
            ['La cheffe de projet est entre le marteau et l’enclume face au client et à son équipe.', 'The project lead is caught between a rock and a hard place between client and team.'],
            ['Ni 100 € ni 200 € : coupons la poire en deux à 150 €.', 'Neither €100 nor €200: let’s split the difference at €150.'],
            ['En repoussant cet audit de sécurité, l’usine joue vraiment avec le feu.', 'By delaying that safety audit, the factory is truly playing with fire.'],
          ],
        },
      ),
      trap(
        b('Do not confuse compromise with trying to please everyone', 'Ne confondez pas compromis net et ménagement ambigu'),
        b(
          '**Couper la poire en deux** means settling fairly in the middle (positive, concrete, e.g. price, deadline, chores). **Ménager la chèvre et le chou** often carries mild irony: trying delicately—and sometimes awkwardly—not to upset two rival parties whose interests clash. Also avoid English calques like *entre le rocher et l’endroit dur*: always say **entre le marteau et l’enclume**.',
          '**Couper la poire en deux** désigne un accord clair à mi-chemin (prix, délai, partage). **Ménager la chèvre et le chou** comporte souvent une nuance ironique : chercher à ne froisser aucun de deux camps opposés. Évitez aussi le calque anglais : dites toujours **être entre le marteau et l’enclume**.',
        ),
      ),
      flash(
        b('Five dilemma & risk idioms', 'Cinq expressions de dilemme et de risque'),
        [
          ['être entre le marteau et l’enclume', b('caught between a rock and a hard place', 'coincé entre deux pressions opposées')],
          ['couper la poire en deux', b('to split the difference / meet halfway', 'partager l’effort ou la somme à moitié')],
          ['jouer avec le feu', b('to play with fire / court danger', 'prendre un risque grave et imprudent')],
          ['ménager la chèvre et le chou', b('to keep both incompatible sides happy', 'ménager deux parties aux intérêts contraires')],
          ['hésiter sur la marche à suivre', b('to hesitate on how to proceed', 'douter de la décision ou méthode à adopter')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('She is trying carefully not to offend either of two rival groups.', 'Elle essaie prudemment de ne froisser aucun des deux groupes rivaux.'),
          b('She decided to quit farming and move to the city.', 'Elle a décidé de quitter la ferme pour la ville.'),
          b('She immediately sided with the loudest colleague.', 'Elle a aussitôt pris parti pour le collègue le plus bruyant.'),
          b('She refused to attend the meeting altogether.', 'Elle a carrément refusé d’assister à la réunion.'),
        ],
        {
          fr: '« Dans cette réorganisation, la maire essaie de ménager la chèvre et le chou entre commerçants et cyclistes. »',
          explain: b('Ménager la chèvre et le chou refers to trying to satisfy two conflicting interests at once.', 'Ménager la chèvre et le chou signifie chercher à contenter deux intérêts opposés.'),
        },
      ),
      mc(
        P.best,
        [
          'Tu veux partir à 7 h et moi à 9 h : coupons la poire en deux et partons à 8 h.',
          'Tu veux partir à 7 h et moi à 9 h : jouons avec le feu et partons à midi.',
          'Tu veux partir à 7 h et moi à 9 h : mettons les points sur les i à 6 h.',
          'Tu veux partir à 7 h et moi à 9 h : soyons entre le marteau et l’enclume.',
        ],
        {
          fr: 'Vous proposez un compromis simple et équitable sur l’heure de départ :',
          explain: b('Couper la poire en deux fits splitting a difference neatly right in the middle.', 'Couper la poire en deux convient parfaitement à un partage équitable à mi-chemin.'),
        },
      ),
      sort(
        b('Sort each idiom by what it mainly expresses.', 'Classez chaque expression selon son idée dominante.'),
        [b('Compromise or delicate balance', 'Compromis ou équilibre délicat'), b('Pressure, doubt or danger', 'Pression, doute ou danger')],
        [
          ['couper la poire en deux', 0],
          ['jouer avec le feu', 1],
          ['ménager la chèvre et le chou', 0],
          ['être entre le marteau et l’enclume', 1],
          ['mettre de l’eau dans son vin', 0],
          ['hésiter sur la marche à suivre', 1],
        ],
      ),
      gap(
        P.complete,
        'Pour débloquer la négociation sur les horaires, nous avons coupé la ___ en deux, même s’il reste ardu de ménager la ___ et le chou.',
        ['poire', 'chèvre'],
        {
          tr: 'To unblock the talks on working hours, we split the difference, even if it stays hard to please both sides.',
          hint: b('Two single nouns completing the fruit & animal idioms.', 'Deux noms simples complétant les expressions de compromis et d’équilibre.'),
        },
      ),
      ord(
        P.order,
        'En ignorant cet avertissement, il joue vraiment avec le feu.',
        {
          tr: 'By ignoring this warning, he is truly playing with fire.',
          extra: ['jouent', 'vin'],
          explain: b('Singular subject il takes plays = joue, followed by vraiment avec le feu.', 'Le sujet singulier il entraîne joue, suivi de vraiment avec le feu.'),
        },
      ),
      hear(
        'Franchement, je suis entre le marteau et l’enclume : si je valide ce contrat, l’équipe technique proteste, mais si je refuse, le client part ailleurs. J’hésite encore sur la marche à suivre.',
        b('Why is the speaker hesitating?', 'Pourquoi le locuteur hésite-t-il ?'),
        [
          b('Either choice upsets either his technical team or his client.', 'Chaque option mécontente soit son équipe technique, soit son client.'),
          b('He forgot where the meeting contract was stored.', 'Il a oublié où le contrat avait été rangé.'),
          b('Both the client and the team already agreed to split the price.', 'Client et équipe se sont déjà mis d’accord sur le prix.'),
          b('He wants to take a long holiday before signing anything.', 'Il veut partir en congé avant de signer quoi que ce soit.'),
        ],
        { voice: 'm' },
      ),
      say(
        'Je suis entre le marteau et l’enclume, mais je refuse de jouer avec le feu sur la sécurité.',
        'I’m caught between a rock and a hard place, yet I refuse to play with fire on safety.',
      ),
    ],
    [
      b('entre le marteau et l’enclume = caught between two painful pressures.', 'entre le marteau et l’enclume = coincé entre deux contraintes opposées.'),
      b('couper la poire en deux = fair midpoint; ménager la chèvre et le chou = please rival sides.', 'couper la poire en deux = compromis médian ; ménager la chèvre et le chou = concilier deux camps opposés.'),
      b('jouer avec le feu = take a reckless risk; hésiter sur la marche à suivre = be unsure how to act.', 'jouer avec le feu = prendre un grave risque ; hésiter sur la marche à suivre = douter de la voie à prendre.'),
    ],
    [
      ['être entre le marteau et l’enclume', b('caught between a rock and a hard place', 'coincé entre deux pressions contraires')],
      ['couper la poire en deux', b('to split the difference', 'trouver un compromis à mi-chemin')],
      ['jouer avec le feu', b('to play with fire', 'prendre un risque très dangereux')],
      ['ménager la chèvre et le chou', b('to keep two rival sides happy', 'ménager deux intérêts incompatibles')],
      ['hésiter sur la marche à suivre', b('to be unsure how to proceed', 'ne pas savoir quelle conduite adopter')],
    ],
  ),

  lesson(
    C,
    3,
    ['bold-action-and-resolve', 'decision-ferme-et-audace'],
    b('Bold Action & Decisive Resolve', 'Prendre le taureau par les cornes'),
    b('Commit firmly, make tough cuts, take the plunge and follow through on convictions in professional and civic life.', 'Affronter les problèmes de front, trancher sans détour, oser se lancer et défendre ses convictions jusqu’au bout.'),
    [
      b('Use five idioms of courage and decisive action accurately', 'Employer cinq expressions de décision ferme et d’audace'),
      b('Choose decisive idioms in realistic leadership dialogues', 'Choisir la tournure juste dans un dialogue de décision'),
      b('Write a B2 reflection on resolving a dilemma with resolve', 'Rédiger un récit argumenté B2 sur la résolution d’un dilemme'),
    ],
    13,
    [
      card(
        b('From hesitation to decisive action', 'De l’hésitation à l’action résolue'),
        b(
          'Once a dilemma is weighed, French offers strong, standard idioms for stepping up, making hard choices and seeing an idea through—expressions valued in both boardrooms and B2 exams.\nConfront & cut: **prendre le taureau par les cornes, trancher dans le vif**.\nLeap & persist: **se jeter à l’eau, prendre son courage à deux mains, aller au bout de ses idées**.',
          'Une fois le dilemme analysé, le français dispose d’expressions fortes et soutenues pour agir sans détour, décider avec fermeté et persévérer.\nAffronter et trancher : **prendre le taureau par les cornes, trancher dans le vif**.\nOser et tenir bon : **se jeter à l’eau, prendre son courage à deux mains, aller au bout de ses idées**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Nuance', 'Nuance'), b('Meaning', 'Sens')],
            rows: [
              ['prendre le taureau par les cornes', b('Direct confrontation', 'Affrontement direct'), b('to take the bull by the horns', 'attaquer une difficulté de front')],
              ['trancher dans le vif', b('Tough, decisive cut', 'Décision radicale'), b('to make incisive cuts / decide boldly', 'régler fermement sans demi-mesure')],
              ['se jeter à l’eau', b('Overcoming hesitation', 'Franchir le pas'), b('to take the plunge', 'oser commencer après avoir hésité')],
              ['prendre son courage à deux mains', b('Summoning bravery', 'Rassembler son audace'), b('to pluck up one’s courage', 'surmonter sa peur pour agir')],
              ['aller au bout de ses idées', b('Following through', 'Persévérance'), b('to see one’s ideas through', 'mener ses projets à terme')],
            ],
          },
          ex: [
            ['Plutôt que de reporter la réforme, le maire a pris le taureau par les cornes.', 'Rather than postponing the reform, the mayor took the bull by the horns.'],
            ['Après des mois d’hésitation, Nadia a pris son courage à deux mains et s’est jetée à l’eau.', 'After months of hesitation, Nadia plucked up her courage and took the plunge.'],
            ['Il faut savoir trancher dans le vif quand un projet dérive budgétairement.', 'You have to make tough cuts when a project goes over budget.'],
          ],
        },
      ),
      culture(
        b('Strong metaphors in French public & exam discourse', 'Des métaphores valorisées au B2 et en débat'),
        b(
          'Unlike street slang, idioms such as **prendre le taureau par les cornes**, **trancher dans le vif**, and **aller au bout de ses idées** belong to educated standard French. You hear them regularly in radio interviews, editorials, and DELF B2/TCF Task 3 oral defences when praising decisive leadership or defending a bold reform.',
          'Contrairement au registre familier, **prendre le taureau par les cornes**, **trancher dans le vif** ou **aller au bout de ses idées** relèvent d’un français courant à soutenu. On les entend dans la presse, les débats et les exposés DELF B2 ou TCF pour saluer une décision courageuse.',
        ),
      ),
      mc(
        P.best,
        [
          'Après des mois d’économies, elle a enfin pris son courage à deux mains et s’est jetée à l’eau en ouvrant son atelier.',
          'Après des mois d’économies, elle a jeté de l’huile sur le feu en ouvrant son atelier.',
          'Après des mois d’économies, elle a coupé la poire en deux dans l’océan.',
          'Après des mois d’économies, elle est restée entre le marteau et l’enclume.',
        ],
        {
          fr: 'Une amie hésitait longtemps avant de lancer son propre atelier de céramique, puis elle ose enfin :',
          explain: b('Prendre son courage à deux mains + se jeter à l’eau captures summoning courage to take a big step.', 'Prendre son courage à deux mains puis se jeter à l’eau exprime l’élan décisif après l’hésitation.'),
        },
      ),
      pairs(
        P.match,
        [
          ['prendre le taureau par les cornes', b('to tackle a problem head-on', 'affronter une difficulté directement')],
          ['trancher dans le vif', b('to make bold, decisive cuts', 'décider fermement sans demi-mesure')],
          ['se jeter à l’eau', b('to take the plunge', 'oser se lancer après hésitation')],
          ['prendre son courage à deux mains', b('to pluck up one’s courage', 'rassembler sa détermination pour agir')],
          ['aller au bout de ses idées', b('to follow through to the end', 'concrétiser ses convictions jusqu’au bout')],
        ],
      ),
      hear(
        'Le comité traînait depuis six mois sur les dépenses inutiles ; la nouvelle directrice a tranché dans le vif dès sa première semaine et supprimé trois doublons.',
        b('What did the new director do in her first week?', 'Qu’a fait la nouvelle directrice dès sa première semaine ?'),
        [
          b('She made bold, immediate cuts to eliminate three overlapping costs.', 'Elle a pris une décision radicale en supprimant trois dépenses redondantes.'),
          b('She hesitated for six more months before reviewing the budget.', 'Elle a encore hésité six mois avant d’examiner le budget.'),
          b('She tried to satisfy every department without changing anything.', 'Elle a cherché à ménager tout le monde sans rien modifier.'),
          b('She postponed all decisions until the next annual audit.', 'Elle a reporté toute décision au prochain bilan annuel.'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Deciding before Monday’s deadline', 'Trancher avant l’échéance de lundi'),
        b('Two association co-presidents decide how to respond to a persistent budget shortfall.', 'Deux coprésidents d’association décident comment réagir face à un déficit persistant.'),
        [['Claire', 'f'], ['Mehdi', 'm']],
        [
          [0, 'On reporte la discussion depuis trois réunions, mais les comptes ne s’équilibreront pas tout seuls.', 'We’ve been putting off this discussion for three meetings, yet the budget won’t balance itself.'],
          [1, {
            options: [
              'Tu as raison : il faut prendre le taureau par les cornes ce matin et arrêter d’hésiter sur la marche à suivre.',
              'Mieux vaut jeter de l’huile sur le feu et accuser les bénévoles.',
              'Si on jouait avec le feu en attendant l’an prochain ?',
            ],
            explain: b('Prendre le taureau par les cornes signals confronting the financial problem directly.', 'Prendre le taureau par les cornes signifie attaquer le problème budgétaire de front.'),
          }],
          [0, 'Le souci, c’est que deux activités coûtent cher alors qu’elles attirent peu de monde.', 'The issue is that two activities cost a lot while drawing very few people.'],
          [1, {
            options: [
              'Alors tranchons dans le vif : suspendons-les dès ce trimestre pour préserver nos ateliers gratuits.',
              'Ménageons la chèvre et le chou en doublant tous les tarifs sans prévenir.',
              'Mettons simplement un peu d’eau dans le vin sans rien changer au budget.',
            ],
          }],
          [0, 'Courageux, mais lucide. Allons au bout de nos idées et expliquons ce choix clairement à l’assemblée.', 'Brave yet clear-headed. Let’s follow through and explain this choice clearly to the assembly.'],
        ],
      ),
      dict('Elle a pris son courage à deux mains pour trancher dans le vif et aller au bout de ses idées.', {
        voice: 'm2',
        hint: b('Watch two past-participle forms: pris and aller (infinitive after pour).', 'Attention à pris (féminin ici invariable devant COD après avoir) et à l’infinitif aller.'),
      }),
      write(
        b('From dilemma to decisive action', 'Du dilemme à la décision ferme'),
        b('Write 60–110 words describing a difficult choice in a team, school or community project: outline the tension or dilemma, explain whether anyone had to compromise, and show how someone finally took decisive action using at least three idioms from this course.', 'Rédigez 60 à 110 mots décrivant un choix difficile dans un projet d’équipe ou associatif : exposez la tension, précisez s’il a fallu un compromis et montrez comment une décision ferme a débloqué la situation avec au moins trois expressions du cours.'),
        60,
        110,
        [
          b('Clear description of the tension or dilemma', 'Exposé clair de la tension ou du dilemme'),
          b('At least three idioms from this course used accurately', 'Au moins trois expressions du cours employées avec justesse'),
          b('Logical progression from hesitation to resolution', 'Progression nette de l’hésitation à la résolution'),
        ],
        'Lors de notre festival de quartier, le comité était entre le marteau et l’enclume entre des riverains inquiets du bruit et des artistes réclamant une scène tardive. Au début, certains jetaient de l’huile sur le feu sur les réseaux, et l’on hésitait sur la marche à suivre. Finalement, la présidente a pris le taureau par les cornes : elle a réuni tout le monde pour couper la poire en deux sur l’horaire et calmer le jeu durablement.',
        {
          phrases: ['entre le marteau et l’enclume', 'hésiter sur la marche à suivre', 'prendre le taureau par les cornes', 'couper la poire en deux'],
        },
      ),
    ],
    [
      b('prendre le taureau par les cornes = confront directly; trancher dans le vif = cut/decide decisively.', 'prendre le taureau par les cornes = affronter de front ; trancher dans le vif = décider radicalement.'),
      b('se jeter à l’eau = take the plunge; prendre son courage à deux mains = pluck up courage.', 'se jeter à l’eau = oser se lancer ; prendre son courage à deux mains = rassembler son courage.'),
      b('aller au bout de ses idées = follow through on convictions; all are ideal for B2 speaking and writing.', 'aller au bout de ses idées = mener ses projets à terme, adapté aux oraux et écrits B2.'),
    ],
    [
      ['prendre le taureau par les cornes', b('to take the bull by the horns', 'affronter un problème directement')],
      ['trancher dans le vif', b('to make bold, incisive cuts', 'prendre une décision nette et ferme')],
      ['se jeter à l’eau', b('to take the plunge', 'oser commencer après hésitation')],
      ['prendre son courage à deux mains', b('to pluck up one’s courage', 'surmonter sa peur pour agir')],
      ['aller au bout de ses idées', b('to see one’s ideas through', 'mener ses projets jusqu’à leur terme')],
    ],
  ),
];

export default lessons;
