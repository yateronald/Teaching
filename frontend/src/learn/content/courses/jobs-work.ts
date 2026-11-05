import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'jobs-work-1',
    slug: { en: 'jobs-masculine-and-feminine', fr: 'les-metiers-masculin-et-feminin' },
    title: b('Jobs: masculine and feminine', 'Les métiers : masculin et féminin'),
    summary: b('Name common jobs and form the feminine: infirmier / infirmière, vendeur / vendeuse.', 'Nommer les métiers courants et former le féminin : infirmier / infirmière, vendeur / vendeuse.'),
    objectives: [b('Name twenty jobs', 'Nommer vingt métiers'), b('Form the feminine of job names', 'Former le féminin des noms de métiers'), b('Say your job without an article', 'Dire votre métier sans article')],
    minutes: 12,
    steps: [
      card(b('No article with être', 'Pas d’article avec être'), b('To say your job: **Je suis** + job, **without** un / une: Je suis **infirmière**. Il est **cuisinier**. But with c’est: **C’est un** bon médecin.', 'Pour dire votre métier : **Je suis** + métier, **sans** un / une : Je suis **infirmière**. Il est **cuisinier**. Mais avec c’est : **C’est un** bon médecin.'), {
        examples: [{ fr: 'Je suis infirmière à l’hôpital.', tr: 'I am a nurse at the hospital.' }, { fr: 'Mon mari est chauffeur de taxi.', tr: 'My husband is a taxi driver.' }, { fr: 'C’est une excellente avocate.', tr: 'She is an excellent lawyer.' }],
      }),
      card(b('The feminine of jobs', 'Le féminin des métiers'), b('**-ier → -ière**: infirmier / infirmière. **-eur → -euse**: vendeur / vendeuse, coiffeur / coiffeuse. **-teur → -trice**: directeur / directrice, acteur / actrice. **-ien → -ienne**: technicien / technicienne. Same form: un / une **dentiste**, **secrétaire**, **médecin**, **ingénieur(e)**.', '**-ier → -ière** : infirmier / infirmière. **-eur → -euse** : vendeur / vendeuse. **-teur → -trice** : directeur / directrice. **-ien → -ienne** : technicien / technicienne. Forme identique : un / une **dentiste**, **secrétaire**, **médecin**.'), { variant: 'tip' }),
      { kind: 'match', prompt: b('Match the masculine with the feminine.', 'Associez le masculin au féminin.'), pairs: [['un infirmier', 'une infirmière'], ['un vendeur', 'une vendeuse'], ['un directeur', 'une directrice'], ['un technicien', 'une technicienne'], ['un dentiste', 'une dentiste']] },
      pick('A1', b('Which sentence is correct?', 'Quelle phrase est correcte ?'), ['Elle est coiffeuse.', 'Elle est une coiffeuse.', 'Elle est coiffeur.', 'Elle a coiffeuse.']),
      pick('A1', b('Choose the feminine.', 'Choisissez le féminin.'), ['boulangère', 'boulangeuse', 'boulangrice', 'boulangerie'], { fr: 'Mon frère est boulanger, ma sœur est ___.' }),
      pick('A1', b('Choose the feminine.', 'Choisissez le féminin.'), ['actrice', 'acteuse', 'actrisse', 'acteure'], { fr: 'Il est acteur, elle est ___.' }),
      { kind: 'flashcards', title: b('Jobs', 'Les métiers'), cards: [{ fr: 'un cuisinier / une cuisinière', tr: 'cook' }, { fr: 'un enseignant / une enseignante', tr: 'teacher' }, { fr: 'un avocat / une avocate', tr: 'lawyer' }, { fr: 'un électricien / une électricienne', tr: 'electrician' }, { fr: 'un serveur / une serveuse', tr: 'waiter / waitress' }, { fr: 'un comptable / une comptable', tr: 'accountant' }] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je suis infirmière et mon mari est électricien.', tr: 'I am a nurse and my husband is an electrician.' },
    ],
    notes: {
      points: [
        b('Je suis + job, no article: je suis infirmière. C’est un / une + job + adjective.', 'Je suis + métier, sans article : je suis infirmière. C’est un / une + métier + adjectif.'),
        b('-ier → -ière, -eur → -euse, -teur → -trice, -ien → -ienne.', '-ier → -ière, -eur → -euse, -teur → -trice, -ien → -ienne.'),
        b('Same form for both: dentiste, secrétaire, comptable, médecin.', 'Forme identique : dentiste, secrétaire, comptable, médecin.'),
        b('In Canada, feminine forms are common: une ingénieure, une professeure.', 'Au Canada, le féminin est courant : une ingénieure, une professeure.'),
      ],
      vocab: [['le métier', b('job, trade', 'profession')], ['l’enseignant(e)', b('teacher', 'professeur')], ['le chauffeur', b('driver', 'conducteur')], ['le coiffeur', b('hairdresser', 'coupe les cheveux')]],
    },
  },
  {
    id: 'jobs-work-2',
    slug: { en: 'talking-about-your-work', fr: 'parler-de-son-travail' },
    title: b('Talking about your work', 'Parler de son travail'),
    summary: b('Say where you work, what you do, your hours and what you like about your job.', 'Dire où vous travaillez, ce que vous faites, vos horaires et ce que vous aimez dans votre travail.'),
    objectives: [b('Describe your workplace and tasks', 'Décrire votre lieu de travail et vos tâches'), b('Talk about your hours', 'Parler de vos horaires'), b('Give a simple opinion about your job', 'Donner un avis simple sur votre travail')],
    minutes: 13,
    steps: [
      card(b('Describing your job', 'Décrire votre travail'), b('**Je travaille dans** un hôpital / une entreprise / un restaurant. **Je travaille chez** + company name. **Je m’occupe de**… (I take care of). **Je travaille à temps plein / à temps partiel**, **de 9 h à 17 h**, **du lundi au vendredi**.', '**Je travaille dans** un hôpital / une entreprise / un restaurant. **Je travaille chez** + nom d’entreprise. **Je m’occupe de**… **Je travaille à temps plein / à temps partiel**, **de 9 h à 17 h**, **du lundi au vendredi**.'), {
        examples: [{ fr: 'Je travaille dans une banque, au service client.', tr: 'I work in a bank, in customer service.' }, { fr: 'Je m’occupe des commandes et des livraisons.', tr: 'I take care of orders and deliveries.' }, { fr: 'Je travaille à temps partiel, du lundi au jeudi.', tr: 'I work part-time, Monday to Thursday.' }],
      }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['dans', 'chez', 'à', 'en'], { fr: 'Je travaille ___ un restaurant italien.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['chez', 'dans', 'à la', 'en'], { fr: 'Elle travaille ___ Bombardier.' }),
      pick('A1', b('“À temps partiel” means…', '« À temps partiel » signifie…'), [b('part-time', 'quelques heures ou jours par semaine'), b('full-time', 'toute la semaine'), b('at night', 'la nuit'), b('from home', 'à la maison')]),
      { kind: 'match', prompt: b('Match each workplace with a job.', 'Associez chaque lieu à un métier.'), pairs: [['un hôpital', b('une infirmière', 'une infirmière')], ['une école', b('un enseignant', 'un enseignant')], ['un garage', b('un mécanicien', 'un mécanicien')], ['un restaurant', b('une cuisinière', 'une cuisinière')], ['un magasin', b('un vendeur', 'un vendeur')]] },
      card(b('Your opinion about your job', 'Votre avis sur votre travail'), b('**J’aime mon travail parce que**… c’est intéressant, mes collègues sont sympas, j’aide les gens. **Ce qui est difficile, c’est**… les horaires, le stress. **Mon rêve, c’est de devenir**…', '**J’aime mon travail parce que**… c’est intéressant, mes collègues sont sympas, j’aide les gens. **Ce qui est difficile, c’est**… les horaires, le stress. **Mon rêve, c’est de devenir**…'), { variant: 'tip' }),
      { kind: 'fill', prompt: b('Complete.', 'Complétez.'), text: 'Je travaille ___ lundi ___ vendredi, de 8 h à 16 h.', answers: [['du'], ['au']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'J’aime mon travail parce que mes collègues sont sympas et que j’aide les gens.', tr: 'I like my job because my colleagues are nice and I help people.' },
    ],
    notes: {
      points: [
        b('Travailler dans + place (un hôpital), chez + company (chez Desjardins).', 'Travailler dans + lieu (un hôpital), chez + entreprise (chez Desjardins).'),
        b('Hours: de 9 h à 17 h, du lundi au vendredi, à temps plein / partiel.', 'Horaires : de 9 h à 17 h, du lundi au vendredi, à temps plein / partiel.'),
        b('Tasks: je m’occupe de…, je suis responsable de…', 'Tâches : je m’occupe de…, je suis responsable de…'),
        b('Opinion: J’aime mon travail parce que… Ce qui est difficile, c’est…', 'Avis : J’aime mon travail parce que… Ce qui est difficile, c’est…'),
      ],
      vocab: [['l’entreprise (f.)', b('company', 'société')], ['le collègue', b('colleague', 'personne qui travaille avec vous')], ['la livraison', b('delivery', 'fait d’apporter une commande')], ['sympa', b('nice, friendly', 'agréable')], ['devenir', b('to become', 'commencer à être')]],
    },
  },
  {
    id: 'jobs-work-3',
    slug: { en: 'looking-for-a-job', fr: 'chercher-un-emploi' },
    title: b('Looking for a job', 'Chercher un emploi'),
    summary: b('Understand a job ad, present your experience simply and answer first interview questions.', 'Comprendre une offre d’emploi, présenter votre expérience simplement et répondre aux premières questions d’entrevue.'),
    objectives: [b('Understand the words of a job ad', 'Comprendre les mots d’une offre d’emploi'), b('Present your experience with the passé composé', 'Présenter votre expérience au passé composé'), b('Answer simple interview questions', 'Répondre à des questions d’entrevue simples')],
    minutes: 13,
    steps: [
      card(b('The words of job ads', 'Les mots des offres d’emploi'), b('**Poste** (position), **expérience exigée / souhaitée** (required / preferred), **salaire** / **taux horaire** (hourly rate), **horaire de jour / de soir**, **bilingue**, **envoyez votre CV**, **postuler** (to apply). In Québec, a job interview is **une entrevue**; in France, **un entretien**.', '**Poste**, **expérience exigée / souhaitée**, **salaire** / **taux horaire**, **horaire de jour / de soir**, **bilingue**, **envoyez votre CV**, **postuler**. Au Québec : **une entrevue** ; en France : **un entretien**.'), { variant: 'culture' }),
      { kind: 'mcq', prompt: b('Read the ad. What is required?', 'Lisez l’annonce. Qu’est-ce qui est exigé ?'), doc: { title: b('Job offer', 'Offre d’emploi'), text: 'Épicerie Fraîcheur cherche caissier ou caissière.\nTemps partiel, soirs et fins de semaine.\n17,50 $ de l’heure. Expérience non exigée. Bilingue (français-anglais) exigé.\nEnvoyez votre CV à emplois@fraicheur.ca' }, options: [b('Speaking French and English', 'Parler français et anglais'), b('Previous experience', 'De l’expérience'), b('Working full-time', 'Travailler à temps plein'), b('Working mornings', 'Travailler le matin')], answer: 0 },
      card(b('Your experience: the passé composé', 'Votre expérience : le passé composé'), b('**J’ai travaillé** comme vendeur pendant trois ans. **J’ai étudié** la comptabilité. **J’ai fait** un stage dans une banque. **Je parle** français, anglais et arabe.', '**J’ai travaillé** comme vendeur pendant trois ans. **J’ai étudié** la comptabilité. **J’ai fait** un stage dans une banque. **Je parle** français, anglais et arabe.'), {
        examples: [{ fr: 'J’ai travaillé comme serveuse pendant deux ans.', tr: 'I worked as a waitress for two years.' }, { fr: 'J’ai fait un stage dans une entreprise de transport.', tr: 'I did an internship in a transport company.' }],
      }),
      pick('A1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['ai travaillé', 'travaille', 'travaillé', 'suis travaillé'], { fr: 'J’___ comme cuisinier pendant cinq ans.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['comme', 'en', 'pour', 'de'], { fr: 'Je cherche un emploi ___ technicien.' }),
      { kind: 'dialogue', title: b('A job interview', 'Une entrevue d’embauche'), scene: b('Choose the candidate’s best reply.', 'Choisissez la meilleure réponse du candidat.'), speakers: [{ name: 'Recruteuse', voice: 'f2', side: 'l' }, { name: 'Candidat', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Parlez-moi de votre expérience.', tr: 'Tell me about your experience.' },
        { s: 1, choose: { options: ['J’ai travaillé comme caissier pendant deux ans dans un supermarché.', 'Je suis expérience.', 'Oui, j’aime.'], answer: 0 } },
        { s: 0, fr: 'Très bien. Vous êtes disponible le soir ?', tr: 'Very good. Are you available in the evenings?' },
        { s: 1, choose: { options: ['Oui, je suis disponible le soir et la fin de semaine.', 'Le soir, je dors.', 'Disponible quoi ?'], answer: 0 } },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'J’ai travaillé comme caissier pendant deux ans et je parle français et anglais.', tr: 'I worked as a cashier for two years and I speak French and English.' },
    ],
    notes: {
      points: [
        b('Job ad words: poste, exigé / souhaité, taux horaire, bilingue, postuler.', 'Mots des offres : poste, exigé / souhaité, taux horaire, bilingue, postuler.'),
        b('Experience: j’ai travaillé comme… pendant…; j’ai fait un stage.', 'Expérience : j’ai travaillé comme… pendant… ; j’ai fait un stage.'),
        b('Québec: une entrevue; France: un entretien d’embauche.', 'Québec : une entrevue ; France : un entretien d’embauche.'),
        b('Availability: Je suis disponible le soir / la fin de semaine.', 'Disponibilités : Je suis disponible le soir / la fin de semaine.'),
      ],
      vocab: [['le poste', b('position, job', 'emploi')], ['postuler', b('to apply', 'présenter sa candidature')], ['le stage', b('internship', 'période de formation en entreprise')], ['disponible', b('available', 'libre')], ['l’embauche (f.)', b('hiring', 'recrutement')]],
    },
  },
];

export default lessons;
