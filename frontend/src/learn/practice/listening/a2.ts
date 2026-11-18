import { listening } from './authoring';

export const a2Listening = listening('A2', 'm2', [
  [
    "un-colis-pas-au-bon-endroit",
    "Un colis pas au bon endroit",
    ["Message de livraison","Delivery message"],
    ["Repérez le retrait, l’horaire et le document à montrer.","Find the pickup place, hours and document to show."],
    ["Comprendre un changement et des consignes simples.","Understand a change and straightforward instructions."],
    ["Écoutez les mots qui corrigent la première information : « mais », « désormais », « sauf ».","Listen for words that revise earlier information: « mais », « désormais », « sauf »."],
    [
      "Bonjour, je vous appelle pour votre colis. Le point de retrait habituel est fermé cette semaine.",
      "Votre colis est désormais à la papeterie de la place, à côté de la mairie. La pharmacie n’a pas reçu le colis.",
      "La papeterie ferme à dix-neuf heures, sauf le jeudi, où elle ferme à dix-sept heures.",
      "Montrez le code reçu par message et une pièce d’identité. Vous avez jusqu’à samedi soir pour passer.",
    ],
    [
      ["Pourquoi le lieu a-t-il changé ?",["Le livreur a perdu le colis","Le point de retrait habituel est fermé","Le colis est trop grand"],1,0,["Le problème concerne l’ouverture du point habituel.","The usual pickup point is closed."]],
      ["Où faut-il récupérer le colis ?",["À la mairie","À la pharmacie","À la papeterie"],2,1,["« Désormais » annonce la nouvelle adresse.","« Désormais » introduces the new location."]],
      ["Quel jour la papeterie ferme-t-elle plus tôt ?",["Le jeudi","Le vendredi","Le samedi"],0,2,["« Sauf le jeudi » signale l’exception.","« Sauf le jeudi » marks the exception."]],
      ["Que doit-on présenter ?",["Une facture seulement","Un code et une pièce d’identité","Le numéro de la mairie"],1,3,["Le code ne suffit pas : il faut aussi une pièce d’identité.","You need both the code and ID."]],
      ["Jusqu’à quand peut-on passer ?",["Jeudi à midi","Dimanche soir","Samedi soir"],2,3,["« Jusqu’à » indique la date limite : samedi soir.","« Jusqu’à » introduces the deadline: Saturday evening."]],
    ],
  ],
  [
    "une-place-au-concert",
    "Une place au concert",
    ["Information culturelle","Event announcement"],
    ["Organisez une sortie quand le lieu change.","Plan an outing after a change of venue."],
    ["Distinguer lieu, horaires et conditions d’accès.","Distinguish venue, times and entry conditions."],
    ["Repérez ce qui change et ce que l’organisateur conserve.","Identify what changes and what stays the same."],
    [
      "Le concert de vendredi est maintenu. À cause de la pluie, il se tiendra dans la salle des Peupliers, et non dans le parc.",
      "Les portes ouvrent à dix-huit heures. Le groupe commence à jouer une heure plus tard.",
      "Vous n’avez pas besoin d’un nouveau billet. Présentez celui que vous avez déjà, sur papier ou sur votre téléphone.",
      "Pour venir en bus, descendez à l’arrêt Mairie. L’arrêt Parc ne dessert pas la salle.",
    ],
    [
      ["Pourquoi change-t-on de lieu ?",["À cause de la pluie","À cause d’un retard du groupe","À cause d’un problème de billets"],0,0,["Le concert a lieu ; la pluie explique le déménagement.","The show goes ahead; rain explains the move."]],
      ["Où se tient le concert ?",["Dans le parc","Dans la salle des Peupliers","À la mairie"],1,0,["« Et non » exclut le parc.","« Et non » rules out the park."]],
      ["À quelle heure commence la musique ?",["À dix-huit heures","À vingt heures","À dix-neuf heures"],2,1,["Une heure après dix-huit heures, c’est dix-neuf heures.","One hour after six is seven."]],
      ["Quel billet faut-il présenter ?",["Le billet déjà acheté","Un nouveau billet","Un billet uniquement sur papier"],0,2,["L’ancien billet reste utilisable, sur papier ou téléphone.","The original ticket still works, on paper or on a phone."]],
      ["À quel arrêt faut-il descendre ?",["Parc","Mairie","Gare"],1,3,["Le bon arrêt est Mairie.","Mairie is the correct stop."]],
    ],
  ],
]);
