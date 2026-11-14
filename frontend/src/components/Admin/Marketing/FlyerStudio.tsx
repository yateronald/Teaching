import React, { useEffect, useMemo, useRef, useState } from 'react';
import { App as AntApp, Button, QRCode, Segmented, Tooltip } from 'antd';
import { CopyOutlined, DownloadOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import { BRAND_LOGO } from '../../Landing/landingContent';
import { promoImage, type Lang, type Promotion } from '../../../promo/model';
import { FLYER_FORMATS, drawFlyer, flyerFontsReady, loadImage, type FlyerAssets, type FlyerFormat } from './flyer';
import { campaignUrl } from './marketingModel';

/* Administrator: the flyers of a campaign, drawn from the campaign itself, and its link to share. */

interface Props {
  promo: Promotion;
  /** False while the campaign is not on the site: the link would lead nowhere. */
  live: boolean;
}

const FORMATS = Object.keys(FLYER_FORMATS) as FlyerFormat[];

const FlyerStudio: React.FC<Props> = ({ promo, live }) => {
  const { message } = AntApp.useApp();
  const [format, setFormat] = useState<FlyerFormat>('square');
  const [lang, setLang] = useState<Lang>(promo.text.en.title && !promo.text.fr.title ? 'en' : 'fr');
  const [assets, setAssets] = useState<FlyerAssets | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const qrHost = useRef<HTMLDivElement | null>(null);
  const url = campaignUrl(promo.slug, lang);

  // The picture, the logo, the fonts and the QR code, once; then every change redraws at once.
  useEffect(() => {
    let alive = true;
    (async () => {
      const [image, logo] = await Promise.all([loadImage(promo.image ? promoImage(promo.image, 1200) : null), loadImage(BRAND_LOGO), flyerFontsReady()]);
      // The QR code is drawn by antd on its own canvas; it is copied onto the flyer.
      await new Promise(r => window.setTimeout(r, 60));
      const qr = qrHost.current?.querySelector('canvas') || null;
      if (alive) setAssets({ image, logo, qr });
    })();
    return () => { alive = false; };
  }, [promo.image, url]);

  const key = useMemo(() => JSON.stringify(promo), [promo]);
  useEffect(() => {
    if (!assets || !canvas.current) return;
    drawFlyer(canvas.current, promo, lang, format, assets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, key, lang, format]);

  const fileName = `${promo.slug}-${format}-${lang}.png`;
  const download = (which: FlyerFormat = format) => {
    if (!assets) return;
    // Drawn again on its own canvas, at full size, so the preview is not disturbed.
    const out = document.createElement('canvas');
    drawFlyer(out, promo, lang, which, assets);
    out.toBlob(blob => {
      if (!blob) { message.error('The flyer could not be created. Try again.'); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${promo.slug}-${which}-${lang}.png`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  };
  const downloadAll = () => FORMATS.forEach((f, i) => window.setTimeout(() => download(f), i * 350));
  const copy = () => navigator.clipboard?.writeText(url).then(() => message.success('Link copied'), () => message.error('The link could not be copied'));

  const f = FLYER_FORMATS[format];
  return (
    <div className="mk-flyers">
      <section className="og-card">
        <div className="og-card-head"><span className="og-card-title"><PictureOutlined />Flyer</span><span className="og-card-note">{f.w} × {f.h} px · PNG</span></div>
        <div className="og-card-body mk-flyer-body">
          <div className={`mk-flyer-stage is-${format}`}>
            <canvas ref={canvas} aria-label={`Flyer of the campaign, ${f.name} format`} role="img" />
            {!assets && <span className="mk-flyer-wait">Preparing the flyer…</span>}
          </div>
          <div className="mk-flyer-side">
            <div className="og-field"><label>Format</label>
              <div className="mk-formats">
                {FORMATS.map(k => (
                  <button key={k} type="button" className={format === k ? 'is-on' : ''} onClick={() => setFormat(k)} aria-pressed={format === k}>
                    <i className={`is-${k}`} aria-hidden /><span><strong>{FLYER_FORMATS[k].name}</strong><em>{FLYER_FORMATS[k].use}</em></span>
                  </button>
                ))}
              </div></div>
            <div className="og-field"><label>Language</label>
              <Segmented value={lang} onChange={v => setLang(v as Lang)} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} /></div>
            <div className="mk-flyer-actions">
              <Button type="primary" icon={<DownloadOutlined />} onClick={() => download()} disabled={!assets}>Download this flyer</Button>
              <Tooltip title="The four formats, in this language"><Button icon={<DownloadOutlined />} onClick={downloadAll} disabled={!assets}>All four formats</Button></Tooltip>
            </div>
            <small className="og-muted">The flyer is made from the campaign: change the campaign (title, dates, price, colour, picture) and the flyer follows. Saved as <code>{fileName}</code>.</small>
          </div>
        </div>
      </section>

      <section className="og-card">
        <div className="og-card-head"><span className="og-card-title"><LinkOutlined />Link to share</span>
          <span className="og-card-note">{live ? 'Opens the campaign and its registration form' : 'Works once the campaign is live'}</span></div>
        <div className="og-card-body mk-share">
          <div className="mk-qr"><QRCode value={url} size={168} type="canvas" bordered={false} errorLevel="M" color="#0b1733" bgColor="#ffffff" /></div>
          {/* The same code, large, for the flyers: copied onto their canvas. */}
          <div ref={qrHost} className="mk-qr-source" aria-hidden><QRCode value={url} size={440} type="canvas" bordered={false} errorLevel="M" color="#0b1733" bgColor="#ffffff" /></div>
          <div className="mk-share-main">
            <div className="mk-link"><code>{url}</code><Button icon={<CopyOutlined />} onClick={copy}>Copy</Button></div>
            <small className="og-muted">Paste it in an email, a WhatsApp message or a post. The QR code on the flyers leads to the same address. Registrations that come through it are counted as “Shared link”.</small>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FlyerStudio;
