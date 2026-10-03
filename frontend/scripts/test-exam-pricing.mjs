import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/components/Landing/examPlanContent.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const { EXAM_PLANS, PRICING_CURRENCIES, formatPlanPrice, PRICING_COPY } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const expected = [
  ['Sprint', 7, 6, 6, [9.99, 14.99, 10.99, 6500]],
  ['Intensive', 30, 28, 28, [24.99, 34.99, 26.99, 16500]],
  ['Mastery', 90, 56, 56, [59.99, 84.99, 64.99, 39500]],
];
assert.equal(EXAM_PLANS.length, expected.length);
for (const [index, [name, days, written, oral, amounts]] of expected.entries()) {
  const plan = EXAM_PLANS[index];
  assert.deepEqual([plan.name, plan.days, plan.written, plan.oral], [name, days, written, oral]);
  assert.deepEqual(PRICING_CURRENCIES.map(currency => plan.prices[currency]), amounts);
}
const normalize = value => value.replace(/\s/g, ' ');
assert.equal(normalize(formatPlanPrice(9.99, 'EUR', 'fr')), '9,99 €');
assert.equal(normalize(formatPlanPrice(14.99, 'CAD', 'fr')), '14,99 $CA');
assert.equal(normalize(formatPlanPrice(10.99, 'USD', 'fr')), '10,99 $US');
assert.equal(normalize(formatPlanPrice(39500, 'CFA', 'fr')), '39 500 F CFA');
assert.equal(formatPlanPrice(9.99, 'EUR', 'en'), '€9.99');
assert.equal(formatPlanPrice(14.99, 'CAD', 'en'), 'CA$14.99');
assert.equal(formatPlanPrice(10.99, 'USD', 'en'), 'US$10.99');
assert.equal(formatPlanPrice(39500, 'CFA', 'en'), 'F CFA 39,500');
for (const lang of ['en', 'fr']) {
  for (const key of ['reading', 'listening', 'writing', 'speaking', 'readingDetail', 'listeningDetail', 'writingDetail', 'speakingDetail', 'includedShort', 'sequences', 'creditUnit', 'expand', 'collapse']) {
    assert.ok(PRICING_COPY[lang][key]?.length > 0, `${lang}: missing ${key}`);
  }
}
if (process.argv.includes('--built')) {
  for (const [lang, path] of [['en', '../dist/index.html'], ['fr', '../dist/fr/index.html']]) {
    const html = await readFile(new URL(path, import.meta.url), 'utf8');
    const skillsIndex = html.indexOf('id="skills"');
    const pricingIndex = html.indexOf('id="pricing"');
    const methodIndex = html.indexOf('id="method"');
    assert.ok(skillsIndex >= 0 && skillsIndex < pricingIndex && pricingIndex < methodIndex, `${lang}: incorrect section order`);
    const pricingHtml = html.slice(pricingIndex, methodIndex);
    assert.equal((pricingHtml.match(/class="lp-price-card/g) || []).length, 3);
    const cardHtml = pricingHtml.slice(pricingHtml.indexOf('class="lp-pricing-grid"'), pricingHtml.indexOf('class="lp-pricing-credit-note"'));
    assert.equal((cardHtml.match(/<details class="lp-price-details">/g) || []).length, 3, `${lang}: each plan must have closed details by default`);
    assert.equal((cardHtml.match(/class="lp-price-summary"/g) || []).length, 3, `${lang}: each plan must keep its essential information visible`);
    for (const key of ['reading', 'listening', 'writing', 'speaking', 'includedShort', 'sequences', 'creditUnit']) {
      assert.equal(cardHtml.split(PRICING_COPY[lang][key]).length - 1, 6, `${lang}: ${key} must be preserved in every plan`);
    }
    assert.ok(html.includes('french-study-hero-v2-'), `${lang}: new hero missing`);
    console.log(`${lang}: all four skills in each pricing card, correct section order and new hero pre-rendered.`);
  }
}
console.log('Exam pricing: all 3 plans, 12 published amounts, credits and bilingual formatting passed.');
