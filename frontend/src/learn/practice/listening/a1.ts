import { listening } from './authoring';

export const a1Listening = listening('A1', 'f2', [
  [
    "rendez-vous-devant-le-cinema",
    "Rendez-vous devant le cinéma",
    ["Message vocal","Voicemail"],
    ["Retrouvez l’heure et le lieu du rendez-vous.","Find the meeting time and place."],
    ["Repérer un jour, une heure et un lieu.","Pick out a day, a time and a place."],
    ["Écoutez d’abord le jour, puis les mots qui suivent « à » et « devant ».","Listen for the day first, then the words after « à » and « devant »."],
    [
      "Salut, c’est Lina. On se voit samedi à quatre heures.",
      "Je t’attends devant le cinéma, pas devant la gare.",
      "Il fait froid. Prends une veste.",
    ],
    [
      ["Quel jour est le rendez-vous ?",["Vendredi","Samedi","Dimanche"],1,0,["Lina dit « samedi ».","Lina says « samedi »."]],
      ["À quelle heure ?",["À quatre heures","À cinq heures","À six heures"],0,0,["« À quatre heures » donne l’heure.","« À quatre heures » gives the time."]],
      ["Où Lina attend-elle ?",["Devant la gare","Au café","Devant le cinéma"],2,1,["Elle dit « devant le cinéma » et exclut la gare.","She says « devant le cinéma » and rules out the station."]],
      ["Que faut-il prendre ?",["Un sac","Une veste","Un livre"],1,2,["« Prends une veste » est la consigne.","« Prends une veste » is the instruction."]],
    ],
  ],
  [
    "le-petit-dejeuner-du-cafe",
    "Le petit-déjeuner du café",
    ["Annonce en boutique","Shop announcement"],
    ["Choisissez une formule au café.","Choose a breakfast deal."],
    ["Reconnaître un prix et ce qui est compris.","Recognise a price and what is included."],
    ["Quand vous entendez « avec », écoutez ce qui fait partie de la formule.","When you hear « avec », listen for what comes with the deal."],
    [
      "Bonjour. Ce matin, la formule avec un café et un croissant coûte quatre euros.",
      "Si vous préférez du thé, la formule coûte aussi quatre euros.",
      "Le jus d’orange n’est pas compris. Il coûte deux euros.",
    ],
    [
      ["De quel repas parle-t-on ?",["Du dîner","Du déjeuner","Du petit-déjeuner"],2,0,["« Ce matin » et la formule café-croissant donnent le contexte.","« Ce matin » and the coffee-and-croissant deal give the context."]],
      ["Quel aliment est compris dans la formule ?",["Un croissant","Une tartine","Un sandwich"],0,0,["La formule comprend un café et un croissant.","The deal includes coffee and a croissant."]],
      ["Peut-on choisir du thé au même prix ?",["Non, le thé coûte plus cher","Oui, le prix est le même","Non, il n’y a pas de thé"],1,1,["Le mot « aussi » indique que le prix ne change pas.","« Aussi » signals the same price."]],
      ["Combien coûte le jus d’orange ?",["Quatre euros","Trois euros","Deux euros"],2,2,["Le jus est vendu séparément, à deux euros.","Juice is sold separately for two euros."]],
    ],
  ],
  [
    "la-piscine-change-d-horaire",
    "La piscine change d’horaire",
    ["Annonce publique","Public announcement"],
    ["Écoutez les horaires d’une piscine de quartier.","Listen to the opening hours for a local pool."],
    ["Repérer une fermeture et une heure d’ouverture.","Pick out a closure and an opening time."],
    ["Faites la différence entre « fermée » et « ouvre » : les deux annoncent des informations différentes.","Distinguish « fermée » from « ouvre »: they tell you different things."],
    [
      "Attention. La piscine est fermée mardi matin.",
      "Elle ouvre mardi à deux heures de l’après-midi.",
      "Pour entrer, prenez votre carte de piscine. Les cours de natation du mercredi ne changent pas.",
    ],
    [
      ["Quel jour la piscine est-elle fermée le matin ?",["Mardi","Mercredi","Jeudi"],0,0,["La fermeture est annoncée pour « mardi matin ».","The closure is on « mardi matin »."]],
      ["Quand ouvre-t-elle mardi ?",["À midi","À deux heures de l’après-midi","À quatre heures de l’après-midi"],1,1,["L’annonce précise « à deux heures de l’après-midi ».","The announcement specifies two in the afternoon."]],
      ["Que faut-il apporter ?",["Une photo","Une pièce de monnaie","Sa carte de piscine"],2,2,["« Prenez votre carte » donne l’objet à apporter.","« Prenez votre carte » tells you what to bring."]],
      ["Qu’est-ce qui ne change pas ?",["Les cours du mercredi","L’ouverture du mardi matin","L’heure du cours du mardi"],0,2,["Ce sont les cours du mercredi qui restent les mêmes.","Wednesday’s lessons stay the same."]],
    ],
  ],
]);
