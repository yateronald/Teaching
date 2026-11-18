import { reading } from '../authoring';

export default reading(
  "le-jour-ou-la-caisse-s-est-arretee",
  ["Au travail, que faites-vous quand un outil indispensable tombe en panne ?","At work, what do you do when an essential tool fails?"],
  [
    [
      ["Il était midi passé quand la caisse s’est éteinte.","It was just after noon when the till went dark."],
      ["Julie a appuyé deux fois sur le bouton, sans résultat.","Julie pressed the button twice, with no result."],
      ["Devant le comptoir, six personnes attendaient de commander.","Six people were waiting to order at the counter."],
      ["C’était son deuxième jour dans ce café et elle ne connaissait pas encore les prix par cœur.","It was her second day at the café and she didn’t know the prices by heart yet."],
    ],
    [
      ["Son collègue Malik a sorti un carnet du tiroir.","Her colleague Malik pulled a notebook out of the drawer."],
      ["Il lui a proposé de noter les commandes, pendant qu’il calculerait le total et encaisserait.","He suggested she write down the orders while he worked out the totals and took payment."],
      ["Julie a écrit le prénom du premier client, puis tout ce qu’il voulait.","Julie wrote down the first customer’s name, then everything he wanted."],
      ["Quand deux clients ont donné le même prénom, ils ont commencé à numéroter les tickets.","When two customers gave the same name, they started numbering the slips."],
    ],
    [
      ["Le service a ralenti, mais la file n’a pas cessé d’avancer.","Service slowed down, but the line kept moving."],
      ["Une cliente qui semblait pressée a demandé combien de temps cela prendrait.","A customer who seemed in a hurry asked how long it would take."],
      ["Julie lui a dit qu’il y avait trois commandes avant la sienne, plutôt que de lui promettre un délai qu’elle ne pouvait pas tenir.","Julie told her there were three orders ahead of hers instead of promising a wait time she couldn’t guarantee."],
    ],
    [
      ["Une heure plus tard, la caisse fonctionnait de nouveau.","An hour later the till was working again."],
      ["Malik allait ranger le carnet quand Julie lui a demandé de le laisser près de la caisse.","Malik was about to put the notebook away when Julie asked him to leave it beside the till."],
      ["Sur la première page, elle avait ajouté une consigne pour la prochaine fois : commencer par le numéro, pas par le prénom.","On the first page she had added an instruction for next time: start with the number, not the name."],
    ],
  ],
  [
    ["par cœur","sans avoir besoin de regarder","by heart"],
    ["encaisserait","recevrait le paiement","would take payment"],
    ["la file","le groupe de personnes qui attend l’une derrière l’autre","the line"],
    ["tenir","ici, respecter une promesse","to keep"],
    ["consigne","instruction à suivre","instruction"],
  ],
  [
    ["global",1,"Quel est le sujet principal du récit ?","What is the main subject of the story?",["Une erreur qui coûte de l’argent au café","Une équipe qui s’organise pendant une panne","La formation de Malik à la caisse","Une cliente qui demande un remboursement"],["la caisse s’est éteinte","Il lui a proposé de noter les commandes"],"La panne déclenche une nouvelle façon de travailler.","The failure sets off a different way of working."],
    ["detail",3,"Qu’est-ce qui complique le travail de Julie au départ ?","What makes Julie’s work harder at first?",["Elle est seule.","Le carnet est introuvable.","Le café n’a plus de monnaie.","Elle ne maîtrise pas encore les prix."],"elle ne connaissait pas encore les prix par cœur","Elle vient de commencer dans ce café.","She has only just started at the café."],
    ["detail",0,"Qui calcule le montant à payer ?","Who works out how much customers should pay?",["Malik","Julie","Chaque client","La responsable"],"pendant qu’il calculerait le total et encaisserait","« Il » renvoie à Malik.","Il refers to Malik."],
    ["inference",2,"Quel problème les numéros permettent-ils d’éviter ?","What problem do the numbers help prevent?",["Faire payer un prix différent","Compter deux fois la monnaie","Confondre deux commandes","Oublier l’heure de fermeture"],"Quand deux clients ont donné le même prénom, ils ont commencé à numéroter les tickets.","Les numéros distinguent des clients qui portent le même prénom.","Numbers distinguish customers who have the same name."],
    ["inference",1,"Pourquoi Julie indique-t-elle le nombre de commandes plutôt qu’une durée ?","Why does Julie give the number of orders rather than a time estimate?",["Elle ne veut pas répondre.","Elle donne l’information qu’elle connaît avec certitude.","Elle sait que chacune prend le même temps.","Elle veut passer la cliente en priorité."],"plutôt que de lui promettre un délai qu’elle ne pouvait pas tenir","Elle préfère un renseignement fiable à une promesse risquée.","She prefers reliable information to a risky promise."],
    ["vocab",3,"Que signifie « la file n’a pas cessé d’avancer » ?","What does “la file n’a pas cessé d’avancer” mean?",["La file s’est allongée sans limite.","Les clients sont tous partis.","Le café a servi plus vite qu’avant.","Les clients ont continué à être servis."],"la file n’a pas cessé d’avancer","La négation indique que l’action a continué.","The negative shows that the action kept going."],
    ["inference",0,"Que montre le dernier geste de Julie ?","What does Julie’s final action show?",["Elle tire une leçon de la panne pour la prochaine fois.","Elle abandonne l’idée d’utiliser des numéros.","Elle veut prouver que Malik s’est trompé.","Elle décide de ne plus utiliser la caisse."],"elle avait ajouté une consigne pour la prochaine fois","Elle transforme l’expérience en consigne utile.","She turns the experience into a useful instruction."],
  ],
  {
    fr: ["Pendant que et quand","**Pendant que** relie deux actions qui se déroulent en même temps. **Quand** peut introduire l’événement qui change la situation."],
    en: ["While and when","**Pendant que** connects simultaneous actions. **Quand** can introduce the event that changes a situation."],
    examples: [["Je note les commandes pendant que tu calcules le total.","I’ll write down the orders while you work out the total."]],
  },
);
