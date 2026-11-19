// C2 · Spontaneous speech: self-corrections, unfinished sentences, comme quoi, bref.
import { ear, ex, fill, pick, situation } from '../authoring';

const RDV = 'Alors, le rendez-vous, c’était jeudi, enfin non, vendredi, parce que jeudi il avait… bref, il était pas libre. Et finalement, il est même pas venu. Comme quoi !';
const RDV_SHOW = 'Alors, le rendez-vous, c’était jeudi, {enfin non, vendredi}, parce que jeudi il avait… {bref}, il était pas libre. Et finalement, il est même pas venu. {Comme quoi} !';

export default ear('l-oral-spontane', {
  rule: [
    ['Ce que la personne veut vraiment dire', 'What the speaker really means'],
    [
      'À l’oral spontané, on se corrige, on s’interrompt, on reformule. Il faut retenir **la dernière version** : __Il arrive lundi, enfin, mardi__ = mardi. Les mots de la correction : __enfin__, __enfin non__, __plutôt__, __je veux dire__, __non, attends__.\n\nD’autres petits mots organisent le discours : __bref__ (je résume, je saute les détails), __comme quoi__ (ce qui prouve que), et les phrases laissées en suspens, comme __Si tu savais…__ (c’est difficile à imaginer).',
      'In spontaneous speech, people correct themselves, break off, rephrase. Keep **the last version**: __Il arrive lundi, enfin, mardi__ = Tuesday. Correction words: __enfin__, __enfin non__, __plutôt__, __je veux dire__, __non, attends__.\n\nOther little words organise speech: __bref__ (in short, skipping details), __comme quoi__ (which goes to show), and sentences left hanging, like __Si tu savais…__ (you can’t imagine).',
    ],
  ],
  goal: ['Retenir la version corrigée et le sens des phrases inachevées.', 'Keep the corrected version and the meaning of unfinished sentences.'],
  examples: [
    ex('Il arrive lundi, enfin, mardi.', 'Il arrive lundi, {enfin, mardi}.', ['La correction l’emporte : mardi.', 'The correction wins: Tuesday.']),
    ex('Le voyage ? Si tu savais…', 'Le voyage ? {Si tu savais}…', ['= C’était incroyable, ou difficile.', '= You have no idea.']),
    ex('Comme quoi, tout est possible.', '{Comme quoi}, tout est possible.', ['= Ce qui prouve que.', '= Which goes to show.']),
  ],
  items: [
    pick('La réunion est à dix heures, enfin, à onze heures.', ['À dix heures', 'À onze heures'], 1, 'La réunion est à dix heures, {enfin, à onze heures}.', [
      'Après « enfin », la correction : onze heures.', 'After « enfin », the correction: eleven.',
    ], ['À quelle heure est la réunion ?', 'What time is the meeting?']),
    pick('Il est sympa, je veux dire, il est poli.', ['Il est très chaleureux', 'Il est poli, sans plus'], 1, 'Il est sympa, {je veux dire, il est poli}.', [
      'La reformulation corrige à la baisse : poli, sans plus.', 'The rephrasing tones it down: polite, no more.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    pick('Elle a gagné, alors que personne n’y croyait. Comme quoi…', ['Elle a triché', 'Ce qui prouve que tout est possible'], 1, 'Elle a gagné, alors que personne n’y croyait. {Comme quoi}…', [
      'Comme quoi : la conclusion à tirer de l’histoire.', 'Comme quoi: the lesson of the story.',
    ], ['Que veut dire « comme quoi » ?', 'What does « comme quoi » mean?']),
    pick('Le voyage ? Si tu savais…', ['Rien de spécial', 'Il s’est passé beaucoup de choses, souvent difficiles'], 1, 'Le voyage ? {Si tu savais}…', [
      'La phrase en suspens laisse imaginer beaucoup.', 'The unfinished sentence suggests a lot.',
    ], ['Que laisse entendre la personne ?', 'What is the speaker implying?']),
    pick('C’était lundi, non, plutôt mardi.', ['Lundi', 'Mardi'], 1, 'C’était lundi, {non, plutôt mardi}.', [
      'Plutôt : la correction l’emporte.', 'Plutôt: the correction wins.',
    ], ['Quel jour était-ce ?', 'Which day was it?']),
    fill('Bref, on a raté le train.', '___, on a raté le train.', ['Bref', 'bref'], '{Bref}, on a raté le train.', [
      'Bref : on passe les détails, voici l’essentiel.', 'In short: here is the gist.',
    ]),
    fill('Je veux dire, c’est pas si simple.', 'Je veux ___, c’est pas si simple.', 'dire', 'Je veux {dire}, c’est pas si simple.', [
      'Je veux dire : une reformulation.', 'I mean: a rephrasing.',
    ]),
    fill('Il a plu toute la journée. Comme quoi, la météo se trompe.', 'Il a plu toute la journée. Comme ___, la météo se trompe.', 'quoi', 'Il a plu toute la journée. Comme {quoi}, la météo se trompe.', [
      'Comme quoi = ce qui prouve que.', 'Which goes to show.',
    ]),
    situation(RDV, 'Quel jour était le rendez-vous ?', ['Jeudi', 'Vendredi', 'Samedi'], 1, RDV_SHOW, [
      '« Jeudi, enfin non, vendredi » : vendredi.', '« Thursday, no, Friday »: Friday.',
    ]),
    situation(RDV, 'Est-il venu ?', ['Oui', 'En retard', 'Non'], 2, RDV_SHOW, [
      '« Il est même pas venu ».', '« He did not even come ».',
    ]),
  ],
  takeaway: [
    'Enfin, enfin non, plutôt, je veux dire : retenez la dernière version. Bref résume, comme quoi tire une leçon, « si tu savais… » laisse imaginer.',
    'Enfin, enfin non, plutôt, je veux dire: keep the last version. Bref sums up, comme quoi draws a lesson, « si tu savais… » leaves the rest to imagination.',
  ],
});
