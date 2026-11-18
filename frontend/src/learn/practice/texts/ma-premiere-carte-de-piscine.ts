import { reading } from '../authoring';

export default reading(
  "ma-premiere-carte-de-piscine",
  ["Vous préférez nager le matin ou le soir ?","Do you prefer swimming in the morning or evening?"],
  [
    [
      ["La piscine est à côté de mon travail.","The swimming pool is next to my workplace."],
      ["Aujourd’hui, j’achète une carte pour dix entrées.","Today I’m buying a pass for ten visits."],
      ["La dame à l’accueil me demande mon prénom et mon numéro de téléphone.","The woman at reception asks for my first name and phone number."],
    ],
    [
      ["Je nage le mardi soir avec mon frère.","I swim with my brother on Tuesday evenings."],
      ["Il nage bien, mais moi, je débute.","He swims well, but I’m a beginner."],
      ["Je reste dans le petit bassin.","I stay in the shallow pool."],
      ["Après la piscine, nous rentrons à pied.","After swimming, we walk home."],
    ],
  ],
  [
    ["entrées","visites à la piscine","visits"],
    ["à l’accueil","au bureau où on reçoit les visiteurs","at reception"],
    ["je débute","je commence à apprendre","I’m a beginner"],
    ["à pied","en marchant","on foot"],
  ],
  [
    ["global",0,"De quelle activité parle le texte ?","What activity does this text describe?",["La natation","La course","Le vélo"],"Je nage le mardi soir avec mon frère.","Le mot « nage » donne l’activité.","Nage tells you the activity."],
    ["detail",2,"Pourquoi la piscine est-elle pratique pour lui ?","Why is the pool convenient for him?",["Elle est près de chez son frère.","Elle ouvre la nuit.","Elle est près de son travail."],"à côté de mon travail","« À côté de » signifie ici « tout près de ».","À côté de means close to here."],
    ["detail",1,"Combien de fois peut-il entrer avec sa carte ?","How many visits does the pass cover?",["Deux fois","Dix fois","Une fois"],"une carte pour dix entrées","Une entrée correspond à une visite.","One entry means one visit."],
    ["detail",0,"Avec qui nage-t-il ?","Who does he swim with?",["Son frère","Une collègue","La dame de l’accueil"],"avec mon frère","Il nage avec son frère le mardi.","He swims with his brother on Tuesdays."],
    ["inference",2,"Pourquoi reste-t-il dans le petit bassin ?","Why does he stay in the shallow pool?",["Il attend son frère.","Il n’a pas de carte.","Il commence à apprendre à nager."],["moi, je débute","Je reste dans le petit bassin."],"Les deux phrases montrent qu’il reste là parce qu’il débute.","The two sentences show he does this because he’s a beginner."],
  ],
  {
    fr: ["Le mardi ou mardi ?","**Le mardi** indique souvent une habitude. **Mardi**, sans article, indique en général un mardi précis."],
    en: ["Every Tuesday or this Tuesday?","**Le mardi** often marks a regular habit. Bare **mardi** usually means a specific Tuesday."],
    examples: [["Je nage le mardi soir.","I swim on Tuesday evenings."]],
  },
);
