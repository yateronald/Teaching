// B1 · Article. What public libraries offer today, especially to newcomers:
// reading an article (title, lead, one idea per paragraph) and logical
// connectors (d’abord, ensuite, cependant, donc).
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'les-bibliotheques-bien-plus-que-des-livres',
  warmup: b(
    'Apart from borrowing books, what can you do in a library? Note three ideas, then check them in the article.',
    'À part emprunter des livres, que peut-on faire dans une bibliothèque ? Notez trois idées, puis vérifiez dans l’article.',
  ),
  paras: [
    { lead: true, s: [
      ['Emprunter des livres ?', 'Borrowing books?'],
      ['Oui, mais pas seulement.', 'Yes, but not only that.'],
      ['Au Québec comme en France, les bibliothèques publiques sont devenues de véritables lieux de vie, ouverts à tous et le plus souvent gratuits.', 'In Québec as in France, public libraries have become real community spaces, open to everyone and usually free.'],
    ] },
    { s: [
      ['Il y a trente ans, on allait à la bibliothèque pour emprunter un roman ou pour faire ses devoirs en silence.', 'Thirty years ago, people went to the library to borrow a novel or to do their homework in silence.'],
      ['Aujourd’hui, dans de nombreuses villes, on peut aussi y emprunter des jeux de société, des instruments de musique et même des outils pour bricoler.', 'Today, in many cities, you can also borrow board games, musical instruments and even DIY tools there.'],
      ['Certaines proposent également des imprimantes 3D, des studios d’enregistrement ou des salles pour travailler en groupe.', 'Some also offer 3D printers, recording studios or rooms for group work.'],
    ] },
    { s: [
      ['Les bibliothèques jouent aussi un rôle important pour les nouveaux arrivants.', 'Libraries also play an important role for newcomers.'],
      ['Beaucoup d’entre elles organisent des ateliers de conversation en français, de l’aide pour rédiger un CV ou des séances d’information sur la recherche d’emploi.', 'Many of them run French conversation workshops, help with writing a CV, or information sessions on looking for a job.'],
      ['« Quand je suis arrivée, je ne connaissais personne, raconte Mariana, une Colombienne de trente-quatre ans.', '“When I arrived, I didn’t know anyone,” says Mariana, a 34-year-old Colombian woman.'],
      ['Le club de conversation du mardi soir m’a permis de pratiquer mon français et de me faire des amis. »', '“The Tuesday evening conversation club allowed me to practise my French and to make friends.”'],
    ] },
    { s: [
      ['Pourquoi un tel succès ?', 'Why such success?'],
      ['D’abord, parce que la plupart des services sont gratuits : il suffit de s’inscrire avec une pièce d’identité et un justificatif de domicile.', 'First, because most services are free: all you need to do is sign up with an ID and a proof of address.'],
      ['Ensuite, parce que ces lieux sont chaleureux : on peut y travailler, lire le journal ou simplement se reposer, sans rien acheter.', 'Then, because these places are welcoming: you can work, read the newspaper or simply rest there, without buying anything.'],
    ] },
    { s: [
      ['Cependant, tout n’est pas parfait.', 'However, not everything is perfect.'],
      ['Dans certains quartiers, les horaires d’ouverture restent limités, en particulier le dimanche, et les places pour les ateliers partent très vite.', 'In some neighbourhoods, opening hours are still limited, especially on Sundays, and places in the workshops go very quickly.'],
      ['Les bibliothécaires conseillent donc de s’inscrire dès l’ouverture des inscriptions.', 'Librarians therefore advise signing up as soon as registration opens.'],
    ] },
    { s: [
      ['Vous voulez pratiquer votre français sans dépenser un sou ?', 'Do you want to practise your French without spending a penny?'],
      ['Poussez la porte de la bibliothèque la plus proche de chez vous : vous serez sans doute surpris !', 'Push open the door of the library nearest you: you will probably be surprised!'],
    ] },
  ],
  glossary: [
    { fr: 'Emprunter', tr: b('to borrow', 'prendre quelque chose pour un temps, puis le rendre') },
    { fr: 'lieux de vie', tr: b('community spaces, places where people spend time', 'des endroits où l’on se retrouve, où l’on passe du temps') },
    { fr: 'bricoler', tr: b('to do DIY, small repairs', 'faire de petits travaux à la maison') },
    { fr: 'les nouveaux arrivants', tr: b('newcomers (people who have just arrived in the country)', 'les personnes qui viennent d’arriver dans le pays') },
    { fr: 'rédiger', tr: b('to write (a document)', 'écrire un texte, un document') },
    { fr: 'il suffit de', tr: b('all you need to do is', 'on a seulement besoin de') },
    { fr: 'un justificatif de domicile', tr: b('a proof of address', 'un document qui montre où vous habitez (une facture, un bail…)') },
    { fr: 'chaleureux', tr: b('warm, welcoming', 'accueillant, agréable') },
    { fr: 'Cependant', tr: b('however', 'mais (pour introduire une opposition)') },
    { fr: 'sans dépenser un sou', tr: b('without spending a penny', 'sans payer, gratuitement') },
  ],
  questions: [
    {
      q: 'Quel est le sujet principal de cet article ?',
      qEn: 'What is the main subject of this article?',
      options: ['La disparition des livres en papier', 'Les nouveaux services des bibliothèques publiques', 'Le prix de l’inscription dans les bibliothèques', 'Le métier de bibliothécaire'],
      answer: 1,
      evidence: 'les bibliothèques publiques sont devenues de véritables lieux de vie',
      explain: b(
        'The lead (the first lines, in bold) sums up the article: libraries have become “lieux de vie”. In an article, always read the title and the lead first.',
        'Le chapeau (les premières lignes, en gras) résume l’article : les bibliothèques sont devenues des « lieux de vie ». Dans un article, lisez toujours le titre et le chapeau en premier.',
      ),
      skill: 'global',
    },
    {
      q: 'D’après l’article, que peut-on emprunter aujourd’hui dans de nombreuses bibliothèques ?',
      qEn: 'According to the article, what can you borrow in many libraries today?',
      options: ['Des vélos et des voitures', 'Des jeux de société et des instruments de musique', 'Des vêtements et des chaussures', 'Des billets de spectacle'],
      answer: 1,
      evidence: 'des jeux de société, des instruments de musique et même des outils pour bricoler',
      explain: b(
        'The second paragraph lists them: board games, musical instruments and even tools. Y stands for “à la bibliothèque”.',
        'Le deuxième paragraphe les cite : jeux de société, instruments de musique et même outils. Y remplace « à la bibliothèque ».',
      ),
      skill: 'detail',
    },
    {
      q: 'Qu’est-ce que le club de conversation a apporté à Mariana ?',
      qEn: 'What did the conversation club bring Mariana?',
      options: ['Un emploi', 'Un logement', 'De la pratique en français et des amis', 'Un diplôme de français'],
      answer: 2,
      evidence: 'm’a permis de pratiquer mon français et de me faire des amis',
      explain: b(
        '“… m’a permis de pratiquer mon français et de me faire des amis.” Permettre de means to make something possible.',
        '« … m’a permis de pratiquer mon français et de me faire des amis. » Permettre de = rendre possible.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que faut-il pour s’inscrire ?',
      qEn: 'What do you need to sign up?',
      options: ['Payer un abonnement annuel', 'Une pièce d’identité et un justificatif de domicile', 'Parler parfaitement français', 'Être étudiant'],
      answer: 1,
      evidence: 'il suffit de s’inscrire avec une pièce d’identité et un justificatif de domicile',
      explain: b(
        '“Il suffit de…” means all you need is…: an ID and a proof of address. Most services are free, so there is no yearly fee.',
        '« Il suffit de… » = on a seulement besoin de… : une pièce d’identité et un justificatif de domicile. La plupart des services sont gratuits : pas d’abonnement à payer.',
      ),
      skill: 'detail',
    },
    {
      q: 'Quel problème l’article mentionne-t-il ?',
      qEn: 'Which problem does the article mention?',
      options: ['Les bibliothèques sont trop bruyantes.', 'Les horaires sont parfois limités et les ateliers vite complets.', 'Les services coûtent de plus en plus cher.', 'Il n’y a presque plus de livres.'],
      answer: 1,
      evidence: 'les horaires d’ouverture restent limités',
      explain: b(
        '“Cependant” announces the problems: limited opening hours (especially on Sundays) and workshops that fill up fast.',
        '« Cependant » annonce les problèmes : des horaires limités (surtout le dimanche) et des ateliers vite complets.',
      ),
      skill: 'detail',
    },
    {
      q: 'Dans la conclusion, l’auteur veut surtout :',
      qEn: 'In the conclusion, what does the author mainly want to do?',
      options: ['Critiquer les horaires des bibliothèques', 'Encourager le lecteur à aller à la bibliothèque', 'Expliquer comment devenir bibliothécaire', 'Présenter Mariana'],
      answer: 1,
      evidence: 'Poussez la porte de la bibliothèque la plus proche de chez vous',
      explain: b(
        'The question to the reader and the imperative “poussez la porte” are an invitation: the author encourages you to go. Finding the writer’s intention is a typical TCF and DELF B1 question.',
        'La question au lecteur et l’impératif « poussez la porte » sont une invitation : l’auteur vous encourage à y aller. Trouver l’intention de l’auteur est une question typique du TCF et du DELF B1.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('Organising ideas: logical connectors', 'Organiser ses idées : les connecteurs logiques'),
    body: b(
      'Connectors are the signposts of a text: spot them and you see its structure. **D’abord** and **ensuite** list reasons; **cependant** (however) introduces an opposition; **donc** and **alors** give a consequence; **parce que** gives a cause. In exam questions, the answer is often just after a connector.',
      'Les connecteurs sont les panneaux indicateurs d’un texte : repérez-les et vous voyez sa structure. **D’abord** et **ensuite** énumèrent des raisons ; **cependant** introduit une opposition ; **donc** et **alors** annoncent une conséquence ; **parce que** donne une cause. À l’examen, la réponse se trouve souvent juste après un connecteur.',
    ),
    examples: [
      { fr: 'D’abord, parce que la plupart des services sont gratuits.', tr: 'First, because most services are free.' },
      { fr: 'Cependant, tout n’est pas parfait.', tr: 'However, not everything is perfect.' },
      { fr: 'Les bibliothécaires conseillent donc de s’inscrire tôt.', tr: 'Librarians therefore advise signing up early.' },
    ],
  },
};

export default text;
