import type { CourseAbout } from '../../types';
import { b, card, culture, doc, exam, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The TEFAQ (Test d’évaluation de français adapté au Québec) is used for Québec immigration applications. Its documents and situations reflect life in Québec: housing, work, services, culture and Québec French expressions. This course presents the test and its context, trains you to understand Québec accents and vocabulary in everyday situations, and prepares you to talk about your life project in Québec. Always check which tests and levels your immigration program requires on the official Québec government website.',
    'Le TEFAQ (Test d’évaluation de français adapté au Québec) sert aux demandes d’immigration au Québec. Ses documents et situations reflètent la vie au Québec : logement, travail, services, culture et expressions du français québécois. Ce cours présente l’examen et son contexte, vous entraîne à comprendre le vocabulaire québécois dans des situations du quotidien, et vous prépare à parler de votre projet de vie au Québec. Vérifiez toujours sur le site officiel du gouvernement du Québec quelles épreuves et quels niveaux votre programme exige.',
  ),
  outcomes: [
    b('Know the TEFAQ and its purpose', 'Connaître le TEFAQ et son usage'),
    b('Understand Québec everyday vocabulary', 'Comprendre le vocabulaire québécois du quotidien'),
    b('Handle Québec-life situations', 'Gérer des situations de la vie au Québec'),
    b('Present your project in Québec', 'Présenter son projet au Québec'),
  ],
};

const C = 'tefaq-quebec';
export default [
  lesson(C, 1, ['the-test-and-its-context', 'l-examen-et-son-contexte'],
    b('The test and its context', 'L’examen et son contexte'),
    b('Understand what the TEFAQ is, who requires it and how to check requirements.', 'Comprendre ce qu’est le TEFAQ, qui l’exige et comment vérifier les exigences.'),
    [b('Know the TEFAQ', 'Connaître le TEFAQ'), b('Know where to check requirements', 'Savoir où vérifier les exigences'), b('Recognise the Québec context', 'Reconnaître le contexte québécois')],
    13,
    [
      exam(b('The TEFAQ', 'Le TEFAQ'), b('A version of the TEF **adapted to Québec**, recognised by the **Ministère de l’Immigration, de la Francisation et de l’Intégration (MIFI)** for immigration programs. It has the same four skills as the TEF (listening, reading, writing, speaking); **the skills required and the minimum levels depend on your program** and can change. Always confirm on the **official Québec government website** before registering.', 'Une version du TEF **adaptée au Québec**, reconnue par le **ministère de l’Immigration, de la Francisation et de l’Intégration (MIFI)** pour les programmes d’immigration. Elle comporte les mêmes quatre compétences que le TEF (compréhension orale, écrite, expression écrite, orale) ; **les compétences exigées et les niveaux minimums dépendent de votre programme** et peuvent évoluer. Vérifiez toujours sur le **site officiel du gouvernement du Québec** avant de vous inscrire.')),
      culture(b('French in Québec', 'Le français au Québec'), b('French is the **official language** of Québec. You will hear Québec accents and expressions in the test documents, but also **standard French**. You don’t need to speak like a Québécois: you need to **understand** and to communicate clearly in **standard French**.', 'Le français est la **langue officielle** du Québec. Vous entendrez des accents et des expressions québécois dans les documents, mais aussi du **français standard**. Vous n’avez pas besoin de parler comme un Québécois : il faut **comprendre** et communiquer clairement en **français standard**.'), { variant: 'culture' }),
      mc(P.best, [b('Check on the official Québec government website which skills and levels are required', 'Vérifier sur le site officiel du gouvernement du Québec les compétences et niveaux exigés'), b('Take only the reading test', 'Ne passer que la compréhension écrite'), b('Ask a friend', 'Demander à un ami'), b('Choose any French test', 'Choisir n’importe quel test de français')], { fr: 'Avant de vous inscrire au TEFAQ, que faut-il faire ?' }),
      sort(b('Standard French or Québec usage?', 'Français standard ou usage québécois ?'), [b('more Québec', 'plutôt québécois'), b('standard / France', 'standard / France')], [['magasiner', 0], ['faire du shopping', 1], ['un char', 0], ['une voiture', 1], ['la fin de semaine', 0], ['le week-end', 1]]),
      pairs(P.match, [['magasiner', b('to go shopping (Québec)', 'faire les magasins')], ['la fin de semaine', b('the weekend (Québec)', 'samedi et dimanche')], ['un char', b('a car (Québec, informal)', 'une voiture')], ['un dépanneur', b('a corner shop (Québec)', 'petit magasin')]]),
    ],
    [
      b('TEFAQ: TEF adapted to Québec, used for Québec immigration (MIFI).', 'TEFAQ : TEF adapté au Québec, pour l’immigration au Québec (MIFI).'),
      b('Required skills and levels depend on your program: check officially.', 'Compétences et niveaux exigés selon votre programme : vérifiez officiellement.'),
      b('Understand Québec usage; speak clear standard French.', 'Comprenez l’usage québécois ; parlez un français standard clair.'),
    ],
    [['la francisation', b('French-language integration (Québec)', 'apprentissage du français')], ['exiger', b('to require', 'demander obligatoirement')], ['magasiner', b('to shop (Québec)', 'faire des achats')]],
  ),
  lesson(C, 2, ['quebec-everyday-situations', 'situations-du-quotidien-au-quebec'],
    b('Everyday situations in Québec', 'Situations du quotidien au Québec'),
    b('Understand Québec vocabulary in housing, shopping, weather and services.', 'Comprendre le vocabulaire québécois du logement, des achats, de la météo et des services.'),
    [b('Housing and moving', 'Logement et déménagement'), b('Weather and winter', 'Météo et hiver'), b('Services and shopping', 'Services et achats')],
    13,
    [
      card(b('Québec everyday words', 'Mots du quotidien au Québec'), b('Housing: **un 3 ½, un bail, le 1er juillet** (moving day), **chauffé / éclairé**. Winter: **la poudrerie** (blowing snow), **le déneigement**, **la gadoue / la slush**, **les pneus d’hiver**, **un banc de neige**. Services: **l’épicerie, le dépanneur, la SAQ** (liquor store), **une facture, un courriel, un cellulaire**. Expressions: **c’est correct** (it’s OK), **pas pire** (not bad), **avoir de la misère à** (to struggle to).', 'Logement : **un 3 ½, un bail, le 1er juillet** (jour du déménagement), **chauffé / éclairé**. Hiver : **la poudrerie**, **le déneigement**, **la gadoue / la slush**, **les pneus d’hiver**, **un banc de neige**. Services : **l’épicerie, le dépanneur, la SAQ**, **une facture, un courriel, un cellulaire**. Expressions : **c’est correct** (ça va), **pas pire** (pas mal), **avoir de la misère à** (avoir du mal à).')),
      hear('Attention, ce soir, avis de poudrerie sur l’autoroute 40. La visibilité sera réduite et les opérations de déneigement commenceront après minuit. Pensez à déplacer votre voiture.', b('What should residents do?', 'Que doivent faire les habitants ?'), [b('move their car for snow removal', 'déplacer leur voiture pour le déneigement'), b('take the motorway at midnight', 'prendre l’autoroute à minuit'), b('buy winter tyres today', 'acheter des pneus d’hiver aujourd’hui'), b('stay at work', 'rester au travail')], { voice: 'f' }),
      pairs(P.match, [['la poudrerie', b('blowing snow', 'neige soulevée par le vent')], ['c’est correct', b('it’s OK (Québec)', 'ça va')], ['pas pire', b('not bad (Québec)', 'pas mal')], ['avoir de la misère à', b('to struggle to (Québec)', 'avoir du mal à')]]),
      mc(P.meaning, [b('It was not bad (rather positive).', 'Ce n’était pas mal (plutôt positif).'), b('It was terrible.', 'C’était terrible.'), b('It was the worst.', 'C’était le pire.'), b('I don’t know.', 'Je ne sais pas.')], { fr: '— Pis, ton entrevue ? — Pas pire, je pense que ça s’est bien passé !' }),
      doc({ look: 'ad', title: b('Ad', 'Annonce'), text: '3 ½ à louer — Plateau Mont-Royal\n1 150 $/mois, chauffé, non éclairé\nLibre le 1er juillet\nBail d’un an — références exigées' }, b('What is NOT included in the rent?', 'Qu’est-ce qui n’est PAS compris dans le loyer ?'), [b('electricity', 'l’électricité'), b('heating', 'le chauffage'), b('the lease', 'le bail'), b('the references', 'les références')]),
    ],
    [
      b('Housing: 3 ½, bail, 1er juillet, chauffé/éclairé.', 'Logement : 3 ½, bail, 1er juillet, chauffé/éclairé.'),
      b('Winter: poudrerie, déneigement, pneus d’hiver.', 'Hiver : poudrerie, déneigement, pneus d’hiver.'),
      b('Expressions: c’est correct, pas pire, avoir de la misère à.', 'Expressions : c’est correct, pas pire, avoir de la misère à.'),
    ],
    [['le déneigement', b('snow removal', 'enlever la neige')], ['un banc de neige', b('a snowbank', 'tas de neige')], ['des références', b('references (rental)', 'recommandations')]],
  ),
  lesson(C, 3, ['your-quebec-project', 'votre-projet-au-quebec'],
    b('Presenting your project in Québec', 'Présenter son projet au Québec'),
    b('Talk and write about your plans to live and work in Québec.', 'Parler et écrire de son projet de vie et de travail au Québec.'),
    [b('Present your professional project', 'Présenter son projet professionnel'), b('Explain your motivations', 'Expliquer ses motivations'), b('Talk about integration', 'Parler de son intégration')],
    13,
    [
      card(b('Your project', 'Votre projet'), b('**Je souhaite m’établir à… parce que… · Mon domaine, …, est en pénurie de main-d’œuvre au Québec. · J’ai déjà commencé à… (suivre des cours de francisation, faire reconnaître mon diplôme). · Je compte m’impliquer dans… (bénévolat, association). · Ce qui m’attire, c’est…**', '**Je souhaite m’établir à… parce que… · Mon domaine, …, est en pénurie de main-d’œuvre au Québec. · J’ai déjà commencé à… (suivre des cours de francisation, faire reconnaître mon diplôme). · Je compte m’impliquer dans… (bénévolat, association). · Ce qui m’attire, c’est…**')),
      say('Je souhaite m’établir à Québec parce que mon domaine, les soins infirmiers, y est en pénurie de main-d’œuvre. J’ai déjà commencé les démarches pour faire reconnaître mon diplôme.', 'I want to settle in Québec City because my field, nursing, has a labour shortage there. I’ve already started the process to have my diploma recognised.'),
      sort(b('Motivation, preparation or integration?', 'Motivation, préparation ou intégration ?'), [b('motivation', 'motivation'), b('preparation', 'préparation'), b('integration', 'intégration')], [['Ce qui m’attire, c’est la qualité de vie.', 0], ['J’ai fait évaluer mon diplôme.', 1], ['Je compte faire du bénévolat.', 2], ['Mon métier y est très demandé.', 0], ['Je suis des cours de francisation.', 1], ['Je voudrais rejoindre une association de quartier.', 2]]),
      write(b('Your project', 'Votre projet'), b('Write a short text (80–120 words) presenting your project in Québec: why, your profession, what you have already done, how you plan to integrate.', 'Rédigez un court texte (80–120 mots) présentant votre projet au Québec : pourquoi, votre métier, ce que vous avez déjà fait, comment vous comptez vous intégrer.'), 80, 120, [
        b('Motivation', 'Motivation'),
        b('Profession and steps already taken', 'Métier et démarches déjà faites'),
        b('Integration plan', 'Projet d’intégration'),
      ], 'Je souhaite m’établir à Sherbrooke avec ma famille. Je suis technicienne en informatique, un domaine où les entreprises de la région peinent à recruter. Ce qui m’attire, c’est l’équilibre entre une ville à taille humaine et la proximité de la nature. J’ai déjà fait évaluer mon diplôme et je suis des cours de français en ligne depuis un an. Une fois sur place, je compte m’impliquer dans une association de quartier et inscrire mes enfants à des activités sportives pour qu’ils se fassent rapidement des amis.'),
    ],
    [
      b('Motivation: Ce qui m’attire, c’est…', 'Motivation : Ce qui m’attire, c’est…'),
      b('Preparation: diplôme reconnu, cours de francisation.', 'Préparation : diplôme reconnu, cours de francisation.'),
      b('Integration: bénévolat, association, activités.', 'Intégration : bénévolat, association, activités.'),
    ],
    [['s’établir', b('to settle', 's’installer')], ['une pénurie de main-d’œuvre', b('a labour shortage', 'manque de travailleurs')], ['s’impliquer', b('to get involved', 'participer activement')]],
  ),
];
