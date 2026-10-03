import { useState } from 'react';
import { ArrowRightOutlined, DownOutlined } from '@ant-design/icons';
import type { Lang } from './landingContent';
import { CURRENCY_LABELS, EXAM_PLANS, formatPlanPrice, PRICING_COPY, PRICING_CURRENCIES, type PricingCurrency } from './examPlanContent';
import study640 from '../../assets/landing/exam-study-v1-640.webp';
import study1000 from '../../assets/landing/exam-study-v1-1000.webp';

interface Props {
  lang: Lang;
  onRequest: (offer: string) => void;
  onDemo: () => void;
}

export default function ExamPricing({ lang, onRequest, onDemo }: Props) {
  const c = PRICING_COPY[lang];
  const [currency, setCurrency] = useState<PricingCurrency>('EUR');

  return (
    <section id="pricing" className="lp-section lp-pricing" aria-labelledby="lp-pricing-title">
      <div className="lp-wrap">
        <div className="lp-pricing-intro">
          <header className="lp-head is-left" data-reveal>
            <p className="lp-eyebrow">{c.eyebrow}</p>
            <h2 id="lp-pricing-title">{c.title}</h2>
            <p>{c.sub}</p>
          </header>
          <figure className="lp-pricing-photo" data-reveal>
            <img src={study1000} srcSet={`${study640} 640w, ${study1000} 1000w`} sizes="(max-width: 640px) 92vw, (max-width: 960px) 40vw, 400px" width="1000" height="750" alt={c.imageAlt} loading="lazy" decoding="async" />
          </figure>
        </div>

        <div className="lp-pricing-toolbar" data-reveal>
          <p>{c.currency}</p>
          <div className="lp-currency" role="group" aria-label={c.currency}>
            {PRICING_CURRENCIES.map(code => (
              <button key={code} type="button" aria-pressed={currency === code} onClick={() => setCurrency(code)}>{CURRENCY_LABELS[code]}</button>
            ))}
          </div>
        </div>

        <div className="lp-pricing-grid" data-reveal>
          {EXAM_PLANS.map((plan, i) => {
            const price = formatPlanPrice(plan.prices[currency], currency, lang);
            const offer = `${plan.name} — ${plan.days} ${c.duration} · ${price} · ${plan.written} ${c.written} + ${plan.oral} ${c.oral}`;
            return (
              <article key={plan.id} className={`lp-price-card${plan.id === 'intensive' ? ' is-featured' : ''}`} aria-labelledby={`lp-price-${plan.id}`}>
                <header>
                  <h3 id={`lp-price-${plan.id}`}>{plan.name}</h3>
                  <span className="lp-price-duration">{plan.days} {c.duration}</span>
                  <p>{c.descriptions[i]}</p>
                </header>
                <p className="lp-price-amount" aria-live="polite" aria-atomic="true">{price}</p>
                <dl className="lp-price-summary">
                  <div><dt>{c.reading}<span>{c.sequences}</span></dt><dd>{c.includedShort}</dd></div>
                  <div><dt>{c.listening}<span>{c.sequences}</span></dt><dd>{c.includedShort}</dd></div>
                  <div><dt>{c.writing}</dt><dd><b>{plan.written}</b> {c.creditUnit}</dd></div>
                  <div><dt>{c.speaking}</dt><dd><b>{plan.oral}</b> {c.creditUnit}</dd></div>
                </dl>
                <details className="lp-price-details">
                  <summary>
                    <span className="lp-details-more">{c.expand}</span>
                    <span className="lp-details-less">{c.collapse}</span>
                    <DownOutlined aria-hidden />
                  </summary>
                  <div className="lp-price-inclusions">
                    <h4>{c.tests}</h4>
                    <ul>
                      <li><span className="lp-price-skill" aria-hidden>CE</span><div><strong>{c.reading}</strong><p>{c.readingDetail}</p></div></li>
                      <li><span className="lp-price-skill" aria-hidden>CO</span><div><strong>{c.listening}</strong><p>{c.listeningDetail}</p></div></li>
                    </ul>
                  </div>
                  <div className="lp-price-credits">
                    <h4>{c.interactive}</h4>
                    <ul>
                      <li><span className="lp-price-skill" aria-hidden>EE</span><div><strong>{c.writing}</strong><p>{c.writingDetail}</p></div></li>
                      <li><span className="lp-price-skill" aria-hidden>EO</span><div><strong>{c.speaking}</strong><p>{c.speakingDetail}</p></div></li>
                    </ul>
                  </div>
                </details>
                <button type="button" className={`lp-btn ${plan.id === 'intensive' ? 'lp-btn-primary' : 'lp-btn-ghost'}`} onClick={() => onRequest(offer)} aria-label={`${c.cta} : ${plan.name}`}>{c.cta}<ArrowRightOutlined /></button>
              </article>
            );
          })}
        </div>
        <p className="lp-pricing-credit-note">{c.creditNote}</p>

        <details className="lp-price-comparison">
          <summary>{c.compare}</summary>
          <div className="lp-price-table-scroll" role="region" aria-label={c.compare} tabIndex={0}>
            <table>
              <caption className="lp-visually-hidden">{c.compare}</caption>
              <thead><tr><th scope="col">{c.offer}</th>{PRICING_CURRENCIES.map(code => <th scope="col" key={code}>{CURRENCY_LABELS[code]}</th>)}<th scope="col">{c.credits}</th></tr></thead>
              <tbody>{EXAM_PLANS.map(plan => (
                <tr key={plan.id}>
                  <th scope="row">{plan.name}<span>{plan.days} {c.duration}</span></th>
                  {PRICING_CURRENCIES.map(code => <td key={code}>{formatPlanPrice(plan.prices[code], code, lang)}</td>)}
                  <td><span>{plan.written} {c.written}</span><span>{plan.oral} {c.oral}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </details>
        <div className="lp-pricing-note">
          <p>{c.note}</p>
          <button type="button" onClick={onDemo}>{c.teacherCta}<ArrowRightOutlined /></button>
        </div>
      </div>
    </section>
  );
}
