// Flyers: a campaign drawn as a picture, ready to post or print. Everything on
// the flyer comes from the campaign itself (its words, dates, price, theme and
// picture), so a flyer is never out of step with the site.
//
// Drawn on a canvas, at the exact size of each format; the admin console shows
// the same canvas smaller and downloads it as a PNG.
import { COPY } from '../../../promo/copy';
import { THEMES, dateRange, fmtDay, priceOf, weeksBetween, type Lang, type Promotion } from '../../../promo/model';

export type FlyerFormat = 'square' | 'story' | 'landscape' | 'a4';

export const FLYER_FORMATS: Record<FlyerFormat, { w: number; h: number; name: string; use: string }> = {
  square: { w: 1080, h: 1080, name: 'Square', use: 'Instagram and Facebook posts, WhatsApp' },
  story: { w: 1080, h: 1920, name: 'Story', use: 'Instagram, Facebook and WhatsApp stories, TikTok' },
  landscape: { w: 1200, h: 628, name: 'Landscape', use: 'Facebook and LinkedIn links, email headers' },
  a4: { w: 1240, h: 1754, name: 'A4 poster', use: 'Printing (A4, 150 dpi) and PDF' },
};

const WORDS: Record<Lang, { limited: (n: number) => string; before: (d: string) => string; scan: string; free: string; site: string }> = {
  en: { limited: n => `Limited to ${n} seats`, before: d => `Register before ${d}`, scan: 'Scan to register', free: 'Free', site: 'learnfrenchwithnatives.com' },
  fr: { limited: n => `${n} places seulement`, before: d => `Inscriptions jusqu’au ${d}`, scan: 'Scannez pour réserver', free: 'Gratuit', site: 'learnfrenchwithnatives.com' },
};

const DISPLAY = '"Plus Jakarta Sans", "Inter", system-ui, sans-serif';
const SANS = '"Inter", system-ui, sans-serif';

export interface FlyerAssets {
  /** The campaign's picture, when it has one. */
  image: HTMLImageElement | null;
  logo: HTMLImageElement | null;
  /** The QR code that leads to the campaign's page. */
  qr: HTMLCanvasElement | null;
}

/** Loads a picture for the canvas; null when it cannot be loaded. */
export function loadImage(src: string | null): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** The fonts of the site, loaded before anything is drawn (a canvas does not wait for them). */
export async function flyerFontsReady(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load(`800 64px ${DISPLAY}`), document.fonts.load(`700 32px ${DISPLAY}`),
      document.fonts.load(`400 32px ${SANS}`), document.fonts.load(`600 32px ${SANS}`), document.fonts.load(`700 32px ${SANS}`),
    ]);
  } catch { /* the fallback fonts are used */ }
}

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Breaks a text into lines no wider than `max`. */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/[ \t\n]+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** The largest size, from `from` down to `to`, at which a text fits in `maxLines` lines. */
function fit(ctx: CanvasRenderingContext2D, text: string, font: (size: number) => string, max: number, maxLines: number, from: number, to: number): { size: number; lines: string[] } {
  for (let size = from; size >= to; size -= 2) {
    ctx.font = font(size);
    const lines = wrap(ctx, text, max);
    if (lines.length <= maxLines && lines.every(l => ctx.measureText(l).width <= max)) return { size, lines };
  }
  ctx.font = font(to);
  const lines = wrap(ctx, text, max).slice(0, maxLines);
  return { size: to, lines };
}

/** A picture drawn to cover a rectangle, cropped around its centre. */
function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, focusY = 0.4) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale, sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = Math.max(0, Math.min(img.naturalHeight - sh, (img.naturalHeight - sh) * focusY));
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/**
 * Draws the flyer of a campaign on a canvas of the format's size.
 *
 * The text is measured first and sized to fit: the footer (button, address,
 * QR code) sits at the bottom, the price just above it, and the title, the
 * sentence and the facts above the price. The picture takes what is left.
 */
export function drawFlyer(canvas: HTMLCanvasElement, promo: Promotion, lang: Lang, format: FlyerFormat, assets: FlyerAssets) {
  const { w: W, h: H } = FLYER_FORMATS[format];
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const theme = THEMES[promo.theme] || THEMES.navy;
  const tidy = (t: string | null) => (t && lang === 'fr' ? t.replace(/ ([:;!?»])/g, '\u00a0$1').replace(/« /g, '«\u00a0') : t);
  const raw = promo.text[lang];
  const words = { ...raw, title: tidy(raw.title), tagline: tidy(raw.tagline), schedule: tidy(raw.schedule) };
  const copy = COPY[lang];
  const fw = WORDS[lang];
  const wide = format === 'landscape';
  const tall = format === 'story' || format === 'a4';
  // One unit: everything scales with the format.
  const u = wide ? H / 628 : W / 1080;
  const px = (n: number) => Math.round(n * u);
  const P = px(wide ? 44 : format === 'a4' ? 84 : 64);
  const image = assets.image;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // ── Sizes that do not depend on the text ──
  const logoSize = px(wide ? 52 : 64);
  const brandH = logoSize + px(16);
  const imageW = image && wide ? Math.round(W * 0.42) : 0;
  const textX = P;
  const textW = wide ? W - imageW - P - px(image ? 24 : 44) : W - 2 * P;
  const hasButton = promo.registration.mode !== 'none';
  const hasQr = !!assets.qr && hasButton;
  const qrSize = px(wide ? 112 : format === 'a4' ? 210 : format === 'story' ? 200 : 164);
  const ctaSize = wide ? 23 : tall ? 38 : 32;
  const ctaH = px(ctaSize * 2.25);
  const siteSize = wide ? 17 : tall ? 28 : 24;
  const qrPad = px(12);
  const qrLabelH = tall && hasQr ? px(46) : 0;
  const footH = Math.max(hasQr ? qrSize + 2 * qrPad + qrLabelH + px(12) : 0, (hasButton ? ctaH + px(wide ? 16 : 26) : 0) + px(siteSize) + px(wide ? 20 : 30));
  const footY = H - P - footH;

  const price = priceOf(promo, lang);
  const priceSize = wide ? 50 : tall ? 92 : 76;
  const priceGap = px(wide ? 20 : 38);
  // The top of the price figures: nothing of the text above may go lower.
  const textBottom = price ? footY - priceGap - px(priceSize * 0.82) - px(wide ? 14 : 30) : footY - px(wide ? 18 : 40);
  const minTop = image && !wide ? Math.round(H * (tall ? 0.3 : 0.27)) : P + brandH + px(wide ? 26 : 56);

  // ── The text, sized to the room there is ──
  const kindSize = wide ? 18 : tall ? 26 : 24;
  const kind = `${copy.kinds[promo.kind]}${promo.level ? `  ·  ${promo.level}` : ''}`.toUpperCase();
  const facts: string[] = [];
  const dates = dateRange(promo.class_starts_on, promo.class_ends_on, lang);
  const weeks = weeksBetween(promo.class_starts_on, promo.class_ends_on);
  if (dates) facts.push(weeks ? `${dates}  ·  ${copy.weeks(weeks)}` : (promo.class_ends_on ? dates : `${copy.starts} ${fmtDay(promo.class_starts_on, lang)}`));
  if (words.schedule) facts.push(words.schedule);
  if (promo.seats) facts.push(fw.limited(promo.seats.limit));
  if (promo.ends_at) facts.push(fw.before(new Date(promo.ends_at).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-GB', { day: 'numeric', month: 'long' })));

  const tagSize = wide ? 22 : tall ? 38 : 32;
  const factSize = wide ? 20 : tall ? 34 : 28;
  const titleFont = (s: number) => `800 ${px(s)}px ${DISPLAY}`;
  const gapKind = px(wide ? 8 : 14), gapTitle = px(wide ? 12 : 22), gapTag = px(wide ? 10 : 22);
  const tagLead = px(tagSize * 1.36), factLead = px(factSize * 1.6);

  interface Plan { title: { size: number; lines: string[] }; tag: string[]; facts: string[]; height: number }
  const plan = (titleFrom: number, titleLines: number, tagLines: number, factCount: number): Plan => {
    const title = fit(ctx, words.title || '', titleFont, textW, titleLines, titleFrom, wide ? 30 : 44);
    ctx.font = `400 ${px(tagSize)}px ${SANS}`;
    // The sentence is shown whole or not at all: never cut in the middle.
    const all = words.tagline && tagLines ? wrap(ctx, words.tagline, textW) : [];
    const tag = all.length <= tagLines ? all : [];
    const shown = facts.slice(0, factCount);
    const height = px(kindSize) + gapKind + title.lines.length * px(title.size * 1.1)
      + (tag.length ? gapTitle + tag.length * tagLead : 0)
      + (shown.length ? gapTag + shown.length * factLead : 0);
    return { title, tag, facts: shown, height };
  };
  // From the most generous layout to the tightest, the first that fits.
  const room = textBottom - minTop;
  const titleMax = wide ? 62 : tall ? 104 : 88;
  const tries: [number, number, number, number][] = [
    [titleMax, 3, 3, 4], [titleMax, 3, 3, 3], [titleMax * 0.88, 3, 3, 4], [titleMax * 0.88, 3, 3, 3], [titleMax * 0.78, 3, 3, 3],
    [titleMax * 0.78, 3, 3, 2], [titleMax * 0.7, 3, 3, 2], [titleMax * 0.7, 3, 3, 1], [titleMax * 0.7, 3, 0, 3], [titleMax * 0.7, 3, 0, 2],
    [titleMax * 0.62, 3, 0, 2], [titleMax * 0.62, 3, 0, 1], [titleMax * 0.56, 3, 0, 0],
  ];
  const tight = tries[tries.length - 1];
  let chosen = plan(Math.round(tight[0]), tight[1], tight[2], tight[3]);
  for (const t of tries) {
    const p = plan(Math.round(t[0]), wide ? Math.min(2, t[1]) : t[1], wide ? Math.min(2, t[2]) : t[2], wide ? Math.min(3, t[3]) : t[3]);
    if (p.height <= room) { chosen = p; break; }
  }
  // With a picture the text sits right above the price; without one it is centred in its room.
  const textTop = image && !wide ? textBottom - chosen.height : Math.round(minTop + Math.max(0, room - chosen.height) * (wide ? 0.5 : 0.42));

  // ── Background: the dark tone, lit by the light tone from the top; the
  //    picture fades into it (no hard edge), under a veil where the text sits ──
  ctx.fillStyle = theme.b;
  ctx.fillRect(0, 0, W, H);
  const light = ctx.createRadialGradient(W * 0.82, H * 0.04, 0, W * 0.82, H * 0.04, Math.max(W, H) * 0.95);
  light.addColorStop(0, alpha(theme.a, 0.98));
  light.addColorStop(0.55, alpha(theme.a, 0.45));
  light.addColorStop(1, alpha(theme.a, 0));
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, W, H);

  /** The picture, drawn on its own layer and faded to nothing along one side. */
  const fadedPicture = (img: HTMLImageElement, x: number, y: number, w: number, h: number, fade: [number, number, number, number], solidUntil: number) => {
    const layer = document.createElement('canvas');
    layer.width = w;
    layer.height = h;
    const l = layer.getContext('2d');
    if (!l) return;
    cover(l, img, 0, 0, w, h, 0.28);
    l.globalCompositeOperation = 'destination-in';
    const mask = l.createLinearGradient(...fade);
    mask.addColorStop(0, 'rgba(0, 0, 0, 1)');
    mask.addColorStop(Math.max(0, Math.min(0.95, solidUntil)), 'rgba(0, 0, 0, 1)');
    mask.addColorStop(1, 'rgba(0, 0, 0, 0)');
    l.fillStyle = mask;
    l.fillRect(0, 0, w, h);
    ctx.drawImage(layer, x, y);
  };

  if (image && wide) {
    fadedPicture(image, W - imageW, 0, imageW, H, [imageW, 0, 0, 0], 0.45);
  } else if (image) {
    // The picture runs from the top to a little under where the text starts.
    const ih = Math.min(H, textTop + px(150));
    const fadeFrom = Math.max(ih * 0.4, textTop - px(240));
    fadedPicture(image, 0, 0, W, ih, [0, 0, 0, ih], fadeFrom / ih);
    // A veil at the top keeps the brand and the badge readable, another under the text.
    const top = ctx.createLinearGradient(0, 0, 0, ih * 0.32);
    top.addColorStop(0, alpha(theme.b, 0.55));
    top.addColorStop(1, alpha(theme.b, 0));
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, W, ih * 0.32);
    // Down to the bottom of the flyer, so the veil never ends on a visible edge.
    const veil = ctx.createLinearGradient(0, fadeFrom, 0, H);
    veil.addColorStop(0, alpha(theme.b, 0));
    veil.addColorStop(Math.min(0.95, (ih - fadeFrom) / (H - fadeFrom)), alpha(theme.b, 0.8));
    veil.addColorStop(1, alpha(theme.b, 0.55));
    ctx.fillStyle = veil;
    ctx.fillRect(0, fadeFrom, W, H - fadeFrom);
  } else {
    // No picture: two soft circles of the accent colour.
    for (const [cx, cy, r, a] of [[W * 0.9, H * 0.08, W * 0.55, 0.26], [W * 0.02, H * 0.98, W * 0.6, 0.14]] as const) {
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      glow.addColorStop(0, alpha(theme.accent, a));
      glow.addColorStop(1, alpha(theme.accent, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ── Brand, top left ──
  ctx.font = `800 ${px(wide ? 21 : 26)}px ${DISPLAY}`;
  const brandName = 'Learn French with Natives';
  const brandW = logoSize + px(40) + ctx.measureText(brandName).width;
  rounded(ctx, P, P, brandW, brandH, brandH / 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.fill();
  if (assets.logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(P + px(8) + logoSize / 2, P + brandH / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(assets.logo, P + px(8), P + (brandH - logoSize) / 2, logoSize, logoSize);
    ctx.restore();
  }
  ctx.fillStyle = '#0b1733';
  ctx.textBaseline = 'middle';
  ctx.fillText(brandName, P + logoSize + px(20), P + brandH / 2 + px(1));
  ctx.textBaseline = 'alphabetic';

  // ── Badge, top right ──
  const badge = words.badge || (price?.percent ? `-${price.percent} %` : null);
  if (badge) {
    ctx.font = `800 ${px(wide ? 30 : 40)}px ${DISPLAY}`;
    const bw = ctx.measureText(badge).width + px(52);
    const bh = px(wide ? 62 : 80);
    const bx = W - P - bw;
    const by = P + (brandH - bh) / 2;
    ctx.save();
    ctx.translate(bx + bw / 2, by + bh / 2);
    ctx.rotate(0.05);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 24 * u;
    ctx.shadowOffsetY = 8 * u;
    rounded(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2);
    ctx.fillStyle = theme.accent;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = theme.b;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badge, 0, px(2));
    ctx.restore();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // ── Text ──
  let y = textTop + px(kindSize);
  ctx.font = `700 ${px(kindSize)}px ${SANS}`;
  ctx.fillStyle = theme.accent;
  ctx.save();
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${px(2.4)}px`;
  ctx.fillText(kind, textX, y);
  ctx.restore();
  y += gapKind;

  ctx.fillStyle = '#ffffff';
  ctx.font = titleFont(chosen.title.size);
  const titleLead = px(chosen.title.size * 1.1);
  for (const line of chosen.title.lines) { y += titleLead; ctx.fillText(line, textX, y - px(chosen.title.size * 0.16)); }

  if (chosen.tag.length) {
    y += gapTitle;
    ctx.font = `400 ${px(tagSize)}px ${SANS}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (const line of chosen.tag) { y += tagLead; ctx.fillText(line, textX, y - px(tagSize * 0.3)); }
  }

  if (chosen.facts.length) {
    y += gapTag;
    ctx.font = `600 ${px(factSize)}px ${SANS}`;
    for (const fact of chosen.facts) {
      y += factLead;
      const base = y - px(factSize * 0.42);
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.arc(textX + px(8), base - px(factSize * 0.32), px(6), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      let line = fact;
      const max = textW - px(34);
      while (ctx.measureText(line).width > max && line.length > 8) line = `${line.slice(0, -2).trimEnd()}…`;
      ctx.fillText(line, textX + px(30), base);
    }
  }

  // ── Price, just above the footer ──
  if (price) {
    const py = footY - priceGap;
    let x = textX;
    if (price.was) {
      ctx.font = `600 ${px(priceSize * 0.42)}px ${SANS}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.fillText(price.was, x, py);
      const ww = ctx.measureText(price.was).width;
      ctx.fillRect(x - 2 * u, py - px(priceSize * 0.15), ww + 4 * u, Math.max(2, px(3)));
      x += ww + px(18);
    }
    ctx.font = `800 ${px(priceSize)}px ${DISPLAY}`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(price.now, x, py);
    x += ctx.measureText(price.now).width + px(16);
    if (words.price_note && !price.free) {
      ctx.font = `500 ${px(priceSize * 0.34)}px ${SANS}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.84)';
      let note = words.price_note;
      while (ctx.measureText(note).width > textX + textW - x && note.length > 6) note = `${note.slice(0, -2).trimEnd()}…`;
      ctx.fillText(note, x, py);
    }
  }

  // ── Footer: the button, the address, the QR code ──
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.fillRect(textX, footY, wide ? textW : W - 2 * P, Math.max(1, px(2)));
  if (hasButton) {
    const cta = words.cta || copy.cta[promo.kind];
    ctx.font = `700 ${px(ctaSize)}px ${SANS}`;
    const label = ctx.measureText(cta).width;
    const arrow = px(ctaSize * 0.42);
    const ctaW = px(ctaSize * 1.05) + label + px(ctaSize * 0.7) + 2 * arrow + px(ctaSize * 0.9);
    const ctaY = footY + px(wide ? 18 : 28);
    rounded(ctx, textX, ctaY, ctaW, ctaH, ctaH / 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.fillStyle = theme.b;
    ctx.textBaseline = 'middle';
    ctx.fillText(cta, textX + px(ctaSize * 1.05), ctaY + ctaH / 2 + px(1));
    ctx.textBaseline = 'alphabetic';
    // A small arrow after the words.
    const ax = textX + px(ctaSize * 1.05) + label + px(ctaSize * 0.7) + arrow, ay = ctaY + ctaH / 2;
    ctx.strokeStyle = theme.b;
    ctx.lineWidth = Math.max(2, px(3.2));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(ax - arrow, ay); ctx.lineTo(ax + arrow, ay);
    ctx.moveTo(ax + arrow * 0.25, ay - arrow * 0.7); ctx.lineTo(ax + arrow, ay); ctx.lineTo(ax + arrow * 0.25, ay + arrow * 0.7);
    ctx.stroke();
  }
  ctx.font = `600 ${px(siteSize)}px ${SANS}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.fillText(fw.site, textX, H - P - px(wide ? 2 : 6));

  if (hasQr) {
    const pad = qrPad;
    const qx = wide ? textX + textW - qrSize : W - P - qrSize;
    const qy = H - P - pad - qrLabelH - qrSize;
    rounded(ctx, qx - pad, qy - pad, qrSize + 2 * pad, qrSize + 2 * pad + qrLabelH, px(18));
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(assets.qr!, qx, qy, qrSize, qrSize);
    ctx.imageSmoothingEnabled = true;
    if (qrLabelH) {
      let size = 22;
      ctx.font = `700 ${px(size)}px ${SANS}`;
      while (ctx.measureText(fw.scan).width > qrSize && size > 12) { size -= 1; ctx.font = `700 ${px(size)}px ${SANS}`; }
      ctx.fillStyle = theme.b;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fw.scan, qx + qrSize / 2, qy + qrSize + qrLabelH / 2 + px(2));
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  }
}
