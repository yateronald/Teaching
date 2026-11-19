// B1 · The tiny pronouns stuck to the verb: y, en, le / la / les, lui / leur.
import { ear, ex, fill, pick, situation } from '../authoring';

const CLES = 'Les clés ? Je les ai laissées chez Paul. Je lui ai demandé de les garder, et j’y passe ce soir.';
const CLES_SHOW = 'Les clés ? Je {les}‿ai laissées chez Paul. Je {lui} ai demandé de {les} garder, et j’{y} passe ce soir.';

export default ear('les-petits-pronoms', {
  rule: [
    ['Les petits pronoms : y, en, le, lui', 'The little pronouns: y, en, le, lui'],
    [
      'À l’oral, les pronoms sont très courts et collés au verbe : __j’y vais__ [ʒivɛ], __j’en ai deux__ [ʒɑ̃nedø], __je le lui donne__ [ʒəlɥidɔn]. Ils remplacent un mot déjà dit : **y** = un lieu (à Paris, au cinéma), **en** = une quantité ou « de + chose », **le / la / les** = la chose ou la personne, **lui / leur** = « à quelqu’un ».\n\nSi vous ne les entendez pas, la phrase change de sens : __il en a trois__ (trois de ces choses) n’est pas __il a trois ans__.',
      'In speech, pronouns are very short and stuck to the verb: __j’y vais__ [ʒivɛ], __j’en ai deux__ [ʒɑ̃nedø], __je le lui donne__ [ʒəlɥidɔn]. They replace a word already said: **y** = a place (to Paris, to the cinema), **en** = a quantity or « de + thing », **le / la / les** = the thing or person, **lui / leur** = « to someone ».\n\nIf you miss them, the sentence changes meaning: __il en a trois__ (three of those) is not __il a trois ans__.',
    ],
  ],
  goal: ['Entendre les petits pronoms et savoir ce qu’ils remplacent.', 'Hear the little pronouns and know what they replace.'],
  examples: [
    ex('Tu vas au marché ? Oui, j’y vais.', 'Oui, j’{y} vais.', ['Y = au marché.', 'Y = to the market.']),
    ex('Tu as des frères ? J’en ai deux.', 'J’{en}‿ai deux.', ['En = des frères.', 'En = brothers (of them).']),
    ex('Je lui ai téléphoné.', 'Je {lui} ai téléphoné.', ['Lui = à cette personne.', 'Lui = to that person.']),
  ],
  items: [
    pick('Il en a acheté trois.', ['Il en a acheté trois.', 'Il a acheté trois.'], 0, 'Il {en}‿a acheté trois.', [
      'On entend [ilɑ̃na] : « en » est là, collé au verbe. Il a acheté trois de ces choses.', 'You hear [ilɑ̃na]: « en » is there, stuck to the verb. He bought three of them.',
    ]),
    pick('J’y pense souvent.', ['J’y pense souvent.', 'Je pense souvent.'], 0, 'J’{y} pense souvent.', [
      '[ʒipɑ̃s] : « j’y pense », j’y pense = je pense à cela.', '[ʒipɑ̃s]: « j’y pense », I think about it.',
    ]),
    pick('Je le lui ai dit.', ['Je le lui ai dit.', 'Je lui ai dit.'], 0, 'Je {le} {lui} ai dit.', [
      'Deux pronoms : « le » (la chose) et « lui » (à la personne), on entend [ʒəlɥiedi].', 'Two pronouns: « le » (the thing) and « lui » (to the person): [ʒəlɥiedi].',
    ]),
    pick('Elle leur parle tous les jours.', ['Elle leur parle tous les jours.', 'Elle le parle tous les jours.'], 0, 'Elle {leur} parle tous les jours.', [
      '[lœʁ] : elle parle à eux. « Elle le parle » (une langue) se dirait [lə].', '[lœʁ]: she talks to them. « Elle le parle » (a language) would be [lə].',
    ]),
    pick('On y va ?', ['On y va ?', 'On va ?'], 0, 'On {y} va ?', [
      '[ɔ̃niva] : la liaison en [n] annonce le « y ». « On y va ? » = on part ?', '[ɔ̃niva]: the [n] liaison announces « y ». « On y va ? » = shall we go?',
    ]),
    fill('Tu veux du café ? Oui, j’en veux bien.', 'Oui, j’___ veux bien.', 'en', 'Oui, j’{en} veux bien.', [
      'En = du café. [ʒɑ̃vøbjɛ̃].', 'En = some coffee. [ʒɑ̃vøbjɛ̃].',
    ]),
    fill('Tu connais Marie ? Oui, je la connais.', 'Oui, je ___ connais.', 'la', 'Oui, je {la} connais.', [
      'La = Marie (féminin). Pour un homme : « je le connais ».', 'La = Marie (feminine). For a man: « je le connais ».',
    ]),
    fill('Tu vas à Lyon demain ? Oui, j’y vais en train.', 'Oui, j’___ vais en train.', 'y', 'Oui, j’{y} vais en train.', [
      'Y = à Lyon, le lieu.', 'Y = to Lyon, the place.',
    ]),
    situation(CLES, 'Où sont les clés ?', ['Chez Paul', 'Dans la voiture', 'Sur la table'], 0, CLES_SHOW, [
      '« Je les ai laissées chez Paul » : les = les clés.', '« Je les ai laissées chez Paul »: les = the keys.',
    ]),
    situation(CLES, 'Que va faire la personne ce soir ?', ['Passer chez Paul', 'Téléphoner à Paul', 'Garder les clés'], 0, CLES_SHOW, [
      '« J’y passe ce soir » : y = chez Paul.', '« J’y passe ce soir »: y = at Paul’s.',
    ]),
  ],
  takeaway: [
    'Y = un lieu, en = une quantité, le / la / les = la chose, lui / leur = à quelqu’un. Ils sont collés au verbe : écoutez juste avant lui.',
    'Y = a place, en = a quantity, le / la / les = the thing, lui / leur = to someone. They stick to the verb: listen just before it.',
  ],
});
