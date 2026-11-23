// Countries for the sign-up form: ISO codes, named in the page's language by
// the browser (Intl.DisplayNames), sorted by name.
import type { Lang } from '../types';

const CODES = ('AF AX AL DZ AS AD AO AI AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW XK').split(' ');

const cache = new Map<Lang, { code: string; name: string }[]>();

export function countries(lang: Lang): { code: string; name: string }[] {
  const hit = cache.get(lang);
  if (hit) return hit;
  let names: Intl.DisplayNames | null = null;
  try { names = new Intl.DisplayNames([lang], { type: 'region' }); } catch { /* old browser: codes */ }
  const list = CODES.map(code => ({ code, name: names?.of(code) || code }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));
  cache.set(lang, list);
  return list;
}

/** The country of the browser's language setting (fr-CA → CA), if it is one we list. */
export function guessCountry(): string {
  if (typeof navigator === 'undefined') return '';
  for (const l of navigator.languages || [navigator.language]) {
    const m = /-([A-Z]{2})$/i.exec(l || '');
    if (m && CODES.includes(m[1].toUpperCase())) return m[1].toUpperCase();
  }
  return '';
}
