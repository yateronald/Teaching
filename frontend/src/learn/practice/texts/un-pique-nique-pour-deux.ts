import { reading } from '../authoring';

export default reading(
  "un-pique-nique-pour-deux",
  ["Qu’est-ce que vous prenez pour un pique-nique ?","What do you take on a picnic?"],
  [
    [
      ["Salut Zoé !","Hi Zoé!"],
      ["Samedi, je déjeune au parc.","On Saturday I’m having lunch in the park."],
      ["Tu veux venir avec moi ?","Would you like to come with me?"],
    ],
    [
      ["On se retrouve à midi devant le petit pont.","Let’s meet at noon in front of the little bridge."],
      ["J’apporte du pain, du fromage et deux pommes.","I’ll bring bread, cheese and two apples."],
      ["Tu peux prendre de l’eau ?","Can you bring some water?"],
    ],
    [
      ["S’il pleut, on mange chez moi.","If it rains, we’ll eat at my place."],
      ["À samedi !","See you Saturday!"],
      ["Aya","Aya"],
    ],
  ],
  [
    ["On se retrouve","on se donne rendez-vous","we meet up"],
    ["J’apporte","je prends avec moi","I’ll bring"],
    ["chez moi","dans ma maison ou mon appartement","at my place"],
  ],
  [
    ["global",2,"Pourquoi Aya écrit-elle ?","Why does Aya write?",["Pour demander l’adresse de Zoé","Pour annuler le déjeuner","Pour inviter Zoé à déjeuner"],"Tu veux venir avec moi ?","Elle propose un déjeuner à deux.","She suggests having lunch together."],
    ["detail",0,"À quelle heure est le rendez-vous ?","What time are they meeting?",["À midi","À onze heures","À deux heures"],"à midi devant le petit pont","Midi, c’est douze heures.","Midi means noon."],
    ["detail",1,"Où vont-elles se retrouver ?","Where are they meeting?",["Chez Zoé","Devant le petit pont","À l’entrée d’un restaurant"],"devant le petit pont","Le pont sert de point de rendez-vous.","The bridge is the meeting point."],
    ["detail",2,"Que doit apporter Zoé ?","What should Zoé bring?",["Du pain","Des pommes","De l’eau"],"Tu peux prendre de l’eau ?","Le pain et les pommes sont dans la liste d’Aya.","Bread and apples are on Aya’s list."],
    ["vocab",1,"Où vont-elles manger s’il pleut ?","Where will they eat if it rains?",["Chez Zoé","Chez Aya","Sous le pont"],"S’il pleut, on mange chez moi.","Aya écrit le message : « chez moi » désigne son logement.","Aya is writing, so chez moi means her home."],
  ],
  {
    fr: ["Chez + personne","**Chez** indique le lieu où vit une personne : **chez moi**, **chez toi**, **chez Aya**."],
    en: ["Chez + person","**Chez** refers to someone’s place: **chez moi** (my place), **chez toi** (your place), **chez Aya** (Aya’s place)."],
    examples: [["On mange chez moi.","We’re eating at my place."]],
  },
  { from: 'Aya', to: 'Zoé', subject: 'Samedi' },
);
