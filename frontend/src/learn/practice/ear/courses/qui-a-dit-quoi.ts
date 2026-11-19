// B2 · Reported speech: il m'a dit que…, elle m'a demandé si…, with the shifts of persons and tenses (demain → le lendemain).
import { ear, ex, fill, pick, situation } from '../authoring';

const MEAN: [string, string] = ['Que comprend-on ?', 'What do we understand?'];
const AGENCE = 'Hier, j’ai appelé l’agence. La conseillère m’a dit que mon dossier était complet, mais elle m’a demandé si je pouvais envoyer une photo d’identité récente. Elle m’a promis qu’elle me répondrait avant vendredi.';
const AGENCE_SHOW = 'Hier, j’ai appelé l’agence. La conseillère {m’a dit que} mon dossier était complet, mais elle {m’a demandé si} je pouvais envoyer une photo d’identité récente. Elle {m’a promis qu’}elle me {répondrait} avant vendredi.';

export default ear('qui-a-dit-quoi', {
  rule: [
    ['Qui a dit quoi ? Suivre le discours rapporté', 'Who said what? Following reported speech'],
    [
      'À l’oral, on rapporte souvent les paroles des autres : __il m’a dit que__…, __elle m’a demandé si__…, __ils m’ont expliqué que__…\n\nDeux pièges : les **personnes** changent (« je » devient « il » ou « elle ») et les **temps** reculent (__je viendrai__ → __il a dit qu’il viendrait__ ; __demain__ → __le lendemain__). Écoutez **qui** parle, **à qui**, et ce qui est vraiment promis ou demandé.',
      'In speech, people often report what others said: __il m’a dit que__…, __elle m’a demandé si__…, __ils m’ont expliqué que__…\n\nTwo traps: **persons** change (« je » becomes « il » or « elle ») and **tenses** shift back (__je viendrai__ → __il a dit qu’il viendrait__; __demain__ → __le lendemain__). Listen for **who** speaks, **to whom**, and what is really promised or asked.',
    ],
  ],
  goal: ['Comprendre qui a dit quoi dans des paroles rapportées.', 'Understand who said what in reported speech.'],
  examples: [
    ex('Il m’a dit qu’il viendrait.', 'Il m’a dit qu’il {viendrait}.', ['« Je viendrai » devient « il viendrait ».', '« Je viendrai » becomes « il viendrait ».']),
    ex('Elle m’a demandé si j’étais libre.', 'Elle m’a demandé {si} j’étais libre.', ['Une question oui / non rapportée : « si ».', 'A reported yes/no question: « si ».']),
    ex('Ils ont dit qu’ils partiraient le lendemain.', 'Ils ont dit qu’ils partiraient {le lendemain}.', ['« Demain » devient « le lendemain ».', '« Demain » becomes « le lendemain ».']),
  ],
  items: [
    pick('Marc m’a dit que sa sœur viendrait samedi.', ['La sœur de Marc', 'Marc', 'La personne qui parle'], 0, 'Marc m’a dit que {sa sœur} viendrait samedi.', [
      'Marc parle, mais c’est « sa sœur » qui viendra.', 'Marc is speaking, but it is « sa sœur » who will come.',
    ], ['Qui viendra samedi ?', 'Who will come on Saturday?']),
    pick('Elle m’a demandé si je pouvais l’aider.', ['Elle a besoin d’aide.', 'Je lui ai demandé de l’aide.', 'Elle propose de m’aider.'], 0, 'Elle m’a demandé si je pouvais {l’}aider.', [
      '« Elle m’a demandé si je pouvais l’aider » : c’est elle qui demande, et l’ = elle. Elle a besoin d’aide.', 'She asked if I could help her: she is the one who needs help.',
    ], MEAN),
    pick('Le directeur nous a annoncé que le bureau fermerait en août.', ['Le bureau fermera en août.', 'Le bureau a fermé en août.', 'Le bureau ferme maintenant.'], 0, 'Le directeur nous a annoncé que le bureau {fermerait} en août.', [
      '« Fermerait » rapporte un futur : « le bureau fermera en août ».', '« Fermerait » reports a future: « the office will close in August ».',
    ], ['Qu’a annoncé le directeur ?', 'What did the director announce?']),
    pick('Il m’a promis qu’il me rappellerait le lendemain.', ['Il va rappeler le jour suivant.', 'Il a déjà rappelé.', 'Il ne rappellera pas.'], 0, 'Il m’a promis qu’il me {rappellerait} {le lendemain}.', [
      '« Le lendemain » = le jour suivant ; « rappellerait » = une promesse pour plus tard.', '« Le lendemain » = the next day; « rappellerait » = a promise for later.',
    ], MEAN),
    pick('Ils m’ont demandé pourquoi j’étais en retard.', ['On m’a posé une question sur mon retard.', 'J’ai expliqué pourquoi ils étaient en retard.', 'Ils étaient en retard.'], 0, 'Ils m’ont demandé {pourquoi} {j’étais} en retard.', [
      '« J’étais en retard » : c’est moi qui étais en retard, et eux qui demandent pourquoi.', '« J’étais en retard »: I was late, and they asked why.',
    ], MEAN),
    fill('Elle m’a dit qu’elle serait là à huit heures.', 'Elle m’a dit qu’elle ___ là à huit heures.', 'serait', 'Elle m’a dit qu’elle {serait} là à huit heures.', [
      '« Je serai là » devient « elle serait là » : le futur rapporté.', '« Je serai là » becomes « elle serait là »: the reported future.',
    ]),
    fill('Il m’a demandé si j’aimais le théâtre.', 'Il m’a demandé ___ j’aimais le théâtre.', 'si', 'Il m’a demandé {si} j’aimais le théâtre.', [
      '« Si » introduit une question oui / non rapportée.', '« Si » introduces a reported yes/no question.',
    ]),
    fill('Ils nous ont expliqué qu’ils avaient raté le train.', 'Ils nous ont expliqué qu’ils ___ raté le train.', 'avaient', 'Ils nous ont expliqué qu’ils {avaient} raté le train.', [
      '« Nous avons raté » devient « ils avaient raté » : le plus-que-parfait.', '« Nous avons raté » becomes « ils avaient raté »: the pluperfect.',
    ]),
    situation(AGENCE, 'Que doit faire la personne ?', ['Envoyer une photo d’identité récente', 'Compléter son dossier', 'Rappeler l’agence vendredi'], 0, AGENCE_SHOW, [
      '« Elle m’a demandé si je pouvais envoyer une photo d’identité récente. » Le dossier, lui, est complet.', 'She asked for a recent ID photo; the file itself is complete.',
    ]),
    situation(AGENCE, 'Qu’a promis la conseillère ?', ['De répondre avant vendredi', 'De rappeler le lendemain', 'D’envoyer une photo'], 0, AGENCE_SHOW, [
      '« Elle m’a promis qu’elle me répondrait avant vendredi. »', '« She promised she would answer before Friday. »',
    ]),
  ],
  takeaway: [
    'Dans le discours rapporté, suivez qui parle et à qui. « Je viendrai » devient « il viendrait », « demain » devient « le lendemain », et « si » rapporte une question.',
    'In reported speech, follow who speaks and to whom. « Je viendrai » becomes « il viendrait », « demain » becomes « le lendemain », and « si » reports a question.',
  ],
});
