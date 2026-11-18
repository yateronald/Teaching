import { listening } from './authoring';

export const b2Listening = listening('B2', 'm2', [
  [
    "le-dimanche-a-la-mediatheque",
    "Le dimanche à la médiathèque",
    ["Chronique radio","Radio commentary"],
    ["Distinguez le résultat d’un essai de ce qu’on peut en conclure.","Distinguish the results of a trial from what they prove."],
    ["Suivre un argument et repérer les limites d’une observation.","Follow an argument and recognise the limits of an observation."],
    ["Après une concession comme « certes », écoutez la réserve : c’est souvent là que se précise le point de vue.","After a concession like « certes », listen for the reservation: it often clarifies the speaker’s position."],
    [
      "La médiathèque municipale a ouvert trois dimanches cet hiver. Le bilan, publié vendredi, annonce huit cents entrées. On serait tenté d’en déduire qu’un nouveau public a trouvé le chemin de la bibliothèque. Or, le compteur ne distingue pas les personnes qui viennent pour la première fois des habitués qui changent simplement de jour.",
      "Les horaires du dimanche ont certes permis à plusieurs parents de venir en famille. Une bibliothécaire remarque toutefois que le personnel a dû déplacer deux ateliers du mercredi pour assurer l’accueil. L’expérience n’a donc pas seulement ajouté des heures : elle a aussi modifié l’offre en semaine.",
      "La mairie souhaite prolonger le test, mais elle ne promet pas encore une ouverture permanente. Avant de décider, elle veut savoir qui a bénéficié de ces créneaux et à quoi les usagers du mercredi ont dû renoncer. Cette fois, un court questionnaire sera proposé sur place.",
      "À mon sens, la bonne question n’est pas de savoir si huit cents entrées constituent un beau chiffre. Il s’agit de vérifier si le dimanche rend la médiathèque accessible à des personnes qui, sans lui, n’y viendraient pas.",
    ],
    [
      ["Quel fait le bilan établit-il directement ?",["Huit cents personnes différentes sont venues","Huit cents entrées ont été comptées","Huit cents habitants ont créé un compte"],1,0,["Le nombre d’entrées ne mesure pas le nombre de personnes distinctes.","The number of visits does not measure distinct visitors."]],
      ["Pourquoi le chroniqueur emploie-t-il « or » ?",["Pour contester une déduction trop rapide","Pour annoncer un nouveau chiffre","Pour confirmer que le public a changé"],0,0,["« Or » introduit la limite qui remet en cause la déduction.","« Or » introduces the limitation that challenges the inference."]],
      ["Quel effet l’essai a-t-il eu sur les mercredis ?",["Le personnel a fermé tous les mercredis","Les parents ont cessé de venir","Deux ateliers ont été déplacés"],2,1,["Le personnel a réorganisé des activités pour pouvoir ouvrir le dimanche.","Staff rearranged activities to open on Sundays."]],
      ["Quel avantage la chronique reconnaît-elle ?",["Des parents ont pu venir en famille","La mairie a réduit ses dépenses","Tous les quartiers ont bénéficié du test"],0,1,["« Certes » reconnaît l’avantage avant de présenter un coût.","« Certes » acknowledges the benefit before presenting a cost."]],
      ["Quelle décision est annoncée ?",["Ouvrir tous les dimanches définitivement","Prolonger le test sans décider encore d’une ouverture permanente","Supprimer les ateliers en semaine"],1,2,["La prolongation est une étape, pas un engagement permanent.","Extending the trial is not a permanent commitment."]],
      ["À quoi doit servir le questionnaire ?",["À vérifier si le compteur fonctionne","À choisir les livres à acheter","À mieux identifier les bénéficiaires et les effets sur les autres usagers"],2,2,["La mairie veut compléter le nombre d’entrées par des informations sur les usagers.","The town wants to supplement the visit count with information about users."]],
      ["Quel critère compte surtout pour le chroniqueur ?",["L’accès de personnes qui ne viendraient pas autrement","Le record d’entrées sur une journée","Le nombre d’ateliers déplacés, à lui seul"],0,3,["L’enjeu est l’accès à un service, pas la performance d’un compteur.","The issue is access to a service, not an impressive count."]],
    ],
  ],
  [
    "reparer-plutot-que-remplacer",
    "Réparer plutôt que remplacer ?",
    ["Entretien monté","Interview excerpt"],
    ["Identifiez les réserves d’une réparatrice face à une mesure qui paraît simple.","Identify a repair worker’s reservations about a seemingly simple measure."],
    ["Identifier une position nuancée et le rôle des exemples.","Identify a nuanced position and the role of examples."],
    ["Repérez l’écart entre le principe que la personne approuve et la condition qu’elle pose.","Notice the gap between the principle the speaker accepts and the condition she sets."],
    [
      "On me demande souvent si une aide financière suffit à encourager la réparation. Dans mon atelier, elle fait une différence : certains clients hésitent moins à faire réparer un appareil lorsque le prix baisse. Mais le prix n’est pas toujours ce qui les fait repartir avec un produit neuf.",
      "Prenez le cas d’un aspirateur. Si la pièce est disponible, je peux intervenir dans la journée. Si je dois la commander et que le fabricant n’annonce aucun délai, le client ignore quand il récupérera son appareil. Pour un objet dont on a besoin chaque jour, cette incertitude peut peser plus lourd que le prix.",
      "Je ne propose pas de supprimer l’aide. Je préférerais qu’on l’accompagne de deux mesures : rendre les pièces plus faciles à trouver et annoncer un délai honnête, quitte à dire qu’on ne sait pas encore. Dans certains cas, un appareil de prêt permettrait aussi d’attendre.",
      "Lorsque je dis qu’il faut rendre la réparation plus pratique, je ne veux pas dire que tout doit être réparé. Si l’appareil présente un défaut dangereux ou ne peut pas être démonté sans être abîmé, il faut pouvoir le dire franchement. L’objectif est que le client choisisse en connaissance de cause, pas qu’il se sente coupable de son choix.",
    ],
    [
      ["Quel effet la personne reconnaît-elle à l’aide financière ?",["Elle fait disparaître tous les obstacles","Elle réduit l’hésitation de certains clients","Elle allonge les délais de réparation"],1,0,["L’aide agit sur le prix et peut encourager certains clients.","The subsidy lowers the price and can encourage some customers."]],
      ["À quoi sert l’exemple de l’aspirateur ?",["À montrer que les clients détestent réparer","À expliquer que tous les fabricants livrent lentement","À montrer l’importance d’un délai prévisible"],2,1,["L’incertitude sur la date de retour peut peser davantage que le prix.","Uncertainty about when it will be returned can matter more than the price."]],
      ["Qu’est-ce qui permet parfois une réparation le jour même ?",["La disponibilité de la pièce","Un prix fixé par le client","Une réduction sur un produit neuf"],0,1,["Le calendrier dépend d’abord de la disponibilité de la pièce.","Timing depends first on whether the part is available."]],
      ["Quelle est la position de la réparatrice sur l’aide ?",["La supprimer","La garder et la compléter","La rendre obligatoire pour tout achat"],1,2,["Elle soutient l’aide mais veut traiter les autres obstacles.","She supports the subsidy but wants to address the other barriers."]],
      ["Que signifie « quitte à dire » dans ce passage ?",["En cachant le manque d’information","À condition de promettre un délai court","Même si cela oblige à reconnaître son incertitude"],2,2,["La phrase préfère une limite annoncée à une promesse trompeuse.","The speaker prefers stating a limitation to making a misleading promise."]],
      ["Pourquoi évoquer un défaut dangereux ?",["Pour rappeler qu’il existe des cas où la réparation n’est pas une bonne option","Pour demander aux clients de réparer seuls","Pour montrer que les appareils neufs sont toujours dangereux"],0,3,["Elle distingue l’encouragement à réparer d’une obligation absolue.","She distinguishes encouraging repair from making it an absolute obligation."]],
      ["Quel objectif défend-elle au fond ?",["Faire culpabiliser les acheteurs","Permettre au client de prendre une décision éclairée","Réparer quoi qu’il arrive"],1,3,["« En connaissance de cause » signifie décider avec les informations utiles.","« En connaissance de cause » means deciding with the relevant information."]],
    ],
  ],
]);
