import { VERB_ROWS, type VerbId } from '../../verbCatalog';

type SimplePast = 'a' | 'i' | 'u' | 'in';
type Group = 1 | 2 | 3 | 'aux';
type Raw = [
  group: Group, present: string, futureStem: string, participle: string,
  pastStem: string, pastPattern: SimplePast, subjunctive: string,
  imperative?: string, presentParticiple?: string, auxiliary?: 'etre',
];

const FORMS = {
  etre: ["aux", "suis es est sommes êtes sont", "ser", "été", "f", "u", "sois sois soit soyons soyez soient", "sois soyons soyez", "étant"],
  avoir: ["aux", "ai as a avons avez ont", "aur", "eu", "e", "u", "aie aies ait ayons ayez aient", "aie ayons ayez", "ayant"],
  aller: [3, "vais vas va allons allez vont", "ir", "allé", "all", "a", "aille ailles aille allions alliez aillent", "va allons allez", undefined, "etre"],
  faire: [3, "fais fais fait faisons faites font", "fer", "fait", "f", "i", "fasse fasses fasse fassions fassiez fassent"],
  parler: [1, "parle parles parle parlons parlez parlent", "parler", "parlé", "parl", "a", "parle parles parle parlions parliez parlent"],
  aimer: [1, "aime aimes aime aimons aimez aiment", "aimer", "aimé", "aim", "a", "aime aimes aime aimions aimiez aiment"],
  finir: [2, "finis finis finit finissons finissez finissent", "finir", "fini", "fin", "i", "finisse finisses finisse finissions finissiez finissent"],
  prendre: [3, "prends prends prend prenons prenez prennent", "prendr", "pris", "pr", "i", "prenne prennes prenne prenions preniez prennent"],
  venir: [3, "viens viens vient venons venez viennent", "viendr", "venu", "v", "in", "vienne viennes vienne venions veniez viennent", undefined, undefined, "etre"],
  partir: [3, "pars pars part partons partez partent", "partir", "parti", "part", "i", "parte partes parte partions partiez partent", undefined, undefined, "etre"],
  pouvoir: [3, "peux peux peut pouvons pouvez peuvent", "pourr", "pu", "p", "u", "puisse puisses puisse puissions puissiez puissent", ""],
  vouloir: [3, "veux veux veut voulons voulez veulent", "voudr", "voulu", "voul", "u", "veuille veuilles veuille voulions vouliez veuillent", "veuille veuillons veuillez"],
  devoir: [3, "dois dois doit devons devez doivent", "devr", "dû", "d", "u", "doive doives doive devions deviez doivent"],
  savoir: [3, "sais sais sait savons savez savent", "saur", "su", "s", "u", "sache saches sache sachions sachiez sachent", "sache sachons sachez", "sachant"],
  dire: [3, "dis dis dit disons dites disent", "dir", "dit", "d", "i", "dise dises dise disions disiez disent"],
  voir: [3, "vois vois voit voyons voyez voient", "verr", "vu", "v", "i", "voie voies voie voyions voyiez voient"],
  lire: [3, "lis lis lit lisons lisez lisent", "lir", "lu", "l", "u", "lise lises lise lisions lisiez lisent"],
  ecrire: [3, "écris écris écrit écrivons écrivez écrivent", "écrir", "écrit", "écriv", "i", "écrive écrives écrive écrivions écriviez écrivent"],
  mettre: [3, "mets mets met mettons mettez mettent", "mettr", "mis", "m", "i", "mette mettes mette mettions mettiez mettent"],
  tenir: [3, "tiens tiens tient tenons tenez tiennent", "tiendr", "tenu", "t", "in", "tienne tiennes tienne tenions teniez tiennent"],
} satisfies Record<VerbId, Raw>;

const PRONOUNS = ['je', 'tu', 'il / elle', 'nous', 'vous', 'ils / elles'];
const IMPERFECT = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
const FUTURE = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];
const SIMPLE_PAST: Record<SimplePast, string[]> = {
  a: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'],
  i: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'],
  u: ['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'],
  in: ['ins', 'ins', 'int', 'înmes', 'întes', 'inrent'],
};
const SUBJUNCTIVE_ACCENT: Record<SimplePast, string> = { a: 'â', i: 'î', u: 'û', in: 'în' };

function simpleForms(id: VerbId) {
  const raw: Raw = FORMS[id];
  const [group, written, futureStem, participle, pastStem, pastPattern, subjunctive, imperative, presentParticiple, auxiliaryOverride] = raw;
  const auxiliary: 'etre' | 'avoir' = auxiliaryOverride ?? 'avoir';
  const present = written.split(' ');
  const stem = id === 'etre' ? 'ét' : present[3].slice(0, -3);
  const past = SIMPLE_PAST[pastPattern];
  const subjStem = pastStem + past[1].slice(0, -1);
  return {
    group, auxiliary, participle,
    present,
    imperfect: IMPERFECT.map(end => stem + end),
    future: FUTURE.map(end => futureStem + end),
    conditional: IMPERFECT.map(end => futureStem + end),
    subjunctive: subjunctive.split(' '),
    simplePast: past.map(end => pastStem + end),
    literarySubjunctive: [
      subjStem + 'sse', subjStem + 'sses', pastStem + SUBJUNCTIVE_ACCENT[pastPattern] + 't',
      subjStem + 'ssions', subjStem + 'ssiez', subjStem + 'ssent',
    ],
    imperative: imperative === '' ? [] : imperative?.split(' ') ?? [
      group === 1 ? present[1].slice(0, -1) : present[1], present[3], present[4],
    ],
    presentParticiple: presentParticiple ?? stem + 'ant',
  };
}

export type Form = [subject: string, form: string];

/** Add the pronoun appropriate to the form, including elision and agreement cues. */
export function subjectForms(forms: string[], { subjunctive = false, agreement = false } = {}): Form[] {
  return forms.map((form, i) => {
    const pronoun = agreement ? ['je (m.)', 'tu (m.)', 'il', 'nous (m. pl.)', 'vous (m. pl.)', 'ils'][i] : PRONOUNS[i];
    const elides = /^[aàâeéèêëiîïoôuùûühyœ]/i.test(form);
    if (!subjunctive) return [i === 0 && elides ? (agreement ? 'j’ (m.)' : 'j’') : pronoun, form];
    if (i === 0 && elides) return [agreement ? 'que j’ (m.)' : 'que j’', form];
    return [i === 2 || i === 5 ? pronoun.split(' / ').map(p => `qu’${p}`).join(' / ') : `que ${pronoun}`, form];
  });
}

/** Compound forms here use the ordinary active construction. */
export function conjugation(id: VerbId) {
  const verb = simpleForms(id);
  const aux = simpleForms(verb.auxiliary);
  const infinitive = VERB_ROWS.find(row => row[0] === id)![1];
  const auxiliaryName = verb.auxiliary === 'etre' ? 'être' : 'avoir';
  const agrees = verb.auxiliary === 'etre';
  const compound = (forms: string[]) => forms.map((form, i) => form + ' ' + verb.participle + (agrees && i >= 3 && forms.length === 6 ? 's' : ''));
  const presentPart = aux.presentParticiple + ' ' + verb.participle;
  const imperativeForms = (forms: string[]): Form[] => forms.map((form, i) => [
    agrees ? ['(tu, m.)', '(nous, m. pl.)', '(vous, m. pl.)'][i] : ['(tu)', '(nous)', '(vous)'][i],
    form,
  ]);
  const impersonal = (form: string): Form[] => [['—', form]];
  return {
    group: verb.group,
    agrees,
    forms: {
      present: subjectForms(verb.present),
      imperfect: subjectForms(verb.imperfect),
      perfect: subjectForms(compound(aux.present), { agreement: agrees }),
      pluperfect: subjectForms(compound(aux.imperfect), { agreement: agrees }),
      recent: subjectForms(simpleForms('venir').present.map(form => form + (/^[aeéêiîou]/.test(infinitive) ? ' d’' : ' de ') + infinitive)),
      near: subjectForms(simpleForms('aller').present.map(form => form + ' ' + infinitive)),
      future: subjectForms(verb.future),
      futurePerfect: subjectForms(compound(aux.future), { agreement: agrees }),
      conditional: subjectForms(verb.conditional),
      conditionalPast: subjectForms(compound(aux.conditional), { agreement: agrees }),
      subjunctive: subjectForms(verb.subjunctive, { subjunctive: true }),
      subjunctivePast: subjectForms(compound(aux.subjunctive), { subjunctive: true, agreement: agrees }),
      imperative: imperativeForms(verb.imperative),
      imperativePast: verb.imperative.length ? imperativeForms(aux.imperative.map((f, i) => f + ' ' + verb.participle + (agrees && i > 0 ? 's' : ''))) : [],
      infinitive: impersonal(infinitive),
      infinitivePast: impersonal(auxiliaryName + ' ' + verb.participle),
      presentParticiple: impersonal(verb.presentParticiple),
      pastParticiple: impersonal(verb.participle),
      compoundParticiple: impersonal(presentPart),
      gerund: impersonal('en ' + verb.presentParticiple),
      gerundPast: impersonal('en ' + presentPart),
      simplePast: subjectForms(verb.simplePast),
      pastAnterior: subjectForms(compound(aux.simplePast), { agreement: agrees }),
      literarySubjunctive: subjectForms(verb.literarySubjunctive, { subjunctive: true }),
      literarySubjunctivePast: subjectForms(compound(aux.literarySubjunctive), { subjunctive: true, agreement: agrees }),
    },
  };
}

export type FormId = keyof ReturnType<typeof conjugation>['forms'];

