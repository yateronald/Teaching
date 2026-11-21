import type { CourseAbout } from '../../types';
import { b, card, culture, gap, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A French CV and cover letter follow conventions that differ from English-speaking ones: the structure of the CV, the way to describe experience with action verbs, the « vous-moi-nous » structure of the lettre de motivation and its formal closing formulas. This course guides you through each part with model texts, so you can apply confidently in France, Belgium, Switzerland or Québec (where the CV is often called « curriculum vitæ » and photos are not expected).',
    'Un CV et une lettre de motivation en français suivent des conventions différentes de celles du monde anglophone : la structure du CV, la description des expériences avec des verbes d’action, la structure « vous-moi-nous » de la lettre de motivation et ses formules de politesse finales. Ce cours vous guide partie par partie avec des textes modèles, pour postuler avec assurance en France, en Belgique, en Suisse ou au Québec (où la photo n’est généralement pas attendue).',
  ),
  outcomes: [
    b('Structure a French CV', 'Structurer un CV à la française'),
    b('Describe experience with action verbs', 'Décrire ses expériences avec des verbes d’action'),
    b('Write a « vous-moi-nous » cover letter', 'Rédiger une lettre « vous-moi-nous »'),
    b('Use the right formal formulas', 'Employer les bonnes formules de politesse'),
  ],
};

const C = 'bz-cv-cover-letter';
export default [
  lesson(C, 1, ['the-french-cv', 'le-cv-a-la-francaise'],
    b('The French CV', 'Le CV à la française'),
    b('Organise your CV into the expected sections and describe experience with action verbs.', 'Organiser son CV selon les rubriques attendues et décrire ses expériences avec des verbes d’action.'),
    [b('Know the sections', 'Connaître les rubriques'), b('Use action verbs', 'Utiliser des verbes d’action'), b('Quantify results', 'Chiffrer ses résultats')],
    13,
    [
      card(b('CV sections', 'Les rubriques du CV'), b('**Titre du poste visé** · **Profil** (2–3 lines) · **Expérience professionnelle** (most recent first) · **Formation** · **Compétences** (langues, logiciels) · **Centres d’intérêt** (optional). One page for less than 10 years of experience. Action verbs in the infinitive or past: **Gérer, Encadrer, Concevoir, Développer, Négocier, Réduire, Augmenter** + figures: **Encadrement d’une équipe de 6 personnes ; hausse des ventes de 18 %.**', '**Titre du poste visé** · **Profil** (2 à 3 lignes) · **Expérience professionnelle** (la plus récente d’abord) · **Formation** · **Compétences** (langues, logiciels) · **Centres d’intérêt** (facultatif). Une page pour moins de 10 ans d’expérience. Verbes d’action à l’infinitif ou en nom : **Gérer, Encadrer, Concevoir, Développer, Négocier, Réduire, Augmenter** + chiffres : **Encadrement d’une équipe de 6 personnes ; hausse des ventes de 18 %.**')),
      culture(b('Country differences', 'Différences selon les pays'), b('**France**: a photo is optional and increasingly avoided; age and marital status are not required. **Québec and Canada**: **no photo, no age**, no marital status (to avoid discrimination). Everywhere: a clear title and a short profile at the top.', '**France** : la photo est facultative et de plus en plus évitée ; l’âge et la situation familiale ne sont pas requis. **Québec et Canada** : **pas de photo, pas d’âge**, pas de situation familiale (pour éviter la discrimination). Partout : un titre clair et un court profil en haut.'), { variant: 'culture' }),
      mc(P.best, ['Gestion d’un portefeuille de 40 clients ; augmentation du chiffre d’affaires de 15 % en un an.', 'J’ai fait des choses avec des clients.', 'Clients : oui.', 'J’étais très gentil avec les clients.'], { fr: 'Quelle ligne d’expérience est la plus efficace ?' }),
      sort(b('Which section?', 'Quelle rubrique ?'), [b('Expérience', 'Expérience'), b('Formation', 'Formation'), b('Compétences', 'Compétences')], [['Assistante commerciale, 2021–2024', 0], ['Master en gestion, 2020', 1], ['Anglais courant, espagnol B2', 2], ['Stage en logistique, 6 mois', 0], ['Baccalauréat scientifique', 1], ['Maîtrise d’Excel et de SAP', 2]]),
      pairs(P.match, [['le poste visé', b('the target position', 'emploi recherché')], ['le chiffre d’affaires', b('turnover, revenue', 'total des ventes')], ['encadrer', b('to manage, supervise', 'diriger une équipe')], ['les centres d’intérêt', b('interests, hobbies', 'loisirs')]]),
      say('Gestion d’une équipe de six personnes et augmentation des ventes de dix-huit pour cent.', 'Managed a team of six and increased sales by eighteen per cent.'),
    ],
    [
      b('Sections: titre, profil, expérience, formation, compétences.', 'Rubriques : titre, profil, expérience, formation, compétences.'),
      b('Action verbs + figures for each experience.', 'Verbes d’action + chiffres pour chaque expérience.'),
      b('Québec/Canada: no photo, no age.', 'Québec/Canada : pas de photo, pas d’âge.'),
    ],
    [['un portefeuille de clients', b('a client portfolio', 'ensemble de clients suivis')], ['concevoir', b('to design', 'créer')], ['un stage', b('an internship', 'période de formation en entreprise')]],
  ),
  lesson(C, 2, ['the-cover-letter-structure', 'la-structure-de-la-lettre'],
    b('The cover letter: vous, moi, nous', 'La lettre de motivation : vous, moi, nous'),
    b('Build your letter in three parts: the company, yourself, the future together.', 'Construire la lettre en trois parties : l’entreprise, vous-même, l’avenir ensemble.'),
    [b('Write the « vous » part', 'Rédiger la partie « vous »'), b('Write the « moi » part', 'Rédiger la partie « moi »'), b('Write the « nous » part', 'Rédiger la partie « nous »')],
    13,
    [
      card(b('Vous – moi – nous', 'Vous – moi – nous'), b('**Vous** (the company): show you know it: **Votre entreprise, reconnue pour…, se développe actuellement à l’international.** **Moi** (your profile): **Fort(e) de trois ans d’expérience en…, j’ai développé…** **Nous** (the collaboration): **Rejoindre votre équipe me permettrait de… tout en vous apportant…** Then the request for an interview.', '**Vous** (l’entreprise) : montrez que vous la connaissez : **Votre entreprise, reconnue pour…, se développe actuellement à l’international.** **Moi** (votre profil) : **Fort(e) de trois ans d’expérience en…, j’ai développé…** **Nous** (la collaboration) : **Rejoindre votre équipe me permettrait de… tout en vous apportant…** Puis la demande d’entretien.')),
      sort(b('Vous, moi or nous?', 'Vous, moi ou nous ?'), [b('vous', 'vous'), b('moi', 'moi'), b('nous', 'nous')], [['Votre société est reconnue pour la qualité de ses produits.', 0], ['Fort de cinq ans d’expérience en vente, …', 1], ['Ensemble, nous pourrions développer votre présence au Québec.', 2], ['Vous ouvrez un nouveau site à Lyon.', 0], ['J’ai encadré une équipe de huit personnes.', 1], ['Je serais heureux de contribuer à vos projets.', 2]]),
      mc(P.best, ['Votre agence, reconnue pour ses campagnes engagées, recherche un chargé de communication : ce poste correspond pleinement à mon projet.', 'Je cherche un travail, n’importe lequel.', 'Bonjour, j’ai vu votre annonce, voilà mon CV.', 'Je suis le meilleur candidat, embauchez-moi.'], { fr: 'Quelle phrase d’ouverture est la plus convaincante ?' }),
      gap(P.complete, '___ de trois ans d’expérience en logistique, j’ai ___ des compétences en gestion des stocks.', [['Fort', 'Forte'], 'développé']),
      ord(P.order, 'Rejoindre votre équipe me permettrait de mettre mes compétences à votre service.', { tr: 'Joining your team would allow me to put my skills at your service.' }),
      say('Fort de trois ans d’expérience en vente, je serais heureux de contribuer au développement de votre entreprise.', 'With three years of sales experience, I would be pleased to contribute to your company’s growth.'),
    ],
    [
      b('Vous: show you know the company.', 'Vous : montrez que vous connaissez l’entreprise.'),
      b('Moi: Fort(e) de…, j’ai développé…, with proof.', 'Moi : Fort(e) de…, j’ai développé…, avec preuves.'),
      b('Nous: what you will bring together.', 'Nous : ce que vous apporterez ensemble.'),
    ],
    [['reconnu', b('renowned', 'connu et apprécié')], ['un chargé de communication', b('a communications officer', 'responsable de la communication')], ['embaucher', b('to hire', 'recruter')]],
  ),
  lesson(C, 3, ['opening-and-closing-formulas', 'formules-d-ouverture-et-de-politesse'],
    b('Opening and closing formulas', 'Formules d’ouverture et de politesse'),
    b('Use the right greeting, the request for an interview and the formal closing.', 'Employer la bonne formule d’appel, la demande d’entretien et la formule de politesse finale.'),
    [b('Choose the greeting', 'Choisir la formule d’appel'), b('Ask for an interview', 'Demander un entretien'), b('Close formally', 'Conclure de façon soutenue')],
    13,
    [
      card(b('Formulas', 'Les formules'), b('Greeting: **Madame, Monsieur,** (unknown) · **Madame Dupont,** (known). Interview: **Je serais ravi(e) de vous exposer mes motivations lors d’un entretien.** Closing (France): **Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.** Simpler, increasingly accepted: **Je vous prie de recevoir mes cordiales salutations.** Québec: **Veuillez agréer mes salutations distinguées** or **Cordialement**.', 'Appel : **Madame, Monsieur,** (inconnu) · **Madame Dupont,** (connu). Entretien : **Je serais ravi(e) de vous exposer mes motivations lors d’un entretien.** Formule finale (France) : **Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.** Plus simple, de plus en plus admis : **Je vous prie de recevoir mes cordiales salutations.** Québec : **Veuillez agréer mes salutations distinguées** ou **Cordialement**.')),
      mc(P.best, ['Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.', 'Bisous, à bientôt !', 'Salut et merci !', 'Voilà, c’est tout.'], { fr: 'Formule finale d’une lettre de motivation en France :' }),
      mc(P.best, ['Je serais ravie de vous exposer mes motivations lors d’un entretien.', 'Appelez-moi vite.', 'J’attends votre réponse positive.', 'Je viendrai lundi pour l’entretien.'], { fr: 'Demande d’entretien :' }),
      write(b('Your cover letter', 'Votre lettre de motivation'), b('Write a complete cover letter (130–200 words) for a job you would like, with: greeting, vous / moi / nous paragraphs, interview request and formal closing.', 'Rédigez une lettre de motivation complète (130–200 mots) pour un poste qui vous intéresse, avec : formule d’appel, paragraphes vous / moi / nous, demande d’entretien et formule finale.'), 110, 200, [
        b('Greeting', 'Formule d’appel'),
        b('Vous / moi / nous paragraphs', 'Paragraphes vous / moi / nous'),
        b('Interview request and formal closing', 'Demande d’entretien et formule finale'),
      ], 'Madame, Monsieur,\n\nVotre entreprise, reconnue pour la qualité de son service client, ouvre une nouvelle boutique à Montréal et recherche un conseiller de vente. Ce poste correspond pleinement à mon projet professionnel.\n\nFort de trois ans d’expérience dans la vente de matériel sportif, j’ai développé un vrai sens de l’écoute et de bonnes connaissances techniques. Dans mon poste actuel, j’ai contribué à augmenter les ventes de 12 % en un an.\n\nRejoindre votre équipe me permettrait de mettre ces compétences au service de vos clients, tout en continuant à progresser dans un environnement dynamique.\n\nJe serais ravi de vous exposer mes motivations lors d’un entretien.\n\nJe vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.\n\nAntoine Mbaye', { phrases: ['Madame, Monsieur,', 'Fort de…', 'Rejoindre votre équipe me permettrait de…', 'Je vous prie d’agréer…'] }),
    ],
    [
      b('Greeting: Madame, Monsieur, / Madame [Nom],', 'Appel : Madame, Monsieur, / Madame [Nom],'),
      b('Interview: Je serais ravi(e) de vous exposer mes motivations…', 'Entretien : Je serais ravi(e) de vous exposer mes motivations…'),
      b('Closing: Je vous prie d’agréer… salutations distinguées.', 'Formule finale : Je vous prie d’agréer… salutations distinguées.'),
    ],
    [['agréer', b('to accept (formal)', 'accepter')], ['exposer', b('to set out, explain', 'présenter')], ['distingué', b('distinguished (formal)', 'formule respectueuse')]],
  ),
];
