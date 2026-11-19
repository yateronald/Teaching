// C1 · Formal inversion: peut-être viendra-t-il, sans doute a-t-il raison, aussi = donc.
import { ear, ex, fill, pick, situation } from '../authoring';

const REFORME = 'Le ministre a annoncé une réforme ambitieuse. Encore faut-il qu’elle soit votée : peut-être le sera-t-elle au printemps, mais rien n’est moins sûr.';
const REFORME_SHOW = 'Le ministre a annoncé une réforme ambitieuse. {Encore faut-il} qu’elle soit votée : {peut-être le sera-t-elle} au printemps, mais rien n’est moins sûr.';

export default ear('l-inversion', {
  rule: [
    ['L’inversion du discours soutenu', 'Inversion in formal speech'],
    [
      'Dans un discours soutenu, certains mots placés en tête de phrase entraînent l’inversion du sujet : __peut-être__, __sans doute__, __aussi__ (au sens de « donc »), __à peine__, __encore__ (au sens de « mais il faut aussi »). On entend alors le verbe, puis le sujet : __Peut-être viendra-t-il__, __Sans doute a-t-il raison__.\n\nLe petit [t] de __-t-il__, __-t-elle__ s’entend bien : il vous dit qui fait l’action. Au quotidien, on dirait plutôt : __Peut-être qu’il viendra__, __Il a sans doute raison__. Attention : __Aussi a-t-elle décidé__ veut dire « c’est pourquoi elle a décidé », pas « elle aussi ».',
      'In formal speech, some words at the start of a sentence trigger subject inversion: __peut-être__, __sans doute__, __aussi__ (meaning « so »), __à peine__, __encore__ (meaning « but it still has to »). You then hear the verb, then the subject: __Peut-être viendra-t-il__, __Sans doute a-t-il raison__.\n\nThe little [t] in __-t-il__, __-t-elle__ is clearly audible: it tells you who acts. In everyday speech you would rather say __Peut-être qu’il viendra__, __Il a sans doute raison__. Careful: __Aussi a-t-elle décidé__ means « that is why she decided », not « she too ».',
    ],
  ],
  goal: ['Comprendre l’inversion soutenue et le sens des mots qui la déclenchent.', 'Understand formal inversion and the words that trigger it.'],
  examples: [
    ex('Peut-être viendra-t-il demain.', 'Peut-être {viendra-t-il} demain.', ['Soutenu ; au quotidien : « peut-être qu’il viendra ».', 'Formal; everyday: « peut-être qu’il viendra ».'], 'Peut-être qu’il viendra demain.'),
    ex('Sans doute a-t-il raison.', 'Sans doute {a-t-il} raison.', ['= Il a probablement raison.', '= He is probably right.']),
    ex('À peine était-il arrivé qu’il repartait.', 'À peine {était-il} arrivé qu’il repartait.', ['Juste après son arrivée.', 'Right after he arrived.']),
  ],
  items: [
    pick('Peut-être viendra-t-elle ce soir.', ['Il', 'Elle'], 1, 'Peut-être viendra-{t-elle} ce soir.', [
      'On entend [tɛl] : c’est « elle ».', 'You hear [tɛl]: it is « elle ».',
    ], ['Qui viendra peut-être ?', 'Who may come?']),
    pick('Sans doute a-t-il oublié.', ['Il n’a sûrement pas oublié', 'Il a probablement oublié'], 1, 'Sans doute {a-t-il} oublié.', [
      'Sans doute = probablement.', 'Sans doute = probably.',
    ], ['Que veut dire la phrase ?', 'What does the sentence mean?']),
    pick('Aussi a-t-elle décidé de partir.', ['Également', 'Donc, c’est pourquoi'], 1, '{Aussi a-t-elle} décidé de partir.', [
      'En tête de phrase, avec inversion, « aussi » veut dire « donc ».', 'At the start, with inversion, « aussi » means « so ».',
    ], ['Que signifie « aussi » ici ?', 'What does « aussi » mean here?']),
    pick('À peine était-il sorti qu’il s’est mis à pleuvoir.', ['Juste après sa sortie', 'Longtemps après', 'Avant qu’il sorte'], 0, 'À peine {était-il} sorti qu’il s’est mis à pleuvoir.', [
      'À peine… que : la deuxième action suit immédiatement.', 'À peine… que: the second action follows at once.',
    ], ['Quand a-t-il commencé à pleuvoir ?', 'When did it start raining?']),
    pick('Je reviendrai, dit-il.', ['Une femme', 'Un homme'], 1, 'Je reviendrai, {dit-il}.', [
      'Dans une incise, on inverse : « dit-il », un homme.', 'In a reporting clause you invert: « dit-il », a man.',
    ], ['Qui parle ?', 'Who is speaking?']),
    fill('Peut-être a-t-il raison.', 'Peut-être a-t-___ raison.', 'il', 'Peut-être a-{t-il} raison.', [
      'A-t-il : le t s’intercale pour la prononciation.', 'A-t-il: the t is inserted for pronunciation.',
    ]),
    fill('Sans doute viendront-ils demain.', 'Sans doute ___-ils demain.', 'viendront', 'Sans doute {viendront-ils} demain.', [
      'Viendront-ils : verbe puis sujet.', 'Viendront-ils: verb, then subject.',
    ]),
    fill('Encore faut-il le prouver.', 'Encore ___-il le prouver.', 'faut', '{Encore faut-il} le prouver.', [
      'Encore faut-il = mais il faut aussi, ce n’est pas acquis.', 'Encore faut-il = but it still has to be proven.',
    ]),
    situation(REFORME, 'La réforme est-elle déjà votée ?', ['Oui', 'Non, elle doit encore l’être', 'Elle a été rejetée'], 1, REFORME_SHOW, [
      '« Encore faut-il qu’elle soit votée » : ce n’est pas encore fait.', '« It still has to be voted on »: not done yet.',
    ]),
    situation(REFORME, 'Quand pourrait-elle être votée ?', ['Demain', 'Jamais', 'Peut-être au printemps'], 2, REFORME_SHOW, [
      '« Peut-être le sera-t-elle au printemps », mais sans certitude.', '« Perhaps it will be in spring », without certainty.',
    ]),
  ],
  takeaway: [
    'Peut-être, sans doute, aussi (= donc), à peine, encore (= mais il faut) + inversion : registre soutenu. Le [t] de -t-il / -t-elle dit qui agit.',
    'Peut-être, sans doute, aussi (= so), à peine, encore (= but it still has to) + inversion: formal register. The [t] in -t-il / -t-elle says who acts.',
  ],
});
