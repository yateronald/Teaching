import React, { useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, DatePicker, Drawer, Input, InputNumber, Segmented, Select, Switch } from 'antd';
import {
  CalendarOutlined, CheckOutlined, GiftOutlined, LinkOutlined, NotificationOutlined, PictureOutlined, RocketOutlined,
  StopOutlined, TeamOutlined, FormOutlined, WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../../contexts/AuthContext';
import { call, errorText } from '../../Org/orgModel';
import { THEMES, isAiImage, promoImage, type Kind, type Lang, type ThemeId } from '../../../promo/model';
import { PromoCard } from '../../../promo/parts';
import { COPY } from '../../../promo/copy';
import {
  AUDIENCE_LABEL, KIND_HINT, KIND_LABEL, PICTURES, SEATS_DISPLAY_LABEL, blankCampaign, fieldsOf, seatsIn, seatsOnline, toPublic,
  type AiDraft, type Campaign, type CampaignFields,
} from './marketingModel';
import CampaignAi, { AiPictureMaker } from './CampaignAi';
import '../../Org/Org.css';
import './Marketing.css';

const en = (e: string) => e;
const KIND_ICON: Record<Kind, React.ReactNode> = { group_class: <TeamOutlined />, offer: <GiftOutlined />, event: <CalendarOutlined />, announcement: <NotificationOutlined /> };
const PLACES: { key: 'place_bar' | 'place_home' | 'place_flash' | 'place_learn'; name: string; text: string }[] = [
  { key: 'place_home', name: 'Home page', text: 'A card in the “Upcoming groups and current offers” section.' },
  { key: 'place_learn', name: 'Free courses', text: 'Beside the lessons and at the end of each one, for learners it fits.' },
  { key: 'place_bar', name: 'Top bar', text: 'One line across the top of every public page, with the time left.' },
  { key: 'place_flash', name: 'Flash pop-up', text: 'Once per visit, when the visitor shows interest: 30 s of reading, a second page, half a long page, or about to leave. On phones, a card from the bottom.' },
];

interface Props {
  open: boolean;
  /** The campaign to change; absent for a new one. */
  campaign?: Campaign | null;
  onClose: () => void;
  onSaved: (campaign: Campaign) => void;
}

/* Administrator: write or change a campaign, and see it as visitors will while typing. */
const CampaignEditor: React.FC<Props> = ({ open, campaign, onClose, onSaved }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [f, setF] = useState<CampaignFields>(blankCampaign);
  const [lang, setLang] = useState<Lang>('en');
  const [busy, setBusy] = useState<false | 'draft' | 'published' | 'save'>(false);
  const [err, setErr] = useState<string | null>(null);
  const [pictures, setPictures] = useState(false);

  // The selling points as typed, one per line, in each language: kept as typed while editing, cleaned when saved.
  const [highlightsText, setHighlightsText] = useState<Record<Lang, string>>({ en: '', fr: '' });
  // The form as it was before the AI wrote in it (for « Undo »), and the AI's art direction for a new picture.
  const [beforeAi, setBeforeAi] = useState<{ fields: CampaignFields; highlights: Record<Lang, string> } | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  useEffect(() => {
    if (!open) return;
    const base = campaign ? fieldsOf(campaign) : blankCampaign();
    setF(base);
    setHighlightsText({ en: base.highlights_en.join('\n'), fr: base.highlights_fr.join('\n') });
    setLang(campaign && !campaign.title_en && campaign.title_fr ? 'fr' : 'en');
    setErr(null);
    setPictures(false);
    setBeforeAi(null);
    setImagePrompt('');
  }, [open, campaign]);

  // The AI filled the campaign: every field, both languages.
  const applyDraft = (draft: AiDraft) => {
    setBeforeAi(prev => prev ?? { fields: f, highlights: highlightsText });
    const next = { ...draft.fields };
    // A picture already made by the AI stays when the campaign is only changed.
    if (isAiImage(f.image_key)) next.image_key = f.image_key;
    setF(next);
    setHighlightsText({ en: next.highlights_en.join('\n'), fr: next.highlights_fr.join('\n') });
    setImagePrompt(draft.image_prompt);
    setPictures(false);
  };
  const undoAi = () => {
    if (!beforeAi) return;
    setF(beforeAi.fields);
    setHighlightsText(beforeAi.highlights);
    setBeforeAi(null);
  };

  const set = (patch: Partial<CampaignFields>) => setF(v => ({ ...v, ...patch }));
  const word = (field: 'title' | 'tagline' | 'description' | 'cta' | 'badge' | 'schedule' | 'price_note') => `${field}_${lang}` as keyof CampaignFields;
  const text = (field: Parameters<typeof word>[0]) => (f[word(field)] as string | null) || '';
  const setText = (field: Parameters<typeof word>[0]) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set({ [word(field)]: e.target.value || null } as Partial<CampaignFields>);
  const highlightsKey = `highlights_${lang}` as 'highlights_en' | 'highlights_fr';

  const hasClass = f.kind === 'group_class' || f.kind === 'event';
  const other: Lang = lang === 'en' ? 'fr' : 'en';
  const missing = [
    !(f.title_en || f.title_fr) && 'a title',
    f.ends_at && f.ends_at <= f.starts_at && 'an end after the start',
    f.registration_mode === 'link' && !/^(https:\/\/|\/)\S+$/i.test(f.cta_url || '') && 'a link that starts with https://',
    f.price_regular !== null && f.price_promo !== null && f.price_promo > f.price_regular && 'a campaign price below the regular price',
    !!f.seat_limit && f.seats_offline > f.seat_limit && 'no more seats taken outside the site than seats in the group',
  ].filter(Boolean) as string[];

  // The people registered on the site (counted by the server), those outside it (typed here), and what visitors see.
  const online = campaign ? seatsOnline(campaign) : 0;
  const seats = seatsIn(f, online);
  const preview = useMemo(() => toPublic(f, { slug: campaign?.slug, seats_online: online }), [f, campaign, online]);
  // The very words of the site, in the language being edited.
  const seen = seats.full ? `“${COPY[lang].full}”` : seats.shown ? `“${COPY[lang].seatsOf(seats.left ?? 0, seats.limit)}”` : 'nothing about the seats';
  const display = f.seats_display === 'never' ? 'never' : 'auto';

  const save = async (status?: 'draft' | 'published') => {
    setBusy(status || 'save');
    setErr(null);
    try {
      const r = campaign
        ? await call<{ promotion: Campaign }>(apiCall, `/admin/promotions/${campaign.id}`, 'PUT', f)
        : await call<{ promotion: Campaign }>(apiCall, '/admin/promotions', 'POST', { ...f, status });
      message.success(campaign ? 'Campaign saved' : status === 'published' ? 'Campaign published: it is on the site now' : 'Draft saved');
      onSaved(r.promotion);
    } catch (e) { setErr(errorText(e, en)); } finally { setBusy(false); }
  };

  return (
    <Drawer open={open} onClose={onClose} width="min(1180px, 100vw)" rootClassName="og-drawer mk-drawer" destroyOnHidden
      title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><RocketOutlined />{campaign ? 'Edit the campaign' : 'New campaign'}</span>}
      footer={<div className="og-foot">
        <span className="og-foot-note">{missing.length ? `Still needed: ${missing.join(', ')}.` : campaign ? 'Changes appear on the site within a minute.' : 'A draft stays private. Publishing puts it on the site at its start date.'}</span>
        <Button onClick={onClose}>Cancel</Button>
        {campaign
          ? <Button type="primary" onClick={() => save()} loading={busy === 'save'} disabled={missing.length > 0}>Save</Button>
          : <>
            <Button onClick={() => save('draft')} loading={busy === 'draft'} disabled={missing.length > 0 || !!busy}>Save as draft</Button>
            <Button type="primary" onClick={() => save('published')} loading={busy === 'published'} disabled={missing.length > 0 || !!busy}>Publish</Button>
          </>}
      </div>}>
      <div className="mk-editor">
        <div className="og-form">
          {/* 0 ── The AI writer */}
          <CampaignAi editing={!!campaign} fields={f} registeredOnSite={online} onDraft={applyDraft} onPicture={key => set({ image_key: key })} onUndo={beforeAi ? undoAi : undefined} />

          {/* 1 ── Kind */}
          <section className="og-section">
            <div className="og-section-title"><span className="og-step-n">1</span>What are you announcing?</div>
            <div className="og-kinds mk-kinds">
              {(Object.keys(KIND_LABEL) as Kind[]).map(k => (
                <button key={k} type="button" className={`og-kind${f.kind === k ? ' is-on' : ''}`} onClick={() => set({ kind: k })} aria-pressed={f.kind === k}>
                  <span className="og-kind-ic">{KIND_ICON[k]}</span>
                  <span className="og-kind-text"><strong>{KIND_LABEL[k]}</strong><em>{KIND_HINT[k]}</em></span>
                  <span className="og-kind-tick"><CheckOutlined /></span>
                </button>
              ))}
            </div>
          </section>

          {/* 2 ── Words */}
          <section className="og-section">
            <div className="og-section-title"><span className="og-step-n">2</span>What visitors read
              <span style={{ flex: 1 }} />
              <Segmented size="small" value={lang} onChange={v => setLang(v as Lang)} options={[
                { value: 'en', label: `English${f.title_en ? ' ✓' : ''}` }, { value: 'fr', label: `Français${f.title_fr ? ' ✓' : ''}` },
              ]} />
            </div>
            <small className="og-muted">Write in one language or in both. A field left empty in one language shows the other language’s text on that side of the site.</small>
            <div className="og-field"><label>Title</label>
              <Input value={text('title')} onChange={setText('title')} maxLength={140} showCount autoFocus={!campaign}
                placeholder={(f[`title_${other}` as 'title_en'] as string | null) || (lang === 'fr' ? 'ex. Groupe TCF Canada : objectif NCLC 7' : 'e.g. TCF Canada group: reach NCLC 7')} /></div>
            <div className="og-field"><label>One sentence under the title <em>optional</em></label>
              <Input value={text('tagline')} onChange={setText('tagline')} maxLength={220}
                placeholder={(f[`tagline_${other}` as 'tagline_en'] as string | null) || (lang === 'fr' ? 'ex. Huit semaines en petit groupe pour réussir les quatre épreuves.' : 'e.g. Eight weeks in a small group to succeed in all four papers.')} /></div>
            <div className="og-field"><label>Description <em>optional, shown when the campaign is opened</em></label>
              <Input.TextArea value={text('description')} onChange={setText('description')} maxLength={4000} autoSize={{ minRows: 3, maxRows: 8 }}
                placeholder={(f[`description_${other}` as 'description_en'] as string | null) || 'Who it is for, how the classes run, what is included. Leave an empty line between two paragraphs.'} /></div>
            <div className="og-field"><label>Selling points <em>one per line, up to 6</em></label>
              <Input.TextArea value={highlightsText[lang]} autoSize={{ minRows: 3, maxRows: 6 }}
                onChange={e => { const typed = e.target.value; setHighlightsText(h => ({ ...h, [lang]: typed })); set({ [highlightsKey]: typed.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 6) } as Partial<CampaignFields>); }}
                placeholder={lang === 'fr' ? '8 personnes maximum\n2 cours en direct par semaine\nExamens blancs corrigés' : '8 people at most\n2 live classes a week\nCorrected mock exams'} /></div>
            <div className="og-two">
              <div className="og-field"><label>Badge <em>optional</em></label>
                <Input value={text('badge')} onChange={setText('badge')} maxLength={30} placeholder={lang === 'fr' ? 'ex. -20 %, Nouveau, Dernières places' : 'e.g. -20 %, New, Last seats'} />
                <small>Left empty, the saving is shown when there is a campaign price.</small></div>
              <div className="og-field"><label>Button label <em>optional</em></label>
                <Input value={text('cta')} onChange={setText('cta')} maxLength={40} placeholder={lang === 'fr' ? 'Réserver ma place' : 'Reserve my seat'} /></div>
            </div>
          </section>

          {/* 3 ── Class */}
          <section className="og-section">
            <div className="og-section-title"><span className="og-step-n">3</span>{hasClass ? 'The class' : 'Who it is for'}</div>
            <div className="og-two">
              <div className="og-field"><label>For whom</label>
                <Select value={f.audience} onChange={v => set({ audience: v })} options={Object.entries(AUDIENCE_LABEL).map(([value, label]) => ({ value, label }))} />
                <small>Learners of the matching free courses see this campaign first.</small></div>
              <div className="og-field"><label>Level <em>optional</em></label>
                <Input value={f.level || ''} onChange={e => set({ level: e.target.value || null })} maxLength={20} placeholder="e.g. A2, B1 → B2, NCLC 7" /></div>
            </div>
            {hasClass && <>
              <div className="og-two">
                <div className="og-field"><label>{f.kind === 'event' ? 'Date' : 'First class'}</label>
                  <DatePicker value={f.class_starts_on ? dayjs(f.class_starts_on) : null} onChange={d => set({ class_starts_on: d ? d.format('YYYY-MM-DD') : null })} format="DD/MM/YYYY" style={{ width: '100%' }} /></div>
                <div className="og-field"><label>Last class <em>optional</em></label>
                  <DatePicker value={f.class_ends_on ? dayjs(f.class_ends_on) : null} onChange={d => set({ class_ends_on: d ? d.format('YYYY-MM-DD') : null })} format="DD/MM/YYYY" style={{ width: '100%' }}
                    disabledDate={d => !!f.class_starts_on && d.isBefore(dayjs(f.class_starts_on), 'day')} /></div>
              </div>
              <div className="og-two">
                <div className="og-field"><label>Timetable <em>{lang === 'fr' ? 'français' : 'English'}</em></label>
                  <Input value={text('schedule')} onChange={setText('schedule')} maxLength={160} placeholder={lang === 'fr' ? 'ex. Lundi et mercredi, 19 h (heure de Montréal)' : 'e.g. Mon & Wed, 7 pm (Montréal time)'} /></div>
                <div className="og-field"><label>Teacher <em>optional</em></label>
                  <Input value={f.teacher_name || ''} onChange={e => set({ teacher_name: e.target.value || null })} maxLength={120} /></div>
              </div>
            </>}
            <div className="og-two">
              <div className="og-field"><label>Seats in the group <em>empty = no limit</em></label>
                <InputNumber min={1} max={100000} value={f.seat_limit} onChange={v => set({ seat_limit: v ?? null })} style={{ width: '100%' }} addonAfter="seats" />
                <small>When they are all taken, the next people join a waiting list.</small></div>
              <div className="og-field"><label>Seats taken outside the site</label>
                <InputNumber min={0} max={f.seat_limit || 0} precision={0} value={f.seat_limit ? f.seats_offline : null} disabled={!f.seat_limit}
                  onChange={v => set({ seats_offline: v ?? 0 })} style={{ width: '100%' }} addonAfter="seats" placeholder={f.seat_limit ? '0' : 'No limit'} />
                <small>{f.seat_limit
                  ? `By phone, WhatsApp or in person: they count as taken. ${online ? `${online} registered on the site` : 'Nobody registered on the site yet'} · ${seats.full ? 'group full' : `${seats.left} left`}.`
                  : 'Give the group a number of seats first.'}</small></div>
            </div>
            <div className="og-field"><label>Seats left on the site</label>
              <Segmented block value={display} disabled={!f.seat_limit} onChange={v => set({ seats_display: v as 'auto' | 'never' })}
                options={(['auto', 'never'] as const).map(k => ({ value: k, label: SEATS_DISPLAY_LABEL[k].name }))} />
              <small>{SEATS_DISPLAY_LABEL[display].text}{f.seat_limit ? <> Visitors see now: <strong>{seen}</strong>.</> : null}</small></div>
          </section>

          {/* 4 ── Price */}
          <section className="og-section">
            <div className="og-section-title"><span className="og-step-n">4</span>Price <em className="mk-optional">optional</em></div>
            <div className="mk-three">
              <div className="og-field"><label>Regular price</label>
                <InputNumber min={0} max={99999999} value={f.price_regular} onChange={v => set({ price_regular: v ?? null })} style={{ width: '100%' }} placeholder="e.g. 480" />
                <small>0 shows “Free”.</small></div>
              <div className="og-field"><label>Campaign price</label>
                <InputNumber min={0} max={99999999} value={f.price_promo} onChange={v => set({ price_promo: v ?? null })} style={{ width: '100%' }} placeholder="e.g. 384"
                  status={f.price_regular !== null && f.price_promo !== null && f.price_promo > f.price_regular ? 'error' : undefined} />
                <small>The regular price is then crossed out.</small></div>
              <div className="og-field"><label>Currency</label>
                <Select value={f.currency} onChange={v => set({ currency: v })} options={['CAD', 'USD', 'EUR'].map(c => ({ value: c, label: c }))} /></div>
            </div>
            <div className="og-field"><label>What the price covers <em>{lang === 'fr' ? 'français' : 'English'}, optional</em></label>
              <Input value={text('price_note')} onChange={setText('price_note')} maxLength={120} placeholder={lang === 'fr' ? 'ex. pour les 8 semaines, par mois' : 'e.g. for the 8 weeks, per month'} /></div>
          </section>

          {/* 5 ── On the site */}
          <section className="og-section">
            <div className="og-section-title"><span className="og-step-n">5</span>When and where on the site</div>
            <div className="og-two">
              <div className="og-field"><label>Show from</label>
                <DatePicker showTime={{ format: 'HH:mm' }} value={dayjs(f.starts_at)} onChange={d => set({ starts_at: (d || dayjs()).toISOString() })} format="DD/MM/YYYY HH:mm" allowClear={false} style={{ width: '100%' }} /></div>
              <div className="og-field"><label>Until <em>also the last moment to register</em></label>
                <DatePicker showTime={{ format: 'HH:mm' }} value={f.ends_at ? dayjs(f.ends_at) : null} onChange={d => set({ ends_at: d ? d.toISOString() : null })} format="DD/MM/YYYY HH:mm" style={{ width: '100%' }}
                  status={f.ends_at && f.ends_at <= f.starts_at ? 'error' : undefined}
                  presets={[
                    { label: 'In 1 week', value: dayjs().add(7, 'day').endOf('day') }, { label: 'In 2 weeks', value: dayjs().add(14, 'day').endOf('day') },
                    { label: 'In 1 month', value: dayjs().add(1, 'month').endOf('day') }, { label: 'End of January', value: dayjs().month(0).endOf('month').add(dayjs().month() > 0 ? 1 : 0, 'year') },
                  ]} />
                <small>Your own time ({Intl.DateTimeFormat().resolvedOptions().timeZone}). Empty = shown until you pause it.</small></div>
            </div>
            <div className="og-field"><label>Countdown to the end date</label>
              <span className="mk-switch"><Switch checked={f.show_countdown} onChange={v => set({ show_countdown: v })} disabled={!f.ends_at} /><span>{f.show_countdown && f.ends_at ? '“Registration closes in 5 d 04 h 47 min”' : 'Hidden'}</span></span></div>
            <div className="og-field"><label>Where it appears</label>
              <div className="og-kinds mk-kinds">
                {PLACES.map(p => (
                  <button key={p.key} type="button" className={`og-kind${f[p.key] ? ' is-on' : ''}`} onClick={() => set({ [p.key]: !f[p.key] } as Partial<CampaignFields>)} aria-pressed={f[p.key]}>
                    <span className="og-kind-text"><strong>{p.name}</strong><em>{p.text}</em></span>
                    <span className="og-kind-tick"><CheckOutlined /></span>
                  </button>
                ))}
              </div>
              <small>The offers page always lists every live campaign. When several campaigns ask for the bar or the flash, the one with the highest priority wins.</small></div>
            <div className="og-field"><label>Priority</label>
              <Segmented value={f.priority >= 20 ? 20 : f.priority >= 10 ? 10 : 0} onChange={v => set({ priority: Number(v) })} options={[{ value: 0, label: 'Normal' }, { value: 10, label: 'Featured' }, { value: 20, label: 'Top of the page' }]} /></div>
          </section>

          {/* 6 ── Look */}
          <section className="og-section">
            <div className="og-section-title"><span className="og-step-n">6</span>Look</div>
            <div className="og-field"><label>Colour</label>
              <div className="mk-themes">
                {(Object.keys(THEMES) as ThemeId[]).map(t => (
                  <button key={t} type="button" className={`mk-theme pm-t-${t}${f.theme === t ? ' is-on' : ''}`} onClick={() => set({ theme: t })} aria-pressed={f.theme === t}>
                    <i aria-hidden />{THEMES[t].name}
                  </button>
                ))}
              </div></div>
            <div className="og-field"><label>Picture</label>
              <div className="mk-picture-row">
                <span className={`mk-thumb is-md pm-t-${f.theme}`} aria-hidden>{f.image_key && <img src={promoImage(f.image_key)} alt="" />}</span>
                <Button icon={<PictureOutlined />} onClick={() => setPictures(p => !p)}>{pictures ? 'Hide the pictures' : f.image_key ? 'Change the picture' : 'Choose a picture'}</Button>
                {f.image_key && <Button type="text" onClick={() => set({ image_key: null })}>No picture</Button>}
              </div>
              <div className="mk-picture-ai">
                <AiPictureMaker
                  prompt={imagePrompt}
                  theme={f.theme}
                  title={f.title_en || f.title_fr}
                  onPicture={key => { set({ image_key: key }); setPictures(false); }}
                />
                {isAiImage(f.image_key) && <small>This picture was made by the AI for this campaign.</small>}
              </div>
              {pictures && (
                <div className="mk-pictures">
                  {PICTURES.map(g => (
                    <div key={g.group}>
                      <p>{g.group}</p>
                      <div>
                        {g.keys.map(k => (
                          <button key={k} type="button" className={f.image_key === k ? 'is-on' : ''} onClick={() => { set({ image_key: k }); setPictures(false); }} aria-label={k} aria-pressed={f.image_key === k}>
                            <img src={promoImage(k)} alt="" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <small>From the site’s own photo library, so every campaign matches the rest of the site. The colour covers the picture like a veil.</small></div>
          </section>

          {/* 7 ── Button */}
          <section className="og-section">
            <div className="og-section-title"><span className="og-step-n">7</span>What the button does</div>
            <Segmented value={f.registration_mode} onChange={v => set({ registration_mode: v as CampaignFields['registration_mode'] })} options={[
              { value: 'form', label: <span><FormOutlined /> Registration form</span> },
              { value: 'link', label: <span><LinkOutlined /> Opens a link</span> },
              { value: 'none', label: <span><StopOutlined /> No button</span> },
            ]} />
            {f.registration_mode === 'form' && <small className="og-muted">Visitors leave their name, email, phone, country and level. You find them in this campaign’s “Registrations”, and they receive a confirmation email.</small>}
            {f.registration_mode === 'link' && (
              <div className="og-field"><label>Link</label>
                <Input value={f.cta_url || ''} onChange={e => set({ cta_url: e.target.value.trim() || null })} maxLength={500} placeholder="https://… or /learn/ for a page of this site"
                  status={f.cta_url && !/^(https:\/\/|\/)\S+$/i.test(f.cta_url) ? 'error' : undefined} /></div>
            )}
            {f.registration_mode === 'none' && <small className="og-muted">The campaign only informs: nobody can register.</small>}
          </section>

          {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
        </div>

        {/* ── Live preview ── */}
        <aside className="mk-preview">
          <div className="mk-preview-head">
            <strong>As visitors will see it</strong>
            <Segmented size="small" value={lang} onChange={v => setLang(v as Lang)} options={[{ value: 'en', label: 'EN' }, { value: 'fr', label: 'FR' }]} />
          </div>
          <PromoCard promo={preview} lang={lang} onOpen={() => {}} inert />
          <p className="mk-preview-note">The card of the home page and of the offers page. The bar, the flash and the flyers use the same words, colour and picture.</p>
        </aside>
      </div>
    </Drawer>
  );
};

export default CampaignEditor;
