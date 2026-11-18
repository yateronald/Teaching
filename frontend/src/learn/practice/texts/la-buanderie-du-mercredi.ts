import { reading } from '../authoring';

export default reading(
  "la-buanderie-du-mercredi",
  ["Où lavez-vous votre linge ?","Where do you do your laundry?"],
  [
    [
      ["La buanderie est fermée mercredi matin.","The laundry room is closed Wednesday morning."],
      ["Un technicien vient réparer la grande machine.","A technician is coming to repair the large machine."],
    ],
    [
      ["Vous pouvez laver votre linge à partir de quatorze heures.","You can wash your clothes from two in the afternoon."],
      ["La petite machine fonctionne normalement.","The small machine is working normally."],
      ["Merci de laisser la porte ouverte après votre passage.","Please leave the door open after you leave."],
    ],
  ],
  [
    ["buanderie","pièce où l’on lave le linge","laundry room"],
    ["linge","vêtements et autres tissus à laver","laundry"],
    ["à partir de","dès cette heure, et après","from"],
  ],
  [
    ["global",1,"De quoi parle cette note ?","What is the notice about?",["De l’entrée de l’immeuble","Des horaires de la buanderie","Des heures de travail du technicien"],"La buanderie est fermée mercredi matin.","La note dit quand on peut aller dans la buanderie.","The notice tells you when you can use the laundry room."],
    ["detail",0,"Quel jour y a-t-il un changement ?","Which day is affected?",["Mercredi","Mardi","Jeudi"],"mercredi matin","Le jour est indiqué au début.","The day is given at the start."],
    ["detail",2,"Quelle machine faut-il réparer ?","Which machine needs repairing?",["Les deux machines","La petite machine","La grande machine"],"réparer la grande machine","La petite machine fonctionne.","The small machine is working."],
    ["vocab",1,"À quinze heures, peut-on laver son linge ?","Can you wash your clothes at three?",["Non, c’est trop tôt.","Oui, la salle est ouverte.","Non, il faut venir exactement à quatorze heures."],"à partir de quatorze heures","« À partir de » inclut les heures suivantes.","À partir de includes later times."],
    ["detail",0,"Comment faut-il laisser la porte ?","How should you leave the door?",["Ouverte","Fermée","Fermée à clé"],"laisser la porte ouverte","C’est la dernière consigne de la note.","That is the last instruction in the notice."],
  ],
  {
    fr: ["À partir de","**À partir de** indique le début : à partir de quatorze heures, on peut venir à quatorze heures ou plus tard."],
    en: ["From","**À partir de** gives the starting time: at two, or any later time."],
    examples: [["Vous pouvez venir à partir de quatorze heures.","You can come from two."]],
  },
);
