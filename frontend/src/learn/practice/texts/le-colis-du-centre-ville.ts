import { reading } from '../authoring';

export default reading(
  "le-colis-du-centre-ville",
  ["Que faites-vous quand vous manquez une livraison ?","What do you do when you miss a delivery?"],
  [
    [
      ["Bonjour Inès,","Hello Inès,"],
      ["Nous n’avons pas pu déposer votre colis à l’épicerie du quartier : elle est fermée cette semaine.","We couldn’t leave your parcel at the neighbourhood grocery shop: it is closed this week."],
      ["Vous pouvez le retirer à la papeterie du centre-ville à partir de mardi matin.","You can collect it from the stationery shop in the city centre from Tuesday morning."],
    ],
    [
      ["Le magasin est ouvert jusqu’à dix-neuf heures, sauf jeudi, où il ferme à seize heures.","The shop is open until seven in the evening, except on Thursday, when it closes at four."],
      ["Présentez le code qui se trouve dans le message reçu hier et une pièce d’identité.","Show the code in the message you received yesterday and a piece of ID."],
      ["Si votre frère vient à votre place, il doit apporter sa pièce d’identité et un mot signé de votre part.","If your brother comes in your place, he must bring his ID and a signed note from you."],
    ],
    [
      ["Gardez ce message : le colis restera au magasin jusqu’à samedi soir.","Keep this message: your parcel will stay at the shop until Saturday evening."],
      ["Après, il sera renvoyé à l’expéditeur.","After that it will be sent back to the sender."],
    ],
  ],
  [
    ["retirer","venir chercher","to collect"],
    ["papeterie","magasin qui vend du papier, des cahiers ou des stylos","stationery shop"],
    ["sauf","à l’exception de","except"],
    ["à votre place","au lieu de vous","in your place"],
    ["expéditeur","personne ou entreprise qui envoie le colis","sender"],
  ],
  [
    ["global",0,"Pourquoi Inès reçoit-elle ce message ?","Why does Inès receive this message?",["Pour connaître le nouveau lieu de retrait","Pour choisir une date de livraison à domicile","Pour payer les frais d’envoi","Pour confirmer son adresse"],"Vous pouvez le retirer à la papeterie du centre-ville","Le colis n’est pas au point de retrait prévu.","The parcel is not at the original pickup point."],
    ["detail",2,"Pourquoi le colis n’est-il pas à l’épicerie ?","Why isn’t the parcel at the grocery shop?",["Inès a changé d’adresse.","L’épicerie ne prend plus de colis.","L’épicerie est fermée.","Le colis a été renvoyé."],"elle est fermée cette semaine","« Elle » désigne l’épicerie.","Elle refers to the grocery shop."],
    ["inference",3,"Inès sort du travail jeudi à dix-sept heures. Peut-elle encore aller au magasin ce jour-là ?","Inès finishes work at five on Thursday. Can she still go to the shop that day?",["Oui, avant dix-neuf heures.","Oui, avec le code.","Oui, si son frère l’accompagne.","Non, le magasin sera déjà fermé."],"sauf jeudi, où il ferme à seize heures","Le jeudi, la règle des dix-neuf heures ne s’applique pas.","The seven o’clock closing time does not apply on Thursdays."],
    ["detail",1,"Où Inès doit-elle chercher le code ?","Where should Inès find the code?",["Sur le colis","Dans le message de la veille","Sur sa pièce d’identité","Sur la porte du magasin"],"le code qui se trouve dans le message reçu hier","Le code a déjà été envoyé.","The code has already been sent."],
    ["detail",0,"Quel document Inès doit-elle préparer si son frère y va ?","What document must Inès prepare if her brother goes?",["Un mot signé par elle","Une facture de la papeterie","Une copie du reçu de livraison","Une nouvelle étiquette"],"un mot signé de votre part","Le frère apporte aussi sa propre pièce d’identité.","Her brother also brings his own ID."],
    ["vocab",2,"Que se passera-t-il si personne ne vient avant la fermeture de samedi ?","What happens if nobody comes by closing time on Saturday?",["Le colis ira à l’épicerie.","Le magasin gardera le colis une semaine de plus.","Le colis repartira vers la personne qui l’a envoyé.","Le livreur le déposera chez Inès."],"il sera renvoyé à l’expéditeur","L’expéditeur est la personne qui a envoyé le colis.","The sender is the person who sent the parcel."],
  ],
  {
    fr: ["Jusqu’à et sauf","**Jusqu’à** marque la limite. **Sauf** introduit une exception à la règle."],
    en: ["Until and except","**Jusqu’à** gives the limit. **Sauf** introduces an exception to the rule."],
    examples: [["Le magasin est ouvert jusqu’à dix-neuf heures.","The shop is open until seven."], ["Il ouvre tous les jours sauf le dimanche.","It opens every day except Sunday."]],
  },
  { from: 'Service de livraison', to: 'Inès', subject: 'À propos de votre colis' },
);
